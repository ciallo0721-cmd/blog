# SEO 加速索引计划 — 24-72 小时行动清单

## 目标
让 ciallo0721-cmd.top **在 24-72 小时内被 Google 和 Bing 索引**。

---

## 🚨 第一步：部署（0-1 小时）

### 1.1 提交所有改动
```bash
git add .
git commit -m "SEO: prerender all 24 blog posts + fix sitemap + noscript fallbacks + robots.txt"
git push origin main
```

### 1.2 确认 GitHub Actions 成功运行
- GitHub → Actions 标签页 → 确认 `pages build and deployment` ✅

---

## 🚀 第二步：Google Search Console（1-4 小时）

### 2.1 提交新 sitemap
1. 打开 [Google Search Console](https://search.google.com/search-console)
2. 选择 `ciallo0721-cmd.top` 站点
3. 左侧菜单 → Sitemaps
4. 在 "Add a new sitemap" 输入: `sitemap.xml`
5. 点击 Submit
6. **确认状态为 "Success"**

### 2.2 URL Inspection — 手动请求索引（最关键）
对以下 **核心页面** 逐个进行 URL Inspection → "Request Indexing":

| 优先级 | URL | 理由 |
|--------|-----|------|
| 🥇 | `https://ciallo0721-cmd.top/` | 首页，最重要的入口 |
| 🥇 | `https://ciallo0721-cmd.top/blog/` | 博客索引页 |
| 🥇 | `https://ciallo0721-cmd.top/blog/心理/巴纳姆效应/23/` | 6800字长文，最高质量内容 |
| 🥈 | `https://ciallo0721-cmd.top/blog/兴趣/另一个次元/22/` | 热门主题，[blog_id] 参数版 |
| 🥈 | `https://ciallo0721-cmd.top/blog/科技/python/21/` | 技术教程，高价值内容 |
| 🥈 | `https://ciallo0721-cmd.top/blog/兴趣/Vtuber/真白花音/13/` | 独特内容 |
| 🥉 | `https://ciallo0721-cmd.top/wiki/index.html` | 百科页面 |
| 🥉 | `https://ciallo0721-cmd.top/aboutme.html` | 关于页面 |
| 🥉 | 再选 2-3 篇不同分类的文章 | 覆盖广度 |

**操作步骤：**
1. 左侧菜单 → URL Inspection
2. 粘贴 URL → 回车
3. 点击 "Request Indexing"（橙色按钮）
4. 每天最多可请求 ~10-15 个 URL，分批进行

**重要：** 如果显示 "URL is on Google" 但内容不对 → 跳过，优先处理 "Not indexed" 的。

### 2.3 验证已请求的 URL 状态
- 24 小时后回查 URL Inspection 状态
- 如果某 URL 仍显示 "Crawled but not indexed" → 检查 prerender 内容是否正确

---

## ✅ 第三步：Bing Webmaster Tools（1-2 小时）

### 3.1 提交网站
1. 访问 [Bing Webmaster Tools](https://www.bing.com/webmasters/)
2. 使用 Microsoft 账号登录
3. 添加站点: `ciallo0721-cmd.top`
4. 验证方式: 选择 "Add meta tag" → 将 meta 标签添加到 `index.html` 的 `<head>` 中

> 或用 GitHub Pages 方式验证（DNS TXT 记录，通过域名提供商配置）

### 3.2 提交 sitemap
- 提交 `https://ciallo0721-cmd.top/sitemap.xml` 到 Bing

### 3.3 URL Submission (Bing URL Inspection)
- 使用 Bing 的 "URL Submission" 工具提交核心页面（同上）

---

## 📡 第四步：外部链接信号（4-24 小时）

### 4.1 GitHub 仓库 README 更新
在 `ciallo0721-cmd.github.io` 仓库的 README 顶部添加：

```markdown
# ciallo0721-cmd 的个人网站

[![Website](https://img.shields.io/badge/Website-ciallo0721--cmd.top-blue)](https://ciallo0721-cmd.top)

个人博客和技术分享站，包含 Ren'Py 视觉小说教程、Python 教程、Unity 指南等。

## 最近文章
- [雌小鬼进化史：从贬义词到萌属性](https://ciallo0721-cmd.top/blog/兴趣/另一个次元/22/)
- [占卜原理：心理学拆解](https://ciallo0721-cmd.top/blog/心理/巴纳姆效应/23/)
- [Python 截图识别文字完全教程](https://ciallo0721-cmd.top/blog/科技/python/21/)
```

**为什么有效？** GitHub Pages 仓库 → GitHub 权重高 → Google 爬取 README → 发现链接

### 4.2 Twitter/X 简介更新
在个人简介中添加网站链接：
```
ciallo0721-cmd | 个人开发者 | 博客: ciallo0721-cmd.top
```
并发一条推文（含链接）：
> "新博客文章：深度解析雌小鬼进化史，从贬义词到萌属性。欢迎来踩喵～ [链接]"

### 4.3 其他外部信号（可选但推荐）
- 在 GitHub Gist 中分享一篇技术文章，末尾附上博客链接
- 在相关技术论坛/社区（如 V2EX、NodeSeek）分享 URL
- 在个人 GitHub Profile README（`ciallo0721-cmd/ciallo0721-cmd`）添加博客链接

---

## 🔄 第五步：后续 24-72 小时维护

### 5.1 每天做的事
- 用 Search Console URL Inspection 检查前一天请求的 URL
- 重新请求任何仍显示 "Discovered - not indexed" 的页面
- 检查是否有新的 crawl errors

### 5.2 第 3 天做的事
- 查看 Search Console → Performance 报告
- 确认是否已有 Impression / Click 数据
- 如果有 1-2 篇文章被索引 → 通过内部链接带出更多文章

### 5.3 如果 72 小时后仍无变化
可能原因：
- GitHub Pages 的域名 DNS 刚改过，需要时间传播（最多 48 小时）
- CSP 太紧阻止了 Googlebot render（确认 _headers 已更新）
- Googlebot 爬取队列排队（世界范围，SaaS 类网站优先）

**补救**：在 GitHub 仓库的 Issues 里创建一个 SEO 标签 Issue，包含多篇文章的链接——GitHub Issues 被 Google 高频爬取。

---

## 📊 第六步：监控

| 指标 | 正常值 | 告警阈值 |
|------|--------|----------|
| Search Console Indexed | >0 | 0（说明还有问题）|
| 每日 Crawl Requests | >10 | <5 |
| 索引状态页 | "Indexed" | "Crawled but not indexed" |
| Bing Indexed | >0 | 0 |

---

## ⚡ 加速技巧（高级）

### 6.1 Google Discover
如果你的博客内容有趣、新颖、图文并茂，Google Discover 可能在 1-3 天内收录，不需要任何操作。

### 6.2 内部链接自动发现
一旦 Google 索引了第一篇博客文章，它会通过文章内的：
- 下一篇 / 上一篇 导航链接
- 文章列表页 `blog/index.html` 的链接
- 首页 `noscript` 的链接

……自动发现和爬取所有文章。所以 **第一篇文章被索引是最关键的一步**。

---

**总结：先部署 → 提交 Search Console → 手动请求索引 → GitHub README 外部链接 → 等待 24-72 小时。**
