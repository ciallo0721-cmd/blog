/**
 * 音频播放器 - mus/audio-player.js
 * 功能：自定义样式音频播放器，支持播放/暂停/进度/音量/时间显示
 * 用法：
 *   <div class="audio-player-container" data-src="./music.mp3" data-title="歌曲标题" data-artist="歌手">
 *   </div>
 * 然后脚本自动初始化，或手动调用 AudioPlayer.initAll()
 */
(function(global) {
    'use strict';

    function initAudioPlayer(container) {
        if (container.__apInitialized) return;
        container.__apInitialized = true;

        var src = container.dataset.src || '';
        var title = container.dataset.title || '未知曲目';
        var artist = container.dataset.artist || '';
        var cover = container.dataset.cover || '';

        // 构建 HTML
        container.innerHTML =
            '<div class="ap-body">' +
                '<div class="ap-cover">' +
                    (cover
                        ? '<img src="' + cover + '" alt="封面">'
                        : '<div class="ap-cover-placeholder"><i class="fas fa-music"></i></div>'
                    ) +
                    '<div class="ap-disc-ring"></div>' +
                '</div>' +
                '<div class="ap-main">' +
                    '<div class="ap-info">' +
                        '<div class="ap-title">' + title + '</div>' +
                        (artist ? '<div class="ap-artist">' + artist + '</div>' : '') +
                    '</div>' +
                    '<div class="ap-controls">' +
                        '<button class="ap-btn ap-play-btn" title="播放/暂停">' +
                            '<i class="fas fa-play"></i>' +
                        '</button>' +
                        '<div class="ap-progress-wrap">' +
                            '<span class="ap-time ap-cur">00:00</span>' +
                            '<div class="ap-progress-bar">' +
                                '<div class="ap-progress-fill"></div>' +
                                '<div class="ap-progress-handle"></div>' +
                            '</div>' +
                            '<span class="ap-time ap-dur">00:00</span>' +
                        '</div>' +
                        '<div class="ap-vol-wrap">' +
                            '<button class="ap-btn ap-vol-btn" title="静音">' +
                                '<i class="fas fa-volume-up"></i>' +
                            '</button>' +
                            '<div class="ap-vol-bar">' +
                                '<div class="ap-vol-fill"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<audio preload="metadata"></audio>';

        var audio = container.querySelector('audio');
        if (src) { audio.src = src; audio.load(); }

        var playBtn = container.querySelector('.ap-play-btn');
        var progressBar = container.querySelector('.ap-progress-bar');
        var progressFill = container.querySelector('.ap-progress-fill');
        var progressHandle = container.querySelector('.ap-progress-handle');
        var curTime = container.querySelector('.ap-cur');
        var durTime = container.querySelector('.ap-dur');
        var volBtn = container.querySelector('.ap-vol-btn');
        var volBar = container.querySelector('.ap-vol-bar');
        var volFill = container.querySelector('.ap-vol-fill');
        var cover_el = container.querySelector('.ap-cover');

        var isMuted = false;
        var lastVol = 0.7;
        var dragging = false;

        function fmt(s) {
            if (isNaN(s) || s === Infinity) return '00:00';
            var m = Math.floor(s / 60);
            var sec = Math.floor(s % 60);
            return String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
        }

        // 播放/暂停
        playBtn.addEventListener('click', function() {
            if (audio.paused) {
                audio.play();
                container.classList.add('ap-playing');
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                audio.pause();
                container.classList.remove('ap-playing');
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        });

        // 进度更新
        audio.addEventListener('timeupdate', function() {
            if (!dragging && audio.duration) {
                var pct = (audio.currentTime / audio.duration) * 100;
                progressFill.style.width = pct + '%';
                progressHandle.style.left = pct + '%';
            }
            curTime.textContent = fmt(audio.currentTime);
        });
        audio.addEventListener('loadedmetadata', function() {
            durTime.textContent = fmt(audio.duration);
        });

        // 进度条点击
        progressBar.addEventListener('click', function(e) {
            if (!audio.duration) return;
            var rect = progressBar.getBoundingClientRect();
            var pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            audio.currentTime = pct * audio.duration;
        });

        // 进度条拖动
        progressHandle.addEventListener('mousedown', function(e) {
            dragging = true;
            e.preventDefault();
            document.body.style.userSelect = 'none';
        });
        document.addEventListener('mousemove', function(e) {
            if (!dragging || !audio.duration) return;
            var rect = progressBar.getBoundingClientRect();
            var pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            progressFill.style.width = (pct * 100) + '%';
            progressHandle.style.left = (pct * 100) + '%';
            audio.currentTime = pct * audio.duration;
        });
        document.addEventListener('mouseup', function() {
            if (dragging) {
                dragging = false;
                document.body.style.userSelect = '';
            }
        });

        // 音量
        volBtn.addEventListener('click', function() {
            if (isMuted) {
                audio.volume = lastVol;
                volFill.style.width = (lastVol * 100) + '%';
                volBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                isMuted = false;
            } else {
                lastVol = audio.volume || 0.7;
                audio.volume = 0;
                volFill.style.width = '0%';
                volBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
                isMuted = true;
            }
        });
        volBar.addEventListener('click', function(e) {
            var rect = volBar.getBoundingClientRect();
            var pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            audio.volume = pct;
            volFill.style.width = (pct * 100) + '%';
            isMuted = pct === 0;
            volBtn.innerHTML = isMuted
                ? '<i class="fas fa-volume-mute"></i>'
                : '<i class="fas fa-volume-up"></i>';
        });

        // 播放结束
        audio.addEventListener('ended', function() {
            container.classList.remove('ap-playing');
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        });

        // 初始化音量
        audio.volume = 0.7;
        volFill.style.width = '70%';
    }

    function initAll() {
        document.querySelectorAll('.audio-player-container').forEach(function(el) {
            initAudioPlayer(el);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        setTimeout(initAll, 0);
    }

    global.AudioPlayer = { init: initAudioPlayer, initAll: initAll };

})(window);
