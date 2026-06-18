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
  var containerTags = { code:1, quote:1, alert:1, tip:1, table:1, html:1, ul:1, ol:1 };

  // 自闭合标签（无内容，无关闭标签）
  var selfClosing = { hr:1, br:1, image:1, img:1, video:1, audio:1, pdf:1 };

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
        var lowerAfter = afterBracket.toLowerCase();
        var inlineCloseIdx = lowerAfter.indexOf(closeTag);
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
            if (lines[i].trim().toLowerCase() === closeTag) {
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

        // 情况3.5：自闭合标签 [HR]
        if (selfClosing[tagName]) {
          blocks.push({ type: tagName, attrs: parseAttrs(attrStr), content: '' });
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
      case 'image':
      case 'img':
        var imgSrc = attrs.src || '';
        var imgAlt = attrs.alt || '';
        var imgWidth = attrs.width || '100%';
        var imgCaption = attrs.caption || '';
        html += '<figure style="text-align:center;margin:20px 0;">';
        html += '<img src="' + escHtml(imgSrc) + '" alt="' + escHtml(imgAlt) + '" style="max-width:' + escHtml(imgWidth) + ';height:auto;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.1);">';
        if (imgCaption) {
          html += '<figcaption style="margin-top:8px;color:var(--text-secondary);font-size:0.9rem;">' + escHtml(imgCaption) + '</figcaption>';
        }
        html += '</figure>';
        break;
      case 'video':
        var vidSrc = attrs.src || '';
        html += '<div class="video-player-container" data-src="' + escHtml(vidSrc) + '" style="margin:20px 0;max-width:100%;">';
        html += '  <video preload="metadata"></video>';
        html += '  <div class="video-poster">';
        html += '    <button class="play-button"></button>';
        html += '  </div>';
        html += '  <div class="video-controls">';
        html += '    <button class="vp-control-btn vp-play-pause"><i class="fas fa-play"></i></button>';
        html += '    <div class="vp-progress-container"><div class="vp-progress-bar"><div class="vp-progress-fill"></div><div class="vp-progress-handle"></div></div></div>';
        html += '    <span class="vp-time-display">00:00 / 00:00</span>';
        html += '    <div class="vp-volume-container"><button class="vp-control-btn vp-volume-btn"><i class="fas fa-volume-up"></i></button><div class="vp-volume-slider"><div class="vp-volume-fill"></div></div></div>';
        html += '    <button class="vp-control-btn vp-fullscreen-btn"><i class="fas fa-expand"></i></button>';
        html += '  </div>';
        html += '  <div class="vp-loading"></div>';
        html += '</div>';
        break;
      case 'audio':
        var audSrc = attrs.src || '';
        var audTitle = attrs.title || '未知曲目';
        var audArtist = attrs.artist || '';
        html += '<div class="audio-player-container" data-src="' + escHtml(audSrc) + '" data-title="' + escHtml(audTitle) + '" data-artist="' + escHtml(audArtist) + '" style="margin:20px 0;"></div>';
        break;
      case 'pdf':
        var pdfSrc = attrs.src || '';
        var pdfWidth = attrs.width || '100%';
        var pdfHeight = attrs.height || '800px';
        html += '<div style="margin:20px 0;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.1);">';
        html += '<iframe src="' + escHtml(pdfSrc) + '" width="' + escHtml(pdfWidth) + '" height="' + escHtml(pdfHeight) + '" style="border:none;border-radius:8px;"></iframe>';
        html += '</div>';
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

  // 初始化自定义播放器（必须在 innerHTML 赋值之后！）
  setTimeout(function() {
    if (typeof VideoPlayer !== 'undefined' && VideoPlayer.initAll) {
      VideoPlayer.initAll();
    }
    if (typeof AudioPlayer !== 'undefined' && AudioPlayer.initAll) {
      AudioPlayer.initAll();
    }
  }, 0);
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
  var articleId = '';
  
  // 检测是否在本地直接打开（file:// 协议）
  if (window.location.protocol === 'file:') {
    showErr(app, '请在服务器环境下打开',
      '直接双击打开 HTML 文件（地址栏显示 <code>file://</code>）会导致浏览器阻止文件加载。<br><br>' +
      '解决方法：<br>' +
      '1. 使用本地服务器：在网站根目录运行 <code>python -m http.server 8080</code><br>' +
      '2. 然后访问 <code>http://localhost:8080/blog/ACG/番剧分享/24/</code><br><br>' +
      '或者等待网站部署到 GitHub Pages 后在线访问。'
    );
    return;
  }
  
  // 方法1：从路径中提取数字 ID（支持多级目录，如 /blog/ACG/xxx/24/）
  var pathParts = path.split('/').filter(function(p) { return p; });
  for (var i = pathParts.length - 1; i >= 0; i--) {
    if (/^\d+$/.test(pathParts[i])) {
      articleId = pathParts[i];
      break;
    }
  }
  
  // 方法2：如果找不到数字 ID，提取当前文件夹名作为 ID（如 /blog/muban/ → muban）
  if (!articleId) {
    // 兼容 file:// 协议和 http:// 协议
    var blogIdx = -1;
    for (var j = 0; j < pathParts.length; j++) {
      if (pathParts[j] === 'blog') {
        blogIdx = j;
        break;
      }
    }
    if (blogIdx !== -1 && blogIdx + 1 < pathParts.length) {
      // 取 blog 后的最后一段作为 articleId（支持多级目录）
      articleId = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2];
    }
    
    // 方法3：如果还是找不到，尝试从当前 script 的 src 推断
    if (!articleId) {
      var currentScript = document.currentScript || document.scripts[document.scripts.length - 1];
      if (currentScript && currentScript.src) {
        var srcParts = currentScript.src.split('/');
        articleId = srcParts[srcParts.length - 2];
      }
    }
  }
  
  if (!articleId) {
    showErr(app, '路径错误', 'URL 中找不到文章 ID。');
    return;
  }
  
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
