#!/usr/bin/env python3
"""
prerender-blog.py — 博客静态预渲染脚本

为每个 .blog 文件生成 index.html（含完整内容+SEO元数据），
使得 Googlebot 直接抓到全部文章内容，无需 JS 渲染。

用法：
    python prerender-blog.py            # 预渲染所有文章
    python prerender-blog.py --check    # 仅检查哪些文章缺少 index.html

注意：
    - 不修改 blog/decoder/index.html（通用模板保持不变）
    - 每篇文章的 index.html 包含全部 CSS/JS（从 decoder 模板复制）
    - 保留原有的视频/音频播放器 JS 交互能力
    - 文章内容直接渲染为 HTML，Googlebot 在首次 HTML 请求时即可看到
"""

import os
import re
import json
import html as html_lib

# ===== 配置 =====
BLOG_ROOT = os.path.dirname(os.path.abspath(__file__))  # G:\EmoScan Pro\ciallo0721-cmd.github.io
DECODER_HTML = os.path.join(BLOG_ROOT, 'blog', 'decoder', 'index.html')
ARTICLES_DATA = os.path.join(BLOG_ROOT, 'articles-data.js')
BLOG_DIR = os.path.join(BLOG_ROOT, 'blog')
DOMAIN = 'https://ciallo0721-cmd.top'


def esc(s):
    """HTML 转义"""
    if s is None:
        return ''
    return html_lib.escape(str(s), quote=True)


def load_articles_data():
    """从 articles-data.js 加载文章元数据"""
    with open(ARTICLES_DATA, 'r', encoding='utf-8') as f:
        content = f.read()

    # 解析 _pathMap
    path_map = {}
    m = re.search(r'_pathMap:\s*\{([^}]+)\}', content, re.DOTALL)
    if m:
        entries = re.findall(r'"(\d+)":\s*"([^"]+)"', m.group(1))
        for k, v in entries:
            path_map[k] = v

    # 解析 articles 数组
    articles = []
    # 使用更健壮的方法：按行解析
    lines = content.split('\n')
    in_articles = False
    brace_depth = 0
    current_block = ''
    for line in lines:
        stripped = line.strip()
        if 'articles:' in stripped or 'articles: [' in stripped:
            in_articles = True
            continue
        if not in_articles:
            continue
        # 遇到 }; 开头的行 = articles 数组结束
        if stripped.startswith('};'):
            break
        for ch in line:
            if ch == '{':
                brace_depth += 1
                if brace_depth == 1:
                    current_block = ''
            elif ch == '}':
                brace_depth -= 1
                if brace_depth == 0:
                    # 完整的对象
                    block = current_block + '}'
                    a = {'id': None, 'category': '', 'title': '', 'excerpt': '', 'date': '',
                         'tags': [], 'readTime': 0, 'featured': False}
                    id_m = re.search(r'id:\s*(\d+)', block)
                    if id_m:
                        a['id'] = id_m.group(1)
                    cat_m = re.search(r'category:\s*"([^"]*)"', block)
                    if cat_m:
                        a['category'] = cat_m.group(1)
                    title_m = re.search(r'title:\s*"([^"]*)"', block)
                    if title_m:
                        a['title'] = title_m.group(1)
                    excerpt_m = re.search(r'excerpt:\s*"([^"]*)"', block)
                    if excerpt_m:
                        a['excerpt'] = excerpt_m.group(1)
                    date_m = re.search(r'date:\s*"([^"]*)"', block)
                    if date_m:
                        a['date'] = date_m.group(1)
                    tags_m = re.search(r'tags:\s*\[([^\]]*)\]', block)
                    if tags_m:
                        tags_str = tags_m.group(1)
                        a['tags'] = re.findall(r'"([^"]*)"', tags_str)
                    read_m = re.search(r'readTime:\s*(\d+)', block)
                    if read_m:
                        a['readTime'] = int(read_m.group(1))
                    featured_m = re.search(r'featured:\s*(true|false)', block)
                    if featured_m:
                        a['featured'] = featured_m.group(1) == 'true'
                    if a['id']:
                        articles.append(a)
                    current_block = ''
            if brace_depth >= 1:
                current_block += ch

    return path_map, articles


def parse_blog_file(filepath):
    """解析 .blog 文件，返回 (meta, blocks, raw_text)"""
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    lines = text.split('\n')
    meta = {}
    blocks = []
    i = 0

    # 解析头部元数据
    while i < len(lines):
        line = lines[i].strip()
        if line == '' or line in ('[正文开始]', '[正文]'):
            break
        if line.startswith('['):
            bracket_end = line.find(']')
            if bracket_end != -1:
                key = line[1:bracket_end].lower()
                val = line[bracket_end + 1:].strip()
                meta[key] = val
        i += 1

    # 跳过标记行
    while i < len(lines) and (lines[i].strip() == '' or lines[i].strip() in ('[正文开始]', '[正文]')):
        i += 1

    # 解析正文区块
    container_tags = {'code', 'quote', 'alert', 'tip', 'table', 'html', 'ul', 'ol'}
    self_closing = {'hr', 'br', 'image', 'img', 'video', 'audio', 'pdf', 'Btn', 'Button'}

    def parse_attrs(attr_str):
        attrs = {}
        if not attr_str:
            return attrs
        parts = attr_str.split()
        for p in parts:
            eq_idx = p.find('=')
            if eq_idx != -1:
                key = p[:eq_idx]
                val = p[eq_idx + 1:]
                if val.startswith('"') and val.endswith('"'):
                    val = val[1:-1]
                attrs[key] = val
        return attrs

    def render_inline(t):
        """渲染行内格式：加粗、斜体、代码"""
        result = ''
        in_backtick = False
        buf = ''
        for ch in t:
            if ch == '`':
                if in_backtick:
                    result += '<code>' + esc(buf) + '</code>'
                    buf = ''
                    in_backtick = False
                else:
                    result += esc(buf)
                    buf = ''
                    in_backtick = True
            else:
                buf += ch
        result += esc(buf)
        result = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', result)
        result = re.sub(r'\*(.+?)\*', r'<em>\1</em>', result)
        return result

    def render_block(type_name, content, attrs, raw_text_accumulator):
        """渲染单个区块为 HTML"""
        trimmed = content.strip()
        result = ''

        if type_name == 'text':
            if trimmed:
                paras = trimmed.split('\n')
                result += '<p>' + '<br>'.join(render_inline(esc(p)) for p in paras) + '</p>'
                raw_text_accumulator.append(trimmed + '\n')

        elif type_name in ('h1', 'h2', 'h3'):
            tag = type_name
            result += f'<{tag}>{render_inline(esc(trimmed))}</{tag}>'
            raw_text_accumulator.append(trimmed + '\n')

        elif type_name == 'p':
            result += f'<p>{render_inline(esc(trimmed))}</p>'
            raw_text_accumulator.append(trimmed + '\n')

        elif type_name == 'quote':
            parts = [p.strip() for p in content.split('\n') if p.strip()]
            result += '<blockquote>' + ''.join(f'<p>{render_inline(esc(p))}</p>' for p in parts) + '</blockquote>'
            raw_text_accumulator.append('\n'.join(parts) + '\n')

        elif type_name == 'code':
            lang = attrs.get('lang', '')
            result += f'<pre><code class="language-{esc(lang)}">{esc(content)}</code></pre>'
            raw_text_accumulator.append(content + '\n')

        elif type_name == 'ul':
            items = [l.strip() for l in content.split('\n') if l.strip()]
            result += '<ul>' + ''.join(
                f'<li>{render_inline(esc(re.sub(r"^[-*]\s*", "", l)))}</li>' for l in items
            ) + '</ul>'
            raw_text_accumulator.append('\n'.join(items) + '\n')

        elif type_name == 'ol':
            items = [l.strip() for l in content.split('\n') if l.strip()]
            result += '<ol>' + ''.join(
                f'<li>{render_inline(esc(re.sub(r"^\d+\.\s*", "", l)))}</li>' for l in items
            ) + '</ol>'
            raw_text_accumulator.append('\n'.join(items) + '\n')

        elif type_name in ('alert', 'tip'):
            alert_type = attrs.get('type', 'info')
            alert_title = attrs.get('title', '')
            result += f'<div class="alert alert-{esc(alert_type)}">'
            if alert_title:
                result += f'<strong>{esc(alert_title)}</strong>'
            parts = [p.strip() for p in content.split('\n') if p.strip()]
            result += ''.join(f'<p>{render_inline(esc(p))}</p>' for p in parts)
            result += '</div>'
            raw_text_accumulator.append(content + '\n')

        elif type_name in ('btn', 'button'):
            href = attrs.get('href', '#')
            color = attrs.get('color', 'primary')
            result += f'<a href="{esc(href)}" class="btn btn-{esc(color)}" target="_blank">{render_inline(esc(trimmed))}</a>'

        elif type_name == 'table':
            rows = [r.strip() for r in content.strip().split('\n') if r.strip()]
            if rows:
                headers = [c.strip() for c in rows[0].split('|') if c.strip()]
                result += '<table><thead><tr>'
                result += ''.join(f'<th>{esc(h)}</th>' for h in headers)
                result += '</tr></thead><tbody>'
                for r in rows[1:]:
                    cells = [c.strip() for c in r.split('|') if c.strip()]
                    result += '<tr>' + ''.join(f'<td>{render_inline(esc(c))}</td>' for c in cells) + '</tr>'
                result += '</tbody></table>'
            raw_text_accumulator.append(content + '\n')

        elif type_name == 'hr':
            result += '<hr>'

        elif type_name in ('image', 'img'):
            src = attrs.get('src', '')
            alt = attrs.get('alt', '')
            width = attrs.get('width', '100%')
            caption = attrs.get('caption', '')
            result += f'<figure style="text-align:center;margin:20px 0;">'
            result += f'<img src="{esc(src)}" alt="{esc(alt)}" style="max-width:{esc(width)};height:auto;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.1);">'
            if caption:
                result += f'<figcaption style="margin-top:8px;color:var(--text-secondary);font-size:0.9rem;">{esc(caption)}</figcaption>'
            result += '</figure>'

        elif type_name == 'video':
            src = attrs.get('src', '')
            result += f'<div class="video-player-container" data-src="{esc(src)}" style="margin:20px 0;max-width:100%;">'
            result += '  <video preload="metadata"></video>'
            result += '  <div class="video-poster"><button class="play-button"></button></div>'
            result += '  <div class="video-controls">'
            result += '    <button class="vp-control-btn vp-play-pause"><i class="fas fa-play"></i></button>'
            result += '    <div class="vp-progress-container"><div class="vp-progress-bar"><div class="vp-progress-fill"></div><div class="vp-progress-handle"></div></div></div>'
            result += '    <span class="vp-time-display">00:00 / 00:00</span>'
            result += '    <div class="vp-volume-container"><button class="vp-control-btn vp-volume-btn"><i class="fas fa-volume-up"></i></button><div class="vp-volume-slider"><div class="vp-volume-fill"></div></div></div>'
            result += '    <button class="vp-control-btn vp-fullscreen-btn"><i class="fas fa-expand"></i></button>'
            result += '  </div>'
            result += '  <div class="vp-loading"></div>'
            result += '</div>'

        elif type_name == 'audio':
            src = attrs.get('src', '')
            title = attrs.get('title', '未知曲目')
            artist = attrs.get('artist', '')
            result += f'<div class="audio-player-container" data-src="{esc(src)}" data-title="{esc(title)}" data-artist="{esc(artist)}" style="margin:20px 0;"></div>'

        elif type_name == 'pdf':
            src = attrs.get('src', '')
            width = attrs.get('width', '100%')
            height = attrs.get('height', '800px')
            result += f'<div style="margin:20px 0;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.1);">'
            result += f'<iframe src="{esc(src)}" width="{esc(width)}" height="{esc(height)}" style="border:none;border-radius:8px;"></iframe>'
            result += '</div>'

        elif type_name == 'html':
            result += content
            # Extract raw text from HTML
            text_only = re.sub(r'<[^>]+>', '', content)
            raw_text_accumulator.append(text_only + '\n')

        else:
            if trimmed:
                result += f'<p>{render_inline(esc(trimmed))}</p>'
                raw_text_accumulator.append(trimmed + '\n')

        return result

    raw_text_collector = []
    while i < len(lines):
        raw_line = lines[i]
        trimmed_line = raw_line.strip()

        if trimmed_line == '':
            i += 1
            continue

        if trimmed_line.startswith('['):
            bracket_end = trimmed_line.find(']')
            if bracket_end != -1:
                tag_full = trimmed_line[1:bracket_end]
                space_idx = tag_full.find(' ')
                if space_idx == -1:
                    tag_name = tag_full.lower()
                    attr_str = ''
                else:
                    tag_name = tag_full[:space_idx].lower()
                    attr_str = tag_full[space_idx + 1:]

                after_bracket = trimmed_line[bracket_end + 1:].strip()
                close_tag = f'[/{tag_name}]'

                # 行内标签
                lower_after = after_bracket.lower()
                inline_close = lower_after.find(close_tag)
                if inline_close != -1:
                    content = after_bracket[:inline_close].strip()
                    attrs = parse_attrs(attr_str)
                    html_out = render_block(tag_name, content, attrs, raw_text_collector)
                    if html_out:
                        blocks.append(html_out)
                    i += 1
                    continue

                # 容器标签
                if tag_name in container_tags:
                    content_lines = []
                    if after_bracket:
                        content_lines.append(after_bracket)
                    i += 1
                    while i < len(lines):
                        if lines[i].strip().lower() == close_tag:
                            i += 1
                            break
                        content_lines.append(lines[i])
                        i += 1
                    content = '\n'.join(content_lines)
                    attrs = parse_attrs(attr_str)
                    html_out = render_block(tag_name, content, attrs, raw_text_collector)
                    if html_out:
                        blocks.append(html_out)
                    continue

                # 单行标签
                if after_bracket:
                    attrs = parse_attrs(attr_str)
                    html_out = render_block(tag_name, after_bracket, attrs, raw_text_collector)
                    if html_out:
                        blocks.append(html_out)
                    i += 1
                    continue

                # 自闭合标签
                if tag_name in self_closing:
                    attrs = parse_attrs(attr_str)
                    html_out = render_block(tag_name, '', attrs, raw_text_collector)
                    if html_out:
                        blocks.append(html_out)
                    i += 1
                    continue

                # 多行内容标签
                if tag_name in ('h1', 'h2', 'h3', 'p'):
                    content_lines = []
                    i += 1
                    while i < len(lines) and lines[i].strip() != '' and not lines[i].strip().startswith('['):
                        content_lines.append(lines[i])
                        i += 1
                    content = '\n'.join(content_lines)
                    attrs = {}
                    html_out = render_block(tag_name, content, attrs, raw_text_collector)
                    if html_out:
                        blocks.append(html_out)
                    continue

        # 普通段落
        para_lines = []
        while i < len(lines) and lines[i].strip() != '':
            para_lines.append(lines[i])
            i += 1
        if para_lines:
            content = '\n'.join(para_lines)
            html_out = render_block('text', content, {}, raw_text_collector)
            if html_out:
                blocks.append(html_out)

    raw_text = '\n'.join(raw_text_collector)
    return meta, '\n'.join(blocks), raw_text


def generate_article_html(blog_path, article_meta, article_body_html, article_raw_text, article_info):
    """为单篇文章生成 index.html"""
    with open(DECODER_HTML, 'r', encoding='utf-8') as f:
        template = f.read()

    title = article_meta.get('title', '无标题')
    date = article_meta.get('date', '')
    author = article_meta.get('author', 'ciallo0721-cmd')
    tags_str = article_meta.get('tag', '')
    tags = [t.strip() for t in re.split(r'[,\s]+', tags_str) if t.strip()]

    # 从文章信息获取 excerpt 和分类
    excerpt = article_info.get('excerpt', '')
    category = article_info.get('category', '')
    article_id = str(article_info.get('id', ''))
    read_time = article_info.get('readTime', 5)

    # 生成完整文章路径（相对于 domain）
    sub_path = os.path.relpath(blog_path, BLOG_ROOT).replace('\\', '/')
    canonical_url = f'{DOMAIN}/{sub_path}/'
    # 标准化：确保路径末尾有 /
    canonical_url = canonical_url.rstrip('/') + '/'

    # 构建描述
    description = excerpt if excerpt else f'{title} - ciallo0721-cmd 的个人博客文章'
    if len(description) > 160:
        description = description[:157] + '...'

    # JSON-LD 结构化数据
    json_ld = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "author": {
            "@type": "Person",
            "name": "ciallo0721-cmd"
        },
        "datePublished": date,
        "description": excerpt,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonical_url
        }
    }
    if tags:
        json_ld["keywords"] = ", ".join(tags)
    json_ld_str = json.dumps(json_ld, ensure_ascii=False)

    # 面包屑导航 JSON-LD
    breadcrumb_ld = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "首页", "item": f"{DOMAIN}/"},
            {"@type": "ListItem", "position": 2, "name": "博客", "item": f"{DOMAIN}/blog/"},
            {"@type": "ListItem", "position": 3, "name": title, "item": canonical_url}
        ]
    }
    breadcrumb_ld_str = json.dumps(breadcrumb_ld, ensure_ascii=False)

    # Tags HTML
    tags_html = ''
    if tags:
        tags_html = '<div class="article-tags">' + ''.join(
            f'<span class="article-tag">{esc(t)}</span>' for t in tags
        ) + '</div>'

    # 相邻文章导航
    nav_html = ''
    if article_id:
        # 获取相邻文章（从 articles-data.js）
        sorted_articles = sorted(
            [a for a in ARTICLES_CACHE if a['id']],
            key=lambda x: x['date'],
            reverse=True
        )
        idx = None
        for j, a in enumerate(sorted_articles):
            if str(a['id']) == article_id:
                idx = j
                break
        if idx is not None:
            nav_parts = []
            if idx < len(sorted_articles) - 1:
                prev_article = sorted_articles[idx + 1]
                prev_path = PATH_MAP.get(str(prev_article['id']), str(prev_article['id']) + '/')
                nav_parts.append(
                    f'<a href="/blog/{prev_path}?blog_id={prev_article["id"]}" '
                    f'style="display:inline-flex;align-items:center;gap:8px;'
                    f'background:linear-gradient(135deg,var(--bili-pink),var(--bili-blue));'
                    f'color:white;padding:10px 20px;border-radius:25px;text-decoration:none;'
                    f'font-weight:600;font-size:0.95rem;transition:var(--transition);">'
                    f'&larr; 上一篇：{esc(prev_article["title"])}</a>'
                )
            else:
                nav_parts.append('<div></div>')

            if idx > 0:
                next_article = sorted_articles[idx - 1]
                next_path = PATH_MAP.get(str(next_article['id']), str(next_article['id']) + '/')
                nav_parts.append(
                    f'<a href="/blog/{next_path}?blog_id={next_article["id"]}" '
                    f'style="display:inline-flex;align-items:center;gap:8px;'
                    f'background:linear-gradient(135deg,var(--bili-pink),var(--bili-blue));'
                    f'color:white;padding:10px 20px;border-radius:25px;text-decoration:none;'
                    f'font-weight:600;font-size:0.95rem;transition:var(--transition);">'
                    f'下一篇：{esc(next_article["title"])} &rarr;</a>'
                )
            else:
                nav_parts.append('<div></div>')

            nav_html = (
                '<div style="display:flex;justify-content:space-between;margin-top:40px;'
                'padding-top:30px;border-top:1px solid rgba(0,0,0,0.1);flex-wrap:wrap;gap:15px;">'
                + ''.join(nav_parts) +
                '</div>'
            )

    # 替换标题
    article_html_new = template.replace('<title>加载中...</title>', f'<title>{esc(title)} - ciallo0721-cmd</title>')

    # 添加 SEO meta 标签（在 </head> 前）
    seo_meta = (
        f'<meta name="description" content="{esc(description)}">\n'
        f'<meta name="keywords" content="{esc(", ".join(tags)) if tags else ""}">\n'
        f'<link rel="canonical" href="{esc(canonical_url)}">\n'
        f'<meta property="og:title" content="{esc(title)}">\n'
        f'<meta property="og:description" content="{esc(description)}">\n'
        f'<meta property="og:url" content="{esc(canonical_url)}">\n'
        f'<meta property="og:type" content="article">\n'
        f'<meta property="article:published_time" content="{esc(date)}">\n'
        f'<meta property="article:author" content="ciallo0721-cmd">\n'
        f'<meta name="twitter:card" content="summary_large_image">\n'
        f'<meta name="twitter:title" content="{esc(title)}">\n'
        f'<meta name="twitter:description" content="{esc(description)}">\n'
        f'<script type="application/ld+json">\n{json_ld_str}\n</script>\n'
        f'<script type="application/ld+json">\n{breadcrumb_ld_str}\n</script>\n'
    )
    article_html_new = article_html_new.replace('</head>', seo_meta + '\n</head>')

    # 用服务器端渲染的内容替换 loading 状态
    rendered_content = (
        '<div class="article-page">\n'
        '<div class="article-card">\n'
        '<div class="article-head">\n'
        f'<div class="article-num">文章 #{esc(article_id)}</div>\n'
        f'<h1 class="article-title">{esc(title)}</h1>\n'
        '<div class="article-meta">\n'
        f'<div class="article-date">📅 {esc(date)}</div>\n'
        f'<div class="article-date">✍ {esc(author)}</div>\n'
        '<div class="article-date">📖 阅读约 ' + str(read_time) + ' 分钟</div>\n'
        '</div>\n'
        + tags_html +
        '</div>\n'
        '<div class="article-body">\n'
        + article_body_html +
        '</div>\n'
        '</div>\n'
        + nav_html +
        '</div>\n'
    )

    article_html_new = article_html_new.replace(
        '<div id="app">\n'
        '  <div class="loading-wrap">\n'
        '    <div class="spinner"></div>\n'
        '    <p>正在加载文章...</p>\n'
        '  </div>\n'
        '</div>',
        '<div id="app">\n'
        + rendered_content +
        '\n</div>'
    )

    # 添加 JS 跳过 XHR 直接渲染的逻辑
    prerender_script = (
        '<script>\n'
        '(function(){\n'
        '  // 服务器端已渲染内容，不需要加载 loading\n'
        '  // 如果用户启用 JS，这会让视频/音频播放器正常工作\n'
        '  if(typeof VideoPlayer !== "undefined" && VideoPlayer.initAll) {\n'
        '    setTimeout(function(){ VideoPlayer.initAll(); }, 0);\n'
        '  }\n'
        '  if(typeof AudioPlayer !== "undefined" && AudioPlayer.initAll) {\n'
        '    setTimeout(function(){ AudioPlayer.initAll(); }, 0);\n'
        '  }\n'
        '  // 标记已预渲染，避免 decoder.js 重复加载\n'
        '  window.__PRERENDERED = true;\n'
        '})();\n'
        '</script>\n'
    )
    article_html_new = article_html_new.replace('</body>', prerender_script + '\n</body>')

    return article_html_new


def find_blog_files():
    """扫描 blog 目录下所有 .blog 文件"""
    blog_files = []
    for root, dirs, files in os.walk(os.path.join(BLOG_DIR)):
        for f in files:
            if f.endswith('.blog') and f != 'sample.blog':
                blog_files.append(os.path.join(root, f))
    return blog_files


def main():
    import sys
    global PATH_MAP, ARTICLES_CACHE

    check_only = '--check' in sys.argv

    # 加载文章数据
    path_map, articles = load_articles_data()
    PATH_MAP = path_map
    ARTICLES_CACHE = articles

    # 构建 id -> 文章信息的映射
    article_info_map = {}
    for a in articles:
        article_info_map[str(a['id'])] = a

    blog_files = find_blog_files()
    print(f'找到 {len(blog_files)} 个 .blog 文件')

    if check_only:
        missing = 0
        for bf in blog_files:
            blog_dir = os.path.dirname(bf)
            idx_path = os.path.join(blog_dir, 'index.html')
            if not os.path.exists(idx_path):
                print(f'  [缺少] {bf}')
                missing += 1
        print(f'\n缺少 index.html 的文章数: {missing}/{len(blog_files)}')
        return

    generated = 0
    failed = 0
    for bf in blog_files:
        blog_dir = os.path.dirname(bf)
        idx_path = os.path.join(blog_dir, 'index.html')
        blog_filename = os.path.basename(bf)

        # 提取文章 ID（.blog 文件名去掉后缀）
        article_id = os.path.splitext(blog_filename)[0]
        article_info = article_info_map.get(article_id, {})

        print(f'  预渲染: {bf} (ID={article_id})')

        try:
            meta, body_html, raw_text = parse_blog_file(bf)
            article_html = generate_article_html(blog_dir, meta, body_html, raw_text, article_info)

            with open(idx_path, 'w', encoding='utf-8') as f:
                f.write(article_html)

            print(f'    -> 已生成 {idx_path}')
            generated += 1
        except Exception as e:
            print(f'    [失败] {e}')
            failed += 1

    print(f'\n=== 完成 ===')
    print(f'生成: {generated} 个 index.html')
    if failed:
        print(f'失败: {failed} 个')


if __name__ == '__main__':
    main()
