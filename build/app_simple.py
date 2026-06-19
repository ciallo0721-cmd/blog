#!/usr/bin/env python3
"""
ciallo0721-cmd 个人网站 - 简化版桌面应用
直接调用默认浏览器打开网站（无需 PyWebView 依赖）
"""

import webbrowser
import tkinter as tk
from tkinter import messagebox
import os
import sys
from pathlib import Path

WEBSITE_URL = "https://ciallo0721-cmd.top/"
APP_NAME = "ciallo0721-cmd 个人网站"

def open_website():
    """打开网站"""
    webbrowser.open(WEBSITE_URL)

def create_tray_icon():
    """创建系统托盘图标（如果支持）"""
    try:
        import pystray
        from PIL import Image
        import threading
        
        # 创建图标
        icon_image = Image.new('RGB', (64, 64), color='#667eea')
        
        def on_click(icon, item):
            if str(item) == "打开网站":
                open_website()
            elif str(item) == "退出":
                icon.stop()
        
        menu = pystray.Menu(
            pystray.MenuItem("打开网站", on_click),
            pystray.MenuItem("退出", on_click)
        )
        
        icon = pystray.Icon("ciallo0721_cmd", icon_image, APP_NAME, menu)
        threading.Thread(target=icon.run, daemon=True).start()
        return True
    except ImportError:
        return False

def main():
    print(f"[{APP_NAME}] 启动...")
    
    # 直接打开网站
    open_website()
    
    # 显示提示窗口
    root = tk.Tk()
    root.title(APP_NAME)
    root.geometry("400x200")
    root.resizable(False, False)
    
    # 居中窗口
    root.update_idletasks()
    width = root.winfo_width()
    height = root.winfo_height()
    x = (root.winfo_screenwidth() // 2) - (width // 2)
    y = (root.winfo_screenheight() // 2) - (height // 2)
    root.geometry(f"{width}x{height}+{x}+{y}")
    
    # 内容
    frame = tk.Frame(root, padx=20, pady=20)
    frame.pack(fill=tk.BOTH, expand=True)
    
    tk.Label(frame, text="😿 ciallo0721-cmd 个人网站", font=("Arial", 16, "bold")).pack(pady=10)
    tk.Label(frame, text="网站已在浏览器中打开", font=("Arial", 12)).pack(pady=5)
    tk.Label(frame, text=WEBSITE_URL, font=("Arial", 10), fg="blue", cursor="hand2").pack(pady=5)
    
    btn = tk.Button(frame, text="再次打开网站", command=open_website, bg="#667eea", fg="white", font=("Arial", 10), padx=20, pady=5)
    btn.pack(pady=10)
    
    btn_close = tk.Button(frame, text="关闭", command=root.destroy", font=("Arial", 10), padx=20, pady=5)
    btn_close.pack()
    
    # 点击 URL 标签打开网站
    def callback(event):
        open_website()
    
    url_label = frame.winfo_children()[2]
    url_label.bind("<Button-1>", callback)
    
    root.mainloop()

if __name__ == "__main__":
    main()
