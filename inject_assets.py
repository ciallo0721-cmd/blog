#!/usr/bin/env python3
"""
批量给所有 HTML 文件添加：
1. Google tag (gtag.js) + geo-check.js + HTTP 检测脚本（插入 </head> 前）
2. index.html / friends.html 导航栏加两个按钮

用法：python inject_assets.py
"""

import os
import re
import sys

ROOT = r"g:\EmoScan Pro\ciallo0721-cmd.github.io"

# 排除的文件（500~512 和 405~411 错误页）
EXCLUDE_PATTERNS = [
    r'\\(?:4[0-9][0-9]|5[0-1][0-2]|41[0-1])\.html$',  # 400~512, 410, 411
]

# 要注入到 </head> 前的脚本块
HEAD_SCRIPT = """
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-TR4FT7JPDZ"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-TR4FT7JPDZ');
    </script>
    <!-- IP 地理检测（美国用户拒绝访问） -->
    <script src="./geo-check.js"></script>
    <!-- HTTP 检测与提示 -->
    <script>
        (function() {
            function checkHTTP() {
                if (window.location.protocol === 'http:') {
                    var urlSpan = document.getElementById('currentHttpUrl');
                    if (urlSpan) urlSpan.textContent = window.location.href;
                    var overlay = document.getElementById('httpWarningOverlay');
                    if (overlay) overlay.style.display = 'flex';
                }
            }
            function switchToHTTPS() {
                var url = window.location.href;
                url = url.replace(/^http:/i, 'https:');
                window.location.href = url;
            }
            function continueHTTP() {
                var overlay = document.getElementById('httpWarningOverlay');
                if (overlay) overlay.style.display = 'none';
            }
            window.switchToHTTPS = switchToHTTPS;
            window.continueHTTP = continueHTTP;
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', checkHTTP);
            } else {
                checkHTTP();
            }
        })();
    </script>
"""

# 两个按钮的 HTML（用于导航栏）
NAV_BUTTONS = """
        <a href="https://91vip.xn--32v.ink/scraper" target="_blank" rel="noopener" class="nav-btn-ext" style="background:linear-gradient(135deg,#3366ff,#2575fc);color:#fff;padding:8px 18px;border-radius:20px;text-decoration:none;font-weight:600;font-size:0.95rem;display:inline-flex;align-items:center;gap:6px;transition:all 0.3s ease;">🎬 新番数据库</a>
        <a href="https://91vip.xn--32v.ink/moeface" target="_blank" rel="noopener" class="nav-btn-ext" style="background:linear-gradient(135deg,#ff6699,#ff9955);color:#fff;padding:8px 18px;border-radius:20px;text-decoration:none;font-weight:600;font-size:0.95rem;display:inline-flex;align-items:center;gap:6px;transition:all 0.3s ease;">😊 人脸识别</a>
"""

# 用于 mobile-menu 的两个按钮
MOBILE_BUTTONS = """
        <li><a href="https://91vip.xn--32v.ink/scraper" target="_blank" rel="noopener">🎬 新番数据库</a></li>
        <li><a href="https://91vip.xn--32v.ink/moeface" target="_blank" rel="noopener">😊 人脸识别</a></li>
"""


def should_exclude(filepath):
    for pat in EXCLUDE_PATTERNS:
        if re.search(pat, filepath.replace('/', '\\')):
            return True
    return False


def has_gtag(content):
    return 'googletagmanager.com/gtag/js' in content or 'G-TR4FT7JPDZ' in content


def has_geo_check(content):
    return 'geo-check.js' in content


def inject_head_script(content):
    """在 </head> 前插入脚本（如果还没有的话）"""
    has_gtag_now = has_gtag(content)
    has_geo_now = has_geo_check(content)
    has_http_check = 'httpWarningOverlay' in content or 'checkHTTP' in content

    if has_gtag_now and has_geo_now and has_http_check:
        # 全部已有，跳过
        return content, False

    # 组装要插入的脚本块（只加缺少的部分）
    parts = []
    if not has_gtag_now:
        parts.append("""    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-TR4FT7JPDZ"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-TR4FT7JPDZ');
    </script>""")
    if not has_geo_now:
        parts.append('    <!-- IP 地理检测（美国用户拒绝访问） -->\n    <script src="./geo-check.js"></script>')
    if not has_http_check:
        parts.append("""    <!-- HTTP 检测与提示 -->
    <script>
        (function() {
            function checkHTTP() {
                if (window.location.protocol === 'http:') {
                    var urlSpan = document.getElementById('currentHttpUrl');
                    if (urlSpan) urlSpan.textContent = window.location.href;
                    var overlay = document.getElementById('httpWarningOverlay');
                    if (overlay) overlay.style.display = 'flex';
                }
            }
            function switchToHTTPS() {
                var url = window.location.href;
                url = url.replace(/^http:/i, 'https:');
                window.location.href = url;
            }
            function continueHTTP() {
                var overlay = document.getElementById('httpWarningOverlay');
                if (overlay) overlay.style.display = 'none';
            }
            window.switchToHTTPS = switchToHTTPS;
            window.continueHTTP = continueHTTP;
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', checkHTTP);
            } else {
                checkHTTP();
            }
        })();
    </script>""")

    if not parts:
        return content, False

    script_block = "\n" + "\n".join(parts)
    content = content.replace("</head>", script_block + "\n</head>", 1)
    return content, True


def add_nav_buttons_index(content):
    """给 index.html 的导航栏加两个按钮"""
    if 'nav-btn-ext' in content:
        return content, False  # 已添加

    # 策略1：找 <ul class="nav-links"> ... </ul>
    nav_pattern = r'(<ul class="nav-links">.*?)(</ul>)'
    def repl(m):
        return m.group(1) + NAV_BUTTONS + "\n        " + m.group(2)
    new_content, n = re.subn(nav_pattern, repl, content, count=1, flags=re.DOTALL)
    return new_content, n > 0


def add_nav_buttons_friends(content):
    """给 friends.html 的导航栏加两个按钮"""
    if 'nav-btn-ext' in content:
        return content, False

    # friends.html 的 nav 结构：<nav>...<a ...>...</a>...</nav>
    # 在 <nav>...</nav> 内，在 </nav> 前插入按钮
    nav_pattern = r'(<nav.*?>)(.*?)(</nav>)'
    def repl(m):
        nav_start = m.group(1)
        nav_body = m.group(2)
        nav_end = m.group(3)
        # 在 nav_body 末尾插入按钮
        buttons = "\n        " + NAV_BUTTONS.strip().replace('\n', '\n        ') + "\n    "
        return nav_start + nav_body.rstrip() + buttons + nav_end
    new_content, n = re.subn(nav_pattern, repl, content, count=1, flags=re.DOTALL)
    return new_content, n > 0


def add_mobile_buttons(content):
    """给移动菜单加按钮"""
    if 'nav-btn-ext' in content:
        return content, False

    # 找 mobile-menu-links 的 </ul> 前插入
    pattern = r'(<ul class="mobile-menu-links">.*?)(</ul>)'
    if 'mobile-menu-links' not in content:
        return content, False

    def repl(m):
        return m.group(1) + MOBILE_BUTTONS.strip().replace('\n', '\n        ') + "\n        " + m.group(2)
    new_content, n = re.subn(pattern, repl, content, count=1, flags=re.DOTALL)
    return new_content, n > 0


def process_file(filepath, is_index=False, is_friends=False):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    original = content
    modified = False

    # 1. 注入 head 脚本
    content, changed = inject_head_script(content)
    if changed:
        modified = True

    # 2. 给 index.html / friends.html 加导航按钮
    if is_index:
        content, changed = add_nav_buttons_index(content)
        if changed:
            modified = True
        # 也加 mobile menu 按钮
        content, changed = add_mobile_buttons(content)
        if changed:
            modified = True
    elif is_friends:
        content, changed = add_nav_buttons_friends(content)
        if changed:
            modified = True
        content, changed = add_mobile_buttons(content)
        if changed:
            modified = True

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


def main():
    modified_files = []
    skipped_files = []

    for dirpath, dirnames, filenames in os.walk(ROOT):
        # 跳过 .git
        dirnames[:] = [d for d in dirnames if d != '.git']
        for fname in filenames:
            if not fname.endswith('.html'):
                continue
            filepath = os.path.join(dirpath, fname)
            if should_exclude(filepath):
                skipped_files.append(filepath)
                continue

            is_index = fname == 'index.html' and 'index.html' in filepath.split(os.sep)[-1]
            # 更精确的 is_index：文件路径以 index.html 结尾且是根目录或特定目录
            rel = os.path.relpath(filepath, ROOT)
            is_index = rel == 'index.html'
            is_friends = rel == 'friends.html'

            try:
                ok = process_file(filepath, is_index=is_index, is_friends=is_friends)
                if ok:
                    modified_files.append(rel)
                else:
                    skipped_files.append(rel + ' (无变化或已存在)')
            except Exception as e:
                print(f"  ❌ 错误: {rel} -> {e}")
                skipped_files.append(rel + f' (错误: {e})')

    print(f"\n✅ 完成！")
    print(f"   修改文件: {len(modified_files)} 个")
    print(f"   跳过/无变化: {len(skipped_files)} 个")
    if modified_files:
        print(f"\n修改的文件列表:")
        for f in modified_files:
            print(f"   - {f}")


if __name__ == '__main__':
    main()
