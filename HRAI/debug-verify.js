// 验证根因 + 修复方案:对比 默认TextureLoader vs setCrossOrigin('')
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', m => logs.push('[' + m.type() + '] ' + m.text()));
  await page.goto('http://127.0.0.1:8000/CS/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  const result = await page.evaluate(() => new Promise(resolve => {
    const out = {};
    const url = 'assets/screen/mid.svg';
    // 1. 默认 TextureLoader(当前线上代码)
    new THREE.TextureLoader().load(url,
      t => out.default_ok = true,
      undefined,
      e => out.default_err = String(e));
    // 2. setCrossOrigin('') — 不发送 CORS 请求
    const l = new THREE.TextureLoader(); l.setCrossOrigin('');
    l.load(url,
      t => { out.nocors_ok = true; out.nocors_size = t.image && t.image.width + 'x' + t.image.height; },
      undefined,
      e => out.nocors_err = String(e));
    // 3. 原生 Image 不带 crossorigin(file:// 模拟场景)
    const img = new Image();
    img.onload = () => { out.rawimg_ok = true; out.rawimg_size = img.width + 'x' + img.height; };
    img.onerror = e => out.rawimg_err = 'raw img error';
    img.src = url;
    setTimeout(() => resolve(out), 2000);
  }));
  console.log(JSON.stringify(result, null, 1));
  console.log('--- console ---');
  console.log(logs.join('\n'));
  await browser.close();
})();
