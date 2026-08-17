/* ============================================================
   ОБЩИЙ движок доски платформы (core/engines/board), §2 CLAUDE.md.
   Контент — в <board>/data/<unit>.json; открывается как show.html?u=<unit>.
   Надмножество английских и географических досок (сведение форков), без
   ломки контента. Настройки через глобали в show.html:
     window.BOARD_IMG    — путь к картинкам (по умолч. '../img/')
     window.BOARD_LOCALE — локаль накрутки чисел ('en-GB' / 'ru-RU')
     window.BOARD_SKINS  — false отключает переключатель стиля 🎨 (гео)
   Типы слайдов: riddle(+tiles-шторки) · rule · cards · quiz · tpr · scrub ·
   compare · error · poll · odd · auction · jeopardy · paper · finale ·
   art · bignum · spots · chain.
   ВАЖНО: chain у серий исторически разный — авто-диспетчер по форме
   данных: есть s.start → «цепочка памяти» (растущая фраза); иначе —
   «цепочка открытия» (этапы по порядку). Оба контента работают как есть.
   ============================================================ */
const STEPS=['Загадка','Думаем','Правило','Тренируем','Разминка','Играем','Ответ','В тетрадь'];
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!==undefined)e.innerHTML=h;return e};
const IMG=(typeof window!=='undefined'&&window.BOARD_IMG)||'../img/';
const LOCALE=(typeof window!=='undefined'&&window.BOARD_LOCALE)||'en-GB';

let slides=[], cur=0, notes=false, tprTimer=null;

/* голос: если для реплики записан живой клип (data/audio-map.json) — играем mp3,
   иначе браузерный синтезатор (фолбэк; так же ведут себя доски без озвучки) */
let AUDIO_MAP={};
let _clip=null;
function say(t){
  const key=(t||'').trim();
  const f=AUDIO_MAP[key];
  if(f){
    try{ speechSynthesis.cancel(); if(_clip){_clip.pause();_clip=null;}
      const a=new Audio('assets/'+f); _clip=a; a.onended=()=>{if(_clip===a)_clip=null;};
      const p=a.play(); if(p&&p.catch)p.catch(()=>{}); return;
    }catch(_){}
  }
  try{
    if(_clip){_clip.pause();_clip=null;}
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(t);u.lang='en-GB';u.rate=.9;
    const v=speechSynthesis.getVoices().find(v=>v.lang.startsWith('en'));if(v)u.voice=v;
    speechSynthesis.speak(u);
  }catch(_){}
}

/* ——— анимации (anime.js из core/vendor; без библиотеки всё работает как раньше) ——— */
const FX=(function(){
  const on=()=>typeof anime==='function'&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clear=t=>{(t.length!==undefined?[...t]:[t]).forEach(n=>{n.style.opacity='';n.style.transform=''})};
  return {
    on,
    /* каскадный вход элементов слайда; fade=true — только прозрачность
       (для элементов, центрированных через transform) */
    enter(nodes,fade){
      if(!on()||!nodes.length)return;
      anime({targets:nodes,opacity:[0,1],...(fade?{}:{translateY:[26,0]}),
        duration:520,delay:anime.stagger(60),easing:'easeOutCubic',complete:()=>clear(nodes)});
    },
    /* пружинное открытие */
    pop(node){
      if(!on())return;
      anime({targets:node,scale:[.55,1],duration:600,easing:'spring(1,80,12,0)',complete:()=>clear(node)});
    },
    /* накрутка числа до целевого значения */
    count(node,to,done){
      if(!on()||!isFinite(to)){done();return}
      const o={n:0};
      anime({targets:o,n:to,round:1,duration:1100,easing:'easeOutExpo',
        update:()=>{node.textContent=o.n.toLocaleString(LOCALE)},complete:done});
    }
  };
})();
const FX_SEL={riddle:'.rc',cards:'.dc',quiz:'.qc',error:'.er',rule:'.opt',poll:'.bar',
  compare:'.side,.vs',finale:'.qlist>div',odd:'.oc',jeopardy:'.jcat,.jcell',auction:'.at',
  chain:'.ch,.carrow',bignum:'.bignum',comic:'.cpanel'};   /* union англ+гео */
const FX_FADE={spots:'.spot'};

/* ——— рендереры слайдов ——— */
const TYPES={

  /* комикс на проекторе: панели в перемешанном порядке; класс называет
     верный порядок, учитель тапает панель — всплывает её номер (правильная
     позиция), реплика и озвучка. panels:[{img,line,say}] в ВЕРНОМ порядке */
  comic(body,s){
    const g=el('div','comicgrid');
    g.style.gridTemplateColumns=`repeat(${s.cols||3},1fr)`;
    const order=s.panels.map((p,i)=>i);
    for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
    order.forEach(idx=>{
      const p=s.panels[idx];
      const c=el('div','cpanel');
      c.innerHTML=`<img src="${IMG}${p.img}" alt="">
        <div class="cnum">${idx+1}</div><div class="cline">${p.line||''}</div>`;
      c.onclick=()=>{
        const open=!c.classList.contains('open');
        c.classList.toggle('open',open);
        if(open)say(p.say||p.line||'');
      };
      g.appendChild(c);
    });
    body.appendChild(g);
  },

  riddle(body,s){
    const g=el('div','riddle');
    g.style.gridTemplateColumns=`repeat(${s.cards.length},1fr)`;
    s.cards.forEach(c=>{
      const card=el('div','rc'+(c.mystery?' q':''));
      const fact=c.fact?`<div class="fact">${c.fact}${c.factNote?`<small>${c.factNote}</small>`:''}</div>`:'';
      card.innerHTML=`<div class="pic"><img src="${IMG}${c.img}" alt=""></div>
        <div class="cap"><div class="time">${c.time||''}</div><div class="what">${c.what}</div>${fact}</div>`;
      card.onclick=()=>{
        card.classList.toggle('open');
        if(card.classList.contains('open')&&c.say)say(c.say);
      };
      /* шторки: фото под плитками, открываем по одной */
      if(s.tiles){
        const ov=el('div','tiles');
        for(let k=0;k<9;k++){
          const t=el('div','tile',String(k+1));
          t.onclick=e=>{
            e.stopPropagation();
            t.classList.add('off');
            if([...ov.children].every(x=>x.classList.contains('off'))){
              card.classList.add('open');
              if(c.say)say(c.say);
            }
          };
          ov.appendChild(t);
        }
        card.querySelector('.pic').appendChild(ov);
      }
      g.appendChild(card);
    });
    body.appendChild(g);
  },

  /* что лишнее: четыре карточки, одна не из темы */
  odd(body,s){
    const g=el('div','odds');
    g.style.gridTemplateColumns=`repeat(${s.items.length},1fr)`;
    const why=el('div','oddwhy',' ');
    s.items.forEach(it=>{
      const c=el('div','oc');
      c.innerHTML=`<div class="w">${it.word}</div>`+(it.ru?`<div class="hint">${it.ru}</div>`:'');
      c.onclick=()=>{
        if(c.classList.contains('pick')){c.classList.remove('pick','good','bad');why.innerHTML=' ';return}
        c.classList.add('pick');
        c.classList.add(it.odd?'good':'bad');
        if(it.odd&&s.why)why.innerHTML=s.why;
        say(it.word);
      };
      g.appendChild(c);
    });
    body.appendChild(g);
    body.appendChild(why);
  },

  /* аукцион слов: две команды, счёт и таймер */
  auction(body,s){
    const box=el('div','auc');
    if(s.img){
      const b=el('div','aucimg');
      b.innerHTML=`<img src="${IMG}${s.img}" alt="">`;
      box.appendChild(b);
    }
    const clock=el('div','aucclock',String(s.seconds||60));
    const teams=el('div','aucteams');
    const scores=[];
    (s.teams||['Команда А','Команда Б']).forEach((nm,i)=>{
      const t=el('div','at');
      const sc=el('div','sc','0');
      const minus=el('button','atminus','−1');
      t.appendChild(sc);t.appendChild(el('div','nm',nm));t.appendChild(minus);
      t.onclick=()=>{sc.textContent=+sc.textContent+1;crown()};
      minus.onclick=e=>{e.stopPropagation();sc.textContent=Math.max(0,sc.textContent-1);crown()};
      scores.push(sc);teams.appendChild(t);
    });
    function crown(){
      const v=scores.map(x=>+x.textContent);
      [...teams.children].forEach((t,i)=>t.classList.toggle('win',v[i]>v[1-i]));
    }
    const nav=el('div','pollnav');
    const play=el('button','nb','▶'), zero=el('button','nb','↺');
    nav.appendChild(play);nav.appendChild(zero);
    box.appendChild(clock);box.appendChild(teams);box.appendChild(nav);
    body.appendChild(box);
    let left=s.seconds||60;
    play.onclick=()=>{
      if(tprTimer){stopTpr();play.textContent='▶';return}
      play.textContent='❚❚';
      tprTimer=setInterval(()=>{
        left--;clock.textContent=Math.max(0,left);
        if(left<=0){stopTpr();play.textContent='▶';clock.textContent='Stop!';say('Stop! Count your words!')}
      },1000);
    };
    zero.onclick=()=>{
      stopTpr();play.textContent='▶';
      left=s.seconds||60;clock.textContent=left;
      scores.forEach(x=>x.textContent='0');crown();
    };
  },

  /* своя игра: сетка «темы × очки», команды выбирают клетку */
  jeopardy(body,s){
    const box=el('div','jp');
    const score=el('div','jscore');
    const scores=[];
    (s.teams||['Команда А','Команда Б']).forEach(nm=>{
      const t=el('div','jt');
      const n=el('b','','0');
      t.appendChild(n);t.appendChild(el('span','',nm));
      scores.push(n);score.appendChild(t);
    });
    const grid=el('div','jgrid');
    grid.style.gridTemplateColumns=`repeat(${s.cats.length},1fr)`;
    s.cats.forEach(c=>grid.appendChild(el('div','jcat',c.name)));
    const rows=Math.max(...s.cats.map(c=>c.qs.length));
    for(let r=0;r<rows;r++)s.cats.forEach(c=>{
      const q=c.qs[r];
      const cell=el('div','jcell',q?String(q.v):'');
      if(q)cell.onclick=()=>openQ(c,q,cell);
      grid.appendChild(cell);
    });
    const ov=el('div','jov');
    box.appendChild(score);box.appendChild(grid);box.appendChild(ov);
    body.appendChild(box);
    function openQ(c,q,cell){
      ov.innerHTML='';ov.classList.add('on');
      ov.appendChild(el('div','jtag',c.name+' · '+q.v));
      ov.appendChild(el('div','jq',q.q));
      const ans=el('div','ja',q.a);
      const showB=el('button','jbtn','Показать ответ');
      const award=el('div','jaward');
      const bs=scores.map((sc,i)=>{
        const b=el('button','jbtn win','+'+q.v+' · '+(s.teams?s.teams[i]:'команда '+(i+1)));
        b.onclick=()=>{sc.textContent=+sc.textContent+q.v;close()};
        return b;
      });
      const none=el('button','jbtn','Никому');
      none.onclick=close;
      showB.onclick=()=>{ans.classList.add('show');award.classList.add('show');say(q.a)};
      award.appendChild(bs[0]);award.appendChild(none);award.appendChild(bs[1]);
      ov.appendChild(ans);ov.appendChild(showB);ov.appendChild(award);
      say(q.q);
      function close(){ov.classList.remove('on');cell.classList.add('used')}
    }
  },

  /* chain — авто-диспетчер: s.start → цепочка памяти (англ), иначе —
     цепочка открытия (гео). Историческое расхождение форков, склеено. */
  chain(body,s){
    if(s.start!==undefined) return TYPES._chainMemory(body,s);
    return TYPES._chainDiscovery(body,s);
  },

  /* цепочка открытия (гео): этапы открываются по порядку, по очереди */
  _chainDiscovery(body,s){
    const row=el('div','chain');
    let opened=0;
    s.items.forEach((it,i)=>{
      const c=el('div','ch');
      c.innerHTML=`<div class="cn">${i+1}</div><div class="ct">?</div><div class="cd"></div>`;
      c.onclick=()=>{
        if(i!==opened)return;
        opened++;
        c.classList.add('open');
        c.querySelector('.ct').textContent=it.t;
        c.querySelector('.cd').textContent=it.d||'';
        say(it.say||it.t+'. '+(it.d||''));
      };
      row.appendChild(c);
      if(i<s.items.length-1)row.appendChild(el('div','carrow','→'));
    });
    body.appendChild(row);
  },

  /* арт-кадр с плашками-подписями (гео) */
  art(body,s){
    const w=el('div','artwrap');
    const im=document.createElement('img'); im.src=IMG+s.img; im.alt=s.title||'';
    const box=el('div','artbox');
    w.appendChild(im); w.appendChild(box);
    const place=()=>{
      const W=w.clientWidth,H=w.clientHeight,iw=im.naturalWidth||1536,ih=im.naturalHeight||1024;
      if(!W||!H)return;
      const k=Math.min(W/iw,H/ih), bw=iw*k, bh=ih*k;
      box.style.left=((W-bw)/2)+'px'; box.style.top=((H-bh)/2)+'px';
      box.style.width=bw+'px'; box.style.height=bh+'px';
      box.style.fontSize=Math.max(10,bw*0.016)+'px';
    };
    im.onload=place; addEventListener('resize',place); requestAnimationFrame(place);
    try{ new ResizeObserver(place).observe(w); }catch(e){}
    if(s.reveal&&s.reveal.length){
      const bar=el('div','artbar');
      s.reveal.forEach(r=>{
        const t=r&&r.t?r.t:r;
        const chip=el('div','artchip',t);
        if(r&&r.x!=null){ chip.classList.add('at'); chip.style.left=(r.x*100)+'%'; chip.style.top=(r.y*100)+'%'; box.appendChild(chip); }
        else bar.appendChild(chip);
      });
      if(bar.children.length)box.appendChild(bar);
      w.onclick=()=>{
        box.classList.toggle('show');
        if(box.classList.contains('show')&&s.reveal[0]){
          const txt=s.reveal.map(r=>String(r&&r.t?r.t:r).replace(/^[✓✗]\s*/,'')).join('. ');
          say(txt);
        }
      };
    }
    body.appendChild(w);
  },

  /* число-загадка (гео): вопрос + гигантское скрытое число */
  bignum(body,s){
    const box=el('div','bignum');
    const q=el('div','bq',s.q);
    const v=el('div','bv','? ? ?');
    const note=el('div','bnote','нажми, когда версии прозвучат');
    box.appendChild(q);box.appendChild(v);box.appendChild(note);
    box.onclick=()=>{
      const open=!box.classList.contains('open');
      box.classList.toggle('open',open);
      v.innerHTML=open?`${s.value}<small>${s.unit||''}</small>`:'? ? ?';
      note.textContent=open?(s.note||''):'нажми, когда версии прозвучат';
      if(open)say(s.say2||(s.q+' '+s.value+' '+(s.unit||'')));
    };
    body.appendChild(box);
  },

  /* точки на карте (гео): маркеры на изображении */
  spots(body,s){
    const w=el('div','spotswrap');
    const im=document.createElement('img'); im.src=IMG+s.img; im.alt=s.title||'';
    const box=el('div','spotbox');
    w.appendChild(im); w.appendChild(box);
    const place=()=>{
      const W=w.clientWidth,H=w.clientHeight,iw=im.naturalWidth||1000,ih=im.naturalHeight||640;
      if(!W||!H)return;
      const k=Math.min(W/iw,H/ih), bw=iw*k, bh=ih*k;
      box.style.left=((W-bw)/2)+'px'; box.style.top=((H-bh)/2)+'px';
      box.style.width=bw+'px'; box.style.height=bh+'px';
      box.style.fontSize=Math.max(10,bw*0.018)+'px';
    };
    im.onload=place; addEventListener('resize',place); requestAnimationFrame(place);
    try{ new ResizeObserver(place).observe(w); }catch(e){}
    s.spots.forEach((p,i)=>{
      const m=el('button','spot',String(i+1));
      m.style.left=(p.x*100)+'%'; m.style.top=(p.y*100)+'%';
      const tip=el('div','spottip',`<b>${p.t}</b>${p.d?'<br>'+p.d:''}`);
      tip.style.left=(p.x*100)+'%'; tip.style.top=(p.y*100)+'%';
      m.onclick=()=>{
        const open=!m.classList.contains('on');
        box.querySelectorAll('.spot.on').forEach(x=>x.classList.remove('on'));
        box.querySelectorAll('.spottip.show').forEach(x=>x.classList.remove('show'));
        if(open){ m.classList.add('on'); tip.classList.add('show'); say(p.say||p.t+'. '+(p.d||'')); }
      };
      box.appendChild(m); box.appendChild(tip);
    });
    body.appendChild(w);
  },

  /* цепочка памяти (англ): фраза растёт по классу */
  _chainMemory(body,s){
    const box=el('div','chainbox');
    const ph=el('div','chphrase');
    const cnt=el('div','chcount',' ');
    const nav=el('div','pollnav');
    const add=el('button','nb','+'), zero=el('button','nb','↺');
    nav.appendChild(add);nav.appendChild(zero);
    box.appendChild(ph);box.appendChild(cnt);box.appendChild(nav);
    body.appendChild(box);
    let n=0;
    const words=()=>s.items.slice(0,n).map(w=>Array.isArray(w)?w[0]:w);
    const sentence=()=>{
      const w=words();
      return s.start+' '+(w.length>1?w.slice(0,-1).join(', ')+' and '+w[w.length-1]:w.join(''))+'.';
    };
    const draw=speak=>{
      const w=words();
      ph.innerHTML=`<span class="st">${s.start}</span>`+
        w.map((x,i)=>`<span class="chip${i===n-1?' new':''}">${x}</span>`).join('')+
        (w.length?'<span class="st">.</span>':' …');
      cnt.textContent=w.length?('слов в цепочке: '+w.length):'нажмите +, когда первый игрок назовёт слово';
      if(speak&&w.length)say(sentence());
    };
    add.onclick=()=>{if(n<s.items.length){n++;draw(true)}};
    zero.onclick=()=>{n=0;draw(false)};
    ph.onclick=()=>{if(n)say(sentence())};
    draw(false);
  },

  rule(body,s){
    const box=el('div','rule');
    const opts=el('div','opts');
    const phrase=el('div','phrase');
    const show=o=>{
      [...opts.children].forEach(x=>x.classList.remove('on'));
      opts.children[s.options.indexOf(o)].classList.add('on');
      const mark=o.mark?`<mark class="pop">${o.mark}</mark>`:'';
      phrase.innerHTML=o.phrase.replace('{}',mark);
      say(o.phrase.replace('{}',o.mark||''));
    };
    s.options.forEach(o=>{
      const b=el('button','opt'+(o.hot?' hot':''),o.label);
      b.onclick=()=>show(o);
      opts.appendChild(b);
    });
    box.appendChild(opts);
    box.appendChild(phrase);
    if(s.warn){
      const w=el('div','warn');
      s.warn.forEach(t=>w.appendChild(el('div','',t)));
      box.appendChild(w);
    }
    body.appendChild(box);
    show(s.options[0]);
  },

  cards(body,s){
    const g=el('div','cards');
    g.style.gridTemplateColumns=`repeat(${s.cols||3},1fr)`;
    s.items.forEach(it=>{
      const c=el('div','dc');
      c.innerHTML=`<div>${it.text.replace('{}','<span class="gap">___</span>')}</div>`+
                  (it.hint?`<div class="hint">${it.hint}</div>`:'');
      c.onclick=()=>{
        const gap=c.querySelector('.gap');
        if(c.classList.contains('done')){c.classList.remove('done');gap.textContent='___';return}
        gap.textContent=it.answer;c.classList.add('done');
        say(it.say||it.text.replace('{}',it.answer));
      };
      g.appendChild(c);
    });
    body.appendChild(g);
  },

  quiz(body,s){
    const g=el('div','quiz');
    g.style.gridTemplateColumns=`repeat(${s.cols||4},1fr)`;
    s.items.forEach(it=>{
      const c=el('div','qc');
      c.innerHTML=`${it.img?`<img src="${IMG}${it.img}" alt="">`:''}<div class="q">${it.q}</div><div class="a">${it.a}</div>`;
      c.onclick=()=>{
        const open=!c.classList.contains('open');
        c.classList.toggle('open',open);
        c.classList.toggle(it.yes?'yes':'no',open);
        if(open)say(it.a);
      };
      g.appendChild(c);
    });
    body.appendChild(g);
  },

  error(body,s){
    const box=el('div','errs');
    s.items.forEach((it,i)=>{
      const r=el('div','er');
      r.innerHTML=`<div class="mk">${i+1}</div><div class="txt">${it.text}</div>`+
                  (it.fix?`<div class="fix">→ ${it.fix}</div>`:'<div class="fix">✓</div>');
      r.onclick=()=>{
        const open=!r.classList.contains('open');
        r.classList.toggle('open',open);
        r.classList.toggle(it.bad?'bad':'good',open);
        if(open){
          r.querySelector('.mk').textContent=it.bad?'✗':'✓';
          say(it.bad?it.fix:it.text);
        }else r.querySelector('.mk').textContent=i+1;
      };
      box.appendChild(r);
    });
    body.appendChild(box);
  },

  poll(body,s){
    const reg={i:0,votes:s.items.map(()=>({yes:0,no:0}))};
    const box=el('div','poll');
    const q=el('div','pq');
    const bars=el('div','bars');
    const mk=(cls,label)=>{
      const b=el('div','bar '+cls);
      const fill=el('div','fill'); const n=el('div','n','0');
      fill.appendChild(n);
      b.appendChild(fill); b.appendChild(el('div','lb',label));
      b.onclick=()=>{
        const v=reg.votes[reg.i];
        v[cls]++; draw();
      };
      return {b,fill,n};
    };
    const [LY,LN]=s.labels||['Yes, I can','No, I can’t'];
    const yes=mk('yes',LY), no=mk('no',LN);
    bars.appendChild(yes.b); bars.appendChild(no.b);
    const sum=el('div','pollsum');
    const nav=el('div','pollnav');
    const prev=el('button','nb','‹'), next=el('button','nb','›'), zero=el('button','nb','↺');
    nav.appendChild(prev);nav.appendChild(zero);nav.appendChild(next);
    box.appendChild(q);box.appendChild(bars);box.appendChild(sum);box.appendChild(nav);
    body.appendChild(box);
    const NUM=['ноль','один','два','три','четыре','пять','шесть','семь','восемь','девять','десять'];
    function draw(){
      const it=s.items[reg.i], v=reg.votes[reg.i];
      q.textContent=it[0];
      const max=Math.max(v.yes,v.no,1);
      yes.fill.style.height=(18+72*v.yes/max)+'%';
      no.fill.style.height=(18+72*v.no/max)+'%';
      yes.n.textContent=v.yes; no.n.textContent=v.no;
      const tpl=s.sum||'{yes} of us can {what}. {no} can’t.';
      sum.textContent = (v.yes+v.no)
        ? tpl.replace('{yes}',v.yes).replace('{no}',v.no).replace('{what}',it[1])
        : ' ';
    }
    q.onclick=()=>say(s.items[reg.i][0]);
    prev.onclick=()=>{reg.i=(reg.i-1+s.items.length)%s.items.length;draw()};
    next.onclick=()=>{reg.i=(reg.i+1)%s.items.length;draw()};
    zero.onclick=()=>{reg.votes[reg.i]={yes:0,no:0};draw()};
    draw();
  },

  tpr(body,s){
    const box=el('div','tpr');
    const cmd=el('div','cmd');
    const wrap=el('div','ringwrap');
    const ring=el('div','ring');ring.style.setProperty('--p',0);
    const num=el('b','','8');
    wrap.appendChild(ring);wrap.appendChild(num);
    const btns=el('div','tprbtns');
    const play=el('button','nb','▶'), next=el('button','nb','›');
    btns.appendChild(play);btns.appendChild(next);
    box.appendChild(wrap);box.appendChild(cmd);box.appendChild(btns);
    body.appendChild(box);
    let i=0,left=8;
    const draw=()=>{
      cmd.innerHTML=`${s.items[i][0]}<small>${s.items[i][1]}</small>`;
      say(s.items[i][0]);
      left=8;num.textContent=left;ring.style.setProperty('--p',0);
    };
    const nextCmd=()=>{i=(i+1)%s.items.length;draw()};
    next.onclick=nextCmd;
    play.onclick=()=>{
      if(tprTimer){stopTpr();play.textContent='▶';return}
      play.textContent='❚❚';draw();
      tprTimer=setInterval(()=>{
        left--;num.textContent=Math.max(0,left);
        ring.style.setProperty('--p',(8-left)/8*100);
        if(left<=0)nextCmd();
      },1000);
    };
    draw();
  },

  scrub(body,s){
    const box=el('div','sand');
    const now=el('div','now');
    const hour=el('div','hour'), sent=el('div','sent');
    now.appendChild(hour);now.appendChild(sent);
    const inp=document.createElement('input');
    inp.type='range';inp.className='scrub';inp.min=s.min;inp.max=s.max;inp.step=1;inp.value=s.min;
    inp.setAttribute('aria-label','Часы дня');
    const ticks=el('div','ticks');
    for(let h=s.min;h<=s.max;h+=4)ticks.appendChild(el('span','',h+':00'));
    box.appendChild(now);box.appendChild(inp);box.appendChild(ticks);
    body.appendChild(box);
    const draw=()=>{
      const h=+inp.value;
      hour.textContent=String(h).padStart(2,'0')+':00';
      sent.textContent=s.day[h];
    };
    inp.oninput=draw;
    sent.onclick=()=>say(sent.textContent);
    draw();
  },

  compare(body,s){
    const box=el('div','cmp');
    const side=d=>{
      const x=el('div','side');
      x.innerHTML=`<div class="pic"><img src="${IMG}${d.img}" alt=""></div>
        <div class="lbl"><div class="nm">${d.name}</div><ul>
        ${d.can.map(t=>`<li class="can">${t}</li>`).join('')}
        ${d.cant.map(t=>`<li class="cant">${t}</li>`).join('')}
        </ul></div>`;
      x.querySelectorAll('li').forEach(li=>li.onclick=()=>say(`${d.article||'A'} ${d.name} ${li.textContent}`));
      return x;
    };
    box.appendChild(side(s.a));
    box.appendChild(el('div','vs','vs'));
    box.appendChild(side(s.b));
    body.appendChild(box);
  },

  paper(body,s){
    const box=el('div','papertask');
    box.appendChild(el('div','chip','В тетрадь'));
    box.appendChild(el('div','task',s.task));
    if(s.sub)box.appendChild(el('div','lead',s.sub));
    body.appendChild(box);
  },

  finale(body,s){
    const box=el('div','answer');
    /* Без картинки рамку не рисуем: было `src="../img/undefined"` и 404 на
       каждой загрузке у всех досок 6 и 7 классов — у них финал без фото. */
    box.innerHTML=`${s.img?`<div class="ph"><img src="${IMG}${s.img}" alt=""></div>`:''}
      <div class="acol">
        ${s.note?`<div class="lead">${s.note}</div>`:''}
        <div class="qlist">${s.questions.map(q=>`<div>${q}</div>`).join('')}</div>
        <div class="paper"><b>В тетрадь:</b> ${s.paper}</div>
      </div>`;
    body.appendChild(box);
  }
};

/* ——— сборка ——— */
function stopTpr(){if(tprTimer){clearInterval(tprTimer);tprTimer=null}}

function build(deck){
  document.title='Доска · '+deck.unit;
  if(deck.theme){
    const r=document.documentElement.style;
    Object.entries(deck.theme).forEach(([k,v])=>r.setProperty('--'+k,v));
  }
  if(deck.skin)document.body.classList.add('skin-'+deck.skin);
  /* учитель может выбрать стиль сам (можно отключить window.BOARD_SKINS=false) */
  if(typeof window==='undefined'||window.BOARD_SKINS!==false)setupSkinPicker(deck);
  const host=document.getElementById('deck');
  deck.slides.forEach(s=>{
    const sec=el('section','slide'+(s.bg?' bleed':''));
    // плотные слайды: много блоков в кадре — кегль ниже (см. CSS .slide[data-dense])
    if(['rule','cards','quiz','compare','error'].includes(s.type))sec.dataset.dense='1';
    if(s.type==='art')sec.classList.add('art');   // гео: арт-кадр во всю доску
    sec.dataset.type=s.type;
    if(s.bg){
      const b=el('div','bgimg');
      b.innerHTML=`<img src="${IMG}${s.bg}" alt="">`;
      sec.appendChild(b);
    }
    /* подпись шага СЧИТАЕТСЯ из ленты, а не берётся из данных: пока её писали
       руками, она называла шаг иначе, чем горит в ленте (164 подписи из 262) */
    sec.appendChild(el('div','kicker',
      (typeof s.step==='number'&&STEPS[s.step])?`Шаг ${s.step+1} · ${STEPS[s.step]}`:(s.kicker||'')));
    sec.appendChild(el('h1','',s.title+(s.em?` <em>${s.em}</em>`:'')));
    const body=el('div','body');
    sec.appendChild(body);
    (TYPES[s.type]||(()=>{}))(body,s);
    if(s.lead)sec.appendChild(el('div','lead',s.lead));
    host.appendChild(sec);
  });
  slides=[...host.children];

  const ribbon=document.getElementById('ribbon');
  STEPS.forEach((n,i)=>{
    const b=el('button','step',`<span class="bar"></span><span class="name">${n}</span>`);
    b.onclick=()=>{const k=deck.slides.findIndex(s=>s.step===i);if(k>=0)go(k)};
    ribbon.appendChild(b);
  });
  const stepEls=[...ribbon.children];

  window.go=function(i){
    cur=Math.max(0,Math.min(slides.length-1,i));
    slides.forEach((s,k)=>s.classList.toggle('on',k===cur));
    const active=deck.slides[cur].step;
    stepEls.forEach((e,k)=>{e.classList.toggle('now',k===active);e.classList.toggle('done',k<active)});
    document.getElementById('count').textContent=(cur+1)+' / '+slides.length;
    document.getElementById('say').innerHTML=deck.slides[cur].say||'';
    /* гео-режимы кадра + автопрокрутка ленты к активному шагу (безвредно для англ) */
    document.body.classList.toggle('bgslide', !!deck.slides[cur].bg);
    document.body.classList.toggle('artslide', deck.slides[cur].type==='art');
    try{stepEls[active]&&stepEls[active].scrollIntoView({inline:'center',block:'nearest'});}catch(e){}
    /* каскадный вход — один раз при первом показе слайда */
    const sec=slides[cur], tp=deck.slides[cur].type;
    if(!sec.dataset.fx){
      sec.dataset.fx='1';
      if(FX_SEL[tp])FX.enter([...sec.querySelectorAll(FX_SEL[tp])]);
      if(FX_FADE[tp])FX.enter([...sec.querySelectorAll(FX_FADE[tp])],true);
    }
    stopTpr();
  };
  /* прямая ссылка из библиотеки заданий: ?s=<индекс слайда> — открывает
     доску сразу на нужном слайде, а не с первого */
  const wantS=parseInt(new URLSearchParams(location.search).get('s'),10);
  go((wantS>=0 && wantS<slides.length)?wantS:0);
}

document.getElementById('next').onclick=()=>go(cur+1);
document.getElementById('prev').onclick=()=>go(cur-1);
document.getElementById('eye').onclick=toggleNotes;
function toggleNotes(){
  notes=!notes;
  document.getElementById('say').classList.toggle('show',notes);
  document.getElementById('eye').classList.toggle('on',notes);
}
addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'||e.key===' '||e.key==='PageDown'){e.preventDefault();go(cur+1)}
  if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();go(cur-1)}
  if(e.key==='t'||e.key==='T'||e.key==='е'||e.key==='Е'){toggleNotes()}
});

const unit=(location.search.match(/[?&]u=([\w-]+)/)||[,'unit3'])[1];

/* ---- переключатель стиля (пресеты = скины + их палитры) ---- */
const SKIN_PRESETS={
 'бумага':{skin:'',theme:{bg:'#FAF6EA',panel:'#FFFFFF',panel2:'#F2ECDD',line:'#E4DCCA',ink:'#17130E',muted:'#65615C',accent:'#B54D06',accent2:'#14532D'}},
 'дневник':{skin:'travel',theme:{bg:'#E9C792',panel:'#F5F1E6',panel2:'#E7CDA0',line:'#C9A97B',ink:'#312415',muted:'#6E5C40',accent:'#B12714',accent2:'#424E78'}},
 'мел':{skin:'chalk',theme:{bg:'#2F3A35',panel:'#37443E',panel2:'#28322D',line:'#5A6B62',ink:'#F2EEDF',muted:'#ADBBAF',accent:'#F5C84C',accent2:'#8FD6B5'}},
 'спорт':{skin:'sport',theme:{bg:'#EEF2F8',panel:'#FFFFFF',panel2:'#E2E9F4',line:'#C9D4E6',ink:'#14213D',muted:'#55648A',accent:'#E63946',accent2:'#1D4ED8'}}};
function applySkinPreset(name){
  const p=SKIN_PRESETS[name];if(!p)return;
  document.body.className=document.body.className.replace(/\bskin-\S+/g,'').trim();
  if(p.skin)document.body.classList.add('skin-'+p.skin);
  const r=document.documentElement.style;
  Object.entries(p.theme).forEach(([k,v])=>r.setProperty('--'+k,v));
}
function setupSkinPicker(deck){
  const names=Object.keys(SKIN_PRESETS);
  const saved=localStorage.getItem('board_skin_'+unit);
  if(saved&&SKIN_PRESETS[saved])applySkinPreset(saved);
  const btn=document.createElement('button');
  btn.className='nb';btn.id='skinbtn';btn.textContent='🎨';
  btn.title='Стиль доски: нажимайте, чтобы выбрать';
  const nav=document.querySelector('.nav')||document.getElementById('eye').parentElement;
  nav.insertBefore(btn,document.getElementById('eye'));
  btn.onclick=()=>{
    const cur=localStorage.getItem('board_skin_'+unit);
    const i=names.indexOf(cur);
    const next=names[(i+1)%names.length];
    localStorage.setItem('board_skin_'+unit,next);
    applySkinPreset(next);
    btn.textContent='🎨 '+next;
    clearTimeout(btn._t);btn._t=setTimeout(()=>{btn.textContent='🎨';},1600);
  };
}
// карта живой озвучки (если у колоды она есть); нет файла — тихо остаёмся на синтезаторе
fetch(`data/audio-map.json?v=${Date.now()}`,{cache:'no-store'})
  .then(r=>r.ok?r.json():{}).then(m=>{AUDIO_MAP=m||{}}).catch(()=>{})
  .then(()=>fetch(`data/${unit}.json?v=${Date.now()}`,{cache:'no-store'}))
  .then(r=>r.json()).then(build)
  .catch(()=>{document.getElementById('deck').innerHTML=
    '<section class="slide on"><h1>Нет данных доски</h1><div class="lead">Файл board/data/'+unit+'.json не найден.</div></section>'});
