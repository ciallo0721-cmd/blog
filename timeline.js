window.timelineData = [
            {
                date: "2026年6月26日",
                title: "自研视频播放器停用 · 替换为浏览器原生播放器",
                desc: "自研视频播放器（video-player.js / nice-video.js / MediaViewer视频功能）因2026/6/16后兼容性问题彻底失效，打了也播不了的说喵～ 已将其从4篇含有视频的文章（#15 真白花音退网视频、#16 注册GitHub教程、#17 优化X推荐、muban样板文章）中全部替换为标准HTML5 `<video controls>` 原生播放器，并清理3篇无实际视频内容的文章中残留的脚本引用的说喵～（状态标记为🔴红色）"
            },
            {
                date: "2026年6月26日",
                title: "sitemap 添加 /work/（打工模拟器）条目",
                desc: "将 https://ciallo0721-cmd.top/work/ 打工模拟器 WebAssembly 游戏页面加入站点地图（sitemap.xml），便于搜索引擎索引的说喵～"
            },
            {
                date: "2026年6月25日",
                title: "导航栏缩小 + MoeFace Web 前端 .moe 解析器重写",
                desc: "将导航栏 nav-container padding 从 15px 20px 缩小为 8px 15px，nav-links gap 从 35px 缩小为 18px，同步更新全部 29 个 HTML 文件。同时重写 app/moeface/index.html 的 loadDatabase()，将 JSON.parse 改为解析 .moe 实际文本格式（多部位特征取平均）的说喵～"
            },
            {
                date: "2026年6月25日",
                title: "修复 IndexNow 工作流：动态 URL 生成 + 密钥文件补全",
                desc: "重写 indexnow-submit.yml：从 articles-data.js 动态解析全部 49 篇文章的 URL，扩大触发路径（wiki/status/aboutme/wz/baicai/taffy 等），新增每6小时定时兜底提交和备用 Bing IndexNow 端点。补充 IndexNow 验证密钥文件 78e189d695964af9a74c8a4c0493ac7e.txt 的说喵～"
            },
            {
                date: "2026年6月22日",
                title: "新文章 #47：关于性别话题的一些想法",
                desc: "写了一篇关于网上性别话题的个人随想喵～ 纯个人观察，不说教不站队，加了弹窗警告和免责声明。感兴趣的朋友可以去看看的说～"
            },
            {
                date: "2026年6月21日",
                title: "新增18篇心理学深度探索系列文章",
                desc: "一口气上线18篇心理学深度文章喵～ 从PTSD/C-PTSD/NPD等临床障碍，到语义饱和/恐怖谷/中式恐怖等认知现象，再到精神分裂症与超雄综合征的去污名化科普，以及地雷妹/OD/改花刀等当代青少年心理危机话题。最后两篇为微表情心理学和说谎判断，末篇附个人心理学探究经历与感悟的说完喵～ 文章ID 29-46，全部收录于 blog/心理学/ 目录的说喵～"
            },
            {
                date: "2026年6月21日",
                title: "百科词条更新：真白花音（白菜）内容全面升级",
                desc: "参考 baicai.ciallo0721-cmd.top 纪念站，全面更新 wiki 中真白花音词条。修正出道时间（原错误写为2023年，实为2019年5月7日），补充基本资料（生日5月29日、身高144cm、白发红瞳、所属Chucolala/P家等）、完整16条事业时间线（2019-2026）、9条轶事、以及B站/YouTube/Twitter外部链接。同步更新 wiki/data.json 和 wiki/hanamine/index.html 的说喵～"
            },
            {
                date: "2026年6月20日",
                title: "二级域名系统上线：status / wiki / baicai / taffy",
                desc: "创建四个二级域名站点喵～ status.ciallo0721-cmd.top（状态页）、wiki.ciallo0721-cmd.top（百科）、baicai.ciallo0721-cmd.top（真白花音纪念站）、taffy.ciallo0721-cmd.top（塔菲AI人设展示）。客户端路由方案（_subdomain-router.js），tname DNS 配 CNAME 就能用，等以后能切 Cloudflare DNS 了还能无缝升级到 Worker 版喵！"
            },
            {
                date: "2026年6月20日",
                title: "文章加载双保险：首选 .blog + 备选 html.html",
                desc: "修复文章显示不全的问题！现在每篇文章都有 html.html 静态备份文件。decoder.js 加载策略改为：① 首选 .blog 文件（正常解析渲染）→ ② .blog 加载失败时自动回退到 html.html（提取内容显示）→ ③ 双重失败才显示错误提示。为全部 24 篇文章生成了完整的 html.html 备份喵～"
            },
            {
                date: "2026年6月20日",
                title: "SEO 大优化：预渲染24篇文章 + 修复 CSP + 新 sitemap",
                desc: "全面 SEO 优化：生成 24 篇博客文章的静态 HTML 文件（不再依赖 JS 加载）；放宽 CSP 以允许 Googlebot 渲染；重写 sitemap.xml 包含 39 个 URL；添加 noscript 静态链接回退；优化 robots.txt。附赠 `prerender-blog.py` 预渲染脚本喵～"
            },
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
                desc: "修复多个 bug：① decoder.js 未解析 URL 查询参数 ?blog_id=，导致嵌套路径下无法获取文章ID；② 文章 HTML 中 ../articles-data.js 在嵌套目录（如 blog/兴趣/另一个次元/24/）下解析不到根目录，window.articlesData 为 undefined；③ renderArticle 中 trimmedContent 变量名拼写不一致导致 JS 报错。将所有文章 HTML 的 decoder.js 引用统一为 /blog/decoder/decoder.js 共享版本，articles-data.js/wiki-data.js/wiki-linker.js 全部改为绝对路径，decoder.js 新增 ?blog_id= 解析和 _pathMap 路径拼接逻辑的说喵～"
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
            {
                date: "2026年6月21日",
                title: "新增5篇心理学效应科普文章",
                desc: "一口气上线5篇全新的心理学效应科普文章喵～ 达克效应（含家是本朱剑秋案例分析）、斯德哥尔摩效应（含娜塔莎案时间线）、幸存者偏差（二战弹孔经典案例）、踢猫效应（情绪传染链条可视化）、蝴蝶效应（洛伦兹混沌理论全解析），全部收录于 blog/心理学/ 目录的说喵～"
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
