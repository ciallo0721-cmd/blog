window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TR4FT7JPDZ');

// ==================== Globals ====================
let currentStore = 'localStorage';
let currentRegion = '';
let editingKey = '';
let editingStore = '';

// ==================== Navigation ====================
function switchPanel(name) {
  document.querySelectorAll('.sidebar nav a').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
  const link = document.querySelector(`.sidebar nav a[data-panel="${name}"]`);
  if (link) link.classList.add('active');
  const panel = document.getElementById('panel-' + name);
  if (panel) panel.style.display = 'block';
  if (name === 'storage') refreshStorage();
  if (name === 'export') showStorageDetail();
}
document.querySelectorAll('.sidebar nav a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    switchPanel(a.dataset.panel);
  });
});

// ==================== Storage Tabs ====================
document.querySelectorAll('.store-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.store-tab').forEach(b => { b.style.borderColor = 'var(--border)'; b.style.background = 'var(--card)'; });
    btn.style.borderColor = 'var(--accent)';
    btn.style.background = 'rgba(59,130,246,.15)';
    currentStore = btn.dataset.store;
    refreshStorage();
  });
});

// ==================== Storage Functions ====================
function getStorage() {
  if (currentStore === 'localStorage') return localStorage;
  if (currentStore === 'sessionStorage') return sessionStorage;
  return null;
}

function getCookies() {
  const cookies = {};
  document.cookie.split(';').forEach(c => {
    const [k, ...v] = c.trim().split('=');
    if (k) cookies[k] = decodeURIComponent(v.join('='));
  });
  return cookies;
}

function refreshStorage() {
  if (currentStore === 'cookies') {
    renderCookieTable();
  } else {
    renderStorageTable();
    updateStorageStats();
  }
}

function getAllEntries() {
  if (currentStore === 'cookies') {
    return Object.entries(getCookies());
  }
  const store = getStorage();
  if (!store) return [];
  return Object.keys(store).map(k => [k, store.getItem(k)]);
}

function renderStorageTable() {
  const tbody = document.getElementById('storage-table');
  const search = (document.getElementById('storage-search')?.value || '').toLowerCase();
  let entries = getAllEntries();
  if (search) entries = entries.filter(([k,v]) => k.toLowerCase().includes(search) || v.toLowerCase().includes(search));

  document.getElementById('storage-table-badge').textContent = entries.length;

  if (entries.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--dim);padding:40px">暂无数据</td></tr>';
    return;
  }

  const isCookie = currentStore === 'cookies';
  tbody.innerHTML = entries.map(([k, v]) => `
    <tr>
      <td><code class="mono" style="color:var(--accent2)">${escHtml(k)}</code></td>
      <td><span class="val" title="${escHtml(v)}">${escHtml(v.length > 80 ? v.slice(0,80)+'...' : v)}</span></td>
      <td class="actions">
        <button class="btn sm" onclick="editEntry('${escAttr(k)}','${escAttr(v)}','${isCookie ? 'cookies' : currentStore}')">✏️ 编辑</button>
        <button class="btn sm danger" onclick="deleteEntry('${escAttr(k)}')">🗑️</button>
      </td>
    </tr>`).join('');
}

function renderCookieTable() {
  const tbody = document.getElementById('storage-table');
  const search = (document.getElementById('storage-search')?.value || '').toLowerCase();
  let entries = Object.entries(getCookies());
  if (search) entries = entries.filter(([k,v]) => k.toLowerCase().includes(search) || v.toLowerCase().includes(search));

  document.getElementById('storage-table-badge').textContent = entries.length;

  if (entries.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--dim);padding:40px">暂无 Cookie</td></tr>';
    return;
  }

  tbody.innerHTML = entries.map(([k, v]) => `
    <tr>
      <td><code class="mono" style="color:var(--accent2)">${escHtml(k)}</code></td>
      <td><span class="val" title="${escHtml(v)}">${escHtml(v.length > 80 ? v.slice(0,80)+'...' : v)}</span></td>
      <td class="actions">
        <button class="btn sm" onclick="editEntry('${escAttr(k)}','${escAttr(v)}','cookies')">✏️ 编辑</button>
        <button class="btn sm danger" onclick="deleteCookie('${escAttr(k)}')">🗑️</button>
      </td>
    </tr>`).join('');
}

function updateStorageStats() {
  const store = getStorage();
  if (!store) return;
  const keys = Object.keys(store);
  let totalSize = 0;
  keys.forEach(k => { totalSize += (k.length + (store.getItem(k)||'').length) * 2; });
  document.getElementById('stat-count').textContent = keys.length;
  document.getElementById('stat-total').textContent = formatBytes(totalSize);
  document.getElementById('stat-max').textContent = '5 MB';
}

function addStorageItem() {
  const key = document.getElementById('storage-key').value.trim();
  const val = document.getElementById('storage-val').value;
  if (!key) return toast('请输入键名', 'error');

  if (currentStore === 'cookies') {
    setCookie(key, val);
  } else {
    const store = getStorage();
    if (store) store.setItem(key, val);
  }
  document.getElementById('storage-key').value = '';
  document.getElementById('storage-val').value = '';
  refreshStorage();
  toast(`已保存: ${key}`, 'success');
}

function editEntry(key, val, store) {
  editingKey = key;
  editingStore = store;
  document.getElementById('modal-title').textContent = '编辑值';
  document.getElementById('modal-value').value = val;
  document.getElementById('modal-key-label').textContent = key;
  document.getElementById('modal-store-label').textContent = store;
  document.getElementById('modal').style.display = 'flex';
}

function saveModalValue() {
  const newVal = document.getElementById('modal-value').value;
  if (editingStore === 'cookies') {
    setCookie(editingKey, newVal);
  } else if (editingStore === 'localStorage') {
    localStorage.setItem(editingKey, newVal);
  } else if (editingStore === 'sessionStorage') {
    sessionStorage.setItem(editingKey, newVal);
  }
  closeModal();
  refreshStorage();
  toast(`已更新: ${editingKey}`, 'success');
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  editingKey = '';
}

function deleteEntry(key) {
  if (!confirm(`确定删除 "${key}" 吗？此操作不可逆。`)) return;
  const store = getStorage();
  if (store) store.removeItem(key);
  refreshStorage();
  toast(`已删除: ${key}`, 'info');
}

function deleteCookie(key) {
  if (!confirm(`确定删除 Cookie "${key}" 吗？`)) return;
  document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  refreshStorage();
  toast(`已删除 Cookie: ${key}`, 'info');
}

function setCookie(key, val, days = 365) {
  const d = new Date();
  d.setTime(d.getTime() + days * 86400000);
  document.cookie = `${key}=${encodeURIComponent(val)};expires=${d.toUTCString()};path=/`;
}

// ==================== URL Params ====================
const REGIONS = [
  {code:'',name:'默认（不设）',flag:'🌐'},
  {code:'us',name:'美国',flag:'🇺🇸'},
  {code:'uk',name:'英国',flag:'🇬🇧'},
  {code:'hk',name:'中国香港',flag:'🇭🇰'},
  {code:'jp',name:'日本',flag:'🇯🇵'},
  {code:'kr',name:'韩国',flag:'🇰🇷'},
  {code:'cn',name:'中国大陆',flag:'🇨🇳'},
  {code:'tw',name:'中国台湾',flag:'🏳️'},
  {code:'sg',name:'新加坡',flag:'🇸🇬'},
  {code:'ca',name:'加拿大',flag:'🇨🇦'},
  {code:'au',name:'澳大利亚',flag:'🇦🇺'},
  {code:'de',name:'德国',flag:'🇩🇪'},
  {code:'fr',name:'法国',flag:'🇫🇷'},
  {code:'ru',name:'俄罗斯',flag:'🇷🇺'},
  {code:'br',name:'巴西',flag:'🇧🇷'},
  {code:'in',name:'印度',flag:'🇮🇳'},
];

function initRegions() {
  const grid = document.getElementById('region-grid');
  grid.innerHTML = REGIONS.map(r => `
    <div class="region-card${r.code===currentRegion?' selected':''}" onclick="pickRegion('${r.code}')" title="${r.name}">
      <div class="flag">${r.flag}</div>
      <div class="code">${r.code||'(无)'}</div>
      <div class="name">${r.name}</div>
    </div>`).join('');
  updateUrlPreview();
}

function pickRegion(code) {
  currentRegion = code;
  document.querySelectorAll('.region-card').forEach((c,i)=>{ c.classList.toggle('selected',REGIONS[i].code===code); });
  updateUrlPreview();
}

function updateUrlPreview() {
  const base = document.getElementById('target-page').value;
  const params = buildParams();
  document.getElementById('url-preview').textContent = base + (params ? '?'+params : '');
}

function buildParams() {
  const parts = [];
  if (currentRegion) parts.push(`from=${currentRegion}`);
  if (document.getElementById('touch-toggle').checked) parts.push('touch=true');
  const ck = document.getElementById('custom-key').value.trim();
  const cv = document.getElementById('custom-val').value;
  if (ck) parts.push(`${encodeURIComponent(ck)}=${encodeURIComponent(cv)}`);
  return parts.join('&');
}

function navigateWithParams(newTab) {
  const base = document.getElementById('target-page').value;
  const params = buildParams();
  const url = base + (params ? '?'+params : '');
  if (newTab) window.open(url, '_blank');
  else window.location.href = url;
}

function copyBuiltUrl() {
  const base = document.getElementById('target-page').value;
  const params = buildParams();
  const url = location.origin + base + (params ? '?'+params : '');
  navigator.clipboard.writeText(url).then(() => toast('URL 已复制！', 'success'));
}

function testRedirect(page, param) {
  let url = '/' + page;
  if (param === 'touch') url += '?touch=true';
  else if (param) url += '?from=' + param;
  window.open(url, '_blank');
}

// ==================== Feature Tests ====================
function clearAllStorage() {
  if (!confirm('⚠️ 确定清除所有 localStorage 和 sessionStorage 吗？此操作不可逆！')) return;
  const ls = localStorage.length;
  const ss = sessionStorage.length;
  localStorage.clear();
  sessionStorage.clear();
  refreshStorage();
  toast(`已清除：localStorage ${ls} 条 + sessionStorage ${ss} 条`, 'success');
}

function fillDummyData() {
  const data = {
    'theme':'dark','lang':'zh-CN','fontSize':'16',
    'lastVisit':new Date().toISOString(),'visitCount':'42',
    'favoriteColor':'blue','username':'ciallo0721-cmd',
    'sidebarCollapsed':'false','notifications':'true',
    'editor_mode':'markdown','tabSize':'4',
    'autoSave':'true','lineNumbers':'true',
    'wordWrap':'true','previewMode':'split',
    'lastEditedFile':'/blog/article-57.blog',
    'recentSearches':JSON.stringify(['C-PTSD','ADHD','RenPy','GitHub Pages']),
    'savedDraft':JSON.stringify({title:'未命名草稿',content:'测试内容...',saved:Date.now()}),
    'preferences':JSON.stringify({animations:true,sound:false,contrast:'normal'})
  };
  Object.entries(data).forEach(([k,v]) => localStorage.setItem('_test_'+k, v));
  localStorage.setItem('_test_created', new Date().toISOString());
  refreshStorage();
  toast('已填充 20 条测试数据（_test_ 前缀）', 'success');
}

function testStorageQuota() {
  const output = document.getElementById('test-output');
  const results = document.getElementById('test-results');
  results.style.display = 'block';
  output.textContent = '测试中...\n';
  try {
    const test = 'x'.repeat(1024 * 100); // 100KB
    let i=0; while(i<50){ localStorage.setItem('_quota_test_'+i, test); i++; }
    const total = (i * 100 / 1024).toFixed(1);
    for(let j=0;j<i;j++) localStorage.removeItem('_quota_test_'+j);
    output.textContent += `✅ 成功写入 ${i} 个 100KB 块（共 ${total} MB），未触发配额限制\n`;
  } catch(e) {
    output.textContent += `❌ 配额测试失败: ${e.message}\n`;
  }
}

function showStorageDetail() {
  const detail = document.getElementById('storage-detail');
  const data = {
    localStorage: {},
    sessionStorage: {},
    cookies: getCookies()
  };
  Object.keys(localStorage).forEach(k => data.localStorage[k] = localStorage.getItem(k));
  Object.keys(sessionStorage).forEach(k => data.sessionStorage[k] = sessionStorage.getItem(k));
  detail.textContent = JSON.stringify(data, null, 2);
}

function exportStorage() {
  const data = {
    exportedAt: new Date().toISOString(),
    localStorage: {},
    sessionStorage: {},
    cookies: getCookies()
  };
  Object.keys(localStorage).forEach(k => data.localStorage[k] = localStorage.getItem(k));
  Object.keys(sessionStorage).forEach(k => data.sessionStorage[k] = sessionStorage.getItem(k));

  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `storage-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('存储数据已导出！', 'success');
}

function copyStorageToClipboard() {
  const data = {localStorage:{},sessionStorage:{},cookies:getCookies()};
  Object.keys(localStorage).forEach(k => data.localStorage[k] = localStorage.getItem(k));
  Object.keys(sessionStorage).forEach(k => data.sessionStorage[k] = sessionStorage.getItem(k));
  navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => toast('已复制到剪贴板', 'success'));
}

function importStorage() {
  const file = document.getElementById('import-file').files[0];
  if (!file) return toast('请先选择文件', 'error');
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      applyImport(data);
    } catch(err) { toast('JSON 解析失败：'+err.message, 'error'); }
  };
  reader.readAsText(file);
}

function pasteImport() {
  navigator.clipboard.readText().then(text => {
    try {
      const data = JSON.parse(text);
      applyImport(data);
    } catch(err) { toast('剪贴板内容不是有效 JSON', 'error'); }
  }).catch(() => toast('无法读取剪贴板', 'error'));
}

function applyImport(data) {
  if (!confirm(`即将导入：localStorage ${Object.keys(data.localStorage||{}).length} 条 + sessionStorage ${Object.keys(data.sessionStorage||{}).length} 条。确定覆盖当前数据？`)) return;
  if (data.localStorage) { localStorage.clear(); Object.entries(data.localStorage).forEach(([k,v]) => localStorage.setItem(k,v)); }
  if (data.sessionStorage) { sessionStorage.clear(); Object.entries(data.sessionStorage).forEach(([k,v]) => sessionStorage.setItem(k,v)); }
  if (data.cookies) { Object.entries(data.cookies).forEach(([k,v]) => setCookie(k,v)); }
  refreshStorage();
  toast('导入成功！', 'success');
}

// ==================== Utils ====================
function escHtml(s) { const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
function escAttr(s) { return s.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;'); }
function formatBytes(b) { if(b<1024)return b+' B'; if(b<1048576)return (b/1024).toFixed(1)+' KB'; return (b/1048576).toFixed(2)+' MB'; }
function toast(msg, type='info') {
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(()=>t.remove(),300); }, 2000);
}

// Keyboard shortcut for modal
document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });
document.getElementById('modal').addEventListener('click', e => { if(e.target===e.currentTarget) closeModal(); });

// URL preview auto-update
document.getElementById('target-page').addEventListener('change', updateUrlPreview);
document.getElementById('touch-toggle').addEventListener('change', updateUrlPreview);
document.getElementById('custom-key').addEventListener('input', updateUrlPreview);
document.getElementById('custom-val').addEventListener('input', updateUrlPreview);

// ==================== Console ====================
let consoleLogCount = 0;
function runConsole(code) {
  const input = code || document.getElementById('console-input').value;
  if (!input.trim()) return toast('请输入代码', 'error');
  const output = document.getElementById('console-output');
  consoleLogCount++;
  document.getElementById('console-count').textContent = consoleLogCount;
  const ts = new Date().toLocaleTimeString();
  try {
    // 用 script 标签注入替代 eval，绕过 CSP unsafe-eval 限制
    delete window.__cr;
    delete window.__ce;
    const s = document.createElement('script');
    s.textContent = 'window.__cr=(function(){return('+input+'\n);})();window.__ce=void 0';
    s.onerror = function(){ window.__ce = 'Script execution failed'; };
    document.head.appendChild(s);
    document.head.removeChild(s);
    if (window.__ce) throw new Error(window.__ce);
    const result = window.__cr;
    const resStr = result === undefined ? 'undefined' : (typeof result === 'string' ? result : JSON.stringify(result, null, 2));
    output.innerHTML += `<div style="margin-bottom:8px"><span style="color:var(--dim)">[${ts}]</span> <span style="color:var(--accent2)">▶</span> <span style="color:var(--dim)">${escHtml(input.slice(0,100))}${input.length>100?'...':''}</span>\n<span style="color:var(--green)">→ ${escHtml(resStr)}</span></div>`;
  } catch(e) {
    output.innerHTML += `<div style="margin-bottom:8px"><span style="color:var(--dim)">[${ts}]</span> <span style="color:var(--accent2)">▶</span> <span style="color:var(--dim)">${escHtml(input.slice(0,100))}${input.length>100?'...':''}</span>\n<span style="color:var(--red)">✖ ${escHtml(e.message)}</span></div>`;
  }
  output.scrollTop = output.scrollHeight;
}
function shareConsoleCmd() {
  // 安全加固：不再生成可自动执行代码的 ?cmd= 链接（防止驱动型 XSS / 钓鱼）
  toast('🔒 安全限制：?cmd= 自动执行已禁用，无法生成分享链接', 'error');
}
function applyPreset(code) {
  document.getElementById('console-input').value = code;
}
// Ctrl+Enter shortcut
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'Enter' && document.getElementById('panel-console').style.display === 'block') {
    e.preventDefault();
    runConsole();
  }
});

// ==================== Init ====================
initRegions();
refreshStorage();

// 🔒 安全加固：?cmd= URL 自动执行已移除
// 原因：该面板曾公开部署，?cmd= 允许任意访客构造链接诱导他人执行任意 JS
// （驱动型 XSS 向量，可窃取本域名下 cookies / localStorage）
// 现在代码只能手动输入执行，URL 参数不再触发任何脚本。

console.log('%c🔧 Admin Panel Ready %c| ciallo0721-cmd.top',
  'color:#60a5fa;font-size:14px','color:#94a3b8');