/* core/components/flip3d — общий движок 3D-флеш-карт (three.js UMD r128, ES5).

   Настоящая карта в объёме: толщина, скруглённые углы, блик от источника
   света, мягкая тень и колода за спиной. Нажатие — переворот, протяжка —
   следующая карта, наклон при протяжке даёт параллакс.

   Про конкретную колоду движок НЕ знает: контент приходит колбэками из
   window.FLIP3D (см. README.md). Карту рисует колода на обычном 2D-канвасе,
   движок превращает канвас в текстуру, скругляет углы и держит кэш.

   Наружу: window.Flip3D = {mount, next, prev, flip, go, index, count, repaint}. */
(function(){
"use strict";

var CFG = window.FLIP3D || {};
var COUNT  = Math.max(1, CFG.count|0);
var ASPECT = CFG.aspect || (2/3);          // ширина/высота карты
var TEXW   = CFG.texW || 640;
var TEXH   = Math.round(TEXW/ASPECT);
var TH = CFG.theme || {};

var W = 1, H = W/ASPECT, D = 0.032, RAD = 0.062;   // геометрия карты в сцене

/* Два слоя = два прохода отрисовки. Колода за спиной лежит в 0.055–0.11 позади
   карты, а карта на перевороте выметает по глубине ±W/2·sin(угол) — то есть до
   полуширины, в двадцать раз больше зазора. На середине переворота дальняя
   половина карты физически уезжает ЗА колоду, и колода её честно закрывает:
   на экране левая половина текста и фотографии просто пропадает, а карта
   выглядит обрезанной по вертикали (найдено владельцем на живом прогоне
   04.08.2026, «неправильно делается flip»). Отодвинуть колоду не выход — она
   на то и за спиной, чтобы лежать вплотную. Поэтому колода и тень рисуются
   ОТДЕЛЬНЫМ проходом как задник, буфер глубины между проходами чистится, и
   карта не может нырнуть ни за что. Дефект не ловится на статичном кадре и не
   виден на медленном глазу — только в середине анимации. */
var L_BACK = 1, L_CARD = 2;
var idx = Math.min(COUNT-1, Math.max(0, CFG.index|0));

var scene, cam, ren, root, card, faceMat, backMat, bodyMat, shadow, faceMesh, backMesh;
var flipped = false;
var rotY = 0, rotYT = 0, tiltX = 0, tiltXT = 0, posX = 0, posXT = 0, scl = 1, sclT = 1;
var anim = null, t0 = 0, raf = 0, mounted = false;

/* ---------- текстуры: канвас колоды → CanvasTexture, углы скругляет движок ---------- */
var cache = {};                              // i → {face:{cv,tex}, back:{cv,tex}}
var CACHE_MAX = 7;

function roundPath(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}
/* Углы режет движок, а не колода: колода рисует прямоугольник и не думает о форме.
   Маска идемпотентна — колода может дорисовывать карту по мере загрузки картинок. */
function mask(cv){
  var ctx = cv.getContext("2d"), r = RAD/W*cv.width;
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = "#000"; roundPath(ctx,0,0,cv.width,cv.height,r); ctx.fill();
  ctx.restore();
}
function makeTex(i, side){
  var cv = document.createElement("canvas");
  cv.width = TEXW; cv.height = TEXH;
  var tex = new THREE.CanvasTexture(cv);
  tex.encoding = THREE.sRGBEncoding;
  tex.anisotropy = ren ? ren.capabilities.getMaxAnisotropy() : 1;
  tex.minFilter = THREE.LinearFilter;                 // без мипмапов: карта всегда крупная
  var draw = side === "face" ? CFG.drawFace : CFG.drawBack;
  function done(){ mask(cv); tex.needsUpdate = true; }
  try { draw(cv.getContext("2d"), cv.width, cv.height, i, done); } catch(e){}
  done();
  return {cv:cv, tex:tex};
}
function slot(i){
  var s = cache[i];
  if(!s){ s = cache[i] = {face:makeTex(i,"face"), back:makeTex(i,"back")}; trim(); }
  return s;
}
function trim(){
  var keys = [], k;
  for(k in cache) if(cache.hasOwnProperty(k)) keys.push(+k);
  if(keys.length <= CACHE_MAX) return;
  keys.sort(function(a,b){ return Math.abs(b-idx)-Math.abs(a-idx); });
  while(keys.length > CACHE_MAX){
    var d = keys.shift(), s = cache[d];
    if(s){ s.face.tex.dispose(); s.back.tex.dispose(); delete cache[d]; }
  }
}
function apply(i){
  var s = slot(i);
  faceMat.map = s.face.tex; faceMat.needsUpdate = true;
  backMat.map = s.back.tex; backMat.needsUpdate = true;
}
/* перерисовать текущую карту (смена языка и т.п.) */
function repaint(){
  var s = cache[idx];
  if(s){ s.face.tex.dispose(); s.back.tex.dispose(); delete cache[idx]; }
  apply(idx);
}
/* Перерисовать ВСЮ колоду. Нужен там, где поменялось не содержимое одной
   карты, а правило отрисовки всех — например язык. repaint() чистит только
   текущий индекс, а соседние лежат в кэше уже нарисованными: после смены
   языка соседняя карта пролистывалась на старом языке, и это было видно
   только свайпом, а не на месте. */
function repaintAll(){
  var k;
  for(k in cache) if(cache.hasOwnProperty(k)){
    cache[k].face.tex.dispose(); cache[k].back.tex.dispose();
  }
  cache = {};
  apply(idx); prefetch();
}

/* Куда именно на карте пришёлся тап: {u,v} в долях текстуры (0..1, v сверху
   вниз, как в канвасе) и какая сторона. null — мимо карты. Нужен колодам,
   которые вешают на строки карточки собственное действие. */
function hitUV(cx, cy){
  if(!faceMesh || !window.THREE.Raycaster) return null;
  var el = ren.domElement, r = el.getBoundingClientRect();
  if(!r.width || !r.height) return null;
  var rc = new THREE.Raycaster();
  /* Луч тоже ходит по слоям, а карта живёт на своём (см. L_CARD выше). Без
     этой строки intersectObjects молча не находит НИЧЕГО — объект есть, но
     слой не совпал. */
  rc.layers.enableAll();
  rc.setFromCamera(new THREE.Vector2(
    ((cx - r.left) / r.width) * 2 - 1,
    -((cy - r.top) / r.height) * 2 + 1), cam);
  /* Спрашиваем ТОЛЬКО ту сторону, которая сейчас к зрителю. Если целить в обе,
     луч цепляет и дальнюю (материал двусторонним не объявлен, но плоскости
     лежат в 0.04 друг от друга и на просвет попадаются обе), а её uv
     зеркальны — перевод показывался бы от строки, стоящей симметрично. */
  var target = flipped ? backMesh : faceMesh;
  var hits = rc.intersectObject(target, false);
  if(!hits.length || !hits[0].uv) return null;
  /* x/y — точка нажатия в координатах окна. Колоде их не вычислить самой:
     onTap зовут из движка, и события у неё на руках нет. Нужны, чтобы
     поставить подсказку У САМОЙ СТРОКИ, а не в углу экрана (замечание
     владельца 05.08.2026: «подпись на родном языке должна быть прям над
     словом, над фразой»). */
  return { u: hits[0].uv.x, v: 1 - hits[0].uv.y, back: target === backMesh,
    x: cx, y: cy };
}

/* ---------- геометрия ---------- */
function roundedShape(w,h,r){
  var s = new THREE.Shape(), x = -w/2, y = -h/2;
  s.moveTo(x+r,y); s.lineTo(x+w-r,y); s.quadraticCurveTo(x+w,y,x+w,y+r);
  s.lineTo(x+w,y+h-r); s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  s.lineTo(x+r,y+h); s.quadraticCurveTo(x,y+h,x,y+h-r);
  s.lineTo(x,y+r); s.quadraticCurveTo(x,y,x+r,y);
  return s;
}
/* фаска добавляет толщину с ОБЕИХ сторон — учитываем её, иначе лицо карты
   окажется внутри тела и текстуры не будет видно */
var BEV = 0.004;
function bodyGeo(w,h,d){
  var g = new THREE.ExtrudeGeometry(roundedShape(w,h,RAD), {
    depth:d, curveSegments:10, bevelEnabled:true,
    bevelThickness:BEV, bevelSize:BEV, bevelSegments:2});
  g.translate(0,0,-d/2);
  return g;
}
/* мягкая тень под картой — радиальный градиент на канвасе, дешевле теневой карты */
function shadowTex(){
  var cv = document.createElement("canvas"); cv.width = cv.height = 128;
  var c = cv.getContext("2d"), g = c.createRadialGradient(64,64,4,64,64,62);
  g.addColorStop(0,"rgba(20,44,70,.34)"); g.addColorStop(.55,"rgba(20,44,70,.14)");
  g.addColorStop(1,"rgba(20,44,70,0)");
  c.fillStyle = g; c.fillRect(0,0,128,128);
  return new THREE.CanvasTexture(cv);
}

/* ---------- сцена ---------- */
function build(canvas){
  ren = new THREE.WebGLRenderer({canvas:canvas, antialias:true, alpha:true});
  ren.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
  ren.outputEncoding = THREE.sRGBEncoding;
  ren.autoClear = false;                       /* два прохода, см. draw() */

  scene = new THREE.Scene();
  cam = new THREE.PerspectiveCamera(32, 1, 0.1, 40);

  /* Свет нужен обоим проходам, поэтому слои у него открыты все. */
  var amb = new THREE.AmbientLight(0xffffff, 0.92); amb.layers.enableAll(); scene.add(amb);
  var key = new THREE.DirectionalLight(0xffffff, 0.5);
  key.position.set(-1.1,1.6,2.2); key.layers.enableAll(); scene.add(key);
  var rim = new THREE.DirectionalLight(0xffffff, 0.22);
  rim.position.set(1.6,-0.8,1.2); rim.layers.enableAll(); scene.add(rim);

  root = new THREE.Group(); scene.add(root);

  /* колода за спиной: две «спящие» карты — объём читается даже на перевороте */
  var stackMat = new THREE.MeshPhongMaterial({color:TH.stack||0xf0e7d6, shininess:6});
  var i;
  for(i=1;i<=2;i++){
    var gh = new THREE.Mesh(bodyGeo(W,H,D), stackMat);
    gh.position.set(0.012*i, -0.014*i, -0.055*i);
    gh.scale.setScalar(1-0.032*i);
    gh.layers.set(L_BACK);
    root.add(gh);
  }

  shadow = new THREE.Mesh(new THREE.PlaneGeometry(W*2.0, H*1.5),
    new THREE.MeshBasicMaterial({map:shadowTex(), transparent:true, depthWrite:false}));
  shadow.position.set(0.05,-0.09,-0.22);
  shadow.layers.set(L_BACK);
  root.add(shadow);

  bodyMat = new THREE.MeshPhongMaterial({color:TH.edge||0xfffdf9, shininess:10});
  faceMat = new THREE.MeshPhongMaterial({transparent:true, shininess:26, specular:0x2a2a2a});
  backMat = new THREE.MeshPhongMaterial({transparent:true, shininess:26, specular:0x2a2a2a});

  card = new THREE.Group();
  card.add(new THREE.Mesh(bodyGeo(W,H,D), bodyMat));
  var fz = D/2 + BEV + 0.0018;                       /* поверх фаски, вплотную к торцу */
  var pw = W - BEV*2, ph = H - BEV*2;                /* лицо не свисает с фаски */
  var f = new THREE.Mesh(new THREE.PlaneGeometry(pw,ph), faceMat); f.position.z =  fz;
  var b = new THREE.Mesh(new THREE.PlaneGeometry(pw,ph), backMat); b.position.z = -fz; b.rotation.y = Math.PI;
  faceMesh = f; backMesh = b;
  card.add(f); card.add(b);
  card.traverse(function(o){ o.layers.set(L_CARD); });
  root.add(card);

  apply(idx);
  resize();
}

/* Поля вокруг карты. По умолчанию 1.30 по ширине и 1.14 по высоте — запас, в
   котором видно колоду за спиной и уезжающую карту при листании. Колода может
   их поджать (CFG.margin), если карта у неё — главное на экране и запас важнее
   отдать самой картинке: у «Словаря на сценах» на телефоне запас 1.30 съедал
   почти четверть ширины и фото выходило вдвое мельче, чем могло (жалоба
   владельца «изображение нужно увеличить в два раза»). Умолчание не трогаем —
   «Кругосветка» и остальные колоды остаются как были. */
var MARG = CFG.margin || {};
var MW = MARG.w || 1.30, MH = MARG.h || 1.14;
/* Общая скорость движений карты (переворот, полёт при листании, «подскок»).
   1 — как было; больше — быстрее. Колода может попросить свою: во «Словаре на
   сценах» карточку листают сотнями подряд, и владелец попросил «раза в 1.5
   быстрее» — на одиночной карте «Кругосветки» такой спешки не нужно. */
var SPEED = CFG.speed > 0 ? CFG.speed : 1;
function resize(){
  var el = ren.domElement, w = el.clientWidth||window.innerWidth, h = el.clientHeight||window.innerHeight;
  ren.setSize(w,h,false);
  cam.aspect = w/h;
  var vF = cam.fov*Math.PI/180;
  var dV = (H*MH/2)/Math.tan(vF/2);
  var hF = 2*Math.atan(Math.tan(vF/2)*cam.aspect);
  var dH = (W*MW/2)/Math.tan(hF/2);
  cam.position.set(0,0,Math.max(dV,dH));
  cam.updateProjectionMatrix();
}

/* ---------- анимации ---------- */
function ease(t){ return t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; }

var pending = 0;
function go(dir){                       /* dir: +1 вперёд, −1 назад */
  /* нажатия во время полёта не теряем, а копим один шаг: ребёнок жмёт стрелку
     очередями, и «проглоченное» нажатие читается как залипшая кнопка */
  if(anim){ pending = dir; return; }
  var n = idx+dir;
  if(n<0 || n>=COUNT){ posXT = 0; bump(dir); return; }
  anim = {ph:"out", dir:dir, t:0};
}
function bump(dir){                     /* упор в край колоды — короткий отскок */
  posX = -dir*0.06;
}
function step(dt){
  if(!anim) return;
  anim.t += dt*SPEED/(anim.ph==="out" ? 250 : 320);
  var k = Math.min(1, anim.t), e = ease(k);
  if(anim.ph==="out"){
    posX = anim.dir*-2.4*e; card.rotation.z = anim.dir*0.2*e; scl = sclT = 1-0.1*e;
    if(k>=1){
      idx += anim.dir; flipped = false; rotY = rotYT = 0;
      apply(idx); prefetch();
      if(CFG.onIndex) CFG.onIndex(idx);
      posX = anim.dir*2.4; anim = {ph:"in", dir:anim.dir, t:0};
    }
  } else {
    posX = anim.dir*2.4*(1-e); card.rotation.z = anim.dir*0.16*(1-e); scl = sclT = 0.9+0.1*e;
    if(k>=1){
      anim = null; posX = posXT = 0; card.rotation.z = 0; scl = sclT = 1;
      if(pending){ var d = pending; pending = 0; go(d); }
    }
  }
}
/* соседние карты рисуем заранее — переход не спотыкается о загрузку картинок */
function prefetch(){
  if(idx+1<COUNT) slot(idx+1);
  if(idx-1>=0) slot(idx-1);
}

function flip(){
  if(anim) return;
  flipped = !flipped;
  rotYT = flipped ? Math.PI : 0;
  sclT = 1.045;                                  /* лёгкий «подскок» на перевороте */
  setTimeout(function(){ sclT = 1; }, 180/SPEED);
  if(CFG.onFlip) CFG.onFlip(idx, flipped);
}

/* ---------- ввод ----------
   ПРИЗРАЧНАЯ МЫШЬ. На телефоне один тап приходит ДВАЖДЫ: сперва настоящими
   touch-событиями, следом браузер синтезирует mousedown/mousemove/mouseup для
   старых страниц, не знающих про тач. Обработчики висели и на тех, и на
   других, поэтому end() срабатывал два раза подряд: первый переворачивал
   карту, второй тут же возвращал её обратно. Снаружи это выглядело как
   «карточка поддёргивается и не переворачивается» (жалоба владельца).

   Почему «иногда всё-таки срабатывает»: синтетическую мышь браузер НЕ шлёт,
   если во время касания кто-то позвал preventDefault — а мы зовём его в
   move() при сдвиге больше 6px. То есть работал ровно тот тап, который успел
   чуть-чуть проехать пальцем вбок; ровный тап не работал никогда. Отсюда же
   и «помогает только сильный тап».

   Лечим двумя замками сразу: помним время последнего касания и глушим мышь,
   пришедшую следом (touchAt), плюс сами гасим синтетику preventDefault'ом на
   touchend. Одного мало: на части устройств тач-события не отменяемы
   (e.cancelable === false), и тогда остаётся только временнóй замок. */
function bind(el){
  var down = false, sx = 0, sy = 0, st = 0, moved = 0, touchAt = 0;
  var GHOST_MS = 900;                  /* окно, в котором мышь после тача — призрак */
  function isMouse(e){ return e.type.slice(0,5) === "mouse"; }
  function ghost(e){ return isMouse(e) && Date.now()-touchAt < GHOST_MS; }
  function xy(e){ var t = e.touches && e.touches[0]; return t ? {x:t.clientX,y:t.clientY} : {x:e.clientX,y:e.clientY}; }
  function start(e){
    if(ghost(e)) return;
    if(!isMouse(e)) touchAt = Date.now();
    if(anim) return;
    var p = xy(e); down = true; sx = p.x; sy = p.y; st = Date.now(); moved = 0;
  }
  function move(e){
    if(ghost(e)) return;
    if(!isMouse(e)) touchAt = Date.now();
    if(!down || anim) return;
    var p = xy(e), dx = p.x-sx, dy = p.y-sy;
    moved = Math.max(moved, Math.abs(dx)+Math.abs(dy));
    if(Math.abs(dx) > 6 && e.cancelable) e.preventDefault();
    /* карта идёт примерно вровень с пальцем: при 1.8 она убегала вперёд руки */
    posXT = Math.max(-0.45, Math.min(0.45, dx/el.clientWidth*1.15));
    rotYT = (flipped?Math.PI:0) + dx/el.clientWidth*0.75;
    tiltXT = Math.max(-0.28, Math.min(0.28, -dy/el.clientHeight*0.7));
  }
  function end(e){
    if(ghost(e)) return;
    if(!isMouse(e)){
      touchAt = Date.now();
      /* Гасим синтетическую мышь в зародыше. Работает не везде (на части
         устройств touchend неотменяем) — поэтому выше есть ещё и touchAt. */
      if(e.cancelable) e.preventDefault();
    }
    if(!down) return;
    down = false;
    var p = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : e;
    var dx = (p.clientX||sx)-sx, fast = Date.now()-st < 400;
    posXT = 0; tiltXT = 0; rotYT = flipped?Math.PI:0;
    /* Допуск на тап был 12px, а свайп срабатывал только с 30px (в «быстром»
       окне) — между ними 18px МЁРТВОЙ ЗОНЫ: обычный лёгкий тап пальцем (не
       мышью) почти всегда даёт 12-25px дрожания и не долетает ни до одного
       порога — карта дёргается (move() уже сдвинул её) и откатывается назад
       БЕЗ переворота. Жалоба «помогает только сильный тап» — ровно этот
       случай: только решительный быстрый тап держит moved достаточно низким.
       Подняли порог тапа до 24px — мёртвая зона всё ещё есть (24-30px), но
       вчетверо уже, а не переоценивает случайно короткие намеренные свайпы. */
    if(Math.abs(dx) > 56 || (fast && Math.abs(dx) > 30)) go(dx<0 ? 1 : -1);
    else if(moved < 24 && Date.now()-st < 420){
      /* Колода может перехватить тап и обработать его сама (например показать
         перевод по нажатию на строку). Вернула true — переворота не делаем:
         иначе одно и то же нажатие означало бы два разных действия сразу. */
      var hit = CFG.onTap ? hitUV(p.clientX||sx, p.clientY||sy) : null;
      if(!(CFG.onTap && CFG.onTap(hit, flipped) === true)) flip();
    }
  }
  el.addEventListener("mousedown",start); el.addEventListener("mousemove",move);
  window.addEventListener("mouseup",end);
  el.addEventListener("touchstart",start,{passive:true});
  el.addEventListener("touchmove",move,{passive:false});
  /* passive:false обязателен — иначе preventDefault() внутри end() молча
     игнорируется и синтетическая мышь всё равно придёт вторым тапом. */
  el.addEventListener("touchend",end,{passive:false});
  el.addEventListener("touchcancel",end,{passive:false});
  document.addEventListener("keydown",function(e){
    if(e.key==="ArrowRight") go(1);
    else if(e.key==="ArrowLeft") go(-1);
    else if(e.key===" "||e.key==="Enter"){ e.preventDefault(); flip(); }
  });
}

/* ---------- цикл ---------- */
function loop(now){
  raf = requestAnimationFrame(loop);
  var dt = Math.min(50, now-t0 || 16); t0 = now;
  step(dt);
  var k = 1-Math.pow(0.001, dt*SPEED/1000);     /* кадронезависимое сглаживание */
  rotY += (rotYT-rotY)*k; tiltX += (tiltXT-tiltX)*k;
  posX += (posXT-posX)*k*(anim?1:0.9); scl += (sclT-scl)*k;
  card.rotation.y = rotY; card.rotation.x = tiltX;
  card.position.x = posX; card.scale.setScalar(scl);
  var t = now/1000;
  card.position.y = Math.sin(t*1.1)*0.011;      /* карта дышит, а не висит мёртвой */
  root.rotation.y = Math.sin(t*0.35)*0.02;
  draw();
}
/* Задник и карта — разными проходами, между ними чистка глубины. */
function draw(){
  ren.clear();
  cam.layers.set(L_BACK); ren.render(scene,cam);
  ren.clearDepth();
  cam.layers.set(L_CARD); ren.render(scene,cam);
}

/* ---------- API ---------- */
function mount(canvas){
  if(mounted) return true;
  if(!window.THREE) return false;
  build(canvas); bind(canvas); prefetch();
  window.addEventListener("resize",resize);
  window.addEventListener("orientationchange",function(){ setTimeout(resize,120); });
  mounted = true;
  if(CFG.onIndex) CFG.onIndex(idx);
  raf = requestAnimationFrame(loop);
  return true;
}
window.Flip3D = {
  mount: mount,
  next: function(){ go(1); },
  prev: function(){ go(-1); },
  flip: flip,
  go: function(i){                                /* прыжок без анимации полёта */
    if(anim || i<0 || i>=COUNT || i===idx) return;
    idx = i; flipped = false; rotY = rotYT = 0; apply(idx); prefetch();
    if(CFG.onIndex) CFG.onIndex(idx);
  },
  index: function(){ return idx; },
  count: function(){ return COUNT; },
  flipped: function(){ return flipped; },
  /* Идёт ли ещё движение: карта летит к соседней или доворачивается после
     переворота. Нужно снаружи, чтобы дождаться конца анимации — глазами по
     кадрам этого не понять, карта всё время чуть «дышит». */
  settling: function(){ return !!anim || Math.abs(rotYT-rotY) > 0.01; },
  /* Текущий угол поворота в градусах. Нужен проверке tools/node/check_flip3d.js:
     без него кадр не привязать к фазе анимации, а весь дефект «карту ест колода»
     живёт только в середине переворота и на крайних кадрах не виден. */
  rotYDeg: function(){ return rotY*180/Math.PI; },
  repaint: repaint,
  repaintAll: repaintAll,
  hitUV: hitUV
};
})();
