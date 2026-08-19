/**
 * Playwright 配置文件 - ciallo0721-cmd.top 测试套件
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [
    ['html', { outputFolder: 'tests/reports/playwright-report' }],
    ['list'],
    ['json', { outputFile: 'tests/reports/test-results.json' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium', channel: 'chrome' }, // 使用系统 Chrome（C 盘空间不足无法安装 Playwright Chromium）
    },
    {
      name: 'msedge',
      use: { browserName: 'chromium', channel: 'msedge' },
    },
  ],
});
