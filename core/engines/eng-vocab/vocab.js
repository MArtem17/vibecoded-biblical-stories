/* Фото-словарь класса — общий движок.

   Страницы 5 и 6 классов были двумя копиями одного и того же кода (различались
   только данными, заголовком и ссылкой «назад»), 7-й стал бы третьей. Логика
   переехала сюда, колода приносит только контент:

     window.VOCAB_CONFIG = {
       grade: 7,                       // для заголовка и ссылки назад
       units: {"1":"Living & Spending", …},
       back:  {href:'../index.html', label:'← Учебник 7 класса'},
       lead:  '…'                      // необязательный подзаголовок
     };
     data/words.json  — источник правды: {"1":[{word,ru,img,credit{author,license,page}}, …]}
     data/fallback.js — та же копия в window.VOCAB_FALLBACK (file:// запрещает fetch)

   ES5, без сборки, офлайн — как и остальные страницы платформы. */
(function () {
  var CFG = window.VOCAB_CONFIG || {};
  var UNITS = CFG.units || {};
  var DATA = null;
  var synth = window.speechSynthesis;

  document.body.innerHTML =
    '<div class="wrap">' +
      '<div class="top">' +
        '<div class="lead" style="margin:0;font-weight:800;color:var(--bd)">🖼️ Фото-словарь</div>' +
        (CFG.back ? '<a href="' + CFG.back.href + '">' + CFG.back.label + '</a>' : '') +
      '</div>' +
      '<h1>Слова темы — настоящими фото</h1>' +
      '<div class="lead">' + (CFG.lead ||
        'Ключевые слова каждого юнита реальными фотографиями. Нажми на фото — послушай слово. Офлайн, печать A4.') +
      '</div>' +
      '<div class="tabs" id="tabs"></div>' +
      '<div class="utitle" id="utitle"></div>' +
      '<div class="photogrid" id="grid"></div>' +
      '<div class="credits" id="credits"></div>' +
      '<div class="note">Фотографии — из фотобанков (Pexels/Unsplash), кредиты авторов ниже.</div>' +
    '</div>';

  function speak(t) {
    if (!synth) return;
    try {
      synth.cancel();
      var u = new SpeechSynthesisUtterance(t);
      u.lang = 'en-US';
      u.rate = .95;
      synth.speak(u);
    } catch (e) {}
  }

  function srcName(url) {
    if (!url) return '';
    var m = url.match(/https?:\/\/([^\/]+)/);
    if (!m) return '';
    var h = m[1].replace(/^www\./, '');
    if (/pexels/.test(h)) return 'Pexels';
    if (/unsplash/.test(h)) return 'Unsplash';
    if (/wikimedia|wikipedia/.test(h)) return 'Wikimedia';
    if (/openverse/.test(h)) return 'Openverse';
    return h;
  }

  function show(u) {
    var tabs = document.getElementById('tabs').children, i;
    for (i = 0; i < tabs.length; i++)
      tabs[i].className = 'tab' + (tabs[i].getAttribute('data-u') === u ? ' on' : '');
    document.getElementById('utitle').textContent = 'Unit ' + u + ' · ' + (UNITS[u] || '');
    var arr = (DATA && DATA[u]) || [];
    var g = document.getElementById('grid');
    g.innerHTML = '';
    arr.forEach(function (p) {
      var el = document.createElement('div');
      el.className = 'photo';
      el.setAttribute('data-word', p.word);
      el.innerHTML = '<img loading="lazy" alt="' + p.word + '" src="' + p.img + '">' +
        '<div class="cap"><b>' + p.word + '</b><small>' + (p.ru || '') + '</small></div>';
      el.onclick = function () { speak(p.word); };
      g.appendChild(el);
    });
    var cr = arr.map(function (p) {
      var c = p.credit || {};
      var s = p.word + ' — ' + (c.author || '?') + ', ' + (c.license || '');
      var sn = srcName(c.page);
      if (sn) s += ' / ' + sn;
      return s;
    });
    document.getElementById('credits').textContent =
      cr.length ? ('Фото (обрезаны): ' + cr.join('; ') + '.') : '';
  }

  function build() {
    var t = document.getElementById('tabs');
    t.innerHTML = '';
    var keys = Object.keys(UNITS);
    keys.forEach(function (u) {
      var b = document.createElement('button');
      b.className = 'tab';
      b.setAttribute('data-u', u);
      b.textContent = 'Юнит ' + u;
      b.onclick = function () { show(u); };
      t.appendChild(b);
    });
    /* Прямая ссылка из библиотеки заданий: ?u=<юнит>&w=<слово> — открывает
       нужный юнит и подсвечивает конкретное слово, не весь список. */
    var q = new URLSearchParams(location.search);
    var wantU = q.get('u'), wantW = q.get('w');
    if (keys.length) show((wantU && UNITS[wantU] != null) ? wantU : keys[0]);
    if (wantW) {
      setTimeout(function () {
        var cells = document.querySelectorAll('#grid .photo');
        for (var i = 0; i < cells.length; i++) {
          if (cells[i].getAttribute('data-word') === wantW) {
            cells[i].scrollIntoView({ block: 'center', behavior: 'smooth' });
            cells[i].classList.add('jump');
            setTimeout(function (c) { return function () { c.classList.remove('jump'); }; }(cells[i]), 2600);
            break;
          }
        }
      }, 60);
    }
  }

  /* fetch с фолбэком на встроенные данные — инвариант платформы: под file://
     запрос запрещён, и словарь всё равно должен открываться. */
  var FALLBACK = window.VOCAB_FALLBACK || {};
  try {
    var r = new XMLHttpRequest();
    r.open('GET', 'data/words.json', true);
    var done = false;
    function go(d) {
      if (done) return;
      done = true;
      DATA = (d && Object.keys(d).length) ? d : FALLBACK;
      build();
    }
    r.onreadystatechange = function () {
      if (r.readyState === 4) {
        var d = FALLBACK;
        if ((r.status === 200 || r.status === 0) && r.responseText) {
          try { d = JSON.parse(r.responseText); } catch (e) {}
        }
        go(d);
      }
    };
    r.onerror = function () { go(FALLBACK); };
    r.send();
  } catch (e) {
    DATA = FALLBACK;
    build();
  }
})();
