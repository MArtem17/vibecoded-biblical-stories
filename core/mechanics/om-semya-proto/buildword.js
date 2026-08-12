/* ============================================================
   BuildWord — механика «собери слово из букв».
   Автономный модуль, без зависимостей. ES5, работает офлайн.
   Поведение взято из английской A0-колоды «Колода-Камера-Альбом»
   (шаг «Собери слово») и очищено до самостоятельного интерактива.

   Что делает:
   - показывает слово порцией (картинка + подсказка по желанию),
   - ребёнок собирает его из перемешанных букв-плиток:
       • нажми букву  → она встаёт в первый пустой слот,
       • нажми слот   → буква возвращается в банк;
   - собрал верно → зелёная вспышка, следующее слово;
   - ошибся       → слоты «трясутся» красным, буквы возвращаются;
   - второй промах → слово складывается само («запомни») и идём дальше;
   - у длинных слов (по умолчанию 6+) первая буква подставлена опорой.

   Использование:
     var w = BuildWord.mount(elem, config);
     w.reset(); w.destroy();

   config = {
     words: [                          // строки или объекты
       { word:'dog', hint:'собака', image:'img/dog.webp' },
       'cat', 'sun'
     ],
     uppercase:   true,                // показывать буквы заглавными (сравн. без регистра)
     anchorFrom:  6,                   // подставлять 1-ю букву для слов длиной ≥ N (0 = выкл)
     distractors: 0,                   // сколько лишних букв добавить в банк
     maxAttempts: 2,                   // промахов до автопоказа ответа
     strings: { prompt, counter, done }, // тексты (см. defaults)
     onWord:     function(word, idx, total){},   // показано новое слово (тут удобно озвучить)
     onResult:   function(word, ok, clean){},    // итог слова: ok — верно ли, clean — с 1-й попытки
     onComplete: function(score){}               // конец: score = {clean, total}
   }
   ============================================================ */
(function (root) {
  'use strict';

  var DEF = {
    prompt: 'Собери слово из букв.',
    counter: function (i, n) { return 'слово ' + i + ' из ' + n; },
    done: 'Слова собраны!'
  };
  var RU_DISTRACT = 'бвгдклмнпрстфх';
  var EN_DISTRACT = 'bcdfghklmnprst';

  function el(t, c) { var e = document.createElement(t); if (c) e.className = c; return e; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function isLatin(s) { return /[a-z]/i.test(s); }

  function BuildWord(host, cfg) {
    this.host = host;
    this.cfg = cfg || {};
    this.uppercase = cfg.uppercase !== false;
    this.anchorFrom = (cfg.anchorFrom == null) ? 6 : cfg.anchorFrom;
    this.distractors = cfg.distractors || 0;
    this.maxAttempts = cfg.maxAttempts || 2;
    this.strings = {}; for (var k in DEF) this.strings[k] = DEF[k];
    if (cfg.strings) for (var k2 in cfg.strings) this.strings[k2] = cfg.strings[k2];

    this.words = (cfg.words || []).map(function (w) {
      if (typeof w === 'string') return { word: w, hint: '', image: '' };
      return { word: w.word, hint: w.hint || '', image: w.image || '' };
    }).filter(function (w) { return w.word && w.word.length; });

    this._build();
    this.reset();
  }

  BuildWord.prototype._build = function () {
    this.host.classList.add('bw-root');
    this.host.innerHTML =
      '<div class="bw-stage">' +
        '<div class="bw-pic"><img class="bw-img" alt=""></div>' +
        '<div class="bw-hint"></div>' +
        '<div class="bw-slots"></div>' +
      '</div>' +
      '<div class="bw-bank"></div>' +
      '<div class="bw-cmt"></div>';
    this.pic   = this.host.querySelector('.bw-pic');
    this.img   = this.host.querySelector('.bw-img');
    this.hint  = this.host.querySelector('.bw-hint');
    this.slots = this.host.querySelector('.bw-slots');
    this.bank  = this.host.querySelector('.bw-bank');
    this.cmt   = this.host.querySelector('.bw-cmt');
    if (this.cfg.counterEl) this.counterEl = (typeof this.cfg.counterEl === 'string') ? document.querySelector(this.cfg.counterEl) : this.cfg.counterEl;
  };

  BuildWord.prototype.reset = function () {
    this.idx = 0; this.clean = 0; this.finished = false;
    if (this.cfg.shuffle !== false) { /* порядок слов оставляем как задан */ }
    this._present();
  };

  BuildWord.prototype._present = function () {
    var self = this;
    if (this.idx >= this.words.length) return this._finish();
    var item = this.words[this.idx];
    this.cur = item;
    this.attempts = 0;
    this.wasWrong = false;

    // картинка / подсказка
    if (item.image) { this.img.src = item.image; this.pic.style.display = ''; }
    else this.pic.style.display = 'none';
    this.hint.textContent = item.hint || '';
    this.hint.style.display = item.hint ? '' : 'none';

    // буквы слова
    var raw = item.word;
    this.letters = raw.split('');
    var disp = function (ch) { return self.uppercase ? ch.toUpperCase() : ch; };

    // слоты
    this.slots.innerHTML = '';
    this.slotEls = [];
    var anchorN = (this.anchorFrom && raw.length >= this.anchorFrom) ? 1 : 0;
    for (var i = 0; i < this.letters.length; i++) {
      var s = el('div', 'bw-slot'); s.setAttribute('data-i', i);
      if (i < anchorN) {
        s.textContent = disp(this.letters[i]);
        s.classList.add('bw-fill', 'bw-lock');
        s._locked = true; s._ch = this.letters[i];
      } else {
        (function (slot) {
          slot.addEventListener('click', function () { self._returnSlot(slot); });
        })(s);
      }
      this.slots.appendChild(s); this.slotEls.push(s);
    }

    // банк букв = буквы слова (минус опорные) + лишние, перемешанные
    var pool = this.letters.slice(anchorN);
    var add = this.distractors;
    if (add > 0) {
      var src = isLatin(raw) ? EN_DISTRACT : RU_DISTRACT;
      var have = {}; raw.toLowerCase().split('').forEach(function (c) { have[c] = 1; });
      var pickable = src.split('').filter(function (c) { return !have[c]; });
      shuffle(pickable);
      for (var d = 0; d < add && d < pickable.length; d++) pool.push(pickable[d]);
    }
    shuffle(pool);

    this.bank.innerHTML = '';
    this.tileEls = [];
    pool.forEach(function (ch) {
      var t = el('div', 'bw-tile'); t.textContent = disp(ch); t._ch = ch;
      t.addEventListener('click', function () { self._placeTile(t); });
      self.bank.appendChild(t); self.tileEls.push(t);
    });

    this.cmt.innerHTML = this.strings.prompt;
    this._counter();
    if (this.cfg.onWord) this.cfg.onWord(raw, this.idx + 1, this.words.length);
  };

  BuildWord.prototype._counter = function () {
    var txt = this.strings.counter(this.idx + 1, this.words.length);
    if (this.counterEl) this.counterEl.textContent = txt;
  };

  BuildWord.prototype._firstEmpty = function () {
    for (var i = 0; i < this.slotEls.length; i++)
      if (!this.slotEls[i].classList.contains('bw-fill')) return this.slotEls[i];
    return null;
  };

  BuildWord.prototype._placeTile = function (tile) {
    if (this.finished || tile.classList.contains('bw-used') || this._checking) return;
    var slot = this._firstEmpty(); if (!slot) return;
    slot.textContent = tile.textContent;
    slot.classList.add('bw-fill');
    slot._ch = tile._ch; slot._tile = tile;
    tile.classList.add('bw-used');
    if (!this._firstEmpty()) this._check();
  };

  BuildWord.prototype._returnSlot = function (slot) {
    if (this.finished || this._checking || slot._locked) return;
    if (!slot.classList.contains('bw-fill')) return;
    if (slot._tile) slot._tile.classList.remove('bw-used');
    slot.classList.remove('bw-fill'); slot.textContent = ''; slot._ch = null; slot._tile = null;
  };

  BuildWord.prototype._assembled = function () {
    return this.slotEls.map(function (s) { return s._ch || ''; }).join('');
  };

  BuildWord.prototype._check = function () {
    var self = this;
    var ok = this._assembled().toLowerCase() === this.cur.word.toLowerCase();
    if (ok) {
      this._checking = true;
      this.slotEls.forEach(function (s) { s.classList.add('bw-good'); });
      var clean = !this.wasWrong;
      if (clean) this.clean++;
      if (this.cfg.onResult) this.cfg.onResult(this.cur.word, true, clean);
      setTimeout(function () { self._checking = false; self.idx++; self._present(); }, 650);
    } else {
      this.wasWrong = true; this.attempts++;
      this._checking = true;
      this.slotEls.forEach(function (s) { if (!s._locked) s.classList.add('bw-bad'); });
      if (this.cfg.onResult) this.cfg.onResult(this.cur.word, false, false);
      setTimeout(function () {
        self.slotEls.forEach(function (s) { s.classList.remove('bw-bad'); });
        if (self.attempts >= self.maxAttempts) { self._reveal(); }
        else {
          self._checking = false;   // снять до возврата, иначе _returnSlot заблокируется
          self.slotEls.forEach(function (s) { if (!s._locked) self._returnSlot(s); });
        }
      }, 420);
    }
  };

  BuildWord.prototype._reveal = function () {
    var self = this, disp = function (ch) { return self.uppercase ? ch.toUpperCase() : ch; };
    this.slotEls.forEach(function (s, i) {
      s.classList.add('bw-fill', 'bw-shown');
      s.textContent = disp(self.letters[i]); s._ch = self.letters[i];
    });
    this.tileEls.forEach(function (t) { t.classList.add('bw-used'); });
    setTimeout(function () {
      self.slotEls.forEach(function (s) { s.classList.remove('bw-shown'); });
      self._checking = false; self.idx++; self._present();
    }, 900);
  };

  BuildWord.prototype._finish = function () {
    this.finished = true;
    this.pic.style.display = 'none'; this.hint.style.display = 'none';
    this.slots.innerHTML = ''; this.bank.innerHTML = '';
    this.cmt.innerHTML = '<b>' + this.strings.done + '</b>';
    this.host.classList.add('bw-finished');
    if (this.cfg.onComplete) this.cfg.onComplete({ clean: this.clean, total: this.words.length });
  };

  BuildWord.prototype.destroy = function () {
    this.host.innerHTML = ''; this.host.classList.remove('bw-root', 'bw-finished');
  };

  root.BuildWord = {
    mount: function (host, cfg) {
      if (typeof host === 'string') host = document.querySelector(host);
      return new BuildWord(host, cfg);
    }
  };
})(typeof window !== 'undefined' ? window : this);
