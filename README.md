# ccdash — Claude Code Dashboard

A lightweight, zero-dependency web dashboard for browsing, managing, and analyzing [Claude Code](https://claude.ai/code) sessions.

Built with native Node.js (>=18) — no Express, no React, no build step. Just `node src/cli.js` and go.

## Features

### Web Dashboard
- **Session Overview** — Browse all sessions grouped by project or tag, with status indicators, token counts, and cost estimates
- **Session Detail** — Full conversation viewer with markdown rendering, tool usage breakdown, token/cost analysis
- **Cost Dashboard** — Aggregated cost reports by period (today/week/month/all), by project, by day, with bar and pie charts
- **Active Process Monitor** — Real-time view of running Claude Code processes with focus/kill controls
- **Full-Text Search** — Search across message content, folder paths, tags, titles, notes, and descriptions
- **Session Management** — Resume sessions in Terminal, rename/alias sessions, add notes & tags, delete sessions
- **Project File Browser** — Browse project directories with Finder integration (macOS)

### CLI
- `ccdash` — Launch web dashboard (auto-opens browser)
- `ccdash cli` — Session list in terminal
- `ccdash show <id>` — Session details & conversation preview
- `ccdash resume <id>` — Resume a session (spawns `claude --resume`)
- `ccdash cost [period]` — Cost report (today/week/month/all)
- `ccdash search <keyword>` — Search session content
- `ccdash active` — List active Claude processes
- `ccdash serve [port]` — Start dashboard on custom port (default: 3456)

### Organization
- **Tags** — Color-coded tags with deterministic hashing, filter/group sessions by tag
- **Notes** — Free-text notes per session
- **Rename** — Custom display names for sessions (inline editing)
- **Group By** — Switch between project-based and tag-based grouping

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
```

**Zero dependencies.** No `node_modules`, no `package-lock.json`. Everything uses Node.js built-in modules (`http`, `fs`, `child_process`, `path`, `os`).

## Quick Start

```bash
# Clone and run
git clone <repo-url> ccdash
cd ccdash
node src/cli.js

# Or install globally
npm install -g .
ccdash
```

The dashboard opens at `http://localhost:3456`.

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
| POST | `/api/focus` | Focus Terminal tab (macOS) |
| POST | `/api/kill` | Kill active session process |
| POST | `/api/delete-session` | Delete session JSONL file |
| POST | `/api/open-finder` | Reveal in Finder (macOS) |

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
