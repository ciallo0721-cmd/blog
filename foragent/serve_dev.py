"""本地静态服务器，修复 .svg 文件的 MIME type 为 image/svg+xml"""
import http.server
import socketserver
import os

class Handler(http.server.SimpleHTTPRequestHandler):
    def guess_type(self, path):
        if path.endswith('.svg'):
            return 'image/svg+xml'
        return super().guess_type(path)

if __name__ == '__main__':
    os.chdir(r'G:\EmoScan Pro\ciallo0721-cmd.github.io')
    with socketserver.TCPServer(('127.0.0.1', 8080), Handler) as httpd:
        print('serving at port 8080 with image/svg+xml fix')
        httpd.serve_forever()
