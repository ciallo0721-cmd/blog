/**
 * 自研视频播放器 - nice-video.js
 * 简化版，修复时长00:00 bug
 * 用法：
 *   <div class="nice-video-container" data-src="视频地址">
 *       <video preload="metadata"></video>
 *   </div>
 *   然后调用 NiceVideo.initAll() 初始化
 */

(function(global) {
    'use strict';

    /**
     * 初始化单个播放器
     */
    function initOne(container) {
        if (container.__nvInitialized) return;
        container.__nvInitialized = true;

        const video = container.querySelector('video');
        if (!video) {
            console.error('[NiceVideo] 找不到 video 元素');
            return;
        }

        // 获取视频源并设置
        const src = container.dataset.src || '';
        if (src && !video.src) {
            video.src = src;
            console.log('[NiceVideo] 设置视频源:', src);
        }

        // 创建控制栏（如果不存在）
        let controls = container.querySelector('.nice-video-controls');
        if (!controls) {
            controls = createControls();
            container.appendChild(controls);
        }

        // 创建中央播放按钮（如果不存在）
        let playBtn = container.querySelector('.nice-video-play-btn');
        if (!playBtn) {
            playBtn = document.createElement('button');
            playBtn.className = 'nice-video-play-btn';
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            container.appendChild(playBtn);
        }

        // 创建加载指示器（如果不存在）
        let loading = container.querySelector('.nice-video-loading');
        if (!loading) {
            loading = document.createElement('div');
            loading.className = 'nice-video-loading';
            container.appendChild(loading);
        }

        // 获取控制栏元素
        const playPauseBtn = controls.querySelector('.nv-play-pause');
        const progressBar = controls.querySelector('.nice-video-progress-bar');
        const progressFill = controls.querySelector('.nice-video-progress-fill');
        const progressHandle = controls.querySelector('.nice-video-progress-handle');
        const timeDisplay = controls.querySelector('.nice-video-time');
        const volumeBtn = controls.querySelector('.nv-volume');
        const volumeSlider = controls.querySelector('.nice-video-volume-slider');
        const volumeFill = controls.querySelector('.nice-video-volume-fill');
        const fullscreenBtn = controls.querySelector('.nv-fullscreen');

        // 状态
        let isPlaying = false;
        let isDraggingProgress = false;
        let isDraggingVolume = false;
        let isMuted = false;
        let lastVolume = 0.7;
        let hideControlsTimer = null;

        // ===== 播放/暂停 =====
        function togglePlay(e) {
            if (e) e.stopPropagation();
            
            console.log('[NiceVideo] togglePlay, paused:', video.paused, 'readyState:', video.readyState);
            
            if (video.paused || video.ended) {
                const promise = video.play();
                if (promise !== undefined) {
                    promise.then(() => {
                        console.log('[NiceVideo] 播放成功');
                        isPlaying = true;
                        container.classList.add('playing');
                        container.classList.add('controls-visible');
                        updatePlayPauseBtn();
                    }).catch(err => {
                        console.error('[NiceVideo] 播放失败:', err);
                    });
                }
            } else {
                video.pause();
                isPlaying = false;
                container.classList.remove('playing');
                updatePlayPauseBtn();
            }
        }

        function updatePlayPauseBtn() {
            if (!playPauseBtn) return;
            playPauseBtn.innerHTML = isPlaying 
                ? '<i class="fas fa-pause"></i>' 
                : '<i class="fas fa-play"></i>';
        }

        if (playBtn) playBtn.addEventListener('click', togglePlay);
        if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
        
        video.addEventListener('click', function(e) {
            if (!e.target.closest('.nice-video-controls')) {
                togglePlay(e);
            }
        });

        // ===== 进度条 =====
        function updateProgress() {
            if (!isDraggingProgress && video.duration && isFinite(video.duration)) {
                const percent = (video.currentTime / video.duration) * 100;
                if (progressFill) progressFill.style.width = percent + '%';
                if (progressHandle) progressHandle.style.left = percent + '%';
            }
        }

        function updateTimeDisplay() {
            if (!timeDisplay) return;
            const current = formatTime(video.currentTime);
            const duration = formatTime(video.duration);
            timeDisplay.textContent = current + ' / ' + duration;
        }

        function formatTime(seconds) {
            if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '00:00';
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
        }

        if (progressBar) {
            progressBar.addEventListener('click', function(e) {
                e.stopPropagation();
                if (!video.duration) {
                    console.warn('[NiceVideo] 视频时长未加载，无法跳转');
                    return;
                }
                const rect = progressBar.getBoundingClientRect();
                const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                video.currentTime = percent * video.duration;
            });
        }

        // 进度条拖动
        function onProgressMouseDown(e) {
            if (e.target.closest('.nice-video-progress-handle') || e.target === progressBar || e.target === progressFill) {
                isDraggingProgress = true;
                document.body.style.userSelect = 'none';
                e.preventDefault();
                e.stopPropagation();
            }
        }

        if (progressBar) {
            progressBar.addEventListener('mousedown', onProgressMouseDown);
        }

        // ===== 音量控制 =====
        function updateVolumeDisplay() {
            const vol = isMuted ? 0 : video.volume;
            if (volumeFill) volumeFill.style.width = (vol * 100) + '%';
            if (!volumeBtn) return;
            if (isMuted || vol === 0) {
                volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            } else if (vol < 0.5) {
                volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
            } else {
                volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
        }

        function setVolume(percent) {
            percent = Math.max(0, Math.min(1, percent));
            video.volume = percent;
            lastVolume = percent;
            isMuted = percent === 0;
            updateVolumeDisplay();
        }

        if (volumeBtn) {
            volumeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (isMuted || video.volume === 0) {
                    video.volume = lastVolume || 0.7;
                    isMuted = false;
                } else {
                    lastVolume = video.volume;
                    video.volume = 0;
                    isMuted = true;
                }
                updateVolumeDisplay();
            });
        }

        if (volumeSlider) {
            volumeSlider.addEventListener('click', function(e) {
                e.stopPropagation();
                const rect = volumeSlider.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                setVolume(percent);
            });

            volumeSlider.addEventListener('mousedown', function(e) {
                isDraggingVolume = true;
                e.preventDefault();
                e.stopPropagation();
            });
        }

        // 全局鼠标事件
        function onMouseMove(e) {
            if (isDraggingProgress && progressBar) {
                const rect = progressBar.getBoundingClientRect();
                let percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                video.currentTime = percent * video.duration;
            }
            if (isDraggingVolume && volumeSlider) {
                const rect = volumeSlider.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                setVolume(percent);
            }
        }

        function onMouseUp() {
            isDraggingProgress = false;
            isDraggingVolume = false;
            document.body.style.userSelect = '';
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        // 初始化音量
        video.volume = lastVolume;
        updateVolumeDisplay();

        // ===== 全屏 =====
        function toggleFullscreen(e) {
            if (e) e.stopPropagation();

            const fsEl = document.fullscreenElement 
                || document.webkitFullscreenElement 
                || document.mozFullScreenElement 
                || document.msFullscreenElement;

            if (fsEl) {
                if (document.exitFullscreen) document.exitFullscreen();
                else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
                else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
                else if (document.msExitFullscreen) document.msExitFullscreen();
            } else {
                const target = video;
                if (target.requestFullscreen) target.requestFullscreen();
                else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
                else if (target.mozRequestFullScreen) target.mozRequestFullScreen();
                else if (target.msRequestFullscreen) target.msRequestFullscreen();
            }
        }

        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', toggleFullscreen);
        }

        function updateFullscreenBtn() {
            const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = isFs 
                    ? '<i class="fas fa-compress"></i>' 
                    : '<i class="fas fa-expand"></i>';
            }
        }

        document.addEventListener('fullscreenchange', updateFullscreenBtn);
        document.addEventListener('webkitfullscreenchange', updateFullscreenBtn);

        // ===== 视频事件 =====
        video.addEventListener('loadedmetadata', function() {
            console.log('[NiceVideo] 元数据加载完成，时长:', video.duration);
            updateTimeDisplay();
            container.classList.remove('loading');
        });

        video.addEventListener('timeupdate', function() {
            updateProgress();
            updateTimeDisplay();
        });

        video.addEventListener('play', function() {
            isPlaying = true;
            container.classList.add('playing');
            updatePlayPauseBtn();
        });

        video.addEventListener('pause', function() {
            isPlaying = false;
            container.classList.remove('playing');
            updatePlayPauseBtn();
        });

        video.addEventListener('ended', function() {
            isPlaying = false;
            container.classList.remove('playing');
            updatePlayPauseBtn();
        });

        video.addEventListener('waiting', function() {
            container.classList.add('loading');
        });

        video.addEventListener('canplay', function() {
            container.classList.remove('loading');
        });

        // 如果视频已经有元数据，立即更新
        if (video.readyState >= 1) {
            console.log('[NiceVideo] 视频已有元数据，时长:', video.duration);
            updateTimeDisplay();
        }

        // ===== 显示/隐藏控制栏 =====
        container.addEventListener('mousemove', function() {
            container.classList.add('controls-visible');
            clearTimeout(hideControlsTimer);
            if (isPlaying) {
                hideControlsTimer = setTimeout(function() {
                    container.classList.remove('controls-visible');
                }, 3000);
            }
        });

        container.addEventListener('mouseleave', function() {
            if (isPlaying) {
                hideControlsTimer = setTimeout(function() {
                    container.classList.remove('controls-visible');
                }, 1000);
            }
        });

        // ===== 双击全屏 =====
        video.addEventListener('dblclick', function(e) {
            e.preventDefault();
            toggleFullscreen(e);
        });

        // 初始化
        updateTimeDisplay();
        video.load();
    }

    /**
     * 创建控制栏
     */
    function createControls() {
        const controls = document.createElement('div');
        controls.className = 'nice-video-controls';
        controls.innerHTML = `
            <button class="nice-video-btn nv-play-pause" title="播放/暂停">
                <i class="fas fa-play"></i>
            </button>
            <div class="nice-video-progress">
                <div class="nice-video-progress-bar">
                    <div class="nice-video-progress-fill"></div>
                    <div class="nice-video-progress-handle"></div>
                </div>
            </div>
            <span class="nice-video-time">00:00 / 00:00</span>
            <div class="nice-video-volume">
                <button class="nice-video-btn nv-volume" title="音量">
                    <i class="fas fa-volume-up"></i>
                </button>
                <div class="nice-video-volume-slider">
                    <div class="nice-video-volume-fill"></div>
                </div>
            </div>
            <button class="nice-video-btn nv-fullscreen" title="全屏">
                <i class="fas fa-expand"></i>
            </button>
        `;
        return controls;
    }

    // ===== 公共 API =====
    global.NiceVideo = {
        init: function(container) {
            if (!container) {
                console.error('[NiceVideo] container is required');
                return;
            }
            initOne(container);
        },

        initAll: function() {
            document.querySelectorAll('.nice-video-container').forEach(function(container) {
                initOne(container);
            });
        }
    };

    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            global.NiceVideo.initAll();
        });
    } else {
        global.NiceVideo.initAll();
    }

})(window);
