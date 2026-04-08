/**
 * server.js - Web Dashboard Server
 *
 * Native Node.js HTTP server serving the dashboard HTML and API endpoints.
 * No Express, no frameworks - just http.createServer.
 */

import { createServer } from 'node:http';
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { promises as fsp } from 'node:fs';
import { tmpdir, platform, homedir } from 'node:os';
import { join, resolve, normalize } from 'node:path';
import { scanAllSessions, getActiveProcesses } from './scanner.js';
import { getCostsByPeriod, calculateSessionCost } from './pricing.js';
import { loadNotes, setSessionNote, addSessionTag, removeSessionTag, getSessionNotes, getAllTags, setSessionRename } from './notes.js';
import { getDashboardHTML } from './dashboard.js';

const IS_MACOS = platform() === 'darwin';
const CLAUDE_DIR = join(homedir(), '.claude');

/**
 * Run an AppleScript via temp file to avoid shell quote escaping issues.
 * macOS only.
 */
function runAppleScript(script) {
  if (!IS_MACOS) throw new Error('AppleScript is only available on macOS');
  const tmpFile = join(tmpdir(), `ccdash-${Date.now()}.scpt`);
  try {
    writeFileSync(tmpFile, script, 'utf-8');
    return execSync(`osascript "${tmpFile}"`, { encoding: 'utf-8' }).trim();
  } finally {
    try { unlinkSync(tmpFile); } catch {}
  }
}

/**
 * Validate that a path is within allowed directories.
 */
function isPathAllowed(targetPath, allowedRoots) {
  const resolved = resolve(normalize(targetPath));
  return allowedRoots.some(root => resolved.startsWith(resolve(root)));
}

/**
 * Get allowed browsing roots: project paths from scanned sessions + home dir.
 */
function getAllowedRoots(projects) {
  const roots = new Set();
  for (const p of projects) {
    if (p.path) roots.add(p.path);
  }
  roots.add(CLAUDE_DIR);
  return Array.from(roots);
}

// Cache for scanned data (refresh every 30 seconds)
let _cache = null;
let _cacheTime = 0;
const CACHE_TTL = 30_000;

async function getCachedData(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && _cache && (now - _cacheTime < CACHE_TTL)) {
    return _cache;
  }

  const projects = await scanAllSessions();
  const activeProcesses = await getActiveProcesses();
  const allSessions = projects.flatMap(p => p.sessions);
  const notes = await loadNotes();

  _cache = { projects, activeProcesses, allSessions, notes };
  _cacheTime = now;
  return _cache;
}

/**
 * Parse JSON body from request with size limit.
 */
function parseBody(req, maxSize = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > maxSize) {
        req.destroy();
        reject(new Error('Request body too large'));
        return;
      }
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Send JSON response.
 */
let _serverPort = 3456;

function sendJSON(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': `http://localhost:${_serverPort}`,
    'Vary': 'Origin',
  });
  res.end(JSON.stringify(data));
}

/**
 * Send HTML response.
 */
function sendHTML(res, html) {
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
  });
  res.end(html);
}

/**
 * Sanitize PID: must be a positive integer.
 */
function sanitizePid(pid) {
  const n = parseInt(pid, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/**
 * Verify a PID belongs to a Claude Code process.
 */
function isClaudeProcess(pid, activeProcesses) {
  return activeProcesses.some(p => p.pid === pid && p.isRunning);
}

/**
 * API route handler.
 */
async function handleAPI(req, res, pathname, serverPort) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Validate Origin for mutating requests
    const origin = req.headers.origin;
    if (req.method === 'POST' && origin && !origin.startsWith(`http://localhost:${serverPort}`)) {
      return sendJSON(res, { error: 'Forbidden: invalid origin' }, 403);
    }

    // GET /api/sessions - All sessions summary
    if (pathname === '/api/sessions' && req.method === 'GET') {
      const { projects, activeProcesses, notes } = await getCachedData();
      // Build a set of session IDs that have running processes
      const runningSessionIds = new Set(
        activeProcesses.filter(p => p.isRunning).map(p => p.sessionId)
      );
      const summary = projects.map(p => ({
        hash: p.hash,
        path: p.path,
        totalSessions: p.totalSessions,
        sessions: p.sessions.map(s => {
          const sessionNotes = notes.sessions?.[s.id] || { note: '', tags: [], rename: '' };
          const cost = calculateSessionCost(s);
          // Override status: if process is running, it's active regardless of timestamp
          const realStatus = runningSessionIds.has(s.id) ? 'active' : s.status;
          return {
            id: s.id,
            startTime: s.startTime,
            lastActiveTime: s.lastActiveTime,
            model: s.model,
            models: s.models,
            userMessages: s.userMessages,
            assistantMessages: s.assistantMessages,
            totalTurns: s.totalTurns,
            tools: s.tools,
            toolUseCounts: s.toolUseCounts,
            status: realStatus,
            firstUserMessage: s.firstUserMessage,
            lastPrompt: s.lastPrompt,
            projectPath: s.projectPath,
            totalInputTokens: s.totalInputTokens,
            totalOutputTokens: s.totalOutputTokens,
            totalCacheReadTokens: s.totalCacheReadTokens,
            totalCacheCreationTokens: s.totalCacheCreationTokens,
            cost: cost.cost,
            note: sessionNotes.note,
            tags: sessionNotes.tags,
            rename: sessionNotes.rename || '',
            version: s.version,
          };
        }),
      }));
      return sendJSON(res, summary);
    }

    // GET /api/session/:id - Full session with messages
    if (pathname.startsWith('/api/session/') && req.method === 'GET') {
      const sessionId = pathname.slice('/api/session/'.length);
      if (sessionId.length < 8) return sendJSON(res, { error: 'Session ID too short (min 8 chars)' }, 400);

      const { projects, activeProcesses } = await getCachedData();
      const runningSessionIds = new Set(
        activeProcesses.filter(p => p.isRunning).map(p => p.sessionId)
      );

      for (const project of projects) {
        for (const session of project.sessions) {
          if (session.id === sessionId || session.id.startsWith(sessionId)) {
            const cost = calculateSessionCost(session);
            const sessionNotes = await getSessionNotes(session.id);
            const realStatus = runningSessionIds.has(session.id) ? 'active' : session.status;
            return sendJSON(res, {
              ...session,
              status: realStatus,
              tools: session.tools,
              models: session.models,
              cost: cost.cost,
              note: sessionNotes.note,
              tags: sessionNotes.tags,
              rename: sessionNotes.rename || '',
            });
          }
        }
      }
      return sendJSON(res, { error: 'Session not found' }, 404);
    }

    // GET /api/active - Active processes
    if (pathname === '/api/active' && req.method === 'GET') {
      const { activeProcesses, projects } = await getCachedData();
      const enriched = activeProcesses.map(proc => {
        let sessionInfo = null;
        for (const project of projects) {
          for (const session of project.sessions) {
            if (session.id === proc.sessionId) {
              const cost = calculateSessionCost(session);
              sessionInfo = {
                totalTurns: session.totalTurns,
                totalTokens: session.totalInputTokens + session.totalOutputTokens,
                cost: cost.cost.total,
                tools: session.tools,
                model: session.model,
              };
              break;
            }
          }
          if (sessionInfo) break;
        }
        return { ...proc, session: sessionInfo };
      });
      return sendJSON(res, enriched);
    }

    // GET /api/costs?period=today|week|month|all
    if (pathname === '/api/costs' && req.method === 'GET') {
      const period = url.searchParams.get('period') || 'all';
      const { allSessions } = await getCachedData();
      const stats = getCostsByPeriod(allSessions, period);
      return sendJSON(res, stats);
    }

    // GET /api/search?q=keyword
    if (pathname === '/api/search' && req.method === 'GET') {
      const keyword = url.searchParams.get('q');
      if (!keyword) return sendJSON(res, { error: 'Missing q parameter' }, 400);

      const { projects, notes } = await getCachedData();
      const lowerKeyword = keyword.toLowerCase();
      const results = [];

      for (const project of projects) {
        for (const session of project.sessions) {
          const sessionNotes = notes.sessions?.[session.id] || { note: '', tags: [], rename: '' };
          const matches = [];
          const metaMatches = [];

          // Search in folder/project path
          const projectPath = session.projectPath || project.path || '';
          if (projectPath.toLowerCase().includes(lowerKeyword)) {
            metaMatches.push({ type: 'folder', text: projectPath });
          }

          // Search in tags
          for (const tag of (sessionNotes.tags || [])) {
            if (tag.toLowerCase().includes(lowerKeyword)) {
              metaMatches.push({ type: 'tag', text: tag });
            }
          }

          // Search in rename/title
          const rename = sessionNotes.rename || '';
          if (rename.toLowerCase().includes(lowerKeyword)) {
            metaMatches.push({ type: 'title', text: rename });
          }

          // Search in firstUserMessage (session description)
          const firstMsg = session.firstUserMessage || '';
          if (firstMsg.toLowerCase().includes(lowerKeyword)) {
            metaMatches.push({ type: 'description', text: firstMsg.slice(0, 300) });
          }

          // Search in note
          const note = sessionNotes.note || '';
          if (note.toLowerCase().includes(lowerKeyword)) {
            metaMatches.push({ type: 'note', text: note.slice(0, 300) });
          }

          // Search in message content
          for (const msg of session.messages) {
            const content = typeof msg.content === 'string' ? msg.content : '';
            if (content.toLowerCase().includes(lowerKeyword)) {
              matches.push({
                role: msg.role,
                content: content.slice(0, 300),
                timestamp: msg.timestamp,
              });
            }
          }
          if (matches.length > 0 || metaMatches.length > 0) {
            results.push({
              sessionId: session.id,
              projectPath: session.projectPath,
              matchCount: matches.length + metaMatches.length,
              matches: matches.slice(0, 5),
              metaMatches,
              firstUserMessage: session.firstUserMessage,
              rename: sessionNotes.rename || '',
              tags: sessionNotes.tags || [],
              status: session.status,
              lastActiveTime: session.lastActiveTime,
            });
          }
        }
      }
      return sendJSON(res, results);
    }

    // POST /api/notes - Set note for session
    if (pathname === '/api/notes' && req.method === 'POST') {
      const body = await parseBody(req);
      if (!body.sessionId) return sendJSON(res, { error: 'Missing sessionId' }, 400);
      await setSessionNote(body.sessionId, body.note || '');
      _cache = null; // Invalidate cache
      return sendJSON(res, { ok: true });
    }

    // POST /api/tags - Add/remove tag
    if (pathname === '/api/tags' && req.method === 'POST') {
      const body = await parseBody(req);
      if (!body.sessionId || !body.tag) return sendJSON(res, { error: 'Missing fields' }, 400);
      if (body.action === 'remove') {
        await removeSessionTag(body.sessionId, body.tag);
      } else {
        await addSessionTag(body.sessionId, body.tag);
      }
      _cache = null;
      return sendJSON(res, { ok: true });
    }

    // GET /api/tags - Get all tags
    if (pathname === '/api/tags' && req.method === 'GET') {
      const tags = await getAllTags();
      return sendJSON(res, tags);
    }

    // POST /api/focus - Focus Terminal window/tab for an active Claude session
    if (pathname === '/api/focus' && req.method === 'POST') {
      if (!IS_MACOS) return sendJSON(res, { error: 'Focus is only supported on macOS' }, 400);

      const body = await parseBody(req);
      const pid = sanitizePid(body.pid);
      if (!pid) return sendJSON(res, { error: 'Invalid PID' }, 400);

      const { activeProcesses } = await getCachedData();
      if (!isClaudeProcess(pid, activeProcesses)) {
        return sendJSON(res, { error: 'PID is not a recognized Claude process' }, 403);
      }

      try {
        // Find which tty this PID is using
        const psOutput = execSync(`ps -o tty= -p ${pid} 2>/dev/null`, { encoding: 'utf-8' }).trim();
        if (!psOutput || psOutput === '??') {
          return sendJSON(res, { error: 'Cannot determine tty for PID ' + pid }, 400);
        }

        // Validate tty format before using in AppleScript
        if (!/^[a-z0-9/]+$/i.test(psOutput)) {
          return sendJSON(res, { error: 'Invalid tty format' }, 400);
        }

        const script = `tell application "Terminal"
  activate
  set targetTTY to "${psOutput}"
  repeat with w in windows
    repeat with t in tabs of w
      if tty of t contains targetTTY then
        set selected tab of w to t
        set index of w to 1
        return "focused"
      end if
    end repeat
  end repeat
  return "not_found"
end tell`;
        const result = runAppleScript(script);
        if (result === 'not_found') {
          return sendJSON(res, { error: 'Terminal tab not found for tty ' + psOutput }, 404);
        }
        return sendJSON(res, { ok: true, tty: psOutput });
      } catch (err) {
        return sendJSON(res, { error: 'Focus failed: ' + err.message }, 500);
      }
    }

    // POST /api/resume - Open new Terminal tab and resume a Claude session
    if (pathname === '/api/resume' && req.method === 'POST') {
      const body = await parseBody(req);
      if (!body.sessionId) return sendJSON(res, { error: 'Missing sessionId' }, 400);
      if (body.sessionId.length < 8) return sendJSON(res, { error: 'Session ID too short' }, 400);

      // Find session to get its cwd
      const { projects } = await getCachedData();
      let sessionCwd = body.cwd || null;
      if (!sessionCwd) {
        for (const project of projects) {
          for (const session of project.sessions) {
            if (session.id === body.sessionId || session.id.startsWith(body.sessionId)) {
              sessionCwd = session.cwd || session.projectPath;
              break;
            }
          }
          if (sessionCwd) break;
        }
      }

      try {
        // Validate sessionId format (UUID-like)
        if (!/^[0-9a-f-]+$/i.test(body.sessionId)) {
          return sendJSON(res, { error: 'Invalid session ID format' }, 400);
        }

        const resumeCmd = `claude --resume ${body.sessionId}`;

        if (IS_MACOS) {
          // Write a temp shell script and open in Terminal
          const tmpSh = join(tmpdir(), `ccdash-resume-${Date.now()}.sh`);
          // Escape single quotes in cwd for shell safety
          const safeCwd = sessionCwd ? sessionCwd.replace(/'/g, "'\\''") : '';
          const cdCmd = safeCwd ? `cd '${safeCwd}'\n` : '';
          writeFileSync(tmpSh, `#!/bin/bash\n${cdCmd}${resumeCmd}\n`, { mode: 0o700 });
          execSync(`open -a Terminal.app "${tmpSh}"`);
          setTimeout(() => { try { unlinkSync(tmpSh); } catch {} }, 3000);
        } else {
          // On Linux, try common terminal emulators
          const cdCmd = sessionCwd ? `cd '${sessionCwd.replace(/'/g, "'\\''")}' && ` : '';
          const fullCmd = `${cdCmd}${resumeCmd}`;
          try {
            execSync(`which xterm && xterm -e "${fullCmd}" &`, { stdio: 'ignore' });
          } catch {
            return sendJSON(res, { error: 'No supported terminal emulator found. Run manually: ' + resumeCmd }, 400);
          }
        }
        return sendJSON(res, { ok: true });
      } catch (err) {
        return sendJSON(res, { error: 'Resume failed: ' + err.message }, 500);
      }
    }

    // POST /api/refresh - Force refresh cache
    if (pathname === '/api/refresh' && req.method === 'POST') {
      await getCachedData(true);
      return sendJSON(res, { ok: true });
    }

    // POST /api/kill - Kill an active Claude session process
    if (pathname === '/api/kill' && req.method === 'POST') {
      const body = await parseBody(req);
      const pid = sanitizePid(body.pid);
      if (!pid) return sendJSON(res, { error: 'Invalid PID' }, 400);

      // Verify this PID belongs to a known Claude process
      const { activeProcesses } = await getCachedData();
      if (!isClaudeProcess(pid, activeProcesses)) {
        return sendJSON(res, { error: 'PID ' + pid + ' is not a recognized Claude process' }, 403);
      }

      try {
        // Check if process is alive first
        process.kill(pid, 0);

        // Send SIGTERM to the process group (kills claude and child processes)
        try {
          // Try killing the process group first (negative PID)
          process.kill(-pid, 'SIGTERM');
        } catch {
          // If process group kill fails, kill just the process
          process.kill(pid, 'SIGTERM');
        }

        // Verify it's dead after a short wait
        setTimeout(() => {
          try {
            process.kill(pid, 0);
            // Still alive, force kill
            try { process.kill(-pid, 'SIGKILL'); } catch {}
            try { process.kill(pid, 'SIGKILL'); } catch {}
          } catch {
            // Already dead, good
          }
        }, 2000);

        _cache = null; // Invalidate cache
        return sendJSON(res, { ok: true, pid });
      } catch (err) {
        if (err.code === 'ESRCH') {
          return sendJSON(res, { error: 'Process not found (PID ' + pid + ')' }, 404);
        }
        return sendJSON(res, { error: 'Kill failed: ' + err.message }, 500);
      }
    }

    // POST /api/rename - Set display alias for a session
    if (pathname === '/api/rename' && req.method === 'POST') {
      const body = await parseBody(req);
      if (!body.sessionId) return sendJSON(res, { error: 'Missing sessionId' }, 400);
      await setSessionRename(body.sessionId, body.rename || '');
      _cache = null;
      return sendJSON(res, { ok: true });
    }

    // POST /api/delete-session - Delete a session JSONL file from disk
    if (pathname === '/api/delete-session' && req.method === 'POST') {
      const body = await parseBody(req);
      if (!body.sessionId) return sendJSON(res, { error: 'Missing sessionId' }, 400);

      const { projects } = await getCachedData();
      let filePath = null;
      for (const project of projects) {
        for (const session of project.sessions) {
          if (session.id === body.sessionId) {
            filePath = session.filePath;
            break;
          }
        }
        if (filePath) break;
      }

      if (!filePath) {
        return sendJSON(res, { error: 'Session not found' }, 404);
      }

      // Verify the file is within ~/.claude/ directory
      const resolvedPath = resolve(normalize(filePath));
      if (!resolvedPath.startsWith(resolve(CLAUDE_DIR))) {
        return sendJSON(res, { error: 'Refusing to delete file outside ~/.claude/' }, 403);
      }

      try {
        await fsp.unlink(filePath);
        _cache = null;
        return sendJSON(res, { ok: true });
      } catch (err) {
        return sendJSON(res, { error: 'Delete failed: ' + err.message }, 500);
      }
    }

    // GET /api/filetree?path=<dir> - Get directory tree for a project folder
    if (pathname === '/api/filetree' && req.method === 'GET') {
      const dirPath = url.searchParams.get('path');
      if (!dirPath) return sendJSON(res, { error: 'Missing path parameter' }, 400);

      // Validate path is within allowed project directories
      const { projects } = await getCachedData();
      const allowedRoots = getAllowedRoots(projects);
      if (!isPathAllowed(dirPath, allowedRoots)) {
        return sendJSON(res, { error: 'Access denied: path not within any known project' }, 403);
      }

      try {
        const entries = await fsp.readdir(dirPath, { withFileTypes: true });
        const items = entries
          .filter(e => !e.name.startsWith('.'))
          .map(e => ({
            name: e.name,
            path: join(dirPath, e.name),
            isDirectory: e.isDirectory(),
          }))
          .sort((a, b) => {
            // Directories first, then alphabetical
            if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
            return a.name.localeCompare(b.name);
          });
        return sendJSON(res, items);
      } catch (err) {
        return sendJSON(res, { error: 'Cannot read directory: ' + err.message }, 500);
      }
    }

    // POST /api/open-finder - Reveal file/directory in macOS Finder
    if (pathname === '/api/open-finder' && req.method === 'POST') {
      if (!IS_MACOS) return sendJSON(res, { error: 'Finder is only available on macOS' }, 400);

      const body = await parseBody(req);
      if (!body.path) return sendJSON(res, { error: 'Missing path' }, 400);

      // Validate path is within allowed directories
      const { projects } = await getCachedData();
      const allowedRoots = getAllowedRoots(projects);
      if (!isPathAllowed(body.path, allowedRoots)) {
        return sendJSON(res, { error: 'Access denied: path not within any known project' }, 403);
      }

      try {
        execSync(`open -R "${body.path.replace(/"/g, '\\"')}"`);
        return sendJSON(res, { ok: true });
      } catch (err) {
        return sendJSON(res, { error: 'Open Finder failed: ' + err.message }, 500);
      }
    }

    // GET /api/platform - Return server platform info
    if (pathname === '/api/platform' && req.method === 'GET') {
      return sendJSON(res, { platform: platform(), isMacOS: IS_MACOS });
    }

    return sendJSON(res, { error: 'Not found' }, 404);
  } catch (err) {
    console.error('API error:', err);
    return sendJSON(res, { error: err.message }, 500);
  }
}

/**
 * Start the HTTP server.
 */
export async function startServer(port = 3456) {
  _serverPort = port;
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    // CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': `http://localhost:${port}`,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin',
      });
      return res.end();
    }

    // API routes
    if (pathname.startsWith('/api/')) {
      return handleAPI(req, res, pathname, port);
    }

    // Dashboard HTML
    if (pathname === '/' || pathname === '/index.html') {
      return sendHTML(res, getDashboardHTML());
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });

  server.listen(port, () => {
    console.log(`
\x1b[36m\x1b[1m  ccdash\x1b[0m \x1b[2m— Claude Code Dashboard\x1b[0m

  \x1b[1mLocal:\x1b[0m   http://localhost:${port}
  \x1b[2mPress Ctrl+C to stop\x1b[0m
`);
  });

  return server;
}
