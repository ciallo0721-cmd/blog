# SYS-03: 终端交互系统 GDD

> **所属游戏**: 镜中人 (The Man in the Mirror)  
> **文档版本**: v1.0  
> **最后更新**: 2026-07-16  

---

## 1. 概述

模拟 Windows 98 CMD 命令行终端。这是玩家与游戏世界进行深层交互的核心界面——通过终端连接到老刀留下的监控服务器，查看隐藏信息，与镜中人建立双向通信，并做出最终选择。

### 设计目标
- 精确模拟 CRT 终端体验（黑底绿字、等宽字体）
- 提供 9 个核心命令，每个导向不同叙事信息
- 连接操作作为"突破第四面墙"的仪式感时刻
- 命令输入作为玩家主动性的最高表达

---

## 2. 机制

### 2.1 终端阶段状态机

```
idle ──→ connected ──→ exploring ──→ mirror_talk ──→ ending
 │          │              │               │             │
 │    connect命令    posts/status    talk命令      结局触发
 │          │         /mirror          │             │
 └──────────┴────────────┴─────────────┴─────────────┘
```

### 2.2 命令解析流程

```
terminalKeydown(Enter)
  │
  ├─ mirrorRound in [1,4]? ──→ advanceMirrorDialogue() → return
  │
  ├─ cmd === 'help'    → 显示命令列表
  ├─ cmd === 'posts'   → 显示隐藏帖子, postsRead=true
  ├─ cmd === 'status'  → 显示角色状态, statusChecked=true
  ├─ cmd === 'mirror'  → 显示镜中人活动记录
  ├─ cmd === 'talk'    → mirrorRound=1, 进入对话
  ├─ cmd === 'sever'   → triggerEnding('A')
  ├─ cmd === 'watch'   → triggerEnding('B')
  ├─ cmd === 'seal'    → 检查 postsRead → 确认提示或错误
  ├─ cmd === 'confirm' → 检查上下文 → triggerEnding('D') 或错误
  ├─ cmd === 'clear'   → 清空历史, 重绘
  └─ default           → "未知命令"
```

### 2.3 连接仪式感

```
> connect mirror-forum.bbs

正在连接 mirror-forum.bbs ...
连接已建立。
远程主机：mirror-forum.bbs
端口：23
协议：Telnet (模拟)

[mirror/log] 监控程序 v2.1 — 老刀 2002
最后一次管理员登录：2002年11月15日 23:47 (深海)
监控持续运行中：已运行 24 年 7 个月 18 天
----------------------------------------
检测到新连接。你是自2003年3月7日以来第一个连接此服务器的人。
```

### 2.4 命令输出分类

| 样式类 | 颜色 | 用途 |
|--------|------|------|
| `terminal-output` | #00cc00 (绿) | 一般命令输出 |
| `terminal-mirror` | #c0392b (暗红) | 镜中人相关内容 |
| `terminal-system` | #f39c12 (橙) | 系统/角色状态信息 |
| `terminal-error` | #cc0000 (红) | 错误提示 |
| `terminal-dim` | #555 (灰) | 次要/历史信息 |
| `terminal-prompt` | #00cc00 (绿) | 命令提示符 |
| `terminal-cmd` | #fff (白) | 用户输入回显 |

---

## 3. 数据

### 3.1 状态变量

```javascript
terminalPhase: 'idle' | 'connected' | 'exploring' | 'mirror_talk' | 'ending'
terminalConnected: bool      // 是否已连接镜像服务器
postsRead: bool              // 是否用 posts 命令查看了隐藏帖子
statusChecked: bool          // 是否用 status 命令查看了角色状态
mirrorRound: 0-4             // 镜中人对话轮次
commandHistory: Array<{cmd, output, cls}>  // 命令历史
```

### 3.2 命令完整列表

| 命令 | 类别 | 解锁条件 | 效果 | 叙事意义 |
|------|------|----------|------|----------|
| `help` | 元命令 | 无 | 显示所有命令 | 帮助导航 |
| `connect` | 连接 | `terminalConnected=false` | 连接服务器 | "突破第四面墙" |
| `posts` | 探索 | 已连接 | 显示隐藏帖#12 | 发现被隐藏的真相 |
| `status` | 探索 | 已连接 | 显示角色命运 | 了解每个角色的结局 |
| `mirror` | 探索 | 已连接 | 显示镜中人活动 | 理解镜中人的存在 |
| `talk` | 交互 | 已连接 | 进入对话树 | 主动与未知沟通 |
| `sever` | 终局 | 已连接 | 结局A | 切断连接 |
| `watch` | 终局 | 已连接 | 结局B | 承担守望者 |
| `seal` | 终局 | 已连接 + postsRead | 结局D（需confirm） | 封印——忘记一切 |
| `confirm` | 终局 | seal 后 | 确认封印 | 最终确认 |
| `clear` | 工具 | 已连接 | 清屏 | UX辅助 |

---

## 4. 公式/规则

### 对话推进

```
mirrorRound: 0 → (talk) → 1 → (任意输入) → 2 → (任意输入) → 3 → (任意输入) → 4 → (任意输入) → ENDING C
```

### 连接时效计算

```javascript
const years = currentYear - 2002;  // 当前年份 - 2002
const months = currentMonth - 11;  // 当前月份 - 11月
const days = currentDay - 15;      // 当前日 - 15日
// 显示格式: "已运行 {years} 年 {months} 个月 {days} 天"
```

> **注意**: 当前实现硬编码为 "24 年 7 个月 18 天"（基于编写日期 2026-07-03）。应改为动态计算。

---

## 5. 边缘情况

| 场景 | 处理 |
|------|------|
| 未连接时输入命令 | `'xxx' 不是内部或外部命令` + 提示 `connect` |
| 连接前输入 `help` | 显示 `connect [host]` 提示 |
| 对话中尝试输入其他命令 | 任何输入都会推进对话（`mirrorRound` 1-4期间） |
| `seal` 前未执行 `posts` | 显示错误："请先使用 posts 命令查看隐藏内容" |
| `confirm` 前未执行 `seal` | 显示错误："没有待确认的操作" |
| 结局触发后输入命令 | `endingTriggered !== null` → 直接 return |
| 多次连接 | `terminalConnected` 已 true → 不重复连接 |
| 命令大小写 | 所有命令 `toLowerCase()` 处理 |
| 空命令 | 直接 return，无反馈 |
| 终端关闭后重新打开 | `renderTerminal()` 恢复已保存的 HTML |

---

## 6. UI 接口

### 6.1 终端布局

```
┌─ 命令提示符 — CMD.EXE ──────────────────────────┐
│ .terminal-body (黑底 #0a0a0a, 绿字 #00cc00)      │
│                                                   │
│  [历史输出区域]                                    │
│  - 欢迎信息 / 系统输出                             │
│  - 历史命令 + 响应                                 │
│  - 对话内容                                       │
│                                                   │
│  C:\mirror> [输入框]                              │
│  ↑ .terminal-prompt  ↑ #terminal-input            │
└───────────────────────────────────────────────────┘
```

### 6.2 输入框实现

- 初始状态：点击终端区域后生成 `<input id="terminal-input-init">`
- 连接后：始终保留 `<input id="terminal-input">` 在 Prompt 后
- 自动聚焦：每次 `renderTerminal()` 后 `setTimeout` 聚焦输入框
- 样式：透明背景、无边框、绿色光标 (caret-color: #0f0)

### 6.3 终端输出样式类

```css
.terminal-body     { background:#0a0a0a; color:#00cc00; font-family:"Courier New",monospace; }
.terminal-output   { color:#00cc00; }   /* 正常输出 */
.terminal-mirror   { color:#c0392b; font-style:italic; }  /* 镜中人 */
.terminal-system   { color:#f39c12; }   /* 系统状态 */
.terminal-error    { color:#cc0000; }   /* 错误 */
.terminal-dim      { color:#555; }      /* 次要信息 */
.terminal-prompt   { color:#00cc00; }   /* C:\mirror> */
.terminal-cmd      { color:#fff; }      /* 用户输入回显 */
```

---

## 7. 依赖

### 上游依赖
- **SYS-01 窗口管理**: 终端窗口容器
- **SYS-04 叙事推进**: `browserPhase` 状态可用于终端初始化情境提示

### 下游被依赖
- **SYS-05 镜中人对话**: `talk` 命令触发对话系统
- **SYS-06 结局触发**: `sever`/`watch`/`talk`/`seal`+`confirm` 触发结局

---

## 8. 验收标准

- [x] 终端黑底绿字 CRT 风格正确渲染
- [x] 连接过程有仪式感（逐行动画 → 欢迎信息）
- [x] 9 个命令全部可用且返回正确输出
- [x] 命令历史正确记录和渲染
- [x] `clear` 清屏功能正常
- [x] 镜中人对话中锁定命令输入
- [x] 结局触发后输入被锁定
- [x] 输入框自动聚焦
- [x] 终端关闭再打开恢复状态
- [ ] Token-by-token 打字效果（Should Have S4）
- [ ] 连接时效动态计算（当前硬编码）
