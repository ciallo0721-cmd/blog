"""
批量向 blog/**/index.html 注入骨架屏懒渲染代码片段
只处理还没注入过的文件（检测 blog_skelShimmer 标记）
"""
import os
import glob

BLOG_DIR = r"g:\EmoScan Pro\ciallo0721-cmd.github.io\blog"

# 要替换的旧片段（唯一标识符，所有文章 index.html 都有这段）
OLD = """            // 键盘快捷键支持
            document.addEventListener('keydown', function(e) {
                // ESC键返回首页
                if (e.key === 'Escape') {
                    window.location.href = 'index.html';
                } else if (e.key === 'h' && (e.ctrlKey || e.metaKey)) {
                    // Ctrl/Cmd+H 返回首页
                    e.preventDefault();
                    window.location.href = 'index.html';
                }
            });
        });"""

NEW = """            // 键盘快捷键支持
            document.addEventListener('keydown', function(e) {
                // ESC键返回首页
                if (e.key === 'Escape') {
                    window.location.href = 'index.html';
                } else if (e.key === 'h' && (e.ctrlKey || e.metaKey)) {
                    // Ctrl/Cmd+H 返回首页
                    e.preventDefault();
                    window.location.href = 'index.html';
                }
            });

            // ================================================================
            // ===== 骨架屏懒渲染：正文内容块（像抖音那样滚出即消失）==========
            // ================================================================
            (function() {
                var style = document.createElement('style');
                style.textContent = [
                    '@keyframes blog_skelShimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}',
                    '.blog-skel{display:block;border-radius:6px;background:linear-gradient(90deg,#eff2ff 25%,#dce3ff 50%,#eff2ff 75%);background-size:400px 100%;animation:blog_skelShimmer 1.3s ease-in-out infinite;}'
                ].join('\\n');
                document.head.appendChild(style);

                var content = document.querySelector('.article-content');
                if (!content) return;

                var targets = Array.from(content.children).filter(function(el) {
                    return /^(H[1-6]|P|DIV|UL|OL|PRE|BLOCKQUOTE|TABLE)$/.test(el.tagName);
                });
                if (targets.length === 0) return;

                var cache = new Map();

                function getSkeletonFor(el) {
                    var tag = el.tagName;
                    var h = /^H[1-3]$/.test(tag) ? '24px' : '14px';
                    var w = /^H[1-3]$/.test(tag) ? '60%' : (Math.floor(Math.random() * 25) + 70) + '%';
                    var lines = /^(P|DIV)$/.test(tag) ? 3 : 1;
                    var out = '';
                    for (var i = 0; i < lines; i++) {
                        var lw = i === lines - 1 && lines > 1 ? (Math.floor(Math.random() * 20) + 40) + '%' : (i === 0 ? w : '100%');
                        out += '<span class="blog-skel" style="display:block;height:' + h + ';width:' + lw + ';margin-bottom:' + (i < lines - 1 ? '8px' : '0') + ';"></span>';
                    }
                    return out;
                }

                var obs = new IntersectionObserver(function(entries) {
                    entries.forEach(function(entry) {
                        var el = entry.target;
                        if (entry.isIntersecting) {
                            if (cache.has(el)) {
                                el.innerHTML = cache.get(el);
                            }
                        } else {
                            if (!cache.has(el)) {
                                cache.set(el, el.innerHTML);
                            }
                            el.innerHTML = getSkeletonFor(el);
                        }
                    });
                }, { rootMargin: '0px 0px -80px 0px', threshold: 0.05 });

                targets.forEach(function(el) { obs.observe(el); });
            })();

        });"""

MARKER = 'blog_skelShimmer'

success = []
skipped_already = []
skipped_no_match = []
errors = []

for html_file in glob.glob(os.path.join(BLOG_DIR, '**', 'index.html'), recursive=True):
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # 已注入过就跳过
        if MARKER in content:
            skipped_already.append(html_file)
            continue

        if OLD not in content:
            skipped_no_match.append(html_file)
            continue

        new_content = content.replace(OLD, NEW, 1)
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(new_content)

        success.append(html_file)
    except Exception as e:
        errors.append((html_file, str(e)))

print(f"✅ 注入成功 ({len(success)} 个文件):")
for f in success:
    print(f"   {f}")

print(f"\n⏭ 已注入过，跳过 ({len(skipped_already)} 个):")
for f in skipped_already:
    print(f"   {f}")

print(f"\n⚠ 未找到匹配片段，跳过 ({len(skipped_no_match)} 个):")
for f in skipped_no_match:
    print(f"   {f}")

if errors:
    print(f"\n❌ 错误 ({len(errors)} 个):")
    for f, e in errors:
        print(f"   {f}: {e}")
