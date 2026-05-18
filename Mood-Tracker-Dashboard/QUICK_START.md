# ⚡ 快速开始（5 分钟）

## 选择你的平台

### 🔷 Jest Jekyll？

**第 1 步：复制文件**
```bash
cp mood-tracker/_includes/mood-dashboard.html your-jekyll/_includes/
cp mood-tracker/_data/moods.yml your-jekyll/_data/
```

**第 2 步：在文章中添加一行**
```
{% include mood-dashboard.html %}
```

**第 3 步：用数据填充** `_data/moods.yml`
```yaml
- date: "2026-01-01"
  m: 3.5
  a: 2.0
```

✅ 完成！运行 `jekyll serve` 即可看到效果。

---

### 🔶 用 Hugo？

**第 1 步：复制**
```bash
cp mood-tracker/hugo-partial.html your-hugo/layouts/partials/mood-dashboard.html
cp mood-tracker/moods.json your-hugo/data/
```

**第 2 步：在模板中调用**
```
{{ partial "mood-dashboard" .Site.Data.moods }}
```

---

### 🔹 纯 HTML？

**第 1 步：在 HTML 中引入**
```html
<link rel="stylesheet" href="mood-tracker/dist/mood-dashboard.css">
<div id="mood-dashboard"></div>
<script src="mood-tracker/dist/mood-dashboard.js" data-moods="moods.json"></script>
```

---

## 📝 数据格式

```yaml
- date: "2026-01-01"    # 必须是 YYYY-MM-DD
  m: 3.5               # 心情分数（1-5）
  a: 2.0               # 其他指标分数（1-5）
  note: "可选备注"      # 可选
```

---

## 🎨 修改颜色

编辑 `src/style/_variables.scss`：

```scss
--wall-bg: #f8fafc;        // 背景色
--text-gray: #718096;      // 文本色
```

然后运行 `npm run build`。

---

## 📊 修改指标名称

在 HTML 中找到：
```html
<div class="axis-title title-x">Alcohol Consumption</div>
```

改为你想要的，比如：
```html
<div class="axis-title title-x">Sleep Quality</div>
```

---

## ✅ 检查清单

- [ ] 数据文件已创建且格式正确
- [ ] 至少有 7 天的数据
- [ ] 日期格式是 `YYYY-MM-DD`
- [ ] 评分是 1-5 之间的数字
- [ ] 仪表板能正常加载

---

## 🆘 常见问题

**Q: 我在 Jekyll 中看不到仪表板？**
A: 检查：
1. `mood-dashboard.html` 是否在 `_includes` 文件夹
2. `moods.yml` 是否在 `_data` 文件夹
3. 文件名是否完全匹配

**Q: 颜色显示不对？**
A: 检查 heatmap 是否有数据。如果都是白色说明没有找到数据。

**Q: 怎样隐藏散点图只显示热力图？**
A: 删除这段 HTML：
```html
<div class="scatter-plots">
  ...
</div>
```

---

## 📚 更多帮助

- 完整指南：[README.md](README.md)
- 自定义：[CUSTOMIZATION.md](docs/CUSTOMIZATION.md)
- 常见问题：[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

---

**👉 [现在就开始吧！](README.md)**
