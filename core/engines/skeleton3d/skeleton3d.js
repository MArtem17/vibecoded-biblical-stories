/* ─────────────────────────────────────────────────────────────────────────
   Движок «Скелет 3D» — интерактивная сборка скелета на three.js.
   Общий для всех колод: сцена, свет, музейный подиум, сборка нажатием,
   искры, i18n (7 языков), финал, вершинная AO, опц. GTAO (?ao=1).
   Колода даёт только КОНФИГ: геометрию костей, камеру, строки, финал.
   Первый потребитель — decks/dinozavry, второй — decks/moyo-telo.

   Использование (на тонкой странице колоды, через importmap на three):
     import { run } from '.../core/engines/skeleton3d/skeleton3d.js';
     import { config } from './parts.js';
     run(config);
   ───────────────────────────────────────────────────────────────────────── */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/* ─── общий материал кости + примитивы (kit для строителей колоды) ─── */
function boneTextures(){
  const S=512;
  const c=document.createElement("canvas"); c.width=c.height=S; const g=c.getContext("2d");
  g.fillStyle="#e9e1cd"; g.fillRect(0,0,S,S);
  for(let i=0;i<3200;i++){ const x=Math.random()*S,y=Math.random()*S,r=Math.random()*2.4,d=Math.random()*34-17;
    g.fillStyle="rgba("+(198+d|0)+","+(186+d|0)+","+(158+d|0)+","+(0.12+Math.random()*0.22)+")";
    g.beginPath(); g.arc(x,y,r,0,7); g.fill(); }
  g.strokeStyle="rgba(120,104,78,0.13)"; g.lineWidth=1;
  for(let i=0;i<46;i++){ g.beginPath(); let x=Math.random()*S,y=Math.random()*S; g.moveTo(x,y);
    for(let k=0;k<6;k++){ x+=Math.random()*44-22; y+=Math.random()*44-22; g.lineTo(x,y); } g.stroke(); }
  const map=new THREE.CanvasTexture(c); map.wrapS=map.wrapT=THREE.RepeatWrapping; map.repeat.set(2.2,2.2);
  map.colorSpace=THREE.SRGBColorSpace; map.anisotropy=4;
  const rc=document.createElement("canvas"); rc.width=rc.height=S; const rg=rc.getContext("2d");
  rg.fillStyle="#8f8f8f"; rg.fillRect(0,0,S,S);
  for(let i=0;i<4200;i++){ const x=Math.random()*S,y=Math.random()*S,r=Math.random()*3,v=60+Math.random()*120|0;
    rg.fillStyle="rgba("+v+","+v+","+v+",0.22)"; rg.beginPath(); rg.arc(x,y,r,0,7); rg.fill(); }
  const rough=new THREE.CanvasTexture(rc); rough.wrapS=rough.wrapT=THREE.RepeatWrapping; rough.repeat.set(2.2,2.2);
  return {map,rough};
}
const BT=boneTextures();
const boneMat=new THREE.MeshPhysicalMaterial({
  color:0xf0e9d6, map:BT.map, roughness:0.7, roughnessMap:BT.rough, metalness:0.0,
  bumpMap:BT.map, bumpScale:0.02, clearcoat:0.24, clearcoatRoughness:0.55,
  sheen:0.45, sheenColor:new THREE.Color(0xfff4df), envMapIntensity:0.98, vertexColors:true });
const socketMat=new THREE.MeshStandardMaterial({color:0x141210,roughness:0.7});
const ghostMat=new THREE.MeshBasicMaterial({color:0xe7b55c, transparent:true, opacity:0.06, depthWrite:false});

/* вершинная AO: низ каждой кости темнее верха — мягкое затенение углублений,
   работает в любом WebGL (в т.ч. iOS WKWebView), без пост-обработки */
function mesh(geo, dark){
  geo.computeBoundingBox(); const bb=geo.boundingBox, y0=bb.min.y, h=Math.max(1e-4,bb.max.y-bb.min.y);
  const pos=geo.attributes.position, n=pos.count, col=new Float32Array(n*3), dk=(dark==null?0.6:dark);
  for(let i=0;i<n;i++){ const t=(pos.getY(i)-y0)/h; const v=dk+(1-dk)*(0.35+0.65*t);
    col[i*3]=col[i*3+1]=col[i*3+2]=v; }
  geo.setAttribute("color", new THREE.BufferAttribute(col,3));
  const m=new THREE.Mesh(geo, boneMat); m.castShadow=true; m.receiveShadow=true; return m; }
function boneShaft(len, rEnd, rMid){
  const pts=[]; const N=14;
  for(let i=0;i<=N;i++){ const t=i/N; const y=t*len;
    const bulge=Math.pow(Math.abs(t-0.5)*2,2.4);
    const r=rMid + (rEnd-rMid)*bulge + rEnd*0.35*Math.pow(bulge,3);
    pts.push(new THREE.Vector2(Math.max(0.02,r), y)); }
  const g=new THREE.LatheGeometry(pts, 32); g.translate(0,-len/2,0); return mesh(g);
}
function vertebra(r){
  const grp=new THREE.Group();
  const body=mesh(new THREE.SphereGeometry(r*0.82,22,16)); body.scale.set(1,0.66,0.92); grp.add(body);
  const proc=mesh(new THREE.ConeGeometry(r*0.34, r*2.4, 12)); proc.scale.set(1,1,0.45); proc.position.y=r*1.3; grp.add(proc);
  for(const s of [1,-1]){ const t=mesh(new THREE.ConeGeometry(r*0.2,r*0.9,8)); t.rotation.z=s*Math.PI*0.5;
    t.position.set(0,-r*0.05,s*r*0.4); grp.add(t); }
  return grp;
}
function vertChain(count, spacing, r0, r1, curve){
  const grp=new THREE.Group();
  for(let i=0;i<count;i++){ const t=i/(count-1||1); const v=vertebra(r0+(r1-r0)*t);
    const p=curve(t); v.position.copy(p); grp.add(v); }
  return grp;
}
const Ni=(ru,en,de,es,pt,fr,ar)=>({ru,en,de,es,pt,fr,ar});
const KIT={ THREE, mesh, boneShaft, vertebra, vertChain, boneMat, socketMat, N:Ni };

const LANGS=["ru","en","de","es","pt","fr","ar"], RTL=["ar"];

/* ─────────────────────────── движок ─────────────────────────── */
export function run(CFG){
  const qs=new URLSearchParams(location.search);
  const langKey=CFG.langKey||"skel_lang", msgType=CFG.msgType||"dinoLang";
  let lang=qs.get("lang")||localStorage.getItem(langKey)||"ru";
  if(LANGS.indexOf(lang)<0) lang="ru";
  const T=o=>(o&&(o[lang]||o.ru))||"";
  let AO = qs.get("ao")==="1";
  const UI=CFG.ui;
  const CAM=CFG.camera, SCAT=CFG.scatter||{radius:3.9,y:0.6}, FIN=CFG.finale||{};

  const $=s=>document.querySelector(s);
  function applyDir(){ document.documentElement.setAttribute("dir", RTL.indexOf(lang)>=0?"rtl":"ltr"); document.documentElement.lang=lang; }
  const BUILD="v9";
  function paintUI(){ applyDir();
    $("#ttl").textContent=T(UI.title); $("#sub").textContent=T(UI.sub)+" · "+BUILD;
    $("#progLbl").textContent=T(UI.bones); $("#resetBtn").textContent=T(UI.reset);
    $("#hint").textContent=placed.length?T(UI.drag):T(UI.hint);
    $("#winBig").textContent=T(UI.win); $("#winSub").textContent=T(UI.winSub);
    $("#loadTxt").textContent=T(UI.load); buildLangs(); }
  function buildLangs(){ const box=$("#langs"); box.innerHTML="";
    LANGS.forEach(L=>{ const b=document.createElement("button"); b.textContent=L.toUpperCase();
      if(L===lang) b.classList.add("on");
      b.onclick=()=>{ lang=L; try{localStorage.setItem(langKey,L);}catch(e){} paintUI(); refreshLabels(); };
      box.appendChild(b); }); }
  if(qs.get("embed")==="1") document.documentElement.setAttribute("data-embed","1");

  /* renderer / scene / camera */
  const app=$("#app");
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.85;
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  app.appendChild(renderer.domElement);
  (function(){ if(!AO) return; const gl=renderer.getContext();
    const ok = renderer.capabilities.isWebGL2 &&
      (gl.getExtension("EXT_color_buffer_half_float")||gl.getExtension("EXT_color_buffer_float"));
    if(!ok) AO=false; })();

  const scene=new THREE.Scene();
  scene.fog=new THREE.Fog(0x0c1220, 16, 34);
  (function(){ const c=document.createElement("canvas"); c.width=c.height=512; const g=c.getContext("2d");
    const lin=g.createLinearGradient(0,0,0,512);
    lin.addColorStop(0,"#1b2c46"); lin.addColorStop(.55,"#111c2f"); lin.addColorStop(1,"#070b12");
    g.fillStyle=lin; g.fillRect(0,0,512,512);
    const rg=g.createRadialGradient(256,232,20,256,232,320);
    rg.addColorStop(0,"rgba(120,150,190,0.35)"); rg.addColorStop(.5,"rgba(70,95,130,0.12)"); rg.addColorStop(1,"rgba(0,0,0,0)");
    g.fillStyle=rg; g.fillRect(0,0,512,512);
    const tx=new THREE.CanvasTexture(c); tx.colorSpace=THREE.SRGBColorSpace; scene.background=tx; })();

  const camera=new THREE.PerspectiveCamera(52, innerWidth/innerHeight, 0.1, 100);
  camera.position.fromArray(CAM.pos);
  const pmrem=new THREE.PMREMGenerator(renderer);
  scene.environment=pmrem.fromScene(new RoomEnvironment(), 0.03).texture;

  const controls=new OrbitControls(camera, renderer.domElement);
  controls.enableDamping=true; controls.dampingFactor=0.08;
  controls.target.fromArray(CAM.target);
  controls.minDistance=CAM.minDistance||4.6; controls.maxDistance=CAM.maxDistance||13;
  controls.maxPolarAngle=Math.PI*0.5; controls.rotateSpeed=0.85;
  // при вращении подписываем кость, ближайшую к камере (и во время сборки)
  controls.addEventListener("change", ()=>{ if(!flying.length) labelFacing(); });

  /* свет */
  const hemi=new THREE.HemisphereLight(0xbcd4ff, 0x120e06, 0.32); scene.add(hemi);
  const key=new THREE.DirectionalLight(0xfff0d8, 2.2);
  key.position.set(5.5, 9, 4.5); key.castShadow=true;
  key.shadow.mapSize.set(2048,2048); key.shadow.radius=8; key.shadow.bias=-0.0004;
  const skc=key.shadow.camera; skc.near=1; skc.far=40; skc.left=-9; skc.right=9; skc.top=9; skc.bottom=-9;
  scene.add(key);
  const rim=new THREE.DirectionalLight(0x6ea8ff, 1.0); rim.position.set(-6,4,-5); scene.add(rim);
  const back=new THREE.DirectionalLight(0xcfe0ff, 1.6); back.position.set(-3,7,-6); scene.add(back);
  const fill=new THREE.PointLight(0xffcaa0, 6, 22, 2); fill.position.set(-2.5,3.0,5.0); scene.add(fill);

  /* подиум (цельный непрозрачный, с запечённым тёплым кольцом и контактной тенью) */
  (function(){
    const S=512, c=document.createElement("canvas"); c.width=c.height=S; const g=c.getContext("2d");
    g.fillStyle="#111827"; g.fillRect(0,0,S,S);
    let rg=g.createRadialGradient(S/2,S/2,20,S/2,S/2,S/2);
    rg.addColorStop(0,"#0d1420"); rg.addColorStop(.62,"#141d2c"); rg.addColorStop(.72,"#3a2f22");
    rg.addColorStop(.78,"#5a4326"); rg.addColorStop(.84,"#241d16"); rg.addColorStop(1,"#0c111b");
    g.fillStyle=rg; g.fillRect(0,0,S,S);
    g.save(); g.translate(S/2,S/2+6); g.scale(SCAT.poolX||1.85,SCAT.poolZ||1.0);
    const cg=g.createRadialGradient(0,0,8,0,0,118);
    cg.addColorStop(0,"rgba(0,0,0,0.5)"); cg.addColorStop(.5,"rgba(0,0,0,0.24)"); cg.addColorStop(1,"rgba(0,0,0,0)");
    g.fillStyle=cg; g.beginPath(); g.arc(0,0,118,0,7); g.fill(); g.restore();
    const tx=new THREE.CanvasTexture(c); tx.colorSpace=THREE.SRGBColorSpace; tx.anisotropy=4;
    const top=new THREE.Mesh(new THREE.CircleGeometry(4.8,72), new THREE.MeshStandardMaterial({map:tx, roughness:0.94}));
    top.rotation.x=-Math.PI/2; top.position.y=0.001; top.receiveShadow=true; scene.add(top);
    const side=new THREE.Mesh(new THREE.CylinderGeometry(4.78,5.0,0.5,72), new THREE.MeshStandardMaterial({color:0x0e1522, roughness:0.95}));
    side.position.y=-0.27; side.receiveShadow=true; scene.add(side);
  })();

  /* части из конфига колоды */
  const PARTS=CFG.buildParts(KIT);

  const rig=new THREE.Group(); scene.add(rig);
  const raycaster=new THREE.Raycaster(); const pointer=new THREE.Vector2();
  let parts=[], placed=[], flying=[], hovered=null, done=false, breObj=null, roarObj=null, roarBaseZ=0, roarStart=-1;

  const sparkGeo=new THREE.SphereGeometry(0.045,8,6);
  const sparkMat=new THREE.MeshBasicMaterial({color:0xffe0a0, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending});
  let sparks=[];
  function burst(pos){ for(let i=0;i<18;i++){ const s=new THREE.Mesh(sparkGeo, sparkMat.clone());
    s.position.copy(pos);
    const dir=new THREE.Vector3(Math.random()-0.5,Math.random()*0.6,Math.random()-0.5).normalize().multiplyScalar(1.6+Math.random()*2.4);
    s.userData={v:dir, life:0, max:0.5+Math.random()*0.35}; rig.add(s); sparks.push(s); } }
  function updateSparks(dt){ for(let i=sparks.length-1;i>=0;i--){ const s=sparks[i], u=s.userData; u.life+=dt;
    s.position.addScaledVector(u.v,dt); u.v.y-=5*dt; u.v.multiplyScalar(0.92);
    const k=u.life/u.max; s.scale.setScalar(Math.max(0.01,1-k)); s.material.opacity=Math.max(0,1-k);
    if(u.life>=u.max){ rig.remove(s); s.material.dispose(); sparks.splice(i,1); } } }

  function scatterPos(i,total){ const a=(i/total)*Math.PI*2 + 0.6, rad=SCAT.radius;
    return new THREE.Vector3(Math.cos(a)*rad, SCAT.y, Math.sin(a)*rad); }

  function buildAll(){
    parts.forEach(p=>{ rig.remove(p.obj); if(p.ghost) rig.remove(p.ghost); });
    parts=[]; placed=[]; flying=[]; done=false; hovered=null; breObj=null; roarObj=null; roarStart=-1; facing=null;
    sparks.forEach(s=>rig.remove(s)); sparks=[];
    PARTS.forEach((def,i)=>{
      const obj=def.build();
      // локальная ограничивающая сфера (до трансформаций) — для поиска ближней кости
      obj.updateMatrixWorld(true);
      const _sp0=new THREE.Box3().setFromObject(obj).getBoundingSphere(new THREE.Sphere());
      obj.userData.bsph={ c:_sp0.center.clone(), r:_sp0.radius };
      const rot=def.rot||[0,0,0];
      const targetPos=new THREE.Vector3().fromArray(def.pos);
      const targetQuat=new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0],rot[1],rot[2]));
      const sp=scatterPos(i,PARTS.length);
      const rest=SCAT.rest||1; obj.scale.setScalar(rest);
      obj.position.copy(sp); obj.userData.spin=0.3+Math.random()*0.3; obj.userData.bob=Math.random()*Math.PI*2;
      obj.userData.baseY=sp.y; obj.userData.rest=rest; obj.rotation.y=Math.random()*Math.PI*2;
      obj.traverse(o=>{ if(o.isMesh) o.userData.part=def.id; });
      rig.add(obj);
      let ghost=null;
      if(!AO){ ghost=def.build(); ghost.traverse(o=>{ if(o.isMesh){ o.material=ghostMat; o.castShadow=false; o.receiveShadow=false; } });
        ghost.position.copy(targetPos); ghost.quaternion.copy(targetQuat); rig.add(ghost); }
      parts.push({ def, obj, ghost, targetPos, targetQuat, done:false });
    });
    updateProgress(); labelFacing(); refreshLabels();
  }
  function placePart(p){
    if(p.done) return; p.done=true; if(p.ghost) p.ghost.visible=false;
    if(FIN.breatheId && p.def.id===FIN.breatheId) breObj=p.obj;
    if(FIN.roar && p.def.id===FIN.roar.id){ roarObj=p.obj; roarBaseZ=(p.def.rot&&p.def.rot[2])||0; }
    flying.push({ p, t:0, from:p.obj.position.clone(), fromQ:p.obj.quaternion.clone(), dur:0.9 });
    placed.push(p); showPart(p.def); updateProgress(); $("#hint").textContent=T(UI.drag);
    if(placed.length===PARTS.length) setTimeout(finish, 950);
  }

  function pick(ev){
    const r=renderer.domElement.getBoundingClientRect();
    pointer.x=((ev.clientX-r.left)/r.width)*2-1; pointer.y=-((ev.clientY-r.top)/r.height)*2+1;
    raycaster.setFromCamera(pointer,camera);
    const hits=raycaster.intersectObjects(parts.filter(p=>!p.done).map(p=>p.obj),true);
    if(!hits.length) return null;
    let o=hits[0].object; while(o && !o.userData.part) o=o.parent;
    return parts.find(p=>!p.done && p.def.id===(o&&o.userData.part))||null;
  }
  let downXY=null, dragCancel=false; const el=renderer.domElement;
  el.addEventListener("pointerdown",e=>{ downXY=[e.clientX,e.clientY]; dragCancel=false; });
  el.addEventListener("pointermove",e=>{
    if(downXY && Math.hypot(e.clientX-downXY[0],e.clientY-downXY[1])>8) dragCancel=true;
    if(e.pointerType==="mouse"){ const p=pick(e); setHover(p); document.body.style.cursor=p?"pointer":""; } });
  el.addEventListener("click",e=>{ if(dragCancel){ dragCancel=false; return; } const p=pick(e); if(p) placePart(p); });
  const boneHi=boneMat.clone(); boneHi.emissive=new THREE.Color(0xe7b55c); boneHi.emissiveIntensity=0.35;
  function setHover(p){ if(hovered===p) return;
    if(hovered) hovered.obj.traverse(o=>{ if(o.isMesh) o.material=boneMat; });
    hovered=p; if(p){ p.obj.traverse(o=>{ if(o.isMesh) o.material=boneHi; }); showPart(p.def); } }

  function showPart(def){ $("#partName").textContent=T(def.name); $("#partFact").textContent=T(def.fact); }
  function refreshLabels(){ if(hovered) showPart(hovered.def); else if(facing) showPart(facing.def);
    else if(placed.length){ showPart(placed[placed.length-1].def); }
    else { $("#partName").textContent=""; $("#partFact").textContent=""; } }
  // Подписываем И подсвечиваем кость ПЕРЕД камерой — самую БЛИЖНЮЮ к зрителю (ту, что
  // «передо мной», в переднем плане), а НЕ ту, что в центре экрана: в центре стоит
  // призрачная модель, и луч сквозь неё попадал в дальнюю кость за спиной модели.
  let facing=null; const _pv=new THREE.Vector3(); const _wc=new THREE.Vector3();
  function labelFacing(){ if(hovered||!parts.length) return;
    // Кость «передо мной»: из костей ПЕРЕДНЕГО плана (ближе модели, не за её спиной)
    // берём самую ЦЕНТРИРОВАННУЮ в кадре — ту, на которую ребёнок сейчас смотрит.
    const camDist=camera.position.distanceTo(controls.target);
    let best=null, bestScore=1e30;
    for(const p of parts){ const s=p.obj.userData.bsph; if(!s) continue;
      _wc.copy(s.c); p.obj.localToWorld(_wc);            // мировой центр кости
      const dist=_wc.distanceTo(camera.position);
      if(dist>camDist+0.3) continue;                     // отсекаем кости ЗА моделью (дальние)
      _pv.copy(_wc).project(camera);
      if(_pv.z>1) continue;                              // за камерой
      const score=Math.hypot(_pv.x,_pv.y) + dist*0.02;   // центр важнее, ближняя — лёгкий тай-брейк
      if(score<bestScore){ bestScore=score; best=p; } }
    if(best && best!==facing){
      if(facing) facing.obj.traverse(o=>{ if(o.isMesh) o.material=boneMat; });
      facing=best; best.obj.traverse(o=>{ if(o.isMesh) o.material=boneHi; });
      showPart(best.def); }
  }
  function updateProgress(){ const n=placed.length, tot=PARTS.length;
    $("#progN").textContent=n+"/"+tot; $("#progArc").setAttribute("stroke-dashoffset", 113*(1-n/tot)); }

  function finish(){ done=true; controls.autoRotate=(qs.get("still")!=="1"); controls.autoRotateSpeed=1.1;
    bloom.strength=0.5; $("#win").classList.add("on"); $("#hint").textContent="";
    refreshLabels(); fill.color.set(0xffd8a0); fill.intensity=13;
    if(FIN.roar){ roarStart=clock.elapsedTime; burst(new THREE.Vector3().fromArray(FIN.roar.at||[0,2.5,0])); }
    else burst(new THREE.Vector3().fromArray(CAM.target)); }

  /* post */
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  let gtao=null;
  if(AO){ try{
    gtao=new GTAOPass(scene,camera,innerWidth,innerHeight);
    gtao.output=GTAOPass.OUTPUT.Default;
    gtao.updateGtaoMaterial({ radius:0.28, distanceExponent:1.0, thickness:1.0, scale:1.0, samples:16, distanceFallOff:1.0, screenSpaceRadius:false });
    gtao.updatePdMaterial({ lumaPhi:10, depthPhi:2, normalPhi:3, radius:4, radiusExponent:1, rings:2, samples:16 });
    gtao.blendIntensity=0.9; composer.addPass(gtao);
  }catch(e){ gtao=null; } }
  const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight), 0.26, 0.4, 0.95);
  composer.addPass(bloom); composer.addPass(new OutputPass());

  const clock=new THREE.Clock(); let firstFrame=true, labelClock=0;
  function animate(){ requestAnimationFrame(animate);
    const dt=Math.min(0.05,clock.getDelta()), t=clock.elapsedTime;
    parts.forEach(p=>{ if(p.done) return; const o=p.obj;
      o.rotation.y+=dt*o.userData.spin; o.position.y=o.userData.baseY+Math.sin(t*1.4+o.userData.bob)*0.09; });
    // подпись обновляем НЕПРЕРЫВНО: кость под центром кадра всегда названа «вживую»,
    // а не только когда крутишь. Дросселируем до ~10 Гц.
    labelClock+=dt; if(labelClock>0.1){ labelClock=0; if(!flying.length) labelFacing(); }
    if(!AO) ghostMat.opacity=0.05+0.045*(0.5+0.5*Math.sin(t*2.0));
    for(let i=flying.length-1;i>=0;i--){ const f=flying[i]; f.t+=dt/f.dur;
      const e=f.t>=1?1:1-Math.pow(1-f.t,3);
      f.p.obj.position.lerpVectors(f.from, f.p.targetPos, e);
      f.p.obj.position.y += Math.sin(Math.min(1,f.t)*Math.PI)*0.8;
      f.p.obj.quaternion.slerpQuaternions(f.fromQ, f.p.targetQuat, e);
      const rest=f.p.obj.userData.rest||1, base=rest+(1-rest)*e;
      f.p.obj.scale.setScalar(base*(1+Math.sin(Math.min(1,f.t)*Math.PI)*0.12));
      if(f.t>=1){ f.p.obj.position.copy(f.p.targetPos); f.p.obj.quaternion.copy(f.p.targetQuat); f.p.obj.scale.setScalar(1);
        f.p.obj.traverse(o=>{ if(o.isMesh) o.material=boneMat; }); burst(f.p.targetPos);
        f.p.center=new THREE.Box3().setFromObject(f.p.obj).getCenter(new THREE.Vector3()); flying.splice(i,1); } }
    updateSparks(dt);
    if(done && FIN.roar && roarObj && roarStart>=0){ const rt=t-roarStart;
      const open=Math.max(0, Math.sin(rt*3.2))*(rt<2?1:0)*0.5; roarObj.rotation.z=roarBaseZ - open;
      bloom.strength=0.5 + Math.max(0,Math.sin(rt*3.2))*(rt<2?1:0)*0.35; }
    if(done && breObj){ breObj.scale.setScalar(1+0.018*Math.sin(t*1.5)); }
    controls.update(); composer.render();
    if(firstFrame){ firstFrame=false; const l=$("#load"); if(l) l.classList.add("hide"); labelFacing(); } }

  addEventListener("resize",()=>{ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight); composer.setSize(innerWidth,innerHeight);
    if(gtao) gtao.setSize(innerWidth,innerHeight); });
  addEventListener("message",e=>{ const d=e.data; if(!d||d.type!==msgType||LANGS.indexOf(d.lang)<0||d.lang===lang) return;
    lang=d.lang; paintUI(); refreshLabels(); });
  $("#resetBtn").onclick=()=>{ controls.autoRotate=false; $("#win").classList.remove("on"); bloom.strength=0.26;
    fill.color.set(0xffcaa0); fill.intensity=6; camera.position.fromArray(CAM.pos); controls.target.fromArray(CAM.target);
    buildAll(); paintUI(); };

  paintUI(); buildAll(); animate();
  if(qs.get("auto")==="1"){ parts.forEach((p,i)=>setTimeout(()=>placePart(p), 250+i*400)); }
}
