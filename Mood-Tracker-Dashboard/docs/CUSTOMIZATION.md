# 🛠️ 自定义指南

本指南将帮助你深度定制 Mood Tracker 的外观和行为。

---

## 📦 CSS 变量自定义

### 背景与颜色

编辑 `src/style/_variables.scss`:

```scss
:root {
  /* 容器背景 */
  --wall-bg: #f8fafc;           // 浅灰蓝
  
  /* 文本颜色 */
  --text-gray: #718096;         // 中灰
  
  /* Heatmap 单元格 */
  --empty-cell: #ffffff;        // 无数据时显示白色
}
```

常见颜色方案：

**亮色系（推荐）:**
```scss
--wall-bg: #ffffff;             // 纯白
--text-gray: #64748b;           // 深灰
--empty-cell: #f8fafc;          // 超浅灰
```

**暗色系:**
```scss
--wall-bg: #1a202c;             // 深灰
--text-gray: #cbd5e0;           // 浅灰
--empty-cell: #2d3748;          // 中深灰
```

---

### 📐 尺寸与间距

```scss
:root {
  /* Heatmap 单元格尺寸 */
  --cell-w: 14px;               // 单元格宽度
  --cell-h: 11px;               // 单元格高度
  --gap: 3px;                   // 单元格间距
  
  /* 散点图尺寸 */
  --scatter-w: 600px;           // 宽度
  --scatter-h: 350px;           // 高度
  --dot-size: 14px;             // 数据点直径
}
```

**示例：更紧凑的设计**
```scss
--cell-w: 12px;
--cell-h: 9px;
--gap: 2px;
--dot-size: 10px;
```

---

### 🎬 动画配置

```scss
:root {
  /* 缓动函数 */
  --ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);    // 弹性
  --ease-out-expo: cubic-bezier(0.23, 1, 0.32, 1);       // 流畅
}
```

改变悬停时的动画强度：

在 `.cell:hover` 中找到：
```css
transform: scale(1.6);          // 改为 1.4 或 1.8
transition: transform 0.4s ...  // 改为 0.2s (快) 或 0.6s (慢)
```

---

## 🎨 颜色映射逻辑

### 默认：基于酒精消耗的色相

在 Jekyll 中找到这行：
```liquid
{% assign hue = a_f | minus: 1.0 | times: 11.25 | plus: 155.0 %}
```

**色相值参考:**
```
0°   = 红色 (high stress)
60°  = 黄色 (moderate)
120° = 绿色 (calm)
180° = 青色 (peaceful)
240° = 蓝色 (focused)
300° = 紫色 (creative)
```

**示例：改为蓝色系**
```liquid
{% assign hue = a_f | minus: 1.0 | times: 20.0 | plus: 200.0 %}
```

### 明度（亮度）

找到这行：
```liquid
{% assign lit = l_p1 | minus: l_p2 | plus: 30.0 %}
```

- `l_p1 = m_f * 11.0` - 心情对亮度的影响
- `l_p2 = a_f * 7.0` - 酒精对亮度的影响
- `+ 30.0` - 基础亮度

**调整：让心情影响更大**
```liquid
{% assign lit = l_p1 | minus: l_p2 | times: 1.2 | plus: 25.0 %}
```

---

## 🔄 改变指标含义

### 将 "Alcohol" 改为 "Sleep Quality"

**第 1 步：修改 HTML 标签**
```html
<!-- 找到这行 -->
<div class="axis-title title-x">Alcohol Consumption</div>

<!-- 改为 -->
<div class="axis-title title-x">Sleep Quality</div>
```

**第 2 步：修改数据字段名（可选）**

在 YAML 中保持 `a` 字段，但在 Tooltip 中改名：
```liquid
<!-- 找到这行 -->
data-tip="{{ d_str }}&#10;Mood: {{ entry.m }} Alcohol: {{ entry.a }}"

<!-- 改为 -->
data-tip="{{ d_str }}&#10;Mood: {{ entry.m }} Sleep: {{ entry.a }}"
```

---

## 🎯 响应式断点调整

在 `@media (max-width: 768px)` 中修改：

```scss
@media (max-width: 768px) {
  .mood-dashboard-embed-context { 
    padding: 30px 20px;         // 容器内边距
  }
  
  :root {
    --cell-h: 8px;              // 缩小单元格
    --scatter-h: 280px;         // 缩小散点图
    --dot-size: 12px;           // 缩小数据点
  }
  
  .matrix-wrapper { 
    margin-bottom: 25px;        // 减少间距
  }
}
```

**添加超小屏幕支持：**
```scss
@media (max-width: 480px) {
  .mood-dashboard-embed-context { 
    padding: 20px 15px;
  }
  
  :root {
    --cell-w: 10px;
    --cell-h: 8px;
    --gap: 2px;
  }
  
  .month-labels {
    font-size: 8px;
  }
}
```

---

## ✏️ 修改 Tooltip 样式

在 `[data-tip]::after` 中：

```css
[data-tip]::after {
  background: rgba(15, 23, 42, 0.95);    // 背景色（黑色+透明）
  color: #fff;                            // 文字色
  padding: 10px 14px;                     // 内边距
  border-radius: 8px;                     // 圆角
  font-size: 11px;                        // 字体大小
  box-shadow: 0 15px 30px ...             // 阴影
}
```

**示例：浅色 Tooltip**
```css
[data-tip]::after {
  background: rgba(255, 255, 255, 0.98);
  color: #1e293b;
  border: 1px solid #e2e8f0;
}
```

---

## 🌙 暗色主题支持

添加系统暗色模式支持：

```css
@media (prefers-color-scheme: dark) {
  :root {
    --wall-bg: #1a202c;
    --text-gray: #cbd5e0;
    --empty-cell: #2d3748;
  }
  
  [data-tip]::after {
    background: rgba(200, 200, 200, 0.95);
    color: #1a202c;
  }
}
```

---

## 🔊 禁用动画（无障碍）

添加这段 CSS 以支持 `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .cell, .dot, [data-tip]::after {
    transition: none !important;
  }
  
  .cell:hover, .dot:hover {
    transform: scale(1) !important;
  }
}
```

---

## 📊 自定义散点图背景

找到：
```css
.scatter-canvas {
  background: linear-gradient(to bottom right, #5eead4 0%, #334155 65%, #1e293b 100%);
}
```

改为：

**纯色:**
```css
background: #f8fafc;
```

**渐变:**
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**网格背景:**
```css
background-image: 
  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px);
background-size: 50px 50px;
```

---

## 🎮 交互增强

### 改变悬停缩放比例

```css
.cell:hover {
  transform: scale(1.6);    /* 改为 1.3-2.0 */
}

.dot:hover {
  transform: translate(-50%, -50%) scale(1.8);    /* 改为任何值 */
}
```

### 改变悬停速度

```css
.cell, .dot {
  transition: transform 0.4s ...;    /* 改为 0.2s-0.8s */
}
```

### 禁用悬停效果

```css
.cell:hover {
  transform: none !important;
  box-shadow: none !important;
}
```

---

## 🔧 JavaScript 定制（未来功能）

如果集成 JavaScript 版本，可以监听事件：

```javascript
// 例子（待实现）
document.addEventListener('mood-cell-hover', (e) => {
  console.log('Hovered date:', e.detail.date);
  console.log('Mood:', e.detail.mood);
});
```

---

## 📝 常见定制场景

### 场景 1: 最小化设计

```scss
--cell-w: 10px;
--cell-h: 8px;
--gap: 2px;
--dot-size: 10px;
--scatter-w: 500px;
--scatter-h: 300px;
```

### 场景 2: 信息密度最大

```scss
--cell-w: 16px;
--cell-h: 12px;
--gap: 4px;
--dot-size: 16px;
```

### 场景 3: 移动设备优先

```scss
@media (min-width: 1024px) {
  :root {
    --cell-w: 16px;
    --cell-h: 13px;
    --dot-size: 16px;
  }
}
```

---

## 💾 编译和部署

修改完成后：

```bash
# 编译 SCSS
npm run build

# 本地测试
npm run dev

# 推送到生产
git push
```

---

## 🐛 调试技巧

### 检查计算的颜色值

在浏览器开发者工具中：
```javascript
const cell = document.querySelector('.cell');
console.log(window.getComputedStyle(cell).backgroundColor);
```

### 临时禁用动画测试

```css
* {
  animation: none !important;
  transition: none !important;
}
```

### 检查数据是否正确加载

```liquid
<!-- 在 HTML 中临时添加调试信息 -->
{% if site.data.moods %}
  Data loaded: {{ site.data.moods | size }} entries
{% else %}
  No data found!
{% endif %}
```

---

**需要帮助？[创建 Issue](https://github.com/LiuyiRigel/mood-tracker-dashboard/issues)**
