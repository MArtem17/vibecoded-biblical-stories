/* Программа-карта «Библейские истории» (лента) — 7 глав-эпох «Большого пути».
   Источник правды по структуре курса; экран-карта (тап по ярлыку главы) рисует
   остановки отсюда. Загруженные главы (opening.js/chapter2.js…) берут реальный
   прогресс из движка; остальные показываются как «скоро». Emoji и цвета эпох
   согласованы с графом знаний (graph.js) и data/volume.js. */
window.FEED_PROGRAM = {
  chapters: 10,
  langKey: "bibi_lang",
  langs: [["ru","Русский"],["en","English"],["de","Deutsch"],["es","Español"],["pt","Português"],["fr","Français"],["ar","العربية"]],
  singleMenu: true,   // одно меню слева: путь по эпохам вшит в карту знаний
  /* знаменатель ⭐ в шапке считает движок (starMax по живой колоде), не фиксированное число */
  map: [
    { num:1, icon:"../img/plots_01_creation.webp", title:{ru:"Начало мира",en:"The world’s beginning",de:"Der Anfang der Welt",es:"El comienzo del mundo",pt:"O começo do mundo",fr:"Le début du monde",ar:"بداية العالم"},                emoji:"🌍", color:"#8ecae6", cards:30 },
    { num:2, icon:"../img/heroes_02_abraham.webp", title:{ru:"Патриархи",en:"The patriarchs",de:"Die Patriarchen",es:"Los patriarcas",pt:"Os patriarcas",fr:"Les patriarches",ar:"الآباء"},                  emoji:"⛺", color:"#e9c46a", cards:38 },
    { num:3, icon:"../img/plots_10_sea.webp", title:{ru:"Египет и Исход",en:"Egypt and the Exodus",de:"Ägypten und der Auszug",es:"Egipto y el Éxodo",pt:"Egito e o Êxodo",fr:"L’Égypte et l’Exode",ar:"مصر والخروج"},             emoji:"🌊", color:"#f4a261", cards:40 },
    { num:4, icon:"../img/plots_13_jericho.webp", title:{ru:"Новая земля",en:"A new land",de:"Ein neues Land",es:"Una tierra nueva",pt:"Uma terra nova",fr:"Une terre nouvelle",ar:"أرض جديدة"},                emoji:"🌾", color:"#a7c957", cards:30 },
    { num:5, icon:"../img/plots_14_goliath.webp", title:{ru:"Цари",en:"Kings",de:"Könige",es:"Reyes",pt:"Reis",fr:"Rois",ar:"الملوك"},                       emoji:"👑", color:"#c9ada7", cards:36 },
    { num:6, icon:"../img/plots_17_lions.webp", title:{ru:"Пророки и дальние царства",en:"Prophets and distant kingdoms",de:"Propheten und ferne Königreiche",es:"Profetas y reinos lejanos",pt:"Profetas e reinos distantes",fr:"Prophètes et royaumes lointains",ar:"الأنبياء والممالك البعيدة"},  emoji:"📜", color:"#b5838d", cards:34 },
    { num:7, icon:"../img/plots_20_nativity.webp", title:{ru:"Рождество",en:"Christmas",de:"Weihnachten",es:"Navidad",pt:"Natal",fr:"Noël",ar:"الميلاد"},                  emoji:"⭐", color:"#ffd166", cards:30 },
    /* veil-галерея «Угадай»: узнавание героев/историй по картинке (ответ под вуалью) */
    { num:8, icon:"../img/feed_vg_intro.webp", title:{ru:"Угадай героя",en:"Guess the hero",de:"Rate den Helden",es:"Adivina el héroe",pt:"Adivinhe o herói",fr:"Devine le héros",ar:"خمّن البطل"},             emoji:"🔎", color:"#4f8fb0", cards:41 },
    /* слои закрепления (§12): волна 2 — второй вопрос узла другим видом;
       волна 3 — экзамен связей (exam, открывается по мастерству θ_ask) */
    { num:9, icon:"../img/feed_b8_intro.webp", title:{ru:"Секреты пути",en:"Path Secrets",de:"Geheimnisse des Weges",es:"Secretos del camino",pt:"Segredos do caminho",fr:"Secrets du chemin",ar:"أسرار الطريق"},               emoji:"🗝️", color:"#9a6fb0", cards:72 },
    { num:10, icon:"../img/feed_b9_intro.webp", title:{ru:"Эксперт",en:"Expert",de:"Experte",es:"Experto",pt:"Especialista",fr:"Expert",ar:"خبير"},                    emoji:"🏆", color:"#b08968", cards:38 }
  ]
};
