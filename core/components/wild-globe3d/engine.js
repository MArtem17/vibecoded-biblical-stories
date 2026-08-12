/* core/components/wild-globe3d — общий 3D-глобус звериной серии на three.js r136.
   Один движок для всех колод (Птицы / Подводный мир / …). Реальная Земля
   (берега из WILD_LAND), дуги маршрутов из WILD_FLYWAYS с движущимися стайками,
   пины зон обитания из WILD_REGIONS, тап по маршруту/зоне → виды колоды.

   Про конкретную колоду движок НЕ знает — тема и опциональные слои приходят
   из глобала window.WILD_GLOBE3D (см. per-deck globe3d/config.js):
     {
       bathymetry: bool,            // рельеф дна: впадины + шельф (иначе плоский океан)
       oceanGradient: [c0,c1,c2],   // вертикальный градиент океана (верх/центр/низ)
       pois:    [{name,lon,lat,depth,note}],   // тап-точки (впадины); [] — выкл.
       flows:   [{warm,loop,path:[[lon,lat]…]}], // живые течения; [] — выкл.
       diveZone:'abyss',            // зона для postMessage('*-dive') из POI внутри симулятора
       terms:{ routeLabel, zonesLabel, zonesHintOn, zonesHintOff, hint }
     }
   Все поля опциональны — по умолчанию колода без океанских слоёв (как «Птицы»). */
(function(){
"use strict";
var boot=document.getElementById('boot');
if(!window.THREE){ boot.textContent='WebGL/THREE не загрузился'; return; }
var LAND=window.WILD_LAND||[], FW=window.WILD_FLYWAYS, RG=window.WILD_REGIONS, DECK=window.WILD_DECK||{cards:[]};
var cardById={}; (DECK.cards||[]).forEach(function(c){ cardById[c.id]=c; });
var lang='ru'; function T(o){ return (o&&(o[lang]||o.ru))||''; }
var DEG=Math.PI/180, R=10;

/* ---------- конфиг колоды (тема + опциональные слои) ---------- */
var CFG=window.WILD_GLOBE3D||{};
var TRENCHES=CFG.pois||[];                                   // тап-точки (океанские впадины)
var CURRENTS=CFG.flows||[];                                  // живые течения
var BATHY=!!CFG.bathymetry;                                  // рельеф дна
var OCEANGRAD=CFG.oceanGradient||['#0a2f5a','#0e5f9e','#0a2f5a']; // плоский океан по умолчанию (птицы)
var DIVEZONE=CFG.diveZone||'abyss';
var TM=CFG.terms||{};
var TERM_ROUTE=TM.routeLabel||'путь';
var TERM_ZONES=TM.zonesLabel||'Зоны обитания';
var TERM_ZON_ON=TM.zonesHintOn||'нажми пин зоны или метку пути — покажу виды';
var TERM_ZON_OFF=TM.zonesHintOff||'нажми метку пути (или строку слева) — кто по нему идёт';
var TERM_HINT=TM.hint||'нажми метку пути (или строку слева) · крути глобус мышью';

var REDUCED=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- рендер ---------- */
var host=document.getElementById('stage');
var renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.setSize(host.clientWidth,host.clientHeight);
renderer.outputEncoding=THREE.sRGBEncoding; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.92;
host.appendChild(renderer.domElement);
var scene=new THREE.Scene();
var camera=new THREE.PerspectiveCamera(40,host.clientWidth/host.clientHeight,0.1,2000); camera.position.set(0,8.5,25);
var controls=new THREE.OrbitControls(camera,renderer.domElement);
controls.enableDamping=true; controls.dampingFactor=0.07; controls.minDistance=13.5; controls.maxDistance=48;
controls.rotateSpeed=0.5; controls.autoRotate=true; controls.autoRotateSpeed=0.35; controls.enablePan=false;
var pmrem=new THREE.PMREMGenerator(renderer); scene.environment=pmrem.fromScene(new THREE.RoomEnvironment(),0.04).texture;

/* фон-космос + звёзды */
scene.background=new THREE.Color(0x05070f);
var starGeo=new THREE.BufferGeometry(), N=1600, sp=new Float32Array(N*3);
for(var i=0;i<N;i++){ var rr=400,u=Math.random(),v=Math.random(),th=2*Math.PI*u,ph=Math.acos(2*v-1);
  sp[i*3]=rr*Math.sin(ph)*Math.cos(th); sp[i*3+1]=rr*Math.cos(ph); sp[i*3+2]=rr*Math.sin(ph)*Math.sin(th); }
starGeo.setAttribute('position',new THREE.BufferAttribute(sp,3));
scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xffffff,size:1.3,sizeAttenuation:false,transparent:true,opacity:0.8})));

/* свет */
scene.add(new THREE.HemisphereLight(0x9fc0ff,0x0a1020,0.45));
var sun=new THREE.DirectionalLight(0xfff2e0,2.2); sun.position.set(-20,14,18); scene.add(sun);
scene.add(new THREE.DirectionalLight(0x6ea8ff,0.7).translateX(20).translateZ(-18));

/* ---------- Земля из реальных берегов (WILD_LAND) ---------- */
function earthTexture(){ var W=2048,H=1024,c=document.createElement('canvas'); c.width=W;c.height=H; var x=c.getContext('2d');
  function px(lon,lat){ return [(lon+180)/360*W,(90-lat)/180*H]; }
  // океан: вертикальный градиент (при батиметрии — тёмная бездна в центре, светлее к полюсам)
  var og=x.createLinearGradient(0,0,0,H); og.addColorStop(0,OCEANGRAD[0]); og.addColorStop(0.5,OCEANGRAD[1]); og.addColorStop(1,OCEANGRAD[2]);
  x.fillStyle=og; x.fillRect(0,0,W,H);
  x.lineJoin='round'; x.lineCap='round';
  function strokeLand(color,lw){ x.strokeStyle=color; x.lineWidth=lw;
    for(var p=0;p<LAND.length;p++){ var poly=LAND[p]; if(poly.length<3)continue; x.beginPath();
      for(var k=0;k<poly.length;k++){ var q=px(poly[k][0],poly[k][1]); if(k===0)x.moveTo(q[0],q[1]); else x.lineTo(q[0],q[1]); }
      x.closePath(); x.stroke(); } }
  if(BATHY){
    // самые глубокие впадины — тёмные пятна
    TRENCHES.forEach(function(t){ var q=px(t.lon,t.lat);
      var rg=x.createRadialGradient(q[0],q[1],2,q[0],q[1],80); rg.addColorStop(0,'rgba(3,8,26,0.8)'); rg.addColorStop(1,'rgba(3,8,26,0)');
      x.fillStyle=rg; x.fillRect(q[0]-80,q[1]-80,160,160); });
    // континентальный шельф — светлые кольца мелководья у берегов
    strokeLand('#1a6ea0',20); strokeLand('#3f9bcb',9);
  }
  // СУША
  x.fillStyle='#2f7a3e'; x.strokeStyle='#255f31'; x.lineWidth=1;
  for(var p=0;p<LAND.length;p++){ var poly=LAND[p]; if(poly.length<3)continue; x.beginPath();
    for(var k=0;k<poly.length;k++){ var q=px(poly[k][0],poly[k][1]); if(k===0)x.moveTo(q[0],q[1]); else x.lineTo(q[0],q[1]); }
    x.closePath(); x.fill(); }
  // лёгкий рельеф-затенение суши
  x.globalAlpha=0.12; x.fillStyle='#173d1c'; for(var p2=0;p2<LAND.length;p2++){ var poly2=LAND[p2]; if(poly2.length<3)continue; x.beginPath(); for(var k2=0;k2<poly2.length;k2++){ var q2=px(poly2[k2][0],poly2[k2][1]+1.2); if(k2===0)x.moveTo(q2[0],q2[1]); else x.lineTo(q2[0],q2[1]); } x.closePath(); x.fill(); } x.globalAlpha=1;
  // полярные шапки
  x.fillStyle='rgba(238,246,255,0.9)'; x.fillRect(0,0,W,44); x.fillRect(0,H-44,W,44);
  var t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.anisotropy=4; return t; }
function cloudTexture(){ var W=1024,H=512,c=document.createElement('canvas'); c.width=W;c.height=H; var x=c.getContext('2d'); x.clearRect(0,0,W,H); x.fillStyle='#fff';
  for(var i=0;i<40;i++){ x.globalAlpha=0.06+Math.random()*0.16; var cx=Math.random()*W,cy=50+Math.random()*(H-100),s=12+Math.random()*24; for(var b=0;b<4;b++){ x.beginPath(); x.ellipse(cx+(Math.random()-0.5)*s,cy+(Math.random()-0.5)*s*0.6,s*(0.5+Math.random()*0.5),s*0.4,0,0,7); x.fill(); } } x.globalAlpha=1; return new THREE.CanvasTexture(c); }

var earth=new THREE.Group(); scene.add(earth);
var earthSurf=new THREE.Mesh(new THREE.SphereGeometry(R,96,64),new THREE.MeshStandardMaterial({map:earthTexture(),roughness:0.92,metalness:0.02,envMapIntensity:0.2}));
earth.add(earthSurf);
var clouds=new THREE.Mesh(new THREE.SphereGeometry(R*1.012,64,48),new THREE.MeshStandardMaterial({map:cloudTexture(),transparent:true,depthWrite:false,roughness:1,opacity:0.55}));
earth.add(clouds);
var atmoMat=new THREE.ShaderMaterial({side:THREE.BackSide,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,uniforms:{c:{value:new THREE.Color(0x5aa8ff)}},
  vertexShader:'varying vec3 vN;varying vec3 vP;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vP=mv.xyz;gl_Position=projectionMatrix*mv;}',
  fragmentShader:'varying vec3 vN;varying vec3 vP;uniform vec3 c;void main(){vec3 vd=normalize(-vP);float f=pow(1.0-max(dot(vN,vd),0.0),2.7);gl_FragColor=vec4(c*f,f);}'});
earth.add(new THREE.Mesh(new THREE.SphereGeometry(R*1.06,64,48),atmoMat));

/* lon/lat → точка на сфере (совпадает с ориентацией текстуры) */
function ll2v(lon,lat,r){ r=r||R; var phi=(90-lat)*DEG, theta=(lon+180)*DEG;
  return new THREE.Vector3(-r*Math.sin(phi)*Math.cos(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(theta)); }
function slerp(a,b,t){ var d=Math.max(-1,Math.min(1,a.dot(b))), th=Math.acos(d); if(th<1e-4)return a.clone(); var s=Math.sin(th); return a.clone().multiplyScalar(Math.sin((1-t)*th)/s).add(b.clone().multiplyScalar(Math.sin(t*th)/s)); }

/* ---------- агент маршрута (шеврон: птица/рыба) ---------- */
function birdGeo(){ var g=new THREE.BufferGeometry();
  var v=new Float32Array([ 0,0,0.6, 0.55,0,-0.4, 0,0,-0.12,  0,0,0.6, 0,0,-0.12, -0.55,0,-0.4 ]);
  g.setAttribute('position',new THREE.BufferAttribute(v,3)); g.computeVertexNormals(); return g; }
var BIRDGEO=birdGeo();
function orient(obj,pos,tan,up){ var z=tan.clone().normalize(), y=up.clone().normalize(), x=new THREE.Vector3().crossVectors(y,z).normalize(); y=new THREE.Vector3().crossVectors(z,x); obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z)); obj.position.copy(pos); }

/* ---------- дуги маршрутов ---------- */
var flyways=[], markers=[], picks=[];
function buildFlyway(id,idx){ var m=FW.meta[id], path=FW.paths[id], col=new THREE.Color(m.color);
  // плотная выборка по великому кругу + подъём дугой
  var surf=[]; for(var i=0;i<path.length-1;i++){ var a=ll2v(path[i][0],path[i][1],1), b=ll2v(path[i+1][0],path[i+1][1],1); for(var s=0;s<14;s++)surf.push(slerp(a,b,s/14)); }
  surf.push(ll2v(path[path.length-1][0],path[path.length-1][1],1));
  var pts=[]; for(var j=0;j<surf.length;j++){ var t=j/(surf.length-1); var alt=R*(1.015+0.16*Math.sin(Math.PI*t)); pts.push(surf[j].clone().multiplyScalar(alt)); }
  var curve=new THREE.CatmullRomCurve3(pts);
  var tube=new THREE.Mesh(new THREE.TubeGeometry(curve,140,0.055,8,false),new THREE.MeshBasicMaterial({color:col}));
  tube.renderOrder=2; earth.add(tube);
  // стрелка-конус у конца
  var endP=curve.getPointAt(0.985), endT=curve.getTangentAt(0.985);
  var arrow=new THREE.Mesh(new THREE.ConeGeometry(0.16,0.42,12),new THREE.MeshBasicMaterial({color:col}));
  arrow.position.copy(endP); arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),endT.clone().normalize()); earth.add(arrow);
  // стайка вдоль дуги
  var birds=[]; var nb=Math.max(4,Math.min(9,(m.birds||[]).length+2));
  for(var k=0;k<nb;k++){ var bm=new THREE.Mesh(BIRDGEO,new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide})); bm.scale.setScalar(0.32); bm.userData.u=k/nb; earth.add(bm); birds.push(bm); }
  // нажимаемая метка в середине
  var mid=curve.getPointAt(0.5), midN=mid.clone().normalize();
  var mk=new THREE.Mesh(new THREE.SphereGeometry(0.28,20,16),new THREE.MeshStandardMaterial({color:0x0a1420,emissive:col,emissiveIntensity:1.6,roughness:0.4}));
  mk.position.copy(mid.clone().add(midN.clone().multiplyScalar(0.2))); earth.add(mk);
  mk.userData={kind:'fly',id:id}; picks.push(mk); markers.push({id:id,mesh:mk,color:col});
  flyways.push({id:id,curve:curve,tube:tube,arrow:arrow,birds:birds,marker:mk,color:col,visible:true});
}
if(FW&&FW.order){ FW.order.forEach(buildFlyway); }

/* ---------- пины зон обитания ---------- */
var zonePins=[]; var zonesVisible=false;
if(RG&&RG.order){ RG.order.forEach(function(id){ var z=RG.meta[id]; var col=new THREE.Color(z.color||0xffffff);
  var pin=new THREE.Mesh(new THREE.SphereGeometry(0.16,16,12),new THREE.MeshStandardMaterial({color:0x0a1420,emissive:col,emissiveIntensity:1.4,roughness:0.4}));
  pin.position.copy(ll2v(z.lon,z.lat,R*1.02)); pin.visible=false; pin.userData={kind:'zone',id:id}; earth.add(pin); zonePins.push(pin); }); }

/* ---------- метки тап-точек (океанские впадины) ---------- */
var trenchPins=[];
TRENCHES.forEach(function(t,i){
  var g=new THREE.Group(); g.position.copy(ll2v(t.lon,t.lat,R*1.006));
  // тёмная «воронка» + светящееся кольцо-цель
  var dot=new THREE.Mesh(new THREE.SphereGeometry(0.13,14,10),new THREE.MeshStandardMaterial({color:0x02060f,emissive:0x0a2740,emissiveIntensity:0.8,roughness:0.5}));
  var ring=new THREE.Mesh(new THREE.RingGeometry(0.17,0.24,22),new THREE.MeshBasicMaterial({color:0x3fd0ff,transparent:true,opacity:0.7,side:THREE.DoubleSide}));
  ring.lookAt(g.position.clone().multiplyScalar(2)); ring.position.copy(g.position.clone().normalize().multiplyScalar(0.01));
  dot.userData={kind:'trench',idx:i}; ring.userData={kind:'trench',idx:i};
  g.add(dot); g.add(ring); earth.add(g); trenchPins.push({group:g,ring:ring,dot:dot}); picks.push(dot,ring);
});

/* ---------- живые течения ---------- */
var _cglow;
function moteTex(){ if(_cglow)return _cglow; var c=document.createElement('canvas'); c.width=c.height=64; var g=c.getContext('2d');
  var rg=g.createRadialGradient(32,32,1,32,32,32); rg.addColorStop(0,'rgba(255,255,255,1)'); rg.addColorStop(0.5,'rgba(255,255,255,0.5)'); rg.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=rg; g.fillRect(0,0,64,64); _cglow=new THREE.CanvasTexture(c); return _cglow; }
var currents=[];
function buildCurrent(cur){
  var col=new THREE.Color(cur.warm?0xff9a52:0x66d8ff);
  var surf=[]; for(var i=0;i<cur.path.length-1;i++){ var a=ll2v(cur.path[i][0],cur.path[i][1],1), b=ll2v(cur.path[i+1][0],cur.path[i+1][1],1); for(var s=0;s<12;s++)surf.push(slerp(a,b,s/12)); }
  surf.push(ll2v(cur.path[cur.path.length-1][0],cur.path[cur.path.length-1][1],1));
  var pts=surf.map(function(v){ return v.clone().multiplyScalar(R*1.008); });
  var curve=new THREE.CatmullRomCurve3(pts,!!cur.loop);
  var tube=new THREE.Mesh(new THREE.TubeGeometry(curve,cur.loop?220:120,0.02,6,!!cur.loop),
    new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.20})); tube.renderOrder=1; earth.add(tube);
  var motes=[], n=cur.loop?28:Math.max(8,(surf.length/3)|0);
  for(var k=0;k<n;k++){ var m=new THREE.Sprite(new THREE.SpriteMaterial({map:moteTex(),color:col,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0.85}));
    m.scale.setScalar(0.32); m.userData.u=k/n; earth.add(m); motes.push(m); }
  currents.push({curve:curve,motes:motes,loop:!!cur.loop});
}
CURRENTS.forEach(buildCurrent);

/* ---------- пост-обработка (bloom) ---------- */
var composer,bloom;
(function(){ var w=host.clientWidth,h=host.clientHeight,rt=null;
  if(THREE.WebGLMultisampleRenderTarget){ rt=new THREE.WebGLMultisampleRenderTarget(w,h); rt.samples=4; }
  composer=new THREE.EffectComposer(renderer,rt||undefined); composer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  composer.addPass(new THREE.RenderPass(scene,camera));
  bloom=new THREE.UnrealBloomPass(new THREE.Vector2(w,h),0.6,0.6,0.72); composer.addPass(bloom); })();

/* ---------- HUD ---------- */
var elLegend=document.getElementById('legend'), elSheet=document.getElementById('sheet'), elSheetGrid=document.getElementById('sheetGrid'),
    elSheetTitle=document.getElementById('sheetTitle'), elSheetSub=document.getElementById('sheetSub');
function buildLegend(){ elLegend.innerHTML='';
  if(FW&&FW.order)FW.order.forEach(function(id){ var m=FW.meta[id]; var li=document.createElement('button'); li.className='leg pe'; li.dataset.id=id;
    li.innerHTML='<span class="sw" style="background:'+m.color+'"></span><span class="lnm">'+T(m.label)+'</span><span class="lc">'+((m.birds||[]).length)+'</span>';
    li.onclick=function(){ openFly(id); }; elLegend.appendChild(li); });
  // переключатель зон
  var zt=document.createElement('button'); zt.className='leg zt pe'; zt.id='zoneToggle';
  zt.innerHTML='<span class="sw" style="background:#7cffb0"></span><span class="lnm">'+TERM_ZONES+'</span><span class="lc">'+((RG&&RG.order&&RG.order.length)||0)+'</span>';
  zt.onclick=toggleZones; elLegend.appendChild(zt);
}
/* доворот глобуса к выбранной точке + лёгкое приближение */
var focusTween=null;
function focusOn(localVec){ if(!localVec)return;
  var worldN=localVec.clone().applyQuaternion(earth.quaternion).normalize();
  var camDir=camera.position.clone().normalize();
  var qDelta=new THREE.Quaternion().setFromUnitVectors(worldN,camDir);
  focusTween={qFrom:earth.quaternion.clone(), qTo:qDelta.multiply(earth.quaternion.clone()), dFrom:camera.position.length(), dTo:20.5, t:0};
  controls.autoRotate=false; controls.enabled=false; }
function openFly(id){ var m=FW.meta[id]; elSheetTitle.textContent=T(m.label); elSheetSub.textContent=(m.birds||[]).length+' видов · '+TERM_ROUTE;
  fillSheet(m.birds||[]); flash(id); var f=flyways.filter(function(x){return x.id===id;})[0]; if(f)focusOn(f.marker.position); }
function openZone(id){ var z=RG.meta[id]; elSheetTitle.textContent=T(z.label); elSheetSub.textContent=(RG.members[id]||[]).length+' видов · зона обитания';
  fillSheet(RG.members[id]||[]); focusOn(ll2v(z.lon,z.lat)); }
function fillSheet(ids){ elSheetGrid.innerHTML=''; ids.forEach(function(cid){ var c=cardById[cid]; if(!c)return;
  var cell=document.createElement('div'); cell.className='cell';
  cell.innerHTML='<img src="../'+c.face+'" alt="" loading="lazy"><span>'+T(c.name)+'</span>'; elSheetGrid.appendChild(cell); });
  elSheet.classList.add('show'); }
document.getElementById('sheetX').onclick=function(){ elSheet.classList.remove('show'); };
function flash(id){ flyways.forEach(function(f){ if(f.id===id){ f.tube.material.color.offsetHSL(0,0,0.0); f.flash=1.0; } }); }
var elHint=document.getElementById('hint');
function toggleZones(){ zonesVisible=!zonesVisible; zonePins.forEach(function(p){ p.visible=zonesVisible; });
  document.getElementById('zoneToggle').classList.toggle('on',zonesVisible);
  if(elHint)elHint.textContent=zonesVisible?TERM_ZON_ON:TERM_ZON_OFF; }
buildLegend();

/* ---------- взаимодействие ---------- */
var ray=new THREE.Raycaster(), ndc=new THREE.Vector2();
function onClick(e){ var r=renderer.domElement.getBoundingClientRect(); var cx=(e.touches?e.changedTouches[0].clientX:e.clientX), cy=(e.touches?e.changedTouches[0].clientY:e.clientY);
  ndc.x=((cx-r.left)/r.width)*2-1; ndc.y=-((cy-r.top)/r.height)*2+1; ray.setFromCamera(ndc,camera);
  var list=picks.concat(zonesVisible?zonePins:[]);
  var hit=ray.intersectObjects(list,false);
  if(hit.length){ var u=hit[0].object.userData; if(u.kind==='fly')openFly(u.id); else if(u.kind==='zone')openZone(u.id); else if(u.kind==='trench')showTrench(u.idx); }
}
var elToast=document.getElementById('toast'), _toastT=0;
var EMBED=(window.parent!==window);   // внутри симулятора (iframe) — можно «нырнуть»
function showTrench(i){ if(!elToast)return; var t=TRENCHES[i]; focusOn(ll2v(t.lon,t.lat));
  elToast.innerHTML='🕳️ '+t.name+'<small>глубина '+t.depth+(t.note?' · '+t.note:'')+'</small>'+(EMBED?'<button id="diveBtn">Нырнуть в бездну ↓</button>':'');
  elToast.classList.add('show'); clearTimeout(_toastT); _toastT=setTimeout(function(){ elToast.classList.remove('show'); }, EMBED?6500:3200);
  if(EMBED){ var db=document.getElementById('diveBtn'); if(db)db.onclick=function(){ try{ window.parent.postMessage({t:'ocean-dive',zone:DIVEZONE},'*'); }catch(e){} elToast.classList.remove('show'); }; } }
var downXY=null,moved=0;
renderer.domElement.addEventListener('pointerdown',function(e){ downXY=[e.clientX,e.clientY]; moved=0; });
renderer.domElement.addEventListener('pointerup',function(e){ if(downXY){ moved=Math.abs(e.clientX-downXY[0])+Math.abs(e.clientY-downXY[1]); } if(moved<6)onClick(e); downXY=null; });

/* авто-вращение стоп при взаимодействии */
controls.addEventListener('start',function(){ controls.autoRotate=false; });

/* ---------- цикл ---------- */
var clock=new THREE.Clock();
function loop(){ requestAnimationFrame(loop); var dt=Math.min(0.05,clock.getDelta());
  if(focusTween){ focusTween.t=Math.min(1,focusTween.t+dt/0.7); var k=focusTween.t; k=k<0.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
    earth.quaternion.slerpQuaternions(focusTween.qFrom,focusTween.qTo,k);
    camera.position.setLength(focusTween.dFrom+(focusTween.dTo-focusTween.dFrom)*k); camera.lookAt(0,0,0);
    if(focusTween.t>=1){ focusTween=null; controls.enabled=true; } }
  else controls.update();
  clouds.rotation.y+=dt*0.006;
  // течения: частицы текут по руслам
  for(var ci=0;ci<currents.length;ci++){ var cu=currents[ci];
    for(var mi=0;mi<cu.motes.length;mi++){ var mo=cu.motes[mi]; mo.userData.u=(mo.userData.u+dt*0.028)%1;
      mo.position.copy(cu.curve.getPointAt(mo.userData.u));
      mo.material.opacity=cu.loop?0.72:0.3+0.55*Math.sin(mo.userData.u*Math.PI); } }
  // агенты идут по дугам
  for(var i=0;i<flyways.length;i++){ var f=flyways[i]; if(!f.visible)continue;
    for(var k=0;k<f.birds.length;k++){ var b=f.birds[k]; b.userData.u+=dt*0.045; if(b.userData.u>1)b.userData.u-=1;
      var u=b.userData.u, p=f.curve.getPointAt(u), tan=f.curve.getTangentAt(u), up=p.clone().normalize();
      orient(b,p,tan,up); var flap=1+Math.sin(clock.elapsedTime*10+k)*0.12; b.scale.set(0.32*flap,0.32,0.32); }
    // пульс метки
    var e=f.marker.material; e.emissiveIntensity=1.4+Math.sin(clock.elapsedTime*2.5+i)*0.5; if(f.flash>0){ f.flash-=dt*1.5; e.emissiveIntensity+=f.flash*3; }
  }
  for(var z=0;z<zonePins.length;z++){ if(zonePins[z].visible)zonePins[z].material.emissiveIntensity=1.2+Math.sin(clock.elapsedTime*3+z)*0.5; }
  for(var tp=0;tp<trenchPins.length;tp++){ var tr=trenchPins[tp].ring; tr.scale.setScalar(1+Math.sin(clock.elapsedTime*2+tp)*0.14); tr.material.opacity=0.4+0.3*Math.sin(clock.elapsedTime*2+tp); }
  composer.render();
}
function onResize(){ var w=host.clientWidth,h=host.clientHeight; camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h); composer.setSize(w,h); bloom.setSize(w,h); }
window.addEventListener('resize',onResize);

boot.style.display='none';
if(elHint)elHint.textContent=TERM_HINT;
if(location.search.indexOf('dev')>=0){ window.__trench=showTrench; window.__ntrench=trenchPins.length; window.__ncurrents=currents.length; window.__openZone=openZone; window.__camDist=function(){return camera.position.length();};
  window.__openFly=openFly; window.__zones=toggleZones; window.__info=function(){ return {flyways:flyways.length,zones:zonePins.length,cards:Object.keys(cardById).length,trenches:trenchPins.length,currents:currents.length}; };
  window.__frame=function(lon,lat,dist){ controls.autoRotate=false; var d=dist||camera.position.length(); camera.position.copy(ll2v(lon,lat,d)); controls.target.set(0,0,0); controls.update(); }; }
loop();
})();
