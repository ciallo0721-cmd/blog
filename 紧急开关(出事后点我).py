#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
开关.py — 紧急文章发布系统
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
本程序用于在网站所有者发生意外后，由其家属、办案机关或
可信联系人向公众发布紧急声明。
请仅在确认网站所有者已失联或遭遇不测时执行。

用法: python 开关.py

⚠️ 本操作不可逆，请审慎确认。
"""

import os
import sys
import shutil
from datetime import datetime

# ── 路径 ──────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
EMERGENCY_DIR = os.path.join(SCRIPT_DIR, "blog", "emergency")
EMERGENCY_FILE = os.path.join(EMERGENCY_DIR, "index.html")
ARTICLES_DATA = os.path.join(SCRIPT_DIR, "articles-data.js")

# ── 文章内容 ──────────────────────────────
EMERGENCY_HTML = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <link rel="canonical" href="https://ciallo0721-cmd.top/blog/emergency/">
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>紧急公告 - ciallo0721-cmd 失联声明</title>
    <meta name="description" content="如果你看到这篇文章，说明 ciallo0721-cmd 已经失联。本页面由家属/办案机关发布。">
    <meta name="robots" content="noindex,nofollow">
    <link rel="icon" href="/fanv.ico" type="image/x-icon">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    font-family: 'Noto Serif SC', 'Source Han Serif SC', 'SimSun', 'STSong', serif;
    background: #f5f0eb;
    color: #222;
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
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    border: 1px solid #d9d0c4;
    position: relative;
}
/* 红色抬头 */
.header-bar {
    text-align: center;
    padding-bottom: 28px;
    border-bottom: 3px double #cc0000;
    margin-bottom: 32px;
}
.header-bar .seal-icon {
    color: #cc0000;
    font-size: 2.2rem;
    display: block;
    margin-bottom: 6px;
}
.header-bar h1 {
    font-size: 1.8rem;
    color: #cc0000;
    letter-spacing: 6px;
    font-weight: 900;
}
.header-bar .subtitle {
    font-size: 0.95rem;
    color: #888;
    margin-top: 8px;
    letter-spacing: 2px;
}
/* 正文 */
.notice-body { font-size: 1.05rem; color: #333; }
.notice-body p { margin-bottom: 18px; text-indent: 2em; }
.notice-body p.no-indent { text-indent: 0; }
/* 关键信息框 */
.key-info {
    background: #fef6f0;
    border: 1px solid #e8d5c8;
    border-left: 5px solid #cc0000;
    padding: 20px 24px;
    margin: 24px 0;
    border-radius: 0 6px 6px 0;
}
.key-info p { text-indent: 0; margin-bottom: 8px; }
.key-info .label { font-weight: 700; color: #cc0000; }
/* 联系方式 */
.contact-box {
    text-align: center;
    margin: 32px 0;
    padding: 16px;
    border: 2px dashed #cc0000;
    border-radius: 8px;
    background: #fff8f5;
}
.contact-box p { text-indent: 0; margin-bottom: 6px; }
.contact-box .phone {
    font-size: 1.8rem;
    font-weight: 900;
    color: #cc0000;
    letter-spacing: 4px;
    font-family: 'Courier New', monospace;
}
.contact-box .hint { font-size: 0.9rem; color: #888; }
/* 签名区 */
.signature {
    text-align: right;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid #ddd;
}
.signature p { text-indent: 0; margin-bottom: 4px; font-size: 0.95rem; }
.signature .stamp {
    display: inline-block;
    border: 2px solid #cc0000;
    color: #cc0000;
    padding: 4px 16px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 2px;
    margin-top: 8px;
    transform: rotate(-2deg);
    opacity: 0.9;
}
/* 底部 */
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
    .contact-box .phone { font-size: 1.4rem; }
}
</style>
</head>
<body>
<div class="container">
    <div class="header-bar">
        <span class="seal-icon">⚠</span>
        <h1>紧急公告</h1>
        <div class="subtitle">—— 失联声明 · 请知情者速与办案机关联系 ——</div>
    </div>

    <div class="notice-body">
        <p class="no-indent"><strong>致各位访客：</strong></p>

        <p>如果你看到本文，说明网站所有者 <strong>ciallo0721-cmd</strong> 已经处于失联状态或遭遇不测。本文并非由网站所有者本人所写，而是由其家属或办案机关通过预设的紧急发布系统发出。</p>

        <p>目前，相关人员正在就其下落进行调查。为了尽快获取线索，现面向社会公众征集与 ciallo0721-cmd 有关的信息。</p>

        <div class="key-info">
            <p><span class="label">■ 失联人信息</span></p>
            <p>网络身份：ciallo0721-cmd（亦使用「永雏塔菲的粉丝」「雏草姬」「墨羽」等昵称）</p>
            <p>身份特征：初中生个人开发者，独立运营多个开源项目及本网站</p>
            <p>网站地址：https://ciallo0721-cmd.top</p>
            <p style="margin-top:10px;color:#cc0000;font-size:0.9rem;">* 更多个人身份信息请与办案机关核实，此处不便公开</p>
        </div>

        <p>任何了解其去向、近况或相关线索的人士，请通过以下方式联系。每一条信息都可能对调查有所帮助。</p>

        <div class="contact-box">
            <p><strong>联系人：</strong>办案机关 / 家属</p>
            <p class="phone">3627742771</p>
            <p class="hint">（QQ号码，可作为线索提供联系方式）</p>
        </div>

        <div class="key-info">
            <p><span class="label">■ 本页面说明</span></p>
            <p>本页面由 ciallo0721-cmd 于 2026年7月10日 预设编写，嵌入其个人网站项目中。仅当紧急发布程序被触发后方可见。页面设计以庄重、正式为原则，便于办案机关及家属直接使用。</p>
        </div>

        <p>感谢每一位关心此事的人。希望一切只是虚惊一场。</p>
    </div>

    <div class="signature">
        <p>本声明由紧急发布系统生成</p>
        <p>发布日期：<span id="publishDate"></span></p>
        <span class="stamp">已启动紧急程序</span>
    </div>

    <div class="footer-bar">
        <p>ciallo0721-cmd.top · 紧急备查 · 2026年7月10日 预设</p>
    </div>
</div>
<script>document.getElementById('publishDate').textContent = new Date().toLocaleDateString('zh-CN', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' });</script>
</body>
</html>"""


# ── 文章数据条目 ──────────────────────────
ARTICLES_DATA_ENTRY = """
        {
            id: 999,
            category: "紧急",
            fileName: "emergency/",
            title: "【紧急公告】失联声明——ciallo0721-cmd 已失联，请速与办案机关联系",
            excerpt: "如果你看到本文，说明 ciallo0721-cmd 已经失联。本文由家属/办案机关发布。有线索请联系：3627742771",
            date: "2026-07-10",
            tags: ["紧急公告", "失联", "寻人", "安全"],
            readTime: 2,
            featured: false
        },"""

# ── 确认提示语 ──────────────────────────
CONFIRM_PROMPTS = [
    # ── 第1次确认 ──
    (
        "╔══════════════════════════════════════════════════════════╗\n"
        "║                   第 1 次确认                           ║\n"
        "╠══════════════════════════════════════════════════════════╣\n"
        "║  您即将发布一篇面向全体访客的紧急声明文章。              ║\n"
        "║  该文章将宣告网站所有者已处于失联状态。                  ║\n"
        "║                                                          ║\n"
        "║  请确认：网站所有者确实已失联或遭遇不测。                ║\n"
        "║                                                          ║\n"
        "║  若您不确定，请立即退出本程序。                          ║\n"
        "╚══════════════════════════════════════════════════════════╝\n"
    ),
    # ── 第2次确认 ──
    (
        "╔══════════════════════════════════════════════════════════╗\n"
        "║                   第 2 次确认                           ║\n"
        "╠══════════════════════════════════════════════════════════╣\n"
        "║  再次确认：本文章将公开发布于互联网，                    ║\n"
        "║  声明「网站所有者已失联，正在调查中」。                  ║\n"
        "║                                                          ║\n"
        "║  此信息可能被社会公众和媒体广泛传播。                    ║\n"
        "║  请确认您已核实网站所有者的安全状况，                    ║\n"
        "║  且有权代表家属或办案机关发布此声明。                    ║\n"
        "║  如果发布了不实信息，将承担相应法律责任。                ║\n"
        "╚══════════════════════════════════════════════════════════╝\n"
    ),
    # ── 第3次确认 ──
    (
        "╔══════════════════════════════════════════════════════════╗\n"
        "║                   第 3 次确认（最终确认）                ║\n"
        "╠══════════════════════════════════════════════════════════╣\n"
        "║  这是最后一次确认。                                      ║\n"
        "║                                                          ║\n"
        "║  ⚠ 本操作不可逆。文章发布后将立即在网站上生效，          ║\n"
        "║  ⚠ 所有访客均可查阅。                                    ║\n"
        "║                                                          ║\n"
        "║  发布后，请务必在第一时间联系当地公安机关（110）。        ║\n"
        "║                                                          ║\n"
        "║  若对当前情况有任何不确定，请立即关闭本窗口。            ║\n"
        "╚══════════════════════════════════════════════════════════╝\n"
    ),
]


def clear_screen():
    """清除终端屏幕"""
    os.system("cls" if os.name == "nt" else "clear")


def confirm(attempt: int, prompt: str) -> bool:
    """询问确认，返回是否通过"""
    print(prompt)
    result = input(f"请输入 YES 以确认（第 {attempt}/3 次）: ").strip()
    return result == "YES"


def create_emergency_article():
    """创建紧急文章文件"""
    os.makedirs(EMERGENCY_DIR, exist_ok=True)
    with open(EMERGENCY_FILE, "w", encoding="utf-8") as f:
        f.write(EMERGENCY_HTML)
    print(f"\n[完成] 紧急文章已生成: {EMERGENCY_FILE}")


def update_articles_data():
    """向 articles-data.js 插入紧急文章条目"""
    if not os.path.isfile(ARTICLES_DATA):
        print(f"\n[警告] 未找到 articles-data.js，已跳过数据注册。")
        return False
    
    with open(ARTICLES_DATA, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 检查是否已经插入过
    if "id: 999" in content:
        print(f"\n[提示] 紧急文章条目已存在，无需重复注册。")
        return True
    
    # 在最后一个 article 条目后插入（在 "];" 之前）
    insert_pos = content.rfind(r"],")
    if insert_pos == -1:
        print(f"\n[错误] articles-data.js 格式异常，请手动添加条目。")
        return False
    
    new_content = content[:insert_pos] + ARTICLES_DATA_ENTRY + "\n" + content[insert_pos:]
    with open(ARTICLES_DATA, "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print(f"\n[完成] 已将条目注册至 articles-data.js（文章 ID: 999）")
    return True


def main():
    clear_screen()
    print("=" * 58)
    print("       紧急文章发布系统")
    print("       Emergency Notice Publisher")
    print("=" * 58)
    print()
    print(f"  系统时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  工作路径: {SCRIPT_DIR}")
    print()
    print("  本程序用于在网站所有者失联后，由家属、")
    print("  办案机关或可信联系人发布紧急声明。")
    print("  请仅在确认失联后执行本程序。")
    print()
    
    for i, prompt in enumerate(CONFIRM_PROMPTS, 1):
        if not confirm(i, prompt):
            print("\n操作已取消。未发布任何内容。")
            sys.exit(0)
        clear_screen()
    
    # ── 三确认通过，执行发布 ──
    print("=" * 58)
    print("   正在生成紧急文章……")
    print("=" * 58)
    print()
    
    create_emergency_article()
    update_articles_data()
    
    print()
    print("=" * 58)
    print("   紧急文章已成功发布。")
    print("=" * 58)
    print()
    print("   文章地址:")
    print(f"   https://ciallo0721-cmd.top/blog/emergency/")
    print()
    print("   重要提醒：")
    print("   请尽快联系当地公安机关（110）并通报情况。")
    print()
    print("   若系误操作，请立即手动删除：")
    print(f"   - {EMERGENCY_FILE}")
    print("   - articles-data.js 中 ID 为 999 的条目")
    print()


if __name__ == "__main__":
    main()
