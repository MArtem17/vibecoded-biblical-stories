/* ===================================================================
   Listening Bank — банк дополнительных аудирований (движок eng-book).

   Зачем: озвученных клипов у нас за две тысячи, но услышать их можно только
   там, где стоит соответствующее упражнение. Учителю, которому нужно
   отдельное аудирование — на замену, на дом, на разгон в начале урока, —
   идти некуда. Это задача не про новый контент, а про упаковку: собрать
   уже записанное в одном месте и дать слушать подряд.

   Страница собирает ТЕКСТЫ ИЗ ТЕХ ЖЕ данных юнитов и клипы из того же
   data/audio-map.json, что и учебник, поэтому разъехаться с ним не может.
   Нового звука не пишется ни одного.

   Режим «только слушать»: текст спрятан под кнопкой. Это и есть разница
   между аудированием и чтением вслух — если текст на виду, ученик читает
   глазами и слушает мимо.
   =================================================================== */
'use strict';

(function () {

const CSS = `
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
body{font-family:'Golos Text',system-ui,-apple-system,sans-serif;color:#1E2630;background:#F4F6FB;padding:20px 14px 70px;display:flex;flex-direction:column;align-items:center}
.wrap{width:100%;max-width:760px}
.top{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap}
.top a{color:#2F6BDB;font-weight:700;font-size:13.5px;text-decoration:none}
h1{font-family:'Rubik',sans-serif;font-weight:800;font-size:24px;margin:6px 0 2px}
.lead{color:#5A6275;font-size:14px;line-height:1.55;margin-bottom:14px}
.bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
.bar button{font-family:inherit;font-weight:700;font-size:13px;border:2px solid #1E2630;border-radius:11px;background:#fff;padding:7px 12px;cursor:pointer;box-shadow:0 2px 0 #1E2630}
.bar button.on{background:#2F6BDB;border-color:#1E4FA5;box-shadow:0 2px 0 #1E4FA5;color:#fff}
.grp{margin-bottom:22px}
.grp h2{font-family:'Rubik',sans-serif;font-weight:800;font-size:17px;margin:0 0 8px}
.tr{background:#fff;border:2px solid #E3E7F0;border-radius:14px;padding:11px 13px;margin-bottom:9px}
.row{display:flex;gap:9px;align-items:center;flex-wrap:wrap}
.play{font-family:inherit;font-weight:800;font-size:14px;border:2px solid #1E4FA5;border-radius:11px;background:#2F6BDB;color:#fff;padding:7px 14px;cursor:pointer;box-shadow:0 2px 0 #1E4FA5}
.play.playing{background:#E8555A;border-color:#B23036;box-shadow:0 2px 0 #B23036}
.show{font-family:inherit;font-weight:700;font-size:13px;border:2px solid #C9D2E3;border-radius:11px;background:#fff;color:#4A5163;padding:7px 12px;cursor:pointer}
.what{font-size:13px;color:#8A93A5;flex:1 1 120px}
.txt{display:none;margin-top:9px;font-size:15px;line-height:1.65;border-left:4px solid #E8555A;padding-left:11px}
.txt.on{display:block}
.foot{color:#8A93A5;font-size:12.5px;margin-top:16px}
`;

const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

let MAP = {}, cur = null, curBtn = null;
function stop() {
  if (cur) { try { cur.pause(); } catch (e) {} cur = null; }
  try { speechSynthesis.cancel(); } catch (e) {}
  if (curBtn) { curBtn.classList.remove('playing'); curBtn = null; }
}
function say(text, btn) {
  const again = (curBtn === btn);
  stop();
  if (again) return;
  curBtn = btn; btn.classList.add('playing');
  const done = () => { if (curBtn === btn) stop(); };
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

/* Берём только связные тексты: карточки чтения с озвучкой и тексты gist.
   Отдельные слова-чипы в банк не идут — слушать россыпь слов бессмысленно,
   а список от них раздувается вчетверо. */
const LONG = 90;
function collect(units) {
  const out = [];
  units.forEach(u => {
    const items = [];
    (u.pages || []).forEach(pg => {
      const blocks = pg.blocks || [];
      blocks.forEach((b, i) => {
        if (b.t === 'readcard' && b.listen && b.text && b.text.length >= LONG) {
          const rule = blocks.slice(0, i).reverse().find(x => x.t === 'rule');
          items.push({ text: b.text, what: rule ? rule.title : 'Текст для чтения', page: pg.num });
        }
        if (b.t === 'ex' && b.type === 'gist' && b.text) {
          items.push({ text: b.text, what: 'Найди главное', page: pg.num });
        }
        if (b.t === 'ex' && b.type === 'whotext') {
          (b.people || []).forEach(p => items.push({ text: p.text, what: 'Три рассказа · ' + p.name, page: pg.num }));
        }
      });
    });
    if (items.length) out.push({ unit: u.unit || '', items });
  });
  return out;
}

function build(groups) {
  document.head.appendChild(el('style', '', CSS));
  const root = document.getElementById('bank');
  const bar = document.getElementById('unitnav');
  let total = 0;
  groups.forEach((g, gi) => {
    const sec = el('section', 'grp');
    sec.id = 'u' + gi;
    sec.appendChild(el('h2', '', esc(g.unit)));
    g.items.forEach(it => {
      total++;
      const box = el('div', 'tr');
      const row = el('div', 'row');
      const play = el('button', 'play', '▶ Слушать');
      play.type = 'button';
      play.onclick = () => say(it.text, play);
      row.appendChild(play);
      const txt = el('div', 'txt', esc(it.text));
      const show = el('button', 'show', 'Показать текст');
      show.type = 'button';
      show.onclick = () => {
        const on = txt.classList.toggle('on');
        show.textContent = on ? 'Спрятать текст' : 'Показать текст';
      };
      row.appendChild(show);
      row.appendChild(el('span', 'what', esc(it.what) + ' · стр. ' + it.page));
      box.appendChild(row);
      box.appendChild(txt);
      sec.appendChild(box);
    });
    root.appendChild(sec);
    if (bar) {
      const b = el('button', '', esc(String(g.unit).replace(/^Unit\s*/i, 'U').split('·')[0].trim()));
      b.type = 'button';
      b.onclick = () => document.getElementById('u' + gi).scrollIntoView({ behavior: 'smooth', block: 'start' });
      bar.appendChild(b);
    }
  });
  const stat = document.getElementById('stat');
  if (stat) stat.textContent = 'В банке ' + total + ' аудирований из ' + groups.length +
    ' юнитов. Текст спрятан нарочно: если он на виду, ученик читает глазами и слушает мимо.';
}

Promise.all([
  getManifest().then(list => Promise.all(list.map(n => fetchJson(n).catch(() => null)))),
  fetchJson('data/audio-map.json').catch(() => ({})),
]).then(([units, map]) => {
  MAP = map || {};
  build(collect(units.filter(Boolean)));
}).catch(e => {
  const stat = document.getElementById('stat');
  if (stat) stat.textContent = 'Не удалось собрать банк: ' + e.message;
});

})();
