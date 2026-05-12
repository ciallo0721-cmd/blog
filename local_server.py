"""
本地开发服务器 - 自动跳过 Cloudflare 验证
在端口 9000 启动，注入 JS 自动通过验证流程
"""

import http.server
import os
import webbrowser
import threading

PORT = 9000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# 注入到所有 HTML 页面的脚本，自动跳过验证
BYPASS_SCRIPT = """<script>
(function() {
    try {
        sessionStorage.setItem('verify_passed', 'true');
        sessionStorage.setItem('auth_passed', 'true');
        sessionStorage.setItem('auth_token', JSON.stringify({
            ts: Date.now(), v: 1, gender: 'local_dev', ip: '127.0.0.1', location: 'Local'
        }));
    } catch(e) {}

    function hideVerification() {
        var overlay = document.getElementById('verifyOverlay');
        if (overlay) overlay.style.display = 'none';
        document.body.classList.add('auth-passed');

        var style = document.createElement('style');
        style.id = 'bypass-verify-style';
        style.textContent =
            '#verifyOverlay{display:none!important;visibility:hidden!important}' +
            '.verify-overlay{display:none!important}' +
            '.verify-step{display:none!important}' +
            'body.auth-passed .main-content,body.auth-passed .container{display:block!important}';
        document.head.appendChild(style);

        if (typeof initArticles === 'function') initArticles();
        if (typeof initPythonEditor === 'function') initPythonEditor();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideVerification);
    } else {
        hideVerification();
    }

    var observer = new MutationObserver(function() {
        var overlay = document.getElementById('verifyOverlay');
        if (overlay && overlay.style.display !== 'none') overlay.style.display = 'none';
        if (!document.body.classList.contains('auth-passed')) document.body.classList.add('auth-passed');
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
})();
</script>"""


class BypassHandler(http.server.SimpleHTTPRequestHandler):
    """自定义请求处理器，注入验证跳过脚本"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def do_GET(self):
        path = self.path.split('?')[0].split('#')[0]
        if path.endswith('/'):
            self.path = self.path.rstrip('/') + '/index.html'
        super().do_GET()

    def copyfile(self, source, outputfile):
        """拦截 HTML 文件输出，注入跳过验证脚本"""
        if self.path.endswith('.html') or self.path.endswith('/index.html'):
            try:
                content = source.read()
                # 在 </head> 前注入，确保最早执行
                inject_pos = content.find(b'</head>')
                if inject_pos == -1:
                    inject_pos = content.find(b'<body')
                if inject_pos == -1:
                    outputfile.write(content)
                    return

                bypass_bytes = BYPASS_SCRIPT.encode('utf-8')
                outputfile.write(content[:inject_pos])
                outputfile.write(bypass_bytes)
                outputfile.write(content[inject_pos:])
                return
            except Exception:
                source.seek(0)

        super().copyfile(source, outputfile)


def open_browser():
    """延迟打开浏览器"""
    threading.Timer(1.0, lambda: webbrowser.open(f'http://localhost:{PORT}')).start()


def main():
    with http.server.HTTPServer(('0.0.0.0', PORT), BypassHandler) as server:
        print(f'  本地开发服务器已启动')
        print(f'  地址: http://localhost:{PORT}')
        print(f'  自动跳过 Cloudflare 验证')
        print(f'  按 Ctrl+C 停止服务器')
        print()

        open_browser()

        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print('\n服务器已停止。')


if __name__ == '__main__':
    main()
