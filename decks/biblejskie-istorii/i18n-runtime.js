/* Колода: перевод UI без правок core.
   1) patchFeed() — до feed.js: FEED_GRAPH.ui / ранги / похвала на 7 языков.
   2) syncBookLang() — encyclopedia.js читает book_lang_*.
   3) startOverlay() — после ядра: замена зашитых русских/дино-строк. */
(function (root) {
  "use strict";
  var I = root.BibleI18n;
  if (!I) return;

  function JT(k, vars) { return I.JT(k, vars); }

  function patchFeed() {
    var g = root.FEED_GRAPH;
    if (!g) return;
    g.newNodeLabel = I.UI.newSpecies;
    g.unitGen = I.UI.unitGen;
    g.centerLabel = I.UI.centerBirds;
    g.mapNoun = I.UI.mapNoun;
    if (g.ranks && I.RANKS) {
      g.ranks.forEach(function (r, i) {
        if (I.RANKS[i]) r.name = I.RANKS[i];
      });
    }
    g.ui = g.ui || {};
    var bag = I.feedUiBag(), k;
    for (k in bag) if (bag.hasOwnProperty(k)) g.ui[k] = bag[k];

    var p = root.FEED_PROGRAM;
    if (p) {
      p.praise = I.PRAISE;
      p.cheer = I.CHEER;
      p.langKey = I.LKEY;
    }
  }

  function syncBookLang() {
    var lang = I.curLang();
    var id = (root.BOOK && root.BOOK.book_id) || "biblejskie-istorii";
    try { localStorage.setItem("book_lang_" + id, lang); } catch (e) {}
  }

  function paintEncChrome() {
    function setAria(sel, key) {
      var el = document.querySelector(sel);
      if (el) el.setAttribute("aria-label", JT(key));
    }
    setAria("#close", "close");
    setAria("#tocX", "close");
    setAria("#play", "readToMe");
    setAria("#scrub", "pageAria");
    setAria("#langs", "language");
    [].forEach.call(document.querySelectorAll("#sbX, .spcl, .sx"), function (el) {
      el.setAttribute("aria-label", JT("close"));
    });
    [].forEach.call(document.querySelectorAll("iframe[title]"), function (el) {
      if (el.getAttribute("title") === "Энциклопедия") {
        el.setAttribute("title", JT("encyclopediaTitle"));
      }
    });
  }

  function bindBookLangButtons() {
    var box = document.getElementById("langs");
    if (!box || box.getAttribute("data-bibi-i18n") === "1") return;
    box.setAttribute("data-bibi-i18n", "1");
    box.addEventListener("click", function () {
      setTimeout(function () {
        var on = box.querySelector('.lang[aria-pressed="true"]');
        var langs = (root.BOOK && root.BOOK.languages) || I.LANGS;
        var idx, code;
        if (!on) return;
        idx = Array.prototype.indexOf.call(box.querySelectorAll(".lang"), on);
        code = langs[idx];
        if (code && I.LANGS.indexOf(code) >= 0) {
          try { localStorage.setItem(I.LKEY, code); } catch (e) {}
          refreshOverlay();
        }
      }, 0);
    });
  }

  function buildExact() {
    var map = {}, dest, leaks, i, lang, src, n;
    function add(from, key) {
      dest = JT(key);
      if (from && dest && from !== dest) map[from] = dest;
    }
    add("Нажми — узнай", "tapToLearn");
    add("Нажми окошко — секрет", "spotOne");
    add("Штамп в паспорт!", "stampPassport");
    add("высший ранг!", "rankTop");
    add("Звук включён", "soundOn");
    add("Звук выключен", "soundOff");
    add("Карта знаний", "knowledgeMap");
    add("Закрыть", "close");
    add("Язык", "language");
    add("Прочти мне", "readToMe");
    add("Страница", "pageAria");
    add("Назад", "backShort");
    add("До", "before");
    add("После", "after");
    add("листай вверх", "swipeHint");
    add("⟳ Повторим!", "reviewRibbon");
    add("Всё по порядку!", "orderDone");
    add("Энциклопедия", "encyclopediaTitle");
    add("Правда или нет?", "tfTitle");
    add("Вопрос по прочитанному", "check");
    for (n = 1; n <= 10; n++) add(["", "Один!", "Два!", "Три!", "Четыре!", "Пять!", "Шесть!", "Семь!", "Восемь!", "Девять!", "Десять!"][n], "count" + n);
    leaks = I.CORE_LEAKS || [];
    for (i = 0; i < leaks.length; i++) {
      src = leaks[i].src || {};
      for (lang in src) if (src.hasOwnProperty(lang)) add(src[lang], leaks[i].key);
    }
    return map;
  }

  function replaceText(s) {
    if (!s || typeof s !== "string") return s;
    var t = s, exact = replaceText._map, m, n, trim, dest;
    if (exact[t]) return exact[t];
    trim = t.replace(/^\s+|\s+$/g, "");
    if (exact[trim]) return t.replace(trim, exact[trim]);
    m = /^Нажми окошки — узнай секреты · (\d+)\/(\d+)$/.exec(t);
    if (m) return JT("spotMany", { found: m[1], total: m[2] });
    m = /^ещё (\d+) до «(.+)»$/.exec(t);
    if (m) return JT("rankMore", { n: m[1], name: m[2] });
    m = /^Поймано: (\d+) из (\d+)$/.exec(t);
    if (m) return JT("caughtN", { got: m[1], need: m[2] });
    m = /^из (\d+) штампов$/.exec(t);
    if (m) return JT("stampsOf", { n: m[1] });
    dest = JT("check");
    if (dest && dest !== "Вопрос по прочитанному") t = t.split("Вопрос по прочитанному").join(dest);
    return t;
  }

  function visit(node) {
    var i, a, v, n, attrs;
    if (!node) return;
    if (node.nodeType === 3) {
      n = replaceText(node.nodeValue);
      if (n !== node.nodeValue) node.nodeValue = n;
      return;
    }
    if (node.nodeType !== 1) return;
    if (/^(SCRIPT|STYLE|TEXTAREA|CODE)$/.test(node.tagName)) return;
    attrs = ["aria-label", "title", "alt"];
    for (i = 0; i < attrs.length; i++) {
      a = attrs[i];
      v = node.getAttribute(a);
      if (v) {
        n = replaceText(v);
        if (n !== v) node.setAttribute(a, n);
      }
    }
    for (i = 0; i < node.childNodes.length; i++) visit(node.childNodes[i]);
  }

  function refreshOverlay() {
    replaceText._map = buildExact();
    I.paintShell();
    paintEncChrome();
    if (document.body) visit(document.body);
  }

  var overlayStarted = false;
  function startOverlay() {
    if (overlayStarted || !document.body) return;
    overlayStarted = true;
    refreshOverlay();
    var obs = new MutationObserver(function (recs) {
      var i, r, j;
      for (i = 0; i < recs.length; i++) {
        r = recs[i];
        if (r.type === "characterData") visit(r.target);
        else if (r.type === "attributes") visit(r.target);
        else if (r.addedNodes) {
          for (j = 0; j < r.addedNodes.length; j++) visit(r.addedNodes[j]);
        }
      }
    });
    obs.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["aria-label", "title", "alt"]
    });
  }

  function boot() {
    I.paintShell();
    bindBookLangButtons();
    startOverlay();
    paintEncChrome();
  }

  root.BibleI18nRuntime = {
    patchFeed: patchFeed,
    syncBookLang: syncBookLang,
    startOverlay: startOverlay,
    refreshOverlay: refreshOverlay,
    boot: boot
  };

  window.addEventListener("message", function (e) {
    var d = e.data;
    if (!d || d.type !== "bibleShell") return;
    if (d.action === "lang" && d.lang && I.LANGS.indexOf(d.lang) >= 0) {
      var prev;
      try { prev = localStorage.getItem(I.LKEY); } catch (err) { prev = null; }
      try { localStorage.setItem(I.LKEY, d.lang); } catch (err) {}
      if (location.pathname.indexOf("/feed/") >= 0 && prev !== d.lang) {
        location.reload();
        return;
      }
      refreshOverlay();
    }
    if (d.action === "openParent") {
      var lab = document.getElementById("chapLab");
      if (lab) lab.click();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      I.paintShell();
    });
  } else {
    I.paintShell();
  }
})(typeof window !== "undefined" ? window : this);
