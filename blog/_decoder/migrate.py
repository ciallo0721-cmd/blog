#!/usr/bin/env python3
"""
BlockScript 迁移脚本 v2.0
将现有文章 HTML 迁移到新架构（index.html 解码器 + .blog 文件）
用法：python migrate.py
"""

import os
import re
import shutil
from html.parser import HTMLParser

BLOG_DIR = "G:/EmoScan Pro/ciallo0721-cmd.github.io/blog"
DECODER_DIR = os.path.join(BLOG_DIR, "_decoder")
SITE_ROOT = "https://91vip.xn--32v.ink"

# 需要处理的文章目录（按顺序）
ARTICLE_DIRS = [
    "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "10", "11", "12", "13", "14", "15", "16", "17", "18", "19",
    "20", "21", "22", "23", "50", "51", "52",
    "manga-1", "pdf-1", "video-1"
]

def read_file(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except:
        try:
            with open(path, 'r', encoding='gbk') as f:
                return f.read()
        except Exception as e:
            print(f"    读取失败: {e}")
            return None

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def extract_meta(html):
    """提取文章元数据"""
    meta = {'title': '', 'date': '', 'author': 'ciallo0721-cmd', 'tag': '', 'desc': ''}
    
    m = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)
    if m:
        title = m.group(1).replace(' - ciallo0721-cmd的文章', '').strip()
        meta['title'] = title
    
    m = re.search(r'<meta name="description" content="(.*?)"', html, re.IGNORECASE)
    if m:
        meta['desc'] = m.group(1).strip()
    
    # 尝试从 HTML 内容中提取日期
    m = re.search(r'(\d{4})[./年-](\d{1,2})[./月-](\d{1,2})', html)
    if m:
        meta['date'] = f"{m.group(1)}-{m.group(2).zfill(2)}-{m.group(3).zfill(2)}"
    else:
        meta['date'] = '2026-06-15'
    
    # 提取标签（从关键词 meta 或内容）
    m = re.search(r'<meta name="keywords" content="(.*?)"', html, re.IGNORECASE)
    if m:
        keywords = m.group(1).strip()
        # 取前3个关键词作为标签
        tags = [t.strip() for t in keywords.split(',')[:3]]
        meta['tag'] = ', '.join(tags)
    
    return meta

def html_to_blocks(html_content):
    """
    将 HTML 内容转换为 BlockScript 区块
    这是一个简化版转换，尽量保留原有样式
    """
    lines = []
    
    # 去除 script 和 style 标签
    html_content = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
    html_content = re.sub(r'<style[^>]*>.*?</style>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
    
    # 按行分割原有 HTML
    parts = html_content.split('\n')
    
    in_article = False
    in_pre = False
    pre_content = []
    pre_lang = ''
    
    for line in parts:
        stripped = line.strip()
        
        # 检测文章正文开始
        if 'article-body' in stripped or 'article-card' in stripped:
            in_article = True
            continue
        
        if not in_article and 'article' not in stripped:
            continue
        
        # 跳过导航等元素
        if any(x in stripped for x in ['nav', 'navbar', 'footer', 'header', 'nav-container']):
            continue
        
        # 处理标题
        h1 = re.match(r'<h1[^>]*>(.*?)</h1>', stripped, re.IGNORECASE | re.DOTALL)
        h2 = re.match(r'<h2[^>]*>(.*?)</h2>', stripped, re.IGNORECASE | re.DOTALL)
        h3 = re.match(r'<h3[^>]*>(.*?)</h3>', stripped, re.IGNORECASE | re.DOTALL)
        
        if h1:
            text = re.sub(r'<[^>]+>', '', h1.group(1)).strip()
            if text:
                lines.append(f"[H1] {text}")
            continue
        if h2:
            text = re.sub(r'<[^>]+>', '', h2.group(1)).strip()
            if text:
                lines.append(f"[H2] {text}")
            continue
        if h3:
            text = re.sub(r'<[^>]+>', '', h3.group(1)).strip()
            if text:
                lines.append(f"[H3] {text}")
            continue
        
        # 处理代码块
        if re.match(r'<pre', stripped, re.IGNORECASE):
            in_pre = True
            pre_content = []
            lang_match = re.search(r'language-(\w+)', stripped, re.IGNORECASE)
            if lang_match:
                pre_lang = lang_match.group(1)
            continue
        
        if in_pre:
            if '</pre>' in stripped:
                in_pre = False
                code_text = '\n'.join(pre_content)
                lang_str = f" lang={pre_lang}" if pre_lang else ""
                lines.append(f"[Code{lang_str}]")
                lines.append(code_text)
                lines.append("[/code]")
                pre_lang = ''
            else:
                # 去除 HTML 转义
                clean = stripped.replace('<code>', '').replace('</code>', '')
                clean = clean.replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&')
                pre_content.append(clean)
            continue
        
        # 处理引用
        if stripped.startswith('<blockquote'):
            quote_text = re.sub(r'<[^>]+>', '', stripped).strip()
            if quote_text:
                lines.append("[Quote]")
                lines.append(quote_text)
                lines.append("[/quote]")
            continue
        
        # 处理列表
        if '<ul' in stripped or '<ol' in stripped:
            # 简化：把列表项提取出来
            items = re.findall(r'<li[^>]*>(.*?)</li>', stripped, re.DOTALL | re.IGNORECASE)
            if items:
                is_ol = '<ol' in stripped
                for idx, item in enumerate(items, 1):
                    text = re.sub(r'<[^>]+>', '', item).strip()
                    if text:
                        if is_ol:
                            lines.append(f"{idx}. {text}")
                        else:
                            lines.append(f"- {text}")
            continue
        
        # 处理表格
        if '<table' in stripped:
            # 提取表格内容
            headers = re.findall(r'<th[^>]*>(.*?)</th>', stripped, re.DOTALL | re.IGNORECASE)
            rows = re.findall(r'<td[^>]*>(.*?)</td>', stripped, re.DOTALL | re.IGNORECASE)
            if headers:
                lines.append("[Table]")
                lines.append("|".join([re.sub(r'<[^>]+>', '', h).strip() for h in headers]))
                # 简化处理：每行数据
                for i in range(0, len(rows), len(headers)):
                    row_data = rows[i:i+len(headers)]
                    lines.append("|".join([re.sub(r'<[^>]+>', '', c).strip() for c in row_data]))
                lines.append("[/table]")
            continue
        
        # 处理水平线
        if '<hr' in stripped:
            lines.append("[HR]")
            continue
        
        # 处理普通段落
        if stripped.startswith('<p') or (stripped and not stripped.startswith('<')):
            text = re.sub(r'<[^>]+>', '', stripped).strip()
            if text:
                lines.append(text)
            continue
    
    # 如果没有提取到内容，返回原始 HTML 的 [HTML] 区块
    if len(lines) < 3:
        return None, html_content
    
    return lines, None

def migrate_article(article_id):
    """迁移单篇文章"""
    article_dir = os.path.join(BLOG_DIR, article_id)
    old_html_path = os.path.join(article_dir, "index.html")
    blog_path = os.path.join(article_dir, f"{article_id}.blog")
    new_html_path = os.path.join(article_dir, "index.html")
    decoder_js_path = os.path.join(article_dir, "decoder.js")
    
    if not os.path.exists(old_html_path):
        print(f"  [跳过] {article_id}: 找不到 index.html")
        return False
    
    # 读取原有 HTML
    html = read_file(old_html_path)
    if html is None:
        return False
    
    # 提取元数据
    meta = extract_meta(html)
    
    # 尝试转换 HTML 为 BlockScript
    blocks, raw_html = html_to_blocks(html)
    
    # 生成 .blog 文件内容
    blog_lines = []
    blog_lines.append(f"[Title] {meta['title']}")
    blog_lines.append(f"[Date] {meta['date']}")
    blog_lines.append(f"[Author] {meta['author']}")
    if meta['tag']:
        blog_lines.append(f"[Tag] {meta['tag']}")
    blog_lines.append("")
    blog_lines.append("[正文开始]")
    blog_lines.append("")
    
    if blocks is None:
        # 转换失败，用 [HTML] 区块包裹原始内容
        blog_lines.append("[HTML]")
        blog_lines.append(raw_html)
        blog_lines.append("[/html]")
    else:
        blog_lines.extend(blocks)
    
    blog_content = "\n".join(blog_lines)
    
    # 备份原有 index.html
    backup_path = os.path.join(article_dir, "index.bak.html")
    if not os.path.exists(backup_path):
        shutil.copy2(old_html_path, backup_path)
        print(f"  [备份] {article_id}: index.html -> index.bak.html")
    
    # 写 .blog 文件
    write_file(blog_path, blog_content)
    print(f"  [生成] {article_id}.blog")
    
    # 复制新的解码器文件
    shutil.copy2(os.path.join(DECODER_DIR, "index.html"), new_html_path)
    shutil.copy2(os.path.join(DECODER_DIR, "decoder.js"), decoder_js_path)
    print(f"  [解码器] 已复制 index.html + decoder.js")
    
    return True

def main():
    print("=" * 60)
    print("  BlockScript 批量迁移脚本 v2.0")
    print("=" * 60)
    print()
    
    # 先确认 decoder 文件存在
    if not os.path.exists(os.path.join(DECODER_DIR, "index.html")):
        print("[错误] _decoder/index.html 不存在！")
        return
    if not os.path.exists(os.path.join(DECODER_DIR, "decoder.js")):
        print("[错误] _decoder/decoder.js 不存在！")
        return
    
    success = 0
    for article_id in ARTICLE_DIRS:
        article_dir = os.path.join(BLOG_DIR, article_id)
        if not os.path.exists(article_dir):
            print(f"[跳过] {article_id}: 目录不存在")
            continue
        
        print(f"处理文章 #{article_id}...")
        if migrate_article(article_id):
            success += 1
    
    print()
    print("=" * 60)
    print(f"  迁移完成！成功：{success}/{len(ARTICLE_DIRS)}")
    print(f"  原有 index.html 已备份为 index.bak.html")
    print("=" * 60)
    print()
    print("下一步：")
    print("1. 检查几篇文章的显示效果")
    print("2. 确认无误后，可以删除 index.bak.html")
    print("3. 提交并推送代码")

if __name__ == "__main__":
    main()
