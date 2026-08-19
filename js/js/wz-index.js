window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-TR4FT7JPDZ');

(function() {
            function checkHTTP() {
                if (window.location.protocol === 'http:') {
                    var urlSpan = document.getElementById('currentHttpUrl');
                    if (urlSpan) urlSpan.textContent = window.location.href;
                    var overlay = document.getElementById('httpWarningOverlay');
                    if (overlay) overlay.style.display = 'flex';
                }
            }
            function switchToHTTPS() {
                var url = window.location.href;
                url = url.replace(/^http:/i, 'https:');
                window.location.href = url;
            }
            function continueHTTP() {
                var overlay = document.getElementById('httpWarningOverlay');
                if (overlay) overlay.style.display = 'none';
            }
            window.switchToHTTPS = switchToHTTPS;
            window.continueHTTP = continueHTTP;
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', checkHTTP);
            } else {
                checkHTTP();
            }
        })();

// 检测JS注入特征（常见XSS/脚本模式）
        function containsMaliciousJS(input) {
            if (!input || typeof input !== 'string') return false;
            const trimmed = input.trim();
            if (trimmed === '') return false;
            // 综合检测注入模式：script标签、javascript协议、事件处理器、alert/eval/表达式、cookie窃取等
            const injectionPattern = /<script|javascript:|on\w+\s*=|alert\s*\(|eval\s*\(|prompt\s*\(|confirm\s*\(|document\.cookie|\.innerHTML\s*=|expression\s*\(|<\s*iframe|<\s*img\s+onerror|onload\s*=/i;
            return injectionPattern.test(trimmed);
        }

        // 显示安全警告模态框（含gif + 链接）
        function showSecurityWarning() {
            const modal = document.getElementById('securityModal');
            if (modal) {
                modal.classList.add('active');
                // 禁止背景滚动
                document.body.style.overflow = 'hidden';
            }
        }

        // 关闭模态框
        function closeSecurityModal() {
            const modal = document.getElementById('securityModal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            console.log('文章列表页面已加载完成，已启用注入检测防御');
            
            // 确保全局文章数据存在
            if (!window.articlesData || typeof window.articlesData.getSortedArticles !== 'function') {
                console.warn('articlesData 未正确加载，请确保 articles-data.js 存在且格式正确');
                // 防止报错，提供临时空数组
                window.articlesData = { getSortedArticles: () => [] };
            }
            
            const allArticles = window.articlesData.getSortedArticles();
            const articlesGrid = document.getElementById('articlesGrid');
            const articleCount = document.getElementById('articleCount');
            const filterTags = document.getElementById('filterTags');
            const searchInput = document.getElementById('searchInput');
            const searchButton = document.getElementById('searchButton');
            const noResults = document.getElementById('noResults');
            
            let allTags = [];
            let activeFilters = new Set();
            let activeCategory = '全部';
            let currentSearch = '';     // 只存储通过安全检测的有效搜索词
            
            // 初始化页面
            function initPage() {
                extractAllTags();
                generateFilterTags();
                // 绑定板块按钮
                document.querySelectorAll('.category-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                        this.classList.add('active');
                        activeCategory = this.dataset.category;
                        filterArticles();
                    });
                });
                displayArticles(allArticles);
                updateArticleCount(allArticles.length);
            }
            
            function extractAllTags() {
                const tagSet = new Set();
                allArticles.forEach(article => {
                    article.tags.forEach(tag => tagSet.add(tag));
                });
                allTags = Array.from(tagSet).sort();
            }
            
            function generateFilterTags() {
                filterTags.innerHTML = '';
                const allTag = document.createElement('div');
                allTag.className = 'filter-tag active';
                allTag.textContent = '全部';
                allTag.dataset.tag = '全部';
                allTag.addEventListener('click', () => {
                    activeFilters.clear();
                    document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
                    allTag.classList.add('active');
                    filterArticles();
                });
                filterTags.appendChild(allTag);
                
                allTags.forEach(tag => {
                    const tagElement = document.createElement('div');
                    tagElement.className = 'filter-tag';
                    tagElement.textContent = tag;
                    tagElement.dataset.tag = tag;
                    tagElement.addEventListener('click', () => {
                        tagElement.classList.toggle('active');
                        if (tagElement.classList.contains('active')) {
                            activeFilters.add(tag);
                        } else {
                            activeFilters.delete(tag);
                        }
                        if (activeFilters.size === 0) {
                            document.querySelector('.filter-tag[data-tag="全部"]').classList.add('active');
                        } else {
                            document.querySelector('.filter-tag[data-tag="全部"]').classList.remove('active');
                        }
                        filterArticles();
                    });
                    filterTags.appendChild(tagElement);
                });

                // 标签超过 1 行时显示展开按钮
                const btn = document.getElementById('tagsToggle');
                if (btn && allTags.length > 4) {
                    btn.style.display = 'inline-flex';
                }
            }

            window.toggleTags = function() {
                const tags = document.getElementById('filterTags');
                const btn = document.getElementById('tagsToggleText');
                if (tags.classList.contains('expanded')) {
                    tags.classList.remove('expanded');
                    btn.textContent = '展开全部标签 ▾';
                } else {
                    tags.classList.add('expanded');
                    btn.textContent = '收起标签 ▴';
                }
            };
            
            function displayArticles(articles) {
                articlesGrid.innerHTML = '';
                if (articles.length === 0) {
                    noResults.style.display = 'block';
                    return;
                }
                noResults.style.display = 'none';
                articles.forEach((article, index) => {
                    const articleCard = document.createElement('a');
                    articleCard.href = article.id === -1 ? '../blog/grayscale-test/' : '../blog/' + article.fileName + '?blog_id=' + article.id;
                    articleCard.className = 'article-card fade-in-up';
                    if (article.isPaid) articleCard.classList.add('paid');
                    articleCard.style.animationDelay = `${index * 0.1}s`;
                    const paidBadge = article.isPaid ? `<span class="paid-badge">💰 ¥${(article.price || 0).toFixed(2)}</span>` : '';
                    const readMoreText = article.isPaid ? '付费阅读' : '阅读全文';
                    articleCard.innerHTML = `
                        <div class="article-content">
                            <div class="article-meta">
                                <span class="article-number">文章 #${String(article.id).padStart(3, '0')}</span>
                                <span class="article-category-badge">${escapeHtml(article.category || '')}</span>
                                <span class="article-date">${article.date}</span>
                            </div>
                            <h3>${escapeHtml(article.title)}${paidBadge}</h3>
                            <p class="article-excerpt">${escapeHtml(article.excerpt)}</p>
                            <div class="article-tags">
                                ${article.tags.map(tag => `<span class="article-tag">${escapeHtml(tag)}</span>`).join('')}
                            </div>
                            <div class="article-footer">
                                <span class="read-more">${readMoreText} <i class="fas fa-arrow-right"></i></span>
                                <span class="read-time"><i class="far fa-clock"></i> 约${article.readTime}分钟</span>
                            </div>
                        </div>
                    `;
                    articlesGrid.appendChild(articleCard);
                });
            }
            
            // 简单防XSS辅助
            function escapeHtml(str) {
                if (!str) return '';
                return str.replace(/[&<>]/g, function(m) {
                    if (m === '&') return '&amp;';
                    if (m === '<') return '&lt;';
                    if (m === '>') return '&gt;';
                    return m;
                }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
                    return c;
                });
            }
            
            function filterArticles() {
                let filtered = allArticles;
                // category 过滤
                if (activeCategory !== '全部') {
                    filtered = filtered.filter(a => a.category === activeCategory);
                }
                // 标签过滤
                if (activeFilters.size > 0) {
                    filtered = filtered.filter(article =>
                        Array.from(activeFilters).some(f => article.tags && article.tags.includes(f))
                    );
                }
                // 搜索过滤
                if (currentSearch) {
                    const s = currentSearch.toLowerCase();
                    filtered = filtered.filter(article =>
                        article.title.toLowerCase().includes(s) ||
                        article.excerpt.toLowerCase().includes(s) ||
                        (article.tags && article.tags.some(t => t.toLowerCase().includes(s)))
                    );
                }
                displayArticles(filtered);
                updateArticleCount(filtered.length);
                // 动态更新标题
                const h2 = document.querySelector('.articles-header h2');
                if (h2) h2.textContent = activeCategory !== '全部' ? `「${activeCategory}」文章` : '所有文章';
            }
            
            function updateArticleCount(count) {
                articleCount.textContent = count;
            }
            
            // 核心搜索入口: 检测注入，若安全则执行过滤，否则弹警告
            function performSearchWithInspection() {
                const rawInput = searchInput.value;
                if (containsMaliciousJS(rawInput)) {
                    // 检测到JS注入特征 -> 弹出安全提示模态框，不执行搜索，不清空已有列表
                    showSecurityWarning();
                    return;
                }
                // 安全: 更新搜索词并过滤文章
                currentSearch = rawInput;
                filterArticles();
            }
            
            // 重置搜索框并清空搜索关键词（保留标签过滤）
            function resetSearchAndReload() {
                searchInput.value = '';
                currentSearch = '';
                filterArticles();
            }
            
            // 模态框关闭绑定
            const modal = document.getElementById('securityModal');
            const closeBtn = document.getElementById('closeModalBtn');
            if (closeBtn) {
                closeBtn.addEventListener('click', closeSecurityModal);
            }
            // 点击模态框背景关闭
            if (modal) {
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) closeSecurityModal();
                });
            }
            // ESC关闭模态框
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
                    closeSecurityModal();
                }
            });
            
            // 事件绑定
            searchButton.addEventListener('click', performSearchWithInspection);
            searchInput.addEventListener('keyup', function(event) {
                if (event.key === 'Enter') {
                    performSearchWithInspection();
                }
            });
            
            // 快捷键 Ctrl+F 聚焦搜索框
            document.addEventListener('keydown', function(e) {
                if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                    e.preventDefault();
                    searchInput.focus();
                }
                // ESC 清空搜索（仅在未打开模态框时执行清空）
                if (e.key === 'Escape' && (!modal || !modal.classList.contains('active'))) {
                    if (searchInput.value !== '') {
                        resetSearchAndReload();
                        e.preventDefault();
                    }
                }
            });
            
            initPage();
            
            // 滚动动画观察器
            const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) entry.target.classList.add('fade-in-up');
                });
            }, observerOptions);
            document.querySelectorAll('.article-card').forEach(el => observer.observe(el));
        });

        // ================================================================
        // ===== 骨架屏懒渲染（wz/ 文章列表）===============================
        // ================================================================
        (function() {
            // CSS
            var s = document.createElement('style');
            s.textContent = [
                '@keyframes wz_skeletonShimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}',
                '.wz-skeleton-block{border-radius:8px;background:linear-gradient(90deg,#e8eeff 25%,#d0d8ff 50%,#e8eeff 75%);background-size:400px 100%;animation:wz_skeletonShimmer 1.4s ease-in-out infinite;}',
            ].join('');
            document.head.appendChild(s);

            var cardCache = new Map();

            function makeSkeletonCard() {
                return '<div style="padding:22px 20px;">' +
                    '<div class="wz-skeleton-block" style="height:13px;width:48%;margin-bottom:14px;"></div>' +
                    '<div class="wz-skeleton-block" style="height:22px;width:88%;margin-bottom:10px;"></div>' +
                    '<div class="wz-skeleton-block" style="height:13px;width:100%;margin-bottom:7px;"></div>' +
                    '<div class="wz-skeleton-block" style="height:13px;width:72%;margin-bottom:18px;"></div>' +
                    '<div style="display:flex;gap:8px;">' +
                        '<div class="wz-skeleton-block" style="height:11px;width:50px;border-radius:20px;"></div>' +
                        '<div class="wz-skeleton-block" style="height:11px;width:60px;border-radius:20px;"></div>' +
                    '</div>' +
                '</div>';
            }

            // 等 articlesGrid 有内容后挂观察器
            var grid = document.getElementById('articlesGrid');
            if (!grid) return;

            var wzObs = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    var card = entry.target;
                    if (entry.isIntersecting) {
                        // 恢复原始内容
                        if (cardCache.has(card)) {
                            card.innerHTML = cardCache.get(card);
                            card.style.pointerEvents = '';
                            card.style.opacity = '1';
                        }
                    } else {
                        // 替换为骨架屏
                        if (!cardCache.has(card)) {
                            cardCache.set(card, card.innerHTML);
                        }
                        card.innerHTML = makeSkeletonCard();
                        card.style.pointerEvents = 'none';
                        card.style.opacity = '0.85';
                    }
                });
            }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });

            // 监听文章卡片被动态注入
            var mut = new MutationObserver(function() {
                var cards = grid.querySelectorAll('.article-card');
                cards.forEach(function(c) {
                    if (!cardCache.has(c) && !c._wzObserved) {
                        c._wzObserved = true;
                        wzObs.observe(c);
                    }
                });
            });
            mut.observe(grid, { childList: true });
        })();

window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        
        gtag('config', 'G-TR4FT7JPDZ');