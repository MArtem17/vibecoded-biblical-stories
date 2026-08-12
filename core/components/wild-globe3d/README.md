# core/components/wild-globe3d — общий 3D-глобус звериной серии

Один версионируемый движок three.js (r136) для всех колод серии-энциклопедии
(«Птицы мира», «Подводный мир», …). Колода про движок знает только через данные и
конфиг — сам `engine.js` про конкретную колоду **не знает** (тот же принцип, что и
`decks/strany-mira/globe/`).

```
wild-globe3d/
  engine.js      ← движок (сцена, дуги маршрутов, зоны, впадины, течения, доворот). ОДИН на все.
  three.min.js   ← three.js r136 (UMD) + OrbitControls/EffectComposer/UnrealBloomPass/RoomEnvironment. ОДНА копия.
  README.md
```

Колода в `decks/<slug>/globe3d/` несёт только тонкий `index.html` (HUD-разметка +
подключение) и `config.js` (тема + опциональные слои). Движок и three.js **не
дублируются**.

## Данные (глобалы, как у 2D-глобуса)

- `WILD_LAND` (`../geo.data.js`) — береговые линии → материки на текстуре Земли.
- `WILD_FLYWAYS` (`../flyways.data.js`) — дуги маршрутов (перелёты/морские пути) с
  движущимися стайками и стрелкой; `.meta[id]={label,color,birds:[…]}`, `.paths[id]`, `.order`.
- `WILD_REGIONS` (`../regions.data.js`) — пины зон обитания; `.meta[id]={label,color,lon,lat}`, `.members[id]`, `.order`.
- `WILD_DECK` (`../cards.data.js`) — `.cards[]={id,name,face}` для нижнего листа.

## Конфиг колоды — `window.WILD_GLOBE3D` (файл `globe3d/config.js`)

Все поля опциональны; по умолчанию — наземная колода без океанских слоёв («Птицы»).

| поле            | тип       | по умолчанию            | что делает |
|-----------------|-----------|-------------------------|------------|
| `bathymetry`    | bool      | `false`                 | рельеф дна: тёмные впадины + светлый шельф у берегов |
| `oceanGradient` | `[c0,c1,c2]` | синий (птицы)        | вертикальный градиент океана (верх/центр/низ) |
| `pois`          | `[{name,lon,lat,depth,note}]` | `[]`  | тап-точки (впадины): светящееся кольцо + тост; внутри симулятора — кнопка «нырок» |
| `flows`         | `[{warm,loop,path:[[lon,lat]…]}]` | `[]` | живые течения: русло + текущие частицы (тёплые/холодные) |
| `diveZone`      | string    | `'abyss'`               | зона для `postMessage({t:'ocean-dive',zone})` из POI в симуляторе |
| `terms`         | object    | нейтральные             | подписи: `routeLabel`, `zonesLabel`, `zonesHintOn/Off`, `hint` |

Примеры: `decks/podvodnyy-mir/globe3d/config.js` (океан: батиметрия + впадины +
течения), `decks/ptitsy-mira/globe3d/config.js` (суша: плоский океан, только
перелёты и зоны).

## Инварианты

- Движок обратно совместим: правки ради одной колоды не должны ломать другую —
  всё различие уносим в `config.js`, а не в `if(колода==='…')`.
- iOS WebKit: скрипты — внешние файлы (лимит 21 КБ на инлайн); текстуры Земли
  рисуются процедурно из `WILD_LAND` (внешние картинки WebGL по file:// не грузит).
- `?dev=1` — отладочные хуки: `window.__info()` → {flyways, zones, cards, trenches,
  currents}, `__openFly(id)`, `__openZone(id)`, `__zones()`, `__trench(i)`, `__frame(lon,lat,dist)`.

## Как подключить в новой колоде

```html
<script src="../geo.data.js"></script>
<script src="../flyways.data.js"></script>
<script src="../regions.data.js"></script>
<script src="../cards.data.js"></script>
<script src="../../../core/components/wild-globe3d/three.min.js"></script>
<script src="config.js"></script>
<script src="../../../core/components/wild-globe3d/engine.js"></script>
```

HUD-разметка (`#stage`, `#boot`, `#legend`, `#sheet`/`#sheetGrid`/`#sheetTitle`/
`#sheetSub`/`#sheetX`, `#hint`; опц. `#toast`, `#depthkey`) — в `index.html` колоды.
