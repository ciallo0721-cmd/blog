// 每页显示的文章数量
const articlesPerPage = 6;
let currentPage = 1;
let totalPages = 0;

// 初始化文章板块
function initArticles() {
    const grid = document.getElementById('articlesGrid');
    if (!grid) return;
    
    // 检查文章数据是否存在
    if (!window.articlesData || !window.articlesData.getSortedArticles) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-newspaper" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.3;"></i>
                <h3 style="margin-bottom: 15px;">文章数据加载中喵～</h3>
                <p>请稍候或刷新页面～</p>
            </div>
        `;
        return;
    }
    
    // 获取最新的3篇文章
    const articles = window.articlesData.getSortedArticles().slice(0, 3);
    
    grid.innerHTML = '';
    
    if (articles.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-newspaper" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.3;"></i>
                <h3 style="margin-bottom: 15px;">暂无文章喵～</h3>
                <p>目前还没有发布文章，请稍后再来查看喵～</p>
            </div>
        `;
        return;
    }
    
    articles.forEach((article, index) => {
        const articleCard = document.createElement('a');
        articleCard.href = article.fileName;
        articleCard.className = 'article-card fade-in-up';
        articleCard.style.animationDelay = `${index * 0.1}s`;
        
        articleCard.innerHTML = `
            <div class="article-content">
                <div class="article-meta">
                    <span class="article-number">文章 ${article.id}</span>
                    <span class="article-date">${article.date}</span>
                </div>
                <h3>${article.title}</h3>
                <p class="article-excerpt">${article.excerpt}</p>
                <span class="read-more">
                    阅读全文喵～ <i class="fas fa-arrow-right"></i>
                </span>
                <div class="article-tags">
                    ${article.tags.map(tag => `<span class="article-tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;
        
        grid.appendChild(articleCard);
    });
}

// 欢迎弹窗功能
const welcomePopup = document.getElementById('welcomePopup');
const enterButton = document.getElementById('enterButton');

// 显示欢迎弹窗
function showWelcomePopup() {
    setTimeout(() => {
        welcomePopup.classList.add('active');
        document.body.style.overflow = 'hidden';
    }, 500);
}

// 隐藏欢迎弹窗
function hideWelcomePopup() {
    welcomePopup.classList.remove('active');
    document.body.style.overflow = '';
    showSuccess('欢迎来到开发者ciallo0721-cmd的空间喵～！');
}

// 页面加载完成后显示弹窗
window.addEventListener('load', showWelcomePopup);

// 点击进入按钮关闭弹窗
if (enterButton) {
    enterButton.addEventListener('click', hideWelcomePopup);
}

// 点击弹窗背景也可以关闭
welcomePopup.addEventListener('click', function(e) {
    if (e.target === this) {
        hideWelcomePopup();
    }
});

// ESC键关闭弹窗
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && welcomePopup.classList.contains('active')) {
        hideWelcomePopup();
    }
});

// 移动端菜单控制
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const menuOverlay = document.getElementById('menuOverlay');

if (menuToggle && mobileMenu && menuOverlay) {
    menuToggle.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        menuOverlay.style.display = mobileMenu.classList.contains('active') ? 'block' : 'none';
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    menuOverlay.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        menuOverlay.style.display = 'none';
        document.body.style.overflow = '';
    });
    
    // 点击菜单链接后关闭菜单
    const menuLinks = document.querySelectorAll('.mobile-menu-links a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            menuOverlay.style.display = 'none';
            document.body.style.overflow = '';
        });
    });
}

// 成功消息显示函数
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        bottom: 25px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        max-width: 300px;
        text-align: center;
        font-weight: 500;
    `;
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(successDiv);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (successDiv.parentNode) {
            document.body.removeChild(successDiv);
        }
    }, 3000);
}

// 简单的滚动动画
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// 导航栏滚动效果
window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (nav) {
        if (window.scrollY > 50) {
            nav.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
            nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            nav.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
        }
    }
});

// 游戏详情展开/收起功能
document.addEventListener('DOMContentLoaded', function() {
    const gameCards = document.querySelectorAll('.game-card');
    const closeButtons = document.querySelectorAll('.close-detail');
    
    // 点击游戏卡片展开详情
    gameCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.close-detail') || e.target.closest('.game-jump-btn')) return;
            
            const gameId = this.getAttribute('data-game-id');
            const detail = document.getElementById(`detail-${gameId}`);
            
            if (detail) {
                // 收起所有其他展开的详情
                document.querySelectorAll('.game-detail-expanded').forEach(d => {
                    d.classList.remove('active');
                });
                
                // 移除所有卡片的active状态
                document.querySelectorAll('.game-card').forEach(c => {
                    c.classList.remove('active');
                });
                
                // 展开当前详情
                detail.classList.add('active');
                this.classList.add('active');
                
                // 滚动到详情位置
                detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });
    
    // 点击关闭按钮收起详情
    closeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const detail = this.closest('.game-detail-expanded');
            const gameId = detail.id.split('-')[1];
            const card = document.querySelector(`[data-game-id="${gameId}"]`);
            
            detail.classList.remove('active');
            if (card) {
                card.classList.remove('active');
            }
        });
    });
    
    // 点击页面其他地方收起详情
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.game-card') && !e.target.closest('.game-detail-expanded')) {
            document.querySelectorAll('.game-detail-expanded').forEach(d => {
                d.classList.remove('active');
            });
            document.querySelectorAll('.game-card').forEach(c => {
                c.classList.remove('active');
            });
        }
    });
});

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('网站已加载完成喵～');
    
    // 初始化文章板块
    initArticles();
    
    // 添加一些交互效果
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // 检测图片加载错误
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            console.warn(`图片加载失败喵～: ${this.src}`);
            if (!this.onerrorCalled) {
                this.onerrorCalled = true;
            }
        });
    });
    
    // 添加滚动动画效果
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);
    
    // 观察需要动画的元素
    const animatedElements = document.querySelectorAll('.game-card, .intro, .about-content, .contact-content, .donation-content, .article-card, .iframe-item');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
});

// 添加键盘快捷键支持
document.addEventListener('keydown', function(e) {
    // ESC键关闭所有展开的游戏详情
    if (e.key === 'Escape') {
        document.querySelectorAll('.game-detail-expanded').forEach(d => {
            d.classList.remove('active');
        });
        document.querySelectorAll('.game-card').forEach(c => {
            c.classList.remove('active');
        });
    }
    
    // Ctrl+H 回到顶部
    if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// ====================================================
// 在线Python编辑器功能
// ====================================================
let pythonEditor;
let isPythonRunning = false;
let currentPythonInputCallback = null;

// 初始化Python编辑器
function initPythonEditor() {
    // 初始化CodeMirror编辑器
    pythonEditor = CodeMirror.fromTextArea(document.getElementById('pythonCode'), {
        lineNumbers: true,
        mode: 'python',
        theme: 'dracula',
        indentUnit: 4,
        smartIndent: true,
        tabSize: 4,
        indentWithTabs: false,
        electricChars: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        styleActiveLine: true,
        lineWrapping: true,
        extraKeys: {
            "Tab": function(cm) {
                cm.replaceSelection("    ", "end");
            }
        }
    });
    
    // 设置编辑器初始大小
    const pythonCodeArea = document.getElementById('pythonCodeArea');
    pythonEditor.setSize("100%", "100%");
    pythonCodeArea.appendChild(pythonEditor.getWrapperElement());
    
    // 获取Python编辑器相关元素
    const runBtn = document.getElementById('pythonRunBtn');
    const clearBtn = document.getElementById('pythonClearBtn');
    const clearOutputBtn = document.getElementById('pythonClearOutputBtn');
    const outputArea = document.getElementById('pythonOutputArea');
    const libraryItems = document.querySelectorAll('.python-library-item');
    
    // 输入对话框元素
    const inputDialog = document.getElementById('pythonInputDialog');
    const inputDialogPrompt = document.getElementById('pythonInputDialogPrompt');
    const inputDialogInput = document.getElementById('pythonInputDialogInput');
    const inputDialogSubmit = document.getElementById('pythonInputDialogSubmit');
    const inputDialogCancel = document.getElementById('pythonInputDialogCancel');
    
    // 运行Python代码
    runBtn.addEventListener('click', async function() {
        if (isPythonRunning) {
            addPythonOutputLine('程序正在运行中，请等待完成喵～...', 'info');
            return;
        }
        
        const code = pythonEditor.getValue();
        
        // 清空输出区域
        outputArea.innerHTML = '';
        
        // 显示运行状态
        addPythonOutputLine('正在运行Python代码喵～...', 'info');
        
        // 禁用运行按钮并显示加载状态
        const originalText = runBtn.innerHTML;
        runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 运行中喵～...';
        runBtn.disabled = true;
        isPythonRunning = true;
        
        try {
            await executePythonCode(code, outputArea);
        } catch (error) {
            addPythonOutputLine(`运行时错误喵～: ${error.message}`, 'error');
            console.error('Python执行错误:', error);
        } finally {
            runBtn.innerHTML = originalText;
            runBtn.disabled = false;
            isPythonRunning = false;
            
            if (currentPythonInputCallback === null) {
                addPythonOutputLine('程序执行完成喵～。', 'success');
            }
        }
    });
    
    // 清空编辑器
    clearBtn.addEventListener('click', function() {
        if (confirm('确定要清空代码编辑器喵～？')) {
            pythonEditor.setValue('# 清空后的Python编辑器喵～\n# 开始编写你的Python代码吧喵～！\n\nprint("Hello, Python喵～!")');
            addPythonOutputLine('编辑器已清空喵～。', 'info');
        }
    });
    
    // 清空输出区域
    clearOutputBtn.addEventListener('click', function() {
        outputArea.innerHTML = '';
        addPythonOutputLine('输出区域已清空喵～。', 'info');
    });
    
    // 添加常用库导入
    libraryItems.forEach(item => {
        item.addEventListener('click', function() {
            const lib = this.getAttribute('data-lib');
            const cursor = pythonEditor.getCursor();
            const line = pythonEditor.getLine(cursor.line);
            
            if (!line.includes(`import ${lib}`) && !pythonEditor.getValue().includes(`import ${lib}`)) {
                pythonEditor.replaceSelection(`import ${lib}\n`);
                addPythonOutputLine(`已添加导入语句喵～: import ${lib}`, 'info');
            } else {
                addPythonOutputLine(`库 ${lib} 已经导入喵～。`, 'info');
            }
        });
    });
    
    // 输入对话框提交
    inputDialogSubmit.addEventListener('click', function() {
        const inputValue = inputDialogInput.value;
        
        if (currentPythonInputCallback) {
            inputDialog.style.display = 'none';
            addPythonOutputLine(inputValue, 'input');
            currentPythonInputCallback(inputValue);
            currentPythonInputCallback = null;
            inputDialogInput.value = '';
            runBtn.disabled = false;
            runBtn.innerHTML = '<i class="fas fa-play"></i> 运行代码喵～';
        }
    });
    
    // 输入对话框取消
    inputDialogCancel.addEventListener('click', function() {
        inputDialog.style.display = 'none';
        inputDialogInput.value = '';
        
        if (currentPythonInputCallback) {
            currentPythonInputCallback("");
            currentPythonInputCallback = null;
            runBtn.disabled = false;
            runBtn.innerHTML = '<i class="fas fa-play"></i> 运行代码喵～';
            isPythonRunning = false;
            addPythonOutputLine('输入已取消，使用空字符串作为默认值喵～。', 'info');
        }
    });
    
    // 输入对话框回车键支持
    inputDialogInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            inputDialogSubmit.click();
        }
    });
    
    // 添加快捷键支持
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter' && document.activeElement !== inputDialogInput) {
            e.preventDefault();
            runBtn.click();
        }
    });
}

// 添加Python输出行函数
function addPythonOutputLine(text, type = 'output') {
    const outputArea = document.getElementById('pythonOutputArea');
    if (!outputArea) return;
    
    const line = document.createElement('div');
    line.className = `python-output-line ${type}`;
    
    // 添加时间戳
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    line.textContent = `[${timeString}] ${text}`;
    outputArea.appendChild(line);
    outputArea.scrollTop = outputArea.scrollHeight;
}

// 执行Python代码的主函数
async function executePythonCode(code, outputArea) {
    const env = {
        print: function(...args) {
            let end = '\n';
            let outputArgs = args;
            
            if (args.length > 1 && typeof args[args.length - 1] === 'string' && args[args.length - 1].startsWith('end=')) {
                end = args[args.length - 1].substring(4).replace(/['"]/g, '');
                outputArgs = args.slice(0, args.length - 1);
            }
            
            const output = outputArgs.map(arg => {
                if (typeof arg === 'object') {
                    return JSON.stringify(arg);
                }
                return String(arg);
            }).join(' ');
            
            addPythonOutputLine(output, 'output');
        },
        
        input: async function(prompt = '') {
            addPythonOutputLine(prompt, 'output');
            
            return new Promise((resolve) => {
                const inputDialog = document.getElementById('pythonInputDialog');
                const inputDialogPrompt = document.getElementById('pythonInputDialogPrompt');
                const inputDialogInput = document.getElementById('pythonInputDialogInput');
                const runBtn = document.getElementById('pythonRunBtn');
                
                inputDialogPrompt.textContent = prompt || '请输入喵～:';
                inputDialog.style.display = 'flex';
                inputDialogInput.focus();
                currentPythonInputCallback = resolve;
                runBtn.disabled = true;
                runBtn.innerHTML = '<i class="fas fa-pause"></i> 等待输入喵～...';
            });
        },
        
        int: function(x) {
            return parseInt(x, 10);
        },
        
        float: function(x) {
            return parseFloat(x);
        },
        
        str: function(x) {
            return String(x);
        },
        
        len: function(x) {
            if (x && x.length !== undefined) {
                return x.length;
            }
            return 0;
        },
        
        range: function(start, end, step) {
            if (arguments.length === 1) {
                end = start;
                start = 0;
                step = 1;
            } else if (arguments.length === 2) {
                step = 1;
            }
            
            const result = [];
            if (step > 0) {
                for (let i = start; i < end; i += step) {
                    result.push(i);
                }
            } else {
                for (let i = start; i > end; i += step) {
                    result.push(i);
                }
            }
            return result;
        },
        
        abs: Math.abs,
        round: Math.round,
        min: Math.min,
        max: Math.max,
        sum: function(arr) {
            return arr.reduce((a, b) => a + b, 0);
        },
        
        list: function(x) {
            if (x === undefined) return [];
            if (Array.isArray(x)) return [...x];
            if (typeof x === 'string') return x.split('');
            return Array.from(x);
        },
        
        dict: function() {
            return {};
        },
        
        format: function(value, format) {
            if (format && format.includes('.')) {
                return parseFloat(value).toFixed(parseInt(format.split('.')[1]));
            } else if (format) {
                return value.toString().padStart(parseInt(format), ' ');
            }
            return value;
        }
    };
    
    try {
        const wrappedCode = `
            try {
                ${code}
            } catch (e) {
                throw e;
            }
        `;
        
        const execute = new Function('env', `
            with(env) {
                ${wrappedCode}
            }
        `);
        
        execute(env);
        
    } catch (error) {
        addPythonOutputLine(`执行错误喵～: ${error.message}`, 'error');
    }
}

// 初始化Python编辑器
initPythonEditor();

// ====================================================
// 鼠标跟踪和底部特效功能
// ====================================================
document.addEventListener('DOMContentLoaded', function() {
    // 性能优化：检测是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // 如果用户偏好减少动画或移动设备，则禁用大部分特效
    if (prefersReducedMotion || isMobile) {
        console.log('检测到性能优化设置，已减少动画效果');
        return;
    }
    
    let mouseX = 0;
    let mouseY = 0;
    let trackerVisible = false;
    let particleInterval;
    
    // 鼠标移动跟踪
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        const tracker = document.getElementById('mouseTracker');
        if (tracker) {
            tracker.style.left = mouseX + 'px';
            tracker.style.top = mouseY + 'px';
            
            if (!trackerVisible) {
                tracker.style.display = 'block';
                trackerVisible = true;
            }
        }
        
        // 减少特效频率
        if (Math.random() > 0.8) {
            createLightTrail(mouseX, mouseY);
        }
        
        if (Math.random() > 0.9) {
            createRipple(mouseX, mouseY);
        }
    });
    
    // 鼠标离开窗口时隐藏跟踪器
    document.addEventListener('mouseleave', function() {
        const tracker = document.getElementById('mouseTracker');
        if (tracker) {
            tracker.style.display = 'none';
            trackerVisible = false;
        }
    });
    
    // 鼠标进入窗口时显示跟踪器
    document.addEventListener('mouseenter', function() {
        const tracker = document.getElementById('mouseTracker');
        if (tracker) {
            tracker.style.display = 'block';
            trackerVisible = true;
        }
    });
    
    // 创建底部粒子效果（优化版）
    function createParticles() {
        const effectContainer = document.getElementById('bottomEffect');
        if (!effectContainer) return;
        
        // 限制粒子数量
        const oldParticles = document.querySelectorAll('.particle');
        if (oldParticles.length > 30) {
            for (let i = 0; i < 5; i++) {
                if (oldParticles[i]) {
                    oldParticles[i].remove();
                }
            }
        }
        
        // 减少粒子数量
        const particleCount = 2;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            const size = Math.random();
            const particleType = size < 0.3 ? 'small' : (size < 0.6 ? 'medium' : 'large');
            
            particle.className = `particle ${particleType}`;
            const left = Math.random() * 100;
            particle.style.left = `${left}%`;
            
            const delay = Math.random() * 5;
            particle.style.animationDelay = `${delay}s`;
            
            const randomX = (Math.random() - 0.5) * 100;
            particle.style.setProperty('--random-x', `${randomX}px`);
            
            const colorChoice = Math.random();
            if (colorChoice < 0.3) {
                particle.style.background = 'linear-gradient(135deg, #FB7299, #ff2e63)';
            } else if (colorChoice < 0.6) {
                particle.style.background = 'linear-gradient(135deg, #00A1D6, #3fa7d6)';
            } else {
                particle.style.background = 'linear-gradient(135deg, #FB7299, #00A1D6)';
            }
            
            particle.style.opacity = Math.random() * 0.2 + 0.1; // 降低透明度
            
            effectContainer.appendChild(particle);
            
            // 粒子自动清理
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 8000);
        }
    }
    
    // 创建鼠标移动光效
    function createLightTrail(x, y) {
        const trail = document.createElement('div');
        trail.className = 'light-trail';
        trail.style.left = x + 'px';
        trail.style.top = y + 'px';
        
        const colorChoice = Math.random();
        if (colorChoice < 0.5) {
            trail.style.background = 'linear-gradient(135deg, var(--bili-pink), #ff2e63)';
        } else {
            trail.style.background = 'linear-gradient(135deg, var(--bili-blue), #3fa7d6)';
        }
        
        document.body.appendChild(trail);
        
        setTimeout(() => {
            if (trail.parentNode) {
                trail.remove();
            }
        }, 300);
    }
    
    // 创建波纹效果
    function createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        const size = Math.random() * 30 + 30;
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        
        const colorChoice = Math.random();
        if (colorChoice < 0.33) {
            ripple.style.borderColor = 'rgba(251, 114, 153, 0.2)';
            ripple.style.background = 'rgba(251, 114, 153, 0.05)';
        } else if (colorChoice < 0.66) {
            ripple.style.borderColor = 'rgba(0, 161, 214, 0.2)';
            ripple.style.background = 'rgba(0, 161, 214, 0.05)';
        } else {
            ripple.style.borderColor = 'rgba(251, 114, 153, 0.1)';
            ripple.style.background = 'rgba(0, 161, 214, 0.03)';
        }
        
        ripple.style.animationDelay = Math.random() * 0.3 + 's';
        
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 1000);
    }
    
    // 点击效果
    document.addEventListener('click', function(e) {
        // 减少点击效果的数量
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const offsetX = (Math.random() - 0.5) * 30;
                const offsetY = (Math.random() - 0.5) * 30;
                createRipple(e.clientX + offsetX, e.clientY + offsetY);
            }, i * 50);
        }
        
        // 少量粒子效果
        createClickParticles(e.clientX, e.clientY);
    });
    
    // 创建点击粒子爆炸效果
    function createClickParticles(x, y) {
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle small';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.position = 'fixed';
            particle.style.bottom = 'auto';
            
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 50 + 30;
            const targetX = Math.cos(angle) * distance;
            const targetY = Math.sin(angle) * distance;
            
            const colorChoice = Math.random();
            if (colorChoice < 0.5) {
                particle.style.background = 'linear-gradient(135deg, var(--bili-pink), #ff2e63)';
            } else {
                particle.style.background = 'linear-gradient(135deg, var(--bili-blue), #3fa7d6)';
            }
            
            particle.animate([
                {
                    transform: 'translate(0, 0) scale(1)',
                    opacity: 1
                },
                {
                    transform: `translate(${targetX}px, ${targetY}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)'
            });
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 800);
        }
    }
    
    // 启动粒子生成器（降低频率）
    particleInterval = setInterval(createParticles, 500);
    
    // 页面卸载时清理
    window.addEventListener('beforeunload', function() {
        clearInterval(particleInterval);
        
        // 清理所有特效元素
        document.querySelectorAll('.particle, .light-trail, .ripple').forEach(el => {
            if (el.parentNode) {
                el.remove();
            }
        });
    });
    
    // 鼠标跟踪器点击效果
    document.getElementById('mouseTracker')?.addEventListener('click', function(e) {
        e.stopPropagation();
        
        this.animate([
            { transform: 'translate(-50%, -50%) scale(1)' },
            { transform: 'translate(-50%, -50%) scale(1.3)' },
            { transform: 'translate(-50%, -50%) scale(1)' }
        ], {
            duration: 200,
            easing: 'ease-out'
        });
    });
    
    console.log('鼠标跟踪和底部特效已加载喵～ (◕‿◕✿)');
});