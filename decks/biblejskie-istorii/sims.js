/* Авторские сюжетные игры тома «Библейские истории» — КОНТЕНТ колоды.
   Механика каждой сцены повторяет смысл истории (дни творения, погрузка
   ковчега парами, мера манны, суд Соломона, звезда волхвов и т.д.).
   Движок (core/engines/quest) вызывает фабрику и передаёт K — набор
   помощников: el, esc, T, icoH, fanfare, shuffle, byId, cardImg, lang(), B.
   Контракт — docs/product-quest.md. */
window.QUEST_SIMS_FACTORY = function (K) {
  "use strict";
  var el = K.el, esc = K.esc, T = K.T, icoH = K.icoH, fanfare = K.fanfare,
      shuffle = K.shuffle, byId = K.byId, cardImg = K.cardImg, B = K.B;

  function simCreation(stage, done) {
    stage.appendChild(el("div", "qq", icoH("star") + " " + esc(T("s1Prompt"))));
    var ITEMS = [
      { d: 1, em: "sun", k: "s1d1" }, { d: 2, em: "wave", k: "s1d2" },
      { d: 3, em: "sprout", k: "s1d3" }, { d: 4, em: "sunmoon", k: "s1d4" },
      { d: 5, em: "fish", k: "s1d5" }, { d: 6, em: "lion", k: "s1d6" },
      { d: 7, em: "sleeper", k: "s1d7" }
    ];
    var errs = 0, placed = 0, selChip = null, selItem = null;
    var chipsBox = el("div", "scchips");
    var daysBox = el("div", "scdays");
    var order = shuffle(ITEMS);
    for (var i = 0; i < order.length; i++) (function (it) {
      var ch = el("button", "scchip");
      ch.appendChild(el("span", "em", icoH(it.em, "ico-lg")));
      ch.appendChild(el("span", "nm", esc(T(it.k))));
      ch.setAttribute("data-day", it.d);
      ch.onclick = function () {
        if (ch.disabled) return;
        if (selChip) selChip.classList.remove("sel");
        selChip = ch; selItem = it;
        ch.classList.add("sel");
      };
      chipsBox.appendChild(ch);
    })(order[i]);
    for (var d = 1; d <= 7; d++) (function (day) {
      var sl = el("button", "scday");
      sl.appendChild(el("span", "dn", esc(T("s1Day")) + " " + day));
      sl.appendChild(el("span", "dv", "·"));
      sl.setAttribute("data-day", day);
      sl.onclick = function () {
        if (!selItem || sl.className.indexOf("on") >= 0) return;
        if (selItem.d === day) {
          sl.classList.add("on");
          sl.childNodes[1].innerHTML = icoH(selItem.em, "ico-lg");
          selChip.disabled = true; selChip.classList.remove("sel"); selChip.classList.add("used");
          selChip = null; selItem = null;
          placed++;
          if (placed === 7) setTimeout(function () { done(errs === 0); }, 600);
        } else {
          errs++;
          sl.classList.add("shake");
          setTimeout(function () { sl.classList.remove("shake"); }, 450);
        }
      };
      daysBox.appendChild(sl);
    })(d);
    stage.appendChild(chipsBox);
    stage.appendChild(daysBox);
  }

  /* Погрузка ковчега: заведи животных парами */
  function simArkLoad(stage, done) {
    stage.appendChild(el("div", "qq", icoH("cloud") + " " + esc(T("s2Prompt"))));
    var KINDS = ["lion", "elephant", "rabbit", "giraffe", "sheep"];
    var count = el("div", "arkcount", icoH("boat") + " <span></span>" + esc(T("s2Aboard")) + ": 0 / " + KINDS.length);
    stage.appendChild(count);
    var grid = el("div", "arkgrid");
    var deck2 = [], errs = 0, pairs = 0, selB = null, selKind = null;
    for (var i = 0; i < KINDS.length; i++) { deck2.push(KINDS[i]); deck2.push(KINDS[i]); }
    deck2 = shuffle(deck2);
    for (var j = 0; j < deck2.length; j++) (function (kind) {
      var b = el("button", "ak", icoH(kind, "ico-xl"));
      b.setAttribute("data-kind", kind);
      b.onclick = function () {
        if (b.className.indexOf("gone") >= 0) return;
        if (!selB) { selB = b; selKind = kind; b.classList.add("sel"); return; }
        if (selB === b) { b.classList.remove("sel"); selB = null; return; }
        if (selKind === kind) {
          selB.classList.remove("sel");
          selB.classList.add("gone"); b.classList.add("gone");
          pairs++;
          count.innerHTML = icoH("boat") + " " + esc(T("s2Aboard")) + ": " + pairs + " / " + KINDS.length;
          selB = null;
          if (pairs === KINDS.length) setTimeout(function () { done(errs === 0); }, 600);
        } else {
          errs++;
          selB.classList.remove("sel");
          b.classList.add("shake"); selB.classList.add("shake");
          var b2 = selB; selB = null;
          setTimeout(function () { b.classList.remove("shake"); b2.classList.remove("shake"); }, 450);
        }
      };
      grid.appendChild(b);
    })(deck2[j]);
    stage.appendChild(grid);
  }

  /* Манна: собери ровно дневную меру — лишнее испортится */
  function simManna(stage, done) {
    var NEED = 6, FIELD = 12;
    stage.appendChild(el("div", "qq", esc(T("s3Prompt"))));
    stage.appendChild(el("p", "hint", esc(T("s3Norm")) + ": " + NEED));
    var errs = 0;
    var count = el("div", "mncount");
    var field = el("div", "mnfield");
    var okBtn = el("button", "mapnext done", "✔ " + esc(T("done")) + " +" + icoH("star"));
    var note = el("p", "hint mnnote", "");
    var got = 0;
    function refresh() {
      count.textContent = T("s3Basket") + ": " + got + " / " + NEED;
      okBtn.hidden = got !== NEED;
      note.textContent = got === NEED ? T("s3Enough") : "";
    }
    function spill() { /* пожадничал — манна испортилась, поле заново */
      errs++;
      note.textContent = T("s3Spoil");
      got = 0;
      var old = field.childNodes;
      for (var i = old.length - 1; i >= 0; i--) old[i].classList.remove("taken");
      count.textContent = T("s3Basket") + ": 0 / " + NEED;
      okBtn.hidden = true;
    }
    for (var i = 0; i < FIELD; i++) (function () {
      var m = el("button", "mn");
      m.onclick = function () {
        if (m.className.indexOf("taken") >= 0) return;
        m.classList.add("taken");
        got++;
        if (got > NEED) { spill(); return; }
        refresh();
      };
      field.appendChild(m);
    })();
    okBtn.onclick = function () { done(errs === 0); };
    refresh();
    stage.appendChild(count);
    stage.appendChild(field);
    stage.appendChild(note);
    stage.appendChild(okBtn);
  }

  /* Суд Соломона: выбери мудрое решение (двухшаговый диалог) */
  function simSolomon(stage, done) {
    var errs = 0;
    var c15 = byId(B.plots, "plots_15");
    function scene(text, opts) {
      stage.innerHTML = "";
      if (c15) { var im = el("img", "qface"); im.src = cardImg(c15); im.alt = ""; stage.appendChild(im); }
      stage.appendChild(el("div", "qdigit s4box", esc(text)));
      var note = el("p", "hint s4note", "");
      var box = el("div", "qopts");
      for (var i = 0; i < opts.length; i++) (function (o) {
        var b = el("button", "opt", esc(o.label));
        b.onclick = function () {
          if (o.ok) { b.classList.add("ok"); setTimeout(o.next, 700); }
          else {
            errs++;
            b.classList.add("no"); b.disabled = true;
            note.textContent = T("s4no");
          }
        };
        box.appendChild(b);
      })(opts[i]);
      stage.appendChild(box);
      stage.appendChild(note);
    }
    scene(T("s4Intro"), [
      { label: T("s4o1"), ok: false },
      { label: T("s4o2"), ok: true, next: step2 },
      { label: T("s4o3"), ok: false }
    ]);
    function step2() {
      scene(T("s4Step2"), [
        { label: T("s4m1"), ok: false },
        { label: T("s4m2"), ok: true, next: moral }
      ]);
    }
    function moral() {
      stage.innerHTML = "";
      stage.appendChild(el("div", "qdigit s4box", esc(T("s4Moral"))));
      var next = el("button", "bigbtn", esc(T("qNext")) + " →");
      next.onclick = function () { done(errs === 0); };
      stage.appendChild(next);
    }
  }

  /* Звезда волхвов: найди движущуюся звезду и иди за ней */
  function simStar(stage, done) {
    stage.appendChild(el("div", "qq", icoH("bethstar") + " " + esc(T("s5Prompt"))));
    var sky = el("div", "starsky");
    var errs = 0, hops = 0;
    var PATH = [[18, 22], [58, 38], [30, 58], [72, 74]];
    /* статичные звёзды — детерминированная россыпь */
    for (var i = 0; i < 14; i++) (function (i2) {
      var st = el("button", "st", "✦");
      st.style.left = ((i2 * 37 + 13) % 88 + 4) + "%";
      st.style.top = ((i2 * 53 + 29) % 78 + 3) + "%";
      st.onclick = function () {
        errs++;
        st.classList.add("shake");
        setTimeout(function () { st.classList.remove("shake"); }, 450);
      };
      sky.appendChild(st);
    })(i);
    sky.appendChild(el("div", "sthouse", icoH("camel", "ico-lg") + icoH("houses", "ico-lg")));
    var star = el("button", "st special", icoH("bethstar", "ico-lg"));
    star.style.left = PATH[0][0] + "%"; star.style.top = PATH[0][1] + "%";
    var hint = el("p", "hint", "");
    star.onclick = function () {
      hops++;
      if (hops < PATH.length) {
        star.style.left = PATH[hops][0] + "%";
        star.style.top = PATH[hops][1] + "%";
        hint.innerHTML = icoH("bethstar") + " " + esc(T("s5Follow"));
        return;
      }
      /* дошли до Вифлеема */
      sky.innerHTML = "";
      var c20 = byId(B.plots, "plots_20");
      if (c20) { var im = el("img"); im.src = cardImg(c20); im.alt = ""; im.className = "starfin"; sky.appendChild(im); }
      hint.textContent = T("s5Done");
      setTimeout(function () { done(errs === 0); }, 1400);
    };
    sky.appendChild(star);
    stage.appendChild(sky);
    stage.appendChild(hint);
  }

  /* Иерихон: обойди семь раз — соблазн протрубить раньше всегда рядом */
  function simJericho(stage, done) {
    stage.appendChild(el("div", "qq", icoH("horn") + " " + esc(T("j7Prompt"))));
    var errs = 0, rounds = 0;
    var count = el("div", "arkcount", esc(T("j7Round")) + ": 0 / 7");
    var scene = el("div", "jwrap");
    var wall = el("div", "jwall");
    for (var i = 0; i < 9; i++) wall.appendChild(el("span", "jb"));
    var walker = el("div", "jwalker", icoH("walker", "ico-lg"));
    scene.appendChild(wall);
    scene.appendChild(walker);
    var note = el("p", "hint s4note", "");
    var walk = el("button", "mapnext", esc(T("j7Walk")) + " →");
    var blow = el("button", "mapnext jblow", icoH("horn") + " " + esc(T("j7Blow")));
    walk.onclick = function () {
      if (rounds >= 7) return;
      walker.classList.remove("go");
      void walker.offsetWidth; /* перезапуск CSS-анимации обхода */
      walker.classList.add("go");
      rounds++;
      count.textContent = T("j7Round") + ": " + rounds + " / 7";
      note.textContent = "";
      if (rounds === 7) walk.hidden = true;
    };
    blow.onclick = function () {
      if (rounds < 7) { /* поторопился — стены стоят */
        errs++;
        note.textContent = T("j7Early");
        wall.classList.add("shake");
        setTimeout(function () { wall.classList.remove("shake"); }, 500);
        return;
      }
      wall.classList.add("falls");
      note.textContent = T("j7Fall");
      fanfare(true);
      setTimeout(function () { done(errs === 0); }, 1200);
    };
    stage.appendChild(count);
    stage.appendChild(scene);
    stage.appendChild(note);
    stage.appendChild(walk);
    stage.appendChild(blow);
  }

  /* Запасы Иосифа: семь тучных лет копим — семь тощих кормим народ */
  function simJoseph(stage, done) {
    stage.appendChild(el("div", "qq", icoH("wheat") + " " + esc(T("joPrompt"))));
    var errs = 0, year = 1, barn = 0;
    var count = el("div", "arkcount");
    var box = el("div", "qdigit s4box");
    var note = el("p", "hint s4note", "");
    var opts = el("div", "qopts");
    function paint() {
      count.innerHTML = icoH("amphora") + " " + esc(T("joBarn")) + ": " + barn + " · " + esc(T("joYear")) + " " + year + " / 7";
      box.innerHTML = icoH("wheat") + " " + esc(T("joYear")) + " " + year;
    }
    var feast = el("button", "opt", esc(T("joFeast")));
    var store = el("button", "opt", icoH("amphora") + " " + esc(T("joStore")));
    feast.onclick = function () { /* соблазн — Иосиф поправляет */
      errs++;
      note.textContent = T("joHint");
      feast.classList.add("shake");
      setTimeout(function () { feast.classList.remove("shake"); }, 450);
    };
    store.onclick = function () {
      barn++;
      note.textContent = "";
      if (year === 7) { lean(); return; }
      year++;
      paint();
    };
    function lean() { /* тощие годы проигрываются сами */
      opts.hidden = true;
      box.textContent = T("joLean");
      var y = 0;
      var t = setInterval(function () {
        y++; barn--;
        count.innerHTML = icoH("amphora") + " " + esc(T("joBarn")) + ": " + barn + " · " + esc(T("joYear")) + " " + y + " / 7";
        if (y === 7) {
          clearInterval(t);
          box.textContent = T("joFed");
          fanfare(true);
          setTimeout(function () { done(errs === 0); }, 1300);
        }
      }, 550);
    }
    opts.appendChild(feast);
    opts.appendChild(store);
    paint();
    stage.appendChild(count);
    stage.appendChild(box);
    stage.appendChild(opts);
    stage.appendChild(note);
  }

  /* Иона: куда ни правь — рыба возвращает к Ниневии */
  function simJonah(stage, done) {
    stage.appendChild(el("div", "qq", icoH("boat") + " " + esc(T("jnPrompt"))));
    var sea = el("div", "jsea");
    sea.appendChild(el("div", "jt", icoH("palm", "ico-lg")));
    sea.appendChild(el("div", "jn", icoH("citygate", "ico-lg")));
    var ship = el("div", "jship", icoH("boat", "ico-xl"));
    var fish = el("div", "jfish", icoH("whale", "ico-xl"));
    sea.appendChild(ship);
    sea.appendChild(fish);
    var pos = 50;
    function move() { ship.style.left = pos + "%"; }
    var note = el("p", "hint s4note", "");
    var row = el("div", "qopts");
    var away = el("button", "opt", "← " + esc(T("jnAway")));
    var go = el("button", "opt", esc(T("jnGo")) + " →");
    away.onclick = function () { /* попытка сбежать — часть истории, не ошибка */
      pos = Math.max(14, pos - 22); move();
      sea.classList.add("storm");
      fish.classList.add("up");
      setTimeout(function () {
        pos = Math.min(64, pos + 26); move();
        note.textContent = T("jnStorm");
        sea.classList.remove("storm");
        setTimeout(function () { fish.classList.remove("up"); }, 500);
      }, 900);
    };
    go.onclick = function () {
      away.disabled = true; go.disabled = true;
      note.textContent = "";
      pos = 86; move();
      setTimeout(function () {
        note.textContent = T("jnArrive");
        fanfare(true);
        setTimeout(function () { done(true); }, 1200);
      }, 900);
    };
    row.appendChild(away);
    row.appendChild(go);
    stage.appendChild(sea);
    stage.appendChild(note);
    stage.appendChild(row);
    move();
  }

  /* Скрижали: житейская ситуация → какое правило про это */
  function simTablets(stage, done) {
    var errs = 0;
    var ROUNDS = [
      { s: "tbS1", ok: "tbR1", alts: ["tbR2", "tbR4"] },
      { s: "tbS2", ok: "tbR2", alts: ["tbR5", "tbR1"] },
      { s: "tbS3", ok: "tbR3", alts: ["tbR1", "tbR2"] }
    ];
    var r = 0;
    function scene() {
      stage.innerHTML = "";
      stage.appendChild(el("div", "qq", icoH("scroll") + " " + esc(T("tbPrompt"))));
      var marks = el("div", "tbmarks");
      for (var m = 0; m < ROUNDS.length; m++)
        marks.appendChild(el("span", "tbm" + (m < r ? " on" : ""), m < r ? "✔" : "·"));
      stage.appendChild(marks);
      var rd = ROUNDS[r];
      stage.appendChild(el("div", "qdigit s4box", esc(T(rd.s))));
      var keys = shuffle([rd.ok, rd.alts[0], rd.alts[1]]);
      var box = el("div", "qopts");
      for (var i = 0; i < keys.length; i++) (function (k) {
        var b = el("button", "opt", icoH("scroll") + " " + esc(T(k)));
        b.onclick = function () {
          if (k === rd.ok) {
            b.classList.add("ok");
            r++;
            setTimeout(r < ROUNDS.length ? scene : function () { done(errs === 0); }, 700);
          } else { errs++; b.classList.add("no"); b.disabled = true; }
        };
        box.appendChild(b);
      })(keys[i]);
      stage.appendChild(box);
    }
    scene();
  }

  /* Камни Давида: выбери пять гладких — угловатые праще не годятся */
  function simDavid(stage, done) {
    stage.appendChild(el("div", "qq", esc(T("dvPrompt"))));
    var errs = 0, got = 0;
    var count = el("div", "arkcount", esc(T("dvBag")) + ": 0 / 5");
    var note = el("p", "hint s4note", "");
    var stream = el("div", "dvstream");
    /* 5 гладких (овалы) + 5 угловатых (ромбы), вперемешку */
    var stones = shuffle([1, 1, 1, 1, 1, 0, 0, 0, 0, 0]);
    for (var i = 0; i < stones.length; i++) (function (smooth) {
      var st = el("button", "dvst" + (smooth ? " smooth" : " rough"));
      st.setAttribute("data-smooth", smooth);
      st.onclick = function () {
        if (st.className.indexOf("got") >= 0) return;
        if (smooth) {
          st.classList.add("got");
          got++;
          count.textContent = T("dvBag") + ": " + got + " / 5";
          note.textContent = "";
          if (got === 5) {
            note.textContent = T("dvWin");
            fanfare(true);
            setTimeout(function () { done(errs === 0); }, 1200);
          }
        } else {
          errs++;
          note.textContent = "✗ " + T("dvNo");
          st.classList.add("shake");
          setTimeout(function () { st.classList.remove("shake"); }, 450);
        }
      };
      stream.appendChild(st);
    })(stones[i]);
    stage.appendChild(count);
    stage.appendChild(stream);
    stage.appendChild(note);
  }

  /* Радуга-обещание: семь цветов по порядку, сверху красный */
  function simRainbow(stage, done) {
    stage.appendChild(el("div", "qq", icoH("rainbow") + " " + esc(T("rbPrompt"))));
    var COLORS = ["#e63946", "#f77f00", "#ffd166", "#4c9a2a", "#56b4d3", "#3a6ea5", "#7b5ea7"];
    var errs = 0, next = 0;
    var sky = el("div", "rbsky");
    var arcs = [];
    for (var i = 0; i < 7; i++) {
      var arc = el("div", "rbarc");
      arc.style.width = (88 - i * 10) + "%";
      arc.style.borderColor = COLORS[i];
      sky.appendChild(arc);
      arcs.push(arc);
    }
    sky.appendChild(el("div", "rbark", icoH("boat", "ico-lg")));
    var note = el("p", "hint s4note", "");
    var chips = el("div", "wchips");
    var order = shuffle([0, 1, 2, 3, 4, 5, 6]);
    for (var j = 0; j < order.length; j++) (function (ci) {
      var b = el("button", "wch rbchip");
      b.style.background = COLORS[ci];
      b.setAttribute("data-ci", ci);
      b.onclick = function () {
        if (b.disabled) return;
        if (ci === next) {
          b.disabled = true; b.classList.add("used");
          arcs[ci].classList.add("on");
          next++;
          if (next === 7) {
            note.innerHTML = icoH("dove") + " " + esc(T("rbDone"));
            fanfare(true);
            setTimeout(function () { done(errs === 0); }, 1300);
          }
        } else {
          errs++;
          b.classList.add("shake");
          setTimeout(function () { b.classList.remove("shake"); }, 450);
        }
      };
      chips.appendChild(b);
    })(order[j]);
    stage.appendChild(sky);
    stage.appendChild(chips);
    stage.appendChild(note);
  }

  /* Переход через море: подними посох — и веди народ по сухому дну */
  function simSea(stage, done) {
    var prompt = el("div", "qq", esc(T("seaPrompt")));
    stage.appendChild(prompt);
    var errs = 0;
    var box = el("div", "seabox");
    var wl = el("div", "seawall left");
    var wr = el("div", "seawall right");
    var fam = el("div", "seafam", icoH("family", "ico-xl"));
    box.appendChild(wl); box.appendChild(wr); box.appendChild(fam);
    var note = el("p", "hint s4note", "");
    var opened = false, step = 0, STEPS = 4;
    var marks = [];
    box.onclick = function () {
      if (opened) return;
      opened = true;
      box.classList.add("open"); /* волны разъезжаются */
      prompt.innerHTML = esc(T("seaPath"));
      setTimeout(function () {
        for (var s = 0; s < STEPS; s++) (function (i) {
          var fp = el("button", "seastep", String(i + 1));
          fp.style.left = (30 + i * 14) + "%";
          fp.setAttribute("data-step", i);
          fp.onclick = function (e) {
            e.stopPropagation();
            if (i !== step) {
              errs++;
              fp.classList.add("shake");
              setTimeout(function () { fp.classList.remove("shake"); }, 450);
              return;
            }
            fp.classList.add("on");
            fam.style.left = (30 + i * 14) + "%";
            step++;
            if (step === STEPS) {
              setTimeout(function () {
                fam.style.left = "88%";
                box.classList.remove("open"); /* море смыкается позади */
                note.textContent = T("seaDone");
                fanfare(true);
                setTimeout(function () { done(errs === 0); }, 1300);
              }, 500);
            }
          };
          box.appendChild(fp);
          marks.push(fp);
        })(s);
      }, 700);
    };
    stage.appendChild(box);
    stage.appendChild(note);
  }

  /* Даниил во рву: пересчитай львов и назови число */
  function simDaniel(stage, done) {
    stage.appendChild(el("div", "qq", icoH("lion") + " " + esc(T("dnPrompt"))));
    var LIONS = 6, errs = 0, counted = 0;
    var den = el("div", "dnden");
    den.appendChild(el("div", "dnman", icoH("kneeler", "ico-lg")));
    var POS = [[16, 24], [66, 16], [38, 44], [80, 52], [22, 68], [58, 76]];
    var note = el("p", "hint s4note", "");
    var count = el("div", "arkcount", icoH("lion") + " <b>0 / ?</b>");
    for (var i = 0; i < LIONS; i++) (function (i2) {
      var li = el("button", "dnlion", icoH("lion", "ico-lg"));
      li.style.left = POS[i2][0] + "%";
      li.style.top = POS[i2][1] + "%";
      li.onclick = function () {
        if (li.className.indexOf("zz") >= 0) return;
        li.classList.add("zz");
        /* лев уснул — приглушаем иконку классом zz */
        counted++;
        count.innerHTML = icoH("lion") + " <b>" + counted + " / ?</b>";
        if (counted === LIONS) ask();
      };
      den.appendChild(li);
    })(i);
    function ask() {
      var qbox = el("div", "qopts qnums");
      var nums = shuffle([5, 6, 7]);
      stage.appendChild(el("div", "qq", esc(T("dnHow"))));
      for (var n = 0; n < nums.length; n++) (function (v) {
        var b = el("button", "opt", String(v));
        b.onclick = function () {
          if (v === LIONS) {
            b.classList.add("ok");
            note.textContent = T("dnDone");
            fanfare(true);
            setTimeout(function () { done(errs === 0); }, 1100);
          } else { errs++; b.classList.add("no"); b.disabled = true; }
        };
        qbox.appendChild(b);
      })(nums[n]);
      stage.appendChild(qbox);
    }
    stage.appendChild(count);
    stage.appendChild(den);
    stage.appendChild(note);
  }

  /* Эсфирь: смелость сказать правду (двухшаговый выбор) */
  function simEsther(stage, done) {
    var errs = 0;
    var c19 = byId(B.plots, "plots_19");
    function scene(text, opts) {
      stage.innerHTML = "";
      if (c19) { var im = el("img", "qface"); im.src = cardImg(c19); im.alt = ""; stage.appendChild(im); }
      stage.appendChild(el("div", "qdigit s4box", esc(text)));
      var note = el("p", "hint s4note", "");
      var box = el("div", "qopts");
      for (var i = 0; i < opts.length; i++) (function (o) {
        var b = el("button", "opt", esc(o.label));
        b.onclick = function () {
          if (o.ok) { b.classList.add("ok"); setTimeout(o.next, 700); }
          else {
            errs++;
            b.classList.add("no"); b.disabled = true;
            note.textContent = T("esNo");
          }
        };
        box.appendChild(b);
      })(opts[i]);
      stage.appendChild(box);
      stage.appendChild(note);
    }
    scene(T("esP1"), [
      { label: T("esO1"), ok: false },
      { label: T("esO2"), ok: true, next: step2 }
    ]);
    function step2() {
      scene(T("esP2"), [
        { label: T("esB2"), ok: false },
        { label: T("esB1"), ok: true, next: moral }
      ]);
    }
    function moral() {
      stage.innerHTML = "";
      stage.appendChild(el("div", "qdigit s4box", esc(T("esMoral"))));
      var next = el("button", "bigbtn", esc(T("qNext")) + " →");
      next.onclick = function () { done(errs === 0); };
      stage.appendChild(next);
    }
  }

  /* Неопалимая купина: благоговение и поручение Моисею */
  function simBush(stage, done) {
    var errs = 0;
    var c09 = byId(B.plots, "plots_09");
    stage.appendChild(el("div", "qq", icoH("fire") + " " + esc(T("bsP1"))));
    if (c09) { var im = el("img", "qface"); im.src = cardImg(c09); im.alt = ""; stage.appendChild(im); }
    var note = el("p", "hint s4note", "");
    var box = el("div", "qopts");
    var opts = shuffle([
      { k: "bsO1", ok: true },
      { k: "bsO2", ok: false },
      { k: "bsO3", ok: false }
    ]);
    for (var i = 0; i < opts.length; i++) (function (o) {
      var b = el("button", "opt", esc(T(o.k)));
      b.onclick = function () {
        if (o.ok) {
          b.classList.add("ok");
          setTimeout(step2, 700);
        } else {
          errs++;
          b.classList.add("no"); b.disabled = true;
          note.textContent = T("bsNo");
        }
      };
      box.appendChild(b);
    })(opts[i]);
    stage.appendChild(box);
    stage.appendChild(note);
    function step2() {
      stage.innerHTML = "";
      stage.appendChild(el("div", "qdigit s4box", icoH("sandals") + " " + esc(T("bsP2"))));
      var answer = el("button", "bigbtn", esc(T("bsA")));
      answer.onclick = function () { done(errs === 0); };
      stage.appendChild(answer);
    }
  }

  /* Эдем: дай имена животным — нажми зверя, потом его имя */
  function simEden(stage, done) {
    stage.appendChild(el("div", "qq", icoH("dove") + " " + esc(T("edPrompt"))));
    var ANIMALS = [
      { em: "elephant", k: "edA1" }, { em: "lion", k: "edA2" }, { em: "giraffe", k: "edA3" },
      { em: "dove", k: "edA4" }, { em: "rabbit", k: "edA5" }
    ];
    var errs = 0, named = 0, selA = null, selBtn = null;
    var zoo = el("div", "edzoo");
    var note = el("p", "hint s4note", "");
    for (var i = 0; i < ANIMALS.length; i++) (function (a) {
      var b = el("button", "edan");
      b.appendChild(el("span", "em", icoH(a.em, "ico-lg")));
      b.appendChild(el("span", "tag", "·"));
      b.setAttribute("data-k", a.k);
      b.onclick = function () {
        if (b.className.indexOf("on") >= 0) return;
        if (selBtn) selBtn.classList.remove("sel");
        selBtn = b; selA = a;
        b.classList.add("sel");
      };
      zoo.appendChild(b);
    })(ANIMALS[i]);
    var chips = el("div", "wchips");
    var order = shuffle(ANIMALS.slice());
    for (var j = 0; j < order.length; j++) (function (a) {
      var ch = el("button", "wch edname", esc(T(a.k)));
      ch.setAttribute("data-k", a.k);
      ch.onclick = function () {
        if (ch.disabled || !selA) return;
        if (selA.k === a.k) {
          ch.disabled = true; ch.classList.add("used");
          selBtn.classList.remove("sel"); selBtn.classList.add("on");
          selBtn.childNodes[1].textContent = T(a.k);
          selBtn = null; selA = null;
          named++;
          if (named === ANIMALS.length) {
            note.textContent = T("edDone");
            fanfare(true);
            setTimeout(function () { done(errs === 0); }, 1200);
          }
        } else {
          errs++;
          ch.classList.add("shake");
          setTimeout(function () { ch.classList.remove("shake"); }, 450);
        }
      };
      chips.appendChild(ch);
    })(order[j]);
    stage.appendChild(zoo);
    stage.appendChild(chips);
    stage.appendChild(note);
  }

  /* Вавилонская башня: кнопка стройки внезапно на чужих языках */
  function simBabelMix(stage, done) {
    var errs = 0, floors = 0, TOTAL = 5;
    var qq = el("div", "qq", icoH("hammer") + " " + esc(T("bbPrompt")));
    stage.appendChild(qq);
    var tower = el("div", "bbtower");
    var note = el("p", "hint s4note", "");
    var btns = el("div", "qopts");
    function paint() {
      tower.innerHTML = "";
      for (var f = 0; f < floors; f++) {
        var row = el("div", "bbrow");
        var wide = 7 - f;
        for (var b0 = 0; b0 < wide; b0++) row.appendChild(el("span", "jb"));
        tower.insertBefore(row, tower.firstChild);
      }
    }
    function round() {
      btns.innerHTML = "";
      if (floors >= TOTAL) { /* смешение сработало — стройка встала */
        qq.innerHTML = esc(T("bbEnd"));
        var next = el("button", "bigbtn", esc(T("qNext")) + " →");
        next.onclick = function () { done(errs === 0); };
        btns.appendChild(next);
        return;
      }
      if (floors < 2) { /* сначала всё просто — одна кнопка на твоём языке */
        var b = el("button", "opt", esc(T("buildNext")) + "!");
        b.setAttribute("data-ok", "1");
        b.onclick = function () { floors++; paint(); round(); };
        btns.appendChild(b);
        return;
      }
      /* дальше — языки смешались: найди кнопку на своём */
      qq.innerHTML = esc(T("bbMix"));
      var others = [];
      for (var l0 = 0; l0 < B.languages.length; l0++)
        if (B.languages[l0] !== K.lang()) others.push(B.languages[l0]);
      others = shuffle(others).slice(0, 2);
      var opts = shuffle([K.lang(), others[0], others[1]]);
      for (var o = 0; o < opts.length; o++) (function (lg) {
        var b = el("button", "opt", esc(B.ui.buildNext[lg]) + "!");
        if (lg === K.lang()) b.setAttribute("data-ok", "1");
        b.onclick = function () {
          if (lg === K.lang()) { floors++; paint(); round(); }
          else {
            errs++;
            note.innerHTML = icoH("question") + icoH("question") + icoH("question");
            b.classList.add("shake");
            setTimeout(function () { b.classList.remove("shake"); note.textContent = ""; }, 600);
          }
        };
        btns.appendChild(b);
      })(opts[o]);
    }
    paint(); round();
    stage.appendChild(tower);
    stage.appendChild(btns);
    stage.appendChild(note);
  }

  /* Лестница Иакова: зажги ступени снизу вверх */
  function simLadder(stage, done) {
    stage.appendChild(el("div", "qq", icoH("bethstar") + " " + esc(T("llPrompt"))));
    var STEPS = 7, lit = 0, errs = 0;
    var sky = el("div", "llsky");
    sky.appendChild(el("div", "llman", icoH("sleeper", "ico-lg")));
    var note = el("p", "hint s4note", "");
    for (var i = 0; i < STEPS; i++) (function (i2) {
      var st = el("button", "llstep");
      st.style.bottom = (8 + i2 * 12) + "%";
      st.style.width = (58 - i2 * 4) + "%";
      st.setAttribute("data-step", i2);
      st.onclick = function () {
        if (st.className.indexOf("on") >= 0) return;
        if (i2 !== lit) { /* только снизу вверх */
          errs++;
          st.classList.add("shake");
          setTimeout(function () { st.classList.remove("shake"); }, 450);
          return;
        }
        st.classList.add("on");
        lit++;
        if (lit === STEPS) {
          sky.appendChild(el("div", "llangel a1", icoH("angel", "ico-lg")));
          sky.appendChild(el("div", "llangel a2", icoH("angel", "ico-lg")));
          note.textContent = T("llDone");
          fanfare(true);
          setTimeout(function () { done(errs === 0); }, 1500);
        }
      };
      sky.appendChild(st);
    })(i);
    stage.appendChild(sky);
    stage.appendChild(note);
  }

  /* Разноцветная одежда: творчество без ошибок — раскрась все полосы */
  function simCoat(stage, done) {
    stage.appendChild(el("div", "qq", esc(T("ctPrompt"))));
    var COLORS = ["#e63946", "#f77f00", "#ffd166", "#4c9a2a", "#56b4d3", "#7b5ea7"];
    var painted = 0, cur = COLORS[0];
    var robe = el("div", "ctrobe");

    var strips = el("div", "ctstrips");
    var note = el("p", "hint s4note", "");
    for (var i = 0; i < 6; i++) (function () {
      var sp = el("button", "ctstrip");
      sp.onclick = function () {
        if (!sp.getAttribute("data-done")) painted++;
        sp.setAttribute("data-done", "1");
        sp.style.background = cur;
        if (painted === 6) {
          note.textContent = T("ctDone");
          fanfare(true);
          setTimeout(function () { done(true); }, 1200); /* творчество — всегда ⭐⭐ */
        }
      };
      strips.appendChild(sp);
    })();
    robe.appendChild(strips);
    var pal = el("div", "wchips");
    for (var c0 = 0; c0 < COLORS.length; c0++) (function (col) {
      var ch = el("button", "wch rbchip");
      ch.style.background = col;
      ch.onclick = function () {
        cur = col;
        var all = pal.childNodes;
        for (var k = 0; k < all.length; k++) all[k].classList.remove("sel");
        ch.classList.add("sel");
      };
      pal.appendChild(ch);
    })(COLORS[c0]);
    if (pal.firstChild) pal.firstChild.classList.add("sel");
    stage.appendChild(robe);
    stage.appendChild(pal);
    stage.appendChild(note);
  }

  /* Младенец в корзине: проведи по Нилу мимо камышей к царевне */
  function simBasket(stage, done) {
    stage.appendChild(el("div", "qq", esc(T("bkPrompt"))));
    var errs = 0, step = 0, STEPS = 4;
    var river = el("div", "bkriver");
    river.appendChild(el("div", "bkmir", icoH("girl", "ico-lg")));
    river.appendChild(el("div", "bkprin", icoH("princess", "ico-lg")));
    var basket = el("div", "bkbasket", icoH("basket", "ico-lg"));
    river.appendChild(basket);
    var note = el("p", "hint s4note", "");
    for (var i = 0; i < STEPS; i++) (function (i2) {
      var rd = el("button", "bkreed", icoH("reeds", "ico-lg"));
      rd.style.left = (26 + i2 * 16) + "%";
      rd.setAttribute("data-step", i2);
      rd.onclick = function () {
        if (rd.className.indexOf("on") >= 0) return;
        if (i2 !== step) {
          errs++;
          rd.classList.add("shake");
          setTimeout(function () { rd.classList.remove("shake"); }, 450);
          return;
        }
        rd.classList.add("on");
        basket.style.left = (26 + i2 * 16) + "%";
        step++;
        if (step === STEPS) setTimeout(function () {
          basket.style.left = "86%";
          note.textContent = T("bkDone");
          fanfare(true);
          setTimeout(function () { done(errs === 0); }, 1400);
        }, 500);
      };
      river.appendChild(rd);
    })(i);
    stage.appendChild(river);
    stage.appendChild(note);
  }

  /* Храм Соломона: выбери три верных материала */
  function simTempleMat(stage, done) {
    stage.appendChild(el("div", "qq", icoH("hammer") + " " + esc(T("tmPrompt"))));
    var MATS = [
      { em: "cedar", k: "tmM1", ok: true }, { em: "stone", k: "tmM2", ok: true },
      { em: "gold", k: "tmM3", ok: true }, { em: "straw", k: "tmM4", ok: false },
      { em: "ice", k: "tmM5", ok: false }, { em: "paper", k: "tmM6", ok: false }
    ];
    var errs = 0, got = 0;
    var note = el("p", "hint s4note", "");
    var count = el("div", "arkcount", icoH("hammer") + " <b>0 / 3</b>");
    var grid = el("div", "tmgrid");
    var order = shuffle(MATS);
    for (var i = 0; i < order.length; i++) (function (m) {
      var b = el("button", "tmmat");
      b.appendChild(el("span", "em", icoH(m.em, "ico-lg")));
      b.appendChild(el("span", "nm", esc(T(m.k))));
      b.setAttribute("data-good", m.ok ? "1" : "0");
      b.onclick = function () {
        if (b.className.indexOf("on") >= 0 || b.disabled) return;
        if (m.ok) {
          b.classList.add("on");
          got++;
          count.innerHTML = icoH("hammer") + " <b>" + got + " / 3</b>";
          note.textContent = "";
          if (got === 3) {
            note.textContent = T("tmDone");
            fanfare(true);
            setTimeout(function () { done(errs === 0); }, 1300);
          }
        } else {
          errs++;
          b.disabled = true;
          note.textContent = "✗ " + T("tmNo");
          b.classList.add("shake");
          setTimeout(function () { b.classList.remove("shake"); }, 450);
        }
      };
      grid.appendChild(b);
    })(order[i]);
    stage.appendChild(count);
    stage.appendChild(grid);
    stage.appendChild(note);
  }

    return {
    plots_01: simCreation,  /* Сотворение мира → дни творения */
    plots_02: simEden,      /* Эдем → дай имена животным */
    plots_03: simArkLoad,   /* Ноев ковчег → погрузка парами */
    plots_04: simRainbow,   /* Радуга → семь цветов обещания */
    plots_05: simBabelMix,  /* Вавилонская башня → смешение языков */
    plots_06: simLadder,    /* Лестница Иакова → снизу вверх */
    plots_07: simCoat,      /* Разноцветная одежда → раскрась */
    plots_08: simBasket,    /* Младенец в корзине → по Нилу */
    heroes_05: simJoseph,   /* Иосиф → запасы на тощие годы */
    plots_09: simBush,      /* Купина → благоговение и «не бойся» */
    plots_10: simSea,       /* Переход через море → раздвинь и проведи */
    plots_11: simManna,     /* Манна → мера на один день */
    plots_12: simTablets,   /* Скрижали → правило из жизни */
    plots_13: simJericho,   /* Иерихон → семь обходов и труба */
    plots_14: simDavid,     /* Давид → пять гладких камней */
    plots_15: simSolomon,   /* Суд Соломона → мудрый выбор */
    plots_16: simTempleMat, /* Храм Соломона → верные материалы */
    plots_17: simDaniel,    /* Даниил → пересчитай львов */
    plots_18: simJonah,     /* Иона → от поручения не уплывёшь */
    plots_19: simEsther,    /* Эсфирь → смелость сказать правду */
    plots_20: simStar       /* Рождество → звезда волхвов */
  };
};
