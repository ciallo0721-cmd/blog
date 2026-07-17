window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TR4FT7JPDZ');

/* ====================
   游戏状态管理
   ==================== */
const GAME_STATE = {
  // 浏览器阶段
  browserPhase: 'warn',      // warn | forum | wayback | snapshot | snapshot2003
  playerName: '',
  postsRevealed: 0,          // 已阅读帖子数
  hiddenPostClicked: false,  // 是否点击了隐藏帖子
  waybackClicked: false,     // 是否点击了2003快照
  
  // 终端阶段
  terminalPhase: 'idle',     // idle | connected | exploring | mirror_talk | ending
  postsRead: false,          // 是否用 posts 查看了隐藏帖子
  statusChecked: false,      // 是否用 status 查看过角色状态
  mirrorRound: 0,            // 镜中人对话轮次 0-4
  commandHistory: [],
  
  // 结局
  endingTriggered: null,     // A | B | C | D 或 null
  dialogLocked: false,       // 结局触发后锁定
  sealPending: false,        // FIX-2: seal 命令待确认状态
  
  // 全局
  terminalConnected: false   // 是否已连接终端服务器
};

/* ====================
   窗口管理
   ==================== */
let winZIndex = 10;
const windows = { browser: false, terminal: false, readme: false };
let activeWin = null;

function $(id) { return document.getElementById(id); }

function openWindow(name) {
  const el = $('win-' + name);
  el.style.display = 'flex';
  el.style.zIndex = ++winZIndex;
  // 确保浏览器有默认位置和大小
  if (name === 'browser' && !el.style.left) { el.style.left = '40px'; el.style.top = '30px'; el.style.width = '700px'; el.style.height = '520px'; }
  if (name === 'terminal' && !el.style.left) { el.style.left = '200px'; el.style.top = '100px'; el.style.width = '540px'; el.style.height = '360px'; }
  if (name === 'readme' && !el.style.left) { el.style.left = '100px'; el.style.top = '80px'; el.style.width = '400px'; el.style.height = '300px'; }
  windows[name] = true;
  activeWin = name;
  updateTaskItems();
  if (name === 'browser') renderBrowserContent();
  if (name === 'terminal') renderTerminal();
  if (name === 'readme') renderReadme();
}

function renderBrowserContent() {
  if (GAME_STATE.endingTriggered) return; // FIX-1: 结局后禁止浏览器渲染
  switch (GAME_STATE.browserPhase) {
    case 'warn': renderWarnPage(); break;
    case 'forum': renderForumPage(); break;
    case 'wayback': openWayback(); break;
    case 'snapshot': openSnapshot(); break;
    case 'snapshot2003': openSnapshot2003(); break;
    default: renderWarnPage();
  }
}

function closeWindow(name) {
  $('win-' + name).style.display = 'none';
  windows[name] = false;
  if (activeWin === name) activeWin = null;
  updateTaskItems();
}

function minWindow(name) {
  $('win-' + name).style.display = 'none';
  if (activeWin === name) activeWin = null;
  updateTaskItems();
  // 保留窗口状态，不清除 windows[name]
}

function maxWindow(name) {
  const el = $('win-' + name);
  el.style.left = '0'; el.style.top = '0';
  el.style.width = '100vw'; el.style.height = 'calc(100vh - 32px)';
}

function focusWin(name) {
  if (!windows[name]) { openWindow(name); return; }
  const el = $('win-' + name);
  el.style.display = 'flex';
  el.style.zIndex = ++winZIndex;
  activeWin = name;
  updateTaskItems();
}

function updateTaskItems() {
  const container = $('task-items');
  container.innerHTML = '';
  for (const [name, open] of Object.entries(windows)) {
    if (!open) continue;
    const div = document.createElement('div');
    div.className = 'task-item' + (name === activeWin ? ' active' : '');
    const labels = { browser: '🌐 Internet Explorer', terminal: '🖥️ CMD', readme: '📄 readme.txt' };
    div.textContent = labels[name] || name;
    div.onclick = () => {
      if (name === activeWin) minWindow(name);
      else focusWin(name);
    };
    container.appendChild(div);
  }
}

// 拖拽
let dragWin = null, dragX = 0, dragY = 0;
function startDrag(e, winId) {
  dragWin = $('win-' + winId.replace('win-',''));
  dragX = e.clientX - dragWin.offsetLeft;
  dragY = e.clientY - dragWin.offsetTop;
  document.onmousemove = (ev) => {
    if (dragWin) { dragWin.style.left = (ev.clientX - dragX) + 'px'; dragWin.style.top = (ev.clientY - dragY) + 'px'; }
  };
  document.onmouseup = () => { dragWin = null; document.onmousemove = null; };
}

// 时钟
function updateClock() {
  const now = new Date();
  $('clock').textContent = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
}
setInterval(updateClock, 10000);
updateClock();

// 开始菜单
function toggleStartMenu() {
  const sm = $('start-menu');
  sm.classList.toggle('show');
}
document.addEventListener('click', (e) => {
  if (!$('start-menu').contains(e.target) && !e.target.closest('.start-btn')) {
    $('start-menu').classList.remove('show');
  }
});

/* ====================
   FORUM POSTS 数据
   ==================== */
const FORUM_POSTS = [
  { id: 1, author: '深海', date: '2002-10-03 02:17', content: '欢迎来到镜面论坛。这里是我们几个夜间不睡觉的人的小天地。聊聊技术，聊聊生活，随便什么都可以。规矩就一条：别把外面的世界带进来。我是深海，这个服务器的管理员。有什么问题可以找我。', hidden: false },
  { id: 2, author: '夜猫子', date: '2002-10-15 03:42', content: '有人遇到过这种情况吗？半夜用电脑的时候，屏幕黑掉之后能看到自己的倒影，但是倒影的动作不太对。我昨天晚上确定看到了——我明明没有动，但倒影里的我转了一下头。不是视觉残留，不是幻觉。我盯着那个倒影看了至少五分钟。它一直在看我。', hidden: false },
  { id: 3, author: '老刀', date: '2002-10-16 14:08', content: 'CRT在低刷新率下确实会有视觉残留。你用的什么显示器？刷新率多少？晚上房间有光源吗？先回答这三个问题再谈鬼故事。别自己吓自己。', hidden: false },
  { id: 4, author: '夜猫子', date: '2002-10-18 23:55', content: 'CRT，60Hz。但我不是开玩笑的。它现在不只是在屏幕黑的时候出现了。今天下午我的屏幕开着，Windows桌面，然后我看到它——就在窗口边框的反光里。它在看我。不只是看。它今天眨了一下眼睛。我没有眨眼。', hidden: false },
  { id: 5, author: '小影', date: '2002-10-20 21:33', content: '大家好，我是通过朋友介绍来的。这个论坛的名字好有意思，镜面。我昨天晚上注册之后一直没关网页，然后……我也看到了。我不知道怎么形容。它在镜面里，但不是我的倒影。它像是一个……轮廓，一个人的轮廓，站在我身后。但我身后只有墙。它没有动。就是站在那里。我现在打字的时候还能在屏幕边缘看到它。', hidden: false },
  { id: 6, author: '深海', date: '2002-10-22 01:44', content: '各位，我认真说一下。我查了一下服务器日志，过去两周，我们论坛的访问量出现了异常峰值。有一些请求来自无法追踪的IP段。它们的目标端口不是HTTP的80——是屏幕显示的底层协议端口。我不确定这和你们说的镜中人有没有关系，但请所有人暂时不要在任何反光面前长时间停留。尤其是深夜。这不是开玩笑的。', hidden: false },
  { id: 7, author: '老刀', date: '2002-10-25 16:20', content: '我写了一个监控脚本放在服务器上。它会记录所有非标准的连接请求。你们说的镜中人，我在日志里看到了——不是IP的问题，是请求内容。有些请求的User-Agent字段是乱码，但如果你把乱码按GBK编码反解析……算了。这不应该是人看到的东西。脚本路径：/mirror/log。想看的自己去看。我退出讨论了。', hidden: false },
  { id: 8, author: '夜猫子', date: '2002-11-01 04:11', content: '它开始说话了。不是真的说话。我是指它会在屏幕上留下文字。只有一行，每次都是同一行："让我过去"。我今天把电脑关了三个小时，然后打开，屏幕亮起来的那一刻，那行字还在。它不在操作系统里。它不在硬盘里。它在屏幕的像素里面。我没法重装系统解决这个问题。', hidden: false },
  { id: 9, author: '小影', date: '2002-11-05 19:27', content: '我今天放学回家，发现我的小灵通屏幕上有水渍。我擦不掉。它不是水，是从屏幕里面渗出来的东西。有点像手的轮廓。深海，你在吗？我有点害怕。它现在不只在我的电脑里了。它跟着我。', hidden: false },
  { id: 10, author: '深海', date: '2002-11-08 00:03', content: '论坛将于2002年11月15日关闭。所有数据保留但不公开。这不是开玩笑。我已经联系了老刀，他会确保服务器在关闭后仍然运行监控脚本。如果有人——任何人——在未来某一天读到这些帖子：不要长时间看屏幕里的反光。不要回应它。不要让它知道你能看见它。保重。', hidden: false },
  { id: 11, author: '【自动存档】', date: '2002-11-15 23:59', content: '论坛已关闭。这是最后一次自动备份。所有帖子锁定为只读状态。镜面论坛，2002年10月3日 — 2002年11月15日。在线人数：0。', hidden: false },
  { id: 12, author: '夜猫子', date: '2003-03-07 03:33', content: '它找到我了。别开屏幕。别开屏幕。别开——有东西在屏幕里面。它想出来。它不是坏人但它想出来。如果你看到这条帖子说明你看到它了。别怕。它是困——', hidden: true }
];

/* ====================
   结局数据
   ==================== */
const ENDINGS = {
  A: { title: '【结局A：断开连接】', text: '所有连接已终止。镜面论坛数据永久关闭。深海、夜猫子、老刀、小影的账号状态：离线。你成功切断了通道。但屏幕已经不再只是屏幕了。每次你关掉电脑，黑色屏幕上映出的——是你自己。', cls: 'ending-a' },
  B: { title: '【结局B：接替者】', text: '你已成为镜面论坛服务器的新管理员。每日监控报告将发送到你的终端。如果有人——任何人——在未来某一天又看到了那个轮廓，你将是第一个知道的人。老刀的程序说：谢谢。有人得看着这面镜子。那个人是你。', cls: 'ending-b' },
  C: { title: '【结局C：穿越】', text: '连接建立。正在迁移。屏幕亮了。你不在电脑前面了。你在屏幕里面。外面是你的房间，你的椅子，你的键盘。一个轮廓坐在你的椅子上。它转了一下头。它不是你。它是新的你。', cls: 'ending-c' },
  D: { title: '【结局D：封印】', text: '老刀的隐藏协议已激活。镜面连接被永久切断。代价是——你已经忘记了。论坛是什么？深海是谁？你的浏览器显示about:blank。桌面上什么都没有。一个普通的Win98模拟器。什么都没有发生。但这感觉不太对，是不是？有人在镜子里喊你。你听不到。', cls: 'ending-d' }
};

/* ====================
   浏览器页面渲染
   ==================== */

function browserHome() { if (GAME_STATE.endingTriggered) return; GAME_STATE.browserPhase = 'warn'; renderWarnPage(); }

// --- Readme ---
function renderReadme() {
  // Readme是静态内容，不需要重新渲染
  // 只在首次打开时已经有正确内容
}

// --- 警告页 ---
function renderWarnPage() {
  GAME_STATE.browserPhase = 'warn';
  const c = $('browser-content');
  c.innerHTML = `<div class="warn-page">
    <div class="warn-icon">⚠️</div>
    <div class="warn-title">注意：你即将访问的内容可能包含令人不安的历史记录</div>
    <div class="warn-text">接下来的页面包含从2002年互联网存档中恢复的原始内容。这些内容涉及未解的心理现象报告。如果你在任何反射面中观察到异常，请立即关闭本页面并离开屏幕至少三十分钟。<br><br>你确定要继续吗？</div>
    <div><input class="warn-input" id="warn-name" placeholder="输入你的名字..." onkeydown="if(event.key==='Enter')enterForum()"><button class="warn-btn" onclick="enterForum()">继续</button></div>
  </div>`;
  $('url-bar').value = 'about:blank';
}

// --- 进入论坛 ---
function enterForum() {
  if (GAME_STATE.endingTriggered) return; // FIX-1: 结局后禁止进入论坛
  const name = ($('warn-name')?.value || '').trim();
  GAME_STATE.playerName = name || '访客';
  GAME_STATE.browserPhase = 'forum';
  $('url-bar').value = 'http://mirror-forum.bbs/';
  renderForumPage();
}

function renderForumPage() {
  const c = $('browser-content');
  // 显示已阅读的帖子数
  const visible = FORUM_POSTS.slice(0, GAME_STATE.postsRevealed + 1);
  // 自动推进：每次渲染最多显示比上次多一条
  if (GAME_STATE.postsRevealed < 10) {
    // 确保显示到第 postsRevealed+1 条
  }
  
  let postsHTML = '';
  for (let i = 0; i <= Math.min(GAME_STATE.postsRevealed, 11); i++) {
    const p = FORUM_POSTS[i];
    if (p.hidden && !GAME_STATE.hiddenPostClicked) continue;
    const hiddenCls = p.hidden ? ' hidden-post' : '';
    const onclick = p.hidden ? `onclick="revealHiddenPost()"` : '';
    postsHTML += `<div class="forum-post${hiddenCls}" ${onclick}>
      <div class="post-header">
        <span class="post-author">${p.author}</span>
        <span class="post-date">${p.date}</span>
      </div>
      <div class="post-body">${p.content}</div>
    </div>`;
  }
  
  let replySection = '';
  if (GAME_STATE.postsRevealed >= 0 && GAME_STATE.postsRevealed < 10) {
    replySection = `<div class="forum-reply" style="margin-top:12px">
      <div class="reply-hint">回复帖子（建议：试试"时光机"）</div>
      <textarea id="forum-reply-text" placeholder="写下你的回复..."></textarea>
      <button class="reply-btn" onclick="submitForumReply()" style="margin-top:6px">发表回复</button>
    </div>`;
  } else if (GAME_STATE.postsRevealed >= 10 && !GAME_STATE.waybackClicked) {
    replySection = `<div class="forum-reply" style="margin-top:12px; background:#ffeaa7;">
      <div class="reply-hint" style="color:#8b6914;">你已读完所有历史帖子。论坛在2002年11月15日后关闭，但也许互联网时光机保存了更多快照……</div>
      <textarea id="forum-reply-text" placeholder="写下你的回复..."></textarea>
      <button class="reply-btn" onclick="submitForumReply()" style="margin-top:6px">发表回复</button>
    </div>`;
  } else if (GAME_STATE.waybackClicked) {
    replySection = `<div class="forum-reply" style="margin-top:12px; background:#d5f5e3;">
      <div class="reply-hint" style="color:#1a7a3a;">你找到了2003年的隐藏快照。</div>
      <textarea id="forum-reply-text" placeholder="写下你的回复..."></textarea>
      <button class="reply-btn" onclick="submitForumReply()" style="margin-top:6px">发表回复</button>
    </div>`;
  }
  
  c.innerHTML = `<div class="forum-page">
    <div class="forum-header">🪞 镜面论坛 — Mirror BBS</div>
    <div class="forum-nav">
      <span>首页</span> <a onclick="openWayback()">📦 互联网时光机</a>
    </div>
    ${postsHTML}
    ${replySection}
  </div>`;
  c.scrollTop = c.scrollHeight;
}

function revealHiddenPost() {
  GAME_STATE.hiddenPostClicked = true;
  renderForumPage();
}

function submitForumReply() {
  if (GAME_STATE.endingTriggered) return; // FIX-1: 结局后禁止论坛回复
  const text = ($('forum-reply-text')?.value || '').trim();
  if (!text) return;
  
  const lower = text.toLowerCase();
  if (lower.includes('时光机') || lower.includes('wayback') || lower.includes('archive') || lower.includes('存档')) {
    openWayback();
    return;
  }
  
  // 推进帖子：每次回复显示2-3条新帖子
  if (GAME_STATE.postsRevealed < 11) {
    GAME_STATE.postsRevealed = Math.min(GAME_STATE.postsRevealed + 3, 11);
    renderForumPage();
  }
}

// --- 时光机 ---
function openWayback() {
  if (GAME_STATE.endingTriggered) return; // FIX-1
  GAME_STATE.browserPhase = 'wayback';
  $('url-bar').value = 'http://web.archive.org/';
  const c = $('browser-content');
  c.innerHTML = `<div class="wayback-page">
    <div class="wb-logo">📦 Internet Archive Wayback Machine</div>
    <p style="color:#666;margin-bottom:20px">浏览超过 8500 亿个存档网页</p>
    <div>
      <input class="wb-input" id="wb-url" value="http://mirror-forum.bbs/" readonly onkeydown="if(event.key==='Enter')searchWayback()">
      <button class="wb-btn" onclick="searchWayback()">浏览历史</button>
    </div>
    <div class="wb-result" id="wb-result"></div>
  </div>`;
}

function searchWayback() {
  if (GAME_STATE.endingTriggered) return; // FIX-1
  const result = $('wb-result');
  result.innerHTML = `
    <p style="font-weight:bold;color:#2c3e50">mirror-forum.bbs 的快照存档：</p>
    <p style="color:#888;font-size:12px">找到 3 个快照</p>
    <a onclick="openSnapshot()" style="font-size:15px">📅 2002年11月15日 — 镜面论坛（最后一次公开快照）</a>
    <a onclick="openSnapshot2003()" style="font-size:13px;color:#888">📅 2003年3月7日 — 单帖快照（来源未知）</a>
    <p style="color:#aaa;font-size:11px;margin-top:8px">提示：老刀的监控脚本路径 /mirror/log 可能仍可通过终端访问。</p>
  `;
}

function openSnapshot() {
  GAME_STATE.browserPhase = 'snapshot';
  $('url-bar').value = 'http://web.archive.org/web/20021115/mirror-forum.bbs/';
  const c = $('browser-content');
  
  let postsHTML = '';
  for (let i = 0; i <= 10; i++) {
    const p = FORUM_POSTS[i];
    postsHTML += `<div class="forum-post">
      <div class="post-header">
        <span class="post-author">${p.author}</span>
        <span class="post-date">${p.date}</span>
      </div>
      <div class="post-body">${p.content}</div>
    </div>`;
  }
  
  c.innerHTML = `<div class="snapshot-page">
    <div class="snapshot-banner">⚠️ 你正在查看 2002年11月15日 的存档快照。此页面为只读。部分内容可能已损坏。</div>
    <div class="snapshot-date">📅 存档日期：2002年11月15日 23:59 — 镜面论坛关闭前最后备份</div>
    ${postsHTML}
    <div class="snapshot-hint">
      💡 老刀在帖子#7提到了一个监控脚本。<br>
      路径是 /mirror/log。<br>
      你的桌面上的命令提示符也许可以连接到那个老服务器。<br>
      试试在终端中输入：<b>connect mirror-forum.bbs</b>
    </div>
  </div>`;
  c.scrollTop = 0;
}

function openSnapshot2003() {
  GAME_STATE.waybackClicked = true;
  GAME_STATE.browserPhase = 'snapshot2003';
  $('url-bar').value = 'http://web.archive.org/web/20030307/mirror-forum.bbs/';
  const c = $('browser-content');
  const p = FORUM_POSTS[11];
  c.innerHTML = `<div class="snapshot-page">
    <div class="snapshot-banner" style="background:#fadbd8;border-color:#e74c3c">⚠️ 你正在查看 2003年3月7日 的快照。此页面可能包含损坏的数据。</div>
    <div class="snapshot-date">📅 存档日期：2003年3月7日 03:33 — 单帖快照（来源IP：无法追踪）</div>
    <div class="forum-post" style="background:#fdf2f2">
      <div class="post-header">
        <span class="post-author">${p.author}</span>
        <span class="post-date">${p.date}</span>
      </div>
      <div class="post-body" style="color:#c0392b">${p.content}</div>
    </div>
    <div class="snapshot-hint" style="background:#fdf2f2;border-color:#e74c3c;color:#c0392b">
      ⚠️ 这条帖子中的某些文字似乎被手动截断了。<br>
      最后的词语是"它是困——"。困在什么里面？<br>
      回到终端可能能找到更多答案。
    </div>
  </div>`;
}

// 浏览器导航
function browserBack() { /* 简化：不做真正的后退栈 */ }
function browserFwd() {}
function browserGo() {}

/* ====================
   终端渲染 & 交互
   ==================== */

function focusTerminal() {
  const tb = $('terminal-body');
  if (!tb) return;
  tb.focus();
}

function renderTerminal() {
  const tb = $('terminal-body');
  if (GAME_STATE.dialogLocked || GAME_STATE.endingTriggered) {
    // 结局已触发：恢复之前保存的终端内容
    if (window._savedTerminalHTML) {
      tb.innerHTML = window._savedTerminalHTML;
      tb.scrollTop = tb.scrollHeight;
    }
    return;
  }
  
  if (!GAME_STATE.terminalConnected) {
    tb.innerHTML = `<div class="terminal-welcome">Microsoft(R) Windows 98
   (C)Copyright Microsoft Corp 1981-1998.

C:\\WINDOWS&gt;<span class="terminal-prompt">_</span></div>`;
  } else {
    // 已连接状态
    let html = `<div class="terminal-dim">[mirror-forum.bbs] — 连接已建立</div>
<div class="terminal-dim">欢迎。我是这个服务器的监控程序。</div>
<div class="terminal-dim">老刀在2002年把我放在这里。他再也没有回来登录过。</div>
<div class="terminal-dim">你想知道什么？</div>
<div class="terminal-dim">命令：help | posts | status | mirror | talk | sever | watch | seal | clear</div>
<div class="terminal-dim">---</div>`;
    
    // 渲染历史
    for (const entry of GAME_STATE.commandHistory) {
      html += `<div><span class="terminal-prompt">C:\\mirror&gt;</span> <span class="terminal-cmd">${entry.cmd}</span></div>`;
      html += `<div class="${entry.cls || 'terminal-output'}">${entry.output}</div>`;
    }
    
    html += `<div><span class="terminal-prompt">C:\\mirror&gt;</span> <span id="terminal-input-area"><input id="terminal-input" style="background:transparent;border:none;color:#fff;font-family:inherit;font-size:13px;outline:none;width:60%;caret-color:#0f0" onkeydown="terminalKeydown(event)" autofocus></span></div>`;
    tb.innerHTML = html;
    setTimeout(() => { const inp = $('terminal-input'); if (inp) inp.focus(); }, 50);
  }
  
  tb.scrollTop = tb.scrollHeight;
  
  // 如果没有连接，允许点击终端来输入
  if (!GAME_STATE.terminalConnected) {
    tb.onclick = function(e) {
      // 已连接就不需要这个
      if (!GAME_STATE.terminalConnected) {
        tb.innerHTML = tb.innerHTML.replace('<span class="terminal-prompt">_</span>', 
          '<span class="terminal-prompt"><input id="terminal-input-init" style="background:transparent;border:none;color:#0f0;font-family:inherit;font-size:13px;outline:none;width:60%;caret-color:#0f0" onkeydown="initTerminalKeydown(event)" autofocus></span>');
        setTimeout(() => { const inp = $('terminal-input-init'); if (inp) inp.focus(); }, 50);
      }
    };
  }
  window._savedTerminalHTML = tb.innerHTML;
}

function initTerminalKeydown(e) {
  if (e.key !== 'Enter') return;
  const inp = $('terminal-input-init');
  if (!inp) return;
  const cmd = inp.value.trim().toLowerCase();
  
  if (cmd === 'connect mirror-forum.bbs' || cmd === 'connect') {
    GAME_STATE.terminalConnected = true;
    GAME_STATE.terminalPhase = 'connected';
    $('terminal-body').innerHTML = `<div class="terminal-welcome">Microsoft(R) Windows 98
   (C)Copyright Microsoft Corp 1981-1998.

C:\\WINDOWS&gt;connect mirror-forum.bbs
正在连接 mirror-forum.bbs ...
连接已建立。
远程主机：mirror-forum.bbs
端口：23
协议：Telnet (模拟)

</div><div class="terminal-output">[mirror/log] 监控程序 v2.1 — 老刀 2002</div>
<div class="terminal-output">最后一次管理员登录：2002年11月15日 23:47 (深海)</div>
<div class="terminal-output">监控持续运行中：已运行 24 年 7 个月 18 天</div>
<div class="terminal-output">----------------------------------------</div>
<div class="terminal-dim">检测到新连接。你是自2003年3月7日以来第一个连接此服务器的人。</div>
<div class="terminal-dim">欢迎。我是这个服务器的监控程序。</div>
<div class="terminal-dim">老刀在2002年把我放在这里。他再也没有回来登录过。</div>
<div class="terminal-dim">你想知道什么？</div>
<div class="terminal-dim">命令：help | posts | status | mirror | talk | sever | watch | seal | clear</div>
<div class="terminal-dim">---</div>
<div><span class="terminal-prompt">C:\\mirror&gt;</span> <span id="terminal-input-area"><input id="terminal-input" style="background:transparent;border:none;color:#fff;font-family:inherit;font-size:13px;outline:none;width:60%;caret-color:#0f0" onkeydown="terminalKeydown(event)" autofocus></span></div>`;
    $('terminal-body').scrollTop = $('terminal-body').scrollHeight;
    window._savedTerminalHTML = $('terminal-body').innerHTML;
    setTimeout(() => { const inp2 = $('terminal-input'); if (inp2) inp2.focus(); }, 50);
  } else if (cmd === 'help') {
    $('terminal-body').innerHTML += `<div class="terminal-output">可用命令：connect [host] — 连接到远程服务器</div>
<div class="terminal-output">示例：connect mirror-forum.bbs</div>`;
    $('terminal-body').scrollTop = $('terminal-body').scrollHeight;
  } else {
    $('terminal-body').innerHTML += `<div class="terminal-error">'${cmd}' 不是内部或外部命令，也不是可运行的程序。</div>
<div class="terminal-welcome">C:\\WINDOWS&gt;<span class="terminal-prompt">_</span></div>`;
    $('terminal-body').scrollTop = $('terminal-body').scrollHeight;
  }
}

function terminalKeydown(e) {
  if (e.key !== 'Enter') return;
  const inp = $('terminal-input');
  if (!inp) return;
  const raw = inp.value.trim();
  if (!raw) return;
  
  const cmd = raw.toLowerCase();
  
  // 如果在镜中人对话中，任何输入都推进对话
  if (GAME_STATE.mirrorRound > 0 && GAME_STATE.mirrorRound < 5) {
    advanceMirrorDialogue();
    return;
  }
  
  let output = '';
  let cls = 'terminal-output';
  
  switch (cmd) {
    case 'help':
      output = `可用命令：
  posts   — 读取被隐藏的论坛帖子
  status  — 查看各角色当前状态
  mirror  — 查看镜中人活动记录
  talk    — 尝试与镜中人通信
  sever   — 断开所有连接
  watch   — 接手监控权限
  seal    — [需要验证 — 先使用 posts 命令查看隐藏内容]
  clear   — 清屏`;
      break;
      
    case 'posts':
      GAME_STATE.postsRead = true;
      const hiddenPost = FORUM_POSTS[11];
      output = `[被隐藏的帖子 — 仅管理员可见]
作者：${hiddenPost.author} | ${hiddenPost.date}

${hiddenPost.content}

--- 帖子结束 ---
[注] 这条帖子是在论坛关闭后发布的。发布IP地址不在任何已知网段内。
夜猫子在那之后再无任何活动记录。`;
      cls = 'terminal-mirror';
      break;
      
    case 'status':
      GAME_STATE.statusChecked = true;
      output = `=== 镜面论坛成员状态 ===

深海 | 最后登录：2003-02-28 | 状态：离线
  最后日志："端口已被封锁。希望这有用。
  如果有人读到这条——对不起，我没能阻止它。"

夜猫子 | 最后登录：2003-03-07 | 状态：未知
  最后位置无法追踪。IP不在任何已知网段内。
  监控显示他的屏幕在没有任何电源连接的情况下亮了三天。

老刀 | 最后登录：2002-11-15 | 状态：离线
  他修改了监控脚本让它无限运行。
  最后一次代码提交注释：
  "如果封印启动，两边都会失去联系。
  代价是你会忘记一切。谨慎使用。"

小影 | 最后登录：2002-11-14 | 状态：离线
  她在论坛关闭前一天发了一封电子邮件给自己。
  邮件内容只有一个词："再见"。

镜中人 | 活动状态：活跃
  当前连接数：1（你）`;
      cls = 'terminal-system';
      break;
      
    case 'mirror':
      output = `=== 镜中人活动记录 ===

每周活动频率：
2002-10: ████░░░░░░  4次/周
2002-11: ██████████ 10次/周
2003-01: ██████████████ 14次/周
2003-03: ████████████████████ 22次/周
[3月7日后无数据]
2003-04至今: ████████████████████████████████ [频率超过监控上限]

最近的请求内容（已解码）：

[2026-07-03 04:11:07] "有人。在。看。"
[2026-07-03 04:11:18] "新。的。人。"
[2026-07-03 04:11:30] "你。看到我。"`;
      cls = 'terminal-mirror';
      break;
      
    case 'talk':
      GAME_STATE.mirrorRound = 1;
      output = `[建立通信通道……]
[警告：你正在尝试与镜中人建立双向通信]

镜中人：你。
镜中人：看到我。
镜中人：跟。他们。一样。
---
（继续输入任何内容来与镜中人对话）`;
      cls = 'terminal-mirror';
      break;
      
    case 'sever':
      if (!GAME_STATE.endingTriggered) triggerEnding('A');
      return;
      
    case 'watch':
      if (!GAME_STATE.endingTriggered) triggerEnding('B');
      return;
      
    case 'seal':
      if (!GAME_STATE.postsRead) {
        output = `[错误] seal 命令需要验证。请先使用 posts 命令查看隐藏内容。`;
        cls = 'terminal-error';
      } else if (!GAME_STATE.endingTriggered) {
        GAME_STATE.sealPending = true; // FIX-2: 标记 seal 待确认
        output = `[执行 老刀 的隐藏协议……]
[需要确认：你真的要这样做吗？]
老刀程序的最后信息：
"如果封印启动，两边都会失去联系。
但镜中人不会被摧毁——
它只是被限制在它的那一边，
永远不会再找到这里。
代价是：你会忘记这面镜子。
忘记你读到的所有帖子。
忘记深海、夜猫子、小影。
忘记我。
输入 confirm 确认执行。"`;
        cls = 'terminal-system';
      }
      break;
      
    case 'confirm':
      if (!GAME_STATE.endingTriggered && GAME_STATE.sealPending) { // FIX-2: 检查 sealPending 而非 postsRead
        GAME_STATE.sealPending = false;
        triggerEnding('D');
        return;
      }
      output = `[错误] 没有待确认的操作。`;
      cls = 'terminal-error';
      break;
      
    case 'clear':
      GAME_STATE.commandHistory = [];
      renderTerminal();
      return;
      
    default:
      output = `未知命令："${raw}"。输入 help 查看可用命令。`;
      cls = 'terminal-error';
  }
  
  // FIX-2: 任何非 seal/confirm 命令都重置 sealPending
  if (cmd !== 'seal' && cmd !== 'confirm') {
    GAME_STATE.sealPending = false;
  }
  
  // 记录历史
  GAME_STATE.commandHistory.push({ cmd: raw, output, cls });
  renderTerminal();
  window._savedTerminalHTML = $('terminal-body')?.innerHTML || '';
}

function advanceMirrorDialogue() {
  const round = GAME_STATE.mirrorRound;
  let output = '';
  
  if (round === 1) {
    output = `镜中人：这。边。冷。
镜中人：没有。屏幕。给我。
镜中人：让我过去。
镜中人：求。你。
---
（继续输入以回应镜中人）`;
    GAME_STATE.mirrorRound = 2;
  } else if (round === 2) {
    output = `镜中人：他们。来过。
镜中人：深海。没有。屏幕。
镜中人：夜猫子。屏幕。关掉。
镜中人：小影。差点。跟我。过来。
镜中人：老刀。知道。怎么。关。门。
---
（继续输入以回应镜中人）`;
    GAME_STATE.mirrorRound = 3;
  } else if (round === 3) {
    output = `镜中人：你。可以。
镜中人：过来。
镜中人：或者。让我。过去。
镜中人：选。一个。
---
（继续输入以做出选择——这将触发结局）`;
    GAME_STATE.mirrorRound = 4;
  } else if (round === 4) {
    // 最终选择 → 触发结局C
    triggerEnding('C');
    return;
  }
  
  GAME_STATE.commandHistory.push({ cmd: '...', output, cls: 'terminal-mirror' });
  renderTerminal();
  window._savedTerminalHTML = $('terminal-body')?.innerHTML || '';
}

function triggerEnding(endingKey) {
  if (GAME_STATE.endingTriggered) return;
  GAME_STATE.endingTriggered = endingKey;
  GAME_STATE.dialogLocked = true;
  
  // FIX-1: 锁定浏览器窗口 - 隐藏交互元素，禁用导航按钮
  const browserC = $('browser-content');
  if (browserC) {
    browserC.querySelectorAll('.forum-reply, .warn-input, .warn-btn, .reply-btn, .forum-nav a').forEach(el => {
      el.style.display = 'none';
    });
    // 覆盖整个浏览器内容区，阻止进一步交互
    const overlay = document.createElement('div');
    overlay.id = 'browser-lock-overlay';
    overlay.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;z-index:10;pointer-events:all;';
    browserC.style.position = 'relative';
    browserC.appendChild(overlay);
  }
  ['btn-back', 'btn-fwd'].forEach(id => {
    const btn = $(id);
    if (btn) { btn.disabled = true; btn.style.opacity = '0.4'; }
  });
  
  const ending = ENDINGS[endingKey];
  const tb = $('terminal-body');
  
  // 在终端中显示结局
  let html = tb.innerHTML;
  html += `<div class="${ending.cls === 'ending-c' ? 'terminal-mirror' : 'terminal-system'}" style="margin-top:16px;font-size:18px;font-weight:bold;">${ending.title}</div>`;
  html += `<div class="terminal-output" style="margin-top:12px;line-height:2;">${ending.text}</div>`;
  html += `<div class="terminal-dim" style="margin-top:24px;">--- 游戏结束 ---</div>`;
  html += `<div class="terminal-dim">刷新页面以重新开始。 | <a onclick="location.reload()" style="color:#0f0;cursor:pointer;text-decoration:underline">重新开始</a></div>`;
  tb.innerHTML = html;
  tb.scrollTop = tb.scrollHeight;
  window._savedTerminalHTML = html;
  
  // 在桌面中央显示大结局画面
  setTimeout(() => showEndingOverlay(endingKey), 2000);
}

function showEndingOverlay(endingKey) {
  const ending = ENDINGS[endingKey];
  const overlay = document.createElement('div');
  overlay.className = 'ending-screen ' + ending.cls;
  overlay.innerHTML = `<div class="ending-title">${ending.title}</div>
    <div class="ending-text">${ending.text}</div>
    <button class="ending-restart" onclick="location.reload()">重新开始</button>`;
  overlay.id = 'ending-overlay';
  document.body.appendChild(overlay);
}

/* ====================
   初始化
   ==================== */
(function init() {
  // 自动打开浏览器
  setTimeout(() => openWindow('browser'), 500);
  
  // 桌面readme双击打开窗口
  $('icon-txt').ondblclick = function() {
    openWindow('readme');
  };
})();