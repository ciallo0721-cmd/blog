window.timelineData = [
            {
                date: "2026年7月13日",
                title: "大规模 CSS/JS 外置 + 鼠标特效性能优化",
                desc: "①所有非文章 HTML 的内联 CSS/JS 全部提取为独立文件，存入 css/css/ 和 js/js/ 目录②移动 6 个独立 CSS 文件、17 个独立 JS 文件到对应目录③更新 59 个 HTML 文件的引用路径④重构鼠标特效引擎：FPS 自动检测降级（高/中/低三档），requestAnimationFrame 节流 mousemove，navigator.deviceMemory 检测低配设备，CSS will-change 提示 GPU 加速，粒子数量/频率按性能档位自适应⑤开放控制台 toggleLowPowerEffects() 手动切换低功耗模式⑥优化特效 CSS：缩短动画时长、降低复杂元素尺寸、减少 transition 范围",
                author: "ciallo0721-cmd"
    },
            {
                date: "2026年7月13日",
                title: "动态广告系统 v1.0 上线：智能标签偏好算法",
                desc: "①新增 15 种彩色 SVG 占位广告（对应 15 个标签：游戏/编程/AI/设计/音乐/影视等）②智能偏好算法：用户点击广告→该标签权重+10，点「不感兴趣」→权重-20+屏蔽该广告，加权随机选择推荐 ③ 4 个广告位分散在首页各处（顶部横幅、项目中、文章区下、底部）④localStorage 持久化偏好数据 ⑤测试面板：tests/ad-system-test.html 可查看权重/历史/模拟测试。",
                author: "ciallo0721-cmd"
    },
            {
                date: "2026年7月10日",
                title: "主页集成 Giscus 评论区（留言板）",
                desc: "将 Giscus 评论区直接嵌入首页 footer 上方，无需单独页面。使用 GitHub Discussions 讨论系统，已配置 repo-id 和 category-id。首页 footer 和 friends.html 导航栏均添加「留言板」入口锚点。",
                author: "ciallo0721-cmd"
    },
            {
                date: "2026年7月10日",
                title: "新文章 #61：暑期更新频率调整说明",
                desc: "发布网站公告：暑假期间因学业（和旅游(bushi)）忙，文章从每周5篇降至每周0.5~1篇（或每月5篇），GitHub热力图从每天1绿降至每周3绿，网站仍维护（看情况），9月开学后逐步恢复喵～"
    },
            {
                date: "2026年7月10日",
                title: "新文章 #60：git commit -m \"1\"——你的项目历史正在被一个字符毁掉",
                desc: "发布Git教程文章，从GitHub入门讲起，犀利拆解为什么commit message写「1」短期能忍长期是灾难。git log变天书、bisect报废、三个月后自己都看不懂——不是Git在惩罚你，是你自己在毁掉项目历史的喵～"
    },
            {
                date: "2026年7月9日",
                title: "博客页视觉重设计：深绿色书架主题",
                desc: "blog/index.html 全面视觉重构：①新增静态书架 SVG 背景（3层书架+书本几何图案，深绿色调）②配色从粉蓝 B站风 → 深绿+暖米色（#1A3C34/#F5F1E8），iOS 6/2017 简约高级感 ③动画系统升级：fadeInUp → cardReveal（16px微移+cubic-bezier缓动），卡片 hover 8px→4px 克制提升，header 标题呼吸发光 ④导航透明毛玻璃+方正圆角、卡片 20px→12px 圆角、按钮渐变→纯色。整体从活泼俏皮 → 沉稳知性书架风喵～"
    },
            {
                date: "2026年7月7日",
                title: "端测测测试基础设施 + 全站路径修复",
                desc: "搭建完整 Web 测试框架，含3个独立模块：静态代码分析（62个HTML）、链接健康检测（555个链接）、基础性能检测（8个关键页面，TTFB仅6ms）。修复 pages/ 目录 ~30处相对路径错误（./→../）、index.html 38处外链添加 rel=\"noopener noreferrer\"、3处 fanv.ico 路径错误。链接断裂数从35条降至12条（-66%）。首页新增更新公告横幅。综合评分：静态🟡70 + 链接🟡64 + 性能🟢94。"
            },
            {
                date: "2026年7月6日",
                title: "全站图标SVG化：移除 Font Awesome 依赖",
                desc: "75个HTML文件全部移除 Font Awesome CDN（6.4.0/6.5.1），替换为自建 SVG 图标系统（js/svg-icons.js，含60+种图标）。wz/ 安全警告 GIF 替换为动画 SVG，arg/ 游戏窗口控件 emoji → SVG，cn/ 诗人百科和 wiki/ 搜索 emoji → SVG。首页 favicon 保留不动。预计减少约80KB外部CDN请求，所有图标离线可用喵～"
            },
            {
                date: "2026年7月5日",
                title: "sitemap.xml 大更新：73→96个URL覆盖全站",
                desc: "重新生成 sitemap.xml，从旧版73个URL扩展到96个。新增 friends.html、baicai 纪念站、cn 诗人百科、ARG 镜中人、app 工具页、10个 wiki 词条子页面、work 打工模拟器、cs2 等。同步更新 generate-sitemap.py 脚本，下次改结构一键重生成的说喵～"
            },
            {
                date: "2026年7月4日",
                title: "全新 Admin 调试面板 v1.0 上线",
                desc: "纯前端本地调试面板，四合一：①存储编辑器（localStorage/sessionStorage/Cookies 增删改查）②URL参数注入（一键模拟16个地区 from=us/uk/hk... + touch=true 移动端模式）③功能测试（地区访问控制测试、存储压力测试、配额测试）④导入导出（JSON备份还原、剪贴板操作）。深色主题、响应式布局，从此调试网站不用手敲 URL 参数啦喵～"
            },
            {
                date: "2026年7月4日",
                title: "根目录文档归档：17个 .md/.txt 移入 foragent/",
                desc: "把博客语法、SEO策略、ArtiScript/BlockScript规范、网站重构计划等17个给agent看的文档全移到 ./foragent/ 目录，根目录清爽多了喵～搜索引擎验证文件和 robots.txt 保留原位不动。"
            },
            {
                date: "2026年7月4日",
                title: "项目大扫除：清理无用文件 37 个",
                desc: "删除未引用的12MB视频、18个无CDN层的错误页（400~505/不含404）、失效Jekyll配置、过期的local_server和打包脚本、10.html谜之页面、admin后台、peizhi配置残骸等。共释放约13MB空间，项目目录干净多了的说喵～"
            },
            {
                date: "2026年7月4日",
                title: "移除推广返佣板块",
                desc: "从首页和友链页移除域名推广返佣板块（含推广链接、返佣统计表格、相关CSS和JS），该信息属于个人返现数据不应对外展示的说喵～"
            },
            {
                date: "2026年7月4日",
                title: "新文章 #57：浪漫文案？那是词语废料",
                desc: "发布生活随笔，犀利批判当代朋友圈「浪漫文案」现象——前言不搭后语、逻辑混乱如乱码，扒皮「盲盒论」和「SEO论」两种荒唐辩护，呼吁好好写字好好表达感情的说喵～"
            },
            {
                date: "2026年7月4日",
                title: "文章模板更新：muban 新增自动推荐文章功能",
                desc: "在 blog/muban/ 样板模板中新增自动推荐文章区块。根据当前文章标签匹配相关文章（同标签+同分类加权），无匹配时回退显示最新精选文章。使用 articles-data.js 数据驱动，新文章复制模板即可自动获得推荐内容的说喵～"
            },
            {
                date: "2026年7月4日",
                title: "历代诗人百科：新增投稿&修复板块",
                desc: "在 cn/ 历代诗人百科页面底部新增投稿&修复板块。支持填写诗人信息表单自动生成投稿内容（可读文本+JSON），一键复制或跳转 GitHub Issue 提交；修复记录Tab可展示数据修正历史。方便雏草姬们一起完善诗人数据库的说喵～"
            },
            {
                date: "2026年7月4日",
                title: "新文章 #22：调色教程——复古蒸汽波",
                desc: "发布 Lightroom Classic 调色教程，完整收录复古蒸汽波风格的影调+HSL+校准+颗粒全参数，附带3个调色板方案和霓虹街头拍摄选址指南。高光-62阴影+46骨架、橙色-22绿色+17灵魂，一键复刻赛博浪漫的说喵～"
            },
            {
                date: "2026年7月3日",
                title: "ARG 游戏「镜中人」发布 & 主页游戏板块更新",
                desc: "发布全新 Win98 复古美学 ARG 解谜游戏「镜中人」，玩家在虚拟桌面中探索 2002 年神秘论坛「镜面论坛」，通过浏览器和终端与五个角色互动，最终面临四种结局。已将游戏加入主页游戏板块的说喵～"
            },
            {
                date: "2026年7月1日",
                title: "新文章 #55：我的音乐品味三年进化史（2023-2026）",
                desc: "发布个人回顾文章，完整列出从2023年7月到2026年7月三年间收藏的180+首歌曲。按时间线梳理每个月的歌单变化，从短视频BGM到Vocaloid电波系、从DDLC OST到俄语硬曲——记录一个初中生的音乐品味进化之路的说喵～"
            },
            {
                date: "2026年6月30日",
                title: "新文章 #54：为什么儿童会对高饱和度上瘾？——从脑腐到Cocomelon的色彩心理学",
                desc: "发布心理学深度文章，全面解析为什么儿童天然偏爱高饱和度色彩、为何婴幼儿玩具都是鲜艳色系、色彩对儿童认知情绪的影响。引入脑腐/烂梗概念分析Cocomelon为代表的儿童内容成瘾机制，外部链接使用 /oops/link/ 跳转提示保护的说喵～"
            },
            {
                date: "2026年6月29日",
                title: "新文章 #53：病娇（ヤンデレ）从萌属性到心理剖析",
                desc: "发布ACG文化深度解析文章，全面探讨「病娇」这一经典萌属性的定义、历史起源（1992年《狂った果実》到2005年《School Days》）、经典角色（桂言叶、我妻由乃）、心理学侧面分析，以及病娇与傲娇/郁娇等其他デレ系属性的区别。同时修改了文章 #25 斯德哥尔摩效应，新增YouTube/Bilibili双视频嵌入和4个外部延伸阅读链接。"
            },
            {
                date: "2026年6月29日",
                title: "新文章 #52：从 UTAU 到心理学——我的 51 篇文章进化路",
                desc: "发布个人回顾文章，审视从2025年12月到2026年6月写下的51篇文章风格演变。从UTAU教程、闲聊碎碎念、公告声明、VTB告别，到24篇心理学系列井喷，再到社会议题和行业深度分析——回顾一个初中生写作者从「怎么做」到「为什么」的9个月旅程的说喵～"
            },
            {
                date: "2026年6月29日",
                title: "新文章 #51：赤井心桐生可可事件（龙心事件）深度回顾",
                desc: "发布VTuber行业深度分析文章，全面回顾2020年9月赤井心与桐生可可先后展示YouTube后台将台湾列为「国家」数据引发的跨国争议事件。涵盖完整时间线、各方视角对比（中国大陆/台湾/日本/欧美/行业）、鲸落效应与中文Vup崛起、COVER公关灾难分析，以及深层矛盾反思。外部链接使用 /oops/link/ 跳转提示保护的说喵～"
            },
            {
                date: "2026年6月28日",
                title: "首页和友链页新增域名推广返佣板块",
                desc: "在 friends.html 和 index.html 添加 tname.net 推广返佣板块，含专属推广链接（https://tname.net?sid=11078）、返佣规则展示（注册¥3/购买¥2）、累计返佣金额和返佣记录表格的说喵～"
            },
            {
                date: "2026年6月26日",
                title: "网站挂上爱发电赞助链接",
                desc: "在首页导航栏、移动端菜单、页脚添加爱发电链接（https://ifdian.net/a/ciallo0721-cmd），同步修复 wz/index.html 断裂的赞助支持锚点链接，更新 i18n 映射使其准确匹配导航项的说喵～"
            },
            {
                date: "2026年6月26日",
                title: "修复 /blog/ 页面 Meta Description 过短问题",
                desc: "Bing Webmaster Tools 检测到 /blog/ 页面 meta description 仅16字符（ciallo0721-cmd 的文章站），不符合搜索引擎要求。已扩写为完整描述（~68字符），同时补充了 OGP（og:title/description/url/type/site_name）和 Twitter Card 元数据，提升搜索引擎和社会化分享表现的说喵～"
            },
            {
                date: "2026年6月26日",
                title: "新文章 #50：樱花校园模拟器桃子组神秘房间通关攻略",
                desc: "发布游戏攻略文章，介绍樱花校园模拟器中桃子组（黑帮团，持火箭筒）神秘房间的通关方法。文章以视频为主，无文字内容，视频文件位于 blog/ACG/50/1.mp4 的说喵～"
            },
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
