/**
 * GA4 统一埋点模块 - gtag-config.js
 * 适用于纯静态站，无依赖
 * 
 * 使用方式：
 * 1. 在 <head> 里定义 window.pageMeta
 * 2. 引入 GA4 gtag 官方 Snippet
 * 3. 引入本文件：<script src="/assets/js/gtag-config.js"></script>
 * 
 * window.pageMeta 格式：
 *   window.pageMeta = {
 *     content_type: 'blog' | 'app' | 'experiment' | 'landing' | 'system',
 *     page_name:    'string',   // 页面标识
 *     category:     'string'    // 可选，分类
 *   };
 */

(function() {
    'use strict';

    var DEFAULT_CONTENT_TYPE = 'unknown';
    var DEFAULT_PAGE_NAME = 'untitled';

    // ========== 获取页面元信息 ==========
    function getPageMeta() {
        var meta = window.pageMeta || {};
        return {
            content_type: meta.content_type || DEFAULT_CONTENT_TYPE,
            page_name:    meta.page_name    || window.location.pathname + window.location.search,
            category:     meta.category     || ''
        };
    }

    // ========== 发送 page_view 事件 ==========
    function trackPageView() {
        if (typeof gtag !== 'function') return;

        var meta = getPageMeta();
        gtag('event', 'page_view', {
            content_type: meta.content_type,
            page_name:    meta.page_name,
            category:     meta.category,
            page_path:    window.location.pathname + window.location.search,
            page_title:   document.title
        });
    }

    // ========== 应用事件追踪 ==========
    // 应用页面调用：window.trackAppEvent('event_name', {...})
    window.trackAppEvent = function(eventName, params) {
        if (typeof gtag !== 'function') return;
        var meta = getPageMeta();
        var eventParams = params || {};
        eventParams.content_type = meta.content_type;
        eventParams.page_name    = meta.page_name;
        gtag('event', eventName, eventParams);
    };

    // ========== 自动追踪应用页面生命周期 ==========
    function autoTrackApp() {
        var meta = getPageMeta();
        if (meta.content_type !== 'app') return;

        // 页面加载 → app_start
        trackAppEvent('app_start');

        // 页面报错 → app_error
        window.addEventListener('error', function(e) {
            trackAppEvent('app_error', {
                error_message: e.message || '',
                error_source:  e.filename || ''
            });
        });

        // 页面成功运行 5 秒后 → app_success（简单心跳）
        setTimeout(function() {
            trackAppEvent('app_success', { duration: 5 });
        }, 5000);
    }

    // ========== 初始化 ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            trackPageView();
            autoTrackApp();
        });
    } else {
        trackPageView();
        autoTrackApp();
    }

})();
