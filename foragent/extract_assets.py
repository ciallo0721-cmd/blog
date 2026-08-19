#!/usr/bin/env python3
"""
CSS/JS 提取工具 —— 自动从所有非 blog HTML 文件中提取内联 CSS/JS
并移动现有的独立 CSS/JS 文件到 css/css/ 和 js/js/ 目录。
"""

import os
import re
import shutil
import hashlib

BASE = r"G:\EmoScan Pro\ciallo0721-cmd.github.io"
CSS_DIR = os.path.join(BASE, "css", "css")
JS_DIR = os.path.join(BASE, "js", "js")

# ===== 需要排除的目录 =====
EXCLUDE_DIRS = {"blog", "build", "node_modules", "__pycache__", ".git",
                ".github", "images", "tests"}

# ===== 独立 CSS 文件映射（源 → 目标） =====
STANDALONE_CSS = {
    # 根目录
    "media-viewer.css": "media-viewer.css",
    "nice-video.css": "nice-video.css",
    "video-player.css": "video-player.css",
    # css/ 目录
    "css/cs.css": "cs.css",
    "css/share.css": "share.css",
    "css/shubiaogenzongtexiao.css": "effects.css",  # 重命名为 effects.css
}

# ===== 独立 JS 文件映射（源 → 目标） =====
STANDALONE_JS = {
    # 根目录
    "_subdomain-router.js": "subdomain-router.js",
    "articles-data.js": "articles-data.js",
    "dynamic-data.js": "dynamic-data.js",
    "geo-check.js": "geo-check.js",
    "index41.js": "index41.js",
    "media-viewer.js": "media-viewer.js",
    "nice-video.js": "nice-video.js",
    "status-data.js": "status-data.js",
    "timeline.js": "timeline.js",
    "video-player.js": "video-player.js",
    "wiki-data.js": "wiki-data.js",
    # css/ 目录
    "css/jsj.js": "jsj.js",
    "css/indexjs.js": "indexjs.js",
    "css/wiki-linker.js": "wiki-linker.js",
    # assets/js/ 目录
    "assets/js/ad-system.js": "ad-system.js",
    "assets/js/gtag-config.js": "gtag-config.js",
    # js/ 目录
    "js/svg-icons.js": "svg-icons.js",
}

# ===== 不需要提取 CSS 的内联样式（像 data-tooltip 这种可以保留） =====
# 但 style 标签里的 CSS 需要提取


def should_exclude_dir(dirpath):
    """检查是否应该排除该目录"""
    rel = os.path.relpath(dirpath, BASE)
    parts = rel.replace("\\", "/").split("/")
    for ex in EXCLUDE_DIRS:
        if ex in parts:
            return True
    return False


def find_html_files():
    """递归查找所有非排除目录的 HTML 文件（排除 blog/ 文章）"""
    html_files = []
    for root, dirs, files in os.walk(BASE):
        # 跳过排除目录
        dirs[:] = [d for d in dirs if not d.startswith(".") and d not in EXCLUDE_DIRS]
        rel = os.path.relpath(root, BASE).replace("\\", "/")
        # 跳过 blog/ 及其所有子目录
        if rel == "." or rel.startswith("blog/"):
            if rel.startswith("blog/"):
                dirs[:] = []
                continue
        for f in files:
            if f.endswith(".html"):
                html_files.append(os.path.join(root, f))
    return html_files


def extract_inline_styles(html_content):
    """
    提取所有 <style>...</style> 标签内容
    返回 (extracted_css, modified_html)
    """
    css_parts = []

    def _replace_style(m):
        content = m.group(1)
        css_parts.append(content)
        return ""  # 删除 style 标签

    # 匹配 <style>...</style>，<style type="text/css">...</style>
    # 注意：<!--[if ...]><style>...</style><![endif]--> 条件注释不匹配
    pattern = r'<style(?:\s+[^>]*)?>(.*?)</style>'
    modified = re.sub(pattern, _replace_style, html_content, flags=re.DOTALL)
    return "\n\n".join(css_parts), modified


def extract_inline_scripts(html_content):
    """
    提取所有内联 <script>...</script>（排除 src 属性和 JSON-LD）
    返回 (extracted_js_parts_list, modified_html)
    """
    js_parts = []
    
    def _replace_script(m):
        attrs = m.group(1) or ""
        content = m.group(2)
        
        # 如果有 src 属性，保留
        if re.search(r'\bsrc\s*=', attrs):
            return m.group(0)
        
        # 如果是 JSON-LD，保留
        if 'application/ld+json' in attrs:
            return m.group(0)
        
        # 其他类型（text/javascript, module 等）提取
        js_parts.append(content)
        return ""  # 删除内联 script 标签
    
    pattern = r'<script((?:\s+[^>]*)?)>(.*?)</script>'
    modified = re.sub(pattern, _replace_script, html_content, flags=re.DOTALL)
    return js_parts, modified


def make_filename(name, ext):
    """生成安全的文件名"""
    safe = re.sub(r'[^\w\-]', '_', name)
    return f"{safe}.{ext}"


def fix_font_paths_in_css(css_content):
    """
    修复提取后 CSS 中的字体路径。
    原 HTML 中的 font face 路径如 url('css/Maoken...') 或 url('../css/Maoken...')
    提取到 css/css/ 后，路径需要变为 url('../MaokenAssortedSans.ttf')
    """
    # 匹配各种字体路径变体
    css_content = re.sub(
        r"""url\(['"]?(?:\.\./)*css/MaokenAssortedSans\.ttf['"]?\)""",
        "url('../MaokenAssortedSans.ttf')",
        css_content
    )
    # 也处理 ./MaokenAssortedSans.ttf（cs.css 被移到 css/css/ 后需要）
    css_content = re.sub(
        r"""url\(['"]?\./MaokenAssortedSans\.ttf['"]?\)""",
        "url('../MaokenAssortedSans.ttf')",
        css_content
    )
    return css_content


def fix_font_paths_in_standalone_css():
    """修复已移动到 css/css/ 的独立 CSS 中的字体路径"""
    for dst_name in [v for v in STANDALONE_CSS.values()]:
        css_path = os.path.join(CSS_DIR, dst_name)
        if not os.path.exists(css_path):
            continue
        with open(css_path, 'r', encoding='utf-8') as f:
            content = f.read()
        fixed = fix_font_paths_in_css(content)
        if fixed != content:
            with open(css_path, 'w', encoding='utf-8') as f:
                f.write(fixed)
            print(f"  ✓ 已修复字体路径: {dst_name}")


def backup_file(filepath):
    """备份文件"""
    bak = filepath + ".bak"
    if not os.path.exists(bak):
        shutil.copy2(filepath, bak)
        print(f"  ✓ 已备份: {os.path.basename(filepath)}.bak")


def calc_rel_prefix(html_rel_path):
    """计算从 HTML 文件到项目根目录的相对路径前缀"""
    depth = html_rel_path.replace("\\", "/").count("/")
    if depth == 0:
        return "./"
    else:
        return "../" * depth


def process_html_files():
    """处理所有 HTML 文件"""
    html_files = find_html_files()
    print(f"找到 {len(html_files)} 个 HTML 文件需要处理")
    
    processed = 0
    for html_path in html_files:
        rel_path = os.path.relpath(html_path, BASE)
        print(f"\n处理: {rel_path}")
        
        # 生成文件标识名
        name_part = rel_path.replace("\\", "/").replace("/", "-").replace(".html", "")
        if not name_part or name_part == ".":
            name_part = "index"
        
        # 计算相对路径前缀
        prefix = calc_rel_prefix(rel_path)
        
        css_filename = make_filename(name_part, "css")
        js_filename = make_filename(name_part, "js")
        css_fullpath = os.path.join(CSS_DIR, css_filename)
        js_fullpath = os.path.join(JS_DIR, js_filename)
        
        # 读取 HTML
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        original = html_content
        
        # 提取 CSS
        css_content, html_after_css = extract_inline_styles(html_content)
        
        # 提取 JS
        js_parts, html_after_js = extract_inline_scripts(html_after_css)
        
        # 如果没有要提取的内容，跳过
        has_css = bool(css_content.strip())
        has_js = bool(js_parts and any(p.strip() for p in js_parts))
        
        if not has_css and not has_js:
            print(f"  - 没有内联 CSS/JS，跳过")
            continue
        
        # 备份
        backup_file(html_path)
        
        # 写 CSS 文件
        if has_css:
            css_content = css_content.strip()
            # 修复字体路径
            css_content = fix_font_paths_in_css(css_content)
            with open(css_fullpath, 'w', encoding='utf-8') as f:
                f.write(css_content)
            print(f"  ✓ 提取 CSS ({len(css_content)} chars) → {css_filename}")
        
        # 写 JS 文件
        if has_js:
            js_content = "\n\n".join(p.strip() for p in js_parts if p.strip())
            js_content = js_content.strip()
            with open(js_fullpath, 'w', encoding='utf-8') as f:
                f.write(js_content)
            print(f"  ✓ 提取 JS ({len(js_content)} chars, {len(js_parts)} 个块) → {js_filename}")
        
        # 构建新的 HTML：在 head 末尾加 CSS link，在 body 末尾加 JS script
        new_html = html_after_js
        
        # 在 </head> 前插入 CSS link
        css_link = f'    <link rel="stylesheet" href="{prefix}css/css/{css_filename}">\n'
        if has_css:
            new_html = new_html.replace('</head>', f'{css_link}</head>')
        
        # 在 </body> 前插入 JS script
        js_script = f'    <script src="{prefix}js/js/{js_filename}"></script>\n'
        if has_js:
            new_html = new_html.replace('</body>', f'{js_script}</body>')
        
        # 写入修改后的 HTML
        if new_html != original:
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(new_html)
            processed += 1
            print(f"  ✓ HTML 已更新")
    
    print(f"\n{'='*50}")
    print(f"处理完成！共处理 {processed} 个文件")
    print(f"{'='*50}")


def move_standalone_files():
    """移动现有的独立 CSS/JS 文件"""
    print("\n移动独立 CSS 文件...")
    for src_rel, dst_name in STANDALONE_CSS.items():
        src_path = os.path.join(BASE, src_rel)
        dst_path = os.path.join(CSS_DIR, dst_name)
        if os.path.exists(src_path):
            # 备份
            if not os.path.exists(src_path + ".bak"):
                shutil.copy2(src_path, src_path + ".bak")
            shutil.copy2(src_path, dst_path)
            print(f"  ✓ {src_rel} → css/css/{dst_name}")
        else:
            print(f"  ✗ 源文件不存在: {src_rel}")
    
    print("\n移动独立 JS 文件...")
    for src_rel, dst_name in STANDALONE_JS.items():
        src_path = os.path.join(BASE, src_rel)
        dst_path = os.path.join(JS_DIR, dst_name)
        if os.path.exists(src_path):
            if not os.path.exists(src_path + ".bak"):
                shutil.copy2(src_path, src_path + ".bak")
            shutil.copy2(src_path, dst_path)
            print(f"  ✓ {src_rel} → js/js/{dst_name}")
        else:
            print(f"  ✗ 源文件不存在: {src_rel}")


def update_html_paths():
    """更新 HTML 文件中引用独立文件的路径"""
    # 需要更新的引用映射：旧路径 → 新路径
    path_map = {
        # CSS 引用
        './css/cs.css': './css/css/cs.css',
        '../css/cs.css': '../css/css/cs.css',
        '../../css/cs.css': '../../css/css/cs.css',
        './css/share.css': './css/css/share.css',
        '../css/share.css': '../css/css/share.css',
        './css/shubiaogenzongtexiao.css': './css/css/effects.css',
        '../css/shubiaogenzongtexiao.css': '../css/css/effects.css',
        './media-viewer.css': './css/css/media-viewer.css',
        'media-viewer.css': './css/css/media-viewer.css',
        './nice-video.css': './css/css/nice-video.css',
        'nice-video.css': './css/css/nice-video.css',
        './video-player.css': './css/css/video-player.css',
        'video-player.css': './css/css/video-player.css',
        # JS 引用
        './css/jsj.js': './js/js/jsj.js',
        '../css/jsj.js': '../js/js/jsj.js',
        './css/indexjs.js': './js/js/indexjs.js',
        '../css/indexjs.js': '../js/js/indexjs.js',
        './css/wiki-linker.js': './js/js/wiki-linker.js',
        './_subdomain-router.js': './js/js/subdomain-router.js',
        '../_subdomain-router.js': '../js/js/subdomain-router.js',
        './articles-data.js': './js/js/articles-data.js',
        '../articles-data.js': '../js/js/articles-data.js',
        './dynamic-data.js': './js/js/dynamic-data.js',
        '../dynamic-data.js': '../js/js/dynamic-data.js',
        './geo-check.js': './js/js/geo-check.js',
        '../geo-check.js': '../js/js/geo-check.js',
        './index41.js': './js/js/index41.js',
        './media-viewer.js': './js/js/media-viewer.js',
        'media-viewer.js': './js/js/media-viewer.js',
        './nice-video.js': './js/js/nice-video.js',
        'nice-video.js': './js/js/nice-video.js',
        './status-data.js': './js/js/status-data.js',
        '../status-data.js': '../js/js/status-data.js',
        './timeline.js': './js/js/timeline.js',
        '../timeline.js': '../js/js/timeline.js',
        './video-player.js': './js/js/video-player.js',
        'video-player.js': './js/js/video-player.js',
        './wiki-data.js': './js/js/wiki-data.js',
        '../wiki-data.js': '../js/js/wiki-data.js',
        './assets/js/ad-system.js': './js/js/ad-system.js',
        '../assets/js/ad-system.js': '../js/js/ad-system.js',
        './assets/js/gtag-config.js': './js/js/gtag-config.js',
        '../assets/js/gtag-config.js': '../js/js/gtag-config.js',
        './js/svg-icons.js': './js/js/svg-icons.js',
        '../js/svg-icons.js': '../js/js/svg-icons.js',
        '/js/svg-icons.js': '/js/js/svg-icons.js',
    }
    
    html_files = find_html_files()
    updated_count = 0
    
    print("\n更新 HTML 文件中的引用路径...")
    for html_path in html_files:
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        for old_path, new_path in path_map.items():
            content = content.replace(old_path, new_path)
        
        if content != original:
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(content)
            updated_count += 1
            rel = os.path.relpath(html_path, BASE)
            print(f"  ✓ 更新引用: {rel}")
    
    print(f"  共更新 {updated_count} 个文件")


if __name__ == '__main__':
    import sys
    
    # 确保目标目录存在
    os.makedirs(CSS_DIR, exist_ok=True)
    os.makedirs(JS_DIR, exist_ok=True)
    
    if len(sys.argv) > 1 and sys.argv[1] == '--move-only':
        move_standalone_files()
        update_html_paths()
        fix_font_paths_in_standalone_css()
    elif len(sys.argv) > 1 and sys.argv[1] == '--paths-only':
        update_html_paths()
    elif len(sys.argv) > 1 and sys.argv[1] == '--extract-only':
        process_html_files()
    else:
        # 步骤1：移动独立文件
        move_standalone_files()
        # 步骤1.5：修复独立 CSS 字体路径
        fix_font_paths_in_standalone_css()
        # 步骤2：更新路径
        update_html_paths()
        # 步骤3：处理内联提取
        process_html_files()
    
    print("\n全部完成！")
