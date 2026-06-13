// wiki-data.js — 百科词条数据源（加载器）
// 内容编写组：编辑 wiki/data.json 即可
// 数据加载完成后触发 'wikidata:ready' 事件

(function() {
    'use strict';

    var JSON_URL = 'wiki/data.json';
    var loaded = false;
    var data = null;
    var callbacks = [];

    function getPath() {
        // 根据页面位置推导 JSON 路径
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].src || '';
            if (src.indexOf('wiki-data.js') !== -1) {
                // wiki-data.js 可能位于根目录或子目录
                var base = src.substring(0, src.lastIndexOf('/') + 1);
                return base + 'wiki/data.json';
            }
        }
        return JSON_URL;
    }

    function fetchData() {
        if (loaded) return;
        var url = getPath();

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4) return;
            if (xhr.status === 200) {
                try {
                    data = JSON.parse(xhr.responseText);
                    loaded = true;
                    buildWikiData();
                    fireReady();
                } catch(e) {
                    console.warn('[wiki-data] JSON 解析失败:', e);
                }
            } else {
                console.warn('[wiki-data] 加载失败:', xhr.status, url);
            }
        };
        xhr.send();
    }

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
            // 状态
            isReady: function() { return loaded; }
        };
        window.wikiData = wd;
    }

    function fireReady() {
        var event = new CustomEvent('wikidata:ready', { detail: { data: data } });
        document.dispatchEvent(event);
        // 执行待处理回调
        for (var i = 0; i < callbacks.length; i++) callbacks[i](data);
        callbacks = [];
    }

    // 对外 API：等待数据加载完成
    window.wikiDataReady = function(callback) {
        if (loaded) {
            callback(data);
        } else {
            callbacks.push(callback);
        }
    };

    // 开始加载
    fetchData();

})();
