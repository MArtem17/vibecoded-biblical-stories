/* core/components/wild-globe — общий 2D-глобус звериной серии (Птицы/Животные/
   Подводный мир). Один источник для всех колод: контент приходит данными
   (WILD_LAND, WILD_REGIONS, WILD_FLYWAYS), движок про конкретную колоду не знает.
   Ортографическая проекция на canvas: вращение перетаскиванием, авто-вращение,
   зум (колесо/щипок), раскраска суши по зонам. Нажатие на зону → callback(id).
   Дополнительный (опциональный) слой — ПУТИ МИГРАЦИИ/ТЕЧЕНИЯ (flyways):
   анимированные дуги со стрелкой направления и меткой; нажатие → callback пути.
   Колода без flyways просто не вызывает setFlyways — слой не рисуется. ES5. */
window.WildGlobe = (function(){
  "use strict";
  var cvs, ctx, dpr=1, W=0, H=0, R=0, baseR=0, cx=0, cy=0;
  var land=[], regions=[], onPick=null, started=false;
  var rotL=14, rotF=-6, zoom=1, dragging=false, moved=0, lastX=0, lastY=0, vel=0.12, idle=0, raf=0;
  var pinchD=0, pinching=false, pins=[];
  var flyways=[], showFly=false, onFly=null, fpins=[], dashPhase=0;   // пути миграции птиц
  var DEG=Math.PI/180;

  function project(lon,lat){
    var l=(lon-rotL)*DEG, p=lat*DEG, p0=rotF*DEG;
    var cosl=Math.cos(l), cosp=Math.cos(p), sinp=Math.sin(p), cosp0=Math.cos(p0), sinp0=Math.sin(p0);
    var cosc=sinp0*sinp+cosp0*cosp*cosl;
    return { x:cx+R*(cosp*Math.sin(l)), y:cy-R*(cosp0*sinp-sinp0*cosp*cosl), vis:cosc>=-0.015 };
  }
  function resize(){
    var r=cvs.getBoundingClientRect(); dpr=Math.min(2,window.devicePixelRatio||1);
    W=Math.max(1,r.width); H=Math.max(1,r.height);
    cvs.width=Math.round(W*dpr); cvs.height=Math.round(H*dpr); ctx.setTransform(dpr,0,0,dpr,0,0);
    cx=W/2; cy=H/2; baseR=Math.min(W,H)*0.48; R=baseR*zoom;
  }
  function setZoom(z){ zoom=Math.max(1,Math.min(2.2,z)); R=baseR*zoom; idle=0; }
  function hexA(h,a){ var n=parseInt(h.slice(1),16); return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')'; }
  function roundRect(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }

  function strokeArc(pts){ ctx.beginPath(); var on=false;
    for(var i=0;i<pts.length;i++){ var q=pts[i]; if(q.vis){ if(on)ctx.lineTo(q.x,q.y); else{ctx.moveTo(q.x,q.y);on=true;} } else on=false; } ctx.stroke(); }
  function para(lat){ var a=[]; for(var lon=-180;lon<=180;lon+=4)a.push(project(lon,lat)); strokeArc(a); }
  function meri(lon){ var a=[]; for(var lat=-90;lat<=90;lat+=4)a.push(project(lon,lat)); strokeArc(a); }
  function landPath(){ ctx.beginPath();
    for(var j=0;j<land.length;j++){ var poly=land[j], on=false;
      for(var i=0;i<poly.length;i++){ var q=project(poly[i][0],poly[i][1]);
        if(q.vis){ if(on)ctx.lineTo(q.x,q.y); else{ctx.moveTo(q.x,q.y);on=true;} } else on=false; } } }

  /* ---------- Пути миграции (flyways) ---------- */
  function samplePath(path){                 // сгущаем опорные точки в плавную дугу
    var pts=[];
    for(var i=0;i<path.length-1;i++){
      var a=path[i], b=path[i+1];
      var dl=b[0]-a[0]; if(dl>180)dl-=360; else if(dl<-180)dl+=360;   // короткая сторона по долготе
      for(var s=0;s<10;s++){ var t=s/10; pts.push([a[0]+dl*t, a[1]+(b[1]-a[1])*t]); }
    }
    pts.push(path[path.length-1]);
    return pts;
  }
  function drawFlyways(){
    fpins=[]; if(!showFly||!flyways.length)return;
    ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,R,0,7); ctx.clip();     // только по видимой сфере
    ctx.lineCap='round'; ctx.lineJoin='round';
    for(var f=0;f<flyways.length;f++){
      var fw=flyways[f], pts=samplePath(fw.path), pr=[];
      for(var i=0;i<pts.length;i++)pr.push(project(pts[i][0],pts[i][1]));
      // тень-подложка
      ctx.setLineDash([]); ctx.strokeStyle=hexA(fw.color,0.22); ctx.lineWidth=7; strokeArc(pr);
      // анимированная пунктирная дуга (бегут «к зимовке»)
      ctx.setLineDash([2,9]); ctx.lineDashOffset=-dashPhase; ctx.strokeStyle=fw.color; ctx.lineWidth=3.2; strokeArc(pr);
      ctx.setLineDash([]);
      drawArrow(pr, fw.color);
      // метка пути (нажимаемая) — в середине маршрута
      var mid=pr[Math.floor(pr.length/2)];
      if(mid&&mid.vis){ fpins.push({id:fw.id,x:mid.x,y:mid.y}); drawFlyBadge(mid.x,mid.y,fw); }
    }
    ctx.restore();
  }
  function drawArrow(pr,color){                 // стрелка у конца видимого участка дуги
    var b=null,a=null;
    for(var i=pr.length-1;i>0;i--){ if(pr[i].vis&&pr[i-1].vis){ b=pr[i]; a=pr[i-1]; break; } }
    if(!b||!a)return;
    var ang=Math.atan2(b.y-a.y,b.x-a.x), h=9;
    ctx.fillStyle=color; ctx.beginPath();
    ctx.moveTo(b.x,b.y);
    ctx.lineTo(b.x-h*Math.cos(ang-0.5),b.y-h*Math.sin(ang-0.5));
    ctx.lineTo(b.x-h*Math.cos(ang+0.5),b.y-h*Math.sin(ang+0.5));
    ctx.closePath(); ctx.fill();
  }
  function drawFlyBadge(x,y,fw){
    ctx.font='700 12px Inter,system-ui,sans-serif';
    ctx.beginPath(); ctx.arc(x,y,11,0,7); ctx.fillStyle='#fff'; ctx.fill();
    ctx.lineWidth=2.6; ctx.strokeStyle=fw.color; ctx.stroke();
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(fw.emoji||'✈️',x,y+0.5);
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    var g=ctx.createRadialGradient(cx,cy,R*0.62,cx,cy,R*1.2);
    g.addColorStop(0,'rgba(120,180,215,0)'); g.addColorStop(1,'rgba(120,180,215,0.22)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,R*1.2,0,7); ctx.fill();
    var og=ctx.createRadialGradient(cx-R*0.32,cy-R*0.36,R*0.15,cx,cy,R);
    og.addColorStop(0,'#c7e6f2'); og.addColorStop(0.55,'#8ec4dd'); og.addColorStop(1,'#4f89aa');
    ctx.fillStyle=og; ctx.beginPath(); ctx.arc(cx,cy,R,0,7); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,R,0,7); ctx.clip();       // клип по сфере
    ctx.strokeStyle='rgba(255,255,255,0.16)'; ctx.lineWidth=1;
    for(var lat=-60;lat<=60;lat+=30)para(lat);
    for(var lon=-180;lon<180;lon+=30)meri(lon);
    ctx.fillStyle='#6fae76'; landPath(); ctx.fill();                    // база суши
    ctx.save(); landPath(); ctx.clip();                                 // раскраска зон — только по суше
    var rad=R*0.36;
    for(var z=0;z<regions.length;z++){ var rg=regions[z], q=project(rg.lon,rg.lat); if(!q.vis||!rg.color)continue;
      var bg=ctx.createRadialGradient(q.x,q.y,0,q.x,q.y,rad);
      bg.addColorStop(0,hexA(rg.color,0.72)); bg.addColorStop(1,hexA(rg.color,0));
      ctx.fillStyle=bg; ctx.fillRect(q.x-rad,q.y-rad,rad*2,rad*2); }
    ctx.restore();
    ctx.strokeStyle='rgba(40,80,55,0.35)'; ctx.lineWidth=0.7; landPath(); ctx.stroke();  // берега
    ctx.restore();
    ctx.lineWidth=1.4; ctx.strokeStyle='rgba(28,64,86,0.42)'; ctx.beginPath(); ctx.arc(cx,cy,R,0,7); ctx.stroke();
    drawFlyways();
    drawPins();
  }
  function drawPins(){ pins=[]; ctx.textAlign='center'; ctx.textBaseline='middle';
    var vis=[];
    for(var i=0;i<regions.length;i++){ var rg=regions[i], q=project(rg.lon,rg.lat);
      if(q.vis)vis.push({rg:rg,x:q.x,y:q.y,d:(q.x-cx)*(q.x-cx)+(q.y-cy)*(q.y-cy)}); }
    vis.sort(function(a,b){return a.d-b.d;});
    for(var k=0;k<vis.length;k++){ var v=vis[k]; pins.push({r:v.rg,x:v.x,y:v.y});
      ctx.beginPath(); ctx.arc(v.x,v.y,7,0,7); ctx.fillStyle=v.rg.color||'#a9812c'; ctx.fill();
      ctx.lineWidth=2.4; ctx.strokeStyle='#fff8e6'; ctx.stroke();
      ctx.beginPath(); ctx.arc(v.x,v.y,2.4,0,7); ctx.fillStyle='#fff8e6'; ctx.fill(); }
    var placed=[]; ctx.font='800 11.5px Inter,system-ui,sans-serif';
    for(var k2=0;k2<vis.length;k2++){ var v2=vis[k2], txt=v2.rg.name+'  '+v2.rg.count;
      var w=ctx.measureText(txt).width, bw=w+14, bh=18, ly=v2.y+18;
      var lx=v2.x; if(lx<bw/2+4)lx=bw/2+4; if(lx>W-bw/2-4)lx=W-bw/2-4;
      var bx=lx-bw/2, by=ly-9, hit=false;
      for(var m=0;m<placed.length;m++){ var p=placed[m];
        if(bx<p.x+p.w&&bx+bw>p.x&&by<p.y+p.h&&by+bh>p.y){ hit=true; break; } }
      if(hit)continue; placed.push({x:bx,y:by,w:bw,h:bh});
      ctx.fillStyle='rgba(28,32,26,0.86)'; roundRect(bx,by,bw,bh,9); ctx.fill();
      ctx.fillStyle='#fff'; ctx.fillText(txt,lx,ly);
    }
  }
  function loop(){ if(!dragging&&!pinching){ idle++; if(idle>36)rotL+=vel/zoom; } if(showFly)dashPhase=(dashPhase+0.5)%22; draw(); raf=requestAnimationFrame(loop); }

  function xy(e){ var r=cvs.getBoundingClientRect(),
    t=(e.touches&&e.touches[0])||(e.changedTouches&&e.changedTouches[0])||e;
    return {x:t.clientX-r.left, y:t.clientY-r.top}; }
  function onDown(e){ dragging=true; moved=0; var p=xy(e); lastX=p.x; lastY=p.y; idle=0; }
  function onMove(e){ if(!dragging)return; var p=xy(e), dx=p.x-lastX, dy=p.y-lastY;
    moved+=Math.abs(dx)+Math.abs(dy); rotL-=dx*0.32/zoom; rotF+=dy*0.32/zoom;
    if(rotF>85)rotF=85; if(rotF<-85)rotF=-85; lastX=p.x; lastY=p.y; idle=0; }
  function onUp(e){ if(!dragging)return; dragging=false; idle=0;
    if(moved<7){ var p=xy(e), best=null, bd=1e9, i, ddx, ddy, d;
      // сперва метки путей миграции (они поверх зон)
      if(showFly){ var fb=null, fbd=1e9;
        for(i=0;i<fpins.length;i++){ ddx=p.x-fpins[i].x; ddy=p.y-fpins[i].y; d=ddx*ddx+ddy*ddy; if(d<fbd){fbd=d;fb=fpins[i];} }
        if(fb && fbd<44*44 && onFly){ onFly(fb.id); return; } }
      for(i=0;i<pins.length;i++){ ddx=p.x-pins[i].x; ddy=p.y-pins[i].y; d=ddx*ddx+ddy*ddy; if(d<bd){bd=d;best=pins[i];} }
      if(best && bd<56*56 && onPick) onPick(best.r.id, best.r); } }
  function tDist(e){ var a=e.touches[0],b=e.touches[1],dx=a.clientX-b.clientX,dy=a.clientY-b.clientY; return Math.sqrt(dx*dx+dy*dy)||1; }
  function tStart(e){ e.preventDefault();
    if(e.touches.length>=2){ pinching=true; dragging=false; pinchD=tDist(e); } else { pinching=false; onDown(e); } }
  function tMove(e){ e.preventDefault();
    if(pinching&&e.touches.length>=2){ var d=tDist(e); setZoom(zoom*d/pinchD); pinchD=d; } else onMove(e); }
  function tEnd(e){ if(pinching){ if(e.touches.length<2){ pinching=false; pinchD=0; } return; } onUp(e); }

  return {
    init:function(canvas, landData, regionList, pickCb, flyPickCb){
      cvs=canvas; ctx=cvs.getContext('2d'); land=landData||[]; regions=regionList||[]; onPick=pickCb; onFly=flyPickCb||null;
      if(!started){
        cvs.addEventListener('mousedown',onDown); window.addEventListener('mousemove',onMove); window.addEventListener('mouseup',onUp);
        cvs.addEventListener('wheel',function(e){ e.preventDefault(); setZoom(zoom*(e.deltaY<0?1.12:1/1.12)); },{passive:false});
        cvs.addEventListener('touchstart',tStart,{passive:false});
        cvs.addEventListener('touchmove',tMove,{passive:false});
        cvs.addEventListener('touchend',tEnd);
        window.addEventListener('resize',function(){ if(raf)resize(); });
        started=true;
      }
      resize();
    },
    setRegions:function(list){ regions=list||[]; },
    setFlyways:function(list){ flyways=list||[]; },
    setFlyMode:function(on){ showFly=!!on; idle=0; },
    isFlyMode:function(){ return showFly; },
    resize:resize,
    start:function(){ resize(); if(!raf)loop(); },
    stop:function(){ if(raf){cancelAnimationFrame(raf);raf=0;} }
  };
})();
