/* Библейские истории (BST) — единый источник контента тома.
   Мультиязычные поля {ru,en,de,es,pt,fr,ar}; ru — мастер. Файл ПЕРЕГЕНЕРИРУЕТСЯ
   конвейером pipeline/apply_translations.js — руками правь ru-тексты и флаги,
   переводы гони через pipeline/translate_cards.py (см. README колоды).
   Схема — handoff §11, развёрнутая в JS: офлайн-приложение работает без fetch. */
window.BIBLE = {
 "volume_id": "bible_stories",
 "series": "my_first_big_encyclopedia",
 "title": {
  "ru": "Библейские истории",
  "en": "Bible Stories",
  "de": "Bibelgeschichten",
  "es": "Historias Bíblicas",
  "pt": "Histórias Bíblicas",
  "fr": "Histoires de la Bible",
  "ar": "قصص الكتاب المقدس"
 },
 "subtitle": {
  "ru": "Библия: великие истории",
  "en": "The Bible: Great Stories",
  "de": "Die Bibel: große Geschichten",
  "es": "La Biblia: grandes historias",
  "pt": "Bíblia: grandes histórias",
  "fr": "La Bible : grandes histoires",
  "ar": "الكتاب المقدس: قصص عظيمة"
 },
 "languages": [
  "ru",
  "en",
  "de",
  "es",
  "pt",
  "fr",
  "ar"
 ],
 "audioLangs": [
  "ru",
  "en"
 ],
 "ui": {
  "start": {
   "ru": "Играть ▶",
   "en": "Play ▶",
   "de": "Spielen ▶",
   "es": "Jugar ▶",
   "pt": "Jogar ▶",
   "fr": "Jouer ▶",
   "ar": "العب ◀"
  },
  "heroes": {
   "ru": "Герои",
   "en": "Heroes",
   "de": "Helden",
   "es": "Héroes",
   "pt": "Heróis",
   "fr": "Héros",
   "ar": "الأبطال"
  },
  "plots": {
   "ru": "Сюжеты",
   "en": "Stories",
   "de": "Geschichten",
   "es": "Historias",
   "pt": "Histórias",
   "fr": "Histoires",
   "ar": "القصص"
  },
  "books": {
   "ru": "Книги",
   "en": "Books",
   "de": "Bücher",
   "es": "Libros",
   "pt": "Livros",
   "fr": "Livres",
   "ar": "الكتب"
  },
  "games": {
   "ru": "Игры",
   "en": "Games",
   "de": "Spiele",
   "es": "Juegos",
   "pt": "Jogos",
   "fr": "Jeux",
   "ar": "الألعاب"
  },
  "gamesPick": {
   "ru": "Выбери мини-игру",
   "en": "Pick a mini-game",
   "de": "Wähl ein Minispiel",
   "es": "Elige un minijuego",
   "pt": "Escolhe um minijogo",
   "fr": "Choisis un mini-jeu",
   "ar": "اختر لعبة صغيرة"
  },
  "timeline": {
   "ru": "Лента",
   "en": "Timeline",
   "de": "Zeitleiste",
   "es": "Línea",
   "pt": "Linha",
   "fr": "Frise",
   "ar": "الزمن"
  },
  "glossary": {
   "ru": "Словарик",
   "en": "Glossary",
   "de": "Wörterbuch",
   "es": "Glosario",
   "pt": "Glossário",
   "fr": "Dico",
   "ar": "القاموس"
  },
  "back": {
   "ru": "Назад",
   "en": "Back",
   "de": "Zurück",
   "es": "Atrás",
   "pt": "Voltar",
   "fr": "Retour",
   "ar": "رجوع"
  },
  "flip": {
   "ru": "Переверни",
   "en": "Flip",
   "de": "Umdrehen",
   "es": "Gira",
   "pt": "Vira",
   "fr": "Retourne",
   "ar": "اقلب"
  },
  "listen": {
   "ru": "Слушать книгу",
   "en": "Listen to the book",
   "de": "Buch anhören",
   "es": "Escuchar el libro",
   "pt": "Ouvir o livro",
   "fr": "Écouter le livre",
   "ar": "استمع إلى الكتاب"
  },
  "findIt": {
   "ru": "Найди на карточке:",
   "en": "Find on the card:",
   "de": "Finde auf der Karte:",
   "es": "Busca en la carta:",
   "pt": "Encontra na carta:",
   "fr": "Trouve sur la carte :",
   "ar": "ابحث في البطاقة:"
  },
  "source": {
   "ru": "Источник",
   "en": "Source",
   "de": "Quelle",
   "es": "Fuente",
   "pt": "Fonte",
   "fr": "Source",
   "ar": "المصدر"
  },
  "soon": {
   "ru": "скоро",
   "en": "soon",
   "de": "bald",
   "es": "pronto",
   "pt": "em breve",
   "fr": "bientôt",
   "ar": "قريبًا"
  },
  "tapTile": {
   "ru": "Нажми на карточку",
   "en": "Tap a card",
   "de": "Tippe auf eine Karte",
   "es": "Toca una carta",
   "pt": "Toca numa carta",
   "fr": "Appuie sur une carte",
   "ar": "اضغط على بطاقة"
  },
  "again": {
   "ru": "Ещё раз",
   "en": "Again",
   "de": "Noch mal",
   "es": "Otra vez",
   "pt": "Outra vez",
   "fr": "Encore",
   "ar": "مرة أخرى"
  },
  "score": {
   "ru": "Счёт",
   "en": "Score",
   "de": "Punkte",
   "es": "Puntos",
   "pt": "Pontos",
   "fr": "Score",
   "ar": "النقاط"
  },
  "correct": {
   "ru": "Верно!",
   "en": "Correct!",
   "de": "Richtig!",
   "es": "¡Correcto!",
   "pt": "Certo!",
   "fr": "Bravo !",
   "ar": "صحيح!"
  },
  "wrong": {
   "ru": "Попробуй ещё",
   "en": "Try again",
   "de": "Versuch’s noch mal",
   "es": "Inténtalo otra vez",
   "pt": "Tenta outra vez",
   "fr": "Essaie encore",
   "ar": "حاول مجددًا"
  },
  "done": {
   "ru": "Молодец!",
   "en": "Well done!",
   "de": "Super!",
   "es": "¡Muy bien!",
   "pt": "Muito bem!",
   "fr": "Bravo !",
   "ar": "أحسنت!"
  },
  "gMemory": {
   "ru": "Мемори: герой и сюжет",
   "en": "Memory: hero & story",
   "de": "Memory: Held & Geschichte",
   "es": "Memoria: héroe e historia",
   "pt": "Memória: herói e história",
   "fr": "Mémory : héros et histoire",
   "ar": "الذاكرة: البطل والقصة"
  },
  "gMemoryHint": {
   "ru": "Открой две карточки: найди героя и его историю.",
   "en": "Open two cards: match the hero and their story.",
   "de": "Öffne zwei Karten: finde Held und Geschichte.",
   "es": "Abre dos cartas: une héroe e historia.",
   "pt": "Abre duas cartas: liga o herói à história.",
   "fr": "Ouvre deux cartes : associe le héros et son histoire.",
   "ar": "افتح بطاقتين: طابق البطل وقصته."
  },
  "gQuiz": {
   "ru": "Квиз",
   "en": "Quiz",
   "de": "Quiz",
   "es": "Quiz",
   "pt": "Quiz",
   "fr": "Quiz",
   "ar": "مسابقة"
  },
  "gQuizHint": {
   "ru": "Прочитай подсказку и нажми, кто это.",
   "en": "Read the clue and tap who it is.",
   "de": "Lies den Hinweis und tippe, wer das ist.",
   "es": "Lee la pista y toca quién es.",
   "pt": "Lê a pista e toca em quem é.",
   "fr": "Lis l’indice et appuie sur qui c’est.",
   "ar": "اقرأ التلميح واضغط على من يكون."
  },
  "gArtifact": {
   "ru": "Чья вещь?",
   "en": "Whose thing?",
   "de": "Wessen Ding?",
   "es": "¿De quién es?",
   "pt": "De quem é?",
   "fr": "À qui est-ce ?",
   "ar": "لمن هذا الشيء؟"
  },
  "gArtifactHint": {
   "ru": "Нажми на героя, которому принадлежит вещь.",
   "en": "Tap the hero this thing belongs to.",
   "de": "Tippe auf den Helden, dem das gehört.",
   "es": "Toca al héroe dueño del objeto.",
   "pt": "Toca no herói dono do objeto.",
   "fr": "Appuie sur le héros à qui appartient l’objet.",
   "ar": "اضغط على البطل صاحب الشيء."
  },
  "gOrder": {
   "ru": "Порядок событий",
   "en": "Story order",
   "de": "Reihenfolge",
   "es": "Orden de eventos",
   "pt": "Ordem dos eventos",
   "fr": "Ordre des événements",
   "ar": "ترتيب الأحداث"
  },
  "gOrderHint": {
   "ru": "Нажимай на события в правильном порядке: что было раньше?",
   "en": "Tap the events in order: what came first?",
   "de": "Tippe die Ereignisse der Reihe nach an: was war zuerst?",
   "es": "Toca los eventos en orden: ¿qué pasó antes?",
   "pt": "Toca nos eventos por ordem: o que veio antes?",
   "fr": "Appuie sur les événements dans l’ordre : quoi d’abord ?",
   "ar": "اضغط على الأحداث بالترتيب: ماذا حدث أولًا؟"
  },
  "gArkFlap": {
   "ru": "Ковчег сквозь скалы",
   "en": "Ark through the cliffs",
   "de": "Arche durch die Felsen",
   "es": "Arca entre peñascos",
   "pt": "Arca entre rochas",
   "fr": "Arche entre les rochers",
   "ar": "الفلك بين الصخور"
  },
  "gArkFlapHint": {
   "ru": "Тапай, чтобы всплывать на ковчеге и проплывать между подводными скалами.",
   "en": "Tap to rise with the ark and swim between underwater cliffs.",
   "de": "Tippe, um mit der Arche aufzusteigen und zwischen Unterwasserfelsen zu schwimmen.",
   "es": "Toca para ascender con el arca y pasar entre peñascos bajo el agua.",
   "pt": "Toca para subir com a arca e passar entre rochas submersas.",
   "fr": "Appuie pour remonter avec l’arche et passer entre les rochers sous-marins.",
   "ar": "اضغط للصعود بالفلك والسباحة بين الصخور تحت الماء."
  },
  "gArkFlapTap": {
   "ru": "Нажми — всплывай!",
   "en": "Tap — rise!",
   "de": "Tippen — auftauchen!",
   "es": "¡Toca — sube!",
   "pt": "Toca — sobe!",
   "fr": "Appuie — remonte !",
   "ar": "اضغط — اصعد!"
  },
  "gArkFlapOver": {
   "ru": "Упс!",
   "en": "Oops!",
   "de": "Ups!",
   "es": "¡Uy!",
   "pt": "Ups!",
   "fr": "Oups !",
   "ar": "أوه!"
  },
  "gArkFlapBest": {
   "ru": "Рекорд",
   "en": "Best",
   "de": "Rekord",
   "es": "Récord",
   "pt": "Recorde",
   "fr": "Record",
   "ar": "الأفضل"
  },
  "whoIs": {
   "ru": "Кто это?",
   "en": "Who is it?",
   "de": "Wer ist das?",
   "es": "¿Quién es?",
   "pt": "Quem é?",
   "fr": "Qui est-ce ?",
   "ar": "من هذا؟"
  },
  "seen": {
   "ru": "Открыто карт",
   "en": "Cards seen",
   "de": "Karten gesehen",
   "es": "Cartas vistas",
   "pt": "Cartas vistas",
   "fr": "Cartes vues",
   "ar": "بطاقات مفتوحة"
  },
  "lFacts": {
   "ru": "Факты",
   "en": "Facts",
   "de": "Fakten",
   "es": "Datos",
   "pt": "Factos",
   "fr": "Faits",
   "ar": "حقائق"
  },
  "lStory": {
   "ru": "История",
   "en": "The story",
   "de": "Die Geschichte",
   "es": "La historia",
   "pt": "A história",
   "fr": "L’histoire",
   "ar": "القصة"
  },
  "lWord": {
   "ru": "Слово",
   "en": "Word",
   "de": "Wort",
   "es": "Palabra",
   "pt": "Palavra",
   "fr": "Mot",
   "ar": "كلمة"
  },
  "lListen": {
   "ru": "Послушай",
   "en": "Listen",
   "de": "Hör zu",
   "es": "Escucha",
   "pt": "Ouve",
   "fr": "Écoute",
   "ar": "استمع"
  },
  "lMore": {
   "ru": "Ещё об этом",
   "en": "More about it",
   "de": "Mehr dazu",
   "es": "Más sobre esto",
   "pt": "Mais sobre isto",
   "fr": "Pour aller plus loin",
   "ar": "المزيد عن هذا"
  },
  "lFind": {
   "ru": "Найди на карточке",
   "en": "Find on the card",
   "de": "Finde auf der Karte",
   "es": "Busca en la carta",
   "pt": "Encontra na carta",
   "fr": "Trouve sur la carte",
   "ar": "ابحث في البطاقة"
  },
  "audioStory": {
   "ru": "Аудио-история",
   "en": "Audio story",
   "de": "Audio-Geschichte",
   "es": "Audiohistoria",
   "pt": "Áudio-história",
   "fr": "Histoire audio",
   "ar": "قصة صوتية"
  },
  "lDigit": {
   "ru": "Цифра",
   "en": "Number",
   "de": "Zahl",
   "es": "Cifra",
   "pt": "Número",
   "fr": "Chiffre",
   "ar": "رقم"
  },
  "lThink": {
   "ru": "Подумай",
   "en": "Think about it",
   "de": "Denk nach",
   "es": "Piensa",
   "pt": "Pensa",
   "fr": "Réfléchis",
   "ar": "فكِّر"
  },
  "lWow": {
   "ru": "А ты знал?",
   "en": "Did you know?",
   "de": "Wusstest du?",
   "es": "¿Sabías que…?",
   "pt": "Sabias que…?",
   "fr": "Le savais-tu ?",
   "ar": "هل كنت تعلم؟"
  },
  "lHero": {
   "ru": "Герой Библии",
   "en": "Bible hero",
   "de": "Bibelheld",
   "es": "Héroe de la Biblia",
   "pt": "Herói da Bíblia",
   "fr": "Héros de la Bible",
   "ar": "بطل الكتاب المقدس"
  },
  "lPlotOne": {
   "ru": "Великий сюжет",
   "en": "Great story",
   "de": "Große Geschichte",
   "es": "Gran historia",
   "pt": "Grande história",
   "fr": "Grande histoire",
   "ar": "قصة عظيمة"
  },
  "lEra": {
   "ru": "Эпоха",
   "en": "Era",
   "de": "Epoche",
   "es": "Época",
   "pt": "Época",
   "fr": "Époque",
   "ar": "الحقبة"
  },
  "lHere": {
   "ru": "ты здесь",
   "en": "you are here",
   "de": "du bist hier",
   "es": "estás aquí",
   "pt": "estás aqui",
   "fr": "tu es ici",
   "ar": "أنت هنا"
  },
  "cards": {
   "ru": "Карты",
   "en": "Cards",
   "de": "Karten",
   "es": "Cartas",
   "pt": "Cartas",
   "fr": "Cartes",
   "ar": "البطاقات"
  },
  "lenta": {
   "ru": "Лента",
   "en": "Feed",
   "de": "Feed",
   "es": "Feed",
   "pt": "Feed",
   "fr": "Fil",
   "ar": "الشريط"
  },
  "pLang": {
   "ru": "Язык",
   "en": "Language",
   "de": "Sprache",
   "es": "Idioma",
   "pt": "Idioma",
   "fr": "Langue",
   "ar": "اللغة"
  },
  "lCards": {
   "ru": "карт",
   "en": "cards",
   "de": "Karten",
   "es": "cartas",
   "pt": "cartas",
   "fr": "cartes",
   "ar": "بطاقة"
  },
  "lBook": {
   "ru": "Книга",
   "en": "Book",
   "de": "Buch",
   "es": "Libro",
   "pt": "Livro",
   "fr": "Livre",
   "ar": "الكتاب"
  },
  "gBook": {
   "ru": "Игры книги",
   "en": "Book games",
   "de": "Buchspiele",
   "es": "Juegos del libro",
   "pt": "Jogos do livro",
   "fr": "Jeux du livre",
   "ar": "ألعاب الكتاب"
  },
  "lMaps": {
   "ru": "Карты",
   "en": "Maps",
   "de": "Karten",
   "es": "Mapas",
   "pt": "Mapas",
   "fr": "Cartes",
   "ar": "الخرائط"
  },
  "lBuild": {
   "ru": "Стройка",
   "en": "Builder",
   "de": "Baustelle",
   "es": "Construcción",
   "pt": "Construção",
   "fr": "Chantier",
   "ar": "البناء"
  },
  "mapNext": {
   "ru": "Дальше по пути",
   "en": "Next stop",
   "de": "Weiter des Wegs",
   "es": "Siguiente parada",
   "pt": "Próxima parada",
   "fr": "Étape suivante",
   "ar": "المحطة التالية"
  },
  "buildNext": {
   "ru": "Строим дальше",
   "en": "Keep building",
   "de": "Weiterbauen",
   "es": "Seguir construyendo",
   "pt": "Continuar a obra",
   "fr": "Continuer le chantier",
   "ar": "نواصل البناء"
  },
  "openCardBtn": {
   "ru": "Открыть карточку",
   "en": "Open the card",
   "de": "Karte öffnen",
   "es": "Abrir la carta",
   "pt": "Abrir a carta",
   "fr": "Ouvrir la carte",
   "ar": "افتح البطاقة"
  },
  "game": {
   "ru": "Игра",
   "en": "Game",
   "de": "Spiel",
   "es": "Juego",
   "pt": "Jogo",
   "fr": "Jeu",
   "ar": "اللعبة"
  },
  "qJourney": {
   "ru": "Большое путешествие",
   "en": "The Great Journey",
   "de": "Die große Reise",
   "es": "El gran viaje",
   "pt": "A Grande Viagem",
   "fr": "Le Grand Voyage",
   "ar": "الرحلة الكبرى"
  },
  "qJourneyHint": {
   "ru": "Проходи эпохи, выполняй задания — и собери все карты!",
   "en": "Travel through the eras, solve the challenges — and collect all the cards!",
   "de": "Reise durch die Epochen, löse die Aufgaben — und sammle alle Karten!",
   "es": "Recorre las épocas, supera los retos ¡y consigue todas las cartas!",
   "pt": "Viaje pelas épocas, cumpra os desafios — e colecione todas as cartas!",
   "fr": "Traverse les époques, relève les défis — et collectionne toutes les cartes !",
   "ar": "سافر عبر الحقب، أنجز المهام — واجمع كل البطاقات!"
  },
  "qTask": {
   "ru": "Задание",
   "en": "Task",
   "de": "Aufgabe",
   "es": "Reto",
   "pt": "Desafio",
   "fr": "Défi",
   "ar": "مهمة"
  },
  "qWho": {
   "ru": "Кто это?",
   "en": "Who is this?",
   "de": "Wer ist das?",
   "es": "¿Quién es?",
   "pt": "Quem é?",
   "fr": "Qui est-ce ?",
   "ar": "من هذا؟"
  },
  "qStory": {
   "ru": "Что это за история?",
   "en": "What story is this?",
   "de": "Welche Geschichte ist das?",
   "es": "¿Qué historia es esta?",
   "pt": "Que história é esta?",
   "fr": "Quelle est cette histoire ?",
   "ar": "ما هذه القصة؟"
  },
  "qDigit": {
   "ru": "Выбери верное число",
   "en": "Pick the right number",
   "de": "Wähle die richtige Zahl",
   "es": "Elige el número correcto",
   "pt": "Escolha o número certo",
   "fr": "Choisis le bon nombre",
   "ar": "اختر الرقم الصحيح"
  },
  "qPair": {
   "ru": "Найди пару!",
   "en": "Find the pair!",
   "de": "Finde das Paar!",
   "es": "¡Encuentra la pareja!",
   "pt": "Encontre o par!",
   "fr": "Trouve la paire !",
   "ar": "جِد الزوج!"
  },
  "qGot": {
   "ru": "Карта получена!",
   "en": "You got the card!",
   "de": "Karte erhalten!",
   "es": "¡Carta conseguida!",
   "pt": "Carta conquistada!",
   "fr": "Carte obtenue !",
   "ar": "حصلت على البطاقة!"
  },
  "qNext": {
   "ru": "Дальше",
   "en": "Next",
   "de": "Weiter",
   "es": "Siguiente",
   "pt": "Próximo",
   "fr": "Suivant",
   "ar": "التالي"
  },
  "qEraDone": {
   "ru": "Эпоха пройдена!",
   "en": "Era complete!",
   "de": "Epoche geschafft!",
   "es": "¡Época completada!",
   "pt": "Época concluída!",
   "fr": "Époque terminée !",
   "ar": "أنجزت الحقبة!"
  },
  "qOnward": {
   "ru": "Продолжить путь",
   "en": "Continue the journey",
   "de": "Weiterreisen",
   "es": "Continuar el viaje",
   "pt": "Continuar a viagem",
   "fr": "Continuer le voyage",
   "ar": "واصل الرحلة"
  },
  "qLockEra": {
   "ru": "Сначала пройди прошлую эпоху",
   "en": "Finish the previous era first",
   "de": "Schließe zuerst die vorherige Epoche ab",
   "es": "Termina antes la época anterior",
   "pt": "Conclua primeiro a época anterior",
   "fr": "Termine d'abord l'époque précédente",
   "ar": "أكمل الحقبة السابقة أولاً"
  },
  "qLockCard": {
   "ru": "Эта карта ещё не добыта. Пройди её эпоху в игре!",
   "en": "You haven't earned this card yet. Complete its era in the game!",
   "de": "Diese Karte hast du noch nicht verdient. Schaffe ihre Epoche im Spiel!",
   "es": "Aún no has conseguido esta carta. ¡Supera su época en el juego!",
   "pt": "Você ainda não conquistou esta carta. Complete a época dela no jogo!",
   "fr": "Tu n'as pas encore gagné cette carte. Termine son époque dans le jeu !",
   "ar": "لم تحصل على هذه البطاقة بعد. أكمل حقبتها في اللعبة!"
  },
  "qToGame": {
   "ru": "В игру",
   "en": "To the game",
   "de": "Zum Spiel",
   "es": "Al juego",
   "pt": "Para o jogo",
   "fr": "Vers le jeu",
   "ar": "إلى اللعبة"
  },
  "qFree": {
   "ru": "Свободная игра",
   "en": "Free play",
   "de": "Freies Spiel",
   "es": "Juego libre",
   "pt": "Jogo livre",
   "fr": "Jeu libre",
   "ar": "لعب حر"
  },
  "qBonus": {
   "ru": "Бонус: стройка!",
   "en": "Bonus: build it!",
   "de": "Bonus: Baustelle!",
   "es": "¡Extra: a construir!",
   "pt": "Bônus: construção!",
   "fr": "Bonus : chantier !",
   "ar": "مكافأة: بناء!"
  },
  "qBonusBook": {
   "ru": "Бонус: книга!",
   "en": "Bonus: a book!",
   "de": "Bonus: ein Buch!",
   "es": "¡Extra: un libro!",
   "pt": "Bônus: um livro!",
   "fr": "Bonus : un livre !",
   "ar": "مكافأة: كتاب!"
  },
  "qCollected": {
   "ru": "Собрано карт",
   "en": "Cards collected",
   "de": "Karten gesammelt",
   "es": "Cartas conseguidas",
   "pt": "Cartas coletadas",
   "fr": "Cartes obtenues",
   "ar": "البطاقات المجموعة"
  },
  "qPuzzle": {
   "ru": "Собери картинку!",
   "en": "Put the picture together!",
   "de": "Setz das Bild zusammen!",
   "es": "¡Arma la imagen!",
   "pt": "Monte a figura!",
   "fr": "Reconstitue l’image !",
   "ar": "ركّب الصورة!"
  },
  "qJigsaw": {
   "ru": "Пазл-история",
   "en": "Story puzzle",
   "de": "Geschichten-Puzzle",
   "es": "Puzzle de historias",
   "pt": "Puzzle de histórias",
   "fr": "Puzzle d’histoires",
   "ar": "أحجية القصص"
  },
  "qPuzzleHint": {
   "ru": "Нажми на два кусочка, чтобы поменять их местами",
   "en": "Tap two pieces to swap them",
   "de": "Tippe auf zwei Teile, um sie zu tauschen",
   "es": "Toca dos piezas para intercambiarlas",
   "pt": "Toque em duas peças para trocá-las",
   "fr": "Touche deux pièces pour les échanger",
   "ar": "اضغط على قطعتين لتبديلهما"
  },
  "qFindOn": {
   "ru": "Найди на картине:",
   "en": "Find in the picture:",
   "de": "Finde auf dem Bild:",
   "es": "Busca en el cuadro:",
   "pt": "Encontre na pintura:",
   "fr": "Trouve sur l’image :",
   "ar": "جِد في الصورة:"
  },
  "qWordGame": {
   "ru": "Сложи слово из букв",
   "en": "Build the word from letters",
   "de": "Baue das Wort aus Buchstaben",
   "es": "Forma la palabra con las letras",
   "pt": "Monte a palavra com as letras",
   "fr": "Assemble le mot avec les lettres",
   "ar": "ركّب الكلمة من الحروف"
  },
  "qListen": {
   "ru": "Чья это история? Нажми ▶ и послушай",
   "en": "Whose story is this? Press ▶ and listen",
   "de": "Wessen Geschichte ist das? Drücke ▶ und hör zu",
   "es": "¿De quién es esta historia? Pulsa ▶ y escucha",
   "pt": "De quem é esta história? Aperte ▶ e ouça",
   "fr": "À qui est cette histoire ? Appuie sur ▶ et écoute",
   "ar": "قصة من هذه؟ اضغط ▶ واستمع"
  },
  "qShadow": {
   "ru": "Кто прячется в тумане?",
   "en": "Who is hiding in the mist?",
   "de": "Wer versteckt sich im Nebel?",
   "es": "¿Quién se esconde en la niebla?",
   "pt": "Quem está escondido na névoa?",
   "fr": "Qui se cache dans la brume ?",
   "ar": "من يختبئ في الضباب؟"
  },
  "qMapBonus": {
   "ru": "Бонус: путь Исхода!",
   "en": "Bonus: the Exodus route!",
   "de": "Bonus: der Weg des Exodus!",
   "es": "¡Extra: el camino del Éxodo!",
   "pt": "Bônus: o caminho do Êxodo!",
   "fr": "Bonus : le chemin de l’Exode !",
   "ar": "مكافأة: طريق الخروج!"
  },
  "qGrand": {
   "ru": "Супер-приз",
   "en": "Grand prize",
   "de": "Hauptpreis",
   "es": "Gran premio",
   "pt": "Grande prêmio",
   "fr": "Grand prix",
   "ar": "الجائزة الكبرى"
  },
  "qGrandTitle": {
   "ru": "Знаток великих историй!",
   "en": "Master of the Great Stories!",
   "de": "Kenner der großen Geschichten!",
   "es": "¡Experto en las grandes historias!",
   "pt": "Mestre das grandes histórias!",
   "fr": "Expert des grandes histoires !",
   "ar": "عالِم القصص العظيمة!"
  },
  "qGrandText": {
   "ru": "Ты прошёл все эпохи и собрал все карты! Вот твоя грамота.",
   "en": "You passed every era and collected every card! Here is your award.",
   "de": "Du hast alle Epochen geschafft und alle Karten gesammelt! Hier ist deine Urkunde.",
   "es": "¡Superaste todas las épocas y conseguiste todas las cartas! Aquí está tu diploma.",
   "pt": "Você venceu todas as épocas e coletou todas as cartas! Aqui está o seu diploma.",
   "fr": "Tu as traversé toutes les époques et obtenu toutes les cartes ! Voici ton diplôme.",
   "ar": "لقد أنهيت كل الحقب وجمعت كل البطاقات! هذه شهادتك."
  },
  "s1Prompt": {
   "ru": "Разложи по дням: нажми кусочек мира, потом его день",
   "en": "Sort by days: tap a piece of the world, then its day",
   "de": "Ordne nach Tagen: Tippe auf ein Stück Welt, dann auf seinen Tag",
   "es": "Ordena por días: toca una parte del mundo y luego su día",
   "pt": "Organize por dias: toque numa parte do mundo e depois no dia dela",
   "fr": "Range par jours : touche un morceau du monde, puis son jour",
   "ar": "رتّب حسب الأيام: اضغط على جزء من العالم ثم على يومه"
  },
  "s1d1": {
   "ru": "Свет",
   "en": "Light",
   "de": "Das Licht",
   "es": "La luz",
   "pt": "A luz",
   "fr": "La lumière",
   "ar": "النور"
  },
  "s1d2": {
   "ru": "Небо и вода",
   "en": "Sky and water",
   "de": "Himmel und Wasser",
   "es": "El cielo y el agua",
   "pt": "O céu e a água",
   "fr": "Le ciel et l’eau",
   "ar": "السماء والماء"
  },
  "s1d3": {
   "ru": "Суша и растения",
   "en": "Land and plants",
   "de": "Land und Pflanzen",
   "es": "La tierra y las plantas",
   "pt": "A terra e as plantas",
   "fr": "La terre et les plantes",
   "ar": "اليابسة والنباتات"
  },
  "s1d4": {
   "ru": "Солнце, луна и звёзды",
   "en": "Sun, moon and stars",
   "de": "Sonne, Mond und Sterne",
   "es": "El sol, la luna y las estrellas",
   "pt": "O sol, a lua e as estrelas",
   "fr": "Le soleil, la lune et les étoiles",
   "ar": "الشمس والقمر والنجوم"
  },
  "s1d5": {
   "ru": "Рыбы и птицы",
   "en": "Fish and birds",
   "de": "Fische und Vögel",
   "es": "Los peces y las aves",
   "pt": "Os peixes e as aves",
   "fr": "Les poissons et les oiseaux",
   "ar": "الأسماك والطيور"
  },
  "s1d6": {
   "ru": "Звери и человек",
   "en": "Animals and people",
   "de": "Tiere und Menschen",
   "es": "Los animales y el ser humano",
   "pt": "Os animais e o ser humano",
   "fr": "Les animaux et l’homme",
   "ar": "الحيوانات والإنسان"
  },
  "s1d7": {
   "ru": "День покоя",
   "en": "Day of rest",
   "de": "Der Ruhetag",
   "es": "El día de descanso",
   "pt": "O dia de descanso",
   "fr": "Le jour de repos",
   "ar": "يوم الراحة"
  },
  "s1Day": {
   "ru": "День",
   "en": "Day",
   "de": "Tag",
   "es": "Día",
   "pt": "Dia",
   "fr": "Jour",
   "ar": "اليوم"
  },
  "s2Prompt": {
   "ru": "Дождь всё ближе! Заведи всех на ковчег парами: нажми животное, потом его пару",
   "en": "The rain is coming! Load everyone in pairs: tap an animal, then its match",
   "de": "Der Regen kommt! Bring alle paarweise an Bord: Tippe auf ein Tier, dann auf sein Paar",
   "es": "¡Ya viene la lluvia! Sube a todos en parejas: toca un animal y luego su pareja",
   "pt": "A chuva vem aí! Embarque todos em pares: toque num animal e depois no seu par",
   "fr": "La pluie arrive ! Fais monter tout le monde deux par deux : touche un animal, puis son double",
   "ar": "المطر قادم! أدخِل الجميع أزواجًا: اضغط على حيوان ثم على زوجه"
  },
  "s2Aboard": {
   "ru": "Пары на борту",
   "en": "Pairs aboard",
   "de": "Paare an Bord",
   "es": "Parejas a bordo",
   "pt": "Pares a bordo",
   "fr": "Paires à bord",
   "ar": "الأزواج على متن الفلك"
  },
  "s3Prompt": {
   "ru": "Собирай манну — но ровно столько, сколько нужно на один день!",
   "en": "Gather the manna — but only as much as you need for one day!",
   "de": "Sammle Manna – aber genau so viel, wie du für einen Tag brauchst!",
   "es": "Recoge el maná, ¡pero solo lo justo para un día!",
   "pt": "Colha o maná — mas só o necessário para um dia!",
   "fr": "Ramasse la manne — mais juste ce qu’il faut pour un jour !",
   "ar": "اجمع المنّ — ولكن فقط ما يكفي ليوم واحد!"
  },
  "s3Norm": {
   "ru": "На один день нужно",
   "en": "Needed for one day",
   "de": "Für einen Tag braucht man",
   "es": "Para un día se necesita",
   "pt": "Para um dia é preciso",
   "fr": "Pour un jour il faut",
   "ar": "يكفي ليوم واحد"
  },
  "s3Enough": {
   "ru": "Хватит! Больше не бери — завтра будет свежая",
   "en": "Enough! Take no more — tomorrow there will be fresh manna",
   "de": "Genug! Nimm nicht mehr – morgen gibt es frisches",
   "es": "¡Suficiente! No tomes más: mañana habrá maná fresco",
   "pt": "Chega! Não pegue mais — amanhã haverá maná fresquinho",
   "fr": "Assez ! N’en prends pas plus — demain il y en aura de la fraîche",
   "ar": "كفى! لا تأخذ أكثر — غدًا سيكون هناك منٌّ طازج"
  },
  "s3Spoil": {
   "ru": "Ой! Лишняя манна испортилась к утру… Возьми ровно сколько нужно",
   "en": "Oops! The extra manna spoiled by morning… Take exactly what you need",
   "de": "Oje! Das übrige Manna war am Morgen verdorben… Nimm genau so viel, wie du brauchst",
   "es": "¡Uy! El maná de más se echó a perder por la mañana… Toma solo lo necesario",
   "pt": "Opa! O maná a mais estragou até de manhã… Pegue só o necessário",
   "fr": "Oups ! La manne en trop s’est gâtée au matin… Prends juste ce qu’il faut",
   "ar": "أوه! المنّ الزائد فسد في الصباح… خذ ما تحتاجه فقط"
  },
  "s3Basket": {
   "ru": "В корзине",
   "en": "In the basket",
   "de": "Im Korb",
   "es": "En la cesta",
   "pt": "Na cesta",
   "fr": "Dans le panier",
   "ar": "في السلة"
  },
  "s4Intro": {
   "ru": "К царю Соломону пришли две женщины с одним малышом. Каждая говорила: «Это мой сын!» Как узнать правду?",
   "en": "Two women came to King Solomon with one baby. Each said, “He is my son!” How can he find the truth?",
   "de": "Zwei Frauen kamen mit einem Baby zu König Salomo. Jede sagte: „Das ist mein Sohn!“ Wie findet er die Wahrheit heraus?",
   "es": "Dos mujeres llegaron ante el rey Salomón con un solo bebé. Cada una decía: «¡Es mi hijo!». ¿Cómo saber la verdad?",
   "pt": "Duas mulheres vieram ao rei Salomão com um só bebê. Cada uma dizia: “É meu filho!” Como descobrir a verdade?",
   "fr": "Deux femmes vinrent voir le roi Salomon avec un seul bébé. Chacune disait : « C’est mon fils ! » Comment trouver la vérité ?",
   "ar": "جاءت امرأتان إلى الملك سليمان ومعهما طفل واحد. كلٌّ منهما تقول: «هذا ابني!» فكيف يعرف الحقيقة؟"
  },
  "s4o1": {
   "ru": "Отдать той, кто кричит громче",
   "en": "Give him to the louder one",
   "de": "Ihn der lauteren Frau geben",
   "es": "Dárselo a la que grite más fuerte",
   "pt": "Dar para a que gritar mais alto",
   "fr": "Le donner à celle qui crie le plus fort",
   "ar": "يعطيه لمن تصرخ أعلى"
  },
  "s4o2": {
   "ru": "Сказать: «Разделим малыша пополам» — и посмотреть, что будет",
   "en": "Say, “Let us split the baby in two” — and see what happens",
   "de": "Sagen: „Teilen wir das Kind in zwei Hälften“ – und schauen, was passiert",
   "es": "Decir: «Partamos al bebé en dos» y ver qué pasa",
   "pt": "Dizer: “Vamos dividir o bebê ao meio” — e ver o que acontece",
   "fr": "Dire : « Partageons le bébé en deux » — et voir ce qui se passe",
   "ar": "يقول: «لنقسم الطفل نصفين» — ويرى ماذا سيحدث"
  },
  "s4o3": {
   "ru": "Бросить жребий",
   "en": "Draw lots",
   "de": "Das Los entscheiden lassen",
   "es": "Echarlo a suertes",
   "pt": "Tirar a sorte",
   "fr": "Tirer au sort",
   "ar": "يقترع بينهما"
  },
  "s4no": {
   "ru": "Хм, так правду не узнать. Подумай ещё!",
   "en": "Hmm, that won’t reveal the truth. Think again!",
   "de": "Hmm, so findet man die Wahrheit nicht heraus. Überleg noch mal!",
   "es": "Mmm, así no se descubre la verdad. ¡Piensa otra vez!",
   "pt": "Hmm, assim não se descobre a verdade. Pense de novo!",
   "fr": "Hum, ça ne révélera pas la vérité. Réfléchis encore !",
   "ar": "همم، هكذا لن تُعرف الحقيقة. فكّر مرة أخرى!"
  },
  "s4Step2": {
   "ru": "Одна женщина согласилась: «Пусть так!» А вторая взмолилась: «Не надо! Отдайте малыша ей — только пусть живёт!» Кто же настоящая мама?",
   "en": "One woman agreed: “So be it!” But the other cried: “No! Give the baby to her — just let him live!” Who is the real mother?",
   "de": "Die eine Frau stimmte zu: „So sei es!“ Doch die andere flehte: „Nein! Gebt ihr das Kind – Hauptsache, es lebt!“ Wer ist die echte Mutter?",
   "es": "Una mujer aceptó: «¡Que así sea!». Pero la otra suplicó: «¡No! Dénselo a ella, ¡pero que viva!». ¿Quién es la verdadera mamá?",
   "pt": "Uma mulher concordou: “Que seja!” Mas a outra implorou: “Não! Deem o bebê a ela — contanto que ele viva!” Quem é a mãe verdadeira?",
   "fr": "Une femme accepta : « Qu’il en soit ainsi ! » Mais l’autre supplia : « Non ! Donnez-lui le bébé — pourvu qu’il vive ! » Qui est la vraie maman ?",
   "ar": "وافقت إحداهما: «فليكن!» لكن الأخرى توسّلت: «لا! أعطوه لها — المهم أن يعيش!» فمن هي الأم الحقيقية؟"
  },
  "s4m1": {
   "ru": "Та, что согласилась делить",
   "en": "The one who agreed to split him",
   "de": "Die, die teilen wollte",
   "es": "La que aceptó partirlo",
   "pt": "A que aceitou dividir",
   "fr": "Celle qui a accepté de partager",
   "ar": "التي وافقت على القسمة"
  },
  "s4m2": {
   "ru": "Та, что пожалела и отказалась",
   "en": "The one who had pity and refused",
   "de": "Die, die Mitleid hatte und ablehnte",
   "es": "La que sintió pena y se negó",
   "pt": "A que teve pena e recusou",
   "fr": "Celle qui a eu pitié et a refusé",
   "ar": "التي أشفقت عليه ورفضت"
  },
  "s4Moral": {
   "ru": "Настоящая любовь готова всё отдать, лишь бы малышу было хорошо. Так мудрый Соломон узнал правду — и вернул сына маме.",
   "en": "True love will give up everything so the child is safe. That is how wise Solomon found the truth — and gave the son back to his mother.",
   "de": "Wahre Liebe gibt alles her, damit es dem Kind gut geht. So fand der weise Salomo die Wahrheit heraus – und gab der Mutter ihren Sohn zurück.",
   "es": "El amor verdadero lo da todo con tal de que el niño esté bien. Así el sabio Salomón descubrió la verdad y devolvió el hijo a su mamá.",
   "pt": "O amor verdadeiro abre mão de tudo para o bem da criança. Foi assim que o sábio Salomão descobriu a verdade — e devolveu o filho à mãe.",
   "fr": "Le véritable amour donne tout pour que l’enfant aille bien. C’est ainsi que le sage Salomon a trouvé la vérité — et rendu le fils à sa maman.",
   "ar": "الحب الحقيقي مستعد أن يتخلى عن كل شيء ليبقى الطفل بخير. هكذا عرف سليمان الحكيم الحقيقة — وأعاد الابن إلى أمه."
  },
  "s5Prompt": {
   "ru": "Одна из звёзд — особенная: она мерцает и движется! Найди её и иди за ней",
   "en": "One star is special: it twinkles and moves! Find it and follow it",
   "de": "Ein Stern ist besonders: Er funkelt und wandert! Finde ihn und folge ihm",
   "es": "¡Una estrella es especial: parpadea y se mueve! Encuéntrala y síguela",
   "pt": "Uma estrela é especial: ela pisca e se move! Encontre-a e siga-a",
   "fr": "Une étoile est spéciale : elle scintille et se déplace ! Trouve-la et suis-la",
   "ar": "نجمة واحدة مميزة: إنها تلمع وتتحرك! جِدها واتبعها"
  },
  "s5Follow": {
   "ru": "Звезда зовёт дальше — нажми на неё!",
   "en": "The star leads on — tap it!",
   "de": "Der Stern zieht weiter – tippe darauf!",
   "es": "La estrella sigue adelante: ¡tócala!",
   "pt": "A estrela segue em frente — toque nela!",
   "fr": "L’étoile continue — touche-la !",
   "ar": "النجمة تواصل المسير — اضغط عليها!"
  },
  "s5Done": {
   "ru": "Звезда привела к яслям Вифлеема!",
   "en": "The star led to the manger in Bethlehem!",
   "de": "Der Stern führte zur Krippe in Bethlehem!",
   "es": "¡La estrella llevó al pesebre de Belén!",
   "pt": "A estrela levou até a manjedoura de Belém!",
   "fr": "L’étoile a mené jusqu’à la crèche de Bethléem !",
   "ar": "قادت النجمة إلى مذود بيت لحم!"
  },
  "j7Prompt": {
   "ru": "Обойди вокруг стен семь раз — и только потом труби!",
   "en": "March around the walls seven times — only then blow the horn!",
   "de": "Zieh siebenmal um die Mauern – und blase erst dann ins Horn!",
   "es": "¡Da siete vueltas alrededor de las murallas y solo entonces toca la trompeta!",
   "pt": "Dê sete voltas ao redor das muralhas — e só então toque a trombeta!",
   "fr": "Fais sept fois le tour des murailles — et seulement après, sonne du cor !",
   "ar": "طُف حول الأسوار سبع مرات — وبعدها فقط انفخ في البوق!"
  },
  "j7Walk": {
   "ru": "Обойти вокруг стен",
   "en": "March around the walls",
   "de": "Um die Mauern ziehen",
   "es": "Dar una vuelta a las murallas",
   "pt": "Dar uma volta nas muralhas",
   "fr": "Faire le tour des murailles",
   "ar": "الطواف حول الأسوار"
  },
  "j7Round": {
   "ru": "Обходов",
   "en": "Rounds",
   "de": "Runden",
   "es": "Vueltas",
   "pt": "Voltas",
   "fr": "Tours",
   "ar": "الجولات"
  },
  "j7Blow": {
   "ru": "Трубить!",
   "en": "Blow the horn!",
   "de": "Ins Horn blasen!",
   "es": "¡Tocar la trompeta!",
   "pt": "Tocar a trombeta!",
   "fr": "Sonner du cor !",
   "ar": "انفخ في البوق!"
  },
  "j7Early": {
   "ru": "Рано! Стены ещё стоят. Иди вокруг ещё раз",
   "en": "Too early! The walls are still standing. March around again",
   "de": "Zu früh! Die Mauern stehen noch. Zieh noch einmal herum",
   "es": "¡Todavía no! Las murallas siguen en pie. Da otra vuelta",
   "pt": "Cedo demais! As muralhas ainda estão de pé. Dê mais uma volta",
   "fr": "Trop tôt ! Les murailles tiennent encore. Refais un tour",
   "ar": "مبكر جدًا! الأسوار لا تزال قائمة. طُف مرة أخرى"
  },
  "j7Fall": {
   "ru": "Стены рухнули сами!",
   "en": "The walls fell down on their own!",
   "de": "Die Mauern stürzten von selbst ein!",
   "es": "¡Las murallas cayeron solas!",
   "pt": "As muralhas caíram sozinhas!",
   "fr": "Les murailles se sont écroulées toutes seules !",
   "ar": "سقطت الأسوار من تلقاء نفسها!"
  },
  "joPrompt": {
   "ru": "Семь лет — богатый урожай! Что делать с зерном каждый год?",
   "en": "Seven years of rich harvest! What to do with the grain each year?",
   "de": "Sieben Jahre reiche Ernte! Was tun mit dem Korn – Jahr für Jahr?",
   "es": "¡Siete años de cosecha abundante! ¿Qué hacer con el grano cada año?",
   "pt": "Sete anos de colheita farta! O que fazer com o grão a cada ano?",
   "fr": "Sept années de récoltes abondantes ! Que faire du grain chaque année ?",
   "ar": "سبع سنوات من الحصاد الوفير! ماذا نفعل بالقمح كل سنة؟"
  },
  "joYear": {
   "ru": "Год",
   "en": "Year",
   "de": "Jahr",
   "es": "Año",
   "pt": "Ano",
   "fr": "Année",
   "ar": "السنة"
  },
  "joBarn": {
   "ru": "В амбаре",
   "en": "In the barn",
   "de": "Im Speicher",
   "es": "En el granero",
   "pt": "No celeiro",
   "fr": "Dans le grenier",
   "ar": "في المخزن"
  },
  "joFeast": {
   "ru": "Устроить большой пир",
   "en": "Throw a big feast",
   "de": "Ein großes Fest feiern",
   "es": "Hacer un gran banquete",
   "pt": "Fazer um grande banquete",
   "fr": "Faire un grand festin",
   "ar": "نقيم وليمة كبيرة"
  },
  "joStore": {
   "ru": "Отложить в амбар",
   "en": "Store it in the barn",
   "de": "Im Speicher aufbewahren",
   "es": "Guardarlo en el granero",
   "pt": "Guardar no celeiro",
   "fr": "Le mettre au grenier",
   "ar": "نخزنه في المخزن"
  },
  "joHint": {
   "ru": "Мудрый Иосиф качает головой: «Впереди голодные годы — отложи!»",
   "en": "Wise Joseph shakes his head: “Hungry years are coming — store it!”",
   "de": "Der weise Josef schüttelt den Kopf: „Hungerjahre kommen – leg etwas zurück!“",
   "es": "El sabio José niega con la cabeza: «Vienen años de hambre, ¡guárdalo!»",
   "pt": "O sábio José balança a cabeça: “Vêm anos de fome — guarde!”",
   "fr": "Le sage Joseph secoue la tête : « Des années de famine arrivent — mets de côté ! »",
   "ar": "يهزّ يوسف الحكيم رأسه: «سنوات الجوع قادمة — خزِّن!»"
  },
  "joLean": {
   "ru": "Настали семь тощих лет… Народ ест из амбара",
   "en": "The seven lean years have come… The people eat from the barn",
   "de": "Die sieben mageren Jahre sind da… Das Volk isst aus dem Speicher",
   "es": "Llegaron los siete años flacos… El pueblo come del granero",
   "pt": "Chegaram os sete anos magros… O povo come do celeiro",
   "fr": "Les sept années maigres sont là… Le peuple mange du grenier",
   "ar": "جاءت السنوات السبع العجاف… الشعب يأكل من المخزن"
  },
  "joFed": {
   "ru": "Запасы спасли всех от голода! Вот это мудрость",
   "en": "The stores saved everyone from hunger! That is true wisdom",
   "de": "Die Vorräte retteten alle vor dem Hunger! Das ist wahre Weisheit",
   "es": "¡Las reservas salvaron a todos del hambre! Eso es sabiduría",
   "pt": "As reservas salvaram todos da fome! Isso é que é sabedoria",
   "fr": "Les réserves ont sauvé tout le monde de la faim ! Voilà la sagesse",
   "ar": "أنقذت المؤن الجميع من الجوع! هذه هي الحكمة"
  },
  "jnPrompt": {
   "ru": "Ионе велено идти в Ниневию. Куда поплывёт корабль?",
   "en": "Jonah was told to go to Nineveh. Where will the ship sail?",
   "de": "Jona soll nach Ninive gehen. Wohin segelt das Schiff?",
   "es": "A Jonás le mandaron ir a Nínive. ¿Hacia dónde navegará el barco?",
   "pt": "Jonas recebeu ordem de ir a Nínive. Para onde o navio vai navegar?",
   "fr": "Jonas doit aller à Ninive. Où le bateau va-t-il naviguer ?",
   "ar": "أُمر يونان بالذهاب إلى نينوى. إلى أين ستبحر السفينة؟"
  },
  "jnAway": {
   "ru": "Уплыть подальше",
   "en": "Sail far away",
   "de": "Weit wegsegeln",
   "es": "Huir bien lejos",
   "pt": "Fugir para longe",
   "fr": "Fuir au loin",
   "ar": "الإبحار بعيدًا"
  },
  "jnGo": {
   "ru": "Плыть в Ниневию",
   "en": "Sail to Nineveh",
   "de": "Nach Ninive segeln",
   "es": "Navegar a Nínive",
   "pt": "Navegar para Nínive",
   "fr": "Naviguer vers Ninive",
   "ar": "الإبحار إلى نينوى"
  },
  "jnStorm": {
   "ru": "Буря! Большая рыба развернула корабль. От поручения не уплывёшь!",
   "en": "A storm! The great fish turned the ship around. You cannot sail away from your task!",
   "de": "Ein Sturm! Der große Fisch drehte das Schiff um. Vor einer Aufgabe kann man nicht davonsegeln!",
   "es": "¡Tormenta! El gran pez hizo girar el barco. ¡De un encargo no se puede huir!",
   "pt": "Tempestade! O grande peixe virou o navio. De uma missão não dá para fugir!",
   "fr": "Tempête ! Le grand poisson a retourné le bateau. On ne fuit pas sa mission !",
   "ar": "عاصفة! السمكة الكبيرة أعادت السفينة. لا يمكنك الهرب من المهمة!"
  },
  "jnArrive": {
   "ru": "Иона добрался до Ниневии — и огромный город стал добрее!",
   "en": "Jonah reached Nineveh — and the huge city became kinder!",
   "de": "Jona erreichte Ninive – und die riesige Stadt wurde gütiger!",
   "es": "Jonás llegó a Nínive, ¡y la enorme ciudad se volvió más buena!",
   "pt": "Jonas chegou a Nínive — e a cidade enorme ficou mais bondosa!",
   "fr": "Jonas est arrivé à Ninive — et l’immense ville est devenue meilleure !",
   "ar": "وصل يونان إلى نينوى — وصارت المدينة العظيمة أطيب!"
  },
  "tbPrompt": {
   "ru": "Скрижали — правила доброй жизни. Какое правило про это?",
   "en": "The tablets hold the rules of a good life. Which rule fits here?",
   "de": "Auf den Tafeln stehen Regeln für ein gutes Leben. Welche Regel passt hier?",
   "es": "Las tablas guardan las reglas de una buena vida. ¿Qué regla corresponde aquí?",
   "pt": "As tábuas guardam as regras de uma vida boa. Qual regra combina aqui?",
   "fr": "Les tables portent les règles d’une bonne vie. Quelle règle correspond ici ?",
   "ar": "اللوحان يحملان قواعد الحياة الطيبة. أي قاعدة تناسب هذا؟"
  },
  "tbS1": {
   "ru": "На площадке ты нашёл чужую машинку. Очень хочется забрать её домой…",
   "en": "You found someone else's toy car at the playground. You really want to take it home…",
   "de": "Auf dem Spielplatz hast du ein fremdes Spielzeugauto gefunden. Du willst es unbedingt mitnehmen…",
   "es": "En el parque encontraste un cochecito ajeno. Tienes muchas ganas de llevártelo a casa…",
   "pt": "No parquinho você achou um carrinho que não é seu. Está com muita vontade de levar para casa…",
   "fr": "Au square, tu as trouvé la petite voiture de quelqu’un d’autre. Tu as très envie de la ramener chez toi…",
   "ar": "وجدت في الملعب سيارة لعبة ليست لك. تريد كثيرًا أخذها إلى البيت…"
  },
  "tbS2": {
   "ru": "Ты случайно разбил чашку. Мама спрашивает: «Кто это сделал?»",
   "en": "You accidentally broke a cup. Mom asks, “Who did this?”",
   "de": "Du hast aus Versehen eine Tasse zerbrochen. Mama fragt: „Wer war das?“",
   "es": "Rompiste una taza sin querer. Mamá pregunta: «¿Quién fue?»",
   "pt": "Você quebrou uma xícara sem querer. A mamãe pergunta: “Quem foi?”",
   "fr": "Tu as cassé une tasse sans faire exprès. Maman demande : « Qui a fait ça ? »",
   "ar": "كسرت فنجانًا من غير قصد. تسأل ماما: «من فعل هذا؟»"
  },
  "tbS3": {
   "ru": "Бабушка просит помочь накрыть на стол, а у тебя самая интересная игра…",
   "en": "Grandma asks you to help set the table, but you're in the middle of the best game…",
   "de": "Oma bittet dich, den Tisch decken zu helfen, aber dein Spiel ist gerade so spannend…",
   "es": "La abuela te pide ayudar a poner la mesa, pero estás en pleno juego…",
   "pt": "A vovó pede ajuda para pôr a mesa, mas você está no meio da melhor brincadeira…",
   "fr": "Mamie te demande de l’aider à mettre la table, mais tu es en plein jeu…",
   "ar": "تطلب الجدة مساعدتها في إعداد المائدة، وأنت في أمتع لعبة…"
  },
  "tbR1": {
   "ru": "Не бери чужого",
   "en": "Do not take what is not yours",
   "de": "Nimm nichts Fremdes",
   "es": "No tomes lo ajeno",
   "pt": "Não pegue o que não é seu",
   "fr": "Ne prends pas ce qui n’est pas à toi",
   "ar": "لا تأخذ ما ليس لك"
  },
  "tbR2": {
   "ru": "Говори только правду",
   "en": "Always tell the truth",
   "de": "Sag immer die Wahrheit",
   "es": "Di siempre la verdad",
   "pt": "Fale sempre a verdade",
   "fr": "Dis toujours la vérité",
   "ar": "قل الحقيقة دائمًا"
  },
  "tbR3": {
   "ru": "Почитай маму и папу",
   "en": "Honor your mom and dad",
   "de": "Ehre Mama und Papa",
   "es": "Honra a mamá y papá",
   "pt": "Honre a mamãe e o papai",
   "fr": "Honore ta maman et ton papa",
   "ar": "أكرم أمك وأباك"
  },
  "tbR4": {
   "ru": "Отдыхай в седьмой день",
   "en": "Rest on the seventh day",
   "de": "Ruhe am siebten Tag",
   "es": "Descansa el séptimo día",
   "pt": "Descanse no sétimo dia",
   "fr": "Repose-toi le septième jour",
   "ar": "استرح في اليوم السابع"
  },
  "tbR5": {
   "ru": "Не завидуй",
   "en": "Do not envy",
   "de": "Sei nicht neidisch",
   "es": "No envidies",
   "pt": "Não inveje",
   "fr": "Ne sois pas envieux",
   "ar": "لا تحسد"
  },
  "dvPrompt": {
   "ru": "Выбери из ручья пять гладких круглых камней для пращи",
   "en": "Pick five smooth round stones from the stream for the sling",
   "de": "Such fünf glatte, runde Steine aus dem Bach für die Schleuder",
   "es": "Elige del arroyo cinco piedras lisas y redondas para la honda",
   "pt": "Escolha no riacho cinco pedras lisas e redondas para a funda",
   "fr": "Choisis dans le ruisseau cinq pierres lisses et rondes pour la fronde",
   "ar": "اختر من الجدول خمسة حجارة ملساء مستديرة للمقلاع"
  },
  "dvNo": {
   "ru": "Этот не подойдёт! Праща любит гладкие круглые камни",
   "en": "Not that one! A sling needs smooth round stones",
   "de": "Der passt nicht! Eine Schleuder braucht glatte, runde Steine",
   "es": "¡Esa no sirve! La honda necesita piedras lisas y redondas",
   "pt": "Essa não serve! A funda precisa de pedras lisas e redondas",
   "fr": "Pas celle-là ! La fronde a besoin de pierres lisses et rondes",
   "ar": "هذا لا يصلح! المقلاع يحتاج حجارة ملساء مستديرة"
  },
  "dvBag": {
   "ru": "В сумке",
   "en": "In the bag",
   "de": "In der Tasche",
   "es": "En el zurrón",
   "pt": "Na bolsa",
   "fr": "Dans le sac",
   "ar": "في الحقيبة"
  },
  "dvWin": {
   "ru": "Пять гладких камней! Маленький Давид готов к большой победе",
   "en": "Five smooth stones! Little David is ready for a great victory",
   "de": "Fünf glatte Steine! Der kleine David ist bereit für den großen Sieg",
   "es": "¡Cinco piedras lisas! El pequeño David está listo para una gran victoria",
   "pt": "Cinco pedras lisas! O pequeno Davi está pronto para uma grande vitória",
   "fr": "Cinq pierres lisses ! Le petit David est prêt pour une grande victoire",
   "ar": "خمسة حجارة ملساء! داود الصغير مستعد لنصر عظيم"
  },
  "rbPrompt": {
   "ru": "Собери радугу-обещание: нажимай цвета по порядку, сверху — красный",
   "en": "Build the promise rainbow: tap the colors in order, red on top",
   "de": "Bau den Versprechens-Regenbogen: Tippe die Farben der Reihe nach an, Rot zuoberst",
   "es": "Arma el arcoíris de la promesa: toca los colores en orden, el rojo arriba",
   "pt": "Monte o arco-íris da promessa: toque as cores em ordem, o vermelho por cima",
   "fr": "Construis l’arc-en-ciel de la promesse : touche les couleurs dans l’ordre, le rouge en haut",
   "ar": "ابنِ قوس قزح الوعد: اضغط على الألوان بالترتيب، الأحمر في الأعلى"
  },
  "rbDone": {
   "ru": "Радуга-обещание сияет: потопа больше не будет!",
   "en": "The promise rainbow is shining: there will never be another flood!",
   "de": "Der Versprechens-Regenbogen leuchtet: Es wird nie wieder eine große Flut geben!",
   "es": "¡El arcoíris de la promesa brilla: no habrá otro diluvio!",
   "pt": "O arco-íris da promessa brilha: não haverá outro dilúvio!",
   "fr": "L’arc-en-ciel de la promesse brille : il n’y aura plus jamais de déluge !",
   "ar": "قوس قزح الوعد يلمع: لن يكون هناك طوفان بعد الآن!"
  },
  "seaPrompt": {
   "ru": "Впереди море, позади погоня! Подними посох — нажми на воду",
   "en": "The sea ahead, the chase behind! Raise the staff — tap the water",
   "de": "Vorne das Meer, hinten die Verfolger! Heb den Stab – tippe aufs Wasser",
   "es": "¡El mar delante, la persecución detrás! Levanta la vara: toca el agua",
   "pt": "O mar à frente, a perseguição atrás! Erga o cajado — toque na água",
   "fr": "La mer devant, la poursuite derrière ! Lève le bâton — touche l’eau",
   "ar": "البحر أمامك والمطاردة خلفك! ارفع العصا — اضغط على الماء"
  },
  "seaPath": {
   "ru": "Море расступилось! Веди народ по сухому дну — нажимай следы по порядку",
   "en": "The sea has parted! Lead the people across the dry seabed — tap the footprints in order",
   "de": "Das Meer hat sich geteilt! Führe das Volk über den trockenen Grund – tippe die Fußspuren der Reihe nach an",
   "es": "¡El mar se abrió! Guía al pueblo por el fondo seco: toca las huellas en orden",
   "pt": "O mar se abriu! Guie o povo pelo fundo seco — toque as pegadas em ordem",
   "fr": "La mer s’est ouverte ! Guide le peuple sur le fond sec — touche les traces dans l’ordre",
   "ar": "انشق البحر! قُد الشعب عبر القاع الجاف — اضغط على الآثار بالترتيب"
  },
  "seaDone": {
   "ru": "Прошли! Море сомкнулось за спиной — народ свободен",
   "en": "They made it! The sea closed behind them — the people are free",
   "de": "Geschafft! Das Meer schloss sich hinter ihnen – das Volk ist frei",
   "es": "¡Lo lograron! El mar se cerró tras ellos: el pueblo es libre",
   "pt": "Conseguiram! O mar se fechou atrás deles — o povo está livre",
   "fr": "Ils sont passés ! La mer s’est refermée derrière eux — le peuple est libre",
   "ar": "عبروا! انطبق البحر خلفهم — الشعب حر"
  },
  "dnPrompt": {
   "ru": "Даниил спокоен и не боится. Пересчитай львов — нажми на каждого",
   "en": "Daniel is calm and unafraid. Count the lions — tap each one",
   "de": "Daniel ist ruhig und furchtlos. Zähle die Löwen – tippe jeden an",
   "es": "Daniel está tranquilo y sin miedo. Cuenta los leones: toca cada uno",
   "pt": "Daniel está calmo e sem medo. Conte os leões — toque em cada um",
   "fr": "Daniel est calme et n’a pas peur. Compte les lions — touche-les un par un",
   "ar": "دانيال هادئ ولا يخاف. عُدَّ الأسود — اضغط على كل واحد"
  },
  "dnHow": {
   "ru": "Сколько львов во рву?",
   "en": "How many lions are in the den?",
   "de": "Wie viele Löwen sind in der Grube?",
   "es": "¿Cuántos leones hay en el foso?",
   "pt": "Quantos leões há na cova?",
   "fr": "Combien de lions dans la fosse ?",
   "ar": "كم أسدًا في الجب؟"
  },
  "dnDone": {
   "ru": "Львы мирно уснули — Даниил цел и невредим!",
   "en": "The lions fell peacefully asleep — Daniel is safe and sound!",
   "de": "Die Löwen schliefen friedlich ein – Daniel ist heil und unversehrt!",
   "es": "Los leones se durmieron en paz: ¡Daniel está sano y salvo!",
   "pt": "Os leões adormeceram em paz — Daniel está são e salvo!",
   "fr": "Les lions se sont endormis paisiblement — Daniel est sain et sauf !",
   "ar": "نامت الأسود بسلام — ودانيال سالم معافى!"
  },
  "esP1": {
   "ru": "Царица Эсфирь узнала: её народу грозит страшная беда. Сказать правду царю страшно — без приглашения к нему входить нельзя. Как поступить?",
   "en": "Queen Esther learned that her people were in terrible danger. Telling the king is frightening — no one may come to him uninvited. What should she do?",
   "de": "Königin Ester erfuhr: Ihrem Volk droht großes Unheil. Dem König die Wahrheit zu sagen ist gefährlich – ungebeten darf niemand zu ihm. Was soll sie tun?",
   "es": "La reina Ester supo que su pueblo corría un gran peligro. Decirle la verdad al rey da miedo: nadie puede entrar sin invitación. ¿Qué hacer?",
   "pt": "A rainha Ester soube que seu povo corria grande perigo. Falar com o rei dá medo — ninguém pode entrar sem ser convidado. O que fazer?",
   "fr": "La reine Esther apprit que son peuple était en grand danger. Parler au roi fait peur — nul ne peut entrer sans invitation. Que faire ?",
   "ar": "علمت الملكة أستير أن شعبها في خطر عظيم. إخبار الملك مخيف — لا يدخل عليه أحد بلا دعوة. فماذا تفعل؟"
  },
  "esO1": {
   "ru": "Промолчать — так безопаснее",
   "en": "Stay silent — it is safer",
   "de": "Schweigen – das ist sicherer",
   "es": "Callar: es más seguro",
   "pt": "Ficar calada — é mais seguro",
   "fr": "Se taire — c’est plus sûr",
   "ar": "تصمت — فهذا أكثر أمانًا"
  },
  "esO2": {
   "ru": "Собраться с духом и пойти к царю",
   "en": "Gather her courage and go to the king",
   "de": "Allen Mut zusammennehmen und zum König gehen",
   "es": "Armarse de valor e ir ante el rey",
   "pt": "Criar coragem e ir até o rei",
   "fr": "Prendre son courage et aller voir le roi",
   "ar": "تتشجع وتذهب إلى الملك"
  },
  "esNo": {
   "ru": "Если промолчать — народ никто не спасёт…",
   "en": "If she stays silent, no one will save her people…",
   "de": "Wenn sie schweigt, rettet niemand ihr Volk…",
   "es": "Si calla, nadie salvará a su pueblo…",
   "pt": "Se ela ficar calada, ninguém salvará o povo…",
   "fr": "Si elle se tait, personne ne sauvera son peuple…",
   "ar": "إن صمتت فلن ينقذ شعبها أحد…"
  },
  "esP2": {
   "ru": "Эсфирь пришла к царю. Царь протянул ей золотой скипетр: «Проси, чего хочешь!» Что попросит Эсфирь?",
   "en": "Esther came to the king. He held out the golden scepter: “Ask whatever you wish!” What will Esther ask for?",
   "de": "Ester trat vor den König. Er reichte ihr das goldene Zepter: „Bitte, was du willst!“ Worum bittet Ester?",
   "es": "Ester llegó ante el rey. Él le tendió el cetro de oro: «¡Pide lo que quieras!». ¿Qué pedirá Ester?",
   "pt": "Ester veio ao rei. Ele estendeu o cetro de ouro: “Peça o que quiser!” O que Ester vai pedir?",
   "fr": "Esther se présenta au roi. Il lui tendit le sceptre d’or : « Demande ce que tu veux ! » Que demandera Esther ?",
   "ar": "جاءت أستير إلى الملك. فمدّ لها الصولجان الذهبي: «اطلبي ما تشائين!» فماذا ستطلب أستير؟"
  },
  "esB1": {
   "ru": "«Спаси мой народ, царь!»",
   "en": "“Save my people, O king!”",
   "de": "„Rette mein Volk, o König!“",
   "es": "«¡Salva a mi pueblo, rey!»",
   "pt": "“Salva o meu povo, ó rei!”",
   "fr": "« Sauve mon peuple, ô roi ! »",
   "ar": "«أنقذ شعبي أيها الملك!»"
  },
  "esB2": {
   "ru": "«Подари мне новые украшения»",
   "en": "“Give me new jewels”",
   "de": "„Schenk mir neuen Schmuck“",
   "es": "«Regálame joyas nuevas»",
   "pt": "“Dá-me joias novas”",
   "fr": "« Offre-moi de nouveaux bijoux »",
   "ar": "«أهدني حليًا جديدة»"
  },
  "esMoral": {
   "ru": "Смелость — это говорить правду, даже когда страшно. Так Эсфирь спасла целый народ!",
   "en": "Courage means telling the truth even when you are afraid. That is how Esther saved a whole people!",
   "de": "Mut heißt, die Wahrheit zu sagen, auch wenn man Angst hat. So rettete Ester ein ganzes Volk!",
   "es": "La valentía es decir la verdad aunque tengas miedo. ¡Así Ester salvó a todo un pueblo!",
   "pt": "Coragem é falar a verdade mesmo com medo. Foi assim que Ester salvou um povo inteiro!",
   "fr": "Le courage, c’est dire la vérité même quand on a peur. C’est ainsi qu’Esther a sauvé tout un peuple !",
   "ar": "الشجاعة أن تقول الحقيقة حتى عندما تخاف. هكذا أنقذت أستير شعبًا بأكمله!"
  },
  "bsP1": {
   "ru": "Куст горит огнём — и не сгорает! Моисей подошёл ближе. Что сделать перед святым местом?",
   "en": "The bush is on fire — yet it does not burn up! Moses came closer. What should he do before this holy place?",
   "de": "Der Busch brennt – und verbrennt doch nicht! Mose trat näher. Was tut man vor einem heiligen Ort?",
   "es": "¡La zarza arde y no se consume! Moisés se acercó. ¿Qué hacer ante un lugar santo?",
   "pt": "A sarça arde em fogo — e não se queima! Moisés chegou mais perto. O que fazer diante do lugar santo?",
   "fr": "Le buisson brûle — sans se consumer ! Moïse s’approcha. Que faire devant un lieu saint ?",
   "ar": "العلّيقة تشتعل بالنار — ولا تحترق! اقترب موسى. ماذا يفعل أمام المكان المقدس؟"
  },
  "bsO1": {
   "ru": "Снять сандалии — место святое",
   "en": "Take off his sandals — this place is holy",
   "de": "Die Sandalen ausziehen – der Ort ist heilig",
   "es": "Quitarse las sandalias: el lugar es santo",
   "pt": "Tirar as sandálias — o lugar é santo",
   "fr": "Retirer ses sandales — le lieu est saint",
   "ar": "يخلع نعليه — فالمكان مقدّس"
  },
  "bsO2": {
   "ru": "Потушить огонь водой",
   "en": "Put out the fire with water",
   "de": "Das Feuer mit Wasser löschen",
   "es": "Apagar el fuego con agua",
   "pt": "Apagar o fogo com água",
   "fr": "Éteindre le feu avec de l’eau",
   "ar": "يطفئ النار بالماء"
  },
  "bsO3": {
   "ru": "Пройти мимо",
   "en": "Walk on by",
   "de": "Einfach vorbeigehen",
   "es": "Pasar de largo",
   "pt": "Passar direto",
   "fr": "Passer son chemin",
   "ar": "يمرّ دون توقف"
  },
  "bsNo": {
   "ru": "Смотри: куст горит и не сгорает. Это не пожар — это чудо!",
   "en": "Look: the bush burns but is not burned up. This is no fire to fight — it is a miracle!",
   "de": "Schau: Der Busch brennt und verbrennt nicht. Das ist kein Brand – das ist ein Wunder!",
   "es": "Mira: la zarza arde y no se consume. No es un incendio, ¡es un milagro!",
   "pt": "Veja: a sarça arde e não se queima. Não é um incêndio — é um milagre!",
   "fr": "Regarde : le buisson brûle sans se consumer. Ce n’est pas un incendie — c’est un miracle !",
   "ar": "انظر: العلّيقة تشتعل ولا تحترق. هذه ليست نارًا عادية — إنها معجزة!"
  },
  "bsP2": {
   "ru": "Голос из куста сказал: «Иди — выведи мой народ на свободу!» Моисей испугался: «А вдруг я не смогу?..» И услышал в ответ:",
   "en": "A voice from the bush said, “Go — lead my people to freedom!” Moses was afraid: “What if I cannot?..” And he heard the answer:",
   "de": "Eine Stimme aus dem Busch sprach: „Geh – führe mein Volk in die Freiheit!“ Mose bekam Angst: „Und wenn ich es nicht kann?..“ Da hörte er die Antwort:",
   "es": "Una voz salió de la zarza: «¡Ve y lleva a mi pueblo a la libertad!». Moisés se asustó: «¿Y si no puedo?...». Y oyó la respuesta:",
   "pt": "Uma voz saiu da sarça: “Vá — leve o meu povo para a liberdade!” Moisés teve medo: “E se eu não conseguir?..” E ouviu a resposta:",
   "fr": "Une voix sortit du buisson : « Va — conduis mon peuple vers la liberté ! » Moïse eut peur : « Et si je n’y arrive pas ?.. » Et il entendit la réponse :",
   "ar": "قال صوت من العلّيقة: «اذهب — أخرِج شعبي إلى الحرية!» خاف موسى: «وماذا لو لم أستطع؟…» فسمع الجواب:"
  },
  "bsA": {
   "ru": "«Не бойся. Я буду с тобой»",
   "en": "“Do not be afraid. I will be with you”",
   "de": "„Fürchte dich nicht. Ich werde mit dir sein“",
   "es": "«No temas. Yo estaré contigo»",
   "pt": "“Não tenha medo. Eu estarei com você”",
   "fr": "« N’aie pas peur. Je serai avec toi »",
   "ar": "«لا تخف. سأكون معك»"
  },
  "edPrompt": {
   "ru": "Адам даёт имена животным. Нажми зверя, потом его имя",
   "en": "Adam names the animals. Tap an animal, then its name",
   "de": "Adam gibt den Tieren Namen. Tippe auf ein Tier, dann auf seinen Namen",
   "es": "Adán pone nombre a los animales. Toca un animal y luego su nombre",
   "pt": "Adão dá nomes aos animais. Toque num animal e depois no nome dele",
   "fr": "Adam donne un nom aux animaux. Touche un animal, puis son nom",
   "ar": "آدم يسمّي الحيوانات. اضغط على الحيوان ثم على اسمه"
  },
  "edDone": {
   "ru": "Теперь у каждого зверя есть своё имя!",
   "en": "Now every animal has its own name!",
   "de": "Jetzt hat jedes Tier seinen eigenen Namen!",
   "es": "¡Ahora cada animal tiene su nombre!",
   "pt": "Agora cada animal tem o seu nome!",
   "fr": "Maintenant, chaque animal a son nom !",
   "ar": "الآن لكل حيوان اسمه الخاص!"
  },
  "edA1": {
   "ru": "Слон",
   "en": "Elephant",
   "de": "Elefant",
   "es": "Elefante",
   "pt": "Elefante",
   "fr": "Éléphant",
   "ar": "فيل"
  },
  "edA2": {
   "ru": "Лев",
   "en": "Lion",
   "de": "Löwe",
   "es": "León",
   "pt": "Leão",
   "fr": "Lion",
   "ar": "أسد"
  },
  "edA3": {
   "ru": "Жираф",
   "en": "Giraffe",
   "de": "Giraffe",
   "es": "Jirafa",
   "pt": "Girafa",
   "fr": "Girafe",
   "ar": "زرافة"
  },
  "edA4": {
   "ru": "Голубь",
   "en": "Dove",
   "de": "Taube",
   "es": "Paloma",
   "pt": "Pomba",
   "fr": "Colombe",
   "ar": "حمامة"
  },
  "edA5": {
   "ru": "Кролик",
   "en": "Rabbit",
   "de": "Kaninchen",
   "es": "Conejo",
   "pt": "Coelho",
   "fr": "Lapin",
   "ar": "أرنب"
  },
  "bbPrompt": {
   "ru": "Строим башню до самого неба! Нажимай кнопку стройки",
   "en": "Build the tower up to the sky! Tap the building button",
   "de": "Bau den Turm bis zum Himmel! Tippe auf den Bau-Knopf",
   "es": "¡Construye la torre hasta el cielo! Pulsa el botón de obra",
   "pt": "Construa a torre até o céu! Aperte o botão da obra",
   "fr": "Construis la tour jusqu’au ciel ! Appuie sur le bouton du chantier",
   "ar": "ابنِ البرج حتى السماء! اضغط زر البناء"
  },
  "bbMix": {
   "ru": "Вдруг все заговорили на разных языках! Найди кнопку на ТВОЁМ языке",
   "en": "Suddenly everyone speaks different languages! Find the button in YOUR language",
   "de": "Plötzlich sprechen alle verschiedene Sprachen! Finde den Knopf in DEINER Sprache",
   "es": "¡De pronto todos hablan idiomas distintos! Busca el botón en TU idioma",
   "pt": "De repente todos falam línguas diferentes! Ache o botão na SUA língua",
   "fr": "Soudain, tout le monde parle des langues différentes ! Trouve le bouton dans TA langue",
   "ar": "فجأة صار الجميع يتكلمون لغات مختلفة! جِد الزر بلغتك أنت"
  },
  "bbEnd": {
   "ru": "Никто никого не понял — стройка остановилась, а люди разошлись по всей земле. Так появились разные языки!",
   "en": "No one understood anyone — the building stopped, and the people spread across the whole earth. That is how different languages began!",
   "de": "Keiner verstand den anderen – der Bau stoppte, und die Menschen zogen über die ganze Erde. So entstanden die verschiedenen Sprachen!",
   "es": "Nadie entendía a nadie: la obra se detuvo y la gente se dispersó por toda la tierra. ¡Así nacieron los idiomas!",
   "pt": "Ninguém entendia ninguém — a obra parou e as pessoas se espalharam pela terra toda. Foi assim que surgiram as línguas!",
   "fr": "Personne ne se comprenait — le chantier s’est arrêté et les hommes se sont dispersés sur toute la terre. Voilà comment sont nées les langues !",
   "ar": "لم يفهم أحد أحدًا — توقف البناء وتفرق الناس في كل الأرض. هكذا ظهرت اللغات المختلفة!"
  },
  "llPrompt": {
   "ru": "Зажги лестницу от земли до неба — ступенька за ступенькой, снизу вверх",
   "en": "Light up the ladder from earth to heaven — step by step, from the bottom up",
   "de": "Lass die Leiter von der Erde bis zum Himmel leuchten – Stufe für Stufe, von unten nach oben",
   "es": "Enciende la escalera de la tierra al cielo, peldaño a peldaño, de abajo arriba",
   "pt": "Acenda a escada da terra ao céu — degrau por degrau, de baixo para cima",
   "fr": "Allume l’échelle de la terre au ciel — barreau par barreau, de bas en haut",
   "ar": "أضئ السلم من الأرض إلى السماء — درجة درجة من الأسفل إلى الأعلى"
  },
  "llDone": {
   "ru": "«Я с тобой, куда бы ты ни пошёл!» — услышал Иаков во сне",
   "en": "“I am with you wherever you go!” Jacob heard in his dream",
   "de": "„Ich bin bei dir, wohin du auch gehst!“, hörte Jakob im Traum",
   "es": "«¡Estoy contigo adonde vayas!», oyó Jacob en su sueño",
   "pt": "“Estou com você aonde quer que vá!” — ouviu Jacó no sonho",
   "fr": "« Je suis avec toi partout où tu iras ! » entendit Jacob dans son rêve",
   "ar": "«أنا معك أينما ذهبت!» سمع يعقوب في حلمه"
  },
  "ctPrompt": {
   "ru": "Раскрась одежду Иосифа во все цвета: выбери цвет, потом полосу",
   "en": "Color Joseph's coat in every color: pick a color, then a stripe",
   "de": "Mal Josefs Gewand in allen Farben aus: Wähle eine Farbe, dann einen Streifen",
   "es": "Colorea la túnica de José con todos los colores: elige un color y luego una franja",
   "pt": "Pinte a túnica de José com todas as cores: escolha uma cor e depois uma listra",
   "fr": "Colorie l’habit de Joseph de toutes les couleurs : choisis une couleur, puis une bande",
   "ar": "لوِّن ثوب يوسف بكل الألوان: اختر لونًا ثم اختر شريطًا"
  },
  "ctDone": {
   "ru": "Вот это красота — ни у кого такой одежды нет!",
   "en": "How beautiful — no one else has a coat like this!",
   "de": "Wie schön – so ein Gewand hat sonst niemand!",
   "es": "¡Qué belleza! ¡Nadie tiene una túnica así!",
   "pt": "Que beleza — ninguém tem uma túnica assim!",
   "fr": "Quelle merveille — personne n’a un habit pareil !",
   "ar": "يا للجمال — لا أحد يملك ثوبًا مثله!"
  },
  "bkPrompt": {
   "ru": "Проведи корзинку по Нилу — нажимай камыши по порядку. Мириам следит с берега",
   "en": "Guide the basket down the Nile — tap the reeds in order. Miriam watches from the bank",
   "de": "Führe das Körbchen den Nil hinab – tippe das Schilf der Reihe nach an. Mirjam wacht am Ufer",
   "es": "Guía la cestita por el Nilo: toca los juncos en orden. Miriam vigila desde la orilla",
   "pt": "Guie a cestinha pelo Nilo — toque os juncos em ordem. Miriã vigia da margem",
   "fr": "Guide le panier sur le Nil — touche les roseaux dans l’ordre. Miriam veille depuis la rive",
   "ar": "قُد السلة عبر النيل — اضغط على القصب بالترتيب. مريم تراقب من الشاطئ"
  },
  "bkDone": {
   "ru": "Царевна нашла малыша! А смелая Мириам предложила позвать няню — родную маму",
   "en": "The princess found the baby! And brave Miriam offered to fetch a nurse — his own mother",
   "de": "Die Prinzessin fand das Baby! Und die mutige Mirjam schlug eine Amme vor – seine eigene Mama",
   "es": "¡La princesa encontró al bebé! Y la valiente Miriam ofreció llamar a una niñera: su propia mamá",
   "pt": "A princesa achou o bebê! E a corajosa Miriã ofereceu chamar uma babá — a própria mãe dele",
   "fr": "La princesse a trouvé le bébé ! Et la courageuse Miriam a proposé une nourrice — sa propre maman",
   "ar": "وجدت الأميرة الطفل! واقترحت مريم الشجاعة مرضعة له — أمه نفسها"
  },
  "tmPrompt": {
   "ru": "Из чего строили Храм? Выбери три правильных материала",
   "en": "What was the Temple built from? Pick the three right materials",
   "de": "Woraus wurde der Tempel gebaut? Wähle die drei richtigen Baustoffe",
   "es": "¿Con qué se construyó el Templo? Elige los tres materiales correctos",
   "pt": "Do que o Templo foi construído? Escolha os três materiais certos",
   "fr": "Avec quoi le Temple a-t-il été bâti ? Choisis les trois bons matériaux",
   "ar": "ممَّ بُني الهيكل؟ اختر المواد الثلاث الصحيحة"
  },
  "tmNo": {
   "ru": "Из этого крепкий Храм не построишь!",
   "en": "You can't build a mighty Temple out of that!",
   "de": "Daraus baut man keinen mächtigen Tempel!",
   "es": "¡Con eso no se construye un Templo fuerte!",
   "pt": "Com isso não se constrói um Templo forte!",
   "fr": "On ne bâtit pas un grand Temple avec ça !",
   "ar": "لا يُبنى هيكل عظيم من هذا!"
  },
  "tmDone": {
   "ru": "Кедр, камень и золото — Храм сиял на весь Иерусалим!",
   "en": "Cedar, stone and gold — the Temple shone over all Jerusalem!",
   "de": "Zedernholz, Stein und Gold – der Tempel strahlte über ganz Jerusalem!",
   "es": "Cedro, piedra y oro: ¡el Templo brillaba sobre toda Jerusalén!",
   "pt": "Cedro, pedra e ouro — o Templo brilhava sobre toda Jerusalém!",
   "fr": "Cèdre, pierre et or — le Temple brillait sur tout Jérusalem !",
   "ar": "أرز وحجر وذهب — كان الهيكل يتلألأ على كل أورشليم!"
  },
  "tmM1": {
   "ru": "Кедровое дерево",
   "en": "Cedar wood",
   "de": "Zedernholz",
   "es": "Madera de cedro",
   "pt": "Madeira de cedro",
   "fr": "Bois de cèdre",
   "ar": "خشب الأرز"
  },
  "tmM2": {
   "ru": "Тёсаный камень",
   "en": "Cut stone",
   "de": "Behauener Stein",
   "es": "Piedra tallada",
   "pt": "Pedra lavrada",
   "fr": "Pierre taillée",
   "ar": "حجر منحوت"
  },
  "tmM3": {
   "ru": "Золото",
   "en": "Gold",
   "de": "Gold",
   "es": "Oro",
   "pt": "Ouro",
   "fr": "Or",
   "ar": "ذهب"
  },
  "tmM4": {
   "ru": "Солома",
   "en": "Straw",
   "de": "Stroh",
   "es": "Paja",
   "pt": "Palha",
   "fr": "Paille",
   "ar": "قش"
  },
  "tmM5": {
   "ru": "Лёд",
   "en": "Ice",
   "de": "Eis",
   "es": "Hielo",
   "pt": "Gelo",
   "fr": "Glace",
   "ar": "جليد"
  },
  "tmM6": {
   "ru": "Бумага",
   "en": "Paper",
   "de": "Papier",
   "es": "Papel",
   "pt": "Papel",
   "fr": "Papier",
   "ar": "ورق"
  },
  "pTitle": {
   "ru": "Для родителей",
   "en": "For parents",
   "de": "Für Eltern",
   "es": "Para padres",
   "pt": "Para os pais",
   "fr": "Pour les parents",
   "ar": "للوالدين"
  },
  "pLock": {
   "ru": "Только для взрослых. Реши пример, чтобы войти",
   "en": "Adults only. Solve the problem to enter",
   "de": "Nur für Erwachsene. Löse die Aufgabe, um hineinzukommen",
   "es": "Solo para adultos. Resuelve la operación para entrar",
   "pt": "Só para adultos. Resolva a conta para entrar",
   "fr": "Réservé aux adultes. Résous l’opération pour entrer",
   "ar": "للكبار فقط. حُلّ المسألة للدخول"
  },
  "pEnter": {
   "ru": "Войти",
   "en": "Enter",
   "de": "Eintreten",
   "es": "Entrar",
   "pt": "Entrar",
   "fr": "Entrer",
   "ar": "دخول"
  },
  "pWrong": {
   "ru": "Не сходится, попробуй ещё",
   "en": "That's not right, try again",
   "de": "Stimmt nicht, versuch es noch mal",
   "es": "No cuadra, inténtalo otra vez",
   "pt": "Não bate, tente de novo",
   "fr": "Ce n’est pas ça, réessaie",
   "ar": "غير صحيح، حاول مرة أخرى"
  },
  "pByEra": {
   "ru": "Прогресс по эпохам",
   "en": "Progress by era",
   "de": "Fortschritt nach Epochen",
   "es": "Progreso por épocas",
   "pt": "Progresso por épocas",
   "fr": "Progression par époque",
   "ar": "التقدم حسب الحقب"
  },
  "pRewards": {
   "ru": "Награды",
   "en": "Rewards",
   "de": "Belohnungen",
   "es": "Premios",
   "pt": "Recompensas",
   "fr": "Récompenses",
   "ar": "الجوائز"
  },
  "pStars": {
   "ru": "Звёзд заработано",
   "en": "Stars earned",
   "de": "Sterne verdient",
   "es": "Estrellas ganadas",
   "pt": "Estrelas ganhas",
   "fr": "Étoiles gagnées",
   "ar": "النجوم المكتسبة"
  },
  "pCards": {
   "ru": "Карт собрано",
   "en": "Cards collected",
   "de": "Karten gesammelt",
   "es": "Cartas conseguidas",
   "pt": "Cartas coletadas",
   "fr": "Cartes obtenues",
   "ar": "البطاقات المجموعة"
  },
  "pMedals": {
   "ru": "Медалей эпох",
   "en": "Era medals",
   "de": "Epochen-Medaillen",
   "es": "Medallas de épocas",
   "pt": "Medalhas de épocas",
   "fr": "Médailles d’époques",
   "ar": "ميداليات الحقب"
  },
  "pGrand": {
   "ru": "Супер-приз",
   "en": "Grand prize",
   "de": "Hauptpreis",
   "es": "Gran premio",
   "pt": "Grande prêmio",
   "fr": "Grand prix",
   "ar": "الجائزة الكبرى"
  },
  "pYes": {
   "ru": "получен",
   "en": "earned",
   "de": "erhalten",
   "es": "conseguido",
   "pt": "conquistado",
   "fr": "obtenu",
   "ar": "تم الحصول عليها"
  },
  "pNot": {
   "ru": "пока нет",
   "en": "not yet",
   "de": "noch nicht",
   "es": "todavía no",
   "pt": "ainda não",
   "fr": "pas encore",
   "ar": "ليس بعد"
  },
  "pDiary": {
   "ru": "Дневник успехов",
   "en": "Progress diary",
   "de": "Erfolgstagebuch",
   "es": "Diario de logros",
   "pt": "Diário de conquistas",
   "fr": "Journal des réussites",
   "ar": "دفتر الإنجازات"
  },
  "pDiaryEmpty": {
   "ru": "Пока пусто — всё впереди!",
   "en": "Nothing yet — it's all ahead!",
   "de": "Noch leer – alles liegt noch vor euch!",
   "es": "Aún vacío: ¡todo está por venir!",
   "pt": "Ainda vazio — tudo está por vir!",
   "fr": "Encore vide — tout est à venir !",
   "ar": "فارغ حتى الآن — كل شيء قادم!"
  },
  "pFirstTry": {
   "ru": "с первой попытки",
   "en": "on the first try",
   "de": "beim ersten Versuch",
   "es": "al primer intento",
   "pt": "na primeira tentativa",
   "fr": "du premier coup",
   "ar": "من المحاولة الأولى"
  },
  "pSettings": {
   "ru": "Настройки",
   "en": "Settings",
   "de": "Einstellungen",
   "es": "Ajustes",
   "pt": "Configurações",
   "fr": "Réglages",
   "ar": "الإعدادات"
  },
  "pSound": {
   "ru": "Звуки праздника (фанфары)",
   "en": "Celebration sounds (fanfares)",
   "de": "Festklänge (Fanfaren)",
   "es": "Sonidos de fiesta (fanfarrias)",
   "pt": "Sons de festa (fanfarras)",
   "fr": "Sons de fête (fanfares)",
   "ar": "أصوات الاحتفال"
  },
  "pOn": {
   "ru": "Вкл",
   "en": "On",
   "de": "An",
   "es": "Sí",
   "pt": "Lig.",
   "fr": "Oui",
   "ar": "تشغيل"
  },
  "pOff": {
   "ru": "Выкл",
   "en": "Off",
   "de": "Aus",
   "es": "No",
   "pt": "Desl.",
   "fr": "Non",
   "ar": "إيقاف"
  },
  "pReset": {
   "ru": "Сбросить прогресс",
   "en": "Reset progress",
   "de": "Fortschritt zurücksetzen",
   "es": "Reiniciar el progreso",
   "pt": "Zerar o progresso",
   "fr": "Réinitialiser la progression",
   "ar": "إعادة تعيين التقدم"
  },
  "pResetQ": {
   "ru": "Сбросить весь прогресс игры?",
   "en": "Reset all game progress?",
   "de": "Den gesamten Spielfortschritt zurücksetzen?",
   "es": "¿Reiniciar todo el progreso del juego?",
   "pt": "Zerar todo o progresso do jogo?",
   "fr": "Réinitialiser toute la progression du jeu ?",
   "ar": "إعادة تعيين كل تقدم اللعبة؟"
  },
  "dCard": {
   "ru": "Карта дня",
   "en": "Card of the day",
   "de": "Karte des Tages",
   "es": "Carta del día",
   "pt": "Carta do dia",
   "fr": "Carte du jour",
   "ar": "بطاقة اليوم"
  },
  "dStreak": {
   "ru": "Дней подряд",
   "en": "Day streak",
   "de": "Tage in Folge",
   "es": "Días seguidos",
   "pt": "Dias seguidos",
   "fr": "Jours de suite",
   "ar": "أيام متتالية"
  },
  "dOpen": {
   "ru": "Открыть",
   "en": "Open",
   "de": "Öffnen",
   "es": "Abrir",
   "pt": "Abrir",
   "fr": "Ouvrir",
   "ar": "افتح"
  },
  "dInEra": {
   "ru": "Ждёт тебя в эпохе",
   "en": "Waiting for you in the era",
   "de": "Wartet auf dich in der Epoche",
   "es": "Te espera en la época",
   "pt": "Espera por você na época",
   "fr": "T’attend dans l’époque",
   "ar": "تنتظرك في حقبة"
  },
  "rankT": {
   "ru": "Звание",
   "en": "Rank",
   "de": "Rang",
   "es": "Rango",
   "pt": "Título",
   "fr": "Rang",
   "ar": "الرتبة"
  },
  "rank1": {
   "ru": "Путник",
   "en": "Wanderer",
   "de": "Wanderer",
   "es": "Caminante",
   "pt": "Viajante",
   "fr": "Voyageur",
   "ar": "مسافر"
  },
  "rank2": {
   "ru": "Ученик",
   "en": "Learner",
   "de": "Schüler",
   "es": "Aprendiz",
   "pt": "Aprendiz",
   "fr": "Apprenti",
   "ar": "تلميذ"
  },
  "rank3": {
   "ru": "Следопыт",
   "en": "Pathfinder",
   "de": "Pfadfinder",
   "es": "Explorador",
   "pt": "Explorador",
   "fr": "Éclaireur",
   "ar": "مستكشف"
  },
  "rank4": {
   "ru": "Знаток историй",
   "en": "Story expert",
   "de": "Geschichten-Kenner",
   "es": "Experto en historias",
   "pt": "Conhecedor de histórias",
   "fr": "Expert des histoires",
   "ar": "خبير القصص"
  },
  "rank5": {
   "ru": "Знаток великих историй",
   "en": "Master of the Great Stories",
   "de": "Kenner der großen Geschichten",
   "es": "Experto en las grandes historias",
   "pt": "Mestre das grandes histórias",
   "fr": "Expert des grandes histoires",
   "ar": "عالِم القصص العظيمة"
  },
  "pFamily": {
   "ru": "Вопрос для разговора всей семьёй",
   "en": "A question to talk about as a family",
   "de": "Eine Frage zum Familiengespräch",
   "es": "Una pregunta para conversar en familia",
   "pt": "Uma pergunta para conversar em família",
   "fr": "Une question à discuter en famille",
   "ar": "سؤال للحديث مع كل العائلة"
  },
  "pPrint": {
   "ru": "Распечатать грамоту",
   "en": "Print the certificate",
   "de": "Urkunde drucken",
   "es": "Imprimir el diploma",
   "pt": "Imprimir o diploma",
   "fr": "Imprimer le diplôme",
   "ar": "اطبع الشهادة"
  },
  "skName": {
   "ru": "Имя",
   "en": "Name",
   "de": "Name",
   "es": "Nombre",
   "pt": "Nome",
   "fr": "Nom",
   "ar": "الاسم"
  },
  "skEra": {
   "ru": "Эпоха",
   "en": "Era",
   "de": "Epoche",
   "es": "Época",
   "pt": "Época",
   "fr": "Époque",
   "ar": "الحقبة"
  },
  "skPair": {
   "ru": "Пара",
   "en": "Pair",
   "de": "Paar",
   "es": "Pareja",
   "pt": "Par",
   "fr": "Paire",
   "ar": "الزوج"
  },
  "skDigit": {
   "ru": "Число",
   "en": "Number",
   "de": "Zahl",
   "es": "Número",
   "pt": "Número",
   "fr": "Nombre",
   "ar": "الرقم"
  },
  "skFind": {
   "ru": "Найди",
   "en": "Find",
   "de": "Finde",
   "es": "Busca",
   "pt": "Ache",
   "fr": "Trouve",
   "ar": "جِد"
  },
  "skListen": {
   "ru": "Слух",
   "en": "Listen",
   "de": "Hören",
   "es": "Oído",
   "pt": "Ouvir",
   "fr": "Écoute",
   "ar": "السمع"
  },
  "skEraQ": {
   "ru": "К какой эпохе относится эта карта?",
   "en": "Which era does this card belong to?",
   "de": "Zu welcher Epoche gehört diese Karte?",
   "es": "¿A qué época pertenece esta carta?",
   "pt": "A qual época pertence esta carta?",
   "fr": "À quelle époque appartient cette carte ?",
   "ar": "إلى أي حقبة تنتمي هذه البطاقة؟"
  },
  "trainBtn": {
   "ru": "Тренировка карты",
   "en": "Train this card",
   "de": "Karte üben",
   "es": "Entrenar la carta",
   "pt": "Treinar a carta",
   "fr": "Entraîner la carte",
   "ar": "تدريب البطاقة"
  },
  "learned": {
   "ru": "Выучено",
   "en": "Learned",
   "de": "Gelernt",
   "es": "Aprendida",
   "pt": "Aprendida",
   "fr": "Apprise",
   "ar": "محفوظة"
  },
  "mastered": {
   "ru": "Освоено!",
   "en": "Mastered!",
   "de": "Gemeistert!",
   "es": "¡Dominada!",
   "pt": "Dominada!",
   "fr": "Maîtrisée !",
   "ar": "أُتقنت!"
  },
  "trainDone": {
   "ru": "Все грани карты пройдены!",
   "en": "Every skill of this card is passed!",
   "de": "Alle Fähigkeiten dieser Karte geschafft!",
   "es": "¡Superaste todas las destrezas de la carta!",
   "pt": "Você passou todas as habilidades da carta!",
   "fr": "Toutes les facettes de la carte sont réussies !",
   "ar": "أنجزت كل مهارات هذه البطاقة!"
  },
  "pBySkill": {
   "ru": "Прогресс по навыкам",
   "en": "Progress by skill",
   "de": "Fortschritt nach Fähigkeit",
   "es": "Progreso por destreza",
   "pt": "Progresso por habilidade",
   "fr": "Progression par compétence",
   "ar": "التقدم حسب المهارة"
  },
  "pMastered": {
   "ru": "Карт освоено",
   "en": "Cards mastered",
   "de": "Karten gemeistert",
   "es": "Cartas dominadas",
   "pt": "Cartas dominadas",
   "fr": "Cartes maîtrisées",
   "ar": "البطاقات المُتقنة"
  }
 },
 "eras": [
  {
   "id": 1,
   "color": "#8ecae6",
   "name": {
    "ru": "Начало мира",
    "en": "The Beginning of the World",
    "de": "Der Anfang der Welt",
    "es": "El principio del mundo",
    "pt": "O início do mundo",
    "fr": "Le commencement du monde",
    "ar": "بداية العالم"
   }
  },
  {
   "id": 2,
   "color": "#e9c46a",
   "name": {
    "ru": "Патриархи",
    "en": "The Patriarchs",
    "de": "Die Erzväter",
    "es": "Los patriarcas",
    "pt": "Os patriarcas",
    "fr": "Les patriarches",
    "ar": "الآباء"
   }
  },
  {
   "id": 3,
   "color": "#f4a261",
   "name": {
    "ru": "Египет и Исход",
    "en": "Egypt and the Exodus",
    "de": "Ägypten und der Auszug",
    "es": "Egipto y el Éxodo",
    "pt": "Egito e o Êxodo",
    "fr": "L'Égypte et l'Exode",
    "ar": "مصر والخروج"
   }
  },
  {
   "id": 4,
   "color": "#a7c957",
   "name": {
    "ru": "Новая земля",
    "en": "A New Land",
    "de": "Das neue Land",
    "es": "Una nueva tierra",
    "pt": "A nova terra",
    "fr": "Une nouvelle terre",
    "ar": "أرض جديدة"
   }
  },
  {
   "id": 5,
   "color": "#c9ada7",
   "name": {
    "ru": "Цари",
    "en": "The Kings",
    "de": "Die Könige",
    "es": "Los reyes",
    "pt": "Os reis",
    "fr": "Les rois",
    "ar": "الملوك"
   }
  },
  {
   "id": 6,
   "color": "#b5838d",
   "name": {
    "ru": "Пророки и дальние царства",
    "en": "Prophets and Distant Kingdoms",
    "de": "Propheten und ferne Reiche",
    "es": "Profetas y reinos lejanos",
    "pt": "Profetas e reinos distantes",
    "fr": "Les prophètes et les royaumes lointains",
    "ar": "الأنبياء والممالك البعيدة"
   }
  },
  {
   "id": 7,
   "color": "#ffd166",
   "name": {
    "ru": "Рождество",
    "en": "The Nativity",
    "de": "Weihnachten",
    "es": "La Navidad",
    "pt": "O Natal",
    "fr": "La Nativité",
    "ar": "ميلاد المسيح"
   }
  }
 ],
 "heroes": [
  {
   "id": "heroes_01",
   "slug": "noah",
   "era": 1,
   "pair": "plots_03",
   "audioReady": true,
   "name": {
    "ru": "Ной",
    "en": "Noah",
    "de": "Noah",
    "es": "Noé",
    "pt": "Noé",
    "fr": "Noé",
    "ar": "نوح"
   },
   "epithet": {
    "ru": "Строитель ковчега",
    "en": "Builder of the Ark",
    "de": "Der Erbauer der Arche",
    "es": "El constructor del arca",
    "pt": "O construtor da arca",
    "fr": "Le bâtisseur de l'arche",
    "ar": "بانِي الفلك"
   },
   "facts": {
    "ru": [
     "Ной построил огромный корабль-ковчег из дерева гофер — задолго до того, как увидел первую каплю дождя.",
     "В ковчеге спаслись его семья и пары всех животных. Целый плавучий зоопарк!",
     "Когда воды сошли, в небе появилась радуга — знак, что такой потоп больше не повторится."
    ],
    "en": [
     "Noah built a huge ark out of gopher wood — long before the very first drop of rain fell.",
     "His family and pairs of every animal were saved inside the ark. A whole floating zoo!",
     "When the waters went down, a rainbow appeared in the sky — a sign that such a flood would never happen again."
    ],
    "de": [
     "Noah baute ein riesiges Schiff, die Arche, aus Zypressenholz – lange bevor er den ersten Regentropfen sah.",
     "In der Arche waren seine Familie und je zwei von jedem Tier gerettet. Ein ganzer schwimmender Zoo!",
     "Als das Wasser zurückging, erschien am Himmel ein Regenbogen – ein Zeichen, dass eine solche Flut nie wiederkehren würde."
    ],
    "es": [
     "Noé construyó un enorme barco, el arca, con madera de ciprés, mucho antes de que cayera la primera gota de lluvia.",
     "En el arca se salvaron su familia y parejas de todos los animales. ¡Todo un zoológico flotante!",
     "Cuando las aguas bajaron, apareció un arcoíris en el cielo: una señal de que un diluvio así no volvería a ocurrir."
    ],
    "pt": [
     "Noé construiu um enorme barco, a arca, com madeira de gofer — muito antes de ver a primeira gota de chuva.",
     "Na arca se salvaram sua família e um par de cada animal. Um verdadeiro zoológico flutuante!",
     "Quando as águas baixaram, um arco-íris apareceu no céu — sinal de que um dilúvio assim nunca mais aconteceria."
    ],
    "fr": [
     "Noé construisit un immense bateau, l'arche, en bois de gopher — bien avant de voir la première goutte de pluie.",
     "Dans l'arche furent sauvés sa famille et un couple de chaque animal. Tout un zoo flottant !",
     "Quand les eaux se retirèrent, un arc-en-ciel apparut dans le ciel — signe qu'un tel déluge ne se reproduirait plus jamais."
    ],
    "ar": [
     "بنى نوح سفينة ضخمة من خشب الجُفر — قبل أن يرى قطرة مطر واحدة.",
     "نجت في الفلك عائلته وأزواج من كل الحيوانات. حديقة حيوانات كاملة تطفو على الماء!",
     "وعندما انحسرت المياه، ظهر قوس قزح في السماء — علامة على ألا يحدث طوفان كهذا مرة أخرى."
    ]
   },
   "digit": {
    "num": "40",
    "label": {
     "ru": "дней и ночей шёл дождь, а ковчег был готов заранее",
     "en": "days and nights the rain fell, but the ark was ready ahead of time",
     "de": "Tage und Nächte regnete es, doch die Arche war längst fertig",
     "es": "días y noches llovió, pero el arca ya estaba lista",
     "pt": "dias e noites choveu, mas a arca já estava pronta",
     "fr": "jours et nuits de pluie, alors que l'arche était déjà prête",
     "ar": "يومًا وليلة هطل المطر، وكان الفلك جاهزًا قبل أن يبدأ"
    }
   },
   "think": {
    "ru": "Соседи смеялись над Ноем, а он продолжал строить. Почему важно доделывать начатое?",
    "en": "The neighbors laughed at Noah, but he kept on building. Why is it important to finish what you start?",
    "de": "Die Nachbarn lachten über Noah, doch er baute einfach weiter. Warum ist es wichtig, das Begonnene zu Ende zu bringen?",
    "es": "Los vecinos se reían de Noé, pero él seguía construyendo. ¿Por qué es importante terminar lo que empezamos?",
    "pt": "Os vizinhos riam de Noé, mas ele continuava construindo. Por que é importante terminar o que começamos?",
    "fr": "Les voisins se moquaient de Noé, mais il continuait à construire. Pourquoi est-ce important de finir ce qu'on a commencé ?",
    "ar": "كان الجيران يسخرون من نوح، وهو يواصل البناء. لماذا من المهم أن نُتمّ ما نبدأه؟"
   },
   "poster": true,
   "book": "noev-kovcheg"
  },
  {
   "id": "heroes_02",
   "slug": "abraham",
   "era": 2,
   "pair": null,
   "audioReady": true,
   "name": {
    "ru": "Авраам",
    "en": "Abraham",
    "de": "Abraham",
    "es": "Abraham",
    "pt": "Abraão",
    "fr": "Abraham",
    "ar": "إبراهيم"
   },
   "epithet": {
    "ru": "Отец народов",
    "en": "Father of Nations",
    "de": "Vater der Völker",
    "es": "Padre de naciones",
    "pt": "Pai de nações",
    "fr": "Le père des peuples",
    "ar": "أبو الشعوب"
   },
   "facts": {
    "ru": [
     "Авраам отправился в далёкую неизвестную страну, взяв с собой всю семью, шатры и стада.",
     "Ему было обещано потомков больше, чем звёзд на небе, — попробуй-ка их сосчитать!",
     "Авраама почитают сразу три мировые традиции: иудейская, христианская и мусульманская."
    ],
    "en": [
     "Abraham set off for a distant, unknown land, taking his whole family, tents, and flocks with him.",
     "He was promised more descendants than there are stars in the sky — just try counting them!",
     "Abraham is honored by three great traditions: Jewish, Christian, and Muslim."
    ],
    "de": [
     "Abraham zog in ein fernes, unbekanntes Land, mit seiner ganzen Familie, seinen Zelten und Herden.",
     "Ihm wurden mehr Nachkommen versprochen, als es Sterne am Himmel gibt – versuch die mal zu zählen!",
     "Abraham wird gleich von drei Weltreligionen verehrt: dem Judentum, dem Christentum und dem Islam."
    ],
    "es": [
     "Abraham partió hacia una tierra lejana y desconocida, llevando consigo a toda su familia, sus tiendas y sus rebaños.",
     "Le prometieron más descendientes que estrellas hay en el cielo. ¡A ver quién las cuenta!",
     "A Abraham lo honran tres grandes tradiciones del mundo: la judía, la cristiana y la musulmana."
    ],
    "pt": [
     "Abraão partiu para uma terra distante e desconhecida, levando toda a família, as tendas e os rebanhos.",
     "Prometeram-lhe mais descendentes do que estrelas no céu — pode tentar contá-las!",
     "Abraão é honrado por três grandes tradições do mundo: a judaica, a cristã e a muçulmana."
    ],
    "fr": [
     "Abraham partit vers un pays lointain et inconnu, emmenant avec lui toute sa famille, ses tentes et ses troupeaux.",
     "On lui promit plus de descendants que d'étoiles dans le ciel — essaie donc de les compter !",
     "Abraham est honoré par trois grandes traditions : juive, chrétienne et musulmane."
    ],
    "ar": [
     "انطلق إبراهيم إلى أرض بعيدة مجهولة، حاملاً معه عائلته وخيامه وقطعانه.",
     "وُعِد بنسل أكثر من نجوم السماء — جرّب أن تعدّها إن استطعت!",
     "يُكرَّم إبراهيم في ثلاث تقاليد عالمية كبرى: اليهودية والمسيحية والإسلامية."
    ]
   },
   "digit": {
    "num": "3",
    "label": {
     "ru": "мировые традиции почитают Авраама: иудейская, христианская и мусульманская",
     "en": "world traditions honor Abraham: Jewish, Christian, and Muslim",
     "de": "Weltreligionen verehren Abraham: das Judentum, das Christentum und der Islam",
     "es": "tradiciones del mundo honran a Abraham: la judía, la cristiana y la musulmana",
     "pt": "tradições no mundo honram Abraão: a judaica, a cristã e a muçulmana",
     "fr": "traditions dans le monde honorent Abraham : juive, chrétienne et musulmane",
     "ar": "ديانات في العالم تُكرّم إبراهيم: اليهودية والمسيحية والإسلام"
    }
   },
   "think": {
    "ru": "Каково это — отправиться в путь, не зная заранее, куда придёшь?",
    "en": "What is it like to set out on a journey without knowing where you'll end up?",
    "de": "Wie fühlt es sich an, aufzubrechen, ohne vorher zu wissen, wo man ankommt?",
    "es": "¿Cómo se sentirá emprender un viaje sin saber a dónde vas a llegar?",
    "pt": "Como deve ser partir em viagem sem saber aonde vai chegar?",
    "fr": "Que ressent-on quand on part en voyage sans savoir où l'on arrivera ?",
    "ar": "كيف يكون شعورك لو سافرت دون أن تعرف إلى أين ستصل؟"
   },
   "poster": true
  },
  {
   "id": "heroes_03",
   "slug": "sarah",
   "era": 2,
   "pair": null,
   "audioReady": true,
   "name": {
    "ru": "Сарра",
    "en": "Sarah",
    "de": "Sara",
    "es": "Sara",
    "pt": "Sara",
    "fr": "Sara",
    "ar": "سارة"
   },
   "epithet": {
    "ru": "Смеющаяся мать",
    "en": "The Laughing Mother",
    "de": "Die lachende Mutter",
    "es": "La madre que se rió",
    "pt": "A mãe que riu",
    "fr": "La mère qui a ri",
    "ar": "الأم الضاحكة"
   },
   "facts": {
    "ru": [
     "Сарра стала мамой, когда была уже совсем старенькой, — этого не ожидал никто.",
     "Услышав обещание о сыне, она рассмеялась — и сына назвали Исаак, что значит «смех».",
     "Сарра прошла с Авраамом весь долгий путь: пустыни, Египет и годы жизни в шатрах."
    ],
    "en": [
     "Sarah became a mother when she was already very old — nobody expected that at all.",
     "When she heard the promise of a son, she laughed — so they named him Isaac, which means \"laughter.\"",
     "Sarah walked the whole long road with Abraham: through deserts, into Egypt, and years of life in tents."
    ],
    "de": [
     "Sara wurde Mutter, als sie schon sehr alt war – das hatte niemand erwartet.",
     "Als sie von dem versprochenen Sohn hörte, musste sie lachen – und so nannte man ihn Isaak, was „Lachen“ bedeutet.",
     "Sara ging mit Abraham den ganzen langen Weg mit: durch Wüsten, nach Ägypten und durch viele Jahre im Zelt."
    ],
    "es": [
     "Sara se convirtió en mamá cuando ya era muy ancianita, algo que nadie esperaba.",
     "Al escuchar la promesa de un hijo, se echó a reír, y por eso lo llamaron Isaac, que significa «risa».",
     "Sara acompañó a Abraham en todo el largo camino: por el desierto, hasta Egipto y durante años viviendo en tiendas."
    ],
    "pt": [
     "Sara se tornou mãe quando já era bem velhinha — ninguém esperava por isso.",
     "Ao ouvir a promessa de um filho, ela riu — e o menino foi chamado de Isaque, que significa \"riso\".",
     "Sara caminhou ao lado de Abraão por toda a longa jornada: desertos, o Egito e anos vivendo em tendas."
    ],
    "fr": [
     "Sara devint maman alors qu'elle était déjà très âgée — personne ne s'y attendait.",
     "En entendant la promesse d'un fils, elle éclata de rire — et l'enfant fut nommé Isaac, ce qui veut dire « rire ».",
     "Sara suivit Abraham tout au long du chemin : les déserts, l'Égypte et des années de vie sous la tente."
    ],
    "ar": [
     "أصبحت سارة أمًّا وهي في سنٍّ متقدمة جدًّا — أمرٌ لم يتوقعه أحد.",
     "حين سمعت وعد الابن ضحكت — فسُمّي ابنها إسحاق، ومعنى اسمه «ضحك».",
     "رافقت سارة إبراهيم في رحلته الطويلة كلها: عبر الصحارى، وإلى مصر، وسنوات في الخيام."
    ]
   },
   "digit": {
    "num": "90",
    "label": {
     "ru": "лет было Сарре, когда родился Исаак — а имя его значит «смех»",
     "en": "years old was Sarah when Isaac was born — his name means \"laughter\"",
     "de": "Jahre alt war Sara, als Isaak geboren wurde – sein Name bedeutet „er lacht“",
     "es": "años tenía Sara cuando nació Isaac, cuyo nombre significa «risa»",
     "pt": "anos tinha Sara quando Isaque nasceu — e seu nome significa \"riso\"",
     "fr": "ans avait Sara quand Isaac est né — son nom veut dire « rire »",
     "ar": "سنة كان عمر سارة حين وُلد إسحاق، واسمه يعني «ضحك»"
    }
   },
   "think": {
    "ru": "Сначала Сарра рассмеялась от недоверия, а потом — от счастья. Бывает ли у смеха разный вкус?",
    "en": "First Sarah laughed in disbelief, then in joy. Can laughter taste different ways?",
    "de": "Erst lachte Sara ungläubig, dann vor Freude. Kann Lachen ganz unterschiedlich schmecken?",
    "es": "Primero Sara se rió por incredulidad, y luego por alegría. ¿La risa puede tener distintos sabores?",
    "pt": "Primeiro Sara riu de descrença, depois riu de alegria. Será que o riso tem sabores diferentes?",
    "fr": "Sara a d'abord ri par doute, puis par joie. Le rire peut-il avoir plusieurs saveurs ?",
    "ar": "في البداية ضحكت سارة من عدم التصديق، ثم ضحكت من الفرح. هل للضحك أكثر من طعم؟"
   },
   "poster": true
  },
  {
   "id": "heroes_04",
   "slug": "jacob",
   "era": 2,
   "pair": "plots_06",
   "audioReady": true,
   "name": {
    "ru": "Иаков",
    "en": "Jacob",
    "de": "Jakob",
    "es": "Jacob",
    "pt": "Jacó",
    "fr": "Jacob",
    "ar": "يعقوب"
   },
   "epithet": {
    "ru": "Увидевший лестницу",
    "en": "Who Saw the Ladder",
    "de": "Der die Leiter sah",
    "es": "El que vio la escalera",
    "pt": "Aquele que viu a escada",
    "fr": "Celui qui vit l'échelle",
    "ar": "من رأى السلّم"
   },
   "facts": {
    "ru": [
     "Однажды в пути Иаков уснул на камне и увидел во сне лестницу от земли до самого неба.",
     "У Иакова было двенадцать сыновей — от них произошли двенадцать колен Израиля.",
     "Иаков получил второе имя — Израиль. Так теперь называется целая страна."
    ],
    "en": [
     "One night on a journey, Jacob fell asleep on a stone and dreamed of a staircase reaching from earth all the way to heaven.",
     "Jacob had twelve sons — they became the twelve tribes of Israel.",
     "Jacob received a second name — Israel. A whole country is named after him today."
    ],
    "de": [
     "Einmal schlief Jakob unterwegs auf einem Stein und sah im Traum eine Leiter, die von der Erde bis in den Himmel reichte.",
     "Jakob hatte zwölf Söhne — von ihnen stammen die zwölf Stämme Israels ab.",
     "Jakob bekam einen zweiten Namen — Israel. So heißt heute ein ganzes Land."
    ],
    "es": [
     "Un día, de camino, Jacob se quedó dormido apoyando la cabeza en una piedra y soñó con una escalera que llegaba desde la tierra hasta el cielo.",
     "Jacob tuvo doce hijos, y de ellos nacieron las doce tribus de Israel.",
     "Jacob recibió un segundo nombre, Israel. Así se llama hoy todo un país."
    ],
    "pt": [
     "Certa vez, em viagem, Jacó adormeceu sobre uma pedra e sonhou com uma escada que ia da terra até o céu.",
     "Jacó teve doze filhos — deles surgiram as doze tribos de Israel.",
     "Jacó recebeu um segundo nome — Israel. É assim que se chama um país inteiro até hoje."
    ],
    "fr": [
     "Un jour, en chemin, Jacob s'endormit sur une pierre et vit en rêve une échelle qui allait de la terre jusqu'au ciel.",
     "Jacob eut douze fils — ils donnèrent naissance aux douze tribus d'Israël.",
     "Jacob reçut un second nom : Israël. C'est aussi le nom d'un pays tout entier aujourd'hui."
    ],
    "ar": [
     "ذات مرة، في الطريق، نام يعقوب على حجر ورأى في المنام سلَّمًا يمتد من الأرض إلى السماء.",
     "كان ليعقوب اثنا عشر ابنًا، ومنهم نشأت أسباط إسرائيل الاثنا عشر.",
     "حصل يعقوب على اسم آخر هو إسرائيل، وبهذا الاسم تُدعى اليوم دولة كاملة."
    ]
   },
   "digit": {
    "num": "12",
    "label": {
     "ru": "сыновей Иакова — от них произошли двенадцать колен Израиля",
     "en": "sons Jacob had — from them came the twelve tribes of Israel",
     "de": "Söhne hatte Jakob – von ihnen stammen die zwölf Stämme Israels ab",
     "es": "hijos tuvo Jacob, de los que nacieron las doce tribus de Israel",
     "pt": "filhos teve Jacó — deles vieram as doze tribos de Israel",
     "fr": "fils a eus Jacob — ils sont à l'origine des douze tribus d'Israël",
     "ar": "ابنًا ليعقوب، منهم جاءت أسباط إسرائيل الاثنا عشر"
    }
   },
   "think": {
    "ru": "Чудо приснилось Иакову в самом обычном месте, на камне. Может, чудеса ближе, чем кажется?",
    "en": "Jacob's wonder came in a dream, in a very ordinary place, on a stone. Maybe wonders are closer than they seem?",
    "de": "Jakobs Wunder geschah an einem ganz gewöhnlichen Ort, auf einem Stein. Sind Wunder vielleicht näher, als wir denken?",
    "es": "El sueño de Jacob ocurrió en un lugar sencillo, sobre una piedra. ¿Los milagros estarán más cerca de lo que pensamos?",
    "pt": "O sonho de Jacó aconteceu num lugar bem comum, sobre uma pedra. Será que os milagres estão mais perto do que pensamos?",
    "fr": "Jacob a rêvé d'un miracle dans un endroit tout simple, sur une pierre. Et si les miracles étaient plus proches qu'on ne le pense ?",
    "ar": "رأى يعقوب المعجزة في حلمه وهو نائم على حجر، في مكان عادي جدًا. هل تكون المعجزات أقرب مما نظن؟"
   },
   "poster": true
  },
  {
   "id": "heroes_05",
   "slug": "joseph",
   "era": 2,
   "pair": "plots_07",
   "audioReady": true,
   "name": {
    "ru": "Иосиф",
    "en": "Joseph",
    "de": "Josef",
    "es": "José",
    "pt": "José",
    "fr": "Joseph",
    "ar": "يوسف"
   },
   "epithet": {
    "ru": "Толкователь снов",
    "en": "Dreamer of Dreams",
    "de": "Der Traumdeuter",
    "es": "El que interpretaba los sueños",
    "pt": "O intérprete de sonhos",
    "fr": "L'interprète des rêves",
    "ar": "مُفسِّر الأحلام"
   },
   "facts": {
    "ru": [
     "Отец подарил Иосифу одежду удивительной красоты — разноцветную, как радуга.",
     "Иосиф умел разгадывать сны: сон фараона о семи коровах спас Египет от голода.",
     "Из раба и узника Иосиф стал главным помощником фараона — почти царём Египта."
    ],
    "en": [
     "His father gave Joseph a coat of amazing colors, bright as a rainbow.",
     "Joseph could explain dreams — Pharaoh's dream about seven cows saved Egypt from famine.",
     "From slave and prisoner, Joseph rose to become Pharaoh's chief helper — almost a king of Egypt."
    ],
    "de": [
     "Sein Vater schenkte Josef ein wunderschönes Gewand — bunt wie ein Regenbogen.",
     "Josef konnte Träume deuten: Der Traum des Pharaos von den sieben Kühen rettete Ägypten vor einer Hungersnot.",
     "Vom Sklaven und Gefangenen wurde Josef zum wichtigsten Helfer des Pharaos — fast wie ein König von Ägypten."
    ],
    "es": [
     "Su padre le regaló una túnica preciosa, de muchos colores, como un arcoíris.",
     "José sabía descifrar los sueños: el sueño del faraón sobre las siete vacas salvó a Egipto del hambre.",
     "De esclavo y prisionero, José pasó a ser el ayudante principal del faraón, casi como un rey de Egipto."
    ],
    "pt": [
     "Seu pai lhe deu uma túnica de cores lindíssimas, como um arco-íris.",
     "José sabia interpretar sonhos: o sonho do faraó com as sete vacas salvou o Egito da fome.",
     "De escravo e prisioneiro, José se tornou o principal ajudante do faraó — quase um rei do Egito."
    ],
    "fr": [
     "Son père lui offrit une tunique magnifique, aux couleurs de l'arc-en-ciel.",
     "Joseph savait deviner les rêves : celui de Pharaon avec les sept vaches sauva l'Égypte de la famine.",
     "D'esclave et de prisonnier, Joseph devint le principal conseiller de Pharaon — presque roi d'Égypte."
    ],
    "ar": [
     "أهدى الأب يوسف ثوبًا بديع الجمال، ملوَّنًا كقوس قزح.",
     "كان يوسف يعرف تفسير الأحلام: فحلم فرعون بالبقرات السبع أنقذ مصر من المجاعة.",
     "من عبدٍ وسجينٍ، صار يوسف أقرب مساعدي فرعون، بل شبه ملك على مصر."
    ]
   },
   "digit": {
    "num": "7",
    "label": {
     "ru": "сытых лет и семь голодных увидел фараон во сне — Иосиф разгадал",
     "en": "years of plenty and seven of famine did Pharaoh see in his dream — Joseph figured it out",
     "de": "fette Jahre und sieben magere sah der Pharao im Traum – Josef deutete sie",
     "es": "años de abundancia y siete de hambre vio el faraón en su sueño, y José los descifró",
     "pt": "anos fartos e sete anos de fome viu o faraó em sonho — e José os decifrou",
     "fr": "années d'abondance et sept années de famine a vues le pharaon en rêve — Joseph les a expliquées",
     "ar": "سنوات شبع وسبع سنوات جوع رآها فرعون في حلمه، ففسّرها يوسف"
    }
   },
   "think": {
    "ru": "Иосиф простил братьев, которые его продали. Легко ли прощать тех, кто обидел?",
    "en": "Joseph forgave the brothers who sold him. Is it easy to forgive someone who hurt you?",
    "de": "Josef verzieh seinen Brüdern, die ihn verkauft hatten. Ist es leicht, jemandem zu verzeihen, der uns wehgetan hat?",
    "es": "José perdonó a sus hermanos, que lo habían vendido. ¿Es fácil perdonar a quien nos hizo daño?",
    "pt": "José perdoou os irmãos que o venderam. É fácil perdoar quem nos magoou?",
    "fr": "Joseph a pardonné à ses frères qui l'avaient vendu. Est-ce facile de pardonner à ceux qui nous ont blessés ?",
    "ar": "سامح يوسف إخوته الذين باعوه. هل من السهل أن نسامح من آذانا؟"
   },
   "poster": true
  },
  {
   "id": "heroes_06",
   "slug": "moses",
   "era": 3,
   "pair": "plots_12",
   "audioReady": true,
   "book": "moses",
   "name": {
    "ru": "Моисей",
    "en": "Moses",
    "de": "Mose",
    "es": "Moisés",
    "pt": "Moisés",
    "fr": "Moïse",
    "ar": "موسى"
   },
   "epithet": {
    "ru": "Освободитель народа",
    "en": "Leader Out of Slavery",
    "de": "Der Befreier des Volkes",
    "es": "El libertador del pueblo",
    "pt": "O libertador do povo",
    "fr": "Le libérateur du peuple",
    "ar": "محرِّر الشعب"
   },
   "facts": {
    "ru": [
     "Младенцем Моисей уплыл от опасности в просмолённой корзинке по реке Нил.",
     "Моисей вывел целый народ из Египта — а море расступилось, открыв дорогу по дну.",
     "На горе Синай Моисей получил десять главных правил жизни, высеченных на каменных скрижалях."
    ],
    "en": [
     "As a baby, Moses floated to safety down the river Nile in a basket sealed with tar.",
     "Moses led a whole nation out of Egypt — and the sea parted, opening a path along its floor.",
     "On Mount Sinai, Moses received ten great rules for living, carved into stone tablets."
    ],
    "de": [
     "Als Baby schwamm Mose in einem geteerten Körbchen den Fluss Nil entlang, um der Gefahr zu entkommen.",
     "Mose führte ein ganzes Volk aus Ägypten heraus — und das Meer teilte sich und öffnete einen Weg über den trockenen Grund.",
     "Auf dem Berg Sinai erhielt Mose zehn wichtige Lebensregeln, eingemeißelt in steinerne Tafeln."
    ],
    "es": [
     "De bebé, Moisés escapó del peligro flotando por el río Nilo en una cestita cubierta de brea.",
     "Moisés sacó a todo un pueblo de Egipto, y el mar se abrió para dejarles paso por el fondo seco.",
     "En el monte Sinaí, Moisés recibió diez reglas principales para vivir, grabadas en tablas de piedra."
    ],
    "pt": [
     "Ainda bebê, Moisés escapou do perigo numa cesta coberta de piche, levada pelo rio Nilo.",
     "Moisés tirou todo um povo do Egito — e o mar se abriu, formando um caminho seco.",
     "No monte Sinai, Moisés recebeu as dez regras principais da vida, gravadas em tábuas de pedra."
    ],
    "fr": [
     "Tout bébé, Moïse échappa au danger en descendant le fleuve Nil dans une corbeille enduite de poix.",
     "Moïse fit sortir tout un peuple d'Égypte — et la mer s'ouvrit devant eux, laissant un chemin à pied sec.",
     "Sur le mont Sinaï, Moïse reçut dix règles essentielles pour bien vivre, gravées sur des tables de pierre."
    ],
    "ar": [
     "وهو طفل رضيع، نجا موسى من الخطر عائمًا في سلَّة مطليَّة بالقار على نهر النيل.",
     "أخرج موسى شعبًا بأكمله من مصر، وانشقّ البحر ليفتح لهم طريقًا على أرضه.",
     "على جبل سيناء، تلقّى موسى عشر وصايا أساسية للحياة، منقوشة على لوحين من حجر."
    ]
   },
   "digit": {
    "num": "10",
    "label": {
     "ru": "главных правил жизни получил Моисей на горе Синай",
     "en": "main rules for living did Moses receive on Mount Sinai",
     "de": "wichtige Lebensregeln erhielt Mose auf dem Berg Sinai",
     "es": "reglas principales para vivir recibió Moisés en el monte Sinaí",
     "pt": "regras principais para a vida Moisés recebeu no monte Sinai",
     "fr": "règles essentielles de vie a reçues Moïse sur le mont Sinaï",
     "ar": "وصايا مهمة تلقّاها موسى على جبل سيناء"
    }
   },
   "think": {
    "ru": "Какое доброе правило ты добавил бы одиннадцатым?",
    "en": "What kind rule would you add as the eleventh?",
    "de": "Welche gute Regel würdest du als elfte hinzufügen?",
    "es": "¿Qué regla buena añadirías tú como la número once?",
    "pt": "Que regra boa você acrescentaria como a décima primeira?",
    "fr": "Quelle bonne règle ajouterais-tu comme onzième ?",
    "ar": "أي قاعدة طيبة كنت ستضيفها لتكون الوصية الحادية عشرة؟"
   },
   "poster": true
  },
  {
   "id": "heroes_07",
   "slug": "miriam",
   "era": 3,
   "pair": "plots_08",
   "audioReady": true,
   "name": {
    "ru": "Мириам",
    "en": "Miriam",
    "de": "Mirjam",
    "es": "Miriam",
    "pt": "Miriã",
    "fr": "Myriam",
    "ar": "مريم"
   },
   "epithet": {
    "ru": "Сестра с бубном",
    "en": "Sister with a Tambourine",
    "de": "Die Schwester mit der Trommel",
    "es": "La hermana del pandero",
    "pt": "A irmã com o pandeiro",
    "fr": "La sœur au tambourin",
    "ar": "الأخت ذات الدُّف"
   },
   "facts": {
    "ru": [
     "Это Мириам издалека следила за корзинкой с маленьким братом Моисеем на Ниле.",
     "Когда народ перешёл море, Мириам первой ударила в бубен и повела всех в танце.",
     "Мириам — одна из первых женщин в Библии, названных пророчицей."
    ],
    "en": [
     "It was Miriam who watched from afar over the basket carrying her baby brother Moses on the Nile.",
     "When the people crossed the sea, Miriam was the first to raise her tambourine and lead everyone in dance.",
     "Miriam is one of the first women in the Bible to be called a prophet."
    ],
    "de": [
     "Mirjam war es, die von Weitem das Körbchen mit ihrem kleinen Bruder Mose auf dem Nil beobachtete.",
     "Als das Volk das Meer durchquert hatte, schlug Mirjam als Erste die Trommel und führte alle im Tanz an.",
     "Mirjam ist eine der ersten Frauen in der Bibel, die als Prophetin bezeichnet wird."
    ],
    "es": [
     "Fue Miriam quien vigiló desde lejos la cestita con su hermanito Moisés en el Nilo.",
     "Cuando el pueblo cruzó el mar, Miriam tomó el pandero la primera y guio a todos en un baile.",
     "Miriam es una de las primeras mujeres de la Biblia a las que se llama profetisa."
    ],
    "pt": [
     "Foi Miriã quem, de longe, vigiou a cesta com seu irmãozinho Moisés no rio Nilo.",
     "Quando o povo atravessou o mar, Miriã foi a primeira a tocar o pandeiro e liderar a dança.",
     "Miriã é uma das primeiras mulheres da Bíblia chamadas de profetisa."
    ],
    "fr": [
     "C'est Myriam qui, de loin, surveillait la corbeille avec son petit frère Moïse sur le Nil.",
     "Quand le peuple traversa la mer, Myriam fut la première à jouer du tambourin et à entraîner tout le monde dans la danse.",
     "Myriam est l'une des premières femmes de la Bible appelées prophétesse."
    ],
    "ar": [
     "مريم هي من راقبت من بعيد سلَّة أخيها الصغير موسى على نهر النيل.",
     "حين عبر الشعب البحر، كانت مريم أول من ضرب بالدُّف وقادت الجميع في رقصة فرح.",
     "مريم من أوائل النساء في الكتاب المقدس اللواتي دُعِين نبيّات."
    ]
   },
   "digit": {
    "num": "1",
    "label": {
     "ru": "Мириам первой ударила в бубен и повела всех в победном танце",
     "en": "Miriam was the first to strike her tambourine and lead everyone in a joyful dance",
     "de": "Mirjam schlug als Erste die Handpauke und führte alle im Freudentanz an",
     "es": "Miriam fue la primera en tocar el pandero y guiar a todos en una danza de victoria",
     "pt": "Miriã foi a primeira a tocar o tamborim e liderar a dança de vitória",
     "fr": "Miriam a été la première à frapper son tambourin et à mener la danse de la victoire",
     "ar": "مريم أول من ضربت بالدف وقادت الجميع في رقصة الفرح بالنصر"
    }
   },
   "think": {
    "ru": "Мириам издалека стерегла корзинку с братом. Как младшие могут защищать старших?",
    "en": "Miriam watched over her baby brother's basket from afar. How can younger ones look after older ones?",
    "de": "Mirjam wachte aus der Ferne über dem Körbchen mit ihrem Bruder. Wie können Jüngere die Älteren beschützen?",
    "es": "Miriam vigilaba desde lejos la cesta con su hermano. ¿Cómo pueden los más pequeños proteger a los mayores?",
    "pt": "Miriã vigiava de longe a cesta com o irmãozinho. Como os mais novos podem cuidar dos mais velhos?",
    "fr": "Miriam surveillait de loin le panier avec son petit frère. Comment les plus jeunes peuvent-ils protéger les plus grands ?",
    "ar": "راقبت مريم سلة أخيها من بعيد. كيف يستطيع الصغار حماية الكبار؟"
   },
   "poster": true,
   "book": "moses"
  },
  {
   "id": "heroes_08",
   "slug": "joshua",
   "era": 4,
   "pair": "plots_13",
   "audioReady": true,
   "name": {
    "ru": "Иисус Навин",
    "en": "Joshua",
    "de": "Josua",
    "es": "Josué",
    "pt": "Josué",
    "fr": "Josué",
    "ar": "يشوع"
   },
   "epithet": {
    "ru": "Полководец веры",
    "en": "Faithful Commander",
    "de": "Der Feldherr des Glaubens",
    "es": "El general de la fe",
    "pt": "O general da fé",
    "fr": "Le chef de guerre de la foi",
    "ar": "قائد الإيمان"
   },
   "facts": {
    "ru": [
     "Иисус Навин принял народ от самого Моисея и привёл его в долгожданную землю.",
     "Стены города Иерихона рухнули после семи обходов под звук труб-шофаров.",
     "Он был одним из двенадцати разведчиков — и одним из двух, кто не испугался."
    ],
    "en": [
     "Joshua took over from Moses himself and led the people into the land they had long awaited.",
     "The walls of the city of Jericho fell after seven marches around it, to the sound of ram's horn trumpets.",
     "He was one of twelve scouts sent to explore the land — and one of only two who weren't afraid."
    ],
    "de": [
     "Josua übernahm das Volk von Mose selbst und führte es in das lang ersehnte Land.",
     "Die Mauern der Stadt Jericho stürzten ein, nachdem man siebenmal um sie herumgezogen war und die Schofar-Hörner erklangen.",
     "Er war einer von zwölf Kundschaftern — und einer von zweien, die keine Angst hatten."
    ],
    "es": [
     "Josué recibió el pueblo de manos del propio Moisés y lo condujo a la tierra tan esperada.",
     "Las murallas de la ciudad de Jericó cayeron después de siete vueltas al son de las trompetas de cuerno.",
     "Fue uno de los doce exploradores, y uno de los dos que no tuvieron miedo."
    ],
    "pt": [
     "Josué recebeu o povo das mãos do próprio Moisés e o conduziu até a terra tão esperada.",
     "As muralhas da cidade de Jericó caíram depois de sete voltas ao som das trombetas de chifre.",
     "Ele foi um dos doze exploradores enviados à terra — e um dos dois que não teve medo."
    ],
    "fr": [
     "Josué prit la suite de Moïse et conduisit le peuple jusqu'à la terre tant attendue.",
     "Les murailles de la ville de Jéricho s'effondrèrent après sept tours de la ville au son des trompettes.",
     "Il faisait partie des douze explorateurs — et l'un des deux seuls à ne pas avoir eu peur."
    ],
    "ar": [
     "تسلَّم يشوع قيادة الشعب من موسى نفسه، وقادهم إلى الأرض التي طال انتظارها.",
     "انهارت أسوار مدينة أريحا بعد سبع جولات حولها على صوت الأبواق.",
     "كان أحد اثني عشر كاشفًا أُرسلوا لاستطلاع الأرض، وأحد اثنين فقط لم يخافا."
    ]
   },
   "digit": {
    "num": "2",
    "label": {
     "ru": "из двенадцати разведчиков не испугались — и один из них Иисус Навин",
     "en": "out of twelve scouts weren't afraid — and one of them was Joshua",
     "de": "von zwölf Kundschaftern fürchteten sich nicht – einer davon war Josua",
     "es": "de los doce exploradores no tuvieron miedo, y uno de ellos fue Josué",
     "pt": "dos doze espiões não tiveram medo — e um deles era Josué",
     "fr": "des douze éclaireurs n'ont pas eu peur — et l'un d'eux était Josué",
     "ar": "من أصل اثني عشر جاسوسًا لم يخافوا، وكان يشوع بن نون واحدًا منهم"
    }
   },
   "think": {
    "ru": "Все видели одно и то же, а испугались не все. От чего зависит смелость?",
    "en": "Everyone saw the same thing, but not everyone was afraid. What does courage depend on?",
    "de": "Alle sahen dasselbe, doch nicht alle bekamen Angst. Wovon hängt Mut ab?",
    "es": "Todos vieron lo mismo, pero no todos tuvieron miedo. ¿De qué depende el valor?",
    "pt": "Todos viram a mesma coisa, mas nem todos ficaram com medo. De que depende a coragem?",
    "fr": "Tous voyaient la même chose, mais tous n'ont pas eu peur. De quoi dépend le courage ?",
    "ar": "رأى الجميع الشيء نفسه، لكن لم يخف كلهم. ممّ تأتي الشجاعة؟"
   },
   "poster": true
  },
  {
   "id": "heroes_09",
   "slug": "samson",
   "era": 4,
   "pair": null,
   "audioReady": true,
   "name": {
    "ru": "Самсон",
    "en": "Samson",
    "de": "Simson",
    "es": "Sansón",
    "pt": "Sansão",
    "fr": "Samson",
    "ar": "شمشون"
   },
   "epithet": {
    "ru": "Самый сильный",
    "en": "The Strongest of All",
    "de": "Der Stärkste",
    "es": "El más fuerte",
    "pt": "O mais forte de todos",
    "fr": "Le plus fort de tous",
    "ar": "الأقوى بينهم"
   },
   "facts": {
    "ru": [
     "Сила Самсона пряталась в его длинных волосах, которых никогда не касались ножницы.",
     "Однажды Самсон голыми руками справился со львом.",
     "Ворота целого города Самсон унёс на плечах на вершину горы."
    ],
    "en": [
     "Samson's strength was hidden in his long hair, which scissors had never touched.",
     "Once, Samson fought off a lion with his bare hands.",
     "Samson carried a whole city's gates on his shoulders all the way up a mountain."
    ],
    "de": [
     "Simsons Kraft steckte in seinen langen Haaren, die nie eine Schere berührt hatte.",
     "Einmal bezwang Simson mit bloßen Händen einen Löwen.",
     "Die Tore einer ganzen Stadt trug Simson auf seinen Schultern bis auf den Gipfel eines Berges."
    ],
    "es": [
     "La fuerza de Sansón se escondía en su larga cabellera, que unas tijeras nunca habían tocado.",
     "Una vez, Sansón venció a un león con sus propias manos.",
     "Sansón cargó sobre sus hombros las puertas de toda una ciudad y las llevó hasta lo alto de un monte."
    ],
    "pt": [
     "A força de Sansão estava escondida em seus longos cabelos, que a tesoura nunca havia tocado.",
     "Certa vez, Sansão venceu um leão com as próprias mãos.",
     "Sansão carregou nos ombros os portões de uma cidade inteira até o topo de um monte."
    ],
    "fr": [
     "La force de Samson se cachait dans ses longs cheveux, que les ciseaux n'avaient jamais touchés.",
     "Un jour, Samson affronta un lion à mains nues.",
     "Samson porta sur ses épaules les portes d'une ville entière jusqu'au sommet d'une montagne."
    ],
    "ar": [
     "كانت قوة شمشون مخبّأة في شعره الطويل، الذي لم تلمسه مقصّ قط.",
     "ذات مرة، تغلّب شمشون على أسد بيديه العاريتين.",
     "حمل شمشون بوابة مدينة كاملة على كتفيه إلى قمة جبل."
    ]
   },
   "digit": {
    "num": "0",
    "label": {
     "ru": "раз ножницы касались волос Самсона — в них пряталась его сила",
     "en": "times did scissors touch Samson's hair — that's where his strength was hidden",
     "de": "Mal berührte eine Schere Simsons Haar – darin steckte seine Kraft",
     "es": "veces tocaron las tijeras el cabello de Sansón, donde se escondía su fuerza",
     "pt": "vezes a tesoura tocou o cabelo de Sansão — e era ali que se escondia sua força",
     "fr": "fois les ciseaux ont touché les cheveux de Samson — sa force s'y cachait",
     "ar": "مرة لمس المقص شعر شمشون، وفيه كانت تختبئ قوته"
    }
   },
   "think": {
    "ru": "Самая большая сила Самсона — в мышцах или где-то ещё?",
    "en": "Was Samson's greatest strength in his muscles, or somewhere else?",
    "de": "Steckte Simsons größte Kraft in seinen Muskeln oder woanders?",
    "es": "¿La mayor fuerza de Sansón estaba en sus músculos o en otro lugar?",
    "pt": "A maior força de Sansão estava nos músculos ou em outro lugar?",
    "fr": "La plus grande force de Samson était-elle dans ses muscles, ou ailleurs ?",
    "ar": "هل كانت قوة شمشون الحقيقية في عضلاته، أم في مكان آخر؟"
   },
   "poster": true
  },
  {
   "id": "heroes_10",
   "slug": "ruth",
   "era": 4,
   "pair": null,
   "audioReady": true,
   "name": {
    "ru": "Руфь",
    "en": "Ruth",
    "de": "Rut",
    "es": "Rut",
    "pt": "Rute",
    "fr": "Ruth",
    "ar": "راعوث"
   },
   "epithet": {
    "ru": "Верная спутница",
    "en": "Loyal Companion",
    "de": "Die treue Begleiterin",
    "es": "La compañera fiel",
    "pt": "A companheira fiel",
    "fr": "La compagne fidèle",
    "ar": "الرفيقة الوفيّة"
   },
   "facts": {
    "ru": [
     "Руфь не бросила свекровь Ноеминь в беде и пошла за ней в чужую страну.",
     "Она собирала колоски на поле, чтобы прокормить их двоих, — и её доброту заметили.",
     "Руфь стала прабабушкой царя Давида — её имя носит целая книга Библии."
    ],
    "en": [
     "Ruth would not leave her mother-in-law Naomi in hard times, and went with her to a foreign land.",
     "She gathered leftover grain in the fields to feed them both — and her kindness was noticed.",
     "Ruth became the great-grandmother of King David — and a whole book of the Bible bears her name."
    ],
    "de": [
     "Rut ließ ihre Schwiegermutter Noomi nicht im Stich und zog mit ihr in ein fremdes Land.",
     "Sie las Ähren auf dem Feld auf, um sie beide zu ernähren — und ihre Güte wurde bemerkt.",
     "Rut wurde die Urgroßmutter von König David — nach ihr ist ein ganzes Buch der Bibel benannt."
    ],
    "es": [
     "Rut no abandonó a su suegra Noemí en la desgracia y se fue con ella a un país extranjero.",
     "Recogía espigas en el campo para alimentarlas a las dos, y alguien se fijó en su bondad.",
     "Rut se convirtió en bisabuela del rey David, y todo un libro de la Biblia lleva su nombre."
    ],
    "pt": [
     "Rute não abandonou sua sogra Noemi na hora difícil e foi com ela para uma terra estranha.",
     "Ela recolhia espigas no campo para sustentar as duas — e sua bondade foi notada.",
     "Rute se tornou bisavó do rei Davi — seu nome dá título a um livro inteiro da Bíblia."
    ],
    "fr": [
     "Ruth ne voulut pas abandonner sa belle-mère Noémi dans le malheur et partit avec elle vers un pays inconnu.",
     "Elle ramassait les épis dans les champs pour les nourrir toutes les deux — et sa gentillesse fut remarquée.",
     "Ruth devint l'arrière-grand-mère du roi David — un livre entier de la Bible porte son nom."
    ],
    "ar": [
     "لم تترك راعوث حماتها نُعمي وحيدة في محنتها، بل رافقتها إلى بلاد غريبة.",
     "كانت تلتقط السنابل في الحقل لتُطعمهما، فلاحظ الناس طيبة قلبها.",
     "أصبحت راعوث جدَّة الملك داود الكبرى، وباسمها سُمِّي سفر كامل في الكتاب المقدس."
    ]
   },
   "digit": {
    "num": "1",
    "label": {
     "ru": "целая книга Библии названа именем Руфи",
     "en": "whole book of the Bible is named after Ruth",
     "de": "ganzes Buch der Bibel trägt den Namen Ruth",
     "es": "libro entero de la Biblia lleva el nombre de Rut",
     "pt": "livro inteiro da Bíblia leva o nome de Rute",
     "fr": "livre entier de la Bible porte le nom de Ruth",
     "ar": "سفر كامل من أسفار الكتاب المقدس يحمل اسم راعوث"
    }
   },
   "think": {
    "ru": "Руфь пошла за Ноеминью в чужую страну. Что значит быть верным другом?",
    "en": "Ruth followed Naomi to a foreign land. What does it mean to be a true friend?",
    "de": "Ruth folgte Noomi in ein fremdes Land. Was bedeutet es, ein treuer Freund zu sein?",
    "es": "Rut siguió a Noemí a una tierra extraña. ¿Qué significa ser un amigo fiel?",
    "pt": "Rute seguiu Noemi para uma terra estranha. O que significa ser um amigo fiel?",
    "fr": "Ruth a suivi Noémi dans un pays étranger. Que signifie être un ami fidèle ?",
    "ar": "تبعت راعوث نعمي إلى أرض غريبة. ماذا يعني أن نكون صديقًا وفيًّا؟"
   },
   "poster": true
  },
  {
   "id": "heroes_11",
   "slug": "samuel",
   "era": 5,
   "pair": null,
   "audioReady": true,
   "name": {
    "ru": "Самуил",
    "en": "Samuel",
    "de": "Samuel",
    "es": "Samuel",
    "pt": "Samuel",
    "fr": "Samuel",
    "ar": "صموئيل"
   },
   "epithet": {
    "ru": "Мальчик, услышавший голос",
    "en": "The boy who heard a voice",
    "de": "Der Junge, der eine Stimme hörte",
    "es": "El niño que escuchó una voz",
    "pt": "O menino que ouviu uma voz",
    "fr": "Le garçon qui entendit une voix",
    "ar": "الصبي الذي سمع الصوت"
   },
   "facts": {
    "ru": [
     "Самуил рос при храме и помогал старому священнику Илию с самого детства.",
     "Однажды ночью его трижды позвал голос — Самуил думал, что это Илий, но это был не он.",
     "Самуил вырос и стал пророком: именно он помазал на царство юного Давида."
    ],
    "en": [
     "Samuel grew up at the temple, helping old Eli the priest since he was small.",
     "One night a voice called his name three times — Samuel thought it was Eli, but it wasn't.",
     "Samuel grew up to become a prophet, and it was he who anointed young David as king."
    ],
    "de": [
     "Samuel wuchs im Tempel auf und half dem alten Priester Eli schon als kleiner Junge.",
     "Eines Nachts rief ihn eine Stimme dreimal – Samuel dachte, es sei Eli, aber er war es nicht.",
     "Samuel wurde groß und ein Prophet: Er war es, der den jungen David zum König salbte."
    ],
    "es": [
     "Samuel creció en el templo, ayudando al anciano sacerdote Elí desde muy pequeño.",
     "Una noche, una voz lo llamó tres veces; Samuel pensó que era Elí, pero no lo era.",
     "Samuel creció y se convirtió en profeta: fue él quien ungió como rey al joven David."
    ],
    "pt": [
     "Samuel cresceu no templo, ajudando o velho sacerdote Eli desde pequeno.",
     "Certa noite, uma voz o chamou três vezes — Samuel pensou que fosse Eli, mas não era.",
     "Samuel cresceu e se tornou profeta: foi ele quem ungiu o jovem Davi como rei."
    ],
    "fr": [
     "Samuel avait grandi près du temple, aidant le vieux prêtre Eli depuis tout petit.",
     "Une nuit, une voix l'appela trois fois — Samuel crut que c'était Eli, mais ce n'était pas lui.",
     "Samuel devint prophète : c'est lui qui sacra le jeune David comme roi."
    ],
    "ar": [
     "نشأ صموئيل في الهيكل، وكان يساعد الكاهن الشيخ عالي منذ صغره.",
     "في إحدى الليالي ناداه صوتٌ ثلاث مرات، فظن صموئيل أنه عالي، لكنه لم يكن هو.",
     "كبر صموئيل وصار نبيًّا، وهو من مسح داود الصغير ليكون ملكًا."
    ]
   },
   "digit": {
    "num": "3",
    "label": {
     "ru": "раза ночной голос звал Самуила, пока он понял, кто зовёт",
     "en": "times a voice called Samuel in the night before he understood who it was",
     "de": "so oft rief die nächtliche Stimme Samuel, bis er verstand, wer ihn rief",
     "es": "veces habló la voz en la noche a Samuel, hasta que entendió quién lo llamaba",
     "pt": "vezes uma voz noturna chamou Samuel, até ele entender quem chamava",
     "fr": "fois une voix a appelé Samuel dans la nuit, avant qu'il comprenne qui l'appelait",
     "ar": "مرة نادى فيها صوت الليل صموئيل، حتى عرف من يناديه"
    }
   },
   "think": {
    "ru": "Самуил умел слушать. Чем «слушать» отличается от «слышать»?",
    "en": "Samuel knew how to listen. How is \"listening\" different from just \"hearing\"?",
    "de": "Samuel konnte gut zuhören. Was ist der Unterschied zwischen „hören“ und „zuhören“?",
    "es": "Samuel sabía escuchar. ¿En qué se diferencia «escuchar» de «oír»?",
    "pt": "Samuel sabia escutar. Qual é a diferença entre “escutar” e “ouvir”?",
    "fr": "Samuel savait écouter. En quoi « écouter » est-ce différent d'« entendre » ?",
    "ar": "كان صموئيل يعرف كيف يستمع. بم يختلف «الاستماع» عن «السمع»؟"
   },
   "poster": true
  },
  {
   "id": "heroes_12",
   "slug": "david",
   "era": 5,
   "pair": "plots_14",
   "audioReady": true,
   "name": {
    "ru": "Давид",
    "en": "David",
    "de": "David",
    "es": "David",
    "pt": "Davi",
    "fr": "David",
    "ar": "داود"
   },
   "epithet": {
    "ru": "Пастух, ставший царём",
    "en": "The shepherd who became king",
    "de": "Der Hirte, der König wurde",
    "es": "El pastor que llegó a ser rey",
    "pt": "O pastor que virou rei",
    "fr": "Le berger devenu roi",
    "ar": "الراعي الذي أصبح ملكًا"
   },
   "facts": {
    "ru": [
     "Давид победил великана Голиафа простой пращой и одним гладким камнем.",
     "Он прекрасно играл на арфе — его песни-псалмы поют уже три тысячи лет.",
     "Давид сделал Иерусалим столицей — город и сегодня называют городом Давида."
    ],
    "en": [
     "David defeated the giant Goliath with just a sling and one smooth stone.",
     "He played the harp beautifully — his songs, the Psalms, are still sung three thousand years later.",
     "David made Jerusalem his capital — the city is still called the City of David today."
    ],
    "de": [
     "David besiegte den Riesen Goliat mit nur einer Schleuder und einem glatten Stein.",
     "Er spielte wunderbar Harfe – seine Lieder, die Psalmen, singt man schon seit dreitausend Jahren.",
     "David machte Jerusalem zu seiner Hauptstadt – man nennt die Stadt bis heute die Stadt Davids."
    ],
    "es": [
     "David venció al gigante Goliat con una simple honda y una piedra lisa.",
     "Tocaba el arpa maravillosamente; sus canciones, los salmos, se cantan desde hace tres mil años.",
     "David convirtió a Jerusalén en su capital, y aún hoy se la llama la Ciudad de David."
    ],
    "pt": [
     "Davi venceu o gigante Golias com uma simples funda e uma pedra lisa.",
     "Ele tocava harpa lindamente — seus salmos são cantados há três mil anos.",
     "Davi fez de Jerusalém sua capital — a cidade é chamada até hoje de Cidade de Davi."
    ],
    "fr": [
     "David vainquit le géant Goliath avec une simple fronde et une pierre bien lisse.",
     "Il jouait merveilleusement de la harpe — ses chants, les psaumes, sont chantés depuis trois mille ans.",
     "David fit de Jérusalem sa capitale — on l'appelle encore aujourd'hui la cité de David."
    ],
    "ar": [
     "هزم داود الجبار جالوت بمقلاعٍ بسيط وحجرٍ واحدٍ ناعم.",
     "كان يعزف على القيثارة بجمال، وأغانيه المزامير تُغنّى منذ ثلاثة آلاف سنة.",
     "جعل داود القدس عاصمةً له، وحتى اليوم تُسمّى المدينة بمدينة داود."
    ]
   },
   "digit": {
    "num": "5",
    "label": {
     "ru": "гладких камней взял Давид из ручья — а хватило одного",
     "en": "smooth stones David picked up from the stream — but one was enough",
     "de": "glatte Steine holte David aus dem Bach – doch einer genügte",
     "es": "piedras lisas tomó David del arroyo — y bastó con una sola",
     "pt": "pedras lisas Davi pegou no riacho — mas bastou uma só",
     "fr": "pierres lisses David a prises dans le ruisseau — une seule a suffi",
     "ar": "حجرًا ناعمًا أخذها داود من النهر — وكفى واحد منها"
    }
   },
   "think": {
    "ru": "Почему маленький пастух не испугался огромного великана?",
    "en": "Why wasn't the little shepherd afraid of the huge giant?",
    "de": "Warum hatte der kleine Hirte keine Angst vor dem riesigen Riesen?",
    "es": "¿Por qué el joven pastor no tuvo miedo de un gigante tan enorme?",
    "pt": "Por que o pequeno pastor não teve medo do gigante enorme?",
    "fr": "Pourquoi le petit berger n'a-t-il pas eu peur de l'énorme géant ?",
    "ar": "لماذا لم يخف الراعي الصغير من الجبار الضخم؟"
   },
   "poster": true,
   "book": "david"
  },
  {
   "id": "heroes_13",
   "slug": "solomon",
   "era": 5,
   "pair": "plots_16",
   "audioReady": true,
   "name": {
    "ru": "Соломон",
    "en": "Solomon",
    "de": "Salomo",
    "es": "Salomón",
    "pt": "Salomão",
    "fr": "Salomon",
    "ar": "سليمان"
   },
   "epithet": {
    "ru": "Мудрейший царь",
    "en": "The wisest king",
    "de": "Der weiseste König",
    "es": "El rey más sabio",
    "pt": "O rei mais sábio",
    "fr": "Le roi le plus sage",
    "ar": "الملك الأحكم"
   },
   "facts": {
    "ru": [
     "Соломон попросил себе не богатства и не славы, а мудрости — и стал мудрейшим из царей.",
     "Он построил в Иерусалиме великолепный Храм, украшенный золотом и кедром.",
     "Со всего света к Соломону приезжали за советом — даже царица далёкой Савы."
    ],
    "en": [
     "Solomon asked not for riches or fame, but for wisdom — and became the wisest of kings.",
     "He built a magnificent Temple in Jerusalem, adorned with gold and cedar wood.",
     "People came from all over the world to seek Solomon's advice — even the Queen of Sheba, from a distant land."
    ],
    "de": [
     "Salomo wünschte sich weder Reichtum noch Ruhm, sondern Weisheit – und wurde der weiseste aller Könige.",
     "Er baute in Jerusalem einen prächtigen Tempel, geschmückt mit Gold und Zedernholz.",
     "Menschen aus aller Welt kamen zu Salomo um Rat – sogar die Königin von Saba aus der Ferne."
    ],
    "es": [
     "Salomón no pidió riquezas ni fama, sino sabiduría, y se convirtió en el más sabio de los reyes.",
     "Construyó en Jerusalén un templo espléndido, decorado con oro y madera de cedro.",
     "Gente de todo el mundo iba a pedirle consejo, incluso la reina de la lejana Saba."
    ],
    "pt": [
     "Salomão não pediu riqueza nem fama, mas sabedoria — e se tornou o mais sábio dos reis.",
     "Ele construiu em Jerusalém um Templo esplêndido, todo enfeitado com ouro e cedro.",
     "Gente do mundo todo vinha pedir conselhos a Salomão — até a rainha de Sabá, de terras distantes."
    ],
    "fr": [
     "Salomon ne demanda ni richesse ni gloire, mais la sagesse — et il devint le plus sage des rois.",
     "Il fit construire à Jérusalem un magnifique Temple, orné d'or et de bois de cèdre.",
     "On venait du monde entier demander conseil à Salomon — même la reine de Saba, venue de très loin."
    ],
    "ar": [
     "طلب سليمان لنفسه الحكمة لا الثروة ولا الشهرة، فصار أحكم الملوك.",
     "بنى في القدس هيكلًا رائعًا مزيّنًا بالذهب وخشب الأرز.",
     "كان الناس من كل مكان يأتون لسليمان طلبًا للنصيحة، حتى ملكة سبأ من بلادٍ بعيدة."
    ]
   },
   "digit": {
    "num": "7",
    "label": {
     "ru": "лет тысячи мастеров строили Храм Соломона",
     "en": "years thousands of workers spent building Solomon's Temple",
     "de": "Jahre lang bauten Tausende Handwerker den Tempel Salomos",
     "es": "años tardaron miles de artesanos en construir el Templo de Salomón",
     "pt": "anos milhares de artesãos construíram o Templo de Salomão",
     "fr": "ans des milliers d'artisans ont construit le Temple de Salomon",
     "ar": "سنة عمل فيها آلاف الصنّاع في بناء هيكل سليمان"
    }
   },
   "think": {
    "ru": "Соломон мог попросить что угодно, а выбрал мудрость. Что выбрал бы ты?",
    "en": "Solomon could have asked for anything, but he chose wisdom. What would you choose?",
    "de": "Salomo hätte sich alles wünschen können, doch er wählte Weisheit. Was würdest du dir wünschen?",
    "es": "Salomón podía pedir lo que quisiera, y eligió la sabiduría. ¿Qué elegirías tú?",
    "pt": "Salomão podia pedir qualquer coisa, e escolheu a sabedoria. O que você escolheria?",
    "fr": "Salomon pouvait demander n'importe quoi, il a choisi la sagesse. Et toi, que choisirais-tu ?",
    "ar": "كان يمكن لسليمان أن يطلب أي شيء، فاختار الحكمة. ماذا تختار أنت؟"
   },
   "poster": true
  },
  {
   "id": "heroes_14",
   "slug": "elijah",
   "era": 6,
   "pair": null,
   "audioReady": true,
   "name": {
    "ru": "Илия",
    "en": "Elijah",
    "de": "Elia",
    "es": "Elías",
    "pt": "Elias",
    "fr": "Élie",
    "ar": "إيليا"
   },
   "epithet": {
    "ru": "Пророк огня",
    "en": "The prophet of fire",
    "de": "Der Prophet des Feuers",
    "es": "El profeta del fuego",
    "pt": "O profeta do fogo",
    "fr": "Le prophète du feu",
    "ar": "نبي النار"
   },
   "facts": {
    "ru": [
     "В голодные времена Илию кормили вороны — приносили ему хлеб прямо к ручью.",
     "Илия не боялся говорить правду даже самому царю.",
     "По преданию, Илия не умер, а унёсся в небо на огненной колеснице."
    ],
    "en": [
     "During a great famine, ravens fed Elijah — bringing him bread right by the stream.",
     "Elijah was never afraid to tell the truth, even to the king himself.",
     "As the story goes, Elijah never died, but was carried up to heaven in a fiery chariot."
    ],
    "de": [
     "In einer Hungerzeit brachten Raben dem Elia Brot direkt an den Bach.",
     "Elia fürchtete sich nicht, sogar dem König die Wahrheit zu sagen.",
     "Der Überlieferung nach starb Elia nicht, sondern fuhr auf einem feurigen Wagen in den Himmel."
    ],
    "es": [
     "En tiempos de hambre, unos cuervos alimentaban a Elías, llevándole pan junto a un arroyo.",
     "Elías no temía decir la verdad, ni siquiera al mismísimo rey.",
     "Según la tradición, Elías no murió, sino que subió al cielo en un carro de fuego."
    ],
    "pt": [
     "Em tempos de fome, corvos alimentavam Elias, trazendo pão até um riacho.",
     "Elias não tinha medo de dizer a verdade, nem mesmo ao próprio rei.",
     "Reza a tradição que Elias não morreu, mas subiu ao céu numa carruagem de fogo."
    ],
    "fr": [
     "En des temps de famine, des corbeaux nourrissaient Élie, lui apportant du pain près d'un ruisseau.",
     "Élie n'avait jamais peur de dire la vérité, même au roi.",
     "Selon la tradition, Élie ne mourut pas, mais s'envola au ciel sur un char de feu."
    ],
    "ar": [
     "في زمن الجوع كانت الغربان تُطعم إيليا، وتحمل له الخبز إلى جانب النهر.",
     "لم يخف إيليا قول الحق حتى أمام الملك نفسه.",
     "تقول القصة إن إيليا لم يمت، بل صعد إلى السماء على مركبةٍ من نار."
    ]
   },
   "digit": {
    "num": "2",
    "label": {
     "ru": "раза в день — утром и вечером — вороны приносили Илии хлеб",
     "en": "times a day — morning and evening — ravens brought Elijah bread",
     "de": "Mal am Tag – morgens und abends – brachten Raben Elija Brot",
     "es": "veces al día — mañana y tarde — los cuervos traían pan a Elías",
     "pt": "vezes por dia — de manhã e à tarde — os corvos traziam pão para Elias",
     "fr": "fois par jour — matin et soir — les corbeaux apportaient du pain à Élie",
     "ar": "مرتين في اليوم — صباحًا ومساءً — أحضر الغربان الخبز لإيليا"
    }
   },
   "think": {
    "ru": "Илия говорил правду даже царю. Почему говорить правду бывает трудно?",
    "en": "Elijah told the truth even to the king. Why is telling the truth sometimes hard?",
    "de": "Elija sagte selbst dem König die Wahrheit. Warum ist es manchmal schwer, die Wahrheit zu sagen?",
    "es": "Elías decía la verdad incluso al rey. ¿Por qué a veces cuesta tanto decir la verdad?",
    "pt": "Elias dizia a verdade até para o rei. Por que dizer a verdade às vezes é difícil?",
    "fr": "Élie disait la vérité même au roi. Pourquoi est-ce parfois difficile de dire la vérité ?",
    "ar": "كان إيليا يقول الحق حتى للملك. لماذا يكون قول الحق صعبًا أحيانًا؟"
   },
   "poster": true
  },
  {
   "id": "heroes_15",
   "slug": "daniel",
   "era": 6,
   "pair": "plots_17",
   "audioReady": true,
   "name": {
    "ru": "Даниил",
    "en": "Daniel",
    "de": "Daniel",
    "es": "Daniel",
    "pt": "Daniel",
    "fr": "Daniel",
    "ar": "دانيال"
   },
   "epithet": {
    "ru": "Не испугавшийся львов",
    "en": "Unafraid of lions",
    "de": "Der keine Angst vor Löwen hatte",
    "es": "El que no temió a los leones",
    "pt": "Quem não temeu os leões",
    "fr": "Celui qui n'eut pas peur des lions",
    "ar": "من لم يخف الأسود"
   },
   "facts": {
    "ru": [
     "Даниила бросили в ров с голодными львами — а утром он вышел целым и невредимым.",
     "Даниил разгадал таинственную надпись, появившуюся на стене царского дворца.",
     "Он служил советником у царей трёх разных царств — и все ему доверяли."
    ],
    "en": [
     "Daniel was thrown into a den of hungry lions — and in the morning he walked out safe and sound.",
     "Daniel solved the mystery of writing that appeared on the palace wall.",
     "He served as advisor to kings of three different kingdoms — and every one of them trusted him."
    ],
    "de": [
     "Daniel wurde in eine Grube mit hungrigen Löwen geworfen – am Morgen kam er heil und unversehrt heraus.",
     "Daniel entschlüsselte eine geheimnisvolle Schrift, die an der Wand des königlichen Palastes erschien.",
     "Er diente als Berater bei drei verschiedenen Königreichen – und alle vertrauten ihm."
    ],
    "es": [
     "A Daniel lo arrojaron a un foso con leones hambrientos, y por la mañana salió sano y salvo.",
     "Daniel descifró una misteriosa escritura que apareció en la pared del palacio real.",
     "Sirvió como consejero de reyes de tres reinos distintos, y todos confiaban en él."
    ],
    "pt": [
     "Daniel foi jogado numa cova cheia de leões famintos — e de manhã saiu são e salvo.",
     "Daniel decifrou uma escrita misteriosa que apareceu na parede do palácio real.",
     "Ele foi conselheiro de reis de três reinos diferentes — e todos confiavam nele."
    ],
    "fr": [
     "Daniel fut jeté dans une fosse pleine de lions affamés — et le matin, il en sortit sain et sauf.",
     "Daniel déchiffra une mystérieuse inscription apparue sur le mur du palais royal.",
     "Il servit de conseiller aux rois de trois royaumes différents — et tous lui faisaient confiance."
    ],
    "ar": [
     "أُلقي دانيال في حفرةٍ مع أسودٍ جائعة، وفي الصباح خرج سالمًا معافى.",
     "حلّ دانيال لغز الكتابة الغريبة التي ظهرت على جدار قصر الملك.",
     "كان مستشارًا لملوك ثلاث مملكات مختلفة، وكلهم وثقوا به."
    ]
   },
   "digit": {
    "num": "3",
    "label": {
     "ru": "царствам служил советником Даниил — и все цари ему доверяли",
     "en": "kingdoms Daniel served as advisor — and every king trusted him",
     "de": "Königreichen diente Daniel als Berater – und alle Könige vertrauten ihm",
     "es": "reinos sirvió Daniel como consejero — y todos los reyes confiaban en él",
     "pt": "reinos Daniel serviu como conselheiro — e todos os reis confiavam nele",
     "fr": "royaumes que Daniel a conseillés — et tous les rois lui faisaient confiance",
     "ar": "ملوكًا خدمهم دانيال مستشارًا — وكلهم وثقوا به"
    }
   },
   "think": {
    "ru": "Даниила все считали честным — даже завистники. Как зарабатывают такое доверие?",
    "en": "Everyone thought Daniel was honest — even his rivals. How do you earn that kind of trust?",
    "de": "Alle hielten Daniel für ehrlich – sogar seine Neider. Wie verdient man sich so viel Vertrauen?",
    "es": "Todos consideraban honesto a Daniel, hasta sus envidiosos. ¿Cómo se gana una confianza así?",
    "pt": "Todos achavam Daniel honesto — até seus invejosos. Como se conquista essa confiança?",
    "fr": "Tout le monde trouvait Daniel honnête — même ses envieux. Comment gagne-t-on une telle confiance ?",
    "ar": "كان الجميع يرون دانيال أمينًا — حتى الحاسدون. كيف يكسب المرء ثقة كهذه؟"
   },
   "poster": true
  },
  {
   "id": "heroes_16",
   "slug": "esther",
   "era": 6,
   "pair": "plots_19",
   "audioReady": true,
   "name": {
    "ru": "Эсфирь",
    "en": "Esther",
    "de": "Esther",
    "es": "Ester",
    "pt": "Ester",
    "fr": "Esther",
    "ar": "إستير"
   },
   "epithet": {
    "ru": "Храбрая царица",
    "en": "The brave queen",
    "de": "Die mutige Königin",
    "es": "La reina valiente",
    "pt": "A rainha corajosa",
    "fr": "La courageuse reine",
    "ar": "الملكة الشجاعة"
   },
   "facts": {
    "ru": [
     "Эсфирь скрывала, из какого она народа, пока не пришло время сказать правду.",
     "Прийти к царю без приглашения могло стоить жизни — но Эсфирь пришла и спасла свой народ.",
     "В память о её смелости каждый год празднуют весёлый праздник Пурим."
    ],
    "en": [
     "Esther kept her people a secret — until the moment came to tell the truth.",
     "Coming before the king unbidden could cost your life — but Esther came anyway, and saved her people.",
     "In memory of her courage, people still celebrate the joyful festival of Purim every year."
    ],
    "de": [
     "Esther verbarg, aus welchem Volk sie stammte, bis die Zeit kam, die Wahrheit zu sagen.",
     "Ungebeten zum König zu gehen, konnte das Leben kosten – doch Esther ging und rettete ihr Volk.",
     "Zur Erinnerung an ihren Mut feiert man jedes Jahr das fröhliche Purimfest."
    ],
    "es": [
     "Ester ocultó de qué pueblo era, hasta que llegó el momento de decir la verdad.",
     "Presentarse ante el rey sin ser llamada podía costar la vida, pero Ester lo hizo y salvó a su pueblo.",
     "En memoria de su valentía, cada año se celebra la alegre fiesta de Purim."
    ],
    "pt": [
     "Ester escondeu de qual povo vinha, até chegar a hora de dizer a verdade.",
     "Aparecer diante do rei sem ser chamada podia custar a vida — mas Ester foi e salvou seu povo.",
     "Em memória de sua coragem, celebra-se todo ano a alegre festa de Purim."
    ],
    "fr": [
     "Esther cachait à quel peuple elle appartenait, jusqu'au jour où il fallut dire la vérité.",
     "Se présenter au roi sans y être invitée pouvait coûter la vie — mais Esther osa, et sauva son peuple.",
     "En mémoire de son courage, on célèbre chaque année la joyeuse fête de Pourim."
    ],
    "ar": [
     "أخفت إستير أصلها حتى حان وقت قول الحقيقة.",
     "الدخول على الملك بلا دعوة قد يكلّف الحياة، لكن إستير دخلت وأنقذت شعبها.",
     "تخليدًا لشجاعتها، يُحتفل كل عام بعيدٍ بهيجٍ يُسمّى بوريم."
    ]
   },
   "digit": {
    "num": "1",
    "label": {
     "ru": "смелый шаг царицы спас целый народ",
     "en": "brave step by a queen saved an entire people",
     "de": "mutiger Schritt der Königin rettete ein ganzes Volk",
     "es": "paso valiente de una reina salvó a todo un pueblo",
     "pt": "passo corajoso de uma rainha salvou um povo inteiro",
     "fr": "pas courageux d'une reine a sauvé tout un peuple",
     "ar": "خطوة شجاعة من ملكة أنقذت شعبًا كاملًا"
    }
   },
   "think": {
    "ru": "Эсфирь рискнула собой ради других. Когда смелость важнее осторожности?",
    "en": "Esther risked herself for others. When does courage matter more than caution?",
    "de": "Esther riskierte sich selbst für andere. Wann ist Mut wichtiger als Vorsicht?",
    "es": "Ester se arriesgó por los demás. ¿Cuándo es más importante el valor que la prudencia?",
    "pt": "Ester arriscou a própria vida pelos outros. Quando a coragem é mais importante que a cautela?",
    "fr": "Esther a pris des risques pour aider les autres. Quand le courage compte-t-il plus que la prudence ?",
    "ar": "غامرت أستير بنفسها من أجل الآخرين. متى تكون الشجاعة أهم من الحذر؟"
   },
   "poster": true
  },
  {
   "id": "heroes_17",
   "slug": "jonah",
   "era": 6,
   "pair": "plots_18",
   "audioReady": true,
   "name": {
    "ru": "Иона",
    "en": "Jonah",
    "de": "Jona",
    "es": "Jonás",
    "pt": "Jonas",
    "fr": "Jonas",
    "ar": "يونان"
   },
   "epithet": {
    "ru": "Пассажир большой рыбы",
    "en": "Passenger of a great fish",
    "de": "Der Fahrgast des großen Fisches",
    "es": "El pasajero del gran pez",
    "pt": "O passageiro do grande peixe",
    "fr": "Le passager du grand poisson",
    "ar": "راكب الحوت الكبير"
   },
   "facts": {
    "ru": [
     "Иона пытался уплыть на корабле от важного поручения — но от него не уплывёшь.",
     "Три дня и три ночи Иона провёл внутри огромной рыбы — и вышел на берег живым.",
     "В городе Ниневии, куда он всё-таки пришёл, его послушались все — от царя до пастуха."
    ],
    "en": [
     "Jonah tried to sail away from an important task — but there's no sailing away from that.",
     "Jonah spent three days and three nights inside a huge fish — and came out alive on the shore.",
     "In the city of Nineveh, where he finally went, everyone listened to him — from the king to the shepherd."
    ],
    "de": [
     "Jona versuchte, mit einem Schiff vor einem wichtigen Auftrag zu fliehen – doch davor kann man nicht davonlaufen.",
     "Drei Tage und drei Nächte verbrachte Jona im Bauch eines riesigen Fisches – und kam lebend ans Ufer.",
     "In der Stadt Ninive, wohin er schließlich kam, hörten alle auf ihn – vom König bis zum Hirten."
    ],
    "es": [
     "Jonás intentó huir en un barco de una importante misión, pero de eso no se puede escapar.",
     "Pasó tres días y tres noches dentro de un enorme pez, y salió a la orilla sano y salvo.",
     "En la ciudad de Nínive, adonde finalmente llegó, todos lo escucharon, desde el rey hasta el pastor."
    ],
    "pt": [
     "Jonas tentou fugir de barco de uma missão importante — mas dela não se pode fugir.",
     "Três dias e três noites Jonas passou dentro de um peixe enorme — e saiu vivo na praia.",
     "Na cidade de Nínive, aonde finalmente chegou, todos o escutaram — do rei ao pastor."
    ],
    "fr": [
     "Jonas essaya de fuir en bateau une mission importante — mais on n'y échappe pas si facilement.",
     "Trois jours et trois nuits, Jonas resta dans le ventre d'un énorme poisson — puis il en ressortit vivant.",
     "Dans la ville de Ninive, où il finit par se rendre, tout le monde l'écouta — du roi jusqu'au berger."
    ],
    "ar": [
     "حاول يونان الهروب بالسفينة من مهمةٍ مهمة، لكن لا مهرب منها.",
     "بقي يونان ثلاثة أيامٍ وثلاث لياتٍ داخل حوتٍ عظيم، وخرج إلى الشاطئ حيًّا.",
     "وفي مدينة نينوى التي وصل إليها أخيرًا، استمع إليه الجميع، من الملك إلى الراعي."
    ]
   },
   "digit": {
    "num": "3",
    "label": {
     "ru": "дня и три ночи Иона провёл внутри огромной рыбы",
     "en": "days and three nights Jonah spent inside a huge fish",
     "de": "Tage und drei Nächte verbrachte Jona im Bauch eines riesigen Fisches",
     "es": "días y tres noches pasó Jonás dentro de un enorme pez",
     "pt": "dias e três noites Jonas passou dentro de um peixe enorme",
     "fr": "jours et trois nuits Jonas a passés dans le ventre d'un énorme poisson",
     "ar": "أيام وثلاث ليالٍ قضاها يونان داخل حوت ضخم"
    }
   },
   "think": {
    "ru": "Можно ли убежать от важного дела? Что из этого обычно выходит?",
    "en": "Can you run away from something important? What usually happens when you try?",
    "de": "Kann man vor einer wichtigen Aufgabe weglaufen? Was kommt dabei meistens heraus?",
    "es": "¿Se puede huir de algo importante que debemos hacer? ¿Qué suele pasar cuando lo intentamos?",
    "pt": "É possível fugir de uma tarefa importante? O que costuma acontecer depois?",
    "fr": "Peut-on fuir une mission importante ? Qu'est-ce que cela donne, en général ?",
    "ar": "هل يمكن الهروب من مهمة مهمة؟ وإلى أين يقود ذلك غالبًا؟"
   },
   "poster": true,
   "book": "jonah"
  },
  {
   "id": "heroes_18",
   "slug": "mary",
   "era": 7,
   "pair": "plots_20",
   "audioReady": true,
   "name": {
    "ru": "Мария",
    "en": "Mary",
    "de": "Maria",
    "es": "María",
    "pt": "Maria",
    "fr": "Marie",
    "ar": "مريم"
   },
   "epithet": {
    "ru": "Мама из Вифлеема",
    "en": "The Mother from Bethlehem",
    "de": "Mutter aus Bethlehem",
    "es": "La mamá de Belén",
    "pt": "A mamãe de Belém",
    "fr": "La maman de Bethléem",
    "ar": "الأم من بيت لحم"
   },
   "facts": {
    "ru": [
     "Мария отправилась в дальний путь в город Вифлеем, когда ждала ребёнка.",
     "Её младенец родился не во дворце, а в хлеву — и первой кроваткой стали ясли с сеном.",
     "Мария бережно хранила в сердце всё удивительное, что происходило с её сыном."
    ],
    "en": [
     "Mary set out on a long journey to the town of Bethlehem while expecting her baby.",
     "Her little one wasn't born in a palace, but in a stable — and his first bed was a manger filled with hay.",
     "Mary quietly treasured in her heart all the wonderful things that happened with her son."
    ],
    "de": [
     "Maria machte sich auf eine weite Reise nach Bethlehem, als sie ein Kind erwartete.",
     "Ihr Baby kam nicht in einem Palast zur Welt, sondern in einem Stall – und die erste Wiege war eine Futterkrippe voll Heu.",
     "Maria bewahrte alles Wunderbare, was mit ihrem Sohn geschah, tief in ihrem Herzen."
    ],
    "es": [
     "María emprendió un largo viaje hasta la ciudad de Belén cuando esperaba un bebé.",
     "Su hijito no nació en un palacio, sino en un establo, y su primera camita fue un pesebre con paja.",
     "María guardaba con cariño en su corazón todo lo maravilloso que le sucedía a su hijo."
    ],
    "pt": [
     "Maria fez uma longa viagem até a cidade de Belém, esperando seu bebê.",
     "Seu filhinho não nasceu num palácio, mas num estábulo — e o primeiro berço foi uma manjedoura cheia de feno.",
     "Maria guardava com carinho no coração tudo o que acontecia de maravilhoso com seu filho."
    ],
    "fr": [
     "Marie a fait un long voyage jusqu'à la ville de Bethléem alors qu'elle attendait un bébé.",
     "Son petit garçon n'est pas né dans un palais, mais dans une étable — et son premier lit fut une mangeoire remplie de paille.",
     "Marie gardait précieusement dans son cœur tout ce qui arrivait à son fils."
    ],
    "ar": [
     "سافرت مريم رحلة طويلة إلى مدينة بيت لحم وهي تنتظر مولودها.",
     "لم يولد طفلها في قصر، بل في حظيرة للحيوانات، وكان أول سرير له مذودًا مملوءًا بالتبن.",
     "كانت مريم تحفظ في قلبها كل الأمور العجيبة التي حدثت لابنها."
    ]
   },
   "digit": {
    "num": "150",
    "label": {
     "ru": "километров — примерно такой путь прошла Мария до Вифлеема",
     "en": "kilometers — roughly how far Mary traveled to Bethlehem",
     "de": "Kilometer – etwa diesen Weg legte Maria bis nach Bethlehem zurück",
     "es": "kilómetros recorrió María, más o menos, hasta llegar a Belén",
     "pt": "quilômetros — foi mais ou menos essa a distância que Maria percorreu até Belém",
     "fr": "kilomètres — c'est à peu près la distance que Marie a parcourue jusqu'à Bethléem",
     "ar": "كيلومترًا — تقريبًا هذه المسافة التي سارتها مريم إلى بيت لحم"
    }
   },
   "think": {
    "ru": "Младенца уложили в ясли с сеном. Важно ли, где родиться, чтобы вырасти великим?",
    "en": "The baby was laid in a manger full of hay. Does it matter where you're born to grow up great?",
    "de": "Das Kind wurde in eine Krippe mit Heu gelegt. Kommt es darauf an, wo man geboren wird, um groß zu werden?",
    "es": "Al niño lo acostaron en un pesebre con paja. ¿Importa dónde se nace para llegar a ser grande?",
    "pt": "O bebê foi colocado numa manjedoura com feno. Importa onde a gente nasce para crescer e ser grande?",
    "fr": "Le bébé a été couché dans une mangeoire pleine de paille. Faut-il être né au bon endroit pour devenir grand ?",
    "ar": "وُضع الطفل في مذود مليء بالتبن. هل يهم أين يولد المرء ليصبح عظيمًا؟"
   },
   "poster": true,
   "book": "nativity"
  },
  {
   "id": "heroes_19",
   "slug": "joseph_carpenter",
   "era": 7,
   "pair": null,
   "audioReady": true,
   "name": {
    "ru": "Иосиф-плотник",
    "en": "Joseph the Carpenter",
    "de": "Josef der Zimmermann",
    "es": "José el carpintero",
    "pt": "José, o carpinteiro",
    "fr": "Joseph le charpentier",
    "ar": "يوسف النجار"
   },
   "epithet": {
    "ru": "Мастер из Назарета",
    "en": "The Craftsman from Nazareth",
    "de": "Meister aus Nazareth",
    "es": "El artesano de Nazaret",
    "pt": "O mestre de Nazaré",
    "fr": "L'artisan de Nazareth",
    "ar": "الحرفي من الناصرة"
   },
   "facts": {
    "ru": [
     "Иосиф был плотником: он строгал, пилил и собирал мебель и дома.",
     "Он защитил Марию и младенца, увезя их от опасности в далёкий Египет.",
     "Своему ремеслу Иосиф научил и подраставшего Иисуса."
    ],
    "en": [
     "Joseph was a carpenter: he planed wood, sawed boards, and built furniture and houses.",
     "He kept Mary and the baby safe by taking them far away to Egypt, out of danger.",
     "Joseph also taught his craft to young Jesus as he grew up."
    ],
    "de": [
     "Josef war Zimmermann: Er hobelte, sägte und baute Möbel und Häuser.",
     "Er beschützte Maria und das Baby und brachte sie in Sicherheit bis ins ferne Ägypten.",
     "Sein Handwerk brachte Josef auch dem heranwachsenden Jesus bei."
    ],
    "es": [
     "José era carpintero: cepillaba, cortaba y armaba muebles y casas.",
     "Protegió a María y al niño, llevándolos lejos del peligro hasta Egipto.",
     "José le enseñó su oficio a Jesús mientras el niño crecía."
    ],
    "pt": [
     "José era carpinteiro: lixava, serrava e montava móveis e casas.",
     "Ele protegeu Maria e o bebê, levando-os para longe do perigo, até o distante Egito.",
     "José também ensinou seu ofício a Jesus, à medida que ele crescia."
    ],
    "fr": [
     "Joseph était charpentier : il rabotait, sciait et fabriquait des meubles et des maisons.",
     "Il a protégé Marie et le bébé en les emmenant loin du danger, jusqu'en Égypte.",
     "Joseph a appris son métier au petit Jésus, qui grandissait à ses côtés."
    ],
    "ar": [
     "كان يوسف نجّارًا، يقصّ الخشب وينشره ويصنع منه الأثاث والبيوت.",
     "حمى يوسف مريم والطفل، فأخذهما بعيدًا عن الخطر إلى أرض مصر.",
     "علّم يوسف يسوع، وهو يكبر، حرفة النجارة."
    ]
   },
   "digit": {
    "num": "1",
    "label": {
     "ru": "ремесло плотника кормило всю семью — ему Иосиф научил и сына",
     "en": "trade of a carpenter fed the whole family — Joseph taught it to his son too",
     "de": "Handwerk des Zimmermanns ernährte die ganze Familie – Josef brachte es auch seinem Sohn bei",
     "es": "oficio de carpintero alimentó a toda la familia — y José se lo enseñó a su hijo",
     "pt": "ofício de carpinteiro sustentava toda a família — José ensinou o mesmo ao filho",
     "fr": "métier de charpentier a fait vivre toute la famille — Joseph l'a aussi enseigné à son fils",
     "ar": "حرفة النجارة أطعمت الأسرة كلها — وعلّمها يوسف لابنه أيضًا"
    }
   },
   "think": {
    "ru": "Иосиф увёз семью от опасности в далёкий Египет. Что значит заботиться о своих?",
    "en": "Joseph took his family away from danger to faraway Egypt. What does it mean to look after your own?",
    "de": "Josef brachte seine Familie vor der Gefahr ins ferne Ägypten. Was bedeutet es, für die Seinen zu sorgen?",
    "es": "José llevó a su familia lejos, a Egipto, para protegerla del peligro. ¿Qué significa cuidar de los tuyos?",
    "pt": "José levou a família para longe do perigo, até o Egito. O que significa cuidar dos seus?",
    "fr": "Joseph a emmené sa famille loin du danger, jusqu'en Égypte. Que signifie prendre soin des siens ?",
    "ar": "أخذ يوسف أسرته بعيدًا عن الخطر إلى مصر البعيدة. ماذا يعني أن تهتم بأهلك؟"
   },
   "poster": true,
   "book": "nativity"
  },
  {
   "id": "heroes_20",
   "slug": "magi",
   "era": 7,
   "pair": null,
   "audioReady": true,
   "name": {
    "ru": "Волхвы",
    "en": "The Wise Men",
    "de": "Die Weisen aus dem Morgenland",
    "es": "Los Reyes Magos",
    "pt": "Os Reis Magos",
    "fr": "Les rois mages",
    "ar": "المجوس"
   },
   "epithet": {
    "ru": "Мудрецы, шедшие за звездой",
    "en": "Sages Who Followed a Star",
    "de": "Gelehrte, die dem Stern folgten",
    "es": "Los sabios que siguieron la estrella",
    "pt": "Os sábios que seguiram a estrela",
    "fr": "Les sages qui suivaient l'étoile",
    "ar": "الحكماء الذين تبعوا النجم"
   },
   "facts": {
    "ru": [
     "Волхвы были учёными-звездочётами из восточных стран — они умели читать небо.",
     "Новая яркая звезда вела их через пустыни много дней — до самого Вифлеема.",
     "Младенцу они принесли три дара: золото, ладан и мирру."
    ],
    "en": [
     "The Wise Men were scholars from lands in the East who studied the stars — they knew how to read the sky.",
     "A bright new star led them across the desert for many days, all the way to Bethlehem.",
     "For the little baby, they brought three gifts: gold, frankincense, and myrrh."
    ],
    "de": [
     "Die Weisen waren Sterndeuter aus fernen Ländern im Osten – sie konnten den Himmel lesen.",
     "Ein neuer, heller Stern führte sie viele Tage lang durch die Wüste – bis nach Bethlehem.",
     "Dem Baby brachten sie drei Geschenke: Gold, Weihrauch und Myrrhe."
    ],
    "es": [
     "Los Reyes Magos eran sabios astrónomos de tierras de oriente que sabían leer el cielo.",
     "Una nueva estrella brillante los guió por el desierto durante muchos días, hasta llegar a Belén.",
     "Al niño le trajeron tres regalos: oro, incienso y mirra."
    ],
    "pt": [
     "Os Reis Magos eram sábios estudiosos das estrelas, vindos de terras do Oriente.",
     "Uma estrela nova e brilhante os guiou pelos desertos, por muitos dias, até chegarem a Belém.",
     "Ao menino, eles trouxeram três presentes: ouro, incenso e mirra."
    ],
    "fr": [
     "Les rois mages étaient des savants venus de pays lointains, à l'est — ils savaient lire le ciel.",
     "Une étoile nouvelle et brillante les a guidés à travers le désert pendant de nombreux jours, jusqu'à Bethléem.",
     "Ils ont offert au bébé trois cadeaux : de l'or, de l'encens et de la myrrhe."
    ],
    "ar": [
     "كان المجوس علماء فلك من بلاد الشرق، يعرفون كيف يقرؤون السماء.",
     "قاد نجم جديد ولامع خطاهم عبر الصحارى أيامًا طويلة، حتى وصلوا إلى بيت لحم.",
     "قدّموا للطفل ثلاث هدايا: الذهب واللبان والمرّ."
    ]
   },
   "digit": {
    "num": "3",
    "label": {
     "ru": "дара принесли волхвы: золото, ладан и мирру",
     "en": "gifts the wise men brought: gold, frankincense, and myrrh",
     "de": "Gaben brachten die Weisen: Gold, Weihrauch und Myrrhe",
     "es": "regalos trajeron los reyes magos: oro, incienso y mirra",
     "pt": "presentes os magos trouxeram: ouro, incenso e mirra",
     "fr": "cadeaux apportés par les rois mages : de l'or, de l'encens et de la myrrhe",
     "ar": "هدايا قدّمها المجوس: الذهب واللبان والمرّ"
    }
   },
   "think": {
    "ru": "Волхвы шли за звездой много дней. Ради чего стоит отправиться в далёкий путь?",
    "en": "The wise men followed a star for many days. What's worth a long journey?",
    "de": "Die Weisen folgten viele Tage lang dem Stern. Wofür lohnt es sich, einen weiten Weg auf sich zu nehmen?",
    "es": "Los reyes magos siguieron una estrella durante muchos días. ¿Por qué vale la pena emprender un viaje tan largo?",
    "pt": "Os magos seguiram a estrela por muitos dias. Por que vale a pena partir numa jornada longa?",
    "fr": "Les rois mages ont suivi l'étoile pendant de nombreux jours. Pour quoi vaut-il la peine de partir loin ?",
    "ar": "سار المجوس خلف النجم أيامًا طويلة. من أجل ماذا يستحق المرء أن يخوض رحلة بعيدة؟"
   },
   "poster": true,
   "book": "nativity"
  }
 ],
 "plots": [
  {
   "id": "plots_01",
   "slug": "creation",
   "era": 1,
   "pair": null,
   "imgReady": true,
   "audioReady": true,
   "emoji": "🌍",
   "name": {
    "ru": "Сотворение мира",
    "en": "The Creation of the World",
    "de": "Die Erschaffung der Welt",
    "es": "La creación del mundo",
    "pt": "A Criação do Mundo",
    "fr": "La création du monde",
    "ar": "خلق العالم"
   },
   "source": {
    "ru": "Книга Бытия",
    "en": "Book of Genesis",
    "de": "Das Buch Genesis",
    "es": "Libro del Génesis",
    "pt": "Livro de Gênesis",
    "fr": "Le livre de la Genèse",
    "ar": "سفر التكوين"
   },
   "story": {
    "ru": "За шесть дней, говорит первая страница Библии, появилось всё: свет и тьма, небо и море, деревья и звёзды, рыбы, птицы и звери. А седьмой день стал днём отдыха. С тех пор в неделе семь дней — и один из них выходной.",
    "en": "In six days, the very first page of the Bible tells us, everything came to be: light and darkness, sky and sea, trees and stars, fish, birds, and animals. Then the seventh day became a day of rest. That's why a week has seven days — and one of them is for resting.",
    "de": "In sechs Tagen, so erzählt die erste Seite der Bibel, entstand alles: Licht und Dunkelheit, Himmel und Meer, Bäume und Sterne, Fische, Vögel und Tiere. Der siebte Tag aber wurde ein Tag der Ruhe. Seitdem hat die Woche sieben Tage – und einer davon ist frei.",
    "es": "En seis días, cuenta la primera página de la Biblia, apareció todo: la luz y la oscuridad, el cielo y el mar, los árboles y las estrellas, los peces, las aves y los animales. Y el séptimo día fue un día de descanso. Desde entonces la semana tiene siete días, y uno de ellos es para descansar.",
    "pt": "Em seis dias, diz a primeira página da Bíblia, tudo surgiu: a luz e a escuridão, o céu e o mar, as árvores e as estrelas, os peixes, as aves e os animais. E o sétimo dia virou dia de descanso. Desde então, a semana tem sete dias — e um deles é para descansar.",
    "fr": "En six jours, raconte la toute première page de la Bible, tout est apparu : la lumière et la nuit, le ciel et la mer, les arbres et les étoiles, les poissons, les oiseaux et les animaux. Le septième jour est devenu un jour de repos. Depuis, la semaine compte sept jours — et l'un d'eux est pour se reposer.",
    "ar": "في ستة أيام، كما تخبرنا أولى صفحات الكتاب المقدس، ظهر كل شيء: النور والظلام، السماء والبحر، الأشجار والنجوم، والأسماك والطيور والحيوانات. وصار اليوم السابع يوم راحة. ومنذ ذلك الحين صار في الأسبوع سبعة أيام، أحدها للراحة."
   },
   "findIt": {
    "ru": "солнце и луну",
    "en": "the sun and the moon",
    "de": "die Sonne und den Mond",
    "es": "el sol y la luna",
    "pt": "o sol e a lua",
    "fr": "le soleil et la lune",
    "ar": "الشمس والقمر"
   },
   "digit": {
    "num": "7",
    "label": {
     "ru": "дней в неделе — с тех самых пор, и один из них выходной",
     "en": "days in the week — ever since then, and one of them is a day off",
     "de": "Tage hat die Woche – seit damals, und einer davon ist frei",
     "es": "días tiene la semana desde entonces, y uno de ellos es de descanso",
     "pt": "dias na semana — desde então, e um deles é de descanso",
     "fr": "jours dans la semaine — depuis ce jour-là, et l'un d'eux est un jour de repos",
     "ar": "أيام في الأسبوع — منذ ذلك الحين، وواحد منها للراحة"
    }
   },
   "wow": {
    "ru": "Слово «суббота» происходит от древнего «шаббат» — так назывался день отдыха.",
    "en": "The word \"sabbath\" comes from an ancient word meaning \"to rest\" — the day set aside for resting.",
    "de": "Das Wort „Sabbat“ stammt vom alten „Schabbat“ – so hieß der Tag der Ruhe.",
    "es": "La palabra «sábado» viene del antiguo «shabat», que significaba día de descanso.",
    "pt": "A palavra \"sábado\" vem do antigo \"shabat\" — assim se chamava o dia de descanso.",
    "fr": "Le mot « sabbat » vient d'un mot ancien qui désignait le jour du repos.",
    "ar": "كلمة «السبت» أصلها كلمة قديمة تعني يوم الراحة والتوقف عن العمل."
   },
   "poster": true,
   "findAt": {
    "x": 27,
    "y": 22,
    "r": 15.3
   },
   "book": "sotvorenie-mira",
   "findAtP": {
    "x": 27,
    "y": 25,
    "r": 16
   }
  },
  {
   "id": "plots_02",
   "slug": "eden",
   "era": 1,
   "pair": null,
   "imgReady": true,
   "audioReady": true,
   "emoji": "🌳",
   "name": {
    "ru": "Эдемский сад",
    "en": "The Garden of Eden",
    "de": "Der Garten Eden",
    "es": "El jardín del Edén",
    "pt": "O Jardim do Éden",
    "fr": "Le jardin d'Éden",
    "ar": "جنة عدن"
   },
   "source": {
    "ru": "Книга Бытия",
    "en": "Book of Genesis",
    "de": "Das Buch Genesis",
    "es": "Libro del Génesis",
    "pt": "Livro de Gênesis",
    "fr": "Le livre de la Genèse",
    "ar": "سفر التكوين"
   },
   "story": {
    "ru": "Первые люди, Адам и Ева, жили в прекрасном саду, где всегда было тепло и всего хватало. Адам придумал имена всем животным — попробуй-ка назвать каждого! Но одно-единственное правило люди нарушили, и сад пришлось покинуть.",
    "en": "The very first people, Adam and Eve, lived in a beautiful garden where it was always warm and there was plenty of everything. Adam thought up names for every animal — just try naming them all yourself! But the two of them broke the one single rule they'd been given, and had to leave the garden.",
    "de": "Die ersten Menschen, Adam und Eva, lebten in einem wunderschönen Garten, wo es immer warm war und es an nichts fehlte. Adam dachte sich Namen für alle Tiere aus – versuch doch mal, jedes einzelne zu benennen! Doch eine einzige Regel brachen die Menschen, und so mussten sie den Garten verlassen.",
    "es": "Los primeros seres humanos, Adán y Eva, vivían en un jardín precioso donde siempre hacía calor y nunca faltaba nada. Adán inventó un nombre para cada animal: ¡inténtalo tú, a ver si puedes nombrarlos a todos! Pero rompieron la única regla que tenían, y tuvieron que dejar el jardín.",
    "pt": "Os primeiros seres humanos, Adão e Eva, viviam num jardim lindo, onde sempre fazia calor e havia de tudo. Adão inventou um nome para cada animal — tente só nomear todos eles! Mas as pessoas quebraram a única regra que existia, e tiveram que deixar o jardim.",
    "fr": "Les premiers humains, Adam et Ève, vivaient dans un magnifique jardin où il faisait toujours doux et où rien ne manquait. Adam a inventé un nom pour chaque animal — essaie donc de tous les nommer ! Mais un jour, ils ont enfreint la seule règle à respecter, et ils ont dû quitter le jardin.",
    "ar": "عاش أول إنسانَين، آدم وحواء، في جنة جميلة كان فيها الدفء دائمًا ولا ينقص شيء. ابتكر آدم أسماء لكل الحيوانات، فهلّا حاولتَ أن تسمّي كل واحد منها! لكنهما خالفا قاعدة واحدة فقط، فاضطرا إلى مغادرة الجنة."
   },
   "findIt": {
    "ru": "дерево с плодами",
    "en": "the tree with fruit",
    "de": "den Baum mit den Früchten",
    "es": "el árbol con frutos",
    "pt": "a árvore com frutos",
    "fr": "l'arbre aux fruits",
    "ar": "شجرة مثمرة"
   },
   "digit": {
    "num": "1",
    "label": {
     "ru": "единственное правило было в саду — и его нарушили",
     "en": "only one rule was in the garden — and it got broken",
     "de": "einzige Regel gab es im Garten – und sie wurde gebrochen",
     "es": "única regla había en el jardín, y la rompieron",
     "pt": "única regra havia no jardim — e foi justamente ela que quebraram",
     "fr": "seule règle existait dans le jardin — et elle a été brisée",
     "ar": "قاعدة واحدة فقط كانت في الحديقة — وقد كُسرت"
    }
   },
   "wow": {
    "ru": "Слово «парадиз» — рай — пришло из древнего языка, где означало прекрасный сад за оградой.",
    "en": "The word \"paradise\" came from an old language, where it meant a beautiful walled garden.",
    "de": "Das Wort „Paradies“ kommt aus einer alten Sprache und bedeutete ein schöner, ummauerter Garten.",
    "es": "La palabra «paraíso» viene de una lengua antigua, donde significaba un hermoso jardín cercado.",
    "pt": "A palavra \"paraíso\" vem de uma língua antiga, em que significava um belo jardim cercado por um muro.",
    "fr": "Le mot « paradis » vient d'une langue ancienne où il désignait un beau jardin entouré d'un mur.",
    "ar": "كلمة «الفردوس» جاءت من لغة قديمة، وكانت تعني حديقة جميلة محاطة بسور."
   },
   "poster": true,
   "findAt": {
    "x": 42,
    "y": 22,
    "r": 16
   },
   "book": "sotvorenie-mira",
   "findAtP": {
    "x": 40,
    "y": 33,
    "r": 16
   }
  },
  {
   "id": "plots_03",
   "slug": "ark",
   "era": 1,
   "pair": "heroes_01",
   "imgReady": true,
   "audioReady": true,
   "emoji": "🚢",
   "book": "noev-kovcheg",
   "name": {
    "ru": "Ноев ковчег",
    "en": "Noah's Ark",
    "de": "Die Arche Noah",
    "es": "El arca de Noé",
    "pt": "A Arca de Noé",
    "fr": "L'arche de Noé",
    "ar": "سفينة نوح"
   },
   "source": {
    "ru": "Книга Бытия",
    "en": "Book of Genesis",
    "de": "Das Buch Genesis",
    "es": "Libro del Génesis",
    "pt": "Livro de Gênesis",
    "fr": "Le livre de la Genèse",
    "ar": "سفر التكوين"
   },
   "story": {
    "ru": "Сорок дней и ночей шёл дождь, и вода покрыла даже вершины гор. Но огромный ковчег плыл, а внутри было тепло: жирафы, львы, мыши и голуби ждали, когда покажется земля. Первым её нашёл голубь — он вернулся с оливковой веточкой в клюве.",
    "en": "Rain fell for forty days and forty nights, and the water covered even the mountaintops. But the great ark floated on, warm and cozy inside: giraffes, lions, mice, and doves all waited for dry land to appear. A dove was the first to find it — she came back with an olive branch in her beak.",
    "de": "Vierzig Tage und Nächte lang regnete es, und das Wasser bedeckte sogar die Gipfel der Berge. Doch die große Arche schwamm, und drinnen war es warm: Giraffen, Löwen, Mäuse und Tauben warteten darauf, dass endlich Land zu sehen war. Als Erste fand eine Taube das Land – sie kehrte mit einem Olivenzweig im Schnabel zurück.",
    "es": "Llovió durante cuarenta días y cuarenta noches, y el agua cubrió hasta las cimas de las montañas. Pero el arca enorme flotaba, y dentro todo era calidito: jirafas, leones, ratones y palomas esperaban a que apareciera tierra firme. La primera en encontrarla fue una paloma, que volvió con una ramita de olivo en el pico.",
    "pt": "Choveu por quarenta dias e quarenta noites, e a água cobriu até os topos das montanhas. Mas a arca enorme flutuava, e lá dentro estava tudo aconchegante: girafas, leões, ratinhos e pombas esperavam a terra aparecer. Foi a pomba quem a encontrou primeiro — voltou trazendo um ramo de oliveira no bico.",
    "fr": "Pendant quarante jours et quarante nuits, la pluie est tombée, et l'eau a recouvert même le sommet des montagnes. Mais une immense arche flottait, bien au chaud à l'intérieur : girafes, lions, souris et colombes attendaient de voir apparaître la terre. C'est une colombe qui l'a trouvée la première — elle est revenue avec un petit rameau d'olivier dans son bec.",
    "ar": "هطل المطر أربعين يومًا وأربعين ليلة، حتى غطّى الماء قمم الجبال. لكن السفينة الضخمة ظلّت طافية، وكان الدفء بداخلها: الزرافات والأسود والفئران والحمائم تنتظر أن تظهر اليابسة. وأول من وجدها كانت حمامة، عادت وفي منقارها غصن زيتون."
   },
   "findIt": {
    "ru": "голубя с веточкой",
    "en": "a dove with a small branch",
    "de": "die Taube mit dem Zweig",
    "es": "una paloma con una ramita",
    "pt": "a pomba com um galho",
    "fr": "une colombe avec une petite branche",
    "ar": "الحمامة التي تحمل غصنًا"
   },
   "digit": {
    "num": "150",
    "label": {
     "ru": "метров — примерно такой длины был ковчег: как полтора футбольных поля",
     "en": "meters — roughly how long the ark was: about one and a half football fields",
     "de": "Meter lang war etwa die Arche – wie anderthalb Fußballfelder",
     "es": "metros medía el arca, más o menos: como un campo y medio de fútbol",
     "pt": "metros — foi mais ou menos esse o tamanho da arca: como um campo e meio de futebol",
     "fr": "mètres, à peu près la longueur de l'arche : comme un terrain et demi de football",
     "ar": "مترًا — هذا تقريبًا طول الفلك: بطول ملعبَي كرة قدم ونصف"
    }
   },
   "wow": {
    "ru": "Голубь с оливковой веточкой с тех пор стал знаком мира во всём мире.",
    "en": "A dove with an olive branch has been a sign of peace all over the world ever since.",
    "de": "Die Taube mit dem Olivenzweig ist seitdem auf der ganzen Welt ein Zeichen des Friedens.",
    "es": "La paloma con la ramita de olivo se convirtió, desde entonces, en símbolo de paz en todo el mundo.",
    "pt": "A pomba com o ramo de oliveira se tornou, desde então, um símbolo de paz no mundo todo.",
    "fr": "La colombe avec son rameau d'olivier est depuis devenue le symbole de la paix dans le monde entier.",
    "ar": "الحمامة التي تحمل غصن زيتون أصبحت منذ ذلك الحين رمزًا للسلام في كل العالم."
   },
   "poster": true,
   "findAt": {
    "x": 72,
    "y": 35,
    "r": 16
   },
   "findAtP": {
    "x": 76,
    "y": 26,
    "r": 13.5
   }
  },
  {
   "id": "plots_04",
   "slug": "rainbow",
   "era": 1,
   "pair": null,
   "imgReady": true,
   "audioReady": true,
   "emoji": "🌈",
   "name": {
    "ru": "Радуга-обещание",
    "en": "The Rainbow Promise",
    "de": "Der Regenbogen des Versprechens",
    "es": "El arcoíris de la promesa",
    "pt": "O arco-íris da promessa",
    "fr": "L'arc-en-ciel de la promesse",
    "ar": "قوس قزح الوعد"
   },
   "source": {
    "ru": "Книга Бытия",
    "en": "Book of Genesis",
    "de": "1. Buch Mose",
    "es": "Libro del Génesis",
    "pt": "Livro de Gênesis",
    "fr": "Livre de la Genèse",
    "ar": "سفر التكوين"
   },
   "story": {
    "ru": "Когда потоп закончился и семья Ноя вышла на сушу, в небе засияла первая радуга. Она стала знаком обещания: такого потопа больше не будет никогда. С тех пор радуга после дождя — как подпись под этим обещанием.",
    "en": "When the flood was over and Noah's family stepped onto dry land, the very first rainbow lit up the sky. It was a sign of a promise: a flood like that would never happen again. Ever since, a rainbow after rain is like a signature under that promise.",
    "de": "Als die Flut vorüber war und Noahs Familie festen Boden unter den Füßen hatte, erschien am Himmel der allererste Regenbogen. Er war ein Zeichen des Versprechens: Nie wieder soll solch eine Flut die Erde treffen. Seitdem ist der Regenbogen nach dem Regen wie eine Unterschrift unter diesem Versprechen.",
    "es": "Cuando el diluvio terminó y la familia de Noé pisó tierra firme, brilló en el cielo el primer arcoíris. Era la señal de una promesa: nunca más habría un diluvio así. Por eso, cada arcoíris después de la lluvia es como la firma de esa promesa.",
    "pt": "Quando o dilúvio terminou e a família de Noé pisou em terra firme, o primeiro arco-íris brilhou no céu. Ele era o sinal de uma promessa: nunca mais haveria um dilúvio como aquele. Desde então, o arco-íris depois da chuva é como a assinatura dessa promessa.",
    "fr": "Quand le déluge prit fin et que la famille de Noé posa enfin le pied sur la terre ferme, un arc-en-ciel brilla pour la toute première fois dans le ciel. Il devint le signe d'une promesse : un tel déluge ne reviendrait plus jamais. Depuis ce jour, l'arc-en-ciel après la pluie est comme la signature de cette promesse.",
    "ar": "عندما انتهى الطوفان وخرجت عائلة نوح إلى اليابسة، ظهر في السماء أول قوس قزح. كان علامة على وعدٍ جميل: لن يحدث طوفان كهذا أبدًا. ومنذ ذلك اليوم، كلما ظهر قوس قزح بعد المطر، صار كأنه توقيع على هذا الوعد."
   },
   "findIt": {
    "ru": "все семь цветов радуги",
    "en": "all seven colors of the rainbow",
    "de": "alle sieben Farben des Regenbogens",
    "es": "los siete colores del arcoíris",
    "pt": "as sete cores do arco-íris",
    "fr": "les sept couleurs de l'arc-en-ciel",
    "ar": "ألوان قوس قزح السبعة كلها"
   },
   "digit": {
    "num": "7",
    "label": {
     "ru": "цветов у радуги — попробуй назвать все по порядку",
     "en": "colors in a rainbow — try naming them all in order",
     "de": "Farben hat der Regenbogen – versuch, sie alle der Reihe nach zu nennen",
     "es": "colores tiene el arcoíris: intenta nombrarlos todos en orden",
     "pt": "cores tem o arco-íris — tente dizer todas em ordem",
     "fr": "couleurs a l'arc-en-ciel — essaie de toutes les nommer dans l'ordre",
     "ar": "ألوان في قوس قزح — حاول أن تعدّها كلها بالترتيب"
    }
   },
   "wow": {
    "ru": "Радугу видно только когда солнце светит тебе в спину, а дождь — впереди.",
    "en": "You can only see a rainbow when the sun is behind you and the rain is in front of you.",
    "de": "Einen Regenbogen sieht man nur, wenn die Sonne hinter dir scheint und der Regen vor dir fällt.",
    "es": "El arcoíris solo se ve cuando el sol brilla a tu espalda y la lluvia cae delante de ti.",
    "pt": "O arco-íris só aparece quando o sol brilha nas suas costas e a chuva cai na sua frente.",
    "fr": "On ne voit l'arc-en-ciel que lorsque le soleil brille dans ton dos et que la pluie tombe devant toi.",
    "ar": "لا يظهر قوس قزح إلا عندما تكون الشمس خلف ظهرك والمطر أمامك."
   },
   "poster": true,
   "findAt": {
    "x": 50,
    "y": 20,
    "r": 16
   },
   "book": "noev-kovcheg",
   "findAtP": {
    "x": 57,
    "y": 25,
    "r": 16
   }
  },
  {
   "id": "plots_05",
   "slug": "babel",
   "era": 1,
   "pair": null,
   "imgReady": true,
   "audioReady": true,
   "emoji": "🗼",
   "name": {
    "ru": "Вавилонская башня",
    "en": "The Tower of Babel",
    "de": "Der Turmbau zu Babel",
    "es": "La torre de Babel",
    "pt": "A Torre de Babel",
    "fr": "La tour de Babel",
    "ar": "برج بابل"
   },
   "source": {
    "ru": "Книга Бытия",
    "en": "Book of Genesis",
    "de": "1. Buch Mose",
    "es": "Libro del Génesis",
    "pt": "Livro de Gênesis",
    "fr": "Livre de la Genèse",
    "ar": "سفر التكوين"
   },
   "story": {
    "ru": "Когда-то все люди на земле говорили на одном языке. Они решили построить башню до самого неба — и строили, пока вдруг не заговорили на разных языках. Никто никого не понимал, стройка остановилась, а люди разошлись по всей земле.",
    "en": "Long ago, everyone on earth spoke the same language. People decided to build a tower reaching all the way to the sky — and they kept building until, all of a sudden, they began speaking different languages. No one could understand anyone else, the building stopped, and people scattered across the whole earth.",
    "de": "Vor langer Zeit sprachen alle Menschen auf der Erde dieselbe Sprache. Sie beschlossen, einen Turm bis zum Himmel zu bauen – und bauten und bauten, bis sie plötzlich in ganz verschiedenen Sprachen sprachen. Keiner verstand mehr den anderen, der Bau kam zum Stillstand, und die Menschen zogen in alle Richtungen der Erde.",
    "es": "Hace mucho tiempo, todas las personas del mundo hablaban el mismo idioma. Decidieron construir una torre tan alta que llegara al cielo, y siguieron construyendo hasta que, de pronto, empezaron a hablar idiomas distintos. Nadie entendía a nadie, la obra se detuvo y la gente se esparció por toda la tierra.",
    "pt": "Havia um tempo em que todas as pessoas do mundo falavam a mesma língua. Elas decidiram construir uma torre até o céu — e construíram, até que, de repente, começaram a falar línguas diferentes. Ninguém entendia mais ninguém, a obra parou, e as pessoas se espalharam por toda a terra.",
    "fr": "Autrefois, tous les hommes de la terre parlaient la même langue. Ils décidèrent de construire une tour qui monterait jusqu'au ciel. Ils bâtissaient sans relâche, quand soudain ils se mirent à parler des langues différentes. Plus personne ne comprenait personne, le chantier s'arrêta, et les hommes se dispersèrent sur toute la terre.",
    "ar": "قديمًا، كان جميع الناس في الأرض يتكلمون لغة واحدة. قرروا أن يبنوا برجًا يصل إلى السماء، وظلوا يبنون حتى فوجئوا بأنهم يتكلمون فجأة بلغات مختلفة. لم يعد أحد يفهم أحدًا، فتوقف البناء، وتفرّق الناس في كل أنحاء الأرض."
   },
   "findIt": {
    "ru": "недостроенную вершину башни",
    "en": "the unfinished top of the tower",
    "de": "die unfertige Turmspitze",
    "es": "la cima inacabada de la torre",
    "pt": "o topo inacabado da torre",
    "fr": "le sommet inachevé de la tour",
    "ar": "قمة البرج غير المكتملة"
   },
   "digit": {
    "num": "1",
    "label": {
     "ru": "язык был у всех людей на земле до строительства башни",
     "en": "one language was spoken by everyone on earth before the tower was built",
     "de": "Sprache sprachen alle Menschen auf der Erde, bevor der Turm gebaut wurde",
     "es": "idioma hablaban todas las personas en la tierra antes de construir la torre",
     "pt": "língua falavam todas as pessoas da Terra antes de construírem a torre",
     "fr": "seule langue existait pour tous les hommes avant la construction de la tour",
     "ar": "لغة واحدة كانت لكل الناس على الأرض قبل بناء البرج"
    }
   },
   "wow": {
    "ru": "Слово «столпотворение» — «творение столпа», то есть башни, — теперь означает шум и толчею.",
    "en": "The word \"babble\" — noisy, jumbled talk — is said to echo the name of that tower, Babel.",
    "de": "Das Wort „Babylon“ klingt wie „babeln“ – seither steht es für Sprachverwirrung und Durcheinander.",
    "es": "La palabra «Babel» significa «confusión», y así se quedó para nombrar el ruido y el desorden.",
    "pt": "A palavra \"babel\" deu origem à expressão \"balbúrdia\", que hoje significa bagunça e confusão.",
    "fr": "Le mot « babélisation », venu de Babel, désigne aujourd'hui la confusion et le grand désordre.",
    "ar": "كلمة «بابل» تشبه كلمة قديمة تعني «خلط»، لأن الله خلط هناك لغات الناس."
   },
   "poster": true,
   "findAt": {
    "x": 51,
    "y": 18,
    "r": 16
   },
   "findAtP": {
    "x": 57,
    "y": 20,
    "r": 16
   }
  },
  {
   "id": "plots_06",
   "slug": "ladder",
   "era": 2,
   "pair": "heroes_04",
   "imgReady": true,
   "audioReady": true,
   "emoji": "🪜",
   "name": {
    "ru": "Лестница Иакова",
    "en": "Jacob's Ladder",
    "de": "Jakobs Leiter",
    "es": "La escalera de Jacob",
    "pt": "A escada de Jacó",
    "fr": "L'échelle de Jacob",
    "ar": "سلّم يعقوب"
   },
   "source": {
    "ru": "Книга Бытия",
    "en": "Book of Genesis",
    "de": "1. Buch Mose",
    "es": "Libro del Génesis",
    "pt": "Livro de Gênesis",
    "fr": "Livre de la Genèse",
    "ar": "سفر التكوين"
   },
   "story": {
    "ru": "Иаков шёл через пустыню один и заночевал под открытым небом, положив под голову камень. Во сне он увидел сияющую лестницу от земли до неба, по которой поднимались и спускались ангелы. Проснувшись, Иаков понял: это место — особенное.",
    "en": "Jacob was traveling alone through the desert and stopped for the night under the open sky, using a stone as a pillow. In his dream, he saw a shining ladder stretching from the earth to the sky, with angels going up and down it. When Jacob woke up, he knew this place was special.",
    "de": "Jakob wanderte allein durch die Wüste und übernachtete unter freiem Himmel, einen Stein als Kissen unter dem Kopf. Im Traum sah er eine leuchtende Leiter, die von der Erde bis zum Himmel reichte, und Engel stiegen auf ihr hinauf und hinab. Als Jakob erwachte, wusste er: Dieser Ort ist etwas ganz Besonderes.",
    "es": "Jacob cruzaba el desierto solo, y al caer la noche se acostó a cielo abierto con una piedra bajo la cabeza. En sueños vio una escalera resplandeciente que iba de la tierra al cielo, con ángeles que subían y bajaban por ella. Al despertar, Jacob comprendió que aquel lugar era especial.",
    "pt": "Jacó atravessava o deserto sozinho e parou para passar a noite ao ar livre, usando uma pedra como travesseiro. Em sonho, viu uma escada brilhante que ia da terra até o céu, com anjos subindo e descendo por ela. Ao acordar, Jacó entendeu: aquele lugar era especial.",
    "fr": "Jacob traversait le désert tout seul et s'arrêta pour la nuit à la belle étoile, la tête posée sur une pierre. Dans son rêve, il vit une échelle lumineuse qui reliait la terre au ciel, et des anges y montaient et descendaient. À son réveil, Jacob comprit que cet endroit était bien particulier.",
    "ar": "كان يعقوب يسير وحده عبر الصحراء، فبات ليلته تحت السماء المفتوحة واضعًا حجرًا تحت رأسه. وفي حلمه رأى سلّمًا مضيئًا يمتد من الأرض إلى السماء، تصعد عليه الملائكة وتنزل. وعندما استيقظ، أدرك يعقوب أن هذا المكان مميز جدًا."
   },
   "findIt": {
    "ru": "камень-подушку",
    "en": "the stone pillow",
    "de": "den Stein als Kopfkissen",
    "es": "la piedra que usó de almohada",
    "pt": "a pedra que servia de travesseiro",
    "fr": "la pierre-oreiller",
    "ar": "الحجر الذي استخدمه وسادة"
   },
   "digit": {
    "num": "1",
    "label": {
     "ru": "простой камень стал подушкой — а сон оказался чудесным",
     "en": "a plain stone became a pillow — and the dream turned out to be wonderful",
     "de": "einfacher Stein wurde zum Kopfkissen – und der Traum war ein Wunder",
     "es": "piedra sencilla se convirtió en almohada, y el sueño resultó ser maravilloso",
     "pt": "pedra simples serviu de travesseiro — e o sonho foi um verdadeiro milagre",
     "fr": "simple pierre est devenue un oreiller — et le rêve fut merveilleux",
     "ar": "حجر بسيط صار وسادة — وجاء حلم عجيب"
    }
   },
   "wow": {
    "ru": "Место своего сна Иаков назвал Вефиль — «дом Бога»; городок с таким именем стоит до сих пор.",
    "en": "Jacob named the place where he slept Bethel — \"house of God\"; a town by that name still stands today.",
    "de": "Den Ort seines Traumes nannte Jakob Bethel – „Haus Gottes“; ein Städtchen mit diesem Namen gibt es noch heute.",
    "es": "Jacob llamó a aquel lugar Betel, «casa de Dios»; un pueblo con ese nombre sigue existiendo hoy.",
    "pt": "Jacó chamou aquele lugar de Betel — \"casa de Deus\"; existe até hoje uma cidade com esse nome.",
    "fr": "Jacob a appelé ce lieu Béthel, « la maison de Dieu » ; une ville portant ce nom existe encore aujourd'hui.",
    "ar": "سمّى يعقوب مكان حلمه «بيت إيل» — أي «بيت الله»؛ ولا تزال بلدة بهذا الاسم قائمة حتى اليوم."
   },
   "poster": true,
   "findAt": {
    "x": 63,
    "y": 82,
    "r": 10
   },
   "findAtP": {
    "x": 14,
    "y": 54,
    "r": 16
   }
  },
  {
   "id": "plots_07",
   "slug": "coat",
   "era": 2,
   "pair": "heroes_05",
   "imgReady": true,
   "audioReady": true,
   "emoji": "🧥",
   "name": {
    "ru": "Разноцветная одежда",
    "en": "The Colorful Coat",
    "de": "Das bunte Gewand",
    "es": "La túnica de colores",
    "pt": "A túnica colorida",
    "fr": "L'habit multicolore",
    "ar": "الثوب الملوّن"
   },
   "source": {
    "ru": "Книга Бытия",
    "en": "Book of Genesis",
    "de": "1. Buch Mose",
    "es": "Libro del Génesis",
    "pt": "Livro de Gênesis",
    "fr": "Livre de la Genèse",
    "ar": "سفر التكوين"
   },
   "story": {
    "ru": "Иосиф был любимцем отца и получил в подарок одежду невиданной красоты — разноцветную, как радуга. Братья позавидовали и продали Иосифа в далёкий Египет. Но эта беда обернулась удивительной судьбой: раб стал правителем.",
    "en": "Joseph was his father's favorite, and he was given a coat of amazing beauty — colorful as a rainbow. His brothers grew jealous and sold Joseph away to faraway Egypt. But this misfortune turned into an amazing destiny: a slave became a ruler.",
    "de": "Josef war der Liebling seines Vaters und bekam ein wunderschönes Gewand geschenkt – bunt wie ein Regenbogen. Seine Brüder wurden neidisch und verkauften Josef ins ferne Ägypten. Doch aus diesem Unglück wurde ein erstaunliches Schicksal: Aus dem Sklaven wurde ein Herrscher.",
    "es": "José era el preferido de su padre y recibió como regalo una túnica preciosa, de colores como el arcoíris. Sus hermanos sintieron envidia y lo vendieron a Egipto, muy lejos de casa. Pero aquella desgracia se convirtió en un destino asombroso: el esclavo llegó a ser gobernante.",
    "pt": "José era o filho preferido do pai e ganhou de presente uma túnica de cores lindíssimas, como um arco-íris. Os irmãos ficaram com inveja e venderam José para o distante Egito. Mas essa desgraça se transformou em um destino incrível: o escravo se tornou governante.",
    "fr": "Joseph était le préféré de son père, qui lui offrit un habit d'une beauté extraordinaire, aux couleurs de l'arc-en-ciel. Jaloux, ses frères le vendirent à des marchands qui l'emmenèrent en Égypte, bien loin de chez lui. Mais ce malheur se transforma en un destin merveilleux : l'esclave devint gouverneur.",
    "ar": "كان يوسف المفضّل عند أبيه، فأهداه ثوبًا بديع الجمال، ملوّنًا كقوس قزح. غار منه إخوته وباعوه إلى مصر البعيدة. لكن هذه المحنة تحوّلت إلى قصة عجيبة: العبد أصبح حاكمًا."
   },
   "findIt": {
    "ru": "сколько цветов на одежде Иосифа",
    "en": "how many colors are on Joseph's coat",
    "de": "wie viele Farben Josefs Gewand hat",
    "es": "cuántos colores tiene la túnica de José",
    "pt": "quantas cores tem a túnica de José",
    "fr": "le nombre de couleurs sur l'habit de Joseph",
    "ar": "عدد الألوان في ثوب يوسف"
   },
   "digit": {
    "num": "11",
    "label": {
     "ru": "братьев было у Иосифа — и никому не подарили такой одежды",
     "en": "brothers Joseph had — and none of them got a coat like his",
     "de": "Brüder hatte Josef – und keinem schenkte man so ein Gewand",
     "es": "hermanos tenía José, y a ninguno le regalaron una túnica así",
     "pt": "irmãos tinha José — e nenhum deles recebeu uma roupa como aquela",
     "fr": "frères avait Joseph — et aucun n'a reçu un si beau vêtement",
     "ar": "إخوة كان ليوسف — ولم يُهدَ أحد منهم ثوبًا كهذا"
    }
   },
   "wow": {
    "ru": "В древности по одежде сразу видели, кто перед тобой: пастух, царь или любимый сын.",
    "en": "Long ago, clothes showed at a glance who you were: a shepherd, a king, or a favorite son.",
    "de": "Früher sah man sofort an der Kleidung, wer vor einem stand: Hirte, König oder Lieblingssohn.",
    "es": "En la antigüedad, la ropa mostraba enseguida quién eras: pastor, rey o hijo preferido.",
    "pt": "Na Antiguidade, a roupa mostrava logo quem você era: pastor, rei ou filho preferido.",
    "fr": "Autrefois, on reconnaissait tout de suite qui on avait devant soi grâce à ses vêtements : berger, roi ou fils préféré.",
    "ar": "في الأزمنة القديمة، كان الثوب يكشف على الفور من يرتديه: راعٍ، أم ملك، أم ابن محبوب."
   },
   "poster": true,
   "findAt": {
    "x": 42,
    "y": 65,
    "r": 16
   },
   "findAtP": {
    "x": 40,
    "y": 50,
    "r": 16
   }
  },
  {
   "id": "plots_08",
   "slug": "basket",
   "era": 3,
   "pair": "heroes_07",
   "imgReady": true,
   "audioReady": true,
   "emoji": "🧺",
   "name": {
    "ru": "Младенец в корзине",
    "en": "The Baby in the Basket",
    "de": "Das Baby im Körbchen",
    "es": "El bebé en la cesta",
    "pt": "O bebê na cesta",
    "fr": "Le bébé dans le panier",
    "ar": "الطفل في السلّة"
   },
   "source": {
    "ru": "Книга Исход",
    "en": "Book of Exodus",
    "de": "2. Buch Mose",
    "es": "Libro del Éxodo",
    "pt": "Livro de Êxodo",
    "fr": "Livre de l'Exode",
    "ar": "سفر الخروج"
   },
   "story": {
    "ru": "Чтобы спасти маленького Моисея, мама сплела корзинку из тростника, просмолила её и пустила по Нилу. Корзинку нашла дочь фараона, пришедшая к реке искупаться. Так мальчик из бедной семьи вырос в самом дворце.",
    "en": "To save baby Moses, his mother wove a little basket from reeds, sealed it with tar, and set it afloat on the Nile. The basket was found by Pharaoh's daughter, who had come to the river to bathe. And so a boy from a poor family grew up right in the palace.",
    "de": "Um den kleinen Moses zu retten, flocht seine Mutter ein Körbchen aus Schilf, dichtete es mit Pech ab und setzte es auf dem Nil aus. Die Tochter des Pharaos fand das Körbchen, als sie zum Baden an den Fluss kam. So wuchs der Junge aus armer Familie im Palast auf.",
    "es": "Para salvar al pequeño Moisés, su mamá tejió una cesta de juncos, la selló con brea y la dejó flotar en el río Nilo. La hija del faraón, que había bajado a bañarse, encontró la cesta. Así, un niño de familia humilde creció dentro del propio palacio.",
    "pt": "Para salvar o pequeno Moisés, a mãe teceu uma cesta de junco, cobriu-a com piche e a deixou boiar no rio Nilo. A cesta foi encontrada pela filha do faraó, que tinha ido se banhar no rio. Assim, um menino de família pobre cresceu dentro do próprio palácio.",
    "fr": "Pour sauver le petit Moïse, sa maman tressa un panier en roseaux, l'enduisit de poix et le laissa flotter sur le Nil. Ce fut la fille du pharaon, venue se baigner dans le fleuve, qui trouva le panier. C'est ainsi qu'un petit garçon d'une famille pauvre grandit au cœur même du palais.",
    "ar": "لإنقاذ موسى الصغير، نسجت أمه سلّة من القصب وطلتها بالقار، ثم وضعتها فوق مياه نهر النيل. وجدت ابنة فرعون السلّة عندما جاءت لتستحم في النهر. وهكذا نشأ الطفل من عائلة فقيرة في قصر الملك نفسه."
   },
   "findIt": {
    "ru": "сестру Мириам в камышах",
    "en": "sister Miriam in the reeds",
    "de": "Schwester Mirjam im Schilf",
    "es": "a hermana Miriam entre los juncos",
    "pt": "a irmã Miriã escondida entre os juncos",
    "fr": "sœur Myriam cachée dans les roseaux",
    "ar": "أخته مريم بين الآجام"
   },
   "digit": {
    "num": "3",
    "label": {
     "ru": "месяца мама прятала младенца, прежде чем сплести корзинку",
     "en": "months mom hid the baby before weaving a little basket",
     "de": "Monate versteckte die Mutter das Baby, bevor sie ein Körbchen flocht",
     "es": "meses escondió su mamá al bebé antes de tejerle una cestita",
     "pt": "meses a mãe escondeu o bebê, antes de trançar a cestinha",
     "fr": "mois la maman a caché son bébé, avant de tresser un petit panier",
     "ar": "أشهر أخفت الأم فيها الطفل، قبل أن تصنع له سلة"
    }
   },
   "wow": {
    "ru": "Корзинку промазали смолой, как настоящий корабль, — чтобы не пропускала воду.",
    "en": "The basket was coated with tar, just like a real boat, so no water could get in.",
    "de": "Das Körbchen wurde mit Pech abgedichtet, wie ein richtiges Schiff – damit kein Wasser hineinkam.",
    "es": "La cestita se cubrió con brea, como un barco de verdad, para que no entrara el agua.",
    "pt": "A cestinha foi coberta com piche, como um verdadeiro barquinho — para não deixar a água entrar.",
    "fr": "Le panier fut enduit de bitume, comme un vrai bateau, pour ne pas laisser passer l'eau.",
    "ar": "طُليت السلة بالقار مثل سفينة حقيقية — حتى لا يدخلها الماء."
   },
   "poster": true,
   "findAt": {
    "x": 14,
    "y": 44,
    "r": 16
   },
   "book": "moses",
   "findAtP": {
    "x": 62,
    "y": 45,
    "r": 11
   }
  },
  {
   "id": "plots_09",
   "slug": "bush",
   "era": 3,
   "pair": null,
   "imgReady": true,
   "audioReady": true,
   "emoji": "🔥",
   "name": {
    "ru": "Неопалимая купина",
    "en": "The Burning Bush",
    "de": "Der brennende Dornbusch",
    "es": "La zarza ardiente",
    "pt": "A Sarça Ardente",
    "fr": "Le buisson ardent",
    "ar": "العلّيقة المتّقدة"
   },
   "source": {
    "ru": "Книга Исход",
    "en": "Book of Exodus",
    "de": "Das Buch Exodus",
    "es": "Libro del Éxodo",
    "pt": "Livro de Êxodo",
    "fr": "Livre de l'Exode",
    "ar": "سفر الخروج"
   },
   "story": {
    "ru": "В пустыне Моисей увидел чудо: терновый куст горел ярким пламенем — и не сгорал. Из огня прозвучал голос, поручивший Моисею вернуться в Египет и вывести свой народ на свободу. С этого куста началась вся история Исхода.",
    "en": "Out in the desert, Moses saw something amazing: a thornbush burning with bright flames — yet never burning up. From the fire came a voice, telling Moses to go back to Egypt and lead his people to freedom. That one bush was the start of the whole Exodus story.",
    "de": "In der Wüste sah Mose ein Wunder: Ein Dornbusch brannte mit hellen Flammen — und verbrannte doch nicht. Aus dem Feuer erklang eine Stimme, die Mose auftrug, nach Ägypten zurückzukehren und sein Volk in die Freiheit zu führen. Mit diesem Busch begann die ganze Geschichte des Auszugs.",
    "es": "En el desierto, Moisés vio un milagro: una zarza ardía con llamas brillantes, pero no se consumía. Desde el fuego se oyó una voz que le pedía volver a Egipto y liberar a su pueblo. De esa zarza nació toda la historia del Éxodo.",
    "pt": "No deserto, Moisés viu um milagre: uma sarça pegava fogo com chamas brilhantes — e não se consumia. Do meio do fogo veio uma voz, pedindo a Moisés que voltasse ao Egito para libertar o seu povo. Foi ali, naquela sarça, que começou toda a história do Êxodo.",
    "fr": "Dans le désert, Moïse vit un miracle : un buisson d'épines brûlait d'une flamme vive, sans jamais se consumer. Du feu jaillit une voix qui lui demanda de retourner en Égypte pour libérer son peuple. C'est de ce buisson qu'a commencé toute l'histoire de l'Exode.",
    "ar": "في الصحراء رأى موسى أمرًا عجيبًا: شجيرة من العوسج تشتعل بنار قوية، ولا تحترق! ومن وسط النار سمع صوتًا يطلب منه أن يعود إلى مصر ويقود قومه إلى الحرية. من هذه الشجيرة بدأت كل قصة الخروج."
   },
   "findIt": {
    "ru": "сандалии, снятые Моисеем",
    "en": "the sandals Moses took off",
    "de": "die Sandalen, die Mose auszog",
    "es": "las sandalias que se quitó Moisés",
    "pt": "as sandálias que Moisés tirou dos pés",
    "fr": "les sandales retirées par Moïse",
    "ar": "النعال التي خلعها موسى"
   },
   "digit": {
    "num": "1",
    "label": {
     "ru": "куст горел и не сгорал — с него началась вся история Исхода",
     "en": "a bush burned and never burned up — and from it began the whole story of the Exodus",
     "de": "Busch brannte und verbrannte nicht – damit begann die ganze Geschichte des Auszugs",
     "es": "arbusto ardía sin consumirse, y de ahí comenzó toda la historia del Éxodo",
     "pt": "arbusto ardia sem se queimar — foi dele que começou toda a história do Êxodo",
     "fr": "buisson brûlait sans se consumer — c'est là que commence toute l'histoire de l'Exode",
     "ar": "شجيرة اشتعلت ولم تحترق — منها بدأت كل قصة الخروج"
    }
   },
   "wow": {
    "ru": "«Неопалимая купина» по-старинному значит просто «несгорающий куст».",
    "en": "The \"burning bush\" simply means a bush that burns without ever being consumed.",
    "de": "Der „brennende Dornbusch“ heißt auf Altertümlich einfach „Busch, der nicht verbrennt“.",
    "es": "La «zarza ardiente» es, en pocas palabras, un arbusto que se quema sin apagarse ni consumirse.",
    "pt": "A \"sarça ardente\" é, no fundo, apenas um arbusto que queima sem se consumir.",
    "fr": "Le « buisson ardent » veut simplement dire, en langage ancien, un buisson qui ne brûle pas.",
    "ar": "تُعرف هذه الشجيرة بـ«العلّيقة المشتعلة» — أي الشجيرة التي تشتعل ولا تحترق."
   },
   "poster": true,
   "findAt": {
    "x": 57,
    "y": 92,
    "r": 16
   },
   "book": "moses"
  },
  {
   "id": "plots_10",
   "slug": "sea",
   "era": 3,
   "pair": null,
   "imgReady": true,
   "audioReady": true,
   "emoji": "🌊",
   "name": {
    "ru": "Переход через море",
    "en": "Crossing the Sea",
    "de": "Der Durchzug durchs Meer",
    "es": "El cruce del mar",
    "pt": "A Travessia do Mar",
    "fr": "La traversée de la mer",
    "ar": "عبور البحر"
   },
   "source": {
    "ru": "Книга Исход",
    "en": "Book of Exodus",
    "de": "Das Buch Exodus",
    "es": "Libro del Éxodo",
    "pt": "Livro de Êxodo",
    "fr": "Livre de l'Exode",
    "ar": "سفر الخروج"
   },
   "story": {
    "ru": "Народ подошёл к морю, а сзади догоняла армия фараона. И тогда воды расступились, встав двумя стенами, — люди прошли по морскому дну, как по дороге. Даже рыбы, наверное, удивлённо смотрели сквозь водяные стены.",
    "en": "The people reached the sea, with Pharaoh's army closing in behind them. Then the waters parted, standing up like two great walls, and everyone walked across the sea floor as if it were a road. Even the fish must have watched in wonder through the walls of water.",
    "de": "Das Volk stand am Meer, und hinter ihm holte das Heer des Pharaos auf. Da teilte sich das Wasser und stellte sich wie zwei Mauern auf — die Menschen gingen über den Meeresgrund wie über eine Straße. Sogar die Fische schauten wohl staunend durch die Wasserwände.",
    "es": "El pueblo llegó al mar, y por detrás se acercaba el ejército del faraón. Entonces las aguas se abrieron y formaron dos murallas: la gente cruzó por el fondo del mar como por un camino. Hasta los peces debieron de mirar sorprendidos a través de las paredes de agua.",
    "pt": "O povo chegou à beira do mar, e o exército do faraó vinha logo atrás. Então as águas se abriram, formando duas paredes — e todos atravessaram pelo fundo do mar, como se fosse um caminho. Até os peixes devem ter ficado espantados, olhando por entre as paredes de água.",
    "fr": "Le peuple arriva devant la mer, tandis que l'armée du pharaon approchait par-derrière. Alors les eaux s'écartèrent, formant deux murailles — et tous traversèrent le fond marin comme sur un chemin. Les poissons, sans doute, regardaient avec étonnement à travers ces murs d'eau.",
    "ar": "وصل الشعب إلى البحر، وجيش فرعون يطارده من الخلف. فانفلق الماء فجأة وصار جدارين، فعبر الناس على قاع البحر كما يعبرون طريقًا. ولعلّ الأسماك نظرت مندهشة من خلف جدران الماء."
   },
   "findIt": {
    "ru": "рыбок в стене воды",
    "en": "little fish in the wall of water",
    "de": "Fische in der Wasserwand",
    "es": "los pececitos en la pared de agua",
    "pt": "peixinhos dentro da parede de água",
    "fr": "les poissons dans le mur d'eau",
    "ar": "أسماكًا داخل جدار الماء"
   },
   "digit": {
    "num": "2",
    "label": {
     "ru": "стены воды встали справа и слева от дороги по морскому дну",
     "en": "walls of water stood on the left and right of the path across the sea floor",
     "de": "Wassermauern standen rechts und links vom Weg über den Meeresgrund",
     "es": "muros de agua se alzaron a la derecha y a la izquierda del camino en el fondo del mar",
     "pt": "paredes de água se ergueram à direita e à esquerda do caminho no fundo do mar",
     "fr": "murs d'eau se sont dressés à droite et à gauche du chemin, tout au fond de la mer",
     "ar": "جدارين من الماء وقفا يمينًا ويسارًا من الطريق على قاع البحر"
    }
   },
   "wow": {
    "ru": "Это море называется Красным, хотя вода в нём такая же синяя, как в любом другом.",
    "en": "This sea is called the Red Sea, though its water is just as blue as any other sea's.",
    "de": "Dieses Meer heißt Rotes Meer, dabei ist sein Wasser genauso blau wie das jedes anderen Meeres.",
    "es": "Ese mar se llama Rojo, aunque su agua es tan azul como la de cualquier otro.",
    "pt": "Esse mar se chama Mar Vermelho, embora sua água seja tão azul quanto a de qualquer outro.",
    "fr": "Cette mer s'appelle la mer Rouge, même si son eau est aussi bleue que n'importe quelle autre.",
    "ar": "يُسمى هذا البحر «البحر الأحمر»، مع أن ماءه أزرق تمامًا كأي بحر آخر."
   },
   "poster": true,
   "findAt": {
    "x": 85,
    "y": 42,
    "r": 10
   },
   "book": "moses",
   "findAtP": {
    "x": 86,
    "y": 37,
    "r": 9
   }
  },
  {
   "id": "plots_11",
   "slug": "manna",
   "era": 3,
   "pair": null,
   "imgReady": true,
   "audioReady": true,
   "emoji": "❄️",
   "name": {
    "ru": "Манна в пустыне",
    "en": "Manna in the Desert",
    "de": "Manna in der Wüste",
    "es": "El maná en el desierto",
    "pt": "O Maná no Deserto",
    "fr": "La manne dans le désert",
    "ar": "المنّ في الصحراء"
   },
   "source": {
    "ru": "Книга Исход",
    "en": "Book of Exodus",
    "de": "Das Buch Exodus",
    "es": "Libro del Éxodo",
    "pt": "Livro de Êxodo",
    "fr": "Livre de l'Exode",
    "ar": "سفر الخروج"
   },
   "story": {
    "ru": "Сорок лет народ шёл через пустыню, где не растёт хлеб. Но каждое утро земля покрывалась манной — белыми сладковатыми крупинками, похожими на иней. Её собирали ровно на один день: запасаться впрок было нельзя.",
    "en": "For forty years the people crossed a desert where no bread could grow. But every morning the ground was covered with manna — tiny sweet flakes as white as frost. They gathered just enough for one day; saving extra for later never worked.",
    "de": "Vierzig Jahre lang zog das Volk durch die Wüste, wo kein Brot wächst. Doch jeden Morgen bedeckte sich der Boden mit Manna — kleinen weißen, süßlichen Körnern, ähnlich wie Reif. Man sammelte nur so viel, wie für einen Tag reichte: Vorräte anlegen ging nicht.",
    "es": "Durante cuarenta años el pueblo caminó por un desierto donde no crecía el pan. Pero cada mañana el suelo se cubría de maná: granitos blancos y dulces, como escarcha. Se recogía justo para un día: no se podía guardar para más tarde.",
    "pt": "Durante quarenta anos o povo caminhou por um deserto onde não crescia trigo. Mas toda manhã o chão se cobria de maná — pequenos grãos brancos e docinhos, parecidos com geada. Cada um recolhia só o suficiente para um dia: guardar para depois não dava certo.",
    "fr": "Pendant quarante ans, le peuple marcha dans le désert où rien ne pousse. Mais chaque matin, le sol se couvrait de manne — de petits grains blancs et sucrés, semblables à du givre. On en ramassait juste pour une journée : impossible d'en faire des réserves.",
    "ar": "أربعين سنة سار الشعب في صحراء لا خبز فيها. لكن كل صباح كانت الأرض تُغطّى بالمنّ، حبيبات بيضاء حلوة المذاق تشبه الصقيع. كانوا يجمعون منه ما يكفي يومًا واحدًا فقط، فلا يصح ادّخاره."
   },
   "findIt": {
    "ru": "кувшин для манны",
    "en": "a jar for the manna",
    "de": "ein Krug für das Manna",
    "es": "la vasija para el maná",
    "pt": "o pote para guardar o maná",
    "fr": "la cruche pour la manne",
    "ar": "جرّة المنّ"
   },
   "digit": {
    "num": "40",
    "label": {
     "ru": "лет народ шёл через пустыню — и каждое утро находил манну",
     "en": "years the people walked through the desert — and found manna every morning",
     "de": "Jahre zog das Volk durch die Wüste – und fand jeden Morgen Manna",
     "es": "años el pueblo cruzó el desierto, y cada mañana encontraba maná",
     "pt": "anos o povo caminhou pelo deserto — e toda manhã encontrava maná",
     "fr": "ans, le peuple a marché à travers le désert — et chaque matin, il trouvait de la manne",
     "ar": "عامًا سار الشعب في الصحراء — وفي كل صباح وجد المن"
    }
   },
   "wow": {
    "ru": "Про нежданный подарок до сих пор говорят: «как манна небесная».",
    "en": "People still call a surprise gift \"manna from heaven.\"",
    "de": "Bei einem unerwarteten Geschenk sagt man noch heute: „wie Manna vom Himmel“.",
    "es": "De un regalo inesperado aún se dice: «es como maná del cielo».",
    "pt": "Até hoje, um presente inesperado é chamado de «um verdadeiro maná».",
    "fr": "Quand un cadeau tombe du ciel au bon moment, on dit encore aujourd'hui que c'est « la manne céleste ».",
    "ar": "الهبة المفاجئة ما زالوا يسمّونها «منّ من السماء»."
   },
   "poster": true,
   "findAt": {
    "x": 45,
    "y": 88,
    "r": 16
   },
   "book": "moses",
   "findAtP": {
    "x": 30,
    "y": 55,
    "r": 10
   }
  },
  {
   "id": "plots_12",
   "slug": "tablets",
   "era": 3,
   "pair": "heroes_06",
   "imgReady": true,
   "audioReady": true,
   "emoji": "📜",
   "name": {
    "ru": "Скрижали",
    "en": "The Stone Tablets",
    "de": "Die Gesetzestafeln",
    "es": "Las tablas de la ley",
    "pt": "As Tábuas da Lei",
    "fr": "Les tables de la Loi",
    "ar": "الألواح المقدسة"
   },
   "source": {
    "ru": "Книга Исход",
    "en": "Book of Exodus",
    "de": "Das Buch Exodus",
    "es": "Libro del Éxodo",
    "pt": "Livro de Êxodo",
    "fr": "Livre de l'Exode",
    "ar": "سفر الخروج"
   },
   "story": {
    "ru": "На вершине горы Синай, в облаке и громе, Моисей получил две каменные плиты — скрижали. На них были высечены десять главных правил: не обманывай, не кради, почитай родителей... Этим правилам уже больше трёх тысяч лет, а они всё ещё работают.",
    "en": "Atop Mount Sinai, amid clouds and thunder, Moses received two stone tablets. Carved into them were ten important rules: don't lie, don't steal, honor your parents, and more. These rules are over three thousand years old — and they still work today.",
    "de": "Auf dem Gipfel des Berges Sinai, in Wolken und Donner, erhielt Mose zwei steinerne Tafeln. Darauf standen zehn wichtige Regeln eingemeißelt: Betrüge nicht, stiehl nicht, ehre deine Eltern … Diese Regeln sind schon über dreitausend Jahre alt — und wirken noch immer.",
    "es": "En la cima del monte Sinaí, entre nubes y truenos, Moisés recibió dos tablas de piedra. En ellas estaban grabadas diez reglas principales: no mentir, no robar, honrar a los padres... Estas reglas tienen ya más de tres mil años, y todavía funcionan.",
    "pt": "No topo do monte Sinai, entre nuvens e trovões, Moisés recebeu duas placas de pedra — as tábuas da lei. Nelas estavam gravadas dez regras muito importantes: não mentir, não roubar, honrar pai e mãe... Essas regras têm mais de três mil anos, e ainda funcionam muito bem.",
    "fr": "Au sommet du mont Sinaï, dans les nuages et le tonnerre, Moïse reçut deux tables de pierre. On y avait gravé dix règles essentielles : ne pas mentir, ne pas voler, honorer ses parents... Ces règles ont plus de trois mille ans, et elles fonctionnent encore aujourd'hui.",
    "ar": "على قمة جبل سيناء، بين الغيوم والرعد، تلقّى موسى لوحين من الحجر. كُتبت عليهما عشر قواعد مهمة: لا تكذب، لا تسرق، احترم والديك... مضى على هذه القواعد أكثر من ثلاثة آلاف سنة، وما زالت صالحة حتى اليوم."
   },
   "findIt": {
    "ru": "сколько строк на скрижалях",
    "en": "how many lines are on the tablets",
    "de": "wie viele Zeilen auf den Tafeln stehen",
    "es": "cuántas líneas hay en las tablas",
    "pt": "quantas linhas há nas tábuas",
    "fr": "combien de lignes sur les tables",
    "ar": "عدد السطور على الألواح"
   },
   "digit": {
    "num": "10",
    "label": {
     "ru": "правил высечено на двух каменных плитах",
     "en": "rules carved into two stone tablets",
     "de": "Gebote standen auf zwei Steintafeln geschrieben",
     "es": "reglas grabadas en dos tablas de piedra",
     "pt": "regras gravadas em duas placas de pedra",
     "fr": "règles gravées sur deux tables de pierre",
     "ar": "قواعد نُقشت على لوحين من حجر"
    }
   },
   "wow": {
    "ru": "Правила со скрижалей — не обманывай, не кради — встречаются в законах почти всех стран.",
    "en": "The rules from the tablets — don't lie, don't steal — appear in the laws of almost every country.",
    "de": "Regeln wie „nicht lügen, nicht stehlen“ von den Steintafeln finden sich in den Gesetzen fast aller Länder.",
    "es": "Las reglas de las tablas —no mentir, no robar— aparecen en las leyes de casi todos los países.",
    "pt": "As regras das tábuas — não mentir, não roubar — aparecem nas leis de quase todos os países.",
    "fr": "Les règles des tables de pierre — ne pas mentir, ne pas voler — se retrouvent dans les lois de presque tous les pays.",
    "ar": "قواعد اللوحين — لا تكذب، لا تسرق — نجدها في قوانين بلدان كثيرة حتى اليوم."
   },
   "poster": true,
   "findAt": {
    "x": 39,
    "y": 63,
    "r": 12.6
   },
   "book": "moses",
   "findAtP": {
    "x": 50,
    "y": 52,
    "r": 16
   }
  },
  {
   "id": "plots_13",
   "slug": "jericho",
   "era": 4,
   "pair": "heroes_08",
   "imgReady": true,
   "audioReady": true,
   "emoji": "📯",
   "name": {
    "ru": "Стены Иерихона",
    "en": "The Walls of Jericho",
    "de": "Die Mauern von Jericho",
    "es": "Las murallas de Jericó",
    "pt": "As Muralhas de Jericó",
    "fr": "Les murailles de Jéricho",
    "ar": "أسوار أريحا"
   },
   "source": {
    "ru": "Книга Иисуса Навина",
    "en": "Book of Joshua",
    "de": "Das Buch Josua",
    "es": "Libro de Josué",
    "pt": "Livro de Josué",
    "fr": "Livre de Josué",
    "ar": "سفر يشوع"
   },
   "story": {
    "ru": "Иерихон был окружён такими могучими стенами, что взять его казалось невозможным. Семь дней народ обходил город, а на седьмой день затрубили трубы-шофары, все закричали — и стены рухнули сами. Иногда звук сильнее камня.",
    "en": "Jericho was surrounded by walls so mighty that taking the city seemed impossible. For seven days the people marched around it, and on the seventh day the shofar horns blew, everyone shouted — and the walls came tumbling down on their own. Sometimes sound is stronger than stone.",
    "de": "Jericho war von so mächtigen Mauern umgeben, dass es unmöglich schien, die Stadt einzunehmen. Sieben Tage lang zog das Volk um die Stadt, und am siebten Tag erklangen die Schofar-Hörner, alle schrien laut auf — und die Mauern stürzten von selbst ein. Manchmal ist ein Klang stärker als Stein.",
    "es": "Jericó estaba rodeada de murallas tan poderosas que tomarla parecía imposible. Durante siete días el pueblo rodeó la ciudad, y al séptimo día sonaron las trompetas de shofar, todos gritaron, y las murallas se derrumbaron solas. A veces el sonido es más fuerte que la piedra.",
    "pt": "Jericó era cercada por muralhas tão fortes que ninguém achava possível conquistá-la. Durante sete dias o povo deu voltas ao redor da cidade, e no sétimo dia soaram as trombetas, todos gritaram juntos — e as muralhas caíram sozinhas. Às vezes um som é mais forte que a pedra.",
    "fr": "Jéricho était entourée de murailles si puissantes que la prendre semblait impossible. Pendant sept jours, le peuple fit le tour de la ville, et le septième jour, les trompettes de shofar retentirent, tous poussèrent un grand cri — et les murailles s'effondrèrent d'elles-mêmes. Parfois, le son est plus fort que la pierre.",
    "ar": "كانت أريحا محاطة بأسوار قوية بدا أخذها مستحيلًا. سبعة أيام دار الشعب حول المدينة، وفي اليوم السابع نُفخ في الأبواق، وهتف الجميع بصوت عال، فسقطت الأسوار من نفسها. أحيانًا يكون الصوت أقوى من الحجر."
   },
   "findIt": {
    "ru": "трубу-шофар",
    "en": "the shofar horn",
    "de": "das Schofar-Horn",
    "es": "el cuerno de shofar",
    "pt": "a trombeta de chifre",
    "fr": "la trompe de shofar",
    "ar": "بوق الشوفار"
   },
   "digit": {
    "num": "7",
    "label": {
     "ru": "дней народ обходил стены, а на седьмой затрубили шофары",
     "en": "days the people walked around the walls, and on the seventh the trumpets sounded",
     "de": "Tage zog das Volk um die Mauern – am siebten erklangen die Schofar-Hörner",
     "es": "días el pueblo rodeó las murallas, y al séptimo sonaron los shofares",
     "pt": "dias o povo deu voltas nas muralhas, e no sétimo tocaram as trombetas",
     "fr": "jours, le peuple a fait le tour des murailles, et le septième jour, les trompettes ont retenti",
     "ar": "أيامًا دار الشعب حول الأسوار، وفي اليوم السابع نُفخ في الأبواق"
    }
   },
   "wow": {
    "ru": "Иерихон — один из древнейших городов мира: люди живут там уже больше десяти тысяч лет.",
    "en": "Jericho is one of the oldest cities in the world — people have lived there for over ten thousand years.",
    "de": "Jericho ist eine der ältesten Städte der Welt: Menschen leben dort schon seit über zehntausend Jahren.",
    "es": "Jericó es una de las ciudades más antiguas del mundo: lleva habitada más de diez mil años.",
    "pt": "Jericó é uma das cidades mais antigas do mundo: as pessoas vivem lá há mais de dez mil anos.",
    "fr": "Jéricho est l'une des plus anciennes villes du monde : des gens y vivent depuis plus de dix mille ans.",
    "ar": "أريحا من أقدم مدن العالم: الناس يعيشون فيها منذ أكثر من عشرة آلاف سنة."
   },
   "poster": true,
   "findAt": {
    "x": 33,
    "y": 55,
    "r": 16
   },
   "findAtP": {
    "x": 44,
    "y": 47,
    "r": 9
   }
  },
  {
   "id": "plots_14",
   "slug": "goliath",
   "era": 5,
   "pair": "heroes_12",
   "imgReady": true,
   "audioReady": true,
   "emoji": "🪨",
   "name": {
    "ru": "Давид и Голиаф",
    "en": "David and Goliath",
    "de": "David und Goliath",
    "es": "David y Goliat",
    "pt": "Davi e Golias",
    "fr": "David et Goliath",
    "ar": "داود وجالوت"
   },
   "source": {
    "ru": "Первая книга Царств",
    "en": "1 Samuel",
    "de": "1. Buch Samuel",
    "es": "Primer libro de Samuel",
    "pt": "1º Livro de Samuel",
    "fr": "Premier livre de Samuel",
    "ar": "سفر صموئيل الأول"
   },
   "story": {
    "ru": "Великан Голиаф в тяжёлых доспехах сорок дней вызывал на бой хоть кого-нибудь — и все боялись. Вышел только юный пастух Давид с пращой и пятью гладкими камнями из ручья. Хватило одного: великан рухнул, а войско великанов разбежалось.",
    "en": "For forty days, the giant Goliath in his heavy armor challenged anyone to fight him — and everyone was afraid. Only a young shepherd named David stepped up, with a sling and five smooth stones from a stream. One was enough: the giant fell, and the giant's army ran away.",
    "de": "Der Riese Goliath stand vierzig Tage lang in schwerer Rüstung da und forderte jeden zum Kampf heraus – doch alle hatten Angst. Nur der junge Hirte David trat vor, mit einer Steinschleuder und fünf glatten Steinen aus dem Bach. Einer genügte: Der Riese stürzte zu Boden, und das Heer der Riesen lief davon.",
    "es": "El gigante Goliat, cubierto de pesada armadura, retó a duelo durante cuarenta días, y nadie se atrevía a enfrentarlo. Solo salió el joven pastor David, con su honda y cinco piedras lisas del arroyo. Bastó una: el gigante cayó, y el ejército de gigantes huyó despavorido.",
    "pt": "O gigante Golias, com sua armadura pesada, desafiou por quarenta dias quem quer que fosse a lutar com ele — e todos tinham medo. Só o jovem pastor Davi se adiantou, com uma funda e cinco pedrinhas lisas do riacho. Bastou uma: o gigante caiu, e o exército de gigantes fugiu correndo.",
    "fr": "Le géant Goliath, couvert d'une lourde armure, défiait tout le monde en duel depuis quarante jours — et tous avaient peur. Seul le jeune berger David s'avança, avec sa fronde et cinq pierres lisses prises dans un ruisseau. Une seule suffit : le géant s'effondra, et l'armée des géants prit la fuite.",
    "ar": "كان الجبّار جالوت يرتدي درعًا ثقيلًا، وظلّ أربعين يومًا يتحدّى أيّ أحد للقتال، وكان الجميع خائفين. فخرج وحده الراعي الصغير داود بمقلاعه وخمسة حجارة ملساء من النهر. وكفت ضربة واحدة: سقط الجبّار، وهرب جيش الأعداء."
   },
   "findIt": {
    "ru": "пять камней",
    "en": "five stones",
    "de": "fünf Steine",
    "es": "cinco piedras",
    "pt": "cinco pedrinhas",
    "fr": "cinq pierres",
    "ar": "الحجارة الخمسة"
   },
   "digit": {
    "num": "3",
    "label": {
     "ru": "метра — почти такого роста описан великан Голиаф",
     "en": "meters — about how tall the giant Goliath is described to be",
     "de": "Meter – fast so groß soll der Riese Goliath gewesen sein",
     "es": "metros medía casi el gigante Goliat, según cuentan",
     "pt": "metros — quase essa a altura do gigante Golias",
     "fr": "mètres — c'est à peu près la taille du géant Goliath",
     "ar": "أمتار — بهذا الطول تقريبًا وُصف الجبّار جوليات"
    }
   },
   "wow": {
    "ru": "«Давид против Голиафа» говорят и сегодня, когда маленький не боится большого.",
    "en": "People still say \"David and Goliath\" when someone small isn't afraid of someone big.",
    "de": "„David gegen Goliath“ sagt man noch heute, wenn ein Kleiner sich vor einem Großen nicht fürchtet.",
    "es": "Aún hoy se dice «David contra Goliat» cuando el pequeño no le teme al grande.",
    "pt": "Ainda hoje se diz «Davi contra Golias» quando alguém pequeno enfrenta um grande sem medo.",
    "fr": "On dit encore aujourd'hui « David contre Goliath » quand un petit n'a pas peur d'un grand.",
    "ar": "يقولون «داود وجوليات» إلى اليوم عندما لا يخاف الصغير من الكبير."
   },
   "poster": true,
   "findAt": {
    "x": 18,
    "y": 91,
    "r": 16
   },
   "book": "david",
   "findAtP": {
    "x": 86,
    "y": 37,
    "r": 10.8
   }
  },
  {
   "id": "plots_15",
   "slug": "judgment",
   "era": 5,
   "pair": null,
   "imgReady": true,
   "audioReady": true,
   "emoji": "⚖️",
   "name": {
    "ru": "Суд Соломона",
    "en": "The Judgment of Solomon",
    "de": "Das Urteil Salomos",
    "es": "El juicio de Salomón",
    "pt": "O Julgamento de Salomão",
    "fr": "Le jugement de Salomon",
    "ar": "حكم سليمان"
   },
   "source": {
    "ru": "Третья книга Царств",
    "en": "1 Kings",
    "de": "1. Buch der Könige",
    "es": "Primer libro de los Reyes",
    "pt": "1º Livro dos Reis",
    "fr": "Premier livre des Rois",
    "ar": "سفر الملوك الأول"
   },
   "story": {
    "ru": "Две женщины спорили, чей это младенец, и никто не мог их рассудить. Соломон предложил: разделите ребёнка пополам. Настоящая мама тут же закричала: «Отдайте его ей, только не троньте!» — так царь и узнал правду.",
    "en": "Two women argued over whose baby it was, and no one could settle it. Solomon said: cut the child in two. The real mother cried out at once, “Give him to her, just don't harm him!” — and that is how the king learned the truth.",
    "de": "Zwei Frauen stritten sich, wessen Baby es sei, und niemand konnte den Streit schlichten. Salomo schlug vor: Teilt das Kind einfach in zwei Hälften. Da rief die wahre Mutter sofort: „Gebt es lieber ihr, nur tut ihm nichts an!“ – so erkannte der König die Wahrheit.",
    "es": "Dos mujeres discutían de quién era el bebé, y nadie lograba decidir quién tenía razón. Salomón propuso: partamos al niño en dos mitades. La verdadera madre gritó enseguida: «¡Dénselo a ella, pero no le hagan daño!» Así el rey descubrió la verdad.",
    "pt": "Duas mulheres discutiam de quem era o bebê, e ninguém conseguia decidir quem tinha razão. Salomão propôs: dividam a criança ao meio. A verdadeira mãe gritou na hora: \"Deem o bebê a ela, só não façam mal a ele!\" — e assim o rei descobriu a verdade.",
    "fr": "Deux femmes se disputaient un bébé, et personne ne pouvait les départager. Salomon proposa : coupons l'enfant en deux. La vraie maman s'écria aussitôt : « Donnez-le-lui, mais ne lui faites pas de mal ! » Ainsi le roi connut la vérité.",
    "ar": "تخاصمت امرأتان حول طفل رضيع، وكل منهما تدّعي أنه ابنها، ولم يستطع أحد أن يفصل بينهما. فاقترح سليمان: اقسموا الطفل نصفين. فصرخت الأم الحقيقية فورًا: «أعطوه لها، فقط لا تؤذوه!» — وهكذا عرف الملك الحقيقة."
   },
   "findIt": {
    "ru": "царский трон",
    "en": "the royal throne",
    "de": "den Königsthron",
    "es": "el trono real",
    "pt": "o trono real",
    "fr": "le trône royal",
    "ar": "عرش الملك"
   },
   "digit": {
    "num": "2",
    "label": {
     "ru": "женщины спорили об одном младенце — царь нашёл правду",
     "en": "women argued about one baby — the king found the truth",
     "de": "Frauen streiten um ein Baby – der König findet die Wahrheit heraus",
     "es": "mujeres discutían por un mismo bebé, y el rey descubrió la verdad",
     "pt": "mulheres discutiam por um bebê — o rei descobriu a verdade",
     "fr": "femmes se disputaient au sujet d'un même bébé — le roi a découvert la vérité",
     "ar": "امرأتان تجادلتا حول طفل واحد — والملك اكتشف الحقيقة"
    }
   },
   "wow": {
    "ru": "«Соломоново решение» — так называют особенно мудрый выход из трудного спора.",
    "en": "A \"Solomon's judgment\" is what people call an especially wise way to settle a hard dispute.",
    "de": "Eine „salomonische Entscheidung“ – so nennt man eine besonders kluge Lösung für einen schwierigen Streit.",
    "es": "«Un juicio salomónico» se llama a una solución especialmente sabia para un conflicto difícil.",
    "pt": "Chamam de «solução de Salomão» uma saída especialmente sábia para uma discussão difícil.",
    "fr": "On appelle « jugement de Salomon » une solution particulièrement sage à une dispute difficile.",
    "ar": "يسمّون الحل الحكيم جدًا في خلاف صعب «حكمة سليمان»."
   },
   "poster": true,
   "findAt": {
    "x": 50,
    "y": 32,
    "r": 16
   },
   "findAtP": {
    "x": 14,
    "y": 32,
    "r": 12.6
   }
  },
  {
   "id": "plots_16",
   "slug": "temple",
   "era": 5,
   "pair": "heroes_13",
   "imgReady": true,
   "audioReady": true,
   "emoji": "🏛️",
   "name": {
    "ru": "Храм Соломона",
    "en": "Solomon's Temple",
    "de": "Der Tempel Salomos",
    "es": "El Templo de Salomón",
    "pt": "O Templo de Salomão",
    "fr": "Le Temple de Salomon",
    "ar": "هيكل سليمان"
   },
   "source": {
    "ru": "Третья книга Царств",
    "en": "1 Kings",
    "de": "1. Buch der Könige",
    "es": "Primer libro de los Reyes",
    "pt": "1º Livro dos Reis",
    "fr": "Premier livre des Rois",
    "ar": "سفر الملوك الأول"
   },
   "story": {
    "ru": "Семь лет тысячи мастеров строили в Иерусалиме Храм: стены из камня, внутри — кедр и золото. Камни обтёсывали заранее в каменоломнях, поэтому на стройке не стучал ни один молоток. Храм Соломона называют одним из чудес древнего мира.",
    "en": "For seven years, thousands of workers built the Temple in Jerusalem: walls of stone, and inside, cedar wood and gold. The stones were cut ahead of time at the quarry, so not a single hammer was heard on the building site. Solomon's Temple is called one of the wonders of the ancient world.",
    "de": "Sieben Jahre lang bauten tausende Handwerker in Jerusalem den Tempel: Mauern aus Stein, innen Zedernholz und Gold. Die Steine wurden schon im Steinbruch fertig behauen, sodass auf der Baustelle kein einziger Hammer erklang. Der Tempel Salomos gilt als eines der Wunder der antiken Welt.",
    "es": "Durante siete años, miles de artesanos construyeron el Templo en Jerusalén: muros de piedra y, por dentro, cedro y oro. Las piedras se tallaban antes en las canteras, así que en la obra no sonó ni un solo martillo. El Templo de Salomón es considerado una de las maravillas del mundo antiguo.",
    "pt": "Durante sete anos, milhares de trabalhadores construíram o Templo em Jerusalém: paredes de pedra e, por dentro, cedro e ouro. As pedras eram talhadas antes, lá na pedreira, por isso nenhum martelo era ouvido na obra. O Templo de Salomão é lembrado como uma das maravilhas do mundo antigo.",
    "fr": "Pendant sept ans, des milliers d'ouvriers bâtirent le Temple à Jérusalem : des murs de pierre, et à l'intérieur, du cèdre et de l'or. Les pierres étaient taillées à l'avance dans les carrières, si bien qu'aucun marteau ne résonnait sur le chantier. On dit que le Temple de Salomon fut l'une des merveilles du monde antique.",
    "ar": "طوال سبع سنوات، بنى آلاف الصنّاع الهيكل في أورشليم: جدران من الحجر، وفي الداخل خشب الأرز والذهب. كانت الحجارة تُنحت مسبقًا في المحاجر، فلم يُسمع صوت مطرقة واحدة في موقع البناء. ويُعدّ هيكل سليمان واحدًا من عجائب العالم القديم."
   },
   "findIt": {
    "ru": "золотые украшения храма",
    "en": "the temple's gold decorations",
    "de": "den goldenen Schmuck des Tempels",
    "es": "los adornos de oro del templo",
    "pt": "os enfeites de ouro do templo",
    "fr": "les ornements dorés du temple",
    "ar": "زخارف الهيكل الذهبية"
   },
   "digit": {
    "num": "7",
    "label": {
     "ru": "лет строился Храм — без единого удара молотка на стройке",
     "en": "years it took to build the Temple — without a single hammer blow at the site",
     "de": "Jahre lang wurde der Tempel gebaut – ohne einen einzigen Hammerschlag auf der Baustelle",
     "es": "años se tardó en construir el Templo, sin un solo golpe de martillo en la obra",
     "pt": "anos levou para construir o Templo — sem um só golpe de martelo na obra",
     "fr": "ans a duré la construction du Temple — sans un seul coup de marteau sur le chantier",
     "ar": "سنوات استمر بناء الهيكل — دون صوت مطرقة واحدة في الموقع"
    }
   },
   "wow": {
    "ru": "Камни обтёсывали заранее в каменоломнях и привозили уже готовыми — потому и было тихо.",
    "en": "The stones were shaped ahead of time in quarries and brought in already finished — that's why it was so quiet.",
    "de": "Die Steine wurden vorher in Steinbrüchen behauen und fertig herangebracht – deshalb war es so still.",
    "es": "Las piedras se tallaban antes en las canteras y llegaban ya listas, por eso todo era silencio.",
    "pt": "As pedras eram lavradas antes, nas pedreiras, e chegavam já prontas — por isso não fazia barulho.",
    "fr": "Les pierres étaient taillées à l'avance dans les carrières et arrivaient déjà prêtes — voilà pourquoi tout restait silencieux.",
    "ar": "كانت الحجارة تُنحت مسبقًا في المحاجر وتُجلب جاهزة تمامًا — لهذا كان البناء هادئًا."
   },
   "poster": true,
   "findAt": {
    "x": 45,
    "y": 18,
    "r": 16
   },
   "findAtP": {
    "x": 13,
    "y": 36,
    "r": 16
   }
  },
  {
   "id": "plots_17",
   "slug": "lions",
   "era": 6,
   "pair": "heroes_15",
   "imgReady": true,
   "audioReady": true,
   "emoji": "🦁",
   "name": {
    "ru": "Даниил во рву со львами",
    "en": "Daniel in the Lions' Den",
    "de": "Daniel in der Löwengrube",
    "es": "Daniel en el foso de los leones",
    "pt": "Daniel na Cova dos Leões",
    "fr": "Daniel dans la fosse aux lions",
    "ar": "دانيال في جبّ الأسود"
   },
   "source": {
    "ru": "Книга Даниила",
    "en": "Book of Daniel",
    "de": "Buch Daniel",
    "es": "Libro de Daniel",
    "pt": "Livro de Daniel",
    "fr": "Livre de Daniel",
    "ar": "سفر دانيال"
   },
   "story": {
    "ru": "Завистники добились, чтобы Даниила бросили в ров с голодными львами. Царь всю ночь не спал от тревоги, а утром побежал ко рву и позвал Даниила. «Я жив!» — ответил тот: львы улеглись вокруг него, как большие кошки.",
    "en": "Jealous men schemed to have Daniel thrown into a den of hungry lions. The king couldn't sleep all night from worry, and in the morning he ran to the den and called out for Daniel. “I'm alive!” came the answer — the lions lay curled around him like big cats.",
    "de": "Neider sorgten dafür, dass Daniel in eine Grube mit hungrigen Löwen geworfen wurde. Der König konnte vor Sorge die ganze Nacht nicht schlafen, und am Morgen lief er zur Grube und rief nach Daniel. „Ich lebe!“, antwortete dieser: Die Löwen lagen um ihn herum wie große Katzen.",
    "es": "Unos envidiosos lograron que arrojaran a Daniel a un foso con leones hambrientos. El rey no pudo dormir en toda la noche de la angustia, y por la mañana corrió al foso y llamó a Daniel. «¡Estoy vivo!», respondió él: los leones se habían echado a su alrededor, como grandes gatos.",
    "pt": "Homens invejosos conseguiram que Daniel fosse jogado numa cova cheia de leões famintos. O rei não dormiu a noite toda de tanta aflição, e de manhã correu até a cova e chamou por Daniel. \"Estou vivo!\" — respondeu ele: os leões estavam deitados ao seu redor, quietinhos como grandes gatos.",
    "fr": "Des jaloux firent jeter Daniel dans une fosse pleine de lions affamés. Le roi ne dormit pas de la nuit, tant il était inquiet, et le matin il courut vers la fosse et appela Daniel. « Je suis vivant ! » répondit-il : les lions s'étaient couchés autour de lui, comme de gros chats tranquilles.",
    "ar": "دبّر الحاسدون أن يُلقى دانيال في جبّ مليء بالأسود الجائعة. لم ينم الملك طوال الليل من القلق، وفي الصباح أسرع إلى الجبّ ونادى دانيال. فأجابه: «أنا حيّ!» — فقد ربضت الأسود حوله كأنها قطط كبيرة وديعة."
   },
   "findIt": {
    "ru": "сколько львов во рву",
    "en": "how many lions are in the den",
    "de": "wie viele Löwen in der Grube sind",
    "es": "cuántos leones hay en el foso",
    "pt": "quantos leões há na cova",
    "fr": "combien de lions dans la fosse",
    "ar": "عدد الأسود في الجبّ"
   },
   "digit": {
    "num": "1",
    "label": {
     "ru": "ночь провёл Даниил во рву — и вышел утром целым",
     "en": "night Daniel spent in the den — and came out safe in the morning",
     "de": "Nacht verbrachte Daniel in der Löwengrube – und kam am Morgen unversehrt heraus",
     "es": "noche pasó Daniel en el foso, y por la mañana salió sano y salvo",
     "pt": "noite Daniel passou na cova — e saiu inteiro pela manhã",
     "fr": "nuit, Daniel est resté dans la fosse — et il en est sorti sain et sauf au matin",
     "ar": "ليلة واحدة قضاها دانيال في حفرة الأسود — وخرج سليمًا في الصباح"
    }
   },
   "wow": {
    "ru": "Голодный лев съедает до тридцати килограммов мяса за раз — тем удивительнее эта ночь.",
    "en": "A hungry lion can eat up to thirty kilograms of meat in one sitting — which makes that night even more amazing.",
    "de": "Ein hungriger Löwe frisst bis zu dreißig Kilogramm Fleisch auf einmal – umso erstaunlicher war diese Nacht.",
    "es": "Un león hambriento puede comer hasta treinta kilos de carne de una sola vez: por eso esa noche fue tan asombrosa.",
    "pt": "Um leão faminto pode comer até trinta quilos de carne de uma vez — por isso essa noite é ainda mais espantosa.",
    "fr": "Un lion affamé peut manger jusqu'à trente kilos de viande d'un coup — cette nuit-là n'en est que plus étonnante.",
    "ar": "الأسد الجائع يأكل حتى ثلاثين كيلوغرامًا من اللحم في المرة الواحدة — فما أعجب تلك الليلة!"
   },
   "poster": true,
   "findAt": {
    "x": 30,
    "y": 70,
    "r": 16
   },
   "findAtP": {
    "x": 50,
    "y": 70,
    "r": 16
   }
  },
  {
   "id": "plots_18",
   "slug": "fish",
   "era": 6,
   "pair": "heroes_17",
   "imgReady": true,
   "audioReady": true,
   "emoji": "🐋",
   "name": {
    "ru": "Иона и большая рыба",
    "en": "Jonah and the Great Fish",
    "de": "Jona und der große Fisch",
    "es": "Jonás y el gran pez",
    "pt": "Jonas e o Grande Peixe",
    "fr": "Jonas et le grand poisson",
    "ar": "يونان والحوت الكبير"
   },
   "source": {
    "ru": "Книга Ионы",
    "en": "Book of Jonah",
    "de": "Buch Jona",
    "es": "Libro de Jonás",
    "pt": "Livro de Jonas",
    "fr": "Livre de Jonas",
    "ar": "سفر يونان"
   },
   "story": {
    "ru": "Иона плыл на корабле прочь от поручения, когда началась страшная буря. Он оказался за бортом, и его проглотила огромная рыба. Три дня Иона думал о своём поведении у неё внутри — а потом рыба вынесла его на берег, и он пошёл куда велено.",
    "en": "Jonah sailed away on a ship to escape his task, and a terrible storm arose. He was thrown overboard, and a huge fish swallowed him whole. For three days, Jonah thought about what he had done inside the fish — then it spat him out on the shore, and he went to do as he was told.",
    "de": "Jona segelte mit einem Schiff davon, weg von seinem Auftrag, als ein furchtbarer Sturm losbrach. Er fiel über Bord, und ein riesiger Fisch verschluckte ihn. Drei Tage lang dachte Jona in seinem Bauch über sein Verhalten nach – dann spuckte ihn der Fisch ans Ufer, und er ging, wohin er geschickt worden war.",
    "es": "Jonás navegaba en un barco huyendo de su encargo, cuando estalló una tormenta terrible. Cayó al mar y un enorme pez se lo tragó. Durante tres días, Jonás pensó en su comportamiento dentro del pez, y luego este lo llevó hasta la orilla, y Jonás fue adonde se le había mandado.",
    "pt": "Jonas fugia de barco de uma missão que recebera, quando uma tempestade terrível começou. Ele caiu no mar e foi engolido por um peixe enorme. Por três dias, Jonas pensou sobre o que tinha feito lá dentro do peixe — depois o peixe o deixou na praia, e ele foi fazer o que devia.",
    "fr": "Jonas s'était embarqué pour fuir sa mission, quand une terrible tempête se leva. Il tomba à la mer et fut avalé par un énorme poisson. Pendant trois jours, Jonas réfléchit à sa conduite dans le ventre du poisson — puis celui-ci le rejeta sur le rivage, et Jonas alla faire ce qui lui avait été demandé.",
    "ar": "أبحر يونان بسفينة هاربًا من المهمّة الموكلة إليه، فهبّت عاصفة رهيبة. وقع في البحر فابتلعه حوت ضخم. وقضى يونان ثلاثة أيام في جوفه يفكّر في تصرّفه، ثم لفظه الحوت إلى الشاطئ، فذهب حيث أُمر."
   },
   "findIt": {
    "ru": "корабль на горизонте",
    "en": "a ship on the horizon",
    "de": "ein Schiff am Horizont",
    "es": "un barco en el horizonte",
    "pt": "um navio no horizonte",
    "fr": "un bateau à l'horizon",
    "ar": "سفينة في الأفق"
   },
   "digit": {
    "num": "3",
    "label": {
     "ru": "дня было у Ионы внутри рыбы, чтобы всё обдумать",
     "en": "days Jonah spent inside the fish, with plenty of time to think",
     "de": "Tage war Jona im Bauch des Fisches, um alles zu bedenken",
     "es": "días pasó Jonás dentro del pez, con tiempo de sobra para pensarlo todo",
     "pt": "dias Jonas passou dentro do peixe para pensar em tudo",
     "fr": "jours, Jonas est resté dans le ventre du poisson pour tout réfléchir",
     "ar": "أيامًا قضاها يونان في بطن الحوت ليتأمل في كل شيء"
    }
   },
   "wow": {
    "ru": "Даже у огромного синего кита узкое горло — какая же рыба проглотила Иону, осталось загадкой.",
    "en": "Even a huge blue whale has a narrow throat — just what kind of fish swallowed Jonah remains a mystery.",
    "de": "Selbst der riesige Blauwal hat eine enge Kehle – welcher Fisch Jona wirklich verschlang, bleibt ein Rätsel.",
    "es": "Hasta la enorme ballena azul tiene la garganta estrecha: qué pez se tragó a Jonás sigue siendo un misterio.",
    "pt": "Até a enorme baleia-azul tem a garganta estreita — que peixe engoliu Jonas continua um mistério.",
    "fr": "Même l'immense baleine bleue a la gorge étroite — quel poisson a bien pu avaler Jonas reste un mystère.",
    "ar": "حتى الحوت الأزرق الضخم له حلق ضيق — فأي مخلوق بحري ابتلع يونان يبقى لغزًا."
   },
   "poster": true,
   "findAt": {
    "x": 85,
    "y": 58,
    "r": 12.6
   },
   "book": "jonah",
   "findAtP": {
    "x": 88,
    "y": 20,
    "r": 9
   }
  },
  {
   "id": "plots_19",
   "slug": "esther",
   "era": 6,
   "pair": "heroes_16",
   "imgReady": true,
   "audioReady": true,
   "emoji": "👑",
   "name": {
    "ru": "Эсфирь спасает народ",
    "en": "Esther Saves Her People",
    "de": "Esther rettet ihr Volk",
    "es": "Ester salva a su pueblo",
    "pt": "Ester salva seu povo",
    "fr": "Esther sauve son peuple",
    "ar": "أستير تنجّي شعبها"
   },
   "source": {
    "ru": "Книга Эсфири",
    "en": "Book of Esther",
    "de": "Buch Esther",
    "es": "Libro de Ester",
    "pt": "Livro de Ester",
    "fr": "Livre d'Esther",
    "ar": "سفر أستير"
   },
   "story": {
    "ru": "Царица Эсфирь узнала о злом плане против её народа. Прийти к царю без приглашения означало рисковать жизнью — но она надела лучшие одежды и вошла в тронный зал. Царь протянул ей золотой скипетр, выслушал — и народ был спасён.",
    "en": "Queen Esther learned of a wicked plan against her people. Coming to the king unannounced meant risking her life — but she put on her finest robes and walked into the throne room. The king held out his golden scepter, listened to her — and her people were saved.",
    "de": "Königin Esther erfuhr von einem bösen Plan gegen ihr Volk. Ohne Einladung vor den König zu treten hieß, das eigene Leben zu riskieren – aber sie zog ihre schönsten Kleider an und trat in den Thronsaal. Der König streckte ihr das goldene Zepter entgegen, hörte sie an – und das Volk war gerettet.",
    "es": "La reina Ester descubrió un plan malvado contra su pueblo. Presentarse ante el rey sin ser llamada podía costarle la vida, pero se puso sus mejores vestidos y entró en la sala del trono. El rey le extendió su cetro de oro, la escuchó… y su pueblo fue salvado.",
    "pt": "A rainha Ester descobriu um plano maldoso contra o seu povo. Ir até o rei sem ser chamada era arriscar a própria vida — mas ela vestiu suas melhores roupas e entrou na sala do trono. O rei estendeu o cetro de ouro, ouviu seu pedido — e o povo foi salvo.",
    "fr": "La reine Esther apprit qu'un plan cruel menaçait son peuple. Se présenter devant le roi sans être appelée, c'était risquer sa vie — mais elle mit ses plus belles robes et entra dans la salle du trône. Le roi tendit son sceptre d'or, l'écouta… et son peuple fut sauvé.",
    "ar": "علمت الملكة أستير بخطة شريرة تُحاك ضد شعبها. الدخول إلى الملك بلا دعوة كان يعني تعريض حياتها للخطر — لكنها ارتدت أجمل ثيابها ودخلت قاعة العرش. مدّ الملك إليها الصولجان الذهبي واستمع إليها، فنجا الشعب."
   },
   "findIt": {
    "ru": "золотой скипетр",
    "en": "the golden scepter",
    "de": "das goldene Zepter",
    "es": "el cetro de oro",
    "pt": "o cetro de ouro",
    "fr": "le sceptre d'or",
    "ar": "الصولجان الذهبي"
   },
   "digit": {
    "num": "127",
    "label": {
     "ru": "областей было в огромном царстве — и всем грозила беда",
     "en": "provinces made up the huge kingdom — and trouble threatened them all",
     "de": "Provinzen hatte das riesige Reich – und allen drohte Unglück",
     "es": "provincias tenía aquel inmenso reino, y todas corrían peligro",
     "pt": "províncias havia naquele reino imenso — e todas correndo perigo",
     "fr": "provinces comptait cet immense royaume — et toutes étaient menacées d'un grand malheur",
     "ar": "ولاية كانت في المملكة الشاسعة — وكلها كانت في خطر"
    }
   },
   "wow": {
    "ru": "В праздник Пурим до сих пор шумят трещотками и дарят друг другу сладости.",
    "en": "At the feast of Purim, people still shake noisemakers and give each other sweets.",
    "de": "Am Purimfest wird noch heute mit Rasseln Lärm gemacht und Süßigkeiten verschenkt.",
    "es": "En la fiesta de Purim todavía se hace ruido con matracas y se regalan dulces entre todos.",
    "pt": "Na festa de Purim, até hoje se agita matracas e se trocam doces entre amigos.",
    "fr": "Pendant la fête de Pourim, on agite encore aujourd'hui des crécelles et on s'offre des friandises.",
    "ar": "في عيد بوريم ما زالوا يستخدمون المطاحن الصاخبة ويتبادلون الحلويات."
   },
   "poster": true,
   "findAt": {
    "x": 50,
    "y": 50,
    "r": 16
   },
   "findAtP": {
    "x": 57,
    "y": 32,
    "r": 9
   }
  },
  {
   "id": "plots_20",
   "slug": "nativity",
   "era": 7,
   "pair": "heroes_18",
   "imgReady": true,
   "audioReady": true,
   "emoji": "⭐",
   "name": {
    "ru": "Рождество и звезда",
    "en": "Christmas and the Star",
    "de": "Weihnachten und der Stern",
    "es": "La Navidad y la estrella",
    "pt": "O Natal e a estrela",
    "fr": "La Nativité et l'étoile",
    "ar": "الميلاد والنجمة"
   },
   "source": {
    "ru": "Евангелие от Луки и от Матфея",
    "en": "Gospels of Luke and Matthew",
    "de": "Evangelium nach Lukas und nach Matthäus",
    "es": "Evangelios de Lucas y Mateo",
    "pt": "Evangelhos de Lucas e de Mateus",
    "fr": "Évangiles selon Luc et selon Matthieu",
    "ar": "إنجيل لوقا وإنجيل متى"
   },
   "story": {
    "ru": "В городке Вифлееме не нашлось места в гостинице, и младенец родился в хлеву, среди овец и ослика. Пастухи пришли первыми, а мудрецы-волхвы издалека — за новой яркой звездой. Этот день теперь празднуют по всему миру.",
    "en": "There was no room at the inn in the little town of Bethlehem, so the baby was born in a stable, among the sheep and a donkey. Shepherds came first, and wise men came from far away, following a bright new star. This day is now celebrated all around the world.",
    "de": "In der kleinen Stadt Bethlehem war kein Platz in der Herberge, und so kam das Kind in einem Stall zur Welt, zwischen Schafen und einem kleinen Esel. Die Hirten kamen als Erste, und weise Männer aus fernen Ländern folgten einem neuen, hellen Stern. Diesen Tag feiert man heute auf der ganzen Welt.",
    "es": "En el pueblito de Belén no quedaba sitio en la posada, así que el niño nació en un establo, entre ovejas y un burrito. Los pastores llegaron primero, y unos sabios magos vinieron desde muy lejos siguiendo una estrella nueva y brillante. Ese día se celebra hoy en todo el mundo.",
    "pt": "Na cidadezinha de Belém não havia lugar na hospedaria, e o bebê nasceu num estábulo, entre ovelhas e um jumentinho. Os pastores chegaram primeiro, e os sábios magos vieram de longe, seguindo uma estrela nova e brilhante. Esse dia é celebrado até hoje no mundo inteiro.",
    "fr": "Dans la petite ville de Bethléem, il n'y avait plus de place à l'auberge, alors le bébé naquit dans une étable, parmi les moutons et un petit âne. Les bergers vinrent les premiers, puis des sages venus de loin, guidés par une étoile toute nouvelle et brillante. Aujourd'hui, on fête ce jour partout dans le monde.",
    "ar": "في بلدة بيت لحم، لم يكن هناك مكان في النُّزل، فولد الطفل في حظيرة بين الخِراف والحمار. جاء الرعاة أولاً، وجاء الحكماء من بعيد يتبعون نجمة جديدة ساطعة. واليوم يحتفل العالم كله بهذا اليوم."
   },
   "findIt": {
    "ru": "вифлеемскую звезду",
    "en": "the Star of Bethlehem",
    "de": "den Stern von Bethlehem",
    "es": "la estrella de Belén",
    "pt": "a estrela de Belém",
    "fr": "l'étoile de Bethléem",
    "ar": "نجمة بيت لحم"
   },
   "digit": {
    "num": "3",
    "label": {
     "ru": "дара лежали у яслей: золото, ладан и мирра",
     "en": "gifts lay by the manger: gold, frankincense, and myrrh",
     "de": "Gaben lagen an der Krippe: Gold, Weihrauch und Myrrhe",
     "es": "regalos había junto al pesebre: oro, incienso y mirra",
     "pt": "presentes ficaram junto à manjedoura: ouro, incenso e mirra",
     "fr": "présents étaient déposés près de la crèche : de l'or, de l'encens et de la myrrhe",
     "ar": "هدايا وُضعت عند المهد: ذهب ولُبان ومرّ"
    }
   },
   "wow": {
    "ru": "Рождество празднуют в разные дни: кто-то 25 декабря, а кто-то 7 января.",
    "en": "Christmas is celebrated on different days: some on December 25, others on January 7.",
    "de": "Weihnachten wird an verschiedenen Tagen gefeiert: manche am 25. Dezember, andere am 7. Januar.",
    "es": "La Navidad se celebra en días distintos: unos el 25 de diciembre y otros el 7 de enero.",
    "pt": "O Natal é celebrado em dias diferentes: uns em 25 de dezembro, outros em 7 de janeiro.",
    "fr": "Noël n'est pas fêté partout le même jour : certains le célèbrent le 25 décembre, d'autres le 7 janvier.",
    "ar": "يحتفل الناس بعيد الميلاد في أيام مختلفة: بعضهم في 25 ديسمبر، وبعضهم في 7 يناير."
   },
   "poster": true,
   "findAt": {
    "x": 23,
    "y": 16,
    "r": 9
   },
   "book": "nativity",
   "findAtP": {
    "x": 33,
    "y": 20,
    "r": 9
   }
  }
 ],
 "books": [
  {
   "id": "sotvorenie-mira",
   "ready": true,
   "emoji": "🌍",
   "title": {
    "ru": "Сотворение мира",
    "en": "The Creation of the World",
    "de": "Die Erschaffung der Welt",
    "es": "La creación del mundo",
    "pt": "A criação do mundo",
    "fr": "La création du monde",
    "ar": "خلق العالم"
   },
   "cover": "books/sotvorenie-mira/cover.webp",
   "reader": "books/sotvorenie-mira/reader.html"
  },
  {
   "id": "moses",
   "ready": true,
   "emoji": "📜",
   "title": {
    "ru": "История Моисея",
    "en": "The Story of Moses",
    "de": "Die Geschichte von Mose",
    "es": "La historia de Moisés",
    "pt": "A História de Moisés",
    "fr": "L'histoire de Moïse",
    "ar": "قصة موسى"
   },
   "cover": "books/moses/cover.webp",
   "reader": "books/moses/reader.html"
  },
  {
   "id": "noev-kovcheg",
   "ready": true,
   "emoji": "🌈",
   "title": {
    "ru": "Ноев ковчег",
    "en": "Noah's Ark",
    "de": "Die Arche Noah",
    "es": "El arca de Noé",
    "pt": "A Arca de Noé",
    "fr": "L'arche de Noé",
    "ar": "سفينة نوح"
   },
   "cover": "books/noev-kovcheg/cover.webp",
   "reader": "books/noev-kovcheg/reader.html"
  },
  {
   "id": "david",
   "ready": true,
   "emoji": "🎵",
   "title": {
    "ru": "История Давида",
    "en": "The Story of David",
    "de": "Die Geschichte von David",
    "es": "La historia de David",
    "pt": "A História de Davi",
    "fr": "L'histoire de David",
    "ar": "قصة داوود"
   },
   "cover": "books/david/cover.webp",
   "reader": "books/david/reader.html"
  },
  {
   "id": "jonah",
   "ready": true,
   "emoji": "🐋",
   "title": {
    "ru": "История Ионы",
    "en": "The Story of Jonah",
    "de": "Die Geschichte von Jona",
    "es": "La historia de Jonás",
    "pt": "A História de Jonas",
    "fr": "L'histoire de Jonas",
    "ar": "قصة يونان"
   },
   "cover": "books/jonah/cover.webp",
   "reader": "books/jonah/reader.html"
  },
  {
   "id": "nativity",
   "ready": true,
   "emoji": "⭐",
   "title": {
    "ru": "История Рождества",
    "en": "The Story of Christmas",
    "de": "Die Geschichte der Geburt Jesu",
    "es": "La historia de la Navidad",
    "pt": "A História do Natal",
    "fr": "L'histoire de la Nativité",
    "ar": "قصة الميلاد"
   },
   "cover": "books/nativity/cover.webp",
   "reader": "books/nativity/reader.html"
  }
 ],
 "artifacts": [
  {
   "emoji": "🪢",
   "name": {
    "ru": "Праща",
    "en": "Sling",
    "de": "Schleuder",
    "es": "La honda",
    "pt": "Funda",
    "fr": "La fronde",
    "ar": "المِقلاع"
   },
   "hero": "heroes_12"
  },
  {
   "emoji": "🥁",
   "name": {
    "ru": "Бубен",
    "en": "Tambourine",
    "de": "Tamburin",
    "es": "El panderete",
    "pt": "Pandeiro",
    "fr": "Le tambourin",
    "ar": "الدُّف"
   },
   "hero": "heroes_07"
  },
  {
   "emoji": "🧥",
   "name": {
    "ru": "Разноцветная одежда",
    "en": "Coat of Many Colors",
    "de": "Der bunte Mantel",
    "es": "La túnica de colores",
    "pt": "Túnica colorida",
    "fr": "La tunique multicolore",
    "ar": "الثوب الملوّن"
   },
   "hero": "heroes_05"
  },
  {
   "emoji": "📜",
   "name": {
    "ru": "Каменные скрижали",
    "en": "Stone Tablets",
    "de": "Die steinernen Gesetzestafeln",
    "es": "Las tablas de piedra",
    "pt": "Tábuas de pedra",
    "fr": "Les tables de pierre",
    "ar": "الألواح الحجرية"
   },
   "hero": "heroes_06"
  },
  {
   "emoji": "🎵",
   "name": {
    "ru": "Арфа",
    "en": "Harp",
    "de": "Harfe",
    "es": "El arpa",
    "pt": "Harpa",
    "fr": "La harpe",
    "ar": "القيثارة"
   },
   "hero": "heroes_12"
  },
  {
   "emoji": "📯",
   "name": {
    "ru": "Труба-шофар",
    "en": "Ram's Horn Trumpet",
    "de": "Das Widderhorn",
    "es": "Trompeta de cuerno (shofar)",
    "pt": "Trombeta de Chifre",
    "fr": "La corne de shofar",
    "ar": "بوق الشوفار"
   },
   "hero": "heroes_08"
  },
  {
   "emoji": "🕊️",
   "name": {
    "ru": "Оливковая веточка",
    "en": "Olive Branch",
    "de": "Der Ölzweig",
    "es": "Rama de olivo",
    "pt": "Ramo de Oliveira",
    "fr": "Le rameau d'olivier",
    "ar": "غصن الزيتون"
   },
   "hero": "heroes_01"
  },
  {
   "emoji": "🌾",
   "name": {
    "ru": "Колоски с поля",
    "en": "Ears of Grain",
    "de": "Die Ähren vom Feld",
    "es": "Espigas del campo",
    "pt": "Espigas do Campo",
    "fr": "Les épis du champ",
    "ar": "سنابل من الحقل"
   },
   "hero": "heroes_10"
  },
  {
   "emoji": "💇",
   "name": {
    "ru": "Длинные волосы",
    "en": "Long Hair",
    "de": "Die langen Haare",
    "es": "Cabello largo",
    "pt": "Cabelos Compridos",
    "fr": "Les longs cheveux",
    "ar": "الشعر الطويل"
   },
   "hero": "heroes_09"
  },
  {
   "emoji": "⭐",
   "name": {
    "ru": "Путеводная звезда",
    "en": "Guiding Star",
    "de": "Der Wegweiser-Stern",
    "es": "Estrella guía",
    "pt": "Estrela-Guia",
    "fr": "L'étoile qui guide",
    "ar": "النجم الهادي"
   },
   "hero": "heroes_20"
  },
  {
   "emoji": "🛏️",
   "name": {
    "ru": "Ясли с сеном",
    "en": "Manger with Hay",
    "de": "Die Futterkrippe mit Heu",
    "es": "Pesebre con heno",
    "pt": "Manjedoura com Feno",
    "fr": "La mangeoire remplie de foin",
    "ar": "المذود المليء بالتبن"
   },
   "hero": "heroes_18"
  },
  {
   "emoji": "🪚",
   "name": {
    "ru": "Пила и рубанок",
    "en": "Saw and Plane",
    "de": "Säge und Hobel",
    "es": "Sierra y cepillo de carpintero",
    "pt": "Serrote e Plaina",
    "fr": "La scie et le rabot",
    "ar": "المنشار والمِسحَج"
   },
   "hero": "heroes_19"
  },
  {
   "emoji": "🔥",
   "name": {
    "ru": "Огненная колесница",
    "en": "Chariot of Fire",
    "de": "Der feurige Wagen",
    "es": "Carro de fuego",
    "pt": "Carruagem de Fogo",
    "fr": "Le char de feu",
    "ar": "مركبة النار"
   },
   "hero": "heroes_14"
  },
  {
   "emoji": "🏛️",
   "name": {
    "ru": "Золотой Храм",
    "en": "Golden Temple",
    "de": "Der goldene Tempel",
    "es": "Templo dorado",
    "pt": "Templo Dourado",
    "fr": "Le Temple doré",
    "ar": "الهيكل الذهبي"
   },
   "hero": "heroes_13"
  }
 ],
 "glossary": [
  {
   "emoji": "🚢",
   "word": {
    "ru": "Ковчег",
    "en": "Ark",
    "de": "Arche",
    "es": "Arca",
    "pt": "Arca",
    "fr": "Arche",
    "ar": "الفُلك"
   },
   "def": {
    "ru": "Огромный деревянный корабль, в котором спаслись семья Ноя и животные.",
    "en": "A huge wooden boat that saved Noah's family and the animals.",
    "de": "Ein riesiges Holzschiff, in dem Noahs Familie und die Tiere gerettet wurden.",
    "es": "Un enorme barco de madera en el que se salvaron la familia de Noé y los animales.",
    "pt": "Um imenso barco de madeira onde a família de Noé e os animais se salvaram.",
    "fr": "Un immense bateau en bois où se sont réfugiés la famille de Noé et les animaux.",
    "ar": "سفينة خشبية ضخمة نجت فيها عائلة نوح والحيوانات."
   },
   "refs": [
    "heroes_01",
    "plots_03"
   ]
  },
  {
   "emoji": "🤝",
   "word": {
    "ru": "Завет",
    "en": "Covenant",
    "de": "Bund",
    "es": "Alianza",
    "pt": "Aliança",
    "fr": "Alliance",
    "ar": "العهد"
   },
   "def": {
    "ru": "Важное обещание-договор, которое заключают навсегда.",
    "en": "An important promise, made to last forever.",
    "de": "Ein wichtiges Versprechen, das für immer gilt.",
    "es": "Una promesa muy importante, un acuerdo que se hace para siempre.",
    "pt": "Uma promessa muito importante, feita para durar para sempre.",
    "fr": "Une promesse très importante, une sorte de contrat conclu pour toujours.",
    "ar": "وعد مهم واتفاق يُقطع إلى الأبد."
   },
   "refs": [
    "plots_04"
   ]
  },
  {
   "emoji": "📜",
   "word": {
    "ru": "Скрижали",
    "en": "Tablets",
    "de": "Gesetzestafeln",
    "es": "Tablas de piedra",
    "pt": "Tábuas da Lei",
    "fr": "Tables de la Loi",
    "ar": "اللوحان"
   },
   "def": {
    "ru": "Две каменные плиты с десятью главными правилами жизни.",
    "en": "Two stone slabs with the ten most important rules for living.",
    "de": "Zwei Steintafeln mit den zehn wichtigsten Regeln für das Leben.",
    "es": "Dos losas de piedra con las diez reglas principales para vivir bien.",
    "pt": "Duas placas de pedra com as dez regras mais importantes para se viver bem.",
    "fr": "Deux plaques de pierre portant les dix règles les plus importantes de la vie.",
    "ar": "لوحان من الحجر مكتوب عليهما عشر قواعد مهمة للحياة."
   },
   "refs": [
    "plots_12",
    "heroes_06"
   ]
  },
  {
   "emoji": "❄️",
   "word": {
    "ru": "Манна",
    "en": "Manna",
    "de": "Manna",
    "es": "Maná",
    "pt": "Maná",
    "fr": "Manne",
    "ar": "المنّ"
   },
   "def": {
    "ru": "Белые сладковатые крупинки, которые находили в пустыне каждое утро.",
    "en": "Sweet little white flakes found on the ground in the desert every morning.",
    "de": "Kleine weiße, süßliche Körner, die man jeden Morgen in der Wüste fand.",
    "es": "Pequeños granos blancos y dulces que aparecían en el desierto cada mañana.",
    "pt": "Pequenos grãozinhos brancos e docinhos, encontrados no deserto toda manhã.",
    "fr": "De petits grains blancs, un peu sucrés, que l'on trouvait chaque matin dans le désert.",
    "ar": "حبيبات بيضاء حلوة المذاق كانوا يجدونها في الصحراء كل صباح."
   },
   "refs": [
    "plots_11"
   ]
  },
  {
   "emoji": "🗣️",
   "word": {
    "ru": "Пророк",
    "en": "Prophet",
    "de": "Prophet",
    "es": "Profeta",
    "pt": "Profeta",
    "fr": "Prophète",
    "ar": "النبي"
   },
   "def": {
    "ru": "Человек, который говорит людям важную правду и предупреждает о будущем.",
    "en": "Someone who tells people important truths and warns them about the future.",
    "de": "Ein Mensch, der den Menschen wichtige Wahrheiten sagt und sie vor der Zukunft warnt.",
    "es": "Una persona que dice a la gente verdades importantes y advierte sobre el futuro.",
    "pt": "Uma pessoa que conta às outras verdades importantes e avisa sobre o futuro.",
    "fr": "Une personne qui dit aux gens une vérité importante et les prévient de ce qui va arriver.",
    "ar": "شخص يقول للناس حقيقة مهمة ويحذّرهم مما سيأتي."
   },
   "refs": [
    "heroes_14",
    "heroes_17"
   ]
  },
  {
   "emoji": "👧",
   "word": {
    "ru": "Пророчица",
    "en": "Prophetess",
    "de": "Prophetin",
    "es": "Profetisa",
    "pt": "Profetisa",
    "fr": "Prophétesse",
    "ar": "النبيّة"
   },
   "def": {
    "ru": "Женщина-пророк; так в Библии названа Мириам.",
    "en": "A woman prophet — this is what the Bible calls Miriam.",
    "de": "Eine Frau, die wie ein Prophet sprach; so wird Mirjam in der Bibel genannt.",
    "es": "Mujer profetisa; así llama la Biblia a Miriam.",
    "pt": "Mulher profetisa; assim a Bíblia chama Miriam.",
    "fr": "Femme prophète ; c'est ainsi que la Bible appelle Miriam.",
    "ar": "امرأة نبيّة؛ هكذا وُصفت مريم في الكتاب."
   },
   "refs": [
    "heroes_07"
   ]
  },
  {
   "emoji": "👑",
   "word": {
    "ru": "Фараон",
    "en": "Pharaoh",
    "de": "Pharao",
    "es": "Faraón",
    "pt": "Faraó",
    "fr": "Pharaon",
    "ar": "فرعون"
   },
   "def": {
    "ru": "Царь Древнего Египта.",
    "en": "The king of Ancient Egypt.",
    "de": "Der König des alten Ägypten.",
    "es": "Rey del antiguo Egipto.",
    "pt": "Rei do Egito Antigo.",
    "fr": "Roi de l'Égypte ancienne.",
    "ar": "لقب ملك مصر القديمة."
   },
   "refs": [
    "plots_08",
    "heroes_05"
   ]
  },
  {
   "emoji": "🚶",
   "word": {
    "ru": "Исход",
    "en": "Exodus",
    "de": "Exodus",
    "es": "Éxodo",
    "pt": "Êxodo",
    "fr": "Exode",
    "ar": "الخروج"
   },
   "def": {
    "ru": "Великий выход народа из Египта на свободу.",
    "en": "The great journey of a people leaving Egypt to be free.",
    "de": "Der große Auszug des Volkes aus Ägypten in die Freiheit.",
    "es": "La gran salida del pueblo de Egipto hacia la libertad.",
    "pt": "A grande saída do povo do Egito rumo à liberdade.",
    "fr": "La grande sortie du peuple hors d'Égypte vers la liberté.",
    "ar": "الخروج العظيم للشعب من مصر إلى الحرية."
   },
   "refs": [
    "heroes_06",
    "plots_10"
   ]
  },
  {
   "emoji": "🏕️",
   "word": {
    "ru": "Скиния",
    "en": "Tabernacle",
    "de": "Stiftshütte",
    "es": "Tabernáculo",
    "pt": "Tabernáculo",
    "fr": "Tabernacle",
    "ar": "خيمة الاجتماع"
   },
   "def": {
    "ru": "Разборный походный шатёр-храм, который носили через пустыню.",
    "en": "A portable tent-temple that could be taken apart and carried through the desert.",
    "de": "Ein zerlegbares Wanderzelt-Heiligtum, das durch die Wüste getragen wurde.",
    "es": "Tienda-templo desmontable que llevaban consigo por el desierto.",
    "pt": "Uma tenda-templo que se montava e desmontava, levada pelo deserto.",
    "fr": "Tente-temple démontable qu'on transportait à travers le désert.",
    "ar": "خيمة مقدّسة قابلة للطي، كانوا يحملونها معهم عبر الصحراء."
   },
   "refs": [
    "plots_11"
   ]
  },
  {
   "emoji": "📯",
   "word": {
    "ru": "Шофар",
    "en": "Shofar",
    "de": "Schofar",
    "es": "Shofar",
    "pt": "Shofar",
    "fr": "Chofar",
    "ar": "البوق"
   },
   "def": {
    "ru": "Труба из бараньего рога; от её звука пали стены Иерихона.",
    "en": "A trumpet made from a ram's horn; its blast brought down the walls of Jericho.",
    "de": "Ein Horn aus Widderhorn; bei seinem Klang fielen die Mauern von Jericho.",
    "es": "Trompeta hecha de cuerno de carnero; con su sonido cayeron los muros de Jericó.",
    "pt": "Trombeta feita de chifre de carneiro; ao seu som, caíram os muros de Jericó.",
    "fr": "Trompette faite d'une corne de bélier ; à son son, les murs de Jéricho sont tombés.",
    "ar": "بوق من قرن الكبش؛ بصوته سقطت أسوار أريحا."
   },
   "refs": [
    "plots_13",
    "heroes_08"
   ]
  },
  {
   "emoji": "🪢",
   "word": {
    "ru": "Праща",
    "en": "Sling",
    "de": "Schleuder",
    "es": "Honda",
    "pt": "Funda",
    "fr": "Fronde",
    "ar": "المقلاع"
   },
   "def": {
    "ru": "Ремешок для метания камней — оружие пастуха Давида.",
    "en": "A strap for throwing stones — the shepherd David's weapon.",
    "de": "Ein Riemen zum Steinewerfen — die Waffe des Hirten David.",
    "es": "Tira de cuero para lanzar piedras: el arma del pastor David.",
    "pt": "Tira de couro para atirar pedras — a arma do pastor Davi.",
    "fr": "Lanière pour lancer des pierres — l'arme du berger David.",
    "ar": "حزام لرمي الحجارة — سلاح الراعي داود."
   },
   "refs": [
    "plots_14",
    "heroes_12"
   ]
  },
  {
   "emoji": "📃",
   "word": {
    "ru": "Свиток",
    "en": "Scroll",
    "de": "Schriftrolle",
    "es": "Rollo",
    "pt": "Pergaminho",
    "fr": "Rouleau",
    "ar": "الدَّرج"
   },
   "def": {
    "ru": "Древняя книга: длинный лист, свёрнутый в трубочку.",
    "en": "An ancient kind of book: a long sheet rolled up into a tube.",
    "de": "Ein altes Buch: ein langes Blatt, zu einer Rolle zusammengerollt.",
    "es": "Libro antiguo: una hoja larga enrollada como un tubo.",
    "pt": "Livro antigo: uma longa folha enrolada como um tubinho.",
    "fr": "Livre ancien : une longue feuille enroulée sur elle-même.",
    "ar": "كتاب قديم: ورقة طويلة ملفوفة على شكل أسطوانة."
   },
   "refs": []
  },
  {
   "emoji": "🪨",
   "word": {
    "ru": "Жертвенник",
    "en": "Altar",
    "de": "Altar",
    "es": "Altar",
    "pt": "Altar",
    "fr": "Autel",
    "ar": "المذبح"
   },
   "def": {
    "ru": "Каменный стол древних времён для благодарственных приношений.",
    "en": "A stone table from ancient times used for thankful offerings.",
    "de": "Ein steinerner Tisch aus alter Zeit für Dankopfer.",
    "es": "Mesa de piedra de tiempos antiguos para las ofrendas de agradecimiento.",
    "pt": "Mesa de pedra dos tempos antigos, usada para oferendas de agradecimento.",
    "fr": "Table de pierre des temps anciens pour les offrandes de remerciement.",
    "ar": "طاولة حجرية من الأزمنة القديمة لتقديم القرابين شكرًا."
   },
   "refs": [
    "heroes_02"
   ]
  },
  {
   "emoji": "👴",
   "word": {
    "ru": "Патриарх",
    "en": "Patriarch",
    "de": "Patriarch",
    "es": "Patriarca",
    "pt": "Patriarca",
    "fr": "Patriarche",
    "ar": "الجَدّ الأكبر"
   },
   "def": {
    "ru": "Глава большого рода; так называют Авраама, Исаака и Иакова.",
    "en": "The head of a great family — this is what Abraham, Isaac, and Jacob are called.",
    "de": "Das Oberhaupt einer großen Sippe; so nennt man Abraham, Isaak und Jakob.",
    "es": "Jefe de una gran familia; así se llama a Abraham, Isaac y Jacob.",
    "pt": "Chefe de uma grande família; assim se chamam Abraão, Isaque e Jacó.",
    "fr": "Chef d'une grande famille ; c'est ainsi qu'on appelle Abraham, Isaac et Jacob.",
    "ar": "رأس عائلة كبيرة؛ هكذا يُدعى إبراهيم وإسحاق ويعقوب."
   },
   "refs": [
    "heroes_02",
    "heroes_04"
   ]
  },
  {
   "emoji": "🌴",
   "word": {
    "ru": "Оазис",
    "en": "Oasis",
    "de": "Oase",
    "es": "Oasis",
    "pt": "Oásis",
    "fr": "Oasis",
    "ar": "الواحة"
   },
   "def": {
    "ru": "Место в пустыне, где есть вода и растут деревья.",
    "en": "A place in the desert where there is water and trees grow.",
    "de": "Ein Ort in der Wüste, wo es Wasser gibt und Bäume wachsen.",
    "es": "Lugar en el desierto donde hay agua y crecen árboles.",
    "pt": "Um lugar no deserto onde há água e árvores.",
    "fr": "Un endroit dans le désert où il y a de l'eau et des arbres.",
    "ar": "مكان في الصحراء فيه ماء وتنمو فيه الأشجار."
   },
   "refs": [
    "plots_11"
   ]
  },
  {
   "emoji": "🌿",
   "word": {
    "ru": "Папирус",
    "en": "Papyrus",
    "de": "Papyrus",
    "es": "Papiro",
    "pt": "Papiro",
    "fr": "Papyrus",
    "ar": "ورق البردي"
   },
   "def": {
    "ru": "Речное растение, из которого в Египте делали «бумагу».",
    "en": "A river plant the Egyptians used to make a kind of \"paper.\"",
    "de": "Eine Pflanze vom Flussufer, aus der man in Ägypten „Papier“ machte.",
    "es": "Planta de río con la que en Egipto fabricaban una especie de «papel».",
    "pt": "Planta que crescia à beira do rio, usada no Egito para fazer uma espécie de \"papel\".",
    "fr": "Plante des rives du Nil avec laquelle on fabriquait le « papier » en Égypte.",
    "ar": "نبات نهري كان المصريون يصنعون منه نوعًا من «الورق»."
   },
   "refs": [
    "plots_08"
   ]
  },
  {
   "emoji": "🐎",
   "word": {
    "ru": "Колесница",
    "en": "Chariot",
    "de": "Streitwagen",
    "es": "Carro de guerra",
    "pt": "Carruagem",
    "fr": "Char",
    "ar": "مركبة حربية"
   },
   "def": {
    "ru": "Лёгкая боевая повозка, запряжённая конями.",
    "en": "A light cart for battle, pulled by horses.",
    "de": "Ein leichter Kriegswagen, gezogen von Pferden.",
    "es": "Carruaje de guerra ligero, tirado por caballos.",
    "pt": "Um carrinho leve de guerra, puxado por cavalos.",
    "fr": "Légère voiture de guerre tirée par des chevaux.",
    "ar": "عربة حربية خفيفة تجرّها الخيول."
   },
   "refs": [
    "heroes_14",
    "plots_10"
   ]
  },
  {
   "emoji": "🛏️",
   "word": {
    "ru": "Ясли",
    "en": "Manger",
    "de": "Krippe",
    "es": "Pesebre",
    "pt": "Manjedoura",
    "fr": "Mangeoire",
    "ar": "المذود"
   },
   "def": {
    "ru": "Кормушка для животных; первая кроватка младенца в Вифлееме.",
    "en": "A feeding trough for animals; baby Jesus's first little bed in Bethlehem.",
    "de": "Ein Futtertrog für Tiere; das erste Bettchen des Kindes in Bethlehem.",
    "es": "Comedero para animales; la primera camita del bebé en Belén.",
    "pt": "Um cocho onde os animais comiam; foi a primeira caminha do bebê Jesus em Belém.",
    "fr": "Auge pour nourrir les animaux ; premier petit lit du bébé à Bethléem.",
    "ar": "معلف للحيوانات؛ صار أول سرير لطفل بيت لحم الصغير."
   },
   "refs": [
    "plots_20",
    "heroes_18"
   ]
  },
  {
   "emoji": "⭐",
   "word": {
    "ru": "Волхвы",
    "en": "Wise Men",
    "de": "Weise aus dem Morgenland",
    "es": "Magos",
    "pt": "Magos",
    "fr": "Mages",
    "ar": "المجوس"
   },
   "def": {
    "ru": "Учёные-звездочёты с востока, пришедшие в Вифлеем за звездой.",
    "en": "Star-watching scholars from the East who came to Bethlehem, following a star.",
    "de": "Gelehrte Sterndeuter aus dem Osten, die dem Stern nach Bethlehem folgten.",
    "es": "Sabios que estudiaban las estrellas y vinieron de oriente a Belén siguiendo una estrella.",
    "pt": "Sábios que estudavam as estrelas e vieram do oriente até Belém, seguindo uma estrela.",
    "fr": "Savants qui étudiaient les étoiles et venus de l'Orient jusqu'à Bethléem en suivant une étoile.",
    "ar": "علماء فلك من الشرق جاؤوا إلى بيت لحم يتبعون نجمًا."
   },
   "refs": [
    "heroes_20",
    "plots_20"
   ]
  },
  {
   "emoji": "💨",
   "word": {
    "ru": "Ладан",
    "en": "Frankincense",
    "de": "Weihrauch",
    "es": "Incienso",
    "pt": "Incenso",
    "fr": "Encens",
    "ar": "اللبان"
   },
   "def": {
    "ru": "Душистая смола, которую сжигают ради приятного дыма.",
    "en": "A sweet-smelling resin burned for its lovely scent.",
    "de": "Duftendes Harz, das man verbrennt, weil es so gut riecht.",
    "es": "Resina perfumada que se quema para que suelte un humo agradable.",
    "pt": "Uma resina perfumada que se queima para soltar uma fumaça de cheiro agradável.",
    "fr": "Résine parfumée qu'on brûle pour sa fumée agréable.",
    "ar": "صمغ عطري يُحرَق فيفوح منه دخان طيب الرائحة."
   },
   "refs": [
    "heroes_20"
   ]
  },
  {
   "emoji": "🫙",
   "word": {
    "ru": "Мирра",
    "en": "Myrrh",
    "de": "Myrrhe",
    "es": "Mirra",
    "pt": "Mirra",
    "fr": "Myrrhe",
    "ar": "المُرّ"
   },
   "def": {
    "ru": "Драгоценное ароматное масло из смолы дерева.",
    "en": "A precious fragrant oil made from tree resin.",
    "de": "Ein kostbares duftendes Öl aus dem Harz eines Baumes.",
    "es": "Aceite aromático muy valioso, hecho con la resina de un árbol.",
    "pt": "Um óleo precioso e perfumado, feito da resina de uma árvore.",
    "fr": "Précieuse huile parfumée tirée de la résine d'un arbre.",
    "ar": "زيت عطري ثمين يُستخرج من صمغ شجرة."
   },
   "refs": [
    "heroes_20"
   ]
  },
  {
   "emoji": "🎵",
   "word": {
    "ru": "Псалом",
    "en": "Psalm",
    "de": "Psalm",
    "es": "Salmo",
    "pt": "Salmo",
    "fr": "Psaume",
    "ar": "المزمور"
   },
   "def": {
    "ru": "Песня-стихотворение; псалмы Давида поют уже три тысячи лет.",
    "en": "A song-poem; David's psalms have been sung for three thousand years.",
    "de": "Ein Lied-Gedicht; die Psalmen Davids werden schon seit dreitausend Jahren gesungen.",
    "es": "Canción-poema; los salmos de David se cantan desde hace tres mil años.",
    "pt": "Um poema que se canta; os salmos de Davi são cantados há três mil anos.",
    "fr": "Chant-poème ; les psaumes de David sont chantés depuis trois mille ans.",
    "ar": "قصيدة تُغنّى؛ ومزامير داود يرتّلها الناس منذ ثلاثة آلاف سنة."
   },
   "refs": [
    "heroes_12"
   ]
  },
  {
   "emoji": "🏛️",
   "word": {
    "ru": "Храм",
    "en": "Temple",
    "de": "Tempel",
    "es": "Templo",
    "pt": "Templo",
    "fr": "Temple",
    "ar": "الهيكل"
   },
   "def": {
    "ru": "Большой красивый дом для молитвы.",
    "en": "A big, beautiful house for prayer.",
    "de": "Ein großes, schönes Haus zum Beten.",
    "es": "Una casa grande y hermosa para orar.",
    "pt": "Uma casa grande e bonita para orar.",
    "fr": "Grande et belle maison pour prier.",
    "ar": "بيت كبير وجميل للصلاة."
   },
   "refs": [
    "plots_16",
    "heroes_13"
   ]
  },
  {
   "emoji": "⛏️",
   "word": {
    "ru": "Каменоломня",
    "en": "Quarry",
    "de": "Steinbruch",
    "es": "Cantera",
    "pt": "Pedreira",
    "fr": "Carrière",
    "ar": "المحجر"
   },
   "def": {
    "ru": "Место, где из скалы вырубают камни для стройки.",
    "en": "A place where stones are cut from rock for building.",
    "de": "Ein Ort, an dem Steine aus dem Fels für den Bau gehauen werden.",
    "es": "Lugar donde se cortan piedras de la roca para construir.",
    "pt": "Um lugar onde se cortam pedras da rocha para construir.",
    "fr": "Endroit où l'on taille des pierres dans la roche pour construire.",
    "ar": "مكان تُقطع فيه الحجارة من الصخر لأجل البناء."
   },
   "refs": [
    "plots_16"
   ]
  },
  {
   "emoji": "📋",
   "word": {
    "ru": "Перепись",
    "en": "Census",
    "de": "Volkszählung",
    "es": "Censo",
    "pt": "Censo",
    "fr": "Recensement",
    "ar": "الإحصاء"
   },
   "def": {
    "ru": "Подсчёт всех жителей страны поимённо.",
    "en": "Counting every person in the land, by name.",
    "de": "Das Zählen aller Bewohner eines Landes, Namen für Namen.",
    "es": "El conteo de todos los habitantes de un país, uno por uno.",
    "pt": "Uma contagem de todas as pessoas do país, uma por uma, pelo nome.",
    "fr": "Décompte de tous les habitants d'un pays, nom par nom.",
    "ar": "عدّ جميع سكان البلاد واحدًا واحدًا بأسمائهم."
   },
   "refs": [
    "plots_20"
   ]
  },
  {
   "emoji": "✨",
   "word": {
    "ru": "Скипетр",
    "en": "Scepter",
    "de": "Zepter",
    "es": "Cetro",
    "pt": "Cetro",
    "fr": "Sceptre",
    "ar": "الصولجان"
   },
   "def": {
    "ru": "Золотой жезл царя — знак царской власти.",
    "en": "The king's golden scepter — a sign of royal power.",
    "de": "Das goldene Zepter des Königs — ein Zeichen der königlichen Macht.",
    "es": "El cetro dorado del rey — un signo de su poder real.",
    "pt": "O cinto dourado do rei — um sinal do seu poder real.",
    "fr": "Le sceptre en or du roi — symbole du pouvoir royal.",
    "ar": "الصولجان الذهبي للملك — علامة السلطة الملكية."
   },
   "refs": [
    "plots_19"
   ]
  },
  {
   "emoji": "🌳",
   "word": {
    "ru": "Колено рода",
    "en": "Tribe",
    "de": "Stamm",
    "es": "Tribu",
    "pt": "Tribo",
    "fr": "Tribu",
    "ar": "سِبط"
   },
   "def": {
    "ru": "Большая семья-род; двенадцать колен произошли от сыновей Иакова.",
    "en": "A large family clan; the twelve tribes came from the sons of Jacob.",
    "de": "Eine große Sippe; zwölf Stämme gingen aus den Söhnen Jakobs hervor.",
    "es": "Una gran familia; las doce tribus vinieron de los hijos de Jacob.",
    "pt": "Uma grande família — as doze tribos vieram dos filhos de Jacó.",
    "fr": "Une grande famille ; les douze tribus sont nées des fils de Jacob.",
    "ar": "عائلة كبيرة تُدعى قبيلة؛ الاثنا عشر سبطًا جاءوا من أبناء يعقوب."
   },
   "refs": [
    "heroes_04"
   ]
  },
  {
   "emoji": "🌲",
   "word": {
    "ru": "Гофер",
    "en": "Gopher wood",
    "de": "Gopherholz",
    "es": "Gofer",
    "pt": "Madeira de gofer",
    "fr": "Bois de gopher",
    "ar": "خشب الجُفر"
   },
   "def": {
    "ru": "Дерево, из которого Ной построил ковчег.",
    "en": "The wood Noah used to build the ark.",
    "de": "Das Holz, aus dem Noah die Arche baute.",
    "es": "La madera con la que Noé construyó el arca.",
    "pt": "A madeira com que Noé construiu a arca.",
    "fr": "Le bois avec lequel Noé a construit son arche.",
    "ar": "شجر بنى منه نوح الفلك."
   },
   "refs": [
    "heroes_01",
    "plots_03"
   ]
  },
  {
   "emoji": "🎋",
   "word": {
    "ru": "Тростник",
    "en": "Reeds",
    "de": "Schilf",
    "es": "Junco",
    "pt": "Junco",
    "fr": "Roseaux",
    "ar": "البردي"
   },
   "def": {
    "ru": "Высокая речная трава; из неё сплели корзинку Моисея.",
    "en": "Tall river grass; baby Moses' basket was woven from it.",
    "de": "Hohes Gras am Flussufer; daraus wurde das Körbchen für Mose geflochten.",
    "es": "Una hierba alta del río; con ella se tejió la cestita de Moisés.",
    "pt": "Uma planta alta que cresce no rio; com ela fizeram a cestinha de Moisés.",
    "fr": "De hautes herbes de rivière ; on en a tressé le panier de Moïse.",
    "ar": "نبات نهري طويل؛ منه صُنعت سلة موسى."
   },
   "refs": [
    "plots_08"
   ]
  },
  {
   "emoji": "🌾",
   "word": {
    "ru": "Колосья",
    "en": "Grain",
    "de": "Ähren",
    "es": "Espigas",
    "pt": "Espigas",
    "fr": "Épis",
    "ar": "السنابل"
   },
   "def": {
    "ru": "Стебли зрелых злаков; Руфь собирала их на поле.",
    "en": "Stalks of ripe grain; Ruth gathered them in the field.",
    "de": "Die Halme reifen Getreides; Rut sammelte sie auf dem Feld.",
    "es": "Tallos de grano maduro; Rut las recogía en el campo.",
    "pt": "Talos de trigo maduro; Rute os recolhia no campo.",
    "fr": "Les tiges des céréales mûres ; Ruth les ramassait dans les champs.",
    "ar": "سيقان الحبوب الناضجة؛ كانت راعوث تجمعها في الحقل."
   },
   "refs": [
    "heroes_10"
   ]
  },
  {
   "emoji": "📖",
   "word": {
    "ru": "Евангелие",
    "en": "Gospel",
    "de": "Evangelium",
    "es": "Evangelio",
    "pt": "Evangelho",
    "fr": "Évangile",
    "ar": "الإنجيل"
   },
   "def": {
    "ru": "«Добрая весть» — книга об историях Иисуса, записанная его друзьями.",
    "en": "\"Good news\" — a book about the stories of Jesus, written down by his friends.",
    "de": "Die „gute Nachricht“ – ein Buch mit Geschichten über Jesus, aufgeschrieben von seinen Freunden.",
    "es": "«Buenas noticias» — un libro con las historias de Jesús, escrito por sus amigos.",
    "pt": "A “boa notícia” — um livro sobre as histórias de Jesus, escrito por seus amigos.",
    "fr": "La « Bonne Nouvelle » — un livre sur les histoires de Jésus, écrit par ses amis.",
    "ar": "أي «البشارة السارة» — كتاب يحكي قصص يسوع، كتبه أصدقاؤه."
   },
   "refs": [
    "plots_20"
   ]
  },
  {
   "emoji": "🌱",
   "word": {
    "ru": "Притча",
    "en": "Parable",
    "de": "Gleichnis",
    "es": "Parábola",
    "pt": "Parábola",
    "fr": "Parabole",
    "ar": "المَثَل"
   },
   "def": {
    "ru": "Короткая мудрая история, в которой спрятан важный урок.",
    "en": "A short, wise story with an important lesson hidden inside.",
    "de": "Eine kurze, kluge Geschichte, in der eine wichtige Lehre versteckt ist.",
    "es": "Una historia corta y sabia que esconde una lección importante.",
    "pt": "Uma história curta e sábia, com uma lição importante escondida dentro dela.",
    "fr": "Une petite histoire pleine de sagesse, qui cache une leçon importante.",
    "ar": "قصة قصيرة وحكيمة تخفي في داخلها درسًا مهمًا."
   },
   "refs": []
  },
  {
   "emoji": "🚶",
   "word": {
    "ru": "Ученик",
    "en": "Disciple",
    "de": "Jünger",
    "es": "Discípulo",
    "pt": "Discípulo",
    "fr": "Disciple",
    "ar": "التلميذ"
   },
   "def": {
    "ru": "Тот, кто ходит за учителем и учится у него; у Иисуса их было двенадцать.",
    "en": "Someone who follows a teacher and learns from him; Jesus had twelve of them.",
    "de": "Jemand, der seinem Lehrer folgt und von ihm lernt; Jesus hatte zwölf davon.",
    "es": "El que sigue a un maestro y aprende de él; Jesús tenía doce.",
    "pt": "Alguém que segue um mestre e aprende com ele; Jesus tinha doze deles.",
    "fr": "Celui qui suit un maître et apprend de lui ; Jésus en avait douze.",
    "ar": "من يرافق معلّمه ويتعلّم منه؛ كان عند يسوع اثنا عشر تلميذًا."
   },
   "refs": []
  }
 ],
 "ntPages": [
  {
   "id": "nt_22",
   "slug": "nazareth",
   "name": {
    "ru": "Мальчик из Назарета",
    "en": "The Boy from Nazareth",
    "de": "Der Junge aus Nazareth",
    "es": "El niño de Nazaret",
    "pt": "O menino de Nazaré",
    "fr": "Le garçon de Nazareth",
    "ar": "الصبي من الناصرة"
   },
   "story": {
    "ru": "Младенец, родившийся в Вифлееме, вырос в городке Назарете. Его звали Иисус. Он помогал Иосифу в мастерской: учился строгать доски и собирать табуреты, а ещё слушал истории — те самые, что собраны в этой книге. Мальчик рос добрым и внимательным, и соседи его любили.",
    "en": "The baby born in Bethlehem grew up in the little town of Nazareth. His name was Jesus. He helped Joseph in the workshop, learning to plane boards and build stools, and he listened to stories too — the very ones gathered in this book. The boy grew up kind and thoughtful, and his neighbors loved him.",
    "de": "Das Kind, das in Bethlehem geboren wurde, wuchs in der kleinen Stadt Nazareth auf. Es hieß Jesus. Er half Josef in der Werkstatt: Er lernte, Brettchen zu glätten und Schemel zu bauen, und hörte dabei Geschichten – genau die, die in diesem Buch gesammelt sind. Der Junge wuchs freundlich und aufmerksam heran, und die Nachbarn hatten ihn alle lieb.",
    "es": "El bebé que nació en Belén creció en un pueblito llamado Nazaret. Se llamaba Jesús. Ayudaba a José en el taller: aprendía a cepillar tablas y armar taburetes, y también escuchaba historias, las mismas que están reunidas en este libro. El niño crecía bondadoso y atento, y sus vecinos lo querían mucho.",
    "pt": "O bebê que nasceu em Belém cresceu numa cidadezinha chamada Nazaré. Seu nome era Jesus. Ele ajudava José na oficina: aprendia a lixar tábuas e montar banquinhos, e também escutava histórias — as mesmas que estão reunidas neste livro. O menino crescia bondoso e atento, e os vizinhos o amavam.",
    "fr": "Le bébé né à Bethléem grandit dans la petite ville de Nazareth. Il s'appelait Jésus. Il aidait Joseph à l'atelier : il apprenait à raboter des planches et à assembler des tabourets, et il écoutait aussi des histoires — celles-là mêmes que l'on trouve dans ce livre. Le garçon grandissait gentil et attentif, et ses voisins l'aimaient beaucoup.",
    "ar": "الطفل الذي وُلد في بيت لحم كبر في بلدة صغيرة اسمها الناصرة. كان اسمه يسوع. كان يساعد يوسف في ورشته: يتعلّم كيف ينحت الألواح ويصنع المقاعد الصغيرة، ويستمع إلى القصص — نفس القصص المجموعة في هذا الكتاب. كبر الصبي طيبًا ومنتبهًا، وأحبّه جيرانه كثيرًا."
   }
  },
  {
   "id": "nt_23",
   "slug": "teacher",
   "name": {
    "ru": "Учитель добрых историй",
    "en": "The Teacher of Good Stories",
    "de": "Der Lehrer der guten Geschichten",
    "es": "El maestro de las buenas historias",
    "pt": "O mestre das boas histórias",
    "fr": "Le maître des belles histoires",
    "ar": "معلّم القصص الطيبة"
   },
   "story": {
    "ru": "Когда Иисус вырос, он стал учителем. Он ходил из города в город и рассказывал людям короткие мудрые истории — притчи. Самое главное правило он объяснял просто: поступай с другими так, как хочешь, чтобы поступали с тобой. Послушать его собирались целые холмы людей.",
    "en": "When Jesus grew up, he became a teacher. He traveled from town to town, telling people short, wise stories called parables. He explained the most important rule simply: treat others the way you want to be treated. Whole hillsides of people would gather just to listen to him.",
    "de": "Als Jesus erwachsen war, wurde er Lehrer. Er zog von Stadt zu Stadt und erzählte den Menschen kurze, kluge Geschichten – Gleichnisse. Die wichtigste Regel erklärte er ganz einfach: Behandle andere so, wie du selbst behandelt werden möchtest. Ganze Hügel voller Menschen kamen, um ihm zuzuhören.",
    "es": "Cuando Jesús creció, se convirtió en maestro. Iba de pueblo en pueblo contando historias cortas y sabias llamadas parábolas. Explicaba la regla más importante de forma sencilla: trata a los demás como quieres que te traten a ti. Colinas enteras de gente se reunían para escucharlo.",
    "pt": "Quando Jesus cresceu, tornou-se um mestre. Ele ia de cidade em cidade contando histórias curtas e sábias — as parábolas. A regra mais importante ele explicava de forma simples: trate os outros como você gostaria de ser tratado. Colinas inteiras de gente se reuniam para ouvi-lo.",
    "fr": "Quand Jésus grandit, il devint maître. Il allait de ville en ville et racontait aux gens de courtes histoires pleines de sagesse : les paraboles. Il expliquait la règle la plus importante tout simplement : « Fais aux autres ce que tu voudrais qu'on te fasse. » Des collines entières de gens venaient l'écouter.",
    "ar": "حين كبر يسوع، صار معلّمًا. كان يتنقل من مدينة إلى مدينة ويحكي للناس قصصًا قصيرة وحكيمة تسمى الأمثال. وكان يشرح أهمّ قاعدة ببساطة: عامل الآخرين كما تحب أن يعاملوك. وكان يتجمّع لسماعه حشد كبير من الناس، حتى على التلال."
   }
  },
  {
   "id": "nt_24",
   "slug": "loaves",
   "name": {
    "ru": "Двенадцать друзей и пять хлебов",
    "en": "Twelve Friends and Five Loaves",
    "de": "Zwölf Freunde und fünf Brote",
    "es": "Doce amigos y cinco panes",
    "pt": "Doze amigos e cinco pães",
    "fr": "Douze amis et cinq pains",
    "ar": "الأصدقاء الاثنا عشر وخمسة أرغفة"
   },
   "story": {
    "ru": "У Иисуса было двенадцать верных друзей-учеников. Однажды его слушали пять тысяч человек, и все проголодались, а еды нашлось только пять хлебов и две рыбки. Иисус разделил их — и хватило всем, да ещё осталось двенадцать полных корзин! Эту удивительную историю рассказывают до сих пор.",
    "en": "Jesus had twelve loyal friends called disciples. One day, five thousand people came to listen to him, and everyone grew hungry — but there were only five loaves of bread and two little fish. Jesus shared them out, and there was enough for everyone, with twelve baskets full left over! People still tell this amazing story today.",
    "de": "Jesus hatte zwölf treue Freunde, seine Jünger. Einmal hörten ihm fünftausend Menschen zu, und alle waren hungrig, doch es gab nur fünf Brote und zwei Fische. Jesus teilte sie aus – und es reichte für alle, ja, es blieben sogar zwölf volle Körbe übrig! Diese wunderbare Geschichte erzählt man bis heute.",
    "es": "Jesús tenía doce amigos fieles, sus discípulos. Un día lo escuchaban cinco mil personas, y todos tenían hambre, pero solo había cinco panes y dos pescaditos. Jesús los repartió, ¡y alcanzó para todos, y hasta sobraron doce canastas llenas! Esta historia asombrosa se sigue contando hoy.",
    "pt": "Jesus tinha doze amigos fiéis, seus discípulos. Certa vez, cinco mil pessoas foram ouvi-lo e todas ficaram com fome, mas só havia cinco pães e dois peixinhos. Jesus os repartiu — e deu para todos, e ainda sobraram doze cestos cheios! Essa história maravilhosa é contada até hoje.",
    "fr": "Jésus avait douze fidèles amis, ses disciples. Un jour, cinq mille personnes étaient venues l'écouter, et tout le monde avait faim, mais il n'y avait que cinq pains et deux poissons. Jésus les partagea — et il y en eut assez pour tous, et même douze paniers pleins de restes ! Cette histoire extraordinaire, on la raconte encore aujourd'hui.",
    "ar": "كان ليسوع اثنا عشر صديقًا مخلصًا هم تلاميذه. في أحد الأيام، استمع إليه خمسة آلاف شخص، وجاعوا جميعًا، ولم يكن هناك سوى خمسة أرغفة وسمكتين. فقسّمها يسوع — وكفت الجميع، بل وتبقّى منها اثنتا عشرة سلة ممتلئة! ولا تزال هذه القصة العجيبة تُروى حتى اليوم."
   }
  },
  {
   "id": "nt_25",
   "slug": "bible",
   "name": {
    "ru": "Самая читаемая книга на свете",
    "en": "The Most-Read Book in the World",
    "de": "Das meistgelesene Buch der Welt",
    "es": "El libro más leído del mundo",
    "pt": "O livro mais lido do mundo",
    "fr": "Le livre le plus lu au monde",
    "ar": "الكتاب الأكثر قراءة في العالم"
   },
   "story": {
    "ru": "Истории Иисуса записали его друзья — так появились Евангелия, что значит «добрая весть». Вместе с историями Ноя, Моисея, Давида и других героев они составили Библию — самую читаемую книгу на свете. Её перевели больше чем на три тысячи языков. Теперь и ты знаешь её великие истории!",
    "en": "Jesus's friends wrote down his stories, and that is how the Gospels came to be — the word means \"good news.\" Together with the stories of Noah, Moses, David, and other heroes, they make up the Bible — the most-read book in the world. It has been translated into more than three thousand languages. And now you know its great stories too!",
    "de": "Die Geschichten von Jesus schrieben seine Freunde auf – so entstanden die Evangelien, was „gute Nachricht“ bedeutet. Zusammen mit den Geschichten von Noah, Mose, David und anderen Helden bilden sie die Bibel – das meistgelesene Buch der Welt. Sie wurde in mehr als dreitausend Sprachen übersetzt. Jetzt kennst auch du ihre großen Geschichten!",
    "es": "Los amigos de Jesús escribieron sus historias, y así nacieron los Evangelios, que significa «buenas noticias». Junto con las historias de Noé, Moisés, David y otros héroes, formaron la Biblia, el libro más leído del mundo. Se ha traducido a más de tres mil idiomas. ¡Ahora tú también conoces sus grandes historias!",
    "pt": "As histórias de Jesus foram escritas por seus amigos — assim nasceram os Evangelhos, que significa “boa notícia”. Junto com as histórias de Noé, Moisés, Davi e outros heróis, elas formam a Bíblia — o livro mais lido do mundo. Ela já foi traduzida para mais de três mil línguas. Agora você também conhece suas grandes histórias!",
    "fr": "Les amis de Jésus ont écrit ses histoires — ainsi sont nés les Évangiles, ce qui veut dire « bonne nouvelle ». Avec les histoires de Noé, de Moïse, de David et d'autres héros, ils ont formé la Bible — le livre le plus lu au monde. Elle a été traduite en plus de trois mille langues. Maintenant, toi aussi tu connais ses grandes histoires !",
    "ar": "دوّن أصدقاء يسوع قصصه — فظهرت الأناجيل، ومعناها «البشارة السارة». ومعها قصص نوح وموسى وداود وأبطال آخرين، تكوّن الكتاب المقدس — أكثر كتاب قراءةً في العالم. تُرجم إلى أكثر من ثلاثة آلاف لغة. والآن أنت أيضًا تعرف قصصه العظيمة!"
   }
  }
 ],
 "maps": {
  "exodus": {
   "bg": "img/maps/exodus.webp",
   "title": {
    "ru": "Путь Исхода",
    "en": "The Path of the Exodus",
    "de": "Der Weg des Exodus",
    "es": "El camino del Éxodo",
    "pt": "O Caminho do Êxodo",
    "fr": "Le chemin de l'Exode",
    "ar": "طريق الخروج"
   },
   "sub": {
    "ru": "Нажми на точку — открой событие пути",
    "en": "Tap a dot to open an event on the journey",
    "de": "Tippe auf einen Punkt – entdecke ein Ereignis auf dem Weg",
    "es": "Toca un punto y descubre lo que pasó en el camino",
    "pt": "Toque num ponto — descubra o que aconteceu ali",
    "fr": "Touche un point pour découvrir une étape du chemin",
    "ar": "اضغط على النقطة — واكتشف حدث الطريق"
   },
   "points": [
    {
     "id": "exodus_01",
     "x": 27,
     "y": 24,
     "card": "plots_08",
     "name": {
      "ru": "Земля Гесем",
      "en": "The Land of Goshen",
      "de": "Land Goschen",
      "es": "La tierra de Gosén",
      "pt": "Terra de Gósen",
      "fr": "Le pays de Gessen",
      "ar": "أرض جاسان"
     },
     "blurb": {
      "ru": "Здесь, в Египте, народ жил и трудился долгие годы.",
      "en": "Here in Egypt, the people lived and worked for many long years.",
      "de": "Hier, in Ägypten, lebte und arbeitete das Volk viele lange Jahre.",
      "es": "Aquí, en Egipto, el pueblo vivió y trabajó durante muchos años.",
      "pt": "Aqui, no Egito, o povo viveu e trabalhou por muitos e muitos anos.",
      "fr": "Ici, en Égypte, le peuple a vécu et travaillé de longues années.",
      "ar": "هنا، في مصر، عاش الشعب وعمل سنوات طويلة."
     }
    },
    {
     "id": "exodus_02",
     "x": 11,
     "y": 39,
     "card": "heroes_06",
     "name": {
      "ru": "Дворец фараона",
      "en": "Pharaoh's Palace",
      "de": "Der Palast des Pharaos",
      "es": "El palacio del faraón",
      "pt": "Palácio do faraó",
      "fr": "Le palais du pharaon",
      "ar": "قصر فرعون"
     },
     "blurb": {
      "ru": "«Отпусти мой народ!» — сказал Моисей фараону.",
      "en": "“Let my people go!” Moses said to Pharaoh.",
      "de": "„Lass mein Volk ziehen!“, sagte Mose zum Pharao.",
      "es": "«¡Deja ir a mi pueblo!» —le dijo Moisés al faraón.",
      "pt": "“Deixe meu povo partir!” — disse Moisés ao faraó.",
      "fr": "« Laisse partir mon peuple ! » dit Moïse au pharaon.",
      "ar": "«أطلق شعبي!» قال موسى لفرعون."
     }
    },
    {
     "id": "exodus_03",
     "x": 38,
     "y": 56,
     "card": "plots_10",
     "name": {
      "ru": "Красное море",
      "en": "The Red Sea",
      "de": "Das Rote Meer",
      "es": "El mar Rojo",
      "pt": "Mar Vermelho",
      "fr": "La mer Rouge",
      "ar": "البحر الأحمر"
     },
     "blurb": {
      "ru": "Воды расступились — и народ прошёл по дну, как по дороге.",
      "en": "The waters parted, and the people crossed the seabed as if on a road.",
      "de": "Das Wasser teilte sich – und das Volk ging trockenen Fußes hindurch, wie auf einer Straße.",
      "es": "Las aguas se abrieron, y el pueblo cruzó por el fondo como por un camino.",
      "pt": "As águas se abriram, e o povo atravessou por terra seca, como por um caminho.",
      "fr": "Les eaux se sont ouvertes, et le peuple a traversé à pied sec, comme sur une route.",
      "ar": "انشقّت المياه — وعبر الشعب من فوق القاع، وكأنه طريق يابسة."
     }
    },
    {
     "id": "exodus_04",
     "x": 51,
     "y": 66,
     "card": "plots_11",
     "name": {
      "ru": "Пустыня Син",
      "en": "The Wilderness of Sin",
      "de": "Die Wüste Sin",
      "es": "El desierto de Sin",
      "pt": "Deserto de Sim",
      "fr": "Le désert de Sin",
      "ar": "برية سين"
     },
     "blurb": {
      "ru": "Каждое утро земля покрывалась манной — хлебом пустыни.",
      "en": "Every morning the ground was covered with manna — bread from the desert.",
      "de": "Jeden Morgen bedeckte Manna den Boden – das Brot der Wüste.",
      "es": "Cada mañana la tierra se cubría de maná, el pan del desierto.",
      "pt": "Toda manhã o chão se cobria de maná — o pão do deserto.",
      "fr": "Chaque matin, le sol se couvrait de manne — le pain du désert.",
      "ar": "كل صباح كانت الأرض تُغطّى بالمنّ — خبز البرية."
     }
    },
    {
     "id": "exodus_05",
     "x": 55,
     "y": 76,
     "card": null,
     "name": {
      "ru": "Рефидим",
      "en": "Rephidim",
      "de": "Refidim",
      "es": "Refidim",
      "pt": "Refidim",
      "fr": "Rephidim",
      "ar": "رفيديم"
     },
     "blurb": {
      "ru": "Здесь из скалы забил родник — вода в самой сухой пустыне.",
      "en": "Here a spring burst from the rock — water in the driest desert.",
      "de": "Hier sprudelte Wasser aus einem Felsen hervor – mitten in der trockensten Wüste.",
      "es": "Aquí brotó agua de una roca, un manantial en el desierto más seco.",
      "pt": "Ali, da rocha jorrou uma fonte — água no deserto mais seco.",
      "fr": "Ici, une source a jailli du rocher — de l'eau dans le désert le plus sec.",
      "ar": "هنا تفجّر ينبوع من الصخرة — ماء في أشد البراري جفافًا."
     }
    },
    {
     "id": "exodus_06",
     "x": 65,
     "y": 80,
     "card": "plots_12",
     "name": {
      "ru": "Гора Синай",
      "en": "Mount Sinai",
      "de": "Der Berg Sinai",
      "es": "El monte Sinaí",
      "pt": "Monte Sinai",
      "fr": "Le mont Sinaï",
      "ar": "جبل سيناء"
     },
     "blurb": {
      "ru": "На вершине горы Моисей получил десять главных правил.",
      "en": "At the mountain's peak, Moses received the ten great rules.",
      "de": "Auf dem Gipfel des Berges erhielt Mose die zehn wichtigsten Regeln.",
      "es": "En la cima del monte, Moisés recibió diez reglas muy importantes.",
      "pt": "No alto do monte, Moisés recebeu os dez mandamentos principais.",
      "fr": "Au sommet de la montagne, Moïse a reçu les dix règles essentielles.",
      "ar": "على قمة الجبل تلقّى موسى الوصايا العشر الكبرى."
     }
    },
    {
     "id": "exodus_07",
     "x": 63,
     "y": 36,
     "card": null,
     "name": {
      "ru": "Пустыня Фаран",
      "en": "The Desert of Paran",
      "de": "Die Wüste Paran",
      "es": "El desierto de Parán",
      "pt": "Deserto de Parã",
      "fr": "Le désert de Parân",
      "ar": "برية فاران"
     },
     "blurb": {
      "ru": "Сорок лет народ шёл через пустыню и учился быть свободным.",
      "en": "For forty years the people walked through the desert, learning to be free.",
      "de": "Vierzig Jahre lang zog das Volk durch die Wüste und lernte, frei zu sein.",
      "es": "Durante cuarenta años el pueblo caminó por el desierto y aprendió a ser libre.",
      "pt": "Por quarenta anos o povo caminhou pelo deserto, aprendendo a ser livre.",
      "fr": "Pendant quarante ans, le peuple a marché dans le désert et appris à être libre.",
      "ar": "أربعون سنة سار الشعب في البرية وتعلّم كيف يكون حرًّا."
     }
    },
    {
     "id": "exodus_08",
     "x": 83,
     "y": 36,
     "card": null,
     "name": {
      "ru": "Река Иордан",
      "en": "The Jordan River",
      "de": "Der Fluss Jordan",
      "es": "El río Jordán",
      "pt": "Rio Jordão",
      "fr": "Le fleuve Jourdain",
      "ar": "نهر الأردن"
     },
     "blurb": {
      "ru": "За рекой ждала долгожданная новая земля.",
      "en": "Beyond the river waited the long-awaited new land.",
      "de": "Jenseits des Flusses wartete das lang ersehnte neue Land.",
      "es": "Al otro lado del río esperaba la nueva tierra tan deseada.",
      "pt": "Do outro lado do rio esperava a nova terra, tão sonhada.",
      "fr": "De l'autre côté du fleuve attendait la nouvelle terre tant espérée.",
      "ar": "وراء النهر كانت تنتظر الأرض الجديدة المُنتظَرة."
     }
    },
    {
     "id": "exodus_09",
     "x": 86,
     "y": 27,
     "card": "plots_13",
     "name": {
      "ru": "Иерихон",
      "en": "Jericho",
      "de": "Jericho",
      "es": "Jericó",
      "pt": "Jericó",
      "fr": "Jéricho",
      "ar": "أريحا"
     },
     "blurb": {
      "ru": "Семь обходов, звук шофаров — и стены рухнули сами.",
      "en": "Seven times around, a blast of horns — and the walls fell on their own.",
      "de": "Siebenmal zogen sie herum, die Widderhörner erklangen – und die Mauern stürzten von selbst ein.",
      "es": "Siete vueltas, el sonido de los shofares, y las murallas se derrumbaron solas.",
      "pt": "Sete voltas, o som dos shofars — e as muralhas caíram sozinhas.",
      "fr": "Sept tours, le son des chofars — et les murs se sont écroulés d'eux-mêmes.",
      "ar": "سبع جولات، وصوت الأبواق — فسقطت الأسوار من تلقاء نفسها."
     }
    }
   ]
  },
  "world": {
   "bg": "img/maps/world.webp",
   "title": {
    "ru": "Библейский мир",
    "en": "The Bible World",
    "de": "Die Welt der Bibel",
    "es": "El mundo bíblico",
    "pt": "O Mundo da Bíblia",
    "fr": "Le monde de la Bible",
    "ar": "العالم الكتابي"
   },
   "sub": {
    "ru": "Нажми на точку — узнай место и его историю",
    "en": "Tap a dot to learn the place and its story",
    "de": "Tippe auf einen Punkt – entdecke den Ort und seine Geschichte",
    "es": "Toca un punto y descubre el lugar y su historia",
    "pt": "Toque num ponto para descobrir o lugar e sua história",
    "fr": "Touche un point pour découvrir un lieu et son histoire",
    "ar": "اضغط على نقطة لتتعرّف على المكان وقصته"
   },
   "points": [
    {
     "id": "w_eden",
     "x": 74,
     "y": 47,
     "card": "plots_02",
     "name": {
      "ru": "Эдем",
      "en": "Eden",
      "de": "Eden",
      "es": "Edén",
      "pt": "Éden",
      "fr": "Éden",
      "ar": "عدن"
     },
     "blurb": {
      "ru": "Прекрасный сад между великими реками — первый дом людей.",
      "en": "A beautiful garden between great rivers — the first home of people.",
      "de": "Ein wunderschöner Garten zwischen zwei großen Flüssen – das erste Zuhause der Menschen.",
      "es": "Un jardín hermoso entre grandes ríos: el primer hogar de las personas.",
      "pt": "Um jardim lindo entre dois grandes rios — a primeira casa das pessoas.",
      "fr": "Un magnifique jardin entre deux grands fleuves — la toute première maison des hommes.",
      "ar": "بستان جميل بين نهرين عظيمين، كان أول بيت للناس."
     }
    },
    {
     "id": "w_ararat",
     "x": 80,
     "y": 8,
     "card": "plots_04",
     "name": {
      "ru": "Гора Арарат",
      "en": "Mount Ararat",
      "de": "Berg Ararat",
      "es": "Monte Ararat",
      "pt": "Monte Ararate",
      "fr": "Le mont Ararat",
      "ar": "جبل أرارات"
     },
     "blurb": {
      "ru": "К этим вершинам причалил ковчег после потопа.",
      "en": "The ark landed on these peaks after the flood.",
      "de": "An diesen Gipfeln kam die Arche nach der Flut zur Ruhe.",
      "es": "En estas cumbres se posó el arca después del diluvio.",
      "pt": "Foi nesses picos que a arca parou depois do dilúvio.",
      "fr": "C'est sur ces sommets que l'arche s'est posée après le déluge.",
      "ar": "على هذه القمم استقر الفلك بعد الطوفان."
     }
    },
    {
     "id": "w_babylon",
     "x": 79,
     "y": 31,
     "card": "plots_05",
     "name": {
      "ru": "Вавилон",
      "en": "Babylon",
      "de": "Babylon",
      "es": "Babilonia",
      "pt": "Babilônia",
      "fr": "Babylone",
      "ar": "بابل"
     },
     "blurb": {
      "ru": "Здесь строили башню до неба — пока не заговорили на разных языках.",
      "en": "Here people built a tower to reach the sky — until they began speaking different languages.",
      "de": "Hier baute man einen Turm bis zum Himmel – bis die Menschen plötzlich verschiedene Sprachen sprachen.",
      "es": "Aquí quisieron construir una torre hasta el cielo, hasta que empezaron a hablar idiomas distintos.",
      "pt": "Aqui construíram uma torre até o céu — até todos passarem a falar línguas diferentes.",
      "fr": "Ici, on a construit une tour pour toucher le ciel — jusqu'à ce que chacun se mette à parler une langue différente.",
      "ar": "هنا حاول الناس بناء برج يصل إلى السماء، حتى صاروا يتكلمون لغات مختلفة."
     }
    },
    {
     "id": "w_harran",
     "x": 61,
     "y": 15,
     "card": "heroes_02",
     "name": {
      "ru": "Харран",
      "en": "Haran",
      "de": "Haran",
      "es": "Harán",
      "pt": "Harã",
      "fr": "Harân",
      "ar": "حرّان"
     },
     "blurb": {
      "ru": "Отсюда Авраам отправился в далёкую неизвестную страну.",
      "en": "From here Abraham set off for a faraway, unknown land.",
      "de": "Von hier zog Abraham los in ein fernes, unbekanntes Land.",
      "es": "Desde aquí partió Abraham hacia una tierra lejana y desconocida.",
      "pt": "Foi daqui que Abraão partiu rumo a uma terra distante e desconhecida.",
      "fr": "C'est de là qu'Abraham est parti vers un pays lointain et inconnu.",
      "ar": "من هنا انطلق إبراهيم إلى أرض بعيدة لم يعرفها من قبل."
     }
    },
    {
     "id": "w_jerusalem",
     "x": 40,
     "y": 43,
     "card": "plots_16",
     "name": {
      "ru": "Иерусалим",
      "en": "Jerusalem",
      "de": "Jerusalem",
      "es": "Jerusalén",
      "pt": "Jerusalém",
      "fr": "Jérusalem",
      "ar": "أورشليم"
     },
     "blurb": {
      "ru": "Город Давида и Храма Соломона — сердце страны.",
      "en": "The city of David and Solomon's Temple — the heart of the land.",
      "de": "Die Stadt Davids und des Tempels Salomos – das Herz des Landes.",
      "es": "La ciudad de David y del Templo de Salomón, el corazón del país.",
      "pt": "A cidade de Davi e do Templo de Salomão — o coração da terra.",
      "fr": "La ville de David et du Temple de Salomon — le cœur du pays.",
      "ar": "مدينة داود وهيكل سليمان، قلب البلاد."
     }
    },
    {
     "id": "w_bethlehem",
     "x": 38,
     "y": 49,
     "card": "plots_20",
     "name": {
      "ru": "Вифлеем",
      "en": "Bethlehem",
      "de": "Bethlehem",
      "es": "Belén",
      "pt": "Belém",
      "fr": "Bethléem",
      "ar": "بيت لحم"
     },
     "blurb": {
      "ru": "Маленький городок, где родился Иисус.",
      "en": "A small town where Jesus was born.",
      "de": "Ein kleines Städtchen, in dem Jesus geboren wurde.",
      "es": "Un pueblito donde nació Jesús.",
      "pt": "Uma cidadezinha onde Jesus nasceu.",
      "fr": "Une petite ville où Jésus est né.",
      "ar": "بلدة صغيرة وُلد فيها يسوع."
     }
    },
    {
     "id": "w_nazareth",
     "x": 45,
     "y": 29,
     "card": "heroes_19",
     "name": {
      "ru": "Назарет",
      "en": "Nazareth",
      "de": "Nazareth",
      "es": "Nazaret",
      "pt": "Nazaré",
      "fr": "Nazareth",
      "ar": "الناصرة"
     },
     "blurb": {
      "ru": "Городок плотника Иосифа, где вырос Иисус.",
      "en": "The little town of Joseph the carpenter, where Jesus grew up.",
      "de": "Das Städtchen des Zimmermanns Josef, wo Jesus aufwuchs.",
      "es": "El pueblo del carpintero José, donde Jesús creció.",
      "pt": "A cidade do carpinteiro José, onde Jesus cresceu.",
      "fr": "La petite ville du charpentier Joseph, où Jésus a grandi.",
      "ar": "بلدة النجار يوسف، حيث كبر يسوع."
     }
    },
    {
     "id": "w_egypt",
     "x": 18,
     "y": 67,
     "card": "plots_08",
     "name": {
      "ru": "Египет и Нил",
      "en": "Egypt and the Nile",
      "de": "Ägypten und der Nil",
      "es": "Egipto y el Nilo",
      "pt": "Egito e o rio Nilo",
      "fr": "L'Égypte et le Nil",
      "ar": "مصر والنيل"
     },
     "blurb": {
      "ru": "Великая река, корзинка Моисея и дворцы фараонов.",
      "en": "A great river, baby Moses's basket, and the palaces of the pharaohs.",
      "de": "Ein großer Fluss, das Körbchen des kleinen Mose und die Paläste der Pharaonen.",
      "es": "El gran río, la cestita de Moisés y los palacios de los faraones.",
      "pt": "Um grande rio, a cestinha de Moisés e os palácios dos faraós.",
      "fr": "Un grand fleuve, le petit panier de Moïse et les palais des pharaons.",
      "ar": "النهر العظيم، وسلّة موسى، وقصور الفراعنة."
     }
    },
    {
     "id": "w_sinai",
     "x": 52,
     "y": 63,
     "card": "plots_12",
     "name": {
      "ru": "Гора Синай",
      "en": "Mount Sinai",
      "de": "Berg Sinai",
      "es": "Monte Sinaí",
      "pt": "Monte Sinai",
      "fr": "Le mont Sinaï",
      "ar": "جبل سيناء"
     },
     "blurb": {
      "ru": "Гора десяти правил, высеченных на скрижалях.",
      "en": "The mountain of the ten rules carved on stone tablets.",
      "de": "Der Berg der zehn Gebote, eingemeißelt in steinerne Tafeln.",
      "es": "La montaña de los diez mandamientos, grabados en tablas de piedra.",
      "pt": "A montanha das dez regras, gravadas em tábuas de pedra.",
      "fr": "La montagne des dix règles gravées sur des tables de pierre.",
      "ar": "جبل الوصايا العشر المكتوبة على لوحين من حجر."
     }
    },
    {
     "id": "w_nineveh",
     "x": 71,
     "y": 20,
     "card": "plots_18",
     "name": {
      "ru": "Ниневия",
      "en": "Nineveh",
      "de": "Ninive",
      "es": "Nínive",
      "pt": "Nínive",
      "fr": "Ninive",
      "ar": "نينوى"
     },
     "blurb": {
      "ru": "Огромный город, куда так не хотел идти Иона.",
      "en": "A huge city that Jonah really didn't want to visit.",
      "de": "Eine riesige Stadt, zu der Jona einfach nicht gehen wollte.",
      "es": "Una ciudad enorme, a la que Jonás no quería ir de ninguna manera.",
      "pt": "Uma cidade enorme, para onde Jonas não queria ir de jeito nenhum.",
      "fr": "Une ville immense, où Jonas ne voulait surtout pas aller.",
      "ar": "مدينة كبيرة جدًا لم يرغب يونان أبدًا في الذهاب إليها."
     }
    },
    {
     "id": "w_tarshish",
     "x": 12,
     "y": 35,
     "card": "heroes_17",
     "name": {
      "ru": "Фарсис",
      "en": "Tarshish",
      "de": "Tarsis",
      "es": "Tarsis",
      "pt": "Társis",
      "fr": "Tarsis",
      "ar": "ترشيش"
     },
     "blurb": {
      "ru": "Туда пытался уплыть Иона — в самую противоположную сторону!",
      "en": "Where Jonah tried to sail — in the exact opposite direction!",
      "de": "Dorthin wollte Jona fliehen — genau in die entgegengesetzte Richtung!",
      "es": "Allí trató de escapar Jonás en barco... ¡hacia el lado totalmente contrario!",
      "pt": "Foi para lá que Jonas tentou fugir de navio — para o lado bem contrário!",
      "fr": "Jonas a essayé de s'y enfuir en bateau — juste dans la direction opposée !",
      "ar": "إلى هناك حاول يونان الإبحار هربًا — في الاتجاه المعاكس تمامًا!"
     }
    },
    {
     "id": "w_sheba",
     "x": 77,
     "y": 88,
     "card": "heroes_13",
     "name": {
      "ru": "Царство Савское",
      "en": "The Kingdom of Sheba",
      "de": "Land Saba",
      "es": "El reino de Saba",
      "pt": "Reino de Sabá",
      "fr": "Royaume de Saba",
      "ar": "مملكة سبأ"
     },
     "blurb": {
      "ru": "Из этой далёкой страны царица ехала к Соломону за мудростью.",
      "en": "From this faraway land, a queen traveled to Solomon in search of wisdom.",
      "de": "Aus diesem fernen Land reiste die Königin zu Salomo, um seine Weisheit zu hören.",
      "es": "Desde este país lejano, la reina viajó hasta Salomón en busca de sabiduría.",
      "pt": "Dessa terra distante, a rainha viajou até Salomão em busca de sabedoria.",
      "fr": "De ce pays lointain, une reine est venue voir Salomon pour sa sagesse.",
      "ar": "من هذه البلاد البعيدة أتت الملكة إلى سليمان بحثًا عن الحكمة."
     }
    }
   ]
  }
 },
 "reconstructor": [
  {
   "id": "ark",
   "emoji": "🚢",
   "name": {
    "ru": "Ноев ковчег",
    "en": "Noah's Ark",
    "de": "Die Arche Noah",
    "es": "El arca de Noé",
    "pt": "Arca de Noé",
    "fr": "L'arche de Noé",
    "ar": "سفينة نوح"
   },
   "done": {
    "ru": "Ковчег готов — все пассажиры на борту!",
    "en": "The ark is ready — all passengers are on board!",
    "de": "Die Arche ist fertig — alle Passagiere sind an Bord!",
    "es": "¡El arca está lista, con todos los pasajeros a bordo!",
    "pt": "A arca está pronta — todos os passageiros a bordo!",
    "fr": "L'arche est prête — tous les passagers sont à bord !",
    "ar": "السفينة جاهزة — وكل الركاب على متنها!"
   },
   "stages": [
    {
     "img": "img/build/ark_1.webp",
     "caption": {
      "ru": "Каркас из дерева гофер: рёбра будущего корабля.",
      "en": "A frame of gopher wood: the ribs of a ship-to-be.",
      "de": "Das Gerüst aus Zypressenholz: die Rippen des künftigen Schiffes.",
      "es": "El armazón de madera de gofer: las costillas del futuro barco.",
      "pt": "Armação de madeira de gofer: as costelas do futuro navio.",
      "fr": "La charpente en bois de gopher : les côtes du futur bateau.",
      "ar": "هيكل من خشب الجُفر: أضلاع السفينة القادمة."
     }
    },
    {
     "img": "img/build/ark_2.webp",
     "caption": {
      "ru": "Обшивка бортов и смола — чтобы не пропускать воду.",
      "en": "Planking the sides and coating them with pitch — to keep out the water.",
      "de": "Wände verkleidet und mit Pech abgedichtet — damit kein Wasser eindringt.",
      "es": "Se cubren los costados y se sellan con brea, para que no entre el agua.",
      "pt": "Revestimento dos cascos e piche — para não deixar a água entrar.",
      "fr": "Le revêtement des parois et le bitume — pour ne pas laisser passer l'eau.",
      "ar": "تغطية الجوانب بالقار — حتى لا يتسرّب الماء."
     }
    },
    {
     "img": "img/build/ark_3.webp",
     "caption": {
      "ru": "Палуба и домик с окошками — три этажа для пассажиров.",
      "en": "A deck and a little house with windows — three floors for the passengers.",
      "de": "Deck und Haus mit kleinen Fenstern — drei Stockwerke für die Passagiere.",
      "es": "Cubierta y cabaña con ventanas: tres pisos para los pasajeros.",
      "pt": "Deque e cabine com janelinhas — três andares para os passageiros.",
      "fr": "Le pont et la cabane avec des petites fenêtres — trois étages pour les passagers.",
      "ar": "سطح وبيت بنوافذ صغيرة — ثلاثة طوابق للركاب."
     }
    },
    {
     "img": "img/build/ark_4.webp",
     "caption": {
      "ru": "Сходни спущены — пары зверей поднимаются на борт!",
      "en": "The ramp is down — pairs of animals are climbing aboard!",
      "de": "Die Rampe ist heruntergelassen — die Tierpaare gehen an Bord!",
      "es": "¡La rampa está baja y las parejas de animales suben a bordo!",
      "pt": "A rampa foi baixada — os pares de animais estão subindo a bordo!",
      "fr": "La passerelle est descendue — les couples d'animaux montent à bord !",
      "ar": "المِرقاة نزلت — وأزواج الحيوانات تصعد إلى السفينة!"
     }
    }
   ]
  },
  {
   "id": "tabernacle",
   "emoji": "🏕️",
   "name": {
    "ru": "Скиния",
    "en": "The Tabernacle",
    "de": "Die Stiftshütte",
    "es": "El tabernáculo",
    "pt": "Tabernáculo",
    "fr": "Le tabernacle",
    "ar": "خيمة الاجتماع"
   },
   "done": {
    "ru": "Скиния собрана — походный храм готов в путь!",
    "en": "The Tabernacle is assembled — the traveling temple is ready to go!",
    "de": "Die Stiftshütte steht — der wandernde Tempel ist bereit zum Aufbruch!",
    "es": "¡El tabernáculo está armado: el templo portátil listo para el camino!",
    "pt": "O tabernáculo está montado — o templo ambulante está pronto para a viagem!",
    "fr": "Le tabernacle est monté — le temple portatif est prêt pour la route !",
    "ar": "خيمة الاجتماع جاهزة — الهيكل المتنقّل مستعدّ للرحلة!"
   },
   "stages": [
    {
     "img": "img/build/tab_1.webp",
     "caption": {
      "ru": "Столбы и ограда двора — размечаем место.",
      "en": "Posts and a fence for the courtyard — marking out the spot.",
      "de": "Pfosten und Umzäunung des Vorhofs — wir stecken den Platz ab.",
      "es": "Postes y cerco del patio: marcamos el lugar.",
      "pt": "Postes e cerca do pátio — marcando o lugar.",
      "fr": "Les poteaux et la clôture de la cour — on trace l'emplacement.",
      "ar": "أعمدة وسياج للساحة — نحدّد المكان."
     }
    },
    {
     "img": "img/build/tab_2.webp",
     "caption": {
      "ru": "Деревянный каркас шатра из золочёных брусьев.",
      "en": "A wooden frame for the tent, made of gold-covered beams.",
      "de": "Das hölzerne Gerüst des Zeltes aus vergoldeten Brettern.",
      "es": "El armazón de madera de la tienda, hecho de vigas doradas.",
      "pt": "Armação de madeira da tenda, feita de vigas revestidas de ouro.",
      "fr": "La charpente en bois de la tente, faite de planches dorées.",
      "ar": "هيكل خشبي من ألواح مطليّة بالذهب لبناء الخيمة."
     }
    },
    {
     "img": "img/build/tab_3.webp",
     "caption": {
      "ru": "Натягиваем покрывала — крышу походного храма.",
      "en": "Stretching out the coverings — the roof of the traveling temple.",
      "de": "Wir spannen die Decken darüber — das Dach des wandernden Tempels.",
      "es": "Extendemos las cortinas: el techo del templo portátil.",
      "pt": "Estendemos as cobertas — o teto do templo ambulante.",
      "fr": "On tend les tentures — le toit du temple portatif.",
      "ar": "نمدّ الأغطية — سقف الهيكل المتنقّل."
     }
    },
    {
     "img": "img/build/tab_4.webp",
     "caption": {
      "ru": "Во дворе — жертвенник и умывальник. Можно в путь!",
      "en": "In the courtyard — an altar and a basin. Time to hit the road!",
      "de": "Im Vorhof stehen Altar und Waschbecken. Jetzt kann es losgehen!",
      "es": "En el patio, el altar y la fuente para lavarse. ¡Ya se puede partir!",
      "pt": "No pátio, o altar e a bacia. Podemos seguir viagem!",
      "fr": "Dans la cour : l'autel et le bassin. On peut prendre la route !",
      "ar": "في الساحة — مذبح وحوض للاغتسال. ها نحن مستعدّون للرحلة!"
     }
    }
   ]
  },
  {
   "id": "temple",
   "emoji": "🏛️",
   "name": {
    "ru": "Храм Соломона",
    "en": "Solomon's Temple",
    "de": "Der Tempel Salomos",
    "es": "El Templo de Salomón",
    "pt": "Templo de Salomão",
    "fr": "Le Temple de Salomon",
    "ar": "هيكل سليمان"
   },
   "done": {
    "ru": "Храм построен — и ни один молоток не стучал на стройке!",
    "en": "The temple is built — and not a single hammer was heard at the site!",
    "de": "Der Tempel ist fertig — und kein einziger Hammer hat dabei geklopft!",
    "es": "¡El templo está construido, y ni un solo martillo sonó en la obra!",
    "pt": "O templo está construído — e nenhum martelo bateu na obra!",
    "fr": "Le Temple est construit — et pas un seul marteau n'a résonné sur le chantier !",
    "ar": "اكتمل بناء الهيكل — ولم تُسمَع طرقة مطرقة واحدة في الورشة!"
   },
   "stages": [
    {
     "img": "img/build/temple_1.webp",
     "caption": {
      "ru": "Фундамент из огромных тёсаных камней.",
      "en": "A foundation of huge, carefully cut stones.",
      "de": "Ein Fundament aus riesigen, behauenen Steinen.",
      "es": "Los cimientos hechos con enormes piedras talladas.",
      "pt": "A base é feita de enormes pedras lavradas.",
      "fr": "Des fondations en énormes pierres taillées.",
      "ar": "أساس من حجارة ضخمة منحوتة بعناية."
     }
    },
    {
     "img": "img/build/temple_2.webp",
     "caption": {
      "ru": "Стены и колонны из светлого камня.",
      "en": "Walls and columns of pale stone.",
      "de": "Wände und Säulen aus hellem Stein.",
      "es": "Muros y columnas de piedra clara.",
      "pt": "Paredes e colunas de pedra clara.",
      "fr": "Des murs et des colonnes en pierre claire.",
      "ar": "جدران وأعمدة من حجر فاتح اللون."
     }
    },
    {
     "img": "img/build/temple_3.webp",
     "caption": {
      "ru": "Крыша из кедра и золотая отделка.",
      "en": "A cedar roof and shining gold trim.",
      "de": "Ein Dach aus Zedernholz mit goldenen Verzierungen.",
      "es": "Techo de madera de cedro con adornos de oro.",
      "pt": "Telhado de cedro com acabamento dourado.",
      "fr": "Un toit en bois de cèdre et des finitions en or.",
      "ar": "سقف من خشب الأرز وزخارف من الذهب."
     }
    },
    {
     "img": "img/build/temple_4.webp",
     "caption": {
      "ru": "Готовый Храм сияет над Иерусалимом.",
      "en": "The finished Temple gleams over Jerusalem.",
      "de": "Der fertige Tempel erstrahlt über Jerusalem.",
      "es": "El Templo está terminado y brilla sobre Jerusalén.",
      "pt": "O Templo pronto brilha sobre Jerusalém.",
      "fr": "Le Temple achevé brille au-dessus de Jérusalem.",
      "ar": "الهيكل اكتمل، وها هو يلمع فوق أورشليم."
     }
    }
   ]
  },
  {
   "id": "babel",
   "emoji": "🗼",
   "name": {
    "ru": "Вавилонская башня",
    "en": "The Tower of Babel",
    "de": "Der Turmbau zu Babel",
    "es": "La Torre de Babel",
    "pt": "A Torre de Babel",
    "fr": "La tour de Babel",
    "ar": "برج بابل"
   },
   "done": {
    "ru": "А вершину так и не достроили — все заговорили на разных языках!",
    "en": "But the top was never finished — suddenly everyone spoke different languages!",
    "de": "Die Spitze wurde nie fertig – auf einmal sprachen alle verschiedene Sprachen!",
    "es": "¡Y nunca terminaron la cima, porque todos empezaron a hablar idiomas distintos!",
    "pt": "Mas o topo nunca ficou pronto — todos começaram a falar línguas diferentes!",
    "fr": "Le sommet ne fut jamais achevé : tout le monde s'est mis à parler des langues différentes !",
    "ar": "لكن القمة لم تكتمل أبدًا... فجأة صار الناس يتكلمون بلغات مختلفة!"
   },
   "stages": [
    {
     "img": "img/build/babel_1.webp",
     "caption": {
      "ru": "Первые ярусы из обожжённого кирпича.",
      "en": "The first levels are built of baked brick.",
      "de": "Die ersten Stockwerke aus gebrannten Ziegeln.",
      "es": "Los primeros niveles de ladrillo cocido.",
      "pt": "Os primeiros andares são feitos de tijolos cozidos.",
      "fr": "Les premiers étages en briques cuites.",
      "ar": "الطوابق الأولى من الطوب المحروق."
     }
    },
    {
     "img": "img/build/babel_2.webp",
     "caption": {
      "ru": "Спираль растёт — леса, тачки, тысячи строителей.",
      "en": "The spiral grows taller — scaffolds, carts, and thousands of builders.",
      "de": "Die Spirale wächst – Gerüste, Schubkarren, tausende Bauarbeiter.",
      "es": "La espiral crece: andamios, carretillas, miles de constructores.",
      "pt": "A espiral cresce — andaimes, carrinhos de mão, milhares de construtores.",
      "fr": "La spirale grandit : échafaudages, brouettes, des milliers de bâtisseurs.",
      "ar": "البرج يرتفع حلزونيًا: سقالات وعربات وآلاف البنّائين."
     }
    },
    {
     "img": "img/build/babel_3.webp",
     "caption": {
      "ru": "Башня уходит в облака — вот-вот достанет до неба…",
      "en": "The tower rises into the clouds — almost touching the sky…",
      "de": "Der Turm ragt in die Wolken – gleich berührt er den Himmel …",
      "es": "La torre se pierde entre las nubes, a punto de tocar el cielo…",
      "pt": "A torre sobe até as nuvens — já quase toca o céu…",
      "fr": "La tour s'élève dans les nuages, encore un peu et elle touchera le ciel…",
      "ar": "البرج يخترق الغيوم... يكاد يلامس السماء…"
     }
    },
    {
     "img": "img/build/babel_4.webp",
     "caption": {
      "ru": "Стройка замерла: строители перестали понимать друг друга.",
      "en": "The work stops: the builders can no longer understand each other.",
      "de": "Die Arbeit steht still: Die Bauleute verstehen sich nicht mehr.",
      "es": "La obra se detiene: los constructores ya no se entienden entre sí.",
      "pt": "A obra parou: os construtores não se entendiam mais.",
      "fr": "Le chantier s'arrête : les bâtisseurs ne se comprennent plus.",
      "ar": "توقف البناء فجأة: البنّاؤون لم يعودوا يفهمون بعضهم بعضًا."
     }
    }
   ]
  }
 ]
};
