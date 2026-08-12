# core/components/wild-globe — общий 2D-глобус звериной серии

Ортографический canvas-глобус (ES5, без зависимостей) для колод серии-энциклопедии
(«Птицы мира», «Дикие животные», «Подводный мир»). Один источник на все колоды:
контент приходит данными, движок про конкретную колоду не знает.

## API — `window.WildGlobe`

```js
WildGlobe.init(canvas, landData, regionList, pickCb, flyPickCb);  // flyPickCb — опц.
WildGlobe.setRegions(list);        // [{id,lon,lat,color,name,count}]
WildGlobe.setFlyways(list);        // опц. слой маршрутов [{id,path,color,emoji}]
WildGlobe.setFlyMode(on);          // показать/скрыть маршруты
WildGlobe.isFlyMode();
WildGlobe.start(); WildGlobe.stop(); WildGlobe.resize();
```

- `landData` — `WILD_LAND` (`geo.data.js`), массив полигонов `[[lon,lat]…]`.
- `regionList` — из `WILD_REGIONS`, зоны с координатами/цветом/подписью.
- `pickCb(id, region)` — тап по пину зоны.
- Колода **без маршрутов** (напр. «Дикие животные») просто не передаёт `flyPickCb`
  и не зовёт `setFlyways` — слой не рисуется, всё остальное работает как есть.

## Подключение

```html
<script src="../../core/components/wild-globe/globe.js"></script>
```

Дальше движок поднимает `decks/<slug>/app.js` (`WildGlobe.init(...)` на вкладке
«Глобус»). Ассеты/данные — из самой колоды. Всё офлайн.

Для 3D-версии (течения, батиметрия, доворот, впадины) см. соседний
`core/components/wild-globe3d/`.
