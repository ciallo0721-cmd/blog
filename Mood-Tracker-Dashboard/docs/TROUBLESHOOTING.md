# ❓ 常见问题 & 故障排除

## 基础问题

### Q1: 我按照说明做了，但看不到仪表板

**A:** 检查以下几点：

**✓ Jekyll 项目：**
- [ ] `mood-dashboard.html` 是否在 `_includes` 文件夹中
- [ ] `moods.yml` 是否在 `_data` 文件夹中
- [ ] 文件名完全匹配（大小写敏感）
- [ ] 在你的 Markdown 中添加了 `{% include mood-dashboard.html %}`

运行：
```bash
jekyll build
jekyll serve
```

然后访问 `http://localhost:4000`

**✓ Hugo 项目：**
- [ ] CSS 是否加载成功（检查网络标签）

---

### Q2: 数据没有显示（全部或部分）

**可能原因：**

1. **日期格式错误**
   ```yaml
   ❌ 错误: 01-15-2026 or 2026/01/15
   ✅ 正确: 2026-01-15
   ```

2. **评分超出范围**
   ```yaml
   ❌ 错误: m: 6 or m: 0
   ✅ 正确: m: 1.0 到 5.0
   ```

3. **使用了错误的数据字段名**
   ```yaml
   ❌ 错误: mood: 3.5 (应该是 m)
   ✅ 正确: m: 3.5
   ```

4. **YAML 缩进错误**
   ```yaml
   ❌ 错误:
   - date: "2026-01-01"
     m: 3.5
   a: 2.0

   ✅ 正确:
   - date: "2026-01-01"
     m: 3.5
     a: 2.0
   ```

---

### Q3: 颜色都是白色/灰色

**A:** 可能是没有找到数据。检查：
- YAML 文件是否保存并格式正确
- 日期是否在 2026-01-01 到 2026-12-31 范围内
- Jekyll 是否正确处理了数据文件

**调试：** 在浏览器控制台运行：
```javascript
// 如果你在纯 HTML 版本中
console.log(window.moodData);
```

---

## 样式问题

### Q4: Tooltip 超出屏幕边界

**A:** 这是正常的。改进方案中会添加智能定位。目前的解决方案：

在 `[data-tip]::after` 中改变位置：
```css
[data-tip]::after {
  bottom: auto;              /* 改为顶部显示 */
  top: -50px;
}
```

或使用绝对定位的前缀：
```html
<!-- 对于靠近底部的元素 -->
<div ... data-tip-position="top"></div>
```

---

### Q5: 在移动设备上显示太小

**A:** 添加自定义 CSS：

```css
@media (max-width: 768px) {
  :root {
    --cell-w: 16px;      /* 改大 */
    --cell-h: 13px;
    --dot-size: 16px;
  }
}
```

---

### Q6: 动画太快/太慢

**A:** 在 `.cell, .dot` 中修改：

```css
.cell, .dot {
  transition: transform 0.4s ...;   /* 改为 0.2s-0.7s */
}
```

---

## 集成问题

### Q7: Hugo 中无法识别 Liquid 语法

**A:** Hugo 使用 Go templates，不是 Liquid。

**解决方案：** 使用提供的 `hugo-partial.html`，它已转换为 Go 语法。

或者手动转换（示例）：
```go
<!-- Jekyll Liquid -->
{% for item in site.data.moods %}
  {{ item.date }}
{% endfor %}

<!-- Hugo Go -->
{{ range $.Site.Data.moods }}
  {{ .date }}
{{ end }}
```

---

### Q8: 与其他 CSS 冲突

**A:** 组件使用了命名空间类 `.mood-dashboard-embed-context`，冲突概率很低。

如果仍有冲突，可以为所有类添加前缀：
```css
/* 将所有 .cell 改为 .mood-cell */
.mood-cell { ... }
.mood-dot { ... }
```

---

## 数据问题

### Q9: 如何导入现有数据？

**A:** 如果你有 CSV 或 JSON 格式的数据，需要转换为 YAML：

**CSV 转 YAML 脚本：**
```python
import csv
import yaml

data = []
with open('moods.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        data.append({
            'date': row['date'],
            'm': float(row['mood']),
            'a': float(row['alcohol']),
            'note': row.get('note', '')
        })

with open('_data/moods.yml', 'w') as f:
    yaml.dump(data, f, default_flow_style=False)
```

---

### Q10: 可以只显示特定日期范围吗？

**A:** 可以。在 Jekyll 中修改：

```liquid
{% assign start_date = "2025-06-01" %}
{% assign end_date = "2025-12-31" %}

{% for entry in site.data.moods %}
  {% if entry.date >= start_date and entry.date <= end_date %}
    <!-- 显示这个条目 -->
  {% endif %}
{% endfor %}
```

---

## 性能问题

### Q11: 页面加载很慢

**A:** 可能原因：

1. **数据文件过大**
   - 检查 `moods.yml` 是否超过 100KB
   - 如果是，考虑只包含必要字段

2. **CSS 重绘**
   - 检查是否有太多悬停效果
   - 考虑禁用 `box-shadow` 在 `:hover` 中

3. **浏览器渲染**
   - 使用 `will-change: transform` 告诉浏览器优化

---

### Q12: 散点图渲染缓慢（数据点很多）

**A:** 如果有 500+ 数据点，考虑：

1. **只显示采样数据**
   ```liquid
   {% assign counter = 0 %}
   {% for item in site.data.moods %}
     {% if counter | modulo: 2 == 0 %}
       <!-- 每隔一个显示一个 -->
     {% endif %}
     {% assign counter = counter | plus: 1 %}
   {% endfor %}
   ```

2. **使用 Canvas 而不是 SVG**
   - 计划中的优化，敬请期待

---

## 浏览器兼容性

### Q13: 在 IE11 中不工作

**A:** 该项目针对现代浏览器（2020年后）。

**不支持的特性：**
- CSS Grid
- `backdrop-filter`
- CSS 变量（部分）

不建议在 IE 中使用。

---

### Q14: Safari 中的 Tooltip 显示异常

**A:** 已知问题。使用 `-webkit-` 前缀：

```css
[data-tip]::after {
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
}
```

---

## 高级问题

### Q15: 如何添加点击事件？

**A:** 目前组件不支持点击事件。可以添加：

```javascript
document.querySelectorAll('.cell').forEach(cell => {
  cell.addEventListener('click', (e) => {
    const date = e.target.getAttribute('data-tip');
    console.log('Clicked:', date);
    // 你的逻辑
  });
});
```

---

### Q16: 可以导出为图片吗？

**A:** 可以使用 HTML2Canvas：

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<button onclick="exportImage()">导出</button>

<script>
function exportImage() {
  html2canvas(document.querySelector('.mood-dashboard-embed-context')).then(canvas => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'mood-dashboard.png';
    link.click();
  });
}
</script>
```

---

## 没有见过的问题？

**💬 [在 GitHub 提出 Issue](https://github.com/LiuyiRigel/mood-tracker-dashboard/issues)**

请包含：
- [ ] 你的操作系统
- [ ] 浏览器版本
- [ ] 错误信息（如果有）
- [ ] 你的数据结构示例

---

**常见解决方案汇总：**

| 问题 | 解决方案 |
|-----|--------|
| 看不到仪表板 | 检查文件位置和命名 |
| 没有数据显示 | 验证日期格式和评分范围 |
| 样式不对 | 清除浏览器缓存 (Ctrl+Shift+R) |
| 性能问题 | 减少数据量或禁用动画 |

---

**🆘 如果问题仍未解决，请：**
1. 检查浏览器控制台错误
2. 验证所有文件路径
3. 尝试在新的浏览器标签页中加载
4. 清空缓存重新加载
5. 联系开发者

祝你使用愉快！ 💙
