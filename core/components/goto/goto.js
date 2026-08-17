/* «Перейти к разделу» — общий для колод список разделов с раскрытием.
 *
 * Зачем в core: родитель говорит ребёнку «начинаем с Африки» (или «с эпохи
 * пара», или «с блока про цвет») — и тот нажимает раздел, а изучение стартует
 * оттуда. Механика одна на все колоды, меняется только содержание: части
 * света · эпохи · блоки. Первой её сделала «Кругосветка», здесь она вынута,
 * чтобы соседние колоды не форкали тридцать пять строк каждая.
 *
 * Модуль НЕ знает ни про ленту, ни про прогресс, ни про то, что такое
 * «страна». Колода отдаёт три вещи и больше ничего:
 *   sections  — [{id, title, icon, count}]
 *   items(id) — [{id, title, thumb}] элементы раздела
 *   onSection / onItem — куда прыгать; переход целиком на стороне колоды
 *
 * ES5, без сборки. Стили — goto.css рядом, класс-префикс gt- (не пересекается
 * с колодочными: у «Кругосветки» свои .goc/.gocty, и трогать их не пришлось).
 *
 *   GOTO.render(document.getElementById("pgGo"), {
 *     hint: "Начни сразу с эпохи или изобретения…",
 *     goLabel: "Начать с эпохи",
 *     sections: EPS.map(...), items: function(id){...},
 *     onSection: jumpToEpoch, onItem: jumpToWork
 *   });
 */
(function (w) {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* Иконка раздела бывает эмодзи, а бывает картинкой (у «Кругосветки» это
     нарисованные значки частей света, у «Изобретений» — значки эпох).
     Различаем по виду строки, а не по отдельному флагу в данных: флаг забыли
     бы проставить.

     Узнаём по РАСШИРЕНИЮ, а не по началу строки: первая версия проверяла
     «начинается с / или .» и не узнала обычный относительный путь
     img/ep_pre.webp — значок вылез на экран строчкой текста. */
  var IMG = /\.(webp|png|jpe?g|svg|gif|avif)(\?|#|$)/i;
  function icoHTML(ico) {
    if (!ico) return "";
    return (IMG.test(ico) || /^data:image\//i.test(ico))
      ? '<img class="gt-ico" src="' + esc(ico) + '" alt="">'
      : '<span class="gt-emo">' + esc(ico) + "</span>";
  }

  function itemHTML(it) {
    return '<button class="gt-item" data-id="' + esc(it.id) + '">' +
      (it.thumb ? '<img src="' + esc(it.thumb) + '" alt="">' : "") +
      "<span>" + esc(it.title) + "</span></button>";
  }

  function render(el, cfg) {
    if (!el || !cfg || !cfg.sections) return;
    var h = cfg.hint ? '<p class="gt-hint">' + esc(cfg.hint) + "</p>" : "";

    for (var i = 0; i < cfg.sections.length; i++) {
      var s = cfg.sections[i];
      if (s.count === 0) continue;      /* пустой раздел не показываем */
      h += '<div class="gt-sec"><button class="gt-head" data-sec="' + esc(s.id) + '">' +
        icoHTML(s.icon) + "<b>" + esc(s.title) + "</b>" +
        (s.count != null ? '<span class="gt-n">' + s.count + "</span>" : "") +
        '<i class="gt-chev">&#9656;</i></button>' +
        '<div class="gt-list" hidden data-for="' + esc(s.id) + '"></div></div>';
    }
    el.innerHTML = h;

    /* Списки элементов рисуем ЛЕНИВО, при первом раскрытии: у «Кругосветки»
       это сто стран с флагами-картинками, и рисовать все шесть списков сразу
       значит показать родителю пустой экран на пару секунд. */
    el.onclick = function (ev) {
      var t = ev.target;
      if (!t || !t.closest) return;

      var head = t.closest(".gt-head");
      if (head) {
        var box = head.nextElementSibling;
        if (box.hidden && !box.getAttribute("data-done")) {
          var id = head.getAttribute("data-sec");
          var list = (cfg.items && cfg.items(id)) || [];
          box.innerHTML =
            '<button class="gt-go" data-sec="' + esc(id) + '">&#9654; ' +
            esc(cfg.goLabel || "") + "</button>" +
            list.map(itemHTML).join("");
          box.setAttribute("data-done", "1");
        }
        box.hidden = !box.hidden;
        head.classList.toggle("open", !box.hidden);
        return;
      }

      var go = t.closest(".gt-go");
      if (go) { if (cfg.onSection) cfg.onSection(go.getAttribute("data-sec")); return; }

      var it = t.closest(".gt-item");
      if (it) { if (cfg.onItem) cfg.onItem(it.getAttribute("data-id")); }
    };
  }

  w.GOTO = { render: render };
})(window);
