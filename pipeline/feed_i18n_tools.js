#!/usr/bin/env node
/**
 * Инструменты i18n для ленты:
 *   node pipeline/feed_i18n_tools.js migrate   — строковые поля → {ru:"…"}
 *   node pipeline/feed_i18n_tools.js extract   — выгрузка юнитов в pipeline/feed_i18n_master.json
 *   node pipeline/feed_i18n_tools.js apply     — слить pipeline/feed_i18n/<lang>.json обратно в {ru,…}
 *   node pipeline/feed_i18n_tools.js stats
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FEED_DIR = path.join(ROOT, "feed");
const FILES = [
  "opening.js", "chapter2.js", "chapter3.js", "chapter4.js", "chapter5.js",
  "chapter6.js", "chapter7.js", "chapter8.js", "chapter9.js", "chapter_ugaday.js",
  "program.js", "graph.js"
];
const OUT_MASTER = path.join(ROOT, "pipeline", "feed_i18n_master.json");
const OUT_DIR = path.join(ROOT, "pipeline", "feed_i18n");
const LANGS = ["en", "de", "es", "pt", "fr", "ar"];

/** Ключи, значения которых — пользовательский текст (строка или массив строк). */
const TEXT_KEYS = new Set([
  "title", "text", "ask", "askFail", "done", "statement", "explain",
  "kicker", "answer", "fact", "intro", "cta", "sysName", "teaser", "hidden",
  "bonus", "name", "labA", "labB", "veil", "mapNoun", "newNodeLabel",
  "unitGen", "centerLabel", "next", "nextAria", "colorsRetry", "colorsCnt",
  "label", "labelEn"
]);
/** Ключи-массивы строк */
const TEXT_ARRAY_KEYS = new Set(["lines"]);
/** Вложенные объекты с текстовым полем t / name */
const NESTED_ITEM_KEYS = new Set(["items", "options", "good", "bad", "colors", "days", "steps", "spots", "ranks", "organs", "systems", "map"]);

function isPlainStringLiteral(src, from, to) {
  // already an object starting with { ?
  const slice = src.slice(from, to).trim();
  return slice.startsWith('"') || slice.startsWith("'") || slice.startsWith("`");
}

/** Найти значение после key: — строка в кавычках (с экранированием) или уже {…}. */
function readValue(src, i) {
  while (i < src.length && /\s/.test(src[i])) i++;
  if (src[i] === "{") {
    let depth = 0, j = i;
    for (; j < src.length; j++) {
      const c = src[j];
      if (c === "{") depth++;
      else if (c === "}") { depth--; if (depth === 0) { j++; break; } }
      else if (c === '"' || c === "'") {
        const q = c; j++;
        while (j < src.length) {
          if (src[j] === "\\") { j += 2; continue; }
          if (src[j] === q) break;
          j++;
        }
      }
    }
    return { start: i, end: j, kind: "object", raw: src.slice(i, j) };
  }
  if (src[i] === "[") {
    let depth = 0, j = i;
    for (; j < src.length; j++) {
      const c = src[j];
      if (c === "[") depth++;
      else if (c === "]") { depth--; if (depth === 0) { j++; break; } }
      else if (c === '"' || c === "'") {
        const q = c; j++;
        while (j < src.length) {
          if (src[j] === "\\") { j += 2; continue; }
          if (src[j] === q) break;
          j++;
        }
      }
    }
    return { start: i, end: j, kind: "array", raw: src.slice(i, j) };
  }
  if (src[i] === '"' || src[i] === "'") {
    const q = src[i];
    let j = i + 1;
    while (j < src.length) {
      if (src[j] === "\\") { j += 2; continue; }
      if (src[j] === q) { j++; break; }
      j++;
    }
    return { start: i, end: j, kind: "string", raw: src.slice(i, j) };
  }
  return null;
}

function unquote(raw) {
  try { return JSON.parse(raw.replace(/^'/, '"').replace(/'$/, '"').replace(/\\'/g, "'")); }
  catch (e) {
    // fallback for JS single-quoted
    if ((raw[0] === '"' || raw[0] === "'") && raw[raw.length - 1] === raw[0]) {
      return raw.slice(1, -1).replace(/\\([\\'"nrt])/g, (_, c) => ({ "\\": "\\", "'": "'", '"': '"', n: "\n", r: "\r", t: "\t" }[c] || c));
    }
    return null;
  }
}

function quote(s) {
  return JSON.stringify(s);
}

function migrateFile(filePath) {
  let src = fs.readFileSync(filePath, "utf8");
  // Walk all TEXT_KEYS occurrences: key:"string" → key:{ru:"string"}
  // Avoid keys that already have {ru:
  const keyAlt = [...new Set([...TEXT_KEYS, ...TEXT_ARRAY_KEYS])].join("|");
  const re = new RegExp("\\b(" + keyAlt + ")\\s*:", "g");
  let out = "";
  let last = 0;
  let m;
  let converted = 0;
  while ((m = re.exec(src))) {
    const key = m[1];
    const val = readValue(src, m.index + m[0].length);
    if (!val) continue;
    if (val.kind === "string") {
      const str = unquote(val.raw);
      if (str == null) continue;
      // skip empty / non-text-looking? keep all
      out += src.slice(last, m.index);
      out += key + ":{ru:" + quote(str) + "}";
      last = val.end;
      converted++;
      re.lastIndex = val.end;
    } else if (val.kind === "array" && TEXT_ARRAY_KEYS.has(key)) {
      // lines:["a","b"] → lines:[{ru:"a"},{ru:"b"}]
      const inner = val.raw.slice(1, -1);
      // parse string elements only
      const parts = [];
      let i = 0, ok = true;
      while (i < inner.length) {
        while (i < inner.length && /[\s,]/.test(inner[i])) i++;
        if (i >= inner.length) break;
        const v = readValue(inner, i);
        if (!v || v.kind !== "string") { ok = false; break; }
        const s = unquote(v.raw);
        if (s == null) { ok = false; break; }
        parts.push("{ru:" + quote(s) + "}");
        i = v.end;
      }
      if (ok && parts.length) {
        out += src.slice(last, m.index);
        out += key + ":[" + parts.join(",") + "]";
        last = val.end;
        converted += parts.length;
        re.lastIndex = val.end;
      }
    }
  }
  out += src.slice(last);

  // Nested t:/name: inside items/options/spots etc. — second pass for bare t:"…" and name:"…"
  // that are still plain strings (name on chapter meta already handled if in TEXT_KEYS)
  src = out;
  out = "";
  last = 0;
  const re2 = /\b(t|name)\s*:/g;
  while ((m = re2.exec(src))) {
    const key = m[1];
    const val = readValue(src, m.index + m[0].length);
    if (!val || val.kind !== "string") continue;
    // skip if looks like a URL or file path
    const str = unquote(val.raw);
    if (str == null) continue;
    if (/\.(webp|png|jpg|svg|mp3)(\?|$)/i.test(str) || str.startsWith("../") || str.startsWith("img/")) continue;
    // skip pure emoji / short non-cyrillic icon names? keep if has letters
    if (!/[A-Za-zА-Яа-яЁё]/.test(str)) continue;
    out += src.slice(last, m.index);
    out += key + ":{ru:" + quote(str) + "}";
    last = val.end;
    converted++;
    re2.lastIndex = val.end;
  }
  out += src.slice(last);
  fs.writeFileSync(filePath, out, "utf8");
  return converted;
}

/** Загрузить главы через vm и собрать юниты с ru. */
function loadFeed() {
  const vm = require("vm");
  const ctx = { window: {}, console };
  vm.createContext(ctx);
  for (const f of FILES) {
    const p = path.join(FEED_DIR, f);
    if (!fs.existsSync(p)) continue;
    vm.runInContext(fs.readFileSync(p, "utf8"), ctx, { filename: f });
  }
  return ctx.window;
}

function collectUnits(node, pathStr, out) {
  if (node && typeof node === "object" && !Array.isArray(node) && typeof node.ru === "string") {
    out.push({ path: pathStr, ru: node.ru, missing: LANGS.filter((l) => !node[l]) });
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => {
      const key = v && v.id != null ? String(v.id) : String(i);
      collectUnits(v, pathStr ? pathStr + "." + key : key, out);
    });
    return;
  }
  if (node && typeof node === "object") {
    Object.keys(node).forEach((k) => {
      collectUnits(node[k], pathStr ? pathStr + "." + k : k, out);
    });
  }
}

function extract() {
  const w = loadFeed();
  const units = [];
  if (w.FEED_OPENING) collectUnits(w.FEED_OPENING, "opening", units);
  (w.FEED_CHAPTERS || []).forEach((ch, i) => collectUnits(ch, "chapter" + (ch.chapter || i + 2), units));
  if (w.FEED_PROGRAM) collectUnits(w.FEED_PROGRAM, "program", units);
  if (w.FEED_GRAPH) collectUnits(w.FEED_GRAPH, "graph", units);
  // dedupe by path
  const map = {};
  units.forEach((u) => { map[u.path] = u; });
  const list = Object.keys(map).sort().map((k) => map[k]);
  fs.writeFileSync(OUT_MASTER, JSON.stringify({ langs: LANGS, units: list }, null, 2), "utf8");
  console.log("Extracted", list.length, "units →", OUT_MASTER);
  const need = list.filter((u) => u.missing && u.missing.length).length;
  console.log("Units missing some langs:", need);
}

function applyLangFiles() {
  if (!fs.existsSync(OUT_DIR)) {
    console.error("No", OUT_DIR);
    process.exit(1);
  }
  const master = JSON.parse(fs.readFileSync(OUT_MASTER, "utf8"));
  const byRu = {};
  master.units.forEach((u) => {
    byRu[u.ru] = byRu[u.ru] || {};
  });

  // Support:
  // 1) pipeline/feed_i18n/<lang>.json → { path: "tr" } or { "RU text": "tr" }
  // 2) pipeline/feed_i18n/by_ru.json → { "RU text": { en, de, ... } }
  // 3) pipeline/feed_i18n/part*.json → same as by_ru fragments
  const byRuFile = path.join(OUT_DIR, "by_ru.json");
  if (fs.existsSync(byRuFile)) {
    const data = JSON.parse(fs.readFileSync(byRuFile, "utf8"));
    Object.keys(data).forEach((ru) => {
      byRu[ru] = Object.assign(byRu[ru] || {}, data[ru]);
    });
    console.log("loaded by_ru.json", Object.keys(data).length);
  }
  fs.readdirSync(OUT_DIR).filter((f) => /^by_ru_part\d+\.json$/.test(f)).forEach((f) => {
    const data = JSON.parse(fs.readFileSync(path.join(OUT_DIR, f), "utf8"));
    Object.keys(data).forEach((ru) => {
      byRu[ru] = Object.assign(byRu[ru] || {}, data[ru]);
    });
    console.log("loaded", f, Object.keys(data).length);
  });

  LANGS.forEach((lang) => {
    const fp = path.join(OUT_DIR, lang + ".json");
    if (!fs.existsSync(fp)) return;
    const data = JSON.parse(fs.readFileSync(fp, "utf8"));
    const map = data.items
      ? Object.fromEntries(data.items.map((it) => [it.id, it.value]))
      : data;
    let viaPath = 0, viaRu = 0;
    Object.keys(map).forEach((k) => {
      const unit = master.units.find((u) => u.path === k);
      if (unit) {
        byRu[unit.ru] = byRu[unit.ru] || {};
        byRu[unit.ru][lang] = map[k];
        viaPath++;
      } else if (byRu[k]) {
        byRu[k][lang] = map[k];
        viaRu++;
      }
    });
    console.log(lang, "path", viaPath, "byRu", viaRu);
  });

  FILES.forEach((f) => {
    const fp = path.join(FEED_DIR, f);
    if (!fs.existsSync(fp)) return;
    let src = fs.readFileSync(fp, "utf8");
    const re = /\{ru:("(?:\\.|[^"\\])*")((?:,\s*(?:en|de|es|pt|fr|ar):"(?:\\.|[^"\\])*")*)\}/g;
    let n = 0;
    src = src.replace(re, (full, ruLit, rest) => {
      let ru;
      try { ru = JSON.parse(ruLit); } catch (e) { return full; }
      const pack = byRu[ru];
      if (!pack) return full;
      const existing = {};
      const re2 = /(en|de|es|pt|fr|ar):("(?:\\.|[^"\\])*")/g;
      let m;
      while ((m = re2.exec(rest || ""))) existing[m[1]] = JSON.parse(m[2]);
      let out = "{ru:" + ruLit;
      LANGS.forEach((lang) => {
        const val = pack[lang] != null ? pack[lang] : existing[lang];
        if (val != null && val !== "") {
          out += "," + lang + ":" + JSON.stringify(val);
          n++;
        }
      });
      out += "}";
      return out;
    });
    fs.writeFileSync(fp, src, "utf8");
    console.log("apply", f, "lang-fields≈", n);
  });
}

function stats() {
  if (!fs.existsSync(OUT_MASTER)) extract();
  const master = JSON.parse(fs.readFileSync(OUT_MASTER, "utf8"));
  console.log("units", master.units.length);
  LANGS.forEach((lang) => {
    const fp = path.join(OUT_DIR, lang + ".json");
    const n = fs.existsSync(fp) ? Object.keys(JSON.parse(fs.readFileSync(fp, "utf8"))).length : 0;
    console.log(lang, n);
  });
}

const cmd = process.argv[2];
if (cmd === "migrate") {
  let total = 0;
  FILES.forEach((f) => {
    const fp = path.join(FEED_DIR, f);
    if (!fs.existsSync(fp)) return;
    const n = migrateFile(fp);
    console.log(f, "converted", n);
    total += n;
  });
  console.log("total", total);
} else if (cmd === "extract") extract();
else if (cmd === "apply") applyLangFiles();
else if (cmd === "stats") stats();
else {
  console.log("Usage: migrate | extract | apply | stats");
  process.exit(1);
}
