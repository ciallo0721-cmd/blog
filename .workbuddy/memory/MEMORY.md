# MEMORY.md — 项目长期记忆

## 项目信息
- **项目名称**：ciallo0721-cmd.github.io 个人网站
- **域名**：https://ciallo0721-cmd.top（原 91vip.xn--32v.ink，2026-06-19 更换）
- **子域名**：status.wiki.baicai.taffy.ciallo0721-cmd.top（客户端路由方案，tname 配 CNAME）
- **baicai 纪念站**：真白花音（Mashiro Kanon），2019-05-07 出道→2019-10-31 隐退→2020-12-01 复活→2026-05-01 毕业。白发红瞳，144cm，5/29 生日，P家/Chucolala，粉丝名帕清姬。页面含完整事业时间线、轶事、资料卡片
- **类型**：纯静态站（GitHub Pages），无服务端
- **技术栈**：原生 HTML/CSS/JS，CodeMirror 5.65.2，Cloudflare Turnstile，Ren'Py 导出游戏
- **部署平台**：GitHub Pages

## 关键文件说明
- `index.html`：主页，内联所有 JS/CSS，含验证、在线 Python 编辑器、文章列表（从 articles-data.js 加载）
- `wz.html`：文章列表页，从 `articles-data.js` 加载文章数据
- `articles-data.js`：文章数据源（JS格式），包含标题、摘要、日期、标签、文件路径等字段
- `timeline.js`：时间线数据源（JS格式），由手动的更新记录数组 + renderTimeline() 函数组成
- `dynamic-data.js`：伪动态数据（由 GitHub Actions 每6小时自动生成），含站点运行天数、文章数等
- `admin/index.html`：全新管理后台前端 v2.0（与 admin.py 后端配合）
- `admin.py`：Python 后端 API，本地运行，操作仓库文件（文章/时间线/Git/定时发布）
- `blog/`：文章目录，每篇文章在 `blog/{id}/index.html`（1~13，已删除的为手动清理）
- `.github/workflows/dynamic-update.yml`：伪动态数据自动更新工作流（每6小时）
- `.github/workflows/scheduled-publish.yml`：定时发布文章工作流（每30分钟检查）
- `.github/scheduled-articles.json`：定时发布队列
- `css/indexjs.js`：文章渲染、Python 编辑器逻辑（与 index.html 内联版同步）
- `_headers`：安全响应头配置
- `help.html`：Cloudflare 错误码帮助中心（原自定义错误码已移除，2026-04-29）

## 安全加固历史（2026-03-29）
已修复：XSS、Python 编辑器沙箱逃逸、console.log 信息泄露、SRI 缺失、安全头缺失
详见 artifact `security-audit-report.md`

## SEO 修复：移除地理限制（2026-06-20）
- **geo-check.js** 已中性化为空操作（no-op stub），不再执行任何 IP 地理检测或重定向
- 所有引用 geo-check.js 的页面均改为加载无操作存根
- 根 `index.html` 和 `linjiayi/index.html` 已移除 geo-check.js script 标签
- `access-denied.html` 和 `pages/access-denied.html` 添加 noindex + 自动跳转首页
- 原因：Googlebot/Bingbot 从美国 IP 爬取，地理拦截导致搜索引擎无法索引公开路由
- 本站现为 ZERO 地理限制的公开项目站点

## 用户偏好
- 用户是初中生开发者，Ren'Py 视觉小说爱好者
- 网站风格：蓝色渐变（原紫色已全部替换）、二次元风格文案（"喵～"、"的说～"）
- 对安全感兴趣，已有 Cloudflare Turnstile 防护意识
- **每次修改网站后，需同时在 `timeline.js` 中新增一条更新记录**
- **文章作者名统一写 `ciallo0721-cmd`，不要写「管哥」或其他名字**

## BlockScript 博客架构（2026-06-15）
- **解码器**：`blog/_decoder/index.html`（通用，所有文章共用，复制到每篇文章目录）
- **文章文件**：`blog/{id}/{id}.blog`（BlockScript 格式，纯文本）
- **语法**：`[Title]` `[Date]` `[Author]` `[Tag]` 头部 + `[H1]` `[H2]` `[Code]` `[Alert]` 等区块标签
- **颜色**：与现有文章（blog/1/22）一致，亮色系 `--bili-pink: #FB7299` `--bili-blue: #00A1D6`
- **参考文件**：`BLOGSYNTAX.txt`（语法速查）、`HOW_TO_WRITE_BLOG.txt`（写文章指南）
- **新建文章步骤**：① `blog/{id}/` 新建文件夹 → ② 复制 `blog/_decoder/index.html` 为 `index.html` → ③ 写 `{id}.blog` 文件

## SEO 优化历史

### 2026-03-29 初次优化
- 创建 robots.txt：允许所有主流搜索引擎爬虫
- 创建 sitemap.xml：包含所有页面的站点地图
- 修复 Turnstile 验证阻止爬虫问题：添加搜索引擎爬虫自动识别放行
- 优化 index.html：添加 Meta Description、Keywords、Open Graph、Twitter Card、Schema.org (Person + Website)
- 优化图片 alt 属性：添加描述性 alt 文本
- 优化文章页面：wz.html、1.html、2.html、10.html 添加 meta description 和 canonical 标签
- 搜索关键词目标："管哥"、"傻福大运"、"ciallo0721-cmd"

### 2026-04-12 全面SEO优化
- **robots.txt重新优化**：修复了之前阻止所有爬虫的问题，现在正确允许主流搜索引擎
- **sitemap.xml更新**：包含所有28个HTML页面，设置合理优先级和更新频率
- **验证流程爬虫自动放行系统**：实现3种检测方式（Cookie、Meta标签、User-Agent），支持所有主流搜索引擎爬虫
- **首页SEO深度优化**：完善标题、描述、关键词、结构化数据（Website、BreadcrumbList、SearchAction）
- **Google Search Console配置指南**：创建详细设置步骤和监控建议文档
- **内容关键词策略**：制定4层关键词体系（品牌、核心主题、长尾、语义相关），包含执行时间表
- **流量分析**：基于GA4数据（20活跃用户，100%直接访问，0自然搜索流量）制定针对性策略
- **预期效果**：3个月内自然搜索流量增长200-300%，6个月内月有机流量达到100+

## PHP 动态网站（甲骨文服务器版，2026-05-06）
- **位置**：`G:/2026年5月6日网站`（从 GitHub Pages 项目复制，排除 .git）
- **技术栈**：PHP 8.2 + MySQL + Apache（甲骨文免费服务器）
- **路由参数**：所有页面 URL 带 `?_ip:{访客IP}_id{文章ID}`，自动记录访问日志
- **数据库**：`init_db.sql` 初始化（6张表），config.php 配置连接
- **后台**：`/admin/`（账号admin/密码guangeadmin123，需立即修改），含仪表盘/文章/评论/时间线/访客统计/设置6大模块
- **部署说明**：见 `G:/2026年5月6日网站/DEPLOY.md`
- **文章路由**：`generate_article_routes.php` 批量生成各文章 index.php

## 后台管理系统 v2.0（2026-04-30）
- **删除旧后台** `adm1n.html`，新建 `admin/index.html`（全新前端）+ `admin.py`（后端 API）
- **admin.py**：Python 后端，本地运行（默认 127.0.0.1:5555）
  - 文章 CRUD（增删改查）、文章 HTML 自动生成
  - 时间线管理（增删）
  - 定时发布队列（检查并自动发布到期文章）
  - Git 操作（status/commit/push）
  - GitHub Actions 触发
  - 站点统计
  - 启动方式：`python admin.py`，支持 `--port` `--host` `--check-schedule` 参数
- **admin/index.html**：全新前端后台 UI
  - 仪表盘（文章数、定时队列、Git 状态、动态数据）
  - 文章管理（列表、查看、删除）
  - 新增文章（标题/日期/标签/HTML内容编辑器，支持预览和定时发布）
  - 时间线管理（查看、添加、删除）
  - 定时发布队列（查看、移除）
  - Git 管理（状态查看、手动 commit & push）
  - GitHub Actions 触发（动态数据更新、定时发布检查）
  - API 状态检测
  - 密码不变：`guangeadmin123`
- **定时发布系统**：
  - `.github/scheduled-articles.json`：定时发布队列文件
  - `.github/workflows/scheduled-publish.yml`：每30分钟检查一次
  - 已配置定时文章：#14「再见，白菜」— 2026/5/1 00:00 GMT+8 自动发布

## Bug 修复（2026-03-31）
- 所有 HTML 文件（index/1-9/wz/muban/ai）添加 `<link rel="icon" href="./fanv.ico">`
- 修复 1.html、2.html canonical URL 从旧域名改为 91vip.xn--32v.ink
- 修复 ai.html 缺少 DOCTYPE/head/body 结构问题（补全完整 HTML）
- 修复 admin.html 安全检查函数中模板字符串嵌套 bug（c.hint 变量不渲染）

## 验证流程更新（2026-03-29）
- 新增6步人类验证流程（完全替换原有的Cloudflare验证）：
  1. Cloudflare 等待验证界面（模拟等待响应）
  2. IP与地理位置识别（外国IP拒绝进入）
  3. 请求头检测（User-Agent、语言、时区）
  4. 安全检查界面
  5. 最终测试：你是人吗（14种身份选择：男/女/棍母/男拉拉/女给给/永雏塔菲/沃尔玛塑料袋/我是植物/我是僵尸/我不是人/我是管哥/我是9年1班7组8号/我是机器人/我已满18）
  6. 真最终测试（显示性别、IP、位置信息）
- 添加跳转验证：如果检测到没经过index验证就进入别的页面，跳转到index
- 域名替换：所有 ciallo0721-cmd.github.io 改为 91vip.xn--32v.ink

## 网站精简更新（2026-03-31）
1. **删除头像与收款码**：
   - 删除 `./images/avatar.png` 所有引用（包括 OG/Twitter 元数据）
   - 删除 avatar CSS 类和 mobile-avatar 样式
   - 删除首页头部头像显示和移动菜单头像
   - 删除完整的赞助/收款码部分（id="donation"）
   - 删除导航菜单中"赞助支持"链接

2. **统一网站图标**：
   - 所有HTML文件图标改为 `./fanv.ico`
   - 修改文件：404.html、403.html、yzcw.html、index.html

3. **admin.html 模拟逻辑清理**：
   - 删除 `fakeVisitor()` 函数（模拟中国/外国用户）
   - 删除验证控制页面的"模拟中国用户"和"模拟外国用户"按钮
   - 删除 `checkAllLinks()` 中的启发式判断逻辑（"已知"/"未验证"标签）
   - 删除 `runSecurityCheck()` 中的假设后端项目（X-Frame-Options、混合内容）
   - 删除 `initDashboard()` 中的网络Connection API 模拟显示
   - 删除 `refreshPerf()` 中的 getEntriesByType() 假设逻辑和资源加载表
   - 删除 `setTheme()` 中关于"刷新index.html生效"的假设提示

## 网站状态页面（2026-04-05）
- 新建 `status.html`：全局状态框 + 历史回放时间线（从 status-data.js 加载），支持四色状态（绿/黄/红/灰）
- `status-data.js`：状态历史数据源，包含 date/status/title/desc，status 支持 green/yellow/red/gray
- 包含主页面、文章（1-10）、游戏（bjqy/fors/LAIDB/melon/zmdspp）、错误页四个分区
- `index.html` footer 添加「查看网站状态」链接（绿色脉冲圆点图标）
- **工作流**：`.github/workflows/status-update.yml` 在每次 push main 时自动追加 green 状态记录；手动触发可指定 yellow/red 状态

## Google数据收集同意提示（2026-04-08）
- 在验证流程前新增步骤0：Google数据收集同意提示窗口
- 提示用户网站可能会与Google收集一些信息用于分析
- 用户点击"同意并继续"进入正常验证流程
- 用户点击"不同意"则重定向到百度（代表退出）
- 同意状态保存到sessionStorage的`google_consent`键


## 文章系统数据格式（2026-05-10 已从 xlsx 迁回 JS）
### 当前方案：JS 格式
- 数据源：`timeline.js`（时间线）和 `articles-data.js`（文章列表）
- 格式：JS 数组 + renderTimeline() / renderArticles() 函数
- index.html 和 wz.html 均从 JS 文件加载数据

### xlsx 方案（已废弃，2026-04-12 曾迁移，2026-05-10 迁回）
- 曾用 `articles.xlsx` 和 `timeline.xlsx` 作为数据源
- 使用 SheetJS (xlsx.js) 库在浏览器端解析
- 已放弃，改回原生 JS 格式

## Wiki 系统改造（2026-06-13）
- **新架构**：每个词条一个独立文件夹 `wiki/{term-id}/index.html`（类似 blog 系统）
- **页面生成**：用 Node.js 脚本从 `wiki-data.js` 自动生成，已清理生成脚本
- **词条数**：13 个词条 + 2 个角色，共 15 个独立页面
- **新增词条**：dashichang（大市唱）、vtuber（VTuber）、tongshiting（同视听收录）、zhihurili（2026直播日历）、taffywiki（永雏塔菲百科）
- **Wiki 首页**：MediaWiki 风格界面 + Citizen 皮肤 CSS，支持分类筛选/搜索/词条-角色切换
- **引用页面**：来源于 acetaffy.org 的三篇 MediaWiki 页面已添加为词条内容参考
- **核心文件**：
  - `wiki-data.js`：百科词条数据源，含 16 个初始词条（技术/文化/人物/工具/概念/作品/作品分类）
  - `css/wiki-linker.js`：文章自动链接脚本，扫描 .article-content 自动将匹配词条包装为 📖 下划线链接
  - `wiki/index.html`：百科首页页面，支持 hash 路由（#/termId）、搜索、分类筛选、相关词条
  - `wiki-audit-tool.py`：词条审核工具，运行 `python wiki-audit-tool.py` 生成审核报告
  - `wiki-audit-report.md`：初次审核报告（2026-06-10）
- **文章注入**：所有 25 篇 blog 文章已自动注入 wiki-data.js + wiki-linker.js
- **管理后台**：admin/index.html 新增「百科管理」页面，可查看词条列表和统计
- **首页**：新增「百科知识库」导航按钮
- **sitemap.xml**：已添加 `/wiki/` URL
- **多人协作**：
  - 内容审核组 → 运行 wiki-audit-tool.py 扫描文章，输出报告
  - 百科编写组 → 编辑 wiki-data.js 新增/修改词条
  - 测试修复组 → 验证链接跳转、渲染效果
