/* Единое меню разделов тома «Библейские истории».
   Корневая оболочка (index.html + app.js) владеет навигацией как у «Птиц мира»:
   заставка → нижний бар (Лента / Альбом / Игры / Родителям) → вкладки альбома.
   FEED_MENU остаётся словарём подписей для встроенных feed/hub (и для
   прямого захода на feed/index.html или hub.html без оболочки). */
window.FEED_LANG_KEY = "bibi_lang";
window.FEED_MENU = [
  { to:"lenta",    label:"Лента",     labelEn:"Feed",    icon:"scroll" },
  { to:"cards",    label:"Карты",     labelEn:"Cards",   icon:"cards" },
  { to:"books",    label:"Книги",     labelEn:"Books",   icon:"book" },
  { to:"build",    label:"Стройка",   labelEn:"Builder", icon:"hammer" },
  { to:"glossary", label:"Словарик",  labelEn:"Glossary",icon:"magnifier" },
  { to:"parent",   label:"Родителям", labelEn:"Parents", icon:"family" }
];
