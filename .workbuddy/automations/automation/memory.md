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
