/* Оболочка тома «Библейские истории».
   Режимы: splash · feed (iframe) · hub (вкладки → hub.html).
   «Родителям» — шторка поверх текущего экрана, не отдельная страница.
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

  /* ── тема / язык ──
     Тёмная тема временно отключена: всегда светлая. */
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", "light");
    try { localStorage.setItem(THEMEKEY, "light"); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", "#b85a3a");
    postToFrames({ type: "bibleShell", action: "theme", theme: "light" });
  }
  function currentTheme() { return "light"; }
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
    var sh = $("shParent");
    var body = $("pBody");
    if (sh && sh.classList.contains("open") && body && body.style.display !== "none") paintParentBody();
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
  var pendingOpenParent = false;
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
      if (pendingOpenParent) {
        pendingOpenParent = false;
        try { fr.contentWindow.postMessage({ type: "bibleShell", action: "openParent" }, "*"); } catch (e) {}
      }
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
    document.body.classList.remove("mode-splash", "mode-feed", "mode-hub", "card-overlay");
    document.body.classList.add("mode-" + m);
    document.body.classList.toggle("has-bnav", m !== "splash");
    if ($("pgSplash")) $("pgSplash").classList.toggle("on", m === "splash");
    if ($("pgFeed")) $("pgFeed").classList.toggle("on", m === "feed");
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
    if (path === "/parent") { openParent(); return; }
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
      if (r.mode === "parent") {
        if (mode !== "feed" && mode !== "hub") setMode("splash");
        openParent();
        return;
      }
      if (r.mode === "hub") activeHub = r.tab || "cards";
      setMode(r.mode);
      if (r.mode === "hub") showHubTab(r.tab || "cards");
    } finally {
      applying = false;
    }
  }

  /* ── родительская шторка ── */
  var FEED_NS = "biblejskie-istorii";
  function JT(key, vars) {
    if (window.BibleI18n && typeof BibleI18n.JT === "function") return BibleI18n.JT(key, vars);
    return T(key);
  }
  function locName(o) {
    if (window.BibleI18n && BibleI18n.L) return BibleI18n.L(o);
    if (o && typeof o === "object") return o[lang] || o.ru || "";
    return o == null ? "" : String(o);
  }
  function jget(k, d) {
    try {
      var v = JSON.parse(localStorage.getItem(k) || "null");
      return v && typeof v === "object" ? v : d;
    } catch (e) { return d; }
  }
  function nget(k) {
    var n = parseInt(localStorage.getItem(k), 10);
    return isNaN(n) ? 0 : n;
  }
  function bktDot(a) {
    if (a == null) return "#E4E9EF";
    if (a < 0.35) return "#F5D9C8";
    if (a < 0.6) return "#FFD98A";
    if (a < 0.85) return "#FFC24B";
    return "#54B463";
  }
  function loadProg() {
    try {
      var p = JSON.parse(localStorage.getItem(PROG_KEY) || "{}");
      return p && typeof p === "object" ? p : {};
    } catch (e) { return {}; }
  }
  function paintParentBody() {
    var GRAPH = window.FEED_GRAPH || { systems: [], ranks: [] };
    var systems = GRAPH.systems || [];
    var known = jget(FEED_NS + "_feed_know", {});
    var starsN = nget(FEED_NS + "_feed_stars");
    var pos = nget(FEED_NS + "_feed_pos");
    function mVal(id) {
      var v = known[id];
      if (typeof v === "number") return v;
      return v ? 1 : 0;
    }
    function isLit(id) { return mVal(id) >= 0.6 || (!!known[id] && typeof known[id] !== "number"); }
    var tot = 0, litN = 0, wsum = 0;
    systems.forEach(function (sy) {
      (sy.organs || []).forEach(function (o) {
        tot++;
        var a = known.hasOwnProperty(o.id) ? mVal(o.id) : null;
        wsum += (a == null ? 0 : a);
        if (isLit(o.id)) litN++;
      });
    });
    var ranks = GRAPH.ranks || [];
    var rank = ranks[0] || { name: "", min: 0 };
    ranks.forEach(function (r) { if (litN >= (r.min || 0)) rank = r; });
    var prog = loadProg();
    var col = (prog.q && prog.q.col) || {};
    var albumN = 0, albumStars = 0, ak;
    for (ak in col) {
      if (Object.prototype.hasOwnProperty.call(col, ak)) { albumN++; albumStars += (+col[ak] || 0); }
    }
    var albumTot = ((B.heroes && B.heroes.length) || 0) + ((B.plots && B.plots.length) || 0);
    var wpct = tot ? Math.round(wsum / tot * 100) : 0;
    var stats = $("pStats");
    if (stats) {
      stats.innerHTML =
        "<li>" + esc(T("cardsCollected")) + ": <b>" + albumN + (albumTot ? " / " + albumTot : "") + "</b></li>" +
        "<li>" + esc(JT("starsLine", { s: starsN || albumStars })) + "</li>" +
        (tot ? "<li>" + esc(JT("litLine", { n: litN, t: tot })) + "</li>" : "") +
        (rank && rank.name ? "<li>" + esc(locName(rank.name)) + "</li>" : "") +
        (pos ? "<li>" + esc(JT("feedPos", { a: pos + 1, b: "…" })) + "</li>" : "");
    }
    var graph = $("pBkt");
    if (graph) {
      var h = '<div class="st-line"><span>' + esc(JT("worldKnow")) + "</span><b>" + wpct + "%</b></div>" +
        '<div class="st-bar"><i style="width:' + wpct + '%"></i></div>';
      systems.forEach(function (sy) {
        var organs = sy.organs || [];
        if (!organs.length) return;
        var kn = 0;
        organs.forEach(function (o) { if (isLit(o.id)) kn++; });
        h += '<div class="st-line st-cont"><span>' + esc(locName(sy.name)) +
          "</span><b>" + kn + " / " + organs.length + "</b></div><div class=\"bkt-dots\">";
        organs.forEach(function (o) {
          var a = known.hasOwnProperty(o.id) ? mVal(o.id) : null;
          h += '<span class="bkt-dot" title="' + esc(locName(o.name)) +
            (a != null ? " · " + Math.round(a * 100) + "%" : "") +
            '" style="background:' + bktDot(a) + '"></span>';
        });
        h += "</div>";
      });
      h += '<p class="set-note">' + esc(JT("bktNote")) + "</p>";
      graph.innerHTML = h;
    }
  }
  function closeParentSheets() {
    var p = $("shParent");
    if (p) p.classList.remove("open");
    var h = (location.hash || "").replace(/^#/, "");
    if (h === "/parent" || h === "parent") {
      applying = true;
      try {
        if (history.replaceState) history.replaceState(null, "", location.pathname + (location.search || "") + "#/");
        else location.hash = "/";
      } catch (e) {}
      applying = false;
    }
  }
  function showParentGate() {
    var g = $("pGate"), b = $("pBody");
    if (g) g.style.display = "";
    if (b) b.style.display = "none";
    var err = $("gErr");
    if (err) err.textContent = "";
    if (window.GATE && window.GATE.renew) window.GATE.renew();
  }
  function openParentBody() {
    var g = $("pGate"), b = $("pBody"), p = $("shParent");
    if (g) g.style.display = "none";
    if (b) b.style.display = "";
    paintParentBody();
    if (window.BibleI18n && BibleI18n.paintShell) BibleI18n.paintShell();
    if (p) p.classList.add("open");
  }
  function openParent() {
    var p = $("shParent");
    if (!p) return;
    document.querySelectorAll(".sheet.open").forEach(function (s) {
      if (s.id !== "shParent") s.classList.remove("open");
    });
    showParentGate();
    if (window.BibleI18n && BibleI18n.paintShell) BibleI18n.paintShell();
    p.classList.add("open");
  }

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
        if (id === "shParent") { closeParentSheets(); return; }
        var el = $(id); if (el) el.classList.remove("open");
      };
    });
    document.querySelectorAll(".sheet").forEach(function (sh) {
      sh.addEventListener("click", function (e) {
        if (e.target !== sh) return;
        if (sh.id === "shParent") closeParentSheets();
        else sh.classList.remove("open");
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
      function close() {
        resetPanel();
        if (sh.id === "shParent") closeParentSheets();
        else sh.classList.remove("open");
      }
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
        else if (nav === "parent") openParent();
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
        if (go === "parent") openParent();
        else navigate(pathFor(go, tab));
      };
    });

    var settingsBtn = $("settingsBtn");
    var shSet = $("shSettings");
    if (settingsBtn && shSet) {
      settingsBtn.onclick = function (e) {
        e.stopPropagation();
        document.querySelectorAll(".set-lang").forEach(function (b) {
          var on = b.getAttribute("data-lang") === lang;
          b.classList.toggle("on", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        });
        shSet.classList.add("open");
      };
    }

    var contFeed = $("contFeed");
    if (contFeed) contFeed.onclick = function () { closeParentSheets(); navigate("/feed"); };
    var openHubBtn = $("openHub");
    if (openHubBtn) openHubBtn.onclick = function () { closeParentSheets(); navigate("/" + (activeHub || "cards")); };
    var openGraph = $("openGraph");
    if (openGraph) openGraph.onclick = function () {
      closeParentSheets();
      pendingOpenParent = true;
      ensureFeed();
      navigate("/feed");
      setTimeout(function () {
        if (feedFrame && feedFrame.contentWindow) {
          try { feedFrame.contentWindow.postMessage({ type: "bibleShell", action: "openParent" }, "*"); } catch (e) {}
        }
      }, 500);
    };
    var rf = $("resetFeed");
    if (rf) rf.onclick = function () {
      if (!confirm(JT("resetFeedQ"))) return;
      try { localStorage.removeItem(FEED_NS + "_feed_pos"); } catch (e) {}
      paintParentBody();
    };
    var rb = $("resetBkt");
    if (rb) rb.onclick = function () {
      if (!confirm(JT("resetBktQ"))) return;
      [FEED_NS + "_feed_know", FEED_NS + "_feed_learned", FEED_NS + "_feed_stars",
       FEED_NS + "_feed_qdone", FEED_NS + "_feed_qmeta"].forEach(function (key) {
        try { localStorage.removeItem(key); } catch (e) {}
      });
      paintParentBody();
    };
    if (window.GATE && $("gGo") && $("gIn")) {
      window.GATE.arm({
        q: $("gQ"),
        input: $("gIn"),
        button: $("gGo"),
        err: $("gErr"),
        errText: JT("parentWrong")
      }, openParentBody);
    }

    window.addEventListener("hashchange", function () {
      if (!applying) applyRoute(parseHash());
    });
    window.addEventListener("popstate", function () {
      if (!applying) applyRoute(parseHash());
    });
    window.addEventListener("message", function (e) {
      var d = e.data;
      if (!d || d.type !== "bibleShell") return;
      if (d.action === "nav" && d.to) {
        if (d.to === "parent" || d.to === "parents") openParent();
        else navigate(pathFor(d.to, d.tab));
      }
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
