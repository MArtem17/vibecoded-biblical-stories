# Библейские истории (`biblejskie-istorii`) — колода в проекте `biblejskie-istorii-boris`

Том на **неизменённом** `core/` из boriscards. Не копируйте сюда форки `feed.js` /
`encyclopedia.js` из исходного `biblejskie-istorii`.

## Разделы оболочки

| Раздел | Реализация |
|--------|------------|
| В путь | главы `feed/*.js` → platform `feed.js`; `kinds-colors.js` |
| Карты / Книги / Стройка / Словарик | `hub.html` + `quest/` (копия в колоде) + `data/volume.js` |
| Игры | хаб quest + пазл `games/jigsaw-sandbox.js` |
| Книги-ридеры | `books/*/reader.html` → platform encyclopedia |

## Плагины ленты

`feed/kinds-colors.js` регистрирует `colors` (цвета радуги). Остальные kinds
(art / scene / check / tf / order / find / count / catch / veil / lant / sys)
есть в платформенном `feed.js`.
