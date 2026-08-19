import os, time

base = r'g:\EmoScan Pro\ciallo0721-cmd.github.io'
blog_base = os.path.join(base, 'blog')

# 扫描博客目录
for d in sorted(os.listdir(blog_base)):
    dpath = os.path.join(blog_base, d)
    if os.path.isdir(dpath):
        idx = os.path.join(dpath, 'index.html')
        if os.path.exists(idx):
            mtime = os.path.getmtime(idx)
            dt = time.strftime('%Y-%m-%d', time.localtime(mtime))
            print(f'BLOG|{d}|{dt}')

# 扫描根目录 HTML
root_pages = [
    ('index.html', 1.0),
    ('wz.html', 0.9),
    ('aboutme.html', 0.7),
    ('adss.html', 0.5),
    ('privacy.html', 0.5),
    ('privacy-policy.html', 0.5),
    ('user-agreement.html', 0.5),
    ('help.html', 0.5),
    ('status.html', 0.5),
]
for p, pri in root_pages:
    fp = os.path.join(base, p)
    if os.path.exists(fp):
        mtime = os.path.getmtime(fp)
        dt = time.strftime('%Y-%m-%d', time.localtime(mtime))
        print(f'ROOT|{p}|{dt}|{pri}')
    else:
        print(f'ROOT|{p}|MISSING|{pri}')

# 扫描游戏目录
game_dirs = ['bjqy', 'fors', 'LAIDB', 'zmdspp', '91', 'dkdfj']
for gd in game_dirs:
    gpath = os.path.join(base, gd, 'index.html')
    if os.path.exists(gpath):
        mtime = os.path.getmtime(gpath)
        dt = time.strftime('%Y-%m-%d', time.localtime(mtime))
        print(f'GAME|{gd}|{dt}')
    else:
        print(f'GAME|{gd}|MISSING')
