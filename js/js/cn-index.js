window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TR4FT7JPDZ');

/* ================================================================
   数据来源：cn/name.js（外部 JS 文件，直接编辑即可）
   数据结构见 name.js 中的 POET_DATA 对象
=============================================================== */

var DYNASTY_ORDER = [];
var POETS = [];

// --- 从 name.js 全局变量加载数据 ---
(function initData() {
    var data = window.POET_DATA;
    if (data) {
        DYNASTY_ORDER = data.dynasties || [];
        POETS = data.poets || [];
        initApp();
    } else {
        document.getElementById('poetGrid').innerHTML =
            '<div class="wiki-empty"><span class="empty-icon">⚠️</span><p>数据加载失败，请检查 name.js 文件</p></div>';
    }
})();

function initApp() {
    buildTabs();
    bindEvents();
    renderByCategory('all');
    initContribute();
}

// --- 生成朝代选项卡 ---
function buildTabs() {
    var nav = document.getElementById('categoryNav');
    nav.innerHTML = '';
    for (var i = 0; i < DYNASTY_ORDER.length; i++) {
        var d = DYNASTY_ORDER[i];
        var btn = document.createElement('button');
        btn.className = 'category-btn' + (d.id === 'all' ? ' active' : '');
        btn.setAttribute('data-cat', d.id);
        btn.textContent = d.name;
        btn.addEventListener('click', function(e) {
            var cat = e.target.getAttribute('data-cat');
            renderByCategory(cat);
            var allBtns = nav.querySelectorAll('.category-btn');
            for (var j = 0; j < allBtns.length; j++) allBtns[j].classList.remove('active');
            e.target.classList.add('active');
        });
        nav.appendChild(btn);
    }
}

// --- 构建一张诗人卡片 ---
function buildCard(p) {
    var card = document.createElement('div');

    if (p._placeholder) {
        card.className = 'poet-card placeholder';
        card.innerHTML = '<div class="placeholder-text"><span class="icon">📜</span>' + p.name + '</div>';
        return card;
    }

    card.className = 'poet-card';

    var dynastyTag = document.createElement('span');
    dynastyTag.className = 'poet-dynasty-tag';
    var dynastyName = p.dynasty;
    for (var i = 0; i < DYNASTY_ORDER.length; i++) {
        if (DYNASTY_ORDER[i].id === p.dynasty) { dynastyName = DYNASTY_ORDER[i].name; break; }
    }
    dynastyTag.textContent = dynastyName;

    var nameEl = document.createElement('div');
    nameEl.className = 'poet-name';
    nameEl.textContent = p.name;

    var yearsEl = document.createElement('div');
    yearsEl.className = 'poet-years';
    yearsEl.textContent = p.years || '';

    var worksLabel = document.createElement('div');
    worksLabel.className = 'poet-works-label';
    worksLabel.textContent = '代表作';

    var worksEl = document.createElement('div');
    worksEl.className = 'poet-works';
    worksEl.textContent = p.works || '';

    var descEl = document.createElement('div');
    descEl.className = 'poet-desc';
    descEl.textContent = p.desc || '';

    var tagsEl = document.createElement('div');
    tagsEl.className = 'poet-tags';
    if (p.tags) {
        for (var j = 0; j < p.tags.length; j++) {
            var tag = document.createElement('span');
            tag.className = 'poet-tag';
            tag.textContent = p.tags[j];
            tagsEl.appendChild(tag);
        }
    }

    card.appendChild(dynastyTag);
    card.appendChild(nameEl);
    card.appendChild(yearsEl);
    card.appendChild(worksLabel);
    card.appendChild(worksEl);
    card.appendChild(descEl);
    card.appendChild(tagsEl);
    return card;
}

// --- 渲染诗人列表 ---
function renderPoets(poets) {
    var grid = document.getElementById('poetGrid');
    grid.innerHTML = '';
    if (poets.length === 0) {
        grid.innerHTML = '<div class="wiki-empty"><span class="empty-icon">📭</span><p>没有找到匹配的诗人</p></div>';
        return;
    }
    for (var i = 0; i < poets.length; i++) {
        grid.appendChild(buildCard(poets[i]));
    }
}

// --- 按朝代筛选 ---
function renderByCategory(cat) {
    var filtered;
    if (cat === 'all') {
        filtered = POETS.slice();
    } else {
        filtered = [];
        for (var i = 0; i < POETS.length; i++) {
            if (POETS[i].dynasty === cat) filtered.push(POETS[i]);
        }
    }
    var titleText = cat === 'all' ? '全部诗人' : '';
    for (var j = 0; j < DYNASTY_ORDER.length; j++) {
        if (DYNASTY_ORDER[j].id === cat) { titleText = DYNASTY_ORDER[j].name + ' · 诗人'; break; }
    }
    document.getElementById('sectionTitleText').textContent = titleText;
    document.getElementById('catCount').textContent = filtered.length + ' 位';
    renderPoets(filtered);
}

// --- 搜索 ---
function searchPoets(query) {
    if (!query || query.trim() === '') {
        var activeBtn = document.getElementById('categoryNav').querySelector('.category-btn.active');
        var cat = activeBtn ? activeBtn.getAttribute('data-cat') : 'all';
        renderByCategory(cat);
        return;
    }
    var q = query.trim().toLowerCase();
    var results = [];
    for (var i = 0; i < POETS.length; i++) {
        var p = POETS[i];
        if (p._placeholder) continue;
        if (
            (p.name && p.name.indexOf(q) !== -1) ||
            (p.works && p.works.indexOf(q) !== -1) ||
            (p.desc && p.desc.indexOf(q) !== -1) ||
            (p.dynasty && p.dynasty.indexOf(q) !== -1)
        ) {
            results.push(p);
        }
    }
    document.getElementById('sectionTitleText').textContent = '搜索结果: ' + query;
    document.getElementById('catCount').textContent = results.length + ' 位';
    renderPoets(results);
}

// --- 事件绑定 ---
function bindEvents() {
    document.getElementById('searchBtn').addEventListener('click', function() {
        searchPoets(document.getElementById('searchInput').value);
    });
    document.getElementById('searchInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') searchPoets(document.getElementById('searchInput').value);
    });
    var btn = document.getElementById('backToTop');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 400) btn.classList.add('show');
        else btn.classList.remove('show');
    }, { passive: true });
    btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}