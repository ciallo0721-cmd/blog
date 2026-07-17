/* ====================
   AudioEngine — Web Audio API 纯合成音效引擎
   镜中人 (The Man in the Mirror)
   ====================
   依赖: 无 (零外部依赖)
   实现: Web Audio API 原生合成
   版本: v1.0
   ==================== */
(function() {
  'use strict';

  const AudioEngine = {
    _ctx: null,
    _masterGain: null,
    _masterCompressor: null,
    _muted: false,
    _initialized: false,

    // Bus gains
    _buses: {},

    // CRT hum 节点引用
    _crtHum: null,
    _crtHumGain: null,

    // Deep drone 节点引用
    _deepDrone: null,
    _deepDroneGain: null,

    /* ====================
       Init — 创建音频上下文和主总线
       需在用户交互后调用（遵守 autoplay policy）
       ==================== */
    init() {
      if (this._initialized) return;
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this._ctx = new AC();

        // Master compressor
        this._masterCompressor = this._ctx.createDynamicsCompressor();
        this._masterCompressor.threshold.value = -12;
        this._masterCompressor.ratio.value = 3;
        this._masterCompressor.knee.value = 6;
        this._masterCompressor.connect(this._ctx.destination);

        // Master gain
        this._masterGain = this._ctx.createGain();
        this._masterGain.gain.value = 0.7;
        this._masterGain.connect(this._masterCompressor);

        // Create buses
        var busNames = ['ambient', 'ui', 'transition', 'supernatural', 'ending'];
        for (var b = 0; b < busNames.length; b++) {
          var gain = this._ctx.createGain();
          gain.gain.value = 1.0;
          gain.connect(this._masterGain);
          this._buses[busNames[b]] = gain;
        }

        // Start CRT hum
        this._startCRTHum();

        this._initialized = true;
      } catch (e) {
        // 静默降级 — 不影响游戏运行
      }
    },

    /* ====================
       Public API
       ==================== */

    /** 播放指定音效（fire-and-forget） */
    play(name, options) {
      if (!this._ctx) return;
      if (this._muted) return;
      options = options || {};

      switch (name) {
        case 'click':        this._synthClick(options); break;
        case 'windowOpen':   this._synthWindowOpen(options); break;
        case 'windowClose':  this._synthWindowClose(options); break;
        case 'modem':        this._synthModem(options); break;
        case 'connect':      this._synthConnectSuccess(options); break;
        case 'glitch':       this._synthGlitch(options); break;
        case 'deepDrone':    this._startDeepDrone(options); break;
        case 'endingA':      this._synthEndingA(options); break;
        case 'endingB':      this._synthEndingB(options); break;
        case 'endingC':      this._synthEndingC(options); break;
        case 'endingD':      this._synthEndingD(options); break;
        case 'endingE':      this._synthEndingE(options); break;
        default: break;
      }
    },

    /** 停止指定持续音效 */
    stop(name) {
      if (name === 'deepDrone') this._stopDeepDrone();
    },

    /** 停止所有持续音效 */
    stopAll() {
      this._stopDeepDrone();
      this._stopCRTHum();
    },

    /** 设置主音量 (0-1) */
    setVolume(level) {
      if (!this._masterGain) return;
      this._masterGain.gain.value = Math.max(0, Math.min(1, level));
    },

    /** 静音 */
    mute() {
      this._muted = true;
      if (this._masterGain) this._masterGain.gain.value = 0;
    },

    /** 取消静音 */
    unmute() {
      this._muted = false;
      if (this._masterGain) this._masterGain.gain.value = 0.7;
    },

    /** 设置 CRT 底噪强度 (0=静音, 1=普通, 2=紧张) */
    setBgIntensity(level) {
      if (!this._crtHumGain) return;
      var v = 0;
      if (level === 1) v = 0.08;
      else if (level === 2) v = 0.25;
      this._crtHumGain.gain.value = v;
    },

    /* ====================
       Internal: CRT 底噪 (SFX-01)
       60Hz + 120Hz 正弦波 + 低通滤波白噪声
       ==================== */
    _startCRTHum() {
      var ctx = this._ctx;
      var bus = this._buses.ambient;

      // Mix gain
      var mixGain = ctx.createGain();
      mixGain.gain.value = 0.08; // -18dB
      mixGain.connect(bus);
      this._crtHumGain = mixGain;

      // 60Hz
      var osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = 60;
      var g1 = ctx.createGain();
      g1.gain.value = 0.5;
      osc1.connect(g1);
      g1.connect(mixGain);
      osc1.start();

      // 120Hz (harmonic)
      var osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = 120;
      var g2 = ctx.createGain();
      g2.gain.value = 0.25;
      osc2.connect(g2);
      g2.connect(mixGain);
      osc2.start();

      // Filtered noise
      var bufSize = ctx.sampleRate * 2;
      var buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bufSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      var noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      var noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.15;
      var noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 800;
      noise.connect(noiseGain);
      noiseGain.connect(noiseFilter);
      noiseFilter.connect(mixGain);
      noise.start();

      this._crtHum = { osc1: osc1, osc2: osc2, noise: noise, mixGain: mixGain };
    },

    _stopCRTHum() {
      if (this._crtHumGain) {
        var t = this._ctx.currentTime;
        this._crtHumGain.gain.linearRampToValueAtTime(0, t + 1);
        var self = this;
        setTimeout(function() {
          if (self._crtHum) {
            try { self._crtHum.osc1.stop(); } catch(e) {}
            try { self._crtHum.osc2.stop(); } catch(e) {}
            try { self._crtHum.noise.stop(); } catch(e) {}
          }
        }, 1500);
      }
    },

    /* ====================
       Internal: 按钮点击 (SFX-05)
       方波 800Hz ±50Hz, 50ms
       ==================== */
    _synthClick(options) {
      var ctx = this._ctx;
      var bus = this._buses.ui;
      var t = ctx.currentTime;

      var osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = 800 + (Math.random() - 0.5) * 100;

      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(t);
      osc.stop(t + 0.05);
    },

    /* ====================
       Internal: 窗口打开 (SFX-02)
       方波 200→800Hz 扫频, 0.2s
       ==================== */
    _synthWindowOpen(options) {
      var ctx = this._ctx;
      var bus = this._buses.ui;
      var t = ctx.currentTime;

      var osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.2);

      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(t);
      osc.stop(t + 0.2);
    },

    /* ====================
       Internal: 窗口关闭 (SFX-03)
       方波 800→150Hz 降频, 0.15s
       ==================== */
    _synthWindowClose(options) {
      var ctx = this._ctx;
      var bus = this._buses.ui;
      var t = ctx.currentTime;

      var osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.15);

      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(t);
      osc.stop(t + 0.15);
    },

    /* ====================
       Internal: Modem 拨号 (SFX-08)
       DTMF 序列 + 载波扫描 + 握手噪声, 3-8s
       ==================== */
    _synthModem(options) {
      var ctx = this._ctx;
      var bus = this._buses.transition;
      var speed = options.speed || 1.0;
      var t = ctx.currentTime;

      // DTMF tone pairs (matrix)
      var dtmfPairs = [
        [697, 1209], [697, 1336], [697, 1477], // 1, 2, 3
        [770, 1209], [770, 1336], [770, 1477], // 4, 5, 6
        [852, 1209], [852, 1336], [852, 1477]  // 7, 8, 9
      ];
      var dialSeq = [0, 5, 8, 2, 4]; // dial "1-6-9-3-5"
      var dtmfDur = 0.1 / speed;
      var dtmfGap = 0.05 / speed;

      // Phase 1: DTMF dial tones
      for (var d = 0; d < dialSeq.length; d++) {
        var idx = dialSeq[d];
        var startT = t + d * (dtmfDur + dtmfGap);
        if (idx >= dtmfPairs.length) continue;
        var pair = dtmfPairs[idx];
        // Two frequencies per digit
        for (var f = 0; f < 2; f++) {
          var o = ctx.createOscillator();
          o.type = 'sine';
          o.frequency.value = pair[f];
          var g = ctx.createGain();
          g.gain.setValueAtTime(0.08, startT);
          g.gain.exponentialRampToValueAtTime(0.001, startT + dtmfDur);
          o.connect(g);
          g.connect(bus);
          o.start(startT);
          o.stop(startT + dtmfDur);
        }
      }

      // Phase 2: Carrier sweep (1200→2400Hz) with FM
      var carrierStart = t + dialSeq.length * (dtmfDur + dtmfGap);
      var carrierOsc = ctx.createOscillator();
      carrierOsc.type = 'sine';
      carrierOsc.frequency.setValueAtTime(1200, carrierStart);
      carrierOsc.frequency.exponentialRampToValueAtTime(2400, carrierStart + 1.0 / speed);

      // FM modulation for "warble"
      var lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 8;
      var lfoGain = ctx.createGain();
      lfoGain.gain.value = 10;
      lfo.connect(lfoGain);
      lfoGain.connect(carrierOsc.frequency);
      lfo.start(carrierStart);
      lfo.stop(carrierStart + 1.0 / speed);

      var carrierGain = ctx.createGain();
      carrierGain.gain.setValueAtTime(0.1, carrierStart);
      carrierGain.gain.exponentialRampToValueAtTime(0.001, carrierStart + 1.0 / speed);
      carrierOsc.connect(carrierGain);
      carrierGain.connect(bus);
      carrierOsc.start(carrierStart);
      carrierOsc.stop(carrierStart + 1.0 / speed);

      // Phase 3: Handshake noise (bandpass)
      var noiseStart = carrierStart + 1.0 / speed;
      var noiseDur = 1.5 / speed;
      var bufSize = ctx.sampleRate * noiseDur;
      var buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var ni = 0; ni < bufSize; ni++) {
        d[ni] = Math.random() * 2 - 1;
      }
      var noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = buf;
      var noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 1800;
      noiseFilter.Q.value = 0.5;
      var noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, noiseStart);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, noiseStart + noiseDur);
      noiseSrc.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(bus);
      noiseSrc.start(noiseStart);
      noiseSrc.stop(noiseStart + noiseDur);
    },

    /* ====================
       Internal: 连接成功 (SFX-09 简化版)
       稳定音调 + 噪声骤降, 0.5s
       ==================== */
    _synthConnectSuccess(options) {
      var ctx = this._ctx;
      var bus = this._buses.transition;
      var t = ctx.currentTime;

      // Short rising tone
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.4);

      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(t);
      osc.stop(t + 0.5);
    },

    /* ====================
       Internal: Glitch 爆发 (SFX-10)
       白噪声 + 带通滤波 + 位压缩模拟, 0.3-1.0s
       ==================== */
    _synthGlitch(options) {
      var ctx = this._ctx;
      var bus = this._buses.supernatural;
      var intensity = options.intensity || 0.5;
      var t = ctx.currentTime;
      var duration = 0.3 + intensity * 0.7;

      // White noise
      var bufSize = ctx.sampleRate * duration;
      var buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < bufSize; i++) {
        d[i] = Math.random() * 2 - 1;
      }
      var noise = ctx.createBufferSource();
      noise.buffer = buf;

      // Bandpass filter (random center)
      var bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 800 + Math.random() * 2200;
      bp.Q.value = 2 + intensity * 3;

      // Envelope
      var env = ctx.createGain();
      env.gain.setValueAtTime(0.001, t);
      env.gain.linearRampToValueAtTime(0.3 * intensity, t + 0.02);
      env.gain.linearRampToValueAtTime(0.2 * intensity, t + duration * 0.5);
      env.gain.linearRampToValueAtTime(0.001, t + duration);

      noise.connect(bp);
      bp.connect(env);
      env.connect(bus);
      noise.start(t);
      noise.stop(t + duration);

      // High intensity: bitcrush simulation via square wave
      if (intensity > 0.6) {
        var crushOsc = ctx.createOscillator();
        crushOsc.type = 'square';
        crushOsc.frequency.value = 1000 + Math.random() * 2000;
        var crushGain = ctx.createGain();
        crushGain.gain.setValueAtTime(0.05 * intensity, t);
        crushGain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        crushOsc.connect(crushGain);
        crushGain.connect(bus);
        crushOsc.start(t);
        crushOsc.stop(t + duration);
      }
    },

    /* ====================
       Internal: 镜中人低频 (SFX-12)
       25Hz + 50Hz sub-bass + LFO 调制
       ==================== */
    _startDeepDrone(options) {
      if (this._deepDrone) return; // 已在播放

      var ctx = this._ctx;
      var bus = this._buses.supernatural;

      var mixGain = ctx.createGain();
      mixGain.gain.value = 0.15; // -20dB
      mixGain.connect(bus);
      this._deepDroneGain = mixGain;

      // 25Hz
      var osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = 25;
      var g1 = ctx.createGain();
      g1.gain.value = 0.6;

      // 50Hz phase shifted
      var osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = 50;
      var g2 = ctx.createGain();
      g2.gain.value = 0.3;

      // Very slow LFO for subtle volume pulsing
      var lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.15;
      var lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.1;
      lfo.connect(lfoGain);
      lfoGain.connect(mixGain.gain);
      lfo.start();

      // Lowpass
      var lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 100;

      osc1.connect(g1);
      osc2.connect(g2);
      g1.connect(lp);
      g2.connect(lp);
      lp.connect(mixGain);

      osc1.start();
      osc2.start();

      this._deepDrone = {
        osc1: osc1,
        osc2: osc2,
        lfo: lfo,
        lp: lp,
        mixGain: mixGain
      };
    },

    _stopDeepDrone() {
      if (this._deepDroneGain) {
        var t = this._ctx.currentTime;
        this._deepDroneGain.gain.linearRampToValueAtTime(0, t + 1);
        var self = this;
        setTimeout(function() {
          if (self._deepDrone) {
            try { self._deepDrone.osc1.stop(); } catch(e) {}
            try { self._deepDrone.osc2.stop(); } catch(e) {}
            try { self._deepDrone.lfo.stop(); } catch(e) {}
          }
          self._deepDrone = null;
          self._deepDroneGain = null;
        }, 1500);
      }
    },

    /* ====================
       Internal: 结局 A — 断开 (SFX-15)
       连接断裂 + 音调骤降 + 真空 + 微弱恢复
       ==================== */
    _synthEndingA(options) {
      var ctx = this._ctx;
      var bus = this._buses.ending;
      var t = ctx.currentTime;

      // 外部停止 CRT hum

      // "Click" — noise pulse
      var bufSize = ctx.sampleRate * 0.3;
      var buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
      var noise = ctx.createBufferSource();
      noise.buffer = buf;
      var lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1000;
      var env = ctx.createGain();
      env.gain.setValueAtTime(0.001, t);
      env.gain.linearRampToValueAtTime(0.2, t + 0.01);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      noise.connect(lp);
      lp.connect(env);
      env.connect(bus);
      noise.start(t);
      noise.stop(t + 0.3);

      // Frequency drop 200→30Hz
      var dropOsc = ctx.createOscillator();
      dropOsc.type = 'sine';
      dropOsc.frequency.setValueAtTime(200, t + 0.5);
      dropOsc.frequency.exponentialRampToValueAtTime(30, t + 2.5);
      var dropGain = ctx.createGain();
      dropGain.gain.setValueAtTime(0.08, t + 0.5);
      dropGain.gain.linearRampToValueAtTime(0, t + 3);
      dropOsc.connect(dropGain);
      dropGain.connect(bus);
      dropOsc.start(t + 0.5);
      dropOsc.stop(t + 3);

      // Faint 50Hz recovery (暗示"还在")
      var recOsc = ctx.createOscillator();
      recOsc.type = 'sine';
      recOsc.frequency.value = 50;
      var recGain = ctx.createGain();
      recGain.gain.setValueAtTime(0.001, t + 4);
      recGain.gain.linearRampToValueAtTime(0.02, t + 5);
      recOsc.connect(recGain);
      recGain.connect(bus);
      recOsc.start(t + 4);
      recOsc.stop(t + 7);
    },

    /* ====================
       Internal: 结局 B — 接替 (SFX-16)
       低频持续 + 规律心跳脉冲
       ==================== */
    _synthEndingB(options) {
      var ctx = this._ctx;
      var bus = this._buses.ending;
      var t = ctx.currentTime;

      // 30Hz + 60Hz square
      for (var fi = 0; fi < 2; fi++) {
        var osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = fi === 0 ? 30 : 60;
        var g = ctx.createGain();
        g.gain.value = 0.06;
        osc.connect(g);
        g.connect(bus);
        osc.start(t);
        osc.stop(t + 6);
      }

      // Heartbeat pulse × 3 (每 2s)
      for (var pi = 0; pi < 3; pi++) {
        var pt = t + pi * 2;
        var bs = ctx.sampleRate * 0.08;
        var bf = ctx.createBuffer(1, bs, ctx.sampleRate);
        var bd = bf.getChannelData(0);
        for (var bj = 0; bj < bs; bj++) bd[bj] = Math.random() * 2 - 1;
        var ns = ctx.createBufferSource();
        ns.buffer = bf;
        var pg = ctx.createGain();
        pg.gain.setValueAtTime(0.001, pt);
        pg.gain.linearRampToValueAtTime(0.1, pt + 0.01);
        pg.gain.exponentialRampToValueAtTime(0.001, pt + 0.08);
        ns.connect(pg);
        pg.connect(bus);
        ns.start(pt);
        ns.stop(pt + 0.08);
      }
    },

    /* ====================
       Internal: 结局 C — 穿越 (SFX-17)
       Pan sweep L→R + 混响膨胀 + 沉入感 + 反向微弱返回
       ==================== */
    _synthEndingC(options) {
      var ctx = this._ctx;
      var bus = this._buses.ending;
      var t = ctx.currentTime;

      // Stereo noise sweep L→R (3s) with bandpass sweep
      var bufSize = ctx.sampleRate * 4;
      var buf = ctx.createBuffer(2, bufSize, ctx.sampleRate);
      var dL = buf.getChannelData(0);
      var dR = buf.getChannelData(1);
      for (var si = 0; si < bufSize; si++) {
        var pan = si / bufSize;
        var val = Math.random() * 2 - 1;
        dL[si] = val * (1 - pan);
        dR[si] = val * pan;
      }
      var noise = ctx.createBufferSource();
      noise.buffer = buf;
      var bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(400, t);
      bp.frequency.exponentialRampToValueAtTime(3000, t + 3);
      bp.Q.value = 1;
      var env = ctx.createGain();
      env.gain.setValueAtTime(0.001, t);
      env.gain.linearRampToValueAtTime(0.15, t + 0.5);
      env.gain.linearRampToValueAtTime(0, t + 3);
      noise.connect(bp);
      bp.connect(env);
      env.connect(bus);
      noise.start(t);
      noise.stop(t + 3.5);

      // Sub-bass sink (3-5s)
      var sub = ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(60, t + 3);
      sub.frequency.exponentialRampToValueAtTime(20, t + 5);
      var subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.001, t + 3);
      subGain.gain.linearRampToValueAtTime(0.1, t + 3.5);
      subGain.gain.linearRampToValueAtTime(0, t + 5);
      sub.connect(subGain);
      subGain.connect(bus);
      sub.start(t + 3);
      sub.stop(t + 5.5);

      // Faint return from "inside" (reverse pan R→L)
      var self = this;
      setTimeout(function() {
        if (!self._ctx) return;
        var t2 = self._ctx.currentTime;
        var bs2 = self._ctx.sampleRate * 2;
        var bf2 = self._ctx.createBuffer(2, bs2, self._ctx.sampleRate);
        var dL2 = bf2.getChannelData(0);
        var dR2 = bf2.getChannelData(1);
        for (var ri = 0; ri < bs2; ri++) {
          var rpan = 1 - (ri / bs2);
          var rval = Math.random() * 2 - 1;
          dL2[ri] = rval * (1 - rpan);
          dR2[ri] = rval * rpan;
        }
        var n2 = self._ctx.createBufferSource();
        n2.buffer = bf2;
        var lp2 = self._ctx.createBiquadFilter();
        lp2.type = 'lowpass';
        lp2.frequency.value = 200;
        var en2 = self._ctx.createGain();
        en2.gain.setValueAtTime(0.001, t2);
        en2.gain.linearRampToValueAtTime(0.03, t2 + 0.5);
        en2.gain.linearRampToValueAtTime(0, t2 + 2);
        n2.connect(lp2);
        lp2.connect(en2);
        en2.connect(bus);
        n2.start(t2);
        n2.stop(t2 + 2);
      }, 5500);
    },

    /* ====================
       Internal: 结局 D — 封印 (SFX-18)
       所有声音逐个停止 + 真空
       ==================== */
    _synthEndingD(options) {
      var ctx = this._ctx;
      var bus = this._buses.ending;
      var t = ctx.currentTime;

      // 5 descending tones, each dies out
      for (var i = 0; i < 5; i++) {
        var osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 400 - i * 70;
        var g = ctx.createGain();
        var st = t + i * 0.3;
        g.gain.setValueAtTime(0.06, st);
        g.gain.exponentialRampToValueAtTime(0.001, st + 0.5);
        osc.connect(g);
        g.connect(bus);
        osc.start(st);
        osc.stop(st + 0.5);
      }
    },

    /* ====================
       Internal: 结局 E — 共存 (SFX-19)
       轻柔持续和弦 + 远方回应
       ==================== */
    _synthEndingE(options) {
      var ctx = this._ctx;
      var bus = this._buses.ending;
      var t = ctx.currentTime;

      // C major chord: C4 E4 G4, gentle sine tones
      var chord = [261.63, 329.63, 392.00];
      for (var ci = 0; ci < chord.length; ci++) {
        var osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = chord[ci];
        var g = ctx.createGain();
        var startT = t + ci * 0.3;
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.04, startT);
        g.gain.linearRampToValueAtTime(0, startT + 3);
        osc.connect(g);
        g.connect(bus);
        osc.start(t);
        osc.stop(startT + 3.5);
      }

      // Distant faint response (panned slightly right)
      var respOsc = ctx.createOscillator();
      respOsc.type = 'sine';
      respOsc.frequency.value = 261.63;
      var respGain = ctx.createGain();
      respGain.gain.setValueAtTime(0.001, t + 2);
      respGain.gain.linearRampToValueAtTime(0.015, t + 2.5);
      respGain.gain.linearRampToValueAtTime(0, t + 4.5);

      var panner = ctx.createStereoPanner();
      panner.pan.value = 0.4;

      respOsc.connect(respGain);
      respGain.connect(panner);
      panner.connect(bus);
      respOsc.start(t);
      respOsc.stop(t + 5);
    }
  };

  // 暴露到全局
  window.AudioEngine = AudioEngine;
})();
