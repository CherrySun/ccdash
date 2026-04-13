# ccdash — Product Specification & Verification Plan

> Version: 1.1.0 | Last Updated: 2026-04-13

---

## Part I: Product Overview

### Mission

ccdash is a **lightweight, zero-dependency** web dashboard and CLI tool for browsing, managing, and analyzing [Claude Code](https://claude.ai/code) sessions. It provides full visibility into Claude Code usage — sessions, conversations, costs, and active processes — without touching any Claude Code data files.

### Design Principles

| Principle | Description |
|-----------|-------------|
| **Zero Dependencies** | Only Node.js built-in modules. No `node_modules`, no build step, no frameworks. |
| **Read-Only Safety** | Never writes to `~/.claude/`. All user metadata stored separately in `~/.ccdash/`. |
| **Single-File UI** | Entire dashboard (HTML + CSS + JS) is a single template literal — no bundler needed. |
| **macOS-First** | Full Terminal/Finder integration on macOS; graceful degradation on other platforms. |
| **Instant Startup** | Native `http.createServer` — server starts in milliseconds. |

### Architecture

```
User Browser ──→ HTTP Server (server.js)
                    ├── API Routes
                    │   ├── Session Data ← scanner.js ← ~/.claude/projects/**/*.jsonl
                    │   ├── Active Procs ← scanner.js ← ~/.claude/sessions/*.json
                    │   ├── Cost Calc   ← pricing.js
                    │   ├── User Meta   ← notes.js ← ~/.ccdash/notes.json
                    │   └── File System ← fs (filetree, file-content, claude-md)
                    └── Dashboard HTML  ← dashboard.js (single-file)

CLI (cli.js) ──→ scanner.js / pricing.js / notes.js → Terminal output
```

### Data Model

| Data Source | Location | Access | Description |
|-------------|----------|--------|-------------|
| Session JSONL | `~/.claude/projects/<hash>/<id>.jsonl` | Read-only | Claude Code conversation logs |
| Active Processes | `~/.claude/sessions/<pid>.json` | Read-only | Running Claude Code process info |
| User Metadata | `~/.ccdash/notes.json` | Read/Write | Notes, tags, renames (ccdash-owned) |
| Global Config | `~/.claude/CLAUDE.md` | Read/Write | Claude Code global instructions |

---

## Part II: Feature Specification

### F1 — Session Overview (Web)

The main dashboard view. Displays all Claude Code sessions organized into groups.

**Capabilities:**
- F1.1: List all sessions from `~/.claude/projects/` with metadata (status, turns, model, cost, time)
- F1.2: Group by project folder (default) or by tag
- F1.3: Filter sessions by tag (click tag chips at top)
- F1.4: Each session card shows: status dot, title, time ago, turns count, model, cost, tags
- F1.5: Session titles use rename > firstUserMessage > lastPrompt > "(empty session)" priority
- F1.6: Quick action buttons on hover: Resume / Focus / Kill / Rename / Delete
- F1.7: Active sessions show green dot; recent (< 1hr) yellow; completed gray
- F1.8: Click any card to open session detail view

### F2 — Session Detail (Web)

Full view of a single session with conversation, stats, and management actions.

**Capabilities:**
- F2.1: Header with status badge, title (click-to-rename), short ID, action buttons
- F2.2: Session info card: project, started, last active, duration, model, turns, tools used
- F2.3: Token usage & cost card: input/output/cache-read/cache-create tokens with costs
- F2.4: Total cost highlight
- F2.5: Tool usage breakdown with counts per tool
- F2.6: Notes textarea — auto-saves on change
- F2.7: Tags — add via input field (Enter), remove via ✕ on badge, color-coded
- F2.8: Send Prompt card — textarea with Cmd+Enter shortcut, opens claude --resume with piped prompt
- F2.9: Conversation view — full message history with markdown rendering
- F2.10: Each message shows role (user/assistant), content, tool calls, token usage
- F2.11: Action buttons: Resume / Focus / Kill (context-sensitive based on active status)
- F2.12: Copy resume command button (clipboard)
- F2.13: Delete session button with confirmation modal

### F3 — Cost Dashboard (Web)

Aggregated cost analysis with visualizations.

**Capabilities:**
- F3.1: Period selector: Today / Week / Month / All
- F3.2: Summary stat cards: total cost, total tokens, input cost, output cost, cache cost
- F3.3: Daily cost trend — bar chart
- F3.4: Cost by project — pie chart with percentage breakdown, **clickable** (legend items + table rows navigate to project folder view)
- F3.5: Cost by model — breakdown table
- F3.6: Top sessions by cost — sortable table with per-session breakdown

### F4 — Sidebar (Web)

Persistent left panel with project/session navigation.

**Capabilities:**
- F4.1: Collapsible project groups with session count badges
- F4.2: Session items with status dot, title, time ago, turns, tags
- F4.3: Click project header to expand + show project file tree
- F4.4: Click session to open detail view
- F4.5: Active session count indicator at top (green dot + count)
- F4.6: Refresh button with spinning animation
- F4.7: Total session count display

### F5 — Search (Web)

Full-text search across all session content and metadata.

**Capabilities:**
- F5.1: Search input in top bar
- F5.2: Search across: message content, folder paths, tags, titles/renames, notes, descriptions
- F5.3: Results show session card with match highlights
- F5.4: Results show match count and snippet previews (up to 5 matches)
- F5.5: Meta matches (tag, folder, title, note) shown separately from content matches

### F6 — File Tree Browser (Web)

Browse project directories with file preview and session summary.

**Capabilities:**
- F6.1: Triggered by clicking project header in sidebar
- F6.2: Hierarchical tree with expand/collapse for directories
- F6.3: File type icons (folder, JS, TS, JSON, MD, etc.)
- F6.4: Hidden files (dot-prefix) filtered out
- F6.5: Directories sorted first, then alphabetical
- F6.6: Split-pane layout: tree on left, preview on right
- F6.7: Click file to show content preview with line numbers
- F6.8: Binary file detection (null bytes in first 8KB)
- F6.9: Large file handling: 1MB size limit, 500-line truncation
- F6.10: Language detection for syntax class labeling
- F6.11: Open in Finder button (macOS only)
- F6.12: **Session strip** — horizontal scrollable row of compact session cards at top of folder view, showing all sessions for this project
- F6.13: Session strip cards show: status dot, title, time ago, turns, cost; click navigates to session detail

### F7 — CLAUDE.md Editor (Web)

View and edit the global Claude Code instructions file.

**Capabilities:**
- F7.1: Accessible via nav tab "CLAUDE.md"
- F7.2: Preview tab — rendered markdown
- F7.3: Edit tab — plain textarea editor
- F7.4: Modified indicator (dot on tab) when unsaved changes
- F7.5: Save button with atomic write (tmp + rename)
- F7.6: Reload button to discard unsaved changes
- F7.7: Create from scratch if file doesn't exist
- F7.8: Shows file path in header

### F8 — Session Control (Web)

Terminal integration for controlling Claude Code sessions.

**Capabilities:**
- F8.1: Resume — opens `claude --resume <id>` in new Terminal tab (macOS) or xterm (Linux)
- F8.2: Resume with prompt — pipes prompt text to claude --resume via temp file
- F8.3: Focus — brings Terminal tab to front using AppleScript TTY matching (macOS)
- F8.4: Kill — sends SIGTERM to process group, then SIGKILL after 2s if needed
- F8.5: Post-action polling — refreshAfterAction polls up to 6 times at 1.5s intervals
- F8.6: Resume failure detection — toast warning if session not active after polling
- F8.7: Full UI refresh after actions (sidebar, overview, active status, detail)

### F9 — Active Process Monitor (Web)

Real-time tracking of running Claude Code instances.

**Capabilities:**
- F9.1: Reads `~/.claude/sessions/*.json` for PID-to-session mapping
- F9.2: Verifies process existence via signal 0
- F9.3: Auto-polls every 5 seconds (via loadActive interval)
- F9.4: Change detection: compares prev/current active sets, re-renders on change
- F9.5: Enriches active process data with session stats (turns, tokens, cost, tools)
- F9.6: Status indicator in sidebar top bar (count + dot)

### F10 — User Metadata (Web + API)

Persistent notes, tags, and renames stored in `~/.ccdash/notes.json`.

**Capabilities:**
- F10.1: Notes — free-text per session, auto-saved on change
- F10.2: Tags — color-coded pills, add/remove, filter/group by tag
- F10.3: Rename — custom display name, inline editing with Enter/Escape/blur
- F10.4: Tag colors — deterministic hash from tag name → 10 color palette
- F10.5: Atomic file writes (tmp + rename) to prevent corruption
- F10.6: In-memory cache with forced refresh support

### F11 — CLI Commands

Terminal-based interface for all core operations.

**Capabilities:**
- F11.1: `ccdash` — Start web dashboard at localhost:3456, auto-open browser
- F11.2: `ccdash cli` — List all sessions in terminal with ANSI coloring
- F11.3: `ccdash show <id>` — Session details + conversation preview (last 5 turns)
- F11.4: `ccdash resume <id>` — Spawn claude --resume in current terminal
- F11.5: `ccdash cost [period]` — Cost report by project and day
- F11.6: `ccdash search <keyword>` — Search with snippet previews
- F11.7: `ccdash active` — Show running Claude processes with stats
- F11.8: `ccdash serve [port]` — Start server on custom port
- F11.9: `ccdash upgrade` — Check npm registry + auto-upgrade
- F11.10: `ccdash version` / `ccdash help`
- F11.11: Abbreviated session IDs (first 8 chars)
- F11.12: Unknown arg starting with hex → auto-`show`

### F12 — Server Infrastructure

HTTP server, caching, security.

**Capabilities:**
- F12.1: Native `http.createServer` — no Express
- F12.2: Port auto-retry: if port in use, try next port (up to 10 retries)
- F12.3: 30-second response cache with force-refresh endpoint
- F12.4: CORS origin validation (only localhost:port)
- F12.5: Path traversal protection (isPathAllowed for file operations)
- F12.6: PID verification (only kill/focus known Claude processes)
- F12.7: Session ID format validation (UUID hex pattern)
- F12.8: Request body size limit (1MB)
- F12.9: AppleScript execution via temp file (avoids shell injection)

### F13 — Cost Calculation

Token-to-cost conversion engine.

**Capabilities:**
- F13.1: Sonnet 4 pricing: $3/$15/$0.30/$3.75 per million tokens (in/out/cache-read/cache-write)
- F13.2: Opus 4 pricing: $15/$75/$1.50/$18.75 per million tokens
- F13.3: Model detection: exact match → partial match (contains "sonnet"/"opus") → default Opus
- F13.4: Aggregation: per-session, per-project, per-day, per-model
- F13.5: Period filtering: today, week, month, all
- F13.6: Format helpers: $X.XX / $X.XXX / $X.XXXX adaptive precision

---

## Part III: Verification Test Cases

### Legend

| Symbol | Meaning |
|--------|---------|
| **[P]** | Positive test (expected success) |
| **[N]** | Negative test (expected failure/rejection) |
| **[E]** | Edge case |
| **[R]** | Race condition / timing |
| **[S]** | Security |

---

### T1 — Session Scanning & Parsing (scanner.js)

```
T1.1 [P] Scan with valid sessions
  Setup: ~/.claude/projects/<hash>/ contains valid .jsonl files
  Action: scanAllSessions()
  Expect: Returns projects array with parsed sessions, sorted by last active time

T1.2 [P] Parse user message
  Setup: JSONL line {"type":"user","message":{"content":"hello"},"timestamp":"...","cwd":"/path"}
  Expect: userMessages++, startTime set, cwd captured, message added to messages[]

T1.3 [P] Parse assistant message with tool use
  Setup: JSONL line with type=assistant, content=[{type:"text"},{type:"tool_use",name:"Read"}]
  Expect: tools includes "Read", toolUseCounts["Read"]=1, text captured

T1.4 [P] Parse token usage
  Setup: Assistant message with usage: {input_tokens:100, output_tokens:50, cache_read_input_tokens:200}
  Expect: totalInputTokens=100, totalOutputTokens=50, totalCacheReadTokens=200

T1.5 [E] Empty JSONL file
  Setup: Session .jsonl file is empty (0 bytes)
  Expect: Returns session with all zero counts, status='unknown', no crash

T1.6 [E] Malformed JSON lines
  Setup: JSONL with some invalid JSON lines mixed with valid ones
  Expect: Valid lines parsed, invalid lines silently skipped

T1.7 [E] Session with no timestamps
  Setup: Messages without timestamp fields
  Expect: startTime=null, lastActiveTime=null, status='unknown'

T1.8 [E] Session with <synthetic> model
  Setup: Assistant message with model="<synthetic>"
  Expect: Model not added to models set, session.model not set to <synthetic>

T1.9 [P] Status determination — active
  Setup: lastActiveTime = Date.now() - 60000 (1 minute ago)
  Expect: status = 'active'

T1.10 [P] Status determination — recent
  Setup: lastActiveTime = Date.now() - 1800000 (30 minutes ago)
  Expect: status = 'recent'

T1.11 [P] Status determination — completed
  Setup: lastActiveTime = Date.now() - 7200000 (2 hours ago)
  Expect: status = 'completed'

T1.12 [P] Project path resolution
  Setup: Hash "-Users-john-projects-my-app" where /Users/john/projects/my-app exists
  Expect: resolveProjectPath returns "/Users/john/projects/my-app"

T1.13 [E] Project path with hyphens in folder name
  Setup: Hash "-Users-john-my-cool-app" where /Users/john/my-cool-app exists
  Expect: Correctly resolves buffered segments despite ambiguous hyphens

T1.14 [E] Project path resolution — nonexistent paths
  Setup: Hash for a path that no longer exists on disk
  Expect: Returns best-effort path reconstruction, no crash

T1.15 [P] Active process detection
  Setup: ~/.claude/sessions/12345.json exists with valid sessionId
  Expect: getActiveProcesses returns entry with pid=12345, isRunning based on process.kill(pid,0)

T1.16 [E] Active process — stale JSON (process no longer running)
  Setup: sessions/99999.json exists but PID 99999 is not running
  Expect: Entry returned with isRunning=false

T1.17 [E] No projects directory
  Setup: ~/.claude/projects/ does not exist
  Expect: Returns empty array, no crash

T1.18 [E] Concurrent parsing
  Setup: 50+ session files across multiple projects
  Expect: parseSessionsConcurrent handles all with concurrency=8, no data corruption

T1.19 [P] Multiple models in session
  Setup: Session alternates between sonnet and opus in assistant messages
  Expect: models Set contains both, session.model = last seen model

T1.20 [E] Very large JSONL file (10MB+)
  Setup: Session with thousands of messages
  Expect: Streams line-by-line, no OOM, returns complete session data
```

### T2 — Cost Calculation (pricing.js)

```
T2.1 [P] Sonnet cost calculation
  Setup: 1M input, 500K output tokens, model="claude-sonnet-4.6"
  Expect: input=$3.00, output=$7.50, total=$10.50

T2.2 [P] Opus cost calculation
  Setup: 1M input, 500K output tokens, model="claude-opus-4.6"
  Expect: input=$15.00, output=$37.50, total=$52.50

T2.3 [P] Cache token costs
  Setup: 2M cache_read, 500K cache_creation tokens, sonnet
  Expect: cacheRead=$0.60, cacheCreation=$1.875

T2.4 [E] Zero tokens
  Setup: All token counts = 0
  Expect: All costs = $0.0000, total = $0.0000

T2.5 [E] Unknown model
  Setup: model="claude-unknown-99"
  Expect: Falls back to Opus pricing (most expensive = conservative)

T2.6 [P] Partial model match — "sonnet"
  Setup: model="some-custom-sonnet-variant"
  Expect: Matches Sonnet pricing via includes('sonnet')

T2.7 [E] Null model
  Setup: model=null
  Expect: Returns DEFAULT_PRICING (Opus), no crash

T2.8 [P] 1M context variant
  Setup: model="claude-opus-4.6-1m"
  Expect: Exact match found, Opus pricing

T2.9 [P] Cost formatting
  Setup: Various cost values
  Expect: <$0.01 → $0.XXXX, <$1 → $0.XXX, ≥$1 → $X.XX

T2.10 [P] Token formatting
  Setup: 500, 1500, 2500000
  Expect: "500", "1.5K", "2.5M"

T2.11 [P] Period filtering — today
  Setup: Sessions from today, yesterday, last week
  Expect: Only today's sessions included in aggregation

T2.12 [P] Period filtering — week
  Setup: Sessions across 10 days
  Expect: Only sessions from last 7 days included

T2.13 [E] Session with no startTime
  Setup: Session where startTime is null
  Expect: Excluded from period filtering (no date to compare)

T2.14 [P] Aggregate per-project
  Setup: 3 sessions across 2 projects
  Expect: perProject has 2 entries with correct cost/token sums

T2.15 [P] Aggregate per-day
  Setup: 5 sessions across 3 days
  Expect: perDay has 3 entries with correct daily totals

T2.16 [P] Aggregate per-model
  Setup: Sessions using sonnet and opus
  Expect: perModel has 2 entries with model-specific totals
```

### T3 — Notes & Tags Storage (notes.js)

```
T3.1 [P] Save and load note
  Action: setSessionNote("abc123", "my note") → loadNotes()
  Expect: sessions["abc123"].note === "my note"

T3.2 [P] Save and load tag
  Action: addSessionTag("abc123", "bugfix") → loadNotes()
  Expect: sessions["abc123"].tags includes "bugfix", global tags includes "bugfix"

T3.3 [P] Remove tag
  Action: addSessionTag then removeSessionTag("abc123", "bugfix")
  Expect: sessions["abc123"].tags does not include "bugfix"

T3.4 [P] Set rename
  Action: setSessionRename("abc123", "My Custom Name")
  Expect: sessions["abc123"].rename === "My Custom Name"

T3.5 [E] Clear rename
  Action: setSessionRename("abc123", "")
  Expect: rename is empty string, not undefined

T3.6 [P] Duplicate tag prevention
  Action: addSessionTag("abc123", "test") twice
  Expect: tags array has "test" only once

T3.7 [E] Notes file doesn't exist
  Action: loadNotes() when ~/.ccdash/notes.json is missing
  Expect: Returns {sessions:{}, tags:[]}, no crash

T3.8 [E] Corrupted notes file
  Action: Write invalid JSON to notes.json, then loadNotes()
  Expect: Returns default empty structure, no crash

T3.9 [P] Atomic write
  Action: saveNotes() during concurrent access
  Expect: File is written via tmp+rename, no partial writes

T3.10 [P] getAllTags
  Action: Add tags to multiple sessions, call getAllTags()
  Expect: Returns deduplicated array of all tags

T3.11 [P] getSessionsByTag
  Action: Tag multiple sessions with "feature", call getSessionsByTag("feature")
  Expect: Returns array of matching session IDs

T3.12 [E] Operations on non-existent session
  Action: setSessionNote("nonexistent-id", "note")
  Expect: Creates new entry automatically via ensureSession

T3.13 [P] Cache invalidation
  Action: loadNotes(), manually modify file on disk, loadNotes(true)
  Expect: forceRefresh=true returns fresh data from disk
```

### T4 — API Endpoints (server.js)

```
T4.1 [P] GET /api/sessions
  Expect: Array of projects, each with sessions array containing id, status, cost, tags, etc.

T4.2 [P] GET /api/session/<full-id>
  Expect: Full session with messages, tools, cost, notes, tags

T4.3 [P] GET /api/session/<partial-id> (8+ chars)
  Expect: Matches session whose ID starts with partial, returns full data

T4.4 [N] GET /api/session/<short-id> (< 8 chars)
  Expect: 400 error "Session ID too short"

T4.5 [N] GET /api/session/nonexistent-id
  Expect: 404 error "Session not found"

T4.6 [P] GET /api/active
  Expect: Array of processes with isRunning, sessionId, enriched session data

T4.7 [P] GET /api/costs?period=today
  Expect: Aggregated costs filtered to today's sessions

T4.8 [P] GET /api/costs?period=all
  Expect: Aggregated costs for all sessions

T4.9 [P] GET /api/search?q=keyword
  Expect: Array of results with sessionId, matchCount, matches, metaMatches

T4.10 [N] GET /api/search (no q param)
  Expect: 400 error "Missing q parameter"

T4.11 [P] GET /api/tags
  Expect: Array of all tag strings

T4.12 [P] POST /api/notes
  Body: {sessionId:"abc", note:"hello"}
  Expect: {ok:true}, note persisted

T4.13 [N] POST /api/notes (no sessionId)
  Expect: 400 error "Missing sessionId"

T4.14 [P] POST /api/tags (add)
  Body: {sessionId:"abc", tag:"test", action:"add"}
  Expect: {ok:true}, tag added

T4.15 [P] POST /api/tags (remove)
  Body: {sessionId:"abc", tag:"test", action:"remove"}
  Expect: {ok:true}, tag removed

T4.16 [N] POST /api/tags (missing fields)
  Body: {sessionId:"abc"}
  Expect: 400 error "Missing fields"

T4.17 [P] POST /api/rename
  Body: {sessionId:"abc", rename:"New Name"}
  Expect: {ok:true}, rename persisted

T4.18 [P] POST /api/refresh
  Expect: {ok:true}, cache invalidated

T4.19 [P] GET /api/filetree?path=/valid/project/path
  Expect: Array of {name, path, isDirectory}, sorted dirs-first

T4.20 [N] GET /api/filetree?path=/etc/passwd
  Expect: 403 "Access denied: path not within any known project"

T4.21 [N] GET /api/filetree (no path)
  Expect: 400 "Missing path parameter"

T4.22 [P] GET /api/file-content?path=/valid/file.js
  Expect: {name, path, size, binary:false, content, totalLines}

T4.23 [E] GET /api/file-content — binary file
  Expect: {binary:true, content:""}

T4.24 [E] GET /api/file-content — file > 1MB
  Expect: {tooLarge:true, error:"File too large..."}

T4.25 [E] GET /api/file-content — file > 500 lines
  Expect: {truncated:true, totalLines:N, content: first 500 lines}

T4.26 [N] GET /api/file-content — directory path
  Expect: 400 "Path is a directory"

T4.27 [N] GET /api/file-content — path outside project
  Expect: 403 "Access denied"

T4.28 [P] GET /api/claude-md (file exists)
  Expect: {content:"...", path:"...", exists:true}

T4.29 [E] GET /api/claude-md (file not found)
  Expect: {error:"File not found", path:"...", exists:false}

T4.30 [P] POST /api/claude-md
  Body: {content:"# Hello"}
  Expect: {ok:true}, file written atomically

T4.31 [N] POST /api/claude-md (no content)
  Body: {}
  Expect: 400 "Missing content"

T4.32 [P] POST /api/resume
  Body: {sessionId:"valid-uuid-format-id"}
  Expect: {ok:true}, Terminal tab opened

T4.33 [N] POST /api/resume (missing sessionId)
  Expect: 400 "Missing sessionId"

T4.34 [N] POST /api/resume (short sessionId)
  Body: {sessionId:"abc"}
  Expect: 400 "Session ID too short"

T4.35 [N] POST /api/resume (invalid format)
  Body: {sessionId:"../../../etc/passwd"}
  Expect: 400 "Invalid session ID format"

T4.36 [P] POST /api/send-prompt
  Body: {sessionId:"valid-id", prompt:"hello"}
  Expect: {ok:true}, prompt piped to claude --resume

T4.37 [N] POST /api/send-prompt (empty prompt)
  Body: {sessionId:"valid-id", prompt:"   "}
  Expect: 400 "Missing prompt"

T4.38 [P] POST /api/kill
  Body: {pid: <valid-claude-pid>}
  Expect: {ok:true, pid:N}, SIGTERM sent

T4.39 [N] POST /api/kill (non-Claude PID)
  Body: {pid: 1}
  Expect: 403 "PID is not a recognized Claude process"

T4.40 [N] POST /api/kill (invalid PID)
  Body: {pid: "abc"}
  Expect: 400 "Invalid PID"

T4.41 [N] POST /api/kill (negative PID)
  Body: {pid: -1}
  Expect: 400 "Invalid PID"

T4.42 [P] POST /api/focus (macOS)
  Body: {pid: <valid-pid>}
  Expect: {ok:true, tty:"..."} or appropriate error

T4.43 [N] POST /api/focus (non-macOS)
  Expect: 400 "Focus is only supported on macOS"

T4.44 [P] POST /api/delete-session
  Body: {sessionId:"valid-id"}
  Expect: {ok:true}, JSONL file deleted

T4.45 [N] POST /api/delete-session (not found)
  Body: {sessionId:"nonexistent"}
  Expect: 404 "Session not found"

T4.46 [P] POST /api/open-finder (macOS)
  Body: {path:"/valid/path"}
  Expect: {ok:true}, Finder opens

T4.47 [N] POST /api/open-finder (non-macOS)
  Expect: 400 "Finder is only available on macOS"

T4.48 [P] GET /api/platform
  Expect: {platform:"darwin"|"linux"|..., isMacOS:bool}

T4.49 [N] GET /api/nonexistent
  Expect: 404 "Not found"

T4.50 [S] POST with invalid Origin header
  Setup: POST request with Origin: http://evil.com
  Expect: 403 "Forbidden: invalid origin"

T4.51 [S] Path traversal via filetree
  Setup: GET /api/filetree?path=/../../../etc
  Expect: 403 "Access denied"

T4.52 [S] Path traversal via file-content
  Setup: GET /api/file-content?path=/etc/shadow
  Expect: 403 "Access denied"

T4.53 [S] Session ID injection in resume
  Setup: POST /api/resume with sessionId containing shell metacharacters
  Expect: 400 "Invalid session ID format" (regex check)

T4.54 [E] Oversized request body
  Setup: POST with body > 1MB
  Expect: Error "Request body too large"

T4.55 [E] Invalid JSON body
  Setup: POST with non-JSON body
  Expect: Error "Invalid JSON"

T4.56 [P] Cache behavior
  Setup: Two rapid GET /api/sessions requests
  Expect: Second returns cached data (< 30s TTL)

T4.57 [P] Cache invalidation after mutation
  Setup: POST /api/notes then GET /api/sessions
  Expect: Sessions include updated notes (cache invalidated)

T4.58 [P] Status override for running processes
  Setup: Session whose JSONL-based status is 'completed' but PID is running
  Expect: GET /api/sessions returns status='active' for that session
```

### T5 — Dashboard UI (dashboard.js)

```
T5.1 [P] Initial load
  Action: Navigate to http://localhost:3456
  Expect: Dashboard renders with sidebar, sessions overview, active status

T5.2 [P] View switching — Sessions
  Action: Click "Sessions" tab
  Expect: sessions-overview visible, other views hidden

T5.3 [P] View switching — Costs
  Action: Click "Costs" tab
  Expect: costs-view visible, other views hidden, cost data loaded

T5.4 [P] View switching — CLAUDE.md
  Action: Click "CLAUDE.md" tab
  Expect: claude-md-view visible, editor/preview loaded

T5.5 [P] Session card click
  Action: Click a session card in overview
  Expect: session-detail visible, data loaded, sidebar item highlighted

T5.6 [P] Sidebar session click
  Action: Click session in sidebar
  Expect: Same as T5.5

T5.7 [P] Project group collapse/expand
  Action: Click project header in sidebar
  Expect: Sessions toggle hidden/shown, file tree view shown

T5.8 [P] Group by folder
  Action: Set groupBy='folder'
  Expect: Sessions grouped under project path headers

T5.9 [P] Group by tag
  Action: Set groupBy='tag'
  Expect: Sessions grouped under tag headers, untagged group for remainder

T5.10 [P] Tag filter
  Action: Click a tag chip in filter bar
  Expect: Only sessions with that tag shown, chip highlighted

T5.11 [P] Tag filter clear
  Action: Click active tag chip again
  Expect: Filter cleared, all sessions shown

T5.12 [P] Search — basic
  Action: Type "auth" in search bar, press Enter
  Expect: search-results view shown with matching sessions

T5.13 [P] Search — highlight
  Action: Search for "auth"
  Expect: Matching text highlighted in results with <mark> tags

T5.14 [E] Search — empty query
  Action: Press Enter with empty search bar
  Expect: No API call, or "all" results returned

T5.15 [E] Search — no results
  Action: Search for "xyzzy_nonexistent_term"
  Expect: Empty state message shown

T5.16 [P] Refresh button
  Action: Click refresh icon
  Expect: Spinning animation, data reloaded, UI updated

T5.17 [P] Resume session button
  Action: Click Resume on an inactive session
  Expect: Toast "Resuming session in Terminal…", polls for active state

T5.18 [R] Resume — session becomes active
  Action: Resume succeeds, claude process starts
  Expect: Status dot turns green, buttons change to Focus/Kill, sidebar updated

T5.19 [R] Resume — session fails to start
  Action: Resume but claude process doesn't appear
  Expect: After polling, toast "Resume may have failed — session not detected as active"

T5.20 [P] Kill session button
  Action: Click Kill on an active session
  Expect: Confirmation modal, then kills process, status updates to completed

T5.21 [P] Focus session button
  Action: Click Focus on an active session (macOS)
  Expect: Terminal tab brought to front, toast with tty info

T5.22 [P] Delete session
  Action: Click Delete, confirm modal
  Expect: Session removed from JSONL, removed from UI

T5.23 [N] Delete session — cancel
  Action: Click Delete, cancel modal
  Expect: Nothing happens, session still present

T5.24 [P] Inline rename
  Action: Click session title, type new name, press Enter
  Expect: Title updated, rename persisted via API

T5.25 [P] Inline rename — Escape
  Action: Click title, type, press Escape
  Expect: Rename cancelled, original title restored

T5.26 [P] Add tag
  Action: Type tag name in tag input, press Enter
  Expect: Tag badge appears, persisted via API

T5.27 [P] Remove tag
  Action: Click ✕ on tag badge
  Expect: Tag removed, UI updated

T5.28 [P] Save note
  Action: Type in notes textarea, blur/change
  Expect: Note saved via API

T5.29 [P] Send prompt
  Action: Type prompt in textarea, Cmd+Enter
  Expect: Toast "Prompt sent", Terminal opens with prompt piped to claude

T5.30 [E] Send prompt — empty
  Action: Click Send with empty textarea
  Expect: Toast "Please enter a prompt"

T5.31 [P] Copy resume command
  Action: Click copy button
  Expect: "claude --resume <id>" copied to clipboard, toast shown

T5.32 [P] CLAUDE.md — preview mode
  Action: Open CLAUDE.md tab
  Expect: Rendered markdown shown, headers/code/lists formatted

T5.33 [P] CLAUDE.md — edit mode
  Action: Switch to Edit tab
  Expect: Textarea with raw markdown, editable

T5.34 [P] CLAUDE.md — save
  Action: Edit content, click Save
  Expect: Content written to disk, modified indicator cleared

T5.35 [P] CLAUDE.md — modified indicator
  Action: Edit content
  Expect: Orange dot appears on Edit tab

T5.36 [E] CLAUDE.md — file not found
  Action: Open CLAUDE.md when file doesn't exist
  Expect: "Create" button shown, empty state message

T5.37 [P] CLAUDE.md — create
  Action: Click Create when file doesn't exist
  Expect: Empty editor opens, file created on save

T5.38 [P] File tree — expand folder
  Action: Click folder in tree
  Expect: Children loaded and shown, arrow rotates

T5.39 [P] File tree — file preview
  Action: Click a file in tree
  Expect: Right pane shows content with line numbers

T5.40 [E] File tree — binary file
  Action: Click a binary file (image, etc.)
  Expect: Preview shows "Binary file" indicator, no garbled content

T5.41 [E] File tree — large file
  Action: Click a file > 1MB
  Expect: Preview shows "File too large" message

T5.42 [E] File tree — truncated file
  Action: Click a file > 500 lines
  Expect: Shows first 500 lines with "truncated" indicator

T5.42a [P] File tree — session strip shown
  Action: Click project header in sidebar (project has 3 sessions)
  Expect: Folder view top shows horizontal strip with 3 compact session cards, scrollable

T5.42b [P] File tree — session strip card click
  Action: Click a card in the session strip
  Expect: Navigates to session detail view for that session

T5.42c [P] File tree — session strip card content
  Expect: Each strip card shows status dot, title (truncated to 40 chars), time ago, turns count, cost

T5.42d [E] File tree — session strip with many sessions
  Scenario: Project has 20+ sessions
  Expect: Strip scrolls horizontally, no overflow, scrollbar visible

T5.42e [E] File tree — session strip with zero sessions
  Scenario: Project folder exists but has no sessions (e.g. navigated via cost table with unmatched path)
  Expect: No session strip rendered, file tree shown normally

T5.42f [P] File tree — session strip active status
  Scenario: One session in project is currently active
  Expect: That card's status dot is green, others are gray

T5.43 [P] Cost dashboard — period switch
  Action: Click different period buttons
  Expect: Stats update for selected period

T5.44 [P] Cost dashboard — bar chart
  Expect: Daily cost bars rendered with correct proportions

T5.45 [P] Cost dashboard — pie chart
  Expect: SVG pie chart with project cost percentages

T5.45a [P] Cost dashboard — click project in pie chart legend
  Action: Click a project name in the pie chart legend
  Expect: Navigates to project folder view, sidebar expands matching project

T5.45b [P] Cost dashboard — click project in table
  Action: Click a project row in "Cost by Project" table
  Expect: Same as T5.45a — folder view with session strip and file tree

T5.45c [E] Cost dashboard — click project with no matching folder
  Scenario: perProject key differs from state.projects[].path (e.g. hash vs path)
  Expect: Folder view shown (may fail to load tree), sidebar best-effort match via title attribute

T5.46 [R] Active status polling
  Action: Start a Claude session externally
  Expect: Within ~5s, sidebar shows green dot, active count updates

T5.47 [R] Active status — session ends externally
  Action: Close a Claude session in Terminal
  Expect: Within ~5s, status dot changes, active count decrements

T5.48 [R] liveStatus race condition
  Scenario: Sidebar renders before activeProcesses loaded
  Expect: Uses server-reported status (not downgrading 'active' to 'completed')

T5.49 [P] Toast — normal
  Action: Trigger a success action
  Expect: Green toast appears for 2 seconds

T5.50 [P] Toast — warning
  Action: Trigger a failure action
  Expect: Orange toast with ⚠ prefix appears for 4 seconds

T5.51 [P] Confirmation modal
  Action: Trigger delete/kill action
  Expect: Modal with icon, title, message, Cancel/Confirm buttons

T5.52 [P] Button loading state
  Action: Click Resume
  Expect: Button shows loading state, re-enabled after action completes

T5.53 [P] Markdown rendering in messages
  Expect: Code blocks, inline code, headers, bold, italic, links rendered correctly

T5.54 [E] Empty sessions
  Setup: No sessions exist in ~/.claude/projects/
  Expect: Welcome empty state with friendly message

T5.55 [E] HTML escaping
  Setup: Session with title containing <script>alert('xss')</script>
  Expect: HTML-escaped, script not executed

T5.56 [P] timeAgo formatting
  Expect: "just now" (<1m), "5m ago", "3h ago", "2d ago"

T5.57 [P] Duration formatting
  Expect: Seconds, minutes, hours displayed correctly

T5.58 [P] Tag color determinism
  Action: Same tag name always produces same color
  Expect: tagColor("bugfix") returns consistent index across renders
```

### T6 — CLI Commands (cli.js)

```
T6.1 [P] ccdash (no args) — starts server + opens browser
  Expect: Server starts on port 3456, browser opens

T6.2 [P] ccdash serve 8080
  Expect: Server starts on port 8080

T6.3 [E] ccdash serve <port-in-use>
  Expect: Error message about port in use (autoRetry=false for explicit port)

T6.4 [P] ccdash cli — session list
  Expect: Colored terminal output with projects, sessions, status badges

T6.5 [P] ccdash show <8-char-id>
  Expect: Session details with info, cost breakdown, conversation preview

T6.6 [N] ccdash show (no id)
  Expect: Error "Usage: ccdash show <session-id>", exit 1

T6.7 [N] ccdash show <invalid-id>
  Expect: Error "Session not found", exit 1

T6.8 [P] ccdash resume <id>
  Expect: Spawns claude --resume, forwards stdio

T6.9 [P] ccdash cost today
  Expect: Cost report filtered to today

T6.10 [P] ccdash cost (defaults to 'all')
  Expect: Full cost report

T6.11 [P] ccdash search "keyword"
  Expect: Search results with snippets

T6.12 [E] ccdash search (no keyword)
  Expect: Error "Usage: ccdash search <keyword>", exit 1

T6.13 [P] ccdash active
  Expect: Lists running processes or "No active Claude Code processes"

T6.14 [P] ccdash version
  Expect: "ccdash v1.1.0"

T6.15 [P] ccdash help
  Expect: Usage text with all commands listed

T6.16 [P] ccdash <hex-id> — auto show
  Action: ccdash a1b2c3d4
  Expect: Equivalent to ccdash show a1b2c3d4

T6.17 [N] ccdash unknowncommand
  Expect: Error "Unknown command", help text, exit 1

T6.18 [P] ccdash upgrade — up to date
  Expect: "Already up to date! (vX.X.X)"

T6.19 [P] ccdash upgrade — newer version available
  Expect: Shows versions, runs npm install -g

T6.20 [E] ccdash upgrade — local newer than npm
  Expect: "Local version is newer" message, skips upgrade

T6.21 [E] ccdash upgrade — npm unreachable
  Expect: "Cannot reach npm registry" error

T6.22 [E] ccdash upgrade — permission denied
  Expect: Suggests using sudo
```

### T7 — Server Infrastructure (server.js)

```
T7.1 [P] Server starts on default port
  Action: startServer(3456)
  Expect: Listening on port 3456

T7.2 [P] Port auto-retry
  Setup: Port 3456 in use
  Action: startServer(3456) with autoRetry=true
  Expect: Tries 3457, 3458, etc. until finding free port

T7.3 [E] All ports exhausted
  Setup: Ports 3456-3466 all in use
  Expect: Error message about no available ports

T7.4 [E] Port > 65535
  Setup: Request port 70000
  Expect: Error "Port out of range"

T7.5 [P] Dashboard HTML served at /
  Action: GET /
  Expect: 200 with Content-Type text/html, full dashboard

T7.6 [P] Dashboard HTML at /index.html
  Action: GET /index.html
  Expect: Same as /

T7.7 [N] 404 for unknown paths
  Action: GET /foo/bar
  Expect: 404 "Not Found"

T7.8 [P] CORS preflight
  Action: OPTIONS /api/sessions
  Expect: 204 with Access-Control-Allow-* headers

T7.9 [S] CORS origin restriction
  Action: POST with Origin: http://localhost:3456
  Expect: Allowed

T7.10 [S] CORS origin rejection
  Action: POST with Origin: http://evil.com
  Expect: 403

T7.11 [P] Cache TTL
  Setup: First request populates cache
  Action: Second request within 30s
  Expect: Returns cached data without re-scanning

T7.12 [P] Cache force refresh
  Action: POST /api/refresh
  Expect: Next GET returns fresh data
```

### T8 — Cross-Feature Integration

```
T8.1 [P] Full flow: browse → detail → resume → monitor → kill
  Steps: Open dashboard → click session → click Resume → see status turn green
         → click Kill → confirm → see status turn gray
  Expect: Each step transitions correctly, UI updates fully

T8.2 [P] Full flow: search → navigate → tag → filter
  Steps: Search "auth" → click result → add tag "security" → go to overview
         → filter by "security" tag
  Expect: Tagged session appears in filtered view

T8.3 [P] Full flow: rename → sidebar update → overview update
  Steps: Open session → rename → go back to overview
  Expect: New name shown in both sidebar and overview cards

T8.4 [P] Full flow: CLAUDE.md edit → save → reload → verify
  Steps: Open CLAUDE.md → edit → save → switch to Preview → verify rendered content

T8.5 [P] Full flow: file tree → preview → navigate away → return
  Steps: Click project → browse tree → click file → click a session → click project again
  Expect: Tree state preserved or freshly loaded, preview resets

T8.6 [R] Concurrent actions: rename while polling
  Steps: Rename a session while refreshAfterAction is running
  Expect: No state corruption, rename persists

T8.7 [R] Data race: loadSessions + loadActive interleaving
  Scenario: loadSessions returns but loadActive hasn't yet
  Expect: liveStatus uses server status when activeProcesses empty

T8.8 [E] Zero sessions → create first session → refresh
  Steps: Start with empty ~/.claude/projects/ → use Claude Code → refresh
  Expect: Dashboard transitions from empty state to showing the new session

T8.9 [E] Delete last session in project
  Steps: Delete the only session in a project
  Expect: Project group disappears from sidebar and overview

T8.10 [P] Cost accuracy across views
  Steps: Check cost in overview card → open detail → check cost there → check cost dashboard
  Expect: All three show consistent cost for the same session

T8.11 [S] Attempt to browse /etc via file tree
  Steps: Somehow craft a URL to /api/filetree?path=/etc
  Expect: 403 blocked by isPathAllowed

T8.12 [P] Multi-model session cost
  Setup: Session that switches from Sonnet to Opus mid-conversation
  Expect: Cost calculated using the appropriate model for each message's token usage
  Note: Currently uses last-seen model for entire session — this is a known simplification

T8.13 [E] Session with 0 user messages
  Setup: Session file with only system/assistant entries
  Expect: Shows in dashboard, firstUserMessage=null, title falls back to lastPrompt or "(empty)"

T8.14 [P] Sidebar refresh on first loadActive
  Scenario: Initial render with stale session status → loadActive detects processes
  Expect: Sidebar re-renders with correct green/gray dots
```

---

## Part IV: Known Limitations & Accepted Trade-offs

| Area | Limitation | Impact |
|------|-----------|--------|
| **Cost model** | Per-session cost uses last-seen model for all tokens (not per-message) | Minor overestimate for sessions that switch from Opus to Sonnet |
| **Platform** | Terminal focus/resume/Finder integration is macOS-only | Linux users must use CLI resume manually |
| **Search** | Full-text search requires loading all messages into memory | Slow for very large session histories |
| **Status** | Time-based status (active < 5min) can be wrong if process is paused | liveStatus override via activeProcesses compensates |
| **File preview** | No actual syntax highlighting, only language class labels | Basic readability without a highlighting library |
| **Concurrency** | Notes file has no locking mechanism | Concurrent ccdash instances could conflict |
| **Binary detection** | Only checks for null bytes in first 8KB | May misidentify some binary formats without null bytes |

---

## Part V: Maintenance Checklist

When modifying ccdash, verify these invariants:

1. **Zero dependencies** — Never add `node_modules` entries. All imports must be `node:*` built-in.
2. **Read-only Claude data** — Never write to `~/.claude/`. Only read JSONL and session JSON files.
3. **View switching completeness** — When adding a new view, update `switchView()`, `showSession()`, `showCosts()`, `showProjectFolder()`, and `showClaudeMd()` to hide it.
4. **Cache invalidation** — After any POST mutation (notes, tags, rename, delete), set `_cache = null`.
5. **Path validation** — Any new file-access endpoint must use `isPathAllowed()`.
6. **PID validation** — Any new process-control endpoint must use `sanitizePid()` + `isClaudeProcess()`.
7. **Session ID validation** — Any endpoint accepting session IDs must validate format and minimum length.
8. **Active status accuracy** — `liveStatus()` must never downgrade server-reported 'active' when activeProcesses hasn't loaded yet.
9. **Atomic writes** — All disk writes to user metadata must use tmp+rename pattern.
10. **CORS** — All `sendJSON` responses must include correct `Access-Control-Allow-Origin`.
