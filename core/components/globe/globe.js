/*!
 * globe.js — переиспользуемый вращающийся глобус на <canvas>.
 * Vanilla ES5, без зависимостей и шага сборки. Работает офлайн в WKWebView (iOS).
 *
 * Рендер: софтверный «растеризатор сферы» — на каждый пиксель диска считается
 * точка на сфере, берётся тексель из равнопромежуточной (equirectangular) карты
 * мира и накладывается затенение (лимбовое + опционально день/ночь). Математика
 * проекции перенесена из движка geo5klass (симуляция «Вращение Земли»).
 *
 * Использование:
 *   <canvas id="g" width="320" height="320"></canvas>
 *   <script src="globe.js"></script>
 *   <script>
 *     var globe = Globe.create({
 *       canvas: 'g',                 // id или элемент <canvas>
 *       texture: 'world_tex.jpg',    // equirectangular карта (2:1), same-origin
 *       autoRotate: true,            // авто-вращение
 *       speed: 0.35,                 // радиан/сек
 *       drag: true,                  // вращать перетаскиванием
 *       light: 'sphere'              // 'sphere' | 'daynight' | 'flat'
 *     });
 *     // API: globe.start(); globe.stop(); globe.setSpeed(0.6);
 *     //      globe.rotateTo(lonRad, latRad); globe.setLight('daynight');
 *     //      globe.destroy();
 *   </script>
 *
 * ВАЖНО: текстура читается пиксельно через getImageData — источник должен быть
 * same-origin (или CORS-enabled), а страница — открыта по http(s), не file://,
 * иначе canvas «протухает» (tainted) и глобус нарисуется заглушкой-сеткой.
 */
(function (global) {
  'use strict';

  function resolveCanvas(c) {
    if (!c) return null;
    if (typeof c === 'string') return document.getElementById(c);
    if (c.nodeType === 1 && c.tagName === 'CANVAS') return c;
    return null;
  }

  function Globe(opts) {
    opts = opts || {};
    this.canvas = resolveCanvas(opts.canvas);
    if (!this.canvas) throw new Error('Globe: canvas не найден');

    this.dpr = Math.min(opts.pixelRatio || 2, global.devicePixelRatio || 1);
    this.autoRotate = opts.autoRotate !== false;
    this.speed = typeof opts.speed === 'number' ? opts.speed : 0.35; // рад/сек
    this.dragEnabled = opts.drag !== false;
    this.light = opts.light || 'sphere';       // 'sphere' | 'daynight' | 'flat'
    this.bg = opts.background || 'transparent'; // цвет фона диска-заглушки/подложки
    this.maxFPS = opts.maxFPS || 40;
    // Направление на Солнце в экранных координатах (для режима 'daynight')
    this.sun = opts.sun || { x: -0.8, y: 0.0, z: 0.6 };

    this.lon = opts.lon || 0;   // вращение вокруг оси (yaw), рад
    this.lat = opts.lat || 0;   // наклон вида (pitch), рад
    this.running = false;
    this._raf = null;
    this._lastT = 0;
    this._acc = 0;

    this.ctx = this.canvas.getContext('2d');
    this._layout();
    this._offscreen = document.createElement('canvas');
    this._octx = this._offscreen.getContext('2d');

    this._tex = null; // { data, w, h }
    this._loadTexture(opts.texture || 'world_tex.jpg');
    this._bindDrag();

    if (this.autoRotate) this.start(); else this._renderOnce();
  }

  Globe.prototype._layout = function () {
    // Диск занимает всю ширину квадратного канваса.
    var cssW = this.canvas.clientWidth || this.canvas.width || 320;
    var cssH = this.canvas.clientHeight || this.canvas.height || cssW;
    var side = Math.min(cssW, cssH);
    this.pxSide = Math.round(side * this.dpr);
    this.canvas.width = this.pxSide;
    this.canvas.height = this.pxSide;
    this.R = Math.round(this.pxSide / 2) - Math.round(2 * this.dpr);
    this.CX = Math.round(this.pxSide / 2);
    this.CY = Math.round(this.pxSide / 2);
  };

  Globe.prototype._loadTexture = function (src) {
    var self = this;
    var img = new Image();
    try { img.crossOrigin = 'anonymous'; } catch (e) {}
    img.onload = function () {
      var oc = document.createElement('canvas');
      oc.width = img.naturalWidth; oc.height = img.naturalHeight;
      var octx = oc.getContext('2d');
      octx.drawImage(img, 0, 0);
      try {
        var d = octx.getImageData(0, 0, oc.width, oc.height);
        self._tex = { data: d.data, w: oc.width, h: oc.height };
      } catch (e) {
        self._tex = null; // tainted canvas (file:// или чужой origin)
      }
      self._renderOnce();
    };
    img.onerror = function () { self._tex = null; self._renderOnce(); };
    img.src = src;
  };

  // Отрисовка сферы в offscreen (2R×2R), затем перенос на канвас.
  Globe.prototype._renderSphere = function () {
    var R = this.R, D = 2 * R;
    var oc = this._offscreen;
    if (oc.width !== D) { oc.width = D; oc.height = D; }
    var octx = this._octx;
    var tex = this._tex;
    var img = octx.getImageData(0, 0, D, D);
    var d = img.data;
    var texData = tex.data, texW = tex.w, texH = tex.h;
    var a = this.lon;
    var cp = Math.cos(this.lat), sp = Math.sin(this.lat);
    var mode = this.light;
    var Sx = this.sun.x, Sy = this.sun.y, Sz = this.sun.z;
    var py, px;
    for (py = 0; py < D; py++) {
      var ny0 = -((py - R) / R);
      for (px = 0; px < D; px++) {
        var nx = (px - R) / R;
        var oi = (py * D + px) * 4;
        var rr = nx * nx + ny0 * ny0;
        if (rr > 1) { d[oi + 3] = 0; continue; }
        var nz0 = Math.sqrt(1 - rr);
        // наклон вида (pitch) вокруг оси X
        var ny = ny0 * cp + nz0 * sp;
        var nz = -ny0 * sp + nz0 * cp;
        if (ny > 1) ny = 1; else if (ny < -1) ny = -1;
        var lon = Math.atan2(nx, nz) - a;
        var lat = Math.asin(ny);
        var u = (lon + Math.PI) / (2 * Math.PI);
        u = u - Math.floor(u);
        var v = (Math.PI / 2 - lat) / Math.PI;
        var tx = (u * texW) | 0; if (tx >= texW) tx = texW - 1; if (tx < 0) tx = 0;
        var ty = (v * texH) | 0; if (ty >= texH) ty = texH - 1; if (ty < 0) ty = 0;
        var ti = (ty * texW + tx) * 4;
        var cr = texData[ti], cg = texData[ti + 1], cb = texData[ti + 2];
        if (mode === 'flat') {
          d[oi] = cr; d[oi + 1] = cg; d[oi + 2] = cb; d[oi + 3] = 255;
          continue;
        }
        var shade = 0.45 + 0.55 * nz0; // лимбовое затемнение (объём)
        if (mode === 'daynight') {
          var lit = nx * Sx + ny0 * Sy + nz0 * Sz;
          var dn = lit > 0.04 ? 1.0 : (lit < -0.04 ? 0.42 : 0.42 + (lit + 0.04) / 0.08 * 0.58);
          var night = 1 - dn;
          var sh = shade * dn;
          d[oi] = cr * sh * (1 - 0.12 * night);
          d[oi + 1] = cg * sh * (1 - 0.05 * night);
          d[oi + 2] = cb * sh + night * 30;
        } else { // 'sphere'
          d[oi] = cr * shade;
          d[oi + 1] = cg * shade;
          d[oi + 2] = cb * shade;
        }
        d[oi + 3] = 255;
      }
    }
    octx.putImageData(img, 0, 0);
  };

  Globe.prototype._drawFallback = function () {
    // Голубой шар с сеткой, если текстуру нельзя прочитать.
    var ctx = this.ctx, CX = this.CX, CY = this.CY, R = this.R, dpr = this.dpr;
    ctx.save();
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, 2 * Math.PI);
    ctx.fillStyle = '#16466b'; ctx.fill(); ctx.clip();
    ctx.strokeStyle = 'rgba(150,200,240,.35)'; ctx.lineWidth = 1 * dpr;
    var i, k;
    for (i = -60; i <= 60; i += 30) {
      var yy = CY - R * Math.sin(i * Math.PI / 180);
      var rw = R * Math.cos(i * Math.PI / 180);
      ctx.beginPath(); ctx.ellipse(CX, yy, rw, rw * 0.28, 0, 0, 2 * Math.PI); ctx.stroke();
    }
    for (k = 0; k < 6; k++) {
      var ph = (k / 6) * Math.PI + this.lon;
      var rw2 = Math.abs(R * Math.cos(ph));
      ctx.beginPath(); ctx.ellipse(CX, CY, rw2, R, 0, 0, 2 * Math.PI); ctx.stroke();
    }
    ctx.restore();
  };

  Globe.prototype._renderOnce = function () {
    var ctx = this.ctx;
    ctx.clearRect(0, 0, this.pxSide, this.pxSide);
    if (this.bg && this.bg !== 'transparent') {
      ctx.fillStyle = this.bg; ctx.fillRect(0, 0, this.pxSide, this.pxSide);
    }
    if (this._tex) {
      this._renderSphere();
      ctx.drawImage(this._offscreen, this.CX - this.R, this.CY - this.R);
      // тонкая атмосферная окантовка
      ctx.beginPath(); ctx.arc(this.CX, this.CY, this.R + 1, 0, 2 * Math.PI);
      ctx.lineWidth = 2 * this.dpr; ctx.strokeStyle = 'rgba(120,200,240,.30)'; ctx.stroke();
    } else {
      this._drawFallback();
    }
  };

  Globe.prototype._tick = function (t) {
    if (!this.running) return;
    if (!this._lastT) this._lastT = t;
    var dt = (t - this._lastT) / 1000;
    this._lastT = t;
    // троттлинг до maxFPS
    this._acc += dt;
    var minStep = 1 / this.maxFPS;
    if (this._acc >= minStep) {
      if (this.autoRotate && !this._dragging) {
        this.lon += this.speed * this._acc;
        if (this.lon > Math.PI) this.lon -= 2 * Math.PI;
      }
      this._renderOnce();
      this._acc = 0;
    }
    var self = this;
    this._raf = global.requestAnimationFrame(function (tt) { self._tick(tt); });
  };

  Globe.prototype.start = function () {
    if (this.running) return this;
    this.running = true; this._lastT = 0; this._acc = 0;
    var self = this;
    this._raf = global.requestAnimationFrame(function (t) { self._tick(t); });
    return this;
  };

  Globe.prototype.stop = function () {
    this.running = false;
    if (this._raf) global.cancelAnimationFrame(this._raf);
    this._raf = null;
    return this;
  };

  Globe.prototype.setSpeed = function (s) { this.speed = s; return this; };
  Globe.prototype.setLight = function (m) { this.light = m; this._renderOnce(); return this; };
  Globe.prototype.rotateTo = function (lon, lat) {
    this.lon = lon || 0; if (typeof lat === 'number') this.lat = lat;
    this._renderOnce(); return this;
  };
  Globe.prototype.resize = function () { this._layout(); this._renderOnce(); return this; };

  Globe.prototype._bindDrag = function () {
    if (!this.dragEnabled) return;
    var self = this, cv = this.canvas;
    this._dragging = false;
    var lastX = 0, lastY = 0;
    function down(e) {
      self._dragging = true;
      var p = point(e); lastX = p.x; lastY = p.y;
      if (e.cancelable) e.preventDefault();
    }
    function move(e) {
      if (!self._dragging) return;
      var p = point(e);
      var dx = p.x - lastX, dy = p.y - lastY;
      lastX = p.x; lastY = p.y;
      self.lon -= dx * 0.01;
      self.lat += dy * 0.01;
      var lim = Math.PI / 2 - 0.05;
      if (self.lat > lim) self.lat = lim; if (self.lat < -lim) self.lat = -lim;
      if (!self.running) self._renderOnce();
      if (e.cancelable) e.preventDefault();
    }
    function up() { self._dragging = false; }
    function point(e) {
      var t = (e.touches && e.touches[0]) || e;
      return { x: t.clientX, y: t.clientY };
    }
    cv.addEventListener('mousedown', down);
    global.addEventListener('mousemove', move);
    global.addEventListener('mouseup', up);
    cv.addEventListener('touchstart', down, { passive: false });
    cv.addEventListener('touchmove', move, { passive: false });
    cv.addEventListener('touchend', up);
    this._drag = { down: down, move: move, up: up };
    cv.style.cursor = 'grab';
  };

  Globe.prototype.destroy = function () {
    this.stop();
    if (this._drag) {
      this.canvas.removeEventListener('mousedown', this._drag.down);
      global.removeEventListener('mousemove', this._drag.move);
      global.removeEventListener('mouseup', this._drag.up);
      this.canvas.removeEventListener('touchstart', this._drag.down);
      this.canvas.removeEventListener('touchmove', this._drag.move);
      this.canvas.removeEventListener('touchend', this._drag.up);
    }
    var ctx = this.ctx; ctx.clearRect(0, 0, this.pxSide, this.pxSide);
  };

  var API = {
    create: function (opts) { return new Globe(opts); },
    Globe: Globe
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else global.Globe = API;

})(typeof window !== 'undefined' ? window : this);
