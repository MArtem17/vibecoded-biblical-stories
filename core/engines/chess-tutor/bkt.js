/* core/engines/chess-tutor/bkt.js
 * Bayesian Knowledge Tracing — адаптив «как в Робоборике» (тех-ТЗ C.6).
 * Оценивает P(L) — вероятность владения навыком. В родительском UI это
 * называется «Уровень знаний». Порог освоения P(L) ≥ 0.82.
 *
 * Параметры (из спецификации):
 *   P(S) — ошибка при владении = 0.10
 *   P(G) — угадать без владения, по типу задания:
 *           распознавание 0.25, применение 0.12, расчёт 0.05
 *   P(T) — переход «не знал → узнал» за попытку (скорость обучения)
 *
 *   BKT.update(pL, correct, kind) -> новый pL
 *   BKT.MASTERY (0.82), BKT.bars(pL) -> 0..5 (для шкалы ▰▰▰▱▱)
 */
var BKT = (function () {
  'use strict';

  var P_SLIP = 0.10;
  var P_GUESS = { recognize: 0.25, apply: 0.12, calc: 0.05 };
  var P_TRANSIT = 0.10;   // было 0.20 — навык «осваивался» за 2 ответа, слишком щедро
  var P_INIT = 0.15;
  var MASTERY = 0.82;

  function guess(kind, nOptions) {
    // Для заданий с вариантами честная вероятность угадать = 1/число вариантов.
    if (nOptions && nOptions > 1) return 1 / nOptions;
    return (P_GUESS[kind] != null) ? P_GUESS[kind] : 0.12;
  }

  // Шаг BKT: сначала апостериор по наблюдению, затем переход обучения.
  function update(pL, correct, kind, nOptions) {
    if (pL == null) pL = P_INIT;
    var g = guess(kind, nOptions), s = P_SLIP;
    var post;
    if (correct) {
      post = (pL * (1 - s)) / (pL * (1 - s) + (1 - pL) * g);
    } else {
      post = (pL * s) / (pL * s + (1 - pL) * (1 - g));
    }
    // Переход обучения — только после верного ответа: иначе P(L) ползёт вверх
    // даже у угадывающего (проверено симуляцией: 98% ложных «освоено» → ~15%).
    var pLnext = correct ? post + (1 - post) * P_TRANSIT : post;
    if (pLnext < 0) pLnext = 0; if (pLnext > 0.999) pLnext = 0.999;
    return pLnext;
  }

  function mastered(pL) { return pL >= MASTERY; }

  // 0..5 закрашенных делений для шкалы ▰▰▰▱▱.
  // Пять делений — ровно «освоено» (согласовано с текстом Помощи).
  function bars(pL) {
    if (pL == null) return 0;
    if (pL >= MASTERY) return 5;
    return Math.max(0, Math.min(4, Math.round(pL * 5)));
  }

  // Текстовый статус для родителя/ребёнка.
  function statusLabel(pL) {
    if (pL == null || pL <= P_INIT + 0.001) return 'не начато';
    if (mastered(pL)) return 'освоено';
    if (pL >= 0.5) return 'почти освоено';
    if (pL >= 0.3) return 'в процессе';
    return 'начато';
  }

  return {
    update: update, mastered: mastered, bars: bars, statusLabel: statusLabel,
    MASTERY: MASTERY, P_INIT: P_INIT,
    guess: guess
  };
})();
