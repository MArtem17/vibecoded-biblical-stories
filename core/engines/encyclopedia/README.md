# Движок «Энциклопедия» (encyclopedia)

Интерактивная озвученная книга-энциклопедия: развороты с текстом поверх
иллюстрации (5 языков), «Прочти мне» с караоке-подсветкой и авто-переворотом,
хотспоты-факты, термины-словарик, «Семья», оглавление и библиотека мини-игр
(sandbox). Эталон и первый потребитель — «Динозавры»
(`decks/dinozavry/book/`). ES5+, vanilla, офлайн, iOS WKWebView.

## Состав

- `encyclopedia.js` — движок (строит DOM-скелет сам, если страница не принесла свой)
- `encyclopedia.css` — стили

## Как собрать новую книгу

Три файла в `decks/<slug>/book/`:

```html
<!-- reader.html — тонкая страница -->
<!DOCTYPE html><html lang="ru"><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Книга</title>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=Baloo+2:wght@600;700;800&display=swap"
        rel="stylesheet" media="print" onload="this.media='all'">
  <link rel="stylesheet" href="../../../core/engines/encyclopedia/encyclopedia.css">
</head><body>
  <script src="book.data.js"></script>
  <script src="../../../core/engines/encyclopedia/encyclopedia.js"></script>
</body></html>
```

`book.data.js` — весь контент: `window.BOOK = { book_id, title, languages:[...],
labels, pages:[...] }`. Ассеты — рядом в `../assets/` (WebP-страницы,
mp3-озвучка `../assets/audio/<lang>/page-NN.mp3` в `pages[].audio`).

**Порядок скриптов обязателен: данные до движка** (движок читает
`window.BOOK` при загрузке).

## Формат страницы (`pages[]`)

`{ n, toc:{5 langs}, layout:"top|bottom|side|panel|title|quiz|caption",
img, imgfit?, imgpos?, series?, text:{5 langs}, audio:{lang:path}?,
badge?, footnotes?, quiz?, hotspots?, family?, terms?, timeline?,
sandbox? | sandboxes:[...] }`

Типы sandbox-игр: `sort / timeline / scale / shadow / quiz / memory / label /
word / ispy / truefalse / dig / puzzle / whack / duel / foodchain / runner /
glossary`. Данные каждой игры — в объекте sandbox (см. эталон, стр. 29).

## Режимы URL

- `?lang=ru|en|de|es|pt` — язык; live-смена: `postMessage({type:"dinoLang",lang})`
- `?embed=1` — скрыть внутренний переключатель языков (для iframe приложения)
- `?page=NN` — открыть разворот; `&lock=1` — зафиксировать (без навигации)
- `?games=1` — витрина всех sandbox-игр книги вместо чтения
- `?edit=1` — **редактор разметки** (работает для любой книги на движке). Чистый
  экран разворота: тяни сами точки (с подписью) и блок текста (свободное
  положение `textpos`); долгое нажатие на точку — удалить (с подтверждением);
  ↶ — отменить последнее действие. Внизу тонкая полоска: ◀ N/всего ▶, «Отменить»
  и «Сохранить». «Сохранить» кладёт правки в `localStorage` (ключ
  `<book_id>_edit_v1`, переживают перезагрузку) и скачивает файл
  `<book_id>-razmetka.json` для переноса в `book.data.js`. Счётчик `N✎` —
  сколько разворотов тронуто. Только для разметки; `textpos:{x,y,w}` (проценты)
  движок применяет и в обычном режиме.

### Разметить другую книгу (в другой сессии/проекте)

Редактор — часть движка, поэтому специально ничего включать не надо:
1. Открой reader нужной книги с `?edit=1` (на задеплоенном адресе), напр.
   `.../decks/<slug>/book/<reader>.html?edit=1`.
2. Пройди развороты (◀ ▶), подвинь точки и текст, при необходимости удали
   (долгое нажатие) — жми «Сохранить». Скачается `<book_id>-razmetka.json`.
3. Пришли файл агенту той сессии. Применение — тем же приёмом: распарсить
   `book.data.js` (`window.BOOK = window.BOOK || {…};` — это чистый JSON),
   по `n` обновить у страниц `hotspots[].x/y` и, если есть, `textpos`, оставив
   подписи как есть; пере-сериализовать `json.dumps(BOOK, ensure_ascii=False,
   indent=2)` с тем же префиксом/`;`.

## Правила

- Движок не знает про конкретную книгу: контент только в `window.BOOK` и
  ассетах колоды. Правки логики — здесь, в `core/`; **не копировать движок
  в колоду** (см. CLAUDE.md §2).
- Караоке для mp3 оценивает тайминги по длине слов — озвучка должна
  **дословно** повторять `text[lang]`.
- Скрипт озвучки и нарезка клипов — см. `decks/dinozavry/docs/tts-v3-ru.md`
  (образец конвейера).
