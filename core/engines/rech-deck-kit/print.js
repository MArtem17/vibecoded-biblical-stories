/* rech-deck-kit/print.js — просмотрщик карт в печатном виде (ES5).
   Рендерит все стороны колоды из window.DECK_CONTENT в раскладке печатных
   макетов (см. tools/python/build_print_cards.py). Печать браузером
   (Ctrl+P / Поделиться → Напечатать) даёт 1 карту = 1 страницу 76×111 мм. */
(function(){
'use strict';
var DATA=window.DECK_CONTENT||{cards:[]};
var CFG=window.DECK_CONFIG||{};

document.body.innerHTML=
  '<div class="pwrap">'+
    '<div class="phead">'+
      '<div><b>'+(CFG.title||DATA.deck||'')+' · печатный вид</b><br>'+
      '<span>76×111 мм · печать браузером: 1 карта = 1 страница</span>'+
      (CFG.kit?'<br><span class="pkit">Набор для типографии: '+CFG.kit+'</span>':'')+'</div>'+
      (CFG.docHref?'<a href="'+CFG.docHref+'">📖 Вкладыш</a>':'')+
      (CFG.seriesDoc?'<a href="'+CFG.seriesDoc+'"'+(CFG.docHref?' style="margin-left:0"':'')+'>📕 Методика серии</a>':'')+
      '<a href="index.html"'+((CFG.seriesDoc||CFG.docHref)?' style="margin-left:0"':'')+'>‹ В приложение</a>'+
    '</div>'+
    '<div class="sheet" id="sheet"></div>'+
    (CFG.chips?'<div class="chipsec" id="chipsec"><div class="chiplab">Вырубной лист фишек (в коробке 1 шт., A4, картон 300): '+
      CFG.chips.red+' гласных · '+CFG.chips.blue+' твёрдых · '+CFG.chips.green+' мягких · '+CFG.chips.stress+' ударения, фишка 20×20 мм</div>'+
      '<div class="chipgrid" id="chipgrid"></div></div>':'')+
  '</div>';

var sheet=document.getElementById('sheet');

function el(tag,cls,html){
  var e=document.createElement(tag);
  if(cls)e.className=cls;
  if(html!=null)e.innerHTML=html;
  return e;
}
function imgbox(src){
  var b=el('div','pimgbox');
  var i=document.createElement('img');
  i.src=src;i.alt='';i.loading='lazy';
  b.appendChild(i);
  return b;
}
function num(side){
  return el('div','pnum','%02d'.replace('%02d',(side.id<10?'0':'')+side.id)+(side.side==='b'?' · 2':' · 1'));
}

function cardBoltalka(s){
  var c=el('div','pcard');
  var row=el('div','prow');
  row.appendChild(el('span','psyll'+(s.syllable.length>10?' small':''),s.syllable));
  row.appendChild(el('span','pplay','▶'));
  c.appendChild(row);
  c.appendChild(imgbox(s.image));
  c.appendChild(el('div','pverse',s.verse));
  c.appendChild(num(s));
  return c;
}
function cardSounds(s){
  var c=el('div','pcard');
  c.appendChild(el('div','ptitle',s.title));
  var g=el('div','pgrid'),i;
  for(i=0;i<s.items.length;i++){
    var cell=el('div','pcell');
    cell.appendChild(imgbox(s.items[i].image));
    cell.appendChild(el('div','plab',s.items[i].label));
    g.appendChild(cell);
  }
  c.appendChild(g);
  c.appendChild(num(s));
  return c;
}
function cardChisto(s){
  var c=el('div','pcard pchisto');
  c.appendChild(imgbox(s.image));
  var corner=el('div','pcorner','<b>'+s.sound+'</b>');
  corner.style.borderTopColor=s.color;
  c.appendChild(corner);
  var line=el('div','pline');
  line.appendChild(el('span',null,s.verse));
  line.appendChild(el('span','pplay','▶'));
  c.appendChild(line);
  c.appendChild(num(s));
  return c;
}

/* слоги («Читаем по слогам»): буква / слог / слово */
var SL_BLUE='#4A7BC8',SL_RED='#E05B5B',SL_GREEN='#5BAE6B';
function sylSpan(cons,vowel){
  return '<span style="color:'+SL_BLUE+'">'+cons+'</span><span style="color:'+SL_RED+'">'+vowel+'</span>';
}
function letterSpan(s){
  var col=(s.color&&s.color.charAt(0)==='#')?s.color:'#000';
  return '<span style="color:'+col+'">'+s.letter+'</span>'+
    (s.color==='diagonal_blue_green'?
      '<span class="pdmark" style="background:linear-gradient(135deg,'+SL_BLUE+' 50%,'+SL_GREEN+' 50%)"></span>':'');
}
function cardLetter(s){
  var c=el('div','pcard psl');
  var row=el('div','prow pslrow');
  row.appendChild(el('span','pslbig',letterSpan(s)));
  row.appendChild(el('span','pplay','▶'));
  c.appendChild(row);
  c.appendChild(imgbox(s.image));
  c.appendChild(num(s));
  return c;
}
function cardSyllable(s){
  var c=el('div','pcard psl');
  var box=el('div','psylbox');
  box.appendChild(el('b',null,sylSpan(s.cons,s.vowel)));
  c.appendChild(box);
  var row=el('div','prow pslfoot');
  row.appendChild(el('span','pplay','▶'));
  c.appendChild(row);
  c.appendChild(num(s));
  return c;
}
function cardWord(s){
  var c=el('div','pcard psl');
  var row=el('div','prow pslrow');
  row.appendChild(el('span','pslword',s.syllabified));
  row.appendChild(el('span','pplay','▶'));
  c.appendChild(row);
  c.appendChild(imgbox(s.image));
  c.appendChild(num(s));
  return c;
}

/* истории («Связная речь»): лицо — чистый кадр БЕЗ номера и текста
   (иначе задача сортировки умирает); оборот — маркер истории + вопрос + словарик */
function cardStoryFace(s){
  var c=el('div','pcard pstface');
  c.appendChild(imgbox(s.image));
  return c;
}
function cardStoryBack(s){
  var c=el('div','pcard pstback');
  var bar=el('div','pstbar','<b>'+s.story_title+'</b>');
  bar.style.background=s.color;
  c.appendChild(bar);
  c.appendChild(el('div','pstq',s.question));
  if(s.vocab&&s.vocab.length)
    c.appendChild(el('div','pstv','Слова: '+s.vocab.join(', ')));
  c.appendChild(el('div','pnum','кадр '+s.frame+' из '+s.of_frames+' · №'+(s.id<10?'0':'')+s.id));
  return c;
}

/* фонетика: печатаются только printed-карты, каждая — лицо + оборот со схемой */
function cardRazborFace(s){
  var c=el('div','pcard pfz');
  c.appendChild(el('div','ptitle',s.word));
  c.appendChild(imgbox(s.image));
  c.appendChild(el('div','pverse','Разбери слово по звукам!'));
  c.appendChild(el('div','pnum',(s.id<10?'0':'')+s.id+' · лицо'));
  return c;
}
function cardRazborBack(s){
  var c=el('div','pcard pfz');
  c.appendChild(el('div','ptitle',s.word));
  var box=el('div','pschbox');
  var d=Math.min(19,Math.floor(88/s.sounds.length));
  box.appendChild(window.RECH_SCHEMA.render(s.sounds,{d:d,colors:DATA.colors,cq:true}));
  c.appendChild(box);
  c.appendChild(el('div','pnum',(s.id<10?'0':'')+s.id+' · оборот'));
  return c;
}

(function(){
  var i,s;
  for(i=0;i<DATA.cards.length;i++){
    s=DATA.cards[i];
    if(s.digital)continue; /* цифровой блок — только в приложении */
    if(s.sounds&&typeof s.sounds!=='string'){
      if(s.printed){sheet.appendChild(cardRazborFace(s));sheet.appendChild(cardRazborBack(s));}
    }
    else if(s.story&&s.frame){sheet.appendChild(cardStoryFace(s));sheet.appendChild(cardStoryBack(s));}
    else if(s.type==='letter')sheet.appendChild(cardLetter(s));
    else if(s.type==='syllable')sheet.appendChild(cardSyllable(s));
    else if(s.type==='word')sheet.appendChild(cardWord(s));
    else if(s.type==='sounds')sheet.appendChild(cardSounds(s));
    else if(s.group&&s.color)sheet.appendChild(cardChisto(s));
    else sheet.appendChild(cardBoltalka(s));
  }
  /* вырубной лист фишек (конфиг chips) — веб-превью; макет A4 собирает
     tools/python/build_print_cards.py --chips-pdf */
  if(CFG.chips){
    var g=document.getElementById('chipgrid');
    var mk=function(color,n,mark){
      var k;
      for(k=0;k<n;k++){
        var ch=el('div','chip',mark||'');
        if(color)ch.style.background=window.RECH_SCHEMA.colorOf(color,DATA.colors);
        g.appendChild(ch);
      }
    };
    mk('red',CFG.chips.red);mk('blue',CFG.chips.blue);mk('green',CFG.chips.green);
    mk(null,CFG.chips.stress,'´');
  }
})();
})();
