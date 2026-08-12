const fs = require("fs");
const src = fs.readFileSync("core/engines/feed/feed.js", "utf8");
// strip comments roughly
const noBlock = src.replace(/\/\*[\s\S]*?\*\//g, " ");
const noLine = noBlock.replace(/(^|[^:])\/\/.*$/gm, "$1");
const re = /(["'])((?:\\.|(?!\1).)*)\1/g;
const uniq = new Map();
let m;
while ((m = re.exec(noLine))) {
  const s = m[2].replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\'/g, "'");
  if (!/[А-Яа-яЁё]/.test(s)) continue;
  if (s.includes("ru:")) continue;
  if (s.startsWith("../")) continue;
  uniq.set(s, (uniq.get(s) || 0) + 1);
}
const list = [...uniq.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ru"));
fs.writeFileSync("pipeline/feed_engine_ui_ru.json", JSON.stringify(list.map(([s, n]) => ({ s, n })), null, 2), "utf8");
console.log("count", list.length);
list.forEach(([s, n]) => console.log(n + "\t" + s.replace(/\n/g, "\\n")));
