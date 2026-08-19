#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
找回开关.py — 找回确认发布系统
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
本程序用于在紧急文章发布后，确认网站所有者已被找到。
需选择以下两种情况之一：

  [A] 安全找回 — 网站所有者活着被找到，播放背景音乐
  [B] 最坏情况 — 确认遇难，灰白色页面，无音乐

用法: python 找回开关.py

⚠️ 请务必确认实际情况后再执行。
"""

import os
import sys
from datetime import datetime

# ── 路径 ──────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
EMERGENCY_DIR = os.path.join(SCRIPT_DIR, "blog", "emergency")
EMERGENCY_FILE = os.path.join(EMERGENCY_DIR, "index.html")
BACKUP_FILE = os.path.join(EMERGENCY_DIR, "backup_emergency.html")
ARTICLES_DATA = os.path.join(SCRIPT_DIR, "articles-data.js")
MP3_FILE = os.path.join(EMERGENCY_DIR, "休日のアクアリウム.mp3")

# ── 场景 A：安全找回（有音乐，正常色调） ──
HTML_ALIVE = u"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <link rel="canonical" href="https://ciallo0721-cmd.top/blog/emergency/">
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>平安通告 - ciallo0721-cmd 已找回，平安</title>
    <meta name="description" content="ciallo0721-cmd 已安全找回，感谢各位关心。">
    <meta name="robots" content="noindex,nofollow">
    <link rel="icon" href="/fanv.ico" type="image/x-icon">
    <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        font-family: 'Noto Serif SC', 'Source Han Serif SC', 'SimSun', 'STSong', serif;
        background: linear-gradient(135deg, #f7f9fc 0%, #e8f0fe 100%);
        color: #2c3e50;
        line-height: 2;
        min-height: 100vh;
        padding: 60px 20px;
    }
    .container {
        max-width: 780px;
        width: 100%;
        margin: 0 auto;
        background: #fff;
        padding: 60px 56px;
        box-shadow: 0 4px 30px rgba(0,100,200,0.10);
        border: 1px solid #c8d8e8;
        border-radius: 4px;
        position: relative;
        overflow: hidden;
    }
    .container::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 5px;
        background: linear-gradient(90deg, #4CAF50, #81C784, #A5D6A7);
    }
    .header-bar {
        text-align: center;
        padding-bottom: 28px;
        border-bottom: 2px solid #A5D6A7;
        margin-bottom: 32px;
    }
    .header-bar .icon {
        color: #4CAF50;
        font-size: 3rem;
        display: block;
        margin-bottom: 6px;
    }
    .header-bar h1 {
        font-size: 1.8rem;
        color: #2e7d32;
        letter-spacing: 4px;
        font-weight: 900;
    }
    .header-bar .subtitle {
        font-size: 0.95rem;
        color: #66BB6A;
        margin-top: 8px;
        letter-spacing: 2px;
    }
    .notice-body { font-size: 1.05rem; color: #333; }
    .notice-body p { margin-bottom: 18px; text-indent: 2em; }
    .notice-body p.no-indent { text-indent: 0; }
    .good-news {
        background: #f1f8e9;
        border: 1px solid #C8E6C9;
        border-left: 5px solid #4CAF50;
        padding: 20px 24px;
        margin: 24px 0;
        border-radius: 0 6px 6px 0;
    }
    .good-news p { text-indent: 0; margin-bottom: 6px; }
    .good-news .big { font-size: 1.3rem; font-weight: 700; color: #2e7d32; text-align: center; }
    .signature {
        text-align: right;
        margin-top: 40px;
        padding-top: 24px;
        border-top: 1px solid #ddd;
    }
    .signature p { text-indent: 0; margin-bottom: 4px; font-size: 0.95rem; }
    .signature .stamp {
        display: inline-block;
        border: 2px solid #4CAF50;
        color: #2e7d32;
        padding: 4px 16px;
        border-radius: 4px;
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 2px;
        margin-top: 8px;
        transform: rotate(-2deg);
    }
    .footer-bar {
        text-align: center;
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #ddd;
        font-size: 0.8rem;
        color: #999;
    }
    @media (max-width: 600px) {
        .container { padding: 40px 24px; }
        .header-bar h1 { font-size: 1.4rem; letter-spacing: 3px; }
    }
    </style>
</head>
<body>
<div class="container">
    <div class="header-bar">
        <span class="icon">&#10004;</span>
        <h1>平安通告</h1>
        <div class="subtitle">—— ciallo0721-cmd 已安全找回 ——</div>
    </div>

    <div class="notice-body">
        <p class="no-indent"><strong>致各位关心 ciallo0721-cmd 的朋友：</strong></p>

        <div class="good-news">
            <p class="big">&#10024; 已确认平安 &#10024;</p>
            <p style="text-align:center;">网站所有者 ciallo0721-cmd 已被警方安全找回，目前平安无恙。</p>
        </div>

        <p>感谢每一位为此事提供线索、转发信息、表达关心的朋友。你们的关注和帮助起到了关键作用。在此，家属及网站所有者本人向所有伸出援手的人致以最诚挚的谢意。</p>

        <p>之前的紧急公告现已失效。网站将恢复正常运作，文章更新也将逐步恢复。如有疑问，可通过原有渠道联系。</p>

        <p>感谢大家。虚拟世界的另一端，有人因为你们的善意而得以平安归来。</p>
    </div>

    <div class="signature">
        <p>家属 / 办案机关 代发</p>
        <p>发布日期：<span id="publishDate"></span></p>
        <span class="stamp">已确认平安</span>
    </div>

    <div class="footer-bar">
        <p>ciallo0721-cmd.top · 平安通告</p>
    </div>
</div>
<!-- 背景音乐：休日のアクアリウム -->
<audio id="bgMusic" src="休日のアクアリウム.mp3" autoplay loop style="display:none;"></audio>
<script>
document.getElementById('publishDate').textContent = new Date().toLocaleDateString('zh-CN', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' });
// 部分浏览器阻止自动播放，尝试用户交互后播放
document.addEventListener('click', function() {
    var audio = document.getElementById('bgMusic');
    if (audio && audio.paused) { audio.play().catch(function(){}); }
}, { once: true });
</script>
</body>
</html>"""

# ── 场景 B：最坏打算（灰白色，无音乐） ──
HTML_WORST = u"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <link rel="canonical" href="https://ciallo0721-cmd.top/blog/emergency/">
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>沉痛公告 - ciallo0721-cmd</title>
    <meta name="description" content="沉痛宣告：ciallo0721-cmd 已确认遇难。">
    <meta name="robots" content="noindex,nofollow">
    <link rel="icon" href="/fanv.ico" type="image/x-icon">
    <style>
    html { filter: grayscale(100%); }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        font-family: 'Noto Serif SC', 'Source Han Serif SC', 'SimSun', 'STSong', serif;
        background: #f5f5f5;
        color: #333;
        line-height: 2;
        min-height: 100vh;
        padding: 60px 20px;
    }
    .container {
        max-width: 780px;
        width: 100%;
        margin: 0 auto;
        background: #fff;
        padding: 60px 56px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        border: 1px solid #ddd;
        position: relative;
    }
    .container::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 5px;
        background: #555;
    }
    .header-bar {
        text-align: center;
        padding-bottom: 28px;
        border-bottom: 2px solid #ccc;
        margin-bottom: 32px;
    }
    .header-bar .icon {
        color: #666;
        font-size: 2.6rem;
        display: block;
        margin-bottom: 6px;
    }
    .header-bar h1 {
        font-size: 1.8rem;
        color: #222;
        letter-spacing: 6px;
        font-weight: 900;
    }
    .header-bar .subtitle {
        font-size: 0.9rem;
        color: #999;
        margin-top: 8px;
        letter-spacing: 2px;
    }
    .notice-body { font-size: 1.05rem; color: #444; }
    .notice-body p { margin-bottom: 18px; text-indent: 2em; }
    .notice-body p.no-indent { text-indent: 0; }
    .sad-news {
        background: #fafafa;
        border: 1px solid #ddd;
        border-left: 5px solid #666;
        padding: 20px 24px;
        margin: 24px 0;
        border-radius: 0 6px 6px 0;
    }
    .sad-news p { text-indent: 0; margin-bottom: 6px; }
    .sad-news .big { font-size: 1.2rem; font-weight: 700; color: #222; text-align: center; }
    .memorial {
        text-align: center;
        margin: 32px 0;
        padding: 24px;
        border-top: 1px solid #ddd;
        border-bottom: 1px solid #ddd;
    }
    .memorial .name { font-size: 1.6rem; font-weight: 700; color: #222; letter-spacing: 2px; }
    .memorial .dates { font-size: 0.9rem; color: #999; margin-top: 8px; }
    .memorial .line { width: 40px; height: 1px; background: #ccc; margin: 12px auto; }
    .signature {
        text-align: right;
        margin-top: 40px;
        padding-top: 24px;
        border-top: 1px solid #ddd;
    }
    .signature p { text-indent: 0; margin-bottom: 4px; font-size: 0.95rem; }
    .signature .stamp {
        display: inline-block;
        border: 1px solid #666;
        color: #666;
        padding: 4px 16px;
        font-size: 0.85rem;
        letter-spacing: 2px;
        margin-top: 8px;
    }
    .footer-bar {
        text-align: center;
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #ddd;
        font-size: 0.8rem;
        color: #aaa;
    }
    @media (max-width: 600px) {
        .container { padding: 40px 24px; }
        .header-bar h1 { font-size: 1.4rem; letter-spacing: 3px; }
    }
    </style>
</head>
<body>
<div class="container">
    <div class="header-bar">
        <span class="icon">&#10013;</span>
        <h1>沉痛公告</h1>
        <div class="subtitle">—— 沉痛宣告：ciallo0721-cmd 已确认遇难 ——</div>
    </div>

    <div class="notice-body">
        <p class="no-indent"><strong>致各位访客：</strong></p>

        <div class="sad-news">
            <p class="big">我们怀着沉痛的心情宣告，</p>
            <p style="text-align:center;">网站所有者 ciallo0721-cmd 已确认遇难。</p>
        </div>

        <p>在此，我们向所有关心此事的人通报这一不幸消息。感谢每一位在此之前提供线索、转发信息和给予帮助的朋友。你们的努力我们都看到了。</p>

        <p>案件仍在进一步处理中，如有后续信息，办案机关将另行通报。</p>

        <div class="memorial">
            <div class="line"></div>
            <div class="name">ciallo0721-cmd</div>
            <div class="dates">—— 愿安息 ——</div>
            <div class="line"></div>
        </div>

        <p>一个年轻的生命离开了。互联网的另一端，少了一位活跃的开发者、一名初二学生、一个热爱分享的少年。我们深切哀悼。</p>

        <p style="font-size:0.95rem;color:#888;text-align:center;margin-top:24px;">网站将无限期暂停更新，以表哀思。</p>
    </div>

    <div class="signature">
        <p>家属 / 办案机关</p>
        <p>发布日期：<span id="publishDate"></span></p>
        <span class="stamp">已确认遇难</span>
    </div>

    <div class="footer-bar">
        <p>ciallo0721-cmd.top · 沉痛悼念</p>
    </div>
</div>
<script>
document.getElementById('publishDate').textContent = new Date().toLocaleDateString('zh-CN', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' });
</script>
</body>
</html>"""

# ── articles-data.js 条目更新 ────────────
ARTICLES_ALIVE_ENTRY = """
        {
            id: 999,
            category: "平安",
            fileName: "emergency/",
            title: "【平安通告】ciallo0721-cmd 已安全找回，感谢各位",
            excerpt: "ciallo0721-cmd 已被警方安全找回，目前平安无恙。感谢每一位关心和帮助的人。",
            date: \"""" + datetime.now().strftime("%Y-%m-%d") + """\",
            tags: ["平安通告", "已找回", "感谢"],
            readTime: 2,
            featured: false
        },"""

ARTICLES_WORST_ENTRY = """
        {
            id: 999,
            category: "悼念",
            fileName: "emergency/",
            title: "【沉痛公告】ciallo0721-cmd 已确认遇难",
            excerpt: "沉痛宣告：网站所有者 ciallo0721-cmd 已确认遇难。网站将无限期暂停更新。",
            date: \"""" + datetime.now().strftime("%Y-%m-%d") + """\",
            tags: ["沉痛悼念", "讣告"],
            readTime: 2,
            featured: false
        },"""


# ── 确认提示语 ──────────────────────────
CONFIRM_PROMPTS = [
    (
        "\n"
        "╔══════════════════════════════════════════════════════════╗\n"
        "║                   第 1 次确认                           ║\n"
        "╠══════════════════════════════════════════════════════════╣\n"
        "║  您即将发布一条关于网站所有者下落的最新公告。            ║\n"
        "║  本公告将替换此前发布的紧急失联声明。                    ║\n"
        "║                                                          ║\n"
        "║  请确认您已掌握确定性的最终结果。                        ║\n"
        "╚══════════════════════════════════════════════════════════╝\n"
    ),
    (
        "\n"
        "╔══════════════════════════════════════════════════════════╗\n"
        "║                   第 2 次确认                           ║\n"
        "╠══════════════════════════════════════════════════════════╣\n"
        "║  再次确认：本公告将公开发布，替换原紧急失联声明。        ║\n"
        "║  此信息将被社会公众看到，且无法撤回。                    ║\n"
        "║                                                          ║\n"
        "║  请确认您已核实最终结果，且有权发布此公告。              ║\n"
        "╚══════════════════════════════════════════════════════════╝\n"
    ),
    (
        "\n"
        "╔══════════════════════════════════════════════════════════╗\n"
        "║                   第 3 次确认（最终确认）                ║\n"
        "╠══════════════════════════════════════════════════════════╣\n"
        "║  这是最后一次确认。                                      ║\n"
        "║                                                          ║\n"
        "║  ⚠ 本操作不可逆。公告发布后立即生效。                    ║\n"
        "║                                                          ║\n"
        "║  请确保所选场景与实际情况完全一致。                      ║\n"
        "║                                                          ║\n"
        "║  若不确定，请立即关闭本窗口。                            ║\n"
        "╚══════════════════════════════════════════════════════════╝\n"
    ),
]


def clear_screen():
    os.system("cls" if os.name == "nt" else "clear")


def confirm(attempt: int, prompt: str) -> bool:
    print(prompt)
    result = input(f"请输入 YES 以确认（第 {attempt}/3 次）: ").strip()
    return result == "YES"


def backup_emergency():
    """备份原紧急文章"""
    if os.path.isfile(EMERGENCY_FILE):
        import shutil
        shutil.copy2(EMERGENCY_FILE, BACKUP_FILE)
        print(f"[备份] 原紧急文章已备份至: {BACKUP_FILE}")


def publish_article(html_content, data_entry):
    """发布公告文章"""
    with open(EMERGENCY_FILE, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"[完成] 公告文章已生成: {EMERGENCY_FILE}")

    # 更新 articles-data.js
    if os.path.isfile(ARTICLES_DATA):
        with open(ARTICLES_DATA, "r", encoding="utf-8") as f:
            content = f.read()
        if "id: 999" in content:
            # 替换已有条目
            import re
            pattern = re.compile(r'\{\s*id:\s*999.*?(?=\n\s*\},)', re.DOTALL)
            # 找到 id: 999 所在条目的开始和结束
            idx = content.find("id: 999")
            # 向前找到 { 开头
            start = content.rfind("{", 0, idx)
            # 向后找到 }, 结尾
            end = content.find("},", idx) + 2
            if start != -1 and end != -1:
                content = content[:start] + data_entry.strip() + content[end:]
                with open(ARTICLES_DATA, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"[完成] 已更新 articles-data.js 中的条目")
            else:
                print(f"[警告] 无法自动更新 articles-data.js，请手动替换 ID:999 的条目")
        else:
            # 插入新条目
            insert_pos = content.rfind(r"],")
            if insert_pos != -1:
                content = content[:insert_pos] + data_entry + "\n" + content[insert_pos:]
                with open(ARTICLES_DATA, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"[完成] 已注册至 articles-data.js")
    else:
        print(f"[警告] 未找到 articles-data.js，已跳过数据更新")


def main():
    clear_screen()
    print("=" * 58)
    print("        找回确认发布系统")
    print("    Found / Recovery Notice Publisher")
    print("=" * 58)
    print()
    print(f"  系统时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  工作路径: {SCRIPT_DIR}")
    print()
    print("  本程序用于在紧急失联声明发布后，")
    print("  在确认网站所有者下落的情况下，")
    print("  向公众发布最终结果。")
    print()

    # ── 选择场景 ──
    print("-" * 58)
    print("  请选择实际情况：")
    print()
    print("    [A] 安全找回 — 活着被警方找回")
    print("        → 发布平安通告，自动播放背景音乐")
    print()
    print("    [B] 最坏情况 — 确认遇难")
    print("        → 发布沉痛公告，页面灰白色，无音乐")
    print("-" * 58)

    scenario = input("\n请输入 A 或 B: ").strip().upper()
    while scenario not in ("A", "B"):
        scenario = input("输入无效，请输入 A 或 B: ").strip().upper()

    print()
    if scenario == "A":
        print(f"  已选择: [A] 安全找回（有背景音乐）")
    else:
        print(f"  已选择: [B] 最坏情况（灰白 + 无音乐）")
    print()

    # ── 三次确认 ──
    for i, prompt in enumerate(CONFIRM_PROMPTS, 1):
        if not confirm(i, prompt):
            print("\n操作已取消。未发布任何内容。")
            sys.exit(0)
        clear_screen()

    # ── 执行发布 ──
    print("=" * 58)
    if scenario == "A":
        print("   正在生成平安通告……")
    else:
        print("   正在生成沉痛公告……")
    print("=" * 58)
    print()

    backup_emergency()

    if scenario == "A":
        publish_article(HTML_ALIVE, ARTICLES_ALIVE_ENTRY)
    else:
        publish_article(HTML_WORST, ARTICLES_WORST_ENTRY)

    print()
    print("=" * 58)
    if scenario == "A":
        print("   平安通告已成功发布。")
        print("   背景音乐将自动播放。")
    else:
        print("   沉痛公告已成功发布。")
        print("   页面已应用灰白色主题。")
    print("=" * 58)
    print()
    print("   公告地址:")
    print("   https://ciallo0721-cmd.top/blog/emergency/")
    print()
    print("   若系误操作，请立即手动处理：")
    print(f"   - 从备份恢复: {BACKUP_FILE}")
    print("   - 或手动编辑 articles-data.js")
    print()


if __name__ == "__main__":
    main()
