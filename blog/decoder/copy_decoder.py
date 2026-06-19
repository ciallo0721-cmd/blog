#!/usr/bin/env python3
"""批量复制解码器文件到所有文章目录"""
import os
import shutil

BLOG = "G:/EmoScan Pro/ciallo0721-cmd.github.io/blog"
DECODER = os.path.join(BLOG, "_decoder")

DIRS = [
    "1","2","3","4","5","6","7","8","9",
    "10","11","12","13","14","15","16","17","18","19",
    "20","21","22","23","50","51","52","manga-1","pdf-1","video-1"
]

for d in DIRS:
    dst_dir = os.path.join(BLOG, d)
    if not os.path.isdir(dst_dir):
        print(f"目录不存在: {d}")
        continue
    # 复制 index.html
    shutil.copy2(os.path.join(DECODER, "index.html"), os.path.join(dst_dir, "index.html"))
    # 复制 decoder.js
    shutil.copy2(os.path.join(DECODER, "decoder.js"), os.path.join(dst_dir, "decoder.js"))
    print(f"OK: {d}")

print("全部完成！")
