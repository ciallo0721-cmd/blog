"use strict";
/* ============================================================
   CS · gun.js — 武器逻辑 + 音效（assets/sound 音频）
   ============================================================ */

/* ---------- 武器配置 ---------- */
const WEAPONS = {
  ak:     {name:'AK47',  interval:0.11, mag:30, dmg:24, reload:1.8, auto:true,  range:60},
  pistol: {name:'手枪',  interval:0.34, mag:12, dmg:18, reload:1.3, auto:false, range:45},
  grenade:{name:'手雷',  interval:0.9,  mag:2,  dmg:0,  reload:0,   auto:false, range:0}
};
const GRENADE_RADIUS = 6, GRENADE_MAXDMG = 65;
const BOT_DMG = {ak:18, pistol:14};

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

/* ---------- 射击 ---------- */
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

/* ---------- 换弹 / 换枪 ---------- */
function startReload(ch){
  const w=WEAPONS[ch.weapon];
  if(ch.weapon==='grenade'||ch.reloading) return;
  if(ch.ammo[ch.weapon]>=w.mag) return;
  ch.reloading=true; ch.reloadT=w.reload; if(ch.isPlayer){toast('换弹中…');playReload();}
}
function finishReload(ch){ ch.ammo[ch.weapon]=WEAPONS[ch.weapon].mag; ch.reloading=false; if(ch.isPlayer)updateHUD(); }
function switchWeapon(){ const o=['ak','pistol','grenade']; curWeapon=o[(o.indexOf(curWeapon)+1)%o.length]; firing=false; updateHUD(); }

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
