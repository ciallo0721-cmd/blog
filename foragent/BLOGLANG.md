# Blog Language v1.0 语法规范

> 为 ciallo0721-cmd 个人网站文章系统设计的轻量标记语言。
> 目标：可读、易懂、支持所有 muban 模板功能。

---

## 文件结构

每篇文章对应一个文件夹，内含两个文件：

```
blog/50/
├── index.html   ← 通用解码器（所有文章相同）
└── 50.blog     ← 文章源文件（用 Blog Language 编写）
```

---

## 一、文件头（元数据区）

用 `---` 三道横线包裹，YAML 风格，一目了然：

```blog
---
title: UTAU教程：从调音到发布完全指南
intro: 学习如何使用UTAU进行歌声合成，从基础调音到高级技巧。
date: 2025-12-28
tags: UTAU, 虚拟歌姬, 调音教程
readtime: 约15分钟
---
```

| 字段 | 说明 | 必填 |
|------|------|------|
| `title` | 文章标题 | ✅ |
| `intro` | 文章简介（显示在标题下方） | ✅ |
| `date` | 发布日期，格式 `YYYY-MM-DD` | ✅ |
| `tags` | 标签，逗号分隔 | ✅ |
| `readtime` | 阅读时间，如 `约8分钟` | ❌ |

---

## 二、正文内容

支持标准 Markdown 语法，并扩展特殊组件。

### 2.1 标题

```blog
## 二级标题（对应 h2）
### 三级标题（对应 h3）
```

> ⚠️ 文章标题由 `title` 元数据自动生成，正文中只用 `##` 和 `###`。

---

### 2.2 段落与文字样式

```blog
普通段落文字，支持换行。

**粗体文字**
*斜体文字*
`行内代码（鼠标悬停显示）`
==粉色高亮==    ==蓝色高亮==
```

渲染效果：
- `**粗体**` → `<strong>粗体</strong>`
- `*斜体*` → `<em>斜体</em>`
- `` `代码` `` → 悬停揭示的代码样式
- `==高亮==` → 粉色高亮 span
- `==blue 文字==` → 蓝色高亮 span

---

### 2.3 列表

```blog
- 无序列表项
- 无序列表项
  - 嵌套列表项（缩进2空格）

1. 有序列表项
2. 有序列表项
```

---

### 2.4 引用

```blog
> 这是一段引用文字。
> 可以多行。

> > 嵌套引用（二级引用）
```

---

### 2.5 代码块

用三个反引号包裹，可指定语言（用于代码高亮提示）：

````blog
```python
def hello():
    print("Hello World")
```
````

---

### 2.6 链接

```blog
[普通链接文字](https://example.com)
[卡片链接](https://example.com){card}
[外链](https://example.com){ext}
```

| 格式 | 渲染效果 |
|------|-----------|
| 默认 | 行内链接，蓝色虚线下划线 |
| `{card}` | 卡片式链接（带图标和边框） |
| `{ext}` | 外链标记（末尾加 ↗ 箭头） |

---

### 2.7 图片

```blog
![图片描述](image.png)
![可放大图片](image.png){zoom}
![图片描述](image.png)
*图片标题文字*
```

> `{zoom}` 标记使图片可点击放大（调用 media-viewer）。

---

### 2.8 分隔线

```blog
---
```

渲染为带文字的分割线（可选在 `---` 后加文字）：

```blog
--- 华丽分割线 ---
```

---

## 三、特殊组件

用 `:::组件名[属性]内容:::` 语法，类似 MDX。

---

### 3.1 按钮

```blog
:::button{type="primary" link="../../index.html"}
返回首页
:::

:::button{type="outline" link="https://github.com"}
GitHub 主页
:::

:::button{type="ghost"}
无链接按钮
:::
```

| `type` 值 | 样式 |
|-----------|------|
| `primary` | 粉色→蓝色渐变，白色文字 |
| `outline` | 透明底，粉色边框 |
| `ghost` | 浅灰底，无边框 |
| `success` | 绿色渐变 |
| `danger` | 红色渐变 |
| `small` | 小号尺寸（可与上述组合，如 `primary small`） |
| `large` | 大号尺寸 |

---

### 3.2 徽章（标签）

```blog
:::badge{color="pink"}
NEW
:::

:::badge{color="blue"}
已完成
:::
```

| `color` 值 | 颜色 |
|------------|------|
| `pink` | 粉色 |
| `blue` | 蓝色 |
| `green` | 绿色 |
| `orange` | 橙色 |
| `gray` | 灰色 |

---

### 3.3 提示框（Callout）

```blog
:::callout{type="info" title="提示"}
这是一条普通提示信息。
:::

:::callout{type="warning" title="注意"}
此功能处于测试阶段。
:::

:::callout{type="danger" title="危险操作"}
此操作不可逆！
:::

:::callout{type="success" title="操作成功"}
所有测试均已通过！
:::

:::callout{type="pink" title="站长说"}
这就是粉色备注框喵～
:::
```

---

### 3.4 表格

```blog
| 列1标题 | 列2标题 | 列3标题 |
|----------|----------|----------|
| 单元格1 | 单元格2 | 单元格3 |
| 数据A    | 数据B    | 数据C    |
```

> 解码器会自动给表格加滚动包裹和样式。

---

### 3.5 进度条

```blog
:::progress{label="HTML/CSS" value="95" color="pink"}:::
:::progress{label="JavaScript" value="80" color="blue"}:::
:::progress{label="Python" value="72" color="green"}:::
```

| `color` 值 | 进度条颜色 |
|------------|-----------|
| `pink` | 粉色渐变 |
| `blue` | 蓝色渐变 |
| `green` | 绿色渐变 |
| `orange` | 橙色渐变 |
| `gray` | 灰色渐变 |

---

### 3.6 音频播放器

```blog
:::audio{src="./music/sample.mp3" title="歌曲标题"}:::
```

解码器会生成自定义音频播放器（依赖 `mus/audio-player.js`）。

---

### 3.7 视频播放器

```blog
:::video{src="./video/demo.mp4" title="演示视频"}:::
```

解码器会生成自定义视频播放器（依赖 `nice-video.js`）。

---

### 3.8 折叠区域（剧透警告）

```blog
:::spoiler{title="点击展开隐藏内容"}
这里是折叠起来的内容。
可以包含 **粗体**、列表等任意内容。
:::
```

---

### 3.9 卡片网格

```blog
:::cardgrid::
:::card{icon="🌐" title="CDN 节点" desc="Cloudflare 全球加速" badge="正常" badgeColor="green"}:::
:::card{icon="📄" title="文章数量" desc="共 16 篇已发布" badge="持续更新" badgeColor="blue"}:::
:::cardgrid:::
```

---

### 3.10 键盘按键

```blog
按 <kbd>ESC</kbd> 关闭弹窗
按 <kbd>Ctrl</kbd> + <kbd>S</kbd> 保存
```

---

### 3.11 分割线文字

```blog
== 华丽分割线 ==
```

---

### 3.12 PDF 阅读器

```blog
:::pdf{title="参考文档"}:::
```

> 生成 PDF.js 阅读器界面，支持上传本地 PDF 或输入 URL 加载。

---

## 四、图表（Canvas）

图表需要通过 JavaScript 绘制，在 `.blog` 文件中用特殊标记声明数据，
解码器会生成对应的 Canvas 元素并调用绘图函数。

```blog
:::chart{type="line" title="月访问量趋势（PV）" labels='["1月","2月","3月"]' data='[1024,889,1580]'}:::

:::chart{type="bar" title="各文章阅读量" labels='["文章1","文章2"]' data='[3200,1800]'}:::

:::chart{type="pie" title="流量来源" labels='["直接访问","搜索引擎"]' data='[52,28]' colors='["#FB7299","#00A1D6"]'}:::
```

---

## 五、完整示例

```blog
---
title: 测试文章标题
intro: 这是一篇测试文章，展示所有 Blog Language 功能。
date: 2026-06-15
tags: 测试, 样板, Blog Language
readtime: 约5分钟
---

## 第一章节

这是一段普通段落。**粗体文字** 和 *斜体文字* 效果演示。

`行内代码悬停显示`

### 小标题

> 引用内容示例

- 列表项1
- 列表项2

1. 有序列表1
2. 有序列表2

[普通链接](../../index.html)
[卡片链接](../../index.html){card}

---

## 特殊组件演示

:::button{type="primary" link="../../index.html"}
返回首页
:::

:::badge{color="pink"}:::
NEW
:::

:::callout{type="info" title="提示"}
这是一条提示信息。
:::

| 测试 | 数据 |
|------|------|
| A    | 1    |
| B    | 2    |

:::progress{label="测试技能" value="75" color="pink"}:::

---
```

---

## 六、解码器工作原理

`index.html`（解码器）工作流程：

1. 从 URL 路径提取文章 ID（如 `/blog/50/` → `50`）
2. 用 `fetch()` 加载 `50.blog` 文件
3. 解析文件头元数据 → 生成文章标题区
4. 解析正文 → 转换为 HTML（支持所有特殊组件）
5. 注入到页面模板中渲染

---

## 七、编写建议

1. **文件头必须放在最前面**，用 `---` 包裹
2. **标题只用 `##` 和 `###`**，不用 `#`（文章标题由元数据生成）
3. **组件语法** `:::组件名{属性}内容:::` 注意冒号数量（3个）
4. **图片路径** 相对于 `.blog` 文件所在文件夹
5. **代码块** 语言标识可选，不影响渲染
6. 写完可用解码器预览效果再发布

---

*Blog Language v1.0 - 为 ciallo0721-cmd 个人网站设计*
