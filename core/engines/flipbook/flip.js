"use strict";
/* ============================================================================
   ДВИЖОК-ЛИСТАЛКА (flipbook).  Показывает книгу как набор страниц-картинок
   (например, листы PDF) и листает их «как в книге». БЕЗ ЗВУКА: это «обычный»
   книжный движок (core/engines/book), у которого убрана озвучка/запись голоса
   и оставлено только перелистывание.

   Контент — те же папки books/<id>/ (картинки NN.<ext>), что и у озвученных
   книг; каталог и подключение book.js генерит tools/node/build-books.js.
   Листалка берёт книги папки "pdf" (folder:"pdf" в book.js).

     <id>/book.js  -> window.BOOKS["<id>"]={title,emoji,accent,cover,ext,images,folder}
     <id>/NN.<ext> -> страницы-картинки (webp/jpg), images[0] — обложка
   ========================================================================== */

var LIB={ name:"PDF-листалки", sub:"Выбери, что полистать", folder:"pdf" };

function $(id){return document.getElementById(id);}

/* ---- каталог: только книги-листалки (folder==="pdf") ---- */
function catalog(){
  var src=(window.BOOKS_CATALOG&&window.BOOKS_CATALOG.length)?window.BOOKS_CATALOG:[];
  if(!src.length){var id;for(id in (window.BOOKS||{}))if(window.BOOKS.hasOwnProperty(id)){var b=window.BOOKS[id];src.push({id:id,title:b.title,emoji:b.emoji,accent:b.accent,cover:b.cover,ext:b.ext,ready:b.ready!==false,order:b.order||999,folder:b.folder});}}
  var out=[],i;for(i=0;i<src.length;i++){if((src[i].folder||"")===LIB.folder)out.push(src[i]);}
  out.sort(function(a,b){return (a.order||999)-(b.order||999);});
  return out;
}
function bookMeta(id){var c=catalog(),i;for(i=0;i<c.length;i++)if(c[i].id===id)return c[i];var b=(window.BOOKS||{})[id];return b?{id:id,title:b.title,emoji:b.emoji,accent:b.accent,cover:b.cover,ext:b.ext,ready:b.ready!==false}:null;}
function extOf(id){var b=(window.BOOKS||{})[id];if(b&&b.ext)return b.ext;var c=bookMeta(id);return (c&&c.ext)||"webp";}

/* активная книга */
var BOOK=null, CUR=null;
function imagesOf(c){
  if(c.images&&c.images.length)return c.images.slice();
  /* запасной путь: одна картинка-обложка */
  return c.cover?[c.cover]:[];
}
function loadBook(id){
  var meta=bookMeta(id);if(!meta)return;
  CUR=id;
  var c=(window.BOOKS||{})[id]||{};
  var imgs=imagesOf(c);
  BOOK={id:id,title:c.title||meta.title,emoji:c.emoji||meta.emoji||"📄",
    accent:c.accent||meta.accent||"teal",ext:c.ext||meta.ext||"webp",
    folder:c.folder||LIB.folder,images:imgs,pages:imgs.length||1};
  R.page=0;
  ensureRefs();hideTurn();
  renderCurrent();
}

/* ===== Полка: иконостос обложек листалок ===== */
function shelfCellHTML(b){
  var cv=(b.cover&&isKey(b.cover))?'<img src="'+assetSrcFor(b.id,b.cover)+'" alt="" data-emoji="'+(b.emoji||"📄")+'" onerror="catFb(this)">':'<span class="cat-emoji">'+(b.emoji||"📄")+'</span>';
  return '<div class="cat-cell acc-'+(b.accent||"teal")+'" data-book="'+b.id+'"><div class="cat-cover">'+cv+'</div><div class="cat-title">'+b.title+'</div></div>';
}
function renderShelf(){
  var c=catalog(),html='<div class="p-catalog"><h2>'+LIB.name+'</h2><div class="cat-sub">'+LIB.sub+'</div><div class="cat-grid">',i;
  for(i=0;i<c.length;i++){if(c[i].ready!==false)html+=shelfCellHTML(c[i]);}
  html+='</div></div>';
  $("shelf-body").innerHTML=html;
}
function show(id){var s=document.querySelectorAll(".screen"),i;for(i=0;i<s.length;i++)s[i].className=s[i].className.replace(" active","");$(id).className+=" active";window.scrollTo(0,0);}
function openBook(id){if(!(window.BOOKS&&window.BOOKS[id]))return;try{history.replaceState(null,"","#"+id);}catch(e){}show("reader");loadBook(id);}
function routeFromHash(){var id=(location.hash||"").replace(/^#/,"");if(id&&window.BOOKS&&window.BOOKS[id]){show("reader");loadBook(id);}else{renderShelf();show("screen-shelf");}}
/* «домой» — вернуться в папку «pdf» главного меню (вкладка «Книги») */
function returnToFolder(){location.href="../index.html#books/"+LIB.folder;}

function catFb(el){el.outerHTML='<span class="cat-emoji">'+(el.getAttribute("data-emoji")||"📄")+'</span>';}
function isKey(v){return /^[0-9]{2,3}$/.test(""+v);}
function assetSrcFor(id,val){return id+"/"+val+"."+extOf(id);}
function imgFb(el){el.outerHTML='<span class="ph">'+(el.getAttribute("data-ph")||"📄")+'</span>';}

function buildPageHTML(idx){
  var val=BOOK.images[idx];
  var cls=(idx===0)?"p-cover":"p-page";
  if(isKey(val))return '<div class="'+cls+'"><img src="'+assetSrcFor(BOOK.id,val)+'" alt="" data-ph="'+(BOOK.emoji||"📄")+'" onerror="imgFb(this)"></div>';
  return '<div class="'+cls+'"><span class="ph">'+(BOOK.emoji||"📄")+'</span></div>';
}

var STAGE=null,FLIP=null,TURN=null;
function ensureRefs(){if(!FLIP){STAGE=$("stage");FLIP=$("pg-flip");TURN=$("pg-turn");}}
function paintFlip(idx){FLIP.innerHTML=buildPageHTML(idx);}
function fullHTML(idx){return '<div class="full">'+buildPageHTML(idx)+'</div>';}
function hideTurn(){if(TURN){TURN.className="turn";TURN.innerHTML="";}if(FLIP)FLIP.style.visibility="";}
function renderCurrent(){
  paintFlip(R.page);FLIP.className="page rest";FLIP.style.transition="none";FLIP.style.transform="none";FLIP.style.transformOrigin="";FLIP.style.visibility="";
  $("rd-pageno").textContent="Лист "+(R.page+1)+" из "+BOOK.pages;
  var prev=$("rd-prev"),next=$("rd-next");
  if(prev)prev.disabled=(R.page<=0);
  if(next)next.disabled=(R.page>=BOOK.pages-1);
}

if($("rd-home"))$("rd-home").onclick=returnToFolder;
if($("rd-prev"))$("rd-prev").onclick=function(){turn(-1);};
if($("rd-next"))$("rd-next").onclick=function(){turn(1);};
$("shelf-body").addEventListener("click",function(e){var cell=closestBook(e.target);if(cell){var bid=cell.getAttribute("data-book");if(bid)openBook(bid);}});

/* ===== переворот «как в книге»: корешок по центру, поворачивается правый лист ===== */
var animating=false;
function reduceMotion(){return window.matchMedia&&window.matchMedia("(prefers-reduced-motion:reduce)").matches;}
function stageW(){return (STAGE&&STAGE.clientWidth)||320;}
function easeIO(x){return x<0.5?2*x*x:1-Math.pow(-2*x+2,2)/2;}
function buildTurn(lp,rp){
  TURN.innerHTML=
    '<div class="base"><div class="half l">'+fullHTML(lp)+'</div><div class="half r">'+fullHTML(rp)+'</div></div>'
    +'<div class="gutter" id="turn-gut"></div>'
    +'<div class="leaf lift" id="turn-leaf">'
      +'<div class="face front">'+fullHTML(lp)+'<div class="shade" id="turn-shf"></div></div>'
      +'<div class="face back">'+fullHTML(rp)+'<div class="shade" id="turn-shb"></div></div>'
    +'</div>';
  TURN.className="turn on";
}
function setLeaf(ang){
  var lf=$("turn-leaf");if(!lf)return;
  lf.style.transform="rotateY("+ang+"deg)";
  var a=Math.abs(ang),shf=$("turn-shf"),shb=$("turn-shb"),gut=$("turn-gut");
  if(shf)shf.style.opacity=(Math.min(a,90)/90*0.20).toFixed(3);
  if(shb)shb.style.opacity=(Math.max(0,a-90)/90*0.14).toFixed(3);
  if(gut)gut.style.opacity=(Math.sin(Math.PI*Math.min(a,180)/180)*0.30).toFixed(3);
}
function tweenLeaf(from,to,dur,done){
  var t0=null,lf=$("turn-leaf");if(lf)lf.style.transition="none";
  function frame(ts){
    if(t0===null)t0=ts;
    var k=dur<=0?1:Math.min(1,(ts-t0)/dur);
    setLeaf(from+(to-from)*easeIO(k));
    if(k<1)requestAnimationFrame(frame);else if(done)done();
  }
  requestAnimationFrame(frame);
}
function doForward(cb){
  animating=true;FLIP.style.visibility="hidden";
  buildTurn(R.page,R.page+1);setLeaf(0);
  tweenLeaf(0,-180,520,function(){R.page++;renderCurrent();hideTurn();animating=false;if(cb)cb();});
}
function doBackward(cb){
  animating=true;FLIP.style.visibility="hidden";
  buildTurn(R.page-1,R.page);setLeaf(-180);
  tweenLeaf(-180,0,520,function(){R.page--;renderCurrent();hideTurn();animating=false;if(cb)cb();});
}
function endForward(fromAng,commit){
  animating=true;
  if(commit)tweenLeaf(fromAng,-180,300,function(){R.page++;renderCurrent();hideTurn();animating=false;});
  else tweenLeaf(fromAng,0,220,function(){renderCurrent();hideTurn();animating=false;});
}
function endBackward(fromAng,commit){
  animating=true;
  if(commit)tweenLeaf(fromAng,0,300,function(){R.page--;renderCurrent();hideTurn();animating=false;});
  else tweenLeaf(fromAng,-180,220,function(){renderCurrent();hideTurn();animating=false;});
}
function bounce(dir){
  FLIP.style.transformOrigin=dir>0?"left center":"right center";
  FLIP.style.transition="transform .16s ease";FLIP.style.transform="rotateY("+(dir>0?"-8deg":"8deg")+")";
  setTimeout(function(){FLIP.style.transform="rotateY(0deg)";setTimeout(function(){FLIP.style.transition="none";FLIP.style.transformOrigin="";},170);},110);
}
function turn(dir,cb){
  if(animating)return;
  if(dir>0){
    if(R.page>=BOOK.pages-1){bounce(1);return;}
    if(reduceMotion()){R.page++;renderCurrent();if(cb)cb();return;}
    doForward(cb);
  }else{
    if(R.page<=0){bounce(-1);return;}
    if(reduceMotion()){R.page--;renderCurrent();if(cb)cb();return;}
    doBackward(cb);
  }
}

var R={page:0};

/* ===== жесты: переворот следует за пальцем; тап по краю — листать ===== */
var swallowClick=false;
(function bindSwipe(){
  ensureRefs();
  var rm=$("reader").querySelector(".r-main"),x0=0,y0=0,drag=false,decided=false,horiz=false,fwd=false,bwd=false,endRes=false,ang=0;
  rm.addEventListener("touchstart",function(e){if(animating)return;drag=true;decided=false;horiz=false;fwd=false;bwd=false;endRes=false;ang=0;swallowClick=false;x0=e.touches[0].clientX;y0=e.touches[0].clientY;},{passive:true});
  rm.addEventListener("touchmove",function(e){
    if(!drag||animating)return;
    var dx=e.touches[0].clientX-x0,dy=e.touches[0].clientY-y0;
    if(!decided){decided=true;horiz=Math.abs(dx)>Math.abs(dy);}
    if(!horiz)return;
    if(Math.abs(dx)>8)swallowClick=true;
    if(dx<0){
      if(bwd)return;
      if(R.page>=BOOK.pages-1){endRes=true;FLIP.style.transformOrigin="left center";FLIP.style.transition="none";FLIP.style.transform="rotateY("+Math.max(-10,dx/stageW()*30)+"deg)";return;}
      if(!fwd){fwd=true;FLIP.style.visibility="hidden";buildTurn(R.page,R.page+1);setLeaf(0);}
      ang=Math.max(-180,dx/stageW()*210);setLeaf(ang);
    }else if(dx>0){
      if(fwd)return;
      if(R.page<=0){endRes=true;FLIP.style.transformOrigin="right center";FLIP.style.transition="none";FLIP.style.transform="rotateY("+Math.min(10,dx/stageW()*30)+"deg)";return;}
      if(!bwd){bwd=true;FLIP.style.visibility="hidden";buildTurn(R.page-1,R.page);setLeaf(-180);}
      ang=-180+Math.min(180,dx/stageW()*210);setLeaf(ang);
    }
  },{passive:true});
  rm.addEventListener("touchend",function(e){
    if(!drag)return;drag=false;if(animating)return;
    var dx=e.changedTouches[0].clientX-x0;
    if(fwd){ endForward(ang,(dx<=-stageW()*0.30||ang<=-100)); }
    else if(bwd){ endBackward(ang,(dx>=stageW()*0.30||ang>=-80)); }
    else if(endRes){ FLIP.style.transition="transform .18s ease";FLIP.style.transform="rotateY(0deg)";setTimeout(function(){FLIP.style.transition="none";FLIP.style.transformOrigin="";},190); }
    else if(horiz&&dx>=58){ turn(-1); }
    else if(horiz&&dx<=-58){ turn(1); }
  });
  /* тап по краю стопки — листать (правый край вперёд, левый назад) */
  $("stage").addEventListener("click",function(e){
    if(swallowClick){swallowClick=false;return;}
    var cell=closestBook(e.target);
    if(cell){var bid=cell.getAttribute("data-book");if(bid&&bid!==BOOK.id)openBook(bid);return;}
    var r=STAGE.getBoundingClientRect(),x=e.clientX-r.left;
    if(x>r.width*0.62)turn(1);
    else if(x<r.width*0.38)turn(-1);
  });
})();
function closestBook(el){while(el&&el!==document){if(el.getAttribute&&el.getAttribute("data-book"))return el;el=el.parentNode;}return null;}

window.onhashchange=function(){if(!animating)routeFromHash();};
ensureRefs();hideTurn();routeFromHash();
