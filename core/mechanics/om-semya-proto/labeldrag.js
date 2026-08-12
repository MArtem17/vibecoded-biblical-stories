/* ============================================================
   LabelDrag — механика «перетащи название на деталь картинки»
   Автономный модуль, без зависимостей. ES5, работает офлайн.
   Извлечён и отлажен из колоды «Как всё устроено» (Образовариум).

   Использование:
     var game = LabelDrag.mount(elem, config);
     game.reset();        // начать заново
     game.relayout();     // пересчитать раскладку (напр. после показа блока)
     game.destroy();      // снять обработчики и очистить

   config = {
     image:   'assets/plant.svg',   // URL картинки (любой формат)
     aspect:  '3/4',                // соотношение сторон картинки ('3/4' или [3,4])
     wide:    false,                // true → подписи сверху/снизу, false → слева/справа
     shuffle: true,                 // перемешивать фишки в банке
     parts: [
       { id:1, word:'Цветок', ax:50, ay:19, side:'r', bay:19, cmt:'Самая красивая часть…' },
       ...
     ],
     strings: { drag, done, progress },   // необязательно, см. defaults ниже
     onFill:     function(part, st){},     // вызывается при верной подписи; st={filled,total}
     onWrong:    function(part){},         // вызывается при ошибке
     onComplete: function(){},            // вызывается, когда подписаны все детали
     onReveal:   function(part){}         // тап по готовой подписи после завершения
   }

   Каждый part:
     id    — уникальное число
     word  — короткое название (текст фишки и подписи)
     ax,ay — координаты точки-пина в % ширины/высоты картинки (0..100)
     side  — 'l'|'r' колонка подписи (только при wide:false). По умолчанию по ax.
     bay   — желаемая вертикаль подписи в % (для разведения). По умолчанию = ay.
     cmt   — текст-пояснение (показывается после верной подписи). Необязательно.
   ============================================================ */
(function (root) {
  'use strict';

  var DEF_STRINGS = {
    drag: 'Перетащи название к нужной детали.',
    done: 'Готово! Все детали подписаны.',
    progress: function (f, t) { return f + '/' + t; }
  };

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function svgEl(tag) { return document.createElementNS('http://www.w3.org/2000/svg', tag); }

  function LabelDrag(host, cfg) {
    this.host = host;
    this.cfg = cfg || {};
    this.parts = (this.cfg.parts || []).map(function (p) {
      return {
        id: p.id, word: p.word, img: p.img || null, ax: +p.ax, ay: +p.ay,
        side: p.side || (p.ax >= 50 ? 'r' : 'l'),
        bay: (p.bay != null ? +p.bay : +p.ay),
        cmt: p.cmt || ''
      };
    });
    this.strings = {};
    for (var k in DEF_STRINGS) this.strings[k] = DEF_STRINGS[k];
    if (cfg.strings) for (var k2 in cfg.strings) this.strings[k2] = cfg.strings[k2];

    var ar = cfg.aspect || '1/1';
    if (Array.isArray(ar)) { this.aspW = +ar[0]; this.aspH = +ar[1]; }
    else { var s = String(ar).split('/'); this.aspW = parseFloat(s[0]) || 1; this.aspH = parseFloat(s[1]) || 1; }

    this.wide = !!cfg.wide;
    this.total = this.parts.length;
    this.filled = 0;
    this.done = false;
    this.refs = {};       // id -> {pin, box, line, halo, lab}
    this._handlers = [];
    this._build();
    this.reset();
  }

  LabelDrag.prototype._build = function () {
    var self = this, c = this.cfg;
    this.host.classList.add('ld-root');
    this.host.innerHTML =
      '<div class="ld-stage">' +
        '<div class="ld-imgwrap"><img class="ld-img" alt=""></div>' +
        '<svg class="ld-ov"></svg>' +
      '</div>' +
      '<div class="ld-bank"></div>' +
      '<div class="ld-cmt"></div>';

    this.stage   = this.host.querySelector('.ld-stage');
    this.imgwrap = this.host.querySelector('.ld-imgwrap');
    this.img     = this.host.querySelector('.ld-img');
    this.ov      = this.host.querySelector('.ld-ov');
    this.bank    = this.host.querySelector('.ld-bank');
    this.cmt     = this.host.querySelector('.ld-cmt');

    if (c.progressEl) this.progEl = (typeof c.progressEl === 'string') ? document.querySelector(c.progressEl) : c.progressEl;

    this.imgwrap.style.aspectRatio = this.aspW + ' / ' + this.aspH;
    this.img.src = c.image || '';

    // пины, подписи, лидер-линии
    this.parts.forEach(function (p) {
      var halo = svgEl('line');
      halo.setAttribute('stroke', '#fff'); halo.setAttribute('stroke-width', '7');
      halo.setAttribute('stroke-opacity', '.9'); halo.setAttribute('stroke-linecap', 'round');
      self.ov.appendChild(halo);
      var line = svgEl('line');
      line.setAttribute('stroke', 'var(--ld-line)'); line.setAttribute('stroke-width', '3');
      line.setAttribute('stroke-linecap', 'round');
      self.ov.appendChild(line);

      var pin = el('div', 'ld-pin'); self.imgwrap.appendChild(pin);

      var box = el('div', 'ld-box ld-empty');
      box.setAttribute('data-id', p.id);
      box.innerHTML = '<span class="ld-num">' + p.id + '</span><span class="ld-lab"></span>';
      self.stage.appendChild(box);

      var reveal = function () {
        if (self.done && box.getAttribute('data-done') === '1') self._reveal(p.id);
      };
      box.addEventListener('click', reveal);
      pin.addEventListener('click', reveal);

      self.refs[p.id] = { pin: pin, box: box, line: line, halo: halo, lab: box.querySelector('.ld-lab') };
    });

    this._wireDrag();

    // авто-пересчёт раскладки
    var onResize = function () { self.relayout(); };
    window.addEventListener('resize', onResize);
    this._handlers.push(['resize', onResize]);
    if (window.ResizeObserver) {
      this._ro = new ResizeObserver(function () { self.relayout(); });
      this._ro.observe(this.stage);
    }
    if (this.img && !this.img.complete) {
      this.img.addEventListener('load', onResize);
    }
  };

  // ---------- состояние ----------
  LabelDrag.prototype.reset = function () {
    var self = this;
    this.filled = 0; this.done = false;
    this.parts.forEach(function (p) {
      var r = self.refs[p.id];
      r.box.className = 'ld-box ld-empty';
      r.box.removeAttribute('data-done');
      r.lab.innerHTML = '';
      r.pin.classList.remove('hot', 'dim');
    });
    this.bank.innerHTML = '';
    var arr = this.parts.slice();
    if (this.cfg.shuffle !== false) shuffle(arr);
    arr.forEach(function (p) {
      var chip = el('div', 'ld-chip');
      if (p.img) { chip.className += ' ld-chip-img'; chip.innerHTML = '<img src="' + p.img + '" alt="' + p.word + '">'; }
      else chip.textContent = p.word;
      chip.setAttribute('data-id', p.id);
      self.bank.appendChild(chip);
    });
    this.bank.style.display = 'flex';
    this.cmt.innerHTML = this.strings.drag;
    this._progress();
    this._refreshSeek();
    this.relayout();
  };

  LabelDrag.prototype._progress = function () {
    var txt = this.strings.progress(this.filled, this.total);
    if (this.progEl) this.progEl.textContent = txt;
  };

  LabelDrag.prototype._refreshSeek = function () {
    var self = this;
    this.parts.forEach(function (p) {
      var r = self.refs[p.id], empty = r.box.classList.contains('ld-empty');
      var on = (!self.done && empty);
      r.box.classList.toggle('ld-seek', on); r.pin.classList.toggle('ld-seek', on);
      r.line.setAttribute('stroke', empty ? '#e8a33d' : 'var(--ld-line)');
    });
  };

  LabelDrag.prototype._partById = function (id) {
    for (var i = 0; i < this.parts.length; i++) if (this.parts[i].id === id) return this.parts[i];
    return null;
  };

  // ---------- раскладка ----------
  LabelDrag.prototype.relayout = function () {
    if (!this.parts.length) return;
    var sb = this.stage.getBoundingClientRect();
    if (!sb.width) return;
    var availW = sb.width * 0.96, availH = sb.height * 0.92, ar = this.aspW / this.aspH, w, h;
    if (availW / availH <= ar) { w = availW; h = w / ar; } else { h = availH; w = h * ar; }
    this.imgwrap.style.width = Math.round(w) + 'px';
    this.imgwrap.style.height = Math.round(h) + 'px';

    var st = this.stage.getBoundingClientRect(), iw = this.imgwrap.getBoundingClientRect();
    var self = this;
    this.parts.forEach(function (p) {
      var pin = self.refs[p.id].pin;
      pin.style.left = p.ax + '%'; pin.style.top = p.ay + '%';
    });
    if (this.wide) this._placeTopBottom(iw, st); else this._placeSides(iw, st);
    this._drawLines(st);
  };

  LabelDrag.prototype._placeSides = function (iw, st) {
    var self = this, bw = Math.min(st.width * 0.36, 150);
    ['l', 'r'].forEach(function (side) {
      var list = self.parts.filter(function (p) { return p.side === side; })
        .sort(function (a, b) { return a.bay - b.bay; });
      var ts = [], prev = -99;
      list.forEach(function (p) { var t = Math.max(p.bay, prev + 13); prev = t; ts.push(t); });
      for (var i = list.length - 1; i >= 0; i--) {
        var cap = 92 - 13 * (list.length - 1 - i);
        if (ts[i] > cap) ts[i] = cap; if (ts[i] < 6) ts[i] = 6;
      }
      var prevT = -99;
      list.forEach(function (p, i) {
        var box = self.refs[p.id].box, empty = box.classList.contains('ld-empty');
        var wpx = empty ? Math.min(72, bw) : bw;
        box.style.width = wpx + 'px';
        var bh = box.offsetHeight || 34, t = ts[i];
        var bx = (side === 'l' ? st.width * 0.015 : st.width * 0.985 - wpx);
        if (empty) { // увести пустую зону с её точки, чтобы лидер-линия читалась
          var pinX = iw.left - st.left + p.ax / 100 * iw.width;
          var pinY = iw.top - st.top + p.ay / 100 * iw.height;
          var cy = t / 100 * st.height;
          if (pinX > bx - 12 && pinX < bx + wpx + 12 && Math.abs(pinY - cy) < bh / 2 + 14) {
            var up = (pinY - (bh / 2 + 18)) / st.height * 100, dn = (pinY + (bh / 2 + 18)) / st.height * 100;
            var cand = [];
            if (up >= Math.max(6, prevT + 13)) cand.push(up);
            if (dn <= 92) cand.push(dn);
            if (cand.length) t = cand.reduce(function (a, b) { return Math.abs(b - ts[i]) < Math.abs(a - ts[i]) ? b : a; });
          }
        }
        t = Math.max(t, prevT + 13); if (t < 6) t = 6; if (t > 94) t = 94; prevT = t;
        box.style.left = bx + 'px';
        box.style.top = (t / 100 * st.height - bh / 2) + 'px';
      });
    });
  };

  LabelDrag.prototype._placeTopBottom = function (iw, st) {
    var self = this, bw = Math.min(st.width * 0.30, 140);
    var ps = this.parts.slice().sort(function (a, b) { return a.ay - b.ay; });
    var half = Math.ceil(ps.length / 2);
    var top = ps.slice(0, half).sort(function (a, b) { return a.ax - b.ax; });
    var bot = ps.slice(half).sort(function (a, b) { return a.ax - b.ax; });
    function row(arr, isTop) {
      var n = arr.length, gap = (st.width - 16) / n;
      arr.forEach(function (p, i) {
        var box = self.refs[p.id].box;
        var wpx = box.classList.contains('ld-empty') ? Math.min(76, bw) : bw;
        box.style.width = wpx + 'px';
        var cx = 8 + gap * i + gap / 2, L = cx - wpx / 2;
        if (L < 4) L = 4; if (L + wpx > st.width - 4) L = st.width - 4 - wpx;
        box.style.left = L + 'px';
        box.style.top = (isTop ? 6 : st.height - 6 - box.offsetHeight) + 'px';
      });
    }
    row(top, true); row(bot, false);
  };

  LabelDrag.prototype._drawLines = function (st) {
    var self = this;
    this.parts.forEach(function (p) {
      var r = self.refs[p.id];
      var box = r.box.getBoundingClientRect(), pin = r.pin.getBoundingClientRect();
      var bx = box.left - st.left + box.width / 2, by = box.top - st.top + box.height / 2;
      var px = pin.left - st.left + pin.width / 2, py = pin.top - st.top + pin.height / 2;
      var sx = bx, sy = by;             // старт у края подписи, ближнего к пину
      if (Math.abs(px - bx) > Math.abs(py - by)) sx = bx + (px > bx ? box.width / 2 : -box.width / 2);
      else sy = by + (py > by ? box.height / 2 : -box.height / 2);
      var dx = px - sx, dy = py - sy, L = Math.sqrt(dx * dx + dy * dy) || 1;
      var ex = px - dx / L * 9, ey = py - dy / L * 9;  // не доводим до пина 9px
      r.line.setAttribute('x1', sx); r.line.setAttribute('y1', sy);
      r.line.setAttribute('x2', ex); r.line.setAttribute('y2', ey);
      r.halo.setAttribute('x1', sx); r.halo.setAttribute('y1', sy);
      r.halo.setAttribute('x2', ex); r.halo.setAttribute('y2', ey);
    });
  };

  // ---------- перетаскивание ----------
  LabelDrag.prototype._nearestEmptyBox = function (x, y, maxD) {
    var self = this, best = null, bd = maxD;
    this.parts.forEach(function (p) {
      var b = self.refs[p.id].box; if (!b.classList.contains('ld-empty')) return;
      var r = b.getBoundingClientRect();
      var dx = Math.max(r.left - x, 0, x - r.right), dy = Math.max(r.top - y, 0, y - r.bottom);
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < bd) { bd = d; best = b; }
    });
    return best;
  };

  LabelDrag.prototype._wireDrag = function () {
    var self = this, drag = null, curChip = null, overBox = null;
    function setTargets(on) {
      self.parts.forEach(function (p) {
        var b = self.refs[p.id].box;
        b.classList.toggle('ld-targets', on && b.classList.contains('ld-empty'));
        if (!on) b.classList.remove('ld-over');
      });
    }
    function move(e) {
      drag.style.left = (e.clientX - drag.offsetWidth / 2) + 'px';
      drag.style.top = (e.clientY - 22) + 'px';
    }
    var onDown = function (e) {
      var t = e.target && e.target.closest ? e.target.closest('.ld-chip') : e.target;
      if (!t || !t.classList || !t.classList.contains('ld-chip') || t.classList.contains('ld-used')) return;
      e.preventDefault(); curChip = t;
      drag = t.cloneNode(true); drag.className = t.className.replace('ld-used','') + ' ld-drag';
      self.host.appendChild(drag);
      move(e); t.style.opacity = '.3'; setTargets(true);
    };
    var onMove = function (e) {
      if (!drag) return; move(e);
      var nb = self._nearestEmptyBox(e.clientX, e.clientY, 46);
      if (overBox && overBox !== nb) overBox.classList.remove('ld-over');
      overBox = nb; if (overBox) overBox.classList.add('ld-over');
    };
    var onUp = function (e) {
      if (!drag) return;
      drag.style.display = 'none';
      var elx = document.elementFromPoint(e.clientX, e.clientY);
      var box = elx ? elx.closest('.ld-box') : null;
      if (!box || !box.classList.contains('ld-empty')) box = self._nearestEmptyBox(e.clientX, e.clientY, 60);
      if (box && box.classList.contains('ld-empty')) {
        if (box.getAttribute('data-id') === curChip.getAttribute('data-id')) {
          self._fillBox(box, curChip);
        } else {
          box.classList.add('ld-wrong');
          setTimeout(function () { box.classList.remove('ld-wrong'); }, 380);
          curChip.style.opacity = '1';
          if (self.cfg.onWrong) self.cfg.onWrong(self._partById(+box.getAttribute('data-id')));
        }
      } else { curChip.style.opacity = '1'; }
      setTargets(false); overBox = null;
      drag.remove(); drag = null; curChip = null;
    };
    this.bank.addEventListener('pointerdown', onDown);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    this._handlers.push(['pointermove', onMove, document], ['pointerup', onUp, document]);
  };

  LabelDrag.prototype._fillBox = function (box, chip) {
    var p = this._partById(+box.getAttribute('data-id')), r = this.refs[p.id];
    box.classList.remove('ld-empty'); box.setAttribute('data-done', '1');
    if (p.img) r.lab.innerHTML = '<img class="ld-lab-img" src="' + p.img + '" alt="' + p.word + '">';
    else r.lab.textContent = p.word;
    chip.classList.add('ld-used');
    this.filled++; this._progress();
    if (p.cmt) this.cmt.innerHTML = '<b>' + p.word + '.</b> ' + p.cmt;
    r.pin.classList.add('hot');
    var pin = r.pin; setTimeout(function () { pin.classList.remove('hot'); }, 700);
    this._refreshSeek();
    var self = this; setTimeout(function () { self.relayout(); }, 20);
    if (this.cfg.onFill) this.cfg.onFill(p, { filled: this.filled, total: this.total });
    if (this.filled >= this.total) this._complete();
  };

  LabelDrag.prototype._complete = function () {
    this.done = true;
    this.bank.style.display = 'none';
    this.cmt.innerHTML = '<b>' + this.strings.done + '</b>';
    this.host.classList.add('ld-finished');
    this._refreshSeek();
    if (this.cfg.onComplete) this.cfg.onComplete();
  };

  LabelDrag.prototype._reveal = function (id) {
    var self = this, p = this._partById(id);
    this.parts.forEach(function (q) {
      var on = (q.id === id), r = self.refs[q.id];
      r.pin.classList.toggle('hot', on); r.pin.classList.toggle('dim', !on);
      r.box.classList.toggle('hot', on); r.box.classList.toggle('dim', !on);
    });
    if (p.cmt) this.cmt.innerHTML = '<b>' + p.word + '.</b> ' + p.cmt;
    if (this.cfg.onReveal) this.cfg.onReveal(p);
  };

  LabelDrag.prototype.destroy = function () {
    this._handlers.forEach(function (h) { (h[2] || window).removeEventListener(h[0], h[1]); });
    if (this._ro) this._ro.disconnect();
    this.host.innerHTML = ''; this.host.classList.remove('ld-root', 'ld-finished');
  };

  root.LabelDrag = {
    mount: function (host, cfg) {
      if (typeof host === 'string') host = document.querySelector(host);
      return new LabelDrag(host, cfg);
    }
  };
})(typeof window !== 'undefined' ? window : this);
