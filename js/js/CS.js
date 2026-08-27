
"use strict";
/* ============================================================
   0. 配置 & 秘籍参数
   ============================================================ */
const MAP = 60, HALF = MAP/2;
let RES_SCALE = 0.5;
const EYE = 1.6;
const SPAWN = { enemy:{z:-22,xr:16}, mid:{z:0,xr:24}, ally:{z:22,xr:16} };

const params = new URLSearchParams(location.search);
// —— 秘籍 ——
let imagod        = params.get('imagod') === '1';          // 外挂全开：无敌+无限子弹+飞天
let fireinthehole = params.get('fireinthehole') === '1';   // 无限子弹
let chinesecanfly = params.get('chinesecanfly') === '1';   // 飞天
const pvp           = params.get('pvp') === '1';             // 1v5（无队友）
const tryMode       = params.get('try') === '1';             // 5v1（敌仅1）
let gztfxxm       = params.get('gztfxxm') === '1';          // 核弹（按 0），慎用
const hospitalParam = params.get('hospital');
let sorry         = params.get('sorry') === '1';           // 可误伤友军（打队友）
const spy           = params.get('spy') === '1';             // 玩家变红方（间谍）
let hospitalVal   = (hospitalParam!==null && !isNaN(Number(hospitalParam))) ? Number(hospitalParam) : 0; // 无敌血量

// 渲染分辨率缩放：核显/弱机优先流畅。默认 0.5；?high=1 回 0.75；?low=1 极限 0.45；自动检测 2 核/<=2G 也降
{ const _lp=params.get('low'), _hp=params.get('high');
  if(_hp==='1') RES_SCALE=0.75; else if(_lp==='1') RES_SCALE=0.45;
  else if((navigator.hardwareConcurrency||4)<=2 || (navigator.deviceMemory||8)<=2) RES_SCALE=0.5; }

let infiniteAmmo = fireinthehole || imagod;
let flyEnabled   = chinesecanfly || imagod;

// DEBUG 沙盒模式：点开始界面「.」10 下进入；空地图、可手动召唤/击倒单位、触发胜负
let debugMode = false;
let debugGodOn = false;

let isPhone;
if (params.get('isphone') === 'T') isPhone = true;
else if (params.get('isphone') === 'F') isPhone = false;
else isPhone = /Mobi|Android|iPhone|iPad|iPod|touch/i.test(navigator.userAgent)
              || ('ontouchstart' in window && navigator.maxTouchPoints > 0);
function applyMode(){
  if (isPhone) document.body.classList.add('phone'); else document.body.classList.remove('phone');
  const lbl=document.getElementById('modeLabel'), btn=document.getElementById('modeBtn');
  if(lbl) lbl.textContent = isPhone?'手机':'桌面';
  if(btn) btn.textContent = isPhone?'切换为桌面':'切换为手机';
  if(flyEnabled && isPhone) document.body.classList.add('flyon'); else document.body.classList.remove('flyon');
}
applyMode();
if(spy){ const _p=document.querySelector('#overlay p'); if(_p){ _p.innerHTML=_p.innerHTML
  .replace('蓝队</b>（我方）','红队</b>（我方·间谍）')
  .replace('红队</b> AI','蓝队</b> AI'); } }
document.getElementById('modeBtn').addEventListener('click', e=>{ e.stopPropagation(); isPhone=!isPhone; applyMode(); });

/* ============================================================
   0b. 修改器菜单（点击开始界面「5v5」5 下开启）
   ============================================================ */
// 供修改器窗口读取 / 实时写入的全局接口
window.__csGetState = function(){
  return { imagod, fireinthehole, chinesecanfly, sorry, gztfxxm, spy, pvp, tryMode, hospital:hospitalVal };
};
window.__csApplyLive = function(s){
  if(typeof s.imagod==='boolean')        imagod        = s.imagod;
  if(typeof s.fireinthehole==='boolean') fireinthehole = s.fireinthehole;
  if(typeof s.chinesecanfly==='boolean') chinesecanfly = s.chinesecanfly;
  if(typeof s.sorry==='boolean')         sorry         = s.sorry;
  if(typeof s.gztfxxm==='boolean')       gztfxxm       = s.gztfxxm;
  if(typeof s.hospital==='number'){ hospitalVal = s.hospital; if(player&&player.alive) player.hp = hospitalVal; }
  infiniteAmmo = fireinthehole || imagod;
  flyEnabled   = chinesecanfly || imagod;
  if(flyEnabled && isPhone) document.body.classList.add('flyon'); else document.body.classList.remove('flyon');
  updateHUD();
  if(imagod) toast('外挂已实时开启 ⚡');
};

const TRAINER_HTML = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">
<title>修改器 / Trainer</title>
<style>
  *{box-sizing:border-box;font-family:"Courier New",monospace;}
  body{margin:0;background:#0a1020;color:#cfe3ff;padding:16px;}
  h1{font-size:20px;color:#9fe0ff;letter-spacing:1px;margin:0 0 4px;}
  .sub{font-size:12px;color:#7fa8d8;margin-bottom:14px;line-height:1.6;}
  .row{display:flex;align-items:center;justify-content:space-between;background:rgba(20,40,70,.5);
    border:1px solid #2a4a7a;border-radius:6px;padding:10px 12px;margin:8px 0;}
  .lab{font-size:14px;} .tag{font-size:11px;color:#ffd86a;margin-left:6px;}
  .row input[type=checkbox]{width:22px;height:22px;accent-color:#5aa6ff;}
  .row input[type=number]{width:90px;background:#0a1430;color:#cfe3ff;border:1px solid #3a5a8a;border-radius:4px;padding:4px;font-size:14px;}
  .btns{display:flex;gap:8px;margin-top:16px;}
  button{flex:1;font-family:inherit;font-size:14px;padding:12px;border-radius:8px;cursor:pointer;border:1px solid #5aa6ff;background:rgba(20,40,70,.7);color:#cfe3ff;}
  #apply{background:#1d5fb0;border-color:#9fe0ff;color:#fff;font-weight:bold;}
  #status{margin-top:12px;font-size:13px;color:#9be86a;min-height:18px;text-align:center;}
</style></head>
<body>
<h1>🛠 修改器 Trainer</h1>
<div class="sub">勾选秘籍 → 实时应用（无敌 / 无限弹 / 飞天 / 误伤 / 核弹 即时生效）<br>间谍 · 1v5 · 5v1 需点「应用并重开」</div>
<div id="list"></div>
<div class="btns">
  <button id="apply">实时应用</button>
  <button id="restart">应用并重开</button>
  <button id="close">关闭</button>
</div>
<div id="status"></div>
<script>
  var ITEMS=[
    {k:'imagod',t:'无敌 + 无限弹 + 飞天'},
    {k:'fireinthehole',t:'无限子弹'},
    {k:'chinesecanfly',t:'飞天 (=升 / -降)'},
    {k:'sorry',t:'误伤友军（打队友）'},
    {k:'gztfxxm',t:'核弹（游戏内按 0）'},
    {k:'spy',t:'间谍 / 变红方',need:true},
    {k:'pvp',t:'1v5（无队友）',need:true},
    {k:'tryMode',t:'5v1（敌仅1）',need:true}
  ];
  var st = (opener && opener.__csGetState) ? opener.__csGetState() : {};
  var list=document.getElementById('list');
  ITEMS.forEach(function(it){
    var row=document.createElement('div'); row.className='row';
    var left=document.createElement('div');
    left.innerHTML='<span class="lab">'+it.t+'</span>'+(it.need?'<span class="tag">需重开</span>':'');
    var cb=document.createElement('input'); cb.type='checkbox'; cb.dataset.k=it.k; cb.checked=!!st[it.k];
    row.appendChild(left); row.appendChild(cb); list.appendChild(row);
  });
  var hrow=document.createElement('div'); hrow.className='row';
  hrow.innerHTML='<span class="lab">无敌血量 hospital</span>';
  var num=document.createElement('input'); num.type='number'; num.min='0'; num.value=st.hospital||0; num.id='hosp';
  hrow.appendChild(num); list.appendChild(hrow);
  function readUI(){
    var s={imagod:false,fireinthehole:false,chinesecanfly:false,sorry:false,gztfxxm:false,spy:false,pvp:false,tryMode:false,hospital:0};
    ITEMS.forEach(function(it){ var cb=list.querySelector('input[data-k="'+it.k+'"]'); s[it.k]=cb.checked; });
    s.hospital=parseInt(document.getElementById('hosp').value,10)||0;
    return s;
  }
  function setStatus(m){ document.getElementById('status').textContent=m; }
  function reloadWith(s){
    var base=opener.location.href.split('?')[0].split('#')[0];
    var p=new URLSearchParams();
    if(s.imagod)p.set('imagod','1');
    if(s.fireinthehole)p.set('fireinthehole','1');
    if(s.chinesecanfly)p.set('chinesecanfly','1');
    if(s.sorry)p.set('sorry','1');
    if(s.gztfxxm)p.set('gztfxxm','1');
    if(s.spy)p.set('spy','1');
    if(s.pvp)p.set('pvp','1');
    if(s.tryMode)p.set('try','1');
    if(s.hospital>0)p.set('hospital',String(s.hospital));
    opener.location.href=base+(p.toString()?('?'+p.toString()):'');
    window.close();
  }
  document.getElementById('apply').onclick=function(){
    var s=readUI();
    if(opener&&opener.__csApplyLive) opener.__csApplyLive(s);
    if(s.spy||s.pvp||s.tryMode){ setStatus('间谍/1v5/5v1 需重开游戏…'); setTimeout(function(){reloadWith(s);},400); }
    else setStatus('已实时应用 ✔ 回游戏看效果');
  };
  document.getElementById('restart').onclick=function(){ reloadWith(readUI()); };
  document.getElementById('close').onclick=function(){ window.close(); };
</script>
</body></html>`;

function openTrainer(){
  const w = window.open('', 'cs_trainer', 'width=440,height=700');
  if(!w){ toast('弹窗被拦截，请允许本页弹出窗口'); return; }
  w.document.write(TRAINER_HTML);
  w.document.close();
  toast('修改器已打开 🛠');
}

// 「5v5」彩蛋：连点 5 下开修改器
let _eggClicks = 0;
const _eggEl = document.getElementById('egg5v5');
if(_eggEl){
  _eggEl.addEventListener('click', e=>{
    e.stopPropagation();           // 别误触「点击开始」
    _eggClicks++;
    if(_eggClicks >= 5){ _eggClicks = 0; openTrainer(); }
    else toast('修改器解锁进度 '+_eggClicks+'/5 ✦');
  });
}

// 「.」彩蛋：连点 10 下进入 DEBUG 沙盒（空地图）
let _dotClicks = 0;
const _dotEl = document.getElementById('eggDot');
if(_dotEl){
  _dotEl.addEventListener('click', e=>{
    e.stopPropagation();
    _dotClicks++;
    if(_dotClicks >= 10){ _dotClicks = 0; enterDebug(); }
    else toast('DEBUG 解锁进度 '+_dotClicks+'/10 ✦');
  });
}

/* ============================================================
   0c. DEBUG 沙盒（空地图 + 手动单位 + 触发胜负）
   ============================================================ */
function enterDebug(){
  // 清掉所有非玩家角色（mesh / 进度条 / hitMeshes）
  for(const c of characters.slice()){
    if(c.isPlayer) continue;
    scene.remove(c.group); scene.remove(c.reviveBar);
    const i0=hitMeshes.indexOf(c.meshes[0]); if(i0>=0) hitMeshes.splice(i0,2);
    const ci=characters.indexOf(c); if(ci>=0) characters.splice(ci,1);
  }
  debugMode=true; debugGodOn=false; blueScore=0; redScore=0; matchOver=false;
  // 复位玩家
  player.alive=true; player.downed=false; player.hp=100; player.flyY=0;
  player.group.rotation.x=0; player.group.position.y=0; player.group.visible=false;
  if(player.reviveBar) player.reviveBar.visible=false;
  el('victory').classList.add('hide');
  el('dbgHud').classList.remove('hide');
  el('overlay').classList.add('hide'); running=true; updateHUD();
  if(!isPhone) cv.requestPointerLock(); else toast('🐞 DEBUG：用左下/右侧按钮操作');
  toast('🐞 DEBUG 沙盒已开启：空地图，按键或按钮召唤单位');
}
function debugSpawn(team){
  if(team==='blue' && playerTeam!=='blue'){ /* 仍按字面召唤蓝队 */ }
  const ch=spawnCharacter(team,false); placeAtSpawn(ch);
  toast(team==='red'?'召唤红方（敌）':'召唤队友（蓝）');
}
function debugDown(team){
  if(team==='red'){
    let t=null,nd=1e9;
    for(const c of characters){ if(c.team==='red'&&c.alive&&!c.downed){ const d=c.group.position.distanceTo(player.group.position); if(d<nd){nd=d;t=c;} } }
    if(t){ downChar(t,null); toast('红方击倒'); } else toast('场上没有红方可击倒');
  } else {
    // 优先击倒蓝队 AI 队友；没有则击倒自己（测试队友救援）
    let t=null,nd=1e9;
    for(const c of characters){ if(c.team==='blue'&&!c.isPlayer&&c.alive&&!c.downed){ const d=c.group.position.distanceTo(player.group.position); if(d<nd){nd=d;t=c;} } }
    if(t){ downChar(t,null); toast('队友击倒（测试救援）'); }
    else if(player.alive&&!player.downed){ downChar(player,null); toast('我倒下了！等待队友救援'); }
    else toast('没有可击倒的队友/自己');
  }
}
function debugGod(){
  debugGodOn=!debugGodOn;
  if(debugGodOn){
    flyEnabled=true; infiniteAmmo=true; player.alive=true; player.downed=false;
    player.hp=100; player.group.rotation.x=0; player.group.position.y=0; updateHUD();
    toast('DEBUG 飞天+无限弹+100血 已开');
  } else { flyEnabled=false; infiniteAmmo=false; toast('DEBUG 外挂已关'); }
}
function debugMedkitFront(){
  const sin=Math.sin(player.yaw), cos=Math.cos(player.yaw);
  const fx=-sin, fz=-cos;   // 玩家正前方
  const x=player.group.position.x+fx*3, z=player.group.position.z+fz*3;
  makeMedkit(x,z); toast('已在面前生成医疗箱');
}
function debugWin(){
  el('victoryTitle').textContent='🐞 DEBUG 直接胜利';
  el('victorySub').textContent='（调试）已触发胜利界面';
  el('victory').classList.remove('hide'); running=false; matchOver=true;
  if(document.pointerLockElement===cv) document.exitPointerLock();
  toast('DEBUG：直接胜利');
}
function debugLose(){
  el('victoryTitle').textContent='🐞 DEBUG 直接失败';
  el('victorySub').textContent='（调试）已触发失败界面';
  el('victory').classList.remove('hide'); running=false; matchOver=true;
  if(document.pointerLockElement===cv) document.exitPointerLock();
  toast('DEBUG：直接失败');
}
function debugExit(){ location.reload(); }

let sensitivity = 0.0024;   // 由暂停菜单滑块调节
let paused = false;

const WEAPONS = {
  ak:     {name:'AK47',  interval:0.11, mag:30, dmg:24, reload:1.8, auto:true,  range:60},
  pistol: {name:'手枪',  interval:0.34, mag:12, dmg:18, reload:1.3, auto:false, range:45},
  grenade:{name:'手雷',  interval:0.9,  mag:2,  dmg:0,  reload:0,   auto:false, range:0}
};
const GRENADE_RADIUS = 6, GRENADE_MAXDMG = 65;
const BOT_DMG = {ak:18, pistol:14};

/* ============================================================
   1. 场景 / 相机 / 渲染器
   ============================================================ */
const container = document.getElementById('game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fb8d8);
scene.fog = new THREE.Fog(0x9fb8d8, 30, 70);
const camera = new THREE.PerspectiveCamera(78, window.innerWidth/window.innerHeight, 0.1, 200);
camera.rotation.order = 'YXZ';
const renderer = new THREE.WebGLRenderer({antialias:false});
renderer.setPixelRatio(1);
renderer.setSize(Math.floor(window.innerWidth*RES_SCALE), Math.floor(window.innerHeight*RES_SCALE), false);
container.appendChild(renderer.domElement);
scene.add(new THREE.AmbientLight(0xffffff, 0.85));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.6); dirLight.position.set(20,40,10); scene.add(dirLight);

/* ============================================================
   2. 蓝白马赛克纹理（Canvas 生成）
   ============================================================ */
function makeMosaicTexture(base, tint, cells){
  const c=document.createElement('canvas'); c.width=c.height=64; const ctx=c.getContext('2d');
  const step=Math.floor(64/cells);
  for(let y=0;y<cells;y++)for(let x=0;x<cells;x++){
    const r=Math.random(); let col = r<0.5?base : (r<0.85?'#e8f2ff':tint);
    ctx.fillStyle=col; ctx.fillRect(x*step,y*step,step,step);
  }
  const tex=new THREE.CanvasTexture(c);
  tex.magFilter=THREE.NearestFilter; tex.minFilter=THREE.NearestFilter;
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping; return tex;
}
const texMid=makeMosaicTexture('#7fa8d8','#cfe3ff',8);
const texAlly=makeMosaicTexture('#6f9fd0','#3a6fc8',8);
const texEnemy=makeMosaicTexture('#9fb0c8','#c84a4a',8);
const texPillar=makeMosaicTexture('#bcd0ec','#ffffff',6);

/* ============================================================
   3. 地图
   ============================================================ */
function addGround(z,len,tex,tint){ tex.repeat.set(6,2);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(MAP,len),new THREE.MeshLambertMaterial({map:tex,color:new THREE.Color(tint)}));
  m.rotation.x=-Math.PI/2; m.position.set(0,0,z); scene.add(m);
}
addGround(-20,20,texEnemy,0xd8c0c0); addGround(0,20,texMid,0xffffff); addGround(20,20,texAlly,0xc0d0ff);
const wallMat=new THREE.MeshLambertMaterial({color:0xbcd0ec,map:texPillar});
function addWall(x,z,w,d){const m=new THREE.Mesh(new THREE.BoxGeometry(w,3,d),wallMat);m.position.set(x,1.5,z);scene.add(m);}
addWall(0,-HALF,MAP,1);addWall(0,HALF,MAP,1);addWall(-HALF,0,1,MAP);addWall(HALF,0,1,MAP);
const pillars=[];
const pillarPos=[[-28,-28],[0,-28],[28,-28],[-28,0],[28,0],[-28,28],[0,28],[28,28],
  [-15,-10],[0,-10],[15,-10],[-15,10],[0,10],[15,10],[-10,0],[10,0]];
const pillarMat=new THREE.MeshLambertMaterial({color:0xcfe0f5,map:texPillar});
for(const [x,z] of pillarPos){const m=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,6,8),pillarMat);m.position.set(x,3,z);scene.add(m);pillars.push({x,z,r:1.7});}

/* ============================================================
   4. 角色系统
   ============================================================ */
// 共享材质：避免每个角色/医疗箱/子弹都 new 独立材质，减少 GPU 状态切换（核显关键优化）
const MAT = {
  blue:   new THREE.MeshLambertMaterial({color:0x3a7bd5}),
  red:    new THREE.MeshLambertMaterial({color:0xd53a3a}),
  head:   new THREE.MeshLambertMaterial({color:0xf0d8b0}),
  gun:    new THREE.MeshLambertMaterial({color:0x23232f}),
  medBox: new THREE.MeshLambertMaterial({color:0xd8e8ff}),
  cross:  new THREE.MeshLambertMaterial({color:0x39d06a}),
  bullet: new THREE.MeshLambertMaterial({color:0xff8a3a}),
};
const characters=[], hitMeshes=[], grenades=[];
function makeReviveSprite(){
  const c=document.createElement('canvas'); c.width=64; c.height=10;
  const ctx=c.getContext('2d');
  ctx.fillStyle='rgba(10,20,15,0.75)'; ctx.fillRect(0,0,64,10);
  ctx.fillStyle='#7dff9b'; ctx.fillRect(2,2,60,6);
  const tex=new THREE.CanvasTexture(c);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
  sp.scale.set(1.6,0.25,1); sp.visible=false; return sp;
}
function makeCharMesh(team){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(0.8,1.0,0.5), team==='blue'?MAT.blue:MAT.red); body.position.y=1.0;
  const head=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.5),MAT.head); head.position.y=1.8;
  const tag=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.16,0.7), team==='blue'?MAT.blue:MAT.red); tag.position.y=2.2;
  // 枪：身前横杆，代表枪口朝向（分辨谁在打你）
  const gun=new THREE.Mesh(new THREE.BoxGeometry(0.95,0.12,0.14),MAT.gun);
  gun.position.set(0,1.05,0.75); gun.userData.isGun=true;
  g.add(body,head,tag,gun); return {group:g,body,head,gun};
}
function spawnCharacter(team,isPlayer){
  const m=makeCharMesh(team); scene.add(m.group);
  const ch={team,isPlayer,alive:true,hp:100,respawn:0,group:m.group,meshes:[m.body,m.head],
    yaw:team==='blue'?Math.PI:0,pitch:0,recoil:0,flyY:0,weapon:'ak',gun:m.gun,
    ammo:{ak:WEAPONS.ak.mag,pistol:WEAPONS.pistol.mag,grenade:WEAPONS.grenade.mag},
    reloading:false,reloadT:0,lastFire:0,aiState:'patrol',aiTarget:null,aiTimer:0,moveTarget:null,
    downed:false,downedT:0,reviveProg:0,reviveT:0};
  ch.reviveBar=makeReviveSprite(); scene.add(ch.reviveBar);
  m.body.userData.char=ch; m.head.userData.char=ch;
  characters.push(ch); hitMeshes.push(m.body,m.head); return ch;
}
const playerTeam = spy ? 'red' : 'blue';
const player=spawnCharacter(playerTeam,true);
const blueAI = pvp ? 0 : 4;     // 1v5 模式无队友
const redAI  = tryMode ? 1 : 5; // 5v1 模式敌仅1
for(let i=0;i<blueAI;i++) spawnCharacter('blue',false);
for(let i=0;i<redAI;i++) spawnCharacter('red',false);

function placeAtSpawn(ch){
  const s=ch.team==='blue'?SPAWN.ally:SPAWN.enemy;
  ch.group.position.set((Math.random()-0.5)*2*s.xr,0,s.z+(Math.random()-0.5)*6);
  ch.group.rotation.y=ch.yaw; ch.group.rotation.x=0; ch.group.position.y=0;
}
characters.forEach(placeAtSpawn);

/* ============================================================
   4b. 医疗箱系统
   ============================================================ */
const MEDKIT_HEAL = 60, MEDKIT_RADIUS = 1.6, MEDKIT_CD = 12;
const medkits=[];
function makeMedkit(x,z){
  const g=new THREE.Group();
  const box=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.9,0.9),MAT.medBox);
  box.position.y=0.8;
  const cr1=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.26,0.26),MAT.cross); cr1.position.y=0.8;
  const cr2=new THREE.Mesh(new THREE.BoxGeometry(0.26,0.9,0.26),MAT.cross); cr2.position.y=0.8;
  g.add(box,cr1,cr2); g.position.set(x,0,z); scene.add(g);
  medkits.push({group:g,pos:new THREE.Vector3(x,0,z),active:true,cd:0});
}
[[-18,-18],[18,-18],[-18,18],[18,18],[0,0]].forEach(p=>makeMedkit(p[0],p[1]));

// 玩家：隐身（只剩摄像机在打）+ 应用 hospital 血量
player.group.visible=false;
if(hospitalVal>0) player.hp=hospitalVal;

let blueScore=0, redScore=0, matchOver=false;

function damage(ch,amt,attacker){
  if(!ch.alive||ch.downed) return;
  if(imagod && ch.isPlayer){ ch.hp=Math.min(200,ch.hp+amt); if(ch.isPlayer)updateHUD(); return; }
  ch.hp-=amt;
  if(ch.hp<=0){ downChar(ch,attacker); }
  else if(ch.isPlayer) updateHUD();
}
// 击倒（倒地）：可以爬行、可以被队友救，全队倒地则输
function downChar(ch,attacker,boom){
  ch.alive=false; ch.downed=true; ch.downedT=0; ch.reviveProg=0;
  ch.group.rotation.x=Math.PI/2.1; ch.group.position.y=0.35;
  if(ch.gun) ch.gun.visible=false;
  if(ch.reviveBar){ ch.reviveBar.visible=false; }
  if(attacker&&attacker.team!==ch.team){ if(attacker.team==='blue')blueScore++; else if(attacker.team==='red')redScore++; }
  if(ch.isPlayer) toast(boom?'你被炸倒了！爬向队友或等队友救援':'你被击倒了！爬向队友或等队友救援（被救前无法战斗）');
  else if(attacker&&attacker.isPlayer) toast('击倒 '+((ch.team!==attacker.team)?'敌方':'友军')+' +1');
  updateHUD();
  checkWin();
}
// 救援
const REVIVE_TIME = 3.2, REVIVE_RANGE = 3.2;
function tickRevive(dc,dt,reviver){
  if(!dc.downed) return;
  dc.reviveProg = Math.min(1, dc.reviveProg + dt/REVIVE_TIME);
  if(dc.reviveBar){
    dc.reviveBar.visible=true;
    dc.reviveBar.position.set(dc.group.position.x, 2.1, dc.group.position.z);
    dc.reviveBar.scale.x = Math.max(0.06, 1.6*dc.reviveProg);
  }
  if(dc.reviveProg>=1) reviveChar(dc,reviver);
}
function reviveChar(ch,reviver){
  ch.alive=true; ch.downed=false; ch.reviveProg=0; ch.downedT=0;
  ch.hp = (ch.isPlayer && hospitalVal>0)?hospitalVal:50;
  ch.group.rotation.x=0; ch.group.position.y=0;
  if(ch.gun) ch.gun.visible=true;
  if(ch.reviveBar) ch.reviveBar.visible=false;
  if(ch.isPlayer) toast('你被救起来了！血量 '+Math.round(ch.hp));
  else if(reviver&&reviver.isPlayer) toast('已救起 '+((ch.team===reviver.team)?'队友':'友军')+' 血量 '+Math.round(ch.hp));
  updateHUD();
}
function respawnChar(ch){
  ch.alive=true; ch.downed=false; ch.reviveProg=0; ch.reviveT=0; ch.downedT=0;
  ch.hp = (ch.isPlayer && hospitalVal>0)?hospitalVal:100; ch.group.visible=!ch.isPlayer;
  ch.ammo={ak:WEAPONS.ak.mag,pistol:WEAPONS.pistol.mag,grenade:WEAPONS.grenade.mag};
  ch.reloading=false; ch.reloadT=0; ch.flyY=0;
  ch.group.rotation.x=0; ch.group.position.y=0;
  if(ch.gun) ch.gun.visible=true;
  if(ch.reviveBar) ch.reviveBar.visible=false;
  placeAtSpawn(ch); if(ch.isPlayer)updateHUD();
}
// 团灭判定：一方全员倒地即输
function teamAlive(t){ return characters.some(c=>c.team===t && c.alive); }
function checkWin(){
  if(matchOver||debugMode) return;   // DEBUG 沙盒下不自动判胜负（空场/手动单位）
  const blueDown=!teamAlive('blue'), redDown=!teamAlive('red');
  if(blueDown||redDown){
    matchOver=true; running=false;
    const winner=blueDown?'红方':'蓝方';
    const playerWin = (blueDown&&playerTeam==='red')||(redDown&&playerTeam==='blue');
    el('victoryTitle').textContent = playerWin?'🎉 胜利！':'💀 失败…';
    el('victorySub').textContent = winner+' 获胜 · 对方全员倒地'+(playerWin?'':'，下局再战');
    el('victory').classList.remove('hide');
    if(document.pointerLockElement===cv) document.exitPointerLock();
  }
}
function resetMatch(){
  if(debugMode){ enterDebug(); return; }   // DEBUG 下「再来一局」= 清空重开沙盒
  blueScore=0; redScore=0; matchOver=false;
  for(const c of characters) respawnChar(c);
  el('victory').classList.add('hide');
  running=true; updateHUD();
  if(!isPhone) cv.requestPointerLock();
}
function resolveCollision(pos){
  pos.x=Math.max(-HALF+1.5,Math.min(HALF-1.5,pos.x));
  pos.z=Math.max(-HALF+1.5,Math.min(HALF-1.5,pos.z));
  for(const p of pillars){const dx=pos.x-p.x,dz=pos.z-p.z,d=Math.hypot(dx,dz);
    if(d<p.r&&d>0.0001){const push=p.r-d; pos.x+=dx/d*push; pos.z+=dz/d*push;}}
}

/* ============================================================
   5. 武器 / 射击 / 手雷
   ============================================================ */
let curWeapon='ak', firing=false;
function recoilKick(){ player.recoil+=0.03; }
let _vgTimer=null;
function viewKick(){ const vg=el('viewgun'); if(!vg)return; vg.style.transform='translateY(7px) rotate(1.2deg)'; clearTimeout(_vgTimer); _vgTimer=setTimeout(()=>{vg.style.transform='';},70); }
const raycaster=new THREE.Raycaster(), _dir=new THREE.Vector3();

function playerFire(){
  const w=WEAPONS[curWeapon];
  if(curWeapon==='grenade'){ throwGrenade(player); return; }
  if(revivingNow) return;      // 救人时不能开枪
  if(player.reloading) return;
  if(performance.now()-player.lastFire < w.interval*1000) return;
  if(player.ammo[curWeapon]<=0){ toast('弹匣空 · 按 R 换弹'); return; }
  player.lastFire=performance.now();
  if(!(curWeapon!=='grenade' && infiniteAmmo)) player.ammo[curWeapon]--;  // 无限子弹
  playShoot(curWeapon); recoilKick(); viewKick();
  camera.getWorldDirection(_dir); raycaster.set(camera.position,_dir); raycaster.far=w.range;
  const hits=raycaster.intersectObjects(hitMeshes,false);
  if(hits.length){ const ch=hits[0].object.userData.char; if(ch&&ch.alive&&(ch.team!==player.team||(sorry&&ch.team===player.team))) damage(ch,w.dmg,player); }
  updateHUD();
}
function botFire(b,target){
  const w=WEAPONS[b.weapon];
  const origin=b.group.position.clone(); origin.y=1.5;
  const d=target.group.position.clone().sub(origin); d.y=0; d.normalize();
  const spread=(Math.random()-0.5)*0.32; const a=Math.atan2(d.x,d.z)+spread;
  _dir.set(Math.sin(a),0,Math.cos(a));
  const rc=new THREE.Raycaster(origin,_dir,0,w.range);
  const hits=rc.intersectObjects(hitMeshes,false);
  if(hits.length){ const ch=hits[0].object.userData.char; if(ch&&ch.alive&&ch.team!==b.team) damage(ch,BOT_DMG[b.weapon]||18,b); }
}
function startReload(ch){
  const w=WEAPONS[ch.weapon];
  if(ch.weapon==='grenade'||ch.reloading) return;
  if(ch.ammo[ch.weapon]>=w.mag) return;
  ch.reloading=true; ch.reloadT=w.reload; if(ch.isPlayer){toast('换弹中…');playReload();}
}
function finishReload(ch){ ch.ammo[ch.weapon]=WEAPONS[ch.weapon].mag; ch.reloading=false; if(ch.isPlayer)updateHUD(); }
function switchWeapon(){ const o=['ak','pistol','grenade']; curWeapon=o[(o.indexOf(curWeapon)+1)%o.length]; firing=false; updateHUD(); }
function throwGrenade(ch){
  if(ch.ammo.grenade<=0){ if(ch.isPlayer)toast('手雷已用完'); return; }
  if(!(ch.isPlayer && infiniteAmmo)) ch.ammo.grenade--;   // 无限子弹也覆盖手雷
  const origin=ch.isPlayer?camera.position.clone():ch.group.position.clone().setY(1.5);
  let gdir;
  if(ch.isPlayer) gdir=camera.getWorldDirection(new THREE.Vector3());
  else { const t=ch.aiTarget; gdir=t?t.group.position.clone().sub(origin).normalize():new THREE.Vector3(Math.sin(ch.yaw),0,Math.cos(ch.yaw)); }
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(0.25,8,8),MAT.bullet);
  mesh.position.copy(origin); scene.add(mesh);
  grenades.push({mesh,pos:origin.clone(),vel:gdir.multiplyScalar(16).add(new THREE.Vector3(0,5,0)),fuse:2.0,owner:ch});
  if(ch.isPlayer){ toast('手雷已投掷'); updateHUD(); }
}
function explode(pos,owner){
  playExplosion();
  const flash=new THREE.Mesh(new THREE.SphereGeometry(0.6,8,8),new THREE.MeshBasicMaterial({color:0xffd86a,transparent:true,opacity:0.9}));
  flash.position.copy(pos); flash.position.y=1; scene.add(flash);
  let f=1; const anim=()=>{f-=0.08;flash.scale.setScalar(1+(1-f)*6);flash.material.opacity=f; if(f<=0)scene.remove(flash);else requestAnimationFrame(anim);}; anim();
  for(const c of characters){ if(!c.alive||c.downed)continue; const d=c.group.position.distanceTo(pos);
    if(d<GRENADE_RADIUS){ const dmg=GRENADE_MAXDMG*(1-d/GRENADE_RADIUS); damage(c,dmg,owner); } }
}
function callNuke(){   // 秘籍 gztfxxm：核弹，我方 +1000
  if(!gztfxxm) return;
  if(playerTeam==='blue') blueScore+=1000; else redScore+=1000;
  for(const c of characters){ if(c.team!==playerTeam&&c.alive) damage(c,9999,player); }
  playExplosion(); toast('☢ 核弹已召唤！我方 +1000'); updateHUD();
}

/* ============================================================
   6. AI 状态机
   ============================================================ */
function updateBot(b,dt){
  if(b.downed){ b.downedT+=dt; return; }   // 倒地 AI：躺平等队友救
  if(b.reloading){ b.reloadT-=dt; if(b.reloadT<=0)finishReload(b); }
  // 找最近的倒地队友（去救）与最近的敌人
  let dTarget=null,dd=1e9;
  for(const c of characters){ if(c.team!==b.team||!c.downed)continue; const d=b.group.position.distanceTo(c.group.position); if(d<dd){dd=d;dTarget=c;} }
  let near=null,nd=1e9;
  for(const c of characters){ if(c===b||!c.alive||c.downed||c.team===b.team)continue; const d=b.group.position.distanceTo(c.group.position); if(d<nd){nd=d;near=c;} }
  b.aiTarget=near;
  if(dTarget && dd<40 && (nd>18||!near)){
    // 救人优先（没贴脸敌人时才救；救人时不能开枪，正好可以被偷袭）
    b.aiState='revive';
    const tx=dTarget.group.position.x-b.group.position.x, tz=dTarget.group.position.z-b.group.position.z, ang=Math.atan2(tx,tz);
    b.yaw=ang;
    if(dd>REVIVE_RANGE){ b.group.position.x+=Math.sin(ang)*4.5*dt; b.group.position.z+=Math.cos(ang)*4.5*dt; }
    else tickRevive(dTarget,dt,b);
  } else if(near&&nd<34){
    b.aiState='chase';
    const tx=near.group.position.x-b.group.position.x, tz=near.group.position.z-b.group.position.z, ang=Math.atan2(tx,tz);
    b.yaw=ang; let mv=0; if(nd>12)mv=1; else if(nd<6)mv=-1;
    b.group.position.x+=Math.sin(ang)*mv*5*dt; b.group.position.z+=Math.cos(ang)*mv*5*dt;
    if(!b.reloading){
      b.aiTimer-=dt;
      if(b.ammo[b.weapon]<=0)startReload(b);
      else if(b.aiTimer<=0){ b.aiTimer=(b.weapon==='ak')?0.22:0.5; botFire(b,near); }
      if(nd<9&&b.ammo.grenade>0&&Math.random()<0.012) throwGrenade(b);
    }
  } else {
    b.aiState='patrol';
    if(!b.moveTarget||b.group.position.distanceTo(b.moveTarget)<2) b.moveTarget=new THREE.Vector3((Math.random()-0.5)*50,0,(Math.random()-0.5)*50);
    const tx=b.moveTarget.x-b.group.position.x, tz=b.moveTarget.z-b.group.position.z, ang=Math.atan2(tx,tz);
    b.yaw=ang; b.group.position.x+=Math.sin(ang)*4*dt; b.group.position.z+=Math.cos(ang)*4*dt;
  }
  resolveCollision(b.group.position); b.group.position.y=0; b.group.rotation.y=b.yaw;
}

/* ============================================================
   7. 玩家控制（含飞天）
   ============================================================ */
const keys={};
const joy={active:false,id:null,baseX:0,baseY:0,x:0,y:0};
let running=false;
let revivingNow=false;   // 玩家正在救人（此时不能开枪）
function updatePlayer(dt){
  // —— 倒地状态：只能缓慢爬行，等队友来救 ——
  if(player.downed){
    player.downedT+=dt;
    let fx=0,fz=0;
    if(!isPhone){ fx=(keys['w']?1:0)-(keys['s']?1:0); fz=(keys['d']?1:0)-(keys['a']?1:0); }
    else { fx=-joy.y; fz=joy.x; }
    const sin=Math.sin(player.yaw),cos=Math.cos(player.yaw);
    const fwdX=-sin,fwdZ=-cos, rgtX=cos,rgtZ=-sin;
    let vx=fwdX*fx+rgtX*fz, vz=fwdZ*fx+rgtZ*fz; const len=Math.hypot(vx,vz); if(len>0){vx/=len;vz/=len;}
    const sp=2.2; player.group.position.x+=vx*sp*dt; player.group.position.z+=vz*sp*dt;
    resolveCollision(player.group.position);
    player.group.position.y=0.35;
    camera.position.set(player.group.position.x, 0.5, player.group.position.z);
    camera.rotation.y=player.yaw; camera.rotation.x=player.pitch;
    // 附近的 AI 队友会自动来救你
    for(const c of characters){ if(c.team===player.team&&!c.isPlayer&&c.alive&&!c.downed){
      if(c.group.position.distanceTo(player.group.position)<REVIVE_RANGE) tickRevive(player,dt,c); } }
    return;
  }
  if(!player.alive) return;
  if(player.reloading){ player.reloadT-=dt; if(player.reloadT<=0)finishReload(player); }
  // 救人：按住 E（手机靠近自动）救最近的倒地队友；救人时不能开枪
  revivingNow=false;
  let revTarget=null, rd=1e9;
  for(const c of characters){ if(c.team===player.team&&c.downed){ const d=c.group.position.distanceTo(player.group.position); if(d<rd){rd=d;revTarget=c;} } }
  const nearRev = revTarget && rd<=REVIVE_RANGE;
  const wantRev = isPhone ? nearRev : (keys['e'] && nearRev);
  if(wantRev){
    revivingNow=true;
    if(revTarget.reviveProg<=0.001) toast(isPhone?'正在救援…':'正在救援…保持按住 E');
    tickRevive(revTarget,dt,player);
  }
  // 飞天
  if(flyEnabled){ if(keys['=']||flyUp)player.flyY+=7*dt; if(keys['-']||flyDown)player.flyY-=7*dt; player.flyY=Math.max(-1,Math.min(45,player.flyY)); }
  let fx=0,fz=0;
  if(!isPhone){ fx=(keys['w']?1:0)-(keys['s']?1:0); fz=(keys['d']?1:0)-(keys['a']?1:0); }
  else { fx=-joy.y; fz=joy.x; }
  const sin=Math.sin(player.yaw),cos=Math.cos(player.yaw);
  const fwdX=-sin,fwdZ=-cos, rgtX=cos,rgtZ=-sin;
  let vx=fwdX*fx+rgtX*fz, vz=fwdZ*fx+rgtZ*fz; const len=Math.hypot(vx,vz); if(len>0){vx/=len;vz/=len;}
  const sp=7; player.group.position.x+=vx*sp*dt; player.group.position.z+=vz*sp*dt;
  resolveCollision(player.group.position);
  player.group.position.y=player.flyY;   // 隐身，高度由 flyY 决定
  camera.position.set(player.group.position.x, EYE+player.flyY, player.group.position.z);
  player.recoil*=0.85; camera.rotation.y=player.yaw; camera.rotation.x=player.pitch+player.recoil;
  if(firing&&curWeapon==='ak'&&!revivingNow) playerFire();
}

/* ============================================================
   8. 音效（WebAudio）
   ============================================================ */
let actx=null;
function initAudio(){ if(!actx){ try{actx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){actx=null;} } }
function noiseBuf(dur){ const len=Math.floor(actx.sampleRate*dur); const buf=actx.createBuffer(1,len,actx.sampleRate); const d=buf.getChannelData(0); for(let i=0;i<len;i++)d[i]=Math.random()*2-1; return buf; }
function playShoot(type){ if(!actx)return; const t=actx.currentTime; const src=actx.createBufferSource(); src.buffer=noiseBuf(type==='ak'?0.08:0.12);
  const g=actx.createGain(); g.gain.setValueAtTime(type==='ak'?0.5:0.35,t); g.gain.exponentialRampToValueAtTime(0.001,t+(type==='ak'?0.08:0.12));
  const lp=actx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=2200; src.connect(lp);lp.connect(g);g.connect(actx.destination); src.start(t); }
function playReload(){ if(!actx)return; const t=actx.currentTime; const o=actx.createOscillator(); o.type='square'; o.frequency.value=180;
  const g=actx.createGain(); g.gain.setValueAtTime(0.15,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.12); o.connect(g);g.connect(actx.destination); o.start(t);o.stop(t+0.13); }
function playExplosion(){ if(!actx)return; const t=actx.currentTime; const src=actx.createBufferSource(); src.buffer=noiseBuf(0.5);
  const g=actx.createGain(); g.gain.setValueAtTime(0.7,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.5);
  const lp=actx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=600; src.connect(lp);lp.connect(g);g.connect(actx.destination); src.start(t); }

/* ============================================================
   9. HUD
   ============================================================ */
const el=id=>document.getElementById(id);
let toastTimer=null;
function toast(msg){ const t=el('toast'); t.textContent=msg; t.style.opacity=1; clearTimeout(toastTimer); toastTimer=setTimeout(()=>{t.style.opacity=0;},1400); }
function updateHUD(){
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

/* ============================================================
   10. 输入（桌面键鼠 + 手机触控，全部注册；模式走 isPhone）
   ============================================================ */
const cv=renderer.domElement;
document.addEventListener('keydown', e=>{
  const k=e.key.toLowerCase(); keys[k]=true;
  if(k==='escape'){ togglePause(); return; }
  if(debugMode){   // DEBUG 沙盒快捷键（移动/射击仍可用）
    if(e.repeat) return;   // 防键盘重复：避免按住 - 反复开关外挂 / 连续刷单位
    if(k===';') debugSpawn('red');
    else if(k==="'") debugSpawn('blue');
    else if(k==='.') debugDown('red');
    else if(k===',') debugDown('blue');
    else if(k==='-') debugGod();
    else if(k==='y') debugWin();
    else if(k==='n') debugLose();
    else if(k==='h') debugMedkitFront();
    return;
  }
  if(player.downed) return;          // 倒地时禁用换弹/换枪/核弹
  if(k==='r') startReload(player);
  if(k==='f') switchWeapon();
  if(k==='0') callNuke();
});
document.addEventListener('keyup', e=>{ keys[e.key.toLowerCase()]=false; });
cv.addEventListener('mousedown', e=>{
  if(!running||!player.alive||revivingNow) return;
  if(e.button===0){ if(curWeapon==='grenade')throwGrenade(player); else if(curWeapon==='pistol')playerFire(); else firing=true; }
});
window.addEventListener('mouseup', e=>{ if(e.button===0)firing=false; });
cv.addEventListener('contextmenu', e=>e.preventDefault());
document.addEventListener('contextmenu', e=>e.preventDefault());
document.addEventListener('mousemove', e=>{
  if(!running||document.pointerLockElement!==cv) return;
  player.yaw-=e.movementX*sensitivity; player.pitch-=e.movementY*sensitivity;
  player.pitch=Math.max(-1.45,Math.min(1.45,player.pitch));
});
document.addEventListener('pointerlockchange', ()=>{
  if(document.pointerLockElement!==cv && running && !paused){
    running=false; el('overlay').classList.remove('hide'); el('startBtn').textContent='点击继续';
  }
});

// 手机触控
const joyEl=el('joystick'), stickEl=el('stick'), JMAX=42;
function stickMove(t){ let dx=t.clientX-joy.baseX, dy=t.clientY-joy.baseY; const d=Math.hypot(dx,dy);
  if(d>JMAX){dx=dx/d*JMAX;dy=dy/d*JMAX;} stickEl.style.transform=`translate(${dx}px,${dy}px)`; joy.x=dx/JMAX; joy.y=dy/JMAX; }
joyEl.addEventListener('touchstart', e=>{ e.preventDefault(); const t=e.changedTouches[0]; joy.id=t.identifier; joy.active=true;
  const r=joyEl.getBoundingClientRect(); joy.baseX=r.left+r.width/2; joy.baseY=r.top+r.height/2; stickMove(t); },{passive:false});
joyEl.addEventListener('touchmove', e=>{ e.preventDefault(); for(const t of e.changedTouches) if(t.identifier===joy.id)stickMove(t); },{passive:false});
function joyEnd(e){ for(const t of e.changedTouches) if(t.identifier===joy.id){ joy.active=false;joy.id=null;joy.x=0;joy.y=0;stickEl.style.transform='translate(0,0)'; } }
joyEl.addEventListener('touchend', e=>{e.preventDefault();joyEnd(e);},{passive:false});
joyEl.addEventListener('touchcancel', e=>{e.preventDefault();joyEnd(e);},{passive:false});
function bindBtn(id,onDown,onUp){ const b=el(id); b.addEventListener('touchstart',e=>{e.preventDefault();if(!running)return;onDown();},{passive:false});
  if(onUp)b.addEventListener('touchend',e=>{e.preventDefault();onUp();},{passive:false}); }
bindBtn('btnFire', ()=>{ if(curWeapon==='grenade')throwGrenade(player); else if(curWeapon==='pistol')playerFire(); else {firing=true;playerFire();} }, ()=>{firing=false;});
bindBtn('btnReload', ()=>startReload(player));
bindBtn('btnSwitch', ()=>switchWeapon());
// 手机飞天（仅秘籍开启时显示）
let flyUp=false, flyDown=false;
bindBtn('btnUp', ()=>{flyUp=true;}, ()=>{flyUp=false;});
bindBtn('btnDown', ()=>{flyDown=true;}, ()=>{flyDown=false;});

// 手机视角（在 #look 层拖拽看视角；摇杆与按钮在其上层，互不干扰）
const lookEl=el('look'), look={id:null,lx:0,ly:0};
lookEl.addEventListener('touchstart', e=>{ if(!running||paused)return; e.preventDefault(); const t=e.changedTouches[0]; look.id=t.identifier; look.lx=t.clientX; look.ly=t.clientY; }, {passive:false});
lookEl.addEventListener('touchmove', e=>{ if(look.id===null)return; e.preventDefault();
  for(const t of e.changedTouches){ if(t.identifier===look.id){
    const dx=t.clientX-look.lx, dy=t.clientY-look.ly; look.lx=t.clientX; look.ly=t.clientY;
    player.yaw-=dx*sensitivity*2; player.pitch-=dy*sensitivity*2; player.pitch=Math.max(-1.45,Math.min(1.45,player.pitch)); } }
}, {passive:false});
function lookEnd(e){ for(const t of e.changedTouches) if(t.identifier===look.id) look.id=null; }
lookEl.addEventListener('touchend', lookEnd, {passive:false});
lookEl.addEventListener('touchcancel', lookEnd, {passive:false});

// 暂停 / 分享 按钮
function togglePause(){
  if(matchOver) return;
  paused=!paused;
  if(paused){ el('pause').classList.remove('hide');
    if(document.pointerLockElement===cv) document.exitPointerLock(); }
  else { el('pause').classList.add('hide'); if(!isPhone) cv.requestPointerLock(); }
}
function shareGame(){
  const url=location.href;
  if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(url).then(()=>toast('已复制分享链接'),()=>toast('复制失败：'+url)); }
  else toast('链接：'+url);
}
el('pauseBtn').addEventListener('click', togglePause);
el('shareBtn').addEventListener('click', shareGame);
el('resumeBtn').addEventListener('click', togglePause);
el('shareBtn2').addEventListener('click', shareGame);
el('againBtn').addEventListener('click', resetMatch);
// DEBUG 沙盒按钮（手机端用按钮代替键盘；桌面也可点）
[['dbgSpawnRed',()=>debugSpawn('red')],['dbgSpawnBlue',()=>debugSpawn('blue')],
 ['dbgDownRed',()=>debugDown('red')],['dbgDownBlue',()=>debugDown('blue')],
 ['dbgGod',debugGod],['dbgMed',debugMedkitFront],['dbgWin',debugWin],['dbgLose',debugLose],
 ['dbgExit',debugExit]].forEach(([id,fn])=>{ const b=el(id); if(b) b.addEventListener('click', e=>{ e.preventDefault(); if(!debugMode) return; fn(); }); });

/* ============================================================
   11. 开始 / 主循环
   ============================================================ */
function startGame(){
  if(typeof THREE==='undefined'){ toast('引擎未加载，请检查网络后刷新'); return; }
  initAudio(); if(actx&&actx.state==='suspended')actx.resume();
  el('overlay').classList.add('hide'); running=true;
  if(!isPhone) cv.requestPointerLock(); else toast('左摇杆移动 · 右侧开枪/换弹/换枪');
  if(imagod) toast('外挂全开：无敌+无限子弹+飞天');
  updateHUD();
}
el('overlay').addEventListener('click', startGame);

// 灵敏度旋钮
const sensInput=el('sens'), sensVal=el('sensVal');
function applySens(){ const mul=parseFloat(sensInput.value); sensitivity=0.001*mul; sensVal.textContent=mul.toFixed(1); }
sensInput.addEventListener('input', applySens); applySens();

window.addEventListener('resize', ()=>{
  camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(Math.floor(window.innerWidth*RES_SCALE),Math.floor(window.innerHeight*RES_SCALE),false);
});

const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  let dt=clock.getDelta(); if(dt>0.05)dt=0.05;
  if(running&&!paused){
    updatePlayer(dt);
    for(const c of characters) if(!c.isPlayer) updateBot(c,dt);
    for(let i=grenades.length-1;i>=0;i--){ const g=grenades[i]; g.vel.y-=14*dt; g.pos.addScaledVector(g.vel,dt);
      if(g.pos.y<0.3){ g.pos.y=0.3; g.vel.y*=-0.42; g.vel.x*=0.6; g.vel.z*=0.6; if(Math.abs(g.vel.y)<1)g.vel.y=0; }
      g.mesh.position.copy(g.pos); g.fuse-=dt;
      if(g.fuse<=0){ explode(g.pos,g.owner); scene.remove(g.mesh); grenades.splice(i,1); } }
    // 医疗箱拾取与刷新
    for(const mk of medkits){
      if(mk.cd>0){ mk.cd-=dt; if(mk.cd<=0){ mk.active=true; mk.group.visible=true; } continue; }
      for(const c of characters){ if(!c.alive||c.downed)continue;
        if(c.group.position.distanceTo(mk.pos)<MEDKIT_RADIUS){
          const heal=Math.min(MEDKIT_HEAL,100-c.hp);
          if(heal>0){ c.hp+=heal; mk.active=false; mk.group.visible=false; mk.cd=MEDKIT_CD;
            if(c.isPlayer){ toast('拾取医疗箱 +'+Math.round(heal)+' 血'); updateHUD(); } }
          break; } }
    }
    updateHUD();
  }
  renderer.render(scene,camera);
}
camera.position.set(player.group.position.x, EYE, player.group.position.z);
animate();
updateHUD();
