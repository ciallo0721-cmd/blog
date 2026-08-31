"use strict";
/* ============================================================
   CS · qai.js — 超级AI（Q-learning 推理端）
   Q表由 cs-train/train.py 训练生成，输出到 qlearning.json（根目录）
   或 assets/Q/qlearning.json（本目录），两者都认。
   JS 端只做推理（ε-greedy 小随机），训练全部在 Python 端完成。

   状态空间（36 态）：hp档(3) × 敌距档(3) × 有无视线(2) × 有无倒地队友(2)
   动作空间（7 个）：patrol / chase / fight / cover / retreat / flank / search
   （与 ai.js 状态机状态一一对应，qPick 返回的动作直接覆盖 AI 决策）
   ============================================================ */
const QA = {
  Q: {},            // { "stateKey": [7个动作的Q值], ... }
  ready: false,
  eps: 0.06,        // 对局内保留 6% 随机探索，避免太死板
  ACTIONS: ['patrol','chase','fight','cover','retreat','flank','search'],
  src: '未知'
};
(function loadQ(){
  const urls = ['assets/Q/qlearning.json', 'qlearning.json', '../qlearning.json'];
  const tryNext = (i) => {
    if(i >= urls.length) return;
    fetch(urls[i]).then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => {
        QA.Q = (d && d.Q) ? d.Q : (d || {});
        QA.ready = Object.keys(QA.Q).length > 0;
        QA.src = urls[i];
        if(typeof console !== 'undefined') console.log('[qai] Q表已载入: '+urls[i]+' · '+Object.keys(QA.Q).length+' 态');
      })
      .catch(() => tryNext(i+1));
  };
  try{ tryNext(0); }catch(e){}
})();

/* 状态离散化：hp档 × 敌距档 × 视线 × 倒地队友 → 4位字符串键 */
function qStateKey(b){
  const hpT = b.hp > 66 ? 2 : (b.hp > 33 ? 1 : 0);
  const d = (typeof b._perceiveDist === 'number') ? b._perceiveDist : 1e9;
  const dT = d < 25 ? 2 : (d < 60 ? 1 : 0);
  const los = (b.target && !b.target.downed && b.target.alive &&
               typeof hasLOS==='function' && hasLOS(b.group.position, b.target.group.position)) ? 1 : 0;
  const mate = (typeof nearestDownedTeammate==='function' && nearestDownedTeammate(b)) ? 1 : 0;
  return '' + hpT + dT + los + mate;
}

/* ε-greedy 选动作；Q表缺失/未载入时返回 null（退回原状态机决策） */
function qPick(b){
  if(!QA.ready) return null;
  const row = QA.Q[qStateKey(b)];
  if(!row || !row.length || row.length !== QA.ACTIONS.length) return null;
  let ai = 0;
  if(Math.random() < QA.eps){
    ai = (Math.random() * QA.ACTIONS.length) | 0;
  } else {
    for(let i = 1; i < row.length; i++) if(row[i] > row[ai]) ai = i;
  }
  return QA.ACTIONS[ai] || null;
}
