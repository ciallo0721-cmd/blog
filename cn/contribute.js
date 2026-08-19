/* ================================================================
   contribute.js — 历代诗人百科 投稿&修复板块 外部脚本
   数据用纯 JS 数组，不依赖 JSON 文件
=============================================================== */

// ---- 修复记录（纯 JS 数组，手动维护） ----
var FIX_LOG = [];

// ---- 初始化投稿&修复板块 ----
function initContribute() {
    // 填充朝代下拉框
    var sel = document.getElementById('subDynasty');
    sel.innerHTML = '';
    for (var i = 0; i < DYNASTY_ORDER.length; i++) {
        if (DYNASTY_ORDER[i].id === 'all') continue;
        var opt = document.createElement('option');
        opt.value = DYNASTY_ORDER[i].id;
        opt.textContent = DYNASTY_ORDER[i].name + ' (' + DYNASTY_ORDER[i].years + ')';
        sel.appendChild(opt);
    }

    // Tab 切换
    var tabBtns = document.querySelectorAll('.contribute-tab-btn');
    for (var j = 0; j < tabBtns.length; j++) {
        tabBtns[j].addEventListener('click', function(e) {
            var target = e.target.getAttribute('data-tab');
            for (var k = 0; k < tabBtns.length; k++) {
                tabBtns[k].classList.remove('active');
            }
            e.target.classList.add('active');
            document.getElementById('tab-submit').classList.toggle('active', target === 'submit');
            document.getElementById('tab-fixes').classList.toggle('active', target === 'fixes');
        });
    }

    // 生成投稿
    document.getElementById('genSubmit').addEventListener('click', function() {
        var name = document.getElementById('subName').value.trim();
        var dynasty = document.getElementById('subDynasty').value;
        if (!name) { alert('请填写诗人姓名喵～'); return; }

        var dynastyName = dynasty;
        for (var d = 0; d < DYNASTY_ORDER.length; d++) {
            if (DYNASTY_ORDER[d].id === dynasty) { dynastyName = DYNASTY_ORDER[d].name; break; }
        }

        var years = document.getElementById('subYears').value.trim();
        var works = document.getElementById('subWorks').value.trim();
        var desc = document.getElementById('subDesc').value.trim();
        var tagsRaw = document.getElementById('subTags').value.trim();
        var author = document.getElementById('subAuthor').value.trim() || '匿名';

        // 构建邮件正文
        var text = '【诗人投稿】\n\n';
        text += '姓名：' + name + '\n';
        text += '朝代：' + dynastyName + '\n';
        if (years) text += '生卒年：' + years + '\n';
        if (works) text += '代表作：' + works + '\n';
        if (desc) text += '简介：' + desc + '\n';
        if (tagsRaw) text += '标签：' + tagsRaw + '\n';
        text += '投稿人：' + author + '\n';
        text += '\n--- 以下可直接复制到 name.js 的 poets 数组 ---\n';

        // 构建 name.js 条目
        var entry = '  { "name": "' + name + '", "dynasty": "' + dynasty + '"';
        if (years) entry += ', "years": "' + years + '"';
        if (works) entry += ', "works": "' + works + '"';
        if (desc) entry += ', "desc": "' + desc + '"';
        if (tagsRaw) {
            var tagsArr = tagsRaw.split(/[,，]/).map(function(t) { return t.trim(); }).filter(Boolean);
            var tagsStr = tagsArr.map(function(t) { return '"' + t + '"'; }).join(', ');
            entry += ', "tags": [' + tagsStr + ']';
        }
        entry += ' }';
        text += entry;

        // 直接打开邮件客户端
        var mailSubject = encodeURIComponent('[诗人投稿] ' + name + '（朝代：' + dynastyName + '）');
        var mailBody = encodeURIComponent(text);
        window.open('mailto:ciallo0721cmd@gmail.com?subject=' + mailSubject + '&body=' + mailBody, '_blank');
    });

    // 重置表单
    document.getElementById('resetForm').addEventListener('click', function() {
        document.getElementById('subName').value = '';
        document.getElementById('subDynasty').selectedIndex = 0;
        document.getElementById('subYears').value = '';
        document.getElementById('subWorks').value = '';
        document.getElementById('subDesc').value = '';
        document.getElementById('subTags').value = '';
        document.getElementById('subAuthor').value = '';
    });

    // 渲染修复记录
    renderFixLog();
}

// ---- 渲染修复记录 ----
function renderFixLog() {
    var container = document.getElementById('fixLog');
    if (!FIX_LOG || FIX_LOG.length === 0) {
        container.innerHTML =
            '<div class="fix-empty">' +
            '<span class="empty-icon">📭</span>' +
            '<p>暂无修复记录，欢迎提交修正喵～</p>' +
            '</div>';
        return;
    }
    var html = '';
    for (var i = 0; i < FIX_LOG.length; i++) {
        var f = FIX_LOG[i];
        html += '<div class="fix-entry">';
        html += '<span class="fix-entry-date">' + escHtml(f.date) + '</span>';
        html += '<div class="fix-entry-content">';
        html += '<span class="fix-title">' + escHtml(f.title);
        if (f.status === 'fixed') {
            html += '<span class="fix-status fixed">已修复</span>';
        } else {
            html += '<span class="fix-status pending">处理中</span>';
        }
        html += '</span>';
        if (f.detail) html += '<div class="fix-detail">' + escHtml(f.detail) + '</div>';
        if (f.author) html += '<div class="fix-author">贡献者：' + escHtml(f.author) + '</div>';
        html += '</div></div>';
    }
    container.innerHTML = html;
}

// ---- HTML 转义 ----
function escHtml(s) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(s));
    return div.innerHTML;
}
