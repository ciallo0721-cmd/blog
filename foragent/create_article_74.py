# -*- coding: utf-8 -*-
"""生成公告文章 #74「一个决定」，基于公告 #61 模板"""
import re, os, io

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(BASE, "blog", "公告", "61", "index.html")
DST_DIR = os.path.join(BASE, "blog", "公告", "74")
DST = os.path.join(DST_DIR, "index.html")

with io.open(SRC, "r", encoding="utf-8") as f:
    html = f.read()

# ---- 元信息替换 ----
html = html.replace("https://ciallo0721-cmd.top/blog/公告/61/",
                    "https://ciallo0721-cmd.top/blog/公告/74/")
html = html.replace("暑期更新频率调整说明", "一个决定")
html = html.replace("关于2026年暑假期间文章更新与GitHub活跃度暂时降低的说明，以及9月份逐步恢复更新的计划。",
                    "从2026年8月1日起，永久停止对政治的写作。原因有三：合法性、学识、今后。保留文章9，下架文章51。")
html = html.replace("文章 #061", "文章 #074")
html = html.replace("2026-07-10", "2026-08-01")
html = html.replace("约2分钟", "约4分钟")
html = html.replace("关于2026暑假期间更新频率降低的通知——学业繁忙，摸鱼旅游，偶尔码字，9月归来。",
                    "我，ciallo0721-cmd，从2026年8月1日起，永久停止对政治的写作。这是一个认真的决定。")

# ---- 标签替换 ----
html = html.replace('''<div class="article-tags" id="articleTags">
                    <span class="article-tag">网站公告</span>
                    <span class="article-tag">更新计划</span>
                    <span class="article-tag">暑假</span>
                    <span class="article-tag">降频</span>
                </div>''', '''<div class="article-tags" id="articleTags">
                    <span class="article-tag">公告</span>
                    <span class="article-tag">声明</span>
                    <span class="article-tag">决定</span>
                </div>''')

# ---- 正文替换 ----
content_start = html.index('<div class="article-content" id="articleContent">')
content_end = html.index('<div style="text-align: center;">', content_start)
new_content = '''<div class="article-content" id="articleContent">
                <p>这是一篇很认真的公告。</p>
                <p>从 <strong>2026年8月1日</strong> 起，我，ciallo0721-cmd，将<strong>永久停止对政治的写作</strong>。今后，这个网站不会再出现任何与政治话题相关的文章。</p>

                <h2>一、为什么？——合法性</h2>
                <p>回顾我写过的文章，有一部分涉及政治话题。其中个别文章（比如龙心事件那篇），在使用了一些不恰当的语句、词语。站在今天回看，这些表述是有风险的。为了避免给自己惹上不必要的麻烦，相关文章已经被我下架。</p>
                <p>有些话题，一旦措辞不当，代价是我承担不起的。与其冒险，不如不写。</p>

                <h2>二、学识有限</h2>
                <p>正如网站主页所说，我还是一名初中生。政治是一门极其复杂的学问，我目前的学识和阅历还远远不够。写出来的东西，可能过度曲解、可能理解不到位、可能被有心人利用……与其写错，不如不写。</p>

                <h2>三、今后怎么办？</h2>
                <p>这次我做了两个决定：</p>
                <ul>
                    <li><strong>保留文章 #9《关于 GitHub Issue 被恶意篡改的说明》</strong>——那是我对一件事的立场，我不会改。</li>
                    <li><strong>下架文章 #51《赤井心桐生可可事件（龙心事件）深度回顾》</strong>——它是我写过的风险最高的一篇政治相关文章，正式下架。</li>
                </ul>

                <h2>四、写在最后</h2>
                <blockquote>
                    <p>停止政治写作，不代表我停止表达。</p>
                    <p>我依然会写科技、写游戏、写生活、写心理学，写一切我真正热爱的东西。</p>
                    <p>这个网站依然是我的一方小天地。</p>
                </blockquote>

                <p style="text-align: right; margin-top: 40px;">—— ciallo0721-cmd，写于 2026 年 8 月 1 日</p>
            </div>'''
html = html[:content_start] + new_content + html[content_end:]

# ---- 写文件 ----
if not os.path.exists(DST_DIR):
    os.makedirs(DST_DIR)
with io.open(DST, "w", encoding="utf-8") as f:
    f.write(html)

print("OK ->", DST, os.path.getsize(DST), "bytes")
# 校验：不应残留旧标题
for bad in ["暑期", "降频", "#061", "2026-07-10"]:
    if bad in html:
        print("WARN: 残留 ->", bad)
