/* Граф знаний «Библейские истории» (лента). «Системы» — 7 эпох тропы, узлы —
   памятные герои и события внутри эпохи (концепты). Узел «загорается», когда
   ребёнок пролистал карточку с knows:[id] (экспозиция) или прошёл интерактив.
   Полный набор на весь курс — эпоха за эпохой он наполняется. Цвета эпох
   согласованы с data/volume.js. Родительский экран рисует констелляцию отсюда. */
window.FEED_GRAPH = {
  mapNoun: "карте",   // «карта знаний» для людей
  newNodeLabel: "Новая история!",   // плашка-салют при загорании узла (по умолч. «Новый орган!»)
  unitGen: "историй",               // родит. мн. для «из N …» на родительском экране
  centerEmoji: "📖",                // центр графа-констелляции (по умолч. 🧑)
  centerLabel: "БИБЛИЯ",
  centerIcon: "../img/icons/book-mark.webp",
  /* подписи ленты (T2): «Далее» как у птиц */
  ui: { next:"Далее", nextAria:"Дальше",
        colorsRetry:"Попробуй ещё — только цвета радуги",
        colorsCnt:"Выбрано" },
  /* растровые иконки вместо эмодзи — акварельный набор тома (img/icons) */
  uiIcons: { star:"../img/icons/star-mark.webp", bonus:"../img/icons/question.webp",
             reveal:"../img/icons/magnifier-mark.webp", plain:true },
  ranks: [
    { min:0,  name:"Путник",           icon:"../img/icons/walker.webp",    emoji:"🐣" },
    { min:5,  name:"Ученик",           icon:"../img/icons/book-mark.webp", emoji:"📖" },
    { min:12, name:"Знаток",           icon:"../img/icons/magnifier-mark.webp", emoji:"🔎" },
    { min:24, name:"Мудрец",           icon:"../img/icons/scroll.webp",    emoji:"🎓" },
    { min:39, name:"Хранитель историй",icon:"../img/icons/crown.webp",     emoji:"👑" }
  ],
  bkt: {},                          // включает BKT-мастерство (§6): дефолты движка,
                                    // узел «загорается» после верного ответа, не с экспозиции
  systems: [
    { id:"e1", icon:"../img/icons/sunmoon.webp", name:"Начало мира", emoji:"🌍", color:"#8ecae6",
      organs:[ {id:"creation",name:"Сотворение мира"}, {id:"eden",name:"Райский сад"},
               {id:"noah",name:"Ной"}, {id:"ark",name:"Ковчег"},
               {id:"rainbow",name:"Радуга"}, {id:"babel",name:"Вавилонская башня"} ] },
    { id:"e2", icon:"../img/icons/camel.webp", name:"Патриархи", emoji:"⛺", color:"#e9c46a",
      organs:[ {id:"abraham",name:"Авраам"}, {id:"sarah",name:"Сарра"},
               {id:"jacob",name:"Иаков"}, {id:"ladder",name:"Лестница Иакова"},
               {id:"joseph",name:"Иосиф"}, {id:"coat",name:"Разноцветная одежда"} ] },
    { id:"e3", icon:"../img/icons/wave.webp", name:"Египет и Исход", emoji:"🌊", color:"#f4a261",
      organs:[ {id:"basket",name:"Корзинка в тростнике"}, {id:"moses",name:"Моисей"},
               {id:"bush",name:"Неопалимая купина"}, {id:"sea",name:"Переход через море"},
               {id:"manna",name:"Манна небесная"}, {id:"tablets",name:"Скрижали"},
               {id:"miriam",name:"Мариам"} ] },
    { id:"e4", icon:"../img/icons/wheat.webp", name:"Новая земля", emoji:"🌾", color:"#a7c957",
      organs:[ {id:"joshua",name:"Иисус Навин"}, {id:"jericho",name:"Стены Иерихона"},
               {id:"samson",name:"Самсон"}, {id:"ruth",name:"Руфь"} ] },
    { id:"e5", icon:"../img/icons/crown.webp", name:"Цари", emoji:"👑", color:"#c9ada7",
      organs:[ {id:"samuel",name:"Самуил"}, {id:"david",name:"Давид"},
               {id:"goliath",name:"Давид и Голиаф"}, {id:"solomon",name:"Соломон"},
               {id:"judgment",name:"Суд Соломона"}, {id:"temple",name:"Храм"} ] },
    { id:"e6", icon:"../img/icons/scroll.webp", name:"Пророки и дальние царства", emoji:"📜", color:"#b5838d",
      organs:[ {id:"elijah",name:"Илия"}, {id:"daniel",name:"Даниил"},
               {id:"lions",name:"Львиный ров"}, {id:"esther",name:"Эсфирь"},
               {id:"jonah",name:"Иона"}, {id:"fish",name:"Большая рыба"} ] },
    { id:"e7", icon:"../img/icons/bethstar.webp", name:"Рождество", emoji:"⭐", color:"#ffd166",
      organs:[ {id:"mary",name:"Мария"}, {id:"josephc",name:"Иосиф-плотник"},
               {id:"nativity",name:"Рождество"}, {id:"magi",name:"Волхвы"} ] }
  ]
};
