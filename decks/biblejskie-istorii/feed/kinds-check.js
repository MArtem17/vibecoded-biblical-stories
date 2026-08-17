/* kind:"check" — плагин колоды вместо ядра, чтобы помнить верный ответ
   и при повторном заходе показывать «Уже отвечено · свайп ↑ дальше». */
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

  K.check = {
    interactive: true,
    noswipe: ".opt,.opts",
    build: function (el, card, api) {
      el._quizLock = true;
      var interact = card.interact || {};
      var opts = (interact.options || []).map(function (o) {
        return { t: L(o.t), ok: !!o.ok };
      });
      var saved = Q() ? Q().meta(card.id) : null;
      if (saved && saved.opts && saved.opts.length) {
        opts = saved.opts;
      } else {
        if (api.hard && card.concept && opts.length > 3) {
          var maxN = api.hard(card) ? 6 : 3;
          if (opts.length > maxN) {
            var okO = [], wrO = [];
            opts.forEach(function (o) { (o.ok ? okO : wrO).push(o); });
            opts = okO.concat(api.shuffle(wrO).slice(0, Math.max(1, maxN - okO.length)));
          }
        }
        opts = api.shuffle(opts);
      }
      if (card.img) {
        el.classList.add("hasbg");
        var bg = api.div("qbg");
        bg.style.backgroundImage = "url('" + card.img + "')";
        el.appendChild(bg);
        el.appendChild(api.div("qbgfade"));
      }
      var qwrap = api.div("qwrap");
      qwrap.innerHTML = (!card.img
          ? '<div class="qemoji">' + (card.icon ? api.em(card.icon, null) : (card.emoji || "❓")) + "</div>"
          : "") +
        '<div class="qh">' + api.esc(L(card.title)) + "</div>" +
        '<div class="q">' + api.esc(L((card.lines && card.lines[0]) || "")) + "</div>";
      var ob = api.div("opts");
      var done = quizOk(card);
      function lockOpts() {
        [].forEach.call(ob.children, function (c) { c.style.pointerEvents = "none"; });
      }
      function paintOk() {
        [].forEach.call(ob.children, function (c, i) {
          if (opts[i] && opts[i].ok) c.classList.add("ok");
        });
      }
      function addExplain(ok) {
        if (qwrap.querySelector(".explain")) return;
        var ex = api.div("explain");
        ex.innerHTML = "<b>" + (ok ? "✓" : "") + "</b> " + api.esc(L(interact.explain));
        qwrap.appendChild(ex);
      }
      function pick(o, b) {
        if (el._answered) return;
        el._answered = true;
        lockOpts();
        b.classList.add(o.ok ? "ok" : "no");
        if (!o.ok) paintOk();
        if (card.concept) api.mUpd(card.concept, o.ok ? "correct" : "incorrect");
        if (o.ok) {
          api.addStar(b);
          quizMark(card, { opts: opts });
        }
        addExplain(o.ok);
        setTimeout(function () { api.go(1); }, o.ok ? 700 : 1100);
      }
      opts.forEach(function (o) {
        var b = document.createElement("button");
        b.className = "opt";
        b.textContent = o.t;
        if (!done) b.onclick = function () { pick(o, b); };
        ob.appendChild(b);
      });
      qwrap.appendChild(ob);
      if (done) {
        el._answered = true;
        lockOpts();
        paintOk();
        addExplain(true);
        qwrap.appendChild(Q().hint(api));
      }
      el.appendChild(qwrap);
    }
  };
})();
