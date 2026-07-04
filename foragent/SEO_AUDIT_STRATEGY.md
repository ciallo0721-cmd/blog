# SEO 全面审计与优化策略报告

> 审计时间：2026-06-23
> 目标网站：https://ciallo0721-cmd.top
> 域名迁移日期：2026-06-19（旧域名 91vip.xn--32v.ink → 新域名 ciallo0721-cmd.top）

---

## 📊 站点概况

| 项目 | 数据 |
|------|------|
| 站点类型 | 个人博客 / 创作展示站 |
| 总HTML页面数 | ~92（根目录41 + 博客文章51） |
| 博客分类 | 教程(7篇)、心理学(24篇)、ACG(5篇)、公告(9篇)、生活(3篇)、科技(1篇)、闲聊(1篇) |
| 博客总文章数 | 49篇 |
| 建站时间 | 约2025年底 |
| 语言 | 简体中文 (zh-CN) |
| 部署平台 | GitHub Pages (Cloudflare Workers 路由) |
| Google Analytics | 已接入 (G-TR4FT7JPDZ) |
| Bing 站长验证 | 已提交 (BingSiteAuth.xml) |

---

## 🔴 紧急问题（Critical — 立即修复）

### 1. Canonical URL 指向旧域名 — SEO 致命错误

**影响范围**：约 24 篇博客文章的 `<link rel="canonical">` 仍然指向 `https://91vip.xn--32v.ink/`（旧域名），而非新域名。

**为什么致命**：Google 会认为这些页面的权威版本在旧域名上，导致：
- 新域名的文章页面不被索引或索引权重极低
- 旧域名已失效（或不属于你），链接权益全部丢失
- 所有 SEO 努力付诸东流

**涉及的文件（需逐一修复）**：
```
blog/教程/1/index.html
blog/教程/2/index.html
blog/教程/3/index.html
blog/教程/16/index.html
blog/教程/19/index.html
blog/教程/20/index.html
blog/教程/21/index.html
blog/ACG/7/index.html
blog/ACG/13/index.html
blog/ACG/14/index.html
blog/ACG/15/index.html
blog/ACG/22/index.html
blog/闲聊/6/index.html
blog/科技/17/index.html
blog/生活/18/index.html
blog/公告/4/index.html
blog/公告/5/index.html
blog/公告/8/index.html
blog/公告/10/index.html
blog/公告/11/index.html
blog/公告/12/index.html
blog/muban/index.html
```

**正确格式示例**：
```html
<link rel="canonical" href="https://ciallo0721-cmd.top/blog/教程/1/">
```

### 2. 约 26 篇文章完全没有 Canonical URL

**影响范围**：心理学系列（23-46）和部分生活文章（47-49），共约 26 篇文章。

**问题**：这些页面没有任何 canonical 声明，可能导致 Google 将带参数 URL（如 `?from=cn`）或不同路径视为独立页面，造成 duplicate content 问题。

**需补充**：每一篇都添加 `<link rel="canonical" href="https://ciallo0721-cmd.top/blog/分类/ID/">`

### 3. 心理学/生活文章缺失 OG/Twitter/Schema 结构化数据

这些高质量长文（每篇3000-6800字）完全没有：
- **Open Graph 标签**（社交分享时无标题/描述/图片）
- **Twitter Card 标签**
- **Schema.org Article 结构化数据**（无法获得富媒体搜索结果）
- **关键词标签**（部分有，部分无）

---

## 🟡 高优先级问题（High Priority）

### 4. Sitemap 不完整

当前 sitemap.xml 列出了 49 篇文章 + 约 10 个顶级页面，但缺失：
- `/app/` 目录下的子页面
- `/tools/` 目录下的工具页
- `/wiki/` 的子页面（如有深层页面）
- `/baicai/`, `/taffy/` 等子站点的页面
- `/page/` 目录内容
- `10.html` 等单独的 HTML 页面

**建议**：生成完整 sitemap，包含所有可索引页面。

### 5. 301 重定向未配置

从旧域名 `91vip.xn--32v.ink` 迁移到新域名后，没有配置 301 重定向。如果旧域名仍然可访问，应该将所有旧 URL 301 永久重定向到新域名对应 URL。

### 6. 部分页面缺少 Meta Description

- `adss.html` — 无 meta description
- `help.html` — 无 meta description
- `status.html` — 无 meta description

### 7. Google Search Console 未验证

当前只看到 Bing 站长验证（BingSiteAuth.xml），未发现 Google Search Console 验证文件或 meta tag。

---

## 🟢 中等优先级优化（Medium Priority）

### 8. 标题标签优化

| 当前问题 | 建议 |
|----------|------|
| 首页 title 仅为 "ciallo0721-cmd's blog" | 改为 "ciallo0721-cmd | Ren'Py视觉小说开发·心理学·二次元创作博客" |
| blog/index.html title 仅为 "文章站 - ciallo0721-cmd 的博客" | 改为 "全部文章 | ciallo0721-cmd 的博客 — Ren'Py教程·心理学·ACG" |
| 部分文章标题缺少品牌后缀 | 统一风格：`文章标题 | ciallo0721-cmd` |

### 9. 内部链接结构弱

- 文章页之间缺乏 Breadcrumb（面包屑导航）
- 首页到博客文章的链接深度为 2-3 次点击（首页 → blog/ → 分类/ → 文章）
- 没有明确的"主题集群"架构
- 缺少"上一篇/下一篇"导航（当前仅 articles-data.js 中有，但部分文章页面未实现）

### 10. 图片 Alt 文本缺失

大量文章中的图片缺少 alt 属性，不利于图片搜索和可访问性。

### 11. 移动端性能担忧

- 使用了自定义字体（MaokenAssortedSans.ttf ~5MB+），导致 LCP 可能超标
- 大量内联 CSS 和 JS，页面体积大
- 心理学文章单页可达 2000+ 行 HTML

### 12. HTTPS 与安全头良好

_site 已有完善的 `_headers` 配置（CSP, X-Frame-Options, HSTS 等），此项无需改动。

---

## 📋 分阶段执行计划

### 第一阶段：紧急修复（本周内）

#### Task 1 — 修复所有 Canonical URL（最关键❗）

批量脚本思路（PowerShell）：

```powershell
# 修复旧域名 canonical → 新域名
$oldDomain = "https://91vip.xn--32v.ink"
$newDomain = "https://ciallo0721-cmd.top"

# 遍历所有包含旧域名的 HTML 文件并替换
Get-ChildItem -Path "G:\EmoScan Pro\ciallo0721-cmd.github.io" -Recurse -Filter "*.html" |
  Select-String -Pattern $oldDomain -SimpleMatch |
  ForEach-Object { $_.Path }
```

**但更可靠的方案是**：直接用 VS Code 或 sed 批量替换。注意部分文章 canonical 的路径格式还不一样（有些是 `/blog/1/`，实际应该对应 `/blog/教程/1/`）。

> ⚠️ **重要**：部分老文章的 canonical 路径格式是 `/blog/1/` 而非 `/blog/教程/1/`。需要逐个确认实际部署路径后修正。建议先检查实际部署 URL 再修复。

#### Task 2 — 为心理学/生活文章补充 canonical、OG、Twitter、Schema

为文章 23-49 添加完整的 `<head>` 标签模板：

```html
<!-- Canonical -->
<link rel="canonical" href="https://ciallo0721-cmd.top/blog/心理学/23/">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://ciallo0721-cmd.top/blog/心理学/23/">
<meta property="og:title" content="占卜的原理：心理学拆解"为什么总觉得很准" | ciallo0721-cmd">
<meta property="og:description" content="超6800字深度心理学长文...">
<meta property="og:image" content="https://ciallo0721-cmd.top/fanv.ico">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="占卜的原理：心理学拆解"为什么总觉得很准" | ciallo0721-cmd">
<meta name="twitter:description" content="超6800字深度心理学长文...">

<!-- Schema.org Article -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "占卜的原理：心理学拆解"为什么总觉得很准"",
  "description": "超6800字心理学长文...",
  "author": {
    "@type": "Person",
    "name": "ciallo0721-cmd",
    "url": "https://ciallo0721-cmd.top/aboutme.html"
  },
  "datePublished": "2026-06-09",
  "dateModified": "2026-06-21",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://ciallo0721-cmd.top/blog/心理学/23/"
  }
}
</script>
```

### 第二阶段：技术基础建设（1-2周）

#### Task 3 — 配置 Google Search Console

1. 访问 https://search.google.com/search-console
2. 添加域名 `ciallo0721-cmd.top`
3. 选择 DNS 验证方式（通过 Cloudflare DNS 添加 TXT 记录）
4. 验证后提交 sitemap.xml
5. 手动请求索引首页和部分核心文章

#### Task 4 — 生成完整的 XML Sitemap

建议使用脚本自动生成 sitemap，包含：
- 所有顶级页面（index, aboutme, blog/, wz/, wiki/, status, etc.）
- 所有博文章（49篇 + 未来新文章）
- 其他重要子页面

**脚本思路**：
```javascript
// 可借助 articles-data.js 和 fs 遍历生成完整 sitemap
// 自动包含所有文章URL，按分类组织
```

#### Task 5 — 配置旧域名 301 重定向

如果还持有旧域名的控制权，在 Cloudflare Workers 或服务器端配置：
```
https://91vip.xn--32v.ink/blog/1/ → 301 → https://ciallo0721-cmd.top/blog/教程/1/
https://91vip.xn--32v.ink/*       → 301 → https://ciallo0721-cmd.top/*
```

### 第三阶段：内容优化（2-4周）

#### Task 6 — 建立"主题集群"架构

你的内容天然适合以下主题集群：

| 主题集群 | Pillar 页面 | 已有文章数 | 潜力 |
|----------|-------------|-----------|------|
| 🧠 **心理学效应大全** | 新建 pillar 页 | 24篇 | ⭐⭐⭐⭐⭐ |
| 🎮 **Ren'Py 视觉小说开发教程** | 新建 pillar 页 | 4篇 | ⭐⭐⭐⭐ |
| 🐍 **Python 编程与工具** | 已有散篇 | 2篇 | ⭐⭐⭐ |
| 🎨 **ACG & VTuber 文化** | 新建 pillar 页 | 5篇 | ⭐⭐⭐ |
| 🍳 **家常菜谱系列** | 已有散篇 | 3篇 | ⭐⭐ |

**重点推荐**：心理学系列是你最强的 SEO 资产。24 篇高质量长文覆盖了从占卜揭秘、认知偏误到人格障碍的广泛主题，内容质量足以竞争百度/Google的前排排名。

建议创建 **"心理学效应百科"** 类型的 Pillar 页面：
- 标题："心理学效应大全：100+经典心理学现象深度解析"
- 内部链接所有 24 篇心理学文章
- 按类别分组（认知偏误、人格障碍、社会心理、情绪管理）

#### Task 7 — 为文章添加面包屑导航

在所有文章页面顶部添加：

```html
<nav aria-label="Breadcrumb" class="breadcrumb">
  <a href="/">首页</a> ›
  <a href="/blog/">文章</a> ›
  <a href="/blog/心理学/">心理学</a> ›
  <span>占卜的原理</span>
</nav>
```

搭配 BreadcrumbList Schema：

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "首页", "item": "https://ciallo0721-cmd.top/" },
    { "@type": "ListItem", "position": 2, "name": "文章", "item": "https://ciallo0721-cmd.top/blog/" },
    { "@type": "ListItem", "position": 3, "name": "心理学", "item": "https://ciallo0721-cmd.top/blog/心理学/" },
    { "@type": "ListItem", "position": 4, "name": "占卜的原理" }
  ]
}
```

#### Task 8 — 优化高潜力文章

根据搜索量潜力和内容质量，优先优化以下文章：

| 文章 | 目标关键词 | 优化动作 |
|------|-----------|----------|
| 占卜的原理 | "占卜为什么准" "巴纳姆效应" | 补充 FAQ Schema，增加外部引用 |
| 达克效应 | "达克效应" "邓宁-克鲁格效应" | 增加图表 alt 文本，补充数据来源引用 |
| 恐怖谷效应 | "恐怖谷效应" "uncanny valley" | 增加图片/视频，补充参考文献 |
| PTSD | "PTSD症状" "创伤后应激障碍" | 增加 FAQ Schema，补充专业术语解释 |
| Ren'Py立绘教程 | "Ren'Py换立绘" "视觉小说开发" | 补充代码高亮，增加步骤截图 |
| 雌小鬼 | "雌小鬼" "メスガキ" "萌属性" | 扩充角色列表，补充图片，增加外部链接 |

### 第四阶段：外部建设（持续）

#### Task 9 — 外链建设策略

**自然获取方式**：
1. 在知乎/B站发布"心理学效应系列"内容，文中引用你的博客文章
2. 在 Ren'Py 中文社区、独立游戏开发论坛分享教程链接
3. GitHub 项目 README 中链接博客教程
4. 在学术/科普类网站（如果壳、知乎专栏）投稿被收录

**高质量外链来源建议**：
- GitHub：你的项目 README 中链接博客
- 知乎专栏：同步发表精选文章
- V2EX / 独立开发者社区：分享开发经验
- 博客互链：与其他个人博客交换友链

### 第五阶段：监控与迭代（持续）

#### Task 10 — 建立 SEO 监控体系

**Google Search Console 监控项**：
- 索引覆盖率（目标：所有文章被索引）
- 搜索展示量（按查询分类）
- 平均点击率（CTR）
- Core Web Vitals 报告

**排名跟踪**：
- 手动跟踪 10-20 个核心关键词的百度/Google 排名
- 每月记录一次，关注趋势而非每日波动

**内容更新节奏**：
- 每周至少 1 篇新文章（保持活跃信号）
- 每月对 2-3 篇旧文章做内容刷新

---

## 📈 预期效果时间线

| 时间 | 可预期效果 |
|------|-----------|
| 1-2 周 | canonical 修复后，Search Console 索引数开始回升 |
| 1 个月 | 结构化数据生效，部分文章获得富媒体摘要展示 |
| 2-3 个月 | 新域名开始积累搜索权重，心理学文章开始获得搜索曝光 |
| 3-6 个月 | 核心关键词进入前 20 名，有机搜索流量开始增长 |
| 6-12 个月 | 部分长尾关键词进入前 10，站点整体 DA/DR 提升 |

---

## 🎯 最优先的 3 件事（今天就做）

1. **修复所有 canonical URL** — 这是所有 SEO 工作的基石，不做等于零
2. **提交到 Google Search Console** — 让 Google 知道你换了域名
3. **为心理学系列补充 OG/Schema** — 这些高质量内容值得被搜索引擎优先展示

---

## 📁 相关文件索引

| 文件 | 用途 |
|------|------|
| `robots.txt` | ✅ 已配置，允许主流爬虫，屏蔽 admin/functions |
| `sitemap.xml` | ⚠️ 需补充更多页面，并确保 URL 使用新域名 |
| `_headers` | ✅ 完善的安全头配置 |
| `_config.yml` | Jekyll 配置（当前未启用，实际为纯静态站点） |
| `BingSiteAuth.xml` | ✅ Bing 站长验证 |
| `_subdomain-router.js` | 子域名路由脚本 |
| `articles-data.js` | 文章数据源（SEO 元数据在此定义） |
