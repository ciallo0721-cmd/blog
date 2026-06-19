# inject_assets.py 使用说明

## 功能
批量给所有 HTML 文件注入：
1. **Google Analytics (gtag.js)** — `G-TR4FT7JPDZ`
2. **IP 地理检测** — `geo-check.js`（拒绝美国用户）
3. **HTTP 检测提示** — 自动检测 HTTP 协议，提示切换到 HTTPS
4. **导航按钮**（仅 `index.html` / `friends.html`）— 新番数据库 + 人脸识别

## 用法
```bash
cd "g:\EmoScan Pro\ciallo0721-cmd.top"
python inject_assets.py
```

## 排除规则
- `400.html` ~ `412.html`（错误页，用户要求不加）
- `500.html` ~ `512.html`（错误页，用户要求不加）

## 重复保护
- 已含 `G-TR4FT7JPDZ` 的文件 → 跳过 GA 注入
- 已含 `geo-check.js` 的文件 → 跳过 geo-check 注入
- 已含 `nav-btn-ext` 的文件 → 跳过按钮注入
- 已含 `httpWarningOverlay` 的文件 → 跳过 HTTP 检测注入

## 注意事项
- 执行前建议 `git commit` 备份
- 执行后用浏览器打开 `index.html` 检查按钮样式是否正常
- 导航按钮样式为 inline `style=`，在不同页面可能需要微调
