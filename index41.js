/**
 * index41.js - 愚人节恶作剧病毒 v3.0
 * 
 * 🦠 病毒特性：
 *   1. 点击页面按钮启动（绕过浏览器拦截）
 *   2. 疯狂打开弹窗，每个都是病毒风格
 *   3. 弹窗内有输入框，输入 "yessir" 可停止
 *   4. 性能监测：卡顿自动停止
 *   5. 闪烁的警告、假系统提示
 */

(function() {
    'use strict';

    // ============ 配置 ============
    const CONFIG = {
        windowsPerBatch: 6,      // 每批打开窗口数
        batchInterval: 1000,      // 批次间隔（毫秒）
        maxBatches: 8,            // 最大批次数
        autoStopMemory: 400,      // 内存阈值（MB）
    };

    // ============ 状态 ============
    let batchCount = 0;
    let allWindows = [];
    let isRunning = false;
    let stopSignal = false;

    // ============ 病毒消息库 ============
    const VIRUS_MESSAGES = [
        '⚠️ 警告：您的电脑已感染病毒！',
        '🦠 病毒正在复制...',
        '💀 系统即将崩溃...',
        '😈 哈哈哈，你被骗了！',
        '🎭 愚人节快乐！',
        '❌ 无法关闭此窗口！',
        '🔥 正在删除所有文件...',
        '💣 炸弹即将引爆...',
        '🤡 你是傻瓜！',
        '🚨 紧急警报！',
        '⚡ 系统损坏！',
        '🎪 Welcome to the show!',
    ];

    // ============ 创建启动按钮 ============

    function createLaunchButton() {
        const btn = document.createElement('button');
        btn.id = 'virus-launch-btn';
        btn.innerHTML = `
            <div style="font-size: 36px; margin-bottom: 10px;">🎁</div>
            <div style="font-size: 28px; font-weight: bold; margin-bottom: 8px;">
                点击领取惊喜礼物！
            </div>
            <div style="font-size: 16px; opacity: 0.9;">
                ✨ 免费 ✨ 限量 ✨ 绝版 ✨
            </div>
            <div style="font-size: 12px; margin-top: 8px; opacity: 0.7;">
                ⚠️ 仅限前 100 名用户
            </div>
        `;
        btn.style.cssText = `
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            padding: 30px 50px;
            background: linear-gradient(135deg, #ff6b6b, #ffa500, #ffff00);
            color: #fff;
            border: 4px solid #fff;
            border-radius: 20px;
            cursor: pointer;
            z-index: 99999;
            box-shadow: 
                0 0 30px rgba(255, 107, 107, 0.8),
                0 0 60px rgba(255, 165, 0, 0.6),
                inset 0 0 30px rgba(255, 255, 255, 0.3);
            animation: btnPulse 1.5s infinite, btnFloat 3s ease-in-out infinite;
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            transition: all 0.3s ease;
        `;

        // 鼠标悬停效果
        btn.onmouseover = () => {
            btn.style.transform = 'translate(-50%, -50%) scale(1.1)';
            btn.style.boxShadow = '0 0 50px rgba(255, 107, 107, 1), 0 0 100px rgba(255, 165, 0, 0.8)';
        };
        btn.onmouseout = () => {
            btn.style.transform = 'translate(-50%, -50%) scale(1)';
            btn.style.boxShadow = '0 0 30px rgba(255, 107, 107, 0.8), 0 0 60px rgba(255, 165, 0, 0.6)';
        };

        // 添加动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes btnPulse {
                0%, 100% { 
                    background: linear-gradient(135deg, #ff6b6b, #ffa500, #ffff00);
                }
                50% { 
                    background: linear-gradient(135deg, #ffa500, #ffff00, #ff6b6b);
                }
            }
            @keyframes btnFloat {
                0%, 100% { margin-top: 0px; }
                50% { margin-top: -10px; }
            }
        `;
        document.head.appendChild(style);

        btn.onclick = () => {
            btn.remove();  // 移除按钮
            startVirus();  // 启动病毒
        };

        document.body.appendChild(btn);
        console.log('%c💡 点击页面上的"惊喜礼物"按钮启动！', 'color: #f00; font-size: 16px;');
    }

    // ============ 启动病毒 ============

    function startVirus() {
        if (isRunning) return;
        isRunning = true;
        stopSignal = false;
        batchCount = 0;

        console.log('%c🦠 病毒已激活！', 'color: #f00; font-size: 24px; font-weight: bold;');
        console.log('%c💡 在每个弹窗中输入 "yessir" 可停止', 'color: #ff0;');

        // 显示初始警告
        showWarning();

        // 启动批次
        setTimeout(() => startBatch(), 1000);

        // 启动性能监测
        startMonitor();
    }

    // ============ 初始警告 ============

    function showWarning() {
        // 创建全屏警告（在当前页面）
        const warning = document.createElement('div');
        warning.id = 'virus-warning';
        warning.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.9);
            z-index: 100000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #f00;
            font-family: Arial, sans-serif;
            animation: warnFlash 0.3s infinite;
        `;

        warning.innerHTML = `
            <h1 style="font-size: 60px; margin-bottom: 20px; animation: textFlash 0.5s infinite;">
                ⚠️ 病毒警告 ⚠️
            </h1>
            <p style="font-size: 30px; margin-bottom: 30px;">您的电脑已被感染！</p>
            <p style="font-size: 20px; color: #ff0;">正在打开弹窗...</p>
        `;

        // 添加动画
        const animStyle = document.createElement('style');
        animStyle.textContent = `
            @keyframes warnFlash {
                0%   { background: rgba(255, 0, 0, 0.3); }
                50%  { background: rgba(0, 0, 0, 0.9); }
                100% { background: rgba(255, 0, 0, 0.3); }
            }
            @keyframes textFlash {
                0%, 100% { color: #f00; }
                50%       { color: #ff0; }
            }
        `;
        document.head.appendChild(animStyle);

        document.body.appendChild(warning);

        // 2秒后移除警告
        setTimeout(() => {
            if (warning.parentNode) warning.parentNode.removeChild(warning);
        }, 2000);
    }

    // ============ 打开病毒弹窗 ============

    function createVirusWindow(index) {
        const left = 100 + (index * 70) % 800;
        const top = 100 + (index * 50) % 600;

        try {
            const win = window.open('', `virus_${Date.now()}_${index}`,
                `width=400,height=350,left=${left},top=${top},resizable=no,scrollbars=no`);

            if (!win) {
                console.error('❌ 弹窗被浏览器拦截！请允许弹窗。');
                return null;
            }

            // 写入病毒风格HTML
            win.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>⚠️ 病毒警告 ⚠️</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        
                        body {
                            font-family: 'Comic Sans MS', cursive;
                            background: #000;
                            color: #f00;
                            overflow: hidden;
                            height: 100vh;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            animation: bgFlash 0.2s infinite;
                        }

                        @keyframes bgFlash {
                            0%   { background: #f00; }
                            20%  { background: #0f0; }
                            40%  { background: #00f; }
                            60%  { background: #ff0; }
                            80%  { background: #f0f; }
                            100% { background: #f00; }
                        }

                        .virus-text {
                            font-size: 24px;
                            font-weight: bold;
                            text-align: center;
                            margin: 10px;
                            animation: textFlash 0.3s infinite;
                            text-shadow: 2px 2px 4px #000;
                        }

                        @keyframes textFlash {
                            0%   { color: #fff; transform: scale(1); }
                            50%  { color: #ff0; transform: scale(1.1); }
                            100% { color: #0ff; transform: scale(1); }
                        }

                        .stop-area {
                            margin-top: 20px;
                            text-align: center;
                        }

                        .stop-input {
                            width: 80%;
                            padding: 10px;
                            font-size: 16px;
                            text-align: center;
                            border: 3px solid #f00;
                            border-radius: 5px;
                            background: #000;
                            color: #0f0;
                            outline: none;
                            font-family: monospace;
                        }

                        .stop-btn {
                            margin-top: 10px;
                            padding: 10px 20px;
                            font-size: 16px;
                            font-weight: bold;
                            background: #f00;
                            color: #fff;
                            border: 2px solid #fff;
                            border-radius: 5px;
                            cursor: pointer;
                            animation: btnFlash 0.5s infinite;
                        }

                        @keyframes btnFlash {
                            0%, 100% { background: #f00; }
                            50%       { background: #0f0; }
                        }

                        .info {
                            font-size: 12px;
                            color: #fff;
                            margin-top: 10px;
                            opacity: 0.7;
                        }
                    </style>
                </head>
                <body>
                    <div class="virus-text">⚠️ 病毒警告 ⚠️</div>
                    <div class="virus-text" style="font-size: 18px;" id="dynamicMsg">正在入侵...</div>
                    <div class="virus-text" style="font-size: 14px;" id="countdown"></div>
                    
                    <div class="stop-area">
                        <input type="text" class="stop-input" id="stopInput" placeholder="输入密码停止..." autocomplete="off">
                        <br>
                        <button class="stop-btn" onclick="checkPassword()">🛑 停止病毒</button>
                        <div class="info">💡 提示：需要输入正确密码</div>
                    </div>

                    <script>
                        // 动态消息闪烁
                        const msgs = ${JSON.stringify(VIRUS_MESSAGES)};
                        setInterval(() => {
                            document.getElementById('dynamicMsg').textContent = 
                                msgs[Math.floor(Math.random() * msgs.length)];
                        }, 500);

                        // 倒计时（假装的）
                        let count = 10;
                        setInterval(() => {
                            count--;
                            if (count < 0) count = 10;
                            document.getElementById('countdown').textContent = 
                                '⏰ ' + count + ' 秒后系统崩溃...';
                        }, 1000);

                        // 检查密码
                        function checkPassword() {
                            const input = document.getElementById('stopInput').value;
                            if (input === 'yessir') {
                                // 通知主窗口
                                if (window.opener) {
                                    window.opener.postMessage('STOP_VIRUS', '*');
                                }
                                document.body.innerHTML = '<h1 style="color:#0f0;font-size:40px;text-align:center;margin-top:50%%;">✅ 病毒已清除！</h1>';
                                setTimeout(() => window.close(), 1500);
                            } else if (input.length > 0) {
                                alert('❌ 密码错误！\\n\\n提示：再想想...');
                                document.getElementById('stopInput').value = '';
                            }
                        }

                        // 回车触发
                        document.getElementById('stopInput').addEventListener('keypress', e => {
                            if (e.key === 'Enter') checkPassword();
                        });

                        // 阻止关闭（误导）
                        window.onbeforeunload = () => '⚠️ 病毒正在运行，确定要关闭吗？';
                    <\/script>
                </body>
                </html>
            `);
            win.document.close();

            // 标题闪烁
            let titleToggle = true;
            const titleInterval = setInterval(() => {
                if (win.closed) { clearInterval(titleInterval); return; }
                win.document.title = titleToggle ? '⚠️ 病毒警告 ⚠️' : '🦠 系统崩溃 🦠';
                titleToggle = !titleToggle;
            }, 300);

            return win;
        } catch(e) {
            console.error('创建窗口失败:', e);
            return null;
        }
    }

    // ============ 批次循环 ============

    function startBatch() {
        if (stopSignal || batchCount >= CONFIG.maxBatches) {
            console.log('%c🛑 病毒停止', 'color: #0f0; font-size: 16px;');
            cleanup();
            return;
        }

        batchCount++;
        console.log(`%c🦠 批次 ${batchCount}/${CONFIG.maxBatches}`, 'color: #f00; font-size: 14px;');

        // 打开新窗口
        for (let i = 0; i < CONFIG.windowsPerBatch; i++) {
            const win = createVirusWindow(i);
            if (win) allWindows.push(win);
        }

        // 继续下一批
        if (!stopSignal && batchCount < CONFIG.maxBatches) {
            setTimeout(startBatch, CONFIG.batchInterval);
        }
    }

    // ============ 性能监测 ============

    function startMonitor() {
        setInterval(() => {
            if (stopSignal) return;

            // 内存检查
            if (performance.memory) {
                const memMB = performance.memory.usedJSHeapSize / 1024 / 1024;
                if (memMB > CONFIG.autoStopMemory) {
                    console.warn(`%c⚠️ 内存过高 (${memMB.toFixed(0)}MB)，自动停止`, 'color: #ff0;');
                    stopVirus();
                }
            }
        }, 3000);
    }

    // ============ 停止病毒 ============

    function stopVirus() {
        if (stopSignal) return;
        stopSignal = true;
        console.log('%c🧹 正在清除病毒...', 'color: #0ff; font-size: 14px;');

        // 关闭所有窗口
        allWindows.forEach(w => {
            try { if (w && !w.closed) w.close(); } catch(e) {}
        });
        allWindows = [];

        isRunning = false;

        // 显示清除消息
        alert('🛑 病毒已被清除！\\n\\n（触发原因：用户输入密码 或 性能保护机制）\\n\\n愚人节快乐～ 😄');
    }

    // ============ 清理 ============

    function cleanup() {
        allWindows.forEach(w => {
            try { if (w && !w.closed) w.close(); } catch(e) {}
        });
        allWindows = [];
        isRunning = false;
    }

    // ============ 暴露到全局 ============

    window.VirusPrank = {
        start: () => {
            if (isRunning) { console.warn('⚠️ 病毒已在运行！'); return; }
            // 从控制台启动时，先创建按钮
            createLaunchButton();
        },
        stop: stopVirus,
        status: () => ({
            running: isRunning,
            batches: `${batchCount}/${CONFIG.maxBatches}`,
            windows: allWindows.filter(w => !w.closed).length,
        }),
    };

    // ============ 监听停止信号 ============
    window.addEventListener('message', (e) => {
        if (e.data === 'STOP_VIRUS') {
            console.log('%c✅ 收到停止信号（来自弹窗）', 'color: #0f0;');
            stopVirus();
        }
    });

    // ============ 自动创建启动按钮 ============
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createLaunchButton);
    } else {
        createLaunchButton();
    }

    // ============ 控制台提示 ============
    console.log('%c🦠 index41.js 病毒脚本已加载！', 'color: #f00; font-size: 18px; font-weight: bold;');
    console.log('%c📝 使用方法：', 'color: #fff;');
    console.log('%c   1. 点击页面上的红色按钮启动', 'color: #0f0;');
    console.log('%c   2. 在每个弹窗中输入 "yessir" 停止', 'color: #ff0;');
    console.log('%c   3. 或在控制台输入 VirusPrank.stop() 强制停止', 'color: #f00;');

})();
