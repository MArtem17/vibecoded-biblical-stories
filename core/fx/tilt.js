/* TiltFX — «живая карта»: плитка-карточка наклоняется за пальцем/курсором
   (порт идеи tilt-card на ES5/vanilla, без библиотек). Аддитивно: при
   prefers-reduced-motion не делает ничего; только transform, поведение
   кликов/ссылок не меняется. Использование: TiltFX.attach(el[, {max,scale}]). */
(function(){
  "use strict";
  var RED=false;
  try{ RED=!!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }catch(e){}
  function attach(el, opts){
    if(RED || !el || el._tiltOn) return; el._tiltOn=1;
    opts=opts||{};
    var MAX=opts.max||8, SCALE=opts.scale||1.02, on=false;
    function move(x,y){
      var r=el.getBoundingClientRect(); if(!r.width||!r.height) return;
      var px=(x-r.left)/r.width-.5, py=(y-r.top)/r.height-.5;
      el.style.transition = on ? "transform .08s" : "transform .18s"; on=true;
      el.style.transform = "perspective(700px) rotateX("+(-py*2*MAX).toFixed(2)+"deg)"+
        " rotateY("+(px*2*MAX).toFixed(2)+"deg) scale("+SCALE+")";
    }
    function reset(){ on=false;
      el.style.transition="transform .35s cubic-bezier(.22,1.35,.36,1)";
      el.style.transform=""; }
    el.addEventListener("mousemove", function(e){ move(e.clientX, e.clientY); });
    el.addEventListener("mouseleave", reset);
    el.addEventListener("touchstart", function(e){ if(e.touches[0]) move(e.touches[0].clientX, e.touches[0].clientY); }, {passive:true});
    el.addEventListener("touchmove",  function(e){ if(e.touches[0]) move(e.touches[0].clientX, e.touches[0].clientY); }, {passive:true});
    el.addEventListener("touchend", reset);
    el.addEventListener("touchcancel", reset);
  }
  window.TiltFX = { attach: attach };
})();
