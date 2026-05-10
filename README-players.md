# 媒体播放器说明文档

## 目录结构

```
ciallo0721-cmd.github.io/
├── vid/          ← 视频播放器
│   ├── video-player.js
│   └── video-player.css
├── mus/          ← 音频播放器
│   ├── audio-player.js
│   └── audio-player.css
└── pic/          ← 图片查看器
    ├── image-viewer.js
    └── image-viewer.css
```

---

## 一、视频播放器（vid/）

### 引入

```html
<link rel="stylesheet" href="../../vid/video-player.css">
<script src="../../vid/video-player.js"></script>
```

### HTML 结构

```html
<div class="video-player-container" data-src="./视频文件.mp4">
    <div class="video-poster">
        <div class="play-button">
            <i class="fas fa-play"></i>
        </div>
    </div>
    <video preload="metadata"></video>
    <div class="video-controls">
        <button class="vp-control-btn vp-play-pause"><i class="fas fa-play"></i></button>
        <div class="vp-progress-container">
            <div class="vp-progress-bar">
                <div class="vp-progress-fill"></div>
                <div class="vp-progress-handle"></div>
            </div>
        </div>
        <span class="vp-time-display">00:00 / 00:00</span>
        <div class="vp-volume-container">
            <button class="vp-control-btn vp-volume-btn"><i class="fas fa-volume-up"></i></button>
            <div class="vp-volume-slider"><div class="vp-volume-fill"></div></div>
        </div>
        <button class="vp-control-btn vp-fullscreen-btn"><i class="fas fa-expand"></i></button>
    </div>
    <div class="vp-loading"></div>
</div>
```

### 注意事项

- `data-src` 填写视频文件路径（相对或绝对均可）
- 需要引入 Font Awesome 图标库
- 自动初始化：脚本加载完毕后会自动查找所有 `.video-player-container`
- 手动初始化：`VideoPlayer.initAll()` 或 `VideoPlayer.init(元素)`

---

## 二、音频播放器（mus/）

### 引入

```html
<link rel="stylesheet" href="../../mus/audio-player.css">
<script src="../../mus/audio-player.js"></script>
```

### HTML 结构（极简，只需一个 div）

```html
<div class="audio-player-container"
     data-src="./音乐.mp3"
     data-title="歌曲标题"
     data-artist="歌手名"
     data-cover="./封面图片.jpg">
</div>
```

### 属性说明

| 属性 | 必填 | 说明 |
|------|------|------|
| data-src | ✅ | 音频文件路径（mp3/ogg/wav） |
| data-title | 否 | 歌曲标题，默认"未知曲目" |
| data-artist | 否 | 歌手名 |
| data-cover | 否 | 封面图片路径，不填则显示音符图标（会旋转） |

---

## 三、图片查看器（pic/）

### 引入

```html
<link rel="stylesheet" href="../../pic/image-viewer.css">
<script src="../../pic/image-viewer.js"></script>
```

### 使用方法

只需给 `<img>` 加上 `class="zoomable"` 即可：

```html
<!-- 基础用法 -->
<img src="./截图.png" class="zoomable" alt="描述文字">

<!-- 带容器和说明（可选） -->
<div class="pic-container">
    <img src="./截图.png" class="zoomable" alt="描述文字">
    <p class="pic-caption">这里是图片说明</p>
</div>
```

### 效果

- 鼠标悬停：图片轻微上浮 + 光标变为放大镜
- 点击：全屏模态框放大显示
- 关闭方式：点击背景 / 点击右上角 × / 按 ESC 键

---

## 四、迁移说明（旧文件对照）

| 旧文件 | 新位置 | 说明 |
|--------|--------|------|
| `media-viewer.css` | `pic/image-viewer.css` | 图片部分已提取 |
| `media-viewer.js` | `pic/image-viewer.js` | 图片部分已提取 |
| `video-player.css` | `vid/video-player.css` | 已迁移整理 |
| `video-player.js` | `vid/video-player.js` | 已迁移整理 |
| `nice-video.css` | ❌ 已废弃 | 合并到 vid/ 版本 |
| `nice-video.js` | ❌ 已废弃 | 合并到 vid/ 版本 |

更新引用路径方式：把所有文章中的

```html
<link rel="stylesheet" href="../../media-viewer.css">
<script src="../../media-viewer.js"></script>
```

改为：

```html
<link rel="stylesheet" href="../../pic/image-viewer.css">
<script src="../../pic/image-viewer.js"></script>
```
