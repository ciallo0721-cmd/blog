# 镜中人 (The Man in the Mirror) — 架构文档

> 版本: 1.0 | 日期: 2026-03-25 | 作者: 程基岩 (工程负责人)
>
> 基于代码审查: `arg/index.html`, `js/js/arg-index.js`, `css/css/arg-index.css`

---

## 1. 技术栈总览

| 层 | 技术 | 版本/说明 |
|---|------|----------|
| 结构 | HTML5 | 单页面应用，内联窗口骨架 |
| 样式 | CSS3 | 无预处理器，CSS 变量 + 动画 |
| 逻辑 | Vanilla JavaScript (ES6+) | 零框架，零依赖，全局作用域 |
| 托管 | GitHub Pages | 纯静态，无服务端 |
| 分析 | Google Analytics 4 (gtag) | `G-TR4FT7JPDZ`，外部加载 |
| 广告 | 自定义广告系统 | `ad-system.js` + `ad-data.js`（与游戏逻辑无关） |
| 外部依赖 | 无 | 无 npm 包，无 CDN 框架，无 polyfill |

**决策要点**: 纯前端网页 ARG 游戏，所有内容静态托管。目标浏览器为现代浏览器（Chrome/Firefox/Edge/Safari），不兼容 IE。

---

## 2. 模块划分

```
┌──────────────────────────────────────────────────────┐
│                    index.html                        │
│  ┌─────────────┐  ┌──────────┐  ┌───────────────┐   │
│  │ Desktop     │  │ Taskbar  │  │ Start Menu    │   │
│  │ (desk-icon) │  │ (clock)  │  │ (sm-item)     │   │
│  └──────┬──────┘  └──────────┘  └───────────────┘   │
│         │          (任务栏按钮)                       │
│         ▼                                            │
│  ┌──────────────────────────────────────────────┐    │
│  │            Window System (窗口管理)            │    │
│  │  openWindow / closeWindow / minWindow /      │    │
│  │  maxWindow / focusWin / startDrag            │    │
│  │  winZIndex / windows{} / activeWin           │    │
│  └──────┬───────────────┬───────────┬───────────┘    │
│         │               │           │                 │
│    ┌────▼────┐    ┌─────▼─────┐  ┌──▼──────────┐    │
│    │ Browser │    │ Terminal  │  │  Readme     │    │
│    │ Window  │    │  Window   │  │  Window     │    │
│    └────┬────┘    └─────┬─────┘  └─────────────┘    │
│         │               │                             │
│  ┌──────▼──────┐  ┌─────▼──────────┐                 │
│  │ Browser     │  │ Terminal       │                 │
│  │ Renderer    │  │ Renderer       │                 │
│  │ (warn/forum/│  │ (idle/connect/ │                 │
│  │  wayback/   │  │  explore/talk) │                 │
│  │  snapshot)  │  │                │                 │
│  └──────┬──────┘  └─────┬──────────┘                 │
│         │               │                             │
│  ┌──────▼───────────────▼──────────────┐             │
│  │         GAME_STATE (全局状态)        │             │
│  │  browserPhase / terminalPhase /     │             │
│  │  postsRevealed / mirrorRound /      │             │
│  │  endingTriggered / dialogLocked     │             │
│  └──────┬──────────────────────────────┘             │
│         │                                             │
│  ┌──────▼──────────────┐                             │
│  │   Data (静态数据)     │                             │
│  │  FORUM_POSTS[12]    │                             │
│  │  ENDINGS{A,B,C,D}   │                             │
│  └─────────────────────┘                             │
│                                                       │
│  ┌──────────────────────┐                            │
│  │   Ending System      │                            │
│  │  triggerEnding()     │                            │
│  │  showEndingOverlay() │                            │
│  └──────────────────────┘                            │
└──────────────────────────────────────────────────────┘

┌─────────────────┐     ┌─────────────────┐
│  arg-index.css  │     │  External       │
│  (Win98 外壳    │     │  gtag-config.js │
│   + 叙事样式)   │     │  ad-system.js   │
└─────────────────┘     │  ad-data.js     │
                        └─────────────────┘
```

### 模块职责说明

| 模块 | 文件 | 职责 |
|------|------|------|
| **桌面 + 任务栏** | `index.html` + CSS | 静态 DOM 骨架，Win98 桌面图标、开始菜单、任务栏 |
| **窗口管理** | `arg-index.js` (行 35-143) | 窗口打开/关闭/最小化/最大化/拖拽/焦点/z-index |
| **浏览器渲染** | `arg-index.js` (行 173-370) | 警告页 → 论坛页 → 时光机 → 快照 的页面渲染与导航 |
| **终端交互** | `arg-index.js` (行 372-706) | CMD 模拟，命令解析，镜中人对话树，结局触发 |
| **游戏状态** | `arg-index.js` (行 9-30) | 全局 GAME_STATE 对象，单一状态源 |
| **数据层** | `arg-index.js` (行 148-171) | 论坛帖子、结局文本（硬编码内联） |
| **结局系统** | `arg-index.js` (行 676-707) | 结局触发、终端展示、桌面 overlay 动画 |
| **初始化** | `arg-index.js` (行 712-720) | 自动打开浏览器、绑定桌面图标双击事件 |
| **样式系统** | `arg-index.css` | Win98 外壳样式 + 论坛/终端/结局叙事样式 + glitch 动画 |
| **外部系统** | `gtag-config.js`, `ad-*.js` | GA4 分析埋点、广告位渲染（与游戏逻辑独立） |

---

## 3. 数据流

```
┌──────────────┐      ┌───────────────┐      ┌──────────────┐
│  用户操作     │ ────→│  GAME_STATE    │ ────→│  render*()   │
│              │      │  变更          │      │  函数        │
│ 双击图标     │      │               │      │              │
│ 输入文本     │      │ browserPhase   │      │ renderBrowser│
│ 点击按钮     │      │ terminalPhase  │      │ Content()    │
│ 输入命令     │      │ postsRevealed  │      │ renderTerminal│
│ 拖拽窗口     │      │ mirrorRound    │      │              │
└──────────────┘      │ commandHistory │      └──────┬───────┘
                      └───────────────┘             │
                                                    ▼
                                            ┌──────────────┐
                                            │  DOM 更新     │
                                            │              │
                                            │ innerHTML    │
                                            │ 直接替换     │
                                            │              │
                                            │ scrollTop    │
                                            │ 滚动到底部   │
                                            └──────────────┘
```

### 具体数据流路径

```
路径 1: 论坛阅读流
  用户点击"继续" → enterForum() → GAME_STATE.browserPhase='forum'
  → renderForumPage() → innerHTML 注入帖子 HTML → scrollTop 到底部

路径 2: 终端命令流
  用户输入命令 + Enter → terminalKeydown()
  → switch(cmd) 修改 GAME_STATE 各字段
  → commandHistory.push({cmd, output, cls})
  → renderTerminal() → 重新构建全部终端 HTML → innerHTML 替换
  → setTimeout 聚焦 input 元素

路径 3: 结局触发流
  triggerEnding(key) → GAME_STATE.endingTriggered=key
  → GAME_STATE.dialogLocked=true
  → 终端追加结局文本
  → 2秒后 showEndingOverlay() → document.body.appendChild(overlay)
```

---

## 4. 事件总线 / 通信方式

当前架构**没有显式事件总线**，使用以下通信方式：

| 通信方式 | 使用场景 | 评估 |
|----------|----------|------|
| **全局函数直接调用** | `openWindow('browser')`, `renderForumPage()`, `triggerEnding('A')` | 当前唯一通信方式。函数间隐式依赖，无解耦 |
| **DOM onclick 属性** | `onclick="openWindow('browser')"`, `ondblclick="..."` | HTML 内联事件，与 JS 函数紧耦合 |
| **GAME_STATE 全局读写** | 所有模块直接读写 `GAME_STATE.*` | 无变更通知、无订阅机制，渲染靠显式调用 |
| **window._savedTerminalHTML** | 终端内容缓存，避免结局后重新渲染丢失内容 | 脆弱的隐式契约 |
| **setTimeout 延迟** | `setTimeout(() => $('terminal-input').focus(), 50)` | 用于 DOM 更新后的焦点管理，不可靠 |

**关键缺失**:
- 无发布/订阅机制 — 任何状态变更都需要显式调用渲染函数
- 无变更检测 — 不知道 GAME_STATE 的哪个字段被修改了
- 无错误边界 — 渲染函数中的异常会静默失败或破坏 UI

---

## 5. 文件和目录结构

```
G:\EmoScan Pro\ciallo0721-cmd.github.io\
│
├── arg/                              ← 游戏根目录 (GitHub Pages 子路径)
│   ├── index.html                    ← 入口: DOM 骨架 + 外部引用
│   └── docs/
│       └── architecture/             ← 本架构文档目录
│           ├── architecture.md       ← 主架构文档
│           ├── adr-001-vanilla-js.md
│           ├── adr-002-inline-data.md
│           ├── adr-003-custom-window-manager.md
│           ├── adr-004-single-file-architecture.md
│           ├── code-health-report.md
│           ├── tech-debt.md
│           └── architecture-review.md
│
├── js/js/                            ← JavaScript 资源（与 arg/ 同级）
│   ├── arg-index.js                  ← ★ 全部游戏逻辑 (33KB, ~720行)
│   ├── gtag-config.js                ← GA4 分析埋点（全局共享）
│   ├── ad-system.js                  ← 广告系统（全局共享）
│   ├── ad-data.js                    ← 广告数据（全局共享）
│   └── ...                           ← 100+ 个其他页面 JS 文件
│
└── css/css/                          ← CSS 资源（与 arg/ 同级）
    ├── arg-index.css                 ← ★ 全部游戏样式 (12KB, ~236行)
    ├── effects.css                   ← 特效样式（全局共享）
    └── ...                           ← 60+ 个其他页面 CSS 文件
```

### 路径引用关系

```
arg/index.html
  ├── ../js/js/gtag-config.js   (GTAG 分析)
  ├── ../css/css/arg-index.css  (游戏样式)
  ├── ../js/js/arg-index.js     (游戏逻辑)
  ├── ../js/js/ad-data.js       (广告数据)
  └── ../js/js/ad-system.js     (广告系统)
```

**注意**: `arg/` 目录下有独立的 `design.md`（叙事设计文档），不含技术架构信息。所有 JS/CSS 资源与网站其他页面共享 `js/js/` 和 `css/css/` 目录，存在命名冲突风险。

---

## 6. 关键设计决策摘要

| 决策 | ADR 编号 | 简述 |
|------|----------|------|
| Vanilla JS 而非框架 | ADR-001 | 零依赖、GitHub Pages 纯静态、无构建步骤 |
| 数据内联在 JS 中 | ADR-002 | 避免 XHR 加载、简化部署、数据量小（~4KB 文本） |
| 自实现窗口管理 | ADR-003 | Win98 窗口语义特殊，现有库过重且不匹配 |
| 单文件 JS 架构 | ADR-004 | 当前阶段的权衡；推荐在功能增长时拆分为模块 |

详见各 ADR 文档。

---

## 7. 技术约束

1. **纯静态托管**: GitHub Pages，无服务端、无数据库、无 SSR
2. **零构建步骤**: 无 webpack/vite/babel，直接写 ES6+ 由现代浏览器执行
3. **共享目录**: JS/CSS 文件位于项目级共享目录，不能引入与全局命名冲突的变量
4. **无模块系统**: 不使用 ES modules (`import`/`export`)，所有代码在全局作用域
5. **浏览器兼容**: 仅现代浏览器 (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+)
6. **响应式**: 需要支持桌面端浏览（主要场景），移动端非目标但基础可用

---

## 8. 术语表

| 术语 | 定义 |
|------|------|
| GAME_STATE | 全局可变状态对象，游戏唯一的数据源 |
| browserPhase | 浏览器窗口的内容状态机：`warn → forum → wayback → snapshot → snapshot2003` |
| terminalPhase | 终端窗口的内容状态机：`idle → connected → exploring → mirror_talk → ending` |
| FORUM_POSTS | 12 条论坛帖子的静态数据数组 |
| ENDINGS | 4 种结局（A/B/C/D）的静态数据对象 |
| 镜中人对话 | `talk` 命令触发的 4 轮对话，第 4 轮触发结局 C |
| 窗口系统 | 自实现的 Win98 风格多窗口管理（浏览器/终端/readme 三个窗口） |
