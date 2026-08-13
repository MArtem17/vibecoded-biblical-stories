# Библейские истории (BST)

Том «Библия: великие истории» серии «Моя первая большая энциклопедия».
Культурно-образовательный, конфессионально-нейтральный продукт для 5–9 лет.

Контент тома (герои, сюжеты, UI, книги, стройки) — `data/volume.js`.
Лента «В путь» — `feed/*.js`. Оболочка — `index.html` + `app.js`.

## Состав

```
index.html / app.js / app.css / shell.css / ui.i18n.js / nav.js
hub.html                 альбом / книги / стройка / игры / словарик (quest)
feed/                    лента «В путь» (opening + chapter2…9 + ugaday)
book/reader.html         общая книга-энциклопедия тома (+ пазл-история)
data/volume.js           карты, UI, книги, глоссарий, стройки, audioLangs
core/engines/feed        движок ленты
core/engines/quest       движок хаба (альбом, игры, стройка, квест)
core/engines/encyclopedia читалка книг + sandbox-игры (jigsaw и др.)
books/*                  6 аудиокниг (свой reader на encyclopedia)
img/                     heroes_*/plots_* 820×1230 + feed_*.webp + icons/
anchors/                 якоря персонажей для генерации сцен
audio/                   озвучка карт (по audioReady)
pipeline/                генерация картинок, перевод, TTS, аудиты
cover.webp               обложка тома
```

## Режимы

- **В путь** — лента эпох (`feed/`): 10 глав, ~389 карточек.
  Механики: art / scene / check / tf / order / find / count / colors /
  catch / lant / veil / sys и др. Прогресс и язык — `bibi_*` в localStorage.
- **Альбом** — герои и сюжеты (20+20 карт WebP 820×1230), изнанка с фактами,
  «Найди на карточке», озвучка при `audioReady:true`.
- **Книги** — шесть ридеров: Сотворение мира, Моисей, Ноев ковчег, Давид,
  Иона, Рождество (`books/*/reader.html`, движок encyclopedia, караоке).
- **Стройка** — пошаговые реконструкции (ковчег, Вавилон и др.).
- **Игры** — мемори, квиз, «Чья вещь?», порядок событий, пазл 3×3,
  пазл-история (jigsaw), «Ковчег сквозь скалы», найди на картине, туман,
  сложи слово, послушай, игры книги.
- **Словарик** — термины с кратким объяснением и связью с картами.
- **Родителям** — настройки / прогресс (после простой проверки).

## Языки

Поддерживаются **7 языков**: `ru en de es pt fr ar` (RTL для `ar`).
Ключ языка оболочки и ленты: `bibi_lang`.

| Слой | Статус |
|------|--------|
| UI оболочки (`ui.i18n.js`) | 7 языков |
| Лента «В путь» (`feed/*.js`) | 7 языков (поля `{ru,en,de,es,pt,fr,ar}`) |
| Карты / UI тома (`data/volume.js`) | 7 языков |
| Книги-ридеры | 7 языков (текст + UI ридера) |
| Озвучка карт альбома | `audioLangs: ["ru","en"]` |
| Озвучка ленты «В путь» | пока выключена (`audio:false` у глав) |

`L()` / `T()` берут текущий язык и падают на `ru`, если перевода нет.
ru-тексты и флаги в `data/volume.js` правятся руками; массовые переводы —
через `pipeline/translate_cards.py` → `apply_translations.js`
(файл volume.js при apply **перезаписывается**).

## Прогресс

- Ключ `bibi_prog` (префикс `ns` тома): просмотренные карты, игры, квест,
  стрик. Не пересекается с другими колодами.
- Тема: `bible_theme` (`light` / `dark`).

## Конвейер (`pipeline/`, ключи в git НЕ живут)

```
export OPENAI_API_KEY=... ANTHROPIC_API_KEY=... GENAPI_KEY=...
python pipeline/gen_plots.py          # сцены plots_*: images.edit + проверка тона
python pipeline/gen_cover.py          # обложка
node   pipeline/export_json.js        # volume.js → JSON
python pipeline/translate_cards.py    # перевод батчами → pipeline/translations/
node   pipeline/apply_translations.js # слияние → перезапись data/volume.js
python pipeline/tts_cards.py          # озвучка карт + trim + проверка языка
```

- Тон картинок (копия 200×300): L̄ ≥ 150, тени (L<70) < 6%, «бумага»
  (L>200) ≥ 25%; иначе перегенерация (до 3 попыток).
- Якоря: сцены с героем — `images.edit` от `anchors/*_anchor.webp`
  (PRESERVE); без героя — стиль от `noah_anchor` (NO_CHARACTER).
- После прогона выставляй `imgReady` / `audioReady`; аудиоблок карт
  виден только для языков из `audioLangs`.

## Что ещё открыто

1. Озвучка ленты «В путь» (сейчас главы с `audio:false`).
2. Озвучка карт альбома на de/es/pt/fr/ar (расширить `audioLangs` + TTS).
3. PWA / офлайн-кэш (manifest + service worker) — пока нет.
4. Живой smoke-тест на реальных iOS/Android после крупных правок ленты.
