# SYS-06: 结局触发系统 GDD

> **所属游戏**: 镜中人 (The Man in the Mirror)  
> **文档版本**: v1.0  
> **最后更新**: 2026-07-16  

---

## 1. 概述

管理四种结局的触发条件验证、脚本执行、视觉渲染和交互锁定。这是游戏叙事弧线的终点——玩家的最终选择被转换为不可逆的结局状态。

### 设计目标
- 四种结局各需不同的触发条件和叙事代价
- 结局一旦触发即锁定（不可撤销）
- 每个结局都提供完整的叙事闭环
- 隐藏结局D需要额外探索——奖励深度玩家

---

## 2. 机制

### 2.1 结局触发矩阵

| 结局 | 命令 | 前置条件 | 触发方式 | Tier |
|------|------|----------|----------|------|
| **A: 断开连接** | `sever` | 终端已连接 | 直接命令 | 1 |
| **B: 接替者** | `watch` | 终端已连接 | 直接命令 | 1 |
| **C: 穿越** | `talk`(完成) | 终端已连接 + 完成4轮对话 | 对话自然结束 | 1 |
| **D: 封印** | `seal` + `confirm` | 终端已连接 + `postsRead=true` | 两步确认 | 3 |

### 2.2 结局锁定机制

```javascript
function triggerEnding(endingKey) {
  if (GAME_STATE.endingTriggered) return;  // 已触发则忽略
  
  GAME_STATE.endingTriggered = endingKey;   // 设置结局类型
  GAME_STATE.dialogLocked = true;           // 锁定所有交互
  
  // 1. 在终端中显示结局文本
  renderEndingInTerminal(endingKey);
  
  // 2. 延迟后显示全屏结局覆盖画面
  setTimeout(() => showEndingOverlay(endingKey), 2000);
}
```

### 2.3 结局互斥保证

- `endingTriggered` 初始为 `null`
- `triggerEnding()` 第一行检查 `if (endingTriggered) return`
- `terminalKeydown()` 中 `dialogLocked || endingTriggered` 时直接 return
- 所有会触发结局的命令路径（sever/watch/talk/seal+confirm）在执行前都检查 `!endingTriggered`

---

## 3. 数据

### 3.1 结局数据模型

```javascript
ENDINGS = {
  'A': {
    title: '【结局A：断开连接】',
    text: '所有连接已终止。...',
    cls: 'ending-a'       // CSS 类 → 背景色主题
  },
  'B': {
    title: '【结局B：接替者】',
    text: '你已成为镜面论坛服务器的新管理员。...',
    cls: 'ending-b'
  },
  'C': {
    title: '【结局C：穿越】',
    text: '连接建立。正在迁移。屏幕亮了。...',
    cls: 'ending-c'
  },
  'D': {
    title: '【结局D：封印】',
    text: '老刀的隐藏协议已激活。...',
    cls: 'ending-d'
  }
};
```

### 3.2 结局视觉主题

| 结局 | CSS 类 | 背景色 | 文字色 | 情感调性 |
|------|--------|--------|--------|----------|
| A | `ending-a` | #0a0a0a (纯黑) | #fff (白) | 冷硬、终结 |
| B | `ending-b` | #0a1a0a (暗绿黑) | #00cc00 (终端绿) | 责任、守望 |
| C | `ending-c` | #000 (纯黑) | #fff (白) | 超现实、震撼 |
| D | `ending-d` | #1a1a2e (深蓝黑) | #c0c0d0 (灰蓝) | 失落、空洞 |

---

## 4. 公式/规则

### 结局触发优先级（互斥）

```
优先级: C > D > A = B

实际上由于命令互斥，不会出现同时满足多个结局的情况：
- talk 期间命令被劫持，不会误触 sever/watch/seal
- seal 二步确认机制防止误触
- sever/watch 直接触发，先到先得
```

### 结局D的两步确认

```
Step 1: > seal
  IF postsRead === false → ERROR "请先使用 posts 命令查看隐藏内容"
  IF postsRead === true  → 显示老刀最后信息 + "输入 confirm 确认执行"

Step 2: > confirm
  IF 上一步是 seal  → triggerEnding('D')
  ELSE              → ERROR "没有待确认的操作"
```

---

## 5. 边缘情况

| 场景 | 处理 |
|------|------|
| 对话中输入 `sever` | 被 `mirrorRound` 检查劫持，不会触发 |
| `seal` 后不 `confirm` 而是输入其他命令 | `seal` 的输出只是提示文字，不设置特殊状态——后续 `confirm` 仍会检查 `postsRead` 但可能误触发。**风险**：如果在 `seal` 后输入了其他命令再输入 `confirm`，当前实现仍会触发结局D（因为 `postsRead` 仍为 true）。建议：添加 `sealPending` 状态 |
| `confirm` 在未 `seal` 时输入 | 返回 "没有待确认的操作" |
| 结局触发后刷新页面 | 可以重新开始 |
| 同一结局多次触发 | `triggerEnding()` 第一行 guard 阻止 |
| 结局覆盖画面出现后用户仍能看到终端 | 覆盖层 z-index 9999，全屏——但用户可能通过浏览器 DevTools 移除覆盖层。这是可接受的 |

---

## 6. UI 接口

### 6.1 终端内结局显示

结局文本直接在终端输出流中显示，使用对应样式类：

```html
<div class="terminal-system" style="font-size:18px;font-weight:bold;">
  【结局X：标题】
</div>
<div class="terminal-output" style="line-height:2;">
  结局文本...
</div>
<div class="terminal-dim">
  --- 游戏结束 ---
  刷新页面以重新开始。 | 重新开始
</div>
```

### 6.2 全屏结局覆盖画面

```html
<div class="ending-screen ending-x" id="ending-overlay">
  <div class="ending-title">【结局X：标题】</div>
  <div class="ending-text">结局文本</div>
  <button class="ending-restart" onclick="location.reload()">重新开始</button>
</div>
```

2秒延迟的设计理由：让玩家先在终端中看到结局文本（保持"在系统内"的感觉），然后再被"拉出"到全屏画面（类似第四面墙破碎的反向体验）。

---

## 7. 依赖

### 上游依赖
- **SYS-03 终端交互**: 命令入口（sever/watch/talk/seal/confirm）
- **SYS-04 叙事推进**: `postsRead` 状态（D结局前置条件）
- **SYS-05 镜中人对话**: 对话完成触发结局C

### 下游影响
- **SYS-01 窗口管理**: 结局覆盖画面覆盖所有窗口
- **SYS-03 终端交互**: `dialogLocked` 锁定终端输入

---

## 8. 验收标准

- [x] 四种结局均可正确触发
- [x] 结局触发后互斥（无法触发第二个）
- [x] 结局D的seal二步确认正常
- [x] seal前未posts时显示错误
- [x] 终端内结局文本正确渲染
- [x] 2秒后全屏覆盖画面出现
- [x] 重新开始按钮刷新页面
- [ ] 添加 `sealPending` 状态以防止 confirm 在非 seal 上下文触发（边缘情况）
- [ ] 结局触发后自动最小化/关闭浏览器窗口
