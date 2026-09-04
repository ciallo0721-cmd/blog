#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Turnstile 机器人检测触发测试
=============================
模拟各种 bot/真人 UA，复刻 index.html 里的判定逻辑，
看看每个 UA 会被「放行」还是「送去 /oops/turnstile 验证页」。

用法:
  python 实用工具/turnstile-bot-test.py            # 仅本地逻辑判定（无需联网）
  python 实用工具/turnstile-bot-test.py --online   # 额外对线上站点发真实请求验证
  python 实用工具/turnstile-bot-test.py --url https://ciallo0721-cmd.top/blog/

判定规则与 index.html 中 <script> 完全一致:
  1. localStorage/sessionStorage 已通过验证 -> 放行 (bot 无存储, 跳过)
  2. UA 命中 seoBots 白名单 -> 放行 (本次 SEO 修复新增)
  3. UA 命中 bots 黑名单 -> 触发 Turnstile 跳转
  4. 其余 -> 当作真人放行
"""
import sys
import urllib.request

# ---- 与 index.html 保持同步的规则表 ----
SEO_BOTS = ['googlebot', 'bingbot', 'baiduspider', 'yandexbot', 'bytespider',
            'sogou', 'toutiaospider', 'duckduckbot', '360spider', 'yisouspider']
BLOCK_BOTS = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
              'python-requests', 'httpclient', 'okhttp', 'go-http', 'axios', 'node-fetch',
              'headless', 'phantom', 'selenium', 'puppeteer', 'playwright', 'scrapy',
              'gptbot', 'claudebot', 'anthropic-ai', 'ccbot', 'diffbot',
              'semrush', 'ahrefs']


def judge(ua):
    """返回 (结论, 命中的关键词)"""
    u = ua.lower()
    for kw in SEO_BOTS:
        if kw in u:
            return '放行(搜索引擎白名单)', kw
    for kw in BLOCK_BOTS:
        if kw in u:
            return '触发 Turnstile 验证', kw
    return '放行(视为真人)', ''


# ---- 测试用例: (说明, UA) ----
CASES = [
    # --- 搜索引擎 (应放行) ---
    ('Googlebot          ', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'),
    ('Googlebot Smartphone', 'Mozilla/5.0 (Linux; Android 10; Pixel 3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'),
    ('Bingbot            ', 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'),
    ('Baiduspider        ', 'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)'),
    ('YandexBot          ', 'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)'),
    ('Bytespider         ', 'Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)'),
    ('Sogou              ', 'Sogou web spider/4.0(+http://www.sogou.com/docs/help/webmasters.htm#07)'),
    ('DuckDuckBot        ', 'DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)'),
    # --- AI / 采集爬虫 (应触发验证) ---
    ('GPTBot(AI)         ', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.0; +https://openai.com/gptbot'),
    ('ClaudeBot(AI)      ', 'Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot.crawler@anthropic.com)'),
    ('CCBot(AI)          ', 'CCBot/2.0 (https://commoncrawl.org/faq/)'),
    ('SemrushBot(SEO工具)', 'Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)'),
    ('AhrefsBot(SEO工具) ', 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)'),
    ('curl(命令行)       ', 'curl/8.6.0'),
    ('python-requests    ', 'python-requests/2.31.0'),
    # --- 死链检查器 / 监控 (注意区分) ---
    ('lychee(死链检查)   ', 'Mozilla/5.0 (compatible; lychee/0.15.0; +https://github.com/lycheeverse/lychee) Bot'),
    ('UptimeRobot(监控)  ', 'UptimeRobot/2.0'),
    # --- 真人浏览器 (应放行) ---
    ('Chrome(普通用户)   ', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'),
    ('Edge(普通用户)     ', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0'),
]


def online_probe(ua, url):
    """真实请求线上站点。
    注意: GitHub Pages 是纯静态托管，服务器对任何 UA 都返回 200 正文（不拦）；
    真正会否触发 Turnstile 取决于客户端 JS 执行 -> 由上方 judge() 判定。
    这里只验证: 服务器是否直接返回主页正文、有没有服务端层拦截。"""
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': ua,
            'Accept': 'text/html,application/xhtml+xml',
        })
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = resp.read(300000).decode('utf-8', 'ignore')
            is_home = ('hitokoto-text' in body) or ('<title>ciallo0721-cmd' in body)
            return resp.status, is_home, None
    except urllib.error.HTTPError as e:
        return e.code, False, None
    except Exception as e:
        return None, False, str(e)


def main():
    online = '--online' in sys.argv
    url = 'https://ciallo0721-cmd.top/'
    if '--url' in sys.argv:
        url = sys.argv[sys.argv.index('--url') + 1]

    print(f'目标: {url}   模式: {"逻辑判定 + 线上请求" if online else "仅逻辑判定(离线)"}\n')
    print(f'{"UA 说明":<22}{"结论(新版白名单逻辑)":<26}{"命中":<12}' + ('HTTP  服务器行为' if online else ''))
    print('-' * (66 + (22 if online else 0)))

    for label, ua in CASES:
        verdict, hit = judge(ua)
        if online:
            status, is_home, err = online_probe(ua, url)
            if err:
                extra = f'请求失败: {err[:28]}'
            elif status == 200 and is_home:
                extra = '直接返回主页正文(服务器不拦)'
            elif status == 200:
                extra = '200 但非主页内容'
            else:
                extra = f'{status} (疑似服务端拦截)'
            print(f'{label:<22}{verdict:<26}{hit:<12}{status:<6}{extra}')
        else:
            print(f'{label:<22}{verdict:<26}{hit:<12}')


if __name__ == '__main__':
    main()
