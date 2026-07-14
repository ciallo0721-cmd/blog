#!/usr/bin/env python3
"""
批量将广告系统（ad-system.js）推广到所有 HTML 页面。

操作：
1. 在 <body> 后插入顶部广告位容器 <div data-ad-slot>
2. 在 </body> 前插入底部广告位容器 <div data-ad-slot>
3. 在 </body> 前插入 <script src="...ad-system.js">
4. 跳过已包含广告系统的页面
"""

import os
import re
import sys

# 项目根目录
ROOT = r"G:\EmoScan Pro\ciallo0721-cmd.github.io"

# 要处理的 HTML 文件列表（相对路径）
TARGET_FILES = [
    # ======= 根目录 =======
    "404.html",
    "aboutme.html",
    "access-denied.html",
    "adss.html",
    "friends.html",
    "help.html",
    "privacy-policy.html",
    "privacy.html",
    "redirect-template.html",
    "status.html",
    "timeline.html",
    "user-agreement.html",
    "wz.html",
    # ======= blog 相关（不包括单篇文章） =======
    "blog/index.html",
    "blog/muban/index.html",
    "blog/公告/web/index.html",
    "blog/公告/weekly/index.html",
    "blog/公告/4/index.html",
    "blog/公告/5/index.html",
    "blog/公告/8/index.html",
    "blog/公告/9/index.html",
    "blog/公告/10/index.html",
    "blog/公告/11/index.html",
    "blog/公告/12/index.html",
    "blog/公告/61/index.html",
    # ======= 子目录 =======
    "admin/index.html",
    "app/index.html",
    "app/moeface/index.html",
    "app/mood-tracker/index.html",
    "app/tools/index.html",
    "app/tools/anime-color-analyzer/index.html",
    "app/tools/renpy-template-generator/index.html",
    "app/tools/vtuber-name-generator/index.html",
    "app/tools/vtuber-personality-test/index.html",
    "arg/index.html",
    "baicai/index.html",
    "cn/index.html",
    "cs2/index.html",
    "moeface/index.html",
    "mood-tracker/index.html",
    "oops/index.html",
    "oops/link/index.html",
    "pages/aboutme.html",
    "pages/access-denied.html",
    "pages/friends.html",
    "pages/help.html",
    "pages/privacy-policy.html",
    "pages/privacy.html",
    "pages/status.html",
    "pages/user-agreement.html",
    "privacyandpolicy/index.html",
    "taffy/index.html",
    "tools/index.html",
    "tools/anime-color-analyzer/index.html",
    "tools/renpy-template-generator/index.html",
    "tools/vtuber-name-generator/index.html",
    "tools/vtuber-personality-test/index.html",
    "wiki/index.html",
    "wiki/dashichang/index.html",
    "wiki/mediapipe/index.html",
    "wiki/openutau/index.html",
    "wiki/paddleocr/index.html",
    "wiki/python/index.html",
    "wiki/renpy/index.html",
    "wiki/tongshiting/index.html",
    "wiki/unity/index.html",
    "wiki/utau/index.html",
    "wiki/vocaloid/index.html",
    "wz/index.html",
    "work/index.html",
]


def calc_relative_path(file_rel):
    """
    计算从 HTML 文件到根目录的 JS 路径。
    比如 'tools/index.html' → '../js/js/ad-system.js'
    """
    depth = len(file_rel.split("/")) - 1  # 文件本身不计入
    if depth == 0:
        return "./js/js/ad-system.js"
    else:
        return "../" * depth + "js/js/ad-system.js"


def has_ad_system(content):
    """检查页面是否已包含广告系统"""
    return "ad-system.js" in content


def process_file(file_rel):
    """处理单个 HTML 文件"""
    file_path = os.path.join(ROOT, file_rel)

    if not os.path.isfile(file_path):
        print(f"  [跳过] 文件不存在: {file_rel}")
        return False

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    if has_ad_system(content):
        print(f"  [跳过] 已有广告系统: {file_rel}")
        return False

    # 计算相对路径
    js_path = calc_relative_path(file_rel)

    # 准备要插入的代码
    script_tag = f'\n    <!-- ===== 动态广告系统 v1.0 ===== -->\n    <script src="{js_path}"></script>\n'

    top_ad = '\n    <!-- 广告位 #1：顶部横幅 -->\n    <div style="max-width:728px;margin:18px auto;">\n      <div data-ad-slot></div>\n    </div>\n'

    bottom_ad = '\n    <!-- 广告位 #2：底部横幅 -->\n    <div style="max-width:728px;margin:18px auto;">\n      <div data-ad-slot></div>\n    </div>\n'

    # === 插入顶部广告位：在 <body> 后 ===
    # 匹配 <body> 标签（可能有属性），在其后插入顶部广告
    body_match = re.search(r'<body[^>]*>', content)
    if body_match:
        insert_pos = body_match.end()
        content = content[:insert_pos] + top_ad + content[insert_pos:]
    else:
        print(f"  [警告] 未找到 <body> 标签: {file_rel}")
        # 尝试在 <html> 后插入
        html_match = re.search(r'<html[^>]*>', content)
        if html_match:
            insert_pos = html_match.end()
            content = content[:insert_pos] + top_ad + content[insert_pos:]
        else:
            print(f"  [跳过] 无法确定插入位置: {file_rel}")
            return False

    # === 插入底部广告位 + JS 脚本：在 </body> 前 ===
    body_close_match = content.rfind("</body>")
    if body_close_match != -1:
        content = content[:body_close_match] + bottom_ad + script_tag + content[body_close_match:]
    else:
        print(f"  [警告] 未找到 </body>: {file_rel}")
        return False

    # 写回文件
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"  [OK] 已添加广告系统: {file_rel}")
    return True


def main():
    success = 0
    skipped = 0
    failed = 0

    print("=" * 60)
    print("广告系统批量部署脚本")
    print(f"目标: {len(TARGET_FILES)} 个文件")
    print("=" * 60)

    for file_rel in TARGET_FILES:
        result = process_file(file_rel)
        if result is True:
            success += 1
        elif result is False:
            # 可能是已有或失败
            file_path = os.path.join(ROOT, file_rel)
            if os.path.isfile(file_path):
                skipped += 1
            else:
                failed += 1

    print("=" * 60)
    print(f"完成！成功: {success}, 跳过: {skipped}, 失败: {failed}")
    print("=" * 60)


if __name__ == "__main__":
    main()
