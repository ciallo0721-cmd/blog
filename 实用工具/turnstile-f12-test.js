/* ============================================================
 * Turnstile Bot 伪装测试 —— F12 控制台版
 * ------------------------------------------------------------
 * 用法:
 *   1. 打开 https://ciallo0721-cmd.top/ (F12 → Console)
 *   2. 整段粘贴本代码, 回车
 *   3. 看结果表: 每个伪装 UA 会被"放行"还是"送去 Turnstile 验证页"
 *
 * 原理:
 *   抓取当前页(或指定页)HTML 里那段真实的 Turnstile 检测脚本,
 *   把 UA 换成候选值、把 location.replace 换成埋点、绕过本地存储,
 *   然后真实执行一遍 → 看它会走哪条分支。
 *   测的是线上真实逻辑, 不是本地复刻。
 * ============================================================ */
(async () => {
  // ===== 想加 UA? 在这下面加一行: '名字': '完整 UA 字符串' =====
  const UA_MAP = {
    'Googlebot  (搜索引擎)': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Bingbot    (搜索引擎)': 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'Baiduspider(搜索引擎)': 'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)',
    'GPTBot     (AI采集) ': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.0; +https://openai.com/gptbot',
    'ClaudeBot  (AI采集) ': 'Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot.crawler@anthropic.com)',
    'curl       (命令行) ': 'curl/8.6.0',
    'python-requests     ': 'python-requests/2.31.0',
    'lychee     (死链检查)': 'Mozilla/5.0 (compatible; lychee/0.15.0; +https://github.com/lycheeverse/lychee) Bot',
    'Chrome     (我,真人)': navigator.userAgent,
  };

  const url = (prompt('测试哪个页面? (回车=当前页)', location.href) || location.href).split('#')[0];

  // 1) 抓 HTML, 抽出 Turnstile 检测脚本 (那一段 IIFE)
  const html = await (await fetch(url)).text();
  const m = html.match(/\(function\s*\(\s*\)\s*\{\s*'use strict';[\s\S]*?\}\)\(\)\s*;/);
  if (!m || !m[0].includes('location.replace') || !m[0].includes('navigator.userAgent')) {
    console.warn('⚠️ 没在该页找到 Turnstile 检测脚本(页面可能没装, 或结构已变化)');
    return;
  }
  let code = m[0];

  // 2) 改造脚本: UA 参数化 + 绕过本地存储 + 跳转变埋点 + 白名单命中也埋点
  code = code
    .replace(/var ua = navigator\.userAgent\.toLowerCase\(\);/, 'var ua = __UA_PLACEHOLDER__.toLowerCase();')
    .replace(/localStorage\.getItem\([^)]*\)/g, 'null')
    .replace(/sessionStorage\.getItem\([^)]*\)/g, 'null')
    .replace(/location\.replace\([^;]*\);/, "window.__tt_hit = 'TURNSTILE';")
    .replace(/if \(ua\.indexOf\(seoBots\[s\]\) !== -1\) return;/, "if (ua.indexOf(seoBots[s]) !== -1) { window.__tt_hit = 'SEOBOT:' + seoBots[s]; return; }");

  // 3) 逐个 UA 真实执行
  const results = [];
  for (const [name, ua] of Object.entries(UA_MAP)) {
    window.__tt_hit = undefined;
    try {
      new Function(code.split('__UA_PLACEHOLDER__').join(JSON.stringify(ua)))();
    } catch (e) {
      results.push({ '伪装 UA': name.trim(), '判定': '脚本执行出错: ' + e.message });
      continue;
    }
    let verdict;
    if (window.__tt_hit === 'TURNSTILE') verdict = '🚫 会被送去 Turnstile 验证页';
    else if (window.__tt_hit && window.__tt_hit.startsWith('SEOBOT:'))
      verdict = '✅ 放行 (搜索引擎白名单: ' + window.__tt_hit.slice(7) + ')';
    else verdict = '✅ 放行 (视为真人)';
    results.push({ '伪装 UA': name.trim(), '判定': verdict });
  }

  // 4) 输出
  console.log('检测页面:', url);
  console.log('检测脚本版本:', code.includes('seoBots') ? '新版(含白名单)' : '旧版(无白名单, bot 一律中招)');
  console.table(results);
})();
