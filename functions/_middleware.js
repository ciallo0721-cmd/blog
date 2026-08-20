// Cloudflare Pages Function - 反爬虫中间件（Turnstile 挑战版）
// 保存到: functions/_middleware.js
// 
// 功能：检测疑似机器人/爬虫 User-Agent。
//   - 无 turnstile_pass cookie → 302 到 /oops/turnstile/index.html 过 Cloudflare Turnstile
//   - 已有 turnstile_pass cookie → 直接放行
// 说明：验证流程见 /oops/turnstile/index.html 与 /api/verify-turnstile。

// 静态资源扩展名：不参与挑战，直接放行（否则会影响页面正常加载）
const STATIC_EXT_RE = /\.(css|js|m?js|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|otf|eot|mp3|mp4|webm|ogg|wav|m4a|json|xml|txt|pdf|zip|gz|map)$/i;

// 挑战相关路径：放行避免死循环
const BYPASS_PREFIXES = ['/oops/', '/api/', '/favicon.ico'];

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

// 精确匹配 turnstile_pass=1（避免误匹配 turnstile_pass=10 等）
function hasTurnstilePass(cookieHeader) {
  if (!cookieHeader) return false;
  return /(?:^|;\s*)turnstile_pass=1(?:;|$)/.test(cookieHeader);
}

function isStaticAsset(pathname) {
  return STATIC_EXT_RE.test(pathname);
}

export async function onRequest({ request, next }) {
  const ua = request.headers.get('User-Agent') || '';
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 静态资源 / 挑战页 / API 直接放行
  if (isStaticAsset(pathname) || BYPASS_PREFIXES.some(p => pathname === p || pathname.startsWith(p))) {
    return await next();
  }

  // 疑似机器人检测
  const uaLower = ua.toLowerCase();
  const isCrawler = crawlerPatterns.some(p => uaLower.includes(p));

  // 正常用户直接放行
  if (!isCrawler) {
    return await next();
  }

  // 已通过 Turnstile（cookie 有效期内）→ 放行
  const cookies = request.headers.get('Cookie') || '';
  if (hasTurnstilePass(cookies)) {
    return await next();
  }

  // 疑似机器人且未验证 → 302 到 Turnstile 挑战页
  console.log(`[Anti-Crawler] Challenge suspicious UA: ${ua.substring(0, 100)}`);

  const target = pathname + url.search;
  const challengeUrl = `/oops/turnstile/index.html?next=${encodeURIComponent(target)}`;
  return Response.redirect(challengeUrl, 302);
}
