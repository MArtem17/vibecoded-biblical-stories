/* core/mechanics/lines-match — «верёвочки»: соедини пары линиями.

   Два способа связать пару: (1) тап по элементу слева, тап по элементу
   справа — линия тянется между ними; (2) зажать элемент и потянуть пальцем/
   мышью до элемента в другой колонке — линия тянется следом за пальцем и
   отпускание на элементе противоположной колонки завершает связку (перетащил
   мимо элемента или в свою же колонку — жест просто отменяется, ничего не
   меняется). Тап по любому концу уже связанной пары освобождает её для новой
   связки, без отдельного шага «отвязать». «Проверить» красит линии и рамки
   зелёным/красным разом по всей доске — это НЕ пошаговый вопрос-ответ, как
   остальные задания платформы, а один экран, проверяемый целиком, как
   разворот учебника.

   Текст элементов не выделяется как при копировании (user-select:none) —
   иначе жест перетаскивания на телефоне/мыши по ходу дела подсвечивал бы
   слово синим, как будто идёт выделение текста, а не связывание пары.

   Механика про содержимое не знает: пары — обычные строки, подписи рисует
   вызывающий код. ES5, без зависимостей, CSS вставляет сам (свои переменные
   --lnm-*, с осмысленными значениями по умолчанию — если хост-страница
   объявит те же переменные у предка, механика возьмёт их без JS-настройки).

   Это НЕ извлечение и не замена уже существующей «верёвочки» —
   type:'lines' в core/engines/eng-book/engine.js. Тот вариант вплетён в
   реестр упражнений движка книг (checkEx/EX[id]) и держит восемь юнитов
   «Английского 5» — трогать его ради этого модуля означало бы рисковать
   готовым контентом без необходимости. Здесь тот же приём собран заново как
   самостоятельный виджет с чистым API, для движков без общего реестра
   упражнений (первый потребитель — decks/slovar-na-stsenah). Свести два
   варианта в один — отдельная задача на будущее, а не часть этой.

   Наружу: window.LinesMatch = {mount}.
     LinesMatch.mount(container, pairs, opts) → handle
       pairs: [[left, right], …] — строки уникальны в пределах раунда
         (совпадающие строки неразличимы для querySelector по значению).
       opts.shuffleRight: false — не перемешивать правую колонку (по
         умолчанию true).
       opts.leftLang / opts.rightLang: код языка (BCP47) — ставится атрибутом
         lang каждому элементу своей колонки. Колонки почти всегда на разных
         языках (изучаемое слово слева, родная подсказка справа), а без
         атрибута экранный диктор читает обе чужой фонетикой.
       opts.onCheck(result): result = {good, total, items:[{l, r, ok}]} —
         зовётся из handle.check(), после того как визуал уже перекрашен.
     handle.check() → result (тот же объект, что и в onCheck) — можно звать и
       напрямую, не только кнопкой из opts.
     handle.reset(newPairs?) — новый раунд (по умолчанию те же pairs).
     handle.destroy() — снимает обработчики и очищает container. */
(function (global) {
  'use strict';

  var CSS =
    '.lnm{--lnm-ink:#111110;--lnm-muted:#5b5a55;--lnm-line:#E3E2DD;--lnm-ok:#4C5C39;' +
      '--lnm-bad:#C9302C;--lnm-accent:#B8560F;--lnm-soft:#EEF1E7;--lnm-badsoft:#FBEDEC;' +
      'font-family:inherit;position:relative;' +
      'user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;' +
      '-webkit-tap-highlight-color:transparent}' +
    '.lnm-box{position:relative;display:flex;justify-content:space-between;gap:28px}' +
    '.lnm-svg{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none}' +
    '.lnm-col{display:flex;flex-direction:column;justify-content:space-between;gap:9px;flex:1;z-index:2;min-width:0}' +
    '.lnm-item{position:relative;border:1.5px solid var(--lnm-line);border-radius:12px;' +
      'padding:10px 12px;font-weight:700;font-size:14.5px;line-height:1.2;background:#fff;' +
      'color:var(--lnm-ink);cursor:pointer;transition:transform .08s ease;touch-action:none}' +
    '.lnm-item:active{transform:scale(.97)}' +
    '.lnm-dot{position:absolute;top:50%;width:11px;height:11px;border-radius:50%;' +
      'background:var(--lnm-line);border:2px solid #fff;box-shadow:0 0 0 1px var(--lnm-line);' +
      'transform:translateY(-50%)}' +
    '.lnm-col.left .lnm-dot{right:-6px}.lnm-col.right .lnm-dot{left:-6px}' +
    '.lnm-item.lnm-sel{border-color:var(--lnm-accent);color:var(--lnm-accent)}' +
    '.lnm-item.lnm-drop{border-color:var(--lnm-accent);box-shadow:0 0 0 2px var(--lnm-accent) inset}' +
    '.lnm-item.lnm-linked .lnm-dot{background:var(--lnm-ink);box-shadow:0 0 0 1px var(--lnm-ink)}' +
    '.lnm-item.lnm-ok{border-color:var(--lnm-ok);background:var(--lnm-soft);color:var(--lnm-ink);cursor:default}' +
    '.lnm-item.lnm-bad{border-color:var(--lnm-bad);background:var(--lnm-badsoft);color:var(--lnm-ink);cursor:default}';

  function injectCss() {
    if (document.getElementById('lnm-css')) return;
    var s = document.createElement('style');
    s.id = 'lnm-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function esc(v) {
    if (global.CSS && global.CSS.escape) return global.CSS.escape(v);
    return String(v).replace(/[^a-zA-Z0-9_-￿-]/g, '\\$&');
  }

  function mount(container, pairs, opts) {
    injectCss();
    opts = opts || {};
    container.className = (container.className ? container.className + ' ' : '') + 'lnm';

    var state = { pairs: null, conn: [], sel: null, checked: false };
    var svg, colL, colR;
    var drag = null, ghost = null;

    function build() {
      container.innerHTML = '';
      var box = document.createElement('div');
      box.className = 'lnm-box';
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'lnm-svg');
      colL = document.createElement('div');
      colL.className = 'lnm-col left';
      colR = document.createElement('div');
      colR.className = 'lnm-col right';
      box.appendChild(svg);
      box.appendChild(colL);
      box.appendChild(colR);
      container.appendChild(box);
    }

    function dot() {
      var d = document.createElement('span');
      d.className = 'lnm-dot';
      return d;
    }

    function render(rightOrder) {
      colL.innerHTML = '';
      colR.innerHTML = '';
      state.pairs.forEach(function (p) {
        colL.appendChild(item('l', p[0]));
      });
      rightOrder.forEach(function (v) {
        colR.appendChild(item('r', v));
      });
      requestAnimationFrame(drawLines);
    }

    function item(side, val) {
      var it = document.createElement('div');
      it.className = 'lnm-item';
      it.setAttribute('data-side', side);
      it.setAttribute('data-val', val);
      var lang = side === 'l' ? opts.leftLang : opts.rightLang;
      if (lang) it.lang = lang;
      it.appendChild(document.createTextNode(val));
      it.appendChild(dot());
      var c = state.conn.filter(function (x) { return side === 'l' ? x.l === val : x.r === val; })[0];
      if (state.sel && state.sel.side === side && state.sel.val === val) it.className += ' lnm-sel';
      if (c) {
        it.className += ' lnm-linked';
        if (state.checked) it.className += (c.state === 'ok' ? ' lnm-ok' : ' lnm-bad');
      } else if (state.checked && side === 'l') {
        it.className += ' lnm-bad';
      }
      it.addEventListener('pointerdown', function (e) { onPointerDown(side, val, e); });
      return it;
    }

    function onClick(side, val) {
      if (state.checked) return;
      var sel = state.sel;
      if (sel && sel.side === side && sel.val === val) { state.sel = null; rerender(); return; }
      if (!sel || sel.side === side) { state.sel = { side: side, val: val }; rerender(); return; }
      connect(sel.side === 'l' ? sel.val : val, sel.side === 'l' ? val : sel.val);
    }

    function connect(l, r) {
      state.conn = state.conn.filter(function (c) { return c.l !== l && c.r !== r; });
      state.conn.push({ l: l, r: r, state: '' });
      state.sel = null;
      rerender();
    }

    /* Перетаскивание: зажали элемент одной колонки — за пальцем/курсором
       тянется пунктирная линия-«верёвочка» (ghost), отпустили над элементом
       ДРУГОЙ колонки — связка создаётся так же, как двумя тапами подряд.
       Слушатели на document, а не только на самом элементе: палец/курсор
       уходит за пределы стартового узла почти сразу же, как только жест
       начался. preventDefault на pointerdown — чтобы Safari не начинал
       выделение текста жестом, который выглядит как долгое нажатие. */
    function onPointerDown(side, val, e) {
      if (state.checked) return;
      e.preventDefault();
      drag = { side: side, val: val, x0: e.clientX, y0: e.clientY, moved: false, over: null };
      ensureGhost();
      updateGhost(e.clientX, e.clientY);
    }

    function itemUnder(x, y) {
      var el = document.elementFromPoint(x, y);
      return el && el.closest ? el.closest('.lnm-item') : null;
    }

    function onPointerMove(e) {
      if (!drag) return;
      var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.moved && (dx * dx + dy * dy) > 16) drag.moved = true;
      updateGhost(e.clientX, e.clientY);
      var it = itemUnder(e.clientX, e.clientY);
      var target = (it && it.getAttribute('data-side') !== drag.side) ? it : null;
      if (drag.over && drag.over !== target) drag.over.className = drag.over.className.replace(/\s*\blnm-drop\b/, '');
      if (target && target !== drag.over) target.className += ' lnm-drop';
      drag.over = target;
    }

    function onPointerUp(e) {
      if (!drag) return;
      var d = drag;
      drag = null;
      removeGhost();
      if (d.over) d.over.className = d.over.className.replace(/\s*\blnm-drop\b/, '');
      if (!d.moved) { onClick(d.side, d.val); return; }
      var it = itemUnder(e.clientX, e.clientY);
      if (it && it.getAttribute('data-side') !== d.side) {
        var val2 = it.getAttribute('data-val');
        connect(d.side === 'l' ? d.val : val2, d.side === 'l' ? val2 : d.val);
      }
      /* мимо элемента или в свою же колонку — жест просто отменяется */
    }

    function edgePoint(el, side) {
      var bb = container.querySelector('.lnm-box').getBoundingClientRect();
      var r = el.getBoundingClientRect();
      return side === 'l'
        ? { x: r.right - bb.left + 2, y: r.top - bb.top + r.height / 2 }
        : { x: r.left - bb.left - 2, y: r.top - bb.top + r.height / 2 };
    }

    function ensureGhost() {
      if (ghost) return;
      ghost = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      ghost.setAttribute('class', 'lnm-ghost');
      ghost.setAttribute('fill', 'none');
      ghost.setAttribute('stroke', 'var(--lnm-accent)');
      ghost.setAttribute('stroke-width', '3');
      ghost.setAttribute('stroke-linecap', 'round');
      ghost.setAttribute('stroke-dasharray', '1 8');
      svg.appendChild(ghost);
    }

    function removeGhost() {
      if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost);
      ghost = null;
    }

    function updateGhost(clientX, clientY) {
      if (!ghost || !drag) return;
      var el = container.querySelector('.lnm-item[data-side="' + drag.side + '"][data-val="' + esc(drag.val) + '"]');
      if (!el) return;
      var a = edgePoint(el, drag.side);
      var bb = container.querySelector('.lnm-box').getBoundingClientRect();
      var bx = clientX - bb.left, by = clientY - bb.top;
      ghost.setAttribute('d', 'M ' + a.x + ' ' + a.y + ' L ' + bx + ' ' + by);
    }

    /* Полная перестройка узлов, а не точечный css-класс: точек нажатия мало,
       а верёвочек пересчитывать позиции при каждом клике всё равно нужно —
       упрощать до diff нет смысла на раунде из 6-10 пар. */
    function rerender() {
      var order = [].slice.call(colR.children).map(function (n) { return n.getAttribute('data-val'); });
      render(order);
    }

    function drawLines() {
      if (!svg || !svg.isConnected) return;
      svg.innerHTML = '';
      state.conn.forEach(function (c) {
        var li = container.querySelector('.lnm-item[data-side="l"][data-val="' + esc(c.l) + '"]');
        var ri = container.querySelector('.lnm-item[data-side="r"][data-val="' + esc(c.r) + '"]');
        if (!li || !ri) return;
        var a = edgePoint(li, 'l'), b = edgePoint(ri, 'r');
        var x1 = a.x, y1 = a.y, x2 = b.x, y2 = b.y;
        var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('d', 'M ' + x1 + ' ' + y1 + ' C ' + (x1 + 30) + ' ' + y1 + ', ' +
          (x2 - 30) + ' ' + y2 + ', ' + x2 + ' ' + y2);
        p.setAttribute('fill', 'none');
        p.setAttribute('stroke', c.state === 'ok' ? 'var(--lnm-ok)' : c.state === 'bad' ? 'var(--lnm-bad)' : 'var(--lnm-ink)');
        p.setAttribute('stroke-width', '3');
        p.setAttribute('stroke-linecap', 'round');
        svg.appendChild(p);
      });
    }

    function check() {
      if (state.checked) return lastResult;
      state.checked = true;
      var good = 0, items = [];
      state.pairs.forEach(function (p) {
        var c = state.conn.filter(function (x) { return x.l === p[0]; })[0];
        var ok = !!c && c.r === p[1];
        if (c) c.state = ok ? 'ok' : 'bad';
        if (ok) good++;
        items.push({ l: p[0], r: p[1], ok: ok });
      });
      rerender();
      lastResult = { good: good, total: state.pairs.length, items: items };
      if (opts.onCheck) opts.onCheck(lastResult);
      return lastResult;
    }
    var lastResult = null;

    function reset(newPairs) {
      state.pairs = newPairs || state.pairs;
      state.conn = [];
      state.sel = null;
      state.checked = false;
      lastResult = null;
      var rightOrder = opts.shuffleRight === false ? state.pairs.map(function (p) { return p[1]; })
        : shuffle(state.pairs.map(function (p) { return p[1]; }));
      render(rightOrder);
    }

    function destroy() {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerUp);
      container.innerHTML = '';
      container.className = container.className.replace(/\blnm\b/, '').trim();
    }

    /* На document, а не на container: жест начинается на узле внутри
       колонки, но палец/курсор почти сразу уходит за его пределы, а
       отпускание может случиться где угодно на странице. */
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);

    build();
    reset(pairs);
    return { check: check, reset: reset, destroy: destroy };
  }

  global.LinesMatch = { mount: mount };
})(typeof window !== 'undefined' ? window : this);
