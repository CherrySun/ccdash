#!/usr/bin/env node

/**
 * cli.js - ccdash CLI entry point
 *
 * Commands:
 *   ccdash                  Open web dashboard (default)
 *   ccdash cli              CLI session list
 *   ccdash show <id>        Show session details
 *   ccdash resume <id>      Resume a session in terminal
 *   ccdash cost [period]    Show cost summary (today/week/month/all)
 *   ccdash search <keyword> Search sessions
 *   ccdash active           Show active Claude processes
 *   ccdash serve [port]     Start web dashboard on custom port
 *   ccdash upgrade          Upgrade ccdash to the latest version
 *   ccdash version          Show current version
 */

import { scanAllSessions, getActiveProcesses } from './scanner.js';
import { calculateSessionCost, aggregateCosts, getCostsByPeriod, formatCost, formatTokens } from './pricing.js';
import { loadNotes, getSessionNotes, getClaudeAlias } from './notes.js';
import { startServer } from './server.js';
import { execSync, execFileSync, spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// ─── ANSI Colors (no chalk needed) ───
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgRed: '\x1b[41m',
};

function statusBadge(status) {
  switch (status) {
    case 'active': return `${c.bgGreen}${c.bold} ACTIVE ${c.reset}`;
    case 'recent': return `${c.bgYellow}${c.bold} RECENT ${c.reset}`;
    case 'completed': return `${c.gray} DONE ${c.reset}`;
    default: return `${c.gray} ??? ${c.reset}`;
  }
}

function timeAgo(timestamp) {
  if (!timestamp) return 'unknown';
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function truncate(str, len) {
  if (!str) return '';
  str = str.replace(/\n/g, ' ').trim();
  return str.length > len ? str.slice(0, len - 1) + '…' : str;
}

// ─── Commands ───

async function cmdList() {
  console.log(`\n${c.cyan}${c.bold}ccdash${c.reset} ${c.dim}— Claude Code Session Manager${c.reset}\n`);

  const projects = await scanAllSessions();
  const notes = await loadNotes();
  let totalSessions = 0;

  for (const project of projects) {
    const shortPath = project.path.replace(process.env.HOME, '~');
    console.log(`${c.blue}${c.bold}📁 ${shortPath}${c.reset}`);

    for (const session of project.sessions) {
      totalSessions++;
      const sc = calculateSessionCost(session);
      const sessionNote = notes.sessions?.[session.id];
      const tags = sessionNote?.tags?.length ? ` ${c.magenta}[${sessionNote.tags.join(', ')}]${c.reset}` : '';
      const note = sessionNote?.note ? ` ${c.dim}— ${truncate(sessionNote.note, 40)}${c.reset}` : '';

      console.log(
        `   ${statusBadge(session.status)} ` +
        `${c.dim}${session.id.slice(0, 8)}${c.reset} ` +
        `${c.yellow}${timeAgo(session.lastActiveTime)}${c.reset} ` +
        `${c.dim}│${c.reset} ` +
        `${c.white}${truncate(session.firstUserMessage || session.lastPrompt || '(empty)', 50)}${c.reset}` +
        tags + note
      );
      console.log(
        `            ` +
        `${c.dim}turns:${c.reset}${session.totalTurns} ` +
        `${c.dim}tokens:${c.reset}${formatTokens(session.totalInputTokens + session.totalOutputTokens)} ` +
        `${c.dim}cost:${c.reset}${c.green}${formatCost(sc.cost.total)}${c.reset} ` +
        `${c.dim}model:${c.reset}${session.model || '?'} ` +
        (session.tools.length ? `${c.dim}tools:${c.reset}${session.tools.join(',')}` : '')
      );
    }
    console.log('');
  }

  console.log(`${c.dim}Total: ${totalSessions} sessions across ${projects.length} projects${c.reset}\n`);
}

async function cmdShow(sessionId) {
  if (!sessionId) {
    console.error(`${c.red}Usage: ccdash show <session-id>${c.reset}`);
    process.exit(1);
  }

  const projects = await scanAllSessions();
  let found = null;

  for (const project of projects) {
    for (const session of project.sessions) {
      if (session.id === sessionId || session.id.startsWith(sessionId)) {
        found = session;
        break;
      }
    }
    if (found) break;
  }

  if (!found) {
    console.error(`${c.red}Session not found: ${sessionId}${c.reset}`);
    process.exit(1);
  }

  const sc = calculateSessionCost(found);
  const note = await getSessionNotes(found.id);

  console.log(`\n${c.cyan}${c.bold}Session Details${c.reset}\n`);
  console.log(`${c.bold}ID:${c.reset}         ${found.id}`);
  console.log(`${c.bold}Status:${c.reset}     ${statusBadge(found.status)}`);
  console.log(`${c.bold}Project:${c.reset}    ${found.projectPath || found.cwd}`);
  console.log(`${c.bold}Started:${c.reset}    ${found.startTime ? new Date(found.startTime).toLocaleString() : 'unknown'}`);
  console.log(`${c.bold}Last Active:${c.reset} ${found.lastActiveTime ? new Date(found.lastActiveTime).toLocaleString() : 'unknown'}`);
  console.log(`${c.bold}Model:${c.reset}      ${found.model || 'unknown'}`);
  console.log(`${c.bold}Version:${c.reset}    ${found.version || 'unknown'}`);
  console.log(`${c.bold}Turns:${c.reset}      ${found.totalTurns} (you: ${found.userMessages}, claude: ${found.assistantMessages})`);
  if (found.toolResults) console.log(`${c.bold}Tool Calls:${c.reset} ${found.toolResults}`);
  console.log(`${c.bold}Tools:${c.reset}      ${found.tools.join(', ') || 'none'}`);

  if (note.note) console.log(`${c.bold}Note:${c.reset}       ${note.note}`);
  if (note.tags.length) console.log(`${c.bold}Tags:${c.reset}       ${note.tags.join(', ')}`);

  console.log(`\n${c.cyan}${c.bold}Token Usage & Cost${c.reset}`);
  console.log(`  Input:           ${formatTokens(sc.tokens.input).padStart(10)} → ${c.green}${formatCost(sc.cost.input)}${c.reset}`);
  console.log(`  Output:          ${formatTokens(sc.tokens.output).padStart(10)} → ${c.green}${formatCost(sc.cost.output)}${c.reset}`);
  console.log(`  Cache Read:      ${formatTokens(sc.tokens.cacheRead).padStart(10)} → ${c.green}${formatCost(sc.cost.cacheRead)}${c.reset}`);
  console.log(`  Cache Creation:  ${formatTokens(sc.tokens.cacheCreation).padStart(10)} → ${c.green}${formatCost(sc.cost.cacheCreation)}${c.reset}`);
  console.log(`  ${c.bold}Total Cost:${c.reset}                    ${c.green}${c.bold}${formatCost(sc.cost.total)}${c.reset}`);

  // Tool usage breakdown
  if (Object.keys(found.toolUseCounts).length > 0) {
    console.log(`\n${c.cyan}${c.bold}Tool Usage Breakdown${c.reset}`);
    const sorted = Object.entries(found.toolUseCounts).sort((a, b) => b[1] - a[1]);
    for (const [tool, count] of sorted) {
      const bar = '█'.repeat(Math.min(count, 40));
      console.log(`  ${tool.padEnd(20)} ${c.blue}${bar}${c.reset} ${count}`);
    }
  }

  // Conversation preview
  console.log(`\n${c.cyan}${c.bold}Conversation (last 5 turns)${c.reset}`);
  const recentMsgs = found.messages.slice(-10);
  for (const msg of recentMsgs) {
    const role = msg.role === 'user' ? `${c.green}You` : `${c.blue}Claude`;
    const content = truncate(msg.content, 120);
    console.log(`  ${role}${c.reset}: ${content}`);
    if (msg.tools?.length) {
      console.log(`    ${c.dim}→ tools: ${msg.tools.map(t => t.name).join(', ')}${c.reset}`);
    }
  }

  console.log(`\n${c.dim}Resume: ${await getClaudeAlias()} --resume ${found.id}${c.reset}\n`);
}

async function cmdResume(sessionId) {
  if (!sessionId) {
    console.error(`${c.red}Usage: ccdash resume <session-id>${c.reset}`);
    process.exit(1);
  }

  // Find the session to get its project path
  const projects = await scanAllSessions();
  let found = null;

  for (const project of projects) {
    for (const session of project.sessions) {
      if (session.id === sessionId || session.id.startsWith(sessionId)) {
        found = session;
        break;
      }
    }
    if (found) break;
  }

  if (!found) {
    console.error(`${c.red}Session not found: ${sessionId}${c.reset}`);
    process.exit(1);
  }

  const cwd = found.cwd || found.projectPath;
  const claudeCmd = await getClaudeAlias();
  console.log(`${c.cyan}Resuming session ${found.id.slice(0, 8)}... in ${cwd}${c.reset}`);

  const child = spawn(claudeCmd, ['--resume', found.id], {
    cwd,
    stdio: 'inherit',
    shell: true,
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

async function cmdCost(period = 'all') {
  console.log(`\n${c.cyan}${c.bold}ccdash${c.reset} ${c.dim}— Cost Report (${period})${c.reset}\n`);

  const projects = await scanAllSessions();
  const allSessions = projects.flatMap(p => p.sessions);
  const stats = getCostsByPeriod(allSessions, period);

  // Summary
  console.log(`${c.bold}Total Cost:${c.reset}   ${c.green}${c.bold}${formatCost(stats.totals.totalCost)}${c.reset}`);
  console.log(`${c.bold}Input Cost:${c.reset}   ${formatCost(stats.totals.inputCost)} (${formatTokens(stats.totals.inputTokens)} tokens)`);
  console.log(`${c.bold}Output Cost:${c.reset}  ${formatCost(stats.totals.outputCost)} (${formatTokens(stats.totals.outputTokens)} tokens)`);
  console.log(`${c.bold}Cache Read:${c.reset}   ${formatCost(stats.totals.cacheReadCost)} (${formatTokens(stats.totals.cacheReadTokens)} tokens)`);
  console.log(`${c.bold}Cache Create:${c.reset} ${formatCost(stats.totals.cacheCreationCost)} (${formatTokens(stats.totals.cacheCreationTokens)} tokens)`);

  // Per project
  console.log(`\n${c.cyan}${c.bold}By Project${c.reset}`);
  const projectEntries = Object.entries(stats.perProject).sort((a, b) => b[1].cost - a[1].cost);
  for (const [project, data] of projectEntries) {
    const shortPath = project.replace(process.env.HOME, '~');
    const pct = stats.totals.totalCost > 0 ? ((data.cost / stats.totals.totalCost) * 100).toFixed(1) : '0';
    console.log(`  ${c.blue}${shortPath}${c.reset}`);
    console.log(`    ${c.green}${formatCost(data.cost)}${c.reset} (${pct}%) — ${data.sessions} sessions, ${formatTokens(data.tokens)} tokens`);
  }

  // Per day
  const dayEntries = Object.entries(stats.perDay).sort((a, b) => b[0].localeCompare(a[0]));
  if (dayEntries.length > 0) {
    console.log(`\n${c.cyan}${c.bold}By Day${c.reset}`);
    for (const [day, data] of dayEntries.slice(0, 14)) {
      const bar = '█'.repeat(Math.min(Math.ceil(data.cost * 10), 50));
      console.log(`  ${day}  ${c.blue}${bar}${c.reset} ${c.green}${formatCost(data.cost)}${c.reset}`);
    }
  }

  console.log('');
}

async function cmdSearch(keyword) {
  if (!keyword) {
    console.error(`${c.red}Usage: ccdash search <keyword>${c.reset}`);
    process.exit(1);
  }

  console.log(`\n${c.cyan}${c.bold}Searching for "${keyword}"...${c.reset}\n`);

  const projects = await scanAllSessions();
  const lowerKeyword = keyword.toLowerCase();
  let totalMatches = 0;

  for (const project of projects) {
    for (const session of project.sessions) {
      const matches = [];
      for (const msg of session.messages) {
        const content = typeof msg.content === 'string' ? msg.content : '';
        if (content.toLowerCase().includes(lowerKeyword)) {
          matches.push(msg);
        }
      }

      if (matches.length > 0) {
        totalMatches += matches.length;
        const shortPath = (session.projectPath || '').replace(process.env.HOME, '~');
        console.log(
          `${statusBadge(session.status)} ` +
          `${c.dim}${session.id.slice(0, 8)}${c.reset} ` +
          `${c.blue}${shortPath}${c.reset} ` +
          `(${matches.length} matches)`
        );

        for (const match of matches.slice(0, 3)) {
          const idx = match.content.toLowerCase().indexOf(lowerKeyword);
          const start = Math.max(0, idx - 30);
          const end = Math.min(match.content.length, idx + keyword.length + 30);
          const snippet = (start > 0 ? '...' : '') + match.content.slice(start, end) + (end < match.content.length ? '...' : '');
          const role = match.role === 'user' ? `${c.green}You` : `${c.blue}Claude`;
          console.log(`   ${role}${c.reset}: ${snippet.replace(/\n/g, ' ')}`);
        }
        console.log('');
      }
    }
  }

  if (totalMatches === 0) {
    console.log(`${c.dim}No matches found.${c.reset}\n`);
  } else {
    console.log(`${c.dim}Found ${totalMatches} matches.${c.reset}\n`);
  }
}

async function cmdActive() {
  console.log(`\n${c.cyan}${c.bold}Active Claude Code Sessions${c.reset}\n`);

  const processes = await getActiveProcesses();
  const running = processes.filter(p => p.isRunning);

  if (running.length === 0) {
    console.log(`${c.dim}No active Claude Code processes.${c.reset}\n`);
    return;
  }

  const projects = await scanAllSessions();

  for (const proc of running) {
    const shortPath = (proc.cwd || '').replace(process.env.HOME, '~');
    const uptime = proc.startedAt ? timeAgo(proc.startedAt) : 'unknown';

    console.log(`${c.bgGreen}${c.bold} RUNNING ${c.reset} PID: ${proc.pid}`);
    console.log(`  ${c.bold}Session:${c.reset}  ${proc.sessionId.slice(0, 8)}`);
    console.log(`  ${c.bold}Directory:${c.reset} ${shortPath}`);
    console.log(`  ${c.bold}Started:${c.reset}  ${uptime}`);

    // Find session details
    for (const project of projects) {
      for (const session of project.sessions) {
        if (session.id === proc.sessionId) {
          const sc = calculateSessionCost(session);
          console.log(`  ${c.bold}Tokens:${c.reset}   ${formatTokens(session.totalInputTokens + session.totalOutputTokens)}`);
          console.log(`  ${c.bold}Cost:${c.reset}     ${c.green}${formatCost(sc.cost.total)}${c.reset}`);
          console.log(`  ${c.bold}Turns:${c.reset}    ${session.totalTurns}`);
          if (session.tools.length > 0) {
            console.log(`  ${c.bold}Tools:${c.reset}    ${session.tools.join(', ')}`);
          }
          break;
        }
      }
    }
    console.log('');
  }
}

/**
 * Compare two semver strings. Returns:
 *   -1 if a < b, 0 if a === b, 1 if a > b
 */
function compareSemver(a, b) {
  const pa = a.replace(/^v/, '').split('.').map(Number);
  const pb = b.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

function getLocalVersion() {
  const require = createRequire(import.meta.url);
  const pkg = require('../package.json');
  return { version: pkg.version, name: pkg.name };
}

function isValidPkgName(name) {
  // npm package name: scoped (@scope/name) or unscoped, no shell chars
  return /^(@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(name);
}

async function cmdUpgrade() {
  const { version: currentVersion, name: pkgName } = getLocalVersion();

  console.log(`\n${c.cyan}${c.bold}ccdash${c.reset} ${c.dim}— Upgrade${c.reset}\n`);
  console.log(`${c.dim}Current version:${c.reset} ${c.bold}v${currentVersion}${c.reset}`);

  // Validate package name to prevent command injection
  if (!isValidPkgName(pkgName)) {
    console.error(`${c.red}✗ Invalid package name in package.json: "${pkgName}"${c.reset}\n`);
    process.exit(1);
  }

  // Check latest version on npm (using execFileSync to avoid shell injection)
  console.log(`${c.dim}Checking for updates...${c.reset}`);
  let latestVersion;
  try {
    latestVersion = execFileSync('npm', ['view', pkgName, 'version'], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    console.error(`${c.red}✗ Cannot reach npm registry. Please check your network connection.${c.reset}\n`);
    process.exit(1);
  }

  // Semver comparison: already up to date or local is newer (dev/prerelease)
  const cmp = compareSemver(currentVersion, latestVersion);
  if (cmp === 0) {
    console.log(`${c.green}✓ Already up to date! (v${currentVersion})${c.reset}\n`);
    return;
  }
  if (cmp > 0) {
    console.log(`${c.yellow}ℹ Local version (v${currentVersion}) is newer than npm (v${latestVersion}).${c.reset}`);
    console.log(`${c.dim}  You appear to be running a development or pre-release build. Skipping.${c.reset}\n`);
    return;
  }
  console.log(`${c.yellow}New version available:${c.reset} ${c.bold}v${latestVersion}${c.reset}\n`);

  // Detect how ccdash was installed
  const installArgs = ['install', '-g', `${pkgName}@latest`];
  try {
    const globalPrefix = execFileSync('npm', ['config', 'get', 'prefix'], { encoding: 'utf-8' }).trim();
    const __filename = fileURLToPath(import.meta.url);
    const cliDir = dirname(__filename);

    if (cliDir.includes(globalPrefix)) {
      // Installed globally via npm — use default installArgs
    } else if (cliDir.includes('_npx') || cliDir.includes('.npx') || process.env.npm_command === 'npx') {
      console.log(`${c.dim}Installed via npx — next run of ${c.bold}npx ${pkgName}${c.reset}${c.dim} will use v${latestVersion}.${c.reset}\n`);
      return;
    }
    // else: local/dev/linked install — fallthrough to global install
  } catch {
    // Cannot detect — fallthrough to global install
  }

  const installCmd = `npm install -g ${pkgName}@latest`;
  console.log(`${c.dim}Running:${c.reset} ${c.bold}${installCmd}${c.reset}\n`);
  try {
    execFileSync('npm', installArgs, { stdio: 'inherit' });
  } catch (err) {
    const errMsg = err.stderr?.toString() || err.message || '';
    if (errMsg.includes('EACCES') || errMsg.includes('permission denied') || errMsg.includes('Permission denied')) {
      console.error(`\n${c.red}✗ Permission denied. Try:${c.reset}`);
      console.log(`  ${c.bold}sudo npm install -g ${pkgName}@latest${c.reset}\n`);
    } else {
      console.error(`\n${c.red}✗ Upgrade failed.${c.reset}`);
      console.log(`${c.dim}Try manually: ${c.bold}${installCmd}${c.reset}\n`);
    }
    process.exit(1);
  }

  // Read actual installed version (not from registry)
  let newVersion = latestVersion;
  try {
    const listOutput = execFileSync('npm', ['list', '-g', pkgName, '--json', '--depth=0'], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const listData = JSON.parse(listOutput);
    newVersion = listData.dependencies?.[pkgName]?.version || latestVersion;
  } catch {
    // Fallback to registry version — acceptable
  }

  console.log(`\n${c.green}${c.bold}✓ Upgraded successfully!${c.reset}`);
  console.log(`${c.dim}  v${currentVersion} → v${newVersion}${c.reset}\n`);
}

function printHelp() {
  console.log(`
${c.cyan}${c.bold}ccdash${c.reset} — Claude Code Session Manager

${c.bold}USAGE${c.reset}
  ccdash                     Open web dashboard (default)
  ccdash cli                 CLI session list
  ccdash show <id>           Show session details & conversation
  ccdash resume <id>         Resume a session (opens claude CLI)
  ccdash cost [period]       Cost report (today/week/month/all)
  ccdash search <keyword>    Search session content
  ccdash active              Show active Claude processes
  ccdash serve [port]        Web dashboard on custom port (default: 3456)
  ccdash upgrade             Upgrade ccdash to the latest version
  ccdash version             Show current version
  ccdash help                Show this help

${c.dim}Session IDs can be abbreviated (first 8 chars).${c.reset}
`);
}

// ─── Main ───

const args = process.argv.slice(2);
const command = args[0] || '';

// Helper: open URL in default browser
function openBrowser(url) {
  const platform = process.platform;
  const cmd = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
  try { execSync(`${cmd} "${url}"`, { stdio: 'ignore' }); } catch {}
}

switch (command) {
  case '':
  case 'web':
  case 'dashboard': {
    const port = parseInt(args[1]) || 3456;
    try {
      const server = await startServer(port);
      const actualPort = server.address().port;
      openBrowser(`http://localhost:${actualPort}`);
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
    break;
  }
  case 'serve': {
    const port = parseInt(args[1]) || 3456;
    const hasExplicitPort = !!args[1];
    try {
      await startServer(port, { autoRetry: !hasExplicitPort });
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
    break;
  }
  case 'cli':
  case 'list':
  case 'ls':
    await cmdList();
    break;
  case 'show':
  case 'info':
    await cmdShow(args[1]);
    break;
  case 'resume':
    await cmdResume(args[1]);
    break;
  case 'cost':
  case 'costs':
  case 'usage':
    await cmdCost(args[1] || 'all');
    break;
  case 'search':
  case 'find':
    await cmdSearch(args.slice(1).join(' '));
    break;
  case 'active':
  case 'ps':
    await cmdActive();
    break;
  case 'upgrade':
  case 'update':
    await cmdUpgrade();
    break;
  case 'version':
  case '--version':
  case '-v': {
    const { version } = getLocalVersion();
    console.log(`ccdash v${version}`);
    break;
  }
  case 'help':
  case '--help':
  case '-h':
    printHelp();
    break;
  default:
    // If it looks like a session ID, show it
    if (command.match(/^[0-9a-f]{8}/)) {
      await cmdShow(command);
    } else {
      console.error(`${c.red}Unknown command: ${command}${c.reset}`);
      printHelp();
      process.exit(1);
    }
}
