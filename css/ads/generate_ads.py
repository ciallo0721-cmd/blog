"""生成 15 种精美 SVG 广告图（专业设计版 v3）"""
import os

ADS = [
    {"id": "game",    "tag": "游戏",   "icon": "🎮", "c1": "#FF4757", "c2": "#FF6B81"},
    {"id": "tool",    "tag": "工具",   "icon": "🛠️", "c1": "#FF6B35", "c2": "#FF9F6E"},
    {"id": "edu",     "tag": "教育",   "icon": "📚", "c1": "#F39C12", "c2": "#F8C471"},
    {"id": "design",  "tag": "设计",   "icon": "🎨", "c1": "#27AE60", "c2": "#7DCEA0"},
    {"id": "music",   "tag": "音乐",   "icon": "🎵", "c1": "#2980B9", "c2": "#7FB3D5"},
    {"id": "code",    "tag": "编程",   "icon": "💻", "c1": "#1E5FCC", "c2": "#5DADE2"},
    {"id": "ai",      "tag": "AI智能", "icon": "🤖", "c1": "#6C3FC4", "c2": "#B39DDB"},
    {"id": "app",     "tag": "应用",   "icon": "📱", "c1": "#C2185B", "c2": "#F48FB1"},
    {"id": "video",   "tag": "影视",   "icon": "🎬", "c1": "#D81B60", "c2": "#F48FB1"},
    {"id": "read",    "tag": "阅读",   "icon": "📖", "c1": "#6D4C41", "c2": "#A1887F"},
    {"id": "shop",    "tag": "购物",   "icon": "🛒", "c1": "#E65100", "c2": "#FFB74D"},
    {"id": "health",  "tag": "健康",   "icon": "🏃", "c1": "#4CAF50", "c2": "#A5D6A7"},
    {"id": "product", "tag": "效率",   "icon": "🎯", "c1": "#00838F", "c2": "#4DD0E1"},
    {"id": "social",  "tag": "社交",   "icon": "🌍", "c1": "#E74C3C", "c2": "#F1948A"},
    {"id": "fun",     "tag": "娱乐",   "icon": "🎲", "c1": "#C2185B", "c2": "#F48FB1"},
]

TEMPLATE = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 728 90" width="728" height="90" font-family="&#39;PingFang SC&#39;,&#39;Microsoft YaHei&#39;,sans-serif">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{c1}"/>
      <stop offset="100%" stop-color="{c2}"/>
    </linearGradient>
    <linearGradient id="panel" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.10)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.02)"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="50%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.20)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
      <feOffset dy="2"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.25"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="728" height="90" fill="url(#bg)"/>
  <circle cx="100" cy="40" r="120" fill="url(#halo)"/>
  <circle cx="600" cy="-30" r="100" fill="url(#halo)" opacity="0.5"/>
  <circle cx="700" cy="100" r="80" fill="url(#halo)" opacity="0.4"/>
  <rect x="0" y="0" width="130" height="90" fill="url(#panel)"/>
  <rect x="130" y="0" width="1" height="90" fill="rgba(255,255,255,0.10)"/>
  <g transform="translate(45,45)" filter="url(#shadow)">
    <rect x="-26" y="-26" width="52" height="52" rx="14" fill="rgba(255,255,255,0.20)"/>
    <rect x="-26" y="-26" width="52" height="52" rx="14" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
    <text x="0" y="10" font-size="24" text-anchor="middle" fill="white">{icon}</text>
  </g>
  <text x="90" y="38" font-size="16" font-weight="800" fill="white" letter-spacing="1">{tag}</text>
  <text x="90" y="56" font-size="9" font-weight="500" fill="rgba(255,255,255,0.55)" letter-spacing="1.5">CATEGORY</text>
  <text x="148" y="40" font-size="22" font-weight="800" fill="white" letter-spacing="0.5">精选{tag}内容</text>
  <text x="148" y="58" font-size="11" font-weight="400" fill="rgba(255,255,255,0.75)">发现更多优质资源</text>
  <text x="148" y="74" font-size="9" font-weight="600" fill="#FFD700">限时推荐 · 热度飙升中</text>
  <g transform="translate(580,30)" filter="url(#shadow)">
    <rect x="0" y="0" width="120" height="30" rx="15" fill="rgba(255,255,255,0.95)"/>
    <text x="60" y="19" font-size="12" font-weight="700" fill="{c1}" text-anchor="middle" letter-spacing="0.5">查看详情 →</text>
  </g>
  <text x="708" y="14" font-size="8" fill="rgba(255,255,255,0.45)" text-anchor="end" letter-spacing="1">AD</text>
</svg>'''

out_dir = os.path.dirname(os.path.abspath(__file__))
for ad in ADS:
    # tname 广告是手写特制版，跳过自动生成
    if ad['id'] == 'tname':
        continue
    svg = TEMPLATE.format(**ad)
    path = os.path.join(out_dir, f"ad-{ad['id']}.svg")
    with open(path, "w", encoding="utf-8") as f:
        f.write(svg)
    print(f"✓ {ad['tag']}: {os.path.basename(path)}")

print(f"\n生成完毕！共 {len(ADS)} 个通用 SVG 文件（tname 手写）。")
