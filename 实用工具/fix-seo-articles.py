#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""批量修复博客文章的 SEO 标签（幂等，可反复运行）

对 blog/*/{id}/index.html 逐一执行：
1. 缺 canonical → 按站内相对路径补上
2. 整页无 og: meta → 注入 Open Graph + Twitter Card 块（从已有 title/description 提取）
3. 无 BlogPosting JSON-LD → 注入文章结构化数据

用法: python 实用工具/fix-seo-articles.py
"""
import os, re, html, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOMAIN = "https://ciallo0721-cmd.top"
BLOG = os.path.join(ROOT, "blog")


def find_articles():
    out = []
    for cat in os.listdir(BLOG):
        catp = os.path.join(BLOG, cat)
        if not os.path.isdir(catp) or cat in ("muban",):
            continue
        for aid in os.listdir(catp):
            f = os.path.join(catp, aid, "index.html")
            if os.path.isfile(f):
                out.append(f)
    return out


def rel_url(f):
    rel = os.path.relpath(f, ROOT).replace("\\", "/")
    return "/" + os.path.dirname(rel) + "/"


def esc(s):
    return html.escape(s, quote=True)


def main():
    files = sorted(find_articles())
    print(f"共发现 {len(files)} 篇文章")
    stats = {"canonical": 0, "og": 0, "jsonld": 0, "skip": 0, "error": []}
    for f in files:
        try:
            with open(f, "r", encoding="utf-8") as fh:
                src = fh.read()
        except Exception as e:
            stats["error"].append(f"{f}: {e}")
            continue

        if src.count("</head>") != 1:
            stats["error"].append(f"{f}: </head> 数量异常 ({src.count('</head>')}), 跳过")
            continue

        url = DOMAIN + rel_url(f)
        m_title = re.search(r"<title>(.*?)</title>", src, re.S)
        m_desc = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', src)
        raw_title = m_title.group(1).strip() if m_title else "文章"
        raw_desc = html.unescape(m_desc.group(1).strip()) if m_desc else raw_title
        # 去掉标题里的站点后缀（如 " - ciallo0721-cmd的文章" / " | ciallo0721-cmd"）
        title = re.sub(r"\s*[-|]\s*ciallo0721-cmd.*$", "", raw_title).strip()
        if not title:
            title = raw_title
        insert = []

        # 1) canonical
        if 'rel="canonical"' not in src:
            insert.append(f'    <link rel="canonical" href="{esc(url)}">')
            stats["canonical"] += 1

        # 2) Open Graph / Twitter
        if 'property="og:' not in src:
            og = "\n".join([
                "    <!-- Open Graph / 社交分享预览 -->",
                '    <meta property="og:type" content="article">',
                f'    <meta property="og:title" content="{esc(title)}">',
                f'    <meta property="og:description" content="{esc(raw_desc[:150])}">',
                f'    <meta property="og:url" content="{esc(url)}">',
                '    <meta property="og:site_name" content="ciallo0721-cmd">',
                f'    <meta property="og:image" content="{DOMAIN}/og-image.png">',
                f'    <meta property="og:image:alt" content="{esc(title)}">',
                '    <meta name="twitter:card" content="summary">',
                f'    <meta name="twitter:title" content="{esc(title)}">',
                f'    <meta name="twitter:description" content="{esc(raw_desc[:150])}">',
            ])
            insert.append(og)
            stats["og"] += 1

        # 3) BlogPosting JSON-LD
        if "BlogPosting" not in src:
            j = "\n".join([
                "    <!-- 结构化数据: BlogPosting -->",
                '    <script type="application/ld+json">',
                "    {",
                '      "@context": "https://schema.org",',
                '      "@type": "BlogPosting",',
                f'      "headline": "{esc(title)}",',
                f'      "description": "{esc(raw_desc[:150])}",',
                '      "author": { "@type": "Person", "name": "ciallo0721-cmd" },',
                '      "publisher": { "@type": "Person", "name": "ciallo0721-cmd" },',
                f'      "mainEntityOfPage": "{esc(url)}",',
                f'      "image": "{DOMAIN}/og-image.png",',
                '      "inLanguage": "zh-CN"',
                "    }",
                "    </script>",
            ])
            insert.append(j)
            stats["jsonld"] += 1

        if insert:
            block = "\n".join(insert)
            src = src.replace("</head>", block + "\n</head>", 1)
            with open(f, "w", encoding="utf-8") as fh:
                fh.write(src)
        else:
            stats["skip"] += 1

    print(f"补 canonical: {stats['canonical']} 篇")
    print(f"补 og/twitter: {stats['og']} 篇")
    print(f"补 BlogPosting: {stats['jsonld']} 篇")
    print(f"无需改动: {stats['skip']} 篇")
    if stats["error"]:
        print("异常:")
        for e in stats["error"]:
            print(" -", e)
    else:
        print("无异常")


if __name__ == "__main__":
    sys.exit(main())
