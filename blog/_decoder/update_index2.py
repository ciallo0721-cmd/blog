import os
import shutil

# 计算路径
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BLOG_DIR = os.path.dirname(SCRIPT_DIR)  # blog/ 目录
INDEX_SRC = os.path.join(SCRIPT_DIR, 'index.html')

print(f"[SRC] {INDEX_SRC}")
print("=" * 60)

count = 0
skipped = 0

for item in os.listdir(BLOG_DIR):
    item_path = os.path.join(BLOG_DIR, item)
    if item == '_decoder' or not os.path.isdir(item_path):
        continue
    index_dst = os.path.join(item_path, 'index.html')
    try:
        shutil.copy2(INDEX_SRC, index_dst)
        print(f"[OK] blog/{item}/index.html")
        count += 1
    except Exception as e:
        print(f"[ERR] blog/{item} - {e}")

print("=" * 60)
print(f"[STAT] 更新完成：成功 {count} 个，跳过 {skipped} 个")
