const fs = require("fs");
const path = require("path");
const files = [
  "opening.js",
  "chapter2.js",
  "chapter3.js",
  "chapter4.js",
  "chapter5.js",
  "chapter6.js",
  "chapter7.js",
  "chapter8.js",
  "chapter9.js",
  "chapter_ugaday.js",
];
let all = [];
for (const f of files) {
  const p = path.join("feed", f);
  if (!fs.existsSync(p)) continue;
  const src = fs.readFileSync(p, "utf8");
  const idRe = /\{\s*id\s*:\s*"([^"]+)"/g;
  let m;
  const idxs = [];
  while ((m = idRe.exec(src))) idxs.push({ id: m[1], index: m.index });
  for (let i = 0; i < idxs.length; i++) {
    const start = idxs[i].index;
    const end = i + 1 < idxs.length ? idxs[i + 1].index : src.length;
    const chunk = src.slice(start, Math.min(end, start + 1400));
    const img = (chunk.match(/img\s*:\s*"([^"]+)"/) || [])[1] || null;
    const title = (chunk.match(/title\s*:\s*"([^"]+)"/) || [])[1] || "";
    const kind = (chunk.match(/kind\s*:\s*"([^"]+)"/) || [])[1] || "";
    const concept = (chunk.match(/concept\s*:\s*"([^"]+)"/) || [])[1] || "";
    const text = (chunk.match(/text\s*:\s*"([^"]+)"/) || [])[1] || "";
    const statement = (chunk.match(/statement\s*:\s*"([^"]+)"/) || [])[1] || "";
    all.push({
      n: all.length + 1,
      id: idxs[i].id,
      img,
      title,
      kind,
      concept,
      text,
      statement,
      file: f,
    });
  }
}
console.log("Total cards:", all.length);
const byFile = {};
all.forEach((c) => {
  (byFile[c.file] = byFile[c.file] || []).push(c.n);
});
Object.keys(byFile).forEach((f) => {
  const nums = byFile[f];
  console.log(f + ": " + nums[0] + "-" + nums[nums.length - 1] + " (" + nums.length + ")");
});
const from = 201,
  to = 220;
console.log("\n=== Cards " + from + "-" + to + " ===");
const need = [];
const keep = [];
for (let i = from - 1; i < to && i < all.length; i++) {
  const c = all[i];
  const earlier = all
    .slice(0, i)
    .filter((x) => x.img && c.img && x.img === c.img);
  let status;
  if (!c.img) status = "NO_IMG";
  else if (earlier.length)
    status = "DUP of #" + earlier.map((e) => e.n + ":" + e.id).join(",");
  else status = "KEEP";
  const row = {
    n: i + 1,
    id: c.id,
    kind: c.kind,
    title: c.title,
    concept: c.concept,
    img: c.img,
    status,
    file: c.file,
    theme: c.text || c.statement || c.title,
  };
  console.log(JSON.stringify(row));
  if (status === "KEEP") keep.push(row);
  else need.push(row);
}
console.log("\nKEEP:", keep.length, keep.map((x) => x.n + ":" + x.id).join(", "));
console.log("NEED:", need.length, need.map((x) => x.n + ":" + x.id).join(", "));

// verify first appearance of shared assets
const shared = [
  "../img/plots_18_fish.webp",
  "../img/heroes_14_elijah.webp",
  "../img/heroes_15_daniel.webp",
  "../img/plots_19_esther.webp",
  "../img/heroes_17_jonah.webp",
  "../img/plots_17_lions.webp",
  "../img/heroes_18_mary.webp",
  "../img/heroes_19_joseph_carpenter.webp",
  "../img/plots_20_nativity.webp",
  "../img/heroes_20_magi.webp",
];
console.log("\n=== First use of shared assets ===");
shared.forEach((img) => {
  const hits = all.filter((c) => c.img === img);
  console.log(
    img,
    "->",
    hits.slice(0, 5).map((h) => "#" + h.n + ":" + h.id).join(", "),
    hits.length > 5 ? "..." : "",
    "(" + hits.length + ")"
  );
});
