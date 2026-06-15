# NextScript v1 — Markdown 3.0 博客语言规范
# 不是标记语言。是「文档数据结构描述语言」。

---

## 范式革命：为什么这是 Markdown 3.0？

| | Markdown 1.0/2.0 | NextScript v1 |
|---|-------------------|----------------|
| 本质 | 标记文本（装饰纯文本）| 数据结构（描述文档）|
| 文件格式 | 类文本格式 | YAML（标准数据格式）|
| 解析 | 正则匹配 | YAML 解析 → AST |
| 渲染 | 模板替换 | 数据驱动渲染 |
| 扩展性 | 靠 HTML 补丁 | 组件数据协议 |
| 多端输出 | HTML only | HTML/PDF/终端/... |

**一句话**：Markdown 是「给文字加标签」，NextScript 是「描述这篇文章的数据结构」。

---

## 文件结构

一个 `.blog` 文件 = 标准 YAML 文件，包含两个顶级字段：

```yaml
meta:  # 文章元数据（必填）
  # ...元数据字段...

body:  # 文章正文（必填）
  - 区块1
  - 区块2
  # ...区块列表...
```

---

## `meta` 字段

```yaml
meta:
  title: 文章标题（字符串，必填）
  author: 作者名（字符串）
  date: 发布日期（YYYY-MM-DD）
  tags: [标签1, 标签2]  # 数组
  theme: dark | light | auto  # 主题
  layout: fluid | grid | masonry  # 布局模式
  toc: true | false  # 是否生成目录
```

---

## `body` 区块类型

`body` 是一个**区块数组**，每个区块是一个 YAML 对象，必须包含 `type` 字段。

### 文本类区块

```yaml
# 标题
- type: h1
  text: 一级标题文字

- type: h2
  text: 二级标题
  id: section1  # 可选，锚点 ID

- type: h3
  text: 三级标题

# 段落
- type: p
  text: 段落文字，支持 **粗体**、*斜体*、__下划线__、~~删除线~~。
  class: lead  # 可选，CSS 类名

# 引用
- type: quote
  text: 引用文字内容
  source: 引用来源（可选）

# 行内代码
- type: inline-code
  text: code_here()

# 链接
- type: link
  text: 链接文字
  href: https://...

# 图片
- type: img
  src: https://...
  alt: 图片描述
  width: 600   # 可选
  height: 400  # 可选
```

### 代码类区块

```yaml
- type: code
  lang: python  # 编程语言
  title: 示例代码  # 可选，显示标题
  linenos: true   # 可选，显示行号
  text: |
    def hello():
        print("Hello, NextScript!")
        return True
```

### 列表类区块

```yaml
# 无序列表
- type: ul
  items:
    - 列表项1
    - 列表项2
    - 列表项3

# 有序列表
- type: ol
  items:
    - 第一项
    - 第二项
    - 第三项

# 描述列表
- type: dl
  items:
    - term: 术语1
      desc: 描述1
    - term: 术语2
      desc: 描述2
```

### 组件类区块（Markdown 没有的）

```yaml
# 提示框
- type: alert
  alert-type: tip | warning | danger | success
  title: 提示标题（可选）
  text: 提示内容文字

# 按钮
- type: button
  button-type: primary | secondary | ghost
  text: 按钮文字
  href: "#content"  # 可选，链接地址
  onclick: alert('hi')  # 可选，JS 事件

# 徽章
- type: badge
  badgetype: info | warning | success | danger
  text: 徽章文字

# 卡片
- type: card
  hover: true  # 可选，是否启用 hover 效果
  blocks:  # 卡片内的区块列表
    - type: h3
      text: 卡片标题
    - type: p
      text: 卡片内容
    - type: button
      button-type: primary
      text: 查看详情

# 折叠区块
- type: collapse
  title: 点击展开
  blocks:  # 折叠区域内的区块
    - type: p
      text: 折叠起来的内容...

# 进度条
- type: progress
  value: 75
  max: 100
```

### 布局类区块（Markdown 完全做不到的）

```yaml
# 网格布局
- type: grid
  cols: 2  # 列数（1-3）
  gap: 20  # 间距（像素）
  cells:  # 每列的内容（数组，长度 = cols）
    -  # 第一列
      - type: card
        blocks:
          - type: h3
            text: 第一列标题
          - type: p
            text: 第一列内容
    -  # 第二列
      - type: card
        blocks:
          - type: h3
            text: 第二列标题
          - type: p
            text: 第二列内容

# 弹性布局
- type: flex
  direction: row | column
  gap: 12
  wrap: true  # 可选，是否换行
  items:  # 子项目列表
    - type: button
      text: 按钮1
    - type: button
      text: 按钮2

# 居中区
- type: center
  blocks:  # 居中显示的区块列表
    - type: h1
      text: 居中标题
    - type: button
      text: 居中按钮

# 侧边栏布局
- type: with-sidebar
  sidebar-width: 250
  sidebar-side: left | right
  sidebar-blocks:  # 侧边栏内容
    - type: p
      text: 侧边栏内容
  main-blocks:  # 主内容区
    - type: p
      text: 主内容区
```

### 数据可视化类

```yaml
# 图表
- type: chart
  chart-type: bar | line | pie
  title: 图表标题
  labels: [周一, 周二, 周三]  # X 轴标签
  data: [120, 200, 150]       # 数据

# 统计数字
- type: stat
  value: 1234
  label: 访问量
  prefix: ""   # 可选，前缀
  suffix: " 次"  # 可选，后缀

# 时间线
- type: timeline
  items:
    - date: "2026-03-01"
      text: 项目启动
    - date: "2026-04-12"
      text: 第一版完成
    - date: "2026-06-15"
      text: 重构为 NextScript
```

### 交互类

```yaml
# 手风琴
- type: accordion
  panes:
    - title: 问题1
      text: 答案1...
    - title: 问题2
      text: 答案2...

# 选项卡
- type: tabs
  tabs:
    - title: 介绍
      blocks:
        - type: p
          text: 介绍内容...
    - title: 详情
      blocks:
        - type: p
          text: 详情内容...
```

### 分节区块

```yaml
# 章节（用于将文章分节）
- type: section
  id: content  # 可选，锚点 ID
  blocks:  # 章节内的区块列表
    - type: h2
      text: 章节标题
    - type: p
      text: 章节内容...
```

---

## 完整示例

```yaml
# NextScript v1 示例文件
# 文件名：50.blog

meta:
  title: NextScript — Markdown 3.0 博客语言
  author: 管哥
  date: 2026-06-15
  tags: [技术, 创新, NextScript, Markdown3.0]
  theme: dark
  layout: fluid
  toc: true

body:
  # === 英雄区 ===
  - type: section
    id: hero
    blocks:
      - type: center
        blocks:
          - type: h1
            text: NextScript v1
          - type: p
            text: 下一代博客编写语言 · 不是 Markdown · 数据驱动
            class: lead
          - type: button
            button-type: primary
            text: 开始阅读 ↓
            href: "#content"

  # === 正文 ===
  - type: section
    id: content
    blocks:
      # 章节1
      - type: h2
        text: 这不是 Markdown
        id: sec1
      
      - type: p
        text: |
          **NextScript** 从设计哲学上就与 Markdown 不同。
          Markdown 是「给纯文本加装饰符号」，
          NextScript 是「用 YAML 描述文档数据结构」。
      
      - type: alert
        alert-type: tip
        title: 核心区别
        text: |
          - 语法：YAML 数据，而非 `# * >` 符号
          - 结构：原生嵌套数据，而非扁平文本
          - 组件：type 字段即组件，一等公民
          - 布局：grid/flex 是原生区块类型
      
      # 章节2
      - type: h2
        text: 功能展示
        id: sec2
      
      - type: p
        text: 以下是 muban.html 中的所有功能，用 NextScript 重写：
      
      - type: grid
        cols: 2
        gap: 20
        cells:
          - - type: card
              blocks:
                - type: h3
                  text: "🔘 按钮"
                - type: button
                  button-type: primary
                  text: 主要按钮
                - type: button
                  button-type: secondary
                  text: 次要按钮
          - - type: card
              blocks:
                - type: h3
                  text: "🏷️ 徽章"
                - type: badge
                  badgetype: info
                  text: 信息
                - type: badge
                  badgetype: warning
                  text: 警告
      
      # 章节3
      - type: h2
        text: 数据统计
        id: sec3
      
      - type: flex
        direction: row
        gap: 20
        wrap: true
        items:
          - type: stat
            value: 1234
            label: 总访问量
            suffix: " 次"
          - type: stat
            value: 99.9
            label: 好评率
            suffix: "%"
          - type: stat
            value: 50
            label: 文章数
            suffix: " 篇"
      
      # 章节4
      - type: h2
        text: 时间线
        id: sec4
      
      - type: timeline
        items:
          - date: "2026-03-01"
            text: 项目启动
          - date: "2026-04-12"
            text: 完成第一版（Markdown 风格）
          - date: "2026-06-10"
            text: 用户反馈：这还是 Markdown 风格！
          - date: "2026-06-15"
            text: 重构为 NextScript v1（数据驱动）
      
      # 章节5
      - type: h2
        text: 常见问题
        id: sec5
      
      - type: accordion
        panes:
          - title: NextScript 和 Markdown 可以互转吗？
            text: |
              可以。提供 `nextscript2md()` 函数可转换。
              但反向转换会丢失布局信息（Grid/Flex 等）。
          - title: 学习成本高吗？
            text: |
              很低。YAML 语法非常直观，
              且所有编辑器和 IDE 都有 YAML 高亮支持。
          - title: 支持自定义组件吗？
            text: |
              支持！在 `meta` 中定义 `components` 字段，
              然后在 `body` 中引用。
      
      # 章节6
      - type: h2
        text: 代码块示例
        id: sec6
      
      - type: code
        lang: python
        title: 解码器核心伪代码
        linenos: true
        text: |
          def decode_nextscript(blog_yaml: str) -> str:
              """NextScript 解码器工作流程"""
              
              # 1. 解析 YAML
              data = yaml.safe_load(blog_yaml)
              
              # 2. 提取 meta 和 body
              meta = data['meta']
              body = data['body']
              
              # 3. 遍历 body 区块，生成 HTML
              html_blocks = []
              for block in body:
                  html = render_block(block)
                  html_blocks.append(html)
              
              return '\n'.join(html_blocks)
      
      # 引用
      - type: quote
        text: |
          NextScript 不是 Markdown 的变种，
          而是一个全新的「文档数据结构描述语言」。
          它的设计目标是成为「Markdown 3.0」。
        source: 管哥，2026 年 6 月

  # === 页脚 ===
  - type: section
    id: footer
    blocks:
      - type: center
        blocks:
          - type: p
            text: 感谢阅读我的文章~
            class: muted
          - type: hr  # 分隔线
          - type: p
            text: "© 2026 管哥的博客 · 用 NextScript v1 编写"
            class: small
```

---

## 解码器工作原理

```
50.blog（YAML 文件）
    ↓
yaml.safe_load()  →  解析为 JS 对象
    ↓
遍历 body 数组  →  每个区块调用 render_block()
    ↓
生成 HTML 字符串  →  插入 DOM
```

### 渲染函数伪代码

```javascript
function renderBlock(block) {
  switch (block.type) {
    case 'h1':
      return `<h1>${inline(block.text)}</h1>`;
    case 'p':
      return `<p class="${block.class || ''}">${inline(block.text)}</p>`;
    case 'alert':
      return `<div class="alert ${block['alert-type']}">...</div>`;
    case 'grid':
      return `<div class="grid cols-${block.cols}">...</div>`;
    case 'code':
      return `<div class="code-block">...</div>`;
    // ... 更多类型
  }
}
```

---

## 与 BlockScript（[关键字] 语法）的对比

| | BlockScript | NextScript |
|--|-------------|-------------|
| 文件格式 | 自定义语法（类 XML）| 标准 YAML |
| 可读性 | 好（关键字直观）| 极好（YAML 是行业标准）|
| 编辑器支持 | 无（需自定义高亮）| 所有编辑器原生支持 |
| 解析复杂度 | 高（需手写解析器）| 低（用 js-yaml 库）|
| 范式 | 标记语言 | 数据描述语言 |
| 创新度 | 中等 | 极高（颠覆性）|

---

## 为什么这是「Markdown 3.0」？

1. **解决了 Markdown 的根本缺陷**：模糊解析、不一致渲染、无法扩展
2. **使用标准数据格式**：YAML 是成熟标准，工具链完善
3. **真正的组件系统**：`type` 字段 = 组件名，可无限扩展
4. **布局是一等公民**：`grid` `flex` 是区块类型，不是 CSS
5. **多端输出**：同一 YAML 可渲染为 HTML/PDF/终端/...

---

## 实现计划

1. **前端解码器**：用 `js-yaml` 库解析 YAML，遍历 body 渲染 HTML
2. **管理员集成**：后台写文章时，提供 YAML 编辑器（带校验）
3. **迁移工具**：自动将现有 HTML 文章转为 NextScript YAML 格式
4. **v2 计划**：支持变量、条件渲染、循环、导入

---

*NextScript v1 Specification*  
*Designed for ciallo0721-cmd.github.io*  
*2026-06-15*  
*The true "Markdown 3.0"*
