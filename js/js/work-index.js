window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TR4FT7JPDZ');

"use strict";
    var outputEl  = document.getElementById('output');
    var inputEl   = document.getElementById('inputField');
    var sendBtn   = document.getElementById('sendBtn');
    var statusEl  = document.getElementById('statusText');
    var overlayEl = document.getElementById('loadingOverlay');

    var ansiMap = {
      '0;30':'ansi-reset','30':'ansi-reset','0;31':'ansi-red','31':'ansi-red',
      '0;32':'ansi-green','32':'ansi-green','0;33':'ansi-yellow','33':'ansi-yellow',
      '0;34':'ansi-blue','34':'ansi-blue','0;35':'ansi-magenta','35':'ansi-magenta',
      '0;36':'ansi-cyan','36':'ansi-cyan','0;37':'ansi-white','37':'ansi-white',
      '0':'ansi-reset','1':'ansi-bold',
      '1;31':'ansi-red ansi-bold','1;32':'ansi-green ansi-bold','1;33':'ansi-yellow ansi-bold',
      '1;34':'ansi-blue ansi-bold','1;35':'ansi-magenta ansi-bold','1;36':'ansi-cyan ansi-bold','1;37':'ansi-white ansi-bold',
    };

    function ansiToHtml(text) {
      text = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      text = text.replace(/\x1b\[2J\x1b\[?H/g,'\n\u2500\u2500\u2500\u2500\u2500\n');
      text = text.replace(/\x1b\[2J/g,'').replace(/\x1b\[\d*(?:[ABCDEFGKST])/g,'').replace(/\x1b\[H/g,'').replace(/\x1b\[\d*;\d*[Hf]/g,'');
      return text.replace(/\x1b\[([\d;]*)m/g,function(m,c){if(c===''||c==='0')return '</span><span class="ansi-reset">';var x=ansiMap[c];return x?'</span><span class="'+x+'">':'';});
    }

    var _first = true;
    function writeOutput(text) {
      var html = ansiToHtml(text);
      if (_first) { outputEl.innerHTML = html; _first = false; }
      else { outputEl.innerHTML += html; }
      outputEl.scrollTop = outputEl.scrollHeight;
    }
    function writeHtml(html) {
      if (_first) { outputEl.innerHTML = html; _first = false; }
      else { outputEl.innerHTML += html; }
      outputEl.scrollTop = outputEl.scrollHeight;
    }

    var inputQueue = []; window.__inputQueue = inputQueue;
    function queueLine(t) { for(var i=0;i<t.length;i++) inputQueue.push(t.charCodeAt(i)); inputQueue.push(10); }
    function submitInput(t) { if(!t)t=''; queueLine(t); inputEl.value=''; }

    inputEl.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();submitInput(inputEl.value);}});
    sendBtn.addEventListener('click',function(){submitInput(inputEl.value);});
    document.addEventListener('click',function(){if(!inputEl.disabled)inputEl.focus();});
    document.addEventListener('keydown',function(e){
      if(document.activeElement===inputEl||e.ctrlKey||e.altKey||e.metaKey)return;
      if(e.key==='Enter'){inputQueue.push(10);e.preventDefault();}
      else if(e.key.length===1){inputQueue.push(e.key.charCodeAt(0));e.preventDefault();}
    });

    // localStorage 存档
    (function(){
      var fn='worker_sim_save.dat';
      function load(){try{var s=localStorage.getItem(fn);if(s&&typeof FS!=='undefined'){var b=atob(s),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);FS.writeFile(fn,a);}}catch(e){}}
      function save(){try{if(typeof FS!=='undefined'&&FS.analyzePath){var i=FS.analyzePath(fn);if(i.exists){var d=FS.readFile(fn,{encoding:'binary'}),bin='';for(var j=0;j<d.length;j++)bin+=String.fromCharCode(d[j]);localStorage.setItem(fn,btoa(bin));}}}catch(e){}}
      window.__saveGame=save; window.__loadGame=load;
      setInterval(save,5000);
      document.addEventListener('keydown',function(e){if(e.ctrlKey&&e.key==='s'){e.preventDefault();save();writeHtml('\n<span style="color:#27c93f;">\uD83D\uDCBE 存档已保存</span>\n');}});
    })();

    var setStatus = function(t){if(t)statusEl.textContent=t;else{overlayEl.classList.add('hidden');inputEl.disabled=false;sendBtn.disabled=false;inputEl.focus();}};

    var Module = {
      print: function(){var t=Array.prototype.join.call(arguments,' ');writeOutput(t+'\n');},
      printErr: function(){var t=Array.prototype.join.call(arguments,' ');if(t.indexOf('stdio')>=0||t.indexOf('EXIT_RUNTIME')>=0)return;writeHtml('\n<span style="color:#ff6b6b;">[错误] '+ansiToHtml(t)+'</span>\n');},
      setStatus: setStatus,
      preRun: [function(){if(window.__loadGame)window.__loadGame();if(typeof FS!=='undefined')FS.init(function(){if(inputQueue.length>0)return inputQueue.shift();return null;},null,null);writeHtml('<span style="color:#555;">\u8F93\u5165\u7CFB\u7EDF\u5C31\u7EEA \u2713</span>\n');}],
      totalDependencies: 0,
      monitorRunDependencies: function(l){this.totalDependencies=Math.max(this.totalDependencies,l);if(l)setStatus('\u52A0\u8F7D\u8D44\u6E90... ('+(this.totalDependencies-l)+'/'+this.totalDependencies+')');else{setStatus('\u52A0\u8F7D\u5B8C\u6210 \u2713');setTimeout(function(){overlayEl.classList.add('hidden');inputEl.disabled=false;sendBtn.disabled=false;inputEl.focus();setTimeout(window.__saveGame,1000);writeHtml('<span style="color:#27c93f;">\u2550\u2550\u2550\u2550\u2550\u2550 \u6253\u5DE5\u6A21\u62DF\u5668 \u5DF2\u542F\u52A8 \u2550\u2550\u2550\u2550\u2550\u2550</span>\n\n');},300);}},
      canvas: function(){var c=document.getElementById('canvas');if(!c){c=document.createElement('canvas');c.id='canvas';c.style.display='none';document.body.appendChild(c);}return c;}()
    };

    Module.onRuntimeInitialized = function(){
      if(typeof FS_stdin_getChar!=='undefined')window.FS_stdin_getChar=function(){if(inputQueue.length>0)return inputQueue.shift();return null;};
      if(typeof FS_stdin_getChar_buffer!=='undefined')FS_stdin_getChar_buffer=[];
    };

    window.onerror=window.onunhandledrejection=function(){setStatus('\u53D1\u751F\u9519\u8BEF');overlayEl.classList.add('hidden');};
    window.Module=Module;