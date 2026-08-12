/* Витринная карточка для таба «Книги».
   Книга на общем движке «Энциклопедия» (караоке, 7 языков текста), свой
   reader.html — поэтому engine:"external": сборщик кладёт обложку в каталог,
   а клик по плитке открывает books/david/reader.html напрямую. */
window.BOOKS = window.BOOKS || {};
window.BOOKS["david"] = {
  title: "История Давида",
  emoji: "🎵",
  accent: "amber",
  cover: "cover",
  ext: "webp",
  badge: "7 языков",
  series: "",
  folder: "bible",
  order: 8.7,
  ready: true,
  engine: "external"
};
