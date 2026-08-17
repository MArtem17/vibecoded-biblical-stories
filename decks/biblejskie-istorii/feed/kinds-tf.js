/* kind:"tf" с фоном-иллюстрацией — плагин колоды (ядро не трогаем). */
(function () {
  "use strict";
  var K = (window.FEED_KINDS = window.FEED_KINDS || {});

  function L(v) {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (window.BibleI18n) return BibleI18n.L(v);
    return v.ru || v.en || "";
  }
  function Q() { return window.BibleQuizDone; }
  function quizOk(card) { return !!(Q() && card && card.id && Q().ok(card.id)); }
  function quizMark(card, meta) { if (Q() && card && card.id) Q().mark(card.id, meta); }

  K.tf = {
    interactive: true,
    noswipe: ".tfb,.tfbtns",
    build: function (el, card, api) {
      el.classList.add("tfcard");
      el._quizLock = true;
      var truth = card.truth !== false;
      var concept = card.concept;
      var done = quizOk(card);
      if (card.img) {
        el.classList.add("hasbg");
        var bg = api.div("qbg");
        bg.style.backgroundImage = "url('" + card.img + "')";
        el.appendChild(bg);
        el.appendChild(api.div("qbgfade"));
      }
      var wrap = api.div(card.img ? "qwrap tfwrap" : "tfwrap");
      var ttl = api.div("tft");
      ttl.textContent = L(card.title) || api.T("tfTitle", "Правда или нет?");
      var q = api.div("tfq");
      q.textContent = L(card.statement) || "";
      var btns = api.div("tfbtns");
      var bY = document.createElement("button");
      bY.className = "tfb yes";
      bY.textContent = "✓ " + api.T("tfYes", "Правда");
      var bN = document.createElement("button");
      bN.className = "tfb no";
      bN.textContent = "✕ " + api.T("tfNo", "Неправда");
      function paint(said, correct) {
        bY.disabled = bN.disabled = true;
        bY.style.pointerEvents = bN.style.pointerEvents = "none";
        if (said === true || said === false) (said ? bY : bN).classList.add(correct ? "good" : "bad");
        (truth ? bY : bN).classList.add("good");
        if (!wrap.querySelector(".tfex")) {
          var ex = api.div("tfex");
          ex.textContent = L(card.explain) || (truth ? api.T("tfTrue", "Это правда!") : api.T("tfFalse", "На самом деле — нет."));
          wrap.appendChild(ex);
        }
      }
      function answer(said) {
        if (el._answered) return;
        var correct = said === truth;
        paint(said, correct);
        el._answered = true;
        if (concept) api.mUpd(concept, correct ? "correct" : "incorrect");
        if (correct) {
          api.addStar();
          quizMark(card, { truth: truth });
        }
        setTimeout(function () { api.go(1); }, correct ? 700 : 1100);
      }
      if (!done) {
        bY.onclick = function (e) { e.stopPropagation(); answer(true); };
        bN.onclick = function (e) { e.stopPropagation(); answer(false); };
      }
      btns.appendChild(bY);
      btns.appendChild(bN);
      wrap.appendChild(ttl);
      wrap.appendChild(q);
      wrap.appendChild(btns);
      if (done) {
        el._answered = true;
        paint(truth, true);
        wrap.appendChild(Q().hint(api));
      }
      el.appendChild(wrap);
    }
  };
})();
