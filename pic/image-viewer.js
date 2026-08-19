/**
 * 图片查看器 - pic/image-viewer.js
 * 功能：点击图片放大预览（模态框），支持 ESC 关闭
 * 用法：给 img 标签加 class="zoomable" 即可
 *   <img src="./a.png" class="zoomable" alt="说明">
 * 或手动调用：ImageViewer.init()
 */
(function(global) {
    'use strict';

    function init() {
        if (document.getElementById('__imgViewerModal')) return;

        var modal = document.createElement('div');
        modal.id = '__imgViewerModal';
        modal.style.cssText = [
            'position:fixed;top:0;left:0;width:100%;height:100%;',
            'background:rgba(0,0,0,0.92);z-index:100000;',
            'display:none;justify-content:center;align-items:center;',
            'cursor:zoom-out;animation:ivFadeIn 0.25s ease;'
        ].join('');

        var closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = [
            'position:absolute;top:18px;right:28px;',
            'color:white;font-size:2.6rem;cursor:pointer;',
            'opacity:0.8;line-height:1;user-select:none;transition:opacity .2s;'
        ].join('');
        closeBtn.onmouseenter = function() { closeBtn.style.opacity = '1'; };
        closeBtn.onmouseleave = function() { closeBtn.style.opacity = '0.8'; };

        var img = document.createElement('img');
        img.id = '__imgViewerImg';
        img.style.cssText = [
            'max-width:90%;max-height:90%;',
            'border-radius:12px;',
            'box-shadow:0 20px 60px rgba(0,0,0,0.5);',
            'animation:ivZoomIn 0.25s ease;',
            'cursor:default;'
        ].join('');
        img.addEventListener('click', function(e) { e.stopPropagation(); });

        // 注入 keyframes
        if (!document.getElementById('__ivStyle')) {
            var style = document.createElement('style');
            style.id = '__ivStyle';
            style.textContent = [
                '@keyframes ivFadeIn{from{opacity:0}to{opacity:1}}',
                '@keyframes ivZoomIn{from{transform:scale(0.8);opacity:0}to{transform:scale(1);opacity:1}}'
            ].join('');
            document.head.appendChild(style);
        }

        modal.appendChild(closeBtn);
        modal.appendChild(img);
        document.body.appendChild(modal);

        function open(src, alt) {
            img.src = src;
            img.alt = alt || '';
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        function close() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }

        closeBtn.addEventListener('click', close);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) close();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') close();
        });

        // 绑定所有 .zoomable
        function bindAll() {
            document.querySelectorAll('img.zoomable').forEach(function(el) {
                if (el.__ivBound) return;
                el.__ivBound = true;
                el.style.cursor = 'zoom-in';
                el.addEventListener('click', function() { open(el.src, el.alt); });
            });
        }

        bindAll();
        // 观察后续添加的图片
        var observer = new MutationObserver(bindAll);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }

    global.ImageViewer = { init: init };

})(window);
