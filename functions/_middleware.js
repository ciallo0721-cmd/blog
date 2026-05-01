// Cloudflare Pages Function - 反爬虫中间件
// 保存到: functions/_middleware.js
// 
// 功能：阻止所有爬虫和搜索引擎访问
// 返回403禁止访问

export async function onRequest({ request, next }) {
  const ua = request.headers.get('User-Agent') || '';
  const url = new URL(request.url);
  
  // 爬虫和搜索引擎 User-Agent 模式
  const crawlerPatterns = [
    // 搜索引擎爬虫
    'googlebot', 'google-inspectiontool', 'adsbot-google', 'feedfetcher-google',
    'bingbot', 'bingpreview', 'msnbot',
    'baiduspider', 'baidu.com/spider',
    'sogou', 'sohu-search', 'yandex',
    'twitterbot', 'facebookexternalhit', 'linkedinbot', 'slurp', 'duckduckbot',
    'applebot', 'spotify',
    
    // AI 爬虫
    'gptbot', 'chatgpt', 'claudebot', 'anthropic-ai', 'meta-externalagent',
    'ccbot', 'diffbot', 'embedly', 'facebook catalog',
    
    // 通用爬虫模式
    'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests',
    'httpclient', 'java/', 'okhttp', 'go-http', 'axios', 'node-fetch',
    
    // SEO工具
    'semrush', 'ahrefs', 'mj12bot', 'majestic',
    
    // 安全扫描
    'nmap', 'sqlmap', 'nikto', 'dirbuster', 'gobuster', 'wfuzz',
    
    // 恶意爬虫
    'libwww-perl', 'apache-httpclient', 'scrapy', 'phantomjs', 'selenium',
    'puppeteer', 'playwright'
  ];
  
  const isCrawler = crawlerPatterns.some(p => ua.toLowerCase().includes(p));
  
  // 如果检测到爬虫，返回403禁止访问
  if (isCrawler) {
    console.log(`[Anti-Crawler] Blocked crawler: ${ua.substring(0, 100)}`);
    
    return new Response('403 Forbidden', {
      status: 403,
      statusText: 'Forbidden',
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Connection': 'close'
      }
    });
  }
  
  // 正常用户请求，直接返回
  return await next();
}
