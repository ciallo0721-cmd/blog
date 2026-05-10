/**
 * 视频播放器 - vid/video-player.js
 * 功能：封面提取、音量控制修复、全屏修复
 * 用法：
 *   VideoPlayer.initAll()  // 初始化页面所有 .video-player-container
 *   VideoPlayer.init(container)  // 初始化指定容器
 */
(function(global) {
    'use strict';

    function initVideoPlayer(container, options) {
        options = Object.assign({
            poster: '',
            autoplay: false,
            muted: false
        }, options || {});

        if (container.__videoPlayerInitialized) return;
        container.__videoPlayerInitialized = true;

        const video = container.querySelector('video');
        const poster = container.querySelector('.video-poster');
        const playBtn = container.querySelector('.play-button');
        const playPauseBtn = container.querySelector('.vp-play-pause');
        const progressBar = container.querySelector('.vp-progress-bar');
        const progressFill = container.querySelector('.vp-progress-fill');
        const progressHandle = container.querySelector('.vp-progress-handle');
        const timeDisplay = container.querySelector('.vp-time-display');
        const volumeBtn = container.querySelector('.vp-volume-btn');
        const volumeSlider = container.querySelector('.vp-volume-slider');
        const volumeFill = container.querySelector('.vp-volume-fill');
        const fullscreenBtn = container.querySelector('.vp-fullscreen-btn');

        if (!video) { console.error('Video element not found'); return; }

        // 设置视频源
        const src = container.dataset.src || '';
        if (src && !video.src) {
            video.src = src;
            video.load();
        }

        // 封面
        if (poster && options.poster) {
            poster.style.backgroundImage = `url(${options.poster})`;
            poster.style.backgroundSize = 'cover';
            poster.style.backgroundPosition = 'center';
        }

        let isPlaying = false;
        let isDraggingProgress = false;
        let isDraggingVolume = false;
        let isMuted = false;
        let lastVolume = 0.7;

        function formatTime(s) {
            if (isNaN(s) || s === Infinity) return '00:00';
            const m = Math.floor(s / 60);
            const sec = Math.floor(s % 60);
            return String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
        }

        // 播放/暂停
        function togglePlay(e) {
            if (e) e.stopPropagation();
            if (video.paused) {
                video.play();
                container.classList.add('playing');
                if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                if (playBtn) playBtn.style.display = 'none';
            } else {
                video.pause();
                container.classList.remove('playing');
                if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                if (playBtn) playBtn.style.display = 'flex';
            }
        }

        if (playBtn) playBtn.addEventListener('click', togglePlay);
        if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
        video.addEventListener('click', function(e) {
            if (e.target === video) togglePlay(e);
        });

        // 进度更新
        video.addEventListener('timeupdate', function() {
            if (!isDraggingProgress && progressFill && progressHandle && video.duration) {
                const pct = (video.currentTime / video.duration) * 100;
                progressFill.style.width = pct + '%';
                progressHandle.style.left = pct + '%';
            }
            if (timeDisplay) {
                timeDisplay.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration || 0);
            }
        });

        // 进度条点击
        function handleProgressClick(e) {
            if (!progressBar || !video.duration) return;
            const rect = progressBar.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            video.currentTime = pct * video.duration;
        }
        if (progressBar) {
            progressBar.addEventListener('click', handleProgressClick);
        }

        // 进度条拖动
        if (progressHandle) {
            progressHandle.addEventListener('mousedown', function(e) {
                isDraggingProgress = true;
                e.preventDefault();
                document.body.style.userSelect = 'none';
            });
        }
        document.addEventListener('mousemove', function(e) {
            if (!isDraggingProgress || !progressBar || !video.duration) return;
            const rect = progressBar.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            progressFill.style.width = (pct * 100) + '%';
            progressHandle.style.left = (pct * 100) + '%';
            video.currentTime = pct * video.duration;
        });
        document.addEventListener('mouseup', function() {
            if (isDraggingProgress) {
                isDraggingProgress = false;
                document.body.style.userSelect = '';
            }
        });

        // 音量
        if (volumeBtn) {
            volumeBtn.addEventListener('click', function() {
                if (isMuted) {
                    video.volume = lastVolume;
                    if (volumeFill) volumeFill.style.width = (lastVolume * 100) + '%';
                    volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                    isMuted = false;
                } else {
                    lastVolume = video.volume || 0.7;
                    video.volume = 0;
                    if (volumeFill) volumeFill.style.width = '0%';
                    volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
                    isMuted = true;
                }
            });
        }
        if (volumeSlider) {
            volumeSlider.addEventListener('click', function(e) {
                const rect = volumeSlider.getBoundingClientRect();
                const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                video.volume = pct;
                if (volumeFill) volumeFill.style.width = (pct * 100) + '%';
                isMuted = pct === 0;
                if (volumeBtn) {
                    volumeBtn.innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
                }
            });
        }

        // 全屏
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    container.requestFullscreen();
                }
            });
        }

        // 视频结束
        video.addEventListener('ended', function() {
            container.classList.remove('playing');
            if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            if (playBtn) playBtn.style.display = 'flex';
        });

        // 初始化音量
        video.volume = 0.7;
        if (volumeFill) volumeFill.style.width = '70%';

        // 从视频提取封面
        if (video.readyState >= 1) {
            try {
                if (poster) {
                    poster.style.backgroundImage = '';
                    poster.style.display = 'flex';
                }
            } catch(e) {}
        }
    }

    function initAll() {
        document.querySelectorAll('.video-player-container').forEach(function(container) {
            initVideoPlayer(container);
        });
    }

    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        setTimeout(initAll, 0);
    }

    global.VideoPlayer = {
        init: initVideoPlayer,
        initAll: initAll
    };

})(window);
