/* Пройденные проверки ленты — только колода (ядро не трогаем).
   Как qdone/qmeta у птиц: верный ответ запоминается по id карточки. */
(function (w) {
  "use strict";
  var NS = "biblejskie-istorii";
  var DK = NS + "_feed_qdone";
  var MK = NS + "_feed_qmeta";

  function load(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { return {}; }
  }
  function save(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) {}
  }
  function alreadyText() {
    if (w.BibleI18n && BibleI18n.JT) return BibleI18n.JT("alreadyDone");
    return "Уже отвечено · свайп ↑ дальше";
  }

  w.BibleQuizDone = {
    ok: function (id) {
      if (!id) return false;
      return load(DK)[id] === 1;
    },
    meta: function (id) {
      if (!id) return null;
      return load(MK)[id] || null;
    },
    mark: function (id, meta) {
      if (!id) return;
      var d = load(DK); d[id] = 1; save(DK, d);
      if (meta) {
        var m = load(MK); m[id] = meta; save(MK, m);
      }
    },
    hint: function (api) {
      var p = api.div("q-done");
      p.textContent = alreadyText();
      return p;
    }
  };
})(window);
