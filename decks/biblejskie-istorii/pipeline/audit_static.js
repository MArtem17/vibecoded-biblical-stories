// Статический аудит тома «Библейские истории»: целостность данных + ассеты.
var fs = require('fs'), vm = require('vm'), path = require('path');
var ROOT = require('path').resolve(__dirname, '..');
var ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(ROOT + '/data/volume.js', 'utf8'), ctx);
var B = ctx.window.BIBLE;
var LANGS = B.languages;
var problems = [];
function bad(msg) { problems.push(msg); }
function hasAllLangs(obj, where) {
  if (!obj) { bad('нет объекта: ' + where); return; }
  LANGS.forEach(function (lg) {
    if (obj[lg] == null || obj[lg] === '') bad('нет перевода ' + lg + ': ' + where);
  });
}

var all = B.heroes.concat(B.plots);

// 1. Карты: переводы всех текстовых полей, изображения, аудио, пары, книги
all.forEach(function (c) {
  hasAllLangs(c.name, c.id + '.name');
  if (c.id.indexOf('heroes') === 0) {
    hasAllLangs(c.epithet, c.id + '.epithet');
    hasAllLangs(c.facts, c.id + '.facts');
    LANGS.forEach(function (lg) {
      if (c.facts && c.facts[lg] && c.facts[lg].length !== 3) bad(c.id + '.facts.' + lg + ': ' + (c.facts[lg] || []).length + ' шт (ждём 3)');
    });
    hasAllLangs(c.think, c.id + '.think');
  } else {
    hasAllLangs(c.story, c.id + '.story');
    hasAllLangs(c.findIt, c.id + '.findIt');
    hasAllLangs(c.wow, c.id + '.wow');
    if (!c.findAt || typeof c.findAt.x !== 'number') bad(c.id + ': нет findAt');
    if (!c.imgReady) bad(c.id + ': imgReady=false');
  }
  if (!c.digit || c.digit.num == null) bad(c.id + ': нет digit');
  else hasAllLangs(c.digit.label, c.id + '.digit.label');
  // пары symmetric
  if (c.pair) {
    var mate = null;
    all.forEach(function (x) { if (x.id === c.pair) mate = x; });
    if (!mate) bad(c.id + ': pair → несуществующий ' + c.pair);
    else if (mate.pair !== c.id) bad(c.id + ': пара несимметрична (' + c.pair + '.pair=' + mate.pair + ')');
  }
  // книги
  if (c.book) {
    var bk = null;
    B.books.forEach(function (x) { if (x.id === c.book) bk = x; });
    if (!bk) bad(c.id + ': book → нет книги ' + c.book);
    else if (!bk.ready) bad(c.id + ': book ' + c.book + ' не ready');
  }
  // ассеты
  var img = ROOT + '/img/' + c.id + '_' + c.slug + '.webp';
  if (!fs.existsSync(img)) bad(c.id + ': нет картинки ' + img);
  var poster = ROOT + '/img/posters/' + c.id + '_' + c.slug + '.webp';
  if (!fs.existsSync(poster)) bad(c.id + ': нет постера');
  if (c.audioReady) B.audioLangs.forEach(function (lg) {
    var au = ROOT + '/audio/' + lg + '/' + c.id + '_' + c.slug + '.mp3';
    if (!fs.existsSync(au)) bad(c.id + ': нет аудио ' + lg);
  });
  if (!c.audioReady) bad(c.id + ': audioReady=false');
  var era = null;
  B.eras.forEach(function (e) { if (e.id === c.era) era = e; });
  if (!era) bad(c.id + ': era ' + c.era + ' не существует');
});

// 2. UI-строки: все ключи, на которые ссылается app.js, есть на 7 языках
var app = fs.readFileSync(ROOT + '/sims.js','utf8') + fs.readFileSync(require('path').resolve(ROOT,'../core/engines/quest/quest.js'),'utf8');
var used = {};
(app.match(/T\("([A-Za-z0-9_]+)"\)/g) || []).forEach(function (m) {
  used[m.slice(3, -2)] = 1;
});
Object.keys(used).forEach(function (k) {
  if (!B.ui[k]) { bad('ui.' + k + ': ключа нет в томе'); return; }
  hasAllLangs(B.ui[k], 'ui.' + k);
});

// 3. Иконки: все icoH("x") из app.js существуют на диске
var icons = {};
(app.match(/icoH\("([a-z]+)"/g) || []).forEach(function (m) { icons[m.slice(6, -1)] = 1; });
// иконки из данных (ERA_ICON, KINDS, ITEMS, MATS, ANIMALS)
(app.match(/"(rainbow|sheep|fire|grapes|crown|whale|bethstar|lion|elephant|rabbit|giraffe|sun|wave|sprout|sunmoon|sleeper|cedar|stone|gold|straw|ice|paper|dove)"/g) || [])
  .forEach(function (m) { icons[m.slice(1, -1)] = 1; });
Object.keys(icons).forEach(function (k) {
  if (!fs.existsSync(ROOT + '/img/icons/' + k + '.webp')) bad('нет иконки ' + k + '.webp');
});

// 4. Сим-реестр: карты существуют; бонусы указывают на реальные объекты
(app.match(/plots_\d\d|heroes_\d\d/g) || []).forEach(function (id) {
  var found = false;
  all.forEach(function (c) { if (c.id === id) found = true; });
  if (!found) bad('app.js ссылается на несуществующую карту ' + id);
});
['ark', 'tabernacle', 'temple', 'babel'].forEach(function (k) {
  var found = null;
  B.reconstructor.forEach(function (o) { if (o.id === k) found = o; });
  if (!found) { bad('нет объекта реконструктора ' + k); return; }
  found.stages.forEach(function (s) {
    if (!fs.existsSync(ROOT + '/' + s.img)) bad('нет этапа стройки ' + s.img);
    hasAllLangs(s.caption, k + '.caption');
  });
  hasAllLangs(found.name, k + '.name');
  hasAllLangs(found.done, k + '.done');
});

// 5. Карты мира: точки ссылаются на реальные карты, фоны на месте
['exodus', 'world'].forEach(function (mk) {
  var m = B.maps[mk];
  if (!fs.existsSync(ROOT + '/' + m.bg)) bad('нет фона карты ' + m.bg);
  hasAllLangs(m.title, mk + '.title');
  m.points.forEach(function (p) {
    hasAllLangs(p.name, mk + '.' + p.id + '.name');
    hasAllLangs(p.blurb, mk + '.' + p.id + '.blurb');
    if (p.card) {
      var found = false;
      all.forEach(function (c) { if (c.id === p.card) found = true; });
      if (!found) bad(mk + '.' + p.id + ': card → нет ' + p.card);
    }
    if (p.x < 2 || p.x > 98 || p.y < 2 || p.y > 98) bad(mk + '.' + p.id + ': координаты вне поля');
  });
});

// 6. Книги тома: reader и cover на месте
B.books.forEach(function (bk) {
  if (!bk.ready) return;
  var reader = path.resolve(ROOT, bk.reader);
  var cover = path.resolve(ROOT, bk.cover);
  if (!fs.existsSync(reader)) bad('книга ' + bk.id + ': нет reader ' + bk.reader);
  if (!fs.existsSync(cover)) bad('книга ' + bk.id + ': нет cover');
  hasAllLangs(bk.title, 'book.' + bk.id + '.title');
});

// 7. Глоссарий и артефакты
B.glossary.forEach(function (g) {
  hasAllLangs(g.word, 'gloss.' + (g.word && g.word.ru));
  hasAllLangs(g.def, 'gloss.def.' + (g.word && g.word.ru));
  (g.refs || []).forEach(function (id) {
    var found = false;
    all.forEach(function (c) { if (c.id === id) found = true; });
    if (!found) bad('глоссарий → нет карты ' + id);
  });
});
B.artifacts.forEach(function (a) {
  hasAllLangs(a.name, 'artifact.' + (a.name && a.name.ru));
  var found = false;
  B.heroes.forEach(function (h) { if (h.id === a.hero) found = true; });
  if (!found) bad('артефакт → нет героя ' + a.hero);
});

// 8. Decoy-числа для digit-заданий: минимум 3 уникальных значения
var nums = {};
all.forEach(function (c) { if (c.digit) nums[String(c.digit.num)] = 1; });
if (Object.keys(nums).length < 3) bad('слишком мало уникальных digit.num');

// 9. Главная книга: 25 страниц аудио на 5 языках
['ru', 'en', 'de', 'es', 'fr'].forEach(function (lg) {
  for (var p = 1; p <= 25; p++) {
    var f = ROOT + '/assets/audio/' + lg + '/page-' + (p < 10 ? '0' + p : p) + '.mp3';
    if (!fs.existsSync(f)) bad('главная книга: нет аудио ' + lg + ' стр ' + p);
  }
});

console.log(problems.length ? 'ПРОБЛЕМ: ' + problems.length + '\n' + problems.join('\n') : 'Статический аудит: ЧИСТО');
