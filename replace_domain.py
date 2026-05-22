"""
域名替换脚本
将项目中所有 HTML/JS 文件的 91vip.xn--32v.ink 替换为 ciallo0721.bid
注意：运行前会自动备份，替换后需手动检查并 git commit
"""

import os
import re
import shutil
from datetime import datetime

# === 配置 ===
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
OLD_DOMAIN = "91vip.xn--32v.ink"
NEW_DOMAIN = "ciallo0721.bid"
# 要处理的文件扩展名
TARGET_EXTENSIONS = {".html", ".js", ".json", ".yml", ".yaml", ".css"}
# 排除的目录
EXCLUDE_DIRS = {".git", "node_modules", ".workbuddy", "__pycache__"}
# 备份目录
BACKUP_DIR = os.path.join(PROJECT_ROOT, f"_domain_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}")


def should_process(filepath):
    """判断文件是否需要处理"""
    _, ext = os.path.splitext(filepath)
    return ext.lower() in TARGET_EXTENSIONS


def find_files(root):
    """递归查找所有目标文件"""
    results = []
    for dirpath, dirnames, filenames in os.walk(root):
        # 排除指定目录（原地修改，阻止 os.walk 进入）
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for fname in filenames:
            full = os.path.join(dirpath, fname)
            if should_process(full):
                results.append(full)
    return results


def count_occurrences(filepath):
    """统计文件中旧域名出现次数"""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        return content.count(OLD_DOMAIN)
    except (UnicodeDecodeError, PermissionError):
        return 0


def replace_domain(filepath, dry_run=False):
    """替换文件中的域名，返回替换次数"""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
    except (UnicodeDecodeError, PermissionError):
        return 0

    count = content.count(OLD_DOMAIN)
    if count == 0:
        return 0

    new_content = content.replace(OLD_DOMAIN, NEW_DOMAIN)

    if not dry_run:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)

    return count


def create_backup(files):
    """备份所有将被修改的文件"""
    os.makedirs(BACKUP_DIR, exist_ok=True)
    backed_up = 0
    for filepath in files:
        rel = os.path.relpath(filepath, PROJECT_ROOT)
        backup_path = os.path.join(BACKUP_DIR, rel)
        os.makedirs(os.path.dirname(backup_path), exist_ok=True)
        shutil.copy2(filepath, backup_path)
        backed_up += 1
    return backed_up


def main():
    print(f"=== 域名替换工具 ===")
    print(f"  旧域名: {OLD_DOMAIN}")
    print(f"  新域名: {NEW_DOMAIN}")
    print(f"  项目目录: {PROJECT_ROOT}")
    print()

    # 1. 扫描所有目标文件
    all_files = find_files(PROJECT_ROOT)
    print(f"扫描到 {len(all_files)} 个目标文件")

    # 2. 统计包含旧域名的文件
    target_files = []
    total_occurrences = 0
    for f in all_files:
        c = count_occurrences(f)
        if c > 0:
            target_files.append((f, c))
            total_occurrences += c

    if not target_files:
        print("未找到包含旧域名的文件，无需替换。")
        return

    print(f"\n找到 {len(target_files)} 个文件包含旧域名，共 {total_occurrences} 处：")
    print("-" * 60)
    for f, c in sorted(target_files, key=lambda x: -x[1]):
        rel = os.path.relpath(f, PROJECT_ROOT)
        print(f"  {rel}  ({c} 处)")
    print("-" * 60)

    # 3. 确认
    confirm = input(f"\n确认执行替换？(输入 YES 继续): ").strip()
    if confirm != "YES":
        print("已取消。")
        return

    # 4. 备份
    print("\n正在备份...")
    file_paths = [f for f, _ in target_files]
    backed_up = create_backup(file_paths)
    print(f"已备份 {backed_up} 个文件到: {BACKUP_DIR}")

    # 5. 执行替换
    print("\n正在替换...")
    replaced_total = 0
    for f, _ in target_files:
        rel = os.path.relpath(f, PROJECT_ROOT)
        count = replace_domain(f, dry_run=False)
        replaced_total += count
        print(f"  ✓ {rel}  ({count} 处)")

    print(f"\n替换完成！共替换 {replaced_total} 处")
    print(f"备份位置: {BACKUP_DIR}")
    print("\n后续步骤:")
    print("  1. 检查替换结果是否正确")
    print("  2. git add -A && git commit -m 'feat: 域名替换为 ciallo0721.bid'")
    print("  3. git push")
    print(f"  4. 确认无误后可删除备份: rm -rf {BACKUP_DIR}")


if __name__ == "__main__":
    main()
