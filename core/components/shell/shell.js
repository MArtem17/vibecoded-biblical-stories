/* core/components/shell — общая оболочка колод-энциклопедий (ES5, без сборки).
 *
 * Что это. Раскладка, отлаженная на «Кругосветке» (decks/strany-mira) и
 * повторённая копией в «Мировом искусстве»: нижняя навигация из четырёх
 * режимов, звёзды за верные ответы с прилётом к счётчику, звания и
 * родительский раздел за воротами-примером.
 *
 * Зачем в core. Копий было две и они уже расходились; правило платформы —
 * «логика живёт только в core/, колода несёт контент» (CLAUDE.md §2). Третья
 * копия в «Словаре на сценах» окончательно развела бы родительский отчёт по
 * трём разным реализациям. «Кругосветку» и «Искусство» переносим отдельной
 * задачей: они продолжают работать на своих копиях, пока их не тронули.
 *
 * Про конкретную колоду оболочка НЕ знает: что показывать в статистике,
 * сколько звёзд за действие и какие вкладки — приходит из cfg.
 *
 * ЗВЁЗДЫ СЧИТАЮТСЯ ПО КЛЮЧУ КОЛОДЫ, а ключ колода вправе сделать разным для
 * разных языков. Во «Словаре на сценах» шесть языков изучения на одном
 * контенте, и общий счётчик врал бы: выученное kitchen не делает выученным
 * die Küche. Поэтому starKey — параметр, а не константа.
 */
(function (global) {
"use strict";

var CFG = null, nav = null, badge = null;

function $(id) { return document.getElementById(id); }
function el(tag, cls, txt) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt != null) e.textContent = txt;
  return e;
}
function num(key) { try { return +localStorage.getItem(key) || 0; } catch (e) { return 0; } }
function setNum(key, v) { try { localStorage.setItem(key, String(v)); } catch (e) {} }

/* ---------- звёзды ---------- */
function stars() { return CFG ? num(CFG.starKey) : 0; }
function paint() {
  var n = stars(), r = rankOf(n);
  if (badge) badge.textContent = '★ ' + n;
  if (CFG && CFG.onStars) CFG.onStars(n, r);
}
/* Прилёт звезды от места нажатия к счётчику. Не украшение: это единственное
   место, где ребёнку видно, что ответ засчитан, — счётчик в углу сам по себе
   меняется незаметно. */
function fly(srcEl) {
  if (!srcEl || !badge || !srcEl.getBoundingClientRect) return;
  var s = srcEl.getBoundingClientRect(), d = badge.getBoundingClientRect();
  if (!s.width || !d.width) return;
  var st = el('div', 'shell-flystar', '★');
  st.style.left = (s.left + s.width / 2) + 'px';
  st.style.top = (s.top + s.height / 2) + 'px';
  document.body.appendChild(st);
  requestAnimationFrame(function () { requestAnimationFrame(function () {
    st.style.left = (d.left + d.width / 2) + 'px';
    st.style.top = (d.top + d.height / 2) + 'px';
    st.style.transform = 'translate(-50%,-50%) scale(.4)';
    st.style.opacity = '.3';
  }); });
  setTimeout(function () {
    if (st.parentNode) st.parentNode.removeChild(st);
    if (badge) { badge.classList.remove('pop'); void badge.offsetWidth; badge.classList.add('pop'); }
  }, 620);
}
function earn(n, srcEl) {
  if (!CFG) return 0;
  n = Math.max(1, n | 0);
  var v = stars() + n;
  setNum(CFG.starKey, v);
  fly(srcEl);
  paint();
  return v;
}

/* ---------- звания ----------
   Порог — накопленные звёзды. Список задаёт колода: у словаря это путь
   «слушатель → читатель → собеседник → …», у энциклопедии он будет свой. */
function rankOf(n) {
  var R = (CFG && CFG.ranks) || [], i, cur = null, next = null;
  if (n == null) n = stars();
  for (i = 0; i < R.length; i++) {
    if (n >= R[i].at) cur = R[i]; else { next = R[i]; break; }
  }
  return { name: cur ? cur.name : (R[0] ? R[0].name : ''),
    next: next ? next.name : null,
    need: next ? next.at - n : 0 };
}

/* ---------- нижняя навигация ---------- */
/* Без вкладок нижней панели не будет вовсе. Нужно страницам, у которых своя
   навигация, а от оболочки требуются только звёзды: «Словарь» этой колоды сам
   разводит Словарь/Тренажёр/Упражнения, и пустая полоса снизу отняла бы у него
   строку ни за чем. */
function buildNav() {
  if (!CFG.tabs || !CFG.tabs.length) return;
  nav = el('nav', 'shell-nav');
  (CFG.tabs || []).forEach(function (t) {
    var a = el(t.href ? 'a' : 'button', 'shell-tab' + (t.id === CFG.active ? ' on' : ''));
    if (t.href) a.href = t.href; else a.type = 'button';
    /* Иконка вкладки — либо символ строкой, либо СВОЙ РИСУНОК: колода вправе
       прислать готовый <svg>, и тогда мы вставляем его разметкой, а не
       текстом. Понадобилось «Словарю на сценах» (решение владельца 05.08.2026:
       «нам ни в коем случае не нужны никакие эмодзи в продукте») — эмодзи
       рисует операционная система, то есть вид продукта нам не принадлежит.
       Строковые иконки других колод работают как работали. */
    var ic = el('span', 'shell-ic');
    if (/^\s*<svg/.test(t.icon || '')) ic.innerHTML = t.icon;
    else ic.textContent = t.icon || '•';
    a.appendChild(ic);
    a.appendChild(el('small', null, t.label || ''));
    if (t.id === CFG.active) a.setAttribute('aria-current', 'page');
    /* Какая вкладка открывает лист, оболочка узнаёт из `sheet: true`, а не из
       имени: раздел называется по-разному («Родителям» у энциклопедий,
       «Настройки» у словаря), и привязка к идентификатору 'parent' заставляла
       бы колоду врать в коде ради поведения. */
    if (!t.href) a.addEventListener('click', function () {
      if (t.sheet || t.id === 'parent') openParent(); else if (CFG.onTab) CFG.onTab(t.id);
    });
    nav.appendChild(a);
  });
  document.body.appendChild(nav);
}

/* ---------- раздел для взрослых ----------
   Ворота — пример на умножение: не защита, а порог, который ребёнок не
   перешагнёт случайно. Тот же приём, что в «Кругосветке».

   Ворота нужны не всякому разделу. Порог оправдан там, где за ним ЛЕЖИТ
   что-то не для ребёнка — покупка, сброс прогресса, чужие данные. Если за
   ним только собственная статистика («сколько звёзд, сколько слов»), пример
   на умножение охраняет от ребёнка его же успехи, и это просто лишний экран
   на пути (решение владельца 05.08.2026 по «Словарю на сценах»). Поэтому
   `gate: false` — отдельный флаг колоды, а не общее решение за всех. */
var gateA = 0, gateB = 0;
function showBody() {
  var g = $('shellGate');
  if (g) g.style.display = 'none';
  $('shellPBody').style.display = '';
  $('shellPBody').innerHTML = '';
  if (CFG.renderParent) CFG.renderParent($('shellPBody'), { stars: stars(), rank: rankOf() });
}
function openParent() {
  var sh = $('shellParent');
  if (!sh) return;
  if (CFG.gate === false) { showBody(); sh.hidden = false; return; }
  gateA = 3 + Math.floor(Math.random() * 7);
  gateB = 3 + Math.floor(Math.random() * 7);
  $('shellGateQ').textContent = gateA + ' × ' + gateB + ' = ?';
  $('shellGateIn').value = '';
  $('shellGateErr').textContent = '';
  $('shellGate').style.display = '';
  $('shellPBody').style.display = 'none';
  sh.hidden = false;
}
function tryGate() {
  if (+$('shellGateIn').value === gateA * gateB) showBody();
  else $('shellGateErr').textContent = CFG.t ? CFG.t('gate_err') : 'Не сходится';
}
/* Нет чем наполнить лист — нет и листа. Иначе на странице остаётся скрытая
   разметка раздела, в который ниоткуда не попасть: у «Карточек» словаря
   вкладка «Настройки» уводит на соседнюю страницу, и свой лист там был бы
   мёртвым — вместе с воротами, которых в продукте уже нет. */
function buildParent() {
  if (!CFG.renderParent) return;
  var gate = CFG.gate !== false;
  var sh = el('div', 'shell-sheet');
  sh.id = 'shellParent'; sh.hidden = true;
  sh.innerHTML =
    '<div class="shell-panel">' +
      '<div class="shell-ph"><h3>' + (CFG.parentTitle || 'Родителям') + '</h3>' +
      '<button class="shell-x" id="shellPClose" type="button" aria-label="Закрыть">✕</button></div>' +
      (gate ?
      '<div id="shellGate" class="shell-gate">' +
        '<div class="shell-gk">' + (CFG.gateText || 'Чтобы войти, решите пример') + '</div>' +
        '<div class="shell-gq" id="shellGateQ"></div>' +
        '<input class="shell-gin" id="shellGateIn" type="text" inputmode="numeric" pattern="[0-9]*">' +
        '<button class="shell-gbtn" id="shellGateGo" type="button">' + (CFG.gateGo || 'Открыть') + '</button>' +
        '<p class="shell-gerr" id="shellGateErr"></p>' +
      '</div>' : '') +
      '<div id="shellPBody" style="display:none"></div>' +
    '</div>';
  document.body.appendChild(sh);
  $('shellPClose').addEventListener('click', function () { sh.hidden = true; });
  if (gate) {
    $('shellGateGo').addEventListener('click', tryGate);
    $('shellGateIn').addEventListener('keydown', function (e) { if (e.key === 'Enter') tryGate(); });
  }
}

/* ---------- монтаж ---------- */
function mount(cfg) {
  CFG = cfg || {};
  badge = cfg.badge ? (typeof cfg.badge === 'string' ? $(cfg.badge) : cfg.badge) : null;
  buildNav();
  buildParent();
  paint();
  return true;
}

global.Shell = {
  mount: mount,
  earn: earn,
  stars: stars,
  rankOf: rankOf,
  openParent: openParent,
  repaint: paint,
  /* Сменить копилку на ходу. Нужно колодам, где счёт идёт не один на всё
     приложение: во «Словаре на сценах» звёзды считаются по языку изучения, и
     переключение языка обязано переключить и счётчик — иначе на экране
     остаются чужие звёзды. */
  setStarKey: function (key) { if (CFG && key) { CFG.starKey = key; paint(); } },
  /* Пометить активную вкладку без пересборки панели. Нужно страницам, где
     вкладки переключают содержимое НА МЕСТЕ, а не переходом по ссылке: во
     «Словаре» так устроены «Слова / Сцены / Занятия». Второй mount() повесил
     бы вторую панель поверх первой. */
  /* Поменять адрес вкладки-ссылки на ходу. Нужно колодам, где часть адреса
     зависит от состояния: во «Словаре» ссылка на «Карточки» несёт язык
     изучения, а панель строится один раз. */
  setTabHref: function (id, href) {
    if (!CFG || !nav) return;
    var i;
    for (i = 0; i < (CFG.tabs || []).length; i++) {
      if (CFG.tabs[i].id === id) {
        CFG.tabs[i].href = href;
        var el = nav.querySelectorAll('.shell-tab')[i];
        if (el && el.tagName === 'A') el.href = href;
      }
    }
  },
  setActive: function (id) {
    if (!CFG || !nav) return;
    CFG.active = id;
    var tabs = nav.querySelectorAll('.shell-tab'), i;
    for (i = 0; i < tabs.length; i++) {
      var on = (CFG.tabs[i] || {}).id === id;
      tabs[i].className = 'shell-tab' + (on ? ' on' : '');
      if (on) tabs[i].setAttribute('aria-current', 'page');
      else tabs[i].removeAttribute('aria-current');
    }
  }
};
})(typeof window !== 'undefined' ? window : this);
