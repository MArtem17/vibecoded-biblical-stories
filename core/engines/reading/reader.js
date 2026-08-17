/* Reading-apparatus engine.
   Рендерит полный цикл reading-урока из данных урока (window.READING_LESSON
   или fetch data/<?l=id>.json). Секции показываются, только если данные есть.
   Контент — в decks/<deck>/reading/data/<id>.json. Логика — здесь, в core. */
(function () {
  'use strict';
  var synth = window.speechSynthesis;
  function speak(t) { if (!synth) return; try { synth.cancel(); var u = new SpeechSynthesisUtterance(t); u.lang = 'en-US'; u.rate = .95; synth.speak(u); } catch (e) {} }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function sec(tag, title, skill) {
    var s = el('div', 'sec');
    if (skill) s.appendChild(el('span', 'skill', esc(skill)));
    s.appendChild(el('h2', null, '<span class="tag">' + esc(tag) + '</span>' + esc(title)));
    return s;
  }

  function glossWrap(text, gloss) {
    var out = esc(text);
    for (var i = 0; i < gloss.length; i++) {
      var term = gloss[i][0], ru = gloss[i][1];
      var re = new RegExp('\\b(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')\\b', 'i');
      out = out.replace(re, '<span class="gl" data-g="' + esc(ru) + '">$1</span>');
    }
    return out;
  }

  function render(L) {
    var app = document.getElementById('app');
    app.innerHTML = '';
    var wrap = el('div', 'wrap');
    var top = el('div', 'topbar');
    top.appendChild(el('div', 'lead', '🔬 Лаборатория чтения'));
    var back = document.createElement('a'); back.href = 'index.html'; back.textContent = '← К списку'; top.appendChild(back);
    wrap.appendChild(top);
    wrap.appendChild(el('h1', null, esc(L.title)));
    if (L.lead) wrap.appendChild(el('div', 'lead', esc(L.lead)));

    /* ===== BEFORE ===== */
    if ((L.photos && L.photos.length) || (L.vocab && L.vocab.length) || (L.sort && L.sort.length) || (L.predict && L.predict.length)) {
      var s1 = sec('До чтения', 'Разомнись', 'Reading skill: Previewing');
      if (L.photos && L.photos.length) {
        /* Подсказка была написана под пилот («что это за виды спорта?») и
           показывалась над фотографией кухни, зонта и слона во всех остальных
           текстах. Формулировка общая; свою тему урок задаёт полем photohint. */
        s1.appendChild(el('div', 'hint', '<b>Vocabulary preview.</b> ' + esc(L.photohint ||
          'Посмотри на фото — знаешь эти слова по-английски? Скажи вслух, что видишь.')));
        var pg = el('div', 'photogrid');
        L.photos.forEach(function (ph) {
          pg.appendChild(el('div', 'photo', '<img loading="lazy" alt="' + esc(ph.word) + '" src="' + esc(ph.img) + '"><div class="cap"><b>' + esc(ph.word) + '</b><small>' + esc(ph.ru || '') + '</small></div>'));
        });
        s1.appendChild(pg);
      }
      if (L.vocab && L.vocab.length) {
        s1.appendChild(el('div', 'hint', '<b>Слова темы.</b> Нажми на слово — послушай, как оно звучит.'));
        var ch = el('div', 'chips');
        L.vocab.forEach(function (w) {
          var c = el('div', 'chip', esc(w[0]) + '<small>' + esc(w[1] || '') + '</small>');
          c.onclick = function () { speak(w[0]); }; ch.appendChild(c);
        });
        s1.appendChild(ch);
      }
      if (L.sort && L.sort.length) {
        s1.appendChild(el('div', 'hint', '<b>Про тебя.</b> Нажимай на слово, пока не выберешь, как часто это делаешь ты.'));
        var sw = el('div', 'sortwords');
        L.sort.forEach(function (w) {
          var e = el('div', 'sw', esc(w)); e.dataset.b = '';
          e.onclick = function () { var b = this.dataset.b === '' ? 0 : (+this.dataset.b + 1); if (b > 2) b = ''; this.dataset.b = b; };
          sw.appendChild(e);
        });
        s1.appendChild(sw);
        s1.appendChild(el('div', 'swlegend', '<b class="lg0">никогда</b><b class="lg1">иногда</b><b class="lg2">каждый день</b>'));
      }
      if (L.predict && L.predict.length) {
        s1.appendChild(el('div', 'hint', '<b>Догадка.</b> До чтения отметь <b>T/F</b>. После текста откроешь ответы и сравнишь.'));
        var tbl = el('table', 'pred', '<thead><tr><th>Утверждение</th><th style="width:96px">Моя догадка</th><th style="width:70px">Ответ</th></tr></thead>');
        var tb = el('tbody');
        L.predict.forEach(function (row, idx) {
          var tr = el('tr', null, '<td>' + esc(row[0]) + '</td><td><span class="tf"><button data-v="t">T</button><button data-v="f">F</button></span></td><td><span class="ans hidden" id="pa' + idx + '">•</span></td>');
          var btns = tr.querySelectorAll('.tf button');
          for (var k = 0; k < btns.length; k++) btns[k].onclick = (function (bs, tr2) { return function () { for (var m = 0; m < bs.length; m++) bs[m].className = ''; this.className = 'on'; tr2.dataset.guess = this.dataset.v; }; })(btns, tr);
          tb.appendChild(tr);
        });
        tbl.appendChild(tb); s1.appendChild(tbl);
      }
      wrap.appendChild(s1);
    }

    /* ===== READING ===== */
    var s2 = sec('Чтение', 'Текст');
    var words = L.passage.words || (L.passage.paras.join(' ').split(/\s+/).length);
    var wpm = el('div', 'wpm');
    var wbtn = el('button', null, '▶ Начать чтение');
    var wres = el('div', 'res', 'Нажми «Начать», читай, потом «Прочитал» — покажу скорость (слов/мин).');
    var wStart = null;
    wbtn.onclick = function () {
      if (wStart === null) { wStart = (new Date()).getTime(); wbtn.textContent = '⏹ Прочитал'; wbtn.className = 'stop'; wres.textContent = 'Читаю…'; }
      else {
        var s = ((new Date()).getTime() - wStart) / 1000; var v = Math.round(words / (s / 60)); wStart = null;
        wbtn.textContent = '▶ Ещё раз'; wbtn.className = '';
        var band = v < 80 ? 'не спеши, но можно быстрее' : v < 130 ? 'хороший темп!' : 'очень быстро!';
        wres.innerHTML = '<span class="res">' + v + ' слов/мин</span> <small>· ' + Math.round(s) + ' сек · ' + band + '</small>';
      }
    };
    wpm.appendChild(wbtn); wpm.appendChild(wres); s2.appendChild(wpm);

    var pass = el('div', 'passage');
    if (L.passage.title) pass.appendChild(el('div', 'ttl', esc(L.passage.title)));
    var ff = {}; (L.passage.funfacts || []).forEach(function (f) { ff[f[0]] = f[1]; });
    L.passage.paras.forEach(function (p, i) {
      pass.appendChild(el('p', null, '<span class="ln">' + (i + 1) + '</span>' + glossWrap(p, L.gloss || [])));
      /* Ключ врезки — НОМЕР абзаца, как он подписан на экране (с единицы), а не
         индекс массива. Раньше здесь стояло ff[i]: врезки выезжали на абзац
         раньше задуманного, а врезка последнего абзаца не рисовалась вообще
         (ключ 4 при четырёх абзацах — 9 текстов 5 класса). */
      if (ff[i + 1]) pass.appendChild(el('div', 'fun', '<b>Fun fact:</b> ' + esc(ff[i + 1])));
    });
    s2.appendChild(pass);
    s2.appendChild(el('div', 'hint', 'Слова с <span class="gl">пунктиром</span> — нажми, чтобы увидеть перевод. Всего в тексте <b>' + words + '</b> слов.'));
    wrap.appendChild(s2);
    // gloss tap
    setTimeout(function () { var gs = pass.querySelectorAll('.gl'); for (var i = 0; i < gs.length; i++) gs[i].onclick = function () { alert(this.dataset.g); }; }, 0);

    /* ===== AFTER: reveal predictions ===== */
    if (L.predict && L.predict.length) {
      var sr = sec('После', 'Проверь догадку');
      sr.appendChild(el('div', 'hint', 'Открой ответы из текста и сравни со своей догадкой.'));
      var rb = el('button', 'btn alt', 'Показать ответы из текста');
      rb.onclick = function () {
        L.predict.forEach(function (row, i) {
          var a = document.getElementById('pa' + i); var isT = !!row[1];
          a.textContent = isT ? 'True' : 'False'; a.className = 'ans ' + (isT ? 't' : 'f');
          var tr = a.parentNode.parentNode; var g = tr.dataset.guess;
          if (g) { var ok = (g === 't') === isT; var m = el('span', 'hitmark', ok ? '✓' : '✗'); m.style.color = ok ? '#2f7d3e' : '#c0392b'; a.parentNode.appendChild(m); }
        });
        rb.disabled = true; rb.textContent = 'Ответы открыты';
      };
      sr.appendChild(rb); wrap.appendChild(sr);
    }

    /* ===== notes ===== */
    if (L.notes) {
      var sn = sec('После', 'Конспект', 'Reading skill: Taking notes');
      sn.appendChild(el('div', 'hint', esc(L.notes.prompt)));
      var lines = L.notes.lines || 3;
      for (var i = 0; i < lines; i++) { var f = el('div', 'field'); f.innerHTML = '<input type="text" placeholder="' + (i + 1) + ' …">'; sn.appendChild(f); }
      var nb = el('button', 'btn alt', 'Показать образец'); var nr = el('div', 'reveal', L.notes.model);
      nb.onclick = function () { nr.className = 'reveal show'; }; sn.appendChild(nb); sn.appendChild(nr); wrap.appendChild(sn);
    }

    /* ===== comprehension T/F ===== */
    if (L.comprehension && L.comprehension.length) {
      var sc = sec('После', 'Comprehension · True / False');
      var host = el('div');
      L.comprehension.forEach(function (row, idx) {
        host.appendChild(el('div', 'q', '<div class="qt">' + (idx + 1) + '. ' + esc(row[0]) + '</div><div class="opts"><label><input type="radio" name="c' + idx + '" value="t">True</label><label><input type="radio" name="c' + idx + '" value="f">False</label></div>'));
      });
      sc.appendChild(host);
      var cb = el('button', 'btn', 'Проверить<span class="score" id="cScore"></span>');
      cb.onclick = function () { var s = 0; L.comprehension.forEach(function (row, i) { var sel = document.querySelector('input[name="c' + i + '"]:checked'); if (sel && (sel.value === 't') === !!row[1]) s++; }); document.getElementById('cScore').textContent = ' ' + s + ' из ' + L.comprehension.length; };
      sc.appendChild(cb); wrap.appendChild(sc);
    }

    /* ===== mcq ===== */
    if (L.mcq && L.mcq.length) {
      var sm = sec('После', 'Понимание · выбор ответа');
      var mhost = el('div');
      L.mcq.forEach(function (m, idx) {
        var h = '<div class="qt">' + (idx + 1) + '. ' + esc(m.q) + '</div><div class="opts">';
        m.options.forEach(function (o, k) { h += '<label><input type="radio" name="m' + idx + '" value="' + k + '">' + esc(o) + '</label>'; });
        mhost.appendChild(el('div', 'q', h + '</div>'));
      });
      sm.appendChild(mhost);
      var mb = el('button', 'btn', 'Проверить<span class="score" id="mScore"></span>');
      mb.onclick = function () { var s = 0; L.mcq.forEach(function (m, i) { var sel = document.querySelector('input[name="m' + i + '"]:checked'); if (sel && +sel.value === m.answer) s++; }); document.getElementById('mScore').textContent = ' ' + s + ' из ' + L.mcq.length; };
      sm.appendChild(mb); wrap.appendChild(sm);
    }

    /* ===== synonyms ===== */
    if (L.synonyms && L.synonyms.length) {
      var ss = sec('После', 'Синонимы', 'Vocabulary: synonyms');
      ss.appendChild(el('div', 'hint', 'Найди в тексте слово, близкое по смыслу. Впиши и проверь.'));
      L.synonyms.forEach(function (row) { var f = el('div', 'field'); f.innerHTML = '<span style="font-size:14px;font-weight:700;min-width:150px">' + esc(row[0]) + ' →</span><input type="text" placeholder="слово из текста">'; ss.appendChild(f); });
      var sb = el('button', 'btn alt', 'Показать ответы');
      var srv = el('div', 'reveal', L.synonyms.map(function (r) { return esc(r[0]) + ' → <b>' + esc(r[1]) + '</b>'; }).join(' · '));
      sb.onclick = function () { srv.className = 'reveal show'; }; ss.appendChild(sb); ss.appendChild(srv); wrap.appendChild(ss);
    }

    /* ===== discussion ===== */
    if (L.discuss && L.discuss.length) {
      var sd = sec('После', 'Обсуждение', 'What do you think?');
      var ul = el('ul', 'discuss'); L.discuss.forEach(function (q) { ul.appendChild(el('li', null, esc(q))); }); sd.appendChild(ul); wrap.appendChild(sd);
    }

    /* ===== self-quiz ===== */
    if (L.quiz && L.quiz.questions && L.quiz.questions.length) {
      var sq = sec('Квиз', L.quiz.title || 'Квиз-самооценка');
      if (L.quiz.intro) sq.appendChild(el('div', 'hint', esc(L.quiz.intro)));
      var qhost = el('div');
      L.quiz.questions.forEach(function (q, idx) {
        var h = '<div class="qt">' + (idx + 1) + '. ' + esc(q.q) + '</div><div class="opts">';
        q.options.forEach(function (o, k) { h += '<label><input type="radio" name="q' + idx + '" value="' + (k + 1) + '">' + esc(o) + '</label>'; });
        qhost.appendChild(el('div', 'q', h + '</div>'));
      });
      sq.appendChild(qhost);
      var qb = el('button', 'btn', 'Узнать результат');
      var qr = el('div', 'result', '<div class="big" id="qBig"></div><div class="pts" id="qPts"></div><div class="txt" id="qTxt"></div>');
      var maxScore = L.quiz.questions.length * 4;
      qb.onclick = function () {
        var s = 0, done = 0;
        L.quiz.questions.forEach(function (q, i) { var sel = document.querySelector('input[name="q' + i + '"]:checked'); if (sel) { s += +sel.value; done++; } });
        if (done < L.quiz.questions.length) { alert('Ответь на все вопросы 🙂'); return; }
        var band = L.quiz.bands[L.quiz.bands.length - 1];
        for (var i = 0; i < L.quiz.bands.length; i++) { if (s >= L.quiz.bands[i][0]) { band = L.quiz.bands[i]; break; } }
        document.getElementById('qBig').textContent = band[1];
        document.getElementById('qPts').textContent = s + ' из ' + maxScore + ' баллов';
        document.getElementById('qTxt').textContent = band[2];
        qr.className = 'result show';
      };
      sq.appendChild(qb); sq.appendChild(qr); wrap.appendChild(sq);
    }

    /* ===== photo credits (обязательная атрибуция CC) ===== */
    if (L.photos && L.photos.length) {
      var srcName = function (url) { if (!url) return ''; var m = url.match(/https?:\/\/([^\/]+)/); if (!m) return ''; var h = m[1].replace(/^www\./, ''); if (/wikimedia|wikipedia/.test(h)) return 'Wikimedia'; if (/openverse/.test(h)) return 'Openverse'; if (/flickr/.test(h)) return 'Flickr'; if (/unsplash/.test(h)) return 'Unsplash'; if (/pexels/.test(h)) return 'Pexels'; return h; };
      var line = 'Фото (обрезаны): ' + L.photos.map(function (ph) {
        var c = ph.credit || {}; var s = ph.word + ' — ' + (c.author || '?') + ', ' + (c.license || '');
        var sn = srcName(c.page); if (sn) s += ' / ' + sn;
        return s;
      }).join('; ') + '.';
      wrap.appendChild(el('div', 'credits', esc(line)));
    }

    app.appendChild(wrap);
    document.title = L.title + ' · Лаборатория чтения';
  }

  function xhr(url, ok, err) {
    var done = false;
    function fail() { if (done) return; done = true; err(); }
    try { var r = new XMLHttpRequest(); r.open('GET', url, true);
      r.onreadystatechange = function () { if (r.readyState === 4) { if ((r.status === 200 || r.status === 0) && r.responseText) { try { var d = JSON.parse(r.responseText); if (done) return; done = true; ok(d); return; } catch (e) {} } fail(); } };
      r.onerror = fail; r.send();
    } catch (e) { fail(); }
  }
  function mountError(id) { document.getElementById('app').innerHTML = '<div class="wrap"><div class="err">Не удалось загрузить урок «' + esc(id) + '». <a href="index.html">← к списку</a></div></div>'; }

  var L = window.READING_LESSON;
  if (L) render(L);
  else { var id = (location.search.match(/[?&]l=([^&]+)/) || [])[1] || 'sport'; xhr('data/' + decodeURIComponent(id) + '.json', render, function () { mountError(id); }); }
})();
