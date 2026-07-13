window.pageMeta = {
        content_type: "app",
        page_name: "mood-tracker",
        category: ""
    };

window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-TR4FT7JPDZ');

(function() {
            function checkHTTP() {
                if (window.location.protocol === 'http:') {
                    var urlSpan = document.getElementById('currentHttpUrl');
                    if (urlSpan) urlSpan.textContent = window.location.href;
                    var overlay = document.getElementById('httpWarningOverlay');
                    if (overlay) overlay.style.display = 'flex';
                }
            }
            function switchToHTTPS() {
                var url = window.location.href;
                url = url.replace(/^http:/i, 'https:');
                window.location.href = url;
            }
            function continueHTTP() {
                var overlay = document.getElementById('httpWarningOverlay');
                if (overlay) overlay.style.display = 'none';
            }
            window.switchToHTTPS = switchToHTTPS;
            window.continueHTTP = continueHTTP;
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', checkHTTP);
            } else {
                checkHTTP();
            }
        })();

// ===== Data Layer =====
const STORAGE_KEY = 'mood_tracker_data_v1';

// ===== Color Helper =====
function moodColor(m, a) {
  const hue = (a - 1) * 11.25 + 155;
  const lit = m * 11 - a * 7 + 30;
  return `hsl(${hue.toFixed(1)}, 45%, ${lit.toFixed(1)}%)`;
}
function moodColorDot(m, a) {
  const hue = (a - 1) * 11.25 + 155;
  const lit = m * 11 - a * 7 + 30;
  return `hsl(${hue.toFixed(1)}, 50%, ${lit.toFixed(1)}%)`;
}

// ===== Date Helpers =====
function getYear() {
  return new Date().getFullYear();
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function getDayOfWeek(dateStr) {
  // Returns 1=Mon … 7=Sun (ISO)
  const d = new Date(dateStr + 'T00:00:00');
  let dow = d.getDay(); // 0=Sun
  return dow === 0 ? 7 : dow;
}

// ===== Render Helpers =====
function renderStats(data) {
  const days = data.length;
  const avgM = days ? (data.reduce((s,d)=>s+d.m,0)/days).toFixed(2) : '—';
  const avgA = days ? (data.reduce((s,d)=>s+d.a,0)/days).toFixed(2) : '—';
  let best = '—';
  if (days) {
    const top = data.slice().sort((a,b) => b.m - a.m)[0];
    best = top.date.slice(5); // MM-DD
  }
  document.getElementById('statDays').textContent = days;
  document.getElementById('statAvgM').textContent = avgM;
  document.getElementById('statAvgA').textContent = avgA;
  document.getElementById('statBest').textContent = best;
}

function renderHeatmap(data) {
  const year = getYear();
  const dataMap = {};
  data.forEach(d => { dataMap[d.date] = d; });

  // Month labels
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const mlEl = document.getElementById('monthLabels');
  mlEl.innerHTML = months.map(m => `<span>${m}</span>`).join('');

  const grid = document.getElementById('matrixGrid');
  grid.innerHTML = '';

  // Jan 1 of year
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const totalDays = Math.round((end - start) / 86400000) + 1;

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const dateStr = formatDate(d);
    const dow = getDayOfWeek(dateStr); // 1=Mon…7=Sun
    const entry = dataMap[dateStr];

    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.style.gridRow = dow;

    let tip;
    if (entry) {
      const color = moodColor(entry.m, entry.a);
      cell.style.backgroundColor = color;
      tip = `${dateStr}\n心情: ${entry.m}  指标B: ${entry.a}`;
      if (entry.note) tip += `\n备注: ${entry.note}`;
    } else {
      tip = `${dateStr}\n无数据`;
    }
    cell.setAttribute('data-tip', tip);
    grid.appendChild(cell);
  }

  // Legend
  const legendEl = document.getElementById('legendCells');
  legendEl.innerHTML = '';
  for (let v = 1; v <= 5; v++) {
    const lc = document.createElement('div');
    lc.className = 'legend-cell';
    lc.style.backgroundColor = moodColor(v, 3 - v * 0.3 + 1.5);
    legendEl.appendChild(lc);
  }
}

function renderScatter(data) {
  const canvas = document.getElementById('scatterCanvas');
  canvas.innerHTML = '';

  data.forEach(item => {
    const m = parseFloat(item.m);
    const a = parseFloat(item.a);
    const x = ((a - 1) / 4) * 90 + 5;
    const yRaw = ((m - 1) / 4) * 90 + 5;
    const y = 100 - yRaw;

    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.style.backgroundColor = moodColorDot(m, a);
    dot.style.left = x + '%';
    dot.style.top = y + '%';

    let tip = `${item.date}\n心情: ${item.m}  指标B: ${item.a}`;
    if (item.note) tip += `\n备注: ${item.note}`;
    dot.setAttribute('data-tip', tip);
    canvas.appendChild(dot);
  });
}

// ===== Render All (after data is loaded) =====
function renderAllWithData(data) {
  renderStats(data);
  renderHeatmap(data);
  renderScatter(data);
}

// ===== Load Data from moods.json and render =====
async function initializeDataAndRender() {
  const messageArea = document.getElementById('messageArea');
  const dashboardContainers = document.querySelectorAll('.mood-dashboard-embed-context');
  
  // Show loading state
  messageArea.style.display = 'block';
  messageArea.innerHTML = '📡 正在加载心情数据...';
  messageArea.className = 'loading-message';
  dashboardContainers.forEach(el => el.style.opacity = '0.5');

  try {
    // 使用 fetch 加载 moods.json 文件
    const response = await fetch('./moods.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const loadedData = await response.json();
    
    // 校验数据格式 (简单检查是否为数组)
    if (!Array.isArray(loadedData)) {
      throw new Error('数据格式错误：moods.json 应该是一个数组');
    }
    
    // 将数据存入 localStorage 以备后续操作
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedData));
    
    // 隐藏加载提示，渲染仪表板
    messageArea.style.display = 'none';
    dashboardContainers.forEach(el => el.style.opacity = '1');
    
    renderAllWithData(loadedData);
    
  } catch (error) {
    console.error('加载 moods.json 失败:', error);
    messageArea.innerHTML = `❌ 加载心情数据失败: ${error.message}<br><br>💡 提示: 请确保 moods.json 文件与 index.html 在同一目录下，并且通过 HTTP 服务器访问（如使用 Live Server 或 http-server）。`;
    messageArea.className = 'error-message';
    dashboardContainers.forEach(el => el.style.opacity = '0.3');
  }
}

// ===== Start =====
initializeDataAndRender();