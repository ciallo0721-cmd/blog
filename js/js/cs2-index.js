window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-TR4FT7JPDZ');

document.addEventListener('DOMContentLoaded', function() {
            const homeBtn = document.getElementById('homeBtn');
            const helpBtn = document.getElementById('helpBtn');
            
            homeBtn.addEventListener('click', function(e) {
                const originalText = homeBtn.innerHTML;
                homeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在返回...';
                setTimeout(() => {
                }, 100);
            });
            
            helpBtn.addEventListener('click', function() {
                const helpDialog = document.createElement('div');
                helpDialog.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                `;
                
                helpDialog.innerHTML = `
                    <div style="
                        background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
                        border-radius: 15px;
                        padding: 30px;
                        max-width: 500px;
                        width: 90%;
                        border: 2px solid #6a11cb;
                        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
                    ">
                        <h3 style="color: #6a11cb; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-life-ring"></i> 需要帮助吗？
                        </h3>
                        <p style="color: #cccccc; margin-bottom: 20px; line-height: 1.6;">
                            如果您反复遇到功能未实现的问题，或需要其他帮助，可以通过以下方式联系我们：
                        </p>
                        <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 25px;">
                            <a href="https://space.bilibili.com/478967440" target="_blank" style="
                                background: rgba(0, 170, 255, 0.2);
                                color: #00aaff;
                                padding: 10px 20px;
                                border-radius: 20px;
                                text-decoration: none;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                            ">
                                <i class="fab fa-bilibili"></i> Bilibili
                            </a>
                            <a href="https://www.douyin.com/user/MS4wLjABAAAA-r_cTw_4f1RrpzWAs3twxb_iWcLYXmNlgGeXbl-2m8k" target="_blank" style="
                                background: rgba(255, 0, 80, 0.2);
                                color: #ff0050;
                                padding: 10px 20px;
                                border-radius: 20px;
                                text-decoration: none;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                            ">
                                <i class="fab fa-tiktok"></i> 抖音
                            </a>
                        </div>
                        <button id="closeHelp" style="
                            background: transparent;
                            color: #ff6b9d;
                            border: 1px solid #ff6b9d;
                            padding: 10px 25px;
                            border-radius: 20px;
                            margin-top: 10px;
                            cursor: pointer;
                            width: 100%;
                        ">
                            <i class="fas fa-times"></i> 关闭
                        </button>
                    </div>
                `;
                
                document.body.appendChild(helpDialog);
                
                document.getElementById('closeHelp').addEventListener('click', function() {
                    document.body.removeChild(helpDialog);
                });
                
                helpDialog.addEventListener('click', function(e) {
                    if (e.target === helpDialog) {
                        document.body.removeChild(helpDialog);
                    }
                });
            });
            
            const robot = document.querySelector('.robot');
            let animationCount = 0;
            
            const animateRobot = () => {
                animationCount++;
                if (animationCount % 3 === 0) {
                    const eyes = document.querySelectorAll('.robot-eye');
                    const colors = ['#ff6b9d', '#6a11cb', '#2575fc', '#4ecdc4'];
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    eyes.forEach(eye => {
                        eye.style.backgroundColor = randomColor;
                    });
                }
            };
            setInterval(animateRobot, 3000);
        });

        (function() {
            var urlParams = new URLSearchParams(window.location.search);
            var attemptedUrl = urlParams.get('url');
            if (attemptedUrl) {
                console.log('用户尝试访问的 URL:', attemptedUrl);
                var urlDisplay = document.createElement('div');
                urlDisplay.className = 'tip-box';
                urlDisplay.style.marginTop = '20px';
                urlDisplay.innerHTML = '<h4><i class="fas fa-link"></i> 您尝试访问的页面</h4>' +
                                       '<p style="color: #a0c8ff; word-break: break-all;">' + 
                                       attemptedUrl + '</p>';
                var errorMessage = document.querySelector('.error-message');
                var container = document.querySelector('.container');
                if (errorMessage && errorMessage.parentNode) {
                    errorMessage.parentNode.insertBefore(urlDisplay, errorMessage.nextSibling);
                } else if (container) {
                    container.appendChild(urlDisplay);
                }
            }
        })();