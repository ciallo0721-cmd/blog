"""生成 15 种不同颜色/标签的 SVG 广告占位图"""
import os

ADS = [
    {"id": "game",    "tag": "游戏",   "icon": "🎮", "color1": "#FF4757", "color2": "#FF6B81"},
    {"id": "tool",    "tag": "工具",   "icon": "🛠️", "color1": "#FF6B35", "color2": "#FF9F6E"},
    {"id": "edu",     "tag": "教育",   "icon": "📚", "color1": "#FFD93D", "color2": "#FFE97A"},
    {"id": "design",  "tag": "设计",   "icon": "🎨", "color1": "#2ED573", "color2": "#7BED9F"},
    {"id": "music",   "tag": "音乐",   "icon": "🎵", "color1": "#1E90FF", "color2": "#63B3FF"},
    {"id": "code",    "tag": "编程",   "icon": "💻", "color1": "#3366FF", "color2": "#7094FF"},
    {"id": "ai",      "tag": "AI智能", "icon": "🤖", "color1": "#7C3AED", "color2": "#A78BFA"},
    {"id": "app",     "tag": "应用",   "icon": "📱", "color1": "#E040FB", "color2": "#F48FB1"},
    {"id": "video",   "tag": "影视",   "icon": "🎬", "color1": "#FF4081", "color2": "#FF80AB"},
    {"id": "read",    "tag": "阅读",   "icon": "📖", "color1": "#8D6E63", "color2": "#BCAAA4"},
    {"id": "shop",    "tag": "购物",   "icon": "🛒", "color1": "#FF6D00", "color2": "#FFAB40"},
    {"id": "health",  "tag": "健康",   "icon": "🏃", "color1": "#76FF03", "color2": "#B2FF59"},
    {"id": "product", "tag": "效率",   "icon": "🎯", "color1": "#00BCD4", "color2": "#4DD0E1"},
    {"id": "social",  "tag": "社交",   "icon": "🌍", "color1": "#FF6E6E", "color2": "#FF9E9E"},
    {"id": "fun",     "tag": "娱乐",   "icon": "🎲", "color1": "#FF408C", "color2": "#FF79B0"},
]

TEMPLATE = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 728 90" width="728" height="90">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{color1};stop-opacity:0.9"/>
      <stop offset="100%" style="stop-color:{color2};stop-opacity:0.9"/>
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0)"/>
      <stop offset="50%" style="stop-color:rgba(255,255,255,0.15)"/>
      <stop offset="100%" style="stop-color:rgba(255,255,255,0)"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="728" height="90" rx="10" fill="url(#bg)"/>
  <!-- 网格装饰 -->
  <g opacity="0.06" stroke="white" stroke-width="0.5">
    <line x1="0" y1="18" x2="728" y2="18"/><line x1="0" y1="36" x2="728" y2="36"/>
    <line x1="0" y1="54" x2="728" y2="54"/><line x1="0" y1="72" x2="728" y2="72"/>
    <line x1="91" y1="0" x2="91" y2="90"/><line x1="182" y1="0" x2="182" y2="90"/>
    <line x1="273" y1="0" x2="273" y2="90"/><line x1="364" y1="0" x2="364" y2="90"/>
    <line x1="455" y1="0" x2="455" y2="90"/><line x1="546" y1="0" x2="546" y2="90"/>
    <line x1="637" y1="0" x2="637" y2="90"/>
  </g>
  <!-- 扫光动画 -->
  <rect x="-200" y="0" width="250" height="90" fill="url(#shine)">
    <animate attributeName="x" from="-300" to="728" dur="4s" repeatCount="indefinite"/>
  </rect>
  <!-- 图标区域 -->
  <g transform="translate(50,45)" filter="url(#glow)">
    <circle cx="0" cy="0" r="24" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
    <text x="0" y="8" font-size="22" text-anchor="middle" fill="white">{icon}</text>
  </g>
  <!-- 主标题 -->
  <text x="364" y="38" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-size="19" font-weight="700" fill="white" text-anchor="middle" letter-spacing="3">
    {tag} · 广告位招租
  </text>
  <!-- 副标题 -->
  <text x="364" y="64" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-size="12" fill="rgba(255,255,255,0.75)" text-anchor="middle" letter-spacing="1">
    点击了解广告投放详情
    <animate attributeName="opacity" values="1;0.5;1" dur="2.5s" repeatCount="indefinite"/>
  </text>
  <!-- 角标 -->
  <rect x="620" y="8" width="100" height="22" rx="11" fill="rgba(255,255,255,0.2)"/>
  <text x="670" y="23" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-size="10" fill="white" text-anchor="middle">SPONSOR</text>
</svg>'''

out_dir = os.path.dirname(os.path.abspath(__file__))
for ad in ADS:
    svg = TEMPLATE.format(**ad)
    path = os.path.join(out_dir, f"ad-{ad['id']}.svg")
    with open(path, "w", encoding="utf-8") as f:
        f.write(svg)
    print(f"✓ {ad['tag']}: {os.path.basename(path)}")

print(f"\n生成完毕！共 {len(ADS)} 个 SVG 文件。")
