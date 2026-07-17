# GAME_STATE Schema — 镜中人 (The Man in the Mirror)

> 版本: 1.0 | 日期: 2026-03-25 | 维护: 程基岩 (工程负责人)
>
> 本文档是 GAME_STATE 的权威定义。所有对游戏状态的读写必须与此 schema 一致。
> 新增字段或修改字段时，必须同步更新此文档。

---

## 1. 核心状态对象: `GAME_STATE`

### 1.1 浏览器阶段 (Browser Phase)

| 字段 | 类型 | 默认值 | 合法值 | 描述 |
|------|------|--------|--------|------|
| `browserPhase` | `string` | `'warn'` | `'warn'` \| `'forum'` \| `'wayback'` \| `'snapshot'` \| `'snapshot2003'` | 浏览器窗口当前显示的内容。驱动 `renderBrowserContent()` 的 switch 分支。 |
| `playerName` | `string` | `''` | 任意非空字符串（空时显示"访客"） | 玩家在警告页输入的名字。在 `enterForum()` 中赋值。目前仅用于状态追踪，未在 UI 中显示。 |
| `postsRevealed` | `number` | `0` | `0` – `11` | 已向玩家揭示的帖子数量（索引）。每轮 `submitForumReply()` 推进 +3，直到 11。 |
| `hiddenPostClicked` | `boolean` | `false` | `true` \| `false` | 玩家是否在论坛页点击了隐藏帖子（`id:12`）。点击后帖子内容从灰色变为可读。 |
| `waybackClicked` | `boolean` | `false` | `true` \| `false` | 玩家是否点击了"2003年3月7日"的快照链接。影响论坛回复区的提示文案。 |

**状态机: `browserPhase`**

```
warn ──(enterForum)──→ forum
forum ──(openWayback)──→ wayback
wayback ──(openSnapshot)──→ snapshot
wayback ──(openSnapshot2003)──→ snapshot2003
forum ──(browserHome)──→ warn
```

- `warn → forum`: 必须输入名字（可为空）
- `forum → wayback`: 回复含"时光机"关键字，或点击论坛导航中的"互联网时光机"
- `wayback → snapshot`/`snapshot2003`: 点击搜索结果中的快照链接
- 无直接从 snapshot 回到 forum 的路径（需关闭窗口重新打开）

### 1.2 终端阶段 (Terminal Phase)

| 字段 | 类型 | 默认值 | 合法值 | 描述 |
|------|------|--------|--------|------|
| `terminalPhase` | `string` | `'idle'` | `'idle'` \| `'connected'` \| `'exploring'` \| `'mirror_talk'` \| `'ending'` | 终端当前所处的逻辑阶段。**注意**: 当前代码中仅 `idle` 和 `connected` 被实际使用，其余值仅声明未在逻辑中生效。 |
| `postsRead` | `boolean` | `false` | `true` \| `false` | 玩家是否在终端中执行了 `posts` 命令。解锁 `seal` 命令的前置条件。 |
| `statusChecked` | `boolean` | `false` | `true` \| `false` | 玩家是否执行了 `status` 命令。记录用，目前不影响游戏进程。 |
| `mirrorRound` | `number` | `0` | `0` – `4` | 镜中人对话当前轮次。`0`=未开始；`1-3`=对话中；`4`=下一轮触发结局 C。由 `talk` 命令设为 1，`advanceMirrorDialogue()` 递增。 |
| `commandHistory` | `Array<{cmd, output, cls}>` | `[]` | 对象数组 | 终端命令历史。每条记录包含：`cmd`(原始输入)、`output`(HTML 响应)、`cls`(CSS 类名)。在 `clear` 命令时清空。 |

**状态机: `terminalPhase`**（设计意图）

```
idle ──(connect命令)──→ connected
connected ──(posts/status/mirror)──→ exploring
connected ──(talk)──→ mirror_talk
mirror_talk ──(推进对话)──→ ending
connected ──(sever/watch)──→ ending
```

**实际代码行为**: `terminalPhase` 在 `connect` 时设为 `'connected'`，之后不再变更。状态转换逻辑依赖其他字段（`mirrorRound`、`endingTriggered`），而非 `terminalPhase`。

### 1.3 结局 (Ending)

| 字段 | 类型 | 默认值 | 合法值 | 描述 |
|------|------|--------|--------|------|
| `endingTriggered` | `string \| null` | `null` | `'A'` \| `'B'` \| `'C'` \| `'D'` \| `null` | 已触发的结局标识。`null`=游戏进行中。一旦设置，`triggerEnding()` 会跳过（防重复触发）。 |
| `dialogLocked` | `boolean` | `false` | `true` \| `false` | 结局触发后锁定。`true` 时终端不再接受新命令输入，渲染函数保留已保存的 HTML。 |
| `sealPending` | `boolean` | `false` | `true` \| `false` | **[FIX-2 新增]** `seal` 命令输入后设为 `true`，等待 `confirm` 确认。任何其他命令会重置为 `false`。防止 seal 后输入其他命令导致上下文丢失。 |

**结局触发条件:**

| 结局 | 命令 | 前置条件 | 触发函数 |
|------|------|----------|----------|
| A — 断开连接 | `sever` | `terminalConnected === true` | `triggerEnding('A')` |
| B — 接替者 | `watch` | `terminalConnected === true` | `triggerEnding('B')` |
| C — 穿越 | `talk` → 推进 4 轮对话 | `terminalConnected === true` | `triggerEnding('C')` |
| D — 封印 | `seal` → `confirm` | `postsRead === true` + `sealPending === true` | `triggerEnding('D')` |

**字段交互:**
- `endingTriggered` 为非 null → `dialogLocked` 必然为 `true`
- `dialogLocked === true` → `renderTerminal()` 返回保存的 HTML（不再接受新命令）
- `endingTriggered` 为非 null → `renderBrowserContent()` 和所有浏览器入口函数跳过

### 1.4 全局 (Global)

| 字段 | 类型 | 默认值 | 合法值 | 描述 |
|------|------|--------|--------|------|
| `terminalConnected` | `boolean` | `false` | `true` \| `false` | 终端是否已通过 `connect mirror-forum.bbs` 连接到远程服务器。`true` 后终端界面从 CMD 提示符切换为监控程序界面。 |

---

## 2. 窗口管理状态（不在 GAME_STATE 中，但与游戏状态紧密相关）

| 变量 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `winZIndex` | `number` | `10` | 窗口 z-index 计数器，每次聚焦 +1 |
| `windows` | `{browser, terminal, readme: boolean}` | 全部 `false` | 各窗口是否打开 |
| `activeWin` | `string \| null` | `null` | 当前聚焦的窗口名 |
| `dragWin` | `HTMLElement \| null` | `null` | 正在拖拽的窗口 DOM 元素 |
| `dragX` / `dragY` | `number` | `0` | 拖拽偏移量 |

**注意**: 这些变量不在 `GAME_STATE` 对象中，但在 IIFE 作用域内。未来可考虑合并进 GAME_STATE 以支持保存/恢复窗口布局。

---

## 3. 数据常量（不可变）

### 3.1 `FORUM_POSTS`

**类型**: `Array<ForumPost>`

```typescript
interface ForumPost {
  id: number;        // 1-12
  author: string;    // 发帖人
  date: string;      // "YYYY-MM-DD HH:MM" 格式
  content: string;   // HTML 安全文本
  hidden: boolean;   // true 时默认不显示（仅 id:12 为 true）
}
```

- 长度: 12
- 索引 0-10: 正常帖子
- 索引 11: 隐藏帖子（夜猫子最后一条）

### 3.2 `ENDINGS`

**类型**: `Record<'A'|'B'|'C'|'D', Ending>`

```typescript
interface Ending {
  title: string;   // 结局标题，含 HTML 标签
  text: string;    // 结局正文
  cls: string;     // CSS 类名: 'ending-a' | 'ending-b' | 'ending-c' | 'ending-d'
}
```

---

## 4. 状态写入规范

### 直接赋值（允许）

```js
GAME_STATE.browserPhase = 'forum';      // ✅ 简单状态切换
GAME_STATE.postsRevealed = 10;           // ✅ 直接设置数值
GAME_STATE.hiddenPostClicked = true;     // ✅ 布尔翻转
GAME_STATE.endingTriggered = 'A';        // ✅ 仅当值为 null 时
GAME_STATE.commandHistory.push({...});   // ✅ 追加数组
```

### 受保护写入（需通过专用函数）

| 操作 | 使用函数 | 原因 |
|------|----------|------|
| 触发结局 | `triggerEnding(key)` | 确保 `dialogLocked` 同步设置，浏览器锁定，防重复触发 |
| 重置游戏 | `location.reload()` | 无 undo 机制，刷新页面是唯一重置方式 |
| seal 上下文 | `sealPending` 字段 | 由 `terminalKeydown` 中的 switch 统一管理 |
| 命令历史清空 | `clear` 命令 | `GAME_STATE.commandHistory = []` + `renderTerminal()` |

### 禁止操作

```js
GAME_STATE.endingTriggered = null;  // ❌ 不可逆 — 结局一旦触发不应撤回
GAME_STATE.dialogLocked = false;    // ❌ 在 endingTriggered 非 null 时
```

---

## 5. 游戏流程中的关键状态转换

### 5.1 浏览器流程

```
初始化 (init)
  │
  ├─ setTimeout 500ms → openWindow('browser')
  │
  └─ browserPhase='warn' → renderWarnPage()
       │
       └─ 用户输入名字 + enter → enterForum()
            │
            ├─ playerName = 名字
            ├─ browserPhase='forum'
            └─ renderForumPage()
                 │
                 ├─ 用户回复 → submitForumReply()
                 │    ├─ 含"时光机" → openWayback()
                 │    └─ 否则 postsRevealed += 3 → renderForumPage()
                 │
                 ├─ 点击"互联网时光机" → openWayback()
                 │    └─ browserPhase='wayback' → 搜索 → 快照链接
                 │
                 └─ 快照页提示用终端连接服务器
```

### 5.2 终端流程

```
openWindow('terminal')
  │
  ├─ terminalConnected=false → 显示 CMD 提示符
  │    │
  │    └─ 用户输入 connect mirror-forum.bbs
  │         ├─ terminalConnected=true
  │         ├─ terminalPhase='connected'
  │         └─ 显示监控程序界面
  │
  └─ terminalConnected=true → 接受命令:
       │
       ├─ help    → 显示命令列表
       ├─ posts   → postsRead=true, 显示隐藏帖子
       ├─ status  → statusChecked=true, 显示角色状态
       ├─ mirror  → 显示镜中人活动记录
       ├─ talk    → mirrorRound=1, 进入对话
       │    └─ 连续 4 次输入 → triggerEnding('C')
       ├─ sever   → triggerEnding('A')
       ├─ watch   → triggerEnding('B')
       ├─ seal    → sealPending=true (需 postsRead)
       │    └─ confirm → triggerEnding('D')
       └─ clear   → commandHistory=[]
```

---

## 6. 字段依赖图

```
seal 命令可用 ──依赖──→ postsRead === true
confirm 命令有效 ──依赖──→ sealPending === true
结局 C 触发 ──依赖──→ mirrorRound >= 4
浏览器交互可用 ──依赖──→ endingTriggered === null
终端命令可用 ──依赖──→ terminalConnected === true AND dialogLocked === false
隐藏帖子可见 ──依赖──→ hiddenPostClicked === true (浏览器) OR postsRead === true (终端)
2003快照提示变化 ──依赖──→ waybackClicked === true
```

---

## 7. 变更日志

| 日期 | 版本 | 变更 | 作者 |
|------|------|------|------|
| 2026-03-25 | 1.0 | 初始版本，记录所有现有字段 | 程基岩 |
| 2026-03-25 | 1.1 | 新增 `sealPending` 字段 (FIX-2) | 程基岩 |
