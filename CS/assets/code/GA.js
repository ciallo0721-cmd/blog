/* ============================================================
   CS · GA.js — GA4 埋点（由 index.html 内联 gtag 段外置）
   ============================================================ */
(function(){
  'use strict';
  // ① GA4 官方 snippet
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-TR4FT7JPDZ';
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', 'G-TR4FT7JPDZ');

  // ② 站内统一埋点模块（用户来源 / 页面事件）
  var c = document.createElement('script');
  c.async = true;
  c.src = '/assets/js/gtag-config.js';
  document.head.appendChild(c);
})();
