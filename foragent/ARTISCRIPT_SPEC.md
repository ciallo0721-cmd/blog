# ArtiScript v1 — 博客语言规范
# 这不是 Markdown。这是 Markdown 3.0。

## 设计哲学

Markdown 1.0（2004）：纯文本 → HTML，有限标注  
Markdown 2.0（GFM）：表格、代码块、脚注  
**ArtiScript v1（2026）**：结构化文档协议，组件优先，布局感知

### 与 Markdown 的核心区别

| 特性 | Markdown | ArtiScript |
|------|----------|------------|
| 结构 | 扁平线性 | 嵌套区块树 |
| 组件 | 无（靠 HTML） | 一等公民 |
| 布局 | 无（靠 CSS） | 声明式布局指令 |
| 样式 | 无（靠 class） | 区块级作用域样式 |
| 复用 | 无 | @import 模块系统 |
| 数据 | 无 | 内置数据绑定 |

---

## 语法总览

### 1. 基本规则

- **源文件**：UTF-8 编码，扩展名 `.blog`
- **注释**：以 `//` 开头的行（整行注释）或内联 `// 注释`
- **续行**：行尾 `\` 表示下一行同属本行
- **缩进**：2 空格（仅为了可读性，不影响解析）

### 2. 文档结构

```
directive  // 指令（元数据、布局、导入等）
...
===

// 正文区（可多个，用 === 分隔不同 zone）
=== zone-name ===
区块1
区块2
...
===
```

---

## 指令系统（directive）

指令以 `//` 或置于文件头的指令块中，格式：

```
@指令名 参数1 参数2 ...
```

### 支持的指令

```
@title      文章标题              // 文章标题
@author     作者名                // 作者
@date       2026-06-15          // 发布日期
@tags       技术, 创新, 博客      // 标签（逗号分隔）
@theme      dark                 // 主题（dark/light/auto）
@import     other-file.blog      // 导入其他 .blog 模块
@var        key=value            // 定义变量，正文中用 {key} 引用
@layout     fluid                // 布局模式（fluid/pinned/masonry）
```

---

## 区块语法（核心创新）

ArtiScript 的一切内容都在「区块」中。区块是递归嵌套的结构。

### 区块定义

```
:区块类型 [id] [.类名] [key=val ...] {
  区块内容
}
```

- `区块类型`：内置类型或自定义组件名
- `id`：可选，锚点标识
- `.类名`：可选，CSS 类名（多个用 `.a.b`）
- `key=val`：可选，键值属性

### 内置区块类型

#### 文本类

```
// 标题
:h1 { 文章主标题 }
:h2 { 章节标题 }
:h3 { 小节标题 }

// 段落
:p {
  普通段落文字，支持 **粗体**、*斜体**、__下划线__、~~删除线~~。
  链接用 [文字](url)，图片用 ![alt](url)。
}

// 引用
:quote {
  引用的文字内容
  — 引用来源
}

// 列表
:ul {
  - 无序列表项1
  - 无序列表项2
}
:ol {
  1. 有序列表项1
  2. 有序列表项2
}
:dl {
  term1 => 描述1
  term2 => 描述2
}
```

#### 代码类

```
:code lang=python title="示例1" {
def hello():
    print("Hello, ArtiScript!")
    return True
}

// 行内代码
:p { 使用 `:code` 区块来展示代码 }
```

#### 媒体类

```
:img src="url" alt="描述" width=600 height=400
:video src="url" controls autoplay
:audio src="url" controls
```

#### 组件类（Markdown 没有的！）

```
// 提示框
:alert type=tip title="提示" {
  这是一条提示信息的内容。
}

:alert type=warning {
  警告！请注意...
}

:alert type=danger {
  危险操作！
}

:alert type=success {
  操作成功~
}

// 按钮
:btn type=primary href="#content" { 开始阅读 }
:btn type=secondary onclick="alert('hi')" { 点击我 }
:btn type=ghost size=small { 小按钮 }

// 徽章
:badge type=info { 新 }
:badge type=warning { 测试 }
:badge type=success { 完成 }

// 卡片
:card .hover-effect {
  :h3 { 卡片标题 }
  :p { 卡片内容文字 }
  :btn type=primary { 查看详情 }
}

// 折叠
:collapse title="点击展开" {
  折叠起来的内容...
}

// 进度条
:progress value=75 max=100

// 时间表
:timeline {
  :item date="2026-03" { 项目启动 }
  :item date="2026-04" { 第一版完成 }
  :item date="2026-06" { 重构为 ArtiScript }
}
```

#### 布局类（Markdown 完全做不到的！）

```
// 网格布局
:grid cols=2 gap=20 {
  :card { 第一列内容 }
  :card { 第二列内容 }
}

:grid cols=3 gap=16 {
  :card { 列1 }
  :card { 列2 }
  :card { 列3 }
}

// 弹性布局
:flex direction=row gap=12 wrap {
  :btn { 按钮1 }
  :btn { 按钮2 }
  :btn { 按钮3 }
}

// 分栏（侧边栏）
:sidebar side=left width=250 {
  :p { 侧边栏内容 }
}
:main {
  :p { 主内容区 }
}

// 居中区
:center {
  :h1 { 居中标题 }
  :btn { 居中按钮 }
}
```

#### 数据可视化类

```
// 图表（需要 Chart.js）
:chart type=bar title="访问量统计" {
  labels: 周一, 周二, 周三, 周四, 周五
  data: 120, 200, 150, 300, 250
}

:chart type=line title="趋势" {
  labels: 1月, 2月, 3月
  data: 100, 200, 300
}

// 统计数字
:stat value=1234 label="访问量" prefix="" suffix="次"
:stat value=99.9 label="好评率" suffix="%"
```

#### 交互类

```
// 选项卡
:tabs {
  :tab title="介绍" {
    介绍内容...
  }
  :tab title="详情" {
    详情内容...
  }
}

// 手风琴
:accordion {
  :pane title="问题1" {
    答案1...
  }
  :pane title="问题2" {
    答案2...
  }
}

// 计数器（动画）
:counter from=0 to=1000 duration=2000 { 次 }
```

---

## 变量与模板

```
// 定义变量
@var site_name=管哥的博客
@var base_url=https://example.com

// 使用变量
:p { 欢迎来到 {site_name}！ }
:btn href="{base_url}/about" { 关于 }
```

---

## 简写语法（语法糖）

为了保持可读性，ArtiScript 提供简写形式：

```
// 标题简写
# 一级标题          →  :h1 { 一级标题 }
## 二级标题         →  :h2 { 二级标题 }
### 三级标题        →  :h3 { 三级标题 }

// 段落简写（以普通文字开头即视为段落）
这是普通段落          →  :p { 这是普通段落 }

// 引用简写
> 引用文字          →  :quote { 引用文字 }

// 列表简写
- 项目1             →  :ul > :li { 项目1 }
1. 项目1            →  :ol > :li { 项目1 }

// 代码简写
```python
def hello():
    pass
```
                  →  :code lang=python { def hello()... }

// 分隔线简写
---                →  :hr
```

---

## 完整示例

```artiscript
@title ArtiScript 介绍
@author 管哥
@date 2026-06-15
@tags 技术, 创新, ArtiScript
@theme dark
@layout fluid

===

=== hero ===
:center {
  :h1 { 欢迎来到 ArtiScript }
  :p .lead { 下一代博客编写语言 · Markdown 3.0 }
  :btn type=primary href="#content" { 开始阅读 }
}
===

=== content ===
:section #content {
  :h2 { 什么是 ArtiScript？ }
  
  :p {
    **ArtiScript** 不是 Markdown 的变种，
    而是一个全新的「结构化文档协议」。
  }
  
  :p {
    与 Markdown 的扁平线性结构不同，
    ArtiScript 使用**递归嵌套区块**作为核心抽象。
  }
  
  :alert type=tip title="核心创新" {
    - 组件是一等公民，不是 HTML 补丁
    - 声明式布局，不再依赖外部 CSS
    - 内置变量系统，支持模板渲染
    - 模块化设计，支持 @import 导入
  }
}

:section {
  :h2 { 特性展示 }
  
  :grid cols=2 gap=20 {
    :card .hover {
      :h3 { 🚀 组件化 }
      :p { 所有元素都是组件，可组合嵌套 }
    }
    :card .hover {
      :h3 { 🎨 样式隔离 }
      :p { 每个区块独立定义样式作用域 }
    }
    :card .hover {
      :h3 { 📐 布局控制 }
      :p { 描述式网格/弹性布局指令 }
    }
    :card .hover {
      :h3 { 🔗 模块化 }
      :p { 支持跨文件导入复用区块 }
    }
  }
}

:section {
  :h2 { 代码示例 }
  
  :code lang=python title="hello_artiscript.py" {
    def render_blog(blog_file):
        """ArtiScript 解码器伪代码"""
        ast = parse(blog_file)      # 解析为 AST
        theme = load_theme("dark")  # 加载主题
        html = render(ast, theme)   # 渲染为 HTML
        return html
  }
  
  :p {
    解码器是纯前端 JS 实现，
    无需服务端渲染，直接把 `.blog` 变成网页~
  }
}

:section {
  :h2 { 数据统计 }
  
  :flex direction=row gap=20 wrap {
    :stat value=1234 label="总访问" suffix="次"
    :stat value=99.9 label="好评率" suffix="%"
    :stat value=15 label="文章数" suffix="篇"
  }
}

:section {
  :h2 { 时间线 }
  
  :timeline {
    :item date="2026-03" { 项目启动 }
    :item date="2026-04" { 完成初版（Markdown 风格）}
    :item date="2026-06" { 重构为 ArtiScript（全新设计）}
  }
}

===

=== footer ===
:center {
  :p .muted { 感谢阅读我的文章~ }
  :hr
  :p .small { © 2026 {site_name} · 用 ArtiScript 编写 }
}
===
```

---

## 解码器工作原理

```
.blog 文件
    ↓
词法分析（tokenizer）
    ↓
语法分析（parser）→ AST（抽象语法树）
    ↓
主题渲染（renderer）→ HTML DOM
    ↓
插入到 index.html 的 #content 容器
```

AST 示例（对应上面的文档）：
```json
{
  "type": "document",
  "meta": {
    "title": "ArtiScript 介绍",
    "author": "管哥",
    "theme": "dark"
  },
  "zones": [
    {
      "type": "zone",
      "name": "hero",
      "blocks": [
        {"type": "center", "blocks": [...]}
      ]
    },
    {
      "type": "zone",
      "name": "content",
      "blocks": [...]
    }
  ]
}
```

---

## 与 muban.html 功能对照

| muban.html 功能 | ArtiScript 语法 | 说明 |
|----------------|----------------|------|
| 标题 h1~h6 | `:h1` ~ `:h6` 或 `#` ~ `######` | |
| 段落 | `:p` 或普通文字行 | |
| 引用 | `:quote` 或 `> ` | |
| 代码块 | `:code lang=...` 或 ` ``` ` | 支持语言高亮 |
| 行内代码 | `` `code` `` | 同 Markdown |
| 列表 | `:ul` / `:ol` | |
| 表格 | `:table` | 见下方 |
| 按钮 | `:btn type=...` | 多种样式 |
| 徽章 | `:badge type=...` | |
| 提示框 | `:alert type=...` | tip/warning/danger/success |
| 卡片 | `:card` | 可嵌套 |
| 折叠 | `:collapse` | |
| 进度条 | `:progress` | |
| 网格 | `:grid cols=...` | **Markdown 没有** |
| 弹性布局 | `:flex` | **Markdown 没有** |
| 图表 | `:chart` | **Markdown 没有** |
| 统计数字 | `:stat` | **Markdown 没有** |
| 时间线 | `:timeline` | **Markdown 没有** |
| 选项卡 | `:tabs` | **Markdown 没有** |
| 手风琴 | `:accordion` | **Markdown 没有** |
| 变量 | `@var` + `{var}` | **Markdown 没有** |
| 导入 | `@import` | **Markdown 没有** |

---

## 为什么这是「Markdown 3.0」？

1. **向后兼容的简写**：`# 标题` 依然有效，迁移成本低
2. **表达力数量级提升**：原本需要写 HTML 的地方，现在用声明式语法
3. **结构化而非装饰性**：Markdown 是「给纯文本加装饰」，ArtiScript 是「描述文档结构」
4. **可编程**：变量、导入、数据绑定让博客文件变成「文档程序」
5. **主题无关**：内容与表现分离，同一 `.blog` 文件可套不同主题

---

## 待扩展方向（v2 计划）

- `:form` 区块（评论框、联系表单）
- `:map` 区块（嵌入地图）
- `:math` 区块（LaTeX 数学公式）
- `:mermaid` 区块（流程图、序列图）
- `:api` 区块（自动生成 API 文档）
- 条件渲染：`:if var=show_detail { ... }`
- 循环渲染：`:for item in items { ... }`
- 远程数据：`:fetch url { ... template ... }`

---

*ArtiScript v1 Specification*  
*Designed for ciallo0721-cmd.top*  
*2026-06-15*
