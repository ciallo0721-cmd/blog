/**
 * 图片查看器 v2.1 - /pic/image-viewer.js
 * 功能：点击图片全屏放大预览（模态框）
 *   - 支持 class="zoomable"（旧用法，兼容）
 *   - 支持 data-iv-zoom / data-iv-group（推荐），同组图片 ← → 切换
 *   - 滚轮缩放（以视口中心为原点，1x ~ 8x）
 *   - 底部控制条：− / 百分比 / + / 1·N 计数 / 重置
 *   - 放大后按住图片可拖动平移
 *   - ESC / 点击遮罩 / × 关闭；单击图片：未缩放=关闭，已缩放=重置
 * 用法：<script src="/pic/image-viewer.js"></script>（页面末尾）
 */
(function(global) {
    'use strict';

    function init() {
        if (document.getElementById('__ivModal')) return;

        // ---- 创建模态框 ----
        var modal = document.createElement('div');
        modal.id = '__ivModal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-label', '图片预览');
        modal.style.cssText = [
            'position:fixed;top:0;left:0;width:100%;height:100%;',
            'background:rgba(0,0,0,0.94);z-index:2147483000;',
            'display:none;align-items:center;justify-content:center;',
            'cursor:zoom-out;user-select:none;overflow:hidden;'
        ].join('');

        var img = document.createElement('img');
        img.id = '__ivImg';
        img.style.cssText = [
            'max-width:92vw;max-height:92vh;',
            'border-radius:8px;box-shadow:0 20px 80px rgba(0,0,0,0.6);',
            'background:#1a1a1a;opacity:0;',
            'transition:opacity .2s ease;object-fit:contain;',
            'cursor:zoom-out;will-change:transform;'
        ].join('');

        var loading = document.createElement('div');
        loading.id = '__ivLoading';
        loading.textContent = '加载中…';
        loading.style.cssText = [
            'position:absolute;color:#aaa;font-size:1rem;',
            'letter-spacing:2px;z-index:1;pointer-events:none;'
        ].join('');

        var errBox = document.createElement('div');
        errBox.id = '__ivError';
        errBox.textContent = '图片加载失败';
        errBox.style.cssText = [
            'display:none;color:#ff6b6b;font-size:1.1rem;',
            'letter-spacing:2px;z-index:1;pointer-events:none;'
        ].join('');

        var closeBtn = document.createElement('span');
        closeBtn.id = '__ivClose';
        closeBtn.innerHTML = '&times;';
        closeBtn.title = '关闭 (ESC)';
        closeBtn.style.cssText = [
            'position:absolute;top:16px;right:24px;z-index:3;',
            'color:#fff;font-size:3rem;line-height:1;cursor:pointer;',
            'opacity:.75;transition:opacity .15s;padding:4px;'
        ].join('');
        closeBtn.addEventListener('mouseenter', function() { closeBtn.style.opacity = '1'; });
        closeBtn.addEventListener('mouseleave', function() { closeBtn.style.opacity = '.75'; });

        var prevBtn = document.createElement('span');
        prevBtn.id = '__ivPrev';
        prevBtn.innerHTML = '&#10094;';
        prevBtn.title = '上一张 (←)';
        prevBtn.style.cssText = [
            'position:absolute;left:18px;top:50%;transform:translateY(-50%);z-index:3;',
            'color:#fff;font-size:2.4rem;cursor:pointer;opacity:.75;',
            'transition:opacity .15s;padding:10px 14px;user-select:none;'
        ].join('');

        var nextBtn = document.createElement('span');
        nextBtn.id = '__ivNext';
        nextBtn.innerHTML = '&#10095;';
        nextBtn.title = '下一张 (→)';
        nextBtn.style.cssText = [
            'position:absolute;right:18px;top:50%;transform:translateY(-50%);z-index:3;',
            'color:#fff;font-size:2.4rem;cursor:pointer;opacity:.75;',
            'transition:opacity .15s;padding:10px 14px;user-select:none;'
        ].join('');

        // ---- 底部控制条：− 百分比 + | 1/19 | 重置 ----
        var bar = document.createElement('div');
        bar.id = '__ivBar';
        bar.style.cssText = [
            'position:absolute;bottom:18px;left:50%;transform:translateX(-50%);z-index:3;',
            'display:flex;align-items:center;gap:14px;',
            'background:rgba(20,20,25,0.75);backdrop-filter:blur(6px);',
            'border:1px solid rgba(255,255,255,0.15);border-radius:30px;',
            'padding:7px 18px;color:#ddd;font-size:.95rem;user-select:none;'
        ].join('');

        function makeBtn(id, html, title) {
            var b = document.createElement('span');
            b.id = id;
            b.innerHTML = html;
            b.title = title;
            b.style.cssText = [
                'color:#fff;font-size:1.5rem;line-height:1;cursor:pointer;',
                'opacity:.8;transition:opacity .15s;padding:2px 6px;'
            ].join('');
            b.addEventListener('mouseenter', function() { b.style.opacity = '1'; });
            b.addEventListener('mouseleave', function() { b.style.opacity = '.8'; });
            return b;
        }

        var zoomOutBtn = makeBtn('__ivZoomOut', '&minus;', '缩小 (滚轮向下)');
        var zoomInBtn = makeBtn('__ivZoomIn', '&plus;', '放大 (滚轮向上)');
        var resetBtn = makeBtn('__ivReset', '&#10226;', '重置缩放 (双击)');
        var pct = document.createElement('span');
        pct.id = '__ivPct';
        pct.style.cssText = 'min-width:46px;text-align:center;color:#fff;font-size:.9rem;';
        pct.textContent = '100%';
        var counter = document.createElement('span');
        counter.id = '__ivCounter';
        counter.style.cssText = 'color:#aaa;font-size:.85rem;margin-left:6px;';

        bar.appendChild(zoomOutBtn);
        bar.appendChild(pct);
        bar.appendChild(zoomInBtn);
        bar.appendChild(counter);
        bar.appendChild(resetBtn);

        modal.appendChild(loading);
        modal.appendChild(errBox);
        modal.appendChild(img);
        modal.appendChild(closeBtn);
        modal.appendChild(prevBtn);
        modal.appendChild(nextBtn);
        modal.appendChild(bar);
        document.body.appendChild(modal);

        // ---- 缩放状态 ----
        var scale = 1, tx = 0, ty = 0;
        var isDragging = false, moved = false;
        var dragStartX = 0, dragStartY = 0, startTx = 0, startTy = 0;

        var groupList = [];
        var groupIndex = 0;

        function applyTransform(animate) {
            img.style.transition = animate ? 'transform .18s ease' : 'none';
            img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
        }

        function zoomTo(s, animate) {
            scale = Math.min(8, Math.max(1, s));
            if (scale === 1) { tx = 0; ty = 0; }
            applyTransform(animate);
            pct.textContent = Math.round(scale * 100) + '%';
        }

        function zoomBy(factor, animate) {
            zoomTo(scale * factor, animate);
        }

        function reset() {
            zoomTo(1, true);
        }

        function updateCounter() {
            counter.textContent = groupList.length > 1 ? (groupIndex + 1) + ' / ' + groupList.length : '';
        }

        function updateArrows() {
            var show = groupList.length > 1;
            prevBtn.style.display = show ? 'block' : 'none';
            nextBtn.style.display = show ? 'block' : 'none';
        }

        // 找出同组图片（data-iv-group 相同；无组则只有自己）
        function getGroup(el) {
            var g = el.getAttribute('data-iv-group');
            if (!g) return [el];
            return Array.prototype.slice.call(
                document.querySelectorAll('img[data-iv-group="' + g + '"]')
            ).filter(function(i) { return i.src; });
        }

        function showLoading() {
            loading.style.display = 'block';
            errBox.style.display = 'none';
            img.style.opacity = '0';
        }

        function hideLoading() {
            loading.style.display = 'none';
        }

        function open(el) {
            groupList = getGroup(el);
            groupIndex = groupList.indexOf(el);
            if (groupIndex === -1) groupIndex = 0;

            showLoading();
            reset();
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            img.onload = function() {
                hideLoading();
                img.style.opacity = '1';
            };
            img.onerror = function() {
                hideLoading();
                errBox.style.display = 'block';
            };
            img.src = el.src;
            img.alt = el.alt || '';
            updateCounter();
            updateArrows();
        }

        function close() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            img.src = '';
            reset();
        }

        function go(offset) {
            if (groupList.length < 2) return;
            var next = (groupIndex + offset + groupList.length) % groupList.length;
            groupIndex = next;
            open(groupList[next]);
        }

        // ---- 事件：关闭/切换 ----
        closeBtn.addEventListener('click', function(e) { e.stopPropagation(); close(); });
        prevBtn.addEventListener('click', function(e) { e.stopPropagation(); go(-1); });
        nextBtn.addEventListener('click', function(e) { e.stopPropagation(); go(1); });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) close();
        });
        document.addEventListener('keydown', function(e) {
            if (modal.style.display !== 'flex') return;
            if (e.key === 'Escape') close();
            else if (e.key === 'ArrowLeft') go(-1);
            else if (e.key === 'ArrowRight') go(1);
        });

        // ---- 事件：缩放（滚轮 + 按钮）----
        modal.addEventListener('wheel', function(e) {
            if (modal.style.display !== 'flex') return;
            e.preventDefault();
            var factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
            zoomBy(factor);
        }, { passive: false });

        zoomInBtn.addEventListener('click', function(e) { e.stopPropagation(); zoomBy(1.25, true); });
        zoomOutBtn.addEventListener('click', function(e) { e.stopPropagation(); zoomBy(0.8, true); });
        resetBtn.addEventListener('click', function(e) { e.stopPropagation(); reset(); });
        img.addEventListener('dblclick', function(e) { e.stopPropagation(); reset(); });

        // ---- 事件：拖动平移（放大后）----
        img.addEventListener('mousedown', function(e) {
            if (scale <= 1) return;
            e.preventDefault();
            isDragging = true;
            moved = false;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            startTx = tx;
            startTy = ty;
            img.style.cursor = 'grabbing';
        });
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            var dx = e.clientX - dragStartX;
            var dy = e.clientY - dragStartY;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved = true;
            tx = startTx + dx;
            ty = startTy + dy;
            applyTransform(false);
        });
        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                img.style.cursor = scale > 1 ? 'zoom-out' : 'zoom-out';
            }
        });

        // 单击：未缩放=关闭，已缩放=重置；拖动后不响应
        img.addEventListener('click', function(e) {
            e.stopPropagation();
            if (moved) { moved = false; return; }
            if (scale > 1) { reset(); return; }
            close();
        });

        // ---- 绑定页面图片 ----
        function bindOne(el) {
            if (el.__ivBound) return;
            el.__ivBound = true;
            el.style.cursor = 'zoom-in';
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                open(el);
            });
        }

        function bindAll() {
            var els = document.querySelectorAll('img.zoomable, img[data-iv-zoom], img[data-iv-group]');
            for (var i = 0; i < els.length; i++) bindOne(els[i]);
        }

        bindAll();
        if (window.MutationObserver) {
            new MutationObserver(bindAll).observe(document.body, {
                childList: true, subtree: true
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }

    global.ImageViewer = { init: init };

})(window);
