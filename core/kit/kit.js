/* ============================================================================
 * KIT — переиспользуемый движок детской энциклопедии-игры (Образовариум).
 *
 * Один и тот же движок оживляет любой предметный набор: страны, тело человека,
 * космос, динозавры… Колода-инстанс приносит ТОЛЬКО данные:
 *   window.KIT_CONFIG  — «паспорт» продукта (id, заголовок, группы, уровни…)
 *   window.KIT_CONTENT — { items:[ {id,name,emoji,group,fact,kidfacts} ] }
 * Движок сам строит весь DOM, экраны и localStorage (с неймспейсом = config.id).
 *
 * Инварианты платформы (см. CLAUDE.md): ES5, vanilla, офлайн, iOS WebKit,
 * высокий контраст, только «нажми». Дизайн-система — core/kit/kit.css.
 * Контракт данных — docs/product-kit.md.
 * ========================================================================== */
(function(){
"use strict";

var C = window.KIT_CONFIG || {};
var CONTENT = window.KIT_CONTENT || {items:[]};
var ITEMS = CONTENT.items || [];
var GROUPS = C.groups || [];
var NS = C.id || "kit";                 // неймспейс localStorage
var ROUND = C.round || ["name","group"];// какие навыки спрашиваем в уроке
var QUIZ = C.quiz || ["name","group","which"]; // режимы игры «Что это?»
var RANKS = C.ranks || [[0,"Новичок","🐣"],[50,"Знаток","🎓"],[100,"Мастер","🏆"]];

// ---- ключи localStorage (у каждой колоды свои, не пересекаются) ------------
var K_PROG="_prog_v1", K_EARN="_earned", K_LOG="_log_v1", K_OPTN="_optn", K_VOICE="_voice";
function lk(s){return NS+s;}
function lget(k,d){try{var v=localStorage.getItem(lk(k));return v===null?d:v;}catch(e){return d;}}
function lset(k,v){try{localStorage.setItem(lk(k),v);}catch(e){}}
function jget(k,d){try{var v=localStorage.getItem(lk(k));return v?JSON.parse(v):d;}catch(e){return d;}}
function jset(k,v){try{localStorage.setItem(lk(k),JSON.stringify(v));}catch(e){}}

// ---- индексы ---------------------------------------------------------------
var BY={}, INGROUP={};
ITEMS.forEach(function(it){ BY[it.id]=it; (INGROUP[it.group]=INGROUP[it.group]||[]).push(it); });
var GROUP={}; GROUPS.forEach(function(g){GROUP[g.id]=g;});
var POOLN = ITEMS.length * ROUND.length;     // сколько всего уникальных заданий-звёзд
lset("_pooln", POOLN);

// ---- прогресс: prog[itemId] = {name:1, group:1,...} (освоенные навыки) ------
function prog(){return jget(K_PROG,{});}
function itemDone(id){var p=prog()[id]||{};return ROUND.every(function(s){return p[s];});}
function skillDone(id,s){var p=prog()[id]||{};return !!p[s];}
function markSkill(id,s){var p=prog();p[id]=p[id]||{};if(!p[id][s]){p[id][s]=1;jset(K_PROG,p);return true;}return false;}
function masteredCount(){var p=prog(),n=0;ITEMS.forEach(function(it){if(itemDone(it.id))n++;});return n;}
function groupMastered(gid){var arr=INGROUP[gid]||[],n=0;arr.forEach(function(it){if(itemDone(it.id))n++;});return n;}

// ---- звёзды (пожизненный счётчик + журнал ответов) -------------------------
function earned(){return parseInt(lget(K_EARN,"0"),10)||0;}
function logAdd(mode,skill,id,r){var L=jget(K_LOG,[]);L.push({t:Date.now(),m:mode,s:skill,id:id,r:r});if(L.length>4000)L=L.slice(-4000);jset(K_LOG,L);}
function addStar(){lset(K_EARN,String(earned()+1));}

// ---- ранги -----------------------------------------------------------------
function rankIdx(){var m=masteredCount(),pct=ITEMS.length?m/ITEMS.length*100:0,idx=0;
  for(var i=0;i<RANKS.length;i++){if(pct>=RANKS[i][0])idx=i;}return idx;}
function rankThrCount(pct){return Math.round(pct/100*ITEMS.length);}

// ---- утилиты ---------------------------------------------------------------
function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(pseudo()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
var _seed=(Date.now?Date.now():1)%2147483647;function pseudo(){_seed=(_seed*48271)%2147483647;return _seed/2147483647;}
function sample(arr,n,exclude){var pool=arr.filter(function(x){return x!==exclude;});return shuffle(pool).slice(0,n);}
var STAR='<svg viewBox="0 0 24 24" fill="#FFC24B" stroke="#E8A02E" stroke-width="1"><path d="M12 2l3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1z"/></svg>';
function stars(n){var s="";for(var i=0;i<n;i++)s+=STAR;return '<span class="stars">'+s+'</span>';}
// картинка предмета: img (WebP 2:3) если есть, иначе эмодзи-заглушка. px — высота.
function vis(it,px){if(it&&it.img)return '<img class="kvis" src="'+esc(it.img)+'" alt="" style="height:'+px+'px;width:auto">';
  return '<span class="kvis-emoji" style="font-size:'+px+'px;line-height:1.1">'+esc((it&&it.emoji)||"❓")+'</span>';}

// ---- озвучка вопросов (SpeechSynthesis; на iOS без mp3 — норм) --------------
function voiceOn(){return lget(K_VOICE,"1")==="1";}
function speak(text){if(!voiceOn()||!window.speechSynthesis||!text)return;try{window.speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance(text);u.lang="ru-RU";u.rate=.98;u.pitch=1.05;window.speechSynthesis.speak(u);}catch(e){}}
// банк озвучки ведущего: клипы voice/<key>.mp3 (window.KIT_VOICE, генерит
// core/kit/gen_voice.py). Ключей нет → фолбэк на синтез. Колода без банка
// работает как раньше — обратная совместимость.
var VBANK={};(window.KIT_VOICE||[]).forEach(function(k){VBANK[k]=1;});
var _va=null;
function playKeys(keys,fallback){
  if(!voiceOn())return;
  var seq=keys.filter(function(k){return VBANK[k];});
  if(!seq.length){speak(fallback);return;}
  try{window.speechSynthesis&&window.speechSynthesis.cancel();if(_va){_va.pause();}}catch(e){}
  var j=0;(function nxt(){if(j>=seq.length){_va=null;return;}
    var a=new Audio("voice/"+seq[j]+".mp3");_va=a;j++;
    a.onended=nxt;a.onerror=nxt;var p=a.play();if(p&&p.catch)p.catch(function(){});})();
}
function okKey(){return ["ok_1","ok_2","ok_3","ok_4"][Math.floor(pseudo()*4)];}
function optCount(){var n=parseInt(lget(K_OPTN,"3"),10);return(n===2||n===4)?n:3;}

/* ========================== HUD: звезда прилетает ========================= */
function starHudEl(){var h=document.getElementById("starHud");if(!h){h=el("div");h.id="starHud";
  h.innerHTML='<span class="sh-star">⭐</span><b id="starHudN">0</b>';document.body.appendChild(h);}return h;}
function refreshStar(){var h=starHudEl();h.classList.add("show");document.getElementById("starHudN").textContent=earned();
  var rn=document.getElementById("rankStars");if(rn)rn.textContent=earned();}
function flyStar(fromX,fromY){var h=starHudEl();h.classList.add("show");
  var r=h.getBoundingClientRect(),s=el("div","flystar","⭐");s.style.left=fromX+"px";s.style.top=fromY+"px";
  document.body.appendChild(s);
  requestAnimationFrame(function(){s.style.left=(r.left+22)+"px";s.style.top=(r.top+r.height/2)+"px";
    s.style.transform="translate(-50%,-50%) scale(.35)";s.style.opacity="0";});
  setTimeout(function(){if(s.parentNode)s.parentNode.removeChild(s);addStar();refreshStar();
    h.classList.remove("pop");void h.offsetWidth;h.classList.add("pop");},640);}
// награда за верный ответ: +звезда с анимацией из точки клика + запись в журнал
function reward(ev,mode,skill,id){logAdd(mode,skill,id,1);
  var x=window.innerWidth/2,y=window.innerHeight/2;
  if(ev&&ev.currentTarget){var b=ev.currentTarget.getBoundingClientRect();x=b.left+b.width/2;y=b.top+b.height/2;}
  flyStar(x,y);}

/* =============================== ТОСТ ===================================== */
function toast(msg){var t=document.getElementById("toast");if(!t){t=el("div");t.id="toast";document.body.appendChild(t);}
  t.textContent=msg;t.style.opacity="1";t.style.transform="translateX(-50%) translateY(0)";
  clearTimeout(t._h);t._h=setTimeout(function(){t.style.opacity="0";t.style.transform="translateX(-50%) translateY(20px)";},1600);}

/* =============================== ЛИСТЫ ==================================== */
var sheetEl,panelEl;
function ensureSheet(){if(sheetEl)return;sheetEl=el("div","sheet");sheetEl.id="sheet";
  panelEl=el("div","panel");sheetEl.appendChild(panelEl);document.body.appendChild(sheetEl);
  sheetEl.addEventListener("click",function(e){if(e.target===sheetEl)closeSheet();});}
function openSheet(icon,iconBg,title,sub,bodyEl,game){ensureSheet();
  panelEl.className="panel"+(game?" game":"");panelEl.style.height=game?"92vh":"";
  panelEl.innerHTML="";
  panelEl.appendChild(el("div","grab"));
  var ph=el("div","ph");
  ph.innerHTML='<div class="pb" style="background:'+(iconBg||"var(--bg2)")+'">'+icon+'</div>'+
    '<div><h3>'+esc(title)+'</h3>'+(sub?'<p>'+esc(sub)+'</p>':'')+'</div>';
  var x=el("button","xclose","✕");x.onclick=closeSheet;ph.appendChild(x);
  panelEl.appendChild(ph);
  var body=el("div");body.appendChild(bodyEl);panelEl.appendChild(body);
  sheetEl.classList.add("show");document.documentElement.classList.add("noscroll");
  return body;}
function closeSheet(){if(sheetEl)sheetEl.classList.remove("show");document.documentElement.classList.remove("noscroll");
  if(window.speechSynthesis)try{window.speechSynthesis.cancel();}catch(e){}render();}

/* ============================ ДОМАШНИЙ ЭКРАН ============================= */
function render(){
  var wrap=document.getElementById("app")||document.body;
  var m=masteredCount(),pct=ITEMS.length?Math.round(m/ITEMS.length*100):0,rk=RANKS[rankIdx()];
  var h=el("div","wrap");

  // верхняя панель
  var top=el("div","top");
  top.innerHTML='<div class="brand"><span class="mascot" style="width:34px;height:34px;font-size:28px;line-height:1">'+
      (C.mascot||"📚")+'</span>'+esc(C.title||"Энциклопедия")+'</div>'+
    '<button class="rank" id="rankBtn"><span class="av">'+rk[2]+'</span><span id="rankName">'+esc(rk[1])+
      '</span><span class="stars-n" id="rankStars">'+earned()+'</span></button>'+
    '<button class="gear" id="parentBtn" aria-label="Для родителей">👪</button>';
  h.appendChild(top);

  // герой
  var hero=el("div","hero");var hd=(C.hero||{});
  hero.innerHTML='<span class="cloud c1"></span><span class="cloud c2"></span>'+
    '<div class="hero-inner"><span class="mascot">'+(C.mascot||"📚")+'</span>'+
      '<div style="flex:1"><h1>'+esc(hd.title||"Привет! Что изучим?")+'</h1>'+
      '<p>'+esc(hd.sub||"Открывай тему за темой — я рядом!")+'</p></div></div>'+
    '<div class="lvlbar"><div class="lab"><span>Освоено '+m+' из '+ITEMS.length+'</span><span>'+pct+'%</span></div>'+
      '<div class="track"><i class="fill" style="width:'+pct+'%"></i></div></div>'+
    '<button class="cta" id="ctaGo">🚀 '+esc(hd.cta||"В путь!")+'</button>';
  h.appendChild(hero);

  // темы (группы)
  h.appendChild(secHead(C.sectionsTitle||"Темы", ""));
  var trail=el("div","trail");
  GROUPS.forEach(function(g){
    var tot=(INGROUP[g.id]||[]).length,dn=groupMastered(g.id),gp=tot?Math.round(dn/tot*100):0;
    var node=el("button","node");node.setAttribute("data-group",g.id);
    node.innerHTML='<div class="badge" style="background:'+(g.color||"var(--bg2)")+'">'+(g.emoji||"⭐")+'</div>'+
      '<div class="info"><b>'+esc(g.name)+'</b>'+
        '<div class="prog"><i style="width:'+gp+'%;background:'+(g.color||"var(--gold)")+'"></i></div>'+
        '<div class="meta">'+dn+' / '+tot+(dn>=tot&&tot>0?' ✅':'')+'</div></div>'+
      '<div class="go2">›</div>';
    trail.appendChild(node);
  });
  h.appendChild(trail);

  // игры
  h.appendChild(secHead("Игры",""));
  var qrow=el("div","qrow");
  qrow.innerHTML='<button class="qcard big g-what" id="qWhat"><span class="qi">🎴</span>'+
    '<span class="txt"><b>Что это?</b><small>'+esc(C.quizSub||"Узнавай и называй — набирай звёзды!")+'</small></span></button>';
  h.appendChild(qrow);

  h.appendChild(el("div","foot","Образовариум · "+esc(C.title||"")));

  wrap.innerHTML="";wrap.appendChild(h);

  document.getElementById("rankBtn").onclick=openLevels;
  document.getElementById("parentBtn").onclick=openParent;
  document.getElementById("ctaGo").onclick=function(){startJourney();};
  document.getElementById("qWhat").onclick=openQuiz;
  [].slice.call(h.querySelectorAll(".node")).forEach(function(n){
    n.onclick=function(){startGroup(n.getAttribute("data-group"));};});
  refreshStar();
}
function secHead(title,k){var s=el("div","sec");s.innerHTML='<h2>'+esc(title)+'</h2>'+(k?'<span class="k">'+esc(k)+'</span>':'');return s;}

/* ============================ УРОК (в путь) ============================== */
// очередь предметов: у группы — её предметы; «в путь» — следующие неосвоенные.
function startJourney(){var q=ITEMS.filter(function(it){return !itemDone(it.id);}).slice(0,5);
  if(!q.length)q=shuffle(ITEMS).slice(0,5);runRound(q,C.hero&&C.hero.cta||"Путешествие");}
function startGroup(gid){var g=GROUP[gid],q=(INGROUP[gid]||[]).slice();
  if(!q.length){toast("Тема пока пустая");return;}runRound(q,g.name,g);}

function runRound(queue,title,group){
  var body=openSheet(group?(group.emoji||"📖"):"🧭",
    group?group.color:"var(--coral)",title,"Знакомься и отвечай",el("div"),true);
  body.id="rBody";
  var qi=0, stepLearn=true, stars0=earned();
  var order=queue.slice();
  next();

  function next(){
    if(qi>=order.length){finish();return;}
    var it=order[qi];
    if(stepLearn){learn(it);}else{tasks(it);}
  }
  function learn(it){
    stepLearn=false;
    body.innerHTML="";
    body.appendChild(topBar(qi+1,order.length));
    var card=el("div","learn");
    card.innerHTML='<div class="lvis">'+vis(it,88)+'</div>'+
      '<h2>'+esc(it.name)+'</h2>'+
      (GROUP[it.group]?'<div class="lcap">'+esc(GROUP[it.group].name)+'</div>':'')+
      (it.fact?'<div class="lfact">'+esc(it.fact)+'</div>':'');
    body.appendChild(card);
    var b=el("button","bigbtn","Дальше →");b.onclick=function(){tasks(it);};body.appendChild(b);
    playKeys(["learn_1","name_"+it.id],"Знакомься! "+it.name);
  }
  function tasks(it){
    // спрашиваем по каждому навыку из ROUND, которого ещё нет
    var todo=ROUND.slice();
    askNext();
    function askNext(){
      if(!todo.length){ // предмет пройден — переменка-факт (не озвучиваем) или дальше
        qi++;stepLearn=true;
        var kf=(it.kidfacts&&it.kidfacts.length)?it.kidfacts[Math.floor(pseudo()*it.kidfacts.length)]:null;
        if(kf){breakFact(it,kf,next);}else{next();}
        return;}
      var skill=todo.shift();
      askQ(body,it,skill,"round",qi+1,order.length,function(){askNext();});
    }
  }
  function breakFact(it,fact,done){
    body.innerHTML="";
    body.appendChild(topBar(qi,order.length));
    var st=el("div","gstage gstage-info");
    st.innerHTML='<div class="q">А ты знал?</div><div style="font-size:44px;margin:2px 0 8px">'+(it.emoji||"")+'</div>'+
      '<div class="factbig">'+esc(fact)+'</div>';
    body.appendChild(st);
    var b=el("button","bigbtn green","Дальше →");b.onclick=done;body.appendChild(b);
  }
  function topBar(cur,tot){var t=el("div","gtop");
    t.innerHTML='<div class="gs">'+esc(title)+'</div><div class="gn">'+cur+' / '+tot+'</div>';return t;}
  function finish(){
    body.innerHTML="";
    var got=earned()-stars0;
    var cel=el("div","celebrate");
    cel.innerHTML='<div style="font-size:64px">'+(group?group.emoji:"🎉")+'</div>'+
      '<h2>Отлично!</h2><div class="cstars">'+stars(Math.min(5,Math.max(1,got)))+'</div>'+
      '<p>Звёзд за подход: '+got+'</p>';
    body.appendChild(cel);
    // дневник: что прошли
    var d=el("div","diary");var rows='<div class="dh">Ты изучил:</div>';
    order.forEach(function(it){rows+='<div class="drow"><span class="di">'+(it.emoji||"")+'</span><span>'+esc(it.name)+'</span></div>';});
    d.innerHTML=rows;body.appendChild(d);
    var b=el("button","bigbtn","Готово");b.onclick=closeSheet;body.appendChild(b);
    playKeys(["fin_1"],"Отлично сыграно! Молодец!");
  }
}

/* ====================== ОДИН ВОПРОС (общий для урока и «Что это?») ========= */
// skill: name | group | which. mode: round | quiz (для журнала)
function askQ(body,it,skill,mode,cur,tot,onDone){
  body.innerHTML="";
  var t=el("div","gtop");t.innerHTML='<div class="gs">Что это?'+
    '</div><div class="gn">'+(cur?cur+' / '+tot:'')+'</div>';body.appendChild(t);

  var st=el("div","gstage"),qtext,promptSpeak;
  var opts=[],correct;

  if(skill==="name"){
    // показываем эмодзи → выбери название
    qtext=C.q_name||"Как это называется?";
    st.innerHTML='<div class="q">'+esc(qtext)+'</div><div class="qvis">'+vis(it,84)+'</div>';
    correct=it.name;
    opts=[it.name].concat(sample(ITEMS.map(function(x){return x.name;}),optCount()-1,it.name));
  }else if(skill==="group"){
    qtext=C.groupQuestion||"К какой теме это относится?";
    st.innerHTML='<div class="q">'+esc(qtext)+'</div><div class="qvis">'+vis(it,64)+
      '</div><div class="qname">'+esc(it.name)+'</div>';
    var gname=(GROUP[it.group]||{}).name||it.group;
    correct=gname;
    var otherG=GROUPS.map(function(g){return g.name;});
    opts=[gname].concat(sample(otherG,optCount()-1,gname));
  }else{ // which: дано название/тема → выбери правильный эмодзи-предмет
    qtext=C.q_which||("Что из этого — "+it.name+"?");
    st.innerHTML='<div class="q">'+esc(qtext)+'</div><div class="qname">'+esc(it.name)+'</div>';
    correct=it.id;
    opts=[it.id].concat(sample(ITEMS.map(function(x){return x.id;}),optCount()-1,it.id));
  }
  body.appendChild(st);
  promptSpeak=qtext+(skill==="group"||skill==="which"?" "+it.name:"");
  var vkeys=skill==="name"?["q_name"]:skill==="group"?["q_group","name_"+it.id]:["q_which","name_"+it.id];
  playKeys(vkeys,promptSpeak);

  var go=el("div","gopts");opts=shuffle(opts);
  opts.forEach(function(o){
    var b=el("button","gopt");
    if(skill==="which"){var oi=BY[o];b.innerHTML='<div class="ovis">'+vis(oi,52)+'</div>'+
      '<div style="font-size:12px;color:var(--muted);margin-top:2px">'+esc(oi?oi.name:"")+'</div>';}
    else b.textContent=o;
    b.onclick=function(ev){pick(ev,b,o);};go.appendChild(b);
  });
  body.appendChild(go);

  var feed=el("div","gfeed");body.appendChild(feed);
  var answered=false;
  function pick(ev,btn,val){
    if(answered)return;answered=true;
    var ok=(val===correct);
    [].slice.call(go.children).forEach(function(c){c.style.pointerEvents="none";});
    if(ok){btn.classList.add("correct");feed.className="gfeed good";feed.textContent="Верно! ⭐";
      if(mode==="round")markSkill(it.id,skill);
      reward(ev,mode,skill,it.id);playKeys([okKey()],"Верно!");}
    else{btn.classList.add("wrong");feed.className="gfeed bad";
      // подсветить правильный
      [].slice.call(go.children).forEach(function(c,i){if(opts[i]===correct)c.classList.add("correct");});
      var shown = skill==="which" ? (BY[correct]||{}).name : correct;
      feed.textContent="Не совсем. Это: "+shown;logAdd(mode,skill,it.id,0);playKeys(["no_1"],"Не совсем.");}
    setTimeout(onDone, ok?900:1500);
  }
}

/* =========================== ИГРА «ЧТО ЭТО?» ============================= */
function openQuiz(){
  var body=openSheet("🎴","var(--coral)","Что это?","Узнавай и называй",el("div"),true);
  body.id="qBody";
  var total=10,cur=0;
  var queue=[];for(var i=0;i<total;i++){var it=ITEMS[Math.floor(pseudo()*ITEMS.length)];
    var sk=QUIZ[Math.floor(pseudo()*QUIZ.length)];queue.push({it:it,sk:sk});}
  step();
  function step(){if(cur>=queue.length){done();return;}
    var q=queue[cur];askQ(body,q.it,q.sk,"quiz",cur+1,total,function(){cur++;step();});}
  function done(){body.innerHTML="";var cel=el("div","celebrate");
    cel.innerHTML='<div style="font-size:60px">🌟</div><h2>Молодец!</h2>'+
      '<p>Сыграно вопросов: '+total+'</p>';body.appendChild(cel);
    var b=el("button","bigbtn","Ещё раз");b.onclick=openQuiz;body.appendChild(b);
    var b2=el("button","bigbtn green","Готово");b2.onclick=closeSheet;body.appendChild(b2);}
}

/* ============================== УРОВНИ =================================== */
function openLevels(){
  var body=el("div");
  var m=masteredCount(),ci=rankIdx();
  body.appendChild(el("div","lv-intro","Осваивай темы — открывай новые уровни! Освоено предметов: <b>"+m+" из "+ITEMS.length+"</b>."));
  RANKS.forEach(function(r,i){
    var need=rankThrCount(r[0]);
    var row=el("div","lv-row"+(i<ci?" done":i===ci?" cur":""));
    row.innerHTML='<div class="lv-ico">'+r[2]+'</div><div class="lv-info"><b>'+esc(r[1])+'</b>'+
      '<small>'+(need<=0?"с самого начала":"освоить "+need+" предм.")+'</small></div>'+
      (i<=ci?'<div class="lv-ok">✔</div>':'<div class="lv-need'+(i===ci+1?'':' dim')+'">'+Math.max(0,need-m)+' ★</div>');
    body.appendChild(row);
  });
  var nx=RANKS[ci+1];
  if(nx)body.appendChild(el("div","lv-goal","До «"+esc(nx[1])+"» осталось освоить "+Math.max(0,rankThrCount(nx[0])-m)+" предметов!"));
  else body.appendChild(el("div","lv-goal","Ты прошёл все уровни! 🏆"));
  openSheet(RANKS[ci][2],"linear-gradient(135deg,var(--gold),#FFAE3A)","Уровни","Твой путь мастерства",body);
}

/* ===================== РОДИТЕЛЬСКИЙ РЕЖИМ (замок) ======================== */
function openParent(){
  if(sessionStorage.getItem(lk("_parent"))==="1"){parentPanel();return;}
  var a=2+Math.floor(pseudo()*8),b=2+Math.floor(pseudo()*8);
  var body=el("div");
  body.innerHTML='<div class="vonly" style="border-style:solid">Только для взрослых.<br>Реши пример, чтобы войти.</div>'+
    '<div class="gq" style="text-align:center">'+a+' × '+b+' = ?</div>'+
    '<div style="text-align:center"><input class="gin" id="pIn" inputmode="numeric" type="text"></div>';
  var b1=el("button","bigbtn","Войти");
  body.appendChild(b1);
  var host=openSheet("🔐","var(--bg2)","Для родителей","Настройки и статистика",body);
  b1.onclick=function(){var v=parseInt(document.getElementById("pIn").value,10);
    if(v===a*b){sessionStorage.setItem(lk("_parent"),"1");parentPanel();}else{toast("Не сходится, попробуй ещё");}};
  setTimeout(function(){var i=document.getElementById("pIn");if(i)i.focus();},250);
}
function parentPanel(){
  var body=el("div");
  // ---- статистика прогресса по темам ----
  body.appendChild(subHead("Прогресс по темам"));
  GROUPS.forEach(function(g){
    var tot=(INGROUP[g.id]||[]).length,dn=groupMastered(g.id),pc=tot?Math.round(dn/tot*100):0;
    var line=el("div");
    line.innerHTML='<div class="st-line st-cont"><span>'+(g.emoji||"")+' '+esc(g.name)+'</span><b>'+dn+' / '+tot+'</b></div>'+
      '<div class="st-bar"><i style="width:'+pc+'%;background:'+(g.color||"var(--gold)")+'"></i></div>';
    body.appendChild(line);
  });
  // ---- звёзды и ответы ----
  var L=jget(K_LOG,[]),ok=0,bad=0,bySkill={};
  L.forEach(function(e){if(e.r===1)ok++;else bad++;var s=bySkill[e.s]=bySkill[e.s]||{o:0,b:0};if(e.r===1)s.o++;else s.b++;});
  body.appendChild(subHead("Награды"));
  body.appendChild(kv("Звёзд заработано","⭐ "+earned()));
  body.appendChild(kv("Освоено предметов",masteredCount()+" из "+ITEMS.length));
  body.appendChild(kv("Верных ответов",ok));
  body.appendChild(kv("Ошибок",bad));
  var SKN={name:"Название",group:"Тема",which:"Узнавание"};
  Object.keys(bySkill).forEach(function(s){var d=bySkill[s];
    body.appendChild(kv("• "+(SKN[s]||s),d.o+" ✓ / "+d.b+" ✗"));});

  // ---- настройки ----
  body.appendChild(subHead("Настройки"));
  body.appendChild(setBlock("Подсказки голосом",[["1","Включены"],["0","Выключены"]],K_VOICE,"1",true));
  body.appendChild(setBlock("Вариантов ответа",[["2","2"],["3","3"],["4","4"]],K_OPTN,"3",true,true));

  // ---- сброс ----
  var rst=el("button","vskip","Сбросить прогресс");
  rst.onclick=function(){if(confirm("Сбросить весь прогресс этой энциклопедии?")){
    [K_PROG,K_EARN,K_LOG].forEach(function(k){try{localStorage.removeItem(lk(k));}catch(e){}});
    toast("Прогресс сброшен");closeSheet();}};
  body.appendChild(rst);

  openSheet("👪","var(--bg2)","Для родителей","Статистика и настройки",body);
}
function subHead(t){return el("div","st-sub",esc(t));}
function kv(k,v){var e=el("div","st-line");e.innerHTML='<span>'+esc(k)+'</span><b>'+esc(v)+'</b>';return e;}
function setBlock(title,opts,key,def,isVoice,row){
  var wrap=el("div","set-b");wrap.appendChild(el("div","set-k",esc(title)));
  var segs=el("div","segs"+(row?" segs-row":""));
  var cur=lget(key,def);
  opts.forEach(function(o){var b=el("button",cur===o[0]?"on":"",esc(o[1]));
    b.onclick=function(){lset(key,o[0]);[].slice.call(segs.children).forEach(function(c){c.classList.remove("on");});b.classList.add("on");
      if(isVoice&&o[0]==="1")speak("Голос включён");};
    segs.appendChild(b);});
  wrap.appendChild(segs);return wrap;
}

/* =============================== СТАРТ ==================================== */
function boot(){
  if(!ITEMS.length){(document.getElementById("app")||document.body).innerHTML=
    '<div class="wrap"><div class="learn"><h2>Нет данных</h2>'+
    '<div class="lfact">Проверь, что подключены config.js и content.js с массивом items.</div></div></div>';return;}
  render();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();

// экспорт для отладки/тестов
window.KIT={render:render,earned:earned,masteredCount:masteredCount,C:C,ITEMS:ITEMS,startGroup:startGroup,openQuiz:openQuiz};
})();
