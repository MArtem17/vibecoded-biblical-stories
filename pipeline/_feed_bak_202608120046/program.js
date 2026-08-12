/* Программа-карта «Библейские истории» (лента) — 7 глав-эпох «Большого пути».
   Источник правды по структуре курса; экран-карта (тап по ярлыку главы) рисует
   остановки отсюда. Загруженные главы (opening.js/chapter2.js…) берут реальный
   прогресс из движка; остальные показываются как «скоро». Emoji и цвета эпох
   согласованы с графом знаний (graph.js) и data/volume.js. */
window.FEED_PROGRAM = {
  chapters: 10,
  singleMenu: true,   // одно меню слева: путь по эпохам вшит в карту знаний
  /* знаменатель ⭐ в шапке считает движок (starMax по живой колоде), не фиксированное число */
  map: [
    { num:1, icon:"../img/icons/sunmoon.webp", title:"Начало мира",                emoji:"🌍", color:"#8ecae6", cards:30 },
    { num:2, icon:"../img/icons/camel.webp", title:"Патриархи",                  emoji:"⛺", color:"#e9c46a", cards:38 },
    { num:3, icon:"../img/icons/wave.webp", title:"Египет и Исход",             emoji:"🌊", color:"#f4a261", cards:40 },
    { num:4, icon:"../img/icons/wheat.webp", title:"Новая земля",                emoji:"🌾", color:"#a7c957", cards:30 },
    { num:5, icon:"../img/icons/crown.webp", title:"Цари",                       emoji:"👑", color:"#c9ada7", cards:36 },
    { num:6, icon:"../img/icons/scroll.webp", title:"Пророки и дальние царства",  emoji:"📜", color:"#b5838d", cards:34 },
    { num:7, icon:"../img/icons/bethstar.webp", title:"Рождество",                  emoji:"⭐", color:"#ffd166", cards:30 },
    /* veil-галерея «Угадай»: узнавание героев/историй по картинке (ответ под вуалью) */
    { num:8, icon:"../img/icons/question.webp", title:"Угадай героя",             emoji:"🔎", color:"#4f8fb0", cards:41 },
    /* слои закрепления (§12): волна 2 — второй вопрос узла другим видом;
       волна 3 — экзамен связей (exam, открывается по мастерству θ_ask) */
    { num:9, icon:"../img/icons/lock.webp", title:"Секреты пути",               emoji:"🗝️", color:"#9a6fb0", cards:72 },
    { num:10, icon:"../img/icons/trophy.webp", title:"Эксперт",                    emoji:"🏆", color:"#b08968", cards:38 }
  ]
};
