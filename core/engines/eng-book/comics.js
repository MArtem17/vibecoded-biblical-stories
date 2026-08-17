/* ===================================================================
   Читалка комикс-сериала учебника (движок eng-book).

   Зачем: сериал живёт внутри учебника кусками — по одному упражнению
   «расставь сцены по порядку» на юнит. Решать так правильно, а ЧИТАТЬ
   подряд — негде: ни у одного класса не было страницы, где сезон виден
   целиком. Эта страница собирает эпизоды из ТЕХ ЖЕ данных юнитов
   (data/unitN.json), поэтому отдельного контента у неё нет и разъехаться
   с учебником она не может.

   Колода несёт только тонкий comics.html: подключил этот скрипт — получил
   листалку. Список юнитов скрипт берёт из window.BOOK_MANIFEST, а если
   страница его не объявила — выдирает из index.html колоды, чтобы манифест
   не жил в двух местах.

   Эпизод = упражнение type:"reorder" с imgs, в путях которых есть "comic".
   items[] в данных лежат В ПРАВИЛЬНОМ ПОРЯДКЕ (движок сам их мешает при
   рендере упражнения) — здесь они показываются как есть, это и есть чтение.

   Озвучка — те же клипы, что в учебнике: data/audio-map.json, реплика →
   mp3 голосом персонажа. Нет клипа — синтезатор en-GB, как в движке.
   =================================================================== */
'use strict';

(function () {

const CSS = `
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
body{font-family:'Golos Text',system-ui,-apple-system,sans-serif;color:#1E2630;background:#F4F6FB;padding:20px 14px 70px;display:flex;flex-direction:column;align-items:center}
.wrap{width:100%;max-width:720px}
.top{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap}
.top a{color:#2F6BDB;font-weight:700;font-size:13.5px;text-decoration:none}
h1{font-family:'Rubik',sans-serif;font-weight:800;font-size:24px;margin:6px 0 2px}
.lead{color:#5A6275;font-size:14px;line-height:1.55;margin-bottom:14px}
.bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
.bar button{font-family:inherit;font-weight:700;font-size:13.5px;border:2px solid #1E2630;border-radius:11px;background:#fff;padding:8px 13px;cursor:pointer;box-shadow:0 2px 0 #1E2630}
.bar button.on{background:#2F6BDB;border-color:#1E4FA5;box-shadow:0 2px 0 #1E4FA5;color:#fff}
.ep{background:#fff;border:2px solid #E3E7F0;border-radius:18px;padding:16px 16px 18px;margin-bottom:18px;box-shadow:0 10px 30px -22px rgba(20,30,60,.5)}
.ep .kick{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#2F6BDB;font-weight:800}
.ep h2{font-family:'Rubik',sans-serif;font-weight:800;font-size:18px;margin:2px 0 12px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:560px){.grid{grid-template-columns:1fr}}
.panel{border:2px solid #E3E7F0;border-radius:14px;overflow:hidden;background:#FBFCFE}
.panel img{display:block;width:100%;aspect-ratio:1/1;object-fit:cover}
.cap{display:flex;gap:8px;align-items:flex-start;padding:9px 10px}
.cap .num{flex:none;font-family:'Rubik',sans-serif;font-weight:800;font-size:12px;background:#1E2630;color:#fff;border-radius:8px;padding:3px 7px;margin-top:1px}
.cap .txt{font-size:13.5px;line-height:1.45}
.cap .txt b{font-weight:700}
.cap .tr{display:none;color:#5A6275;font-size:12.5px;margin-top:2px}
body.tr .cap .tr{display:block}
.cap button{flex:none;margin-left:auto;border:2px solid #1E2630;background:#fff;border-radius:9px;width:30px;height:30px;cursor:pointer;font-size:12px;box-shadow:0 2px 0 #1E2630}
.cap button.playing{background:#2E9E57;border-color:#1E7A40;box-shadow:0 2px 0 #1E7A40;color:#fff}
.foot{color:#8A93A5;font-size:12.5px;text-align:center;margin-top:6px}
`;

/* ---------- озвучка: те же клипы, что в учебнике ---------- */
let MAP = {}, cur = null, curBtn = null;
function stop() {
  try { if (cur) { cur.pause(); cur = null; } } catch (e) {}
  try { speechSynthesis.cancel(); } catch (e) {}
  if (curBtn) { curBtn.classList.remove('playing'); curBtn = null; }
}
function say(text, btn, onend) {
  stop();
  curBtn = btn; if (btn) btn.classList.add('playing');
  const done = () => { if (curBtn === btn) stop(); if (onend) onend(); };
  const f = MAP[text];
  if (f) {
    const a = new Audio('assets/' + f); cur = a;
    a.onended = done;
    const p = a.play(); if (p && p.catch) p.catch(done);
    return;
  }
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-GB'; u.rate = 0.92; u.onend = done;
    speechSynthesis.speak(u);
  } catch (e) { done(); }
}

/* ---------- данные ---------- */
function fetchJson(url) {
  return fetch(url + '?v=' + Date.now(), { cache: 'no-store' }).then(r => r.json());
}
function getManifest() {
  if (window.BOOK_MANIFEST) return Promise.resolve(window.BOOK_MANIFEST);
  return fetch('index.html', { cache: 'no-store' }).then(r => r.text()).then(t => {
    const m = t.match(/window\.BOOK_MANIFEST\s*=\s*\[([^\]]+)\]/);
    if (!m) throw new Error('нет BOOK_MANIFEST');
    return m[1].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean);
  });
}
const isComic = ex => ex.t === 'ex' && ex.type === 'reorder' &&
  Array.isArray(ex.imgs) && ex.imgs.length && /comic/i.test(ex.imgs[0]);

/* ---------- рендер ---------- */
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function build(episodes) {
  const root = document.getElementById('comics');
  const nav = document.getElementById('epnav');
  episodes.forEach((ep, i) => {
    const box = el('section', 'ep');
    box.id = 'ep' + (i + 1);
    box.appendChild(el('div', 'kick', 'Серия ' + (i + 1)));
    box.appendChild(el('h2', '', esc(ep.unit)));
    const grid = el('div', 'grid');
    ep.ex.items.forEach((line, k) => {
      const p = el('div', 'panel');
      const img = el('img'); img.loading = 'lazy'; img.src = ep.ex.imgs[k]; img.alt = '';
      p.appendChild(img);
      const cap = el('div', 'cap');
      cap.appendChild(el('span', 'num', String(k + 1)));
      const txt = el('div', 'txt', '<b>' + esc(line) + '</b>' +
        (ep.ex.trans && ep.ex.trans[k] ? '<div class="tr">' + esc(ep.ex.trans[k]) + '</div>' : ''));
      cap.appendChild(txt);
      const b = el('button', '', '▶'); b.type = 'button'; b.title = 'Слушать реплику';
      b.addEventListener('click', () => { if (curBtn === b) stop(); else say(line, b); });
      cap.appendChild(b);
      p.appendChild(cap);
      grid.appendChild(p);
    });
    box.appendChild(grid);
    root.appendChild(box);

    const nb = el('button', '', String(i + 1)); nb.type = 'button'; nb.title = ep.unit;
    nb.addEventListener('click', () => {
      stop();
      [...nav.children].forEach(x => x.classList.remove('on')); nb.classList.add('on');
      box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    nav.appendChild(nb);
  });
  const n = episodes.reduce((s, e) => s + e.ex.items.length, 0);
  document.getElementById('stat').textContent =
    episodes.length + ' серий · ' + n + ' сцен. Нажми ▶ у сцены — реплика прозвучит голосом персонажа.';
}

/* ---------- запуск ---------- */
const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
fetchJson('data/audio-map.json').then(m => { MAP = m || {}; }).catch(() => {});
getManifest().then(man =>
  Promise.all(man.map(f => fetchJson(f).catch(() => null)))
).then(units => {
  const eps = [];
  units.filter(Boolean).forEach(u =>
    (u.pages || []).forEach(pg => (pg.blocks || []).forEach(b => {
      if (isComic(b)) eps.push({ unit: u.unit, ex: b });
    })));
  if (!eps.length) {
    document.getElementById('stat').textContent = 'В данных колоды не нашлось ни одного эпизода.';
    return;
  }
  build(eps);
}).catch(e => {
  document.getElementById('stat').textContent = 'Не удалось загрузить данные: ' + e.message;
});

})();
