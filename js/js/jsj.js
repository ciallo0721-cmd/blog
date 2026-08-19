// ====================================================
// 人机验证与主题切换功能（修复定时器冲突版）
// ====================================================

document.addEventListener('DOMContentLoaded', function() {
    // ---------- 主题切换 ----------
    const themeSwitch = document.getElementById('themeSwitch');
    if (themeSwitch) {
        const themeIcon = themeSwitch.querySelector('i');
        const themeText = themeSwitch.querySelector('span');

        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'dark') {
            document.body.classList.add('dark-mode');
            if (themeIcon) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
            if (themeText) themeText.textContent = '亮色模式';
        }

        themeSwitch.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                if (themeIcon) {
                    themeIcon.classList.remove('fa-moon');
                    themeIcon.classList.add('fa-sun');
                }
                if (themeText) themeText.textContent = '亮色模式';
            } else {
                localStorage.setItem('theme', 'light');
                if (themeIcon) {
                    themeIcon.classList.remove('fa-sun');
                    themeIcon.classList.add('fa-moon');
                }
                if (themeText) themeText.textContent = '暗色模式';
            }
        });
    }

    // ---------- 人机验证 ----------
    const authButton = document.getElementById('authButton');
    const authLoading = document.getElementById('authLoading');
    const authOverlay = document.getElementById('authOverlay');

    if (!authButton || !authLoading || !authOverlay) return;

    // 如果已经验证通过，直接显示页面
    if (sessionStorage.getItem('auth_passed') === 'true') {
        document.body.classList.add('auth-passed');
        if (typeof initArticles === 'function') initArticles();
        if (typeof initPythonEditor === 'function') initPythonEditor();
        return;
    }

    let mouseDownTime = 0;
    let mouseUpTime = 0;
    let clickDuration = 0;

    // 定时器ID管理，防止冲突
    let validationTimer = null;
    let successTimer = null;
    let failTimer = null;

    function clearAllTimers() {
        if (validationTimer) clearTimeout(validationTimer);
        if (successTimer) clearTimeout(successTimer);
        if (failTimer) clearTimeout(failTimer);
        validationTimer = successTimer = failTimer = null;
    }

    // 鼠标按下
    authButton.addEventListener('mousedown', function(e) {
        mouseDownTime = new Date().getTime();
    });

    // 鼠标抬起
    authButton.addEventListener('mouseup', function(e) {
        mouseUpTime = new Date().getTime();
        clickDuration = mouseUpTime - mouseDownTime;

        // 清除之前的定时器（防止重复点击导致冲突）
        clearAllTimers();

        // 禁用按钮，防止连续点击
        authButton.style.pointerEvents = 'none';
        authButton.style.opacity = '0.5';
        authLoading.style.display = 'block';
        authLoading.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在验证中...';
        authLoading.style.color = '#6a11cb';

        const clientX = e.clientX;
        const clientY = e.clientY;

        // 模拟验证延迟
        validationTimer = setTimeout(function() {
            let isRobot = false;

            // 修正：点击时长超过991ms直接判定为人类
            if (clickDuration > 991) {
                isRobot = false;
            } else {
                const robotScore = calculateRobotScore(clickDuration, clientX, clientY);
                isRobot = robotScore > 25;
            }

            // 隐藏验证按钮
            authButton.style.display = 'none';

            if (!isRobot) {
                // 验证通过
                authLoading.innerHTML = '<i class="fas fa-check-circle"></i> 验证通过！正在进入...';
                authLoading.style.color = '#4CAF50';

                // 清除失败定时器（防止之前残留的跳转）
                if (failTimer) clearTimeout(failTimer);

                successTimer = setTimeout(function() {
                    document.body.classList.add('auth-passed');
                    sessionStorage.setItem('auth_passed', 'true');
                    if (typeof initArticles === 'function') initArticles();
                    if (typeof initPythonEditor === 'function') initPythonEditor();
                }, 1000);
            } else {
                // 验证失败
                authLoading.innerHTML = '<i class="fas fa-times-circle"></i> 验证失败！可能是机器人';
                authLoading.style.color = '#ff6b9d';

                // 清除成功定时器
                if (successTimer) clearTimeout(successTimer);

                failTimer = setTimeout(function() {
                    window.location.href = './403.html';
                }, 1500);
            }

            validationTimer = null;
        }, 800 + Math.random() * 700); // 随机延迟模拟验证
    });

    /**
     * 计算机器人评分
     */
    function calculateRobotScore(duration, clickX, clickY) {
        let robotScore = 0;

        if (duration < 10) {
            robotScore += 25;
        } else if (duration < 50) {
            robotScore += 15;
        }

        if (clickX !== undefined && clickY !== undefined) {
            const buttonRect = authButton.getBoundingClientRect();
            if (buttonRect.width > 0) {
                const centerX = buttonRect.left + buttonRect.width / 2;
                const centerY = buttonRect.top + buttonRect.height / 2;
                const distance = Math.sqrt(
                    Math.pow(clickX - centerX, 2) + 
                    Math.pow(clickY - centerY, 2)
                );
                if (distance < 2) {
                    robotScore += 15;
                }
            }
        }

        const userAgent = navigator.userAgent.toLowerCase();
        const botKeywords = ['bot', 'crawler', 'spider', 'headless', 'phantom', 'selenium', 'puppeteer', 'curl', 'wget', 'guangezhuanshuxitong1111'];
        for (const keyword of botKeywords) {
            if (userAgent.includes(keyword)) {
                robotScore += 50;
                break;
            }
        }

        return robotScore;
    }
});