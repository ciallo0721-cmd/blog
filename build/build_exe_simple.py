#!/usr/bin/env python3
"""
简化版 EXE 打包脚本
使用 tkinter + webbrowser（无需额外依赖）
"""

import os
import sys
import subprocess
from pathlib import Path

BUILD_DIR = Path(__file__).parent.absolute()
PROJECT_DIR = BUILD_DIR.parent
DIST_DIR = BUILD_DIR / "dist_simple"
BUILD_TEMP = BUILD_DIR / "build_temp_simple"

def log(msg):
    print(f"[Simple Build] {msg}")

def install_pyinstaller():
    """安装 PyInstaller"""
    try:
        import PyInstaller
        log("✓ PyInstaller 已安装")
        return True
    except ImportError:
        log("安装 PyInstaller...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])
            return True
        except subprocess.CalledProcessError as e:
            log(f"✗ PyInstaller 安装失败: {e}")
            return False

def build():
    """执行 PyInstaller 打包"""
    log("=" * 60)
    log("开始打包简化版 EXE...")
    log("=" * 60)
    
    # 清理旧文件
    if DIST_DIR.exists():
        import shutil
        shutil.rmtree(DIST_DIR)
    if BUILD_TEMP.exists():
        import shutil
        shutil.rmtree(BUILD_TEMP)
    
    # PyInstaller 命令
    app_script = BUILD_DIR / "app_simple.py"
    
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--onefile",
        "--noconsole",
        "--name", "ciallo0721-cmd",
        "--distpath", str(DIST_DIR),
        "--workpath", str(BUILD_TEMP),
        "--specpath", str(BUILD_DIR),
    ]
    
    # 添加图标
    icon_path = PROJECT_DIR / "fanv.ico"
    if icon_path.exists():
        cmd.extend(["--icon", str(icon_path)])
    
    # 添加应用脚本
    cmd.append(str(app_script))
    
    # 执行打包
    log(f"执行: {' '.join(cmd)}")
    try:
        subprocess.check_call(cmd)
    except subprocess.CalledProcessError as e:
        log(f"✗ 打包失败: {e}")
        return None
    
    # 检查输出
    exe_path = DIST_DIR / "ciallo0721-cmd.exe"
    if exe_path.exists():
        size_mb = exe_path.stat().st_size / 1024 / 1024
        log("=" * 60)
        log(f"✓ 打包成功！")
        log(f"  输出: {exe_path}")
        log(f"  大小: {size_mb:.2f} MB")
        log("=" * 60)
        return exe_path
    else:
        log("✗ 未找到输出文件")
        return None

def main():
    log("ciallo0721-cmd 网站 - 简化版 EXE 打包工具")
    log("（使用 tkinter + webbrowser，无需 PyWebView）")
    log("")
    
    # 安装 PyInstaller
    if not install_pyinstaller():
        sys.exit(1)
    
    # 执行打包
    exe_path = build()
    
    if exe_path:
        log("")
        log("打包完成！")
        log(f"  运行 {exe_path} 会打开网站")
        log("  （在默认浏览器中打开）")
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
