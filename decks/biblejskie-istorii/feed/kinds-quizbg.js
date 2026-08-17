/* Фон-иллюстрации для order/count/catch — как в biblejskie-istorii.
   Ядро boriscards эти типы рисует без card.img / item.img. */
(function () {
  "use strict";
  var K = (window.FEED_KINDS = window.FEED_KINDS || {});

  function txt(v) {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (window.BibleI18n) return BibleI18n.L(v);
    return v.ru || v.en || "";
  }
  function Q() { return window.BibleQuizDone; }
  function quizOk(card) { return !!(Q() && card && card.id && Q().ok(card.id)); }
  function quizMark(card, meta) { if (Q() && card && card.id) Q().mark(card.id, meta); }
  function attachBg(el, card, api) {
    if (!card.img) return false;
    el.classList.add("hasbg");
    var bg = api.div("qbg");
    bg.style.backgroundImage = "url('" + card.img + "')";
    el.appendChild(bg);
    el.appendChild(api.div("qbgfade"));
    return true;
  }

  K.order = {
    interactive: true,
    noswipe: ".otile,.olist",
    build: function (el, card, api) {
      el._quizLock = true;
      var done = quizOk(card);
      var items = (card.items || []).map(function (it, i) {
        return { t: txt(it.t), n: i };
      });
      var next = 0, miss = 0;
      attachBg(el, card, api);
      var wrap = card.img ? api.div("qwrap") : null;
      var host = wrap || el;
      var top = api.div("mtop");
      top.innerHTML = '<div class="mt">' + api.esc(txt(card.title) || api.T("orderTitle", "По порядку")) + "</div>" +
        '<div class="ms">' + api.esc(txt(card.text) || "Нажимай по порядку: что было сначала, что потом") + "</div>";
      var listEl = api.div("olist");
      host.appendChild(top);
      host.appendChild(listEl);
      if (wrap) el.appendChild(wrap);
      var mixed = done ? items.slice() : api.shuffle(items.slice());
      if (!done && items.length > 2) {
        var tries = 0;
        while (tries++ < 5 && mixed.every(function (it, i) { return it.n === i; })) mixed = api.shuffle(items.slice());
      }
      mixed.forEach(function (it) {
        var b = document.createElement("button");
        b.className = "otile";
        b.innerHTML = '<span class="onum"></span><span class="otxt">' + api.esc(it.t) + "</span>";
        if (done) {
          b._done = 1;
          b.classList.add("odone");
          b.querySelector(".onum").textContent = String(it.n + 1);
        } else {
          b.onclick = function (ev) {
            ev.stopPropagation();
            if (b._done || next >= items.length) return;
            if (it.n === next) {
              b._done = 1;
              b.classList.add("odone");
              b.querySelector(".onum").textContent = String(next + 1);
              next++;
              if (next >= items.length) {
                if (card.concept) api.mUpd(card.concept, miss ? "incorrect" : "correct");
                if (!miss) api.addStar();
                quizMark(card, {});
                var dn = api.div("mdone");
                dn.textContent = txt(card.done) || "Всё по порядку!";
                dn.style.position = "static";
                dn.style.margin = "14px auto 0";
                dn.style.transform = "none";
                host.appendChild(dn);
                el._answered = true;
                setTimeout(function () { api.go(1); }, 1600);
              }
            } else {
              miss++;
              b.classList.add("oshake");
              setTimeout(function () { b.classList.remove("oshake"); }, 380);
            }
          };
        }
        listEl.appendChild(b);
      });
      if (done) {
        el._answered = true;
        host.appendChild(Q().hint(api));
      }
    }
  };

  K.count = {
    interactive: true,
    noswipe: ".ctile,.cgrid",
    build: function (el, card, api) {
      el._quizLock = true;
      var done = quizOk(card);
      var steps = card.days || card.steps || null;
      var n = steps && steps.length ? steps.length : (card.n || 3);
      var emoji = card.emoji || "⭐";
      var got = 0;
      var ordered = !!(card.ordered && steps && steps.length);
      var WORDS = ["", "Один!", "Два!", "Три!", "Четыре!", "Пять!", "Шесть!", "Семь!", "Восемь!", "Девять!", "Десять!"];
      attachBg(el, card, api);
      var wrap = card.img ? api.div("qwrap") : null;
      var host = wrap || el;
      var top = api.div("mtop");
      top.innerHTML = '<div class="mt">' + api.esc(txt(card.title) || "Сосчитай") + "</div>";
      var cnt = api.div("ms");
      cnt.textContent = txt(card.ask) || "Сколько их?";
      top.appendChild(cnt);
      var grid = api.div("cgrid");
      if (steps) grid.classList.add("cgrid-days");
      var order = [];
      for (var i = 0; i < n; i++) order.push(i);
      if (ordered && !done) order = api.shuffle(order.slice());
      var expect = 0;
      order.forEach(function (idx) {
        var st = steps ? steps[idx] : null;
        var t = api.div("ctile");
        if (st) {
          t.classList.add("cday");
          var lab = txt(st.t || st.label || st.name);
          t.innerHTML = '<span class="femo cti">' + api.esc(st.emoji || emoji) + "</span>" +
            (lab ? '<span class="cdaylab">' + api.esc(lab) + "</span>" : "");
        } else if (card.icon) {
          t.innerHTML = api.em(card.icon, null, "cti");
        } else t.textContent = emoji;
        if (done) {
          t._done = 1;
          t.classList.add("counted");
        } else {
          t.addEventListener("click", function (ev) {
            ev.stopPropagation();
            if (t._done) return;
            if (ordered && idx !== expect) {
              t.classList.add("cshake");
              setTimeout(function () { t.classList.remove("cshake"); }, 380);
              return;
            }
            t._done = 1;
            t.classList.add("counted");
            got++;
            if (ordered) expect++;
            var lab2 = st ? txt(st.t || st.label || st.name) : "";
            cnt.textContent = lab2 || WORDS[got] || (got + "!");
            if (got >= n) {
              var dn = api.div("mdone");
              dn.textContent = txt(card.done) || ("Всего " + n + "! Молодец!");
              dn.style.position = "static";
              dn.style.margin = "14px auto 0";
              dn.style.transform = "none";
              host.appendChild(dn);
              el._answered = true;
              quizMark(card, {});
              api.addStar();
              setTimeout(function () { api.go(1); }, 1500);
            }
          });
        }
        grid.appendChild(t);
      });
      host.appendChild(top);
      host.appendChild(grid);
      if (done) {
        el._answered = true;
        got = n;
        cnt.textContent = txt(card.done) || WORDS[n] || (n + "!");
        host.appendChild(Q().hint(api));
      }
      if (wrap) el.appendChild(wrap);
    }
  };

  K.catch = {
    interactive: true,
    noswipe: ".cfield:not(.ready),.cattile",
    build: function (el, card, api) {
      function item(x) {
        if (typeof x === "string") return { t: x, img: null };
        return { t: txt(x.t || x.name), img: x.img || x.icon || null };
      }
      el.classList.add("catchcard");
      el._quizLock = true;
      var done = quizOk(card);
      var good = (card.good || []).map(item);
      var bad = (card.bad || []).map(item);
      var need = good.length || card.need || 3;
      var got = 0;
      attachBg(el, card, api);
      var top = api.div("mtop");
      top.innerHTML = '<div class="mt">' + api.esc(txt(card.title) || "Лови!") + "</div>";
      var sub = api.div("ms");
      sub.textContent = txt(card.ask) || "Лови только нужное";
      top.appendChild(sub);
      var field = api.div("cfield");
      if (card.img) { el.appendChild(field); el.appendChild(top); }
      else { el.appendChild(top); el.appendChild(field); }

      function slots(n) {
        var cols = n <= 4 ? 2 : (n <= 9 ? 3 : 4);
        var rows = Math.max(1, Math.ceil(n / cols));
        var left0 = 10, right0 = 90, top0 = card.img ? 28 : 12, bot0 = card.img ? 86 : 82;
        var out = [], i = 0, r, c, inRow, cellW, cellH;
        for (r = 0; r < rows; r++) {
          inRow = Math.min(cols, n - i);
          cellW = (right0 - left0) / inRow;
          cellH = (bot0 - top0) / rows;
          for (c = 0; c < inRow; c++, i++) {
            out.push({
              x: left0 + (c + 0.5) * cellW + (Math.random() - 0.5) * cellW * 0.28,
              y: top0 + (r + 0.5) * cellH + (Math.random() - 0.5) * cellH * 0.28
            });
          }
        }
        return api.shuffle(out);
      }

      var all = [];
      good.forEach(function (g) { all.push({ t: g.t, img: g.img, g: true }); });
      bad.forEach(function (b) { all.push({ t: b.t, img: b.img, g: false }); });
      var pos = slots(all.length);
      api.shuffle(all).forEach(function (o, i) {
        var tile = api.div("cattile" + (o.img ? " hasimg" : ""));
        var slot = pos[i] || { x: 50, y: 50 };
        if (o.img) {
          tile.innerHTML = '<img src="' + o.img + '" alt=""><span class="clbl">' + api.esc(o.t) + "</span>";
        } else {
          tile.innerHTML = "<span>" + api.esc(o.t) + "</span>";
        }
        tile.style.left = slot.x + "%";
        tile.style.top = slot.y + "%";
        if (done) {
          if (o.g) {
            tile._done = 1;
            tile.classList.add("ok", "caught");
            got++;
          }
        } else {
          tile.onclick = function (e) {
            e.stopPropagation();
            if (tile._done || el._answered) return;
            if (o.g) {
              tile._done = 1;
              tile.classList.add("ok", "caught");
              got++;
              sub.textContent = "Поймано: " + got + " / " + need;
              if (got >= need) {
                el._answered = true;
                field.classList.add("ready");
                api.addStar();
                if (card.concept) api.mUpd(card.concept, "correct");
                quizMark(card, {});
                var dn = api.div("mdone");
                dn.textContent = txt(card.done) || "Молодец! Всё поймал!";
                el.appendChild(dn);
                setTimeout(function () { api.go(1); }, 1500);
              }
            } else {
              tile.classList.add("no", "shk");
            }
          };
        }
        field.appendChild(tile);
      });
      if (done) {
        el._answered = true;
        field.classList.add("ready");
        sub.textContent = "Поймано: " + need + " / " + need;
        el.appendChild(Q().hint(api));
      }
    }
  };
})();
