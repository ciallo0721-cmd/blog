/**
 * 自定义视频播放器 - video-player.js
 * 功能：
 * 1. 修复音量控制问题
 * 2. 自动从视频中提取封面
 * 3. 修复全屏功能
 *
 * 用法：
 * VideoPlayer.init(container) - 初始化指定容器内的播放器
 * VideoPlayer.initAll() - 初始化页面上所有 .video-player-container
 */
(function(global) {
    'use strict';

    /**
     * 初始化视频播放器
     * @param {HTMLElement} container - .video-player-container 元素
     * @param {Object} options - 可选参数
     */
    function initVideoPlayer(container, options) {
        options = Object.assign({
            poster: '',
            autoplay: false,
            muted: false
        }, options || {});

        // 防止重复初始化
        if (container.__videoPlayerInitialized) return;
        container.__videoPlayerInitialized = true;

        const video = container.querySelector('video');
        const poster = container.querySelector('.video-poster');
        const playBtn = container.querySelector('.play-button');
        const playPauseBtn = container.querySelector('.play-pause-btn');
        const progressBar = container.querySelector('.vp-progress-bar');
        const progressFill = container.querySelector('.vp-progress-fill');
        const progressHandle = container.querySelector('.vp-progress-handle');
        const timeDisplay = container.querySelector('.vp-time-display');
        const volumeBtn = container.querySelector('.vp-volume-btn');
        const volumeSlider = container.querySelector('.vp-volume-slider');
        const volumeFill = container.querySelector('.vp-volume-fill');
        const fullscreenBtn = container.querySelector('.vp-fullscreen-btn');

        if (!video) {
            console.error('Video element not found in container', container);
            return;
        }

        // 设置视频源
        const src = container.dataset.src || '';
        if (src && !video.src) {
            video.src = src;
            video.load(); // 强制浏览器加载视频
        }

        // 状态变量
        let isPlaying = false;
        let isDraggingProgress = false;
        let isDraggingVolume = false;
        let isMuted = false;
        let lastVolume = 0.7;
        let hideControlsTimer = null;

        // ===== 1. 从视频生成封面 =====
        function generateVideoPoster() {
            if (poster && poster.dataset.generated) return;
            if (!video.videoWidth) return;

            try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

                let img = poster.querySelector('img');
                if (!img) {
                    img = document.createElement('img');
                    img.className = 'vp-poster-img';
                    poster.insertBefore(img, poster.firstChild);
                }
                img.src = dataUrl;
                img.alt = '视频封面';
                poster.dataset.generated = 'true';
            } catch (e) {
                console.warn('Failed to generate video poster:', e);
            }
        }

        // ===== 2. 播放/暂停 =====
        function togglePlay(e) {
            if (e) e.stopPropagation();
            
            console.log('[PLAY] togglePlay called, paused:', video.paused, 'readyState:', video.readyState);

            if (video.paused || video.ended) {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log('[PLAY] Play started successfully');
                        isPlaying = true;
                        container.classList.add('playing');
                        container.classList.add('controls-visible');
                        updatePlayPauseBtn();
                        if (poster) poster.classList.add('hidden');
                    }).catch(err => {
                        console.error('[PLAY] Play failed:', err);
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
            if (!e.target.closest('.video-controls')) {
                togglePlay(e);
            }
        });

        // ===== 3. 进度条 =====
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
                if (!video.duration) return;
                const rect = progressBar.getBoundingClientRect();
                const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                video.currentTime = percent * video.duration;
            });
        }

        // 进度条拖动
        function onProgressMouseDown(e) {
            if (e.target.closest('.vp-progress-handle') || e.target === progressBar || e.target === progressFill) {
                isDraggingProgress = true;
                document.body.style.userSelect = 'none';
                e.preventDefault();
                e.stopPropagation();
            }
        }

        if (progressBar) {
            progressBar.addEventListener('mousedown', onProgressMouseDown);
        }

        // 视频事件
        video.addEventListener('loadedmetadata', function() {
            updateTimeDisplay();
            generateVideoPoster();
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
            if (poster) {
                poster.classList.remove('hidden');
                container.classList.remove('controls-visible');
            }
        });

        // ===== 4. 音量控制 =====
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
        const onMouseMove = function(e) {
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
        };

        const onMouseUp = function() {
            isDraggingProgress = false;
            isDraggingVolume = false;
            document.body.style.userSelect = '';
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        // 初始化音量
        video.volume = lastVolume;
        updateVolumeDisplay();

        // ===== 5. 全屏功能 =====
        function toggleFullscreen(e) {
            if (e) e.stopPropagation();

            const fsEl = document.fullscreenElement
                || document.webkitFullscreenElement
                || document.mozFullScreenElement
                || document.msFullscreenElement;

            if (fsEl) {
                // 退出全屏
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            } else {
                // 进入全屏 - 优先使用 video 元素
                const target = video;
                if (target.requestFullscreen) {
                    target.requestFullscreen();
                } else if (target.webkitRequestFullscreen) {
                    target.webkitRequestFullscreen();
                } else if (target.mozRequestFullScreen) {
                    target.mozRequestFullScreen();
                } else if (target.msRequestFullscreen) {
                    target.msRequestFullscreen();
                } else {
                    // 降级：全屏容器
                    if (container.requestFullscreen) {
                        container.requestFullscreen();
                    }
                }
            }
        }

        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', toggleFullscreen);
        }

        function updateFullscreenBtn() {
            const isFs = !!(
                document.fullscreenElement
                || document.webkitFullscreenElement
                || document.mozFullScreenElement
                || document.msFullscreenElement
            );
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = isFs
                    ? '<i class="fas fa-compress"></i>'
                    : '<i class="fas fa-expand"></i>';
            }
        }

        document.addEventListener('fullscreenchange', updateFullscreenBtn);
        document.addEventListener('webkitfullscreenchange', updateFullscreenBtn);
        document.addEventListener('mozfullscreenchange', updateFullscreenBtn);
        document.addEventListener('MSFullscreenChange', updateFullscreenBtn);

        // ===== 6. 键盘快捷键 =====
        container.addEventListener('keydown', function(e) {
            switch(e.key) {
                case ' ':
                case 'k':
                case 'K':
                    e.preventDefault();
                    togglePlay(e);
                    break;
                case 'ArrowLeft':
                    video.currentTime = Math.max(0, video.currentTime - 5);
                    break;
                case 'ArrowRight':
                    video.currentTime = Math.min(video.duration || Infinity, video.currentTime + 5);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setVolume(video.volume + 0.1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setVolume(video.volume - 0.1);
                    break;
                case 'm':
                case 'M':
                    if (volumeBtn) volumeBtn.click();
                    break;
                case 'f':
                case 'F':
                    toggleFullscreen(e);
                    break;
            }
        });

        container.tabIndex = 0;

        // ===== 7. 显示/隐藏控制栏 =====
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

        // ===== 8. 双击全屏 =====
        video.addEventListener('dblclick', function(e) {
            e.preventDefault();
            toggleFullscreen(e);
        });

        // ===== 9. 初始化 =====
        // 如果视频已经有src，尝试生成封面
        if (video.src || video.currentSrc) {
            if (video.readyState >= 1) {
                generateVideoPoster();
                updateTimeDisplay();
            } else {
                // 等待 metadata 加载
                video.addEventListener('loadedmetadata', function onMeta() {
                    updateTimeDisplay();
                    generateVideoPoster();
                    video.removeEventListener('loadedmetadata', onMeta);
                });
            }
        }
    }

    // ===== 公共 API =====
    global.VideoPlayer = {
        /**
         * 初始化指定容器内的播放器
         * @param {HTMLElement} container - .video-player-container 元素
         */
        init: function(container) {
            if (!container) {
                console.error('VideoPlayer.init: container is required');
                return;
            }
            initVideoPlayer(container);
        },

        /**
         * 初始化页面上所有 .video-player-container
         */
        initAll: function() {
            document.querySelectorAll('.video-player-container').forEach(function(container) {
                initVideoPlayer(container);
            });
        }
    };

})(window);
