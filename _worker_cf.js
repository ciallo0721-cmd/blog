/**
 * _worker_cf.js — Cloudflare Worker 版子域名路由
 * 
 * 如果哪天 tname 允许改 NS 了，或者你决定把 DNS 搬到 Cloudflare，
 * 这个文件就是 Worker 的源代码。在 Cloudflare Dashboard 里新建 Worker，
 * 把这个文件的内容粘贴进去就行。
 * 
 * 同时需要在 tname 把 NS 记录改成 Cloudflare 给的 NS 地址。
 * 
 * 使用前请将 MAIN_DOMAIN 和 ROUTES 按需调整。
 * 
 * 部署步骤：
 * 1. 登录 Cloudflare Dashboard → Workers & Pages → 创建 Worker
 * 2. 把本文件内容粘贴进去 → 部署
 * 3. 在 Worker 的「触发器」标签页添加路由：
 *    status.ciallo0721-cmd.top/*
 *    wiki.ciallo0721-cmd.top/*
 *    baicai.ciallo0721-cmd.top/*
 *    taffy.ciallo0721-cmd.top/*
 * 4. 在 Cloudflare DNS 中添加四个 CNAME 记录，指向 Worker 的地址
 */

const MAIN_DOMAIN = 'ciallo0721-cmd.top';

const ROUTES = {
  'status': { base: '/',              entry: 'status.html' },
  'wiki':   { base: '/wiki/',         entry: 'wiki/index.html' },
  'baicai': { base: '/baicai/',       entry: 'baicai/index.html' },
  'taffy':  { base: '/taffy/',        entry: 'taffy/index.html' },
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname;
    const sub = host.split('.')[0];

    const route = ROUTES[sub];
    if (!route) {
      // 不识别的子域名 → 转发到主站
      return fetch(`https://${MAIN_DOMAIN}${url.pathname}${url.search}`, {
        headers: request.headers,
      });
    }

    // 构造目标 URL
    let targetPath;
    if (!url.pathname || url.pathname === '/') {
      targetPath = '/' + route.entry;
    } else {
      targetPath = route.base.replace(/\/+$/, '') + url.pathname;
      if (url.pathname.endsWith('/')) {
        targetPath += 'index.html';
      }
    }

    const targetUrl = `https://${MAIN_DOMAIN}${targetPath}${url.search}`;
    const response = await fetch(targetUrl, {
      headers: request.headers,
    });

    // 如果是 HTML，注入 <base> 标签修复相对路径
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html') && response.status === 200) {
      const text = await response.text();
      const baseUrl = `https://${MAIN_DOMAIN}${route.base}`;
      const fixed = text.replace('<head>', `<head>\n    <base href="${baseUrl}">`);

      return new Response(fixed, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }

    return response;
  },
};
