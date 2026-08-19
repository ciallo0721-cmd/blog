(function() {
        // 检测 IE/低版本浏览器并跳转
        var ua = window.navigator.userAgent;
        var isOldBrowser = /MSIE |Trident\/|Edge\/1[0-7]\./.test(ua) || 
                          /Version\/[1-9]\.[0-9](\s|$)/.test(navigator.appVersion);
        if (isOldBrowser) {
            window.location.href = './oops/index.html?pc=ie';
        }
    })();

(function() {
        var url = new URL(window.location.href);
        var modified = false;

        // 根据时区检测访客所在地，自动添加 ?from= 参数
        if (!url.searchParams.has('from')) {
            var countryCode = 'heyiwei';
            try {
                var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                var tzMap = {
                    'Asia/Shanghai': 'cn',
                    'Asia/Hong_Kong': 'cnhk',
                    'Asia/Macau': 'cnmu',
                    'Asia/Taipei': 'cntw',
                    'Asia/Tokyo': 'jp',
                    'Asia/Seoul': 'kr',
                    'Asia/Singapore': 'sg',
                    'America/New_York': 'us',
                    'America/Chicago': 'us',
                    'America/Denver': 'us',
                    'America/Los_Angeles': 'us',
                    'Europe/London': 'gb',
                    'Europe/Paris': 'fr',
                    'Europe/Berlin': 'de',
                    'Europe/Moscow': 'ru',
                    'Australia/Sydney': 'au',
                    'Australia/Melbourne': 'au',
                    'Asia/Bangkok': 'th',
                    'Asia/Kolkata': 'in',
                    'Asia/Jakarta': 'id',
                    'Asia/Manila': 'ph',
                    'Asia/Ho_Chi_Minh': 'vn',
                    'Asia/Kuala_Lumpur': 'my'
                };
                countryCode = tzMap[tz] || 'heyiwei';
            } catch(e) {}
            url.searchParams.set('from', countryCode);
            modified = true;
        }

        // 检测触屏设备，自动添加 ?touch= 参数
        if (!url.searchParams.has('touch')) {
            var isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
            url.searchParams.set('touch', isTouchDevice ? 'true' : 'false');
            modified = true;
        }

        if (modified) {
            window.location.replace(url.toString());
        }
    })();

window.pageMeta = {
        content_type: 'landing',
        page_name: 'homepage',
        category: '首页'
    };

history.scrollRestoration = 'manual';

window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-TR4FT7JPDZ');

// HTTP 检测：如果是 HTTP 协议，显示安全提示
        (function() {
            function checkHTTP() {
                if (window.location.protocol === 'http:') {
                    // 显示当前 URL
                    var urlSpan = document.getElementById('currentHttpUrl');
                    if (urlSpan) urlSpan.textContent = window.location.href;
                    // 显示提示框
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
            // 暴露到全局
            window.switchToHTTPS = switchToHTTPS;
            window.continueHTTP = continueHTTP;
            // 页面加载后检测
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', checkHTTP);
            } else {
                checkHTTP();
            }
        })();

// 折叠容器展开/收起
        function toggleCollapse(el) {
            var section = el.closest('.collapsible-section');
            if (section) section.classList.toggle('collapsed');
        }

        // 复制推广链接（首页版）
        function copyPromoLinkIndex() {
            var input = document.getElementById('promoLinkIndex');
            var btn = document.getElementById('promoBtnIndex');
            navigator.clipboard.writeText(input.value).then(function() {
                btn.innerHTML = '<i class="fas fa-check"></i> 已复制';
                btn.style.background = '#4CAF50';
                setTimeout(function() {
                    btn.innerHTML = '<i class="fas fa-copy"></i> 复制';
                    btn.style.background = '';
                }, 2500);
            }).catch(function() {
                input.select();
                document.execCommand('copy');
                btn.innerHTML = '<i class="fas fa-check"></i> 已复制';
                btn.style.background = '#4CAF50';
                setTimeout(function() {
                    btn.innerHTML = '<i class="fas fa-copy"></i> 复制';
                    btn.style.background = '';
                }, 2500);
            });
        }

        // ===== Cloudflare Turnstile 验证回调 =====
        function onTurnstileVerifySuccess(token) {
            // Cloudflare验证通过后，直接初始化页面
            console.log('Cloudflare验证通过');
            initArticles();
        }

        // ===== 页面初始化 =====
        document.addEventListener('DOMContentLoaded', function() {
            initArticles();
        });

        // ===== 文章渲染与编辑器 =====
        const articlesPerPage = 6; let currentPage = 1; let totalPages = 0;

        function initArticles() {
            const grid = document.getElementById('articlesGrid'); if (!grid) return;
            if (!window.articlesData || !window.articlesData.getSortedArticles) {
                grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-secondary);"><i class="fas fa-newspaper" style="font-size:3rem;margin-bottom:20px;opacity:0.3;"></i><h3>文章数据加载中喵～</h3><p>请稍候或刷新页面～</p></div>';
                return;
            }
            const articles = window.articlesData.getSortedArticles().slice(0, 3);
            grid.innerHTML = '';
            if (articles.length === 0) {
                grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-secondary);"><i class="fas fa-newspaper" style="font-size:3rem;margin-bottom:20px;opacity:0.3;"></i><h3>暂无文章喵～</h3><p>目前还没有发布文章，请稍后再来查看喵～</p></div>';
                return;
            }
            articles.forEach((article, index) => {
                const card = document.createElement('a');
                // 用 fileName 生成链接（嵌套路径：blog/分区/分区/id/?blog_id=id）
                card.href = 'blog/' + article.fileName + '?blog_id=' + article.id;
                card.className = 'article-card fade-in-up';
                if (article.isPaid) card.classList.add('paid');
                card.style.animationDelay = `${index * 0.1}s`;

                const content = document.createElement('div');
                content.className = 'article-content';

                const meta = document.createElement('div');
                meta.className = 'article-meta';
                const numSpan = document.createElement('span');
                numSpan.className = 'article-number';
                numSpan.textContent = `文章 ${Number(article.id) || 0}`;
                const dateSpan = document.createElement('span');
                dateSpan.className = 'article-date';
                dateSpan.textContent = article.date || '';
                meta.appendChild(numSpan);
                meta.appendChild(dateSpan);

                const h3 = document.createElement('h3');
                h3.textContent = article.title || '';
                if (article.isPaid) {
                    const badge = document.createElement('span');
                    badge.className = 'paid-badge';
                    badge.textContent = '💰 ¥' + (article.price || 0).toFixed(2);
                    h3.appendChild(badge);
                }

                const excerptP = document.createElement('p');
                excerptP.className = 'article-excerpt';
                excerptP.textContent = article.excerpt || '';

                const readMore = document.createElement('span');
                readMore.className = 'read-more';
                readMore.textContent = article.isPaid ? '付费阅读 ' : '阅读全文喵～ ';
                const arrowIcon = document.createElement('i');
                arrowIcon.className = 'fas fa-arrow-right';
                readMore.appendChild(arrowIcon);

                const tagsDiv = document.createElement('div');
                tagsDiv.className = 'article-tags';
                (article.tags || []).forEach(tag => {
                    const tagSpan = document.createElement('span');
                    tagSpan.className = 'article-tag';
                    tagSpan.textContent = tag;
                    tagsDiv.appendChild(tagSpan);
                });

                content.appendChild(meta);
                content.appendChild(h3);
                content.appendChild(excerptP);
                content.appendChild(readMore);
                content.appendChild(tagsDiv);
                card.appendChild(content);
                grid.appendChild(card);
            });
        }

        // 移动端菜单
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
            document.querySelectorAll('.mobile-menu-links a').forEach(link => {
                link.addEventListener('click', function() {
                    mobileMenu.classList.remove('active');
                    menuOverlay.style.display = 'none';
                    document.body.style.overflow = '';
                });
            });
        }

        function showSuccess(m) {
            let d = document.createElement('div');
            d.style.cssText = 'position:fixed;bottom:25px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#4CAF50,#45a049);color:white;padding:15px 25px;border-radius:12px;box-shadow:0 8px 25px rgba(76,175,80,0.3);z-index:1000;display:flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,0.2);max-width:300px;text-align:center;font-weight:500;';
            d.innerHTML = '<i class="fas fa-check-circle"></i> ' + m;
            document.body.appendChild(d);
            setTimeout(() => { if (d.parentNode) document.body.removeChild(d); }, 3000);
        }

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const t = this.getAttribute('href');
                if (t === '#') return;
                const el = document.querySelector(t);
                if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
            });
        });

        window.addEventListener('scroll', function() {
            const nav = document.querySelector('nav');
            if (nav) {
                if (window.scrollY > 50) {
                    nav.style.backgroundColor = 'rgba(255,255,255,0.98)';
                    nav.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
                } else {
                    nav.style.backgroundColor = 'rgba(255,255,255,0.95)';
                    nav.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
                }
            }
        });

        // 游戏卡片展开
        document.addEventListener('DOMContentLoaded', function() {
            const gameCards = document.querySelectorAll('.game-card');
            const closeButtons = document.querySelectorAll('.close-detail');
            gameCards.forEach(card => {
                card.addEventListener('click', function(e) {
                    if (e.target.closest('.close-detail') || e.target.closest('.game-jump-btn')) return;
                    const id = this.getAttribute('data-game-id');
                    const det = document.getElementById('detail-' + id);
                    if (det) {
                        document.querySelectorAll('.game-detail-expanded').forEach(d => d.classList.remove('active'));
                        document.querySelectorAll('.game-card').forEach(c => c.classList.remove('active'));
                        det.classList.add('active');
                        this.classList.add('active');
                        det.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                });
            });
            closeButtons.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const det = this.closest('.game-detail-expanded');
                    const id = det.id.split('-')[1];
                    const card = document.querySelector('[data-game-id="' + id + '"]');
                    det.classList.remove('active');
                    if (card) card.classList.remove('active');
                });
            });
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.game-card') && !e.target.closest('.game-detail-expanded')) {
                    document.querySelectorAll('.game-detail-expanded').forEach(d => d.classList.remove('active'));
                    document.querySelectorAll('.game-card').forEach(c => c.classList.remove('active'));
                }
            });
        });

        // 滚动动画
        document.addEventListener('DOMContentLoaded', function() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('fade-in-up'); });
            }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
            document.querySelectorAll('.game-card, .intro, .about-content, .contact-content, .article-card, .iframe-item').forEach(el => observer.observe(el));
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                document.querySelectorAll('.game-detail-expanded').forEach(d => d.classList.remove('active'));
                document.querySelectorAll('.game-card').forEach(c => c.classList.remove('active'));
            }
            if (e.ctrlKey && e.key === 'h') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
        });

        // 主题切换（已注释）
        // document.addEventListener('DOMContentLoaded', function() {
        //     const themeSwitch = document.getElementById('themeSwitch');
        //     if (themeSwitch) {
        //         const themeIcon = themeSwitch.querySelector('i'); const themeText = themeSwitch.querySelector('span');
        //         if (localStorage.getItem('theme') === 'dark') {
        //             document.body.classList.add('dark-mode');
        //             if (themeIcon) { themeIcon.classList.remove('fa-moon'); themeIcon.classList.add('fa-sun'); }
        //             if (themeText) themeText.textContent = '亮色模式';
        //         }
        //         themeSwitch.addEventListener('click', function() {
        //             document.body.classList.toggle('dark-mode');
        //             if (document.body.classList.contains('dark-mode')) {
        //                 localStorage.setItem('theme','dark');
        //                 if (themeIcon) { themeIcon.classList.remove('fa-moon'); themeIcon.classList.add('fa-sun'); }
        //                 if (themeText) themeText.textContent = '亮色模式';
        //             } else {
        //                 localStorage.setItem('theme','light');
        //                 if (themeIcon) { themeIcon.classList.remove('fa-sun'); themeIcon.classList.add('fa-moon'); }
        //                 if (themeText) themeText.textContent = '暗色模式';
        //             }
        //         });
        //     }
        // });

                // ============================================================
        // 点击/长按/右键特效 — 鼠标移动无特效
        // 左键节流500ms；右键触发特效；长按显示彩色环形进度条
        // ============================================================
        (function initEffects() {
            'use strict';
            var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            var isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
            var urlParams = new URLSearchParams(window.location.search);
            var touchParam = urlParams.get('touch');
            var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (isTouchDevice || touchParam === 'true') {
                document.addEventListener('DOMContentLoaded', function() {
                    document.body.classList.add('touch-device');
                });
            }

            if (isMobile || prefersReducedMotion || isTouchDevice || touchParam === 'true') return;
            if (navigator.deviceMemory && navigator.deviceMemory < 4) return;

            // ── 工具：波纹 ──
            function addRipple(x, y) {
                var r = document.createElement('div');
                r.className = 'ripple';
                r.style.left = x + 'px';
                r.style.top = y + 'px';
                document.body.appendChild(r);
                r.addEventListener('animationend', function() { if (this.parentNode) this.remove(); });
            }

            // ── 工具：点击粒子 ──
            function addParticles(x, y, count) {
                for (var i = 0; i < count; i++) {
                    var p = document.createElement('div');
                    p.className = 'particle small';
                    p.style.left = x + 'px';
                    p.style.top = y + 'px';
                    p.style.position = 'fixed';
                    p.style.bottom = 'auto';
                    var angle = Math.random() * Math.PI * 2;
                    var dist = Math.random() * 30 + 10;
                    var tx = Math.cos(angle) * dist;
                    var ty = Math.sin(angle) * dist;
                    p.animate([
                        { transform: 'translate(0,0) scale(1)', opacity: 0.8 },
                        { transform: 'translate(' + tx + 'px,' + ty + 'px) scale(0)', opacity: 0 }
                    ], { duration: 500, easing: 'cubic-bezier(0.1,0.8,0.2,1)' });
                    document.body.appendChild(p);
                    setTimeout(function() { if (p.parentNode) p.remove(); }, 500);
                }
            }

            // ── 左键特效（500ms 节流） ──
            var lastClickTime = 0;

            document.addEventListener('click', function(e) {
                // 简单节流：最快 500ms 一次
                var now = Date.now();
                if (now - lastClickTime < 500) return;
                lastClickTime = now;

                addRipple(e.clientX, e.clientY);
                addParticles(e.clientX, e.clientY, 4);
            });

            // ── 右键特效 ──
            document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                addRipple(e.clientX, e.clientY);
                addParticles(e.clientX, e.clientY, 6);
            });

            // ── 长按：Canvas 彩色环形进度条 ──
            var COLORS = ['#3366ff','#4CAF50','#f44336','#FF9800','#FF5722','#E91E63'];
            var RING_SIZE = 72;
            var R = 26;
            var CX = RING_SIZE / 2;
            var LINE_W = 6;
            var LOGGED_TIRED = false;

            function createRingCanvas(x, y) {
                var can = document.createElement('canvas');
                can.width = RING_SIZE;
                can.height = RING_SIZE;
                can.style.position = 'fixed';
                can.style.left = (x - RING_SIZE / 2) + 'px';
                can.style.top = (y - RING_SIZE / 2) + 'px';
                can.style.pointerEvents = 'none';
                can.style.zIndex = '99998';
                can.style.animation = 'prAppear 0.15s ease-out forwards';
                can.style.willChange = 'opacity';
                document.body.appendChild(can);
                return can;
            }

            function drawRing(can, progress, colorIdx) {
                var ctx = can.getContext('2d');
                var w = can.width, h = can.height;
                ctx.clearRect(0, 0, w, h);

                // 白色边框（背景圆环）
                ctx.beginPath();
                ctx.arc(CX, CX, R, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                ctx.lineWidth = LINE_W - 1;
                ctx.stroke();

                // 进度弧
                var startAngle = -Math.PI / 2;
                var endAngle = startAngle + Math.PI * 2 * progress;

                // 取当前颜色
                var color = COLORS[colorIdx % COLORS.length];

                ctx.beginPath();
                ctx.arc(CX, CX, R, startAngle, endAngle);
                ctx.strokeStyle = color;
                ctx.lineWidth = LINE_W;
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            var holdTimer = null, ringCanvas = null, ringPos = null;
            var startTime = 0, rafId = 0;
            var isHolding = false;
            var holdX = 0, holdY = 0;
            var DURATION = 1500;  // 填满一圈的时间

            document.addEventListener('mousedown', function(e) {
                // 右键不触发长按
                if (e.button === 2) return;
                holdX = e.clientX; holdY = e.clientY;
                isHolding = true;
                LOGGED_TIRED = false;

                holdTimer = setTimeout(function() {
                    if (!isHolding) return;
                    ringPos = { x: holdX, y: holdY };
                    ringCanvas = createRingCanvas(holdX, holdY);
                    startTime = performance.now();
                    animateRing();
                }, 300);
            });

            function animateRing() {
                if (!isHolding || !ringCanvas) return;
                var elapsed = performance.now() - startTime;
                var totalSec = elapsed / 1000;

                // 每一圈 1.5 秒
                var cycleTime = 1500;
                var progress = (elapsed % cycleTime) / cycleTime;
                var fullCycles = Math.floor(elapsed / cycleTime);

                // 颜色：每圈换一个
                var colorIdx = fullCycles % COLORS.length;

                // 超过 9 秒 (6 圈 * 1.5s) → 全变红
                if (elapsed >= 9000) {
                    colorIdx = 2;  // 红色索引
                }

                drawRing(ringCanvas, progress, colorIdx);

                // 10 秒时 console.log
                if (elapsed >= 10000 && !LOGGED_TIRED) {
                    LOGGED_TIRED = true;
                    console.log('[Effects] 已经按了 ' + Math.round(totalSec) + ' 秒了，不累吗 (。-ω-)zzz');
                }

                rafId = requestAnimationFrame(animateRing);
            }

            function cancelHold() {
                isHolding = false;
                if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
                if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
                if (ringCanvas && ringCanvas.parentNode) {
                    ringCanvas.style.transition = 'opacity 0.2s';
                    ringCanvas.style.opacity = '0';
                    setTimeout(function() {
                        if (ringCanvas && ringCanvas.parentNode) ringCanvas.remove();
                        ringCanvas = null;
                    }, 200);
                }
                ringPos = null;
            }

            document.addEventListener('mouseup', cancelHold);
            document.addEventListener('mouseleave', cancelHold);

            // ── 清理 ──
            window.addEventListener('beforeunload', function() {
                cancelHold();
                document.querySelectorAll('.ripple,.particle').forEach(function(el) {
                    if (el.parentNode) el.remove();
                });
            });

            // ── 低功耗切换 ──
            function updatePowerBtn() {
                var btn = document.getElementById('powerSaveBtn');
                if (!btn) return;
                var isLow = localStorage.getItem('efx_lowpower') === '1';
                btn.innerHTML = isLow
                    ? '<i class="fas fa-bolt"></i><span>特效加速</span>'
                    : '<i class="fas fa-magic"></i><span>特效全开</span>';
            }

            window.toggleLowPowerEffects = function(enable) {
                if (enable === undefined) enable = localStorage.getItem('efx_lowpower') !== '1';
                localStorage.setItem('efx_lowpower', enable ? '1' : '0');
                if (enable) {
                    cancelHold();
                    document.querySelectorAll('.ripple,.particle').forEach(function(el) { if (el.parentNode) el.remove(); });
                }
                updatePowerBtn();
            };

            updatePowerBtn();
            console.log('[Effects] 左键节流500ms | 右键特效 | 长按彩色环');
        })();

        // ===== 后台入口 =====
        function openAdminPanel() {
            sessionStorage.setItem('verify_passed', 'true');
            sessionStorage.setItem('auth_passed', 'true');
            window.location.href = 'https://baike.baidu.com/item/非法侵入计算机信息系统罪/10458746';
        }

        // ===== 中英翻译切换 =====
        let _isEnglish = false;

        const _i18nMap = [
            { sel: 'title', prop: 'text', zh: "ciallo0721-cmd | Ren'Py视觉小说开发者 | 二次元创作博客", en: "ciallo0721-cmd | Ren'Py Visual Novel Developer | Creative Blog" },
            { sel: 'a.logo', prop: 'html', zh: '<i class="fas fa-gamepad"></i> 关于我的说～', en: '<i class="fas fa-gamepad"></i> About Me~' },
            { sel: '#themeSwitch span', prop: 'text', zh: '暗色模式', en: 'Dark Mode', altZh: '亮色模式', altEn: 'Light Mode' },
            { sel: '.intro p', prop: 'text', zh: '这里是 ciallo0721-cmd 的个人创作空间喵～ 用 Ren\'Py 引擎把故事变成游戏、把创意变成作品的说~ 热爱二次元文化，致力于通过视觉小说讲述动人的故事的说~ (๑>ᴗ<๑)', en: "Welcome to ciallo0721-cmd's creative space~ Turning stories into games with Ren'Py! Passionate about anime culture, creating compelling stories through visual novels~ (๑>ᴗ<๑)" },
            { sel: '#about .section-title h2', prop: 'text', zh: '关于我的说～', en: 'About Me~' },
            { sel: '#about .about-text p:nth-child(1)', prop: 'text', zh: "Ciallo～(∠・ω＜ )⌒★ 你好呀！人家是一名热爱二次元文化的Ren'Py视觉小说开发者ciallo0721-cmd哦～专注于创作富有情感深度和故事性的游戏作品呢！我的创作理念是将二次元美学与深刻的故事叙述相结合，通过视觉小说这一媒介，为玩家带来独特的沉浸式体验的说～ (๑´ㅂ`๑)", en: "Ciallo～(∠・ω＜ )⌒★ Hello there! I'm ciallo0721-cmd, a Ren'Py visual novel developer who loves anime culture~ Focused on creating games with emotional depth and compelling narratives! My philosophy is to blend anime aesthetics with deep storytelling, bringing players a unique immersive experience~ (๑´ㅂ`๑)" },
            { sel: '#about .about-text p:nth-child(2)', prop: 'text', zh: '目前人家已经开发了多款不同类型的Ren\'Py游戏，涵盖从温馨日常到心理惊悚的各种题材呢～每一款作品都是我用心创作的成果，希望能与大家分享哦！(๑•̀ㅂ•́)و✧', en: "I've developed several Ren'Py games spanning genres from warm slice-of-life to psychological thriller~ Each work is crafted with heart, and I hope to share them with everyone! (๑•̀ㅂ•́)و✧" },
            { sel: '#about .about-text p:nth-child(3)', prop: 'text', zh: '除了游戏开发，人家也喜欢研究动画制作和角色设计呢～时常在社交媒体上分享我的创作心得和开发过程的说～ (✪ω✪)', en: 'Besides game development, I also enjoy studying animation and character design~ I regularly share my creative insights and development process on social media~ (✪ω✪)' },
            { sel: '.skill-tag:nth-child(1)', prop: 'text', zh: "Ren'Py 引擎", en: "Ren'Py Engine" },
            { sel: '.skill-tag:nth-child(2)', prop: 'text', zh: '角色设计', en: 'Character Design' },
            { sel: '.skill-tag:nth-child(3)', prop: 'text', zh: '故事叙述', en: 'Storytelling' },
            { sel: '.skill-tag:nth-child(4)', prop: 'text', zh: '角色设计', en: 'Character Design' },
            { sel: '#iframes .section-title h2', prop: 'text', zh: '游戏预览喵～', en: 'Game Preview~' },
            { sel: '#iframes .iframe-item:nth-child(1) p.iframe-description', prop: 'text', zh: '外部游戏链接，加载可能较慢喵～ (づ｡◕‿‿◕｡)づ', en: 'External game link, loading may be slow~ (づ｡◕‿‿◕｡)づ' },
            { sel: '#iframes .iframe-item:nth-child(2) p.iframe-description', prop: 'text', zh: '一款关于文学的温馨视觉小说喵～ (◕‿◕✿)', en: 'A warm visual novel about literature~ (◕‿◕✿)' },
            { sel: '#iframes .iframe-item:nth-child(3) p.iframe-description', prop: 'text', zh: '一款视觉小说', en: 'A visual novel' },
            { sel: '#articles .section-title h2', prop: 'text', zh: '技术文章喵～', en: 'Tech Articles~' },
            { sel: '#articles .game-jump-btn', prop: 'html', zh: '<i class="fas fa-book-open"></i> 查看全部文章的说～', en: '<i class="fas fa-book-open"></i> View All Articles~' },
            { sel: '#ai-section .section-title h2', prop: 'text', zh: '病娇签约(demo)', en: 'Yandere Contract (Demo)' },
            { sel: '#ai-section .game-jump-btn', prop: 'html', zh: '<i class="fas fa-external-link-alt"></i> 点击这里', en: '<i class="fas fa-external-link-alt"></i> Click Here' },
            { sel: '#code-editor .section-title h2', prop: 'text', zh: '在线代码编辑器喵～', en: 'Online Code Editor~' },
            { sel: '.code-logo h3', prop: 'text', zh: '在线代码编辑器', en: 'Online Code Editor' },
            { sel: '.code-subtitle', prop: 'text', zh: '支持真实用户输入 - 在浏览器中编写、运行代码的说～', en: 'Supports real user input - Write & run code in your browser~' },
            { sel: '#pythonRunBtn', prop: 'html', zh: '<i class="fas fa-play"></i> 运行代码喵～', en: '<i class="fas fa-play"></i> Run Code~' },
            { sel: '#pythonClearBtn', prop: 'html', zh: '<i class="fas fa-broom"></i> 清空输出喵～', en: '<i class="fas fa-broom"></i> Clear Output~' },
            { sel: '#pythonClearOutputBtn', prop: 'html', zh: '<i class="fas fa-trash-alt"></i> 清空喵～', en: '<i class="fas fa-trash-alt"></i> Clear~' },
            { sel: '.code-panel-title:nth-of-type(1)', prop: 'html', zh: '<i class="fas fa-edit"></i> 代码编辑器喵～', en: '<i class="fas fa-edit"></i> Code Editor~' },
            { sel: '.code-library-title', prop: 'html', zh: '<i class="fas fa-box-open"></i> 常用库（点击插入喵～）', en: '<i class="fas fa-box-open"></i> Common Libraries (click to insert~)' },
            { sel: '#bilibili-space .section-title h2', prop: 'text', zh: '我的Bilibili空间喵～', en: 'My Bilibili Space~' },
            { sel: '#bilibili-space .game-jump-btn', prop: 'html', zh: '<i class="fab fa-bilibili"></i> 直接打开B站空间', en: '<i class="fab fa-bilibili"></i> Open Bilibili Space' },
            { sel: '#douyin-space .section-title h2', prop: 'text', zh: '我的抖音空间喵～', en: 'My Douyin Space~' },
            { sel: '#douyin-space .game-jump-btn', prop: 'html', zh: '<i class="fab fa-tiktok"></i> 直接打开', en: '<i class="fab fa-tiktok"></i> Open Now' },
            { sel: '#contact .section-title h2', prop: 'text', zh: '联系我的说～', en: 'Contact Me~' },
            { sel: '#contact .contact-content > p:nth-child(1)', prop: 'text', zh: '如果对我的作品感兴趣，想要了解更多信息，或者有合作意向的话，欢迎通过以下方式联系人家哦～ (｡･ω･｡)ﾉ♡', en: "If you're interested in my work, want to learn more, or have collaboration ideas, feel free to contact me~ (｡･ω･｡)ﾉ♡" },
            { sel: '#contact .contact-content > p:nth-child(3)', prop: 'text', zh: '扫描上方二维码添加我的微信吧～ ٩(◕‿◕｡)۶', en: 'Scan the QR code above to add my WeChat~ ٩(◕‿◕｡)۶' },
            { sel: '#changelog .section-title h2', prop: 'text', zh: '更新记录喵～', en: 'Changelog~' },
            { sel: '.footer-logo', prop: 'text', zh: 'ciallo0721-cmd', en: 'ciallo0721-cmd' },
            { sel: 'footer p:not(.copyright)', prop: 'text', zh: '感谢访问我的个人博客！期待与您交流游戏开发心得哦～ (๑˃̵ᴗ˂̵)و', en: 'Thanks for visiting my personal blog! Looking forward to discussing game development with you~ (๑˃̵ᴗ˂̵)و' },
            { sel: '.copyright', prop: 'text', zh: '© 2026 ciallo0721-cmd. 保留所有权利喵～', en: '© 2026 ciallo0721-cmd. All rights reserved~' },
            { sel: '#translateBtn', prop: 'text', zh: '🌐 Translate to English', en: '🌐 切换回中文' },
            { sel: '.nav-links li:nth-child(1) a', prop: 'html', zh: '<i class="fas fa-newspaper"></i> 文章喵～', en: '<i class="fas fa-newspaper"></i> Articles~' },
            { sel: '.nav-links li:nth-child(2) a', prop: 'html', zh: '<i class="fas fa-history"></i> 更新记录喵～', en: '<i class="fas fa-history"></i> Changelog~' },
            { sel: '.nav-links li:nth-child(3) a', prop: 'html', zh: '<i class="fas fa-gamepad"></i> 游戏预览喵～', en: '<i class="fas fa-gamepad"></i> Game Preview~' },
            { sel: '.nav-links li:nth-child(5) a', prop: 'html', zh: '<i class="fab fa-tiktok"></i> 抖音的说～', en: '<i class="fab fa-tiktok"></i> Douyin~' },
            { sel: '.nav-links li:nth-child(6) a', prop: 'html', zh: '<i class="fas fa-heart"></i> 爱发电', en: '<i class="fas fa-heart"></i> Afdian Support' },
            { sel: '.nav-links li:nth-child(7) a', prop: 'html', zh: '<i class="fas fa-code"></i> 在线编辑器', en: '<i class="fas fa-code"></i> Code Editor' },
            { sel: '.nav-links li:nth-child(8) a', prop: 'html', zh: '<i class="fas fa-wand-magic-sparkles"></i> 工具', en: '<i class="fas fa-wand-magic-sparkles"></i> Tools' },
            { sel: '.mobile-menu-links li:nth-child(1) a', prop: 'html', zh: '<i class="fas fa-newspaper"></i> 文章喵～', en: '<i class="fas fa-newspaper"></i> Articles~' },
            { sel: '.mobile-menu-links li:nth-child(2) a', prop: 'html', zh: '<i class="fas fa-history"></i> 更新记录喵～', en: '<i class="fas fa-history"></i> Changelog~' },
            { sel: '.mobile-menu-links li:nth-child(3) a', prop: 'html', zh: '<i class="fas fa-gamepad"></i> 游戏预览喵～', en: '<i class="fas fa-gamepad"></i> Game Preview~' },
            { sel: '.mobile-menu-links li:nth-child(5) a', prop: 'html', zh: '<i class="fab fa-tiktok"></i> 抖音的说～', en: '<i class="fab fa-tiktok"></i> Douyin~' },
            { sel: '.mobile-menu-links li:nth-child(6) a', prop: 'html', zh: '<i class="fas fa-heart"></i> 爱发电', en: '<i class="fas fa-heart"></i> Afdian Support' },
            { sel: '.mobile-menu-links li:nth-child(7) a', prop: 'html', zh: '<i class="fas fa-code"></i> 在线编辑器', en: '<i class="fas fa-code"></i> Code Editor' },
            { sel: '.mobile-menu-links li:nth-child(8) a', prop: 'html', zh: '🎬 新番数据库', en: '🎬 Anime DB' },
            { sel: '#iframes .iframe-item:nth-child(1) .game-jump-btn', prop: 'html', zh: '<i class="fas fa-external-link-alt"></i> 在新标签页打开：合成大西瓜', en: '<i class="fas fa-external-link-alt"></i> Open in new tab: Watermelon Merge' },
            { sel: '#iframes .iframe-item:nth-child(2) .game-jump-btn', prop: 'html', zh: '<i class="fas fa-external-link-alt"></i> 在新标签页打开：周末的诗篇', en: '<i class="fas fa-external-link-alt"></i> Open in new tab: Weekend Poems' },
            { sel: '#iframes .iframe-item:nth-child(3) .game-jump-btn', prop: 'html', zh: '<i class="fas fa-external-link-alt"></i> 在新标签页打开：来东北指定没有你好果子吃', en: "<i class='fas fa-external-link-alt'></i> Open in new tab: Come to Northeast (You'll Regret It)" },
            { sel: '#bilibili-space .section-title p', prop: 'text', zh: '点击下方iframe直接访问我的B站主页 (๑>ᴗ<๑)', en: 'Click the iframe below to visit my Bilibili homepage (๑>ᴗ<๑)' },
            { sel: '#bilibili-space:nth-of-type(2) .section-title p', prop: 'text', zh: '点击下方按钮直接访问我的抖音主页 (๑>ᴗ<๑)', en: 'Click the button below to visit my Douyin homepage (๑>ᴗ<๑)' },
        ];

        function toggleTranslate() {
            _isEnglish = !_isEnglish;
            _i18nMap.forEach(function(item) {
                const els = document.querySelectorAll(item.sel);
                if (!els.length) return;
                els.forEach(function(el) {
                    if (item.prop === 'text') {
                        const cur = el.textContent.trim();
                        if (_isEnglish) {
                            if (item.altZh && cur === item.altZh) { el.textContent = item.altEn; }
                            else if (cur === item.zh || cur.includes(item.zh.substring(0,10))) { el.textContent = item.en; }
                            else { el.textContent = item.en; }
                        } else {
                            if (item.altEn && cur === item.altEn) { el.textContent = item.altZh; }
                            else { el.textContent = item.zh; }
                        }
                    } else if (item.prop === 'html') {
                        if (_isEnglish) { el.innerHTML = item.en; }
                        else { el.innerHTML = item.zh; }
                    }
                });
            });
            document.querySelectorAll('.read-more').forEach(function(el) {
                const icon = el.querySelector('i');
                el.textContent = _isEnglish ? 'Read More~ ' : '阅读全文喵～ ';
                if (icon) el.appendChild(icon);
            });
            document.querySelectorAll('.article-number').forEach(function(el) {
                el.textContent = el.textContent.replace(/^(文章|Article)\s+/, (_isEnglish ? 'Article ' : '文章 '));
            });
            if (_isEnglish) {
                document.querySelectorAll('.timeline-date').forEach(function(el) {
                    el.setAttribute('data-zh-date', el.innerHTML);
                    el.innerHTML = el.innerHTML.replace(/(\d+)年(\d+)月(\d+)日/, function(m,y,mo,d){
                        const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                        return months[parseInt(mo)-1]+' '+d+', '+y;
                    });
                });
            } else {
                document.querySelectorAll('.timeline-date').forEach(function(el) {
                    const orig = el.getAttribute('data-zh-date');
                    if (orig) el.innerHTML = orig;
                });
            }
            document.documentElement.lang = _isEnglish ? 'en' : 'zh-CN';
        }

window.SITE_START = new Date('2025-10-20T00:00:00+08:00');
    document.addEventListener('DOMContentLoaded', function() {

        // 更新当前时间（北京时间）
        function updateCurrentTime() {
            var now = new Date();
            var timeStr = now.toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            var el = document.getElementById('currentTime');
            if (el) el.textContent = timeStr;
        }

        // 计算已运行天数
        function updateRunningDays() {
            var now = new Date();
            var diffMs = now.getTime() - window.SITE_START.getTime();
            var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            var el = document.getElementById('siteRunningDays');
            if (el) el.textContent = diffDays + ' 天';
        }

        // 更新网站状态
        function updateSiteStatus() {
            var dot = document.getElementById('siteStatusDot');
            var text = document.getElementById('siteStatusText');
            if (!dot || !text) return;

            var status = '正常';
            try {
                if (window.dynamicData && window.dynamicData.siteStats && window.dynamicData.siteStats.siteStatus) {
                    status = window.dynamicData.siteStats.siteStatus;
                }
            } catch(e) {}

            if (status === '正常') {
                dot.className = 'status-dot normal';
                text.textContent = '正常';
            } else {
                dot.className = 'status-dot fault';
                text.textContent = '故障';
            }
        }

        // 初始化
        updateCurrentTime();
        updateRunningDays();
        updateSiteStatus();

        // 每秒更新时间
        setInterval(updateCurrentTime, 1000);
        // 每小时更新运行天数
        setInterval(updateRunningDays, 3600000);
    });

document.addEventListener('DOMContentLoaded', function() {
        var el = document.getElementById('dynamicFooterInfo');
        if (!el) return;
        function render() {
            try {
                if (typeof window.dynamicData === 'undefined') {
                    el.textContent = '';
                    return;
                }
                var d = window.dynamicData;
                var parts = [];
                // 实时计算运行天数
                try {
                    var _now = new Date();
                    var _start = window.SITE_START || new Date('2025-10-20T00:00:00+08:00');
                    var _diffDays = Math.floor((_now.getTime() - _start.getTime()) / (1000 * 60 * 60 * 24));
                    parts.push('已运行 ' + _diffDays + ' 天');
                } catch(e) {}
                if (d.siteStats && d.siteStats.articles) {
                    parts.push(d.siteStats.articles + ' 篇文章');
                }
                if (d.currentTime && d.currentTime.datetime) {
                    parts.push('数据更新: ' + d.currentTime.datetime);
                }
                el.textContent = parts.length ? parts.join(' | ') : '';
            } catch(e) { el.textContent = ''; }
        }
        render();
        // 每分钟更新一次前端显示的时间（如果dynamicData已加载）
        setInterval(render, 60000);
    });

(function() {
    function showAnnouncement() {
        var todayKey = 'ann_hide_' + new Date().toISOString().slice(0,10);
        if (localStorage.getItem(todayKey)) return; // 今天已关闭，不显示
        var modal = document.getElementById('announcementModal');
        if (modal) { modal.style.display = 'flex'; }
    }
    window.closeAnnouncement = function() {
        var modal = document.getElementById('announcementModal');
        if (modal) modal.style.display = 'none';
        if (document.getElementById('announceNoMore') && document.getElementById('announceNoMore').checked) {
            var todayKey = 'ann_hide_' + new Date().toISOString().slice(0,10);
            localStorage.setItem(todayKey, '1');
        }
    };
    // 点遮罩关闭
    document.getElementById('announcementModal').addEventListener('click', function(e) {
        if (e.target === this) closeAnnouncement();
    });
    // 等验证通过后再显示
    var checkReady = setInterval(function() {
        if (document.body.classList.contains('auth-passed')) {
            clearInterval(checkReady);
            setTimeout(showAnnouncement, 800);
        }
    }, 300);
})();

// 移除骨架屏
    document.addEventListener('DOMContentLoaded', function() {
        var el = document.getElementById('skeletonOverlay');
        if (el) {
            el.classList.add('hidden');
            setTimeout(function() { el.remove(); }, 600);
        }
    });

// 联系表单：发送邮件函数
        function sendEmail() {
            var name = document.getElementById('senderName').value.trim();
            var email = document.getElementById('senderEmail').value.trim();
            var message = document.getElementById('messageContent').value.trim();

            if (!message) {
                alert('请填写消息内容喵～');
                return false;
            }

            var subject = '来自网站访客的消息';
            var body = '访客消息：\n';
            if (name) body += '姓名：' + name + '\n';
            if (email) body += '邮箱：' + email + '\n';
            body += '\n消息内容：\n' + message;

            // mailto 链接：浏览器会自动把 \n 编码为 %0A
            var mailtoLink = 'mailto:ciallo0721cmd@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
            window.location.href = mailtoLink;

            // 清空表单
            document.getElementById('contactForm').reset();
            alert('邮件客户端已打开，请手动发送喵～ (๑>ᴗ<๑)');

            return false;
        }

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; window.scrollTo(0, 0);

(function() {
        var now = new Date();
        var cstOffset = 8 * 60;
        var localOffset = now.getTimezoneOffset();
        var cst = new Date(now.getTime() + (cstOffset + localOffset) * 60000);
        if (cst.getMonth() === 8 && cst.getDate() === 21) {
            var audio = document.getElementById('bg-music');
            audio.volume = 0.4;
            audio.play().catch(function() {
                var playOnInteraction = function() {
                    audio.play();
                    document.removeEventListener('click', playOnInteraction);
                    document.removeEventListener('touchstart', playOnInteraction);
                };
                document.addEventListener('click', playOnInteraction);
                document.addEventListener('touchstart', playOnInteraction);
            });
        }
    })();

    // 停止背景音乐
    function stopMusic() {
        var audio = document.getElementById('bg-music');
        audio.pause();
        audio.currentTime = 0;
    }
        // ===== 玻璃拟态：鼠标跟随光晕 =====
        (function () {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile/i.test(navigator.userAgent)) return;
            var g = document.createElement('div');
            g.style.cssText = 'position:fixed;left:0;top:0;width:320px;height:320px;border-radius:50%;pointer-events:none;z-index:-1;background:radial-gradient(circle,rgba(255,255,255,0.5),rgba(236,72,153,0.14) 45%,transparent 70%);mix-blend-mode:screen;';
            document.body.appendChild(g);
            var mx = window.innerWidth / 2, my = window.innerHeight / 2, cx = mx, cy = my;
            document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
            (function loop() {
                cx += (mx - cx) * 0.1; cy += (my - cy) * 0.1;
                g.style.transform = 'translate(' + (cx - 160) + 'px,' + (cy - 160) + 'px)';
                requestAnimationFrame(loop);
            })();
        })();

        // ===== 主页一言(打字机效果) =====
        // 通过同源 Pages Function /api/quote 代理 senvinn.cn，绕过 CORS/CSP 限制
        (function () {
            var tagline = document.getElementById('tagline');
            if (!tagline) return;

            function typeWriter(el, text, speed, done) {
                var i = 0;
                el.textContent = '';
                el.classList.add('type-cursor');
                var timer = setInterval(function () {
                    el.textContent = text.substring(0, ++i);
                    if (i >= text.length) {
                        clearInterval(timer);
                        if (done) done();
                    }
                }, speed);
            }

            fetch('/api/quote')
                .then(function (r) { return r.json(); })
                .then(function (res) {
                    if (!res || res.code !== 200 || !res.data) throw new Error('bad quote response');
                    var q = res.data;
                    var full = q.hitokoto + (q.from ? ' —— ' + (q.from_who || q.from) : '');
                    typeWriter(tagline, full, 90, function () {
                        setTimeout(function () { tagline.classList.remove('type-cursor'); }, 4000);
                    });
                })
                .catch(function () {
                    // 接口不可用时保留 HTML 中的原始 tagline 文案
                });
        })();
