/* core/engines/quest — движок сюжетного тома-игры (quest).
   ES5, vanilla, офлайн, iOS WebKit. Переиспользуется всеми томами: тропа эпох,
   альбом-коллекция, награды/звёзды/медали/супер-приз, карта дня, ранги,
   универсальные механики, карты мира, реконструктор, книги, родительский режим.
   Колода приносит ТОЛЬКО данные: window.VOLUME (data/volume.js) + сцены
   (sims.js через window.QUEST_SIMS_FACTORY). Контракт — docs/product-quest.md. */
(function () {
  "use strict";
  /* контент тома — window.VOLUME (алиас window.BIBLE для BST);
     неймспейс хранилища берём из B.ns (по умолчанию "bibi") — колоды не пересекаются */
  var B = window.VOLUME || window.BIBLE;
  var NS = B.ns || "bibi";
  var LANG_KEY = NS + "_lang", PROG_KEY = NS + "_prog";
  var RTL = ["ar"];

  /* ── состояние ── */
  function loadProg() {
    try { var p = JSON.parse(localStorage.getItem(PROG_KEY) || "{}"); return p && typeof p === "object" ? p : {}; }
    catch (e) { return {}; }
  }
  var prog = loadProg();
  prog.seen = prog.seen || {};
  prog.games = prog.games || {};
  /* прогресс квеста: col — добытые карты (id → звёзды 1..2),
     bld — пройденные бонусы-стройки, med — медали пройденных эпох */
  prog.q = prog.q || {};
  prog.q.col = prog.q.col || {};
  prog.q.bld = prog.q.bld || {};
  prog.q.med = prog.q.med || {};
  /* дневник успехов для родителей: [{t: время, id: карта, s: звёзды}] */
  prog.qlog = prog.qlog || [];
  /* мягкий стрик: серия дней, в которые открывали игру (без давления) */
  prog.streak = prog.streak || { d: "", n: 0 };
  (function touchStreak() {
    var now = new Date();
    var today = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
    if (prog.streak.d === today) return;
    var y = new Date(now.getTime() - 864e5);
    var yest = y.getFullYear() + "-" + (y.getMonth() + 1) + "-" + y.getDate();
    prog.streak.n = (prog.streak.d === yest) ? prog.streak.n + 1 : 1;
    prog.streak.d = today;
    saveProg();
  })();
  function pushLog(id, stars, skill) {
    prog.qlog.push({ t: Date.now(), id: id, s: stars, k: skill || "" });
    if (prog.qlog.length > 200) prog.qlog = prog.qlog.slice(-200);
  }
  function saveProg() { try { localStorage.setItem(PROG_KEY, JSON.stringify(prog)); } catch (e) {} }

  var lang = (function () {
    try { var l = localStorage.getItem(LANG_KEY); if (l && idx(B.languages, l) >= 0) return l; } catch (e) {}
    return B.languages[0];
  })();

  /* ── утилиты ── */
  function idx(arr, v) { for (var i = 0; i < arr.length; i++) if (arr[i] === v) return i; return -1; }
  function L(obj) { if (!obj) return ""; return obj[lang] != null ? obj[lang] : (obj.ru != null ? obj.ru : ""); }
  function T(key) { return L(B.ui[key]); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  /* растровые иконки вместо эмодзи (лист 30 шт, img/icons/)
     *-mark.webp — центрированные круглые бейджи (как в футере): иначе
     object-fit:cover обрезает смещённый глиф у спрайтов. */
  var ICO_MARK = {
    scroll: 1, cards: 1, family: 1, puzzle: 1,
    amphora: 1, hourglass: 1, magnifier: 1, cloud: 1,
    book: 1, blocks: 1, headphones: 1, star: 1
  };
  function icoSrc(n) { return "img/icons/" + (ICO_MARK[n] ? n + "-mark" : n) + ".webp"; }
  function icoH(n, cls) {
    return '<img class="' + (cls || "ico") + '" src="' + icoSrc(n) + '" alt="">';
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function findCard(id) { return byId(B.heroes, id) || byId(B.plots, id); }
  function heroImg(h) { return "img/" + h.id + "_" + h.slug + ".webp"; }
  function plotImg(p) { return "img/" + p.id + "_" + p.slug + ".webp"; }
  function cardImg(c) { return c.id.indexOf("heroes") === 0 ? heroImg(c) : plotImg(c); }
  function hasImg(c) { return c.id.indexOf("heroes") === 0 ? true : !!c.imgReady; }
  /* Живой постер поверх чистой акварели (все герои/сюжеты).
     Данные: window.POSTER_OVERLAY (data/poster_overlay.js).
     «Найди» / 3 факта — из данных, чтобы тексты переводились.
     Иконки фактов: img/icons/poster/{icon}.svg (атласный стиль). */
  var POSTER_OVERLAY = window.POSTER_OVERLAY || {};
  function posterFactIco(name) {
    return '<img class="pface-fact-ico" src="img/icons/poster/' + name + '.svg" alt="">';
  }
  function posterFindIco() {
    return '<img class="pface-find-ico" src="img/icons/poster/magnifier.svg" alt="">';
  }
  function posterOverlay(c) { return c && POSTER_OVERLAY[c.id] ? POSTER_OVERLAY[c.id] : null; }
  /* Лицо карты: при оверлее — всегда чистая акварель; иначе ru-baked постер
     (fallback) или акварель. */
  function faceImg(c) {
    if (posterOverlay(c)) return cardImg(c);
    if (c.poster && lang === "ru") return "img/posters/" + c.id + "_" + c.slug + ".webp";
    return cardImg(c);
  }
  /* mode: "full" (модалка) | "tile" (сетка альбома) — одни и те же переводимые тексты.
     Вариант 2: акварель на весь кадр, надписи absolute поверх (как вшитый постер). */
  function buildPosterInto(root, c, mode) {
    var ov = posterOverlay(c);
    if (!ov) return false;
    var compact = mode === "tile";
    root.classList.add("pface");
    if (compact) root.classList.add("pface-tile");

    var im = el("img", "pface-art");
    im.src = cardImg(c);
    im.alt = esc(L(c.name));
    if (compact) im.loading = "lazy";
    root.appendChild(im);

    var frame = el("div", "pface-frame");
    var head = el("div", "pface-head");
    head.appendChild(el("div", "pface-title", esc(L(c.name))));
    head.appendChild(el("div", "pface-sub", esc(c.id.indexOf("heroes") === 0 ? L(c.epithet) : L(c.source))));
    frame.appendChild(head);

    var foot = el("div", "pface-foot");
    var find = el("div", "pface-find");
    find.innerHTML = posterFindIco() +
      "<b>" + esc(T("lFind")) + "</b>" +
      "<span>" + esc(L(ov.find)) + "</span>";
    foot.appendChild(find);

    var facts = el("div", "pface-facts");
    for (var f = 0; f < ov.facts.length; f++) {
      var fd = ov.facts[f];
      var chip = el("div", "pface-fact");
      var num = fd.num;
      var html = "";
      if (fd.icon) html += posterFactIco(fd.icon);
      html += '<span class="pface-fact-txt">';
      html += "<b>" + esc(typeof num === "object" ? L(num) : num) + "</b>";
      html += "<i>" + esc(L(fd.label)) + "</i>";
      html += "</span>";
      chip.innerHTML = html;
      facts.appendChild(chip);
    }
    foot.appendChild(facts);
    frame.appendChild(foot);
    root.appendChild(frame);
    return true;
  }
  function buildPosterFace(face, c) { return buildPosterInto(face, c, "full"); }

  /* ── аудио карт (иконка наушников + play + название; без длительности) ── */
  var cardAudio = null;
  function stopCardAudio() {
    if (cardAudio) { try { cardAudio.pause(); } catch (e) {} cardAudio = null; }
    var b = document.querySelector(".pl.on, .cb-audio-btn.on");
    if (b) {
      b.classList.remove("on"); b.innerHTML = "▶";
      var wrap = b.closest && b.closest(".cb-audio");
      if (wrap) wrap.classList.remove("playing");
    }
  }
  function toggleCardAudio(btn, src) {
    if (cardAudio && btn.classList.contains("on")) { stopCardAudio(); return; }
    stopCardAudio();
    cardAudio = new Audio(src);
    btn.classList.add("on"); btn.innerHTML = "⏸";
    var wrap = btn.closest && btn.closest(".cb-audio");
    if (wrap) wrap.classList.add("playing");
    cardAudio.onended = stopCardAudio;
    cardAudio.play();
  }

  /* ── каркас ── */
  var root = document.getElementById("app");
  var mainEl, tabsEl, langsEl;
  /* Игра первична: дефолтная вкладка — квест «Большое путешествие», карты
     добываются заданиями и складываются в альбом (Герои/Сюжеты — коллекция).
     «Книга» — краткая история тома на движке core/engines/encyclopedia;
     мини-игры живут внизу экрана игры («Свободная игра»). */
  /* Единый хаб (5 вкладок, как на макете): Книга · Карты(альбом) · Стройка ·
     Лента(feed — главный игровой режим) · Словарик. Квест-игра и таймлайн
     свёрнуты — лента стала первичной. */
  var TABS = ["lBook", "cards", "lBuild", "lenta", "glossary"];
  var tab = "cards";
  /* единое нижнее меню тома (window.FEED_MENU из nav.js): когда задано —
     прячем верхние вкладки и «RU» в шапке, язык уходит в родительский режим,
     навигация идёт нижним баром. Другие колоды без nav.js работают по-старому. */
  var MENU = window.FEED_MENU || null;
  var EMBED = /[?&]embed=1/.test(location.search);
  if (EMBED) {
    try { document.documentElement.classList.add("embed"); document.body.classList.add("embed"); } catch (e) {}
  }
  var VOLUME_BOOK = { id: "_volume", title: null, reader: "book/reader.html" };

  function shellNav(to, tab) {
    if (!EMBED || window.parent === window) return false;
    try { window.parent.postMessage({ type: "bibleShell", action: "nav", to: to, tab: tab || null }, "*"); return true; }
    catch (e) { return false; }
  }

  /* В embed хаб живёт в iframe между шапкой и #bnav оболочки.
     #cardview/#bookview с position:fixed покрывают только iframe —
     просим родителя развернуть main на весь экран (поверх chrome). */
  function setShellOverlay(on) {
    if (!EMBED || window.parent === window) return;
    try { window.parent.postMessage({ type: "bibleShell", action: "cardOverlay", open: !!on }, "*"); }
    catch (e) {}
  }
  function mountOverlay(ov) {
    document.body.appendChild(ov);
    setShellOverlay(true);
  }
  function unmountOverlay(ov) {
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    if (!document.getElementById("cardview") && !document.getElementById("bookview")) {
      setShellOverlay(false);
    }
  }

  function applyDir() {
    document.documentElement.setAttribute("dir", idx(RTL, lang) >= 0 ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
  }

  function build() {
    root.innerHTML = "";
    var head = el("header");
    head.appendChild(el("div", "ttl", esc(L(B.title))));
    if (!MENU) {
      /* язык — компактной кнопкой «RU» в шапке (при едином меню уезжает в
         родительский режим) */
      langsEl = el("div"); langsEl.id = "langs";
      var cur = el("button", "lang cur", lang.toUpperCase() + " ▾");
      var panel = el("div", "langpanel");
      panel.hidden = true;
      for (var i = 0; i < B.languages.length; i++) (function (lg) {
        var b = el("button", "lang", lg.toUpperCase());
        b.setAttribute("aria-pressed", lg === lang ? "true" : "false");
        b.onclick = function () { panel.hidden = true; setLang(lg); };
        panel.appendChild(b);
      })(B.languages[i]);
      cur.onclick = function () { panel.hidden = !panel.hidden; };
      langsEl.appendChild(cur);
      langsEl.appendChild(panel);
      head.appendChild(langsEl);
      var pbtn = el("button", "parentbtn", icoH("family", "ico-lg"));
      pbtn.setAttribute("aria-label", esc(T("pTitle")));
      pbtn.onclick = openParent;
      head.appendChild(pbtn);
    }
    root.appendChild(head);

    if (!MENU) {
      tabsEl = el("nav"); tabsEl.id = "tabs";
      for (var t = 0; t < TABS.length; t++) (function (id) {
        var b = el("button", "tab", esc(T(id)));
        b.setAttribute("data-tab", id);
        b.setAttribute("aria-pressed", id === tab ? "true" : "false");
        b.onclick = function () { setTab(id); };
        tabsEl.appendChild(b);
      })(TABS[t]);
      root.appendChild(tabsEl);
    }

    mainEl = el("main");
    root.appendChild(mainEl);
    render();
    if (MENU && !EMBED) renderBottomMenu();
  }

  /* нижнее меню тома — общее с Лентой (nav.js). Активен текущий режим.
     В embed-режиме навигацию держит корневая оболочка index.html. */
  var MENU_TAB = { cards: "cards", books: "books", build: "lBuild", games: "games", game: "games", glossary: "glossary" };
  function renderBottomMenu() {
    if (EMBED || !MENU) return;
    var old = document.getElementById("botmenu"); if (old) old.parentNode.removeChild(old);
    var nav = el("nav"); nav.id = "botmenu";
    for (var i = 0; i < MENU.length; i++) (function (m) {
      var active = (m.to === "parent") ? false : (MENU_TAB[m.to] === tab);
      var it = el(m.to === "lenta" ? "a" : "button", "bm" + (active ? " on" : ""));
      it.innerHTML = '<img src="' + icoSrc(m.icon) + '" alt="">' +
        '<span>' + esc(lang === "en" && m.labelEn ? m.labelEn : m.label) + '</span>';
      if (m.to === "lenta") it.href = "feed/index.html";
      else it.onclick = function () {
        if (m.to === "parent") { openParent(); return; }
        if (m.to === "books") { setTab("books"); }
        else setTab(MENU_TAB[m.to]);
        renderBottomMenu();
      };
      nav.appendChild(it);
    })(MENU[i]);
    document.body.appendChild(nav);
    document.body.classList.add("hasmenu");
  }

  function setLang(lg) {
    lang = lg;
    try { localStorage.setItem(LANG_KEY, lg); } catch (e) {}
    applyDir();
    syncBookLang();
    build();
  }
  function setTab(id) {
    if (id === "lBook") { openBook({ title: B.title, reader: VOLUME_BOOK.reader }); return; }
    if (id === "lenta") {
      if (shellNav("feed")) return;
      location.href = "feed/index.html";
      return;
    }
    if (id === "books") { tab = "books"; }
    else if (MENU_TAB[id]) { tab = MENU_TAB[id]; id = tab; }
    else { tab = id; }
    stopCardAudio();
    if (tabsEl) {
      var bs = tabsEl.childNodes;
      for (var i = 0; i < bs.length; i++) bs[i].setAttribute("aria-pressed", bs[i].getAttribute("data-tab") === tab ? "true" : "false");
    }
    render();
    if (MENU && !EMBED) renderBottomMenu();
  }
  function render() {
    mainEl.innerHTML = "";
    mainEl.classList.remove("buildmode");
    if (tab === "game") renderQuest();
    else if (tab === "games") renderGames();
    else if (tab === "cards") renderDeck(B.heroes.concat(B.plots), true);   // альбом — все карты открыты
    else if (tab === "heroes") renderDeck(B.heroes);
    else if (tab === "plots") renderDeck(B.plots);
    else if (tab === "books") renderBooks();
    else if (tab === "lMaps") renderMaps();
    else if (tab === "lBuild") renderBuild();
    else if (tab === "timeline") renderTimeline();
    else if (tab === "glossary") renderGlossary();
  }

  /* ── хаб мини-игр (футер «Игры» / #/games) — не путать со стройкой ── */
  function renderGames() {
    mainEl.appendChild(el("p", "hint", esc(T("gamesPick"))));
    mainEl.appendChild(gamesHub());
  }

  /* ── иконостас (ровно 3 колонки) ── */
  /* Альбом-коллекция: карты добываются в игре. Недобытая — плитка-загадка
     с «?» цвета своей эпохи; нажатие объясняет, где её добыть. */
  function collected(id) { return !!prog.q.col[id]; }
  function renderDeck(list, showAll) {
    var got = 0;
    for (var n = 0; n < list.length; n++) if (showAll || collected(list[n].id)) got++;
    mainEl.appendChild(el("p", "hint", esc(T("qCollected")) + ": " + got + " / " + list.length));
    var g = el("div", "grid");
    for (var i = 0; i < list.length; i++) (function (c, i2) {
      if (!showAll && !collected(c.id)) {
        var lockT = el("button", "tile locked");
        var era = byId(B.eras, c.era);
        var ph2 = el("div", "ph");
        if (era) ph2.style.background = era.color;
        ph2.appendChild(el("div", "em", icoH("question", "ico-xl")));
        ph2.appendChild(el("div", "nm", String(i2 + 1)));
        lockT.appendChild(ph2);
        lockT.onclick = function () { lockedHint(c); };
        g.appendChild(lockT);
        return;
      }
      var t = el("button", "tile" + (hasImg(c) ? "" : " txt"));
      if (posterOverlay(c) && hasImg(c)) {
        buildPosterInto(t, c, "tile");
      } else if (hasImg(c)) {
        var im = el("img"); im.src = faceImg(c); im.alt = esc(L(c.name)); im.loading = "lazy";
        t.appendChild(im);
      } else {
        var ph = el("div", "ph");
        ph.appendChild(el("div", "em", icoH("book", "ico-lg")));
        ph.appendChild(el("div", "nm", esc(L(c.name))));
        t.appendChild(ph);
      }
      /* скилл-точки: сколько граней карты пройдено (идеология «Стран мира») */
      var sk = skillsFor(c), dn = skCount(c);
      var drow = el("span", "tskdots");
      for (var sd = 0; sd < sk.length; sd++) drow.appendChild(el("i", sd < dn ? "on" : ""));
      t.appendChild(drow);
      if (masteredCard(c)) t.appendChild(el("span", "mark", icoH("trophy")));
      else if (prog.q.col[c.id] >= 2) t.appendChild(el("span", "mark", icoH("star")));
      t.onclick = function () { openCard(c.id); };
      g.appendChild(t);
    })(list[i], i);
    mainEl.appendChild(g);
  }
  function lockedHint(c) {
    var era = byId(B.eras, c.era);
    var ov = el("div"); ov.id = "cardview";
    var box = el("div", "lockbox");
    box.appendChild(el("div", "em", icoH("lock", "ico-xl")));
    box.appendChild(el("p", null, esc(T("qLockCard"))));
    if (era) box.appendChild(el("p", "hint", icoH(ERA_ICON[era.id]) + " " + esc(L(era.name))));
    var go = el("button", "bigbtn", esc(T("qToGame")) + " ▶");
    go.onclick = function () { unmountOverlay(ov); setTab("cards"); };
    box.appendChild(go);
    ov.appendChild(box);
    ov.onclick = function (e) { if (e.target === ov) unmountOverlay(ov); };
    mountOverlay(ov);
  }

  /* ── карта крупно ──
     Как во всех наших колодах: кнопок нет — нажатие на карту переворачивает,
     нажатие мимо карты закрывает. Изнанка — мини-энциклопедия по референсам:
     секции с чипами-заголовками (Факты/История/Найди/Слово/Послушай/Ещё об этом). */
  function glossFor(id) {
    var out = [];
    for (var i = 0; i < B.glossary.length; i++) {
      var g = B.glossary[i];
      if (g.refs && idx(g.refs, id) >= 0) out.push(g);
      if (out.length === 2) break;
    }
    return out;
  }
  function relatedFor(c) {
    var out = [];
    if (c.pair) { var p = findCard(c.pair); if (p) out.push(p); }
    var all = B.heroes.concat(B.plots);
    for (var i = 0; i < all.length && out.length < 3; i++) {
      var x = all[i];
      if (x.id !== c.id && x.era === c.era && (!c.pair || x.id !== c.pair)) out.push(x);
    }
    return out;
  }
  function section(label) {
    var s = el("div", "sec");
    s.appendChild(el("span", "lbl", esc(label)));
    return s;
  }
  function openCard(id) {
    var c = findCard(id);
    if (!c) return;
    if (!prog.seen[id]) { prog.seen[id] = 1; saveProg(); }
    var isHero = id.indexOf("heroes") === 0;
    var list = isHero ? B.heroes : B.plots;
    var num = 0;
    for (var i0 = 0; i0 < list.length; i0++) if (list[i0].id === id) num = i0 + 1;
    var ov = el("div"); ov.id = "cardview";
    var fr = el("div", "frame");
    var showingBack = false;

    function close() { stopCardAudio(); unmountOverlay(ov); }
    function fitBack() {
      var sc = back.querySelector(".cb-scroll");
      var fit = back.querySelector(".cb-fit");
      if (!sc || !fit) return;
      fit.style.zoom = "";
      fit.classList.remove("fill");
      var avail = sc.clientHeight, nat = fit.scrollHeight;
      if (nat > avail + 1) fit.style.zoom = Math.max(0.55, (avail - 6) / nat);
      else if (avail - nat > 16) fit.classList.add("fill");
    }
    function flip() {
      /* изнанка ровно того же формата, что лицо: меряем лицо до скрытия */
      if (!showingBack && face.offsetHeight) back.style.height = face.offsetHeight + "px";
      showingBack = !showingBack;
      face.hidden = showingBack; back.hidden = !showingBack;
      if (!showingBack) stopCardAudio();
      else requestAnimationFrame(fitBack);
    }
    function noflip(fn) { return function (e) { e.stopPropagation(); fn(); }; }

    var face = el("div", "face");
    if (hasImg(c) && buildPosterFace(face, c)) {
      /* живой постер: акварель + HTML-надписи */
    } else if (hasImg(c)) {
      var fw = el("div", "faceimg");
      var im = el("img"); im.src = faceImg(c); im.alt = esc(L(c.name));
      fw.appendChild(im);
      /* «живая картина»: пульс-точка на объекте «найди» — тап даёт искру
         и подпись (координаты: постер для ru, чистая картинка для других) */
      var live = isHero ? null : (lang === "ru" && !posterOverlay(c) ? c.findAtP : c.findAt);
      if (live) {
        var dot = el("button", "livedot");
        dot.style.left = live.x + "%";
        dot.style.top = live.y + "%";
        dot.onclick = noflip(function () {
          var old = fw.querySelector(".livebubble");
          if (old) old.parentNode.removeChild(old);
          var sp = el("span", "livespark");
          sp.style.left = live.x + "%"; sp.style.top = live.y + "%";
          fw.appendChild(sp);
          setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 700);
          var bub = el("div", "livebubble", icoH("magnifier") + " " + esc(L(c.findIt)));
          bub.style.left = Math.min(Math.max(live.x, 22), 78) + "%";
          bub.style.top = (live.y > 82 ? live.y - 12 : live.y + 9) + "%";
          fw.appendChild(bub);
          setTimeout(function () { if (bub.parentNode) bub.parentNode.removeChild(bub); }, 1800);
        });
        fw.appendChild(dot);
      }
      face.appendChild(fw);
    }
    else {
      var ph = el("div", "ph");
      ph.appendChild(el("div", "em", icoH("book", "ico-lg")));
      ph.appendChild(el("div", "nm", esc(L(c.name))));
      face.appendChild(ph);
    }
    /* «Ещё об этом» живёт на лице — тонкой полосой миниатюр внизу */
    var rel = relatedFor(c);
    if (rel.length) {
      var fm = el("div", "facemore" + (face.classList.contains("pface") ? " on-pface" : ""));
      fm.appendChild(el("span", "fml", "→ " + esc(T("lMore"))));
      for (var fr0 = 0; fr0 < rel.length; fr0++) (function (x) {
        var fb = el("button", "fmrel");
        if (hasImg(x)) { var fi = el("img"); fi.src = cardImg(x); fi.alt = esc(L(x.name)); fb.appendChild(fi); }
        else fb.appendChild(el("span", "rem", icoH("book")));
        fb.onclick = noflip(function () { close(); openCard(x.id); });
        fm.appendChild(fb);
      })(rel[fr0]);
      face.appendChild(fm);
      if (face.classList.contains("pface")) face.classList.add("has-facemore");
    }
    face.onclick = flip;

    var back = el("div", "backside");
    var shell = el("div", "cb");
    var numLabel = (num < 10 ? "0" + num : String(num));
    var typeLabel = T(isHero ? "lHero" : "lPlotOne");

    /* шапка */
    var top = el("div", "cb-top");
    top.appendChild(el("span", "cb-badge", esc(typeLabel) + " · № " + numLabel));
    top.appendChild(el("h2", "cb-name", esc(L(c.name))));
    top.appendChild(el("p", "cb-group", esc(isHero ? L(c.epithet) : L(c.source))));
    shell.appendChild(top);

    /* аудио */
    if (c.audioReady && B.audioLangs && idx(B.audioLangs, lang) >= 0) {
      var au = el("div", "cb-audio");
      var pb = el("button", "cb-audio-btn", "▶");
      var src = "audio/" + lang + "/" + c.id + "_" + c.slug + ".mp3";
      pb.onclick = noflip(function () { toggleCardAudio(pb, src); });
      au.appendChild(pb);
      var am = el("div", "cb-audio-main");
      am.appendChild(el("div", "cb-audio-title", esc(T("lListen"))));
      am.appendChild(el("div", "cb-audio-wave", "<i></i><i></i><i></i><i></i><i></i>"));
      au.appendChild(am);
      shell.appendChild(au);
    }

    /* прокручиваемое тело: при коротком тексте растягиваем, при длинном — scale */
    var scroll = el("div", "cb-scroll");
    var fit = el("div", "cb-fit");

    (function () {
      var sk = skillsFor(c), dn = skCount(c);
      var row = el("div", "cb-skills");
      var dd = el("div", "skdots");
      for (var i = 0; i < sk.length; i++) {
        var chip = el("span", "skdot" + (skPassed(c.id)[sk[i]] ? " on" : ""));
        chip.innerHTML = icoH(SKILL_ICON[sk[i]]);
        chip.title = T("sk" + sk[i].charAt(0).toUpperCase() + sk[i].slice(1));
        dd.appendChild(chip);
      }
      row.appendChild(dd);
      var badge = masteredCard(c) ? T("mastered") : (learnedCard(c) ? T("learned") : dn + "/" + sk.length);
      row.appendChild(el("span", "skbadge" + (masteredCard(c) ? " done" : ""), esc(badge)));
      fit.appendChild(row);
      var tb = el("button", "cb-train", icoH("scroll") + " " + esc(T("trainBtn")));
      tb.onclick = noflip(function () { close(); drillCard = c; renderDrill(c); });
      fit.appendChild(tb);
    })();

    if (c.book) {
      var bk = byId(B.books, c.book);
      if (bk && bk.ready) {
        var bb = el("button", "cb-book", icoH("book") + " " + esc(L(bk.title)) + " →");
        bb.onclick = noflip(function () { close(); openBook(bk); });
        fit.appendChild(bb);
      }
    }

    if (isHero) {
      fit.appendChild(el("div", "cb-sec", esc(T("lFacts"))));
      var bul = el("ul", "cb-bul");
      var facts = L(c.facts);
      for (var f = 0; f < facts.length; f++) bul.appendChild(el("li", null, esc(facts[f])));
      fit.appendChild(bul);
    } else {
      fit.appendChild(el("div", "cb-sec", esc(T("lStory"))));
      fit.appendChild(el("p", "cb-story", esc(L(c.story))));
      fit.appendChild(el("div", "cb-sec", esc(T("lFind"))));
      fit.appendChild(el("div", "cb-find", icoH("magnifier") + " " + esc(L(c.findIt))));
    }

    var duo = el("div", "cb-duo");
    if (c.digit) {
      var sd = el("div", "cb-chip");
      sd.appendChild(el("div", "cb-chip-l", esc(T("lDigit"))));
      sd.appendChild(el("div", "cb-chip-n", esc(c.digit.num)));
      sd.appendChild(el("div", "cb-chip-v", esc(L(c.digit.label))));
      duo.appendChild(sd);
    }
    var gl = glossFor(id);
    if (gl.length) {
      var g0 = gl[0];
      var sw = el("div", "cb-chip");
      sw.appendChild(el("div", "cb-chip-l", esc(T("lWord"))));
      sw.appendChild(el("div", "cb-chip-n", g0.emoji + " " + esc(L(g0.word))));
      sw.appendChild(el("div", "cb-chip-v", esc(L(g0.def))));
      duo.appendChild(sw);
    }
    if (duo.childNodes.length) fit.appendChild(duo);

    if (isHero && c.think) {
      var st = el("div", "cb-wow");
      st.appendChild(el("b", null, esc(T("lThink"))));
      st.appendChild(document.createTextNode(L(c.think)));
      fit.appendChild(st);
    }
    if (!isHero && c.wow) {
      var swow = el("div", "cb-wow");
      swow.appendChild(el("b", null, esc(T("lWow"))));
      swow.appendChild(document.createTextNode(L(c.wow)));
      fit.appendChild(swow);
    }

    scroll.appendChild(fit);
    shell.appendChild(scroll);

    var ft = el("div", "cb-ft");
    ft.appendChild(el("span", null, esc(typeLabel)));
    ft.appendChild(el("span", null, numLabel + " / " + list.length));
    shell.appendChild(ft);

    back.appendChild(shell);
    back.hidden = true;
    back.onclick = flip;
    ov.onclick = function (e) { if (e.target === ov || e.target === fr) close(); };

    fr.appendChild(face); fr.appendChild(back);
    ov.appendChild(fr);
    mountOverlay(ov);
  }

  /* ── книги: плитки + встроенный ридер (iframe, приём strany-mira) ── */
  function renderBooks() {
    mainEl.appendChild(el("p", "hint", esc(T("tapTile"))));
    var g = el("div", "bookgrid");
    for (var i = 0; i < B.books.length; i++) (function (bk) {
      var t = el("button", "tile" + (bk.ready ? "" : " off txt"));
      if (bk.ready) {
        var im = el("img"); im.src = bk.cover; im.alt = esc(L(bk.title)); im.loading = "lazy";
        t.appendChild(im);
      } else {
        var ph = el("div", "ph");
        ph.appendChild(el("div", "em", icoH("book", "ico-lg")));   // без эмодзи
        ph.appendChild(el("div", "nm", esc(L(bk.title))));
        t.appendChild(ph);
        t.appendChild(el("span", "soon", esc(T("soon"))));
      }
      t.appendChild(el("span", "cap", esc(L(bk.title))));
      if (bk.ready) t.onclick = function () { openBook(bk); };
      g.appendChild(t);
    })(B.books[i]);
    mainEl.appendChild(g);
  }

  var bookFrame = null;
  function bookLang() { return idx(RTL, lang) >= 0 || idx(B.languages, lang) >= 0 ? lang : "ru"; }
  function openBook(bk, extra) {
    var ov = el("div"); ov.id = "bookview";
    var bar = el("div", "bar");
    var closeB = el("button", "bt", "← " + esc(T("back")));
    bar.appendChild(closeB);
    bar.appendChild(el("div", "bttl", esc(L(bk.title))));
    ov.appendChild(bar);
    var f = document.createElement("iframe");
    var th = "light";
    try { th = localStorage.getItem("bible_theme") === "dark" ? "dark" : "light"; } catch (e) {}
    f.src = bk.reader + "?embed=1" + (extra || "") + "&lang=" + bookLang() + "&theme=" + th;
    f.setAttribute("allow", "autoplay");
    ov.appendChild(f);
    bookFrame = f;
    closeB.onclick = function () {
      try { f.contentWindow.postMessage({ type: "bookStop" }, "*"); } catch (e) {}
      bookFrame = null;
      unmountOverlay(ov);
    };
    mountOverlay(ov);
  }
  function syncBookLang() {
    if (!bookFrame) return;
    try { bookFrame.contentWindow.postMessage({ type: "dinoLang", lang: bookLang() }, "*"); } catch (e) {}
  }

  /* ── игры ── */
  /* свободная игра на универсальной механике: случайная карта, после
     победы — «ещё раз» с новой картой */
  function freeMech(title, pick, mech) {
    var w = gameShell(title, "");
    var stage = el("div", "qstage");
    w.appendChild(stage);
    function round() {
      stopCardAudio();
      stage.innerHTML = "";
      mech(stage, pick(), function () {
        fanfare(false);
        stage.appendChild(el("p", "hint", icoH("star") + " " + esc(T("done"))));
        var again = el("button", "bigbtn", esc(T("again")));
        again.onclick = round;
        stage.appendChild(again);
      });
    }
    round();
  }
  function pickFrom(list) {
    return function () { return list[Math.floor(Math.random() * list.length)]; };
  }
  function gamesHub() {
    var hub = el("div", "gamehub");
    var all = B.heroes.concat(B.plots);
    var findable = [], wordable = [];
    for (var f = 0; f < B.plots.length; f++) if (B.plots[f].findAt) findable.push(B.plots[f]);
    for (var w2 = 0; w2 < all.length; w2++) {
      var nm2 = L(all[w2].name);
      if (lang !== "ar" && nm2.indexOf(" ") < 0 && nm2.length >= 3 && nm2.length <= 12) wordable.push(all[w2]);
    }
    var GAMES = [
      { id: "puzzle", em: "puzzle", name: T("qPuzzle"), run: function () {
        freeMech(T("qPuzzle"), pickFrom(all), mechPuzzle);
      } },
      { id: "memory", em: "cards", name: T("gMemory"), run: gameMemory },
      { id: "quiz", em: "scroll", name: T("gQuiz"), run: gameQuiz },
      { id: "artifact", em: "amphora", name: T("gArtifact"), run: gameArtifact },
      { id: "order", em: "hourglass", name: T("gOrder"), run: gameOrder },
      { id: "findon", em: "magnifier", name: T("qFindOn").replace(/[::]\s*$/, ""), run: function () {
        freeMech(T("qFindOn").replace(/[::]\s*$/, ""), pickFrom(findable), mechFind);
      } },
      { id: "mist", em: "cloud", name: T("qShadow"), run: function () {
        freeMech(T("qShadow"), pickFrom(B.heroes), mechShadow);
      } },
      { id: "book", em: "book", name: T("gBook"), run: function () {
        openBook({ title: B.ui.gBook, reader: VOLUME_BOOK.reader }, "&games=1");
      } }
    ];
    if (wordable.length) GAMES.push({ id: "word", em: "blocks", name: T("qWordGame"), run: function () {
      freeMech(T("qWordGame"), pickFrom(wordable), mechWord);
    } });
    if (idx(B.audioLangs, lang) >= 0) GAMES.push({ id: "listen", em: "headphones", name: T("lListen"), run: function () {
      freeMech(T("lListen"), pickFrom(all), mechListen);
    } });
    for (var i = 0; i < GAMES.length; i++) (function (g) {
      var b = el("button", "gbtn");
      b.appendChild(el("div", "em", icoH(g.em, "ico-xl")));
      b.appendChild(el("div", "nm", esc(g.name)));
      b.onclick = function () { g.run(); };
      hub.appendChild(b);
    })(GAMES[i]);
    return hub;
  }

  /* ── КВЕСТ «Большое путешествие» — сердце приложения ──
     7 эпох-станций на тропе; в эпохе — задания по её картам (кто это /
     верное число / найди пару / чья вещь). Решил задание — добыл карту в
     альбом (⭐⭐ с первой попытки, ⭐ со второй). Бонусы — стройка ковчега,
     башни, скинии, храма и книга Рождества. Эпоха пройдена — медаль,
     открывается следующая. */
  var ERA_ICON = { 1: "rainbow", 2: "sheep", 3: "fire", 4: "grapes", 5: "crown", 6: "whale", 7: "bethstar" };
  /* бонус-шаги: после какой карты какая стройка/карта пути/книга */
  var QUEST_BONUS = { heroes_01: "ark", plots_05: "babel", plots_10: "map:exodus", plots_12: "tabernacle", plots_16: "temple", plots_20: "book:nativity" };
  var questEraId = null; /* null — экран-тропа; иначе id открытой эпохи */

  function eraCards(eid) {
    var out = [], i;
    for (i = 0; i < B.heroes.length; i++) if (B.heroes[i].era === eid) out.push(B.heroes[i]);
    for (i = 0; i < B.plots.length; i++) if (B.plots[i].era === eid) out.push(B.plots[i]);
    return out;
  }
  function eraSteps(eid) {
    var cards = eraCards(eid), steps = [];
    for (var i = 0; i < cards.length; i++) {
      steps.push({ t: "card", c: cards[i] });
      var bonus = QUEST_BONUS[cards[i].id];
      if (!bonus) continue;
      if (bonus.indexOf("book:") === 0) steps.push({ t: "book", id: bonus.slice(5) });
      else if (bonus.indexOf("map:") === 0) steps.push({ t: "map", key: bonus.slice(4) });
      else steps.push({ t: "build", key: bonus });
    }
    return steps;
  }
  function stepDone(s) {
    if (s.t === "card") return !!prog.q.col[s.c.id];
    if (s.t === "build") return !!prog.q.bld[s.key];
    if (s.t === "map") return !!prog.q.bld["map_" + s.key];
    return !!prog.q.bld["book_" + s.id];
  }
  function eraProgress(eid) {
    var st = eraSteps(eid), done = 0;
    for (var i = 0; i < st.length; i++) if (stepDone(st[i])) done++;
    return { done: done, total: st.length };
  }
  function eraUnlocked(eid) { return eid === 1 || !!prog.q.med[eid - 1]; }
  function totalStars() {
    var n = 0, k;
    for (k in prog.q.col) n += prog.q.col[k];
    for (k in prog.q.bld) n += 1;
    return n;
  }
  function collectedCount() {
    var n = 0, k;
    for (k in prog.q.col) n++;
    return n;
  }

  /* ── СЛОЙ НАВЫКОВ (идеология «Стран мира»/kit): карта осваивается по граням ──
     доступные грани зависят от карты; «освоено» — когда пройдены все. */
  prog.sk = prog.sk || {};
  function skillsFor(c) {
    var s = ["name", "era", "digit"];
    if (c.pair) s.push("pair");
    var isHero = c.id.indexOf("heroes") === 0;
    if (!isHero && (c.findAtP || c.findAt)) s.push("find");
    if (c.audioReady && B.audioLangs && idx(B.audioLangs, lang) >= 0) s.push("listen");
    return s;
  }
  var SKILL_ICON = { name: "book", era: "map", pair: "cards", digit: "scroll", find: "magnifier", listen: "headphones" };
  function skPassed(id) { return prog.sk[id] || {}; }
  function skCount(c) {
    var p = skPassed(c.id), n = 0, s = skillsFor(c);
    for (var i = 0; i < s.length; i++) if (p[s[i]]) n++;
    return n;
  }
  function masteredCard(c) { return skCount(c) >= skillsFor(c).length; }
  function learnedCard(c) { return skCount(c) >= Math.min(3, skillsFor(c).length); }
  function masteredCount() {
    var all = B.heroes.concat(B.plots), n = 0;
    for (var i = 0; i < all.length; i++) if (collected(all[i].id) && masteredCard(all[i])) n++;
    return n;
  }
  function passSkill(id, skill) {
    if (!prog.sk[id]) prog.sk[id] = {};
    if (prog.sk[id][skill]) return false;
    prog.sk[id][skill] = 1;
    pushLog(id, 1, skill);
    saveProg();
    return true;
  }

  /* карта дня — детерминированно по дате */
  function dailyCard() {
    var all = B.heroes.concat(B.plots);
    var now = new Date();
    var idx0 = (now.getFullYear() * 372 + now.getMonth() * 31 + now.getDate()) % all.length;
    return all[idx0];
  }
  /* ранги-звания по проценту собранного альбома (как ranks в core/kit) */
  var RANKS = [
    [0, "rank1", "walker"], [25, "rank2", "book"], [50, "rank3", "map"],
    [75, "rank4", "scroll"], [100, "rank5", "trophy"]
  ];
  function rank() {
    var pct = Math.round(collectedCount() / (B.heroes.length + B.plots.length) * 100);
    var r = RANKS[0];
    for (var i = 0; i < RANKS.length; i++) if (pct >= RANKS[i][0]) r = RANKS[i];
    return r;
  }

  /* ── РОДИТЕЛЬСКИЙ РЕЖИМ: замок-пример → прогресс, дневник, настройки ──
     та же архитектура, что в «Странах мира» и core/kit: ребёнок играет и
     собирает звёзды, родитель за замком видит, что пройдено и что узнано. */
  function openParent() {
    var ov = el("div"); ov.id = "cardview";
    var box = el("div", "lockbox parentbox");
    ov.appendChild(box);
    ov.onclick = function (e) { if (e.target === ov) unmountOverlay(ov); };
    mountOverlay(ov);
    var unlocked = false;
    try { unlocked = sessionStorage.getItem(NS + "_parent") === "1"; } catch (e) {}
    if (unlocked) { parentPanel(box); return; }
    var a = 2 + Math.floor(Math.random() * 8), b2 = 2 + Math.floor(Math.random() * 8);
    box.appendChild(el("div", "big", icoH("lock") + " " + esc(T("pTitle"))));
    box.appendChild(el("p", null, esc(T("pLock"))));
    box.appendChild(el("div", "plockq", a + " × " + b2 + " = ?"));
    var inp = el("input", "plockin");
    inp.type = "text"; inp.inputMode = "numeric";
    box.appendChild(inp);
    var note = el("p", "hint s4note", "");
    var goB = el("button", "bigbtn", esc(T("pEnter")));
    goB.onclick = function () {
      if (parseInt(inp.value, 10) === a * b2) {
        try { sessionStorage.setItem(NS + "_parent", "1"); } catch (e) {}
        parentPanel(box);
      } else {
        note.textContent = T("pWrong");
        inp.value = "";
      }
    };
    box.appendChild(goB);
    box.appendChild(note);
    setTimeout(function () { inp.focus(); }, 200);
  }
  function pLine(k, v) {
    var e = el("div", "pline");
    e.innerHTML = "<span>" + k + "</span><b>" + v + "</b>";
    return e;
  }
  function parentPanel(box) {
    box.innerHTML = "";
    box.classList.add("wide");
    box.appendChild(el("div", "big", icoH("family") + " " + esc(T("pTitle"))));

    /* язык (при едином меню живёт здесь, а не в шапке) */
    if (MENU) {
      box.appendChild(el("div", "psub", esc(T("pLang") || "Язык")));
      var langRow = el("div", "plangs");
      for (var li = 0; li < B.languages.length; li++) (function (lg) {
        var lb = el("button", "planglang" + (lg === lang ? " on" : ""), lg.toUpperCase());
        lb.onclick = function () {
          var ov = document.getElementById("cardview"); if (ov) unmountOverlay(ov);
          setLang(lg);
        };
        langRow.appendChild(lb);
      })(B.languages[li]);
      box.appendChild(langRow);
    }

    /* прогресс по эпохам — бары цветов эпох */
    box.appendChild(el("div", "psub", esc(T("pByEra"))));
    for (var i = 0; i < B.eras.length; i++) {
      var era = B.eras[i];
      var pr = eraProgress(era.id);
      var pc = pr.total ? Math.round(pr.done / pr.total * 100) : 0;
      box.appendChild(pLine(icoH(ERA_ICON[era.id]) + " " + esc(L(era.name)),
        pr.done + " / " + pr.total + (prog.q.med[era.id] ? " " + icoH("medal") : "")));
      var bar = el("div", "pbar");
      var fill = el("i");
      fill.style.width = pc + "%";
      fill.style.background = era.color;
      bar.appendChild(fill);
      box.appendChild(bar);
    }

    /* награды */
    box.appendChild(el("div", "psub", esc(T("pRewards"))));
    var medals = 0;
    for (var m0 in prog.q.med) medals++;
    var rk2 = rank();
    box.appendChild(pLine(esc(T("rankT")), icoH(rk2[2]) + " " + esc(T(rk2[1]))));
    box.appendChild(pLine(esc(T("dStreak")), icoH("sun") + " " + prog.streak.n));
    box.appendChild(pLine(esc(T("pStars")), icoH("star") + " " + totalStars()));
    box.appendChild(pLine(esc(T("pCards")), collectedCount() + " / " + (B.heroes.length + B.plots.length)));
    box.appendChild(pLine(esc(T("pMastered")), masteredCount() + " / " + (B.heroes.length + B.plots.length)));
    box.appendChild(pLine(esc(T("pMedals")), medals + " / " + B.eras.length));
    box.appendChild(pLine(esc(T("pGrand")),
      prog.q.grand ? icoH("trophy") + " " + esc(T("pYes")) : esc(T("pNot"))));

    /* прогресс по навыкам — сколько карт освоило каждую грань */
    box.appendChild(el("div", "psub", esc(T("pBySkill"))));
    (function () {
      var all = B.heroes.concat(B.plots), order = ["name", "era", "pair", "digit", "find", "listen"];
      for (var s = 0; s < order.length; s++) (function (sk) {
        var tot = 0, dn = 0;
        for (var i = 0; i < all.length; i++) {
          if (idx(skillsFor(all[i]), sk) < 0) continue;
          tot++; if (skPassed(all[i].id)[sk]) dn++;
        }
        if (!tot) return;
        var pc = Math.round(dn / tot * 100);
        box.appendChild(pLine(icoH(SKILL_ICON[sk]) + " " + esc(T("sk" + sk.charAt(0).toUpperCase() + sk.slice(1))), dn + " / " + tot));
        var bar = el("div", "pbar"); var f = el("i");
        f.style.width = pc + "%"; f.style.background = "var(--bordo)";
        bar.appendChild(f); box.appendChild(bar);
      })(order[s]);
    })();

    /* дневник: последние добытые карты */
    box.appendChild(el("div", "psub", esc(T("pDiary"))));
    if (!prog.qlog.length) {
      var emp = el("div", "empty", icoH("cloud", "") + "<div>" + esc(T("pDiaryEmpty")) + "</div>");
      emp.firstChild.className = "";
      box.appendChild(emp);
    }
    var recent = prog.qlog.slice(-10).reverse();
    for (var r = 0; r < recent.length; r++) {
      var e2 = recent[r];
      var card = findCard(e2.id);
      if (!card) continue;
      var d = new Date(e2.t);
      var dt = (d.getDate() < 10 ? "0" : "") + d.getDate() + "." +
               (d.getMonth() < 9 ? "0" : "") + (d.getMonth() + 1) + " " +
               (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" +
               (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
      box.appendChild(pLine(esc(L(card.name)) +
        (e2.s === 2 ? ' <span class="pft">' + esc(T("pFirstTry")) + "</span>" : ""),
        dt + " " + icoH("star") + (e2.s === 2 ? icoH("star") : "")));
    }

    /* вопрос для семейного разговора — «Подумай» последней добытой карты-героя */
    var famC = null;
    for (var fq = prog.qlog.length - 1; fq >= 0 && !famC; fq--) {
      var fc = findCard(prog.qlog[fq].id);
      if (fc && fc.think) famC = fc;
    }
    if (!famC) famC = B.heroes[0];
    if (famC && famC.think) {
      box.appendChild(el("div", "psub", esc(T("pFamily"))));
      var fbox = el("div", "qdigit s4box famq");
      fbox.innerHTML = "<b>" + esc(L(famC.name)) + "</b><br>" + esc(L(famC.think));
      box.appendChild(fbox);
    }

    /* настройки: звук фанфар */
    box.appendChild(el("div", "psub", esc(T("pSettings"))));
    var snd = el("div", "pline");
    var sndOn = localStorage.getItem(NS + "_snd") !== "0";
    snd.innerHTML = "<span>" + esc(T("pSound")) + "</span>";
    var tgl = el("button", "bt", sndOn ? T("pOn") : T("pOff"));
    tgl.onclick = function () {
      sndOn = !sndOn;
      try { localStorage.setItem(NS + "_snd", sndOn ? "1" : "0"); } catch (e) {}
      tgl.textContent = sndOn ? T("pOn") : T("pOff");
    };
    snd.appendChild(tgl);
    box.appendChild(snd);

    /* сброс */
    var rst = el("button", "bt preset", esc(T("pReset")));
    rst.onclick = function () {
      if (!confirm(T("pResetQ"))) return;
      try { localStorage.removeItem(PROG_KEY); } catch (e) {}
      location.reload();
    };
    box.appendChild(rst);
  }

  function renderQuest() {
    if (questEraId) return renderEra(questEraId);
    mainEl.appendChild(el("div", "questhead",
      "<b>" + esc(T("qJourney")) + "</b><span>" + icoH("star") + " " + totalStars() +
      " · " + icoH("cards") + " " + collectedCount() + "/" + (B.heroes.length + B.plots.length) + "</span>"));
    var rk = rank();
    mainEl.appendChild(el("div", "rankchip",
      icoH(rk[2]) + " " + esc(T("rankT")) + ": <b>" + esc(T(rk[1])) + "</b>"));
    mainEl.appendChild(el("p", "hint", esc(T("qJourneyHint"))));
    /* карта дня: добыта — открой и повтори; нет — веди в её эпоху */
    (function () {
      var dc = dailyCard();
      var bar = el("button", "daybar");
      var th = el("img"); th.src = cardImg(dc); th.alt = "";
      bar.appendChild(th);
      var tx = el("div", "tx");
      tx.appendChild(el("div", "dl", esc(T("dCard"))));
      tx.appendChild(el("div", "dn", collected(dc.id) ? esc(L(dc.name)) : "· · ·"));
      bar.appendChild(tx);
      if (prog.streak.n > 1)
        bar.appendChild(el("span", "dstreak", icoH("sun") + " " + prog.streak.n));
      bar.onclick = function () {
        if (collected(dc.id)) { openCard(dc.id); return; }
        if (eraUnlocked(dc.era)) { questEraId = dc.era; render(); return; }
        var era = byId(B.eras, dc.era);
        lockMsg.innerHTML = icoH("lock") + " " + esc(T("dInEra")) + ": " +
          icoH(ERA_ICON[dc.era]) + " " + esc(L(era.name));
      };
      mainEl.appendChild(bar);
    })();
    var path = el("div", "questpath");
    var lockMsg = el("p", "hint qlockmsg", "");
    for (var i = 0; i < B.eras.length; i++) (function (era, i2) {
      var pr = eraProgress(era.id);
      var open = eraUnlocked(era.id), done = !!prog.q.med[era.id];
      var st = el("button", "qst" + (i2 % 2 ? " right" : "") + (open ? "" : " lock") + (done ? " fin" : ""));
      st.style.borderColor = era.color;
      var em = el("div", "em", icoH(open ? ERA_ICON[era.id] : "lock", "ico-lg"));
      em.style.background = era.color;
      st.appendChild(em);
      var tx = el("div", "tx");
      tx.appendChild(el("div", "nm", esc(L(era.name))));
      tx.appendChild(el("div", "pr", done ? icoH("medal") + " " + esc(T("done")) : pr.done + " / " + pr.total));
      st.appendChild(tx);
      st.onclick = function () {
        if (!open) {
          lockMsg.innerHTML = icoH("lock") + " " + esc(T("qLockEra"));
          st.classList.add("shake");
          setTimeout(function () { st.classList.remove("shake"); }, 500);
          return;
        }
        questEraId = era.id; render();
      };
      path.appendChild(st);
    })(B.eras[i], i);
    /* супер-приз: все 7 медалей — станция-кубок в конце тропы */
    var allMed = true;
    for (var m1 = 0; m1 < B.eras.length; m1++) if (!prog.q.med[B.eras[m1].id]) allMed = false;
    if (allMed) {
      var gs = el("button", "qst grand" + (B.eras.length % 2 ? " right" : ""));
      var gem = el("div", "em", icoH("trophy", "ico-lg"));
      gem.style.background = "#ffd166";
      gs.appendChild(gem);
      var gtx = el("div", "tx");
      gtx.appendChild(el("div", "nm", esc(T("qGrand"))));
      gtx.appendChild(el("div", "pr", prog.q.grand ? icoH("trophy") + " " + esc(T("done")) : icoH("star") + " " + totalStars()));
      gs.appendChild(gtx);
      gs.onclick = function () { renderGrand(); };
      path.appendChild(gs);
    }
    mainEl.appendChild(path);
    mainEl.appendChild(lockMsg);
    var free = section(T("qFree"));
    free.appendChild(gamesHub());
    mainEl.appendChild(free);
  }

  /* супер-приз: грамота «Знаток великих историй» (текст рисуем поверх арта) */
  function renderGrand() {
    if (!prog.q.grand) { prog.q.grand = 1; saveProg(); }
    fanfare(true);
    mainEl.innerHTML = "";
    var top = el("div", "topbar gamewrap");
    var backB = el("button", "bt", "← " + esc(T("back")));
    backB.onclick = function () { render(); };
    top.appendChild(backB);
    top.appendChild(el("div", "sc", icoH("trophy") + " " + esc(T("qGrand"))));
    mainEl.appendChild(top);
    var dip = el("div", "diploma");
    var im = el("img"); im.src = "img/diploma.webp"; im.alt = "";
    dip.appendChild(im);
    var ov = el("div", "dtext");
    ov.appendChild(el("div", "dt1", esc(T("qGrandTitle"))));
    ov.appendChild(el("div", "dt2", icoH("star") + " " + totalStars() + " · " + icoH("cards") + " " +
      collectedCount() + "/" + (B.heroes.length + B.plots.length)));
    dip.appendChild(ov);
    mainEl.appendChild(dip);
    mainEl.appendChild(el("p", "hint dgrats", esc(T("qGrandText"))));
    var pr = el("button", "bigbtn dprint", esc(T("pPrint")));
    pr.onclick = function () { try { window.print(); } catch (e) {} };
    mainEl.appendChild(pr);
  }

  function renderEra(eid) {
    var era = byId(B.eras, eid);
    var steps = eraSteps(eid);
    var top = el("div", "topbar gamewrap");
    var backB = el("button", "bt", "← " + esc(T("back")));
    backB.onclick = function () { questEraId = null; render(); };
    top.appendChild(backB);
    top.appendChild(el("div", "sc", icoH(ERA_ICON[eid]) + " " + esc(L(era.name))));
    mainEl.appendChild(top);

    var cur = -1;
    for (var i = 0; i < steps.length; i++) if (!stepDone(steps[i])) { cur = i; break; }

    if (cur < 0) { /* вся эпоха пройдена — медаль */
      if (!prog.q.med[eid]) { prog.q.med[eid] = 1; saveProg(); fanfare(true); }
      var win = el("div", "eradone");
      win.appendChild(el("div", "medal", icoH("medal", "ico-xxl")));
      win.appendChild(el("div", "big", esc(T("qEraDone"))));
      win.appendChild(el("p", "hint", icoH(ERA_ICON[eid]) + " " + esc(L(era.name))));
      var onw = el("button", "bigbtn", esc(T("qOnward")) + " →");
      onw.onclick = function () { questEraId = null; render(); };
      win.appendChild(onw);
      mainEl.appendChild(win);
      return;
    }

    /* прогресс-точки эпохи */
    var dots = el("div", "qdots");
    for (var d = 0; d < steps.length; d++)
      dots.appendChild(el("span", "qd" + (stepDone(steps[d]) ? " on" : (d === cur ? " cur" : ""))));
    mainEl.appendChild(dots);
    mainEl.appendChild(el("p", "hint", esc(T("qTask")) + " " + (cur + 1) + " / " + steps.length));

    var stage = el("div", "qstage");
    mainEl.appendChild(stage);
    var s = steps[cur];
    if (s.t === "card") questChallenge(stage, s.c, cur, eid);
    else if (s.t === "build") questBuild(stage, s.key);
    else if (s.t === "map") questMap(stage, s.key);
    else questBook(stage, s.id);
  }

  /* бонус-шаг: пройди путь Исхода по карте прямо в квесте */
  function questMap(stage, key) {
    var m = B.maps[key];
    if (!m) { prog.q.bld["map_" + key] = 1; saveProg(); render(); return; }
    stage.appendChild(el("div", "qq", icoH("map") + " " + esc(T("qMapBonus"))));
    var box = el("div", "mapbox");
    var im = el("img"); im.src = m.bg; im.alt = "";
    box.appendChild(im);
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 100 150");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("class", "maproute");
    box.appendChild(svg);
    var reached = 1;
    var blurb = el("p", "mi-blurb qmapblurb");
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var dots = box.querySelectorAll(".mapdot");
      for (var d = dots.length - 1; d >= 0; d--) dots[d].parentNode.removeChild(dots[d]);
      for (var i = 0; i < reached; i++) {
        var p = m.points[i];
        if (i > 0) {
          var a = m.points[i - 1];
          var ln = document.createElementNS(svgNS, "line");
          ln.setAttribute("x1", a.x); ln.setAttribute("y1", a.y * 1.5);
          ln.setAttribute("x2", p.x); ln.setAttribute("y2", p.y * 1.5);
          ln.setAttribute("class", "seg");
          svg.appendChild(ln);
        }
        var dot = el("div", "mapdot" + (i === reached - 1 ? " last" : ""), String(i + 1));
        dot.style.left = p.x + "%"; dot.style.top = p.y + "%";
        box.appendChild(dot);
      }
      var cp = m.points[reached - 1];
      blurb.innerHTML = "<b>" + esc(L(cp.name)) + "</b> — " + esc(L(cp.blurb));
    }
    var next = el("button", "mapnext");
    function paintBtn() {
      if (reached >= m.points.length) {
        next.innerHTML = esc(T("done")) + " +" + icoH("star");
        next.classList.add("done");
        next.onclick = function () { prog.q.bld["map_" + key] = 1; saveProg(); fanfare(false); render(); };
      } else {
        next.innerHTML = esc(T("mapNext")) + " →";
        next.onclick = function () { reached++; draw(); paintBtn(); };
      }
    }
    draw(); paintBtn();
    stage.appendChild(box);
    stage.appendChild(blurb);
    stage.appendChild(next);
  }

  /* ── фанфары (WebAudio, офлайн, крошечные) ── */
  var fanfareCtx = null;
  function fanfare(big) {
    try {
      if (localStorage.getItem(NS + "_snd") === "0") return;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      fanfareCtx = fanfareCtx || new AC();
      var ctx = fanfareCtx, t0 = ctx.currentTime;
      var notes = big ? [523, 659, 784, 1047, 1319] : [659, 784, 1047];
      for (var i = 0; i < notes.length; i++) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "triangle"; o.frequency.value = notes[i];
        var t = t0 + i * (big ? 0.16 : 0.12);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + (big ? 0.5 : 0.3));
        o.connect(g); g.connect(ctx.destination);
        o.start(t); o.stop(t + (big ? 0.55 : 0.35));
      }
    } catch (e) {}
  }

  /* ── универсальные механики (живут в «Свободной игре») ──
     каждая: mech(stage, card, done), done(perfect) зовётся при победе */
  function mechPuzzle(stage, c, done) {
    stage.appendChild(el("div", "qq", icoH("puzzle") + " " + esc(T("qPuzzle"))));
    stage.appendChild(el("p", "hint", esc(T("qPuzzleHint"))));
    /* Аналог из “птицы мира”: пазл 3×3 (9 плиток) — тап по двум плиткам меняет их местами */
    var N = 3;
    var order = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    /* если сразу попали в решение — делаем один обмен, чтобы игра была интересной */
    if (order.every(function (v, i) { return v === i; })) order = [1, 0, 2, 3, 4, 5, 6, 7, 8];
    var grid = el("div", "pzgrid");
    var sel = -1, tiles = [], swaps = 0;
    function paint() {
      for (var i = 0; i < 9; i++) {
        var pc = order[i];
        tiles[i].style.backgroundPosition =
          (pc % N) * 50 + "% " + Math.floor(pc / N) * 50 + "%";
        tiles[i].setAttribute("data-piece", pc);
        tiles[i].className = "pz" + (sel === i ? " sel" : "");
      }
    }
    function solved() {
      for (var i = 0; i < 9; i++) if (order[i] !== i) return false;
      return true;
    }
    for (var i2 = 0; i2 < 9; i2++) (function (slot) {
      var tl = el("button", "pz");
      tl.style.backgroundImage = "url('" + cardImg(c) + "')";
      tl.setAttribute("data-slot", slot);
      tl.onclick = function () {
        if (sel < 0) { sel = slot; paint(); return; }
        if (sel === slot) { sel = -1; paint(); return; }
        var tmp = order[sel]; order[sel] = order[slot]; order[slot] = tmp;
        sel = -1; swaps++;
        paint();
        if (solved()) {
          grid.classList.add("win");
          setTimeout(function () { done(swaps <= 12); }, 700);
        }
      };
      tiles.push(tl); grid.appendChild(tl);
    })(i2);
    paint();
    stage.appendChild(grid);
  }
  function mechFind(stage, c, done) {
    stage.appendChild(el("div", "qq", icoH("magnifier") + " " + esc(T("qFindOn")) + " " + esc(L(c.findIt))));
    var fb = el("div", "findbox");
    var fim = el("img"); fim.src = cardImg(c); fim.alt = "";
    fb.appendChild(fim);
    var hintRing = null, miss = 0;
    fb.onclick = function (e) {
      var r = fb.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width * 100;
      var py = (e.clientY - r.top) / r.height * 100;
      var dx = px - c.findAt.x, dy = (py - c.findAt.y) * 0.67; /* поле 2:3 */
      var hit = Math.sqrt(dx * dx + dy * dy) <= c.findAt.r * 1.35;
      var m = el("div", hit ? "fhit" : "fmiss", hit ? "✔" : "✗");
      m.style.left = px + "%"; m.style.top = py + "%";
      fb.appendChild(m);
      if (hit) { fb.onclick = null; setTimeout(function () { done(miss === 0); }, 700); return; }
      miss++;
      setTimeout(function () { if (m.parentNode) m.parentNode.removeChild(m); }, 700);
      if (miss >= 3 && !hintRing) { /* после трёх промахов — подсказка */
        hintRing = el("div", "fring");
        hintRing.style.left = c.findAt.x + "%";
        hintRing.style.top = c.findAt.y + "%";
        hintRing.style.width = c.findAt.r * 2.7 + "%";
        fb.appendChild(hintRing);
      }
    };
    stage.appendChild(fb);
  }
  function mechWord(stage, c, done) {
    stage.appendChild(el("div", "qq", icoH("blocks") + " " + esc(T("qWordGame"))));
    var im3 = el("img", "qface"); im3.src = cardImg(c); im3.alt = "";
    stage.appendChild(im3);
    var word = L(c.name).toUpperCase();
    var slots = el("div", "wslots");
    for (var s1 = 0; s1 < word.length; s1++) slots.appendChild(el("span", "ws", "·"));
    stage.appendChild(slots);
    var pos = 0, miss = 0;
    var chips = el("div", "wchips");
    var letters = shuffle(word.split(""));
    for (var l1 = 0; l1 < letters.length; l1++) (function (ch) {
      var b = el("button", "wch", esc(ch));
      b.setAttribute("data-ch", ch);
      b.onclick = function () {
        if (b.disabled) return;
        if (ch === word.charAt(pos)) {
          slots.childNodes[pos].textContent = ch;
          slots.childNodes[pos].className = "ws on";
          b.disabled = true; b.classList.add("used");
          pos++;
          if (pos === word.length) setTimeout(function () { done(miss === 0); }, 500);
        } else {
          miss++;
          b.classList.add("shake");
          setTimeout(function () { b.classList.remove("shake"); }, 450);
        }
      };
      chips.appendChild(b);
    })(letters[l1]);
    stage.appendChild(chips);
  }
  function mechListen(stage, c, done) {
    stage.appendChild(el("div", "qq", icoH("headphones") + " " + esc(T("qListen"))));
    var audioBar = el("div", "audio qlisten");
    var pb = el("button", "pl", "▶");
    var src = "audio/" + lang + "/" + c.id + "_" + c.slug + ".mp3";
    pb.onclick = function () { toggleCardAudio(pb, src); };
    audioBar.appendChild(pb);
    stage.appendChild(audioBar);
    var isHero = c.id.indexOf("heroes") === 0;
    var list3 = isHero ? B.heroes : B.plots;
    var pool4 = [], miss = 0;
    for (var p4 = 0; p4 < list3.length; p4++) if (list3[p4].id !== c.id) pool4.push(list3[p4]);
    var opts4 = shuffle(pool4).slice(0, 2); opts4.push(c); opts4 = shuffle(opts4);
    var row4 = el("div", "artrow");
    for (var k4 = 0; k4 < opts4.length; k4++) (function (x) {
      var b = el("button", "opt");
      b.setAttribute("data-id", x.id);
      var xi = el("img"); xi.src = cardImg(x); xi.alt = "";
      b.appendChild(xi);
      b.appendChild(el("span", "nm", esc(L(x.name))));
      b.onclick = function () {
        if (x.id === c.id) {
          b.classList.add("ok"); stopCardAudio();
          setTimeout(function () { done(miss === 0); }, 600);
        } else { miss++; b.classList.add("no"); b.disabled = true; }
      };
      row4.appendChild(b);
    })(opts4[k4]);
    stage.appendChild(row4);
  }
  function mechShadow(stage, c, done) {
    stage.appendChild(el("div", "qq", icoH("cloud") + " " + esc(T("qShadow"))));
    var sim = el("img", "qface shadow"); sim.src = cardImg(c); sim.alt = "";
    stage.appendChild(sim);
    var pool5 = [], miss = 0;
    for (var p5 = 0; p5 < B.heroes.length; p5++) if (B.heroes[p5].id !== c.id) pool5.push(B.heroes[p5]);
    var opts5 = shuffle(pool5).slice(0, 2); opts5.push(c); opts5 = shuffle(opts5);
    var box5 = el("div", "qopts");
    for (var o5 = 0; o5 < opts5.length; o5++) (function (x) {
      var b = el("button", "opt", esc(L(x.name)));
      b.onclick = function () {
        if (x.id === c.id) {
          b.classList.add("ok");
          sim.classList.remove("shadow"); /* герой выходит из тумана */
          setTimeout(function () { done(miss === 0); }, 900);
        } else { miss++; b.classList.add("no"); b.disabled = true; }
      };
      box5.appendChild(b);
    })(opts5[o5]);
    stage.appendChild(box5);
  }

  /* ── АВТОРСКИЕ СЮЖЕТНЫЕ ИГРЫ: механика повторяет смысл истории ── */

  /* Дни творения: разложи, что в какой день появилось */
  /* авторские сюжетные игры тома подключаются из sims.js через фабрику;
     K — API движка для сцен (см. docs/product-quest.md) */
  var QuestAPI = { el: el, esc: esc, T: T, icoH: icoH, fanfare: fanfare,
    shuffle: shuffle, byId: byId, cardImg: cardImg, B: B, lang: function () { return lang; } };
  var QUEST_SIMS = window.QUEST_SIMS_FACTORY ? window.QUEST_SIMS_FACTORY(QuestAPI) : {};

  /* ── ТРЕНИРОВКА КАРТЫ: дрилим грань карты (одно задание навыка) ──
     done(ok): ok=true если ответ верный. Переиспользует механики движка. */
  function drillSkill(stage, c, skill, done) {
    var isHero = c.id.indexOf("heroes") === 0;
    function opt3(items, isRight, fmt) {
      var box = el("div", fmt === "img" ? "artrow" : "qopts");
      for (var i = 0; i < items.length; i++) (function (x) {
        var b = el("button", "opt");
        if (fmt === "img") {
          var im = el("img"); im.src = cardImg(x); im.alt = "";
          b.appendChild(im); b.appendChild(el("span", "nm", esc(L(x.name))));
        } else b.innerHTML = esc(fmt === "era" ? L(x.name) : String(x));
        b.onclick = function () {
          if (isRight(x)) { b.classList.add("ok"); setTimeout(function () { done(true); }, 600); }
          else { b.classList.add("no"); b.disabled = true; done(false); }
        };
        box.appendChild(b);
      })(items[i]);
      return box;
    }
    if (skill === "name") {
      stage.appendChild(el("div", "qq", esc(T(isHero ? "qWho" : "qStory"))));
      var im = el("img", "qface"); im.src = cardImg(c); im.alt = ""; stage.appendChild(im);
      var list = isHero ? B.heroes : B.plots, pool = [];
      for (var i = 0; i < list.length; i++) if (list[i].id !== c.id) pool.push(list[i]);
      var opts = shuffle(shuffle(pool).slice(0, 2).concat([c]));
      stage.appendChild(opt3(opts, function (x) { return x.id === c.id; }, "era"));
    } else if (skill === "era") {
      stage.appendChild(el("div", "qq", esc(T("skEraQ"))));
      var im2 = el("img", "qface"); im2.src = cardImg(c); im2.alt = ""; stage.appendChild(im2);
      var epool = [];
      for (var e = 0; e < B.eras.length; e++) if (B.eras[e].id !== c.era) epool.push(B.eras[e]);
      var eopts = shuffle(shuffle(epool).slice(0, 2).concat([byId(B.eras, c.era)]));
      stage.appendChild(opt3(eopts, function (x) { return x.id === c.era; }, "era"));
    } else if (skill === "digit") {
      stage.appendChild(el("div", "qq", esc(T("qDigit"))));
      stage.appendChild(el("div", "qdigit", "<b>?</b> " + esc(L(c.digit.label))));
      var nums = [c.digit.num], all = B.heroes.concat(B.plots), cand = shuffle(all.slice());
      for (var n = 0; n < cand.length && nums.length < 3; n++) {
        var v = cand[n].digit && cand[n].digit.num;
        if (v != null && idx(nums, v) < 0) nums.push(v);
      }
      var nb = opt3(shuffle(nums), function (x) { return String(x) === String(c.digit.num); }, "num");
      nb.className = "qopts qnums"; stage.appendChild(nb);
    } else if (skill === "pair") {
      stage.appendChild(el("div", "qq", esc(T("qPair"))));
      var im3 = el("img", "qface"); im3.src = cardImg(c); im3.alt = ""; stage.appendChild(im3);
      stage.appendChild(el("p", "hint", esc(L(c.name))));
      var mate = findCard(c.pair), oList = isHero ? B.plots : B.heroes, pool2 = [];
      for (var j = 0; j < oList.length; j++) if (oList[j].id !== mate.id) pool2.push(oList[j]);
      var opts2 = shuffle(shuffle(pool2).slice(0, 2).concat([mate]));
      stage.appendChild(opt3(opts2, function (x) { return x.id === mate.id; }, "img"));
    } else if (skill === "find") {
      mechFind(stage, c, function (perfect) { done(true); });
    } else if (skill === "listen") {
      mechListen(stage, c, function (perfect) { done(true); });
    }
  }
  /* экран «Тренировка карты»: точки-грани + прогон непройденных навыков */
  var drillCard = null;
  function renderDrill(c) {
    mainEl.innerHTML = "";
    var top = el("div", "topbar gamewrap");
    var backB = el("button", "bt", "← " + esc(T("back")));
    backB.onclick = function () { drillCard = null; tab = "heroes"; if (c.id.indexOf("plots") === 0) tab = "plots"; render(); };
    top.appendChild(backB);
    top.appendChild(el("div", "sc", esc(L(c.name))));
    mainEl.appendChild(top);

    var skills = skillsFor(c);
    var dots = el("div", "skdots big");
    for (var d = 0; d < skills.length; d++) {
      var on = skPassed(c.id)[skills[d]];
      var chip = el("span", "skdot" + (on ? " on" : ""));
      chip.appendChild(el("i", null, icoH(SKILL_ICON[skills[d]])));
      chip.appendChild(el("b", null, esc(T("sk" + skills[d].charAt(0).toUpperCase() + skills[d].slice(1)))));
      dots.appendChild(chip);
    }
    mainEl.appendChild(dots);

    /* первый непройденный навык */
    var next = null;
    for (var s = 0; s < skills.length; s++) if (!skPassed(c.id)[skills[s]]) { next = skills[s]; break; }
    if (!next) {
      var win = el("div", "eradone");
      win.appendChild(el("div", "medal", icoH("trophy", "ico-xxl")));
      win.appendChild(el("div", "big", esc(T("mastered"))));
      win.appendChild(el("p", "hint", esc(T("trainDone"))));
      var ob = el("button", "bt", icoH("cards") + " " + esc(T("openCardBtn")));
      ob.onclick = function () { openCard(c.id); };
      win.appendChild(ob);
      mainEl.appendChild(win);
      return;
    }
    var stage = el("div", "qstage");
    mainEl.appendChild(stage);
    drillSkill(stage, c, next, function (okAns) {
      if (okAns) {
        passSkill(c.id, next);
        fanfare(masteredCard(c));
        setTimeout(function () { renderDrill(c); }, masteredCard(c) ? 400 : 500);
      }
    });
  }

  /* задание по карте: у флагманских сюжетов — авторская игра, где механика
     повторяет смысл истории (QUEST_SIMS); остальным картам пока простое
     задание (кто это / число / пара / чья вещь) — заменим авторскими по мере
     производства. Универсальные механики живут в «Свободной игре». */
  function questChallenge(stage, c, seed, eid) {
    var isHero = c.id.indexOf("heroes") === 0;
    var art = null;
    if (isHero) for (var a = 0; a < B.artifacts.length; a++)
      if (B.artifacts[a].hero === c.id) { art = B.artifacts[a]; break; }
    var types = ["who", "digit", "pair", "art"], avail = [];
    for (var t = 0; t < types.length; t++) {
      var ty = types[t];
      if (ty === "pair" && !c.pair) continue;
      if (ty === "art" && !art) continue;
      avail.push(ty);
    }
    var num = parseInt(c.id.replace(/\D/g, ""), 10) || 0;
    var type = avail[(2 * num + seed) % avail.length], tries = 0;
    var winFired = false;

    function win() {
      if (winFired) return; /* двойной тап по верному ответу — одна награда */
      winFired = true;
      stopCardAudio();
      var stars = tries === 0 ? 2 : 1;
      if (!(prog.q.col[c.id] >= stars)) prog.q.col[c.id] = stars;
      pushLog(c.id, stars);
      /* добыча в квесте зажигает грань, которую отрабатывало задание */
      var SKMAP = { who: "name", digit: "digit", pair: "pair", art: "name" };
      passSkill(c.id, QUEST_SIMS[c.id] ? "name" : (SKMAP[type] || "name"));
      saveProg();
      /* если ребёнок уже ушёл с экрана (Назад) — засчитать тихо, без попапа */
      if (!stage.parentNode) return;
      fanfare(false);
      questReward(c, stars, eid);
    }
    function optBtn(b, ok) {
      b.onclick = function () {
        if (ok) { b.classList.add("ok"); setTimeout(win, 600); }
        else { tries++; b.classList.add("no"); b.disabled = true; }
      };
      return b;
    }

    if (QUEST_SIMS[c.id]) { /* авторская сюжетная игра: механика = смысл */
      QUEST_SIMS[c.id](stage, function (perfect) { tries = perfect ? 0 : 1; win(); });
      return;
    }
    if (type === "who") {
      stage.appendChild(el("div", "qq", esc(T(isHero ? "qWho" : "qStory"))));
      var im = el("img", "qface"); im.src = cardImg(c); im.alt = "";
      stage.appendChild(im);
      var list = isHero ? B.heroes : B.plots;
      var pool = [];
      for (var i = 0; i < list.length; i++) if (list[i].id !== c.id) pool.push(list[i]);
      var opts = shuffle(pool).slice(0, 2); opts.push(c); opts = shuffle(opts);
      var box = el("div", "qopts");
      for (var o = 0; o < opts.length; o++)
        box.appendChild(optBtn(el("button", "opt", esc(L(opts[o].name))), opts[o].id === c.id));
      stage.appendChild(box);
    } else if (type === "digit") {
      stage.appendChild(el("div", "qq", esc(T("qDigit"))));
      stage.appendChild(el("div", "qdigit", "<b>?</b> " + esc(L(c.digit.label))));
      var nums = [c.digit.num], all = B.heroes.concat(B.plots);
      var cand = shuffle(all.slice());
      for (var n = 0; n < cand.length && nums.length < 3; n++) {
        var v = cand[n].digit && cand[n].digit.num;
        if (v != null && idx(nums, v) < 0) nums.push(v);
      }
      nums = shuffle(nums);
      var nbox = el("div", "qopts qnums");
      for (var m = 0; m < nums.length; m++)
        nbox.appendChild(optBtn(el("button", "opt", esc(String(nums[m]))), String(nums[m]) === String(c.digit.num)));
      stage.appendChild(nbox);
    } else if (type === "pair") {
      stage.appendChild(el("div", "qq", esc(T("qPair"))));
      var im2 = el("img", "qface"); im2.src = cardImg(c); im2.alt = "";
      stage.appendChild(im2);
      stage.appendChild(el("p", "hint", esc(L(c.name))));
      var mate = findCard(c.pair);
      var oList = isHero ? B.plots : B.heroes;
      var pool2 = [];
      for (var j = 0; j < oList.length; j++) if (oList[j].id !== mate.id) pool2.push(oList[j]);
      var opts2 = shuffle(pool2).slice(0, 2); opts2.push(mate); opts2 = shuffle(opts2);
      var row = el("div", "artrow");
      for (var k = 0; k < opts2.length; k++) (function (x) {
        var b = el("button", "opt");
        var xi = el("img"); xi.src = cardImg(x); xi.alt = "";
        b.appendChild(xi);
        b.appendChild(el("span", "nm", esc(L(x.name))));
        row.appendChild(optBtn(b, x.id === mate.id));
      })(opts2[k]);
      stage.appendChild(row);
    } else { /* art — чья вещь */
      stage.appendChild(el("div", "qq", esc(T("gArtifact"))));
      stage.appendChild(el("div", "qdigit", art.emoji + " " + esc(L(art.name))));
      var pool3 = [];
      for (var h = 0; h < B.heroes.length; h++) if (B.heroes[h].id !== c.id) pool3.push(B.heroes[h]);
      var opts3 = shuffle(pool3).slice(0, 2); opts3.push(c); opts3 = shuffle(opts3);
      var row3 = el("div", "artrow");
      for (var r = 0; r < opts3.length; r++) (function (x) {
        var b = el("button", "opt");
        var xi = el("img"); xi.src = heroImg(x); xi.alt = "";
        b.appendChild(xi);
        b.appendChild(el("span", "nm", esc(L(x.name))));
        row3.appendChild(optBtn(b, x.id === c.id));
      })(opts3[r]);
      stage.appendChild(row3);
    }
  }

  /* награда: карта добыта — постер, звёзды, посмотреть или дальше */
  function questReward(c, stars, eid) {
    var ov = el("div"); ov.id = "cardview";
    var box = el("div", "lockbox reward");
    box.appendChild(el("div", "big", esc(T("qGot"))));
    box.appendChild(el("div", "stars", stars === 2 ? icoH("star", "ico-xl") + icoH("star", "ico-xl") : icoH("star", "ico-xl")));
    var im = el("img", "rface"); im.src = faceImg(c); im.alt = "";
    box.appendChild(im);
    box.appendChild(el("p", "hint", esc(L(c.name))));
    var look = el("button", "bt", icoH("cards") + " " + esc(T("openCardBtn")));
    look.onclick = function () { if (ov.parentNode) ov.parentNode.removeChild(ov); openCard(c.id); };
    var next = el("button", "bigbtn", esc(T("qNext")) + " →");
    next.onclick = function () { unmountOverlay(ov); render(); };
    var btns = el("div", "rbtns");
    btns.appendChild(look); btns.appendChild(next);
    box.appendChild(btns);
    ov.appendChild(box);
    mountOverlay(ov);
  }

  /* бонус-шаг: стройка внутри квеста (этапы листа 2×2) */
  function questBuild(stage, key) {
    var o = byId(B.reconstructor, key);
    if (!o) { prog.q.bld[key] = 1; saveProg(); render(); return; }
    var n = 0;
    stage.appendChild(el("div", "qq", icoH("hammer") + " " + esc(T("qBonus")) + " " + esc(L(o.name))));
    var im = el("img", "buildimg");
    var cap = el("p", "buildcap");
    var cnt = el("div", "buildcount");
    var next = el("button", "mapnext");
    function show() {
      im.src = o.stages[n].img;
      cap.textContent = L(o.stages[n].caption);
      cnt.textContent = (n + 1) + " / " + o.stages.length;
      if (n === o.stages.length - 1) {
        next.innerHTML = esc(L(o.done)) + " +" + icoH("star");
        next.classList.add("done");
        next.onclick = function () { prog.q.bld[key] = 1; saveProg(); render(); };
      } else {
        next.innerHTML = icoH("hammer") + " " + esc(T("buildNext")) + " →";
        next.onclick = function () { n++; show(); };
      }
    }
    show();
    stage.appendChild(cnt); stage.appendChild(im); stage.appendChild(cap); stage.appendChild(next);
  }

  /* бонус-шаг: наградная книга (эпоха Рождества) */
  function questBook(stage, id) {
    var bk = byId(B.books, id);
    stage.appendChild(el("div", "qq", icoH("book") + " " + esc(T("qBonusBook"))));
    if (bk) {
      var im = el("img", "rface"); im.src = bk.cover; im.alt = "";
      stage.appendChild(im);
      stage.appendChild(el("p", "hint", esc(L(bk.title))));
      var open = el("button", "bigbtn", icoH("book") + " " + esc(T("gBook")));
      open.onclick = function () {
        prog.q.bld["book_" + id] = 1; saveProg();
        openBook(bk);
      };
      stage.appendChild(open);
    }
    var skip = el("button", "bt qskip", esc(T("qNext")) + " →");
    skip.onclick = function () { prog.q.bld["book_" + id] = 1; saveProg(); render(); };
    stage.appendChild(skip);
  }

  function gameShell(title, hint) {
    mainEl.innerHTML = "";
    var w = el("div", "gamewrap");
    var top = el("div", "topbar");
    var backB = el("button", "bt", "← " + esc(T("back")));
    backB.onclick = function () { render(); };
    top.appendChild(backB);
    top.appendChild(el("div", "sc", esc(title)));
    w.appendChild(top);
    w.appendChild(el("p", "hint", esc(hint)));
    mainEl.appendChild(w);
    return w;
  }
  function saveBest(game, score) {
    var g = prog.games[game] || {};
    if (!(g.best >= score)) g.best = score;
    g.plays = (g.plays || 0) + 1;
    prog.games[game] = g; saveProg();
  }

  /* Мемори: пары герой ↔ его сюжет */
  function gameMemory() {
    var w = gameShell(T("gMemory"), T("gMemoryHint"));
    var paired = [];
    for (var i = 0; i < B.heroes.length; i++) if (B.heroes[i].pair) paired.push(B.heroes[i]);
    var picks = shuffle(paired).slice(0, 6);
    var cards = [];
    for (var p = 0; p < picks.length; p++) {
      var plot = byId(B.plots, picks[p].pair);
      cards.push({ key: picks[p].id, card: picks[p] });
      cards.push({ key: picks[p].id, card: plot });
    }
    cards = shuffle(cards);
    var g = el("div", "memgrid");
    var open = [], lock = false, matched = 0;
    function make(item) {
      var b = el("button", "memcard");
      var inner = el("div", "inner");
      if (hasImg(item.card)) {
        var im = el("img"); im.src = cardImg(item.card); im.alt = "";
        inner.appendChild(im);
        inner.appendChild(el("span", "nm", esc(L(item.card.name))));
      } else {
        inner.appendChild(el("div", "em", icoH("book", "ico-lg")));
        inner.appendChild(el("span", "nm", esc(L(item.card.name))));
      }
      b.appendChild(inner);
      b.appendChild(el("div", "shirt", icoH("star", "ico-lg")));
      b.onclick = function () {
        if (lock || b.className.indexOf("open") >= 0 || b.className.indexOf("matched") >= 0) return;
        b.classList.add("open");
        open.push({ el: b, key: item.key });
        if (open.length === 2) {
          lock = true;
          setTimeout(function () {
            if (open[0].key === open[1].key) {
              open[0].el.classList.add("matched"); open[1].el.classList.add("matched");
              matched++;
              if (matched === picks.length) {
                saveBest("memory", matched);
                w.appendChild(el("p", "hint", icoH("star") + " " + esc(T("done"))));
              }
            }
            open[0].el.classList.remove("open"); open[1].el.classList.remove("open");
            open = []; lock = false;
          }, open[0].key === open[1].key ? 350 : 850);
        }
      };
      return b;
    }
    for (var c = 0; c < cards.length; c++) g.appendChild(make(cards[c]));
    w.appendChild(g);
  }

  /* Квиз: вопросы генерируются из эпитетов и фактов героев */
  function gameQuiz() {
    var w = gameShell(T("gQuiz"), T("gQuizHint"));
    var ROUNDS = 8, round = 0, score = 0;
    var box = el("div"); w.appendChild(box);
    function names3(right) {
      var pool = [];
      for (var i = 0; i < B.heroes.length; i++) if (B.heroes[i].id !== right.id) pool.push(B.heroes[i]);
      var opts = shuffle(pool).slice(0, 2); opts.push(right);
      return shuffle(opts);
    }
    function next() {
      box.innerHTML = "";
      if (round >= ROUNDS) {
        saveBest("quiz", score);
        box.appendChild(el("div", "qbox", icoH("star") + " " + esc(T("done")) + " · " + esc(T("score")) + ": " + score + " / " + ROUNDS));
        var ag = el("button", "bigbtn", esc(T("again")));
        ag.onclick = gameQuiz;
        box.appendChild(ag);
        return;
      }
      round++;
      var hero = B.heroes[Math.floor(Math.random() * B.heroes.length)];
      var q;
      if (Math.random() < 0.5) q = T("whoIs") + " «" + L(hero.epithet) + "»";
      else { var fs = L(hero.facts); q = fs[Math.floor(Math.random() * fs.length)]; }
      var qb = el("div", "qbox");
      qb.appendChild(el("div", "qq", esc(q)));
      box.appendChild(qb);
      box.appendChild(el("p", "hint", esc(T("score")) + ": " + score + " · " + round + "/" + ROUNDS));
      var opts = el("div", "qopts");
      var choices = names3(hero);
      for (var o = 0; o < choices.length; o++) (function (ch) {
        var b = el("button", "opt", esc(L(ch.name)));
        b.onclick = function () {
          var all = opts.childNodes;
          for (var k = 0; k < all.length; k++) all[k].disabled = true;
          if (ch.id === hero.id) { b.classList.add("ok"); score++; }
          else {
            b.classList.add("no");
            for (var m = 0; m < all.length; m++) if (all[m].textContent === L(hero.name)) all[m].classList.add("ok");
          }
          setTimeout(next, 900);
        };
        opts.appendChild(b);
      })(choices[o]);
      box.appendChild(opts);
    }
    next();
  }

  /* Чья вещь?: предмет → герой (варианты — портреты) */
  function gameArtifact() {
    var w = gameShell(T("gArtifact"), T("gArtifactHint"));
    var seq = shuffle(B.artifacts).slice(0, 8);
    var round = 0, score = 0;
    var box = el("div"); w.appendChild(box);
    function next() {
      box.innerHTML = "";
      if (round >= seq.length) {
        saveBest("artifact", score);
        box.appendChild(el("div", "qbox", icoH("star") + " " + esc(T("done")) + " · " + esc(T("score")) + ": " + score + " / " + seq.length));
        var ag = el("button", "bigbtn", esc(T("again")));
        ag.onclick = gameArtifact;
        box.appendChild(ag);
        return;
      }
      var art = seq[round]; round++;
      var right = byId(B.heroes, art.hero);
      var qb = el("div", "qbox");
      qb.appendChild(el("div", "qq", art.emoji + " " + esc(L(art.name))));
      box.appendChild(qb);
      box.appendChild(el("p", "hint", esc(T("score")) + ": " + score + " · " + round + "/" + seq.length));
      var pool = [];
      for (var i = 0; i < B.heroes.length; i++) if (B.heroes[i].id !== right.id) pool.push(B.heroes[i]);
      var choices = shuffle(pool).slice(0, 2); choices.push(right); choices = shuffle(choices);
      var row = el("div", "artrow");
      for (var o = 0; o < choices.length; o++) (function (ch) {
        var b = el("button", "opt");
        var im = el("img"); im.src = heroImg(ch); im.alt = "";
        b.appendChild(im);
        b.appendChild(el("span", "nm", esc(L(ch.name))));
        b.onclick = function () {
          var all = row.childNodes;
          for (var k = 0; k < all.length; k++) all[k].disabled = true;
          if (ch.id === right.id) { b.classList.add("ok"); score++; }
          else { b.classList.add("no"); }
          setTimeout(next, 900);
        };
        row.appendChild(b);
      })(choices[o]);
      box.appendChild(row);
    }
    next();
  }

  /* Порядок событий: 6 сюжетов из разных эпох — нажимай от раннего к позднему */
  function gameOrder() {
    var w = gameShell(T("gOrder"), T("gOrderHint"));
    var byEra = {};
    for (var i = 0; i < B.plots.length; i++) {
      var e = B.plots[i].era;
      (byEra[e] = byEra[e] || []).push(B.plots[i]);
    }
    var eras = [1, 2, 3, 4, 5, 6, 7], chosen = [];
    for (var k = 0; k < eras.length; k++) if (byEra[eras[k]]) {
      var list = byEra[eras[k]];
      chosen.push(list[Math.floor(Math.random() * list.length)]);
    }
    chosen = chosen.slice(0, 6);
    var expected = 0;
    var lst = el("div", "ordlist");
    var items = shuffle(chosen);
    for (var n = 0; n < items.length; n++) (function (p) {
      var b = el("button", "opt");
      var num = el("span", "num", "");
      b.appendChild(num);
      b.appendChild(el("span", "em", icoH("book")));
      b.appendChild(el("span", null, esc(L(p.name))));
      b.onclick = function () {
        if (b.className.indexOf("placed") >= 0) return;
        var pos = -1;
        for (var q = 0; q < chosen.length; q++) if (chosen[q].id === p.id) pos = q;
        if (pos === expected) {
          expected++;
          num.textContent = String(expected);
          b.classList.add("placed");
          if (expected === chosen.length) {
            saveBest("order", chosen.length);
            w.appendChild(el("p", "hint", icoH("star") + " " + esc(T("done"))));
          }
        } else {
          b.classList.add("shake");
          setTimeout(function () { b.classList.remove("shake"); }, 500);
        }
      };
      lst.appendChild(b);
    })(items[n]);
    w.appendChild(lst);
  }

  /* ── карты мира: Путь Исхода (анимированный маршрут) и Библейский мир ── */
  var mapKind = "exodus";
  function renderMaps() {
    var m = B.maps[mapKind];
    var sw = el("div", "mapswitch");
    ["exodus", "world"].forEach(function (k) {
      var b = el("button", "chip" + (k === mapKind ? " here" : ""), esc(L(B.maps[k].title)));
      b.onclick = function () { mapKind = k; render(); };
      sw.appendChild(b);
    });
    mainEl.appendChild(sw);
    mainEl.appendChild(el("p", "hint", esc(L(m.sub))));

    var box = el("div", "mapbox");
    var im = el("img"); im.src = m.bg; im.alt = esc(L(m.title));
    box.appendChild(im);

    var reached = (mapKind === "exodus") ? 1 : m.points.length; /* Исход открывается поэтапно */
    var info = el("div", "mapinfo");
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 100 150");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("class", "maproute");
    box.appendChild(svg);

    var dots = [];
    function drawRoute() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      if (mapKind !== "exodus") return;
      for (var i = 1; i < reached; i++) {
        var a = m.points[i - 1], b2 = m.points[i];
        var ln = document.createElementNS(svgNS, "line");
        ln.setAttribute("x1", a.x); ln.setAttribute("y1", a.y * 1.5);
        ln.setAttribute("x2", b2.x); ln.setAttribute("y2", b2.y * 1.5);
        ln.setAttribute("class", "seg");
        svg.appendChild(ln);
      }
    }
    function showPoint(p, dot) {
      for (var d = 0; d < dots.length; d++) dots[d].classList.remove("act");
      dot.classList.add("act");
      info.innerHTML = "";
      info.appendChild(el("div", "mi-name", esc(L(p.name))));
      info.appendChild(el("div", "mi-blurb", esc(L(p.blurb))));
      if (p.card) {
        var ob = el("button", "mi-open", icoH("cards") + " " + esc(T("openCardBtn")));
        ob.onclick = function () { openCard(p.card); };
        info.appendChild(ob);
      }
    }
    function drawDots() {
      for (var d = 0; d < dots.length; d++) if (dots[d].parentNode) dots[d].parentNode.removeChild(dots[d]);
      dots = [];
      for (var i = 0; i < m.points.length; i++) (function (p, i2) {
        if (mapKind === "exodus" && i2 >= reached) return;
        var dot = el("button", "mapdot" + (i2 === reached - 1 && mapKind === "exodus" ? " last" : ""),
          String(i2 + 1));
        dot.style.left = p.x + "%"; dot.style.top = p.y + "%";
        dot.onclick = function () { showPoint(p, dot); };
        box.appendChild(dot);
        dots.push(dot);
      })(m.points[i], i);
    }
    drawRoute(); drawDots();
    mainEl.appendChild(box);
    if (mapKind === "exodus") {
      var next = el("button", "mapnext", esc(T("mapNext")) + " →");
      next.onclick = function () {
        if (reached < m.points.length) {
          reached++;
          drawRoute(); drawDots();
          showPoint(m.points[reached - 1], dots[dots.length - 1]);
          if (reached === m.points.length) next.hidden = true;
        }
      };
      mainEl.appendChild(next);
    }
    mainEl.appendChild(info);
    showPoint(m.points[0], dots[0]);
  }

  /* ── реконструктор «Стройка»: пошаговая сборка 4 объектов ── */
  var buildObj = null;
  function renderBuild() {
    if (!buildObj) {
      mainEl.appendChild(el("p", "hint", esc(T("tapTile"))));
      var hub = el("div", "gamehub");
      for (var i = 0; i < B.reconstructor.length; i++) (function (o) {
        var b = el("button", "gbtn buildpick");
        /* иллюстрация готовой постройки вместо эмодзи — красивое меню без эмодзи */
        var fin = o.stages && o.stages.length ? o.stages[o.stages.length - 1].img : null;
        if (fin) { var bi = el("img", "gbtnimg"); bi.src = fin; bi.alt = esc(L(o.name)); bi.loading = "lazy"; b.appendChild(bi); }
        else b.appendChild(el("div", "em", icoH(o.icon || "blocks", "ico-lg")));
        b.appendChild(el("div", "nm", esc(L(o.name))));
        b.onclick = function () { buildObj = o; render(); };
        hub.appendChild(b);
      })(B.reconstructor[i]);
      mainEl.appendChild(hub);
      return;
    }
    var o = buildObj, stage = 0;
    mainEl.classList.add("buildmode");
    var stageWrap = el("div", "buildstage");
    var top = el("div", "topbar gamewrap");
    var backB = el("button", "bt", "← " + esc(T("back")));
    backB.onclick = function () { buildObj = null; render(); };
    top.appendChild(backB);
    top.appendChild(el("div", "sc", esc(L(o.name))));
    stageWrap.appendChild(top);

    var media = el("div", "buildmedia");
    var frame = el("div", "buildmedia-frame");
    var im = el("img", "buildimg");
    frame.appendChild(im);
    media.appendChild(frame);
    stageWrap.appendChild(media);

    var foot = el("div", "buildfoot");
    var cap = el("p", "buildcap");
    var counterEl = el("div", "buildcount");
    var next = el("button", "mapnext");
    function show() {
      im.src = o.stages[stage].img;
      cap.textContent = L(o.stages[stage].caption);
      counterEl.textContent = (stage + 1) + " / " + o.stages.length;
      if (stage === o.stages.length - 1) {
        next.innerHTML = icoH("medal") + " " + esc(L(o.done));
        next.classList.add("done");
        next.onclick = function () { buildObj = null; render(); };
      } else {
        next.innerHTML = icoH("hammer") + " " + esc(T("buildNext")) + " →";
        next.classList.remove("done");
        next.onclick = function () { stage++; show(); };
      }
    }
    show();
    foot.appendChild(cap);
    foot.appendChild(counterEl);
    foot.appendChild(next);
    stageWrap.appendChild(foot);
    mainEl.appendChild(stageWrap);
  }

  /* ── лента времени: 7 эпох, чипы карт ── */
  function renderTimeline() {
    for (var i = 0; i < B.eras.length; i++) {
      var era = B.eras[i];
      var box = el("div", "era");
      var head = el("div", "ehead", esc(String(era.id)) + " · " + esc(L(era.name)));
      head.style.background = era.color;
      box.appendChild(head);
      var chips = el("div", "echips");
      var all = B.heroes.concat(B.plots);
      for (var c = 0; c < all.length; c++) if (all[c].era === era.id) (function (card) {
        var ch = el("button", "chip");
        if (hasImg(card)) { var im = el("img"); im.src = cardImg(card); im.alt = ""; im.loading = "lazy"; ch.appendChild(im); }
        else ch.appendChild(el("span", null, icoH("book")));
        ch.appendChild(el("span", null, esc(L(card.name))));
        ch.onclick = function () { openCard(card.id); };
        chips.appendChild(ch);
      })(all[c]);
      box.appendChild(chips);
      mainEl.appendChild(box);
    }
  }

  /* ── словарик ── */
  function renderGlossary() {
    var wrap = el("div", "gloss");
    for (var i = 0; i < B.glossary.length; i++) (function (g) {
      var item = el("div", "gitem");
      if (g.icon) item.appendChild(el("div", "em", icoH(g.icon)));   // без эмодзи: раст-иконка или ничего
      var body = el("div");
      body.appendChild(el("div", "w", esc(L(g.word))));
      body.appendChild(el("div", "d", esc(L(g.def))));
      if (g.refs && g.refs.length) {
        var refs = el("div", "refs");
        for (var r = 0; r < g.refs.length; r++) (function (id) {
          var card = findCard(id);
          if (!card) return;
          var ch = el("button", "chip", esc(L(card.name)));
          ch.onclick = function () { openCard(id); };
          refs.appendChild(ch);
        })(g.refs[r]);
        body.appendChild(refs);
      }
      item.appendChild(body);
      wrap.appendChild(item);
    })(B.glossary[i]);
    mainEl.appendChild(wrap);
  }

  /* ── прямой вход: ?go=cards|books|build|games|glossary|parent;
        ?embed=1 — внутри оболочки тома (без заставки и без #botmenu) ── */
  function goParam() { var m = /[?&]go=([a-z]+)/.exec(location.search); return m ? m[1] : null; }
  function routeGo(g) {
    if (g === "parent") {
      if (shellNav("parent")) return;
      openParent();
      return;
    }
    if (g === "lenta" || g === "feed") {
      if (shellNav("feed")) return;
      location.href = "feed/index.html";
      return;
    }
    if (g === "game" || g === "igry" || g === "play") g = "games";
    if (g === "books") { tab = "books"; render(); if (MENU && !EMBED) renderBottomMenu(); return; }
    var t = MENU_TAB[g]; if (t) { tab = t; render(); if (MENU && !EMBED) renderBottomMenu(); }
  }

  function applyShellTheme(theme) {
    theme = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    if (bookFrame) {
      try { bookFrame.contentWindow.postMessage({ type: "bibleShell", action: "theme", theme: theme }, "*"); } catch (e) {}
    }
  }

  window.addEventListener("message", function (e) {
    var d = e.data;
    if (!d || d.type !== "bibleShell") return;
    if (d.action === "lang" && d.lang) setLang(d.lang);
    if (d.action === "theme") applyShellTheme(d.theme);
    if (d.action === "tab" && d.tab) routeGo(d.tab);
  });

  window.BibleQuest = {
    setTab: setTab,
    setLang: setLang,
    routeGo: routeGo,
    getLang: function () { return lang; }
  };

  /* ── заставка (только на старом index со #splash; hub/embed стартует сразу) ── */
  var splash = document.getElementById("splash");
  var go = goParam();
  if (go || EMBED || !splash) {
    if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
    build();
    if (go) routeGo(go);
  } else {
    var startBtn = document.getElementById("startbtn");
    if (startBtn) {
      startBtn.innerHTML = esc(T("start"));
      startBtn.onclick = function () {
        if (splash.parentNode) splash.parentNode.removeChild(splash);
        build();
      };
    } else {
      build();
    }
  }
  applyDir();
  try {
    var th = localStorage.getItem("bible_theme");
    if (th === "dark") applyShellTheme("dark");
  } catch (e) {}
})();
