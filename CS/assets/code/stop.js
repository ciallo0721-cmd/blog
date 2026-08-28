"use strict";
/* ============================================================
   CS · stop.js — 暂停 / 灵敏度 / 分享
   ============================================================ */
let sensitivity = 0.0024;   // 由暂停菜单滑块调节
let paused = false;

function togglePause(){
  if(matchOver||!running) return;   // 结算/开始界面不响应 Esc、`、暂停按钮
  if(layoutEditing) return;         // 手指键位编辑态：保持界面干净，Esc 不弹设置
  const _kp=el('keyPanel'); if(_kp && !_kp.classList.contains('hide')) return;  // 键位面板开着时 Esc 只关面板
  paused=!paused;
  if(paused){ el('pause').classList.remove('hide');
    if(document.pointerLockElement===cv) document.exitPointerLock(); }
  else { el('pause').classList.add('hide'); if(!isPhone) cv.requestPointerLock(); }
}
// 从暂停设置返回开始界面（清空残局）
function quitToMenu(){
  if(layoutEditing) return;   // 编辑手指键位时不允许退回开始界面（会盖住触控层）
  if(document.pointerLockElement===cv) document.exitPointerLock();
  paused=false; running=false; matchOver=false;
  el('pause').classList.add('hide');
  el('victory').classList.add('hide');
  for(const c of characters) respawnChar(c);
  blueScore=0; redScore=0;
  el('overlay').classList.remove('hide');
  el('startBtn').textContent='点击开始';
  updateHUD();
}
function shareGame(){
  const url=location.href;
  const intro='【fy_iceworld · 5v5 团队死斗】蓝白冰原竞技场上的快节奏射击对战：你操控角色,和 AI 队友组队 5v5,用柱子掩体周旋、倒地可爬可向队友求救、场地医疗箱回血。点开即玩,无需下载:\n'+url;
  if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(intro).then(()=>toast('已复制分享文案+链接'),()=>toast('复制失败')); }
  else toast(intro);
}
el('pauseBtn').addEventListener('click', togglePause);
el('shareBtn').addEventListener('click', shareGame);
el('resumeBtn').addEventListener('click', togglePause);
el('shareBtn2').addEventListener('click', shareGame);
el('againBtn').addEventListener('click', resetMatch);
el('quitBtn').addEventListener('click', quitToMenu);

// 灵敏度旋钮
const sensInput=el('sens'), sensVal=el('sensVal');
function applySens(){ const mul=parseFloat(sensInput.value); sensitivity=0.001*mul; sensVal.textContent=mul.toFixed(1); }
sensInput.addEventListener('input', applySens); applySens();

// 渲染模式切换（js 实时纹理 / svg 贴图）
const texModeBtn=el('texModeBtn');
function applyTexModeLabel(){
  const isSvg = localStorage.getItem('csTexMode')==='svg';
  texModeBtn.textContent = isSvg ? 'svg贴图渲染(轻量)' : 'js实时渲染(清晰)';
}
texModeBtn.addEventListener('click', ()=>{
  const next = localStorage.getItem('csTexMode')==='svg' ? 'js' : 'svg';
  localStorage.setItem('csTexMode', next);
  location.reload();
});
applyTexModeLabel();

// 着色器选择（webgl 程序化 GLSL / three.js 标准 PBR 材质）
const shaderModeBtn=el('shaderModeBtn');
function applyShaderModeLabel(){
  const isThree = localStorage.getItem('csShaderMode')==='three';
  shaderModeBtn.textContent = isThree ? 'three.js 标准材质' : 'webgl 程序化着色';
}
shaderModeBtn.addEventListener('click', ()=>{
  const next = localStorage.getItem('csShaderMode')==='three' ? 'webgl' : 'three';
  localStorage.setItem('csShaderMode', next);
  location.reload();
});
applyShaderModeLabel();
