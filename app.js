/* Оболочка тома «Библейские истории».
   Режимы: splash · feed (iframe) · hub (вкладки → hub.html) · parent.
   Язык: bibi_lang (общий с quest/feed). Тема: bible_theme. */
(function () {
  "use strict";
  var B = window.BIBLE || window.VOLUME || {};
  var LANGS = (B.languages && B.languages.length) ? B.languages.slice() : ["ru", "en", "de", "es", "pt", "fr", "ar"];
  var RTL = ["ar"];
  var LKEY = window.FEED_LANG_KEY || "bibi_lang";
  var THEMEKEY = "bible_theme";
  var PROG_KEY = (B.ns || "bibi") + "_prog";

  var lang = LANGS.indexOf(localStorage.getItem(LKEY)) >= 0 ? localStorage.getItem(LKEY) : (LANGS[0] || "ru");
  var activeHub = "cards";
  var mode = "splash";
  var applying = false;
  var feedFrame = null;
  var hubFrame = null;
  var parentUnlocked = false;

  var HUB_TABS = [
    { id: "cards", path: "/cards", ico: "\uD83C\uDCCF" },
    { id: "books", path: "/books", ico: "\uD83D\uDCD6" },
    { id: "build", path: "/build", ico: "\uD83D\uDD28" },
    { id: "glossary", path: "/glossary", ico: "\uD83D\uDD0D" }
  ];
  var PATH = {
    "/": { mode: "splash" },
    "/feed": { mode: "feed" },
    "/cards": { mode: "hub", tab: "cards" },
    "/books": { mode: "hub", tab: "books" },
    "/build": { mode: "hub", tab: "build" },
    "/games": { mode: "hub", tab: "games" },
    "/glossary": { mode: "hub", tab: "glossary" },
    "/parent": { mode: "parent" },
    "/hub": { mode: "hub", tab: "cards" }
  };

  function $(id) { return document.getElementById(id); }
  function T(key) {
    var UI = window.BibleI18n && BibleI18n.UI;
    if (!UI || !UI[key]) return key;
    var o = UI[key];
    return (o && (o[lang] || o.ru)) || key;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  /* ── тема / язык ── */
  function applyTheme(theme) {
    theme = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEMEKEY, theme); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#5c2e1f" : "#b85a3a");
    document.querySelectorAll(".set-theme").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-theme") === theme);
    });
    postToFrames({ type: "bibleShell", action: "theme", theme: theme });
  }
  function currentTheme() {
    try { return localStorage.getItem(THEMEKEY) === "dark" ? "dark" : "light"; } catch (e) { return "light"; }
  }
  function applyDir() {
    document.documentElement.setAttribute("dir", RTL.indexOf(lang) >= 0 ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
  }
  function setLang(code) {
    if (LANGS.indexOf(code) < 0) return;
    lang = code;
    try { localStorage.setItem(LKEY, code); } catch (e) {}
    applyDir();
    buildLangs();
    buildTabs();
    paint();
    if (window.BibleI18n && BibleI18n.paintShell) BibleI18n.paintShell();
    postToFrames({ type: "bibleShell", action: "lang", lang: code });
    try { window.dispatchEvent(new CustomEvent("bible:lang", { detail: { lang: code } })); } catch (e) {}
    if (mode === "parent") paintParent();
  }

  function postToFrames(msg) {
    [feedFrame, hubFrame].forEach(function (fr) {
      if (!fr || !fr.contentWindow) return;
      try { fr.contentWindow.postMessage(msg, "*"); } catch (e) {}
    });
  }

  /* ── вкладки / языки UI ── */
  function buildTabs() {
    var box = $("tabs"); if (!box) return;
    box.innerHTML = "";
    HUB_TABS.forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.dataset.id = t.id;
      b.setAttribute("aria-pressed", t.id === activeHub ? "true" : "false");
      b.setAttribute("aria-label", T(t.id));
      var ico = document.createElement("span");
      ico.className = "tab-ico";
      ico.setAttribute("aria-hidden", "true");
      ico.textContent = t.ico;
      var lab = document.createElement("span");
      lab.className = "tab-lab";
      lab.textContent = T(t.id);
      b.appendChild(ico);
      b.appendChild(lab);
      b.onclick = function () { navigate(t.path); };
      box.appendChild(b);
    });
  }
  function buildLangs() {
    var sel = $("langsel"); if (!sel) return;
    sel.innerHTML = "";
    LANGS.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "set-lang" + (c === lang ? " on" : "");
      b.setAttribute("role", "tab");
      b.setAttribute("data-lang", c);
      b.setAttribute("aria-selected", c === lang ? "true" : "false");
      b.textContent = c.toUpperCase();
      b.onclick = function () { setLang(c); };
      sel.appendChild(b);
    });
  }
  function paint() {
    var title = $("appTitle");
    if (title) title.textContent = T("brand");
    var sub = $("appSub");
    if (sub) sub.textContent = (mode === "hub" && activeHub === "games") ? T("games") : T("sub");
    document.title = T("brand");
  }

  /* ── iframe ── */
  function ensureFeed() {
    var host = $("pgFeed");
    if (!host) return;
    if (feedFrame) return;
    var fr = document.createElement("iframe");
    fr.src = "feed/index.html?embed=1";
    fr.title = T("goFeed");
    fr.setAttribute("allow", "autoplay");
    fr.onload = function () {
      try { fr.contentWindow.postMessage({ type: "bibleShell", action: "lang", lang: lang }, "*"); } catch (e) {}
      try { fr.contentWindow.postMessage({ type: "bibleShell", action: "theme", theme: currentTheme() }, "*"); } catch (e) {}
    };
    host.appendChild(fr);
    feedFrame = fr;
  }
  function ensureHub(tab) {
    var view = $("v-hub");
    if (!view) return;
    var go = tab || activeHub || "cards";
    if (!hubFrame) {
      var fr = document.createElement("iframe");
      fr.src = "hub.html?embed=1&go=" + encodeURIComponent(go);
      fr.title = T("hub");
      fr.onload = function () {
        try { fr.contentWindow.postMessage({ type: "bibleShell", action: "tab", tab: activeHub }, "*"); } catch (e) {}
        try { fr.contentWindow.postMessage({ type: "bibleShell", action: "lang", lang: lang }, "*"); } catch (e) {}
        try { fr.contentWindow.postMessage({ type: "bibleShell", action: "theme", theme: currentTheme() }, "*"); } catch (e) {}
      };
      view.appendChild(fr);
      hubFrame = fr;
      return;
    }
    try {
      hubFrame.contentWindow.postMessage({ type: "bibleShell", action: "tab", tab: go }, "*");
    } catch (e) {}
  }
  function showHubTab(id) {
    activeHub = id;
    ensureHub(id);
    var box = $("tabs");
    if (box) {
      /* Игры — отдельный хаб мини-игр: вкладки альбома скрываем */
      box.hidden = id === "games";
      [].forEach.call(box.children, function (b) {
        b.setAttribute("aria-pressed", b.dataset.id === id ? "true" : "false");
      });
    }
    var sub = $("appSub");
    if (sub) sub.textContent = id === "games" ? T("games") : T("sub");
    var v = $("v-hub");
    if (v) v.classList.add("on");
    if (mode === "hub") syncBnav("hub");
  }

  /* ── режимы ── */
  function setMode(m) {
    mode = m;
    document.body.classList.remove("mode-splash", "mode-feed", "mode-hub", "mode-parent", "card-overlay");
    document.body.classList.add("mode-" + m);
    document.body.classList.toggle("has-bnav", m !== "splash");
    if ($("pgSplash")) $("pgSplash").classList.toggle("on", m === "splash");
    if ($("pgFeed")) $("pgFeed").classList.toggle("on", m === "feed");
    if ($("pgParent")) $("pgParent").classList.toggle("on", m === "parent");
    syncBnav(m);
    if (m === "feed") {
      ensureFeed();
      /* стрелки ←/→ слушает iframe — без фокуса клавиши остаются в оболочке */
      setTimeout(function () {
        try { if (feedFrame) feedFrame.focus({ preventScroll: true }); } catch (e) {
          try { if (feedFrame) feedFrame.focus(); } catch (e2) {}
        }
      }, 0);
    }
    if (m === "parent") paintParent();
  }
  function syncBnav(m) {
    m = m || mode;
    document.querySelectorAll("#bnav button").forEach(function (b) {
      var nav = b.getAttribute("data-nav");
      var on = false;
      if (m === "hub") {
        if (nav === "games") on = activeHub === "games";
        else if (nav === "hub") on = activeHub !== "games";
      } else {
        on = nav === m;
      }
      b.classList.toggle("on", on);
    });
  }

  function parseHash() {
    var h = (location.hash || "#/").replace(/^#/, "") || "/";
    if (h.charAt(0) !== "/") h = "/" + h;
    h = h.split("?")[0];
    return PATH[h] || PATH["/"] || { mode: "splash" };
  }
  function pathFor(nav, tab) {
    if (nav === "splash" || nav === "home" || nav === "menu" || nav === "/") return "/";
    if (nav === "feed" || nav === "lenta") return "/feed";
    if (nav === "parent") return "/parent";
    if (nav === "games" || nav === "igry" || nav === "play") return "/games";
    if (nav === "hub" || nav === "enc") return (tab && PATH["/" + tab]) ? "/" + tab : "/" + (activeHub || "cards");
    if (PATH["/" + nav]) return "/" + nav;
    return "/";
  }
  function navigate(path) {
    if (!path || path.charAt(0) !== "/") path = "/" + (path || "");
    var cur = (location.hash || "#/").replace(/^#/, "") || "/";
    if (cur === path) {
      applyRoute(PATH[path] || { mode: "splash" });
      return;
    }
    try { history.pushState(null, "", "#" + path); } catch (e) {
      location.hash = path;
      return;
    }
    applyRoute(PATH[path] || { mode: "splash" });
  }
  function applyRoute(r) {
    if (!r) r = { mode: "splash" };
    applying = true;
    try {
      if (r.mode === "hub") activeHub = r.tab || "cards";
      setMode(r.mode);
      if (r.mode === "hub") showHubTab(r.tab || "cards");
    } finally {
      applying = false;
    }
  }

  /* ── родительский экран ── */
  function loadProg() {
    try {
      var p = JSON.parse(localStorage.getItem(PROG_KEY) || "{}");
      return p && typeof p === "object" ? p : {};
    } catch (e) { return {}; }
  }
  function paintParent() {
    var gate = $("parentGate"), box = $("parentBox");
    try { parentUnlocked = sessionStorage.getItem((B.ns || "bibi") + "_parent") === "1"; } catch (e) {}
    if (!parentUnlocked) {
      var a = 2 + Math.floor(Math.random() * 8);
      var b2 = 2 + Math.floor(Math.random() * 8);
      gateA = a; gateB = b2;
      if (gate) {
        gate.style.display = "block";
        $("gateQ").textContent = a + " + " + b2 + " = ?";
        $("gateErr").textContent = "";
        if ($("gateIn")) $("gateIn").value = "";
      }
      if (box) box.style.display = "none";
      return;
    }
    if (gate) gate.style.display = "none";
    if (box) box.style.display = "block";
    var prog = loadProg();
    var col = (prog.q && prog.q.col) || {};
    var n = 0, k, stars = 0;
    for (k in col) { if (Object.prototype.hasOwnProperty.call(col, k)) { n++; stars += (+col[k] || 0); } }
    var heroes = (B.heroes && B.heroes.length) || 0;
    var plots = (B.plots && B.plots.length) || 0;
    var tot = heroes + plots;
    var stats = $("pStats");
    if (stats) {
      stats.innerHTML =
        "<li>" + esc(T("cardsCollected")) + ": <b>" + n + (tot ? " / " + tot : "") + "</b></li>" +
        "<li>" + esc(T("stars")) + ": <b>" + stars + "</b></li>";
    }
  }
  var gateA = 0, gateB = 0;

  /* ── sheets ── */
  function closeSheets() {
    document.querySelectorAll(".sheet.open").forEach(function (s) { s.classList.remove("open"); });
  }
  function openHubSheet() {
    var sh = $("shHub");
    if (sh) sh.classList.add("open");
  }
  function bindSheets() {
    document.querySelectorAll("[data-close]").forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute("data-close");
        var el = $(id); if (el) el.classList.remove("open");
      };
    });
    document.querySelectorAll(".sheet").forEach(function (sh) {
      sh.addEventListener("click", function (e) {
        if (e.target === sh) sh.classList.remove("open");
      });
    });
    document.querySelectorAll(".sheet").forEach(function (sh) {
      var panel = sh.querySelector(".panel");
      var grab = sh.querySelector(".grab");
      if (!panel || !grab) return;
      var startY = 0, dy = 0, active = false, pid = null;
      function resetPanel() {
        panel.classList.remove("sheet-dragging");
        panel.style.transform = "";
      }
      function close() { resetPanel(); sh.classList.remove("open"); }
      grab.addEventListener("pointerdown", function (e) {
        if (e.button != null && e.button !== 0) return;
        active = true; pid = e.pointerId; startY = e.clientY; dy = 0;
        panel.classList.add("sheet-dragging");
        try { grab.setPointerCapture(pid); } catch (err) {}
      });
      grab.addEventListener("pointermove", function (e) {
        if (!active || (pid != null && e.pointerId !== pid)) return;
        dy = Math.max(0, e.clientY - startY);
        panel.style.transform = "translateY(" + dy + "px)";
        if (e.cancelable) e.preventDefault();
      });
      function endDrag(e) {
        if (!active) return;
        if (pid != null && e && e.pointerId !== pid) return;
        active = false; pid = null;
        if (dy > 72) close(); else resetPanel();
      }
      grab.addEventListener("pointerup", endDrag);
      grab.addEventListener("pointercancel", endDrag);
    });
  }

  /* ── события ── */
  function wire() {
    document.querySelectorAll("#bnav button").forEach(function (b) {
      b.onclick = function () {
        var nav = b.getAttribute("data-nav");
        if (nav === "hub") openHubSheet();
        else navigate(pathFor(nav));
      };
    });
    document.querySelectorAll("[data-enc]").forEach(function (btn) {
      btn.onclick = function () {
        closeSheets();
        navigate(pathFor("hub", btn.getAttribute("data-enc")));
      };
    });
    var encBack = $("encBack");
    if (encBack) encBack.onclick = function () { navigate("/"); };

    document.querySelectorAll("#pgSplash [data-go]").forEach(function (btn) {
      btn.onclick = function () {
        var go = btn.getAttribute("data-go");
        var tab = btn.getAttribute("data-hub-tab");
        navigate(pathFor(go, tab));
      };
    });

    var settingsBtn = $("settingsBtn");
    var shSet = $("shSettings");
    if (settingsBtn && shSet) {
      settingsBtn.onclick = function (e) {
        e.stopPropagation();
        document.querySelectorAll(".set-theme").forEach(function (b) {
          b.classList.toggle("on", b.getAttribute("data-theme") === currentTheme());
        });
        document.querySelectorAll(".set-lang").forEach(function (b) {
          var on = b.getAttribute("data-lang") === lang;
          b.classList.toggle("on", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        });
        shSet.classList.add("open");
      };
    }
    document.querySelectorAll(".set-theme").forEach(function (b) {
      b.onclick = function () { applyTheme(b.getAttribute("data-theme") || "light"); };
    });

    var gateGo = $("gateGo");
    if (gateGo) gateGo.onclick = function () {
      var v = +(($("gateIn") && $("gateIn").value) || 0);
      if (v === gateA + gateB) {
        parentUnlocked = true;
        try { sessionStorage.setItem((B.ns || "bibi") + "_parent", "1"); } catch (e) {}
        paintParent();
      } else if ($("gateErr")) {
        $("gateErr").textContent = T("parentWrong");
      }
    };

    var contFeed = $("contFeed");
    if (contFeed) contFeed.onclick = function () { navigate("/feed"); };
    var openHubBtn = $("openHub");
    if (openHubBtn) openHubBtn.onclick = function () { navigate("/" + (activeHub || "cards")); };

    window.addEventListener("hashchange", function () {
      if (!applying) applyRoute(parseHash());
    });
    window.addEventListener("popstate", function () {
      if (!applying) applyRoute(parseHash());
    });
    window.addEventListener("message", function (e) {
      var d = e.data;
      if (!d || d.type !== "bibleShell") return;
      if (d.action === "nav" && d.to) navigate(pathFor(d.to, d.tab));
      if (d.action === "cardOverlay") {
        document.body.classList.toggle("card-overlay", !!d.open);
      }
    });
  }

  /* ── старт ── */
  applyTheme(currentTheme());
  applyDir();
  buildLangs();
  buildTabs();
  paint();
  if (window.BibleI18n && BibleI18n.paintShell) BibleI18n.paintShell();
  bindSheets();
  wire();

  /* ?go=cards|books|build|games|… из старых ссылок ленты */
  var goM = /[?&]go=([a-z]+)/.exec(location.search);
  if (goM) {
    var g = goM[1];
    var p = pathFor(g === "lenta" ? "feed" : (g === "igry" || g === "play" ? "games" : g));
    try { history.replaceState(null, "", location.pathname + "#" + p); } catch (e) {}
    applyRoute(PATH[p] || { mode: "splash" });
  } else {
    if (!location.hash || location.hash === "#") {
      try { history.replaceState(null, "", "#/"); } catch (e) {}
    }
    applyRoute(parseHash());
  }

  window.BibleApp = {
    setMode: setMode,
    navigate: navigate,
    setLang: setLang,
    getLang: function () { return lang; },
    setTheme: applyTheme,
    getTheme: currentTheme,
    showHub: function (tab) { navigate(pathFor("hub", tab || "cards")); }
  };
})();
