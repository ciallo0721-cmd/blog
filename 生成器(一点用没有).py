import os
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, filedialog
import json
from datetime import datetime

class ArticleGenerator:
    def __init__(self, root):
        self.root = root
        self.root.title("文章页面生成器")
        self.root.geometry("1000x800")
        
        # 设置样式
        self.style = ttk.Style()
        self.style.configure('TLabel', font=('Microsoft YaHei', 10))
        self.style.configure('TButton', font=('Microsoft YaHei', 10))
        self.style.configure('TEntry', font=('Microsoft YaHei', 10))
        
        # 创建主框架
        self.main_frame = ttk.Frame(root, padding="10")
        self.main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 配置网格权重
        root.columnconfigure(0, weight=1)
        root.rowconfigure(0, weight=1)
        self.main_frame.columnconfigure(1, weight=1)
        
        # 文章ID
        ttk.Label(self.main_frame, text="文章ID:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.id_var = tk.StringVar()
        self.id_entry = ttk.Entry(self.main_frame, textvariable=self.id_var, width=30)
        self.id_entry.grid(row=0, column=1, sticky=(tk.W, tk.E), pady=5)
        
        # 文章标题
        ttk.Label(self.main_frame, text="文章标题:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.title_var = tk.StringVar()
        self.title_entry = ttk.Entry(self.main_frame, textvariable=self.title_var, width=30)
        self.title_entry.grid(row=1, column=1, sticky=(tk.W, tk.E), pady=5)
        
        # 文章简介
        ttk.Label(self.main_frame, text="文章简介:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.excerpt_var = tk.StringVar()
        self.excerpt_entry = ttk.Entry(self.main_frame, textvariable=self.excerpt_var, width=30)
        self.excerpt_entry.grid(row=2, column=1, sticky=(tk.W, tk.E), pady=5)
        
        # 发布日期
        ttk.Label(self.main_frame, text="发布日期:").grid(row=3, column=0, sticky=tk.W, pady=5)
        self.date_var = tk.StringVar(value=datetime.now().strftime("%Y-%m-%d"))
        self.date_entry = ttk.Entry(self.main_frame, textvariable=self.date_var, width=30)
        self.date_entry.grid(row=3, column=1, sticky=(tk.W, tk.E), pady=5)
        
        # 阅读时间
        ttk.Label(self.main_frame, text="阅读时间(分钟):").grid(row=4, column=0, sticky=tk.W, pady=5)
        self.readtime_var = tk.StringVar(value="10")
        self.readtime_entry = ttk.Entry(self.main_frame, textvariable=self.readtime_var, width=30)
        self.readtime_entry.grid(row=4, column=1, sticky=(tk.W, tk.E), pady=5)
        
        # 标签
        ttk.Label(self.main_frame, text="标签(用逗号分隔):").grid(row=5, column=0, sticky=tk.W, pady=5)
        self.tags_var = tk.StringVar()
        self.tags_entry = ttk.Entry(self.main_frame, textvariable=self.tags_var, width=30)
        self.tags_entry.grid(row=5, column=1, sticky=(tk.W, tk.E), pady=5)
        ttk.Label(self.main_frame, text="示例: 游戏开发,C#,Unity").grid(row=6, column=1, sticky=tk.W, pady=0)
        
        # 文章内容
        ttk.Label(self.main_frame, text="文章内容(HTML格式):").grid(row=7, column=0, sticky=tk.NW, pady=5)
        self.content_text = scrolledtext.ScrolledText(self.main_frame, width=70, height=20, font=('Consolas', 10))
        self.content_text.grid(row=7, column=1, sticky=(tk.W, tk.E, tk.N, tk.S), pady=5, padx=(0, 10))
        
        # 示例内容按钮
        self.example_btn = ttk.Button(self.main_frame, text="插入示例内容", command=self.insert_example)
        self.example_btn.grid(row=8, column=1, sticky=tk.W, pady=5)
        
        # 按钮框架
        self.button_frame = ttk.Frame(self.main_frame)
        self.button_frame.grid(row=9, column=0, columnspan=2, pady=20)
        
        # 生成按钮
        self.generate_btn = ttk.Button(self.button_frame, text="生成文章页面", command=self.generate_article, style='Accent.TButton')
        self.generate_btn.grid(row=0, column=0, padx=10)
        
        # 模板路径输入
        ttk.Label(self.button_frame, text="HTML模板路径:").grid(row=1, column=0, sticky=tk.W, pady=(10, 0))
        self.template_var = tk.StringVar(value="muban.html")
        self.template_entry = ttk.Entry(self.button_frame, textvariable=self.template_var, width=30)
        self.template_entry.grid(row=2, column=0, sticky=(tk.W, tk.E), pady=5)
        self.template_btn = ttk.Button(self.button_frame, text="浏览...", command=self.browse_template)
        self.template_btn.grid(row=2, column=1, padx=5)
        
        # JS模板路径输入
        ttk.Label(self.button_frame, text="JS模板路径:").grid(row=3, column=0, sticky=tk.W, pady=(10, 0))
        self.jstemplate_var = tk.StringVar(value="wzjs模板.js")
        self.jstemplate_entry = ttk.Entry(self.button_frame, textvariable=self.jstemplate_var, width=30)
        self.jstemplate_entry.grid(row=4, column=0, sticky=(tk.W, tk.E), pady=5)
        self.jstemplate_btn = ttk.Button(self.button_frame, text="浏览...", command=self.browse_jstemplate)
        self.jstemplate_btn.grid(row=4, column=1, padx=5)
        
        # 输出目录
        ttk.Label(self.button_frame, text="输出目录:").grid(row=5, column=0, sticky=tk.W, pady=(10, 0))
        self.output_var = tk.StringVar(value=".")
        self.output_entry = ttk.Entry(self.button_frame, textvariable=self.output_var, width=30)
        self.output_entry.grid(row=6, column=0, sticky=(tk.W, tk.E), pady=5)
        self.output_btn = ttk.Button(self.button_frame, text="浏览...", command=self.browse_output)
        self.output_btn.grid(row=6, column=1, padx=5)
        
        # 状态标签
        self.status_label = ttk.Label(self.main_frame, text="", foreground="green")
        self.status_label.grid(row=10, column=0, columnspan=2, pady=10)
        
        # 配置列权重
        for i in range(7):
            self.main_frame.rowconfigure(i, weight=0)
        self.main_frame.rowconfigure(7, weight=1)
        
        # 添加示例内容
        self.insert_example()
        
    def insert_example(self):
        """插入示例内容"""
        example_content = """<h2>文章主要内容</h2>
<p>这是文章的第一段内容，你可以在这里写你的文章。</p>

<h3>代码示例</h3>
<pre><code>// Unity C# 示例代码
using UnityEngine;
using System.Collections;

public class ExampleClass : MonoBehaviour
{
    void Start()
    {
        Debug.Log("Hello, World!");
    }
    
    void Update()
    {
        // 更新逻辑
    }
}</code></pre>

<h3>列表示例</h3>
<ul>
    <li>列表项 1</li>
    <li>列表项 2</li>
    <li>列表项 3</li>
</ul>

<blockquote>
    这是一个引用块，用于突出显示重要的内容或引用。
</blockquote>

<h3>Python 示例</h3>
<pre><code># Python 示例代码
def hello_world():
    print("Hello, World!")
    
if __name__ == "__main__":
    hello_world()</code></pre>

<p>文章结尾内容。</p>"""
        
        self.content_text.delete(1.0, tk.END)
        self.content_text.insert(1.0, example_content)
        
        # 设置示例数据
        if not self.id_var.get():
            self.id_var.set("001")
        if not self.title_var.get():
            self.title_var.set("Unity游戏开发入门教程")
        if not self.excerpt_var.get():
            self.excerpt_var.set("这是一篇关于Unity游戏开发入门的详细教程，适合初学者学习。")
        if not self.tags_var.get():
            self.tags_var.set("Unity,游戏开发,C#,教程,入门")
            
    def browse_template(self):
        """浏览HTML模板文件"""
        filename = filedialog.askopenfilename(
            title="选择HTML模板文件",
            filetypes=[("HTML文件", "*.html"), ("所有文件", "*.*")]
        )
        if filename:
            self.template_var.set(filename)
            
    def browse_jstemplate(self):
        """浏览JS模板文件"""
        filename = filedialog.askopenfilename(
            title="选择JS模板文件",
            filetypes=[("JavaScript文件", "*.js"), ("所有文件", "*.*")]
        )
        if filename:
            self.jstemplate_var.set(filename)
            
    def browse_output(self):
        """选择输出目录"""
        directory = filedialog.askdirectory(title="选择输出目录")
        if directory:
            self.output_var.set(directory)
            
    def validate_input(self):
        """验证输入"""
        article_id = self.id_var.get().strip()
        if not article_id:
            messagebox.showerror("错误", "请输入文章ID")
            return False
            
        title = self.title_var.get().strip()
        if not title:
            messagebox.showerror("错误", "请输入文章标题")
            return False
            
        excerpt = self.excerpt_var.get().strip()
        if not excerpt:
            messagebox.showerror("错误", "请输入文章简介")
            return False
            
        content = self.content_text.get(1.0, tk.END).strip()
        if not content:
            messagebox.showerror("错误", "请输入文章内容")
            return False
            
        # 检查模板文件是否存在
        template_path = self.template_var.get()
        if not os.path.exists(template_path):
            messagebox.showerror("错误", f"HTML模板文件不存在: {template_path}")
            return False
            
        jstemplate_path = self.jstemplate_var.get()
        if not os.path.exists(jstemplate_path):
            messagebox.showerror("错误", f"JS模板文件不存在: {jstemplate_path}")
            return False
            
        return True
        
    def generate_article(self):
        """生成文章页面"""
        if not self.validate_input():
            return
            
        try:
            # 获取输入数据
            article_id = self.id_var.get().strip()
            title = self.title_var.get().strip()
            excerpt = self.excerpt_var.get().strip()
            date = self.date_var.get().strip()
            read_time = self.readtime_var.get().strip()
            tags = [tag.strip() for tag in self.tags_var.get().split(",") if tag.strip()]
            content = self.content_text.get(1.0, tk.END).strip()
            
            # 读取模板文件
            with open(self.template_var.get(), 'r', encoding='utf-8') as f:
                html_template = f.read()
                
            with open(self.jstemplate_var.get(), 'r', encoding='utf-8') as f:
                js_template = f.read()
                
            # 生成HTML文件
            html_content = html_template.replace('换成id', article_id)
            
            # 保存HTML文件到根目录
            output_dir = self.output_var.get()
            html_file_path = os.path.join(output_dir, f"{article_id}.html")
            
            with open(html_file_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
                
            # 创建JS文件目录
            js_dir = os.path.join(output_dir, "css", "wz", article_id)
            os.makedirs(js_dir, exist_ok=True)
            
            # 生成JS文件
            js_content = js_template.replace('换成id', article_id)
            js_file_path = os.path.join(js_dir, f"wzjsid{article_id}.js")
            
            with open(js_file_path, 'w', encoding='utf-8') as f:
                f.write(js_content)
                
            # 创建articles-data.js的更新信息
            article_data = {
                "id": article_id,
                "title": title,
                "excerpt": excerpt,
                "date": date,
                "readTime": read_time,
                "tags": tags,
                "content": content,
                "fileName": f"{article_id}.html"
            }
            
            # 保存文章数据到单独的JSON文件，方便后续更新articles-data.js
            data_file_path = os.path.join(output_dir, f"article_{article_id}_data.json")
            with open(data_file_path, 'w', encoding='utf-8') as f:
                json.dump(article_data, f, ensure_ascii=False, indent=2)
                
            # 更新状态
            self.status_label.config(
                text=f"生成成功！\nHTML文件: {html_file_path}\nJS文件: {js_file_path}\n数据文件: {data_file_path}",
                foreground="green"
            )
            
            messagebox.showinfo("成功", f"文章页面生成成功！\n\nHTML文件: {html_file_path}\nJS文件: {js_file_path}")
            
        except Exception as e:
            messagebox.showerror("错误", f"生成过程中出现错误:\n{str(e)}")
            self.status_label.config(text=f"错误: {str(e)}", foreground="red")

def main():
    root = tk.Tk()
    app = ArticleGenerator(root)
    
    # 设置窗口图标（可选）
    try:
        root.iconbitmap(default='icon.ico')
    except:
        pass
        
    root.mainloop()

if __name__ == "__main__":
    main()