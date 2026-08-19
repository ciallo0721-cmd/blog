/**
 * 端测测 — 链接健康检测脚本
 * 扫描项目中所有 HTML 文件的内链/外链，验证可达性
 * 无需浏览器，通过 HTTP HEAD/GET 请求检测
 * 
 * 用法: node tests/analysis/link-checker.js [--port=8080]
 */
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '../..');
const SERVER_PORT = process.argv.find(a => a.startsWith('--port='))?.split('=')[1] || '8080';
const BASE = `http://127.0.0.1:${SERVER_PORT}`;

const results = {
  total: 0,
  ok: 0,
  broken: [],
  external: [],
  warnings: [],
  score: 100,
};

// ============ 提取所有链接 ============
function extractLinks(content, filePath) {
  const links = [];
  // 提取 a href
  const aRegex = /<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = aRegex.exec(content)) !== null) {
    links.push({ url: m[1], type: 'a', file: filePath });
  }
  // 提取 link href
  const linkRegex = /<link\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi;
  while ((m = linkRegex.exec(content)) !== null) {
    links.push({ url: m[1], type: 'link', file: filePath });
  }
  // 提取 script src
  const scriptRegex = /<script\s+[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi;
  while ((m = scriptRegex.exec(content)) !== null) {
    links.push({ url: m[1], type: 'script', file: filePath });
  }
  // 提取 img src
  const imgRegex = /<img\s+[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi;
  while ((m = imgRegex.exec(content)) !== null) {
    links.push({ url: m[1], type: 'img', file: filePath });
  }
  return links;
}

// ============ 分类链接 ============
function classifyLink(url) {
  if (!url || url.startsWith('#') || url.startsWith('javascript:') || url.startsWith('mailto:') || url.startsWith('tel:')) {
    return 'skip';
  }
  // 跳过模板字面量
  if (url.includes('${')) {
    return 'skip';
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // 检查是否是本站 (本地开发)
    if (url.startsWith('http://127.0.0.1') || url.startsWith('http://localhost')) {
      return 'internal-absolute';
    }
    // 生产 URL - 跳过本地检查
    return 'external';
  }
  // 相对路径或根路径
  if (url.startsWith('//')) return 'external';
  return 'internal-relative';
}

// ============ HTTP 检查 ============
function checkURL(url, timeout = 5000) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname + (parsed.search || ''),
      method: 'HEAD',
      timeout,
      headers: { 'User-Agent': 'Endu/test-link-checker' },
    };

    const req = http.request(options, (res) => {
      const status = res.statusCode;
      if (status >= 200 && status < 400) {
        resolve({ ok: true, status });
      } else if (status >= 400 && status < 500) {
        resolve({ ok: false, status, error: `HTTP ${status}` });
      } else {
        resolve({ ok: false, status, error: `服务器错误 ${status}` });
      }
    });

    req.on('error', (e) => {
      resolve({ ok: false, error: e.message });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: '超时' });
    });
    req.end();
  });
}

// 解析相对路径
function resolveRelative(currentFile, relativeUrl) {
  let resolved;

  // 去掉 query string 和 hash
  const cleanUrl = relativeUrl.split('?')[0].split('#')[0];

  if (cleanUrl.startsWith('/')) {
    // 根相对路径 -> 相对于项目根目录
    resolved = path.join(ROOT, cleanUrl);
  } else if (cleanUrl.startsWith('./') || cleanUrl.startsWith('../') || !cleanUrl.includes('://')) {
    // 相对路径
    const currentDir = path.dirname(currentFile);
    resolved = path.resolve(path.join(currentDir, cleanUrl));
  } else {
    return { ok: false, error: '无效路径' };
  }

  // 如果在项目根目录下，转为本地文件检查
  if (resolved.startsWith(ROOT)) {
    if (fs.existsSync(resolved)) {
      const stat = fs.statSync(resolved);
      if (stat.isDirectory()) {
        const idxPath = path.join(resolved, 'index.html');
        if (fs.existsSync(idxPath)) return { ok: true, type: 'dir-with-index' };
        return { ok: true, type: 'directory' };
      }
      return { ok: true, type: 'file', size: (stat.size / 1024).toFixed(1) + 'KB' };
    }
    return { ok: false, error: '文件不存在' };
  }
  return { ok: false, error: '路径超出项目范围' };
}

// ============ 主流程 ============
async function main() {
  console.log('🔗 端测测 — 链接健康检测开始...\n');

  // 查找所有 HTML 文件
  function findHTML(dir, d = 2) {
    let r = [];
    try {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (['node_modules', '.git', 'renpy', '.workbuddy'].includes(e.name)) continue;
        if (e.name.startsWith('.')) continue;
        const fp = path.join(dir, e.name);
        if (e.isDirectory() && d > 0) r = r.concat(findHTML(fp, d - 1));
        else if (e.isFile() && /\.(html|htm)$/i.test(e.name)) r.push(fp);
      }
    } catch (_) {}
    return r;
  }

  const htmlFiles = findHTML(ROOT);
  console.log(`📄 扫描 ${htmlFiles.length} 个 HTML 文件...\n`);

  const allLinks = [];
  for (const fp of htmlFiles) {
    try {
      const content = fs.readFileSync(fp, 'utf-8');
      allLinks.push(...extractLinks(content, path.relative(ROOT, fp)));
    } catch (e) {
      results.warnings.push({ file: path.relative(ROOT, fp), error: e.message });
    }
  }

  // 去重
  const seen = new Set();
  const unique = allLinks.filter(l => {
    const key = `${l.url}|${l.file}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  results.total = unique.length;
  console.log(`🔍 发现 ${unique.length} 个链接 (去重后)\n`);

  // 分类
  const internal = unique.filter(l => {
    const cls = classifyLink(l.url);
    return cls === 'internal-relative' || cls === 'internal-absolute';
  });
  const external = unique.filter(l => classifyLink(l.url) === 'external');
  const skipped = unique.filter(l => classifyLink(l.url) === 'skip');

  console.log(`  📍 内链: ${internal.length} 个`);
  console.log(`  🌐 外链: ${external.length} 个`);
  console.log(`  ⏭️ 跳过: ${skipped.length} 个 (锚点/js/邮件等)`);
  console.log();

  // 检查内链
  const brokenInternal = [];
  for (const link of internal.slice(0, 200)) {  // 限制检查数量
    const result = resolveRelative(path.join(ROOT, link.file), link.url);
    if (!result.ok) {
      brokenInternal.push({ ...link, error: result.error });
    } else {
      results.ok++;
    }
  }

  // 抽样检查外链 (检查前 30 个)
  console.log('🌐 正在抽样检查外链...\n');
  for (const link of external.slice(0, 30)) {
    try {
      const fullUrl = link.url.startsWith('//') ? `https:${link.url}` : link.url;
      const res = await checkURL(fullUrl, 8000);
      if (res.ok) {
        results.ok++;
      } else {
        results.warnings.push({ ...link, error: res.error });
      }
    } catch (e) {
      results.warnings.push({ ...link, error: e.message });
    }
  }

  // 评分: 100基础 - 每断裂内链扣3分(最多扣60)
  const brokenCount = brokenInternal.length;
  results.score = Math.max(40, 100 - brokenCount * 3);
  results.broken = brokenInternal;

  // 输出
  console.log(`\n${'='.repeat(56)}`);
  console.log('📊 链接健康报告');
  console.log(`${'='.repeat(56)}`);
  console.log(`  总链接: ${results.total}`);
  console.log(`  ✅ 正常: ${results.ok}`);
  console.log(`  ❌ 内链断裂: ${brokenInternal.length}`);
  console.log(`  ⚠️ 外链警告: ${results.warnings.length}`);
  console.log(`  🎯 评分: ${results.score}/100`);
  console.log();

  if (brokenInternal.length > 0) {
    console.log('=== ❌ 断裂的内链 ===');
    brokenInternal.forEach(l => {
      console.log(`  ❌ ${l.file} → ${l.url} (${l.error})`);
    });
    console.log();
  }

  if (results.warnings.length > 0) {
    console.log('=== ⚠️ 外链警告 (抽样) ===');
    results.warnings.slice(0, 15).forEach(w => {
      console.log(`  ⚠️ ${w.file} → ${w.url} (${w.error})`);
    });
    console.log();
  }

  // 保存报告
  const reportPath = path.join(ROOT, 'tests/reports/link-check.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    ...results,
  }, null, 2));
  console.log(`📝 报告已保存: tests/reports/link-check.json`);
}

main().catch(e => {
  console.error('链接检测失败:', e.message);
  process.exit(1);
});
