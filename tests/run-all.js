#!/usr/bin/env node
/**
 * 端测测 — 测试编排器
 * 依次运行所有测试模块，生成综合测试报告
 * 
 * 用法: node tests/run-all.js [选项]
 *   选项:
 *     --skip-e2e       跳过 E2E 测试 (浏览器不可用时)
 *     --skip-link      跳过链接检测
 *     --quick          快速模式 (减少检查数量)
 *     --port=<port>    指定服务器端口 (默认 8080)
 */
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = process.argv.find(a => a.startsWith('--port='))?.split('=')[1] || '8080';
const SKIP_E2E = process.argv.includes('--skip-e2e');
const SKIP_LINK = process.argv.includes('--skip-link');
const QUICK = process.argv.includes('--quick');

const REPORT_DIR = path.join(ROOT, 'tests/reports');
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

// ============ 服务器管理 ============
let serverProcess = null;

function startServer() {
  return new Promise((resolve, reject) => {
    serverProcess = spawn('python', ['-m', 'http.server', PORT], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    
    let started = false;
    serverProcess.stderr.on('data', (data) => {
      // Python http.server 在 stderr 输出启动信息
      if (!started && data.toString().includes('http')) {
        started = true;
        setTimeout(() => resolve(), 500);
      }
    });
    
    serverProcess.on('error', reject);
    
    // 超时
    setTimeout(() => {
      if (!started) {
        started = true;
        resolve(); // 假设已启动
      }
    }, 3000);
  });
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
}

// ============ 运行模块 ============
function runModule(name, script, args = []) {
  console.log(`\n${'━'.repeat(56)}`);
  console.log(`🚀 运行: ${name}`);
  console.log(`${'━'.repeat(56)}\n`);
  
  try {
    const cmd = `node "${path.join(__dirname, script)}" ${args.join(' ')}`;
    execSync(cmd, { cwd: ROOT, stdio: 'inherit', timeout: 60000 });
    return { module: name, status: 'ok' };
  } catch (e) {
    console.error(`\n❌ ${name} 执行失败: ${e.message}\n`);
    return { module: name, status: 'error', error: e.message };
  }
}

// ============ 生成综合 HTML 报告 ============
function generateHTMLReport(moduleResults) {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'));
  
  // 读取各模块报告
  let staticReport = null, linkReport = null, perfReport = null;
  try { staticReport = JSON.parse(fs.readFileSync(path.join(REPORT_DIR, 'static-analysis.json'), 'utf-8')); } catch (_) {}
  try { linkReport = JSON.parse(fs.readFileSync(path.join(REPORT_DIR, 'link-check.json'), 'utf-8')); } catch (_) {}
  try { perfReport = JSON.parse(fs.readFileSync(path.join(REPORT_DIR, 'perf-check.json'), 'utf-8')); } catch (_) {}

  const overallScore = Math.round(
    ((staticReport?.score || 0) + (linkReport?.score || 0) + (perfReport?.avgScore || 0)) / 3
  );

  const getBadge = (s) => s >= 90 ? '🟢' : s >= 70 ? '🟡' : '🔴';

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>端测测 - ciallo0721-cmd.top 测试报告</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0d1117; color: #c9d1d9; line-height:1.6; }
    .container { max-width: 900px; margin:0 auto; padding:40px 20px; }
    h1 { font-size:2em; color:#58a6ff; border-bottom:2px solid #30363d; padding-bottom:16px; margin-bottom:24px; }
    h2 { font-size:1.3em; color:#f0f6fc; margin:24px 0 16px; }
    .meta { color:#8b949e; font-size:0.9em; margin-bottom:24px; }
    
    .scoreboard { display:flex; gap:16px; flex-wrap:wrap; margin-bottom:32px; }
    .score-card { flex:1; min-width:180px; background:#161b22; border:1px solid #30363d; border-radius:8px; padding:20px; text-align:center; }
    .score-card .score { font-size:3em; font-weight:700; }
    .score-card .label { color:#8b949e; font-size:0.85em; margin-top:4px; }
    .score-card.green .score { color:#3fb950; }
    .score-card.yellow .score { color:#d29922; }
    .score-card.red .score { color:#f85149; }
    
    table { width:100%; border-collapse:collapse; margin:16px 0; }
    th, td { padding:10px 14px; text-align:left; border-bottom:1px solid #21262d; }
    th { background:#161b22; color:#8b949e; font-size:0.85em; text-transform:uppercase; }
    tr:hover td { background:#1c2129; }
    
    .badge { display:inline-block; padding:2px 8px; border-radius:12px; font-size:0.75em; font-weight:600; }
    .badge-fail { background:#f8514922; color:#f85149; }
    .badge-warn { background:#d2992222; color:#d29922; }
    .badge-pass { background:#3fb95022; color:#3fb950; }
    
    .issue { margin:8px 0; padding:8px 12px; border-left:3px solid; border-radius:0 4px 4px 0; }
    .issue.fail { border-color:#f85149; background:#f8514911; }
    .issue.warn { border-color:#d29922; background:#d2992211; }
    .issue.info { border-color:#58a6ff; background:#58a6ff11; }
    
    .footer { margin-top:40px; padding-top:16px; border-top:1px solid #30363d; color:#484f58; font-size:0.8em; text-align:center; }
    
    @media (max-width:600px) {
      .container { padding:16px; }
      .scoreboard { flex-direction:column; }
      h1 { font-size:1.5em; }
    }
  </style>
</head>
<body>
<div class="container">
  <h1>🧪 端测测 — ciallo0721-cmd.top 测试报告</h1>
  <div class="meta">
    测试日期: ${new Date().toISOString().split('T')[0]} | 
    项目: ${pkg.name || 'ciallo0721-cmd.github.io'} |
    环境: 本地 ${`http://127.0.0.1:${PORT}`} |
    模式: ${QUICK ? '快速' : '完整'} | 
    浏览器: ${SKIP_E2E ? '跳过' : '系统 Chrome'}
  </div>

  <h2>📊 综合评分</h2>
  <div class="scoreboard">
    <div class="score-card green">
      <div class="score">${overallScore}</div>
      <div class="label">综合评分 / 100</div>
    </div>
    <div class="score-card ${staticReport?.score >= 70 ? 'green' : 'yellow'}">
      <div class="score">${staticReport?.score || 'N/A'}</div>
      <div class="label">静态分析</div>
    </div>
    <div class="score-card ${linkReport?.score >= 70 ? 'green' : 'yellow'}">
      <div class="score">${linkReport?.score || 'N/A'}</div>
      <div class="label">链接健康</div>
    </div>
    <div class="score-card ${perfReport?.avgScore >= 70 ? 'green' : 'yellow'}">
      <div class="score">${perfReport?.avgScore || 'N/A'}</div>
      <div class="label">基础性能</div>
    </div>
  </div>

  <h2>📋 模块状态</h2>
  <table>
    <tr><th>模块</th><th>状态</th><th>详情</th></tr>
    ${moduleResults.map(m => `
    <tr>
      <td>${m.module}</td>
      <td><span class="badge ${m.status === 'ok' ? 'badge-pass' : 'badge-fail'}">${m.status === 'ok' ? '✅ 通过' : '❌ 失败'}</span></td>
      <td style="font-size:0.85em;color:#8b949e;">${m.error || '-'}</td>
    </tr>`).join('')}
  </table>

  ${staticReport ? `
  <h2>🔍 静态分析详情</h2>
  <p style="color:#8b949e;">文件数: ${staticReport.files?.length || 0} | 评分: ${getBadge(staticReport.score)} ${staticReport.score}/100</p>
  
  ${staticReport.fails?.length > 0 ? `
  <h3>❌ 需修复项 (${staticReport.fails.length})</h3>
  ${staticReport.fails.map(f => `<div class="issue fail"><strong>${f.check}</strong>: ${f.detail}</div>`).join('')}
  ` : '<p style="color:#3fb950;">✅ 无失败项</p>'}
  
  ${staticReport.warns?.length > 0 ? `
  <h3>⚠️ 需关注项 (${staticReport.warns.length})</h3>
  ${staticReport.warns.slice(0, 20).map(w => `<div class="issue warn"><strong>${w.check}</strong>: ${w.detail}</div>`).join('')}
  ${staticReport.warns.length > 20 ? `<p style="color:#8b949e;">... 共 ${staticReport.warns.length} 项</p>` : ''}
  ` : ''}
  ` : ''}

  ${linkReport ? `
  <h2>🔗 链接健康</h2>
  <p style="color:#8b949e;">总链接: ${linkReport.total} | 断裂: ${linkReport.broken?.length || 0} | 评分: ${getBadge(linkReport.score)} ${linkReport.score}/100</p>
  ${linkReport.broken?.length > 0 ? linkReport.broken.map(b => `<div class="issue fail">${b.file} → ${b.url}: ${b.error}</div>`).join('') : '<p style="color:#3fb950;">✅ 无断链</p>'}
  ` : ''}

  ${perfReport ? `
  <h2>⚡ 性能指标</h2>
  <table>
    <tr><th>页面</th><th>TTFB</th><th>大小</th><th>评分</th></tr>
    ${perfReport.pages?.map(p => `
    <tr>
      <td>${p.name} (${p.path})</td>
      <td>${p.ttfb}ms</td>
      <td>${p.size}KB</td>
      <td><span class="badge ${p.score >= 90 ? 'badge-pass' : p.score >= 70 ? 'badge-warn' : 'badge-fail'}">${p.score}/100</span></td>
    </tr>`).join('') || ''}
  </table>
  
  ${perfReport.largeFileCount > 0 ? `
  <h3>📦 大文件清单 (>500KB, 共${perfReport.largeFileCount}个)</h3>
  <ul style="margin:12px 0; list-style:none;">
    ${perfReport.largeFiles?.slice(0, 10).map(f => `<li style="padding:4px 0;color:#8b949e;">📄 ${f.sizeKB}KB — ${f.file}</li>`).join('') || ''}
    ${perfReport.largeFileCount > 10 ? `<li style="color:#484f58;">... 共 ${perfReport.largeFileCount} 个</li>` : ''}
  </ul>
  ` : ''}
  ` : ''}

  <div class="footer">
    端测测 Web 应用测试专家 | 测试不是抓 bug，是让团队敢发布 🚀<br>
    报告生成时间: ${new Date().toLocaleString('zh-CN')}
  </div>
</div>
</body>
</html>`;

  const htmlPath = path.join(REPORT_DIR, `test-report-${new Date().toISOString().split('T')[0]}.html`);
  fs.writeFileSync(htmlPath, html);
  return htmlPath;
}

// ============ 主流程 ============
async function main() {
  const startTime = Date.now();
  console.log('🧪 端测测 — 开始综合测试\n');
  console.log(`⏰ ${new Date().toLocaleString('zh-CN')}`);
  console.log(`📁 项目: ${ROOT}`);
  console.log(`🔌 端口: ${PORT}`);
  console.log(`🏃 模式: ${QUICK ? '快速' : '完整'} | E2E: ${SKIP_E2E ? '跳过' : '启用'} | 链接: ${SKIP_LINK ? '跳过' : '启用'}\n`);

  console.log('📡 启动本地服务器...');
  await startServer();
  console.log(`✅ 服务器已启动: http://127.0.0.1:${PORT}\n`);

  const moduleResults = [];

  // 1. 静态分析 (不需要服务器)
  const saResult = runModule('静态分析', 'analysis/static-analysis.js');
  moduleResults.push(saResult);

  // 2. 基础性能 (需要服务器)
  const perfResult = runModule('基础性能检测', 'performance/perf-check.js', [`--port=${PORT}`]);
  moduleResults.push(perfResult);

  // 3. 链接检测
  if (!SKIP_LINK) {
    const linkResult = runModule('链接健康检测', 'analysis/link-checker.js', [`--port=${PORT}`]);
    moduleResults.push(linkResult);
  }

  // 4. E2E 测试
  if (!SKIP_E2E) {
    try {
      console.log(`\n${'━'.repeat(56)}`);
      console.log('🎭 运行: Playwright E2E 测试');
      console.log(`${'━'.repeat(56)}\n`);
      execSync('npx playwright test --project=chromium', { cwd: ROOT, stdio: 'inherit', timeout: 120000 });
      moduleResults.push({ module: 'E2E 测试 (Playwright)', status: 'ok' });
    } catch (e) {
      console.error('\n⚠️ E2E 测试失败 (可能因浏览器环境问题)');
      moduleResults.push({ module: 'E2E 测试 (Playwright)', status: 'error', error: '浏览器环境不可用' });
    }
  }

  // 停止服务器
  stopServer();
  console.log('\n🛑 服务器已停止');

  // 生成报告
  console.log('\n📝 生成综合 HTML 报告...');
  const reportPath = generateHTMLReport(moduleResults);
  console.log(`✅ 报告已生成: ${path.relative(ROOT, reportPath)}`);

  // 总结
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const okCount = moduleResults.filter(m => m.status === 'ok').length;
  
  console.log(`\n${'═'.repeat(56)}`);
  console.log(`  ✅ 完成: ${okCount}/${moduleResults.length} 个模块通过`);
  console.log(`  ⏱️ 耗时: ${elapsed}s`);
  console.log(`  📊 报告: ${path.relative(ROOT, reportPath)}`);
  console.log(`${'═'.repeat(56)}\n`);

  console.log('🎉 端测测已完成。好的测试不是抓 bug，是让团队敢发布！');
}

// 清理
process.on('SIGINT', () => { stopServer(); process.exit(); });
process.on('exit', () => stopServer());

main().catch(e => {
  stopServer();
  console.error('测试流程异常:', e.message);
  process.exit(1);
});
