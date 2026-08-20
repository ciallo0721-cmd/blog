// Cloudflare Pages Function — Turnstile 服务端验证
// 路由: POST /api/verify-turnstile
// 用途: 接收前端表单提交的 cf-turnstile-response token，
//       用 secret 调 Cloudflare siteverify 接口验证。
//       验证通过 → 下发 turnstile_pass cookie（24h）并 302 跳回原页面。
//       验证失败 → 302 回挑战页并带 error 参数。
//
// ⚠️ secret 只允许出现在服务端代码里，绝不能放进前端 HTML。

const TURNSTILE_SECRET = '0x4AAAAAAEWu6hsnNTDPPvyRHCbQ8mpJrW0';
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const CHALLENGE_PATH = '/oops/turnstile/index.html';
const PASS_COOKIE_AGE = 60 * 60 * 24; // 24 小时

function safeNext(raw) {
  let next = '/';
  if (typeof raw === 'string') {
    try { next = decodeURIComponent(raw); } catch (e) { /* 保留原值 */ }
  }
  // 防开放重定向：只允许站内相对路径（以 / 开头、不以 // 开头、不含反斜杠）
  if (next.charAt(0) !== '/' || next.charAt(1) === '/' || next.includes('\\')) {
    next = '/';
  }
  return next;
}

function redirectToChallenge(next, reason) {
  const target = `${CHALLENGE_PATH}?next=${encodeURIComponent(next)}&error=${encodeURIComponent(reason)}`;
  return Response.redirect(target, 302);
}

export async function onRequestPost({ request }) {
  let formData;
  try {
    formData = await request.formData();
  } catch (e) {
    return redirectToChallenge('/', 'missing-token');
  }

  const token = (formData.get('cf-turnstile-response') || '').trim();
  const next = safeNext(formData.get('next'));

  if (!token) {
    console.warn('[Turnstile] empty token');
    return redirectToChallenge(next, 'missing-token');
  }

  // 用 secret 调 siteverify 验证 token
  const params = new URLSearchParams({
    secret: TURNSTILE_SECRET,
    response: token,
  });
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) params.set('remoteip', ip);

  try {
    const resp = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    const data = await resp.json();

    if (data.success) {
      console.log('[Turnstile] verified OK, redirect to', next);
      return new Response(null, {
        status: 302,
        headers: {
          'Location': next,
          'Set-Cookie': `turnstile_pass=1; Path=/; Max-Age=${PASS_COOKIE_AGE}; HttpOnly; SameSite=Lax`,
          'Cache-Control': 'no-store',
        },
      });
    }

    console.warn('[Turnstile] verify failed:', JSON.stringify(data['error-codes'] || []));
    return redirectToChallenge(next, 'verify-failed');
  } catch (e) {
    console.error('[Turnstile] siteverify error:', e);
    return redirectToChallenge(next, 'server-error');
  }
}
