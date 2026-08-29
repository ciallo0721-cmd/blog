"use strict";
/* ============================================================
   HRAI · Shader.js — 着色器模块（GLSL / ShaderMaterial，暗色版）
   只放着色器代码与材质工厂，供主逻辑 CS.js 调用。
   压暗处理：漫反射下限从 0.5 降到 0.32，亮度系数约 7 成，
   配合浓雾实现低亮度、短视距的恐怖氛围（可辨物，不瞎眼）。
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

/* ---------- 片元着色器：马赛克块化 + SVG 纹理采样 + tint 混合 + 简易漫反射（暗色） ---------- */
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
  // 简易漫反射：环境下限 0.42（暗色恐怖但清晰可辨）
  vec3 N = normalize(vNormal);
  if(!gl_FrontFacing) N = -N;
  float diff = 0.42 + 0.5 * max(dot(N, normalize(lightDir)), 0.0);
  // 亮度系数：0.55 + 0.38*lum（接近原版亮度，保留做旧感）
  float lum = dot(tex.rgb, vec3(0.333));
  vec3 col = tint * (0.55 + 0.38 * lum) * diff;
  gl_FragColor = vec4(col, 1.0);
}
`;

/* ---------- 平滑片元着色器：直接采样纹理（无马赛克块化），供圆柱/墙壁使用（暗色） ---------- */
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
  float diff = 0.42 + 0.5 * max(dot(N, normalize(lightDir)), 0.0);
  float lum = dot(tex.rgb, vec3(0.333));
  vec3 col = tint * (0.55 + 0.38 * lum) * diff;
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
      lightDir: { value: new THREE.Vector3(0.3, 0.55, 0.25).normalize() }
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
      lightDir: { value: new THREE.Vector3(0.3, 0.55, 0.25).normalize() },
      cellSize: { value: 1 / (cells || 8) }
    },
    vertexShader: CS_VERT,
    fragmentShader: CS_FRAG,
    side: THREE.DoubleSide   // 围墙/圆柱从内部也要可见（玩家在盒子内部）
  });
}
