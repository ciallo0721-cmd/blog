"use strict";
/* ============================================================
   HRAI · all.js — JS 实时渲染纹理（Canvas 程序化生成，暗色版）
   替代 SVG 贴图模式（64x64 放大发糊）。切换开关在暂停界面。
   返回顺序与 CS.js initScene 参数一致：
   [mid, ally, enemy, wallIce, pillarIce, pillarStone, pillarRed]
   ============================================================ */

function CSGenTex(){
  const S = 256;                       // 纹理边长
  const M = THREE.LinearFilter;        // 高清模式：平滑插值

  function make(fn){
    const c = document.createElement('canvas'); c.width = S; c.height = S;
    fn(c.getContext('2d'));
    const t = new THREE.CanvasTexture(c);
    t.magFilter = M; t.minFilter = THREE.LinearMipmapLinearFilter;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.generateMipmaps = true; t.needsUpdate = true;
    return t;
  }

  /* 圆柱明暗渐变（横轴 = 绕柱一圈，中间亮两边暗） */
  function cylGrad(ctx, c0, c1, c2){
    const g = ctx.createLinearGradient(0, 0, S, 0);
    g.addColorStop(0.00, c0); g.addColorStop(0.25, c1);
    g.addColorStop(0.50, c2); g.addColorStop(0.75, c1);
    g.addColorStop(1.00, c0);
    return g;
  }

  /* ---------- 圆柱贴图（暗色提亮） ---------- */
  function pillarIce(ctx){
    ctx.fillStyle = cylGrad(ctx, '#5a6c82', '#8aa0b8', '#9ab0c8');
    ctx.fillRect(0, 0, S, S);
    // 冰晶竖纹
    ctx.strokeStyle = 'rgba(180,205,230,0.4)'; ctx.lineWidth = 3;
    for(const x of [24, 88, 150, 214]){
      ctx.beginPath(); ctx.moveTo(x, 30); ctx.lineTo(x, 226); ctx.stroke();
    }
    // 菱形冰晶
    ctx.fillStyle = 'rgba(180,205,230,0.35)';
    for(const [x,y] of [[40,64],[168,120],[104,176],[224,96]]){
      ctx.beginPath();
      ctx.moveTo(x, y-10); ctx.lineTo(x+10, y); ctx.lineTo(x, y+10); ctx.lineTo(x-10, y);
      ctx.closePath(); ctx.fill();
    }
    // 柱帽 / 柱基
    ctx.fillStyle = 'rgba(52,66,84,0.85)';
    ctx.fillRect(0, 0, S, 20); ctx.fillRect(0, S-20, S, 20);
    ctx.fillStyle = 'rgba(200,220,240,0.18)';
    ctx.fillRect(0, 0, S, 5);
  }
  function pillarStone(ctx){
    ctx.fillStyle = cylGrad(ctx, '#4a5c70', '#6a8096', '#7a90a6');
    ctx.fillRect(0, 0, S, S);
    // 石砖缝
    ctx.strokeStyle = 'rgba(30,42,56,0.9)'; ctx.lineWidth = 4;
    for(const y of [52, 108, 164, 220]){
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(S, y); ctx.stroke();
    }
    for(const x of [64, 192]){
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 52); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(S-x, 108); ctx.lineTo(S-x, 164); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, 220); ctx.lineTo(x, S); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(30,42,56,0.7)';
    ctx.fillRect(0, 0, S, 16); ctx.fillRect(0, S-16, S, 16);
  }
  function pillarRed(ctx){
    ctx.fillStyle = cylGrad(ctx, '#5a2424', '#8a4444', '#9a5454');
    ctx.fillRect(0, 0, S, S);
    // 红砖缝
    ctx.strokeStyle = 'rgba(30,8,8,0.95)'; ctx.lineWidth = 4;
    for(const y of [44, 100, 156, 212]){
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(S, y); ctx.stroke();
    }
    for(const x of [80, 208]){
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 44); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(S-x, 100); ctx.lineTo(S-x, 156); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, 212); ctx.lineTo(x, S); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(30,8,8,0.75)';
    ctx.fillRect(0, 0, S, 16); ctx.fillRect(0, S-16, S, 16);
  }

  /* ---------- 冰砖墙（交错砖缝，暗色） ---------- */
  function wallIce(ctx){
    ctx.fillStyle = '#55667e'; ctx.fillRect(0, 0, S, S);
    const colors = ['#6a7e96', '#5c7088', '#74889e'];
    const bw = 56, bh = 56, gap = 8;
    for(let r = 0; r < 4; r++){
      const off = r % 2 ? gap/2 + bw/2 : 0;
      for(let c = 0; c < 4; c++){
        ctx.fillStyle = colors[(r + c) % 3];
        ctx.fillRect(off + c * (bw + gap), r * (bh + gap), bw, bh);
      }
    }
    // 冰霜亮斑（微弱）
    ctx.fillStyle = 'rgba(190,215,235,0.22)';
    ctx.fillRect(16, 16, 24, 24); ctx.fillRect(144, 80, 20, 20);
    ctx.fillRect(80, 160, 28, 16); ctx.fillRect(192, 208, 20, 20);
  }

  /* ---------- 地面（8x8 大格，暗色做旧色块） ---------- */
  function ground(colors){
    return function(ctx){
      const cell = S / 8;
      for(let r = 0; r < 8; r++){
        for(let c = 0; c < 8; c++){
          const base = colors[(r * 7 + c * 3) % colors.length];
          // 轻微亮度抖动，做出旧感
          const f = 0.85 + Math.random() * 0.22;
          ctx.fillStyle = shade(base, f);
          ctx.fillRect(c * cell, r * cell, cell, cell);
        }
      }
    };
  }
  function shade(hex, f){
    const n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, Math.round(((n >> 16) & 255) * f));
    const g = Math.min(255, Math.round(((n >> 8) & 255) * f));
    const b = Math.min(255, Math.round((n & 255) * f));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  return [
    make(ground(['#4e6078', '#6a7e96', '#5c7088'])),   // mid
    make(ground(['#3d5068', '#5c7088', '#6a7e96'])),   // ally
    make(ground(['#6a7e96', '#556272', '#7a4444'])),   // enemy
    make(wallIce),
    make(pillarIce),
    make(pillarStone),
    make(pillarRed)
  ];
}
