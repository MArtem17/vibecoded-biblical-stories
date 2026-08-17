/* Родительская сводка: итоговые строки и разбивка по разделам с полосой.
 *
 * Вынесено вторым после core/components/goto по тому же признаку: у
 * «Изобретариума» и «Мирового искусства» эти два блока совпадали ДОСЛОВНО,
 * различаясь только способом дать значок раздела (эмодзи против картинки).
 * Всё, что у колод своё — шкалы BKT у искусства, кредиты фотографий у
 * изобретений, — осталось в колодах: модуль отдаёт куски разметки, а колода
 * решает, что и в каком порядке из них сложить.
 *
 * Классы разметки НЕ переезжают: .set-b / .st-line / .st-sub / .st-bar
 * остаются в стилях колод. Так у каждой сохраняется своя палитра, а модуль
 * не тащит за собой лишний css-файл.
 *
 *   $("pgStats").innerHTML =
 *     STATS.summary([{label:T("st_prog"), value:done+" / "+all}, …]) +
 *     STATS.bars(T("st_byep"), EPS.map(function(e){
 *       return {icon:e.ico, label:e.name, pct:epProg(e.id), color:e.col};
 *     })) + сюда своё;
 */
(function (w) {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* Тот же приём, что в components/goto: значок бывает эмодзи, бывает
     картинкой, и различаем по расширению, а не по началу строки — на этом
     уже обожглись, относительный путь img/ep_pre.webp вылезал текстом. */
  var IMG = /\.(webp|png|jpe?g|svg|gif|avif)(\?|#|$)/i;
  function icoHTML(ico) {
    if (!ico) return "";
    return (IMG.test(ico) || /^data:image\//i.test(ico))
      ? '<img src="' + esc(ico) + '" alt="" style="width:16px;height:16px;' +
        'object-fit:contain;vertical-align:-2px">'
      : esc(ico);
  }

  /* Итоговые строки: «Освоено 12 / 68», «★ 40 / 340», «Время 1 ч 12 мин».
     value отдаём как есть — колода уже привела его к нужному виду. */
  function summary(rows) {
    var h = '<div class="set-b">';
    for (var i = 0; i < (rows || []).length; i++) {
      h += '<div class="st-line"><span>' + esc(rows[i].label) + "</span><b>" +
        esc(rows[i].value) + "</b></div>";
    }
    return h + "</div>";
  }

  /* Разбивка по разделам: строка «значок · название · процент» и полоса под ней. */
  function bars(title, rows) {
    var h = '<div class="set-b">';
    if (title) h += '<div class="st-sub">' + esc(title) + "</div>";
    for (var i = 0; i < (rows || []).length; i++) {
      var r = rows[i], p = Math.max(0, Math.min(100, r.pct | 0));
      h += '<div class="st-line st-cont"><span>' + icoHTML(r.icon) + " " +
        esc(r.label) + "</span><b>" + p + "%</b></div>" +
        '<div class="st-bar"><i style="width:' + p + "%" +
        (r.color ? ";background:" + esc(r.color) : "") + '"></i></div>';
    }
    return h + "</div>";
  }

  w.STATS = { summary: summary, bars: bars };
})(window);
