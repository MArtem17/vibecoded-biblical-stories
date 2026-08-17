/* ===================================================================
   Brain Trainers — полка самых игровых механик учебника (движок eng-book).

   Зачем: механик у нас больше пятидесяти, и половина из них — настоящие игры
   на память и внимание: филворд, змейка, кроссворд, мемори, анаграммы,
   карточки, маршрут по карте, магазин. Но лежат они внутри юнитов вперемешку
   с грамматикой, и учитель, который хочет пять минут игры в конце урока,
   про них просто не знает. Не хватало не механик, а полки.

   Страница НИЧЕГО НЕ ДУБЛИРУЕТ: она собирает упражнения из тех же данных
   (data/unitN.json) и даёт глубокую ссылку index.html?page=N на страницу, где
   упражнение живёт. Своего рендера у неё нет намеренно — движок учебника
   закрыт в IIFE, и вытаскивать его наружу ради витрины значило бы
   переписывать движок, чего мы не делаем ради одной страницы.

   Список юнитов берётся из window.BOOK_MANIFEST, а если страница его не
   объявила — выдирается из index.html колоды, чтобы манифест не жил в двух
   местах (тот же приём, что в comics.js).
   =================================================================== */
'use strict';

(function () {

/* Игровыми считаем те механики, где есть азарт и соревнование с самим собой:
   найти, вспомнить, успеть, собрать. Грамматические выборы и вписывания сюда
   намеренно не берём — их и так видно в юните. */
const GAMES = {
  wordsearch: ['Филворд', '🔎', 'Найти слова в сетке букв'],
  crossword:  ['Кроссворд', '⬛', 'Отгадать слова по определениям'],
  snake:      ['Змейка', '🐍', 'Разрезать слипшуюся цепочку слов'],
  memory:     ['Мемори', '🃏', 'Найти пары по памяти'],
  anagram:    ['Анаграммы', '🔀', 'Собрать слово из перепутанных букв'],
  flashcards: ['Карточки', '⚡', 'Успеть вспомнить перевод'],
  maproute:   ['Маршрут', '🗺️', 'Пройти путь по карте города'],
  shop:       ['Магазин', '🛒', 'Собрать корзину и посчитать сдачу'],
  hotspot:    ['Точки на картинке', '📍', 'Подписать, что где'],
  dressup:    ['Одевалка', '🧥', 'Одеться по погоде'],
  cities:     ['Города', '🏙️', 'Узнать город по приметам'],
  dissect:    ['Разбор', '🔬', 'Разложить предложение по частям'],
  myth:       ['Миф или правда', '🤔', 'Решить, потом прочитать разгадку'],
  swap:       ['Диалог-конструктор', '💬', 'Менять слова и играть заново'],
  timeline:   ['Лента времени', '📅', 'Расставить события'],
  idiom:      ['Идиомы', '🦊', 'Догадаться, о чём это на самом деле'],
};

const CSS = `
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
body{font-family:'Golos Text',system-ui,-apple-system,sans-serif;color:#1E2630;background:#F4F6FB;padding:20px 14px 70px;display:flex;flex-direction:column;align-items:center}
.wrap{width:100%;max-width:760px}
.top{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap}
.top a{color:#2F6BDB;font-weight:700;font-size:13.5px;text-decoration:none}
h1{font-family:'Rubik',sans-serif;font-weight:800;font-size:24px;margin:6px 0 2px}
.lead{color:#5A6275;font-size:14px;line-height:1.55;margin-bottom:14px}
.dice{font-family:inherit;font-weight:800;font-size:15px;border:2px solid #1E4FA5;border-radius:13px;
  background:#2F6BDB;color:#fff;padding:11px 18px;cursor:pointer;box-shadow:0 3px 0 #1E4FA5;margin-bottom:18px}
.dice:active{transform:translateY(2px);box-shadow:0 1px 0 #1E4FA5}
.grp{margin-bottom:20px}
.grp h2{font-family:'Rubik',sans-serif;font-weight:800;font-size:17px;margin:0 0 3px;display:flex;align-items:center;gap:8px}
.grp .what{color:#5A6275;font-size:13px;margin-bottom:8px}
.items{display:flex;flex-wrap:wrap;gap:8px}
.item{display:block;text-decoration:none;color:inherit;background:#fff;border:2px solid #E3E7F0;border-radius:12px;
  padding:8px 12px;font-size:13.5px;line-height:1.35;box-shadow:0 4px 14px -10px rgba(20,30,60,.5)}
.item:hover{border-color:#2F6BDB}
.item b{display:block;font-family:'Rubik',sans-serif;font-weight:700;font-size:13px;color:#2F6BDB}
.foot{color:#8A93A5;font-size:12.5px;margin-top:18px}
`;

const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

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

/* собираем: тип → [{unit, page, title}] */
function collect(units) {
  const byType = {};
  units.forEach(u => {
    (u.pages || []).forEach(pg => {
      (pg.blocks || []).forEach(function walk(b) {
        if (Array.isArray(b)) return b.forEach(walk);
        if (!b || typeof b !== 'object') return;
        if (b.t === 'ex' && GAMES[b.type]) {
          (byType[b.type] = byType[b.type] || []).push({
            unit: u.unit || '', page: pg.num, title: b.title || '',
          });
        }
        Object.keys(b).forEach(k => { if (k !== 't') walk(b[k]); });
      });
    });
  });
  return byType;
}

function build(byType) {
  document.head.appendChild(el('style', '', CSS));
  const root = document.getElementById('trainer');
  const all = [];
  Object.keys(GAMES).forEach(type => {
    const list = byType[type];
    if (!list || !list.length) return;
    const [name, icon, what] = GAMES[type];
    const g = el('section', 'grp');
    g.appendChild(el('h2', '', icon + ' ' + esc(name) + ' <span style="font-weight:600;color:#8A93A5;font-size:13px">· ' + list.length + '</span>'));
    g.appendChild(el('div', 'what', esc(what)));
    const box = el('div', 'items');
    /* Чип, а не карточка с текстом: в некоторых механиках по два задания на
       юнит, и двадцать полных подписей подряд превращают полку в простыню,
       по которой ничего не найти. Название задания — в подсказке. */
    list.forEach(it => {
      const short = String(it.unit).split('·')[0].trim() || ('стр. ' + it.page);
      const a = el('a', 'item', '<b>' + esc(short) + '</b>стр. ' + it.page);
      a.href = 'index.html?page=' + it.page;
      a.title = String(it.title).replace(/\s+/g, ' ');
      box.appendChild(a);
      all.push(a.href);
    });
    g.appendChild(box);
    root.appendChild(g);
  });

  /* «случайная игра» — то, ради чего полка и нужна: пять минут в конце урока
     без выбора и раздумий */
  const dice = document.getElementById('dice');
  if (dice && all.length) {
    dice.onclick = () => { location.href = all[Math.floor(Math.random() * all.length)]; };
    dice.style.display = '';
  }
  const stat = document.getElementById('stat');
  if (stat) stat.textContent = 'Игровых заданий на полке: ' + all.length +
    ' · механик: ' + Object.keys(byType).length +
    '. Каждая ссылка открывает страницу учебника, где задание живёт.';
}

getManifest()
  .then(list => Promise.all(list.map(n => fetchJson(n).catch(() => null))))
  .then(units => build(collect(units.filter(Boolean))))
  .catch(e => {
    const stat = document.getElementById('stat');
    if (stat) stat.textContent = 'Не удалось собрать полку: ' + e.message;
  });

})();
