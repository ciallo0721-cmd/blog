// wiki-linker.js — 文章百科词条自动链接脚本
// 功能：在文章页面加载后，扫描 .article-content 内的文本，
// 自动将匹配百科词条的文字包装为带下划线的可点击链接
// 引入方式：在文章页面的 </head> 前添加：
//   <script src="../../wiki-data.js"></script>
//   <script src="../../css/wiki-linker.js"></script>

(function() {
    'use strict';

    // ====== 配置 ======
    var CONFIG = {
        // 目标容器选择器
        containerSelector: '.article-content',
        // 跳过这些标签内的文本（不进行匹配）
        skipTags: ['A', 'PRE', 'CODE', 'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'BUTTON', 'SELECT'],
        // wiki 页面基础 URL（不包含 hash）
        wikiBaseUrl: '../../wiki/',
        // 已处理的标记类名
        processedClass: 'wiki-linked',
        // 是否启用调试日志
        debug: false
    };

    // ====== CSS 注入 ======
    (function injectStyles() {
        var styleId = 'wiki-linker-styles';
        if (document.getElementById(styleId)) return;
        var style = document.createElement('style');
        style.id = styleId;
        style.textContent =
            '.wiki-term-link {' +
            '    text-decoration: underline !important;' +
            '    text-decoration-style: dotted !important;' +
            '    text-underline-offset: 3px;' +
            '    color: #00A1D6 !important;' +
            '    cursor: pointer;' +
            '    transition: all 0.2s ease;' +
            '    border-bottom: 2px dotted #00A1D6;' +
            '    padding-bottom: 1px;' +
            '}' +
            '.wiki-term-link:hover {' +
            '    color: #FB7299 !important;' +
            '    border-bottom-color: #FB7299;' +
            '    background: rgba(251, 114, 153, 0.08);' +
            '    border-radius: 2px;' +
            '}' +
            '.wiki-term-link::after {' +
            '    content: " \\00a0📖";' +
            '    font-size: 0.75em;' +
            '    opacity: 0.6;' +
            '}';
        document.head.appendChild(style);
    })();

    // ====== 工具函数 ======

    function log(msg) {
        if (CONFIG.debug) console.log('[wiki-linker] ' + msg);
    }

    // 在文本节点中查找并替换所有关键词（支持同一关键词多次出现）
    function replaceInTextNode(textNode, keywordMap) {
        var text = textNode.textContent;
        if (!text || text.trim() === '') return null;

        // 跳过纯空白和极短文本
        if (text.trim().length < 3) return null;

        var replacements = [];

        // 遍历所有关键词
        for (var i = 0; i < keywordMap.length; i++) {
            var entry = keywordMap[i];
            var kw = entry.keyword;
            var targetId = entry.targetId;
            var targetType = entry.targetType || 'term';

            if (kw.length < 2) continue;  // 忽略单字符关键词

            // 查找该关键词在文本中的所有出现位置
            var searchStart = 0;
            var idx;
            while ((idx = text.indexOf(kw, searchStart)) !== -1) {
                // 检查词边界
                var beforeChar = idx > 0 ? text[idx - 1] : ' ';
                var afterChar = idx + kw.length < text.length ? text[idx + kw.length] : ' ';

                var isWordChar = function(ch) {
                    return /[\w\u4e00-\u9fff\u3400-\u4dbf]/.test(ch);
                };

                // 如果不是词的中间部分，才匹配
                if (!isWordChar(beforeChar) || !isWordChar(afterChar)) {
                    // 如果前一个字符不是词字符，或者后一个字符不是词字符，就算匹配
                    // （只要前后不都是词字符就不算嵌入在其他词中）
                    if (!isWordChar(beforeChar) || !isWordChar(afterChar)) {
                        replacements.push({
                            start: idx,
                            end: idx + kw.length,
                            keyword: kw,
                            targetId: targetId,
                            targetType: targetType
                        });
                    }
                }
                searchStart = idx + 1;
            }
        }

        if (replacements.length === 0) return null;

        // 按出现位置排序
        replacements.sort(function(a, b) { return a.start - b.start; });

        // 合并重叠的替换（保留最长的那个）
        var merged = [replacements[0]];
        for (var i = 1; i < replacements.length; i++) {
            var last = merged[merged.length - 1];
            var curr = replacements[i];
            if (curr.start < last.end) {
                // 重叠，保留较长的
                if ((curr.end - curr.start) > (last.end - last.start)) {
                    merged[merged.length - 1] = curr;
                }
            } else if (curr.start === last.start) {
                // 同位置，保留较长的
                if ((curr.end - curr.start) > (last.end - last.start)) {
                    merged[merged.length - 1] = curr;
                }
            } else {
                merged.push(curr);
            }
        }

        // 构建替换后的 DOM 片段
        var fragment = document.createDocumentFragment();
        var lastEnd = 0;

        for (var i = 0; i < merged.length; i++) {
            var rep = merged[i];

            // 添加关键词前的文本
            if (rep.start > lastEnd) {
                fragment.appendChild(document.createTextNode(text.slice(lastEnd, rep.start)));
            }

            // 创建链接
            var link = document.createElement('a');
            var href;
            if (rep.targetType === 'character') {
                href = CONFIG.wikiBaseUrl + '#/character/' + encodeURIComponent(rep.targetId);
            } else {
                href = CONFIG.wikiBaseUrl + '#/' + encodeURIComponent(rep.targetId);
            }
            link.href = href;
            link.textContent = rep.keyword;
            link.className = 'wiki-term-link';
            link.title = '查看百科词条：' + rep.keyword;
            link.target = '_blank';
            link.rel = 'noopener';
            fragment.appendChild(link);

            lastEnd = rep.end;
        }

        // 添加剩余文本
        if (lastEnd < text.length) {
            fragment.appendChild(document.createTextNode(text.slice(lastEnd)));
        }

        return fragment;
    }

    // ====== 核心逻辑 ======

    function initWikiLinker() {
        // 检查 wikiData 是否已就绪
        if (!window.wikiData || !window.wikiData.isReady || !window.wikiData.isReady()) {
            log('wikiData 尚未就绪，等待加载...');
            // 监听就绪事件
            var waitHandler = function() {
                document.removeEventListener('wikidata:ready', waitHandler);
                initWikiLinker();
            };
            document.addEventListener('wikidata:ready', waitHandler);
            // 也试试 ready callback
            if (window.wikiDataReady) {
                window.wikiDataReady(function() {
                    initWikiLinker();
                });
            }
            return;
        }

        var container = document.querySelector(CONFIG.containerSelector);
        if (!container) {
            log('未找到容器：' + CONFIG.containerSelector);
            return;
        }

        // 防止重复处理
        if (container.classList.contains(CONFIG.processedClass)) {
            log('已处理过，跳过');
            return;
        }

        var keywords = window.wikiData.getAllKeywords();
        if (!keywords || keywords.length === 0) {
            log('没有可匹配的关键词');
            return;
        }

        log('加载了 ' + keywords.length + ' 个关键词');

        // 使用 TreeWalker 遍历所有文本节点
        var treeWalker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // 跳过空文本节点
                    if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;

                    // 检查父节点是否在跳过标签中
                    var parent = node.parentNode;
                    while (parent && parent !== container) {
                        if (CONFIG.skipTags.indexOf(parent.tagName) !== -1) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        // 跳过已经 wiki 链接的内部
                        if (parent.tagName === 'A' && parent.classList.contains('wiki-term-link')) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        parent = parent.parentNode;
                    }

                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        var count = 0;
        var nodesToReplace = [];

        // 第一遍：收集所有需要替换的节点
        var node;
        while ((node = treeWalker.nextNode())) {
            var result = replaceInTextNode(node, keywords);
            if (result) {
                nodesToReplace.push({
                    original: node,
                    replacement: result
                });
                count++;
            }
        }

        log('找到 ' + count + ' 个需要替换的文本节点');

        // 第二遍：执行替换
        for (var i = 0; i < nodesToReplace.length; i++) {
            var item = nodesToReplace[i];
            item.original.parentNode.replaceChild(item.replacement, item.original);
        }

        container.classList.add(CONFIG.processedClass);
        log('百科链接注入完成，共处理 ' + count + ' 处');
    }

    // ====== 初始化 ======

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWikiLinker);
    } else {
        initWikiLinker();
    }

    window.initWikiLinker = initWikiLinker;

})();
