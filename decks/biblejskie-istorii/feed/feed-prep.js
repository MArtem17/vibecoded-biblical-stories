/* Колода: подготовка ленты до feed.js. Ядро не трогаем. */
(function () {
  "use strict";
  var CHECK = {
    ru: "Проверка", en: "Quiz", de: "Check", es: "Prueba",
    pt: "Verificação", fr: "Quiz", ar: "اختبار"
  };
  var TF = {
    ru: "Правда или нет?", en: "True or false?", de: "Wahr oder falsch?",
    es: "¿Verdadero o falso?", pt: "Verdadeiro ou falso?", fr: "Vrai ou faux ?",
    ar: "صحيح أم خطأ؟"
  };

  function prep(cards) {
    (cards || []).forEach(function (c) {
      if (!c) return;
      if (c.kind === "check") c.title = CHECK;
      if (c.kind === "tf" && !c.title) c.title = TF;
      (c.spots || []).forEach(function (sp) {
        if (sp) delete sp.icon;
      });
    });
  }

  if (window.FEED_OPENING) prep(FEED_OPENING.cards);
  (window.FEED_CHAPTERS || []).forEach(function (ch) {
    if (ch) prep(ch.cards);
  });

  var STAR_KINDS = {
    check: 1, match: 1, find: 1, count: 1, colors: 1, order: 1,
    scene: 1, tf: 1, gone: 1, catch: 1, lant: 1, veil: 1, beforeafter: 1
  };
  function starCount(cards) {
    var tot = 0;
    (cards || []).forEach(function (c) {
      var k, spots, it, n;
      if (!c) return;
      k = c.kind;
      if (STAR_KINDS[k]) { tot++; return; }
      n = 0;
      if (c.veil) n++;
      spots = c.spots;
      if (!spots && (it = c.interact) && (it.type === "poke" || it.type === "reveal")) spots = [it];
      if (spots && spots.length > 1) n++;
      tot += n;
    });
    return tot;
  }
  var starGoal = 0;
  if (window.FEED_OPENING) starGoal += starCount(FEED_OPENING.cards);
  (window.FEED_CHAPTERS || []).forEach(function (ch) {
    if (ch) starGoal += starCount(ch.cards);
  });

  var p = window.FEED_PROGRAM;
  if (p && !p.langKey) p.langKey = "bibi_lang";
  if (p && !p.starGoal && starGoal) p.starGoal = starGoal;
})();
