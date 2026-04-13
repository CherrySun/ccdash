# ccdash — Claude Code Dashboard

A lightweight, zero-dependency web dashboard for browsing, managing, and analyzing [Claude Code](https://claude.ai/code) sessions.

Built with native Node.js (>=18) — no Express, no React, no build step. Just run and go.

---

## Screenshots

### Sessions Overview
> Browse all sessions grouped by project, with status badges, token counts, and cost estimates.

```
┌──────────────────────────────────────────────────────────────────────┐
│  ccdash                              [ Sessions ]  [ 💰 Costs ]     │
│                                                                      │
│  Group: [By Project ▾]   Filter: [all] [backend] [refactor] [docs]  │
│                                                                      │
│  📁 ~/projects/my-api  (5 sessions)                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐                    │
│  │ 🟢 Add auth middleware│  │ ⚪ Fix rate limiter  │                   │
│  │ 12 turns · $0.42     │  │ 8 turns · $0.18     │                   │
│  │ claude-sonnet-4      │  │ claude-sonnet-4      │                   │
│  │ 🏷 backend           │  │ 🏷 bugfix            │                   │
│  └─────────────────────┘  └─────────────────────┘                    │
│                                                                      │
│  📁 ~/projects/docs-site  (3 sessions)                               │
│  ┌─────────────────────┐  ┌─────────────────────┐                    │
│  │ ⚪ Rewrite landing pg│  │ ⚪ Add search feature│                   │
│  │ 22 turns · $1.05     │  │ 6 turns · $0.09     │                   │
│  └─────────────────────┘  └─────────────────────┘                    │
└──────────────────────────────────────────────────────────────────────┘
```

### Session Detail
> Full conversation viewer with tool usage breakdown and token/cost analysis.

```
┌──────────────────────────────────────────────────────────────────────┐
│  ← Back                                                              │
│                                                                      │
│  Add auth middleware                          🟢 ACTIVE  a1b2c3d4    │
│  [Resume] [Focus] [Kill] [Delete]                                    │
│                                                                      │
│  ┌─ Session Info ──────────────┐  ┌─ Token Usage & Cost ──────────┐  │
│  │ Project  ~/projects/my-api  │  │ Input     12,450 tk    $0.037 │  │
│  │ Model    claude-sonnet-4    │  │ Output     3,820 tk    $0.057 │  │
│  │ Turns    12 (6u / 6a)       │  │ Cache R  145,200 tk    $0.044 │  │
│  │ Started  Apr 8, 2:30 PM     │  │ Cache W   28,100 tk    $0.105 │  │
│  │ Tools    Read, Edit, Bash   │  │ ─────────────────────────     │  │
│  └─────────────────────────────┘  │ Total              $0.243     │  │
│                                   └───────────────────────────────┘  │
│  ┌─ Tool Usage ────────────────────────────────────────────────────┐ │
│  │ Read   ████████████████  16                                     │ │
│  │ Edit   ██████████  10                                           │ │
│  │ Bash   ██████  6                                                │ │
│  │ Grep   ████  4                                                  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─ Conversation ──────────────────────────────────────────────────┐ │
│  │ 🟢 You: Add JWT auth middleware to the Express routes...        │ │
│  │ 🔵 Claude: I'll implement JWT authentication middleware...      │ │
│  │    → tools: Read, Edit, Bash                                    │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Cost Dashboard
> Aggregated cost reports with bar charts, pie charts, and per-project breakdowns.

```
┌──────────────────────────────────────────────────────────────────────┐
│  ccdash                              [ Sessions ]  [ 💰 Costs ]     │
│                                                                      │
│  Period: [Today] [Week] [Month] [All]                                │
│                                                                      │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐            │
│  │ $12.47 │ │ 2.1M   │ │ $2.83  │ │ $6.15  │ │ $3.49  │            │
│  │  Total │ │ Tokens │ │ Input  │ │ Output │ │ Cache  │            │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘            │
│                                                                      │
│  Daily Cost Trend                    Cost by Project                  │
│  ┌────────────────────────┐         ┌──────────────────┐            │
│  │     ██                 │         │    ╭──────╮       │            │
│  │     ██  ██             │         │   ╱ my-api ╲      │            │
│  │  ██ ██  ██ ██          │         │  │  42.3%   │     │            │
│  │  ██ ██  ██ ██ ██       │         │   ╲ docs  ╱      │            │
│  │  ██ ██  ██ ██ ██ ██    │         │    ╰──────╯       │            │
│  │  M  T   W  T  F  S    │         └──────────────────┘            │
│  └────────────────────────┘                                          │
│                                                                      │
│  Top Sessions by Cost                                                │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  #  Session       Project        Model        In    Out  Total │ │
│  │  1  a1b2c3d4  ~/my-api     sonnet-4     $0.12 $0.85  $1.05 │ │
│  │  2  e5f6g7h8  ~/docs-site  sonnet-4     $0.08 $0.62  $0.74 │ │
│  │  3  i9j0k1l2  ~/my-api     opus-4       $0.45 $2.10  $2.67 │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## How to Use

### Install

```bash
# Option 1: Clone and run directly
git clone https://github.com/user/ccdash.git
cd ccdash
node src/cli.js

# Option 2: Install globally via npm
npm install -g .
ccdash
```

The dashboard opens automatically at **http://localhost:3456**.

### Web Dashboard

| Action | How |
|--------|-----|
| **Browse sessions** | Open `ccdash` — sessions are grouped by project |
| **View session detail** | Click any session card |
| **Track costs** | Click the **Costs** tab, select a time period |
| **Search everything** | Use the search bar — searches messages, paths, tags, notes |
| **Resume a session** | Click **Resume** in session detail → opens `claude --resume` in Terminal |
| **Send a prompt** | Type a prompt in session detail → resumes session with your message in Terminal |
| **Organize with tags** | Click **+ Tag** on any session, filter by tag chips at the top |
| **Add notes** | Click the notes area in session detail, type and save |
| **Preview files** | Click any file in the project file tree to see syntax-highlighted preview |
| **Edit CLAUDE.md** | Click the CLAUDE.md tab in sidebar to view/edit with live preview |
| **Monitor active sessions** | Active sessions show a 🟢 badge; use **Focus** / **Kill** buttons |

### CLI Commands

```bash
ccdash                     # Open web dashboard (default)
ccdash cli                 # Session list in terminal
ccdash show <id>           # Session details & conversation preview
ccdash resume <id>         # Resume session (spawns claude --resume)
ccdash cost [period]       # Cost report: today / week / month / all
ccdash search <keyword>    # Search across all session content
ccdash active              # List running Claude Code processes
ccdash serve [port]        # Start dashboard on custom port
ccdash help                # Show help
```

> **Tip:** Session IDs can be abbreviated — just use the first 8 characters.

---

## Features

### Web Dashboard
- **Session Overview** — Browse all sessions grouped by project or tag, with status indicators, token counts, and cost estimates
- **Session Detail** — Full conversation viewer with markdown rendering, tool usage breakdown, token/cost analysis
- **Cost Dashboard** — Aggregated cost reports by period (today/week/month/all), by project, by day, with bar and pie charts
- **Active Process Monitor** — Real-time view of running Claude Code processes with focus/kill controls
- **Full-Text Search** — Search across message content, folder paths, tags, titles, notes, and descriptions
- **Session Management** — Resume sessions in Terminal, rename/alias sessions, add notes & tags, delete sessions
- **Prompt Input** — Send a prompt to resume a session directly from the dashboard, opens in a new Terminal tab
- **Project File Browser** — Browse project directories with inline file preview (syntax-highlighted, line numbers)
- **CLAUDE.md Editor** — View and edit `~/.claude/CLAUDE.md` with live preview and markdown rendering

### Organization
- **Tags** — Color-coded tags with deterministic hashing, filter/group sessions by tag
- **Notes** — Free-text notes per session
- **Rename** — Custom display names for sessions (inline editing)
- **Group By** — Switch between project-based and tag-based grouping

### UX & Feedback
- **Resume Feedback** — Toast notifications on resume success/failure, with warning styling for errors
- **Loading States** — Button spinner animations during async operations (resume, kill, send prompt)
- **Live Status** — Active session status dots refresh automatically after actions

## Architecture

```
~/.claude/projects/       ← Claude Code session data (read-only)
~/.ccdash/notes.json      ← ccdash user metadata (notes, tags, renames)

src/
├── cli.js                ← CLI entry point & commands
├── server.js             ← Native HTTP server & REST API
├── dashboard.js          ← Single-file HTML/CSS/JS dashboard
├── scanner.js            ← Session JSONL parser & process detector
├── pricing.js            ← Token cost calculator (Sonnet/Opus pricing)
└── notes.js              ← Notes/tags/rename storage manager

SPEC.md                   ← Product specification & verification test plan
```

**Zero dependencies.** No `node_modules`, no `package-lock.json`. Everything uses Node.js built-in modules (`http`, `fs`, `child_process`, `path`, `os`).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions` | All sessions with metadata |
| GET | `/api/session/:id` | Full session with messages |
| GET | `/api/active` | Active Claude processes |
| GET | `/api/costs?period=` | Cost aggregation |
| GET | `/api/search?q=` | Full-text search |
| GET | `/api/tags` | All available tags |
| GET | `/api/filetree?path=` | Directory listing |
| POST | `/api/notes` | Set session note |
| POST | `/api/tags` | Add/remove tag |
| POST | `/api/rename` | Set session display name |
| POST | `/api/refresh` | Force cache refresh |
| POST | `/api/resume` | Resume session in Terminal |
| POST | `/api/send-prompt` | Resume session with a prompt in Terminal |
| POST | `/api/focus` | Focus Terminal tab (macOS) |
| POST | `/api/kill` | Kill active session process |
| POST | `/api/delete-session` | Delete session JSONL file |
| POST | `/api/open-finder` | Reveal in Finder (macOS) |
| GET | `/api/file-content` | Read file content for preview |
| GET | `/api/claude-md` | Read ~/.claude/CLAUDE.md |
| POST | `/api/claude-md` | Write to ~/.claude/CLAUDE.md |

## Cost Calculation

Pricing is based on published Anthropic API rates (per million tokens):

| Model | Input | Output | Cache Read | Cache Write |
|-------|-------|--------|------------|-------------|
| Sonnet 4 | $3.00 | $15.00 | $0.30 | $3.75 |
| Opus 4 | $15.00 | $75.00 | $1.50 | $18.75 |

Unknown models default to Opus pricing. Costs are estimates — actual billing may vary based on your plan.

## Platform Notes

- **macOS** — Full feature support (Terminal focus/resume, Finder integration)
- **Linux** — Core features work; Terminal/Finder integrations are macOS-only
- **Windows** — Not tested; session scanning should work, platform integrations won't

## Data Safety

- ccdash **never writes** to `~/.claude/` — all Claude Code data is read-only
- User metadata (notes, tags, renames) are stored separately in `~/.ccdash/notes.json`
- Deleting a session removes its JSONL file from `~/.claude/` (requires explicit confirmation)

## License

MIT
