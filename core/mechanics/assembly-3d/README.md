# 3D-конструктор (`assembly-3d`)

Переиспользуемая механика: **интерактивная 3D-модель, которую собирают по деталям с фактами**.
Движок на three.js (r128 UMD из `core/vendor/three-r128/`) с фирменной сценой: зимний вечер,
PBR-материалы + ACES-тонемаппинг + PMREM-окружение, мягкие тени, снег, прожекторы с видимыми
лучами, тропа со следами, звук ветра.

Режимы из коробки:
- **сборка** — детали прилетают по одной или все сразу, каждая с карточкой «что это и зачем»;
  тап по детали повторяет факт; «пыль» при приземлении; финал — фанфара и золотые искры,
  у детали с флагом `lights:true` загораются окна/фонари;
- **взрыв-схема** — слайдер «Разбор» разводит детали в воздухе;
- **✂ разрез** — clip-плоскость по продольной оси открывает интерьер; тапы по интерьеру → свои факты;
- **▶ экскурсия** — автооблёт с остановками и рассказом (маршрут в конфиге), отменяется касанием;
- **🏷 ярлыки** — подписи-выноски у деталей, следят за камерой и взрыв-схемой;
- орбита/щипок/колесо, автоповорот в простое, подлёт камеры на старте, адаптив под портрет.

Эталон использования — **decks/kulturnyy-pasport**: `model3d.html` (разметка) +
`model3d-parts.js` (контент «Собери Большой театр», 12 деталей).

## Как подключить в колоде

1. Страница с обязательной разметкой (скопируй `model3d.html` эталона): канвас `#gl`,
   кнопки `#btnNext #btnAll #btnReset #btnTour #btnTags #btnCut`, слайдер `#explo`,
   карточка `#fact` (+`#factName #factRole #factText`), `#prog`, `#fin`, `#hint`,
   опц. `#snd` + `<audio id="wind">`.
2. Скрипты (порядок важен):
   ```html
   <script src="../../core/vendor/three-r128/three.min.js"></script>
   <script src="../../core/vendor/three-r128/OrbitControls.js"></script>
   <!-- опц.: GLTFLoader.js, SkeletonUtils.js — если детали грузят GLTF -->
   <!-- опц.: CopyShader, LuminosityHighPassShader, EffectComposer, RenderPass, ShaderPass, UnrealBloomPass — bloom -->
   <script src="my-parts.js"></script>
   <script src="../../core/mechanics/assembly-3d/assembly-3d.js"></script>
   ```
3. Контент-файл задаёт `window.ASSEMBLY3D_CONFIG`:

```js
window.ASSEMBLY3D_CONFIG = {
  title: "Название",
  cameraHome: [38,16,56], cameraTarget: [0,8,2],   // стартовая камера
  trailPos: [3,0.05,34],                           // где лежит тропа со следами
  init: function (ctx) {                            // ctx: THREE, M(материалы), mesh, box, liftGroup, loadGLTF
    var THREE=ctx.THREE, M=ctx.M, mesh=ctx.mesh, box=ctx.box, liftGroup=ctx.liftGroup;
    function buildFoo(){ var g=new THREE.Group(); box(10,2,10,M.stone,0,1,0,g); return g; }
    return {
      parts: [
        { t:"Название детали", r:"подзаголовок", f:"Факт.", b:buildFoo,
          label:{ at:[x,y,z], text:"Ярлык" },       // опц.: подпись-выноска
          lights:true }                              // опц.: деталь «зажигает» огни
      ],
      interiorFacts: [ {t,r,f}, … ],                 // опц.: факты интерьера (тапы в разрезе, userData.fi)
      finaleAudio: "path.mp3",                       // опц.: фанфара финала
      lampPoints: [[x,y,z],…],                       // опц.: point-light'ы огней
      beams: [[fx,fy,fz, tx,ty,tz, r],…],            // опц.: видимые конусы света
      statueLight: { pos:[…], target:[…] },          // опц.: подсветка «статуи»
      poolMat: poolMatФонарей,                        // опц.: материал пятен света (гасится/зажигается)
      cutView: { cam:[…], target:[…], fact:{t,r,f} },// опц.: ракурс и карточка режима «Разрез»
      tour: [                                        // опц.: маршрут экскурсии
        { cam:[…], target:[…], dwell:4500, part:3 },        // остановка у детали (факт детали)
        { cam:[…], target:[…], dwell:5200, cut:true, fact:{t,r,f} } // своя карточка, можно с разрезом
      ]
    };
  }
};
```

Замечания:
- координаты деталей — **абсолютные в сцене**; позицию группы детали движок использует для
  анимации сборки и взрыв-схемы. Если строителю нужно смещение — внутренняя группа
  (`liftGroup(g,dy)` или свой `new Group()` внутри);
- интерьер для разреза строится внутри детали-«стен»; элементам проставляется `userData.fi`
  (индекс в `interiorFacts`). Камень движка — DoubleSide, срез чистый;
- палитра материалов `ctx.M`: stone/stone2/stoneDk/tymp/gold/bronze/roof/door/glow/iron/lamp/
  velvet/velvetDk/wood/crystal — фирменный набор «камень+золото+бархат»;
- всё офлайн: three.js и модели — в `core/vendor/`, звук/текстуры — в колоде;
- лицензии контента (GLTF, звук) — как обычно: PD/CC0 свободно, CC-BY с указанием автора,
  MIT — с сохранением уведомления (см. `sprites/model3d_CREDITS.txt` эталона).
