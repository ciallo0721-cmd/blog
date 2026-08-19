# ADR-004: 单文件 JavaScript 架构与未来拆分策略

- **状态**: 已采纳，但标记为"需重新评估" (Accepted, flagged for re-evaluation)
- **日期**: 2026-03-25（文档化日期；决策最初于项目启动时做出）
- **决策者**: 项目作者 / 程基岩（重新评估建议）
- **ADR 编号**: 004

---

## 上下文

当前「镜中人」的所有游戏逻辑、数据、渲染和交互都在单一文件 `arg-index.js`（~720 行，33KB）中。项目计划新增功能和内容，需要评估单文件架构能否承载扩展。

---

## 当前决定

**将所有游戏逻辑放在单个 JS 文件中，按功能区用注释分隔。**

---

## 当前文件的内部组织

```
arg-index.js (~720 行)
├── [1-5]     Google Analytics 初始化 (gtag)
├── [6-31]    游戏状态管理 (GAME_STATE)
├── [32-143]  窗口管理 (window system)
├── [145-161] 论坛帖子数据 (FORUM_POSTS)
├── [162-171] 结局数据 (ENDINGS)
├── [173-370] 浏览器页面渲染 (browser renderer)
├── [372-706] 终端渲染 & 交互 (terminal renderer)
└── [709-720] 初始化 (init)
```

---

## 备选方案（针对未来扩展）

### 方案 A: 保持单文件（不推荐，除非内容不再增长）

**优点:**
- 无需修改加载顺序
- 无模块系统依赖
- 所有代码在一个视图中

**缺点:**
- 33KB 已接近单文件可维护上限（心理阈值约 500-800 行）
- 每新增一个功能（如新终端命令、新窗口类型）都会进一步膨胀文件
- 多人协作时冲突频繁
- 全局变量污染风险随代码量增长

### 方案 B: 拆分为多个 `<script>` 文件（推荐）

```
arg/
├── index.html
├── js/
│   ├── game-state.js        ← GAME_STATE
│   ├── game-data.js         ← FORUM_POSTS + ENDINGS
│   ├── window-manager.js    ← 窗口管理
│   ├── browser-renderer.js  ← 浏览器页面渲染
│   ├── terminal-renderer.js ← 终端渲染与命令解析
│   ├── ending-system.js     ← 结局触发与展示
│   └── main.js              ← 初始化 + 入口
└── css/
    └── arg-index.css
```

在 `index.html` 中按依赖顺序加载：
```html
<script src="../js/arg/game-state.js"></script>
<script src="../js/arg/game-data.js"></script>
<script src="../js/arg/window-manager.js"></script>
<script src="../js/arg/browser-renderer.js"></script>
<script src="../js/arg/terminal-renderer.js"></script>
<script src="../js/arg/ending-system.js"></script>
<script src="../js/arg/main.js"></script>
```

**优点:**
- 每个文件职责单一，<200 行
- 编辑时易于定位
- 减少 Git 冲突
- 仍保持零构建、零依赖

**缺点:**
- 多个 HTTP 请求（HTTP/2 下影响很小）
- 全局作用域仍然共享（需命名约定）
- 加载顺序敏感

### 方案 C: ES Modules（长期推荐）

```html
<script type="module" src="../js/arg/main.js"></script>
```

**优点:**
- 原生模块隔离（`import`/`export` 作用域）
- 编辑器智能提示和跳转
- Tree-shaking 潜力

**缺点:**
- 部分非常旧的浏览器不支持（不在目标范围）
- 需要处理跨域（GitHub Pages 下无问题）
- 迁移工作量较大

---

## 建议

### 短期（现在）：方案 B — 拆分为多个普通 `<script>` 文件

这是最小风险的重构。不改变技术栈，不引入新依赖，仅做文件层面的切割。价值：
- 降低单文件心理负担
- 为内容编辑者提供独立的数据文件
- 为未来迁移到 ES Modules 铺路

### 中期（功能增长后）：方案 C — 迁移到 ES Modules

当文件数量超过 6-8 个且依赖关系复杂时，ES Modules 的命名空间隔离和管理价值会显现。

---

## 拆分触发条件

满足以下任一条件时执行拆分：

| 条件 | 当前值 | 触发值 |
|------|--------|--------|
| 单文件行数 | 720 | > 800 |
| 单文件大小 | 33KB | > 40KB |
| 模块数（概念上） | 7 | 不变 |
| 开发者数量 | 1 | > 1 |
| 新功能数量 | 0 | > 3 个新增功能同时开发 |

**当前（2026-03）**: 720 行，建议在下一批功能开发前执行拆分。

---

## 后果

### 如果不拆分

- 文件继续膨胀，最终超过 1000 行时维护成本急剧上升
- 新开发者需要全量阅读 720+ 行才能开始工作
- 编辑任何功能都需要在同一个大文件中定位

### 如果拆分

- 初期投入约 2-4 小时做文件切割和引用调整
- 需要验证加载顺序正确
- 长期收益：每个文件职责清晰，新功能可以添加为新文件

---

## 合规验证

- [x] 当前无 `import`/`export` 语句
- [x] 所有变量和函数在全局作用域
- [x] 加载顺序：JS 在 `</body>` 前加载（arg-index.js 在 index.html 最后）
