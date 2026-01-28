from flask import Flask, render_template, send_from_directory
from waitress import serve
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

# 方法1：使用静态文件夹
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'fanv.ico', mimetype='image/vnd.microsoft.icon')

# 方法2：直接发送文件
@app.route('/favicon2.ico')
def favicon2():
    return send_from_directory(app.root_path, 'fanv.ico')

# 方法3：使用url_for静态文件
@app.route('/icon')
def icon():
    return send_from_directory(app.root_path, 'fanv.ico')

if __name__ == '__main__':
    # 使用 Waitress 作为生产服务器
    print("\n服务器成功启动")
    print("\nThe server has started successfully")
    print("\n请访问localhost:6800来运行")
    print("\nPlease visit localhost:6800 to run")
    print("\n                 by ciallo0721-cmd")
    serve(app, host='0.0.0.0', port=6800)
