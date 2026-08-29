"use strict";
/* ============================================================
   HRAI · gun.js — 武器表（仅小刀，AI 专用）+ 音效
   ------------------------------------------------------------
   Horror AI 去掉了枪械系统：玩家没有任何武器。
   全游戏唯一武器是「它」手里的小刀（近战 / 伤害 200 / 一刀秒）。
   本文件只保留：
     1. 武器配置加载（assets/Guns/all.json → WEAPONS）
     2. 音效加载（刀挥砍复用 shoot_pistol.wav）
     3. 供 CS.js / ai.js 引用的兼容函数（空实现）
   ============================================================ */

/* ---------- 武器配置（兜底表：仅小刀） ---------- */
const WEAPONS_FALLBACK = {
  knife: {name:'小刀', interval:0.7, mag:1, reserve:0, dmg:200, reload:0, auto:false, range:1.8,
          rays:1, ammoPerShot:1, spread:0.0, explosive:false, special:'', sound:'shoot_pistol.wav',
          bot:200, hidden:false, melee:true}
};
let WEAPONS = Object.assign({}, WEAPONS_FALLBACK);
let ALL_WEAPONS = Object.keys(WEAPONS).filter(k=>!WEAPONS[k].hidden);
let curWeapon = 'knife', firing = false;

/* ---------- 从 assets/Guns/all.json 载入武器列表 ----------
   正常情况下 JSON 里只有一把小刀；结构与原 CS 兼容。 */
function gunSpecialList(s){
  return String(s||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
}
function normalizeGun(id, g){
  const initial = Math.max(1, parseInt(g.initial,10) || 1);
  const bullets = Math.max(initial, parseInt(g.bullets,10) || initial);
  const hit     = parseInt(g.hit,10);
  const spec    = gunSpecialList(g.special);
  return {
    id,
    name: String(g.name || id),
    interval: parseFloat(g.interval) || 0.3,
    mag: initial,
    reserve: Math.max(0, bullets - initial),
    dmg: Math.max(1, Math.min(200, isNaN(hit)?1:hit)),
    reload: parseFloat(g.reload) || 1.5,
    auto: !!g.auto,
    range: parseFloat(g.range) || 60,
    rays: Math.max(1, parseInt(g.rays,10) || 1),
    ammoPerShot: Math.max(1, parseInt(g.ammoPerShot,10) || 1),
    spread: parseFloat(g.spread) || 0,
    explosive: spec.indexOf('boom')>=0 || !!g.explosive,
    radius: parseFloat(g.radius) || 0,
    homing: spec.indexOf('track')>=0,
    special: spec.join(','),
    sound: String(g.sound || 'shoot_pistol.wav'),
    bot: Math.max(1, Math.min(200, parseInt(g.bot,10) || (isNaN(hit)?1:hit))),
    hidden: !!g.hidden,
    melee: !!g.melee
  };
}
function applyGunJSON(data){
  let list = null;
  if(Array.isArray(data)) list = data;
  else if(data && typeof data==='object') list = Object.keys(data).map(k=>Object.assign({id:k}, data[k]));
  if(!list || !list.length) return false;
  const next = {};
  for(const raw of list){
    const id = String(raw.id || raw.name || '').trim();
    if(!id) continue;
    next[id] = normalizeGun(id, raw);
  }
  if(!Object.keys(next).length) return false;
  WEAPONS = next;
  ALL_WEAPONS = Object.keys(next).filter(k=>!next[k].hidden);
  if(ALL_WEAPONS.indexOf(curWeapon) < 0) curWeapon = ALL_WEAPONS[0] || 'knife';
  for(const k in WEAPONS) SND_FILES[k] = String(WEAPONS[k].sound).replace(/\.wav$/i, '');
  return true;
}
const GUN_JSON_URL = 'assets/Guns/all.json';
let gunsFromJSON = false;
const gunsReady = new Promise(res=>{
  let done=false;
  const fin = ok=>{ if(!done){ done=true; gunsFromJSON=ok; res(ok); } };
  setTimeout(()=>fin(false), 3000);
  try{
    fetch(GUN_JSON_URL).then(r=> r.ok ? r.json() : null)
      .then(d=> fin(d ? applyGunJSON(d) : false))
      .catch(()=> fin(false));
  }catch(e){ fin(false); }
});
function whenGunsReady(fn){ gunsReady.then(()=>{ try{ fn(); }catch(e){ console.error(e); } }); }

/* ---------- 音效（加载 assets/sound 下的 WAV） ---------- */
const SND = {};
const SND_FILES = {knife:'shoot_pistol', footstep:'shoot_ak'};
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
function playSnd(k, vol){
  const a = SND[k];
  if(!a) return;
  try{ const c = a.cloneNode(); c.volume = (vol==null ? 0.7 : Math.max(0,Math.min(1,vol))); c.play().catch(()=>{}); }catch(e){}
}
function playShoot(type){ playSnd(type); }          // 「它」挥刀音效
function playFootstep(vol){ playSnd('footstep', vol); }   // 「它」脚步声（按距离调音量）
function playReload(){}

/* ---------- 兼容占位（原枪械系统的空实现，避免残留引用报错） ---------- */
function slowMul(ch){ return 1; }
function tickGunSpecial(dt){}
function updateRockets(dt){}
function startReload(ch){}
function finishReload(ch){}
function switchWeapon(){}
function playerFire(){}
function botFire(){}
function throwGrenade(){}
function explode(){}
function callNuke(){}
