"use strict";
/* ============================================================
   CS · CS.js — 游戏主逻辑（场景 / 角色 / 控制 / 主循环 / 彩蛋）
   资源与模块：
     assets/screen/*.svg     方块纹理（着色器渲染）
     assets/sound/*.wav      音效
     assets/Shader/Shader.js 着色器材质
     assets/code/*.js        各功能模块
   ============================================================ */

/* ---------- 0. 全局配置 & 秘籍参数 ---------- */
const MAP = 60, HALF = MAP/2;
let RES_SCALE = 0.5;
const EYE = 1.6;
const JUMP_V = 7, GRAVITY = 22;   // 跳跃初速 / 重力加速度（蹲跳系统）
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

// 全局游戏状态
let running = false;        // 游戏进行中
let revivingNow = false;    // 玩家正在救人（此时不能开枪）
let sceneReady = false;     // 场景资源（SVG 纹理）加载完成
let blueScore=0, redScore=0, matchOver=false;
const keys = {};

// 公共 DOM 简写（供所有模块使用）
function el(id){ return document.getElementById(id); }

/* ---------- 1. 场景 / 相机 / 渲染器 ---------- */
const container = document.getElementById('game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fb8d8);
scene.fog = new THREE.Fog(0x9fb8d8, 30, 70);
const camera = new THREE.PerspectiveCamera(78, window.innerWidth/window.innerHeight, 0.1, 200);
camera.rotation.order = 'YXZ';
const renderer = new THREE.WebGLRenderer({antialias:false});
renderer.setClearColor(0x9ec8e8); // 天空蓝背景（避免围墙背面剔除后露出纯黑）
renderer.setClearColor(0x9fc5e8, 1.0);  // 天空浅蓝（围墙背面被剔除时背景不会黑）
renderer.setPixelRatio(1);
renderer.setSize(Math.floor(window.innerWidth*RES_SCALE), Math.floor(window.innerHeight*RES_SCALE), false);
container.appendChild(renderer.domElement);
scene.add(new THREE.AmbientLight(0xffffff, 0.85));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.6); dirLight.position.set(20,40,10); scene.add(dirLight);
const cv = renderer.domElement;

/* ---------- 2. 方块纹理（加载 assets/screen 下的 SVG，着色器渲染） ---------- */
function makeSVGTexture(t){
  t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestFilter;
  t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;
}
function loadTex(url){ return new Promise((res,rej)=>{
  // 手动加载纹理：绕开 TextureLoader 的 CORS 请求 + 服务器非法 MIME(image/svg)问题
  // 本地 python http.server 在 Windows 下把 .svg 返回为 image/svg，Chrome 拒绝解码 → 纹理全挂
  const build = img => {
    const tex = new THREE.Texture(img);
    tex.needsUpdate = true;
    res(makeSVGTexture(tex));
  };
  // 方案1：fetch → 重制 Blob(type=image/svg+xml) → objectURL（http/https 通用，无视服务器 MIME）
  fetch(url).then(r=>r.text()).then(txt=>{
    const obj = URL.createObjectURL(new Blob([txt],{type:'image/svg+xml'}));
    const img = new Image();
    img.onload  = ()=>{ URL.revokeObjectURL(obj); build(img); };
    img.onerror = ()=>{ URL.revokeObjectURL(obj); rej(new Error('decode fail: '+url)); };
    img.src = obj;
  }).catch(()=>{
    // 方案2（file:// 等无 fetch 环境）：原生 img 直载（Chrome 按扩展名识别 svg）
    const img = new Image();
    img.onload  = ()=>build(img);
    img.onerror = ()=>rej(new Error('img fail: '+url));
    img.src = url;
  });
}); }

/* ---------- 3. 角色系统（共享材质 & 网格构造） ---------- */
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
const characters=[], hitMeshes=[], grenades=[], medkits=[];
const MEDKIT_HEAL = 60, MEDKIT_RADIUS = 1.6, MEDKIT_CD = 12;
const REVIVE_TIME = 3.2, REVIVE_RANGE = 3.2;

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
    downed:false,downedT:0,reviveProg:0,reviveT:0,jumpQueued:false,vy:0,jumpY:0,grounded:true};
  ch.reviveBar=makeReviveSprite(); scene.add(ch.reviveBar);
  m.body.userData.char=ch; m.head.userData.char=ch;
  characters.push(ch); hitMeshes.push(m.body,m.head); return ch;
}
function placeAtSpawn(ch){
  const s=ch.team==='blue'?SPAWN.ally:SPAWN.enemy;
  ch.group.position.set((Math.random()-0.5)*2*s.xr,0,s.z+(Math.random()-0.5)*6);
  ch.group.rotation.y=ch.yaw; ch.group.rotation.x=0; ch.group.position.y=0;
}

/* ---------- 3b. 医疗箱 ---------- */
function makeMedkit(x,z){
  const g=new THREE.Group();
  const box=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.9,0.9),MAT.medBox);
  box.position.y=0.8;
  const cr1=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.26,0.26),MAT.cross); cr1.position.y=0.8;
  const cr2=new THREE.Mesh(new THREE.BoxGeometry(0.26,0.9,0.26),MAT.cross); cr2.position.y=0.8;
  g.add(box,cr1,cr2); g.position.set(x,0,z); scene.add(g);
  medkits.push({group:g,pos:new THREE.Vector3(x,0,z),active:true,cd:0});
}

/* ---------- 4. 伤害 / 击倒 / 救援 / 胜负 ---------- */
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

/* ---------- 5. 玩家控制（含飞天 / 倒地爬行 / 救人） ---------- */
const joy={active:false,id:null,baseX:0,baseY:0,x:0,y:0};
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
  // 蹲跳系统：跳跃物理 + 蹲下
  if(player.jumpQueued && player.grounded){ player.vy=JUMP_V; player.grounded=false; }
  player.jumpQueued=false;
  if(!player.grounded){ player.jumpY+=player.vy*dt; player.vy-=GRAVITY*dt; if(player.jumpY<=0){ player.jumpY=0; player.vy=0; player.grounded=true; } }
  const crouching = (!isPhone && keys['c']) || (isPhone && touchCrouch);
  // 飞天
  if(flyEnabled){ if(keys['=']||flyUp)player.flyY+=7*dt; if(keys['-']||flyDown)player.flyY-=7*dt; player.flyY=Math.max(-1,Math.min(45,player.flyY)); }
  let fx=0,fz=0;
  if(!isPhone){ fx=(keys['w']?1:0)-(keys['s']?1:0); fz=(keys['d']?1:0)-(keys['a']?1:0); }
  else { fx=-joy.y; fz=joy.x; }
  const sin=Math.sin(player.yaw),cos=Math.cos(player.yaw);
  const fwdX=-sin,fwdZ=-cos, rgtX=cos,rgtZ=-sin;
  let vx=fwdX*fx+rgtX*fz, vz=fwdZ*fx+rgtZ*fz; const len=Math.hypot(vx,vz); if(len>0){vx/=len;vz/=len;}
  const sp=crouching?3.5:7; player.group.position.x+=vx*sp*dt; player.group.position.z+=vz*sp*dt;
  resolveCollision(player.group.position);
  player.group.position.y=player.flyY;   // 隐身，高度由 flyY 决定
  camera.position.set(player.group.position.x, EYE+player.flyY+player.jumpY-(crouching?0.7:0), player.group.position.z);
  player.recoil*=0.85; camera.rotation.y=player.yaw; camera.rotation.x=player.pitch+player.recoil;
  if(firing&&curWeapon==='ak'&&!revivingNow) playerFire();
}

/* ---------- 6. 场景构建（纹理加载完成后执行，着色器材质渲染地图） ---------- */
let player=null, playerTeam='blue';
const pillars=[];

function initScene(texMid, texAlly, texEnemy, texWall, texPIce, texPStone, texPRed){
  // 着色器选择：webgl = 自定义 GLSL 程序化光（现状）；three = three.js 标准 PBR 材质（场景灯出立体感）
  function csMat(tex, tint, cells){
    if(SHADER_MODE==='three'){
      return new THREE.MeshStandardMaterial({ map:tex, color:0xffffff, roughness:0.9, metalness:0.0, side:THREE.DoubleSide });
    }
    return (typeof cells==='number') ? makeMosaicMaterial(tex,tint,cells) : makeSmoothMaterial(tex,tint);
  }
  // 地图（地面用马赛克着色器，墙/柱用平滑材质保留贴图细节）
  function addGround(z,len,tex,tint){ tex.repeat.set(6,2);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(MAP,len), csMat(tex,tint,8));
    m.rotation.x=-Math.PI/2; m.position.set(0,0,z); scene.add(m);
  }
  addGround(-20,20,texEnemy,0xd8c0c0); addGround(0,20,texMid,0xffffff); addGround(20,20,texAlly,0xc0d0ff);
  const wallMat=csMat(texWall,0xcfe0f5);
  function addWall(x,z,w,d){const m=new THREE.Mesh(new THREE.BoxGeometry(w,3,d),wallMat);m.position.set(x,1.5,z);scene.add(m);}
  addWall(0,-HALF,MAP,1);addWall(0,HALF,MAP,1);addWall(-HALF,0,1,MAP);addWall(HALF,0,1,MAP);
  const pillarPos=[[-28,-28],[0,-28],[28,-28],[-28,0],[28,0],[-28,28],[0,28],[28,28],
    [-15,-10],[0,-10],[15,-10],[-15,10],[0,10],[15,10],[-10,0],[10,0]];
  const pillarMats=[
    csMat(texPIce,0xd8ecff),
    csMat(texPStone,0xb8cfe0),
    csMat(texPRed,0xd07070)
  ];
  for(const [i,[x,z]] of pillarPos.entries()){
    const m=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,6,16),pillarMats[i%3]);
    m.position.set(x,3,z);scene.add(m);pillars.push({x,z,r:1.7});
  }

  // 角色
  playerTeam = spy ? 'red' : 'blue';
  player = spawnCharacter(playerTeam,true);
  const blueAI = pvp ? 0 : 4;     // 1v5 模式无队友
  const redAI  = tryMode ? 1 : 5; // 5v1 模式敌仅1
  for(let i=0;i<blueAI;i++) spawnCharacter('blue',false);
  for(let i=0;i<redAI;i++) spawnCharacter('red',false);
  characters.forEach(placeAtSpawn);

  // 医疗箱
  [[-18,-18],[18,-18],[-18,18],[18,18],[0,0]].forEach(p=>makeMedkit(p[0],p[1]));

  // 玩家：隐身（只剩摄像机在打）+ 应用 hospital 血量
  player.group.visible=false;
  if(hospitalVal>0) player.hp=hospitalVal;

  // 相机初始位置 + 标记就绪
  camera.position.set(player.group.position.x, EYE, player.group.position.z);
  sceneReady = true;
  updateHUD();
}

// 渲染模式：js = Canvas 实时纹理(清晰)，svg = SVG 贴图(轻量)。暂停界面可切换，存 localStorage
const TEX_MODE = localStorage.getItem('csTexMode') === 'svg' ? 'svg' : 'js';
// 着色器选择：webgl = 自定义 GLSL 程序化光（现状）；three = three.js 标准 PBR 材质（场景灯出立体感）
const SHADER_MODE = localStorage.getItem('csShaderMode') === 'three' ? 'three' : 'webgl';

// svg 模式：异步加载 7 张 SVG 纹理 → 构建场景
function loadSVGTextures(){
  return Promise.all([
    loadTex('assets/screen/mid.svg'),
    loadTex('assets/screen/ally.svg'),
    loadTex('assets/screen/enemy.svg'),
    loadTex('assets/screen/wall_ice.svg'),
    loadTex('assets/screen/pillar_ice.svg'),
    loadTex('assets/screen/pillar_stone.svg'),
    loadTex('assets/screen/pillar_red.svg')
  ]);
}

function bootScene(){
  if(TEX_MODE === 'js' && typeof CSGenTex === 'function'){
    // js 实时渲染：Canvas 同步生成，立即就绪
    try{
      initScene.apply(null, CSGenTex());
      return;
    }catch(e){ console.error('[CS] Canvas 纹理生成失败，回退 svg', e); }
  }
  loadSVGTextures().then(([tm,ta,te,tw,tpi,tps,tpr])=>{
    initScene(tm,ta,te,tw,tpi,tps,tpr);
  }).catch(()=>{
  console.error('[CS] SVG 纹理加载失败');
  if(el('toast')){ el('toast').textContent='纹理加载失败，请刷新重试'; el('toast').style.opacity=1; }
});
}
bootScene();

/* ---------- 7. 修改器菜单（点击「5v5」5 下开启） ---------- */
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
const _eggEl = el('egg5v5');
if(_eggEl){
  _eggEl.addEventListener('click', e=>{
    e.stopPropagation();           // 别误触「点击开始」
    _eggClicks++;
    if(_eggClicks >= 5){ _eggClicks = 0; openTrainer(); }
    else toast('修改器解锁进度 '+_eggClicks+'/5 ✦');
  });
}

/* ---------- 8. DEBUG 沙盒（空地图 + 手动单位 + 触发胜负） ---------- */
// 「.」彩蛋：连点 10 下进入 DEBUG 沙盒（空地图）
let _dotClicks = 0;
const _dotEl = el('eggDot');
if(_dotEl){
  _dotEl.addEventListener('click', e=>{
    e.stopPropagation();
    _dotClicks++;
    if(_dotClicks >= 10){ _dotClicks = 0; enterDebug(); }
    else toast('DEBUG 解锁进度 '+_dotClicks+'/10 ✦');
  });
}

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

/* ---------- 9. 桌面输入（键盘 / 鼠标） ---------- */
document.addEventListener('keydown', e=>{
  const k=e.key.toLowerCase(); keys[k]=true;
  if(k==='escape'){ togglePause(); return; }
  if(k==='`'){ togglePause(); return; }   // 与 Esc 同：对局中按一次进设置(解鼠标)，再按返回对局
  if(k===' '||e.code==='Space'){ e.preventDefault(); if(player&&player.grounded&&running&&!paused) player.jumpQueued=true; return; }
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
  if(player&&player.downed) return;          // 倒地时禁用换弹/换枪/核弹
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
  // 指针锁丢失（主动 Esc/` 或意外切窗）：若在对局中，自动进暂停设置菜单，绝不弹回开始界面
  if(document.pointerLockElement!==cv && running && !paused){
    paused=true; el('pause').classList.remove('hide');
  }
});

// 间谍模式：替换开始界面文案（another.js 已注入 UI）
if(spy){ const _p=document.querySelector('#overlay p'); if(_p){ _p.innerHTML=_p.innerHTML
  .replace('蓝队</b>（我方）','红队</b>（我方·间谍）')
  .replace('红队</b> AI','蓝队</b> AI'); } }

/* ---------- 10. 开始 / 主循环 ---------- */
function startGame(){
  if(typeof THREE==='undefined'){ toast('引擎未加载，请检查网络后刷新'); return; }
  if(!sceneReady){ toast('资源加载中…'); return; }
  initAudio();    // 用户手势：预加载 assets/sound 音效
  el('overlay').classList.add('hide'); running=true;
  if(!isPhone) cv.requestPointerLock(); else toast('左摇杆移动 · 右侧开枪/换弹/换枪');
  if(imagod) toast('外挂全开：无敌+无限子弹+飞天');
  updateHUD();
}
el('overlay').addEventListener('click', startGame);

window.addEventListener('resize', ()=>{
  camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(Math.floor(window.innerWidth*RES_SCALE),Math.floor(window.innerHeight*RES_SCALE),false);
});

const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  let dt=clock.getDelta(); if(dt>0.05)dt=0.05;
  if(sceneReady && running && !paused){
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
animate();

// DEBUG 沙盒按钮（手机端用按钮代替键盘；桌面也可点）
[['dbgSpawnRed',()=>debugSpawn('red')],['dbgSpawnBlue',()=>debugSpawn('blue')],
 ['dbgDownRed',()=>debugDown('red')],['dbgDownBlue',()=>debugDown('blue')],
 ['dbgGod',debugGod],['dbgMed',debugMedkitFront],['dbgWin',debugWin],['dbgLose',debugLose],
 ['dbgExit',debugExit]].forEach(([id,fn])=>{ const b=el(id); if(b) b.addEventListener('click', e=>{ e.preventDefault(); if(!debugMode) return; fn(); }); });
