/* Мост колоды: jigsaw из book.data.js → games/jigsaw-sandbox.js, без правок core. */
(function () {
  "use strict";
  function T(v) {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (window.BibleI18n) return BibleI18n.L(v);
    var lang = "ru";
    try { lang = localStorage.getItem("bibi_lang") || "ru"; } catch (e) {}
    return v[lang] || v.ru || v.en || "";
  }
  function matchSb(btn) {
    var label = ((btn.querySelector(".gm-name") || btn).textContent || "").replace(/\s+/g, " ").trim();
    var pages = (window.BOOK && window.BOOK.pages) || [];
    var i, p, sb, chip, list;
    for (i = 0; i < pages.length; i++) {
      p = pages[i];
      list = (p.sandboxes || []).concat(p.sandbox && typeof p.sandbox === "object" ? [p.sandbox] : []);
      for (var j = 0; j < list.length; j++) {
        sb = list[j];
        if (!sb || sb.type !== "jigsaw") continue;
        chip = T(sb.chip || sb.title || "");
        if (chip && label.indexOf(chip) !== -1) return sb;
      }
    }
    if (/пазл|puzzle|أحجية/.test(label.toLowerCase())) return { type: "jigsaw" };
    return null;
  }
  document.addEventListener("click", function (e) {
    var btn = e.target && e.target.closest && e.target.closest(".chip.sandbox, .gm-row, .gm-tile");
    if (!btn) return;
    var sb = matchSb(btn);
    if (!sb || !window.BibleJigsawOpen) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    window.BibleJigsawOpen({ T: T }, sb);
  }, true);
})();
