/* Пазл-история: нарезка библейской картинки на jigsaw-фрагменты, drag, склейка групп (механика как в «Птицы мира»). */
(function (global) {
  "use strict";

  var LEVELS = {
    easy: { cols: 4, rows: 3 },      /* 12 */
    medium: { cols: 8, rows: 8 },    /* 64 */
    hard: { cols: 12, rows: 11 }     /* 132 */
  };

  var JG_INSTR = {
    ru: "Перетащи фрагмент из ленты слева на поле и скрепи с соседями. Скреплённые двигаются вместе. Ленту можно прокручивать.",
    en: "Drag a piece from the left tray onto the board and snap neighbours together. Joined pieces move as one. Scroll the tray for more.",
    de: "Ziehe ein Teil von links aufs Feld und raste Nachbarn ein. Verbundene Teile bewegen sich zusammen. Die Leiste ist scrollbar.",
    es: "Arrastra una pieza de la bandeja izquierda al tablero y une las vecinas. Las unidas se mueven juntas. La bandeja se puede desplazar.",
    pt: "Arrasta uma peça da faixa à esquerda para o tabuleiro e encaixa as vizinhas. As unidas movem-se juntas. A faixa pode ser rolada.",
    fr: "Glisse une pièce du bandeau gauche sur le plateau et assemble les voisines. Les pièces liées bougent ensemble. Le bandeau défile.",
    ar: "اسحب قطعة من الشريط الأيسر إلى اللوحة واربطها بجيرانها. القطع المتصلة تتحرك معًا. يمكن تمرير الشريط."
  };
  var JG_PICK_BIRD = {
    ru: "Выбери картинку", en: "Choose a picture", de: "Bild wählen", es: "Elige una imagen",
    pt: "Escolhe uma imagem", fr: "Choisis une image", ar: "اختر صورة"
  };
  var JG_PICK_LVL = {
    ru: "Сложность", en: "Difficulty", de: "Schwierigkeit", es: "Dificultad",
    pt: "Dificuldade", fr: "Difficulté", ar: "الصعوبة"
  };
  var JG_EASY = {
    ru: "Лёгкий · 12 частей", en: "Easy · 12 pieces", de: "Leicht · 12 Teile", es: "Fácil · 12 piezas",
    pt: "Fácil · 12 peças", fr: "Facile · 12 pièces", ar: "سهل · 12 قطعة"
  };
  var JG_MED = {
    ru: "Средний · 64 части", en: "Medium · 64 pieces", de: "Mittel · 64 Teile", es: "Medio · 64 piezas",
    pt: "Médio · 64 peças", fr: "Moyen · 64 pièces", ar: "متوسط · 64 قطعة"
  };
  var JG_HARD = {
    ru: "Сложный · 132 части", en: "Hard · 132 pieces", de: "Schwer · 132 Teile", es: "Difícil · 132 piezas",
    pt: "Difícil · 132 peças", fr: "Difficile · 132 pièces", ar: "صعب · 132 قطعة"
  };
  var JG_BACK = {
    ru: "Назад", en: "Back", de: "Zurück", es: "Atrás", pt: "Voltar", fr: "Retour", ar: "رجوع"
  };
  var JG_DONE = {
    ru: "Пазл собран!", en: "Puzzle complete!", de: "Puzzle fertig!", es: "¡Puzzle listo!",
    pt: "Puzzle completo!", fr: "Puzzle terminé !", ar: "اكتمل اللغز!"
  };
  var JG_HINT = {
    ru: "Скреплено: {c} / {n}", en: "Joined: {c} / {n}", de: "Verbunden: {c} / {n}",
    es: "Unidas: {c} / {n}", pt: "Unidas: {c} / {n}", fr: "Assemblées : {c} / {n}", ar: "متصلة: {c} / {n}"
  };
  var JG_DONE_MARK = {
    ru: "Уже собран", en: "Already solved", de: "Bereits gelöst",
    es: "Ya resuelto", pt: "Já resolvido", fr: "Déjà résolu", ar: "محلول مسبقاً"
  };
  var JG_DONE_LVL = {
    ru: "Пройдено", en: "Done", de: "Erledigt", es: "Hecho", pt: "Feito", fr: "Fait", ar: "تم"
  };
  var JG_AGAIN = {
    ru: "Выполнить ещё раз", en: "Play again", de: "Nochmal spielen",
    es: "Jugar de nuevo", pt: "Jogar outra vez", fr: "Rejouer", ar: "العب مرة أخرى"
  };
  var JG_COMPLETED = {
    ru: "Уже выполнено", en: "Already completed", de: "Bereits geschafft",
    es: "Ya completado", pt: "Já concluído", fr: "Déjà terminé", ar: "مكتمل مسبقاً"
  };
  var JG_LEVEL_ORDER = ["easy", "medium", "hard"];
  var JG_STORAGE_KEY = "bible_jigsaw_done_v1";

  function openJigsawSandbox(api, data) {
    var T = api.T, escapeHtml = api.escapeHtml;
    var showSbIntro = api.showSbIntro, showSbFinish = api.showSbFinish;
    var layer = document.getElementById("sandboxLayer");
    var portraits = [];
    var selected = null, levelKey = "easy", finished = false;
    var pieces = [], groups = {}, nextGid = 1, pw = 0, ph = 0, tab = 0, imgW = 0, imgH = 0;
    var boardEl = null, stageEl = null, trayEl = null, drag = null, zTop = 10;
    var birdsGrid = null, birdsRo = null;

    layer.innerHTML =
      '<div class="sb-head"><span class="t">' + escapeHtml(T(data.title || { ru: "Пазл" })) +
      '</span><button class="x" id="sbX" aria-label="Закрыть">×</button></div>' +
      '<div class="jg-toolbar" id="jgBar" hidden></div>' +
      '<div class="jg-body" id="jgBody"></div>' +
      '<div class="sb-readout" id="jgReadout" hidden></div>';

    var body = layer.querySelector("#jgBody");
    var bar = layer.querySelector("#jgBar");
    var readout = layer.querySelector("#jgReadout");
    layer.querySelector("#sbX").onclick = function () { layer.hidden = true; };
    layer.hidden = false;

    showSbIntro(layer, data, data.instr || JG_INSTR, function () { showBirdPicker(); });

    function volumeCards() {
      var vol = null;
      try { vol = window.VOLUME || window.BIBLE || null; } catch (e) {}
      try {
        if (!vol && window.parent && window.parent !== window) {
          vol = window.parent.VOLUME || window.parent.BIBLE || null;
        }
      } catch (e) {}
      if (!vol) return [];
      var list = [];
      var i, c;
      if (vol.heroes) for (i = 0; i < vol.heroes.length; i++) {
        c = vol.heroes[i];
        list.push({ id: c.id, name: c.name, face: "../img/" + c.id + "_" + c.slug + ".webp" });
      }
      if (vol.plots) for (i = 0; i < vol.plots.length; i++) {
        c = vol.plots[i];
        if (c.imgReady === false) continue;
        list.push({ id: c.id, name: c.name, face: "../img/" + c.id + "_" + c.slug + ".webp" });
      }
      return list;
    }
    function deckCards() {
      var sources = [];
      if (data && data.portraits && data.portraits.length) sources.push(data.portraits);
      sources.push(volumeCards());
      for (var s = 0; s < sources.length; s++) {
        if (sources[s] && sources[s].length) return sources[s];
      }
      return [];
    }
    function loadPortraits() {
      var cards = deckCards();
      return cards.map(function (c) {
        var face = facePath(c.face || c.hero || c.img || c.photo || c.sil || "");
        var name = c.name || c.title || { ru: c.id || face };
        return { id: c.id || face, name: name, face: face };
      }).filter(function (c) { return !!c.face; });
    }
    function facePath(p) {
      if (!p) return "";
      p = String(p).split("?")[0].replace(/^\.\//, "");
      if (p.indexOf("../") === 0) return p;
      if (p.indexOf("/img/") >= 0) {
        var i = p.indexOf("/img/");
        return ".." + p.substring(i);
      }
      if (p.indexOf("img/") === 0) return "../" + p;
      return p;
    }

    function layoutBirdGrid() {
      if (!birdsGrid) return;
      var gapX = 8;
      var gapY = 14;
      var minCard = 78; /* крупнее карточки → меньше колонок */
      var w = birdsGrid.clientWidth || body.clientWidth || 320;
      var cols = Math.floor((w + gapX) / (minCard + gapX));
      if (cols < 3) cols = 3;
      if (cols > 8) cols = 8;
      birdsGrid.style.setProperty("--jg-cols", String(cols));
      birdsGrid.style.setProperty("--jg-gap-x", gapX + "px");
      birdsGrid.style.setProperty("--jg-gap-y", gapY + "px");
    }

    function bindBirdGridLayout(grid) {
      birdsGrid = grid;
      layoutBirdGrid();
      if (birdsRo) {
        try { birdsRo.disconnect(); } catch (e) {}
        birdsRo = null;
      }
      if (typeof ResizeObserver !== "undefined") {
        birdsRo = new ResizeObserver(function () { layoutBirdGrid(); });
        birdsRo.observe(grid);
      } else {
        window.addEventListener("resize", layoutBirdGrid);
      }
    }

    function preloadFaces(faces, onDone) {
      var left = faces.length;
      if (!left) { onDone(); return; }
      var done = false;
      function tick() {
        left--;
        if (left <= 0 && !done) { done = true; onDone(); }
      }
      faces.forEach(function (src) {
        var im = new Image();
        im.onload = tick;
        im.onerror = tick;
        im.src = src;
      });
      setTimeout(function () {
        if (!done) { done = true; onDone(); }
      }, 15000);
    }

    /* Ставим src всем сразу и ждём decode — появление одним кадром */
    function assignAndRevealBirdImages(imgs, grid) {
      if (!grid || !imgs.length) {
        if (grid) {
          grid.classList.remove("is-loading");
          grid.classList.add("is-ready");
        }
        return;
      }
      var left = imgs.length;
      var finishedReveal = false;
      function finish() {
        if (finishedReveal) return;
        finishedReveal = true;
        if (!birdsGrid || birdsGrid !== grid) return;
        requestAnimationFrame(function () {
          if (!birdsGrid || birdsGrid !== grid) return;
          grid.classList.remove("is-loading");
          grid.classList.add("is-ready");
        });
      }
      function tick() {
        left--;
        if (left <= 0) finish();
      }
      function afterPaint(img) {
        if (img && typeof img.decode === "function") {
          img.decode().then(tick, tick);
        } else {
          tick();
        }
      }
      imgs.forEach(function (it) {
        var img = it.el;
        var settled = false;
        function once(ok) {
          if (settled) return;
          settled = true;
          if (ok) afterPaint(img);
          else tick();
        }
        img.decoding = "async";
        img.loading = "eager";
        img.onload = function () { once(true); };
        img.onerror = function () { once(false); };
        img.src = it.src;
        if (img.complete) {
          if (img.naturalWidth) once(true);
          else once(false);
        }
      });
      setTimeout(finish, 15000);
    }

    function faceIdFromSrc(src) {
      var base = String(src || "").split("?")[0].split("/").pop() || "";
      return base.replace(/\.(webp|png|jpe?g|gif)$/i, "");
    }

    function birdStorageId(bird) {
      if (!bird) return "";
      if (bird.id) return String(bird.id);
      return faceIdFromSrc(bird.face || "");
    }

    function loadDoneMap() {
      var map = {};
      try {
        var raw = localStorage.getItem(JG_STORAGE_KEY);
        if (!raw) return map;
        var obj = JSON.parse(raw);
        if (obj && typeof obj === "object" && !Array.isArray(obj)) return obj;
      } catch (e) {}
      return map;
    }

    function saveDoneMap(map) {
      try { localStorage.setItem(JG_STORAGE_KEY, JSON.stringify(map)); } catch (e) {}
    }

    function markBirdLevelDone(bird, lv) {
      var id = birdStorageId(bird);
      if (!id || !lv) return;
      var map = loadDoneMap();
      if (!map[id]) map[id] = {};
      if (map[id][lv]) return;
      map[id][lv] = true;
      saveDoneMap(map);
    }

    function birdDoneLevels(bird, doneMap) {
      var id = birdStorageId(bird);
      var o = (doneMap && doneMap[id]) || {};
      var out = [];
      for (var i = 0; i < JG_LEVEL_ORDER.length; i++) {
        if (o[JG_LEVEL_ORDER[i]]) out.push(JG_LEVEL_ORDER[i]);
      }
      return out;
    }

    function isLevelDone(bird, lv, doneMap) {
      var id = birdStorageId(bird);
      return !!(doneMap && doneMap[id] && doneMap[id][lv]);
    }

    function showBirdPicker() {
      finished = false; selected = null;
      portraits = loadPortraits();
      var doneMap = loadDoneMap();
      bar.hidden = true; readout.hidden = true; readout.innerHTML = "";
      body.className = "jg-body jg-pick";
      body.innerHTML =
        '<div class="jg-section-title">' + escapeHtml(T(JG_PICK_BIRD)) +
        (portraits.length ? ' <small class="jg-count">(' + portraits.length + ")</small>" : "") +
        "</div>" +
        '<div class="jg-birds is-loading" id="jgBirds"></div>';
      var grid = body.querySelector("#jgBirds");
      if (!portraits.length) {
        birdsGrid = null;
        body.innerHTML = '<p class="jg-empty">' + escapeHtml(T({
          ru: "Нет картинок. Обнови страницу игр.",
          en: "No pictures found. Refresh the games page.",
          de: "Keine Bilder. Seite neu laden.",
          es: "No hay retratos. Recarga la página.",
          pt: "Sem retratos. Atualiza a página.",
          fr: "Pas de portraits. Recharge la page.",
          ar: "لا توجد صور. حدّث الصفحة."
        })) + "</p>";
        return;
      }

      var imgs = [];
      var frag = document.createDocumentFragment();
      portraits.forEach(function (bird) {
        var doneLvls = birdDoneLevels(bird, doneMap);
        var allDone = doneLvls.length === JG_LEVEL_ORDER.length;
        var b = document.createElement("button");
        b.type = "button";
        b.className = "jg-bird" + (doneLvls.length ? " pn-bird-done" : "") + (allDone ? " pn-bird-all" : "");
        var label = T(bird.name);
        b.title = doneLvls.length ? (label + " — " + T(JG_DONE_MARK) + " (" + doneLvls.length + "/3)") : label;
        b.setAttribute("aria-label", b.title);
        var img = document.createElement("img");
        img.alt = "";
        img.decoding = "async";
        img.loading = "eager";
        /* src не ставим сразу — все появятся одновременно после общей загрузки */
        var ph = document.createElement("span");
        ph.className = "ph";
        ph.appendChild(img);
        var nm = document.createElement("span");
        nm.className = "nm";
        nm.textContent = label;
        b.appendChild(ph);
        b.appendChild(nm);
        if (doneLvls.length) {
          var dots = document.createElement("span");
          dots.className = "pn-lvl-dots";
          dots.setAttribute("aria-hidden", "true");
          JG_LEVEL_ORDER.forEach(function (lv) {
            var d = document.createElement("span");
            d.className = "pn-lvl-dot" + (doneLvls.indexOf(lv) >= 0 ? " on" : "") + " lv-" + lv;
            dots.appendChild(d);
          });
          b.appendChild(dots);
        }
        b.onclick = function () { selected = bird; showLevelPicker(); };
        frag.appendChild(b);
        imgs.push({ el: img, src: bird.face });
      });
      grid.appendChild(frag);
      bindBirdGridLayout(grid);

      /* 1) прогрев кэша параллельно  2) src всем DOM-img  3) reveal после decode всех */
      preloadFaces(portraits.map(function (p) { return p.face; }), function () {
        if (!birdsGrid || birdsGrid !== grid) return;
        assignAndRevealBirdImages(imgs, grid);
      });
    }

    function showLevelPicker() {
      birdsGrid = null;
      if (birdsRo) {
        try { birdsRo.disconnect(); } catch (e) {}
        birdsRo = null;
      }
      var doneMap = loadDoneMap();
      readout.hidden = true; readout.innerHTML = "";
      bar.hidden = false;
      bar.innerHTML =
        '<button type="button" class="jg-back" id="jgBack">' + escapeHtml(T(JG_BACK)) + "</button>" +
        '<span class="jg-sel">' + escapeHtml(T(selected.name)) + "</span>";
      bar.querySelector("#jgBack").onclick = showBirdPicker;
      body.className = "jg-body jg-levels";
      body.innerHTML =
        '<div class="jg-section-title">' + escapeHtml(T(JG_PICK_LVL)) + "</div>" +
        '<div class="jg-lvl-wrap"><div class="jg-lvl-preview"><img src="' + escapeHtml(selected.face) + '" alt="" decoding="async"></div></div>' +
        '<div class="jg-lvls pn-lvls">' +
        levelBtnHtml("easy", JG_EASY, doneMap) +
        levelBtnHtml("medium", JG_MED, doneMap) +
        levelBtnHtml("hard", JG_HARD, doneMap) +
        "</div>";
      [].forEach.call(body.querySelectorAll("[data-lv]"), function (btn) {
        btn.onclick = function () {
          levelKey = btn.getAttribute("data-lv") || "easy";
          if (isLevelDone(selected, levelKey, doneMap)) showCompletedPreview();
          else startPlay();
        };
      });
    }

    function levelBtnHtml(key, titleObj, doneMap) {
      var done = isLevelDone(selected, key, doneMap);
      return '<button type="button" data-lv="' + key + '" class="' + (done ? "pn-lvl-done" : "") + '">' +
        '<span class="pn-lvl-title">' + escapeHtml(T(titleObj)) + "</span>" +
        (done ? '<span class="pn-lvl-check">✓ ' + escapeHtml(T(JG_DONE_LVL)) + "</span>" : "") +
        "</button>";
    }

    function showCompletedPreview() {
      birdsGrid = null;
      if (birdsRo) {
        try { birdsRo.disconnect(); } catch (e) {}
        birdsRo = null;
      }
      bar.hidden = false;
      bar.innerHTML =
        '<button type="button" class="jg-back" id="jgBack">' + escapeHtml(T(JG_BACK)) + "</button>" +
        '<span class="jg-sel">' + escapeHtml(T(selected.name)) + " · " + escapeHtml(T(
          levelKey === "hard" ? JG_HARD : levelKey === "medium" ? JG_MED : JG_EASY
        )) + "</span>";
      bar.querySelector("#jgBack").onclick = showLevelPicker;
      body.className = "jg-body jg-done-view";
      body.innerHTML =
        '<div class="jg-section-title">' + escapeHtml(T(JG_COMPLETED)) + "</div>" +
        '<div class="jg-done-wrap"><div class="jg-done-preview"><img src="' + escapeHtml(selected.face) + '" alt="" decoding="async"></div></div>' +
        '<div class="sb-modal-actions jg-done-actions">' +
        '<button type="button" class="pri" id="jgAgain">' + escapeHtml(T(JG_AGAIN)) + "</button>" +
        "</div>";
      body.querySelector("#jgAgain").onclick = function () { startPlay(); };
      readout.hidden = true; readout.innerHTML = "";
    }

    function startPlay() {
      finished = false;
      var lv = LEVELS[levelKey] || LEVELS.easy;
      var cols = lv.cols, rows = lv.rows;
      bar.hidden = false;
      bar.innerHTML =
        '<button type="button" class="jg-back" id="jgBack">' + escapeHtml(T(JG_BACK)) + "</button>" +
        '<span class="jg-sel">' + escapeHtml(T(selected.name)) + " · " + escapeHtml(T(
          levelKey === "hard" ? JG_HARD : levelKey === "medium" ? JG_MED : JG_EASY
        )) + "</span>";
      bar.querySelector("#jgBack").onclick = showLevelPicker;
      body.className = "jg-body jg-play";
      body.innerHTML =
        '<div class="jg-play-layout">' +
        '<div class="jg-tray" id="jgTray"></div>' +
        '<div class="jg-stage" id="jgStage"><div class="jg-board" id="jgBoard"></div></div>' +
        "</div>";
      trayEl = body.querySelector("#jgTray");
      stageEl = body.querySelector("#jgStage");
      boardEl = body.querySelector("#jgBoard");
      readout.hidden = false;
      readout.textContent = "";

      var img = new Image();
      /* без crossOrigin — иначе на локальном OSPanel картинка часто падает с onerror */
      img.onload = function () {
        if (!img.naturalWidth) {
          readout.textContent = T({ ru: "Не удалось загрузить картинку", en: "Could not load image" });
          return;
        }
        buildPuzzle(img, cols, rows);
      };
      img.onerror = function () {
        /* повтор с абсолютным URL */
        if (!img.__retried) {
          img.__retried = true;
          try { img.src = new URL(selected.face, location.href).href; } catch (e) {
            readout.textContent = T({ ru: "Не удалось загрузить картинку", en: "Could not load image" });
          }
          return;
        }
        readout.textContent = T({ ru: "Не удалось загрузить картинку", en: "Could not load image" });
      };
      img.src = selected.face;
    }

    function buildPuzzle(img, cols, rows) {
      pieces = []; groups = {}; nextGid = 1; zTop = 10;
      if (trayEl) trayEl.innerHTML = "";
      var sw = stageEl.clientWidth || 360;
      var sh = Math.max(280, stageEl.clientHeight || 420);
      var margin = 14;
      var maxW = sw - margin * 2;
      var maxH = sh - margin * 2;
      var aspect = img.naturalWidth / img.naturalHeight;
      imgW = maxW; imgH = imgW / aspect;
      if (imgH > maxH) { imgH = maxH; imgW = imgH * aspect; }
      pw = imgW / cols; ph = imgH / rows;
      tab = Math.max(6, Math.min(pw, ph) * 0.22);

      boardEl.style.width = Math.round(imgW) + "px";
      boardEl.style.height = Math.round(imgH) + "px";
      boardEl.style.left = Math.round((sw - imgW) / 2) + "px";
      boardEl.style.top = Math.round((sh - imgH) / 2) + "px";
      boardEl.style.backgroundImage = 'url("' + selected.face.replace(/"/g, "") + '")';
      boardEl.innerHTML = "";

      var hEdge = [], vEdge = [], r, c;
      for (r = 0; r < rows; r++) {
        hEdge[r] = [];
        for (c = 0; c < cols - 1; c++) hEdge[r][c] = (hash(r, c, 1) % 2) ? 1 : -1;
      }
      for (r = 0; r < rows - 1; r++) {
        vEdge[r] = [];
        for (c = 0; c < cols; c++) vEdge[r][c] = (hash(r, c, 2) % 2) ? 1 : -1;
      }

      var order = [];
      for (r = 0; r < rows; r++) {
        for (c = 0; c < cols; c++) {
          var canvas = document.createElement("canvas");
          renderPiece(canvas, img, c, r, cols, rows, hEdge, vEdge);
          var el = document.createElement("div");
          el.className = "jg-piece";
          el.appendChild(canvas);
          var gid = nextGid++;
          var piece = {
            id: pieces.length, col: c, row: r, el: el, canvas: canvas,
            gid: gid, w: canvas.width, h: canvas.height,
            inTray: true, slot: null, x: 0, y: 0
          };
          groups[gid] = [piece.id];
          el.style.width = piece.w + "px";
          el.style.height = piece.h + "px";
          bindDrag(piece);
          pieces.push(piece);
          order.push(piece);
        }
      }
      /* перемешать ленту */
      for (var i = order.length - 1; i > 0; i--) {
        var j = (hash(i, order[i].col, order[i].row) % (i + 1));
        var tmp = order[i]; order[i] = order[j]; order[j] = tmp;
      }
      order.forEach(function (p) { putInTray(p); });
      updateHud();
    }

    function putInTray(piece) {
      piece.inTray = true;
      piece.el.classList.add("in-tray");
      piece.el.classList.remove("dragging");
      var slot = document.createElement("div");
      slot.className = "jg-tray-slot";
      slot.style.setProperty("--jg-ar", String(piece.w / Math.max(1, piece.h)));
      slot.setAttribute("role", "listitem");
      slot.setAttribute("aria-label", T({
        ru: "Фрагмент — перетащи на поле", en: "Piece — drag to the board", de: "Teil — aufs Feld ziehen",
        es: "Pieza — arrastra al tablero", pt: "Peça — arrasta para o tabuleiro",
        fr: "Pièce — glisse sur le plateau", ar: "قطعة — اسحب إلى اللوحة"
      }));
      slot.appendChild(piece.el);
      piece.el.style.left = "0";
      piece.el.style.top = "0";
      piece.slot = slot;
      trayEl.appendChild(slot);
    }

    function clearTraySelection() {
      if (!trayEl) return;
      [].forEach.call(trayEl.querySelectorAll(".jg-tray-slot.is-sel"), function (s) {
        s.classList.remove("is-sel");
      });
    }

    function placePieceOnBoard(piece, stageX, stageY) {
      if (!piece.inTray) return;
      takeOutOfTray(piece);
      var sw = stageEl.clientWidth || 360;
      var sh = stageEl.clientHeight || 420;
      var x = stageX != null ? stageX : (sw - piece.w) / 2;
      var y = stageY != null ? stageY : (sh - piece.h) / 2;
      piece.x = clamp(x, -tab, sw - piece.w + tab);
      piece.y = clamp(y, -tab, sh - piece.h + tab);
      applyPiecePos(piece);
      piece.el.style.zIndex = String(zTop++);
      trySnapGroup(piece.gid);
      updateHud();
      maybeWin();
    }

    function applyPiecePos(piece) {
      piece.el.style.left = piece.x + "px";
      piece.el.style.top = piece.y + "px";
    }

    function takeOutOfTray(piece) {
      if (!piece.inTray) return;
      piece.inTray = false;
      piece.el.classList.remove("in-tray");
      clearTraySelection();
      if (piece.slot) {
        if (piece.slot.parentNode) piece.slot.parentNode.removeChild(piece.slot);
        piece.slot = null;
      }
      stageEl.appendChild(piece.el);
      piece.el.style.width = piece.w + "px";
      piece.el.style.height = piece.h + "px";
    }

    function putBackInTray(piece) {
      if (piece.inTray) return;
      if (groups[piece.gid] && groups[piece.gid].length > 1) return;
      piece.el.classList.remove("dragging");
      putInTray(piece);
    }

    function clientToStage(clientX, clientY) {
      var rect = stageEl.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function isOverTray(clientX, clientY) {
      if (!trayEl) return false;
      var r = trayEl.getBoundingClientRect();
      return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
    }

    function hash(a, b, k) {
      return Math.abs((a * 73856093) ^ (b * 19349663) ^ (k * 83492791)) >>> 0;
    }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    function renderPiece(canvas, img, col, row, cols, rows, hEdge, vEdge) {
      var pad = tab;
      var cw = Math.ceil(pw + pad * 2);
      var ch = Math.ceil(ph + pad * 2);
      canvas.width = cw; canvas.height = ch;
      var ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, cw, ch);
      ctx.save();
      tracePiecePath(ctx, col, row, cols, rows, hEdge, vEdge, pad);
      ctx.clip();
      /* картинка: базовая клетка начинается в (pad,pad) */
      var sx = (col * pw) * (img.naturalWidth / imgW);
      var sy = (row * ph) * (img.naturalHeight / imgH);
      var sw = pw * (img.naturalWidth / imgW);
      var sh = ph * (img.naturalHeight / imgH);
      /* расширяем выборку на tab с каждой стороны, где есть выступ */
      var expandL = (col > 0) ? pad : 0;
      var expandT = (row > 0) ? pad : 0;
      var expandR = (col < cols - 1) ? pad : 0;
      var expandB = (row < rows - 1) ? pad : 0;
      /* проще: рисуем всю картинку со смещением так, чтобы клетка совпала */
      ctx.drawImage(
        img,
        0, 0, img.naturalWidth, img.naturalHeight,
        pad - col * pw, pad - row * ph, imgW, imgH
      );
      ctx.restore();
      /* обводка */
      ctx.save();
      tracePiecePath(ctx, col, row, cols, rows, hEdge, vEdge, pad);
      ctx.strokeStyle = "rgba(40,30,20,.45)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
      /* лёгкая тень внутри не нужна — CSS box-shadow */
      void expandL; void expandT; void expandR; void expandB; void sx; void sy; void sw; void sh;
    }

    function tracePiecePath(ctx, col, row, cols, rows, hEdge, vEdge, pad) {
      var x0 = pad, y0 = pad, x1 = pad + pw, y1 = pad + ph;
      var ts = tab;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      /* Верх: то же значение vEdge, что и низ соседа сверху — шип и паз совпадают.
         sign>0 = выступ вниз (в тело нижней клетки / паз в верхней). */
      if (row === 0) ctx.lineTo(x1, y0);
      else edgeH(ctx, x0, x1, y0, vEdge[row - 1][col], ts);
      /* Право: hEdge>0 = шип вправо у левой клетки = паз у правой */
      if (col === cols - 1) ctx.lineTo(x1, y1);
      else edgeV(ctx, y0, y1, x1, hEdge[row][col], ts);
      /* Низ */
      if (row === rows - 1) ctx.lineTo(x0, y1);
      else edgeH(ctx, x1, x0, y1, vEdge[row][col], ts);
      /* Лево: то же hEdge, что у правого края соседа слева */
      if (col === 0) ctx.lineTo(x0, y0);
      else edgeV(ctx, y1, y0, x0, hEdge[row][col - 1], ts);
      ctx.closePath();
    }

    /* Горизонтальное ребро xa→xb на линии y. sign>0 — выступ вниз. */
    function edgeH(ctx, xa, xb, y, sign, ts) {
      var dir = xb >= xa ? 1 : -1;
      var span = Math.abs(xb - xa);
      var mid = (xa + xb) / 2;
      var w = Math.min(ts * 1.15, span * 0.42);
      var s = sign >= 0 ? 1 : -1;
      ctx.lineTo(mid - dir * w, y);
      ctx.bezierCurveTo(
        mid - dir * w * 0.7, y,
        mid - dir * w * 0.85, y + s * ts * 0.15,
        mid - dir * w * 0.55, y + s * ts * 0.55
      );
      ctx.bezierCurveTo(
        mid - dir * w * 0.25, y + s * ts,
        mid + dir * w * 0.25, y + s * ts,
        mid + dir * w * 0.55, y + s * ts * 0.55
      );
      ctx.bezierCurveTo(
        mid + dir * w * 0.85, y + s * ts * 0.15,
        mid + dir * w * 0.7, y,
        mid + dir * w, y
      );
      ctx.lineTo(xb, y);
    }
    /* Вертикальное ребро ya→yb на линии x. sign>0 — выступ вправо. */
    function edgeV(ctx, ya, yb, x, sign, ts) {
      var dir = yb >= ya ? 1 : -1;
      var span = Math.abs(yb - ya);
      var mid = (ya + yb) / 2;
      var w = Math.min(ts * 1.15, span * 0.42);
      var s = sign >= 0 ? 1 : -1;
      ctx.lineTo(x, mid - dir * w);
      ctx.bezierCurveTo(
        x, mid - dir * w * 0.7,
        x + s * ts * 0.15, mid - dir * w * 0.85,
        x + s * ts * 0.55, mid - dir * w * 0.55
      );
      ctx.bezierCurveTo(
        x + s * ts, mid - dir * w * 0.25,
        x + s * ts, mid + dir * w * 0.25,
        x + s * ts * 0.55, mid + dir * w * 0.55
      );
      ctx.bezierCurveTo(
        x + s * ts * 0.15, mid + dir * w * 0.85,
        x, mid + dir * w * 0.7,
        x, mid + dir * w
      );
      ctx.lineTo(x, yb);
    }

    function bindDrag(piece) {
      var el = piece.el;

      function startBoardDrag(e) {
        var members = groups[piece.gid].map(function (id) { return pieces[id]; });
        members.forEach(function (p) { p.el.style.zIndex = String(zTop++); });
        drag.armed = true;
        drag.fromTray = false;
        drag.sx = e.clientX;
        drag.sy = e.clientY;
        drag.origins = members.map(function (p) { return { p: p, x: p.x, y: p.y }; });
        members.forEach(function (p) { p.el.classList.add("dragging"); });
      }

      function pullFromTrayAt(e) {
        var pt = clientToStage(e.clientX, e.clientY);
        takeOutOfTray(piece);
        piece.x = pt.x - piece.w / 2;
        piece.y = pt.y - piece.h / 2;
        var sw = stageEl.clientWidth || 360;
        var sh = stageEl.clientHeight || 420;
        piece.x = clamp(piece.x, -tab, sw - piece.w + tab);
        piece.y = clamp(piece.y, -tab, sh - piece.h + tab);
        applyPiecePos(piece);
        startBoardDrag(e);
        try { el.setPointerCapture(e.pointerId); } catch (_) {}
      }

      function unbindWin() {
        window.removeEventListener("pointermove", onMove, true);
        window.removeEventListener("pointerup", onUp, true);
        window.removeEventListener("pointercancel", onUp, true);
      }

      function onDown(e) {
        if (finished) return;
        if (e.button != null && e.button !== 0) return;
        if (drag) return;

        drag = {
          gid: piece.gid,
          pointerId: e.pointerId,
          sx: e.clientX,
          sy: e.clientY,
          fromTray: !!piece.inTray,
          armed: false,
          origins: null
        };

        if (!piece.inTray) {
          e.preventDefault();
          e.stopPropagation();
          startBoardDrag(e);
          try { el.setPointerCapture(e.pointerId); } catch (_) {}
        } else {
          /* не preventDefault — иначе лента не скроллится; слушаем window */
          window.addEventListener("pointermove", onMove, true);
          window.addEventListener("pointerup", onUp, true);
          window.addEventListener("pointercancel", onUp, true);
        }
      }

      function onMove(e) {
        if (!drag || drag.gid !== piece.gid) return;
        if (drag.pointerId != null && e.pointerId !== drag.pointerId) return;

        if (!drag.armed) {
          var dx0 = e.clientX - drag.sx;
          var dy0 = e.clientY - drag.sy;
          var dist = Math.hypot(dx0, dy0);
          if (dist < 8) return;

          /* вертикальный жест над лентой — отдаём нативный скролл (touch-action:pan-y) */
          if (drag.fromTray && Math.abs(dy0) >= Math.abs(dx0) && isOverTray(e.clientX, e.clientY)) {
            unbindWin();
            drag = null;
            return;
          }

          e.preventDefault();
          if (piece.inTray) pullFromTrayAt(e);
          else startBoardDrag(e);
          return;
        }

        e.preventDefault();
        var dx = e.clientX - drag.sx;
        var dy = e.clientY - drag.sy;
        drag.origins.forEach(function (o) {
          o.p.x = o.x + dx;
          o.p.y = o.y + dy;
          applyPiecePos(o.p);
        });
      }

      function onUp(e) {
        if (!drag || drag.gid !== piece.gid) return;
        if (drag.pointerId != null && e.pointerId !== drag.pointerId) return;

        unbindWin();

        if (!drag.armed) {
          drag = null;
          return;
        }

        var members = groups[piece.gid].map(function (id) { return pieces[id]; });
        members.forEach(function (p) { p.el.classList.remove("dragging"); });

        var overTray = isOverTray(e.clientX, e.clientY);
        try { el.releasePointerCapture(e.pointerId); } catch (_) {}
        drag = null;

        if (overTray && members.length === 1) {
          putBackInTray(piece);
          updateHud();
          return;
        }
        trySnapGroup(piece.gid);
        updateHud();
        maybeWin();
      }

      el.addEventListener("pointerdown", onDown);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
      el.addEventListener("pointercancel", onUp);
    }

    function trySnapGroup(gid) {
      var ids = groups[gid].slice();
      var snapped = true;
      while (snapped) {
        snapped = false;
        for (var i = 0; i < ids.length && !snapped; i++) {
          var a = pieces[ids[i]];
          if (a.inTray) continue;
          for (var j = 0; j < pieces.length; j++) {
            var b = pieces[j];
            if (b.inTray || b.gid === a.gid) continue;
            if (!areNeighbors(a, b)) continue;
            var wantX = a.x + (b.col - a.col) * pw;
            var wantY = a.y + (b.row - a.row) * ph;
            var dist = Math.hypot(b.x - wantX, b.y - wantY);
            var thr = Math.max(14, Math.min(pw, ph) * 0.38);
            if (dist <= thr) {
              var dx = wantX - b.x, dy = wantY - b.y;
              groups[b.gid].forEach(function (id) {
                var p = pieces[id];
                p.x += dx; p.y += dy;
                p.el.style.left = p.x + "px";
                p.el.style.top = p.y + "px";
              });
              mergeGroups(a.gid, b.gid);
              ids = groups[a.gid].slice();
              snapped = true;
              break;
            }
          }
        }
      }
    }

    function areNeighbors(a, b) {
      return (Math.abs(a.col - b.col) + Math.abs(a.row - b.row)) === 1;
    }

    function mergeGroups(ga, gb) {
      if (ga === gb) return;
      var keep = ga, drop = gb;
      groups[drop].forEach(function (id) {
        pieces[id].gid = keep;
        groups[keep].push(id);
      });
      delete groups[drop];
      /* лёгкая вспышка */
      groups[keep].forEach(function (id) {
        pieces[id].el.classList.remove("snap");
        void pieces[id].el.offsetWidth;
        pieces[id].el.classList.add("snap");
      });
    }

    function joinedCount() {
      var n = pieces.length;
      if (!n) return 0;
      var gids = Object.keys(groups);
      /* число «скреплений» ≈ n - число групп */
      return n - gids.length;
    }

    function updateHud() {
      var n = pieces.length;
      var c = joinedCount();
      readout.innerHTML = "<span>" + escapeHtml(T(JG_HINT)).replace("{c}", String(c)).replace("{n}", String(Math.max(0, n - 1))) + "</span>";
    }

    function maybeWin() {
      if (finished || !pieces.length) return;
      var gids = Object.keys(groups);
      if (gids.length === 1) {
        finished = true;
        /* выровнять пазл к доске */
        var p0 = pieces[0];
        var ox = parseFloat(boardEl.style.left) || 0;
        var oy = parseFloat(boardEl.style.top) || 0;
        var dx = (ox - tab) - (p0.x - p0.col * pw);
        var dy = (oy - tab) - (p0.y - p0.row * ph);
        /* точнее: целевая позиция куска = board + col*pw - tab */
        pieces.forEach(function (p) {
          p.x = ox + p.col * pw - tab;
          p.y = oy + p.row * ph - tab;
          p.el.style.left = p.x + "px";
          p.el.style.top = p.y + "px";
          p.el.classList.add("done");
        });
        void dx; void dy;
        markBirdLevelDone(selected, levelKey);
        showSbFinish(layer, data, {
          text: T(JG_DONE) + " · " + T(selected.name),
          onAgain: function () { showBirdPicker(); }
        });
      }
    }
  }

  global.BibleJigsawOpen = openJigsawSandbox;
})(window);
