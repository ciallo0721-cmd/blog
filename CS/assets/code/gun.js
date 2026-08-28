"use strict";
/* ============================================================
   CS · gun.js — 武器逻辑 + 音效 + 火箭弹道
   武器字段：
     name      显示名
     interval  射击间隔(秒)
     mag       弹匣容量
     dmg       单发伤害(爆炸武器填0)
     reload    换弹时间(秒)
     auto      是否连发
     range     射程
     rays         单次触发射出的弹丸/射线数（霰弹/狙击=5 颗散射弹丸）
     ammoPerShot  单次触发消耗的弹匣弹药数（默认1；霰弹/狙击每扣一次扳机只耗 1 发弹匣，但射 5 颗弹丸）
     spread       多弹丸散射角(弧度)
     explosive 是否爆炸（RPG / 手雷）
   ============================================================ */

/* ---------- 武器配置 ---------- */
const WEAPONS = {
  // mag = 弹匣容量, reserve = 备用弹(总弹量 = mag+reserve)
  ak:     {name:'AK47',   interval:0.10, mag:30, reserve:330, dmg:24, reload:1.8, auto:true,  range:60,  rays:1, ammoPerShot:1, spread:0.0,   explosive:false},
  pistol: {name:'手枪',   interval:0.30, mag:12, reserve:18,  dmg:18, reload:1.3, auto:false, range:45,  rays:1, ammoPerShot:1, spread:0.0,   explosive:false},
  sniper: {name:'狙击枪', interval:1.0,  mag:5,  reserve:25,  dmg:30, reload:2.5, auto:false, range:140, rays:5, ammoPerShot:1, spread:0.015, explosive:false},
  shotgun:{name:'霰弹枪', interval:0.75, mag:5,  reserve:15,  dmg:12, reload:2.2, auto:false, range:32,  rays:5, ammoPerShot:1, spread:0.22,  explosive:false},
  rpg:    {name:'RPG',    interval:1.4,  mag:1,  reserve:1,   dmg:0,  reload:2.0, auto:false, range:90,  rays:1, ammoPerShot:1, spread:0.0,   explosive:true},
  grenade:{name:'手雷',   interval:0.9,  mag:2,  reserve:0,    dmg:0,  reload:0,   auto:false, range:0,   rays:1, ammoPerShot:1, spread:0.0,   explosive:true}
};
const ALL_WEAPONS = ['ak','pistol','shotgun','rpg','grenade']; // 狙击枪暂时隐藏：恢复时把 'sniper' 加回数组即可
const GRENADE_RADIUS = 6, GRENADE_MAXDMG = 65;
const BOT_DMG = {ak:18, pistol:14, sniper:30, shotgun:12, rpg:0};

let curWeapon='ak', firing=false;

/* ---------- 音效（加载 assets/sound 下的 WAV） ---------- */
const SND = {};
const SND_FILES = {ak:'shoot_ak', pistol:'shoot_pistol', reload:'reload', explosion:'explosion'};
// 在用户手势（点击开始）时调用：预加载音频，同时解锁自动播放
function initAudio(){
  for(const k in SND_FILES){
    if(SND[k]) continue;
    try{
      const a = new Audio('assets/sound/'+SND_FILES[k]+'.wav');
      a.preload = 'auto';
      SND[k] = a;
    }catch(e){ SND[k] = null; }
  }
}
function playSnd(k){
  const a = SND[k];
  if(!a) return;
  try{ const c = a.cloneNode(); c.volume = 1; c.play().catch(()=>{}); }catch(e){}
}
function playShoot(type){ playSnd(type); }
function playReload(){ playSnd('reload'); }
function playExplosion(){ playSnd('explosion'); }

/* ---------- 辅助：散射方向 ---------- */
const raycaster=new THREE.Raycaster(), _dir=new THREE.Vector3();
function recoilKick(){ player.recoil+=0.03; }
let _vgTimer=null;
function viewKick(){ const vg=el('viewgun'); if(!vg)return; vg.style.transform='translateY(7px) rotate(1.2deg)'; clearTimeout(_vgTimer); _vgTimer=setTimeout(()=>{vg.style.transform='';},70); }

/* ---------- 射击（玩家） ---------- */
function playerFire(){
  const w=WEAPONS[curWeapon];
  if(curWeapon==='grenade'){ throwGrenade(player); return; }
  if(revivingNow) return;      // 救人时不能开枪
  if(player.downed || !player.alive) return;
  if(player.reloading) return;
  if(performance.now()-player.lastFire < w.interval*1000) return;
  const need = w.ammoPerShot || 1;   // 每次射击只消耗 1 发弹匣（霰弹/狙击虽射 5 颗弹丸，但每扣一次扳机只耗 1 发）
  const a = player.ammo[curWeapon];
  if(a.m < need){ if(!infiniteAmmo) toast('弹匣空 · 按 R 换弹'); return; }
  player.lastFire=performance.now();
  if(!infiniteAmmo) a.m = Math.max(0, a.m - need);   // 无限子弹秘籍跳过消耗
  playShoot(curWeapon); recoilKick(); viewKick();
  if(w.explosive){
    fireRocket(player, w);
  } else {
    camera.getWorldDirection(_dir);
    const rays = w.rays || 1;
    for(let i=0;i<rays;i++){
      const rd=_dir.clone();
      if(rays>1 && w.spread){ rd.x+=(Math.random()-0.5)*2*w.spread; rd.y+=(Math.random()-0.5)*2*w.spread; rd.z+=(Math.random()-0.5)*2*w.spread; rd.normalize(); }
      raycaster.set(camera.position, rd); raycaster.far=w.range;
      const hits=raycaster.intersectObjects(hitMeshes,false);
      if(hits.length){
        const ch=hits[0].object.userData.char;
        if(ch && ch.alive && (ch.team!==player.team || (sorry&&ch.team===player.team))) damage(ch, w.dmg, player);
      }
    }
  }
  if(!w.auto) firing=false;   // 半自动：每次点击只打一发（狙/霰弹/RPG/手枪）
  updateHUD();
}

/* ---------- 射击（AI） ---------- */
function botFire(b,target){
  const w=WEAPONS[b.weapon];
  if(w.explosive){ fireRocket(b, w); return; }   // RPG / 手雷走火箭弹道
  const origin=b.group.position.clone(); origin.y=1.5;
  const d=target.group.position.clone().sub(origin); d.y=0; d.normalize();
  // 削弱红方：红队散布更大（更不准）
  const baseSpread = (b.team==='red') ? 0.42 : 0.30;
  // 伤害：ak/pistol 用 BOT_DMG（偏弱，平衡）；新枪用武器自带 dmg
  let dmgFor;
  if(b.weapon==='ak') dmgFor=BOT_DMG.ak;
  else if(b.weapon==='pistol') dmgFor=BOT_DMG.pistol;
  else dmgFor = w.dmg || (BOT_DMG[b.weapon]||18);
  const rays = w.rays || 1;
  for(let i=0;i<rays;i++){
    const sp = (i===0) ? baseSpread : (w.spread || baseSpread);
    const a = Math.atan2(d.x,d.z) + (Math.random()-0.5)*2*sp;
    _dir.set(Math.sin(a),0,Math.cos(a));
    const rc=new THREE.Raycaster(origin,_dir,0,w.range);
    const hits=rc.intersectObjects(hitMeshes,false);
    if(hits.length){
      const ch=hits[0].object.userData.char;
      if(ch && ch.alive && ch.team!==b.team){
        // 削弱红方：红队伤害略低
        damage(ch, dmgFor * (b.team==='red'?0.85:1), b);
      }
    }
  }
}

/* ---------- 火箭弹（RPG） ---------- */
const rockets=[];
function fireRocket(ch, w){
  const origin = ch.isPlayer ? camera.position.clone() : ch.group.position.clone().setY(1.5);
  let dir;
  if(ch.isPlayer) dir=camera.getWorldDirection(new THREE.Vector3());
  else { const t=ch.aiTarget; dir = t ? t.group.position.clone().sub(origin).normalize() : new THREE.Vector3(Math.sin(ch.yaw),0,Math.cos(ch.yaw)); }
  dir.normalize();
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(0.3,10,10), new THREE.MeshBasicMaterial({color:0xff5522}));
  mesh.position.copy(origin); scene.add(mesh);
  rockets.push({mesh, pos:origin.clone(), vel:dir.multiplyScalar(30), owner:ch, team:ch.team, life:4});
}
function updateRockets(dt){
  for(let i=rockets.length-1;i>=0;i--){
    const r=rockets[i];
    r.vel.y-=6*dt; r.pos.addScaledVector(r.vel,dt); r.mesh.position.copy(r.pos); r.life-=dt;
    let hit=false;
    if(r.pos.y<=0.3) hit=true;
    for(const c of characters){ if(c.team===r.team||!c.alive||c.downed) continue; if(c.group.position.distanceTo(r.pos)<1.2){ hit=true; break; } }
    for(const p of pillars){ if(Math.hypot(r.pos.x-p.x,r.pos.z-p.z)<p.r+0.3){ hit=true; break; } }
    for(const wl of walls){ if(Math.abs(r.pos.x-wl.x)<wl.w/2+0.3 && Math.abs(r.pos.z-wl.z)<wl.d/2+0.3){ hit=true; break; } }
    if(hit||r.life<=0){ explode(r.pos, r.owner, 8, 120); scene.remove(r.mesh); rockets.splice(i,1); }
  }
}

/* ---------- 换弹 / 换枪 ---------- */
function startReload(ch){
  const wName = ch.isPlayer ? curWeapon : ch.weapon;
  const w = WEAPONS[wName];
  if(wName==='grenade' || ch.reloading) return;
  const a = ch.ammo[wName];
  if(a.m >= w.mag) return;            // 弹匣已满
  ch.reloading=true; ch.reloadT=w.reload; if(ch.isPlayer){toast('换弹中…');playReload();}
}
function finishReload(ch){
  const wName = ch.isPlayer ? curWeapon : ch.weapon;
  const w = WEAPONS[wName]; const a=ch.ammo[wName];
  const need = w.mag - a.m;
  const take = Math.min(need, a.r);
  a.m += take; a.r -= take;            // 从备用弹补充弹匣
  ch.reloading=false; if(ch.isPlayer)updateHUD();
}
function switchWeapon(){
  const o=ALL_WEAPONS;
  curWeapon=o[(o.indexOf(curWeapon)+1)%o.length];
  firing=false; updateHUD();
}

/* ---------- 手雷 ---------- */
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
function explode(pos,owner,radius,maxdmg){
  const R=radius||GRENADE_RADIUS, M=maxdmg||GRENADE_MAXDMG;
  playExplosion();
  const flash=new THREE.Mesh(new THREE.SphereGeometry(0.6,8,8),new THREE.MeshBasicMaterial({color:0xffd86a,transparent:true,opacity:0.9}));
  flash.position.copy(pos); flash.position.y=1; scene.add(flash);
  let f=1; const anim=()=>{f-=0.08;flash.scale.setScalar(1+(1-f)*6);flash.material.opacity=f; if(f<=0)scene.remove(flash);else requestAnimationFrame(anim);}; anim();
  for(const c of characters){ if(!c.alive||c.downed)continue; const d=c.group.position.distanceTo(pos);
    if(d<R){ const dmg=M*(1-d/R); damage(c,dmg,owner); } }
}
function callNuke(){   // 秘籍 gztfxxm：核弹，我方 +1000
  if(!gztfxxm) return;
  if(playerTeam==='blue') blueScore+=1000; else redScore+=1000;
  for(const c of characters){ if(c.team!==playerTeam&&c.alive) damage(c,9999,player); }
  playExplosion(); toast('☢ 核弹已召唤！我方 +1000'); updateHUD();
}
