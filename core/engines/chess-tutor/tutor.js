/* core/engines/chess-tutor/tutor.js
 * Каркас приложения-наставника платформы «настолка + наставник» (ES5, офлайн).
 * Содержания шахмат тут НЕТ — оно приходит из колоды (config.skills). Каркас
 * рисует экраны, ведёт три режима (Учитель / Симуляция / Партнёр), адаптив (BKT),
 * прогресс (localStorage) и родительский «Уровень знаний».
 *
 * Запуск из колоды:
 *   ChessTutor.boot({
 *     mount: el, title: 'Образовариум · Шахматы',
 *     progressKey: 'chs_prog', skills: CHESS_SKILLS, cardImageBase: 'assets/cards/'
 *   });
 *
 * Зависимости (подключить раньше): chess.js, board.js, ai.js, bkt.js.
 */
var ChessTutor = (function () {
  'use strict';

  function boot(config) {
    var SK = config.skills.list;
    var STAGES = config.skills.stages;
    var mount = config.mount;
    var store = Store(config.progressKey);
    var state = store.load();

    // ---- утилиты ----------------------------------------------------------
    function el(tag, cls, html) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (html != null) e.innerHTML = html;
      return e;
    }
    function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
    function skill(n) { for (var i = 0; i < SK.length; i++) if (SK[i].n === n) return SK[i]; return null; }
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function barStr(pL) { var b = BKT.bars(pL); var s = ''; for (var i = 0; i < 5; i++) s += (i < b) ? '▰' : '▱'; return s; }

    function speak(text) {
      if (!state.settings.voice) return;
      try {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(String(text).replace(/\[long pause\]/g, ', '));
        u.lang = 'ru-RU'; u.rate = 0.95;
        window.speechSynthesis.speak(u);
      } catch (e) {}
    }

    // ---- состояние навыка / ступеней --------------------------------------
    function sdata(n) {
      if (!state.skills[n]) state.skills[n] = { pL: null, seen: 0, history: [] };
      return state.skills[n];
    }
    // Освоение навыка — строже, чем один порог P(L): нужно ещё минимум
    // 5 заданий и 3 верных ответа подряд (защита от угадывания).
    // Достигнутое освоение «липкое» — назад не откатываем.
    function skillMastered(n) {
      var d = sdata(n);
      if (d.m) return true;
      if (!BKT.mastered(d.pL) || d.seen < 5) return false;
      var h = d.history;
      if (h.length < 3) return false;
      for (var i = h.length - 3; i < h.length; i++) if (!h[i].c) return false;
      d.m = true;
      store.save(state);
      return true;
    }
    function stageMastered(stage) {
      for (var i = 0; i < SK.length; i++)
        if (SK[i].stage === stage && !skillMastered(SK[i].n)) return false;
      return true;
    }
    function stageOpen(stage) {
      if (stage === 1) return true;
      return stageMastered(stage - 1);
    }
    function cardState(n) {
      var sk = skill(n), d = sdata(n);
      if (!stageOpen(sk.stage)) return 'locked';
      if (skillMastered(n)) return 'mastered';
      if (d.seen > 0) return 'progress';
      return 'open';
    }
    function recordAnswer(n, correct, kind, nOptions) {
      var d = sdata(n);
      d.pL = BKT.update(d.pL, correct, kind, nOptions);
      d.seen++;
      d.history.push({ c: correct ? 1 : 0, t: Date.now() });
      if (d.history.length > 40) d.history.shift();
      // открытие ступеней
      var sk = skill(n);
      if (skillMastered(n) && stageMastered(sk.stage) && state.openStage < sk.stage + 1)
        state.openStage = Math.min(4, sk.stage + 1);
      addAchievements();
      store.save(state);
    }
    function addAchievements() {
      function give(id, label) { for (var i = 0; i < state.achievements.length; i++) if (state.achievements[i].id === id) return; state.achievements.push({ id: id, label: label }); }
      var figs = [2, 3, 4, 5, 6, 7], allFigs = true;
      for (var i = 0; i < figs.length; i++) if (!skillMastered(figs[i])) allFigs = false;
      if (allFigs) give('figures', 'Освоил все фигуры');
      if (state.wins >= 1) give('firstwin', 'Первая победа');
    }

    // адаптивный уровень задания от освоения
    function levelFor(pL) { if (pL == null || pL < 0.4) return 1; if (pL < 0.7) return 2; return 3; }

    // ---- превращение пешки: выбор фигуры -----------------------------------
    function isPromotionMove(game, from, to) {
      var ms = game.moves({ square: from });
      for (var i = 0; i < ms.length; i++)
        if (ms[i].toAlg === to && ms[i].promotion) return true;
      return false;
    }
    function promoChoose(color, cb) {
      var overlay = el('div', 'ct-promo');
      var box = el('div', 'ct-promobox');
      box.appendChild(el('p', 'ct-prompt', 'В кого превратить пешку?'));
      var row = el('div', 'ct-row');
      var opts = [['q', '♕', '♛'], ['r', '♖', '♜'], ['b', '♗', '♝'], ['n', '♘', '♞']];
      for (var i = 0; i < opts.length; i++) (function (o) {
        var btn = el('button', 'ct-promobtn', color === 'w' ? o[1] : o[2]);
        btn.onclick = function () { document.body.removeChild(overlay); cb(o[0]); };
        row.appendChild(btn);
      })(opts[i]);
      box.appendChild(row);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
    }

    // ====================================================================
    //  РОУТЕР
    // ====================================================================
    var screen = {};
    var camStop = null;   // выключение камеры при уходе с экрана «навести камеру»
    var animTimer = null; // цикл анимации урока — гасим при любом переходе
    function go(name, arg) {
      try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
      if (camStop) { try { camStop(); } catch (e) {} camStop = null; }
      if (animTimer) { clearInterval(animTimer); animTimer = null; }
      clear(mount);
      (screen[name] || screen.home)(arg);
      mount.scrollTop = 0;
      try { window.scrollTo(0, 0); } catch (e) {}
    }

    function header(titleHtml, backTo, rightBtn) {
      var h = el('header', 'ct-head');
      if (backTo) { var b = el('button', 'ct-back', '‹ назад'); b.onclick = function () { go(backTo.name, backTo.arg); }; h.appendChild(b); }
      h.appendChild(el('div', 'ct-htitle', titleHtml));
      if (rightBtn) h.appendChild(rightBtn);
      return h;
    }

    // ---- СТАРТ -------------------------------------------------------------
    screen.start = function () {
      var w = el('div', 'ct-screen ct-start');
      w.appendChild(el('div', 'ct-logo', '♞'));
      w.appendChild(el('h1', null, 'Шахматы · Наставник'));
      w.appendChild(el('p', 'ct-sub', 'Возьми карту из колоды — и учись играть.'));
      var btn = el('button', 'ct-big', 'Начать');
      btn.onclick = function () {
        if (!state.started) { state.started = true; store.save(state); go('intro', 0); }
        else go('home');
      };
      w.appendChild(btn);
      if (state.started) {
        var cont = el('button', 'ct-link', 'Продолжить с того места');
        cont.onclick = function () { go('home'); };
        w.appendChild(cont);
      }
      mount.appendChild(w);
    };

    var INTRO = [
      { t: 'Карты — ключ к урокам', d: 'Каждая из 24 карт открывает свой навык: фигуры, правила, приёмы.' },
      { t: 'Наведи камеру или открой колоду', d: 'Можно навести камеру на карту, а можно просто выбрать её на экране.' }
    ];
    screen.intro = function (i) {
      i = i || 0;
      var s = INTRO[i];
      var w = el('div', 'ct-screen ct-start');
      w.appendChild(el('div', 'ct-logo', i === 0 ? '🎴' : '📷'));
      w.appendChild(el('h1', null, s.t));
      w.appendChild(el('p', 'ct-sub', s.d));
      var btn = el('button', 'ct-big', i + 1 < INTRO.length ? 'Дальше' : 'Открыть колоду');
      btn.onclick = function () { if (i + 1 < INTRO.length) go('intro', i + 1); else go('home'); };
      w.appendChild(btn);
      mount.appendChild(w);
    };

    // ---- ГЛАВНАЯ / КОЛОДА --------------------------------------------------
    screen.home = function () {
      var cam = el('button', 'ct-cam', '📷 Навести камеру');
      cam.onclick = function () { go('camera'); };
      mount.appendChild(header('<b>ОБРАЗОВАРИУМ · ШАХМАТЫ</b>', null, cam));

      var w = el('div', 'ct-screen');
      for (var st = 1; st <= 4; st++) {
        var open = stageOpen(st);
        w.appendChild(el('h2', 'ct-stage' + (open ? '' : ' ct-stagelock'), 'Ступень ' + st + ' · ' + STAGES[st - 1] + (open ? '' : ' · закрыто')));
        var grid = el('div', 'ct-grid');
        for (var i = 0; i < SK.length; i++) {
          if (SK[i].stage !== st) continue;
          grid.appendChild(cardTile(SK[i]));
        }
        w.appendChild(grid);
      }
      var row = el('div', 'ct-row');
      var sim = el('button', 'ct-action', 'Своя партия');
      sim.onclick = function () { go('simSetup'); };
      var par = el('button', 'ct-action', 'Игра вдвоём');
      par.onclick = function () { go('partnerSetup'); };
      row.appendChild(sim); row.appendChild(par);
      w.appendChild(row);

      var nav = el('div', 'ct-nav');
      nav.appendChild(navBtn('Мой прогресс', 'progress'));
      nav.appendChild(navBtn('Родителям', 'parent'));
      nav.appendChild(navBtn('Помощь', 'help'));
      var toIcon = el('button', 'ct-navbtn', '🎴 К карточной колоде');
      toIcon.onclick = function () { location.href = (config.iconostasUrl || 'index.html'); };
      nav.appendChild(toIcon);
      w.appendChild(nav);
      mount.appendChild(w);
    };
    function navBtn(label, to) { var b = el('button', 'ct-navbtn', label); b.onclick = function () { go(to); }; return b; }

    function cardTile(sk) {
      var stt = cardState(sk.n);
      var t = el('button', 'ct-card ct-' + stt);
      t.appendChild(el('div', 'ct-cnum', pad(sk.n)));
      t.appendChild(el('div', 'ct-cglyph', sk.glyph));
      t.appendChild(el('div', 'ct-cname', sk.title));
      var mark = stt === 'mastered' ? '★' : (stt === 'progress' ? barStr(sdata(sk.n).pL) : (stt === 'locked' ? '🔒' : ''));
      t.appendChild(el('div', 'ct-cmark', mark));
      t.onclick = function () {
        if (stt === 'locked') { toast('Сначала освой ступень «' + STAGES[sk.stage - 2] + '».'); return; }
        go('hub', sk.n);
      };
      return t;
    }

    // ---- ВХОД ПО КАРТЕ (камера + ручной ввод) -----------------------------
    screen.camera = function () {
      mount.appendChild(header('Навести камеру', { name: 'home' }));
      var w = el('div', 'ct-screen');
      var box = el('div', 'ct-cambox');
      var video = document.createElement('video');
      video.setAttribute('playsinline', ''); video.muted = true; video.className = 'ct-video';
      box.appendChild(video);
      box.appendChild(el('div', 'ct-camhint', 'Наведи на карту'));
      w.appendChild(box);
      var manual = el('div', 'ct-manual');
      manual.appendChild(el('p', null, 'Не распозналось? Введи номер карты:'));
      var inp = document.createElement('input'); inp.type = 'number'; inp.min = 1; inp.max = 24; inp.className = 'ct-input'; inp.placeholder = '01–24';
      var ok = el('button', 'ct-action', 'Открыть');
      ok.onclick = function () { var n = parseInt(inp.value, 10); if (n >= 1 && n <= 24) go('hub', n); else toast('Номер от 01 до 24.'); };
      manual.appendChild(inp); manual.appendChild(ok);
      w.appendChild(manual);
      mount.appendChild(w);
      // Камера — единственное онлайн-действие; офлайн просто остаётся ручной ввод.
      var stream = null;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function (s) {
          stream = s; video.srcObject = s; video.play();
          // v1: распознавание по изображению — открытый вопрос (часть G ТЗ).
          // Сейчас камера показывает картинку, выбор карты — ручным вводом.
        }).catch(function () { box.appendChild(el('div', 'ct-camerr', 'Камера недоступна — введи номер карты ниже.')); });
      } else {
        box.appendChild(el('div', 'ct-camerr', 'Камера недоступна — введи номер карты ниже.'));
      }
      // Гасим камеру при любом уходе с экрана (роутер go() вызовет camStop).
      camStop = function () { if (stream) { var t = stream.getTracks(); for (var i = 0; i < t.length; i++) t[i].stop(); stream = null; } };
    };

    // ---- ХАБ КАРТЫ ---------------------------------------------------------
    screen.hub = function (n) {
      var sk = skill(n), d = sdata(n);
      mount.appendChild(header(pad(n) + ' · ' + sk.title, { name: 'home' }));
      var w = el('div', 'ct-screen ct-hub');
      var img = el('div', 'ct-hubart');
      var pic = document.createElement('img'); pic.className = 'ct-hubimg'; pic.alt = sk.title;
      pic.src = (config.cardImageBase || 'assets/cards/') + pad(n) + '.webp';
      pic.onerror = function () { img.innerHTML = '<div class="ct-hubglyph">' + sk.glyph + '</div>'; };
      img.appendChild(pic);
      w.appendChild(img);
      w.appendChild(el('p', 'ct-learn', 'Научишься: ' + sk.learn));
      w.appendChild(el('div', 'ct-level', 'Уровень знаний: ' + barStr(d.pL) + '  ' + BKT.statusLabel(d.pL)));

      var b1 = el('button', 'ct-big', 'Учиться');
      b1.onclick = function () { go('teach', { n: n, phase: 'lesson', step: 0 }); };
      w.appendChild(b1);
      var row = el('div', 'ct-row');
      var b2 = el('button', 'ct-action', 'Тренировать');
      b2.onclick = function () { go('teach', { n: n, phase: 'task' }); };
      var b3 = el('button', 'ct-action', 'Сыграть');
      b3.onclick = function () { go('simSetup', { theme: n }); };
      row.appendChild(b2); row.appendChild(b3);
      w.appendChild(row);
      mount.appendChild(w);
    };

    // ---- УЧИТЕЛЬ: объяснение + задания -------------------------------------
    screen.teach = function (arg) {
      var sk = skill(arg.n);
      if (arg.phase === 'lesson') return teachLesson(sk, arg.step || 0);
      return teachTask(sk);
    };

    function teachLesson(sk, step) {
      var lessons = sk.lessons || [];
      var L = lessons[step] || { text: sk.learn, fen: '8/8/8/8/8/8/8/8 w - - 0 1' };
      mount.appendChild(header(sk.title + ' · шаг ' + (step + 1) + ' из ' + lessons.length, { name: 'hub', arg: sk.n }));
      var w = el('div', 'ct-screen');
      var host = el('div', 'ct-boardhost');
      w.appendChild(host);
      var b = ChessBoard.create(host, { interactive: false, orientation: L.orientation || 'w' });
      b.setPosition(Chess.create(L.fen));
      if (L.highlight) b.highlight(L.highlight, 'cb-target');
      // Анимация урока: кадры-позиции (anim: [{fen, hl}]) листаются по кругу —
      // «как ходит фигура» видно в движении, а не только по подсветке.
      if (L.anim && L.anim.length) {
        var fi = 0;
        animTimer = setInterval(function () {
          fi = (fi + 1) % L.anim.length;
          var fr = L.anim[fi];
          b.setPosition(Chess.create(fr.fen));
          b.clearHighlights();
          if (fr.hl) b.highlight(fr.hl, 'cb-target');
        }, 900);
      }
      w.appendChild(el('p', 'ct-say', L.text));
      var sayBtn = el('button', 'ct-voice', '🔊 послушать');
      sayBtn.onclick = function () { speak(L.text); };
      w.appendChild(sayBtn);
      var row = el('div', 'ct-row');
      if (step > 0) { var bk = el('button', 'ct-action', '‹ повторить'); bk.onclick = function () { go('teach', { n: sk.n, phase: 'lesson', step: step - 1 }); }; row.appendChild(bk); }
      var nx = el('button', 'ct-big', step + 1 < lessons.length ? 'нажми →' : 'К заданиям');
      nx.onclick = function () { if (step + 1 < lessons.length) go('teach', { n: sk.n, phase: 'lesson', step: step + 1 }); else go('teach', { n: sk.n, phase: 'task' }); };
      row.appendChild(nx);
      w.appendChild(row);
      mount.appendChild(w);
      speak(L.text);
    }

    function teachTask(sk) {
      var d = sdata(sk.n);
      var level = levelFor(d.pL);
      var task = sk.gen(level, Math.random);
      var usedHint = false;

      mount.appendChild(header(sk.title + ' · задание', { name: 'hub', arg: sk.n },
        (function () { var b = el('div', 'ct-mini', barStr(d.pL)); return b; })()));
      var w = el('div', 'ct-screen');
      w.appendChild(el('p', 'ct-prompt', task.prompt));
      var host = el('div', 'ct-boardhost'); w.appendChild(host);
      var feedback = el('div', 'ct-feedback');
      var controls = el('div', 'ct-row');
      var locked = false;

      var live = Chess.create(task.fen);
      var board = ChessBoard.create(host, { orientation: task.orientation || 'w', interactive: task.ui === 'move' || task.ui === 'opening' });
      board.setPosition(live);
      if (task.hint && task.hint.squares && task.hint.squares.length) board.highlight(task.hint.squares, 'cb-target');

      function finish(correct, msg) {
        if (locked) return; locked = true;
        recordAnswer(sk.n, correct, task.kind, task.ui === 'choice' ? task.options.length : null);
        feedback.className = 'ct-feedback ' + (correct ? 'ct-ok' : 'ct-no');
        feedback.textContent = msg;
        speak(msg);
        clear(controls);
        if (correct) {
          if (skillMastered(sk.n)) {
            var done = el('button', 'ct-big', 'Навык освоен! →'); done.onclick = function () { go('mastered', sk.n); };
            controls.appendChild(done);
          } else {
            var nx = el('button', 'ct-big', 'Дальше'); nx.onclick = function () { go('teach', { n: sk.n, phase: 'task' }); };
            controls.appendChild(nx);
          }
        } else {
          var retry = el('button', 'ct-big', 'Попробуй ещё'); retry.onclick = function () { go('teach', { n: sk.n, phase: 'task' }); };
          controls.appendChild(retry);
          var hint = el('button', 'ct-action', 'Объяснить'); hint.onclick = function () { go('teach', { n: sk.n, phase: 'lesson', step: 0 }); };
          controls.appendChild(hint);
        }
      }

      if (task.ui === 'move') {
        function applyTaskMove(mv, promo) {
          var before = Chess.create(live.fen());
          var m = live.move({ from: mv.from, to: mv.to, promotion: promo });
          if (!m) return false;
          board.setPosition(live);
          var correct = false;
          try { correct = !!task.check(m, live, before); } catch (e) { correct = false; }
          finish(correct, correct ? (usedHint ? task.good + ' (с подсказкой)' : task.good) : task.bad);
          return true;
        }
        board.setOnMove(function (mv) {
          if (locked) return false;
          if (isPromotionMove(live, mv.from, mv.to)) {
            promoChoose(live.turn(), function (p) { applyTaskMove(mv, p); });
            return false;   // позицию обновим после выбора фигуры
          }
          return applyTaskMove(mv, 'q');
        });
        var hintBtn = el('button', 'ct-action', 'Подсказка');
        hintBtn.onclick = function () {
          usedHint = true;
          if (task.targetSq) board.highlight([task.targetSq], 'cb-good');
          if (task.hint && task.hint.text) toast(task.hint.text);
          else toast('Смотри на подсвеченную клетку.');
        };
        controls.appendChild(hintBtn);
      } else if (task.ui === 'opening') {
        // Дебют-минипартия: N своих ходов с оценкой каждого, наставник отвечает.
        var played = 0, score = 0;
        board.setOnMove(function (mv) {
          if (locked || live.turn() !== 'w') return false;
          var m = live.move({ from: mv.from, to: mv.to, promotion: 'q' });
          if (!m) return false;
          played++;
          var ev = task.evalMove(m, played);
          score += ev.s;
          feedback.className = 'ct-feedback ' + (ev.s >= 1 ? 'ct-ok' : (ev.s > 0 ? '' : 'ct-no'));
          feedback.textContent = 'Ход ' + played + ' из ' + task.movesToPlay + ': ' + ev.msg;
          speak(ev.msg);
          board.setPosition(live);
          if (played >= task.movesToPlay) {
            var pts = Math.round(score * 10) / 10;
            setTimeout(function () {
              finish(score >= task.passScore,
                (score >= task.passScore ? task.good : task.bad) + ' Очки: ' + pts + ' из ' + task.movesToPlay + '.');
            }, 700);
          } else {
            setTimeout(function () {
              if (live.isGameOver()) return;
              var am = ChessAI.pick(live, { level: 2, blindness: 0.2 });
              if (am) live.move({ from: am.fromAlg, to: am.toAlg, promotion: am.promotion || 'q' });
              board.setPosition(live);
            }, 450);
          }
          return true;
        });
      } else if (task.ui === 'click') {
        board.setInteractive(false);
        board.setOnPick(function (alg) { if (locked) return; var correct = alg === task.target; finish(correct, correct ? task.good : task.bad); });
        board.el.classList.add('ct-clickable');
      } else { // choice
        var opts = el('div', 'ct-choices');
        for (var i = 0; i < task.options.length; i++) {
          (function (o) {
            var ob = el('button', 'ct-choice', o.label);
            ob.onclick = function () { finish(!!o.correct, o.correct ? task.good : (task.bad + (task.explainWrong ? ' ' + task.explainWrong : ''))); };
            opts.appendChild(ob);
          })(task.options[i]);
        }
        w.appendChild(opts);
      }

      w.appendChild(feedback);
      w.appendChild(controls);
      mount.appendChild(w);
      speak(task.prompt);
    }

    screen.mastered = function (n) {
      var sk = skill(n);
      var w = el('div', 'ct-screen ct-start');
      w.appendChild(el('div', 'ct-logo', '★'));
      w.appendChild(el('h1', null, 'Навык освоен!'));
      w.appendChild(el('p', 'ct-sub', sk.title + ' — отлично. ' + (stageMastered(sk.stage) && sk.stage < 4 ? 'Открыта новая ступень!' : 'Возьми следующую карту.')));
      var b1 = el('button', 'ct-big', 'Сыграть партию'); b1.onclick = function () { go('simSetup', { theme: n }); };
      var b2 = el('button', 'ct-action', 'К колоде'); b2.onclick = function () { go('home'); };
      w.appendChild(b1); w.appendChild(b2);
      mount.appendChild(w);
    };

    // ---- СИМУЛЯЦИЯ ---------------------------------------------------------
    function aiStrength() {
      // сила «под меня»: число освоенных навыков → уровень и слепота
      var mastered = 0;
      for (var i = 0; i < SK.length; i++) if (skillMastered(SK[i].n)) mastered++;
      var level = Math.max(1, Math.min(5, Math.round(mastered / 5)));
      var blindness = Math.max(0, 0.6 - mastered * 0.02);
      return { level: level, blindness: blindness, mastered: mastered };
    }

    screen.simSetup = function (arg) {
      arg = arg || {};
      mount.appendChild(header('Своя партия', { name: 'home' }));
      var w = el('div', 'ct-screen');
      w.appendChild(el('p', 'ct-prompt', 'Сыграй против наставника — он подстроится под тебя.'));
      var colorPick = el('div', 'ct-row');
      var chosen = { color: state.settings.color || 'w', diff: 0 };
      function colorBtn(c, label) { var b = el('button', 'ct-action' + (chosen.color === c ? ' ct-sel' : ''), label); b.onclick = function () { chosen.color = c; refresh(); }; return b; }
      var diffWrap = el('div', 'ct-row');
      function diffBtn(v, label) { var b = el('button', 'ct-action' + (chosen.diff === v ? ' ct-sel' : ''), label); b.onclick = function () { chosen.diff = v; refresh(); }; return b; }
      function refresh() { clear(colorPick); colorPick.appendChild(colorBtn('w', 'Я белыми')); colorPick.appendChild(colorBtn('b', 'Я чёрными')); clear(diffWrap); diffWrap.appendChild(diffBtn(-1, 'Полегче')); diffWrap.appendChild(diffBtn(0, 'Под меня')); diffWrap.appendChild(diffBtn(1, 'Посложнее')); }
      refresh();
      w.appendChild(el('h2', 'ct-stage', 'Цвет')); w.appendChild(colorPick);
      w.appendChild(el('h2', 'ct-stage', 'Соперник')); w.appendChild(diffWrap);
      var themeSk = arg.theme ? skill(arg.theme) : null;
      var themeFen = (themeSk && themeSk.simFen) ? themeSk.simFen : null;
      if (themeFen) w.appendChild(el('p', 'ct-learn', '🎯 ' + (themeSk.simLabel || themeSk.title)));
      var start = el('button', 'ct-big', 'Играть');
      start.onclick = function () { state.settings.color = chosen.color; store.save(state); go('sim', { color: chosen.color, diff: chosen.diff, fen: themeFen, themeLabel: themeFen ? (themeSk.simLabel || themeSk.title) : null }); };
      w.appendChild(start);
      mount.appendChild(w);
    };

    screen.sim = function (arg) {
      var human = arg.color || 'w';
      var strg = aiStrength();
      var level = Math.max(0, Math.min(5, strg.level + (arg.diff || 0)));
      var blind = Math.max(0, strg.blindness - (arg.diff || 0) * 0.15);
      var startFen = arg.fen || Chess.START_FEN;
      var game = Chess.create(startFen);
      var sanlog = [];
      var warned = false;

      mount.appendChild(header(arg.themeLabel ? 'Партия по теме' : ('Соперник: ' + (arg.diff < 0 ? 'полегче' : arg.diff > 0 ? 'посложнее' : 'под меня')), { name: 'home' }));
      var w = el('div', 'ct-screen');
      if (arg.themeLabel) w.appendChild(el('p', 'ct-learn', '🎯 ' + arg.themeLabel));
      var turnLbl = el('div', 'ct-turn', '');
      w.appendChild(turnLbl);
      var host = el('div', 'ct-boardhost'); w.appendChild(host);
      var moves = el('div', 'ct-moves'); w.appendChild(moves);
      var info = el('div', 'ct-feedback'); w.appendChild(info);
      var row = el('div', 'ct-row');
      var hintBtn = el('button', 'ct-action', 'Подсказка');
      var undoBtn = el('button', 'ct-action', 'Отменить ход');
      var endBtn = el('button', 'ct-action', 'Закончить');
      row.appendChild(hintBtn); row.appendChild(undoBtn); row.appendChild(endBtn);
      w.appendChild(row);
      mount.appendChild(w);

      var board = ChessBoard.create(host, { orientation: human, onMove: onHuman });
      function redraw() {
        board.setPosition(game);
        board.clearHighlights();
        if (game.inCheck()) board.flashCheck(game.kingSquare(game.turn()));
        turnLbl.textContent = game.turn() === human ? 'Твой ход' : 'Ходит наставник…';
        moves.textContent = formatMoves(sanlog);
        checkEnd();
      }
      function checkEnd() {
        if (game.isGameOver()) {
          var res;
          if (game.isCheckmate()) res = (game.turn() === human) ? 'lose' : 'win';
          else res = 'draw';
          if (res === 'win') { state.wins = (state.wins || 0) + 1; addAchievements(); store.save(state); }
          go('simResult', { res: res, sanlog: sanlog, human: human, startFen: startFen });
          return true;
        }
        return false;
      }
      function onHuman(mv) {
        if (game.turn() !== human) return false;
        if (isPromotionMove(game, mv.from, mv.to)) {
          promoChoose(human, function (p) { applyHuman(mv, p); });
          return false;   // применим после выбора фигуры
        }
        return applyHuman(mv, 'q');
      }
      function applyHuman(mv, promo) {
        var m = game.move({ from: mv.from, to: mv.to, promotion: promo });
        if (!m) return false;
        sanlog.push(m.san);
        // мягкое предупреждение о крупном зевке (для новичков)
        if (state.settings.warnBlunder && strg.mastered < 7 && !warned && hangsBig(game, human)) {
          warned = true; info.className = 'ct-feedback ct-no'; info.textContent = 'Осторожно: похоже, ты подставил фигуру. Можно отменить ход.';
        } else { info.className = 'ct-feedback'; info.textContent = ''; }
        redraw();
        if (!game.isGameOver()) setTimeout(aiMove, 350);
        return true;
      }
      function aiMove() {
        if (game.turn() === human || game.isGameOver()) return;
        var m = ChessAI.pick(game, { level: level, blindness: blind });
        if (m) { game.move({ from: m.fromAlg, to: m.toAlg, promotion: m.promotion || 'q' }); sanlog.push(m.san); }
        redraw();
      }
      hintBtn.onclick = function () {
        if (game.turn() !== human) return;
        var best = ChessAI.pick(game, { level: 4, blindness: 0 });
        if (best) { board.highlight([best.fromAlg, best.toAlg], 'cb-good'); info.className = 'ct-feedback'; info.textContent = 'Посмотри на подсвеченный ход.'; }
      };
      undoBtn.onclick = function () {
        if (sanlog.length < 1) return;
        // отменяем и ход наставника, и свой
        if (game.turn() === human && sanlog.length >= 2) { game.undo(); game.undo(); sanlog.pop(); sanlog.pop(); }
        else if (game.turn() !== human) { game.undo(); sanlog.pop(); }
        warned = false; info.textContent = ''; redraw();
      };
      endBtn.onclick = function () { if (confirm('Закончить партию?')) go('simResult', { res: 'abort', sanlog: sanlog, human: human, startFen: startFen }); };

      redraw();
      if (game.turn() !== human) setTimeout(aiMove, 400);
    };

    function hangsBig(game, human) {
      // после хода человека очередь ИИ: стоит ли крупная фигура человека под боем без защиты
      var enemy = (human === 'w') ? 'b' : 'w';
      var sq = Chess.SQUARES;
      for (var i = 0; i < sq.length; i++) {
        var p = game.get(sq[i]);
        if (!p || p.color !== human) continue;
        if (ChessAI.VAL[p.type] >= 300 && game.isAttackedBy(enemy, sq[i]) && !game.isAttackedBy(human, sq[i])) return true;
      }
      return false;
    }

    screen.simResult = function (arg) {
      var w = el('div', 'ct-screen ct-start');
      var icon = arg.res === 'win' ? '🏆' : (arg.res === 'lose' ? '🙂' : (arg.res === 'abort' ? '⏸' : '🤝'));
      var txt = arg.res === 'win' ? 'Победа!' : (arg.res === 'lose' ? 'В этот раз не вышло' : (arg.res === 'abort' ? 'Партия прервана' : 'Ничья'));
      var sub = arg.res === 'win' ? 'Отличная партия!' : (arg.res === 'abort' ? 'Ничего страшного — начни новую, когда будешь готов.' : 'Разбери ходы — и сыграй ещё.');
      w.appendChild(el('div', 'ct-logo', icon));
      w.appendChild(el('h1', null, txt));
      w.appendChild(el('p', 'ct-sub', sub));
      var b1 = el('button', 'ct-big', 'Разбор партии'); b1.onclick = function () { go('review', arg); };
      var b2 = el('button', 'ct-action', 'Сыграть ещё'); b2.onclick = function () { go('simSetup'); };
      var b3 = el('button', 'ct-action', 'На Главную'); b3.onclick = function () { go('home'); };
      w.appendChild(b1); w.appendChild(b2); w.appendChild(b3);
      mount.appendChild(w);
    };

    // ---- РАЗБОР ------------------------------------------------------------
    screen.review = function (arg) {
      var sanlog = arg.sanlog || [];
      var startFen = arg.startFen || Chess.START_FEN;
      // восстановим позиции и оценим зевки по перепаду материала
      var positions = [startFen], g = Chess.create(startFen), evals = [ChessAI.evaluate(g)];
      for (var i = 0; i < sanlog.length; i++) { g.move(sanlog[i]); positions.push(g.fen()); evals.push(ChessAI.evaluate(g)); }
      var idx = positions.length - 1;
      // «упущенный мат в 1»: был ли из предыдущей позиции матующий ход;
      // считаем лениво и кэшируем — только когда показываем ход человека.
      var mateMissCache = {};
      function missedMate(ix) {
        if (mateMissCache[ix] !== undefined) return mateMissCache[ix];
        var res = false;
        if (!Chess.create(positions[ix]).isCheckmate()) {
          var pg = Chess.create(positions[ix - 1]);
          var ms = pg.moves();
          for (var j = 0; j < ms.length; j++) {
            pg.move({ from: ms[j].fromAlg, to: ms[j].toAlg, promotion: ms[j].promotion || 'q' });
            var mate = pg.isCheckmate();
            pg.undo();
            if (mate) { res = true; break; }
          }
        }
        mateMissCache[ix] = res;
        return res;
      }
      mount.appendChild(header('Разбор партии', { name: 'home' }));
      var w = el('div', 'ct-screen');
      var nav = el('div', 'ct-turn', '');
      w.appendChild(nav);
      var host = el('div', 'ct-boardhost'); w.appendChild(host);
      var note = el('div', 'ct-feedback'); w.appendChild(note);
      var row = el('div', 'ct-row');
      var prev = el('button', 'ct-action', '◀'); var next = el('button', 'ct-action', '▶');
      row.appendChild(prev); row.appendChild(next);
      w.appendChild(row);
      var home = el('button', 'ct-action', 'На Главную'); home.onclick = function () { go('home'); };
      w.appendChild(home);
      mount.appendChild(w);
      var board = ChessBoard.create(host, { interactive: false });
      function show() {
        board.setPosition(Chess.create(positions[idx]));
        nav.textContent = 'Ход ' + idx + ' / ' + (positions.length - 1);
        note.className = 'ct-feedback'; note.textContent = '';
        if (idx > 0) {
          var mover = Chess.create(positions[idx - 1]).turn(); // кто сделал этот ход
          var delta = evals[idx] - evals[idx - 1];
          var fromHuman = (mover === arg.human);
          var swing = (mover === 'w') ? delta : -delta;       // в пользу сделавшего ход
          if (fromHuman && missedMate(idx)) { note.className = 'ct-feedback ct-no'; note.textContent = '⚠ здесь был мат в один ход — поищи его! (сыграно ' + sanlog[idx - 1] + ')'; }
          else if (fromHuman && swing <= -200) { note.className = 'ct-feedback ct-no'; note.textContent = '⚠ зевок: здесь ты потерял материал (' + sanlog[idx - 1] + ').'; }
          else if (fromHuman && swing >= 200) { note.className = 'ct-feedback ct-ok'; note.textContent = '★ хороший ход: ' + sanlog[idx - 1] + '.'; }
          else { note.textContent = 'Ход: ' + sanlog[idx - 1]; }
        }
      }
      prev.onclick = function () { if (idx > 0) idx--; show(); };
      next.onclick = function () { if (idx < positions.length - 1) idx++; show(); };
      show();
    };

    // ---- ПАРТНЁР (арбитр) --------------------------------------------------
    screen.partnerSetup = function () {
      mount.appendChild(header('Игра вдвоём', { name: 'home' }));
      var w = el('div', 'ct-screen');
      w.appendChild(el('p', 'ct-prompt', 'Двое играют по очереди на одном экране. Приложение — арбитр: проверяет ходы, объявляет шах, фиксирует мат.'));
      var cfg = { white: 'Игрок 1', black: 'Игрок 2' };
      var start = el('button', 'ct-big', 'Начать партию');
      start.onclick = function () { go('partner', cfg); };
      w.appendChild(start);
      mount.appendChild(w);
    };

    screen.partner = function (cfg) {
      var game = Chess.create();
      var sanlog = [];
      mount.appendChild(header('Арбитр', { name: 'home' }));
      var w = el('div', 'ct-screen');
      var turnLbl = el('div', 'ct-turn', ''); w.appendChild(turnLbl);
      var host = el('div', 'ct-boardhost'); w.appendChild(host);
      var ann = el('div', 'ct-feedback'); w.appendChild(ann);
      var moves = el('div', 'ct-moves'); w.appendChild(moves);
      var end = el('button', 'ct-action', 'Закончить партию'); end.onclick = function () { go('home'); };
      w.appendChild(end);
      mount.appendChild(w);
      // доска всегда со стороны того, чей ход (игра по очереди)
      var board = ChessBoard.create(host, { orientation: 'w', onMove: onMove });
      function redraw() {
        board.setOrientation(game.turn());
        board.setPosition(game);
        board.setOnMove(onMove);
        if (game.inCheck()) board.flashCheck(game.kingSquare(game.turn()));
        turnLbl.textContent = (game.turn() === 'w' ? 'Ход белых · ' + cfg.white : 'Ход чёрных · ' + cfg.black);
        moves.textContent = formatMoves(sanlog);
        if (game.isCheckmate()) { ann.className = 'ct-feedback ct-ok'; ann.textContent = 'МАТ! Победили ' + (game.turn() === 'w' ? 'чёрные' : 'белые') + '.'; board.setInteractive(false); }
        else if (game.isStalemate()) { ann.className = 'ct-feedback'; ann.textContent = 'ПАТ — ничья.'; board.setInteractive(false); }
        else if (game.isDraw()) { ann.className = 'ct-feedback'; ann.textContent = 'Ничья.'; board.setInteractive(false); }
        else if (game.inCheck()) { ann.className = 'ct-feedback ct-no'; ann.textContent = 'ШАХ!'; }
        else { ann.className = 'ct-feedback'; ann.textContent = ''; }
      }
      function onMove(mv) {
        if (isPromotionMove(game, mv.from, mv.to)) {
          promoChoose(game.turn(), function (p) {
            var m = game.move({ from: mv.from, to: mv.to, promotion: p });
            if (m) { sanlog.push(m.san); redraw(); }
          });
          return false;
        }
        var m = game.move({ from: mv.from, to: mv.to, promotion: 'q' });
        if (!m) return false;
        sanlog.push(m.san); redraw(); return true;
      }
      redraw();
    };

    function formatMoves(sanlog) {
      var out = '';
      for (var i = 0; i < sanlog.length; i++) { if (i % 2 === 0) out += (i / 2 + 1) + '. '; out += sanlog[i] + ' '; }
      return out;
    }

    // ---- ПРОГРЕСС (ребёнку) ------------------------------------------------
    screen.progress = function () {
      mount.appendChild(header('Мой прогресс', { name: 'home' }));
      var w = el('div', 'ct-screen');
      var mastered = 0; for (var i = 0; i < SK.length; i++) if (skillMastered(SK[i].n)) mastered++;
      w.appendChild(el('div', 'ct-big-stat', mastered + ' / 24 навыков освоено'));
      var grid = el('div', 'ct-grid');
      for (var j = 0; j < SK.length; j++) {
        var stt = cardState(SK[j].n);
        var t = el('div', 'ct-card ct-' + stt);
        t.appendChild(el('div', 'ct-cnum', pad(SK[j].n)));
        t.appendChild(el('div', 'ct-cglyph', stt === 'mastered' ? '★' : SK[j].glyph));
        t.appendChild(el('div', 'ct-cname', SK[j].title));
        grid.appendChild(t);
      }
      w.appendChild(grid);
      w.appendChild(el('h2', 'ct-stage', 'Достижения'));
      var ach = el('div', 'ct-ach');
      if (!state.achievements.length) ach.appendChild(el('p', 'ct-sub', 'Пока пусто — учись и играй!'));
      for (var a = 0; a < state.achievements.length; a++) ach.appendChild(el('div', 'ct-badge', '🏅 ' + state.achievements[a].label));
      w.appendChild(ach);
      mount.appendChild(w);
    };

    // ---- РОДИТЕЛЯМ ---------------------------------------------------------
    screen.parent = function () {
      mount.appendChild(header('Для родителей · Уровень знаний', { name: 'home' }));
      var w = el('div', 'ct-screen');
      w.appendChild(el('p', 'ct-sub', 'Реальный рост по темам, а не очки. Чем больше делений — тем увереннее навык.'));
      for (var st = 1; st <= 4; st++) {
        var sum = 0, cnt = 0;
        for (var i = 0; i < SK.length; i++) if (SK[i].stage === st) { sum += (sdata(SK[i].n).pL || 0); cnt++; }
        var avg = cnt ? sum / cnt : 0;
        var line = el('div', 'ct-prow');
        line.appendChild(el('div', 'ct-pname', STAGES[st - 1]));
        line.appendChild(el('div', 'ct-pbar', barStr(avg)));
        line.appendChild(el('div', 'ct-pstat', BKT.statusLabel(avg)));
        w.appendChild(line);
      }
      var mins = Math.round((state.time || 0) / 60000);
      w.appendChild(el('p', 'ct-sub', 'Всего занятий: ' + Math.floor(mins / 60) + ' ч ' + (mins % 60) + ' мин'));
      var reset = el('button', 'ct-action', 'Сбросить прогресс');
      reset.onclick = function () { if (confirm('Сбросить весь прогресс? Данные не восстановить.')) { state = store.reset(); go('home'); } };
      w.appendChild(reset);
      var voice = el('button', 'ct-action', 'Голос: ' + (state.settings.voice ? 'вкл' : 'выкл'));
      voice.onclick = function () { state.settings.voice = !state.settings.voice; store.save(state); go('parent'); };
      w.appendChild(voice);
      mount.appendChild(w);
    };

    // ---- ПОМОЩЬ ------------------------------------------------------------
    screen.help = function () {
      mount.appendChild(header('Помощь · как играть', { name: 'home' }));
      var w = el('div', 'ct-screen ct-help');
      w.appendChild(el('h2', 'ct-stage', 'Как открыть карту'));
      w.appendChild(el('p', null, 'Нажми «Навести камеру» и наведи на карту — или просто выбери её номер в колоде.'));
      w.appendChild(el('h2', 'ct-stage', 'Три режима'));
      w.appendChild(el('p', null, '<b>Учитель</b> — объясняет навык карты и тренирует. <b>Своя партия</b> — играй против наставника, он подстроится. <b>Игра вдвоём</b> — приложение судит партию двух игроков.'));
      w.appendChild(el('h2', 'ct-stage', 'Уровень знаний'));
      w.appendChild(el('p', null, 'Деления ▰▰▰▱▱ показывают, насколько уверенно освоен навык. Пять делений — навык освоен.'));
      mount.appendChild(w);
    };

    // ---- тост --------------------------------------------------------------
    var toastEl = null;
    function toast(msg) {
      if (toastEl && toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
      toastEl = el('div', 'ct-toast', msg);
      document.body.appendChild(toastEl);
      setTimeout(function () { if (toastEl && toastEl.parentNode) toastEl.parentNode.removeChild(toastEl); }, 2600);
    }

    // учёт времени занятий
    var t0 = Date.now();
    setInterval(function () { var now = Date.now(); state.time = (state.time || 0) + (now - t0); t0 = now; store.save(state); }, 30000);

    // старт (диплинк из иконостаса: play.html?w=NN или #card=NN -> сразу хаб карты)
    var deep = (location.search + ' ' + location.hash).match(/(?:w|card)=(\d+)/);
    if (deep) { var dn = parseInt(deep[1], 10); if (dn >= 1 && dn <= 24) { state.started = true; store.save(state); go('hub', dn); return; } }
    go(state.started ? 'home' : 'start');
  }

  // =========================================================================
  //  ХРАНИЛИЩЕ ПРОГРЕССА (localStorage, ключ тайтла)
  // =========================================================================
  function Store(key) {
    function fresh() {
      return { v: 1, started: false, skills: {}, openStage: 1, wins: 0, time: 0,
        settings: { voice: true, warnBlunder: true, color: 'w' }, achievements: [] };
    }
    return {
      load: function () {
        try {
          var raw = window.localStorage.getItem(key);
          if (!raw) return fresh();
          var s = JSON.parse(raw);
          if (!s || s.v !== 1) return fresh();
          if (!s.settings) s.settings = fresh().settings;
          if (!s.skills) s.skills = {};
          if (!s.achievements) s.achievements = [];
          return s;
        } catch (e) { return fresh(); }
      },
      save: function (s) { try { window.localStorage.setItem(key, JSON.stringify(s)); } catch (e) {} },
      reset: function () { var f = fresh(); f.started = true; try { window.localStorage.setItem(key, JSON.stringify(f)); } catch (e) {} return f; }
    };
  }

  return { boot: boot };
})();
