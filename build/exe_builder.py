#!/usr/bin/env python3
"""
EXE 打包脚本 - ciallo0721-cmd 个人网站
使用 PyWebView + PyInstaller 打包为独立 Windows 可执行文件
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

# 项目根目录
PROJECT_DIR = Path(__file__).parent.parent.absolute()
BUILD_DIR = PROJECT_DIR / "build" / "exe_output"
TEMP_DIR = BUILD_DIR / "temp"

def log(msg):
    print(f"[EXE Builder] {msg}")

def install_dependencies():
    """安装所需依赖"""
    log("检查并安装依赖...")
    dependencies = ["pywebview", "pyinstaller"]
    
    for dep in dependencies:
        try:
            __import__(dep.replace("-", "_"))
            log(f"  ✓ {dep} 已安装")
        except ImportError:
            log(f"  安装 {dep}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", dep])

def create_app_script():
    """创建 PyWebView 应用脚本"""
    app_script = BUILD_DIR / "app.py"
    
    script_content = '''#!/usr/bin/env python3
"""
ciallo0721-cmd 个人网站 - 桌面应用版
使用 PyWebView 加载在线网站，支持离线模式
"""

import webview
import threading
import time
import os
import sys
from pathlib import Path

# 网站 URL
ONLINE_URL = "https://91vip.xn--32v.ink/"
OFFLINE_DIR = Path(__file__).parent / "offline_content"

def check_online():
    """检查是否能访问在线网站"""
    try:
        import urllib.request
        urllib.request.urlopen(ONLINE_URL, timeout=3)
        return True
    except:
        return False

def start_server():
    """启动本地服务器（离线模式）"""
    import http.server
    import socketserver
    import threading
    
    os.chdir(OFFLINE_DIR)
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("127.0.0.1", 0), handler) as httpd:
        port = httpd.server_address[1]
        threading.Thread(target=httpd.serve_forever, daemon=True).start()
        return port

def main():
    # 检查网络状态
    online = check_online()
    
    if online:
        url = ONLINE_URL
        title = "ciallo0721-cmd 的个人网站 (在线模式)"
    else:
        # 离线模式：启动本地服务器
        if OFFLINE_DIR.exists():
            port = start_server()
            url = f"http://127.0.0.1:{port}/"
            title = "ciallo0721-cmd 的个人网站 (离线模式)"
        else:
            url = ONLINE_URL
            title = "ciallo0721-cmd 的个人网站 (连接中...)"
    
    # 创建窗口
    window = webview.create_window(
        title,
        url,
        width=1200,
        height=800,
        min_size=(800, 600),
        resizable=True,
        fullscreen=False,
        # on_top=False,  # 改为 False 避免始终置顶
    )
    
    # 启动应用
    webview.start(debug=False)

if __name__ == "__main__":
    main()
'''
    
    app_script.write_text(script_content, encoding="utf-8")
    log(f"已创建应用脚本: {app_script}")
    return app_script

def prepare_offline_content():
    """准备离线内容（复制核心文件）"""
    offline_dir = BUILD_DIR / "offline_content"
    offline_dir.mkdir(parents=True, exist_ok=True)
    
    log("准备离线内容...")
    
    # 复制核心文件
    core_files = [
        "index.html",
        "aboutme.html",
        "wz.html",
        "404.html",
        "articles-data.js",
        "timeline.js",
        "dynamic-data.js",
    ]
    
    for file in core_files:
        src = PROJECT_DIR / file
        if src.exists():
            shutil.copy2(src, offline_dir / file)
            log(f"  ✓ 复制 {file}")
    
    # 复制 blog 目录（可选，如果太大可以跳过）
    blog_dir = PROJECT_DIR / "blog"
    if blog_dir.exists():
        log("  复制 blog 目录（可能较大）...")
        shutil.copytree(blog_dir, offline_dir / "blog", dirs_exist_ok=True)
    
    log(f"离线内容已准备到: {offline_dir}")

def build_exe(app_script):
    """使用 PyInstaller 打包为 EXE"""
    log("开始打包 EXE...")
    
    # PyInstaller 参数
    pyinstaller_cmd = [
        sys.executable, "-m", "PyInstaller",
        "--onefile",           # 单文件
        "--noconsole",         # 无控制台窗口
        "--name", "ciallo0721-cmd",  # EXE 名称
        "--distpath", str(BUILD_DIR / "dist"),
        "--workpath", str(BUILD_DIR / "build_temp"),
        "--specpath", str(BUILD_DIR),
    ]
    
    # 添加离线内容
    offline_dir = BUILD_DIR / "offline_content"
    if offline_dir.exists():
        pyinstaller_cmd.extend([
            "--add-data", f"{offline_dir}{os.pathsep}offline_content"
        ])
    
    # 添加应用脚本
    pyinstaller_cmd.append(str(app_script))
    
    # 执行 PyInstaller
    log(f"执行命令: {' '.join(pyinstaller_cmd)}")
    try:
        subprocess.check_call(pyinstaller_cmd)
        log("✓ EXE 打包成功！")
        return BUILD_DIR / "dist" / "ciallo0721-cmd.exe"
    except subprocess.CalledProcessError as e:
        log(f"✗ EXE 打包失败: {e}")
        return None

def main():
    log("=" * 60)
    log("ciallo0721-cmd 网站 EXE 打包工具")
    log("=" * 60)
    
    # 创建输出目录
    BUILD_DIR.mkdir(parents=True, exist_ok=True)
    
    # 安装依赖
    install_dependencies()
    
    # 创建应用脚本
    app_script = create_app_script()
    
    # 准备离线内容
    prepare_offline_content()
    
    # 打包 EXE
    exe_path = build_exe(app_script)
    
    if exe_path and exe_path.exists():
        log("=" * 60)
        log(f"✓ 打包完成！EXE 文件: {exe_path}")
        log(f"  文件大小: {exe_path.stat().st_size / 1024 / 1024:.2f} MB")
        log("=" * 60)
    else:
        log("✗ 打包失败！")
        sys.exit(1)

if __name__ == "__main__":
    main()
