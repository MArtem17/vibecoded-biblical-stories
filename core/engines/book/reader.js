"use strict";
/* ============================================================================
   ЕДИНЫЙ ДВИЖОК ОЗВУЧЕННЫХ КНИГ (Образовариум).
   Логика рендеринга/перелистывания/озвучки — общая, живёт в core/ и
   переиспользуется всеми книгами (CLAUDE.md §2).

   Контент книг НЕ зашит в движок. Каждая книга — отдельная папка books/<id>/:
     <id>/book.js   ->  window.BOOKS["<id>"]={title,emoji,accent,cover,ext,
                        series,badge,author,order,ready,glossary,pages,images}
     <id>/narr.js   ->  window.NARR["<id>"]={audio,pages}   (необязательно)
     <id>/NN.<ext>  ->  иллюстрации (webp/jpg), <cover>.<ext> — обложка
   Список и порядок книг — window.BOOKS_CATALOG (генерится tools/node/build-books.js).

   Книга может быть «беднее» или «богаче»: если у книги есть pages — собираем
   богатые страницы (текст, подсветка слов, словарь); если pages нет, но есть
   images — собираем книгу-картинку (обложка + по странице на иллюстрацию,
   озвучка авто-листает). Нет narr — книга работает без подсветки/авто-листания.
   ========================================================================== */

var LIB={ name:"Книги", sub:"Выбери книгу" };

function $(id){return document.getElementById(id);}

/* ---- каталог: window.BOOKS_CATALOG либо выводим из window.BOOKS ---- */
function catalog(){
  if(window.BOOKS_CATALOG&&window.BOOKS_CATALOG.length)return window.BOOKS_CATALOG;
  var out=[],id;for(id in (window.BOOKS||{}))if(window.BOOKS.hasOwnProperty(id)){var b=window.BOOKS[id];out.push({id:id,title:b.title,emoji:b.emoji,accent:b.accent,cover:b.cover,ext:b.ext,ready:b.ready!==false,order:b.order||999,series:b.series});}
  out.sort(function(a,b){return (a.order||999)-(b.order||999);});
  return out;
}
function bookMeta(id){var c=catalog(),i;for(i=0;i<c.length;i++)if(c[i].id===id)return c[i];var b=(window.BOOKS||{})[id];return b?{id:id,title:b.title,emoji:b.emoji,accent:b.accent,cover:b.cover,ext:b.ext,ready:b.ready!==false,series:b.series}:null;}
function extOf(id){var b=(window.BOOKS||{})[id];return (b&&b.ext)||(function(){var c=bookMeta(id);return (c&&c.ext)||"webp";})();}

/* активная книга (собирается loadBook) + словарь всплывашки */
var BOOK=null, CUR=null, GLOSS={};
function buildGloss(){GLOSS={};var i,j,p;for(i=0;i<BOOK.pages.length;i++){p=BOOK.pages[i];if(p.type==="gloss"){for(j=0;j<p.terms.length;j++)GLOSS[p.terms[j][0]]={word:p.terms[j][0],def:p.terms[j][1],img:p.terms[j][2]};}}}
/* книга-картинка из списка images (обложка идёт отдельно как cover) */
function photoPages(images,cover){var out=[],i,n=0;for(i=0;i<images.length;i++){if(images[i]===cover)continue;n++;out.push({type:"photo",ph:images[i],num:n,numc:(n%2?"teal":"lime")});}return out;}
/* собрать страницы: обложка + контент. По концу книги — возврат в папку (см.
   returnToFolder), отдельной страницы-каталога больше нет. */
/* Сдвиг разметки озвучки при вставке страницы-ролика на индекс vi.
   narrPages бывает массивом (путеводители/сказки) или объектом-по-индексу (малыши). */
function shiftNarrForVideo(np,vi){
  if(!np)return np;
  if(Array.isArray(np)){np=np.slice();np.splice(vi,0,null);return np;}
  var out={},k,n;for(k in np){if(np.hasOwnProperty(k)){n=parseInt(k,10);out[(n>=vi?n+1:n)]=np[k];}}return out;
}
function assemblePages(c){
  /* ролик (если есть) — отдельной страницей сразу после обложки */
  var head=c.video?[{type:"video",src:c.video}]:[];
  if(c.pages&&c.pages.length)return [{type:"cover"}].concat(head).concat(c.pages).concat([{type:"catalog"}]);
  if(c.images&&c.images.length)return [{type:"cover"}].concat(head).concat(photoPages(c.images,c.cover)).concat([{type:"catalog"}]);
  return [{type:"cover"},{type:"soon"},{type:"catalog"}];
}
function loadBook(id){
  var meta=bookMeta(id);if(!meta)return;
  CUR=id;
  var c=(window.BOOKS||{})[id];
  var ready=meta.ready!==false && c && ((c.pages&&c.pages.length)||(c.images&&c.images.length));
  if(ready){
    var nz=(window.NARR&&window.NARR[id])||null;
    var pages=assemblePages(c);
    /* озвучка размечена по контентным страницам; страница-ролик звука не имеет —
       сдвигаем индексы narrPages, чтобы они не разъехались */
    var npg=nz?nz.pages:null;
    if(npg){for(var vi=0;vi<pages.length;vi++){if(pages[vi].type==="video"){npg=shiftNarrForVideo(npg,vi);break;}}}
    BOOK={id:id,title:c.title||meta.title,emoji:c.emoji||meta.emoji,accent:c.accent||meta.accent||"teal",
      cover:c.cover||meta.cover,coverFull:!!c.coverFull,fit:c.fit||"",folder:c.folder||meta.folder||"",
      badge:c.badge||"",series:c.series||meta.series||"",author:c.author||"Образовариум",
      glossary:c.glossary||{},hasNarr:!!nz,narr:nz?nz.audio:null,narrPages:npg,pages:pages};
  }else{
    BOOK={id:id,title:meta.title,emoji:meta.emoji,accent:meta.accent||"teal",cover:meta.cover,coverFull:false,fit:"",
      folder:(c&&c.folder)||meta.folder||"",badge:(c&&c.badge)||"",
      series:meta.series||"",author:"Образовариум",glossary:{},hasNarr:false,narr:null,narrPages:null,
      pages:[{type:"cover"},{type:"soon"}]};
  }
  buildGloss();
  stopPlayback();R.playing=false;$("rd-play").textContent="▶";fullAudio=null;
  R.page=0;R.voiceId="marina";R.name="Диктор";R.clips={};R.videoStill=null;R.videoStillPage=-1;_preload={};
  ensureRefs();hideTurn();
  $("rd-export").style.display="none";
  renderCurrent();
}

/* ===== Стартовая «полка»: иконостас обложек всех готовых книг ===== */
function shelfCellHTML(b){
  var cv=(b.cover&&isKey(b.cover))?'<img src="'+assetSrcFor(b.id,b.cover)+'" alt="" data-emoji="'+b.emoji+'" onerror="catFb(this)">':'<span class="cat-emoji">'+b.emoji+'</span>';
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
function showShelf(){stopPlayback();R.playing=false;$("rd-play").textContent="▶";try{history.replaceState(null,"","#");}catch(e){}renderShelf();show("screen-shelf");}
function routeFromHash(){var id=(location.hash||"").replace(/^#/,"");if(id&&window.BOOKS&&window.BOOKS[id]){show("reader");loadBook(id);}else{renderShelf();show("screen-shelf");}}
/* по концу книги / по кнопке «домой» — вернуться в папку, откуда пришла книга
   (главное меню, вкладка «Книги», нужная папка) */
function returnToFolder(){stopPlayback();R.playing=false;var f=(BOOK&&BOOK.folder)||"";location.href="../index.html#books"+(f?("/"+f):"");}

function confettiSVG(){var cols=["#a9d6da","#c3d63b"],p="",i,x,y,c,r;for(i=0;i<16;i++){x=6+Math.random()*120;y=6+Math.random()*120;if(x+y>150)continue;c=cols[i%2];r=6+Math.random()*5;p+='<ellipse cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" rx="'+(r*0.6).toFixed(0)+'" ry="'+r.toFixed(0)+'" fill="'+c+'" transform="rotate(35 '+x.toFixed(0)+' '+y.toFixed(0)+')"/>';}return '<svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">'+p+'</svg>';}
function confettiBand(){var cols=["#a9d6da","#c3d63b"],p="",i,x,c,r,y;for(i=0;i<40;i++){x=Math.random()*300;y=4+Math.random()*30;c=cols[i%2];r=4+Math.random()*5;p+='<ellipse cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" rx="'+(r*0.6).toFixed(0)+'" ry="'+r.toFixed(0)+'" fill="'+c+'" transform="rotate(30 '+x.toFixed(0)+' '+y.toFixed(0)+')"/>';}return '<svg viewBox="0 0 300 42" preserveAspectRatio="none" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">'+p+'</svg>';}

function tokenize(text){var raw=text.split(" "),out=[],i,m,mm;for(i=0;i<raw.length;i++){m=/^([(«"]*)\*([^|*]+)\|([^*]+)\*([).,!?:;»"]*)$/.exec(raw[i]);if(m){out.push({pre:m[1],w:m[2],key:m[3],post:m[4],gl:true});}else{mm=/^([(«"]*)([\s\S]+?)([).,!?:;»"]*)$/.exec(raw[i]);out.push({pre:mm?mm[1]:"",w:mm?mm[2]:raw[i],post:mm?mm[3]:"",gl:false});}}return out;}
function plainSay(text){return text.replace(/\*([^|*]+)\|[^*]+\*/g,"$1");}

var DB=null;
function dbOpen(cb){var r=indexedDB.open("storyteller_proto",1);r.onupgradeneeded=function(e){var db=e.target.result;if(!db.objectStoreNames.contains("voices"))db.createObjectStore("voices",{keyPath:"key"});if(!db.objectStoreNames.contains("clips"))db.createObjectStore("clips",{keyPath:"key"});};r.onsuccess=function(e){DB=e.target.result;cb();};r.onerror=function(){alert("Не удалось открыть хранилище на этом устройстве.");};}
function dbPut(s,o,cb){var tx=DB.transaction(s,"readwrite");tx.objectStore(s).put(o);tx.oncomplete=function(){if(cb)cb();};tx.onerror=function(){alert("Не хватает места для сохранения голоса.");};}
function dbGet(s,k,cb){var r=DB.transaction(s,"readonly").objectStore(s).get(k);r.onsuccess=function(){cb(r.result||null);};}
function dbGetClips(b,v,cb){var p=b+"_"+v+"_",rg=IDBKeyRange.bound(p,p+"\uffff"),out={},c=DB.transaction("clips","readonly").objectStore("clips").openCursor(rg);c.onsuccess=function(e){var k=e.target.result;if(k){out[k.value.page]=k.value;k.continue();}else cb(out);};}
function dbDeleteVoice(b,v,cb){var tx=DB.transaction(["voices","clips"],"readwrite");tx.objectStore("voices").delete(b+"_"+v);var p=b+"_"+v+"_",rg=IDBKeyRange.bound(p,p+"\uffff"),c=tx.objectStore("clips").openCursor(rg);c.onsuccess=function(e){var k=e.target.result;if(k){k.delete();k.continue();}};tx.oncomplete=function(){if(cb)cb();};}

function idxKey(){return "st_voices_"+BOOK.id;}
function idxGet(){try{return JSON.parse(localStorage.getItem(idxKey())||"[]");}catch(e){return[];}}
function idxAdd(v){var a=idxGet();if(a.indexOf(v)<0){a.push(v);localStorage.setItem(idxKey(),JSON.stringify(a));}}
function idxRemove(v){var a=idxGet(),i=a.indexOf(v);if(i>=0){a.splice(i,1);localStorage.setItem(idxKey(),JSON.stringify(a));}}

function renderChips(){var box=$("voice-chips");box.innerHTML="";box.appendChild(makeChip("marina","Диктор",false));var ids=idxGet(),i;for(i=0;i<ids.length;i++)(function(v){dbGet("voices",BOOK.id+"_"+v,function(o){if(o)box.appendChild(makeChip(v,o.name,true));});})(ids[i]);}
function makeChip(vid,name,rm){var b=document.createElement("button");b.className="chip";b.appendChild(document.createTextNode((vid==="marina"?"🎧 ":"🎙 ")+name));if(rm){var x=document.createElement("span");x.className="x";x.textContent="✕";x.onclick=function(e){e.stopPropagation();if(confirm("Удалить «"+name+"»?"))dbDeleteVoice(BOOK.id,vid,function(){idxRemove(vid);renderChips();});};b.appendChild(x);}b.onclick=function(){$("menu").className="mask";selectVoice(vid,name);};return b;}

var R={voiceId:null,name:"",page:0,clips:{},playing:false,url:null,timer:null,audio:null,raf:null};
function pageNumDot(p,pos){return '<div class="num '+p.numc+' '+pos+'">'+p.num+'</div>';}
// Номер, напечатанный на самом слайде: num (малыши/сказки/большой) либо ph для путеводителей (зашит в картинку). Иначе — порядковый.
function pageNo(p,idx){if(p&&typeof p.num==="number")return p.num;if(p&&p.ph&&/^\d+$/.test(p.ph))return parseInt(p.ph,10);return idx;}
function isKey(v){return /^[0-9]{2,3}$/.test(""+v);}
function assetSrcFor(id,val){return id+"/"+val+"."+extOf(id);}
function imgFb(el){var g=el.getAttribute("data-g")||"g1",ph=el.getAttribute("data-ph")||"🖼";el.outerHTML='<div class="pic '+g+'"><span class="ph">'+ph+'</span></div>';}
function picHTML(g,val,pos){if(isKey(val)){var st=(pos?' style="object-position:'+pos+'"':'');return '<img class="pic-img" src="'+assetSrcFor(BOOK.id,val)+'"'+st+' alt="" data-g="'+(g||"g1")+'" data-ph="'+(BOOK.emoji||"🖼")+'" onerror="imgFb(this)">';}return '<div class="pic '+(g||"g1")+'"><span class="ph">'+(val||BOOK.emoji||"📖")+'</span></div>';}

function buildPageHTML(idx,still){
  var p=BOOK.pages[idx],html="",i;
  if(p.type==="cover"){
    if(BOOK.coverFull&&BOOK.cover&&isKey(BOOK.cover)){ /* обложка-арт целиком (путеводители) */
      return '<div class="p-photo">'+picHTML(null,BOOK.cover)+'</div>';
    }
    var subj=(BOOK.cover&&isKey(BOOK.cover))?'<img src="'+assetSrcFor(BOOK.id,BOOK.cover)+'" alt="" data-ph="'+(BOOK.emoji||"📖")+'" onerror="this.outerHTML=this.getAttribute(\'data-ph\')">':(BOOK.emoji||"📖");
    var badge=BOOK.badge?('<div class="cv-badge">'+BOOK.badge+'</div>'):'';
    html='<div class="p-cover acc-'+BOOK.accent+'"><div class="cv-title">'+BOOK.title+'</div><div class="cv-author">'+BOOK.author+'</div><div class="cv-subject">'+subj+'</div>'+badge+'<div class="cv-confetti">'+confettiBand()+'</div></div>';
    return html;
  }
  if(p.type==="catalog"){ /* «иконостас» серии: все книги этой папки/серии, тап — переключение */
    var c=catalog().filter(function(b){return (b.folder||"")===(BOOK.folder||"");});
    html='<div class="p-catalog"><h2>Все книги серии</h2><div class="cat-sub">'+(BOOK.series||"Образовариум")+'</div><div class="cat-grid">';
    for(i=0;i<c.length;i++){var b=c[i],me=(b.id===BOOK.id);
      var cv=(b.cover&&isKey(b.cover))?'<img src="'+assetSrcFor(b.id,b.cover)+'" alt="" data-emoji="'+b.emoji+'" onerror="catFb(this)">':'<span class="cat-emoji">'+b.emoji+'</span>';
      html+='<div class="cat-cell acc-'+(b.accent||"teal")+(me?' cur':'')+(b.ready!==false?'':' soon')+'" data-book="'+b.id+'">'
           +'<div class="cat-cover">'+cv+'</div>'
           +'<div class="cat-title">'+b.title+'</div>'
           +(me?'<div class="cat-tag here">сейчас</div>':(b.ready!==false?'':'<div class="cat-tag wait">скоро</div>'))
           +'</div>';
    }
    html+='</div></div>';
    return html;
  }
  if(p.type==="video"){ /* ролик во всю карточку. Во время перелистывания (still) — постер-картинка,
                           живой <video> только на «лежащей» странице (иначе клон ломает верстку) */
    var vp=BOOK.id+'/'+p.src, vpost=vp.replace(/\.mp4$/,".jpg");
    if(still){var ss=(R.videoStill&&R.videoStillPage===idx)?R.videoStill:vpost;return '<div class="p-photo"><img class="pic-img" src="'+ss+'" alt=""></div>';}
    /* постер — фоном контейнера, чтобы между переворотом и стартом не мелькал чёрный кадр */
    return '<div class="p-photo vbg" style="background-image:url(\''+vpost+'\')"><video class="endvid" src="'+vp+'" poster="'+vpost+'" playsinline webkit-playsinline preload="auto"></video></div>';
  }
  if(p.type==="soon"){
    html='<div class="p-soon acc-'+BOOK.accent+'"><div class="soon-emoji">'+(BOOK.emoji||"📖")+'</div><div class="cv-title">'+BOOK.title+'</div><p class="soon-text">Книга готовится.<br>Скоро появится.</p><div class="soon-hint">Полистай другие книги — последняя страница каталог.</div></div>';
    return html;
  }
  if(p.type==="text"){
    if(BOOK.fit==="contain"){ /* «книга-сказка»: горизонтальная сцена целиком + подпись снизу */
      html+='<div class="p-story"><div class="ps-img">'+picHTML(p.g,p.side,p.pos)+'</div>'
        +'<div class="ps-text">'+(p.ttl?'<div class="ttl">'+p.ttl+'</div>':'')
        +'<div class="body serif">'+buildWords(p.say)+'</div></div></div>';
    }else{
      html+='<div class="p-full">'+picHTML(p.g,p.side,p.pos)+'</div>';
      html+='<div class="p-textzone">';
      if(p.ttl)html+='<div class="ttl">'+p.ttl+'</div>';
      html+='<div class="body serif">'+buildWords(p.say)+'</div></div>';
      html+=pageNumDot(p,"tr");
    }
  }else if(p.type==="photo"){
    /* contain:true — показать картинку целиком (развороты больших книг), иначе во всю карточку */
    html='<div class="p-photo'+(p.contain?' contain':'')+'">'+picHTML(p.g,p.ph,p.pos)+'</div>'+(p.num?pageNumDot(p,"br"):"");
  }else if(p.type==="htext"){ /* путеводитель: картинка-арт + текст по зоне (номер/лента вшиты в арт) */
    html='<div class="p-htext">'+picHTML(p.g,p.ph,p.pos)+'</div>';
    if(p.zone==="D"){ html+='<div class="p-livet1 zDt">'+buildWords(p.say)+'</div><div class="p-livet1 zDb">'+buildWords(p.say2||"")+'</div>'; }
    else { var ts=p.ty?' style="top:'+p.ty+'"':"";html+='<div class="p-livet1 z'+(p.zone||"A")+'"'+ts+'>'+buildWords(p.say)+'</div>'; }
  }else if(p.type==="grid"){
    html+='<div class="confetti">'+confettiSVG()+'</div><div class="p-grid"><h2>'+p.title+'</h2><div class="grid2">';
    for(i=0;i<p.cells.length;i++)html+='<div class="gcell"><div class="gpic">'+picHTML(p.cells[i][2],p.cells[i][0])+'</div><div class="gcap">'+p.cells[i][1]+'</div></div>';
    html+='</div></div>'+pageNumDot(p,"bl");
  }else if(p.type==="gloss"){
    html+='<div class="p-gloss"><h2>'+p.title+'</h2><div class="gloss2">';
    for(var j=0;j<p.terms.length;j++)html+='<div class="gterm"><div class="gpic">'+picHTML(p.terms[j][3],p.terms[j][2])+'</div><div class="gw">'+p.terms[j][0]+'</div><div class="gd serif">'+p.terms[j][1]+'</div></div>';
    html+='</div></div>'+pageNumDot(p,"br");
  }
  return html;
}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function buildWords(say){var t=tokenize(say),out="",i,k;for(i=0;i<t.length;i++){k=t[i];if(k.pre)out+=esc(k.pre);out+='<span class="w'+(k.gl?" gl":"")+'"'+(k.gl?' data-key="'+esc(k.key)+'"':'')+'>'+esc(k.w)+'</span>';if(k.post)out+=esc(k.post);out+=" ";}return out;}

var STAGE=null,FLIP=null,TURN=null;
function ensureRefs(){if(!FLIP){STAGE=$("stage");FLIP=$("pg-flip");TURN=$("pg-turn");}}
function paintFlip(idx){FLIP.innerHTML=buildPageHTML(idx);}
function fullHTML(idx){return '<div class="full">'+buildPageHTML(idx,true)+'</div>';}
function hideTurn(){if(TURN){TURN.className="turn";TURN.innerHTML="";}if(FLIP)FLIP.style.visibility="";}
/* предзагрузка соседних страниц, чтобы при перевороте не мелькала пустая страница */
var _preload={};
function preloadURL(u){if(!u||_preload[u])return;var im=new Image();_preload[u]=im;im.src=u;if(im.decode){try{im.decode().catch(function(){});}catch(e){}}}
function pageImgKeys(p){
  if(!p)return [];
  if(p.type==="cover")return BOOK.cover?[BOOK.cover]:[];
  if(p.type==="photo"||p.type==="htext")return p.ph?[p.ph]:[];
  if(p.type==="text")return p.side?[p.side]:[];
  if(p.type==="grid")return (p.cells||[]).map(function(c){return c[0];});
  if(p.type==="gloss")return (p.terms||[]).map(function(t){return t[2];});
  return [];
}
function preloadNeighbors(){
  var rng=[R.page+1,R.page-1,R.page+2],i,k,keys;
  for(i=0;i<rng.length;i++){var idx=rng[i];if(idx<0||idx>=BOOK.pages.length)continue;
    keys=pageImgKeys(BOOK.pages[idx]);
    for(k=0;k<keys.length;k++){if(isKey(keys[k]))preloadURL(assetSrcFor(BOOK.id,keys[k]));}
  }
}
function renderCurrent(){
  paintFlip(R.page);FLIP.className="page rest";FLIP.style.transition="none";FLIP.style.transform="none";FLIP.style.transformOrigin="";FLIP.style.visibility="";
  var p=BOOK.pages[R.page],lbl;
  if(p.type==="cover")lbl="Обложка";
  else if(p.type==="catalog")lbl="Все книги";
  else if(p.type==="soon")lbl="Скоро";
  else if(p.type==="video")lbl="Это интересно!";
  else lbl="Страница "+pageNo(p,R.page)+" из "+pageNo(BOOK.pages[BOOK.pages.length-2],BOOK.pages.length-2);
  $("rd-pageno").textContent=lbl;
  $("rd-scrub").max=BOOK.pages.length-1;$("rd-scrub").value=R.page;
  if(p.type==="video"){ /* старт сразу: пробуем со звуком, если iOS не пускает — играем без звука (двигается),
                           один тап по ролику перезапускает со звуком с начала */
    var v=FLIP&&FLIP.querySelector("video");
    if(v){
      v.loop=false;v.muted=false;
      v.onended=function(){if(R.playing)pageEnded();};
      v.onclick=function(){try{v.pause();}catch(e){}v.muted=false;try{v.currentTime=0;}catch(e){}v.play();};
      var pr=v.play();if(pr&&pr.catch)pr.catch(function(){v.muted=true;var p2=v.play();if(p2&&p2.catch)p2.catch(function(){});});
    }
  }
  preloadNeighbors();
}
function wordSpans(){return FLIP.querySelectorAll(".w");}
function setBox(i){var ws=wordSpans(),k;for(k=0;k<ws.length;k++)ws[k].className=ws[k].className.replace(" box","");if(ws[i])ws[i].className+=" box";}

var fullAudio=null;
function catFb(el){el.outerHTML='<span class="cat-emoji">'+(el.getAttribute("data-emoji")||"📖")+'</span>';}
function ensureFullAudio(){if(!fullAudio&&BOOK.narr){fullAudio=new Audio(BOOK.narr);fullAudio.preload="auto";}}
function curWordIndex(words,t){var lo=0,i;for(i=0;i<words.length;i++){if(t>=words[i][0]&&t<words[i][1])return i;if(t>=words[i][1])lo=i;}return lo;}
function playNarr(np,ws){
  ensureFullAudio();if(!fullAudio){if(R.playing)R.timer=setTimeout(function(){if(R.playing)pageEnded();},2200);return;}
  var a=fullAudio,words=np.w||[];
  /* старт клипа стоит ровно на первом слове. Перемотка mp3 попадает чуть позже
     и «съедает» первый звук — стартуем на 0.12с раньше. Но не залезаем в звук
     предыдущей страницы (иначе слышен её хвост/вдох перед фразой). */
  var pre=0.12;
  var lo=(BOOK.narrPages&&R.page>0&&BOOK.narrPages[R.page-1])?BOOK.narrPages[R.page-1].e:0;
  function begin(){try{a.currentTime=Math.max(0,lo,np.s-pre);}catch(e){}var pr=a.play();if(pr&&pr.catch)pr.catch(function(){});loop();}
  function loop(){
    if(!R.playing)return;
    var t=a.currentTime;
    if(t>=np.e-0.03){a.pause();R.raf=null;narrEndDwell();return;}
    if(ws.length&&words.length){var i=curWordIndex(words,t);if(i>=0&&i<ws.length)setBox(i);}
    R.raf=requestAnimationFrame(loop);
  }
  if(a.readyState>=1)begin();
  else{var on=function(){a.removeEventListener("canplay",on);begin();};a.addEventListener("canplay",on);}
}
function playCurrent(){
  var p=BOOK.pages[R.page];
  if(p.type==="video"){ /* ролик после обложки — играем со звуком; в режиме плей по концу листаем дальше */
    var vd=FLIP&&FLIP.querySelector("video");
    if(vd){vd.loop=false;vd.muted=false;try{vd.currentTime=0;}catch(e){}vd.onended=function(){if(R.playing)pageEnded();};var pv=vd.play();if(pv&&pv.catch)pv.catch(function(){vd.muted=true;vd.play();});}
    return;
  }
  var hasText=(p.type==="text"||p.type==="htext"||p.type==="grid"||p.type==="gloss");
  var ws=hasText?wordSpans():[],n=ws.length;
  var ownClip=(R.voiceId!=="marina")?R.clips[R.page+1]:null;
  var np=(R.voiceId==="marina"&&BOOK.hasNarr&&BOOK.narrPages)?BOOK.narrPages[R.page]:null;
  if(np){playNarr(np,ws);return;}
  if(ownClip){
    R.url=URL.createObjectURL(ownClip.blob);R.audio=new Audio(R.url);
    R.audio.onended=function(){if(R.playing)pageEnded();};
    R.audio.addEventListener("loadedmetadata",function(){var d=ownClip.durMs||(isFinite(R.audio.duration)?R.audio.duration*1000:n*420);if(n)sweep(ws,n,d);});
    var pr=R.audio.play();if(pr&&pr.catch)pr.catch(function(){});return;
  }
  if(p.type==="text"&&n){sweep(ws,n,n*420,function(){if(R.playing)pageEnded();});return;}
  /* страница без звука (фото-разворот и т.п.) — держим дольше, чтобы успеть рассмотреть */
  var dwell=(p.type==="cover")?120:3000;R.timer=setTimeout(function(){if(R.playing)pageEnded();},dwell);
}
function sweep(ws,n,dur,done){var i=0;setBox(0);var step=Math.max(220,dur/Math.max(1,n));R.timer=setInterval(function(){i++;if(i>=n){clearInterval(R.timer);R.timer=null;if(done)done();return;}setBox(i);},step);}
function stopPlayback(){if(R.timer){clearInterval(R.timer);clearTimeout(R.timer);R.timer=null;}if(R.raf){cancelAnimationFrame(R.raf);R.raf=null;}if(fullAudio){fullAudio.pause();}if(R.audio){R.audio.pause();R.audio.onended=null;R.audio=null;}if(R.url){URL.revokeObjectURL(R.url);R.url=null;}if(FLIP){var ev=FLIP.querySelector("video");if(ev)ev.pause();}}
function pageEnded(){nextAuto();}
/* после озвучки: для путеводителя (htext) — пауза 2 сек, потом листаем */
/* пауза после озвучки страницы перед авто-листанием — даём ребёнку рассмотреть картинку */
function narrEndDwell(){R.timer=setTimeout(function(){R.timer=null;if(R.playing)pageEnded();},2800);}
function setPlaying(on){R.playing=on;$("rd-play").textContent=on?"⏸":"▶";if(on)playCurrent();else stopPlayback();}
function nextAuto(){if(R.page<BOOK.pages.length-1){turn(1,function(){if(R.playing)playCurrent();});}else setPlaying(false);}
$("rd-play").onclick=function(){setPlaying(!R.playing);};
$("rd-scrub").oninput=function(){var v=parseInt(this.value,10);if(v===R.page)return;stopPlayback();R.page=v;renderCurrent();};
$("rd-scrub").onchange=function(){if(R.playing)playCurrent();};
function selectVoice(vid,name){
  R.voiceId=vid;R.name=name;
  var exp=(vid!=="marina");$("rd-export").style.display=exp?"block":"none";
  setPlaying(false);
  if(vid==="marina"){R.clips={};renderCurrent();}
  else dbGetClips(BOOK.id,vid,function(c){R.clips=c;renderCurrent();});
}
function openMenu(){renderChips();$("menu").className="mask on";}
$("rd-voice").onclick=openMenu;
if($("rd-home"))$("rd-home").onclick=returnToFolder;
$("shelf-body").addEventListener("click",function(e){var cell=closestBook(e.target);if(cell){var bid=cell.getAttribute("data-book");if(bid)openBook(bid);}});
$("menu-close").onclick=function(){$("menu").className="mask";};

/* ===== переворот «как в книге»: корешок по центру, поворачивается только правый лист ===== */
var animating=false;
function reduceMotion(){return window.matchMedia&&window.matchMedia("(prefers-reduced-motion:reduce)").matches;}
function stageW(){return (STAGE&&STAGE.clientWidth)||320;}
function easeIO(x){return x<0.5?2*x*x:1-Math.pow(-2*x+2,2)/2;}
/* снимок текущего кадра видео перед переворотом: если ролик досмотрен/остановлен,
   на перевороте показываем именно этот кадр, а не первый (постер) */
function captureVideoStill(){
  if(!FLIP)return;
  var v=FLIP.querySelector("video");
  if(!v||!v.videoWidth||!v.videoHeight){return;}
  try{
    var cv=document.createElement("canvas");cv.width=v.videoWidth;cv.height=v.videoHeight;
    var ctx=cv.getContext("2d");if(!ctx)return;
    ctx.drawImage(v,0,0,cv.width,cv.height);
    R.videoStill=cv.toDataURL("image/jpeg",0.85);R.videoStillPage=R.page;
  }catch(e){R.videoStill=null;}
}
function buildTurn(lp,rp){
  captureVideoStill();
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
    if(R.page>=BOOK.pages.length-1){returnToFolder();return;}
    stopPlayback();
    if(reduceMotion()){R.page++;renderCurrent();if(cb)cb();return;}
    doForward(cb);
  }else{
    if(R.page<=0){bounce(-1);return;}
    stopPlayback();
    if(reduceMotion()){R.page--;renderCurrent();if(cb)cb();return;}
    doBackward(cb);
  }
}

/* ===== жесты: переворот следует за пальцем ===== */
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
      if(R.page>=BOOK.pages.length-1){endRes=true;FLIP.style.transformOrigin="left center";FLIP.style.transition="none";FLIP.style.transform="rotateY("+Math.max(-10,dx/stageW()*30)+"deg)";return;}
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
    /* свайп вперёд на последней странице = конец книги → возврат в папку */
    if(horiz&&dx<=-58&&R.page>=BOOK.pages.length-1){ returnToFolder(); return; }
    if(fwd){ if(R.playing)setPlaying(false); endForward(ang,(dx<=-stageW()*0.30||ang<=-100)); }
    else if(bwd){ if(R.playing)setPlaying(false); endBackward(ang,(dx>=stageW()*0.30||ang>=-80)); }
    else if(endRes){ FLIP.style.transition="transform .18s ease";FLIP.style.transform="rotateY(0deg)";setTimeout(function(){FLIP.style.transition="none";FLIP.style.transformOrigin="";},190); }
    else if(horiz&&dx>=58){ if(R.playing)setPlaying(false);turn(-1); }
    else if(horiz&&dx<=-58&&R.page<BOOK.pages.length-1){ if(R.playing)setPlaying(false);turn(1); }
  });
  $("stage").addEventListener("click",function(e){
    if(swallowClick){swallowClick=false;return;}
    var t=e.target;
    if(t&&(""+t.className).indexOf("gl")>=0){var k=t.getAttribute("data-key");if(k){var ge=BOOK.glossary[k],go=(ge&&typeof ge==="object")?ge:null;var g=GLOSS[k]||{word:k,def:go?(go.def||""):(ge||""),img:go?(go.img||null):null};openPop(g.word,g.def,g.img);return;}}
    var cell=closestBook(t);
    if(cell){var bid=cell.getAttribute("data-book");if(bid&&bid!==BOOK.id)openBook(bid);return;}
  });
})();
function closestBook(el){while(el&&el!==document){if(el.getAttribute&&el.getAttribute("data-book"))return el;el=el.parentNode;}return null;}

function openPop(word,def,img){$("pop-word").textContent=word;$("pop-def").textContent=def;var pe=$("pop-emoji");if(isKey(img)){pe.style.display="";pe.innerHTML='<img src="'+assetSrcFor(BOOK.id,img)+'" alt="" onerror="this.parentNode.style.display=\'none\'">';}else{pe.style.display="none";pe.innerHTML="";}$("pop").className="mask on";}
$("pop-ok").onclick=function(){$("pop").className="mask";};

var rec={page:0,stream:null,mr:null,chunks:[],pending:{},mime:"",url:null,t0:0};
function openRecordFlow(){rec.page=1;rec.pending={};paintRecord();show("screen-record");}
function paintRecord(){var p=BOOK.pages[rec.page];$("rec-art").innerHTML=picHTML(p.g||"g1",p.side||p.ph||BOOK.emoji);$("rec-text").textContent=(p.type==="text"||p.type==="htext")?plainSay(p.say):(p.title||"Страница без текста — можно сразу «Дальше».");$("rec-count").textContent=(rec.page+1)+" из "+BOOK.pages.length;resetRecButtons();if(rec.pending[rec.page+1])showRecorded();if(p.type!=="text"&&p.type!=="htext")$("rec-hint").textContent="На этой странице нет текста. Можно записать тишину или сразу «Дальше».";}
function resetRecButtons(){var t=$("btn-rectoggle");t.textContent="Записать";t.className="btn rec";$("rec-actions").style.display="none";$("btn-next").style.display="none";$("rec-audio").style.display="none";$("rec-hint").textContent="Прочитай страницу вслух. Нажми «Записать», в конце — «Стоп».";}
function showRecorded(){$("rec-actions").style.display="flex";$("btn-next").style.display="block";$("btn-next").textContent=(rec.page<BOOK.pages.length-1)?"Дальше ›":"Готово — назвать голос";$("rec-hint").textContent="Запись готова. Можно прослушать, перезаписать или дальше.";}
function pickMime(){var c=["audio/mp4","audio/aac","audio/webm;codecs=opus","audio/webm"];if(typeof MediaRecorder==="undefined")return null;for(var i=0;i<c.length;i++)if(MediaRecorder.isTypeSupported(c[i]))return c[i];return"";}
$("btn-rectoggle").onclick=function(){if(rec.mr&&rec.mr.state==="recording"){rec.mr.stop();return;}startRecording();};
function startRecording(){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){$("rec-hint").textContent="Это устройство не поддерживает запись в браузере.";return;}var mime=pickMime();if(mime===null){$("rec-hint").textContent="Запись недоступна на этом iOS. Нужна версия посвежее (или путь AudioContext).";return;}
  navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){rec.stream=stream;rec.chunks=[];var opts=mime?{mimeType:mime}:undefined;try{rec.mr=new MediaRecorder(stream,opts);}catch(e){rec.mr=new MediaRecorder(stream);}rec.mime=rec.mr.mimeType||mime||"audio/mp4";rec.mr.ondataavailable=function(e){if(e.data&&e.data.size)rec.chunks.push(e.data);};rec.mr.onstop=function(){var blob=new Blob(rec.chunks,{type:rec.mime});rec.pending[rec.page+1]={blob:blob,mime:rec.mime,durMs:Date.now()-rec.t0};stopStream();var t=$("btn-rectoggle");t.textContent="Записать заново";t.className="btn";showRecorded();};rec.t0=Date.now();rec.mr.start();setTimeout(function(){if(rec.mr&&rec.mr.state==="recording")rec.mr.stop();},90000);var t=$("btn-rectoggle");t.innerHTML='<span class="rec-dot"></span>Стоп';t.className="btn rec";$("rec-hint").textContent="Идёт запись… читай страницу. Нажми «Стоп».";}).catch(function(){$("rec-hint").textContent="Чтобы записать, разреши доступ к микрофону в настройках браузера.";});}
function stopStream(){if(rec.stream){var t=rec.stream.getTracks(),i;for(i=0;i<t.length;i++)t[i].stop();rec.stream=null;}}
$("btn-replay").onclick=function(){var c=rec.pending[rec.page+1];if(!c)return;var a=$("rec-audio");if(rec.url)URL.revokeObjectURL(rec.url);rec.url=URL.createObjectURL(c.blob);a.src=rec.url;a.style.display="block";a.play();};
$("btn-redo").onclick=function(){delete rec.pending[rec.page+1];resetRecButtons();};
$("btn-next").onclick=function(){if(rec.page<BOOK.pages.length-1){rec.page++;paintRecord();}else{show("screen-name");$("voice-name").value="";$("voice-name").focus();}};
$("rec-back").onclick=function(){stopStream();show("reader");};
$("btn-savecancel").onclick=function(){show("screen-record");};
$("btn-savevoice").onclick=function(){var name=($("voice-name").value||"Мой голос").trim(),voiceId="v"+Date.now();var nums=[],k;for(k in rec.pending)if(rec.pending.hasOwnProperty(k))nums.push(k);if(!nums.length){alert("Нет ни одной записанной страницы.");return;}dbPut("voices",{key:BOOK.id+"_"+voiceId,bookId:BOOK.id,voiceId:voiceId,name:name,pages:nums.length,createdAt:Date.now()},function(){var keys=nums.slice(),n=keys.length,done=0;(function w(){if(done>=n){idxAdd(voiceId);show("reader");selectVoice(voiceId,name);alert("Голос «"+name+"» сохранён.");return;}var pg=keys[done],c=rec.pending[pg];dbPut("clips",{key:BOOK.id+"_"+voiceId+"_"+pg,bookId:BOOK.id,voiceId:voiceId,page:parseInt(pg,10),mime:c.mime,durMs:c.durMs,blob:c.blob},function(){done++;w();});})();});};

var gateAns=0;
$("btn-record").onclick=function(){$("menu").className="mask";var a=2+Math.floor(Math.random()*7),b=2+Math.floor(Math.random()*7);gateAns=a*b;$("gate-q").textContent=a+" × "+b+" = ?";$("gate-a").value="";$("gate-err").textContent="";$("gate").className="mask on";$("gate-a").focus();};
$("gate-cancel").onclick=function(){$("gate").className="mask";};
$("gate-ok").onclick=function(){if(parseInt($("gate-a").value,10)===gateAns){$("gate").className="mask";openRecordFlow();}else $("gate-err").textContent="Не сходится. Попробуй ещё раз.";};

function blobToB64(b,cb){var r=new FileReader();r.onloadend=function(){var s=r.result;cb(s.substring(s.indexOf(",")+1));};r.readAsDataURL(b);}
function b64ToBlob(b,m){var bin=atob(b),l=bin.length,a=new Uint8Array(l),i;for(i=0;i<l;i++)a[i]=bin.charCodeAt(i);return new Blob([a],{type:m});}
function doExport(){var v=R.voiceId,name=R.name;if(v==="marina")return;dbGetClips(BOOK.id,v,function(clips){var pages=[],keys=[],k;for(k in clips)if(clips.hasOwnProperty(k))keys.push(k);var n=keys.length,done=0,mime="audio/mp4";(function enc(){if(done>=n){var pack={type:"storyteller-voice",bookId:BOOK.id,voiceId:v,name:name,mime:mime,pages:pages};var file=new Blob([JSON.stringify(pack)],{type:"application/json"}),fn="golos_"+BOOK.id+"_"+v+".json";try{if(navigator.canShare&&navigator.canShare({files:[new File([file],fn,{type:"application/json"})]})){navigator.share({files:[new File([file],fn,{type:"application/json"})],title:name}).catch(function(){dl(file,fn);});return;}}catch(e){}dl(file,fn);return;}var c=clips[keys[done]];mime=c.mime||mime;blobToB64(c.blob,function(b){pages.push({p:c.page,audio:b});done++;enc();});})();});}
function dl(blob,name){var u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(function(){URL.revokeObjectURL(u);},4000);}
$("rd-export").onclick=doExport;
$("btn-import").onclick=function(){$("file-import").click();};
$("file-import").onchange=function(){var f=this.files[0];if(!f)return;var r=new FileReader();r.onload=function(){var pack;try{pack=JSON.parse(r.result);}catch(e){alert("Не получилось прочитать файл голоса.");return;}if(!pack||pack.type!=="storyteller-voice"){alert("Это не файл голоса.");return;}if(pack.bookId!==BOOK.id){alert("Этот голос для другой книги. Открой сначала ту книгу.");return;}var v=pack.voiceId||("v"+Date.now());dbPut("voices",{key:BOOK.id+"_"+v,bookId:BOOK.id,voiceId:v,name:pack.name||"Подарок",pages:pack.pages.length,createdAt:Date.now()},function(){var arr=pack.pages,n=arr.length,done=0;(function w(){if(done>=n){idxAdd(v);renderChips();alert("Голос «"+(pack.name||"Подарок")+"» добавлен.");return;}var pg=arr[done];dbPut("clips",{key:BOOK.id+"_"+v+"_"+pg.p,bookId:BOOK.id,voiceId:v,page:pg.p,mime:pack.mime||"audio/mp4",durMs:0,blob:b64ToBlob(pg.audio,pack.mime||"audio/mp4")},function(){done++;w();});})();});};r.readAsText(f);this.value="";};

window.onhashchange=function(){if(!animating)routeFromHash();};
dbOpen(function(){ensureRefs();hideTurn();routeFromHash();});
