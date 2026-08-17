// Аудит переполнения текстов живого постера (tile vs modal).
// Запуск: node pipeline/audit_poster_overflow.js
var fs = require('fs'), vm = require('vm'), path = require('path');

var ROOT = path.resolve(__dirname, '..');
var ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(ROOT + '/data/volume.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync(ROOT + '/data/poster_overlay.js', 'utf8'), ctx);

var B = ctx.window.BIBLE;
var OV = ctx.window.POSTER_OVERLAY;
var LANGS = B.languages;

// --- оценка ширины строки (px) ---
function isArabic(ch) {
  var c = ch.charCodeAt(0);
  return (c >= 0x0600 && c <= 0x06FF) || (c >= 0x0750 && c <= 0x077F) || (c >= 0x08A0 && c <= 0x08FF);
}
function charWidth(ch, fontPx, lang) {
  if (ch === ' ') return fontPx * 0.28;
  if (ch === '·') return fontPx * 0.35;
  if (isArabic(ch) || lang === 'ar') return fontPx * 0.72;
  if ('WMmw@'.indexOf(ch) >= 0) return fontPx * 0.85;
  if ('iljftr1'.indexOf(ch) >= 0) return fontPx * 0.38;
  return fontPx * 0.58;
}
function textWidth(str, fontPx, lang) {
  var w = 0;
  for (var i = 0; i < str.length; i++) w += charWidth(str[i], fontPx, lang);
  return w;
}
function linesNeeded(str, maxW, fontPx, lang) {
  if (!str) return 0;
  var words = str.split(/(\s+|·)/);
  var lines = 1, lineW = 0;
  for (var i = 0; i < words.length; i++) {
    var part = words[i];
    if (!part) continue;
    var pw = textWidth(part, fontPx, lang);
    if (lineW + pw > maxW && lineW > 0) { lines++; lineW = pw; }
    else lineW += pw;
  }
  return lines;
}

// --- геометрия блоков (из quest.css) ---
var TILE_W = 312;       // ~960/3 − gaps
var MODAL_W = 380;      // типичный телефон min(97vw, …)

var GEO = {
  tile: {
    title: { w: TILE_W - 8, font: 10.5, maxLines: 1, ellipsis: true, lineH: 11 },
    sub: { w: TILE_W - 8, font: 8, maxLines: 1, ellipsis: true, lineH: 9.2 },
    find: {
      w: TILE_W - 6 - 10 - 3 - 8, // padding, icon, gap — label вычитается отдельно
      font: 8, maxLines: 1, ellipsis: true, lineH: 9.2,
      labelFont: 7, icon: 10, padX: 8, gap: 3
    },
    fact: {
      colW: (TILE_W - 6) / 3,
      icon: 36, gap: 5, padX: 10, minH: 52, padY: 12,
      numFont: 11, numLineH: 11.5,
      labelFont: 7.5, labelLineH: 9
    }
  },
  modal: {
    title: { w: MODAL_W - 22, font: 18, maxLines: 3, ellipsis: false, lineH: 18.9 },
    sub: { w: MODAL_W - 22, font: 11.5, maxLines: 3, ellipsis: false, lineH: 13.8 },
    find: {
      w: MODAL_W - 18 - 18 - 6 - 20,
      font: 13, maxLines: 3, ellipsis: false, lineH: 16.25,
      labelFont: 11, icon: 18, padX: 20, gap: 6
    },
    fact: {
      colW: (MODAL_W - 18) / 3,
      icon: 64, gap: 8, padX: 20, minH: 88, padY: 28,
      numFont: 18, numLineH: 18.9,
      labelFont: 11, labelLineH: 13.75
    }
  }
};

function findLabelWidth(lang, mode) {
  var g = GEO[mode].find;
  var label = (B.ui.lFind[lang] || '').toUpperCase() + ':';
  return textWidth(label, g.labelFont, lang);
}

function availFindW(lang, mode) {
  var g = GEO[mode].find;
  return g.w - findLabelWidth(lang, mode);
}

function factTextW(mode) {
  var g = GEO[mode].fact;
  return g.colW - g.padX - g.icon - g.gap;
}

function analyzeField(text, lang, block, mode) {
  var g = block;
  var tw = textWidth(text, g.font, lang);
  var lines = linesNeeded(text, g.w, g.font, lang);
  var overflow = false;
  var reason = [];

  if (g.ellipsis && (lines > g.maxLines || tw > g.w * 1.02)) {
    overflow = true;
    reason.push('CSS ellipsis/nowrap');
  }
  if (!g.ellipsis && lines > g.maxLines) {
    overflow = true;
    reason.push('перенос > ' + g.maxLines + ' строк');
  }
  return { text: text, len: text.length, width: Math.round(tw), budget: Math.round(g.w), lines: lines, overflow: overflow, reason: reason };
}

function analyzeFact(numStr, labelStr, lang, mode) {
  var g = GEO[mode].fact;
  var tw = factTextW(mode);
  var numLines = linesNeeded(String(numStr), tw, g.numFont, lang);
  var labelLines = linesNeeded(labelStr, tw, g.labelFont, lang);
  var contentH = numLines * g.numLineH + labelLines * g.labelLineH;
  var innerH = g.minH - g.padY;
  var overflow = contentH > innerH + 1;
  return {
    num: numStr, label: labelStr,
    numLines: numLines, labelLines: labelLines,
    contentH: Math.round(contentH), budgetH: innerH,
    textW: Math.round(tw),
    overflow: overflow,
    reason: overflow ? ['min-height'] : []
  };
}

var cards = B.heroes.concat(B.plots).filter(function (c) { return OV[c.id]; });
var issues = { tile: { title: [], sub: [], find: [], fact: [] }, modal: { title: [], sub: [], find: [], fact: [] } };
var rankings = { find: {}, fact: {} };
LANGS.forEach(function (lg) {
  rankings.find[lg] = [];
  rankings.fact[lg] = [];
});

var ratioAlerts = [];

cards.forEach(function (c) {
  var ov = OV[c.id];
  var subField = c.id.indexOf('heroes') === 0 ? 'epithet' : 'source';

  LANGS.forEach(function (lg) {
    var name = c.name[lg];
    var sub = c[subField][lg];
    var find = ov.find[lg];

    ['tile', 'modal'].forEach(function (mode) {
      var t = analyzeField(name, lg, GEO[mode].title, mode);
      if (t.overflow) issues[mode].title.push({ id: c.id, lang: lg, field: 'name', ...t });

      var s = analyzeField(sub, lg, GEO[mode].sub, mode);
      if (s.overflow) issues[mode].sub.push({ id: c.id, lang: lg, field: subField, ...s });

      var fw = availFindW(lg, mode);
      var f = analyzeField(find, lg, Object.assign({}, GEO[mode].find, { w: fw }), mode);
      if (f.overflow) issues[mode].find.push({ id: c.id, lang: lg, ...f });

      for (var i = 0; i < ov.facts.length; i++) {
        var fd = ov.facts[i];
        var num = typeof fd.num === 'object' ? fd.num[lg] : fd.num;
        var lab = fd.label[lg];
        var fa = analyzeFact(num, lab, lg, mode);
        if (fa.overflow) {
          issues[mode].fact.push({ id: c.id, lang: lg, factIdx: i + 1, icon: fd.icon, ...fa });
        }
        rankings.fact[lg].push({ id: c.id, idx: i + 1, len: lab.length, label: lab, lines: fa.labelLines, mode: mode });
      }
      rankings.find[lg].push({ id: c.id, len: find.length, text: find, lines: f.lines, mode: mode });
    });

    // de/ar vs ru ratio on find + longest fact label (once per card)
    if (lg === 'ru') {
      var ruFind = ov.find.ru.length;
      ['de', 'ar'].forEach(function (lg2) {
        var ratio = ov.find[lg2].length / Math.max(ruFind, 1);
        if (ratio >= 1.45) {
          ratioAlerts.push({ id: c.id, lang: lg2, field: 'find', ru: ov.find.ru, other: ov.find[lg2], ratio: ratio.toFixed(2) });
        }
      });
      ov.facts.forEach(function (fd, fi) {
        var ruL = fd.label.ru.length;
        ['de', 'ar'].forEach(function (lg2) {
          var ratio = fd.label[lg2].length / Math.max(ruL, 1);
          if (ratio >= 1.5) {
            ratioAlerts.push({ id: c.id, lang: lg2, field: 'fact' + (fi + 1), ru: fd.label.ru, other: fd.label[lg2], ratio: ratio.toFixed(2) });
          }
        });
      });
    }
  });
});

// сортировки
LANGS.forEach(function (lg) {
  rankings.find[lg].sort(function (a, b) { return b.len - a.len; });
  rankings.fact[lg].sort(function (a, b) { return b.len - a.len; });
});

function countByLang(arr) {
  var m = {};
  arr.forEach(function (x) { m[x.lang] = (m[x.lang] || 0) + 1; });
  return m;
}
function uniqueIds(arr) {
  var s = {};
  arr.forEach(function (x) { s[x.id] = 1; });
  return Object.keys(s).sort();
}

function topN(arr, n) {
  return arr.slice(0, n).map(function (x) {
    return x.id + ' [' + x.lang + '] "' + (x.text || x.label || '').slice(0, 55) + (x.text && x.text.length > 55 || x.label && x.label.length > 55 ? '…' : '') + '"';
  });
}

var out = [];
out.push('=== АУДИТ ПЕРЕПОЛНЕНИЯ ЖИВОГО ПОСТЕРА ===');
out.push('Карт с оверлеем: ' + cards.length + ' | Языки: ' + LANGS.join(', '));
out.push('Оценка геометрии: TILE_W=' + TILE_W + 'px, MODAL_W=' + MODAL_W + 'px');
out.push('');

['tile', 'modal'].forEach(function (mode) {
  out.push('--- ' + mode.toUpperCase() + ' ---');
  ['title', 'sub', 'find', 'fact'].forEach(function (block) {
    var arr = issues[mode][block];
    out.push(block + ': ' + arr.length + ' проблем, ' + uniqueIds(arr).length + ' карт' +
      (arr.length ? ' | по языкам: ' + JSON.stringify(countByLang(arr)) : ''));
    if (arr.length) out.push('  карты: ' + uniqueIds(arr).join(', '));
    if (arr.length) {
      arr.sort(function (a, b) { return (b.lines - a.lines) || (b.len - a.len); });
      arr.slice(0, 12).forEach(function (x) {
        var sample = x.text || x.label;
        out.push('  ' + x.id + ' [' + x.lang + ']' + (x.factIdx ? ' fact#' + x.factIdx : '') +
          ' lines=' + (x.lines || x.labelLines) + ' len=' + (x.len || sample.length) +
          ' reason=' + (x.reason || []).join(',') + ' "' + sample + '"');
      });
      if (arr.length > 12) out.push('  … ещё ' + (arr.length - 12));
    }
  });
  out.push('');
});

out.push('--- TOP FIND (длина символов, tile) ---');
LANGS.forEach(function (lg) {
  var top = rankings.find[lg].filter(function (x) { return x.mode === 'tile'; })[0];
  if (top) out.push(lg + ': ' + top.id + ' (' + top.len + 'ch) "' + top.text + '"');
});
out.push('');
out.push('--- TOP FACT LABEL (длина, tile) ---');
LANGS.forEach(function (lg) {
  var top = rankings.fact[lg].filter(function (x) { return x.mode === 'tile'; })[0];
  if (top) out.push(lg + ': ' + top.id + ' #' + top.idx + ' (' + top.len + 'ch, ~' + top.lines + ' lines) "' + top.label + '"');
});
out.push('');
out.push('--- DE/AR заметно длиннее RU (find/fact) ---');
ratioAlerts.sort(function (a, b) { return parseFloat(b.ratio) - parseFloat(a.ratio); });
ratioAlerts.slice(0, 20).forEach(function (x) {
  out.push(x.id + ' ' + x.field + ' ' + x.lang + ' x' + x.ratio + ' | ru: "' + x.ru + '" | ' + x.lang + ': "' + x.other + '"');
});

var report = out.join('\n');
console.log(report);
fs.writeFileSync(ROOT + '/pipeline/audit_poster_overflow_report.txt', report, 'utf8');
console.log('\n[written pipeline/audit_poster_overflow_report.txt]');
