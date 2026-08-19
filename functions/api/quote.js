// Cloudflare Pages Function — 一言(quote)代理
// 路由: /api/quote → 代理 https://api.senvinn.cn/api/quote
// 用途: senvinn 接口未开 CORS 且站点 CSP 限制 connect-src，前端无法直连，
//       通过同源 Pages Function 中转，浏览器请求 /api/quote 不受跨域限制。
export async function onRequestGet({ request }) {
  try {
    const resp = await fetch('https://api.senvinn.cn/api/quote', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ciallo0721-cmd.top)'
      }
    });
    if (!resp.ok) throw new Error('upstream status ' + resp.status);
    const data = await resp.json();
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=300'
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ code: 502, message: 'quote proxy error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}
