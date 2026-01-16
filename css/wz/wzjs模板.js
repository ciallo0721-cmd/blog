
// 文章特定的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('文章模板已加载完成');
    
    // 获取当前文章ID（从URL参数或默认值）
    function getCurrentArticleId() {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = parseInt(urlParams.get('id')) || "换成id"; // 请将“换成id”替换为当前文章的实际ID
        return articleId;
    }
    
    const currentArticleId = getCurrentArticleId();
    
    // 更新文章信息
    function updateArticleInfo(articleId) {
        // 确保articlesData已加载
        if (typeof window.articlesData === 'undefined') {
            console.error('articlesData未加载');
            return;
        }
        
        const articleData = window.articlesData.getArticleById(articleId);
        
        if (articleData) {
            document.getElementById('articleNumber').textContent = `文章 #${String(articleData.id).padStart(3, '0')}`;
            document.getElementById('articleTitle').textContent = articleData.title;
            document.getElementById('articleIntro').textContent = articleData.excerpt;
            document.getElementById('articleDate').textContent = articleData.date;
            document.getElementById('readTime').textContent = `约${articleData.readTime}分钟`;
            
            // 更新标签
            const tagsContainer = document.getElementById('articleTags');
            tagsContainer.innerHTML = '';
            if (articleData.tags && articleData.tags.length > 0) {
                articleData.tags.forEach(tag => {
                    const tagElement = document.createElement('span');
                    tagElement.className = 'article-tag';
                    tagElement.textContent = tag;
                    tagsContainer.appendChild(tagElement);
                });
            }
            
            // 更新文章内容
            const contentContainer = document.getElementById('articleContent');
            if (articleData.content) {
                contentContainer.innerHTML = articleData.content;
            }
        } else {
            console.warn(`未找到ID为${articleId}的文章数据`);
        }
    }
    
    // 生成文章导航（上一篇/下一篇）
    function initArticleNavigation(articleId) {
        const navigation = document.getElementById('articleNavigation');
        if (!navigation) return;
        
        // 确保articlesData已加载
        if (typeof window.articlesData === 'undefined') {
            console.error('articlesData未加载');
            return;
        }
        
        const adjacent = window.articlesData.getAdjacentArticles(articleId);
        let navigationHTML = '';
        
        // 上一篇按钮
        if (adjacent.prev) {
            navigationHTML += `
                <a href="${adjacent.prev.fileName}" class="nav-btn prev">
                    <i class="fas fa-chevron-left"></i>
                    <div>
                        <div style="font-size: 0.8rem; color: inherit; opacity: 0.8;">上一篇</div>
                        <div>${adjacent.prev.title}</div>
                    </div>
                </a>
            `;
        } else {
            navigationHTML += `
                <a href="javascript:void(0)" class="nav-btn prev disabled">
                    <i class="fas fa-chevron-left"></i>
                    <div>
                        <div style="font-size: 0.8rem; color: inherit; opacity: 0.8;">上一篇</div>
                        <div>已是第一篇</div>
                    </div>
                </a>
            `;
        }
        
        // 下一篇按钮
        if (adjacent.next) {
            navigationHTML += `
                <a href="${adjacent.next.fileName}" class="nav-btn next">
                    <div>
                        <div style="font-size: 0.8rem; color: inherit; opacity: 0.8;">下一篇</div>
                        <div>${adjacent.next.title}</div>
                    </div>
                    <i class="fas fa-chevron-right"></i>
                </a>
            `;
        } else {
            navigationHTML += `
                <a href="javascript:void(0)" class="nav-btn next disabled">
                    <div>
                        <div style="font-size: 0.8rem; color: inherit; opacity: 0.8;">下一篇</div>
                        <div>已是最后一篇</div>
                    </div>
                    <i class="fas fa-chevron-right"></i>
                </a>
            `;
        }
        
        navigation.innerHTML = navigationHTML;
    }
    
    // 生成推荐文章
    function initRelatedArticles(articleId) {
        const grid = document.getElementById('relatedGrid');
        if (!grid) return;
        
        // 确保articlesData已加载
        if (typeof window.articlesData === 'undefined') {
            console.error('articlesData未加载');
            return;
        }
        
        const relatedArticles = window.articlesData.getFeaturedArticles(articleId, 3);
        grid.innerHTML = '';
        
        if (relatedArticles && relatedArticles.length > 0) {
            relatedArticles.forEach(article => {
                const card = document.createElement('a');
                card.href = article.fileName;
                card.className = 'related-card';
                card.innerHTML = `
                    <h4>${article.title}</h4>
                    <p>${article.excerpt}</p>
                    <div class="related-tags">
                        ${article.tags.slice(0, 3).map(tag => `<span class="related-tag">${tag}</span>`).join('')}
                    </div>
                `;
                grid.appendChild(card);
            });
        } else {
            // 如果没有推荐文章，显示默认内容
            grid.innerHTML = `
                <a href="#" class="related-card">
                    <h4>推荐文章标题示例1</h4>
                    <p>这是一个推荐文章的简介示例，实际内容将通过JavaScript动态生成。</p>
                    <div class="related-tags">
                        <span class="related-tag">示例标签</span>
                    </div>
                </a>
            `;
        }
    }
    
    // 添加代码复制功能
    function addCodeCopyFunction() {
        document.querySelectorAll('pre code').forEach((codeBlock) => {
            const pre = codeBlock.parentElement;
            
            // 避免重复添加复制按钮
            if (pre.querySelector('.copy-button')) return;
            
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.innerHTML = '<i class="far fa-copy"></i> 复制';
            copyButton.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(251, 114, 153, 0.2);
                border: 1px solid rgba(251, 114, 153, 0.4);
                color: white;
                padding: 5px 12px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.8rem;
                transition: all 0.3s ease;
            `;
            
            pre.style.position = 'relative';
            pre.appendChild(copyButton);
            
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                    copyButton.innerHTML = '<i class="fas fa-check"></i> 已复制';
                    copyButton.style.background = 'rgba(0, 161, 214, 0.5)';
                    setTimeout(() => {
                        copyButton.innerHTML = '<i class="far fa-copy"></i> 复制';
                        copyButton.style.background = 'rgba(251, 114, 153, 0.2)';
                    }, 2000);
                }).catch(err => {
                    console.error('复制失败:', err);
                });
            });
        });
    }
    
    // 添加阅读进度指示器
    function addReadingProgressBar() {
        // 避免重复添加进度条
        if (document.getElementById('reading-progress-bar')) return;
        
        const progressBar = document.createElement('div');
        progressBar.id = 'reading-progress-bar';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(135deg, var(--bili-pink), var(--bili-blue));
            width: 0%;
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);
        
        // 更新阅读进度
        window.addEventListener('scroll', function() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (documentHeight > 0) {
                const scrollPercent = (scrollTop / documentHeight) * 100;
                progressBar.style.width = scrollPercent + '%';
            }
        });
    }
    
    // 初始化分享功能
    function initShareFunction() {
        const shareButton = document.getElementById('shareButton');
        const shareModal = document.getElementById('shareModal');
        const shareText = document.getElementById('shareText');
        const copyShareTextBtn = document.getElementById('copyShareText');
        const closeShareModalBtn = document.getElementById('closeShareModal');
        const closeShareModalBtn2 = document.getElementById('closeShareModalBtn');
        
        if (!shareButton || !shareModal || !shareText) {
            console.error('分享功能元素未找到');
            return;
        }
        
        // 获取文章标题
        let articleTitle = document.getElementById('articleTitle').textContent;
        if (!articleTitle || articleTitle === '文章标题') {
            articleTitle = '这篇文章';
        }
        
        // 更新分享文本
        const shareUrl = `https://ciallo0721-cmd.github.io/blog/${currentArticleId}.html`;
        const shareMessage = `快来看看这篇文章《${articleTitle}》: ${shareUrl}`;
        shareText.textContent = shareMessage;
        
        // 打开分享弹窗
        shareButton.addEventListener('click', function() {
            shareModal.classList.add('active');
        });
        
        // 关闭分享弹窗
        function closeShareModal() {
            shareModal.classList.remove('active');
            // 重置复制按钮状态
            copyShareTextBtn.innerHTML = '<i class="far fa-copy"></i> 复制分享链接';
            copyShareTextBtn.classList.remove('copied');
        }
        
        closeShareModalBtn.addEventListener('click', closeShareModal);
        closeShareModalBtn2.addEventListener('click', closeShareModal);
        
        // 点击弹窗外部关闭
        shareModal.addEventListener('click', function(e) {
            if (e.target === shareModal) {
                closeShareModal();
            }
        });
        
        // 复制分享链接
        copyShareTextBtn.addEventListener('click', function() {
            navigator.clipboard.writeText(shareMessage).then(() => {
                copyShareTextBtn.innerHTML = '<i class="fas fa-check"></i> 已复制到剪贴板';
                copyShareTextBtn.classList.add('copied');
                
                // 3秒后恢复按钮状态
                setTimeout(() => {
                    copyShareTextBtn.innerHTML = '<i class="far fa-copy"></i> 复制分享链接';
                    copyShareTextBtn.classList.remove('copied');
                }, 3000);
            }).catch(err => {
                console.error('复制失败:', err);
                alert('复制失败，请手动复制链接');
            });
        });
        
        // ESC键关闭弹窗
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && shareModal.classList.contains('active')) {
                closeShareModal();
            }
        });
    }
    
    // 初始化页面
    function initPage() {
        // 等待articlesData加载完成
        if (typeof window.articlesData === 'undefined') {
            // 如果articlesData未定义，尝试等待
            setTimeout(initPage, 100);
            return;
        }
        
        updateArticleInfo(currentArticleId);
        initArticleNavigation(currentArticleId);
        initRelatedArticles(currentArticleId);
        addCodeCopyFunction();
        addReadingProgressBar();
        initShareFunction();
    }
    
    // 初始化页面
    initPage();
    
    // 键盘快捷键支持
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
    
    // 监听文章内容更新，重新添加代码复制按钮
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                addCodeCopyFunction();
            }
        });
    });
    
    // 开始观察articleContent的变化
    const articleContent = document.getElementById('articleContent');
    if (articleContent) {
        observer.observe(articleContent, { childList: true, subtree: true });
    }
});
