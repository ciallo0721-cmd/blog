/**
 * _subdomain-router.js — 子域名客户端路由
 * 
 * 让 status/wiki/baicai/taffy.ciallo0721-cmd.top 不用 Cloudflare Worker
 * 也能正常工作，保持子域名在 URL 栏不消失喵～
 * 
 * 原理：
 * 1. tname CNAME * → ciallo0721-cmd.github.io （DNS 层面把请求送到 GitHub）
 * 2. GitHub Pages 认出是子域名，返回主站的 index.html
 * 3. 这个脚本检测子域名 → fetch 对应内容 → 注入 <base> 标签 → 替换页面
 * 
 * 依赖：index.html 必须有 <link id="subdomainRouter">
 * 或者在每个入口页的 <head> 加载此脚本。
 */

(function() {
  'use strict';

  const host = location.hostname;
  const parts = host.split('.');

  // 只对 3 段以上的子域名生效（如 baicai.ciallo0721-cmd.top）
  if (parts.length < 3) return;

  // 排除主域名和 www
  var mainDomain = 'ciallo0721-cmd.top';
  if (host === mainDomain || host === 'www.' + mainDomain) return;
  if (host.indexOf('.') === -1) return;

  var sub = parts[0];

  var routes = {
    'status': { base: '/', entry: 'status.html', domainPath: 'status' },
    'wiki':   { base: '/wiki/', entry: 'wiki/index.html', domainPath: 'wiki' },
    'baicai': { base: '/baicai/', entry: 'baicai/index.html', domainPath: 'baicai' },
    'taffy':  { base: '/taffy/', entry: 'taffy/index.html', domainPath: 'taffy' },
  };

  var route = routes[sub];
  if (!route) return;  // 不识别的子域名，正常显示主站

  var currentPath = location.pathname;
  var mainUrl = 'https://' + mainDomain;

  // 决定要 fetch 哪个文件
  var fetchPath;
  if (!currentPath || currentPath === '/') {
    fetchPath = route.entry;
  } else {
    fetchPath = route.base.replace(/\/+$/, '') + currentPath;
  }

  var targetUrl = mainUrl + '/' + fetchPath.replace(/^\/+/, '');

  // 显示加载状态（可选的）
  var loadingStyle = document.createElement('style');
  loadingStyle.textContent = '#subdomain-loading{position:fixed;top:0;left:0;width:100%;height:100%;background:#f5f5f7;z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif}#subdomain-loading .spinner{width:36px;height:36px;border:3px solid #e0e0e0;border-top-color:#3366ff;border-radius:50%;animation:subSpin 0.8s linear infinite}@keyframes subSpin{to{transform:rotate(360deg)}}#subdomain-loading .text{color:#666;font-size:14px}';
  document.head.appendChild(loadingStyle);

  var loadingDiv = document.createElement('div');
  loadingDiv.id = 'subdomain-loading';
  loadingDiv.innerHTML = '<div class="spinner"></div><div class="text">正在加载 ' + sub + '.ciallo0721-cmd.top...</div>';
  document.documentElement.appendChild(loadingDiv);

  // Fetch 目标内容
  var xhr = new XMLHttpRequest();
  xhr.open('GET', targetUrl, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return;

    if (xhr.status === 200) {
      var html = xhr.responseText;
      var baseUrl = mainUrl + route.base;

      // 注入 <base> 标签，解决相对路径问题
      html = html.replace('<head>', '<head>\n    <base href="' + baseUrl + '">');

      // 替换整个页面
      document.open();
      document.write(html);
      document.close();
    } else {
      // 出错时降级为 301 跳转
      loadingDiv.innerHTML = '<div class="text" style="color:#ef4444;">加载失败，正在跳转...</div>';
      setTimeout(function() {
        location.href = mainUrl + '/' + route.base.replace(/\/+$/, '') + currentPath.replace(/\/+$/, '');
      }, 800);
    }
  };
  xhr.onerror = function() {
    loadingDiv.innerHTML = '<div class="text" style="color:#ef4444;">网络错误，正在跳转...</div>';
    setTimeout(function() {
      location.href = mainUrl + '/' + route.base.replace(/\/+$/, '') + currentPath.replace(/\/+$/, '');
    }, 800);
  };
  xhr.send();
})();
