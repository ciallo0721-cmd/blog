"use strict";
/* ============================================================
   CS · ai.js — 敌人 AI 状态机
   （patrol 巡逻 / chase 追击 / revive 救人）
   ============================================================ */
function updateBot(b,dt){
  if(b.downed){ b.downedT+=dt; return; }   // 倒地 AI：躺平等队友救
  if(b.reloading){ b.reloadT-=dt; if(b.reloadT<=0)finishReload(b); }
  // 找最近的倒地队友（去救）与最近的敌人
  let dTarget=null,dd=1e9;
  for(const c of characters){ if(c.team!==b.team||!c.downed)continue; const d=b.group.position.distanceTo(c.group.position); if(d<dd){dd=d;dTarget=c;} }
  let near=null,nd=1e9;
  for(const c of characters){ if(c===b||!c.alive||c.downed||c.team===b.team)continue; const d=b.group.position.distanceTo(c.group.position); if(d<nd){nd=d;near=c;} }
  b.aiTarget=near;
  if(dTarget && dd<40 && (nd>18||!near)){
    // 救人优先（没贴脸敌人时才救；救人时不能开枪，正好可以被偷袭）
    b.aiState='revive';
    const tx=dTarget.group.position.x-b.group.position.x, tz=dTarget.group.position.z-b.group.position.z, ang=Math.atan2(tx,tz);
    b.yaw=ang;
    if(dd>REVIVE_RANGE){ b.group.position.x+=Math.sin(ang)*4.5*dt; b.group.position.z+=Math.cos(ang)*4.5*dt; }
    else tickRevive(dTarget,dt,b);
  } else if(near&&nd<34){
    b.aiState='chase';
    const tx=near.group.position.x-b.group.position.x, tz=near.group.position.z-b.group.position.z, ang=Math.atan2(tx,tz);
    b.yaw=ang; let mv=0; if(nd>12)mv=1; else if(nd<6)mv=-1;
    b.group.position.x+=Math.sin(ang)*mv*5*dt; b.group.position.z+=Math.cos(ang)*mv*5*dt;
    if(!b.reloading){
      b.aiTimer-=dt;
      if(b.ammo[b.weapon]<=0)startReload(b);
      else if(b.aiTimer<=0){ b.aiTimer=(b.weapon==='ak')?0.22:0.5; botFire(b,near); }
      if(nd<9&&b.ammo.grenade>0&&Math.random()<0.012) throwGrenade(b);
    }
  } else {
    b.aiState='patrol';
    if(!b.moveTarget||b.group.position.distanceTo(b.moveTarget)<2) b.moveTarget=new THREE.Vector3((Math.random()-0.5)*50,0,(Math.random()-0.5)*50);
    const tx=b.moveTarget.x-b.group.position.x, tz=b.moveTarget.z-b.group.position.z, ang=Math.atan2(tx,tz);
    b.yaw=ang; b.group.position.x+=Math.sin(ang)*4*dt; b.group.position.z+=Math.cos(ang)*4*dt;
  }
  resolveCollision(b.group.position); b.group.position.y=0; b.group.rotation.y=b.yaw;
}
