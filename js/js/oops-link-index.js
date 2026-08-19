window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TR4FT7JPDZ');

(function() {
            var urlBox = document.getElementById('urlBox');
            var targetEl = document.getElementById('targetUrl');
            var continueBtn = document.getElementById('continueBtn');
            var trustCheckbox = document.getElementById('trustDomain');

            // 获取 url 参数
            var params = new URLSearchParams(window.location.search);
            var targetUrl = params.get('url');

            if (!targetUrl) {
                targetEl.textContent = '⚠️ 未指定跳转链接';
                continueBtn.disabled = true;
                continueBtn.style.opacity = '0.5';
                continueBtn.style.cursor = 'not-allowed';
                return;
            }

            // 解码并显示
            var decodedUrl = decodeURIComponent(targetUrl);
            targetEl.textContent = decodedUrl;

            // 提取域名用于信任功能
            var domain = '';
            try {
                domain = new URL(decodedUrl).hostname;
            } catch(e) {
                domain = decodedUrl;
            }

            // 点击继续访问
            continueBtn.addEventListener('click', function() {
                if (trustCheckbox.checked && domain) {
                    // 将信任域名存入 localStorage
                    var trusted = JSON.parse(localStorage.getItem('oops_trusted_domains') || '[]');
                    if (!trusted.includes(domain)) {
                        trusted.push(domain);
                        localStorage.setItem('oops_trusted_domains', JSON.stringify(trusted));
                    }
                }
                window.location.href = decodedUrl;
            });
        })();