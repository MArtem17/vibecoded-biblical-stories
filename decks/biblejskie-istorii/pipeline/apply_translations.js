/* Слияние переводов в data/volume.js.

   Берёт data/volume.js (источник правды), накатывает pipeline/translations/<lang>.json
   (плоские карты «путь → значение», пути — как в translate_cards.py: сегменты по id
   элементов массивов) и переписывает data/volume.js заново: шапка-комментарий +
   window.BIBLE = <JSON>. Развёрнутые комментарии секций живут в README колоды.

   node pipeline/apply_translations.js */
var fs = require("fs"), path = require("path"), vm = require("vm");
var ROOT = path.resolve(__dirname, "..");
var LANGS = ["en", "de", "es", "pt", "fr", "ar"];

var src = fs.readFileSync(path.join(ROOT, "data/volume.js"), "utf8");
var sandbox = { window: {} };
vm.runInNewContext(src, sandbox);
var B = sandbox.window.BIBLE;

/* Найти узел по пути: сегмент — ключ объекта либо id элемента массива либо индекс. */
function resolve(obj, segs) {
  var cur = obj;
  for (var i = 0; i < segs.length; i++) {
    var s = segs[i];
    if (Array.isArray(cur)) {
      var found = null, j;
      for (j = 0; j < cur.length; j++) {
        if (cur[j] && cur[j].id != null && String(cur[j].id) === s) { found = cur[j]; break; }
      }
      if (found === null) for (j = 0; j < cur.length; j++) {
        if (String(j) === s) { found = cur[j]; break; }
      }
      cur = found;
    } else if (cur && typeof cur === "object") {
      cur = cur[s];
    } else return null;
    if (cur == null) return null;
  }
  return cur;
}

var total = 0;
LANGS.forEach(function (lang) {
  var fp = path.join(__dirname, "translations", lang + ".json");
  if (!fs.existsSync(fp)) { console.log("нет " + lang + ".json — пропуск"); return; }
  var map = JSON.parse(fs.readFileSync(fp, "utf8"));
  var n = 0;
  Object.keys(map).forEach(function (p) {
    var node = resolve(B, p.split("."));
    if (node && typeof node === "object" && "ru" in node) { node[lang] = map[p]; n++; }
    else console.log("  !" + lang + " путь не найден: " + p);
  });
  console.log(lang + ": слито " + n);
  total += n;
});

var header =
  "/* Библейские истории (BST) — единый источник контента тома.\n" +
  "   Мультиязычные поля {ru,en,de,es,pt,fr,ar}; ru — мастер. Файл ПЕРЕГЕНЕРИРУЕТСЯ\n" +
  "   конвейером pipeline/apply_translations.js — руками правь ru-тексты и флаги,\n" +
  "   переводы гони через pipeline/translate_cards.py (см. README колоды).\n" +
  "   Схема — handoff §11, развёрнутая в JS: офлайн-приложение работает без fetch. */\n";
fs.writeFileSync(path.join(ROOT, "data/volume.js"),
  header + "window.BIBLE = " + JSON.stringify(B, null, 1) + ";\n");
console.log("data/volume.js переписан (" + total + " переводов).");
