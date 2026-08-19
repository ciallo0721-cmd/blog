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

    // ========== 来源检测 ==========
    // 优先级：① URL 参数 ?userfrom=xxx（显式指定）
    //         ② document.referrer 自动判断来源域名（无需手动加参数）
    //         ③ localStorage 历史记录（全站跨页保留首次来源）
    // 都没有则为 null
    var USER_FROM_KEY = 'site_user_from';
    var userFromCache;

    function cleanFrom(v) {
        if (!v) return null;
        v = v.trim();
        if (!v) return null;
        if (v.length > 200) v = v.substring(0, 200);
        return v;
    }

    // ① URL 参数 ?userfrom=xxx
    function getFromUrl() {
        var params = new URLSearchParams(window.location.search);
        return cleanFrom(params.get('userfrom'));
    }

    // ② 自动判断：referrer 来源 host（含端口），本站自身跳转不算
    function getFromReferrer() {
        var ref = document.referrer;
        if (!ref) return null;
        try {
            var a = document.createElement('a');
            a.href = ref;
            if (!a.host) return null;
            if (a.host === window.location.host) return null;
            return a.host;
        } catch (e) { return null; }
    }

    window.getUserFrom = function() {
        if (userFromCache !== undefined) return userFromCache;
        var from = getFromUrl() || getFromReferrer();
        if (from !== null) {
            try { localStorage.setItem(USER_FROM_KEY, from); } catch (e) {}
            userFromCache = from;
            return from;
        }
        try { userFromCache = localStorage.getItem(USER_FROM_KEY); } catch (e) { userFromCache = null; }
        return userFromCache;
    };

    // ========== 发送 page_view 事件 ==========
    function trackPageView() {
        if (typeof gtag !== 'function') return;

        var meta = getPageMeta();
        gtag('event', 'page_view', {
            content_type: meta.content_type,
            page_name:    meta.page_name,
            category:     meta.category,
            page_path:    window.location.pathname + window.location.search,
            page_title:   document.title,
            user_from:    window.getUserFrom()
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
        eventParams.user_from    = window.getUserFrom();
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
