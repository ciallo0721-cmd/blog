# 镜中人 (The Man in the Mirror) — Bug 报告模板

> **使用说明**: 每次发现 Bug 时复制此模板填写。提交到 `production/qa/bugs/` 目录，文件命名 `bug-{序号}-{简述}.md`

---

## Bug 报告

```yaml
Bug ID: BUG-XXX
发现日期: YYYY-MM-DD
发现者: 
优先级: P0 / P1 / P2 / P3
严重度: Blocker / Critical / Major / Minor
状态: Open / In Progress / Fixed / Verified / Closed
关联系统: SYS-01 / SYS-02 / SYS-03 / SYS-04 / SYS-05 / SYS-06
```

---

## 标题

<!-- 一行简述 Bug，如：结局触发后终端输入未锁定 -->

---

## 环境

| 项目 | 内容 |
|------|------|
| 浏览器 | Chrome vXXX / Edge vXXX / Firefox vXXX |
| 分辨率 | 1440×900 / 1920×1080 / 其他 |
| 游戏版本 | commit hash 或 日期 |
| localStorage 状态 | 清除 / 有历史记录（如有请注明）|

---

## 复现步骤

### 前置条件

<!-- 执行测试前需要满足的条件 -->
1. 游戏已加载完成
2. （如有）已通关某结局
3. （如有）特定 GAME_STATE 值

### 操作步骤

1. 打开页面
2. ...（逐条列出精确操作）
3. ...
4. ...

---

## 实际行为

<!-- Bug 发生后实际看到的现象 -->

```
（贴上 Console 错误日志 / 截图描述 / 状态值）
```

---

## 预期行为

<!-- 根据 GDD 验收标准，应该发生的行为 -->

---

## GAME_STATE 快照（可选）

<!-- 在 DevTools Console 中执行 console.table(GAME_STATE) 并粘贴结果 -->

```javascript
{
  browserPhase: '',
  playerName: '',
  postsRevealed: 0,
  hiddenPostClicked: false,
  waybackClicked: false,
  terminalPhase: '',
  terminalConnected: false,
  postsRead: false,
  statusChecked: false,
  mirrorRound: 0,
  endingTriggered: null,
  dialogLocked: false,
  sealPending: false,
  commandHistory: []
}
```

---

## 截图 / 录屏

<!-- 粘贴截图路径或链接 -->

---

## 影响范围

| 维度 | 评估 |
|------|------|
| 阻塞核心路径 | 是 / 否 — 影响哪个结局 |
| 影响新玩家 | 是 / 否 |
| 影响沉浸感 | 高 / 中 / 低 |
| 影响数据持久化 | 是 / 否 |

---

## 关联文档

<!-- 相关的 GDD 章节 / 验收标准 -->

- GDD: [game-concept.md §X]()
- SYS-XX: [system-name.md §Y]()

---

## 修复建议（可选）

<!-- 如果知道如何修复，简要描述建议方案 -->

---

## 复现概率

- [ ] 必现（100%）
- [ ] 高频（>50%）
- [ ] 偶发（<50%）
- [ ] 仅一次（无法二次复现）

---

## 验证记录

| 验证轮次 | 验证者 | 操作 | 结果 |
|---------|--------|------|------|
| 初检 | | 确认复现 | PASS / FAIL |
| 修复后验证 | | 回归测试 | PASS / FAIL |

---

## 分级速查表

| 级别 | 定义 | 处理时限 | 拦截发布 |
|------|------|---------|---------|
| **P0 Blocker** | 游戏无法运行 / 核心路径中断 | 立即 | ✅ |
| **P1 Critical** | 功能严重受损，但核心路径存在 | 24 小时内 | ✅ |
| **P2 Major** | 功能可用但体验不完善 | 发布前修复 | 视情况 |
| **P3 Minor** | 建议改进，非功能性缺陷 | 按计划迭代 | ❌ |

---

## Bug 报告示例

> 以下是一个完整的 Bug 报告示例供参考：

```yaml
Bug ID: BUG-001
发现日期: 2026-07-16
发现者: 严守真
优先级: P0
严重度: Critical
状态: Open
关联系统: SYS-06
```

**标题**: seal 后输入其他命令再输入 confirm 仍触发结局 D

**环境**: Chrome v126 / 1440×900 / localStorage 清除

**前置条件**: 终端已连接 + 已执行 posts

**复现步骤**:
1. 打开页面，正常走通到终端连接
2. 输入 `posts`
3. 输入 `seal` — 显示"输入 confirm 确认执行"
4. 输入 `help` — 显示帮助信息
5. 输入 `confirm` — 触发结局 D（**实际行为**）

**预期行为**: 步骤 4 中输入的 `help` 应重置 `sealPending` 状态，步骤 5 的 `confirm` 应返回"没有待确认的操作"。

**影响**: 玩家意外触发封印结局，失去自由选择的权利。

**GDD 关联**: ending-system.md §5 边缘情况已识别此风险。
