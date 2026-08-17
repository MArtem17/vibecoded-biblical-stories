/* Конструктор ДЗ — движок. Был вшит в decks/angliyskiy-5/teacher/hw.html:
   логика жила в колоде (запрещено CLAUDE.md), и из-за этого конструктора не
   было у 6 и 7 классов — копировать страницу с логикой значило бы форкнуть
   её на три колоды. Здесь общий движок, колода даёт только свои данные:
     window.HW_CONFIG = { manifest:[…], extra:[…] }
   Наборы готового ДЗ читаются из teacher/hw-variants.json рядом со страницей
   (генератор — tools/node/gen-hw-variants.js). */
var CFG=window.HW_CONFIG||{};
var MANIFEST=CFG.manifest||[];
var EXTRA=CFG.extra||[];
/* группировка механик для бейджа */
var KIND={match:'drag',buckets:'drag',table:'drag',gaptext:'drag',build:'drag',tree:'drag',hotspot:'drag',vowels:'drag',objcards:'drag',order:'drag',dates:'drag',clocks:'drag',cities:'drag',calendar:'drag',wheel:'drag',colormix:'drag',objcolors:'drag',
radio:'choice',toggle:'choice',highlight:'choice',finderror:'choice',lines:'choice',phoneslisten:'choice',abc:'choice',pairs:'choice',spelling:'choice',dialog:'choice',
typed:'type',form:'type',dictation:'type',crossword:'type',snake:'type',
wordsearch:'game',memory:'game',anagram:'game',flashcards:'game',reorder:'game',speaking:'game'};
var KINDNAME={drag:'перетащи',choice:'выбери',type:'впиши',game:'игра'};

var sel=[]; // порядок выбора сохраняем
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

/* Копирование в буфер. navigator.clipboard требует «безопасный контекст»
   (https/localhost) — сайт раздаётся обычным http (docs/deploy.md), там
   этого API нет вовсе, а старый код всё равно показывал «✓», хотя ничего
   не копировал. Пробуем Clipboard API, при неудаче — textarea + execCommand
   (работает без https); done(false) — вызывающий код должен честно
   сказать, что не скопировалось, а не соврать галочкой. */
function fallbackCopy(text){
  try{
    var ta=document.createElement('textarea');
    ta.value=text; ta.setAttribute('readonly','');
    ta.style.position='fixed'; ta.style.top='-9999px'; ta.style.left='-9999px';
    document.body.appendChild(ta);
    ta.focus(); ta.select(); ta.setSelectionRange(0,text.length);
    var ok=document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }catch(e){ return false; }
}
function copyText(text,done){
  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(text).then(function(){done(true);}, function(){done(fallbackCopy(text));});
  }else{
    done(fallbackCopy(text));
  }
}

/* готовые наборы */
fetch('hw-variants.json?v='+Date.now(),{cache:'no-store'}).then(r=>r.json()).then(function(vs){
  var box=document.getElementById('ready'), list=document.getElementById('readylist');
  var LV=[['base','g','база'],['std','s','стандарт'],['chal','c','вызов'],['exam','e','экзамен'],['voc','v','словарь'],['cult','k','культура'],['exit','x','билетик'],['rev','r','повторение']];
  vs.forEach(function(u){
    var row=document.createElement('div'); row.className='rrow';
    var name=document.createElement('b'); name.textContent=u.unit; row.appendChild(name);
    LV.forEach(function(lv){
      var ids=u.sets[lv[0]]||[]; if(!ids.length) return;
      var url=new URL('../index.html?hw='+ids.join(','), location.href).href;
      var a=document.createElement('a'); a.className='lvl '+lv[1]; a.href=url;
      a.innerHTML='<i></i>'+lv[2]+' · '+ids.length;
      var cp=document.createElement('span'); cp.className='cp'; cp.textContent='⧉'; cp.title='Скопировать ссылку';
      cp.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation();
        copyText(url,function(ok){
          if(ok){ cp.textContent='✓'; setTimeout(function(){cp.textContent='⧉';},1200); }
          else{ window.prompt('Не скопировалось само — скопируй вручную (уже выделено):', url); }
        });
      });
      a.appendChild(cp); row.appendChild(a);
    });
    list.appendChild(row);
  });
  if(vs.length) box.style.display='block';
}).catch(function(){});

(async function(){
  var units=[];
  for(var i=0;i<MANIFEST.length;i++){
    try{ units.push(await (await fetch(MANIFEST[i]+'?v='+Date.now(),{cache:'no-store'})).json()); }catch(e){}
  }
  for(var i=0;i<EXTRA.length;i++){
    try{ var bk=await (await fetch(EXTRA[i]+'?v='+Date.now(),{cache:'no-store'})).json(); (bk.units||[]).forEach(function(u){units.push(u);}); }catch(e){}
  }
  var list=document.getElementById('list'); list.innerHTML='';
  units.forEach(function(u,ui){
    var box=document.createElement('div'); box.className='unit'+(ui===1?' open':'');
    var total=0, html='';
    u.pages.forEach(function(pg){
      var rule=(pg.blocks.find(function(b){return b.t==='rule'})||{}).title||'';
      var exs=pg.blocks.filter(function(b){return b.t==='ex'&&b.id});
      if(!exs.length) return;
      html+='<div class="sect">'+esc(rule)+'</div>';
      exs.forEach(function(b){
        total++;
        var kind=KIND[b.type]||'choice';
        html+='<label class="row"><input type="checkbox" data-id="'+esc(b.id)+'">'+
          '<span class="ty '+kind+'">'+KINDNAME[kind]+'</span>'+
          '<span class="tt">'+esc(b.title||b.type)+'</span></label>';
      });
    });
    box.innerHTML='<div class="uh"><b>'+esc(u.unit)+'</b><span class="cnt">'+total+' упр.</span><span class="car">▶</span></div>'+
      '<div class="ubody">'+html+'</div>';
    box.querySelector('.uh').addEventListener('click',function(){box.classList.toggle('open');});
    list.appendChild(box);
  });

  var linkEl=document.getElementById('link'), cntEl=document.getElementById('cnt'), qrbox=document.getElementById('qrbox');
  function url(){ return sel.length? new URL('../index.html?hw='+sel.join(','), location.href).href : ''; }
  function upd(){
    cntEl.textContent=sel.length+' выбрано';
    linkEl.textContent=sel.length?url():'— отметь упражнения —';
    if(qrbox.classList.contains('show')) drawQR();
  }
  function drawQR(){
    qrbox.innerHTML='';
    if(!sel.length||!window.qrcode) return;
    try{ var qr=qrcode(0,'M'); qr.addData(url()); qr.make(); qrbox.innerHTML=qr.createSvgTag({cellSize:3,margin:2}); }catch(e){}
  }
  list.addEventListener('change',function(e){
    var id=e.target.getAttribute('data-id'); if(!id) return;
    if(e.target.checked){ if(sel.indexOf(id)<0) sel.push(id); }
    else sel=sel.filter(function(x){return x!==id;});
    upd();
  });
  document.getElementById('copy').addEventListener('click',function(){
    if(!sel.length) return;
    var b=this, old=b.textContent, u=url();
    copyText(u,function(ok){
      if(ok){ b.textContent='Скопировано ✓'; setTimeout(function(){b.textContent=old;},1500); }
      else{ window.prompt('Не скопировалось само — скопируй вручную (уже выделено):', u); }
    });
  });
  document.getElementById('qrbtn').addEventListener('click',function(){ qrbox.classList.toggle('show'); drawQR(); });
  document.getElementById('clear').addEventListener('click',function(){
    sel=[]; list.querySelectorAll('input:checked').forEach(function(i){i.checked=false;}); upd();
  });
})();
