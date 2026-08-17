/* core/mechanics/memory-triples — мемори по тройкам (и по парам).

   Обычное мемори учит одному соответствию. Тройка заставляет держать в голове
   три представления одного объекта сразу — у «Стран мира» это контур, флаг и
   название. Размер группы задаёт колода: 2 — привычные пары, 3 — тройки.

   Механика про содержимое НЕ знает: лицо карточки рисует колода колбэком
   render(host, item, kind). ES5, без зависимостей, CSS вставляет сам.

   Наружу: window.MemoryTriples = {mount, start, again, stats}. */
(function(){
"use strict";

var CSS =
".mt3{--ink:#15324C;--mut:#6C7F93;--card:#FFFDF9;--line:#E7D9C0;--ok:#3D8F4A;--coral:#FF6B4A;"+
  "font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;"+
  "color:var(--ink);position:relative}"+
".mt3-hud{display:flex;gap:10px;align-items:center;justify-content:center;margin:0 0 14px}"+
".mt3-box{background:var(--card);border:2px solid var(--line);border-radius:14px;padding:9px 14px;"+
  "font-weight:800;font-size:15px;line-height:1;box-shadow:0 4px 12px rgba(20,44,70,.08)}"+
".mt3-box b{font-size:17px}"+
".mt3-grid{display:grid;gap:10px}"+
".mt3-c{position:relative;aspect-ratio:3/4;border:0;padding:0;background:none;cursor:pointer;"+
  "perspective:800px;-webkit-tap-highlight-color:transparent}"+
".mt3-in{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .42s cubic-bezier(.2,.7,.3,1)}"+
".mt3-c.shown .mt3-in,.mt3-c.done .mt3-in{transform:rotateY(180deg)}"+
".mt3-b,.mt3-f{position:absolute;inset:0;border-radius:14px;backface-visibility:hidden;"+
  "-webkit-backface-visibility:hidden;display:flex;align-items:center;justify-content:center;overflow:hidden}"+
".mt3-b{background:linear-gradient(135deg,#7FB3E8,#4E7FC4);border:3px solid #fff;"+
  "box-shadow:0 5px 14px rgba(20,44,70,.16);color:#fff;font-weight:900;font-size:30px;line-height:1}"+
".mt3-b span{display:flex;align-items:center;justify-content:center;width:56px;height:56px;"+
  "border-radius:50%;border:3px solid rgba(255,255,255,.7);background:rgba(255,255,255,.14)}"+
".mt3-f{background:var(--card);border:3px solid var(--line);transform:rotateY(180deg);"+
  "box-shadow:0 5px 14px rgba(20,44,70,.14);padding:6px}"+
".mt3-c.done .mt3-f{border-color:var(--ok);box-shadow:0 0 0 3px rgba(61,143,74,.18)}"+
".mt3-c.done{cursor:default}"+
".mt3-c.miss .mt3-f{border-color:var(--coral)}"+
".mt3-f img{max-width:100%;max-height:100%;object-fit:contain;border-radius:8px}"+
".mt3-f canvas{max-width:100%;max-height:100%}"+
".mt3-f .mt3-t{font-weight:900;font-size:16px;line-height:1.15;text-align:center;padding:4px;overflow-wrap:break-word}"+
"@keyframes mt3pop{0%{transform:scale(1)}45%{transform:scale(1.07)}100%{transform:scale(1)}}"+
".mt3-c.pop{animation:mt3pop .38s ease}"+
".mt3-done{position:absolute;inset:0;display:none;align-items:center;justify-content:center;"+
  "background:rgba(253,243,227,.94);border-radius:18px;z-index:5}"+
".mt3-done.on{display:flex}"+
".mt3-card{background:var(--card);border:2px solid var(--line);border-radius:20px;padding:22px 24px;"+
  "text-align:center;box-shadow:0 12px 34px rgba(20,44,70,.18);max-width:320px}"+
".mt3-card .mt3-st{font-size:38px;line-height:1.1}"+
".mt3-card b{display:block;font-size:20px;margin:8px 0 4px}"+
".mt3-card p{margin:0 0 14px;color:var(--mut);font-weight:700}"+
".mt3-btns{display:flex;gap:10px;justify-content:center}"+
".mt3-btns button{font-family:inherit;font-weight:800;font-size:16px;border-radius:14px;padding:12px 18px;cursor:pointer;border:2px solid var(--line)}"+
".mt3-again{background:var(--coral);border-color:var(--coral)!important;color:#fff}"+
".mt3-back{background:var(--card);color:var(--ink)}";

var CFG, host, grid, elMoves, elFound, elDone;
var cards = [], open = [], moves = 0, found = 0, lock = false, groups = 0, per = 3;

function css(){
  if(document.getElementById("mt3-css")) return;
  var s=document.createElement("style"); s.id="mt3-css"; s.textContent=CSS;
  document.head.appendChild(s);
}
function shuffle(a){
  for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=a[i]; a[i]=a[j]; a[j]=t; }
  return a;
}
function L(k,d){ return (CFG.labels&&CFG.labels[k])||d; }

function start(){
  var pool = shuffle((CFG.items||[]).slice()).slice(0, groups);
  cards = [];
  for(var i=0;i<pool.length;i++)
    for(var k=0;k<CFG.kinds.length && k<per;k++)
      cards.push({item:pool[i], kind:CFG.kinds[k], key:CFG.keyOf(pool[i])});
  shuffle(cards);
  open=[]; moves=0; found=0; lock=false;
  render(); upd();
  elDone.className="mt3-done";
}
function render(){
  /* колонок ровно столько, сколько карт в группе: строка по ширине равна одной
     тройке, и ребёнку видно, что собирать надо по три */
  grid.style.gridTemplateColumns = "repeat("+(per===2?4:per)+",1fr)";
  grid.innerHTML="";
  for(var i=0;i<cards.length;i++){
    var b=document.createElement("button");
    b.className="mt3-c"; b.setAttribute("data-i",i);
    b.setAttribute("aria-label", L("aria","Карточка рубашкой вверх"));
    b.innerHTML='<span class="mt3-in"><span class="mt3-b"><span>?</span></span><span class="mt3-f"></span></span>';
    grid.appendChild(b);
    CFG.render(b.querySelector(".mt3-f"), cards[i].item, cards[i].kind);
    b.addEventListener("click", tap);
  }
}
function upd(){
  elMoves.textContent = moves;
  elFound.textContent = found + " / " + groups;
}
function at(i){ return grid.querySelector('.mt3-c[data-i="'+i+'"]'); }

function tap(){
  if(lock) return;
  var i = +this.getAttribute("data-i"), el = at(i);
  if(!el || el.className.indexOf("shown")>=0 || el.className.indexOf("done")>=0) return;
  el.className="mt3-c shown"; open.push(i);
  if(CFG.onOpen) CFG.onOpen(cards[i].item, cards[i].kind);
  if(open.length < per) return;

  moves++; upd(); lock=true;
  var same=true, k;
  for(k=1;k<open.length;k++) if(cards[open[k]].key !== cards[open[0]].key) same=false;

  if(same){
    found++; upd();
    for(k=0;k<open.length;k++) at(open[k]).className="mt3-c done pop";
    if(CFG.onMatch) CFG.onMatch(cards[open[0]].item);
    setTimeout(function(){
      for(var k2=0;k2<open.length;k2++){ var e=at(open[k2]); if(e) e.className="mt3-c done"; }
      open=[]; lock=false;
      if(found>=groups) finish();
    }, 620);
  } else {
    /* промах подсвечиваем красным, но не прячем сразу: ребёнок должен успеть
       разглядеть, что именно открыл, — иначе игра превращается в лотерею */
    for(k=0;k<open.length;k++) at(open[k]).className="mt3-c shown miss";
    setTimeout(function(){
      for(var k2=0;k2<open.length;k2++){ var e=at(open[k2]); if(e) e.className="mt3-c"; }
      open=[]; lock=false;
    }, 1050);
  }
}
function finish(){
  var best = groups*per - groups;                 /* идеал: каждая группа с первого раза */
  var st = moves<=groups+1 ? 3 : moves<=best ? 2 : 1;
  var stars = new Array(st+1).join("⭐");
  elDone.innerHTML =
    '<div class="mt3-card"><div class="mt3-st">'+stars+'</div>'+
    '<b>'+L("done","Все тройки собраны!")+'</b>'+
    '<p>'+L("moves2","Ходов: ")+moves+'</p>'+
    '<div class="mt3-btns"><button class="mt3-again">'+L("again","Ещё раз")+'</button>'+
    (CFG.backHref?'<button class="mt3-back">'+L("back","Назад")+'</button>':'')+'</div></div>';
  elDone.className="mt3-done on";
  elDone.querySelector(".mt3-again").addEventListener("click", start);
  var bk = elDone.querySelector(".mt3-back");
  if(bk) bk.addEventListener("click", function(){ location.href = CFG.backHref; });
  if(CFG.onDone) CFG.onDone({moves:moves, groups:groups, stars:st});
}

function mount(el){
  CFG = window.MEMORY_TRIPLES || {};
  if(!CFG.items || !CFG.items.length || !CFG.kinds || !CFG.render) return false;
  per = Math.max(2, Math.min(CFG.kinds.length, CFG.perGroup || CFG.kinds.length));
  groups = Math.max(2, Math.min(CFG.groups || 4, CFG.items.length));
  css();
  host = el; host.className = "mt3 " + (host.className||"");
  host.innerHTML =
    '<div class="mt3-hud">'+
      '<span class="mt3-box">'+L("found","Собрано")+' <b id="mt3f">0</b></span>'+
      '<span class="mt3-box">'+L("moves","Ходы")+' <b id="mt3m">0</b></span>'+
    '</div><div class="mt3-grid" id="mt3g"></div><div class="mt3-done" id="mt3d"></div>';
  grid=host.querySelector("#mt3g"); elMoves=host.querySelector("#mt3m");
  elFound=host.querySelector("#mt3f"); elDone=host.querySelector("#mt3d");
  start();
  return true;
}

window.MemoryTriples = {
  mount: mount,
  start: start,
  again: start,
  stats: function(){ return {moves:moves, found:found, groups:groups, per:per}; },
  /* для автотестов: разложение колоды, чтобы прогон мог доиграть партию */
  _keys: function(){ var a=[],i; for(i=0;i<cards.length;i++) a.push(cards[i].key); return a; }
};
})();
