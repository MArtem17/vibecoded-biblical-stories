/* UI-словарь оболочки «Библейские истории» + покраска data-i18n. */
(function (root) {
  "use strict";
  var LKEY = "bibi_lang";
  var LANGS = ["ru", "en", "de", "es", "pt", "fr", "ar"];

  function t(ru, en, de, es, pt, fr, ar) {
    return { ru: ru, en: en, de: de, es: es, pt: pt, fr: fr, ar: ar };
  }

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

  function fill(str, vars) {
    if (!vars) return str;
    return String(str).replace(/\{(\w+)\}/g, function (_, k) {
      var v = vars[k];
      if (v == null) return "";
      if (typeof v === "object") return L(v);
      return v;
    });
  }

  var UI = {
    brand: t("Библейские истории", "Bible Stories", "Bibelgeschichten", "Historias Bíblicas", "Histórias Bíblicas", "Histoires de la Bible", "قصص الكتاب المقدس"),
    splashTitle: t("Великие истории Библии — для маленьких исследователей", "Great Bible stories — for little explorers", "Große Bibelgeschichten — für kleine Entdecker", "Grandes historias de la Biblia — para pequeños exploradores", "Grandes histórias da Bíblia — para pequenos exploradores", "Les grandes histoires de la Bible — pour les petits explorateurs", "قصص الكتاب المقدس العظيمة — للمستكشفين الصغار"),
    splashLead: t("Лента эпох, альбом карт, книги и стройки", "Era feed, card album, books and builders", "Epochen-Feed, Kartenalbum, Bücher und Bauen", "Feed de épocas, álbum de cartas, libros y construcciones", "Feed de eras, álbum de cartas, livros e construções", "Fil des époques, album de cartes, livres et constructions", "شريط الحقب وألبوم البطاقات والكتب والبناء"),
    goFeed: t("В путь", "Journey", "Aufbrechen", "En camino", "A caminho", "En route", "في الطريق"),
    cards: t("Карты", "Cards", "Karten", "Cartas", "Cartas", "Cartes", "البطاقات"),
    books: t("Книги", "Books", "Bücher", "Libros", "Livros", "Livres", "الكتب"),
    build: t("Стройка", "Builder", "Bauen", "Construcción", "Construção", "Construction", "البناء"),
    games: t("Игры", "Games", "Spiele", "Juegos", "Jogos", "Jeux", "الألعاب"),
    gamesPick: t("Выбери мини-игру", "Pick a mini-game", "Wähl ein Minispiel", "Elige un minijuego", "Escolhe um minijogo", "Choisis un mini-jeu", "اختر لعبة صغيرة"),
    glossary: t("Словарик", "Glossary", "Wörterbuch", "Glosario", "Glossário", "Dico", "القاموس"),
    parents: t("Родителям", "Parents", "Eltern", "Padres", "Pais", "Parents", "للأهل"),
    sections: t("Разделы", "Sections", "Bereiche", "Secciones", "Secções", "Sections", "الأقسام"),
    settings: t("Настройки", "Settings", "Einstellungen", "Ajustes", "Definições", "Réglages", "الإعدادات"),
    language: t("Язык", "Language", "Sprache", "Idioma", "Idioma", "Langue", "اللغة"),
    theme: t("Тема", "Theme", "Design", "Tema", "Tema", "Thème", "المظهر"),
    themeLight: t("Светлая", "Light", "Hell", "Clara", "Clara", "Claire", "فاتح"),
    themeDark: t("Тёмная", "Dark", "Dunkel", "Oscura", "Escura", "Sombre", "داكن"),
    menu: t("← Меню", "← Menu", "← Menü", "← Menú", "← Menu", "← Menu", "← القائمة"),
    hub: t("Альбом", "Album", "Album", "Álbum", "Álbum", "Album", "الألبوم"),
    hubLook: t("Карты, книги, стройка и словарик", "Cards, books, builder and glossary", "Karten, Bücher, Bauen und Wörterbuch", "Cartas, libros, construcción y glosario", "Cartas, livros, construção e glossário", "Cartes, livres, construction et dico", "البطاقات والكتب والبناء والقاموس"),
    sub: t("Библия: великие истории", "The Bible: Great Stories", "Die Bibel: große Geschichten", "La Biblia: grandes historias", "Bíblia: grandes histórias", "La Bible : grandes histoires", "الكتاب المقدس: قصص عظيمة"),
    parentSheetSub: t("Успехи ребёнка и настройки", "Your child's progress and settings", "Fortschritt des Kindes und Einstellungen", "Logros del niño y ajustes", "Progresso da criança e definições", "Progrès de l’enfant et réglages", "تقدم الطفل والإعدادات"),
    parentAdult: t("Раздел для взрослых", "Adults only", "Nur für Erwachsene", "Solo adultos", "Apenas adultos", "Réservé aux adultes", "للبالغين فقط"),
    parentOpen: t("Открыть", "Open", "Öffnen", "Abrir", "Abrir", "Ouvrir", "فتح"),
    parentWrong: t("Неверно, попробуй ещё", "Incorrect, try again", "Falsch, nochmal versuchen", "Incorrecto, inténtalo de nuevo", "Errado, tenta outra vez", "Incorrect, réessaie", "خطأ، حاول مرة أخرى"),
    stats: t("Статистика", "Stats", "Statistik", "Estadísticas", "Estatísticas", "Statistiques", "إحصاءات"),
    stars: t("Звёзды", "Stars", "Sterne", "Estrellas", "Estrelas", "Étoiles", "نجوم"),
    cardsCollected: t("Карт собрано", "Cards collected", "Karten gesammelt", "Cartas conseguidas", "Cartas coletadas", "Cartes obtenues", "البطاقات المجموعة"),
    openHub: t("Открыть альбом", "Open album", "Album öffnen", "Abrir álbum", "Abrir álbum", "Ouvrir l’album", "فتح الألبوم"),
    openHubSub: t("Карты, книги и стройки", "Cards, books and builders", "Karten, Bücher und Bauen", "Cartas, libros y construcciones", "Cartas, livros e construções", "Cartes, livres et constructions", "البطاقات والكتب والبناء"),
    contFeed: t("Продолжить путь", "Continue journey", "Reise fortsetzen", "Seguir el camino", "Continuar a jornada", "Continuer le voyage", "متابعة الطريق"),
    contFeedSub: t("Вернуться в ленту эпох", "Back to the era feed", "Zurück zum Epochen-Feed", "Volver al feed de épocas", "Voltar ao feed de eras", "Retour au fil des époques", "العودة إلى شريط الحقب"),
    gateNeed: t("Чтобы войти, реши пример", "Solve this to enter", "Löse die Aufgabe, um einzutreten", "Resuelve el ejemplo para entrar", "Resolve o exemplo para entrar", "Résous l’exemple pour entrer", "حلّ المثال للدخول"),
    gateAns: t("Ответ", "Answer", "Antwort", "Respuesta", "Resposta", "Réponse", "الإجابة"),
    close: t("Закрыть", "Close", "Schließen", "Cerrar", "Fechar", "Fermer", "إغلاق"),
    backShort: t("Назад", "Back", "Zurück", "Atrás", "Voltar", "Retour", "رجوع"),
    check: t("Проверка", "Quiz", "Check", "Prueba", "Verificação", "Quiz", "اختبار"),
    true: t("Правда", "True", "Wahr", "Verdadero", "Verdade", "Vrai", "صحيح"),
    false: t("Неправда", "False", "Falsch", "Falso", "Falso", "Faux", "خطأ"),
    titleFeed: t("В путь · Библейские истории", "Journey · Bible Stories", "Reise · Bibelgeschichten", "Viaje · Historias Bíblicas", "Jornada · Histórias Bíblicas", "Voyage · Histoires de la Bible", "في الطريق · قصص الكتاب المقدس"),
    titleHub: t("Альбом · Библейские истории", "Album · Bible Stories", "Album · Bibelgeschichten", "Álbum · Historias Bíblicas", "Álbum · Histórias Bíblicas", "Album · Histoires de la Bible", "الألبوم · قصص الكتاب المقدس"),
    titleBook: t("Книга · Библейские истории", "Book · Bible Stories", "Buch · Bibelgeschichten", "Libro · Historias Bíblicas", "Livro · Histórias Bíblicas", "Livre · Histoires de la Bible", "الكتاب · قصص الكتاب المقدس"),
    titleGames: t("Игры · Библейские истории", "Games · Bible Stories", "Spiele · Bibelgeschichten", "Juegos · Historias Bíblicas", "Jogos · Histórias Bíblicas", "Jeux · Histoires de la Bible", "الألعاب · قصص الكتاب المقدس"),
    encyclopediaTitle: t("Энциклопедия", "Encyclopedia", "Enzyklopädie", "Enciclopedia", "Enciclopédia", "Encyclopédie", "الموسوعة"),
    readToMe: t("Прочти мне", "Read to me", "Lies mir vor", "Léeme", "Lê-me", "Lis-moi", "اقرأ لي"),
    pageAria: t("Страница", "Page", "Seite", "Página", "Página", "Page", "صفحة"),
    knowledgeMap: t("Карта знаний", "Knowledge map", "Wissenskarte", "Mapa de conocimiento", "Mapa de conhecimento", "Carte des connaissances", "خريطة المعرفة"),
    pathMap: t("Карта пути", "Path map", "Pfadkarte", "Mapa del camino", "Mapa do caminho", "Carte du chemin", "خريطة المسار"),
    next: t("Далее", "Next", "Weiter", "Siguiente", "Seguinte", "Suivant", "التالي"),
    nextAria: t("Дальше", "Next", "Weiter", "Siguiente", "Seguir", "Suivant", "التالي"),
    swipeHint: t("листай вверх", "swipe up", "nach oben wischen", "desliza hacia arriba", "desliza para cima", "glisse vers le haut", "اسحب لأعلى"),
    alreadyDone: t("Уже отвечено · свайп ↑ дальше", "Already answered · swipe ↑ next", "Schon beantwortet · wischen ↑ weiter", "Ya respondido · desliza ↑", "Já respondido · desliza ↑", "Déjà répondu · glisse ↑", "تمت الإجابة · اسحب ↑"),
    okSwipe: t("Верно! · свайп ↑ дальше", "Correct! · swipe ↑ next", "Richtig! · wischen ↑ weiter", "¡Correcto! · desliza ↑", "Certo! · desliza ↑", "Juste ! · glisse ↑", "صحيح! · اسحب ↑"),
    badSwipe: t("Неверно · запомни ответ · свайп ↑ дальше", "Wrong · remember it · swipe ↑ next", "Falsch · merke dir die Antwort · wischen ↑", "Incorrecto · recuérdalo · desliza ↑", "Errado · lembra a resposta · desliza ↑", "Faux · retiens la réponse · glisse ↑", "خطأ · تذكّر الجواب · اسحب ↑"),
    tapToLearn: t("Нажми — узнай", "Tap to find out", "Tippen — erfahren", "Toca para saber", "Toca para saber", "Appuie pour savoir", "اضغط لتعرف"),
    spotOne: t("Нажمي окошко — секрет", "Tap the window — a secret", "Tippe das Fenster — ein Geheimnis", "Toca la ventana — un secreto", "Toca na janela — um segredo", "Appuie sur la fenêtre — un secret", "اضغط النافذة — سر"),
    spotMany: t("Нажми окошки — узнай секреты · {found}/{total}", "Tap the windows — secrets · {found}/{total}", "Tippe die Fenster — Geheimnisse · {found}/{total}", "Toca las ventanas — secretos · {found}/{total}", "Toca nas janelas — segredos · {found}/{total}", "Appuie sur les fenêtres — secrets · {found}/{total}", "اضغط النوافذ — أسرار · {found}/{total}"),
    rankMore: t("ещё {n} до «{name}»", "{n} more to “{name}”", "noch {n} bis „{name}“", "aún {n} para «{name}»", "ainda {n} até «{name}»", "encore {n} vers « {name} »", "بعد {n} حتى «{name}»"),
    rankTop: t("высший ранг!", "top rank!", "höchster Rang!", "¡rango máximo!", "rank máximo!", "rang suprême !", "أعلى رتبة!"),
    caughtN: t("Поймано: {got} из {need}", "Caught: {got} of {need}", "Gefangen: {got} von {need}", "Atrapados: {got} de {need}", "Apanhados: {got} de {need}", "Attrapés : {got} sur {need}", "أُمسك: {got} من {need}"),
    soundOn: t("Звук включён", "Sound on", "Ton an", "Sonido activado", "Som ligado", "Son activé", "الصوت تشغيل"),
    soundOff: t("Звук выключен", "Sound off", "Ton aus", "Sonido desactivado", "Som desligado", "Son coupé", "الصوت إيقاف"),
    stampPassport: t("Штамп в паспорт!", "Passport stamp!", "Stempel in den Pass!", "¡Sello en el pasaporte!", "Carimbo no passaporte!", "Tampon dans le passeport !", "ختم في الجواز!"),
    reviewRibbon: t("⟳ Повторим!", "⟳ Let's review!", "⟳ Nochmal!", "⟳ ¡Repasemos!", "⟳ Vamos rever!", "⟳ On révise !", "⟳ لنراجع!"),
    orderDone: t("Всё по порядку!", "All in order!", "Alles der Reihe nach!", "¡Todo en orden!", "Tudo em ordem!", "Tout dans l’ordre !", "كل شيء بالترتيب!"),
    stampsOf: t("из {n} штампов", "of {n} stamps", "von {n} Stempeln", "de {n} sellos", "de {n} carimbos", "sur {n} tampons", "من {n} أختام"),
    before: t("До", "Before", "Vorher", "Antes", "Antes", "Avant", "قبل"),
    after: t("После", "After", "Nachher", "Después", "Depois", "Après", "بعد"),
    count1: t("Один!", "One!", "Eins!", "¡Uno!", "Um!", "Un !", "واحد!"),
    count2: t("Два!", "Two!", "Zwei!", "¡Dos!", "Dois!", "Deux !", "اثنان!"),
    count3: t("Три!", "Three!", "Drei!", "¡Tres!", "Três!", "Trois !", "ثلاثة!"),
    count4: t("Четыре!", "Four!", "Vier!", "¡Cuatro!", "Quatro!", "Quatre !", "أربعة!"),
    count5: t("Пять!", "Five!", "Fünf!", "¡Cinco!", "Cinco!", "Cinq !", "خمسة!"),
    count6: t("Шесть!", "Six!", "Sechs!", "¡Seis!", "Seis!", "Six !", "ستة!"),
    count7: t("Семь!", "Seven!", "Sieben!", "¡Siete!", "Sete!", "Sept !", "سبعة!"),
    count8: t("Восемь!", "Eight!", "Acht!", "¡Ocho!", "Oito!", "Huit !", "ثمانية!"),
    count9: t("Девять!", "Nine!", "Neun!", "¡Nueve!", "Nove!", "Neuf !", "تسعة!"),
    count10: t("Десять!", "Ten!", "Zehn!", "¡Diez!", "Dez!", "Dix !", "عشرة!"),
    chainDone: t("📖→✨→👑 Цепочка готова!", "📖→✨→👑 Chain complete!", "📖→✨→👑 Kette fertig!", "📖→✨→👑 ¡Cadena lista!", "📖→✨→👑 Cadeia pronta!", "📖→✨→👑 Chaîne complète !", "📖→✨→👑 اكتملت السلسلة!"),
    shadowDino: t("Перетащи каждого героя на его тень.", "Drag each hero onto their shadow.", "Zieh jeden Helden auf seinen Schatten.", "Arrastra cada héroe a su sombra.", "Arrasta cada herói para a sua sombra.", "Fais glisser chaque héros sur son ombre.", "اسحب كل بطل إلى ظله."),
    shadowDinoHard: t("Узнай героя по картинке и перетащи его на тень. Нажми на фото — увидишь крупнее.", "Recognise the hero and drag them onto the shadow. Tap a picture to see it bigger.", "Erkenne den Helden und zieh ihn auf den Schatten. Tippe auf ein Bild, um es größer zu sehen.", "Reconoce al héroe y arrástralo a su sombra. Toca una foto para verla más grande.", "Reconhece o herói e arrasta-o para a sombra. Toca numa foto para a veres maior.", "Reconnais le héros et fais-le glisser sur son ombre. Appuie sur la photo pour l’agrandir.", "تعرّف على البطل من الصورة واسحبه إلى ظله. اضغط على الصورة لتراها أكبر."),
    unitGen: t("историй", "stories", "Geschichten", "historias", "histórias", "histoires", "قصص"),
    newSpecies: t("Новая история!", "New story!", "Neue Geschichte!", "¡Nueva historia!", "Nova história!", "Nouvelle histoire !", "قصة جديدة!"),
    centerBirds: t("БИБЛИЯ", "BIBLE", "BIBEL", "BIBLIA", "BÍBLIA", "BIBLE", "الكتاب المقدس"),
    mapNoun: t("карте", "map", "Karte", "mapa", "mapa", "carte", "خريطة"),
    chapWord: t("Глава", "Chapter", "Kapitel", "Capítulo", "Capítulo", "Chapitre", "فصل"),
    ofWord: t("из", "of", "von", "de", "de", "sur", "من"),
    inWord: t("в", "in the", "in der", "en el", "no", "dans la", "في"),
    knowledgeWord: t("знаний", "of knowledge", "des Wissens", "del saber", "do saber", "du savoir", "المعرفة"),
    tfTitle: t("Правда или нет?", "True or not?", "Wahr oder nicht?", "¿Verdad o no?", "Verdade ou não?", "Vrai ou pas ?", "صحيح أم لا؟"),
    tfYes: t("Правда", "True", "Wahr", "Verdad", "Verdade", "Vrai", "صحيح"),
    tfNo: t("Неправда", "Not true", "Nicht wahr", "Falso", "Falso", "Faux", "خطأ"),
    tfTrue: t("Это правда!", "It's true!", "Das stimmt!", "¡Es verdad!", "É verdade!", "C’est vrai !", "هذا صحيح!"),
    tfFalse: t("На самом деле — нет.", "Actually, no.", "Eigentlich nein.", "En realidad, no.", "Na verdade, não.", "En fait, non.", "في الحقيقة — لا."),
    goneTitle: t("Что пропало?", "What's missing?", "Was fehlt?", "¿Qué falta?", "O que falta?", "Qu’est-ce qui manque ?", "ما الذي اختفى؟"),
    goneSub1: t("Запомни, что здесь есть…", "Remember what's here…", "Merk dir, was hier ist…", "Recuerda lo que hay…", "Lembra o que está aqui…", "Retiens ce qu’il y a ici…", "تذكّر ما هنا…"),
    goneSub2: t("Что пропало? Нажми ответ!", "What's missing? Press the answer!", "Was fehlt? Tippe die Antwort!", "¿Qué falta? ¡Toca la respuesta!", "O que falta? Toca na resposta!", "Qu’est-ce qui manque ? Appuie sur la réponse !", "ما الذي اختفى؟ اضغط الجواب!"),
    goneOk: t("Верно! ", "Right! ", "Richtig! ", "¡Correcto! ", "Certo! ", "Juste ! ", "صحيح! "),
    goneMiss: t("Пропал: ", "Missing: ", "Gefehlt hat: ", "Faltaba: ", "Faltava: ", "Manquait : ", "اختفى: "),
    matchDone: t("Готово! Всё собрано", "Done! All in place", "Fertig! Alles am Platz", "¡Listo! Todo en su sitio", "Pronto! Tudo no sítio", "Terminé ! Tout est en place", "تم! اكتمل الجمع"),
    findDone: t("Молодец! Всё нашёл", "Well done! Found them all", "Super! Alles gefunden", "¡Bien! Lo encontraste todo", "Muito bem! Encontraste tudo", "Bravo ! Tu as tout trouvé", "أحسنت! وجدت الكل"),
    countDone: t("Всего", "That makes", "Zusammen", "En total", "No total", "En tout", "المجموع"),
    praiseWord: t("Молодец!", "Well done!", "Super!", "¡Bien hecho!", "Muito bem!", "Bravo !", "أحسنت!"),
    catchDone: t("Молодец! Всё поймал!", "Well done! Caught them all!", "Super! Alle gefangen!", "¡Bien! ¡Los atrapaste todos!", "Muito bem! Apanhaste todos!", "Bravo ! Tu as tout attrapé !", "أحسنت! أمسكت الكل!"),
    lantDone: t("Нашёл! Молодец!", "Found it! Well done!", "Gefunden! Super!", "¡Encontrado! ¡Bien!", "Encontraste! Muito bem!", "Trouvé ! Bravo !", "وجدته! أحسنت!"),
    newRank: t("Новый ранг!", "New rank!", "Neuer Rang!", "¡Nuevo rango!", "Novo rank!", "Nouveau rang !", "رتبة جديدة!"),
    scnt: t("Найдено", "Found", "Gefunden", "Encontrados", "Encontrados", "Trouvés", "وُجد"),
    sall: t("Все секреты открыты! Листай дальше ↑", "All secrets open! Swipe on ↑", "Alle Geheimnisse offen! Wische weiter ↑", "¡Todos los secretos! Desliza ↑", "Todos os segredos! Desliza ↑", "Tous les secrets ! Glisse ↑", "فُتحت كل الأسرار! اسحب ↑"),
    veilHint: t("Нажми, чтобы узнать", "Press to find out", "Tippen zum Entdecken", "Toca para saber", "Toca para saber", "Appuie pour savoir", "اضغط لتعرف"),
    veilNext: t("Листай дальше ↑", "Swipe on ↑", "Weiter wischen ↑", "Desliza ↑", "Desliza ↑", "Glisse ↑", "اسحب ↑"),
    langLabel: t("Язык энциклопедии", "Encyclopedia language", "Sprache der Enzyklopädie", "Idioma de la enciclopedia", "Idioma da enciclopédia", "Langue de l’encyclopédie", "لغة الموسوعة"),
    settingsHead: t("Настройки", "Settings", "Einstellungen", "Ajustes", "Definições", "Réglages", "الإعدادات"),
    dailyDay: t("День", "Day", "Tag", "Día", "Dia", "Jour", "يوم"),
    dailyRow: t("подряд!", "in a row!", "in Folge!", "¡seguidos!", "seguidos!", "d’affilée !", "متتالية!"),
    dailyOne: t("— начало серии!", "— a new streak begins!", "— eine Serie beginnt!", "— ¡empieza la racha!", "— começa a sequência!", "— une série commence !", "— بداية سلسلة!"),
    dailyTitle: t("Карточка дня", "Card of the Day", "Karte des Tages", "Carta del día", "Carta do dia", "Carte du jour", "بطاقة اليوم"),
    dailyRev: t("Помнишь его? Загляни ещё раз!", "Remember this one? Take another look!", "Erinnerst du dich? Schau nochmal!", "¿Lo recuerdas? ¡Mira otra vez!", "Lembraste? Olha outra vez!", "Tu t’en souviens ? Regarde encore !", "أتذكره؟ انظر مرة أخرى!"),
    dailyNew: t("Сегодня тебя ждёт новое знакомство!", "A new friend is waiting for you today!", "Heute wartet ein neuer Freund!", "¡Hoy te espera un nuevo amigo!", "Hoje espera-te um novo amigo!", "Un nouvel ami t’attend aujourd’hui !", "اليوم ينتظرك تعارف جديد!"),
    dailyGo: t("Смотреть", "Show me", "Ansehen", "Ver", "Ver", "Voir", "شاهد"),
    dailyLater: t("Позже", "Later", "Später", "Luego", "Depois", "Plus tard", "لاحقًا"),
    mapH1: t("Большой путь по Библии", "The Great Journey Through the Bible", "Die große Reise durch die Bibel", "El gran viaje por la Biblia", "A grande viagem pela Bíblia", "Le grand voyage dans la Bible", "الطريق الكبير في الكتاب المقدس"),
    mapSub: t("Нажми любую главу — и лента откроется с её начала. Ты сейчас на подсвеченной.", "Tap any chapter — the feed opens at its start. You are at the highlighted one.", "Tippe ein Kapitel — die Timeline startet dort. Du bist am markierten.", "Toca cualquier capítulo — el feed se abre al inicio. Estás en el resaltado.", "Toca qualquer capítulo — o feed abre no início. Estás no destacado.", "Appuie sur un chapitre — le fil s’ouvre au début. Tu es sur celui en surbrillance.", "اضغط أي فصل — يفتح الشريط من بدايته. أنت عند المضاء."),
    parentH1: t("Карта знаний наполняется", "The knowledge map is filling up", "Die Wissenskarte füllt sich", "El mapa de conocimiento se llena", "O mapa de conhecimento enche-se", "La carte des connaissances se remplit", "خريطة المعرفة تمتلئ"),
    parentSub: t("Что ребёнок уже узнал — по эпохам Библии", "What your child has learned — by Bible eras", "Was das Kind schon gelernt hat — nach Bibel-Epochen", "Lo que el niño ya aprendió — por épocas de la Biblia", "O que a criança já aprendeu — por eras da Bíblia", "Ce que l’enfant a déjà appris — par époques de la Bible", "ما تعلّمه الطفل — حسب حقب الكتاب المقدس"),
    bktTitle: t("Граф знаний (BKT)", "Knowledge graph (BKT)", "Wissensgraph (BKT)", "Grafo de conocimiento (BKT)", "Grafo de conhecimento (BKT)", "Graphe de connaissances (BKT)", "رسم المعرفة (BKT)"),
    progress: t("Прогресс", "Progress", "Fortschritt", "Progreso", "Progresso", "Progression", "التقدّم"),
    resetFeed: t("Сбросить позицию ленты", "Reset feed position", "Timeline-Position zurücksetzen", "Reiniciar posición del feed", "Repor posição do feed", "Réinitialiser la position du fil", "إعادة موضع الشريط"),
    resetBkt: t("Сбросить знания BKT", "Reset BKT knowledge", "BKT-Wissen zurücksetzen", "Reiniciar conocimiento BKT", "Repor conhecimento BKT", "Réinitialiser les connaissances BKT", "إعادة معرفة BKT"),
    resetNote: t("Сброс ленты не трогает звёзды и BKT — как в «Странах мира».", "Resetting the feed keeps stars and BKT — like in Countries.", "Timeline-Reset lässt Sterne und BKT unberührt — wie bei Ländern.", "Reiniciar el feed no toca estrellas ni BKT — como en Países.", "Repor o feed não altera estrelas nem BKT — como em Países.", "Réinitialiser le fil ne touche ni étoiles ni BKT — comme dans Pays.", "إعادة الشريط لا تمس النجوم وBKT — كما في «بلدان العالم»."),
    resetFeedQ: t("Сбросить позицию ленты? Звёзды и знания BKT сохранятся.", "Reset feed position? Stars and BKT stay.", "Timeline-Position zurücksetzen? Sterne und BKT bleiben.", "¿Reiniciar posición del feed? Estrellas y BKT se conservan.", "Repor posição do feed? Estrelas e BKT mantêm-se.", "Réinitialiser la position du fil ? Étoiles et BKT conservés.", "إعادة موضع الشريط؟ النجوم وBKT تبقى."),
    resetBktQ: t("Сбросить знания BKT и «изученные» истории?", "Reset BKT knowledge and learned stories?", "BKT-Wissen und gelernte Geschichten zurücksetzen?", "¿Reiniciar BKT e historias aprendidas?", "Repor BKT e histórias aprendidas?", "Réinitialiser BKT et histoires apprises ?", "إعادة BKT والقصص المتعلّمة؟"),
    worldKnow: t("Знание библейских историй", "Bible-story knowledge", "Bibelgeschichten-Wissen", "Conocimiento de historias bíblicas", "Conhecimento das histórias bíblicas", "Connaissance des histoires bibliques", "معرفة قصص الكتاب المقدس"),
    bktNote: t("Серый — ещё не спрашивали. Тёплый → зелёный — растёт мастерство (BKT).", "Grey — not asked yet. Warm → green — mastery grows (BKT).", "Grau — noch nicht gefragt. Warm → grün — Können wächst (BKT).", "Gris — aún no preguntado. Cálido → verde — crece el dominio (BKT).", "Cinzento — ainda não perguntado. Quente → verde — sobe o domínio (BKT).", "Gris — pas encore demandé. Chaud → vert — la maîtrise grandit (BKT).", "رمادي — لم يُسأل بعد. دافئ ← أخضر — تنمو المهارة (BKT)."),
    starsLine: t("Звёзды: {s}", "Stars: {s}", "Sterne: {s}", "Estrellas: {s}", "Estrelas: {s}", "Étoiles : {s}", "نجوم: {s}"),
    litLine: t("Историй изучено (BKT ≥ 60%): {n} / {t}", "Stories learned (BKT ≥ 60%): {n} / {t}", "Geschichten gelernt (BKT ≥ 60%): {n} / {t}", "Historias aprendidas (BKT ≥ 60%): {n} / {t}", "Histórias aprendidas (BKT ≥ 60%): {n} / {t}", "Histoires apprises (BKT ≥ 60 %) : {n} / {t}", "قصص تعلّمتها (BKT ≥ 60%): {n} / {t}"),
    feedPos: t("Позиция ленты: {a} / {b}", "Feed position: {a} / {b}", "Timeline-Position: {a} / {b}", "Posición del feed: {a} / {b}", "Posição do feed: {a} / {b}", "Position du fil : {a} / {b}", "موضع الشريط: {a} / {b}"),
    cardOf: t("Карточка {a} из {b}", "Card {a} of {b}", "Karte {a} von {b}", "Carta {a} de {b}", "Carta {a} de {b}", "Carte {a} sur {b}", "بطاقة {a} من {b}"),
    openGraph: t("Открыть карту знаний", "Open knowledge map", "Wissenskarte öffnen", "Abrir mapa de conocimiento", "Abrir mapa de conhecimento", "Ouvrir la carte des connaissances", "فتح خريطة المعرفة"),
    openGraphSub: t("Что уже загорелось в графе эпох", "What already lights up on the era graph", "Was im Epochen-Graph schon leuchtet", "Lo que ya brilla en el grafo de épocas", "O que já acende no grafo das eras", "Ce qui brille déjà sur le graphe des époques", "ما أضاء في رسم الحقب")
  };

  var FEED_UI_KEYS = ["chapWord", "ofWord", "tfTitle", "tfYes", "tfNo", "tfTrue", "tfFalse", "goneTitle", "goneSub1", "goneSub2", "goneOk", "goneMiss", "matchDone", "findDone", "countDone", "praiseWord", "catchDone", "lantDone", "newRank", "scnt", "sall", "veilHint", "veilNext", "langLabel", "settingsHead", "dailyDay", "dailyRow", "dailyOne", "dailyTitle", "dailyRev", "dailyNew", "dailyGo", "dailyLater", "swipeHint", "alreadyDone", "okSwipe", "badSwipe", "mapH1", "mapSub", "parentH1", "parentSub", "inWord", "knowledgeWord", "next", "nextAria"];

  var CORE_LEAKS = [
    { key: "chainDone", src: { ru: "🌿→🦕→🦖 Цепочка готова!", en: "🌿→🦕→🦖 Chain complete!", de: "🌿→🦕→🦖 Kette fertig!", es: "🌿→🦕→🦖 ¡Cadena lista!", pt: "🌿→🦕→🦖 Cadeia pronta!", fr: "🌿→🦕→🦖 Chaîne complète !", ar: "🌿→🦕→🦖 اكتملت السلسلة!" } },
    { key: "shadowDino", src: { ru: "Перетащи каждого динозавра на его тень.", en: "Drag each dinosaur onto its shadow.", de: "Zieh jeden Dinosaurier auf seinen Schatten.", es: "Arrastra cada dinosaurio a su sombra.", pt: "Arrasta cada dinossauro para a sua sombra.", fr: "Fais glisser chaque dinosaure sur son ombre.", ar: "اسحب كل ديناصور إلى ظله." } },
    { key: "shadowDinoHard", src: { ru: "Узнай динозавра по фото и перетащи его на его тень. Нажми на фото — увидишь крупнее.", en: "Recognise the dinosaur and drag it onto its shadow. Tap a photo to see it bigger.", de: "Erkenne den Dinosaurier und zieh ihn auf seinen Schatten. Tippe auf ein Foto, um es größer zu sehen.", es: "Reconoce al dinosaurio y arrástralo a su sombra. Toca una foto para verla más grande.", pt: "Reconhece o dinossauro e arrasta-o para a sua sombra. Toca numa foto para a veres maior.", fr: "Reconnais le dinosaure sur la photo et fais-le glisser sur son ombre. Appuie sur la photo — tu la verras en plus grand.", ar: "تعرّف على الديناصور من الصورة واسحبه إلى ظله. اضغط على الصورة لتراها أكبر." } }
  ];

  var RANKS = [
    t("Путник", "Wanderer", "Wanderer", "Caminante", "Viajante", "Voyageur", "مسافر"),
    t("Ученик", "Learner", "Schüler", "Alumno", "Aprendiz", "Élève", "تلميذ"),
    t("Знаток", "Expert", "Kenner", "Experto", "Entendido", "Expert", "خبير"),
    t("Мудрец", "Sage", "Weiser", "Sabio", "Sábio", "Sage", "حكيم"),
    t("Хранитель историй", "Story Keeper", "Geschichtenhüter", "Guardián de historias", "Guardião das histórias", "Gardien des histoires", "حارس القصص")
  ];

  var PRAISE = [
    t("Молодец!", "Well done!", "Super!", "¡Bien hecho!", "Muito bem!", "Bravo !", "أحسنت!"),
    t("Верно!", "Right!", "Richtig!", "¡Correcto!", "Certo!", "Juste !", "صحيح!"),
    t("Отлично!", "Great!", "Toll!", "¡Genial!", "Ótimo!", "Super !", "ممتاز!"),
    t("Умница!", "Clever you!", "Schlaumeier!", "¡Qué listo!", "Que esperto!", "Malin !", "ذكي!"),
    t("Здорово!", "Awesome!", "Prima!", "¡Fantástico!", "Fixe!", "Génial !", "رائع!"),
    t("Так держать!", "Keep it up!", "Weiter so!", "¡Sigue así!", "Continua!", "Continue !", "هكذا!")
  ];

  var CHEER = [
    t("Почти!", "Almost!", "Fast!", "¡Casi!", "Quase!", "Presque !", "قارب!"),
    t("Попробуй ещё!", "Try again!", "Noch einmal!", "¡Otra vez!", "Tenta outra vez!", "Réessaie !", "حاول مرة أخرى!"),
    t("Не сдавайся!", "Don't give up!", "Nicht aufgeben!", "¡No te rindas!", "Não desistas!", "N’abandonne pas !", "لا تستسلم!")
  ];

  function JT(key, vars) {
    return fill(L(UI[key]), vars || {});
  }

  function applyDir() {
    var lang = curLang();
    if (!document.documentElement) return;
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  }

  function paintShell() {
    applyDir();
    var titleKey = document.body && document.body.getAttribute("data-i18n-title");
    if (titleKey && UI[titleKey]) document.title = JT(titleKey);
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key || !UI[key]) return;
      var txt = JT(key);
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") el.placeholder = txt;
      else if (el.tagName === "TITLE") document.title = txt;
      else el.textContent = txt;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      if (key && UI[key]) el.innerHTML = JT(key);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (key && UI[key]) el.setAttribute("aria-label", JT(key));
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-title");
      if (key && UI[key]) el.setAttribute("title", JT(key));
    });
  }

  function feedUiBag() {
    var bag = {}, i, k;
    for (i = 0; i < FEED_UI_KEYS.length; i++) {
      k = FEED_UI_KEYS[i];
      if (UI[k]) bag[k] = UI[k];
    }
    return bag;
  }

  root.BibleI18n = {
    UI: UI,
    L: L,
    JT: JT,
    curLang: curLang,
    applyDir: applyDir,
    paintShell: paintShell,
    feedUiBag: feedUiBag,
    FEED_UI_KEYS: FEED_UI_KEYS,
    CORE_LEAKS: CORE_LEAKS,
    RANKS: RANKS,
    PRAISE: PRAISE,
    CHEER: CHEER,
    LANGS: LANGS,
    LKEY: LKEY
  };
})(typeof window !== "undefined" ? window : this);
