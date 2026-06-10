// wiki-data.js — 百科词条数据源
// 内容编写组：在此文件追加词条条目
// 格式说明：
//   id: 唯一标识（建议英文或拼音）
//   name: 词条名（用于匹配文章内容）
//   aliases: 别名数组（也参与文章匹配）
//   category: 分类（技术/文化/人物/工具/概念/作品/其他）
//   summary: 简短释义（百科列表页展示）
//   content: 完整释义（支持HTML标签）
//   relatedTerms: 相关词条ID数组
//   externalLinks: 外部链接 {title, url}[]
//   updatedAt: 最后更新日期
//
// 角色系统：characters 对象，字段说明：
//   id: 唯一标识
//   name: 角色名
//   aliases: 别名数组
//   avatar: 头像URL（空字符串则显示默认图标）
//   category: 角色类型（VTuber/游戏角色/其他）
//   attributes: 属性对象 {键: 值, ...}
//   description: 角色描述HTML
//   relatedTerms: 相关词条ID数组
//   relatedCharacters: 相关角色ID数组
//   externalLinks: 外部链接
//   updatedAt: 最后更新日期

window.wikiData = {
    terms: {
        // ======== 技术类 ========
        "utau": {
            id: "utau",
            name: "UTAU",
            aliases: ["UTAU音源", "utau"],
            category: "技术",
            image: "",
            summary: "一款免费的歌声合成软件，允许用户使用自己录制的音源进行歌声合成。",
            content: `<p><strong>UTAU</strong>（通常写作"ウタウ"）是一款由日本开发者飴屋／菖蒲（Ametama／Shoubu）开发的免费歌声合成软件。与商业软件VOCALOID不同，UTAU完全免费且开放，任何人都可以录制自己的音源供他人使用。</p>
<h3>主要特点</h3>
<ul>
<li><strong>免费使用</strong>：软件本身完全免费，大多数音源也是免费发布的</li>
<li><strong>自定义音源</strong>：用户可以录制自己的声音制作成音源</li>
<li><strong>多种调音参数</strong>：支持音高、音量、颤音、辅音速度等多种参数调节</li>
<li><strong>活跃社区</strong>：拥有庞大的用户社区和丰富的音源资源</li>
</ul>
<h3>相关工具</h3>
<ul>
<li>UTAU本身（Windows平台）</li>
<li>OpenUTAU（跨平台替代品）</li>
<li>dashichang-to-UTAU（大市唱转UTAU格式工具）</li>
</ul>`,
            relatedTerms: ["vocaloid", "dashichang", "openutau"],
            externalLinks: [
                { title: "UTAU 官方网站", url: "http://utau2008.web.fc2.com/" },
                { title: "OpenUTAU GitHub", url: "https://github.com/stakira/OpenUtau" }
            ],
            updatedAt: "2026-06-10"
        },

        "vocaloid": {
            id: "vocaloid",
            name: "VOCALOID",
            aliases: ["V家", "Vocaloid"],
            category: "技术",
            image: "",
            summary: "由雅马哈开发的商业歌声合成技术，代表产品包括初音未来、镜音铃等虚拟歌姬。",
            content: `<p><strong>VOCALOID</strong>（ボーカロイド）是由日本雅马哈公司开发的商业歌声合成技术。用户可以通过输入歌词和旋律来合成歌声，广泛应用于音乐制作领域。</p>
<h3>知名角色</h3>
<ul>
<li><strong>初音未来</strong>（Hatsune Miku）：Crypton社开发的虚拟歌姬，VOCALOID最知名的角色</li>
<li><strong>镜音铃·连</strong>（Kagamine Rin/Len）：Crypton社开发的双子音源</li>
<li><strong>巡音流歌</strong>（Megurine Luka）：Crypton社开发的双语音源</li>
</ul>`,
            relatedTerms: ["utau", "虚拟歌姬"],
            externalLinks: [
                { title: "VOCALOID 官方网站", url: "https://www.vocaloid.com/" }
            ],
            updatedAt: "2026-06-10"
        },

        "unity": {
            id: "unity",
            name: "Unity",
            aliases: ["unity", "Unity引擎"],
            category: "技术",
            image: "",
            summary: "跨平台游戏引擎，广泛用于2D/3D游戏和应用开发。",
            content: `<p><strong>Unity</strong> 是由Unity Technologies开发的跨平台游戏引擎。它支持2D和3D游戏开发，拥有强大的编辑器、物理系统、光照系统和资源商店，是全球最受欢迎的游戏引擎之一。</p>
<h3>主要功能</h3>
<ul>
<li>跨平台发布（Windows/macOS/iOS/Android/Web等）</li>
<li>可视化编辑器</li>
<li>强大的粒子系统和光照系统</li>
<li>Asset Store资源商店</li>
<li>支持C#脚本编程</li>
</ul>`,
            relatedTerms: ["renpy"],
            externalLinks: [],
            updatedAt: "2026-06-10"
        },

        "renpy": {
            id: "renpy",
            name: "Ren'Py",
            aliases: ["RenPy", "renpy", "RenPy引擎"],
            category: "技术",
            image: "",
            summary: "基于Python的视觉小说引擎，广泛用于制作AVG/视觉小说类游戏。",
            content: `<p><strong>Ren'Py</strong>（レンパイ）是一个基于Python的开源视觉小说引擎。它让创作者可以轻松制作视觉小说和恋爱模拟游戏，而无需深厚的编程知识。</p>
<h3>主要特点</h3>
<ul>
<li>基于Python脚本语言</li>
<li>支持分支剧情</li>
<li>内置存档系统</li>
<li>支持立绘切换、角色语音</li>
<li>跨平台支持</li>
</ul>`,
            relatedTerms: ["unity", "python"],
            externalLinks: [
                { title: "Ren'Py 官方网站", url: "https://www.renpy.org/" }
            ],
            updatedAt: "2026-06-10"
        },

        "python": {
            id: "python",
            name: "Python",
            aliases: ["python", "Python语言", "Python3"],
            category: "技术",
            image: "",
            summary: "一种解释型、高级编程语言，以简洁易读的语法著称。",
            content: `<p><strong>Python</strong> 是一种解释型、面向对象的高级编程语言，由Guido van Rossum于1991年创建。以简洁易读的语法和"电池内置"的理念著称。</p>
<h3>主要应用领域</h3>
<ul>
<li>Web开发（Django/Flask）</li>
<li>数据科学和机器学习</li>
<li>自动化脚本</li>
<li>AI和深度学习</li>
<li>桌面应用</li>
</ul>`,
            relatedTerms: ["mediapipe", "paddleocr"],
            externalLinks: [
                { title: "Python 官方网站", url: "https://www.python.org/" }
            ],
            updatedAt: "2026-06-10"
        },

        "mediapipe": {
            id: "mediapipe",
            name: "MediaPipe",
            aliases: ["mediapipe", "MediaPipe框架"],
            category: "技术",
            image: "",
            summary: "Google开发的开源跨平台机器学习框架，专注于实时多媒体处理。",
            content: `<p><strong>MediaPipe</strong> 是Google开发的开源跨平台机器学习框架，专门用于构建实时多媒体处理应用。它提供了人体姿态估计、手势识别、面部网格检测、目标检测等多种预训练模型。</p>
<h3>核心功能</h3>
<ul>
<li>人体姿态估计（Pose Landmarker）</li>
<li>手势识别（Hand Landmarker）</li>
<li>面部网格（Face Landmarker）</li>
<li>目标检测（Object Detector）</li>
</ul>`,
            relatedTerms: ["python"],
            externalLinks: [
                { title: "MediaPipe 官方文档", url: "https://developers.google.com/mediapipe" }
            ],
            updatedAt: "2026-06-10"
        },

        "paddleocr": {
            id: "paddleocr",
            name: "PaddleOCR",
            aliases: ["paddleocr", "PaddleOCR"],
            category: "技术",
            image: "",
            summary: "百度基于PaddlePaddle深度学习框架开发的OCR工具库。",
            content: `<p><strong>PaddleOCR</strong> 是百度基于PaddlePaddle（飞桨）深度学习框架开发的OCR（光学字符识别）工具库。支持多语言识别，包括中文、英文、日文等。</p>
<h3>主要特点</h3>
<ul>
<li>高精度中文识别</li>
<li>支持多种语言</li>
<li>轻量级模型</li>
<li>支持端到端训练</li>
</ul>`,
            relatedTerms: ["python"],
            externalLinks: [],
            updatedAt: "2026-06-10"
        },

        "openutau": {
            id: "openutau",
            name: "OpenUTAU",
            aliases: ["OpenUtau", "openutau"],
            category: "技术",
            image: "",
            summary: "UTAU的跨平台开源替代品，支持Windows、macOS和Linux。",
            content: `<p><strong>OpenUTAU</strong> 是UTAU的跨平台开源替代品，由社区开发。它支持Windows、macOS和Linux，让更多用户可以使用UTAU音源进行创作。</p>`,
            relatedTerms: ["utau"],
            externalLinks: [
                { title: "OpenUTAU GitHub", url: "https://github.com/stakira/OpenUtau" }
            ],
            updatedAt: "2026-06-10"
        }
    },

    // ======== 角色数据（角色系统模块）========
    // 访问方式：#/characters 查看角色列表，#/character/{id} 查看角色详情
    characters: {
        "taffy": {
            id: "taffy",
            name: "永雏塔菲",
            aliases: ["AceTaffy", "塔菲", "taffy", "AceTaffych"],
            avatar: "https://acetaffy.org/images/thumb/6/69/%E5%A4%B4%E5%83%8F.jpg/300px-%E5%A4%B4%E5%83%8F.jpg",
            category: "VTuber",
            attributes: {
                "生日": "8月12日",
                "身高": "155cm",
                "代表色": "浅蓝 #7EC8E3",
                "所属": "个人势",
                "活跃平台": "Bilibili、YouTube"
            },
            description: `<p><strong>永雏塔菲</strong>（AceTaffy）是活跃于Bilibili和YouTube的虚拟主播（VTuber），以可爱的声线、优秀的歌唱能力和亲和的性格受到粉丝喜爱。</p>
<h3>基本信息</h3>
<ul>
<li><strong>出道时间</strong>：2021年</li>
<li><strong>直播内容</strong>：歌唱、游戏、杂谈</li>
<li><strong>粉丝名称</strong>：雏草姬</li>
</ul>
<h3>代表特点</h3>
<ul>
<li>可爱的猫娘形象，代表色为浅蓝色</li>
<li>优秀的翻唱和原创歌曲表现</li>
<li>与粉丝互动频繁，亲和力极强</li>
<li>直播风格轻松有趣，常有惊喜环节</li>
</ul>`,
            relatedTerms: ["vtuber"],
            relatedCharacters: ["hanamine"],
            externalLinks: [
                { title: "Bilibili 直播间", url: "https://live.bilibili.com/22603245" },
                { title: "Bilibili 个人主页", url: "https://space.bilibili.com/1265680561/" },
                { title: "YouTube 频道", url: "https://www.youtube.com/@acetaffych.944/playlists" },
                { title: "永雏塔菲百科（acetaffy.org）", url: "https://acetaffy.org" }
            ],
            updatedAt: "2026-06-10"
        },
        "hanamine": {
            id: "hanamine",
            name: "真白花音",
            aliases: ["白菜", "花音", "Mashiro Kanon", "真白 花音"],
            avatar: "",
            category: "VTuber",
            attributes: {
                "生日": "未知",
                "身高": "未知",
                "代表色": "白色/粉色",
                "所属": "Bilibili个人势",
                "状态": "已毕业（2026年5月1日）"
            },
            description: `<p><strong>真白花音</strong>（Mashiro Kanon）是Bilibili平台活动的VTuber，以温柔可爱的性格和优秀的歌唱能力著称。粉丝爱称为"白菜"。</p>
<h3>重要时间线</h3>
<ul>
<li>出道时间：2023年</li>
<li>毕业公告：2026年4月17日</li>
<li>正式毕业：2026年5月1日</li>
</ul>
<p>她是本站作者最早关注的VTuber，也是B站第一日v（日常系VTuber）。虽然已经毕业，但她的直播回放和歌曲作品仍然值得欣赏。</p>`,
            relatedTerms: ["vtuber"],
            relatedCharacters: ["taffy"],
            externalLinks: [],
            updatedAt: "2026-06-10"
        }
    },

    // ======== 工具方法 ========

    // 获取所有词条（按名称排序）
    getAllTerms: function() {
        var terms = [];
        for (var key in this.terms) {
            if (this.terms.hasOwnProperty(key)) {
                terms.push(this.terms[key]);
            }
        }
        return terms.sort(function(a, b) {
            return a.name.localeCompare(b.name, 'zh');
        });
    },

    // 根据ID获取词条
    getTermById: function(id) {
        return this.terms[id] || null;
    },

    // 根据名称查找词条（精确匹配）
    getTermByName: function(name) {
        for (var key in this.terms) {
            if (this.terms.hasOwnProperty(key)) {
                var term = this.terms[key];
                if (term.name === name) return term;
                if (term.aliases && term.aliases.indexOf(name) !== -1) return term;
            }
        }
        return null;
    },

    // 获取某个分类下的所有词条
    getTermsByCategory: function(category) {
        var results = [];
        for (var key in this.terms) {
            if (this.terms.hasOwnProperty(key)) {
                var term = this.terms[key];
                if (term.category === category) {
                    results.push(term);
                }
            }
        }
        return results.sort(function(a, b) {
            return a.name.localeCompare(b.name, 'zh');
        });
    },

    // 搜索词条（模糊匹配名称和别名）
    searchTerms: function(query) {
        if (!query) return this.getAllTerms();
        query = query.toLowerCase();
        var results = [];
        for (var key in this.terms) {
            if (this.terms.hasOwnProperty(key)) {
                var term = this.terms[key];
                if (term.name.toLowerCase().indexOf(query) !== -1) {
                    results.push(term);
                    continue;
                }
                if (term.summary && term.summary.toLowerCase().indexOf(query) !== -1) {
                    results.push(term);
                    continue;
                }
                if (term.aliases) {
                    for (var i = 0; i < term.aliases.length; i++) {
                        if (term.aliases[i].toLowerCase().indexOf(query) !== -1) {
                            results.push(term);
                            break;
                        }
                    }
                }
            }
        }
        return results;
    },

    // 获取所有分类
    getCategories: function() {
        var cats = {};
        for (var key in this.terms) {
            if (this.terms.hasOwnProperty(key)) {
                var cat = this.terms[key].category;
                if (!cats[cat]) cats[cat] = 0;
                cats[cat]++;
            }
        }
        return cats;
    },

    // ======== 角色相关工具方法 ========

    // 获取所有角色（按名称排序）
    getAllCharacters: function() {
        var chars = [];
        for (var key in this.characters) {
            if (this.characters.hasOwnProperty(key)) {
                chars.push(this.characters[key]);
            }
        }
        return chars.sort(function(a, b) {
            return a.name.localeCompare(b.name, 'zh');
        });
    },

    // 根据ID获取角色
    getCharacterById: function(id) {
        return this.characters[id] || null;
    },

    // 根据名称查找角色
    getCharacterByName: function(name) {
        for (var key in this.characters) {
            if (this.characters.hasOwnProperty(key)) {
                var ch = this.characters[key];
                if (ch.name === name) return ch;
                if (ch.aliases && ch.aliases.indexOf(name) !== -1) return ch;
            }
        }
        return null;
    },

    // 获取某个分类下的所有角色
    getCharactersByCategory: function(category) {
        var results = [];
        for (var key in this.characters) {
            if (this.characters.hasOwnProperty(key)) {
                var ch = this.characters[key];
                if (ch.category === category) {
                    results.push(ch);
                }
            }
        }
        return results.sort(function(a, b) {
            return a.name.localeCompare(b.name, 'zh');
        });
    },

    // 获取所有角色分类
    getCharacterCategories: function() {
        var cats = {};
        for (var key in this.characters) {
            if (this.characters.hasOwnProperty(key)) {
                var cat = this.characters[key].category;
                if (!cats[cat]) cats[cat] = 0;
                cats[cat]++;
            }
        }
        return cats;
    },

    // ======== 关键词链接：支持词条+角色别名匹配 ========
    // 获取所有用于文章匹配的关键词列表（名称+别名）
    getAllKeywords: function() {
        var keywords = [];
        // 词条关键词
        for (var key in this.terms) {
            if (this.terms.hasOwnProperty(key)) {
                var term = this.terms[key];
                keywords.push({
                    keyword: term.name,
                    targetId: term.id,
                    targetType: 'term',
                    priority: term.name.length
                });
                if (term.aliases) {
                    for (var i = 0; i < term.aliases.length; i++) {
                        if (term.aliases[i] !== term.name) {
                            keywords.push({
                                keyword: term.aliases[i],
                                targetId: term.id,
                                targetType: 'term',
                                priority: term.aliases[i].length
                            });
                        }
                    }
                }
            }
        }
        // 角色别名也加入关键词
        for (var key in this.characters) {
            if (this.characters.hasOwnProperty(key)) {
                var ch = this.characters[key];
                keywords.push({
                    keyword: ch.name,
                    targetId: ch.id,
                    targetType: 'character',
                    priority: ch.name.length
                });
                if (ch.aliases) {
                    for (var i = 0; i < ch.aliases.length; i++) {
                        if (ch.aliases[i] !== ch.name) {
                            keywords.push({
                                keyword: ch.aliases[i],
                                targetId: ch.id,
                                targetType: 'character',
                                priority: ch.aliases[i].length
                            });
                        }
                    }
                }
            }
        }
        // 按长度降序排列（长词优先匹配，防止"UTAU"被"U"先匹配）
        return keywords.sort(function(a, b) {
            return b.priority - a.priority;
        });
    }
};
