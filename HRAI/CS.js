"use strict";
/* ============================================================
   HRAI · CS.js — 游戏主逻辑（Horror AI 恐怖逃生版）
   ------------------------------------------------------------
   玩法：黑暗竞技场里收集 20 把钥匙 → 合成台合成大钥匙 →
        穿过敌区后方的大门逃出生天。
   「它」：1 个追猎者，持小刀（伤害 200，一刀秒杀）。
   已移除：枪械系统 / 瞄准镜 / 准星 / 下包 / 回合制 / 无人机 /
           核弹 / 排行榜 / 队友 / 救援 / 医疗箱。
   暗化：低亮度着色器 + 浓雾（能见 ~40m）+ CSS 亮度滤镜。
   ============================================================ */

/* ---------- 0. 全局配置 ---------- */
const MAP = 200, HALF = MAP/2;
let RES_SCALE = 0.5;
const EYE = 1.6;
const JUMP_V = 7, GRAVITY = 22;   // 跳跃初速 / 重力加速度
const SPAWN = { enemy:{z:-40,xr:26}, ally:{z:40,xr:26} };

const params = new URLSearchParams(location.search);
{ const _lp=params.get('low'), _hp=params.get('high');
  if(_hp==='1') RES_SCALE=0.75; else if(_lp==='1') RES_SCALE=0.45;
  else if((navigator.hardwareConcurrency||4)<=2 || (navigator.deviceMemory||8)<=2) RES_SCALE=0.5; }

// —— 暗化 / 渲染长度（明亮度已按用户反馈上调） ——
const FOG_COLOR = 0x1c242e;      // 暗蓝灰（近景可辨，远景隐入黑暗）
const FOG_NEAR  = 10, FOG_FAR  = 42;   // 浓雾：10m 内清晰，42m 全黑
const CAM_FAR   = 45;            // 渲染距离压短
const AMBIENT   = 0.55, DIR_LIGHT = 0.40;

// —— 钥匙盒系统 ——
const TOTAL_KEYS = 20, KEY_RADIUS = 2.2;   // 收集等待时间按剩余数量递减（见 keyWaitTime）
const RUSH_LEFT  = 3,  RUSH_MUL  = 1.6;    // 剩 ≤3 把 → 「它」加速
// 收集难度分级：开局白给 → 剩15把等2s → 剩5把等10s → 最后1把等30s
// 拿到撬棍后：等待时间 ×0.8（开启速度 +20%）
function keyWaitTime(){
  const remaining = TOTAL_KEYS - keysCollected;
  let wt;
  if(remaining > 15) return 0;    // 前 5 把：直接收集
  if(remaining > 5)  wt = 2;      // 剩 15~6 把：等 2 秒
  else if(remaining > 1) wt = 10; // 剩 5~2 把：等 10 秒
  else wt = 30;                   // 最后 1 把：等 30 秒
  return crowbar ? wt * 0.8 : wt; // 撬棍加速 20%
}
// —— 合成台 ——
const CRAFT_TIME = 2,  CRAFT_RANGE = 3.0;
// —— 大门（敌区后方，北墙中段门洞） ——
const GATE_HALF = 2.3;           // 门洞半宽
const ESC_Z     = -52;           // 走到这以北 = 逃出

let keysCollected = 0, bigKey = false, gateOpen = false, rush = false;
let craftProgress = 0, roundNum = 1;
let crowbar = false, crowbarMesh = null;   // 撬棍：拾取后开启钥匙盒速度 +20%

// 全局游戏状态
let running = false, sceneReady = false, matchOver = false, debugMode = false;
const keys = {};
const joy = {active:false,id:null,baseX:0,baseY:0,x:0,y:0};

function el(id){ return document.getElementById(id); }

/* ---------- 1. 场景 / 相机 / 渲染器（暗色） ---------- */
const container = document.getElementById('game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(FOG_COLOR);
scene.fog = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR);
const camera = new THREE.PerspectiveCamera(78, window.innerWidth/window.innerHeight, 0.1, CAM_FAR);
camera.rotation.order = 'YXZ';
const renderer = new THREE.WebGLRenderer({antialias:false});
renderer.setClearColor(FOG_COLOR, 1.0);
renderer.setPixelRatio(1);
renderer.setSize(Math.floor(window.innerWidth*RES_SCALE), Math.floor(window.innerHeight*RES_SCALE), false);
container.appendChild(renderer.domElement);
scene.add(new THREE.AmbientLight(0xffffff, AMBIENT));
const dirLight = new THREE.DirectionalLight(0xffffff, DIR_LIGHT); dirLight.position.set(20,40,10); scene.add(dirLight);
const cv = renderer.domElement;

/* ---------- 2. 方块纹理（加载 assets/screen 下的 SVG，着色器渲染） ---------- */
function makeSVGTexture(t){
  t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestFilter;
  t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;
}
function loadTex(url){ return new Promise((res,rej)=>{
  const build = img => {
    const tex = new THREE.Texture(img);
    tex.needsUpdate = true;
    res(makeSVGTexture(tex));
  };
  fetch(url).then(r=>r.text()).then(txt=>{
    const obj = URL.createObjectURL(new Blob([txt],{type:'image/svg+xml'}));
    const img = new Image();
    img.onload  = ()=>{ URL.revokeObjectURL(obj); build(img); };
    img.onerror = ()=>{ URL.revokeObjectURL(obj); rej(new Error('decode fail: '+url)); };
    img.src = obj;
  }).catch(()=>{
    const img = new Image();
    img.onload  = ()=>build(img);
    img.onerror = ()=>rej(new Error('img fail: '+url));
    img.src = url;
  });
}); }

/* ---------- 3. 角色系统（恐怖版：无枪，敌人持小刀） ---------- */
const MAT = {
  red:      new THREE.MeshLambertMaterial({color:0x8a2222}),  // 「它」暗红（提亮便于雾中辨认）
  head:     new THREE.MeshLambertMaterial({color:0xd8c0a8}),
  knife:    new THREE.MeshLambertMaterial({color:0xe0e6ec}),  // 刀刃
  keybox:   new THREE.MeshLambertMaterial({color:0xa07a2a}),
  gold:     new THREE.MeshLambertMaterial({color:0xffd86a}),
  gate:     new THREE.MeshBasicMaterial({color:0x992222}),    // 大门（自发光，红=锁 绿=开）
  craft:    new THREE.MeshLambertMaterial({color:0x3a4a5c}),
  craftGlow:new THREE.MeshBasicMaterial({color:0x2a6a9a}),
  crowbar:  new THREE.MeshLambertMaterial({color:0xb0a48c}),  // 撬棍（铁锈金属）
};
const characters=[], keyboxes=[];
let player=null, playerTeam='blue';
const pillars=[], walls=[], buildings=[];
let craftPos=null, gateMesh=null;

function makeCharMesh(team){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(0.8,1.0,0.5), team==='blue'?MAT.red:MAT.red); body.position.y=1.0;
  const head=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.5),MAT.head); head.position.y=1.8;
  const tag=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.16,0.7), MAT.red); tag.position.y=2.2;
  // 小刀：身前细长刀身，代表「它」的凶器
  const knife=new THREE.Mesh(new THREE.BoxGeometry(1.0,0.06,0.06),MAT.knife);
  knife.position.set(0,1.05,0.85); knife.userData.isGun=true;
  g.add(body,head,tag,knife); return {group:g,body,head,gun:knife};
}
function makeNameSprite(text, team){
  const c=document.createElement('canvas'); c.width=256; c.height=64;
  const ctx=c.getContext('2d');
  ctx.font='bold 40px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.lineWidth=6; ctx.strokeStyle='rgba(0,0,0,0.9)'; ctx.strokeText(text,128,34);
  ctx.fillStyle = team==='red' ? '#ff4040' : '#7fd0ff';
  ctx.fillText(text,128,34);
  const tex=new THREE.CanvasTexture(c);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
  sp.scale.set(2.2,0.55,1); sp.visible=true; return sp;
}
function spawnCharacter(team,isPlayer){
  const m=makeCharMesh(team); scene.add(m.group);
  const ch={team,isPlayer,alive:true,hp:100,respawn:0,group:m.group,meshes:[m.body,m.head],
    yaw:team==='blue'?Math.PI:0,pitch:0,recoil:0,flyY:0,
    aiState:'chase',aiTarget:null,aiTimer:0,moveTarget:null,
    jumpQueued:false,vy:0,jumpY:0,grounded:true,
    name:isPlayer?'你':'它'};
  m.body.userData.char=ch; m.head.userData.char=ch;
  ch.nameTag=makeNameSprite(ch.name, team); scene.add(ch.nameTag);
  characters.push(ch); return ch;
}
function placeAtSpawn(ch){
  const s=ch.team==='blue'?SPAWN.ally:SPAWN.enemy;
  ch.group.position.set((Math.random()-0.5)*2*s.xr,0,s.z+(Math.random()-0.5)*6);
  ch.group.rotation.y=ch.yaw; ch.group.rotation.x=0; ch.group.position.y=0;
}
function respawnChar(ch){
  ch.alive=true; ch.hp=100; ch.flyY=0;
  ch.group.rotation.x=0; ch.group.position.y=0;
  ch.group.visible=!ch.isPlayer;
  placeAtSpawn(ch); if(ch.isPlayer)updateHUD();
}

/* ---------- 3b. 钥匙盒（20 个随机位置，30 秒开启，进度保留） ---------- */
function makeKeySprite(){
  const c=document.createElement('canvas'); c.width=64; c.height=10;
  const ctx=c.getContext('2d');
  ctx.fillStyle='rgba(10,10,5,0.8)'; ctx.fillRect(0,0,64,10);
  ctx.fillStyle='#ffd86a'; ctx.fillRect(2,2,60,6);
  const tex=new THREE.CanvasTexture(c);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
  sp.scale.set(1.6,0.25,1); sp.visible=false; return sp;
}
function makeKeybox(x,z){
  const g=new THREE.Group();
  const box=new THREE.Mesh(new THREE.BoxGeometry(0.75,0.75,0.75),MAT.keybox); box.position.y=0.55;
  const ring=new THREE.Mesh(new THREE.TorusGeometry(0.17,0.055,8,14),MAT.gold); ring.position.set(0,0.55,0.42); ring.rotation.x=Math.PI/2;
  g.add(box,ring);
  g.position.set(x,0,z); scene.add(g);
  const sp=makeKeySprite(); scene.add(sp);
  const kb={group:g,pos:new THREE.Vector3(x,0,z),progress:0,done:false,sprite:sp};
  keyboxes.push(kb); return kb;
}
function clearKeyboxes(){
  for(const kb of keyboxes){ scene.remove(kb.group); scene.remove(kb.sprite); }
  keyboxes.length=0;
}
function placeKeyboxes(){
  const spots=[];
  let guard=0;
  while(spots.length<TOTAL_KEYS && guard++<8000){
    const x=(Math.random()-0.5)*84, z=(Math.random()-0.5)*84;
    let ok=true;
    for(const p of pillars){ if(Math.hypot(x-p.x,z-p.z)<3){ok=false;break;} }
    if(!ok) continue;
    for(const b of buildings){
      if(Math.abs(x-b.x)<b.w/2+1.2 && Math.abs(z-b.z)<b.d/2+1.2){ok=false;break;}
    }
    if(!ok) continue;
    if(Math.hypot(x-0,z-40)<8){ok=false;continue;}   // 玩家出生区
    if(Math.hypot(x-0,z+40)<8){ok=false;continue;}   // 敌出生区
    let far=true;
    for(const s of spots){ if(Math.hypot(x-s[0],z-s[1])<6.5){far=false;break;} }
    if(!far) continue;
    spots.push([x,z]);
  }
  for(const s of spots) makeKeybox(s[0],s[1]);
}
function resetRunState(){
  keysCollected=0; bigKey=false; gateOpen=false; rush=false; craftProgress=0;
  crowbar=false;
  clearKeyboxes(); placeKeyboxes();
  makeCrowbar(25,-2);                          // 撬棍刷回 B 点房间
  if(gateMesh){ gateMesh.visible=true; gateMesh.material.color.setHex(0x992222); }
  updateHUD();
}

/* ---------- 3c. 合成台（B 点房间 = 右侧房屋内） ---------- */
function makeTextSprite(txt, color){
  const c=document.createElement('canvas'); c.width=256; c.height=64;
  const ctx=c.getContext('2d');
  ctx.font='bold 34px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.lineWidth=5; ctx.strokeStyle='rgba(0,0,0,0.85)'; ctx.strokeText(txt,128,34);
  ctx.fillStyle=color; ctx.fillText(txt,128,34);
  const tex=new THREE.CanvasTexture(c);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
  sp.scale.set(3.2,0.8,1); return sp;
}
function makeCraftTable(x,z){
  const g=new THREE.Group();
  const table=new THREE.Mesh(new THREE.BoxGeometry(2.4,1.0,1.4),MAT.craft); table.position.y=0.5;
  const glow=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.14,1.0),MAT.craftGlow); glow.position.y=1.05;
  g.add(table,glow);
  g.position.set(x,0,z); scene.add(g);
  craftPos=new THREE.Vector3(x,0,z);
  const lbl=makeTextSprite('合成台', '#7fd0ff'); lbl.position.set(x,3.4,z); scene.add(lbl);
}

/* ---------- 3c2. 撬棍（B 点房间内，拾取后开锁 +20%） ---------- */
function makeCrowbar(x,z){
  if(crowbarMesh){ scene.remove(crowbarMesh); crowbarMesh=null; }
  const g=new THREE.Group();
  const bar=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.12,1.6),MAT.crowbar); bar.position.y=0.28;
  const hook=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.14,0.3),MAT.crowbar); hook.position.set(0,0.28,-0.9);
  const grip=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.16,0.4),MAT.crowbar); grip.position.set(0,0.28,0.75);
  g.add(bar,hook,grip);
  g.position.set(x,0,z); scene.add(g);
  crowbarMesh=g;
  const lbl=makeTextSprite('撬棍', '#ffd86a'); lbl.position.set(x,1.4,z); scene.add(lbl);
}

/* ---------- 3d. 大门（敌区后方 = 北墙中段门洞） ---------- */
function makeGate(){
  // 门板：自发光红（锁）→ 绿（开）
  gateMesh=new THREE.Mesh(new THREE.BoxGeometry(GATE_HALF*2+0.9, 5.2, 0.5), MAT.gate);
  gateMesh.position.set(0, 2.6, -49); scene.add(gateMesh);
  // 门框柱
  const postMat=new THREE.MeshLambertMaterial({color:0x2a2a34});
  const p1=new THREE.Mesh(new THREE.BoxGeometry(0.6,5.4,0.6),postMat); p1.position.set(-(GATE_HALF+0.75),2.7,-49);
  const p2=p1.clone(); p2.position.x=(GATE_HALF+0.75);
  scene.add(p1,p2);
  // 逃生通道地板（门后）
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(GATE_HALF*2+3,7), new THREE.MeshLambertMaterial({color:0x14141c}));
  floor.rotation.x=-Math.PI/2; floor.position.set(0,0,-53); scene.add(floor);
  // 「出口」指示
  const lbl=makeTextSprite('⬆ 出口', '#ff5a5a'); lbl.position.set(0,3.0,-53); scene.add(lbl);
}

/* ---------- 4. 伤害 / 死亡 / 胜负 ---------- */
function damage(ch, amt, attacker){
  if(!ch.alive||matchOver) return;
  ch.hp-=amt;
  if(ch.hp<=0){ ch.alive=false; if(ch.isPlayer){ matchLose(); } }
  else if(ch.isPlayer) updateHUD();
}
function matchLose(){
  if(matchOver) return;
  matchOver=true; running=false;
  player.alive=false;
  el('victoryTitle').textContent='💀 你被「它」终结了…';
  el('victorySub').textContent='小刀划过的瞬间，世界陷入黑暗。再来一局？';
  el('victory').classList.remove('hide');
  if(document.pointerLockElement===cv) document.exitPointerLock();
}
function matchWin(){
  if(matchOver) return;
  matchOver=true; running=false;
  el('victoryTitle').textContent='🎉 逃出生天！';
  el('victorySub').textContent='你带着大钥匙穿过大门，把「它」永远甩在了雾里';
  el('victory').classList.remove('hide');
  if(document.pointerLockElement===cv) document.exitPointerLock();
}
function resetMatch(){
  if(debugMode){ enterDebug(); return; }
  roundNum++;
  matchOver=false; running=true;
  resetRunState();
  for(const c of characters) respawnChar(c);
  el('victory').classList.add('hide');
  updateHUD();
  if(!isPhone) cv.requestPointerLock();
  toast('第 '+roundNum+' 局 · 收集 20 把钥匙，合成大钥匙，逃出大门！');
}
function resolveCollision(pos){
  pos.x=Math.max(-HALF+1.5,Math.min(HALF-1.5,pos.x));
  if(gateOpen){
    pos.z=Math.max(-56,Math.min(HALF-1.5,pos.z));
    if(pos.z<-HALF+1.5) pos.x=Math.max(-(GATE_HALF-0.35),Math.min(GATE_HALF-0.35,pos.x));  // 门外只能走门洞
  } else {
    pos.z=Math.max(-HALF+1.5,Math.min(HALF-1.5,pos.z));
  }
  for(const p of pillars){const dx=pos.x-p.x,dz=pos.z-p.z,d=Math.hypot(dx,dz);
    if(d<p.r&&d>0.0001){const push=p.r-d; pos.x+=dx/d*push; pos.z+=dz/d*push;}}
  for(const r of walls){
    const minx=r.x-r.w/2, maxx=r.x+r.w/2, minz=r.z-r.d/2, maxz=r.z+r.d/2;
    if(pos.x>minx&&pos.x<maxx&&pos.z>minz&&pos.z<maxz){
      const dl=pos.x-minx, dr=maxx-pos.x, dt=pos.z-minz, db=maxz-pos.z;
      const m=Math.min(dl,dr,dt,db);
      if(m===dl) pos.x=minx; else if(m===dr) pos.x=maxx; else if(m===dt) pos.z=minz; else pos.z=maxz;
    }
  }
}

/* ---------- 5. 玩家控制（无武器：只有移动 / 跳跃 / 蹲 + 交互） ---------- */
function updatePlayer(dt){
  if(!player.alive) return;
  // 跳跃物理
  if(player.jumpQueued && player.grounded){ player.vy=JUMP_V; player.grounded=false; }
  player.jumpQueued=false;
  if(!player.grounded){ player.jumpY+=player.vy*dt; player.vy-=GRAVITY*dt; if(player.jumpY<=0){ player.jumpY=0; player.vy=0; player.grounded=true; } }
  const crouching = (!isPhone && kdown('crouch')) || (isPhone && touchCrouch);
  let fx=0,fz=0;
  if(!isPhone){ fx=(kdown('forward')?1:0)-(kdown('back')?1:0); fz=(kdown('right')?1:0)-(kdown('left')?1:0); }
  else { fx=-joy.y; fz=joy.x; }
  const sin=Math.sin(player.yaw),cos=Math.cos(player.yaw);
  const fwdX=-sin,fwdZ=-cos, rgtX=cos,rgtZ=-sin;
  let vx=fwdX*fx+rgtX*fz, vz=fwdZ*fx+rgtZ*fz; const len=Math.hypot(vx,vz); if(len>0){vx/=len;vz/=len;}
  const sp=(crouching?3.5:7);
  player.group.position.x+=vx*sp*dt; player.group.position.z+=vz*sp*dt;
  resolveCollision(player.group.position);
  player.group.position.y=player.flyY;
  camera.position.set(player.group.position.x, EYE+player.flyY+player.jumpY-(crouching?0.7:0), player.group.position.z);
  camera.rotation.y=player.yaw; camera.rotation.x=player.pitch;

  // —— 交互 1：钥匙盒（30 秒开启，离开进度保留） ——
  let nearKey=null, kd=1e9;
  for(const kb of keyboxes){
    if(kb.done) continue;
    const d=player.group.position.distanceTo(kb.pos);
    if(d<kd){kd=d;nearKey=kb;}
  }
  const canKey = nearKey && kd<=KEY_RADIUS;
  const wantKey = isPhone ? (touchUse && canKey) : (kdown('use') && canKey);
  let interacting=false;
  if(wantKey){
    interacting=true;
    const wt = keyWaitTime();                 // 按剩余数量定等待时长
    if(wt<=0){ nearKey.progress = 1; }        // 开局白给：直接收集
    else { nearKey.progress=Math.min(1, nearKey.progress+dt/wt); }
    updateInter(true, wt>0 ? ('正在开启钥匙盒… '+Math.ceil((1-nearKey.progress)*wt)+'s') : '正在开启钥匙盒…', nearKey.progress);
    if(nearKey.progress>=1){
      nearKey.done=true; keysCollected++;
      scene.remove(nearKey.group); scene.remove(nearKey.sprite);   // 收集完成：删掉钥匙盒预制体
      updateInter(false);
      if(isPhone){ touchUse=false; if(typeof setUseUI==='function') setUseUI(); }
      if(keysCollected>=TOTAL_KEYS){
        toast('🎉 20 把钥匙集齐！去右侧房屋合成台合成大钥匙');
      } else {
        toast('🔑 获得钥匙 '+keysCollected+'/'+TOTAL_KEYS);
      }
      if(!rush && keysCollected>=TOTAL_KEYS-RUSH_LEFT){
        rush=true;
        toast('⚠️ 它感受到了威胁——速度变快了！！');
      }
      updateHUD();
    }
  } else {
    // —— 交互 2：合成台（B 点房间内，集齐钥匙后合成大钥匙） ——
    const craftable = keysCollected>=TOTAL_KEYS && !bigKey && craftPos && player.group.position.distanceTo(craftPos)<=CRAFT_RANGE;
    const wantCraft = isPhone ? (touchUse && craftable) : (kdown('use') && craftable);
    if(wantCraft){
      interacting=true;
      craftProgress=Math.min(CRAFT_TIME, craftProgress+dt);
      updateInter(true,'正在合成大钥匙… '+Math.ceil(CRAFT_TIME-craftProgress)+'s', craftProgress/CRAFT_TIME);
      if(craftProgress>=CRAFT_TIME){
        bigKey=true; craftProgress=0; gateOpen=true;
        if(isPhone){ touchUse=false; if(typeof setUseUI==='function') setUseUI(); }
        if(gateMesh){ gateMesh.material.color.setHex(0x33cc55); setTimeout(()=>{ if(gateMesh) gateMesh.visible=false; }, 900); }
        toast('🗝️ 大钥匙合成成功！大门已解锁——快逃！！');
        updateHUD();
      }
    } else {
      // —— 交互 3：撬棍（B 点房间内，拾取后开启钥匙盒 +20%） ——
      const crowbarNear = !crowbar && crowbarMesh && player.group.position.distanceTo(crowbarMesh.position)<=KEY_RADIUS;
      const wantCrow = isPhone ? (touchUse && crowbarNear) : (kdown('use') && crowbarNear);
      if(wantCrow){
        crowbar=true;
        scene.remove(crowbarMesh); crowbarMesh=null;
        if(isPhone){ touchUse=false; if(typeof setUseUI==='function') setUseUI(); }
        toast('🔧 拿到撬棍！开启钥匙盒速度 +20%');
        updateHUD();
      }
    }
  }
  if(!interacting) updateInter(false);
}

/* ---------- 6. 场景构建（暗色地图） ---------- */
function initScene(texMid, texAlly, texEnemy, texWall, texPIce, texPStone, texPRed){
  function csMat(tex, tint, cells){
    if(SHADER_MODE==='three'){
      return new THREE.MeshStandardMaterial({ map:tex, color:0x555566, roughness:0.95, metalness:0.0, side:THREE.DoubleSide });
    }
    return (typeof cells==='number') ? makeMosaicMaterial(tex,tint,cells) : makeSmoothMaterial(tex,tint);
  }
  function addGround(z,len,tex,tint){ tex.repeat.set(6,2);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(MAP,len), csMat(tex,tint,8));
    m.rotation.x=-Math.PI/2; m.position.set(0,0,z); scene.add(m);
  }
  addGround(-20,20,texEnemy,0x4e3c3c); addGround(0,20,texMid,0x3c4654); addGround(20,20,texAlly,0x3c4654);
  const wallMat=csMat(texWall,0x4e5e72);
  function addWall(x,z,w,d){const m=new THREE.Mesh(new THREE.BoxGeometry(w,3,d),wallMat);m.position.set(x,1.5,z);scene.add(m);}
  // 北墙中段开 4.6m 门洞（大门所在，敌区后方）
  addWall(-26,-HALF,48,1); addWall( 26,-HALF,48,1);
  addWall(0,HALF,MAP,1); addWall(-HALF,0,1,MAP); addWall(HALF,0,1,MAP);
  const pillarPos=[[-42,-42],[0,-42],[42,-42],[-42,0],[42,0],[-42,42],[0,42],[42,42],
    [-22,-22],[22,-22],[-22,22],[22,22],[-22,0],[22,0],[0,-22],[0,22],[-30,10],[30,-10]];
  const pillarMats=[
    csMat(texPIce,0x5e748c),
    csMat(texPStone,0x4e6072),
    csMat(texPRed,0x623a3a)
  ];
  for(const [i,[x,z]] of pillarPos.entries()){
    const m=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,6,16),pillarMats[i%3]);
    m.position.set(x,3,z);scene.add(m);pillars.push({x,z,r:1.7});
  }

  // 房屋（四面墙 + 南侧门洞），墙体加入碰撞与导航阻挡
  function addBuilding(bx,bz,w,d,withWindow){
    const t=1, h=3.4, hw=w/2, hd=d/2, door=3, halfDoor=door/2;
    const seg=(x,z,sw,sd)=>{
      const m=new THREE.Mesh(new THREE.BoxGeometry(sw,h,sd),wallMat); m.position.set(x,h/2,z); scene.add(m);
      walls.push({x,z,w:sw,d:sd});
    };
    seg(bx, bz+hd, w, t);
    seg(bx+hw, bz, t, d);
    seg(bx-hw, bz, t, d);
    const sideW = hw - halfDoor;
    seg(bx-(hw+halfDoor)/2, bz-hd, sideW, t);
    seg(bx+(hw+halfDoor)/2, bz-hd, sideW, t);
    buildings.push({x:bx,z:bz,w,d});
    if(withWindow){
      const wz=bz+hd, fMat=new THREE.MeshLambertMaterial({color:0x222a36});
      const gMat=new THREE.MeshBasicMaterial({color:0x3a6a8a,transparent:true,opacity:0.35,side:THREE.DoubleSide});
      const fT=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.25,0.2),fMat); fT.position.set(bx,2.7,wz);
      const fB=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.25,0.2),fMat); fB.position.set(bx,1.3,wz);
      const fL=new THREE.Mesh(new THREE.BoxGeometry(0.25,1.4,0.2),fMat); fL.position.set(bx-1.2,2.0,wz);
      const fR=new THREE.Mesh(new THREE.BoxGeometry(0.25,1.4,0.2),fMat); fR.position.set(bx+1.2,2.0,wz);
      const glass=new THREE.Mesh(new THREE.PlaneGeometry(2.1,1.3),gMat); glass.position.set(bx,2.0,wz); glass.rotation.y=Math.PI/2;
      scene.add(fT,fB,fL,fR,glass);
    }
  }
  addBuilding(-25, 0, 10, 10, true);  // 左侧房屋
  addBuilding( 25, 0, 10, 10);        // 右侧房屋（B 点 → 合成台所在）

  // 角色：1 玩家 + 1 个「它」
  player = spawnCharacter('blue',true);
  spawnCharacter('red',false);
  characters.forEach(placeAtSpawn);

  // 合成台（B 点房间 = 右侧房屋 25,0）
  makeCraftTable(25, 0);
  // 撬棍（B 点房间内，拾取后开锁 +20%）
  makeCrowbar(25, -2);
  // 逃生大门（敌区后方）
  makeGate();
  // 钥匙盒 ×20 随机位置
  placeKeyboxes();

  // 玩家隐身（只剩摄像机）
  player.group.visible=false;
  camera.position.set(player.group.position.x, EYE, player.group.position.z);
  sceneReady = true;
  updateHUD();
}

const TEX_MODE = localStorage.getItem('hraiTexMode') === 'svg' ? 'svg' : 'js';
const SHADER_MODE = localStorage.getItem('hraiShaderMode') === 'three' ? 'three' : 'webgl';

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
    try{
      initScene.apply(null, CSGenTex());
      return;
    }catch(e){ console.error('[HRAI] Canvas 纹理生成失败，回退 svg', e); }
  }
  loadSVGTextures().then(([tm,ta,te,tw,tpi,tps,tpr])=>{
    initScene(tm,ta,te,tw,tpi,tps,tpr);
  }).catch(()=>{
  console.error('[HRAI] SVG 纹理加载失败');
  if(el('toast')){ el('toast').textContent='纹理加载失败，请刷新重试'; el('toast').style.opacity=1; }
});
}
whenGunsReady(bootScene);

/* ---------- 7. 清场模式（供手指键位编辑使用，无玩家入口） ---------- */
function enterDebug(){
  for(const c of characters.slice()){
    if(c.isPlayer) continue;
    scene.remove(c.group); scene.remove(c.nameTag);
    const ci=characters.indexOf(c); if(ci>=0) characters.splice(ci,1);
  }
  debugMode=true; matchOver=false;
  player.alive=true; player.hp=100; player.flyY=0;
  player.group.rotation.x=0; player.group.position.y=0; player.group.visible=false;
  el('victory').classList.add('hide');
  const dh=el('dbgHud'); if(dh) dh.classList.add('hide');
  el('overlay').classList.add('hide'); running=true; updateHUD();
  if(!isPhone) cv.requestPointerLock(); else toast('👆 编辑手指键位：拖动按键 → 保存');
  toast('👆 键位编辑模式：拖动按键到任意位置');
}

/* ---------- 8. 输入（键盘 / 鼠标） ---------- */
document.addEventListener('keydown', e=>{
  if(remapAction){ e.preventDefault(); applyRemap(e); return; }
  const k=e.key.toLowerCase(); keys[k]=true;
  if(k==='escape'){ togglePause(); return; }
  if(k==='`'){ togglePause(); return; }
  if(k===keymap.jump || (keymap.jump===' '&&e.code==='Space')){ e.preventDefault(); if(player&&player.grounded&&running&&!paused) player.jumpQueued=true; return; }
});
document.addEventListener('keyup', e=>{ keys[e.key.toLowerCase()]=false; });
cv.addEventListener('contextmenu', e=>e.preventDefault());
document.addEventListener('contextmenu', e=>e.preventDefault());
document.addEventListener('mousemove', e=>{
  if(!running||document.pointerLockElement!==cv) return;
  player.yaw-=e.movementX*sensitivity; player.pitch-=e.movementY*sensitivity;
  player.pitch=Math.max(-1.45,Math.min(1.45,player.pitch));
});
document.addEventListener('pointerlockchange', ()=>{
  if(layoutEditing) return;
  if(document.pointerLockElement!==cv && running && !paused){
    paused=true; el('pause').classList.remove('hide');
  }
});

/* ---------- 9. 开始 / 主循环 ---------- */
function startGame(){
  if(typeof THREE==='undefined'){ toast('引擎未加载，请检查网络后刷新'); return; }
  if(!sceneReady){ toast('资源加载中…'); return; }
  initAudio();
  if(isPhone && typeof requestLandscape==='function') requestLandscape();
  el('overlay').classList.add('hide'); running=true;
  if(!isPhone) cv.requestPointerLock(); else toast('左摇杆移动 · 蹲/跳按钮 · 靠近钥匙盒自动收集');
  updateHUD();
  toast('第 '+roundNum+' 局 · 收集 20 把钥匙，合成大钥匙，逃出大门！');
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
    // 钥匙盒头顶进度条
    for(const kb of keyboxes){
      if(kb.sprite){
        kb.sprite.visible = kb.progress>0 && !kb.done;
        kb.sprite.position.set(kb.pos.x, 1.9, kb.pos.z);
        kb.sprite.scale.x = Math.max(0.06, 1.6*kb.progress);
      }
    }
    // 名字标记
    for(const c of characters){ if(c.nameTag){ c.nameTag.position.set(c.group.position.x, 2.4, c.group.position.z); c.nameTag.visible = c.alive; } }
    // 逃出判定：穿过大门到达墙外
    if(gateOpen && player.group.position.z < ESC_Z){ matchWin(); }
    updateHUD();
  }
  renderer.render(scene,camera);
}
animate();
