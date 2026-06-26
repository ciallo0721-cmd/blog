#!/usr/bin/env python3
"""
自动注入 GA4 跟踪代码到所有 HTML 页面。

每次 push 时运行，检测没有 GA 的 .html 文件，
在 </head> 前插入 gtag.js + gtag-config.js，
并自动计算 gtag-config.js 的相对路径。
"""

import os
import re

# 需要跳过的目录（GitHub Actions 运行在 Linux 上）
EXCLUDE_DIRS = {'.git', '.workbuddy', 'node_modules', 'build', '__pycache__'}

# 注入的 GA4 代码块（{gtag_config_path} 会被动态替换）
GA_BLOCK = """<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-TR4FT7JPDZ"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());
  gtag('config', 'G-TR4FT7JPDZ');
</script>
<!-- GA4 统一埋点模块 -->
<script src="{gtag_config_path}"></script>
"""


def has_ga(content: str) -> bool:
    """检测页面是否已有 GA 跟踪代码。"""
    return 'googletagmanager' in content


def get_gtag_config_relpath(html_relpath: str) -> str:
    """根据 HTML 文件在仓库中的路径，计算到 assets/js/gtag-config.js 的相对路径。

    Examples:
        index.html                         → ./assets/js/gtag-config.js
        work/index.html                    → ../assets/js/gtag-config.js
        blog/教程/1/index.html             → ../../../assets/js/gtag-config.js
    """
    dir_part = os.path.dirname(html_relpath)
    if dir_part in ('', '.'):
        return './assets/js/gtag-config.js'
    depth = dir_part.count('/') + 1
    return '../' * depth + 'assets/js/gtag-config.js'


def inject_ga(filepath: str, repo_root: str) -> bool:
    """向单个 HTML 文件注入 GA 代码（如果还没有的话）。

    Returns:
        True 表示已注入，False 表示无需修改。
    """
    relpath = os.path.relpath(filepath, repo_root)

    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    if has_ga(content):
        return False

    if '</head>' not in content:
        print(f"  ⚠ 跳过（无 </head>）：{relpath}")
        return False

    gtag_path = get_gtag_config_relpath(relpath)
    ga_code = GA_BLOCK.format(gtag_config_path=gtag_path)
    content = content.replace('</head>', ga_code + '\n</head>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"  ✅ 已注入（{gtag_path}）：{relpath}")
    return True


def main():
    repo_root = os.getcwd()
    injected = []

    print(f"🔍 扫描 HTML 文件（仓库根目录：{repo_root}）")

    for root, dirs, files in os.walk(repo_root):
        # 跳过排除目录（原地修改 dirs 阻止 os.walk 进入）
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for fname in files:
            if not fname.endswith('.html'):
                continue
            filepath = os.path.join(root, fname)
            if inject_ga(filepath, repo_root):
                injected.append(os.path.relpath(filepath, repo_root))

    if injected:
        print(f"\n🎯 共注入 {len(injected)} 个文件")
    else:
        print("\n✨ 所有 HTML 文件已有 GA4 代码，无需操作。")

    # 输出总结给 GitHub Actions 判断（使用 GITHUB_OUTPUT 环境变量）
    github_output = os.environ.get('GITHUB_OUTPUT')
    if github_output:
        with open(github_output, 'a') as f:
            f.write(f"injected_count={len(injected)}\n")


if __name__ == '__main__':
    main()
