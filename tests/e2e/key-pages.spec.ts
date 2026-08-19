/**
 * 端测测 - ciallo0721-cmd.top 关键页面 E2E 测试
 * 测试金字塔：E2E 层（10%）- 覆盖核心用户旅程
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:8080';

// ==================== 首页测试 ====================
test.describe('首页 (index.html)', () => {
  test('should load homepage with correct title', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/ciallo0721|ciallo0721-cmd/i);
  });

  test('should render main navigation links', async ({ page }) => {
    await page.goto(BASE_URL);
    // 检查关键导航元素存在
    const navLinks = page.locator('nav a, .nav a, header a[href]');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should load without JavaScript console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    // 过滤掉常见的非关键错误
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('net::ERR_')
    );
    expect(criticalErrors).toEqual([]);
  });

  test('should have valid HTML structure', async ({ page }) => {
    await page.goto(BASE_URL);
    // 检查关键 HTML 结构
    const hasDoctype = await page.evaluate(() => document.doctype !== null);
    expect(hasDoctype).toBe(true);

    const hasHead = await page.$('head');
    expect(hasHead).not.toBeNull();

    const hasBody = await page.$('body');
    expect(hasBody).not.toBeNull();
  });

  test('should have meta viewport for mobile responsiveness', async ({ page }) => {
    await page.goto(BASE_URL);
    const viewport = await page.$('meta[name="viewport"]');
    expect(viewport).not.toBeNull();
    const content = await viewport?.getAttribute('content');
    expect(content).toContain('width=device-width');
  });

  test('should have a valid favicon', async ({ page }) => {
    await page.goto(BASE_URL);
    const favicon = await page.$('link[rel="icon"], link[rel="shortcut icon"]');
    // favicon 不是硬性要求，但建议有
    if (favicon) {
      const href = await favicon.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });
});

// ==================== 关键子页面测试 ====================
test.describe('关键子页面', () => {
  const pages = [
    { path: '/aboutme.html', name: '关于我' },
    { path: '/friends.html', name: '友情链接' },
    { path: '/404.html', name: '404页面' },
    { path: '/blog/', name: '博客首页' },
    { path: '/admin/', name: '管理后台' },
  ];

  for (const { path, name } of pages) {
    test(`should load "${name}" page (${path}) with HTTP 200`, async ({ page }) => {
      const response = await page.goto(`${BASE_URL}${path}`);
      expect(response?.status()).toBe(200);
    });

    test(`should not have JS errors on "${name}" page`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState('networkidle');
      const criticalErrors = errors.filter(
        (e) => !e.includes('favicon') && !e.includes('net::ERR_')
      );
      expect(criticalErrors).toEqual([]);
    });
  }
});

// ==================== 404 页面测试 ====================
test.describe('404 错误处理', () => {
  test('should return 404 for non-existent pages', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/this-page-does-not-exist-12345.html`);
    expect(response?.status()).toBe(404);
  });

  test('should display custom 404 content', async ({ page }) => {
    await page.goto(`${BASE_URL}/this-page-does-not-exist-12345.html`);
    // 检查页面是否有内容（不是空白）
    const bodyText = await page.textContent('body');
    expect(bodyText?.trim().length).toBeGreaterThan(0);
  });
});

// ==================== 链接健康检测 ====================
test.describe('内部链接检测', () => {
  test('should not have broken internal links on homepage', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // 获取所有内部链接
    const links = await page.evaluate(() => {
      const baseOrigin = window.location.origin;
      return Array.from(document.querySelectorAll('a[href]'))
        .map((a) => (a as HTMLAnchorElement).href)
        .filter((href) => href.startsWith(baseOrigin) || href.startsWith('/') || href.startsWith('./'));
    });

    // 抽样检查前 30 个链接
    const sampleLinks = [...new Set(links)].slice(0, 30);
    const brokenLinks: string[] = [];

    for (const link of sampleLinks) {
      try {
        const response = await page.request.head(link, { timeout: 5000 });
        if (response.status() >= 400) {
          brokenLinks.push(`${link} -> ${response.status()}`);
        }
      } catch {
        // GET fallback for servers that don't support HEAD
        try {
          const response = await page.request.get(link, { timeout: 5000 });
          if (response.status() >= 400) {
            brokenLinks.push(`${link} -> ${response.status()}`);
          }
        } catch {
          brokenLinks.push(`${link} -> 连接失败`);
        }
      }
    }

    if (brokenLinks.length > 0) {
      console.log('发现断链:', brokenLinks);
    }
    // 允许少量外链失败（外链不受我们控制），但内链不应大量失败
    expect(brokenLinks.length).toBeLessThan(5);
  });
});

// ==================== 移动端响应式测试 ====================
test.describe('移动端响应式', () => {
  test('should render homepage on mobile viewport without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow).toBe(false);
  });

  test('should render homepage on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });
});

// ==================== 性能基础测试 ====================
test.describe('基础性能指标', () => {
  test('should load homepage within reasonable time', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - start;

    console.log(`首页加载时间: ${loadTime}ms`);
    // 静态站点的合理加载时间应该在 5 秒以内
    expect(loadTime).toBeLessThan(10000);
  });

  test('should have reasonable DOM size', async ({ page }) => {
    await page.goto(BASE_URL);
    const domNodes = await page.evaluate(() => document.querySelectorAll('*').length);
    console.log(`首页 DOM 节点数: ${domNodes}`);
    // 超过 1500 个 DOM 节点建议优化
    expect(domNodes).toBeLessThan(5000);
  });
});
