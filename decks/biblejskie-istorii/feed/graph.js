/* Граф знаний «Библейские истории» (лента). «Системы» — 7 эпох тропы, узлы —
   памятные герои и события внутри эпохи (концепты). Узел «загорается», когда
   ребёнок пролистал карточку с knows:[id] (экспозиция) или прошёл интерактив.
   Полный набор на весь курс — эпоха за эпохой он наполняется. Цвета эпох
   согласованы с data/volume.js. Родительский экран рисует констелляцию отсюда. */
window.FEED_GRAPH = {
  mapNoun:{ru:"карте",en:"map",de:"Karte",es:"mapa",pt:"mapa",fr:"carte",ar:"خريطة"},   // «карта знаний» для людей
  newNodeLabel:{ru:"Новая история!",en:"New story!",de:"Neue Geschichte!",es:"¡Nueva historia!",pt:"Nova história!",fr:"Nouvelle histoire !",ar:"قصة جديدة!"},   // плашка-салют при загорании узла (по умолч. «Новый орган!»)
  unitGen:{ru:"историй",en:"stories",de:"Geschichten",es:"historias",pt:"histórias",fr:"histoires",ar:"قصص"},               // родит. мн. для «из N …» на родительском экране
  centerEmoji: "📖",                // центр графа-констелляции (по умолч. 🧑)
  centerLabel:{ru:"БИБЛИЯ",en:"BIBLE",de:"BIBEL",es:"BIBLIA",pt:"BÍBLIA",fr:"BIBLE",ar:"الكتاب المقدس"},
  centerIcon: "../img/splash_hero.webp",
  /* подписи ленты (T2): «Далее» как у птиц */
  ui: {
    next:{ru:"Далее",en:"Next",de:"Weiter",es:"Siguiente",pt:"Seguinte",fr:"Suivant",ar:"التالي"},
    nextAria:{ru:"Дальше",en:"Next",de:"Weiter",es:"Siguiente",pt:"Seguinte",fr:"Suivant",ar:"التالي"},
    colorsRetry:{ru:"Попробуй ещё — только цвета радуги",en:"Try again — only rainbow colors",de:"Noch einmal — nur Regenbogenfarben",es:"Inténtalo de nuevo — solo colores del arcoíris",pt:"Tente de novo — só cores do arco-íris",fr:"Réessaie — seulement les couleurs de l'arc-en-ciel",ar:"حاول مرة أخرى — فقط ألوان قوس قزح"},
    colorsCnt:{ru:"Выбрано",en:"Selected",de:"Gewählt",es:"Elegido",pt:"Escolhido",fr:"Choisi",ar:"تم الاختيار"},
    scnt:{ru:"Найдено",en:"Found",de:"Gefunden",es:"Encontrado",pt:"Encontrado",fr:"Trouvé",ar:"تم العثور"},
    sall:{ru:"Все секреты открыты! Листай дальше ↑",en:"All secrets found! Swipe up ↑",de:"Alle Geheimnisse offen! Weiter wischen ↑",es:"¡Todos los secretos abiertos! Desliza ↑",pt:"Todos os segredos abertos! Desliza ↑",fr:"Tous les secrets ouverts ! Fais glisser ↑",ar:"كل الأسرار مفتوحة! اسحب لأعلى ↑"},
    veilHint:{ru:"Нажми, чтобы узнать",en:"Tap to find out",de:"Tippe zum Entdecken",es:"Toca para saber",pt:"Toca para saber",fr:"Appuie pour découvrir",ar:"اضغط لتعرف"},
    veilNext:{ru:"Листай дальше ↑",en:"Swipe up ↑",de:"Weiter wischen ↑",es:"Desliza ↑",pt:"Desliza ↑",fr:"Fais glisser ↑",ar:"اسحب لأعلى ↑"}
  },
  /* растровые иконки вместо эмодзи — акварельный набор тома (img/icons) */
  uiIcons: { star:"../img/icons/star-mark.webp", bonus:"../img/icons/question.webp",
             reveal:"../img/icons/magnifier-mark.webp", plain:true },
  ranks: [
    { min:0,  name:{ru:"Путник",en:"Wanderer",de:"Wanderer",es:"Caminante",pt:"Viajante",fr:"Voyageur",ar:"مسافر"},           icon:"../img/icons/walker.webp",    emoji:"🐣" },
    { min:5,  name:{ru:"Ученик",en:"Learner",de:"Schüler",es:"Alumno",pt:"Aprendiz",fr:"Élève",ar:"تلميذ"},           icon:"../img/icons/book-mark.webp", emoji:"📖" },
    { min:12, name:{ru:"Знаток",en:"Expert",de:"Kenner",es:"Experto",pt:"Entendido",fr:"Expert",ar:"خبير"},           icon:"../img/icons/magnifier-mark.webp", emoji:"🔎" },
    { min:24, name:{ru:"Мудрец",en:"Sage",de:"Weiser",es:"Sabio",pt:"Sábio",fr:"Sage",ar:"حكيم"},           icon:"../img/icons/scroll.webp",    emoji:"🎓" },
    { min:39, name:{ru:"Хранитель историй",en:"Story Keeper",de:"Geschichtenhüter",es:"Guardián de historias",pt:"Guardião das histórias",fr:"Gardien des histoires",ar:"حارس القصص"},icon:"../img/icons/crown.webp",     emoji:"👑" }
  ],
  bkt: {},                          // включает BKT-мастерство (§6): дефолты движка,
                                    // узел «загорается» после верного ответа, не с экспозиции
  systems: [
    { id:"e1", icon:"../img/plots_01_creation.webp", name:{ru:"Начало мира",en:"The world’s beginning",de:"Der Anfang der Welt",es:"El comienzo del mundo",pt:"O começo do mundo",fr:"Le début du monde",ar:"بداية العالم"}, emoji:"🌍", color:"#8ecae6",
      organs:[ {id:"creation",name:{ru:"Сотворение мира",en:"Creation of the world",de:"Erschaffung der Welt",es:"La creación del mundo",pt:"A criação do mundo",fr:"La création du monde",ar:"خلق العالم"}}, {id:"eden",name:{ru:"Райский сад",en:"The Garden of Paradise",de:"Der Paradiesgarten",es:"El jardín del Paraíso",pt:"O jardim do Paraíso",fr:"Le jardin du Paradis",ar:"جنة عدن"}},
               {id:"noah",name:{ru:"Ной",en:"Noah",de:"Noah",es:"Noé",pt:"Noé",fr:"Noé",ar:"نوح"}}, {id:"ark",name:{ru:"Ковчег",en:"The ark",de:"Die Arche",es:"El arca",pt:"A arca",fr:"L’arche",ar:"الفلك"}},
               {id:"rainbow",name:{ru:"Радуга",en:"The rainbow",de:"Der Regenbogen",es:"El arcoíris",pt:"O arco-íris",fr:"L’arc-en-ciel",ar:"قوس قزح"}}, {id:"babel",name:{ru:"Вавилонская башня",en:"The Tower of Babel",de:"Der Turm zu Babel",es:"La torre de Babel",pt:"A torre de Babel",fr:"La tour de Babel",ar:"برج بابل"}} ] },
    { id:"e2", icon:"../img/heroes_02_abraham.webp", name:{ru:"Патриархи",en:"The patriarchs",de:"Die Patriarchen",es:"Los patriarcas",pt:"Os patriarcas",fr:"Les patriarches",ar:"الآباء"}, emoji:"⛺", color:"#e9c46a",
      organs:[ {id:"abraham",name:{ru:"Авраам",en:"Abraham",de:"Abraham",es:"Abraham",pt:"Abraão",fr:"Abraham",ar:"إبراهيم"}}, {id:"sarah",name:{ru:"Сарра",en:"Sarah",de:"Sara",es:"Sara",pt:"Sara",fr:"Sara",ar:"سارة"}},
               {id:"jacob",name:{ru:"Иаков",en:"Jacob",de:"Jakob",es:"Jacob",pt:"Jacó",fr:"Jacob",ar:"يعقوب"}}, {id:"ladder",name:{ru:"Лестница Иакова",en:"Jacob's Ladder",de:"Jakobs Leiter",es:"La escalera de Jacob",pt:"A escada de Jacó",fr:"L’échelle de Jacob",ar:"سلّم يعقوب"}},
               {id:"joseph",name:{ru:"Иосиф",en:"Joseph",de:"Josef",es:"José",pt:"José",fr:"Joseph",ar:"يوسف"}}, {id:"coat",name:{ru:"Разноцветная одежда",en:"A colorful coat",de:"Ein buntes Gewand",es:"Una túnica de colores",pt:"Uma túnica colorida",fr:"Une tunique colorée",ar:"ثوب ملون"}} ] },
    { id:"e3", icon:"../img/plots_10_sea.webp", name:{ru:"Египет и Исход",en:"Egypt and the Exodus",de:"Ägypten und der Auszug",es:"Egipto y el Éxodo",pt:"Egito e o Êxodo",fr:"L’Égypte et l’Exode",ar:"مصر والخروج"}, emoji:"🌊", color:"#f4a261",
      organs:[ {id:"basket",name:{ru:"Корзинка в тростнике",en:"Basket in the reeds",de:"Körbchen im Schilf",es:"Canastita entre los juncos",pt:"Cestinha no junco",fr:"Corbeille dans les roseaux",ar:"السلّة بين القصب"}}, {id:"moses",name:{ru:"Моисей",en:"Moses",de:"Mose",es:"Moisés",pt:"Moisés",fr:"Moïse",ar:"موسى"}},
               {id:"bush",name:{ru:"Неопалимая купина",en:"The burning bush",de:"Der brennende Dornbusch",es:"La zarza ardiente",pt:"A sarça ardente",fr:"Le buisson ardent",ar:"العليقة المشتعلة"}}, {id:"sea",name:{ru:"Переход через море",en:"Crossing the Sea",de:"Der Durchzug durchs Meer",es:"El paso por el mar",pt:"A passagem pelo mar",fr:"La traversée de la mer",ar:"العبور عبر البحر"}},
               {id:"manna",name:{ru:"Манна небесная",en:"Manna from Heaven",de:"Das Himmelsmanna",es:"El maná del cielo",pt:"O maná do céu",fr:"La manne du ciel",ar:"المنّ من السماء"}}, {id:"tablets",name:{ru:"Скрижали",en:"The tablets",de:"Die Tafeln",es:"Las tablas",pt:"As tábuas",fr:"Les tables",ar:"اللوحان"}},
               {id:"miriam",name:{ru:"Мариам",en:"Miriam",de:"Mirjam",es:"Miriam",pt:"Miriã",fr:"Myriam",ar:"مريم"}} ] },
    { id:"e4", icon:"../img/plots_13_jericho.webp", name:{ru:"Новая земля",en:"A new land",de:"Ein neues Land",es:"Una tierra nueva",pt:"Uma terra nova",fr:"Une terre nouvelle",ar:"أرض جديدة"}, emoji:"🌾", color:"#a7c957",
      organs:[ {id:"joshua",name:{ru:"Иисус Навин",en:"Joshua",de:"Josua",es:"Josué",pt:"Josué",fr:"Josué",ar:"يشوع"}}, {id:"jericho",name:{ru:"Стены Иерихона",en:"Walls of Jericho",de:"Mauern von Jericho",es:"Murallas de Jericó",pt:"Muralhas de Jericó",fr:"Murs de Jéricho",ar:"أسوار أريحا"}},
               {id:"samson",name:{ru:"Самсон",en:"Samson",de:"Simson",es:"Sansón",pt:"Sansão",fr:"Samson",ar:"شمشون"}}, {id:"ruth",name:{ru:"Руфь",en:"Ruth",de:"Rut",es:"Rut",pt:"Rute",fr:"Ruth",ar:"راعوث"}} ] },
    { id:"e5", icon:"../img/plots_14_goliath.webp", name:{ru:"Цари",en:"Kings",de:"Könige",es:"Reyes",pt:"Reis",fr:"Rois",ar:"الملوك"}, emoji:"👑", color:"#c9ada7",
      organs:[ {id:"samuel",name:{ru:"Самуил",en:"Samuel",de:"Samuel",es:"Samuel",pt:"Samuel",fr:"Samuel",ar:"صموئيل"}}, {id:"david",name:{ru:"Давид",en:"David",de:"David",es:"David",pt:"Davi",fr:"David",ar:"داود"}},
               {id:"goliath",name:{ru:"Давид и Голиаф",en:"David and Goliath",de:"David und Goliath",es:"David y Goliat",pt:"Davi e Golias",fr:"David et Goliath",ar:"داود وجليات"}}, {id:"solomon",name:{ru:"Соломон",en:"Solomon",de:"Salomo",es:"Salomón",pt:"Salomão",fr:"Salomon",ar:"سليمان"}},
               {id:"judgment",name:{ru:"Суд Соломона",en:"Solomon’s judgment",de:"Salomos Urteil",es:"El juicio de Salomón",pt:"O julgamento de Salomão",fr:"Le jugement de Salomon",ar:"حكم سليمان"}}, {id:"temple",name:{ru:"Храм",en:"The Temple",de:"Der Tempel",es:"El Templo",pt:"O Templo",fr:"Le Temple",ar:"الهيكل"}} ] },
    { id:"e6", icon:"../img/plots_17_lions.webp", name:{ru:"Пророки и дальние царства",en:"Prophets and distant kingdoms",de:"Propheten und ferne Königreiche",es:"Profetas y reinos lejanos",pt:"Profetas e reinos distantes",fr:"Prophètes et royaumes lointains",ar:"الأنبياء والممالك البعيدة"}, emoji:"📜", color:"#b5838d",
      organs:[ {id:"elijah",name:{ru:"Илия",en:"Elijah",de:"Elia",es:"Elías",pt:"Elias",fr:"Élie",ar:"إيليا"}}, {id:"daniel",name:{ru:"Даниил",en:"Daniel",de:"Daniel",es:"Daniel",pt:"Daniel",fr:"Daniel",ar:"دانيال"}},
               {id:"lions",name:{ru:"Львиный ров",en:"The lions' den",de:"Die Löwengrube",es:"El foso de los leones",pt:"A cova dos leões",fr:"La fosse aux lions",ar:"جبّ الأسود"}}, {id:"esther",name:{ru:"Эсфирь",en:"Esther",de:"Ester",es:"Ester",pt:"Ester",fr:"Esther",ar:"أستير"}},
               {id:"jonah",name:{ru:"Иона",en:"Jonah",de:"Jona",es:"Jonás",pt:"Jonas",fr:"Jonas",ar:"يونان"}}, {id:"fish",name:{ru:"Большая рыба",en:"The big fish",de:"Der große Fisch",es:"El pez grande",pt:"O peixe grande",fr:"Le grand poisson",ar:"السمكة الكبيرة"}} ] },
    { id:"e7", icon:"../img/plots_20_nativity.webp", name:{ru:"Рождество",en:"Christmas",de:"Weihnachten",es:"Navidad",pt:"Natal",fr:"Noël",ar:"الميلاد"}, emoji:"⭐", color:"#ffd166",
      organs:[ {id:"mary",name:{ru:"Мария",en:"Mary",de:"Maria",es:"María",pt:"Maria",fr:"Marie",ar:"مريم"}}, {id:"josephc",name:{ru:"Иосиф-плотник",en:"Joseph the carpenter",de:"Josef der Zimmermann",es:"José el carpintero",pt:"José o carpinteiro",fr:"Joseph le charpentier",ar:"يوسف النجار"}},
               {id:"nativity",name:{ru:"Рождество",en:"Christmas",de:"Weihnachten",es:"Navidad",pt:"Natal",fr:"Noël",ar:"الميلاد"}}, {id:"magi",name:{ru:"Волхвы",en:"The wise men",de:"Die Weisen",es:"Los magos",pt:"Os magos",fr:"Les mages",ar:"المجوس"}} ] }
  ]
};
