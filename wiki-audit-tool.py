# wiki-audit-tool.py — 文章百科词条审核工具
# 功能：扫描所有文章内容，识别可能链接到百科词条的关键词并生成审核报告
# 使用：python wiki-audit-tool.py [--full] [--output report.md]
#
# 团队分工：
#   - 内容审核组：运行此工具扫描文章，标记可链接的关键词 → 输出审核报告
#   - 百科编写组：根据报告在 wiki-data.js 中新增/完善词条
#   - 测试修复组：验证链接跳转和渲染效果

import os
import re
import json
from collections import defaultdict

# ====== 配置 ======
PROJECT_ROOT = r"G:\EmoScan Pro\ciallo0721-cmd.github.io"
BLOG_DIR = os.path.join(PROJECT_ROOT, "blog")
WIKI_DATA_JS = os.path.join(PROJECT_ROOT, "wiki-data.js")
OUTPUT_DEFAULT = os.path.join(PROJECT_ROOT, "wiki-audit-report.md")

# ====== 加载现有百科数据 ======
def load_wiki_terms():
    """从 wiki-data.js 中提取已注册的词条名称列表"""
    if not os.path.exists(WIKI_DATA_JS):
        print("[WARN] wiki-data.js not found, using empty term list")
        return {}

    with open(WIKI_DATA_JS, 'r', encoding='utf-8') as f:
        content = f.read()

    # 提取 terms 对象中的所有 name 字段
    terms = {}
    # 匹配 name: "xxx" 和 id: "xxx"
    name_pattern = re.compile(r'^\s+name:\s*"([^"]+)"', re.MULTILINE)
    id_pattern = re.compile(r'^\s+id:\s*"([^"]+)"', re.MULTILINE)
    alias_pattern = re.compile(r'^\s+aliases:\s*\[([^\]]+)\]', re.MULTILINE)

    names = name_pattern.findall(content)
    ids = id_pattern.findall(content)

    # 提取别名
    all_aliases = []
    for match in alias_pattern.findall(content):
        aliases = re.findall(r'"([^"]+)"', match)
        all_aliases.extend(aliases)

    # 构建 name -> id 映射
    for i in range(min(len(ids), len(names))):
        terms[names[i]] = ids[i]

    # 也加别名
    print(f"Loaded {len(terms)} wiki terms, {len(all_aliases)} aliases")
    return terms

# ====== 扫描文章 ======
def scan_articles(wiki_terms):
    """
    扫描所有文章，对每篇文章统计可链接到百科的词条候选。
    返回: { article_id: { title, path, matches: [ {keyword, count, context} ] } }
    """
    results = {}

    for root, dirs, files in os.walk(BLOG_DIR):
        for f in files:
            if f != 'index.html':
                continue

            filepath = os.path.join(root, f)
            rel_path = os.path.relpath(filepath, PROJECT_ROOT)

            # 跳过非文章页面（如 blog/index.html）
            if rel_path == os.path.join("blog", "index.html"):
                continue
            if "muban" in rel_path:
                continue
            if "pdf-1" in rel_path:
                continue

            with open(filepath, 'r', encoding='utf-8') as fh:
                content = fh.read()

            # 提取文章 ID 和标题
            article_id = os.path.basename(os.path.dirname(filepath))
            title_match = re.search(r'<title>(.*?)(?:\s*-\s*ciallo0721-cmd)?</title>', content)
            title = title_match.group(1).strip() if title_match else f"文章 #{article_id}"

            # 提取文章内容区域
            content_match = re.search(
                r'<div[^>]*class="article-content"[^>]*>(.*?)</div>\s*<!--\s*文章内容结束',
                content, re.DOTALL
            )
            if not content_match:
                # 尝试其他可能的结束标记
                content_match = re.search(
                    r'<div[^>]*class="article-content"[^>]*>(.*?)</div>\s*(?:<|$)',
                    content, re.DOTALL
                )

            if not content_match:
                continue

            article_html = content_match.group(1)

            # 去掉 HTML 标签，只保留纯文本
            text = re.sub(r'<[^>]+>', ' ', article_html)
            text = re.sub(r'\s+', ' ', text).strip()

            if len(text) < 50:
                continue

            # ---- 扫描百科词条匹配 ----
            matches = []
            for term_name, term_id in wiki_terms.items():
                if len(term_name) < 2:
                    continue
                count = text.count(term_name)
                if count > 0:
                    # 提取上下文
                    ctx_start = max(0, text.index(term_name) - 20)
                    ctx_end = min(len(text), text.index(term_name) + len(term_name) + 20)
                    context = text[ctx_start:ctx_end].strip()
                    matches.append({
                        'keyword': term_name,
                        'term_id': term_id,
                        'count': count,
                        'context': context
                    })

            # ---- 扫描新词建议 ----
            # 统计出现超过3次的中文/英文词组，长度 2-10 字
            # 这个方法只做简单的频率统计，不保证准确性
            word_candidates = defaultdict(int)

            # 英文词（2-20 字母）
            for m in re.finditer(r'\b[A-Za-z][A-Za-z0-9+#.-]{1,19}\b', text):
                word = m.group()
                # 过滤常见停用词
                if word.lower() in ['the', 'this', 'that', 'with', 'from', 'html', 'css', 'js',
                                    'div', 'span', 'class', 'none', 'null', 'true', 'false',
                                    'var', 'let', 'const', 'function', 'return', 'width', 'height']:
                    continue
                # 检查是否已存在于百科
                if word not in wiki_terms:
                    word_candidates[word] += 1

            # 中文词（2-8 字）
            for m in re.finditer(r'[\u4e00-\u9fff]{2,8}', text):
                word = m.group()
                # 过滤常见非术语中文
                if word in ['但是', '然后', '因为', '所以', '可以', '如果', '没有', '一个',
                            '这个', '那个', '这些', '那些', '什么', '怎么', '如何', '我们',
                            '他们', '你们', '自己', '时候', '之间', '之后', '之前', '而且',
                            '或者', '还是', '不是', '就是', '只是', '但是', '虽然', '不过',
                            '应该', '可能', '已经', '还有', '以及', '一些', '通过', '进行',
                            '需要', '使用', '包括', '提供', '表示', '出现', '处理', '实现',
                            '开发', '支持', '创建', '设置', '获取', '执行', '完成', '关于']:
                    continue
                # 检查是否已存在于百科
                if word not in wiki_terms:
                    word_candidates[word] += 1

            # 过滤低频词
            new_candidates = {w: c for w, c in word_candidates.items()
                              if c >= 3 and len(w) >= 2}

            results[article_id] = {
                'title': title,
                'path': rel_path,
                'matches': matches,
                'new_candidates': new_candidates,
                'text_len': len(text)
            }

    return results

# ====== 生成报告 ======
def generate_report(results, output_path):
    total_articles = len(results)
    total_matches = sum(len(r['matches']) for r in results.values())
    total_new_candidates = sum(len(r['new_candidates']) for r in results.values())

    # 收集所有匹配的词条及出现次数
    all_term_stats = defaultdict(int)
    all_term_articles = defaultdict(set)
    for aid, data in results.items():
        for m in data['matches']:
            all_term_stats[m['keyword']] += m['count']
            all_term_articles[m['keyword']].add(aid)

    # 收集所有新词建议及出现次数
    all_new_candidates = defaultdict(int)
    for aid, data in results.items():
        for word, count in data['new_candidates'].items():
            all_new_candidates[word] += count

    lines = []
    lines.append("# 📖 百科词条审核报告")
    lines.append(f"")
    lines.append(f"**生成时间**: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append(f"**扫描范围**: {total_articles} 篇文章")
    lines.append(f"**已有匹配**: {total_matches} 处（涉及 {len(all_term_stats)} 个词条）")
    lines.append(f"**新词建议**: {total_new_candidates} 个候选")
    lines.append(f"")
    lines.append("---")
    lines.append("")

    # ====== 1. 已有词条匹配情况 ======
    lines.append("## 📋 一、已有百科词条匹配情况")
    lines.append("")
    lines.append("| 词条 | 出现次数 | 涉及文章数 | 涉及文章 |")
    lines.append("|------|---------|-----------|---------|")
    sorted_terms = sorted(all_term_stats.items(), key=lambda x: -x[1])
    for keyword, count in sorted_terms:
        article_titles = []
        for aid in all_term_articles[keyword]:
            if aid in results:
                article_titles.append(f"#{aid} {results[aid]['title'][:20]}")
        lines.append(f"| {keyword} | {count} | {len(all_term_articles[keyword])} | {'; '.join(article_titles[:5])} |")
    lines.append("")

    # ====== 2. 无匹配文章的词条（未引用） ======
    all_terms = load_wiki_terms()
    used_terms = set(all_term_stats.keys())
    unused_terms = [t for t in all_terms if t not in used_terms]
    if unused_terms:
        lines.append("## ⚠️ 二、未在文章中被引用的词条")
        lines.append("")
        lines.append("以下词条已存在于百科但未被任何文章引用：")
        for t in unused_terms:
            lines.append(f"- **{t}** (ID: {all_terms[t]})")
        lines.append("")

    # ====== 3. 新词建议 ======
    lines.append("## 💡 三、建议新增的百科词条")
    lines.append("")
    lines.append("以下候选词在文章中出现频率较高（≥3次），建议考虑加入百科：")
    lines.append("")
    lines.append("| 候选词 | 出现总次数 | 涉及文章数 | 建议分类 |")
    lines.append("|--------|-----------|-----------|---------|")
    sorted_new = sorted(all_new_candidates.items(), key=lambda x: -x[1])
    for word, count in sorted_new[:50]:  # 最多显示50个
        # 统计涉及文章数
        article_count = sum(1 for r in results.values() if word in r['new_candidates'])
        # 建议分类（根据常见关键词判断）
        suggested_cat = suggest_category(word)
        lines.append(f"| {word} | {count} | {article_count} | {suggested_cat} |")
    lines.append("")
    lines.append("> **说明**: 以上候选词为自动扫描生成，可能存在误报（如常见用语），需人工审核确认。")
    lines.append("")

    # ====== 4. 逐文章详情 ======
    lines.append("## 📄 四、逐文章详情")
    lines.append("")
    for aid in sorted(results.keys(), key=lambda x: int(x) if x.isdigit() else 9999):
        data = results[aid]
        lines.append(f"### 文章 #{aid}: {data['title']}")
        lines.append(f"- **路径**: {data['path']}")
        lines.append(f"- **字数**: {data['text_len']}")
        lines.append("")

        if data['matches']:
            lines.append("**已有词条匹配:**")
            for m in data['matches']:
                lines.append(f"- **{m['keyword']}** (×{m['count']}) …{m['context']}…")
        else:
            lines.append("**已有词条匹配:** 无")

        if data['new_candidates']:
            lines.append("")
            lines.append("**建议新增:** " + ", ".join(sorted(data['new_candidates'].keys(), key=lambda x: -data['new_candidates'][x])[:10]))
        lines.append("")
        lines.append("---")
        lines.append("")

    # 写入文件
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    print(f"\n[OK] Report generated: {output_path}")
    print(f"    Articles: {total_articles}")
    print(f"    Matches: {total_matches}")
    print(f"    Candidates: {total_new_candidates}")
    return output_path


def suggest_category(word):
    """根据关键词内容建议分类"""
    tech_keywords = ['python', 'git', 'api', 'js', 'html', 'css', 'sql', 'npm', 'node',
                     'docker', 'linux', 'windows', 'android', 'ios', 'web', 'app', 'server',
                     'data', 'ai', 'ml', 'ocr', 'sdk', 'ide', 'url', 'http', 'json', 'xml',
                     '框架', '引擎', '语言', '工具', '库', '系统', '网络', '数据', '编程',
                     '脚本', '接口', '部署', '配置', '渲染', '编译']
    culture_keywords = ['vtb', 'vtuber', '虚拟', '偶像', '二次元', '动漫', '番剧',
                        '角色', '萌', '宅', '同人', 'cos', '声优', '歌姬', '画师',
                        '手办', '周边', '直播', '弹幕']
    tool_keywords = ['utau', 'vocaloid', 'renpy', 'unity', 'blender', 'photoshop',
                     'vscode', 'github', 'tesseract', 'mediapipe', 'paddle',
                     '软件', '插件', '应用', '平台', '网站']

    word_lower = word.lower()
    if any(kw in word_lower for kw in tech_keywords):
        return "技术"
    if any(kw in word_lower for kw in culture_keywords):
        return "文化"
    if any(kw in word_lower for kw in tool_keywords):
        return "工具"
    # 默认
    return "概念/其他"


# ====== 主入口 ======
def main():
    import argparse
    parser = argparse.ArgumentParser(description='文章百科词条审核工具')
    parser.add_argument('--output', '-o', default=OUTPUT_DEFAULT, help='输出报告路径')
    parser.add_argument('--full', '-f', action='store_true', help='是否包含完整逐文章详情')
    args = parser.parse_args()

    print("=" * 50)
    print("  Wiki Audit Tool v1.0")
    print("=" * 50)
    print()

    # 加载现有词条
    wiki_terms = load_wiki_terms()

    # 扫描文章
    print("\n[SCAN] Scanning articles...")
    results = scan_articles(wiki_terms)

    # 生成报告
    report_path = generate_report(results, args.output)

    print(f"\n[OK] Done. Report: {report_path}")
    print("    - Content Team: review report for matches and new candidates")
    print("    - Wiki Team: update wiki-data.js based on report")
    print("    - QA Team: manually verify each link works correctly")


if __name__ == '__main__':
    main()
