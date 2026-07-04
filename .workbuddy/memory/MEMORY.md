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
