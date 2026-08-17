/* Один номер сборки на весь сайт — внизу каждой страницы.

   Зачем один, а не версия у каждой колоды. Выкладываем мы всё разом,
   значит у методиста вопрос ровно один: «у меня обновилось или я смотрю
   старое?». Номер колоды на него не отвечает — их 57, они разъехались
   (у «Фонетики» 1.0.0, у «Слогов» 0.9.0) и не менялись ни разу за всю
   работу. Сквозной номер отвечает: назвал его в письме — и сразу видно,
   ту ли версию слушают.

   Номер = число коммитов: растёт сам, вести руками не надо. Пишет его
   деплой в version.json (tools/deploy.sh).

   Файл лежит в корне сайта, а страницы на разной глубине, поэтому
   пробуем несколько путей. Не нашли (открыли локально) — молчим. */
(function () {
  var PATHS = ['version.json', '../version.json', '../../version.json',
               '../../../version.json'];
  var el = document.createElement('div');
  el.style.cssText = 'text-align:center;font:12px/1.6 system-ui,sans-serif;' +
    'color:#8a8a8a;padding:16px 12px 24px';

  function show(v) {
    if (!document.body) { return; }
    /* Часть колод держит body{display:flex} для центровки одного
       .app-контейнера (SNS, «Музеи Москвы», «Подводный мир» и другие —
       найдено 08.08.2026 по жалобе владельца «показывается в части экрана
       со скроллингом»). Второй ребёнок body превращает такую страницу в
       flex-ряд из двух колонок: приложение сжимается в узкую полосу,
       строка версии втискивается рядом с шапкой. Тем же ломает и
       display:grid. Единственный способ не задевать вёрстку 66 разных
       колод — увести строку версии из потока полностью, когда body сама
       не блочная; на обычных страницах поведение не меняется. */
    var bd = window.getComputedStyle ? window.getComputedStyle(document.body).display : '';
    if (bd === 'flex' || bd === 'inline-flex' || bd === 'grid' || bd === 'inline-grid') {
      el.style.cssText += ';position:fixed;left:0;right:0;bottom:0;background:#fff';
    }
    document.body.appendChild(el);
    var d = (v.date || '').slice(0, 10);
    el.textContent = 'версия ' + (v.build || '?') + (d ? ' · ' + d : '');
    el.title = (v.commit || '') + ' · ' + (v.subject || '');
  }

  function tryAt(i) {
    if (i >= PATHS.length) { return; }
    var r = new XMLHttpRequest();
    r.open('GET', PATHS[i] + '?' + (new Date()).getTime(), true);
    r.onreadystatechange = function () {
      if (r.readyState !== 4) { return; }
      if (r.status === 200) {
        try { show(JSON.parse(r.responseText)); return; } catch (e) { /* битый */ }
      }
      tryAt(i + 1);
    };
    try { r.send(); } catch (e) { tryAt(i + 1); }
  }
  tryAt(0);
})();
