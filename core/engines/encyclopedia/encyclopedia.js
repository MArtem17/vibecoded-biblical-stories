/* Скелет DOM движка: строится автоматически, если страница не принесла свой. */
(function(){ if(document.querySelector(".device")) return;
  document.body.insertAdjacentHTML("afterbegin", "<div class=\"device\">\n  <div class=\"stage\" id=\"stage\" data-layout=\"top\"></div>\n\n  <div class=\"langs\" id=\"langs\" role=\"group\" aria-label=\"Язык\"></div>\n\n  <div class=\"fact-badge\" id=\"factBadge\"></div>\n  <div class=\"widget-bar\" id=\"widgetBar\"></div>\n  <div class=\"hotspots\" id=\"hotspots\"></div>\n  <div class=\"timeline\" id=\"timeline\"></div>\n  <div class=\"family\" id=\"family\"></div>\n  <div class=\"games-menu\" id=\"gamesMenu\" hidden></div>\n  <div class=\"sandbox-layer\" id=\"sandboxLayer\" hidden></div>\n\n  <div class=\"bar\">\n    <button class=\"btn\" id=\"close\" aria-label=\"Закрыть\">\n      <svg viewBox=\"0 0 24 24\"><path d=\"M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z\"/></svg>\n    </button>\n  </div>\n\n  <div class=\"nav\" id=\"nav\"></div>\n\n  <div class=\"navbar\" id=\"navbar\">\n    <button class=\"btn play\" id=\"play\" aria-label=\"Прочти мне\">\n      <svg class=\"ico-play\" viewBox=\"0 0 24 24\"><path d=\"M8 5v14l11-7z\"/></svg>\n      <svg class=\"ico-pause\" viewBox=\"0 0 24 24\"><path d=\"M6 5h4v14H6zM14 5h4v14h-4z\"/></svg>\n    </button>\n    <div class=\"scrub\" id=\"scrub\" role=\"slider\" aria-label=\"Страница\" tabindex=\"0\">\n      <div class=\"scrub-track\" id=\"scrubTrack\"><div class=\"scrub-fill\" id=\"scrubFill\"></div><div class=\"scrub-thumb\" id=\"scrubThumb\"></div></div>\n    </div>\n    <div class=\"navcount\" id=\"counter\"></div>\n  </div>\n\n  <div class=\"toc-layer\" id=\"tocLayer\" hidden>\n    <div class=\"sb-head\"><span class=\"t\" id=\"tocTitle\"></span><button class=\"x\" id=\"tocX\" aria-label=\"Закрыть\">×</button></div>\n    <div class=\"toc-list\" id=\"tocList\"></div>\n  </div>\n\n  <div class=\"sheet\" id=\"sheet\" hidden></div>\n  <div class=\"bubble\" id=\"bubble\" hidden></div>\n</div>");
})();

/* ── Интеграция с приложением «Динозавры» ──────────────────────────────
   Читалка встроена в общий навигатор (index.html колоды) в <iframe>.
   Язык — общий для всего продукта: приложение передаёт его через ?lang=
   и live через postMessage. ?page=NN открывает нужный разворот, ?lock=1
   прячет навигацию (режим «Карта мира» — фиксируем один разворот). */
(function(){
  try{
    var qs=new URLSearchParams(location.search);
    var LK="book_lang_"+((window.BOOK&&window.BOOK.book_id)||"x");
    var lg=qs.get("lang")||(location.hash.match(/lang=([a-z]{2})/)||[])[1];
    if(lg && window.BOOK && window.BOOK.languages.indexOf(lg)>=0) localStorage.setItem(LK,lg);
    var pg=parseInt(qs.get("page"),10);
    if(pg>0) window.__BEAT__=pg-1;
    if(qs.get("lock")==="1"){
      document.documentElement.setAttribute("data-lock","1");
      var st=document.createElement("style");
      st.textContent='[data-lock] .navbar,[data-lock] .counter,[data-lock] .bar{display:none!important}'+
        '[data-lock] .nav{pointer-events:none!important}';
      document.head.appendChild(st);
    }
    // встроено в приложение: язык задаёт общий переключатель продукта — прячем
    // собственный переключатель книги, чтобы не дублировать (кнопки остаются
    // в DOM: live-переключение из приложения кликает их программно).
    if(qs.get("embed")==="1"){
      document.documentElement.setAttribute("data-embed","1");
      var st2=document.createElement("style");
      st2.textContent='[data-embed] #langs{display:none!important}';
      document.head.appendChild(st2);
    }
    // ?langbar=0 — спрятать только переключатель языков (язык задают снаружи —
    // напр. родительские настройки продукта), крестик закрытия остаётся
    if(qs.get("langbar")==="0"){
      var st3=document.createElement("style");
      st3.textContent='#langs{display:none!important}';
      document.head.appendChild(st3);
    }
    // ?exit=1 — книга открыта страницей (не во фрейме): плавающая кнопка выхода
    // назад в оболочку (штатный #close только останавливает чтение)
    if(qs.get("exit")==="1"){
      var mkExit=function(){
        var b=document.createElement("button");
        b.textContent="←"; b.setAttribute("aria-label","Назад");
        b.style.cssText="position:fixed;left:10px;top:10px;z-index:400;width:44px;height:44px;"+
          "border-radius:50%;border:2px solid #151515;background:#fff;color:#151515;"+
          "font:900 20px system-ui;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.18)";
        b.onclick=function(){ if(history.length>1) history.back(); else location.href="../index.html"; };
        document.body.appendChild(b);
      };
      if(document.body) mkExit(); else document.addEventListener("DOMContentLoaded",mkExit);
    }
    // режим «Игры»: витрина всех мини-игр вместо книги
    if(qs.get("games")==="1"){ document.documentElement.setAttribute("data-games","1"); }
    // тема оболочки (bible_theme) — словарик и песочницы на тёмном холсте
    var th=qs.get("theme")||localStorage.getItem("bible_theme");
    if(th==="dark") document.documentElement.setAttribute("data-theme","dark");
  }catch(e){}
})();

(function(){
  const BOOK = window.BOOK;
  const LANG_KEY = "book_lang_"+(BOOK.book_id||"x");
  let lang = localStorage.getItem(LANG_KEY) && BOOK.languages.includes(localStorage.getItem(LANG_KEY))
             ? localStorage.getItem(LANG_KEY) : BOOK.languages[0];
  let i = (typeof window!=="undefined" && window.__BEAT__!=null) ? Math.max(0,Math.min(window.__BEAT__, BOOK.pages.length-1)) : 0;
  const RTL_LANGS = ["ar","he","fa","ur"];
  function applyDir(){ const rtl=RTL_LANGS.indexOf(lang)>=0;
    document.documentElement.setAttribute("dir", rtl?"rtl":"ltr");
    document.documentElement.setAttribute("lang", lang); }
  let audioEl = null;

  const FIT = {
    title:{max:.50,start:40,min:20}, top:{max:.42,start:27,min:16}, bottom:{max:.42,start:27,min:16},
    side:{max:.66,start:23,min:15},  panel:{max:.34,start:23,min:15}, caption:{max:.20,start:18,min:13}
  };
  let sizeByLayout = {};
  let wordSpans = [];
  const QUIZ_LABEL = {ru:"Вопрос",en:"Quiz",de:"Quiz",es:"Reto",pt:"Quiz",fr:"Question",ar:"سؤال"};
  const SANDBOX_LABEL = {scale:{ru:"Масштаб",en:"Scale",de:"Maßstab",es:"Escala",pt:"Escala",fr:"Échelle",ar:"المقياس"},timeline:{ru:"Эпохи",en:"Eras",de:"Erdzeitalter",es:"Épocas",pt:"Épocas",fr:"Époques",ar:"الحقب"},sort:{ru:"Сортировка",en:"Sorting",de:"Sortieren",es:"Clasificar",pt:"Classificar",fr:"Tri",ar:"الفرز"},food:{ru:"Цепь",en:"Food chain",de:"Nahrungskette",es:"Cadena",pt:"Cadeia",fr:"Chaîne",ar:"السلسلة الغذائية"},shadow:{ru:"Тени",en:"Shadows",de:"Schatten",es:"Sombras",pt:"Sombras",fr:"Ombres",ar:"الظلال"},memory:{ru:"Пары",en:"Pairs",de:"Paare",es:"Parejas",pt:"Pares",fr:"Paires",ar:"الأزواج"},word:{ru:"Слово",en:"Word",de:"Wort",es:"Palabra",pt:"Palavra",fr:"Mot",ar:"الكلمة"},label:{ru:"Части",en:"Parts",de:"Teile",es:"Partes",pt:"Partes",fr:"Parties",ar:"الأجزاء"},glossary:{ru:"Словарик",en:"Glossary",de:"Glossar",es:"Glosario",pt:"Glossário",fr:"Petit dictionnaire",ar:"القاموس"},ispy:{ru:"Найди и покажи",en:"Find & show",de:"Finde & zeige",es:"Encuentra",pt:"Encontra",fr:"Trouve et montre",ar:"ابحث وأشِر"},truefalse:{ru:"Правда или нет",en:"True or false",de:"Wahr oder falsch",es:"Verdad o no",pt:"Verdade ou não",fr:"Vrai ou faux",ar:"صح أم خطأ"},dig:{ru:"Раскопки",en:"Dig site",de:"Ausgrabung",es:"Excavación",pt:"Escavação",fr:"Fouilles",ar:"التنقيب"},puzzle:{ru:"Собери скелет",en:"Build the skeleton",de:"Skelett bauen",es:"Arma el esqueleto",pt:"Monta o esqueleto",fr:"Assemble le squelette",ar:"ركّب الهيكل العظمي"},jigsaw:{ru:"Пазл-история",en:"Story puzzle",de:"Geschichten-Puzzle",es:"Puzzle de historias",pt:"Puzzle de histórias",fr:"Puzzle d’histoires",ar:"أحجية القصص"},whack:{ru:"Поймай!",en:"Catch!",de:"Fang!",es:"¡Atrapa!",pt:"Apanha!",fr:"Attrape !",ar:"أمسك!"},quiz:{ru:"Квиз-блиц",en:"Quiz blitz",de:"Quiz-Blitz",es:"Quiz rápido",pt:"Quiz relâmpago",fr:"Quiz éclair",ar:"مسابقة سريعة"},duel:{ru:"Дуэль карт",en:"Card duel",de:"Kartenduell",es:"Duelo de cartas",pt:"Duelo de cartas",fr:"Duel de cartes",ar:"مبارزة البطاقات"},foodchain:{ru:"Цепь питания",en:"Food chain",de:"Nahrungskette",es:"Cadena alimenticia",pt:"Cadeia alimentar",fr:"Chaîne alimentaire",ar:"السلسلة الغذائية"},runner:{ru:"Побег",en:"Escape run",de:"Flucht",es:"Escape",pt:"Fuga",fr:"Fuite",ar:"الهروب"}};
  const GAME_WORD={ru:"Игра",en:"Game",de:"Spiel",es:"Juego",pt:"Jogo",fr:"Jeu",ar:"لعبة"};
  const GAME_ICON={dig:"⛏️",ispy:"🔍",puzzle:"🧩",jigsaw:"🧩",whack:"✋",word:"🔤",quiz:"⚡",duel:"🃏",foodchain:"🍃",runner:"🦖",shadow:"🌑",memory:"🎴",label:"🏷️",sort:"🗂️",timeline:"⏳",scale:"📏",glossary:"📖",truefalse:"❓"};
  /* круглые *-mark.webp из хаба (пути от book/reader.html) */
  const GAME_MARK={timeline:"hourglass",sort:"cards",memory:"cards",word:"blocks",glossary:"book",
    shadow:"cloud",puzzle:"puzzle",jigsaw:"puzzle",ispy:"magnifier",quiz:"scroll",truefalse:"scroll",
    dig:"amphora",label:"magnifier",duel:"cards",foodchain:"family",food:"family",
    runner:"cloud",scale:"hourglass",whack:"cloud"};
  const GAME_HINT={
    timeline:{ru:"Разложи героев по эпохам",en:"Sort heroes by era",de:"Helden nach Epochen ordnen",es:"Ordena héroes por época",pt:"Organiza heróis por época",fr:"Classe les héros par époques",ar:"رتّب الأبطال حسب الحقب"},
    sort:{ru:"Разложи по группам",en:"Sort into groups",de:"In Gruppen sortieren",es:"Ordena en grupos",pt:"Organiza por grupos",fr:"Classe par groupes",ar:"رتّب في مجموعات"},
    memory:{ru:"Найди одинаковые картинки",en:"Find matching pictures",de:"Finde passende Bilder",es:"Encuentra las parejas",pt:"Encontra os pares",fr:"Trouve les paires",ar:"ابحث عن الصور المتطابقة"},
    word:{ru:"Собери имя из букв",en:"Build the name from letters",de:"Baue den Namen aus Buchstaben",es:"Arma el nombre con letras",pt:"Monta o nome com letras",fr:"Assemble le nom avec des lettres",ar:"كوّن الاسم من الحروف"},
    glossary:{ru:"Узнай слова из историй",en:"Learn words from the stories",de:"Lerne Wörter aus den Geschichten",es:"Aprende palabras de las historias",pt:"Aprende palavras das histórias",fr:"Découvre les mots des histoires",ar:"تعرّف على كلمات القصص"},
    shadow:{ru:"Угадай по силуэту",en:"Guess from the silhouette",de:"Errate am Schatten",es:"Adivina por la silueta",pt:"Adivinha pela silhueta",fr:"Devine d'après la silhouette",ar:"خمّن من الظل"},
    puzzle:{ru:"Собери картинку",en:"Assemble the picture",de:"Baue das Bild",es:"Arma la imagen",pt:"Monta a imagem",fr:"Assemble l'image",ar:"ركّب الصورة"},
    jigsaw:{ru:"Собери картинку из кусочков",en:"Assemble the picture from pieces",de:"Setze das Bild aus Teilen zusammen",es:"Arma la imagen con las piezas",pt:"Monta a imagem com as peças",fr:"Assemble l’image avec les pièces",ar:"ركّب الصورة من القطع"},
    ispy:{ru:"Найди детали на картинке",en:"Find details in the picture",de:"Finde Details im Bild",es:"Encuentra detalles",pt:"Encontra detalhes",fr:"Trouve les détails",ar:"ابحث عن التفاصيل"},
    quiz:{ru:"Быстрые вопросы",en:"Quick questions",de:"Schnelle Fragen",es:"Preguntas rápidas",pt:"Perguntas rápidas",fr:"Questions rapides",ar:"أسئلة سريعة"},
    truefalse:{ru:"Правда или нет?",en:"True or false?",de:"Wahr oder falsch?",es:"¿Verdadero o falso?",pt:"Verdade ou mentira?",fr:"Vrai ou faux ?",ar:"صح أم خطأ؟"}
  };
  const SB_PLAY={ru:"Играть",en:"Play",de:"Spielen",es:"Jugar",pt:"Jogar",fr:"Jouer",ar:"العب"};
  const SB_FINISH={ru:"Готово!",en:"Done!",de:"Fertig!",es:"¡Listo!",pt:"Pronto!",fr:"Terminé !",ar:"تم!"};
  const SB_TO_MENU={ru:"К играм",en:"To games",de:"Zu den Spielen",es:"A los juegos",pt:"Para os jogos",fr:"Vers les jeux",ar:"إلى الألعاب"};
  const SB_HOW={ru:"Как играть",en:"How to play",de:"So spielt man",es:"Cómo jugar",pt:"Como jogar",fr:"Comment jouer",ar:"كيف تلعب"};
  const GAMES_TITLE={ru:"Игры книги",en:"Book games",de:"Buchspiele",es:"Juegos del libro",pt:"Jogos do livro",fr:"Jeux du livre",ar:"ألعاب الكتاب"};
  const GAMES_SUB={ru:"Выбери игру — нажми на неё",en:"Pick a game — tap it",de:"Wähle ein Spiel — tippe darauf",es:"Elige un juego — tócalo",pt:"Escolhe um jogo — toca nele",fr:"Choisis un jeu — appuie dessus",ar:"اختر لعبة — اضغط عليها"};
  const SB_SOON={ru:"скоро",en:"coming soon",de:"bald",es:"próximamente",pt:"em breve",fr:"bientôt",ar:"قريبًا"};
  const SB_INSTR_SIZE={ru:"Нажми, кого сравнить — увидишь, во сколько раз он больше тебя.",en:"Tap who to compare — and see how many times bigger it is than you.",de:"Tippe an, wen du vergleichen willst — und sieh, wie viel mal größer er ist als du.",es:"Toca a quién comparar y verás cuántas veces es más grande que tú.",pt:"Toca em quem comparar e vê quantas vezes é maior que tu.",fr:"Appuie sur celui à comparer — tu verras combien de fois il est plus grand que toi.",ar:"اضغط على من تريد مقارنته — وسترى كم مرة هو أكبر منك."};
  const SB_PICK_SIZE={ru:"Выбери, кого сравнить.",en:"Choose who to compare.",de:"Wähle, wen du vergleichen willst.",es:"Elige a quién comparar.",pt:"Escolhe quem comparar.",fr:"Choisis qui comparer.",ar:"اختر من تريد مقارنته."};
  const SB_INSTR_SORT={ru:"Нажми на карточку, потом на нужную корзину.",en:"Tap a card, then the right basket.",de:"Tippe eine Karte an, dann den richtigen Korb.",es:"Toca una carta y luego la cesta correcta.",pt:"Toca numa carta e depois no cesto certo.",fr:"Appuie sur une carte, puis sur le bon panier.",ar:"اضغط على بطاقة، ثم على السلة الصحيحة."};
  const SHADOW_INSTR={ru:"Перетащи каждого динозавра на его тень.",en:"Drag each dinosaur onto its shadow.",de:"Zieh jeden Dinosaurier auf seinen Schatten.",es:"Arrastra cada dinosaurio a su sombra.",pt:"Arrasta cada dinossauro para a sua sombra.",fr:"Fais glisser chaque dinosaure sur son ombre.",ar:"اسحب كل ديناصور إلى ظله."};
  const SHADOW_DONE={ru:"Молодец! Все тени нашлись.",en:"Well done! All shadows found.",de:"Super! Alle Schatten gefunden.",es:"¡Bien hecho! Todas las sombras.",pt:"Muito bem! Todas as sombras.",fr:"Bravo ! Toutes les ombres ont été trouvées.",ar:"أحسنت! عُثر على كل الظلال."};
  const SHADOW_PROG={ru:"Найдено: {c} из {n}.",en:"Found: {c} of {n}.",de:"Gefunden: {c} von {n}.",es:"Encontradas: {c} de {n}.",pt:"Encontradas: {c} de {n}.",fr:"Trouvées : {c} sur {n}.",ar:"تم العثور على: {c} من {n}."};
  const SHADOW_INSTR_HARD={ru:"Узнай динозавра по фото и перетащи его на его тень. Нажми на фото — увидишь крупнее.",en:"Recognise the dinosaur and drag it onto its shadow. Tap a photo to see it bigger.",de:"Erkenne den Dinosaurier und zieh ihn auf seinen Schatten. Tippe auf ein Foto, um es größer zu sehen.",es:"Reconoce al dinosaurio y arrástralo a su sombra. Toca una foto para verla más grande.",pt:"Reconhece o dinossauro e arrasta-o para a sua sombra. Toca numa foto para a veres maior.",fr:"Reconnais le dinosaure sur la photo et fais-le glisser sur son ombre. Appuie sur la photo — tu la verras en plus grand.",ar:"تعرّف على الديناصور من الصورة واسحبه إلى ظله. اضغط على الصورة لتراها أكبر."};
  const ZOOM_HINT={ru:"Нажми, чтобы закрыть",en:"Tap to close",de:"Tippe zum Schließen",es:"Toca para cerrar",pt:"Toca para fechar",fr:"Appuie pour fermer",ar:"اضغط للإغلاق"};
  const HINT_WORD={ru:"Подсказка",en:"Hint",de:"Tipp",es:"Pista",pt:"Dica",fr:"Indice",ar:"تلميح"};
  const DIG_INSTR={ru:"Расчищай породу пальцем — под ней спрятана окаменелость. ⛏ копает быстро, 🖌 — аккуратно.",en:"Clear the rock with your finger — a fossil is hidden below. ⛏ digs fast, 🖌 is gentle.",de:"Kratz das Gestein mit dem Finger frei — darunter versteckt sich ein Fossil. ⛏ gräbt schnell, 🖌 ist vorsichtig.",es:"Aparta la roca con el dedo: debajo se esconde un fósil. ⛏ excava rápido, 🖌 con cuidado.",pt:"Afasta a rocha com o dedo — por baixo esconde-se um fóssil. ⛏ escava rápido, 🖌 com cuidado.",fr:"Dégage la roche avec ton doigt — un fossile est caché en dessous. ⛏ creuse vite, 🖌 avec précaution.",ar:"أزل الصخر بإصبعك — تحته أحفورة مخبأة. ⛏ تحفر بسرعة، 🖌 برفق."};
  const DIG_PICK={ru:"Кирка",en:"Pick",de:"Spitzhacke",es:"Pico",pt:"Picareta",fr:"Pioche",ar:"المعول"};
  const DIG_BRUSH={ru:"Щётка",en:"Brush",de:"Pinsel",es:"Pincel",pt:"Pincel",fr:"Brosse",ar:"الفرشاة"};
  const DIG_WHO={ru:"Кто здесь спрятан?",en:"Who is hidden here?",de:"Wer versteckt sich hier?",es:"¿Quién se esconde aquí?",pt:"Quem está escondido aqui?",fr:"Qui est caché ici ?",ar:"من المخبأ هنا؟"};
  const DIG_FOUND={ru:"Это {name}!",en:"It's {name}!",de:"Das ist {name}!",es:"¡Es {name}!",pt:"É {name}!",fr:"C'est {name} !",ar:"إنه {name}!"};
  const DIG_NEXT={ru:"Копать дальше",en:"Keep digging",de:"Weitergraben",es:"Seguir excavando",pt:"Continuar a escavar",fr:"Continuer à creuser",ar:"تابع الحفر"};
  const DIG_PROG={ru:"Окаменелость {c} из {n}.",en:"Fossil {c} of {n}.",de:"Fossil {c} von {n}.",es:"Fósil {c} de {n}.",pt:"Fóssil {c} de {n}.",fr:"Fossile {c} sur {n}.",ar:"أحفورة {c} من {n}."};
  const DIG_DONE={ru:"Ты настоящий палеонтолог! Найдены все {n} окаменелостей.",en:"You are a real paleontologist! All {n} fossils found.",de:"Du bist ein echter Paläontologe! Alle {n} Fossilien gefunden.",es:"¡Eres un paleontólogo de verdad! ¡Los {n} fósiles encontrados!",pt:"És um verdadeiro paleontólogo! Todos os {n} fósseis encontrados.",fr:"Tu es un vrai paléontologue ! Les {n} fossiles ont tous été trouvés.",ar:"أنت عالم أحافير حقيقي! عُثر على كل الأحافير الـ {n}."};
  const DIG_MISS={ru:"Не он! Выбери другой вариант.",en:"Not that one! Pick another option.",de:"Nicht der! Wähle eine andere Option.",es:"¡Ese no! Elige otra opción.",pt:"Esse não! Escolhe outra opção.",fr:"Ce n'est pas lui ! Choisis une autre réponse.",ar:"ليس هو! اختر خيارًا آخر."};
  const PZ_INSTR={ru:"Нажми две плитки — они поменяются местами. Собери скелет целиком!",en:"Tap two tiles to swap them. Build the whole skeleton!",de:"Tippe zwei Kacheln an — sie tauschen die Plätze. Baue das ganze Skelett!",es:"Toca dos piezas y se intercambian. ¡Arma el esqueleto entero!",pt:"Toca em duas peças e elas trocam de lugar. Monta o esqueleto inteiro!",fr:"Appuie sur deux tuiles — elles échangeront leur place. Assemble le squelette en entier !",ar:"اضغط على قطعتين لتتبادلا مكانيهما. ركّب الهيكل العظمي كاملًا!"};
  const PZ_PEEK={ru:"Подсмотреть",en:"Peek",de:"Spicken",es:"Espiar",pt:"Espreitar",fr:"Jeter un œil",ar:"نظرة خاطفة"};
  const PZ_WIN={ru:"Скелет собран! Это {name}.",en:"Skeleton built! It's {name}.",de:"Skelett fertig! Das ist {name}.",es:"¡Esqueleto armado! Es {name}.",pt:"Esqueleto montado! É {name}.",fr:"Squelette assemblé ! C'est {name}.",ar:"اكتمل الهيكل العظمي! إنه {name}."};
  const PZ_PROG={ru:"Скелет {c} из {n}.",en:"Skeleton {c} of {n}.",de:"Skelett {c} von {n}.",es:"Esqueleto {c} de {n}.",pt:"Esqueleto {c} de {n}.",fr:"Squelette {c} sur {n}.",ar:"هيكل عظمي {c} من {n}."};
  const PZ_DONE={ru:"Все скелеты собраны! Ты мастер-палеонтолог.",en:"All skeletons built! You are a master paleontologist.",de:"Alle Skelette fertig! Du bist ein Meister-Paläontologe.",es:"¡Todos los esqueletos armados! Eres un maestro paleontólogo.",pt:"Todos os esqueletos montados! És um mestre paleontólogo.",fr:"Tous les squelettes sont assemblés ! Tu es un paléontologue expert.",ar:"اكتملت كل الهياكل العظمية! أنت عالم أحافير بارع."};
  const WK_PRED={ru:"Лови только хищников!",en:"Catch only the predators!",de:"Fang nur die Räuber!",es:"¡Atrapa solo a los depredadores!",pt:"Apanha só os predadores!",fr:"Attrape seulement les prédateurs !",ar:"أمسك المفترسات فقط!"};
  const WK_HERB={ru:"Лови только травоядных!",en:"Catch only the plant-eaters!",de:"Fang nur die Pflanzenfresser!",es:"¡Atrapa solo a los herbívoros!",pt:"Apanha só os herbívoros!",fr:"Attrape seulement les herbivores !",ar:"أمسك آكلات النباتات فقط!"};
  const WK_SCORE={ru:"Очки",en:"Score",de:"Punkte",es:"Puntos",pt:"Pontos",fr:"Points",ar:"النقاط"};
  const WK_RES={ru:"Время вышло! Твои очки: {s}.",en:"Time's up! Your score: {s}.",de:"Zeit um! Deine Punkte: {s}.",es:"¡Se acabó el tiempo! Tus puntos: {s}.",pt:"Acabou o tempo! Os teus pontos: {s}.",fr:"Le temps est écoulé ! Tes points : {s}.",ar:"انتهى الوقت! نقاطك: {s}."};
  const SR_INSTR={ru:"Чья это тень? Нажми на верный ответ.",en:"Whose shadow is it? Tap the right answer.",de:"Wessen Schatten ist das? Tippe die richtige Antwort an.",es:"¿De quién es la sombra? Toca la respuesta correcta.",pt:"De quem é a sombra? Toca na resposta certa.",fr:"À qui est cette ombre ? Appuie sur la bonne réponse.",ar:"لمن هذا الظل؟ اضغط على الإجابة الصحيحة."};
  const SR_ROUND={ru:"Тень",en:"Shadow",de:"Schatten",es:"Sombra",pt:"Sombra",fr:"Ombre",ar:"الظل"};
  const SR_STREAK={ru:"Серия",en:"Streak",de:"Serie",es:"Racha",pt:"Sequência",fr:"Série",ar:"سلسلة"};
  const SR_DONE={ru:"Готово! Лучшая серия: {b}.",en:"Done! Best streak: {b}.",de:"Fertig! Beste Serie: {b}.",es:"¡Listo! Mejor racha: {b}.",pt:"Pronto! Melhor sequência: {b}.",fr:"Terminé ! Meilleure série : {b}.",ar:"انتهى! أفضل سلسلة: {b}."};
  const QZ_INSTR={ru:"Правда или миф? Отвечай быстро — держи серию!",en:"True or myth? Answer fast — keep the streak!",de:"Wahr oder Mythos? Antworte schnell — halte die Serie!",es:"¿Verdad o mito? Responde rápido — ¡mantén la racha!",pt:"Verdade ou mito? Responde rápido — mantém a sequência!",fr:"Vrai ou mythe ? Réponds vite — garde ta série !",ar:"حقيقة أم خرافة؟ أجب بسرعة — حافظ على سلسلتك!"};
  const QZ_TRUE={ru:"Правда",en:"True",de:"Wahr",es:"Verdad",pt:"Verdade",fr:"Vrai",ar:"حقيقة"};
  const QZ_MYTH={ru:"Миф",en:"Myth",de:"Mythos",es:"Mito",pt:"Mito",fr:"Mythe",ar:"خرافة"};
  const QZ_RIGHT={ru:"Верно!",en:"Correct!",de:"Richtig!",es:"¡Correcto!",pt:"Certo!",fr:"Exact !",ar:"صحيح!"};
  const QZ_WRONG={ru:"Мимо!",en:"Wrong!",de:"Falsch!",es:"¡Fallo!",pt:"Errado!",fr:"Raté !",ar:"خطأ!"};
  const QZ_SCORE={ru:"Очки",en:"Score",de:"Punkte",es:"Puntos",pt:"Pontos",fr:"Points",ar:"النقاط"};
  const QZ_RES={ru:"Итог: {s} из {n}. Лучшая серия: {b}.",en:"Result: {s} of {n}. Best streak: {b}.",de:"Ergebnis: {s} von {n}. Beste Serie: {b}.",es:"Resultado: {s} de {n}. Mejor racha: {b}.",pt:"Resultado: {s} de {n}. Melhor sequência: {b}.",fr:"Résultat : {s} sur {n}. Meilleure série : {b}.",ar:"النتيجة: {s} من {n}. أفضل سلسلة: {b}."};
  const QZ_PRED={ru:"{n} был хищником.",en:"{n} was a predator.",de:"{n} war ein Räuber.",es:"{n} era un depredador.",pt:"{n} era um predador.",fr:"{n} était un prédateur.",ar:"{n} كان مفترسًا."};
  const QZ_HERB={ru:"{n} был травоядным.",en:"{n} was a plant-eater.",de:"{n} war ein Pflanzenfresser.",es:"{n} era herbívoro.",pt:"{n} era herbívoro.",fr:"{n} était un herbivore.",ar:"{n} كان آكل نباتات."};
  const QZ_BIG={ru:"{n} был длиннее 10 метров.",en:"{n} was longer than 10 metres.",de:"{n} war länger als 10 Meter.",es:"{n} medía más de 10 metros.",pt:"{n} tinha mais de 10 metros.",fr:"{n} mesurait plus de 10 mètres de long.",ar:"{n} كان أطول من 10 أمتار."};
  const DU_INSTR={ru:"Выбери, чем биться. Чьё число больше — забирает обе карты!",en:"Pick a stat to fight with. Higher number wins both cards!",de:"Wähle einen Wert zum Kämpfen. Die höhere Zahl gewinnt beide Karten!",es:"Elige con qué luchar. ¡El número mayor gana las dos cartas!",pt:"Escolhe com que atributo lutar. O número maior leva as duas cartas!",fr:"Choisis avec quoi te battre. Le plus grand nombre remporte les deux cartes !",ar:"اختر بأي رقم تتبارز. الرقم الأكبر يأخذ البطاقتين!"};
  const DU_YOU={ru:"Ты",en:"You",de:"Du",es:"Tú",pt:"Tu",fr:"Toi",ar:"أنت"};
  const DU_CPU={ru:"Соперник",en:"Rival",de:"Gegner",es:"Rival",pt:"Rival",fr:"Adversaire",ar:"الخصم"};
  const DU_SIZE={ru:"📏 Размер",en:"📏 Size",de:"📏 Größe",es:"📏 Tamaño",pt:"📏 Tamanho",fr:"📏 Taille",ar:"📏 الحجم"};
  const DU_AGE={ru:"🕒 Древность",en:"🕒 Age",de:"🕒 Alter",es:"🕒 Antigüedad",pt:"🕒 Antiguidade",fr:"🕒 Ancienneté",ar:"🕒 القِدَم"};
  const DU_M={ru:"м",en:"m",de:"m",es:"m",pt:"m",fr:"m",ar:"م"};
  const DU_MYA={ru:"млн",en:"mya",de:"Mio.",es:"M",pt:"M",fr:"Ma",ar:"مليون"};
  const DU_WIN={ru:"Твоя карта победила!",en:"Your card wins!",de:"Deine Karte gewinnt!",es:"¡Tu carta gana!",pt:"A tua carta ganha!",fr:"Ta carte a gagné !",ar:"بطاقتك فازت!"};
  const DU_LOSE={ru:"Соперник забрал карты.",en:"Rival takes the cards.",de:"Der Gegner nimmt die Karten.",es:"El rival se lleva las cartas.",pt:"O rival leva as cartas.",fr:"L'adversaire a pris les cartes.",ar:"أخذ الخصم البطاقتين."};
  const DU_TIE={ru:"Ничья — карты в банк!",en:"Tie — cards to the pot!",de:"Unentschieden — Karten in den Topf!",es:"Empate — ¡cartas al bote!",pt:"Empate — cartas para o bolo!",fr:"Égalité — les cartes vont au pot !",ar:"تعادل — البطاقتان إلى الكومة!"};
  const DU_NEXT={ru:"Дальше",en:"Next",de:"Weiter",es:"Siguiente",pt:"Seguinte",fr:"Suivant",ar:"التالي"};
  const DU_WON={ru:"🏆 Ты выиграл дуэль!",en:"🏆 You won the duel!",de:"🏆 Du hast das Duell gewonnen!",es:"🏆 ¡Ganaste el duelo!",pt:"🏆 Ganhaste o duelo!",fr:"🏆 Tu as gagné le duel !",ar:"🏆 لقد فزت بالمبارزة!"};
  const DU_LOST={ru:"Соперник выиграл. Ещё раз?",en:"Rival won. Try again?",de:"Der Gegner hat gewonnen. Nochmal?",es:"El rival ganó. ¿Otra vez?",pt:"O rival ganhou. Outra vez?",fr:"L'adversaire a gagné. On recommence ?",ar:"فاز الخصم. مرة أخرى؟"};
  const DU_DRAW={ru:"Ничья! Поровну карт.",en:"Draw! Cards are even.",de:"Unentschieden! Gleich viele Karten.",es:"¡Empate! Cartas iguales.",pt:"Empate! Cartas iguais.",fr:"Égalité ! Autant de cartes chacun.",ar:"تعادل! البطاقات متساوية."};
  const DU_ROUND={ru:"Раунд",en:"Round",de:"Runde",es:"Ronda",pt:"Ronda",fr:"Manche",ar:"الجولة"};
  const FC_INSTR={ru:"Собери цепь питания: растение → травоядный → хищник. Нажимай карточки по порядку.",en:"Build the food chain: plant → herbivore → predator. Tap the cards in order.",de:"Baue die Nahrungskette: Pflanze → Pflanzenfresser → Räuber. Tippe die Karten der Reihe nach an.",es:"Arma la cadena alimenticia: planta → herbívoro → depredador. Toca las cartas en orden.",pt:"Monta a cadeia alimentar: planta → herbívoro → predador. Toca nas cartas por ordem.",fr:"Assemble la chaîne alimentaire : plante → herbivore → prédateur. Appuie sur les cartes dans l'ordre.",ar:"كوّن السلسلة الغذائية: نبات → آكل نباتات → مفترس. اضغط على البطاقات بالترتيب."};
  const FC_PLANT={ru:"Растение",en:"Plant",de:"Pflanze",es:"Planta",pt:"Planta",fr:"Plante",ar:"نبات"};
  const FC_HERB={ru:"Травоядный",en:"Herbivore",de:"Pflanzenfresser",es:"Herbívoro",pt:"Herbívoro",fr:"Herbivore",ar:"آكل النباتات"};
  const FC_PRED={ru:"Хищник",en:"Predator",de:"Räuber",es:"Depredador",pt:"Predador",fr:"Prédateur",ar:"مفترس"};
  const FC_NEED={ru:"Сейчас в цепь нужен:",en:"Next in the chain:",de:"Als Nächstes:",es:"Ahora toca:",pt:"Agora falta:",fr:"Il manque maintenant dans la chaîne :",ar:"المطلوب الآن في السلسلة:"};
  const FC_DONE={ru:"🌿→🦕→🦖 Цепочка готова!",en:"🌿→🦕→🦖 Chain complete!",de:"🌿→🦕→🦖 Kette fertig!",es:"🌿→🦕→🦖 ¡Cadena lista!",pt:"🌿→🦕→🦖 Cadeia pronta!",fr:"🌿→🦕→🦖 Chaîne complète !",ar:"🌿→🦕→🦖 اكتملت السلسلة!"};
  const FC_ALL={ru:"Отлично! Все цепи собраны!",en:"Great! All chains built!",de:"Super! Alle Ketten gebaut!",es:"¡Genial! ¡Todas las cadenas!",pt:"Boa! Todas as cadeias!",fr:"Super ! Toutes les chaînes sont assemblées !",ar:"ممتاز! اكتملت كل السلاسل!"};
  const FC_NEXT={ru:"Следующая цепь",en:"Next chain",de:"Nächste Kette",es:"Siguiente cadena",pt:"Próxima cadeia",fr:"Chaîne suivante",ar:"السلسلة التالية"};
  const RN_INSTR={ru:"Динозавр убегает от астероида! Нажимай на экран, чтобы перепрыгивать камни.",en:"The dino flees the asteroid! Tap the screen to jump over rocks.",de:"Der Dino flieht vor dem Asteroiden! Tippe auf den Bildschirm, um über Felsen zu springen.",es:"¡El dino huye del asteroide! Toca la pantalla para saltar las rocas.",pt:"O dino foge do asteroide! Toca no ecrã para saltar as rochas.",fr:"Le dinosaure fuit l'astéroïde ! Appuie sur l'écran pour sauter par-dessus les rochers.",ar:"الديناصور يهرب من الكويكب! اضغط على الشاشة لتقفز فوق الصخور."};
  const RN_TAP={ru:"Нажми, чтобы бежать",en:"Tap to run",de:"Tippen zum Loslaufen",es:"Toca para correr",pt:"Toca para correr",fr:"Appuie pour courir",ar:"اضغط لتجري"};
  const RN_JUMP={ru:"Нажимай — прыжок!",en:"Tap to jump!",de:"Tippen zum Springen!",es:"¡Toca para saltar!",pt:"Toca para saltar!",fr:"Appuie — un saut !",ar:"اضغط — اقفز!"};
  const RN_OVER={ru:"Пойман! 🔥",en:"Caught! 🔥",de:"Erwischt! 🔥",es:"¡Atrapado! 🔥",pt:"Apanhado! 🔥",fr:"Attrapé ! 🔥",ar:"أُمسك! 🔥"};
  const RN_DIST={ru:"Пробежка",en:"Distance",de:"Strecke",es:"Distancia",pt:"Distância",fr:"Distance",ar:"المسافة"};
  const RN_BEST={ru:"Рекорд",en:"Best",de:"Rekord",es:"Récord",pt:"Recorde",fr:"Record",ar:"الأفضل"};
  const RN_M={ru:"м",en:"m",de:"m",es:"m",pt:"m",fr:"m",ar:"م"};
  const ISPY_FIND={ru:"Найди:",en:"Find:",de:"Finde:",es:"Encuentra:",pt:"Encontra:",fr:"Trouve :",ar:"ابحث عن:"};
  const ISPY_PROG={ru:"Найдено: {c} из {n}.",en:"Found: {c} of {n}.",de:"Gefunden: {c} von {n}.",es:"Encontrados: {c} de {n}.",pt:"Encontrados: {c} de {n}.",fr:"Trouvées : {c} sur {n}.",ar:"تم العثور على: {c} من {n}."};
  const ISPY_DONE={ru:"Молодец! Ты нашёл всё.",en:"Well done! You found everything.",de:"Super! Du hast alles gefunden.",es:"¡Bien! Lo encontraste todo.",pt:"Muito bem! Encontraste tudo.",fr:"Bravo ! Tu as tout trouvé.",ar:"أحسنت! لقد وجدت كل شيء."};
  const ISPY_ALL={ru:"Найдено всё: {n} из {n}.",en:"All found: {n} of {n}.",de:"Alles gefunden: {n} von {n}.",es:"Todo encontrado: {n} de {n}.",pt:"Tudo encontrado: {n} de {n}.",fr:"Tout trouvé : {n} sur {n}.",ar:"تم العثور على الكل: {n} من {n}."};
  const ISPY_SCROLL={ru:"листай картинку в стороны",en:"scroll the picture sideways",de:"schiebe das Bild zur Seite",es:"desliza la imagen a los lados",pt:"desliza a imagem para os lados",fr:"fais défiler l'image sur les côtés",ar:"مرّر الصورة إلى الجانبين"};
  const TF_TRUE={ru:"Правда",en:"True",de:"Wahr",es:"Verdad",pt:"Verdade",fr:"Vrai",ar:"حقيقة"};
  const TF_FALSE={ru:"Неправда",en:"False",de:"Falsch",es:"Falso",pt:"Falso",fr:"Faux",ar:"خطأ"};
  const TF_RIGHT={ru:"Верно!",en:"Correct!",de:"Richtig!",es:"¡Correcto!",pt:"Certo!",fr:"Exact !",ar:"صحيح!"};
  const TF_WRONG={ru:"Не угадал.",en:"Not quite.",de:"Nicht ganz.",es:"Casi.",pt:"Quase.",fr:"Raté.",ar:"لم تُصب."};
  const TF_NEXT={ru:"Дальше",en:"Next",de:"Weiter",es:"Siguiente",pt:"Seguinte",fr:"Suivant",ar:"التالي"};
  const TF_DONE={ru:"Правильных ответов",en:"Correct answers",de:"Richtige Antworten",es:"Respuestas correctas",pt:"Respostas certas",fr:"Bonnes réponses",ar:"الإجابات الصحيحة"};
  const TF_AGAIN={ru:"Ещё раз",en:"Again",de:"Nochmal",es:"Otra vez",pt:"Outra vez",fr:"Encore",ar:"مرة أخرى"};
  const LVL_EASY={ru:"Легко",en:"Easy",de:"Leicht",es:"Fácil",pt:"Fácil",fr:"Facile",ar:"سهل"};
  const LVL_HARD={ru:"Сложно",en:"Hard",de:"Schwer",es:"Difícil",pt:"Difícil",fr:"Difficile",ar:"صعب"};
  const MEM_INSTR={ru:"Открывай карточки и находи одинаковые пары.",en:"Flip cards and find matching pairs.",de:"Dreh die Karten um und finde die Paare.",es:"Voltea las cartas y encuentra las parejas.",pt:"Vira as cartas e encontra os pares.",fr:"Retourne les cartes et trouve les paires identiques.",ar:"اقلب البطاقات وابحث عن الأزواج المتطابقة."};
  const MEM_PROG={ru:"Пары: {c} из {n}.",en:"Pairs: {c} of {n}.",de:"Paare: {c} von {n}.",es:"Parejas: {c} de {n}.",pt:"Pares: {c} de {n}.",fr:"Paires : {c} sur {n}.",ar:"الأزواج: {c} من {n}."};
  const MEM_DONE={ru:"Все пары найдены! Ходов: {m}.",en:"All pairs found! Moves: {m}.",de:"Alle Paare gefunden! Züge: {m}.",es:"¡Todas las parejas! Jugadas: {m}.",pt:"Todos os pares! Jogadas: {m}.",fr:"Toutes les paires trouvées ! Coups : {m}.",ar:"عُثر على كل الأزواج! عدد الحركات: {m}."};
  const WORD_INSTR={ru:"Открывай буквы — какие есть в названии? Как в «Поле чудес».",en:"Reveal letters — which are in the name? Like Wheel of Fortune.",de:"Öffne Buchstaben — welche sind im Namen? Wie beim Glücksrad.",es:"Descubre letras: ¿cuáles están en el nombre? Como la ruleta de la fortuna.",pt:"Abre letras — quais estão no nome? Como na roda da sorte.",fr:"Découvre les lettres — lesquelles sont dans le nom ? Comme à « La Roue de la fortune ».",ar:"اكشف الحروف — أيها موجود في الاسم؟ مثل لعبة عجلة الحظ."};
  const WORD_PROG={ru:"Слово {c} из {n}.",en:"Word {c} of {n}.",de:"Wort {c} von {n}.",es:"Palabra {c} de {n}.",pt:"Palavra {c} de {n}.",fr:"Mot {c} sur {n}.",ar:"الكلمة {c} من {n}."};
  const WORD_DONE={ru:"Молодец! Все слова собраны.",en:"Well done! All words built.",de:"Super! Alle Wörter gebildet.",es:"¡Bien hecho! Todas las palabras.",pt:"Muito bem! Todas as palavras.",fr:"Bravo ! Tous les mots sont trouvés.",ar:"أحسنت! اكتملت كل الكلمات."};
  const LABEL_INSTR={ru:"Перетащи название на нужную часть.",en:"Drag each name to the right part.",de:"Zieh jeden Namen auf den richtigen Teil.",es:"Arrastra cada nombre a la parte correcta.",pt:"Arrasta cada nome para a parte certa.",fr:"Fais glisser chaque nom sur la bonne partie.",ar:"اسحب الاسم إلى الجزء الصحيح."};
  const LABEL_PROG={ru:"Подписано: {c} из {n}.",en:"Labeled: {c} of {n}.",de:"Beschriftet: {c} von {n}.",es:"Etiquetadas: {c} de {n}.",pt:"Nomeadas: {c} de {n}.",fr:"Nommées : {c} sur {n}.",ar:"تم التسمية: {c} من {n}."};
  const LABEL_DONE={ru:"Готово! Все части подписаны.",en:"Done! All parts labeled.",de:"Fertig! Alle Teile beschriftet.",es:"¡Listo! Todas las partes.",pt:"Pronto! Todas as partes.",fr:"Terminé ! Toutes les parties sont nommées.",ar:"انتهى! تمت تسمية كل الأجزاء."};
  const TOC_WORD={ru:"Содержание",en:"Contents",de:"Inhalt",es:"Contenido",pt:"Conteúdo",fr:"Sommaire",ar:"المحتويات"};
  const SORT_DONE={ru:"Молодец! Все на своих местах.",en:"Well done! Everyone is in place.",de:"Gut gemacht! Alle sind am Platz.",es:"¡Bien hecho! Todos en su lugar.",pt:"Muito bem! Todos no lugar.",fr:"Bravo ! Tout est à sa place.",ar:"أحسنت! الكل في مكانه."};
  const SORT_PROG={ru:"Верно: {c} из {n}.",en:"Correct: {c} of {n}.",de:"Richtig: {c} von {n}.",es:"Correctos: {c} de {n}.",pt:"Corretos: {c} de {n}.",fr:"Correct : {c} sur {n}.",ar:"صحيح: {c} من {n}."};
  const FAM_WORD={ru:"Семья",en:"Family",de:"Familie",es:"Familia",pt:"Família",fr:"Famille",ar:"العائلة"};
  const KIND_WORD={you:{ru:"человек",en:"human",de:"Mensch",es:"persona",pt:"pessoa",fr:"humain",ar:"إنسان"},herb:{ru:"травоядный",en:"plant-eater",de:"Pflanzenfresser",es:"herbívoro",pt:"herbívoro",fr:"herbivore",ar:"آكل النباتات"},pred:{ru:"хищник",en:"predator",de:"Räuber",es:"depredador",pt:"predador",fr:"prédateur",ar:"مفترس"}};
  const PLACEHOLDER_TXT={ru:"страница ещё не сгенерирована",en:"page not generated yet",de:"Seite noch nicht erstellt",es:"página aún no generada",pt:"página ainda não gerada",fr:"page pas encore générée",ar:"الصفحة لم تُنشأ بعد"};

  const stage=document.getElementById("stage"), counter=document.getElementById("counter"),
        playBtn=document.getElementById("play"), langsBox=document.getElementById("langs"),
        factBadge=document.getElementById("factBadge"), widgetBar=document.getElementById("widgetBar"),
        sheet=document.getElementById("sheet"), bubble=document.getElementById("bubble"),
        device=document.querySelector(".device"),
        navbar=document.getElementById("navbar"), scrub=document.getElementById("scrub"),
        scrubTrack=document.getElementById("scrubTrack"), scrubFill=document.getElementById("scrubFill"),
        scrubThumb=document.getElementById("scrubThumb");

  BOOK.languages.forEach(code=>{
    const b=document.createElement("button");
    b.className="lang"; b.textContent=(BOOK.labels&&BOOK.labels[code])||code.toUpperCase();
    b.setAttribute("aria-pressed", code===lang);
    b.onclick=()=>{ lang=code; localStorage.setItem(LANG_KEY,code);
      applyDir();
      [...langsBox.children].forEach(c=>c.setAttribute("aria-pressed", c===b));
      stopRead(); rerender(); };
    langsBox.appendChild(b);
  });

  function T(o){
    if(!o) return "";
    if(typeof o==="string") return o;
    if(o[lang]!=null && String(o[lang]).trim()!=="") return o[lang];
    if(o.ru!=null && String(o.ru).trim()!=="") return o.ru;
    var fallback=BOOK.languages&&BOOK.languages[0];
    if(fallback && o[fallback]!=null && String(o[fallback]).trim()!=="") return o[fallback];
    for(var k in o){ if(Object.prototype.hasOwnProperty.call(o,k) && o[k]!=null && String(o[k]).trim()!=="") return o[k]; }
    return "";
  }
  function escapeHtml(s){return String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));}

  /* один персистентный <audio> на всю книгу: iOS WKWebView разрешает
     программный play() только элементу, уже «разблокированному» жестом
     пользователя. Первый тап по ▶ разблокирует плеер, дальше на авто-
     перелистывании меняем только src — звук стартует без нового жеста. */
  let playToken=0;
  function player(){ if(!audioEl){ audioEl=new Audio(); audioEl.preload="auto"; } return audioEl; }
  function stopAudio(){ playToken++; if(audioEl){ audioEl.onended=null; audioEl.onerror=null; audioEl.pause(); } stopKaraoke();
    if(window.speechSynthesis) speechSynthesis.cancel(); clearHighlight(); playBtn.classList.remove("is-on"); }
  let readMode=false, readTimer=null;
  /* караоке для mp3: точных таймингов слов нет, поэтому оцениваем — озвучка
     дословно повторяет текст страницы, значит доля слова во времени клипа ≈
     его доля в длине текста (плюс константа на слово и небольшие поля клипа) */
  let karaokeRaf=0;
  function stopKaraoke(){ if(karaokeRaf){ cancelAnimationFrame(karaokeRaf); karaokeRaf=0; } }
  /* доля каждого слова во времени клипа ≈ его доля в длине текста
     (константа на слово + небольшой запас) — общий расчёт для mp3 и синтеза */
  function wordStarts(){
    const weights=wordSpans.map(w=>Math.max(2,(w.el.textContent||"").length)+2.2);
    const total=weights.reduce((a,b)=>a+b,0)||1;
    const starts=[]; let acc=0; for(const w of weights){ starts.push(acc/total); acc+=w; }
    return starts;
  }
  function paintWord(starts, f){
    let idx=-1; for(let k=0;k<starts.length;k++){ if(starts[k]<=f) idx=k; else break; }
    if(f>=1) idx=starts.length-1;
    wordSpans.forEach((w,k)=>w.el.classList.toggle("spoken", k===idx));
  }
  /* караоке по реальному mp3: ведём подсветку от audio.currentTime */
  function startKaraoke(audio, tok){
    stopKaraoke(); if(!wordSpans.length) return;
    const starts=wordStarts();
    function tick(){
      if(tok!==playToken){ stopKaraoke(); return; }
      const dur=audio.duration;
      if(isFinite(dur)&&dur>0){
        const lead=0.15, tail=0.35;
        const f=Math.max(0,audio.currentTime-lead)/Math.max(0.001,dur-lead-tail);
        paintWord(starts, f);
      }
      karaokeRaf=requestAnimationFrame(tick);
    }
    karaokeRaf=requestAnimationFrame(tick);
  }
  /* караоке + авто-переход без mp3 (языки без озвучки): и подсветку, и конец
     чтения ведём от оценочных часов, не от событий синтеза — onboundary/onend
     в iOS WKWebView ненадёжны или не приходят вовсе. */
  function estimateDuration(text){
    const chars=(text||"").replace(/\s+/g," ").trim().length;
    return Math.max(1.8, chars/12.5 + 0.6); // ~12–13 симв/с при rate .9 + поле
  }
  function startEstimatedRead(text, tok){
    stopKaraoke();
    const durMs=estimateDuration(text)*1000, t0=nowMs();
    const starts=wordSpans.length?wordStarts():null;
    function tick(){
      if(tok!==playToken){ stopKaraoke(); return; }
      const f=(nowMs()-t0)/durMs;
      if(starts) paintWord(starts, f);
      if(f>=1){ stopKaraoke(); clearHighlight(); afterRead(); return; }
      karaokeRaf=requestAnimationFrame(tick);
    }
    karaokeRaf=requestAnimationFrame(tick);
  }
  function nowMs(){ return (window.performance&&performance.now)?performance.now():+new Date(); }
  function playCurrent(){ stopAudio(); const page=BOOK.pages[i], src=page.audio&&page.audio[lang];
    playBtn.classList.add("is-on");
    if(src){ const a=player(), tok=playToken;
      a.onended=()=>{ if(tok!==playToken) return; stopKaraoke(); clearHighlight(); afterRead(); };
      a.onerror=()=>{ if(tok!==playToken) return; speak(page.text[lang]); };
      a.src=src;
      a.play().then(()=>{ if(tok===playToken) startKaraoke(a, tok); })
              .catch(()=>{ if(tok===playToken) speak(page.text[lang]); });
    } else speak(page.text[lang]); }
  function afterRead(){ if(readMode){ scheduleStep(); } else { playBtn.classList.remove("is-on"); } }
  function scheduleStep(){ if(readTimer) clearTimeout(readTimer);
    readTimer=setTimeout(()=>{ readTimer=null; if(!readMode) return;
      if(i>=BOOK.pages.length-1){ stopRead(); }
      else { i++; render(); playCurrent(); } }, 2000); }
  function startRead(){ readMode=true; playBtn.classList.add("is-on"); playCurrent(); }
  function stopRead(){ readMode=false; if(readTimer){ clearTimeout(readTimer); readTimer=null; } stopAudio(); }
  /* без mp3: караоке и авто-переход ведёт оценочный таймер (работает на всех
     языках и в WKWebView), синтез — по возможности как звук поверх, без опоры
     на его события. Так «нечитаемые» языки ведут себя как русский с mp3. */
  function speak(text){
    const tok=playToken;
    startEstimatedRead(text, tok);
    if(window.speechSynthesis){
      try{
        const u=new SpeechSynthesisUtterance(text);
        u.lang={ru:"ru-RU",en:"en-US",de:"de-DE",es:"es-ES",pt:"pt-BR",fr:"fr-FR",ar:"ar-SA"}[lang]||lang; u.rate=.9;
        speechSynthesis.speak(u);
      }catch(e){}
    }
  }
  function clearHighlight(){ wordSpans.forEach(w=>w.el.classList.remove("spoken")); }

  // fixed font size per layout (longest text across all pages+languages)
  function computeSizes(){
    const n=stage.querySelector(".narration"); if(!n) return;
    const savedLayout=stage.dataset.layout, savedHTML=n.innerHTML, byLayout={};
    BOOK.pages.forEach(p=>{ const L=p.layout||"top"; (byLayout[L]=byLayout[L]||[]).push(p); });
    for(const L in byLayout){
      const cfg=FIT[L]||FIT.top; stage.dataset.layout=L; const cap=stage.clientHeight*cfg.max; let size=cfg.start;
      for(; size>cfg.min; size-=1){ let ok=true;
        for(const p of byLayout[L]){ for(const lg of BOOK.languages){
            n.innerHTML=(p.text[lg]||"").split(/\n\s*\n/).map(s=>`<p>${escapeHtml(s)}</p>`).join("");
            n.style.fontSize=size+"px"; if(n.offsetHeight>cap){ok=false;break;} } if(!ok)break; }
        if(ok) break; }
      sizeByLayout[L]=size;
    }
    stage.dataset.layout=savedLayout; n.innerHTML=savedHTML;
    // восстановление через innerHTML создаёт новые элементы — пересобрать
    // ссылки караоке, иначе подсветка ходит по отсоединённым спанам
    wordSpans=[...n.querySelectorAll(".w")].map(el=>({i:+el.dataset.i, el}));
  }
  function fitText(){ const n=stage.querySelector(".narration"); if(!n) return;
    if(device.classList.contains("landscape")){ n.style.fontSize="23px"; return; }
    const L=stage.dataset.layout, cfg=FIT[L]||FIT.top; n.style.fontSize=(sizeByLayout[L]||cfg.start)+"px"; }

  // Словарь терминов книги: приносится в BOOK.termForms/BOOK.termMeta
  // (стемы по языкам + карточка термина); фолбэк — встроенный словарь
  // «Динозавров» (первая книга движка, данные исторически жили здесь).
  var TERM_FORMS=(BOOK.termForms)||{"палеонтолог": {"ru": ["палеонтолог"], "en": ["paleontolog"], "de": ["paläontolog", "palaontolog"], "es": ["paleontólog", "paleontolog"], "pt": ["paleontólog", "paleontolog"]}, "окаменелост": {"ru": ["окаменелост", "ископаем"], "en": ["fossil"], "de": ["fossil"], "es": ["fósil", "fosil"], "pt": ["fóssil", "fossil"]}, "хищник": {"ru": ["хищник", "хищн"], "en": ["predator"], "de": ["räuber", "rauber"], "es": ["depredador"], "pt": ["predador"]}, "травояд": {"ru": ["травояд"], "en": ["herbivor"], "de": ["pflanzenfress"], "es": ["herbívor", "herbivor"], "pt": ["herbívor", "herbivor"]}, "завропод": {"ru": ["завропод"], "en": ["sauropod"], "de": ["sauropod"], "es": ["saurópod", "sauropod"], "pt": ["saurópod", "sauropod"]}, "теропод": {"ru": ["теропод"], "en": ["theropod"], "de": ["theropod"], "es": ["terópod", "teropod"], "pt": ["terópod", "teropod"]}, "гребень": {"ru": ["гребн", "гребен"], "en": ["crest"], "de": ["kamm"], "es": ["cresta"], "pt": ["crista"]}, "панцир": {"ru": ["панцир"], "en": ["armour", "armor"], "de": ["panzer"], "es": ["armadura"], "pt": ["armadura"]}, "вымир": {"ru": ["вымир"], "en": ["extinct"], "de": ["aussterb"], "es": ["extin"], "pt": ["extin"]}, "раскопк": {"ru": ["раскопк"], "en": ["excavat"], "de": ["ausgrab"], "es": ["excav"], "pt": ["escav"]}};
  var TERM_META=(BOOK.termMeta)||{"палеонтолог": {"term": {"ru": "палеонтолог", "en": "paleontologist", "de": "Paläontologe", "es": "paleontólogo", "pt": "paleontólogo"}, "note": {"ru": "учёный, который ищет и изучает окаменелости", "en": "a scientist who finds and studies fossils", "de": "Forscher, der Fossilien findet und erforscht", "es": "científico que busca y estudia fósiles", "pt": "cientista que procura e estuda fósseis"}}, "окаменелост": {"term": {"ru": "окаменелость", "en": "fossil", "de": "Fossil", "es": "fósil", "pt": "fóssil"}, "note": {"ru": "остатки древнего существа, ставшие камнем", "en": "remains of an ancient creature turned to stone", "de": "zu Stein gewordene Reste eines Urzeitwesens", "es": "restos de un ser antiguo vueltos piedra", "pt": "restos de um ser antigo tornados pedra"}}, "хищник": {"term": {"ru": "хищник", "en": "predator", "de": "Räuber", "es": "depredador", "pt": "predador"}, "note": {"ru": "животное, которое охотится на других", "en": "an animal that hunts other animals", "de": "Tier, das andere Tiere jagt", "es": "animal que caza a otros", "pt": "animal que caça outros"}}, "травояд": {"term": {"ru": "травоядный", "en": "herbivore", "de": "Pflanzenfresser", "es": "herbívoro", "pt": "herbívoro"}, "note": {"ru": "животное, которое ест только растения", "en": "an animal that eats only plants", "de": "Tier, das nur Pflanzen frisst", "es": "animal que solo come plantas", "pt": "animal que só come plantas"}}, "завропод": {"term": {"ru": "завропод", "en": "sauropod", "de": "Sauropode", "es": "saurópodo", "pt": "saurópode"}, "note": {"ru": "огромный травоядный на четырёх ногах с длинной шеей", "en": "a huge four-legged plant-eater with a long neck", "de": "riesiger vierbeiniger Pflanzenfresser mit langem Hals", "es": "enorme herbívoro de cuatro patas y cuello largo", "pt": "enorme herbívoro de quatro patas e pescoço longo"}}, "теропод": {"term": {"ru": "теропод", "en": "theropod", "de": "Theropode", "es": "terópodo", "pt": "terópode"}, "note": {"ru": "динозавр на двух ногах; почти все хищники", "en": "a dinosaur on two legs; almost all predators", "de": "zweibeiniger Dinosaurier; fast alle Räuber", "es": "dinosaurio de dos patas; casi todos depredadores", "pt": "dinossauro de duas patas; quase todos predadores"}}, "гребень": {"term": {"ru": "гребень", "en": "crest", "de": "Kamm", "es": "cresta", "pt": "crista"}, "note": {"ru": "вырост на голове", "en": "a crest on the head", "de": "ein Kamm auf dem Kopf", "es": "una cresta en la cabeza", "pt": "uma crista na cabeça"}}, "панцир": {"term": {"ru": "панцирь", "en": "armour", "de": "Panzer", "es": "armadura", "pt": "armadura"}, "note": {"ru": "костяная броня на спине", "en": "bony armour on the back", "de": "Knochenpanzer auf dem Rücken", "es": "armadura de hueso en el lomo", "pt": "armadura de osso nas costas"}}, "вымир": {"term": {"ru": "вымирание", "en": "extinction", "de": "Aussterben", "es": "extinción", "pt": "extinção"}, "note": {"ru": "когда вид исчезает навсегда", "en": "when a species disappears forever", "de": "wenn eine Art für immer verschwindet", "es": "cuando una especie desaparece para siempre", "pt": "quando uma espécie desaparece para sempre"}}, "раскопк": {"term": {"ru": "раскопки", "en": "excavation", "de": "Ausgrabung", "es": "excavación", "pt": "escavação"}, "note": {"ru": "работа: осторожно откапывать окаменелости", "en": "carefully digging out fossils", "de": "vorsichtiges Ausgraben von Fossilien", "es": "excavar con cuidado los fósiles", "pt": "escavar com cuidado os fósseis"}}};
  function termHit(word){
    var stems=(BOOK.pages[i].terms)||[]; if(!stems.length) return null;
    var w=word.toLowerCase().replace(/[^a-zа-яё\u00c0-\u017f-]/g,"");
    for(var s=0;s<stems.length;s++){ var st=stems[s], forms=(TERM_FORMS[st]||{})[lang]||[];
      for(var k=0;k<forms.length;k++){ if(w.indexOf(forms[k])===0) return st; } }
    return null;
  }
  function renderText(){
    const t=BOOK.pages[i].text[lang]||"";
    let html=""; const re=/(\S+)|(\s+)/g; let m;
    while((m=re.exec(t))){
      if(m[1]){ const st=termHit(m[1]);
        html+=`<span class="w${st?" term":""}" data-i="${m.index}"${st?` data-term="${st}"`:""}>${escapeHtml(m[1])}</span>`;
      } else html+=escapeHtml(m[2]).replace(/\n/g,"<br>");
    }
    const n=stage.querySelector(".narration");
    if(n){ n.innerHTML=html;
      wordSpans=[...n.querySelectorAll(".w")].map(el=>({i:+el.dataset.i, el})); }
    fitText();
  }

  function renderWidgets(page){
    factBadge.innerHTML="";
    if(page.badge){ const num=T(page.badge.num), cap=T(page.badge.cap);
      factBadge.innerHTML=`<span class="num">${escapeHtml(num)}</span>`+(cap?`<span class="cap">${escapeHtml(cap)}</span>`:""); }
    widgetBar.innerHTML="";
    (page.footnotes||[]).forEach(fn=>{ const b=document.createElement("button");
      b.className="chip"; b.innerHTML=`<span class="star">★</span>${escapeHtml(T(fn.term))}`;
      b.onclick=()=>openFootnote(fn,b); widgetBar.appendChild(b); });
    if(page.quiz){ const b=document.createElement("button");
      b.className="chip quiz"; b.textContent=QUIZ_LABEL[lang]||"Quiz";
      b.onclick=()=>openQuiz(page.quiz,b); widgetBar.appendChild(b); }
    if(page.sandbox){ const sb=page.sandbox; const type=(typeof sb==="string")?sb:sb.type;
      const b=document.createElement("button");
      b.className="chip sandbox";
      b.innerHTML = (type==="glossary") ? `<span class="pl">▶</span>${T(SANDBOX_LABEL[type])}`
        : `<span class="pl">▶</span>${T(GAME_WORD)} · ${SANDBOX_LABEL[type]?T(SANDBOX_LABEL[type]):type}`;
      b.onclick=()=>launchSandbox(sb,b); widgetBar.appendChild(b); }
    (page.sandboxes||[]).forEach(sb=>{ const type=(typeof sb==="string")?sb:sb.type;
      const b=document.createElement("button");
      const chipLabel=(typeof sb==="object"&&sb.chip)?T(sb.chip):(SANDBOX_LABEL[type]?T(SANDBOX_LABEL[type]):type);
      b.className="chip sandbox"; b.innerHTML=`<span class="pl">▶</span>${T(GAME_WORD)} · ${chipLabel}`;
      b.onclick=()=>launchSandbox(sb,b); widgetBar.appendChild(b); });
    const hs=document.getElementById("hotspots"); hs.innerHTML="";
    (page.hotspots||[]).forEach(h=>{ const d=document.createElement("button");
      d.className="hotspot"; d.style.left=h.x+"%"; d.style.top=h.y+"%";
      d.setAttribute("aria-label",T(h.label)); d.onclick=()=>(h.targets?openMapSpot(h,d):openLabel(T(h.label),d)); hs.appendChild(d); });
    const tl=document.getElementById("timeline"); tl.innerHTML="";
    const tlGame=page.sandbox&&(typeof page.sandbox==="object");
    tl.style.pointerEvents=tlGame?"auto":"";
    (page.timeline||[]).forEach(p=>{ const b=document.createElement("button");
      const yr=(p.year&&typeof p.year==="object")?T(p.year):p.year;
      b.className="tl-pt"+(tlGame?" tl-play":""); b.innerHTML=`<span class="tl-dot"></span><span class="tl-year">${escapeHtml(yr)}</span>`;
      b.onclick=tlGame?(()=>launchSandbox(page.sandbox,b)):(()=>openLabel(T(p.label),b)); tl.appendChild(b); });
    (page.compare||[]).forEach(c=>{ const b=document.createElement("button");
      b.className="chip compare"; b.innerHTML=`<span class="approx">≈</span>${escapeHtml(T(c.ref))}`;
      b.onclick=()=>openCompare(c,b); widgetBar.appendChild(b); });
    const fam=document.getElementById("family"); fam.innerHTML="";
    if(page.family){ const b=document.createElement("button");
      b.className="chip famchip"; b.textContent=T(FAM_WORD);
      b.onclick=()=>openFamily(page.family,b); widgetBar.appendChild(b); }
  }
  function openLabel(text,anchor){ bubble.className="bubble";
    bubble.innerHTML=`<p class="note">${escapeHtml(text)}</p>`; openBubble(anchor); }
  function openTermBubble(meta,anchor){ bubble.className="bubble term-bubble";
    bubble.innerHTML=`<p class="note"><b class="term-w">${escapeHtml(T(meta.term))}</b> — ${escapeHtml(T(meta.note))}</p>`; openBubble(anchor); }
  document.addEventListener("click",function(ev){ var el=ev.target&&ev.target.closest?ev.target.closest(".w.term"):null;
    if(!el) return; ev.stopPropagation(); ev.preventDefault();
    var meta=TERM_META[el.dataset.term]; if(meta) openTermBubble(meta, el); }, true);
  function goTo(n){ const ni=n-1; if(ni<0||ni>=BOOK.pages.length) return; i=ni; stopRead(); closeBubble(); render(); }
  function openMapSpot(h,anchor){
    if(h.mapcard&&h.targets&&h.targets.length){ bubble.className="bubble mapcard";
      let html=`<p class="mc-h">${escapeHtml(T(h.label))}</p><div class="mc-grid">`;
      h.targets.forEach(t=>{ html+=`<button class="mc-dino" data-n="${t.n}"><img src="${t.photo}" alt=""><span>${escapeHtml(T(t.name))}</span></button>`; });
      html+=`</div>`; bubble.innerHTML=html;
      [...bubble.querySelectorAll(".mc-dino")].forEach(btn=>{ btn.onclick=e=>{ e.stopPropagation(); goTo(+btn.dataset.n); }; });
      openBubble(anchor); return; }
    bubble.className="bubble mapspot";
    let html=`<p class="note">${escapeHtml(T(h.label))}</p>`;
    if(h.targets&&h.targets.length){ html+=`<div class="spot-go">`;
      h.targets.forEach(t=>{ html+=`<button class="go-dino" data-n="${t.n}">${escapeHtml(T(t.name))} <span class="arr">\u2192</span></button>`; });
      html+=`</div>`; }
    bubble.innerHTML=html;
    [...bubble.querySelectorAll(".go-dino")].forEach(btn=>{ btn.onclick=e=>{ e.stopPropagation(); goTo(+btn.dataset.n); }; });
    openBubble(anchor); }
  function openFamily(fam,anchor){ bubble.className="bubble famcard";
    let html=`<p class="fam-h">${escapeHtml(T(fam.title))}</p><div class="fam-list">`;
    (fam.members||[]).forEach(m=>{ const nm=escapeHtml(T(m.name));
      if(m.here){ html+=`<div class="fam-item here">${nm}<span class="fam-tag">${escapeHtml(HERE[lang]||"")}</span></div>`; }
      else if(m.goto){ html+=`<button class="fam-item go" data-n="${m.goto}">${nm} <span class="arr">\u2192</span></button>`; }
      else { html+=`<div class="fam-item">${nm}</div>`; } });
    html+=`</div>`; bubble.innerHTML=html;
    [...bubble.querySelectorAll(".fam-item.go")].forEach(btn=>{ btn.onclick=e=>{ e.stopPropagation(); goTo(+btn.dataset.n); }; });
    openBubble(anchor); }
  let bubbleAnchor=null;
  function openFootnote(fn,anchor){ bubble.className="bubble";
    bubble.innerHTML=`<p class="term">${escapeHtml(T(fn.term))}</p><p class="note">${escapeHtml(T(fn.note))}</p>`;
    openBubble(anchor); }
  function openQuiz(q,anchor){ bubble.className="bubble quiz";
    bubble.innerHTML=`<p class="q">${escapeHtml(T(q.q))}</p><p class="a">${escapeHtml(T(q.a))}</p>`+
      `<span class="flip">↻</span>`;
    bubble.onclick=()=>{ bubble.classList.toggle("revealed"); place(); };
    openBubble(anchor); }
  function openCompare(c,anchor){ bubble.className="bubble";
    bubble.innerHTML=`<p class="cmp">${escapeHtml(T(c.note))}</p>`; openBubble(anchor); }
  function launchSandbox(sb,anchor){ const type=(typeof sb==="string")?sb:sb.type;
    if(type==="scale" && typeof sb==="object"){ stopAudio(); openScaleSandbox(sb); }
    else if((type==="sort"||type==="timeline") && typeof sb==="object"){ stopAudio(); openSortSandbox(sb); }
    else if(type==="shadow" && typeof sb==="object"){ stopAudio(); openShadowSandbox(sb); }
    else if(type==="memory" && typeof sb==="object"){ stopAudio(); openMemorySandbox(sb); }
    else if(type==="word" && typeof sb==="object"){ stopAudio(); openWordSandbox(sb); }
    else if(type==="label" && typeof sb==="object"){ stopAudio(); openLabelSandbox(sb); }
    else if(type==="glossary" && typeof sb==="object"){ stopAudio(); openGlossarySandbox(sb); }
    else if(type==="ispy" && typeof sb==="object"){ stopAudio(); openIspySandbox(sb); }
    else if(type==="truefalse" && typeof sb==="object"){ stopAudio(); openTrueFalseSandbox(sb); }
    else if(type==="dig" && typeof sb==="object"){ stopAudio(); openDigSandbox(sb); }
    else if(type==="puzzle" && typeof sb==="object"){ stopAudio(); openPuzzleSandbox(sb); }
    else if(type==="jigsaw" && typeof sb==="object"){
      stopAudio();
      if(typeof window.BibleJigsawOpen==="function"){
        window.BibleJigsawOpen({T:T,escapeHtml:escapeHtml,showSbIntro:showSbIntro,showSbFinish:showSbFinish}, sb);
      }
    }
    else if(type==="whack" && typeof sb==="object"){ stopAudio(); openWhackSandbox(sb); }
    else if(type==="quiz" && typeof sb==="object" && sb.items){ stopAudio(); openQuizSandbox(sb); }
    else if(type==="duel" && typeof sb==="object"){ stopAudio(); openDuelSandbox(sb); }
    else if(type==="foodchain" && typeof sb==="object" && sb.chains){ stopAudio(); openFoodchainSandbox(sb); }
    else if(type==="runner"){ stopAudio(); openRunnerSandbox(typeof sb==="object"?sb:{}); }
    else { bubble.className="bubble";
      bubble.innerHTML=`<p class="note">«${SANDBOX_LABEL[type]?T(SANDBOX_LABEL[type]):type}» — ${T(SB_SOON)}.</p>`; openBubble(anchor); } }

  /* Модалки инструкции / финала для sandbox-игр (нужны jigsaw и др.) */
  function sbModalHost(layer){
    let m=layer.querySelector(".sb-modal");
    if(!m){ m=document.createElement("div"); m.className="sb-modal"; m.hidden=true; layer.appendChild(m); }
    return m;
  }
  function hideSbModal(layer){ const m=layer.querySelector(".sb-modal"); if(m) m.hidden=true; }
  function showSbModal(layer, opts){
    const m=sbModalHost(layer);
    m.hidden=false;
    const score=opts.score!=null && opts.score!=="" ? '<div class="sb-m-score">'+escapeHtml(String(opts.score))+'</div>' : "";
    const ico=opts.icon ? '<div class="sb-m-ico" aria-hidden="true">'+opts.icon+'</div>' : "";
    const sec=opts.secondary ? '<button type="button" class="sec" id="sbMSec">'+escapeHtml(opts.secondary)+'</button>' : "";
    m.innerHTML='<div class="sb-modal-card" role="dialog" aria-modal="true">'+ico
      +'<h2>'+escapeHtml(opts.title||"")+'</h2>'+score
      +'<p>'+escapeHtml(opts.text||"")+'</p>'
      +'<div class="sb-modal-actions">'+sec
      +'<button type="button" class="pri" id="sbMPri">'+escapeHtml(opts.primary||T(SB_PLAY))+'</button>'
      +'</div></div>';
    m.querySelector("#sbMPri").onclick=function(){ m.hidden=true; if(opts.onPrimary) opts.onPrimary(); };
    const secBtn=m.querySelector("#sbMSec");
    if(secBtn) secBtn.onclick=function(){ m.hidden=true; if(opts.onSecondary) opts.onSecondary(); };
    return m;
  }
  function sbCloseToMenu(layer){
    hideSbModal(layer);
    layer.hidden=true;
  }
  function showSbIntro(layer, data, instr, onStart){
    const type=(data&&data.type)||"";
    showSbModal(layer, {
      icon: GAME_ICON[type]||"🎮",
      title: T((data&&(data.title||data.chip))||SB_HOW),
      text: T(instr||SB_HOW),
      primary: T(SB_PLAY),
      onPrimary: onStart
    });
  }
  function showSbFinish(layer, data, opts){
    opts=opts||{};
    const again=function(){ hideSbModal(layer); if(opts.onAgain) opts.onAgain(); };
    showSbModal(layer, {
      icon:"🎉",
      title: T(SB_FINISH),
      score: opts.score,
      text: opts.text||"",
      primary: T(TF_AGAIN),
      secondary: (typeof GAMES_MODE!=="undefined" && GAMES_MODE) ? T(SB_TO_MENU) : null,
      onPrimary: again,
      onSecondary: function(){ sbCloseToMenu(layer); }
    });
  }

  function plural(n){ const a=n%10,b=n%100; if(a===1&&b!==11)return "ребёнок"; if(a>=2&&a<=4&&(b<10||b>=20))return "ребёнка"; return "детей"; }
  function openScaleSandbox(data){
    const layer=document.getElementById("sandboxLayer");
    const you=data.you||{name:{ru:"Ты"},value:1.3};
    const items=data.items||[]; const unit=data.unit||"м";
    const sel=new Set(items.length?[items.length-1]:[]); let last=[...sel][0];
    layer.innerHTML=`<div class="sb-head"><span class="t">${escapeHtml(T(data.title||{ru:"Сравни размеры"}))}</span><button class="x" id="sbX" aria-label="Закрыть">×</button></div>
      <div class="sb-instr">${T(SB_INSTR_SIZE)}</div>
      <div class="sb-pick" id="sbPick"></div>
      <div class="sb-stage"><div id="sbRows" style="display:flex;flex-direction:column;gap:9px;padding-bottom:6px;width:100%"></div></div>
      <div class="sb-readout" id="sbReadout"></div>`;
    const pick=layer.querySelector("#sbPick"), rowsEl=layer.querySelector("#sbRows"), readout=layer.querySelector("#sbReadout");
    items.forEach((it,idx)=>{ const b=document.createElement("button");
      b.className=(it.kind==="herb"?"herb ":"")+(sel.has(idx)?"on":""); b.textContent=T(it.name);
      b.onclick=()=>{ if(sel.has(idx)) sel.delete(idx); else { sel.add(idx); last=idx; }
        b.classList.toggle("on"); draw(); };
      pick.appendChild(b); });
    function rowEl(d,kind,maxV){ const r=document.createElement("div"); r.className="sb-row";
      const pct=Math.max(8, d.value/maxV*100); const times=Math.max(1,Math.round(d.value/you.value));
      const sil=d.sil?`<img class="sb-sil" src="${d.sil}" alt="">`:"";
      r.innerHTML=`<div class="lab">${escapeHtml(T(d.name))}<small>${T(KIND_WORD[kind]||KIND_WORD.pred)}</small></div>
        <div class="sb-track"><div class="sb-bar ${kind}" style="width:0%">${sil}</div></div>
        <div class="val">${d.value} ${unit}${kind!=="you"?`<small>×${times}</small>`:""}</div>`;
      requestAnimationFrame(()=>{ r.querySelector(".sb-bar").style.width=pct+"%"; }); return r; }
    function draw(){ const chosen=[...sel].map(i=>items[i]).sort((a,b)=>a.value-b.value);
      const all=[{node:you,kind:"you"}].concat(chosen.map(it=>({node:it,kind:it.kind||"herb"})));
      const maxV=Math.max(you.value,...chosen.map(it=>it.value),0.001);
      rowsEl.innerHTML=""; all.forEach(o=>rowsEl.appendChild(rowEl(o.node,o.kind,maxV)));
      if(chosen.length){ const d=(items[last]&&sel.has(last))?items[last]:chosen[chosen.length-1];
        const times=Math.round(d.value/you.value);
        readout.innerHTML=`<span><b>${escapeHtml(T(d.name))}</b> — ${d.value} ${unit}, это ≈ <b>${times}</b> ${plural(times)} в длину!</span>`;
      } else readout.textContent=T(SB_PICK_SIZE); }
    layer.querySelector("#sbX").onclick=()=>{ layer.hidden=true; };
    layer.hidden=false; draw();
  }
  /* «Чья тень?» (переделана): показываем большую тень-силуэт и 3 имени —
     узнай, чей это силуэт. Серия правильных подряд (streak). */
  function openShadowSandbox(data){
    const layer=document.getElementById("sandboxLayer");
    function shuf(a){ a=a.slice(); for(let k=a.length-1;k>0;k--){ const j=Math.floor(Math.random()*(k+1)); const t=a[k]; a[k]=a[j]; a[j]=t; } return a; }
    const pool=(data.items||[]).filter(it=>it.sil);
    let rounds=shuf(pool), idx=0, streak=0, best=0, busy=false;
    const N=rounds.length;
    layer.innerHTML=`<div class="sb-head"><span class="t">${escapeHtml(T(data.title||{ru:"Чья тень?"}))}</span><button class="x" id="sbX" aria-label="Закрыть">×</button></div>
      <div class="sb-instr">${T(SR_INSTR)}</div>
      <div class="gq-hud"><span>${T(SR_ROUND)} <b id="srR">1</b>/${N}</span><span class="sc">🔥 ${T(SR_STREAK)}: <b id="srS">0</b></span></div>
      <div class="gq-stage"><div class="gq-sil"><img id="srSil" alt=""></div><div class="gq-opts" id="srOpts"></div></div>
      <div class="sb-readout" id="srReadout"></div>`;
    const silEl=layer.querySelector("#srSil"), optsEl=layer.querySelector("#srOpts"),
          rEl=layer.querySelector("#srR"), sEl=layer.querySelector("#srS"), readout=layer.querySelector("#srReadout");
    function options(correct){ const others=shuf(pool.filter(x=>T(x.name)!==T(correct.name))).slice(0,2); return shuf([correct].concat(others)); }
    function draw(){ const it=rounds[idx]; busy=false; rEl.textContent=idx+1; silEl.src=it.sil;
      optsEl.innerHTML=options(it).map(o=>'<button data-ok="'+(T(o.name)===T(it.name)?1:0)+'">'+escapeHtml(T(o.name))+'</button>').join("");
      [...optsEl.querySelectorAll("button")].forEach(b=>b.onclick=()=>pick(b)); }
    function pick(b){ if(busy) return; busy=true;
      if(b.dataset.ok==="1"){ b.classList.add("good"); streak++; if(streak>best)best=streak; sEl.textContent=streak; setTimeout(next,600); }
      else { b.classList.add("bad"); streak=0; sEl.textContent=0;
        [...optsEl.querySelectorAll("button")].forEach(x=>{ x.disabled=true; if(x.dataset.ok==="1")x.classList.add("good"); });
        setTimeout(next,1100); } }
    function next(){ idx++; if(idx>=N) done(); else draw(); }
    function done(){ silEl.removeAttribute("src");
      optsEl.innerHTML='<button class="good" id="srAgain">'+T(TF_AGAIN)+'</button>';
      readout.innerHTML='<span><b>'+escapeHtml(T(SR_DONE).replace("{b}",String(best)))+'</b></span>';
      optsEl.querySelector("#srAgain").onclick=()=>{ rounds=shuf(pool); idx=0; streak=0; best=0; sEl.textContent=0; draw(); readout.innerHTML=""; }; }
    layer.querySelector("#sbX").onclick=()=>{ layer.hidden=true; };
    layer.hidden=false; draw();
  }
  /* «Квиз-блиц»: авто-генерированные утверждения из фактов (хищник/травоядный/
     размер) — «Правда или миф», очки и серия правильных. */
  function openQuizSandbox(data){
    const layer=document.getElementById("sandboxLayer");
    function shuf(a){ a=a.slice(); for(let k=a.length-1;k>0;k--){ const j=Math.floor(Math.random()*(k+1)); const t=a[k]; a[k]=a[j]; a[j]=t; } return a; }
    const sp=data.items||[];
    // строим пул утверждений: у каждого вида — про класс и про размер
    let pool=[];
    sp.forEach(function(it){
      const kindT = it.kind==="pred" ? QZ_PRED : QZ_HERB;   // истинное про класс
      pool.push({ txt:T(kindT).replace("{n}",T(it.name)), ans:true, hero:it.hero });
      const otherT = it.kind==="pred" ? QZ_HERB : QZ_PRED;  // ложное про класс
      pool.push({ txt:T(otherT).replace("{n}",T(it.name)), ans:false, hero:it.hero });
      pool.push({ txt:T(QZ_BIG).replace("{n}",T(it.name)), ans:it.size>10, hero:it.hero });
    });
    let qs=shuf(pool).slice(0, Math.min(12, pool.length)), qi=0, score=0, streak=0, best=0, busy=false;
    layer.innerHTML=`<div class="sb-head"><span class="t">${escapeHtml(T(data.title||{ru:"Квиз-блиц"}))}</span><button class="x" id="sbX" aria-label="Закрыть">×</button></div>
      <div class="sb-instr">${T(QZ_INSTR)}</div>
      <div class="gq-hud"><span class="sc">${T(QZ_SCORE)}: <b id="qzSc">0</b></span><span>🔥 <b id="qzSt">0</b></span><span id="qzN"></span></div>
      <div class="gq-stage"><img class="gq-photo" id="qzImg" alt=""><div class="gq-stmt" id="qzStmt"></div>
        <div class="gq-opts row" id="qzOpts"></div></div>
      <div class="sb-readout" id="qzReadout"></div>`;
    const imgEl=layer.querySelector("#qzImg"), stmtEl=layer.querySelector("#qzStmt"), optsEl=layer.querySelector("#qzOpts"),
          scEl=layer.querySelector("#qzSc"), stEl=layer.querySelector("#qzSt"), nEl=layer.querySelector("#qzN"), readout=layer.querySelector("#qzReadout");
    function draw(){ const q=qs[qi]; busy=false; nEl.textContent=(qi+1)+" / "+qs.length;
      imgEl.src=q.hero||""; stmtEl.textContent=q.txt; readout.innerHTML="";
      optsEl.innerHTML='<button data-v="1">'+T(QZ_TRUE)+'</button><button data-v="0">'+T(QZ_MYTH)+'</button>';
      [...optsEl.querySelectorAll("button")].forEach(b=>b.onclick=()=>answer(b, b.dataset.v==="1")); }
    function answer(b, val){ if(busy) return; busy=true; const q=qs[qi];
      const correct=(val===q.ans);
      [...optsEl.querySelectorAll("button")].forEach(x=>x.disabled=true);
      if(correct){ b.classList.add("good"); score++; streak++; if(streak>best)best=streak; }
      else { b.classList.add("bad"); streak=0;
        [...optsEl.querySelectorAll("button")].forEach(x=>{ if((x.dataset.v==="1")===q.ans) x.classList.add("good"); }); }
      scEl.textContent=score; stEl.textContent=streak;
      readout.innerHTML='<span style="color:'+(correct?"var(--green)":"var(--accent)")+'"><b>'+escapeHtml(T(correct?QZ_RIGHT:QZ_WRONG))+'</b></span>';
      setTimeout(function(){ qi++; if(qi>=qs.length) final(); else draw(); }, correct?650:1150); }
    function final(){ imgEl.removeAttribute("src"); stmtEl.textContent="";
      readout.innerHTML='<span><b>'+escapeHtml(T(QZ_RES).replace("{s}",String(score)).replace("{n}",String(qs.length)).replace("{b}",String(best)))+'</b></span>';
      optsEl.className="gq-opts"; optsEl.innerHTML='<button class="good">'+T(TF_AGAIN)+'</button>';
      optsEl.querySelector("button").onclick=function(){ qs=shuf(pool).slice(0,Math.min(12,pool.length)); qi=0; score=0; streak=0; best=0; scEl.textContent=0; stEl.textContent=0; optsEl.className="gq-opts row"; draw(); }; }
    layer.querySelector("#sbX").onclick=()=>{ layer.hidden=true; };
    layer.hidden=false; draw();
  }
  function openMemorySandbox(data){
    const layer=document.getElementById("sandboxLayer");
    const pairs=data.pairs||[];
    function shuf(a){ a=a.slice(); for(let k=a.length-1;k>0;k--){ const j=Math.floor(Math.random()*(k+1)); const t=a[k]; a[k]=a[j]; a[j]=t; } return a; }
    let deck=[]; pairs.forEach((p,pi)=>{ deck.push({pi:pi,name:p.name,sil:p.sil}); deck.push({pi:pi,name:p.name,sil:p.sil}); });
    deck=shuf(deck).map((c,i)=>{ c.id=i; return c; });
    let flipped=[], matched={}, lock=false, moves=0;
    layer.innerHTML=`<div class="sb-head"><span class="t">${escapeHtml(T(data.title||{ru:"Найди пару"}))}</span><button class="x" id="sbX" aria-label="Закрыть">×</button></div>
      <div class="sb-instr">${T(MEM_INSTR)}</div>
      <div class="mem-grid" id="memGrid"></div>
      <div class="sb-readout" id="memReadout"></div>`;
    const grid=layer.querySelector("#memGrid"), readout=layer.querySelector("#memReadout");
    function draw(){
      grid.innerHTML="";
      deck.forEach(c=>{ const up=matched[c.pi]||flipped.indexOf(c.id)>=0; const bt=document.createElement("button");
        bt.className="mem-card"+(up?" up":"")+(matched[c.pi]?" done":"");
        bt.innerHTML = up ? `<img src="${c.sil}" alt=""><span>${escapeHtml(T(c.name))}</span>` : `<span class="mem-back">?</span>`;
        bt.onclick=()=>flip(c);
        grid.appendChild(bt); });
      const done=Object.keys(matched).length, n=pairs.length;
      readout.innerHTML = (done===n) ? `<span><b>${escapeHtml(T(MEM_DONE)).replace("{m}",moves)}</b></span>`
        : `<span>${escapeHtml(T(MEM_PROG)).replace("{c}",done).replace("{n}",n)}</span>`;
    }
    function flip(c){ if(lock||matched[c.pi]||flipped.indexOf(c.id)>=0) return;
      flipped.push(c.id); draw();
      if(flipped.length===2){ moves++; lock=true;
        const x=deck[flipped[0]], y=deck[flipped[1]];
        if(x.pi===y.pi){ matched[x.pi]=true; flipped=[]; lock=false; draw(); }
        else { setTimeout(()=>{ flipped=[]; lock=false; draw(); }, 850); } }
    }
    layer.querySelector("#sbX").onclick=()=>{ layer.hidden=true; };
    layer.hidden=false; draw();
  }
  /* «Поле чудес»: слово — ряд закрытых клеток; открываешь буквы по одной —
     если буква есть в слове, вспыхивают все её клетки; лишняя буква гаснет.
     Открыл всё слово — силуэт «оживает» и следующее слово. */
  function openWordSandbox(data){
    const layer=document.getElementById("sandboxLayer");
    const items=data.items||[];
    function shuf(a){ a=a.slice(); for(let k=a.length-1;k>0;k--){ const j=Math.floor(Math.random()*(k+1)); const t=a[k]; a[k]=a[j]; a[j]=t; } return a; }
    // общий пул букв — из имён всех видов игры (язык-независимо)
    function lettersOf(s){ return (s||"").toUpperCase().replace(/[\s·-]/g,"").split(""); }
    const allLetters=(function(){ const set={}; items.forEach(it=>lettersOf(T(it.name)).forEach(c=>set[c]=1)); return Object.keys(set); })();
    let wi=0, target="", opened={}, keys=[], solved=false;
    layer.innerHTML=`<div class="sb-head"><span class="t">${escapeHtml(T(data.title||{ru:"Собери слово"}))}</span><button class="x" id="sbX" aria-label="Закрыть">×</button></div>
      <div class="sb-instr">${T(WORD_INSTR)}</div>
      <div class="wrd-hint" id="wrdHint" style="position:relative"></div>
      <div class="wrd-slots" id="wrdSlots"></div>
      <div class="wrd-bank" id="wrdBank"></div>
      <div class="sb-readout" id="wrdReadout"></div>`;
    const hintEl=layer.querySelector("#wrdHint"), slotsEl=layer.querySelector("#wrdSlots"), bankEl=layer.querySelector("#wrdBank"), readout=layer.querySelector("#wrdReadout");
    function load(){ const it=items[wi]; target=(T(it.name)||"").toUpperCase();
      const need={}; lettersOf(target).forEach(c=>need[c]=1); const needArr=Object.keys(need);
      const decoys=shuf(allLetters.filter(c=>!need[c])).slice(0, Math.max(3, 12-needArr.length));
      keys=shuf(needArr.concat(decoys));
      opened={}; solved=false; draw(); }
    function isSep(ch){ return /[\s·-]/.test(ch); }
    function draw(){ const it=items[wi];
      hintEl.innerHTML=`<img src="${it.sil}" alt="">`+(solved&&it.photo?`<img class="wrd-photo" src="${it.photo}" alt="" style="position:absolute;inset:0;margin:auto;width:150px;height:92px;object-fit:contain;border-radius:8px">`:"");
      slotsEl.className="wrd-slots"; slotsEl.innerHTML="";
      target.split("").forEach(ch=>{ if(isSep(ch)){ const sp=document.createElement("span"); sp.style.width="10px"; slotsEl.appendChild(sp); return; }
        const d=document.createElement("div"); const open=opened[ch]||solved;
        d.className="wrd-slot"+(open?" filled":"")+(solved?" ok":""); d.textContent=open?ch:"";
        slotsEl.appendChild(d); });
      bankEl.innerHTML="";
      keys.forEach(ch=>{ const b=document.createElement("button"); b.className="wrd-tile"+(opened[ch]?" correct":"")+(opened[ch]===false?" wrong":"");
        b.textContent=ch; b.onclick=()=>guess(ch,b); bankEl.appendChild(b); });
      readout.innerHTML = (solved && wi>=items.length-1) ? `<span><b>${escapeHtml(T(WORD_DONE))}</b></span>`
        : `<span>${escapeHtml(T(WORD_PROG)).replace("{c}",wi+1).replace("{n}",items.length)}</span>`; }
    function guess(ch,btn){ if(solved||ch in opened) return;
      const inWord=target.indexOf(ch)>=0;
      opened[ch]=inWord;
      if(inWord){ btn.classList.add("correct");
        // открыть все клетки этой буквы с «поп»-анимацией
        const cells=[...slotsEl.querySelectorAll(".wrd-slot")]; let ci=0;
        target.split("").forEach(c=>{ if(isSep(c)) return; const cell=cells[ci++]; if(c===ch){ cell.textContent=ch; cell.classList.add("filled","pop"); } });
        // победа?
        const allOpen=lettersOf(target).every(c=>opened[c]);
        if(allOpen){ solved=true; setTimeout(()=>{ draw();
          setTimeout(()=>{ if(wi<items.length-1){ wi++; load(); } }, 1100); }, 350); }
      } else { btn.classList.add("wrong"); slotsEl.classList.add("shake"); setTimeout(()=>slotsEl.classList.remove("shake"),350); }
    }
    layer.querySelector("#sbX").onclick=()=>{ layer.hidden=true; };
    layer.hidden=false; load();
  }
  function openLabelSandbox(data){
    const layer=document.getElementById("sandboxLayer");
    const parts=(data.parts||[]).map((p,i)=>({word:p.word,x:p.x,y:p.y,idx:i}));
    const img=data.image||((data.imageFrom&&BOOK.pages[data.imageFrom-1])?BOOK.pages[data.imageFrom-1].img:"");
    function shuf(a){ a=a.slice(); for(let k=a.length-1;k>0;k--){ const j=Math.floor(Math.random()*(k+1)); const t=a[k]; a[k]=a[j]; a[j]=t; } return a; }
    const bankOrder=shuf(parts), placed={}; const asp=data.aspect||1.4;
    layer.innerHTML=`<div class="sb-head"><span class="t">${escapeHtml(T(data.title||{ru:"Подпиши части"}))}</span><button class="x" id="sbX" aria-label="Закрыть">×</button></div>
      <div class="sb-instr">${T(LABEL_INSTR)}</div>
      <div class="lbl-stage"><div class="lbl-imgwrap" id="lblImg" style="padding-bottom:${(100/asp).toFixed(2)}%"><img src="${img}" alt=""></div></div>
      <div class="lbl-bank" id="lblBank"></div>
      <div class="sb-readout" id="lblReadout"></div>`;
    const imgWrap=layer.querySelector("#lblImg"), bankEl=layer.querySelector("#lblBank"), readout=layer.querySelector("#lblReadout");
    let dragIdx=null,dragEl=null,ghost=null,sx=0,sy=0,moved=false;
    function pinAt(x,y){ const el=document.elementFromPoint(x,y); return el?el.closest(".lbl-pin"):null; }
    function onMove(ev){ const dx=ev.clientX-sx, dy=ev.clientY-sy;
      if(!moved && Math.hypot(dx,dy)>6){ moved=true; ghost=dragEl?dragEl.cloneNode(true):null;
        if(ghost){ ghost.classList.add("lbl-ghost"); document.body.appendChild(ghost); dragEl.classList.add("drag-src"); } }
      if(moved && ghost){ ghost.style.left=ev.clientX+"px"; ghost.style.top=ev.clientY+"px";
        const pn=pinAt(ev.clientX,ev.clientY);
        imgWrap.querySelectorAll(".lbl-pin").forEach(s=>s.classList.toggle("over", s===pn && !s.classList.contains("done"))); }
      ev.preventDefault(); }
    function onUp(ev){ window.removeEventListener("pointermove",onMove); window.removeEventListener("pointerup",onUp); window.removeEventListener("pointercancel",onUp);
      if(ghost){ ghost.remove(); ghost=null; }
      imgWrap.querySelectorAll(".lbl-pin").forEach(s=>s.classList.remove("over"));
      if(moved){ const pn=pinAt(ev.clientX,ev.clientY);
        if(pn && !pn.classList.contains("done")){
          if(+pn.dataset.idx===dragIdx){ placed[dragIdx]=true; }
          else { pn.classList.add("wrong"); setTimeout(()=>{pn.classList.remove("wrong");},320); } } }
      dragIdx=null; dragEl=null; draw(); }
    function startDrag(idx,el,e){ dragIdx=idx; dragEl=el; sx=e.clientX; sy=e.clientY; moved=false;
      window.addEventListener("pointermove",onMove); window.addEventListener("pointerup",onUp); window.addEventListener("pointercancel",onUp); e.preventDefault(); }
    function draw(){
      imgWrap.querySelectorAll(".lbl-pin").forEach(n=>n.remove());
      parts.forEach(p=>{ const pin=document.createElement("div"); pin.className="lbl-pin"+(placed[p.idx]?" done":""); pin.dataset.idx=p.idx;
        pin.style.left=p.x+"%"; pin.style.top=p.y+"%";
        pin.innerHTML = placed[p.idx] ? `<span class="lbl-tag">${p.idx+1} · ${escapeHtml(T(p.word))}</span>` : `<span class="lbl-sq">${p.idx+1}</span>`;
        imgWrap.appendChild(pin); });
      // поставленная подпись не должна уезжать за края картинки — подвинем внутрь
      const wr=imgWrap.getBoundingClientRect();
      imgWrap.querySelectorAll(".lbl-pin.done .lbl-tag").forEach(tag=>{
        tag.style.transform=""; const tr=tag.getBoundingClientRect(); let dx=0,dy=0;
        if(tr.left<wr.left+4) dx=(wr.left+4)-tr.left; else if(tr.right>wr.right-4) dx=(wr.right-4)-tr.right;
        if(tr.top<wr.top+4) dy=(wr.top+4)-tr.top; else if(tr.bottom>wr.bottom-4) dy=(wr.bottom-4)-tr.bottom;
        if(dx||dy) tag.style.transform="translate("+Math.round(dx)+"px,"+Math.round(dy)+"px)";
      });
      bankEl.innerHTML="";
      bankOrder.filter(p=>!placed[p.idx]).forEach(p=>{ const b=document.createElement("button"); b.className="lbl-chip"; b.dataset.idx=p.idx; b.style.touchAction="none";
        b.textContent=T(p.word); b.addEventListener("pointerdown",e=>startDrag(p.idx,b,e)); bankEl.appendChild(b); });
      const c=Object.keys(placed).length, n=parts.length;
      readout.innerHTML = (c===n) ? `<span><b>${escapeHtml(T(LABEL_DONE))}</b></span>` : `<span>${escapeHtml(T(LABEL_PROG)).replace("{c}",c).replace("{n}",n)}</span>`; }
    layer.querySelector("#sbX").onclick=()=>{ layer.hidden=true; };
    layer.hidden=false;
    // подгон картинки под экран по фактическим размерам (слой игр не скроллится):
    // раскладываем банк слов, меряем свободное место внизу и отдаём его картинке
    // (или отбираем, если не влезло). padding-bottom-% зависит от ширины РОДИТЕЛЯ,
    // поэтому ширину и высоту задаём явно.
    draw();
    (function(){ const spare=layer.clientHeight - readout.getBoundingClientRect().bottom - 6;
      const curH=imgWrap.getBoundingClientRect().height;
      let newH=Math.max(180, Math.round(curH+spare));
      let w=Math.round(newH*asp);
      const maxW=imgWrap.parentNode.clientWidth-4;
      if(w>maxW){ w=maxW; newH=Math.round(w/asp); }
      imgWrap.style.width=w+"px"; imgWrap.style.maxWidth=w+"px";
      imgWrap.style.paddingBottom="0"; imgWrap.style.height=newH+"px"; })();
  }
  /* «Раскопки»: канвас-порода стирается пальцем (кирка/щётка), под ней
     окаменелость-силуэт в костяном цвете; при расчистке ≥55% — вопрос
     «кто это?», угадал — порода слетает и кроссфейд в живое фото вида. */
  function openDigSandbox(data){
    const layer=document.getElementById("sandboxLayer");
    function shuf(a){ a=a.slice(); for(let k=a.length-1;k>0;k--){ const j=Math.floor(Math.random()*(k+1)); const t=a[k]; a[k]=a[j]; a[j]=t; } return a; }
    const items=shuf(data.items||[]);
    const namePool=(data.decoys||[]).concat(items.map(it=>it.name));
    let lvl=0, tool="pick", quizDone=false, lastQuizAt=0, digging=false, px=0, py=0, stamps=0, revealed=0;
    layer.innerHTML=`<div class="sb-head"><span class="t">${escapeHtml(T(data.title||{ru:"Раскопки"}))}</span><button class="x" id="sbX" aria-label="Закрыть">×</button></div>
      <div class="sb-instr">${T(DIG_INSTR)}</div>
      <div class="dig-tools"><button class="sb-lv on" id="digPick">⛏ ${T(DIG_PICK)}</button><button class="sb-lv" id="digBrush">🖌 ${T(DIG_BRUSH)}</button></div>
      <div class="dig-stage"><div class="dig-wrap" id="digWrap">
        <canvas id="digBase"></canvas>
        <canvas id="digDirt" class="lay"></canvas>
        <canvas id="digFx" class="lay dig-fx"></canvas>
        <img class="dig-photo" id="digPhoto" alt="">
      </div><div class="dig-quiz" id="digQuiz" hidden></div></div>
      <div class="sb-readout" id="digReadout"></div>`;
    const wrap=layer.querySelector("#digWrap"), base=layer.querySelector("#digBase"),
          dirt=layer.querySelector("#digDirt"), fx=layer.querySelector("#digFx"),
          photo=layer.querySelector("#digPhoto"), quiz=layer.querySelector("#digQuiz"),
          readout=layer.querySelector("#digReadout"),
          bPick=layer.querySelector("#digPick"), bBrush=layer.querySelector("#digBrush");
    bPick.onclick=()=>{ tool="pick"; bPick.classList.add("on"); bBrush.classList.remove("on"); };
    bBrush.onclick=()=>{ tool="brush"; bBrush.classList.add("on"); bPick.classList.remove("on"); };
    // с готовыми сценами-скелетами (item.fossil, альбомные 4:3) холст ниже,
    // со старыми силуэтами — прежний портрет
    const W=Math.min(330, wrap.clientWidth||330),
          H=Math.round(W*((items[0]&&items[0].fossil)?0.75:1.2));
    [base,dirt,fx].forEach(c=>{ c.width=W; c.height=H; });
    const bctx=base.getContext("2d"), dctx=dirt.getContext("2d"), fctx=fx.getContext("2d");
    let fossilBox={x:0,y:0,w:W,h:H};
    function drawRock(){ const g=bctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,"#6b5138"); g.addColorStop(1,"#443021"); bctx.fillStyle=g; bctx.fillRect(0,0,W,H);
      for(let k=0;k<260;k++){ bctx.fillStyle="rgba("+(k%2?"20,12,6":"120,95,64")+","+(0.05+Math.random()*0.12)+")";
        const r=1+Math.random()*2.5; bctx.beginPath(); bctx.arc(Math.random()*W,Math.random()*H,r,0,7); bctx.fill(); } }
    function drawDirt(){ dctx.clearRect(0,0,W,H); dctx.globalCompositeOperation="source-over";
      const g=dctx.createLinearGradient(0,0,0,H); g.addColorStop(0,"#a97f4c"); g.addColorStop(.55,"#8f6a3d"); g.addColorStop(1,"#77552f");
      dctx.fillStyle=g; dctx.fillRect(0,0,W,H);
      for(let k=0;k<420;k++){ dctx.fillStyle="rgba("+(k%3?"60,40,20":"200,170,120")+","+(0.06+Math.random()*0.14)+")";
        const r=1+Math.random()*3; dctx.beginPath(); dctx.arc(Math.random()*W,Math.random()*H,r,0,7); dctx.fill(); }
      for(let k=0;k<26;k++){ dctx.fillStyle="rgba(70,50,28,"+(0.25+Math.random()*0.3)+")";
        dctx.beginPath(); dctx.ellipse(Math.random()*W,Math.random()*H,3+Math.random()*7,2+Math.random()*4,Math.random()*3,0,7); dctx.fill(); }
      dctx.strokeStyle="rgba(55,38,20,.35)"; dctx.lineWidth=1;
      for(let k=0;k<5;k++){ dctx.beginPath(); let x=Math.random()*W, y=Math.random()*H; dctx.moveTo(x,y);
        for(let s=0;s<5;s++){ x+=(Math.random()-.5)*70; y+=(Math.random()-.4)*46; dctx.lineTo(x,y); } dctx.stroke(); } }
    function drawFossil(cb){ const it=items[lvl]; const im=new Image();
      im.onload=function(){
        if(it.fossil){ // готовая сцена «скелет в породе» — на весь кадр (cover)
          const s=Math.max(W/im.naturalWidth, H/im.naturalHeight);
          const dw=im.naturalWidth*s, dh=im.naturalHeight*s;
          bctx.drawImage(im,(W-dw)/2,(H-dh)/2,dw,dh);
          // прогресс считаем по центральной полосе, где лежит скелет, иначе
          // вопрос выскакивает от расчистки пустых краёв, когда костей не видно
          fossilBox={x:W*0.08, y:H*0.28, w:W*0.84, h:H*0.5};
        } else { // легаси: силуэт тонируется в костяной цвет поверх нарисованной скалы
          const fw=W*0.8, fh=fw*(im.naturalHeight/im.naturalWidth);
          const fx0=(W-fw)/2, fy0=(H-fh)/2 - H*0.06; fossilBox={x:fx0,y:fy0,w:fw,h:fh};
          const osc=document.createElement("canvas"); osc.width=Math.ceil(fw); osc.height=Math.ceil(fh);
          const octx=osc.getContext("2d"); octx.drawImage(im,0,0,osc.width,osc.height);
          octx.globalCompositeOperation="source-in"; octx.fillStyle="#e9dcba"; octx.fillRect(0,0,osc.width,osc.height);
          bctx.save(); bctx.shadowColor="rgba(0,0,0,.55)"; bctx.shadowBlur=10;
          bctx.drawImage(osc,fx0,fy0); bctx.restore();
        }
        if(cb) cb(); };
      im.src=it.fossil||it.sil; }
    /* пыль от копания */
    let parts=[], rafOn=false;
    function boom(x,y,n,spread){ for(let k=0;k<n;k++) parts.push({x:x,y:y,vx:(Math.random()-.5)*(spread||3),vy:-Math.random()*2.4-0.4,l:14+Math.random()*12,c:Math.random()<.5?"#b08a55":"#7c5a33"});
      if(!rafOn){ rafOn=true; requestAnimationFrame(tick); } }
    function tick(){ fctx.clearRect(0,0,W,H); parts=parts.filter(p=>p.l>0);
      parts.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=0.18; p.l--; fctx.fillStyle=p.c; fctx.globalAlpha=Math.min(1,p.l/10);
        fctx.fillRect(p.x,p.y,2.5,2.5); }); fctx.globalAlpha=1;
      if(parts.length && !layer.hidden){ requestAnimationFrame(tick); } else { rafOn=false; fctx.clearRect(0,0,W,H); } }
    function stamp(x,y){ const r=(tool==="pick")?26:12;
      dctx.globalCompositeOperation="destination-out";
      const g=dctx.createRadialGradient(x,y,r*0.4,x,y,r); g.addColorStop(0,"rgba(0,0,0,1)"); g.addColorStop(1,"rgba(0,0,0,"+(tool==="pick"?0.9:0.55)+")");
      dctx.fillStyle=g; dctx.beginPath(); dctx.arc(x,y,r,0,7); dctx.fill();
      boom(x,y,tool==="pick"?4:2,tool==="pick"?4:2);
      if(++stamps%12===0) recount(); }
    function recount(){ const fb=fossilBox;
      const img=dctx.getImageData(Math.max(0,fb.x|0),Math.max(0,fb.y|0),Math.min(W-(fb.x|0),fb.w|0),Math.min(H-(fb.y|0),fb.h|0)).data;
      let clear=0,tot=0; for(let k=3;k<img.length;k+=24){ tot++; if(img[k]<70) clear++; }
      revealed=tot?clear/tot:0;
      if(!quizDone && quiz.hidden && revealed>=0.55 && revealed>=lastQuizAt+0.001) showQuiz(); }
    function toXY(ev){ const r=dirt.getBoundingClientRect(); return {x:(ev.clientX-r.left)*(W/r.width), y:(ev.clientY-r.top)*(H/r.height)}; }
    wrap.addEventListener("pointerdown",ev=>{ if(quizDone||!quiz.hidden&&ev.target.closest(".dig-quiz")) return;
      digging=true; try{wrap.setPointerCapture(ev.pointerId);}catch(e){}
      const p=toXY(ev); px=p.x; py=p.y; stamp(p.x,p.y); ev.preventDefault(); });
    wrap.addEventListener("pointermove",ev=>{ if(!digging) return; const p=toXY(ev);
      const d=Math.hypot(p.x-px,p.y-py), steps=Math.max(1,Math.round(d/8));
      for(let s=1;s<=steps;s++) stamp(px+(p.x-px)*s/steps, py+(p.y-py)*s/steps);
      px=p.x; py=p.y; ev.preventDefault(); });
    ["pointerup","pointercancel"].forEach(e=>wrap.addEventListener(e,()=>{ if(digging){ digging=false; recount(); } }));
    function options(){ const it=items[lvl];
      const wrong=shuf(namePool.filter(n=>T(n)!==T(it.name))).slice(0,2);
      return shuf([it.name].concat(wrong)); }
    function showQuiz(){ const it=items[lvl];
      quiz.innerHTML='<p class="q">'+T(DIG_WHO)+'</p><div class="opts">'+
        options().map(n=>'<button data-ok="'+(T(n)===T(it.name)?1:0)+'">'+escapeHtml(T(n))+'</button>').join("")+'</div>';
      quiz.hidden=false;
      let busy=false;
      [...quiz.querySelectorAll(".opts button")].forEach(b=>{
        const answer=e=>{ e.stopPropagation(); if(e.cancelable) e.preventDefault();
          if(busy||b.disabled) return; busy=true;
          if(b.dataset.ok==="1"){ b.classList.add("good"); setTimeout(win,180); }
          else {
            // неверно: гасим только эту кнопку, вопрос остаётся — выбирай другую
            b.classList.add("bad"); b.disabled=true; quiz.classList.add("wrong");
            readout.innerHTML='<span style="color:var(--accent)"><b>'+escapeHtml(T(DIG_MISS))+'</b></span>';
            setTimeout(()=>{ quiz.classList.remove("wrong"); busy=false; },380);
          } };
        b.addEventListener("pointerup",answer); b.addEventListener("click",answer);
      });
    }
    function win(){ const it=items[lvl]; quizDone=true;
      dctx.clearRect(0,0,W,H); boom(W/2,H/2,70,8);
      if(it.photo){ photo.src=it.photo; photo.classList.add("on"); }
      const last=(lvl+1>=items.length);
      quiz.innerHTML='<p class="q">'+escapeHtml(T(DIG_FOUND).replace("{name}",T(it.name)))+'</p>'+
        (last?'<p class="q" style="color:var(--green)">'+escapeHtml(T(DIG_DONE).replace("{n}",String(items.length)))+'</p>':'')+
        '<button class="dig-next">'+(last?T(TF_AGAIN):T(DIG_NEXT))+'</button>';
      quiz.hidden=false;
      quiz.querySelector(".dig-next").onclick=e=>{ e.stopPropagation();
        if(last){ lvl=0; } else { lvl++; } start(); };
      readout.innerHTML='<span><b>'+escapeHtml(T(DIG_PROG).replace("{c}",String(lvl+1)).replace("{n}",String(items.length)))+'</b></span>';
    }
    function start(){ quizDone=false; quiz.hidden=true; lastQuizAt=0; revealed=0; stamps=0;
      photo.classList.remove("on"); photo.removeAttribute("src");
      bctx.clearRect(0,0,W,H); drawRock(); drawFossil(function(){ drawDirt(); });
      readout.innerHTML='<span>'+escapeHtml(T(DIG_PROG).replace("{c}",String(lvl)).replace("{n}",String(items.length)))+'</span>'; }
    layer.querySelector("#sbX").onclick=()=>{ layer.hidden=true; };
    layer.hidden=false; start();
  }
  /* «Собери скелет»: пазл 3×3 из сцен-окаменелостей — тап по двум плиткам
     меняет их местами; 👁 подсматривает целую картинку; собрал — скелет
     «оживает» в фото вида. */
  function openPuzzleSandbox(data){
    const layer=document.getElementById("sandboxLayer");
    function shuf(a){ a=a.slice(); for(let k=a.length-1;k>0;k--){ const j=Math.floor(Math.random()*(k+1)); const t=a[k]; a[k]=a[j]; a[j]=t; } return a; }
    const items=shuf(data.items||[]);
    const N=3;
    let lvl=0, order=[], sel=-1, solved=false;
    layer.innerHTML=`<div class="sb-head"><span class="t">${escapeHtml(T(data.title||{ru:"Собери скелет"}))}</span><button class="x" id="sbX" aria-label="Закрыть">×</button></div>
      <div class="sb-instr">${T(PZ_INSTR)}</div>
      <div class="pz-tools"><button class="sb-lv" id="pzPeek">👁 ${T(PZ_PEEK)}</button></div>
      <div class="pz-stage"><div class="pz-wrap" id="pzWrap">
        <div class="pz-grid" id="pzGrid"></div>
        <div class="pz-full" id="pzFull"></div>
        <img class="pz-photo" id="pzPhoto" alt="">
      </div><div class="dig-quiz" id="pzWin" hidden></div></div>
      <div class="sb-readout" id="pzReadout"></div>`;
    const wrap=layer.querySelector("#pzWrap"), grid=layer.querySelector("#pzGrid"),
          full=layer.querySelector("#pzFull"), photo=layer.querySelector("#pzPhoto"),
          winEl=layer.querySelector("#pzWin"), readout=layer.querySelector("#pzReadout"),
          peek=layer.querySelector("#pzPeek");
    const W=Math.min(330, wrap.clientWidth||330), Hh=Math.round(W*0.75);
    wrap.style.height=Hh+"px";
    const cw=W/N, ch=Hh/N;
    // подглядывание: держишь — видишь целую картинку
    ["pointerdown"].forEach(e=>peek.addEventListener(e,ev=>{ ev.preventDefault(); wrap.classList.add("peek"); }));
    ["pointerup","pointercancel","pointerleave"].forEach(e=>peek.addEventListener(e,()=>wrap.classList.remove("peek")));
    function draw(){
      grid.innerHTML="";
      order.forEach((tile,pos)=>{ const d=document.createElement("div");
        d.className="pz-tile"+(pos===sel?" sel":"");
        d.style.width=cw+"px"; d.style.height=ch+"px";
        d.style.backgroundImage="url('"+items[lvl].img+"')";
        d.style.backgroundSize=W+"px "+Hh+"px";
        d.style.backgroundPosition=(-(tile%N)*cw)+"px "+(-(Math.floor(tile/N))*ch)+"px";
        d.onclick=()=>tap(pos);
        grid.appendChild(d); });
      readout.innerHTML='<span>'+escapeHtml(T(PZ_PROG).replace("{c}",String(lvl)).replace("{n}",String(items.length)))+'</span>';
    }
    function tap(pos){ if(solved) return;
      if(sel<0){ sel=pos; } else if(sel===pos){ sel=-1; }
      else { const t=order[sel]; order[sel]=order[pos]; order[pos]=t; sel=-1;
        if(order.every((v,i)=>v===i)) return win(); }
      draw(); }
    function win(){ solved=true; draw();
      const it=items[lvl];
      if(it.photo){ photo.src=it.photo; photo.classList.add("on"); }
      const last=(lvl+1>=items.length);
      winEl.innerHTML='<p class="q">'+escapeHtml(T(PZ_WIN).replace("{name}",T(it.name)))+'</p>'+
        (last?'<p class="q" style="color:var(--green)">'+escapeHtml(T(PZ_DONE))+'</p>':'')+
        '<button class="dig-next">'+(last?T(TF_AGAIN):T(DIG_NEXT))+'</button>';
      winEl.hidden=false;
      winEl.querySelector(".dig-next").onclick=e=>{ e.stopPropagation(); if(last) lvl=0; else lvl++; start(); };
      readout.innerHTML='<span><b>'+escapeHtml(T(PZ_PROG).replace("{c}",String(lvl+1)).replace("{n}",String(items.length)))+'</b></span>';
    }
    function start(){ solved=false; sel=-1; winEl.hidden=true;
      photo.classList.remove("on"); photo.removeAttribute("src");
      full.style.backgroundImage="url('"+items[lvl].img+"')";
      do { order=shuf([0,1,2,3,4,5,6,7,8]); } while(order.every((v,i)=>v===i));
      draw(); }
    layer.querySelector("#sbX").onclick=()=>{ layer.hidden=true; };
    layer.hidden=false; start();
  }
  /* «Поймай!»: вак-а-мол на реакцию — из нор выскакивают динозавры, лови
     только хищников (или травоядных), 45 секунд, очки за верные, штраф за
     промахи по «своим». */
  function openWhackSandbox(data){
    const layer=document.getElementById("sandboxLayer");
    function shuf(a){ a=a.slice(); for(let k=a.length-1;k>0;k--){ const j=Math.floor(Math.random()*(k+1)); const t=a[k]; a[k]=a[j]; a[j]=t; } return a; }
    const items=data.items||[];
    const ROUND=45;
    let task="pred", score=0, time=ROUND, cells=new Array(9).fill(null), spawnTimer=null, clockTimer=null, running=false;
    layer.innerHTML=`<div class="sb-head"><span class="t">${escapeHtml(T(data.title||{ru:"Поймай!"}))}</span><button class="x" id="sbX" aria-label="Закрыть">×</button></div>
      <div class="sb-instr" id="wkTask"></div>
      <div class="wk-hud"><span class="sc">${T(WK_SCORE)}: <b id="wkScore">0</b></span><span class="tm">⏱ <b id="wkTime">${ROUND}</b></span></div>
      <div class="wk-stage"><div class="wk-grid" id="wkGrid"></div><div class="dig-quiz" id="wkRes" hidden></div></div>
      <div class="sb-readout" id="wkReadout"></div>`;
    const grid=layer.querySelector("#wkGrid"), taskEl=layer.querySelector("#wkTask"),
          scEl=layer.querySelector("#wkScore"), tmEl=layer.querySelector("#wkTime"),
          resEl=layer.querySelector("#wkRes");
    for(let i=0;i<9;i++){ const c=document.createElement("div"); c.className="wk-hole"; c.dataset.i=i;
      c.innerHTML='<div class="wk-dino"><img alt=""></div><div class="leaf">🌿</div>';
      c.addEventListener("pointerdown",ev=>{ ev.preventDefault(); hit(i,c); });
      grid.appendChild(c); }
    function stopTimers(){ if(spawnTimer){clearInterval(spawnTimer);spawnTimer=null;} if(clockTimer){clearInterval(clockTimer);clockTimer=null;} }
    function hide(i){ const c=grid.children[i]; c.classList.remove("up"); cells[i]=null; }
    function hit(i,c){ if(!running) return; const it=cells[i]; if(!it) return;
      if(it.kind===task){ score++; c.classList.add("good"); setTimeout(()=>c.classList.remove("good"),250); }
      else { score=Math.max(0,score-1); c.classList.add("badhit"); setTimeout(()=>c.classList.remove("badhit"),320); }
      scEl.textContent=score; hide(i); }
    function spawn(){ if(layer.hidden){ stopTimers(); return; }
      const free=[]; cells.forEach((v,i)=>{ if(!v) free.push(i); });
      if(!free.length) return;
      const i=free[Math.floor(Math.random()*free.length)];
      const it=items[Math.floor(Math.random()*items.length)];
      cells[i]=it; const c=grid.children[i];
      c.querySelector("img").src=it.photo; c.classList.add("up");
      setTimeout(()=>{ if(cells[i]===it) hide(i); }, 1000);
    }
    function finish(){ running=false; stopTimers(); cells.forEach((v,i)=>hide(i));
      resEl.innerHTML='<p class="q">'+escapeHtml(T(WK_RES).replace("{s}",String(score)))+'</p>'+
        '<button class="dig-next">'+T(TF_AGAIN)+'</button>';
      resEl.hidden=false;
      resEl.querySelector(".dig-next").onclick=e=>{ e.stopPropagation(); start(); }; }
    function start(){ stopTimers(); score=0; time=ROUND; running=true; resEl.hidden=true;
      task=Math.random()<0.5?"pred":"herb";
      taskEl.innerHTML='<b>'+escapeHtml(T(task==="pred"?WK_PRED:WK_HERB))+'</b>';
      scEl.textContent="0"; tmEl.textContent=time;
      cells=new Array(9).fill(null);
      spawnTimer=setInterval(spawn, 620);
      clockTimer=setInterval(()=>{ if(layer.hidden){ stopTimers(); return; }
        time--; tmEl.textContent=time; if(time<=0) finish(); }, 1000); }
    layer.querySelector("#sbX").onclick=()=>{ stopTimers(); layer.hidden=true; };
    layer.hidden=false; start();
  }
  /* «Дуэль карт» (Top Trumps): у тебя и соперника по стопке карт; выбираешь
     характеристику (размер/древность) — чьё число больше, тот забирает обе.
     Ничья → карты в банк, достаются следующему победителю. */
  function openDuelSandbox(data){
    const layer=document.getElementById("sandboxLayer");
    function shuf(a){ a=a.slice(); for(let k=a.length-1;k>0;k--){ const j=Math.floor(Math.random()*(k+1)); const t=a[k]; a[k]=a[j]; a[j]=t; } return a; }
    const full=shuf(data.items||[]);
    let you=[], cpu=[], pot=[], cur=null, over=false, roundNo=0;
    const ROUND_CAP=16;
    layer.innerHTML=`<div class="sb-head"><span class="t">${escapeHtml(T(data.title||{ru:"Дуэль карт"}))}</span><button class="x" id="sbX" aria-label="Закрыть">×</button></div>
      <div class="sb-instr">${T(DU_INSTR)}</div>
      <div class="du-hud"><span class="you">${T(DU_YOU)}: <b id="duY">0</b> 🂠</span><span class="rnd" id="duRnd"></span><span class="cpu">${T(DU_CPU)}: <b id="duC">0</b> 🂠</span></div>
      <div class="du-stage">
        <div class="du-cards"><div class="du-card" id="duYcard"></div><div class="du-card" id="duCcard"></div></div>
        <div class="du-stats" id="duStats"></div>
        <div class="du-msg" id="duMsg"></div>
        <div class="sb-readout" id="duReadout"></div>
      </div>`;
    const yEl=layer.querySelector("#duY"), cEl=layer.querySelector("#duC"), rndEl=layer.querySelector("#duRnd"),
          yCard=layer.querySelector("#duYcard"), cCard=layer.querySelector("#duCcard"),
          statsEl=layer.querySelector("#duStats"), msgEl=layer.querySelector("#duMsg"), readout=layer.querySelector("#duReadout");
    function face(it){ return '<div class="ph" style="background-image:url(\''+(it.hero||"")+'\')"></div><div class="nm">'+escapeHtml(T(it.name))+'</div>'; }
    function back(){ return '<div class="du-back">🦕</div><div class="nm">?</div>'; }
    function counts(){ yEl.textContent=you.length; cEl.textContent=cpu.length; }
    function statLine(key, it){ var lab=key==="size"?DU_SIZE:DU_AGE, unit=key==="size"?DU_M:DU_MYA;
      return '<button data-k="'+key+'"><span>'+T(lab)+'</span><span class="v">'+it[key]+' '+T(unit)+'</span></button>'; }
    function decide(){
      // счёт по картам на руках (банк не в счёт); ничья при равенстве
      if(you.length===cpu.length){ finish(null); }
      else { finish(you.length>cpu.length); }
    }
    function deal(){
      if(over) return;
      if(!you.length){ finish(false); return; }
      if(!cpu.length){ finish(true); return; }
      if(roundNo>=ROUND_CAP){ decide(); return; }
      roundNo++;
      rndEl.textContent=T(DU_ROUND)+" "+roundNo+"/"+ROUND_CAP;
      cur={ p:you.shift(), c:cpu.shift() };
      counts(); msgEl.className="du-msg"; msgEl.textContent=""; readout.innerHTML="";
      yCard.innerHTML=face(cur.p); cCard.innerHTML=back();
      statsEl.innerHTML=statLine("size",cur.p)+statLine("age",cur.p);
      [...statsEl.querySelectorAll("button")].forEach(b=>b.onclick=()=>pick(b.dataset.k));
    }
    function pick(key){
      if(!cur) return;
      cCard.innerHTML=face(cur.c);
      const pv=cur.p[key], cv=cur.c[key];
      [...statsEl.querySelectorAll("button")].forEach(b=>{ b.disabled=true;
        if(b.dataset.k===key && pv!==cv) b.classList.add(pv>cv?"win":"lose"); });
      pot.push(cur.p, cur.c);
      let msg, cls;
      if(pv>cv){ you=you.concat(pot); pot=[]; msg=DU_WIN; cls="win"; }
      else if(cv>pv){ cpu=cpu.concat(pot); pot=[]; msg=DU_LOSE; cls="lose"; }
      else { msg=DU_TIE; cls=""; }
      cur=null; counts();
      msgEl.className="du-msg "+cls; msgEl.textContent=T(msg);
      readout.innerHTML='<button class="dig-next" id="duNext">'+T(DU_NEXT)+'</button>';
      readout.querySelector("#duNext").onclick=()=>{
        if(!you.length){ finish(false); }
        else if(!cpu.length){ finish(true); }
        else if(roundNo>=ROUND_CAP){ decide(); }
        else deal(); };
    }
    function finish(win){ over=true; statsEl.innerHTML=""; yCard.innerHTML=""; cCard.innerHTML="";
      counts();
      var draw=(win===null);
      msgEl.className="du-msg "+(draw?"":(win?"win":"lose"));
      msgEl.textContent=T(draw?DU_DRAW:(win?DU_WON:DU_LOST));
      readout.innerHTML='<button class="dig-next">'+T(TF_AGAIN)+'</button>';
      readout.querySelector("button").onclick=start; }
    function start(){ over=false; roundNo=0; pot=[]; const d=shuf(full); const h=Math.ceil(d.length/2);
      you=d.slice(0,h); cpu=d.slice(h); rndEl.textContent=""; readout.innerHTML=""; deal(); }
    layer.querySelector("#sbX").onclick=()=>{ layer.hidden=true; };
    layer.hidden=false; start();
  }
  function openFoodchainSandbox(data){
    const layer=document.getElementById("sandboxLayer");
    function shuf(a){ a=a.slice(); for(let k=a.length-1;k>0;k--){ const j=Math.floor(Math.random()*(k+1)); const t=a[k]; a[k]=a[j]; a[j]=t; } return a; }
    const ROLES=[{k:"plant",lab:FC_PLANT,emo:"🌿"},{k:"herb",lab:FC_HERB,emo:"🦕"},{k:"pred",lab:FC_PRED,emo:"🦖"}];
    const chains=(data.chains||[]).slice();
    const TOTAL=Math.min(data.rounds||chains.length, chains.length)||1;
    let order=shuf(chains), ri=0, slotIdx=0, cur=null;
    layer.innerHTML=`<div class="sb-head"><span class="t">${escapeHtml(T(data.title||{ru:"Цепь питания"}))}</span><button class="x" id="sbX" aria-label="Закрыть">×</button></div>
      <div class="sb-instr">${T(FC_INSTR)}</div>
      <div class="fc-hud"><span id="fcSc"></span></div>
      <div class="fc-chain" id="fcChain"></div>
      <div class="fc-msg" id="fcMsg"></div>
      <div class="fc-tray" id="fcTray"></div>
      <div class="sb-readout" id="fcReadout"></div>`;
    const chainEl=layer.querySelector("#fcChain"), trayEl=layer.querySelector("#fcTray"),
          msgEl=layer.querySelector("#fcMsg"), readout=layer.querySelector("#fcReadout"), scEl=layer.querySelector("#fcSc");
    function memberOf(c,role){ return role==="plant"?c.plant:(role==="herb"?c.herb:c.pred); }
    function visual(m,role){ return role==="plant"
        ? '<div class="veg">'+(m.emoji||"🌿")+'</div>'
        : '<div class="ph" style="background-image:url(\''+(m.hero||"")+'\')"></div>'; }
    function slotHTML(){ let h="";
      ROLES.forEach((r,i)=>{ if(i) h+='<span class="fc-arrow">→</span>';
        h+='<div class="fc-slot" data-i="'+i+'"><span class="emo">'+r.emo+'</span><span class="role">'+T(r.lab)+'</span></div>'; });
      return h; }
    function highlight(){ [...chainEl.querySelectorAll(".fc-slot")].forEach((s,i)=>s.classList.toggle("active", i===slotIdx && slotIdx<ROLES.length)); }
    function fillSlot(i,m,role){ const s=chainEl.querySelector('.fc-slot[data-i="'+i+'"]');
      s.classList.add("filled"); s.classList.remove("active");
      s.innerHTML='<div class="card-in">'+visual(m,role)+'<div class="nm">'+escapeHtml(T(m.name))+'</div></div>'; }
    function tap(btn){
      const role=btn.dataset.role;
      if(role!==ROLES[slotIdx].k){ btn.classList.remove("shake"); void btn.offsetWidth; btn.classList.add("shake");
        msgEl.className="fc-msg bad"; msgEl.textContent=T(FC_NEED)+" "+T(ROLES[slotIdx].lab).toLowerCase(); return; }
      fillSlot(slotIdx, memberOf(cur,role), role);
      btn.classList.add("used"); msgEl.className="fc-msg"; msgEl.textContent="";
      slotIdx++;
      if(slotIdx>=ROLES.length) done(); else highlight();
    }
    function done(){
      chainEl.classList.add("done");
      const last=(ri+1>=TOTAL);
      msgEl.className="fc-msg good"; msgEl.textContent=T(last?FC_ALL:FC_DONE);
      readout.innerHTML='<button class="dig-next">'+T(last?TF_AGAIN:FC_NEXT)+'</button>';
      readout.querySelector("button").onclick=()=>{ if(last){ order=shuf(chains); ri=0; } else ri++; round(); };
    }
    function round(){
      cur=order[ri]; slotIdx=0;
      scEl.textContent=(ri+1)+" / "+TOTAL;
      chainEl.className="fc-chain"; chainEl.innerHTML=slotHTML();
      msgEl.className="fc-msg"; msgEl.textContent=""; readout.innerHTML="";
      const items=shuf(ROLES.map(r=>({m:memberOf(cur,r.k),role:r.k})));
      trayEl.innerHTML=items.map(it=>'<button class="fc-item" data-role="'+it.role+'">'+visual(it.m,it.role)+'<div class="nm">'+escapeHtml(T(it.m.name))+'</div></button>').join("");
      [...trayEl.querySelectorAll(".fc-item")].forEach(b=>b.onclick=()=>tap(b));
      highlight();
    }
    layer.querySelector("#sbX").onclick=()=>{ layer.hidden=true; };
    layer.hidden=false; round();
  }
  function openRunnerSandbox(data){
    const layer=document.getElementById("sandboxLayer");
    layer.innerHTML=`<div class="sb-head"><span class="t">${escapeHtml(T(data.title||{ru:"Побег от астероида"}))}</span><button class="x" id="sbX" aria-label="Закрыть">×</button></div>
      <div class="sb-instr">${T(RN_INSTR)}</div>
      <div class="rn-wrap" id="rnWrap">
        <canvas id="rnCanvas"></canvas>
        <div class="rn-hud"><span id="rnDist"></span><span id="rnBest"></span></div>
        <div class="rn-over" id="rnOver"><div class="big" id="rnBig"></div><div class="sm" id="rnSm"></div><button class="btn" id="rnBtn"></button></div>
      </div>`;
    const canvas=layer.querySelector("#rnCanvas"), ctx=canvas.getContext("2d"),
          wrap=layer.querySelector("#rnWrap"),
          distEl=layer.querySelector("#rnDist"), bestEl=layer.querySelector("#rnBest"),
          overEl=layer.querySelector("#rnOver"), bigEl=layer.querySelector("#rnBig"),
          smEl=layer.querySelector("#rnSm"), btnEl=layer.querySelector("#rnBtn");
    const DPR=Math.min(window.devicePixelRatio||1,2);
    let W=600, H=340, groundY=300;
    function size(){
      W=Math.max(300, Math.round(wrap.clientWidth||600));
      H=Math.max(240, Math.round(wrap.clientHeight||340));
      groundY=Math.round(H*0.80);   // совмещено с песчаной полосой на растровом фоне
      canvas.width=W*DPR; canvas.height=H*DPR;
      ctx.setTransform(1,0,0,1,0,0); ctx.scale(DPR,DPR);
      initScenery();
    }
    // растровый фон (доставленная сцена) — бесшовно тайлится зеркально
    const bgImg=new Image(); let bgReady=false; bgImg.onload=()=>{ bgReady=true; }; bgImg.src="../assets/game/run-bg.webp";
    // спрайт-лист бегущего динозавра: 2 кадра-шага (ноги поменяны местами)
    const dinoImg=new Image(); let dinoReady=false; const DINO_NF=2; dinoImg.onload=()=>{ dinoReady=true; }; dinoImg.src="../assets/game/dino-run.webp";
    // камни-препятствия (3 варианта в полосе, высота ячейки 120)
    const rockImg=new Image(); let rockReady=false; rockImg.onload=()=>{ rockReady=true; }; rockImg.src="../assets/game/rocks.webp";
    const ROCKS=[{x:0,w:213},{x:215,w:128},{x:345,w:89}], ROCK_H=120;
    // яйцо-бонус (2 варианта, прозрачный фон со свечением)
    const eggImg=new Image(); let eggReady=false; const EGG_NF=2; eggImg.onload=()=>{ eggReady=true; }; eggImg.src="../assets/game/eggs.webp";
    // парящая пыльца поверх фона — немного жизни
    let ambient=[];
    function initScenery(){
      ambient=[]; for(let k=0;k<16;k++){ ambient.push({x:Math.random()*W, y:Math.random()*groundY, s:0.6+Math.random()*1.5, drift:0.15+Math.random()*0.4, ph:Math.random()*6}); }
    }
    const BEST_KEY="dino_run_best";
    let best=parseInt(localStorage.getItem(BEST_KEY)||"0",10)||0;
    let raf=0, running=false, started=false, dead=false;
    let py=0, vy=0, dist=0, speed=4.4, phase=0, obs=[], eggsArr=[], parts=[], t=0, nextGap=0;
    let eggs=0, prevPy=0, squash=0, shake=0, flash=0, jumpBuf=0, dying=0, cometR=30;
    function planGap(){ nextGap=Math.max(240, speed*46)+Math.random()*170; }
    function reset(){ py=0; vy=0; dist=0; speed=4.4; phase=0; obs=[]; eggsArr=[]; parts=[]; t=0; dead=false;
      eggs=0; prevPy=0; squash=0; shake=0; flash=0; jumpBuf=0; dying=0; planGap(); }
    function jump(){
      if(!started||dead){ if(!dying) start(); return; }
      if(py<=0.5){ vy=13.6; squash=-0.5; } else { jumpBuf=8; }   // буфер прыжка: тап у земли сработает при приземлении
    }
    function start(){ size(); reset(); started=true; dead=false; running=true; overEl.classList.add("hide");
      cancelAnimationFrame(raf); loop(); }
    function puff(x,y,n,color,spread,up){ for(let k=0;k<n;k++){
      parts.push({x:x,y:y,vx:(Math.random()-0.5)*spread,vy:-Math.random()*up,life:1,dec:0.03+Math.random()*0.03,size:2+Math.random()*3,color:color}); } }
    function gameOver(){ if(dead) return; dead=true; dying=26; shake=16; flash=1;
      puff(Math.round(W*0.12)+8, groundY-py-14, 12, "rgba(240,120,40,.95)", 5, 3.5); }
    function finalize(){ running=false; cancelAnimationFrame(raf);
      const m=Math.floor(dist); if(m>best){ best=m; try{ localStorage.setItem(BEST_KEY,String(best)); }catch(e){} }
      bigEl.textContent=T(RN_OVER);
      smEl.textContent=T(RN_DIST)+": "+m+" "+T(RN_M)+"   🥚 "+eggs+"   ·   "+T(RN_BEST)+": "+best;
      btnEl.textContent=T(TF_AGAIN); overEl.classList.remove("hide"); syncHud(); }
    function syncHud(){ distEl.textContent=T(RN_DIST)+" "+Math.floor(dist)+" "+T(RN_M)+"   🥚 "+eggs;
      bestEl.textContent="🏆 "+best; }
    function spawn(){ const ri=Math.floor(Math.random()*ROCKS.length), rh=30+Math.random()*16;
      obs.push({ x:W+30, ri:ri, h:rh, w:Math.round(rh*ROCKS[ri].w/ROCK_H) }); planGap();
      // яйцо-награда: над камнем (собери, перепрыгивая) или в промежутке
      if(Math.random()<0.8){ const overRock=Math.random()<0.6;
        eggsArr.push({ x:W+30+(overRock?4:nextGap*0.5), y:groundY-(overRock?(78+Math.random()*16):(60+Math.random()*30)), got:false }); } }
    function step(){
      if(dead){ // короткая анимация гибели: тряска + вспышка, потом экран итога
        if(shake>0.2) shake*=0.86; else shake=0;
        if(flash>0.01) flash*=0.9; else flash=0;
        parts.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=0.14; p.life-=p.dec; }); parts=parts.filter(p=>p.life>0);
        if(--dying<=0) finalize(); return; }
      t++; phase+=0.32;
      speed=Math.min(9.5, 4.4+dist*0.0016);
      dist+=speed*0.09;
      prevPy=py; if(jumpBuf>0) jumpBuf--;
      py+=vy; vy-=0.9; if(py<0){ py=0; vy=0; }
      // приземление: пыль + приседание, отложенный прыжок из буфера
      if(prevPy>2 && py===0){ squash=0.6; puff(Math.round(W*0.12), groundY, 6, "rgba(190,150,90,.9)", 3.4, 2.4);
        if(jumpBuf>0){ vy=13.6; squash=-0.5; jumpBuf=0; } }
      // пыль от бега
      if(py===0 && t%7===0){ puff(Math.round(W*0.12)-8, groundY, 1, "rgba(190,150,90,.7)", 1.6, 1.2); }
      if(squash) squash*=0.8; if(Math.abs(squash)<0.02) squash=0;
      // редкие препятствия
      if(!obs.length || obs[obs.length-1].x < W-nextGap){ spawn(); }
      obs.forEach(o=>o.x-=speed); obs=obs.filter(o=>o.x>-60);
      // яйца — награда за прыжок
      eggsArr.forEach(e=>e.x-=speed); eggsArr=eggsArr.filter(e=>e.x>-40 && !e.got);
      const ecx=Math.round(W*0.12)+16, ecy=groundY-py-22;
      for(const e of eggsArr){ if(!e.got){ const ex=e.x-ecx, ey=e.y-ecy;
        if(ex*ex+ey*ey < 26*26){ e.got=true; eggs++; dist+=12; puff(e.x,e.y,8,"rgba(255,220,90,.95)",3.4,2.8); } } }
      // частицы
      parts.forEach(p=>{ p.x-=speed*0.4; p.x+=p.vx; p.y+=p.vy; p.vy+=0.14; p.life-=p.dec; });
      parts=parts.filter(p=>p.life>0);
      // приближающаяся комета
      cometR=Math.max(15,H*0.05)*(1+Math.min(1.1, dist*0.0011));
      // столкновение
      const dx=Math.round(W*0.12), dw=42, dbottom=groundY-py;
      for(const o of obs){ const ox=o.x-o.w/2;
        if(dx+dw-12>ox && dx+12<ox+o.w && dbottom>groundY-o.h+3){ gameOver(); return; } }
    }
    function drawDinoSprite(g){
      const cw=dinoImg.naturalWidth/DINO_NF, chh=dinoImg.naturalHeight;
      let fr; if(dead) fr=0; else if(py>0.5) fr=0; else fr=Math.floor(t/5)%DINO_NF;
      const contentH=chh-8, scale=60/contentH, feet=chh-4;   // экранная высота ~60px, ноги на groundY
      g.drawImage(dinoImg, fr*cw,0, cw,chh, 21-(cw*scale)/2, -(feet*scale), cw*scale, chh*scale);
    }
    function drawDino(g,run){   // векторный фолбэк, если спрайт не загрузился
      g.lineCap="round";
      const body="#4f7d54", edge="#355c3b";
      g.fillStyle=body; g.strokeStyle=body;
      g.beginPath(); g.moveTo(-4,-26); g.lineTo(-30,-14); g.lineTo(-4,-12); g.closePath(); g.fill();          // хвост
      g.beginPath(); g.ellipse(8,-24,21,14,0,0,7); g.fill();                                                   // тело
      g.beginPath(); g.moveTo(20,-35); g.quadraticCurveTo(33,-43,39,-33); g.lineTo(50,-32); g.lineTo(50,-23); g.lineTo(35,-21); g.quadraticCurveTo(22,-20,20,-29); g.closePath(); g.fill(); // шея+голова
      g.fillStyle=edge; g.beginPath(); g.moveTo(-2,-36); g.lineTo(3,-30); g.lineTo(8,-36); g.lineTo(13,-30); g.lineTo(18,-35); g.lineTo(6,-32); g.closePath(); g.fill(); // гребень
      g.fillStyle="#fff"; g.beginPath(); g.arc(42,-32,2.1,0,7); g.fill();
      g.fillStyle="#20301f"; g.beginPath(); g.arc(43,-32,1,0,7); g.fill();
      g.fillStyle=body; g.beginPath(); g.moveTo(20,-20); g.lineTo(27,-15); g.lineTo(22,-14); g.closePath(); g.fill(); // лапка
      const sw = run ? Math.sin(phase)*7 : 4;
      g.lineWidth=6; g.strokeStyle=body;
      g.beginPath(); g.moveTo(4,-12); g.lineTo(4+sw,0); g.stroke();
      g.beginPath(); g.moveTo(13,-12); g.lineTo(13-sw,0); g.stroke();
    }
    function drawEgg(g,x,y){ const yy=y+Math.sin(t*0.12+x*0.1)*2;
      if(eggReady){ const cw=eggImg.naturalWidth/EGG_NF, chh=eggImg.naturalHeight, dh=50, dw=dh*cw/chh;
        g.drawImage(eggImg, 0,0, cw,chh, x-dw/2, yy-dh/2, dw, dh); return; }
      g.save(); g.translate(x, yy);
      g.fillStyle="rgba(255,225,120,.35)"; g.beginPath(); g.arc(0,0,15,0,7); g.fill();
      g.fillStyle="#fff7e6"; g.beginPath(); g.ellipse(0,0,9,12,0,0,7); g.fill();
      g.fillStyle="#e0b060"; g.beginPath(); g.arc(-2,-2,2,0,7); g.fill(); g.beginPath(); g.arc(3,3,1.5,0,7); g.fill();
      g.strokeStyle="rgba(200,150,70,.5)"; g.lineWidth=1.4; g.beginPath(); g.ellipse(0,0,9,12,0,0,7); g.stroke();
      g.restore(); }
    function draw(){
      ctx.save();
      if(shake>0){ ctx.translate((Math.random()-0.5)*shake,(Math.random()-0.5)*shake); }
      // ===== растровый фон (доставленная сцена) — зеркальный бесшовный тайлинг =====
      if(bgReady){
        const sw=H*(bgImg.naturalWidth/bgImg.naturalHeight);
        let off=(t*speed*0.4)%(sw*2); if(off<0) off+=sw*2;
        const first=Math.floor(off/sw);
        for(let k=0;k<Math.ceil(W/sw)+2;k++){ const ti=first+k, x=ti*sw-off;
          ctx.save();
          if(((ti%2)+2)%2===1){ ctx.translate(x+sw,0); ctx.scale(-1,1); ctx.drawImage(bgImg,0,0,sw,H); }
          else ctx.drawImage(bgImg,x,0,sw,H);
          ctx.restore(); }
      } else {
        const sky=ctx.createLinearGradient(0,0,0,H);
        sky.addColorStop(0,"#8fd0f0"); sky.addColorStop(.6,"#cfeaf6"); sky.addColorStop(1,"#e8c88a");
        ctx.fillStyle=sky; ctx.fillRect(-20,-20,W+40,H+40);
        ctx.fillStyle="#c79352"; ctx.fillRect(-20,groundY,W+40,H-groundY+20);
      }
      // комета-угроза — растёт и опускается с дистанцией (верх-право, не спорит с солнцем сцены)
      const r=cometR, ax=W*0.8, ay=H*0.12+Math.min(H*0.1, dist*0.04)+Math.sin(t*0.02)*3;
      let hal=ctx.createRadialGradient(ax,ay,3,ax,ay,r*2.6);
      hal.addColorStop(0,"rgba(255,170,70,.6)"); hal.addColorStop(1,"rgba(255,120,40,0)");
      ctx.fillStyle=hal; ctx.beginPath(); ctx.arc(ax,ay,r*2.6,0,7); ctx.fill();
      ctx.fillStyle="rgba(255,150,60,.55)"; ctx.beginPath(); ctx.moveTo(ax+r*0.4,ay-r*0.4); ctx.lineTo(ax+r*3.4,ay-r*2.2); ctx.lineTo(ax+r*0.1,ay); ctx.closePath(); ctx.fill();
      ctx.fillStyle="#8a4a2c"; ctx.beginPath(); ctx.arc(ax,ay,r,0,7); ctx.fill();
      ctx.fillStyle="#a15a34"; ctx.beginPath(); ctx.arc(ax-r*0.28,ay-r*0.22,r*0.5,0,7); ctx.fill();
      // атмосфера — парящая пыльца/искры
      ctx.fillStyle="rgba(255,240,200,.7)";
      ambient.forEach(a=>{ a.x-=a.drift+speed*0.05; a.y+=Math.sin(t*0.03+a.ph)*0.3; if(a.x<-6){ a.x=W+6; a.y=Math.random()*groundY; }
        ctx.globalAlpha=0.5; ctx.beginPath(); ctx.arc(a.x,a.y,a.s,0,7); ctx.fill(); }); ctx.globalAlpha=1;
      // яйца
      eggsArr.forEach(e=>{ if(!e.got) drawEgg(ctx,e.x,e.y); });
      // препятствия — раскалённые камни (растровые спрайты, вектор — фолбэк)
      obs.forEach(o=>{ ctx.save(); ctx.translate(o.x,groundY);
        ctx.fillStyle="rgba(60,40,20,.22)"; ctx.beginPath(); ctx.ellipse(0,3,o.w/2+3,4,0,0,7); ctx.fill();
        if(rockReady){ const rk=ROCKS[o.ri]; ctx.drawImage(rockImg, rk.x,0, rk.w,ROCK_H, -o.w/2,-o.h, o.w,o.h); }
        else { ctx.fillStyle="#5a3320"; ctx.beginPath(); ctx.moveTo(-o.w/2,0); ctx.lineTo(-o.w/2+3,-o.h); ctx.lineTo(o.w/2-3,-o.h); ctx.lineTo(o.w/2,0); ctx.closePath(); ctx.fill();
          ctx.fillStyle="rgba(240,120,40,.95)"; ctx.beginPath(); ctx.ellipse(0,-o.h,o.w/2-3,3.5,0,0,7); ctx.fill(); }
        ctx.restore(); });
      // частицы
      parts.forEach(p=>{ ctx.globalAlpha=Math.max(0,Math.min(1,p.life)); ctx.fillStyle=p.color;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,7); ctx.fill(); }); ctx.globalAlpha=1;
      // тень динозавра на земле (сжимается в прыжке)
      ctx.fillStyle="rgba(60,40,20,"+(0.26*Math.max(0.2,1-py/120)).toFixed(3)+")";
      ctx.beginPath(); ctx.ellipse(Math.round(W*0.12)+6, groundY+2, Math.max(10,22-py*0.08), 5, 0,0,7); ctx.fill();
      // динозавр — с приседанием/растяжкой и беговым подскоком (растровый спрайт, вектор — фолбэк)
      const runBob=(running && !dead && py<=0.5) ? Math.abs(Math.sin(t*0.63))*2.2 : 0;   // лёгкий подскок в такт шагам (шаг каждые 5 тиков)
      ctx.save(); ctx.translate(Math.round(W*0.12), groundY-py-runBob);
      ctx.scale(1+squash*0.18, 1-squash*0.22);
      if(dinoReady) drawDinoSprite(ctx); else drawDino(ctx, running && !dead);
      ctx.restore();
      ctx.restore();
      // виньетка — кино-объём (лёгкая, чтобы всё было видно)
      const vg=ctx.createRadialGradient(W/2,H*0.48,H*0.34,W/2,H*0.5,H*0.85);
      vg.addColorStop(0,"rgba(0,0,0,0)"); vg.addColorStop(1,"rgba(28,18,8,.30)");
      ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);
      // вспышка (не трясётся)
      if(flash>0){ ctx.fillStyle="rgba(255,240,210,"+(flash*0.7).toFixed(3)+")"; ctx.fillRect(0,0,W,H); }
    }
    function loop(){ if(!running) return; if(!document.body.contains(canvas)){ running=false; return; }
      step(); draw(); syncHud(); raf=requestAnimationFrame(loop); }
    // input
    canvas.addEventListener("pointerdown",function(e){ e.preventDefault(); jump(); });
    overEl.addEventListener("pointerdown",function(e){ e.preventDefault(); start(); });
    btnEl.addEventListener("pointerdown",function(e){ e.preventDefault(); e.stopPropagation(); start(); });
    document.addEventListener("keydown",function onKey(e){ if(!document.body.contains(canvas)){ document.removeEventListener("keydown",onKey); return; } if(e.code==="Space"||e.code==="ArrowUp"){ e.preventDefault(); jump(); } });
    // initial state: draw a static frame + start overlay
    layer.querySelector("#sbX").onclick=()=>{ running=false; cancelAnimationFrame(raf); layer.hidden=true; };
    layer.hidden=false;
    // размер знаем только после показа слоя
    requestAnimationFrame(()=>{ size(); reset(); draw(); syncHud();
      bigEl.textContent="🦖"; smEl.textContent=T(RN_JUMP); btnEl.textContent=T(RN_TAP); });
  }
  function openIspySandbox(data){
    const layer=document.getElementById("sandboxLayer");
    const img=data.image||((data.imageFrom&&BOOK.pages[data.imageFrom-1])?BOOK.pages[data.imageFrom-1].img:"");
    const asp=data.aspect||0.667;
    const wide=!!data.wide;   // очень широкая панорама: фикс-высота + горизонтальный скролл
    function shuf(a){ a=a.slice(); for(var k=a.length-1;k>0;k--){ var jj=Math.floor(Math.random()*(k+1)); var t=a[k]; a[k]=a[jj]; a[jj]=t; } return a; }
    var targets=(data.targets||[]).map(function(t,i){ return {name:t.name,x:t.x,y:t.y,r:t.r||12,idx:i}; });
    var order=shuf(targets), found={}, cur=0;
    layer.innerHTML='<div class="sb-head"><span class="t">'+escapeHtml(T(data.title||{ru:"Найди и покажи"}))+'</span><button class="x" id="sbX" aria-label="Закрыть">×</button></div>'
      +'<div class="isp-task" id="ispTask"></div>'
      +(wide
        ? '<div class="isp-scroll"><div class="isp-imgwrap wide" id="ispImg"><img src="'+img+'" alt=""></div></div>'
        : '<div class="isp-stage"><div class="isp-imgwrap" id="ispImg" style="padding-bottom:'+(100/asp).toFixed(2)+'%"><img src="'+img+'" alt=""></div></div>')
      +'<div class="sb-readout" id="ispReadout"></div>';
    var imgWrap=layer.querySelector("#ispImg"), taskEl=layer.querySelector("#ispTask"), readout=layer.querySelector("#ispReadout");
    function draw(){
      var done=Object.keys(found).length, n=targets.length;
      if(done>=n){ taskEl.innerHTML='<b>'+escapeHtml(T(ISPY_DONE))+'</b>';
        readout.innerHTML='<span><b>'+escapeHtml(T(ISPY_ALL)).replace(/\{n\}/g,n)+'</b></span>'; }
      else { var t=order[cur];
        taskEl.innerHTML='<span class="isp-find">'+escapeHtml(T(ISPY_FIND))+'</span> <span class="isp-word">'+escapeHtml(T(t.name))+'</span>'
          +(wide&&done===0?'<span class="isp-scrollhint">⟷ '+escapeHtml(T(ISPY_SCROLL))+'</span>':'');
        readout.innerHTML='<span>'+escapeHtml(T(ISPY_PROG)).replace("{c}",done).replace("{n}",n)+'</span>'; }
      imgWrap.querySelectorAll(".isp-mark").forEach(function(m){ m.remove(); });
      targets.forEach(function(t){ if(!found[t.idx]) return;
        var mk=document.createElement("div"); mk.className="isp-mark"; mk.style.left=t.x+"%"; mk.style.top=t.y+"%"; mk.innerHTML='<span class="isp-tag">'+escapeHtml(T(t.name))+'</span>';
        imgWrap.appendChild(mk); });
      // подводим искомый объект в поле зрения (широкая панорама скроллится)
      if(wide && done<n){ var sc=layer.querySelector(".isp-scroll"), tt=order[cur];
        if(sc && tt){ var xpx=tt.x/100*imgWrap.getBoundingClientRect().width;
          try{ sc.scrollTo({left:Math.max(0,xpx-sc.clientWidth/2),behavior:"smooth"}); }
          catch(e){ sc.scrollLeft=Math.max(0,xpx-sc.clientWidth/2); } } }
    }
    imgWrap.addEventListener("click",function(ev){
      if(Object.keys(found).length>=targets.length) return;
      var r=imgWrap.getBoundingClientRect(); var px=(ev.clientX-r.left)/r.width*100, py=(ev.clientY-r.top)/r.height*100;
      // прощаем неточность: засчитываем ЛЮБОЙ ещё не найденный объект, в чью
      // (щедрую) зону попал тап — берём ближайший. Так «жму на комету» срабатывает,
      // даже если приложение просит найти сейчас другого.
      var best=null, bestD=1e9;
      targets.forEach(function(t){ if(found[t.idx]) return; var d;
        if(wide){ var dxp=(px-t.x)/100*r.width, dyp=(py-t.y)/100*r.height;
          d=Math.sqrt(dxp*dxp+dyp*dyp); if(d<=Math.max(t.r/100*r.height,46) && d<bestD){ bestD=d; best=t; } }
        else { var dx=px-t.x, dy=py-t.y; d=Math.sqrt(dx*dx+dy*dy); if(d<=Math.max(t.r,10) && d<bestD){ bestD=d; best=t; } }
      });
      if(best){ found[best.idx]=true;
        for(var k=0;k<order.length;k++){ if(!found[order[k].idx]){ cur=k; break; } }
        draw();
      } else {
        var miss=document.createElement("div"); miss.className="isp-miss"; miss.style.left=px+"%"; miss.style.top=py+"%"; imgWrap.appendChild(miss);
        setTimeout(function(){ miss.remove(); }, 500);
      }
    });
    layer.querySelector("#sbX").onclick=function(){ layer.hidden=true; };
    layer.hidden=false;
    if(wide){ // размер панорамы: половина высоты слоя, ширина по аспекту
      var ph=Math.max(180, Math.min(360, Math.round(layer.clientHeight*0.5)));
      imgWrap.style.height=ph+"px"; imgWrap.style.width=Math.round(ph*asp)+"px"; }
    draw();
  }
  function openTrueFalseSandbox(data){
    const layer=document.getElementById("sandboxLayer");
    function shuf(a){ a=a.slice(); for(var k=a.length-1;k>0;k--){ var jj=Math.floor(Math.random()*(k+1)); var t=a[k]; a[k]=a[jj]; a[jj]=t; } return a; }
    var items=shuf(data.items||[]); var qi=0, score=0, answered=false;
    layer.innerHTML='<div class="sb-head"><span class="t">'+escapeHtml(T(data.title||{ru:"А правда ли это?"}))+'</span><button class="x" id="sbX" aria-label="Закрыть">×</button></div>'
      +'<div class="tf-body" id="tfBody"></div>';
    var body=layer.querySelector("#tfBody");
    function draw(){
      if(qi>=items.length){ body.innerHTML='<div class="tf-final"><div class="tf-fbig">'+score+' / '+items.length+'</div><div class="tf-fcap">'+escapeHtml(T(TF_DONE))+'</div><button class="tf-again" id="tfAgain">'+escapeHtml(T(TF_AGAIN))+'</button></div>';
        body.querySelector("#tfAgain").onclick=function(){ items=shuf(data.items||[]); qi=0; score=0; answered=false; draw(); }; return; }
      var it=items[qi];
      body.innerHTML='<div class="tf-count">'+(qi+1)+' / '+items.length+'</div>'
        +'<div class="tf-q">'+escapeHtml(T(it.q))+'</div>'
        +'<div class="tf-btns"><button class="tf-yes" id="tfYes">'+escapeHtml(T(TF_TRUE))+'</button><button class="tf-no" id="tfNo">'+escapeHtml(T(TF_FALSE))+'</button></div>'
        +'<div class="tf-why" id="tfWhy" hidden></div>'
        +'<button class="tf-next" id="tfNext" hidden>'+escapeHtml(T(TF_NEXT))+'</button>';
      answered=false;
      function answer(val){ if(answered) return; answered=true;
        var correct=(val===it.a); if(correct) score++;
        var yes=body.querySelector("#tfYes"), no=body.querySelector("#tfNo");
        yes.disabled=no.disabled=true;
        (it.a?yes:no).classList.add("ok"); if(!correct)(val?yes:no).classList.add("bad");
        var why=body.querySelector("#tfWhy"); why.hidden=false;
        why.innerHTML='<span class="tf-badge '+(correct?"good":"wrong")+'">'+escapeHtml(correct?T(TF_RIGHT):T(TF_WRONG))+'</span> '+escapeHtml(T(it.why));
        body.querySelector("#tfNext").hidden=false;
      }
      body.querySelector("#tfYes").onclick=function(){ answer(true); };
      body.querySelector("#tfNo").onclick=function(){ answer(false); };
      body.querySelector("#tfNext").onclick=function(){ qi++; draw(); };
    }
    layer.querySelector("#sbX").onclick=function(){ layer.hidden=true; };
    layer.hidden=false; draw();
  }
  function openGlossarySandbox(data){
    const layer=document.getElementById("sandboxLayer");
    const terms=data.terms||[]; const open={};
    layer.innerHTML=`<div class="sb-head"><span class="t">${escapeHtml(T(data.title||{ru:"Словарик"}))}</span><button class="x" id="sbX" aria-label="Закрыть">×</button></div>
      <div class="glo-list" id="gloList"></div>`;
    const list=layer.querySelector("#gloList");
    function draw(){ list.innerHTML="";
      terms.forEach((t,ti)=>{ const it=document.createElement("button");
        it.className="glo-item"+(open[ti]?" open":"");
        it.innerHTML=`<span class="glo-row"><span class="glo-term">${escapeHtml(T(t.term))}</span><span class="glo-arr">${open[ti]?"−":"+"}</span></span>`+
          (open[ti]?`<span class="glo-def">${escapeHtml(T(t.def))}</span>`:"");
        it.onclick=()=>{ open[ti]=!open[ti]; draw(); };
        list.appendChild(it); }); }
    layer.querySelector("#sbX").onclick=()=>{ layer.hidden=true; };
    layer.hidden=false; draw();
  }
  function openSortSandbox(data){
    const layer=document.getElementById("sandboxLayer");
    const buckets=data.buckets||[];
    const items=(data.items||[]).map((it,i)=>({name:it.name,bucket:it.bucket,sil:it.sil,idx:i}));
    const place={}; let sel=null;
    layer.innerHTML=`<div class="sb-head"><span class="t">${escapeHtml(T(data.title||{ru:"Кто чем питался"}))}</span><button class="x" id="sbX" aria-label="×">×</button></div>
      <div class="sb-instr">${T(SB_INSTR_SORT)}</div>
      <div class="srt-pool" id="sortPool"></div>
      <div class="srt-baskets" id="sortBuckets"></div>
      <div class="sb-readout" id="sortReadout"></div>`;
    const poolEl=layer.querySelector("#sortPool"), bucketsEl=layer.querySelector("#sortBuckets"), readout=layer.querySelector("#sortReadout");
    function correct(){ return items.filter(it=>place[it.idx]===it.bucket).length; }
    function mkCard(it,cls){ const b=document.createElement("button"); b.className="srt-card"+(cls||"");
      b.innerHTML = it.sil ? `<img src="${it.sil}" alt=""><span>${escapeHtml(T(it.name))}</span>` : `<span class="nm">${escapeHtml(T(it.name))}</span>`;
      return b; }
    let dragIdx=null, dragEl=null, ghost=null, sx=0, sy=0, moved=false;
    function basketAt(x,y){ const el=document.elementFromPoint(x,y); return el?el.closest(".srt-basket"):null; }
    function onMove(ev){ const dx=ev.clientX-sx, dy=ev.clientY-sy;
      if(!moved && Math.hypot(dx,dy)>6){ moved=true;
        ghost=dragEl?dragEl.cloneNode(true):null;
        if(ghost){ ghost.classList.add("srt-ghost"); document.body.appendChild(ghost); dragEl.classList.add("drag-src"); } }
      if(moved && ghost){ ghost.style.left=ev.clientX+"px"; ghost.style.top=ev.clientY+"px";
        const bk=basketAt(ev.clientX,ev.clientY);
        bucketsEl.querySelectorAll(".srt-basket").forEach(b=>b.classList.toggle("drop",b===bk)); }
      ev.preventDefault(); }
    function onUp(ev){ window.removeEventListener("pointermove",onMove);
      window.removeEventListener("pointerup",onUp); window.removeEventListener("pointercancel",onUp);
      if(ghost){ ghost.remove(); ghost=null; }
      bucketsEl.querySelectorAll(".srt-basket").forEach(b=>b.classList.remove("drop"));
      if(moved){ const bk=basketAt(ev.clientX,ev.clientY);
        if(bk&&bk.dataset.key){ place[dragIdx]=bk.dataset.key; sel=null; } }
      else { sel=(sel===dragIdx?null:dragIdx); }
      dragIdx=null; dragEl=null; render(); }
    function startDrag(idx,el,e){ dragIdx=idx; dragEl=el; sx=e.clientX; sy=e.clientY; moved=false;
      window.addEventListener("pointermove",onMove); window.addEventListener("pointerup",onUp);
      window.addEventListener("pointercancel",onUp); e.preventDefault(); }
    function render(){
      poolEl.innerHTML="";
      items.filter(it=>place[it.idx]==null).forEach(it=>{
        const b=mkCard(it, sel===it.idx?" sel":""); b.dataset.idx=it.idx; b.style.touchAction="none";
        b.addEventListener("pointerdown",e=>startDrag(it.idx,b,e));
        poolEl.appendChild(b); });
      bucketsEl.innerHTML="";
      buckets.forEach(bk=>{
        const col=document.createElement("div"); col.className="srt-basket"+(sel!=null?" active":""); col.dataset.key=bk.key;
        col.onclick=()=>{ if(sel!=null){ place[sel]=bk.key; sel=null; render(); } };
        const hd=document.createElement("div"); hd.className="srt-btitle"; hd.textContent=T(bk.name); col.appendChild(hd);
        const tray=document.createElement("div"); tray.className="srt-tray";
        items.filter(it=>place[it.idx]===bk.key).forEach(it=>{
          const ok=(it.bucket===bk.key); const c=mkCard(it, ok?" ok":" no");
          c.onclick=(e)=>{ e.stopPropagation(); delete place[it.idx]; sel=null; render(); };
          tray.appendChild(c); });
        col.appendChild(tray); bucketsEl.appendChild(col); });
      const c=correct(), n=items.length;
      readout.innerHTML = (c===n) ? `<span><b>${escapeHtml(T(SORT_DONE))}</b></span>`
        : `<span>${escapeHtml(T(SORT_PROG)).replace("{c}",c).replace("{n}",n)}</span>`;
    }
    layer.querySelector("#sbX").onclick=()=>{ layer.hidden=true; };
    layer.hidden=false; render();
  }
  const HERE={ru:"ты здесь",en:"you are here",de:"du bist hier",es:"aqu\u00ED est\u00E1s",pt:"voc\u00EA est\u00E1 aqui",fr:"tu es ici",ar:"أنت هنا"};
  function openBubble(anchor){ bubbleAnchor=anchor; sheet.hidden=false; bubble.hidden=false; place(); }
  // shrink the bubble width down to its longest wrapped line (kills right-side gap)
  function tightFit(){ bubble.style.width="";
    if(bubble.classList.contains("mapspot")||bubble.classList.contains("famcard")||bubble.classList.contains("mapcard")) return;
    const h0=bubble.offsetHeight; let w=bubble.offsetWidth;
    while(w>60){ bubble.style.width=(w-2)+"px"; if(bubble.offsetHeight>h0) break; w-=2; }
    bubble.style.width=w+"px"; }
  function place(){ if(!bubbleAnchor) return;
    bubble.style.visibility="hidden"; tightFit();
    const dev=document.querySelector(".device").getBoundingClientRect();
    const a=bubbleAnchor.getBoundingClientRect();
    const bw=bubble.offsetWidth, bh=bubble.offsetHeight, pad=12;
    const cx=a.left+a.width/2-dev.left;
    const left=Math.max(pad, Math.min(cx-bw/2, dev.width-bw-pad));
    const lower=(a.top-dev.top) > dev.height*0.45;
    let top;
    if(lower){ top=(a.top-dev.top)-bh-10; bubble.dataset.tail="down"; }
    else { top=(a.bottom-dev.top)+10; bubble.dataset.tail="up"; }
    bubble.style.left=left+"px"; bubble.style.top=Math.max(pad,top)+"px";
    bubble.style.setProperty("--tailx",(cx-left)+"px");
    bubble.style.visibility="visible";
  }
  function closeBubble(){ sheet.hidden=true; bubble.hidden=true; bubble.onclick=null; bubble.classList.remove("revealed"); bubbleAnchor=null; }
  sheet.onclick=()=>closeBubble();

  function render(){ closeBubble();
    const page=BOOK.pages[i], layout=page.layout||"top"; stage.dataset.layout=layout;
    stage.innerHTML=
      `<div class="imgwrap${page.imgfit==='contain'?' contain':''}"${page.imgfit==='contain'?` style="background-image:url('${page.img}')"`:''}>
         <img class="page-img" src="${page.img}" alt=""${page.imgpos?` style="object-position:${page.imgpos}"`:""}
              onerror="this.style.display='none';this.parentNode.querySelector('.placeholder').style.display='flex'">
         <div class="placeholder"><div class="big">${page.n}</div><div class="small">${T(PLACEHOLDER_TXT)}</div></div>
       </div><div class="scrim"></div><div class="textbox">${page.series?`<div class="series">${escapeHtml(T(page.series))}</div>`:""}<div class="narration"></div></div>`;
    renderText(); renderWidgets(page);
    counter.textContent=`${page.n} / ${BOOK.pages.length}`; document.documentElement.lang=lang; syncScrub();
    if(page.textpos) applyTextPos(page.textpos);
    if(page.badgepos) applyPosEl(factBadge,page.badgepos);
    if(page.widgetpos) applyPosEl(widgetBar,page.widgetpos);
    if(EDIT_MODE) decorateEdit();
  }
  function go(d){ const ni=i+d; if(ni<0||ni>=BOOK.pages.length) return; i=ni; stopRead(); render(); }

  /* ── Редактор разметки (?edit=1) ─────────────────────────────────────
     Чистый экран разворота: двигаешь сами хотспоты (с подписью) и блок
     текста; × — удалить точку, тап по пустому месту — добавить. Внизу —
     тонкая полоска: ◀ N/30 ▶ и «Сохранить» (кладёт правки в память и
     скачивает файл <book_id>-razmetka.json для переноса в book.data.js). */
  const EDIT_MODE=(new URLSearchParams(location.search)).get("edit")==="1";
  // ключ хранения и имя файла — по книге (движок общий, работает для любой)
  const EDIT_ID=(BOOK.book_id||"book").replace(/[^a-z0-9_-]/gi,"");
  const EDIT_STORE=EDIT_ID+"_edit_v1";
  const edDirty=new Set();
  const edR=v=>Math.round(v*10)/10;
  function edPageObj(p){ const o={ n:p.n };
    if(p.hotspots&&p.hotspots.length) o.hotspots=p.hotspots.map(h=>({x:h.x,y:h.y,label:h.label}));
    if(p.textpos) o.textpos=p.textpos;
    if(p.badgepos) o.badgepos=p.badgepos; if(p.widgetpos) o.widgetpos=p.widgetpos; return o; }
  function edEdited(p){ return edDirty.has(p.n); }
  function applyTextPos(tp){ const tb=stage.querySelector(".textbox"); if(!tb) return;
    tb.style.left=tp.x+"%"; tb.style.top=tp.y+"%"; tb.style.right="auto"; tb.style.bottom="auto";
    tb.style.width=(tp.w||84)+"%"; tb.style.height="auto";
    tb.style.transform="translate(-50%,-50%)"; tb.style.justifyContent="center"; tb.style.alignItems="center"; }
  function applyPosEl(el,pos){ if(!el||!pos) return; el.style.left=pos.x+"%"; el.style.top=pos.y+"%"; el.style.right="auto"; el.style.bottom="auto"; el.style.transform="translate(-50%,-50%)"; }
  function edRefresh(){ const page=BOOK.pages[i]; renderWidgets(page); if(page.textpos)applyTextPos(page.textpos); if(page.badgepos)applyPosEl(factBadge,page.badgepos); if(page.widgetpos)applyPosEl(widgetBar,page.widgetpos); decorateEdit(); }
  function decorateEdit(){
    const page=BOOK.pages[i], hs=document.getElementById("hotspots");
    page.hotspots=page.hotspots||[];
    [...hs.children].forEach((d,idx)=>{
      d.onclick=null; d.style.pointerEvents="auto";
      const h=page.hotspots[idx]; if(!h) return;
      const tag=document.createElement("span"); tag.className="hs-tag";
      tag.textContent=(T(h.label)||("#"+(idx+1))); d.appendChild(tag);
      // без крестика: двигаем перетаскиванием; удаление — намеренное, долгим
      // нажатием с подтверждением (случайно не сработает). Любую правку
      // можно откатить кнопкой «Отменить» внизу.
      let drag=false, sx=0, sy=0, snapped=false, lp=null;
      d.addEventListener("pointerdown",e=>{ e.stopPropagation(); e.preventDefault();
        drag=true; snapped=false; sx=e.clientX; sy=e.clientY; d.classList.add("sel");
        if(d.setPointerCapture) d.setPointerCapture(e.pointerId);
        lp=setTimeout(()=>{ lp=null; drag=false; d.classList.remove("sel");
          if(confirm("Удалить эту точку?")){ edSnapshot(page); page.hotspots.splice(idx,1); edDirty.add(page.n); render(); }
        }, 650); });
      d.addEventListener("pointermove",e=>{ if(!drag) return;
        if(Math.abs(e.clientX-sx)>6||Math.abs(e.clientY-sy)>6){ if(lp){ clearTimeout(lp); lp=null; } }
        if(!lp && !snapped){ edSnapshot(page); snapped=true; }
        const r=hs.getBoundingClientRect();
        h.x=edR(Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100)));
        h.y=edR(Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100)));
        d.style.left=h.x+"%"; d.style.top=h.y+"%"; edDirty.add(page.n); edBarCount(); });
      d.addEventListener("pointerup",()=>{ drag=false; d.classList.remove("sel"); if(lp){ clearTimeout(lp); lp=null; } });
      d.addEventListener("pointercancel",()=>{ drag=false; if(lp){ clearTimeout(lp); lp=null; } });
    });
    // перетаскивание блока текста (свободное положение)
    const tb=stage.querySelector(".textbox");
    if(tb){ tb.style.pointerEvents="auto"; tb.style.cursor="grab"; tb.classList.add("ed-move");
      let td=false, tsnap=false;
      tb.addEventListener("pointerdown",e=>{ td=true; tsnap=false; const r=stage.getBoundingClientRect();
        if(!page.textpos){ const tr=tb.getBoundingClientRect();
          page.textpos={ x:edR((tr.left+tr.width/2-r.left)/r.width*100), y:edR((tr.top+tr.height/2-r.top)/r.height*100),
            w:edR(Math.min(92,tr.width/r.width*100)) }; applyTextPos(page.textpos); }
        if(tb.setPointerCapture) tb.setPointerCapture(e.pointerId); e.preventDefault(); });
      tb.addEventListener("pointermove",e=>{ if(!td) return; if(!tsnap){ edSnapshot(page); tsnap=true; } const r=stage.getBoundingClientRect();
        page.textpos.x=edR(Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100)));
        page.textpos.y=edR(Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100)));
        tb.style.left=page.textpos.x+"%"; tb.style.top=page.textpos.y+"%"; edDirty.add(page.n); edBarCount(); });
      tb.addEventListener("pointerup",()=>{ td=false; }); }
    // добавить точку — короткий тап по пустому месту картинки (лёгкий рефреш, без перезагрузки картинки → без мигания)
    const iw=stage.querySelector(".imgwrap");
    if(iw){ let ax=0,ay=0,amoved=false,adown=false;
      iw.addEventListener("pointerdown",e=>{ if(e.target.closest&&e.target.closest(".hotspot")) return; adown=true; amoved=false; ax=e.clientX; ay=e.clientY; });
      iw.addEventListener("pointermove",e=>{ if(adown&&(Math.abs(e.clientX-ax)>6||Math.abs(e.clientY-ay)>6)) amoved=true; });
      iw.addEventListener("pointerup",e=>{ if(!adown) return; adown=false; if(amoved) return; if(e.target.closest&&e.target.closest(".hotspot")) return;
        const r=hs.getBoundingClientRect();
        const x=edR(Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100))), y=edR(Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100)));
        edSnapshot(page); page.hotspots.push({x,y,label:{ru:"Новая точка"}}); edDirty.add(page.n); edRefresh(); }); }
    // верхние служебные плашки (бейдж, чипы сравнения/квиза) — тоже двигаем перетаскиванием
    function edMovable(el,key){ if(!el) return; if(getComputedStyle(el).display==="none"||!el.textContent.trim()) return;
      el.style.pointerEvents="auto"; el.classList.add("ed-move"); el.style.cursor="grab";
      [...el.children].forEach(c=>{ c.onclick=null; c.style.pointerEvents="none"; });
      let md=false, msnap=false;
      el.addEventListener("pointerdown",e=>{ e.stopPropagation(); md=true; msnap=false;
        if(!page[key]){ const dev=device.getBoundingClientRect(), r=el.getBoundingClientRect();
          page[key]={x:edR((r.left+r.width/2-dev.left)/dev.width*100), y:edR((r.top+r.height/2-dev.top)/dev.height*100)}; applyPosEl(el,page[key]); }
        if(el.setPointerCapture) el.setPointerCapture(e.pointerId); e.preventDefault(); });
      el.addEventListener("pointermove",e=>{ if(!md) return; if(!msnap){ edSnapshot(page); msnap=true; } const dev=device.getBoundingClientRect();
        page[key].x=edR(Math.max(0,Math.min(100,(e.clientX-dev.left)/dev.width*100)));
        page[key].y=edR(Math.max(0,Math.min(100,(e.clientY-dev.top)/dev.height*100)));
        applyPosEl(el,page[key]); edDirty.add(page.n); edBarCount(); });
      el.addEventListener("pointerup",()=>{ md=false; }); }
    edMovable(factBadge,"badgepos"); edMovable(widgetBar,"widgetpos");
    buildEditBar();
  }
  // история для отмены: снимок точек+текста страницы ДО изменения
  const edHist=[];
  function edSnapshot(p){ edHist.push({ n:p.n,
      hs:JSON.parse(JSON.stringify(p.hotspots||[])),
      tp:p.textpos?JSON.parse(JSON.stringify(p.textpos)):null,
      bp:p.badgepos?JSON.parse(JSON.stringify(p.badgepos)):null, wp:p.widgetpos?JSON.parse(JSON.stringify(p.widgetpos)):null });
    if(edHist.length>60) edHist.shift(); edBarCount(); }
  function edUndo(){ const s=edHist.pop(); if(!s){ edToast("Нечего отменять"); return; }
    const p=BOOK.pages.find(x=>x.n===s.n); if(!p) return;
    p.hotspots=s.hs; if(s.tp) p.textpos=s.tp; else delete p.textpos; if(s.bp) p.badgepos=s.bp; else delete p.badgepos; if(s.wp) p.widgetpos=s.wp; else delete p.widgetpos;
    i=BOOK.pages.indexOf(p); render(); edToast("Отменено"); }
  function buildEditBar(){
    let bar=document.getElementById("edBar");
    if(!bar){ bar=document.createElement("div"); bar.id="edBar"; document.body.appendChild(bar);
      bar.innerHTML=`<button id="edPrev" aria-label="Назад">◀</button>`+
        `<span id="edNum"></span>`+
        `<button id="edNext" aria-label="Вперёд">▶</button>`+
        `<button id="edUndo" aria-label="Отменить">↶</button>`+
        `<button id="edSave" class="pri">Сохранить</button>`;
      bar.querySelector("#edPrev").onclick=()=>{ if(i>0){ i--; render(); } };
      bar.querySelector("#edNext").onclick=()=>{ if(i<BOOK.pages.length-1){ i++; render(); } };
      bar.querySelector("#edUndo").onclick=edUndo;
      bar.querySelector("#edSave").onclick=edSave;
    }
    edBarCount();
  }
  function edBarCount(){ const el=document.getElementById("edNum"); if(!el) return;
    const done=BOOK.pages.filter(edEdited).length;
    el.innerHTML=`${BOOK.pages[i].n} / ${BOOK.pages.length}`+(done?` · <b>${done}✎</b>`:"");
    const u=document.getElementById("edUndo"); if(u) u.disabled=!edHist.length; }
  function edSave(){
    const data=BOOK.pages.filter(edEdited).map(edPageObj);
    const json=JSON.stringify(data,null,2);
    try{ localStorage.setItem(EDIT_STORE,json); }catch(e){}
    try{ const blob=new Blob([json],{type:"application/json"}), url=URL.createObjectURL(blob);
      const a=document.createElement("a"); a.href=url; a.download=EDIT_ID+"-razmetka.json";
      document.body.appendChild(a); a.click(); setTimeout(()=>{ a.remove(); URL.revokeObjectURL(url); },1200);
    }catch(e){}
    edToast(data.length?`Сохранено ✓ · ${data.length} стр. — пришли файл`:"Пока нечего сохранять");
  }
  function edLoadSaved(){ try{ const s=localStorage.getItem(EDIT_STORE); if(!s) return; const arr=JSON.parse(s);
    arr.forEach(o=>{ const p=BOOK.pages.find(x=>x.n===o.n); if(!p) return;
      if(o.hotspots) p.hotspots=o.hotspots; if(o.textpos) p.textpos=o.textpos; if(o.badgepos) p.badgepos=o.badgepos; if(o.widgetpos) p.widgetpos=o.widgetpos; edDirty.add(o.n); }); }catch(e){} }
  function edToast(msg){ let t=document.getElementById("edToast"); if(!t){ t=document.createElement("div"); t.id="edToast";
      t.style.cssText="position:fixed;left:50%;bottom:70px;transform:translateX(-50%);background:#2b2520;color:#fff;"+
        "padding:10px 18px;border-radius:20px;z-index:10002;font:700 13px Inter,sans-serif;transition:opacity .3s;max-width:88vw;text-align:center"; document.body.appendChild(t); }
    t.textContent=msg; t.style.opacity="1"; setTimeout(()=>{ t.style.opacity="0"; }, 2200); }

  /* режим «Игры»: витрина всех мини-игр (хаб «Игры книги») */
  const GAMES_MODE = (new URLSearchParams(location.search)).get("games")==="1";
  function gamesList(){
    // хаб — разворот с наибольшим числом sandbox-игр
    let hub=null, best=-1;
    BOOK.pages.forEach(p=>{ const n=(p.sandboxes||[]).length; if(n>best){ best=n; hub=p; } });
    return (hub&&hub.sandboxes)||[];
  }
  function gameMarkSrc(mark){ return "../img/icons/"+mark+"-mark.webp"; }
  function buildGamesMenu(){
    const menu=document.getElementById("gamesMenu");
    const list=gamesList();
    menu.innerHTML=`<div class="gm-head"><h1>${escapeHtml(T(GAMES_TITLE))}</h1><p>${escapeHtml(T(GAMES_SUB))}</p></div><div class="gm-list" role="list"></div>`;
    const listEl=menu.querySelector(".gm-list");
    list.forEach(sb=>{ const type=(typeof sb==="string")?sb:sb.type;
      const label=(typeof sb==="object"&&sb.title)?T(sb.title)
        :(typeof sb==="object"&&sb.chip)?T(sb.chip)
        :(SANDBOX_LABEL[type]?T(SANDBOX_LABEL[type]):type);
      const hintObj=(typeof sb==="object"&&sb.hint)||GAME_HINT[type];
      const hint=hintObj?T(hintObj):"";
      const b=document.createElement("button"); b.className="gm-row"; b.type="button"; b.setAttribute("role","listitem");
      // растровая иконка: sandbox.icon → BOOK.gameIcons → хаб *-mark.webp → эмодзи
      const mark=GAME_MARK[type];
      const ipath=(typeof sb==="object"&&sb.icon)||(BOOK.gameIcons&&BOOK.gameIcons[type])||(mark?gameMarkSrc(mark):null);
      const ico=ipath?`<img src="${escapeHtml(ipath)}" alt="" loading="lazy">`:(GAME_ICON[type]||"🎮");
      b.innerHTML=`<span class="gm-ico">${ico}</span><span class="gm-text"><span class="gm-name">${escapeHtml(label)}</span>${hint?`<span class="gm-hint">${escapeHtml(hint)}</span>`:""}</span><span class="gm-go" aria-hidden="true">›</span>`;
      if(ipath){ const img=b.querySelector(".gm-ico img"); if(img) img.onerror=()=>{ img.replaceWith(document.createTextNode(GAME_ICON[type]||"🎮")); }; }
      b.onclick=()=>launchSandbox(sb,b);
      listEl.appendChild(b);
    });
    menu.hidden=false;
  }
  function rerender(){ if(GAMES_MODE) buildGamesMenu(); else render(); }

  playBtn.onclick=()=> readMode ? stopRead() : startRead();
  document.getElementById("close").onclick=()=>stopRead();
  document.addEventListener("keydown",e=>{ if(!sheet.hidden && e.key==="Escape"){closeBubble();return;}
    if(e.key==="ArrowRight")go(1); else if(e.key==="ArrowLeft")go(-1);
    else if(e.key===" "){e.preventDefault();playBtn.click();} });

  // tap (left/right half) + light swipe (pointer, works for touch & mouse) + trackpad horizontal wheel
  const nav=document.getElementById("nav");
  let px=null,py=null,moved=false;
  nav.addEventListener("pointerdown",e=>{ px=e.clientX; py=e.clientY; moved=false; });
  nav.addEventListener("pointermove",e=>{ if(px==null)return;
    if(Math.abs(e.clientX-px)>6||Math.abs(e.clientY-py)>6) moved=true; });
  nav.addEventListener("pointerup",e=>{ if(px==null)return;
    const dx=e.clientX-px, dy=e.clientY-py;
    const hitTerm=(function(){ const el=document.elementFromPoint(e.clientX,e.clientY); return el&&el.closest&&el.closest(".w.term"); })();
    if(hitTerm){ if(!moved){ hitTerm.click(); } px=py=null; return; }   // tap on a glossary term -> open note, don't turn
    if(Math.abs(dx)>32 && Math.abs(dx)>Math.abs(dy)) go(dx<0?1:-1);            // light swipe
    else if(!moved){ const r=nav.getBoundingClientRect(); go((e.clientX-r.left)>r.width/2?1:-1); } // tap half
    px=py=null; });
  nav.addEventListener("pointercancel",()=>{ px=py=null; });

  // bottom scrubber: tap/drag to jump pages
  function syncScrub(){ const N=BOOK.pages.length, f=N>1? i/(N-1):0;
    scrubFill.style.width=(f*100)+"%"; scrubThumb.style.left=(f*100)+"%";
    scrub.setAttribute("aria-valuemin",1); scrub.setAttribute("aria-valuemax",N); scrub.setAttribute("aria-valuenow",i+1); }
  function scrubTo(cx){ const r=scrubTrack.getBoundingClientRect(); let f=(cx-r.left)/r.width;
    f=Math.max(0,Math.min(1,f)); const N=BOOK.pages.length, pg=Math.round(f*(N-1))+1;
    if(pg-1!==i){ i=pg-1; closeBubble(); render(); } }
  (function(){ let dn=false;
    scrub.addEventListener("pointerdown",e=>{ dn=true; scrub.classList.add("dragging"); stopRead(); scrubTo(e.clientX);
      if(scrub.setPointerCapture) scrub.setPointerCapture(e.pointerId); e.preventDefault(); });
    scrub.addEventListener("pointermove",e=>{ if(dn) scrubTo(e.clientX); });
    scrub.addEventListener("pointerup",()=>{ dn=false; scrub.classList.remove("dragging"); });
    scrub.addEventListener("pointercancel",()=>{ dn=false; scrub.classList.remove("dragging"); });
    scrub.addEventListener("keydown",e=>{ if(e.key==="ArrowRight"){go(1);} else if(e.key==="ArrowLeft"){go(-1);} }); })();

  // any tap outside the play button stops read-aloud mode
  document.addEventListener("pointerdown",e=>{ if(readMode && e.target && e.target.closest && !e.target.closest("#play")) stopRead(); }, true);

  // table of contents: tap the page counter
  function openToc(){ const layer=document.getElementById("tocLayer"), list=document.getElementById("tocList");
    document.getElementById("tocTitle").textContent=T(TOC_WORD);
    list.innerHTML="";
    BOOK.pages.forEach((p,pi)=>{ const b=document.createElement("button");
      b.className="toc-item"+(pi===i?" cur":"");
      b.innerHTML=`<span class="toc-num">${p.n}</span><span class="toc-name">${escapeHtml(p.toc?T(p.toc):"")}</span>`;
      b.onclick=()=>{ layer.hidden=true; goTo(p.n); };
      list.appendChild(b); });
    layer.hidden=false;
    const cur=list.querySelector(".cur"); if(cur) cur.scrollIntoView({block:"center"});
  }
  document.getElementById("tocX").onclick=()=>{ document.getElementById("tocLayer").hidden=true; };
  counter.onclick=openToc;
  let wlock=0;
  window.addEventListener("wheel",e=>{ if(!sheet.hidden) return;
    if(Math.abs(e.deltaX)>Math.abs(e.deltaY) && Math.abs(e.deltaX)>18){
      const t=Date.now(); if(t-wlock<480) return; wlock=t; go(e.deltaX>0?1:-1); } },{passive:true});

  // auto-detect display mode from viewport (phone / tablet / landscape)
  function applyMode(){
    const w=window.innerWidth, h=window.innerHeight;
    device.classList.remove("tablet","landscape");
    if(w>h){ if(w>=640) device.classList.add("landscape"); }
    else if(w>=600){ device.classList.add("tablet"); }
  }
  window.addEventListener("resize",()=>{ applyMode(); computeSizes(); fitText(); if(!sheet.hidden) place(); });
  window.addEventListener("orientationchange",()=>{ applyMode(); closeBubble(); computeSizes(); fitText(); });
  applyDir();
  if(EDIT_MODE){ device.classList.add("edit"); edLoadSaved(); }
  if(GAMES_MODE){ buildGamesMenu();
    const play=(new URLSearchParams(location.search)).get("play");
    if(play){
      const list=gamesList();
      const sb=list.find(s=>(typeof s==="object")&&(s.id===play||s.type===play));
      if(sb) setTimeout(()=>launchSandbox(sb,null),0);
    }
  }
  else { applyMode(); render(); computeSizes(); fitText(); }
})();

/* live-переключение языка из приложения: нажимаем соответствующую кнопку
   существующего переключателя — вся логика ре-рендера уже внутри неё. */
window.addEventListener("message",function(e){
  var d=e.data; if(!d||!d.type) return;
  if(d.type==="dinoLang" && d.lang){
    var idx=(window.BOOK&&window.BOOK.languages||[]).indexOf(d.lang);
    var btns=document.querySelectorAll("#langs .lang");
    if(idx>=0 && btns[idx] && btns[idx].getAttribute("aria-pressed")!=="true") btns[idx].click();
    return;
  }
  if(d.type==="bibleShell" && d.action==="theme"){
    document.documentElement.setAttribute("data-theme", d.theme==="dark" ? "dark" : "light");
    return;
  }
  /* остановить чтение/озвучку, когда приложение ушло из вкладки «Книга» */
  if(d.type==="bookStop" || d.type==="dinoStop"){
    var pb=document.getElementById("play");
    if(pb && pb.classList.contains("is-on")) pb.click();
    if(window.speechSynthesis){ try{ speechSynthesis.cancel(); }catch(_){} }
  }
});
