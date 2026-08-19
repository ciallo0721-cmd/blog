// ===== 404 页面——JS =====

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-TR4FT7JPDZ');

document.addEventListener('DOMContentLoaded', function() {
    // ---- ASCII 故障线 ----
    const ascii = document.getElementById('asciiArt');
    if (ascii) {
        // 添加 glitch 类触发扫描线动画
        ascii.classList.add('glitch');
        // 动态插入三条故障闪烁线
        for (let i = 0; i < 3; i++) {
            const line = document.createElement('div');
            line.className = 'glitch-line';
            ascii.appendChild(line);
        }
    }

    // ---- 数据背景（0/1浮层） ----
    const bg = document.getElementById('dataBG');
    if (bg) {
        let text = '';
        for (let row = 0; row < 40; row++) {
            for (let col = 0; col < 60; col++) {
                // 随机在 0 和 1 之间，偶尔插入一些 4
                const r = Math.random();
                if (r < 0.4) text += '0';
                else if (r < 0.8) text += '1';
                else text += '4';
            }
            text += '\n';
        }
        bg.textContent = text;
    }

    // ---- 帮助按钮 ----
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
        helpBtn.addEventListener('click', function() {
            const overlay = document.createElement('div');
            overlay.className = 'help-overlay';

            overlay.innerHTML = `
                <div class="help-dialog">
                    <h3>> 需要帮助？</h3>
                    <p>如果你反复遇到页面缺失的问题，或者发现网站出了 bug，欢迎联系我喵～</p>
                    <div class="help-links">
                        <a href="https://space.bilibili.com/478967440" target="_blank">Bilibili</a>
                        <a href="https://www.douyin.com/user/MS4wLjABAAAA-r_cTw_4f1RrpzWAs3twxb_iWcLYXmNlgGeXbl-2m8k" target="_blank">抖音</a>
                    </div>
                    <button class="help-close">[ 关闭 ]</button>
                </div>
            `;

            document.body.appendChild(overlay);

            overlay.querySelector('.help-close').addEventListener('click', function() {
                document.body.removeChild(overlay);
            });
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                }
            });
        });
    }

    // ---- 按钮反馈 ----
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', function(e) {
            const orig = homeBtn.innerHTML;
            homeBtn.innerHTML = '> 正在返回 ...';
            setTimeout(() => { homeBtn.innerHTML = orig; }, 2000);
        });
    }

    // ---- 捕获尝试访问的 URL ----
    (function() {
        var params = new URLSearchParams(window.location.search);
        var attempted = params.get('url');
        if (attempted) {
            console.log('用户尝试访问:', attempted);
            var detail = document.getElementById('errorDetails');
            if (detail) {
                detail.style.display = 'block';
                detail.querySelector('code').textContent = attempted;
            }
        }
    })();
});
