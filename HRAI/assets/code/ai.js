"use strict";
/* ============================================================
   HRAI · ai.js — 追猎者 AI（单个敌人「它」）
   ------------------------------------------------------------
   「它」是全场唯一的敌人：
   - 永远锁定玩家位置（雾里也追，闻得到你）
   - A* 寻路绕开柱子/房屋，不卡墙
   - 近战小刀：进入 2m 内挥刀，伤害 200（一刀秒）
   - 剩最后 3 把钥匙时进入狂暴（速度 ×RUSH_MUL）
   - 卡死自动重规划

   对外依赖（由 CS.js / gun.js 提供）：
     MAP, HALF, pillars, walls, characters, player, THREE,
     resolveCollision, sceneReady, rush, damage, playShoot
   被 CS.js 主循环调用的入口： updateBot(b, dt)
   ============================================================ */

/* ============================================================
   [0] AI 总配置
   ============================================================ */
const AI_CFG = {
  NAV_CELL:    2,
  NAV_MARGIN:  1.4,
  WP_REACH:    1.3,
  REPATH:      0.45,     // 追击重算路径间隔(秒)
  SPEED:       3.6,      // 平时追击速度（玩家 7，轻松甩开）
  RUSH_MUL:    1.65,     // 狂暴倍率：3.6 × 1.65 ≈ 5.9（还是追不上全力跑的玩家）
  SENSE_RANGE: 22,       // 平时感知距离：22m 内才察觉玩家（跑远就甩丢了）
  PATROL_SPEED:2.4,      // 丢失目标后游荡速度（傻乎乎的慢）
  LOST_TIME:   3.0,      // 丢失目标后去最后位置搜索的时长(秒)
  STRIKE_RANGE:2.0,      // 挥刀距离
  STRIKE_CD:   1.0,      // 挥刀冷却（砍得慢，给玩家反应时间）
  STRIKE_DMG:  200,      // 一刀伤害（秒杀 100 血玩家）
  STUCK_WINDOW:0.6,
  STUCK_DIST:  0.45,
};

/* ============================================================
   [1] 导航网格 + A* 寻路（与原版一致，自动绕开柱子/围墙）
   ============================================================ */
const NAV_CELL = AI_CFG.NAV_CELL;
const NAV_HALF = MAP / 2;
const NAV_N    = Math.round(MAP / NAV_CELL);   // 30 × 30
let navGrid  = null;
let navBuilt = false;

const _navI  = x => Math.floor((x + NAV_HALF) / NAV_CELL);
const _navJ  = z => Math.floor((z + NAV_HALF) / NAV_CELL);
const _navWX = i => -NAV_HALF + (i + 0.5) * NAV_CELL;
const _navWZ = j => -NAV_HALF + (j + 0.5) * NAV_CELL;

function navBlocked(i, j){
  if(i < 0 || j < 0 || i >= NAV_N || j >= NAV_N) return true;
  return navGrid[j * NAV_N + i] === 1;
}

const WALL_NAV_MARGIN = 0.6;
function buildNav(){
  navGrid = new Uint8Array(NAV_N * NAV_N);
  const m = AI_CFG.NAV_MARGIN;
  for(let j = 0; j < NAV_N; j++) for(let i = 0; i < NAV_N; i++){
    const wx = _navWX(i), wz = _navWZ(j);
    let blk = false;
    for(const p of pillars){ if(Math.hypot(wx - p.x, wz - p.z) < p.r + m){ blk = true; break; } }
    if(!blk){ for(const r of walls){ if(wx > r.x-r.w/2-WALL_NAV_MARGIN && wx < r.x+r.w/2+WALL_NAV_MARGIN && wz > r.z-r.d/2-WALL_NAV_MARGIN && wz < r.z+r.d/2+WALL_NAV_MARGIN){ blk = true; break; } } }
    if(blk) navGrid[j * NAV_N + i] = 1;
  }
  for(let i = 0; i < NAV_N; i++){
    navGrid[0 * NAV_N + i] = 1;
    navGrid[(NAV_N - 1) * NAV_N + i] = 1;
    navGrid[i * NAV_N + 0] = 1;
    navGrid[i * NAV_N + (NAV_N - 1)] = 1;
  }
}
function ensureNav(){ if(!navBuilt){ if(!pillars.length) return; buildNav(); navBuilt = true; } }

function navSnap(x, z){
  let i = _navI(x), j = _navJ(z);
  if(!navBlocked(i, j)) return { i, j };
  for(let r = 1; r < NAV_N; r++){
    for(let dj = -r; dj <= r; dj++) for(let di = -r; di <= r; di++){
      if(Math.abs(di) !== r && Math.abs(dj) !== r) continue;
      const ni = i + di, nj = j + dj;
      if(!navBlocked(ni, nj)) return { i: ni, j: nj };
    }
  }
  return { i, j };
}

function lineClear(a, b){
  const steps = Math.ceil(a.distanceTo(b) / 1.0);
  for(let s = 1; s < steps; s++){
    const t = s / steps, x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
    for(const p of pillars){ if(Math.hypot(x - p.x, z - p.z) < p.r + 0.6) return false; }
  }
  return true;
}

function smoothPath(path, gx, gz){
  if(path.length <= 2){ path[path.length - 1] = new THREE.Vector3(gx, 0, gz); return path; }
  const out = [path[0]];
  let anchor = 0;
  for(let i = 2; i < path.length; i++){
    if(!lineClear(path[anchor], path[i])){ out.push(path[i - 1]); anchor = i - 1; }
  }
  out.push(path[path.length - 1]);
  out[out.length - 1] = new THREE.Vector3(gx, 0, gz);
  return out;
}

function findPath(sx, sz, gx, gz){
  ensureNav();
  if(!navGrid) return null;
  const s = navSnap(sx, sz), g = navSnap(gx, gz);
  const startIdx = s.j * NAV_N + s.i, goalIdx = g.j * NAV_N + g.i;
  if(startIdx === goalIdx) return [new THREE.Vector3(gx, 0, gz)];
  const N = NAV_N * NAV_N;
  const gScore = new Float32Array(N).fill(Infinity);
  const fScore = new Float32Array(N).fill(Infinity);
  const came   = new Int32Array(N).fill(-1);
  const open   = new Set([startIdx]);
  const h = (i, j) => { const dx = Math.abs(i - g.i), dz = Math.abs(j - g.j); return (dx + dz) + (Math.SQRT2 - 2) * Math.min(dx, dz); };
  gScore[startIdx] = 0; fScore[startIdx] = h(s.i, s.j);
  const DIRS = [[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,Math.SQRT2],[1,-1,Math.SQRT2],[-1,1,Math.SQRT2],[-1,-1,Math.SQRT2]];
  let guard = 0;
  while(open.size && guard++ < 9000){
    let cur = -1, best = Infinity;
    for(const idx of open){ if(fScore[idx] < best){ best = fScore[idx]; cur = idx; } }
    if(cur === goalIdx){
      const path = []; let c = cur;
      while(c !== -1){ const ci = c % NAV_N, cj = (c - c % NAV_N) / NAV_N; path.push(new THREE.Vector3(_navWX(ci), 0, _navWZ(cj))); c = came[c]; }
      path.reverse();
      return smoothPath(path, gx, gz);
    }
    open.delete(cur);
    const ci = cur % NAV_N, cj = (cur - cur % NAV_N) / NAV_N;
    for(const [di, dj, cost] of DIRS){
      const ni = ci + di, nj = cj + dj;
      if(navBlocked(ni, nj)) continue;
      if(di !== 0 && dj !== 0 && (navBlocked(ci + di, cj) || navBlocked(ci, cj + dj))) continue;
      const ni2 = nj * NAV_N + ni;
      const tg = gScore[cur] + cost;
      if(tg < gScore[ni2]){ came[ni2] = cur; gScore[ni2] = tg; fScore[ni2] = tg + h(ni, nj); open.add(ni2); }
    }
  }
  return null;
}

function planTo(b, tx, tz){
  const np = findPath(b.group.position.x, b.group.position.z, tx, tz);
  if(np && np.length){
    b.path = np;
    b.pathIdx = np.length > 1 ? 1 : 0;
  } else {
    b.path = [new THREE.Vector3(tx, 0, tz)];
    b.pathIdx = 0;
  }
  b.pathGoal = new THREE.Vector3(tx, 0, tz);
}

/* ============================================================
   [2] 追猎主逻辑
   ============================================================ */
function updateBot(b, dt){
  if(!player || matchOver) return;
  ensureNav();

  const nd = b.group.position.distanceTo(player.group.position);
  // 感知：平时 22m 内才察觉玩家（跑远就甩丢）；狂暴时全图锁定
  const aware = rush || nd <= AI_CFG.SENSE_RANGE;

  let goal, speed;
  if(aware){
    b.lastSeen = player.group.position.clone();
    b.lostT = 0;
    goal = player.group.position;
    speed = rush ? AI_CFG.SPEED * AI_CFG.RUSH_MUL : AI_CFG.SPEED;

    /* —— 近战挥刀（冷却 1s，给玩家反应时间） —— */
    b.attackCd = (b.attackCd || 0) - dt;
    if(nd <= AI_CFG.STRIKE_RANGE && b.attackCd <= 0 && player.alive){
      b.attackCd = AI_CFG.STRIKE_CD;
      playShoot('knife');
      damage(player, AI_CFG.STRIKE_DMG, b);
    }
  } else {
    /* —— 丢失目标：先搜最后看到的位置，找不到就随机游荡 —— */
    b.lostT = (b.lostT || 0) + dt;
    if(b.lastSeen && b.lostT < AI_CFG.LOST_TIME){
      goal = b.lastSeen;
    } else {
      b.lastSeen = null;
      if(!b.moveTarget || b.group.position.distanceTo(b.moveTarget) < 2.5){
        b.moveTarget = new THREE.Vector3((Math.random()-0.5)*80, 0, (Math.random()-0.5)*80);
      }
      goal = b.moveTarget;
    }
    speed = AI_CFG.PATROL_SPEED;
  }

  /* —— 寻路（节流重算） —— */
  b.pathTimer = (b.pathTimer || 0) - dt;
  const goalMoved = b.pathGoal && goal.distanceTo(b.pathGoal) > 2.5;
  if(!b.path || b.pathIdx >= (b.path ? b.path.length : 0) || b.pathTimer <= 0 || goalMoved){
    planTo(b, goal.x, goal.z);
    b.pathTimer = AI_CFG.REPATH;
  }

  let mvx = 0, mvz = 0;
  if(b.path && b.pathIdx < b.path.length){
    const wp = b.path[b.pathIdx];
    const dx = wp.x - b.group.position.x, dz = wp.z - b.group.position.z;
    const d = Math.hypot(dx, dz);
    if(d < AI_CFG.WP_REACH) b.pathIdx++;
    if(d > 0.001){ mvx = dx / d; mvz = dz / d; }
  }
  if(b.pathIdx >= (b.path ? b.path.length : 0)) b.pathTimer = 0;

  const vl = Math.hypot(mvx, mvz);
  if(vl > 0.001){
    mvx /= vl; mvz /= vl;
    b.group.position.x += mvx * speed * dt;
    b.group.position.z += mvz * speed * dt;
  }

  /* —— 脚步声：走路时出 shoot_ak.wav，音量随距离衰减（34m 外听不见） —— */
  b.footT = (b.footT || 0) - dt;
  if(b.footT <= 0 && vl > 0.2){
    b.footT = 0.42;   // 每 0.42 秒一脚
    const d = player.group.position.distanceTo(b.group.position);
    const vol = Math.max(0, Math.min(1, 1 - d/34));
    if(vol > 0.02) playFootstep(vol);
  }

  /* —— 卡死自救 —— */
  b._stuckAcc = (b._stuckAcc || 0) + b.group.position.distanceTo(b._stuckPrev || b.group.position);
  if(!b._stuckPrev) b._stuckPrev = b.group.position.clone();
  b._stuckWin = (b._stuckWin || 0) + dt;
  if(b._stuckWin >= AI_CFG.STUCK_WINDOW){
    if(b._stuckAcc < AI_CFG.STUCK_DIST){
      b.path = null; b.pathTimer = 0;
      b.group.position.x += (Math.random() - 0.5) * 1.5;
      b.group.position.z += (Math.random() - 0.5) * 1.5;
    }
    b._stuckAcc = 0; b._stuckWin = 0;
  }
  b._stuckPrev.copy(b.group.position);

  /* —— 朝向（追猎时面向玩家，游荡时面向移动方向） —— */
  if(aware && nd > 0.001) b.yaw = Math.atan2(goal.x - b.group.position.x, goal.z - b.group.position.z);
  else if(vl > 0.05) b.yaw = Math.atan2(mvx, mvz);
  resolveCollision(b.group.position);
  b.group.position.y = 0;
  b.group.rotation.y = b.yaw;
}
