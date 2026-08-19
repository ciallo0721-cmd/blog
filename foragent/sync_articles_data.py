# -*- coding: utf-8 -*-
"""同步两份 articles-data.js：删除 id:51 记录，添加 id:74 记录"""
import re, io, os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = [
    os.path.join(BASE, "articles-data.js"),
    os.path.join(BASE, "js", "js", "articles-data.js"),
]

NEW_74 = '''        {
            id: 74,
            category: "公告",
            fileName: "公告/74/",
            title: "一个决定",
            excerpt: "从2026年8月1日起，我永久停止对政治的写作。原因有三：合法性、学识、今后。保留文章9，下架文章51。",
            date: "2026-08-01",
            tags: ["公告", "声明", "决定"],
            readTime: 4,
            featured: true
        },
'''

# id 51 记录块：{ ... id: 51, ... },
PATT_51 = re.compile(r'\{\s*id:\s*51,.*?\},\n', re.S)

for fp in FILES:
    with io.open(fp, "r", encoding="utf-8") as f:
        txt = f.read()

    orig = txt
    # 1) 删除 id 51 块
    txt, n51 = PATT_51.subn("", txt, count=1)
    # 2) 在数组收尾 "];" 前插入 id 74
    if "id: 74," not in txt:
        txt = txt.replace("\n];", "\n" + NEW_74.rstrip("\n") + "\n];", 1)
    else:
        n51 = (n51, "74已存在跳过")
    with io.open(fp, "w", encoding="utf-8") as f:
        f.write(txt)

    has51 = bool(re.search(r'id:\s*51,', txt))
    has74 = bool(re.search(r'id:\s*74,', txt))
    print(os.path.basename(fp), "| 删51:", n51, "| 51残留:", has51, "| 74存在:", has74, "| 大小:", len(txt))
