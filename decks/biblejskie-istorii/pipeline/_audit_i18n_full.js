/**
 * Final audit: user-facing texts must have full 7-lang coverage.
 * Ignores intentional RU-only: voice synonyms, WORDS_I18N.ru, speech warmup, normVoice.
 */
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
    const m = LANGS.filter((l) => l !== "ru" && (n[l] == null || n[l] === ""));
    if (m.length) bad.push(p + " missing " + m.join(","));
    return;
  }
  if (Array.isArray(n)) n.forEach((v, i) => walkRu(v, p + "." + ((v && v.id) || i), bad));
  else Object.keys(n).forEach((k) => walkRu(n[k], p + "." + k, bad));
}

const report = [];

// shell
const ui = fs.readFileSync("ui.i18n.js", "utf8");
const uiKeys = [...ui.matchAll(/^\s+(\w+):\s*\{([^}]+)\}/gm)];
let uiInc = 0;
uiKeys.forEach(([, , body]) => {
  const have = new Set([...body.matchAll(/\b(ru|en|de|es|pt|fr|ar)\s*:/g)].map((m) => m[1]));
  if (LANGS.some((l) => !have.has(l))) uiInc++;
});
report.push("shell ui.i18n: " + uiKeys.length + " keys, incomplete=" + uiInc);

// album
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync("data/volume.js", "utf8"), ctx);
const B = ctx.window.BIBLE;
let vBad = [];
(B.heroes || []).concat(B.plots || []).forEach((c) => {
  ["name", "epithet", "think", "story", "findIt", "wow"].forEach((f) => {
    if (c[f] && missObj(c[f]).length) vBad.push(c.id + "." + f);
  });
  if (c.facts && missObj(c.facts).length) vBad.push(c.id + ".facts");
  if (c.digit && c.digit.label && missObj(c.digit.label).length) vBad.push(c.id + ".digit");
});
Object.keys(B.ui || {}).forEach((k) => {
  if (missObj(B.ui[k]).length) vBad.push("ui." + k);
});
report.push("album volume: gaps=" + vBad.length);

// feed content
const fctx = { window: {} };
vm.createContext(fctx);
[
  "opening.js", "chapter2.js", "chapter3.js", "chapter4.js", "chapter5.js",
  "chapter6.js", "chapter7.js", "chapter8.js", "chapter9.js", "chapter_ugaday.js",
  "program.js", "graph.js"
].forEach((f) => vm.runInContext(fs.readFileSync("feed/" + f, "utf8"), fctx));
let fBad = [];
walkRu(fctx.window.FEED_OPENING, "opening", fBad);
(fctx.window.FEED_CHAPTERS || []).forEach((c) => walkRu(c, "ch" + c.chapter, fBad));
walkRu(fctx.window.FEED_PROGRAM, "program", fBad);
walkRu(fctx.window.FEED_GRAPH, "graph", fBad);
report.push("feed content: gaps=" + fBad.length);
if (fBad.length) fBad.slice(0, 10).forEach((x) => report.push("  " + x));

// books
let bookGaps = 0, books = 0;
fs.readdirSync("books").forEach((id) => {
  const p = "books/" + id + "/book.data.js";
  if (!fs.existsSync(p)) return;
  books++;
  const bctx = { window: {} };
  vm.createContext(bctx);
  vm.runInContext(fs.readFileSync(p, "utf8"), bctx);
  (bctx.window.BOOK.pages || []).forEach((pg) => {
    LANGS.forEach((l) => { if (!pg.text || !pg.text[l]) bookGaps++; });
  });
});
report.push("books: " + books + " books, page-text gaps=" + bookGaps);

// feed engine bare UI (strict)
const src = fs.readFileSync("core/engines/feed/feed.js", "utf8");
const noBlock = src.replace(/\/\*[\s\S]*?\*\//g, " ");
const noLine = noBlock.replace(/(^|[^:])\/\/.*$/gm, "$1");
const re = /(["'])((?:\\.|(?!\1).)*)\1/g;
const bare = new Map();
let m;
while ((m = re.exec(noLine))) {
  const s = m[2];
  if (!/[А-Яа-яЁё]/.test(s)) continue;
  const before = noLine.slice(Math.max(0, m.index - 16), m.index);
  if (/\b(ru|en|de|es|pt|fr|ar)\s*:\s*$/.test(before)) continue;
  // skip intentional RU-only voice bank / technical
  if (/^м$|^е$/.test(s)) continue;
  bare.set(s, (bare.get(s) || 0) + 1);
}

// classify remaining
const intentional = [];
const uiBare = [];
for (const [s, n] of bare) {
  const voiceLike = /^(да|нет|верно|неверно|правда|неправда|истина|ложь|так|не так)$/.test(s);
  const numWord = /^(Один|Два|Три|Четыре|Пять|Шесть|Семь|Восемь|Девять|Десять)!$/.test(s);
  const unit = /^(Год |День )$/.test(s);
  if (voiceLike || numWord || unit) intentional.push({ s, n });
  else uiBare.push({ s, n });
}
report.push("feed engine bare UI leftovers: " + uiBare.length);
uiBare.forEach((x) => report.push("  UI: " + JSON.stringify(x.s) + " ×" + x.n));
report.push("feed engine intentional RU-only (voice/numbers/units): " + intentional.length);

console.log(report.join("\n"));
const ok = uiInc === 0 && vBad.length === 0 && fBad.length === 0 && bookGaps === 0 && uiBare.length === 0;
console.log(ok ? "\nOK: all user-facing texts covered for ru/en/de/es/pt/fr/ar" : "\nFAIL: gaps remain");
process.exit(ok ? 0 : 1);
