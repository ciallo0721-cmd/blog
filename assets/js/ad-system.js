/**
 * ==========================================
 *  ciallo0721-cmd 动态广告系统 v1.0
 *  智能标签偏好算法 + 动态投放
 * ==========================================
 *
 * 算法逻辑：
 *   1. 每种广告标签有初始权重 100
 *   2. 用户点击进入广告 → 该标签权重 +10（喜欢）
 *   3. 用户点"不感兴趣" → 该标签权重 -20（降权）+ 屏蔽该广告
 *   4. 加载时使用加权随机选择广告
 *   5. 同一页面不会展示重复广告
 *   6. 权重范围: 10 ~ 500
 */

;(function () {
  'use strict';

  // ============ 广告注册表 ============
  var AD_REGISTRY = [
    { id: 'game',    tag: '游戏',   icon: '🎮', svg: '/css/ads/ad-game.svg',    link: '/adss.html', c1: '#FF4757', c2: '#FF6B81' },
    { id: 'tool',    tag: '工具',   icon: '🛠️', svg: '/css/ads/ad-tool.svg',    link: '/adss.html', c1: '#FF6B35', c2: '#FF9F6E' },
    { id: 'edu',     tag: '教育',   icon: '📚', svg: '/css/ads/ad-edu.svg',     link: '/adss.html', c1: '#FFD93D', c2: '#FFE97A' },
    { id: 'design',  tag: '设计',   icon: '🎨', svg: '/css/ads/ad-design.svg',  link: '/adss.html', c1: '#2ED573', c2: '#7BED9F' },
    { id: 'music',   tag: '音乐',   icon: '🎵', svg: '/css/ads/ad-music.svg',   link: '/adss.html', c1: '#1E90FF', c2: '#63B3FF' },
    { id: 'code',    tag: '编程',   icon: '💻', svg: '/css/ads/ad-code.svg',    link: '/adss.html', c1: '#3366FF', c2: '#7094FF' },
    { id: 'ai',      tag: 'AI智能', icon: '🤖', svg: '/css/ads/ad-ai.svg',      link: '/adss.html', c1: '#7C3AED', c2: '#A78BFA' },
    { id: 'app',     tag: '应用',   icon: '📱', svg: '/css/ads/ad-app.svg',     link: '/adss.html', c1: '#E040FB', c2: '#F48FB1' },
    { id: 'video',   tag: '影视',   icon: '🎬', svg: '/css/ads/ad-video.svg',   link: '/adss.html', c1: '#FF4081', c2: '#FF80AB' },
    { id: 'read',    tag: '阅读',   icon: '📖', svg: '/css/ads/ad-read.svg',    link: '/adss.html', c1: '#8D6E63', c2: '#BCAAA4' },
    { id: 'shop',    tag: '购物',   icon: '🛒', svg: '/css/ads/ad-shop.svg',    link: '/adss.html', c1: '#FF6D00', c2: '#FFAB40' },
    { id: 'health',  tag: '健康',   icon: '🏃', svg: '/css/ads/ad-health.svg',  link: '/adss.html', c1: '#76FF03', c2: '#B2FF59' },
    { id: 'product', tag: '效率',   icon: '🎯', svg: '/css/ads/ad-product.svg', link: '/adss.html', c1: '#00BCD4', c2: '#4DD0E1' },
    { id: 'social',  tag: '社交',   icon: '🌍', svg: '/css/ads/ad-social.svg',  link: '/adss.html', c1: '#FF6E6E', c2: '#FF9E9E' },
    { id: 'fun',     tag: '娱乐',   icon: '🎲', svg: '/css/ads/ad-fun.svg',     link: '/adss.html', c1: '#FF408C', c2: '#FF79B0' }
  ];

  // ============ 偏好引擎 ============
  var STORAGE_KEY  = 'ciallo_ad_prefs';
  var BASE_WEIGHT  = 100;
  var LIKE_BONUS   = 10;
  var DISLIKE_PENALTY = 40;
  var MIN_WEIGHT   = 10;
  var MAX_WEIGHT   = 500;

  function loadPrefs() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var p = JSON.parse(raw);
        // 迁移：v1 的 blocked 列表已废弃，清除
        if (p.blocked && p.blocked.length > 0) {
          console.log('[AdSystem] 迁移：清除旧的屏蔽列表 ' + JSON.stringify(p.blocked));
          delete p.blocked;
        }
        return p;
      }
    } catch (e) { /* ignore */ }
    return { weights: {}, history: [] };
  }

  function savePrefs(prefs) {
    try {
      // 只保留最近 50 条历史
      if (prefs.history && prefs.history.length > 50) {
        prefs.history = prefs.history.slice(-50);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) { /* ignore */ }
  }

  /** 获取某个标签的当前权重 */
  function getTagWeight(prefs, tag) {
    return prefs.weights[tag] || BASE_WEIGHT;
  }

  /** 根据偏好做加权随机选择 */
  function weightedRandomSelect(prefs, candidates) {
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    // 计算每个候选的总权重
    var total = 0;
    var weighted = candidates.map(function (ad) {
      var w = getTagWeight(prefs, ad.tag);
      total += w;
      return { ad: ad, w: w };
    });

    if (total === 0) {
      // 所有权重都为 0，均匀随机
      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    var rand = Math.random() * total;
    var cum = 0;
    for (var i = 0; i < weighted.length; i++) {
      cum += weighted[i].w;
      if (rand <= cum) return weighted[i].ad;
    }
    return weighted[weighted.length - 1].ad;
  }

  /** 获取可用广告（允许重复，不屏蔽任何广告） */
  function getAvailable(prefs) {
    return AD_REGISTRY.slice(); // 返回全部广告的副本
  }

  /** 重置偏好（调试用） */
  function resetPrefs() {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[AdSystem] 偏好已重置');
  }

  // ============ 交互处理 ============

  /** 用户点击广告进入 */
  function onAdEnter(adId) {
    var ad = AD_REGISTRY.find(function (a) { return a.id === adId; });
    if (!ad) return;

    var p = loadPrefs();
    var oldW = getTagWeight(p, ad.tag);
    p.weights[ad.tag] = Math.min(MAX_WEIGHT, oldW + LIKE_BONUS);
    p.history = p.history || [];
    p.history.push({ action: 'enter', adId: adId, tag: ad.tag, time: Date.now() });
    savePrefs(p);

    console.log('[AdSystem] 喜欢「' + ad.tag + '」权重: ' + oldW + ' → ' + p.weights[ad.tag]);
  }

  /** 用户点击不感兴趣（仅降权，不封杀） */
  function onAdDislike(adId) {
    var ad = AD_REGISTRY.find(function (a) { return a.id === adId; });
    if (!ad) return;

    var p = loadPrefs();
    var oldW = getTagWeight(p, ad.tag);
    p.weights[ad.tag] = Math.max(MIN_WEIGHT, oldW - DISLIKE_PENALTY);
    p.history = p.history || [];
    p.history.push({ action: 'dislike', adId: adId, tag: ad.tag, time: Date.now() });
    savePrefs(p);

    console.log('[AdSystem] 不感兴趣「' + ad.tag + '」权重: ' + oldW + ' → ' + p.weights[ad.tag] + ' (不屏蔽)');
  }

  // ============ 渲染 ============

  /**
   * 创建一个广告位 DOM
   * @param {string} adId 指定广告 ID（可选，不传则智能选择）
   * @returns {HTMLElement|null}
   */
  function createAdSlot(adId) {
    var p = loadPrefs();

    var ad;
    if (adId) {
      ad = AD_REGISTRY.find(function (a) { return a.id === adId; });
    } else {
      var available = getAvailable(p);
      if (available.length === 0) return null;
      ad = weightedRandomSelect(p, available);
    }

    if (!ad) return null;

    return buildAdDOM(ad);
  }

  /** 构建广告卡片 DOM */
  function buildAdDOM(ad) {
    var wrapper = document.createElement('div');
    wrapper.className = 'ad-card-wrapper';
    wrapper.setAttribute('data-ad-id', ad.id);
    wrapper.setAttribute('data-ad-tag', ad.tag);
    wrapper.setAttribute('data-ad-icon', ad.icon);

    wrapper.innerHTML =
      '<div class="ad-card">' +
        '<a href="' + ad.link + '" class="ad-card-link" target="_blank" rel="noopener" title="查看「' + ad.tag + '」广告详情">' +
          '<img src="' + ad.svg + '" alt="' + ad.tag + ' · 广告位招租" class="ad-card-img" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';" />' +
          '<div class="ad-card-fallback" style="display:none;width:100%;aspect-ratio:728/90;align-items:center;justify-content:center;background:linear-gradient(135deg,' + ad.c1 + ',' + ad.c2 + ');border-radius:12px;color:white;font-size:18px;font-weight:700;font-family:\'PingFang SC\',\'Microsoft YaHei\',sans-serif;">' + ad.icon + ' ' + ad.tag + ' · 广告位招租</div>' +
        '</a>' +
        '<button class="ad-card-dislike" title="不感兴趣，减少此类推荐" aria-label="不感兴趣">' +
          '<svg viewBox="0 0 16 16" width="12" height="12"><path fill="currentColor" d="M8 1a7 7 0 100 14A7 7 0 008 1zm2.35 9.35a.5.5 0 01-.7.7L8 8.71l-1.65 1.64a.5.5 0 01-.7-.7L7.29 8 5.65 6.35a.5.5 0 01.7-.7L8 7.29l1.65-1.64a.5.5 0 01.7.7L8.71 8l1.64 1.65z"/></svg>' +
        '</button>' +
        '<span class="ad-card-tag" title="广告分类：' + ad.tag + '">' + ad.icon + ' ' + ad.tag + '</span>' +
      '</div>';

    // 进入事件
    var link = wrapper.querySelector('.ad-card-link');
    link.addEventListener('click', function () {
      onAdEnter(ad.id);
    });

    // 不感兴趣事件
    var dislikeBtn = wrapper.querySelector('.ad-card-dislike');
    dislikeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      onAdDislike(ad.id);

      // 动画移除
      wrapper.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      wrapper.style.opacity = '0';
      wrapper.style.transform = 'scale(0.9)';
      setTimeout(function () {
        if (wrapper.parentNode) {
          wrapper.parentNode.removeChild(wrapper);
        }
      }, 300);
    });

    return wrapper;
  }

  /**
   * 初始化页面中所有 [data-ad-slot] 容器
   * 用法: <div data-ad-slot></div>
   * 可选: <div data-ad-slot data-ad-id="game"></div> 指定具体广告
   */
  function initAdSlots() {
    var slots = document.querySelectorAll('[data-ad-slot]');
    
    // 始终在页面底部添加一个可见标记，证明 AdSystem 已运行
    var debugMarker = document.createElement('div');
    debugMarker.style.cssText = 'text-align:center;padding:8px;margin:0 auto;max-width:728px;font-size:11px;color:#aaa;font-family:"PingFang SC","Microsoft YaHei",sans-serif;';
    debugMarker.textContent = '[AdSystem v1.0] 检测到 ' + slots.length + ' 个广告位 | 标签偏好算法已启用';
    // 找到最后一个 ad-slot 的父节点，在后面追加
    if (slots.length > 0) {
      var lastSlot = slots[slots.length - 1];
      lastSlot.parentNode.insertBefore(debugMarker, lastSlot.nextSibling);
    }
    
    if (slots.length === 0) {
      console.log('[AdSystem] 未检测到广告位容器 (data-ad-slot)');
      return;
    }

    console.log('[AdSystem] 检测到 ' + slots.length + ' 个广告位，开始智能投放...');

    for (var i = 0; i < slots.length; i++) {
      var slot = slots[i];
      // 跳过已填充的广告位（支持多次调用 init）
      if (slot.children.length > 0) continue;
      var specifiedId = slot.getAttribute('data-ad-id') || null;
      var adEl = createAdSlot(specifiedId);
      if (adEl) {
        slot.appendChild(adEl);
      } else {
        // 没有可用广告时显示兜底
        slot.innerHTML = '<div class="ad-empty">暂无广告喵～</div>';
      }
    }

    // 打印偏好摘要
    var p = loadPrefs();
    console.log('[AdSystem] 当前偏好: ' + JSON.stringify(p.weights));
  }

  // ============ 导出 API ============
  window.AdSystem = {
    init: initAdSlots,
    reset: resetPrefs,
    getPrefs: loadPrefs,
    getAd: createAdSlot,
    registry: AD_REGISTRY
  };

  // ============ 注入样式（与网站蓝色渐变主题统一） ============
  function injectStyles() {
    var style = document.createElement('style');
    style.textContent =
      /* 广告卡片外层容器 */
      '[data-ad-slot] { width: 100%; }' +
      '.ad-card-wrapper { position: relative; width: 100%; max-width: 728px; margin: 0 auto; }' +

      /* 广告卡片主体 */
      '.ad-card { position: relative; width: 100%; line-height: 0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.08); transition: all 0.35s cubic-bezier(0.4,0,0.2,1); border: 1px solid rgba(51,102,255,0.12); }' +
      '.ad-card:hover { box-shadow: 0 6px 28px rgba(51,102,255,0.22); transform: translateY(-2px); border-color: rgba(51,102,255,0.3); }' +

      /* 广告图片 */
      '.ad-card-img { width: 100%; height: auto; display: block; border-radius: 12px; }' +

      /* 广告链接 */
      '.ad-card-link { display: block; width: 100%; line-height: 0; text-decoration: none; }' +

      /* 不感兴趣按钮 */
      '.ad-card-dislike { position: absolute; top: 8px; right: 8px; width: 26px; height: 26px; padding: 0; border: none; border-radius: 50%; background: rgba(0,0,0,0.35); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s ease, background 0.2s ease; z-index: 10; }' +
      '.ad-card:hover .ad-card-dislike { opacity: 1; }' +
      '.ad-card-dislike:hover { background: rgba(255,71,87,0.85); }' +

      /* 标签徽章 */
      '.ad-card-tag { position: absolute; bottom: 8px; left: 8px; padding: 3px 10px; background: rgba(0,0,0,0.45); color: #fff; font-size: 11px; border-radius: 10px; font-family: "PingFang SC","Microsoft YaHei",sans-serif; white-space: nowrap; pointer-events: none; }' +

      /* 兜底文字 */
      '.ad-empty { text-align: center; color: #999; padding: 20px; font-size: 13px; font-family: "PingFang SC","Microsoft YaHei",sans-serif; }' +

      /* 响应式 */
      '@media (max-width: 768px) { .ad-card-dislike { opacity: 1; width: 22px; height: 22px; top: 4px; right: 4px; } .ad-card-tag { font-size: 10px; padding: 2px 8px; bottom: 4px; left: 4px; } }';

    document.head.appendChild(style);
  }

  // ============ 自动启动（多重保障） ============
  injectStyles();

  // 立即尝试一次
  if (document.readyState !== 'loading') {
    initAdSlots();
  }
  // DOMContentLoaded 再试一次
  document.addEventListener('DOMContentLoaded', initAdSlots);
  // 1秒后再试一次（兜底）
  setTimeout(initAdSlots, 1000);
})();
