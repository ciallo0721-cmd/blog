# 自动更新网站地图 - 执行记录

## 2026-05-19 19:58

**执行结果：成功，有变化，已提交推送**

**扫描结果摘要：**
- 博客文章：1~18 共18篇 + grayscale-test，路径格式 `blog/N.html@_blog-id=N/`
- 静态页面：index.html(1.0), wz.html(0.9), aboutme.html(0.7), adss.html(0.5), privacy.html(0.5), privacy-policy.html(0.5), user-agreement.html(0.5), help.html(0.5), status.html(0.5)
- 游戏页面：bjqy, fors, LAIDB, 91, dkdfj（均有 index.html）；zmdspp 无 index.html，使用 indexzm.html
- 新增页面：privacy-policy.html, user-agreement.html（之前 sitemap 缺失）

**主要变更：**
- 所有 lastmod 从 2026-05-19（假日期）修正为实际文件修改时间
- 新增 privacy-policy.html 和 user-agreement.html
- adss.html priority 从 0.6 调整为 0.5
- status.html priority 从 0.6 调整为 0.5
- 博客文章按数字顺序排列（1-18）

**commit：** b9c7fe9，已推送到 main

## 2026-05-20 18:48

**执行结果：成功，无变化，跳过 git 提交**

**扫描结果：**
- 博客文章：1~18 共18篇 + grayscale-test（共19条），所有 lastmod 与 sitemap 一致
- 静态页面：9个（index/wz/aboutme/adss/privacy/privacy-policy/user-agreement/help/status），均与 sitemap 一致
- 游戏页面：6个（bjqy/fors/LAIDB/zmdspp/91/dkdfj），均与 sitemap 一致

**结论：** sitemap.xml 已是最新，无需更新或提交

## 2026-05-23 12:19

**执行结果：成功，有变化，已提交推送**

**扫描结果：**
- 博客文章：1~18 + 20~22（共21篇，跳过19无index.html，grayscale-test无index.html已移除）
- 静态页面：10个（新增 friends.html），所有 lastmod 已修正为实际文件修改时间
- 游戏页面：6个，URL 格式统一为 `/dir/`（之前误用 `/dir/index.html`）

**主要变更：**
- 新增 friends.html（priority 0.7）
- 所有 lastmod 从假日期 2026-05-22 修正为实际文件修改时间
- 游戏页面 URL 规范化：`/bjqy/index.html` → `/bjqy/`
- 游戏页面 changefreq 从 monthly 修正为 yearly
- 静态页面 changefreq 统一为 weekly（之前部分误用 yearly）
- 移除 grayscale-test（无 index.html）

**commit：** bb5a13f，已推送到 main

## 2026-05-24 12:00

**执行结果：成功，有变化，已提交推送**

**扫描结果：**
- 博客文章：1~21 共21篇 + grayscale-test（共22条），均有 index.html
- 静态页面：10个（index/wz/aboutme/adss/privacy/privacy-policy/user-agreement/help/status/friends）
- 游戏页面：6个（bjqy/fors/LAIDB/zmdspp/91/dkdfj）

**主要变更：**
- 新增 3 个静态页面：privacy-policy.html（0.5）、user-agreement.html（0.5）、friends.html（0.7）
- 游戏页面 lastmod 修正：fors/LAIDB/zmdspp/91/dkdfj 从 2026-05-23 → 2026-05-06（实际文件修改时间）
- 游戏页面 URL 规范化：`/dir/index.html` → `/dir/`（zmdspp 保留 indexzm.html）
- 游戏页面 changefreq：monthly → yearly
- adss.html priority：0.6 → 0.5
- 博客文章按数字顺序排列

**commit：** a1e9d15，已推送到 main
