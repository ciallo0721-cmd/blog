window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TR4FT7JPDZ');

// 稀缺感动态计数器（基于月份计算剩余广告位）
(function() {
  var total = 5;
  var base = 3; // 月初已占用基数
  var now = new Date();
  var day = now.getDate();
  var daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  // 越到月底剩余越少
  var occupied = Math.min(total, base + Math.floor((day / daysInMonth) * (total - base)));
  var left = total - occupied;

  var el = document.getElementById('slotCount');
  if (el) el.textContent = left;

  // 如果已满
  if (left <= 0) {
    var els = document.querySelectorAll('[style*="color:#ff6b35"]');
    for (var i = 0; i < els.length; i++) {
      if (els[i].textContent.includes('仅剩')) {
        els[i].textContent = '😔 本月广告位已满，请下月再联系';
        els[i].style.color = '#999';
      }
    }
  }
})();