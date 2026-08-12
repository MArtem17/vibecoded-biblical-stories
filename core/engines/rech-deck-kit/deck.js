/* rech-deck-kit — общий движок колод серии «Речь» (ES5, офлайн, iOS WebKit).
   Колода подключается ДАННЫМИ, без правок движка:
     window.DECK_CONTENT — контент колоды (сгенерирован из content.json);
     window.DECK_CONFIG  — {title, subtitle, logo, cover?, startHint?}.
   Базовое поведение (Болталки): заставка (если есть cover) → иконостас
   3 колонки → карта крупно; переворот a/b — нажатием по самой карте,
   озвучка ▶ в строке слога; звуковые карты (type:"sounds") — сетка 2×2.
   Логопедические фишки (Бормоталки) включаются наличием полей в данных:
     group/color — цветная метка звука на плитке и карте + фильтр по группе;
     sound       — подсветка целевой буквы в чистоговорке цветом группы
                   + чип «Звук N» + фильтр точечно по звуку;
     group/color — режим «Повтори за диктором»: play → пауза → «твоя очередь». */
(function(){
'use strict';
var DATA=window.DECK_CONTENT||{cards:[]};
if(!DATA.cards)DATA.cards=[]; /* CVC-колода несёт families, не cards */
var CFG=window.DECK_CONFIG||{};
/* язык интерфейса: DECK_CONFIG.lang==='en' — английская линейка «Speech».
   Определяется ДО разметки — T() используется уже в заставке. */
var EN=(CFG.lang==='en');
function T(ru,en){return EN?en:ru;}

/* ── разметка приложения ── */
document.body.innerHTML=
  /* заставка: включается обложкой (cover) и/или приветствием (intro —
     играет по нажатию «Начать», жест снимает запрет автоплея) */
  ((CFG.cover||CFG.intro)?
  '<div class="splash" id="splash">'+
    (CFG.cover?'<img src="'+CFG.cover+'" alt="'+(CFG.title||'')+'">'
              :'<div class="semoji">'+(CFG.logo||'🗣️')+'</div><b class="stitle">'+(CFG.title||'')+'</b>')+
    '<button class="btn bstart" id="bstart">'+T('▶ Начать','▶ Start')+'</button>'+
    (CFG.startHint?'<div class="shint">'+CFG.startHint+'</div>':'')+
  '</div>':'')+
  '<div class="wrap">'+
    '<header>'+
      '<div class="logo">'+(CFG.logo||'🗣️')+'</div>'+
      '<div><b>'+(CFG.title||DATA.deck||'')+'</b><span>'+(CFG.subtitle||'')+'</span>'+
      '<span class="pcount" id="pcount"></span></div>'+
      (CFG.docHref?'<a class="plink" href="'+CFG.docHref+'" aria-label="Методичка">📖</a>':'')+
      (CFG.printHref?'<a class="plink'+(CFG.docHref?' plink2':'')+'" href="'+CFG.printHref+'" aria-label="Print view">🖨</a>':'')+
    '</header>'+
    '<div class="chips" id="chips" hidden></div>'+
    '<div class="grid" id="grid"></div>'+
  '</div>'+
  '<div class="modal" id="modal">'+
    '<div class="mwrap">'+
      '<div class="mtop">'+
        '<div class="mnum" id="mnum"></div>'+
        '<button class="btn bclose" id="bclose" aria-label="Close">✕</button>'+
      '</div>'+
      '<div id="mbody"></div>'+
    '</div>'+
  '</div>';

/* ── карты: 2 записи (стороны) → 1 карта ── */
var CARDS=[];
(function(){
  var byId={},order=[],i,c;
  for(i=0;i<DATA.cards.length;i++){
    c=DATA.cards[i];
    if(!byId[c.id]){byId[c.id]={id:c.id,type:c.type||'boltalka',sides:{}};order.push(c.id);}
    byId[c.id].sides[c.side]=c;
  }
  for(i=0;i<order.length;i++)CARDS.push(byId[order[i]]);
})();

/* слои движка включаются наличием полей в данных:
   group/color/sound → логопедический (Бормоталки),
   sounds (массив схемы) → звуковой разбор (Фонетика) */
var LOGOPED=false,HAS_SOUND=false,RAZBOR=false,SLOGI=false,ISTORII=false,FRAZY=false,
    AZBUKA=false,SLUH=!!DATA.sluh,CVC=!!DATA.cvc,SOUNDBOX=!!DATA.soundbox;
(function(){
  var i,c;
  for(i=0;i<DATA.cards.length;i++){
    c=DATA.cards[i];
    if(c.group&&c.color)LOGOPED=true;
    if(c.sound&&!DATA.sluh)HAS_SOUND=true;
    if(c.sounds&&c.sounds.length&&typeof c.sounds!=='string')RAZBOR=true;
    if(c.type==='letter'||c.type==='syllable')SLOGI=true;
    if(c.story&&c.frame)ISTORII=true;
    if(c.phrase&&c.words)FRAZY=true;
    if(c.letter&&c.mnemo)AZBUKA=true;
  }
  if(AZBUKA)SLOGI=false;
})();
/* цвета слогового режима */
var SL_BLUE='#4A7BC8',SL_RED='#E05B5B',SL_GREEN='#5BAE6B';
function sylHtml(cons,vowel){
  return '<span style="color:'+SL_BLUE+'">'+cons+'</span><span style="color:'+SL_RED+'">'+vowel+'</span>';
}
function diagMark(){
  return '<span class="dmark" style="background:linear-gradient(135deg,'+SL_BLUE+' 50%,'+SL_GREEN+' 50%)"></span>';
}

var grid=document.getElementById('grid');
var chips=document.getElementById('chips');
var modal=document.getElementById('modal');
var mbody=document.getElementById('mbody');
var mnum=document.getElementById('mnum');

/* ── микро-анимации (лёгкие, осмысленные; выключаются prefers-reduced-motion
   на уровне CSS). reduceMotion() — общий предохранитель для JS-эффектов. ── */
function reduceMotion(){
  try{return window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;}
  catch(e){return false;}
}
function flipMbody(){
  /* перезапуск анимации переворота: снять класс, форс-рефлоу, вернуть */
  mbody.className=mbody.className.replace(/ ?flipin/,'');
  void mbody.offsetWidth;
  mbody.className+=' flipin';
}
/* награда: звёздочки разлетаются из центра экрана */
function burst(){
  if(reduceMotion())return;
  var wrap=document.createElement('div');
  wrap.className='burst';
  var emo=['⭐','🎉','✨','🌟','💫'],n=12,i,ang,dist,sp;
  for(i=0;i<n;i++){
    ang=(Math.PI*2)*(i/n);
    dist=64+((i*29)%46);
    sp=document.createElement('span');
    sp.className='bp';
    sp.textContent=emo[i%emo.length];
    sp.style.setProperty('--dx',Math.round(Math.cos(ang)*dist)+'px');
    sp.style.setProperty('--dy',Math.round(Math.sin(ang)*dist)+'px');
    sp.style.animationDelay=(i*10)+'ms';
    wrap.appendChild(sp);
  }
  modal.appendChild(wrap);
  setTimeout(function(){if(wrap.parentNode)wrap.parentNode.removeChild(wrap);},1400);
}

/* ── аудио ── */
var player=new Audio();
var playingEl=null;
var onEnded=null; /* хук режима «повтори за диктором» */
function stopAudio(){
  try{player.pause();}catch(e){}
  onEnded=null;
  if(playingEl){playingEl.className=playingEl.className.replace(/ ?playing/,'');playingEl=null;}
}
player.addEventListener('ended',function(){
  if(playingEl){playingEl.className=playingEl.className.replace(/ ?playing/,'');playingEl=null;}
  if(onEnded){var f=onEnded;onEnded=null;f();}
});
var playRate=1; /* темп воспроизведения (Бормоталки: 🐢/▶/🚀) */
function playClip(src,el,ended){
  if(playingEl===el&&!ended){stopAudio();return;}
  stopAudio();
  player.src=src;
  try{player.playbackRate=playRate;}catch(e){}
  try{
    var pr=player.play();
    if(pr&&pr.catch)pr.catch(function(){}); /* нет файла/автоплей — молча */
  }catch(e){}
  playingEl=el;
  onEnded=ended||null;
  if(el)el.className+=' playing';
}

function pad(n){return n<10?'0'+n:''+n;}
function plural(n,one,few,many){
  var m10=n%10,m100=n%100;
  if(m10===1&&m100!==11)return one;
  if(m10>=2&&m10<=4&&(m100<10||m100>=20))return few;
  return many;
}

/* ── прогресс (localStorage, формат docs/progress.md: {"01":true,…}) ── */
var PKEY=CFG.progressKey||null;
var PROG={};
try{if(PKEY)PROG=JSON.parse(localStorage.getItem(PKEY)||'{}')||{};}catch(e){PROG={};}
function progSave(){try{if(PKEY)localStorage.setItem(PKEY,JSON.stringify(PROG));}catch(e){}}
function progTotal(){
  if(RAZBOR)return DATA.cards.length;
  if(CVC)return cvcWords().length;
  if(SOUNDBOX)return sbWords().length;
  return CARDS.length;
}
function progCount(){
  var n=0,k;
  for(k in PROG)if(PROG.hasOwnProperty(k)&&PROG[k])n++;
  return n;
}
function progHas(id){return !!PROG[pad(id)];}
function progMark(id){
  if(!PKEY)return;
  var k=pad(id);
  if(PROG[k])return;
  PROG[k]=true;
  progSave();
  progUI();
}
function progUI(){
  var el=document.getElementById('pcount');
  if(el&&PKEY)el.textContent=T('✓ пройдено ','✓ done ')+progCount()+T(' из ',' of ')+progTotal();
  /* галочки на плитках */
  var tiles=grid.getElementsByClassName('tile'),i,t,id;
  for(i=0;i<tiles.length;i++){
    t=tiles[i];
    id=t.getAttribute('data-pid');
    if(id===null)continue;
    var has=t.getElementsByClassName('donebadge').length;
    if(PROG[id]&&!has){
      var b=document.createElement('span');
      b.className='donebadge';b.textContent='✓';
      t.appendChild(b);
    }
  }
}
function tilePid(t,id){t.setAttribute('data-pid',pad(id));}
function digBadge(t){
  var b=document.createElement('span');
  b.className='digbadge';
  b.textContent='✨';
  b.title=T('только в приложении','app only');
  t.appendChild(b);
}
function progReset(){
  if(!window.confirm(T('Сбросить прогресс этой колоды?','Reset progress for this deck?')))return;
  PROG={};progSave();
  try{localStorage.removeItem(PKEY+'_words');}catch(e){}
  buildGrid();
}

/* ── подсветка целевой буквы (поле sound, цвет группы) ── */
function hlVerse(text,sound,color){
  if(!sound||!color)return text;
  /* многобуквенный звук (TH, NG) — подсветка подстроки без учёта регистра */
  if(sound.length>1){
    var low=text.toLowerCase(),sl=sound.toLowerCase(),o='',j=0,idx;
    while(j<text.length){
      idx=low.indexOf(sl,j);
      if(idx<0){o+=text.slice(j);break;}
      o+=text.slice(j,idx)+'<span class="hl" style="background:'+color+'">'+
         text.slice(idx,idx+sl.length)+'</span>';
      j=idx+sl.length;
    }
    return o;
  }
  var base=sound.charAt(0).toUpperCase(),out='',i,ch,seg;
  for(i=0;i<text.length;i++){
    ch=text.charAt(i);
    if(ch.toUpperCase()===base){
      seg=ch;
      /* прихватить знак ударения (комбинируемый акут) за буквой */
      if(text.charCodeAt(i+1)===0x0301){seg+=text.charAt(i+1);i++;}
      out+='<span class="hl" style="background:'+color+'">'+seg+'</span>';
    }else out+=ch;
  }
  return out;
}

/* ── фильтр по звуку/группе (поля group/color) ── */
var fGroup=null,fSound=null;
function sideMatches(s){
  if(!fGroup)return true;
  if(s.group!==fGroup)return false;
  if(fSound&&s.sound!==fSound)return false;
  return true;
}
function cardMatches(card){
  var k;
  for(k in card.sides)if(card.sides.hasOwnProperty(k)&&sideMatches(card.sides[k]))return true;
  return false;
}
function buildChips(){
  if(!LOGOPED)return;
  chips.hidden=false;
  var groups=DATA.sound_groups||{},colors=DATA.sound_colors||{};
  var order=[],seen={},i,c;
  for(i=0;i<DATA.cards.length;i++){
    c=DATA.cards[i];
    if(c.group&&!seen[c.group]){seen[c.group]=true;order.push(c.group);}
  }
  var html='<button class="chip'+(fGroup?'':' on')+'" data-g="">'+T('Все','All')+'</button>';
  for(i=0;i<order.length;i++){
    var g=order[i];
    html+='<button class="chip'+(fGroup===g?' on':'')+'" data-g="'+g+'">'+
      '<span class="dot" style="background:'+(colors[g]||'#fff')+'"></span>'+(groups[g]||g)+'</button>';
  }
  /* точечно по звуку — внутри выбранной группы */
  if(fGroup&&HAS_SOUND){
    var snds=[],sseen={};
    for(i=0;i<DATA.cards.length;i++){
      c=DATA.cards[i];
      if(c.group===fGroup&&c.sound&&!sseen[c.sound]){sseen[c.sound]=true;snds.push(c.sound);}
    }
    for(i=0;i<snds.length;i++)
      html+='<button class="chip'+(fSound===snds[i]?' on':'')+'" data-s="'+snds[i]+'">'+snds[i]+'</button>';
  }
  chips.innerHTML=html;
  chips.onclick=function(e){
    var t=(e&&e.target)||window.event.srcElement;
    while(t&&t!==chips&&t.nodeName!=='BUTTON')t=t.parentNode;
    if(!t||t===chips)return;
    if(t.getAttribute('data-s')!==null&&t.getAttribute('data-s')!==''){
      fSound=(fSound===t.getAttribute('data-s'))?null:t.getAttribute('data-s');
    }else{
      var g=t.getAttribute('data-g')||null;
      fGroup=(fGroup===g)?null:g;fSound=null;
    }
    buildChips();buildGrid();
  };
}

/* ── плитки-иконостас ── */
function makeTile(card){
  var t=document.createElement('button');
  t.className='tile';
  var a=card.sides.a||card.sides.b,html='',i;
  if(card.type==='sounds'){
    html='<div class="mini">';
    for(i=0;i<a.items.length;i++)html+='<img src="'+a.items[i].image+'" alt="" loading="lazy">';
    html+='</div><div class="cap">'+a.title+'</div>';
  }else{
    var dot=(LOGOPED&&a.color)?'<span class="dot" style="background:'+a.color+'"></span>':'';
    html='<img src="'+a.image+'" alt="" loading="lazy">'+
         '<div class="cap">'+dot+a.syllable+'</div>';
  }
  t.innerHTML=html;
  tilePid(t,card.id);
  if(a.digital)digBadge(t);
  t.onclick=function(){openCard(card);};
  return t;
}
function modeBtn(title,sub,fn){
  var b=document.createElement('button');
  b.className='ctorbtn';
  b.innerHTML=title+'<span>'+sub+'</span>';
  b.onclick=fn;
  return b;
}
/* «Дальше по серии» — карточка следующей коробки (конфиг nextDeck) */
function appendNext(){
  var nd=CFG.nextDeck;
  if(!nd)return;
  var a=document.createElement('a');
  a.className='nextcard';
  a.href=nd.href;
  a.innerHTML='<img src="'+nd.cover+'" alt="" loading="lazy">'+
    '<span><i>'+T('Дальше по серии «Речь»','Next in the Speech series')+'</i><b>'+nd.title+'</b><em>'+(nd.age||'')+'</em></span><u>›</u>';
  grid.appendChild(a);
}
function appendReset(){
  if(!PKEY)return;
  var b=document.createElement('button');
  b.className='resetbtn';
  b.textContent=T('Сбросить прогресс','Reset progress');
  b.onclick=progReset;
  grid.appendChild(b);
}
/* одноразовая подсказка первого запуска (для родителя/ребёнка) */
function onboard(){
  var K=(PKEY||CFG.title||'deck')+'_ob';
  try{if(localStorage.getItem(K))return;}catch(e){return;}
  try{localStorage.setItem(K,'1');}catch(e){}
  var el=document.createElement('div');
  el.className='onboard';
  el.innerHTML=T('👆 Нажми на любую карточку — послушай и повтори за диктором',
                 '👆 Tap any card — listen and say it after the narrator');
  document.body.appendChild(el);
  var killed=false;
  function kill(){
    if(killed)return;killed=true;
    el.className='onboard out';
    setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},320);
  }
  el.onclick=kill;
  document.addEventListener('click',function h(){document.removeEventListener('click',h,true);kill();},true);
  setTimeout(kill,5600);
}
function buildGrid(){
  grid.innerHTML='';
  var i;
  if(CVC)buildCvcGrid();
  else if(SOUNDBOX)buildSoundboxGrid();
  else if(AZBUKA)buildAzbukaGrid();
  else if(SLUH)buildSluhGrid();
  else if(FRAZY)buildFrazyGrid();
  else if(ISTORII)buildIstoriiGrid();
  else if(SLOGI)buildSlogiGrid();
  else if(RAZBOR)buildRazborGrid();
  else{
    if(LOGOPED){
      if(EN){
        var elt=DATA.skorogovorki?'tongue twister':'chant';
        grid.appendChild(modeBtn('🎧 Listen through','the '+elt+'s one after another (respects the filter)',openListenAll));
        grid.appendChild(modeBtn('🎤 Concert','5 '+elt+'s in a row — perform!',openConcert));
      }else{
        /* термин логопед-режима: чистоговорки (Бормоталки) или скороговорки */
        var lt=DATA.skorogovorki?'скороговор':'чистоговор';
        grid.appendChild(modeBtn('🎧 Слушать подряд',lt+'ки одна за другой (с учётом фильтра)',openListenAll));
        grid.appendChild(modeBtn('🎤 Концерт','5 '+lt+'ок подряд — выступай!',openConcert));
      }
    }
    else{
      grid.appendChild(modeBtn(T('🎧 Слушать подряд','🎧 Listen through'),T('все карты одна за другой','every card one after another'),openListenAll));
      if(soundPairs().length)
        grid.appendChild(modeBtn(T('🔔 Что ещё так звучит?','🔔 What else sounds like this?'),T('найди пару звуку!','find the matching sound!'),openEcho));
      if(sfxItems().length>=4)
        grid.appendChild(modeBtn(T('🎵 Угадай звук','🎵 Guess the sound'),T('настоящие звуки предметов!','real sounds of real things!'),openGuess));
    }
    var hasDigB=false;
    for(i=0;i<CARDS.length;i++){
      var da=CARDS[i].sides.a||CARDS[i].sides.b;
      if(da&&da.digital){hasDigB=true;continue;}
      if(cardMatches(CARDS[i]))grid.appendChild(makeTile(CARDS[i]));
    }
    if(hasDigB){
      var anyDig=false,j;
      for(j=0;j<CARDS.length;j++){
        var db=CARDS[j].sides.a||CARDS[j].sides.b;
        if(db&&db.digital&&cardMatches(CARDS[j]))anyDig=true;
      }
      if(anyDig){
        grid.appendChild(slogiHead(T('✨ Ещё в приложении','✨ More in the app')));
        for(j=0;j<CARDS.length;j++){
          var dc=CARDS[j].sides.a||CARDS[j].sides.b;
          if(dc&&dc.digital&&cardMatches(CARDS[j]))grid.appendChild(makeTile(CARDS[j]));
        }
      }
    }
  }
  appendNext();
  appendReset();
  progUI();
}

/* ── «Слушать подряд» (Болталки/Бормоталки): карусель всех сторон;
   у Бормоталок уважает активный фильтр по звуку ── */
function openListenAll(){
  var q=[],i,c;
  for(i=0;i<CARDS.length;i++){
    c=CARDS[i];
    if(c.type==='sounds'||!cardMatches(c))continue;
    if(c.sides.a&&sideMatches(c.sides.a))q.push([c,'a']);
    if(c.sides.b&&sideMatches(c.sides.b))q.push([c,'b']);
  }
  var qi=0;
  function step(){
    if(qi>=q.length){closeCard();return;}
    var it=q[qi++];
    curCard=it[0];curSide=it[1];
    renderSide();
    modal.scrollTop=0;
    progMark(curCard.id);
    var bp=document.getElementById('bplay');
    playClip(curCard.sides[curSide].audio,bp,function(){setTimeout(step,700);});
  }
  step();
  modal.className='modal on';
}

/* ── общая карусель «Слушать подряд» (Слоги/Истории/Фонетика):
   item = {html, audio, mark} — тело модалки, клип, id для прогресса;
   start — с какого элемента начать (выбор истории в openStoryPicker) ── */
function openPlaylist(title,items,start){
  curCard=null;
  stopAudio();
  var qi=start||0;
  function step(){
    kqStop();
    if(qi>=items.length){closeCard();return;}
    var it=items[qi++];
    mnum.textContent=title+' · '+qi+T(' из ',' of ')+items.length;
    mbody.innerHTML=it.html+
      (it.kar?'<div class="kq" id="plkq"></div>':'')+
      '<div class="brow"><button class="btn brepeat" id="bplnext">'+
      (qi<items.length?T('Дальше ›','Next ›'):T('Готово!','Done!'))+'</button></div>';
    modal.scrollTop=0;
    if(it.mark!=null)progMark(it.mark);
    document.getElementById('bplnext').onclick=function(){step();};
    if(it.kar)kqMount(document.getElementById('plkq'),it.kar,it.audio);
    playClip(it.audio,null,function(){setTimeout(step,700);});
  }
  step();
  modal.className='modal on';
}

/* ── караоке рассказа: авторский текст, бегущая подсветка слова по
   player.currentTime; тайминги — поле karaoke рассказа в content.json
   (пословный ASR, см. tools/python/gen_story_karaoke.py) ── */
var kqRaf=0;
function kqStop(){if(kqRaf){cancelAnimationFrame(kqRaf);kqRaf=0;}}
function kqMount(box,kar,src){
  if(!box||!kar||!kar.length)return;
  kqStop();
  var i,h='';
  for(i=0;i<kar.length;i++)h+='<span class="kw">'+kar[i][1]+'</span> ';
  box.innerHTML=h;
  var spans=box.getElementsByClassName('kw'),cur=-2;
  function tick(){
    var mine=player.src&&player.src.indexOf(src)!==-1;
    var t=(mine&&!player.paused&&!player.ended)?player.currentTime:-1,k=-1,j;
    for(j=0;j<kar.length;j++){if(kar[j][0]<=t)k=j;else break;}
    if(k!==cur){
      for(j=0;j<spans.length;j++)spans[j].className=(j===k)?'kw on':'kw';
      cur=k;
    }
    kqRaf=requestAnimationFrame(tick);
  }
  kqRaf=requestAnimationFrame(tick);
}

/* ── выбор истории перед прослушиванием: сначала список плиток,
   нажатая история открывает openPlaylist с этого места ── */
function openStoryPicker(title,items){
  curCard=null;
  stopAudio();
  mnum.textContent=title;
  mbody.innerHTML=
    '<div class="hint">'+T('Нажми историю, которую хочешь послушать, — дальше они пойдут по порядку.','Tap the story you want to hear — the rest will follow in order.')+'</div>'+
    '<div class="brow"><button class="btn brepeat" id="bplall">'+T('▶ Все подряд','▶ Play all')+'</button></div>'+
    '<div class="plpick" id="plpick"></div>';
  document.getElementById('bplall').onclick=function(){openPlaylist(title,items,0);};
  var box=document.getElementById('plpick'),i;
  for(i=0;i<items.length;i++)(function(i){
    var it=items[i];
    var b=document.createElement('button');
    b.className='plpbtn';
    b.innerHTML=(it.pickImage?'<img src="'+it.pickImage+'" alt="" loading="lazy">':'')+
      '<span class="cap"><span class="dot" style="background:'+(it.pickColor||'#000')+'"></span>'+(it.pickTitle||'')+'</span>';
    b.onclick=function(){openPlaylist(title,items,i);};
    box.appendChild(b);
  })(i);
  modal.scrollTop=0;
  modal.className='modal on';
}

/* ── «Что ещё так звучит?» (Болталки): пары звукоподражаний ── */
function soundItems(){
  var out=[],i,j,c;
  for(i=0;i<DATA.cards.length;i++){
    c=DATA.cards[i];
    if(c.type!=='sounds')continue;
    for(j=0;j<c.items.length;j++)
      out.push({label:c.items[j].label,image:c.items[j].image,audio:c.items[j].audio,cid:c.id});
  }
  return out;
}
function soundPairs(){
  var items=soundItems(),map={},i,k,out=[];
  for(i=0;i<items.length;i++)
    (map[items[i].label]=map[items[i].label]||[]).push(items[i]);
  for(k in map)if(map.hasOwnProperty(k)&&map[k].length>=2)out.push(map[k]);
  return out;
}
function openEcho(){
  curCard=null;
  stopAudio();
  mnum.textContent=T('Что ещё так звучит?','What else sounds like this?');
  var pairs=shuffle(soundPairs().slice()),pi=0;
  var all=soundItems();
  function round(){
    stopAudio();
    var pair=shuffle(pairs[pi].slice());
    var target=pair[0],i;
    var opts=[pair[1]],cand=shuffle(all.slice());
    for(i=0;i<cand.length&&opts.length<4;i++)
      if(cand[i].label!==target.label)opts.push(cand[i]);
    opts=shuffle(opts);
    mbody.innerHTML='<div class="ctorhead">'+T('Так звучит: ','This is the sound: ')+'<b>'+target.label+'</b></div>'+
      '<div class="echorow"><img class="echopic" src="'+target.image+'" alt="">'+
      '<button class="btn bplay" id="bplay" aria-label="Слушай">▶</button></div>'+
      '<div class="hint">'+T('Что ЕЩЁ звучит так же? Нажми картинку!','What ELSE makes this sound? Tap the picture!')+'</div>'+
      '<div class="sgrid" id="egrid"></div>'+
      '<div class="fzresult" id="eres"></div>'+
      '<div class="brow" id="enext" hidden><button class="btn brepeat" id="bnexte">'+T('Дальше!','Next!')+'</button></div>';
    var bp=document.getElementById('bplay');
    bp.onclick=function(){playClip(target.audio,bp);};
    playClip(target.audio,bp);
    var eg=document.getElementById('egrid');
    for(i=0;i<opts.length;i++){
      (function(o){
        var cell=document.createElement('button');
        cell.className='scell';
        cell.innerHTML='<img src="'+o.image+'" alt=""><div class="lab">?</div>';
        cell.onclick=function(){
          if(o.label===target.label){
            cell.getElementsByClassName('lab')[0].textContent=o.label;
            document.getElementById('eres').textContent=T('Верно! '+target.label+' — и то и другое!','Right! '+target.label+' — both of them!');
            document.getElementById('enext').hidden=false;
            progMark(o.cid);progMark(target.cid);
            playClip(o.audio,cell);
          }else{
            document.getElementById('eres').textContent=T('Послушай ещё раз — и попробуй снова!','Listen again — and have another go!');
          }
        };
        eg.appendChild(cell);
      })(opts[i]);
    }
    document.getElementById('bnexte').onclick=function(){
      pi++;
      if(pi>=pairs.length)fin();else round();
      modal.scrollTop=0;
    };
  }
  function fin(){
    stopAudio();
    mbody.innerHTML='<div class="ctorhead">'+T('🎉 Ты нашёл все пары звуков!','🎉 You found every sound pair!')+'</div>'+
      '<div class="brow"><button class="btn brepeat" id="bagain">'+T('Ещё раз!','Again!')+'</button></div>';
    burst();
    document.getElementById('bagain').onclick=function(){pi=0;shuffle(pairs);round();};
  }
  round();
  modal.className='modal on';
  modal.scrollTop=0;
}

/* ── «Угадай звук» (Болталки): НАСТОЯЩИЙ звук предмета → найди картинку.
   Включается наличием поля sfx у items звуковых карт ── */
function sfxItems(){
  var out=[],i,j,c,it;
  for(i=0;i<DATA.cards.length;i++){
    c=DATA.cards[i];
    if(c.type!=='sounds')continue;
    for(j=0;j<c.items.length;j++){
      it=c.items[j];
      if(it.sfx)out.push({label:it.label,image:it.image,audio:it.audio,sfx:it.sfx,cid:c.id});
    }
  }
  return out;
}
function openGuess(){
  curCard=null;
  stopAudio();
  mnum.textContent=T('Угадай звук','Guess the sound');
  var pool=shuffle(sfxItems().slice()),gi=0,score=0;
  var ROUNDS=Math.min(10,pool.length);
  function round(){
    stopAudio();
    var target=pool[gi];
    var opts=[target],cand=shuffle(sfxItems()),i;
    for(i=0;i<cand.length&&opts.length<4;i++)
      if(cand[i].label!==target.label&&cand[i].image!==target.image)opts.push(cand[i]);
    opts=shuffle(opts);
    mbody.innerHTML='<div class="ctorhead">'+T('Звук ','Sound ')+(gi+1)+T(' из ',' of ')+ROUNDS+'</div>'+
      '<div class="brow"><button class="btn brepeat" id="bplaysfx">'+T('🔊 Слушай звук!','🔊 Hear the sound!')+'</button></div>'+
      '<div class="hint">'+T('Что так звучит по-настоящему? Нажми картинку!','What really makes this sound? Tap the picture!')+'</div>'+
      '<div class="sgrid" id="ggrid"></div>'+
      '<div class="fzresult" id="gres"></div>'+
      '<div class="brow" id="gnext" hidden><button class="btn brepeat" id="bnextg">'+T('Дальше!','Next!')+'</button></div>';
    var bp=document.getElementById('bplaysfx');
    bp.onclick=function(){playClip(target.sfx,bp);};
    playClip(target.sfx,bp);
    var gg=document.getElementById('ggrid');
    var solved=false;
    for(i=0;i<opts.length;i++){
      (function(o){
        var cell=document.createElement('button');
        cell.className='scell';
        cell.innerHTML='<img src="'+o.image+'" alt=""><div class="lab">?</div>';
        cell.onclick=function(){
          if(o.image===target.image){
            if(!solved){solved=true;score++;}
            cell.getElementsByClassName('lab')[0].textContent=o.label;
            document.getElementById('gres').textContent=T('Верно! Это ','Right! It goes ')+target.label+'!';
            document.getElementById('gnext').hidden=false;
            progMark(target.cid);
            playClip(target.audio,cell); /* награда — голос диктора */
          }else{
            document.getElementById('gres').textContent=T('Не то! Нажми 🔊 и послушай ещё раз.','Not this one! Tap 🔊 and listen again.');
          }
        };
        gg.appendChild(cell);
      })(opts[i]);
    }
    document.getElementById('bnextg').onclick=function(){
      gi++;
      if(gi>=ROUNDS)fin();else round();
      modal.scrollTop=0;
    };
  }
  function fin(){
    stopAudio();
    mbody.innerHTML='<div class="ctorhead">'+T('🎉 Ты угадал '+score+' из '+ROUNDS+' звуков!','🎉 You guessed '+score+' of '+ROUNDS+' sounds!')+'</div>'+
      '<div class="brow"><button class="btn brepeat" id="bagain">'+T('Ещё раз!','Again!')+'</button></div>';
    burst();
    document.getElementById('bagain').onclick=openGuess;
  }
  round();
  modal.className='modal on';
  modal.scrollTop=0;
}

/* ── темп чистоговорки: черепаха → обычно → ракета (playbackRate) ── */
var TEMPOS=[[0.7,T('🐢 медленно','🐢 slow')],[1,T('▶ обычно','▶ normal')],[1.4,T('🚀 быстро','🚀 fast')]];
function tempoRowHtml(){
  var h='<div class="temporow">',i;
  for(i=0;i<TEMPOS.length;i++)
    h+='<button class="tempo'+(playRate===TEMPOS[i][0]?' on':'')+'" data-r="'+TEMPOS[i][0]+'">'+TEMPOS[i][1]+'</button>';
  return h+'</div>';
}
function bindTempoRow(){
  var row=mbody.getElementsByClassName('temporow')[0];
  if(!row)return;
  var btns=row.getElementsByTagName('button'),i;
  for(i=0;i<btns.length;i++){
    (function(b){
      b.onclick=function(){
        playRate=parseFloat(b.getAttribute('data-r'))||1;
        try{player.playbackRate=playRate;}catch(e){}
        var k;
        for(k=0;k<btns.length;k++)btns[k].className='tempo';
        b.className='tempo on';
      };
    })(btns[i]);
  }
}

/* ── «Концерт» (Бормоталки): 5 случайных чистоговорок текущего фильтра ── */
function openConcert(){
  curCard=null;
  stopAudio();
  mnum.textContent=T('Концерт','Concert');
  var pool=[],i,c,k,s;
  for(i=0;i<CARDS.length;i++){
    c=CARDS[i];
    for(k in c.sides)if(c.sides.hasOwnProperty(k)){
      s=c.sides[k];
      if(sideMatches(s))pool.push({s:s,id:c.id});
    }
  }
  pool=shuffle(pool).slice(0,5);
  var ci=0;
  function step(){
    stopAudio();
    if(ci>=pool.length){
      mbody.innerHTML='<div class="ctorhead">'+T('🎉 Ты выступил! Концерт окончен!','🎉 You performed! The concert is over!')+'</div>'+
        '<div class="brow"><button class="btn brepeat" id="bagain">'+T('Ещё концерт!','Another concert!')+'</button></div>';
      burst();
      document.getElementById('bagain').onclick=openConcert;
      return;
    }
    var it=pool[ci],s=it.s;
    mbody.innerHTML='<div class="ctorhead">'+T('Номер ','Act ')+(ci+1)+T(' из ',' of ')+pool.length+'</div>'+
      (s.sound&&s.color?'<span class="soundtag" style="background:'+s.color+'">'+T('Звук ','Sound ')+s.sound+'</span>':'')+
      '<div class="syrow"><span class="syll">'+s.syllable+'</span>'+
      '<button class="btn bplay" id="bplay" aria-label="Слушай">▶</button></div>'+
      tempoRowHtml()+
      '<img class="pic" src="'+s.image+'" alt="">'+
      '<div class="verse">'+hlVerse(s.verse,s.sound,s.color)+'</div>'+
      '<div class="turn" id="turn">'+T('🗣 Твоя очередь!','🗣 Your turn!')+'</div>'+
      '<div class="brow" id="cnn" hidden><button class="btn brepeat" id="bnextc">'+T('Дальше!','Next!')+'</button></div>';
    bindTempoRow();
    var bp=document.getElementById('bplay');
    function go(){
      document.getElementById('turn').className='turn';
      playClip(s.audio,bp,function(){
        var t=document.getElementById('turn');
        if(t)t.className='turn on';
        var nn=document.getElementById('cnn');
        if(nn)nn.hidden=false;
      });
    }
    bp.onclick=go;
    go();
    progMark(it.id);
    document.getElementById('bnextc').onclick=function(){ci++;step();modal.scrollTop=0;};
  }
  step();
  modal.className='modal on';
  modal.scrollTop=0;
}

/* ── «Прочитай сам» (Слоги): слог без звука → проверка озвучкой ── */
function openReadSelf(){
  curCard=null;
  stopAudio();
  mnum.textContent='Прочитай сам';
  var sylls=[],i,c;
  for(i=0;i<DATA.cards.length;i++){
    c=DATA.cards[i];
    if(c.type==='syllable')sylls.push(c);
  }
  sylls=shuffle(sylls.slice());
  var si=0;
  function step(){
    stopAudio();
    var s=sylls[si%sylls.length];
    mbody.innerHTML='<div class="ctorhead">Прочитай вслух — потом проверь себя!</div>'+
      '<div class="sylcard"><b>'+sylHtml(s.cons,s.vowel)+'</b></div>'+
      '<div class="brow"><button class="btn brepeat" id="bcheckme">▶ Проверить себя</button>'+
      '<button class="btn brepeat" id="bnextr">Ещё слог</button></div>';
    var bc=document.getElementById('bcheckme');
    bc.onclick=function(){playClip(s.audio,bc);progMark(s.id);};
    document.getElementById('bnextr').onclick=function(){si++;step();};
  }
  step();
  modal.className='modal on';
  modal.scrollTop=0;
}

/* ── слоговый конструктор («Читаем по слогам»): разделы + конструктор ── */
function slogiHead(t){
  var h=document.createElement('div');
  h.className='lvlhead';h.textContent=t;
  return h;
}
function letterHtml(s){
  var col=(s.color&&s.color.charAt(0)==='#')?s.color:'#000';
  return '<span style="color:'+col+'">'+s.letter+'</span>'+
         (s.color==='diagonal_blue_green'?diagMark():'');
}
/* ── «Спой склады»: складовая таблица + пропевание рядов (принцип Зайцева:
   читаем/поём складами, а не буквами; ряд согласного пропевается по гласным) ── */
function openWarehouses(){
  curCard=null; stopAudio();
  var VORD=['А','О','У','Ы','Э','И','Е','Я','Ё','Ю'];
  var i,c,consOrder=[],rows={},vset={};
  for(i=0;i<DATA.cards.length;i++){
    c=DATA.cards[i];
    if(c.type!=='syllable')continue;
    if(!rows[c.cons]){rows[c.cons]={};consOrder.push(c.cons);}
    rows[c.cons][c.vowel]=c.audio; vset[c.vowel]=1;
  }
  if(!consOrder.length)return;
  var vcols=[]; for(i=0;i<VORD.length;i++)if(vset[VORD[i]])vcols.push(VORD[i]);
  mnum.textContent=T('Спой склады','Sing the warehouses');
  mbody.innerHTML=
    '<div class="hint">'+T('Нажми ▶ у ряда — склады пропоются по порядку. Пой вместе с диктором! Или нажми любой склад.','Tap ▶ on a row — the warehouses sing in order. Sing along! Or tap any warehouse.')+'</div>'+
    '<div class="brow"><button class="btn brepeat" id="whall">'+T('▶ Спеть всю таблицу','▶ Sing the whole table')+'</button></div>'+
    '<div class="whwrap"><div class="whtable" id="whtable"></div></div>';
  var tbl=document.getElementById('whtable');
  var hr=document.createElement('div'); hr.className='whrow whhead';
  var corner=document.createElement('span'); corner.className='whplay corner'; hr.appendChild(corner);
  for(i=0;i<vcols.length;i++){
    var vc=document.createElement('span'); vc.className='whcell head';
    vc.innerHTML='<span style="color:'+SL_RED+'">'+vcols[i]+'</span>';
    hr.appendChild(vc);
  }
  tbl.appendChild(hr);
  function singSeq(cells,done){
    var k=0;
    (function step(){
      if(k>=cells.length){if(done)done();return;}
      var cell=cells[k++];
      playClip(cell.audio,cell.el,function(){setTimeout(step,200);});
    })();
  }
  var rowEls=[];
  for(var ci=0;ci<consOrder.length;ci++){
    (function(cons){
      var r=document.createElement('div'); r.className='whrow';
      var pb=document.createElement('button'); pb.className='whplay'; pb.textContent='▶';
      r.appendChild(pb);
      var cells=[],vi,v,au;
      for(vi=0;vi<vcols.length;vi++){
        v=vcols[vi]; au=rows[cons][v];
        if(au){
          var cell=document.createElement('button'); cell.className='whcell';
          cell.innerHTML=sylHtml(cons,v);
          (function(au,cell){cell.onclick=function(){playClip(au,cell);};})(au,cell);
          r.appendChild(cell); cells.push({el:cell,audio:au});
        } else {
          var e=document.createElement('span'); e.className='whcell empty'; r.appendChild(e);
        }
      }
      pb.onclick=function(){singSeq(cells);};
      tbl.appendChild(r);
      rowEls.push(cells);
    })(consOrder[ci]);
  }
  document.getElementById('whall').onclick=function(){
    var ri=0;
    (function nextRow(){
      if(ri>=rowEls.length)return;
      singSeq(rowEls[ri++],function(){setTimeout(nextRow,320);});
    })();
  };
  modal.className='modal on'; modal.scrollTop=0;
}
function buildSlogiGrid(){
  var i,c,t;
  /* конструктор слов — вход-плитка на всю ширину */
  var cw=(DATA.constructor_words||[]).length;
  if(cw){
    var b=document.createElement('button');
    b.className='ctorbtn';
    b.innerHTML='🧱 Конструктор слов<span>собери из слогов — '+cw+' '+plural(cw,'слово','слова','слов')+'!</span>';
    b.onclick=openConstructor;
    grid.appendChild(b);
  }
  grid.appendChild(modeBtn('📖 Прочитай сам','слог без подсказки — проверь себя озвучкой',openReadSelf));
  grid.appendChild(modeBtn('🎧 Слоговый диктант','услышь слог — найди его среди написанных',openDictant));
  grid.appendChild(modeBtn('🎵 Спой склады','складовая таблица — пой склады рядами, как по нотам',openWarehouses));
  grid.appendChild(modeBtn('🎧 Слушать подряд','буквы, слоги и слова одной лентой',openSlogiPlaylist));
  grid.appendChild(slogiHead('Буквы'));
  for(i=0;i<CARDS.length;i++){
    c=CARDS[i];
    if(c.type!=='letter')continue;
    t=document.createElement('button');
    t.className='tile';
    t.innerHTML='<img src="'+c.sides.a.image+'" alt="" loading="lazy">'+
      '<div class="cap">'+letterHtml(c.sides.a)+' · '+letterHtml(c.sides.b)+'</div>';
    tilePid(t,c.id);
    (function(c){t.onclick=function(){openCard(c);};})(c);
    grid.appendChild(t);
  }
  grid.appendChild(slogiHead('Слоги'));
  for(i=0;i<CARDS.length;i++){
    c=CARDS[i];
    if(c.type!=='syllable'||c.sides.a.digital)continue;
    t=document.createElement('button');
    t.className='tile';
    t.innerHTML='<div class="wordface"><b>'+sylHtml(c.sides.a.cons,c.sides.a.vowel)+'</b>'+
      '<span>'+sylHtml(c.sides.b.cons,c.sides.b.vowel)+' на обороте</span></div>';
    tilePid(t,c.id);
    (function(c){t.onclick=function(){openCard(c);};})(c);
    grid.appendChild(t);
  }
  grid.appendChild(slogiHead('Слова'));
  for(i=0;i<CARDS.length;i++){
    c=CARDS[i];
    if(c.type!=='word')continue;
    t=document.createElement('button');
    t.className='tile';
    t.innerHTML='<img src="'+c.sides.a.image+'" alt="" loading="lazy">'+
      '<div class="cap">'+c.sides.a.word+'</div>';
    tilePid(t,c.id);
    (function(c){t.onclick=function(){openCard(c);};})(c);
    grid.appendChild(t);
  }
  /* цифровой блок: слоги, которых нет в печатной колоде */
  var hasDig=false;
  for(i=0;i<CARDS.length;i++)
    if(CARDS[i].type==='syllable'&&CARDS[i].sides.a.digital){hasDig=true;break;}
  if(hasDig){
    grid.appendChild(slogiHead(T('✨ Ещё в приложении','✨ More in the app')));
    for(i=0;i<CARDS.length;i++){
      c=CARDS[i];
      if(c.type!=='syllable'||!c.sides.a.digital)continue;
      t=document.createElement('button');
      t.className='tile';
      t.innerHTML='<div class="wordface"><b>'+sylHtml(c.sides.a.cons,c.sides.a.vowel)+'</b>'+
        '<span>'+sylHtml(c.sides.b.cons,c.sides.b.vowel)+' на обороте</span></div>';
      tilePid(t,c.id);
      digBadge(t);
      (function(c){t.onclick=function(){openCard(c);};})(c);
      grid.appendChild(t);
    }
  }
}

/* ── «Живая азбука»: карта = буква; лицо — буква + слово-ассоциация,
   оборот — мнемоника + двустишие; игра «Найди букву» ── */
function azColor(c){return c.vowel?SL_RED:SL_BLUE;}
function openBukva(c){
  curCard=null;
  stopAudio();
  mnum.textContent=T('Буква ','Letter ')+c.letter;
  function face(){
    mbody.innerHTML='<div class="azletter" style="color:'+azColor(c)+'">'+c.letter+'</div>'+
      '<img class="fzpic" src="'+c.image+'" alt="">'+
      '<div class="ctorhead">'+(c.tricky?hlWord(c.word,c.letter):c.word)+'</div>'+
      '<div class="brow"><button class="btn bplay" id="bplay" aria-label="'+T('Слушай','Listen')+'">▶</button>'+
      '<button class="btn brepeat" id="bflip">'+T('На что похожа? ›','What does it look like? ›')+'</button></div>';
    var bp=document.getElementById('bplay');
    bp.onclick=function(){playClip(c.audio,bp);progMark(c.id);};
    document.getElementById('bflip').onclick=function(){back();flipMbody();};
    playClip(c.audio,bp);
    progMark(c.id);
  }
  function back(){
    stopAudio();
    mbody.innerHTML='<img class="fzpic" src="'+c.image_b+'" alt="">'+
      '<div class="ctorhead">'+c.mnemo+'</div>'+
      '<div class="hint">'+c.verse+'</div>'+
      '<div class="brow"><button class="btn bplay" id="bpv" aria-label="'+T('Слушай стишок','Listen to the rhyme')+'">▶</button>'+
      '<button class="btn brepeat" id="bback">'+T('‹ Буква','‹ Letter')+'</button></div>';
    var bp=document.getElementById('bpv');
    bp.onclick=function(){playClip(c.audio_verse,bp);};
    playClip(c.audio_verse,bp);
    document.getElementById('bback').onclick=function(){face();flipMbody();};
  }
  face();
  modal.className='modal on';
  modal.scrollTop=0;
}
function hlWord(word,letter){
  var out='',i,ch;
  for(i=0;i<word.length;i++){
    ch=word.charAt(i);
    out+=(ch===letter)?'<span style="color:'+SL_RED+'">'+ch+'</span>':ch;
  }
  return out;
}
function openFindLetter(){
  curCard=null;
  stopAudio();
  mnum.textContent=T('Найди букву','Find the letter');
  var order=shuffle(DATA.cards.slice()),qi=0,score=0;
  function round(){
    stopAudio();
    if(qi>=10){
      mbody.innerHTML='<div class="ctorhead">'+T('🎉 Найдено букв: '+score+' из 10!','🎉 Letters found: '+score+' of 10!')+'</div>'+
        '<div class="brow"><button class="btn brepeat" id="bagainf">'+T('Ещё раз!','Again!')+'</button></div>';
      burst();
      document.getElementById('bagainf').onclick=openFindLetter;
      return;
    }
    var t=order[qi%order.length],opts=[t],cand=shuffle(DATA.cards.slice()),i;
    for(i=0;i<cand.length&&opts.length<4;i++)
      if(cand[i].letter!==t.letter)opts.push(cand[i]);
    opts=shuffle(opts);
    var h='<div class="ctorhead">'+T('Слушай и найди букву!','Listen and find the letter!')+' ('+(qi+1)+T(' из 10)',' of 10)')+'</div>'+
      '<div class="brow"><button class="btn bplay" id="bplay" aria-label="'+T('Слушай','Listen')+'">▶</button></div>'+
      '<div class="azrow">';
    for(i=0;i<opts.length;i++)
      h+='<button class="btn azopt" data-l="'+opts[i].letter+'" style="color:'+azColor(opts[i])+'">'+opts[i].letter+'</button>';
    h+='</div><div class="fzresult" id="fres"></div>';
    mbody.innerHTML=h;
    var bp=document.getElementById('bplay');
    bp.onclick=function(){playClip(t.audio,bp);};
    playClip(t.audio,bp);
    var bs=mbody.querySelectorAll('.azopt'),j;
    function pick(e){
      var el=e.currentTarget||e.target;
      if(el.getAttribute('data-l')===t.letter){
        score++;progMark(t.id);
        document.getElementById('fres').textContent=T('🎉 Да, это '+t.letter+'!',"🎉 Yes, it's "+t.letter+'!');
        qi++;setTimeout(round,900);
      }else{
        document.getElementById('fres').textContent=T('Послушай ещё раз!','Listen again!');
      }
    }
    for(j=0;j<bs.length;j++)bs[j].onclick=pick;
  }
  round();
  modal.className='modal on';
  modal.scrollTop=0;
}
function buildAzbukaGrid(){
  grid.appendChild(modeBtn(T('🔎 Найди букву','🔎 Find the letter'),T('звучит звук — найди букву среди четырёх','hear the sound — find the letter among four'),openFindLetter));
  grid.appendChild(modeBtn(T('🎧 Слушать подряд','🎧 Listen through'),T('весь алфавит: звук, слово и стишок','the whole alphabet: sound, word and rhyme'),function(){
    var items=[],i,c;
    for(i=0;i<DATA.cards.length;i++){
      c=DATA.cards[i];
      items.push({html:'<div class="azletter" style="color:'+azColor(c)+'">'+c.letter+'</div>'+
        '<div class="ctorhead">'+c.word+'</div>',audio:c.audio,mark:c.id});
    }
    openPlaylist(T('Азбука','Alphabet'),items);
  }));
  var i,c,t;
  for(i=0;i<DATA.cards.length;i++){
    c=DATA.cards[i];
    t=document.createElement('button');
    t.className='tile';
    t.innerHTML='<img src="'+c.image+'" alt="" loading="lazy">'+
      '<div class="cap"><span style="color:'+azColor(c)+'">'+c.letter+'</span> · '+c.word+'</div>';
    tilePid(t,c.id);
    (function(c){t.onclick=function(){openBukva(c);};})(c);
    grid.appendChild(t);
  }
}

/* ── «Слышу звуки»: фонематический слух — позиции, обманки, сетки ── */
function openPos(c){
  curCard=null;
  stopAudio();
  mnum.textContent=T('Где звук ','Where is the sound ')+c.sound+'?';
  var labels=[T('в начале','at the start'),T('в середине','in the middle'),T('в конце','at the end')];
  mbody.innerHTML='<img class="fzpic" src="'+c.image+'" alt="">'+
    '<div class="ctorhead">'+c.word+'</div>'+
    '<div class="brow"><button class="btn bplay" id="bplay" aria-label="Слушай">▶</button></div>'+
    '<div class="hint">'+T('Где в слове звук','Where in the word is the sound')+' <b>'+c.sound+'</b>? '+T('Нажми окошко!','Tap a window!')+'</div>'+
    '<div class="azrow">'+
      '<button class="btn azopt poswin" data-p="0">▮▯▯</button>'+
      '<button class="btn azopt poswin" data-p="1">▯▮▯</button>'+
      '<button class="btn azopt poswin" data-p="2">▯▯▮</button>'+
    '</div><div class="fzresult" id="pres"></div>';
  var bp=document.getElementById('bplay');
  bp.onclick=function(){playClip(c.audio,bp);};
  playClip(c.audio,bp);
  var bs=mbody.querySelectorAll('.poswin'),j;
  for(j=0;j<bs.length;j++)bs[j].onclick=function(e){
    var el=e.currentTarget||e.target;
    if(parseInt(el.getAttribute('data-p'),10)===c.pos){
      document.getElementById('pres').textContent=T('🎉 Верно! Звук ','🎉 Right! The sound ')+c.sound+' '+labels[c.pos]+'.';
      progMark(c.id);
    }else{
      document.getElementById('pres').textContent=T('Послушай слово ещё раз!','Listen to the word again!');
    }
  };
  modal.className='modal on';
  modal.scrollTop=0;
}
function openPair(c){
  curCard=null;
  stopAudio();
  mnum.textContent=T('Кто есть кто? · ','Who is who? · ')+c.contrast;
  var target=Math.random()<0.5?'a':'b';
  function round(){
    stopAudio();
    var audio=target==='a'?c.audio_a:c.audio_b;
    mbody.innerHTML='<div class="ctorhead">'+T('Слушай и покажи, что назвал диктор!','Listen and point to what the narrator said!')+'</div>'+
      '<div class="brow"><button class="btn bplay" id="bplay" aria-label="Слушай">▶</button></div>'+
      '<div class="pairrow">'+
      '<button class="btn pairopt" data-s="a"><img src="'+c.image_a+'" alt=""></button>'+
      '<button class="btn pairopt" data-s="b"><img src="'+c.image_b+'" alt=""></button>'+
      '</div><div class="fzresult" id="qres"></div>';
    var bp=document.getElementById('bplay');
    bp.onclick=function(){playClip(audio,bp);};
    playClip(audio,bp);
    var bs=mbody.querySelectorAll('.pairopt'),j;
    for(j=0;j<bs.length;j++)bs[j].onclick=function(e){
      var el=e.currentTarget;
      if(el.getAttribute('data-s')===target){
        document.getElementById('qres').textContent=T('🎉 Да! Это ','🎉 Yes! That is ')+
          (target==='a'?c.word_a:c.word_b)+T('. А теперь другое слово!','. Now the other word!');
        progMark(c.id);
        target=target==='a'?'b':'a';
        setTimeout(round,1100);
      }else{
        document.getElementById('qres').textContent=T('Ушки на макушке — слушай ещё раз!','Ears wide open — listen again!');
      }
    };
  }
  round();
  modal.className='modal on';
  modal.scrollTop=0;
}
function openSluhGrid(c){
  curCard=null;
  stopAudio();
  mnum.textContent=T('Что начинается на ','What starts with ')+c.sound+'?';
  var h='<div class="ctorhead">'+T('Что начинается на звук','Which one starts with the sound')+' <b>'+c.sound+'</b>?</div>'+
    '<div class="brow"><button class="btn bplay" id="bplay" aria-label="Слушай">▶</button></div>'+
    '<div class="sgrid">',i;
  for(i=0;i<c.items.length;i++)
    h+='<button class="btn gopt" data-i="'+i+'"><img src="'+c.items[i].image+'" alt=""></button>';
  h+='</div><div class="fzresult" id="gres"></div>';
  mbody.innerHTML=h;
  var bp=document.getElementById('bplay');
  bp.onclick=function(){playClip(c.audio,bp);};
  playClip(c.audio,bp);
  var bs=mbody.querySelectorAll('.gopt'),j;
  for(j=0;j<bs.length;j++)bs[j].onclick=function(e){
    var el=e.currentTarget;
    if(parseInt(el.getAttribute('data-i'),10)===c.right){
      document.getElementById('gres').textContent='🎉 '+T('Точно! ','Spot on! ')+c.items[c.right].word+
        T(' начинается на ',' starts with ')+c.sound+'.';
      progMark(c.id);
    }else{
      document.getElementById('gres').textContent=T('Скажи слово вслух и послушай первый звук!','Say the word out loud and listen to its first sound!');
    }
  };
  modal.className='modal on';
  modal.scrollTop=0;
}
function openCatchSound(){
  curCard=null;
  stopAudio();
  var pool=[],i,c;
  for(i=0;i<DATA.cards.length;i++)
    if(DATA.cards[i].block==='pos')pool.push(DATA.cards[i]);
  var snd=pool[Math.floor(Math.random()*pool.length)].sound;
  var seq=shuffle(pool.slice()).slice(0,6),qi=0,score=0,answered=false;
  mnum.textContent=T('Поймай звук ','Catch the sound ')+snd;
  function step(){
    stopAudio();
    if(qi>=seq.length){
      mbody.innerHTML='<div class="ctorhead">'+T('🎉 Поймано: '+score+' из '+seq.length+'!','🎉 Caught: '+score+' of '+seq.length+'!')+'</div>'+
        '<div class="brow"><button class="btn brepeat" id="bagainc">'+T('Ещё звук!','Another sound!')+'</button></div>';
      document.getElementById('bagainc').onclick=openCatchSound;
      return;
    }
    var w=seq[qi];
    answered=false;
    mbody.innerHTML='<div class="ctorhead">'+T('Хлопни, если в слове есть звук','Clap if the word has the sound')+' <b>'+snd+'</b>! ('+(qi+1)+T(' из ',' of ')+seq.length+')</div>'+
      '<div class="brow"><button class="btn bplay" id="bplay" aria-label="Слушай">▶</button></div>'+
      '<div class="brow"><button class="btn brepeat" id="bcatch">'+T('👏 ЕСТЬ ЗВУК!','👏 IT IS THERE!')+'</button>'+
      '<button class="btn brepeat" id="bskip">'+T('Нет звука ›','No sound ›')+'</button></div>'+
      '<div class="fzresult" id="cres"></div>';
    var bp=document.getElementById('bplay');
    bp.onclick=function(){playClip(w.audio,bp);};
    playClip(w.audio,bp);
    var has=w.sounds?w.sounds.indexOf(snd)>=0:w.word.indexOf(snd)>=0;
    function answer(saidYes){
      if(answered)return;
      answered=true;
      var ok=(saidYes===has);
      if(ok){score++;progMark(w.id);}
      document.getElementById('cres').textContent=ok?T('🎉 Верно! ','🎉 Right! ')+w.word+(has?T(' — есть ',' — it has ')+snd+'!':T(' — нет ',' — no ')+snd+'.')
        :T('Ой! В слове ','Oops! The word ')+w.word+(has?T(' есть ',' has ')+snd:T(' нет ',' has no ')+snd)+'.';
      qi++;
      setTimeout(step,1300);
    }
    document.getElementById('bcatch').onclick=function(){answer(true);};
    document.getElementById('bskip').onclick=function(){answer(false);};
  }
  step();
  modal.className='modal on';
  modal.scrollTop=0;
}
function buildSluhGrid(){
  grid.appendChild(modeBtn(T('👂 Поймай звук','👂 Catch the sound'),T('слова подряд — хлопни, когда услышишь звук','words one by one — clap when you hear the sound'),openCatchSound));
  grid.appendChild(modeBtn(T('🎧 Слушать подряд','🎧 Listen through'),T('все слова коробки голосом диктора','every word in the box, read aloud'),function(){
    var items=[],i,c;
    for(i=0;i<DATA.cards.length;i++){
      c=DATA.cards[i];
      if(c.block==='pos')
        items.push({html:'<img class="fzpic" src="'+c.image+'" alt=""><div class="ctorhead">'+c.word+'</div>',
          audio:c.audio,mark:c.id});
    }
    openPlaylist(T('Слушаем слова','Listening to words'),items);
  }));
  var i,c,t;
  function tilePos(c){
    var t=document.createElement('button');
    t.className='tile';
    t.innerHTML='<img src="'+c.image+'" alt="" loading="lazy">'+
      '<div class="cap">'+c.word+' · '+c.sound+'</div>';
    tilePid(t,c.id);
    if(c.digital)digBadge(t);
    (function(c){t.onclick=function(){openPos(c);};})(c);
    grid.appendChild(t);
  }
  grid.appendChild(slogiHead(T('Где звук? Начало, середина, конец','Where is the sound? Start, middle, end')));
  for(i=0;i<DATA.cards.length;i++){
    c=DATA.cards[i];
    if(c.block==='pos'&&!c.digital)tilePos(c);
  }
  grid.appendChild(slogiHead(T('Пары-обманки: слушай внимательно','Tricky pairs: listen closely')));
  for(i=0;i<DATA.cards.length;i++){
    c=DATA.cards[i];
    if(c.block!=='pair')continue;
    t=document.createElement('button');
    t.className='tile';
    t.innerHTML='<img src="'+c.image_a+'" alt="" loading="lazy">'+
      '<div class="cap">'+c.word_a+' — '+c.word_b+'</div>';
    tilePid(t,c.id);
    (function(c){t.onclick=function(){openPair(c);};})(c);
    grid.appendChild(t);
  }
  grid.appendChild(slogiHead(T('Что начинается на…?','What starts with…?')));
  for(i=0;i<DATA.cards.length;i++){
    c=DATA.cards[i];
    if(c.block!=='grid')continue;
    t=document.createElement('button');
    t.className='tile';
    t.innerHTML='<img src="'+c.items[0].image+'" alt="" loading="lazy">'+
      '<div class="cap">'+T('Звук ','Sound ')+c.sound+'</div>';
    tilePid(t,c.id);
    (function(c){t.onclick=function(){openSluhGrid(c);};})(c);
    grid.appendChild(t);
  }
  var hasDig=false;
  for(i=0;i<DATA.cards.length;i++)if(DATA.cards[i].digital)hasDig=true;
  if(hasDig){
    grid.appendChild(slogiHead(T('✨ Ещё в приложении','✨ More in the app')));
    for(i=0;i<DATA.cards.length;i++){
      c=DATA.cards[i];
      if(c.block==='pos'&&c.digital)tilePos(c);
    }
  }
}

/* ── «CVC Reading» (Speech · English): чтение слитных слов из трёх
   звуков. Семьи слов (rime фикс, onset swap), блендинг, конструктор.
   Гласные — красным, согласные — синим (школьная конвенция). ── */
function cvcWords(){
  var out=[],i,j,f;
  for(i=0;i<(DATA.families||[]).length;i++){
    f=DATA.families[i];
    for(j=0;j<f.words.length;j++)out.push(f.words[j]);
  }
  return out;
}
function isVowel(ch){return 'aeiou'.indexOf(ch.toLowerCase())>=0;}
function cvcLetter(ch){
  return '<span style="color:'+(isVowel(ch)?SL_RED:SL_BLUE)+'">'+ch+'</span>';
}
function cvcWord(w){
  var out='',i;
  for(i=0;i<w.length;i++)out+=cvcLetter(w.charAt(i));
  return out;
}
function openFamily(f){
  curCard=null;
  stopAudio();
  mnum.textContent=T('Семья ','The -')+f.rime+T('','')+T(' — семья слов',' family');
  var idx=0;
  function show(){
    stopAudio();
    var w=f.words[idx];
    var onsets='',k;
    for(k=0;k<f.words.length;k++)
      onsets+='<button class="btn azopt cvconset'+(k===idx?' cur':'')+'" data-k="'+k+'">'+
        cvcLetter(f.words[k].onset)+'</button>';
    mbody.innerHTML='<div class="cvcbig">'+cvcWord(w.word)+'</div>'+
      '<img class="fzpic" src="'+w.image+'" alt="">'+
      '<div class="brow"><button class="btn bplay" id="bplay" aria-label="'+T('Слушай','Listen')+'">▶</button></div>'+
      '<div class="hint">'+T('Меняй первый звук — читай всю семью!','Swap the first sound — read the whole family!')+'</div>'+
      '<div class="azrow">'+onsets+'</div>';
    var bp=document.getElementById('bplay');
    bp.onclick=function(){playClip(w.audio,bp);progMark(w.id);};
    playClip(w.audio,bp);progMark(w.id);
    var bs=mbody.querySelectorAll('.cvconset'),j;
    for(j=0;j<bs.length;j++)bs[j].onclick=function(e){
      idx=parseInt((e.currentTarget||e.target).getAttribute('data-k'),10);show();
    };
  }
  show();
  modal.className='modal on';
  modal.scrollTop=0;
}
/* блендинг: звук-за-звуком → целое слово, лентой по всем словам */
function openCvcBlend(){
  curCard=null;
  stopAudio();
  var words=shuffle(cvcWords().slice()),qi=0;
  function step(){
    stopAudio();
    if(qi>=words.length){closeCard();return;}
    var w=words[qi++];
    mnum.textContent=T('Читаем по звукам','Blend it')+' · '+qi+T(' из ',' of ')+words.length;
    var snd='',k;
    for(k=0;k<w.sounds.length;k++)
      snd+='<span class="cvcsnd">'+cvcLetter(w.sounds[k])+'</span>';
    mbody.innerHTML='<div class="cvcblend">'+snd+'</div>'+
      '<div class="hint">'+T('Скажи каждый звук — потом слей в слово!','Say each sound — then blend them into the word!')+'</div>'+
      '<div class="brow"><button class="btn bplay" id="bplay" aria-label="'+T('Слушай','Listen')+'">▶</button></div>'+
      '<div class="cvcrev" id="rev" hidden><img class="fzpic" src="'+w.image+'" alt="">'+
        '<div class="cvcbig">'+cvcWord(w.word)+'</div></div>'+
      '<div class="brow"><button class="btn brepeat" id="bnx">'+
        (qi<words.length?T('Дальше ›','Next ›'):T('Готово!','Done!'))+'</button></div>';
    var bp=document.getElementById('bplay');
    bp.onclick=function(){document.getElementById('rev').hidden=false;playClip(w.audio,bp);progMark(w.id);};
    document.getElementById('bnx').onclick=function(){step();};
  }
  step();
  modal.className='modal on';
  modal.scrollTop=0;
}
/* конструктор: собери слово из трёх звуков по картинке */
function openCvcBuild(){
  curCard=null;
  stopAudio();
  var words=shuffle(cvcWords().slice()),wi=0;
  function round(){
    stopAudio();
    var w=words[wi%words.length];
    var slots=[null,null,null];
    /* пул = три верных звука + один-два отвлекающих */
    var pool=w.sounds.slice(),extra=['s','n','p','t','m','b'],e;
    for(e=0;e<extra.length&&pool.length<5;e++)
      if(w.sounds.indexOf(extra[e])<0)pool.push(extra[e]);
    pool=shuffle(pool);
    mnum.textContent=T('Собери слово','Build a word');
    function draw(){
      var sl='',k;
      for(k=0;k<3;k++)sl+='<button class="btn cvcslot'+(slots[k]?' filled':'')+'" data-s="'+k+'">'+
        (slots[k]?cvcLetter(slots[k]):'&nbsp;')+'</button>';
      var pl='',used={},m;
      for(m=0;m<3;m++)if(slots[m])used[m]=slots[m];
      var pb='',pi;
      for(pi=0;pi<pool.length;pi++)pb+='<button class="btn cvctile" data-t="'+pi+'">'+cvcLetter(pool[pi])+'</button>';
      mbody.innerHTML='<img class="fzpic" src="'+w.image+'" alt="">'+
        '<div class="brow"><button class="btn bplay" id="bplay" aria-label="'+T('Слушай','Listen')+'">▶</button></div>'+
        '<div class="hint">'+T('Собери слово из звуков!','Build the word from its sounds!')+'</div>'+
        '<div class="cvcslots">'+sl+'</div>'+
        '<div class="azrow">'+pb+'</div>'+
        '<div class="fzresult" id="res"></div>';
      var bp=document.getElementById('bplay');
      bp.onclick=function(){playClip(w.audio,bp);};
      var sb=mbody.querySelectorAll('.cvcslot'),tb=mbody.querySelectorAll('.cvctile'),j;
      for(j=0;j<sb.length;j++)sb[j].onclick=function(e){
        var k=parseInt((e.currentTarget||e.target).getAttribute('data-s'),10);
        if(slots[k]){slots[k]=null;draw();}
      };
      for(j=0;j<tb.length;j++)tb[j].onclick=function(e){
        var pi=parseInt((e.currentTarget||e.target).getAttribute('data-t'),10),k2;
        for(k2=0;k2<3;k2++)if(!slots[k2]){slots[k2]=pool[pi];break;}
        check();draw();
      };
    }
    function check(){
      if(slots[0]&&slots[1]&&slots[2]){
        if(slots.join('')===w.sounds.join('')){
          progMark(w.id);
          setTimeout(function(){
            var r=document.getElementById('res');
            if(r)r.textContent='🎉 '+w.word+'!';
            burst();
            var bp=document.getElementById('bplay');playClip(w.audio,bp);
            setTimeout(function(){wi++;round();},1300);
          },50);
        }
      }
    }
    draw();
  }
  round();
  modal.className='modal on';
  modal.scrollTop=0;
}
function buildCvcGrid(){
  var words=cvcWords();
  var b=document.createElement('button');
  b.className='ctorbtn';
  b.innerHTML='🧱 '+T('Собери слово','Build a word')+'<span>'+
    T('собери из звуков — '+words.length+' слов!','make it from its sounds — '+words.length+' words!')+'</span>';
  b.onclick=openCvcBuild;
  grid.appendChild(b);
  grid.appendChild(modeBtn(T('🔊 Читаем по звукам','🔊 Blend it'),T('звук за звуком — слей в слово','sound by sound — blend into a word'),openCvcBlend));
  grid.appendChild(modeBtn(T('🎧 Слушать подряд','🎧 Listen through'),T('все слова голосом диктора','every word read aloud'),function(){
    var items=[],i,w;
    for(i=0;i<words.length;i++){
      w=words[i];
      items.push({html:'<img class="fzpic" src="'+w.image+'" alt=""><div class="cvcbig">'+cvcWord(w.word)+'</div>',
        audio:w.audio,mark:w.id});
    }
    openPlaylist(T('Слушаем слова','Listening to words'),items);
  }));
  var fi,f;
  for(fi=0;fi<DATA.families.length;fi++){
    f=DATA.families[fi];
    grid.appendChild(slogiHead(T('Семья -','The -')+f.rime));
    (function(f){
      var t=document.createElement('button');
      t.className='tile';
      t.innerHTML='<img src="'+f.words[0].image+'" alt="" loading="lazy">'+
        '<div class="cap">-'+f.rime+' · '+f.words.length+' '+T('слов','words')+'</div>';
      var pdone=true,k;
      for(k=0;k<f.words.length;k++)if(!progHas(f.words[k].id))pdone=false;
      if(pdone)tilePid(t,f.words[0].id);
      t.onclick=function(){openFamily(f);};
      grid.appendChild(t);
    })(f);
  }
}

/* ── «Sound Boxes» (Speech · English): звуковые боксы по Эльконину.
   Ребёнок говорит слово медленно и проталкивает фишку в бокс за КАЖДЫЙ
   звук (сегментация на фонемы, не буквы: fish = f-i-sh, три звука/четыре
   буквы; bee = b-ee, два звука/три буквы). Гласный — красным, согласный —
   синим. Режимы: «Протолкни звуки», «Сколько звуков?», «Слушать подряд». ── */
function sbWords(){return DATA.words||[];}
function sbChip(s){
  return '<span class="sbg" style="color:'+(isVowel(s)?SL_RED:SL_BLUE)+'">'+s+'</span>';
}
function sbBoxesFilled(w){
  var o='',k;
  for(k=0;k<w.sounds.length;k++)o+='<span class="sbbox on">'+sbChip(w.sounds[k])+'</span>';
  return o;
}
function sbSoundsWord(n){return EN?(n+' sounds'):(n+' '+plural(n,'звук','звука','звуков'));}
/* проталкивание фишек: пустые боксы → фишка за звук → раскрытие фонем */
function openSbPush(w){
  curCard=null;
  stopAudio();
  mnum.textContent=w.word.toUpperCase();
  var n=w.sounds.length,filled=0,done=false,justFilled=-1;
  function draw(){
    var boxes='',k,cls,inner;
    for(k=0;k<n;k++){
      cls='sbbox';inner='';
      if(done){cls+=' on';inner=sbChip(w.sounds[k]);}
      else if(k<filled){cls+=' on';inner='<span class="sbchip'+(k===justFilled?' drop':'')+'"></span>';}
      else if(k===filled){cls+=' active';}
      boxes+='<button class="'+cls+'" data-i="'+k+'">'+inner+'</button>';
    }
    justFilled=-1;
    var hint=done
      ? '🎉 '+sbSoundsWord(n)+'!'
      : T('Скажи слово медленно и протолкни фишку за каждый звук.',
          'Say the word slowly and push a chip for each sound.');
    mbody.innerHTML='<img class="fzpic" src="'+w.image+'" alt="">'+
      '<div class="brow"><button class="btn bplay" id="bplay" aria-label="'+T('Слушай','Listen')+'">▶</button></div>'+
      '<div class="hint">'+hint+'</div>'+
      '<div class="sbrow">'+boxes+'</div>'+
      (done?'<div class="sbword">'+w.word+'</div>'+
            '<div class="brow"><button class="btn brepeat" id="bnx">'+T('Готово!','Done!')+'</button></div>':'');
    var bp=document.getElementById('bplay');
    bp.onclick=function(){playClip(w.audio,bp);};
    if(done){document.getElementById('bnx').onclick=function(){closeCard();};return;}
    var bs=mbody.querySelectorAll('.sbbox'),j;
    for(j=0;j<bs.length;j++)bs[j].onclick=function(e){
      var k=parseInt((e.currentTarget||e.target).getAttribute('data-i'),10);
      if(k!==filled)return;
      justFilled=filled;
      filled++;
      if(filled>=n){done=true;progMark(w.id);}
      draw();
      if(done)playClip(w.audio,document.getElementById('bplay'));
    };
  }
  draw();
  playClip(w.audio,document.getElementById('bplay'));
  modal.className='modal on';
  modal.scrollTop=0;
}
/* игра: послушай слово — посчитай звуки */
function openSbCount(){
  curCard=null;
  stopAudio();
  var words=shuffle(sbWords().slice()),qi=0;
  function round(){
    stopAudio();
    if(qi>=words.length){closeCard();return;}
    var w=words[qi],n=w.sounds.length,opts=[2,3,4],ob='',i;
    mnum.textContent=T('Сколько звуков?','How many sounds?')+' · '+(qi+1)+T(' из ',' of ')+words.length;
    for(i=0;i<opts.length;i++)ob+='<button class="btn sbnum" data-n="'+opts[i]+'">'+opts[i]+'</button>';
    mbody.innerHTML='<img class="fzpic" src="'+w.image+'" alt="">'+
      '<div class="brow"><button class="btn bplay" id="bplay" aria-label="'+T('Слушай','Listen')+'">▶</button></div>'+
      '<div class="hint">'+T('Послушай слово. Сколько в нём звуков?','Listen to the word. How many sounds are in it?')+'</div>'+
      '<div class="sbnums">'+ob+'</div>'+
      '<div class="fzresult" id="res"></div>';
    var bp=document.getElementById('bplay');
    bp.onclick=function(){playClip(w.audio,bp);};
    playClip(w.audio,bp);
    var nb=mbody.querySelectorAll('.sbnum'),j;
    for(j=0;j<nb.length;j++)nb[j].onclick=function(e){
      var self=e.currentTarget||e.target,pick=parseInt(self.getAttribute('data-n'),10);
      if(pick===n){
        progMark(w.id);
        self.className+=' ok';
        var r=document.getElementById('res');
        if(r)r.innerHTML='<div class="sbrow">'+sbBoxesFilled(w)+'</div><div class="sbok">🎉 '+w.word+'</div>';
        burst();
        playClip(w.audio,bp);
        qi++;setTimeout(round,1500);
      }else{
        self.className+=' bad';
        setTimeout(function(){self.className=self.className.replace(' bad','');},550);
      }
    };
  }
  round();
  modal.className='modal on';
  modal.scrollTop=0;
}
function buildSoundboxGrid(){
  var words=sbWords();
  grid.appendChild(modeBtn(T('🔢 Сколько звуков?','🔢 How many sounds?'),
    T('послушай слово — посчитай звуки','listen to the word — count the sounds'),openSbCount));
  grid.appendChild(modeBtn(T('🎧 Слушать подряд','🎧 Listen through'),
    T('все слова голосом диктора','every word read aloud'),function(){
      var items=[],i,w;
      for(i=0;i<words.length;i++){
        w=words[i];
        items.push({html:'<img class="fzpic" src="'+w.image+'" alt=""><div class="sbrow">'+sbBoxesFilled(w)+'</div>',
          audio:w.audio,mark:w.id});
      }
      openPlaylist(T('Слушаем слова','Listening to words'),items);
    }));
  var groups={},order=[],i,w;
  for(i=0;i<words.length;i++){
    w=words[i];
    if(!groups[w.n]){groups[w.n]=[];order.push(w.n);}
    groups[w.n].push(w);
  }
  var g;
  for(g=0;g<order.length;g++){
    var n=order[g];
    grid.appendChild(slogiHead(sbSoundsWord(n)));
    (function(list){
      var k;
      for(k=0;k<list.length;k++)(function(w){
        var t=document.createElement('button');
        t.className='tile';
        t.innerHTML='<img src="'+w.image+'" alt="" loading="lazy"><div class="cap">'+w.word+'</div>';
        if(progHas(w.id))tilePid(t,w.id);
        t.onclick=function(){openSbPush(w);};
        grid.appendChild(t);
      })(list[k]);
    })(groups[n]);
  }
}

/* ── «Читаем сами · первые фразы»: фраза со слоговыми дугами, оборот —
   картинка-проверка; команды «сделай», небылицы «правда или смешно» ── */
var SIGHT_HINT='Read it out loud. Highlighted words you just know by sight — the rest you can sound out.';
function anySight(){var i;for(i=0;i<DATA.cards.length;i++)if((DATA.cards[i].sight||[]).length)return true;return false;}
function sightLegend(){var d=document.createElement('div');d.className='sightlegend';d.innerHTML='<span class="sight">Highlighted</span> = sight words (know them, don\'t sound them out).';return d;}
function frazaHtml(c,big){
  var h='<div class="fraza'+(big?' big':'')+'">',wi,si,w;
  /* sight — индексы слов-«узнаваек» (the, is, a…): подсветка, а не дуги */
  var sw=c.sight||[];
  function isSight(i){var k;for(k=0;k<sw.length;k++)if(sw[k]===i)return true;return false;}
  for(wi=0;wi<c.words.length;wi++){
    w=c.words[wi];
    h+='<span class="fw'+(isSight(wi)?' sight':'')+'">';
    for(si=0;si<w.length;si++)
      h+='<span class="syl'+(w.length>1?' arc':'')+'">'+w[si]+'</span>';
    if(wi===c.words.length-1){
      var tail=c.phrase.charAt(c.phrase.length-1);
      if(tail==='.'||tail==='!'||tail==='?')h+='<span class="syl">'+tail+'</span>';
    }
    h+='</span> ';
  }
  return h+'</div>';
}
function openFraza(c){
  curCard=null;
  stopAudio();
  mnum.textContent=T('Карта ','Card ')+pad(c.id);
  var h=frazaHtml(c,true)+
    '<div class="hint">'+T('Прочитай вслух — не спеши, веди пальчиком по дугам!',SIGHT_HINT)+'</div>';
  if(c.type==='tf'){
    h+='<div class="brow"><button class="btn brepeat" id="btrue">'+T('✅ Правда','✅ True')+'</button>'+
       '<button class="btn brepeat" id="bfun">'+T('😄 Смешно!','😄 Silly!')+'</button></div>';
  }else if(c.type==='do'){
    h+='<div class="brow"><button class="btn brepeat" id="bdone">'+T('🙌 Сделал!','🙌 Done it!')+'</button></div>';
  }else{
    h+='<div class="brow"><button class="btn brepeat" id="bshow">'+T('🖼 Проверь себя картинкой','🖼 Check with the picture')+'</button></div>';
  }
  h+='<div id="freveal" hidden><img class="fzpic" src="'+c.image+'" alt="">'+
     '<div class="fzresult" id="fverdict"></div></div>'+
     '<div class="brow"><button class="btn bplay" id="bplay" aria-label="Слушай">▶</button></div>'+
     '<div class="hint">'+T('▶ — послушай, как читает диктор.','▶ — hear how the narrator reads it.')+'</div>';
  mbody.innerHTML=h;
  var bp=document.getElementById('bplay');
  bp.onclick=function(){playClip(c.audio,bp);progMark(c.id);};
  function reveal(verdict){
    document.getElementById('freveal').hidden=false;
    if(verdict)document.getElementById('fverdict').innerHTML=verdict;
    progMark(c.id);
    modal.scrollTop=modal.scrollHeight;
  }
  if(c.type==='tf'){
    document.getElementById('btrue').onclick=function(){
      reveal(c.truth?T('🎉 Верно, это правда!','🎉 Yes, it is true!'):T('Ой! Прочитай ещё раз — это же небылица! 😄','Oops! Read it again — it is a silly one! 😄'));
    };
    document.getElementById('bfun').onclick=function(){
      reveal(c.truth?T('А вот и нет — это правда! Хитрая карточка. 🐭','Not quite — it is actually true! A tricky card. 🐭'):T('🎉 Конечно, смешно! Так не бывает.','🎉 Silly, of course! That cannot happen.'));
    };
  }else if(c.type==='do'){
    document.getElementById('bdone').onclick=function(){
      reveal(T('🎉 Молодец! Прочитал и сделал.','🎉 Well done! Read it and did it.'));
    };
  }else{
    document.getElementById('bshow').onclick=function(){reveal('');};
  }
  modal.className='modal on';
  modal.scrollTop=0;
}
function buildFrazyGrid(){
  grid.appendChild(modeBtn(T('🎧 Слушать подряд','🎧 Listen through'),T('все фразы голосом диктора','every phrase read aloud'),function(){
    var items=[],i,c;
    for(i=0;i<DATA.cards.length;i++){
      c=DATA.cards[i];
      items.push({html:frazaHtml(c,true),audio:c.audio,mark:c.id});
    }
    openPlaylist(T('Слушаем фразы','Listening to phrases'),items);
  }));
  if(EN&&anySight())grid.appendChild(sightLegend());
  var order=['l1','l2','do','tf'],types=DATA.types||{},t,i,c;
  for(t=0;t<order.length;t++){
    var any=false;
    for(i=0;i<DATA.cards.length;i++)if(DATA.cards[i].type===order[t])any=true;
    if(!any)continue;
    grid.appendChild(slogiHead(types[order[t]]||order[t]));
    for(i=0;i<DATA.cards.length;i++){
      c=DATA.cards[i];
      if(c.type!==order[t])continue;
      var tl=document.createElement('button');
      tl.className='tile';
      tl.innerHTML='<div class="phraseface">'+c.phrase+'</div>';
      tilePid(tl,c.id);
      (function(c){tl.onclick=function(){openFraza(c);};})(c);
      grid.appendChild(tl);
    }
  }
}

/* «Слушать подряд» для Слогов: буквы (обе стороны) → слоги → слова */
function openSlogiPlaylist(){
  var items=[],i,c,s,k;
  function push(c,k){
    s=c.sides[k];
    if(!s||!s.audio)return;
    var html;
    if(c.type==='letter')
      html='<div class="sylcard"><b>'+letterHtml(s)+'</b></div>';
    else if(c.type==='syllable')
      html='<div class="sylcard"><b>'+sylHtml(s.cons,s.vowel)+'</b></div>';
    else
      html=(s.image?'<img class="fzpic" src="'+s.image+'" alt="">':'')+
        '<div class="sylcard"><b>'+s.word+'</b></div>';
    items.push({html:html,audio:s.audio,mark:c.id});
  }
  var order=['letter','syllable','word'],t;
  for(t=0;t<order.length;t++)
    for(i=0;i<CARDS.length;i++){
      c=CARDS[i];
      if(c.type!==order[t])continue;
      for(k in c.sides)if(c.sides.hasOwnProperty(k))push(c,k);
    }
  openPlaylist('Слушаем подряд',items);
}

/* ── истории по картинкам («Связная речь»): плитка = история, внутри —
   «Собери историю»: кадры вразброс → тапом по порядку → проверка →
   вопросы-опоры + эталонный рассказ (эталон — ПОСЛЕ детской версии) ── */
function storyFrames(key){
  var out=[],i,c;
  for(i=0;i<DATA.cards.length;i++){
    c=DATA.cards[i];
    if(c.story===key)out.push(c);
  }
  out.sort(function(a,b){return a.frame-b.frame;});
  return out;
}
function buildIstoriiGrid(){
  var list=DATA.stories_list||[],i;
  if(list.length>=2)
    grid.appendChild(modeBtn(T('🔀 Перепутанные истории','🔀 Mixed-up stories'),T('кадры двух историй смешались — разбери!','frames from two stories got shuffled — sort them!'),openMixed));
  grid.appendChild(modeBtn(T('🎧 Слушать рассказы','🎧 Listen to the stories'),T('выбери историю — или слушай все подряд','pick a story — or listen to them all'),function(){
    var items=[],j,st,fr;
    for(j=0;j<list.length;j++){
      st=list[j];
      fr=storyFrames(st.key);
      if(!st.audio)continue;
      items.push({html:(fr.length?'<img class="fzpic" src="'+fr[0].image+'" alt="">':'')+
        '<div class="ctorhead"><span class="dot" style="background:'+st.color+'"></span> '+st.title+'</div>',
        audio:st.audio,mark:null,kar:st.karaoke||null,
        pickTitle:st.title,pickColor:st.color,pickImage:fr.length?fr[0].image:''});
    }
    openStoryPicker(T('Слушаем рассказы','Listening'),items);
  }));
  function tile(st){
    var frames=storyFrames(st.key);
    var t=document.createElement('button');
    t.className='tile';
    t.innerHTML='<img src="'+frames[0].image+'" alt="" loading="lazy">'+
      '<div class="cap"><span class="dot" style="background:'+st.color+'"></span>'+st.title+'</div>';
    tilePid(t,frames[0].id);
    if(st.digital)digBadge(t);
    t.onclick=function(){openStory(st,frames);};
    grid.appendChild(t);
  }
  for(i=0;i<list.length;i++)if(!list[i].digital)tile(list[i]);
  var hasDig=false;
  for(i=0;i<list.length;i++)if(list[i].digital)hasDig=true;
  if(hasDig){
    grid.appendChild(slogiHead(T('✨ Ещё в приложении','✨ More in the app')));
    for(i=0;i<list.length;i++)if(list[i].digital)tile(list[i]);
  }
}
function openStory(st,frames){
  curCard=null;
  stopAudio();
  mnum.textContent=T('История · '+frames.length+' кадра','Story · '+frames.length+' frames');
  var slots=[],pool,i;
  for(i=0;i<frames.length;i++)slots.push(null);
  pool=shuffle(frames.slice());
  /* не подсовывать уже решённый порядок */
  var same=true;
  for(i=0;i<pool.length;i++)if(pool[i].frame!==i+1)same=false;
  if(same)pool.reverse();
  mbody.innerHTML=
    '<div class="sthead"><span class="stbar" style="background:'+st.color+'"></span><b>'+st.title+'</b></div>'+
    '<div class="hint">'+T('Разложи кадры по порядку: нажимай их один за другим!','Put the frames in order: tap them one by one!')+'</div>'+
    '<div class="stslots" id="stslots"></div>'+
    '<div class="stpool" id="stpool"></div>'+
    '<div class="fzresult" id="stres"></div>'+
    '<div class="stdone" id="stdone" hidden>'+
      '<div class="brow"><button class="btn brepeat" id="bstory">'+T('▶ Послушай, как рассказал диктор','▶ Listen to the storyteller')+'</button></div>'+
      '<div class="kq" id="stkq"></div>'+
      '<div class="hint">'+T('Сначала расскажи сам — потом сравни с диктором! Читаешь? Следи за словами.','Tell the story yourself first — then compare! Reading already? Follow the words.')+'</div>'+
      '<div id="stqs"></div>'+
    '</div>';
  var elSlots=document.getElementById('stslots');
  var elPool=document.getElementById('stpool');
  var res=document.getElementById('stres');
  var done=document.getElementById('stdone');
  function redraw(){
    elSlots.innerHTML='';elPool.innerHTML='';
    var k;
    for(k=0;k<slots.length;k++){
      (function(k){
        var b=document.createElement('button');
        b.className='stslot'+(slots[k]?' filled':'');
        b.innerHTML=slots[k]?'<img src="'+slots[k].image+'" alt="">':(k+1);
        b.onclick=function(){
          if(slots[k]){slots[k]=null;res.textContent='';done.hidden=true;redraw();}
        };
        elSlots.appendChild(b);
      })(k);
    }
    for(k=0;k<pool.length;k++){
      (function(k){
        var used=false,m;
        for(m=0;m<slots.length;m++)if(slots[m]===pool[k])used=true;
        var b=document.createElement('button');
        b.className='stpbtn'+(used?' used':'');
        b.innerHTML='<img src="'+pool[k].image+'" alt="" loading="lazy">';
        b.onclick=function(){
          if(used)return;
          var m2;
          for(m2=0;m2<slots.length;m2++)if(!slots[m2]){slots[m2]=pool[k];break;}
          check();redraw();
        };
        elPool.appendChild(b);
      })(k);
    }
  }
  function check(){
    var k,full=true,ok=true;
    for(k=0;k<slots.length;k++){
      if(!slots[k])full=false;
      else if(slots[k].frame!==k+1)ok=false;
    }
    if(!full){res.textContent='';return;}
    if(ok){
      res.textContent=T('Молодец! История собрана — теперь расскажи её!','Well done! The story is complete — now tell it!');
      done.hidden=false;
      for(k=0;k<frames.length;k++)progMark(frames[k].id);
      var qs='',q;
      for(k=0;k<frames.length;k++){
        q=frames[k];
        qs+='<div class="stq"><b>'+T('Кадр ','Frame ')+q.frame+'</b>'+
            (q.q_audio?'<button class="btn bplay stqplay" data-k="'+k+'" aria-label="Listen">▶</button>':'')+
            q.question+
            (q.vocab&&q.vocab.length?'<span class="vcb">'+T('Слова: ','Words: ')+q.vocab.join(', ')+'</span>':'')+'</div>';
      }
      document.getElementById('stqs').innerHTML=qs;
      /* озвучка вопросов-опор (поле q_audio) */
      var qbs=document.getElementById('stqs').getElementsByClassName('stqplay');
      for(k=0;k<qbs.length;k++){
        (function(b){
          b.onclick=function(){playClip(frames[parseInt(b.getAttribute('data-k'),10)].q_audio,b);};
        })(qbs[k]);
      }
      var bs=document.getElementById('bstory');
      bs.onclick=function(){playClip(st.audio,bs);};
      if(st.karaoke)kqMount(document.getElementById('stkq'),st.karaoke,st.audio);
    }else{
      res.textContent=T('Что-то перепуталось! Нажми кадр в ряду — он вернётся вниз.','Something got mixed up! Tap a frame in the row to send it back.');
    }
  }
  redraw();
  modal.className='modal on';
  modal.scrollTop=0;
}

/* ── «Слоговый диктант» (Слоги): слышу слог → выбираю из 4 написанных ── */
function openDictant(){
  curCard=null;
  stopAudio();
  mnum.textContent='Слоговый диктант';
  var sylls=[],i,c;
  for(i=0;i<DATA.cards.length;i++){
    c=DATA.cards[i];
    if(c.type==='syllable')sylls.push(c);
  }
  var pool=shuffle(sylls.slice()),di=0,score=0;
  var ROUNDS=Math.min(10,pool.length);
  function round(){
    stopAudio();
    var t=pool[di];
    /* умные дистракторы: та же согласная/другая гласная и наоборот */
    var opts=[t],k;
    var near=shuffle(sylls.slice());
    for(k=0;k<near.length&&opts.length<4;k++)
      if(near[k]!==t&&(near[k].cons===t.cons||near[k].vowel===t.vowel))opts.push(near[k]);
    for(k=0;k<near.length&&opts.length<4;k++)
      if(near[k]!==t&&opts.indexOf(near[k])<0)opts.push(near[k]);
    opts=shuffle(opts);
    mbody.innerHTML='<div class="ctorhead">Слог '+(di+1)+' из '+ROUNDS+'</div>'+
      '<div class="brow"><button class="btn brepeat" id="bplayd">🔊 Слушай слог!</button></div>'+
      '<div class="hint">Какой слог ты услышал? Нажми его!</div>'+
      '<div class="poolrow" id="dgrid"></div>'+
      '<div class="fzresult" id="dres"></div>'+
      '<div class="brow" id="dnext" hidden><button class="btn brepeat" id="bnextd">Дальше!</button></div>';
    var bp=document.getElementById('bplayd');
    bp.onclick=function(){playClip(t.audio,bp);};
    playClip(t.audio,bp);
    var dg=document.getElementById('dgrid');
    var solved=false;
    for(k=0;k<opts.length;k++){
      (function(o){
        var b=document.createElement('button');
        b.className='pbtn';
        b.innerHTML=sylHtml(o.cons,o.vowel);
        b.onclick=function(){
          if(o===t){
            if(!solved){solved=true;score++;}
            document.getElementById('dres').textContent='Верно! Это '+t.syllable+'!';
            document.getElementById('dnext').hidden=false;
            progMark(t.id);
          }else{
            document.getElementById('dres').textContent='Не тот! Нажми 🔊 и послушай ещё раз.';
          }
        };
        dg.appendChild(b);
      })(opts[k]);
    }
    document.getElementById('bnextd').onclick=function(){
      di++;
      if(di>=ROUNDS)fin();else round();
      modal.scrollTop=0;
    };
  }
  function fin(){
    stopAudio();
    mbody.innerHTML='<div class="ctorhead">🎉 Диктант окончен: '+score+' из '+ROUNDS+'!</div>'+
      '<div class="brow"><button class="btn brepeat" id="bagain">Ещё раз!</button></div>';
    document.getElementById('bagain').onclick=openDictant;
  }
  round();
  modal.className='modal on';
  modal.scrollTop=0;
}

/* ── «Перепутанные истории»: кадры двух историй смешались — разбери ── */
function openMixed(){
  curCard=null;
  stopAudio();
  mnum.textContent=T('Перепутанные истории','Mixed-up stories');
  var list=shuffle((DATA.stories_list||[]).slice());
  var A=list[0],B=list[1];
  var frames=shuffle(storyFrames(A.key).concat(storyFrames(B.key)));
  var mi=0,score=0;
  function round(){
    if(mi>=frames.length){fin();return;}
    var f=frames[mi];
    mbody.innerHTML='<div class="ctorhead">'+T('Кадр ','Frame ')+(mi+1)+T(' из ',' of ')+frames.length+'</div>'+
      '<img class="pic" src="'+f.image+'" alt="">'+
      '<div class="hint">Из какой это истории? Нажми название!</div>'+
      '<div class="mixrow">'+
        '<button class="btn mixbtn" id="mixa"><span class="stbar" style="background:'+A.color+'"></span>'+A.title+'</button>'+
        '<button class="btn mixbtn" id="mixb"><span class="stbar" style="background:'+B.color+'"></span>'+B.title+'</button>'+
      '</div>'+
      '<div class="fzresult" id="mres"></div>'+
      '<div class="brow" id="mnext" hidden><button class="btn brepeat" id="bnextm">Дальше!</button></div>';
    var solved=false;
    function pick(key){
      if(f.story===key){
        if(!solved){solved=true;score++;}
        document.getElementById('mres').textContent='Верно! Это «'+(f.story===A.key?A.title:B.title)+'»!';
        document.getElementById('mnext').hidden=false;
      }else{
        document.getElementById('mres').textContent='Посмотри внимательнее: кто герой этого кадра?';
      }
    }
    document.getElementById('mixa').onclick=function(){pick(A.key);};
    document.getElementById('mixb').onclick=function(){pick(B.key);};
    document.getElementById('bnextm').onclick=function(){mi++;round();modal.scrollTop=0;};
  }
  function fin(){
    mbody.innerHTML='<div class="ctorhead">'+T('🎉 Разобрал: ','🎉 Sorted: ')+score+T(' из ',' of ')+frames.length+T('!<br>Теперь собери каждую историю по порядку.</div>','!<br>Now build each story in order.</div>')+
      '<div class="mixrow">'+
        '<button class="btn mixbtn" id="mixa"><span class="stbar" style="background:'+A.color+'"></span>'+A.title+'</button>'+
        '<button class="btn mixbtn" id="mixb"><span class="stbar" style="background:'+B.color+'"></span>'+B.title+'</button>'+
      '</div>'+
      '<div class="brow"><button class="btn brepeat" id="bagain">Другие истории!</button></div>';
    document.getElementById('mixa').onclick=function(){openStory(A,storyFrames(A.key));};
    document.getElementById('mixb').onclick=function(){openStory(B,storyFrames(B.key));};
    document.getElementById('bagain').onclick=openMixed;
  }
  round();
  modal.className='modal on';
  modal.scrollTop=0;
}

/* ── звуковой разбор (Фонетика): уровни — разделами, слово — карта ── */
var LEVELS={1:'Уровень 1 · три звука',2:'Уровень 2 · четыре-пять звуков',
            3:'Уровень 3 · мягкие звуки и Ь',4:'Уровень 4 · звуков не столько, сколько букв'};
function makeWordTile(w){
  var t=document.createElement('button');
  t.className='tile';
  if(w.image){
    t.innerHTML='<img src="'+w.image+'" alt="" loading="lazy"><div class="cap">'+w.word+'</div>';
  }else{
    t.innerHTML='<div class="wordface"><b>'+w.word+'</b><span>разбери!</span></div>';
  }
  tilePid(t,w.id);
  if(!w.printed)digBadge(t);
  t.onclick=function(){openRazbor(w);};
  return t;
}
function buildRazborGrid(){
  grid.appendChild(modeBtn('\ud83c\udfc1 Марафон','10 случайных слов — проверь себя!',openMarathon));
  grid.appendChild(modeBtn('🎧 Слушать слова','все слова с чётким ударением',function(){
    var items=[],i,w;
    for(i=0;i<DATA.cards.length;i++){
      w=DATA.cards[i];
      if(!w.audio)continue;
      items.push({html:(w.image?'<img class="fzpic" src="'+w.image+'" alt="">':'')+
        '<div class="sylcard"><b>'+w.word+'</b></div>',audio:w.audio,mark:w.id});
    }
    openPlaylist('Слушаем слова',items);
  }));
  /* «Звуковые боксы» — цифровой близнец планшета «выложи слово фишками»:
     простой вход в звуковой анализ перед полным разбором */
  grid.appendChild(modeBtn('🧩 Выложи фишками','протолкни фишку в бокс за каждый звук',openFonBoxes));
  grid.appendChild(modeBtn('🔢 Сколько звуков?','послушай слово — посчитай звуки',openFonCount));
  /* раздел = уровень; внутри сначала печатные карты, затем цифровые слова */
  var lvl,i,w;
  for(lvl=1;lvl<=4;lvl++){
    var h=document.createElement('div');
    h.className='lvlhead';
    h.textContent=LEVELS[lvl]||('Уровень '+lvl);
    grid.appendChild(h);
    for(i=0;i<DATA.cards.length;i++){
      w=DATA.cards[i];
      if(w.level===lvl)grid.appendChild(makeWordTile(w));
    }
  }
}

/* ── «Звуковые боксы» (Фонетика): цифровой близнец печатного планшета
   «выложи слово фишками» — сегментация на звуки. Простой вход перед полным
   разбором: «выложи фишку за каждый звук» и «сколько звуков?». Фишки-ответы —
   в школьных цветах схемы (гласный красный / твёрдый синий / мягкий зелёный). ── */
function fonColor(c){return c==='red'?SL_RED:c==='green'?SL_GREEN:SL_BLUE;}
function fonSoundText(s){return (s.S||'').replace(/[\[\]]/g,'');} /* «[к]» → «к» */
function fonBoxReveal(w){
  var o='',k,s;
  for(k=0;k<w.sounds.length;k++){
    s=w.sounds[k];
    o+='<span class="sbbox on"><span class="sbg sbg-ru" style="color:'+fonColor(s.c)+'">'+
       fonSoundText(s)+'</span></span>';
  }
  return o;
}
function fonCountOpts(){
  var set={},i,out=[],k;
  for(i=0;i<DATA.cards.length;i++)set[DATA.cards[i].sounds.length]=1;
  for(k in set)if(set.hasOwnProperty(k))out.push(parseInt(k,10));
  out.sort(function(a,b){return a-b;});
  return out;
}
/* «Выложи фишками»: слушаем слово, проталкиваем фишку в бокс за каждый звук */
function openFonBoxes(){
  curCard=null;stopAudio();
  var words=shuffle(DATA.cards.slice()),qi=0;
  function step(){
    stopAudio();
    if(qi>=words.length){closeCard();return;}
    var w=words[qi],n=w.sounds.length,filled=0,done=false,justFilled=-1;
    mnum.textContent='Выложи фишками · '+(qi+1)+' из '+words.length;
    function draw(){
      var boxes='',k,cls,inner;
      for(k=0;k<n;k++){
        cls='sbbox';inner='';
        if(done){cls+=' on';inner='<span class="sbg sbg-ru" style="color:'+fonColor(w.sounds[k].c)+'">'+
          fonSoundText(w.sounds[k])+'</span>';}
        else if(k<filled){cls+=' on';inner='<span class="sbchip'+(k===justFilled?' drop':'')+'"></span>';}
        else if(k===filled){cls+=' active';}
        boxes+='<button class="'+cls+'" data-i="'+k+'">'+inner+'</button>';
      }
      justFilled=-1;
      mbody.innerHTML=(w.image?'<img class="fzpic" src="'+w.image+'" alt="">':'')+
        '<div class="brow"><button class="btn bplay" id="bplay" aria-label="Слушай">▶</button></div>'+
        '<div class="hint">'+(done?('🎉 '+n+' '+plural(n,'звук','звука','звуков')+'!')
          :'Скажи слово медленно и протолкни фишку за каждый звук.')+'</div>'+
        '<div class="sbrow">'+boxes+'</div>'+
        (done?'<div class="sbword">'+w.word+'</div>'+
              '<div class="brow"><button class="btn brepeat" id="bnx">'+
              (qi<words.length-1?'Дальше ›':'Готово!')+'</button></div>':'');
      var bp=document.getElementById('bplay');
      bp.onclick=function(){playClip(w.audio,bp);};
      if(done){document.getElementById('bnx').onclick=function(){qi++;step();};return;}
      var bs=mbody.querySelectorAll('.sbbox'),j;
      for(j=0;j<bs.length;j++)bs[j].onclick=function(e){
        var k=parseInt((e.currentTarget||e.target).getAttribute('data-i'),10);
        if(k!==filled)return;
        justFilled=filled;
        filled++;
        if(filled>=n){done=true;progMark(w.id);}
        draw();
        if(done)playClip(w.audio,document.getElementById('bplay'));
      };
    }
    draw();
    playClip(w.audio,document.getElementById('bplay'));
  }
  step();
  modal.className='modal on';modal.scrollTop=0;
}
/* «Сколько звуков?»: слушаем слово (текст скрыт!) — считаем звуки */
function openFonCount(){
  curCard=null;stopAudio();
  var words=shuffle(DATA.cards.slice()),qi=0,opts=fonCountOpts();
  function round(){
    stopAudio();
    if(qi>=words.length){closeCard();return;}
    var w=words[qi],n=w.sounds.length,ob='',i;
    mnum.textContent='Сколько звуков? · '+(qi+1)+' из '+words.length;
    for(i=0;i<opts.length;i++)ob+='<button class="btn sbnum" data-n="'+opts[i]+'">'+opts[i]+'</button>';
    mbody.innerHTML=(w.image?'<img class="fzpic" src="'+w.image+'" alt="">':'')+
      '<div class="brow"><button class="btn bplay" id="bplay" aria-label="Слушай">▶</button></div>'+
      '<div class="hint">Послушай слово. Сколько в нём звуков?</div>'+
      '<div class="sbnums">'+ob+'</div>'+
      '<div class="fzresult" id="res"></div>';
    var bp=document.getElementById('bplay');
    bp.onclick=function(){playClip(w.audio,bp);};
    playClip(w.audio,bp);
    var nb=mbody.querySelectorAll('.sbnum'),j;
    for(j=0;j<nb.length;j++)nb[j].onclick=function(e){
      var self=e.currentTarget||e.target,pick=parseInt(self.getAttribute('data-n'),10);
      if(pick===n){
        progMark(w.id);self.className+=' ok';
        var r=document.getElementById('res');
        if(r)r.innerHTML='<div class="sbrow">'+fonBoxReveal(w)+'</div><div class="sbok">🎉 '+w.word+'</div>';
        burst();
        playClip(w.audio,bp);
        qi++;setTimeout(round,1600);
      }else{
        self.className+=' bad';
        setTimeout(function(){self.className=self.className.replace(' bad','');},550);
      }
    };
  }
  round();
  modal.className='modal on';modal.scrollTop=0;
}

/* карта разбора: слово + ▶ → пустые кружки (нажми — крась по кругу
   красный/синий/зелёный; нажми над кружком — поставь ударение) →
   «Проверить» → ✓/✗ по каждому звуку → эталонная схема.
   Чекбокс «показывать схему» — режим подсказки. */
var COLOR_CYCLE=[null,'red','blue','green'];
function openRazbor(w,mar){
  curCard=null;
  stopAudio();
  mnum.textContent=mar?('Марафон · слово '+mar.idx+' из '+mar.total)
                      :('Слово '+pad(w.id)+' · уровень '+w.level);
  var state=[],i;
  for(i=0;i<w.sounds.length;i++)state.push({color:null,stress:false});
  var html='<div class="fzword"><b>'+w.word+'</b>'+
           '<button class="btn bplay" id="bplay" aria-label="Слушай">▶</button></div>'+
           (w.image?'<img class="fzpic" src="'+w.image+'" alt="">':'')+
           '<div id="fzgrid"></div>'+
           '<div class="fzrow"><button class="btn brepeat" id="bcheck">Проверить</button></div>'+
           '<div class="fzresult" id="fzresult"></div>'+
           '<label class="fzhint"><input type="checkbox" id="fzshow"> показывать схему</label>'+
           '<div class="fzet" id="fzet" hidden><div class="fzetlab">Схема-ответ</div></div>'+
           '<div class="hint">Нажми кружок — раскрась звук. Нажми над кружком — поставь ударение.</div>';
  mbody.innerHTML=html;
  var bp=document.getElementById('bplay');
  bp.onclick=function(){playClip(w.audio,bp);};
  var avail=Math.min(560,window.innerWidth)-28-12*w.sounds.length;
  var d=Math.min(56,Math.floor(avail/w.sounds.length));
  if(d<34)d=34;
  /* пустая интерактивная схема */
  var fz=document.getElementById('fzgrid');
  var cells=[];
  (function(){
    var sch=window.RECH_SCHEMA.render(w.sounds,{d:d,colors:DATA.colors,showS:false});
    var toks=sch.getElementsByClassName('schtok'),k;
    for(k=0;k<toks.length;k++){
      (function(k,tok){
        tok.className+=' fzcell';
        var circle=tok.getElementsByClassName('schc')[0];
        circle.style.background='#fff';
        circle.innerHTML='';
        var stressEl=tok.getElementsByClassName('schstress')[0];
        stressEl.textContent='´';
        var ver=document.createElement('div');
        ver.className='fzver';
        tok.appendChild(ver);
        cells.push({tok:tok,circle:circle,stressEl:stressEl,ver:ver});
        circle.onclick=function(){
          var idx=(COLOR_CYCLE.indexOf(state[k].color)+1)%COLOR_CYCLE.length;
          state[k].color=COLOR_CYCLE[idx];
          circle.style.background=state[k].color?window.RECH_SCHEMA.colorOf(state[k].color,DATA.colors):'#fff';
          ver.textContent='';
        };
        stressEl.onclick=function(){
          /* ударение одно на слово: ставим здесь — снимаем с остальных */
          var was=state[k].stress,m;
          for(m=0;m<state.length;m++){
            state[m].stress=false;
            cells[m].tok.className=cells[m].tok.className.replace(/ ?stressed/,'');
            cells[m].ver.textContent='';
          }
          state[k].stress=!was;
          if(state[k].stress)tok.className+=' stressed';
        };
      })(k,toks[k]);
    }
    fz.appendChild(sch);
  })();
  /* эталон */
  var et=document.getElementById('fzet');
  et.appendChild(window.RECH_SCHEMA.render(w.sounds,{d:Math.round(d*0.86),colors:DATA.colors,
    counts:{letters:w.letters_n,sounds:w.sounds_n}}));
  document.getElementById('fzshow').onchange=function(){et.hidden=!this.checked;};
  /* проверка: кружки (цвета) и ударение — раздельно.
     В односложном слове ударение не требуется (школьная норма). */
  document.getElementById('bcheck').onclick=function(){
    var ok=0,k,expected=-1,user=-1,vowels=0;
    for(k=0;k<w.sounds.length;k++){
      if(w.sounds[k].c==='red')vowels++;
      if(w.sounds[k].stress)expected=k;
      if(state[k].stress)user=k;
      var good=(state[k].color===w.sounds[k].c);
      cells[k].ver.textContent=good?'✓':'✗';
      if(good)ok++;
    }
    var stressOk=(user===expected)||(user===-1&&vowels<2);
    var allOk=(ok===w.sounds.length&&stressOk);
    if(allOk)progMark(w.id);
    var res=document.getElementById('fzresult');
    if(ok===w.sounds.length&&stressOk)res.textContent='Молодец! Всё верно!';
    else if(ok===w.sounds.length)res.textContent='Кружки верные! Поставь ударение — нажми над ударным гласным.';
    else res.textContent='Кружки: верно '+ok+' из '+w.sounds.length+' — попробуй ещё!';
    et.hidden=false;
    document.getElementById('fzshow').checked=true;
    if(mar&&!mar.answered){
      mar.answered=true;
      var row=document.createElement('div');
      row.className='fzrow';
      row.innerHTML='<button class="btn brepeat" id="bmnext">Дальше \u2192</button>';
      mbody.appendChild(row);
      document.getElementById('bmnext').onclick=function(){mar.next(allOk);};
    }
  };
  modal.className='modal on';
  modal.scrollTop=0;
}

/* марафон разбора: 10 случайных слов подряд со счётом */
function openMarathon(){
  var words=shuffle(DATA.cards.slice()).slice(0,10),mi=0,score=0;
  function show(){
    openRazbor(words[mi],{idx:mi+1,total:words.length,next:function(okAll){
      if(okAll)score++;
      mi++;
      if(mi>=words.length)fin();else show();
      modal.scrollTop=0;
    }});
  }
  function fin(){
    curCard=null;
    stopAudio();
    mnum.textContent='Марафон';
    mbody.innerHTML='<div class="ctorhead">\ud83c\udfc1 Марафон окончен: <b>'+score+' из '+words.length+'</b>!</div>'+
      '<div class="brow"><button class="btn brepeat" id="bagain">Ещё марафон!</button></div>';
    burst();
    document.getElementById('bagain').onclick=openMarathon;
  }
  show();
}

/* ── карта крупно ── */
var curCard=null,curSide='a';

function renderSide(){
  stopAudio();
  var s=curCard.sides[curSide],html='',i,it;
  mnum.textContent=T('Карта ','Card ')+pad(curCard.id)+T(' · сторона ',' · side ')+(curSide==='a'?'1':'2');
  if(curCard.type==='letter'){
    html='<div class="fzword"><b class="bigletter">'+letterHtml(s)+'</b>'+
         '<button class="btn bplay" id="bplay" aria-label="Слушай">▶</button></div>'+
         '<img class="pic" src="'+s.image+'" alt="">'+
         '<div class="hint">Нажми картинку — на обороте буква-сестра!</div>';
    mbody.innerHTML=html;
    var bp1=document.getElementById('bplay');
    bp1.onclick=function(){playClip(s.audio,bp1);progMark(curCard.id);};
    return;
  }
  if(curCard.type==='syllable'){
    html='<div class="sylcard"><b>'+sylHtml(s.cons,s.vowel)+'</b></div>'+
         '<div class="brow"><button class="btn bplay" id="bplay" aria-label="Слушай">▶</button></div>'+
         '<div class="hint">Прочитай слитно! Нажми карту — другой слог.</div>';
    mbody.innerHTML=html;
    var bp2=document.getElementById('bplay');
    bp2.onclick=function(){playClip(s.audio,bp2);progMark(curCard.id);};
    return;
  }
  if(curCard.type==='word'){
    html='<div class="fzword"><b>'+s.syllabified+'</b>'+
         '<button class="btn bplay" id="bplay" aria-label="Слушай">▶</button></div>'+
         '<img class="pic" src="'+s.image+'" alt="">'+
         '<div class="hint">Прочитай по слогам, потом целиком — и проверь озвучкой!</div>';
    mbody.innerHTML=html;
    var bp3=document.getElementById('bplay');
    bp3.onclick=function(){playClip(s.audio,bp3);progMark(curCard.id);};
    return;
  }
  if(curCard.type==='sounds'){
    html='<div class="stitle">'+s.title+'</div><div class="sgrid" id="sgrid"></div>'+
         '<div class="hint">'+T('Нажми картинку — услышишь звук!<br>Нажми рядом — переверни карту.','Tap a picture to hear its sound!<br>Tap beside them to flip the card.')+'</div>';
    mbody.innerHTML=html;
    var sg=document.getElementById('sgrid');
    for(i=0;i<s.items.length;i++){
      it=s.items[i];
      (function(it){
        var cell=document.createElement('button');
        cell.className='scell';
        cell.innerHTML='<img src="'+it.image+'" alt=""><div class="lab">'+it.label+'</div>';
        cell.onclick=function(){playClip(it.audio,cell);progMark(curCard.id);};
        sg.appendChild(cell);
      })(it);
    }
    return;
  }
  var tag=(LOGOPED&&s.sound&&s.color)?
    '<span class="soundtag" style="background:'+s.color+'">'+T('Звук ','Sound ')+s.sound+'</span>':'';
  html=tag+
    '<div class="syrow"><span class="syll">'+s.syllable+'</span>'+
      '<button class="btn bplay" id="bplay" aria-label="Слушай">▶</button></div>'+
    (LOGOPED?tempoRowHtml():'')+
    '<img class="pic" src="'+s.image+'" alt="">'+
    '<div class="verse">'+hlVerse(s.verse,s.sound,s.color)+'</div>'+
    (LOGOPED?'<div class="brow"><button class="btn brepeat" id="brepeat">'+T('🗣 Повтори за диктором','🗣 Say it after the narrator')+'</button></div>':'')+
    '<div class="turn" id="turn">'+T('🗣 Твоя очередь!','🗣 Your turn!')+'</div>'+
    '<div class="hint">'+T('Нажми картинку — переверни карту!','Tap the picture to flip the card!')+'</div>';
  mbody.innerHTML=html;
  if(LOGOPED)bindTempoRow();
  var bp=document.getElementById('bplay');
  bp.onclick=function(){playClip(s.audio,bp);progMark(curCard.id);};
  /* режим «повтори за диктором»: play → пауза → индикатор «твоя очередь» */
  var br=document.getElementById('brepeat');
  if(br)br.onclick=function(){
    var turn=document.getElementById('turn');
    turn.className='turn';
    playClip(s.audio,bp,function(){
      turn.className='turn on';
      var wait=Math.max(2500,(player.duration||2.5)*1000);
      setTimeout(function(){
        if(turn.parentNode)turn.className='turn';
      },wait);
    });
  };
}

/* переворот — нажатие по самой карте: у болталки/чистоговорки — по
   картинке/слогу/тексту, у звуковой — по названию или фону
   (кнопки — ▶, «Повтори», ячейки звуков — переворот не вызывают) */
function flipCard(){
  curSide=(curSide==='a')?'b':'a';
  renderSide();
  flipMbody();
  modal.scrollTop=0;
}
/* ── конструктор слов («Читаем по слогам») ── */
function shuffle(arr){
  var i,j,t;
  for(i=arr.length-1;i>0;i--){
    j=Math.floor(Math.random()*(i+1));
    t=arr[i];arr[i]=arr[j];arr[j]=t;
  }
  return arr;
}
function openConstructor(){
  curCard=null;
  stopAudio();
  var words=shuffle((DATA.constructor_words||[]).slice());
  var wi=0,showSample=true;
  var WKEY=PKEY?PKEY+'_words':null;
  var WST={};
  try{if(WKEY)WST=JSON.parse(localStorage.getItem(WKEY)||'{}')||{};}catch(e){WST={};}
  function wstCount(){var n=0,k;for(k in WST)if(WST.hasOwnProperty(k))n++;return n;}
  var solved=wstCount();
  mnum.textContent='Конструктор слов';
  function inventory(){
    var inv=[],i,c;
    for(i=0;i<DATA.cards.length;i++){
      c=DATA.cards[i];
      if(c.type==='syllable')inv.push({s:c.syllable,cons:c.cons,vowel:c.vowel});
    }
    return inv;
  }
  var INV=inventory();
  function round(){
    stopAudio();
    var w=words[wi%words.length];
    var slots=[],pool=[],i;
    for(i=0;i<w.syllables.length;i++)slots.push(null);
    /* пул: нужные слоги + 3 отвлекающих */
    var need=w.syllables.slice(),extra=[];
    var cand=shuffle(INV.slice());
    for(i=0;i<cand.length&&extra.length<3;i++)
      if(need.indexOf(cand[i].s)<0)extra.push(cand[i].s);
    pool=shuffle(need.concat(extra));
    var html='<div class="ctorhead">Собери слово'+
      (words.length?' · найдено '+solved+' из '+words.length:'')+'</div>'+
      '<div class="ctorsample" id="csample"'+(showSample?'':' style="visibility:hidden"')+'>'+w.syllables.join('-')+'</div>'+
      '<label class="fzhint"><input type="checkbox" id="cshow"'+(showSample?' checked':'')+'> показывать образец</label>'+
      '<div class="slotrow" id="cslots"></div>'+
      '<div class="poolrow" id="cpool"></div>'+
      '<div class="fzresult" id="cres"></div>'+
      '<div class="brow" id="cnext" hidden><button class="btn brepeat" id="bnext">Ещё слово!</button></div>'+
      '<div class="hint">Нажимай слоги по порядку — собери слово, как в образце.</div>';
    mbody.innerHTML=html;
    document.getElementById('bnext').onclick=function(){wi++;round();modal.scrollTop=0;};
    document.getElementById('cshow').onchange=function(){
      showSample=this.checked;
      document.getElementById('csample').style.visibility=showSample?'visible':'hidden';
    };
    var cslots=document.getElementById('cslots');
    var cpool=document.getElementById('cpool');
    var res=document.getElementById('cres');
    function sylOf(str){
      var k;
      for(k=0;k<INV.length;k++)if(INV[k].s===str)return sylHtml(INV[k].cons,INV[k].vowel);
      return str;
    }
    function redraw(){
      cslots.innerHTML='';cpool.innerHTML='';
      var k;
      for(k=0;k<slots.length;k++){
        (function(k){
          var el=document.createElement('button');
          el.className='slot'+(slots[k]?' filled':'');
          el.innerHTML=slots[k]?sylOf(slots[k]):'';
          el.onclick=function(){ if(slots[k]){slots[k]=null;res.textContent='';redraw();} };
          cslots.appendChild(el);
        })(k);
      }
      for(k=0;k<pool.length;k++){
        (function(k){
          /* кнопка «занята», если её экземпляр слога уже стоит в слоте */
          var m,already=0;
          for(m=0;m<k;m++)if(pool[m]===pool[k])already++;
          var used=(countIn(slots,pool[k])>already);
          var el=document.createElement('button');
          el.className='pbtn'+(used?' used':'');
          el.innerHTML=sylOf(pool[k]);
          el.onclick=function(){
            if(used)return;
            var m2;
            for(m2=0;m2<slots.length;m2++)if(!slots[m2]){slots[m2]=pool[k];break;}
            check();redraw();
          };
          cpool.appendChild(el);
        })(k);
      }
    }
    function countIn(arr,v){var m,c2=0;for(m=0;m<arr.length;m++)if(arr[m]===v)c2++;return c2;}
    function check(){
      var k,full=true;
      for(k=0;k<slots.length;k++)if(!slots[k])full=false;
      if(!full){res.textContent='';return;}
      var ok=true;
      for(k=0;k<slots.length;k++)if(slots[k]!==w.syllables[k])ok=false;
      if(ok){
        if(!WST[w.word]){
          WST[w.word]=true;
          try{if(WKEY)localStorage.setItem(WKEY,JSON.stringify(WST));}catch(e){}
        }
        solved=wstCount();
        res.textContent='Молодец! '+w.word+'!';
        document.getElementById('cnext').hidden=false;
        /* если слово есть на карте — озвучиваем */
        var m,c2;
        for(m=0;m<DATA.cards.length;m++){
          c2=DATA.cards[m];
          if(c2.type==='word'&&c2.word===w.word){playClip(c2.audio,null);break;}
        }
      }else{
        res.textContent='Почти! Нажми слог — убери и попробуй ещё.';
      }
    }
    redraw();
  }
  round();
  modal.className='modal on';
  modal.scrollTop=0;
}

mbody.onclick=function(e){
  if(RAZBOR||SLOGI&&!curCard)return;
  if(!curCard)return; /* у разбора/конструктора переворота нет */
  var t=(e&&e.target)||window.event.srcElement;
  while(t&&t!==mbody){
    if(t.nodeName==='BUTTON')return;
    t=t.parentNode;
  }
  flipCard();
};

function openCard(card){
  curCard=card;
  /* при активном фильтре открываем подходящую сторону */
  curSide=(card.sides.a&&sideMatches(card.sides.a))?'a':(card.sides.b?'b':'a');
  renderSide();
  modal.className='modal on';
  modal.scrollTop=0;
}
function closeCard(){
  stopAudio();
  kqStop();
  modal.className='modal';
}
document.getElementById('bclose').onclick=closeCard;

/* заставка → «Начать» (играет приветствие, если задано) → иконостас */
var splash=document.getElementById('splash');
if(splash){
  document.getElementById('bstart').onclick=function(){
    splash.className='splash off';
    if(CFG.intro)playClip(CFG.intro,null);
    onboard();
  };
}

buildChips();
buildGrid();
if(!splash)onboard();
})();
