// wiki-data.js — 百科词条数据源（内联版）
// 内容编写组：编辑 wiki/data.json 后，需同步更新下方 EMBEDDED_DATA
// 使用内联数据以避免 file:// 协议下的 CORS 限制

(function() {
    'use strict';

    // ========== 内联数据（来源于 wiki/data.json） ==========
    // 注意：编辑 wiki/data.json 后请同步更新此部分
    var EMBEDDED_DATA = {"terms":{"utau":{"id":"utau","name":"UTAU","aliases":["UTAU音源","utau"],"category":"技术","image":"","summary":"一款免费的歌声合成软件，允许用户使用自己录制的音源进行歌声合成。","content":"<p><strong>UTAU</strong>（通常写作\"ウタウ\"）是一款由日本开发者飴屋／菖蒲（Ametama／Shoubu）开发的免费歌声合成软件。与商业软件VOCALOID不同，UTAU完全免费且开放，任何人都可以录制自己的音源供他人使用。</p>\n<h3>主要特点</h3>\n<ul>\n<li><strong>免费使用</strong>：软件本身完全免费，大多数音源也是免费发布的</li>\n<li><strong>自定义音源</strong>：用户可以录制自己的声音制作成音源</li>\n<li><strong>多种调音参数</strong>：支持音高、音量、颤音、辅音速度等多种参数调节</li>\n<li><strong>活跃社区</strong>：拥有庞大的用户社区和丰富的音源资源</li>\n</ul>\n<h3>相关工具</h3>\n<ul>\n<li>UTAU本身（Windows平台）</li>\n<li>OpenUTAU（跨平台替代品）</li>\n<li>dashichang-to-UTAU（大市唱转UTAU格式工具）</li>\n</ul>","relatedTerms":["vocaloid","openutau"],"externalLinks":[{"title":"UTAU 官方网站","url":"http://utau2008.web.fc2.com/"},{"title":"OpenUTAU GitHub","url":"https://github.com/stakira/OpenUtau"}],"updatedAt":"2026-06-10"},"vocaloid":{"id":"vocaloid","name":"VOCALOID","aliases":["V家","Vocaloid"],"category":"技术","image":"","summary":"由雅马哈开发的商业歌声合成技术，代表产品包括初音未来、镜音铃等虚拟歌姬。","content":"<p><strong>VOCALOID</strong>（ボーカロイド）是由日本雅马哈公司开发的商业歌声合成技术。用户可以通过输入歌词和旋律来合成歌声，广泛应用于音乐制作领域。</p>\n<h3>知名角色</h3>\n<ul>\n<li><strong>初音未来</strong>（Hatsune Miku）：Crypton社开发的虚拟歌姬，VOCALOID最知名的角色</li>\n<li><strong>镜音铃·连</strong>（Kagamine Rin/Len）：Crypton社开发的双子音源</li>\n<li><strong>巡音流歌</strong>（Megurine Luka）：Crypton社开发的双语音源</li>\n</ul>","relatedTerms":["utau"],"externalLinks":[{"title":"VOCALOID 官方网站","url":"https://www.vocaloid.com/"}],"updatedAt":"2026-06-10"},"unity":{"id":"unity","name":"Unity","aliases":["unity","Unity引擎"],"category":"技术","image":"","summary":"跨平台游戏引擎，广泛用于2D/3D游戏和应用开发。","content":"<p><strong>Unity</strong> 是由Unity Technologies开发的跨平台游戏引擎。它支持2D和3D游戏开发，拥有强大的编辑器、物理系统、光照系统和资源商店，是全球最受欢迎的游戏引擎之一。</p>\n<h3>主要功能</h3>\n<ul>\n<li>跨平台发布（Windows/macOS/iOS/Android/Web等）</li>\n<li>可视化编辑器</li>\n<li>强大的粒子系统和光照系统</li>\n<li>Asset Store资源商店</li>\n<li>支持C#脚本编程</li>\n</ul>","relatedTerms":["renpy"],"externalLinks":[],"updatedAt":"2026-06-10"},"renpy":{"id":"renpy","name":"Ren'Py","aliases":["RenPy","renpy","RenPy引擎"],"category":"技术","image":"","summary":"基于Python的视觉小说引擎，广泛用于制作AVG/视觉小说类游戏。","content":"<p><strong>Ren'Py</strong>（レンパイ）是一个基于Python的开源视觉小说引擎。它让创作者可以轻松制作视觉小说和恋爱模拟游戏，而无需深厚的编程知识。</p>\n<h3>主要特点</h3>\n<ul>\n<li>基于Python脚本语言</li>\n<li>支持分支剧情</li>\n<li>内置存档系统</li>\n<li>支持立绘切换、角色语音</li>\n<li>跨平台支持</li>\n</ul>","relatedTerms":["unity","python"],"externalLinks":[{"title":"Ren'Py 官方网站","url":"https://www.renpy.org/"}],"updatedAt":"2026-06-10"},"python":{"id":"python","name":"Python","aliases":["python","Python语言","Python3"],"category":"技术","image":"","summary":"一种解释型、高级编程语言，以简洁易读的语法著称。","content":"<p><strong>Python</strong> 是一种解释型、面向对象的高级编程语言，由Guido van Rossum于1991年创建。以简洁易读的语法和\"电池内置\"的理念著称。</p>\n<h3>主要应用领域</h3>\n<ul>\n<li>Web开发（Django/Flask）</li>\n<li>数据科学和机器学习</li>\n<li>自动化脚本</li>\n<li>AI和深度学习</li>\n<li>桌面应用</li>\n</ul>","relatedTerms":["mediapipe","paddleocr"],"externalLinks":[{"title":"Python 官方网站","url":"https://www.python.org/"}],"updatedAt":"2026-06-10"},"mediapipe":{"id":"mediapipe","name":"MediaPipe","aliases":["mediapipe","MediaPipe框架"],"category":"技术","image":"","summary":"Google开发的开源跨平台机器学习框架，专注于实时多媒体处理。","content":"<p><strong>MediaPipe</strong> 是Google开发的开源跨平台机器学习框架，专门用于构建实时多媒体处理应用。它提供了人体姿态估计、手势识别、面部网格检测、目标检测等多种预训练模型。</p>\n<h3>核心功能</h3>\n<ul>\n<li>人体姿态估计（Pose Landmarker）</li>\n<li>手势识别（Hand Landmarker）</li>\n<li>面部网格（Face Landmarker）</li>\n<li>目标检测（Object Detector）</li>\n</ul>","relatedTerms":["python"],"externalLinks":[{"title":"MediaPipe 官方文档","url":"https://developers.google.com/mediapipe"}],"updatedAt":"2026-06-10"},"paddleocr":{"id":"paddleocr","name":"PaddleOCR","aliases":["paddleocr","PaddleOCR"],"category":"技术","image":"","summary":"百度基于PaddlePaddle深度学习框架开发的OCR工具库。","content":"<p><strong>PaddleOCR</strong> 是百度基于PaddlePaddle（飞桨）深度学习框架开发的OCR（光学字符识别）工具库。支持多语言识别，包括中文、英文、日文等。</p>\n<h3>主要特点</h3>\n<ul>\n<li>高精度中文识别</li>\n<li>支持多种语言</li>\n<li>轻量级模型</li>\n<li>支持端到端训练</li>\n</ul>","relatedTerms":["python"],"externalLinks":[],"updatedAt":"2026-06-10"},"openutau":{"id":"openutau","name":"OpenUTAU","aliases":["OpenUtau","openutau"],"category":"技术","image":"","summary":"UTAU的跨平台开源替代品，支持Windows、macOS和Linux。","content":"<p><strong>OpenUTAU</strong> 是UTAU的跨平台开源替代品，由社区开发。它支持Windows、macOS和Linux，让更多用户可以使用UTAU音源进行创作。</p>","relatedTerms":["utau"],"externalLinks":[{"title":"OpenUTAU GitHub","url":"https://github.com/stakira/OpenUtau"}],"updatedAt":"2026-06-10"}},"characters":{}};

    var data = EMBEDDED_DATA;

    // ====== 工具方法 ======
    function getAllTerms() {
        var terms = [];
        if (!data || !data.terms) return terms;
        for (var key in data.terms) {
            if (data.terms.hasOwnProperty(key)) {
                var t = data.terms[key];
                t._id = key;
                terms.push(t);
            }
        }
        return terms.sort(function(a, b) { return a.name.localeCompare(b.name, 'zh'); });
    }

    function getTermById(id) { return data && data.terms ? data.terms[id] || null : null; }

    function getTermByName(name) {
        if (!data || !data.terms) return null;
        for (var key in data.terms) {
            if (!data.terms.hasOwnProperty(key)) continue;
            var term = data.terms[key];
            if (term.name === name) return term;
            if (term.aliases && term.aliases.indexOf(name) !== -1) return term;
        }
        return null;
    }

    function getTermsByCategory(category) {
        return getAllTerms().filter(function(t) { return t.category === category; });
    }

    function searchTerms(query) {
        if (!query) return getAllTerms();
        query = query.toLowerCase();
        return getAllTerms().filter(function(term) {
            if (term.name.toLowerCase().indexOf(query) !== -1) return true;
            if (term.summary && term.summary.toLowerCase().indexOf(query) !== -1) return true;
            if (term.aliases) {
                for (var i = 0; i < term.aliases.length; i++) {
                    if (term.aliases[i].toLowerCase().indexOf(query) !== -1) return true;
                }
            }
            return false;
        });
    }

    function getCategories() {
        var cats = {};
        if (data && data.terms) {
            for (var key in data.terms) {
                if (data.terms.hasOwnProperty(key)) {
                    var cat = data.terms[key].category || '其他';
                    if (!cats[cat]) cats[cat] = 0;
                    cats[cat]++;
                }
            }
        }
        return cats;
    }

    function getAllCharacters() {
        var chars = [];
        if (!data || !data.characters) return chars;
        for (var key in data.characters) {
            if (data.characters.hasOwnProperty(key)) {
                var c = data.characters[key];
                c._id = key;
                chars.push(c);
            }
        }
        return chars.sort(function(a, b) { return a.name.localeCompare(b.name, 'zh'); });
    }

    function getCharacterById(id) { return data && data.characters ? data.characters[id] || null : null; }

    function getCharacterByName(name) {
        if (!data || !data.characters) return null;
        for (var key in data.characters) {
            if (!data.characters.hasOwnProperty(key)) continue;
            var ch = data.characters[key];
            if (ch.name === name) return ch;
            if (ch.aliases && ch.aliases.indexOf(name) !== -1) return ch;
        }
        return null;
    }

    function getCharactersByCategory(category) {
        return getAllCharacters().filter(function(c) { return c.category === category; });
    }

    function getCharacterCategories() {
        var cats = {};
        if (data && data.characters) {
            for (var key in data.characters) {
                if (data.characters.hasOwnProperty(key)) {
                    var cat = data.characters[key].category || '其他';
                    if (!cats[cat]) cats[cat] = 0;
                    cats[cat]++;
                }
            }
        }
        return cats;
    }

    function getAllKeywords() {
        var keywords = [];
        if (!data) return keywords;
        // 词条关键词
        if (data.terms) {
            for (var key in data.terms) {
                if (!data.terms.hasOwnProperty(key)) continue;
                var term = data.terms[key];
                keywords.push({ keyword: term.name, targetId: term.id, targetType: 'term', priority: term.name.length });
                if (term.aliases) {
                    for (var i = 0; i < term.aliases.length; i++) {
                        if (term.aliases[i] !== term.name) {
                            keywords.push({ keyword: term.aliases[i], targetId: term.id, targetType: 'term', priority: term.aliases[i].length });
                        }
                    }
                }
            }
        }
        // 角色关键词
        if (data.characters) {
            for (var key in data.characters) {
                if (!data.characters.hasOwnProperty(key)) continue;
                var ch = data.characters[key];
                keywords.push({ keyword: ch.name, targetId: ch.id, targetType: 'character', priority: ch.name.length });
                if (ch.aliases) {
                    for (var i = 0; i < ch.aliases.length; i++) {
                        if (ch.aliases[i] !== ch.name) {
                            keywords.push({ keyword: ch.aliases[i], targetId: ch.id, targetType: 'character', priority: ch.aliases[i].length });
                        }
                    }
                }
            }
        }
        return keywords.sort(function(a, b) { return b.priority - a.priority; });
    }

    // 构建 wikiData 对象
    // ========== 构建 window.wikiData 对象 ==========
    function buildWikiData() {
        var wd = {
            // 直接暴露原始数据
            get terms() { return data && data.terms ? data.terms : {}; },
            get characters() { return data && data.characters ? data.characters : {}; },
            getAllTerms: getAllTerms,
            getTermById: getTermById,
            getTermByName: getTermByName,
            getTermsByCategory: getTermsByCategory,
            searchTerms: searchTerms,
            getCategories: getCategories,
            getAllCharacters: getAllCharacters,
            getCharacterById: getCharacterById,
            getCharacterByName: getCharacterByName,
            getCharactersByCategory: getCharactersByCategory,
            getCharacterCategories: getCharacterCategories,
            getAllKeywords: getAllKeywords,
            isReady: function() { return true; }
        };
        window.wikiData = wd;
    }

    // 同步初始化（无需等待 XHR，已在 file:// 协议下正常工作）
    buildWikiData();

    // 触发 ready 事件以兼容旧代码
    document.addEventListener('DOMContentLoaded', function() {
        var event = new CustomEvent('wikidata:ready', { detail: { data: data } });
        document.dispatchEvent(event);
    });

    // 对外 API 兼容
    window.wikiDataReady = function(callback) {
        callback(data);
    };

})();
