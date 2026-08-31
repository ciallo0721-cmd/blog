"use strict";
/* ============================================================
   CS · Shader.js — 着色器模块（GLSL / ShaderMaterial）
   只放着色器代码与材质工厂，供主逻辑 CS.js 调用。
   ============================================================ */

/* ---------- 顶点着色器：传递 UV / 法线 ---------- */
const CS_VERT = `
varying vec2 vUv;
varying vec3 vNormal;
void main(){
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/* ---------- 片元着色器：马赛克块化 + SVG 纹理采样 + tint 混合 + 简易漫反射 ---------- */
const CS_FRAG = `
precision highp float;
varying vec2 vUv;
varying vec3 vNormal;
uniform sampler2D map;
uniform vec3 tint;
uniform vec3 lightDir;
uniform float cellSize;   // 马赛克格子大小（UV 坐标，如 1/8）

void main(){
  // 块化：取当前格子中心的 UV，做出方块马赛克感
  vec2 cell = floor(vUv / cellSize) * cellSize + cellSize * 0.5;
  vec4 tex = texture2D(map, cell);
  // 简易漫反射（带 ambient 下限 0.5，避免围墙/圆柱侧面背光时输出接近黑色）
  // gl_FrontFacing：双面渲染时背面法线自动翻转，保证围墙内壁光照方向正确
  vec3 N = normalize(vNormal);
  if(!gl_FrontFacing) N = -N;
  float diff = 0.5 + 0.5 * max(dot(N, normalize(lightDir)), 0.0);
  // 纹理当亮度图调制 + tint 决定色彩（关键修复：原写法 tex.rgb*tint 在 tint 是浅色时会乘法压暗成深蓝灰）
  float lum = dot(tex.rgb, vec3(0.333));
  vec3 col = tint * (0.55 + 0.45 * lum) * diff;
  gl_FragColor = vec4(col, 1.0);
}
`;

/* ---------- 平滑片元着色器：直接采样纹理（无马赛克块化），供圆柱/墙壁使用 ---------- */
const CS_FRAG_SMOOTH = `
precision highp float;
varying vec2 vUv;
varying vec3 vNormal;
uniform sampler2D map;
uniform vec3 tint;
uniform vec3 lightDir;

void main(){
  vec4 tex = texture2D(map, vUv);
  vec3 N = normalize(vNormal);
  if(!gl_FrontFacing) N = -N;
  float diff = 0.5 + 0.5 * max(dot(N, normalize(lightDir)), 0.0);
  float lum = dot(tex.rgb, vec3(0.333));
  vec3 col = tint * (0.55 + 0.45 * lum) * diff;
  gl_FragColor = vec4(col, 1.0);
}
`;

/* ---------- 卡通着色片元着色器：光照色阶量化（三档 hard shading）+ 轻微描边感 ----------
   和马赛克着色器同款 tint 调色思路，但光照按 0.35/0.65/1.0 三档量化，出赛璐璐卡通感 */
const CS_FRAG_TOON = `
precision highp float;
varying vec2 vUv;
varying vec3 vNormal;
uniform sampler2D map;
uniform vec3 tint;
uniform vec3 lightDir;

void main(){
  vec4 tex = texture2D(map, vUv);
  vec3 N = normalize(vNormal);
  if(!gl_FrontFacing) N = -N;
  float diff = max(dot(N, normalize(lightDir)), 0.0);
  // 三档色阶量化 → 卡通 hard shading
  diff = diff < 0.35 ? 0.35 : (diff < 0.7 ? 0.65 : 1.0);
  float lum = dot(tex.rgb, vec3(0.333));
  vec3 col = tint * (0.5 + 0.5 * lum) * diff;
  gl_FragColor = vec4(col, 1.0);
}
`;

/* ---------- 扫描线复古片元着色器：CRT 阴极射线管风（横向扫描线 + 轻微暗角） ----------
   gl_FragCoord 是屏幕像素坐标，扫描线随屏幕不随物体 → 真·CRT 显示器质感 */
const CS_FRAG_CRT = `
precision highp float;
varying vec2 vUv;
varying vec3 vNormal;
uniform sampler2D map;
uniform vec3 tint;
uniform vec3 lightDir;
uniform vec2 uRes;      // 渲染分辨率（用于扫描线密度与暗角）

void main(){
  vec4 tex = texture2D(map, vUv);
  vec3 N = normalize(vNormal);
  if(!gl_FrontFacing) N = -N;
  float diff = 0.55 + 0.45 * max(dot(N, normalize(lightDir)), 0.0);
  float lum = dot(tex.rgb, vec3(0.333));
  vec3 col = tint * (0.55 + 0.45 * lum) * diff;
  // CRT 扫描线：每 3 条像素线压暗一次
  float scan = 0.85 + 0.15 * step(1.5, mod(gl_FragCoord.y, 3.0));
  col *= scan;
  // 轻微暗角（离屏幕中心越远越暗）
  vec2 ndc = gl_FragCoord.xy / uRes * 2.0 - 1.0;
  float vig = 1.0 - 0.25 * dot(ndc, ndc);
  col *= vig;
  gl_FragColor = vec4(col, 1.0);
}
`;

/* ---------- 平滑材质工厂（无马赛克，直接采样贴图 UV） ----------
   tex      : SVG 纹理（assets/screen/*.svg）
   tintHex  : 0xRRGGBB 叠加色 */
function makeSmoothMaterial(tex, tintHex){
  return new THREE.ShaderMaterial({
    uniforms: {
      map:      { value: tex },
      tint:     { value: new THREE.Color(tintHex) },
      lightDir: { value: new THREE.Vector3(0.45, 0.75, 0.35).normalize() }
    },
    vertexShader: CS_VERT,
    fragmentShader: CS_FRAG_SMOOTH,
    side: THREE.DoubleSide   // 围墙/圆柱从内部也要可见（玩家在盒子内部）
  });
}

/* ---------- 马赛克 ShaderMaterial 工厂 ----------
   tex      : SVG 纹理（assets/screen/*.svg）
   tintHex  : 0xRRGGBB 叠加色
   cells    : 纹理每行格子数（决定 cellSize） */
function makeMosaicMaterial(tex, tintHex, cells){
  return new THREE.ShaderMaterial({
    uniforms: {
      map:      { value: tex },
      tint:     { value: new THREE.Color(tintHex) },
      lightDir: { value: new THREE.Vector3(0.45, 0.75, 0.35).normalize() },
      cellSize: { value: 1 / (cells || 8) }
    },
    vertexShader: CS_VERT,
    fragmentShader: CS_FRAG,
    side: THREE.DoubleSide   // 围墙/圆柱从内部也要可见（玩家在盒子内部）
  });
}

/* ---------- 卡通材质工厂（三档色阶 hard shading） ---------- */
function makeToonMaterial(tex, tintHex){
  return new THREE.ShaderMaterial({
    uniforms: {
      map:      { value: tex },
      tint:     { value: new THREE.Color(tintHex) },
      lightDir: { value: new THREE.Vector3(0.45, 0.75, 0.35).normalize() }
    },
    vertexShader: CS_VERT,
    fragmentShader: CS_FRAG_TOON,
    side: THREE.DoubleSide
  });
}

/* ---------- 扫描线 CRT 材质工厂（复古显示器风） ----------
   uRes 跟随渲染分辨率：窗口 resize 时由 CS.js 的 syncShaderRes() 统一刷新 */
const _crtMats = [];
function makeScanMaterial(tex, tintHex){
  const m = new THREE.ShaderMaterial({
    uniforms: {
      map:      { value: tex },
      tint:     { value: new THREE.Color(tintHex) },
      lightDir: { value: new THREE.Vector3(0.45, 0.75, 0.35).normalize() },
      uRes:     { value: new THREE.Vector2(960, 540) }
    },
    vertexShader: CS_VERT,
    fragmentShader: CS_FRAG_CRT,
    side: THREE.DoubleSide
  });
  _crtMats.push(m);
  return m;
}
function syncShaderRes(w, h){
  for(const m of _crtMats){ m.uniforms.uRes.value.set(w, h); }
}
