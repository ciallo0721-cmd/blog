// 用 node 运行此文件：node build.js
// 生成正确的 index.html 解码器

const fs = require('fs');

const css = `@font-face {
    font-family: 'MaokenAssortedSans';
    src: url('../../css/MaokenAssortedSans.ttf') format('truetype');
    font-weight: normal; font-style: normal;
}
:root {
    --bili-pink: #FB7299;
    --bili-blue: #00A1D6;
    --text-primary: #1D1D1F;
    --text-secondary: #515154;
    --shadow: 0 4px 12px rgba(0,0,0,0.08);
    --transition: all 0.3s ease;
}
* { margin:0; padding:0; box-sizing:border-box; }
body {
    font-family: 'MaokenAssortedSans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
    line-height: 1.6;
    color: var(--text-primary);
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
}
.nav {
    background: rgba(255,255,255,0.98);
    backdrop-filter: blur(20px);
    position: sticky; top:0; z-index:1000;
    box-shadow: 0 2px 20px rgba(0,0,0,0.1);
    border-bottom: 1px solid rgba(255,255,255,0.2);
}
.nav-inner { display:flex; justify-content:space-between; align-items:center; padding:15px 20px; max-width:1200px; margin:0 auto; }
.nav-logo { font-size:1.4rem; font-weight:700; color:var(--bili-pink); text-decoration:none; }
.nav-logo:hover { color:var(--bili-blue); }
.back-btn {
    background: linear-gradient(135deg, var(--bili-pink), var(--bili-blue));
    color:white; border:none; padding:8px 20px; border-radius:25px;
    font-size:0.95rem; font-weight:600; cursor:pointer; text-decoration:none;
    display:inline-flex; align-items:center; gap:6px;
    box-shadow: 0 4px 15px rgba(251,114,153,0.3); transition:var(--transition);
}
.back-btn:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(251,114,153,0.4); color:white; }
.loading-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; }
.spinner { width:40px; height:40px; border:3px solid rgba(251,114,153,0.2); border-top:3px solid var(--bili-pink); border-radius:50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.loading-wrap p { margin-top:16px; color:var(--bili-pink); font-size:14px; }
.article-page { max-width:1200px; margin:0 auto; padding:60px 20px; }
.article-card {
    background: rgba(255,255,255,0.95); backdrop-filter:blur(10px);
    border-radius:20px; box-shadow:var(--shadow); padding:50px;
    border:1px solid rgba(255,255,255,0.3); position:relative; overflow:hidden;
    animation: fadeIn 0.5s ease;
}
@keyframes fadeIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
.article-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:4px;
    background:linear-gradient(135deg, var(--bili-pink), var(--bili-blue));
}
.article-head { text-align:center; margin-bottom:40px; padding-bottom:30px; border-bottom:1px solid rgba(0,0,0,0.1); }
.article-num {
    display:inline-block; background:linear-gradient(135deg, var(--bili-pink), var(--bili-blue));
    color:white; padding:8px 20px; border-radius:20px; font-size:0.9rem; font-weight:600; margin-bottom:20px;
    box-shadow:0 4px 15px rgba(251,114,153,0.3);
}
.article-title { font-size:2.2rem; color:var(--text-primary); margin-bottom:20px; line-height:1.3; font-weight:700; }
.article-meta { display:flex; justify-content:center; align-items:center; gap:20px; flex-wrap:wrap; margin-bottom:25px; }
.article-date { color:var(--text-secondary); font-size:1rem; display:flex; align-items:center; gap:6px; }
.article-tags { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-top:15px; }
.article-tag {
    background:rgba(251,114,153,0.1); color:var(--bili-pink);
    padding:6px 15px; border-radius:15px; font-size:0.85rem; font-weight:500;
    border:1px solid rgba(251,114,153,0.2); transition:var(--transition);
}
.article-tag:hover { background:var(--bili-pink); color:white; transform:translateY(-2px); }
.article-body { font-size:1.05rem; line-height:1.8; color:var(--text-secondary); }
.article-body h1 {
    font-size:1.8rem; color:var(--text-primary); margin:32px 0 16px; font-weight:700;
    position:relative; padding-bottom:10px;
}
.article-body h1::after {
    content:''; position:absolute; bottom:0; left:0; width:60px; height:3px;
    background:linear-gradient(135deg, var(--bili-pink), var(--bili-blue)); border-radius:3px;
}
.article-body h2 {
    font-size:1.5rem; color:var(--text-primary); margin:28px 0 14px; font-weight:600;
    position:relative; padding-bottom:8px;
}
.article-body h2::after {
    content:''; position:absolute; bottom:0; left:0; width:50px; height:3px;
    background:linear-gradient(135deg, var(--bili-pink), var(--bili-blue)); border-radius:3px;
}
.article-body h3 { font-size:1.25rem; color:var(--text-primary); margin:24px 0 12px; font-weight:600; }
.article-body p { margin-bottom:18px; text-align:justify; }
.article-body a { color:var(--bili-blue); text-decoration:none; border-bottom:1px solid rgba(0,161,214,0.3); }
.article-body a:hover { border-bottom-color:var(--bili-blue); }
.article-body strong { color:var(--text-primary); font-weight:700; }
.article-body em { color:var(--bili-pink); font-style:italic; }
.article-body ul, .article-body ol { margin-left:25px; margin-bottom:20px; }
.article-body li { margin-bottom:8px; }
.article-body blockquote {
    border-left:4px solid var(--bili-pink); padding:20px 25px; margin:25px 0;
    background:rgba(251,114,153,0.05); border-radius:0 12px 12px 0;
    font-style:italic; color:var(--text-primary);
}
.article-body blockquote p { margin-bottom:10px; }
.article-body code {
    background:rgba(251,114,153,0.1); color:var(--bili-pink);
    padding:3px 8px; border-radius:4px; font-size:0.95rem;
    font-family:'Fira Code','Consolas',monospace;
}
.article-body pre {
    background:#1a1f2e; border-radius:12px; padding:20px; margin:20px 0;
    overflow-x:auto; position:relative; border:1px solid rgba(251,114,153,0.2);
}
.article-body pre code { background:none; color:#e0e0e0; padding:0; font-size:0.95rem; line-height:1.6; }
.alert { padding:16px 20px; border-radius:12px; margin:20px 0; border-left:4px solid; }
.alert-info { background:rgba(0,161,214,0.08); border-color:var(--bili-blue); color:#006680; }
.alert-success { background:rgba(0,200,100,0.08); border-color:#00c864; color:#006633; }
.alert-warning { background:rgba(255,180,0,0.08); border-color:#ffb400; color:#806000; }
.alert-danger { background:rgba(255,60,60,0.08); border-color:#ff3c3c; color:#800000; }
.alert strong { display:block; margin-bottom:6px; }
.btn { display:inline-block; padding:8px 22px; border-radius:25px; text-decoration:none; border:none; cursor:pointer; font-size:0.95rem; font-weight:600; margin:4px; transition:var(--transition); }
.btn-primary { background:linear-gradient(135deg, var(--bili-pink), var(--bili-blue)); color:white; box-shadow:0 4px 15px rgba(251,114,153,0.3); }
.btn-primary:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(251,114,153,0.4); color:white; }
.btn-secondary { background:rgba(0,0,0,0.06); color:var(--text-secondary); border:1px solid rgba(0,0,0,0.1); }
.btn-secondary:hover { background:rgba(0,0,0,0.1); color:var(--text-primary); }
.article-body table { width:100%; border-collapse:collapse; margin:20px 0; border-radius:12px; overflow:hidden; box-shadow:var(--shadow); }
.article-body th { background:linear-gradient(135deg, var(--bili-pink), var(--bili-blue)); color:white; padding:14px 18px; text-align:left; font-size:1rem; }
.article-body td { padding:12px 18px; border-bottom:1px solid rgba(0,0,0,0.06); }
.article-body tr:hover { background:rgba(251,114,153,0.05); }
.article-body hr { border:none; height:1px; background:linear-gradient(90deg, transparent, rgba(251,114,153,0.4), transparent); margin:36px 0; }
.err-page { text-align:center; padding:80px 20px; }
.err-page h1 { font-size:3em; color:var(--bili-pink); margin-bottom:16px; }
.err-page p { color:var(--text-secondary); margin-bottom:24px; }
.err-page code { background:rgba(251,114,153,0.15); padding:2px 6px; border-radius:4px; font-size:0.9rem; }`;

const js = `function init() {
  var app = document.getElementById('app');
  var path = window.location.pathname || '';
  var m = path.match(/\\/blog\\/(\\d+)/);
  if (!m) { showErr(app, '路径错误', 'URL 中找不到文章 ID。'); return; }
  var articleId = m[1];
  var blogUrl = './' + articleId + '.blog';
  var xhr = new XMLHttpRequest();
  xhr.open('GET', blogUrl, true);
  xhr.onload = function() {
    if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) {
      var article = parseBlockScript(xhr.responseText);
      if (article) renderArticle(app, article, articleId);
    } else {
      showErr(app, '找不到文章文件',
        '无法加载 <code>' + articleId + '.blog</code> 文件。<br><br>' +
        '如果你是在本地直接打开此 HTML 文件（地址栏显示 <code>file://</code>），<br>' +
        '请先用本地服务器打开，例如：<br>' +
        '<code>cd "网站文件夹" && python -m http.server 8080</code><br><br>' +
        '然后访问 <code>http://localhost:8080/blog/' + articleId + '/</code>'
      );
    }
  };
  xhr.onerror = function() {
    showErr(app, '加载失败',
      '网络错误或文件不存在：<code>' + blogUrl + '</code><br>' +
      '请确保 <code>' + articleId + '.blog</code> 和本页面在同一文件夹。'
    );
  };
  try { xhr.send(); } catch(e) { showErr(app, '发送请求失败', e.message); }
}

function parseBlockScript(text) {
  var lines = text.split('\\n');
  var meta = {};
  var blocks = [];
  var i = 0;
  while (i < lines.length) {
    var line = lines[i].trim();
    if (line === '' || line === '[正文开始]' || line === '[正文]') break;
    var mm = line.match(/^\\[(\\w+)\\]\\s*(.*)/);
    if (mm) { meta[mm[1].toLowerCase()] = mm[2].trim(); }
    i++;
  }
  if (i < lines.length && (lines[i].trim() === '[正文开始]' || lines[i].trim() === '[正文]')) i++;
  var containerTags = { code:1, quote:1, alert:1, tip:1, table:1, html:1, btn:1, button:1, ul:1, ol:1 };
  while (i < lines.length) {
    var line = lines[i];
    var trimmed = line.trim();
    if (trimmed === '') { i++; continue; }
    if (trimmed.charAt(0) === '[') {
      var bracketEnd = trimmed.indexOf(']');
      if (bracketEnd !== -1) {
        var tagAndAttrs = trimmed.substring(1, bracketEnd);
        var spaceIdx = tagAndAttrs.search(/\\s/);
        var tagName, attrStr;
        if (spaceIdx === -1) { tagName = tagAndAttrs.toLowerCase(); attrStr = ''; }
        else { tagName = tagAndAttrs.substring(0, spaceIdx).toLowerCase(); attrStr = tagAndAttrs.substring(spaceIdx + 1); }
        var afterBracket = trimmed.substring(bracketEnd + 1).trim();
        var closeTag = '[/' + tagName + ']';
        var inlineCloseIdx = afterBracket.indexOf(closeTag);
        if (inlineCloseIdx !== -1) {
          var content = afterBracket.substring(0, inlineCloseIdx).trim();
          blocks.push({ type: tagName, attrs: parseAttrs(attrStr), content: content });
          i++;
          continue;
        }
        if (containerTags[tagName]) {
          var contentLines = [];
          if (afterBracket !== '') contentLines.push(afterBracket);
          i++;
          while (i < lines.length) {
            if (lines[i].trim() === closeTag) { i++; break; }
            contentLines.push(lines[i]);
            i++;
          }
          blocks.push({ type: tagName, attrs: parseAttrs(attrStr), content: contentLines.join('\\n') });
          continue;
        }
        if (afterBracket !== '') {
          blocks.push({ type: tagName, attrs: parseAttrs(attrStr), content: afterBracket });
          i++;
          continue;
        }
        if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || tagName === 'p') {
          var contentLines2 = [];
          i++;
          while (i < lines.length && lines[i].trim() !== '' && lines[i].trim().charAt(0) !== '[') {
            contentLines2.push(lines[i]); i++;
          }
          blocks.push({ type: tagName, attrs: {}, content: contentLines2.join('\\n') });
          continue;
        }
      }
    }
    var paraLines = [];
    while (i < lines.length && lines[i].trim() !== '') { paraLines.push(lines[i]); i++; }
    if (paraLines.length) blocks.push({ type: 'text', attrs: {}, content: paraLines.join('\\n') });
  }
  return { meta: meta, blocks: blocks };
}

function parseAttrs(str) {
  var attrs = {};
  if (!str) return attrs;
  var re = /(\\w+)=(?:"([^"]*)"|(\\S+))/g;
  var m;
  while ((m = re.exec(str)) !== null) { attrs[m[1]] = m[2] !== undefined ? m[2] : m[3]; }
  return attrs;
}

function renderInline(text) {
  text = text.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
  text = text.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
  text = text.replace(/\\*(.+?)\\*/g, '<em>$1</em>');
  text = text.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return text;
}

function renderArticle(container, article, articleId) {
  var meta = article.meta;
  var blocks = article.blocks;
  var title = meta.title || '无标题';
  var date = meta.date || '';
  var author = meta.author || 'ciallo0721-cmd';
  var tags = meta.tag ? meta.tag.split(/[,\\s]+/).filter(function(t) { return t; }) : [];
  document.title = title + ' - ciallo0721-cmd的文章';
  var html = '<div class="article-page"><div class="article-card">';
  html += '<div class="article-head">';
  html += '<div class="article-num">文章 #' + escHtml(articleId) + '</div>';
  html += '<h1 class="article-title">' + escHtml(title) + '</h1>';
  html += '<div class="article-meta">';
  if (date) html += '<div class="article-date">📅 ' + escHtml(date) + '</div>';
  html += '<div class="article-date">✍️ ' + escHtml(author) + '</div>';
  html += '</div>';
  if (tags.length) {
    html += '<div class="article-tags">';
    tags.forEach(function(t) { html += '<span class="article-tag">' + escHtml(t) + '</span>'; });
    html += '</div>';
  }
  html += '</div>';
  html += '<div class="article-body">';
  blocks.forEach(function(block) {
    var type = block.type;
    var attrs = block.attrs;
    var content = block.content;
    var trimmedContent = content.trim();
    switch (type) {
      case 'text':
        if (trimmedContent) {
          html += '<p>' + trimmedContent.split('\\n').map(function(l) { return renderInline(escHtml(l)); }).join('<br>') + '</p>';
        }
        break;
      case 'h1':
        html += '<h1>' + renderInline(escHtml(trimmedContent)) + '</h1>';
        break;
      case 'h2':
        html += '<h2>' + renderInline(escHtml(trimmedContent)) + '</h2>';
        break;
      case 'h3':
        html += '<h3>' + renderInline(escHtml(trimmedContent)) + '</h3>';
        break;
      case 'p':
        html += '<p>' + renderInline(escHtml(trimmedContent)) + '</p>';
        break;
      case 'quote':
        html += '<blockquote>' + content.split('\\n').filter(function(l) { return l.trim(); }).map(function(l) { return '<p>' + renderInline(escHtml(l)) + '</p>'; }).join('') + '</blockquote>';
        break;
      case 'code': {
        var lang = attrs.lang || '';
        var codeId = 'c' + Math.random().toString(36).slice(2, 8);
        html += '<div style="position:relative">';
        html += '<pre id="' + codeId + '"><code class="language-' + escHtml(lang) + '">' + escHtml(content) + '</code></pre>';
        html += '<button onclick="copyCode(this,\\'' + codeId + '\\')" style="position:absolute;top:10px;right:10px;background:rgba(251,114,153,0.2);color:var(--bili-pink);border:1px solid rgba(251,114,153,0.3);padding:4px 12px;border-radius:6px;cursor:pointer;font-size:12px">复制</button>';
        html += '</div>';
        break;
      }
      case 'ul':
        html += '<ul>' + content.split('\\n').filter(function(l) { return l.trim(); }).map(function(l) { return '<li>' + renderInline(escHtml(l.replace(/^[-*]\\s*/, ''))) + '</li>'; }).join('') + '</ul>';
        break;
      case 'ol':
        html += '<ol>' + content.split('\\n').filter(function(l) { return l.trim(); }).map(function(l) { return '<li>' + renderInline(escHtml(l.replace(/^\\d+\\.\\s*/, ''))) + '</li>'; }).join('') + '</ol>';
        break;
      case 'alert':
      case 'tip': {
        var t = attrs.type || 'info';
        var ttl = attrs.title || '';
        html += '<div class="alert alert-' + t + '">';
        if (ttl) html += '<strong>' + escHtml(ttl) + '</strong>';
        html += content.split('\\n').filter(function(l) { return l.trim(); }).map(function(l) { return '<p>' + renderInline(escHtml(l)) + '</p>'; }).join('');
        html += '</div>';
        break;
      }
      case 'btn':
      case 'button': {
        var href = attrs.href || '#';
        var color = attrs.color || 'primary';
        html += '<a href="' + escHtml(href) + '" class="btn btn-' + color + '" target="_blank">' + renderInline(escHtml(trimmedContent)) + '</a>';
        break;
      }
      case 'table': {
        var rows = content.trim().split('\\n').filter(function(r) { return r.trim(); });
        if (rows.length) {
          html += '<table><thead><tr>' + rows[0].split('|').filter(function(c) { return c.trim(); }).map(function(c) { return '<th>' + escHtml(c.trim()) + '</th>'; }).join('') + '</tr></thead>';
          html += '<tbody>' + rows.slice(1).map(function(r) { return '<tr>' + r.split('|').filter(function(c) { return c.trim(); }).map(function(c) { return '<td>' + renderInline(escHtml(c.trim())) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
        }
        break;
      }
      case 'hr':
        html += '<hr>';
        break;
      case 'html':
        html += content;
        break;
      default:
        if (trimmedContent) {
          html += '<p>' + renderInline(escHtml(trimmedContent)) + '</p>';
        }
    }
  });
  html += '</div></div></div>';
  container.innerHTML = html;
}

function showErr(container, title, msg) {
  container.innerHTML = '<div class="err-page"><h1>😢</h1><h2>' + title + '</h2><p>' + msg + '</p><a href="/wz.html" class="btn btn-primary">返回文章列表</a></div>';
}

function escHtml(str) {
  var d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function copyCode(btn, id) {
  var el = document.getElementById(id);
  if (!el) return;
  var text = el.innerText || el.textContent;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() { showCopyOk(btn); }).catch(function() { fallbackCopy(text, btn); });
  } else {
    fallbackCopy(text, btn);
  }
}

function fallbackCopy(text, btn) {
  var ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showCopyOk(btn);
}

function showCopyOk(btn) {
  if (btn && btn.textContent) { btn.textContent = '已复制！'; setTimeout(function() { btn.textContent = '复制'; }, 1500); }
}

init();`;

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>加载中...</title>
<style>\n${css}\n</style>
</head>
<body>

<nav class="nav">
  <div class="nav-inner">
    <a href="/" class="nav-logo">ciallo0721-cmd</a>
    <a href="/wz.html" class="back-btn">← 文章列表</a>
  </div>
</nav>

<div id="app">
  <div class="loading-wrap">
    <div class="spinner"></div>
    <p>正在加载文章...</p>
  </div>
</div>

<script>\n${js}\n</script>
</body>
</html>`;

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html 写入成功！');
`;

fs.writeFileSync('G:/EmoScan Pro/ciallo0721-cmd.top/blog/_decoder/build.js', css + js, 'utf8');
console.log('build.js 已创建，请运行：node build.js');
