"use strict";
/* ============================================================
   CS · ai.js — 敌人 AI 状态机 + 战术系统
   ------------------------------------------------------------
   本文件实现了比「直球冲锋」聪明得多的敌方 AI，包含：

     [0] AI 总配置 AI_CFG        —— 所有手感参数集中可调
     [1] 导航网格 + A* 寻路       —— 自动绕开柱子/围墙，不再卡死
     [2] 感知系统                 —— FOV 视野 + 视线(LOS) + 反应时间 + 警觉度
     [3] 掩体 / 包抄 / 侧移几何    —— 会找掩体、绕侧翼、走位不站桩
     [4] 小队分工                 —— 突击 / 包抄 / 支援 三种角色
     [5] 主状态机 updateBot        —— revive/chase/flank/fight/cover/retreat/search/patrol
     [6] 卡死自救 + 调试可视化      —— 长时间不动就强制重新规划

   对外依赖（由 CS.js / gun.js 提供，勿在此修改）：
     MAP, HALF, pillars, characters, medkits, REVIVE_RANGE,
     THREE, resolveCollision, tickRevive, startReload,
     finishReload, botFire, throwGrenade, lineClear(自带)
   被 CS.js 主循环调用的入口： updateBot(b, dt)
   ============================================================ */

/* ============================================================
   [0] AI 总配置 —— 想调手感只改这里
   ============================================================ */
const AI_CFG = {
  /* —— 寻路 —— */
  NAV_CELL:        2,        // 导航网格单元格边长(米)，越小越精细也越慢
  NAV_MARGIN:      1.4,      // 柱子阻挡外扩裕量（柱子半径~1.7 + 机体半径）
  REPATH_CHASE:    0.45,     // 追击时重新算路的间隔(秒)
  REPATH_OTHER:    1.1,      // 其它状态重算间隔(秒)
  REPATH_MOVE:     3.0,      // 目标移动超过该距离立即重算(米)
  WP_REACH:        1.3,      // 到达航点的判定半径(米)

  /* —— 感知 —— */
  FOV_COS:         0.15,     // 视野半角余弦（越小视野越广，0.15≈159°）
  SENSE_CLOSE:     13,       // 13 米内靠听觉必察觉（无视视野/视线）
  REACT_TIME:      0.28,     // 刚发现敌人时的愣神(反应)时间(秒)
  ALERT_DECAY:     0.25,     // 丢失目标后警觉度每秒衰减
  SEARCH_TIME:     3.5,      // 丢失目标后前往最后已知位置的搜索时长(秒)

  /* —— 战斗 —— */
  ENGAGE_MIN:      6,        // 进入交火的最小距离
  CHASE_MAX:       40,       // 超过该距离不再追击（放弃）
  FIRE_RANGE_AK:   34,       // 超出此距离命中率显著下降
  HIT_NEAR:        0.92,     // 近距离命中率上限
  HIT_FAR:         0.42,     // 远距离命中率下限
  FLANK_DIST:      16,       // 包抄点的侧向偏移距离(米)
  STRAFE_SPEED:    3.6,      // 交火时横向走位速度
  STRAFE_SWITCH:   0.85,     // 切换左右横移的间隔(秒)
  NADE_CHANCE:     0.02,     // 近距每帧掷雷概率（逼掩体后的敌人）

  /* —— 生存 —— */
  RETREAT_HP:      35,       // 血量低于此值转入撤退/找掩体
  COVER_HP:        55,       // 血量低于此值优先躲掩体而非硬刚
  REVIVE_RANGE:    45,       // 倒地队友在此范围内才去救
  REVIVE_SAFE:     16,       // 敌人比这近时先不救（保命）

  /* —— 防卡死 —— */
  STUCK_WINDOW:    0.6,      // 卡死检测窗口(秒)
  STUCK_DIST:      0.45,     // 窗口内移动不足此值算卡住
  STUCK_LIMIT:     1.2,      // 连续卡住超过此时长强制重规划+随机抖
};

/* 小队角色参数：突击往前压、包抄走侧翼、支援保人扔雷 */
const AI_ROLES = {
  assault: { fightRange: 11, push: 1.25, nadeBias: 1.0, preferRevive: false },
  flanker: { fightRange: 14, push: 1.0,  nadeBias: 1.1, preferRevive: false },
  support: { fightRange: 18, push: 0.8,  nadeBias: 1.6, preferRevive: true  },
};

/* ============================================================
   [1] 导航网格 + A* 寻路
   ============================================================ */
const NAV_CELL = AI_CFG.NAV_CELL;
const NAV_HALF = MAP / 2;
const NAV_N    = Math.round(MAP / NAV_CELL);   // 30 × 30
let navGrid  = null;     // Uint8Array: 1 = 阻挡
let navBuilt = false;

const _navI  = x => Math.floor((x + NAV_HALF) / NAV_CELL);
const _navJ  = z => Math.floor((z + NAV_HALF) / NAV_CELL);
const _navWX = i => -NAV_HALF + (i + 0.5) * NAV_CELL;
const _navWZ = j => -NAV_HALF + (j + 0.5) * NAV_CELL;

function navBlocked(i, j){
  if(i < 0 || j < 0 || i >= NAV_N || j >= NAV_N) return true;
  return navGrid[j * NAV_N + i] === 1;
}

/* 构建静态网格：柱子(圆) + 房屋墙(矩形) + 四周边界标记为阻挡
   注意：墙体导航裕量(wallMargin)必须明显小于门洞宽度的一半，
   否则 3m 门洞被两边各外扩 1.4m 堵成 0.2m 缝 → A* 进不去房屋，
   导致站点是「房屋内 C4」(站点B)时 bot 永远下不了/拆不了包。 */
const WALL_NAV_MARGIN = 0.6;
function buildNav(){
  navGrid = new Uint8Array(NAV_N * NAV_N);
  const m = AI_CFG.NAV_MARGIN;          // 柱子阻挡裕量（机体半径+柱半径）
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

/* 任意世界坐标 → 最近的「可行走格」中心坐标 */
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

/* 视线检测：a→b 之间是否被柱子挡住（直视 = 无遮挡） */
function lineClear(a, b){
  const steps = Math.ceil(a.distanceTo(b) / 1.0);
  for(let s = 1; s < steps; s++){
    const t = s / steps, x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
    for(const p of pillars){ if(Math.hypot(x - p.x, z - p.z) < p.r + 0.6) return false; }
  }
  return true;
}
const hasLOS = lineClear;   // 别名，语义更清楚

/* 贪心视线平滑：去掉中间能被直线连接的冗余航点，路径更自然 */
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

/* A*（八方向，对角防穿角）返回世界坐标航点数组 */
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

/* 给某个 bot 规划到 (tx,tz) 的路径，写回 b.path 等字段 */
function planTo(b, tx, tz, state){
  const np = findPath(b.group.position.x, b.group.position.z, tx, tz);
  if(np && np.length){
    b.path = np;
    b.pathIdx = np.length > 1 ? 1 : 0;   // 跳过起点格（就在脚下）
  } else {
    // 不可达：直奔目标（resolveCollision 兜底，不会冻结卡死）
    b.path = [new THREE.Vector3(tx, 0, tz)];
    b.pathIdx = 0;
  }
  b.pathGoal  = new THREE.Vector3(tx, 0, tz);
  b.pathState = state;
}

/* 沿当前路径前进，返回「是否已抵达终点」 */
function followPath(b, dt, speed){
  if(!b.path || b.pathIdx >= b.path.length) return true;
  const wp = b.path[b.pathIdx];
  const dx = wp.x - b.group.position.x, dz = wp.z - b.group.position.z;
  const d = Math.hypot(dx, dz);
  if(d < AI_CFG.WP_REACH) b.pathIdx++;
  let vx = 0, vz = 0;
  if(d > 0.001){ vx = dx / d; vz = dz / d; }
  b.group.position.x += vx * speed * dt;
  b.group.position.z += vz * speed * dt;
  return b.pathIdx >= b.path.length;
}

/* ============================================================
   [2] 感知系统
   ============================================================ */
/* 敌人在不在视野内（FOV 锥形，背后也能被察觉靠 SENSE_CLOSE） */
function inFOV(b, t){
  const fx = Math.sin(b.yaw), fz = Math.cos(b.yaw);
  const dx = t.group.position.x - b.group.position.x, dz = t.group.position.z - b.group.position.z;
  const d = Math.hypot(dx, dz) || 1;
  const dot = (fx * dx + fz * dz) / d;
  return dot >= AI_CFG.FOV_COS;
}

/* 返回当前「可见」的敌人（最近 + 有视线 + 在视野/近距），否则 null */
function perceive(b, dt){
  let enemy = null, ed = 1e9;
  for(const c of characters){
    if(c === b || !c.alive || c.downed || c.team === b.team) continue;
    const d = b.group.position.distanceTo(c.group.position);
    if(d < ed){ ed = d; enemy = c; }
  }
  if(!enemy){ b._perceiveDist = 1e9; return null; }
  b._perceiveDist = ed;

  const aware = (ed < AI_CFG.SENSE_CLOSE) || (inFOV(b, enemy) && hasLOS(b.group.position, enemy.group.position));
  if(aware){
    if(b.target !== enemy){ b.reactT = AI_CFG.REACT_TIME; }   // 刚发现 → 愣一下
    b.target    = enemy;
    b.lastSeen  = enemy.group.position.clone();
    b.alert     = 1;
    b._lostT    = 0;
  } else {
    // 看不到：警觉度衰减，超时清除目标转入搜索
    b.alert = Math.max(0, (b.alert || 0) - AI_CFG.ALERT_DECAY * dt);
    if(b.alert <= 0){ b.target = null; }
  }
  return b.target;
}

/* 最近的倒地队友（去救） */
function nearestDownedTeammate(b){
  let t = null, td = 1e9;
  for(const c of characters){
    if(c.team !== b.team || !c.downed) continue;
    const d = b.group.position.distanceTo(c.group.position);
    if(d < td){ td = d; t = c; }
  }
  return t ? { ch: t, d: td } : null;
}

/* ============================================================
   [3] 掩体 / 包抄 / 侧移 几何
   ============================================================ */
/* 找离敌人最安全的掩体点：选某根柱子「背向敌人」的那一侧 */
function bestCover(b, enemyPos){
  let best = null, bestScore = -1e9;
  for(const p of pillars){
    const dx = p.x - enemyPos.x, dz = p.z - enemyPos.z;
    const d = Math.hypot(dx, dz) || 1;
    const cx = p.x + dx / d * (p.r + 1.9);   // 柱子背敌侧
    const cz = p.z + dz / d * (p.r + 1.9);
    if(Math.abs(cx) > NAV_HALF - 3 || Math.abs(cz) > NAV_HALF - 3) continue;
    const distToMe = Math.hypot(cx - b.group.position.x, cz - b.group.position.z);
    const distToEnemy = Math.hypot(cx - enemyPos.x, cz - enemyPos.z);
    if(distToEnemy < 5) continue;            // 离敌人太近的掩体没用
    // 评分：离敌人适中(利于偷瞄) + 离自己近(快到) + 从掩体能看见敌人
    let score = -Math.abs(distToEnemy - 12) - distToMe * 0.3;
    if(hasLOS(new THREE.Vector3(cx, 0, cz), enemyPos)) score += 6;
    if(score > bestScore){ bestScore = score; best = new THREE.Vector3(cx, 0, cz); }
  }
  return best;
}

/* 包抄点：在敌人侧翼偏移 FLANK_DIST，挑能看见敌人的那一侧 */
function flankPoint(b, enemyPos){
  const dx = enemyPos.x - b.group.position.x, dz = enemyPos.z - b.group.position.z;
  const d = Math.hypot(dx, dz) || 1;
  const px = -dz / d, pz = dx / d;           // 垂直方向
  const off = AI_CFG.FLANK_DIST;
  const cand = [
    new THREE.Vector3(enemyPos.x + px * off, 0, enemyPos.z + pz * off),
    new THREE.Vector3(enemyPos.x - px * off, 0, enemyPos.z - pz * off),
  ];
  let pick = cand[0];
  if(!hasLOS(pick, enemyPos) && hasLOS(cand[1], enemyPos)) pick = cand[1];
  // 夹在地图内
  pick.x = Math.max(-NAV_HALF + 3, Math.min(NAV_HALF - 3, pick.x));
  pick.z = Math.max(-NAV_HALF + 3, Math.min(NAV_HALF - 3, pick.z));
  return pick;
}

/* 与队友保持间距，避免五个人叠成一个点 */
function separation(b){
  let sx = 0, sz = 0;
  for(const c of characters){
    if(c === b || c.team !== b.team || !c.alive || c.downed) continue;
    const dx = b.group.position.x - c.group.position.x, dz = b.group.position.z - c.group.position.z;
    const d = Math.hypot(dx, dz);
    if(d < 2.2 && d > 0.001){ sx += dx / d * (2.2 - d); sz += dz / d * (2.2 - d); }
  }
  return { x: sx, z: sz };
}

/* 友军是否挡在「我→目标」连线上（避免误伤队友） */
function teammateInLine(b, target){
  const a = b.group.position, c = target.group.position;
  for(const m of characters){
    if(m === b || m === target || m.team !== b.team || !m.alive || m.downed) continue;
    const mx = m.group.position.x, mz = m.group.position.z;
    const t = ((mx - a.x) * (c.x - a.x) + (mz - a.z) * (c.z - a.z)) /
              ((c.x - a.x) ** 2 + (c.z - a.z) ** 2 || 1);
    if(t < 0.05 || t > 0.95) continue;
    const px = a.x + (c.x - a.x) * t, pz = a.z + (c.z - a.z) * t;
    if(Math.hypot(mx - px, mz - pz) < 0.9) return true;
  }
  return false;
}

/* ============================================================
   [4] 小队分工（首次出现时按出生顺序分配角色）
   ============================================================ */
const _roleOrder = ['assault', 'flanker', 'support', 'assault', 'flanker'];
let _roleAssigned = 0;
function assignRole(b){
  if(b.aiRole) return;
  b.aiRole = _roleOrder[_roleAssigned % _roleOrder.length];
  _roleAssigned++;
  const r = AI_ROLES[b.aiRole];
  b.fightRange = r.fightRange;
  b.pushMul    = r.push;
  b.nadeBias   = r.nadeBias;
  b.preferRev  = r.preferRevive;
}

/* ============================================================
   [5] 主状态机
   ============================================================ */
function patrolPoint(){
  return new THREE.Vector3((Math.random() - 0.5) * 48, 0, (Math.random() - 0.5) * 48);
}

/* 开火决策：反应时间 + 装弹 + 视线 + 命中率 + 防误伤 + 掷雷 */
function botTryFire(b, target, nd, dt){
  if(b.reloading) return;
  if(b.reactT > 0){ b.reactT -= dt; return; }     // 刚发现，愣神中
  if(b.ammo[b.weapon].m <= 0){ startReload(b); return; }   // 弹匣空 → 换弹
  if(!hasLOS(b.group.position, target.group.position)) return;   // 看不见不打
  if(teammateInLine(b, target)) return;                         // 别崩队友
  if(nd > AI_CFG.ENGAGE_MIN){
    const far = Math.max(0, nd - AI_CFG.ENGAGE_MIN);
    const chance = Math.max(AI_CFG.HIT_FAR, AI_CFG.HIT_NEAR - far * 0.016);
    if(Math.random() > chance) return;                          // 远距离更容易脱靶
  }
  b.aiTimer -= dt;
  if(b.aiTimer <= 0){
    b.aiTimer = (b.weapon === 'ak') ? 0.2 : 0.5;
    botFire(b, target);
  }
  // 近距逼掩体后的敌人：按角色偏好掷雷
  if(nd < 10 && b.ammo.grenade > 0 && Math.random() < AI_CFG.NADE_CHANCE * (b.nadeBias || 1)){
    throwGrenade(b);
  }
}

/* 状态决策：返回状态名 + 相关目标 */
function decideState(b, enemy, dtm, nd){
  assignRole(b);
  // 1) 优先救队友（支援角色更积极；附近有敌人贴脸则先保命）
  if(dtm && dtm.d < AI_CFG.REVIVE_RANGE && (b.preferRev || !enemy || nd > AI_CFG.REVIVE_SAFE)){
    return 'revive';
  }
  if(enemy && nd < AI_CFG.CHASE_MAX){
    // 2) 低血：撤到医疗箱或找掩体
    if(b.hp < AI_CFG.RETREAT_HP && !(dtm && dtm.d < AI_CFG.REVIVE_RANGE && b.preferRev)){
      return 'retreat';
    }
    if(b.hp < AI_CFG.COVER_HP && !hasLOS(b.group.position, enemy.group.position)){
      return 'cover';
    }
    // 3) 视野被挡 → 推进/重新找角度
    if(!hasLOS(b.group.position, enemy.group.position)){
      return (b.aiRole === 'flanker') ? 'flank' : 'chase';
    }
    // 4) 在交火距离内 → 对枪走位；太远 → 压上
    const fr = b.fightRange || 13;
    if(nd > fr + 4 * (b.pushMul || 1)) return (b.aiRole === 'flanker') ? 'flank' : 'chase';
    return 'fight';
  }
  // 5) 没敌人：去最后已知位置搜一下，否则巡逻 / 找血
  if(b.lastSeen && (b._lostT || 0) < AI_CFG.SEARCH_TIME) return 'search';
  if(b.hp < AI_CFG.COVER_HP){
    let best = null, bd = 1e9;
    for(const mk of medkits){ if(!mk.active) continue; const d = b.group.position.distanceTo(mk.pos); if(d < bd){ bd = d; best = mk; } }
    if(best) return 'retreat';
  }
  return 'patrol';
}

function updateBot(b, dt){
  /* —— 倒地：缓慢爬向最近的存活队友，方便被救（不再原地躺平） —— */
  if(b.downed){
    b.downedT += dt;
    let ally = null, ad = 1e9;
    for(const c of characters){
      if(c === b || c.team !== b.team || !c.alive || c.downed) continue;
      const d = b.group.position.distanceTo(c.group.position);
      if(d < ad){ ad = d; ally = c; }
    }
    if(ally){
      const dx = ally.group.position.x - b.group.position.x;
      const dz = ally.group.position.z - b.group.position.z;
      const d = Math.hypot(dx, dz);
      if(d > 1.3){                                  // 还没贴到队友就继续爬
        const crawl = 1.5;
        b.group.position.x += dx / d * crawl * dt;
        b.group.position.z += dz / d * crawl * dt;
        resolveCollision(b.group.position);
        // 注意：倒地模型已绕 X 轴躺平(rotation.x≈π/2)，此处绝不改 rotation.y，
        // 否则躺平的身子会绕竖轴像陀螺一样高速自转（视觉上像开挂）
      }
    }
    return;
  }
  if(b.reloading){ b.reloadT -= dt; if(b.reloadT <= 0) finishReload(b); }
  ensureNav();

  /* —— 5.1 感知 —— */
  const enemy = perceive(b, dt);                    // 当前可见敌人或 null
  const nd = enemy ? b.group.position.distanceTo(enemy.group.position) : 1e9;
  const dtm = nearestDownedTeammate(b);
  b.aiTarget = enemy;                               // 给掷雷逻辑用方向

  /* —— 5.2 状态决策 —— */
  const state = decideState(b, enemy, dtm, nd);
  b.aiState = state;
  if(!enemy) b._lostT = (b._lostT || 0) + dt;       // 丢失目标计时

  /* —— 5.3 选目标点 + 速度 + 行为 —— */
  let goal = null, speed = 4, fireTarget = null, strafe = false;
  switch(state){
    case 'revive':
      // 已在救援范围(3.2m)内：原地站定救人，绝不再追着「正在爬动的倒地队友」跑，
      // 否则目标点每帧甩动 → 救援者朝向狂摆 → 看着像高速自转开挂
      if(dtm.d <= REVIVE_RANGE){ goal = b.group.position.clone(); speed = 0; }
      else { goal = dtm.ch.group.position; speed = 4.5; }
      break;
    case 'chase':
      goal = enemy.group.position; speed = 5.2 * (b.pushMul || 1);
      fireTarget = enemy;
      break;
    case 'flank': {
      goal = flankPoint(b, enemy.group.position); speed = 5.0;
      fireTarget = enemy;
      break; }
    case 'fight':
      // 维持在 fightRange 附近：远了压上、近了后撤、否则侧移
      goal = enemy.group.position; speed = 4.6;
      fireTarget = enemy; strafe = true;
      break;
    case 'cover': {
      const cv = bestCover(b, enemy.group.position) || enemy.group.position;
      goal = cv; speed = 5.0; fireTarget = enemy;
      break; }
    case 'retreat': {
      let best = null, bd = 1e9;
      for(const mk of medkits){ if(!mk.active) continue; const d = b.group.position.distanceTo(mk.pos); if(d < bd){ bd = d; best = mk; } }
      goal = best ? best.pos : (enemy ? enemy.group.position : patrolPoint());
      speed = 5.5;
      break; }
    case 'search':
      goal = b.lastSeen; speed = 4.5;
      break;
    case 'patrol':
    default:
      if(!b.moveTarget || b.group.position.distanceTo(b.moveTarget) < 2.5) b.moveTarget = patrolPoint();
      goal = b.moveTarget; speed = 3.4;
      break;
  }

  /* —— 5.3b 下包 / 拆包目标（覆盖普通目标；附近有敌人则优先战斗） —— */
  const brole = b.team ? bombRoleOf(b.team) : null;
  if(brole==='T' && !bomb.planted && (!enemy || nd>24)){
    const st = nearestSite(b.group.position);
    if(st){ goal = st.site.pos.clone(); speed = 4.5;
      if(st.d <= BOMB_PLANT_R){ b.bombProg = (b.bombProg||0) + dt; if(b.bombProg>=PLANT_TIME) plantBomb(st.site, b.team); }
      else b.bombProg = 0; }
  } else if(brole==='CT' && bomb.planted && bomb.pos && (!enemy || nd>24)){
    const db = b.group.position.distanceTo(bomb.pos);
    if(db <= BOMB_DEFUSE_R){ b.bombProg = (b.bombProg||0) + dt; if(b.bombProg>=DEFUSE_TIME) defuseBomb(b.team); goal = null; }
    else { goal = bomb.pos.clone(); speed = 5; }
  }
  if(!goal){ goal = b.group.position.clone(); speed = 0; }   // 拆弹中：原地不动

  /* —— 5.4 路径重算（节流） —— */
  b.pathTimer = (b.pathTimer || 0) - dt;
  const goalMoved = b.pathGoal && goal.distanceTo(b.pathGoal) > AI_CFG.REPATH_MOVE;
  const repath = !b.path || b.pathIdx >= (b.path ? b.path.length : 0) || b.pathTimer <= 0 || goalMoved || b.pathState !== state;
  if(repath){
    planTo(b, goal.x, goal.z, state);
    b.pathTimer = (state === 'chase' || state === 'flank' || state === 'retreat') ? AI_CFG.REPATH_CHASE : AI_CFG.REPATH_OTHER;
  }

  /* —— 5.5 合成移动向量（寻路 + 分离 + 侧移） —— */
  let mvx = 0, mvz = 0;
  if(b.path && b.pathIdx < b.path.length){
    const wp = b.path[b.pathIdx];
    const dx = wp.x - b.group.position.x, dz = wp.z - b.group.position.z;
    const d = Math.hypot(dx, dz);
    if(d < AI_CFG.WP_REACH) b.pathIdx++;
    if(d > 0.001){ mvx = dx / d; mvz = dz / d; }
  }
  if(b.pathIdx >= (b.path ? b.path.length : 0)) b.pathTimer = 0;   // 到站→下帧重算追移动目标

  const sep = separation(b);
  mvx += sep.x * 0.8; mvz += sep.z * 0.8;

  // 交火时的横向走位（让bot成为更难打的移动靶）
  if(strafe && enemy){
    b.strafeT = (b.strafeT || 0) - dt;
    if(b.strafeT <= 0){ b.strafeT = AI_CFG.STRAFE_SWITCH; b.strafeSign = (b.strafeSign === 1) ? -1 : 1; }
    const dx = enemy.group.position.x - b.group.position.x, dz = enemy.group.position.z - b.group.position.z;
    const d = Math.hypot(dx, dz) || 1;
    const px = -dz / d, pz = dx / d;               // 垂直方向
    mvx += px * (b.strafeSign || 1) * 0.9;
    mvz += pz * (b.strafeSign || 1) * 0.9;
  }

  // fight 状态：远了压上 / 近了后撤（微调，不覆盖寻路主体）
  if(state === 'fight' && enemy){
    const fr = b.fightRange || 13;
    if(nd > fr + 3)      { mvx += (enemy.group.position.x - b.group.position.x) / (nd || 1) * 0.6; mvz += (enemy.group.position.z - b.group.position.z) / (nd || 1) * 0.6; }
    else if(nd < fr - 3) { mvx -= (enemy.group.position.x - b.group.position.x) / (nd || 1) * 0.6; mvz -= (enemy.group.position.z - b.group.position.z) / (nd || 1) * 0.6; }
  }

  const vl = Math.hypot(mvx, mvz);
  if(vl > 0.001){
    mvx /= vl; mvz /= vl;
    b.group.position.x += mvx * speed * dt;
    b.group.position.z += mvz * speed * dt;
  }

  /* —— 5.6 卡死自救 —— */
  b._stuckAcc = (b._stuckAcc || 0) + b.group.position.distanceTo(b._stuckPrev || b.group.position);
  if(!b._stuckPrev) b._stuckPrev = b.group.position.clone();
  b._stuckWin = (b._stuckWin || 0) + dt;
  if(b._stuckWin >= AI_CFG.STUCK_WINDOW){
    if(b._stuckAcc < AI_CFG.STUCK_DIST && enemy){     // 想动却没动 → 强制重规划 + 随机抖
      b.path = null; b.pathTimer = 0;
      b.group.position.x += (Math.random() - 0.5) * 1.5;
      b.group.position.z += (Math.random() - 0.5) * 1.5;
    }
    b._stuckAcc = 0; b._stuckWin = 0;
  }
  b._stuckPrev.copy(b.group.position);

  /* —— 5.7 朝向 —— */
  if((state === 'chase' || state === 'flank' || state === 'fight' || state === 'cover') && enemy && nd < 24){
    // 战斗时面向敌人（保证枪口对准）
    b.yaw = Math.atan2(enemy.group.position.x - b.group.position.x, enemy.group.position.z - b.group.position.z);
  } else if(vl > 0.05){        // 仅在移动向量足够大时更新朝向，避免静止时数值抖动造成自转
    b.yaw = Math.atan2(mvx, mvz);
  }

  /* —— 5.8 行为动作 —— */
  if(state === 'revive'){
    if(dtm.d <= REVIVE_RANGE) tickRevive(dtm.ch, dt, b);
  } else if(fireTarget){
    botTryFire(b, fireTarget, nd, dt);
  }

  resolveCollision(b.group.position);
  b.group.position.y = 0;
  b.group.rotation.y = b.yaw;
}

/* ============================================================
   [6] 调试可视化（可选，不影响正常游玩）
   在控制台执行 window.__CS_AI_DEBUG=true 后刷新即可看到
   导航网格阻挡格(暗红)与掩体点(黄)的调试标记。
   ============================================================ */
function buildAIDebug(){
  if(!navGrid || window.__CS_AIDebug !== true) return;
  const grp = new THREE.Group(); grp.name = 'aiDebug';
  const blockedMat = new THREE.MeshBasicMaterial({ color: 0x882222, transparent: true, opacity: 0.25 });
  const cell = NAV_CELL;
  for(let j = 0; j < NAV_N; j++) for(let i = 0; i < NAV_N; i++){
    if(!navBlocked(i, j)) continue;
    const m = new THREE.Mesh(new THREE.BoxGeometry(cell * 0.9, 0.2, cell * 0.9), blockedMat);
    m.position.set(_navWX(i), 0.1, _navWZ(j)); grp.add(m);
  }
  scene.add(grp);
}
// 场景就绪后挂载一次
if(typeof scene !== 'undefined'){
  const _t = setInterval(() => {
    if(sceneReady && navBuilt && !window.__aiDebugDone){
      window.__aiDebugDone = true; buildAIDebug(); clearInterval(_t);
    }
  }, 500);
}
