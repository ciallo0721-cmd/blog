# -*- coding: utf-8 -*-
"""
文章编辑器 —— Markdown 转 HTML 博客文章编辑器
================================================
- 左窗口（tkinter）：Markdown 编辑器 + 格式工具栏 + 文章信息
- 右窗口（pywebview / Chromium 内核）：实时渲染完整模板（CSS / JS 100% 还原）
- 导出：按 blog/muban/index.html 模板生成 blog/{分类}/{id}/index.html，
  并更新 articles-data.js（新文章 id = 现有最大 id + 1）

架构说明：
- pywebview 的 start() 必须在主线程运行，与 tkinter mainloop 冲突，
  因此预览窗口跑在独立子进程（--preview 模式）。
- 主进程只把完整 HTML 写到 .md_preview/live.html（纯磁盘写，绝不阻塞主线程）；
  子进程起本地 HTTP 服务，页面 JS 每 400ms 轮询内容变化自动刷新。
  （不要改回管道推送：同步写大 HTML 到管道会因缓冲区满把 tkinter 卡死）

依赖：pip install markdown pywebview
运行：python 实用工具/文章编辑器.py
"""
import re
import sys
import html
import json
import subprocess
import threading
from pathlib import Path
from datetime import date

import tkinter as tk
from tkinter import ttk, filedialog, messagebox

import markdown
from markdown.inlinepatterns import InlineProcessor
from markdown.extensions import Extension
import xml.etree.ElementTree as etree

# ────────────────────────── 路径与常量 ──────────────────────────
ROOT = Path(__file__).resolve().parent.parent          # 网站根目录
TEMPLATE = ROOT / "blog" / "muban" / "index.html"      # 文章模板
DATA_JS = ROOT / "articles-data.js"                    # 文章数据源
SITE = "https://ciallo0721-cmd.top"

DEFAULT_CATEGORIES = ["教程", "公告", "ACG", "心理学", "生活", "科技", "医学", "小说", "日记", "闲聊"]


# ────────────────────────── Markdown 扩展 ──────────────────────────
class HlExtension(Extension):
    """ ==text== -> <span class="hl">text</span>  (模板的粉色高亮) """
    class HlInline(InlineProcessor):
        def handleMatch(self, m, data):
            el = etree.Element("span")
            el.set("class", "hl")
            el.text = m.group(1)
            return el, m.start(0), m.end(0)

    def extendMarkdown(self, md):
        md.inlinePatterns.register(self.HlInline(r"==(.+?)==", md), "hl", 175)


_MD = markdown.Markdown(
    extensions=["fenced_code", "tables", "toc", "sane_lists", "attr_list", HlExtension()],
    extension_configs={"toc": {"toc_depth": "1-3"}},
)


def md_to_html(text: str):
    """ 转换 markdown，返回 (正文HTML, 目录HTML) """
    _MD.reset()
    body = _MD.convert(text)
    toc = _MD.toc  # <div class="toc"><ul>...</ul></div>
    return body, toc


def plain_text(text: str) -> str:
    """ 粗略去掉 markdown 符号，用于生成摘要 / 统计字数 """
    t = re.sub(r"```.*?```", "", text, flags=re.S)
    t = re.sub(r"`([^`]*)`", r"\1", t)
    t = re.sub(r"!\[([^\]]*)\]\([^)]*\)", r"\1", t)
    t = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", t)
    t = re.sub(r"[#>*_~\-|]", " ", t)
    t = re.sub(r"\s+", " ", t)
    return t.strip()


def estimate_read_time(text: str) -> int:
    return max(1, round(len(plain_text(text)) / 300))


def extract_title(md_text: str):
    """ 提取第一个 `# 标题` 作为文章标题（跳过代码块内的 # 注释），并从正文移除。
    返回 (标题或None, 剩余正文) """
    lines = md_text.split("\n")
    in_code = False
    for i, line in enumerate(lines):
        if line.strip().startswith("```"):
            in_code = not in_code
        if not in_code:
            m = re.match(r"^\s*#\s+(.+?)\s*$", line)
            if m:
                rest = "\n".join(lines[:i] + lines[i + 1:])
                return m.group(1).strip(), rest
    return None, md_text


def scan_templates():
    """ 扫描可选模板：默认 muban + blog 下所有数字文章目录的 index.html
    返回 [(显示名, Path)]，显示名如 'muban（默认）'、'心理学/63' """
    tpls = [("muban（默认）", TEMPLATE)]
    blog_dir = ROOT / "blog"
    if blog_dir.is_dir():
        for cat_dir in sorted(blog_dir.iterdir()):
            if not cat_dir.is_dir() or cat_dir.name == "muban":
                continue
            for aid_dir in sorted(cat_dir.iterdir(),
                                  key=lambda p: (not p.name.isdigit(), p.name)):
                if aid_dir.name.isdigit():
                    idx = aid_dir / "index.html"
                    if idx.exists():
                        tpls.append((f"{cat_dir.name}/{aid_dir.name}", idx))
    return tpls


def template_name_of(path: Path) -> str:
    """ 由模板路径反查显示名（未命中就返回路径） """
    for name, p in scan_templates():
        if p == path:
            return name
    return str(path)


def _replace_article_content(tpl: str, content_html: str) -> str:
    """ 替换 <div class="article-content">...</div> 内的内容。
    优先匹配 muban 的注释锚点；无注释时用 div 标签栈计数找闭合（兼容真实文章模板，如 72） """
    start_m = re.search(r'<div class="article-content">', tpl)
    if not start_m:
        return tpl
    start = start_m.start()
    after = tpl[start_m.end():]
    # 1) 注释锚点（muban 格式）
    end_m = re.search(r'</div>\s*<!-- /article-content -->', after)
    if end_m:
        end = start_m.end() + end_m.end()
        new_block = f'<div class="article-content">\n{content_html}\n            </div><!-- /article-content -->'
        return tpl[:start] + new_block + tpl[end:]
    # 2) 无注释：div 栈计数找匹配的 </div>
    depth = 1
    for m in re.finditer(r'<div\b|</div>', after):
        if m.group(0).startswith("<div"):
            depth += 1
        else:
            depth -= 1
            if depth == 0:
                end = start_m.end() + m.end()
                new_block = f'<div class="article-content">\n{content_html}\n            </div>'
                return tpl[:start] + new_block + tpl[end:]
    return tpl


# ────────────────────────── 模板 → 文章 HTML ──────────────────────────
def build_article_html(meta: dict, content_html: str, toc_html: str = "",
                       template: Path = None) -> str:
    """ 基于模板生成完整文章 HTML，模板里的 CSS / JS 全部原样保留 """
    tpl = (template or TEMPLATE).read_text(encoding="utf-8")
    cat, aid = meta["category"], meta["id"]
    article_url = f"{SITE}/blog/{cat}/{aid}/"
    title_e = html.escape(meta["title"])
    excerpt_e = html.escape(meta["excerpt"])
    tags_html = "\n                    ".join(
        f'<span class="article-tag">{html.escape(t)}</span>' for t in meta["tags"]
    )
    date_str = meta["date"]
    rt = meta["readTime"]

    # head 信息
    tpl = re.sub(r'<link rel="canonical" href="[^"]*">',
                 f'<link rel="canonical" href="{article_url}">', tpl, count=1)
    tpl = re.sub(r"<title>.*?</title>",
                 f"<title>{title_e} | ciallo0721-cmd</title>", tpl, count=1, flags=re.S)
    tpl = re.sub(r'<meta name="description" content="[^"]*">',
                 f'<meta name="description" content="{excerpt_e}">', tpl, count=1)

    # 文章头部
    tpl = re.sub(r'<div class="article-number">.*?</div>',
                 f'<div class="article-number">{html.escape(cat)}</div>', tpl, count=1, flags=re.S)
    tpl = re.sub(r'<h1 class="article-title">.*?</h1>',
                 f'<h1 class="article-title">{title_e}</h1>', tpl, count=1, flags=re.S)
    tpl = re.sub(r'<p class="article-intro">.*?</p>',
                 f'<p class="article-intro">{excerpt_e}</p>', tpl, count=1, flags=re.S)
    meta_block = (
        '<div class="article-meta">\n'
        f'                    <div class="article-date"><i class="far fa-calendar"></i> 发布日期：<span>{date_str}</span></div>\n'
        f'                    <div class="article-date"><i class="far fa-clock"></i> 阅读时间：<span>约{rt}分钟</span></div>\n'
        "                </div>"
    )
    tpl = re.sub(r'<div class="article-meta">.*?</div>\s*</div>',
                 meta_block, tpl, count=1, flags=re.S)
    tpl = re.sub(r'<div class="article-tags">.*?</div>',
                 f'<div class="article-tags">\n                    {tags_html}\n                </div>',
                 tpl, count=1, flags=re.S)

    # 目录
    if toc_html:
        toc_items = re.sub(r"<div class=\"toc\">\s*", "", toc_html, count=1)
        toc_items = toc_items.replace("<ul>", "<ol>").replace("</ul>", "</ol>")
        toc_items = re.sub(r"\s*</div>\s*$", "", toc_items).strip()
        toc_block = (
            '<nav class="toc-box" aria-label="文章目录">\n'
            '                <h4><i class="fas fa-list-ul"></i> &nbsp;目录</h4>\n'
            f"                {toc_items}\n"
            "            </nav>"
        )
        tpl = re.sub(r'<nav class="toc-box".*?</nav>',
                     toc_block, tpl, count=1, flags=re.S)

    # 正文（兼容有/无注释锚点的模板）
    tpl = _replace_article_content(tpl, content_html)

    # 分享链接 & 页脚
    tpl = re.sub(r"https://91vip\.xn--32v\.ink/blog/[^\"<]*", article_url, tpl)
    tpl = tpl.replace("© 2026 ciallo0721-cmd · 全机制样板文章",
                      f"© 2026 ciallo0721-cmd · {title_e}")
    tpl = tpl.replace("感谢阅读！这篇文章展示了网站所有内容机制喵～", "感谢阅读喵～")
    return tpl


# ────────────────────────── articles-data.js 更新 ──────────────────────────
def get_max_article_id() -> int:
    text = DATA_JS.read_text(encoding="utf-8")
    ids = [int(x) for x in re.findall(r"\bid:\s*(\d+)", text)]
    return max(ids) if ids else 0


def next_article_id() -> int:
    return get_max_article_id() + 1


def update_articles_data(meta: dict) -> None:
    """ 把新文章条目插入 articles-data.js（在数组 `];` 结尾之前） """
    entry = (
        "        {\n"
        f'            id: {meta["id"]},\n'
        f'            category: {json.dumps(meta["category"], ensure_ascii=False)},\n'
        f'            fileName: {json.dumps(meta["fileName"], ensure_ascii=False)},\n'
        f'            title: {json.dumps(meta["title"], ensure_ascii=False)},\n'
        f'            excerpt: {json.dumps(meta["excerpt"], ensure_ascii=False)},\n'
        f'            date: {json.dumps(meta["date"])},\n'
        f"            tags: {json.dumps(meta['tags'], ensure_ascii=False)},\n"
        f'            readTime: {meta["readTime"]},\n'
        f'            featured: {str(meta["featured"]).lower()}\n'
        "        },"
    )
    data = DATA_JS.read_text(encoding="utf-8")
    idx = data.rfind("];")
    if idx < 0:
        raise RuntimeError("articles-data.js 中未找到数组结尾 ];，请检查文件格式")
    before = data[:idx].rstrip()
    # 数组最后一条以 }, 结尾；如不是则补一个逗号
    if not before.endswith(","):
        before += ","
    new_data = before + "\n" + entry + "\n" + data[idx:]
    DATA_JS.write_text(new_data, encoding="utf-8")


# ═════════════════════════ 预览子进程（pywebview / Chromium） ═════════════════════════
# 通信方式：主进程把完整模板 HTML 写到 .md_preview/live.html（纯磁盘写，绝不阻塞），
# 子进程起本地 HTTP 服务 + 页面 JS 轮询检测内容变化自动刷新，彻底避免管道阻塞卡死。

PREVIEW_DIR = ROOT / ".md_preview"
LIVE_FILE = PREVIEW_DIR / "live.html"

# 外层壳页面：iframe 承载 live.html，永不整页刷新；轮询到 gen 变化才换 iframe 地址
SHELL_HTML = """<!DOCTYPE html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;height:100%;overflow:hidden;background:#fff}
#pv{width:100%;height:100%;border:0;display:block}
</style></head><body>
<iframe id="pv" src="live.html"></iframe>
<script>
(function(){
  var ifr = document.getElementById('pv');
  var last = '';
  setInterval(function(){
    var x = new XMLHttpRequest();
    x.open('GET', 'live.html?t=' + Date.now());
    x.onload = function(){
      var m = x.responseText.match(/<meta name="gen" content="([^"]*)"/);
      var cur = m ? m[1] : '';
      if (cur && cur !== last) {
        last = cur;
        // 加随机参数强制 iframe 重新加载，避免 WebView2 缓存旧内容
        ifr.src = 'live.html?v=' + cur + '&r=' + Math.random();
      }
    };
    x.send();
  }, 700);
})();
</script></body></html>"""


def _preview_child_main() -> int:
    """ 子进程入口：本地 HTTP 服务 + pywebview 打开 shell.html（iframe 轮询加载 live.html） """
    import http.server
    import functools
    import socketserver
    import webview

    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    try:
        (PREVIEW_DIR / "shell.html").write_text(SHELL_HTML, encoding="utf-8")
    except OSError:
        pass

    # 绑定可用端口，端口号写盘供主程序/调试读取
    port = None
    httpd = None
    for p in range(18999, 19020):
        try:
            handler = functools.partial(http.server.SimpleHTTPRequestHandler,
                                        directory=str(PREVIEW_DIR))
            httpd = socketserver.ThreadingTCPServer(("127.0.0.1", p), handler)
            port = p
            break
        except OSError:
            continue
    if httpd is None:
        return 1
    try:
        (PREVIEW_DIR / "port.txt").write_text(str(port), encoding="utf-8")
    except OSError:
        pass
    threading.Thread(target=httpd.serve_forever, daemon=True).start()

    webview.create_window(
        "文章预览 · Chromium 实时渲染",
        url=f"http://127.0.0.1:{port}/shell.html",
        width=940, height=820, x=760, y=30,
    )
    webview.start()
    try:
        httpd.shutdown()
    except Exception:
        pass
    return 0


# ═════════════════════════ 主窗口（tkinter 编辑器） ═════════════════════════
class App:
    def __init__(self, root: tk.Tk, start_preview: bool = True):
        self.root = root
        self.root.title("文章编辑器 —— Markdown → 博客 HTML")
        self.root.geometry("760x820+40+30")
        self.preview_proc = None
        self._ver = 0
        self.template = TEMPLATE   # 当前模板（可在文章信息里临时切换）

        # 文章信息（默认值）
        self.meta = {
            "title": "", "category": DEFAULT_CATEGORIES[0], "excerpt": "",
            "date": date.today().isoformat(), "tags": [], "featured": True,
        }
        self._updating = False

        self._build_toolbar()
        self._build_body()
        self._build_statusbar()
        self._refresh_status()

        self.root.protocol("WM_DELETE_WINDOW", self.on_close)
        if start_preview:
            self._write_live()            # 先写好初始预览页
            self._spawn_preview()         # 再开子进程窗口

    # ── 界面 ──
    def _build_toolbar(self):
        bar = tk.Frame(self.root, bg="#f0f0f5")
        bar.pack(side=tk.TOP, fill=tk.X)

        row1 = tk.Frame(bar, bg="#f0f0f5")
        row1.pack(fill=tk.X, padx=6, pady=(6, 2))
        row2 = tk.Frame(bar, bg="#f0f0f5")
        row2.pack(fill=tk.X, padx=6, pady=(0, 6))

        btns1 = [
            ("H1", lambda: self._toggle_line_prefix("# ")),
            ("H2", lambda: self._toggle_line_prefix("## ")),
            ("H3", lambda: self._toggle_line_prefix("### ")),
            ("H4", lambda: self._toggle_line_prefix("#### ")),
            ("|", None),
            ("B 加粗", lambda: self._wrap("**", "**", "加粗文字")),
            ("I 斜体", lambda: self._wrap("*", "*", "斜体文字")),
            ("S 删除线", lambda: self._wrap("~~", "~~", "删除线文字")),
            ("|", None),
            ("` 行内代码", lambda: self._wrap("`", "`", "code")),
            ("代码块", self._code_block),
            ("== 高亮", lambda: self._wrap("==", "==", "高亮文字")),
            ("|", None),
            ("> 引用", lambda: self._toggle_line_prefix("> ")),
            ("• 无序列表", lambda: self._toggle_line_prefix("- ")),
            ("1. 有序列表", lambda: self._toggle_line_prefix("1. ")),
        ]
        for text, cmd in btns1:
            if text == "|":
                tk.Frame(row1, width=1, bg="#c9c9d4").pack(side=tk.LEFT, fill=tk.Y, padx=4, pady=2)
                continue
            tk.Button(row1, text=text, command=cmd, relief=tk.FLAT, padx=10, pady=3,
                      bg="#ffffff", activebackground="#e6e6f0", cursor="hand2").pack(side=tk.LEFT, padx=2)

        btns2 = [
            ("⬅ 撤销", lambda: self.editor.edit_undo()),
            ("➡ 重做", lambda: self.editor.edit_redo()),
            ("|", None),
            ("表格", self._insert_table),
            ("链接", lambda: self._wrap("[", "](https://)", "链接文字")),
            ("图片", lambda: self._wrap("![", "](图片地址)", "图片说明")),
            ("分割线", self._insert_hr),
            ("|", None),
            ("📂 打开 MD", self.open_md),
            ("💾 保存 MD", self.save_md),
            ("✏ 文章信息", self.edit_meta),
            ("🔄 刷新预览", self.refresh_preview),
            ("🔁 打开预览", self.open_preview),
            ("📤 导出文章", self.export_article),
        ]
        for text, cmd in btns2:
            if text == "|":
                tk.Frame(row2, width=1, bg="#c9c9d4").pack(side=tk.LEFT, fill=tk.Y, padx=4, pady=2)
                continue
            btn = tk.Button(row2, text=text, command=cmd, relief=tk.FLAT, padx=10, pady=3,
                            bg="#ffffff", activebackground="#e6e6f0", cursor="hand2")
            if "导出" in text:
                btn.configure(bg="#FB7299", fg="white", activebackground="#e05a80", activeforeground="white")
            btn.pack(side=tk.LEFT, padx=2)

    def _build_body(self):
        self.editor = tk.Text(self.root, wrap=tk.WORD, undo=True, font=("Consolas", 12),
                              bg="#ffffff", fg="#1D1D1F", insertbackground="#FB7299",
                              selectbackground="#FB7299", selectforeground="white",
                              relief=tk.FLAT, padx=14, pady=12)
        scroll = ttk.Scrollbar(self.root, command=self.editor.yview)
        self.editor.configure(yscrollcommand=scroll.set)
        self.editor.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scroll.pack(side=tk.RIGHT, fill=tk.Y)

        self.editor.bind("<KeyRelease>", self._on_edit)
        self.editor.bind("<<Modified>>", self._on_modified)

    def _build_statusbar(self):
        self.status = tk.Label(self.root, text="", anchor="w", bg="#f0f0f5", fg="#515154",
                               padx=10, pady=3)
        self.status.pack(side=tk.BOTTOM, fill=tk.X)

    # ── 编辑操作 ──
    def _wrap(self, before: str, after: str, placeholder: str):
        ed = self.editor
        ed.focus_set()
        try:
            sel = ed.get("sel.first", "sel.last")
            has_sel = True
        except tk.TclError:
            sel, has_sel = "", False
        if has_sel:
            ed.insert("sel.first", before)
            ed.insert("sel.last", after)
            s = ed.index("sel.first")
            ed.tag_add("sel", s, f"{s}+{len(before) + len(sel) + len(after)}c")
        else:
            ed.insert("insert", before + placeholder + after)
            pos = ed.index("insert")
            ed.mark_set("insert", f"{pos}-{len(after)}c")

    def _toggle_line_prefix(self, prefix: str):
        ed = self.editor
        ed.focus_set()
        try:
            line_start = ed.index("sel.first linestart")
            line_end = ed.index("sel.last lineend")
            target = (line_start, line_end)
        except tk.TclError:
            target = (ed.index("insert linestart"), ed.index("insert lineend"))
        lines = ed.get(*target).split("\n")
        non_empty = [ln for ln in lines if ln.strip()]
        # 只有「存在非空行且全部已带前缀」才移除前缀；否则给缺失的行补前缀（已带的保留）
        if non_empty and all(ln.startswith(prefix) for ln in non_empty):
            lines = [ln[len(prefix):] if ln.startswith(prefix) else ln for ln in lines]
        else:
            lines = [prefix + ln if not ln.startswith(prefix) else ln for ln in lines]
        ed.delete(*target)
        ed.insert(target[0], "\n".join(lines))

    def _code_block(self):
        self.editor.focus_set()
        self.editor.insert("insert", "```language\n# 你的代码\n```")

    def _insert_table(self):
        self.editor.focus_set()
        self.editor.insert("insert", "\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n")

    def _insert_hr(self):
        self.editor.focus_set()
        self.editor.insert("insert", "\n---\n")

    def _on_edit(self, _e=None):
        self._refresh_status()
        self._schedule_preview()

    def _on_modified(self, _e=None):
        # 文本变化（键盘输入 / 按钮插入 / 粘贴 / 撤销重做）统一触发预览刷新
        if self.editor.edit_modified():
            self.editor.edit_modified(False)
            self._refresh_status()
            self._schedule_preview()

    # ── 预览（写文件，子进程轮询） ──
    def _schedule_preview(self):
        if self._updating:
            return
        self._updating = True
        self.root.after(1200, self._do_preview)

    def _do_preview(self):
        self._updating = False
        self._write_live()

    def _write_live(self, force: bool = False):
        """ 把最新完整模板 HTML 写入 live.html（纯磁盘写，不会阻塞 UI）。
        默认内容（markdown + 文章信息 + 模板）没变化就不重写；force=True 强制重写刷新 """
        try:
            raw = self.editor.get("1.0", "end-1c")
            md_title, body_md = extract_title(raw)
            meta = dict(self.meta)
            meta["title"] = md_title or meta.get("title", "")
            key = (raw + "\x00" + json.dumps(meta, ensure_ascii=False, sort_keys=True)
                   + "\x00" + str(self.template))
            if not force and getattr(self, "_last_key", None) == key:
                return
            self._last_key = key

            self._ver += 1
            body, toc = md_to_html(body_md)
            meta.setdefault("id", next_article_id())
            meta.setdefault("readTime", estimate_read_time(body_md))
            meta.setdefault("excerpt", "")
            html_str = build_article_html(meta, body, toc, self.template)
            # 注入 gen 标记 + base href（让模板相对资源按当前模板目录解析）
            base = self.template.parent.as_uri() + "/"
            html_str = html_str.replace(
                "</head>",
                f'<meta name="gen" content="{self._ver}"><base href="{base}"></head>', 1)
            PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
            LIVE_FILE.write_text(html_str, encoding="utf-8")
        except Exception:
            pass

    def _spawn_preview(self):
        try:
            self.preview_proc = subprocess.Popen(
                [sys.executable, str(Path(__file__).resolve()), "--preview"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
            )
        except Exception as e:
            self.preview_proc = None
            messagebox.showwarning("预览", f"无法启动 Chromium 预览窗口：{e}")

    def open_preview(self):
        if self.preview_proc is not None and self.preview_proc.poll() is None:
            messagebox.showinfo("预览", "预览窗口已在运行")
            return
        self._write_live()
        self._spawn_preview()

    def refresh_preview(self):
        """ 手动刷新预览：强制重写 live.html（gen+1），iframe 会自动重新加载 """
        self._write_live(force=True)
        self._refresh_status()

    def _stop_preview(self):
        if self.preview_proc is not None and self.preview_proc.poll() is None:
            try:
                self.preview_proc.terminate()
            except Exception:
                pass
            try:
                self.preview_proc.wait(timeout=3)
            except Exception:
                pass
        self.preview_proc = None

    def on_close(self):
        self._stop_preview()
        self.root.destroy()

    # ── 状态栏 ──
    def _refresh_status(self):
        text = self.editor.get("1.0", "end-1c")
        chars = len(text.replace("\n", ""))
        lines = int(self.editor.index("end-1c").split(".")[0])
        nid = next_article_id()
        self.status.config(
            text=f"  {chars} 字 · {lines} 行 · 预计阅读 {estimate_read_time(text)} 分钟"
                 f"    |    模板：{template_name_of(self.template)}"
                 f"    |    当前最大文章 id：{get_max_article_id()} → 导出后新文章 id：{nid}"
        )

    # ── 文件 ──
    def open_md(self):
        path = filedialog.askopenfilename(
            title="打开 Markdown", filetypes=[("Markdown", "*.md"), ("所有文件", "*.*")])
        if not path:
            return
        try:
            self.editor.delete("1.0", "end")
            self.editor.insert("1.0", Path(path).read_text(encoding="utf-8"))
            self.meta["title"] = Path(path).stem
            self._write_live(force=True)   # 打开文件后强制刷新预览
        except Exception as e:
            messagebox.showerror("打开失败", str(e))

    def save_md(self):
        path = filedialog.asksaveasfilename(
            title="保存 Markdown", defaultextension=".md",
            filetypes=[("Markdown", "*.md")], initialfile=f"{self.meta['title'] or '文章'}.md")
        if not path:
            return
        Path(path).write_text(self.editor.get("1.0", "end-1c"), encoding="utf-8")
        self._refresh_status()

    # ── 文章信息 ──
    def edit_meta(self):
        win = tk.Toplevel(self.root)
        win.title("文章信息")
        win.transient(self.root)
        win.grab_set()
        win.configure(bg="#f5f5f7")

        body = self.editor.get("1.0", "end-1c")
        md_title, _ = extract_title(body)
        vars_ = {}

        def field(row, label, initial, height=None):
            tk.Label(win, text=label, bg="#f5f5f7").grid(row=row, column=0, sticky="e", padx=8, pady=6)
            if height:
                v = tk.Text(win, height=height, width=52)
                v.insert("1.0", initial)
            else:
                v = tk.Entry(win, width=54)
                v.insert(0, initial)
            v.grid(row=row, column=1, padx=8, pady=6)
            return v

        vars_["title"] = field(0, "标题 *", self.meta["title"] or md_title or "")
        vars_["excerpt"] = field(1, "简介", self.meta["excerpt"], height=3)

        cat_var = tk.StringVar(value=self.meta["category"])
        tk.Label(win, text="分类 *", bg="#f5f5f7").grid(row=2, column=0, sticky="e", padx=8, pady=6)
        ttk.Combobox(win, textvariable=cat_var, values=DEFAULT_CATEGORIES, width=52).grid(row=2, column=1, padx=8, pady=6)

        date_var = tk.StringVar(value=self.meta["date"])
        tk.Label(win, text="日期", bg="#f5f5f7").grid(row=3, column=0, sticky="e", padx=8, pady=6)
        tk.Entry(win, textvariable=date_var, width=54).grid(row=3, column=1, padx=8, pady=6)

        tags_var = tk.StringVar(value=", ".join(self.meta["tags"]))
        tk.Label(win, text="标签", bg="#f5f5f7").grid(row=4, column=0, sticky="e", padx=8, pady=6)
        tk.Entry(win, textvariable=tags_var, width=54).grid(row=4, column=1, padx=8, pady=6)

        feat_var = tk.BooleanVar(value=self.meta["featured"])
        tk.Checkbutton(win, text="设为精选（featured）", variable=feat_var, bg="#f5f5f7").grid(
            row=5, column=1, sticky="w", padx=8, pady=4)

        # 模板选择（临时切换）
        tpl_list = scan_templates()
        tpl_names = [n for n, _ in tpl_list]
        tpl_var = tk.StringVar(value=template_name_of(self.template))
        tk.Label(win, text="模板", bg="#f5f5f7").grid(row=6, column=0, sticky="e", padx=8, pady=6)
        tpl_box = ttk.Combobox(win, textvariable=tpl_var, values=tpl_names, width=52)
        tpl_box.grid(row=6, column=1, padx=8, pady=6)
        tk.Label(win, text="（切换后预览立即用新模板渲染）", bg="#f5f5f7",
                 fg="#888", font=("", 8)).grid(row=7, column=1, sticky="w", padx=8)

        def ok():
            title = vars_["title"].get().strip()
            if not title:
                messagebox.showwarning("提示", "标题不能为空", parent=win)
                return
            excerpt = vars_["excerpt"].get("1.0", "end-1c").strip()
            if not excerpt:
                excerpt = plain_text(body)[:90] + ("…" if len(plain_text(body)) > 90 else "")
            # 应用模板切换
            for name, path in tpl_list:
                if name == tpl_var.get():
                    self.template = path
                    break
            self.meta.update({
                "title": title,
                "excerpt": excerpt,
                "category": cat_var.get().strip() or DEFAULT_CATEGORIES[0],
                "date": date_var.get().strip() or date.today().isoformat(),
                "tags": [t.strip() for t in tags_var.get().split(",") if t.strip()],
                "featured": feat_var.get(),
            })
            win.destroy()
            self._write_live(force=True)   # 模板/信息变了，强制刷新预览

        tk.Button(win, text="确定", command=ok, bg="#FB7299", fg="white",
                  activebackground="#e05a80", activeforeground="white",
                  relief=tk.FLAT, padx=24, pady=4).grid(row=6, column=1, sticky="w", padx=8, pady=10)

    # ── 导出 ──
    def export_article(self):
        raw = self.editor.get("1.0", "end-1c").strip()
        if not raw:
            messagebox.showwarning("提示", "正文是空的，先写点东西吧")
            return
        md_title, body_md = extract_title(raw)
        title = md_title or self.meta.get("title", "")
        if not title:
            self.edit_meta()
            if not self.meta.get("title"):
                return
        else:
            self.meta["title"] = title

        aid = next_article_id()
        cat = self.meta["category"]
        content_html, toc_html = md_to_html(body_md.strip())
        meta = dict(self.meta)
        meta.update({
            "id": aid,
            "fileName": f"{cat}/{aid}/",
            "readTime": estimate_read_time(body_md),
        })

        # 确认
        if not messagebox.askyesno(
                "确认导出",
                f"新文章 id：{aid}\n"
                f"标题：{meta['title']}\n"
                f"分类：{cat}\n"
                f"目标：blog/{cat}/{aid}/index.html\n"
                f"并将新条目写入 articles-data.js\n\n确定导出？"):
            return

        try:
            out_dir = ROOT / "blog" / cat / str(aid)
            out_dir.mkdir(parents=True, exist_ok=True)
            (out_dir / "index.html").write_text(
                build_article_html(meta, content_html, toc_html, self.template), encoding="utf-8")
            # 文章.md 存原始内容（含第一个 # 标题行），重新打开还能再提取标题
            (out_dir / "文章.md").write_text(raw + "\n", encoding="utf-8")
            update_articles_data(meta)
        except Exception as e:
            messagebox.showerror("导出失败", str(e))
            return

        messagebox.showinfo(
            "导出成功",
            f"✅ 已生成 blog/{cat}/{aid}/index.html\n"
            f"✅ 已更新 articles-data.js（新 id = {aid}）\n\n"
            f"本地预览：{out_dir.as_uri()}")
        self._refresh_status()


# ═════════════════════════ 入口 ═════════════════════════
def main():
    if "--preview" in sys.argv:
        return _preview_child_main()

    if "--selftest" in sys.argv:
        # ── 非 GUI 冒烟测试 ──
        print("== selftest ==")
        body, toc = md_to_html("## 测试标题\n\n**加粗** `代码` ==高亮==\n\n- 列表\n")
        assert "<h2" in body and "<strong>" in body and 'class="hl"' in body, "md 转换失败"
        assert "<ul>" in toc, "toc 生成失败"
        print("md_to_html OK")
        meta = {"id": 99, "category": "测试", "title": '标题"带引号"', "excerpt": "简介",
                "date": "2026-08-20", "tags": ["a", "b"], "readTime": 3, "featured": True,
                "fileName": "测试/99/"}
        out = build_article_html(meta, "<p>正文</p>", toc)
        assert "测试" in out and "标题&quot;带引号&quot;" in out and "class=\"article-content\"" in out
        assert "样板文章" not in out, "模板占位文字未替换干净"
        assert out.count("</html>") == 1
        print("build_article_html OK")
        print(f"当前最大 id：{get_max_article_id()}，下一篇：{next_article_id()}")
        print("selftest 全部通过")
        return 0

    root = tk.Tk()
    App(root, start_preview=("--no-preview" not in sys.argv))
    root.mainloop()
    return 0


if __name__ == "__main__":
    sys.exit(main())
