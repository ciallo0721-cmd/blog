#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量更新所有文章的 decoder.js
从 blog/_decoder/decoder.js 复制到所有文章文件夹
"""

import os
import shutil
import sys
import io

# 修复 Windows 终端编码问题
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# 项目根目录（需要根据实际情况调整）
# __file__ = G:\EmoScan Pro\ciallo0721-cmd.github.io\blog\_decoder\update_decoder.py
# 所以需要用三个 dirname 才能到项目根目录
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DECODER_DIR = os.path.dirname(SCRIPT_DIR)  # blog/
ROOT = os.path.dirname(DECODER_DIR)  # 项目根目录
BLOG_DIR = os.path.join(ROOT, 'blog')
DECODER_SRC = os.path.join(BLOG_DIR, '_decoder', 'decoder.js')

def update_all_decoders():
    if not os.path.exists(DECODER_SRC):
        print("[ERR] 找不到源文件：{}".format(DECODER_SRC))
        return
    
    print("[SRC] 源解码器：{}".format(DECODER_SRC))
    print("=" * 60)
    
    count = 0
    skipped = 0
    
    # 遍历 blog/ 目录下的所有文件夹
    for item in os.listdir(BLOG_DIR):
        item_path = os.path.join(BLOG_DIR, item)
        
        # 跳过 _decoder 文件夹和非文件夹
        if item == '_decoder' or not os.path.isdir(item_path):
            continue
        
        # 目标 decoder.js 路径
        decoder_dst = os.path.join(item_path, 'decoder.js')
        
        # 检查是否存在 decoder.js
        if os.path.exists(decoder_dst):
            try:
                shutil.copy2(DECODER_SRC, decoder_dst)
                print("[OK] 已更新：blog/{}/decoder.js".format(item))
                count += 1
            except Exception as e:
                print("[ERR] 更新失败：blog/{} - {}".format(item, e))
        else:
            print("[WARN] 跳过：blog/{}/ (没有 decoder.js)".format(item))
            skipped += 1
    
    print("=" * 60)
    print("[STAT] 更新完成：成功 {} 个，跳过 {} 个".format(count, skipped))
    print("\n[TIP] 提示：现在所有文章都支持 [Image] [Video] [Audio] [PDF] 标签了！")

if __name__ == '__main__':
    print("[START] BlockScript 解码器批量更新工具")
    print()
    update_all_decoders()
