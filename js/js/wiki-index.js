window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TR4FT7JPDZ');

(function() {
    'use strict';

    var currentCat = 'all';
    var data = null;

    // 同步获取数据（wiki-data.js 已内联数据，无需等待 XHR）
    if (window.wikiData && window.wikiData.isReady && window.wikiData.isReady()) {
        data = window.wikiData;
    }

    function getAllTerms() {
        var arr = [];
        for (var key in data.terms) {
            if (data.terms.hasOwnProperty(key)) {
                var t = data.terms[key];
                t._id = key;
                arr.push(t);
            }
        }
        arr.sort(function(a, b) { return a.name.localeCompare(b.name, 'zh'); });
        return arr;
    }

    function getCategories(items) {
        var cats = {};
        items.forEach(function(item) {
            var cat = item.category || '其他';
            if (!cats[cat]) cats[cat] = 0;
            cats[cat]++;
        });
        return cats;
    }

    function renderCategories(cats, active) {
        var nav = document.getElementById('categoryNav');
        var html = '<button class="category-btn' + (active === 'all' ? ' active' : '') + '" data-cat="all">全部</button>';
        var sortedCats = Object.keys(cats).sort();
        sortedCats.forEach(function(cat) {
            html += '<button class="category-btn' + (active === cat ? ' active' : '') + '" data-cat="' + cat + '">' + cat + ' (' + cats[cat] + ')</button>';
        });
        nav.innerHTML = html;

        // 绑定点击事件
        nav.querySelectorAll('.category-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                switchTab(this.getAttribute('data-cat'));
            });
        });
    }

    function renderGrid(items) {
        var grid = document.getElementById('wikiGrid');
        if (!items || items.length === 0) {
            grid.innerHTML = '<div class="wiki-empty"><span style="font-size:3rem;opacity:0.3;display:block;margin-bottom:16px;">📭</span>暂无内容</div>';
            return;
        }

        // 仅支持词条模式

        grid.innerHTML = '';
        items.forEach(function(item) {
            var card = document.createElement('a');
            var entryId = item._id;
            card.href = entryId + '/index.html';
            card.className = 'wiki-card';

            var content = '';
            content += '<div class="wiki-card-cat">' + (item.category || '其他') + '</div>';
            content += '<div class="wiki-card-title">' + item.name + '</div>';
            content += '<div class="wiki-card-summary">' + (item.summary || '') + '</div>';
            content += '<div class="wiki-card-footer"><span>' + (item.updatedAt || '') + '</span></div>';

            card.innerHTML = content;
            grid.appendChild(card);
        });
    }

    function switchTab(category) {
        currentCat = category || 'all';

        var items = getAllTerms();
        var cats = getCategories(items);

        // 更新分类导航
        renderCategories(cats, currentCat);

        // 过滤
        if (currentCat !== 'all') {
            items = items.filter(function(item) { return (item.category || '其他') === currentCat; });
        }

        // 更新标题
        var titleText = '百科词条';
        var subText = '记录和分享各种知识，从技术到文化。';
        if (currentCat !== 'all') {
            titleText += ' - ' + currentCat;
        }
        document.getElementById('pageTitle').textContent = titleText;
        document.getElementById('pageSubtitle').textContent = subText;
        document.getElementById('sectionTitleText').textContent = currentCat === 'all' ? '全部词条' : currentCat;
        document.getElementById('catCount').textContent = '（' + items.length + '）';

        // 渲染网格
        renderGrid(items);

        // 更新导航高亮
        document.getElementById('navTermsLink').className = 'active';
    }

    // 搜索
    function doSearch(query) {
        query = query.toLowerCase().trim();
        if (!query) {
            switchTab(currentCat);
            return;
        }

        var items = getAllTerms();
        var filtered = items.filter(function(item) {
            if (item.name.toLowerCase().indexOf(query) !== -1) return true;
            if (item.aliases) {
                for (var i = 0; i < item.aliases.length; i++) {
                    if (item.aliases[i].toLowerCase().indexOf(query) !== -1) return true;
                }
            }
            if (item.summary && item.summary.toLowerCase().indexOf(query) !== -1) return true;
            if (item.category && item.category.toLowerCase().indexOf(query) !== -1) return true;
            return false;
        });

        document.getElementById('sectionTitleText').textContent = '搜索结果';
        document.getElementById('catCount').textContent = '（' + filtered.length + '）';
        renderGrid(filtered);
    }

    // 初始化
    function init() {
        switchTab('all');

        // 搜索事件
        document.getElementById('searchBtn').addEventListener('click', function() {
            doSearch(document.getElementById('searchInput').value);
        });
        document.getElementById('searchInput').addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                doSearch(this.value);
            }
        });

        // 导航切换
        document.getElementById('navTermsLink').addEventListener('click', function(e) {
            e.preventDefault();
            switchTab('all');
            document.getElementById('searchInput').value = '';
        });
    }

    // 等待 wikiData 加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();