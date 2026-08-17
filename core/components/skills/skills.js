/* Навыки: хранение флагов и арифметика по ним. Контракт — docs/product-skills.md.
 *
 * Пятая вынесенная деталь. Выносится ровно то, что документ разрешает:
 * чтение и запись прогресса, начисление навыка с ответом «это новый», сумма
 * по элементу, «освоен ли элемент» по ЕГО планке, сумма по колоде.
 *
 * Чего модуль НЕ делает и делать не должен:
 *   · не знает порогов рангов — решение владельца 04.08.2026: они разные у
 *     всех продуктов и в ядро не переезжают никогда;
 *   · не считает потолок звёзд колоды: у «Мирового искусства» есть свой
 *     источник звёзд сверх навыков (блок-карточки, копилка P.x), и модуль,
 *     знающий только первое слагаемое, тихо обнулил бы половину её прогресса;
 *   · не знает, что такое «страна» или «эпоха» — планку элемента отдаёт
 *     колода функцией cap(id).
 *
 * ⚠️ Формат хранения менять нельзя: ключ <префикс>_prog_v1 у каждой колоды
 * свой, значение {c:{<id>:{s:[0/1,…]}}}. Общий объект P остаётся у колоды —
 * у «Искусства» в нём живёт ещё и своя копилка.
 *
 *   var SK = SKILLS.init({key:LSKEY, cap:function(id){ return capOf(byId[id]); }});
 *   SK.award(id, 2);   // true только когда флаг сменился с нуля
 *   SK.sum(id); SK.mastered(id); SK.total(ids); SK.masteredCount(ids);
 */
(function (w) {
  "use strict";

  function init(cfg) {
    var key = cfg.key, cap = cfg.cap, width = cfg.width || 5;

    function load() {
      try { return JSON.parse(localStorage.getItem(key)) || { c: {} }; }
      catch (e) { return { c: {} }; }
    }
    var P = load();
    if (!P.c) P.c = {};

    function save() { try { localStorage.setItem(key, JSON.stringify(P)); } catch (e) {} }

    function zeros() { var a = [], i; for (i = 0; i < width; i++) a.push(0); return a; }
    function flags(id) { return (P.c[id] && P.c[id].s) || zeros(); }

    /* Возвращает true ТОЛЬКО когда флаг сменился с нуля. По этому ответу
       колода решает, показывать ли анимацию звезды. Второй правильный ответ
       на тот же вопрос звезды не даёт — иначе ребёнок набирает их повторением
       одного вопроса, а не изучением (docs/product-skills.md §2). */
    function award(id, i) {
      if (!P.c[id]) P.c[id] = { s: zeros() };
      if (P.c[id].s[i]) return false;
      P.c[id].s[i] = 1; save(); return true;
    }

    function sum(id) {
      var s = flags(id), n = 0, i;
      for (i = 0; i < width; i++) n += s[i] ? 1 : 0;
      return n;
    }

    /* «Освоен» — от планки ЭТОГО элемента, а не от общей ширины: у
       изобретения без известного автора планка четыре, и сравнение с пятёркой
       объявило бы его вечно незавершённым. */
    function mastered(id) { return sum(id) >= (cap ? cap(id) : width); }

    function total(ids) { var n = 0, i; for (i = 0; i < ids.length; i++) n += sum(ids[i]); return n; }
    function masteredCount(ids) {
      var n = 0, i; for (i = 0; i < ids.length; i++) if (mastered(ids[i])) n++;
      return n;
    }

    return {
      data: function () { return P; },       /* колода хранит в нём и своё */
      save: save,
      reset: function (extra) { P = extra || { c: {} }; if (!P.c) P.c = {}; save(); },
      flags: flags, award: award, sum: sum,
      mastered: mastered, total: total, masteredCount: masteredCount
    };
  }

  w.SKILLS = { init: init };
})(window);
