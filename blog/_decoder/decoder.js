// blog/_decoder/decoder.js — 共享解码器（所有文章通用，含上下篇导航）
// 修复：解析 ?blog_id= / 正确加载 .blog 路径 / 统一变量名拼写

(function () {
  'use strict';

  // ========== 全局错误捕获 ==========
  window.onerror = function (msg, src, line, col, err) {
    var app = document.getElementById('app');
    if (app) {
      var stack = (err && err.stack) ? err.stack : String(msg);
      app.innerHTML =
        '<div class="err-page">' +
        '<h1>JS 运行错误</h1>' +
        '<h2>' + escHtml(String(msg)) + '</h2>' +
        '<p>行号：' + (line || '') + '，列号：' + (col || '') + '</p>' +
        '<pre style="background:#1a1f2e;color:#ff6666;padding:16px;border-radius:8px;overflow:auto;white-space:pre-wrap;font-size:12px;text-align:left;margin:20px auto;max-width:800px;">' + escHtml(String(stack)) + '</pre>' +
        '<a href="/blog/" class="btn btn-primary" style="margin-top:20px;display:inline-block;">返回文章列表</a>' +
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
    result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
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
    var containerTags = { code: 1, quote: 1, alert: 1, tip: 1, table: 1, html: 1, ul: 1, ol: 1 };
    var selfClosing = { hr: 1, br: 1, image: 1, img: 1, video: 1, audio: 1, pdf: 1 };

    while (i < lines.length) {
      var rawLine = lines[i];
      var trimmedLine = rawLine.trim();

      if (trimmedLine === '') {
        i++;
        continue;
      }

      if (trimmedLine.charAt(0) === '[') {
        var bracketEnd2 = trimmedLine.indexOf(']');
        if (bracketEnd2 !== -1) {
          var tagFull = trimmedLine.substring(1, bracketEnd2);
          var spaceIdx = tagFull.search(/\s/);
          var tagName, attrStr;
          if (spaceIdx === -1) {
            tagName = tagFull.toLowerCase();
            attrStr = '';
          } else {
            tagName = tagFull.substring(0, spaceIdx).toLowerCase();
            attrStr = tagFull.substring(spaceIdx + 1);
          }

          var afterBracket = trimmedLine.substring(bracketEnd2 + 1).trim();
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
      tags = meta.tag.split(/[,\s]+/).filter(function (t) { return t.length > 0; });
    }

    document.title = title + ' - ciallo0721-cmd的文章';

    var html = '<div class="article-page"><div class="article-card">';
    html += '<div class="article-head">';
    html += '<div class="article-num">文章 #' + escHtml(String(articleId)) + '</div>';
    html += '<h1 class="article-title">' + escHtml(title) + '</h1>';
    html += '<div class="article-meta">';
    if (date) html += '<div class="article-date">&#x1F4C5; ' + escHtml(date) + '</div>';
    html += '<div class="article-date">&#x270D; ' + escHtml(author) + '</div>';
    html += '</div>';
    if (tags.length) {
      html += '<div class="article-tags">';
      tags.forEach(function (t) {
        html += '<span class="article-tag">' + escHtml(t) + '</span>';
      });
      html += '</div>';
    }
    html += '</div>';

    html += '<div class="article-body">';
    blocks.forEach(function (block) {
      var type = block.type;
      var attrs = block.attrs;
      var content = block.content;
      var trimmed = content.trim();

      switch (type) {
        case 'text':
          if (trimmed) {
            html += '<p>' + trimmed.split('\n').map(function (l) { return renderInline(escHtml(l)); }).join('<br>') + '</p>';
          }
          break;
        case 'h1':
          html += '<h1>' + renderInline(escHtml(trimmed)) + '</h1>';
          break;
        case 'h2':
          html += '<h2>' + renderInline(escHtml(trimmed)) + '</h2>';
          break;
        case 'h3':
          html += '<h3>' + renderInline(escHtml(trimmed)) + '</h3>';
          break;
        case 'p':
          html += '<p>' + renderInline(escHtml(trimmed)) + '</p>';
          break;
        case 'quote':
          var quoteParts = content.split('\n').filter(function (l) { return l.trim(); });
          html += '<blockquote>' + quoteParts.map(function (l) { return '<p>' + renderInline(escHtml(l)) + '</p>'; }).join('') + '</blockquote>';
          break;
        case 'code':
          var lang = attrs.lang || '';
          var codeId = 'c' + Math.random().toString(36).slice(2, 8);
          html += '<div style="position:relative">';
          html += '<pre id="' + codeId + '"><code class="language-' + escHtml(lang) + '">' + escHtml(content) + '</code></pre>';
          html += '<button onclick="window.__copyCode(this,\'' + codeId + '\')" style="position:absolute;top:10px;right:10px;background:rgba(251,114,153,0.2);color:var(--bili-pink);border:1px solid rgba(251,114,153,0.3);padding:4px 12px;border-radius:6px;cursor:pointer;font-size:12px;">复制</button>';
          html += '</div>';
          break;
        case 'ul':
          var ulItems = content.split('\n').filter(function (l) { return l.trim(); });
          html += '<ul>' + ulItems.map(function (l) { return '<li>' + renderInline(escHtml(l.replace(/^[-*]\s*/, ''))) + '</li>'; }).join('') + '</ul>';
          break;
        case 'ol':
          var olItems = content.split('\n').filter(function (l) { return l.trim(); });
          html += '<ol>' + olItems.map(function (l) { return '<li>' + renderInline(escHtml(l.replace(/^\d+\.\s*/, ''))) + '</li>'; }).join('') + '</ol>';
          break;
        case 'alert':
        case 'tip':
          var alertType = attrs.type || 'info';
          var alertTitle = attrs.title || '';
          html += '<div class="alert alert-' + alertType + '">';
          if (alertTitle) html += '<strong>' + escHtml(alertTitle) + '</strong>';
          var alertParts = content.split('\n').filter(function (l) { return l.trim(); });
          html += alertParts.map(function (l) { return '<p>' + renderInline(escHtml(l)) + '</p>'; }).join('');
          html += '</div>';
          break;
        case 'btn':
        case 'button':
          var href = attrs.href || '#';
          var color = attrs.color || 'primary';
          html += '<a href="' + escHtml(href) + '" class="btn btn-' + color + '" target="_blank">' + renderInline(escHtml(content.trim())) + '</a>';
          break;
        case 'table':
          var rows = content.trim().split('\n').filter(function (r) { return r.trim(); });
          if (rows.length) {
            html += '<table><thead><tr>';
            html += rows[0].split('|').filter(function (c) { return c.trim(); }).map(function (c) { return '<th>' + escHtml(c.trim()) + '</th>'; }).join('');
            html += '</tr></thead><tbody>';
            html += rows.slice(1).map(function (r) {
              return '<tr>' + r.split('|').filter(function (c) { return c.trim(); }).map(function (c) { return '<td>' + renderInline(escHtml(c.trim())) + '</td>'; }).join('') + '</tr>';
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
          if (trimmed) {
            html += '<p>' + renderInline(escHtml(trimmed)) + '</p>';
          }
          break;
      }
    });

    html += '</div></div></div>';

    // 添加上一篇/下一篇导航
    if (window.articlesData && typeof window.articlesData.getAdjacentArticles === 'function') {
      var adj = window.articlesData.getAdjacentArticles(articleId);
      html += '<div style="display:flex;justify-content:space-between;margin-top:40px;padding-top:30px;border-top:1px solid rgba(0,0,0,0.1);flex-wrap:wrap;gap:15px;">';
      if (adj.prev) {
        var prevPath = (adj.prev.fileName || '') + '?blog_id=' + adj.prev.id;
        html += '<a href="/blog/' + prevPath + '" style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,var(--bili-pink),var(--bili-blue));color:white;padding:10px 20px;border-radius:25px;text-decoration:none;font-weight:600;font-size:0.95rem;transition:var(--transition);">&#x2190; 上一篇：' + escHtml(adj.prev.title) + '</a>';
      } else {
        html += '<div></div>';
      }
      if (adj.next) {
        var nextPath = (adj.next.fileName || '') + '?blog_id=' + adj.next.id;
        html += '<a href="/blog/' + nextPath + '" style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,var(--bili-pink),var(--bili-blue));color:white;padding:10px 20px;border-radius:25px;text-decoration:none;font-weight:600;font-size:0.95rem;transition:var(--transition);">下一篇：' + escHtml(adj.next.title) + ' &#x2192;</a>';
      } else {
        html += '<div></div>';
      }
      html += '</div>';
    }

    container.innerHTML = html;

    // 初始化自定义播放器
    setTimeout(function () {
      if (typeof VideoPlayer !== 'undefined' && VideoPlayer.initAll) {
        VideoPlayer.initAll();
      }
      if (typeof AudioPlayer !== 'undefined' && AudioPlayer.initAll) {
        AudioPlayer.initAll();
      }
    }, 0);
  }

  // ========== 复制代码 ==========
  window.__copyCode = function (btn, id) {
    var el = document.getElementById(id);
    if (!el) return;
    var text = el.innerText || el.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showCopyOk(btn);
      }).catch(function () {
        fallbackCopy(text, btn);
      });
    } else {
      fallbackCopy(text, btn);
    }
  };

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
      setTimeout(function () { btn.textContent = '复制'; }, 1500);
    }
  }

  // ========== 显示错误 ==========
  function showErr(container, title, msg) {
    container.innerHTML =
      '<div class="err-page">' +
      '<h1>&#x1F622;</h1>' +
      '<h2>' + title + '</h2>' +
      '<p>' + msg + '</p>' +
      '<a href="/blog/" class="btn btn-primary">返回文章列表</a>' +
      '</div>';
  }

  // ========== 主入口 ==========
  function init() {
    var app = document.getElementById('app');
    if (!app) return;

    var articleId = '';

    // 优先从查询参数 ?blog_id=XX 读取
    var qs = window.location.search;
    var blogIdMatch = qs.match(/blog_id=(\d+)/);
    if (blogIdMatch) {
      articleId = blogIdMatch[1];
    }

    // 回退：尝试从路径匹配数字 ID（兼容旧 URL /blog/22/）
    if (!articleId) {
      var path = window.location.pathname || '';
      var m = path.match(/\/blog\/(\d+)/);
      if (m) {
        articleId = m[1];
      }
    }

    // 回退：提取当前文件夹名作为 ID
    if (!articleId) {
      var path = window.location.pathname || '';
      var pathParts = path.split('/').filter(function (p) { return p; });
      var blogIdx = -1;
      for (var i = 0; i < pathParts.length; i++) {
        if (pathParts[i] === 'blog') {
          blogIdx = i;
          break;
        }
      }
      if (blogIdx !== -1 && blogIdx + 1 < pathParts.length) {
        articleId = pathParts[blogIdx + 1];
      }
    }

    if (!articleId) {
      showErr(app, '路径错误', 'URL 中找不到文章 ID。');
      return;
    }

    // 根据 articles-data.js 的 _pathMap 构造正确的 .blog 文件 URL
    var blogUrl = '';
    if (window.articlesData && window.articlesData._pathMap) {
      var folderPath = window.articlesData._pathMap[String(articleId)] || '';
      // folderPath 如 "兴趣/另一个次元/24/"，拼出 /blog/兴趣/另一个次元/24/24.blog
      blogUrl = '/blog/' + folderPath + articleId + '.blog';
    } else {
      // 回退：假设 .blog 文件与当前 HTML 同目录
      blogUrl = './' + articleId + '.blog';
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', blogUrl, true);
    xhr.onload = function () {
      if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) {
        var article = parseBlockScript(xhr.responseText);
        if (article) {
          renderArticle(app, article, articleId);
        }
      } else {
        showErr(app, '找不到文章文件',
          '无法加载 <code>' + escHtml(blogUrl) + '</code>。<br><br>' +
          '如果你是在本地直接打开此 HTML 文件（地址栏显示 <code>file://</code>），<br>' +
          '请先用本地服务器打开，例如：<br>' +
          '<code>cd "网站文件夹" &amp;&amp; python -m http.server 8080</code><br><br>' +
          '然后访问 <code>http://localhost:8080/blog/</code>'
        );
      }
    };
    xhr.onerror = function () {
      showErr(app, '加载失败',
        '网络错误或文件不存在：<code>' + escHtml(blogUrl) + '</code><br>' +
        '请确保 <code>' + escHtml(articleId) + '.blog</code> 存在于正确路径。'
      );
    };
    try {
      xhr.send();
    } catch (e) {
      showErr(app, '发送请求失败', e.message);
    }
  }

  // DOM 就绪后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
