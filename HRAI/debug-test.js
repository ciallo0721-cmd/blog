// 临时调试脚本:打开 CS 游戏,抓 console 错误,模拟点击开始
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('[console.error] ' + m.text()); });
  page.on('pageerror', e => errors.push('[pageerror] ' + e.message));

  await page.goto('http://127.0.0.1:8000/CS/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(2500);

  const state = await page.evaluate(() => ({
    three: typeof THREE !== 'undefined',
    shader: typeof makeMosaicMaterial !== 'undefined',
    gun: typeof WEAPONS !== 'undefined',
    sceneReady: typeof sceneReady !== 'undefined' ? sceneReady : null,
    overlayHidden: !!(document.getElementById('overlay') && document.getElementById('overlay').classList.contains('hide')),
    toastText: document.getElementById('toast') ? document.getElementById('toast').textContent : null,
    canvas: !!document.querySelector('canvas')
  }));
  console.log('== 初始状态 ==');
  console.log(JSON.stringify(state, null, 1));

  // 点击开始
  await page.click('#startBtn', { timeout: 3000 }).catch(e => console.log('click fail:', e.message));
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => ({
    overlayHidden: document.getElementById('overlay').classList.contains('hide'),
    running: typeof running !== 'undefined' ? running : null,
    toastText: document.getElementById('toast') ? document.getElementById('toast').textContent : null,
    toastOpacity: document.getElementById('toast') ? getComputedStyle(document.getElementById('toast')).opacity : null
  }));
  console.log('== 点击开始后 ==');
  console.log(JSON.stringify(after, null, 1));
  console.log('== 错误列表 ==');
  console.log(errors.length ? errors.join('\n') : '(无 JS 错误)');
  await browser.close();
})();
