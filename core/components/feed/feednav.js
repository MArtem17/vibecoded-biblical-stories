/* Позиция в ленте: чтение, сохранение, шаг вперёд-назад, шапка со счётчиком.
 *
 * Четвёртая вынесенная деталь после goto, stats и gate — и первая, которая
 * трогает ДАННЫЕ ПРОГРЕССА, а не разметку. У «Изобретариума» и «Мирового
 * искусства» этот код совпадал дословно, различаясь одним лишь ключом
 * хранения.
 *
 * ⚠️ Формат в localStorage менять НЕЛЬЗЯ: ключ прежний у каждой колоды
 * (inv_feed_pos / mi_feed_pos), значение — по-прежнему просто число строкой.
 * Сменить формат значит открыть приложение ребёнку не на той карточке, где
 * он остановился, и молча: ошибки в консоли при этом не будет. Проверку на
 * это держит tools/node/check_shell.js — «позиция пережила перезагрузку».
 *
 * Рисование карточки НЕ переезжает: это содержание колоды. Модуль знает
 * только «где мы» и «сколько всего».
 *
 *   var NAV = FEEDNAV.init({key:"inv_feed_pos", length:FEED.length,
 *                           onChange:renderFeed});
 *   NAV.next(); NAV.prev(); NAV.go(42); NAV.pos();
 *   NAV.head({fill:$("fpFill"), counter:$("fCardN")});
 */
(function (w) {
  "use strict";

  function init(cfg) {
    var key = cfg.key, len = cfg.length | 0, onChange = cfg.onChange;
    var pos = 0;
    try {
      var v = +localStorage.getItem(key) || 0;
      /* зажим в границы обязателен: колода растёт, а сохранённая позиция
         остаётся от прежней длины — у «Изобретариума» набор вырос с 60 до 68 */
      pos = (v >= 0 && v < len) ? v : 0;
    } catch (e) { pos = 0; }

    function save() { try { localStorage.setItem(key, String(pos)); } catch (e) {} }

    function go(i, silent) {
      i = i | 0;
      if (i < 0 || i >= len || i === pos) return false;
      pos = i; save();
      if (!silent && onChange) onChange(pos);
      return true;
    }

    return {
      pos: function () { return pos; },
      len: function () { return len; },
      atStart: function () { return pos === 0; },
      atEnd: function () { return pos >= len - 1; },
      go: go,
      next: function () { return go(pos + 1); },
      prev: function () { return go(pos - 1); },
      save: save,
      /* Шапка ленты: полоса заполнения и «N / M». Держим здесь, потому что
         обе величины считаются из позиции, и разъехаться они не должны. */
      head: function (els) {
        if (els.fill) els.fill.style.width =
          (len > 1 ? Math.round(pos / (len - 1) * 100) : 100) + "%";
        if (els.counter) els.counter.textContent = (pos + 1) + " / " + len;
      }
    };
  }

  w.FEEDNAV = { init: init };
})(window);
