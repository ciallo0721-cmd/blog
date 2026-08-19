# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: key-pages.spec.ts >> 移动端响应式 >> should render homepage on mobile viewport without horizontal overflow
- Location: tests\e2e\key-pages.spec.ts:159:7

# Error details

```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://127.0.0.1:8080/", waiting until "load"

```

# Test source

```ts
  61  |     if (favicon) {
  62  |       const href = await favicon.getAttribute('href');
  63  |       expect(href).toBeTruthy();
  64  |     }
  65  |   });
  66  | });
  67  | 
  68  | // ==================== 关键子页面测试 ====================
  69  | test.describe('关键子页面', () => {
  70  |   const pages = [
  71  |     { path: '/aboutme.html', name: '关于我' },
  72  |     { path: '/friends.html', name: '友情链接' },
  73  |     { path: '/404.html', name: '404页面' },
  74  |     { path: '/blog/', name: '博客首页' },
  75  |     { path: '/admin/', name: '管理后台' },
  76  |   ];
  77  | 
  78  |   for (const { path, name } of pages) {
  79  |     test(`should load "${name}" page (${path}) with HTTP 200`, async ({ page }) => {
  80  |       const response = await page.goto(`${BASE_URL}${path}`);
  81  |       expect(response?.status()).toBe(200);
  82  |     });
  83  | 
  84  |     test(`should not have JS errors on "${name}" page`, async ({ page }) => {
  85  |       const errors: string[] = [];
  86  |       page.on('pageerror', (err) => errors.push(err.message));
  87  |       await page.goto(`${BASE_URL}${path}`);
  88  |       await page.waitForLoadState('networkidle');
  89  |       const criticalErrors = errors.filter(
  90  |         (e) => !e.includes('favicon') && !e.includes('net::ERR_')
  91  |       );
  92  |       expect(criticalErrors).toEqual([]);
  93  |     });
  94  |   }
  95  | });
  96  | 
  97  | // ==================== 404 页面测试 ====================
  98  | test.describe('404 错误处理', () => {
  99  |   test('should return 404 for non-existent pages', async ({ page }) => {
  100 |     const response = await page.goto(`${BASE_URL}/this-page-does-not-exist-12345.html`);
  101 |     expect(response?.status()).toBe(404);
  102 |   });
  103 | 
  104 |   test('should display custom 404 content', async ({ page }) => {
  105 |     await page.goto(`${BASE_URL}/this-page-does-not-exist-12345.html`);
  106 |     // 检查页面是否有内容（不是空白）
  107 |     const bodyText = await page.textContent('body');
  108 |     expect(bodyText?.trim().length).toBeGreaterThan(0);
  109 |   });
  110 | });
  111 | 
  112 | // ==================== 链接健康检测 ====================
  113 | test.describe('内部链接检测', () => {
  114 |   test('should not have broken internal links on homepage', async ({ page }) => {
  115 |     await page.goto(BASE_URL);
  116 |     await page.waitForLoadState('networkidle');
  117 | 
  118 |     // 获取所有内部链接
  119 |     const links = await page.evaluate(() => {
  120 |       const baseOrigin = window.location.origin;
  121 |       return Array.from(document.querySelectorAll('a[href]'))
  122 |         .map((a) => (a as HTMLAnchorElement).href)
  123 |         .filter((href) => href.startsWith(baseOrigin) || href.startsWith('/') || href.startsWith('./'));
  124 |     });
  125 | 
  126 |     // 抽样检查前 30 个链接
  127 |     const sampleLinks = [...new Set(links)].slice(0, 30);
  128 |     const brokenLinks: string[] = [];
  129 | 
  130 |     for (const link of sampleLinks) {
  131 |       try {
  132 |         const response = await page.request.head(link, { timeout: 5000 });
  133 |         if (response.status() >= 400) {
  134 |           brokenLinks.push(`${link} -> ${response.status()}`);
  135 |         }
  136 |       } catch {
  137 |         // GET fallback for servers that don't support HEAD
  138 |         try {
  139 |           const response = await page.request.get(link, { timeout: 5000 });
  140 |           if (response.status() >= 400) {
  141 |             brokenLinks.push(`${link} -> ${response.status()}`);
  142 |           }
  143 |         } catch {
  144 |           brokenLinks.push(`${link} -> 连接失败`);
  145 |         }
  146 |       }
  147 |     }
  148 | 
  149 |     if (brokenLinks.length > 0) {
  150 |       console.log('发现断链:', brokenLinks);
  151 |     }
  152 |     // 允许少量外链失败（外链不受我们控制），但内链不应大量失败
  153 |     expect(brokenLinks.length).toBeLessThan(5);
  154 |   });
  155 | });
  156 | 
  157 | // ==================== 移动端响应式测试 ====================
  158 | test.describe('移动端响应式', () => {
  159 |   test('should render homepage on mobile viewport without horizontal overflow', async ({ page }) => {
  160 |     await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
> 161 |     await page.goto(BASE_URL);
      |                ^ Error: page.goto: Page crashed
  162 |     await page.waitForLoadState('networkidle');
  163 | 
  164 |     const hasOverflow = await page.evaluate(() => {
  165 |       return document.documentElement.scrollWidth > window.innerWidth;
  166 |     });
  167 |     expect(hasOverflow).toBe(false);
  168 |   });
  169 | 
  170 |   test('should render homepage on tablet viewport', async ({ page }) => {
  171 |     await page.setViewportSize({ width: 768, height: 1024 }); // iPad
  172 |     await page.goto(BASE_URL);
  173 |     await page.waitForLoadState('networkidle');
  174 | 
  175 |     const bodyVisible = await page.locator('body').isVisible();
  176 |     expect(bodyVisible).toBe(true);
  177 |   });
  178 | });
  179 | 
  180 | // ==================== 性能基础测试 ====================
  181 | test.describe('基础性能指标', () => {
  182 |   test('should load homepage within reasonable time', async ({ page }) => {
  183 |     const start = Date.now();
  184 |     await page.goto(BASE_URL);
  185 |     await page.waitForLoadState('networkidle');
  186 |     const loadTime = Date.now() - start;
  187 | 
  188 |     console.log(`首页加载时间: ${loadTime}ms`);
  189 |     // 静态站点的合理加载时间应该在 5 秒以内
  190 |     expect(loadTime).toBeLessThan(10000);
  191 |   });
  192 | 
  193 |   test('should have reasonable DOM size', async ({ page }) => {
  194 |     await page.goto(BASE_URL);
  195 |     const domNodes = await page.evaluate(() => document.querySelectorAll('*').length);
  196 |     console.log(`首页 DOM 节点数: ${domNodes}`);
  197 |     // 超过 1500 个 DOM 节点建议优化
  198 |     expect(domNodes).toBeLessThan(5000);
  199 |   });
  200 | });
  201 | 
```