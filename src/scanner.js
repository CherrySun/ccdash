/**
 * scanner.js - Claude Code Session Scanner
 *
 * Scans ~/.claude/ directory to discover and parse session data.
 * Read-only: never modifies any Claude Code files.
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { homedir } from 'node:os';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

const CLAUDE_DIR = join(homedir(), '.claude');
const PROJECTS_DIR = join(CLAUDE_DIR, 'projects');
const SESSIONS_DIR = join(CLAUDE_DIR, 'sessions');

/**
 * Try to intelligently decode a project hash by checking filesystem.
 * Tries progressively joining segments to find the actual path.
 */
export async function resolveProjectPath(hash) {
  if (!hash.startsWith('-')) return hash;

  const parts = hash.slice(1).split('-');
  let currentPath = '/';
  let resolvedParts = [];
  let buffer = '';

  for (let i = 0; i < parts.length; i++) {
    buffer = buffer ? `${buffer}-${parts[i]}` : parts[i];
    const testPath = join(currentPath, ...resolvedParts, buffer);

    try {
      await stat(testPath);
      resolvedParts.push(buffer);
      buffer = '';
    } catch {
      // Path doesn't exist yet, keep buffering
    }
  }

  if (buffer) {
    resolvedParts.push(buffer);
  }

  return '/' + resolvedParts.join('/');
}

/**
 * Read a JSONL file line by line, yielding parsed objects.
 */
async function* readJsonlFile(filePath) {
  const rl = createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      yield JSON.parse(trimmed);
    } catch {
      // Skip malformed lines
    }
  }
}

/**
 * Parse a session JSONL file and extract structured info.
 */
export async function parseSession(filePath, sessionId) {
  const session = {
    id: sessionId,
    filePath,
    startTime: null,
    lastActiveTime: null,
    model: null,
    models: new Set(),
    userMessages: 0,
    assistantMessages: 0,
    totalTurns: 0,
    tools: new Set(),
    toolUseCounts: {},
    cwd: null,
    version: null,
    gitBranch: null,
    entrypoint: null,
    permissionMode: null,
    lastPrompt: null,
    // Token usage
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCacheReadTokens: 0,
    totalCacheCreationTokens: 0,
    // Conversation content (summary)
    firstUserMessage: null,
    messages: [],
    // System info
    turnDurations: [],
  };

  for await (const obj of readJsonlFile(filePath)) {
    const type = obj.type;

    switch (type) {
      case 'user': {
        session.userMessages++;
        session.totalTurns++;
        const ts = obj.timestamp;
        if (ts) {
          const time = new Date(ts).getTime();
          if (!session.startTime || time < session.startTime) {
            session.startTime = time;
          }
          if (!session.lastActiveTime || time > session.lastActiveTime) {
            session.lastActiveTime = time;
          }
        }
        if (obj.cwd && !session.cwd) session.cwd = obj.cwd;
        if (obj.version) session.version = obj.version;
        if (obj.gitBranch) session.gitBranch = obj.gitBranch;
        if (obj.entrypoint) session.entrypoint = obj.entrypoint;

        // Extract user message text
        const content = obj.message?.content;
        if (typeof content === 'string') {
          if (!session.firstUserMessage) session.firstUserMessage = content.slice(0, 200);
          session.messages.push({
            role: 'user',
            content: content,
            timestamp: ts,
            uuid: obj.uuid,
          });
        }
        break;
      }

      case 'assistant': {
        session.assistantMessages++;
        const ts = obj.timestamp;
        if (ts) {
          const time = new Date(ts).getTime();
          if (!session.lastActiveTime || time > session.lastActiveTime) {
            session.lastActiveTime = time;
          }
        }

        const msg = obj.message || {};
        const model = msg.model;
        if (model && model !== '<synthetic>') {
          session.models.add(model);
          session.model = model; // last seen model
        }

        // Extract tool usage
        const content = msg.content || [];
        const textParts = [];
        const toolUses = [];

        for (const block of content) {
          if (block.type === 'tool_use') {
            const toolName = block.name;
            session.tools.add(toolName);
            session.toolUseCounts[toolName] = (session.toolUseCounts[toolName] || 0) + 1;
            toolUses.push({ name: toolName, id: block.id });
          } else if (block.type === 'text' && block.text) {
            textParts.push(block.text);
          }
        }

        // Token usage
        const usage = msg.usage;
        if (usage) {
          session.totalInputTokens += usage.input_tokens || 0;
          session.totalOutputTokens += usage.output_tokens || 0;
          session.totalCacheReadTokens += usage.cache_read_input_tokens || 0;
          session.totalCacheCreationTokens += usage.cache_creation_input_tokens || 0;
        }

        // Store message for conversation view
        if (textParts.length > 0 || toolUses.length > 0) {
          session.messages.push({
            role: 'assistant',
            content: textParts.join('\n'),
            tools: toolUses,
            model: model,
            timestamp: ts,
            uuid: obj.uuid,
            usage: usage ? {
              input: usage.input_tokens || 0,
              output: usage.output_tokens || 0,
              cacheRead: usage.cache_read_input_tokens || 0,
              cacheCreation: usage.cache_creation_input_tokens || 0,
            } : null,
          });
        }
        break;
      }

      case 'permission-mode':
        if (obj.permissionMode) session.permissionMode = obj.permissionMode;
        break;

      case 'last-prompt':
        if (obj.lastPrompt) session.lastPrompt = obj.lastPrompt;
        break;

      case 'system':
        if (obj.subtype === 'turn_duration' && obj.durationMs) {
          session.turnDurations.push(obj.durationMs);
        }
        break;
    }
  }

  // Convert Sets to arrays for JSON serialization
  session.tools = Array.from(session.tools);
  session.models = Array.from(session.models);

  // Determine session status
  session.status = determineStatus(session);

  return session;
}

/**
 * Determine session status based on available data.
 */
function determineStatus(session) {
  if (!session.lastActiveTime) return 'unknown';

  const now = Date.now();
  const elapsed = now - session.lastActiveTime;

  // If last active within 5 minutes, consider active
  if (elapsed < 5 * 60 * 1000) return 'active';
  // If last active within 1 hour, consider recent
  if (elapsed < 60 * 60 * 1000) return 'recent';
  // Otherwise completed
  return 'completed';
}

/**
 * Get currently running Claude Code processes and their session IDs.
 */
export async function getActiveProcesses() {
  const active = [];

  try {
    const files = await readdir(SESSIONS_DIR);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      try {
        const content = await readFile(join(SESSIONS_DIR, file), 'utf-8');
        const data = JSON.parse(content);
        const pid = parseInt(basename(file, '.json'));

        // Check if process is still running
        let isRunning = false;
        try {
          process.kill(pid, 0); // Signal 0 = just check existence
          isRunning = true;
        } catch {
          isRunning = false;
        }

        active.push({
          pid,
          sessionId: data.sessionId,
          cwd: data.cwd,
          startedAt: data.startedAt,
          kind: data.kind,
          entrypoint: data.entrypoint,
          isRunning,
        });
      } catch {
        // Skip invalid files
      }
    }
  } catch {
    // sessions directory might not exist
  }

  return active;
}

/**
 * Parse multiple sessions concurrently with a concurrency limit.
 */
async function parseSessionsConcurrent(entries, projectDir, concurrency = 8) {
  const sessions = [];
  let i = 0;

  async function worker() {
    while (i < entries.length) {
      const entry = entries[i++];
      const sessionId = basename(entry, '.jsonl');
      const sessionFile = join(projectDir, entry);
      try {
        const session = await parseSession(sessionFile, sessionId);
        sessions.push(session);
      } catch (err) {
        console.error(`Failed to parse session ${sessionId}: ${err.message}`);
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, entries.length) }, () => worker());
  await Promise.all(workers);
  return sessions;
}

/**
 * Scan all projects and sessions.
 */
export async function scanAllSessions() {
  const projects = [];

  try {
    const projectDirs = await readdir(PROJECTS_DIR);

    for (const dirName of projectDirs) {
      if (dirName.startsWith('.')) continue;

      const projectDir = join(PROJECTS_DIR, dirName);
      const dirStat = await stat(projectDir);
      if (!dirStat.isDirectory()) continue;

      const projectPath = await resolveProjectPath(dirName);

      const entries = await readdir(projectDir);
      const jsonlFiles = entries.filter(e => e.endsWith('.jsonl'));

      const sessions = await parseSessionsConcurrent(jsonlFiles, projectDir);

      // Attach project info
      for (const session of sessions) {
        session.projectHash = dirName;
        session.projectPath = projectPath;
      }

      // Sort sessions by last active time (newest first)
      sessions.sort((a, b) => (b.lastActiveTime || 0) - (a.lastActiveTime || 0));

      projects.push({
        hash: dirName,
        path: projectPath,
        sessions,
        totalSessions: sessions.length,
      });
    }
  } catch (err) {
    console.error(`Failed to scan projects: ${err.message}`);
  }

  // Sort projects by most recent session activity
  projects.sort((a, b) => {
    const aTime = a.sessions[0]?.lastActiveTime || 0;
    const bTime = b.sessions[0]?.lastActiveTime || 0;
    return bTime - aTime;
  });

  return projects;
}

// Direct execution for testing
if (process.argv[1] && process.argv[1].endsWith('scanner.js') && process.argv[2] === '--test') {
  console.log('🔍 Scanning Claude Code sessions...\n');

  const projects = await scanAllSessions();
  const activeProcesses = await getActiveProcesses();

  console.log(`Found ${projects.length} projects:\n`);

  for (const project of projects) {
    console.log(`📁 ${project.path}`);
    console.log(`   Hash: ${project.hash}`);
    console.log(`   Sessions: ${project.totalSessions}`);

    for (const session of project.sessions) {
      const start = session.startTime ? new Date(session.startTime).toLocaleString() : 'unknown';
      const last = session.lastActiveTime ? new Date(session.lastActiveTime).toLocaleString() : 'unknown';
      console.log(`\n   📝 Session: ${session.id}`);
      console.log(`      Status: ${session.status}`);
      console.log(`      Started: ${start}`);
      console.log(`      Last active: ${last}`);
      console.log(`      Model: ${session.model || 'unknown'}`);
      console.log(`      Turns: ${session.totalTurns} (user: ${session.userMessages}, assistant: ${session.assistantMessages})`);
      console.log(`      Tools: ${session.tools.join(', ') || 'none'}`);
      console.log(`      First message: ${session.firstUserMessage || 'N/A'}`);
      console.log(`      Tokens: in=${session.totalInputTokens.toLocaleString()}, out=${session.totalOutputTokens.toLocaleString()}, cache_read=${session.totalCacheReadTokens.toLocaleString()}`);
      console.log(`      Version: ${session.version || 'unknown'}`);
    }
    console.log('');
  }

  if (activeProcesses.length > 0) {
    console.log('\n🟢 Active processes:');
    for (const proc of activeProcesses) {
      console.log(`   PID: ${proc.pid}, Session: ${proc.sessionId}, Running: ${proc.isRunning}`);
      console.log(`   CWD: ${proc.cwd}`);
    }
  } else {
    console.log('\n⚪ No active processes found in sessions directory');
  }
}
