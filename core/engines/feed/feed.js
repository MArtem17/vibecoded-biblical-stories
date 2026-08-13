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
  var K_DONE = NS + "_feed_done";

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
  var PRAISE = FP.praise || [{ru:"Молодец!",en:"Well done!",de:"Super!",es:"¡Muy bien!",pt:"Muito bem!",fr:"Bravo !",ar:"أحسنت!"},{ru:"Верно!",en:"Right!",de:"Richtig!",es:"¡Correcto!",pt:"Certo!",fr:"Exact !",ar:"صحيح!"},{ru:"Отлично!",en:"Great!",de:"Toll!",es:"¡Genial!",pt:"Ótimo!",fr:"Super !",ar:"ممتاز!"},{ru:"Умница!",en:"Smart!",de:"Klug!",es:"¡Qué listo!",pt:"Espertinho!",fr:"Malin !",ar:"ذكي!"},{ru:"Здорово!",en:"Awesome!",de:"Klasse!",es:"¡Qué bien!",pt:"Demais!",fr:"Génial !",ar:"رائع!"},{ru:"Так держать!",en:"Keep it up!",de:"Weiter so!",es:"¡Sigue así!",pt:"Continua assim!",fr:"Continue comme ça !",ar:"استمر!"}];
  var CHEER  = FP.cheer  || [{ru:"Почти! Ничего страшного.",en:"Almost! That's okay.",de:"Fast! Kein Problem.",es:"¡Casi! No pasa nada.",pt:"Quase! Não tem problema.",fr:"Presque ! Ce n'est rien.",ar:"تقريباً! لا بأس."},{ru:"Не беда — теперь запомнишь!",en:"No worries — now you'll remember!",de:"Kein Problem — jetzt merkst du's!",es:"¡No pasa nada — ahora lo recordarás!",pt:"Sem problema — agora vais lembrar!",fr:"Pas grave — tu t'en souviendras !",ar:"لا بأس — الآن ستتذكر!"},{ru:"Бывает! Дальше получится.",en:"It happens! You'll get it next.",de:"Passiert! Beim nächsten Mal klappt's.",es:"¡Pasa! La próxima sale.",pt:"Acontece! Da próxima dá certo.",fr:"Ça arrive ! La prochaine fois ça ira.",ar:"يحصل! المرة القادمة ستنجح."}];
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
        var pr=sayAu.play(); if(pr&&pr.catch) pr.catch(function(){ speakSS(L(bank[i])); }); }catch(e){ speakSS(L(bank[i])); }
    } else speakSS(L(bank[i]));                         // офлайн-фолбэк
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
  /* Язык оболочки (bibi_lang / BibleI18n) — все тексты карточек через L(). */
  function curAppLang(){
    try{ if(window.BibleI18n && typeof BibleI18n.curLang==="function"){
      var g=BibleI18n.curLang(); if(g) return g; } }catch(e){}
    try{
      var key=window.FEED_LANG_KEY || LANGKEY || "bibi_lang";
      var s=localStorage.getItem(key);
      if(s) return s;
    }catch(e){}
    return "ru";
  }
  function L(o){
    if(o==null) return "";
    if(typeof o==="string" || typeof o==="number" || typeof o==="boolean") return String(o);
    if(typeof o==="object"){
      try{ if(window.BibleI18n && typeof BibleI18n.L==="function"){
        var v=BibleI18n.L(o); if(v!=null && v!=="") return String(v); } }catch(e){}
      var lang=curAppLang();
      if(o[lang]!=null && o[lang]!=="") return String(o[lang]);
      if(o.ru!=null && o.ru!=="") return String(o.ru);
      if(o.en!=null && o.en!=="") return String(o.en);
      return "";
    }
    return String(o);
  }
  function applyDocLang(){
    var lang=curAppLang();
    try{
      document.documentElement.setAttribute("lang", lang);
      document.documentElement.setAttribute("dir", lang==="ar" ? "rtl" : "ltr");
    }catch(e){}
  }
  function esc(s){ return L(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
  function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;} return a; }
  function jget(k,d){ try{ return JSON.parse(localStorage.getItem(k)) || d; }catch(e){ return d; } }
  function jset(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  function darken(hex,f){ var m=/^#?([0-9a-f]{6})$/i.exec(hex||""); if(!m)return hex||"#b85a3a";
    var n=parseInt(m[1],16), r=(n>>16)&255, g=(n>>8)&255, b=n&255;
    return "rgb("+Math.round(r*f)+","+Math.round(g*f)+","+Math.round(b*f)+")"; }

  var learned = jget(K_LEARN, {});
  function isLearned(id){ return !!learned[id]; }
  function mark(id){ if(!learned[id]){ learned[id]=1; jset(K_LEARN, learned); refreshHud(); } }

  /* успешное прохождение интерактива (не ошибка): при повторном визите
     карточка сразу в «готовом» виде; сброс — только из родительского экрана */
  var doneCards = jget(K_DONE, {});
  function isCardDone(id){ return !!(id && doneCards[id]); }
  function markCardDone(id){ if(!id || doneCards[id]) return; doneCards[id]=1; jset(K_DONE, doneCards); }
  function unmarkCardDone(id){
    if(!id || !doneCards[id]) return;
    delete doneCards[id]; jset(K_DONE, doneCards);
  }
  function clearCardDone(){ doneCards={}; jset(K_DONE, {}); }

  /* граф знаний: органы по системам (window.FEED_GRAPH). Орган «изучен», если
     ребёнок прошёл карточку с knows:[id] или успешно поставил/нашёл его. */
  var GRAPH = window.FEED_GRAPH || {systems:[]};
  // словарь узла настраивается на колоду (тело → «орган», Библия → «история»…)
  var NODE_NEW = GRAPH.newNodeLabel || {ru:"Новая история!",en:"New story!",de:"Neue Geschichte!",es:"¡Nueva historia!",pt:"Nova história!",fr:"Nouvelle histoire !",ar:"قصة جديدة!"};   // плашка-салют при загорании
  var NODE_GEN = GRAPH.unitGen || {ru:"историй",en:"stories",de:"Geschichten",es:"historias",pt:"histórias",fr:"histoires",ar:"قصص"};             // родит. мн.: «из N …»
  var CTR_EMOJI = GRAPH.centerEmoji || "🧑";             // центр графа-констелляции
  var CTR_LABEL = GRAPH.centerLabel || {ru:"БИБЛИЯ",en:"BIBLE",de:"BIBEL",es:"BIBLIA",pt:"BÍBLIA",fr:"BIBLE",ar:"الكتاب المقدس"};
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
  function doneTxt(s){ s=L(s); return UII.plain ? s : s + " 🎉"; }
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
    {min:0,  name:{ru:"Новичок",en:"Beginner",de:"Anfänger",es:"Principiante",pt:"Iniciante",fr:"Débutant",ar:"مبتدئ"},  emoji:"🐣"},
    {min:2,  name:{ru:"Ученик",en:"Learner",de:"Schüler",es:"Alumno",pt:"Aluno",fr:"Élève",ar:"تلميذ"},   emoji:"📖"},
    {min:5,  name:{ru:"Знаток",en:"Expert",de:"Kenner",es:"Experto",pt:"Perito",fr:"Expert",ar:"خبير"},   emoji:"🔎"},
    {min:10, name:{ru:"Мастер",en:"Master",de:"Meister",es:"Maestro",pt:"Mestre",fr:"Maître",ar:"أستاذ"},   emoji:"🏅"},
    {min:16, name:{ru:"Профессор",en:"Professor",de:"Professor",es:"Profesor",pt:"Professor",fr:"Professeur",ar:"بروفيسور"},emoji:"🎓"}
  ];
  function rankIdx(){ var p=knownOrgans(), r=0, i; for(i=0;i<RANKS.length;i++){ if(p>=RANKS[i].min) r=i; } return r; }
  function rankNow(){ return RANKS[rankIdx()]; }

  /* звёзды (§17): ⭐ за безошибочное / первое задание; знаменатель в шапке —
     реальный максимум по живой колоде (starMax), не FEED_PROGRAM.starGoal.
     Чип создаёт движок. Persistence текущего счёта — без изменений. */
  var K_STAR = NS + "_feed_stars";
  var stars = parseInt(localStorage.getItem(K_STAR),10)||0;
  /* Сколько ⭐ можно набрать максимум: 1 за каждый путь, где addStar реально
     вызывается при идеальной попытке (first-try / no-miss). Пассивный art/sys
     без veil и без мульти-spots — 0. poke/reveal (один спот) звезду не даёт. */
  function starMax(){
    var tot=0, i, c, k, spots, it, n;
    for(i=0;i<CARDS.length;i++){
      c=CARDS[i]; if(!c) continue;
      k=c.kind;
      if(k==="check"||k==="match"||k==="find"||k==="count"||k==="colors"||
         k==="order"||k==="scene"||k==="tf"||k==="gone"||k==="catch"||
         k==="lant"||k==="veil"||k==="beforeafter"){ tot++; continue; }
      /* плагины FEED_KINDS: interactive → обычно 1 (или def.stars), star:false — 0 */
      if(KINDS && KINDS[k] && KINDS[k].interactive && KINDS[k].star!==false){
        tot += (KINDS[k].stars|0) || 1; continue;
      }
      n=0;
      if(c.veil) n++;
      spots=c.spots;
      if(!spots && (it=c.interact) && (it.type==="poke"||it.type==="reveal")) spots=[it];
      if(spots && spots.length>1) n++;   // как в buildCard: ⭐ только при total>1
      tot += n;
    }
    return tot;
  }
  function renderStars(){ var c=$("starChip"); if(!c) return;
    var max=starMax();
    if(!stars && !max){ c.style.display="none"; return; }
    c.style.display="";
    c.innerHTML = (UII.star?em(UII.star,null,"sci"):"⭐")+"<b>"+stars+"</b>"+
      (max ? "<small>/ <span>"+max+"</span></small>" : ""); }
  function addStar(){ stars++;
    try{ localStorage.setItem(K_STAR, String(stars)); }catch(e){}
    renderStars();
    var c=$("starChip"); if(c){ c.classList.remove("pop"); void c.offsetWidth; c.classList.add("pop"); } }

  /* «загорание» узла / ранг / штамп: всплывашка-салют + пульс мини-графа */
  var celebQ = [], celebBusy = false;
  function pushCeleb(item){ if(!item) return; celebQ.push(item); pulseMini(); if(!celebBusy) nextCeleb(); }
  function celebrateOrgan(id){ var m=ORGMETA[id]; if(m) pushCeleb({emoji:m.emoji,icon:m.icon,color:m.color,top:NODE_NEW,name:m.name}); }
  function celebrateRank(i){ var r=RANKS[i]; if(r){ pushCeleb({emoji:r.emoji,icon:r.icon,color:"#e06104",top:{ru:"Новый ранг!",en:"New rank!",de:"Neuer Rang!",es:"¡Nuevo rango!",pt:"Novo nível!",fr:"Nouveau rang !",ar:"رتبة جديدة!"},name:r.name,big:true}); if(MILESTONE_STARS) addStar(); } }
  function nextCeleb(){
    var host=$("celebrate"); if(!host || !celebQ.length){ celebBusy=false; return; }
    celebBusy=true; var m=celebQ.shift();
    var t=div("celeb"+(m.big?" big":"")); t.style.setProperty("--cc", m.color||"#b85a3a");
    t.innerHTML='<span class="ce">'+em(m.icon, m.emoji)+'</span><span class="ct"><b>'+esc(m.top||NODE_NEW)+'</b><i>'+esc(m.name)+'</i></span>';
    host.appendChild(t); t.getBoundingClientRect(); t.classList.add("show");
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
      pushCeleb({emoji:sy.emoji, icon:sy.icon, color:sy.color, top:{ru:"Штамп в паспорт!",en:"Passport stamp!",de:"Stempel im Pass!",es:"¡Sello en el pasaporte!",pt:"Carimbo no passaporte!",fr:"Tampon dans le passeport !",ar:"ختم في الجواز!"}, name:sy.name, big:true});
      if(MILESTONE_STARS) addStar(); } }); }

  /* объявление главы: баннер «Глава N · Тема» при входе в новую главу */
  function chapterSplash(m){ var host=$("celebrate"); if(!host || !m || !m.title) return;
    var t=div("chsplash"); t.style.setProperty("--cc", m.color);
    t.innerHTML='<span class="che">'+(m.icon?em(m.icon,null):(m.emoji||"📖"))+'</span>'+
      '<span class="cht"><b>'+esc({ru:"Глава",en:"Chapter",de:"Kapitel",es:"Capítulo",pt:"Capítulo",fr:"Chapitre",ar:"فصل"})+' '+m.num+(PROG_CH>1?' / '+PROG_CH:'')+'</b><i>'+esc(m.title)+'</i></span>';
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
      (CTR_ICON ? svgIco(CTR_ICON,30,30,7) : '<circle cx="30" cy="30" r="6.5" fill="#b85a3a"/><text x="30" y="33.5" text-anchor="middle" font-size="8">'+CTR_EMOJI+'</text>')+'</svg>'+
      '<span class="mgr">'+em(rankNow().icon, rankNow().emoji)+'</span>'+
      '<span class="mgn">'+knownOrgans()+'/'+totalOrgans()+'</span>';
  }

  /* ---------- HUD ---------- */
  function seenCount(){ var s=0; CARDS.forEach(function(c){ if(isLearned(c.id)) s++; }); return s; }
  /* кольцо уровня (§12): цифра главы в кружке + SVG-кольцо прогресса главы —
     ребёнок всегда видит, сколько осталось до следующего уровня */
  function renderRing(){
    var host=$("lvlRing"); if(!host) return;
    var m=chMeta(), pos=idx-m.start+1, pct=m.count?Math.max(0.04, pos/m.count):0;
    var R=15.5, C=2*Math.PI*R;
    host.innerHTML='<svg viewBox="0 0 36 36" aria-hidden="true">'+
      '<circle class="flvl-bg" cx="18" cy="18" r="'+R+'"></circle>'+
      '<circle class="flvl-fg" cx="18" cy="18" r="'+R+'"'+
      ' stroke-dasharray="'+(C*pct).toFixed(1)+' '+C.toFixed(1)+'"></circle>'+
      '</svg><b>'+m.num+'</b>';
  }
  function refreshHud(){
    var m=chMeta();
    // СКВОЗНАЯ нумерация: какая сейчас карточка из всего курса (не внутри главы)
    var gpos=idx+1, gtot=CARDS.length, gpct=gtot?Math.round(gpos/gtot*100):0;
    var f=$("kfill"); if(f){ f.style.width=gpct+"%";
      f.style.background="linear-gradient(90deg,#c9a227,#e8c04a)"; }
    var cp=$("chapPos"); if(cp) cp.textContent=gpos+" / "+gtot;
    var cl=$("chapLab"); if(cl) cl.title = L({ru:"Глава",en:"Chapter",de:"Kapitel",es:"Capítulo",pt:"Capítulo",fr:"Chapitre",ar:"فصل"})+" "+m.num+(PROG_CH>1?" / "+PROG_CH:"")+" · "+L(m.title);
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
    waitingAnswer = false;
    answerRevealUntil = 0;
    showGoHint(false);
    feed.innerHTML="";
    var card = CARDS[reviewCard.ci];
    var el = buildCard(card); el.classList.add("isreview");
    var rib=div("revrib"); rib.textContent=L({ru:"⟳ Повторим!",en:"⟳ Let's review!",de:"⟳ Nochmal!",es:"⟳ ¡Repasemos!",pt:"⟳ Vamos rever!",fr:"⟳ On révise !",ar:"⟳ لنراجع!"}); el.appendChild(rib);
    feed.appendChild(el);
    if(unlocked) playCard(card);
    syncGoHintLabel();
    showGoHint(!waitingAnswer);
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
  var waitingAnswer = false;
  var answerRevealUntil = 0; /* блок go сразу после ответа (ghost-click / свайп) — как у птиц */
  function showGoHint(on){
    var b=$("fGoHint"); if(!b) return;
    b.classList.toggle("show", !!on);
  }
  function cardReady(delay){
    waitingAnswer = false;
    var d = (delay==null ? 450 : delay);
    answerRevealUntil = Date.now() + Math.max(0, d);
    if(d<=0){ showGoHint(true); return; }
    setTimeout(function(){ showGoHint(true); }, d);
  }
  /* успех → запомнить id и открыть «Далее» (без повторной ⭐ при restore) */
  function succeedReady(card, delay){
    if(card && card.id) markCardDone(card.id);
    cardReady(delay);
  }
  function syncGoHintLabel(){
    var lab=$("fGoHintLab"), btn=$("fGoHint");
    if(lab) lab.textContent = T2("next",{ru:"Далее",en:"Next",de:"Weiter",es:"Siguiente",pt:"Seguinte",fr:"Suivant",ar:"التالي"});
    if(btn) btn.setAttribute("aria-label", T2("nextAria",{ru:"Дальше",en:"Next",de:"Weiter",es:"Siguiente",pt:"Seguinte",fr:"Suivant",ar:"التالي"}));
  }
  var FEED_API = {
    div:div, esc:esc, em:em, shuffle:shuffle, darken:darken,
    addStar:function(){ return addStar(); },
    mark:function(id){ return mark(id); },
    learned:function(id){ return isLearned(id); },
    done:function(id){ return isCardDone(id); },
    markDone:function(id){ return markCardDone(id); },
    unmarkDone:function(id){ return unmarkCardDone(id); },
    mUpd:function(id,ev){ return mUpd(id,ev); },
    mVal:function(id){ return mVal(id); },
    go:function(d){ return go(d); },
    ready:function(d){ return cardReady(d); },
    succeed:function(card,d){ return succeedReady(card,d); },
    say:function(clips,fb,then){ return say(clips,fb,then); },
    T:function(k,f){ return T2(k,f); }
  };

  function buildCard(card){
    var el = div("card " + card.kind);
    // тап по карточке (мимо интерактива) = дальше; свайп ↑↓ / ←→ / «Далее» — тоже
    if(["check","match","find","count","colors","beforeafter","order","scene","tf","gone","catch","lant","veil"].indexOf(card.kind)<0 && !kindInteractive(card.kind)) el.addEventListener("click", function(){ go(1); });
    // зарегистрированный колодой тип карты — рисует свой билдер (плагин)
    if(KINDS[card.kind]){
      if(kindInteractive(card.kind)) waitingAnswer = true;
      try{ KINDS[card.kind].build(el, card, FEED_API); }catch(e){ if(window.console&&console.error) console.error("feed kind", card.kind, e); }
      /* плагин сам рисует restore через api.done; если не сделал — хотя бы разблокируем свайп */
      if(kindInteractive(card.kind) && isCardDone(card.id) && waitingAnswer) cardReady(0);
      return el;
    }
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
      waitingAnswer = true;
      var checkDone = isCardDone(card.id);
      // варианты: при BKT — уверенному больше (сложнее), неуверенному меньше (§11)
      var opts = (card.interact.options||[]).slice();
      if(BKT && card.concept && opts.length>3 && !checkDone){
        var maxN = mVal(card.concept)>=P.light ? 4 : 3;
        if(opts.length>maxN){
          var okO=[], wrO=[];
          opts.forEach(function(o){ (o.ok?okO:wrO).push(o); });
          opts = okO.concat(shuffle(wrO).slice(0, Math.max(1, maxN-okO.length)));
        }
      }
      opts = checkDone ? opts : shuffle(opts);
      // премиальная раскладка: иллюстрация во весь экран + вопрос/варианты в
      // frosted-панели (как у арт-карт). attachQuizBg объявлен ниже по файлу.
      var hasQuizBg = !!card.img;
      if(hasQuizBg){
        el.classList.add("hasbg");
        var qbg=div("qbg"); qbg.style.backgroundImage="url('"+card.img+"')"; el.appendChild(qbg);
        el.appendChild(div("qbgfade"));
      }
      var qwrap=div("qwrap");
      qwrap.innerHTML = (!hasQuizBg
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
        if(o.ok) addStar();                       // ⭐ за верный ответ с первой попытки
        var ex=div("explain"); ex.innerHTML='<b>'+(o.ok?"✓":"")+'</b> '+esc(card.interact.explain); qwrap.appendChild(ex);
        if(o.ok) succeedReady(card); else cardReady();
      }
      opts.forEach(function(o){
        var b=document.createElement("button"); b.className="opt"; b.textContent=L(o.t);
        if(checkDone){
          b.style.pointerEvents="none";
          if(o.ok) b.classList.add("ok");
        } else {
          b.onclick=function(){ pick(o,b); };
        }
        btnOf.push(b);
        ob.appendChild(b);
      });
      qwrap.appendChild(ob);
      if(checkDone){
        el._answered=true;
        var exD=div("explain"); exD.innerHTML='<b>✓</b> '+esc(card.interact.explain); qwrap.appendChild(exD);
        el.appendChild(qwrap);
        cardReady(0);
      } else {
      // голосовой ответ: ребёнок может НАЗВАТЬ вариант (§11). Кнопка-микрофон
      // появляется только если включено и браузер умеет распознавание речи.
      if(VOICE_ANSWER && SR){
        var mrow=div("microw");
        var mb=document.createElement("button"); mb.className="micbtn"; mb.id="micBtn";
        mb.innerHTML='<span class="micico">🎤</span><span class="mictx">'+esc({ru:"Нажми и назови ответ",en:"Tap and say the answer",de:"Tippe und sage die Antwort",es:"Toca y di la respuesta",pt:"Toca e diz a resposta",fr:"Appuie et dis la réponse",ar:"اضغط وقل الإجابة"})+'</span>';
        mrow.appendChild(mb); qwrap.appendChild(mrow);
        armVoiceAnswer(mb, opts, function(o){
          var idx; for(idx=0;idx<opts.length;idx++) if(opts[idx]===o) break;
          if(btnOf[idx]) pick(o, btnOf[idx]);
        });
      }
      el.appendChild(qwrap);
      }
    } else if(card.kind==="match"){
      buildMatch(el, card);
    } else if(card.kind==="find"){
      buildFind(el, card);
    } else if(card.kind==="count"){
      buildCount(el, card);
    } else if(card.kind==="colors"){
      buildColors(el, card);
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
      var short = L(card.text || (card.lines&&card.lines[0]) || "").length < 56;
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
        waitingAnswer = true;
        cover.addEventListener("click", function(ev){ ev.stopPropagation(); });   // тап открывает, не листает
        var chint=div("chiphint"); chint.textContent = (veil && veil!=="title"&&veil!=="text") ? L(veil) : L({ru:"Нажми — узнай",en:"Tap to learn",de:"Tippen — erfahren",es:"Toca — descubre",pt:"Toca — descobre",fr:"Appuie — découvre",ar:"اضغط — اعرف"});
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
          var hasSpots = !!(card.spots && card.spots.length) ||
            (card.interact && (card.interact.type==="poke" || card.interact.type==="reveal"));
          if(!hasSpots) succeedReady(card, 200);
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
        waitingAnswer = true;
        var spotsDone = isCardDone(card.id);
        cover.addEventListener("click", function(ev){ ev.stopPropagation(); }); // пустой тап не листает
        var total=spots.length, found=0;
        var hint=div("spothint");
        if(!spotsDone){
          hint.textContent = total>1 ? (L({ru:"Нажми окошки — узнай секреты",en:"Tap the glows — find secrets",de:"Tippe die Punkte — finde Geheimnisse",es:"Toca los brillos — halla secretos",pt:"Toca os brilhos — acha segredos",fr:"Touche les points — trouve les secrets",ar:"اضغط على النقاط — اعرف الأسرار"})+" · 0/"+total) : L({ru:"Нажми окошко — секрет",en:"Tap a glow — a secret",de:"Tippe einen Punkt — Geheimnis",es:"Toca un brillo — un secreto",pt:"Toca um brilho — um segredo",fr:"Touche un point — un secret",ar:"اضغط على نقطة — سر"});
          cover.appendChild(hint);
        }
        spots.forEach(function(sp){
          var mk=div("spot"); mk.style.left=((sp.x!=null?sp.x:50))+"%"; mk.style.top=((sp.y!=null?sp.y:34))+"%";
          mk.innerHTML='<span class="sdot"></span>';
          function openPop(){
            var old=cover.querySelector(".spotpop"); if(old) old.parentNode.removeChild(old);
            var pop=div("spotpop");
            pop.innerHTML=(sp.title?'<div class="spt">'+esc(sp.title)+'</div>':'')+
              '<div class="spx">'+esc(sp.text)+'</div><button class="spcl" aria-label="'+L({ru:"Закрыть",en:"Close",de:"Schließen",es:"Cerrar",pt:"Fechar",fr:"Fermer",ar:"إغلاق"})+'">✕</button>';
            pop.addEventListener("click", function(e){ e.stopPropagation(); });
            pop.querySelector(".spcl").onclick=function(e){ e.stopPropagation(); if(pop.parentNode) pop.parentNode.removeChild(pop); };
            cover.appendChild(pop); pop.getBoundingClientRect(); pop.classList.add("show");
          }
          if(spotsDone){
            mk._done=true; mk.classList.add("done");
            mk.onclick=function(ev){ ev.stopPropagation(); openPop(); };
          } else {
          mk.onclick=function(ev){ ev.stopPropagation();
            if(!mk._done){ mk._done=true; mk.classList.add("done"); found++;
              if(total>1){ hint.textContent=L({ru:"Нажми окошки — узнай секреты",en:"Tap the glows — find secrets",de:"Tippe die Punkte — finde Geheimnisse",es:"Toca los brillos — halla secretos",pt:"Toca os brilhos — acha segredos",fr:"Touche les points — trouve les secrets",ar:"اضغط على النقاط — اعرف الأسرار"})+" · "+found+"/"+total;
                if(found>=total){ if(typeof addStar==="function") addStar(); if(hint.parentNode) hint.parentNode.removeChild(hint); succeedReady(card, 200); } }
              else { if(hint.parentNode){ hint.parentNode.removeChild(hint); } succeedReady(card, 200); }
            }
            openPop();
          };
          }
          cover.appendChild(mk);
        });
        if(spotsDone) cardReady(0);
      }
    }
    return el;
  }

  /* ── интерактив «перетащи орган на место» (data-driven, как LabelDrag в OM) ── */
  function buildMatch(el, card){
    waitingAnswer = true;
    var aspect = card.aspect || [820,1230];
    var tol = card.tol || 12;                       // допуск в % от высоты доски
    var items = card.items || [];
    var matchDone = isCardDone(card.id);
    el.innerHTML =
      '<div class="mtop"><div class="mt">'+esc(card.title||{ru:"Собери тело",en:"Build the body",de:"Baue den Körper",es:"Arma el cuerpo",pt:"Monta o corpo",fr:"Assemble le corps",ar:"ركّب الجسد"})+'</div>'+
      '<div class="ms">'+esc(card.text||{ru:"Перетащи орган на его место",en:"Drag each organ to its place",de:"Zieh jedes Organ an seinen Platz",es:"Arrastra cada órgano a su sitio",pt:"Arrasta cada órgão ao seu lugar",fr:"Glisse chaque organe à sa place",ar:"اسحب كل عضو إلى مكانه"})+'</div></div>';
    var board = div("mboard");
    if(card.board) board.style.backgroundImage="url('"+card.board+"')";
    el.appendChild(board);
    var bank = div("mbank"); el.appendChild(bank);

    function rect(){ var bw=board.clientWidth,bh=board.clientHeight,iw=aspect[0],ih=aspect[1];
      var s=Math.max(bw/iw,bh/ih); var w=iw*s,h=ih*s; return {x:(bw-w)/2,y:(bh-h)/2,w:w,h:h}; }
    function tpos(it){ var r=rect(); return {x:r.x+it.x/100*r.w, y:r.y+it.y/100*r.h, r:r}; }

    // тонкие кружки-подсказки + поставленные органы; relayout при resize
    var rings={}, marks={}, placed={}, remaining=items.length, miss=0;
    function relayout(){ items.forEach(function(it){ var p=tpos(it);
      var g=rings[it.id]; if(!g){ g=div("mtarget"); g.style.width=(tol*1.2)+"%"; board.appendChild(g); rings[it.id]=g; }
      g.style.left=p.x+"px"; g.style.top=p.y+"px";
      if(placed[it.id]) g.style.display="none";
      var m=marks[it.id]; if(m){ m.style.left=p.x+"px"; m.style.top=p.y+"px"; } }); }
    function placeOrgan(it, silent){
      var p=tpos(it); var m=div("mplaced"); m.style.left=p.x+"px"; m.style.top=p.y+"px";
      m.innerHTML='<img src="'+it.chip+'" alt="">'; board.appendChild(m); marks[it.id]=m;
      if(rings[it.id]) rings[it.id].style.display="none";
      if(!silent) mUpd(it.id,"correct");               // поставил орган → в граф знаний
      placed[it.id]=1; remaining--;
      if(remaining<=0){ var d=div("mdone"); d.textContent=doneTxt({ru:"Готово! Всё собрано",en:"Done! All in place",de:"Fertig! Alles platziert",es:"¡Listo! Todo colocado",pt:"Pronto! Tudo no lugar",fr:"Terminé ! Tout est en place",ar:"تم! كل شيء في مكانه"}); board.appendChild(d);
        if(!silent){ if(!miss) addStar(); succeedReady(card); }  // ⭐ за сборку без промахов
        board.classList.add("ready");      // full-bleed .mboard больше не NOSWIPE — свайп/Далее
        if(silent) cardReady(0); }
    }

    if(matchDone){
      items.forEach(function(it){ placeOrgan(it, true); });
      setTimeout(relayout, 0);
      window.addEventListener("resize", relayout);
      return;
    }

    // фишки-органы (перемешаны). drag на window-слушателях — надёжно на тач и мыши
    shuffle(items).forEach(function(it){
      var chip=div("mchip"); chip.setAttribute("data-id",it.id);
      chip.innerHTML='<img src="'+it.chip+'" alt=""><span class="ml">'+esc(it.name)+'</span>';
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
    waitingAnswer = true;
    var aspect=card.aspect||[820,1230]; var items=card.items||[]; var ask=card.ask||{ru:"Найди: ",en:"Find: ",de:"Finde: ",es:"Encuentra: ",pt:"Encontra: ",fr:"Trouve : ",ar:"جد: "};
    var findDone = isCardDone(card.id);
    var cur=0, found=0, miss=0;
    var top=div("mtop");
    top.innerHTML='<div class="mt">'+esc(card.title||{ru:"Найди и нажми",en:"Find and tap",de:"Finde und tippe",es:"Encuentra y toca",pt:"Encontra e toca",fr:"Trouve et appuie",ar:"جد واضغط"})+'</div>';
    var fmsEl=div("ms"); top.appendChild(fmsEl); el.appendChild(top);
    var board=div("mboard"); if(card.board) board.style.backgroundImage="url('"+card.board+"')";
    el.appendChild(board);
    function rect(){ var bw=board.clientWidth,bh=board.clientHeight,iw=aspect[0],ih=aspect[1];
      var s=Math.max(bw/iw,bh/ih); var w=iw*s,h=ih*s; return {x:(bw-w)/2,y:(bh-h)/2,w:w,h:h}; }
    function tpos(it){ var r=rect(); return {x:r.x+it.x/100*r.w, y:r.y+it.y/100*r.h}; }
    function setPrompt(){ fmsEl.textContent=L(ask)+L(items[cur]?items[cur].name:""); }
    function finishFind(silent){
      var dn=div("mdone"); dn.textContent=doneTxt({ru:"Молодец! Всё нашёл",en:"Well done! You found them all",de:"Super! Alles gefunden",es:"¡Muy bien! Lo encontraste todo",pt:"Muito bem! Achaste tudo",fr:"Bravo ! Tu as tout trouvé",ar:"أحسنت! وجدت الكل"}); board.appendChild(dn);
      if(!silent){ if(!miss) addStar(); succeedReady(card); }
      board.classList.add("ready");
      if(silent) cardReady(0);
    }
    if(findDone){
      fmsEl.textContent=L(ask)+L(items.length?items[items.length-1].name:"");
      function placeMarks(){ items.forEach(function(it){ var p=tpos(it);
        var mk=div("mfound"); mk.style.left=p.x+"px"; mk.style.top=p.y+"px"; mk.textContent="✓"; board.appendChild(mk); }); }
      setTimeout(function(){ placeMarks(); finishFind(true); }, 0);
      window.addEventListener("resize", function(){
        [].forEach.call(board.querySelectorAll(".mfound"), function(n){ if(n.parentNode) n.parentNode.removeChild(n); });
        placeMarks();
      });
      return;
    }
    board.addEventListener("click", function(ev){
      ev.stopPropagation(); if(cur>=items.length) return;
      var b=board.getBoundingClientRect(); var px=ev.clientX-b.left, py=ev.clientY-b.top;
      var it=items[cur]; var p=tpos(it); var d=Math.hypot(px-p.x,py-p.y); var thr=(it.r||13)/100*rect().h;
      if(d<=thr){
        var mk=div("mfound"); mk.style.left=p.x+"px"; mk.style.top=p.y+"px"; mk.textContent="✓"; board.appendChild(mk);
        if(it.id) mUpd(it.id,"correct");     // нашёл орган → в граф знаний
        found++; cur++;
        if(found>=items.length) finishFind(false);
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
    waitingAnswer = true;
    var aspect=card.aspect||[820,1230], spots=card.spots||[], total=spots.length;
    var sceneDone = isCardDone(card.id);
    var board=div("sboard"); if(card.img) board.style.backgroundImage="url('"+card.img+"')";
    el.appendChild(board);
    var top=div("scap");
    top.innerHTML='<div class="st1">'+esc(card.title||{ru:"Загляни на картинку",en:"Look at the picture",de:"Schau aufs Bild",es:"Mira la imagen",pt:"Olha a imagem",fr:"Regarde l'image",ar:"انظر إلى الصورة"})+
      '<span class="scnt">'+T2("scnt",{ru:"Найдено",en:"Found",de:"Gefunden",es:"Encontrado",pt:"Encontrado",fr:"Trouvé",ar:"تم العثور"})+' <b>'+(sceneDone?total:0)+'</b>/'+total+'</span></div>'+
      '<div class="st2">'+esc(sceneDone ? T2("sall",{ru:"Все секреты открыты! Листай дальше ↑",en:"All secrets found! Swipe up ↑",de:"Alle Geheimnisse offen! Weiter wischen ↑",es:"¡Todos los secretos abiertos! Desliza ↑",pt:"Todos os segredos abertos! Desliza ↑",fr:"Tous les secrets ouverts ! Fais glisser ↑",ar:"كل الأسرار مفتوحة! اسحب لأعلى ↑"}) : (card.intro||{ru:"Нажми светящиеся окошки — узнай секреты!",en:"Tap the glowing spots — find secrets!",de:"Tippe die leuchtenden Punkte — finde Geheimnisse!",es:"Toca los puntos brillantes — ¡halla secretos!",pt:"Toca os pontos brilhantes — acha segredos!",fr:"Touche les points lumineux — trouve les secrets !",ar:"اضغط على النقاط المضيئة — اعرف الأسرار!"}))+'</div>';
    el.appendChild(top);
    var info=div("sinfo"); el.appendChild(info);
    // «cover»-раскладка: картинка заполняет кадр (как в референсе), окошки — по её системе координат
    function rect(){ var bw=board.clientWidth,bh=board.clientHeight,iw=aspect[0],ih=aspect[1];
      var s=Math.max(bw/iw,bh/ih); var w=iw*s,h=ih*s; return {x:(bw-w)/2,y:(bh-h)/2,w:w,h:h}; }
    function tpos(sp){ var r=rect(); return {x:r.x+sp.x/100*r.w, y:r.y+sp.y/100*r.h}; }
    var found=0, cntEl=top.querySelector(".scnt b"), nodes=[];
    function openInfo(sp){
      info.innerHTML='<button class="sx" aria-label="'+L({ru:"Закрыть",en:"Close",de:"Schließen",es:"Cerrar",pt:"Fechar",fr:"Fermer",ar:"إغلاق"})+'">&times;</button>'+
        '<div class="si1">'+esc(sp.title)+'</div><div class="si2">'+esc(sp.text)+'</div>';
      info.classList.add("on");
      info.querySelector(".sx").onclick=function(ev){ ev.stopPropagation(); info.classList.remove("on"); };
    }
    spots.forEach(function(sp){
      var h=div("shot"); // empty circle; ✓ + .got on discover
      board.appendChild(h); nodes.push({el:h,sp:sp});
      if(sceneDone){
        h._got=1; h.classList.add("got"); h.innerHTML="✓";
        h.addEventListener("click", function(ev){ ev.stopPropagation(); openInfo(sp); });
      } else {
      h.addEventListener("click", function(ev){ ev.stopPropagation();
        if(h._got){ openInfo(sp); return; }
        h._got=1; h.classList.add("got"); h.innerHTML="✓";
        found++; cntEl.textContent=found; openInfo(sp);
        if(sp.knows) mUpd(sp.knows,"expose");   // окошко может учить свой узел
        if(found>=total){
          var cs=card.concepts||(card.concept?[card.concept]:[]);
          cs.forEach(function(id){ mUpd(id,"expose"); });   // сцена учит все свои узлы
          addStar();
          top.querySelector(".st2").textContent=T2("sall",{ru:"Все секреты открыты! Листай дальше ↑",en:"All secrets found! Swipe up ↑",de:"Alle Geheimnisse offen! Weiter wischen ↑",es:"¡Todos los secretos abiertos! Desliza ↑",pt:"Todos os segredos abertos! Desliza ↑",fr:"Tous les secrets ouverts ! Fais glisser ↑",ar:"كل الأسرار مفتوحة! اسحب لأعلى ↑"});
          succeedReady(card, 200);
        }
      });
      }
    });
    // тап по фону (мимо окошка) — закрыть открытый секрет
    board.addEventListener("click", function(){ info.classList.remove("on"); });
    function relayout(){ nodes.forEach(function(n){ var p=tpos(n.sp);
      n.el.style.left=p.x+"px"; n.el.style.top=p.y+"px"; }); }
    setTimeout(relayout,0); window.addEventListener("resize", relayout);
    if(sceneDone) cardReady(0);
  }
  function T2(k,d){ return L((window.FEED_GRAPH&&FEED_GRAPH.ui&&FEED_GRAPH.ui[k]!=null)?FEED_GRAPH.ui[k]:d); }

  /* ── veil-карточка «Угадай»: большая иллюстрация + вопрос, ответ скрыт вуалью
     (блюр). Тап открывает — имя/факт проявляются, ⭐, узел графа. Следующий тап
     листает дальше. Данные: {img, kicker?, answer, fact?, concept?/concepts?/knows?} */
  function buildVeil(el, card){
    waitingAnswer = true;
    var veilDone = isCardDone(card.id);
    var board=div("vboard"); if(card.img) board.style.backgroundImage="url('"+card.img+"')";
    el.appendChild(board); el.appendChild(div("vfade"));
    var top=div("vtop");
    top.innerHTML='<div class="vk">'+esc(card.kicker||{ru:"Кто это?",en:"Who is this?",de:"Wer ist das?",es:"¿Quién es?",pt:"Quem é este?",fr:"Qui est-ce ?",ar:"من هذا؟"})+'</div>'+
      '<div class="vhint'+(veilDone?" revealed":"")+'">'+(veilDone?T2("veilNext",{ru:"Листай дальше ↑",en:"Swipe up ↑",de:"Weiter wischen ↑",es:"Desliza ↑",pt:"Desliza ↑",fr:"Fais glisser ↑",ar:"اسحب لأعلى ↑"}):T2("veilHint",{ru:"Нажми, чтобы узнать",en:"Tap to find out",de:"Tippe zum Entdecken",es:"Toca para saber",pt:"Toca para saber",fr:"Appuie pour découvrir",ar:"اضغط لتعرف"}))+'</div>';
    el.appendChild(top);
    var ans=div("vans"+(veilDone?"":" veil"));
    ans.innerHTML='<div class="vname">'+esc(card.answer||"")+'</div>'+
      (card.fact?'<div class="vfact">'+esc(card.fact)+'</div>':'');
    el.appendChild(ans);
    if(veilDone){ cardReady(0); return; }
    var done=false;
    el.addEventListener("click", function(){
      if(done) return;
      done=true;
      ans.classList.remove("veil"); void ans.offsetWidth; ans.classList.add("pop");
      top.querySelector(".vhint").textContent=T2("veilNext",{ru:"Листай дальше ↑",en:"Swipe up ↑",de:"Weiter wischen ↑",es:"Desliza ↑",pt:"Desliza ↑",fr:"Fais glisser ↑",ar:"اسحب لأعلى ↑"});
      top.querySelector(".vhint").classList.add("revealed");
      var cs=card.concepts||(card.concept?[card.concept]:[]);
      cs.forEach(function(id){ mUpd(id,"expose"); });
      if(card.knows) mUpd(card.knows,"expose");
      addStar();
      succeedReady(card, 200);
    });
  }

  /* ── интерактив «сосчитай» (тап по предметам, DOM-плитки — без ассетов) ── */
  /* Фон-иллюстрация для проверок (check/tf/order/count): как у арт-карт —
     картинка во весь кадр + затемнение, контент в frosted-панели поверх. */
  function attachQuizBg(el, card){
    if(!card.img) return false;
    el.classList.add("hasbg");
    var qbg=div("qbg"); qbg.style.backgroundImage="url('"+card.img+"')"; el.appendChild(qbg);
    el.appendChild(div("qbgfade"));
    return true;
  }

  function countStepLabel(st){
    if(st==null) return "";
    if(typeof st==="string") return L(st);
    var lang=curAppLang();
    if(st.t!=null && typeof st.t==="object") return L(st.t);
    if(st.label!=null && typeof st.label==="object") return L(st.label);
    if(st.name!=null && typeof st.name==="object") return L(st.name);
    if(st[lang]!=null && st[lang]!=="") return L(st[lang]);
    if(st.t!=null) return L(st.t);
    if(st.label!=null) return L(st.label);
    if(st.name!=null) return L(st.name);
    if(st.ru!=null) return L(st.ru);
    return "";
  }
  function buildCount(el, card){
    waitingAnswer = true;
    var steps=card.days||card.steps||null;
    var n=steps && steps.length ? steps.length : (card.n||3);
    var emoji=card.emoji||"⭐", got=0;
    var ordered=!!(card.ordered && steps && steps.length);
    var asYear=card.unit==="year"||card.unit==="years";
    var countDone = isCardDone(card.id);
    var WORDS_I18N={
      ru:["","Один!","Два!","Три!","Четыре!","Пять!","Шесть!","Семь!","Восемь!","Девять!","Десять!"],
      en:["","One!","Two!","Three!","Four!","Five!","Six!","Seven!","Eight!","Nine!","Ten!"],
      de:["","Eins!","Zwei!","Drei!","Vier!","Fünf!","Sechs!","Sieben!","Acht!","Neun!","Zehn!"],
      es:["","¡Uno!","¡Dos!","¡Tres!","¡Cuatro!","¡Cinco!","¡Seis!","¡Siete!","¡Ocho!","¡Nueve!","¡Diez!"],
      pt:["","Um!","Dois!","Três!","Quatro!","Cinco!","Seis!","Sete!","Oito!","Nove!","Dez!"],
      fr:["","Un !","Deux !","Trois !","Quatre !","Cinq !","Six !","Sept !","Huit !","Neuf !","Dix !"],
      ar:["","واحد!","اثنان!","ثلاثة!","أربعة!","خمسة!","ستة!","سبعة!","ثمانية!","تسعة!","عشرة!"]
    };
    function WORDS(){ return WORDS_I18N[curAppLang()] || WORDS_I18N.ru; }
    function wordN(k){ var w=WORDS(); return w[k]||(k+"!"); }
    var ask0=L(card.ask||{ru:"Сколько их?",en:"How many are there?",de:"Wie viele sind es?",es:"¿Cuántos hay?",pt:"Quantos são?",fr:"Combien y en a-t-il ?",ar:"كم عددهم؟"});
    attachQuizBg(el, card);
    var wrap=card.img ? div("qwrap") : null;
    var top=div("mtop"); top.innerHTML='<div class="mt">'+esc(card.title||{ru:"Сосчитай",en:"Count",de:"Zähle",es:"Cuenta",pt:"Conta",fr:"Compte",ar:"عُدّ"})+'</div>';
    var cnt=div("ms"); cnt.textContent=countDone ? wordN(n) : ask0; top.appendChild(cnt);
    var grid=div("cgrid");
    if(steps) grid.classList.add("cgrid-days");

    function stepUnit(d){
      var lang=curAppLang();
      if(asYear){
        if(lang==="en") return "Year "+d;
        if(lang==="de") return "Jahr "+d;
        if(lang==="es"||lang==="pt") return (lang==="es"?"Año ":"Ano ")+d;
        if(lang==="fr") return "Année "+d;
        if(lang==="ar") return "سنة "+d;
        return "Год "+d;
      }
      if(lang==="en") return "Day "+d;
      if(lang==="de") return "Tag "+d;
      if(lang==="es") return "Día "+d;
      if(lang==="pt") return "Dia "+d;
      if(lang==="fr") return "Jour "+d;
      if(lang==="ar") return "يوم "+d;
      return "День "+d;
    }
    function dayHint(dayIdx){
      var st=steps[dayIdx], lab=countStepLabel(st), d=dayIdx+1;
      var pref = asYear
        ? L({ru:"Сначала год",en:"First: year",de:"Zuerst Jahr",es:"Primero año",pt:"Primeiro ano",fr:"D'abord année",ar:"أولاً السنة"})
        : L({ru:"Сначала день",en:"First: day",de:"Zuerst Tag",es:"Primero día",pt:"Primeiro dia",fr:"D'abord jour",ar:"أولاً اليوم"});
      return lab ? (pref+" "+d+": "+lab) : (pref+" "+d);
    }
    function dayLabel(dayIdx){
      var st=steps[dayIdx], lab=countStepLabel(st), d=dayIdx+1;
      if(lab) return stepUnit(d)+": "+lab;
      return wordN(d);
    }
    /* плитка дня: эмодзи/иконка + короткая подпись (+ номер после верного клика) */
    function dayTileHtml(st, dayIdx, numHidden){
      var hasFace=typeof st==="object" && (st.icon || st.emoji);
      var face= (typeof st==="object" && st.icon) ? em(st.icon,null,"cti")
        : (typeof st==="object" && st.emoji) ? '<span class="femo cti">'+st.emoji+'</span>'
        : '<span class="cnum">'+(dayIdx+1)+'</span>';
      var lab=countStepLabel(st);
      var num=hasFace
        ? '<span class="cdayn"'+(numHidden?' hidden':'')+'>'+(dayIdx+1)+'</span>'
        : '';
      var cap=lab ? '<span class="cdaylab">'+esc(lab)+'</span>' : '';
      return face+num+cap;
    }
    function finishCount(miss, silent){
      var dn=div("mdone"); dn.textContent=doneTxt(card.done||(L({ru:"Всего",en:"Total",de:"Insgesamt",es:"En total",pt:"No total",fr:"En tout",ar:"المجموع"})+" "+n+"! "+L({ru:"Молодец!",en:"Well done!",de:"Super!",es:"¡Muy bien!",pt:"Muito bem!",fr:"Bravo !",ar:"أحسنت!"})));
      dn.style.position="static"; dn.style.margin="14px auto 0"; dn.style.transform="none";
      (wrap||el).appendChild(dn);
      if(!silent){
        if(card.concept) mUpd(card.concept, miss ? "incorrect" : "correct");
        if(!miss) addStar();
        succeedReady(card);
      } else cardReady(0);
    }

    if(countDone){
      var idxs=[]; for(var k0=0;k0<n;k0++) idxs.push(k0);
      idxs.forEach(function(dayIdx){
        var st=steps ? steps[dayIdx] : null;
        var t=div("ctile counted"); t._done=1;
        if(st){
          t.classList.add("cday");
          t.innerHTML=dayTileHtml(st, dayIdx, false);
        } else if(card.icon) t.innerHTML=em(card.icon,null,"cti");
        else t.textContent=emoji;
        grid.appendChild(t);
      });
      if(steps && steps.length) cnt.textContent=dayLabel(n-1);
      if(wrap){ wrap.appendChild(top); wrap.appendChild(grid); el.appendChild(wrap); }
      else { el.appendChild(top); el.appendChild(grid); }
      finishCount(0, true);
      return;
    }

    if(ordered){
      var next=0, miss=0;
      var idxs=[]; for(var k=0;k<n;k++) idxs.push(k);
      var mixed=shuffle(idxs);
      if(n>2){ var tries=0;
        while(tries++<5 && mixed.every(function(di,i){ return di===i; })) mixed=shuffle(idxs); }
      mixed.forEach(function(dayIdx){
        var st=steps[dayIdx];
        var t=div("ctile");
        t.classList.add("cday");
        /* номер дня не показываем до верного клика — иначе порядок очевиден */
        t.innerHTML=dayTileHtml(st, dayIdx, true);
        t.addEventListener("click", function(ev){ ev.stopPropagation();
          if(t._done || next>=n) return;
          if(dayIdx===next){
            t._done=1; t.classList.add("counted");
            var badge=t.querySelector(".cdayn"); if(badge) badge.hidden=false;
            cnt.textContent=dayLabel(dayIdx);
            next++;
            if(next>=n) finishCount(miss, false);
          } else {
            miss++;
            cnt.textContent=dayHint(next);
            t.classList.add("cshake","cwrong");
            setTimeout(function(){ t.classList.remove("cshake","cwrong"); },420);
          }
        });
        grid.appendChild(t);
      });
    } else {
      for(var i=0;i<n;i++){ (function(i){
        var st=steps ? steps[i] : null;
        var t=div("ctile");
        if(st){
          t.classList.add("cday");
          t.innerHTML=dayTileHtml(st, i, false);
        } else if(card.icon) t.innerHTML=em(card.icon,null,"cti");
        else t.textContent=emoji;
        t.addEventListener("click", function(ev){ ev.stopPropagation();
          if(t._done) return; t._done=1; t.classList.add("counted");
          got++;
          if(st){
            var lab=countStepLabel(st);
            if(lab) cnt.textContent=stepUnit(i+1)+": "+lab;
            else cnt.textContent=wordN(got);
          } else cnt.textContent=wordN(got);
          if(got>=n){ finishCount(0, false); }
        });
        grid.appendChild(t);
      })(i); }
    }
    if(wrap){ wrap.appendChild(top); wrap.appendChild(grid); el.appendChild(wrap); }
    else { el.appendChild(top); el.appendChild(grid); }
  }

  /* ── «цвета радуги»: 10 квадратов (7 верных + 3 ложных), тап-тоггл;
     проверка, когда выбрано need (обычно 7). Верные — зелёные, ложные — красные;
     ошибка → сброс и повтор (как order/catch), успех → ⭐ и «Далее». ── */
  function buildColors(el, card){
    waitingAnswer = true;
    var need = card.need || 7;
    var colorsDone = isCardDone(card.id);
    var items = (card.colors || []).map(function(it){
      return { c:it.c || it.color || "#ccc", ok:!!it.ok, name:it.name || "" };
    });
    if(!items.length){
      items = [
        {c:"#e53935", ok:true, name:{ru:"красный",en:"red",de:"rot",es:"rojo",pt:"vermelho",fr:"rouge",ar:"أحمر"}}, {c:"#fb8c00", ok:true, name:{ru:"оранжевый",en:"orange",de:"orange",es:"naranja",pt:"laranja",fr:"orange",ar:"برتقالي"}},
        {c:"#fdd835", ok:true, name:{ru:"жёлтый",en:"yellow",de:"gelb",es:"amarillo",pt:"amarelo",fr:"jaune",ar:"أصفر"}}, {c:"#43a047", ok:true, name:{ru:"зелёный",en:"green",de:"grün",es:"verde",pt:"verde",fr:"vert",ar:"أخضر"}},
        {c:"#4fc3f7", ok:true, name:{ru:"голубой",en:"light blue",de:"hellblau",es:"celeste",pt:"azul-claro",fr:"bleu clair",ar:"أزرق فاتح"}}, {c:"#1e88e5", ok:true, name:{ru:"синий",en:"blue",de:"blau",es:"azul",pt:"azul",fr:"bleu",ar:"أزرق"}},
        {c:"#8e24aa", ok:true, name:{ru:"фиолетовый",en:"purple",de:"violett",es:"morado",pt:"roxo",fr:"violet",ar:"بنفسجي"}},
        {c:"#795548", ok:false, name:{ru:"коричневый",en:"brown",de:"braun",es:"marrón",pt:"marrom",fr:"marron",ar:"بني"}}, {c:"#ec407a", ok:false, name:{ru:"розовый",en:"pink",de:"rosa",es:"rosa",pt:"rosa",fr:"rose",ar:"وردي"}},
        {c:"#9e9e9e", ok:false, name:{ru:"серый",en:"gray",de:"grau",es:"gris",pt:"cinza",fr:"gris",ar:"رمادي"}}
      ];
    }
    items = colorsDone ? items : shuffle(items);
    attachQuizBg(el, card);
    var wrap = card.img ? div("qwrap") : null;
    var host = wrap || el;
    var top = div("mtop");
    top.innerHTML = '<div class="mt">'+esc(card.title||{ru:"Цвета радуги",en:"Rainbow colors",de:"Regenbogenfarben",es:"Colores del arcoíris",pt:"Cores do arco-íris",fr:"Couleurs de l'arc-en-ciel",ar:"ألوان قوس قزح"})+'</div>';
    var cnt = div("ms"); top.appendChild(cnt);
    var grid = div("colgrid");
    var selected = [];
    var tiles = [];
    var checking = false;
    var miss = 0;

    function selN(){ return selected.length; }
    function setAsk(){
      var base = L(card.ask) || (L({ru:"Выбери",en:"Pick",de:"Wähle",es:"Elige",pt:"Escolhe",fr:"Choisis",ar:"اختر"})+" "+need+" "+L({ru:"цветов радуги",en:"rainbow colors",de:"Regenbogenfarben",es:"colores del arcoíris",pt:"cores do arco-íris",fr:"couleurs de l'arc-en-ciel",ar:"ألوان قوس قزح"}));
      cnt.textContent = base + " · " + T2("colorsCnt",{ru:"Выбрано",en:"Selected",de:"Gewählt",es:"Elegido",pt:"Escolhido",fr:"Choisi",ar:"تم الاختيار"}) + " " + selN() + "/" + need;
    }
    function resetPick(){
      checking = false;
      selected = [];
      tiles.forEach(function(t){
        t._sel = 0; t.classList.remove("on","ok","no","miss");
      });
      setAsk();
    }
    function finish(silent){
      el._answered = true;
      checking = true;
      tiles.forEach(function(t){
        t.style.pointerEvents = "none";
        if(t._item.ok) t.classList.add("ok");
        else if(t._sel) t.classList.add("no");
      });
      if(!silent){
        if(card.concept) mUpd(card.concept, miss ? "incorrect" : "correct");
        if(!miss) addStar();
      }
      var dn = div("mdone");
      dn.style.position = "static"; dn.style.margin = "14px auto 0"; dn.style.transform = "none";
      dn.textContent = doneTxt(card.done || {ru:"Семь цветов!",en:"Seven colors!",de:"Sieben Farben!",es:"¡Siete colores!",pt:"Sete cores!",fr:"Sept couleurs !",ar:"سبعة ألوان!"});
      host.appendChild(dn);
      if(silent) cardReady(0); else succeedReady(card);
    }
    function check(){
      if(el._answered || checking) return;
      checking = true;
      var allOk = selected.length === need && selected.every(function(it){ return it.ok; });
      selected.forEach(function(it){
        var t = null;
        for(var i=0;i<tiles.length;i++){ if(tiles[i]._item === it){ t = tiles[i]; break; } }
        if(t) t.classList.add(it.ok ? "ok" : "no");
      });
      if(allOk){
        finish(false);
        return;
      }
      miss++;
      tiles.forEach(function(t){
        if(t._item.ok && !t._sel) t.classList.add("miss");
      });
      cnt.textContent = T2("colorsRetry",{ru:"Попробуй ещё — только цвета радуги",en:"Try again — only rainbow colors",de:"Noch einmal — nur Regenbogenfarben",es:"Inténtalo de nuevo — solo colores del arcoíris",pt:"Tente de novo — só cores do arco-íris",fr:"Réessaie — seulement les couleurs de l'arc-en-ciel",ar:"حاول مرة أخرى — فقط ألوان قوس قزح"});
      setTimeout(function(){
        if(el._answered) return;
        resetPick();
      }, 1100);
    }

    items.forEach(function(it){
      var t = div("coltile");
      t.style.backgroundColor = it.c;
      if(it.name) t.setAttribute("aria-label", L(it.name));
      t.setAttribute("role", "button");
      t._item = it;
      if(colorsDone){
        t.style.pointerEvents = "none";
        if(it.ok){ t._sel = 1; t.classList.add("on","ok"); }
      } else {
      t.addEventListener("click", function(ev){
        ev.stopPropagation();
        if(el._answered || checking) return;
        if(t._sel){
          t._sel = 0; t.classList.remove("on");
          selected = selected.filter(function(x){ return x !== it; });
          setAsk();
          return;
        }
        if(selN() >= need) return;
        t._sel = 1; t.classList.add("on");
        selected.push(it);
        setAsk();
        if(selN() >= need) check();
      });
      }
      tiles.push(t);
      grid.appendChild(t);
    });

    if(colorsDone){
      cnt.textContent = (L(card.ask) || (L({ru:"Выбери",en:"Pick",de:"Wähle",es:"Elige",pt:"Escolhe",fr:"Choisis",ar:"اختر"})+" "+need+" "+L({ru:"цветов радуги",en:"rainbow colors",de:"Regenbogenfarben",es:"colores del arcoíris",pt:"cores do arco-íris",fr:"couleurs de l'arc-en-ciel",ar:"ألوان قوس قزح"}))) + " · " + T2("colorsCnt",{ru:"Выбрано",en:"Selected",de:"Gewählt",es:"Elegido",pt:"Escolhido",fr:"Choisi",ar:"تم الاختيار"}) + " " + need + "/" + need;
      if(wrap){ wrap.appendChild(top); wrap.appendChild(grid); el.appendChild(wrap); }
      else { el.appendChild(top); el.appendChild(grid); }
      finish(true);
      return;
    }

    setAsk();
    if(wrap){ wrap.appendChild(top); wrap.appendChild(grid); el.appendChild(wrap); }
    else { el.appendChild(top); el.appendChild(grid); }
  }

  /* ── §14 «правда или нет» (✓/✕) ── */
  function buildTF(el, card){
    waitingAnswer = true;
    el.classList.add("tfcard");
    var truth=(card.truth!==false), concept=card.concept;
    var tfDone = isCardDone(card.id);
    attachQuizBg(el, card);
    var wrap=div(card.img ? "qwrap tfwrap" : "tfwrap");
    var ttl=div("tft"); ttl.textContent=L(card.title||{ru:"Правда или нет?",en:"True or false?",de:"Wahr oder falsch?",es:"¿Verdadero o falso?",pt:"Verdadeiro ou falso?",fr:"Vrai ou faux ?",ar:"صحيح أم خطأ؟"});
    var q=div("tfq"); q.textContent=L(card.statement||"");
    var btns=div("tfbtns");
    var bY=document.createElement("button"); bY.className="tfb yes"; bY.textContent=L({ru:"✓ Правда",en:"✓ True",de:"✓ Wahr",es:"✓ Verdad",pt:"✓ Verdade",fr:"✓ Vrai",ar:"✓ صحيح"});
    var bN=document.createElement("button"); bN.className="tfb no"; bN.textContent=L({ru:"✕ Неправда",en:"✕ False",de:"✕ Falsch",es:"✕ Falso",pt:"✕ Falso",fr:"✕ Faux",ar:"✕ خطأ"});
    function answer(said){
      if(el._answered) return; el._answered=true;
      bY.disabled=bN.disabled=true;
      var correct=(said===truth);
      (said?bY:bN).classList.add(correct?"good":"bad");
      if(!correct)(truth?bY:bN).classList.add("good");
      if(concept) mUpd(concept, correct?"correct":"incorrect");
      if(correct) addStar();
      var ex=div("tfex"); ex.textContent=L(card.explain||(truth?{ru:"Это правда!",en:"That's true!",de:"Das stimmt!",es:"¡Es verdad!",pt:"É verdade!",fr:"C'est vrai !",ar:"هذا صحيح!"}:{ru:"На самом деле — нет.",en:"Actually, no.",de:"Eigentlich nicht.",es:"En realidad, no.",pt:"Na verdade, não.",fr:"En fait, non.",ar:"في الحقيقة لا."}));
      wrap.appendChild(ex);
      if(correct) succeedReady(card); else cardReady();
    }
    if(tfDone){
      el._answered=true;
      bY.disabled=bN.disabled=true;
      (truth?bY:bN).classList.add("good");
      var exD=div("tfex"); exD.textContent=L(card.explain||(truth?{ru:"Это правда!",en:"That's true!",de:"Das stimmt!",es:"¡Es verdad!",pt:"É verdade!",fr:"C'est vrai !",ar:"هذا صحيح!"}:{ru:"На самом деле — нет.",en:"Actually, no.",de:"Eigentlich nicht.",es:"En realidad, no.",pt:"Na verdade, não.",fr:"En fait, non.",ar:"في الحقيقة لا."}));
      btns.appendChild(bY); btns.appendChild(bN);
      wrap.appendChild(ttl); wrap.appendChild(q); wrap.appendChild(btns); wrap.appendChild(exD); el.appendChild(wrap);
      cardReady(0);
      return;
    }
    bY.onclick=function(e){ e.stopPropagation(); answer(true); };
    bN.onclick=function(e){ e.stopPropagation(); answer(false); };
    btns.appendChild(bY); btns.appendChild(bN);
    wrap.appendChild(ttl); wrap.appendChild(q); wrap.appendChild(btns); el.appendChild(wrap);
    // голосовой ответ (§11): можно сказать «правда» / «неправда» (да / нет)
    if(VOICE_ANSWER && SR){
      var mrow=div("microw");
      var mb=document.createElement("button"); mb.className="micbtn"; mb.id="micBtn";
      mb.innerHTML='<span class="micico">🎤</span><span class="mictx">'+esc({ru:"Нажми и скажи: правда или нет",en:"Tap and say: true or false",de:"Tippe und sag: wahr oder falsch",es:"Toca y di: verdad o falso",pt:"Toca e diz: verdadeiro ou falso",fr:"Appuie et dis : vrai ou faux",ar:"اضغط وقل: صحيح أو خطأ"})+'</span>';
      mrow.appendChild(mb); wrap.appendChild(mrow);
      armVoiceAnswer(mb, (function(){
          var lang=curAppLang();
          if(lang==="en") return [{t:"true",say:["yes","true","right","correct"]},{t:"false",say:["no","false","wrong","incorrect"]}];
          if(lang==="de") return [{t:"wahr",say:["ja","wahr","richtig","stimmt"]},{t:"falsch",say:["nein","falsch","nicht"]}];
          if(lang==="es") return [{t:"verdad",say:["si","sí","verdad","verdadero","correcto"]},{t:"falso",say:["no","falso","incorrecto"]}];
          if(lang==="pt") return [{t:"verdade",say:["sim","verdade","verdadeiro","certo"]},{t:"falso",say:["não","nao","falso","errado"]}];
          if(lang==="fr") return [{t:"vrai",say:["oui","vrai","exact","correct"]},{t:"faux",say:["non","faux","incorrect"]}];
          if(lang==="ar") return [{t:"صحيح",say:["نعم","صحيح","صح"]},{t:"خطأ",say:["لا","خطأ","غلط"]}];
          return [{t:"правда",say:["да","верно","правда","истина","так"]},{t:"неправда",say:["нет","неверно","ложь","неправда","не так"]}];
        })(), function(o){ var t=o.t; answer(t==="правда"||t==="true"||t==="wahr"||t==="verdad"||t==="verdade"||t==="vrai"||t==="صحيح"); });
    }
  }

  /* ── §14 «что пропало?» (память): запомни ряд → один исчез → выбери какой ── */
  function itName(it){ return typeof it==="string"?L(it):L(it.name||it.t||""); }
  function itFace(it){ if(typeof it!=="string" && it.icon) return em(it.icon,null,"goi");
    return '<span class="gem">'+esc(typeof it==="string"?it:(it.emoji||it.t||"❔"))+'</span>'; }
  function buildGone(el, card){
    waitingAnswer = true;
    el.classList.add("gonecard");
    var items=(card.items||[]).slice(), concept=card.concept;
    var goneDone = isCardDone(card.id);
    var top=div("mtop"); top.innerHTML='<div class="mt">'+esc(card.title||{ru:"Что пропало?",en:"What's missing?",de:"Was fehlt?",es:"¿Qué falta?",pt:"O que falta?",fr:"Qu'est-ce qui manque ?",ar:"ماذا اختفى؟"})+'</div>';
    var sub=div("ms"); sub.textContent=goneDone ? L({ru:"Что пропало? Нажми ответ!",en:"What's missing? Tap the answer!",de:"Was fehlt? Tippe die Antwort!",es:"¿Qué falta? ¡Toca la respuesta!",pt:"O que falta? Toca na resposta!",fr:"Qu'est-ce qui manque ? Appuie sur la réponse !",ar:"ماذا اختفى؟ اضغط على الجواب!"}) : L({ru:"Запомни, что здесь есть…",en:"Remember what's here…",de:"Merk dir, was hier ist…",es:"Recuerda lo que hay aquí…",pt:"Lembra o que há aqui…",fr:"Retiens ce qu'il y a ici…",ar:"تذكّر ما يوجد هنا…"}); top.appendChild(sub); el.appendChild(top);
    var grid=div("gogrid"); el.appendChild(grid);
    if(goneDone){
      /* restore: пропускаем фазу запоминания — сразу итог с верным ответом */
      var missing0 = items[0];
      items.forEach(function(it){ if(it===missing0) return;
        var t=div("gotile"); t.innerHTML=itFace(it); grid.appendChild(t); });
      var opts0=div("goopts");
      items.forEach(function(it){
        var b=document.createElement("button"); b.className="goopt"; b.textContent=itName(it);
        b.disabled=true; b.style.pointerEvents="none";
        if(it===missing0) b.classList.add("good");
        opts0.appendChild(b);
      });
      el.appendChild(opts0);
      el._answered=true;
      var dn0=div("mdone"); dn0.style.position="static"; dn0.style.margin="12px auto 0"; dn0.style.transform="none";
      dn0.textContent=L({ru:"Верно!",en:"Right!",de:"Richtig!",es:"¡Bien!",pt:"Certo!",fr:"Bravo !",ar:"صحيح!"})+" "+itName(missing0);
      el.appendChild(dn0); cardReady(0);
      return;
    }
    items.forEach(function(it){ var t=div("gotile"); t.innerHTML=itFace(it); grid.appendChild(t); });
    var missing=items[Math.floor(Math.random()*items.length)];
    setTimeout(function(){
      if(!el.parentNode && !el.isConnected) { /* карточку покинули */ }
      sub.textContent=L({ru:"Что пропало? Нажми ответ!",en:"What's missing? Tap the answer!",de:"Was fehlt? Tippe die Antwort!",es:"¿Qué falta? ¡Toca la respuesta!",pt:"O que falta? Toca na resposta!",fr:"Qu'est-ce qui manque ? Appuie sur la réponse !",ar:"ماذا اختفى؟ اضغط على الجواب!"});
      grid.innerHTML="";
      shuffle(items).forEach(function(it){ if(it===missing) return;
        var t=div("gotile"); t.innerHTML=itFace(it); grid.appendChild(t); });
      var opts=div("goopts");
      shuffle(items).forEach(function(it){
        var b=document.createElement("button"); b.className="goopt"; b.textContent=itName(it);
        b.onclick=function(e){ e.stopPropagation(); if(el._answered) return; el._answered=true;
          var correct=(it===missing); b.classList.add(correct?"good":"bad");
          if(concept) mUpd(concept, correct?"correct":"incorrect");
          if(correct) addStar();
          var dn=div("mdone"); dn.style.position="static"; dn.style.margin="12px auto 0"; dn.style.transform="none";
          dn.textContent=(correct?L({ru:"Верно!",en:"Right!",de:"Richtig!",es:"¡Bien!",pt:"Certo!",fr:"Bravo !",ar:"صحيح!"}):L({ru:"Пропал:",en:"Missing:",de:"Gefehlt:",es:"Faltaba:",pt:"Faltava:",fr:"Manquait :",ar:"اختفى:"}))+" "+itName(missing);
          el.appendChild(dn);
          if(correct) succeedReady(card); else cardReady();
        };
        opts.appendChild(b);
      });
      el.appendChild(opts);
    }, 2200);
  }

  /* ── §14 «лови только…»: верное → .ok (зелёное), чужое → .no (красное);
     failOnWrong (по умолч.): чужой тап → краткий .no, сброс попытки, повтор сразу;
     ⭐ / succeedReady только за чистую попытку. failOnWrong:false — только подсветка. ── */
  function catchItem(x){
    if(typeof x==="string") return {t:x, img:null};
    return {t:x.t||x.name||"", img:x.img||x.icon||null};
  }
  /* слоты без наложений: сетка + лёгкий jitter внутри ячейки (не Math.random по всему полю) */
  function catchSlots(n, withBg){
    var cols = n<=4 ? 2 : (n<=9 ? 3 : 4);
    var rows = Math.max(1, Math.ceil(n/cols));
    var left0=10, right0=90, top0=withBg?24:8, bot0=withBg?86:82;
    var slots=[], i=0, r, c, inRow, x, y, cellW, cellH, jx, jy;
    for(r=0;r<rows;r++){
      inRow=Math.min(cols, n-i);
      cellW=(right0-left0)/inRow; cellH=(bot0-top0)/rows;
      for(c=0;c<inRow;c++,i++){
        x=left0+(c+0.5)*cellW; y=top0+(r+0.5)*cellH;
        jx=(Math.random()-0.5)*cellW*0.28; jy=(Math.random()-0.5)*cellH*0.28;
        slots.push({x:x+jx, y:y+jy});
      }
    }
    return shuffle(slots);
  }
  function buildCatch(el, card){
    waitingAnswer = true;
    el.classList.add("catchcard");
    var good=(card.good||[]).map(catchItem), bad=(card.bad||[]).map(catchItem);
    /* need = все верные варианты (card.need не может «срезать» часть good) */
    var need=good.length||card.need||3, got=0, resetting=false;
    var strict = card.failOnWrong!==false && card.strict!==false;
    var catchDone = isCardDone(card.id);
    attachQuizBg(el, card);
    var top=div("mtop"); top.innerHTML='<div class="mt">'+esc(card.title||{ru:"Лови!",en:"Catch!",de:"Fang!",es:"¡Atrapa!",pt:"Apanha!",fr:"Attrape !",ar:"التقط!"})+'</div>';
    var sub=div("ms"); sub.textContent=catchDone ? (L({ru:"Поймано",en:"Caught",de:"Gefangen",es:"Atrapado",pt:"Apanhado",fr:"Attrapé",ar:"تم الالتقاط"})+": "+need+" / "+need) : L(card.ask||{ru:"Лови только нужное",en:"Catch only what you need",de:"Fang nur das Richtige",es:"Atrapa solo lo necesario",pt:"Apanha só o necessário",fr:"Attrape seulement le bon",ar:"التقط فقط ما يلزم"}); top.appendChild(sub);
    var field=div("cfield");
    if(card.img){ el.appendChild(field); el.appendChild(top); }
    else { el.appendChild(top); el.appendChild(field); }
    function finishCatch(silent){
      if(el._answered) return; el._answered=true;
      field.classList.add("ready"); /* как .mboard.ready — выйти из NOSWIPE, свайп/Далее */
      [].forEach.call(field.querySelectorAll(".cattile"), function(t){ t.style.pointerEvents="none"; });
      if(!silent){
        if(card.concept) mUpd(card.concept, "correct");
        addStar();
      }
      var dn=div("mdone");
      dn.textContent=doneTxt(card.done||{ru:"Молодец! Всё поймал!",en:"Well done! You caught them all!",de:"Super! Alles gefangen!",es:"¡Muy bien! Lo atrapaste todo!",pt:"Muito bem! Apanhaste tudo!",fr:"Bravo ! Tu as tout attrapé !",ar:"أحسنت! التقطت الكل!"});
      el.appendChild(dn);
      if(silent) cardReady(0);
      else succeedReady(card);
    }
    function startAttempt(){
      field.innerHTML=""; field.classList.remove("ready");
      got=0; resetting=false; el._answered=false;
      waitingAnswer=true; showGoHint(false);
      sub.textContent=L(card.ask||{ru:"Лови только нужное",en:"Catch only what you need",de:"Fang nur das Richtige",es:"Atrapa solo lo necesario",pt:"Apanha só o necessário",fr:"Attrape seulement le bon",ar:"التقط فقط ما يلزم"});
      var all=[]; good.forEach(function(g){ all.push({t:g.t, img:g.img, g:true}); });
      bad.forEach(function(bd){ all.push({t:bd.t, img:bd.img, g:false}); });
      var slots=catchSlots(all.length, !!card.img);
      shuffle(all).forEach(function(o, i){
        var tile=div("cattile"+(o.img?" hasimg":""));
        var slot=slots[i]||{x:50,y:50};
        tile.setAttribute("role","button");
        tile.setAttribute("aria-label", L(o.t));
        tile.title=o.t;
        if(o.img){
          tile.innerHTML='<img src="'+o.img+'" alt="">'+
            '<span class="clbl">'+esc(o.t)+'</span>';
        } else {
          tile.innerHTML='<span>'+esc(o.t)+'</span>';
        }
        tile.style.left=slot.x+"%";
        tile.style.top=slot.y+"%";
        tile.style.animationDelay=(-(Math.random()*5)).toFixed(2)+"s";
        tile.onclick=function(e){ e.stopPropagation();
          if(tile._done || el._answered || resetting) return;
          if(o.g){
            tile._done=1; tile.classList.add("ok","caught"); got++;
            sub.textContent=L({ru:"Поймано",en:"Caught",de:"Gefangen",es:"Atrapado",pt:"Apanhado",fr:"Attrapé",ar:"تم الالتقاط"})+": "+got+" / "+need;
            if(got>=need) finishCatch(false);
          } else {
            tile._done=1; tile.classList.add("no");
            tile.classList.remove("shk"); void tile.offsetWidth; tile.classList.add("shk");
            if(strict){
              unmarkCardDone(card.id);
              resetting=true;
              [].forEach.call(field.querySelectorAll(".cattile"), function(t){ t.style.pointerEvents="none"; });
              sub.textContent=L(card.askFail||{ru:"Ой! Это лишнее — попробуй ещё",en:"Oops! That's extra — try again",de:"Ups! Das gehört nicht dazu — nochmal",es:"¡Uy! Eso sobra — inténtalo de nuevo",pt:"Ups! Isso é a mais — tenta outra vez",fr:"Oups ! C'est en trop — réessaie",ar:"أوه! هذا زائد — حاول مرة أخرى"});
              if(card.concept) mUpd(card.concept, "incorrect");
              setTimeout(function(){ if(!el.isConnected) return; startAttempt(); }, 700);
            } else {
              sub.textContent=L(card.ask||{ru:"Лови только нужное",en:"Catch only what you need",de:"Fang nur das Richtige",es:"Atrapa solo lo necesario",pt:"Apanha só o necessário",fr:"Attrape seulement le bon",ar:"التقط فقط ما يلزم"});
            }
          }
        };
        field.appendChild(tile);
      });
    }
    if(catchDone){
      var doneSlots=catchSlots(good.length, !!card.img);
      good.forEach(function(o, i){
        var tile=div("cattile ok caught"+(o.img?" hasimg":""));
        var slot=doneSlots[i]||{x:50,y:50};
        tile.style.pointerEvents="none";
        tile.setAttribute("aria-label", L(o.t));
        if(o.img) tile.innerHTML='<img src="'+o.img+'" alt=""><span class="clbl">'+esc(o.t)+'</span>';
        else tile.innerHTML='<span>'+esc(o.t)+'</span>';
        tile.style.left=slot.x+"%";
        tile.style.top=slot.y+"%";
        field.appendChild(tile);
      });
      finishCatch(true);
      return;
    }
    startAttempt();
  }

  /* ── §14 «посвети фонариком»: тёмная картинка, круг света у пальца, найди цель ── */
  function buildLant(el, card){
    waitingAnswer = true;
    el.classList.add("lantcard");
    var lantDone = isCardDone(card.id);
    var wrap=div("lantwrap");
    var img=div("lantimg"); if(card.img) img.style.backgroundImage="url('"+card.img+"')";
    var dark=div("lantdark");
    var top=div("lanttop");
    top.innerHTML='<div class="lt1">'+esc(card.title||{ru:"Посвети фонариком",en:"Shine the flashlight",de:"Leuchte mit der Taschenlampe",es:"Ilumina con la linterna",pt:"Ilumina com a lanterna",fr:"Éclaire avec la lampe",ar:"أضئ بالفانوس"})+'</div>'+
      '<div class="lt2">'+esc(lantDone ? (card.done||{ru:"Нашёл! Молодец!",en:"Found it! Well done!",de:"Gefunden! Super!",es:"¡Lo encontraste! ¡Muy bien!",pt:"Achaste! Muito bem!",fr:"Trouvé ! Bravo !",ar:"وجدته! أحسنت!"}) : (card.ask||{ru:"Веди пальцем — найди спрятанное и нажми",en:"Move your finger — find the hidden thing and tap",de:"Fahr mit dem Finger — finde das Versteckte und tippe",es:"Mueve el dedo — halla lo escondido y toca",pt:"Mexa o dedo — acha o escondido e toca",fr:"Glisse le doigt — trouve le caché et appuie",ar:"حرّك إصبعك — جد المخفي واضغط"}))+'</div>';
    wrap.appendChild(img); wrap.appendChild(dark); wrap.appendChild(top); el.appendChild(wrap);
    var tx=(card.target&&card.target.x)||50, ty=(card.target&&card.target.y)||50, tr=(card.target&&card.target.r)||13;
    function light(px,py){ dark.style.setProperty("--lx",px+"%"); dark.style.setProperty("--ly",py+"%"); }
    function pt(e){ var r=wrap.getBoundingClientRect();
      var cx=e.clientX, cy=e.clientY;
      return { x:(cx-r.left)/r.width*100, y:(cy-r.top)/r.height*100 }; }
    if(lantDone){
      el._done=1;
      light(tx, ty);
      var mk0=div("lantfound"); mk0.style.left=tx+"%"; mk0.style.top=ty+"%"; mk0.textContent="✓"; wrap.appendChild(mk0);
      var dn0=div("mdone"); dn0.textContent=doneTxt(card.done||{ru:"Нашёл! Молодец!",en:"Found it! Well done!",de:"Gefunden! Super!",es:"¡Lo encontraste! ¡Muy bien!",pt:"Achaste! Muito bem!",fr:"Trouvé ! Bravo !",ar:"وجدته! أحسنت!"}); el.appendChild(dn0);
      cardReady(0);
      return;
    }
    wrap.addEventListener("pointermove", function(e){ var p=pt(e); light(p.x,p.y); });
    wrap.addEventListener("pointerdown", function(e){ e.stopPropagation(); var p=pt(e); light(p.x,p.y);
      if(el._done) return;
      if(Math.hypot(p.x-tx,p.y-ty)<=tr){ el._done=1;
        var mk=div("lantfound"); mk.style.left=tx+"%"; mk.style.top=ty+"%"; mk.textContent="✓"; wrap.appendChild(mk);
        if(card.concept) mUpd(card.concept,"correct"); addStar();
        var dn=div("mdone"); dn.textContent=doneTxt(card.done||{ru:"Нашёл! Молодец!",en:"Found it! Well done!",de:"Gefunden! Super!",es:"¡Lo encontraste! ¡Muy bien!",pt:"Achaste! Muito bem!",fr:"Trouvé ! Bravo !",ar:"وجدته! أحسنت!"}); el.appendChild(dn);
        succeedReady(card);
      }
    });
    light(50,42);
  }

  /* ── интерактив «разложи по порядку» (§14 Кругосветки, тап-версия без drag):
     нажимай события в верном порядке; верное — получает номер и «замирает»,
     неверное — трясётся. concept → BKT (без промахов = correct), ⭐ за чистоту ── */
  function buildOrder(el, card){
    waitingAnswer = true;
    var items=(card.items||[]).map(function(it,i){ return {t:it.t, n:i}; });
    var next=0, miss=0;
    var orderDone = isCardDone(card.id);
    attachQuizBg(el, card);
    var wrap=card.img ? div("qwrap") : null;
    var top=div("mtop");
    top.innerHTML='<div class="mt">'+esc(card.title||{ru:"По порядку",en:"In order",de:"Der Reihe nach",es:"En orden",pt:"Em ordem",fr:"Dans l'ordre",ar:"بالترتيب"})+'</div>'+
      '<div class="ms">'+esc(card.text||{ru:"Нажимай по порядку: что было сначала, что потом",en:"Tap in order: what came first, what came next",de:"Tippe der Reihe nach: was war zuerst, was danach",es:"Toca en orden: qué fue primero, qué después",pt:"Toca em ordem: o que veio primeiro, o que depois",fr:"Appuie dans l'ordre : d'abord, ensuite",ar:"اضغط بالترتيب: ماذا جاء أولاً، ثم ماذا"})+'</div>';
    var listEl=div("olist");
    var host=wrap||el;
    host.appendChild(top); host.appendChild(listEl);
    if(wrap) el.appendChild(wrap);
    if(orderDone){
      items.forEach(function(it){
        var b=document.createElement("button"); b.className="otile odone"; b._done=1;
        b.style.pointerEvents="none";
        b.innerHTML='<span class="onum">'+String(it.n+1)+'</span><span class="otxt">'+esc(it.t)+'</span>';
        listEl.appendChild(b);
      });
      var dn0=div("mdone"); dn0.textContent=doneTxt(card.done||{ru:"Всё по порядку!",en:"All in order!",de:"Alles der Reihe nach!",es:"¡Todo en orden!",pt:"Tudo em ordem!",fr:"Tout dans l'ordre !",ar:"كل شيء بالترتيب!"});
      dn0.style.position="static"; dn0.style.margin="14px auto 0"; dn0.style.transform="none";
      host.appendChild(dn0); cardReady(0);
      return;
    }
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
            var dn=div("mdone"); dn.textContent=doneTxt(card.done||{ru:"Всё по порядку!",en:"All in order!",de:"Alles der Reihe nach!",es:"¡Todo en orden!",pt:"Tudo em ordem!",fr:"Tout dans l'ordre !",ar:"كل شيء بالترتيب!"});
            dn.style.position="static"; dn.style.margin="14px auto 0"; dn.style.transform="none";
            host.appendChild(dn); succeedReady(card);
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
    var la=div("balab bal-a"); la.textContent=L(card.labA||{ru:"До",en:"Before",de:"Vorher",es:"Antes",pt:"Antes",fr:"Avant",ar:"قبل"});
    var lb=div("balab bal-b"); lb.textContent=L(card.labB||{ru:"После",en:"After",de:"Nachher",es:"Después",pt:"Depois",fr:"Après",ar:"بعد"});
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
    waitingAnswer = false;
    answerRevealUntil = 0;
    showGoHint(false);
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
    syncGoHintLabel();
    showGoHint(!waitingAnswer);
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
    if(dir>0 && waitingAnswer){
      /* блок вперёд, пока нет ответа — лёгкая тряска как feedback (как у птиц: не листаем) */
      var blocked = feed.firstChild;
      if(blocked){
        blocked.classList.remove("wiggle"); void blocked.offsetWidth; blocked.classList.add("wiggle");
        setTimeout(function(){ if(blocked.parentNode) blocked.classList.remove("wiggle"); }, 480);
      }
      return;
    }
    if(dir>0 && Date.now() < answerRevealUntil) return;
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
  var NOSWIPE = ".mbank,.mchip,.mfloat,.mboard:not(.ready),.mtarget,.bawrap,.bahandle,.lantwrap,"+
    ".opts,.opt,.tfbtns,.tfb,.goopts,.goopt,.gogrid,.gotile,.cfield:not(.ready),.cfield:not(.ready) .cattile,.cgrid,.ctile,"+
    ".colgrid,.coltile,"+
    ".otiles,.otile,.shot,.sinfo,.stop,.spot,.spotpop,.reveal-btn,.nextfab,#fGoHint,.spcl,.sx,button"
    + (KIND_NOSWIPE.length ? ","+KIND_NOSWIPE.join(",") : "");
  var y0=null, x0=null, t0=0, tracking=false;
  var swipeGuard={armed:false}; /* гасим ghost-click после свайпа (иначе art-карта лишний go(1)) */
  function swipeStart(x, y, el){
    if(el && el.closest && el.closest(NOSWIPE)){ tracking=false; y0=null; return false; }
    tracking=true; x0=x; y0=y; t0=Date.now(); return true;
  }
  function swipeEnd(x, y){
    if(!tracking || y0==null){ tracking=false; y0=null; return; }
    tracking=false;
    var dy=y-y0, dx=x-x0, dt=Date.now()-t0; y0=null;
    if(dt>700) return;
    if(Math.abs(dy)<50 || Math.abs(dy)<Math.abs(dx)*1.15) return;
    swipeGuard.armed=true;
    if(dy < 0) go(1); else go(-1);
    setTimeout(function(){ swipeGuard.armed=false; }, 320);
  }
  feed.addEventListener("touchstart", function(e){
    if(!e.touches || !e.touches[0]) return;
    swipeStart(e.touches[0].clientX, e.touches[0].clientY, e.target);
  }, {passive:true});
  feed.addEventListener("touchmove", function(e){
    if(!tracking || !e.touches || !e.touches[0]) return;
  }, {passive:true});
  feed.addEventListener("touchend", function(e){
    if(!e.changedTouches || !e.changedTouches[0]) return;
    swipeEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
  }, {passive:true});
  /* мышь/тачпад — как у птиц (pointer), иначе на десктопе «свайп» не работал */
  feed.addEventListener("pointerdown", function(e){
    if(e.pointerType==="touch") return;
    if(e.button!==0) return;
    if(!swipeStart(e.clientX, e.clientY, e.target)) return;
    try{ feed.setPointerCapture(e.pointerId); }catch(err){}
  });
  feed.addEventListener("pointerup", function(e){
    if(e.pointerType==="touch") return;
    swipeEnd(e.clientX, e.clientY);
  });
  feed.addEventListener("pointercancel", function(){ tracking=false; y0=null; });
  feed.addEventListener("click", function(e){
    if(!swipeGuard.armed) return;
    if(e.target && e.target.closest && e.target.closest(NOSWIPE)){ swipeGuard.armed=false; return; }
    e.stopPropagation(); e.preventDefault();
    swipeGuard.armed=false;
  }, true);
  var wlock=false;
  feed.addEventListener("wheel", function(e){
    if(wlock) return; if(Math.abs(e.deltaY)<20) return;
    if(e.target && e.target.closest && e.target.closest(NOSWIPE)) return;
    wlock=true; setTimeout(function(){wlock=false;},420);
    go(e.deltaY>0?1:-1);
  }, {passive:true});
  /* ←/→ как у птиц: вправо = далее (свайп ↑), влево = назад (свайп ↓) */
  document.addEventListener("keydown", function(e){
    if(e.key==="Escape"){ closeParent(); closeMap(); closePassport(); return; }
    if(e.key!=="ArrowRight" && e.key!=="ArrowLeft") return;
    if($("map") && $("map").classList.contains("on")) return;
    if($("parent") && $("parent").classList.contains("on")) return;
    if($("passport") && $("passport").classList.contains("on")) return;
    var tag=(e.target && e.target.tagName)||"";
    if(tag==="INPUT"||tag==="TEXTAREA"||tag==="SELECT"||(e.target&&e.target.isContentEditable)) return;
    e.preventDefault();
    go(e.key==="ArrowRight"?1:-1);
  });
  /* iframe в оболочке: без фокуса стрелки не доходят — #feed фокусируем на старте */
  try{
    if(feed && !feed.hasAttribute("tabindex")) feed.setAttribute("tabindex","-1");
    try{ feed.focus({preventScroll:true}); }catch(err){ try{ feed.focus(); }catch(e2){} }
  }catch(err){}

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
                  '<span class="ssub">'+done+' / '+total+' '+esc({ru:"карточек",en:"cards",de:"Karten",es:"cartas",pt:"cartas",fr:"cartes",ar:"بطاقات"})+'</span>'
                 :'<span class="ssub soon">'+esc({ru:"скоро",en:"soon",de:"bald",es:"pronto",pt:"em breve",fr:"bientôt",ar:"قريباً"})+' · '+total+' '+esc({ru:"карточек",en:"cards",de:"Karten",es:"cartas",pt:"cartas",fr:"cartes",ar:"بطاقات"})+'</span>')+
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
                  '<span class="ssub">'+done+' / '+total+' '+esc({ru:"карточек",en:"cards",de:"Karten",es:"cartas",pt:"cartas",fr:"cartes",ar:"بطاقات"})+'</span>'
                 :'<span class="ssub soon">'+esc({ru:"скоро",en:"soon",de:"bald",es:"pronto",pt:"em breve",fr:"bientôt",ar:"قريباً"})+' · '+total+' '+esc({ru:"карточек",en:"cards",de:"Karten",es:"cartas",pt:"cartas",fr:"cartes",ar:"بطاقات"})+'</span>')+
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

  /* ---------- родительский граф знаний ---------- */
  function openParent(){
    $("pbign").textContent = knownOrgans();
    $("pbigu").textContent = L({ru:"из",en:"of",de:"von",es:"de",pt:"de",fr:"sur",ar:"من"}) + " " + totalOrgans() + " " + L(NODE_GEN) + " " + L({ru:"в",en:"in the",de:"im",es:"en el",pt:"no",fr:"dans le",ar:"في"}) + " " + L(GRAPH.mapNoun || {ru:"графе",en:"map",de:"Netz",es:"mapa",pt:"mapa",fr:"graphe",ar:"المخطط"}) + " " + L({ru:"знаний",en:"of knowledge",de:"des Wissens",es:"de saberes",pt:"do saber",fr:"des savoirs",ar:"المعرفة"});
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
      '<circle cx="'+cx+'" cy="'+cy+'" r="26" fill="#b85a3a" stroke="#fff" stroke-width="3"/>'+
      (CTR_ICON ? svgIco(CTR_ICON, cx, cy-6, 15)+'<text x="'+cx+'" y="'+(cy+19)+'" text-anchor="middle" font-size="9" fill="#fff" font-weight="800">'+esc(CTR_LABEL)+'</text>' : '<text x="'+cx+'" y="'+(cy-2)+'" text-anchor="middle" font-size="20">'+CTR_EMOJI+'</text>'+
      '<text x="'+cx+'" y="'+(cy+14)+'" text-anchor="middle" font-size="9" fill="#fff" font-weight="800">'+esc(CTR_LABEL)+'</text>')+'</svg>';
    // ── ранг (титул растёт по ширине) ──
    var r=rankNow(), ko=knownOrgans(), nxt=RANKS[rankIdx()+1];
    var rankHtml='<div class="rankbar"><span class="rke">'+em(r.icon, r.emoji)+'</span>'+
      '<span class="rkt"><b>'+esc(r.name)+'</b>'+
      (nxt?'<i>'+L({ru:"ещё",en:"still",de:"noch",es:"aún",pt:"ainda",fr:"encore",ar:"بعد"})+' '+(nxt.min-ko)+' '+L({ru:"до",en:"to",de:"bis",es:"hasta",pt:"até",fr:"jusqu'à",ar:"حتى"})+' «'+esc(nxt.name)+'»</i>':'<i>'+doneTxt({ru:"высший ранг!",en:"top rank!",de:"höchster Rang!",es:"¡rango máximo!",pt:"nível máximo!",fr:"rang le plus haut !",ar:"أعلى رتبة!"})+'</i>')+'</span>'+
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
    var pathHtml = SINGLE_MENU ? '<div class="pathsec"><div class="pathh">🗺 '+L({ru:"Путь по главам",en:"Path by chapters",de:"Weg durch die Kapitel",es:"Camino por capítulos",pt:"Caminho por capítulos",fr:"Chemin par chapitres",ar:"المسار حسب الفصول"})+'</div>'+mapRowsHtml()+'</div>' : "";
    $("pgraph").innerHTML = pathHtml + rankHtml + svg + rows + langSettingsHtml();
    if(SINGLE_MENU) bindMapRows($("pgraph"));
    bindLangSettings();
    $("parent").classList.add("on");
  }
  /* ---------- паспорт исследователя (штампы по системам) ---------- */
  function openPassport(){
    var sys=GRAPH.systems, earned=0, cells="";
    sys.forEach(function(sy){
      var got=!!stamps[sy.id], st=sysStat(sy); if(got) earned++;
      cells += '<div class="stamp'+(got?" got":"")+'" style="'+(got?"--sc:"+sy.color:"")+'">'+
        '<span class="se">'+(sy.icon?em(sy.icon,null):sy.emoji)+'</span><span class="snm">'+esc(sy.name)+'</span>'+
        '<span class="ss">'+(got?"✓ "+L({ru:"собрано",en:"done",de:"fertig",es:"listo",pt:"pronto",fr:"fait",ar:"مكتمل"}):st.kn+"/"+st.tot)+'</span></div>';
    });
    if($("ppn")) $("ppn").textContent=earned;
    if($("ppu")) $("ppu").textContent=L({ru:"из",en:"of",de:"von",es:"de",pt:"de",fr:"sur",ar:"من"})+" "+sys.length+" "+L({ru:"штампов",en:"stamps",de:"Stempeln",es:"sellos",pt:"carimbos",fr:"tampons",ar:"أختام"});
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
    navFrame=document.createElement("iframe"); navFrame.setAttribute("title",L({ru:"Энциклопедия",en:"Encyclopedia",de:"Enzyklopädie",es:"Enciclopedia",pt:"Enciclopédia",fr:"Encyclopédie",ar:"الموسوعة"}));
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
  }
  function langSettingsHtml(){
    var hasLang = LANGKEY && LANGLIST, credits = FP.creditsUrl;
    var inner = "";
    if(hasLang){
      var cur=curLang(), opts=LANGLIST.map(function(l){
        return '<option value="'+esc(l[0])+'"'+(l[0]===cur?' selected':'')+'>'+esc(l[1]||l[0])+'</option>'; }).join("");
      inner += '<div class="psrow"><span class="pslab">🌍 '+L({ru:"Язык энциклопедии",en:"Encyclopedia language",de:"Sprache der Enzyklopädie",es:"Idioma de la enciclopedia",pt:"Idioma da enciclopédia",fr:"Langue de l'encyclopédie",ar:"لغة الموسوعة"})+'</span>'+
        '<select id="feedLangSel">'+opts+'</select></div>';
    }
    if(credits){
      inner += '<div class="psrow"><span class="pslab">📷 '+L({ru:"Источники изображений",en:"Image sources",de:"Bildquellen",es:"Fuentes de imágenes",pt:"Fontes das imagens",fr:"Sources des images",ar:"مصادر الصور"})+'</span>'+
        '<a class="pslink" href="'+esc(credits)+'" target="_blank" rel="noopener">'+L({ru:"Титры ↗",en:"Credits ↗",de:"Bildnachweis ↗",es:"Créditos ↗",pt:"Créditos ↗",fr:"Générique ↗",ar:"المصادر ↗"})+'</a></div>';
    }
    inner += '<div class="psrow"><span class="pslab">'+L({ru:"Интерактивные карточки",en:"Interactive cards",de:"Interaktive Karten",es:"Cartas interactivas",pt:"Cartas interativas",fr:"Cartes interactives",ar:"بطاقات تفاعلية"})+'</span>'+
      '<button type="button" class="pslink" id="feedResetDone">'+L({ru:"Сбросить прохождение",en:"Reset progress",de:"Fortschritt zurücksetzen",es:"Reiniciar progreso",pt:"Reiniciar progresso",fr:"Réinitialiser la progression",ar:"إعادة التقدم"})+'</button></div>';
    return '<div class="parentset"><div class="psh">⚙️ '+L({ru:"Настройки",en:"Settings",de:"Einstellungen",es:"Ajustes",pt:"Definições",fr:"Réglages",ar:"الإعدادات"})+'</div>'+inner+'</div>';
  }
  function bindLangSettings(){
    var s=$("feedLangSel"); if(s) s.onchange=function(){ setCompanionLang(s.value); };
    var r=$("feedResetDone"); if(!r) return;
    r.onclick=function(){
      if(!confirm(L({ru:"Сбросить прохождение интерактивных карточек?\nРебёнку снова нужно будет пройти задания. Звёзды и карта знаний не меняются.",en:"Reset interactive card progress?\nThe child will need to redo the tasks. Stars and the knowledge map stay the same.",de:"Interaktiven Kartenfortschritt zurücksetzen?\nDas Kind muss die Aufgaben erneut machen. Sterne und Wissensnetz bleiben.",es:"¿Reiniciar el progreso de las cartas interactivas?\nEl niño tendrá que repetir las tareas. Las estrellas y el mapa de saberes no cambian.",pt:"Reiniciar o progresso das cartas interativas?\nA criança terá de refazer as tarefas. Estrelas e mapa do saber ficam iguais.",fr:"Réinitialiser la progression des cartes interactives ?\nL'enfant devra refaire les exercices. Les étoiles et la carte des savoirs ne changent pas.",ar:"إعادة تقدم البطاقات التفاعلية؟\nسيحتاج الطفل لإعادة المهام. النجوم وخريطة المعرفة لا تتغير."}))) return;
      clearCardDone();
      closeParent();
      render();
    };
  }

  /* ---------- озвучка: кнопка «звук» ---------- */
  function setMuteIcon(){ var b=$("muteBtn"); if(b) b.textContent = muted ? "🔇" : "🔊"; }
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

  /* ---------- чип звёзд и кольцо уровня в шапке (создаёт движок, если нет в HTML) ---------- */
  (function initStars(){
    var hud=$("hud"); if(!hud) return;
    var row=hud.querySelector(".fhrow")||hud;
    if(!$("lvlRing")){
      var ring=document.createElement("div"); ring.id="lvlRing";
      var host=$("chapLab")||row;
      host.insertBefore(ring, host.firstChild);
    }
    if(!$("starChip")){
      var chip=document.createElement("div"); chip.id="starChip";
      var mute=$("muteBtn");
      if(mute && mute.parentNode) mute.parentNode.insertBefore(chip, mute);
      else row.appendChild(chip);
    }
    renderStars();
  })();

  /* ---------- тестируемость (§18): хуки только под ?test=1 ---------- */
  if(/[?&]test=1/.test(location.search)){
    window.__feed = { get pos(){ return idx; }, get n(){ return CARDS.length; },
      get stars(){ return stars; }, get mastery(){ return known; }, get bkt(){ return !!BKT; },
      get rank(){ return rankNow().name; }, get known(){ return knownOrgans(); },
      get reviewing(){ return !!reviewCard; }, get pool(){ return reviewPool.length; },
      get done(){ return doneCards; },
      m:function(id){ return mVal(id); }, expose:function(id,ev){ mUpd(id, ev||"expose"); },
      clearDone:function(){ clearCardDone(); } };
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
  var goHint = $("fGoHint");
  if(goHint) goHint.onclick = function(ev){ ev.stopPropagation(); go(1); };
  syncGoHintLabel();

  /* «← Меню» — как feedBack у птиц: выход на заставку оболочки */
  (function wireFeedMenu(){
    var btn = $("feedBack"); if(!btn) return;
    function paintMenuLab(){
      if(window.BibleI18n && BibleI18n.paintShell){ BibleI18n.paintShell(); return; }
      btn.textContent = L({ru:"← Меню",en:"← Menu",de:"← Menü",es:"← Menú",pt:"← Menu",fr:"← Menu",ar:"← القائمة"});
    }
    paintMenuLab();
    btn.onclick = function(ev){
      if(ev){ ev.preventDefault(); ev.stopPropagation(); }
      var embed = /[?&]embed=1/.test(location.search) || document.documentElement.classList.contains("embed");
      if(embed && window.parent && window.parent !== window){
        try{ window.parent.postMessage({ type:"bibleShell", action:"nav", to:"menu" }, "*"); return; }
        catch(e){}
      }
      location.href = "../index.html#/";
    };
    window.__feedPaintMenu = paintMenuLab;
  })();

  /* ---------- единое нижнее меню тома (Лента = базовая оболочка) ----------
     При ?embed=1 лента внутри корневой оболочки — без своего #botmenu. */
  (function bottomMenu(){
    if(/[?&]embed=1/.test(location.search)){
      try{ document.documentElement.classList.add("embed"); document.body.classList.add("embed"); }catch(e){}
      return;
    }
    var items = window.FEED_MENU; if(!items || !items.length) return;
    var nav = document.createElement("nav"); nav.id="botmenu";
    items.forEach(function(m){
      var active = m.to==="lenta";
      var a = document.createElement(active?"span":"a");
      a.className = "bm"+(active?" on":"");
      if(!active) a.href = "../index.html?go="+m.to;
      var lab = (m.label && typeof m.label==="object") ? m.label
        : (m.labelEn ? {ru:m.label, en:m.labelEn} : m.label);
      a.innerHTML = '<img src="../img/icons/'+m.icon+'.webp" alt="">'+
        '<span>'+esc(lab)+'</span>';
      nav.appendChild(a);
    });
    document.body.appendChild(nav);
    document.body.classList.add("hasmenu");
  })();

  /* ?ch=N — открыть ленту сразу с нужной главы (обзор/диплинк), поверх резюма */
  (function(){ var m=/[?&]ch=(\d+)/.exec(location.search); if(!m) return;
    var meta=chLoaded(parseInt(m[1],10)); if(meta){ idx=meta.start; lastCh=-1; } })();

  refreshHud();
  applyDocLang();
  render();

  /* оболочка тома: язык / тема */
  window.addEventListener("message", function(e){
    var d=e.data; if(!d||d.type!=="bibleShell") return;
    if(d.action==="lang"&&d.lang){
      var key=LANGKEY||window.FEED_LANG_KEY||"bibi_lang";
      try{ localStorage.setItem(key, d.lang); }catch(err){}
      if(typeof setCompanionLang==="function"&&LANGKEY) try{ setCompanionLang(d.lang); }catch(err){}
      if(typeof window.__feedPaintMenu==="function") try{ window.__feedPaintMenu(); }catch(err){}
      try{ applyDocLang(); }catch(err){}
      try{ render(); refreshHud(); syncGoHintLabel(); }catch(err){}
      try{ if($("map")&&$("map").classList.contains("on")) openMap(); }catch(err){}
      try{ if($("parent")&&$("parent").classList.contains("on")) openParent(); }catch(err){}
    }
    if(d.action==="theme"){
      var th=d.theme==="dark"?"dark":"light";
      document.documentElement.setAttribute("data-theme", th);
    }
  });
  try{
    if(localStorage.getItem("bible_theme")==="dark")
      document.documentElement.setAttribute("data-theme","dark");
  }catch(e){}
})();
