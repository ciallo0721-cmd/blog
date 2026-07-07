/**
 * 端测测 — 基础性能检测脚本
 * 通过 HTTP 请求测量页面关键性能指标
 * 无需浏览器，基于 HTTP 响应分析
 * 
 * 用法: node tests/performance/perf-check.js [--port=8080]
 */
const fs = require('fs');
const path = require('path');
const http = require('http');

const SERVER_PORT = process.argv.find(a => a.startsWith('--port='))?.split('=')[1] || '8080';
const BASE = `http://127.0.0.1:${SERVER_PORT}`;
const ROOT = path.resolve(__dirname, '../..');

// 要测试的关键页面
const KEY_PAGES = [
  { path: '/', name: '首页' },
  { path: '/aboutme.html', name: '关于我' },
  { path: '/friends.html', name: '友情链接' },
  { path: '/404.html', name: '404页' },
  { path: '/blog/', name: '博客首页' },
  { path: '/wz.html', name: '文章列表' },
  { path: '/timeline.html', name: '时间线' },
  { path: '/status.html', name: '状态页' },
];

// ============ HTTP 测量 ============
function measurePage(pagePath) {
  return new Promise((resolve) => {
    const start = Date.now();
    const url = new URL(pagePath, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + (url.search || ''),
      method: 'GET',
      timeout: 30000,
      headers: {
        'Accept-Encoding': 'gzip, deflate',
        'User-Agent': 'Endu/perf-checker',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      let firstByte = Date.now() - start;

      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        const totalTime = Date.now() - start;
        const size = Buffer.byteLength(body, 'utf-8');
        const sizeKB = (size / 1024).toFixed(1);
        const headers = res.headers;

        resolve({
          page: pagePath,
          status: res.statusCode,
          ttfb: firstByte,           // Time To First Byte
          totalTime,
          size: parseFloat(sizeKB),
          sizeBytes: size,
          contentEncoding: headers['content-encoding'] || 'none',
          cacheControl: headers['cache-control'] || 'not set',
          contentType: headers['content-type'] || 'unknown',
        });
      });
    });

    req.on('error', (e) => {
      resolve({
        page: pagePath,
        status: 0,
        error: e.message,
        totalTime: Date.now() - start,
      });
    });
    req.end();
  });
}

// ============ 分析结果 ============
function analyze(results, pageName) {
  const issues = [];
  const passes = [];

  if (results.status === 0) {
    issues.push({ severity: 'fail', msg: `无法连接: ${results.error}` });
    return { issues, passes, score: 0 };
  }

  // HTTP 状态
  if (results.status >= 200 && results.status < 300) {
    passes.push(`HTTP ${results.status} OK`);
  } else if (results.status >= 400) {
    issues.push({ severity: 'fail', msg: `HTTP 状态异常: ${results.status}` });
  }

  // TTFB
  if (results.ttfb < 200) {
    passes.push(`TTFB ${results.ttfb}ms (优秀)`);
  } else if (results.ttfb < 500) {
    issues.push({ severity: 'warn', msg: `TTFB ${results.ttfb}ms (可接受)` });
  } else {
    issues.push({ severity: 'warn', msg: `TTFB ${results.ttfb}ms (偏慢)` });
  }

  // 文件大小
  if (results.size < 50) {
    passes.push(`大小 ${results.size}KB (优秀)`);
  } else if (results.size < 200) {
    issues.push({ severity: 'warn', msg: `大小 ${results.size}KB (中等)` });
  } else {
    issues.push({ severity: 'warn', msg: `大小 ${results.size}KB (偏大，建议优化)` });
  }

  // Cache
  if (results.cacheControl && results.cacheControl !== 'not set') {
    passes.push(`Cache-Control: ${results.cacheControl}`);
  } else {
    issues.push({ severity: 'warn', msg: '缺少 Cache-Control 响应头' });
  }

  // 大文件检测
  if (results.size > 500) {
    issues.push({ severity: 'warn', msg: `超大文件 (${results.size}KB)，建议拆分` });
  }

  const failCount = issues.filter(i => i.severity === 'fail').length;
  const warnCount = issues.filter(i => i.severity === 'warn').length;
  const score = Math.max(0, 100 - failCount * 20 - warnCount * 5);

  return { issues, passes, score };
}

// ============ 扫描大资源 ============
function findLargeFiles(dir, minKB = 500, maxDepth = 2) {
  const large = [];
  function scan(d, depth) {
    if (depth < 0) return;
    try {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        if (['node_modules', '.git', '.workbuddy', '__pycache__'].includes(e.name)) continue;
        const fp = path.join(d, e.name);
        if (e.isDirectory() && depth > 0) scan(fp, depth - 1);
        else if (e.isFile()) {
          const stat = fs.statSync(fp);
          const kb = stat.size / 1024;
          if (kb > minKB) {
            large.push({ file: path.relative(ROOT, fp), sizeKB: kb.toFixed(1), type: path.extname(fp) });
          }
        }
      }
    } catch (_) {}
  }
  scan(dir, maxDepth);
  return large.sort((a, b) => parseFloat(b.sizeKB) - parseFloat(a.sizeKB));
}

// ============ 主流程 ============
async function main() {
  console.log('⚡ 端测测 — 基础性能检测开始...\n');

  // 1. 测试关键页面
  console.log('📡 测试关键页面...\n');
  const pageResults = [];
  for (const page of KEY_PAGES) {
    process.stdout.write(`  正在测量 ${page.name} (${page.path}) ... `);
    const result = await measurePage(page.path);
    const analysis = analyze(result, page.name);
    pageResults.push({ ...page, ...result, analysis });
    const icon = analysis.score >= 90 ? '✅' : analysis.score >= 70 ? '⚠️' : '❌';
    console.log(`${icon} ${analysis.score}/100 | ${result.size}KB | ${result.ttfb}ms`);
  }

  console.log();

  // 2. 扫描大文件
  console.log('📦 扫描大文件 (>500KB)...\n');
  const largeFiles = findLargeFiles(ROOT, 500);
  if (largeFiles.length > 0) {
    largeFiles.slice(0, 20).forEach((f, i) => {
      console.log(`  ${(i + 1).toString().padStart(2)}. ${f.sizeKB.padStart(8)} KB  ${f.file}`);
    });
    console.log(`  ... 共 ${largeFiles.length} 个大文件\n`);
  }

  // 3. 综合评分
  const avgScore = Math.round(pageResults.reduce((s, p) => s + (p.analysis?.score || 0), 0) / pageResults.length);
  const avgTTFB = Math.round(pageResults.reduce((s, p) => s + (p.ttfb || 0), 0) / pageResults.length);
  const totalSize = pageResults.reduce((s, p) => s + (p.sizeBytes || 0), 0);

  console.log(`${'='.repeat(56)}`);
  console.log('📊 性能报告');
  console.log(`${'='.repeat(56)}`);
  console.log(`  📄 测试页面: ${pageResults.length} 个`);
  console.log(`  ⚡ 平均 TTFB: ${avgTTFB}ms`);
  console.log(`  📦 页面总大小: ${(totalSize / 1024).toFixed(1)}KB`);
  console.log(`  🗂️ 大文件 (>500KB): ${largeFiles.length} 个`);
  console.log(`  🎯 综合评分: ${avgScore}/100`);
  console.log();

  // 详情
  for (const pr of pageResults) {
    const a = pr.analysis;
    if (a && a.issues.length > 0) {
      console.log(`--- ${pr.name} (${pr.path}) ---`);
      a.issues.forEach(i => console.log(`  ${i.severity === 'fail' ? '❌' : '⚠️'} ${i.msg}`));
    }
  }

  console.log();

  // 保存报告
  const report = {
    timestamp: new Date().toISOString(),
    avgScore,
    avgTTFB,
    totalSize,
    largeFileCount: largeFiles.length,
    pages: pageResults.map(p => ({
      path: p.path,
      name: p.name,
      status: p.status,
      ttfb: p.ttfb,
      size: p.size,
      score: p.analysis?.score || 0,
      issues: p.analysis?.issues || [],
    })),
    largeFiles: largeFiles.slice(0, 30),
  };

  fs.writeFileSync(
    path.join(ROOT, 'tests/reports/perf-check.json'),
    JSON.stringify(report, null, 2)
  );
  console.log('📝 报告已保存: tests/reports/perf-check.json');
}

main().catch(e => {
  console.error('性能检测失败:', e.message);
  process.exit(1);
});
