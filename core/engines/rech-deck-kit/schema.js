/* rech-deck-kit/schema.js — рендер схемы звукового разбора (ES5, DOM).
   Двойное назначение: приложение (deck.js) и печатный просмотрщик (print.js).
   Геометрия зеркалит печатный конвейер tools/python/build_print_cards.py.

   window.RECH_SCHEMA.render(sounds, opts) → DOM-элемент схемы.
     sounds — массив {L,S,c,voiced,stress} из content.json;
     opts.d          — сторона квадрата в px (по умолчанию 56);
     opts.colors     — {red,blue,green} → hex (из DECK_CONTENT.colors).
   Схема — только цветные квадраты: транскрипцию, буквы, колокольчики и
   подсчёт «букв/звуков» не рисуем (дошкольникам не даём — правка методистов). */
(function(){
'use strict';

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
    /* знак ударения над квадратом — только если opts.stress
       (по методике дошкольникам знак ударения не даём) */
    if(opts.stress){
      var st=document.createElement('div');
      st.className='schstress';
      st.style.height=u(d*0.42);
      st.style.fontSize=u(d*0.5);
      st.textContent=s.stress?'´':'';
      tok.appendChild(st);
    }
    /* квадрат звука — ТОЛЬКО цвет: без транскрипции, без буквы, без
       колокольчика (правка методистов: на всех схемах только цветные
       квадраты — буквенный анализ и значки — школьный материал) */
    var c=document.createElement('div');
    c.className='schc';
    c.style.width=u(d);c.style.height=u(d);
    c.style.background=colorOf(s.c,opts.colors);
    c.style.fontSize=u(d*0.34);
    tok.appendChild(c);
    row.appendChild(tok);
  }
  wrap.appendChild(row);
  return wrap;
}

window.RECH_SCHEMA={render:render,colorOf:colorOf};
})();
