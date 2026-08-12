const fs = require("fs");
const vm = require("vm");
const LANGS = ["ru", "en", "de", "es", "pt", "fr", "ar"];

function missObj(o) {
  if (!o || typeof o !== "object" || Array.isArray(o)) return LANGS.slice();
  return LANGS.filter((l) => o[l] == null || o[l] === "");
}
function walkRu(n, p, bad) {
  if (!n || typeof n !== "object") return;
  if (typeof n.ru === "string") {
    const m = LANGS.filter((l) => l !== "ru" && !n[l]);
    if (m.length) bad.push(p + ":" + m.join(","));
    return;
  }
  if (Array.isArray(n)) n.forEach((v, i) => walkRu(v, p + "." + ((v && v.id) || i), bad));
  else Object.keys(n).forEach((k) => walkRu(n[k], p + "." + k, bad));
}

const ui = fs.readFileSync("ui.i18n.js", "utf8");
const uiKeys = [...ui.matchAll(/^\s+(\w+):\s*\{([^}]+)\}/gm)];
let uiInc = 0;
uiKeys.forEach(([, , body]) => {
  const have = new Set([...body.matchAll(/\b(ru|en|de|es|pt|fr|ar)\s*:/g)].map((m) => m[1]));
  if (LANGS.some((l) => !have.has(l))) uiInc++;
});
console.log("shell ui.i18n: keys=" + uiKeys.length + " incomplete=" + uiInc);

const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync("data/volume.js", "utf8"), ctx);
const B = ctx.window.BIBLE;
let vBad = [];
(B.heroes || []).concat(B.plots || []).forEach((c) => {
  ["name", "epithet", "think", "story", "findIt", "wow"].forEach((f) => {
    if (c[f]) {
      const m = missObj(c[f]);
      if (m.length) vBad.push(c.id + "." + f);
    }
  });
  if (c.facts && missObj(c.facts).length) vBad.push(c.id + ".facts");
  if (c.digit && c.digit.label && missObj(c.digit.label).length) vBad.push(c.id + ".digit");
});
Object.keys(B.ui || {}).forEach((k) => {
  if (missObj(B.ui[k]).length) vBad.push("ui." + k);
});
console.log("album volume texts: gaps=" + vBad.length + "; audioLangs=" + (B.audioLangs || []).join(","));

const fctx = { window: {} };
vm.createContext(fctx);
[
  "opening.js", "chapter2.js", "chapter3.js", "chapter4.js", "chapter5.js",
  "chapter6.js", "chapter7.js", "chapter8.js", "chapter9.js", "chapter_ugaday.js",
  "program.js", "graph.js"
].forEach((f) => vm.runInContext(fs.readFileSync("feed/" + f, "utf8"), fctx));
let fBad = [];
walkRu(fctx.window.FEED_OPENING, "o", fBad);
(fctx.window.FEED_CHAPTERS || []).forEach((c) => walkRu(c, "c" + c.chapter, fBad));
walkRu(fctx.window.FEED_PROGRAM, "p", fBad);
walkRu(fctx.window.FEED_GRAPH, "g", fBad);
console.log("feed content: gaps=" + fBad.length);

const feedjs = fs.readFileSync("core/engines/feed/feed.js", "utf8");
const re = /(["'`])((?:\\.|(?!\1).)*[А-Яа-яЁё](?:\\.|(?!\1).)*)\1/g;
const uniq = new Set();
let m;
while ((m = re.exec(feedjs))) {
  const s = m[2];
  if (s.includes("ru:")) continue;
  if (s.length > 120) continue;
  uniq.add(s);
}
console.log("feed.js engine leftover Cyrillic literals ≈ " + uniq.size);
[...uniq].slice(0, 15).forEach((s) => console.log("  - " + s));

let bookGaps = 0, books = 0;
fs.readdirSync("books").forEach((id) => {
  const p = "books/" + id + "/book.data.js";
  if (!fs.existsSync(p)) return;
  books++;
  const bctx = { window: {} };
  vm.createContext(bctx);
  vm.runInContext(fs.readFileSync(p, "utf8"), bctx);
  const BK = bctx.window.BOOK;
  (BK.pages || []).forEach((pg) => {
    LANGS.forEach((l) => {
      if (!pg.text || !pg.text[l]) bookGaps++;
    });
  });
});
console.log("books: count=" + books + " page-text gaps=" + bookGaps);
