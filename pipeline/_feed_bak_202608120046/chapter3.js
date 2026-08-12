/* Лента «Библейские истории» — ГЛАВА 3 «Египет и Исход» (эпоха 3).
   Корзинка → Моисей → купина → море → манна → скрижали → Мариам.
   Гибрид §20: после каждой микротемы — задание «по прочитанному» (concept → BKT,
   §13); финал — order «Путь Исхода».
   Глава-ОБРАЗЕЦ разнообразия механик: вместо однотипного «выбор 1 из 3» —
   find (найди на картине), lant (посвети фонариком), tf (правда/нет),
   catch (лови нужное), count, check, order. Каждая микротема — свой тип. */
(window.FEED_CHAPTERS = window.FEED_CHAPTERS || []).push({
  deck:"biblejskie-istorii", chapter:3, audio:false,
  title:"Египет и Исход", emoji:"🌊", icon:"../img/icons/wave.webp", color:"#f4a261", cards: [

  /* ── Корзинка в тростнике ── */
  { id:"b3_01", kind:"art", img:"../img/plots_08_basket.webp", title:"Малыш в корзинке",
    knows:["basket"], text:"В Египте народу Иакова жилось тяжело. Мама спрятала малыша в корзинку и пустила по реке — подальше от беды." },
  { id:"b3_02", kind:"art", img:"../img/feed_b3_02_found.webp", title:"Найдёныш из реки",
    knows:["basket"], text:"Корзинку нашла дочь фараона. Малыша назвали Моисей — «спасённый из воды».",
    interact:{ type:"poke", bonus:"А старшая сестра Мариам всё это время следила за корзинкой с берега." } },
  /* find: найди на самой картине — корзинку и сестру Мариам в тростнике */
  { id:"b3_q_basket", kind:"find", img:"../img/feed_b3_q_basket.webp", board:"../img/feed_b3_q_basket.webp",
    title:"Найди на реке", ask:"Найди: ",
    items:[ {id:"basket", name:"корзинку с малышом", x:27, y:78, r:16},
            {id:"miriam", name:"сестру Мариам в тростнике", x:18, y:42, r:14} ] },

  /* ── Моисей ── */
  { id:"b3_03", kind:"art", img:"../img/heroes_06_moses.webp", title:"Моисей вырастает",
    knows:["moses"], text:"Моисей вырос во дворце фараона, но никогда не забывал свой народ." },
  { id:"b3_04", kind:"art", img:"../img/feed_b3_04_mission.webp", title:"Великое дело",
    knows:["moses"], text:"Именно Моисею выпало вывести народ из рабства — в долгий путь к свободе.",
    interact:{ type:"reveal", teaser:"Куда они шли?", hidden:"В землю, обещанную ещё Аврааму. Путь занял целых сорок лет." } },
  { id:"b3_q_moses", kind:"check", concept:"moses", img:"../img/feed_b3_q_moses.webp",
    title:"Вопрос по прочитанному", lines:["Что сделал Моисей для своего народа?"],
    interact:{ options:[ {t:"Вывел из рабства на свободу", ok:true}, {t:"Построил пирамиду"}, {t:"Стал фараоном"}, {t:"Вырыл колодец"} ],
      explain:"Верно! Моисей повёл народ из Египта на свободу." } },

  /* ── Неопалимая купина ── */
  { id:"b3_05", kind:"art", img:"../img/plots_09_bush.webp", title:"Чудо в пустыне",
    knows:["bush"], text:"Однажды Моисей увидел куст, который горел ярким пламенем — и не сгорал." },
  { id:"b3_06", kind:"art", img:"../img/feed_b3_06.webp", title:"Голос из пламени",
    knows:["bush"], text:"Из огня Бог позвал Моисея: «Иди к фараону. Выведи Мой народ!»",
    interact:{ type:"poke", bonus:"Этот куст так и называют — неопалимая купина, «несгорающий куст»." } },
  /* lant: в темноте пустыни посвети фонариком — найди куст, что горит и не сгорает */
  { id:"b3_q_bush", kind:"lant", concept:"bush", img:"../img/feed_b3_q_bush.webp",
    title:"Посвети фонариком", ask:"Веди пальцем в темноте — найди куст, что горит и не сгорает",
    target:{x:72, y:52, r:16}, done:"Вот он! Горит — и не сгорает." },

  /* ── Переход через море ── */
  { id:"b3_07", kind:"art", img:"../img/plots_10_sea.webp", title:"Погоня",
    knows:["sea"], text:"Фараон отпустил народ, но передумал — и погнался следом с целым войском." },
  { id:"b3_08", kind:"art", img:"../img/feed_b3_08.webp", title:"Море расступается",
    knows:["sea"], text:"И тут море расступилось! Народ прошёл посуху между двумя стенами воды, а погоня осталась позади.",
    interact:{ type:"reveal", teaser:"Как это выглядело?", hidden:"Справа и слева стояли стены воды, а под ногами было сухое дно." } },
  /* tf: правда или нет — надо подумать, а не выбрать из списка */
  { id:"b3_q_sea", kind:"tf", concept:"sea", img:"../img/feed_b3_q_sea.webp", title:"Правда или нет?",
    statement:"Народ переплыл море на лодках.", truth:false,
    explain:"Нет! Море расступилось, и народ прошёл посуху между стенами воды." },

  /* ── Манна небесная ── */
  { id:"b3_09", kind:"art", img:"../img/plots_11_manna.webp", title:"Еда с неба",
    knows:["manna"], text:"В пустыне не было еды. Но каждое утро с неба падала манна — сладкие белые крупинки." },
  { id:"b3_10", kind:"art", img:"../img/feed_b3_10.webp", title:"Каждый день — чудо",
    knows:["manna"], text:"Манна кормила народ все сорок лет пути.",
    interact:{ type:"poke", bonus:"Собирали ровно на один день: про запас манна не хранилась. Каждое утро — новое чудо." } },
  /* catch: лови только манну среди летящих крупинок (concept → граф знаний) */
  { id:"b3_q_manna", kind:"catch", concept:"manna", img:"../img/feed_b3_q_manna.webp", title:"Собери манну!",
    ask:"Лови только манну — сладкие крупинки с неба", need:4,
    good:["манна","манна","манна","манна"], bad:["камень","колючка","песок"],
    done:"Полная горсть манны — на целый день!" },

  /* ── Скрижали ── */
  { id:"b3_11", kind:"art", img:"../img/plots_12_tablets.webp", title:"Гора Синай",
    knows:["tablets"], text:"На горе Синай Моисей получил две каменные доски — скрижали." },
  { id:"b3_12", kind:"art", img:"../img/feed_b3_12.webp", title:"Десять главных правил",
    knows:["tablets"], text:"На скрижалях — десять заповедей: не обманывай, не кради, почитай маму и папу…" },
  { id:"b3_cnt10", kind:"count", img:"../img/feed_b3_cnt10.webp", icon:"../img/icons/tablets.webp", title:"Сосчитай заповеди", ask:"Сколько заповедей на скрижалях? Нажми на каждую.",
    emoji:"📜", n:10, done:"Десять заповедей!" },
  /* check: один классический выбор оставляем — он тоже нужен как тип */
  { id:"b3_q_tablets", kind:"check", concept:"tablets", img:"../img/feed_b3_q_tablets.webp",
    title:"Вопрос по прочитанному", lines:["Что было написано на скрижалях?"],
    interact:{ options:[ {t:"Десять заповедей", ok:true}, {t:"Карта пути"}, {t:"Имена фараонов"}, {t:"Рецепт манны"} ],
      explain:"Да! Десять главных правил доброй жизни." } },

  /* ── Мариам ── */
  { id:"b3_13", kind:"art", img:"../img/heroes_07_miriam.webp", title:"Песня Мариам",
    knows:["miriam"], text:"После чуда на море сестра Моисея Мариам первой запела песню радости." },
  { id:"b3_14", kind:"art", img:"../img/feed_b3_14.webp", title:"Праздник свободы",
    knows:["miriam"], text:"За ней подхватили все: пели, били в бубны и танцевали. Свобода!" },
  /* tf: правда или нет — про Мариам */
  { id:"b3_q_miriam", kind:"tf", concept:"miriam", img:"../img/feed_b3_q_miriam.webp", title:"Правда или нет?",
    statement:"После чуда на море Мариам легла спать.", truth:false,
    explain:"Нет! Мариам запела песню радости — и весь народ подхватил её." },

  /* ── финал главы: порядок событий ── */
  { id:"b3_order", kind:"order", concept:"moses", img:"../img/feed_b3_order.webp", title:"Путь Исхода",
    text:"Нажимай по порядку: что было сначала, что потом",
    done:"Весь путь Исхода — по порядку",
    items:[ {t:"Корзинка на реке"}, {t:"Горящий куст"}, {t:"Море расступилось"},
            {t:"Манна в пустыне"}, {t:"Скрижали на горе"} ] },
  { id:"b3_q_basket_tf", kind:"tf", concept:"basket", img:"../img/feed_b3_q_basket_tf.webp", title:"Корзинка на реке", statement:"Моисея нашли в корзинке на реке.", truth:true, explain:"Правда! Корзинку заметила дочь фараона." },
  { id:"b3_q_basket_check", kind:"check", concept:"basket", img:"../img/feed_b3_q_basket_check.webp", title:"Имя из воды", lines:["Что означает имя Моисей?"], interact:{options:[{t:"Спасённый из воды",ok:true},{t:"Сильный царь"},{t:"Певец"},{t:"Строитель"}],explain:"Верно! Малыша спасли из реки."}},
  { id:"b3_q_moses_tf", kind:"tf", concept:"moses", img:"../img/feed_b3_q_moses_tf.webp", title:"Куда повёл Моисей?", statement:"Моисей повёл народ обратно в Египет.", truth:false, explain:"Нет! Он выводил народ из рабства к свободе." },
  { id:"b3_q_moses_order", kind:"order", concept:"moses", img:"../img/feed_b3_q_moses_order.webp", title:"Дорога к свободе", text:"Нажимай по порядку", done:"Путь начался с важного поручения!", items:[{t:"Моисей растёт во дворце"},{t:"Слышит зов из куста"},{t:"Ведёт народ к свободе"}] },
  { id:"b3_q_bush_tf", kind:"tf", concept:"bush", img:"../img/feed_b3_q_bush_tf.webp", title:"Несгорающий куст", statement:"Куст горел, но не сгорал.", truth:true, explain:"Правда! Поэтому его и называют неопалимой купиной." },
  { id:"b3_q_bush_check", kind:"check", concept:"bush", img:"../img/feed_b3_q_bush_check.webp", title:"Кто позвал Моисея?", lines:["Откуда прозвучал голос?"], interact:{options:[{t:"Из пламени куста",ok:true},{t:"Из реки"},{t:"Из дворца"},{t:"Из корзинки"}],explain:"Да! Бог позвал Моисея из горящего куста."}},
  { id:"b3_q_sea_check", kind:"check", concept:"sea", img:"../img/feed_b3_q_sea_check.webp", title:"Как прошли море?", lines:["По чему шёл народ между стенами воды?"], interact:{options:[{t:"По сухому дну",ok:true},{t:"По мосту"},{t:"На лодках"},{t:"На спинах рыб"}],explain:"Верно! Море расступилось."}},
  { id:"b3_q_sea_order", kind:"order", concept:"sea", img:"../img/feed_b3_q_sea_order.webp", title:"Чудо у моря", text:"Нажимай по порядку", done:"Погоня осталась позади!", items:[{t:"Фараон посылает войско"},{t:"Море расступается"},{t:"Народ проходит посуху"}] },
  { id:"b3_q_manna_tf", kind:"tf", concept:"manna", img:"../img/feed_b3_q_manna_tf.webp", title:"Запас манны", statement:"Манну можно было хранить много недель.", truth:false, explain:"Нет! Её собирали на один день." },
  { id:"b3_q_manna_check", kind:"check", concept:"manna", img:"../img/feed_b3_q_manna_check.webp", title:"Где была манна?", lines:["Когда появлялась манна?"], interact:{options:[{t:"Каждое утро",ok:true},{t:"Только ночью"},{t:"Раз в год"},{t:"После дождя"}],explain:"Да! Каждое утро народ находил свежую манну."}},
  { id:"b3_q_tablets_tf", kind:"tf", concept:"tablets", img:"../img/feed_b3_q_tablets_tf.webp", title:"Сколько правил?", statement:"На скрижалях было десять заповедей.", truth:true, explain:"Правда! Это десять главных правил." },
  { id:"b3_q_tablets_order", kind:"order", concept:"tablets", img:"../img/feed_b3_q_tablets_order.webp", title:"Гора Синай", text:"Нажимай по порядку", done:"Скрижали получены на горе!", items:[{t:"Народ идёт по пустыне"},{t:"Моисей поднимается на гору"},{t:"Получает скрижали"}] },
  { id:"b3_q_miriam_check", kind:"check", concept:"miriam", img:"../img/feed_b3_q_miriam_check.webp", title:"После чуда", lines:["Что сделала Мариам у моря?"], interact:{options:[{t:"Запела песню",ok:true},{t:"Построила ковчег"},{t:"Уснула"},{t:"Спряталась"}],explain:"Верно! Она первой запела от радости."}},
  { id:"b3_q_miriam_tf", kind:"tf", concept:"miriam", img:"../img/feed_b3_q_miriam_tf.webp", title:"Праздник свободы", statement:"После песни Мариам народ танцевал.", truth:true, explain:"Правда! Все радовались свободе." },
  { id:"b3_q_manna_order", kind:"order", concept:"manna", img:"../img/feed_b3_q_manna_order.webp", title:"Утро в пустыне", text:"Нажимай по порядку", done:"Манна собрана вовремя!", items:[{t:"Наступает утро"},{t:"Появляется манна"},{t:"Народ собирает еду"}] },
  { id:"b3_q_tablets_check2", kind:"check", concept:"tablets", img:"../img/feed_b3_q_tablets_check2.webp", title:"Из чего скрижали?", lines:["Какими были доски с правилами?"], interact:{options:[{t:"Каменными",ok:true},{t:"Бумажными"},{t:"Деревянными"},{t:"Ледяными"}],explain:"Да! Это были две каменные доски."}},
  { id:"b3_end", kind:"art", img:"../img/feed_b3_end.webp", title:"Глава 3 пройдена!",
    text:"Из рабства — к свободе: через море, пустыню и гору Синай. Дальше — новая земля." }

]});
