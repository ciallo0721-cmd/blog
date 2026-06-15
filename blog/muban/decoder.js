// ========== 全局错误捕获 ==========
window.onerror = function(msg, src, line, col, err) {
  var app = document.getElementById('app');
  if (app) {
    var stack = (err && err.stack) ? err.stack : String(msg);
    app.innerHTML =
      '<div class="err-page">' +
      '<h1>JS 运行错误</h1>' +
      '<h2>' + escHtml(String(msg)) + '</h2>' +
      '<p>行号：' + (line||'') + '，列号：' + (col||'') + '</p>' +
      '<pre style="background:#1a1f2e;color:#ff6666;padding:16px;border-radius:8px;overflow:auto;white-space:pre-wrap;font-size:12px;text-align:left;margin:20px auto;max-width:800px;">' + escHtml(String(stack)) + '</pre>' +
      '<a href="/wz.html" class="btn btn-primary" style="margin-top:20px;display:inline-block;">返回文章列表</a>' +
      '</div>';
  }
  return true;
};

// ========== 工具函数 ==========
function escHtml(s) {
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function parseAttrs(attrStr) {
  var attrs = {};
  if (!attrStr) return attrs;
  var parts = attrStr.split(/\s+/);
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];
    var eqIdx = p.indexOf('=');
    if (eqIdx !== -1) {
      var key = p.substring(0, eqIdx);
      var val = p.substring(eqIdx + 1);
      if (val.charAt(0) === '"' && val.charAt(val.length - 1) === '"') {
        val = val.substring(1, val.length - 1);
      }
      attrs[key] = val;
    }
  }
  return attrs;
}

function renderInline(text) {
  // 处理 `代码`
  var result = '';
  var inBacktick = false;
  var buf = '';
  for (var i = 0; i < text.length; i++) {
    if (text[i] === '`') {
      if (inBacktick) {
        result += '<code>' + escHtml(buf) + '</code>';
        buf = '';
        inBacktick = false;
      } else {
        result += escHtml(buf);
        buf = '';
        inBacktick = true;
      }
    } else {
      buf += text[i];
    }
  }
  result += escHtml(buf);
  
  // 处理 **粗体**
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // 处理 *斜体*
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return result;
}

// ========== 核心：解析 .blog 文件 ==========
function parseBlockScript(text) {
  var lines = text.split('\n');
  var meta = {};
  var blocks = [];
  var i = 0;

  // 第一步：解析头部元数据
  while (i < lines.length) {
    var line = lines[i].trim();
    if (line === '' || line === '[正文开始]' || line === '[正文]') {
      break;
    }
    if (line.charAt(0) === '[') {
      var bracketEnd = line.indexOf(']');
      if (bracketEnd !== -1) {
        var key = line.substring(1, bracketEnd).toLowerCase();
        var val = line.substring(bracketEnd + 1).trim();
        meta[key] = val;
      }
    }
    i++;
  }

  // 跳过 [正文开始] 标记
  while (i < lines.length && (lines[i].trim() === '' || lines[i].trim() === '[正文开始]' || lines[i].trim() === '[正文]')) {
    i++;
  }

  // 第二步：解析正文区块
  var containerTags = { code:1, quote:1, alert:1, tip:1, table:1, html:1, btn:1, button:1, ul:1, ol:1 };

  while (i < lines.length) {
    var rawLine = lines[i];
    var trimmed = rawLine.trim();

    // 跳过空行
    if (trimmed === '') {
      i++;
      continue;
    }

    // 检测是否是标签行
    if (trimmed.charAt(0) === '[') {
      var bracketEnd2 = trimmed.indexOf(']');
      if (bracketEnd2 !== -1) {
        var tagFull = trimmed.substring(1, bracketEnd2);
        var spaceIdx = tagFull.search(/\s/);
        var tagName, attrStr;
        if (spaceIdx === -1) {
          tagName = tagFull.toLowerCase();
          attrStr = '';
        } else {
          tagName = tagFull.substring(0, spaceIdx).toLowerCase();
          attrStr = tagFull.substring(spaceIdx + 1);
        }

        var afterBracket = trimmed.substring(bracketEnd2 + 1).trim();
        var closeTag = '[/' + tagName + ']';

        // 情况1：行内标签 [Btn ...]文字[/Btn]
        var inlineCloseIdx = afterBracket.indexOf(closeTag);
        if (inlineCloseIdx !== -1) {
          var content = afterBracket.substring(0, inlineCloseIdx).trim();
          blocks.push({ type: tagName, attrs: parseAttrs(attrStr), content: content });
          i++;
          continue;
        }

        // 情况2：容器标签 [Code]...[/Code]
        if (containerTags[tagName]) {
          var contentLines = [];
          if (afterBracket !== '') {
            contentLines.push(afterBracket);
          }
          i++;
          while (i < lines.length) {
            if (lines[i].trim() === closeTag) {
              i++;
              break;
            }
            contentLines.push(lines[i]);
            i++;
          }
          blocks.push({ type: tagName, attrs: parseAttrs(attrStr), content: contentLines.join('\n') });
          continue;
        }

        // 情况3：单行标签 [H1]标题
        if (afterBracket !== '') {
          blocks.push({ type: tagName, attrs: parseAttrs(attrStr), content: afterBracket });
          i++;
          continue;
        }

        // 情况4：多行内容标签
        if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || tagName === 'p') {
          var contentLines2 = [];
          i++;
          while (i < lines.length && lines[i].trim() !== '' && lines[i].trim().charAt(0) !== '[') {
            contentLines2.push(lines[i]);
            i++;
          }
          blocks.push({ type: tagName, attrs: {}, content: contentLines2.join('\n') });
          continue;
        }
      }
    }

    // 情况5：普通段落
    var paraLines = [];
    while (i < lines.length && lines[i].trim() !== '') {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length) {
      blocks.push({ type: 'text', attrs: {}, content: paraLines.join('\n') });
    }
  }

  return { meta: meta, blocks: blocks };
}

// ========== 渲染文章 ==========
function renderArticle(container, article, articleId) {
  var meta = article.meta;
  var blocks = article.blocks;
  var title = meta.title || '无标题';
  var date = meta.date || '';
  var author = meta.author || 'ciallo0721-cmd';
  var tags = [];
  if (meta.tag) {
    tags = meta.tag.split(/[,\s]+/).filter(function(t) { return t.length > 0; });
  }

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
    tags.forEach(function(t) {
      html += '<span class="article-tag">' + escHtml(t) + '</span>';
    });
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
          html += '<p>' + trimmedContent.split('\n').map(function(l) { return renderInline(escHtml(l)); }).join('<br>') + '</p>';
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
        var quoteParts = content.split('\n').filter(function(l) { return l.trim(); });
        html += '<blockquote>' + quoteParts.map(function(l) { return '<p>' + renderInline(escHtml(l)) + '</p>'; }).join('') + '</blockquote>';
        break;
      case 'code':
        var lang = attrs.lang || '';
        var codeId = 'c' + Math.random().toString(36).slice(2, 8);
        html += '<div style="position:relative">';
        html += '<pre id="' + codeId + '"><code class="language-' + escHtml(lang) + '">' + escHtml(content) + '</code></pre>';
        html += '<button onclick="copyCode(this,\'' + codeId + '\')" style="position:absolute;top:10px;right:10px;background:rgba(251,114,153,0.2);color:var(--bili-pink);border:1px solid rgba(251,114,153,0.3);padding:4px 12px;border-radius:6px;cursor:pointer;font-size:12px;">复制</button>';
        html += '</div>';
        break;
      case 'ul':
        var ulItems = content.split('\n').filter(function(l) { return l.trim(); });
        html += '<ul>' + ulItems.map(function(l) { return '<li>' + renderInline(escHtml(l.replace(/^[-*]\s*/, ''))) + '</li>'; }).join('') + '</ul>';
        break;
      case 'ol':
        var olItems = content.split('\n').filter(function(l) { return l.trim(); });
        html += '<ol>' + olItems.map(function(l) { return '<li>' + renderInline(escHtml(l.replace(/^\d+\.\s*/, ''))) + '</li>'; }).join('') + '</ol>';
        break;
      case 'alert':
      case 'tip':
        var alertType = attrs.type || 'info';
        var alertTitle = attrs.title || '';
        html += '<div class="alert alert-' + alertType + '">';
        if (alertTitle) html += '<strong>' + escHtml(alertTitle) + '</strong>';
        var alertParts = content.split('\n').filter(function(l) { return l.trim(); });
        html += alertParts.map(function(l) { return '<p>' + renderInline(escHtml(l)) + '</p>'; }).join('');
        html += '</div>';
        break;
      case 'btn':
      case 'button':
        var href = attrs.href || '#';
        var color = attrs.color || 'primary';
        html += '<a href="' + escHtml(href) + '" class="btn btn-' + color + '" target="_blank">' + renderInline(escHtml(trimmedContent)) + '</a>';
        break;
      case 'table':
        var rows = content.trim().split('\n').filter(function(r) { return r.trim(); });
        if (rows.length) {
          html += '<table><thead><tr>';
          html += rows[0].split('|').filter(function(c) { return c.trim(); }).map(function(c) { return '<th>' + escHtml(c.trim()) + '</th>'; }).join('');
          html += '</tr></thead><tbody>';
          html += rows.slice(1).map(function(r) {
            return '<tr>' + r.split('|').filter(function(c) { return c.trim(); }).map(function(c) { return '<td>' + renderInline(escHtml(c.trim())) + '</td>'; }).join('') + '</tr>';
          }).join('');
          html += '</tbody></table>';
        }
        break;
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
        break;
    }
  });
  html += '</div></div></div>';
  container.innerHTML = html;
}

// ========== 复制代码 ==========
function copyCode(btn, id) {
  var el = document.getElementById(id);
  if (!el) return;
  var text = el.innerText || el.textContent;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      showCopyOk(btn);
    }).catch(function() {
      fallbackCopy(text, btn);
    });
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
  if (btn && btn.textContent) {
    btn.textContent = '已复制！';
    setTimeout(function() { btn.textContent = '复制'; }, 1500);
  }
}

// ========== 显示错误 ==========
function showErr(container, title, msg) {
  container.innerHTML =
    '<div class="err-page">' +
    '<h1>😢</h1>' +
    '<h2>' + title + '</h2>' +
    '<p>' + msg + '</p>' +
    '<a href="/wz.html" class="btn btn-primary">返回文章列表</a>' +
    '</div>';
}

// ========== 主入口 ==========
function init() {
  var app = document.getElementById('app');
  var path = window.location.pathname || '';
  var m = path.match(/\/blog\/(\d+)/);
  if (!m) {
    showErr(app, '路径错误', 'URL 中找不到文章 ID。');
    return;
  }
  var articleId = m[1];
  var blogUrl = './' + articleId + '.blog';

  var xhr = new XMLHttpRequest();
  xhr.open('GET', blogUrl, true);
  xhr.onload = function() {
    if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) {
      var article = parseBlockScript(xhr.responseText);
      if (article) {
        renderArticle(app, article, articleId);
      }
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
  try {
    xhr.send();
  } catch(e) {
    showErr(app, '发送请求失败', e.message);
  }
}

init();
