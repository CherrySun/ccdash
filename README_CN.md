# ccdash — Claude Code 会话管理面板

一个轻量级、零依赖的 Web 面板，用于浏览、管理和分析 [Claude Code](https://claude.ai/code) 会话。

基于原生 Node.js (>=18) 构建 — 无 Express、无 React、无构建步骤。运行 `node src/cli.js` 即可使用。

## 功能特性

### Web 面板
- **会话概览** — 按项目或标签分组浏览所有会话，显示状态指示器、token 用量和费用估算
- **会话详情** — 完整对话查看器，支持 Markdown 渲染、工具使用统计、token/费用分析
- **费用面板** — 按时间段（今天/本周/本月/全部）、项目、日期汇总费用报告，含柱状图和饼图
- **活跃进程监控** — 实时查看运行中的 Claude Code 进程，支持聚焦/终止控制
- **全文搜索** — 跨消息内容、文件夹路径、标签、标题、备注和描述搜索
- **会话管理** — 在终端恢复会话、重命名会话、添加备注和标签、删除会话
- **项目文件浏览** — 浏览项目目录，集成 Finder（macOS）

### 命令行
- `ccdash` — 启动 Web 面板（自动打开浏览器）
- `ccdash cli` — 终端中显示会话列表
- `ccdash show <id>` — 查看会话详情和对话预览
- `ccdash resume <id>` — 恢复会话（启动 `claude --resume`）
- `ccdash cost [period]` — 费用报告（today/week/month/all）
- `ccdash search <keyword>` — 搜索会话内容
- `ccdash active` — 列出活跃的 Claude 进程
- `ccdash serve [port]` — 在指定端口启动面板（默认：3456）

### 组织管理
- **标签** — 带颜色的标签（确定性哈希着色），支持按标签筛选/分组
- **备注** — 每个会话可添加自由文本备注
- **重命名** — 自定义会话显示名称（支持原地编辑）
- **分组方式** — 在按项目和按标签分组之间切换

## 架构

```
~/.claude/projects/       ← Claude Code 会话数据（只读）
~/.ccdash/notes.json      ← ccdash 用户元数据（备注、标签、重命名）

src/
├── cli.js                ← CLI 入口和命令
├── server.js             ← 原生 HTTP 服务器和 REST API
├── dashboard.js          ← 单文件 HTML/CSS/JS 面板
├── scanner.js            ← 会话 JSONL 解析器和进程检测
├── pricing.js            ← Token 费用计算器（Sonnet/Opus 定价）
└── notes.js              ← 备注/标签/重命名存储管理
```

**零依赖。** 无 `node_modules`，无 `package-lock.json`。全部使用 Node.js 内置模块（`http`、`fs`、`child_process`、`path`、`os`）。

## 快速开始

```bash
# 克隆并运行
git clone <repo-url> ccdash
cd ccdash
node src/cli.js

# 或全局安装
npm install -g .
ccdash
```

面板将在 `http://localhost:3456` 打开。

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/sessions` | 获取所有会话及元数据 |
| GET | `/api/session/:id` | 获取完整会话（含消息） |
| GET | `/api/active` | 获取活跃 Claude 进程 |
| GET | `/api/costs?period=` | 费用汇总 |
| GET | `/api/search?q=` | 全文搜索 |
| GET | `/api/tags` | 获取所有标签 |
| GET | `/api/filetree?path=` | 目录列表 |
| POST | `/api/notes` | 设置会话备注 |
| POST | `/api/tags` | 添加/删除标签 |
| POST | `/api/rename` | 设置会话显示名称 |
| POST | `/api/refresh` | 强制刷新缓存 |
| POST | `/api/resume` | 在终端恢复会话 |
| POST | `/api/focus` | 聚焦终端标签页（macOS） |
| POST | `/api/kill` | 终止活跃会话进程 |
| POST | `/api/delete-session` | 删除会话 JSONL 文件 |
| POST | `/api/open-finder` | 在 Finder 中显示（macOS） |

## 费用计算

基于 Anthropic 公开 API 定价（每百万 token）：

| 模型 | 输入 | 输出 | 缓存读取 | 缓存写入 |
|------|------|------|----------|----------|
| Sonnet 4 | $3.00 | $15.00 | $0.30 | $3.75 |
| Opus 4 | $15.00 | $75.00 | $1.50 | $18.75 |

未知模型默认按 Opus 定价。费用为估算值，实际账单可能因方案不同而有所差异。

## 平台说明

- **macOS** — 完整功能支持（终端聚焦/恢复、Finder 集成）
- **Linux** — 核心功能可用；终端/Finder 集成仅限 macOS
- **Windows** — 未测试；会话扫描应可工作，平台集成功能不可用

## 数据安全

- ccdash **从不写入** `~/.claude/` — 所有 Claude Code 数据为只读
- 用户元数据（备注、标签、重命名）单独存储在 `~/.ccdash/notes.json`
- 删除会话会移除 `~/.claude/` 中的 JSONL 文件（需明确确认）

## 许可证

MIT
