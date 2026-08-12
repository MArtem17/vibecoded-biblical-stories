const fs = require("fs");
const src = fs.readFileSync("core/engines/feed/feed.js", "utf8");
const noBlock = src.replace(/\/\*[\s\S]*?\*\//g, " ");
const noLine = noBlock.replace(/(^|[^:])\/\/.*$/gm, "$1");

// Find string literals and check preceding chars for lang key
const re = /(["'])((?:\\.|(?!\1).)*)\1/g;
const bare = new Map();
let m;
while ((m = re.exec(noLine))) {
  const s = m[2];
  if (!/[А-Яа-яЁё]/.test(s)) continue;
  const before = noLine.slice(Math.max(0, m.index - 12), m.index);
  // skip if this is a value of a language key: ru:"..." en:"..." etc.
  if (/\b(ru|en|de|es|pt|fr|ar)\s*:\s*$/.test(before)) continue;
  // skip path-like
  if (s.startsWith("../") || s.startsWith("img/")) continue;
  bare.set(s, (bare.get(s) || 0) + 1);
}
const list = [...bare.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ru"));
fs.writeFileSync("pipeline/feed_engine_ui_bare.json", JSON.stringify(list.map(([s, n]) => ({ s, n })), null, 2), "utf8");
console.log("bare count", list.length);
list.forEach(([s, n]) => console.log(n + "\t" + JSON.stringify(s)));
