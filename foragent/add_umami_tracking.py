"""
为网站所有 HTML 文件添加 Umami 统计追踪代码
放置在 <head> 中 </head> 之前
"""

import os
import re

# 项目根目录
ROOT = r"G:\EmoScan Pro\ciallo0721-cmd.github.io"

# 要排除的目录（相对路径，相对于 ROOT）
EXCLUDE_DIRS = {
    "node_modules",
    "build",
    os.path.join("tests", "reports"),
    os.path.join("build", "electron-app"),
}

# Umami 追踪代码
TRACKING_CODE = (
    '<script defer src="https://cloud.umami.is/script.js" '
    'data-website-id="7c64c1b7-5571-40ec-9a62-576686340c0b"></script>'
)

def should_exclude(dirpath):
    rel = os.path.relpath(dirpath, ROOT)
    parts = rel.split(os.sep)
    for ex in EXCLUDE_DIRS:
        ex_parts = ex.split(os.sep)
        # 检查是否匹配排除目录前缀
        if len(parts) >= len(ex_parts) and parts[:len(ex_parts)] == ex_parts:
            return True
    return False

def add_tracking_to_file(filepath):
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    # 如果已经存在，跳过
    if "cloud.umami.is/script.js" in content:
        return False, "already has tracking code"

    # 在 </head> 前插入
    if "</head>" in content:
        new_content = content.replace("</head>", f"    {TRACKING_CODE}\n</head>", 1)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        return True, "added"
    else:
        return False, "no </head> tag"

def main():
    total = 0
    added = 0
    skipped_has = 0
    skipped_no_head = 0

    for root, dirs, files in os.walk(ROOT):
        # 过滤排除目录
        dirs[:] = [d for d in dirs if not should_exclude(os.path.join(root, d))]

        for fname in files:
            if not fname.endswith((".html", ".htm")):
                continue
            fpath = os.path.join(root, fname)

            # 跳过排除目录中的文件
            if should_exclude(root):
                continue

            total += 1
            success, reason = add_tracking_to_file(fpath)
            if success:
                added += 1
                print(f"  [+] {os.path.relpath(fpath, ROOT)}")
            elif reason == "already has tracking code":
                skipped_has += 1
            elif reason == "no </head> tag":
                skipped_no_head += 1
                print(f"  [!] {os.path.relpath(fpath, ROOT)} — no </head>")

    print(f"\n=== 完成 ===")
    print(f"总计扫描: {total} 个文件")
    print(f"已添加:   {added} 个")
    print(f"已存在:   {skipped_has} 个")
    print(f"无</head>: {skipped_no_head} 个")

if __name__ == "__main__":
    main()
