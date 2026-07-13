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

// ===== 技能进度条动画（IntersectionObserver，IE9降级无动画） =====
(function(){
    if (!window.IntersectionObserver) {
        // IE9 降级：直接设置宽度
        document.querySelectorAll('.skill-bar').forEach(function(bar){
            bar.style.width = (bar.getAttribute('data-w') || 0) + '%';
        });
        return;
    }
    var observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
            if(entry.isIntersecting){
                var bar = entry.target;
                bar.style.width = (bar.getAttribute('data-w') || 0) + '%';
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.3 });
    document.querySelectorAll('.skill-bar').forEach(function(bar){
        observer.observe(bar);
    });
})();

// ===== 复制链接 =====
function copyLink() {
    var url = 'https://ciallo0721-cmd.top/aboutme.html';
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(showCopyTip);
    } else {
        var ta = document.createElement('textarea');
        ta.value = url; ta.style.position='fixed'; ta.style.opacity='0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch(e){}
        document.body.removeChild(ta);
        showCopyTip();
    }
}
function showCopyTip() {
    var tip = document.getElementById('copyTip');
    tip.style.display = 'block';
    setTimeout(function(){ tip.style.display='none'; }, 3000);
}

// ===== 分享QQ =====
function shareQQ() {
    var url = encodeURIComponent('https://ciallo0721-cmd.top/aboutme.html');
    var title = encodeURIComponent('发现了超厉害的视觉小说创作者！游戏真的很好玩🎮');
    window.open('https://connect.qq.com/widget/shareqq/index.html?url='+url+'&title='+title, '_blank');
}

// ===== 原生分享（移动端） =====
function nativeShare() {
    if (navigator.share) {
        navigator.share({
            title: 'ciallo0721-cmd — 视觉小说创作者',
            text: '发现了一个超有个性的独立游戏创作者，游戏超好玩！',
            url: 'https://ciallo0721-cmd.top/aboutme.html'
        }).catch(function(){});
    } else {
        copyLink();
    }
}

// ===== 验证检查（与主站保持一致） =====
(function(){
    var passed = sessionStorage.getItem('verify_passed') === 'true'
              || sessionStorage.getItem('auth_passed') === 'true';
    if (!passed) {
        window.location.href = './index.html';
    }
})();