/* core/engines/chess-tutor/ai.js
 * Соперник «под уровень» поверх правил из chess.js. Не цель — максимум силы,
 * цель — честное «под уровень» и педагогичные ошибки: ИИ «зевает» именно то,
 * что игрок уже умеет наказывать (см. тех-ТЗ C.2). Реализация — ограниченный
 * по глубине негамакс с материальной оценкой и контролируемой «слепотой».
 *
 *   ChessAI.pick(game, { level:0..5, blindness:0..1, rng:fn }) -> moveObj | null
 *   ChessAI.evaluate(game) -> число (с точки зрения белых, в сотых пешки)
 *
 * Подбор хода ограничен по глубине, чтобы не «вешать» интерфейс.
 */
var ChessAI = (function () {
  'use strict';

  var VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

  // Небольшие позиционные бонусы — чтобы новичок-ИИ всё же развивал фигуры
  // и шёл в центр, а не топтался. Таблица для белых, для чёрных — зеркало.
  var CENTER = [
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 1, 1, 1, 1, 0,
    0, 1, 2, 2, 2, 2, 1, 0,
    0, 1, 2, 3, 3, 2, 1, 0,
    0, 1, 2, 3, 3, 2, 1, 0,
    0, 1, 2, 2, 2, 2, 1, 0,
    0, 1, 1, 1, 1, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0
  ];

  function evaluate(game) {
    var score = 0;
    var sq = Chess.SQUARES;
    for (var i = 0; i < sq.length; i++) {
      var p = game.get(sq[i]);
      if (!p) continue;
      var v = VAL[p.type];
      var f = 'abcdefgh'.indexOf(sq[i].charAt(0));
      var r = parseInt(sq[i].charAt(1), 10) - 1;
      var idx = r * 8 + f;
      var c = CENTER[idx] * 4;
      if (p.color === 'w') score += v + c;
      else score -= v + c;
    }
    return score;
  }

  function negamax(game, depth, alpha, beta, color) {
    if (depth === 0 || game.isGameOver()) {
      if (game.isCheckmate()) return -100000 + (10 - depth); // быстрее мат — лучше
      if (game.isDraw()) return 0;
      return color * evaluate(game);
    }
    var moves = game.moves();
    if (!moves.length) return color * evaluate(game);
    orderMoves(moves);
    var best = -1e9;
    for (var i = 0; i < moves.length; i++) {
      game.move({ from: moves[i].fromAlg, to: moves[i].toAlg, promotion: moves[i].promotion || 'q' });
      var val = -negamax(game, depth - 1, -beta, -alpha, -color);
      game.undo();
      if (val > best) best = val;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
    return best;
  }

  function orderMoves(moves) {
    // Взятия и превращения — вперёд (для отсечений).
    moves.sort(function (a, b) {
      return scoreMove(b) - scoreMove(a);
    });
  }
  function scoreMove(m) {
    var s = 0;
    if (m.captured) s += VAL[m.captured] - VAL[m.piece] / 10;
    if (m.promotion) s += VAL[m.promotion];
    return s;
  }

  function pick(game, opts) {
    opts = opts || {};
    var level = (opts.level == null) ? 2 : opts.level;
    var blindness = (opts.blindness == null) ? 0 : opts.blindness;
    var rng = opts.rng || Math.random;
    var color = (game.turn() === 'w') ? 1 : -1;

    var moves = game.moves();
    if (!moves.length) return null;

    // Глубина растёт с уровнем (0 — почти случайно, 5 — 3 полухода).
    var depth = [0, 1, 1, 2, 2, 3][Math.max(0, Math.min(5, level))];

    // «Слепота»: с вероятностью blindness ИИ вообще не считает — играет
    // случайный (но не самоубийственный) ход. Это и есть педагогичный зевок.
    if (depth === 0 || rng() < blindness) {
      return randomSensible(game, moves, rng, blindness);
    }

    orderMoves(moves);
    var best = [], bestVal = -1e9;
    for (var i = 0; i < moves.length; i++) {
      game.move({ from: moves[i].fromAlg, to: moves[i].toAlg, promotion: moves[i].promotion || 'q' });
      var val = -negamax(game, depth - 1, -1e9, 1e9, -color);
      game.undo();
      // Лёгкий шум, чтобы при равных не быть предсказуемым.
      val += (rng() - 0.5) * 6;
      if (val > bestVal + 1e-6) { bestVal = val; best = [moves[i]]; }
      else if (Math.abs(val - bestVal) <= 8) best.push(moves[i]);
    }
    return best[Math.floor(rng() * best.length)] || moves[0];
  }

  // Случайный, но не подставляющий ферзя под бесплатный бой; при высокой
  // слепоте контроль ослабляется — тогда и случаются крупные зевки.
  function randomSensible(game, moves, rng, blindness) {
    var safe = [], any = moves.slice();
    for (var i = 0; i < moves.length; i++) {
      var m = moves[i];
      if (m.captured) { safe.push(m); continue; }   // взятия пробуем охотно
      game.move({ from: m.fromAlg, to: m.toAlg, promotion: 'q' });
      var hangs = squareDefendedByEnemy(game, m.toAlg) && VAL[m.piece] >= 300;
      game.undo();
      if (!hangs) safe.push(m);
    }
    var pool = (safe.length && rng() > blindness * 0.6) ? safe : any;
    return pool[Math.floor(rng() * pool.length)];
  }
  function squareDefendedByEnemy(game, alg) {
    var enemy = (game.turn());                 // после хода очередь врага
    return game.isAttackedBy(enemy, alg);
  }

  return { pick: pick, evaluate: evaluate, VAL: VAL };
})();
