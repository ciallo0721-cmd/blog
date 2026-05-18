# 🌈 Mood Tracker Dashboard

一个优雅、轻量级的心情追踪仪表板。支持 Jekyll、Hugo、静态 HTML 等环境，帮助你可视化一年内的心情和生活习惯的关联。


<img src=".\image\2026-04-13 120755.png">

> 不是为了激励，只是为了看清自己。

---

## ✨ 功能特性

- 📅 **GitHub 风格的 Heatmap** - 一年 365 天的心情热力图
- 📊 **相关性散点图** - 展示心情与其他因素（如酒精消耗）的关联
- 🎨 **优雅的交互设计** - 平滑的悬停动画、智能 Tooltip
- 🔧 **完全自定义** - 易修改的 CSS 变量，支持亮色/暗色主题
- 📱 **响应式设计** - 完美适配移动设备
- ⚡ **轻量级** - 无复杂依赖，纯 HTML/CSS/Liquid
- 🔄 **即插即用** - 支持 Jekyll、Hugo、静态 HTML

---

## 🚀 [快速开始](QUICK_START.md)**

### 1️⃣ 对于 Jekyll 项目

**复制文件到你的项目：**
```bash
# 复制组件
cp -r mood-tracker/src/_includes/mood-dashboard.html your-jekyll-project/_includes/

# 复制数据示例
cp -r mood-tracker/data/moods.yml your-jekyll-project/_data/
```

**在你的文章或页面中使用：**
```
{% include mood-dashboard.html %}
```

**准备数据文件** (`_data/moods.yml`):
```yaml
- date: "2026-01-01"
  m: 3.5           # mood: 1-5 分
  a: 2.0           # alcohol: 1-5 分
  note: "New Year, feeling hopeful"

- date: "2026-01-02"
  m: 3.2
  a: 1.5
```

---

### 2️⃣ 对于 Hugo 项目

**复制到 layout 目录：**
```bash
cp mood-tracker/src/hugo-partial.html your-hugo-project/layouts/partials/mood-dashboard.html
```

**在你的模板中调用：**
```
{{ partial "mood-dashboard" .Site.Data.moods }}
```

**准备 JSON 数据** (`data/moods.json`):
```json
[
  {
    "date": "2026-01-01",
    "m": 3.5,
    "a": 2.0,
    "note": "New Year"
  }
]
```

---

### 3️⃣ 对于静态 HTML

**直接引用：**
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="mood-tracker/dist/mood-dashboard.css">
</head>
<body>
  <div id="mood-dashboard"></div>
  <script src="mood-tracker/dist/mood-dashboard.js" data-moods="moods.json"></script>
</body>
</html>
```

---

## 📝 数据格式说明

### 必需字段
- `date` (string): `YYYY-MM-DD` 格式
- `m` (number): 心情评分，1-5（可以是小数，如 3.5）
- `a` (number): 其他指标评分，1-5（如酒精消耗、睡眠质量等）

### 可选字段
- `note` (string): 该天的简短备注（可以在 Tooltip 中显示）

### 示例完整数据
```yaml
- date: "2026-01-15"
  m: 4.2
  a: 1.8
  note: "Good day at work, light dinner"

- date: "2026-01-16"
  m: 2.1
  a: 3.5
  note: "Stressed, had drinks"
```

---

## 🎨 自定义配置

### CSS 变量

编辑 `src/style/_variables.scss` 来修改外观：

```css
:root {
  /* 背景与文本 */
  --wall-bg: #f8fafc;           /* 容器背景色 */
  --text-gray: #718096;          /* 文本颜色 */
  --empty-cell: #ffffff;         /* 无数据单元格色 */
  
  /* 尺寸 */
  --cell-w: 14px;                /* 热力图单元格宽度 */
  --cell-h: 11px;                /* 热力图单元格高度 */
  --gap: 3px;                    /* 单元格间距 */
  
  /* 散点图 */
  --scatter-w: 600px;            /* 散点图宽度 */
  --scatter-h: 350px;            /* 散点图高度 */
  --dot-size: 14px;              /* 数据点大小 */
  
  /* 动画 */
  --ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out-expo: cubic-bezier(0.23, 1, 0.32, 1);
}
```

### 颜色方案

修改 HSL 计算逻辑改变颜色：

```liquid
<!-- 在 mood-dashboard.html 中找到这一行 -->
{% assign hue = a_f | minus: 1.0 | times: 11.25 | plus: 155.0 %}
<!-- 155 是起始色相（绿色），可以改为：
     0 = 红色
     60 = 黄色
     120 = 绿色
     240 = 蓝色
     300 = 紫色
-->
```

---

## 📊 进阶功能

### 1. 添加月趋势线

（参考 `docs/trends-extension.md`）

### 2. 自定义指标

不只是心情+酒精，可以追踪任何两个指标：
- 心情 vs 睡眠质量
- 能量 vs 咖啡因摄入
- 压力 vs 运动时长

只需修改 YAML/JSON 数据结构。

### 3. 数据统计

参考 `src/js/analytics.js` 计算：
- 月度均值
- 相关系数
- 周期性检测

---

## 🔧 项目结构

```
mood-tracker/
├── README.md                    # 本文件
├── QUICK_START.md              # 快速开始（简版）
├── LICENSE                      # MIT 许可证
├── package.json                # 项目信息
│
├── src/
│   ├── _includes/
│   │   └── mood-dashboard.html # Jekyll 组件
│   ├── hugo-partial.html       # Hugo 组件
│   ├── vanilla.html            # 纯 HTML 版本
│   │
│   ├── style/
│   │   ├── _variables.scss     # CSS 变量
│   │   ├── _layout.scss        # 布局样式
│   │   ├── _animation.scss     # 动画样式
│   │   └── mood-dashboard.scss # 合并输出
│   │
│   └── js/
│       ├── mood-dashboard.js   # 纯 JS 版本（可选）
│       └── analytics.js        # 数据分析工具函数
│
├── dist/
│   ├── mood-dashboard.css      # 最小化 CSS
│   ├── mood-dashboard.js       # 最小化 JS
│   └── mood-dashboard.min.css  # 超小化 CSS
│
├── examples/
│   ├── jekyll-example/         # Jekyll 完整示例
│   ├── hugo-example/           # Hugo 完整示例
│   └── static-html-example/    # 纯 HTML 示例
│
├── data/
│   ├── moods.yml               # YAML 格式示例数据
│   ├── moods.json              # JSON 格式示例数据
│   └── sample-2026.yml         # 2026 年完整示例（365 天）
│
└── docs/
    ├── CUSTOMIZATION.md        # 深度自定义指南
    ├── API.md                  # JavaScript API 文档
    ├── TRENDS.md               # 月趋势线扩展说明
    ├── TROUBLESHOOTING.md      # 常见问题
    └── preview.png             # 预览图
```

---

## 💻 开发

### 编译 SCSS

```bash
npm install
npm run build
```

### 本地测试

```bash
# Jekyll
cd examples/jekyll-example
bundle install
bundle exec jekyll serve

# 访问 http://localhost:4000
```
---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 💙 致谢

感谢使用此项目。希望它能帮助你更清楚地了解自己。

---


