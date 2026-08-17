/* Механика kind:"colors" (цвета радуги) — плагин FEED_KINDS.
   В платформенном feed.js её нет; ядро не форкаем. */
(function () {
  "use strict";
  var K = (window.FEED_KINDS = window.FEED_KINDS || {});

  function L(v) {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (window.BibleI18n && BibleI18n.L) return BibleI18n.L(v);
    var lang = "ru";
    try { lang = localStorage.getItem("bibi_lang") || "ru"; } catch (e) {}
    return v[lang] || v.ru || v.en || "";
  }
  function css() {
    if (document.getElementById("bibleColorsCSS")) return;
    var s = document.createElement("style");
    s.id = "bibleColorsCSS";
    s.textContent =
      ".colgrid{display:grid;grid-template-columns:repeat(5,auto);justify-content:center;align-content:center;gap:10px;padding:8px 4px 0}" +
      ".coltile{width:52px;height:52px;border-radius:14px;border:3px solid #ffffffcc;" +
      "box-shadow:0 3px 10px rgba(0,0,0,.16);cursor:pointer;position:relative;" +
      "transition:transform .12s, box-shadow .12s, border-color .12s}" +
      ".coltile:active{transform:scale(.92)}" +
      ".coltile.on{border-color:#5a3d00;box-shadow:0 0 0 3px #ffd34e,0 4px 12px rgba(0,0,0,.2);transform:scale(1.06)}" +
      ".coltile.on::after{content:\"\";position:absolute;right:3px;bottom:3px;width:14px;height:14px;border-radius:50%;" +
      "background:#ffd34e;box-shadow:0 1px 3px rgba(0,0,0,.25)}" +
      ".coltile.ok{border-color:#2e9b4f;box-shadow:0 0 0 3px #2e9b4f,0 4px 12px rgba(0,0,0,.18)}" +
      ".coltile.no{border-color:#ff3b2f;box-shadow:0 0 0 3px #ff3b2f,0 4px 12px rgba(0,0,0,.18)}" +
      ".coltile.miss{border-color:#2e9b4f;box-shadow:0 0 0 2px #2e9b4f88;opacity:.92}" +
      ".card.colors.hasbg .colgrid{padding:4px 0 0;gap:10px}" +
      ".card.colors.hasbg .coltile{width:48px;height:48px;border-radius:12px}";
    document.head.appendChild(s);
  }

  K.colors = {
    interactive: true,
    noswipe: ".colgrid,.coltile",
    build: function (el, card, api) {
      css();
      el._quizLock = true;
      var need = card.need || 7;
      var Qd = window.BibleQuizDone;
      var colorsDone = !!(Qd && card.id && Qd.ok(card.id)) || api.learned(card.id);
      var items = (card.colors || []).map(function (it) {
        return { c: it.c || it.color || "#ccc", ok: !!it.ok, name: it.name || "" };
      });
      if (!items.length) {
        items = [
          { c: "#e53935", ok: true, name: { ru: "красный" } },
          { c: "#fb8c00", ok: true, name: { ru: "оранжевый" } },
          { c: "#fdd835", ok: true, name: { ru: "жёлтый" } },
          { c: "#43a047", ok: true, name: { ru: "зелёный" } },
          { c: "#4fc3f7", ok: true, name: { ru: "голубой" } },
          { c: "#1e88e5", ok: true, name: { ru: "синий" } },
          { c: "#8e24aa", ok: true, name: { ru: "фиолетовый" } },
          { c: "#795548", ok: false, name: { ru: "коричневый" } },
          { c: "#ec407a", ok: false, name: { ru: "розовый" } },
          { c: "#9e9e9e", ok: false, name: { ru: "серый" } }
        ];
      }
      items = colorsDone ? items : api.shuffle(items.slice());
      if (card.img) {
        el.classList.add("hasbg");
        var bg = api.div("qbg");
        bg.style.backgroundImage = "url('" + card.img + "')";
        el.appendChild(bg);
        el.appendChild(api.div("qbgfade"));
      }
      var wrap = card.img ? api.div("qwrap") : null;
      var host = wrap || el;
      var top = api.div("mtop");
      top.innerHTML = "<div class=\"mt\">" + api.esc(L(card.title) || L({ ru: "Цвета радуги", en: "Rainbow colors" })) + "</div>";
      var cnt = api.div("ms");
      top.appendChild(cnt);
      var grid = api.div("colgrid");
      var selected = [];
      var tiles = [];
      var checking = false;
      var miss = 0;
      function selN() { return selected.length; }
      function setAsk() {
        var base = L(card.ask) || (L({ ru: "Выбери", en: "Pick" }) + " " + need + " " + L({ ru: "цветов радуги", en: "rainbow colors" }));
        cnt.textContent = base + " · " + api.T("colorsCnt", { ru: "Выбрано", en: "Selected" }) + " " + selN() + "/" + need;
      }
      function resetPick() {
        checking = false;
        selected = [];
        tiles.forEach(function (t) {
          t._sel = 0;
          t.classList.remove("on", "ok", "no", "miss");
        });
        setAsk();
      }
      function finishOk() {
        el._answered = true;
        tiles.forEach(function (t) {
          t.style.pointerEvents = "none";
          if (t._item.ok) t.classList.add("ok");
          else if (t._sel) t.classList.add("no");
        });
        if (card.concept) api.mUpd(card.concept, miss ? "incorrect" : "correct");
        if (!miss) api.addStar();
        if (card.id) api.mark(card.id);
        if (Qd && card.id) Qd.mark(card.id, {});
        var dn = api.div("mdone");
        dn.style.position = "static";
        dn.style.margin = "14px auto 0";
        dn.textContent = L(card.done) || L({ ru: "Семь цветов!", en: "Seven colors!" });
        host.appendChild(dn);
        setTimeout(function () { api.go(1); }, 900);
      }
      function check() {
        if (el._answered || checking) return;
        checking = true;
        var allOk = selected.length === need && selected.every(function (it) { return it.ok; });
        selected.forEach(function (it) {
          var t = null, i;
          for (i = 0; i < tiles.length; i++) if (tiles[i]._item === it) { t = tiles[i]; break; }
          if (t) t.classList.add(it.ok ? "ok" : "no");
        });
        if (allOk) { finishOk(); return; }
        miss++;
        tiles.forEach(function (t) {
          if (t._item.ok && !t._sel) t.classList.add("miss");
        });
        cnt.textContent = api.T("colorsRetry", { ru: "Попробуй ещё — только цвета радуги", en: "Try again — only rainbow colors" });
        setTimeout(function () { if (!el._answered) resetPick(); }, 1100);
      }
      items.forEach(function (it) {
        var t = api.div("coltile");
        t.style.backgroundColor = it.c;
        if (it.name) t.setAttribute("aria-label", L(it.name));
        t.setAttribute("role", "button");
        t._item = it;
        if (colorsDone) {
          t.style.pointerEvents = "none";
          if (it.ok) { t._sel = 1; t.classList.add("on", "ok"); }
        } else {
          t.addEventListener("click", function (ev) {
            ev.stopPropagation();
            if (el._answered || checking) return;
            if (t._sel) {
              t._sel = 0; t.classList.remove("on");
              selected = selected.filter(function (x) { return x !== it; });
              setAsk();
              return;
            }
            if (selN() >= need) return;
            t._sel = 1; t.classList.add("on");
            selected.push(it);
            setAsk();
            if (selN() >= need) check();
          });
        }
        tiles.push(t);
        grid.appendChild(t);
      });
      if (colorsDone) {
        el._answered = true;
        cnt.textContent = (L(card.ask) || "") + " · " + need + "/" + need;
      } else setAsk();
      if (wrap) { wrap.appendChild(top); wrap.appendChild(grid); el.appendChild(wrap); }
      else { el.appendChild(top); el.appendChild(grid); }
      if (colorsDone && Qd) host.appendChild(Qd.hint(api));
    }
  };
})();
