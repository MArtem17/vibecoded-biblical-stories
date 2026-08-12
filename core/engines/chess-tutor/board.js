/* core/engines/chess-tutor/board.js
 * Доска рисуется КОДОМ (DOM-сетка 8×8), позиции всегда верны. Фигуры —
 * единый набор Стаунтон через Unicode-глифы (♔♕♖♗♘♙), белые — костяные,
 * чёрные — тёмные. Ввод — PointerEvent (нажми-нажми и перетаскивание),
 * как требует тех-ТЗ (Playwright тестирует pointer-события, не mouse.*).
 *
 * Использование:
 *   var b = ChessBoard.create(hostEl, { orientation:'w', onMove:fn, interactive:true });
 *   b.setPosition(game);              // отрисовать из объекта Chess
 *   b.setOrientation('b');
 *   b.highlight(['e4','d5'], 'target')  // подсветить клетки классом
 *   b.clearHighlights();
 *   b.setInteractive(true|false);
 *   b.flashCheck('e1');               // отметить шах
 *   onMove({from,to}) -> вернуть true, если ход принят (тогда доска перерисуется)
 */
var ChessBoard = (function () {
  'use strict';

  var GLYPH = {
    wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
    bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟'
  };
  var FILES = 'abcdefgh';

  function create(host, opts) {
    opts = opts || {};
    var orientation = opts.orientation || 'w';
    var interactive = opts.interactive !== false;
    var onMove = opts.onMove || function () { return false; };
    var onPick = opts.onPick || null;        // уведомление о выборе клетки (для уроков)
    var game = null;
    var selected = null;                      // алгебраика выбранной клетки
    var legalForSel = [];                     // допустимые клетки хода из selected
    var cells = {};                           // alg -> DOM
    var highlights = {};                      // alg -> className

    var root = document.createElement('div');
    root.className = 'cb-board';
    host.innerHTML = '';
    host.appendChild(root);

    function squaresInOrder() {
      var out = [];
      var ranks = (orientation === 'w') ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
      var files = (orientation === 'w') ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
      for (var r = 0; r < 8; r++)
        for (var f = 0; f < 8; f++)
          out.push(FILES.charAt(files[f]) + ranks[r]);
      return out;
    }

    function build() {
      root.innerHTML = '';
      cells = {};
      var list = squaresInOrder();
      for (var i = 0; i < list.length; i++) {
        var alg = list[i];
        var fileIdx = FILES.indexOf(alg.charAt(0));
        var rankIdx = parseInt(alg.charAt(1), 10) - 1;
        var dark = (fileIdx + rankIdx) % 2 === 0;
        var cell = document.createElement('div');
        cell.className = 'cb-cell ' + (dark ? 'cb-dark' : 'cb-light');
        cell.setAttribute('data-sq', alg);
        var pieceEl = document.createElement('span');
        pieceEl.className = 'cb-piece';
        cell.appendChild(pieceEl);
        // координатные подписи по краю
        if (i % 8 === 0) { var rl = document.createElement('b'); rl.className = 'cb-coord cb-rank'; rl.textContent = alg.charAt(1); cell.appendChild(rl); }
        if (i >= 56) { var fl = document.createElement('b'); fl.className = 'cb-coord cb-file'; fl.textContent = alg.charAt(0); cell.appendChild(fl); }
        bindPointer(cell, alg);
        root.appendChild(cell);
        cells[alg] = cell;
      }
      render();
    }

    function render() {
      for (var alg in cells) {
        if (!cells.hasOwnProperty(alg)) continue;
        var span = cells[alg].firstChild;
        var p = game ? game.get(alg) : null;
        span.textContent = p ? GLYPH[p.color + p.type] : '';
        span.className = 'cb-piece' + (p ? (p.color === 'w' ? ' cb-white' : ' cb-black') : '');
        cells[alg].className = cells[alg].className.replace(/\s*cb-(sel|move|target|check|good|bad)/g, '');
      }
      if (selected) addClass(selected, 'cb-sel');
      for (var i = 0; i < legalForSel.length; i++) addClass(legalForSel[i], 'cb-move');
      for (var h in highlights) if (highlights.hasOwnProperty(h)) addClass(h, highlights[h]);
    }

    function addClass(alg, cls) { if (cells[alg]) cells[alg].className += ' ' + cls; }

    function select(alg) {
      selected = alg;
      legalForSel = [];
      if (game && interactive) {
        var ms = game.moves({ square: alg });
        for (var i = 0; i < ms.length; i++) legalForSel.push(ms[i].toAlg);
      }
      render();
      if (onPick) onPick(alg);
    }

    function clearSelect() { selected = null; legalForSel = []; render(); }

    function tryMove(from, to) {
      var accepted = onMove({ from: from, to: to });
      clearSelect();
      if (accepted) render();
      return accepted;
    }

    // Pointer-логика: tap-tap и drag&drop в одном.
    var dragging = null;     // {from, ghost}
    function bindPointer(cell, alg) {
      cell.addEventListener('pointerdown', function (e) {
        if (!interactive) { if (onPick) onPick(alg); return; }
        var p = game ? game.get(alg) : null;
        if (selected && selected !== alg && indexOf(legalForSel, alg) >= 0) {
          tryMove(selected, alg);                // вторым нажатием — ход
          return;
        }
        if (p && game && p.color === game.turn()) {
          select(alg);
          startDrag(e, alg);                      // и сразу готов к перетаскиванию
        } else {
          clearSelect();
        }
      });
    }

    function startDrag(e, from) {
      var ghost = document.createElement('span');
      ghost.className = 'cb-ghost';
      var p = game.get(from);
      ghost.textContent = GLYPH[p.color + p.type];
      ghost.style.color = (p.color === 'w') ? '#f3ead6' : '#1d1d1d';
      document.body.appendChild(ghost);
      dragging = { from: from, ghost: ghost };
      moveGhost(e);
      try { e.target.setPointerCapture(e.pointerId); } catch (err) {}
      window.addEventListener('pointermove', onDragMove);
      window.addEventListener('pointerup', onDragUp);
    }
    function moveGhost(e) {
      if (!dragging) return;
      dragging.ghost.style.left = (e.clientX) + 'px';
      dragging.ghost.style.top = (e.clientY) + 'px';
    }
    function onDragMove(e) { moveGhost(e); }
    function onDragUp(e) {
      window.removeEventListener('pointermove', onDragMove);
      window.removeEventListener('pointerup', onDragUp);
      if (!dragging) return;
      var from = dragging.from;
      if (dragging.ghost.parentNode) dragging.ghost.parentNode.removeChild(dragging.ghost);
      var el = document.elementFromPoint ? document.elementFromPoint(e.clientX, e.clientY) : null;
      dragging = null;
      var target = el ? closestSquare(el) : null;
      if (target && target !== from && indexOf(legalForSel, target) >= 0) {
        tryMove(from, target);
      }
    }
    function closestSquare(el) {
      while (el && el !== document.body) {
        if (el.getAttribute && el.getAttribute('data-sq')) return el.getAttribute('data-sq');
        el = el.parentNode;
      }
      return null;
    }
    function indexOf(arr, v) { for (var i = 0; i < arr.length; i++) if (arr[i] === v) return i; return -1; }

    build();

    return {
      el: root,
      setPosition: function (g) { game = g; clearSelect(); render(); },
      refresh: function () { render(); },
      setOrientation: function (o) { orientation = o; build(); },
      orientation: function () { return orientation; },
      setInteractive: function (v) { interactive = v; clearSelect(); },
      setOnMove: function (fn) { onMove = fn; },
      setOnPick: function (fn) { onPick = fn; },
      highlight: function (squares, cls) {
        cls = cls || 'cb-target';
        for (var i = 0; i < squares.length; i++) highlights[squares[i]] = cls;
        render();
      },
      clearHighlights: function () { highlights = {}; render(); },
      flashCheck: function (alg) { highlights[alg] = 'cb-check'; render(); },
      select: select,
      clearSelect: clearSelect
    };
  }

  return { create: create, GLYPH: GLYPH };
})();
