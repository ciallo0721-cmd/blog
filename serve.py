"""
本地静态服务器（修复 Windows Python 的两个坑）
  1) SVG MIME: 强制 image/svg+xml（Chrome 严格检查）
  2) Cache-Control: no-store（强制浏览器每次重新拉，避免缓存陷阱）
  3) favicon.ico: 返回 204，不让控制台刷 404
默认端口 7777，根目录 = 当前目录
用法: python serve.py [端口]
"""
import sys
import mimetypes
import http.server

mimetypes.add_type('image/svg+xml', '.svg')

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 禁缓存
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, fmt, *args):
        pass  # 静默日志，避免污染

    def do_GET(self):
        if self.path == '/favicon.ico':
            self.send_response(204)
            self.end_headers()
            return
        super().do_GET()

port = int(sys.argv[1]) if len(sys.argv) > 1 else 7777
http.server.test(HandlerClass=NoCacheHandler, port=port, bind='0.0.0.0')