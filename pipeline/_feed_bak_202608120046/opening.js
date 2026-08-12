/* Лента «Библейские истории» — ГЛАВА 1 «Начало мира» (эпоха 1).
   IMAGE-FIRST: каждая история — большая иллюстрация во весь экран, а факты
   спрятаны в светящихся окошках прямо НА картинке (kind:"scene", механика
   «Загляни» — как в «Кругосветке»). Тап по окошку открывает секрет карточкой
   поверх иллюстрации. Между сценами — задание «по прочитанному» и игры-счёт.
   Никаких «мёртвых» тапов и простыней текста. Узлы графа учат сами сцены
   (concepts). Обложки — чистые акварельные сцены тома (../img/).
   Разнообразие механик: закрепление каждой микротемы — своим типом
   (order/find/tf/catch/check), а не однотипным «выбор 1 из 3». */
window.FEED_OPENING = { deck:"biblejskie-istorii", chapter:1, audio:false,
  title:"Начало мира", emoji:"🌍", icon:"../img/icons/sunmoon.webp", color:"#8ecae6", cards: [

  /* ── приветствие: куда попал ребёнок ── */
  { id:"b1_welcome", kind:"sys", img:"../img/book-cover.webp", icon:"../img/icons/book-mark.webp",
    title:"Библейские истории",
    lines:["Здесь вся Библия оживает — от первого дня мира до звезды над Вифлеемом.",
           "Листай вверх, нажимай светящиеся окошки на картинках и отвечай на вопросы — так ты соберёшь все истории!"],
    cta:"Листай вверх, чтобы начать ↑" },

  /* ── Сотворение мира — большая сцена с окошками ── */
  { id:"b1_creation", kind:"scene", img:"../img/plots_01_creation.webp", concepts:["creation"],
    title:"Как рождался мир", intro:"Нажми светящиеся окошки — узнай, как появился мир!",
    spots:[
      { x:30, y:20, icon:"../img/icons/sun.webp", title:"«Да будет свет!»",
        text:"Сначала была только тьма. Бог сказал: «Да будет свет!» — так появились день и ночь." },
      { x:50, y:34, title:"Небо и птицы",
        text:"Появилось небо, а в нём — облака и птицы. Моря наполнились рыбами." },
      { x:58, y:70, title:"Звери земные",
        text:"Земля покрылась травой и деревьями, по ней пошли звери. Мир стал живым!" },
      { x:28, y:66, title:"И человек",
        text:"А в самом конце Бог создал человека — беречь этот прекрасный новый мир." }
    ] },
  /* order: расставь по порядку, как рождался мир (учит порядок творения) */
  { id:"b1_q_creation", kind:"order", concept:"creation", img:"../img/feed_b1_q_creation.webp", title:"Как рождался мир",
    text:"Нажимай по порядку: что было сначала, что потом",
    done:"Верно! Так и рождался мир — от света до человека.",
    items:[ {t:"«Да будет свет!»"}, {t:"Небо и птицы"}, {t:"Звери на земле"}, {t:"И человек" } ] },
  { id:"b1_cnt7", kind:"count", img:"../img/feed_b1_cnt7.webp", icon:"../img/icons/sun.webp", title:"Сосчитай дни",
    ask:"Нажми дни творения по порядку — от первого к седьмому.", emoji:"☀️", n:7, ordered:true,
    done:"Семь дней творения!",
    /* days + ordered: плитки перемешаны; клик в хронологическом порядке 1→7 */
    days:[
      { t:"Свет", en:"Light", emoji:"💡" },
      { t:"Небо", en:"Sky", emoji:"☁️" },
      { t:"Суша и растения", en:"Land and plants", emoji:"🌱" },
      { t:"Солнце, луна и звёзды", en:"Sun, moon and stars", emoji:"☀️" },
      { t:"Рыбы и птицы", en:"Fish and birds", emoji:"🐟" },
      { t:"Звери и человек", en:"Animals and people", emoji:"🦁" },
      { t:"День покоя", en:"Day of rest", emoji:"😴" }
    ] },

  /* ── Райский сад — сцена ── */
  { id:"b1_eden", kind:"scene", img:"../img/plots_02_eden.webp", concepts:["eden"],
    title:"Райский сад", intro:"Нажми окошки — загляни в сад Эдем!",
    spots:[
      { x:42, y:14, title:"Особое дерево",
        text:"В саду росло особое дерево. Его плоды трогать было нельзя — единственный запрет." },
      { x:48, y:54, title:"Первые люди",
        text:"Адама и Еву поселили в чудесном саду Эдем, где всегда тепло и вкусно." },
      { x:50, y:73, title:"Друзья-звери",
        text:"Адам придумал имена всем зверям и птицам. Первый в мире учёный!" }
    ] },
  /* find: найди в саду Эдем особое дерево и первых людей (координаты под feed_b1_q_eden) */
  { id:"b1_q_eden", kind:"find", img:"../img/feed_b1_q_eden.webp", board:"../img/feed_b1_q_eden.webp",
    title:"Найди в саду Эдем", ask:"Найди: ",
    items:[ {id:"eden", name:"дерево с особым плодом", x:32, y:28, r:16},
            {name:"первых людей в саду", x:52, y:52, r:16} ] },

  /* ── Ной, ковчег и радуга — одна богатая сцена (учит 3 узла) ── */
  { id:"b1_ark", kind:"scene", img:"../img/plots_03_ark.webp", concepts:["noah","ark","rainbow"],
    title:"Ковчег Ноя", intro:"Нажми окошки — вся история потопа на одной картинке!",
    spots:[
      { x:35, y:52, knows:"noah", title:"Честный Ной",
        text:"Люди забыли про добро — только честный Ной остался. Бог велел ему строить ковчег." },
      { x:25, y:40, knows:"ark", title:"Плавучий зоопарк",
        text:"Ной собрал в ковчег свою семью и по паре всех зверей. Целый плавучий зоопарк!" },
      { x:67, y:33, icon:"../img/icons/dove.webp", knows:"ark", title:"Голубь с веточкой",
        text:"После дождя Ной выпустил голубя. Тот вернулся с зелёной веточкой — земля близко!" },
      { x:60, y:14, icon:"../img/icons/rainbow.webp", knows:"rainbow", title:"Радуга",
        text:"В небе вспыхнула радуга — добрый знак: такого потопа больше никогда не будет." }
    ] },
  /* colors: выбери 7 цветов радуги среди 10 квадратов (3 ложных) */
  { id:"b1_cnt7b", kind:"colors", concept:"rainbow", img:"../img/plots_04_rainbow.webp",
    icon:"../img/icons/rainbow.webp", title:"Цвета радуги",
    ask:"Сколько цветов у радуги? Выбери все семь.", need:7, done:"Семь цветов радуги!",
    colors:[
      {c:"#e53935", ok:true,  name:"красный"},
      {c:"#fb8c00", ok:true,  name:"оранжевый"},
      {c:"#fdd835", ok:true,  name:"жёлтый"},
      {c:"#43a047", ok:true,  name:"зелёный"},
      {c:"#4fc3f7", ok:true,  name:"голубой"},
      {c:"#1e88e5", ok:true,  name:"синий"},
      {c:"#8e24aa", ok:true,  name:"фиолетовый"},
      {c:"#795548", ok:false, name:"коричневый"},
      {c:"#ec407a", ok:false, name:"розовый"},
      {c:"#9e9e9e", ok:false, name:"серый"}
    ] },
  /* tf: правда или нет — про упорство Ноя */
  { id:"b1_q_noah", kind:"tf", concept:"noah", img:"../img/heroes_01_noah.webp", title:"Правда или нет?",
    statement:"Ной бросил стройку, когда над ним смеялись.", truth:false,
    explain:"Нет! Ной достроил ковчег до конца — несмотря на все насмешки." },
  /* catch: собери зверей в ковчег — по паре, а рыбам потоп не страшен (ловушка).
     failOnWrong: чужой тап → сброс попытки и повтор сразу (⭐ только за чистый сбор) */
  { id:"b1_q_ark", kind:"catch", concept:"ark", img:"../img/feed_ark_gather_bg.webp",
    title:"Собери зверей в ковчег!",
    ask:"Лови только зверей — рыбам потоп не страшен", need:5,
    failOnWrong:true,
    good:[
      {t:"лев", img:"../img/feed_ark_animal_lion.webp"},
      {t:"слон", img:"../img/feed_ark_animal_elephant.webp"},
      {t:"заяц", img:"../img/feed_ark_animal_hare.webp"},
      {t:"сова", img:"../img/feed_ark_animal_owl.webp"},
      {t:"медведь", img:"../img/feed_ark_animal_bear.webp"}
    ],
    bad:[
      {t:"рыбка", img:"../img/feed_ark_animal_fish.webp"},
      {t:"камень", img:"../img/feed_ark_animal_stone.webp"}
    ],
    done:"Полный ковчег зверей — по паре каждого!",
    fail:"Проверка не пройдена — в ковчег только звери!" },
  /* check: один классический выбор оставляем — он тоже нужен как тип */
  { id:"b1_q_rainbow", kind:"check", concept:"rainbow", img:"../img/feed_b1_q_rainbow.webp",
    title:"Вопрос по прочитанному", lines:["Знаком чего стала радуга?"],
    interact:{ options:[ {t:"Потопа больше не будет", ok:true}, {t:"Скоро пойдёт дождь"}, {t:"Пора строить ковчег"}, {t:"Наступила зима"} ],
      explain:"Верно! Радуга — доброе обещание: такого потопа больше не будет." } },

  /* ── Вавилонская башня — сцена ── */
  { id:"b1_babel", kind:"scene", img:"../img/plots_05_babel.webp", concepts:["babel"],
    title:"Вавилонская башня", intro:"Нажми окошки — узнай про самую высокую стройку!",
    spots:[
      { x:50, y:15, title:"До самого неба",
        text:"Люди задумали башню до самого неба — чтобы прославиться. И строили всё выше." },
      { x:45, y:84, title:"Разные языки",
        text:"Вдруг все заговорили на разных языках, перестали понимать друг друга — и разошлись." },
      { x:26, y:88, title:"Древние башни",
        text:"Такие башни-храмы правда строили в древности — их называли зиккураты." }
    ] },
  /* tf: правда или нет — почему разошлись строители башни */
  { id:"b1_q_babel", kind:"tf", concept:"babel", img:"../img/feed_b1_q_babel.webp", title:"Правда или нет?",
    statement:"Строители башни разошлись, потому что кончились кирпичи.", truth:false,
    explain:"Нет! Они вдруг заговорили на разных языках, перестали понимать друг друга — и разошлись." },

  { id:"b1_q_creation_tf", kind:"tf", concept:"creation", img:"../img/feed_b1_q_creation_tf.webp", title:"Свет был первым?",
    statement:"Сначала появился свет, а потом — люди.", truth:true,
    explain:"Правда! Свет был в самом начале, а человек появился в конце творения." },
  { id:"b1_q_eden_tf", kind:"tf", concept:"eden", img:"../img/feed_b1_q_eden_tf.webp", title:"Один запрет", 
    statement:"В Эдемском саду нельзя было трогать плоды с любого дерева.", truth:false,
    explain:"Нет! Особенным было только одно дерево." },
  { id:"b1_q_ark_order", kind:"order", concept:"ark", img:"../img/feed_b1_q_ark_order.webp", title:"Путь ковчега",
    text:"Нажимай по порядку: что было сначала, что потом",
    done:"Верно! Так закончился большой дождь.",
    items:[{t:"Ной строит ковчег"},{t:"Звери входят парами"},{t:"Голубь несёт веточку"},{t:"Появляется радуга"}] },
  { id:"b1_q_rainbow_tf", kind:"tf", concept:"rainbow", img:"../img/feed_b1_q_rainbow_tf.webp", title:"Обещание в небе",
    statement:"Радуга стала добрым знаком после потопа.", truth:true,
    explain:"Правда! Она напомнила Ною о добром обещании." },
  { id:"b1_q_babel_check", kind:"check", concept:"babel", img:"../img/feed_b1_q_babel_check.webp",
    title:"Почему стройка встала?", lines:["Что помешало людям строить башню дальше?"],
    interact:{ options:[{t:"Они перестали понимать языки",ok:true},{t:"Спряталось солнце"},{t:"Уехали верблюды"},{t:"Закончилась вода"}],
      explain:"Верно! Люди заговорили по-разному и не смогли договориться." } },
  { id:"b1_q_noah_check", kind:"check", concept:"noah", img:"../img/feed_b1_q_noah_check.webp",
    title:"Кого спас Ной?", lines:["Кто плыл в ковчеге вместе с Ноем?"],
    interact:{ options:[{t:"Семья и звери",ok:true},{t:"Только моряки"},{t:"Только птицы"},{t:"Целый город"}],
      explain:"Да! Ной взял семью и по паре зверей." } },
  { id:"b1_q_eden_order", kind:"order", concept:"eden", img:"../img/feed_b1_q_eden_order.webp", title:"История сада",
    text:"Нажимай по порядку: что было сначала, что потом",
    done:"Сад Эдем запомнился правильно!",
    items:[{t:"Бог создаёт сад"},{t:"В саду живут Адам и Ева"},{t:"Адам даёт имена зверям"}] },
  { id:"b1_q_creation_check", kind:"check", concept:"creation", img:"../img/feed_b1_q_creation_check.webp",
    title:"Кто появился последним?", lines:["Кого Бог создал в самом конце?"],
    interact:{ options:[{t:"Человека",ok:true},{t:"Рыб"},{t:"Птиц"},{t:"Деревья"}],
      explain:"Верно! Человеку доверили беречь мир." } },
  { id:"b1_q_ark_tf", kind:"tf", concept:"ark", img:"../img/feed_b1_q_ark_tf.webp", title:"Рыбы в ковчеге?",
    statement:"Ной брал в ковчег рыб, чтобы спасти их от воды.", truth:false,
    explain:"Нет! Рыбам вода не страшна — в ковчег вошли сухопутные звери и птицы." },
  { id:"b1_q_babel_order", kind:"order", concept:"babel", img:"../img/feed_b1_q_babel_order.webp", title:"Башня и языки",
    text:"Нажимай по порядку: что произошло с людьми",
    done:"Правильно! Гордая стройка остановилась.",
    items:[{t:"Люди задумали высокую башню"},{t:"Все заговорили разными языками"},{t:"Строители разошлись"}] },
  { id:"b1_q_rainbow_check", kind:"check", concept:"rainbow", img:"../img/feed_b1_q_rainbow_check.webp",
    title:"Сколько цветов?", lines:["Сколько цветов обычно называют у радуги?"],
    interact:{ options:[{t:"Семь",ok:true},{t:"Три"},{t:"Пять"},{t:"Десять"}],
      explain:"Верно! У радуги семь цветов." } },
  { id:"b1_q_eden_check", kind:"check", concept:"eden", img:"../img/feed_b1_q_eden_check.webp",
    title:"Первый учёный", lines:["Что делал Адам для зверей?"],
    interact:{ options:[{t:"Придумывал им имена",ok:true},{t:"Строил им домики"},{t:"Учился у них летать"},{t:"Красил им хвосты"}],
      explain:"Да! Адам давал имена всем зверям и птицам." } },

  { id:"b1_q_noah_order", kind:"order", concept:"noah", img:"../img/feed_b1_q_noah_order.webp", title:"История Ноя",
    text:"Нажимай по порядку", done:"Ной дошёл до конца!",
    items:[{t:"Ной слышит повеление"},{t:"Строит ковчег"},{t:"Спасает семью и зверей"}] },
  { id:"b1_q_creation_order2", kind:"order", concept:"creation", img:"../img/feed_b1_q_creation_order2.webp", title:"От света к отдыху",
    text:"Нажимай по порядку", done:"Семь дней на месте!",
    items:[{t:"Появляется свет"},{t:"Появляются звери"},{t:"Появляется человек"},{t:"День отдыха"}] },
  { id:"b1_q_eden_tf2", kind:"tf", concept:"eden", img:"../img/feed_b1_q_eden_tf2.webp", title:"Тёплое место",
    statement:"В саду Эдем всегда было тепло и всего хватало.", truth:true,
    explain:"Правда! Это был чудесный сад." },
  { id:"b1_q_rainbow_order", kind:"order", concept:"rainbow", img:"../img/feed_b1_q_rainbow_order.webp", title:"После потопа",
    text:"Нажимай по порядку", done:"Обещание в небе!",
    items:[{t:"Дождь кончается"},{t:"Ной благодарит"},{t:"В небе радуга"}] },
  { id:"b1_end", kind:"art", img:"../img/feed_b1_end.webp", title:"Глава 1 пройдена!",
    text:"Ты прошёл самое начало: мир, сад, ковчег, радугу и башню. Дальше — шатры патриархов." }

]};
