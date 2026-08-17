/* Витринная карточка для таба «Книги».
   Книга на общем движке «Энциклопедия» (7 языков, караоке), у неё свой
   reader.html — поэтому engine:"external": сборщик кладёт обложку в каталог,
   а клик по плитке открывает books/noev-kovcheg/reader.html напрямую. */
window.BOOKS = window.BOOKS || {};
window.BOOKS["noev-kovcheg"] = {
  title: "Ноев ковчег",
  emoji: "🌈",
  accent: "lime",
  cover: "cover",
  ext: "webp",
  badge: "7 языков",
  series: "",
  folder: "bible",
  order: 8.6,
  ready: true,
  engine: "external"
};
