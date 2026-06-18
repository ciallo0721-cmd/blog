/**
 * Media Viewer - 图片放大 & 自定义视频播放器
 * 适用于 91vip.xn--32v.ink 文章页面
 * 
 * 使用方法：
 * 1. 在 HTML 中引入此脚本：<script src="../../media-viewer.js"></script>
 * 2. 图片添加 class="zoomable" 即可点击放大
 * 3. 视频使用自定义播放器结构（见下方示例）
 */

(function() {
    'use strict';

    // ==================== 图片放大功能 ====================
    
    function initImageZoom() {
        // 如果已存在弹窗，不再创建
        if (document.getElementById('imageZoomModal')) return;
        
        // 创建放大弹窗
        const modal = document.createElement('div');
        modal.id = 'imageZoomModal';
        modal.className = 'image-zoom-modal';
        modal.innerHTML = `
            <span class="image-zoom-close">&times;</span>
            <img src="" alt="放大图片" id="zoomedImage">
        `;
        document.body.appendChild(modal);
        
        const modalImg = modal.querySelector('#zoomedImage');
        const closeBtn = modal.querySelector('.image-zoom-close');
        
        // 为所有可放大的图片添加点击事件
        document.querySelectorAll('.zoomable').forEach(img => {
            img.addEventListener('click', function() {
                modalImg.src = this.src;
                modalImg.alt = this.alt;
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });
        
        // 关闭弹窗
        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal();
        });
        
        // ESC键关闭
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // ==================== 自定义视频播放器 ====================
    
    function initCustomVideoPlayer() {
        document.querySelectorAll('.custom-video-player').forEach(player => {
            // 避免重复初始化
            if (player.dataset.initialized === 'true') return;
            player.dataset.initialized = 'true';
            
            const videoSrc = player.dataset.src;
            const posterSrc = player.dataset.poster;
            const video = player.querySelector('.video-element');
            const poster = player.querySelector('.video-poster');
            const playBtn = player.querySelector('.play-button');
            const playPauseBtn = player.querySelector('.play-pause');
            const progressBar = player.querySelector('.progress-bar');
            const progressFill = player.querySelector('.progress-fill');
            const progressHandle = player.querySelector('.progress-handle');
            const timeDisplay = player.querySelector('.time-display');
            const volumeBtn = player.querySelector('.volume');
            const volumeSlider = player.querySelector('.volume-slider');
            const volumeFill = player.querySelector('.volume-fill');
            const fullscreenBtn = player.querySelector('.fullscreen');
            
            if (!video || !videoSrc) return;
            
            // 设置视频源
            video.src = videoSrc;
            if (posterSrc) video.poster = posterSrc;
            
            let isDragging = false;
            
            // 播放/暂停
            function togglePlay() {
                if (video.paused) {
                    var p = video.play();
                    if (p !== undefined) {
                        p.catch(function(err) {
                            // AbortError 由用户主动暂停引起，静默忽略
                            if (err.name === 'AbortError') return;
                            console.error('[MediaViewer] 播放失败:', err);
                        });
                    }
                    player.classList.add('playing');
                    if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                } else {
                    video.pause();
                    player.classList.remove('playing');
                    if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                }
            }
            
            if (playBtn) playBtn.addEventListener('click', togglePlay);
            if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
            video.addEventListener('click', togglePlay);
            
            // 更新进度
            video.addEventListener('timeupdate', function() {
                if (!isDragging && progressFill && progressHandle) {
                    const percent = (video.currentTime / video.duration) * 100;
                    progressFill.style.width = percent + '%';
                    progressHandle.style.left = percent + '%';
                }
                if (timeDisplay) {
                    timeDisplay.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration || 0);
                }
            });
            
            // 格式化时间
            function formatTime(seconds) {
                if (isNaN(seconds)) return '00:00';
                const mins = Math.floor(seconds / 60);
                const secs = Math.floor(seconds % 60);
                return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
            }
            
            // 进度条点击
            if (progressBar) {
                progressBar.addEventListener('click', function(e) {
                    const rect = progressBar.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    video.currentTime = percent * video.duration;
                });
            }
            
            // 进度条拖动
            if (progressHandle) {
                progressHandle.addEventListener('mousedown', function(e) {
                    isDragging = true;
                    document.body.style.userSelect = 'none';
                });
            }
            
            document.addEventListener('mousemove', function(e) {
                if (!isDragging || !progressBar || !progressFill || !progressHandle) return;
                const rect = progressBar.getBoundingClientRect();
                let percent = (e.clientX - rect.left) / rect.width;
                percent = Math.max(0, Math.min(1, percent));
                progressFill.style.width = (percent * 100) + '%';
                progressHandle.style.left = (percent * 100) + '%';
            });
            
            document.addEventListener('mouseup', function(e) {
                if (isDragging && progressBar) {
                    const rect = progressBar.getBoundingClientRect();
                    let percent = (e.clientX - rect.left) / rect.width;
                    percent = Math.max(0, Math.min(1, percent));
                    video.currentTime = percent * video.duration;
                    isDragging = false;
                    document.body.style.userSelect = '';
                }
            });
            
            // 音量控制
            let isMuted = false;
            let lastVolume = 0.7;
            
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
                    const percent = (e.clientX - rect.left) / rect.width;
                    video.volume = Math.max(0, Math.min(1, percent));
                    if (volumeFill) volumeFill.style.width = (video.volume * 100) + '%';
                    isMuted = video.volume === 0;
                    if (volumeBtn) {
                        volumeBtn.innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
                    }
                });
            }
            
            // 全屏
            if (fullscreenBtn) {
                fullscreenBtn.addEventListener('click', function() {
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else {
                        player.requestFullscreen();
                    }
                });
            }
            
            // 视频结束
            video.addEventListener('ended', function() {
                player.classList.remove('playing');
                if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                if (poster) poster.style.display = 'flex';
            });

            // 网络状态监听、断网提示与自动恢复
            (function() {
                var retryCount = 0;
                var maxRetries = 3;
                var baseDelay = 1000;
                var maxDelay = 30000;
                var retryTimer = null;
                var isDisconnected = false;

                var netOverlay = player.querySelector('.mv-network-disconnected');
                if (!netOverlay) {
                    netOverlay = document.createElement('div');
                    netOverlay.className = 'mv-network-disconnected';
                    netOverlay.innerHTML = '<i class="fas fa-wifi-slash"></i> 网络已断开，请检查连接';
                    player.appendChild(netOverlay);
                }

                function showDisconnected() {
                    isDisconnected = true;
                    netOverlay.style.display = 'flex';
                    video.pause();
                }

                function hideDisconnected() {
                    isDisconnected = false;
                    netOverlay.style.display = 'none';
                    retryCount = 0;
                }

                window.addEventListener('online', function() {
                    if (isDisconnected) {
                        console.log('[MediaViewer] 网络已恢复，重新加载视频');
                        hideDisconnected();
                        video.load();
                        video.play().catch(function(){});
                    }
                });

                window.addEventListener('offline', function() {
                    if (!navigator.onLine) {
                        showDisconnected();
                    }
                });

                video.addEventListener('error', function() {
                    if (!navigator.onLine) {
                        showDisconnected();
                        return;
                    }
                    var mediaError = video.error;
                    var isNetworkError = mediaError && (
                        mediaError.code === MediaError.MEDIA_ERR_NETWORK ||
                        (mediaError.message && mediaError.message.indexOf('Network') >= 0) ||
                        (mediaError.message && mediaError.message.indexOf('ERR_INTERNET_DISCONNECTED') >= 0)
                    );
                    if (isNetworkError) {
                        if (retryCount < maxRetries) {
                            var delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
                            retryCount++;
                            console.log('[MediaViewer] 网络错误，第 ' + retryCount + '/' + maxRetries + ' 次重试，等待 ' + delay + 'ms');
                            clearTimeout(retryTimer);
                            retryTimer = setTimeout(function() { video.load(); }, delay);
                        } else {
                            console.error('[MediaViewer] 重试次数已达上限');
                            retryCount = 0;
                            var evt = new CustomEvent('playererror', {
                                detail: { type: 'network', message: '视频加载失败，请稍后重试' }
                            });
                            player.dispatchEvent(evt);
                        }
                    }
                });
            })();
            
            // 初始化音量
            video.volume = 0.7;
        });
    }

    // ==================== 自动初始化 ====================
    
    function init() {
        initImageZoom();
        initCustomVideoPlayer();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // 暴露到全局，方便手动调用
    window.MediaViewer = {
        initImageZoom: initImageZoom,
        initCustomVideoPlayer: initCustomVideoPlayer,
        init: init
    };
})();

/**
 * 视频播放器 HTML 结构示例：
 * 
 * <div class="article-video-container">
 *     <div class="custom-video-player" data-src="videos/demo.mp4" data-poster="images/poster.jpg">
 *         <div class="video-poster">
 *             <img src="images/poster.jpg" alt="视频封面">
 *             <div class="play-button">
 *                 <i class="fas fa-play"></i>
 *             </div>
 *         </div>
 *         <video class="video-element" preload="metadata"></video>
 *         <div class="video-controls">
 *             <button class="control-btn play-pause"><i class="fas fa-play"></i></button>
 *             <div class="progress-container">
 *                 <div class="progress-bar">
 *                     <div class="progress-fill"></div>
 *                     <div class="progress-handle"></div>
 *                 </div>
 *             </div>
 *             <span class="time-display">00:00 / 00:00</span>
 *             <button class="control-btn volume"><i class="fas fa-volume-up"></i></button>
 *             <div class="volume-slider"><div class="volume-fill"></div></div>
 *             <button class="control-btn fullscreen"><i class="fas fa-expand"></i></button>
 *         </div>
 *     </div>
 *     <div class="image-caption">视频标题</div>
 * </div>
 */
