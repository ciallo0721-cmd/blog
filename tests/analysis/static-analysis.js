/**
 * 端测测 — 静态分析脚本
 * 对 ciallo0721-cmd.top 的所有 HTML 页面进行结构化扫描
 * 无需浏览器，纯静态分析
 * 
 * 用法: node tests/analysis/static-analysis.js [--port=8080]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const SERVER_PORT = process.argv.find(a => a.startsWith('--port='))?.split('=')[1] || '8080';
const BASE = process.argv.find(a => a.startsWith('--base='))?.split('=')[1] || `http://127.0.0.1:${SERVER_PORT}`;

// ============ 工具函数 ============
const results = { pass: [], warn: [], fail: [], info: [] };
let totalChecks = 0;
let failCount = 0;
let warnCount = 0;

function add(level, check, detail, penalty = 0) {
  const entry = { check, detail };
  totalChecks++;
  if (level === 'fail') { results.fail.push(entry); failCount++; }
  else if (level === 'warn') { results.warn.push(entry); warnCount++; }
  else if (level === 'pass') { results.pass.push(entry); }
  else { results.info.push(entry); }
}

// ============ HTML 文件分析 ============
function analyzeHTML(filePath, content) {
  const fileName = path.basename(filePath);
  const lines = content.split('\n');

  // 1. DOCTYPE
  if (/<!DOCTYPE\s+html/i.test(content)) {
    add('pass', 'DOCTYPE 声明', `${fileName} 有 DOCTYPE`);
  } else {
    add('fail', 'DOCTYPE 缺失', `${fileName} 缺少 <!DOCTYPE html>`, 5);
  }

  // 2. lang 属性
  const htmlTag = content.match(/<html[^>]*>/i);
  if (!htmlTag) {
    add('fail', 'html 标签', `${fileName} 没有 <html> 标签`, 5);
  } else {
    if (/lang\s*=/i.test(htmlTag[0])) {
      add('pass', 'lang 属性', `${fileName} 已声明语言`);
    } else {
      add('warn', 'lang 属性缺失', `${fileName} <html> 标签缺少 lang 属性`, 3);
    }
  }

  // 3. charset
  if (/charset\s*=/i.test(content) || /<meta[^>]*charset/i.test(content)) {
    add('pass', '字符编码', `${fileName} 声明了 charset`);
  } else {
    add('warn', '字符编码缺失', `${fileName} 未声明 charset`, 2);
  }

  // 4. viewport (移动端适配)
  if (/viewport/i.test(content)) {
    const vp = content.match(/<meta[^>]*viewport[^>]*>/i);
    if (vp && /width\s*=\s*device-width/i.test(vp[0])) {
      add('pass', 'viewport', `${fileName} 正确配置 viewport`);
    } else {
      add('warn', 'viewport 不完整', `${fileName} viewport 缺少 width=device-width`, 1);
    }
  } else {
    add('warn', 'viewport 缺失', `${fileName} 缺少 viewport meta 标签`, 3);
  }

  // 5. title
  const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
  if (titleMatch && titleMatch[1].trim()) {
    add('pass', 'title 标签', `${fileName}: "${titleMatch[1].trim()}"`);
  } else {
    add('fail', 'title 缺失', `${fileName} 缺少有意义的 <title>`, 3);
  }

  // 6. meta description
  if (/<meta[^>]*name\s*=\s*["']description["'][^>]*>/i.test(content)) {
    add('pass', 'meta description', `${fileName} 有 description`);
  } else {
    add('warn', 'meta description 缺失', `${fileName} 缺少 description`, 2);
  }

  // 7. 语义化标签
  const semTags = ['header', 'main', 'footer', 'nav', 'section', 'article', 'aside'];
  const found = semTags.filter(t => new RegExp(`<${t}[\\s>]`, 'i').test(content));
  if (found.length >= 3) {
    add('pass', '语义化标签', `${fileName} 使用了 ${found.join(', ')}`);
  } else if (found.length > 0) {
    add('warn', '语义化标签偏少', `${fileName} 仅使用了 ${found.join(', ') || '无'}`, 1);
  }
}

// ============ CSS 质量分析 ============
function analyzeCSS(content, fileName) {
  // 内联 style 属性
  const inlineStyles = content.match(/style\s*=\s*["'][^"']*["']/gi) || [];
  if (inlineStyles.length > 20) {
    add('warn', '内联 style 过多', `${fileName}: ${inlineStyles.length} 个内联 style (建议<20)`, inlineStyles.length > 50 ? 3 : 1);
  }

  // !important
  const importantCount = (content.match(/!important/gi) || []).length;
  if (importantCount > 10) {
    add('warn', '!important 过多', `${fileName}: ${importantCount} 处 !important (建议<10)`, 2);
  }

  // px 字体
  const pxFont = content.match(/font-size\s*:\s*\d+px/gi) || [];
  if (pxFont.length > 10) {
    add('warn', 'px 字体', `${fileName}: ${pxFont.length} 处 px 字体 (应改用 rem/em)`, 1);
  }

  // 内联 CSS (>style>)
  const styleBlocks = content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
  let totalCssLines = 0;
  styleBlocks.forEach(b => {
    const inner = b.replace(/<\/?style[^>]*>/gi, '');
    totalCssLines += inner.split('\n').filter(l => l.trim()).length;
  });
  if (totalCssLines > 200) {
    add('warn', '内联CSS过多', `${fileName}: ~${totalCssLines} 行内联 CSS (建议拆分外部文件)`, 2);
  }
}

// ============ JS 质量分析 ============
function analyzeJS(content, fileName) {
  // console.log 遗留
  const consoleLogs = (content.match(/console\.log\s*\(/g) || []).length;
  if (consoleLogs > 5) {
    add('warn', 'console.log 遗留', `${fileName}: ${consoleLogs} 个 console.log (生产环境应清理)`, 1);
  }

  // debugger 语句
  if (/debugger\s*;/.test(content)) {
    add('fail', 'debugger 遗留', `${fileName} 包含 debugger 语句`, 5);
  }

  // eval 使用
  if (/\beval\s*\(/.test(content)) {
    add('warn', 'eval 使用', `${fileName} 使用了 eval() (可能有安全风险)`, 3);
  }

  // 内联 JS 规模
  const scriptBlocks = content.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
  let inlineLines = 0;
  scriptBlocks.forEach(b => {
    const inner = b.replace(/<\/?script[^>]*>/gi, '');
    inlineLines += inner.split('\n').filter(l => l.trim()).length;
  });
  if (inlineLines > 300) {
    add('warn', '内联JS过多', `${fileName}: ~${inlineLines} 行内联 JS (建议拆分外部文件)`, 2);
  }
}

// ============ 外链安全分析 ============
function analyzeExternalLinks(content, fileName) {
  const targetBlankLinks = content.match(/<a[^>]*target\s*=\s*["']_blank["'][^>]*>/gi) || [];
  let noRel = 0;
  targetBlankLinks.forEach(link => {
    if (!/rel\s*=/i.test(link)) {
      noRel++;
    }
  });
  if (noRel > 5) {
    add('warn', '外链 rel 缺失', `${fileName}: ${noRel} 个 target="_blank" 外链缺少 rel="noopener noreferrer"`, 2);
  }
}

// ============ 图片标签分析 ============
function analyzeImages(content, fileName) {
  const imgs = content.match(/<img[^>]*>/gi) || [];
  let noAlt = 0;
  imgs.forEach(img => {
    if (!/\balt\s*=/i.test(img)) {
      noAlt++;
    }
  });
  if (noAlt > 0) {
    add('warn', 'img alt 缺失', `${fileName}: ${noAlt}/${imgs.length} 个 img 缺少 alt 属性 (可访问性)`, 2);
  }
}

// ============ ARIA / 可访问性 ============
function analyzeA11y(content, fileName) {
  const ariaAttrs = (content.match(/aria-/g) || []).length;
  const hasSkipLink = /skip.*(content|nav|link)/i.test(content) || /href\s*=\s*["']#(main|content)/i.test(content);
  const hasFormLabels = /<label[^>]*for\s*=/i.test(content);
  const tabindexCount = (content.match(/tabindex\s*=/gi) || []).length;

  if (ariaAttrs === 0) {
    add('warn', 'ARIA 属性', `${fileName}: 0 个 aria-* 属性 (屏幕阅读器支持不足)`, 1);
  }
  if (!hasSkipLink && fileName === 'index.html') {
    add('warn', '跳过导航链接', `${fileName}: 缺少 skip-to-content 链接`, 1);
  }
}

// ============ 安全 Header 模拟检测 ============
function analyzeSecurity(content, fileName) {
  // 检查 CSP (如果在 HTML 中声明)
  if (/Content-Security-Policy/i.test(content)) {
    add('pass', 'CSP 声明', `${fileName} 包含 CSP 策略`);
  }

  // 内联事件处理器
  const inlineHandlers = content.match(/on\w+\s*=\s*["'][^"']*["']/gi) || [];
  if (inlineHandlers.length > 10) {
    add('warn', '内联事件处理器', `${fileName}: ${inlineHandlers.length} 个 on* 属性`, 1);
  }
}

// ============ 主流程 ============
function findHTMLFiles(dir, maxDepth = 2) {
  let results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      // 跳过 node_modules, .git, 游戏目录
      if (['node_modules', '.git', 'renpy', 'game'].includes(entry.name)) continue;
      if (entry.name.startsWith('.')) continue;

      if (entry.isDirectory() && maxDepth > 0) {
        results = results.concat(findHTMLFiles(fullPath, maxDepth - 1));
      } else if (entry.isFile() && /\.(html|htm)$/i.test(entry.name)) {
        results.push(fullPath);
      }
    }
  } catch (e) {
    // 跳过无权限目录
  }
  return results;
}

console.log('🔍 端测测 — 静态分析开始...\n');
console.log(`📁 项目根目录: ${ROOT}\n`);

// 查找所有 HTML 文件
const htmlFiles = findHTMLFiles(ROOT);
console.log(`📄 发现 ${htmlFiles.length} 个 HTML 文件\n`);

// 分析每个 HTML 文件
const fileStats = [];
for (const filePath of htmlFiles) {
  const relPath = path.relative(ROOT, filePath);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const size = (Buffer.byteLength(content, 'utf-8') / 1024).toFixed(1);

    fileStats.push({
      file: relPath,
      size: parseFloat(size),
      lines: content.split('\n').length,
    });

    analyzeHTML(filePath, content);
    analyzeCSS(content, relPath);
    analyzeJS(content, relPath);
    analyzeExternalLinks(content, relPath);
    analyzeImages(content, relPath);
    analyzeA11y(content, relPath);
    analyzeSecurity(content, relPath);

  } catch (e) {
    add('fail', '文件读取失败', `${relPath}: ${e.message}`, 3);
  }
}

// ============ 输出结果 ============
console.log('='.repeat(56));
console.log('📊 文件大小统计');
console.log('='.repeat(56));
fileStats.sort((a, b) => b.size - a.size);
fileStats.forEach(f => {
  const bar = '█'.repeat(Math.min(30, Math.round(f.size / 10)));
  console.log(`  ${f.size.toFixed(1).padStart(7)} KB  ${bar}  ${f.file}`);
});

console.log(`\n${'='.repeat(56)}`);
console.log(`📋 分析结果汇总`);
console.log(`${'='.repeat(56)}`);
console.log(`  ✅ PASS: ${results.pass.length} 项`);
console.log(`  ⚠️  WARN: ${results.warn.length} 项`);
console.log(`  ❌ FAIL: ${results.fail.length} 项`);
console.log(`  ℹ️  INFO: ${results.info.length} 项`);

// 评分公式: 100基础分 - 每个FAIL扣10分 - 每个WARN扣0.5分(最多扣30)
const failPenalty = Math.min(results.fail.length * 10, 50);
const warnPenalty = Math.min(Math.round(results.warn.length * 0.5), 30);
const score = Math.max(0, 100 - failPenalty - warnPenalty);
console.log(`  🎯 综合评分: ${score}/100`);
console.log();

if (results.fail.length > 0) {
  console.log('=== ❌ 需修复项 (FAIL) ===');
  results.fail.forEach(f => console.log(`  ❌ [${f.check}] ${f.detail}`));
  console.log();
}

console.log('=== ⚠️ 需关注项 (WARN) ===');
results.warn.forEach(w => console.log(`  ⚠️ [${w.check}] ${w.detail}`));
console.log();

// 写入 JSON 报告
const report = {
  timestamp: new Date().toISOString(),
  project: 'ciallo0721-cmd.top',
  score,
  summary: {
    pass: results.pass.length,
    warn: results.warn.length,
    fail: results.fail.length,
    info: results.info.length,
  },
  files: fileStats,
  fails: results.fail,
  warns: results.warn,
  passes: results.pass.map(p => p.detail),
};

const reportPath = path.join(ROOT, 'tests/reports/static-analysis.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`📝 JSON 报告已保存: tests/reports/static-analysis.json`);

// 导出供其他脚本使用
module.exports = { results, score, fileStats, report };
