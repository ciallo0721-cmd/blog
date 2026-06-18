/**
 * index41.js - 愚人节恶作剧脚本
 * 功能：
 * 1. 初始 alert 弹窗（只有确认按钮）
 * 2. 点击确认后显示"愚人节快乐"
 * 3. 关闭当前窗口并循环打开6个新窗口
 * 4. 性能监测：如果发现不对劲自动关闭
 * 5. 紧急停止：在弹窗中输入 "yessir" 关闭所有弹窗
 */

(function() {
    'use strict';

    // 配置
    const CONFIG = {
        windowCount: 6,           // 每次打开的窗口数量
        loopInterval: 500,         // 循环间隔（毫秒）
        maxLoops: 10,              // 最大循环次数（防止无限循环）
        performanceCheck: true,     // 是否启用性能监测
        cpuThreshold: 90,          // CPU 使用率阈值（百分比）
        memoryThreshold: 500,      // 内存使用阈值（MB）
    };

    // 状态管理
    let loopCount = 0;
    let windows = [];  // 存储打开的窗口引用
    let isStopped = false;
    let monitorInterval = null;

    // 显示初始 alert
    function showInitialAlert() {
        alert('⚠️ 警告 ⚠️\n\n你激活了一个愚人节恶作剧！\n\n点击确定继续...');
        startPrank();
    }

    // 开始恶作剧
    function startPrank() {
        alert('🎉 愚人节快乐！🎉\n\n现在开始表演...\n\n提示：输入 "yessir" 可以停止');

        // 启动性能监测
        if (CONFIG.performanceCheck) {
            startPerformanceMonitor();
        }

        // 启动循环
        runLoop();
    }

    // 执行循环
    function runLoop() {
        if (isStopped || loopCount >= CONFIG.maxLoops) {
            cleanup();
            return;
        }

        loopCount++;

        // 关闭之前的窗口
        closeAllWindows();

        // 打开新窗口
        for (let i = 0; i < CONFIG.windowCount; i++) {
            try {
                const win = window.open('', `prank_window_${loopCount}_${i}`, 
                    'width=400,height=300,left=' + (i * 100) + ',top=' + (i * 100));
                
                if (win) {
                    // 写入内容
                    win.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>🎉 愚人节快乐 🎉</title>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    height: 100vh;
                                    margin: 0;
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    color: white;
                                    text-align: center;
                                    animation: pulse 1s infinite;
                                }
                                @keyframes pulse {
                                    0%, 100% { transform: scale(1); }
                                    50% { transform: scale(1.05); }
                                }
                                h1 { font-size: 2em; }
                                .stop-input {
                                    margin-top: 20px;
                                    padding: 10px;
                                    font-size: 16px;
                                    border: none;
                                    border-radius: 5px;
                                    text-align: center;
                                }
                                .stop-btn {
                                    margin-top: 10px;
                                    padding: 10px 20px;
                                    font-size: 16px;
                                    background: #ff6b6b;
                                    color: white;
                                    border: none;
                                    border-radius: 5px;
                                    cursor: pointer;
                                }
                                .stop-btn:hover { background: #ee5a52; }
                            </style>
                        </head>
                        <body>
                            <div>
                                <h1>🎉 愚人节快乐 🎉</h1>
                                <p>窗口 ${loopCount} - ${i + 1}</p>
                                <p>循环次数: ${loopCount}/${CONFIG.maxLoops}</p>
                                <input type="text" class="stop-input" id="stopInput" placeholder="输入 yessir 停止">
                                <br>
                                <button class="stop-btn" onclick="stopPrank()">停止恶作剧</button>
                            </div>
                            <script>
                                function stopPrank() {
                                    const input = document.getElementById('stopInput').value;
                                    if (input === 'yessir') {
                                        alert('✅ 已停止！');
                                        window.opener.postMessage('STOP_PRANK', '*');
                                        window.close();
                                    } else {
                                        alert('❌ 密码错误！');
                                    }
                                }
                                
                                // 监听回车键
                                document.getElementById('stopInput').addEventListener('keypress', function(e) {
                                    if (e.key === 'Enter') {
                                        stopPrank();
                                    }
                                });
                            <\/script>
                        </body>
                        </html>
                    `);
                    win.document.close();
                    windows.push(win);
                }
            } catch (e) {
                console.error('打开窗口失败:', e);
            }
        }

        // 继续循环
        if (!isStopped && loopCount < CONFIG.maxLoops) {
            setTimeout(runLoop, CONFIG.loopInterval);
        }
    }

    // 启动性能监测
    function startPerformanceMonitor() {
        monitorInterval = setInterval(() => {
            // 检查内存使用（如果浏览器支持）
            if (performance.memory) {
                const memoryMB = performance.memory.usedJSHeapSize / 1024 / 1024;
                if (memoryMB > CONFIG.memoryThreshold) {
                    console.warn('⚠️ 内存使用过高，自动停止');
                    stopAll();
                }
            }

            // 检查是否卡顿（简单方法）
            const start = performance.now();
            // 执行一个简单任务
            for (let i = 0; i < 100000; i++) {}
            const end = performance.now();
            
            if (end - start > 100) {  // 如果超过100ms，说明卡顿了
                console.warn('⚠️ 检测到卡顿，自动停止');
                stopAll();
            }
        }, 2000);  // 每2秒检查一次
    }

    // 停止所有
    function stopAll() {
        isStopped = true;
        
        // 关闭所有窗口
        closeAllWindows();
        
        // 停止性能监测
        if (monitorInterval) {
            clearInterval(monitorInterval);
        }
        
        alert('🛑 已自动停止恶作剧（检测到性能问题）');
    }

    // 关闭所有窗口
    function closeAllWindows() {
        windows.forEach(win => {
            try {
                if (win && !win.closed) {
                    win.close();
                }
            } catch (e) {
                console.error('关闭窗口失败:', e);
            }
        });
        windows = [];
    }

    // 清理
    function cleanup() {
        closeAllWindows();
        if (monitorInterval) {
            clearInterval(monitorInterval);
        }
        console.log('✅ 恶作剧结束');
    }

    // 监听停止消息
    window.addEventListener('message', (event) => {
        if (event.data === 'STOP_PRANK') {
            stopAll();
        }
    });

    // 页面加载完成后启动
    if (window.addEventListener) {
        window.addEventListener('load', showInitialAlert);
    } else {
        window.attachEvent('onload', showInitialAlert);
    }

})();
