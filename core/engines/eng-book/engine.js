/* ===================================================================
   English · Interactive Book — движок
   Контент лежит в data/*.json (см. MANIFEST). Один тип механики =
   один рендерер в EXTYPES. Проверка/ответы/сброс — общие.
   =================================================================== */
/* ОБЩЕЕ ЯДРО платформы (core/engines/eng-book): список юнитов задаёт колода
   через window.BOOK_MANIFEST (тонкий index.html колоды). */
const MANIFEST = (typeof window !== 'undefined' && window.BOOK_MANIFEST)
  ? window.BOOK_MANIFEST
  : ['data/starter.json', 'data/unit1.json', 'data/unit2.json', 'data/unit3.json', 'data/unit4.json', 'data/unit5.json', 'data/unit6.json', 'data/unit7.json', 'data/unit8.json', 'data/unit9.json', 'data/revision.json'];

/* ---------- constants ---------- */
const COLORS = {black:'#20232B',blue:'#2F6BDB',brown:'#8A5A2B',green:'#2E9E57',grey:'#8B93A5',
orange:'#F08A24',pink:'#F286B0',purple:'#7A4FBF',red:'#E8555A',white:'#FFFFFF',yellow:'#F5B72F'};
const WDAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const PICON='<svg class="picon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
const PICONW='<svg class="picon w" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
const STOPICON='<svg class="picon" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12"/></svg>';
const HEADICON='<img src="img/ic-02.png" alt="">';

const EX = {};            // реестр упражнений: id -> {type, ...данные для проверки}
const CHAIN = {};         // цепочки симуляций: exId -> {ids, cards, idx, foot, outro}
let uid = 0;
const nid = p => p + (++uid);

/* ---------- аудио: заранее озвученные клипы (mp3) с фолбэком на синтез ----------
   AUDIO_MAP: { "английский текст": "audio/NNNN.mp3" } — грузится из data/audio-map.json.
   Есть файл → играем живой голос ElevenLabs; нет → браузерный синтезатор. */
let AUDIO_MAP = {};
const AUDIO_BASE = (typeof window!=='undefined' && window.BOOK_AUDIO_BASE) ? window.BOOK_AUDIO_BASE : 'assets/';
function clipUrl(text){ const f=AUDIO_MAP[text]; return f ? AUDIO_BASE+f : null; }
let _clip=null;                 // текущий проигрываемый Audio (для inline-озвучки)
function stopClip(){ try{ if(_clip){_clip.pause();_clip=null;} }catch(_){} }
function playClip(url,onend){
  try{
    stopClip();
    const a=new Audio(url); _clip=a;
    a.onended=()=>{ if(_clip===a)_clip=null; if(onend)onend(); };
    const p=a.play(); if(p&&p.catch)p.catch(()=>{ if(onend)onend(); });
    return a;
  }catch(e){ if(onend)onend(); return null; }
}

/* ---------- tts ---------- */
function tts(text){
  const url=clipUrl(text);
  if(url){ try{speechSynthesis.cancel()}catch(_){}; playClip(url); return; }
  try{
    stopClip();
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang='en-GB';u.rate=0.92;
    const v=speechSynthesis.getVoices().find(v=>v.lang.startsWith('en'));
    if(v)u.voice=v;
    speechSynthesis.speak(u);
  }catch(e){}
}
if('speechSynthesis' in window)speechSynthesis.getVoices();

/* ---------- helpers ---------- */
const shuffle=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(v=>v[1]);
function derange(items,correct){
  for(let t=0;t<60;t++){
    const s=shuffle(items.slice());
    if(s.every((v,i)=>v!==correct[i]))return s;
  }
  /* конструктивно: чиним совпадения парными обменами (важно для слов
     с повторяющимися буквами — BANANA, CHEESE: reverse их не спасал) */
  const s=shuffle(items.slice());
  for(let i=0;i<s.length;i++){
    if(s[i]===correct[i]){
      for(let j=0;j<s.length;j++){
        if(j!==i&&s[j]!==correct[i]&&s[i]!==correct[j]){const q=s[i];s[i]=s[j];s[j]=q;break;}
      }
    }
  }
  return s;
}
function el(tag, cls, html){
  const d=document.createElement(tag);
  if(cls)d.className=cls;
  if(html!==undefined)d.innerHTML=html;
  return d;
}
function chipEl(val,ex,dot,cls){
  const c=el('div','chip'+(cls?' '+cls:''));
  c.dataset.val=val;c.dataset.ex=ex;
  c.innerHTML=(dot?`<span class="cdot" style="background:${COLORS[val]||'#ccc'}"></span>`:'')+val;
  return c;
}
function slotEl(ex,answer,minw,small){
  const s=el('span','slot'+(small?' sm':''));
  s.dataset.ex=ex;s.dataset.answer=answer;
  if(minw)s.style.minWidth=(typeof minw==='number')?minw+'px':minw;
  return s;
}
function tinputEl(ex, answer, w){
  const inp=document.createElement('input');
  inp.className='tinput';inp.dataset.ex=ex;
  if(answer)inp.dataset.answer=answer;
  if(w)inp.style.width=w+'px';
  inp.type='text';inp.autocapitalize='none';inp.autocomplete='off';inp.spellcheck=false;
  inp.addEventListener('input',()=>{inp.classList.remove('ok','bad');
    const sc=document.getElementById('score-'+ex);if(sc)sc.className='score';
    const st=document.getElementById('stamp-'+ex);if(st)st.classList.remove('show');});
  return inp;
}
function colHTML(p){
  return p==='white'
    ? `<b style="color:#fff;-webkit-text-stroke:1.2px #8B93A5">white</b>`
    : `<b style="color:${COLORS[p]};-webkit-text-stroke:.3px #00000022">${p}</b>`;
}

/* ---------- word box (аудиословарь) ---------- */
function buildWordbox(parent, cfg){
  const box=el('div','wordbox');
  const head=el('div','wb-head');
  head.appendChild(el('span','wb-ic','<img src="img/ic-02.png" alt="">'));
  head.appendChild(el('b','',cfg.name));
  const playBtn=el('button','btn say small');playBtn.type='button';
  head.appendChild(playBtn);
  box.appendChild(head);
  const list=el('div','wb-list');
  box.appendChild(list);
  parent.appendChild(box);

  let playing=false;
  function speakWord(wEl,onend){
    document.querySelectorAll('.wb-word.playing').forEach(x=>x.classList.remove('playing'));
    wEl.classList.add('playing');
    const done=()=>{wEl.classList.remove('playing');if(onend)onend()};
    const url=clipUrl(wEl.dataset.w);
    if(url){ playClip(url,done); return; }
    const u=new SpeechSynthesisUtterance(wEl.dataset.w);
    u.lang='en-GB';u.rate=0.9;
    const v=speechSynthesis.getVoices().find(v=>v.lang.startsWith('en'));
    if(v)u.voice=v;
    u.onend=done;
    speechSynthesis.speak(u);
  }
  function stop(){
    playing=false;speechSynthesis.cancel();stopClip();
    document.querySelectorAll('.wb-word.playing').forEach(x=>x.classList.remove('playing'));
    playBtn.innerHTML=PICON+' Все слова';
  }
  cfg.words.forEach(w=>{
    const d=el('div','wb-word',w);d.dataset.w=w;
    d.addEventListener('click',()=>{stop();speakWord(d)});
    list.appendChild(d);
  });
  stop();
  playBtn.addEventListener('click',()=>{
    if(playing){stop();return}
    playing=true;playBtn.innerHTML=STOPICON+' Стоп';
    const els=[...list.children];let i=0;
    const next=()=>{
      if(!playing||i>=els.length){stop();return}
      speakWord(els[i++],()=>setTimeout(next,350));
    };
    speechSynthesis.cancel();next();
  });
}

/* ===================================================================
   РЕНДЕРЕРЫ МЕХАНИК. Каждый получает (body, ex, id) где body — тело
   карточки упражнения, ex — объект из JSON, id — id упражнения.
   =================================================================== */
/* общий драг «переставь фишки на месте»: horiz=true — вставка по X, иначе по Y.
   pointer capture чинит артефакт: раньше, если палец отпускали ВНЕ контейнера,
   pointerup не долетал и «летящий» клон оставался лежать на экране. */
/* FLIP: плавное раздвижение соседей при перестановке */
function flipMove(container, mutate, animate){
  // во время активного перетаскивания анимацию пропускаем (animate===false):
  // FLIP-скольжение 0.16s на каждом пересечении соседа догоняло палец и тормозило
  if(animate===false){ mutate(); return; }
  // перетаскиваемый элемент (класс .dragging) из FLIP исключаем: его двигает
  // палец через клон-«призрак», а анимация transform на нём дёргала бы
  // определение позиции под пальцем (elementFromPoint/rect «плавают»)
  const els=[...container.children].filter(e=>!e.classList.contains('dragging'));
  const first=els.map(e=>e.getBoundingClientRect());
  mutate();
  els.forEach((e2,i)=>{
    const f=first[i], l=e2.getBoundingClientRect();
    const dx=f.left-l.left, dy=f.top-l.top;
    if(dx||dy){
      e2.style.transition='none'; e2.style.transform=`translate(${dx}px,${dy}px)`;
      requestAnimationFrame(()=>{ e2.style.transition='transform .16s ease'; e2.style.transform=''; });
    }
  });
}
function rowReorder(container, id, itemSel, horiz){
  let sel=null,dragIt=null,rafPending=false,lastPt=null;
  container.addEventListener('pointerdown',e=>{
    if(e.target.closest('.say'))return;       // тап по кнопке «слушать» — не начинаем перетаскивание
    const it=e.target.closest(itemSel);if(!it)return;
    e.preventDefault();
    document.querySelectorAll('.bword.flying,.ritem.flying').forEach(f=>f.remove());
    try{container.setPointerCapture(e.pointerId)}catch(_){}
    /* запоминаем, началось ли нажатие на картинке: тогда тап без движения
       откроет панель во весь экран, а не выберет строку для обмена.
       Перетаскивать за картинку при этом по-прежнему можно. */
    dragIt={it,startX:e.clientX,startY:e.clientY,moved:false,img:e.target.closest('img')};
  });
  // тяжёлую часть (позиционирование призрака + поиск соседа) считаем не чаще кадра
  function frame(){
    rafPending=false;
    if(!dragIt||!dragIt.moved||!lastPt)return;
    const x=lastPt.x,y=lastPt.y;
    // позиционируем через CSS-свойство translate (композитинг, без рефлоу каждый кадр)
    dragIt.fly.style.translate=(x-dragIt.offX)+'px '+(y-dragIt.offY)+'px';
    const over=document.elementFromPoint(x,y);
    const t=over&&over.closest(itemSel);
    if(t&&t!==dragIt.it&&t.parentElement===container){
      const r=t.getBoundingClientRect();
      const before=horiz? x<r.left+r.width/2 : y<r.top+r.height/2;
      flipMove(container,()=>{
        if(before)container.insertBefore(dragIt.it,t);
        else container.insertBefore(dragIt.it,t.nextSibling);
      },false);   // во время drag — мгновенно, без FLIP-анимации (иначе тормозит)
    }
  }
  container.addEventListener('pointermove',e=>{
    if(!dragIt)return;
    if(!dragIt.moved&&Math.hypot(e.clientX-dragIt.startX,e.clientY-dragIt.startY)>7){
      dragIt.moved=true;window.__engDragging=true;clearMarks(id);
      const r=dragIt.it.getBoundingClientRect();
      dragIt.fly=dragIt.it.cloneNode(true);
      dragIt.fly.classList.add('flying');
      dragIt.fly.style.left='0';dragIt.fly.style.top='0';
      dragIt.fly.style.translate=r.left+'px '+r.top+'px';
      dragIt.fly.style.width=r.width+'px';
      document.body.appendChild(dragIt.fly);
      dragIt.it.classList.add('dragging');
      dragIt.offX=e.clientX-r.left;dragIt.offY=e.clientY-r.top;
    }
    if(!dragIt.moved)return;
    lastPt={x:e.clientX,y:e.clientY};
    if(!rafPending){rafPending=true;requestAnimationFrame(frame);}
  });
  const up=e=>{
    if(!dragIt)return;
    window.__engDragging=false;
    if(dragIt.moved){dragIt.it.classList.remove('dragging');if(dragIt.fly)dragIt.fly.remove()}
    else if(dragIt.img){
      /* подпись — сама реплика из data-val, а не текст span: в span рядом
         лежит блок перевода, и они склеивались в одну строку */
      openLightbox(dragIt.img.getAttribute('src'), dragIt.it.dataset.val||'');
    }
    else{
      const it=dragIt.it;
      clearMarks(id);
      if(sel===it){it.classList.remove('sel');sel=null}
      else if(!sel){sel=it;it.classList.add('sel');tts(it.dataset.val)}
      else{
        flipMove(container,()=>{
          if(sel.compareDocumentPosition(it)&Node.DOCUMENT_POSITION_FOLLOWING)it.after(sel);
          else it.before(sel);
        });
        sel.classList.remove('sel');sel=null;
      }
    }
    dragIt=null;
  };
  container.addEventListener('pointerup',up);
  container.addEventListener('pointercancel',up);
}

const EXTYPES = {

  /* сетка карточек-предметов: подпиши картинки */
  objcards(body, ex, id){
    const pool=el('div','pool');pool.id='pool-'+id;
    shuffle(ex.items.map(o=>o[1])).forEach(v=>pool.appendChild(chipEl(v,id)));
    body.appendChild(pool);
    const grid=el('div','objgrid');
    const letters='abcdefghijklmnop';
    ex.items.forEach((o,i)=>{
      const card=el('div','objcard',`<span class="tag">${letters[i]}</span><img class="icimg" src="${o[0]}" alt="">`);
      card.appendChild(slotEl(id,o[1],96));
      grid.appendChild(card);
    });
    body.appendChild(grid);
  },

  /* мультивыбор: нажми слова-ответы */
  toggle(body, ex, id){
    EX[id].answers=ex.answers;
    const pool=el('div','pool blue');pool.id='pool-'+id;
    shuffle(ex.words.slice()).forEach(v=>{
      const c=chipEl(v,id,ex.dots);c.classList.add('toggle');
      c.addEventListener('click',()=>{if(!c.classList.contains('locked'))c.classList.toggle('on')});
      pool.appendChild(c);
    });
    body.appendChild(pool);
  },

  /* смешение красок */
  colormix(body, ex, id){
    const pool=el('div','pool');pool.id='pool-'+id;
    shuffle(ex.rows.map(r=>r[2])).forEach(v=>pool.appendChild(chipEl(v,id,true)));
    body.appendChild(pool);
    ex.rows.forEach((m,i)=>{
      const row=el('div','objrow');
      const parts=m[1].split('+').map(colHTML).join(' + ');
      row.innerHTML=`<span class="objtext">${i+1}&nbsp; ${colHTML(m[0])} + ${parts} =</span>`;
      row.appendChild(slotEl(id,m[2]));
      body.appendChild(row);
    });
  },

  /* цвет предметов: иконка с подложкой + The X is ... */
  objcolors(body, ex, id){
    const pool=el('div','pool');pool.id='pool-'+id;
    shuffle(ex.pool.slice()).forEach(v=>pool.appendChild(chipEl(v,id,true)));
    body.appendChild(pool);
    ex.items.forEach(o=>{
      const row=el('div','objrow');
      const tint=COLORS[o[2]];
      row.innerHTML=`<span class="objicon" style="background:${tint}22;border-color:${tint}"><img src="${o[0]}" alt=""></span>
        <span class="objtext">The ${o[1]} ${o[1].endsWith('s')?'are':'is'}</span>`;
      row.appendChild(slotEl(id,o[2]));
      row.appendChild(el('span','objtext','.'));
      body.appendChild(row);
    });
  },

  /* цветовой круг */
  wheel(body, ex, id){
    const segs=['purple','orange','yellow','green','blue','red'];
    const pool=el('div','pool');pool.id='pool-'+id;
    shuffle(segs.slice()).forEach(v=>pool.appendChild(chipEl(v,id,true)));
    body.appendChild(pool);
    const wrap=el('div','wheelwrap');
    const wheel=el('div','wheel');
    const segCenter={purple:[68,19],orange:[86,50],yellow:[68,81],green:[32,81],blue:[14,50],red:[32,19]};
    const letters=['a','b','c','d','e','f'];
    segs.forEach((col,i)=>{
      const [x,y]=segCenter[col];
      const w=el('div','wslot');w.style.left=x+'%';w.style.top=y+'%';
      w.appendChild(el('span','tag',letters[i]));
      w.appendChild(slotEl(id,col,92));
      wheel.appendChild(w);
    });
    wrap.appendChild(wheel);body.appendChild(wrap);
  },

  /* сортировка по колонкам */
  buckets(body, ex, id){
    const pool=el('div','pool'+(ex.letters?' blue':''));pool.id='pool-'+id;
    shuffle(ex.chips.slice()).forEach(p=>{
      const c=chipEl(p[0],id,false,ex.letters?'letter':'');
      c.dataset.col=p[1];pool.appendChild(c);
    });
    body.appendChild(pool);
    const cols=el('div','cols'+(ex.cols.length===3?' three':''));
    ex.cols.forEach(cdef=>{
      const b=el('div','bucket'+(cdef[2]?' '+cdef[2]:''));
      b.dataset.ex=id;b.dataset.col=cdef[0];
      const h=el('h4',null,`<span>${cdef[1]}</span>`);
      if(cdef[3]){
        const say=el('button','btn say small',PICON);say.type='button';say.dataset.say=cdef[3];
        h.appendChild(say);
      }
      b.appendChild(h);b.appendChild(el('div','bin'));
      cols.appendChild(b);
    });
    body.appendChild(cols);
  },

  /* строки соответствия: [pre]|[icon] — слот — [post] */
  match(body, ex, id){
    const pool=el('div','pool'+(ex.poolStyle==='blue'?' blue':''));pool.id='pool-'+id;
    const poolWords = ex.pool || ex.rows.map(r=>r.ans);
    shuffle(poolWords.slice()).forEach(v=>pool.appendChild(chipEl(v,id)));
    body.appendChild(pool);
    ex.rows.forEach((r,i)=>{
      const row=el('div', r.bubble?'speechrow':'objrow');
      if(r.icon)row.appendChild(el('span','objicon',`<img src="${r.icon}" alt="">`));
      if(r.bubble)row.appendChild(el('span','bubble',r.pre));
      else if(r.pre!==undefined)row.appendChild(el('span', r.datenum?'datenum':'objtext', r.datenum?r.pre:(ex.autonum===false?r.pre:(i+1)+'&nbsp; '+r.pre)));
      if(r.say){
        const say=el('button','btn say small',PICON);say.type='button';say.dataset.say=r.say;
        row.appendChild(say);
      }
      row.appendChild(slotEl(id,r.ans,ex.slotW||120,ex.sm));
      if(r.post)row.appendChild(el('span','objtext',' '+r.post));
      body.appendChild(row);
    });
  },

  /* расставь по порядку */
  /* расставь по порядку: строки уже на месте — перетаскивай (как reorder) */
  order(body, ex, id){
    EXTYPES.reorder(body,{items:ex.items},id);
  },

  /* даты: NN/NN -> the [слот] of [слот] */
  dates(body, ex, id){
    const pool=el('div','pool blue');pool.id='pool-'+id;
    shuffle(ex.pool.slice()).forEach(v=>pool.appendChild(chipEl(v,id)));
    body.appendChild(pool);
    ex.rows.forEach(d=>{
      const row=el('div','daterow');
      row.appendChild(el('span','datenum',d[0]));
      row.appendChild(el('span','', '→ the'));
      row.appendChild(slotEl(id,d[1],132));
      row.appendChild(el('span','','of'));
      row.appendChild(slotEl(id,d[2],120));
      body.appendChild(row);
    });
  },

  /* выбор варианта (в т.ч. True/False, с ✓/✗) */
  radio(body, ex, id){
    /* КОРОТКИЕ ВАРИАНТЫ СТАВИМ В ОДНУ СТРОКУ С ВОПРОСОМ.
       При wide:true вопрос занимал всю ширину и выталкивал варианты на
       следующую строку — лишний перенос и вдвое длиннее список.

       Порог не «шесть букв», как в первой версии: под него попадали только
       True/False, а вопросы вида «makes films about … · cars / animals» или
       «He is … years old. · one hundred / fifty» так и оставались в два
       этажа. Считаем по САМОМУ ДЛИННОМУ варианту и их числу: две штуки до
       14 знаков или три до восьми. Целые предложения (варианты у «лучшего
       содержания») под порог не проходят и остаются на своих строках —
       иначе они бы сплющили вопрос до одного слова в строке. */
    const opt=ex.rows.map(r=>r.options||[]);
    const maxN=Math.max.apply(null,opt.map(o=>o.length));
    const maxLen=Math.max.apply(null,opt.map(o=>Math.max.apply(null,o.map(x=>String(x[0]).length).concat([0]))));
    const shortOpts=(maxN<=2&&maxLen<=14)||(maxN<=3&&maxLen<=8);
    ex.rows.forEach((r,i)=>{
      const row=el('div','radiorow'+(shortOpts?' tight':''));
      if(r.mark)row.appendChild(el('span','mark',`<img src="${r.mark==='✓'?'img/ic-17.png':'img/ic-18.png'}" alt="${r.mark}">`));
      if(r.lead){
        const t=el('span','objtext',(ex.numbered?(i+1)+'. ':'')+r.lead);
        if(ex.wide&&!shortOpts)t.style.flexBasis='100%';
        /* базис задан в CSS (.radiorow.tight .objtext), инлайновый flex его
           перебивал и не давал вариантам ужиматься на узком экране */
        else if(shortOpts)t.style.minWidth='0';
        row.appendChild(t);
      }
      if(r.datenum)row.appendChild(el('span','datenum',r.datenum));
      if(r.mid)row.appendChild(el('span','objtext',r.mid));
      /* В строчном режиме варианты кладём в ОДИН блок: иначе при переносе они
         разъезжаются по разным строкам («fifty» осталось у вопроса, а
         «one hundred» ушло на строку ниже) — читается как две разные задачи.
         Одним блоком они либо стоят рядом с вопросом, либо уходят под него
         вместе. */
      const box=shortOpts?el('span','opts'):row;
      shuffle(r.options.slice()).forEach(o=>{
        const c=chipEl(o[0],id);
        c.classList.add('radio');c.dataset.good=o[1]?'1':'0';c.dataset.rg=id+'-'+i;
        box.appendChild(c);
      });
      if(box!==row)row.appendChild(box);
      if(r.post)row.appendChild(el('span','objtext',r.post));
      body.appendChild(row);
    });
  },

  /* ЗАГОЛОВКИ К АБЗАЦАМ. Текст разбит на пронумерованные абзацы, к каждому
     надо подобрать заголовок. Формат ОГЭ, и главная тренируемая привычка —
     читать абзац целиком, а не цепляться за первое знакомое слово.
     В банке ОБЯЗАТЕЛЬНО лишний заголовок: без него последний абзац
     закрывается вычитанием, и упражнение проверяет арифметику, а не чтение. */
  headings(body, ex, id){
    const pool=el('div','pool');pool.id='pool-'+id;
    shuffle(ex.heads.slice()).forEach(h=>pool.appendChild(chipEl(h,id)));
    body.appendChild(pool);
    ex.paras.forEach((p,i)=>{
      const wrap=el('div','parablock');
      const row=el('div','pararow');
      row.appendChild(el('span','datenum',String(i+1)));
      row.appendChild(slotEl(id,p.head,180));
      wrap.appendChild(row);
      wrap.appendChild(el('div','paratext',p.text));
      body.appendChild(wrap);
    });
  },

  /* ЛУЧШЕЕ КРАТКОЕ СОДЕРЖАНИЕ. Прочитать бегло и выбрать вариант, который
     передаёт главное. Неверные варианты не выдумка: в них настоящие факты из
     текста, просто не главная мысль — иначе выбор делается по одному
     знакомому слову и просмотровое чтение не тренируется. */
  gist(body, ex, id){
    const card=el('div','readcard',ex.text);
    body.appendChild(card);
    if(ex.listen){
      const ctr=el('div','controls');ctr.style.marginTop='6px';
      const btn=el('button','btn say',PICON+' Слушать текст');btn.type='button';
      btn.dataset.say=ex.text;btn.dataset.label='Слушать текст';
      ctr.appendChild(btn);body.appendChild(ctr);
    }
    shuffle(ex.options.slice()).forEach(o=>{
      const row=el('div','radiorow gistrow');
      const c=chipEl(o[0],id,false,'radio gistopt');
      c.dataset.good=o[1]?'1':'0';c.dataset.rg=id+'-0';
      row.appendChild(c);
      body.appendChild(row);
    });
  },

  /* ТРИ ПАРАЛЛЕЛЬНЫХ ТЕКСТА И ВОПРОСЫ «КТО?». Ответ лежит только в одном из
     текстов, поэтому, чтобы ответить, приходится просмотреть все три. Это
     ровно то чтение, которым человек пользуется в жизни. */
  whotext(body, ex, id){
    ex.people.forEach(p=>{
      const card=el('div','whocard');
      card.appendChild(el('div','whoname',p.name+(p.about?' <span>'+p.about+'</span>':'')));
      const rc=el('div','readcard',p.text);
      card.appendChild(rc);
      if(ex.listen){
        const ctr=el('div','controls');ctr.style.marginTop='6px';
        const btn=el('button','btn say',PICON+' Слушать');btn.type='button';
        btn.dataset.say=p.text;btn.dataset.label='Слушать';
        ctr.appendChild(btn);card.appendChild(ctr);
      }
      body.appendChild(card);
    });
    const names=ex.people.map(p=>p.name);
    ex.rows.forEach((r,i)=>{
      const row=el('div','radiorow');
      const t=el('span','objtext',(i+1)+'. '+r.q);
      t.style.flexBasis='100%';
      row.appendChild(t);
      shuffle(names.slice()).forEach(n=>{
        const c=chipEl(n,id,false,'radio');
        c.dataset.good=(n===r.who)?'1':'0';c.dataset.rg=id+'-'+i;
        row.appendChild(c);
      });
      body.appendChild(row);
    });
  },

  /* СЛОВО ПО СКЕЛЕТУ: e x _ i _ e d. Не диктант (это делает spelling) и не
     угадайка: часть букв на месте, и по ним слово восстанавливается, если
     его знаешь. Подсказка — предложение, в котором слово стоит.
     Маска в данных: буква = открыта, «_» = вписать. */
  skeleton(body, ex, id){
    ex.items.forEach((it,i)=>{
      const row=el('div','skelrow');
      row.appendChild(el('span','datenum',String(i+1)));
      const s=el('span','objtext',it.lead);
      s.style.flexBasis='100%';
      row.appendChild(s);
      const mask=el('span','skelmask');
      it.mask.split('').forEach(ch=>{
        mask.appendChild(el('span','skelch'+(ch==='_'?' gap':''),ch==='_'?'':ch));
      });
      row.appendChild(mask);
      row.appendChild(tinputEl(id,it.word,Math.max(90,it.word.length*15)));
      body.appendChild(row);
    });
  },

  /* ОСТОРОЖНО! Типичная ошибка русскоговорящего. Показываем ОБА варианта и
     просим выбрать верный, а объяснение открывается после проверки: если
     сразу написать «правильно так», ученик прочитает и не заметит, что сам
     говорит иначе. Неверный вариант — не выдумка, а то, что реально звучит
     на уроке. */
  watchout(body, ex, id){
    ex.items.forEach((it,i)=>{
      const wrap=el('div','watchitem');
      wrap.appendChild(el('div','watchru',it.ru));
      const row=el('div','radiorow');
      shuffle([[it.good,1],[it.bad,0]]).forEach(o=>{
        const c=chipEl(o[0],id,false,'radio gistopt');
        c.dataset.good=o[1]?'1':'0';c.dataset.rg=id+'-'+i;
        row.appendChild(c);
      });
      wrap.appendChild(row);
      const why=el('div','watchwhy',it.why);
      wrap.appendChild(why);
      body.appendChild(wrap);
    });
  },

  /* ПРАВИЛО ВЫВОДИТ УЧЕНИК. Сначала таблица с примерами, потом сами
     формулировки правила с дыркой: «We use the … for finished actions».
     Ученик не читает готовое правило, а собирает его — и потому замечает,
     на что смотреть в примерах. */
  discover(body, ex, id){
    if(ex.table){
      const t=el('table','gtable');
      ex.table.forEach(r=>{
        const tr=el('tr');
        tr.appendChild(el('td','k',r[0]));
        tr.appendChild(el('td','',r[1]));
        t.appendChild(tr);
      });
      body.appendChild(t);
    }
    body.appendChild(el('div','disclead',ex.lead||'Теперь собери правило сам:'));
    ex.rules.forEach((r,i)=>{
      const row=el('div','radiorow');
      const a=el('span','objtext',(i+1)+'. '+r.pre);
      row.appendChild(a);
      shuffle(r.options.slice()).forEach(o=>{
        const c=chipEl(o[0],id,false,'radio');
        c.dataset.good=o[1]?'1':'0';c.dataset.rg=id+'-'+i;
        row.appendChild(c);
      });
      if(r.post)row.appendChild(el('span','objtext',r.post));
      body.appendChild(row);
    });
  },

  /* ДИАЛОГ-КОНСТРУКТОР. Один скелет разговора, в нём сменные слова: нажал —
     подставилось другое, и диалог читается заново. Смысл в переигрываемости:
     тот же самый диалог отыгрывается десять раз с разным содержанием, и
     каждый раз это живая реплика, а не заученная строчка.

     Верного ответа тут нет и быть не может — любое сочетание осмысленно.
     Поэтому балл считаем как в shift: за исследование, то есть за число
     слотов, в которых ученик хоть раз поменял слово. Иначе пришлось бы
     объявить один вариант «правильным», и конструктор превратился бы в
     обычный выбор из трёх. */
  swap(body, ex, id){
    const reg=EX[id];
    reg.changed={};reg.totalSlots=(ex.slots||[]).length;reg.opened=0;
    const chips=[];
    (ex.lines||[]).forEach(ln=>{
      const row=el('div','swrow');
      row.appendChild(el('span','swwho',ln[0]));
      const say=el('span','swsay');
      String(ln[1]).split(/(\{\d+\})/).forEach(part=>{
        const m=part.match(/^\{(\d+)\}$/);
        if(!m){ say.appendChild(el('span','',part)); return; }
        const n=+m[1];
        const opts=ex.slots[n]||[''];
        const b=el('button','swchip',opts[0]);b.type='button';
        b.dataset.slot=String(n);b.dataset.cur='0';
        b.onclick=()=>{
          const cur=(+b.dataset.cur+1)%opts.length;
          b.dataset.cur=String(cur);
          b.textContent=opts[cur];
          b.classList.add('used');
          if(!reg.changed[n]){reg.changed[n]=1;reg.opened=Object.keys(reg.changed).length}
        };
        say.appendChild(b);chips.push(b);
      });
      row.appendChild(say);
      body.appendChild(row);
    });
    body.appendChild(el('div','swhint','💬 '+(ex.ask||'Нажимай на подчёркнутые слова и прочитай диалог вслух ещё раз — он каждый раз новый.')));
    reg.chips=chips;reg.slots=ex.slots||[];
  },

  /* алфавит с пропущенной буквой */
  abc(body, ex, id){
    const ABC='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    /* Пропущенная буква ДЕТЕРМИНИРОВАНА идентификатором упражнения, а не
       случайна. Со случайной кнопка «Слушать алфавит» ломалась молча: текст
       клипа — это алфавит без пропущенной буквы, значит при каждом рендере он
       другой, сборщик манифеста записывал тот вариант, который ему выпал, а
       ученику выпадал свой — и клипа для него не существовало. В манифесте
       5 класса успело накопиться четыре разных алфавита. Разнообразие между
       упражнениями сохраняем, но внутри одного оно постоянно. */
    let h=0; for(let i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))>>>0;
    const missing=ex.missingFrom[h%ex.missingFrom.length];
    const ctr=el('div','controls');ctr.style.marginTop='0';
    const play=el('button','btn say',PICON+' Слушать алфавит');play.type='button';
    play.dataset.say=ABC.filter(l=>l!==missing).join(', ');play.dataset.label='Слушать алфавит';
    ctr.appendChild(play);body.appendChild(ctr);
    const grid=el('div','abcgrid');
    ABC.forEach(L=>{
      const c=chipEl(L,id,false,'letter radio');
      c.dataset.rg=id;c.dataset.good=(L===missing)?'1':'0';
      grid.appendChild(c);
    });
    body.appendChild(grid);
  },

  /* пары букв на слух */
  pairs(body, ex, id){
    const pool=el('div','pool blue');pool.id='pool-'+id;
    shuffle(ex.rows.flat()).forEach(L=>pool.appendChild(chipEl(L,id,false,'letter')));
    body.appendChild(pool);
    ex.rows.forEach((p,i)=>{
      const row=el('div','speechrow');
      const btn=el('button','btn say small',PICON+' '+(i+1));btn.type='button';
      btn.dataset.say=p[0]+'. '+p[1]+'.';
      row.appendChild(btn);
      row.appendChild(slotEl(id,p[0],null,true));
      row.appendChild(slotEl(id,p[1],null,true));
      body.appendChild(row);
    });
  },

  /* диктовка по буквам */
  spelling(body, ex, id){
    const pool=el('div','pool blue');pool.id='pool-'+id;
    shuffle(ex.words.join('').split('').concat(ex.extra||[])).forEach(L=>pool.appendChild(chipEl(L,id,false,'letter')));
    body.appendChild(pool);
    ex.words.forEach((w,i)=>{
      const row=el('div','speechrow');
      const btn=el('button','btn say small',PICON+' '+(i+1));btn.type='button';
      btn.dataset.say=w.split('').join('. ')+'.';
      row.appendChild(btn);
      w.split('').forEach(L=>row.appendChild(slotEl(id,L,null,true)));
      body.appendChild(row);
    });
  },

  /* циферблаты */
  clocks(body, ex, id){
    const pool=el('div','pool blue');pool.id='pool-'+id;
    shuffle(ex.items.map(d=>d[2]).concat(ex.extra||[])).forEach(v=>pool.appendChild(chipEl(v,id)));
    body.appendChild(pool);
    const grid=el('div','clockgrid');
    ex.items.forEach(d=>{
      const [h,m,phrase]=d;
      const cell=el('div','clockcell');
      const hDeg=((h%12)+m/60)*30, mDeg=m*6;
      cell.innerHTML=`<div class="clock" style="--h:${hDeg}deg;--m:${mDeg}deg">
        <b class="n12">12</b><b class="n3">3</b><b class="n6">6</b><b class="n9">9</b>
        <i class="h"></i><i class="m"></i></div>`;
      cell.appendChild(slotEl(id,phrase,150));
      grid.appendChild(cell);
    });
    body.appendChild(grid);
  },

  /* время в городах мира */
  cities(body, ex, id){
    const pool=el('div','pool blue');pool.id='pool-'+id;
    shuffle(ex.items.map(d=>d[2]).concat(ex.extra||[])).forEach(v=>pool.appendChild(chipEl(v,id)));
    body.appendChild(pool);
    const grid=el('div','citygrid');
    ex.items.forEach(d=>{
      const card=el('div','citycard',`<b>${d[0]}</b><span class="lcd">${d[1]}</span>`);
      card.appendChild(slotEl(id,d[2],146));
      grid.appendChild(card);
    });
    body.appendChild(grid);
  },

  /* телефоны на слух */
  phoneslisten(body, ex, id){
    const target=ex.items[Math.floor(Math.random()*ex.items.length)][0];
    EX[id].target=target;
    const ctr=el('div','controls');ctr.style.marginTop='0';
    const btn=el('button','btn say',PICON+' Слушать время и дату');btn.type='button';
    btn.dataset.say=ex.items.find(d=>d[0]===target)[3];btn.dataset.label='Слушать время и дату';
    ctr.appendChild(btn);body.appendChild(ctr);
    const grid=el('div','phonegrid');
    ex.items.forEach(d=>{
      const c=el('div','chip radio phone');
      c.dataset.ex=id;c.dataset.rg=id;c.dataset.val=d[0];
      c.dataset.good=(d[0]===target)?'1':'0';
      c.innerHTML=`<span class="ptag">${d[0]}</span><span class="ptime">${d[1]}</span><span class="pdate">${d[2]}</span>`;
      grid.appendChild(c);
    });
    body.appendChild(grid);
  },

  /* живой календарь текущего месяца */
  calendar(body, ex, id){
    const now=new Date();
    const y=now.getFullYear(),mo=now.getMonth();
    const box=el('div','calbox');
    box.appendChild(el('h5','',MONTHS[mo]+' '+y));
    const grid=el('div','calgrid');
    ['Mo','Tu','We','Th','Fr','Sa','Su'].forEach(d=>grid.appendChild(el('span','hd',d)));
    const shift=(new Date(y,mo,1).getDay()+6)%7;
    const dim=new Date(y,mo+1,0).getDate();
    for(let i=0;i<shift;i++)grid.appendChild(el('span'));
    for(let d=1;d<=dim;d++){
      const s=el('span','',String(d));
      if(d===now.getDate())s.classList.add('hl');
      grid.appendChild(s);
    }
    box.appendChild(grid);body.appendChild(box);
    const wd=d=>WDAYS[(new Date(y,mo,d).getDay()+6)%7];
    const sfx=d=>d%10===3&&d!==13?'rd':d%10===2&&d!==12?'nd':d%10===1&&d!==11?'st':'th';
    const rows=[
      ...ex.qDates.map(d=>['the '+d+sfx(d),wd(d)]),
      ['Сегодня / Today —',WDAYS[(now.getDay()+6)%7]],
      ['Вчера / Yesterday —',WDAYS[(now.getDay()+5)%7]],
      ['Завтра / Tomorrow —',WDAYS[(now.getDay()+7)%7]]
    ];
    const answers=rows.map(r=>r[1]);
    const pool=el('div','pool blue');pool.id='pool-'+id;
    const extra=WDAYS.filter(w=>!answers.includes(w)).slice(0,2);
    shuffle(answers.concat(extra)).forEach(v=>pool.appendChild(chipEl(v,id)));
    body.appendChild(pool);
    rows.forEach(r=>{
      const row=el('div','objrow');
      row.appendChild(el('span','objtext',r[0]));
      row.appendChild(slotEl(id,r[1],132));
      body.appendChild(row);
    });
  },

  /* таблица грамматики */
  table(body, ex, id){
    const pool=el('div','pool blue');pool.id='pool-'+id;
    shuffle(ex.pool.slice()).forEach(v=>pool.appendChild(chipEl(v,id)));
    body.appendChild(pool);
    const table=el('table','gtable');
    const tb=el('tbody');
    ex.rows.forEach(r=>{
      const tr=el('tr');
      tr.appendChild(el('td','k',r[0]));
      const v=el('td');v.appendChild(slotEl(id,r[1],78,true));tr.appendChild(v);
      tb.appendChild(tr);
    });
    table.appendChild(tb);body.appendChild(table);
  },

  /* ввод с клавиатуры по строкам */
  typed(body, ex, id){
    ex.rows.forEach((d,i)=>{
      const row=el('div','tinrow');
      const lead=el('span','objtext',(i+1)+'&nbsp; '+d.pre+(d.gapline?' ___ '+(d.post||''):''));
      if(d.gapline)lead.style.flexBasis='100%';
      row.appendChild(lead);
      row.appendChild(tinputEl(id,d.ans,d.w||110));
      if(!d.gapline&&d.post)row.appendChild(el('span','objtext',' '+d.post));
      body.appendChild(row);
    });
  },

  /* змейка слов */
  snake(body, ex, id){
    EX[id].words=ex.words;
    body.appendChild(el('div','snake',ex.words.join('')));
    ex.words.forEach((w,i)=>{
      const row=el('div','tinrow');
      row.appendChild(el('span','datenum',String(i+1))).style.cssText='min-width:36px;text-align:center';
      row.appendChild(tinputEl(id,null,170));
      body.appendChild(row);
    });
  },

  /* верни гласные */
  vowels(body, ex, id){
    const pool=el('div','pool');pool.id='pool-'+id;
    shuffle(ex.pool.slice()).forEach(v=>pool.appendChild(chipEl(v,id,false,'letter')));
    body.appendChild(pool);
    ex.rows.forEach((parts,i)=>{
      const row=el('div','objrow');
      row.appendChild(el('span','objtext',String(i+1)));
      parts.forEach(p=>{
        if(Array.isArray(p))row.appendChild(slotEl(id,p[0],null,true));
        else if(p){const s=el('span','objtext',p);s.style.cssText="font-family:Rubik;font-weight:700;font-size:17px";row.appendChild(s)}
      });
      body.appendChild(row);
    });
  },

  /* анкета на слух */
  form(body, ex, id){
    const ctr=el('div','controls');ctr.style.marginTop='0';
    const btn=el('button','btn say',PICON+' Слушать рассказ');btn.type='button';
    btn.dataset.say=ex.speech;btn.dataset.label='Слушать рассказ';
    ctr.appendChild(btn);body.appendChild(ctr);
    ex.fields.forEach(d=>{
      const row=el('div','formrow');
      row.appendChild(el('label','',d[0]+':'));
      row.appendChild(tinputEl(id,d[1],150));
      body.appendChild(row);
    });
  },

  /* пропуски внутри бегущего текста */
  gaptext(body, ex, id){
    const pool=el('div','pool blue');pool.id='pool-'+id;
    shuffle(ex.pool.slice()).forEach(v=>pool.appendChild(chipEl(v,id)));
    body.appendChild(pool);
    const box=el('div','gaptext');
    ex.parts.forEach(p=>{
      if(Array.isArray(p))box.appendChild(slotEl(id,p[0],96,true));
      else box.appendChild(document.createTextNode(p));
    });
    body.appendChild(box);
  },

  /* собери предложение из плашек */
  /* собери предложение: слова уже лежат в строке — переставляй их
     (перетащи в нужное место или нажми два слова, чтобы поменять) */
  build(body, ex, id){
    const reg=EX[id];
    reg.builds=ex.sentences;
    if(ex.trans){
      const ctr=el('div','controls');ctr.style.marginTop='0';
      const tb=el('button','btn','🌐 Перевод');tb.type='button';
      tb.addEventListener('click',()=>{ body.classList.toggle('showtr');
        tb.textContent=body.classList.contains('showtr')?'🌐 Скрыть перевод':'🌐 Перевод'; });
      ctr.appendChild(tb);body.appendChild(ctr);
    }
    ex.sentences.forEach((words,i)=>{
      const row=el('div','bwrow');row.id='bw-'+id+'-'+i;
      row.appendChild(el('span','datenum',String(i+1)));
      derange(words.slice(),words).forEach(w=>{
        const c=el('span','bword',w);c.dataset.val=w;c.dataset.ex=id;
        row.appendChild(c);
      });
      if(ex.trans&&ex.trans[i]){
        const wrap=el('div','bwline');wrap.appendChild(row);
        wrap.appendChild(el('div','rtrans',ex.trans[i]));
        body.appendChild(wrap);
      } else body.appendChild(row);
      rowReorder(row,id,'.bword',true);
    });
  },

  /* перепиши правильно: неверное предложение -> печатаем исправленное.
     Проверка мягкая (dataset.norm): регистр, апострофы и пунктуация прощаются */
  rewrite(body, ex, id){
    ex.items.forEach((it,i)=>{
      const row=el('div','rwrow');
      row.appendChild(el('div','rwwrong',`<span class="x">✗</span>${it.wrong}`));
      const inp=document.createElement('input');
      inp.type='text';inp.className='tinput rw';inp.dataset.ex=id;
      inp.dataset.answer=it.correct;inp.dataset.norm='1';
      inp.autocapitalize='off';inp.autocomplete='off';inp.spellcheck=false;
      inp.placeholder='Напиши правильно…';
      inp.addEventListener('input',()=>clearMarks(id));
      row.appendChild(inp);
      body.appendChild(row);
    });
  },

  /* найди ошибку + исправь */
  finderror(body, ex, id){
    const pool=el('div','pool blue');pool.id='pool-'+id;
    shuffle(ex.pool.slice()).forEach(v=>pool.appendChild(chipEl(v,id)));
    body.appendChild(pool);
    ex.rows.forEach((d,i)=>{
      const row=el('div','radiorow');
      row.appendChild(el('span','objtext',String(i+1)));
      d.words.forEach(w=>{
        const c=chipEl(w,id);
        c.classList.add('radio');c.dataset.rg=id+'-'+i;
        c.dataset.good=(w===d.wrong)?'1':'0';
        row.appendChild(c);
      });
      row.appendChild(el('span','objtext','→'));
      row.appendChild(slotEl(id,d.fix,78,true));
      body.appendChild(row);
    });
  },

  /* верёвочки: соедини пары линиями */
  lines(body, ex, id){
    const reg=EX[id];
    reg.pairs=ex.pairs; reg.conn=[]; reg.locked=false;
    const box=el('div','linesbox');
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class','lsvg');
    box.appendChild(svg);
    const colL=el('div','lcol left'), colR=el('div','lcol right');
    ex.pairs.forEach(p=>{
      const it=el('div','litem',p[0]+'<span class="dotp"></span>');
      it.dataset.side='l';it.dataset.val=p[0];colL.appendChild(it);
    });
    shuffle(ex.pairs.map(p=>p[1])).forEach(v=>{
      const it=el('div','litem',v+'<span class="dotp"></span>');
      it.dataset.side='r';it.dataset.val=v;colR.appendChild(it);
    });
    box.appendChild(colL);box.appendChild(colR);
    body.appendChild(box);
    reg.box=box;reg.svg=svg;
    let sel=null;
    box.addEventListener('click',e=>{
      const it=e.target.closest('.litem');
      if(!it||reg.locked)return;
      clearMarks(id);
      if(sel===it){it.classList.remove('sel');sel=null;return}
      if(!sel||sel.dataset.side===it.dataset.side){
        if(sel)sel.classList.remove('sel');
        sel=it;it.classList.add('sel');
        return;
      }
      const l=sel.dataset.side==='l'?sel:it, r=sel.dataset.side==='l'?it:sel;
      reg.conn=reg.conn.filter(c=>c.l!==l.dataset.val&&c.r!==r.dataset.val);
      reg.conn.push({l:l.dataset.val,r:r.dataset.val,state:''});
      sel.classList.remove('sel');sel=null;
      drawLines(id);
    });
    window.addEventListener('resize',()=>drawLines(id));
  },

  /* пересортировка: перетащи строки в правильный порядок.
     ex.imgs (опционально) — картинки-сцены к строкам, в правильном
     порядке параллельно ex.items (комикс «расставь сцены»);
     ex.trans (опционально) — русский «шёпот-перевод» реплики, параллельно
     ex.items; кнопкой раскрывается подпись под каждой сценой */
  reorder(body, ex, id){
    const reg=EX[id];
    reg.order=ex.items;
    if(ex.trans){
      const ctr=el('div','controls');ctr.style.marginTop='0';
      const tb=el('button','btn','🌐 Перевод');tb.type='button';
      tb.addEventListener('click',()=>{ list.classList.toggle('showtr');
        tb.textContent=list.classList.contains('showtr')?'🌐 Скрыть перевод':'🌐 Перевод'; });
      ctr.appendChild(tb);body.appendChild(ctr);
    }
    var list=el('div','rlist'+(ex.imgs?' pics':''));list.id='rlist-'+id;
    const items=derange(ex.items.slice(),ex.items);
    items.forEach(v=>{
      const i=ex.items.indexOf(v);
      const pic=ex.imgs?`<img src="${ex.imgs[i]}" alt="">`:'';
      const tr=ex.trans?`<div class="rtrans">${ex.trans[i]}</div>`:'';
      // у комикса (картинки-сцены) — кнопка «слушать реплику» голосом персонажа
      const say=ex.imgs?`<button type="button" class="btn say small rsay" data-say="${v.replace(/"/g,'&quot;')}">${PICON}</button>`:'';
      const it=el('div','ritem',pic+`<span>${v}${tr}</span>`+say);
      it.dataset.val=v;it.dataset.ex=id;
      list.appendChild(it);
    });
    body.appendChild(list);
    rowReorder(list,id,'.ritem',false);
    /* картинки-сцены (комикс) → второй шаг: пересказ по картинкам своими
       словами (формат бессловесных историй Picture Stories) */
    if(ex.imgs){
      body.appendChild(el('div','tellstory',
        '🗣️ Расставил по порядку? Теперь <b>расскажи историю по картинкам</b> своими словами.'));
    }
  },

  /* филворд: найди слова в сетке */
  wordsearch(body, ex, id){
    const reg=EX[id];
    const N=ex.size||8;
    const words=ex.words.map(w=>w.toUpperCase());
    reg.words=words; reg.found=[]; reg.locked=false;
    // раскладка слов
    let grid, placements;
    for(let attempt=0;attempt<50;attempt++){
      grid=Array.from({length:N},()=>Array(N).fill(''));
      placements=[];
      let fail=false;
      for(const w of [...words].sort((a,b)=>b.length-a.length)){
        let placed=false;
        for(let t=0;t<80&&!placed;t++){
          const hor=Math.random()<.5;
          const r=Math.floor(Math.random()*(hor?N:N-w.length+1));
          const c=Math.floor(Math.random()*(hor?N-w.length+1:N));
          let okp=true;
          for(let i=0;i<w.length;i++){
            const ch=grid[hor?r:r+i][hor?c+i:c];
            if(ch&&ch!==w[i]){okp=false;break}
          }
          if(!okp)continue;
          const cells=[];
          for(let i=0;i<w.length;i++){
            grid[hor?r:r+i][hor?c+i:c]=w[i];
            cells.push((hor?r:r+i)*N+(hor?c+i:c));
          }
          placements.push({w,cells});
          placed=true;
        }
        if(!placed){fail=true;break}
      }
      if(!fail)break;
    }
    reg.placements=placements;
    const AZ='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(!grid[r][c])grid[r][c]=AZ[Math.floor(Math.random()*26)];
    const g=el('div','wsgrid');g.style.gridTemplateColumns=`repeat(${N},1fr)`;
    const cells=[];
    grid.flat().forEach((ch,i)=>{
      const cell=el('div','wcell',ch);cell.dataset.i=i;
      g.appendChild(cell);cells.push(cell);
    });
    body.appendChild(g);
    const wl=el('div','wswords');
    words.forEach(w=>{
      const s=el('span','wsWord',w);s.dataset.w=w;wl.appendChild(s);
    });
    body.appendChild(wl);
    reg.cells=cells;reg.wl=wl;reg.N=N;
    let anchor=null;
    const clearSel=()=>cells.forEach(c=>c.classList.remove('wsel'));
    reg.wsClear=()=>{anchor=null;clearSel()};
    g.addEventListener('click',e=>{
      const cell=e.target.closest('.wcell');
      if(!cell||reg.locked||cell.classList.contains('wfound'))return;
      const idx=+cell.dataset.i;
      if(anchor===null){anchor=idx;clearSel();cell.classList.add('wsel');return}
      if(idx===anchor){reg.wsClear();return}
      const r1=Math.floor(anchor/N),c1=anchor%N,r2=Math.floor(idx/N),c2=idx%N;
      if(r1!==r2&&c1!==c2){anchor=idx;clearSel();cell.classList.add('wsel');return}
      const run=[];
      if(r1===r2){const [x,y]=[Math.min(c1,c2),Math.max(c1,c2)];for(let c=x;c<=y;c++)run.push(r1*N+c)}
      else{const [x,y]=[Math.min(r1,r2),Math.max(r1,r2)];for(let r=x;r<=y;r++)run.push(r*N+c1)}
      clearSel();run.forEach(i=>cells[i].classList.add('wsel'));
      const s=run.map(i=>cells[i].textContent).join('');
      const rev=[...s].reverse().join('');
      const hit=words.find(w=>(w===s||w===rev)&&!reg.found.includes(w));
      if(hit){
        reg.found.push(hit);
        reg.wsClear();
        run.forEach(i=>cells[i].classList.add('wfound'));
        wl.querySelector(`.wsWord[data-w="${hit}"]`).classList.add('done');
        tts(hit.toLowerCase());
      }
    });
  },

  /* мемори: найди пары */
  memory(body, ex, id){
    const reg=EX[id];
    reg.pairsTotal=ex.pairs.length; reg.found=0; reg.locked=false; reg.open=[];
    const grid=el('div','mgrid');
    const cards=ex.pairs.flatMap((p,i)=>[{t:p[0],p:i},{t:p[1],p:i}]);
    shuffle(cards).forEach(c=>{
      const card=el('div','mcard',`<span>${c.t}</span>`);
      card.dataset.p=c.p;
      grid.appendChild(card);
    });
    body.appendChild(grid);
    reg.grid=grid;
    grid.addEventListener('click',e=>{
      const card=e.target.closest('.mcard');
      if(!card||reg.locked||card.classList.contains('open')||card.classList.contains('mfound'))return;
      card.classList.add('open');
      reg.open.push(card);
      if(reg.open.length===2){
        const [a,b]=reg.open;reg.open=[];
        if(a.dataset.p===b.dataset.p){
          a.classList.add('mfound');b.classList.add('mfound');
          a.classList.remove('open');b.classList.remove('open');
          reg.found++;
          tts(a.querySelector('span').textContent);
        }else{
          reg.locked=true;
          setTimeout(()=>{a.classList.remove('open');b.classList.remove('open');reg.locked=false},750);
        }
      }
    });
  },

  /* ударение: послушай и нажми ударный слог (или ударное слово фразы).
     Чипы — обычные radio-группы, проверка/ответы/сброс общие. */
  stress(body, ex, id){
    ex.rows.forEach((r,i)=>{
      const row=el('div','speechrow');
      const btn=el('button','btn say small',PICON+' '+(i+1));btn.type='button';
      btn.dataset.say=r.say;
      row.appendChild(btn);
      r.parts.forEach((p,k)=>{
        const c=chipEl(p,id,false,'radio');
        c.dataset.rg=id+'-'+i;
        c.dataset.good=(k===r.good)?'1':'0';
        row.appendChild(c);
      });
      body.appendChild(row);
    });
  },

  /* «Скажи по-разному»: одна ситуация — три способа сказать, от вежливого до
     короткого. Это прагматика речи и речевой этикет: та же мысль звучит иначе
     взрослому, другу и продавцу. Реплики раскладываются по слотам-регистрам,
     поэтому проверка идёт общим кодом (.slot). */
  register(body, ex, id){
    const labels=ex.cols||['вежливо','обычно','коротко'];
    const pool=el('div','pool blue');pool.id='pool-'+id;
    const phrases=[];
    (ex.items||[]).forEach(it=>(it.says||[]).forEach(s=>phrases.push(s)));
    shuffle(phrases.slice()).forEach(v=>pool.appendChild(chipEl(v,id)));
    body.appendChild(pool);

    (ex.items||[]).forEach(it=>{
      const box=el('div','regbox');
      box.appendChild(el('div','regsit',it.sit));
      const row=el('div','regrow');
      (it.says||[]).forEach((s,k)=>{
        const cell=el('div','regcell');
        cell.appendChild(el('div','reglab',labels[k]||''));
        if(it.to&&it.to[k])cell.appendChild(el('div','regto',it.to[k]));
        cell.appendChild(slotEl(id,s,null,true));
        row.appendChild(cell);
      });
      box.appendChild(row);
      body.appendChild(box);
    });
    if(ex.ask)body.appendChild(el('div','shask','💬 '+ex.ask));
  },

  /* «Миф или правда»: утверждение звучит убедительно, ученик решает — миф это
     или факт, и только потом открывается объяснение. Выбор сделан .chip.radio,
     поэтому подсчёт баллов общий. */
  myth(body, ex, id){
    (ex.items||[]).forEach((it,i)=>{
      const box=el('div','mybox');
      box.appendChild(el('div','myclaim','«'+it.claim+'»'));
      const pool=el('div','myopts');
      [['МИФ',!!it.myth],['ПРАВДА',!it.myth]].forEach(([lab,good])=>{
        const c=chipEl(lab,id,false,'radio');
        c.dataset.rg=id+'-'+i;c.dataset.good=good?'1':'0';
        pool.appendChild(c);
      });
      box.appendChild(pool);
      const tr=el('div','mytruth',it.truth);
      box.appendChild(tr);
      pool.addEventListener('click',()=>{tr.classList.add('show')});
      body.appendChild(box);
    });
  },

  /* «Так не бывает!»: идиома сначала читается БУКВАЛЬНО (и выходит нелепость),
     потом ищется настоящий смысл. Понимание переносного значения — отдельная
     веха развития речи, она проседает у детей с речевыми трудностями, поэтому
     контраст «буквально ↔ на самом деле» даётся явно. Выбор смысла сделан
     обычными .chip.radio, поэтому проверка идёт общим кодом. */
  idiom(body, ex, id){
    (ex.items||[]).forEach((it,i)=>{
      const box=el('div','idbox');
      const head=el('div','idhead');
      head.appendChild(el('span','idphrase',it.idiom));
      if(it.say!==false){
        const say=el('button','btn say small',PICON);say.type='button';
        say.dataset.say=it.idiom;head.appendChild(say);
      }
      box.appendChild(head);
      const lit=el('div','idlit','🙃 Буквально: '+it.lit);
      if(it.pic){
        /* Картинка буквального прочтения. Такой кадр нельзя взять в фотобанке —
           «одолжить своё ухо» никто не сфотографирует, — поэтому это единственное
           место в курсе, где картинка обязательно рисованная. Файла может не быть
           (юниты озвучиваются и иллюстрируются волнами) — тогда блок просто
           исчезает, текст остаётся на месте. */
        const row=el('div','idlitrow');
        const img=document.createElement('img');
        img.className='idpic';img.src=it.pic;img.alt='';img.loading='lazy';
        /* Миниатюра рядом с текстом мелкая, а нелепость в деталях — поэтому
           по нажатию картинка разворачивается во всю ширину блока. */
        img.title='Нажми, чтобы разглядеть';
        img.addEventListener('click',function(){row.classList.toggle('big');});
        img.onerror=function(){row.classList.add('nopic');};
        row.appendChild(img);row.appendChild(lit);
        box.appendChild(row);
      } else box.appendChild(lit);
      const q=el('div','idq','А на самом деле?');
      box.appendChild(q);
      const pool=el('div','idopts');
      (it.options||[]).forEach(o=>{
        const c=chipEl(o[0],id,false,'radio');
        c.dataset.rg=id+'-'+i;
        c.dataset.good=o[1]?'1':'0';
        pool.appendChild(c);
      });
      box.appendChild(pool);
      if(it.ex)box.appendChild(el('div','idex','«'+it.ex+'»'));
      body.appendChild(box);
    });
  },

  /* «Одно слово — другой смысл»: в предложении один слот, в него по очереди
     встают разные слова, и каждое ПОВОРАЧИВАЕТ смысл. Верного ответа здесь нет —
     задание учит, что грамматика это выбор, а не ярлык. Поэтому балл начисляется
     за исследование: открыл все варианты — увидел все сдвиги. */
  shift(body, ex, id){
    const reg=EX[id];
    reg.seen={};reg.totalOpts=(ex.options||[]).length;

    const line=el('div','shline');
    const pre=el('span','',(ex.sentence||'').split('{}')[0]||'');
    const slot=el('span','shslot','_____');
    const post=el('span','',(ex.sentence||'').split('{}')[1]||'');
    line.appendChild(pre);line.appendChild(slot);line.appendChild(post);
    body.appendChild(line);

    const pool=el('div','shpool');
    const note=el('div','shnote','');
    (ex.options||[]).forEach((o,i)=>{
      const c=el('button','shopt',o.w);c.type='button';
      c.onclick=()=>{
        [...pool.children].forEach(x=>x.classList.remove('on'));
        c.classList.add('on');
        slot.textContent=o.w;
        note.innerHTML='<b>'+o.w+'</b> — '+o.mean;
        note.classList.add('show');
        if(!reg.seen[i]){reg.seen[i]=1;reg.opened=Object.keys(reg.seen).length}
      };
      pool.appendChild(c);
    });
    body.appendChild(pool);
    body.appendChild(note);
    if(ex.ask)body.appendChild(el('div','shask','💬 '+ex.ask));
    reg.opened=0;
    reg.opts=ex.options||[];
    reg.slot=slot;reg.note=note;reg.pool=pool;
  },

  /* ритм-решётка: фраза раскладывается по тактам и долям (такт = четыре счёта).
     Ученик считает слоги в каждой доле, кнопка ▶ отбивает счёт и подсвечивает
     долю за долей — под неё читают вслух. Счёт слогов идёт обычными .tinput,
     поэтому проверка и «Ответы» работают общим кодом, без правок checkEx. */
  metre(body, ex, id){
    const reg=EX[id];
    const bpm=ex.bpm||84;
    const cells=[];

    const bar=el('div','mtbar');
    const play=el('button','btn say small','▶ бит');play.type='button';
    const cnt=el('span','mtcount','');
    bar.appendChild(play);bar.appendChild(cnt);
    if(ex.chant)bar.appendChild(el('span','mthint',ex.chant));
    body.appendChild(bar);

    (ex.bars||[]).forEach((b,bi)=>{
      const row=el('div','mtrow');
      row.appendChild(el('div','mtlabel',(bi+1)+'-й такт'));
      const grid=el('div','mtcells');
      (b.cells||[]).forEach((c,ci)=>{
        const cell=el('div','mtcell');
        cell.appendChild(el('div','mtbeat',String(ci+1)));
        cell.appendChild(el('div','mtword',c.w||'·'));
        const nb=el('div','mtn');
        nb.appendChild(el('span','mtnlab','слогов'));
        nb.appendChild(tinputEl(id,String(c.n),44));
        cell.appendChild(nb);
        grid.appendChild(cell);
        cells.push(cell);
      });
      row.appendChild(grid);
      body.appendChild(row);
    });

    /* метроном: короткий щелчок через Web Audio, сильная доля выше по тону.
       В jsdom AudioContext нет — молча пропускаем, разметка от этого не страдает. */
    let ac=null;
    const tick=strong=>{
      try{
        ac=ac||new (window.AudioContext||window.webkitAudioContext)();
        const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;
        o.frequency.value=strong?1500:950;
        g.gain.setValueAtTime(0.0001,t);
        g.gain.exponentialRampToValueAtTime(0.35,t+0.005);
        g.gain.exponentialRampToValueAtTime(0.0001,t+0.09);
        o.connect(g);g.connect(ac.destination);
        o.start(t);o.stop(t+0.1);
      }catch(_){}
    };
    let timer=null,step=0;
    const stop=()=>{
      if(timer){clearInterval(timer);timer=null}
      cells.forEach(c=>c.classList.remove('now'));
      cnt.textContent='';play.innerHTML='▶ бит';
    };
    const start=()=>{
      step=0;play.innerHTML='■ стоп';
      const beat=()=>{
        cells.forEach(c=>c.classList.remove('now'));
        const c=cells[step%cells.length];
        if(c)c.classList.add('now');
        const inBar=step%4;
        cnt.textContent=String(inBar+1);
        tick(inBar===0);
        step++;
        if(step>=cells.length){setTimeout(stop,60000/bpm)}
      };
      beat();
      timer=setInterval(beat,60000/bpm);
    };
    play.onclick=()=>{timer?stop():start()};
    reg.stopBeat=stop;
  },

  /* анаграмма: собери слово из букв */
  /* анаграмма: буквы слова уже в строке — переставь их по порядку */
  anagram(body, ex, id){
    const reg=EX[id];
    reg.builds=ex.items.map(it=>String(it[0]).split(''));
    ex.items.forEach((it,i)=>{
      const word=String(it[0]),hint=it[1]||'';
      const row=el('div','bwrow anag');row.id='bw-'+id+'-'+i;
      row.appendChild(el('div','objtext',`${i+1}&nbsp; <i>${hint}</i>`));
      /* буквы — неразрывной лентой в одну строку (ужимаются на узких экранах) */
      const strip=el('div','bletters');
      derange(word.split(''),word.split('')).forEach(L=>{
        const c=el('span','bword letter',L);c.dataset.val=L;c.dataset.ex=id;
        strip.appendChild(c);
      });
      row.appendChild(strip);
      body.appendChild(row);
      rowReorder(strip,id,'.bword',true);
    });
  },

  /* hotspot: подпиши точки на картинке */
  hotspot(body, ex, id){
    const pool=el('div','pool');pool.id='pool-'+id;
    shuffle(ex.spots.map(s=>s[2]).concat(ex.extra||[])).forEach(v=>pool.appendChild(chipEl(v,id)));
    body.appendChild(pool);
    const wrap=el('div','hotwrap');
    const img=el('img');img.src=ex.img;img.alt='';
    wrap.appendChild(img);
    const letters='abcdefgh';
    ex.spots.forEach((s,i)=>{
      const w=el('div','wslot');w.style.left=s[0]+'%';w.style.top=s[1]+'%';
      w.appendChild(el('span','tag',letters[i]));
      w.appendChild(slotEl(id,s[2],96));
      wrap.appendChild(w);
    });
    body.appendChild(wrap);
  },

  /* диктант: услышь и напечатай предложение */
  dictation(body, ex, id){
    ex.items.forEach((sent,i)=>{
      const row=el('div','tinrow');
      const btn=el('button','btn say small',PICON+' '+(i+1));btn.type='button';
      btn.dataset.say=sent;
      row.appendChild(btn);
      const inp=tinputEl(id,sent,null);
      inp.dataset.norm='1';
      inp.style.flex='1';inp.style.minWidth='200px';
      row.appendChild(inp);
      body.appendChild(row);
    });
  },

  /* подсветка: нажми нужные слова в тексте */
  highlight(body, ex, id){
    const reg=EX[id];
    const set=new Set(ex.answers.map(a=>a.toLowerCase()));
    reg.hlSet=set;
    const box=el('div','hltext');
    let totalGood=0;
    ex.text.split(' ').forEach(tok=>{
      const clean=tok.toLowerCase().replace(/[^a-zа-яё'’]/gi,'');
      const good=set.has(clean);
      if(good)totalGood++;
      const s=el('span','hword',tok);
      s.dataset.good=good?'1':'0';
      s.addEventListener('click',()=>{
        if(reg.locked)return;
        clearMarks(id);
        s.classList.toggle('on');
      });
      box.appendChild(s);
      box.appendChild(document.createTextNode(' '));
    });
    reg.hlTotal=totalGood;
    body.appendChild(box);
  },

  /* диалог-симулятор */
  dialog(body, ex, id){
    const reg=EX[id];
    reg.steps=ex.steps; reg.total=ex.steps.length;
    const box=el('div','dlg');body.appendChild(box);
    function play(auto){
      box.innerHTML='';reg.i=0;reg.good=0;reg.locked=!!auto;
      const step=()=>{
        if(reg.i>=reg.steps.length)return;
        const st=reg.steps[reg.i];
        box.appendChild(el('div','dbub dbot',st.bot));
        tts(st.bot);
        if(auto){
          const right=st.options.find(o=>o[1]);
          box.appendChild(el('div','dbub duser',right[0]));
          reg.good++;reg.i++;step();
          return;
        }
        const opts=el('div','dopts');
        shuffle(st.options.slice()).forEach(o=>{
          const b=el('button','btn'+(0?'':''),o[0]);b.type='button';
          b.addEventListener('click',()=>{
            opts.remove();
            const u=el('div','dbub duser'+(o[1]?'':' wrong'),o[0]);
            box.appendChild(u);
            if(o[1]){reg.good++;tts(o[0])}
            reg.i++;setTimeout(step,500);
          });
          opts.appendChild(b);
        });
        box.appendChild(opts);
      };
      step();
    }
    reg.play=play;
    play(false);
  },

  /* кроссворд */
  crossword(body, ex, id){
    const reg=EX[id];
    const cellmap={};let maxR=0,maxC=0;
    ex.words.forEach((wd,wi)=>{
      const w=wd.w.toUpperCase();
      for(let i=0;i<w.length;i++){
        const r=wd.dir==='down'?wd.r+i:wd.r;
        const c=wd.dir==='down'?wd.c:wd.c+i;
        const k=r+'_'+c;
        cellmap[k]={ch:w[i],num:(i===0?(cellmap[k]&&cellmap[k].num)||wi+1:(cellmap[k]||{}).num)};
        maxR=Math.max(maxR,r);maxC=Math.max(maxC,c);
      }
    });
    const g=el('div','cwgrid');
    g.style.gridTemplateColumns=`repeat(${maxC+1},1fr)`;
    const inputs={};
    for(let r=0;r<=maxR;r++)for(let c=0;c<=maxC;c++){
      const k=r+'_'+c;
      if(!cellmap[k]){g.appendChild(el('div'));continue}
      const wrap=el('div','cwcellwrap');
      if(cellmap[k].num)wrap.appendChild(el('span','cwnum',String(cellmap[k].num)));
      const inp=document.createElement('input');
      inp.className='tinput cwcell';inp.dataset.ex=id;inp.dataset.answer=cellmap[k].ch;inp.dataset.k=k;
      inp.maxLength=1;inp.autocapitalize='characters';inp.autocomplete='off';inp.spellcheck=false;
      inp.addEventListener('input',()=>{inp.classList.remove('ok','bad');
        const sc=document.getElementById('score-'+id);if(sc)sc.className='score';
        const st=document.getElementById('stamp-'+id);if(st)st.classList.remove('show');
        if(inp.value&&inp.dataset.nextKey){
          const nx=inputs[inp.dataset.nextKey];
          if(nx)nx.focus();
        }});
      inputs[k]=inp;
      wrap.appendChild(inp);
      g.appendChild(wrap);
    }
    // цепочки перескока: сперва вертикальные, потом горизонтальные (across в приоритете на пересечениях)
    [...ex.words].sort((a,b)=>(a.dir==='down'?-1:1)-(b.dir==='down'?-1:1)).forEach(wd=>{
      const w=wd.w.toUpperCase();
      for(let i=0;i<w.length-1;i++){
        const r=wd.dir==='down'?wd.r+i:wd.r, c=wd.dir==='down'?wd.c:wd.c+i;
        const nr=wd.dir==='down'?r+1:r, nc=wd.dir==='down'?c:c+1;
        inputs[r+'_'+c].dataset.nextKey=nr+'_'+nc;
      }
    });
    body.appendChild(g);
    const clues=el('div','cwclues');
    ex.words.forEach((wd,wi)=>{
      clues.appendChild(el('div','',`<b>${wi+1} ${wd.dir==='down'?'↓':'→'}</b> ${wd.clue}`));
    });
    body.appendChild(clues);
  },

  /* флеш-карточки с самооценкой */
  flashcards(body, ex, id){
    const reg=EX[id];
    reg.total=ex.cards.length;
    const wrap=el('div','fwrap');
    const card=el('div','fcard');
    const prog=el('div','fprog');
    const btns=el('div','controls');btns.style.justifyContent='center';
    const knowB=el('button','btn check','Знал');knowB.type='button';
    const againB=el('button','btn reset','Ещё раз');againB.type='button';
    btns.appendChild(knowB);btns.appendChild(againB);
    wrap.appendChild(card);wrap.appendChild(prog);wrap.appendChild(btns);
    body.appendChild(wrap);
    function start(){
      reg.deck=shuffle(ex.cards.slice());
      reg.missed=new Set();reg.good=0;reg.doneCount=0;reg.finished=false;
      show();
    }
    function show(){
      btns.style.visibility='hidden';
      if(!reg.deck.length){
        reg.finished=true;
        card.className='fcard done';
        card.textContent=`Готово! С первого раза: ${reg.good} из ${reg.total}`;
        prog.textContent='';
        return;
      }
      const c=reg.deck[0];
      card.className='fcard';card.textContent=c[0];
      prog.textContent=`осталось: ${reg.deck.length} · нажми карточку, чтобы перевернуть`;
      card.onclick=()=>{
        if(card.classList.contains('back'))return;
        card.classList.add('back');card.textContent=c[1];
        tts(c[0]);
        btns.style.visibility='visible';
      };
      knowB.onclick=()=>{
        if(!reg.missed.has(c[0]))reg.good++;
        reg.deck.shift();show();
      };
      againB.onclick=()=>{
        reg.missed.add(c[0]);
        reg.deck.push(reg.deck.shift());show();
      };
    }
    reg.start=start;
    start();
  },

  /* говорение: скажи фразу */
  speaking(body, ex, id){
    const reg=EX[id];
    reg.total=ex.items.length;reg.res=[];
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    const MIC='<svg class="picon" viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/></svg>';
    const norm=s=>s.toLowerCase().replace(/[^a-z'’ ]/g,'').replace(/\s+/g,' ').trim();
    ex.items.forEach((phrase,i)=>{
      const row=el('div','spkrow');
      row.appendChild(el('span','phrase',(i+1)+'. '+phrase));
      const listen=el('button','btn say small',PICON+' Послушать');listen.type='button';listen.dataset.say=phrase;
      row.appendChild(listen);
      const stat=el('span','spkstat','');
      if(SR){
        const mic=el('button','btn say small',MIC+' Сказать');mic.type='button';
        mic.addEventListener('click',()=>{
          stat.className='spkstat';stat.textContent='слушаю…';
          const r=new SR();r.lang='en-GB';r.maxAlternatives=3;
          r.onresult=e=>{
            const alts=[...e.results[0]].map(a=>norm(a.transcript));
            const hit=alts.includes(norm(phrase));
            reg.res[i]=hit;
            stat.className='spkstat '+(hit?'ok':'bad');
            stat.textContent=hit?'✓ отлично сказано':'✗ попробуй ещё: '+(alts[0]||'');
          };
          r.onerror=()=>{stat.className='spkstat bad';stat.textContent='не расслышал, ещё раз'};
          r.start();
        });
        row.appendChild(mic);
      }
      const self=el('button','btn','Я сказал');self.type='button';
      self.addEventListener('click',()=>{
        reg.res[i]=true;
        stat.className='spkstat ok';stat.textContent='✓ отмечено';
      });
      row.appendChild(self);
      row.appendChild(stat);
      body.appendChild(row);
    });
    if(!SR)body.appendChild(el('div','fprog','Распознавание речи на этом устройстве недоступно — произнеси фразу вслух и нажми «Я сказал».'));
  },

  /* СИМУЛЯЦИЯ: поставь стрелки часов */
  clockset(body, ex, id){
    const reg=EX[id];
    reg.items=ex.items;                       // [[фраза, час, минуты]]
    reg.set=ex.items.map(()=>({h:12,m:0}));
    const grid=el('div','clockgrid');
    ex.items.forEach((it,i)=>{
      const cell=el('div','clockcell');
      cell.appendChild(el('div','clocktask',it[0]));
      const c=el('div','clock setable');
      c.style.setProperty('--h','0deg');
      c.style.setProperty('--m','0deg');
      c.innerHTML='<b class="n12">12</b><b class="n3">3</b><b class="n6">6</b><b class="n9">9</b><i class="h"></i><i class="m"></i>';
      for(let t=0;t<12;t++){
        const tick=el('span','tick');
        tick.style.transform=`rotate(${t*30}deg)`;
        c.appendChild(tick);
      }
      const read=el('div','clockread','12:00');
      cell.appendChild(c);cell.appendChild(read);
      grid.appendChild(cell);

      const show=()=>{
        const s=reg.set[i];
        c.style.setProperty('--h',((s.h%12)*30)+'deg');
        c.style.setProperty('--m',(s.m*6)+'deg');
        read.textContent=String(s.h).padStart(2,'0')+':'+String(s.m).padStart(2,'0');
      };
      reg['show'+i]=show;

      let dragging=null, clkRaf=false, clkPt=null;
      const angleAt=e=>{
        const r=c.getBoundingClientRect();
        const dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2);
        let a=Math.atan2(dx,-dy)*180/Math.PI;
        if(a<0)a+=360;
        return {a,dist:Math.hypot(dx,dy)/(r.width/2)};
      };
      const move=e=>{
        if(!dragging)return;
        const {a}=angleAt(e);
        const s=reg.set[i];
        if(dragging==='h'){
          let h=Math.round(a/30)%12; s.h=h===0?12:h;
        }else{
          s.m=(Math.round(a/30)*5)%60;    // шаг 5 минут
        }
        show();
      };
      c.addEventListener('pointerdown',e=>{
        if(reg.locked)return;
        e.preventDefault();
        const {dist}=angleAt(e);
        dragging=dist<0.55?'h':'m';       // ближе к центру — часовая, дальше — минутная
        c.setPointerCapture(e.pointerId);
        clearMarks(id);                   // один раз на старте, не на каждом кадре
        move(e);
      });
      // угол пересчитываем не чаще кадра — иначе на 120 Гц pointermove тормозит
      c.addEventListener('pointermove',e=>{
        if(!dragging)return; e.preventDefault();
        clkPt=e;
        if(!clkRaf){clkRaf=true;requestAnimationFrame(()=>{clkRaf=false;if(dragging&&clkPt)move(clkPt)});}
      });
      c.addEventListener('pointerup',()=>{dragging=null});
      c.addEventListener('pointercancel',()=>{dragging=null});
      show();
    });
    body.appendChild(grid);
    reg.cells=[...grid.children];
  },

  /* СИМУЛЯЦИЯ: закажи в кафе и посчитай сдачу */
  shop(body, ex, id){
    const reg=EX[id];
    reg.need=ex.need; reg.basket=[]; reg.menu=ex.menu; reg.money=ex.money;
    reg.change=ex.money-ex.menu.filter(m=>ex.need.includes(m[0])).reduce((s,m)=>s+m[1],0);
    const wrap=el('div','shopwrap');
    wrap.appendChild(el('div','shoptask',ex.task));
    const menu=el('div','menu');
    ex.menu.forEach(m=>{
      const it=el('div','menuitem',`<span>${m[0]}</span><span class="price">£${m[1]}</span>`);
      it.dataset.item=m[0];
      it.addEventListener('click',()=>{
        if(reg.locked)return;
        clearMarks(id);
        const i=reg.basket.indexOf(m[0]);
        if(i===-1)reg.basket.push(m[0]); else reg.basket.splice(i,1);
        it.classList.toggle('inbasket',reg.basket.includes(m[0]));
        draw();
      });
      menu.appendChild(it);
    });
    wrap.appendChild(menu);
    const basket=el('div','basket');
    wrap.appendChild(basket);
    const totalRow=el('div','shoptotal','<span>Total</span>');
    const sum=el('span','sum','£0');
    totalRow.appendChild(sum);
    wrap.appendChild(totalRow);
    const changeRow=el('div','formrow');
    changeRow.appendChild(el('label','',`Your change from £${ex.money}:`));
    const inp=tinputEl(id,String(reg.change),90);
    changeRow.appendChild(inp);
    wrap.appendChild(changeRow);
    body.appendChild(wrap);
    reg.menuEls=[...menu.children];
    function draw(){
      basket.innerHTML='';
      if(!reg.basket.length){basket.textContent='Корзина пуста — нажми на то, что нужно заказать.';return}
      let s=0;
      reg.basket.forEach(name=>{
        const price=ex.menu.find(m=>m[0]===name)[1];
        s+=price;
        basket.appendChild(el('div','basketline',`<span>${name}</span><span>£${price}</span>`));
      });
      sum.textContent='£'+s;
    }
    reg.draw=draw;
    draw();
  },

  /* СИМУЛЯЦИЯ: поставь погоду слайдером и одень персонажа */
  dressup(body, ex, id){
    const reg=EX[id];
    reg.target=ex.target; reg.need=ex.need; reg.worn=[]; reg.temp=ex.start!==undefined?ex.start:10;
    const wrap=el('div','dsswrap');
    wrap.appendChild(el('div','shoptask',ex.task));
    const row=el('div','dssslider');
    const inp=document.createElement('input');
    inp.type='range';inp.min='-20';inp.max='30';inp.step='5';inp.value=String(reg.temp);
    const temp=el('div','dsstemp');
    row.appendChild(el('span','dssdesc','−20°'));
    row.appendChild(inp);
    row.appendChild(el('span','dssdesc','+30°'));
    wrap.appendChild(row);
    wrap.appendChild(temp);
    const scene=el('div','dssscene');
    const fig=el('div','dssfig',ex.who||'Sasha');
    const worn=el('div','dssworn');
    scene.appendChild(fig);scene.appendChild(worn);
    wrap.appendChild(scene);
    const pool=el('div','pool');pool.id='pool-'+id;
    shuffle(ex.pool.slice()).forEach(v=>{
      const c=chipEl(v,id);
      c.classList.add('toggle');
      c.addEventListener('click',()=>{
        if(reg.locked)return;
        clearMarks(id);
        const i=reg.worn.indexOf(v);
        if(i===-1)reg.worn.push(v); else reg.worn.splice(i,1);
        c.classList.toggle('on',reg.worn.includes(v));
        drawWorn();
      });
      pool.appendChild(c);
    });
    wrap.appendChild(pool);
    body.appendChild(wrap);
    reg.pool=pool; reg.slider=inp;
    function weather(t){
      if(t<=-10)return['It is very cold and snowy.','cold'];
      if(t<=5)return['It is cold and windy.','cold'];
      if(t<=15)return['It is cool and rainy.','warm'];
      if(t<=24)return['It is warm and sunny.','warm'];
      return['It is hot and sunny!','hot'];
    }
    function drawTemp(){
      reg.temp=Number(inp.value);
      const [txt,cls]=weather(reg.temp);
      temp.textContent=(reg.temp>0?'+':'')+reg.temp+'°C';
      scene.className='dssscene '+cls;
      fig.textContent=(ex.who||'Sasha');
      scene.querySelector('.dssdesc-live')||scene.appendChild(el('div','dssdesc-live'));
      let live=scene.querySelector('.dssdesc-live');
      live.className='dssdesc-live dssdesc';
      live.textContent=txt;
    }
    function drawWorn(){
      worn.innerHTML='';
      reg.worn.forEach(w=>worn.appendChild(el('span','chip small',w)));
    }
    inp.addEventListener('input',()=>{if(reg.locked)return;clearMarks(id);drawTemp()});
    reg.drawTemp=drawTemp; reg.drawWorn=drawWorn;
    drawTemp();drawWorn();
  },

  /* СИМУЛЯЦИЯ: собери маршрут по городу */
  maproute(body, ex, id){
    const reg=EX[id];
    reg.seq=[]; reg.sol=ex.solution; reg.ex=ex;
    const wrap=el('div','mapwrap');
    wrap.appendChild(el('div','shoptask',ex.task));
    const grid=el('div','mapgrid');
    grid.style.gridTemplateColumns=`repeat(${ex.grid},1fr)`;
    const cells={};
    for(let y=0;y<ex.grid;y++)for(let x=0;x<ex.grid;x++){
      const c=el('div','mapcell');
      const b=ex.buildings.find(b=>b.cell[0]===x&&b.cell[1]===y);
      if(b){c.classList.add('bld');c.textContent=b.name;if(b.name===ex.target)c.classList.add('target')}
      cells[x+'_'+y]=c;grid.appendChild(c);
    }
    const pawn=el('div','pawn','▲');
    cells[ex.start[0]+'_'+ex.start[1]].appendChild(pawn);
    wrap.appendChild(grid);
    const status=el('div','mapstatus','');
    wrap.appendChild(status);
    const seq=el('div','mapseq');
    wrap.appendChild(seq);
    const cmds=el('div','mapcmds');
    ex.commands.forEach(cmd=>{
      const b=el('button','btn',cmd);b.type='button';
      b.addEventListener('click',()=>{
        if(reg.locked)return;
        clearMarks(id);status.textContent='';status.className='mapstatus';
        reg.seq.push(cmd);drawSeq();
      });
      cmds.appendChild(b);
    });
    wrap.appendChild(cmds);
    body.appendChild(wrap);
    function drawSeq(){
      seq.innerHTML='';
      reg.seq.forEach((c,i)=>{
        const s=el('span','seqchip',(i+1)+'. '+c);
        s.addEventListener('click',()=>{
          if(reg.locked)return;
          reg.seq.splice(i,1);drawSeq();
        });
        seq.appendChild(s);
      });
    }
    reg.drawSeq=drawSeq;
    reg.walk=function(animate){
      const DIRS={N:[0,-1],E:[1,0],S:[0,1],W:[-1,0]};
      const ORDER=['N','E','S','W'];
      let x=ex.start[0],y=ex.start[1],d=ex.dir;
      const path=[];
      reg.seq.forEach(cmd=>{
        const c=cmd.toLowerCase();
        if(c.indexOf('left')>-1)d=ORDER[(ORDER.indexOf(d)+3)%4];
        else if(c.indexOf('right')>-1)d=ORDER[(ORDER.indexOf(d)+1)%4];
        else{
          const nx=x+DIRS[d][0], ny=y+DIRS[d][1];
          if(nx>=0&&ny>=0&&nx<ex.grid&&ny<ex.grid){x=nx;y=ny}
        }
        path.push({x,y,d});
      });
      const ROT={N:'0deg',E:'90deg',S:'180deg',W:'270deg'};
      if(animate&&path.length){
        let i=0;
        const step=()=>{
          if(i>=path.length)return;
          const p=path[i++];
          cells[p.x+'_'+p.y].appendChild(pawn);
          pawn.style.transform='rotate('+ROT[p.d]+')';
          setTimeout(step,260);
        };
        step();
      }else{
        const last=path.length?path[path.length-1]:{x:ex.start[0],y:ex.start[1],d:ex.dir};
        cells[last.x+'_'+last.y].appendChild(pawn);
        pawn.style.transform='rotate('+ROT[last.d]+')';
      }
      const t=ex.buildings.find(b=>b.name===ex.target).cell;
      const arrived=(path.length?path[path.length-1].x:ex.start[0])===t[0]&&(path.length?path[path.length-1].y:ex.start[1])===t[1];
      status.textContent=reg.seq.length?(arrived?'Пришли! Это '+ex.target+'.':'Мы не там — попробуй другой маршрут.'):'';
      status.className='mapstatus '+(reg.seq.length?(arrived?'ok':'bad'):'');
      return arrived;
    };
    reg.reset=function(){
      cells[ex.start[0]+'_'+ex.start[1]].appendChild(pawn);
      pawn.style.transform='rotate(0deg)';
      status.textContent='';status.className='mapstatus';
    };
  },

  /* СЛОЁНЫЙ РАЗБОР: раздай словам роли */
  dissect(body, ex, id){
    const reg=EX[id];
    reg.words=ex.words; reg.tag={}; reg.roles=ex.roles;
    let active=ex.roles[0][0];
    const roles=el('div','dsroles');
    ex.roles.forEach(r=>{
      const b=el('div','dsrole',r[1]);
      b.dataset.role=r[0];
      b.style.borderColor=COLORS[r[2]];
      b.addEventListener('click',()=>{
        active=r[0];
        [...roles.children].forEach(x=>{
          x.classList.remove('on');x.style.background='#fff';x.style.color='';
        });
        b.classList.add('on');b.style.background=COLORS[r[2]];b.style.color='#fff';
      });
      roles.appendChild(b);
    });
    body.appendChild(roles);
    roles.firstChild.click();
    const sent=el('div','dssent');
    ex.words.forEach((w,i)=>{
      const s=el('span','dsword',w[0]);
      s.dataset.i=i;
      s.addEventListener('click',()=>{
        if(reg.locked)return;
        clearMarks(id);
        if(reg.tag[i]===active){delete reg.tag[i];paint(s,null)}
        else{reg.tag[i]=active;paint(s,active)}
      });
      sent.appendChild(s);
    });
    body.appendChild(sent);
    reg.sentEl=sent;
    function paint(s,role){
      if(!role){s.classList.remove('tagged');s.style.background='#fff';return}
      const r=ex.roles.find(r=>r[0]===role);
      s.classList.add('tagged');s.style.background=COLORS[r[2]];
    }
    reg.paint=paint;
  },

  /* СИМУЛЯЦИЯ: шкала дня — тяни ползунок и читай, что происходит в этот час */
  timeline(body, ex, id){
    const reg=EX[id];
    reg.rounds=ex.rounds; reg.set=ex.rounds.map(()=>ex.min);
    reg.rows=[];
    ex.rounds.forEach((r,i)=>{
      const row=el('div','tlrow');
      row.appendChild(el('div','tlask',(i+1)+'. Найди время: '+r[0]));
      const line=el('div','tlline');
      const inp=document.createElement('input');
      inp.type='range';inp.min=String(ex.min);inp.max=String(ex.max);inp.step='1';inp.value=String(ex.min);
      const clock=el('div','tlclock');
      line.appendChild(el('span','tlsent',ex.min+':00'));
      line.appendChild(inp);
      line.appendChild(clock);
      row.appendChild(line);
      const sent=el('div','tlsent');
      row.appendChild(sent);
      body.appendChild(row);
      const draw=()=>{
        const h=Number(inp.value);
        reg.set[i]=h;
        clock.textContent=String(h).padStart(2,'0')+':00';
        sent.textContent=ex.day[String(h)]||'';
      };
      inp.addEventListener('input',()=>{if(reg.locked)return;clearMarks(id);draw()});
      reg.rows.push({row,inp,draw});
      draw();
    });
  },

  /* Writing File: письмо как процесс — образец, план, свободный текст, чек-лист.
     Единственная механика без «правильного ответа»: балл складывается из
     самопроверки (галочки чек-листа) и порога длины. Текст живёт в localStorage
     с ключом от пути колоды — у каждого класса свой (правило раздельных ключей
     прогресса). Кнопка «Ответы» кладёт в поле ОБРАЗЕЦ с пометкой — показать
     пример, а не написать за ученика. */
  write(body, ex, id){
    const reg=EX[id];
    reg.min=ex.min||40; reg.checksN=(ex.checks||[]).length;
    const key='wf_'+location.pathname+'#'+id;
    reg.lsKey=key; reg.sample=ex.model||'';
    const mbox=el('div','wfmodel');
    mbox.appendChild(el('div','wfmtag','Образец · '+(ex.modelBy||'model text')));
    mbox.appendChild(el('div','wfmtext',ex.model));
    body.appendChild(mbox);
    if(ex.plan&&ex.plan.length){
      const pl=el('div','wfplan');
      pl.appendChild(el('b','','План — подумай перед письмом:'));
      ex.plan.forEach(q=>pl.appendChild(el('div','wfq','• '+q)));
      body.appendChild(pl);
    }
    const ta=document.createElement('textarea');
    ta.className='wfta';ta.rows=7;ta.placeholder='Пиши здесь по-английски…';
    ta.spellcheck=false;
    try{ta.value=localStorage.getItem(key)||''}catch(e){}
    reg.ta=ta;
    const cnt=el('div','wfcount','');
    const wc=t=>(t.trim().match(/[A-Za-z'’-]+/g)||[]).length;
    reg.wc=wc;
    const draw=()=>{const n=wc(ta.value);
      cnt.textContent='слов: '+n+' · нужно не меньше '+reg.min;
      cnt.classList.toggle('enough',n>=reg.min);};
    ta.addEventListener('input',()=>{clearMarks(id);draw();
      try{localStorage.setItem(key,ta.value)}catch(e){}});
    body.appendChild(ta);body.appendChild(cnt);draw();
    const cl=el('div','wfchecks');
    cl.appendChild(el('b','','Проверь себя и отметь:'));
    reg.boxes=[];
    (ex.checks||[]).forEach(c=>{
      const lab=el('label','wfcheck');
      const cb=document.createElement('input');cb.type='checkbox';
      cb.addEventListener('change',()=>clearMarks(id));
      lab.appendChild(cb);lab.appendChild(el('span','',c));
      reg.boxes.push(cb);cl.appendChild(lab);
    });
    body.appendChild(cl);
  },

  /* семейное дерево */
  tree(body, ex, id){
    const pool=el('div','pool');pool.id='pool-'+id;
    shuffle(ex.rows.flat().map(n=>n[2]).filter(Boolean)).forEach(v=>pool.appendChild(chipEl(v,id)));
    body.appendChild(pool);
    const tree=el('div','tree');
    ex.rows.forEach(rowData=>{
      const row=el('div','trow');
      rowData.forEach(n=>{
        const node=el('div','tnode'+(n[1]==='f'?' f':''),(n[3]?`<img class="tav" src="${n[3]}" alt="">`:'')+`<b>${n[0]}</b>`);
        if(n[2])node.appendChild(slotEl(id,n[2],104));
        else node.appendChild(el('small','',ex.meLabel||'me'));
        row.appendChild(node);
      });
      tree.appendChild(row);
    });
    body.appendChild(tree);
  }
};

function drawLines(id){
  const reg=EX[id];if(!reg||!reg.svg)return;
  const svg=reg.svg,box=reg.box;
  svg.innerHTML='';
  const bb=box.getBoundingClientRect();
  box.querySelectorAll('.litem').forEach(i=>i.classList.remove('linked'));
  reg.conn.forEach(c=>{
    const li=box.querySelector(`.litem[data-side="l"][data-val="${CSS.escape(c.l)}"]`);
    const ri=box.querySelector(`.litem[data-side="r"][data-val="${CSS.escape(c.r)}"]`);
    if(!li||!ri)return;
    li.classList.add('linked');ri.classList.add('linked');
    const a=li.getBoundingClientRect(),b=ri.getBoundingClientRect();
    const x1=a.right-bb.left+2,y1=a.top-bb.top+a.height/2;
    const x2=b.left-bb.left-2,y2=b.top-bb.top+b.height/2;
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d',`M ${x1} ${y1} C ${x1+40} ${y1}, ${x2-40} ${y2}, ${x2} ${y2}`);
    p.setAttribute('fill','none');
    p.setAttribute('stroke',c.state==='ok'?'#2E9E57':c.state==='bad'?'#E23B3B':'#2F6BDB');
    p.setAttribute('stroke-width','3.5');p.setAttribute('stroke-linecap','round');
    svg.appendChild(p);
  });
}

/* ===================================================================
   СТАТИЧЕСКИЕ БЛОКИ
   =================================================================== */
const BLOCKS = {
  rule(p){ return el('div','vocab'+(p.style==='blue'?' bluev':p.style==='orange'?' orangev':p.style==='green'?' greenv':''),`<b>${p.title}</b>`) },
  sub(p){ return el('div','subhead'+(p.style==='blue'?' b':''),p.text) },
  img(p){ const i=el('img','photo'+(p.spot?' spot':''));i.src=p.src;i.alt='';if(p.w)i.style.width=p.w;return i },
  photorow(p){
    const r=el('div','photorow');
    r.style.cssText='display:flex;gap:8px;flex-wrap:nowrap;margin:10px 0';
    p.srcs.forEach(s=>{
      const i=el('img','photo');i.src=s;
      i.style.cssText='width:calc(50% - 4px);min-width:0;max-width:none;object-fit:cover;border-radius:12px;margin:0';
      r.appendChild(i);
    });
    return r;
  },
  refpanel(p){ return el('div','refpanel',p.html) },
  culture(p){ return el('div','culture',`<h4>${p.title}</h4><p>${p.text}</p>`) },
  readcard(p){
    const wrap=el('div');
    const card=el('div','readcard',p.text);
    wrap.appendChild(card);
    /* КЛЮЧЕВЫЕ СЛОВА. Маленький список слов, которым учит именно этот текст:
       ученик видит, что вынести, а учитель — что спрашивать. Слова НЕ
       переводим: перевод убивает догадку по контексту, ради которой текст и
       читается. */
    if(p.keys&&p.keys.length){
      const box=el('div','keybox');
      box.appendChild(el('b','','Key words'));
      const list=el('div','keylist');
      p.keys.forEach(k=>list.appendChild(el('span','keyword',k)));
      box.appendChild(list);
      wrap.appendChild(box);
    }
    if(p.listen){
      const ctr=el('div','controls');ctr.style.marginTop='6px';
      const btn=el('button','btn say',PICON+' Слушать текст');btn.type='button';
      btn.dataset.say=p.text;btn.dataset.label='Слушать текст';
      ctr.appendChild(btn);wrap.appendChild(ctr);
    }
    return wrap;
  },
  totalbar(p){
    const bar=el('div','totalbar');
    const btn=el('button','btn check','Проверить всю страницу');btn.type='button';
    const out=el('b','','Итог: — / '+p.total);
    btn.addEventListener('click',()=>{
      let g=0,t=0;
      p.ex.forEach(exid=>{checkEx(exid);g+=lastScore[exid][0];t+=lastScore[exid][1]});
      out.textContent=`Итог: ${g} / ${t}`;
    });
    bar.appendChild(btn);bar.appendChild(out);
    return bar;
  },
  chain(p){
    const box=el('div','chainbox');
    box.appendChild(el('div','chaintitle',p.title));
    if(p.intro)box.appendChild(el('div','chainintro',p.intro));
    const ids=p.steps.map(s=>s.id);
    const cards=[];
    const meta={ids,cards,outro:p.outro};
    p.steps.forEach((s,i)=>{
      const card=BLOCKS.ex(s);
      card.classList.add('chainstep');
      if(i>0)card.classList.add('locked');
      box.appendChild(card);cards.push(card);
      CHAIN[s.id]=Object.assign({idx:i},meta);
    });
    const foot=el('div','chainfoot','Шаг 1 из '+ids.length);
    box.appendChild(foot);
    meta.foot=foot;
    ids.forEach(i2=>CHAIN[i2].foot=foot);
    return box;
  },
  ex(p){
    EX[p.id]={type:p.type};
    const card=el('div','ex');card.id=p.id;
    const tag=el('div','ex-tag');
    tag.appendChild(el('span','ex-num'+(p.numStyle==='blue'?' b':''),p.num));
    if(p.audio)tag.appendChild(el('span','ex-hand',HEADICON));
    card.appendChild(tag);
    let title=p.title;
    if(p.titleSay)title+=` <button class="btn say small" type="button" data-say="${p.titleSay}">${PICON} ${p.titleSayLabel||'Фразы'}</button>`;
    if(p.note)title+=` <span class="hand">${p.note}</span>`;
    card.appendChild(el('div','ex-title',title+(p.en?`<em>${p.en}</em>`:'')));
    if(p.wordbox)buildWordbox(card,p.wordbox);
    /* p.img — иллюстрация к заданию. У hotspot та же картинка И ЕСТЬ поле игры
       (её рисует сама механика, поверх неё встают точки), поэтому здесь её не
       повторяем: раньше фото выводилось дважды — сверху мелкое, ниже рабочее. */
    if(p.img&&p.type!=='hotspot'){const i=el('img','photo spot');i.src=p.img;if(p.imgW)i.style.width=p.imgW;card.appendChild(i)}
    if(p.photorow)card.appendChild(BLOCKS.photorow({srcs:p.photorow}));
    EXTYPES[p.type](card,p,p.id);
    const ctr=el('div','controls');
    if(p.timer){
      const tb=el('button','btn say','На время');tb.type='button';
      const tout=el('span','score');
      const reg0=EX[p.id];
      reg0.tStop=(won)=>{
        if(reg0.tint){clearInterval(reg0.tint);reg0.tint=null}
        if(!won){tout.className='score'}
      };
      tb.addEventListener('click',()=>{
        resetEx(p.id);
        let left=p.timer;
        reg0.tStart=left;
        tout.className='score show mid';tout.textContent='0:'+String(left).padStart(2,'0');
        if(reg0.tint)clearInterval(reg0.tint);
        reg0.tint=setInterval(()=>{
          left--;reg0.tLeft=left;
          if(left<=0){reg0.tStop(false);tout.className='score show low';tout.textContent='время вышло';return}
          tout.textContent='0:'+String(left).padStart(2,'0');
        },1000);
        reg0.tLeft=left;reg0.tout=tout;
      });
      ctr.appendChild(tb);ctr.appendChild(tout);
    }
    [['check','Проверить','btn check'],['ans','Ответы','btn'],['reset','Сбросить','btn reset']].forEach(b=>{
      const btn=el('button',b[2],b[1]);btn.type='button';btn.dataset[b[0]]=p.id;
      ctr.appendChild(btn);
    });
    const sc=el('span','score');sc.id='score-'+p.id;
    ctr.appendChild(sc);
    card.appendChild(ctr);
    const st=el('div','stamp','Отлично!');st.id='stamp-'+p.id;
    card.appendChild(st);
    return card;
  }
};

/* ===================================================================
   РЕНДЕР СТРАНИЦ
   =================================================================== */
const COURSE_PLAN=[
 ['6 класс · A2 — план',[
  'Starter · Повторение 5 класса',
  'Тема 1 · День за днём — Present Simple, наречия частоты',
  'Тема 2 · Мой дом — there is/are, Present Continuous',
  'Тема 3 · Активная жизнь — can, have to / must',
  'Тема 4 · В дороге — Past Simple: was/were и правильные глаголы',
  'Тема 5 · Истории жизни — Past Continuous',
  'Тема 6 · Еда! — some/any, much/many, should',
  'Тема 7 · В дикой природе — be going to, will',
  'Тема 8 · Наше общество — степени сравнения',
  'Тема 9 · Умные покупки — Present Perfect',
  'Тема 10 · Большие идеи — пассив, условные 0 и 1'
 ]],
 ['7 класс · A2+ — жду оглавление',[]],
 ['8 класс · B1 — жду оглавление',[]]
];
const rail=document.getElementById('rail');
let PAGES=0;
const pageMeta=[];

function renderUnit(unit){
  unit.pages.forEach(page=>{
    const sheet=el('section','sheet');
    page.blocks.forEach(b=>{ if(b.t==='ex'&&b.id) exUnit[b.id]=unit.unit; sheet.appendChild(BLOCKS[b.t](b)); });
    const rule=page.blocks.find(b=>b.t==='rule');
    const sub=page.blocks.find(b=>b.t==='sub');
    pageMeta.push({num:page.num,unit:unit.unit,label:(rule?rule.title:'')+(sub?' · '+sub.text:'')});
    const side=(page.num%2===1)?'left':'right';
    sheet.appendChild(el('div','pagenum '+side,String(page.num)));
    sheet.appendChild(el('div','unitname '+side,unit.unit));
    rail.appendChild(sheet);
    PAGES++;
  });
}

/* ===================================================================
   DRAG / TAP ENGINE + ПРОВЕРКА (общие для всех механик)
   =================================================================== */
let selected=null, drag=null, dragRaf=false, dragPt=null;
/* Общий флаг «сейчас что-то тащат»: его ставят ОБА механизма перетаскивания —
   и чипы, и строки «расставь по порядку». Нужен один на всех, потому что
   глушение прокрутки должно работать в любом из них. */
window.__engDragging=false;
const lastScore={};

/* ===================================================================
   ПЛАТФОРМА: прогресс упражнений + итог ДЗ (офлайн, без сервера)
   Отдельный ключ колоды (BOOK_PROGRESS_KEY, напр. eng5_prog) — НЕ трогает
   eng5_progress_v1 (словарь приложения). Экран «Итог» даёт код результата
   и QR — подтверждение ДЗ для учителя.
   =================================================================== */
const PROG_KEY = (typeof window!=='undefined' && window.BOOK_PROGRESS_KEY) || 'engbook_prog';
const exUnit = {};            // exId -> название юнита
function unitNo(title){ if(/домашн/i.test(title||''))return 'HW'; const m=(title||'').match(/(\d+)/); return m?m[1]:(/starter/i.test(title||'')?'0':'?'); }
function dateStamp(){ const d=new Date(); return (''+(d.getMonth()+1)).padStart(2,'0')+(''+d.getDate()).padStart(2,'0'); }
function loadProg(){ try{return JSON.parse(localStorage.getItem(PROG_KEY))||{};}catch(e){return {};} }
function saveProgEx(ex,g,t){ try{const p=loadProg(); p[ex]={g:g,t:t,u:exUnit[ex]||'',d:dateStamp()}; localStorage.setItem(PROG_KEY,JSON.stringify(p));}catch(e){} }
function chksum(s){ let h=2166136261; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;} return ('0000'+h.toString(16)).slice(-4).toUpperCase(); }
function unitResult(unitTitle){ const p=loadProg(); let g=0,t=0,done=0,tot=0; Object.keys(exUnit).forEach(id=>{ if(exUnit[id]===unitTitle){ tot++; if(p[id]){g+=p[id].g;t+=p[id].t;done++;} } }); return {g,t,done,tot,n:unitNo(unitTitle)}; }
function resultCode(n,g,t){ const d=dateStamp(); const tag=n==='HW'?'HW':'U'+n; return `ENG5·${tag}·${g}/${t}·${d}·${chksum(n+'|'+g+'|'+t+'|'+d+'|obr')}`; }

/* режим ДЗ: index.html?hw=ex1,ex2,… — виртуальная страница только с выбранными
   упражнениями (конструктор ДЗ учителя собирает такую ссылку) */
function buildHwUnit(units, ids){
  const byId={}, pageOf={};
  units.forEach(u=>u.pages.forEach(pg=>pg.blocks.forEach(b=>{ if(b.t==='ex'&&b.id){byId[b.id]=b; pageOf[b.id]=pg;} })));
  const blocks=[]; const usedRead=new Set();
  ids.forEach(id=>{
    const b=byId[id]; if(!b) return;
    const rc=(pageOf[id].blocks||[]).find(x=>x.t==='readcard');
    if(rc && !usedRead.has(rc)){ usedRead.add(rc); blocks.push(rc); }
    blocks.push(b);
  });
  return {unit:'Домашнее задание', pages:[{num:1, blocks:[{t:'rule',style:'orange',title:'Домашнее задание'}].concat(blocks)}]};
}

function initEngine(){
  document.querySelectorAll('.pool').forEach(p=>p.querySelectorAll('.chip').forEach(c=>c.dataset.home=p.id));
}
function homeOf(chip){return document.getElementById(chip.dataset.home)}
/* Панель комикса во весь экран. В строке она помещается только маленькой, а
   разглядеть рисунок и прочитать реплику в облачке на 116 пикселях нельзя. */
function openLightbox(src,cap){
  const old=document.querySelector('.lbox');if(old)old.remove();
  const box=el('div','lbox');
  const img=el('img');img.src=src;img.alt='';
  box.appendChild(img);
  if(cap)box.appendChild(el('div','lcap',cap));
  const close=()=>box.remove();
  box.addEventListener('pointerup',close);
  document.addEventListener('keydown',function esc(ev){
    if(ev.key==='Escape'){close();document.removeEventListener('keydown',esc)}
  });
  document.body.appendChild(box);
}
function clearMarks(ex){
  const root=document.getElementById(ex);
  if(!root)return;
  const reg=EX[ex];
  if(reg&&reg.conn){reg.conn.forEach(c=>c.state='');drawLines(ex)}
  root.querySelectorAll('.litem,.ritem').forEach(i=>i.classList.remove('ok','bad'));
  root.querySelectorAll('.watchwhy').forEach(w=>w.classList.remove('show'));
  root.querySelectorAll('.bword').forEach(w=>w.classList.remove('ok','bad'));
  root.querySelectorAll('.hword').forEach(s=>s.classList.remove('okw','badw'));
  root.querySelectorAll('.clockcell').forEach(c=>c.classList.remove('ok','bad'));
  root.querySelectorAll('.tlrow').forEach(c=>c.classList.remove('ok','bad'));
  root.querySelectorAll('.dsword').forEach(c=>c.classList.remove('okw','badw'));
  root.querySelectorAll('input[type=range]').forEach(c=>c.classList.remove('ok'));
  root.querySelectorAll('.menuitem').forEach(c=>c.classList.remove('ok-chip','bad-chip'));
  root.querySelectorAll('.slot').forEach(s=>s.classList.remove('ok','bad'));
  root.querySelectorAll('input.tinput').forEach(i=>i.classList.remove('ok','bad'));
  root.querySelectorAll('.chip').forEach(c=>c.classList.remove('ok-chip','bad-chip','locked'));
  const sc=document.getElementById('score-'+ex);if(sc)sc.className='score';
  const st=document.getElementById('stamp-'+ex);if(st)st.classList.remove('show');
}
function place(chip,target){
  clearMarks(chip.dataset.ex);
  if(target.classList.contains('slot')){
    const old=target.querySelector('.chip');
    if(old)homeOf(old).appendChild(old);
    target.appendChild(chip);
  }else{target.appendChild(chip)}
  markExActive(chip.dataset.ex);
}
function markExActive(ex){
  document.querySelectorAll('.ex').forEach(e=>e.classList.remove('active-ex'));
  const e=document.getElementById(ex);if(e)e.classList.add('active-ex');
}
document.addEventListener('pointerdown',e=>{
  const chip=e.target.closest('.chip');
  if(!chip||chip.classList.contains('toggle')||chip.classList.contains('radio')||chip.classList.contains('locked'))return;
  e.preventDefault();
  drag={chip,startX:e.clientX,startY:e.clientY,moved:false,fly:null};
},{passive:false});
document.addEventListener('pointermove',e=>{
  if(!drag)return;
  const dx=e.clientX-drag.startX,dy=e.clientY-drag.startY;
  if(!drag.moved&&Math.hypot(dx,dy)>7){
    drag.moved=true;
    const r=drag.chip.getBoundingClientRect();
    drag.fly=drag.chip.cloneNode(true);
    drag.fly.classList.add('flying');
    drag.fly.style.left='0';drag.fly.style.top='0';
    drag.fly.style.translate=r.left+'px '+r.top+'px';
    drag.fly.style.width=r.width+'px';
    document.body.appendChild(drag.fly);
    window.__engDragging=true;
    drag.chip.classList.add('ghost');
    drag.offX=e.clientX-r.left;drag.offY=e.clientY-r.top;
  }
  if(drag.moved){
    // позиционирование призрака и поиск слота под пальцем — не чаще кадра
    // (иначе на 120 Гц pointermove тормозит, как раньше в «расставь по порядку»)
    dragPt={x:e.clientX,y:e.clientY};
    if(!dragRaf){dragRaf=true;requestAnimationFrame(dragFrame);}
  }
},{passive:false});
/* СТРАНИЦА НЕ ДОЛЖНА ЕХАТЬ, ПОКА ТАЩИМ. На iOS preventDefault у pointerdown
   прокрутку не отменяет: браузер ведёт свой touch-жест параллельно. Летящая
   копия привязана к экрану (position:fixed), а страница под ней уползает —
   и слово «улетает» от слотов, которые в этот момент двигаются. touch-action
   у самого чипа этого не покрывает: жест мог начаться на строке или на
   картинке. Поэтому пока драг активен, глушим touchmove целиком. */
document.addEventListener('touchmove',e=>{
  if(window.__engDragging)e.preventDefault();
},{passive:false});

function dragFrame(){
  dragRaf=false;
  if(!drag||!drag.moved||!drag.fly||!dragPt)return;
  drag.fly.style.translate=(dragPt.x-drag.offX)+'px '+(dragPt.y-drag.offY)+'px';
  highlightUnder(dragPt.x,dragPt.y,drag.chip);
}
function underPoint(x,y,chip){
  const t=document.elementFromPoint(x,y);if(!t)return null;
  const slot=t.closest('.slot'),bin=t.closest('.bucket');
  if(slot&&slot.dataset.ex===chip.dataset.ex)return slot;
  if(bin&&bin.dataset.ex===chip.dataset.ex)return bin.querySelector('.bin');
  const pool=t.closest('.pool');
  if(pool&&pool.id===chip.dataset.home)return pool;
  return null;
}
function highlightUnder(x,y,chip){
  document.querySelectorAll('.slot.hover,.bucket.hover').forEach(n=>n.classList.remove('hover'));
  const t=underPoint(x,y,chip);
  if(!t)return;
  if(t.classList.contains('slot'))t.classList.add('hover');
  else if(t.classList.contains('bin'))t.closest('.bucket').classList.add('hover');
}
document.addEventListener('pointerup',e=>{
  if(!drag)return;
  document.querySelectorAll('.slot.hover,.bucket.hover').forEach(n=>n.classList.remove('hover'));
  const {chip,moved,fly}=drag;
  if(moved){
    fly.remove();chip.classList.remove('ghost');
    const t=underPoint(e.clientX,e.clientY,chip);
    if(t)place(chip,t);
  }else{
    if(selected===chip){chip.classList.remove('selected');selected=null}
    else{
      if(selected)selected.classList.remove('selected');
      selected=chip;chip.classList.add('selected');markExActive(chip.dataset.ex);
      tts(chip.dataset.val);
    }
  }
  drag=null;window.__engDragging=false;
});
/* палец ушёл за край экрана или пришёл системный жест — драг обрывается, и
   флаг надо снять, иначе прокрутка останется заглушенной на всей странице */
document.addEventListener('pointercancel',()=>{
  if(drag&&drag.fly)drag.fly.remove();
  if(drag)drag.chip.classList.remove('ghost');
  drag=null;window.__engDragging=false;
});
const PAUSEICON='<svg class="picon" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>';
let speakCur=null;
function speakBtnIcon(btn,playing){
  if(btn.dataset.label===undefined)btn.dataset.label=btn.textContent.trim();
  btn.innerHTML=(playing?PAUSEICON:PICON)+(btn.dataset.label?' '+btn.dataset.label:'');
}
document.addEventListener('click',e=>{
  const say=e.target.closest('[data-say]');
  if(say){
    const url=clipUrl(say.dataset.say);
    // повторный тап по той же кнопке — пауза/продолжить
    if(speakCur&&speakCur.btn===say){
      if(speakCur.state==='playing'){
        if(speakCur.audio){try{speakCur.audio.pause()}catch(_){}}else{try{speechSynthesis.pause()}catch(_){}}
        speakCur.state='paused';speakBtnIcon(say,false);
      }else{
        if(speakCur.audio){try{speakCur.audio.play()}catch(_){}}else{try{speechSynthesis.resume()}catch(_){}}
        speakCur.state='playing';speakBtnIcon(say,true);
      }
      return;
    }
    if(speakCur)speakBtnIcon(speakCur.btn,false);
    if(url){
      try{speechSynthesis.cancel()}catch(_){}
      const a=playClip(url,()=>{if(speakCur&&speakCur.btn===say){speakBtnIcon(say,false);speakCur=null}});
      speakCur={btn:say,state:'playing',audio:a};
      speakBtnIcon(say,true);
      return;
    }
    try{
      stopClip();
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(say.dataset.say);
      u.lang='en-GB';u.rate=0.92;
      const v=speechSynthesis.getVoices().find(v=>v.lang.startsWith('en'));
      if(v)u.voice=v;
      u.onend=()=>{if(speakCur&&speakCur.btn===say){speakBtnIcon(say,false);speakCur=null}};
      speechSynthesis.speak(u);
      speakCur={btn:say,state:'playing',audio:null};
      speakBtnIcon(say,true);
    }catch(_){}
    return;
  }
  const rc=e.target.closest('.chip.radio');
  if(rc&&!rc.classList.contains('locked')){
    clearMarks(rc.dataset.ex);
    document.querySelectorAll(`.chip.radio[data-rg="${rc.dataset.rg}"]`).forEach(c=>c.classList.remove('on'));
    rc.classList.add('on');markExActive(rc.dataset.ex);
    tts(rc.dataset.val);
    return;
  }
  const b=e.target.closest('.btn');
  if(b){
    if(b.dataset.check)return checkEx(b.dataset.check);
    if(b.dataset.ans)return answersEx(b.dataset.ans);
    if(b.dataset.reset)return resetEx(b.dataset.reset);
  }
  if(!selected)return;
  if(e.target.closest('.chip')===selected)return;
  const t=underPoint(e.clientX,e.clientY,selected);
  if(t){
    selected.classList.remove('selected');
    place(selected,t);
    selected=null;
  }
});

/* ---------- проверка / ответы / сброс ---------- */
function setScore(ex,good,total,noStamp){
  lastScore[ex]=[good,total];
  const regT=EX[ex];
  if(regT&&regT.hinted)noStamp=true;
  if(regT&&regT.tint&&good===total&&!noStamp){
    regT.tStop(true);
    regT.tout.className='score show good';
    regT.tout.textContent='успел за '+(regT.tStart-regT.tLeft)+' с';
  }
  const sc=document.getElementById('score-'+ex);
  sc.textContent=good+' из '+total;
  sc.className='score show '+(good===total?'good':good>=total/2?'mid':'low');
  if(good===total&&!noStamp)document.getElementById('stamp-'+ex).classList.add('show');
  if(CHAIN[ex])chainUpdate(ex);
  saveProgEx(ex,good,total);
}
function chainUpdate(exId){
  const m=CHAIN[exId];
  if(m.cards[m.idx+1])m.cards[m.idx+1].classList.remove('locked');
  const done=m.ids.filter(i=>lastScore[i]);
  const g=done.reduce((s,i)=>s+lastScore[i][0],0);
  const t=done.reduce((s,i)=>s+lastScore[i][1],0);
  m.foot.textContent=done.length<m.ids.length
    ? `Шаг ${Math.min(done.length+1,m.ids.length)} из ${m.ids.length} · пока ${g} из ${t}`
    : `Цепочка пройдена: ${g} из ${t}`;
  if(done.length===m.ids.length&&m.outro&&!m.foot.nextSibling){
    m.foot.parentElement.appendChild(el('div','chainoutro',m.outro));
  }
}
function checkEx(ex){
  clearMarks(ex);
  const root=document.getElementById(ex);
  let good=0,total=0;
  const reg=EX[ex]||{};
  if(reg.answers){ // toggle
    const chips=[...root.querySelectorAll('.chip.toggle')];
    total=reg.answers.length;
    chips.forEach(c=>{
      const on=c.classList.contains('on'),should=reg.answers.includes(c.dataset.val);
      if(on&&should){c.classList.add('ok-chip');good++}
      else if(on&&!should)c.classList.add('bad-chip');
    });
    setScore(ex,good,total);return;
  }
  if(reg.type==='wordsearch'){
    setScore(ex,reg.found.length,reg.words.length);return;
  }
  if(reg.type==='memory'){
    setScore(ex,reg.found,reg.pairsTotal);return;
  }
  /* письмо: балл = галочки самопроверки + порог длины (правильного текста нет) */
  if(reg.type==='write'){
    total=reg.checksN+1;
    good=reg.boxes.filter(b=>b.checked).length+(reg.wc(reg.ta.value)>=reg.min?1:0);
    reg.ta.classList.toggle('ok',reg.wc(reg.ta.value)>=reg.min);
    setScore(ex,good,total);return;
  }
  /* «Одно слово — другой смысл»: верного ответа нет, балл — за исследование */
  if(reg.type==='shift'){
    setScore(ex,reg.opened||0,reg.totalOpts||0);return;
  }
  /* Диалог-конструктор: верного сочетания нет, балл — за то, что ученик
     перебрал слоты и прочитал диалог по-новому */
  if(reg.type==='swap'){
    setScore(ex,reg.opened||0,reg.totalSlots||0);return;
  }
  if(reg.type==='timeline'){
    total=reg.rounds.length;
    reg.rounds.forEach((r,i)=>{
      const okr=Number(reg.rows[i].inp.value)===r[1];
      reg.rows[i].row.classList.add(okr?'ok':'bad');
      if(okr)good++;
    });
    setScore(ex,good,total);return;
  }
  if(reg.type==='dressup'){
    total=reg.need.length+1;
    if(Number(reg.slider.value)===reg.target){good++;reg.slider.classList.add('ok')}
    let extra=0;
    reg.pool.querySelectorAll('.chip').forEach(c=>{
      const v=c.dataset.val;
      if(reg.worn.includes(v)){
        if(reg.need.includes(v)){c.classList.add('ok-chip');good++}
        else {c.classList.add('bad-chip');extra++}
      }
    });
    good=Math.max(0,good-extra);
    setScore(ex,good,total);return;
  }
  if(reg.type==='maproute'){
    setScore(ex,reg.walk(true)?1:0,1);return;
  }
  if(reg.type==='dissect'){
    total=reg.words.length;
    reg.words.forEach((w,i)=>{
      const s=reg.sentEl.children[i];
      if(reg.tag[i]===w[1]){s.classList.add('okw');good++}
      else s.classList.add('badw');
    });
    setScore(ex,good,total);return;
  }
  if(reg.type==='clockset'){
    total=reg.items.length;
    reg.items.forEach((it,i)=>{
      const s=reg.set[i];
      const okc=(s.h===it[1]&&s.m===it[2]);
      reg.cells[i].classList.add(okc?'ok':'bad');
      if(okc)good++;
    });
    setScore(ex,good,total);return;
  }
  if(reg.type==='shop'){
    total=reg.need.length+1;
    let extra=0;
    reg.menuEls.forEach(el2=>{
      const name=el2.dataset.item;
      if(reg.basket.includes(name)){
        if(reg.need.includes(name)){el2.classList.add('ok-chip');good++}
        else {el2.classList.add('bad-chip');extra++}
      }
    });
    good=Math.max(0,good-extra);          // лишнее в корзине снимает балл
    const inp=root.querySelector('input.tinput');
    if(inp.value.trim().replace('£','')===String(reg.change)){inp.classList.add('ok');good++}
    else inp.classList.add('bad');
    setScore(ex,good,total);return;
  }
  if(reg.type==='dialog'){
    setScore(ex,reg.good,reg.total);return;
  }
  if(reg.type==='flashcards'){
    setScore(ex,reg.finished?reg.good:0,reg.total);return;
  }
  if(reg.type==='speaking'){
    setScore(ex,reg.res.filter(Boolean).length,reg.total);return;
  }
  if(reg.type==='highlight'){
    const words=[...root.querySelectorAll('.hword')];
    total=reg.hlTotal;
    words.forEach(s=>{
      const on=s.classList.contains('on');
      if(on&&s.dataset.good==='1'){s.classList.add('okw');good++}
      else if(on)s.classList.add('badw');
    });
    setScore(ex,good,total);return;
  }
  if(reg.type==='lines'){
    total=reg.pairs.length;
    const box=reg.box;
    reg.pairs.forEach(p=>{
      const c=reg.conn.find(c=>c.l===p[0]);
      const li=box.querySelector(`.litem[data-side="l"][data-val="${CSS.escape(p[0])}"]`);
      if(c&&c.r===p[1]){c.state='ok';good++}
      else if(c){c.state='bad'}
      else if(li)li.classList.add('bad');
    });
    drawLines(ex);setScore(ex,good,total);return;
  }
  if(reg.builds){
    root.querySelectorAll('.bwrow').forEach((row,ri)=>{
      const ws=[...row.querySelectorAll('.bword')];
      total+=ws.length;
      ws.forEach((w,i)=>{
        if(w.dataset.val===reg.builds[ri][i]){w.classList.add('ok');good++}
        else w.classList.add('bad');
      });
    });
    setScore(ex,good,total);return;
  }
  if(reg.order){
    const rows=[...root.querySelectorAll('.ritem')];
    total=rows.length;
    rows.forEach((r,i)=>{
      if(r.dataset.val===reg.order[i]){r.classList.add('ok');good++}
      else r.classList.add('bad');
    });
    setScore(ex,good,total);return;
  }
  const inputs=[...root.querySelectorAll('input.tinput')];
  if(inputs.length){
    total=inputs.length;
    const used=new Set();
    inputs.forEach(inp=>{
      const v=inp.value.trim().toLowerCase();
      const ap=s=>s.replace(/’/g,"'");
      const norm=s=>ap(s).toLowerCase().replace(/[^a-zа-яё0-9' ]/gi,'').replace(/\s+/g,' ').trim();
      const okAns=inp.dataset.answer
        ? (inp.dataset.norm?norm(inp.value)===norm(inp.dataset.answer):ap(v)===ap(inp.dataset.answer.toLowerCase()))
        : (v&&reg.words&&reg.words.includes(v)&&!used.has(v));
      if(okAns){used.add(v);inp.classList.add('ok');good++}
      else inp.classList.add('bad');
    });
    setScore(ex,good,total);return;
  }
  const radios=[...root.querySelectorAll('.chip.radio')];
  if(radios.length){
    const groups=[...new Set(radios.map(c=>c.dataset.rg))];
    total+=groups.length;
    groups.forEach(g=>{
      const sel=radios.find(c=>c.dataset.rg===g&&c.classList.contains('on'));
      if(sel){
        if(sel.dataset.good==='1'){sel.classList.add('ok-chip');good++}
        else sel.classList.add('bad-chip');
      }
    });
  }
  const slots=[...root.querySelectorAll('.slot')];
  if(slots.length){
    total+=slots.length;
    slots.forEach(s=>{
      const c=s.querySelector('.chip');
      if(c&&c.dataset.val===s.dataset.answer){s.classList.add('ok');good++}
      else s.classList.add('bad');
    });
  }
  const buckets=[...root.querySelectorAll('.bucket')];
  if(buckets.length){
    const chips=[...root.querySelectorAll('.chip')];
    total+=chips.length;
    chips.forEach(c=>{
      const b=c.closest('.bucket');
      if(b&&b.dataset.col===c.dataset.col){c.classList.add('ok-chip');good++}
      else c.classList.add('bad-chip');
    });
  }
  /* «Осторожно!»: объяснение открывается ТОЛЬКО после проверки. Если показать
     его сразу, ученик прочитает и не заметит, что сам говорит иначе. */
  root.querySelectorAll('.watchwhy').forEach(w=>w.classList.add('show'));
  setScore(ex,good,total);
}
function answersEx(ex){
  clearMarks(ex);
  const root=document.getElementById(ex);
  const reg=EX[ex]||{};
  reg.hinted=true;
  if(reg.answers){
    root.querySelectorAll('.chip.toggle').forEach(c=>{
      c.classList.toggle('on',reg.answers.includes(c.dataset.val));
      c.classList.add('locked');
      if(reg.answers.includes(c.dataset.val))c.classList.add('ok-chip');
    });
    setScore(ex,reg.answers.length,reg.answers.length,true);return;
  }
  if(reg.type==='dialog'){
    reg.play(true);
    setScore(ex,reg.total,reg.total,true);return;
  }
  if(reg.type==='write'){
    reg.ta.value='(пример) '+reg.sample;
    try{localStorage.setItem(reg.lsKey,reg.ta.value)}catch(e){}
    reg.ta.dispatchEvent(new Event('input'));
    reg.boxes.forEach(b=>{b.checked=true});
    setScore(ex,reg.checksN+1,reg.checksN+1,true);return;
  }
  if(reg.type==='flashcards'){
    reg.deck=[];reg.finished=true;reg.good=reg.total;
    const card=root.querySelector('.fcard');
    card.className='fcard done';card.textContent='Все карточки открыты';
    setScore(ex,reg.total,reg.total,true);return;
  }
  if(reg.type==='speaking'){
    reg.res=Array(reg.total).fill(true);
    root.querySelectorAll('.spkstat').forEach(s=>{s.className='spkstat ok';s.textContent='✓'});
    setScore(ex,reg.total,reg.total,true);return;
  }
  if(reg.type==='timeline'){
    reg.rounds.forEach((r,i)=>{
      reg.rows[i].inp.value=String(r[1]);
      reg.rows[i].draw();
      reg.rows[i].row.classList.add('ok');
    });
    reg.locked=true;
    setScore(ex,reg.rounds.length,reg.rounds.length,true);return;
  }
  if(reg.type==='dressup'){
    reg.slider.value=String(reg.target);reg.drawTemp();
    reg.worn=reg.need.slice();
    reg.pool.querySelectorAll('.chip').forEach(c=>{
      const inN=reg.need.includes(c.dataset.val);
      c.classList.toggle('on',inN);
      if(inN)c.classList.add('ok-chip');
    });
    reg.drawWorn();reg.locked=true;
    setScore(ex,reg.need.length+1,reg.need.length+1,true);return;
  }
  if(reg.type==='maproute'){
    reg.seq=reg.sol.slice();reg.drawSeq();reg.walk(false);
    reg.locked=true;
    setScore(ex,1,1,true);return;
  }
  if(reg.type==='dissect'){
    reg.words.forEach((w,i)=>{
      reg.tag[i]=w[1];
      const s=reg.sentEl.children[i];
      reg.paint(s,w[1]);s.classList.add('okw');
    });
    reg.locked=true;
    setScore(ex,reg.words.length,reg.words.length,true);return;
  }
  if(reg.type==='clockset'){
    reg.items.forEach((it,i)=>{
      reg.set[i]={h:it[1],m:it[2]};
      reg['show'+i]();
      reg.cells[i].classList.add('ok');
    });
    reg.locked=true;
    setScore(ex,reg.items.length,reg.items.length,true);return;
  }
  if(reg.type==='shop'){
    reg.basket=reg.need.slice();
    reg.menuEls.forEach(el2=>{
      const inB=reg.need.includes(el2.dataset.item);
      el2.classList.toggle('inbasket',inB);
      if(inB)el2.classList.add('ok-chip');
    });
    reg.draw();
    const inp=root.querySelector('input.tinput');
    inp.value=String(reg.change);inp.classList.add('ok');
    reg.locked=true;
    setScore(ex,reg.need.length+1,reg.need.length+1,true);return;
  }
  if(reg.type==='memory'){
    reg.grid.querySelectorAll('.mcard').forEach(c=>c.classList.add('mfound'));
    reg.found=reg.pairsTotal;reg.locked=true;
    setScore(ex,reg.found,reg.pairsTotal,true);return;
  }
  /* «Одно слово — другой смысл»: показываем разом все сдвиги смысла списком */
  if(reg.type==='shift'){
    const all=(reg.opts||[]).map(o=>'<div class="shrow"><b>'+o.w+'</b> — '+o.mean+'</div>').join('');
    reg.note.innerHTML=all;reg.note.classList.add('show');
    [...reg.pool.children].forEach(c=>c.classList.add('locked'));
    reg.opened=reg.totalOpts;
    setScore(ex,reg.totalOpts,reg.totalOpts,true);return;
  }
  /* Диалог-конструктор: «ответов» тут нет, поэтому кнопка просто прокручивает
     все слоты на следующий вариант — ученик видит, что диалог правда меняется */
  if(reg.type==='swap'){
    (reg.chips||[]).forEach(c=>c.click());
    setScore(ex,reg.totalSlots,reg.totalSlots,true);return;
  }
  if(reg.type==='highlight'){
    root.querySelectorAll('.hword').forEach(s=>{
      s.classList.toggle('on',s.dataset.good==='1');
      if(s.dataset.good==='1')s.classList.add('okw');
    });
    reg.locked=true;
    setScore(ex,reg.hlTotal,reg.hlTotal,true);return;
  }
  if(reg.type==='wordsearch'){
    reg.placements.forEach(p=>{
      if(!reg.found.includes(p.w))reg.found.push(p.w);
      p.cells.forEach(i=>reg.cells[i].classList.add('wfound'));
      reg.wl.querySelector(`.wsWord[data-w="${p.w}"]`).classList.add('done');
    });
    reg.locked=true;
    setScore(ex,reg.words.length,reg.words.length,true);return;
  }
  if(reg.type==='lines'){
    reg.conn=reg.pairs.map(p=>({l:p[0],r:p[1],state:'ok'}));
    reg.locked=true;
    drawLines(ex);setScore(ex,reg.pairs.length,reg.pairs.length,true);return;
  }
  if(reg.builds){
    let t=0;
    root.querySelectorAll('.bwrow').forEach((row,ri)=>{
      const placed=new Set();
      reg.builds[ri].forEach(v=>{
        const w=[...row.querySelectorAll('.bword')].find(x=>x.dataset.val===v&&!placed.has(x));
        if(w){placed.add(w);row.appendChild(w);w.classList.add('ok');t++;}
      });
    });
    setScore(ex,t,t,true);return;
  }
  if(reg.order){
    const list=document.getElementById('rlist-'+ex);
    reg.order.forEach(v=>{
      const r=[...list.children].find(x=>x.dataset.val===v);
      list.appendChild(r);r.classList.add('ok');
    });
    setScore(ex,reg.order.length,reg.order.length,true);return;
  }
  const tin=[...root.querySelectorAll('input.tinput')];
  if(tin.length){
    tin.forEach((inp,i)=>{inp.value=inp.dataset.answer||(reg.words?reg.words[i]:'');inp.classList.add('ok')});
    setScore(ex,tin.length,tin.length,true);return;
  }
  root.querySelectorAll('.chip.radio').forEach(c=>{
    c.classList.toggle('on',c.dataset.good==='1');
    if(c.dataset.good==='1')c.classList.add('ok-chip');
    c.classList.add('locked');
  });
  root.querySelectorAll('.watchwhy').forEach(w=>w.classList.add('show'));
  root.querySelectorAll('.slot').forEach(s=>{
    const need=s.dataset.answer;
    const cur=s.querySelector('.chip');
    if(cur&&cur.dataset.val===need){s.classList.add('ok');return}
    if(cur)homeOf(cur).appendChild(cur);
    const chip=[...root.querySelectorAll('.chip')]
      .find(c=>c.dataset.val===need&&!c.parentElement.classList.contains('slot')&&!c.classList.contains('radio'));
    if(chip){s.appendChild(chip);s.classList.add('ok')}
  });
  root.querySelectorAll('.bucket').forEach(b=>{
    const bin=b.querySelector('.bin');
    root.querySelectorAll('.chip').forEach(c=>{
      if(c.dataset.col===b.dataset.col){bin.appendChild(c);c.classList.add('ok-chip')}
    });
  });
  const slots=root.querySelectorAll('.slot').length;
  const bchips=root.querySelectorAll('.bucket .chip').length;
  const groups=new Set([...root.querySelectorAll('.chip.radio')].map(c=>c.dataset.rg)).size;
  setScore(ex,slots+bchips+groups,slots+bchips+groups,true);
}
function resetEx(ex){
  clearMarks(ex);
  const root=document.getElementById(ex);
  const reg=EX[ex]||{};
  reg.hinted=false;
  if(reg.tint)reg.tStop(false);
  if(reg.type==='dialog'){reg.play(false);return}
  if(reg.type==='write'){
    reg.ta.value='';try{localStorage.removeItem(reg.lsKey)}catch(e){}
    reg.ta.classList.remove('ok');
    reg.ta.dispatchEvent(new Event('input'));
    reg.boxes.forEach(b=>{b.checked=false});
    return;
  }
  if(reg.type==='flashcards'){reg.start();return}
  if(reg.type==='shift'){
    reg.seen={};reg.opened=0;
    reg.slot.textContent='_____';
    reg.note.innerHTML='';reg.note.classList.remove('show');
    [...reg.pool.children].forEach(c=>c.classList.remove('on','locked'));
    return;
  }
  if(reg.type==='swap'){
    reg.changed={};reg.opened=0;
    (reg.chips||[]).forEach(c=>{
      const n=+c.dataset.slot;
      c.textContent=(reg.slots[n]||[''])[0];
      c.classList.remove('used');
    });
    return;
  }
  if(reg.type==='speaking'){
    reg.res=[];
    root.querySelectorAll('.spkstat').forEach(s=>{s.className='spkstat';s.textContent=''});
    return;
  }
  if(reg.type==='timeline'){
    reg.locked=false;
    reg.rows.forEach((r,i)=>{r.inp.value=r.inp.min;r.draw()});
    return;
  }
  if(reg.type==='dressup'){
    reg.locked=false;reg.worn=[];
    reg.slider.value=String(reg.start!==undefined?reg.start:10);
    reg.slider.classList.remove('ok');
    reg.pool.querySelectorAll('.chip').forEach(c=>c.classList.remove('on','ok-chip','bad-chip'));
    reg.drawTemp();reg.drawWorn();
    return;
  }
  if(reg.type==='maproute'){
    reg.locked=false;reg.seq=[];reg.drawSeq();reg.reset();
    return;
  }
  if(reg.type==='dissect'){
    reg.locked=false;reg.tag={};
    [...reg.sentEl.children].forEach(s=>{s.classList.remove('okw','badw');reg.paint(s,null)});
    return;
  }
  if(reg.type==='clockset'){
    reg.locked=false;
    reg.items.forEach((it,i)=>{reg.set[i]={h:12,m:0};reg['show'+i]()});
    return;
  }
  if(reg.type==='shop'){
    reg.locked=false;reg.basket=[];
    reg.menuEls.forEach(el2=>el2.classList.remove('inbasket','ok-chip','bad-chip'));
    const inp=root.querySelector('input.tinput');
    inp.value='';inp.classList.remove('ok','bad');
    reg.draw();
    return;
  }
  if(reg.type==='memory'){
    reg.found=0;reg.locked=false;reg.open=[];
    const cards=shuffle([...reg.grid.children]);
    cards.forEach(c=>{c.classList.remove('open','mfound');reg.grid.appendChild(c)});
    return;
  }
  if(reg.type==='highlight'){
    reg.locked=false;
    root.querySelectorAll('.hword').forEach(s=>s.classList.remove('on','okw','badw'));
    return;
  }
  if(reg.type==='wordsearch'){
    reg.found=[];reg.locked=false;
    if(reg.wsClear)reg.wsClear();
    reg.cells.forEach(c=>c.classList.remove('wfound','wsel','wbad'));
    reg.wl.querySelectorAll('.wsWord').forEach(w=>w.classList.remove('done'));
    return;
  }
  if(reg.type==='lines'){reg.conn=[];reg.locked=false;drawLines(ex);return}
  if(reg.builds){
    root.querySelectorAll('.bwrow').forEach((row,ri)=>{
      const ws=[...row.querySelectorAll('.bword')];
      ws.forEach(w=>w.classList.remove('ok','bad','sel'));
      const vals=derange(reg.builds[ri].slice(),reg.builds[ri]);
      const placed=new Set();
      vals.forEach(v=>{const w=ws.find(x=>x.dataset.val===v&&!placed.has(x));if(w){placed.add(w);row.appendChild(w);}});
    });
    return;
  }
  if(reg.order){
    const list=document.getElementById('rlist-'+ex);
    const rows=[...list.children];
    const ordered=reg.order.map(v=>rows.find(r=>r.dataset.val===v));
    derange(ordered,ordered).forEach(r=>list.appendChild(r));
    return;
  }
  root.querySelectorAll('.chip.toggle').forEach(c=>c.classList.remove('on','locked','ok-chip','bad-chip'));
  root.querySelectorAll('input.tinput').forEach(inp=>{inp.value='';inp.classList.remove('ok','bad')});
  root.querySelectorAll('.chip.radio').forEach(c=>c.classList.remove('on','locked','ok-chip','bad-chip'));
  const byHome={};
  root.querySelectorAll('.chip:not(.radio):not(.toggle)').forEach(c=>{
    (byHome[c.dataset.home]=byHome[c.dataset.home]||[]).push(c);
  });
  Object.keys(byHome).forEach(h=>{
    const p=document.getElementById(h);
    shuffle(byHome[h]).forEach(c=>p.appendChild(c));
  });
}

/* ---------- листание ---------- */
let page=0;
let railRO=null;
function fitRail(){
  const s=rail.children[page];
  if(s)rail.style.height=s.offsetHeight+'px';
}
function goto(p){
  page=Math.max(0,Math.min(PAGES-1,p));
  rail.style.transform=`translateX(calc(${-100*page}% - ${20*page}px))`;
  fitRail();
  // страница может менять высоту на ходу (диалог, корзина) — следим
  if(window.ResizeObserver){
    railRO=railRO||new ResizeObserver(()=>fitRail());
    railRO.disconnect();
    if(rail.children[page])railRO.observe(rail.children[page]);
  }
  document.getElementById('prevP').disabled=page===0;
  document.getElementById('nextP').disabled=page===PAGES-1;
  // компактный счётчик страниц — чтобы верхняя панель помещалась на телефоне
  document.getElementById('pdots').textContent=(page+1)+' / '+PAGES;
  if(pageMeta[page])document.getElementById('brandsub').textContent=pageMeta[page].unit;
  window.scrollTo({top:0,behavior:'smooth'});
}
window.addEventListener('resize',()=>fitRail());
window.addEventListener('load',()=>fitRail());
document.getElementById('prevP').onclick=()=>goto(page-1);
document.getElementById('nextP').onclick=()=>goto(page+1);

/* ---------- загрузка ---------- */
(async function(){
  // карта озвучки: текст → mp3 (нет файла — движок молча падает на синтезатор)
  try{ AUDIO_MAP = await (await fetch('data/audio-map.json?v='+Date.now(),{cache:'no-store'})).json() || {}; }
  catch(e){ AUDIO_MAP = {}; }
  const loaded=[];
  for(const url of MANIFEST){
    const unit=await (await fetch(url+'?v='+Date.now(),{cache:'no-store'})).json();
    loaded.push(unit);
  }
  const hwParam=new URLSearchParams(location.search).get('hw');
  if(hwParam && typeof window!=='undefined' && window.BOOK_EXTRA){
    for(const url of window.BOOK_EXTRA){
      try{
        const bank=await (await fetch(url+'?v='+Date.now(),{cache:'no-store'})).json();
        (bank.units||[]).forEach(u=>loaded.push(u));
      }catch(e){}
    }
  }
  if(hwParam){
    renderUnit(buildHwUnit(loaded, hwParam.split(',').map(s=>s.trim()).filter(Boolean)));
  }else{
    loaded.forEach(renderUnit);
  }
  initEngine();
  // оглавление
  const list=document.getElementById('toclist');
  let lastUnit='';
  // у какой темы есть доска урока
  const BOARDS={'Starter':null,'Unit 1':'unit1','Unit 2':'unit2','Unit 3':'unit3','Unit 4':'unit4',
    'Unit 5':'unit5','Unit 6':'unit6','Unit 7':'unit7','Unit 8':'unit8','Unit 9':'unit9','Revision':'revision','Итоговое повторение':'revision'};
  pageMeta.forEach((m,i)=>{
    if(m.unit!==lastUnit){
      lastUnit=m.unit;
      const head=el('div','tocunit',m.unit);
      /* платформа: прогресс заданий юнита (из eng5_prog), обновляется при открытии TOC */
      const prog=el('span','tocprog',''); prog.dataset.unit=m.unit; head.appendChild(prog);
      const slug=Object.entries(BOARDS).find(([k])=>m.unit.startsWith(k));
      if(slug&&slug[1]){
        const a=document.createElement('a');
        a.href='board/show.html?u='+slug[1];
        a.target='_blank';
        a.textContent='📺 доска урока';
        a.className='tocboard';
        a.addEventListener('click',e=>e.stopPropagation());
        head.appendChild(a);
      }
      list.appendChild(head);
    }
    const it=el('div','tocitem',`<b>стр. ${m.num}</b><span>${m.label}</span>`);
    it.addEventListener('click',()=>{goto(i);closeToc()});
    list.appendChild(it);
  });
  COURSE_PLAN.forEach(sec=>{
    list.appendChild(el('div','tocunit',sec[0]));
    sec[1].forEach(t=>list.appendChild(el('div','tocitem plan',`<span>${t}</span>`)));
  });
  // приложение к курсу
  list.appendChild(el('div','tocunit','Приложение'));
  let vocProgress='';
  try{
    const p=JSON.parse(localStorage.getItem('eng5_progress_v1'));
    const known=Object.values(p.words||{}).filter(v=>v==='know').length;
    if(known)vocProgress=` · выучено ✓${known}`;
  }catch(_){}
  [['📖 Грамматика года','appendix.html'],['🔤 Словарь года'+vocProgress,'appendix.html#words'],
   ['🃏 Флешкарты и диктант','appendix.html#cards'],['📚 Чтение','appendix.html#read']].forEach(([t,href])=>{
    const a=document.createElement('a');
    a.href=href;a.className='tocitem';a.style.textDecoration='none';a.style.color='inherit';a.style.display='block';
    a.innerHTML=`<span>${t}</span>`;
    list.appendChild(a);
  });
  const ov=document.getElementById('tocov');
  function closeToc(){ov.classList.remove('open')}
  document.getElementById('tocBtn').addEventListener('click',()=>{
    [...list.querySelectorAll('.tocitem')].forEach((it,i)=>it.classList.toggle('cur',i===page));
    list.querySelectorAll('.tocprog').forEach(sp=>{
      const r=unitResult(sp.dataset.unit);
      sp.textContent=r.done?`сделано ${r.done}/${r.tot}`:'';
    });
    ov.classList.add('open');
  });
  document.getElementById('tocClose').addEventListener('click',closeToc);
  ov.addEventListener('click',e=>{if(e.target===ov)closeToc()});
  /* ---- платформа: итог ДЗ + глубокая ссылка ---- */
  setupResults();
  goto(deepTarget());
})();

function deepTarget(){
  var q=new URLSearchParams(location.search), hash=(location.hash||'').replace('#','');
  var pageQ=q.get('page');
  if(pageQ){ var i=pageMeta.findIndex(m=>String(m.num)===String(pageQ)); if(i>=0)return i; }
  var uq=q.get('unit'); if(uq==null && /^u(nit)?[-_]?\d+$/i.test(hash)) uq=hash.replace(/\D/g,'');
  if(uq!=null){
    uq=String(uq).toLowerCase();
    if(uq==='starter'||uq==='0'){ var s=pageMeta.findIndex(m=>/starter/i.test(m.unit)); if(s>=0)return s; }
    var j=pageMeta.findIndex(m=>unitNo(m.unit)===uq); if(j>=0)return j;
  }
  return 0;
}

function setupResults(){
  var st=document.createElement('style');
  st.textContent='.resbtn{background:var(--green,#2E9E57)!important;border-color:#1E7A40!important;box-shadow:0 2px 0 #1E7A40!important;color:#fff!important}'+
    '.resov{position:fixed;inset:0;background:#1A1D29CC;z-index:210;display:none;align-items:flex-start;justify-content:center;padding:20px 12px;overflow:auto}'+
    '.resov.open{display:flex}.respanel{background:#fff;border-radius:20px;max-width:440px;width:100%;padding:20px 20px 24px;box-shadow:0 30px 60px -20px rgba(10,15,30,.5);text-align:center;font-family:"Golos Text",system-ui,sans-serif}'+
    '.respanel h2{font-family:"Rubik";font-weight:800;font-size:20px;margin-bottom:2px}.respanel .rsub{color:#5A6275;font-size:13.5px;margin-bottom:14px}'+
    '.rstat{display:flex;gap:10px;justify-content:center;margin:10px 0 14px}.rstat div{background:#EBF1FD;border-radius:12px;padding:10px 14px;min-width:96px}'+
    '.rstat b{font-family:"Rubik";font-weight:800;font-size:22px;color:#2F6BDB;display:block}.rstat span{font-size:12px;color:#5A6275}'+
    '.rcode{font-family:"Rubik";font-weight:700;font-size:16px;letter-spacing:.5px;background:#F0FBF4;border:2px dashed #2E9E57;border-radius:12px;padding:10px 8px;margin:6px 0;word-break:break-all;color:#1E2630}'+
    '.rqr{display:flex;justify-content:center;margin:12px 0}.rqr svg{width:150px;height:150px}'+
    '.rnote{font-size:12.5px;color:#5A6275;line-height:1.5;margin:8px 0 4px}.rbtns{display:flex;gap:8px;margin-top:12px}.rbtns .btn{flex:1}'+
    '.rall{font-size:12px;color:#8A93A5;margin-top:12px;text-align:left}.rall b{color:#5A6275}'+
    '.rverdict{font-family:"Rubik";font-weight:800;font-size:17px;margin:2px 0 10px}'+
    '.rverdict small{display:block;font-family:"Golos Text";font-weight:400;font-size:12.5px;color:#5A6275;margin-top:2px}';
  document.head.appendChild(st);
  var btn=el('button','pbtn resbtn'); btn.type='button'; btn.textContent='Итог'; btn.title='Показать результат для ДЗ';
  var nav=document.querySelector('.pagenav'); if(nav) nav.appendChild(btn);
  var ov=el('div','resov'); ov.id='resov';
  ov.innerHTML='<div class="respanel">'+
    '<h2 id="rttl">Итог</h2><div class="rsub" id="rsub"></div>'+
    '<div class="rstat"><div><b id="rdone">0/0</b><span>заданий</span></div><div><b id="rscore">0/0</b><span>баллов</span></div></div>'+
    '<div class="rverdict" id="rverdict"></div>'+
    '<div class="rnote">Код результата — покажи или пришли учителю как подтверждение ДЗ:</div>'+
    '<div class="rcode" id="rcode">—</div>'+
    '<div class="rqr" id="rqr"></div>'+
    '<div class="rall" id="rall"></div>'+
    '<div class="rbtns"><button class="btn" id="rcopy" type="button">Копировать код</button>'+
    '<button class="btn reset" id="rclose" type="button">Закрыть</button></div></div>';
  document.body.appendChild(ov);
  function open(){
    var unit=(pageMeta[page]||{}).unit||''; var r=unitResult(unit);
    document.getElementById('rttl').textContent=unit;
    document.getElementById('rsub').textContent='Результат этого юнита';
    document.getElementById('rdone').textContent=r.done+'/'+r.tot;
    document.getElementById('rscore').textContent=r.g+'/'+r.t;
    /* шуточный вердикт по проценту — как шкала квизов в подростковых курсах */
    var pc=r.t?r.g/r.t:0, v=document.getElementById('rverdict');
    if(!r.t||!r.done){ v.innerHTML=''; }
    else if(pc>=1) v.innerHTML='🏆 Awesome! Ты эксперт!<small>Всё решено без ошибок</small>';
    else if(pc>=.8) v.innerHTML='⭐ Great! Почти эксперт<small>Ещё чуть-чуть до максимума</small>';
    else if(pc>=.5) v.innerHTML='👍 Not bad! Уже неплохо<small>Загляни в ошибки и попробуй ещё раз</small>';
    else v.innerHTML='🙈 Whoops! Загляни в тему ещё раз<small>Перечитай правило — и всё получится</small>';
    var code=resultCode(r.n,r.g,r.t);
    document.getElementById('rcode').textContent=code;
    var qb=document.getElementById('rqr'); qb.innerHTML='';
    if(window.qrcode){ try{var qr=qrcode(0,'M');qr.addData(code);qr.make();qb.innerHTML=qr.createSvgTag({cellSize:4,margin:2});}catch(e){} }
    var p=loadProg(), byU={}; Object.keys(exUnit).forEach(function(id){var u=exUnit[id];byU[u]=byU[u]||{d:0,t:0};byU[u].t++;if(p[id])byU[u].d++;});
    var rows=Object.keys(byU).map(function(u){return '<div><b>'+u+':</b> '+byU[u].d+'/'+byU[u].t+' заданий</div>';}).join('');
    document.getElementById('rall').innerHTML='<b>Все юниты:</b>'+rows;
    document.getElementById('rcopy').textContent='Копировать код';
    ov.classList.add('open');
  }
  btn.addEventListener('click',open);
  document.getElementById('rclose').addEventListener('click',function(){ov.classList.remove('open');});
  ov.addEventListener('click',function(e){if(e.target===ov)ov.classList.remove('open');});
  document.getElementById('rcopy').addEventListener('click',function(){
    var t=document.getElementById('rcode').textContent;
    if(navigator.clipboard) navigator.clipboard.writeText(t);
    this.textContent='Скопировано \u2713';
  });
}
