/* Витринная карточка для таба «Книги».
   Книга на общем движке «Энциклопедия» (караоке, 7 языков текста), свой
   reader.html — поэтому engine:"external": сборщик кладёт обложку в каталог,
   а клик по плитке открывает books/nativity/reader.html напрямую. */
window.BOOKS = window.BOOKS || {};
window.BOOKS["nativity"] = {
  title: "История Рождества",
  emoji: "⭐",
  accent: "sky",
  cover: "cover",
  ext: "webp",
  badge: "7 языков",
  series: "",
  folder: "bible",
  order: 8.8,
  ready: true,
  engine: "external"
};
