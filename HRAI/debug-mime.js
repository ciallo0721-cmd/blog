// 验证:同一份 SVG,不同加载方式 — 判断是 MIME 问题还是 SVG 内容问题
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:8000/CS/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(800);
  const result = await page.evaluate(async () => {
    const out = {};
    // 1. fetch + blob(绕过 HTTP MIME 检查)
    try {
      const r = await fetch('assets/screen/mid.svg');
      out.fetch_status = r.status;
      out.fetch_ct = r.headers.get('content-type');
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const ok = await new Promise(res => {
        const img = new Image();
        img.onload = () => res(true);
        img.onerror = () => res(false);
        img.src = url;
      });
      out.blob_ok = ok;
      if (ok) {
        const img = new Image();
        await new Promise(res => { img.onload = res; img.onerror = () => res(false); img.src = url; });
        out.blob_size = img.width + 'x' + img.height;
      }
    } catch (e) { out.fetch_err = String(e); }
    // 2. base64 data URI(完全绕开服务器)
    try {
      const r2 = await fetch('assets/screen/mid.svg');
      const text = await r2.text();
      const b64 = btoa(text);
      const ok2 = await new Promise(res => {
        const img = new Image();
        img.onload = () => res(true);
        img.onerror = () => res(false);
        img.src = 'data:image/svg+xml;base64,' + b64;
      });
      out.base64_ok = ok2;
    } catch (e) { out.b64_err = String(e); }
    return out;
  });
  console.log(JSON.stringify(result, null, 1));
  await browser.close();
})();
