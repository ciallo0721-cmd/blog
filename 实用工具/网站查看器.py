import tkinter as tk
from tkinter import ttk, scrolledtext, filedialog, messagebox
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin, parse_qs
import threading
import queue
import time
from datetime import datetime
import json
import os
import re
import mimetypes
from concurrent.futures import ThreadPoolExecutor, as_completed

class WebsiteScannerGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("智能网站目录扫描器 v2.1")
        self.root.geometry("1000x800")
        
        # 扫描控制
        self.scanning = False
        self.stop_flag = False
        self.scanned_urls = set()
        self.result_queue = queue.Queue()
        self.target_domain = ""
        
        # 创建GUI
        self.create_widgets()
        
        # 启动结果更新线程
        self.update_thread = threading.Thread(target=self.update_results, daemon=True)
        self.update_thread.start()
        
        # 加载配置文件
        self.load_config()

    def load_config(self):
        """加载配置文件"""
        self.config = {
            'common_extensions': [
                '.html', '.htm', '.php', '.asp', '.aspx', '.jsp', '.cgi',
                '.js', '.css', '.json', '.xml', '.txt', '.md', '.pdf',
                '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
                '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.ico', '.webp',
                '.mp3', '.mp4', '.avi', '.mov', '.wav', '.flv', '.m3u8',
                '.zip', '.rar', '.tar', '.gz', '.7z', '.bz2',
                '.eot', '.ttf', '.woff', '.woff2', '.otf'
            ],
            'ignore_patterns': [
                r'^#.*$',  # 锚点
                r'^javascript:',  # JavaScript代码
                r'^mailto:',  # 邮件链接
                r'^tel:',  # 电话链接
                r'^data:',  # Data URL
                r'^blob:',  # Blob URL
                r'^ws[s]?://',  # WebSocket链接
            ],
            'ignore_extensions': [
                '.exe', '.dll', '.bin', '.so', '.dylib',  # 可执行文件
                '.db', '.sqlite', '.mdb',  # 数据库
                '.log', '.tmp', '.temp', '.cache',  # 临时文件
            ],
            'ignore_params': [
                'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
                'fbclid', 'gclid', 'msclkid', 'dclid',  # 广告追踪参数
                'ref', 'source', 'campaign', 'medium', 'term', 'content'
            ],
            'user_agents': [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
            ],
            'timeout': 15,
            'max_redirects': 5,
            'max_workers': 5
        }
        
        # 加载自定义扩展名列表
        self.custom_extensions = []
        try:
            if os.path.exists('extensions.txt'):
                with open('extensions.txt', 'r', encoding='utf-8') as f:
                    self.custom_extensions = [ext.strip() for ext in f.readlines() if ext.strip()]
        except:
            pass

    def create_widgets(self):
        """创建GUI组件"""
        # 创建主框架
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 配置网格权重
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        
        # 控制区域
        control_frame = ttk.LabelFrame(main_frame, text="扫描设置", padding="10")
        control_frame.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))
        control_frame.columnconfigure(1, weight=1)
        
        # URL输入
        ttk.Label(control_frame, text="目标URL:").grid(row=0, column=0, sticky=tk.W, padx=(0, 5))
        self.url_var = tk.StringVar(value="https://ciallo0721-cmd.github.io/")
        self.url_entry = ttk.Entry(control_frame, textvariable=self.url_var, width=70)
        self.url_entry.grid(row=0, column=1, sticky=(tk.W, tk.E), padx=(0, 10), columnspan=3)
        
        # 深度设置
        ttk.Label(control_frame, text="扫描深度:").grid(row=1, column=0, sticky=tk.W, padx=(0, 5))
        self.depth_var = tk.IntVar(value=2)
        self.depth_spinbox = ttk.Spinbox(control_frame, from_=1, to=10, textvariable=self.depth_var, width=10)
        self.depth_spinbox.grid(row=1, column=1, sticky=tk.W, padx=(0, 10))
        
        # 线程数设置
        ttk.Label(control_frame, text="并发线程:").grid(row=2, column=0, sticky=tk.W, padx=(0, 5))
        self.threads_var = tk.IntVar(value=5)
        self.threads_spinbox = ttk.Spinbox(control_frame, from_=1, to=20, textvariable=self.threads_var, width=10)
        self.threads_spinbox.grid(row=2, column=1, sticky=tk.W, padx=(0, 10))
        
        # 扫描选项
        options_frame = ttk.Frame(control_frame)
        options_frame.grid(row=1, column=2, rowspan=2, padx=20, sticky=tk.W)
        
        self.scan_same_domain = tk.BooleanVar(value=True)
        ttk.Checkbutton(options_frame, text="仅扫描同域名", variable=self.scan_same_domain).grid(row=0, column=0, sticky=tk.W)
        
        self.remove_query = tk.BooleanVar(value=True)
        ttk.Checkbutton(options_frame, text="去除URL参数", variable=self.remove_query).grid(row=0, column=1, sticky=tk.W, padx=(10, 0))
        
        self.detect_hidden = tk.BooleanVar(value=True)
        ttk.Checkbutton(options_frame, text="探测隐藏文件", variable=self.detect_hidden).grid(row=1, column=0, sticky=tk.W)
        
        self.verbose_log = tk.BooleanVar(value=True)
        ttk.Checkbutton(options_frame, text="详细日志", variable=self.verbose_log).grid(row=1, column=1, sticky=tk.W, padx=(10, 0))
        
        # 控制按钮框架
        button_frame = ttk.Frame(control_frame)
        button_frame.grid(row=3, column=0, columnspan=4, pady=(10, 0), sticky=(tk.W, tk.E))
        
        self.start_btn = ttk.Button(button_frame, text="▶ 开始扫描", command=self.start_scan, width=12)
        self.start_btn.grid(row=0, column=0, padx=(0, 5))
        
        self.stop_btn = ttk.Button(button_frame, text="⏹ 停止扫描", command=self.stop_scan, state=tk.DISABLED, width=12)
        self.stop_btn.grid(row=0, column=1, padx=5)
        
        self.save_btn = ttk.Button(button_frame, text="💾 保存结果", command=self.save_results, state=tk.DISABLED, width=12)
        self.save_btn.grid(row=0, column=2, padx=5)
        
        self.clear_btn = ttk.Button(button_frame, text="🗑️ 清空结果", command=self.clear_results, width=12)
        self.clear_btn.grid(row=0, column=3, padx=5)
        
        self.export_btn = ttk.Button(button_frame, text="📋 导出列表", command=self.export_list, state=tk.DISABLED, width=12)
        self.export_btn.grid(row=0, column=4, padx=5)
        
        # 结果区域
        result_frame = ttk.LabelFrame(main_frame, text="扫描结果", padding="10")
        result_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 10))
        result_frame.columnconfigure(0, weight=1)
        result_frame.rowconfigure(0, weight=1)
        
        # 创建标签页
        self.notebook = ttk.Notebook(result_frame)
        self.notebook.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 树状结构标签页
        tree_frame = ttk.Frame(self.notebook)
        self.tree_text = scrolledtext.ScrolledText(tree_frame, wrap=tk.WORD, width=120, height=25)
        self.tree_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        tree_frame.columnconfigure(0, weight=1)
        tree_frame.rowconfigure(0, weight=1)
        self.notebook.add(tree_frame, text="目录结构")
        
        # 文件列表标签页
        list_frame = ttk.Frame(self.notebook)
        self.list_text = scrolledtext.ScrolledText(list_frame, wrap=tk.WORD, width=120, height=25)
        self.list_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        list_frame.columnconfigure(0, weight=1)
        list_frame.rowconfigure(0, weight=1)
        self.notebook.add(list_frame, text="文件列表")
        
        # 日志标签页
        log_frame = ttk.Frame(self.notebook)
        self.log_text = scrolledtext.ScrolledText(log_frame, wrap=tk.WORD, width=120, height=25)
        self.log_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        log_frame.columnconfigure(0, weight=1)
        log_frame.rowconfigure(0, weight=1)
        self.notebook.add(log_frame, text="扫描日志")
        
        # 状态栏
        self.status_var = tk.StringVar(value="就绪")
        self.status_bar = ttk.Label(main_frame, textvariable=self.status_var, relief=tk.SUNKEN)
        self.status_bar.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E))
        
        # 进度条和统计
        info_frame = ttk.Frame(main_frame)
        info_frame.grid(row=3, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 5))
        
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(info_frame, variable=self.progress_var, maximum=100, length=300)
        self.progress_bar.grid(row=0, column=0, sticky=tk.W)
        
        self.stats_var = tk.StringVar(value="已扫描: 0 | 目录: 0 | 文件: 0 | 耗时: 0s")
        self.stats_label = ttk.Label(info_frame, textvariable=self.stats_var)
        self.stats_label.grid(row=0, column=1, sticky=tk.E, padx=(10, 0))

    def start_scan(self):
        """开始扫描"""
        url = self.url_var.get().strip()
        if not url:
            messagebox.showerror("错误", "请输入要扫描的URL")
            return
        
        # 添加协议前缀
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        self.url_var.set(url)
        
        # 解析目标域名
        try:
            parsed = urlparse(url)
            self.target_domain = parsed.netloc
            if not self.target_domain:
                messagebox.showerror("错误", "无效的URL")
                return
        except:
            messagebox.showerror("错误", "无效的URL")
            return
        
        # 重置状态
        self.scanning = True
        self.stop_flag = False
        self.scanned_urls.clear()
        
        # 清空显示区域
        self.tree_text.delete(1.0, tk.END)
        self.list_text.delete(1.0, tk.END)
        self.log_text.delete(1.0, tk.END)
        
        # 更新UI状态
        self.start_btn.config(state=tk.DISABLED)
        self.stop_btn.config(state=tk.NORMAL)
        self.save_btn.config(state=tk.DISABLED)
        self.export_btn.config(state=tk.DISABLED)
        
        # 开始扫描线程
        scan_thread = threading.Thread(target=self.scan_website, args=(url,))
        scan_thread.daemon = True
        scan_thread.start()

    def stop_scan(self):
        """停止扫描"""
        self.stop_flag = True
        self.scanning = False
        self.status_var.set("正在停止...")
        self.log("用户停止了扫描")

    def save_results(self):
        """保存结果"""
        filename = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[
                ("Text files", "*.txt"), 
                ("JSON files", "*.json"), 
                ("HTML files", "*.html"),
                ("All files", "*.*")
            ]
        )
        
        if filename:
            try:
                if filename.endswith('.json'):
                    self.save_as_json(filename)
                elif filename.endswith('.html'):
                    self.save_as_html(filename)
                else:
                    self.save_as_text(filename)
                messagebox.showinfo("成功", f"结果已保存到: {filename}")
            except Exception as e:
                messagebox.showerror("错误", f"保存失败: {str(e)}")

    def save_as_text(self, filename):
        """保存为文本文件"""
        content = self.tree_text.get(1.0, tk.END)
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)

    def save_as_json(self, filename):
        """保存为JSON文件"""
        results = {
            'target_url': self.url_var.get(),
            'scan_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'directories': self.directories if hasattr(self, 'directories') else [],
            'files': self.files if hasattr(self, 'files') else []
        }
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

    def save_as_html(self, filename):
        """保存为HTML文件"""
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>网站扫描结果 - {self.url_var.get()}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                h1 {{ color: #333; }}
                .tree {{ font-family: monospace; }}
                .dir {{ color: #007bff; }}
                .file {{ color: #28a745; }}
                .stats {{ background: #f8f9fa; padding: 10px; border-radius: 5px; }}
            </style>
        </head>
        <body>
            <h1>网站扫描结果</h1>
            <div class="stats">
                <p><strong>目标URL:</strong> {self.url_var.get()}</p>
                <p><strong>扫描时间:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            </div>
            <pre class="tree">{self.tree_text.get(1.0, tk.END)}</pre>
        </body>
        </html>
        """
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html_content)

    def export_list(self):
        """导出文件列表"""
        filename = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("CSV files", "*.csv"), ("All files", "*.*")]
        )
        
        if filename:
            content = self.list_text.get(1.0, tk.END)
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            messagebox.showinfo("成功", f"文件列表已导出到: {filename}")

    def clear_results(self):
        """清空结果"""
        self.tree_text.delete(1.0, tk.END)
        self.list_text.delete(1.0, tk.END)
        self.log_text.delete(1.0, tk.END)
        self.stats_var.set("已扫描: 0 | 目录: 0 | 文件: 0 | 耗时: 0s")
        self.progress_var.set(0)

    def log(self, message):
        """添加日志"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.result_queue.put(f"LOG:{timestamp} {message}\n")

    def scan_website(self, url):
        """扫描网站的主函数"""
        try:
            self.start_time = time.time()
            parsed_url = urlparse(url)
            base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
            
            # 初始化结果
            self.directories = []
            self.files = []
            self.external_links = []
            
            self.log(f"开始扫描: {url}")
            self.log(f"目标域名: {self.target_domain}")
            
            # 扫描初始URL
            self.scan_page(url, 0, base_url)
            
            # 多线程扫描其他页面
            for depth in range(1, self.depth_var.get() + 1):
                if self.stop_flag:
                    break
                    
                # 准备要扫描的目录
                dirs_to_scan = []
                for dir_url in self.directories:
                    if dir_url not in self.scanned_urls and self.is_same_domain(dir_url):
                        dirs_to_scan.append(dir_url)
                
                if not dirs_to_scan:
                    break
                
                self.log(f"深度 {depth}: 准备扫描 {len(dirs_to_scan)} 个目录")
                
                # 多线程扫描
                with ThreadPoolExecutor(max_workers=self.threads_var.get()) as executor:
                    futures = []
                    for dir_url in dirs_to_scan:
                        if self.stop_flag:
                            break
                        future = executor.submit(self.scan_page, dir_url, depth, base_url)
                        futures.append(future)
                    
                    # 收集结果
                    for i, future in enumerate(as_completed(futures), 1):
                        if self.stop_flag:
                            break
                        try:
                            future.result(timeout=30)
                        except Exception as e:
                            self.log(f"扫描出错: {str(e)[:50]}")
                
                # 更新进度
                progress = min(100, (depth / self.depth_var.get()) * 100)
                self.progress_var.set(progress)
                
                elapsed = time.time() - self.start_time
                self.stats_var.set(f"已扫描: {len(self.scanned_urls)} | 目录: {len(self.directories)} | 文件: {len(self.files)} | 耗时: {elapsed:.1f}s")
            
            # 显示最终结果
            if not self.stop_flag:
                self.display_results(base_url)
            
        except Exception as e:
            self.log(f"扫描出错: {str(e)}")
        finally:
            self.scanning = False
            self.root.after(0, self.on_scan_complete)

    def scan_page(self, url, depth, base_url):
        """扫描单个页面"""
        if url in self.scanned_urls or self.stop_flag:
            return
        
        try:
            self.scanned_urls.add(url)
            
            # 设置请求头
            headers = {
                'User-Agent': self.config['user_agents'][depth % len(self.config['user_agents'])],
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Referer': base_url,
            }
            
            # 发送请求
            response = requests.get(
                url, 
                headers=headers, 
                timeout=self.config['timeout'],
                allow_redirects=True,
                verify=False
            )
            response.raise_for_status()
            
            # 记录成功
            if self.verbose_log.get():
                self.log(f"成功: {url} ({response.status_code})")
            
            # 解析内容
            content_type = response.headers.get('content-type', '').lower()
            
            if 'text/html' in content_type:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # 查找所有链接
                links = []
                
                # <a> 标签
                for tag in soup.find_all('a', href=True):
                    links.append(('href', tag['href']))
                
                # <link> 标签
                for tag in soup.find_all('link', href=True):
                    links.append(('href', tag['href']))
                
                # <script> 标签
                for tag in soup.find_all('script', src=True):
                    links.append(('src', tag['src']))
                
                # <img> 标签
                for tag in soup.find_all('img', src=True):
                    links.append(('src', tag['src']))
                
                # <source> 标签
                for tag in soup.find_all('source', src=True):
                    links.append(('src', tag['src']))
                
                # 处理链接
                for attr_type, href in links:
                    self.process_link(url, href, depth, base_url)
                
                # 查找CSS中的URL
                for style in soup.find_all('style'):
                    if style.string:
                        urls = re.findall(r'url\(["\']?([^"\')]+)["\']?\)', style.string)
                        for url_found in urls:
                            self.process_link(url, url_found, depth, base_url)
                
                # 查找JavaScript中的URL
                for script in soup.find_all('script'):
                    if script.string:
                        urls = re.findall(r'["\'](https?://[^"\']+)["\']', script.string)
                        for url_found in urls:
                            self.process_link(url, url_found, depth, base_url)
            
            # 如果是CSS或JS文件，也查找其中的URL
            elif 'text/css' in content_type:
                urls = re.findall(r'url\(["\']?([^"\')]+)["\']?\)', response.text)
                for url_found in urls:
                    self.process_link(url, url_found, depth, base_url)
            
        except requests.exceptions.RequestException as e:
            if self.verbose_log.get():
                self.log(f"请求失败: {url} - {str(e)[:50]}")
        except Exception as e:
            if self.verbose_log.get():
                self.log(f"解析失败: {url} - {str(e)[:50]}")

    def is_same_domain(self, url):
        """检查URL是否属于同一域名"""
        if not self.scan_same_domain.get():
            return True
        
        try:
            parsed = urlparse(url)
            return parsed.netloc == self.target_domain or parsed.netloc == ''
        except:
            return False

    def process_link(self, base_url, href, depth, root_url):
        """处理单个链接"""
        # 跳过空链接
        if not href or href.strip() == '':
            return
        
        # 检查是否需要忽略
        for pattern in self.config['ignore_patterns']:
            if re.match(pattern, href, re.IGNORECASE):
                return
        
        # 构建完整URL
        full_url = urljoin(base_url, href)
        
        # 去除片段标识符
        full_url = full_url.split('#')[0]
        
        # 去除查询参数
        if self.remove_query.get():
            parsed = urlparse(full_url)
            if parsed.query:
                # 检查是否应该保留某些参数
                query_params = parse_qs(parsed.query)
                filtered_params = {}
                for key, values in query_params.items():
                    if key not in self.config['ignore_params']:
                        filtered_params[key] = values
                
                if filtered_params:
                    new_query = '&'.join([f"{key}={value[0]}" for key, values in filtered_params.items() for value in values])
                    full_url = parsed._replace(query=new_query).geturl()
                else:
                    full_url = parsed._replace(query='').geturl()
        
        # 检查是否同一域名
        if not self.is_same_domain(full_url):
            if full_url not in self.external_links:
                self.external_links.append(full_url)
            return
        
        # 检查是否以/结尾（可能是目录）
        parsed = urlparse(full_url)
        path = parsed.path
        
        # 检查扩展名
        ext = os.path.splitext(path)[1].lower()
        
        # 如果是常见扩展名或者是文件
        if ext in self.config['common_extensions'] or ext in self.custom_extensions:
            # 检查是否应该忽略的扩展名
            if ext in self.config['ignore_extensions']:
                return
            
            # 添加到文件列表
            if full_url not in self.files:
                self.files.append(full_url)
                if self.verbose_log.get():
                    self.log(f"发现文件: {full_url}")
        else:
            # 没有扩展名或以/结尾，可能是目录
            if path.endswith('/') or not '.' in path.split('/')[-1]:
                if full_url not in self.directories:
                    self.directories.append(full_url)
                    if self.verbose_log.get():
                        self.log(f"发现目录: {full_url}")
            else:
                # 没有扩展名但也不是目录，可能是不常见的文件
                if full_url not in self.files:
                    self.files.append(full_url)
                    if self.verbose_log.get():
                        self.log(f"发现文件(无扩展名): {full_url}")

    def display_results(self, base_url):
        """显示扫描结果"""
        elapsed_time = time.time() - self.start_time
        
        # 过滤并排序结果
        same_domain_dirs = [d for d in self.directories if self.is_same_domain(d)]
        same_domain_files = [f for f in self.files if self.is_same_domain(f)]
        
        same_domain_dirs.sort()
        same_domain_files.sort()
        
        # 构建树状结构
        tree = {'_type': 'root'}
        
        for url in same_domain_dirs + same_domain_files:
            parsed = urlparse(url)
            path = parsed.path.strip('/')
            
            if not path:
                continue
                
            parts = path.split('/')
            current = tree
            
            for i, part in enumerate(parts):
                if part not in current:
                    if i == len(parts) - 1:
                        # 最后一部分
                        current[part] = {'_type': 'dir' if url in same_domain_dirs else 'file', '_url': url}
                    else:
                        current[part] = {}
                elif i == len(parts) - 1:
                    # 已存在，更新类型
                    current[part]['_type'] = 'dir' if url in same_domain_dirs else 'file'
                    current[part]['_url'] = url
                
                current = current[part]
        
        # 输出树状结构
        self.tree_text.delete(1.0, tk.END)
        self.print_tree(base_url, tree, 0)
        
        # 输出文件列表
        self.list_text.delete(1.0, tk.END)
        for i, file in enumerate(same_domain_files, 1):
            self.list_text.insert(tk.END, f"{i:3d}. {file}\n")
        
        # 输出统计信息
        self.stats_var.set(f"扫描完成! 已扫描: {len(self.scanned_urls)} | 目录: {len(same_domain_dirs)} | 文件: {len(same_domain_files)} | 耗时: {elapsed_time:.1f}s")
        
        # 记录到日志
        self.log(f"扫描完成! 发现 {len(same_domain_dirs)} 个目录, {len(same_domain_files)} 个文件")
        self.log(f"外部链接: {len(self.external_links)} 个")
        
        if self.external_links and self.verbose_log.get():
            self.log("外部链接:")
            for link in self.external_links[:10]:  # 只显示前10个
                self.log(f"  - {link}")
            if len(self.external_links) > 10:
                self.log(f"  ... 还有 {len(self.external_links) - 10} 个外部链接")

    def print_tree(self, base_url, node, depth, is_last=False, prefix=""):
        """打印目录树"""
        if depth == 0:
            # 根节点
            self.tree_text.insert(tk.END, f"📁 {base_url}/\n")
            items = [(k, v) for k, v in node.items() if k != '_type']
        else:
            items = [(k, v) for k, v in node.items() if k not in ['_type', '_url']]
        
        items.sort(key=lambda x: (0 if isinstance(x[1], dict) and '_type' in x[1] and x[1]['_type'] == 'dir' else 1, x[0]))
        
        for i, (name, value) in enumerate(items):
            is_last_item = (i == len(items) - 1)
            
            if depth == 0:
                current_prefix = ""
            else:
                current_prefix = prefix + ("└── " if is_last else "├── ")
            
            if isinstance(value, dict) and '_type' in value:
                if value['_type'] == 'dir':
                    self.tree_text.insert(tk.END, f"{current_prefix}📁 {name}/\n")
                else:
                    self.tree_text.insert(tk.END, f"{current_prefix}📄 {name}\n")
            else:
                self.tree_text.insert(tk.END, f"{current_prefix}📁 {name}/\n")
                
                # 递归打印子节点
                new_prefix = prefix + ("    " if is_last else "│   ")
                self.print_tree(base_url, value, depth + 1, is_last_item, new_prefix)

    def update_results(self):
        """更新结果文本框"""
        while True:
            try:
                result = self.result_queue.get_nowait()
                if result.startswith("LOG:"):
                    self.log_text.insert(tk.END, result[4:])
                    self.log_text.see(tk.END)
                else:
                    # 其他类型的结果
                    pass
                self.root.update_idletasks()
            except queue.Empty:
                time.sleep(0.1)
            except:
                break

    def on_scan_complete(self):
        """扫描完成后的处理"""
        self.scanning = False
        self.start_btn.config(state=tk.NORMAL)
        self.stop_btn.config(state=tk.DISABLED)
        self.save_btn.config(state=tk.NORMAL)
        self.export_btn.config(state=tk.NORMAL)
        
        if self.stop_flag:
            self.status_var.set("已停止")
            self.log("扫描被用户停止")
        else:
            self.status_var.set("扫描完成")
            self.progress_var.set(100)
            self.log("扫描完成，可以保存或导出结果")

def main():
    root = tk.Tk()
    app = WebsiteScannerGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()
