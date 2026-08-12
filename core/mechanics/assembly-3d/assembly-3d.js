/* assembly-3d.js — переиспользуемая механика «3D-конструктор»: интерактивная модель
   (three.js r128 UMD из core/vendor), которую собирают по деталям с фактами.
   Фирменная сцена: зимний вечер, PBR + ACES + PMREM, мягкие тени, снег, прожекторы.
   Режимы: сборка → взрыв-схема → разрез (интерьер) → экскурсия → ярлыки → звук.
   КОНТЕНТ приходит из window.ASSEMBLY3D_CONFIG (см. README и эталон —
   decks/kulturnyy-pasport/model3d-parts.js). ES5, офлайн, iOS WKWebView. */
(function () {
  "use strict";

  /* ================= рендерер / сцена / камера ================= */
  var canvas = document.getElementById("gl");
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.localClippingEnabled = true;

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0d1128, 60, 230);

  var camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 600);
  var startDist = (window.innerWidth / window.innerHeight < 0.9) ? 1.45 : 1.0;
  var CH = (window.ASSEMBLY3D_CONFIG && window.ASSEMBLY3D_CONFIG.cameraHome) || [38, 16, 56];
  var camHome = new THREE.Vector3(CH[0] * startDist, CH[1] + 6 * (startDist - 1), CH[2] * startDist);
  var camFrom = camHome.clone().multiplyScalar(1.9); camFrom.y += 26;
  camera.position.copy(camFrom);
  var introT0 = performance.now(), INTRO_MS = 2600;

  var controls = new THREE.OrbitControls(camera, canvas);
  var CT = (window.ASSEMBLY3D_CONFIG && window.ASSEMBLY3D_CONFIG.cameraTarget) || [0, 8, 2];
  controls.target.fromArray(CT);
  controls.enableDamping = true; controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.minDistance = 16; controls.maxDistance = 105;
  controls.maxPolarAngle = 1.48;
  controls.autoRotate = true; controls.autoRotateSpeed = 0.55;

  /* пост-обработка: мягкое свечение окон/фонарей/золота */
  var composer = null, bloomPass = null;
  if (THREE.EffectComposer && THREE.UnrealBloomPass) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.32, 0.55, 0.9);
    composer.addPass(bloomPass);
  }
  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (composer) composer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ================= окружение (PMREM) для PBR-бликов ================= */
  (function makeEnv() {
    var pm = new THREE.PMREMGenerator(renderer); pm.compileEquirectangularShader();
    var es = new THREE.Scene();
    var grad = new THREE.Mesh(new THREE.SphereGeometry(50, 16, 12),
      new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true }));
    (function paint(g) {
      var pos = g.geometry.attributes.position, cols = [];
      var top = new THREE.Color(0x2a3a7a), hor = new THREE.Color(0xb06a35), bot = new THREE.Color(0x141018);
      for (var i = 0; i < pos.count; i++) {
        var y = pos.getY(i) / 50, c = new THREE.Color();
        if (y > 0) c.copy(hor).lerp(top, Math.min(1, y * 1.4)); else c.copy(hor).lerp(bot, Math.min(1, -y * 2));
        cols.push(c.r, c.g, c.b);
      }
      g.geometry.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    })(grad);
    es.add(grad);
    function lamp(x, y, z, c, s) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(s, s * 0.6), new THREE.MeshBasicMaterial({ color: c }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m);
    }
    lamp(20, 14, 30, 0xffd9a0, 24);   // тёплый «городской» свет спереди
    lamp(-26, 20, -12, 0x8fb0ff, 18); // холодный контровой
    lamp(0, 40, 0, 0xbfd0ff, 20);     // небо сверху
    scene.environment = pm.fromScene(es, 0.04).texture;
    pm.dispose();
  })();

  /* ================= небо, звёзды, земля ================= */
  (function sky() {
    var g = new THREE.SphereGeometry(300, 24, 16);
    var m = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: {},
      vertexShader: "varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
      fragmentShader: "varying vec3 vP; void main(){ float h=normalize(vP).y;" +
        "vec3 top=vec3(0.030,0.045,0.120); vec3 mid=vec3(0.085,0.100,0.240); vec3 hor=vec3(0.520,0.300,0.160);" +
        "vec3 c = h>0.18 ? mix(mid,top,smoothstep(0.18,0.75,h)) : mix(hor,mid,smoothstep(-0.02,0.18,h));" +
        "gl_FragColor=vec4(c,1.0); }"
    });
    scene.add(new THREE.Mesh(g, m));
    // звёзды
    var n = 650, p = [];
    for (var i = 0; i < n; i++) {
      var th = Math.random() * Math.PI * 2, ph = Math.acos(Math.random() * 0.85 + 0.12), r = 260;
      p.push(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) + 10, r * Math.sin(ph) * Math.sin(th));
    }
    var sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xcfd8ff, size: 1.1, sizeAttenuation: false, transparent: true, opacity: 0.85, fog: false })));
    // снежная площадь
    var gc = document.createElement("canvas"); gc.width = gc.height = 512;
    var gx = gc.getContext("2d");
    gx.fillStyle = "#5a678a"; gx.fillRect(0, 0, 512, 512);
    for (var gi = 0; gi < 9000; gi++) {
      var v = 90 + Math.random() * 60;
      gx.fillStyle = "rgba(" + (v + 25) + "," + (v + 32) + "," + (v + 60) + "," + (0.05 + Math.random() * 0.10) + ")";
      var gr = Math.random() * 2.2 + 0.4;
      gx.fillRect(Math.random() * 512, Math.random() * 512, gr, gr);
    }
    var gt = new THREE.CanvasTexture(gc);
    gt.wrapS = gt.wrapT = THREE.RepeatWrapping; gt.repeat.set(14, 14);
    var ground = new THREE.Mesh(new THREE.CircleGeometry(180, 48),
      new THREE.MeshStandardMaterial({ color: 0x8d9ab8, map: gt, roughness: 0.96, metalness: 0.0 }));
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
    // протоптанная тропа со следами — от площади к лестнице
    var tc = document.createElement("canvas"); tc.width = 256; tc.height = 1024;
    var tx = tc.getContext("2d");
    var trail = tx.createLinearGradient(0, 0, 256, 0);
    trail.addColorStop(0, "rgba(40,48,72,0)"); trail.addColorStop(0.5, "rgba(40,48,72,0.34)"); trail.addColorStop(1, "rgba(40,48,72,0)");
    tx.fillStyle = trail; tx.fillRect(0, 0, 256, 1024);
    for (var st2 = 0; st2 < 30; st2++) {
      var sy = 30 + st2 * 33, sxx = 128 + Math.sin(st2 * 0.9) * 26 + (st2 % 2 ? 22 : -22);
      tx.save(); tx.translate(sxx, sy); tx.rotate((st2 % 2 ? 0.16 : -0.16));
      tx.fillStyle = "rgba(22,28,48,0.5)";
      tx.beginPath(); tx.ellipse(0, 0, 7, 13, 0, 0, Math.PI * 2); tx.fill();
      tx.restore();
    }
    var trailTex = new THREE.CanvasTexture(tc);
    var trailMesh = new THREE.Mesh(new THREE.PlaneGeometry(9, 34),
      new THREE.MeshBasicMaterial({ map: trailTex, transparent: true, depthWrite: false }));
    var TP = (window.ASSEMBLY3D_CONFIG && window.ASSEMBLY3D_CONFIG.trailPos) || [3, 0.05, 34];
    trailMesh.rotation.x = -Math.PI / 2; trailMesh.position.fromArray(TP); trailMesh.renderOrder = 1;
    scene.add(trailMesh);
  })();

  /* ================= свет ================= */
  scene.add(new THREE.HemisphereLight(0x36436e, 0x241c14, 0.3));
  var key = new THREE.DirectionalLight(0xffd9a3, 0.95);
  key.position.set(34, 40, 30); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -45; key.shadow.camera.right = 45;
  key.shadow.camera.top = 45; key.shadow.camera.bottom = -25;
  key.shadow.camera.far = 140; key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02;
  scene.add(key);
  var rim = new THREE.DirectionalLight(0x7fa0ff, 0.5); rim.position.set(-30, 22, -34); scene.add(rim);
  var flood1 = new THREE.SpotLight(0xffc37a, 1.9, 95, 0.5, 0.6, 1.7);
  flood1.position.set(-20, 3, 34); flood1.target.position.set(0, 10, 4); scene.add(flood1); scene.add(flood1.target);
  var flood2 = new THREE.SpotLight(0xffc37a, 1.9, 95, 0.5, 0.6, 1.7);
  flood2.position.set(20, 3, 34); flood2.target.position.set(0, 10, 4); scene.add(flood2); scene.add(flood2.target);
  var statueLight = null;
  function addStatueLight() {
    if (statueLight || !CFG.statueLight) return;
    statueLight = new THREE.SpotLight(0xffd9a0, 2.2, 34, 0.5, 0.7, 1.5);
    statueLight.position.fromArray(CFG.statueLight.pos); statueLight.target.position.fromArray(CFG.statueLight.target);
    scene.add(statueLight); scene.add(statueLight.target);
  }
  // видимые конусы света прожекторов (блики в морозном воздухе)
  var beamMat = new THREE.MeshBasicMaterial({ color: 0xffc37a, transparent: true, opacity: 0.05, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
  function beam(fx, fy, fz, tx2, ty2, tz2, r) {
    var from = new THREE.Vector3(fx, fy, fz), to = new THREE.Vector3(tx2, ty2, tz2);
    var len = from.distanceTo(to);
    var cone = new THREE.Mesh(new THREE.ConeGeometry(r, len, 18, 1, true), beamMat);
    cone.position.copy(from).lerp(to, 0.5);
    cone.lookAt(to); cone.rotateX(-Math.PI / 2);
    scene.add(cone);
  }
  var beamsAdded = false;
  function addBeams() {
    if (beamsAdded) return; beamsAdded = true;
    (CFG.beams || []).forEach(function (b) { beam(b[0], b[1], b[2], b[3], b[4], b[5], b[6]); });
  }

  /* ================= материалы ================= */
  var M = {
    stone: new THREE.MeshStandardMaterial({ color: 0xe6d9bc, roughness: 0.78, metalness: 0.0, envMapIntensity: 0.22, side: THREE.DoubleSide }),
    stone2: new THREE.MeshStandardMaterial({ color: 0xd4c5a4, roughness: 0.82, metalness: 0.0, envMapIntensity: 0.22, side: THREE.DoubleSide }),
    stoneDk: new THREE.MeshStandardMaterial({ color: 0xa8977a, roughness: 0.85, metalness: 0.0, envMapIntensity: 0.2 }),
    tymp: new THREE.MeshStandardMaterial({ color: 0x8f7f63, roughness: 0.9, metalness: 0.0, envMapIntensity: 0.3 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xd9a641, roughness: 0.26, metalness: 1.0, envMapIntensity: 1.35 }),
    bronze: new THREE.MeshStandardMaterial({ color: 0x5f7f6c, roughness: 0.4, metalness: 0.75, envMapIntensity: 1.8 }),
    roof: new THREE.MeshStandardMaterial({ color: 0x51606b, roughness: 0.6, metalness: 0.35, envMapIntensity: 0.4, side: THREE.DoubleSide }),
    velvet: new THREE.MeshStandardMaterial({ color: 0x7a1420, roughness: 0.9, metalness: 0.0, envMapIntensity: 0.25, side: THREE.DoubleSide }),
    velvetDk: new THREE.MeshStandardMaterial({ color: 0x571016, roughness: 0.92, metalness: 0.0, envMapIntensity: 0.2 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x6d4a2a, roughness: 0.7, metalness: 0.05, envMapIntensity: 0.3 }),
    crystal: new THREE.MeshStandardMaterial({ color: 0xfff2d8, emissive: 0xffd9a0, emissiveIntensity: 0.9, roughness: 0.2, metalness: 0.3 }),
    door: new THREE.MeshStandardMaterial({ color: 0x2c1d12, roughness: 0.6, metalness: 0.1, envMapIntensity: 0.4 }),
    glow: new THREE.MeshStandardMaterial({ color: 0x3a2513, emissive: 0xff9d3c, emissiveIntensity: 0.0, roughness: 0.5, envMapIntensity: 0.25 }),
    iron: new THREE.MeshStandardMaterial({ color: 0x1d2822, roughness: 0.5, metalness: 0.8, envMapIntensity: 0.55 }),
    lamp: new THREE.MeshStandardMaterial({ color: 0x3a2c14, emissive: 0xffbf6e, emissiveIntensity: 0.0, roughness: 0.4, envMapIntensity: 0.3 })
  };

  function mesh(geo, mat, x, y, z, g) {
    var m = new THREE.Mesh(geo, mat);
    if (x !== undefined) m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    if (g) g.add(m);
    return m;
  }
  function box(w, h, d, mat, x, y, z, g) { return mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, g); }
  function liftGroup(g, dy) { var w = new THREE.Group(); while (g.children.length) w.add(g.children[0]); w.position.y = dy; g.add(w); return g; }

  /* ================= детали театра ================= */
  var theatre = new THREE.Group(); scene.add(theatre);

  /* ================= конфиг контента ================= */
  var ctx = {
    THREE: THREE, M: M, mesh: mesh, box: box, liftGroup: liftGroup,
    loadGLTF: function (url, cb) { if (THREE.GLTFLoader) new THREE.GLTFLoader().load(url, cb); }
  };
  var CFG = (window.ASSEMBLY3D_CONFIG && window.ASSEMBLY3D_CONFIG.init) ? window.ASSEMBLY3D_CONFIG.init(ctx) : { parts: [] };
  var PARTS = CFG.parts || [];
  var INTERIOR_FACTS = CFG.interiorFacts || [];


  /* ================= сборка ================= */
  var placedN = 0, tweens = [], lampLights = [], puffs = [], lightsOn = false, suppressFinale = false;
  var progEl = document.getElementById("prog");
  var center = new THREE.Vector3(0, 8, 0);

  PARTS.forEach(function (p, i) { p.i = i; p.group = null; });

  function easeOutBack(t) { var c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }

  function placePart(i, instant) {
    var p = PARTS[i]; if (p.group) return;
    var g = p.b(); p.group = g;
    g.traverse(function (o) { o.userData.pi = i; });
    // вектор «разлёта» для взрыв-схемы
    var bb = new THREE.Box3().setFromObject(g), c = bb.getCenter(new THREE.Vector3());
    p.home = new THREE.Vector3(0, 0, 0);
    p.dir = c.clone().sub(center); p.dir.y += 6; p.dir.normalize();
    theatre.add(g);
    placedN++;
    progEl.textContent = placedN + " из " + PARTS.length;
    if (instant) { g.position.set(0, 0, 0); }
    else {
      g.position.set(0, 26, 0);
      tweens.push({ g: g, from: 26, t0: performance.now(), dur: 900 });
      showFact(i);
    }
    if (p.lights) turnLightsOn(g, !instant);
    if (placedN === PARTS.length) setTimeout(finale, instant ? 200 : 1100);
  }
  function turnLightsOn(g, animate) {
    M.glow.emissiveIntensity = animate ? 0 : 1.0;
    M.lamp.emissiveIntensity = animate ? 0 : 1.35;
    var lps = CFG.lampPoints || [];
    lampLights = lps.map(function (p2, li) {
      var l = new THREE.PointLight(0xffb45e, 0, li ? 24 : 26, 2); l.position.fromArray(p2); scene.add(l); return l;
    });
    var l1 = lampLights[0] || { intensity: 0 }, l2 = lampLights[1] || { intensity: 0 }, l3 = lampLights[2] || { intensity: 0 };
    if (!animate) { l1.intensity = 1.35; l2.intensity = 0.9; l3.intensity = 0.9; (CFG.poolMat || {}).opacity = 0.55; lightsOn = true; }
    else {
      var t0 = performance.now();
      (function up() {
        var k = Math.min(1, (performance.now() - t0) / 1400);
        M.glow.emissiveIntensity = 1.0 * k; M.lamp.emissiveIntensity = 1.35 * k;
        l1.intensity = 1.35 * k; l2.intensity = 0.9 * k; l3.intensity = 0.9 * k;
        (CFG.poolMat || {}).opacity = 0.55 * k;
        if (k < 1) requestAnimationFrame(up); else lightsOn = true;
      })();
    }
  }

  function showFact(i) {
    var p = PARTS[i];
    document.getElementById("factName").textContent = p.t;
    document.getElementById("factRole").textContent = p.r;
    document.getElementById("factText").textContent = p.f;
    document.getElementById("fact").classList.add("show");
    clearTimeout(showFact._t);
    showFact._t = setTimeout(function () { document.getElementById("fact").classList.remove("show"); }, 6500);
  }
  document.querySelector("#fact .fx").addEventListener("click", function () { document.getElementById("fact").classList.remove("show"); });

  /* финал: фанфара + золотые искры */
  var burst = null;
  function finale() {
    if (suppressFinale) return;
    document.getElementById("fin").classList.add("show");
    try { if (CFG.finaleAudio) { var a = new Audio(CFG.finaleAudio); a.play(); } } catch (e) {}
    var n = 260, pos = new Float32Array(n * 3), vel = [];
    for (var i = 0; i < n; i++) {
      pos[i * 3] = 0; pos[i * 3 + 1] = 17; pos[i * 3 + 2] = 3;
      var th = Math.random() * Math.PI * 2, sp = 4 + Math.random() * 9, up = 4 + Math.random() * 8;
      vel.push([Math.cos(th) * sp, up, Math.sin(th) * sp * 0.6]);
    }
    var gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var mm = new THREE.PointsMaterial({ color: 0xffd777, size: 0.34, transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending });
    burst = { p: new THREE.Points(gg, mm), vel: vel, t0: performance.now() };
    scene.add(burst.p);
  }

  /* ================= управление сборкой ================= */
  document.getElementById("btnNext").addEventListener("click", function () {
    for (var i = 0; i < PARTS.length; i++) if (!PARTS[i].group) { placePart(i, false); break; }
    updateNextBtn();
  });
  document.getElementById("btnAll").addEventListener("click", function () {
    var delay = 0;
    for (var i = 0; i < PARTS.length; i++) if (!PARTS[i].group) (function (idx, d) {
      setTimeout(function () { placePart(idx, false); updateNextBtn(); }, d);
    })(i, (delay++) * 420);
  });
  document.getElementById("btnReset").addEventListener("click", function () { location.reload(); });
  function updateNextBtn() {
    var left = PARTS.filter(function (p) { return !p.group; }).length;
    document.getElementById("btnNext").textContent = left ? "▶ Следующая деталь" : "✓ Собрано!";
  }

  /* разрез: клип-плоскость открывает зал, сцену и яму */
  var cutOn = false, cutPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0.01);
  var camFly = null;
  function flyTo(px, py, pz, tx2, ty2, tz2) {
    camFly = { p0: camera.position.clone(), p1: new THREE.Vector3(px, py, pz),
               t0: controls.target.clone(), t1: new THREE.Vector3(tx2, ty2, tz2), s: performance.now() };
  }
  function setCut(v) {
    cutOn = v;
    var planes = cutOn ? [cutPlane] : null;
    for (var k in M) if (M.hasOwnProperty(k)) { M[k].clippingPlanes = planes; M[k].needsUpdate = true; }
    var b = document.getElementById("btnCut"); if (b) b.textContent = cutOn ? "✕ Фасад" : "✂ Разрез";
  }
  document.getElementById("btnCut").addEventListener("click", function () {
    setCut(!cutOn);
    idle();
    if (cutOn) { var CV = CFG.cutView || {}; var cc = CV.cam || [-34, 17, 9], ct = CV.target || [0, 6.5, -4];
    flyTo(cc[0], cc[1], cc[2], ct[0], ct[1], ct[2]); if (CV.fact) showCustomFact(CV.fact.t, CV.fact.r, CV.fact.f); }
    else { flyTo(camHome.x, camHome.y, camHome.z, CT[0], CT[1], CT[2]); }
  });
  function showCustomFact(t, r, f) {
    document.getElementById("factName").textContent = t;
    void 0;
    document.getElementById("factRole").textContent = r;
    document.getElementById("factText").textContent = f;
    document.getElementById("fact").classList.add("show");
    clearTimeout(showFact._t);
    showFact._t = setTimeout(function () { document.getElementById("fact").classList.remove("show"); }, 6500);
  }

  /* ================= ярлыки-выноски ================= */
  var labelsOn = false, labelEls = [];
  var labelWrap = document.createElement("div");
  labelWrap.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:8;overflow:hidden;";
  document.body.appendChild(labelWrap);
  PARTS.forEach(function (p, i) {
    if (!p.label) return;
    var d = document.createElement("div");
    d.style.cssText = "position:absolute;display:none;transform:translate(-50%,-130%);background:rgba(20,16,12,.85);" +
      "color:#f5efe0;border:1.5px solid #C9A24B;border-radius:999px;font:800 11px/1.2 -apple-system,'Segoe UI',Roboto,sans-serif;" +
      "padding:4px 10px;white-space:nowrap;";
    d.textContent = p.label.text;
    var tick = document.createElement("i");
    tick.style.cssText = "position:absolute;left:50%;top:100%;width:1.5px;height:13px;background:#C9A24B;";
    d.appendChild(tick);
    labelWrap.appendChild(d);
    labelEls.push({ el: d, at: new THREE.Vector3().fromArray(p.label.at), pi: i });
  });
  var btnTags = document.getElementById("btnTags");
  if (btnTags) btnTags.addEventListener("click", function () {
    labelsOn = !labelsOn;
    btnTags.style.background = labelsOn ? "#C9A24B" : "rgba(30,24,18,.85)";
    btnTags.style.color = labelsOn ? "#3a2400" : "#f5efe0";
  });
  var labelV = new THREE.Vector3();
  function updateLabels() {
    for (var i = 0; i < labelEls.length; i++) {
      var L = labelEls[i], show = labelsOn && PARTS[L.pi].group;
      if (show) {
        labelV.copy(L.at);
        var off = PARTS[L.pi].group.position;                     // учёт взрыв-схемы
        labelV.x += off.x; labelV.y += off.y; labelV.z += off.z;
        labelV.project(camera);
        if (labelV.z > 1 || labelV.z < -1) show = false;
        else {
          L.el.style.left = ((labelV.x * 0.5 + 0.5) * window.innerWidth) + "px";
          L.el.style.top = ((-labelV.y * 0.5 + 0.5) * window.innerHeight) + "px";
        }
      }
      L.el.style.display = show ? "block" : "none";
    }
  }

  /* ================= экскурсия (автооблёт с рассказом) ================= */
  var tour = null, btnTour = document.getElementById("btnTour");
  function tourStop(goHome) {
    if (!tour) return;
    clearTimeout(tour.timer); tour = null;
    if (btnTour) btnTour.textContent = "▶ Экскурсия";
    setCut(false);
    if (goHome) flyTo(camHome.x, camHome.y, camHome.z, CT[0], CT[1], CT[2]);
  }
  function tourNext() {
    var stops = CFG.tour || [];
    tour.i++;
    if (tour.i >= stops.length) { tourStop(true); return; }
    var st = stops[tour.i];
    setCut(!!st.cut);
    flyTo(st.cam[0], st.cam[1], st.cam[2], st.target[0], st.target[1], st.target[2]);
    var f = st.fact || (st.part != null ? PARTS[st.part] : null);
    if (f) showCustomFact(f.t, f.r, f.f);
    tour.timer = setTimeout(tourNext, st.dwell || 4500);
  }
  if (btnTour) {
    if (!(CFG.tour && CFG.tour.length)) btnTour.style.display = "none";
    btnTour.addEventListener("click", function () {
      if (tour) { tourStop(true); return; }
      suppressFinale = true;                                        // тихая досборка без финала
      for (var i = 0; i < PARTS.length; i++) if (!PARTS[i].group) placePart(i, true);
      setTimeout(function () { suppressFinale = false; }, 700);
      updateNextBtn();
      controls.autoRotate = false;
      tour = { i: -1, timer: null };
      btnTour.textContent = "■ Стоп";
      tourNext();
    });
  }

  /* взрыв-схема */
  var explo = document.getElementById("explo");
  explo.addEventListener("input", function () {
    var k = explo.value / 100 * 10;
    PARTS.forEach(function (p) {
      if (!p.group || tweens.some(function (t) { return t.g === p.group; })) return;
      p.group.position.set(p.dir.x * k, p.dir.y * k * 0.6, p.dir.z * k);
    });
  });

  /* ================= тап по детали → факт ================= */
  var ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), downXY = null;
  canvas.addEventListener("pointerdown", function (e) { downXY = [e.clientX, e.clientY]; idle(); if (tour) tourStop(false); });
  canvas.addEventListener("pointerup", function (e) {
    if (!downXY) return;
    var moved = Math.abs(e.clientX - downXY[0]) + Math.abs(e.clientY - downXY[1]); downXY = null;
    if (moved > 8) return;
    ptr.x = (e.clientX / window.innerWidth) * 2 - 1;
    ptr.y = -(e.clientY / window.innerHeight) * 2 + 1;
    ray.setFromCamera(ptr, camera);
    var hits = ray.intersectObjects(theatre.children, true);
    if (!hits.length) return;
    var ob = hits[0].object;
    if (cutOn && ob.userData.fi !== undefined) { var F = INTERIOR_FACTS[ob.userData.fi]; showCustomFact(F.t, F.r, F.f); return; }
    if (ob.userData.pi !== undefined) showFact(ob.userData.pi);
  });

  /* автоповорот: пауза при взаимодействии */
  var idleT = null;
  function idle() {
    controls.autoRotate = false; clearTimeout(idleT);
    idleT = setTimeout(function () { controls.autoRotate = true; }, 7000);
  }

  function spawnPuff(g) {
    var bb = new THREE.Box3().setFromObject(g), c = bb.getCenter(new THREE.Vector3());
    var n = 26, pos = new Float32Array(n * 3), vel = [];
    for (var i = 0; i < n; i++) {
      var th = Math.random() * Math.PI * 2, r = (bb.max.x - bb.min.x) * 0.25 + 1;
      pos[i * 3] = c.x + Math.cos(th) * r * 0.4; pos[i * 3 + 1] = bb.min.y + 0.3; pos[i * 3 + 2] = c.z + Math.sin(th) * r * 0.4;
      vel.push([Math.cos(th) * (2 + Math.random() * 2.5), 1.2 + Math.random() * 1.4, Math.sin(th) * (2 + Math.random() * 2.5)]);
    }
    var gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var mm = new THREE.PointsMaterial({ color: 0xdfe6f2, size: 0.55, map: snowTex, transparent: true, opacity: 0.85, depthWrite: false });
    var pts = new THREE.Points(gg, mm);
    scene.add(pts);
    puffs.push({ p: pts, vel: vel, t0: performance.now(), base: pos.slice(0) });
  }

  /* ================= снег ================= */
  var SNOW_N = 1300, snowGeo = new THREE.BufferGeometry(), snowPos = new Float32Array(SNOW_N * 3), snowSp = [];
  for (var i = 0; i < SNOW_N; i++) {
    snowPos[i * 3] = (Math.random() - 0.5) * 130;
    snowPos[i * 3 + 1] = Math.random() * 45;
    snowPos[i * 3 + 2] = (Math.random() - 0.5) * 130;
    snowSp.push(1.1 + Math.random() * 1.6);
  }
  snowGeo.setAttribute("position", new THREE.BufferAttribute(snowPos, 3));
  var snowTex = (function () {
    var c = document.createElement("canvas"); c.width = c.height = 32;
    var x = c.getContext("2d"), g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.5, "rgba(255,255,255,.65)"); g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g; x.fillRect(0, 0, 32, 32);
    var t = new THREE.CanvasTexture(c); return t;
  })();
  var snow = new THREE.Points(snowGeo, new THREE.PointsMaterial({
    size: 0.4, map: snowTex, transparent: true, opacity: 0.9, depthWrite: false
  }));
  scene.add(snow);

  /* ================= звук зимней площади (CC0 wind, Wikimedia) ================= */
  (function () {
    var wind = document.getElementById("wind"), btn = document.getElementById("snd");
    if (!wind || !btn) return;
    var on = false;
    function set(v) {
      on = v; btn.textContent = on ? "🔊" : "🔇";
      if (on) { wind.volume = 0.22; var p = wind.play(); if (p && p["catch"]) p["catch"](function () { set(false); }); }
      else { try { wind.pause(); } catch (e) {} }
    }
    btn.addEventListener("click", function () { set(!on); });
    canvas.addEventListener("pointerdown", function first() { canvas.removeEventListener("pointerdown", first); if (!on) set(true); });
  })();

  /* ================= цикл ================= */
  var hintEl = document.getElementById("hint");
  setTimeout(function () { hintEl.style.opacity = "0"; }, 6000);

  function animate(now) {
    requestAnimationFrame(animate);
    if (introT0 !== null) {                    // плавный подлёт при открытии
      var ik = Math.min(1, (now - introT0) / INTRO_MS);
      var e = 1 - Math.pow(1 - ik, 3);
      camera.position.lerpVectors(camFrom, camHome, e);
      if (ik >= 1) introT0 = null;
    }
    if (camFly) {                              // перелёт (режим разреза)
      var fk = Math.min(1, (now - camFly.s) / 1500), fe = 1 - Math.pow(1 - fk, 3);
      camera.position.lerpVectors(camFly.p0, camFly.p1, fe);
      controls.target.lerpVectors(camFly.t0, camFly.t1, fe);
      if (fk >= 1) camFly = null;
    }
    controls.update();
    // твины падения деталей
    for (var i = tweens.length - 1; i >= 0; i--) {
      var tw = tweens[i], k = Math.min(1, (now - tw.t0) / tw.dur);
      tw.g.position.y = tw.from * (1 - easeOutBack(k));
      if (k >= 1) { tw.g.position.y = 0; tweens.splice(i, 1); spawnPuff(tw.g); }
    }
    // снег
    var pos = snowGeo.attributes.position;
    for (var s = 0; s < SNOW_N; s++) {
      var y = pos.getY(s) - snowSp[s] * 0.016;
      if (y < 0) y = 45;
      pos.setY(s, y);
      pos.setX(s, pos.getX(s) + Math.sin(now * 0.0004 + s) * 0.008);
    }
    pos.needsUpdate = true;
    // живое мерцание огней (окна и фонари чуть «дышат»)
    if (lightsOn) {
      var fl = 0.93 + 0.05 * Math.sin(now * 0.0021) + 0.02 * Math.sin(now * 0.0093);
      M.glow.emissiveIntensity = 1.0 * fl;
      M.lamp.emissiveIntensity = 1.35 * (0.9 + 0.1 * Math.sin(now * 0.0047 + 2));
      for (var ll = 0; ll < lampLights.length; ll++)
        lampLights[ll].intensity = (ll === 0 ? 1.35 : 0.9) * (0.9 + 0.1 * Math.sin(now * 0.006 + ll * 2.6));
    }
    // пыль приземления
    for (var pu = puffs.length - 1; pu >= 0; pu--) {
      var pf = puffs[pu], pk = (now - pf.t0) / 700;
      if (pk >= 1) { scene.remove(pf.p); puffs.splice(pu, 1); continue; }
      var pp = pf.p.geometry.attributes.position;
      for (var pj = 0; pj < pf.vel.length; pj++) {
        pp.setX(pj, pf.base[pj * 3] + pf.vel[pj][0] * pk);
        pp.setY(pj, pf.base[pj * 3 + 1] + pf.vel[pj][1] * pk * (1 - pk * 0.5));
        pp.setZ(pj, pf.base[pj * 3 + 2] + pf.vel[pj][2] * pk);
      }
      pp.needsUpdate = true;
      pf.p.material.opacity = 0.85 * (1 - pk);
    }
    // искры финала
    if (burst) {
      var bp = burst.p.geometry.attributes.position, dt = (now - burst.t0) / 1000;
      for (var b = 0; b < burst.vel.length; b++) {
        bp.setX(b, burst.vel[b][0] * dt);
        bp.setY(b, 17 + burst.vel[b][1] * dt - 4.9 * dt * dt);
        bp.setZ(b, 3 + burst.vel[b][2] * dt);
      }
      bp.needsUpdate = true;
      burst.p.material.opacity = Math.max(0, 1 - dt / 2.6);
      if (dt > 2.8) { scene.remove(burst.p); burst = null; }
    }
    updateLabels();
    if (composer) composer.render(); else renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);

  addBeams(); addStatueLight();
  updateNextBtn();
  window.M3D = { camera: camera, controls: controls, scene: scene };
})();
