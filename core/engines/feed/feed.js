/* Движок «лента-энциклопедия» (feed). Читает window.FEED_CARDS (данные колоды),
   сам строит TikTok-ленту: полноэкранные карточки, вертикальный свайп, мини-
   интерактив в карточке, накопление «графа знаний» и родительский вид.
   Продукт НЕ начинается с вопросов: сначала ребёнок листает и узнаёт, вопросы-
   проверки лежат в данных дальше (появляются, когда знаний уже накопилось). */
(function(){
  "use strict";
  // Главы ленты идут по порядку: FEED_OPENING (глава 1) + FEED_CHAPTERS[] (2,3,…).
  // Совместимость со старым форматом — window.FEED_CARDS.
  var CHAPS = [];
  if(window.FEED_OPENING) CHAPS.push(window.FEED_OPENING);
  (window.FEED_CHAPTERS || []).forEach(function(c){ if(c && CHAPS.indexOf(c)<0) CHAPS.push(c); });
  var DATA = window.FEED_CARDS || {cards:[]};
  /* ── мультиязычность данных (аддитивно): любое поле-объект вида {ru:"…",en:"…"}
     в данных колоды (карточки/граф/программа) разрешается в строку по текущему
     языку (FP.langKey в localStorage; дефолт ru). Колоды с обычными строками
     не меняются. Смена языка в «Родителям» перезагружает ленту. ── */
  var LOC_CODES = {ru:1,en:1,de:1,es:1,pt:1,fr:1,ar:1};
  var LOCALIZED = false;
  var LANG = (function(){ var fp=window.FEED_PROGRAM||{};
    var k=fp.langKey, v=null; try{ v=k&&localStorage.getItem(k); }catch(e){}
    var list=(fp.langs||[]).map(function(l){ return l[0]; });
    if(v && (!list.length || list.indexOf(v)>=0)) return v;
    return (list.length && list.indexOf("ru")<0) ? list[0] : "ru"; })();
  function locLeaf(v){
    if(!v || typeof v!=="object" || Array.isArray(v)) return null;
    var ks=Object.keys(v); if(!ks.length) return null;
    for(var i=0;i<ks.length;i++){ if(!LOC_CODES[ks[i]] || typeof v[ks[i]]!=="string") return null; }
    LOCALIZED=true;
    return (v[LANG]!=null) ? v[LANG] : (v.ru!=null ? v.ru : v[ks[0]]);
  }
  function locWalk(o){
    if(!o || typeof o!=="object") return o;
    if(Array.isArray(o)){ for(var i=0;i<o.length;i++){ var lv=locLeaf(o[i]); o[i]=(lv!=null)?lv:locWalk(o[i]); } return o; }
    for(var k in o){ if(o.hasOwnProperty(k)){ var l=locLeaf(o[k]); if(l!=null) o[k]=l; else locWalk(o[k]); } }
    return o;
  }
  locWalk(CHAPS); locWalk(window.FEED_GRAPH||null); locWalk(window.FEED_PROGRAM||null); locWalk(DATA);
  var CARDS = [], CARDCH = [], CHAPMETA = [];   // CARDCH[i]=индекс главы карты; CHAPMETA=мета глав
  CHAPS.forEach(function(c, ci){
    var start = CARDS.length, list = c.cards || [];
    list.forEach(function(k){ CARDS.push(k); CARDCH.push(ci); });
    CHAPMETA.push({ num:c.chapter||(ci+1), title:c.title||"", emoji:c.emoji||"",
                    icon:c.icon||"", color:c.color||"#e06104", start:start, count:list.length });
  });
  if(!CARDS.length){ CARDS=(DATA.cards||[]).slice();
    CARDS.forEach(function(){ CARDCH.push(0); });
    CHAPMETA.push({num:1,title:"",emoji:"",color:"#e06104",start:0,count:CARDS.length}); }
  var FP = window.FEED_PROGRAM || {};
  var PROG_CH = FP.chapters || CHAPMETA.length;
  // §7 (опционально, per-колода): один режим-меню. Путь по главам вшивается в
  // экран графа, вход — только по ярлыку главы слева вверху; кнопка-родитель и
  // нижний мини-граф прячутся. Без флага — прежние три входа (чужие колоды не меняются).
  var SINGLE_MENU = FP.singleMenu === true;
  // §17 (опционально): звёзды-вехи — ⭐ за собранный раздел и за новый ранг
  var MILESTONE_STARS = FP.milestoneStars === true;
  // §12 (опционально, per-колода): интервальное повторение пройденных интерактивов
  var REVIEW = FP.review || null;        // {every,gap,solid}
  // Нижнее меню-компаньон (опционально): лента-оболочка + разделы соседней
  // энциклопедии + «Родителям». FP.nav=[{id,label,emoji|icon,src?}]; спец-id:
  // "feed" (домой), "parent" (родительский экран). FP.langKey/FP.langs — язык
  // в родительском экране (управляет встроенной энциклопедией). Без FP.nav —
  // прежнее поведение (чужие колоды не меняются).
  var NAV = (FP.nav && FP.nav.length) ? FP.nav : null;
  var LANGKEY = FP.langKey || null;
  var LANGLIST = FP.langs || null;
  var NS = (CHAPS[0] && CHAPS[0].deck) || DATA.deck || "feed";
  function chMeta(){ return CHAPMETA[CARDCH[idx]] || CHAPMETA[0] || {num:1,title:"",emoji:"",color:"#e06104",start:0,count:CARDS.length}; }
  var K_LEARN = NS + "_feed_learned", K_POS = NS + "_feed_pos", K_MUTE = NS + "_feed_mute";

  /* озвучка (голос Marina). Включается, когда глава объявляет audio:true и рядом
     лежат mp3 voice/<id>.mp3. До этого движок молчит (никаких запросов). */
  var AUDIO_ON = CHAPS.some(function(c){ return c && c.audio===true; }) || DATA.audio===true;
  var AUDIODIR = (CHAPS[0] && CHAPS[0].audioDir) || DATA.audioDir || "voice/";
  var au = AUDIO_ON ? new Audio() : null;
  var muted = localStorage.getItem(K_MUTE)==="1";
  var unlocked = false;                            // автоплей разрешён после первого жеста
  function audioSrc(card){
    if(!AUDIO_ON || !card || card.narrate===false) return null;
    return card.audio || (card.id ? AUDIODIR + card.id + ".mp3" : null);
  }
  function stopAudio(){ if(au){ try{ au.pause(); }catch(e){} } }
  function playCard(card, force){
    if(!au || (muted && !force)) return;
    var src = audioSrc(card); if(!src) return;
    try{ au.pause(); au.src = src; au.currentTime = 0;
      var pr = au.play(); if(pr && pr.catch) pr.catch(function(){}); }catch(e){}
  }

  /* ── ведущий Marina (§11): голосовая реакция на ответ — похвала за верный,
     мягкая поддержка при ошибке. Опт-ин: FEED_PROGRAM.presenter или
     FEED_GRAPH.presenter. Голос — студийный клип voice/say/<key>.mp3, если он
     есть в манифесте (FEED_PROGRAM.sayClips), иначе офлайн SpeechSynthesis (ru).
     Молчит при выключенной озвучке. Чужие колоды без флага не меняются. ── */
  var PRESENTER = FP.presenter === true || (window.FEED_GRAPH && window.FEED_GRAPH.presenter === true);
  var SAYDIR = (typeof FP.sayDir === "string" && FP.sayDir) || (AUDIODIR + "say/");
  var SAYSET = {}; (FP.sayClips || []).forEach(function(k){ SAYSET[k]=1; });
  var PRAISE = FP.praise || ["Молодец!","Верно!","Отлично!","Умница!","Здорово!","Так держать!"];
  var CHEER  = FP.cheer  || ["Почти! Ничего страшного.","Не беда — теперь запомнишь!","Бывает! Дальше получится."];
  var sayAu = PRESENTER ? new Audio() : null;
  var SS = window.speechSynthesis || null, ssVoice = null;
  function pickSSVoice(){ if(!SS) return; var vs=SS.getVoices()||[], best=null, i;
    for(i=0;i<vs.length;i++){ var v=vs[i], l=(v.lang||"").toLowerCase();
      if(l.indexOf("ru")===0){ if(!best) best=v; if(/milena|katya|tatyana|alena/i.test(v.name)) best=v; } }
    ssVoice=best; }
  if(PRESENTER && SS){ pickSSVoice(); try{ SS.onvoiceschanged=pickSSVoice; }catch(e){} }
  function speakSS(text){ if(!SS || !text) return;
    try{ SS.cancel(); var u=new SpeechSynthesisUtterance(text);
      u.lang="ru-RU"; if(ssVoice) u.voice=ssVoice; u.rate=0.98; u.pitch=1.06;
      SS.speak(u); }catch(e){} }
  var lastSay=0, sayIx={good:0,bad:0};
  function presenterSay(kind){   // 'good' | 'bad'
    if(!PRESENTER || muted) return;
    var now=(new Date()).getTime(); if(now-lastSay<1400) return;   // не тараторить
    lastSay=now;
    var bank = kind==="bad" ? CHEER : PRAISE;
    var i = Math.floor(Math.random()*bank.length);
    var key = (kind==="bad"?"bad":"good")+(i+1);
    if(sayAu && SAYSET[key]){                       // студийный клип Marina
      try{ sayAu.pause(); sayAu.src=SAYDIR+key+".mp3"; sayAu.currentTime=0;
        var pr=sayAu.play(); if(pr&&pr.catch) pr.catch(function(){ speakSS(bank[i]); }); }catch(e){ speakSS(bank[i]); }
    } else speakSS(bank[i]);                         // офлайн-фолбэк
  }
  /* iOS отдаёт синтез только после первого касания — «разогреваем» беззвучно */
  if(PRESENTER && SS){ var warmSS=function(){ try{ var u=new SpeechSynthesisUtterance("м"); u.volume=0; u.lang="ru-RU"; SS.speak(u); }catch(e){}
    document.removeEventListener("pointerdown",warmSS); };
    document.addEventListener("pointerdown",warmSS); }

  /* ── общий say(clips, fallback, then): проигрывает последовательность клипов
     (AUDIODIR/<clip>.mp3), при ошибке/отсутствии клипа — офлайн SpeechSynthesis
     тем же текстом (fallback). Универсальная озвучка произвольного контента
     (портирована из Кругосветки, app.js say()): нужна для озвучки-на-открытии
     инфочипа и будущих гео-механик-плагинов (доступна им как api.say). Молчит
     при выключенном звуке и до первого жеста (автоплей запрещён). ── */
  var sayAu2 = null;
  function say(clips, fallback, then){
    clips = (clips || []).filter(Boolean);
    if(muted || !unlocked){ if(then) then(); return; }          // тихо: выкл. звук / нет жеста
    if(!AUDIO_ON || !clips.length){ if(SS && fallback) speakSS(fallback); if(then) then(); return; }
    if(!sayAu2) sayAu2 = new Audio();
    var i = 0, spoke = false;
    function fail(){ if(!spoke){ spoke = true; if(SS && fallback) speakSS(fallback); } if(then) then(); }
    function next(){
      if(i >= clips.length){ if(then) then(); return; }
      var src = AUDIODIR + clips[i] + ".mp3"; i++;
      try{ sayAu2.pause(); sayAu2.onended = next; sayAu2.onerror = fail;
        sayAu2.src = src; sayAu2.currentTime = 0;
        var pr = sayAu2.play(); if(pr && pr.catch) pr.catch(fail);
      }catch(e){ fail(); }
    }
    next();
  }

  /* ── голосовой ответ (§11): ребёнок может НАЗВАТЬ ответ на карточке-вопросе,
     а не только нажать. Опт-ин FEED_PROGRAM.voiceAnswer + наличие Web Speech.
     Сверяем сказанное с подписями вариантов (мягкое сравнение со стеммингом). ── */
  var VOICE_ANSWER = FP.voiceAnswer === true;
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var srActive=null, curMic=null, srState={token:0,done:true,targets:null,onHit:null};
  function normVoice(s){ s=String(s).toLowerCase().replace(/ё/g,"е").replace(/[^а-яa-z0-9 -]/g," ").replace(/\s+/g," ").replace(/^\s+|\s+$/g,"");
    return s.replace(/^(это|эта|этот|наверное|думаю|кажется|точно|конечно)\s+/g,""); }
  function stemRu(w){ w=w.replace(/(иями|ями|ами|иях|иям|ого|его|ому|ему|ыми|ими|ах|ях|ам|ям|ом|ем|ой|ей|ий|ый|ая|яя|ое|ее|ую|юю|ов|ев|ье|ья)$/,"");
    return w.replace(/[аеиоуыэюяйь]{1,2}$/,""); }
  function levV(a,b){ if(Math.abs(a.length-b.length)>3) return 9; var m=[],i,j;
    for(i=0;i<=a.length;i++){m[i]=[i];} for(j=1;j<=b.length;j++)m[0][j]=j;
    for(i=1;i<=a.length;i++)for(j=1;j<=b.length;j++) m[i][j]=Math.min(m[i-1][j]+1,m[i][j-1]+1,m[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
    return m[a.length][b.length]; }
  function wordMatchV(w,t){ if(w===t) return true; var ws=stemRu(w),ts=stemRu(t);
    if(ws&&ws===ts) return true; if(ws.length>=6&&ts.length>=6&&levV(ws,ts)<=1) return true; return false; }
  function voiceMatch(heard,target){ var h=normVoice(heard),t=normVoice(target); if(!h||!t) return false;
    if(h===t) return true; var tw=t.split(/[ -]+/).filter(function(x){return x.length>1;}), hw=h.split(/[ -]+/);
    for(var i=0;i<tw.length;i++){ var f=false; for(var j=0;j<hw.length;j++) if(wordMatchV(hw[j],tw[i])){f=true;break;} if(!f) return false; }
    return true; }
  function micUI(on){ if(curMic) curMic.classList.toggle("on", !!on); }
  function stopSR(){ srState.done=true; if(srActive){ var r=srActive; srActive=null; try{ r.onend=null; r.abort(); }catch(e){} } micUI(false); }
  function srListen(){ if(!SR||srState.done||srActive) return; var tok=srState.token, rec;
    try{ rec=new SR(); }catch(e){ return; } rec.lang="ru-RU"; rec.interimResults=false; rec.maxAlternatives=5; srActive=rec;
    rec.onresult=function(ev){ if(tok!==srState.token) return; var alts=[],i,j;
      for(i=0;i<ev.results.length;i++) for(j=0;j<ev.results[i].length;j++) alts.push(ev.results[i][j].transcript);
      var t=srState.targets, hit=null;
      for(i=0;i<alts.length&&!hit;i++) for(j=0;j<t.length&&!hit;j++){ var forms=[t[j].t].concat(t[j].say||[]);
        for(var k=0;k<forms.length;k++) if(voiceMatch(alts[i],forms[k])){ hit=t[j]; break; } }
      if(hit){ var cb=srState.onHit; stopSR(); if(cb) cb(hit); } };
    rec.onerror=function(){};
    rec.onend=function(){ if(srActive===rec) srActive=null; micUI(false);
      if(tok===srState.token&&!srState.done){ setTimeout(function(){ if(tok===srState.token&&!srState.done) srListen(); },400); } };
    try{ rec.start(); micUI(true); }catch(e){ srActive=null; }
  }
  /* btn — сам DOM-узел кнопки (карточка ещё не в документе, id-поиск не сработает) */
  function armVoiceAnswer(btn,targets,onHit){ stopSR();
    curMic=btn;
    srState={token:srState.token+1,done:false,targets:targets,onHit:onHit};
    if(!btn) return;
    btn.onclick=function(e){ e.stopPropagation();
      if(srActive){ stopSR(); }
      else { srState.done=false; srListen(); } };
  }

  function $(id){ return document.getElementById(id); }
  function div(cls){ var e=document.createElement("div"); if(cls)e.className=cls; return e; }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
  function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;} return a; }
  function jget(k,d){ try{ return JSON.parse(localStorage.getItem(k)) || d; }catch(e){ return d; } }
  function jset(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  function darken(hex,f){ var m=/^#?([0-9a-f]{6})$/i.exec(hex||""); if(!m)return hex||"#c0603a";
    var n=parseInt(m[1],16), r=(n>>16)&255, g=(n>>8)&255, b=n&255;
    return "rgb("+Math.round(r*f)+","+Math.round(g*f)+","+Math.round(b*f)+")"; }

  var learned = jget(K_LEARN, {});
  function isLearned(id){ return !!learned[id]; }
  function mark(id){ if(!learned[id]){ learned[id]=1; jset(K_LEARN, learned); refreshHud(); } }

  /* граф знаний: органы по системам (window.FEED_GRAPH). Орган «изучен», если
     ребёнок прошёл карточку с knows:[id] или успешно поставил/нашёл его. */
  var GRAPH = window.FEED_GRAPH || {systems:[]};
  // словарь узла настраивается на колоду (тело → «орган», Библия → «история»…)
  var NODE_NEW = GRAPH.newNodeLabel || "Новый орган!";   // плашка-салют при загорании
  var NODE_GEN = GRAPH.unitGen || "органов";             // родит. мн.: «из N …»
  var CTR_EMOJI = GRAPH.centerEmoji || "🧑";             // центр графа-констелляции
  var CTR_LABEL = GRAPH.centerLabel || "ТЕЛО";
  var CTR_ICON = GRAPH.centerIcon || null;
  /* растровые иконки вместо эмодзи (опт-ин на колоду): любое место с эмодзи
     принимает и путь *icon (webp-стикер, рендерится круглым чипом); без него —
     прежний эмодзи, чужие колоды не меняются. UII — иконки интерфейса:
     { star, bonus, reveal, plain:true (убрать 🎉-суффиксы) }. */
  var UII = GRAPH.uiIcons || {};
  function em(icon, emoji, cls){
    return icon ? '<img class="fico'+(cls?" "+cls:"")+'" src="'+icon+'" alt="">'
                : (emoji!=null && emoji!=="" ? '<span class="femo'+(cls?" "+cls:"")+'">'+emoji+'</span>' : "");
  }
  function svgIco(icon, x, y, r){   // круглый стикер внутри SVG (clip окружностью)
    var id="ci"+Math.round(x*10)+"_"+Math.round(y*10);
    return '<clipPath id="'+id+'"><circle cx="'+x+'" cy="'+y+'" r="'+r+'"/></clipPath>'+
      '<image href="'+icon+'" x="'+(x-r)+'" y="'+(y-r)+'" width="'+(r*2)+'" height="'+(r*2)+'" clip-path="url(#'+id+')"/>';
  }
  function doneTxt(s){ return UII.plain ? s : s + " 🎉"; }
  var K_KNOW = NS + "_feed_know";
  var known = jget(K_KNOW, {});
  var ALLORG = {}, ORGMETA = {};
  GRAPH.systems.forEach(function(sy){ sy.organs.forEach(function(o){
    ALLORG[o.id]=1; ORGMETA[o.id]={name:o.name, color:sy.color, emoji:sy.emoji, icon:sy.icon, sys:sy.name}; }); });
  /* BKT (§6 контракта): включается полем FEED_GRAPH.bkt:{...} — мастерство
     m(c)∈[0,1] на узел вместо бинарного «изучен». Без bkt — легаси-слой
     (узел загорается первой же экспозицией), «Тело» работает как раньше. */
  var BKT = GRAPH.bkt || null;
  var P = { L0:0.10, T:0.15, S:0.10, G:0.20, light:0.60, ask:0.50 };
  if(BKT) for(var pk in P){ if(BKT[pk]!=null) P[pk]=BKT[pk]; }
  function mVal(id){ var v=known[id];
    return typeof v==="number" ? v : (v ? 1 : P.L0); }
  function isKnown(id){ return BKT ? mVal(id)>=P.light : !!known[id]; }
  /* ── сложность (§11, родом из Кругосветки): та же механика получает ЧЕСТНУЮ
     сложную версию, когда ребёнок уже уверен по её концепту. «Усложнение
     приходит вместе с уверенностью, а не только по позиции». Опт-ин порогом
     FEED_PROGRAM.hard (число m∈[0,1], дефолт 0.7). Без BKT — всегда легко
     (чужие колоды не меняются). Карта может форсить: hard:true / hard:false. */
  var HARD_TH = (typeof FP.hard==="number") ? FP.hard : 0.7;
  function cardConcepts(c){ return c ? (c.concepts || (c.concept ? [c.concept] : [])) : []; }
  function fdHard(card){
    if(!card) return false;
    if(card.hard===true) return true;
    if(card.hard===false) return false;
    if(!BKT) return false;
    var cc = cardConcepts(card); if(!cc.length) return false;
    var s=0,i; for(i=0;i<cc.length;i++) s+=mVal(cc[i]);
    return s/cc.length >= HARD_TH;                 // уверен по концепту → сложная версия
  }
  function markKnow(id){ if(ALLORG[id] && !known[id]){ var before=rankIdx(); known[id]=1; jset(K_KNOW, known);
    refreshHud(); celebrateOrgan(id); afterLearn(before); } }   // орган загорелся → салют
  /* одно наблюдение по концепту: evidence = 'expose' | 'correct' | 'incorrect' */
  function mUpd(id, ev){
    if(ev==="correct") presenterSay("good");        // ведущий: похвала…
    else if(ev==="incorrect") presenterSay("bad");  // …или мягкая поддержка (§11)
    if(!ALLORG[id]) return;
    if(!BKT){ if(ev!=="incorrect") markKnow(id); return; }
    var m = mVal(id), was = m>=P.light, before = rankIdx(), post;
    if(ev==="expose") m = m + P.T*(1-m);
    else{
      post = ev==="correct" ? m*(1-P.S)/((m*(1-P.S)+(1-m)*P.G)||1e-9)
                            : m*P.S/((m*P.S+(1-m)*(1-P.G))||1e-9);
      m = post + (1-post)*P.T;
    }
    known[id] = Math.round(m*1000)/1000; jset(K_KNOW, known);
    refreshHud();
    if(!was && m>=P.light){ celebrateOrgan(id); afterLearn(before); }   // порог пройден → салют
  }
  function afterLearn(beforeRank){    // после загорания узла: ранг вырос? система собрана?
    if(rankIdx() > beforeRank) celebrateRank(rankIdx());
    checkStamps();
  }
  function totalOrgans(){ var n=0; GRAPH.systems.forEach(function(s){ n+=s.organs.length; }); return n; }
  function knownOrgans(){ var n=0; for(var k in ALLORG){ if(isKnown(k)) n++; } return n; }
  function sysStat(sy){ var kn=0; sy.organs.forEach(function(o){ if(isKnown(o.id)) kn++; }); return {kn:kn,tot:sy.organs.length}; }
  function orgStars(id){ var m=mVal(id); return m>=0.85?3:(m>=P.light?2:(m>=0.3?1:0)); }  // глубина мастерства → звёзды

  /* ранги (из «Кругосветки»): титул растёт по ШИРИНЕ (сколько узлов встречено).
     Дефолт — нейтральный; колода задаёт свои в FEED_GRAPH.ranks. */
  var RANKS = (GRAPH.ranks) || [
    {min:0,  name:"Новичок",  emoji:"🐣"},
    {min:2,  name:"Ученик",   emoji:"📖"},
    {min:5,  name:"Знаток",   emoji:"🔎"},
    {min:10, name:"Мастер",   emoji:"🏅"},
    {min:16, name:"Профессор",emoji:"🎓"}
  ];
  function rankIdx(){ var p=knownOrgans(), r=0, i; for(i=0;i<RANKS.length;i++){ if(p>=RANKS[i].min) r=i; } return r; }
  function rankNow(){ return RANKS[rankIdx()]; }

  /* звёзды (§17): ⭐ за безошибочное выполнение задания; большая цель в шапке
     (FEED_PROGRAM.starGoal) — «долгий путь» мотивации. Чип создаёт движок. */
  var K_STAR = NS + "_feed_stars";
  var stars = parseInt(localStorage.getItem(K_STAR),10)||0;
  var STAR_GOAL = (window.FEED_PROGRAM && window.FEED_PROGRAM.starGoal) || 0;
  function renderStars(){ var c=$("starChip"); if(!c) return;
    if(!stars && !STAR_GOAL){ c.style.display="none"; return; }
    c.style.display=""; c.innerHTML = (UII.star?em(UII.star,null,"sci"):"⭐")+" " + stars + (STAR_GOAL ? " / "+STAR_GOAL : ""); }
  function addStar(fromEl){ stars++;
    try{ localStorage.setItem(K_STAR, String(stars)); }catch(e){}
    var c=$("starChip");
    function land(){ renderStars();
      if(c){ c.classList.remove("pop"); void c.offsetWidth; c.classList.add("pop"); } }
    if(fromEl && c && aniOK()) flyStar(fromEl, c, land); else land(); }

  /* ---------- Anime.js-украшения ----------
     Аддитивный слой поверх CSS-переходов: без core/vendor/anime.min.js или при
     prefers-reduced-motion всё работает по-старому. Анимируем только
     transform/opacity (+ r/dashoffset в SVG-графе) — поведение не меняем. */
  var ANI = window.anime || null, REDUCED = false;
  try{ REDUCED = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }catch(e){}
  function aniOK(){ return !!ANI && !REDUCED; }
  /* полёт звезды: из места верного ответа по дуге в чип-счётчик */
  function flyStar(fromEl, chip, done){
    var a, b;
    try{ a=fromEl.getBoundingClientRect(); b=chip.getBoundingClientRect(); }catch(e){ done(); return; }
    if(!a || !b || (!b.width && !b.height)){ done(); return; }
    var sx=a.left+a.width/2, sy=a.top+a.height/2, tx=b.left+b.width/2, ty=b.top+b.height/2;
    var s=document.createElement("span"); s.className="flystar";
    s.innerHTML = UII.star ? em(UII.star,null,"sci") : "⭐";
    s.style.left=sx+"px"; s.style.top=sy+"px";
    document.body.appendChild(s);
    ANI({ targets:s,
      translateX:[{value:(tx-sx)*0.55, duration:260, easing:"easeOutQuad"},
                  {value:tx-sx,        duration:330, easing:"easeInQuad"}],
      translateY:[{value:Math.min(-72, ty-sy-140), duration:260, easing:"easeOutQuad"},
                  {value:ty-sy,        duration:330, easing:"easeInQuad"}],
      scale:[{value:1.5, duration:260, easing:"easeOutQuad"},
             {value:.5,  duration:330, easing:"easeInQuad"}],
      complete:function(){ if(s.parentNode) s.parentNode.removeChild(s); done(); } });
  }
  /* салют-частицы вокруг всплывашки «Новый узел / ранг / штамп» */
  function celebBurst(host, t, m){
    if(!aniOK()) return;
    var r=t.getBoundingClientRect();
    if(!r.width && !r.height) return;
    var cx=r.left+r.width/2, cy=r.top+r.height/2;
    var n=m.big?22:14, cols=[m.color||"#c0603a","#FFC24B","#ffffff"], ps=[], i;
    for(i=0;i<n;i++){ var p=document.createElement("i"); p.className="celebp";
      p.style.left=cx+"px"; p.style.top=cy+"px";
      p.style.background=cols[i%cols.length];
      host.appendChild(p); ps.push(p); }
    ANI({ targets:ps,
      translateX:function(){ return ANI.random(-140,140); },
      translateY:function(){ return ANI.random(-160,70); },
      rotate:function(){ return ANI.random(-200,200); },
      scale:[1,0], opacity:[1,0],
      duration:function(){ return ANI.random(560,900); },
      delay:ANI.stagger(10), easing:"easeOutExpo",
      complete:function(){ ps.forEach(function(p){ if(p.parentNode) p.parentNode.removeChild(p); }); } });
  }
  /* stagger-появление кнопок (варианты ответов и т.п.) */
  function staggerIn(list){
    if(!aniOK() || !list || !list.length) return;
    ANI({ targets:[].slice.call(list), translateY:[16,0], opacity:[0,1],
      duration:340, delay:ANI.stagger(70,{start:120}), easing:"easeOutQuad" });
  }

  /* «загорание» узла / ранг / штамп: всплывашка-салют + пульс мини-графа */
  var celebQ = [], celebBusy = false;
  function pushCeleb(item){ if(!item) return; celebQ.push(item); pulseMini(); if(!celebBusy) nextCeleb(); }
  function celebrateOrgan(id){ var m=ORGMETA[id]; if(m) pushCeleb({emoji:m.emoji,icon:m.icon,color:m.color,top:NODE_NEW,name:m.name}); }
  function celebrateRank(i){ var r=RANKS[i]; if(r){ pushCeleb({emoji:r.emoji,icon:r.icon,color:"#e06104",top:T2("newRank","Новый ранг!"),name:r.name,big:true}); if(MILESTONE_STARS) addStar(); } }
  function nextCeleb(){
    var host=$("celebrate"); if(!host || !celebQ.length){ celebBusy=false; return; }
    celebBusy=true; var m=celebQ.shift();
    var t=div("celeb"+(m.big?" big":"")); t.style.setProperty("--cc", m.color||"#c0603a");
    t.innerHTML='<span class="ce">'+em(m.icon, m.emoji)+'</span><span class="ct"><b>'+esc(m.top||NODE_NEW)+'</b><i>'+esc(m.name)+'</i></span>';
    host.appendChild(t); t.getBoundingClientRect(); t.classList.add("show");
    setTimeout(function(){ celebBurst(host, t, m); }, 200);   // салют-частицы вокруг всплывашки
    setTimeout(function(){ t.classList.remove("show");
      setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); nextCeleb(); }, 360); }, m.big?2100:1700);
  }
  function pulseMini(){ var g=$("miniGraph"); if(!g) return;
    g.classList.remove("pulse"); void g.offsetWidth; g.classList.add("pulse"); }

  /* паспорт исследователя (из «Кругосветки»): штамп за полностью изученную систему */
  var K_STAMP = NS + "_feed_stamps";
  var stamps = jget(K_STAMP, {});
  function sysComplete(sy){ var st=sysStat(sy); return st.tot>0 && st.kn>=st.tot; }
  GRAPH.systems.forEach(function(sy){ if(sysComplete(sy)) stamps[sy.id]=1; });  // тихая сверка при старте
  jset(K_STAMP, stamps);
  function checkStamps(){ GRAPH.systems.forEach(function(sy){
    if(!stamps[sy.id] && sysComplete(sy)){ stamps[sy.id]=1; jset(K_STAMP, stamps);
      pushCeleb({emoji:sy.emoji, icon:sy.icon, color:sy.color, top:"Штамп в паспорт!", name:sy.name, big:true});
      if(MILESTONE_STARS) addStar(); } }); }

  /* объявление главы: баннер «Глава N · Тема» при входе в новую главу */
  function chapterSplash(m){ var host=$("celebrate"); if(!host || !m || !m.title) return;
    var t=div("chsplash"); t.style.setProperty("--cc", m.color);
    t.innerHTML='<span class="che">'+(m.icon?em(m.icon,null):(m.emoji||"📖"))+'</span>'+
      '<span class="cht"><b>'+T2("chapWord","Глава")+' '+m.num+(PROG_CH>1?' '+T2("ofWord","из")+' '+PROG_CH:'')+'</b><i>'+esc(m.title)+'</i></span>';
    host.appendChild(t); t.getBoundingClientRect(); t.classList.add("show");
    setTimeout(function(){ t.classList.remove("show");
      setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 380); }, 1900);
  }

  /* мини-созвездие на детском экране — ребёнок видит, как наполняется граф */
  function renderMini(){
    var host=$("miniGraph"); if(!host) return;
    var sys=GRAPH.systems, N=sys.length||1, cx=30, cy=30, R=20, g="";
    sys.forEach(function(sy,i){
      var a=-Math.PI/2 + i/N*2*Math.PI, x=cx+R*Math.cos(a), y=cy+R*Math.sin(a), lit=sysStat(sy).kn>0;
      g+='<line x1="'+cx+'" y1="'+cy+'" x2="'+x.toFixed(1)+'" y2="'+y.toFixed(1)+'" stroke="'+(lit?sy.color:"#ffffff3a")+'" stroke-width="1"/>'+
         '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(lit?3.4:2.2)+'" fill="'+(lit?sy.color:"#ffffff66")+'"'+(lit?' class="lit"':'')+'/>';
    });
    host.innerHTML='<svg viewBox="0 0 60 60" aria-hidden="true">'+g+
      (CTR_ICON ? svgIco(CTR_ICON,30,30,7) : '<circle cx="30" cy="30" r="6.5" fill="#c0603a"/><text x="30" y="33.5" text-anchor="middle" font-size="8">'+CTR_EMOJI+'</text>')+'</svg>'+
      '<span class="mgr">'+em(rankNow().icon, rankNow().emoji)+'</span>'+
      '<span class="mgn">'+knownOrgans()+'/'+totalOrgans()+'</span>';
  }

  /* ---------- HUD ---------- */
  function seenCount(){ var s=0; CARDS.forEach(function(c){ if(isLearned(c.id)) s++; }); return s; }
  /* кольцо уровня (§12): цифра главы в кружке + SVG-кольцо прогресса главы —
     ребёнок всегда видит, сколько осталось до следующего уровня */
  function renderRing(){
    var host=$("lvlRing"); if(!host) return;
    var m=chMeta(), pos=idx-m.start+1, pct=m.count?pos/m.count:0;
    var R=15, C=2*Math.PI*R;
    host.innerHTML='<svg viewBox="0 0 40 40" aria-hidden="true">'+
      '<circle cx="20" cy="20" r="'+R+'" fill="#fffdf5e0" stroke="#00000022" stroke-width="3"/>'+
      '<circle cx="20" cy="20" r="'+R+'" fill="none" stroke="'+m.color+'" stroke-width="3.5" stroke-linecap="round"'+
      ' stroke-dasharray="'+(C*pct).toFixed(1)+' '+C.toFixed(1)+'" transform="rotate(-90 20 20)"/>'+
      '<text x="20" y="25.5" text-anchor="middle" font-size="16" font-weight="800" fill="#6b4a2f">'+m.num+'</text></svg>';
  }
  function refreshHud(){
    var m=chMeta();
    // СКВОЗНАЯ нумерация: какая сейчас карточка из всего курса (не внутри главы)
    var gpos=idx+1, gtot=CARDS.length, gpct=gtot?Math.round(gpos/gtot*100):0;
    var f=$("kfill"); if(f){ f.style.width=gpct+"%";
      f.style.background="linear-gradient(90deg,"+m.color+",#ffd34e)"; }
    var cl=$("chapLab"); if(cl) cl.innerHTML=(m.icon?em(m.icon,null,"che"):(m.emoji?'<span class="che">'+m.emoji+'</span>':''))+
      T2("chapWord","Глава")+' '+m.num+(PROG_CH>1?' '+T2("ofWord","из")+' '+PROG_CH:'')+' · '+esc(m.title);
    var cp=$("chapPos"); if(cp) cp.textContent=gpos+"/"+gtot;
    renderRing();
    renderMini();
  }

  /* ---------- лента ---------- */
  var feed = $("feed"), idx = 0, busy = false;
  var saved = parseInt(localStorage.getItem(K_POS),10); if(saved>0 && saved<CARDS.length) idx=saved;

  /* §12 интервальное повторение: пул уже пройденных интерактивов + планировщик.
     Повтор — эфемерная карточка-вставка (idx/резюме/прыжки не трогает). */
  var reviewCard=null, reviewPool=[], inPool={}, seenAt={}, seenTick=0, sinceRev=0, lastRevCi=-1;
  var REV_KINDS = {check:1, find:1, match:1, order:1, tf:1, gone:1};   // что имеет смысл повторять (вопрос/действие с концептом)
  function cardConcepts(card){
    if(card.concepts) return card.concepts;
    if(card.concept) return [card.concept];
    var a=[]; if(card.items) card.items.forEach(function(it){ if(it.id && ALLORG[it.id]) a.push(it.id); });
    if(!a.length && card.knows) card.knows.forEach(function(id){ if(ALLORG[id]) a.push(id); });
    return a;
  }
  function conceptMean(ids){ if(!ids||!ids.length) return 0; var s=0,i; for(i=0;i<ids.length;i++) s+=mVal(ids[i]); return s/ids.length; }
  function noteSeen(i, card){
    seenTick++; seenAt[i]=seenTick;
    if(REV_KINDS[card.kind] && !inPool[i]){ var cs=cardConcepts(card);
      if(cs.length){ inPool[i]=1; reviewPool.push({ci:i, concepts:cs, kind:card.kind}); } }
  }
  function pickReview(){
    if(!REVIEW) return null;
    sinceRev++;
    if(sinceRev < (REVIEW.every||6) || !reviewPool.length) return null;
    var solid=REVIEW.solid||0.85, gap=REVIEW.gap||4, best=null, bs=-1, i;
    for(i=0;i<reviewPool.length;i++){ var r=reviewPool[i];
      if(r.ci===idx || r.ci===lastRevCi) continue;
      if(seenTick - (seenAt[r.ci]||0) < gap) continue;
      var m=conceptMean(r.concepts); if(m<=0 || m>=solid) continue;   // не трогаем неизученное и уже твёрдое
      var score=(1-m) + Math.min(seenTick-(seenAt[r.ci]||0),30)*0.02;
      if(score>bs){ bs=score; best=r; } }
    if(best){ lastRevCi=best.ci; sinceRev=0; return best; }
    return null;
  }
  function renderReview(){
    feed.innerHTML="";
    var card = CARDS[reviewCard.ci];
    var el = buildCard(card); el.classList.add("isreview");
    var rib=div("revrib"); rib.textContent="⟳ Повторим!"; el.appendChild(rib);
    feed.appendChild(el);
    if(unlocked) playCard(card);
    var sh=$("swipeHint"); if(sh) sh.style.display="none";
  }

  /* ── реестр типов карт: точка расширения движка колодой ───────────────────
     Колода объявляет свои механики ДО загрузки feed.js глобалом FEED_KINDS:
       window.FEED_KINDS = { mykind: { interactive:true,
         build:function(el,card,api){ …наполнить el… } } };
     `interactive:true` — тап/жест по карте не листает ленту (как у match/find);
     `noswipe` — доп. CSS-селектор зон, где касание не считается свайпом.
     api = FEED_API: стабильный доступ к помощникам движка (не внутренности).
     Встроенные типы через реестр НЕ проходят — он аддитивен (пусто у обычных
     колод), поэтому их поведение неизменно. */
  var KINDS = {}, KIND_NOSWIPE = [];
  function registerKind(name, def){
    if(!name || !def || typeof def.build!=="function") return;
    KINDS[name] = def;
    if(def.noswipe) KIND_NOSWIPE.push(def.noswipe);
  }
  (function(){ var K=window.FEED_KINDS; if(!K) return;
    for(var n in K){ if(K.hasOwnProperty(n)) registerKind(n, K[n]); } })();
  function kindInteractive(k){ return !!(KINDS[k] && KINDS[k].interactive); }
  var FEED_API = {
    div:div, esc:esc, em:em, shuffle:shuffle, darken:darken,
    addStar:function(){ return addStar(); },
    mark:function(id){ return mark(id); },
    learned:function(id){ return isLearned(id); },
    mUpd:function(id,ev){ return mUpd(id,ev); },
    mVal:function(id){ return mVal(id); },
    hard:function(card){ return fdHard(card); },   // §11: нужна ли сложная версия механики
    go:function(d){ return go(d); },
    say:function(clips,fb,then){ return say(clips,fb,then); },
    T:function(k,f){ return T2(k,f); }
  };

  function buildCard(card){
    var el = div("card " + card.kind);
    // тап по карточке (мимо интерактива) = дальше; свайп/колесо/стрелки — тоже
    if(["check","match","find","count","beforeafter","order","scene","tf","gone","catch","lant","veil"].indexOf(card.kind)<0 && !kindInteractive(card.kind)) el.addEventListener("click", function(){ go(1); });
    // зарегистрированный колодой тип карты — рисует свой билдер (плагин)
    if(KINDS[card.kind]){ try{ KINDS[card.kind].build(el, card, FEED_API); }catch(e){ if(window.console&&console.error) console.error("feed kind", card.kind, e); } return el; }
    if(card.kind==="sys"){
      // приветствие/заставка. С картинкой — иллюстрация во весь экран + затемнение
      // и текст поверх («куда я попал»); без картинки — прежний цветной фон.
      if(card.img){
        el.classList.add("hasbg");
        var bg=div("sbg"); bg.style.backgroundImage="url('"+card.img+"')"; el.appendChild(bg);
        el.appendChild(div("sbgfade"));
      } else {
        el.style.background = "linear-gradient(160deg,"+darken(card.color,1.0)+","+darken(card.color,.72)+")";
      }
      var sc=div("scontent");
      sc.innerHTML = '<div class="semoji">'+(card.icon?em(card.icon,null):card.emoji)+'</div>'+
        '<div class="sname">'+esc(card.title)+'</div>'+
        (card.lines||[]).map(function(l){ return '<div class="sintro">'+esc(l)+'</div>'; }).join('')+
        (card.cta?'<div class="scta">'+esc(card.cta)+'</div>':'');
      el.appendChild(sc);
    } else if(card.kind==="check"){
      // варианты: сложная версия (§11) даёт больше вариантов — их труднее
      // отсеять. Уверенному по концепту (fdHard) — до 6, неуверенному — 3.
      var opts = (card.interact.options||[]).slice();
      if(BKT && card.concept && opts.length>3){
        var maxN = fdHard(card) ? 6 : 3;
        if(opts.length>maxN){
          var okO=[], wrO=[];
          opts.forEach(function(o){ (o.ok?okO:wrO).push(o); });
          opts = okO.concat(shuffle(wrO).slice(0, Math.max(1, maxN-okO.length)));
        }
      }
      opts = shuffle(opts);
      // премиальная раскладка: иллюстрация во весь экран (затемнена) + вопрос и
      // варианты поверх неё — «магия» не рушится белым квизом (замечание владельца).
      if(card.img){ el.classList.add("hasbg");
        var qbg=div("qbg"); qbg.style.backgroundImage="url('"+card.img+"')"; el.appendChild(qbg);
        el.appendChild(div("qbgfade"));
      }
      var qwrap=div("qwrap");
      qwrap.innerHTML = (!card.img
          ? '<div class="qemoji">'+(card.icon?em(card.icon,null):(card.emoji||"❓"))+'</div>' : '')+
        '<div class="qh">'+esc(card.title)+'</div>'+
        '<div class="q">'+esc((card.lines&&card.lines[0])||"")+'</div>';
      var ob = div("opts");
      var btnOf = [];
      function pick(o, b){
        if(el._answered) return; el._answered=true;
        if(VOICE_ANSWER) stopSR();
        [].forEach.call(ob.children,function(c){c.style.pointerEvents="none";});
        b.classList.add(o.ok?"ok":"no");
        if(!o.ok){ [].forEach.call(ob.children,function(c,i){ if(opts[i].ok)c.classList.add("ok"); }); }
        if(card.concept) mUpd(card.concept, o.ok ? "correct" : "incorrect");
        if(o.ok) addStar(b);                      // ⭐ за верный ответ — летит из кнопки в счётчик
        var ex=div("explain"); ex.innerHTML='<b>'+(o.ok?"✓":"")+'</b> '+esc(card.interact.explain); qwrap.appendChild(ex);
        setTimeout(function(){ go(1); }, 1600);
      }
      opts.forEach(function(o){
        var b=document.createElement("button"); b.className="opt"; b.textContent=o.t;
        b.onclick=function(){ pick(o,b); };
        btnOf.push(b);
        ob.appendChild(b);
      });
      qwrap.appendChild(ob);
      staggerIn(ob.children);                    // варианты появляются каскадом
      // голосовой ответ: ребёнок может НАЗВАТЬ вариант (§11). Кнопка-микрофон
      // появляется только если включено и браузер умеет распознавание речи.
      if(VOICE_ANSWER && SR){
        var mrow=div("microw");
        var mb=document.createElement("button"); mb.className="micbtn"; mb.id="micBtn";
        mb.innerHTML='<span class="micico">🎤</span><span class="mictx">Нажми и назови ответ</span>';
        mrow.appendChild(mb); qwrap.appendChild(mrow);
        armVoiceAnswer(mb, opts, function(o){
          var idx; for(idx=0;idx<opts.length;idx++) if(opts[idx]===o) break;
          if(btnOf[idx]) pick(o, btnOf[idx]);
        });
      }
      el.appendChild(qwrap);
    } else if(card.kind==="match"){
      buildMatch(el, card);
    } else if(card.kind==="find"){
      buildFind(el, card);
    } else if(card.kind==="count"){
      buildCount(el, card);
    } else if(card.kind==="order"){
      buildOrder(el, card);
    } else if(card.kind==="beforeafter"){
      buildBefAfter(el, card);
    } else if(card.kind==="scene"){
      buildScene(el, card);
    } else if(card.kind==="veil"){
      buildVeil(el, card);
    } else if(card.kind==="tf"){
      buildTF(el, card);
    } else if(card.kind==="gone"){
      buildGone(el, card);
    } else if(card.kind==="catch"){
      buildCatch(el, card);
    } else if(card.kind==="lant"){
      buildLant(el, card);
    } else { // organ / art — «резиновая обложка» (картинка сверху) + текст-блок снизу
      var cover=div("cover");
      var cimg=div("cimg"); if(card.img) cimg.style.backgroundImage="url('"+card.img+"')";
      cover.appendChild(cimg); cover.appendChild(div("cfade"));
      var panel=div("panel");
      var body = card.text ? esc(card.text) : (card.lines||[]).map(esc).join("<br>");
      var short = (card.text || (card.lines&&card.lines[0]) || "").length < 56;
      var chip = card.sysName ? '<span class="chip">'+card.emoji+' '+esc(card.sysName)+'</span>' : '';
      /* инфочип «нажми — узнай» (портирован из Кругосветки, fdSolo/fdKf): если у
         карты стоит veil, ответ (заголовок и/или текст) спрятан под картинкой,
         нажатие открывает его + звезда-награда. Аддитивно: без veil — как раньше. */
      var veil = card.veil, vshown = veil && card.id && isLearned(card.id);
      var hideT = veil && !vshown && veil!=="text", hideB = veil && !vshown && veil!=="title";
      panel.innerHTML = chip +
        '<div class="ttl'+(card.kind==="art"?" art":"")+(hideT?" veil":"")+'">'+esc(card.title)+'</div>'+
        '<div class="lines'+(short?" big":"")+(hideB?" veil":"")+'">'+body+'</div>';
      el.appendChild(cover); el.appendChild(panel);
      if(veil && !vshown){
        cover.addEventListener("click", function(ev){ ev.stopPropagation(); });   // тап открывает, не листает
        var chint=div("chiphint"); chint.textContent = (typeof veil==="string"&&veil!=="title"&&veil!=="text") ? veil : "Нажми — узнай";
        cover.appendChild(chint);
        var revealed=false;
        cover.addEventListener("click", function(ev){ ev.stopPropagation();
          if(revealed) return; revealed=true;
          if(hideT) panel.querySelector(".ttl").classList.remove("veil");
          if(hideB) panel.querySelector(".lines").classList.remove("veil");
          if(chint.parentNode) chint.parentNode.removeChild(chint);
          addStar(); if(card.id) mark(card.id);
          // озвучка-на-открытии: клип факта (revealAudio | id, если показ был молчком)
          var rc = card.revealAudio || (card.narrate===false && card.id ? card.id : null);
          if(rc) say([].concat(rc), card.text || card.title);
          var bz=div("chipburst"); bz.textContent="⭐"; cover.appendChild(bz);
          setTimeout(function(){ if(bz.parentNode) bz.parentNode.removeChild(bz); }, 900);
        });
      }
      // «окошки-секреты»: спрятанная инфа открывается ПОВЕРХ картинки (без эмодзи).
      // Осмысленный тап = маркер на картинке; пустой тап по картинке НЕ листает.
      // (Дедиц. полноэкранная версия — kind:"scene" из ядра; здесь — на арт-карте.)
      var it=card.interact, spots=card.spots ? card.spots.slice() : null;
      if(!spots && it){
        if(it.type==="poke") spots=[{x:it.x,y:it.y,text:it.bonus}];               // просто факт
        else if(it.type==="reveal") spots=[{x:it.x,y:it.y,title:it.teaser,text:it.hidden}];
      }
      if(spots && spots.length){
        cover.addEventListener("click", function(ev){ ev.stopPropagation(); }); // пустой тап не листает
        var total=spots.length, found=0;
        var hint=div("spothint");
        hint.textContent = total>1 ? ("Нажми окошки — узнай секреты · 0/"+total) : "Нажми окошко — секрет";
        cover.appendChild(hint);
        spots.forEach(function(sp){
          var mk=div("spot"); mk.style.left=((sp.x!=null?sp.x:50))+"%"; mk.style.top=((sp.y!=null?sp.y:34))+"%";
          mk.innerHTML='<span class="sdot"></span>';
          function openPop(){
            var old=cover.querySelector(".spotpop"); if(old) old.parentNode.removeChild(old);
            var pop=div("spotpop");
            pop.innerHTML=(sp.title?'<div class="spt">'+esc(sp.title)+'</div>':'')+
              '<div class="spx">'+esc(sp.text)+'</div><button class="spcl" aria-label="Закрыть">✕</button>';
            pop.addEventListener("click", function(e){ e.stopPropagation(); });
            pop.querySelector(".spcl").onclick=function(e){ e.stopPropagation(); if(pop.parentNode) pop.parentNode.removeChild(pop); };
            cover.appendChild(pop); pop.getBoundingClientRect(); pop.classList.add("show");
          }
          mk.onclick=function(ev){ ev.stopPropagation();
            if(!mk._done){ mk._done=true; mk.classList.add("done"); found++;
              if(total>1){ hint.textContent="Нажми окошки — узнай секреты · "+found+"/"+total;
                if(found>=total){ if(typeof addStar==="function") addStar(); if(hint.parentNode) hint.parentNode.removeChild(hint); } }
              else if(hint.parentNode){ hint.parentNode.removeChild(hint); }
            }
            openPop();
          };
          cover.appendChild(mk);
        });
      }
    }
    return el;
  }

  /* ── интерактив «перетащи орган на место» (data-driven, как LabelDrag в OM) ── */
  function buildMatch(el, card){
    var aspect = card.aspect || [820,1230];
    var items = card.items || [];
    // сложная версия (§11): подписи органов на фишках скрыты (тащим по картинке,
    // как «флаги без названий» в Кругосветке) + допуск чуть уже.
    var hard = fdHard({ concepts: items.map(function(i){return i.id;}), hard:card.hard });
    var tol = (card.tol || 12) * (hard ? 0.82 : 1);   // допуск в % от высоты доски
    el.innerHTML =
      '<div class="mtop"><div class="mt">'+esc(card.title||"Собери тело")+'</div>'+
      '<div class="ms">'+esc(hard ? (card.textHard||"Подписей нет — узнай орган по картинке") : (card.text||"Перетащи орган на его место"))+'</div></div>';
    var board = div("mboard");
    if(card.board) board.style.backgroundImage="url('"+card.board+"')";
    el.appendChild(board);
    var bank = div("mbank"); el.appendChild(bank);

    function rect(){ var bw=board.clientWidth,bh=board.clientHeight,iw=aspect[0],ih=aspect[1];
      var s=Math.min(bw/iw,bh/ih); var w=iw*s,h=ih*s; return {x:(bw-w)/2,y:(bh-h)/2,w:w,h:h}; }
    function tpos(it){ var r=rect(); return {x:r.x+it.x/100*r.w, y:r.y+it.y/100*r.h, r:r}; }

    // тонкие кружки-подсказки + поставленные органы; relayout при resize
    var rings={}, marks={}, placed={}, remaining=items.length, miss=0;
    function relayout(){ items.forEach(function(it){ var p=tpos(it);
      var g=rings[it.id]; if(!g){ g=div("mtarget"); g.style.width=(tol*1.2)+"%"; board.appendChild(g); rings[it.id]=g; }
      g.style.left=p.x+"px"; g.style.top=p.y+"px";
      var m=marks[it.id]; if(m){ m.style.left=p.x+"px"; m.style.top=p.y+"px"; } }); }
    function placeOrgan(it){
      var p=tpos(it); var m=div("mplaced"); m.style.left=p.x+"px"; m.style.top=p.y+"px";
      m.innerHTML='<img src="'+it.chip+'" alt="">'; board.appendChild(m); marks[it.id]=m;
      if(rings[it.id]) rings[it.id].style.display="none";
      mUpd(it.id,"correct");               // поставил орган → в граф знаний
      placed[it.id]=1; remaining--;
      if(remaining<=0){ var d=div("mdone"); d.textContent=doneTxt(T2("matchDone","Готово! Всё собрано")); board.appendChild(d);
        if(!miss) addStar();               // ⭐ за сборку без промахов
        setTimeout(function(){ go(1); }, 1700); }
    }

    // фишки-органы (перемешаны). drag на window-слушателях — надёжно на тач и мыши
    shuffle(items).forEach(function(it){
      var chip=div("mchip"); chip.setAttribute("data-id",it.id);
      chip.innerHTML='<img src="'+it.chip+'" alt="">'+(hard?"":'<span class="ml">'+esc(it.name)+'</span>');
      bank.appendChild(chip);
      chip.addEventListener("pointerdown", function(ev){
        if(placed[it.id]) return; ev.preventDefault();
        var flo=div("mfloat"); flo.innerHTML='<img src="'+it.chip+'" alt="">';
        flo.style.left=ev.clientX+"px"; flo.style.top=ev.clientY+"px";
        document.body.appendChild(flo); chip.classList.add("drag");
        function onMove(e){ flo.style.left=e.clientX+"px"; flo.style.top=e.clientY+"px"; }
        function onUp(e){
          window.removeEventListener("pointermove",onMove); window.removeEventListener("pointerup",onUp);
          if(flo.parentNode) flo.parentNode.removeChild(flo); chip.classList.remove("drag");
          var b=board.getBoundingClientRect(); var px=e.clientX-b.left, py=e.clientY-b.top;
          var best=null,bd=1e9; items.forEach(function(t){ if(placed[t.id])return; var p=tpos(t);
            var d=Math.hypot(px-p.x,py-p.y); if(d<bd){bd=d;best=t;} });
          if(best && bd<=tol/100*rect().h && best.id===it.id){ chip.classList.add("gone"); placeOrgan(it); }
          else { miss++; chip.classList.add("nudge"); setTimeout(function(){chip.classList.remove("nudge");},400); }
        }
        window.addEventListener("pointermove",onMove); window.addEventListener("pointerup",onUp);
      });
    });

    // раскладка целей после появления в DOM (нужны размеры доски)
    setTimeout(relayout, 0);
    window.addEventListener("resize", relayout);
  }

  /* ── интерактив «найди и нажми» (тап-хотспот, как «Найди и покажи» в OM) ── */
  function buildFind(el, card){
    var aspect=card.aspect||[820,1230]; var items=card.items||[]; var ask=card.ask||"Найди: ";
    var cur=0, found=0, miss=0;
    // сложная версия (§11): зона попадания уже — целиться точнее.
    var hard = fdHard({ concepts: items.map(function(i){return i.id;}), hard:card.hard });
    var top=div("mtop");
    top.innerHTML='<div class="mt">'+esc(card.title||"Найди и нажми")+'</div>';
    var fmsEl=div("ms"); top.appendChild(fmsEl); el.appendChild(top);
    var board=div("mboard"); if(card.board) board.style.backgroundImage="url('"+card.board+"')";
    el.appendChild(board);
    function rect(){ var bw=board.clientWidth,bh=board.clientHeight,iw=aspect[0],ih=aspect[1];
      var s=Math.min(bw/iw,bh/ih); var w=iw*s,h=ih*s; return {x:(bw-w)/2,y:(bh-h)/2,w:w,h:h}; }
    function tpos(it){ var r=rect(); return {x:r.x+it.x/100*r.w, y:r.y+it.y/100*r.h}; }
    function setPrompt(){ fmsEl.textContent=ask+(items[cur]?items[cur].name:""); }
    board.addEventListener("click", function(ev){
      ev.stopPropagation(); if(cur>=items.length) return;
      var b=board.getBoundingClientRect(); var px=ev.clientX-b.left, py=ev.clientY-b.top;
      var it=items[cur]; var p=tpos(it); var d=Math.hypot(px-p.x,py-p.y); var thr=(it.r||13)*(hard?0.7:1)/100*rect().h;
      if(d<=thr){
        var mk=div("mfound"); mk.style.left=p.x+"px"; mk.style.top=p.y+"px"; mk.textContent="✓"; board.appendChild(mk);
        if(it.id) mUpd(it.id,"correct");     // нашёл орган → в граф знаний
        found++; cur++;
        if(found>=items.length){ var dn=div("mdone"); dn.textContent=doneTxt(T2("findDone","Молодец! Всё нашёл")); board.appendChild(dn);
          if(!miss) addStar();               // ⭐ за поиск без промахов
          setTimeout(function(){ go(1); }, 1600); }
        else setPrompt();
      } else { miss++; board.classList.add("shakeb"); setTimeout(function(){board.classList.remove("shakeb");},400); }
    });
    setPrompt();
  }

  /* ── «Загляни в …»: большая иллюстрация во весь экран + светящиеся окошки-
     хотспоты. Тап по окошку открывает секрет карточкой ПОВЕРХ картинки (title+
     text) и ставит галочку; счётчик «Найдено N/M». Секреты живут на самой
     картинке, а не в простыне текста снизу. concept → BKT (экспозиция), ⭐ за
     все окошки. Данные: {img, aspect?, title, intro?, concept?, spots:[{x,y,
     title,text,icon?}]}. Координаты x/y — проценты по ОРИГИНАЛУ картинки. ── */
  function buildScene(el, card){
    var aspect=card.aspect||[820,1230], spots=card.spots||[], total=spots.length;
    var board=div("sboard"); if(card.img) board.style.backgroundImage="url('"+card.img+"')";
    el.appendChild(board);
    var top=div("scap");
    top.innerHTML='<div class="st1">'+esc(card.title||"Загляни на картинку")+
      '<span class="scnt">'+T2("scnt","Найдено")+' <b>0</b>/'+total+'</span></div>'+
      '<div class="st2">'+esc(card.intro||("Нажми светящиеся окошки — узнай секреты!"))+'</div>';
    el.appendChild(top);
    var info=div("sinfo"); el.appendChild(info);
    // «cover»-раскладка: картинка заполняет кадр (как в референсе), окошки — по её системе координат
    function rect(){ var bw=board.clientWidth,bh=board.clientHeight,iw=aspect[0],ih=aspect[1];
      var s=Math.max(bw/iw,bh/ih); var w=iw*s,h=ih*s; return {x:(bw-w)/2,y:(bh-h)/2,w:w,h:h}; }
    function tpos(sp){ var r=rect(); return {x:r.x+sp.x/100*r.w, y:r.y+sp.y/100*r.h}; }
    var found=0, cntEl=top.querySelector(".scnt b"), nodes=[];
    function openInfo(sp){
      info.innerHTML='<button class="sx" aria-label="Закрыть">&times;</button>'+
        '<div class="si1">'+esc(sp.title)+'</div><div class="si2">'+esc(sp.text)+'</div>';
      info.classList.add("on");
      info.querySelector(".sx").onclick=function(ev){ ev.stopPropagation(); info.classList.remove("on"); };
    }
    spots.forEach(function(sp){
      var h=div("shot"); if(sp.icon) h.innerHTML=em(sp.icon,null,"shico");
      board.appendChild(h); nodes.push({el:h,sp:sp});
      h.addEventListener("click", function(ev){ ev.stopPropagation();
        if(h._got){ openInfo(sp); return; }
        h._got=1; h.classList.add("got"); h.innerHTML="✓";
        found++; cntEl.textContent=found; openInfo(sp);
        if(sp.knows) mUpd(sp.knows,"expose");   // окошко может учить свой узел
        if(found>=total){
          var cs=card.concepts||(card.concept?[card.concept]:[]);
          cs.forEach(function(id){ mUpd(id,"expose"); });   // сцена учит все свои узлы
          addStar();
          top.querySelector(".st2").textContent=T2("sall","Все секреты открыты! Листай дальше ↑");
        }
      });
    });
    // тап по фону (мимо окошка) — закрыть открытый секрет
    board.addEventListener("click", function(){ info.classList.remove("on"); });
    function relayout(){ nodes.forEach(function(n){ var p=tpos(n.sp);
      n.el.style.left=p.x+"px"; n.el.style.top=p.y+"px"; }); }
    setTimeout(relayout,0); window.addEventListener("resize", relayout);
  }
  function T2(k,d){ return (window.FEED_GRAPH&&FEED_GRAPH.ui&&FEED_GRAPH.ui[k])||d; }

  /* ── veil-карточка «Угадай»: большая иллюстрация + вопрос, ответ скрыт вуалью
     (блюр). Тап открывает — имя/факт проявляются, ⭐, узел графа. Следующий тап
     листает дальше. Данные: {img, kicker?, answer, fact?, concept?/concepts?/knows?} */
  function buildVeil(el, card){
    var board=div("vboard"); if(card.img) board.style.backgroundImage="url('"+card.img+"')";
    el.appendChild(board); el.appendChild(div("vfade"));
    var top=div("vtop");
    top.innerHTML='<div class="vk">'+esc(card.kicker||"Кто это?")+'</div>'+
      '<div class="vhint">'+T2("veilHint","Нажми, чтобы узнать")+'</div>';
    el.appendChild(top);
    var ans=div("vans veil");
    ans.innerHTML='<div class="vname">'+esc(card.answer||"")+'</div>'+
      (card.fact?'<div class="vfact">'+esc(card.fact)+'</div>':'');
    el.appendChild(ans);
    var done=false;
    el.addEventListener("click", function(){
      if(!done){
        done=true;
        ans.classList.remove("veil"); void ans.offsetWidth; ans.classList.add("pop");
        top.querySelector(".vhint").textContent=T2("veilNext","Листай дальше ↑");
        top.querySelector(".vhint").classList.add("revealed");
        var cs=card.concepts||(card.concept?[card.concept]:[]);
        cs.forEach(function(id){ mUpd(id,"expose"); });
        if(card.knows) mUpd(card.knows,"expose");
        addStar();
      } else { go(1); }
    });
  }

  /* ── интерактив «сосчитай» (тап по предметам, DOM-плитки — без ассетов) ── */
  function buildCount(el, card){
    var n=card.n||3, emoji=card.emoji||"⭐", got=0;
    var WORDS=["","Один!","Два!","Три!","Четыре!","Пять!","Шесть!","Семь!","Восемь!","Девять!","Десять!"];
    var top=div("mtop"); top.innerHTML='<div class="mt">'+esc(card.title||"Сосчитай")+'</div>';
    var cnt=div("ms"); cnt.textContent=esc(card.ask||"Сколько их?"); top.appendChild(cnt); el.appendChild(top);
    var grid=div("cgrid"); el.appendChild(grid);
    for(var i=0;i<n;i++){ (function(){
      var t=div("ctile"); if(card.icon) t.innerHTML=em(card.icon,null,"cti"); else t.textContent=emoji;
      t.addEventListener("click", function(ev){ ev.stopPropagation();
        if(t._done) return; t._done=1; t.classList.add("counted");
        got++; cnt.textContent=WORDS[got]||(got+"!");
        if(got>=n){ var dn=div("mdone"); dn.textContent=doneTxt(card.done||(T2("countDone","Всего")+" "+n+"! "+T2("praiseWord","Молодец!")));
          dn.style.position="static"; dn.style.margin="14px auto 0"; dn.style.transform="none";
          el.appendChild(dn); addStar(); setTimeout(function(){ go(1); }, 1500); }
      });
      grid.appendChild(t);
    })(); }
  }

  /* ── §14 «правда или нет» (✓/✕) ── */
  function buildTF(el, card){
    el.classList.add("tfcard");
    var truth=(card.truth!==false), concept=card.concept;
    var wrap=div("tfwrap");
    var ttl=div("tft"); ttl.textContent=card.title||T2("tfTitle","Правда или нет?");
    var q=div("tfq"); q.textContent=card.statement||"";
    var btns=div("tfbtns");
    var bY=document.createElement("button"); bY.className="tfb yes"; bY.textContent="✓ "+T2("tfYes","Правда");
    var bN=document.createElement("button"); bN.className="tfb no"; bN.textContent="✕ "+T2("tfNo","Неправда");
    function answer(said){
      if(el._answered) return; el._answered=true;
      bY.disabled=bN.disabled=true;
      var correct=(said===truth);
      (said?bY:bN).classList.add(correct?"good":"bad");
      if(!correct)(truth?bY:bN).classList.add("good");
      if(concept) mUpd(concept, correct?"correct":"incorrect");
      if(correct) addStar(said?bY:bN);
      var ex=div("tfex"); ex.textContent=card.explain||(truth?T2("tfTrue","Это правда!"):T2("tfFalse","На самом деле — нет."));
      wrap.appendChild(ex);
      setTimeout(function(){ go(1); }, 1700);
    }
    bY.onclick=function(e){ e.stopPropagation(); answer(true); };
    bN.onclick=function(e){ e.stopPropagation(); answer(false); };
    btns.appendChild(bY); btns.appendChild(bN);
    wrap.appendChild(ttl); wrap.appendChild(q); wrap.appendChild(btns); el.appendChild(wrap);
    // голосовой ответ (§11): можно сказать «правда» / «неправда» (да / нет)
    if(VOICE_ANSWER && SR){
      var mrow=div("microw");
      var mb=document.createElement("button"); mb.className="micbtn"; mb.id="micBtn";
      mb.innerHTML='<span class="micico">🎤</span><span class="mictx">Нажми и скажи: правда или нет</span>';
      mrow.appendChild(mb); wrap.appendChild(mrow);
      armVoiceAnswer(mb,
        [ {t:"правда",   say:["да","верно","правда","истина","так"]},
          {t:"неправда", say:["нет","неверно","ложь","неправда","не так"]} ],
        function(o){ answer(o.t==="правда"); });
    }
  }

  /* ── §14 «что пропало?» (память): запомни ряд → один исчез → выбери какой ── */
  function itName(it){ return typeof it==="string"?it:(it.name||it.t||""); }
  function itFace(it){ if(typeof it!=="string" && it.icon) return em(it.icon,null,"goi");
    return '<span class="gem">'+esc(typeof it==="string"?it:(it.emoji||it.t||"❔"))+'</span>'; }
  function buildGone(el, card){
    el.classList.add("gonecard");
    var items=(card.items||[]).slice(), concept=card.concept;
    var goHard=fdHard(card);                         // §11: сложнее — меньше времени запомнить
    var top=div("mtop"); top.innerHTML='<div class="mt">'+esc(card.title||T2("goneTitle","Что пропало?"))+'</div>';
    var sub=div("ms"); sub.textContent=T2("goneSub1","Запомни, что здесь есть…"); top.appendChild(sub); el.appendChild(top);
    var grid=div("gogrid"); el.appendChild(grid);
    items.forEach(function(it){ var t=div("gotile"); t.innerHTML=itFace(it); grid.appendChild(t); });
    var missing=items[Math.floor(Math.random()*items.length)];
    setTimeout(function(){
      if(!el.parentNode && !el.isConnected) { /* карточку покинули */ }
      sub.textContent=T2("goneSub2","Что пропало? Нажми ответ!");
      grid.innerHTML="";
      shuffle(items).forEach(function(it){ if(it===missing) return;
        var t=div("gotile"); t.innerHTML=itFace(it); grid.appendChild(t); });
      var opts=div("goopts");
      shuffle(items).forEach(function(it){
        var b=document.createElement("button"); b.className="goopt"; b.textContent=itName(it);
        b.onclick=function(e){ e.stopPropagation(); if(el._answered) return; el._answered=true;
          var correct=(it===missing); b.classList.add(correct?"good":"bad");
          if(concept) mUpd(concept, correct?"correct":"incorrect");
          if(correct) addStar(b);
          var dn=div("mdone"); dn.style.position="static"; dn.style.margin="12px auto 0"; dn.style.transform="none";
          dn.textContent=(correct?T2("goneOk","Верно! "):T2("goneMiss","Пропал: "))+itName(missing);
          el.appendChild(dn); setTimeout(function(){ go(1); }, 1700);
        };
        opts.appendChild(b);
      });
      el.appendChild(opts);
      staggerIn(opts.children);
    }, goHard ? 1500 : 2200);
  }

  /* ── §14 «лови только…» (спокойная аркада: без проигрыша, чужое трясётся) ── */
  function buildCatch(el, card){
    el.classList.add("catchcard");
    var good=(card.good||[]).slice(), bad=(card.bad||[]).slice();
    var need=card.need||good.length||3, got=0;
    var top=div("mtop"); top.innerHTML='<div class="mt">'+esc(card.title||"Лови!")+'</div>';
    var sub=div("ms"); sub.textContent=esc(card.ask||"Лови только нужное"); top.appendChild(sub); el.appendChild(top);
    var field=div("cfield"); el.appendChild(field);
    var all=[]; good.forEach(function(g){ all.push({t:g,g:true}); }); bad.forEach(function(bd){ all.push({t:bd,g:false}); });
    shuffle(all).forEach(function(o){
      var tile=div("cattile");
      tile.innerHTML='<span>'+esc(o.t)+'</span>';
      tile.style.left=(7+Math.random()*74)+"%";
      tile.style.top=(4+Math.random()*70)+"%";
      tile.style.animationDelay=(-(Math.random()*5)).toFixed(2)+"s";
      tile.onclick=function(e){ e.stopPropagation();
        if(tile._done) return;
        if(o.g){ tile._done=1; tile.classList.add("caught"); got++;
          sub.textContent="Поймано: "+got+" из "+need;
          if(got>=need){ addStar(); if(card.concept) mUpd(card.concept,"correct"); var dn=div("mdone"); dn.textContent=doneTxt(card.done||T2("catchDone","Молодец! Всё поймал!"));
            el.appendChild(dn); setTimeout(function(){ go(1); }, 1500); } }
        else { tile.classList.remove("shk"); void tile.offsetWidth; tile.classList.add("shk"); }
      };
      field.appendChild(tile);
    });
  }

  /* ── §14 «посвети фонариком»: тёмная картинка, круг света у пальца, найди цель ── */
  function buildLant(el, card){
    el.classList.add("lantcard");
    var wrap=div("lantwrap");
    var img=div("lantimg"); if(card.img) img.style.backgroundImage="url('"+card.img+"')";
    var dark=div("lantdark");
    var top=div("lanttop");
    top.innerHTML='<div class="lt1">'+esc(card.title||"Посвети фонариком")+'</div>'+
      '<div class="lt2">'+esc(card.ask||"Веди пальцем — найди спрятанное и нажми")+'</div>';
    wrap.appendChild(img); wrap.appendChild(dark); wrap.appendChild(top); el.appendChild(wrap);
    var tx=(card.target&&card.target.x)||50, ty=(card.target&&card.target.y)||50, tr=(card.target&&card.target.r)||13;
    function light(px,py){ dark.style.setProperty("--lx",px+"%"); dark.style.setProperty("--ly",py+"%"); }
    function pt(e){ var r=wrap.getBoundingClientRect();
      var cx=e.clientX, cy=e.clientY;
      return { x:(cx-r.left)/r.width*100, y:(cy-r.top)/r.height*100 }; }
    wrap.addEventListener("pointermove", function(e){ var p=pt(e); light(p.x,p.y); });
    wrap.addEventListener("pointerdown", function(e){ e.stopPropagation(); var p=pt(e); light(p.x,p.y);
      if(el._done) return;
      if(Math.hypot(p.x-tx,p.y-ty)<=tr){ el._done=1;
        var mk=div("lantfound"); mk.style.left=tx+"%"; mk.style.top=ty+"%"; mk.textContent="✓"; wrap.appendChild(mk);
        if(card.concept) mUpd(card.concept,"correct"); addStar();
        var dn=div("mdone"); dn.textContent=doneTxt(card.done||T2("lantDone","Нашёл! Молодец!")); el.appendChild(dn);
        setTimeout(function(){ go(1); }, 1500);
      }
    });
    light(50,42);
  }

  /* ── интерактив «разложи по порядку» (§14 Кругосветки, тап-версия без drag):
     нажимай события в верном порядке; верное — получает номер и «замирает»,
     неверное — трясётся. concept → BKT (без промахов = correct), ⭐ за чистоту ── */
  function buildOrder(el, card){
    var items=(card.items||[]).map(function(it,i){ return {t:it.t, n:i}; });
    var next=0, miss=0;
    var top=div("mtop");
    top.innerHTML='<div class="mt">'+esc(card.title||"По порядку")+'</div>'+
      '<div class="ms">'+esc(card.text||"Нажимай по порядку: что было сначала, что потом")+'</div>';
    el.appendChild(top);
    var listEl=div("olist"); el.appendChild(listEl);
    var mixed=shuffle(items);
    if(items.length>2){ var tries=0;                       // случайно «уже верный» порядок — перемешать ещё
      while(tries++<5 && mixed.every(function(it,i){ return it.n===i; })) mixed=shuffle(items); }
    mixed.forEach(function(it){
      var b=document.createElement("button"); b.className="otile";
      b.innerHTML='<span class="onum"></span><span class="otxt">'+esc(it.t)+'</span>';
      b.onclick=function(ev){ ev.stopPropagation();
        if(b._done || next>=items.length) return;
        if(it.n===next){
          b._done=1; b.classList.add("odone");
          b.querySelector(".onum").textContent=String(next+1); next++;
          if(next>=items.length){
            if(card.concept) mUpd(card.concept, miss ? "incorrect" : "correct");
            if(!miss) addStar();
            var dn=div("mdone"); dn.textContent=doneTxt(card.done||"Всё по порядку!");
            dn.style.position="static"; dn.style.margin="14px auto 0"; dn.style.transform="none";
            el.appendChild(dn); setTimeout(function(){ go(1); }, 1600);
          }
        } else { miss++; b.classList.add("oshake"); setTimeout(function(){ b.classList.remove("oshake"); },380); }
      };
      listEl.appendChild(b);
    });
  }

  /* ── интерактив «шторка до/после» (двигай — сравни; как в OM «день/ночь») ── */
  function buildBefAfter(el, card){
    var wrap=div("bawrap");
    var base=div("balayer"); if(card.img) base.style.backgroundImage="url('"+card.img+"')";
    var after=div("balayer baafter"); after.style.backgroundImage="url('"+(card.after||card.img)+"')";
    if(card.afterFilter) after.style.filter=card.afterFilter;
    if(card.afterTint){ var tint=div("batint"); tint.style.background=card.afterTint; after.appendChild(tint); }
    var la=div("balab bal-a"); la.textContent=card.labA||"До";
    var lb=div("balab bal-b"); lb.textContent=card.labB||"После";
    var handle=div("bahandle"); handle.innerHTML='<div class="baknob">⇆</div>';
    wrap.appendChild(base); wrap.appendChild(after); wrap.appendChild(la); wrap.appendChild(lb); wrap.appendChild(handle);
    el.appendChild(wrap);
    var panel=div("panel"); panel.style.background="transparent"; panel.style.position="absolute";
    panel.style.left="0"; panel.style.right="0"; panel.style.bottom="0"; panel.style.zIndex="4";
    panel.innerHTML='<div class="ttl art">'+esc(card.title||"")+'</div>'+
      (card.text?'<div class="lines big">'+esc(card.text)+'</div>':'');
    el.appendChild(panel);
    function setP(v){ v=Math.max(3,Math.min(97,v)); after.style.clipPath="inset(0 0 0 "+v+"%)"; handle.style.left=v+"%"; }
    setP(52);
    handle.addEventListener("pointerdown", function(ev){ ev.preventDefault(); ev.stopPropagation();
      if(!el._star){ el._star=1; addStar(); }   // ⭐ за использование шторки (интерактив-задание §17)
      function mv(e){ var r=wrap.getBoundingClientRect(); setP((e.clientX-r.left)/r.width*100); }
      function up(){ window.removeEventListener("pointermove",mv); window.removeEventListener("pointerup",up); }
      window.addEventListener("pointermove",mv); window.addEventListener("pointerup",up);
    });
  }

  var lastCh = -1;
  function render(){
    if(VOICE_ANSWER) stopSR();                        // покидаем карточку → микрофон молчит
    feed.innerHTML="";
    var card = CARDS[idx];
    if(!card) return;
    var ci = CARDCH[idx];
    if(ci !== lastCh){ lastCh = ci; if(FP.chapterSplash!==false) chapterSplash(CHAPMETA[ci]); }  // вошли в новую главу → объявить (можно выключить)
    var el = buildCard(card);
    feed.appendChild(el);
    mark(card.id);
    if(card.knows) card.knows.forEach(function(id){ mUpd(id,"expose"); });   // экспозиция → в граф знаний
    localStorage.setItem(K_POS, idx);
    refreshHud();                                    // счётчик/кольцо всегда актуальны (даже на виденной карте)
    noteSeen(idx, card);                             // §12: пул интервального повторения
    if(unlocked) playCard(card);                    // озвучка карточки (после первого жеста)
    var sh=$("swipeHint"); if(sh) sh.style.display = idx<1 ? "flex" : "none";
  }

  function unlockAudio(){
    if(unlocked || !au) return; unlocked = true;
    playCard(CARDS[idx]);                            // первый жест разрешает автоплей
  }

  /* «экзаменационный» check (exam:true) показывается, только когда мастерство
     по его концептам накопилось (mean m ≥ θ_ask, §6.4) — иначе тихо пропускается */
  function gated(c){
    if(!BKT || !c || c.kind!=="check" || !c.exam) return false;
    var cc = c.concepts || (c.concept ? [c.concept] : []);
    if(!cc.length) return false;
    var s=0; cc.forEach(function(id){ s+=mVal(id); });
    return s/cc.length < P.ask;
  }
  function go(dir){
    if(!unlocked) unlockAudio();
    if(busy) return;
    var fromReview = false;
    if(reviewCard){                        // §12: покидаем карточку-повтор
      reviewCard = null;
      if(dir<0){ busy=true; var ob=feed.firstChild; if(ob) ob.classList.add("gone-down");
        setTimeout(function(){ render(); busy=false; }, 230); return; }   // назад → к текущей авторской
      fromReview = true;                   // вперёд → к следующей авторской (idx+1)
    }
    var ni = idx + dir;
    while(ni>=0 && ni<CARDS.length && gated(CARDS[ni])) ni += dir;
    if(ni < 0 || ni >= CARDS.length){ if(fromReview) render(); return; }
    // на проверке нельзя листать вперёд, не ответив
    var cur = CARDS[idx];
    if(!fromReview && dir>0 && cur.kind==="check" && !feed.firstChild._answered) return;
    // §12: иногда вставляем повтор пройденного (не сразу после другого повтора)
    if(!fromReview && dir>0){
      var rev = pickReview();
      if(rev){ reviewCard = rev;
        busy=true; var or=feed.firstChild; if(or) or.classList.add("gone-up");
        setTimeout(function(){ renderReview(); busy=false; }, 230); return; }
    }
    busy = true;
    var old = feed.firstChild;
    if(old){ old.classList.add(dir>0?"gone-up":"gone-down"); }
    idx = ni;
    setTimeout(function(){ render(); busy=false; }, 230);
  }

  /* ---------- ввод ---------- */
  // жест, начатый на интерактиве (перетаскивание органа, кнопки, плитки, окошки,
  // шторка, фонарик) — НЕ свайп: иначе тащишь орган вверх и карточка «улетает».
  var NOSWIPE = ".mbank,.mchip,.mfloat,.mboard,.mtarget,.bawrap,.bahandle,.lantwrap,"+
    ".opts,.opt,.tfbtns,.tfb,.goopts,.goopt,.gogrid,.gotile,.cfield,.cattile,.cgrid,.ctile,"+
    ".otiles,.otile,.shot,.sinfo,.stop,.spot,.spotpop,.reveal-btn,.nextfab,.spcl,.sx,button"
    + (KIND_NOSWIPE.length ? ","+KIND_NOSWIPE.join(",") : "");
  var y0=null, moved=false;
  feed.addEventListener("touchstart", function(e){
    if(e.target.closest && e.target.closest(NOSWIPE)){ y0=null; return; }  // жест на интерактиве — не свайп
    y0=e.touches[0].clientY; moved=false;
  }, {passive:true});
  feed.addEventListener("touchmove", function(e){ if(y0!=null && Math.abs(e.touches[0].clientY-y0)>10) moved=true; }, {passive:true});
  feed.addEventListener("touchend", function(e){
    if(y0==null) return; var dy=(e.changedTouches[0].clientY - y0); y0=null;
    if(dy < -50) go(1); else if(dy > 50) go(-1);
  });
  var wlock=false;
  window.addEventListener("wheel", function(e){
    if(wlock) return; if(Math.abs(e.deltaY)<20) return;
    wlock=true; setTimeout(function(){wlock=false;},420);
    go(e.deltaY>0?1:-1);
  }, {passive:true});
  window.addEventListener("keydown", function(e){
    if(e.key==="ArrowUp") go(-1); else if(e.key==="ArrowDown"||e.key===" ") go(1);
    else if(e.key==="Escape"){ closeParent(); closeMap(); closePassport(); }
  });

  /* ---------- карта пути (главы-остановки) ---------- */
  function chLoaded(num){ for(var i=0;i<CHAPMETA.length;i++){ if(CHAPMETA[i].num===num) return CHAPMETA[i]; } return null; }
  function chLearned(m){ var d=0; for(var i=m.start;i<m.start+m.count;i++){ if(isLearned(CARDS[i].id)) d++; } return d; }
  function mapRowsHtml(){   // строки-остановки глав (используется картой пути и single-menu графом)
    var prog=window.FEED_PROGRAM||{}, list=prog.map;
    if(!list) list=CHAPMETA.map(function(m){ return {num:m.num,title:m.title,emoji:m.emoji,icon:m.icon,color:m.color,cards:m.count}; });
    var curNum=chMeta().num, rows="";
    list.forEach(function(e){
      var meta=chLoaded(e.num), loaded=!!meta, total=loaded?meta.count:(e.cards||0);
      var done=loaded?chLearned(meta):0, isCur=loaded&&e.num===curNum, pct=total?Math.round(done/total*100):0;
      var state = !loaded ? "soon" : (isCur ? "cur" : (total>0&&done>=total ? "done" : (done>0 ? "started" : "open")));
      var badge = state==="done"?"✓":(state==="cur"?"▶":(state==="soon"?(UII.lock?em(UII.lock,"🔒"):"🔒"):""));
      rows += '<button class="stop '+state+'"'+(loaded?' data-n="'+e.num+'"':' disabled')+'>'+
        '<span class="snum" style="background:'+e.color+'">'+(e.icon?em(e.icon,null):e.emoji)+'</span>'+
        '<span class="sbody"><span class="sttl">'+e.num+'. '+esc(e.title)+'</span>'+
          (loaded?'<span class="strack"><i style="width:'+pct+'%;background:'+e.color+'"></i></span>'+
                  '<span class="ssub">'+done+' / '+total+' карточек</span>'
                 :'<span class="ssub soon">скоро · '+total+' карточек</span>')+
        '</span><span class="sbadge">'+badge+'</span></button>';
    });
    return rows;
  }
  function bindMapRows(root){
    [].forEach.call(root.querySelectorAll(".stop[data-n]"), function(btn){
      btn.onclick=function(){ jumpChapter(parseInt(btn.getAttribute("data-n"),10)); }; });
  }
  function openMap(){
    var prog=window.FEED_PROGRAM||{}, list=prog.map;
    if(!list) list=CHAPMETA.map(function(m){ return {num:m.num,title:m.title,emoji:m.emoji,icon:m.icon,color:m.color,cards:m.count}; });
    var curNum=chMeta().num, rows="";
    list.forEach(function(e){
      var meta=chLoaded(e.num), loaded=!!meta, total=loaded?meta.count:(e.cards||0);
      var done=loaded?chLearned(meta):0, isCur=loaded&&e.num===curNum, pct=total?Math.round(done/total*100):0;
      var state = !loaded ? "soon" : (isCur ? "cur" : (total>0&&done>=total ? "done" : (done>0 ? "started" : "open")));
      var badge = state==="done"?"✓":(state==="cur"?"\u25B6\uFE0E":(state==="soon"?(UII.lock?em(UII.lock,"🔒"):"🔒"):""));
      rows += '<button class="stop '+state+'"'+(loaded?' data-n="'+e.num+'"':' disabled')+'>'+
        '<span class="snum" style="background:'+e.color+'">'+(e.icon?em(e.icon,null):e.emoji)+'</span>'+
        '<span class="sbody"><span class="sttl">'+e.num+'. '+esc(e.title)+'</span>'+
          (loaded?'<span class="strack"><i style="width:'+pct+'%;background:'+e.color+'"></i></span>'+
                  '<span class="ssub">'+done+' / '+total+' карточек</span>'
                 :'<span class="ssub soon">скоро · '+total+' карточек</span>')+
        '</span><span class="sbadge">'+badge+'</span></button>';
    });
    $("mapList").innerHTML=rows;
    [].forEach.call($("mapList").querySelectorAll(".stop[data-n]"), function(btn){
      btn.onclick=function(){ jumpChapter(parseInt(btn.getAttribute("data-n"),10)); }; });
    var cur=$("mapList").querySelector(".stop.cur");
    $("map").classList.add("on");
    if(cur) cur.scrollIntoView({block:"center"});
  }
  function jumpChapter(num){ var m=chLoaded(num); if(!m) return;
    closeMap(); closeParent(); idx=m.start; lastCh=-1; render(); refreshHud(); }
  function closeMap(){ $("map").classList.remove("on"); }

  /* ---------- фиджитал-мост «У меня есть карта!» (опционально, per-колода):
     FP.cardJump = { label, ph, btn, ids:[id карточки ленты для физ. номера N
     (индекс 0 = карта №1)] }. Ребёнок вводит номер с физической карточки из
     коробки — лента открывает её цифровой разворот. Без FP.cardJump ничего
     не рисуем (чужие колоды не меняются). ---------- */
  /* ---------- «Карточка дня» + серия-стрик (опционально: FP.daily=true).
     Раз в день при входе — оверлей: «День N подряд» и одна карточка-сюрприз:
     повтор изученного вида (интервальное закрепление) или следующий новый
     впереди. Выбор детерминирован датой. Без FP.daily ничего не происходит. */
  (function initDaily(){
    if(FP.daily!==true) return;
    var K_DAY=NS+"_feed_daily";
    function pad(n){ return (n<10?"0":"")+n; }
    function dstr(d){ return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()); }
    var st=jget(K_DAY,{}), now=new Date(), today=dstr(now);
    if(st.last===today) return;                       // сегодня уже приходил
    var wasYesterday = st.last===dstr(new Date(now.getTime()-864e5));
    st.streak = wasYesterday ? (st.streak||0)+1 : 1;
    st.best = Math.max(st.best||0, st.streak); st.last=today;
    jset(K_DAY, st);
    // самый первый визит (ничего не изучено, позиция 0) — не шумим
    var hasLearned=false, lid; for(lid in learned){ if(learned.hasOwnProperty(lid)){ hasLearned=true; break; } }
    if(!hasLearned && idx===0) return;
    // кандидаты: art-карточки с картинкой; повтор изученного, иначе — новое впереди
    var seedN=0, ci; for(ci=0; ci<today.length; ci++) seedN=(seedN*31+today.charCodeAt(ci))>>>0;
    function pickFrom(list){ return list.length ? list[seedN % list.length] : -1; }
    var revs=[], fresh=[], i, c;
    for(i=0;i<CARDS.length;i++){ c=CARDS[i];
      if(c.kind!=="art" || !c.img || !c.knows) continue;
      var kid=[].concat(c.knows)[0];
      if(kid!==c.id) continue;               // только карточка-герой вида, не «Коротко»/«Из жизни»
      if(known[kid]) revs.push(i); else if(i>idx) fresh.push(i);
    }
    var pick=pickFrom(revs.length?revs:fresh);
    if(pick<0) return;
    var card=CARDS[pick], isRev=!!(card.knows && known[[].concat(card.knows)[0]]);
    var ov=div("dailyov");
    ov.innerHTML='<div class="dailybox">'+
      '<div class="dstreak">'+em(T2("icoDaily",null), "⭐")+' '+
        esc(T2("dailyDay","День"))+" "+st.streak+" "+esc(st.streak>1?T2("dailyRow","подряд!"):T2("dailyOne","— начало серии!"))+'</div>'+
      '<div class="dttl">'+esc(T2("dailyTitle","Карточка дня"))+'</div>'+
      '<div class="dimg"><img src="'+card.img+'" alt=""></div>'+
      '<div class="dname">'+esc(card.title||"")+'</div>'+
      '<div class="dsub">'+esc(isRev?T2("dailyRev","Помнишь его? Загляни ещё раз!"):T2("dailyNew","Сегодня тебя ждёт новое знакомство!"))+'</div>'+
      '<div class="dbtns"><button class="dgo">'+esc(T2("dailyGo","Смотреть"))+'</button>'+
      '<button class="dskip">'+esc(T2("dailyLater","Позже"))+'</button></div></div>';
    document.body.appendChild(ov);
    if(window.TiltFX) TiltFX.attach(ov.querySelector(".dimg"), {max:10, scale:1.03});  // «живая карта»
    function close(){ if(ov.parentNode) ov.parentNode.removeChild(ov); }
    ov.querySelector(".dgo").onclick=function(){ close(); idx=pick; lastCh=-1; render(); refreshHud(); };
    ov.querySelector(".dskip").onclick=close;
    ov.addEventListener("click", function(e){ if(e.target===ov) close(); });
  })();

  (function initCardJump(){
    var cj = FP.cardJump; if(!cj || !cj.ids || !cj.ids.length) return;
    var map=$("map"); if(!map) return;
    var box=document.createElement("div"); box.className="cardjump";
    box.innerHTML='<span class="cjl">'+esc(cj.label||"У меня есть карта!")+'</span>'+
      '<input class="cji" type="number" min="1" max="'+cj.ids.length+'" inputmode="numeric" placeholder="'+esc(cj.ph||("№ 1–"+cj.ids.length))+'">'+
      '<button class="cjb">'+esc(cj.btn||"Открыть")+'</button>';
    var sub=map.querySelector(".sub");
    if(sub && sub.parentNode) sub.parentNode.insertBefore(box, sub.nextSibling);
    else map.appendChild(box);
    var inp=box.querySelector(".cji"), btn=box.querySelector(".cjb");
    function go(){
      var n=parseInt(inp.value,10);
      if(!n || n<1 || n>cj.ids.length){ inp.classList.add("cjshake");
        setTimeout(function(){ inp.classList.remove("cjshake"); },400); return; }
      var id=cj.ids[n-1], i;
      for(i=0;i<CARDS.length;i++) if(CARDS[i].id===id) break;
      if(i>=CARDS.length) return;
      inp.value=""; closeMap(); closeParent();
      idx=i; lastCh=-1; render(); refreshHud();
    }
    btn.onclick=go;
    inp.addEventListener("keydown", function(e){ if(e.key==="Enter") go(); });
  })();

  /* ---------- родительский граф знаний ---------- */
  function openParent(){
    $("pbign").textContent = knownOrgans();
    $("pbigu").textContent = T2("ofWord","из") + " " + totalOrgans() + " " + NODE_GEN + " " + T2("inWord","в") + " " + (GRAPH.mapNoun || "графе") + " " + T2("knowledgeWord","знаний");
    // ── граф-констелляция: центр «Тело» → системы → органы (загораются) ──
    var sys=GRAPH.systems, N=sys.length, cx=170, cy=178, R1=118;
    var lines="", nodes="";
    sys.forEach(function(sy,i){
      var a=-Math.PI/2 + i/N*2*Math.PI, ux=Math.cos(a), uy=Math.sin(a), px=-uy, py=ux;
      var sx=cx+R1*ux, sy2=cy+R1*uy, st=sysStat(sy), lit=st.kn>0;
      lines += '<line x1="'+cx+'" y1="'+cy+'" x2="'+sx+'" y2="'+sy2+'" stroke="'+(lit?sy.color:"#e0d7c6")+'" stroke-width="'+(lit?2:1)+'" opacity="'+(lit?.6:.4)+'"/>';
      var M=sy.organs.length;
      sy.organs.forEach(function(o,j){
        var off=(j-(M-1)/2)*15, ex=sx+ux*20+px*off, ey=sy2+uy*20+py*off, on=isKnown(o.id);
        lines += '<line x1="'+sx+'" y1="'+sy2+'" x2="'+ex+'" y2="'+ey+'" stroke="'+(on?sy.color:"#e0d7c6")+'" stroke-width="1" opacity=".5"/>';
        nodes += '<circle cx="'+ex+'" cy="'+ey+'" r="'+(on?6.5:5)+'" fill="'+(on?sy.color:"#efe7d7")+'" stroke="#fff" stroke-width="'+(on?2:1)+'"'+(on?' class="lit"':'')+'/>';
      });
      nodes += '<circle cx="'+sx+'" cy="'+sy2+'" r="15" fill="'+(lit?sy.color:"#efe7d7")+'" stroke="#fff" stroke-width="2.5"/>'+
        (sy.icon ? svgIco(sy.icon, sx, sy2, 13) : '<text x="'+sx+'" y="'+(sy2+5)+'" text-anchor="middle" font-size="15">'+sy.emoji+'</text>');
    });
    var svg='<svg viewBox="0 0 340 360" class="pgsvg">'+lines+nodes+
      '<circle cx="'+cx+'" cy="'+cy+'" r="26" fill="#c0603a" stroke="#fff" stroke-width="3"/>'+
      (CTR_ICON ? svgIco(CTR_ICON, cx, cy-6, 15)+'<text x="'+cx+'" y="'+(cy+19)+'" text-anchor="middle" font-size="9" fill="#fff" font-weight="800">'+esc(CTR_LABEL)+'</text>' : '<text x="'+cx+'" y="'+(cy-2)+'" text-anchor="middle" font-size="20">'+CTR_EMOJI+'</text>'+
      '<text x="'+cx+'" y="'+(cy+14)+'" text-anchor="middle" font-size="9" fill="#fff" font-weight="800">'+esc(CTR_LABEL)+'</text>')+'</svg>';
    // ── ранг (титул растёт по ширине) ──
    var r=rankNow(), ko=knownOrgans(), nxt=RANKS[rankIdx()+1];
    var rankHtml='<div class="rankbar"><span class="rke">'+em(r.icon, r.emoji)+'</span>'+
      '<span class="rkt"><b>'+esc(r.name)+'</b>'+
      (nxt?'<i>ещё '+(nxt.min-ko)+' до «'+esc(nxt.name)+'»</i>':'<i>'+doneTxt('высший ранг!')+'</i>')+'</span>'+
      '<span class="rkp">'+ko+'/'+totalOrgans()+'</span></div>';
    // ── строки по системам: у каждого узла звёзды глубины мастерства ──
    var rows="";
    sys.forEach(function(sy){
      var st=sysStat(sy), pct=st.tot?Math.round(st.kn/st.tot*100):0;
      var orgs=sy.organs.map(function(o){
        var sc=orgStars(o.id), stars="", k; for(k=0;k<3;k++) stars += (k<sc?"★":"☆");
        return '<div class="org'+(isKnown(o.id)?" met":"")+'"><span class="onm">'+esc(o.name)+'</span>'+
          '<span class="stars" style="'+(sc>0?"color:"+sy.color:"")+'">'+stars+'</span></div>';
      }).join("");
      rows += '<div class="srow"><div class="st">'+(sy.icon?em(sy.icon,null,"sti"):sy.emoji)+' '+esc(sy.name)+'<span class="pc">'+st.kn+'/'+st.tot+'</span></div>'+
        '<div class="track"><i style="width:'+pct+'%;background:'+sy.color+'"></i></div><div class="orgs">'+orgs+'</div></div>';
    });
    // single-menu: путь по главам вшит прямо в экран графа (сверху)
    var pathHtml = SINGLE_MENU ? '<div class="pathsec"><div class="pathh">🗺 Путь по главам</div>'+mapRowsHtml()+'</div>' : "";
    $("pgraph").innerHTML = pathHtml + rankHtml + svg + rows + langSettingsHtml();
    if(SINGLE_MENU) bindMapRows($("pgraph"));
    bindLangSettings();
    $("parent").classList.add("on");
    animateConstellation();
  }
  /* каскад графа-констелляции: линии прорисовываются, узлы загораются по очереди */
  function animateConstellation(){
    if(!aniOK()) return;
    var pg=$("pgraph"), svgEl=pg && pg.querySelector(".pgsvg"); if(!svgEl) return;
    var lines=svgEl.querySelectorAll("line"), circles=svgEl.querySelectorAll("circle");
    [].forEach.call(circles, function(c){ c.setAttribute("data-r", c.getAttribute("r")); c.setAttribute("r", 0); });
    ANI({ targets:[].slice.call(lines), strokeDashoffset:[ANI.setDashoffset, 0],
      duration:520, delay:ANI.stagger(8), easing:"easeOutQuad" });
    ANI({ targets:[].slice.call(circles), r:function(el){ return el.getAttribute("data-r"); },
      duration:430, delay:ANI.stagger(10,{start:160}), easing:"easeOutBack" });
    ANI({ targets:[].slice.call(svgEl.querySelectorAll("text, image")), opacity:[0,1],
      duration:380, delay:ANI.stagger(10,{start:260}), easing:"linear" });
    ANI({ targets:[].slice.call(pg.querySelectorAll(".srow")), translateY:[14,0], opacity:[0,1],
      duration:380, delay:ANI.stagger(55,{start:220}), easing:"easeOutQuad" });
    ANI({ targets:[].slice.call(pg.querySelectorAll(".track i")), scaleX:[0,1],
      duration:600, delay:ANI.stagger(55,{start:340}), easing:"easeOutQuad" });
  }
  /* ---------- паспорт исследователя (штампы по системам) ---------- */
  function openPassport(){
    var sys=GRAPH.systems, earned=0, cells="";
    sys.forEach(function(sy){
      var got=!!stamps[sy.id], st=sysStat(sy); if(got) earned++;
      cells += '<div class="stamp'+(got?" got":"")+'" style="'+(got?"--sc:"+sy.color:"")+'">'+
        '<span class="se">'+(sy.icon?em(sy.icon,null):sy.emoji)+'</span><span class="snm">'+esc(sy.name)+'</span>'+
        '<span class="ss">'+(got?"✓ собрано":st.kn+"/"+st.tot)+'</span></div>';
    });
    if($("ppn")) $("ppn").textContent=earned;
    if($("ppu")) $("ppu").textContent="из "+sys.length+" штампов";
    if($("ppGrid")) $("ppGrid").innerHTML=cells;
    if($("passport")) $("passport").classList.add("on");
  }
  function closePassport(){ if($("passport")) $("passport").classList.remove("on"); }
  function closeParent(){ $("parent").classList.remove("on");
    if(NAV && !($("navoverlay")&&$("navoverlay").classList.contains("on"))) setNavActive("feed"); }

  /* ---------- нижнее меню-компаньон + оверлей-раздел (FP.nav) ---------- */
  var navFrame=null, navLoaded=false, navActive="feed";
  function curLang(){ return (LANGKEY && localStorage.getItem(LANGKEY)) ||
    (LANGLIST && LANGLIST[0] && LANGLIST[0][0]) || "ru"; }
  function withLang(src){ if(!LANGKEY) return src;
    return src + (src.indexOf("?")>=0?"&":"?") + "lang=" + encodeURIComponent(curLang()); }
  function setNavActive(id){ navActive=id;
    var bar=$("feednav"); if(!bar) return;
    [].forEach.call(bar.children, function(b){ b.classList.toggle("on", b.getAttribute("data-nid")===id); }); }
  function openOverlay(item){
    var ov=$("navoverlay"); if(!ov) return;
    stopAudio();
    if(!navLoaded){ navFrame.src=withLang(item.src); navLoaded=true; navFrame._tab=item.id; }
    else if(navFrame._tab!==item.id){ navFrame._tab=item.id;
      try{ navFrame.contentWindow.postMessage({type:"oceanTab",tab:item.id},"*"); }catch(e){} }
    ov.classList.add("on"); setNavActive(item.id);
  }
  function closeOverlay(){ var ov=$("navoverlay"); if(ov) ov.classList.remove("on");
    setNavActive("feed"); if(unlocked) playCard(CARDS[idx]); }
  function navTo(item){
    if(item.id==="feed"){ closeParent(); closeMap(); closeOverlay(); }
    else if(item.id==="parent"){ closeOverlay(); openParent(); setNavActive("parent"); }
    else if(item.src){ closeParent(); openOverlay(item); }
  }
  function buildNav(){
    if(!NAV || $("feednav")) return;
    var ov=div(""); ov.id="navoverlay";
    navFrame=document.createElement("iframe"); navFrame.setAttribute("title","Энциклопедия");
    ov.appendChild(navFrame); document.body.appendChild(ov);
    var bar=div(""); bar.id="feednav";
    NAV.forEach(function(item){
      var b=document.createElement("button"); b.className="navbtn"; b.setAttribute("data-nid",item.id);
      b.innerHTML='<span class="nie">'+em(item.icon, item.emoji||"•")+'</span>'+
        '<span class="nil">'+esc(item.label||"")+'</span>';
      b.onclick=function(){ navTo(item); };
      bar.appendChild(b);
    });
    document.body.appendChild(bar);
    document.body.classList.add("has-feednav");
    setNavActive("feed");
  }
  /* язык: смена в родительском экране → localStorage + постмессидж энциклопедии */
  function setCompanionLang(code){
    if(!LANGKEY) return;
    try{ localStorage.setItem(LANGKEY, code); }catch(e){}
    if(navLoaded && navFrame){ try{ navFrame.contentWindow.postMessage({type:"oceanLang",lang:code},"*"); }catch(e){} }
    /* данные ленты локализованы ({ru,en,…}) → пересобрать ленту на новом языке */
    if(LOCALIZED && code!==LANG){ try{ location.reload(); }catch(e){} }
  }
  function langSettingsHtml(){
    var hasLang = LANGKEY && LANGLIST, credits = FP.creditsUrl;
    if(!hasLang && !credits) return "";
    var inner = "";
    if(hasLang){
      var cur=curLang(), opts=LANGLIST.map(function(l){
        return '<option value="'+esc(l[0])+'"'+(l[0]===cur?' selected':'')+'>'+esc(l[1]||l[0])+'</option>'; }).join("");
      inner += '<div class="psrow"><span class="pslab">🌍 '+T2("langLabel","Язык энциклопедии")+'</span>'+
        '<select id="feedLangSel">'+opts+'</select></div>';
    }
    if(credits){
      inner += '<div class="psrow"><span class="pslab">📷 Источники изображений</span>'+
        '<a class="pslink" href="'+esc(credits)+'" target="_blank" rel="noopener">Титры ↗</a></div>';
    }
    return '<div class="parentset"><div class="psh">⚙️ '+T2("settingsHead","Настройки")+'</div>'+inner+'</div>';
  }
  function bindLangSettings(){
    var s=$("feedLangSel"); if(!s) return;
    s.onchange=function(){ setCompanionLang(s.value); };
  }
  /* локализация статичного каркаса index.html (подсказка-свайп, заголовки карты
     пути и родительского экрана) — через тот же словарь FEED_GRAPH.ui */
  (function applyChrome(){
    var sh=$("swipeHint"), v;
    if(sh && (v=T2("swipeHint",null))) sh.innerHTML='<span class="arw">↑</span>'+esc(v);
    function setTxt(sel,key){ var el=document.querySelector(sel), t=T2(key,null); if(el&&t) el.textContent=t; }
    setTxt("#map header h1","mapH1"); setTxt("#map > .sub","mapSub");
    setTxt("#parent header h1","parentH1"); setTxt("#parent > .sub","parentSub");
  })();

  /* ---------- озвучка: кнопка «звук» ---------- */
  /* Значок — свой SVG, не эмодзи 🔊/🔇 (решение владельца 05.08.2026: «нам ни
     в коем случае не нужны никакие эмодзи в продукте» + 09.08.2026: «значок
     динамика в разных местах нарисован по-разному… давай абсолютно везде его
     рисовать одинаково»). Тот же контур динамика, что в decks/slovar-na-
     stsenah/content.js (эталон рисунка на платформе); у выключенного звука —
     тот же конус и крестик вместо волн, а не отдельный несвязанный рисунок.
     Растровый *icon с колоды (T2('icoSound'/'icoSoundOff')) остаётся первым
     приоритетом — это опт-ин для контентных эмодзи (органы графа и т.п.), не
     трогаем; SVG — только запасной путь ВМЕСТО прежнего текстового эмодзи. */
  var ICO_SOUND_ON = '<path d="M4.5 9.5h3.2L12 5.8v12.4l-4.3-3.7H4.5z"/>'+
    '<path d="M15.2 9.4a3.6 3.6 0 0 1 0 5.2M17.8 7.2a7 7 0 0 1 0 9.6"/>';
  var ICO_SOUND_OFF = '<path d="M4.5 9.5h3.2L12 5.8v12.4l-4.3-3.7H4.5z"/>'+
    '<path d="M15 9l5 5M20 9l-5 5"/>';
  function svgSound(on){
    return '<svg class="ic" viewBox="0 0 24 24" width="18" height="18" fill="none"'+
      ' stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'+
      ' aria-hidden="true" focusable="false">'+(on?ICO_SOUND_ON:ICO_SOUND_OFF)+'</svg>';
  }
  function setMuteIcon(){ var b=$("muteBtn"); if(!b) return;
    var ic = muted ? T2("icoSoundOff",null) : T2("icoSound",null);
    if(ic) b.innerHTML = em(ic, null); else b.innerHTML = svgSound(!muted);
    /* Эмодзи нёс имя для читалки экрана сам (Unicode-описание глифа), SVG с
       aria-hidden — нет: без явной подписи кнопка осталась бы безымянной. */
    b.setAttribute("aria-label", muted ? "Звук выключен" : "Звук включён"); }
  (function initMute(){
    var b=$("muteBtn"); if(!b) return;
    if(!AUDIO_ON){ b.style.display="none"; return; }
    b.style.display="";
    setMuteIcon();
    b.onclick = function(){
      muted = !muted; localStorage.setItem(K_MUTE, muted?"1":"0"); setMuteIcon();
      if(muted) stopAudio(); else { unlocked=true; playCard(CARDS[idx], true); }
    };
  })();

  /* ---------- чип звёзд и кольцо уровня в шапке (создаёт движок) ---------- */
  (function initStars(){
    var hud=$("hud"); if(!hud) return;
    var ring=document.createElement("div"); ring.id="lvlRing";
    hud.insertBefore(ring, $("muteBtn"));
    var chip=document.createElement("div"); chip.id="starChip";
    hud.insertBefore(chip, $("muteBtn"));
    renderStars();
  })();

  /* ---------- тестируемость (§18): хуки только под ?test=1 ---------- */
  if(/[?&]test=1/.test(location.search)){
    window.__feed = { get pos(){ return idx; }, get n(){ return CARDS.length; },
      get stars(){ return stars; }, get mastery(){ return known; }, get bkt(){ return !!BKT; },
      get rank(){ return rankNow().name; }, get known(){ return knownOrgans(); },
      get reviewing(){ return !!reviewCard; }, get pool(){ return reviewPool.length; },
      m:function(id){ return mVal(id); }, expose:function(id,ev){ mUpd(id, ev||"expose"); },
      hardAt:function(p){ return fdHard(CARDS[p|0]); } };
    window.__feedGo = function(p){ p=p|0; if(p<0||p>=CARDS.length) return;
      idx=p; lastCh=-1; render(); refreshHud(); };
  }

  /* ---------- старт ---------- */
  $("pClose").onclick = closeParent;
  if(NAV) buildNav();      // нижнее меню-компаньон (лента-оболочка)
  // нижнее меню тома (FEED_MENU) — «Родителям»/граф живут там; ярлык главы
  // слева вверху всегда открывает ЧИСТУЮ карту пути (быстрый прыжок по главам)
  var HAS_BOTMENU = !!(window.FEED_MENU && window.FEED_MENU.length);
  if(NAV || HAS_BOTMENU){
    // «Родителям» живёт в нижнем меню; кнопка-родитель и мини-граф скрыты,
    // ярлык главы слева вверху открывает карту пути (быстрый прыжок по главам)
    var _pb=$("parentBtn"); if(_pb) _pb.style.display="none";
    var _mg=$("miniGraph"); if(_mg) _mg.style.display="none";
    if($("chapLab")) $("chapLab").onclick = openMap;
  } else if(SINGLE_MENU){
    // один режим-меню слева вверху: ярлык главы открывает граф (с путём внутри),
    // кнопка-родитель и нижний мини-граф скрыты
    var _pb=$("parentBtn"); if(_pb) _pb.style.display="none";
    var _mg=$("miniGraph"); if(_mg) _mg.style.display="none";
    if($("chapLab")) $("chapLab").onclick = openParent;
  } else {
    if($("parentBtn")) $("parentBtn").onclick = openParent;
    if($("miniGraph")) $("miniGraph").onclick = openParent;   // ребёнок может открыть граф целиком
    if($("chapLab")) $("chapLab").onclick = openMap;          // тап по ярлыку главы → карта пути
  }
  if($("mClose")) $("mClose").onclick = closeMap;
  if($("passportBtn")) $("passportBtn").onclick = openPassport;
  if($("ppClose")) $("ppClose").onclick = closePassport;

  /* ---------- единое нижнее меню тома (Лента = базовая оболочка) ---------- */
  (function bottomMenu(){
    var items = window.FEED_MENU; if(!items || !items.length) return;
    var enLang = localStorage.getItem(window.FEED_LANG_KEY || (NS+"_lang"))==="en";
    var nav = document.createElement("nav"); nav.id="botmenu";
    items.forEach(function(m){
      var active = m.to==="lenta";
      var a = document.createElement(active?"span":"a");
      a.className = "bm"+(active?" on":"");
      if(!active) a.href = "../index.html?go="+m.to;      // остальные режимы — в хабе тома
      a.innerHTML = '<img src="../img/icons/'+m.icon+'.webp" alt="">'+
        '<span>'+esc(enLang&&m.labelEn?m.labelEn:m.label)+'</span>';
      nav.appendChild(a);
    });
    document.body.appendChild(nav);
    document.body.classList.add("hasmenu");
  })();

  /* ?ch=N — открыть ленту сразу с нужной главы (обзор/диплинк), поверх резюма */
  (function(){ var m=/[?&]ch=(\d+)/.exec(location.search); if(!m) return;
    var meta=chLoaded(parseInt(m[1],10)); if(meta){ idx=meta.start; lastCh=-1; } })();

  refreshHud();
  render();
})();
