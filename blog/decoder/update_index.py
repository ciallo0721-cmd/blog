#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量更新所有文章的 index.html
添加自定义视频/音频播放器的 CSS/JS 引用
"""

import os
import shutil
import sys
import io

# 修复 Windows 终端编码问题
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# 项目根目录
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DECODER_DIR = os.path.dirname(SCRIPT_DIR)  # blog/
ROOT = os.path.dirname(DECODER_DIR)  # 项目根目录
BLOG_DIR = os.path.join(ROOT, 'blog')
DECODER_INDEX = os.path.join(BLOG_DIR, '_decoder', 'index.html')

def update_all_index_html():
    if not os.path.exists(DECODER_INDEX):
        print("[ERR] 找不到源文件：{}".format(DECODER_INDEX))
        return
    
    print("[SRC] 源 index.html：{}".format(DECODER_INDEX))
    print("=" * 60)
    
    # 读取源 index.html
    with open(DECODER_INDEX, 'r', encoding='utf-8') as f:
        source_html = f.read()
    
    count = 0
    skipped = 0
    
    # 遍历 blog/ 目录下的所有文件夹
    for item in os.listdir(BLOG_DIR):
        item_path = os.path.join(BLOG_DIR, item)
        
        # 跳过 _decoder 文件夹和非文件夹
        if item == '_decoder' or not os.path.isdir(item_path):
            continue
        
        # 目标 index.html 路径
        index_dst = os.path.join(item_path, 'index.html')
        
        # 检查是否存在 index.html
        if os.path.exists(index_dst):
            try:
                # 读取现有 index.html
                with open(index_dst, 'r', encoding='utf-8') as f:
                    existing_html = f.read()
                
                # 检查是否已经包含播放器引用
                if 'video-player.css' in existing_html:
                    print("[SKIP] 已包含播放器：blog/{}/index.html".format(item))
                    skipped += 1
                    continue
                
                # 替换整个文件
                shutil.copy2(DECODER_INDEX, index_dst)
                print("[OK] 已更新：blog/{}/index.html".format(item))
                count += 1
            except Exception as e:
                print("[ERR] 更新失败：blog/{} - {}".format(item, e))
        else:
            print("[WARN] 跳过：blog/{}/ (没有 index.html)".format(item))
            skipped += 1
    
    print("=" * 60)
    print("[STAT] 更新完成：成功 {} 个，跳过 {} 个".format(count, skipped))
    print("\n[TIP] 提示：现在所有文章都支持自定义视频/音频播放器了！")

if __name__ == '__main__':
    print("[START] BlockScript index.html 批量更新工具")
    print()
    update_all_index_html()
