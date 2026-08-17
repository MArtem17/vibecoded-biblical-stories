/* Витринная карточка для таба «Книги».
   Сама книга — самодостаточный мультиязычный ридер (reader.html + book_data.js),
   движок у неё свой (переключатель RU/EN/DE), не платформенный core/engines/book.
   Поэтому engine:"external": сборщик добавит обложку в каталог, а клик по плитке
   открывает books/moses/reader.html напрямую (см. диспетчер в корневом index.html).
   Картинки страниц лежат как img/page_NN.webp, поэтому в общий book.js-формат
   (NN.webp + pages) она не вписывается — и не должна. */
window.BOOKS = window.BOOKS || {};
window.BOOKS["moses"] = {
  title: "История Моисея",
  emoji: "📜",
  accent: "teal",
  cover: "cover",
  ext: "webp",
  badge: "RU·EN·DE",
  series: "",
  folder: "bible",
  order: 8.5,
  ready: true,
  engine: "external"
};
