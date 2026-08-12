/* rech-deck-kit/schema.js — рендер схемы звукового разбора (ES5, DOM).
   Двойное назначение: приложение (deck.js) и печатный просмотрщик (print.js).
   Геометрия зеркалит печатный конвейер tools/python/build_print_cards.py.

   window.RECH_SCHEMA.render(sounds, opts) → DOM-элемент схемы.
     sounds — массив {L,S,c,voiced,stress} из content.json;
     opts.d          — диаметр кружка в px (по умолчанию 56);
     opts.colors     — {red,blue,green} → hex (из DECK_CONTENT.colors);
     opts.showS      — печатать звук внутри кружка (по умолчанию true);
     opts.counts     — {letters,sounds} → подпись «букв N · звуков M».
   window.RECH_SCHEMA.bell(size) → SVG-колокольчик (звонкий согласный). */
(function(){
'use strict';

function bell(size){
  var s='<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" aria-hidden="true">'+
    '<path d="M12 3c-3.3 0-5.5 2.4-5.5 6v4.2L4.6 16.6c-.3.5 0 1.4.8 1.4h13.2c.8 0 1.1-.9.8-1.4l-1.9-3.4V9c0-3.6-2.2-6-5.5-6z" fill="#fff"/>'+
    '<circle cx="12" cy="20.4" r="1.8" fill="#fff"/></svg>';
  return s;
}

function colorOf(c,colors){
  if(c==='red')return (colors&&colors.vowel)||'#E05B5B';
  if(c==='blue')return (colors&&colors.hard)||'#4A7BC8';
  return (colors&&colors.soft)||'#5BAE6B';
}

function render(sounds,opts){
  opts=opts||{};
  var d=opts.d||56;
  /* opts.cq — размеры в cqw (контейнерные единицы, печатная карта) вместо px */
  var U=opts.cq?'cqw':'px';
  function u(x){return (Math.round(x*100)/100)+U;}
  var wrap=document.createElement('div');
  wrap.className='sch';
  var row=document.createElement('div');
  row.className='schrow';
  row.style.gap=u(d*0.18);
  var i,s;
  for(i=0;i<sounds.length;i++){
    s=sounds[i];
    var tok=document.createElement('div');
    tok.className='schtok';
    tok.style.width=u(d);
    /* знак ударения над кружком */
    var st=document.createElement('div');
    st.className='schstress';
    st.style.height=u(d*0.42);
    st.style.fontSize=u(d*0.5);
    st.textContent=s.stress?'´':'';
    tok.appendChild(st);
    /* кружок звука */
    var c=document.createElement('div');
    c.className='schc';
    c.style.width=u(d);c.style.height=u(d);
    c.style.background=colorOf(s.c,opts.colors);
    c.style.fontSize=u(d*0.34);
    if(opts.showS!==false)c.textContent=s.S;
    if(s.voiced){
      var b=document.createElement('span');
      b.className='schbell';
      b.style.width=u(d*0.34);b.style.height=u(d*0.34);
      b.innerHTML=bell(opts.cq?24:Math.round(d*0.30));
      if(opts.cq){var sv=b.firstChild;sv.setAttribute('width','100%');sv.setAttribute('height','100%');}
      c.appendChild(b);
    }
    tok.appendChild(c);
    /* буква под кружком (у второго звука йотированной — пусто) */
    var L=document.createElement('div');
    L.className='schl';
    L.style.fontSize=u(d*0.4);
    L.style.minHeight=u(d*0.55);
    L.textContent=s.L||'';
    tok.appendChild(L);
    row.appendChild(tok);
  }
  wrap.appendChild(row);
  if(opts.counts){
    var cnt=document.createElement('div');
    cnt.className='schcnt';
    cnt.style.fontSize=u(d*0.34);
    cnt.textContent='букв '+opts.counts.letters+' · звуков '+opts.counts.sounds;
    wrap.appendChild(cnt);
  }
  return wrap;
}

window.RECH_SCHEMA={render:render,bell:bell,colorOf:colorOf};
})();
