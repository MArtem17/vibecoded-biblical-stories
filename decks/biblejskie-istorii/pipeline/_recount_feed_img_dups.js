const fs = require("fs");
const order = [
  "feed/opening.js", "feed/chapter2.js", "feed/chapter3.js", "feed/chapter4.js",
  "feed/chapter5.js", "feed/chapter6.js", "feed/chapter7.js", "feed/chapter_ugaday.js",
  "feed/chapter8.js", "feed/chapter9.js"
];
const cards = [];
for (const f of order) {
  const text = fs.readFileSync(f, "utf8");
  const re = /\bimg\s*:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(text))) {
    const pos = m.index;
    const before = text.slice(Math.max(0, pos - 800), pos);
    const ids = [...before.matchAll(/\bid\s*:\s*"([^"]+)"/g)];
    if (!ids.length) continue;
    cards.push({ id: ids[ids.length - 1][1], file: f.replace("feed/", ""), img: m[1] });
  }
}
const used = new Map();
const repeats = [];
cards.forEach((c) => {
  if (!used.has(c.img)) {
    used.set(c.img, c.id);
    return;
  }
  repeats.push({ ...c, first: used.get(c.img) });
});
console.log("cards", cards.length, "unique paths", used.size, "repeats", repeats.length);
console.log("NEXT10:");
repeats.slice(0, 10).forEach((c, i) => {
  console.log((i + 1) + ". " + c.id + " — " + c.img.replace("../img/", "") + " (file " + c.file + ", first " + c.first + ")");
});
