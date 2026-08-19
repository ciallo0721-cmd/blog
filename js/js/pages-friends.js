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

// 友链数据
const friends = [
    {
        name: "ciallo0721-cmd",
        url: "https://ciallo0721-cmd.top",
        desc: "Ren'Py视觉小说开发 & 二次元创作博客（本站）",
        tag: "本站"
    }
    // 新友链在此添加，格式：
    // { name: "站点名", url: "https://...", desc: "描述", tag: "标签" }
];

// 渲染友链
function renderFriends() {
    const grid = document.getElementById('friendsList');
    const otherFriends = friends.filter(f => f.tag !== '本站');
    if (otherFriends.length === 0) {
        grid.innerHTML = `
            <div class="friend-empty" style="grid-column:1/-1;text-align:center;padding:40px 20px;">
                <div style="font-size:48px;margin-bottom:12px;">🤝</div>
                <h3 style="color:#667eea;margin-bottom:8px;">还没有友链，快来成为第一个吧！</h3>
                <p style="color:#999;margin-bottom:16px;">在下方提交友链申请，互相交换链接~</p>
                <a href="#apply-section" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border-radius:8px;text-decoration:none;">立即申请</a>
            </div>`;
        // 仍然渲染本站卡片
        const self = friends.filter(f => f.tag === '本站');
        if (self.length) {
            grid.innerHTML += self.map(f => `
                <a href="${f.url}" target="_blank" rel="noopener noreferrer" class="friend-card">
                    <div class="friend-avatar">${f.name.charAt(0)}</div>
                    <div class="friend-info">
                        <h3>${f.name}</h3>
                        <p>${f.desc}</p>
                        ${f.tag ? `<span class="friend-tag">${f.tag}</span>` : ''}
                    </div>
                </a>
            `).join('');
        }
        return;
    }
    grid.innerHTML = friends.map(f => `
        <a href="${f.url}" target="_blank" rel="noopener noreferrer" class="friend-card">
            <div class="friend-avatar">${f.name.charAt(0)}</div>
            <div class="friend-info">
                <h3>${f.name}</h3>
                <p>${f.desc}</p>
                ${f.tag ? `<span class="friend-tag">${f.tag}</span>` : ''}
            </div>
        </a>
    `).join('');
}

// 提交申请
function submitApply() {
    const name = document.getElementById('siteName').value.trim();
    const url = document.getElementById('siteUrl').value.trim();
    const desc = document.getElementById('siteDesc').value.trim();
    const contact = document.getElementById('contactInfo').value.trim();

    if (!name || !url) {
        showToast('请填写站点名称和地址');
        return;
    }

    // 构建邮件内容
    const subject = encodeURIComponent(`友链申请 - ${name}`);
    const body = encodeURIComponent(
`站点名称：${name}
站点地址：${url}
站点描述：${desc || '无'}
联系方式：${contact || '无'}

---
本站信息：
站名：ciallo0721-cmd's blog
地址：https://ciallo0721-cmd.top
描述：Ren'Py视觉小说开发 & 二次元创作博客`
    );

    window.location.href = `mailto:nb666mc26@outlook.com?subject=${subject}&body=${body}`;
    showToast('正在打开邮箱客户端，请发送邮件完成申请');
}

// Toast 提示
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
}

renderFriends();