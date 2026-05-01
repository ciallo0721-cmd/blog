#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
ciallo0721-cmd 个人网站管理后台 API
本地运行，操作网站仓库文件

启动方式：
    python admin.py                    # 默认 127.0.0.1:5555
    python admin.py --port 8080        # 自定义端口
    python admin.py --host 0.0.0.0     # 允许外部访问

功能：
    - 文章 CRUD（增删改查）
    - 时间线管理
    - 站点统计
    - Git 操作（自动 commit + push）
    - 定时发布队列
    - GitHub Actions 触发
"""

import os
import sys
import json
import shutil
import hashlib
import subprocess
import argparse
import re
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from pathlib import Path

# ============================
# 配置
# ============================
REPO_ROOT = Path(__file__).parent.resolve()
ARTICLES_DATA = REPO_ROOT / "articles-data.js"
TIMELINE_DATA = REPO_ROOT / "timeline.js"
BLOG_DIR = REPO_ROOT / "blog"
DYNAMIC_DATA = REPO_ROOT / "dynamic-data.js"
SCHEDULE_FILE = REPO_ROOT / ".github" / "scheduled-articles.json"
STATUS_FILE = REPO_ROOT / "status.html"

# 管理员密码（SHA-256）
ADMIN_PWD_HASH = "c651e54a1f803cb67d9f4d7e0dc8613280988289585e8503a775241f3e73a10f"
# 对应明文密码（仅用于验证哈希时的参考）：guangeadmin123

GITHUB_REPO = "ciallo0721-cmd/ciallo0721-cmd.github.io"
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")

# CORS 允许的源
ALLOWED_ORIGINS = [
    "http://127.0.0.1:5555",
    "http://localhost:5555",
    "http://localhost:8080",
]

# 文章 HTML 模板
ARTICLE_TEMPLATE = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - ciallo0721-cmd的文章</title>
    <meta name="description" content="{excerpt}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="icon" href="../fanv.ico" type="image/x-icon">
    <script src="../articles-data.js"></script>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-TR4FT7JPDZ"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
      gtag('config', 'G-TR4FT7JPDZ');
    </script>
<style>
:root {{
    --primary: #3366ff;
    --primary-light: #5b8def;
    --bg: #f8f9fc;
    --card: #ffffff;
    --text: #1d1d1f;
    --text-sec: #515154;
    --border: #e5e5ea;
    --shadow: 0 2px 12px rgba(0,0,0,0.06);
    --radius: 12px;
}}
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.8;
}}
.container {{
    max-width: 780px;
    margin: 0 auto;
    padding: 40px 20px;
}}
.back-link {{
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--primary);
    text-decoration: none;
    font-size: 0.9rem;
    margin-bottom: 24px;
    transition: color 0.2s;
}}
.back-link:hover {{ color: var(--primary-light); }}
.article-header {{
    margin-bottom: 32px;
}}
.article-title {{
    font-size: 1.8rem;
    font-weight: 700;
    line-height: 1.4;
    margin-bottom: 16px;
    color: var(--text);
}}
.article-meta {{
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    color: var(--text-sec);
    font-size: 0.85rem;
}}
.article-meta i {{ color: var(--primary); margin-right: 4px; }}
.tag {{
    display: inline-block;
    background: rgba(51,102,255,0.08);
    color: var(--primary);
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 500;
}}
.article-body {{
    background: var(--card);
    border-radius: var(--radius);
    padding: 32px;
    box-shadow: var(--shadow);
    border: 1px solid var(--border);
}}
.article-body h2 {{
    font-size: 1.3rem;
    margin: 28px 0 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--primary);
    display: inline-block;
}}
.article-body h3 {{
    font-size: 1.1rem;
    margin: 20px 0 8px;
    color: var(--primary);
}}
.article-body p {{
    margin-bottom: 16px;
    text-indent: 2em;
}}
.article-body img {{
    max-width: 100%;
    border-radius: 8px;
    margin: 16px 0;
}}
.article-body a {{
    color: var(--primary);
    text-decoration: none;
    border-bottom: 1px dashed var(--primary);
}}
.article-body a:hover {{
    border-bottom-style: solid;
}}
.article-body blockquote {{
    border-left: 4px solid var(--primary);
    background: rgba(51,102,255,0.04);
    padding: 12px 16px;
    margin: 16px 0;
    border-radius: 0 8px 8px 0;
    color: var(--text-sec);
}}
.article-body code {{
    background: rgba(0,0,0,0.06);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.88em;
}}
.article-body ul, .article-body ol {{
    margin: 12px 0;
    padding-left: 2em;
}}
.article-body li {{
    margin-bottom: 6px;
}}
/* 相关文章 */
.related-section {{
    margin-top: 40px;
}}
.related-title {{
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--text);
}}
.related-grid {{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
}}
.related-card {{
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    text-decoration: none;
    color: var(--text);
    transition: all 0.2s;
}}
.related-card:hover {{
    border-color: var(--primary);
    box-shadow: 0 4px 16px rgba(51,102,255,0.12);
    transform: translateY(-2px);
}}
.related-card h4 {{
    font-size: 0.9rem;
    margin-bottom: 6px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}}
.related-card .rc-meta {{
    font-size: 0.78rem;
    color: var(--text-sec);
}}
/* 分享栏 */
.share-bar {{
    margin-top: 32px;
    display: flex;
    align-items: center;
    gap: 12px;
}}
.share-bar span {{ font-size: 0.85rem; color: var(--text-sec); }}
.share-btn {{
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px; height: 36px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--text-sec);
    text-decoration: none;
    transition: all 0.2s;
    font-size: 0.9rem;
}}
.share-btn:hover {{
    border-color: var(--primary);
    color: var(--primary);
    transform: translateY(-1px);
}}
@media (max-width: 640px) {{
    .container {{ padding: 20px 16px; }}
    .article-title {{ font-size: 1.4rem; }}
    .article-body {{ padding: 20px; }}
    .related-grid {{ grid-template-columns: 1fr; }}
}}
</style>
</head>
<body>
<div class="container">
    <a href="../index.html" class="back-link"><i class="fas fa-arrow-left"></i> 返回首页</a>
    <div class="article-header">
        <h1 class="article-title">{title}</h1>
        <div class="article-meta">
            <span><i class="fas fa-calendar"></i> {date}</span>
            <span><i class="fas fa-clock"></i> {read_time} 分钟</span>
            {tags_html}
        </div>
    </div>
    <div class="article-body">
{body_html}
    </div>
    <div id="relatedArticles" class="related-section"></div>
    <div class="share-bar">
        <span>分享：</span>
        <a class="share-btn" href="https://twitter.com/intent/tweet?text={title_encoded}&url={url_encoded}" target="_blank" rel="noopener"><i class="fab fa-twitter"></i></a>
        <a class="share-btn" href="https://www.facebook.com/sharer/sharer.php?u={url_encoded}" target="_blank" rel="noopener"><i class="fab fa-facebook"></i></a>
        <a class="share-btn" href="javascript:navigator.clipboard.writeText(location.href).then(()=>document.querySelector('.share-copy-tip')||0)"><i class="fas fa-link"></i></a>
    </div>
</div>
<script>
(function() {{
    try {{
        var aid = {article_id};
        var adj = window.articlesData;
        if (adj && adj.getFeaturedArticles) {{
            var related = adj.getFeaturedArticles(aid, 3);
            var el = document.getElementById('relatedArticles');
            if (el && related.length) {{
                var html = '<div class="related-title"><i class="fas fa-book-open" style="margin-right:6px;color:var(--primary)"></i>相关文章</div><div class="related-grid">';
                related.forEach(function(a) {{
                    html += '<a href="../blog/' + a.fileName + '" class="related-card"><h4>' + a.title + '</h4><div class="rc-meta">' + a.date + '</div></a>';
                }});
                html += '</div>';
                el.innerHTML = html;
            }}
        }}
    }} catch(e) {{}}
}})();
</script>
</body>
</html>'''


def sha256(text: str) -> str:
    """SHA-256 哈希"""
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def json_response(handler, data, status=200):
    """返回 JSON 响应"""
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
    handler.end_headers()
    handler.wfile.write(json.dumps(data, ensure_ascii=False, indent=2).encode('utf-8'))


def read_json_file(path: Path, default=None):
    """安全读取 JSON 文件"""
    try:
        if path.exists():
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
    except (json.JSONDecodeError, IOError):
        pass
    return default if default is not None else {}


def verify_auth(handler):
    """验证请求中的认证信息"""
    auth = handler.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:]
        if sha256(token) == ADMIN_PWD_HASH:
            return True
    return False


def verify_query_auth(handler):
    """验证 URL 参数中的 token"""
    qs = parse_qs(urlparse(handler.path).query)
    token = qs.get("token", [""])[0]
    return sha256(token) == ADMIN_PWD_HASH


# ============================
# 文章管理
# ============================

def parse_articles_js(content: str) -> dict:
    """解析 articles-data.js 文件，返回文章列表"""
    # 匹配 window.articlesData = { ... }
    match = re.search(r'window\.articlesData\s*=\s*(\{[\s\S]*\});?\s*$', content)
    if not match:
        return {"articles": []}
    
    raw = match.group(1)
    # 提取 articles 数组
    arr_match = re.search(r'articles:\s*\[(.*?)\]', raw, re.DOTALL)
    if not arr_match:
        return {"articles": []}
    
    arr_str = "[" + arr_match.group(1) + "]"
    try:
        articles = json.loads(arr_str)
        return {"articles": articles}
    except json.JSONDecodeError:
        return {"articles": []}


def rebuild_articles_js(articles: list) -> str:
    """重建 articles-data.js 内容"""
    lines = [
        "// articles-data.js - 文章数据源",
        "// 由 admin.py 管理，请勿手动修改",
        f"// 最后更新：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "window.articlesData = {",
        "    articles: [",
    ]
    
    for i, art in enumerate(articles):
        comma = "," if i < len(articles) - 1 else ""
        tags = json.dumps(art.get("tags", []), ensure_ascii=False)
        lines.append(f"        {{")
        lines.append(f'            id: {art["id"]},')
        lines.append(f'            title: {json.dumps(art.get("title", ""), ensure_ascii=False)},')
        lines.append(f'            excerpt: {json.dumps(art.get("excerpt", ""), ensure_ascii=False)},')
        lines.append(f'            date: {json.dumps(art.get("date", ""), ensure_ascii=False)},')
        lines.append(f'            tags: {tags},')
        lines.append(f'            fileName: {json.dumps(art.get("fileName", ""), ensure_ascii=False)},')
        lines.append(f'            readTime: {art.get("readTime", 5)},')
        featured = art.get("featured", True)
        lines.append(f'            featured: {str(featured).lower()}')
        lines.append(f"        }}{comma}")
    
    lines.extend([
        "    ],",
        "",
        "    getSortedArticles: function() {",
        "        return [...this.articles].sort((a, b) => new Date(b.date) - new Date(a.date));",
        "    },",
        "",
        "    getArticleById: function(id) {",
        "        return this.articles.find(article => article.id === id);",
        "    },",
        "",
        "    getAdjacentArticles: function(id) {",
        "        const sorted = this.getSortedArticles();",
        "        const index = sorted.findIndex(article => article.id === id);",
        "        return {",
        "            prev: index < sorted.length - 1 ? sorted[index + 1] : null,",
        "            next: index > 0 ? sorted[index - 1] : null",
        "        };",
        "    },",
        "",
        "    getFeaturedArticles: function(excludeId = null, limit = 3) {",
        "        let filtered = this.getSortedArticles();",
        "        if (excludeId) filtered = filtered.filter(article => article.id !== excludeId);",
        "        return filtered.slice(0, limit);",
        "    }",
        "};",
    ])
    
    return "\n".join(lines)


def get_next_article_id(articles: list) -> int:
    """获取下一个可用的文章 ID"""
    if not articles:
        return 1
    return max(a.get("id", 0) for a in articles) + 1


def create_article_html(article: dict) -> str:
    """生成文章 HTML 页面"""
    tags = article.get("tags", [])
    tags_html = " ".join(f'<span class="tag">{t}</span>' for t in tags)
    body = article.get("bodyHtml", article.get("content", "<p>（文章内容为空）</p>"))
    
    title_encoded = article.get("title", "").replace(" ", "%20")
    url_encoded = f"https://91vip.xn--32v.ink/blog/{article.get('fileName', '')}".replace(" ", "%20")
    
    return ARTICLE_TEMPLATE.format(
        title=article.get("title", "无标题"),
        excerpt=article.get("excerpt", ""),
        date=article.get("date", ""),
        read_time=article.get("readTime", 5),
        tags_html=tags_html,
        body_html=body,
        article_id=article.get("id", 0),
        title_encoded=title_encoded,
        url_encoded=url_encoded,
    )


# ============================
# 时间线管理
# ============================

def parse_timeline_js(content: str) -> list:
    """解析 timeline.js 文件"""
    arr_match = re.search(r'window\.timelineData\s*=\s*\[(.*?)\];', content, re.DOTALL)
    if not arr_match:
        return []
    
    arr_str = "[" + arr_match.group(1) + "]"
    try:
        return json.loads(arr_str)
    except json.JSONDecodeError:
        return []


def rebuild_timeline_js(items: list) -> str:
    """重建 timeline.js 内容"""
    lines = [
        "// timeline.js - 时间线数据源",
        "// 由 admin.py 管理，请勿手动修改",
        f"// 最后更新：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "window.timelineData = [",
    ]
    
    for i, item in enumerate(items):
        comma = "," if i < len(items) - 1 else ""
        lines.append("        {")
        lines.append(f'            date: {json.dumps(item.get("date", ""), ensure_ascii=False)},')
        lines.append(f'            title: {json.dumps(item.get("title", ""), ensure_ascii=False)},')
        lines.append(f'            desc: {json.dumps(item.get("desc", ""), ensure_ascii=False)}')
        lines.append(f"        }}{comma}")
    
    lines.append("        ];")
    
    # 保留渲染函数
    lines.extend([
        "",
        "        function escapeHtml(str) {",
        '            var d = document.createElement("div");',
        "            d.textContent = String(str);",
        "            return d.innerHTML;",
        "        }",
        "        function renderTimeline() {",
        '            var list = document.getElementById("timelineList");',
        "            if (!list || !window.timelineData) return;",
        "            list.innerHTML = window.timelineData.map(function(item, i) {",
        "                var safeDate  = escapeHtml(item.date  || '');",
        "                var safeTitle = escapeHtml(item.title || '');",
        "                var safeDesc  = item.desc ? escapeHtml(item.desc) : '';",
        "                return '<div class=\"timeline-item\" style=\"animation-delay:' + (i * 0.08) + 's\">'",
        "                    + '<div class=\"timeline-date\"><i class=\"fas fa-calendar-alt\" style=\"margin-right:6px;\"></i>' + safeDate + '</div>'",
        "                    + '<div class=\"timeline-content\">'",
        "                    + '<div class=\"timeline-title\">' + safeTitle + '</div>'",
        "                    + (safeDesc ? '<p class=\"timeline-desc\">' + safeDesc + '</p>' : '')",
        "                    + '</div></div>';",
        "            }).join('');",
        "        }",
        "        document.addEventListener('DOMContentLoaded', renderTimeline);",
    ])
    
    return "\n".join(lines)


# ============================
# Git 操作
# ============================

def git_commit_push(message: str, files: list = None):
    """执行 git add + commit + push"""
    try:
        subprocess.run(["git", "add"] + (files or ["-A"]), cwd=REPO_ROOT, 
                      capture_output=True, text=True, check=True)
        subprocess.run(["git", "commit", "-m", message], cwd=REPO_ROOT,
                      capture_output=True, text=True, check=False)
        subprocess.run(["git", "push"], cwd=REPO_ROOT,
                      capture_output=True, text=True, check=False)
        return True, "提交成功"
    except Exception as e:
        return False, str(e)


def git_status():
    """获取 git 状态"""
    try:
        result = subprocess.run(["git", "status", "--porcelain"], cwd=REPO_ROOT,
                              capture_output=True, text=True)
        changed = [line.strip() for line in result.stdout.strip().split('\n') if line.strip()]
        
        result2 = subprocess.run(["git", "log", "-1", "--format=%h %s"], cwd=REPO_ROOT,
                                capture_output=True, text=True)
        last_commit = result2.stdout.strip()
        
        result3 = subprocess.run(["git", "rev-list", "--count", "HEAD"], cwd=REPO_ROOT,
                                capture_output=True, text=True)
        total_commits = result3.stdout.strip()
        
        result4 = subprocess.run(["git", "branch", "--show-current"], cwd=REPO_ROOT,
                                capture_output=True, text=True)
        branch = result4.stdout.strip()
        
        return {
            "branch": branch,
            "lastCommit": last_commit,
            "totalCommits": total_commits,
            "changedFiles": len(changed),
            "changedList": changed[:20]
        }
    except Exception as e:
        return {"error": str(e)}


# ============================
# 定时发布
# ============================

def load_schedule() -> list:
    """加载定时发布队列"""
    return read_json_file(SCHEDULE_FILE, [])


def save_schedule(queue: list):
    """保存定时发布队列"""
    SCHEDULE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(SCHEDULE_FILE, 'w', encoding='utf-8') as f:
        json.dump(queue, f, ensure_ascii=False, indent=2)


def check_schedule():
    """检查并执行到期的定时发布"""
    now = datetime.now()
    queue = load_schedule()
    published = []
    remaining = []
    
    for item in queue:
        pub_time = datetime.strptime(item["publishAt"], "%Y-%m-%d %H:%M")
        if now >= pub_time:
            # 执行发布
            success, msg = publish_scheduled_article(item)
            published.append({"id": item.get("id"), "title": item.get("title"), "success": success, "msg": msg})
        else:
            remaining.append(item)
    
    if published:
        save_schedule(remaining)
        if remaining != queue:
            git_commit_push("🤖 自动发布定时文章")
    
    return published, remaining


def publish_scheduled_article(item: dict):
    """发布一篇定时文章"""
    try:
        content = ARTICLES_DATA.read_text(encoding='utf-8')
        data = parse_articles_js(content)
        articles = data.get("articles", [])
        
        # 检查是否已存在
        for a in articles:
            if a.get("id") == item.get("id"):
                return False, f"文章 ID {item['id']} 已存在"
        
        # 添加文章
        articles.append({
            "id": item["id"],
            "title": item["title"],
            "excerpt": item.get("excerpt", ""),
            "date": item.get("date", datetime.now().strftime("%Y-%m-%d")),
            "tags": item.get("tags", []),
            "fileName": f"{item['id']}/",
            "readTime": item.get("readTime", 5),
            "featured": item.get("featured", True),
        })
        
        # 写入 articles-data.js
        new_content = rebuild_articles_js(articles)
        ARTICLES_DATA.write_text(new_content, encoding='utf-8')
        
        # 创建文章 HTML
        art_dir = BLOG_DIR / str(item["id"])
        art_dir.mkdir(parents=True, exist_ok=True)
        html = create_article_html({
            **item,
            "fileName": f"{item['id']}/",
        })
        (art_dir / "index.html").write_text(html, encoding='utf-8')
        
        # 添加时间线
        tl_content = TIMELINE_DATA.read_text(encoding='utf-8')
        timeline = parse_timeline_js(tl_content)
        now_str = datetime.now().strftime("%Y年%m月%d日")
        timeline.insert(0, {
            "date": now_str,
            "title": f"自动发布 · {item['title']}",
            "desc": f"定时文章《{item['title']}》已自动发布！"
        })
        TIMELINE_DATA.write_text(rebuild_timeline_js(timeline), encoding='utf-8')
        
        return True, "发布成功"
    except Exception as e:
        return False, str(e)


# ============================
# 请求处理
# ============================

class AdminHandler(BaseHTTPRequestHandler):
    
    def log_message(self, format, *args):
        """简化日志输出"""
        ts = datetime.now().strftime("%H:%M:%S")
        print(f"[{ts}] {args[0]}")
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
    
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')
        
        routes = {
            "/api/status": self.api_status,
            "/api/articles": self.api_get_articles,
            "/api/timeline": self.api_get_timeline,
            "/api/git": self.api_git_status,
            "/api/schedule": self.api_get_schedule,
            "/api/site-stats": self.api_site_stats,
            "/api/preview-article": self.api_preview_article,
        }
        
        handler = routes.get(path)
        if handler:
            handler(parsed)
        elif path == "/" or path == "/admin":
            self.serve_admin_html()
        else:
            self.send_error(404, "Not Found")
    
    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')
        
        if not verify_auth(self):
            json_response(self, {"error": "未授权"}, 401)
            return
        
        routes = {
            "/api/login": self.api_login,
            "/api/articles": self.api_create_article,
            "/api/timeline": self.api_add_timeline,
            "/api/schedule": self.api_add_schedule,
            "/api/git/push": self.api_git_push,
            "/api/git/actions-trigger": self.api_trigger_actions,
        }
        
        handler = routes.get(path)
        if handler:
            handler(parsed)
        else:
            self.send_error(404, "Not Found")
    
    def do_PUT(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')
        
        if not verify_auth(self):
            json_response(self, {"error": "未授权"}, 401)
            return
        
        routes = {
            "/api/articles": self.api_update_article,
        }
        
        handler = routes.get(path)
        if handler:
            handler(parsed)
        else:
            self.send_error(404, "Not Found")
    
    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')
        
        if not verify_auth(self):
            json_response(self, {"error": "未授权"}, 401)
            return
        
        if path.startswith("/api/articles/"):
            art_id = path.split("/")[-1]
            self.api_delete_article(art_id)
        elif path.startswith("/api/timeline/"):
            idx = path.split("/")[-1]
            self.api_delete_timeline(idx)
        else:
            self.send_error(404, "Not Found")
    
    # ========== API 实现 ==========
    
    def api_status(self, parsed):
        """API 状态检查"""
        json_response(self, {
            "status": "online",
            "version": "2.0.0",
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "repo": str(REPO_ROOT),
            "python": sys.version.split()[0],
        })
    
    def api_login(self, parsed):
        """登录验证"""
        body = self.read_body()
        pwd = body.get("password", "")
        if sha256(pwd) == ADMIN_PWD_HASH:
            json_response(self, {"success": True, "token": pwd})
        else:
            json_response(self, {"success": False, "error": "密码错误"}, 403)
    
    def api_get_articles(self, parsed):
        """获取文章列表"""
        content = ARTICLES_DATA.read_text(encoding='utf-8')
        data = parse_articles_js(content)
        articles = data.get("articles", [])
        
        # 按日期降序排序
        articles.sort(key=lambda a: a.get("date", ""), reverse=True)
        
        json_response(self, {
            "articles": articles,
            "total": len(articles),
        })
    
    def api_create_article(self, parsed):
        """创建新文章"""
        body = self.read_body()
        
        content = ARTICLES_DATA.read_text(encoding='utf-8')
        data = parse_articles_js(content)
        articles = data.get("articles", [])
        
        # 获取或自动生成 ID
        if body.get("id"):
            new_id = body["id"]
        else:
            new_id = get_next_article_id(articles)
        
        article = {
            "id": new_id,
            "title": body.get("title", "无标题"),
            "excerpt": body.get("excerpt", ""),
            "date": body.get("date", datetime.now().strftime("%Y-%m-%d")),
            "tags": body.get("tags", []),
            "fileName": f"{new_id}/",
            "readTime": body.get("readTime", 5),
            "featured": body.get("featured", True),
        }
        
        articles.append(article)
        ARTICLES_DATA.write_text(rebuild_articles_js(articles), encoding='utf-8')
        
        # 创建 HTML 文件
        art_dir = BLOG_DIR / str(new_id)
        art_dir.mkdir(parents=True, exist_ok=True)
        
        html_body = body.get("bodyHtml", body.get("content", "<p>（文章内容为空）</p>"))
        html = create_article_html({**article, "bodyHtml": html_body})
        (art_dir / "index.html").write_text(html, encoding='utf-8')
        
        json_response(self, {"success": True, "article": article})
    
    def api_update_article(self, parsed):
        """更新文章"""
        body = self.read_body()
        art_id = body.get("id")
        if not art_id:
            json_response(self, {"error": "缺少文章 ID"}, 400)
            return
        
        content = ARTICLES_DATA.read_text(encoding='utf-8')
        data = parse_articles_js(content)
        articles = data.get("articles", [])
        
        found = False
        for i, a in enumerate(articles):
            if a.get("id") == art_id:
                # 更新字段
                for key in ["title", "excerpt", "date", "tags", "readTime", "featured"]:
                    if key in body:
                        a[key] = body[key]
                found = True
                break
        
        if not found:
            json_response(self, {"error": f"文章 ID {art_id} 不存在"}, 404)
            return
        
        ARTICLES_DATA.write_text(rebuild_articles_js(articles), encoding='utf-8')
        
        # 如果有 bodyHtml，更新 HTML 文件
        if body.get("bodyHtml"):
            art_dir = BLOG_DIR / str(art_id)
            target = articles[[a["id"] for a in articles].index(art_id)]
            html = create_article_html({**target, "bodyHtml": body["bodyHtml"]})
            art_dir.mkdir(parents=True, exist_ok=True)
            (art_dir / "index.html").write_text(html, encoding='utf-8')
        
        json_response(self, {"success": True})
    
    def api_delete_article(self, art_id):
        """删除文章"""
        try:
            art_id = int(art_id)
        except ValueError:
            json_response(self, {"error": "无效的文章 ID"}, 400)
            return
        
        content = ARTICLES_DATA.read_text(encoding='utf-8')
        data = parse_articles_js(content)
        articles = data.get("articles", [])
        
        new_articles = [a for a in articles if a.get("id") != art_id]
        if len(new_articles) == len(articles):
            json_response(self, {"error": f"文章 ID {art_id} 不存在"}, 404)
            return
        
        ARTICLES_DATA.write_text(rebuild_articles_js(new_articles), encoding='utf-8')
        
        # 删除 HTML 目录
        art_dir = BLOG_DIR / str(art_id)
        if art_dir.exists():
            shutil.rmtree(art_dir)
        
        json_response(self, {"success": True, "deleted": art_id})
    
    def api_get_timeline(self, parsed):
        """获取时间线"""
        content = TIMELINE_DATA.read_text(encoding='utf-8')
        items = parse_timeline_js(content)
        json_response(self, {"timeline": items, "total": len(items)})
    
    def api_add_timeline(self, parsed):
        """添加时间线条目"""
        body = self.read_body()
        
        content = TIMELINE_DATA.read_text(encoding='utf-8')
        items = parse_timeline_js(content)
        
        items.insert(0, {
            "date": body.get("date", datetime.now().strftime("%Y年%m月%d日")),
            "title": body.get("title", ""),
            "desc": body.get("desc", ""),
        })
        
        TIMELINE_DATA.write_text(rebuild_timeline_js(items), encoding='utf-8')
        json_response(self, {"success": True, "total": len(items)})
    
    def api_delete_timeline(self, idx):
        """删除时间线条目"""
        try:
            idx = int(idx)
        except ValueError:
            json_response(self, {"error": "无效的索引"}, 400)
            return
        
        content = TIMELINE_DATA.read_text(encoding='utf-8')
        items = parse_timeline_js(content)
        
        if 0 <= idx < len(items):
            items.pop(idx)
            TIMELINE_DATA.write_text(rebuild_timeline_js(items), encoding='utf-8')
            json_response(self, {"success": True})
        else:
            json_response(self, {"error": "索引越界"}, 400)
    
    def api_git_status(self, parsed):
        """Git 状态"""
        status = git_status()
        json_response(self, status)
    
    def api_git_push(self, parsed):
        """Git 提交并推送"""
        body = self.read_body()
        message = body.get("message", "管理员手动更新")
        files = body.get("files")
        success, msg = git_commit_push(message, files)
        json_response(self, {"success": success, "message": msg})
    
    def api_trigger_actions(self, parsed):
        """触发 GitHub Actions 工作流"""
        body = self.read_body()
        workflow = body.get("workflow", "dynamic-update.yml")
        
        if not GITHUB_TOKEN:
            json_response(self, {
                "success": False, 
                "error": "未设置 GITHUB_TOKEN 环境变量",
                "hint": "设置方法: set GITHUB_TOKEN=ghp_xxxx && python admin.py"
            }, 400)
            return
        
        import urllib.request
        url = f"https://api.github.com/repos/{GITHUB_REPO}/actions/workflows/{workflow}/dispatches"
        data = json.dumps({"ref": "main"}).encode('utf-8')
        req = urllib.request.Request(url, data=data, method='POST')
        req.add_header("Authorization", f"Bearer {GITHUB_TOKEN}")
        req.add_header("Accept", "application/vnd.github.v3+json")
        req.add_header("Content-Type", "application/json")
        
        try:
            urllib.request.urlopen(req)
            json_response(self, {"success": True, "message": f"已触发 {workflow}"})
        except urllib.error.HTTPError as e:
            json_response(self, {"success": False, "error": f"HTTP {e.code}: {e.reason}"}, e.code)
    
    def api_get_schedule(self, parsed):
        """获取定时发布队列"""
        published, remaining = check_schedule()
        json_response(self, {
            "queue": remaining,
            "justPublished": published,
            "total": len(remaining),
        })
    
    def api_add_schedule(self, parsed):
        """添加定时发布任务"""
        body = self.read_body()
        
        queue = load_schedule()
        
        # 自动生成 ID
        content = ARTICLES_DATA.read_text(encoding='utf-8')
        data = parse_articles_js(content)
        articles = data.get("articles", [])
        new_id = body.get("id", get_next_article_id(articles))
        
        item = {
            "id": new_id,
            "title": body.get("title", "无标题"),
            "excerpt": body.get("excerpt", ""),
            "date": body.get("date", datetime.now().strftime("%Y-%m-%d")),
            "tags": body.get("tags", []),
            "readTime": body.get("readTime", 5),
            "featured": body.get("featured", True),
            "bodyHtml": body.get("bodyHtml", "<p>（内容为空）</p>"),
            "publishAt": body.get("publishAt", ""),
            "createdAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }
        
        queue.append(item)
        save_schedule(queue)
        
        json_response(self, {"success": True, "item": item, "total": len(queue)})
    
    def api_site_stats(self, parsed):
        """站点统计"""
        content = ARTICLES_DATA.read_text(encoding='utf-8')
        data = parse_articles_js(content)
        articles = data.get("articles", [])
        
        # 统计博客目录
        blog_count = 0
        if BLOG_DIR.exists():
            blog_count = len([d for d in BLOG_DIR.iterdir() if d.is_dir() and (d / "index.html").exists()])
        
        # 读取 dynamic-data
        dynamic = {}
        if DYNAMIC_DATA.exists():
            match = re.search(r'window\.dynamicData\s*=\s*(\{[\s\S]*?\});', DYNAMIC_DATA.read_text(encoding='utf-8'))
            if match:
                try:
                    dynamic = json.loads(match.group(1))
                except:
                    pass
        
        json_response(self, {
            "articles": len(articles),
            "blogPages": blog_count,
            "schedule": len(load_schedule()),
            "git": git_status(),
            "dynamic": dynamic,
        })
    
    def api_preview_article(self, parsed):
        """预览文章 HTML"""
        qs = parse_qs(parsed.query)
        title = qs.get("title", ["无标题"])[0]
        excerpt = qs.get("excerpt", [""])[0]
        body_html = qs.get("body", ["<p>预览内容</p>"])[0]
        tags = qs.get("tags", ["标签"])[0].split(",")
        date = qs.get("date", [datetime.now().strftime("%Y-%m-%d")])[0]
        read_time = int(qs.get("readTime", ["5"])[0])
        
        html = ARTICLE_TEMPLATE.format(
            title=title,
            excerpt=excerpt,
            date=date,
            read_time=read_time,
            tags_html=" ".join(f'<span class="tag">{t}</span>' for t in tags),
            body_html=body_html,
            article_id=0,
            title_encoded=title.replace(" ", "%20"),
            url_encoded="preview",
        )
        
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(html.encode('utf-8'))
    
    # ========== 工具 ==========
    
    def read_body(self) -> dict:
        """读取请求体 JSON"""
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode('utf-8'))
        except json.JSONDecodeError:
            return {}
    
    def serve_admin_html(self):
        """提供管理后台 HTML"""
        admin_html = REPO_ROOT / "admin" / "index.html"
        if admin_html.exists():
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(admin_html.read_bytes())
        else:
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"<h1>Admin panel not found at admin/index.html</h1><p>Run admin.py to set up.</p>")


# ============================
# 启动入口
# ============================

def main():
    parser = argparse.ArgumentParser(description="ciallo0721-cmd 网站管理后台")
    parser.add_argument("--host", default="127.0.0.1", help="监听地址")
    parser.add_argument("--port", type=int, default=5555, help="监听端口")
    parser.add_argument("--check-schedule", action="store_true", help="仅检查定时发布队列")
    args = parser.parse_args()
    
    # 仅检查定时
    if args.check_schedule:
        published, remaining = check_schedule()
        if published:
            print(f"已发布 {len(published)} 篇文章:")
            for p in published:
                status = "成功" if p["success"] else f"失败: {p['msg']}"
                print(f"  - [{status}] {p.get('title', 'N/A')}")
        else:
            print("没有需要发布的定时文章")
        print(f"剩余定时队列: {len(remaining)} 篇")
        return
    
    server = HTTPServer((args.host, args.port), AdminHandler)
    
    print(f"""
╔══════════════════════════════════════════════╗
║     ciallo0721-cmd 管理后台 API v2.0         ║
╠══════════════════════════════════════════════╣
║  地址: http://{args.host}:{args.port}               ║
║  仓库: {REPO_ROOT}  ║
║  API:  http://{args.host}:{args.port}/api/status      ║
╚══════════════════════════════════════════════╝
    """)
    
    # 启动时检查一次定时
    published, remaining = check_schedule()
    if published:
        print(f"[定时发布] 已发布 {len(published)} 篇文章")
    if remaining:
        print(f"[定时发布] 队列中还有 {len(remaining)} 篇待发布")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
        server.server_close()


if __name__ == "__main__":
    main()
