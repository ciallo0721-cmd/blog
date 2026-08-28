"use strict";
/* ============================================================
   CS · another.js — 提示 / UI HTML 注入 / HUD
   （所有界面 DOM、toast 提示、HUD 刷新）
   ============================================================ */

/* ---------- 0. 注入全部 UI HTML（提示、HUD、遮罩等） ---------- */
const UI_HTML = `
<div id="grain"></div>

<div id="hud">
  <div id="crosshair"></div>
  <div id="topbar"><span class="b" id="blueScore">蓝 0</span> &nbsp;:&nbsp; <span class="r" id="redScore">红 0</span></div>
  <div id="cheats"></div>
  <div id="god">★ 无敌模式 ★</div>
  <div id="topbtns">
    <button id="shareBtn" title="分享">🔗</button>
    <button id="pauseBtn" title="暂停(Esc)">⏸</button>
  </div>
  <div id="keyhelp">
    Power by ciallo0721-cmd<br>
    未经许可,请勿转载或用于商业用途<br>
    键盘：WASD 移动，鼠标看视角，空格 跳，C 蹲，左键开枪，R 换弹，F 换枪，E 救队友，Esc/\` 暂停设置<br>
    手机：左摇杆移动，右侧三键操作，拖拽屏幕看视角
  </div>
  <div id="bottomleft">
    血量 <span id="hp">100</span>
    <div id="hpbar"><div id="hpfill"></div></div>
  </div>
  <div id="bottomright">
    <div id="weapon">AK47</div>
    <div id="ammo">30 / 30</div>
    <div id="nade">雷 x2</div>
  </div>
  <div id="toast"></div>
  <!-- DEBUG 沙盒控制面板（默认隐藏，进 DEBUG 后显示；手机/桌面均可点） -->
  <div id="dbgHud" class="hide">
    <h3>🐞 DEBUG 沙盒</h3>
    <div class="hint">键：;红方 '队友 .红倒 ,蓝倒 -外挂 Y胜 N败 H急救包<br>按钮同功能，手机端可用</div>
    <button id="dbgSpawnRed">召唤红方（敌）</button>
    <button id="dbgSpawnBlue">召唤队友（蓝）</button>
    <button id="dbgDownRed">红方击倒</button>
    <button id="dbgDownBlue">队友/我击倒</button>
    <button id="dbgGod">飞天+无限弹+100血</button>
    <button id="dbgMed">面前生成急救包</button>
    <button id="dbgWin">直接胜利</button>
    <button id="dbgLose">直接失败</button>
    <button id="dbgExit" class="exit">退出 DEBUG</button>
  </div>
  <div id="viewgun">
    <svg viewBox="0 0 140 70" width="170" height="85">
      <g stroke="#14141f" stroke-width="1.5">
        <rect x="30" y="34" width="100" height="13" rx="3" fill="#41415a"/>
        <rect x="22" y="24" width="26" height="13" rx="2" fill="#4d4d66"/>
        <rect x="8" y="30" width="18" height="19" rx="2" fill="#2b2b3d"/>
        <rect x="52" y="47" width="36" height="15" rx="2" fill="#3a3a52"/>
        <rect x="96" y="27" width="13" height="7" rx="2" fill="#6a6a88"/>
        <rect x="118" y="30" width="8" height="20" rx="2" fill="#33334a"/>
      </g>
    </svg>
    <div id="viewgunName">AK47</div>
  </div>
</div>

<div id="touch">
  <div id="look"></div>
  <div id="joystick"><div id="joybase"></div><div id="stick"></div></div>
  <div id="btnFire" class="tbtn">开枪</div>
  <div id="btnReload" class="tbtn">换弹</div>
  <div id="btnSwitch" class="tbtn">换枪</div>
  <div id="btnUp" class="tbtn flybtn">飞↑</div>
  <div id="btnDown" class="tbtn flybtn">飞↓</div>
  <div id="btnCrouch" class="tbtn">蹲</div>
  <div id="btnJump" class="tbtn">跳</div>
</div>

<!-- 开始界面 -->
<div id="overlay" class="overlay">
  <h1>fy_iceworld · <span id="eggDot" title="点我 10 下进入 DEBUG 沙盒" style="cursor:pointer;text-decoration:underline dotted #ff8a3a;">.</span><span id="egg5v5" title="点我 5 下有惊喜" style="cursor:pointer;text-decoration:underline dotted #5aa6ff;">5v5</span> 团队死斗</h1>
  <p>你属于<b style="color:#5aa6ff">蓝队</b>（我方），对手是<b style="color:#ff6a6a">红队</b> AI。
     地图为蓝白做旧风的小型快节奏竞技场，柱子作掩体。<br>
      桌面：WASD+鼠标+空格跳+C蹲，点击锁定指针。手机：左摇杆移动，右侧三键操作。<br>
      击倒≠死亡：倒地可爬行等队友救（按住 E 救队友，救人时不能开枪），一方全员倒地即分胜负；场地有医疗箱可回血。</p>
  <div id="modeRow">当前设备模式：<span id="modeLabel">桌面</span>
    <button id="modeBtn">切换为手机</button></div>
  <div class="start" id="startBtn">点击开始</div>
</div>

<!-- 暂停界面 -->
<div id="pause" class="overlay hide">
  <h1>暂停</h1>
  <div class="row">鼠标灵敏度
    <input type="range" id="sens" min="0.5" max="5" step="0.1" value="2.4">
    <span id="sensVal">2.4</span>
  </div>
  <div class="row">渲染模式
    <button id="texModeBtn" style="background:none;border:1px solid #5aa6ff;color:#5aa6ff;border-radius:6px;padding:2px 10px;cursor:pointer;"></button>
    <span style="opacity:.65;font-size:12px;margin-left:6px;">切换后自动重开</span>
  </div>
  <div class="row">着色器选择
    <button id="shaderModeBtn" style="background:none;border:1px solid #5aa6ff;color:#5aa6ff;border-radius:6px;padding:2px 10px;cursor:pointer;"></button>
    <span style="opacity:.65;font-size:12px;margin-left:6px;">webgl=程序化 / three.js=标准光</span>
  </div>
  <div class="cheats" id="cheatsPause"></div>
  <div class="start" id="resumeBtn">继续</div>
  <div class="start" id="shareBtn2" style="border-color:#5aa6ff;color:#5aa6ff;">分享链接</div>
  <div class="start" id="quitBtn" style="border-color:#ff6a6a;color:#ff6a6a;">返回开始界面</div>
</div>

<!-- 胜负结算 -->
<div id="victory" class="overlay hide">
  <h1 id="victoryTitle">🎉 胜利！</h1>
  <p id="victorySub">红方获胜 · 对方全员倒地</p>
  <div class="start" id="againBtn">再来一局</div>
</div>`;
function buildUI(){ document.body.insertAdjacentHTML('beforeend', UI_HTML); }
buildUI();

/* ---------- 1. HUD / 提示 ---------- */
let toastTimer=null;
function toast(msg){ const t=el('toast'); t.textContent=msg; t.style.opacity=1; clearTimeout(toastTimer); toastTimer=setTimeout(()=>{t.style.opacity=0;},1400); }
function updateHUD(){
  if(!player||!sceneReady) return;
  const hp=Math.max(0,Math.min(200,player.hp));
  el('hp').textContent=Math.round(hp); el('hpfill').style.width=Math.min(100,hp)+'%';
  const w=WEAPONS[curWeapon];
  el('weapon').textContent=w.name;
  if(curWeapon==='grenade') el('ammo').textContent = infiniteAmmo?'∞':('x'+player.ammo.grenade);
  else el('ammo').textContent = infiniteAmmo?'∞':(player.ammo[curWeapon]+' / '+w.mag);
  el('nade').textContent = '雷 '+(infiniteAmmo?'∞':('x'+player.ammo.grenade));
  el('blueScore').textContent='蓝 '+blueScore; el('redScore').textContent='红 '+redScore;
  const vg=el('viewgun'); if(vg){ vg.style.opacity=(player.downed||!player.alive)?0:1; const vn=el('viewgunName'); if(vn)vn.textContent=w.name; }
  // 秘籍状态条已隐藏（仅 README 记录，不在游戏内透露）
}
