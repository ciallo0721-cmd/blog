// articles-data.js — 文章数据源
window.articlesData = {
    articles: (function() {
        var raw = [
        {
            id: 1,
            category: "教程",
            fileName: "教程/1/",
            title: "UTAU教程：从调音到发布完全指南",
            excerpt: "学习如何使用UTAU进行歌声合成，从基础调音到高级技巧，完整指南带你入门。",
            date: "2025-12-28",
            tags: ["UTAU", "虚拟歌姬", "调音", "歌声合成", "教程", "音乐制作"],
            readTime: 15,
            featured: true
        },
        {
            id: 2,
            category: "教程",
            fileName: "教程/2/",
            title: "Unity 2D角色移动系统完全指南",
            excerpt: "从零开始构建一个完整的2D角色移动系统，包含平滑移动、跳跃、冲刺和动画控制。",
            date: "2025-12-29",
            tags: ["Unity", "2D游戏开发", "角色移动", "C#编程", "游戏物理"],
            readTime: 20,
            featured: true
        },
        {
            id: 3,
            category: "教程",
            fileName: "教程/3/",
            title: "2.5头身小人绘画全攻略：从基础到头发细节",
            excerpt: "本教程将详细讲解如何绘制可爱的2.5头身小人，涵盖比例结构、面部表情、头发与呆毛绘制技巧，适合初学者和有一定基础的画手。",
            date: "2025-12-30",
            tags: ["绘画教程", "Q版人物", "2.5头身", "头发绘制", "呆毛技巧", "角色设计"],
            readTime: 15,
            featured: true
        },
        {
            id: 4,
            category: "公告",
            fileName: "公告/4/",
            title: "关于为什么主页变成了这样",
            excerpt: "网站被攻击、性能问题大揭秘！详细解释网站主页暂时变成公告页面的原因，以及维护到1月18日的恢复计划。",
            date: "2026-01-10",
            tags: ["网站公告", "被攻击", "性能优化", "DDoS攻击", "维护", "GitHub Pages", "未来计划"],
            readTime: 15,
            featured: true
        },
        {
            id: 5,
            category: "公告",
            fileName: "公告/5/",
            title: "主页大更新",
            excerpt: "修复了加载时间过长的问题，更新音乐播放器。",
            date: "2026-01-13",
            tags: ["主页", "更新", "新设计", "用户体验", "功能改进"],
            readTime: 7,
            featured: true
        },
        {
            id: 6,
            category: "闲聊",
            fileName: "闲聊/6/",
            title: "闲聊",
            excerpt: "一些日常闲聊和碎碎念。",
            date: "2026-01-13",
            tags: ["闲聊"],
            readTime: 4,
            featured: true
        },
        {
            id: 7,
            category: "ACG",
            fileName: "ACG/7/",
            title: "新歌姬发布",
            excerpt: "新歌姬发布：沙雕の贤者V2 正式上线！",
            date: "2026-01-17",
            tags: ["UTAU", "虚拟歌姬", "沙雕の贤者", "音源发布"],
            readTime: 3,
            featured: true
        },
        {
            id: 8,
            category: "公告",
            fileName: "公告/8/",
            title: "网站小更新",
            excerpt: "网站小更新：增加了一些实用工具和功能。",
            date: "2026-01-28",
            tags: ["更新"],
            readTime: 1,
            featured: true
        },
        {
            id: 9,
            category: "公告",
            fileName: "公告/9/",
            title: "关于GitHub Issue被恶意篡改的说明",
            excerpt: "一份严肃的记录：我的 Issue 被仓库管理员篡改，真相在此。",
            date: "2026-03-04",
            tags: ["声明", "GitHub", "立场"],
            readTime: 8,
            featured: true
        },
        {
            id: 10,
            category: "公告",
            fileName: "公告/10/",
            title: "喜报",
            excerpt: "喜报！网站PV达到了111。",
            date: "2026-04-11",
            tags: ["喜报", "分析"],
            readTime: 1,
            featured: true
        },
        {
            id: 11,
            category: "公告",
            fileName: "公告/11/",
            title: "网站建议收集帖 | 欢迎来提想法",
            excerpt: "网站内容建议收集帖 · 想让我加什么/删什么？每天都会看。",
            date: "2026-04-11",
            tags: ["公告", "互动", "建议收集", "GitHub"],
            readTime: 3,
            featured: true
        },
        {
            id: 12,
            category: "公告",
            fileName: "公告/12/",
            title: "关于本站广告位的说明：为什么会有广告？以及我们不会成为\"邪恶网站\"",
            excerpt: "针对近期访客对广告位设置的疑问，本文将详细解释放置广告的原因、广告的具体形式，以及本站绝不会成为弹窗满天飞的\"邪恶网站\"的承诺。",
            date: "2026-04-23",
            tags: ["网站公告", "广告说明", "用户体验", "承诺", "FAQ"],
            readTime: 5,
            featured: true
        },
        {
            id: 13,
            category: "ACG",
            fileName: "ACG/13/",
            title: "再见了，我的白菜——写给真白花音的告别",
            excerpt: "2026年4月17日，B站第一日V真白花音宣布将于5月1日毕业。作为从2023年开始关注她的老粉，写下这篇告别文章。",
            date: "2026-04-29",
            tags: ["VTuber", "真白花音", "毕业", "告别", "V圈"],
            readTime: 6,
            featured: true
        },
        {
            id: 14,
            category: "ACG",
            fileName: "ACG/14/",
            title: "再见，白菜",
            excerpt: "2026年5月1日，真白花音正式毕业了。再见，我的第一个V，再见，白菜。",
            date: "2026-05-01",
            tags: ["VTuber", "真白花音", "毕业", "告别"],
            readTime: 2,
            featured: true
        },
        {
            id: 15,
            category: "ACG",
            fileName: "ACG/15/",
            title: "真白花音退网前最后五分钟",
            excerpt: "记录真白花音退网前的最后五分钟，永远的回忆。",
            date: "2026-05-01",
            tags: ["视频"],
            readTime: 1,
            featured: false
        },
        {
            id: 16,
            category: "教程",
            fileName: "教程/16/",
            title: "从零开始，怎么注册GitHub并克隆仓库",
            excerpt: "从零开始学习如何注册GitHub账号并克隆仓库到本地，适合完全新手。",
            date: "2026-05-07",
            tags: ["GitHub", "Git", "教程", "入门", "仓库管理"],
            readTime: 10,
            featured: true
        },
        {
            id: 17,
            category: "科技",
            fileName: "科技/17/",
            title: "优化X(Twitter)推荐算法",
            excerpt: "如何优化X(Twitter)的时间线推荐，获取更有价值的内容。",
            date: "2026-05-13",
            tags: ["X(Twitter)", "推荐算法"],
            readTime: 10,
            featured: true
        },
        {
            id: 18,
            category: "生活",
            fileName: "生活/18/",
            title: "泰式柠檬番茄酸辣炸鸡腿",
            excerpt: "酸辣开胃、香喷喷又下饭——这道泰式炸鸡腿是整个家庭的最爱！泰式辣椒酱配柠檬和番茄，一上桌孩子们就忍不住多盛一碗饭。附完整食材清单和分步做法。（转载自 lifangcook）",
            date: "2026-05-17",
            tags: ["美食", "炸鸡", "泰式料理", "家常菜", "菜谱", "转载"],
            readTime: 5,
            featured: true
        },
        {
            id: 19,
            category: "教程",
            fileName: "教程/19/",
            title: "Ren'Py 人物立绘怎么换？完整替换指南",
            excerpt: "详细教程：3种方法更换 Ren'Py 视觉小说的人物立绘，包括文件替换、代码修改和动态立绘切换，附常见问题排查。",
            date: "2026-05-22",
            tags: ["Ren'Py", "视觉小说", "立绘", "游戏开发", "教程"],
            readTime: 10,
            featured: true
        },
        {
            id: 20,
            category: "教程",
            fileName: "教程/20/",
            title: "Ren'Py 存档系统完全教程：自定义存档位置与多存档槽",
            excerpt: "深入讲解 Ren'Py 存档系统，涵盖默认存档位置、自定义存档路径、多存档槽管理、存档缩略图、加密防篡改和自动存档配置，附完整代码示例。",
            date: "2026-05-22",
            tags: ["Ren'Py", "存档系统", "游戏开发", "教程", "save"],
            readTime: 12,
            featured: true
        },
        {
            id: 21,
            category: "教程",
            fileName: "教程/21/",
            title: "Python 截图识别文字完全教程：从 Tesseract 到深度学习",
            excerpt: "完整教程：使用 Python 实现截图文字识别，涵盖 Tesseract、PaddleOCR、截图工具选型、图像预处理技巧和性能优化，附实战代码。",
            date: "2026-05-22",
            tags: ["Python", "OCR", "Tesseract", "PaddleOCR", "图像识别", "教程"],
            readTime: 15,
            featured: true
        },
        {
            id: 22,
            category: "ACG",
            fileName: "ACG/22/",
            title: "雌小鬼：从贬义词到萌属性的进化史",
            excerpt: "深度解析ACG萌属性「雌小鬼（メスガキ）」——从日语贬称到二次元文化标签的完整进化史，包含典型形象、与傲娇/小恶魔的区别、让你明白担当解析，以及典型角色一览。",
            date: "2026-06-04",
            tags: ["ACG", "萌属性", "二次元", "雌小鬼", "文化解析"],
            readTime: 10,
            featured: true
        },
        {
            id: 23,
            category: "心理学",
            fileName: "心理学/23/",
            title: "占卜的原理：心理学拆解\"为什么总觉得很准\"",
            excerpt: "超6800字深度心理学文章：从巴纳姆效应、冷读术、确认偏误、自我实现预言到安慰剂效应，用科学实验与认知科学彻底解释占卜为何让人觉得\"神准\"。批判性思维必读。",
            date: "2026-06-09",
            tags: ["心理学", "巴纳姆效应", "冷读术", "认知偏误", "科学思维", "占卜揭秘"],
            readTime: 35,
            featured: true
        },
        {
            id: 24,
            category: "心理学",
            fileName: "心理学/24/",
            title: "达克效应：为什么越无知的人越自信？",
            excerpt: "深度解析达克效应（邓宁-克鲁格效应）——从经典研究到家是本朱剑秋事件，全面拆解这条「愚昧之山」曲线，看认知偏差如何让能力低者高估自己。",
            date: "2026-06-21",
            tags: ["达克效应", "邓宁-克鲁格效应", "认知偏差", "自我认知", "社会心理学"],
            readTime: 12,
            featured: true
        },
        {
            id: 25,
            category: "心理学",
            fileName: "心理学/25/",
            title: "斯德哥尔摩效应：人质为什么会对绑匪产生感情？",
            excerpt: "从1973年瑞典银行劫案到娜塔莎·坎普施被囚八年案，揭秘受害者与加害者之间复杂情感纽带的心理学机制——创伤绑定与生存本能。",
            date: "2026-06-21",
            tags: ["斯德哥尔摩效应", "反常心理学", "受害者心理", "创伤绑定", "社会心理学"],
            readTime: 12,
            featured: true
        },
        {
            id: 26,
            category: "心理学",
            fileName: "心理学/26/",
            title: "幸存者偏差：为什么我们总是忽略失败者的声音？",
            excerpt: "从二战飞机弹孔到创业成功学——幸存者偏差全面解析。活下来的经验不一定对，失败者的沉默证据才是最有价值的信息。",
            date: "2026-06-21",
            tags: ["幸存者偏差", "认知偏误", "逻辑谬误", "批判性思维", "统计学"],
            readTime: 12,
            featured: true
        },
        {
            id: 27,
            category: "心理学",
            fileName: "心理学/27/",
            title: "踢猫效应：坏情绪是如何向下传染的？",
            excerpt: "老板骂员工，员工回家吼老婆，老婆打孩子，孩子踢猫——攻击转移与情绪溢出的心理学解析，以及如何打破这个伤害链条。",
            date: "2026-06-21",
            tags: ["踢猫效应", "情绪管理", "负面情绪", "社会心理学", "情绪传染"],
            readTime: 10,
            featured: true
        },
        {
            id: 28,
            category: "心理学",
            fileName: "心理学/28/",
            title: "蝴蝶效应：一只蝴蝶扇动翅膀如何引发一场飓风？",
            excerpt: "从混沌理论到日常生活的连锁反应——洛伦兹的偶然发现如何揭示初始条件的微小差异导致结果的巨大不同。",
            date: "2026-06-21",
            tags: ["蝴蝶效应", "混沌理论", "系统思维", "非线性思维", "复杂科学"],
            readTime: 12,
            featured: true
        },
        {
            id: 29,
            category: "心理学",
            fileName: "心理学/29/",
            title: "PTSD：创伤后应激障碍——当记忆成为伤口",
            excerpt: "深入解析PTSD的神经机制、诊断标准、症状表现与治疗路径，理解创伤如何在大脑中留下永久的印记。",
            date: "2026-06-21",
            tags: ["PTSD", "创伤后应激障碍", "创伤心理学", "心理健康", "心理咨询"],
            readTime: 15,
            featured: true
        },
        {
            id: 30,
            category: "心理学",
            fileName: "心理学/30/",
            title: "C-PTSD：复杂性创伤后应激障碍——看不见的伤口",
            excerpt: "当创伤不是一次性事件，而是漫长的、重复的、无法逃脱的经历——长期暴露于控制与虐待形成的复杂创伤反应。",
            date: "2026-06-21",
            tags: ["C-PTSD", "复杂性创伤", "童年创伤", "心理虐待", "依恋创伤"],
            readTime: 18,
            featured: true
        },
        {
            id: 31,
            category: "心理学",
            fileName: "心理学/31/",
            title: "NPD：自恋型人格障碍——镜中人的孤独",
            excerpt: "不是每个爱自拍的人都是NPD——深入解析自恋型人格的病理内核、成因与伪装。",
            date: "2026-06-21",
            tags: ["NPD", "自恋型人格障碍", "人格障碍", "心理虐待", "心理健康"],
            readTime: 16,
            featured: true
        },
        {
            id: 32,
            category: "心理学",
            fileName: "心理学/32/",
            title: "语义饱和：为什么盯着一个字看久了就不认识了？",
            excerpt: "一个熟悉的汉字盯着看30秒后突然变得陌生——这不是眼睛出了问题，而是大脑的自我保护机制。",
            date: "2026-06-21",
            tags: ["语义饱和", "认知心理学", "神经适应", "视觉感知", "语言加工"],
            readTime: 10,
            featured: true
        },
        {
            id: 33,
            category: "心理学",
            fileName: "心理学/33/",
            title: "恐怖谷效应：为什么越像人的东西越让人毛骨悚然？",
            excerpt: "当机器人与人类的相似度达到某个临界点时好感度急剧下降——森政弘的经典理论与四种科学解释。",
            date: "2026-06-21",
            tags: ["恐怖谷效应", "认知心理学", "机器人学", "进化心理学", "社会认知"],
            readTime: 13,
            featured: true
        },
        {
            id: 34,
            category: "心理学",
            fileName: "心理学/34/",
            title: "文字恐怖谷效应：当AI写的文字像人但又不完全像人",
            excerpt: "AI生成的文字语法完全正确但总有一种莫名的'不对劲'——文字版的恐怖谷效应正在发生。",
            date: "2026-06-21",
            tags: ["文字恐怖谷", "AI写作", "认知心理学", "自然语言处理", "信息加工"],
            readTime: 13,
            featured: true
        },
        {
            id: 35,
            category: "心理学",
            fileName: "心理学/35/",
            title: '"中式"恐怖：根植于文化基因的恐惧之源',
            excerpt: "不同于欧美的血浆和日式的压抑——中式恐怖有着独特的文化根源：家庭伦理、因果报应、集体记忆中的禁忌。",
            date: "2026-06-21",
            tags: ["中式恐怖", "文化心理学", "民俗心理", "恐怖美学", "集体潜意识"],
            readTime: 14,
            featured: true
        },
        {
            id: 47,
            category: "生活",
            fileName: "生活/47/",
            title: "关于性别话题的一些想法",
            excerpt: "一个普通初中生对网上某些讨论的个人观察和困惑。纯主观想法，不带节奏，理性交流喵～",
            date: "2026-06-22",
            tags: ["个人观点", "日常思考", "友好交流"],
            readTime: 5,
            featured: false
        },
        {
            id: 48,
            category: "生活",
            fileName: "生活/48/",
            title: "红烧五花肉——入口即化的幸福",
            excerpt: "红烧五花肉，肥而不腻、入口即化，是家庭聚餐的明星菜！详细步骤教你做出餐厅级别的红烧肉。",
            date: "2026-06-22",
            tags: ["美食", "红烧肉", "中式菜肴", "家常菜", "菜谱"],
            readTime: 8,
            featured: true
        },
        {
            id: 49,
            category: "生活",
            fileName: "生活/49/",
            title: "蒜蓉西兰花——健康又美味的快手菜",
            excerpt: "蒜蓉西兰花，健康又美味的快手菜！西兰花爽脆，蒜香浓郁，是一道适合任何餐桌的素食佳肴。",
            date: "2026-06-22",
            tags: ["美食", "西兰花", "健康素食", "快手菜", "菜谱"],
            readTime: 4,
            featured: true
        },
        {
            id: 36,
            category: "心理学",
            fileName: "心理学/36/",
            title: '"我的父亲是一扇门"——被误解的精神分裂症',
            excerpt: "从小红书经典怪谈出发，深度解析精神分裂症的真实面貌——它不是'多重人格'，而是世界上最孤独的疾病之一。原帖并非关于父亲，而是关于发帖人自身可能存在的精神疾病感知障碍。",
            date: "2026-06-21",
            tags: ["精神分裂症", "被误解的精神疾病", "贴吧故事", "心理健康", "去污名化"],
            readTime: 20,
            featured: true
        },
        {
            id: 37,
            category: "心理学",
            fileName: "心理学/37/",
            title: '被误解的"超雄综合征"：染色体不是你的命运',
            excerpt: "超雄综合征长期被错误贴上'天生犯罪基因'的标签——还原这个科学谬误背后的真相与不公。",
            date: "2026-06-21",
            tags: ["超雄综合征", "XYY综合征", "基因歧视", "被误解的医学", "产前诊断"],
            readTime: 14,
            featured: true
        },
        {
            id: 38,
            category: "心理学",
            fileName: "心理学/38/",
            title: "躯体化现象：当心理的痛苦说不出来，身体就会替你说",
            excerpt: "为什么长期压力会导致胃痛？你的身体是你最诚实的翻译官——东方文化中特有的躯体化现象。",
            date: "2026-06-21",
            tags: ["躯体化", "心身医学", "心理防御机制", "躯体症状障碍", "跨文化心理学"],
            readTime: 15,
            featured: true
        },
        {
            id: 39,
            category: "心理学",
            fileName: "心理学/39/",
            title: '"地雷妹"现象深度分析：可爱外表下的脆弱心灵',
            excerpt: "拨开猎奇和污名化的标签，理解这些隐藏在可爱笑容之下的破碎灵魂——从心理学角度看'地雷系女子'。",
            date: "2026-06-21",
            tags: ["地雷妹", "地雷系女子", "心理创伤", "自伤行为", "亚文化心理"],
            readTime: 16,
            featured: true
        },
        {
            id: 40,
            category: "心理学",
            fileName: "心理学/40/",
            title: '"OD"：不只是"想死"——过度服药背后的心理真相',
            excerpt: "OD不是简单的自杀行为，而是一种在无法承受的心理痛苦中发出的求救信号。",
            date: "2026-06-21",
            tags: ["OD", "过量服药", "自伤行为", "青少年危机", "心理急救"],
            readTime: 14,
            featured: true
        },
        {
            id: 41,
            category: "心理学",
            fileName: "心理学/41/",
            title: '"改花刀"——当刀口成为无法言说的语言',
            excerpt: "自伤行为（NSSI）的心理机制——为何有人要用伤害身体的方式来忍受心理的痛苦？",
            date: "2026-06-21",
            tags: ["改花刀", "自伤", "非自杀性自伤", "情绪调节", "青少年心理危机"],
            readTime: 14,
            featured: true
        },
        {
            id: 42,
            category: "心理学",
            fileName: "心理学/42/",
            title: "致家长：警惕小升初阶段儿童的心理健康危机",
            excerpt: "小升初（11-13岁）是儿童心理发展的关键敏感期，也是CPTSD和自伤行为的高发期。",
            date: "2026-06-21",
            tags: ["小升初", "儿童心理健康", "家长教育", "青春期", "亲子沟通"],
            readTime: 17,
            featured: true
        },
        {
            id: 43,
            category: "心理学",
            fileName: "心理学/43/",
            title: '"脑控组织"现象——当精神疾病被误解为超自然力量',
            excerpt: "当精神疾病被误解为超自然力量——从'脑控组织'看被害妄想和思维被控制感的精神医学本质。",
            date: "2026-06-21",
            tags: ["脑控组织", "被害妄想", "精神分裂症", "妄想症", "思维被控制"],
            readTime: 15,
            featured: true
        },
        {
            id: 44,
            category: "心理学",
            fileName: "心理学/44/",
            title: "被害妄想症专题：当整个世界都在与你作对",
            excerpt: "从日常多疑到临床被害妄想——这条界线在哪？当怀疑变成不可动摇的信念时会发生什么。",
            date: "2026-06-21",
            tags: ["被害妄想症", "妄想性障碍", "精神分裂症", "精神病学", "偏执型人格"],
            readTime: 16,
            featured: true
        },
        {
            id: 45,
            category: "心理学",
            fileName: "心理学/45/",
            title: "微表情心理学：脸上藏不住的0.04秒真相",
            excerpt: "从保罗·艾克曼的奠基研究到美剧《别对我说谎》——微表情真的能准确揭示真实情绪吗？",
            date: "2026-06-21",
            tags: ["微表情", "面部表情", "保罗·艾克曼", "情绪识别", "非语言沟通"],
            readTime: 14,
            featured: true
        },
        {
            id: 46,
            category: "心理学",
            fileName: "心理学/46/",
            title: "如何判断一个人是否在说谎？——以及我为什么走上了心理学的道路",
            excerpt: "从科学的角度拆解读谎的真相——以及本系列最后一篇文章中，分享对心理学产生浓厚兴趣的个人故事与感悟。",
            date: "2026-06-21",
            tags: ["测谎", "说谎心理学", "行为分析", "个人感悟", "心理学入门"],
            readTime: 18,
            featured: true
        },
        ];
        return raw.sort(function(a, b) { return a.id - b.id; });
    })(),
    // ██ 辅助方法 ██
    getArticleById: function(id) {
        return this.articles.find(function(a) { return a.id === id; });
    },
    getAdjacentArticles: function(id) {
        var idx = this.articles.findIndex(function(a) { return a.id === id; });
        if (idx === -1) return { prev: null, next: null };
        return {
            prev: idx > 0 ? this.articles[idx - 1] : null,
            next: idx < this.articles.length - 1 ? this.articles[idx + 1] : null
        };
    },
    getSortedArticles: function() {
        return this.articles.slice().sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });
    },
    getFeaturedArticles: function(excludeId, limit) {
        if (limit === undefined) limit = 3;
        return this.articles
            .filter(function(a) { return a.id !== excludeId && a.featured; })
            .slice(0, limit);
    }
};
