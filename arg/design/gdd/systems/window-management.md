# SYS-01: 窗口管理系统 GDD

> **所属游戏**: 镜中人 (The Man in the Mirror)  
> **文档版本**: v1.0  
> **最后更新**: 2026-07-16  

---

## 1. 概述

Windows 98 桌面模拟系统。为所有其他子系统提供 Win98 风格的窗口化操作环境。这是整个游戏的基础交互层——所有叙事必须通过"操作系统内"的界面传达，不打破 Win98 外壳。

### 设计目标
- 视觉上精确模拟 Windows 98 桌面体验
- 提供窗口的创建、关闭、最小化、最大化、拖拽、焦点管理
- 通过任务栏提供多窗口切换
- 通过开始菜单提供系统级操作（重启）
- 桌面图标作为"应用程序"的入口

---

## 2. 机制

### 2.1 窗口生命周期

```
[关闭/最小化] ←── [已打开] ──→ [获得焦点] ──→ [被拖拽] ──→ [新位置]
     │               │                │
     ↓               ↓                ↓
  display:none   display:flex    z-index++
```

### 2.2 窗口状态机

| 状态 | 条件 | 视觉效果 |
|------|------|----------|
| `closed` | 初始 / `closeWindow()` 调用 | `display: none` |
| `open` | `openWindow()` 调用 | `display: flex`, z-index 递增 |
| `minimized` | `minWindow()` 调用 | `display: none`, `windows[name]` 保持 true |
| `maximized` | `maxWindow()` 调用 | `left:0; top:0; width:100vw; height:calc(100vh-32px)` |
| `focused` | 用户点击 / `focusWin()` 调用 | z-index 最高, 任务栏高亮 |
| `dragging` | 用户拖拽标题栏 | 跟随鼠标移动 |

### 2.3 三窗口管理

| 窗口 | ID | 默认位置 | 默认大小 | 图标 |
|------|-----|----------|----------|------|
| 浏览器 (IE) | `win-browser` | left:40px, top:30px | 700×520px | 🌐 |
| 终端 (CMD) | `win-terminal` | left:200px, top:100px | 540×360px | 🖥️ |
| 记事本 (readme) | `win-readme` | left:90px, top:70px | 420×320px | 📄 |

### 2.4 拖拽机制

- 触发：`mousedown` on `.window-title`
- 计算偏移：`dragX = e.clientX - el.offsetLeft`
- 跟随：`mousemove` → 更新 `el.style.left/top`
- 结束：`mouseup` → 清除监听器

---

## 3. 数据

### 3.1 状态变量

```javascript
let winZIndex = 10;                          // 全局 z-index 计数器
const windows = { browser: false, terminal: false, readme: false };  // 窗口开关状态
let activeWin = null;                        // 当前焦点窗口名
let dragWin = null, dragX = 0, dragY = 0;   // 拖拽状态
```

### 3.2 任务栏项标签映射

```javascript
const labels = {
  browser: '🌐 Internet Explorer',
  terminal: '🖥️ CMD',
  readme: '📄 readme.txt'
};
```

---

## 4. 公式/规则

无数值公式。行为规则：

- **z-index 递增**: 每次 `openWindow()` 或 `focusWin()` 使 `winZIndex++`，确保最新交互的窗口在最上层
- **最小化 ≠ 关闭**: `minWindow()` 仅隐藏窗口但保留 `windows[name] = true`，任务栏项保留
- **焦点互斥**: 同时只有一个 `activeWin`

---

## 5. 边缘情况

| 场景 | 处理 |
|------|------|
| 窗口最小化后再次双击桌面图标 | `focusWin()` 检测 `windows[name]==true` → 重新显示而非创建 |
| 拖拽时鼠标移出窗口 | `document.onmousemove` 绑定在 document 上，继续跟踪 |
| 同时打开多个窗口 | 各自独立 z-index，任务栏显示多个标签 |
| 结局触发后打开窗口 | 窗口管理系统不感知结局——建议 SYS-06 结局后关闭所有非终端窗口 |
| 窗口被拖到屏幕外 | 无边界限制——玩家可以故意把窗口拖出视野（符合 Win98 行为） |
| 快速双击桌面图标 | `openWindow` 无防抖——每次双击都会 z-index++ 但窗口只显示一次 |

---

## 6. UI 接口

### 6.1 桌面组件

| 组件 | CSS 类/ID | HTML 结构 |
|------|-----------|-----------|
| 桌面背景 | `#desktop` | teal 色 (#008080) + 网格纹理 |
| 桌面图标 | `.desk-icon` | icon emoji + label text |
| 任务栏 | `#taskbar` | 蓝色渐变 + 开始按钮 + 任务项 + 时钟 |
| 开始菜单 | `#start-menu` | 竖条 banner + 菜单项列表 |
| 时钟 | `#clock` | 右上角，格式 HH:MM |

### 6.2 窗口 Chrome 结构

```
.window
├── .window-title         ← 拖拽手柄
│   ├── .wt-icon          ← 窗口图标
│   ├── .wt-text          ← 窗口标题
│   └── .wt-btns          ← 最小化/最大化/关闭按钮
├── .window-menu          ← 菜单栏（仅浏览器）
├── .browser-toolbar      ← 工具栏（仅浏览器）
└── .window-body          ← 内容区
    └── (系统特定内容)
```

---

## 7. 依赖

### 依赖方
- 无外部依赖（基础层）

### 被依赖方
- SYS-02 论坛浏览系统：需要窗口容器
- SYS-03 终端交互系统：需要窗口容器
- SYS-04 叙事推进系统：通过 readme.txt 动态内容依赖
- SYS-06 结局触发系统：结局覆盖层覆盖在窗口之上

---

## 8. 验收标准

- [x] 三个窗口均可独立打开/关闭/最小化/最大化/拖拽
- [x] 任务栏正确反映窗口开关状态
- [x] 焦点窗口在任务栏高亮
- [x] 开始菜单可打开/点击外部关闭
- [x] 时钟实时更新
- [x] 重启按钮刷新页面
- [x] 窗口 z-index 层级正确
- [ ] 结局触发后自动最小化或关闭浏览器/记事本窗口
