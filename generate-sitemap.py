#!/usr/bin/env python3
"""生成完整的 sitemap.xml（带 URL 编码，修复中文路径问题）

重要说明：
- 本脚本使用 articles-data.js 中每篇文章的 `date` 字段作为 <lastmod> 日期
- 为了保持 Bing/Google 索引稳定，请不要随意修改 articles-data.js 中文章的 `date` 字段
- 如果确实需要让搜索引擎重新索引某篇文章，再修改该文章的 `date` 字段
- 或者，可以在 articles-data.js 中为文章添加 `sitemapLastmod` 字段（可选），本脚本会优先使用这个字段
"""
import re, os
from urllib.parse import quote

blog_root = r"G:\EmoScan Pro\ciallo0721-cmd.github.io"
domain = "https://ciallo0721-cmd.top"

# 解析 pathMap
with open(os.path.join(blog_root, 'articles-data.js'), 'r', encoding='utf-8') as f:
    content = f.read()

path_map = {}
m = re.search(r'_pathMap:\s*\{([^}]+)\}', content, re.DOTALL)
if m:
    entries = re.findall(r'"(\d+)":\s*"([^"]+)"', m.group(1))
    for k, v in entries:
        path_map[k] = v

# 解析文章数据
articles = []
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
    if stripped.startswith('];'):
        break
    for ch in line:
        if ch == '{':
            brace_depth += 1
            if brace_depth == 1:
                current_block = ''
        elif ch == '}':
            brace_depth -= 1
            if brace_depth == 0:
                block = current_block + '}'
                a = {}
                id_m = re.search(r'id:\s*(\d+)', block)
                if id_m: a['id'] = id_m.group(1)
            title_m = re.search(r'title:\s*"([^"]*)"', block)
            if title_m: a['title'] = title_m.group(1)
            date_m = re.search(r'date:\s*"([^"]*)"', block)
            if date_m: a['date'] = date_m.group(1)
            # 读取可选的 sitemapLastmod 字段（用于控制 sitemap 中的 lastmod 日期）
            sitemap_lastmod_m = re.search(r'sitemapLastmod:\s*"([^"]*)"', block)
            if sitemap_lastmod_m: a['sitemapLastmod'] = sitemap_lastmod_m.group(1)
            if a.get('id'):
                    articles.append(a)
                current_block = ''
        if brace_depth >= 1:
            current_block += ch

# 按日期排序
articles.sort(key=lambda x: x.get('date', ''), reverse=True)

def encode_url_path(path):
    """URL 编码路径中的非 ASCII 字符，并对 & 做 XML 转义"""
    encoded = quote(path, safe='/:@!$\'()*+,;=-._~')
    # XML 中 & 必须转义为 &amp;
    encoded = encoded.replace('&', '&amp;')
    # 如果路径末尾没有 / 则添加
    if not encoded.endswith('/') and '.' not in encoded:
        encoded += '/'
    return encoded

# 生成 sitemap
urls = []

# 静态页面
urls.append((encode_url_path('/index.html'), '2026-06-20', 'weekly', '1.0'))
urls.append((encode_url_path('/blog/'), '2026-06-20', 'daily', '0.9'))
urls.append((encode_url_path('/aboutme.html'), '2026-06-01', 'yearly', '0.7'))
urls.append((encode_url_path('/adss.html'), '2026-06-01', 'yearly', '0.6'))
urls.append((encode_url_path('/privacy.html'), '2026-06-01', 'yearly', '0.5'))
urls.append((encode_url_path('/help.html'), '2026-06-01', 'yearly', '0.5'))
urls.append((encode_url_path('/status.html'), '2026-06-19', 'monthly', '0.6'))

# 游戏页面
games = [
    ('/bjqy/index.html', '0.6'),
    ('/fors/index.html', '0.6'),
    ('/LAIDB/index.html', '0.6'),
    ('/zmdspp/indexzm.html', '0.6'),
    ('/91/index.html', '0.6'),
    ('/dkdfj/index.html', '0.6'),
]
for path, pri in games:
    urls.append((encode_url_path(path), '2026-06-01', 'monthly', pri))

# 百科页面
urls.append((encode_url_path('/wiki/index.html'), '2026-06-13', 'weekly', '0.8'))

# 所有博客文章
for a in articles:
    aid = a['id']
    path = path_map.get(aid, aid + '/')
    # 优先使用 sitemapLastMod 字段，否则使用 date 字段
    lastmod = a.get('sitemapLastMod', a.get('date', '2026-06-01'))
    full_path = f'/blog/{path}'
    urls.append((encode_url_path(full_path), lastmod, 'monthly', '0.6'))

# 生成 XML
xml_parts = ['<?xml version="1.0" encoding="UTF-8"?>']
xml_parts.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
xml_parts.append('  <!-- ========== 站点地图 (自动生成 2026-06-20) ========== -->')

for loc, lastmod, changefreq, priority in urls:
    xml_parts.append(f'  <url>')
    xml_parts.append(f'    <loc>{domain}{loc}</loc>')
    xml_parts.append(f'    <lastmod>{lastmod}</lastmod>')
    xml_parts.append(f'    <changefreq>{changefreq}</changefreq>')
    xml_parts.append(f'    <priority>{priority}</priority>')
    xml_parts.append(f'  </url>')

xml_parts.append('</urlset>')
xml_content = '\n'.join(xml_parts)

output_path = os.path.join(blog_root, 'sitemap.xml')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(xml_content)

print(f"已生成 sitemap.xml: {len(urls)} 个 URL")
print("所有中文路径已进行 URL 编码")
