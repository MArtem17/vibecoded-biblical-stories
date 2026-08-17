# Доработки за последние 2 недели

Период: ~28 июля – 10 августа 2026.  
Объём: ~351 файл, из них ~240+ иллюстраций, остальное — код, контент и пайплайн.

---

## 29–31 июля — постеры и иконки

- Набор SVG-иконок для постеров (`img/icons/poster/`)
- Данные оверлеев: `data/poster_overlay.js`
- Аудит переполнения постеров (`pipeline/audit_poster_overflow*`)
- Марки иконок: scroll, cards, family, puzzle, amphora, headphones, blocks, cloud, magnifier, hourglass и др.

---

## 3-4 августа — арт и глава 9

- Контент главы: `feed/chapter9.js`
- Splash: `img/splash_hero.webp`
- Животные ковчега: `img/feed_ark_*`
- Иллюстрации к главам 2–3 (Авраам, Иаков, Иосиф, Моисей и др.)

---

## 5–7 августа — массовая генерация картинок ленты

Пик активности: **7 августа** (~174 файла).

Картинки по блокам:

- `feed_b1` … `feed_b8` — истории и квизы (order / check / tf)
- `feed_vg` — блок «Угадай»
- Скрипты конвертации батчей: `convert_feed_121_140`, `221_240`, `381_389` и др.

Ориентировочно по префиксам:

| Префикс   | Кол-во |
|-----------|--------|
| feed_b2   | 31     |
| feed_b3   | 33     |
| feed_b8   | 33     |
| feed_b6   | 28     |
| feed_b7   | 26     |
| feed_b4   | 26     |
| feed_b1   | 22     |
| feed_vg   | 19     |
| feed_b5   | 14     |
| feed_ark  | 8      |

---

## 10 августа — сборка контента и движков

### Лента (feed)

- Главы: `chapter2`–`chapter8`, `chapter_ugaday`
- Вспомогательные: `opening.js`, `program.js`, `graph.js`
- `feed/index.html`

### Движки и оболочка

- `core/engines/feed/` (`feed.js`, `feed.css`)
- `core/engines/quest/` (`quest.js`, `quest.css`)
- `core/engines/encyclopedia/` (`encyclopedia.js`, `encyclopedia.css`)
- `core/engines/rech-deck-kit/deck.css`
- `index.html`, `hub.html`, `app.js`, `nav.js`, `shell.css`, `ui.i18n.js`
- `data/volume.js`
- `book/reader.html`

### Пайплайн

- Конвертеры батчей 61–80, 181–360 и др.
- Аудит: `audit_static.js`, `audit_feed_201_220.js`, `audit_poster_overflow.js`
- Генерация: `gen_poster_overlay.js`, `gen_icon_marks.py`, `fix_star_mark.py`

---

## Краткий вывод

Основной фокус двух недель — **наполнение feed-контента**: сотни иллюстраций по главам 1–8 и «Угадай», пайплайн конвертации и аудита, набор постер-иконок, затем синхронизация глав и движков приложения.
