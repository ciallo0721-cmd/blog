#!/usr/bin/env python3
"""批量迁移：复制解码器 + 生成 .blog 文件（[HTML]模式）"""
import os
import re
import shutil

BLOG = "G:/EmoScan Pro/ciallo0721-cmd.github.io/blog"
DECODER = os.path.join(BLOG, "_decoder")

DIRS = [
    "1","2","3","4","5","6","7","8","9",
    "10","11","12","13","14","15","16","17","18","19",
    "20","21","22","23","50","51","52","manga-1","pdf-1","video-1"
]

def extract_title(html):
    m = re.search(r'<title>(.*?)</title>', html, re.I)
    if m:
        return m.group(1).replace(' - ciallo0721-cmd的文章','').strip()
    return '无标题'

def extract_date(html):
    # 从文件名或内容推断日期
    m = re.search(r'(\d{4})[年\-/](\d{1,2})[月\-/](\d{1,2})', html)
    if m:
        return f"{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}"
    return '2026-06-15'

def extract_body(html):
    """提取 article-body 内容，找不到就返回整个 body"""
    m = re.search(r'<div class="article-body">(.*?)</body>', html, re.DOTALL | re.I)
    if m:
        return m.group(1).strip()
    m = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL | re.I)
    if m:
        return m.group(1).strip()
    return html

for d in DIRS:
    src_dir = os.path.join(BLOG, d)
    if not os.path.isdir(src_dir):
        print(f"[跳过] 目录不存在: {d}")
        continue

    old_html = os.path.join(src_dir, "index.html")
    if not os.path.exists(old_html):
        print(f"[跳过] {d}: 无 index.html")
        continue

    # 读取原有 HTML
    try:
        with open(old_html, 'r', encoding='utf-8') as f:
            html = f.read()
    except:
        print(f"[失败] {d}: 读取 HTML 失败")
        continue

    # 备份原有 index.html
    bak = os.path.join(src_dir, "index.bak.html")
    if not os.path.exists(bak):
        shutil.copy2(old_html, bak)

    # 提取信息
    title = extract_title(html)
    date = extract_date(html)
    body = extract_body(html)

    # 生成 .blog 文件
    blog_content = f"""[Title] {title}
[Date] {date}
[Author] ciallo0721-cmd
[Tag] 文章

[正文开始]

[HTML]
{body}
[/html]
"""

    blog_path = os.path.join(src_dir, f"{d}.blog")
    with open(blog_path, 'w', encoding='utf-8') as f:
        f.write(blog_content)

    # 复制新解码器
    shutil.copy2(os.path.join(DECODER, "index.html"), os.path.join(src_dir, "index.html"))
    shutil.copy2(os.path.join(DECODER, "decoder.js"), os.path.join(src_dir, "decoder.js"))

    print(f"[完成] {d}: .blog + 解码器已更新")

print("\n全部完成！原有 index.html 已备份为 index.bak.html")
