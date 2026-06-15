# BlockScript v1 — 全新博客语言
# 不是 Markdown。是完全不同的范式。

---

## 设计理念：为什么不是 Markdown？

Markdown 的本质是「在纯文本里加装饰符号」。
BlockScript 的本质是「用关键字树描述文档结构」。

| | Markdown | BlockScript |
|---|----------|-------------|
| 哲学 | 装饰纯文本 | 描述结构树 |
| 语法 | `# ** > [` | `[Keyword] ... [/Keyword]` |
| 嵌套 | 几乎不支持 | 原生支持任意嵌套 |
| 组件 | 无 | 关键字即组件 |
| 布局 | 无 | `[Layout]` 关键字 |
| 可读性 | 靠符号直觉 | 靠关键字语义 |

---

## 基础语法

### 文件结构

```
[Document]
  [Meta]
    title: 文章标题
    author: 作者
    date: 2026-06-15
    tags: 技术, 创新
  [/Meta]

  [Hero]
    ...英雄区内容...
  [/Hero]

  [Content]
    ...正文内容...
  [/Content]

  [Footer]
    ...页脚内容...
  [/Footer]
[/Document]
```

### 语法规则

```
[关键字]           ← 区块开始
  ...内容...        ← 区块内容（可多行）
[/关键字]          ← 区块结束（必须与开始配对）

[关键字 属性=值]   ← 带属性的区块
[关键字 属性1=值1 属性2=值2]

[SelfClosing /]    ← 自闭合区块（无内容）

// 这是注释（整行）
```

---

## 关键字字典

### 文档结构

```
[Document] ... [/Document]
  → 文档根节点（可选，解码器自动包裹）

[Meta]
  title: 标题
  author: 作者
  date: YYYY-MM-DD
  tags: 标签1, 标签2
  theme: dark | light | auto
  layout: fluid | grid | masonry
[/Meta]
  → 文章元数据（自动解析为 <head> 中的 meta 标签）

[Section id="xxx"] ... [/Section]
  → 内容分节（生成 <section id="xxx">）
```

### 文本

```
[H1] 标题文字 [/H1]
[H2] 章节标题 [/H2]
[H3] 小节标题 [/H3]
[H4] 小小节 [/H4]

[P] 段落文字，支持 **粗体**、*斜体*、__下划线__、~~删除线~~。[/P]

[Quote] 引用文字 [/Quote]

[Code lang="python" title="示例"]
def hello():
    print("Hello, BlockScript!")
[/Code]

[InlineCode] 行内代码 [/InlineCode]

[Link href="https://..."] 链接文字 [/Link]
[Img src="url" alt="描述" /]
```

### 列表

```
[UL]
  [LI] 无序列表项1 [/LI]
  [LI] 无序列表项2 [/LI]
[/UL]

[OL]
  [LI] 有序列表项1 [/LI]
  [LI] 有序列表项2 [/LI]
[/OL]

[DL]
  [DT] 术语 [/DT]
  [DD] 描述 [/DD]
[/DL]
```

### 组件（Markdown 没有的）

```
// 提示框
[Alert type="tip" title="提示"] 内容 [/Alert]
[Alert type="warning"] 内容 [/Alert]
[Alert type="danger"] 内容 [/Alert]
[Alert type="success"] 内容 [/Alert]

// 按钮
[Button type="primary" href="#content"] 开始阅读 [/Button]
[Button type="secondary" onclick="..."] 点击 [/Button]

// 徽章
[Badge type="info"] 新 [/Badge]
[Badge type="warning"] 测试 [/Badge]

// 卡片
[Card hover=true]
  [H3] 卡片标题 [/H3]
  [P] 卡片内容 [/P]
  [Button type="primary"] 查看 [/Button]
[/Card]

// 折叠
[Collapse title="点击展开"]
  折叠的内容...
[/Collapse]

// 进度条
[Progress value=75 max=100 /]

// 分隔线
[HR /]
```

### 布局（Markdown 完全做不到的）

```
// 网格布局
[Grid cols=2 gap=20]
  [Cell] 第一列内容 [/Cell]
  [Cell] 第二列内容 [/Cell]
[/Grid]

[Grid cols=3]
  [Cell] 列1 [/Cell]
  [Cell] 列2 [/Cell]
  [Cell] 列3 [/Cell]
[/Grid]

// 弹性布局
[Flex direction="row" gap=12 wrap=true]
  [Button] 按钮1 [/Button]
  [Button] 按钮2 [/Button]
  [Button] 按钮3 [/Button]
[/Flex]

// 侧边栏布局
[WithSidebar sidebar_width=250 sidebar_side="left"]
  [Sidebar]
    [P] 侧边栏内容 [/P]
  [/Sidebar]
  [Main]
    [P] 主内容区 [/P]
  [/Main]
[/WithSidebar]

// 居中
[Center]
  [H1] 居中标题 [/H1]
  [Button] 居中按钮 [/Button]
[/Center]
```

### 数据可视化

```
// 图表（需要 Chart.js）
[Chart type="bar" title="访问量"]
  labels: 周一, 周二, 周三, 周四, 周五
  data: 120, 200, 150, 300, 250
[/Chart]

[Chart type="line" title="趋势"]
  labels: 1月, 2月, 3月
  data: 100, 200, 300
[/Chart]

// 统计数字
[Stat value=1234 label="访问量" suffix="次" /]
[Stat value=99.9 label="好评率" suffix="%" /]
```

### 交互组件

```
// 选项卡
[Tabs]
  [Tab title="介绍"] 介绍内容... [/Tab]
  [Tab title="详情"] 详情内容... [/Tab]
[/Tabs]

// 手风琴
[Accordion]
  [Pane title="问题1"] 答案1... [/Pane]
  [Pane title="问题2"] 答案2... [/Pane]
[/Accordion]

// 计数器动画
[Counter from=0 to=1000 duration=2000 suffix="次" /]
```

### 时间线

```
[Timeline]
  [Item date="2026-03"] 项目启动 [/Item]
  [Item date="2026-04"] 第一版完成 [/Item]
  [Item date="2026-06"] 重构为 BlockScript [/Item]
[/Timeline]
```

---

## 简写语法（可选）

为了让熟悉 Markdown 的人更快上手，支持简写（解码器自动转换）：

```
// 以下简写会自动转换为对应的 [Keyword] 形式

# 标题       →  [H1] 标题 [/H1]
## 标题       →  [H2] 标题 [/H2]
### 标题      →  [H3] 标题 [/H3]

> 引用        →  [Quote] 引用 [/Quote]

- 项目        →  [UL][LI] 项目 [/LI][/UL]
1. 项目       →  [OL][LI] 项目 [/LI][/OL]

```python
code         →  [Code lang="python"]code[/Code]
```

**粗体**      →  保留（在 [P] 内有效）
*斜体*        →  保留（在 [P] 内有效）

---          →  [HR /]
```

**注意**：简写仅在「上下文明确」时生效。最佳实践是使用完整的 `[Keyword]` 语法。

---

## 变量与模板

```
[Var name="site_name" value="管哥的博客" /]
[Var name="base_url" value="https://example.com" /]

// 使用变量（用 {变量名} 引用）
[P] 欢迎来到 {site_name}！[/P]
[Button href="{base_url}/about"] 关于 [/Button]
```

---

## 模块化（@import）

```
[Import file="other-article.blog" section="hero" /]
  → 导入 other-article.blog 文件中的 [Hero] 区块

[Import file="shared-components.blog" /]
  → 导入共享组件定义
```

---

## 完整示例

```blockscript
// 文章：用 BlockScript 编写
// 文件名：50.blog

[Document]
  [Meta]
    title: BlockScript 介绍
    author: 管哥
    date: 2026-06-15
    tags: 技术, 创新, BlockScript
    theme: dark
  [/Meta]

  [Hero]
    [Center]
      [H1] 欢迎来到 BlockScript [/H1]
      [P class="lead"] 下一代博客编写语言，不是 Markdown。[/P]
      [Button type="primary" href="#content"] 开始阅读 [/Button]
    [/Center]
  [/Hero]

  [Content]
    [Section id="content"]
      [H2] 什么是 BlockScript？ [/H2]
      
      [P]
        **BlockScript** 不是 Markdown 的变种，
        而是一个全新的「关键字树描述语言」。
      [/P]
      
      [P]
        与 Markdown 的扁平线性结构不同，
        BlockScript 使用 [Code lang="inline"] 关键字树 [/Code] 作为核心抽象。
      [/P]
      
      [Alert type="tip" title="核心创新"]
        [UL]
          [LI] 关键字即组件，不是 HTML 补丁 [/LI]
          [LI] 原生支持任意嵌套 [/LI]
          [LI] 声明式布局（Grid/Flex）[/LI]
          [LI] 变量系统与模板渲染 [/LI]
          [LI] 模块化导入 [/LI]
        [/UL]
      [/Alert]
    [/Section]

    [Section]
      [H2] 特性展示 [/H2]
      
      [Grid cols=2 gap=20]
        [Cell]
          [Card hover=true]
            [H3] 🚀 组件化 [/H3]
            [P] 所有元素都是组件，可组合嵌套 [/P]
          [/Card]
        [/Cell]
        [Cell]
          [Card hover=true]
            [H3] 🎨 样式隔离 [/H3]
            [P] 每个区块可独立定义样式 [/P]
          [/Card]
        [/Cell]
        [Cell]
          [Card hover=true]
            [H3] 📐 布局控制 [/H3]
            [P] 描述式网格/弹性布局 [/P]
          [/Card]
        [/Cell]
        [Cell]
          [Card hover=true]
            [H3] 🔗 模块化 [/H3]
            [P] 支持跨文件导入复用 [/P]
          [/Card]
        [/Cell]
      [/Grid]
    [/Section]

    [Section]
      [H2] 代码示例 [/H2]
      
      [Code lang="python" title="解码器伪代码"]
def render_blog(blog_file_path):
    """BlockScript 解码器工作流程"""
    # 1. 读取 .blog 文件
    raw_text = read_file(blog_file_path)
    
    # 2. 词法分析：识别 [关键字] 标记
    tokens = tokenize(raw_text)
    
    # 3. 语法分析：构建关键字树（AST）
    ast = parse(tokens)
    
    # 4. 渲染：遍历 AST，生成 HTML
    html = render(ast, theme="dark")
    
    return html
      [/Code]
      
      [P]
        解码器是纯前端 JS 实现，
        无需服务端渲染，直接把 [InlineCode].blog[/InlineCode] 变成网页~
      [/P]
    [/Section]

    [Section]
      [H2] 数据统计 [/H2]
      
      [Flex direction="row" gap=20 wrap=true]
        [Stat value=1234 label="总访问" suffix="次" /]
        [Stat value=99.9 label="好评率" suffix="%" /]
        [Stat value=15 label="文章数" suffix="篇" /]
        [Stat value=5280 label="代码行数" suffix="行" /]
      [/Flex]
    [/Section]

    [Section]
      [H2] 开发时间线 [/H2]
      
      [Timeline]
        [Item date="2026-03-01"] 项目启动 [/Item]
        [Item date="2026-04-12"] 完成初版（Markdown 风格）[/Item]
        [Item date="2026-06-10"] 用户反馈：不是 Markdown！[/Item]
        [Item date="2026-06-15"] 重构为 BlockScript（全新设计）[/Item]
      [/Timeline]
    [/Section]

    [Section]
      [H2] 常见问题 [/H2]
      
      [Accordion]
        [Pane title="BlockScript 和 Markdown 可以互转吗？"]
          [P]
            可以。解码器提供 [InlineCode]blockscript2md()[/InlineCode] 函数，
            可将 [InlineCode].blog[/InlineCode] 文件转换为 Markdown。
            但反向转换会丢失布局信息。
          [/P]
        [/Pane]
        [Pane title="学习成本高吗？"]
          [P]
            不高。[Keyword] 语法非常直观，
            而且支持 Markdown 简写兼容模式。
          [/P]
        [/Pane]
        [Pane title="支持自定义组件吗？"]
          [P]
            支持！用 [InlineCode][DefComponent name="MyComp"]...[/DefComponent][/InlineCode]
            定义自定义组件，然后在文档中使用 [InlineCode][MyComp]...[/MyComp][/InlineCode]。
          [/P]
        [/Pane]
      [/Accordion]
    [/Section]
  [/Content]

  [Footer]
    [Center]
      [P class="muted"] 感谢阅读我的文章~ [/P]
      [HR /]
      [P class="small"]
         © 2026 管哥的博客
         · 用 BlockScript 编写
         · [Link href="https://github.com/..."] 查看源码 [/Link]
      [/P]
    [/Center]
  [/Footer]
[/Document]
```

---

## 解码器工作原理

```
50.blog 文件
    ↓
词法分析（识别 [关键字] 标记）
    ↓
语法分析（构建关键字树 / AST）
    ↓
主题渲染（遍历 AST → HTML）
    ↓
插入 index.html 的 #content 容器
```

### AST 示例（对应上面的文档）

```json
{
  "type": "Document",
  "children": [
    {
      "type": "Meta",
      "data": {
        "title": "BlockScript 介绍",
        "author": "管哥",
        "theme": "dark"
      }
    },
    {
      "type": "Hero",
      "children": [
        {"type": "Center", "children": [...]}
      ]
    },
    {
      "type": "Content",
      "children": [
        {"type": "Section", "id": "content", "children": [...]},
        {"type": "Section", "children": [...]}
      ]
    },
    {
      "type": "Footer",
      "children": [...]
    }
  ]
}
```

---

## 与 muban.html 功能完整对照

| muban.html 功能 | BlockScript 语法 | 说明 |
|----------------|----------------|------|
| 标题 h1~h6 | `[H1]...[/H1]` 等 | |
| 段落 | `[P]...[/P]` | |
| 引用 | `[Quote]...[/Quote]` | |
| 代码块 | `[Code lang=...]...[/Code]` | 支持语言高亮 |
| 行内代码 | `[InlineCode]...[/InlineCode]` | |
| 链接 | `[Link href=...]...[/Link]` | |
| 图片 | `[Img src=... /]` | |
| 列表 | `[UL][LI]...[/LI][/UL]` | |
| 表格 | `[Table]...[/Table]` | 见完整文档 |
| **按钮** | `[Button type=...]...[/Button]` | ✨ 原生支持 |
| **徽章** | `[Badge type=...]...[/Badge]` | ✨ 原生支持 |
| **提示框** | `[Alert type=...]...[/Alert]` | ✨ 原生支持 |
| **卡片** | `[Card]...[/Card]` | ✨ 原生支持 |
| **折叠** | `[Collapse]...[/Collapse]` | ✨ 原生支持 |
| **进度条** | `[Progress value=... /]` | ✨ 原生支持 |
| **网格布局** | `[Grid cols=...]...[/Grid]` | ✨ Markdown 无 |
| **弹性布局** | `[Flex]...[/Flex]` | ✨ Markdown 无 |
| **侧边栏** | `[WithSidebar]...[/WithSidebar]` | ✨ Markdown 无 |
| **图表** | `[Chart]...[/Chart]` | ✨ Markdown 无 |
| **统计数字** | `[Stat ... /]` | ✨ Markdown 无 |
| **时间线** | `[Timeline]...[/Timeline]` | ✨ Markdown 无 |
| **选项卡** | `[Tabs]...[/Tabs]` | ✨ Markdown 无 |
| **手风琴** | `[Accordion]...[/Accordion]` | ✨ Markdown 无 |
| **变量** | `[Var ... /]` + `{var}` | ✨ Markdown 无 |
| **导入** | `[Import file=... /]` | ✨ Markdown 无 |

---

## 为什么这是创新？

1. **语法范式完全不同**：`[Keyword]` vs Markdown 的 `#**>` 
2. **原生嵌套**：Markdown 几乎不能嵌套，BlockScript 任意嵌套
3. **布局是一等公民**：`[Grid]` `[Flex]` 是关键字，不是 CSS
4. **组件是可扩展的**：`[DefComponent]` 定义新关键字
5. **源文件即文档树**：打开 `.blog` 文件，结构一目了然

---

## 待扩展（v2 计划）

- `[Form]` 区块（评论框、联系表单）
- `[Math]` 区块（LaTeX 公式）
- `[Mermaid]` 区块（流程图）
- `[Condition var="x" value="y"]` 条件渲染
- `[Loop for="item" in="list"]` 循环渲染
- `[Fetch url="..."]` 远程数据获取
- `[DefComponent]` 自定义组件定义

---

*BlockScript v1 Specification*  
*Designed for ciallo0721-cmd.github.io*  
*2026-06-15*
