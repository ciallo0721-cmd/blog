#!/usr/bin/env python3
"""
ciallo0721-cmd 个人网站 - 桌面应用版
使用 PyWebView 加载在线网站
"""

import webview
import urllib.request
import base64
from pathlib import Path

ONLINE_URL = "https://ciallo0721-cmd.top/"
APP_NAME = "ciallo0721-cmd 个人网站"

def is_online():
    """检查网络连通性"""
    try:
        urllib.request.urlopen(ONLINE_URL, timeout=5)
        return True
    except:
        return False

def main():
    print(f"[App] 启动 {APP_NAME}...")
    
    online = is_online()
    
    if online:
        url = ONLINE_URL
        title = f"{APP_NAME}"
        print(f"[App] 在线模式: {url}")
    else:
        # 离线提示页面
        offline_html = """<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>离线模式</title>
    <style>
        body {
            font-family: sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
        }
        .container { padding: 40px; }
        h1 { font-size: 3em; margin-bottom: 20px; }
        p { font-size: 1.2em; }
        .btn {
            display: inline-block;
            margin-top: 30px;
            padding: 15px 30px;
            background: white;
            color: #667eea;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>😿 离线模式</h1>
        <p>无法连接到 ciallo0721-cmd.top</p>
        <p>请检查网络连接后重试</p>
        <div class="btn" onclick="location.reload()">重试</div>
    </div>
</body>
</html>"""
        encoded = base64.b64encode(offline_html.encode('utf-8')).decode('ascii')
        url = f"data:text/html;base64,{encoded}"
        title = f"{APP_NAME} (离线)"
        print("[App] 离线模式")
    
    # 创建窗口
    window = webview.create_window(
        title,
        url,
        width=1280,
        height=900,
        min_size=(800, 600),
        resizable=True,
        fullscreen=False,
    )
    
    # 启动应用
    webview.start(debug=False)

if __name__ == "__main__":
    main()
