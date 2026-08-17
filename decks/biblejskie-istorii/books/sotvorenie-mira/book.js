/* Витринная карточка для таба «Книги».
   Книга на общем движке «Энциклопедия» (7 языков, караоке), свой reader.html —
   поэтому engine:"external": сборщик кладёт обложку в каталог, а клик по
   плитке открывает books/sotvorenie-mira/reader.html напрямую. */
window.BOOKS = window.BOOKS || {};
window.BOOKS["sotvorenie-mira"] = {
  title: "Сотворение мира",
  emoji: "🌍",
  accent: "sky",
  cover: "cover",
  ext: "webp",
  badge: "7 языков",
  series: "",
  folder: "bible",
  order: 8.4,
  ready: true,
  engine: "external"
};
