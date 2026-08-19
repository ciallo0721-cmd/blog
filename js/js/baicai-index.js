window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TR4FT7JPDZ');

(function() {
    var c = document.getElementById('petals');
    if (!c) return;
    for (var i = 0; i < 20; i++) {
        var p = document.createElement('div');
        p.className = 'petal';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (8 + Math.random() * 12) + 's';
        p.style.animationDelay = (Math.random() * 15) + 's';
        p.style.width = (10 + Math.random() * 12) + 'px';
        p.style.height = (10 + Math.random() * 12) + 'px';
        c.appendChild(p);
    }
})();