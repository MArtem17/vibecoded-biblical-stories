/* Экспорт window.BIBLE из data/volume.js в JSON (для конвейера переводов).
   node pipeline/export_json.js  →  pipeline/volume.master.json */
var fs = require("fs"), path = require("path"), vm = require("vm");
var ROOT = path.resolve(__dirname, "..");
var src = fs.readFileSync(path.join(ROOT, "data/volume.js"), "utf8");
var sandbox = { window: {} };
vm.runInNewContext(src, sandbox);
fs.writeFileSync(path.join(__dirname, "volume.master.json"),
  JSON.stringify(sandbox.window.BIBLE, null, 1));
console.log("exported pipeline/volume.master.json");
