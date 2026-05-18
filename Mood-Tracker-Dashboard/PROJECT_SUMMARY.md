# 📋 Mood Tracker Dashboard - 项目总结

## 🎯 什么是这个项目？

一个**即插即用的心情追踪仪表板组件**，可以集成到任何静态网站生成器中（Jekyll、Hugo、纯 HTML）。

- 📅 展示一年 365 天的心情热力图（GitHub 风格）
- 📊 展示两个指标的相关性散点图
- 🎨 优雅的交互设计，平滑的动画
- 🔧 完全可自定义
- ⚡ 无复杂依赖

---

## 📁 项目结构

```
mood-tracker/
├── README.md                    # 主文档
├── QUICK_START.md              # 5分钟快速开始
├── package.json                # NPM 配置
├── LICENSE                      # MIT 许可
├── .gitignore
│
├── src/
│   ├── _includes/
│   │   └── mood-dashboard.html # Jekyll 组件（核心）
│   └── style/
│       └── （未来扩展）
│
├── dist/                        # 编译输出（未来）
│
├── data/
│   ├── moods.yml               # YAML 示例数据
│   └── moods.json              # JSON 示例数据
│
└── docs/
    ├── CUSTOMIZATION.md        # 深度自定义指南
    ├── TROUBLESHOOTING.md      # FAQ & 故障排除
    └── API.md                  # （未来）
```

---

## 🚀 核心功能

### 1. Heatmap（热力图）
- 一年 365 天显示为 7×52 的网格
- 颜色根据数据计算（HSL 色彩空间）
- 悬停时显示详细信息

### 2. Scatter Plot（散点图）
- X 轴：第二个指标（如酒精）
- Y 轴：心情
- 每个点代表一条数据记录
- 展示两个指标的相关性

### 3. 交互设计
- 平滑的悬停动画（弹性缓动）
- 自动 Tooltip（无需 JavaScript）
- 响应式设计（移动端适配）

---

## 📊 数据格式

### YAML 格式（Jekyll）
```yaml
- date: "2026-01-15"
  m: 3.5           # mood: 1-5
  a: 2.0           # alcohol/other: 1-5
  note: "optional note"
```

### JSON 格式（Hugo/静态）
```json
{
  "date": "2026-01-15",
  "m": 3.5,
  "a": 2.0,
  "note": "optional"
}
```

---

## 🎨 自定义选项

### CSS 变量
```css
--wall-bg: #f8fafc;          /* 背景色 */
--text-gray: #718096;        /* 文本色 */
--cell-w: 14px;              /* 单元格大小 */
-- dot-size: 14px;           /* 数据点大小 */
/* 等等 */
```

### 颜色计算
- 基于两个指标的 HSL 算法
- 可完全自定义色相、饱和度、亮度

### 动画
- 缓动函数可配
- 转换时间可调
- 可禁用（无障碍支持）

---

## ✅ 集成场景

### Jekyll
```markdown
{% include mood-dashboard.html %}
```

### Hugo
```go
{{ partial "mood-dashboard" .Site.Data.moods }}
```

### 纯 HTML
```html
<link rel="stylesheet" href="mood-tracker/dist/mood-dashboard.css">
<div id="mood-dashboard"></div>
<script src="mood-tracker/dist/mood-dashboard.js"></script>
```

---

## 📝 文档

| 文档 | 用途 |
|------|------|
| [README.md](README.md) | 完整说明 |
| [QUICK_START.md](QUICK_START.md) | 5分钟上手 |
| [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md) | 深度自定义 |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | FAQ & 故障排除 |

---

## 🎯 使用场景

1. **个人博客** - 显示自己的心情/生活追踪
2. **心理健康追踪** - 可视化情绪波动
3. **数据科学项目** - 展示两变量的相关性
4. **研究论文** - 嵌入互动可视化
5. **团队仪表板** - 显示健康指标

---

## 🔄 改进计划

- [ ] 月趋势线（折线图）
- [ ] 统计指标（平均值、相关系数）
- [ ] Canvas 优化（更好的性能）
- [ ] 主题切换（Light/Dark）
- [ ] 国际化（多语言）
- [ ] 导出功能（图片/PDF）

---

## 💫 许可证

MIT License - 自由使用、修改、分发

---

## 🙏 贡献

欢迎提交：
- Bug 报告
- Feature 建议
- Pull Request
- 文档改进

---

## 📮 联系

- **GitHub**: [LiuyiRigel/mood-tracker-dashboard](https://github.com/LiuyiRigel/mood-tracker-dashboard)
- **Issues**: [报告问题](https://github.com/LiuyiRigel/mood-tracker-dashboard/issues)

---

## 💙 特别致谢

感谢使用此项目。希望它能帮助你更好地理解自己。

**🚀 [现在就开始](QUICK_START.md)**
