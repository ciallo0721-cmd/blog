#!/usr/bin/env python3
"""
EXE 打包执行脚本
使用 PyInstaller 将 app.py 打包为独立 EXE
"""

import os
import sys
import subprocess
from pathlib import Path

BUILD_DIR = Path(__file__).parent.absolute()
PROJECT_DIR = BUILD_DIR.parent
DIST_DIR = BUILD_DIR / "dist"
BUILD_TEMP = BUILD_DIR / "build_temp"

def log(msg):
    print(f"[Build] {msg}")

def install_deps():
    """安装依赖"""
    deps = ["pywebview", "pyinstaller"]
    for dep in deps:
        log(f"检查 {dep}...")
        try:
            if dep == "pywebview":
                import webview
                log("  ✓ pywebview 已安装")
            elif dep == "pyinstaller":
                import PyInstaller
                log("  ✓ pyinstaller 已安装")
        except ImportError:
            log(f"  安装 {dep}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", dep])

def build():
    """执行 PyInstaller 打包"""
    log("=" * 60)
    log("开始打包 EXE...")
    log("=" * 60)
    
    # 清理旧文件
    if DIST_DIR.exists():
        import shutil
        shutil.rmtree(DIST_DIR)
    if BUILD_TEMP.exists():
        import shutil
        shutil.rmtree(BUILD_TEMP)
    
    # PyInstaller 命令
    app_script = BUILD_DIR / "app.py"
    
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--onefile",           # 单文件
        "--noconsole",         # 无控制台
        "--name", "ciallo0721-cmd",  # 输出文件名
        "--distpath", str(DIST_DIR),
        "--workpath", str(BUILD_TEMP),
        "--specpath", str(BUILD_DIR),
    ]
    
    # 添加图标（如果存在）
    icon_path = PROJECT_DIR / "fanv.ico"
    if icon_path.exists():
        cmd.extend(["--icon", str(icon_path)])
        log(f"  ✓ 使用图标: {icon_path}")
    
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
    # 安装依赖
    install_deps()
    
    # 执行打包
    exe_path = build()
    
    if exe_path:
        log("")
        log("打包完成！你可以：")
        log(f"  1. 运行 {exe_path} 测试")
        log(f"  2. 分发该 EXE 文件（无需安装 Python）")
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
