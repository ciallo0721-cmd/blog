# MEMORY.md — 项目长期记忆

## 项目信息
- **项目**：ciallo0721-cmd.github.io 个人网站（纯静态站，GitHub Pages）
- **域名**：https://ciallo0721-cmd.top（2026-06-19 更换，原 91vip.xn--32v.ink）
- **子域名**：status.wiki.baicai.taffy.ciallo0721-cmd.top（客户端路由方案，tname 配 CNAME）
- **技术栈**：原生 HTML/CSS/JS，CodeMirror 5.65.2，Ren'Py 导出游戏
- **SEO**：geo-check.js 已中性化（no-op），ZERO 地理限制。robots.txt + sitemap.xml 已配置。验证流程对爬虫自动放行。

## 关键文件
- `index.html`：主页，内联 JS/CSS，含验证、Python 编辑器、文章列表（articles-data.js）
- `wz.html`：文章列表页，加载 articles-data.js
- `articles-data.js` / `timeline.js`：JS 格式数据源
- `dynamic-data.js`：GitHub Actions 每6h自动生成的伪动态数据
- `admin/index.html` + `admin.py`：后台管理 v2.0（本地 Python 后端，端口5555）
- `blog/`：文章目录（1~16+），BlockScript 格式。解码器 `blog/_decoder/index.html`
- `wiki/`：百科系统，wiki-data.js 数据源 + 每词条独立文件夹
- `.github/workflows/`：dynamic-update.yml + scheduled-publish.yml + status-update.yml

## 子项目
- **baicai 纪念站**：真白花音（2019-2026），含事业时间线、轶事、资料卡片
- **ARG「镜中人」**：`arg/index.html`（Win98 复古美学），5角色4结局
- **PHP 版**：`G:/2026年5月6日网站`（甲骨文服务器，PHP 8.2 + MySQL）

## 用户偏好
- 初中生开发者，Ren'Py 爱好者
- 网站风格：蓝色渐变、二次元文案
- **每次修改网站后，在 `timeline.js` 新增记录**
- **文章作者统一写 `ciallo0721-cmd`**
- **可视化所有文字用中文**
- 文章格式：BlockScript（`[Title]` `[Date]` `[Author]` `[Tag]` 头部 + `[H1]` `[H2]` `[Code]` `[Alert]` 等区块标签）
- 心理学/医学文章必须加医疗免责声明，使用「可能」「部分研究表明」等限定词

## 测试基础设施
- 2026-07-07: 端测测 创建完整测试框架 v2.0，含 4 个独立测试模块：
  - `tests/analysis/static-analysis.js` — 静态分析（HTML/CSS/JS/A11y/安全），62个HTML文件
  - `tests/analysis/link-checker.js` — 链接健康检测（555个链接）
  - `tests/performance/perf-check.js` — 基础性能检测（TTFB/大小/大文件扫描）
  - `tests/run-all.js` — 测试编排器，自动启动服务器→运行所有模块→生成HTML报告
  - `tests/e2e/key-pages.spec.ts` — Playwright E2E（需要C盘空间）
  - `playwright.config.ts` — 已配置使用系统 Chrome（channel: 'chrome'）
- npm scripts: `npm run test` / `test:static` / `test:links` / `test:perf` / `test:e2e` / `serve`
- **C 盘空间不足 + 内存不足导致 Playwright 无法启动**，E2E 测试暂不可用。静态/性能/链接测试完全可用
- 最新综合评分（2026-07-07 修复后）：
  - 静态分析: 🟡 70/100（156 warn, 0 fail）
  - 链接健康: 🟡 64/100（已修复 pages/ 目录 ~30 处路径 + index.html 38 处 rel 属性，断裂从 35→12）
  - 性能检测: 🟢 94/100（TTFB 平均 6ms）

## 网站公告
- 公告文章路径：`blog/公告/web/index.html`（勿改此路径）
- 公告在 `index.html` 以横幅形式展示，简要说明更新内容，按钮指向公告文章
- 如需大幅修改公告内容，更新该博客文章即可，不用改 index.html 的横幅文字
