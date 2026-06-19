
        window.timelineData = [
            {
                date: "2026年6月19日",
                title: "首页 tools 区增加新番数据库 & 人脸识别",
                desc: "将 新番数据库 和 MoeFace 人脸识别 两张工具卡片加入首页 #tools 区，并移除了导航栏上重复的两个独立按钮，现在 tools 区共有 6 个工具的说喵～"
            },
            {
                date: "2026年6月19日",
                title: "更换域名：从 91vip.xn--32v.ink 到 ciallo0721-cmd.top",
                desc: "将网站全部域名的引用从 91vip.xn--32v.ink 更换为 ciallo0721-cmd.top，批量替换了 100+ 个文件中的所有旧域名引用的说喵～ (๑•̀ㅂ•́)و✧"
            },
            {
                date: "2026年6月18日",
                title: "修复文章24无法访问 + decoder.js 共享化",
                desc: "修复多个 bug：① decoder.js 未解析 URL 查询参数 ?blog_id=，导致嵌套路径下无法获取文章ID；② 文章 HTML 中 ../articles-data.js 在嵌套目录（如 blog/兴趣/另一个次元/24/）下解析不到根目录，window.articlesData 为 undefined；③ renderArticle 中 trimmedContent 变量名拼写不一致导致 JS 报错。将所有文章 HTML 的 decoder.js 引用统一为 /blog/_decoder/decoder.js 共享版本，articles-data.js/wiki-data.js/wiki-linker.js 全部改为绝对路径，decoder.js 新增 ?blog_id= 解析和 _pathMap 路径拼接逻辑的说喵～"
            },
            {
                date: "2026年6月18日",
                title: "新增番剧分享文章 (24)",
                desc: "创建番剧分享文章，提供Google网盘链接分享收藏的番剧资源，并说明国内访问可能存在的问题，还请见谅的说～"
            },
            {
                date: "2026年6月17日",
                title: "articles-data.js 重构：灵活路径映射系统 v2",
                desc: "将 blog 架构从平铺目录改为分类嵌套后，重写 articles-data.js：移除所有硬编码 fileName，引入 _pathMap 映射表集中管理路径，所有查询方法自动附加计算后的 fileName，新增 getPath()/getCategories() 外部接口，改架构只需改一行映射表的说喵～"
            },
            {
                date: "2026年6月13日",
                title: "新增节日公告自动更新系统",
                desc: "建立 GitHub Actions 工作流，每天北京时间 00:00 自动检测 21 个节日/纪念日/特别日期，自动替换站点公告为对应节日文案（含春节动态日期农历查表，覆盖2027-2035年除夕到初六）的说喵～"
            },
            {
                date: "2026年6月13日",
                title: "节日公告新增：高考、端午、重阳、站长生日(5/24)、开学季(9/1)",
                desc: "在节日公告自动更新工作流中添加 4 个新节日：端午节（农历五月初五动态查表）、重阳节（农历九月初九动态查表）、站长生日(5/24)、开学季(9/1)的说喵～"
            },
            {
                date: "2026年6月13日",
                title: "新增加密流媒体播放器测试文章 (video-1)",
                desc: "创建 video-1 测试文章，内置 hls.js HLS 流媒体播放器，自动加载本地 ./1.m3u8 流文件，附带 mp4_to_hls.bat 转换脚本（纯英文）喵～"
            },
            {
                date: "2026年6月2日",
                title: "状态页面改版：新增历史回放 + 灰色状态",
                desc: "改造 status.html，新增历史回放时间线区域（从 status-data.js 加载），新增灰色「无记录」状态，四色体系（绿/黄/红/灰）覆盖全部场景，建立网站更新→状态记录工作流喵～"
            },
            {
                date: "2026年6月1日",
                title: "新增全套 HTTP 错误页面",
                desc: "基于 404 模板风格批量创建 24 个 HTTP 错误页面（400-418, 500-505），统一渐变背景/机器人动画/喵语风格，重写 403 去掉旧验证逻辑，418 为 RFC 2324 茶壶愚人节彩蛋喵～"
            },
            {
                date: "2026年5月23日",
                title: "修复Python在线编辑器多个bug",
                desc: "修复Python编辑器HTML/JS ID不匹配（codeEditor→pythonEditor）；修复dynamic-data.js数字换行SyntaxError；修复#注释被转为//后吃掉try/catch闭合括号导致Missing catch错误；修复Font Awesome preload integrity缺失警告喵～"
            },
            {
                date: "2026年5月22日",
                title: "上线免费工具集 + SEO长文矩阵",
                desc: "上线4个免费工具（VTuber名字生成器、Ren'Py模板生成器、VTuber人格测试、二次元色彩分析器）、友链页面、新增3篇SEO教程文章（Ren'Py立绘替换/存档系统/Python OCR），完善工具索引页和导航菜单喵～"
            },
            {
                date: "2026年5月18日",
                title: "新增心情追踪仪表板",
                desc: "集成 Mood-Tracker-Dashboard 项目，转为纯静态 HTML+JS 版本，支持全年热力图、散点图、localStorage 本地记录和数据导出喵～"
            },
            {
                date: "2026年5月17日",
                title: "更新 sitemap.xml",
                desc: "扫描 blog/ 目录所有文章（18篇+），检查静态页面和游戏页面，生成新 sitemap.xml，添加 blog/index.html，更新所有 lastmod 为实际修改时间喵～"
            },
            {
                date: "2026年5月17日",
                title: "简化验证流程",
                desc: "删除多余的验证环节，只保留 Cloudflare Turnstile 验证，用户可以直接访问主界面喵～"
            },
            {
                date: "2026年5月16日",
                title: "新增低版本浏览器跳转页面",
                desc: "添加了 oops 页面，当检测到 IE/Edge 1-17/其他低版本浏览器时，自动跳转到提示页面引导用户使用现代浏览器喵～"
            },
            {
                date: "2026年5月10日",
                title: "修复返回顶部按钮 + 升级音乐播放器UI",
                desc: "修复了全站文章页返回顶部按钮箭头不居中的bug，同时给首页悬浮音乐播放器换上了全新UI，包含封面展示、歌曲列表和可视化跳动条的说～ (๑•̀ㅂ•́)و✧"
            },
            {
                date: "2026年5月7日",
                title: "新增视频播放器（自研）",
                desc: "为网站新增自研视频播放器组件，支持视频在线播放的说～ (๑•̀ㅂ•́)و✧"
            },
            {
                date: "2026年3月31日",
                title: "添加后台 · 修复已知问题 · 修复SEO爬虫误判",
                desc: "上线后台管理系统 admin.html，修复多个已知 Bug 并完善网站细节，优化 SEO 爬虫检测逻辑，提升搜索引擎友好度和用户体验的说～ (๑>ᴗ<๑)"
            },
            {
                date: "2026年4月1日",
                title: "更新网站图标",
                desc: "更新了网站的 favicon 和多个社交平台的图标，采用了更符合二次元风格的设计，提升了整体视觉一致性和品牌形象的说～ (๑˃̵ᴗ˂̵)و"
            },
            {
                date: "2026年4月2日",
                title: "整理网站上的游戏",
                desc: "对网站上的游戏进行了整理和分类，更新了游戏预览的链接和描述，提升了用户浏览体验的说～ (◕‿◕✿)"
            },
            {
                date: "2026年4月3日",
                title: "换了个域名",
                desc: "将网站域名从 https://ciallo0721-cmd.github.io/ 更换为 https://91vip.xn--32v.ink/，提升了网站的专业形象和访问速度的说～ (๑•̀ㅂ•́)و✧"
            },
            {
                date: "2026年4月5日",
                title: "安全加固 · SEO移除 · 性能优化 · 新增状态页面",
                desc: "进行全面安全审计，移除硬编码密码并改为哈希验证；删除所有SEO文件和meta标签；收紧CSP策略；添加实时状态查看页面 (status.html)；优化DNS预解析和CSS异步加载的说～ (๑>ᴗ<๑)"
            },
            // ↑ 新条目加在最上面，最新的排最前
            {
                date: "2026年4月8日",
                title: "与google analytics对接",
                desc: "成功将网站流量数据接入google analytics，便于后续的数据分析和用户行为研究的说～ (๑•̀ㅂ•́)و✧"
            },
        ];

        // 渲染时间线（使用DOM创建防止XSS）
        function escapeHtml(str) {
            var d = document.createElement('div');
            d.textContent = String(str);
            return d.innerHTML;
        }
        function renderTimeline() {
            var list = document.getElementById('timelineList');
            if (!list || !window.timelineData) return;
            list.innerHTML = window.timelineData.map(function(item, i) {
                var safeDate  = escapeHtml(item.date  || '');
                var safeTitle = escapeHtml(item.title || '');
                var safeDesc  = item.desc ? escapeHtml(item.desc) : '';
                return '<div class="timeline-item" style="animation-delay:' + (i * 0.08) + 's">'
                    + '<div class="timeline-date"><i class="fas fa-calendar-alt" style="margin-right:6px;"></i>' + safeDate + '</div>'
                    + '<div class="timeline-content">'
                    + '<div class="timeline-title">' + safeTitle + '</div>'
                    + (safeDesc ? '<p class="timeline-desc">' + safeDesc + '</p>' : '')
                    + '</div></div>';
            }).join('');
        }
        document.addEventListener('DOMContentLoaded', renderTimeline);
