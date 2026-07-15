# MEMORY.md — 项目长期记忆

## 项目信息
- **项目**：ciallo0721-cmd.github.io 个人网站（纯静态站，GitHub Pages）
- **域名**：https://ciallo0721-cmd.top（2026-06-19 更换，原 91vip.xn--32v.ink）
- **子域名**：status.wiki.baicai.taffy.ciallo0721-cmd.top（客户端路由方案，tname 配 CNAME）
- **技术栈**：原生 HTML/CSS/JS，Ren'Py 导出游戏
- **SEO**：geo-check.js 已中性化（no-op），ZERO 地理限制。robots.txt + sitemap.xml 已配置

## 关键文件
- `index.html`：主页，引用 `css/css/index.css` 和 `js/js/index.js`，含文章列表、工具导航、社交媒体链接、域名推广、评论区（Giscus）
- `wz.html`：文章列表页，引用 `js/js/wz.js`
- `articles-data.js` / `timeline.js` / `dynamic-data.js` 等：JS 格式数据源，全部在 `js/js/` 目录
- `admin/index.html` + `admin.py`：后台管理 v2.0（本地 Python 后端，端口5555）
- `blog/`：文章目录，每篇为独立 HTML 文件
- `wiki/`：百科系统，`js/js/wiki-data.js` 数据源 + 每词条独立文件夹
- `.github/workflows/`：dynamic-update.yml + scheduled-publish.yml + status-update.yml

## 子项目
- **baicai 纪念站**：真白花音（2019-2026），含事业时间线、轶事、资料卡片
- **ARG「镜中人」**：`arg/index.html`（Win98 复古美学），5角色4结局
- **work/**：保留的工作游戏项目
- **PHP 版**：`G:/2026年5月6日网站`（甲骨文服务器，PHP 8.2 + MySQL）

## 用户偏好
- 初中生开发者，Ren'Py 爱好者
- 网站风格：蓝色渐变、二次元文案
- **每次修改网站后，在 `timeline.js` 新增记录**
- **文章作者统一写 `ciallo0721-cmd`**
- **可视化所有文字用中文**
- 心理学/医学文章必须加医疗免责声明，使用「可能」「部分研究表明」等限定词
- **游戏生存周期**：网站发布的游戏存活不超过 2 个月，除非特别火爆或有人持续玩（2026-07-13 起执行）
- **404.html** 已加 `<meta name="robots" content="noindex, nofollow">` 防搜索引擎索引
- **游戏目录**：仅剩 `arg/`（镜中人 ARG）和 `work/`（保留的工作游戏项目）。91、LAIDB、bjqy、fors、zmdspp 等目录已于 2026-07-13 删除
- **隐藏文章机制**：通过前端密码门禁实现，`#pwGate`（显示遮罩+密码输入）和 `#pwContent`（隐藏正文）通过 JS 切换。文章 58（夹不动了）和文章 51（龙心事件）已启用此机制

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

## 动态广告系统（2026-07-14 v1.1 数据与逻辑分离）
- **数据文件**：`js/js/ad-data.js`（格式 `[类型, 图片链接, 跳转链接]`，15 条）
- **核心引擎**：`js/js/ad-system.js` v1.1（从 ad-data.js 读取，内置 STYLE_MAP）
- **SVG 广告图**：`css/ads/ad-*.svg`（15 个，无「广告位招租」文字）
- **测试面板**：`tests/ad-system-test.html`（查看权重/历史/模拟测试/重置）
- **覆盖范围**：全站 71 个 HTML 页面，每页顶部+底部各 1 个广告位
- **首页**：保留原有 4 个广告位不变
- **部署脚本**：`foragent/add_ads_to_all.py` + `foragent/add_ad_data_ref.py`
- **偏好算法**：加权随机选择，点击进入+10 权重，不感兴趣-20+屏蔽，localStorage 持久化
- **标签体系**（15种）：游戏/工具/教育/设计/音乐/编程/AI/应用/影视/阅读/购物/健康/效率/社交/娱乐
- **15种颜色**：#FF4757(红)/#FF6B35(橙)/#FFD93D(黄)/#2ED573(绿)/#1E90FF(蓝)/#3366FF(深蓝)/#7C3AED(紫)/#E040FB(粉紫)/#FF4081(粉)/#8D6E63(棕)/#FF6D00(琥珀)/#76FF03(青柠)/#00BCD4(青)/#FF6E6E(珊瑚)/#FF408C(品红)

## 资产结构（2026-07-13 重构）
- **CSS 统一目录**：`css/css/`（65 个文件，含 6 个独立 CSS + 59 个从 HTML 提取的页面级 CSS）
- **JS 统一目录**：`js/js/`（75 个文件，含 17 个独立 JS + 59 个从 HTML 提取的页面级 JS）
- **提取工具**：`foragent/extract_assets.py`（可复用脚本）
- **路径规则**：所有非 blog HTML 文件的内联 `<style>` 和 `<script>` 已被提取为独立文件，HTML 中用 `<link>` 和 `<script src>` 引用，相对路径按文件深度自动计算

## 鼠标特效引擎（优化版）
- **核心文件**：`css/css/effects.css` + `js/js/index.js`（initEffects 函数）
- **FPS 自动降级**：每2秒检测 FPS，<40→中画质，<24→低画质
- **GPU 加速**：will-change、translateZ(0)
- **低内存检测**：navigator.deviceMemory < 4GB 自动跳过
- **手动切换**：控制台 `toggleLowPowerEffects(true/false)`，偏好存 localStorage('efx_lowpower')
