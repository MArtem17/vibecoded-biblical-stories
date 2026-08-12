/* core/engines/chess-tutor/chess.js
 * Шахматный движок платформы «Образовариум» (ES5, vanilla, офлайн).
 * Генерация легальных ходов, шах/мат/пат, рокировка, взятие на проходе,
 * превращение, базовая нотация и FEN. Своего «искусственного интеллекта»
 * здесь нет — только правила. Доска внутри — 0x88 (128 клеток).
 *
 * Публичный API (см. README.md движка):
 *   var g = Chess.create(fen?)         // новая позиция (по умолчанию — начальная)
 *   g.turn()        -> 'w' | 'b'
 *   g.get('e4')     -> {type:'p', color:'w'} | null
 *   g.moves(opts)   -> [moveObj]       // opts.square ограничивает по клетке
 *   g.move(m)       -> moveObj | null  // m = {from,to,promotion?} либо SAN-строка
 *   g.undo()        -> moveObj | null
 *   g.inCheck()     -> bool
 *   g.isCheckmate() / g.isStalemate() / g.isDraw() / g.isGameOver()
 *   g.fen()         -> строка FEN
 *   g.history()     -> [moveObj]
 *   g.clone()       -> независимая копия позиции
 *   Chess.SQUARES   -> ['a8'..'h1']    // для перебора
 */
var Chess = (function () {
  'use strict';

  var WHITE = 'w', BLACK = 'b';
  var PAWN = 'p', KNIGHT = 'n', BISHOP = 'b', ROOK = 'r', QUEEN = 'q', KING = 'k';

  // Смещения ходов на 0x88.
  var OFFSETS = {
    n: [-18, -33, -31, -14, 18, 33, 31, 14],
    b: [-17, -15, 17, 15],
    r: [-16, 1, 16, -1],
    q: [-17, -16, -15, 1, 17, 16, 15, -1],
    k: [-17, -16, -15, 1, 17, 16, 15, -1]
  };
  var SLIDING = { b: true, r: true, q: true };

  // Флаги хода.
  var BITS = {
    NORMAL: 1, CAPTURE: 2, BIG_PAWN: 4, EP_CAPTURE: 8,
    PROMOTION: 16, KSIDE_CASTLE: 32, QSIDE_CASTLE: 64
  };

  var RANK_1 = 0, RANK_8 = 7;

  function file(sq) { return sq & 15; }
  function rank(sq) { return sq >> 4; }
  function isOnBoard(sq) { return (sq & 0x88) === 0; }

  // Алгебраика <-> 0x88. На 0x88 ранг 0 — это «1», ранг 7 — «8».
  function algebraic(sq) {
    return 'abcdefgh'.charAt(file(sq)) + (rank(sq) + 1);
  }
  function toSq(alg) {
    var f = 'abcdefgh'.indexOf(alg.charAt(0));
    var r = parseInt(alg.charAt(1), 10) - 1;
    return r * 16 + f;
  }

  // Список всех клеток сверху-вниз слева-направо (a8..h1) — удобно для UI.
  var SQUARES = (function () {
    var out = [];
    for (var r = 7; r >= 0; r--) {
      for (var f = 0; f < 8; f++) out.push(algebraic(r * 16 + f));
    }
    return out;
  })();

  var START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  function create(initFen) {
    var board = new Array(128);            // фигуры или null
    for (var i = 0; i < 128; i++) board[i] = null;
    var turn = WHITE;
    var castling = { w: 0, b: 0 };          // BITS.KSIDE_CASTLE | QSIDE_CASTLE
    var epSquare = -1;                      // клетка взятия на проходе (0x88) или -1
    var halfMoves = 0, moveNumber = 1;
    var kings = { w: -1, b: -1 };
    var history = [];

    function clearMeta() { /* зарезервировано */ }

    function load(f) {
      f = f || START_FEN;
      for (var i = 0; i < 128; i++) board[i] = null;
      kings.w = kings.b = -1;
      var parts = f.split(/\s+/);
      var rows = parts[0].split('/');
      var sq = toSq('a8');
      for (var r = 0; r < 8; r++) {
        var row = rows[r];
        var f2 = 0;
        for (var c = 0; c < row.length; c++) {
          var ch = row.charAt(c);
          if (/[1-8]/.test(ch)) { f2 += parseInt(ch, 10); }
          else {
            var color = ch === ch.toLowerCase() ? BLACK : WHITE;
            var type = ch.toLowerCase();
            var s = (7 - r) * 16 + f2;
            board[s] = { type: type, color: color };
            if (type === KING) kings[color] = s;
            f2++;
          }
        }
      }
      turn = (parts[1] === 'b') ? BLACK : WHITE;
      castling.w = 0; castling.b = 0;
      var cr = parts[2] || '-';
      if (cr.indexOf('K') >= 0) castling.w |= BITS.KSIDE_CASTLE;
      if (cr.indexOf('Q') >= 0) castling.w |= BITS.QSIDE_CASTLE;
      if (cr.indexOf('k') >= 0) castling.b |= BITS.KSIDE_CASTLE;
      if (cr.indexOf('q') >= 0) castling.b |= BITS.QSIDE_CASTLE;
      epSquare = (parts[3] && parts[3] !== '-') ? toSq(parts[3]) : -1;
      halfMoves = parts[4] ? parseInt(parts[4], 10) : 0;
      moveNumber = parts[5] ? parseInt(parts[5], 10) : 1;
      history = [];
    }

    function get(alg) {
      var p = board[toSq(alg)];
      return p ? { type: p.type, color: p.color } : null;
    }

    function isAttacked(color, sq) {
      // Атакована ли клетка sq фигурами цвета color?
      for (var i = 0; i < 128; i++) {
        if (i & 0x88) { i += 7; continue; }
        var p = board[i];
        if (!p || p.color !== color) continue;
        var diff = i - sq;
        if (p.type === PAWN) {
          // пешка бьёт по диагонали в сторону хода
          var dir = (color === WHITE) ? 16 : -16;
          if (i + dir + 1 === sq || i + dir - 1 === sq) return true;
          continue;
        }
        if (p.type === KNIGHT) {
          var no = OFFSETS.n;
          for (var k = 0; k < no.length; k++) if (i + no[k] === sq) return true;
          continue;
        }
        if (p.type === KING) {
          var ko = OFFSETS.k;
          for (var k2 = 0; k2 < ko.length; k2++) if (i + ko[k2] === sq) return true;
          continue;
        }
        var offs = OFFSETS[p.type];
        for (var o = 0; o < offs.length; o++) {
          var t = i + offs[o], blocked = false;
          while (isOnBoard(t)) {
            if (t === sq) { if (!blocked) return true; else break; }
            if (board[t]) { blocked = true; break; }
            t += offs[o];
          }
        }
      }
      return false;
    }

    function kingAttacked(color) {
      return isAttacked(swap(color), kings[color]);
    }
    function swap(c) { return c === WHITE ? BLACK : WHITE; }

    function buildMove(from, to, flags, promotion) {
      var m = {
        color: turn, from: from, to: to,
        fromAlg: algebraic(from), toAlg: algebraic(to),
        piece: board[from].type, flags: flags,
        captured: null, promotion: null
      };
      if (board[to]) m.captured = board[to].type;
      else if (flags & BITS.EP_CAPTURE) m.captured = PAWN;
      if (promotion) { m.promotion = promotion; }
      return m;
    }

    function generate(opts) {
      opts = opts || {};
      var us = turn, them = swap(us);
      var moves = [];
      var single = opts.square ? toSq(opts.square) : -1;

      function addPawn(from, to, flags) {
        var r = rank(to);
        if ((us === WHITE && r === RANK_8) || (us === BLACK && r === RANK_1)) {
          var promos = [QUEEN, ROOK, BISHOP, KNIGHT];
          for (var pi = 0; pi < promos.length; pi++)
            moves.push(buildMove(from, to, flags | BITS.PROMOTION, promos[pi]));
        } else {
          moves.push(buildMove(from, to, flags));
        }
      }

      for (var i = 0; i < 128; i++) {
        if (i & 0x88) { i += 7; continue; }
        if (single >= 0 && i !== single) continue;
        var p = board[i];
        if (!p || p.color !== us) continue;

        if (p.type === PAWN) {
          var dir = (us === WHITE) ? 16 : -16;
          var one = i + dir;
          if (isOnBoard(one) && !board[one]) {
            addPawn(i, one, BITS.NORMAL);
            var startRank = (us === WHITE) ? 1 : 6;
            var two = i + dir * 2;
            if (rank(i) === startRank && !board[two])
              moves.push(buildMove(i, two, BITS.BIG_PAWN));
          }
          var caps = [i + dir - 1, i + dir + 1];
          for (var ci = 0; ci < 2; ci++) {
            var c = caps[ci];
            if (!isOnBoard(c)) continue;
            if (board[c] && board[c].color === them) addPawn(i, c, BITS.CAPTURE);
            else if (c === epSquare) moves.push(buildMove(i, c, BITS.EP_CAPTURE));
          }
        } else {
          var offs = OFFSETS[p.type];
          for (var o = 0; o < offs.length; o++) {
            var t = i + offs[o];
            while (isOnBoard(t)) {
              if (!board[t]) {
                moves.push(buildMove(i, t, BITS.NORMAL));
              } else {
                if (board[t].color === them) moves.push(buildMove(i, t, BITS.CAPTURE));
                break;
              }
              if (!SLIDING[p.type]) break;
              t += offs[o];
            }
          }
        }
      }

      // Рокировка (только при переборе без ограничения по клетке либо по клетке короля).
      if (single < 0 || single === kings[us]) {
        var ks = kings[us];
        if (castling[us] & BITS.KSIDE_CASTLE) {
          var f1 = ks + 1, g1 = ks + 2;
          if (!board[f1] && !board[g1] &&
              !isAttacked(them, ks) && !isAttacked(them, f1) && !isAttacked(them, g1)) {
            moves.push(buildMove(ks, g1, BITS.KSIDE_CASTLE));
          }
        }
        if (castling[us] & BITS.QSIDE_CASTLE) {
          var d1 = ks - 1, c1 = ks - 2, b1 = ks - 3;
          if (!board[d1] && !board[c1] && !board[b1] &&
              !isAttacked(them, ks) && !isAttacked(them, d1) && !isAttacked(them, c1)) {
            moves.push(buildMove(ks, c1, BITS.QSIDE_CASTLE));
          }
        }
      }

      if (opts.legal === false) return moves;

      // Отсев нелегальных: ход не должен оставлять своего короля под боем.
      var legal = [];
      for (var mi = 0; mi < moves.length; mi++) {
        applyMove(moves[mi]);
        if (!kingAttacked(us)) legal.push(moves[mi]);
        unApply(moves[mi]);
      }
      return legal;
    }

    function applyMove(m) {
      var us = m.color, them = swap(us);
      var prev = {
        epSquare: epSquare, halfMoves: halfMoves,
        castlingW: castling.w, castlingB: castling.b,
        kingW: kings.w, kingB: kings.b
      };
      board[m.to] = board[m.from];
      board[m.from] = null;

      if (m.flags & BITS.EP_CAPTURE) {
        board[m.to + (us === WHITE ? -16 : 16)] = null;
      }
      if (m.promotion) board[m.to] = { type: m.promotion, color: us };
      if (board[m.to].type === KING) {
        kings[us] = m.to;
        if (m.flags & BITS.KSIDE_CASTLE) { board[m.to - 1] = board[m.to + 1]; board[m.to + 1] = null; }
        else if (m.flags & BITS.QSIDE_CASTLE) { board[m.to + 1] = board[m.to - 2]; board[m.to - 2] = null; }
        castling[us] = 0;
      }
      // Потеря прав рокировки при ходе/взятии ладьи.
      updateCastlingRights(us, m.from);
      updateCastlingRights(them, m.to);

      epSquare = (m.flags & BITS.BIG_PAWN) ? (m.to + (us === WHITE ? -16 : 16)) : -1;

      if (m.piece === PAWN || (m.flags & (BITS.CAPTURE | BITS.EP_CAPTURE))) halfMoves = 0;
      else halfMoves++;
      if (us === BLACK) moveNumber++;
      turn = them;
      m._prev = prev;
    }

    function updateCastlingRights(color, sq) {
      var homeRank = (color === WHITE) ? 0 : 7;
      var kingHome = homeRank * 16 + 4;
      if (sq === kingHome) castling[color] = 0;
      if (sq === homeRank * 16 + 7) castling[color] &= ~BITS.KSIDE_CASTLE;
      if (sq === homeRank * 16 + 0) castling[color] &= ~BITS.QSIDE_CASTLE;
    }

    function undoMove() {
      var m = history.pop();
      if (!m) return null;
      unApply(m);
      return m;
    }

    function unApply(m) {
      var us = m.color, them = swap(us);
      var prev = m._prev;
      turn = us;
      castling.w = prev.castlingW; castling.b = prev.castlingB;
      epSquare = prev.epSquare; halfMoves = prev.halfMoves;
      kings.w = prev.kingW; kings.b = prev.kingB;
      moveNumber = (us === BLACK) ? moveNumber - 1 : moveNumber;

      board[m.from] = { type: m.piece, color: us };
      board[m.to] = null;
      if (m.captured && !(m.flags & BITS.EP_CAPTURE)) {
        board[m.to] = { type: m.captured, color: them };
      }
      if (m.flags & BITS.EP_CAPTURE) {
        board[m.to + (us === WHITE ? -16 : 16)] = { type: PAWN, color: them };
      }
      if (m.flags & BITS.KSIDE_CASTLE) { board[m.to + 1] = board[m.to - 1]; board[m.to - 1] = null; }
      else if (m.flags & BITS.QSIDE_CASTLE) { board[m.to - 2] = board[m.to + 1]; board[m.to + 1] = null; }
      return m;
    }

    // Внутренний apply, который ещё и кладёт в историю — для публичного move().
    function commit(m) { history.push(m); applyMove(m); }

    function sanOf(m, legalMoves) {
      if (m.flags & BITS.KSIDE_CASTLE) return castleSuffix(m, 'O-O');
      if (m.flags & BITS.QSIDE_CASTLE) return castleSuffix(m, 'O-O-O');
      var s = '';
      if (m.piece !== PAWN) {
        s += m.piece.toUpperCase();
        // Уточнение неоднозначности.
        var amb = disambiguator(m, legalMoves);
        s += amb;
      }
      if (m.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
        if (m.piece === PAWN) s += 'abcdefgh'.charAt(file(m.from));
        s += 'x';
      }
      s += m.toAlg;
      if (m.promotion) s += '=' + m.promotion.toUpperCase();
      return checkSuffix(m, s);
    }
    function castleSuffix(m, s) { return checkSuffix(m, s); }
    function checkSuffix(m, s) {
      commit(m);
      if (kingAttacked(turn)) s += generate({}).length === 0 ? '#' : '+';
      undoMove();
      return s;
    }
    function disambiguator(m, legalMoves) {
      var same = [];
      for (var i = 0; i < legalMoves.length; i++) {
        var x = legalMoves[i];
        if (x.piece === m.piece && x.to === m.to && x.from !== m.from) same.push(x);
      }
      if (!same.length) return '';
      var sameFile = false, sameRank = false;
      for (var j = 0; j < same.length; j++) {
        if (file(same[j].from) === file(m.from)) sameFile = true;
        if (rank(same[j].from) === rank(m.from)) sameRank = true;
      }
      if (!sameFile) return 'abcdefgh'.charAt(file(m.from));
      if (!sameRank) return '' + (rank(m.from) + 1);
      return m.fromAlg;
    }

    function move(input) {
      var legal = generate({});
      var chosen = null;
      if (typeof input === 'string') {
        for (var i = 0; i < legal.length; i++) {
          if (sanOf(legal[i], legal) === input ||
              sanOf(legal[i], legal).replace(/[+#]/, '') === input.replace(/[+#]/, '')) {
            chosen = legal[i]; break;
          }
        }
      } else {
        var from = input.from, to = input.to, promo = input.promotion || QUEEN;
        for (var j = 0; j < legal.length; j++) {
          var mm = legal[j];
          if (mm.fromAlg === from && mm.toAlg === to) {
            if (mm.promotion) { if (mm.promotion === promo) { chosen = mm; break; } }
            else { chosen = mm; break; }
          }
        }
      }
      if (!chosen) return null;
      chosen.san = sanOf(chosen, legal);
      commit(chosen);
      return chosen;
    }

    function inCheck() { return kingAttacked(turn); }
    function isCheckmate() { return inCheck() && generate({}).length === 0; }
    function isStalemate() { return !inCheck() && generate({}).length === 0; }
    function insufficientMaterial() {
      var pieces = [], bishops = [], n = 0;
      for (var i = 0; i < 128; i++) {
        if (i & 0x88) { i += 7; continue; }
        var p = board[i];
        if (!p) continue;
        n++;
        if (p.type !== KING) pieces.push(p.type);
        if (p.type === BISHOP) bishops.push((file(i) + rank(i)) % 2);
      }
      if (n === 2) return true;                                   // К vs К
      if (n === 3 && (pieces[0] === BISHOP || pieces[0] === KNIGHT)) return true; // + лёгкая
      if (n >= 4) {
        var onlyBishops = true;
        for (var k = 0; k < pieces.length; k++) if (pieces[k] !== BISHOP) onlyBishops = false;
        if (onlyBishops && bishops.length) {
          var sameColor = true;
          for (var b = 1; b < bishops.length; b++) if (bishops[b] !== bishops[0]) sameColor = false;
          if (sameColor) return true;
        }
      }
      return false;
    }
    function isDraw() { return halfMoves >= 100 || isStalemate() || insufficientMaterial(); }
    function isGameOver() { return isCheckmate() || isDraw(); }

    function fen() {
      var out = '';
      for (var r = 7; r >= 0; r--) {
        var empty = 0;
        for (var f = 0; f < 8; f++) {
          var p = board[r * 16 + f];
          if (!p) { empty++; }
          else {
            if (empty) { out += empty; empty = 0; }
            out += (p.color === WHITE) ? p.type.toUpperCase() : p.type;
          }
        }
        if (empty) out += empty;
        if (r > 0) out += '/';
      }
      var cr = '';
      if (castling.w & BITS.KSIDE_CASTLE) cr += 'K';
      if (castling.w & BITS.QSIDE_CASTLE) cr += 'Q';
      if (castling.b & BITS.KSIDE_CASTLE) cr += 'k';
      if (castling.b & BITS.QSIDE_CASTLE) cr += 'q';
      out += ' ' + turn + ' ' + (cr || '-') + ' ' +
             (epSquare >= 0 ? algebraic(epSquare) : '-') + ' ' + halfMoves + ' ' + moveNumber;
      return out;
    }

    function put(piece, alg) {
      var s = toSq(alg);
      board[s] = { type: piece.type, color: piece.color };
      if (piece.type === KING) kings[piece.color] = s;
    }
    function remove(alg) { board[toSq(alg)] = null; }

    var api = {
      load: load,
      reset: function () { load(START_FEN); },
      get: get,
      put: put,
      remove: remove,
      turn: function () { return turn; },
      moves: function (opts) {
        var ms = generate(opts || {});
        // приложить san для удобства потребителя
        var all = generate({});
        for (var i = 0; i < ms.length; i++) ms[i].san = sanOf(ms[i], all);
        return ms;
      },
      move: move,
      undo: undoMove,
      inCheck: inCheck,
      isCheckmate: isCheckmate,
      isStalemate: isStalemate,
      isDraw: isDraw,
      insufficientMaterial: insufficientMaterial,
      isGameOver: isGameOver,
      fen: fen,
      kingSquare: function (color) { return algebraic(kings[color]); },
      history: function () { return history.slice(); },
      isAttackedBy: function (color, alg) { return isAttacked(color, toSq(alg)); },
      clone: function () { return create(fen()); }
    };
    load(initFen);
    return api;
  }

  return {
    create: create,
    SQUARES: SQUARES,
    START_FEN: START_FEN,
    WHITE: WHITE, BLACK: BLACK,
    PAWN: PAWN, KNIGHT: KNIGHT, BISHOP: BISHOP, ROOK: ROOK, QUEEN: QUEEN, KING: KING
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Chess;
