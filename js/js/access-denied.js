window.location.replace('./index.html');

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

// 检查是否为美国IP（通过 URL 参数或 localStorage）
        window.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const fromUS = urlParams.get('from') === 'us';
            
            if (fromUS) {
                console.log('用户来自美国，已拒绝访问');
            }

            // 提供"强制访问"链接（仅供测试）
            const container = document.querySelector('.container');
            const testLink = document.createElement('a');
            testLink.href = './index.html?bypass_geo=1';
            testLink.textContent = '（测试）绕过地理限制';
            testLink.style.cssText = 'display:block;margin-top:20px;font-size:0.8rem;color:rgba(255,255,255,0.3);text-decoration:none;';
            container.appendChild(testLink);
        });