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

// 自动填写最后更新时间
    const timeEl = document.getElementById('lastUpdateTime');
    if (timeEl) {
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        timeEl.textContent = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    }

    // 根据全局状态框的 class 自动同步图标、标题和描述（只需修改一个 class）
    function syncGlobalStatusByClass() {
        const statusBox = document.getElementById('globalStatusBox');
        if (!statusBox) return;

        // 获取当前状态类型
        let statusType = 'ok'; // 默认正常
        if (statusBox.classList.contains('status-warn')) {
            statusType = 'warn';
        } else if (statusBox.classList.contains('status-error')) {
            statusType = 'error';
        } else if (statusBox.classList.contains('status-gray')) {
            statusType = 'gray';
        } else if (statusBox.classList.contains('status-ok')) {
            statusType = 'ok';
        }

        // 图标元素和文本元素
        const iconEl = document.getElementById('globalStatusIcon');
        const titleEl = document.getElementById('globalStatusTitle');
        const descEl = document.getElementById('globalStatusDesc');

        // 根据状态类型映射内容
        const mapping = {
            ok: {
                iconClass: 'fas fa-circle-check',
                title: '所有系统正常运行喵～',
                desc: '当前所有页面与功能均可正常访问，没有已知故障。(๑˃̵ᴗ˂̵)و'
            },
            warn: {
                iconClass: 'fas fa-exclamation-triangle',
                title: '部分系统出现小问题喵～',
                desc: '发现一些小问题（错别字、引用错误等），不影响正常访问，正在修复中喵～'
            },
            error: {
                iconClass: 'fas fa-circle-exclamation',
                title: '系统出现严重问题喵！',
                desc: '当前存在严重问题（无法正常访问、界面错位等），正在全力抢修，非常抱歉！'
            },
            gray: {
                iconClass: 'fas fa-minus-circle',
                title: '暂无状态记录喵～',
                desc: '还没有最近的更新状态记录，等下次更新网站后就会出现在这里啦 (。-ω-)zzz'
            }
        };

        const current = mapping[statusType];
        if (iconEl) {
            // 移除现有图标类，添加新图标类（保留 fas 基础类）
            iconEl.className = ''; 
            iconEl.classList.add(...current.iconClass.split(' '));
        }
        if (titleEl) titleEl.textContent = current.title;
        if (descEl) descEl.textContent = current.desc;
    }

    // 页面加载完成后执行同步
    window.addEventListener('DOMContentLoaded', syncGlobalStatusByClass);