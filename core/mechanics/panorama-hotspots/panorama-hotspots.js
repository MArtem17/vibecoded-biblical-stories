/*!
 * panorama-hotspots.js — переиспользуемый режим «панорама с хотспотами».
 *
 * Что умеет:
 *   • большое изображение / панорама (пан + зум: перетаскивание, щипок, колесо) ИЛИ картинка «в размер экрана»;
 *   • кликабельные точки-хотспоты (координаты в % от изображения) → карточка с картинкой, заголовком и текстом;
 *   • опциональная видео-заставка (проигрывается один раз при открытии, затем «замирает» в панораму);
 *   • опциональный звук на хотспот (кнопка ▶ в карточке).
 *
 * Зависимостей нет. ES5, vanilla, самодостаточно (CSS вставляет сам). Офлайн, подходит под iOS WKWebView.
 *
 * Использование:
 *   PanoramaHotspots.open({
 *     image: 'assets/hall.webp',       // обязательная картинка сцены
 *     hint:  'Нажми точку — узнай, что это',
 *     pan:   true,                      // true = пан/зум панорамы (по умолч. true); false = вписать в экран
 *     intro: 'assets/hall-intro.mp4',   // (опц.) видео-заставка
 *     base:  'assets/hall/',            // (опц.) префикс для hotspot.image / hotspot.audio
 *     onOpenCard: function(h){...},     // (опц.) колбэк при открытии карточки хотспота
 *     hotspots: [
 *       { x:50, y:20, title:'Аполлон', subtitle:'бог искусств',
 *         text:'…', image:'apollo.webp', audio:'apollo.mp3' }
 *     ]
 *   });
 *   PanoramaHotspots.close();
 *
 * Можно заранее зарегистрировать несколько сцен и открывать по id:
 *   PanoramaHotspots.register('hall', {...}); PanoramaHotspots.open('hall');
 *
 * Палитра настраивается CSS-переменными (см. :root ниже) — переопредели в своём CSS при желании.
 */
(function (global) {
  "use strict";

  var CSS =
  ":root{--ph-gold:#C9A24B;--ph-ink:#111;--ph-accent:#8E1B1B;--ph-warm:#FBF3E2;}" +
  ".ph-ov{position:fixed;inset:0;z-index:9000;display:none;align-items:center;justify-content:center;background:rgba(12,10,8,.93);overflow:hidden;touch-action:none;-webkit-tap-highlight-color:transparent;}" +
  ".ph-ov.on{display:flex;}" +
  ".ph-stage{position:absolute;inset:0;overflow:hidden;cursor:grab;}" +
  ".ph-stage.grabbing{cursor:grabbing;}" +
  ".ph-world{position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform;}" +
  ".ph-world>img{display:block;user-select:none;-webkit-user-drag:none;pointer-events:none;}" +
  ".ph-fit .ph-stage{display:flex;align-items:center;justify-content:center;}" +
  ".ph-fit .ph-world{position:relative;}" +
  ".ph-fit .ph-world>img{max-width:98vw;max-height:88vh;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,.6);}" +
  ".ph-hot{position:absolute;width:36px;height:36px;margin:-18px 0 0 -18px;border-radius:50%;border:2.5px solid var(--ph-gold);" +
    "background:rgba(142,27,27,.60);box-shadow:0 2px 8px rgba(0,0,0,.5);cursor:pointer;transition:transform .12s;}" +
  ".ph-hot:active{transform:scale(1.18);border-color:#fff;}" +
  ".ph-hot .ph-pulse{position:absolute;inset:-5px;border-radius:50%;border:2px solid var(--ph-gold);animation:ph-pulse 2.4s infinite;opacity:0;pointer-events:none;}" +
  "@keyframes ph-pulse{0%{transform:scale(.7);opacity:.7}100%{transform:scale(1.3);opacity:0}}" +
  ".ph-hint{position:absolute;top:calc(10px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:5;" +
    "background:rgba(40,30,25,.86);color:#f0e9dc;padding:7px 14px;border-radius:999px;font:600 12px/1.2 -apple-system,Segoe UI,Roboto,sans-serif;border:1px solid var(--ph-gold);white-space:nowrap;}" +
  ".ph-close{position:absolute;top:calc(10px + env(safe-area-inset-top));right:12px;z-index:6;width:40px;height:40px;border-radius:50%;" +
    "border:2px solid #fff;background:rgba(0,0,0,.45);color:#fff;font:900 17px/1 sans-serif;cursor:pointer;}" +
  ".ph-ctl{position:absolute;right:10px;bottom:calc(10px + env(safe-area-inset-bottom));z-index:5;display:flex;flex-direction:column;gap:7px;}" +
  ".ph-ctl button{width:42px;height:42px;border-radius:11px;border:2px solid var(--ph-gold);background:rgba(40,30,25,.85);color:#f0e9dc;font:800 20px/1 sans-serif;cursor:pointer;}" +
  ".ph-vid{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:contain;z-index:20;background:#000;display:none;}" +
  ".ph-playing .ph-vid{display:block;}" +
  ".ph-skip{position:absolute;right:10px;bottom:calc(10px + env(safe-area-inset-bottom));z-index:22;display:none;" +
    "background:rgba(0,0,0,.55);color:#fff;border:1.5px solid rgba(255,255,255,.7);border-radius:999px;font:800 12px sans-serif;padding:7px 13px;cursor:pointer;}" +
  ".ph-playing .ph-skip{display:block;}" +
  ".ph-pop{position:fixed;inset:0;z-index:9010;display:none;align-items:center;justify-content:center;background:rgba(10,8,6,.6);padding:18px;}" +
  ".ph-pop.on{display:flex;}" +
  ".ph-card{max-width:min(340px,90vw);background:var(--ph-warm);border:3px solid var(--ph-gold);border-radius:18px;overflow:hidden;box-shadow:0 16px 50px rgba(0,0,0,.55);font-family:-apple-system,Segoe UI,Roboto,sans-serif;}" +
  ".ph-hero{position:relative;width:100%;aspect-ratio:1/1;background:radial-gradient(circle at 50% 34%,#fff7e8,#e7d6ac);display:flex;align-items:center;justify-content:center;border-bottom:3px solid var(--ph-gold);}" +
  ".ph-hero img{width:100%;height:100%;object-fit:cover;display:block;}" +
  ".ph-hero.ph-mono span{font:700 84px/1 Georgia,serif;color:var(--ph-gold);opacity:.85;}" +
  ".ph-body{padding:14px 18px 16px;text-align:center;}" +
  ".ph-nm{font:800 24px/1.1 Georgia,serif;color:var(--ph-accent);letter-spacing:.3px;}" +
  ".ph-role{font:800 11.5px/1.2 sans-serif;color:var(--ph-gold);text-transform:uppercase;letter-spacing:1.6px;margin:4px 0 11px;}" +
  ".ph-text{font:400 14.5px/1.55 sans-serif;color:var(--ph-ink);}" +
  ".ph-play{display:block;margin:13px auto 0;border:2px solid var(--ph-gold);background:#fff;color:var(--ph-accent);font:800 14px sans-serif;border-radius:999px;padding:8px 22px;cursor:pointer;}" +
  ".ph-btn{display:block;margin:13px auto 0;border:2px solid var(--ph-accent);background:var(--ph-accent);color:#fff;font:800 14px sans-serif;border-radius:999px;padding:9px 26px;cursor:pointer;}" +
  /* режим редактора хотспотов */
  ".ph-edhot{position:absolute;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;border:2.5px solid #fff;" +
    "background:rgba(30,120,220,.75);box-shadow:0 2px 8px rgba(0,0,0,.5);cursor:grab;display:flex;align-items:center;justify-content:center;" +
    "color:#fff;font:800 13px/1 sans-serif;touch-action:none;}" +
  ".ph-edhot.drag{cursor:grabbing;border-color:#ffd75e;}" +
  ".ph-edbar{position:fixed;left:0;right:0;bottom:0;z-index:9020;background:rgba(20,16,12,.94);border-top:2px solid var(--ph-gold);" +
    "padding:8px 10px calc(8px + env(safe-area-inset-bottom));font-family:-apple-system,Segoe UI,Roboto,sans-serif;}" +
  ".ph-edbar textarea{width:100%;height:64px;resize:none;background:#14100c;color:#9fdc9f;border:1px solid #4a3d2c;border-radius:8px;" +
    "font:12px/1.45 ui-monospace,Menlo,Consolas,monospace;padding:6px 8px;box-sizing:border-box;white-space:pre;}" +
  ".ph-edrow{display:flex;gap:8px;margin-top:7px;}" +
  ".ph-edrow button{flex:1;border:2px solid var(--ph-gold);background:#2a2018;color:#f0e9dc;font:800 13px sans-serif;border-radius:10px;padding:9px 6px;cursor:pointer;}" +
  ".ph-edrow button.ph-edcopy{background:var(--ph-gold);color:#3a2400;}";

  var injected = false, R = null, cur = null;

  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }

  function inject() {
    if (injected) return; injected = true;
    var s = el("style"); s.textContent = CSS; document.head.appendChild(s);
  }

  /* один раз строим корневой DOM (оверлей + попап + аудио) */
  function build() {
    if (R) return R;
    inject();
    var ov = el("div", "ph-ov");
    var hint = el("div", "ph-hint");
    var close = el("button", "ph-close"); close.type = "button"; close.innerHTML = "&#10005;";
    var stage = el("div", "ph-stage");
    var world = el("div", "ph-world");
    var img = el("img"); img.alt = "";
    var vid = el("video", "ph-vid"); vid.setAttribute("playsinline", ""); vid.muted = true; vid.preload = "none";
    var skip = el("button", "ph-skip"); skip.type = "button"; skip.textContent = "Пропустить ▸";
    var ctl = el("div", "ph-ctl");
    var zin = el("button"); zin.type = "button"; zin.textContent = "+";
    var zout = el("button"); zout.type = "button"; zout.innerHTML = "&#8722;";
    var zres = el("button"); zres.type = "button"; zres.innerHTML = "&#8962;";
    ctl.appendChild(zin); ctl.appendChild(zout); ctl.appendChild(zres);
    world.appendChild(img);
    stage.appendChild(world); stage.appendChild(vid); stage.appendChild(skip);
    ov.appendChild(hint); ov.appendChild(close); ov.appendChild(stage); ov.appendChild(ctl);
    var pop = el("div", "ph-pop"); var card = el("div", "ph-card"); pop.appendChild(card);
    var audio = el("audio"); audio.preload = "none";
    document.body.appendChild(ov); document.body.appendChild(pop); document.body.appendChild(audio);

    R = { ov: ov, hint: hint, stage: stage, world: world, img: img, vid: vid, skip: skip,
          ctl: ctl, zin: zin, zout: zout, zres: zres, pop: pop, card: card, audio: audio };

    /* --- закрытие --- */
    close.addEventListener("click", close_);
    ov.addEventListener("click", function (e) { if (editOn) return; if (e.target === ov || e.target === stage) close_(); });
    pop.addEventListener("click", function (e) {
      var t = e.target;
      if (t.className && t.className.indexOf && t.className.indexOf("ph-play") >= 0) {
        var au = t.getAttribute("data-au"); if (au) { audio.src = au; try { audio.currentTime = 0; audio.play(); } catch (x) {} } return;
      }
      if (t === pop || t.className === "ph-btn") pop.classList.remove("on");
    });
    /* --- видео-заставка --- */
    skip.addEventListener("click", function (e) { e.stopPropagation(); endIntro(); });
    vid.addEventListener("ended", endIntro);
    vid.addEventListener("error", endIntro);
    vid.addEventListener("click", function (e) { e.stopPropagation(); endIntro(); });
    /* --- зум-кнопки --- */
    zin.addEventListener("click", function () { zoomAt(stage.clientWidth / 2, stage.clientHeight / 2, 1.4); });
    zout.addEventListener("click", function () { zoomAt(stage.clientWidth / 2, stage.clientHeight / 2, 1 / 1.4); });
    zres.addEventListener("click", fit);
    /* --- жесты --- */
    wirePointers();
    global.addEventListener("resize", function () { if (ov.classList.contains("on")) fit(); });
    return R;
  }

  /* ============ пан / зум ============ */
  var IMW = 0, IMH = 0, scale = 1, tx = 0, ty = 0, minS = 1, maxS = 6, panOn = true;

  function clamp() {
    var sw = R.stage.clientWidth, sh = R.stage.clientHeight, w = IMW * scale, h = IMH * scale;
    if (w <= sw) tx = (sw - w) / 2; else tx = Math.min(0, Math.max(sw - w, tx));
    if (h <= sh) ty = (sh - h) / 2; else ty = Math.min(0, Math.max(sh - h, ty));
  }
  function apply() { if (!panOn) return; clamp(); R.world.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + scale + ")"; }
  function fit() {
    if (!panOn || !R) return;
    var sw = R.stage.clientWidth, sh = R.stage.clientHeight;
    if (!sw || !sh || !IMW || !IMH) return;
    minS = sh / IMH; if (IMW * minS < sw) minS = sw / IMW; scale = minS; maxS = minS * 6;
    tx = (sw - IMW * scale) / 2; ty = (sh - IMH * scale) / 2; apply();
  }
  function zoomAt(cx, cy, f) {
    if (!panOn || !isFinite(f) || f <= 0) return;
    var r = R.stage.getBoundingClientRect(), px = cx - r.left, py = cy - r.top;
    var ns = Math.min(maxS, Math.max(minS, scale * f)), k = ns / scale;
    if (!isFinite(k) || k <= 0) return;
    tx = px - (px - tx) * k; ty = py - (py - ty) * k; scale = ns; apply();
  }
  function wirePointers() {
    var active = {}, count = 0, lastMid = null, lastDist = 0, dragging = false, lastX = 0, lastY = 0;
    var tapX = 0, tapY = 0, tapT = 0, tapMoved = false;  // детект «тапа» для редактора
    var st = R.stage;
    function vals() { var a = []; for (var k in active) if (active.hasOwnProperty(k)) a.push(active[k]); return a; }
    st.addEventListener("pointerdown", function (e) {
      tapX = e.clientX; tapY = e.clientY; tapT = Date.now(); tapMoved = false;
      if (!panOn) return;
      if (!active[e.pointerId]) count++;
      active[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (count === 1) { dragging = true; lastX = e.clientX; lastY = e.clientY; st.classList.add("grabbing"); } else dragging = false;
    });
    st.addEventListener("pointerup", function (e) {
      if (Math.abs(e.clientX - tapX) > 7 || Math.abs(e.clientY - tapY) > 7) tapMoved = true;
      if (editOn && !tapMoved && Date.now() - tapT < 600) edAddAt(e.clientX, e.clientY);
    });
    st.addEventListener("pointermove", function (e) {
      if (Math.abs(e.clientX - tapX) > 7 || Math.abs(e.clientY - tapY) > 7) tapMoved = true;
      if (!panOn || !active[e.pointerId]) return;
      active[e.pointerId] = { x: e.clientX, y: e.clientY };
      var pts = vals();
      if (pts.length >= 2) {
        var dx = pts[0].x - pts[1].x, dy = pts[0].y - pts[1].y, dist = Math.sqrt(dx * dx + dy * dy);
        var mx = (pts[0].x + pts[1].x) / 2, my = (pts[0].y + pts[1].y) / 2;
        if (lastDist) zoomAt(mx, my, dist / lastDist);
        if (lastMid) { tx += mx - lastMid.x; ty += my - lastMid.y; apply(); }
        lastDist = dist; lastMid = { x: mx, y: my };
      } else if (dragging && pts.length === 1) {
        tx += e.clientX - lastX; ty += e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; apply();
      }
    });
    function end(e) {
      if (active[e.pointerId]) { delete active[e.pointerId]; count--; }
      if (count < 2) { lastDist = 0; lastMid = null; }
      if (count === 0) { dragging = false; st.classList.remove("grabbing"); }
      else if (count === 1) { var p = vals()[0]; lastX = p.x; lastY = p.y; dragging = true; }
    }
    st.addEventListener("pointerup", end);
    st.addEventListener("pointercancel", end);
    st.addEventListener("wheel", function (e) { if (!panOn) return; e.preventDefault(); zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.2 : 1 / 1.2); }, { passive: false });
  }

  /* ============ видео-заставка ============ */
  function playIntro(src) {
    if (!src) { endIntro(); return; }
    R.ov.classList.add("ph-playing");
    if (R.vid.getAttribute("src") !== src) R.vid.setAttribute("src", src);
    try { R.vid.currentTime = 0; } catch (x) {}
    var p = R.vid.play && R.vid.play();
    if (p && p["catch"]) p["catch"](endIntro);
  }
  function endIntro() { if (R) { R.ov.classList.remove("ph-playing"); try { R.vid.pause(); } catch (x) {} } }

  /* ============ хотспоты и карточка ============ */
  function buildHots(scene) {
    var old = R.world.querySelectorAll(".ph-hot");
    for (var i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]);
    (scene.hotspots || []).forEach(function (h, idx) {
      var d = el("div", "ph-hot");
      d.style.left = h.x + "%"; d.style.top = h.y + "%";
      d.appendChild(el("div", "ph-pulse"));
      d.addEventListener("click", function (e) { e.stopPropagation(); openCard(scene, idx); });
      R.world.appendChild(d);
    });
  }
  function openCard(scene, idx) {
    var h = scene.hotspots[idx], base = scene.base || "";
    var hero = h.image
      ? '<div class="ph-hero"><img src="' + base + h.image + '" alt=""></div>'
      : '<div class="ph-hero ph-mono"><span>' + ((h.title || "?").charAt(0)) + '</span></div>';
    var au = h.audio ? '<button class="ph-play" type="button" data-au="' + base + h.audio + '">▶ ' + (h.audioLabel || "Послушать") + '</button>' : "";
    var role = h.subtitle ? '<div class="ph-role">' + h.subtitle + '</div>' : "";
    R.card.innerHTML = hero + '<div class="ph-body"><div class="ph-nm">' + (h.title || "") + '</div>' + role +
      '<div class="ph-text">' + (h.text || "") + '</div>' + au +
      '<button class="ph-btn" type="button">' + (scene.okLabel || "Понятно") + '</button></div>';
    R.pop.classList.add("on");
    if (typeof scene.onOpenCard === "function") scene.onOpenCard(h, idx);
  }

  /* ============ РЕДАКТОР ХОТСПОТОВ ============
     PanoramaHotspots.edit(scene) — та же сцена, но:
     тап по картинке ставит точку; точку можно перетащить; координаты (в % от
     изображения) пишутся в панель снизу — кнопка копирует готовый JSON. */
  var editOn = false, edHots = [], edBar = null;

  function toPct(clientX, clientY) {
    if (panOn) {
      var r = R.stage.getBoundingClientRect();
      var wx = (clientX - r.left - tx) / scale, wy = (clientY - r.top - ty) / scale;
      return { x: wx / IMW * 100, y: wy / IMH * 100 };
    }
    var ir = R.img.getBoundingClientRect();
    return { x: (clientX - ir.left) / ir.width * 100, y: (clientY - ir.top) / ir.height * 100 };
  }
  function rnd(v) { return Math.round(v * 10) / 10; }

  function edAddAt(clientX, clientY) {
    var p = toPct(clientX, clientY);
    if (p.x < 0 || p.x > 100 || p.y < 0 || p.y > 100) return;   // мимо картинки
    edHots.push({ x: rnd(p.x), y: rnd(p.y) });
    edRender();
  }
  function edJson() {
    var lines = edHots.map(function (h) {
      var extra = ""; for (var k in h) if (h.hasOwnProperty(k) && k !== "x" && k !== "y") extra += "," + k + ":" + JSON.stringify(h[k]);
      return " {x:" + h.x + ",y:" + h.y + extra + "}";
    });
    return "hotspots:[\n" + lines.join(",\n") + "\n]";
  }
  function edRender() {
    var old = R.world.querySelectorAll(".ph-edhot");
    for (var i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]);
    edHots.forEach(function (h, idx) {
      var d = el("div", "ph-edhot");
      d.style.left = h.x + "%"; d.style.top = h.y + "%";
      d.textContent = String(idx + 1);
      /* перетаскивание маркера (не отдаём событие стейджу) */
      d.addEventListener("pointerdown", function (e) {
        e.stopPropagation(); if (e.preventDefault) e.preventDefault();
        d.classList.add("drag");
        function mv(ev) { var p = toPct(ev.clientX, ev.clientY); h.x = rnd(Math.max(0, Math.min(100, p.x))); h.y = rnd(Math.max(0, Math.min(100, p.y))); d.style.left = h.x + "%"; d.style.top = h.y + "%"; edUpdateBar(); }
        function up() { d.classList.remove("drag"); document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); }
        document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
      });
      d.addEventListener("click", function (e) { e.stopPropagation(); });
      R.world.appendChild(d);
    });
    edUpdateBar();
  }
  function edUpdateBar() { if (edBar) edBar.ta.value = edJson(); }
  function ensureEdBar() {
    if (edBar) return edBar;
    var bar = el("div", "ph-edbar");
    var ta = el("textarea"); ta.readOnly = true; ta.setAttribute("spellcheck", "false");
    var row = el("div", "ph-edrow");
    var bCopy = el("button", "ph-edcopy"); bCopy.type = "button"; bCopy.textContent = "⧉ Скопировать JSON";
    var bUndo = el("button"); bUndo.type = "button"; bUndo.textContent = "↩ Удалить последнюю";
    var bDone = el("button"); bDone.type = "button"; bDone.textContent = "✕ Закрыть";
    row.appendChild(bCopy); row.appendChild(bUndo); row.appendChild(bDone);
    bar.appendChild(ta); bar.appendChild(row);
    document.body.appendChild(bar);
    bCopy.addEventListener("click", function () {
      var txt = edJson();
      try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt); } else { ta.readOnly = false; ta.select(); document.execCommand("copy"); ta.readOnly = true; } } catch (x) {}
      try { console.log(txt); } catch (x) {}
      bCopy.textContent = "✓ Скопировано"; setTimeout(function () { bCopy.textContent = "⧉ Скопировать JSON"; }, 1200);
    });
    bUndo.addEventListener("click", function () { edHots.pop(); edRender(); });
    bDone.addEventListener("click", close_);
    edBar = { bar: bar, ta: ta };
    return edBar;
  }
  function edStart(scene) {
    editOn = true;
    /* стартуем с уже расставленных точек сцены — можно править существующую разметку */
    edHots = (scene.hotspots || []).map(function (h) { var c = {}; for (var k in h) if (h.hasOwnProperty(k)) c[k] = h[k]; return c; });
    ensureEdBar().bar.style.display = "";
    R.hint.textContent = "Редактор: тап — новая точка · тащи точку — подвинь";
    R.hint.style.display = "";
    edRender();
  }
  function edStop() {
    editOn = false; edHots = [];
    if (edBar) edBar.bar.style.display = "none";
    if (R) { var old = R.world.querySelectorAll(".ph-edhot"); for (var i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]); }
  }

  /* ============ публичное API ============ */
  var registry = {};
  function register(id, scene) { registry[id] = scene; return scene; }

  function open(sceneOrId, opts) {
    build();
    var scene = (typeof sceneOrId === "string") ? registry[sceneOrId] : sceneOrId;
    if (!scene || !scene.image) { return; }
    cur = scene;
    var wantEdit = !!(opts && opts.edit);
    if (!wantEdit) edStop();
    panOn = (scene.pan !== false);           // по умолчанию панорама с пан/зумом
    R.ov.classList.toggle("ph-fit", !panOn);
    R.ctl.style.display = panOn ? "" : "none";
    R.hint.textContent = scene.hint || "";
    R.hint.style.display = scene.hint ? "" : "none";
    R.img.onload = function () {
      IMW = R.img.naturalWidth; IMH = R.img.naturalHeight;
      R.world.style.transform = ""; if (panOn) setTimeout(fit, 0);
    };
    R.img.src = scene.image;
    if (R.img.complete && R.img.naturalWidth) R.img.onload();
    buildHots(wantEdit ? { hotspots: [] } : scene);   // в редакторе — свои маркеры вместо боевых точек
    R.ov.classList.add("on");
    if (wantEdit) { edStart(scene); } else { playIntro(scene.intro); }
  }
  function edit(sceneOrId) { open(sceneOrId, { edit: true }); }
  function close_() { if (R) { R.ov.classList.remove("on"); endIntro(); R.pop.classList.remove("on"); try { R.audio.pause(); } catch (x) {} } edStop(); }

  global.PanoramaHotspots = { open: open, close: close_, register: register, edit: edit };

})(typeof window !== "undefined" ? window : this);
