/* UI-словарь оболочки «Библейские истории» + покраска data-i18n. */
(function (root) {
  "use strict";
  var LKEY = "bibi_lang";
  var LANGS = ["ru", "en", "de", "es", "pt", "fr", "ar"];

  function curLang() {
    if (root.BibleApp && typeof root.BibleApp.getLang === "function") {
      var g = root.BibleApp.getLang();
      if (LANGS.indexOf(g) >= 0) return g;
    }
    try {
      var s = localStorage.getItem(LKEY);
      if (LANGS.indexOf(s) >= 0) return s;
    } catch (e) {}
    return "ru";
  }

  function L(o) {
    if (o == null) return "";
    if (typeof o === "string") return o;
    var lang = curLang();
    return o[lang] || o.ru || o.en || "";
  }

  var UI = {
    brand: { ru: "Библейские истории", en: "Bible Stories", de: "Bibelgeschichten", es: "Historias Bíblicas", pt: "Histórias Bíblicas", fr: "Histoires de la Bible", ar: "قصص الكتاب المقدس" },
    splashTitle: { ru: "Великие истории Библии — для маленьких исследователей", en: "Great Bible stories — for little explorers", de: "Große Bibelgeschichten — für kleine Entdecker", es: "Grandes historias de la Biblia — para pequeños exploradores", pt: "Grandes histórias da Bíblia — para pequenos exploradores", fr: "Les grandes histoires de la Bible — pour les petits explorateurs", ar: "قصص الكتاب المقدس العظيمة — للمستكشفين الصغار" },
    splashLead: { ru: "Лента эпох, альбом карт, книги и стройки", en: "Era feed, card album, books and builders", de: "Epochen-Feed, Kartenalbum, Bücher und Bauen", es: "Feed de épocas, álbum de cartas, libros y construcciones", pt: "Feed de eras, álbum de cartas, livros e construções", fr: "Fil des époques, album de cartes, livres et constructions", ar: "شريط الحقب وألبوم البطاقات والكتب والبناء" },
    goFeed: { ru: "В путь", en: "Journey", de: "Aufbrechen", es: "En camino", pt: "A caminho", fr: "En route", ar: "في الطريق" },
    cards: { ru: "Карты", en: "Cards", de: "Karten", es: "Cartas", pt: "Cartas", fr: "Cartes", ar: "البطاقات" },
    books: { ru: "Книги", en: "Books", de: "Bücher", es: "Libros", pt: "Livros", fr: "Livres", ar: "الكتب" },
    build: { ru: "Стройка", en: "Builder", de: "Bauen", es: "Construcción", pt: "Construção", fr: "Construction", ar: "البناء" },
    games: { ru: "Игры", en: "Games", de: "Spiele", es: "Juegos", pt: "Jogos", fr: "Jeux", ar: "الألعاب" },
    gamesPick: { ru: "Выбери мини-игру", en: "Pick a mini-game", de: "Wähl ein Minispiel", es: "Elige un minijuego", pt: "Escolhe um minijogo", fr: "Choisis un mini-jeu", ar: "اختر لعبة صغيرة" },
    glossary: { ru: "Словарик", en: "Glossary", de: "Wörterbuch", es: "Glosario", pt: "Glossário", fr: "Dico", ar: "القاموس" },
    parents: { ru: "Родителям", en: "Parents", de: "Eltern", es: "Padres", pt: "Pais", fr: "Parents", ar: "للأهل" },
    sections: { ru: "Разделы", en: "Sections", de: "Bereiche", es: "Secciones", pt: "Secções", fr: "Sections", ar: "الأقسام" },
    settings: { ru: "Настройки", en: "Settings", de: "Einstellungen", es: "Ajustes", pt: "Definições", fr: "Réglages", ar: "الإعدادات" },
    language: { ru: "Язык", en: "Language", de: "Sprache", es: "Idioma", pt: "Idioma", fr: "Langue", ar: "اللغة" },
    theme: { ru: "Тема", en: "Theme", de: "Design", es: "Tema", pt: "Tema", fr: "Thème", ar: "المظهر" },
    themeLight: { ru: "Светлая", en: "Light", de: "Hell", es: "Clara", pt: "Clara", fr: "Claire", ar: "فاتح" },
    themeDark: { ru: "Тёмная", en: "Dark", de: "Dunkel", es: "Oscura", pt: "Escura", fr: "Sombre", ar: "داكن" },
    menu: { ru: "← Меню", en: "← Menu", de: "← Menü", es: "← Menú", pt: "← Menu", fr: "← Menu", ar: "← القائمة" },
    hub: { ru: "Альбом", en: "Album", de: "Album", es: "Álbum", pt: "Álbum", fr: "Album", ar: "الألبوم" },
    hubLook: { ru: "Карты, книги, стройка и словарик", en: "Cards, books, builder and glossary", de: "Karten, Bücher, Bauen und Wörterbuch", es: "Cartas, libros, construcción y glosario", pt: "Cartas, livros, construção e glossário", fr: "Cartes, livres, construction et dico", ar: "البطاقات والكتب والبناء والقاموس" },
    sub: { ru: "Библия: великие истории", en: "The Bible: Great Stories", de: "Die Bibel: große Geschichten", es: "La Biblia: grandes historias", pt: "Bíblia: grandes histórias", fr: "La Bible : grandes histoires", ar: "الكتاب المقدس: قصص عظيمة" },
    parentAdult: { ru: "Раздел для взрослых", en: "Adults only", de: "Nur für Erwachsene", es: "Solo adultos", pt: "Apenas adultos", fr: "Réservé aux adultes", ar: "للبالغين فقط" },
    parentOpen: { ru: "Открыть", en: "Open", de: "Öffnen", es: "Abrir", pt: "Abrir", fr: "Ouvrir", ar: "فتح" },
    parentWrong: { ru: "Неверно, попробуй ещё", en: "Incorrect, try again", de: "Falsch, nochmal versuchen", es: "Incorrecto, inténtalo de nuevo", pt: "Errado, tenta outra vez", fr: "Incorrect, réessaie", ar: "خطأ، حاول مرة أخرى" },
    stats: { ru: "Статистика", en: "Stats", de: "Statistik", es: "Estadísticas", pt: "Estatísticas", fr: "Statistiques", ar: "إحصاءات" },
    stars: { ru: "Звёзды", en: "Stars", de: "Sterne", es: "Estrellas", pt: "Estrelas", fr: "Étoiles", ar: "نجوم" },
    cardsCollected: { ru: "Карт собрано", en: "Cards collected", de: "Karten gesammelt", es: "Cartas conseguidas", pt: "Cartas coletadas", fr: "Cartes obtenues", ar: "البطاقات المجموعة" },
    openHub: { ru: "Открыть альбом", en: "Open album", de: "Album öffnen", es: "Abrir álbum", pt: "Abrir álbum", fr: "Ouvrir l’album", ar: "فتح الألبوم" },
    openHubSub: { ru: "Карты, книги и стройки", en: "Cards, books and builders", de: "Karten, Bücher und Bauen", es: "Cartas, libros y construcciones", pt: "Cartas, livros e construções", fr: "Cartes, livres et constructions", ar: "البطاقات والكتب والبناء" },
    contFeed: { ru: "Продолжить путь", en: "Continue journey", de: "Reise fortsetzen", es: "Seguir el camino", pt: "Continuar a jornada", fr: "Continuer le voyage", ar: "متابعة الطريق" },
    contFeedSub: { ru: "Вернуться в ленту эпох", en: "Back to the era feed", de: "Zurück zum Epochen-Feed", es: "Volver al feed de épocas", pt: "Voltar ao feed de eras", fr: "Retour au fil des époques", ar: "العودة إلى شريط الحقب" }
  };

  function paintShell() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (UI[key]) el.textContent = L(UI[key]);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (UI[key]) el.setAttribute("aria-label", L(UI[key]));
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-title");
      if (UI[key]) el.setAttribute("title", L(UI[key]));
    });
  }

  root.BibleI18n = { UI: UI, L: L, curLang: curLang, paintShell: paintShell, LANGS: LANGS };
})(window);
