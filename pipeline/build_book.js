/* Сборка книги тома (window.BOOK) из data/volume.js — по гайду
   docs/encyclopedia-volume-guide.md: том = контент поверх общего движка
   core/engines/encyclopedia.

   Развороты: 1 обложка + 20 «Великих сюжетов» в хронологии. Текст разворота =
   пересказ сюжета (7 языков уже в volume.js), озвучка — assets/audio/ru/
   page-NN.mp3 (дословная, конвейер pipeline/tts_book.py). Игры движка на
   финальном развороте (он же хаб ?games=1): timeline по эпохам, memory,
   word (имена героев), glossary (весь словарик тома).

   node pipeline/build_book.js */
var fs = require("fs"), path = require("path"), vm = require("vm");
var ROOT = path.resolve(__dirname, "..");
var sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "data/volume.js"), "utf8"), sandbox);
var V = sandbox.window.BIBLE;

function plotById(id) { return V.plots.filter(function (p) { return p.id === id; })[0]; }
function heroById(id) { return V.heroes.filter(function (h) { return h.id === id; })[0]; }
function imgOf(c) { return "../img/" + c.id + "_" + c.slug + ".webp"; }

var BOOK = {
  book_id: "bible_stories",
  title: "Моя первая большая энциклопедия · Библия: великие истории",
  languages: V.languages.slice(),
  labels: { ru: "RU", en: "EN", de: "DE", es: "ES", pt: "PT", fr: "FR", ar: "AR" },
  pages: []
};

/* Аудио: подключаем все языки, чьи клипы реально лежат на диске */
var fsMod = require("fs");
function audioFor(n) {
  var nn = n < 10 ? "0" + n : String(n);
  var audio = {};
  BOOK.languages.forEach(function (lg) {
    if (fsMod.existsSync(path.join(ROOT, "assets/audio/" + lg + "/page-" + nn + ".mp3")))
      audio[lg] = "../assets/audio/" + lg + "/page-" + nn + ".mp3";
  });
  return Object.keys(audio).length ? audio : null;
}

/* Разворот 1 — обложка. Картинка БЕЗ надписи (img/book-cover.webp):
   заголовок на языке читателя рисует движок (title-layout) — кириллица
   в растре не нужна ни одному языку. */
BOOK.pages.push({
  n: 1, layout: "title", img: "../img/book-cover.webp",
  text: V.title,
  series: {
    ru: "Моя первая большая энциклопедия", en: "My First Big Encyclopedia",
    de: "Meine erste große Enzyklopädie", es: "Mi primera gran enciclopedia",
    pt: "Minha primeira grande enciclopédia", fr: "Ma première grande encyclopédie",
    ar: "موسوعتي الأولى الكبيرة"
  },
  toc: { ru: "Обложка", en: "Cover", de: "Umschlag", es: "Portada", pt: "Capa", fr: "Couverture", ar: "الغلاف" }
});
BOOK.pages[0].audio = audioFor(1);

/* ── Словарь терминов тома: из глоссария (7 языков уже переведены).
   Движок берёт BOOK.termForms/termMeta (правка core, фолбэк — дино).
   Стемы — префиксы: слово в нижнем регистре + усечения на 1–2 буквы
   (покрывают падежи/число; движок матчит по startsWith). */
function stems(word) {
  var w = String(word || "").toLowerCase().split(/[\s-]/)[0];
  var out = [];
  [w, w.slice(0, -1), w.slice(0, -2)].forEach(function (f) {
    if (f.length >= 4 && out.indexOf(f) < 0) out.push(f);
  });
  return out.length ? out : [w];
}
BOOK.termForms = {};
BOOK.termMeta = {};
V.glossary.forEach(function (g) {
  var ruStems = stems(g.word.ru);
  var key = ruStems[ruStems.length - 1];
  var forms = {};
  BOOK.languages.forEach(function (lg) {
    if (g.word[lg]) forms[lg] = stems(g.word[lg]);
  });
  BOOK.termForms[key] = forms;
  BOOK.termMeta[key] = { term: g.word, note: g.def };
});
function pageTerms(textRu) {
  var low = String(textRu || "").toLowerCase();
  var found = [];
  Object.keys(BOOK.termForms).forEach(function (key) {
    var forms = BOOK.termForms[key].ru || [];
    for (var i = 0; i < forms.length; i++) {
      if (low.indexOf(forms[i]) >= 0) { found.push(key); return; }
    }
  });
  return found;
}

/* Развороты 2–21 — сюжеты в хронологии (порядок plots_01…20 уже хронологический) */
V.plots.forEach(function (p, i) {
  var n = i + 2;
  BOOK.pages.push({
    n: n, layout: "top",
    img: imgOf(p),
    audio: audioFor(n),
    text: p.story,
    toc: p.name,
    terms: pageTerms(p.story.ru)
  });
});

/* Развороты 22–25 — краткая история Нового Завета (ntPages из volume.js):
   книга не обрывается на Рождестве. */
(V.ntPages || []).forEach(function (p, i) {
  var n = V.plots.length + 2 + i;
  BOOK.pages.push({
    n: n, layout: "top",
    img: "../img/" + p.id + "_" + p.slug + ".webp",
    audio: audioFor(n),
    text: p.story,
    toc: p.name,
    terms: pageTerms(p.story.ru)
  });
});

/* Игры движка — на финальном развороте (хаб = разворот с макс. числом игр) */
var last = BOOK.pages[BOOK.pages.length - 1];

/* timeline: расставь сюжеты по 4 великим эпохам */
var TL_BUCKETS = [
  { key: "e1", eras: [1], name: V.eras[0].name },
  { key: "e3", eras: [2, 3], name: V.eras[2].name },
  { key: "e5", eras: [4, 5], name: V.eras[4].name },
  { key: "e7", eras: [6, 7], name: V.eras[6].name }
];
var TL_PICK = ["plots_03", "plots_05", "plots_10", "plots_12", "plots_14", "plots_16", "plots_18", "plots_20"];
var tlItems = TL_PICK.map(function (id) {
  var p = plotById(id);
  var bucket = TL_BUCKETS.filter(function (b) { return b.eras.indexOf(p.era) >= 0; })[0];
  return { name: p.name, bucket: bucket.key, sil: imgOf(p) };
});
var SB_TIMELINE = {
  type: "timeline",
  title: { ru: "Расставь по эпохам", en: "Sort by era", de: "Nach Epochen ordnen", es: "Ordena por época", pt: "Organiza por época", fr: "Range par époques", ar: "رتّب حسب الحقب" },
  buckets: TL_BUCKETS.map(function (b) { return { name: b.name, key: b.key }; }),
  items: tlItems
};

/* memory: пары по сюжетам */
var SB_MEMORY = {
  type: "memory",
  title: { ru: "Найди пару", en: "Find the pair", de: "Finde das Paar", es: "Encuentra la pareja", pt: "Encontra o par", fr: "Trouve la paire", ar: "ابحث عن الزوج" },
  pairs: ["plots_03", "plots_06", "plots_14", "plots_20"].map(function (id) {
    var p = plotById(id);
    return { name: p.name, sil: imgOf(p) };
  })
};

/* word: собери имя героя по буквам */
var SB_WORD = {
  type: "word",
  title: { ru: "Собери имя", en: "Build the name", de: "Baue den Namen", es: "Arma el nombre", pt: "Monta o nome", fr: "Assemble le nom", ar: "كوّن الاسم" },
  items: ["heroes_01", "heroes_06", "heroes_12", "heroes_17", "heroes_18"].map(function (id) {
    var h = heroById(id);
    return { name: h.name, sil: imgOf(h), photo: null };
  })
};

/* glossary: словарик тома целиком */
var SB_GLOSSARY = {
  type: "glossary",
  title: { ru: "Словарик", en: "Glossary", de: "Glossar", es: "Glosario", pt: "Glossário", fr: "Petit dictionnaire", ar: "القاموس" },
  terms: V.glossary.map(function (g) { return { term: g.word, def: g.def }; })
};

last.sandboxes = [SB_TIMELINE, SB_MEMORY, SB_WORD, SB_GLOSSARY];

var out = path.join(ROOT, "book", "book.data.js");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, "window.BOOK = window.BOOK || " + JSON.stringify(BOOK, null, 1) + ";\n");
console.log("book/book.data.js: " + BOOK.pages.length + " разворотов, " +
  last.sandboxes.length + " игр движка на развороте " + last.n);
