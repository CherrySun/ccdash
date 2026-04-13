/**
 * dashboard.js - Single-file HTML Dashboard
 *
 * Returns the complete HTML with inline CSS and JS.
 * Modern dark theme, polished layout, no frameworks.
 */

export function getDashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ccdash — Claude Code Dashboard</title>
<style>
/* ─── Reset & Base ─── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg-primary: #0a0e14;
  --bg-secondary: #111820;
  --bg-tertiary: #1a2130;
  --bg-hover: #1e2a3a;
  --bg-card: #131a24;
  --border: #1e2a3a;
  --border-light: #2a3a4e;
  --text-primary: #e4ecf5;
  --text-secondary: #8899aa;
  --text-muted: #556677;
  --accent: #6cb6ff;
  --accent-dim: #2558a8;
  --accent-glow: rgba(108, 182, 255, 0.12);
  --green: #56d364;
  --green-dim: #1a7a2e;
  --green-glow: rgba(86, 211, 100, 0.1);
  --yellow: #e3b341;
  --yellow-dim: #5c4a14;
  --red: #f47067;
  --purple: #d2a8ff;
  --orange: #f0883e;
  --cyan: #76e3ea;
  --pink: #f778ba;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --sidebar-width: 340px;
  --radius: 10px;
  --radius-sm: 6px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 30px rgba(0,0,0,0.5);
  --transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
body {
  font-family: var(--font-sans);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.6;
  overflow: hidden;
  height: 100vh;
  -webkit-font-smoothing: antialiased;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

/* ─── Scrollbar ─── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-light); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

/* ─── Layout ─── */
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* ─── Top Bar ─── */
#status-bar {
  background: linear-gradient(180deg, var(--bg-secondary) 0%, rgba(17,24,32,0.95) 100%);
  border-bottom: 1px solid var(--border);
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  height: 52px;
  flex-shrink: 0;
  backdrop-filter: blur(12px);
  z-index: 10;
}
.logo {
  font-weight: 800;
  font-size: 16px;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--accent), var(--cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  user-select: none;
}
.logo-sub {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 400;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--border);
}
#active-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

#main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ─── Search ─── */
.search-wrapper {
  flex: 1;
  max-width: 420px;
  position: relative;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 13px;
  pointer-events: none;
}
#search-box {
  width: 100%;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 7px 12px 7px 34px;
  color: var(--text-primary);
  font-size: 13px;
  font-family: var(--font-sans);
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
}
#search-box:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
#search-box::placeholder { color: var(--text-muted); }
.search-shortcut {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: var(--text-muted);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  padding: 1px 5px;
  border-radius: 4px;
  font-family: var(--font-mono);
  pointer-events: none;
}

/* ─── Nav Tabs ─── */
.nav-tabs {
  display: flex;
  gap: 2px;
  margin-left: auto;
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 3px;
}
.nav-tab {
  padding: 5px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  border: none;
  background: none;
  font-family: var(--font-sans);
  transition: all var(--transition);
  white-space: nowrap;
}
.nav-tab:hover { color: var(--text-primary); background: var(--bg-tertiary); }
.nav-tab.active {
  background: var(--accent-dim);
  color: #fff;
  box-shadow: var(--shadow-sm);
}
.btn-refresh {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  transition: all var(--transition);
}
.btn-refresh:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-glow);
}
.btn-refresh:active { transform: scale(0.95); }
.btn-refresh.spinning { animation: spin 0.6s linear; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* ─── Sidebar ─── */
#sidebar {
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}
.sidebar-header {
  padding: 14px 20px;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 1px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sidebar-header .count {
  background: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}
#sidebar-list {
  overflow-y: auto;
  flex: 1;
}
.project-group {
  border-bottom: 1px solid var(--border);
}
.project-header {
  padding: 10px 20px;
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  background: rgba(108,182,255,0.03);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
  transition: background var(--transition);
}
.project-header:hover { background: rgba(108,182,255,0.07); }
.project-header .arrow {
  transition: transform var(--transition);
  font-size: 10px;
  color: var(--text-muted);
}
.project-header.collapsed .arrow { transform: rotate(-90deg); }
.project-header .path {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.project-header .badge {
  background: var(--bg-tertiary);
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 10px;
  color: var(--text-muted);
  font-weight: 600;
}

/* ─── Session Items ─── */
.session-item {
  padding: 10px 20px 10px 32px;
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: all var(--transition);
  position: relative;
}
.session-item:hover {
  background: var(--bg-hover);
}
.session-item.selected {
  background: var(--accent-glow);
  border-left-color: var(--accent);
}
.session-item .session-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.session-item .session-status-icon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.session-item .session-status-icon.active {
  background: var(--green);
  box-shadow: 0 0 6px var(--green);
  animation: pulse 2s infinite;
}
.session-item .session-status-icon.recent {
  background: var(--yellow);
  box-shadow: 0 0 4px rgba(227,179,65,0.4);
}
.session-item .session-status-icon.completed {
  background: var(--text-muted);
  opacity: 0.5;
}
.session-item .session-title {
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 450;
  line-height: 1.4;
  flex: 1;
  min-width: 0;
}
.session-item .session-meta {
  font-size: 11px;
  color: var(--text-muted);
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 3px;
  padding-left: 16px;
}

/* ─── Status Badges ─── */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.status-badge.active {
  background: var(--green-glow);
  color: var(--green);
  border: 1px solid rgba(86,211,100,0.2);
}
.status-badge.active::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--green);
  animation: pulse 2s infinite;
}
.status-badge.recent {
  background: rgba(227,179,65,0.1);
  color: var(--yellow);
  border: 1px solid rgba(227,179,65,0.2);
}
.status-badge.completed {
  background: var(--bg-tertiary);
  color: var(--text-muted);
  border: 1px solid var(--border);
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.tag-badge {
  display: inline-flex;
  align-items: center;
  padding: 0 7px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  background: rgba(210,168,255,0.1);
  color: var(--purple);
  border: 1px solid rgba(210,168,255,0.15);
}
/* ─── Group-By Tabs ─── */
.group-tabs {
  display: inline-flex;
  gap: 2px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 2px;
  border: 1px solid var(--border);
}
.group-tab {
  padding: 4px 14px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--transition);
}
.group-tab:hover {
  color: var(--text-secondary);
  background: rgba(255,255,255,0.04);
}
.group-tab.active {
  color: var(--text-primary);
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
}
.filter-tag-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}
.filter-tag-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
  border: 1px solid var(--border);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}
.filter-tag-chip:hover {
  border-color: var(--border-light);
}
.filter-tag-chip.active {
  box-shadow: var(--shadow-sm);
}

/* ─── Content Area ─── */
#content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  background: var(--bg-primary);
}

/* ─── Status Indicators ─── */
.status-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.status-dot.active {
  background: var(--green);
  box-shadow: 0 0 8px var(--green);
  animation: pulse 2s infinite;
}
.status-dot.inactive { background: var(--text-muted); }
.status-info { color: var(--text-secondary); font-size: 13px; }
.status-info strong { color: var(--text-primary); font-weight: 600; }

/* ─── Cards ─── */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
  transition: border-color var(--transition);
}
.card:hover { border-color: var(--border-light); }
.card-header {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-header-icon {
  font-size: 14px;
}

/* ─── Stat Grid ─── */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.stat-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  text-align: center;
  transition: all var(--transition);
}
.stat-card:hover {
  border-color: var(--border-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--green);
  font-family: var(--font-mono);
  letter-spacing: -0.5px;
}
.stat-label {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-top: 6px;
  font-weight: 600;
}
.stat-sub {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
  font-family: var(--font-mono);
}

/* ─── Session Detail ─── */
.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.detail-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  flex: 1;
  min-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.detail-id {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  letter-spacing: 0.3px;
}
.detail-actions {
  display: flex;
  gap: 8px;
}
.btn {
  padding: 7px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid var(--border);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-family: var(--font-sans);
  transition: all var(--transition);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn:hover {
  border-color: var(--accent);
  background: var(--accent-glow);
}
.btn:active { transform: scale(0.97); }
.btn-primary {
  background: var(--accent-dim);
  border-color: var(--accent-dim);
  color: #fff;
}
.btn-primary:hover {
  background: var(--accent);
  border-color: var(--accent);
}
.btn-green {
  background: var(--green-dim);
  border-color: rgba(86,211,100,0.3);
  color: var(--green);
}
.btn-green:hover {
  background: rgba(86,211,100,0.25);
  border-color: var(--green);
  color: #fff;
}
.btn-orange {
  background: rgba(240,136,62,0.12);
  border-color: rgba(240,136,62,0.25);
  color: var(--orange);
}
.btn-orange:hover {
  background: rgba(240,136,62,0.25);
  border-color: var(--orange);
  color: #fff;
}
.btn-red {
  background: rgba(244,112,103,0.12);
  border-color: rgba(244,112,103,0.25);
  color: var(--red);
}
.btn-red:hover {
  background: rgba(244,112,103,0.25);
  border-color: var(--red);
  color: #fff;
}

.btn.loading {
  pointer-events: none;
  opacity: 0.6;
}
.btn.loading::after {
  content: '';
  width: 12px; height: 12px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: btn-spin 0.6s linear infinite;
  margin-left: 4px;
}
@keyframes btn-spin {
  to { transform: rotate(360deg); }
}

/* ─── Prompt Input ─── */
.prompt-card { position: relative; }
.prompt-input-wrap {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}
.prompt-input {
  flex: 1;
  min-height: 60px;
  max-height: 160px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 13px;
  resize: vertical;
  outline: none;
  transition: border-color var(--transition);
}
.prompt-input:focus {
  border-color: var(--accent);
}
.prompt-input::placeholder {
  color: var(--text-muted);
}
.prompt-send-btn {
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid var(--accent-dim);
  background: var(--accent-dim);
  color: #fff;
  font-family: var(--font-sans);
  transition: all var(--transition);
  white-space: nowrap;
}
.prompt-send-btn:hover {
  background: var(--accent);
  border-color: var(--accent);
}
.prompt-send-btn:disabled {
  opacity: 0.5;
  pointer-events: none;
}
.prompt-hint {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
}

/* ─── Info Grid ─── */
.info-grid {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 8px 16px;
  font-size: 13px;
}
.info-label {
  color: var(--text-muted);
  font-weight: 500;
}
.info-value {
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 12px;
}

/* ─── Tool Chips ─── */
.tool-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 10px 0;
}
.tool-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 500;
  background: rgba(118,227,234,0.08);
  color: var(--cyan);
  border: 1px solid rgba(118,227,234,0.15);
  transition: all var(--transition);
}
.tool-chip:hover {
  background: rgba(118,227,234,0.15);
  border-color: rgba(118,227,234,0.3);
}
.tool-chip .count {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 10px;
}

/* ─── Conversation ─── */
.conversation {
  margin-top: 8px;
}
.msg {
  padding: 14px 18px;
  border-radius: var(--radius);
  margin-bottom: 10px;
  font-size: 13px;
  line-height: 1.7;
  max-width: 100%;
  overflow-x: auto;
  transition: box-shadow var(--transition);
}
.msg:hover { box-shadow: var(--shadow-sm); }
.msg.user {
  background: rgba(86,211,100,0.04);
  border: 1px solid rgba(86,211,100,0.1);
  border-left: 3px solid var(--green);
}
.msg.assistant {
  background: rgba(108,182,255,0.04);
  border: 1px solid rgba(108,182,255,0.08);
  border-left: 3px solid var(--accent);
}
.msg-header {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.msg-role {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 10px;
}
.msg-role.user { color: var(--green); }
.msg-role.assistant { color: var(--accent); }
.msg-content {
  white-space: pre-wrap;
  word-break: break-word;
}
.msg-content code {
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 12px;
  border: 1px solid var(--border);
}
.msg-content pre {
  background: var(--bg-primary);
  padding: 14px 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 10px 0;
  border: 1px solid var(--border);
  font-size: 12px;
}
.msg-content pre code {
  background: none;
  padding: 0;
  border: none;
}
.msg-tools {
  margin-top: 8px;
  font-size: 11px;
  color: var(--text-muted);
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 4px;
}
.msg-usage {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
  font-family: var(--font-mono);
}

/* ─── Cost View ─── */
.chart-container {
  position: relative;
  height: 200px;
  margin: 16px 0;
  background: var(--bg-primary);
  border-radius: var(--radius);
  padding: 20px 16px 30px;
  overflow: hidden;
  border: 1px solid var(--border);
}
.chart-bar {
  position: absolute;
  bottom: 30px;
  background: linear-gradient(180deg, var(--accent) 0%, var(--accent-dim) 100%);
  border-radius: 4px 4px 0 0;
  min-width: 14px;
  transition: height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
  opacity: 0.85;
}
.chart-bar:hover {
  opacity: 1;
  filter: brightness(1.2);
  box-shadow: 0 0 12px var(--accent-glow);
}
.chart-label {
  position: absolute;
  bottom: 8px;
  font-size: 9px;
  color: var(--text-muted);
  transform: rotate(-45deg);
  transform-origin: top left;
  white-space: nowrap;
  font-family: var(--font-mono);
}
.chart-value {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  color: var(--text-secondary);
  white-space: nowrap;
  font-family: var(--font-mono);
  font-weight: 600;
}
.pie-container {
  display: flex;
  align-items: center;
  gap: 32px;
  margin: 16px 0;
  padding: 8px;
}
.pie-svg { flex-shrink: 0; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3)); }
.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pie-legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}
.pie-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}
.pie-legend-cost {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 11px;
}
.period-tabs {
  display: flex;
  gap: 2px;
  margin-bottom: 20px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 3px;
  width: fit-content;
}
.period-tab {
  padding: 5px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  border: none;
  background: none;
  color: var(--text-muted);
  font-family: var(--font-sans);
  transition: all var(--transition);
}
.period-tab:hover { color: var(--text-primary); }
.period-tab.active {
  background: var(--accent-dim);
  color: #fff;
  box-shadow: var(--shadow-sm);
}

/* ─── Cost Table ─── */
.cost-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin-top: 12px;
}
.cost-table th {
  text-align: left;
  padding: 8px 12px;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border-bottom: 1px solid var(--border);
}
.cost-table th.right { text-align: right; }
.cost-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  transition: background var(--transition);
}
.cost-table tr:hover td { background: var(--bg-hover); }
.cost-table tr { cursor: pointer; }
.cost-table .mono {
  font-family: var(--font-mono);
  font-size: 12px;
}
.cost-table .cost-val {
  color: var(--green);
  font-weight: 600;
  font-family: var(--font-mono);
  font-size: 12px;
}

/* ─── Notes & Tags ─── */
.note-input {
  width: 100%;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  color: var(--text-primary);
  font-size: 13px;
  resize: vertical;
  min-height: 64px;
  outline: none;
  font-family: var(--font-sans);
  transition: border-color var(--transition), box-shadow var(--transition);
}
.note-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
.tags-input {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 10px;
}
.tag-input-field {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 4px 12px;
  color: var(--text-primary);
  font-size: 12px;
  outline: none;
  width: 110px;
  font-family: var(--font-sans);
  transition: border-color var(--transition);
}
.tag-input-field:focus { border-color: var(--purple); }
.tag-remove {
  cursor: pointer;
  margin-left: 4px;
  opacity: 0.5;
  transition: opacity var(--transition);
}
.tag-remove:hover { opacity: 1; }

/* ─── Search Results ─── */
.search-result {
  padding: 14px 16px;
  border-radius: var(--radius);
  background: var(--bg-card);
  border: 1px solid var(--border);
  margin-bottom: 10px;
  cursor: pointer;
  transition: all var(--transition);
}
.search-result:hover {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent-glow);
  transform: translateY(-1px);
}
.search-highlight {
  background: rgba(227,179,65,0.3);
  color: var(--yellow);
  padding: 0 3px;
  border-radius: 3px;
  font-weight: 600;
}
.meta-match-label {
  display: inline-block;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 1px 5px;
  border-radius: 3px;
  margin-right: 6px;
  flex-shrink: 0;
}
.meta-match-label.folder { background: rgba(108,182,255,0.15); color: #6cb6ff; }
.meta-match-label.tag { background: rgba(188,143,243,0.15); color: #bc8ff3; }
.meta-match-label.title { background: rgba(227,179,65,0.15); color: #e3b341; }
.meta-match-label.description { background: rgba(86,211,100,0.15); color: #56d364; }
.meta-match-label.note { background: rgba(219,171,127,0.15); color: #dbab7f; }
.search-result-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ─── Custom Modal ─── */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.modal-overlay.show { opacity: 1; }
.modal-box {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 28px 32px 24px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  transform: scale(0.92) translateY(10px);
  transition: transform 0.2s ease;
}
.modal-overlay.show .modal-box { transform: scale(1) translateY(0); }
.modal-icon {
  font-size: 32px;
  margin-bottom: 12px;
  text-align: center;
}
.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  text-align: center;
}
.modal-message {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  text-align: center;
  margin-bottom: 22px;
}
.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
.modal-btn {
  padding: 8px 20px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
}
.modal-btn:hover { background: var(--bg-hover); }
.modal-btn.danger {
  background: rgba(248,81,73,0.15);
  color: var(--red);
  border-color: rgba(248,81,73,0.3);
}
.modal-btn.danger:hover {
  background: rgba(248,81,73,0.25);
}

/* ─── Welcome / Empty ─── */
.empty-state {
  text-align: center;
  padding: 60px 40px;
  color: var(--text-muted);
}
.welcome-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}
.welcome-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.welcome-sub {
  font-size: 14px;
  color: var(--text-muted);
  max-width: 360px;
  margin: 0 auto;
  line-height: 1.6;
}
.welcome-shortcuts {
  margin-top: 24px;
  display: inline-flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  font-size: 12px;
  color: var(--text-muted);
}
.welcome-shortcuts kbd {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-secondary);
}

/* ─── Sessions Overview ─── */
#sessions-overview {
  padding-bottom: 32px;
}
.overview-project-group {
  margin-bottom: 28px;
}
.overview-project-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.overview-project-path {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.overview-project-count {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}
.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}
.overview-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
  cursor: pointer;
  transition: all var(--transition);
  position: relative;
  overflow: hidden;
}
.overview-card:hover {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent-glow);
  transform: translateY(-1px);
}
.overview-card .oc-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.overview-card .oc-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.overview-card .oc-status.active {
  background: var(--green);
  box-shadow: 0 0 6px var(--green);
  animation: pulse 2s infinite;
}
.overview-card .oc-status.recent {
  background: var(--yellow);
  box-shadow: 0 0 4px rgba(227,179,65,0.4);
}
.overview-card .oc-status.completed {
  background: var(--text-muted);
  opacity: 0.5;
}
.overview-card .oc-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.overview-card .oc-id {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-muted);
  flex-shrink: 0;
}
.overview-card .oc-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
}
.overview-card .oc-meta .oc-cost {
  color: var(--green);
  font-family: var(--font-mono);
  font-weight: 600;
}
.overview-card .oc-meta .oc-model {
  font-family: var(--font-mono);
  font-size: 10px;
}
.overview-card .oc-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 6px;
}

/* ─── Quick Action Buttons ─── */
.quick-actions {
  display: none;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  gap: 2px;
  align-items: center;
  z-index: 2;
}
.session-item:hover .quick-actions,
.overview-card:hover .quick-actions {
  display: flex;
}
.quick-actions .qa-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all var(--transition);
  padding: 0;
  line-height: 1;
  position: relative;
}
.quick-actions .qa-btn::after {
  content: attr(data-tip);
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 10px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 5px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-md);
  z-index: 10;
}
.quick-actions .qa-btn:hover::after {
  opacity: 1;
}
.quick-actions .qa-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-light);
}
.quick-actions .qa-btn.qa-focus:hover { color: var(--green); border-color: var(--green); }
.quick-actions .qa-btn.qa-kill:hover { color: var(--red); border-color: var(--red); }
.quick-actions .qa-btn.qa-resume:hover { color: var(--orange); border-color: var(--orange); }
.quick-actions .qa-btn.qa-rename:hover { color: var(--purple); border-color: var(--purple); }
.quick-actions .qa-btn.qa-delete:hover { color: var(--red); border-color: var(--red); }

/* ─── Folder Tree View ─── */
#folder-view {
  padding-bottom: 32px;
}
.folder-view-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.folder-view-path {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent);
  font-family: var(--font-mono);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.folder-view-open {
  margin-left: auto;
}
.tree-container {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 8px 0;
  overflow: hidden;
}
.tree-node {
  position: relative;
}
.tree-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 16px;
  cursor: pointer;
  transition: background var(--transition);
  position: relative;
  user-select: none;
}
.tree-row:hover {
  background: var(--bg-hover);
}
.tree-indent {
  display: inline-block;
  width: 20px;
  flex-shrink: 0;
}
.tree-arrow {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--text-muted);
  flex-shrink: 0;
  transition: transform var(--transition);
}
.tree-arrow.collapsed {
  transform: rotate(-90deg);
}
.tree-arrow.file-spacer {
  visibility: hidden;
}
.tree-icon {
  font-size: 14px;
  flex-shrink: 0;
  width: 18px;
  text-align: center;
}
.tree-name {
  font-size: 13px;
  color: var(--text-primary);
  font-family: var(--font-sans);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tree-name.dir {
  font-weight: 500;
  color: var(--accent);
}
.tree-finder-btn {
  display: none;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-muted);
  cursor: pointer;
  font-size: 11px;
  transition: all var(--transition);
  white-space: nowrap;
  flex-shrink: 0;
}
.tree-row:hover .tree-finder-btn {
  display: inline-flex;
}
.tree-finder-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-glow);
}
.tree-children {
  overflow: hidden;
}
.tree-children.collapsed {
  display: none;
}

/* ─── File Preview Panel ─── */
.folder-layout {
  display: flex;
  gap: 16px;
  min-height: 400px;
}
.folder-tree-pane {
  flex: 0 0 45%;
  min-width: 0;
  overflow: auto;
}
.folder-preview-pane {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.file-preview-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.file-preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
  flex-shrink: 0;
}
.file-preview-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: var(--font-mono);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-preview-meta {
  font-size: 11px;
  color: var(--text-muted);
  flex-shrink: 0;
}
.file-preview-body {
  flex: 1;
  overflow: auto;
  padding: 0;
  position: relative;
}
.file-preview-code {
  margin: 0;
  padding: 12px 0;
  background: transparent;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.65;
  tab-size: 2;
  counter-reset: line;
}
.file-preview-line {
  display: flex;
  padding: 0 16px 0 0;
  min-height: 20px;
}
.file-preview-line:hover {
  background: var(--bg-hover);
}
.file-preview-ln {
  display: inline-block;
  width: 48px;
  min-width: 48px;
  text-align: right;
  padding-right: 12px;
  color: var(--text-muted);
  opacity: 0.5;
  user-select: none;
  flex-shrink: 0;
}
.file-preview-content {
  flex: 1;
  white-space: pre;
  overflow-x: auto;
  min-width: 0;
}
.file-preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  gap: 8px;
  padding: 40px;
  text-align: center;
}
.file-preview-empty .icon { font-size: 32px; opacity: 0.4; }
.file-preview-empty .title { font-size: 14px; color: var(--text-secondary); }
.file-preview-empty .desc { font-size: 12px; }
.file-preview-binary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  gap: 8px;
  padding: 40px;
}
.file-preview-binary .icon { font-size: 36px; opacity: 0.5; }
.file-preview-truncated {
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border);
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
  flex-shrink: 0;
}
.tree-row.selected {
  background: var(--accent-glow);
  border-right: 2px solid var(--accent);
}
@media (max-width: 900px) {
  .folder-layout { flex-direction: column; }
  .folder-tree-pane { flex: none; max-height: 40vh; }
}

/* ─── Rename Inline ─── */
.rename-display {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.rename-display:hover .rename-edit-icon {
  opacity: 1;
}
.rename-edit-icon {
  font-size: 12px;
  color: var(--text-muted);
  opacity: 0;
  transition: opacity var(--transition);
}
.inline-rename-input {
  background: var(--bg-primary);
  border: 1px solid var(--accent);
  border-radius: 6px;
  color: var(--text-primary);
  font-family: var(--font-sans);
  outline: none;
  box-shadow: 0 0 0 3px var(--accent-glow);
  transition: box-shadow var(--transition);
}
.inline-rename-input.sidebar-rename {
  font-size: 12px;
  padding: 2px 6px;
  width: 100%;
  font-weight: 450;
}
.inline-rename-input.detail-rename {
  font-size: 18px;
  font-weight: 700;
  padding: 2px 8px;
  flex: 1;
  min-width: 200px;
}

/* ─── View Title ─── */
.view-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: -0.3px;
}

/* ─── Utility ─── */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.mb-2 { margin-bottom: 8px; }
.text-sm { font-size: 12px; }
.text-muted { color: var(--text-muted); }
.text-green { color: var(--green); }
.text-mono { font-family: var(--font-mono); }
.hidden { display: none; }
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-muted);
  gap: 8px;
}
.loading::before {
  content: '';
  width: 16px;
  height: 16px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.copy-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--bg-tertiary);
  color: var(--green);
  padding: 10px 20px;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  pointer-events: none;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--green-dim);
}
.copy-toast.show {
  opacity: 1;
  transform: translateY(0);
}

/* ─── Total Cost Highlight ─── */
.total-cost-card {
  text-align: center;
  padding: 16px;
  margin-top: 4px;
  background: linear-gradient(135deg, rgba(86,211,100,0.05) 0%, rgba(108,182,255,0.05) 100%);
  border: 1px solid rgba(86,211,100,0.15);
  border-radius: var(--radius);
}
.total-cost-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  margin-bottom: 4px;
}
.total-cost-value {
  font-size: 28px;
  font-weight: 800;
  font-family: var(--font-mono);
  color: var(--green);
  letter-spacing: -1px;
}

/* ─── CLAUDE.md Editor ─── */
.claude-md-container {
  max-width: 900px;
  margin: 0 auto;
}
.claude-md-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 12px;
}
.claude-md-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 10px;
}
.claude-md-title .icon {
  font-size: 22px;
}
.claude-md-path {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
.claude-md-actions {
  display: flex;
  gap: 8px;
}
.claude-md-tab-bar {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
  margin-bottom: 16px;
}
.claude-md-tab {
  padding: 8px 18px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all var(--transition);
  font-family: var(--font-sans);
}
.claude-md-tab:hover {
  color: var(--text-primary);
}
.claude-md-tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
.claude-md-editor {
  width: 100%;
  min-height: 500px;
  padding: 16px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.7;
  resize: vertical;
  outline: none;
  transition: border-color var(--transition);
  tab-size: 2;
}
.claude-md-editor:focus {
  border-color: var(--accent);
}
.claude-md-preview {
  padding: 20px 24px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  min-height: 500px;
  line-height: 1.8;
  overflow-y: auto;
}
.claude-md-preview h1, .claude-md-preview h2, .claude-md-preview h3 {
  color: var(--text-primary);
  margin: 20px 0 10px 0;
  font-weight: 700;
}
.claude-md-preview h1 { font-size: 22px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
.claude-md-preview h2 { font-size: 18px; border-bottom: 1px solid var(--border); padding-bottom: 6px; }
.claude-md-preview h3 { font-size: 15px; }
.claude-md-preview p { margin: 8px 0; color: var(--text-secondary); }
.claude-md-preview ul, .claude-md-preview ol { margin: 8px 0 8px 20px; color: var(--text-secondary); }
.claude-md-preview li { margin: 4px 0; }
.claude-md-preview code {
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--accent);
}
.claude-md-preview pre {
  background: var(--bg-tertiary);
  padding: 14px;
  border-radius: var(--radius-sm);
  overflow-x: auto;
  margin: 10px 0;
  border: 1px solid var(--border);
}
.claude-md-preview pre code {
  background: none;
  padding: 0;
  color: var(--text-primary);
  font-size: 12px;
}
.claude-md-preview blockquote {
  border-left: 3px solid var(--accent-dim);
  padding: 4px 16px;
  margin: 10px 0;
  color: var(--text-muted);
  background: rgba(108,182,255,0.03);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}
.claude-md-preview hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 16px 0;
}
.claude-md-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--text-muted);
  text-align: center;
  gap: 12px;
}
.claude-md-empty .icon { font-size: 40px; opacity: 0.5; }
.claude-md-empty .title { font-size: 16px; font-weight: 600; color: var(--text-secondary); }
.claude-md-empty .desc { font-size: 13px; max-width: 400px; }
.claude-md-save-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}
.claude-md-save-bar .status {
  font-size: 12px;
  color: var(--text-muted);
}
.claude-md-save-bar .status.modified {
  color: var(--yellow);
}

/* ─── Responsive ─── */
@media (max-width: 768px) {
  #sidebar { width: 100%; height: auto; max-height: 35vh; border-right: none; border-bottom: 1px solid var(--border); }
  #main { flex-direction: column; }
  .stat-grid { grid-template-columns: 1fr 1fr; }
  #content { padding: 16px; }
  .logo-sub { display: none; }
  #status-bar { padding: 0 12px; gap: 8px; }
}
</style>
</head>
<body>
<div id="app">
  <!-- Status Bar -->
  <div id="status-bar">
    <span class="logo">ccdash</span>
    <span class="logo-sub">Claude Code Session Manager</span>
    <div id="active-status"></div>
    <div class="search-wrapper">
      <span class="search-icon">⌕</span>
      <input type="text" id="search-box" placeholder="Search sessions...">
      <span class="search-shortcut">⌘K</span>
    </div>
    <div class="nav-tabs">
      <button class="nav-tab active" data-view="sessions" onclick="switchView('sessions')">Sessions</button>
      <button class="nav-tab" data-view="costs" onclick="switchView('costs')">Costs</button>
      <button class="nav-tab" data-view="claude-md" onclick="switchView('claude-md')">CLAUDE.md</button>
    </div>
    <button class="btn-refresh" onclick="refreshData()" title="Refresh data" id="refresh-btn">↻</button>
  </div>

  <div id="main">
    <!-- Sidebar -->
    <div id="sidebar">
      <div class="sidebar-header">
        <span>Projects</span>
        <span class="count" id="total-sessions">0</span>
      </div>
      <div id="sidebar-list"></div>
    </div>

    <!-- Content -->
    <div id="content">
      <div id="sessions-overview"></div>
      <div id="session-detail" class="hidden"></div>
      <div id="costs-view" class="hidden"></div>
      <div id="search-results" class="hidden"></div>
      <div id="folder-view" class="hidden"></div>
      <div id="claude-md-view" class="hidden"></div>
    </div>
  </div>
</div>

<div class="copy-toast" id="toast">Copied!</div>
<div id="modal-root"></div>

<script>
// ─── State ───
let state = {
  projects: [],
  activeProcesses: [],
  selectedSession: null,
  currentView: 'sessions',
  searchQuery: '',
  costPeriod: 'all',
  groupBy: 'folder',
  filterTag: null,
};

// ─── Tag Color Helper ───
const TAG_COLORS = [
  { color: '#6cb6ff', bg: 'rgba(108,182,255,0.12)', border: 'rgba(108,182,255,0.2)' },
  { color: '#56d364', bg: 'rgba(86,211,100,0.12)',  border: 'rgba(86,211,100,0.2)' },
  { color: '#e3b341', bg: 'rgba(227,179,65,0.12)',  border: 'rgba(227,179,65,0.2)' },
  { color: '#f47067', bg: 'rgba(244,112,103,0.12)', border: 'rgba(244,112,103,0.2)' },
  { color: '#d2a8ff', bg: 'rgba(210,168,255,0.12)', border: 'rgba(210,168,255,0.2)' },
  { color: '#f0883e', bg: 'rgba(240,136,62,0.12)',  border: 'rgba(240,136,62,0.2)' },
  { color: '#76e3ea', bg: 'rgba(118,227,234,0.12)', border: 'rgba(118,227,234,0.2)' },
  { color: '#f778ba', bg: 'rgba(247,120,186,0.12)', border: 'rgba(247,120,186,0.2)' },
  { color: '#cea5fb', bg: 'rgba(206,165,251,0.12)', border: 'rgba(206,165,251,0.2)' },
  { color: '#a5d6ff', bg: 'rgba(165,214,255,0.12)', border: 'rgba(165,214,255,0.2)' },
];
function tagColor(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = ((hash << 5) - hash + tag.charCodeAt(i)) | 0;
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}
function tagBadgeHTML(tag, removable, sessionId) {
  const tc = tagColor(tag);
  let html = '<span class="tag-badge" style="background:' + tc.bg + ';color:' + tc.color + ';border-color:' + tc.border + '">' + esc(tag);
  if (removable && sessionId) {
    html += '<span class="tag-remove" onclick="removeTag(\\'' + sessionId + '\\', \\'' + esc(tag).replace(/'/g, "\\\\'") + '\\')"> ×</span>';
  }
  html += '</span>';
  return html;
}

// ─── API ───
async function api(path, opts) {
  const res = await fetch('/api/' + path, opts);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'API request failed (' + res.status + ')');
  }
  return res.json();
}

// ─── Init ───
async function init() {
  await loadSessions();
  await loadActive();
  renderSessionsOverview();
  setInterval(loadActive, 15000);

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('search-box').focus();
    }
    if (e.key === 'Escape') {
      document.getElementById('search-box').value = '';
      hideSearchResults();
    }
  });

  let searchTimer;
  document.getElementById('search-box').addEventListener('input', e => {
    clearTimeout(searchTimer);
    const q = e.target.value.trim();
    if (!q) { hideSearchResults(); return; }
    searchTimer = setTimeout(() => doSearch(q), 300);
  });
}

async function loadSessions() {
  try {
    state.projects = await api('sessions');
  } catch (err) {
    console.error('Failed to load sessions:', err);
    state.projects = [];
  }
  renderSidebar();
  // Update sessions overview if it's currently visible
  if (state.currentView === 'sessions' && !state.selectedSession) {
    renderSessionsOverview();
  }
}

async function loadActive() {
  try {
    const prev = state.activeProcesses;
    state.activeProcesses = await api('active');

    // Detect changes: compare active session IDs
    const prevIds = new Set(prev.filter(p => p.isRunning).map(p => p.sessionId));
    const currIds = new Set(state.activeProcesses.filter(p => p.isRunning).map(p => p.sessionId));
    const changed = prevIds.size !== currIds.size || [...prevIds].some(id => !currIds.has(id)) || [...currIds].some(id => !prevIds.has(id));

    if (changed) {
      // Active set changed — update session cards and sidebar status badges
      renderSidebar();
      renderSessionsOverview();
      // If viewing a session detail whose active state changed, refresh it
      if (state.selectedSession) {
        const wasActive = prevIds.has(state.selectedSession);
        const isActive = currIds.has(state.selectedSession);
        if (wasActive !== isActive) await showSession(state.selectedSession);
      }
    }
  } catch (err) {
    console.error('Failed to load active processes:', err);
    state.activeProcesses = [];
  }
  renderActiveStatus();
}

async function refreshData() {
  const btn = document.getElementById('refresh-btn');
  btn.classList.add('spinning');
  try {
    await api('refresh', { method: 'POST' });
    await loadSessions();
    await loadActive();
    if (state.selectedSession) await showSession(state.selectedSession);
    if (state.currentView === 'costs') await showCosts();
    showToast('Data refreshed');
  } catch (err) {
    showToast('Refresh failed: ' + err.message);
  }
  setTimeout(() => btn.classList.remove('spinning'), 600);
}

// ─── Helper: get active process for a session ───
function getActiveProc(sessionId) {
  return state.activeProcesses.find(p => p.isRunning && p.sessionId === sessionId);
}

// ─── Helper: resolve live status (overrides stale session data with active process info) ───
function liveStatus(session) {
  // If activeProcesses confirms this session is running, it's active
  if (getActiveProc(session.id)) return 'active';
  // If activeProcesses hasn't loaded yet (empty), trust the server-reported status
  if (state.activeProcesses.length === 0) return session.status;
  // activeProcesses is loaded but this session isn't in it — downgrade 'active' to 'completed'
  return session.status === 'active' ? 'completed' : session.status;
}

// ─── Helper: render quick action buttons ───
function renderQuickActions(session) {
  const proc = getActiveProc(session.id);
  let html = '<div class="quick-actions">';
  if (proc) {
    html += '<button class="qa-btn qa-focus" data-tip="Focus" onclick="event.stopPropagation();focusSession(' + proc.pid + ')">◎</button>';
    html += '<button class="qa-btn qa-kill" data-tip="Kill" onclick="event.stopPropagation();killSession(' + proc.pid + ', \\'' + session.id + '\\')">✕</button>';
  } else {
    html += '<button class="qa-btn qa-resume" data-tip="Resume" onclick="event.stopPropagation();resumeSession(\\'' + session.id + '\\')">▶</button>';
  }
  html += '<button class="qa-btn qa-rename" data-tip="Rename" onclick="event.stopPropagation();promptRename(\\'' + session.id + '\\', this)">✎</button>';
  html += '<button class="qa-btn qa-delete" data-tip="Delete" onclick="event.stopPropagation();deleteSession(\\'' + session.id + '\\')">🗑</button>';
  html += '</div>';
  return html;
}

// ─── Render Sidebar ───
function renderSidebar() {
  const list = document.getElementById('sidebar-list');
  let totalSessions = 0;
  let html = '';

  for (const project of state.projects) {
    const shortPath = project.path.replace(/^\\/Users\\/[^/]+/, '~');
    totalSessions += project.sessions.length;

    html += '<div class="project-group">';
    html += '<div class="project-header" onclick="toggleProjectAndShow(this, \\'' + esc(project.path).replace(/'/g, "\\\\'") + '\\')">';
    html += '<span class="arrow">▾</span>';
    html += '<span class="path" title="' + esc(project.path) + '">' + esc(shortPath) + '</span>';
    html += '<span class="badge">' + project.sessions.length + '</span>';
    html += '</div>';
    html += '<div class="project-sessions">';

    for (const s of project.sessions) {
      const displayTitle = s.rename || s.firstUserMessage || s.lastPrompt || '(empty session)';
      const tags = (s.tags || []).map(t => tagBadgeHTML(t, false)).join('');
      html += '<div class="session-item' + (state.selectedSession === s.id ? ' selected' : '') + '" data-id="' + s.id + '" onclick="showSession(\\'' + s.id + '\\')">';
      html += '<div class="session-title-row">';
      html += '<span class="session-status-icon ' + liveStatus(s) + '" title="' + liveStatus(s) + '"></span>';
      html += '<span class="session-title">' + esc(truncate(displayTitle, 55)) + '</span>';
      html += '</div>';
      html += '<div class="session-meta">';
      html += '<span>' + timeAgo(s.lastActiveTime) + '</span>';
      html += '<span>' + s.totalTurns + ' turns</span>';
      html += tags;
      html += '</div>';
      html += renderQuickActions(s);
      html += '</div>';
    }

    html += '</div></div>';
  }

  list.innerHTML = html;
  document.getElementById('total-sessions').textContent = totalSessions;
}

function toggleProject(el) {
  el.classList.toggle('collapsed');
  const sessions = el.nextElementSibling;
  sessions.style.display = sessions.style.display === 'none' ? '' : 'none';
}

function toggleProjectAndShow(el, folderPath) {
  toggleProject(el);
  showProjectFolder(folderPath);
}

// ─── Active Status ───
function renderActiveStatus() {
  const el = document.getElementById('active-status');
  const running = state.activeProcesses.filter(p => p.isRunning);

  if (running.length === 0) {
    el.innerHTML = '<span class="status-dot inactive"></span><span class="status-info">No active sessions</span>';
    return;
  }

  let html = '<span class="status-dot active"></span>';
  html += '<span class="status-info"><strong>' + running.length + '</strong> active';
  const totalCost = running.reduce((sum, p) => sum + (p.session?.cost || 0), 0);
  if (totalCost > 0) {
    html += ' · <span class="text-green">' + formatCost(totalCost) + '</span>';
  }
  html += '</span>';
  el.innerHTML = html;
}

// ─── Sessions Overview ───
function renderSessionsOverview() {
  const el = document.getElementById('sessions-overview');
  if (!el) return;

  if (state.projects.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="welcome-icon">◈</div><div class="welcome-title">No sessions found</div><p class="welcome-sub">No Claude Code sessions detected yet. Start a Claude Code session and it will appear here.</p></div>';
    return;
  }

  let html = '<div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;flex-wrap:wrap">';
  html += '<div class="view-title" style="margin-bottom:0">All Sessions</div>';
  html += '<div class="group-tabs">';
  html += '<button class="group-tab' + (state.groupBy === 'folder' ? ' active' : '') + '" onclick="setGroupBy(\\'folder\\')">📁 By Project</button>';
  html += '<button class="group-tab' + (state.groupBy === 'tag' ? ' active' : '') + '" onclick="setGroupBy(\\'tag\\')">🏷 By Tag</button>';
  html += '</div>';
  html += '</div>';

  if (state.groupBy === 'tag') {
    html += renderOverviewByTag();
  } else {
    html += renderOverviewByFolder();
  }

  el.innerHTML = html;
}

function setGroupBy(mode) {
  state.groupBy = mode;
  state.filterTag = null;
  renderSessionsOverview();
}

function setFilterTag(tag) {
  if (state.filterTag === tag) {
    state.filterTag = null;
  } else {
    state.filterTag = tag;
  }
  renderSessionsOverview();
}

function renderOverviewByFolder() {
  let html = '';

  // Collect all sessions for tag filtering
  const allSessions = state.projects.flatMap(p => p.sessions);

  // Gather all unique tags for filter bar
  const allTags = new Set();
  for (const s of allSessions) {
    for (const t of (s.tags || [])) allTags.add(t);
  }
  if (allTags.size > 0) {
    html += '<div class="filter-tag-bar">';
    html += '<span style="font-size:11px;color:var(--text-muted);margin-right:4px;align-self:center">Filter:</span>';
    for (const tag of [...allTags].sort()) {
      const tc = tagColor(tag);
      const isActive = state.filterTag === tag;
      html += '<span class="filter-tag-chip' + (isActive ? ' active' : '') + '" style="'
        + (isActive ? 'background:' + tc.bg + ';color:' + tc.color + ';border-color:' + tc.border : '')
        + '" onclick="setFilterTag(\\'' + esc(tag).replace(/'/g, "\\\\'") + '\\')">' + esc(tag) + '</span>';
    }
    if (state.filterTag) {
      html += '<span class="filter-tag-chip" onclick="setFilterTag(null)" style="color:var(--text-muted)">✕ Clear</span>';
    }
    html += '</div>';
  }

  for (const project of state.projects) {
    const shortPath = project.path.replace(/^\\/Users\\/[^/]+/, '~');
    let sessions = project.sessions;
    if (state.filterTag) {
      sessions = sessions.filter(s => (s.tags || []).includes(state.filterTag));
    }
    if (sessions.length === 0) continue;

    html += '<div class="overview-project-group">';
    html += '<div class="overview-project-header">';
    html += '<span class="overview-project-path" title="' + esc(project.path) + '">' + esc(shortPath) + '</span>';
    html += '<span class="overview-project-count">' + sessions.length + ' sessions</span>';
    html += '</div>';
    html += '<div class="overview-cards">';

    for (const s of sessions) {
      html += renderOverviewCard(s);
    }

    html += '</div></div>';
  }

  return html;
}

function renderOverviewByTag() {
  let html = '';
  const allSessions = state.projects.flatMap(p => p.sessions);

  // Build tag → sessions map
  const tagMap = new Map();
  const untagged = [];
  for (const s of allSessions) {
    const tags = s.tags || [];
    if (tags.length === 0) {
      untagged.push(s);
    } else {
      for (const t of tags) {
        if (!tagMap.has(t)) tagMap.set(t, []);
        tagMap.get(t).push(s);
      }
    }
  }

  // All unique tags for filter bar
  if (tagMap.size > 0) {
    html += '<div class="filter-tag-bar">';
    html += '<span style="font-size:11px;color:var(--text-muted);margin-right:4px;align-self:center">Filter:</span>';
    for (const tag of [...tagMap.keys()].sort()) {
      const tc = tagColor(tag);
      const isActive = state.filterTag === tag;
      html += '<span class="filter-tag-chip' + (isActive ? ' active' : '') + '" style="'
        + (isActive ? 'background:' + tc.bg + ';color:' + tc.color + ';border-color:' + tc.border : '')
        + '" onclick="setFilterTag(\\'' + esc(tag).replace(/'/g, "\\\\'") + '\\')">' + esc(tag) + '</span>';
    }
    if (state.filterTag) {
      html += '<span class="filter-tag-chip" onclick="setFilterTag(null)" style="color:var(--text-muted)">✕ Clear</span>';
    }
    html += '</div>';
  }

  // Sorted tags by session count descending
  const sortedTags = [...tagMap.entries()].sort((a, b) => b[1].length - a[1].length);

  // If filtering, only show that tag
  const tagsToRender = state.filterTag ? sortedTags.filter(([t]) => t === state.filterTag) : sortedTags;

  for (const [tag, sessions] of tagsToRender) {
    const tc = tagColor(tag);
    html += '<div class="overview-project-group">';
    html += '<div class="overview-project-header">';
    html += '<span class="overview-project-path" style="color:' + tc.color + '">🏷 ' + esc(tag) + '</span>';
    html += '<span class="overview-project-count">' + sessions.length + ' sessions</span>';
    html += '</div>';
    html += '<div class="overview-cards">';
    for (const s of sessions) {
      html += renderOverviewCard(s);
    }
    html += '</div></div>';
  }

  // Untagged sessions
  if (!state.filterTag && untagged.length > 0) {
    html += '<div class="overview-project-group">';
    html += '<div class="overview-project-header">';
    html += '<span class="overview-project-path" style="color:var(--text-muted)">Untagged</span>';
    html += '<span class="overview-project-count">' + untagged.length + ' sessions</span>';
    html += '</div>';
    html += '<div class="overview-cards">';
    for (const s of untagged) {
      html += renderOverviewCard(s);
    }
    html += '</div></div>';
  }

  return html;
}

function renderOverviewCard(s) {
  const displayTitle = s.rename || s.firstUserMessage || s.lastPrompt || '(empty session)';
  let html = '<div class="overview-card" onclick="showSession(\\'' + s.id + '\\')">';
  html += '<div class="oc-top">';
  html += '<span class="oc-status ' + liveStatus(s) + '" title="' + liveStatus(s) + '"></span>';
  html += '<span class="oc-title" title="' + esc(displayTitle) + '">' + esc(truncate(displayTitle, 60)) + '</span>';
  html += '<span class="oc-id">' + s.id.slice(0,8) + '</span>';
  html += '</div>';
  html += '<div class="oc-meta">';
  html += '<span>' + timeAgo(s.lastActiveTime) + '</span>';
  html += '<span>' + s.totalTurns + ' turns</span>';
  html += '<span class="oc-cost">' + formatCost(s.cost?.total || 0) + '</span>';
  html += '<span class="oc-model">' + (s.model || '?') + '</span>';
  html += '</div>';

  const tags = s.tags || [];
  if (tags.length > 0) {
    html += '<div class="oc-tags">';
    for (const tag of tags) {
      html += tagBadgeHTML(tag, false);
    }
    html += '</div>';
  }

  html += renderQuickActions(s);
  html += '</div>';
  return html;
}

// ─── Show Session ───
async function showSession(id) {
  state.selectedSession = id;
  state.currentView = 'sessions';
  updateNavTabs();

  document.querySelectorAll('.session-item').forEach(el => {
    el.classList.toggle('selected', el.dataset.id === id);
  });

  const detail = document.getElementById('session-detail');
  const costsView = document.getElementById('costs-view');
  const searchResults = document.getElementById('search-results');
  const overview = document.getElementById('sessions-overview');
  const folderView = document.getElementById('folder-view');

  overview.classList.add('hidden');
  costsView.classList.add('hidden');
  searchResults.classList.add('hidden');
  folderView.classList.add('hidden');
  document.getElementById('claude-md-view').classList.add('hidden');
  detail.classList.remove('hidden');
  detail.innerHTML = '<div class="loading">Loading session…</div>';

  let s;
  try {
    s = await api('session/' + id);
  } catch (err) {
    detail.innerHTML = '<div class="empty-state"><div class="welcome-icon">✕</div><div class="welcome-title">Session not found</div><div class="welcome-sub">' + esc(err.message) + '</div></div>';
    return;
  }
  if (s.error) {
    detail.innerHTML = '<div class="empty-state"><div class="welcome-icon">✕</div><div class="welcome-title">Session not found</div></div>';
    return;
  }

  const sessionTitle = s.rename || truncate(s.firstUserMessage || s.lastPrompt || 'Untitled Session', 80);
  let html = '';

  // Header
  html += '<div class="detail-header">';
  const sessionStatus = liveStatus(s);
  html += '<span class="status-badge ' + sessionStatus + '">' + sessionStatus + '</span>';
  html += '<span class="detail-title rename-display" onclick="promptRename(\\'' + s.id + '\\', this)" title="Click to rename">' + esc(sessionTitle) + '<span class="rename-edit-icon">✎</span></span>';
  html += '<span class="detail-id">' + s.id.slice(0,8) + '</span>';
  html += '<div class="detail-actions">';

  // Find if this session has an active process (for Focus button)
  const activeProc = state.activeProcesses.find(p => p.isRunning && p.sessionId === s.id);
  if (activeProc) {
    html += '<button class="btn btn-green" onclick="focusSession(' + activeProc.pid + ')">◎ Focus</button>';
    html += '<button class="btn btn-red" onclick="killSession(' + activeProc.pid + ', \\'' + s.id + '\\')">✕ Kill</button>';
  } else {
    html += '<button class="btn btn-orange" onclick="resumeSession(\\'' + s.id + '\\')">▶ Resume</button>';
  }
  html += '<button class="btn" onclick="copyResume(\\'' + s.id + '\\')" title="Copy resume command">📋</button>';
  html += '<button class="btn btn-red" onclick="deleteSession(\\'' + s.id + '\\')" title="Delete session">🗑</button>';

  html += '</div>';
  html += '</div>';

  // Info Card
  html += '<div class="card">';
  html += '<div class="card-header"><span class="card-header-icon">◉</span> Session Info</div>';
  html += '<div class="info-grid">';
  html += infoRow('Project', esc((s.projectPath || s.cwd || 'N/A').replace(/^\\/Users\\/[^/]+/, '~')));
  html += infoRow('Started', s.startTime ? new Date(s.startTime).toLocaleString() : 'N/A');
  html += infoRow('Last Active', s.lastActiveTime ? new Date(s.lastActiveTime).toLocaleString() : 'N/A');
  html += infoRow('Duration', s.startTime && s.lastActiveTime ? formatDuration(s.lastActiveTime - s.startTime) : 'N/A');
  html += infoRow('Model', s.model || 'unknown');
  html += infoRow('Turns', s.totalTurns + '  (' + s.userMessages + ' user, ' + s.assistantMessages + ' assistant)');
  html += '</div>';

  if (s.tools && s.tools.length > 0) {
    html += '<div style="margin-top:14px"><span class="text-sm text-muted" style="font-weight:700;letter-spacing:0.8px;text-transform:uppercase">Tools</span></div>';
    html += '<div class="tool-bar">';
    const counts = s.toolUseCounts || {};
    for (const tool of s.tools) {
      html += '<span class="tool-chip">' + esc(tool) + ' <span class="count">×' + (counts[tool] || '?') + '</span></span>';
    }
    html += '</div>';
  }
  html += '</div>';

  // Token & Cost Card
  html += '<div class="card">';
  html += '<div class="card-header"><span class="card-header-icon">◎</span> Token Usage & Cost</div>';
  html += '<div class="stat-grid">';
  html += statCard(formatTokens(s.totalInputTokens || 0), 'Input Tokens', formatCost(s.cost?.input || 0));
  html += statCard(formatTokens(s.totalOutputTokens || 0), 'Output Tokens', formatCost(s.cost?.output || 0));
  html += statCard(formatTokens(s.totalCacheReadTokens || 0), 'Cache Read', formatCost(s.cost?.cacheRead || 0));
  html += statCard(formatTokens(s.totalCacheCreationTokens || 0), 'Cache Create', formatCost(s.cost?.cacheCreation || 0));
  html += '</div>';
  html += '<div class="total-cost-card">';
  html += '<div class="total-cost-label">Total Cost</div>';
  html += '<div class="total-cost-value">' + formatCost(s.cost?.total || 0) + '</div>';
  html += '</div>';
  html += '</div>';

  // Notes & Tags Card
  html += '<div class="card">';
  html += '<div class="card-header"><span class="card-header-icon">✎</span> Notes & Tags</div>';
  html += '<textarea class="note-input" id="note-' + s.id + '" placeholder="Add a note about this session..."'
       +  ' onchange="saveNote(\\'' + s.id + '\\', this.value)">' + esc(s.note || '') + '</textarea>';
  html += '<div class="tags-input" id="tags-' + s.id + '">';
  for (const tag of (s.tags || [])) {
    html += tagBadgeHTML(tag, true, s.id);
  }
  html += '<input class="tag-input-field" placeholder="+ add tag" onkeydown="if(event.key===\\'Enter\\'){addTag(\\'' + s.id + '\\', this.value);this.value=\\'\\';}">';
  html += '</div>';
  html += '</div>';

  // Send Prompt Card
  html += '<div class="card prompt-card">';
  html += '<div class="card-header"><span class="card-header-icon">▶</span> Send Prompt</div>';
  html += '<div class="prompt-input-wrap">';
  html += '<textarea class="prompt-input" id="prompt-' + s.id + '" placeholder="Type a prompt to send to this session…" onkeydown="if(event.key===\\'Enter\\'&&(event.metaKey||event.ctrlKey)){event.preventDefault();sendPrompt(\\'' + s.id + '\\');}"></textarea>';
  html += '<button class="prompt-send-btn" id="prompt-send-' + s.id + '" onclick="sendPrompt(\\'' + s.id + '\\')">Send</button>';
  html += '</div>';
  html += '<div class="prompt-hint">⌘+Enter to send. Opens in a new Terminal tab via <code>claude --resume</code>.</div>';
  html += '</div>';

  // Conversation Card
  if (s.messages && s.messages.length > 0) {
    html += '<div class="card">';
    html += '<div class="card-header"><span class="card-header-icon">◬</span> Conversation <span style="margin-left:auto;font-weight:400;letter-spacing:0">' + s.messages.length + ' messages</span></div>';
    html += '<div class="conversation">';

    for (const msg of s.messages) {
      html += '<div class="msg ' + msg.role + '">';
      html += '<div class="msg-header">';
      html += '<span class="msg-role ' + msg.role + '">' + (msg.role === 'user' ? 'You' : 'Claude') + '</span>';
      if (msg.timestamp) html += '<span>' + new Date(msg.timestamp).toLocaleTimeString() + '</span>';
      if (msg.model && msg.model !== '<synthetic>') html += '<span style="font-family:var(--font-mono);font-size:10px">' + msg.model + '</span>';
      html += '</div>';
      html += '<div class="msg-content">' + renderMarkdown(msg.content || '') + '</div>';
      if (msg.tools && msg.tools.length > 0) {
        html += '<div class="msg-tools">⚙ ' + msg.tools.map(t => t.name).join(', ') + '</div>';
      }
      if (msg.usage) {
        html += '<div class="msg-usage">↳ in:' + (msg.usage.input||0).toLocaleString() + '  out:' + (msg.usage.output||0).toLocaleString();
        if (msg.usage.cacheRead) html += '  cache:' + msg.usage.cacheRead.toLocaleString();
        html += '</div>';
      }
      html += '</div>';
    }

    html += '</div>';
    html += '</div>';
  }

  detail.innerHTML = html;
}

// ─── Costs View ───
async function showCosts() {
  state.currentView = 'costs';
  updateNavTabs();

  const overview = document.getElementById('sessions-overview');
  const detail = document.getElementById('session-detail');
  const costsView = document.getElementById('costs-view');
  const searchResults = document.getElementById('search-results');
  const folderView = document.getElementById('folder-view');

  overview.classList.add('hidden');
  detail.classList.add('hidden');
  searchResults.classList.add('hidden');
  folderView.classList.add('hidden');
  document.getElementById('claude-md-view').classList.add('hidden');
  costsView.classList.remove('hidden');
  costsView.innerHTML = '<div class="loading">Calculating costs…</div>';

  let stats;
  try {
    stats = await api('costs?period=' + state.costPeriod);
  } catch (err) {
    costsView.innerHTML = '<div class="empty-state"><div class="welcome-icon">✕</div><div class="welcome-title">Failed to load costs</div><div class="welcome-sub">' + esc(err.message) + '</div></div>';
    return;
  }

  let html = '';
  html += '<div class="view-title">Cost Dashboard</div>';

  // Period tabs
  html += '<div class="period-tabs">';
  for (const p of ['today', 'week', 'month', 'all']) {
    html += '<button class="period-tab' + (state.costPeriod === p ? ' active' : '') + '" onclick="state.costPeriod=\\'' + p + '\\';showCosts()">' + p.charAt(0).toUpperCase() + p.slice(1) + '</button>';
  }
  html += '</div>';

  // Summary stats
  html += '<div class="stat-grid">';
  html += statCard(formatCost(stats.totals?.totalCost || 0), 'Total Cost');
  html += statCard(formatTokens((stats.totals?.inputTokens || 0) + (stats.totals?.outputTokens || 0)), 'Total Tokens');
  html += statCard(formatCost(stats.totals?.inputCost || 0), 'Input Cost');
  html += statCard(formatCost(stats.totals?.outputCost || 0), 'Output Cost');
  html += statCard(formatCost(stats.totals?.cacheReadCost || 0), 'Cache Read');
  html += statCard(formatTokens(stats.totals?.cacheReadTokens || 0), 'Cache Tokens');
  html += '</div>';

  // Daily cost chart
  const days = Object.entries(stats.perDay || {}).sort((a,b) => a[0].localeCompare(b[0]));
  if (days.length > 0) {
    html += '<div class="card">';
    html += '<div class="card-header"><span class="card-header-icon">▥</span> Daily Cost Trend</div>';
    html += renderBarChart(days.map(([d, v]) => ({ label: d.slice(5), value: v.cost })));
    html += '</div>';
  }

  // Project pie chart
  const projectEntries = Object.entries(stats.perProject || {}).sort((a,b) => b[1].cost - a[1].cost);
  if (projectEntries.length > 0) {
    html += '<div class="card">';
    html += '<div class="card-header"><span class="card-header-icon">◔</span> Cost by Project</div>';
    html += renderPieChart(projectEntries.map(([name, data]) => ({
      label: name.replace(/^\\/Users\\/[^/]+/, '~'),
      value: data.cost,
    })));

    html += '<table class="cost-table">';
    html += '<tr><th>Project</th><th class="right">Cost</th><th class="right">Sessions</th><th class="right">Tokens</th></tr>';
    for (const [name, data] of projectEntries) {
      const shortName = name.replace(/^\\/Users\\/[^/]+/, '~');
      html += '<tr onclick="void 0">';
      html += '<td>' + esc(shortName) + '</td>';
      html += '<td class="right cost-val">' + formatCost(data.cost) + '</td>';
      html += '<td class="right mono">' + data.sessions + '</td>';
      html += '<td class="right mono">' + formatTokens(data.tokens) + '</td>';
      html += '</tr>';
    }
    html += '</table>';
    html += '</div>';
  }

  // Per session costs
  if (stats.perSession && stats.perSession.length > 0) {
    html += '<div class="card">';
    html += '<div class="card-header"><span class="card-header-icon">◫</span> Cost by Session</div>';
    const sorted = [...stats.perSession].sort((a,b) => (b.cost?.total||0) - (a.cost?.total||0));
    html += '<table class="cost-table">';
    html += '<tr><th>Session</th><th class="right">Model</th><th class="right">Input</th><th class="right">Output</th><th class="right">Total</th></tr>';
    for (const sc of sorted.slice(0, 30)) {
      const shortProject = (sc.projectPath || '').replace(/^\\/Users\\/[^/]+/, '~');
      const desc = (sc.firstUserMessage || '').replace(/\\n/g, ' ').slice(0, 60);
      html += '<tr onclick="showSession(\\'' + sc.sessionId + '\\')" style="cursor:pointer">';
      html += '<td style="max-width:320px">';
      html += '<div style="display:flex;align-items:center;gap:6px">';
      html += '<span class="mono" style="font-size:11px;flex-shrink:0">' + sc.sessionId.slice(0,8) + '</span>';
      if (shortProject) {
        html += '<span style="font-size:10px;color:var(--accent);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">' + esc(shortProject) + '</span>';
      }
      html += '</div>';
      if (desc) {
        html += '<div style="font-size:11px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:300px;margin-top:2px">' + esc(desc) + (sc.firstUserMessage && sc.firstUserMessage.length > 60 ? '…' : '') + '</div>';
      }
      html += '</td>';
      html += '<td class="right mono" style="font-size:11px;color:var(--text-muted)">' + (sc.model || '?') + '</td>';
      html += '<td class="right mono">' + formatCost(sc.cost?.input||0) + '</td>';
      html += '<td class="right mono">' + formatCost(sc.cost?.output||0) + '</td>';
      html += '<td class="right cost-val">' + formatCost(sc.cost?.total||0) + '</td>';
      html += '</tr>';
    }
    html += '</table>';
    html += '</div>';
  }

  costsView.innerHTML = html;
}

// ─── Search ───
async function doSearch(q) {
  state.searchQuery = q;
  let results;
  try {
    results = await api('search?q=' + encodeURIComponent(q));
  } catch (err) {
    showToast('Search failed: ' + err.message);
    return;
  }

  const el = document.getElementById('search-results');
  const overview = document.getElementById('sessions-overview');
  const detail = document.getElementById('session-detail');
  const costsView = document.getElementById('costs-view');
  const folderView = document.getElementById('folder-view');

  overview.classList.add('hidden');
  detail.classList.add('hidden');
  costsView.classList.add('hidden');
  folderView.classList.add('hidden');
  el.classList.remove('hidden');

  if (results.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="welcome-icon">⌕</div><div class="welcome-title">No results</div><p class="welcome-sub">No sessions match "' + esc(q) + '"</p></div>';
    return;
  }

  let html = '<div class="view-title">Search: "' + esc(q) + '" <span style="font-size:14px;color:var(--text-muted);font-weight:400">' + results.length + ' sessions</span></div>';

  for (const r of results) {
    const shortPath = (r.projectPath || '').replace(/^\\/Users\\/[^/]+/, '~');
    const displayTitle = r.rename || r.firstUserMessage || '';
    html += '<div class="search-result" onclick="showSession(\\'' + r.sessionId + '\\')">';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">';
    html += '<span class="session-status-icon ' + r.status + '" style="width:8px;height:8px;border-radius:50%;display:inline-block;flex-shrink:0;'
         + (r.status === 'active' ? 'background:var(--green);box-shadow:0 0 6px var(--green)' : r.status === 'recent' ? 'background:var(--yellow)' : 'background:var(--text-muted);opacity:0.5') + '"></span>';
    html += '<span style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">' + r.sessionId.slice(0,8) + '</span>';
    html += '<span style="color:var(--accent);font-size:12px">' + esc(shortPath) + '</span>';
    html += '<span style="margin-left:auto;color:var(--text-muted);font-size:11px;font-weight:600">' + r.matchCount + ' match' + (r.matchCount !== 1 ? 'es' : '') + '</span>';
    html += '</div>';

    // Display title
    if (displayTitle) {
      html += '<div class="search-result-title">' + highlightSearch(displayTitle, q) + '</div>';
    }

    // Tags
    if (r.tags && r.tags.length > 0) {
      html += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin:4px 0">';
      for (const tag of r.tags) {
        html += tagBadgeHTML(tag, false);
      }
      html += '</div>';
    }

    // Meta matches (folder, tag, title, description, note)
    const metaMatches = r.metaMatches || [];
    for (const mm of metaMatches) {
      const highlighted = highlightSearch(mm.text, q);
      html += '<div style="font-size:12px;color:var(--text-secondary);margin:4px 0;padding:5px 10px;display:flex;align-items:center;gap:4px;border-left:2px solid var(--accent);border-radius:0 4px 4px 0;background:var(--bg-tertiary)">';
      html += '<span class="meta-match-label ' + mm.type + '">' + mm.type + '</span>';
      html += '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + highlighted + '</span>';
      html += '</div>';
    }

    // Message content matches
    for (const m of r.matches.slice(0, 3)) {
      const highlighted = highlightSearch(m.content, q);
      html += '<div style="font-size:12px;color:var(--text-secondary);margin:4px 0;padding:6px 12px;border-left:2px solid var(--border);border-radius:0 4px 4px 0;background:var(--bg-tertiary)">';
      html += '<span style="color:var(--text-muted);font-weight:600;font-size:10px;text-transform:uppercase">' + m.role + '</span> · ' + highlighted;
      html += '</div>';
    }
    html += '</div>';
  }

  el.innerHTML = html;
}

function hideSearchResults() {
  document.getElementById('search-results').classList.add('hidden');
  if (state.selectedSession) {
    document.getElementById('session-detail').classList.remove('hidden');
  } else if (state.currentView === 'costs') {
    document.getElementById('costs-view').classList.remove('hidden');
  } else if (state.currentView === 'claude-md') {
    document.getElementById('claude-md-view').classList.remove('hidden');
  } else {
    document.getElementById('sessions-overview').classList.remove('hidden');
  }
}

// ─── Actions ───

// Helper: poll for state change after an action
async function refreshAfterAction(sessionId, { expectActive = null, maxAttempts = 6, interval = 1500 } = {}) {
  let matched = false;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, interval));
    await api('refresh', { method: 'POST' });
    await loadSessions();
    await loadActive();
    // Check if the expected state change happened
    if (expectActive !== null) {
      const isActive = state.activeProcesses.some(p => p.sessionId === sessionId && p.isRunning);
      if (isActive === expectActive) { matched = true; break; }
    }
  }
  // Always force a full UI refresh after action completes
  renderSidebar();
  renderSessionsOverview();
  renderActiveStatus();
  if (sessionId && state.selectedSession === sessionId) {
    await showSession(sessionId);
  }
  return matched;
}

// Helper: set loading state on a button
function setBtnLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.classList.add('loading');
    btn.dataset.origText = btn.textContent;
  } else {
    btn.classList.remove('loading');
    if (btn.dataset.origText) btn.textContent = btn.dataset.origText;
  }
}

function copyResume(id) {
  navigator.clipboard.writeText('claude --resume ' + id).then(() => showToast('Copied: claude --resume ' + id.slice(0,8) + '…'));
}

async function focusSession(pid) {
  try {
    const res = await api('focus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pid }),
    });
    if (res.ok) {
      showToast('Focused Terminal (tty: ' + res.tty + ')');
    } else {
      showToast('Focus failed: ' + (res.error || 'unknown'));
    }
  } catch (err) {
    showToast('Focus error: ' + err.message);
  }
}

async function resumeSession(sessionId) {
  const btn = event && event.target ? event.target.closest('.btn,.qa-btn') : null;
  setBtnLoading(btn, true);
  try {
    const res = await api('resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    if (res.ok) {
      showToast('Resuming session in Terminal…');
      const became = await refreshAfterAction(sessionId, { expectActive: true });
      if (!became) {
        showToast('⚠ Resume may have failed — session not detected as active');
      }
    } else {
      showToast('⚠ Resume failed: ' + (res.error || 'unknown'));
    }
  } catch (err) {
    showToast('⚠ Resume error: ' + err.message);
  } finally {
    setBtnLoading(btn, false);
  }
}

async function killSession(pid, sessionId) {
  const ok = await customConfirm({
    icon: '🛑',
    title: 'Kill Session',
    message: 'The Claude process (PID ' + pid + ') will be terminated. This cannot be undone.',
    confirmText: 'Kill',
    confirmClass: 'danger',
  });
  if (!ok) return;
  const btn = event && event.target ? event.target.closest('.btn,.qa-btn') : null;
  setBtnLoading(btn, true);
  try {
    const res = await api('kill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pid }),
    });
    if (res.ok) {
      showToast('Session killed (PID ' + pid + ')');
      await refreshAfterAction(sessionId, { expectActive: false, maxAttempts: 4, interval: 1000 });
    } else {
      showToast('Kill failed: ' + (res.error || 'unknown'));
    }
  } catch (err) {
    showToast('Kill error: ' + err.message);
  } finally {
    setBtnLoading(btn, false);
  }
}

async function saveNote(sessionId, note) {
  try {
    await api('notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, note }),
    });
  } catch (err) {
    showToast('Save note failed: ' + err.message);
  }
}

async function addTag(sessionId, tag) {
  tag = tag.trim();
  if (!tag) return;
  const content = document.getElementById('content');
  const scrollPos = content ? content.scrollTop : 0;
  try {
    await api('tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, tag }),
    });
    await loadSessions();
    await showSession(sessionId);
    if (content) requestAnimationFrame(() => { content.scrollTop = scrollPos; });
  } catch (err) {
    showToast('Add tag failed: ' + err.message);
  }
}

async function removeTag(sessionId, tag) {
  const content = document.getElementById('content');
  const scrollPos = content ? content.scrollTop : 0;
  try {
    await api('tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, tag, action: 'remove' }),
    });
    await loadSessions();
    await showSession(sessionId);
    if (content) requestAnimationFrame(() => { content.scrollTop = scrollPos; });
  } catch (err) {
    showToast('Remove tag failed: ' + err.message);
  }
}

// ─── Rename Session (inline) ───
function findSession(sessionId) {
  for (const p of state.projects) {
    for (const s of p.sessions) {
      if (s.id === sessionId) return s;
    }
  }
  return null;
}

function startInlineRename(sessionId, triggerEl) {
  // Determine context: sidebar (.session-title) or detail (.detail-title)
  const sidebarTitle = triggerEl.closest('.session-item')?.querySelector('.session-title');
  const detailTitle = triggerEl.closest('.detail-header')?.querySelector('.detail-title');
  const targetEl = sidebarTitle || detailTitle;
  if (!targetEl) return;

  // Prevent re-entry if already editing
  if (targetEl.querySelector('.inline-rename-input')) return;

  const session = findSession(sessionId);
  const currentName = session?.rename || session?.firstUserMessage || session?.lastPrompt || '';
  const isSidebar = !!sidebarTitle;
  const cssClass = isSidebar ? 'sidebar-rename' : 'detail-rename';

  // Save original content for cancel
  const originalHTML = targetEl.innerHTML;

  // Replace content with input
  targetEl.innerHTML = '';
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'inline-rename-input ' + cssClass;
  input.value = currentName;
  targetEl.appendChild(input);

  // Stop click propagation so clicking input doesn't trigger showSession/etc
  input.addEventListener('click', e => e.stopPropagation());
  input.addEventListener('mousedown', e => e.stopPropagation());

  // Focus & select
  input.focus();
  input.select();

  let saved = false;
  async function save() {
    if (saved) return;
    saved = true;
    const newName = input.value.trim();
    // If unchanged, just restore
    if (newName === currentName.trim()) {
      cancel();
      return;
    }
    try {
      await api('rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, rename: newName }),
      });
      showToast(newName ? 'Session renamed' : 'Rename cleared');
      await api('refresh', { method: 'POST' });
      await loadSessions();
      if (state.selectedSession === sessionId) await showSession(sessionId);
    } catch (err) {
      showToast('Rename error: ' + err.message);
      targetEl.innerHTML = originalHTML;
    }
  }

  function cancel() {
    targetEl.innerHTML = originalHTML;
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); save(); }
    if (e.key === 'Escape') { e.preventDefault(); cancel(); }
    e.stopPropagation();
  });
  input.addEventListener('blur', () => {
    // Small delay so Enter save completes before blur fires
    setTimeout(() => { if (!saved) save(); }, 100);
  });
}

// Keep old name as alias so onclick attributes that still reference promptRename work
function promptRename(sessionId, el) {
  startInlineRename(sessionId, el);
}

// ─── Delete Session ───
async function deleteSession(sessionId) {
  const ok = await customConfirm({
    icon: '🗑️',
    title: 'Delete Session',
    message: 'Permanently delete this session? The JSONL file will be removed from disk and cannot be undone.',
    confirmText: 'Delete',
    confirmClass: 'danger',
  });
  if (!ok) return;
  try {
    const res = await api('delete-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    if (res.ok) {
      showToast('Session deleted');
      state.selectedSession = null;
      await api('refresh', { method: 'POST' });
      await loadSessions();
      // Show overview
      document.getElementById('session-detail').classList.add('hidden');
      document.getElementById('sessions-overview').classList.remove('hidden');
      renderSessionsOverview();
    } else {
      showToast('Delete failed: ' + (res.error || 'unknown'));
    }
  } catch (err) {
    showToast('Delete error: ' + err.message);
  }
}

// ─── Send Prompt ───
async function sendPrompt(sessionId) {
  const textarea = document.getElementById('prompt-' + sessionId);
  const btn = document.getElementById('prompt-send-' + sessionId);
  const prompt = (textarea ? textarea.value : '').trim();
  if (!prompt) { showToast('Please enter a prompt'); return; }

  btn.disabled = true;
  btn.textContent = 'Sending…';
  try {
    const res = await api('send-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, prompt }),
    });
    if (res.ok) {
      showToast('Prompt sent — session opened in Terminal');
      textarea.value = '';
      const became = await refreshAfterAction(sessionId, { expectActive: true });
      if (!became) {
        showToast('⚠ Session may not have started — not detected as active');
      }
    } else {
      showToast('⚠ Send failed: ' + (res.error || 'unknown'));
    }
  } catch (err) {
    showToast('Send error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send';
  }
}

// ─── Folder Tree View ───
async function showProjectFolder(folderPath) {
  state.selectedSession = null;
  document.querySelectorAll('.session-item').forEach(el => el.classList.remove('selected'));

  const overview = document.getElementById('sessions-overview');
  const detail = document.getElementById('session-detail');
  const costsView = document.getElementById('costs-view');
  const searchResults = document.getElementById('search-results');
  const folderView = document.getElementById('folder-view');

  overview.classList.add('hidden');
  detail.classList.add('hidden');
  costsView.classList.add('hidden');
  searchResults.classList.add('hidden');
  document.getElementById('claude-md-view').classList.add('hidden');
  folderView.classList.remove('hidden');

  const shortPath = folderPath.replace(/^\\/Users\\/[^/]+/, '~');
  folderView.innerHTML = '<div class="folder-view-header">'
    + '<span class="view-title" style="margin-bottom:0">📁 ' + esc(shortPath) + '</span>'
    + '<button class="btn folder-view-open" onclick="openInFinder(\\'' + esc(folderPath).replace(/'/g, "\\\\'") + '\\')">Open in Finder</button>'
    + '</div>'
    + '<div class="folder-layout">'
    + '<div class="folder-tree-pane"><div class="tree-container" id="tree-root"><div class="loading">Loading…</div></div></div>'
    + '<div class="folder-preview-pane"><div class="file-preview-card" id="file-preview">'
    + '<div class="file-preview-empty"><div class="icon">📄</div><div class="title">Select a file to preview</div><div class="desc">Click any file in the tree to see its contents here.</div></div>'
    + '</div></div>'
    + '</div>';

  // Load root level
  try {
    const items = await api('filetree?path=' + encodeURIComponent(folderPath));
    const treeRoot = document.getElementById('tree-root');
    treeRoot.innerHTML = renderTreeNodes(items, 0);
  } catch (err) {
    document.getElementById('tree-root').innerHTML = '<div style="padding:16px;color:var(--red)">Failed to load directory: ' + esc(err.message) + '</div>';
  }
}

function renderTreeNodes(items, depth) {
  let html = '';
  for (const item of items) {
    const indent = '<span class="tree-indent"></span>'.repeat(depth);
    const icon = item.isDirectory ? '📁' : fileIcon(item.name);
    const escapedPath = esc(item.path).replace(/'/g, "\\\\'");

    html += '<div class="tree-node">';
    html += '<div class="tree-row" ' + (item.isDirectory ? 'onclick="toggleTreeNode(this, \\'' + escapedPath + '\\')"' : 'onclick="previewFile(this, \\'' + escapedPath + '\\')"') + '>';
    html += indent;
    if (item.isDirectory) {
      html += '<span class="tree-arrow">▾</span>';
    } else {
      html += '<span class="tree-arrow file-spacer">▾</span>';
    }
    html += '<span class="tree-icon">' + icon + '</span>';
    html += '<span class="tree-name' + (item.isDirectory ? ' dir' : '') + '">' + esc(item.name) + '</span>';
    html += '<button class="tree-finder-btn" onclick="event.stopPropagation();openInFinder(\\'' + escapedPath + '\\')">Finder</button>';
    html += '</div>';

    if (item.isDirectory) {
      html += '<div class="tree-children" data-path="' + esc(item.path) + '"></div>';
    }
    html += '</div>';
  }
  return html;
}

function fileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  const icons = {
    js: '📜', ts: '📘', jsx: '⚛', tsx: '⚛', py: '🐍', rb: '💎',
    json: '📋', yaml: '📋', yml: '📋', toml: '📋',
    md: '📝', txt: '📄', html: '🌐', css: '🎨', scss: '🎨',
    png: '🖼', jpg: '🖼', jpeg: '🖼', gif: '🖼', svg: '🖼', ico: '🖼',
    sh: '⚙', bash: '⚙', zsh: '⚙',
    go: '🔵', rs: '🦀', java: '☕', c: '🔧', cpp: '🔧', h: '🔧',
    lock: '🔒', env: '🔑',
  };
  return icons[ext] || '📄';
}

async function toggleTreeNode(rowEl, dirPath) {
  const treeNode = rowEl.parentElement;
  const childrenEl = treeNode.querySelector('.tree-children');
  const arrow = rowEl.querySelector('.tree-arrow');

  if (childrenEl.classList.contains('collapsed')) {
    // Expand (already loaded)
    arrow.classList.remove('collapsed');
    childrenEl.classList.remove('collapsed');
    return;
  }

  // If children not loaded yet, load them
  if (childrenEl.innerHTML === '') {
    childrenEl.innerHTML = '<div style="padding:4px 16px;color:var(--text-muted);font-size:12px">Loading…</div>';
    try {
      const depth = rowEl.querySelectorAll('.tree-indent').length + 1;
      const items = await api('filetree?path=' + encodeURIComponent(dirPath));
      if (items.length === 0) {
        childrenEl.innerHTML = '<div style="padding:4px 16px 4px ' + (depth * 20 + 40) + 'px;color:var(--text-muted);font-size:12px;font-style:italic">(empty)</div>';
      } else {
        childrenEl.innerHTML = renderTreeNodes(items, depth);
      }
    } catch (err) {
      childrenEl.innerHTML = '<div style="padding:4px 16px;color:var(--red);font-size:12px">Error: ' + esc(err.message) + '</div>';
    }
  } else {
    // Collapse
    arrow.classList.add('collapsed');
    childrenEl.classList.add('collapsed');
  }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function guessLang(name) {
  const ext = name.split('.').pop().toLowerCase();
  const map = {
    js: 'javascript', mjs: 'javascript', cjs: 'javascript',
    ts: 'typescript', tsx: 'typescript', jsx: 'javascript',
    py: 'python', rb: 'ruby', go: 'go', rs: 'rust',
    java: 'java', c: 'c', cpp: 'cpp', h: 'c',
    json: 'json', yaml: 'yaml', yml: 'yaml', toml: 'toml',
    md: 'markdown', html: 'html', css: 'css', scss: 'scss',
    sh: 'bash', bash: 'bash', zsh: 'bash',
    sql: 'sql', xml: 'xml', svg: 'xml',
  };
  return map[ext] || '';
}

async function previewFile(rowEl, filePath) {
  // Highlight selected row
  document.querySelectorAll('#tree-root .tree-row.selected').forEach(el => el.classList.remove('selected'));
  rowEl.classList.add('selected');

  const preview = document.getElementById('file-preview');
  if (!preview) return;

  const fileName = filePath.split('/').pop();
  preview.innerHTML = '<div class="file-preview-header">'
    + '<span style="font-size:14px">' + fileIcon(fileName) + '</span>'
    + '<span class="file-preview-name">' + esc(fileName) + '</span>'
    + '<span class="file-preview-meta">Loading…</span>'
    + '</div>'
    + '<div class="file-preview-body"><div style="padding:24px;color:var(--text-muted);text-align:center">Loading…</div></div>';

  try {
    const data = await api('file-content?path=' + encodeURIComponent(filePath));

    if (data.error && !data.tooLarge) {
      preview.innerHTML = '<div class="file-preview-header">'
        + '<span style="font-size:14px">' + fileIcon(fileName) + '</span>'
        + '<span class="file-preview-name">' + esc(fileName) + '</span>'
        + '</div>'
        + '<div class="file-preview-body"><div class="file-preview-empty"><div class="icon">⚠️</div><div class="title">' + esc(data.error) + '</div></div></div>';
      return;
    }

    if (data.tooLarge) {
      preview.innerHTML = '<div class="file-preview-header">'
        + '<span style="font-size:14px">' + fileIcon(fileName) + '</span>'
        + '<span class="file-preview-name">' + esc(data.name) + '</span>'
        + '<span class="file-preview-meta">' + formatFileSize(data.size) + '</span>'
        + '</div>'
        + '<div class="file-preview-body"><div class="file-preview-binary"><div class="icon">📦</div><div>' + esc(data.error) + '</div></div></div>';
      return;
    }

    if (data.binary) {
      preview.innerHTML = '<div class="file-preview-header">'
        + '<span style="font-size:14px">' + fileIcon(fileName) + '</span>'
        + '<span class="file-preview-name">' + esc(data.name) + '</span>'
        + '<span class="file-preview-meta">' + formatFileSize(data.size) + '</span>'
        + '</div>'
        + '<div class="file-preview-body"><div class="file-preview-binary"><div class="icon">🔮</div><div>Binary file — cannot preview</div></div></div>';
      return;
    }

    // Render code with line numbers
    const lines = data.content.split('\\n');
    let codeHtml = '<div class="file-preview-code">';
    for (let i = 0; i < lines.length; i++) {
      codeHtml += '<div class="file-preview-line">';
      codeHtml += '<span class="file-preview-ln">' + (i + 1) + '</span>';
      codeHtml += '<span class="file-preview-content">' + esc(lines[i]) + '</span>';
      codeHtml += '</div>';
    }
    codeHtml += '</div>';

    const metaParts = [formatFileSize(data.size)];
    const lang = guessLang(data.name);
    if (lang) metaParts.push(lang);
    metaParts.push(data.totalLines + ' lines');

    let html = '<div class="file-preview-header">'
      + '<span style="font-size:14px">' + fileIcon(data.name) + '</span>'
      + '<span class="file-preview-name">' + esc(data.name) + '</span>'
      + '<span class="file-preview-meta">' + metaParts.join(' · ') + '</span>'
      + '</div>'
      + '<div class="file-preview-body">' + codeHtml + '</div>';

    if (data.truncated) {
      html += '<div class="file-preview-truncated">Showing first 500 of ' + data.totalLines + ' lines</div>';
    }

    preview.innerHTML = html;
  } catch (err) {
    preview.innerHTML = '<div class="file-preview-header">'
      + '<span style="font-size:14px">' + fileIcon(fileName) + '</span>'
      + '<span class="file-preview-name">' + esc(fileName) + '</span>'
      + '</div>'
      + '<div class="file-preview-body"><div class="file-preview-empty"><div class="icon">⚠️</div><div class="title">Preview failed</div><div class="desc">' + esc(err.message) + '</div></div></div>';
  }
}

async function openInFinder(filePath) {
  try {
    const res = await api('open-finder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath }),
    });
    if (res.ok) {
      showToast('Opened in Finder');
    } else {
      showToast('Finder error: ' + (res.error || 'unknown'));
    }
  } catch (err) {
    showToast('Finder error: ' + err.message);
  }
}

// ─── View Switching ───
function switchView(view) {
  state.currentView = view;
  updateNavTabs();

  // Hide all content views first
  const allViews = ['costs-view', 'session-detail', 'search-results', 'folder-view', 'sessions-overview', 'claude-md-view'];
  allViews.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  if (view === 'costs') {
    showCosts();
  } else if (view === 'claude-md') {
    showClaudeMd();
  } else {
    // Deselect current session and show sessions overview
    state.selectedSession = null;
    document.querySelectorAll('.session-item').forEach(el => el.classList.remove('selected'));
    document.getElementById('sessions-overview').classList.remove('hidden');
    renderSessionsOverview();
  }
}

function updateNavTabs() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === state.currentView);
  });
}

// ─── Chart Renderers ───
function renderBarChart(data) {
  if (data.length === 0) return '';
  const maxVal = Math.max(...data.map(d => d.value), 0.001);
  const chartH = 150;
  const barW = Math.max(14, Math.min(42, Math.floor(600 / data.length) - 6));
  const totalW = data.length * (barW + 6);

  let html = '<div class="chart-container" style="height:' + (chartH + 50) + 'px;min-width:' + totalW + 'px">';

  data.forEach((d, i) => {
    const h = Math.max(3, (d.value / maxVal) * chartH);
    const x = i * (barW + 6) + 20;
    html += '<div class="chart-bar" style="left:' + x + 'px;width:' + barW + 'px;height:' + h + 'px">';
    html += '<div class="chart-value">' + formatCost(d.value) + '</div>';
    html += '</div>';
    html += '<div class="chart-label" style="left:' + (x + 2) + 'px">' + d.label + '</div>';
  });

  html += '</div>';
  return html;
}

function renderPieChart(data) {
  if (data.length === 0) return '';
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return '<div class="text-muted">No cost data</div>';

  const colors = ['#6cb6ff', '#56d364', '#e3b341', '#f47067', '#d2a8ff', '#f0883e', '#76e3ea', '#f778ba'];
  const size = 150;
  const cx = size / 2, cy = size / 2, r = size / 2 - 5;
  let startAngle = -Math.PI / 2;

  let svg = '<svg class="pie-svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">';

  data.forEach((d, i) => {
    const pct = d.value / total;
    const angle = pct * Math.PI * 2;
    const endAngle = startAngle + angle;
    const largeArc = angle > Math.PI ? 1 : 0;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    if (pct > 0.999) {
      // Full circle: use a circle element instead of an arc (arc with identical start/end draws nothing)
      svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + colors[i % colors.length] + '" opacity="0.9" style="transition:opacity 0.2s"><title>' + esc(d.label) + ': ' + formatCost(d.value) + '</title></circle>';
    } else if (pct > 0.001) {
      svg += '<path d="M ' + cx + ' ' + cy + ' L ' + x1 + ' ' + y1 + ' A ' + r + ' ' + r + ' 0 ' + largeArc + ' 1 ' + x2 + ' ' + y2 + ' Z" fill="' + colors[i % colors.length] + '" opacity="0.9" style="transition:opacity 0.2s"><title>' + esc(d.label) + ': ' + formatCost(d.value) + '</title></path>';
    }
    startAngle = endAngle;
  });

  svg += '</svg>';

  let legend = '<div class="pie-legend">';
  data.forEach((d, i) => {
    const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0';
    legend += '<div class="pie-legend-item">';
    legend += '<div class="pie-color" style="background:' + colors[i % colors.length] + '"></div>';
    legend += '<span style="flex:1">' + esc(truncate(d.label, 30)) + '</span>';
    legend += '<span class="pie-legend-cost">' + formatCost(d.value) + ' <span class="text-muted">(' + pct + '%)</span></span>';
    legend += '</div>';
  });
  legend += '</div>';

  return '<div class="pie-container">' + svg + legend + '</div>';
}

// ─── Helpers ───
function esc(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function truncate(s, len) {
  if (!s) return '';
  s = s.replace(/\\n/g, ' ').trim();
  return s.length > len ? s.slice(0, len - 1) + '…' : s;
}

function timeAgo(ts) {
  if (!ts) return 'N/A';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  if (hours < 24) return hours + 'h ago';
  return days + 'd ago';
}

function formatDuration(ms) {
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  if (hours > 0) return hours + 'h ' + (mins % 60) + 'm';
  if (mins > 0) return mins + 'm ' + (secs % 60) + 's';
  return secs + 's';
}

function formatTokens(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function formatCost(c) {
  if (c < 0.01) return '$' + c.toFixed(4);
  if (c < 1) return '$' + c.toFixed(3);
  return '$' + c.toFixed(2);
}

function statCard(value, label, sub) {
  let html = '<div class="stat-card">';
  html += '<div class="stat-value">' + value + '</div>';
  html += '<div class="stat-label">' + label + '</div>';
  if (sub) html += '<div class="stat-sub">' + sub + '</div>';
  html += '</div>';
  return html;
}

function infoRow(label, value) {
  return '<div class="info-label">' + label + '</div><div class="info-value">' + value + '</div>';
}

function renderMarkdown(text) {
  if (!text) return '';
  let html = esc(text);
  html = html.replace(/\\\`\\\`\\\`([\\s\\S]*?)\\\`\\\`\\\`/g, '<pre><code>$1</code></pre>');
  html = html.replace(/\\\`([^\\\`]+)\\\`/g, '<code>$1</code>');
  html = html.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
  html = html.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, function(m, label, url) {
    if (/^https?:\\/\\//i.test(url)) return '<a href="' + url + '" target="_blank">' + label + '</a>';
    return '[' + label + '](' + url + ')';
  });
  return html;
}

function highlightSearch(text, query) {
  const escaped = esc(text.slice(0, 300));
  const re = new RegExp('(' + query.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&') + ')', 'gi');
  return escaped.replace(re, '<span class="search-highlight">$1</span>');
}

function customConfirm({ icon, title, message, confirmText, confirmClass }) {
  return new Promise(resolve => {
    const root = document.getElementById('modal-root');
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = '<div class="modal-box">'
      + '<div class="modal-icon">' + (icon || '⚠️') + '</div>'
      + '<div class="modal-title">' + (title || 'Are you sure?') + '</div>'
      + '<div class="modal-message">' + (message || '') + '</div>'
      + '<div class="modal-actions">'
      + '<button class="modal-btn" id="modal-cancel">Cancel</button>'
      + '<button class="modal-btn ' + (confirmClass || 'danger') + '" id="modal-confirm">' + (confirmText || 'Confirm') + '</button>'
      + '</div></div>';
    root.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    function close(result) {
      overlay.classList.remove('show');
      setTimeout(() => { overlay.remove(); }, 200);
      document.removeEventListener('keydown', handler);
      resolve(result);
    }
    function handler(e) {
      if (e.key === 'Escape') close(false);
    }
    overlay.querySelector('#modal-cancel').onclick = () => close(false);
    overlay.querySelector('#modal-confirm').onclick = () => close(true);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });
    document.addEventListener('keydown', handler);
  });
}

function showToast(msg, duration) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  // Style warning messages differently
  if (msg.startsWith('⚠')) {
    toast.style.color = 'var(--orange)';
    toast.style.borderColor = 'var(--orange-dim, rgba(255,165,0,0.3))';
  } else {
    toast.style.color = '';
    toast.style.borderColor = '';
  }
  toast.classList.add('show');
  const ms = duration || (msg.startsWith('⚠') ? 4000 : 2000);
  setTimeout(() => toast.classList.remove('show'), ms);
}

// ─── CLAUDE.md Viewer/Editor ───
let _claudeMdOriginal = '';
let _claudeMdMode = 'preview'; // 'preview' or 'edit'

function renderMdToHtml(md) {
  if (!md) return '';
  let html = esc(md);
  // Code blocks
  html = html.replace(/\\\`\\\`\\\`([\\s\\S]*?)\\\`\\\`\\\`/g, '<pre><code>$1</code></pre>');
  // Inline code
  html = html.replace(/\\\`([^\\\`]+)\\\`/g, '<code>$1</code>');
  // Bold
  html = html.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>');
  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\\/li>\\n?)+/g, function(m) { return '<ul>' + m + '</ul>'; });
  // Links
  html = html.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, function(m, label, url) {
    if (/^https?:\\/\\//i.test(url)) return '<a href="' + url + '" target="_blank">' + label + '</a>';
    return '[' + label + '](' + url + ')';
  });
  // Paragraphs (double newlines)
  html = html.replace(/\\n\\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  html = html.replace(/<p><(h[1-3]|pre|ul|ol|blockquote|hr)/g, '<$1');
  html = html.replace(/<\\/(h[1-3]|pre|ul|ol|blockquote)><\\/p>/g, '</$1>');
  html = html.replace(/<hr><\\/p>/g, '<hr>');
  html = html.replace(/<p><\\/p>/g, '');
  return html;
}

async function showClaudeMd() {
  const container = document.getElementById('claude-md-view');
  container.classList.remove('hidden');
  container.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text-muted)">Loading…</div>';

  try {
    const resp = await fetch('/api/claude-md');
    const data = await resp.json();

    if (data.error && !data.exists) {
      // File does not exist — show empty state with create option
      container.innerHTML = '<div class="claude-md-container">'
        + '<div class="claude-md-header">'
        + '<div><div class="claude-md-title"><span class="icon">📄</span> CLAUDE.md</div>'
        + '<div class="claude-md-path">' + esc(data.path || '~/.claude/CLAUDE.md') + '</div></div>'
        + '</div>'
        + '<div class="claude-md-empty">'
        + '<div class="icon">📝</div>'
        + '<div class="title">No global CLAUDE.md found</div>'
        + '<div class="desc">Create a global CLAUDE.md to set custom instructions that apply to all your Claude Code sessions.</div>'
        + '<button class="btn" onclick="createClaudeMd()" style="margin-top:8px">Create CLAUDE.md</button>'
        + '</div></div>';
      return;
    }

    _claudeMdOriginal = data.content || '';
    _claudeMdMode = 'preview';
    renderClaudeMdView(container, data.content || '', data.path);
  } catch (err) {
    container.innerHTML = '<div style="text-align:center;padding:60px;color:var(--red)">Failed to load: ' + esc(err.message) + '</div>';
  }
}

function renderClaudeMdView(container, content, filePath) {
  let html = '<div class="claude-md-container">';
  html += '<div class="claude-md-header">';
  html += '<div><div class="claude-md-title"><span class="icon">📄</span> CLAUDE.md</div>';
  html += '<div class="claude-md-path">' + esc(filePath || '~/.claude/CLAUDE.md') + '</div></div>';
  html += '<div class="claude-md-actions">';
  html += '<button class="btn" onclick="reloadClaudeMd()" title="Reload from disk">↻ Reload</button>';
  html += '</div>';
  html += '</div>';

  // Tab bar
  html += '<div class="claude-md-tab-bar">';
  html += '<button class="claude-md-tab' + (_claudeMdMode === 'preview' ? ' active' : '') + '" onclick="switchClaudeMdTab(\\'preview\\')">Preview</button>';
  html += '<button class="claude-md-tab' + (_claudeMdMode === 'edit' ? ' active' : '') + '" onclick="switchClaudeMdTab(\\'edit\\')">Edit</button>';
  html += '</div>';

  if (_claudeMdMode === 'edit') {
    html += '<textarea class="claude-md-editor" id="claude-md-editor" oninput="onClaudeMdInput()">' + esc(content) + '</textarea>';
    const modified = content !== _claudeMdOriginal;
    html += '<div class="claude-md-save-bar">';
    html += '<span class="status' + (modified ? ' modified' : '') + '">' + (modified ? '● Modified' : 'No changes') + '</span>';
    html += '<button class="btn" onclick="saveClaudeMd()" ' + (modified ? '' : 'disabled') + '>Save</button>';
    html += '</div>';
  } else {
    if (!content.trim()) {
      html += '<div class="claude-md-empty">';
      html += '<div class="icon">📝</div>';
      html += '<div class="title">CLAUDE.md is empty</div>';
      html += '<div class="desc">Switch to the Edit tab to add your custom instructions.</div>';
      html += '</div>';
    } else {
      html += '<div class="claude-md-preview">' + renderMdToHtml(content) + '</div>';
    }
  }

  html += '</div>';
  container.innerHTML = html;
}

function switchClaudeMdTab(mode) {
  _claudeMdMode = mode;
  const container = document.getElementById('claude-md-view');
  // Preserve current editor content when switching tabs (don't lose unsaved edits)
  const editor = document.getElementById('claude-md-editor');
  const currentContent = editor ? editor.value : _claudeMdOriginal;
  renderClaudeMdView(container, currentContent, '~/.claude/CLAUDE.md');
}

function onClaudeMdInput() {
  const editor = document.getElementById('claude-md-editor');
  if (!editor) return;
  const modified = editor.value !== _claudeMdOriginal;
  const statusEl = document.querySelector('.claude-md-save-bar .status');
  const saveBtn = document.querySelector('.claude-md-save-bar .btn');
  if (statusEl) {
    statusEl.textContent = modified ? '● Modified' : 'No changes';
    statusEl.className = 'status' + (modified ? ' modified' : '');
  }
  if (saveBtn) saveBtn.disabled = !modified;
}

async function saveClaudeMd() {
  const editor = document.getElementById('claude-md-editor');
  if (!editor) return;
  const content = editor.value;
  const saveBtn = document.querySelector('.claude-md-save-bar .btn');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving…'; }

  try {
    const resp = await fetch('/api/claude-md', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    const data = await resp.json();
    if (data.error) throw new Error(data.error);
    _claudeMdOriginal = content;
    showToast('CLAUDE.md saved');
    onClaudeMdInput(); // refresh modified status
  } catch (err) {
    showToast('Save failed: ' + err.message);
  } finally {
    if (saveBtn) saveBtn.textContent = 'Save';
  }
}

async function createClaudeMd() {
  try {
    const resp = await fetch('/api/claude-md', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '# CLAUDE.md\\n\\nCustom instructions for Claude Code.\\n' }),
    });
    const data = await resp.json();
    if (data.error) throw new Error(data.error);
    showToast('CLAUDE.md created');
    showClaudeMd();
  } catch (err) {
    showToast('Create failed: ' + err.message);
  }
}

async function reloadClaudeMd() {
  showClaudeMd();
}

// ─── Boot ───
init();
</script>
</body>
</html>`;
}
