/* Витрина «Все проекты»: список продуктов, папки, поиск, прогресс.

   Вынесено из index.html отдельным файлом. Инлайн-блок дорос до
   27 137 байт при лимите iOS 21 504 — на iPhone WebKit такой блок
   может не выполнить, и витрина осталась бы пустой. Лимит держится
   в инвариантах платформы ровно за этим, а поймали превышение
   случайно: замерили, добавляя строку версии.

   Правило простое: логика витрины живёт здесь, в index.html
   остаются только теги и подключения. */
/* ───────────────────────────────────────────────────────────────────────────
   РЕЕСТР ПРОЕКТОВ-КАРТ.
   Чтобы добавить новый проект в навигатор — допиши сюда один объект:
     face — лицо карты (картинка-обложка проекта, WebP/JPG 2:3),
     back — рубашка/оборот (если нет — поставь тот же файл, что и face),
     href — точка входа проекта (его index.html).
   Карты показываются «иконостасом» без подписей; имя проекта несёт сама обложка.
   ─────────────────────────────────────────────────────────────────────────── */
const PROJECTS=[
  { face:"decks/angliyskiy-5-9/cover.svg",
    back:"decks/angliyskiy-5-9/cover.svg",
    href:"decks/angliyskiy-5-9/index.html", direct:true },

  /* «Иллюстрированный словарь на сценах» — прототип словаря-тренажёра
     (облачка-подписи на сцене + интервальные повторения). По решению
     владельца 01.08.2026 стоит рядом с курсом «Английский 5–9».
     Не путать с illyustrirovannyy-slovar («Английский СТАРТЕР»). */
  { face:"decks/slovar-na-stsenah/cover.webp",
    back:"decks/slovar-na-stsenah/cover.webp",
    href:"decks/slovar-na-stsenah/flip3d/index.html", direct:true },

  /* «MYP 1» — подготовка к вступительным в Grade 6 по семи предметам:
     теория с разбором по-русски, три пробных варианта с автопроверкой,
     словарь с интервальным повторением. Самодостаточный проект (перенесён
     из отдельного репозитория), ядро core/ не задействует. */
  { face:"decks/myp1/cover.webp",
    back:"decks/myp1/cover.webp", emoji:"🎓", age:"10–12",
    href:"decks/myp1/index.html", direct:true },

  { face:"decks/detskaya-bibliya/cover.webp",
    back:"decks/detskaya-bibliya/cover.webp",
    href:"decks/detskaya-bibliya/index.html", direct:true },

  /* «Фотобанк» — служебный инструмент редакции: поиск фото по стокам
     (Unsplash/Pexels/Openverse/Wikimedia + переходы в платные). Не колода.
     По решению владельца — рядом с «Иконостасом стилей». */
  { face:"decks/fotobank/cover.webp",
    back:"decks/fotobank/cover.webp",
    href:"decks/fotobank/index.html", direct:true },

  { face:"decks/okruzhayushchiy-mir/assets/cards/01_zolotaya_osen_sobira.webp",
    back:"decks/okruzhayushchiy-mir/assets/cards/01_zolotaya_osen_sobira_back.webp",
    href:"decks/okruzhayushchiy-mir/index.html" },

  { face:"decks/kulturnyy-pasport/sprites/cards/07_bolshoi.jpg",
    back:"decks/kulturnyy-pasport/sprites/cards/07_bolshoi_back.jpg",
    href:"decks/kulturnyy-pasport/index.html", folder:"culture" },

  { face:"decks/sverdlovskiy-muzey/sprites/cards/card_10.jpg",
    back:"decks/sverdlovskiy-muzey/sprites/cards/card_10_back.jpg",
    href:"decks/sverdlovskiy-muzey/index.html", folder:"culture" },

  { face:"decks/kak-vse-ustroeno/assets/faces/01.webp",
    back:"decks/kak-vse-ustroeno/assets/backs/01.webp",
    href:"decks/kak-vse-ustroeno/index.html" },

  { face:"decks/geografiya-5-6/assets/cover_face.webp",
    back:"decks/geografiya-5-6/assets/cover_face.webp",
    href:"decks/geografiya-5-6/index.html", noflip:true },

  { face:"decks/padel/assets/cards/p01.webp",
    back:"decks/padel/assets/cards/p01_back.webp",
    href:"decks/padel/index.html", folder:"sport" },

  { face:"decks/english-a0/assets/d1/card_01.jpg",
    back:"decks/english-a0/assets/d1/card_01_back.jpg",
    href:"decks/english-a0/index.html" },

  { face:"decks/illyustrirovannyy-slovar/assets/scenes/card01_family.webp",
    back:"decks/illyustrirovannyy-slovar/assets/scenes/card01_family.webp",
    href:"decks/illyustrirovannyy-slovar/index.html", direct:true },

  { face:"decks/ochen-strannye-dela/assets/cards/01.webp",
    back:"decks/ochen-strannye-dela/assets/cards/01_back.webp",
    href:"decks/ochen-strannye-dela/index.html" },

  { face:"decks/maynkraft/assets/cards/01.webp",
    back:"decks/maynkraft/assets/cards/01_back.webp",
    href:"decks/maynkraft/index.html" },

  { face:"decks/shahmaty/assets/cards/01.webp",
    back:"decks/shahmaty/assets/cards/01_back.webp",
    href:"decks/shahmaty/index.html", folder:"sport" },

  { face:"decks/arhitekturnye-shedevry-mira/assets/cards/01.webp",
    back:"decks/arhitekturnye-shedevry-mira/assets/cards/01_back.webp",
    href:"decks/arhitekturnye-shedevry-mira/index.html" },

  { face:"decks/redkie-zhivotnye/assets/cards/01.webp",
    back:"decks/redkie-zhivotnye/assets/cards/01_back.webp",
    href:"decks/redkie-zhivotnye/index.html" },

  { face:"decks/russian-premier-league/assets/cards/01.webp",
    back:"decks/russian-premier-league/assets/cards/01_back.webp",
    href:"decks/russian-premier-league/index.html", folder:"sport" },

  { face:"decks/muzei-moskvy/assets/cover.webp",
    back:"decks/muzei-moskvy/assets/back.webp",
    href:"decks/muzei-moskvy/index.html", folder:"culture" },

  { face:"decks/kak-ustroen-ii/assets/cards/01.webp",
    back:"decks/kak-ustroen-ii/assets/cards/01_back.webp",
    href:"decks/kak-ustroen-ii/index.html" },

  { face:"decks/sem-chudes-sveta/assets/tile.webp",
    back:"decks/sem-chudes-sveta/assets/tile.webp",
    href:"decks/sem-chudes-sveta/index.html" },

  /* «Робоборик» — новый проект, пока пустая оболочка (decks/roboborik):
     заставка + 4 вкладки-заглушки. Иконка временная, не эталон. */
  { face:"decks/roboborik/cover.webp",
    back:"decks/roboborik/cover.webp",
    href:"decks/roboborik/index.html", direct:true },

  /* ── Работающие энциклопедии — первыми (порядок владельца:
     Страны мира · Библейские истории · Подводный мир · Тело человека) ── */
  { face:"decks/strany-mira/cover.webp",
    back:"decks/strany-mira/cover.webp",
    href:"decks/strany-mira/index.html", direct:true, folder:"enc" },

  /* Та же Кругосветка на английском — своя обложка/иконка, запуск сразу по-en. */
  { face:"decks/strany-mira/cover-en.webp",
    back:"decks/strany-mira/cover-en.webp",
    href:"decks/strany-mira/index.html?lang=en", direct:true, folder:"enc" },

  /* ── Материалы «Страны мира»: сперва ролики, затем печать ── */
  { face:"decks/strany-mira/promo/tiles/promo-ru.webp",
    href:"decks/strany-mira/promo/promo-9x16.mp4", direct:true, folder:"media_sm" },
  { face:"decks/strany-mira/promo/tiles/promo-en.webp",
    href:"decks/strany-mira/promo/promo-9x16-en.mp4", direct:true, folder:"media_sm" },

  { face:"decks/strany-mira/print/tiles/nabor-ru.webp",
    href:"decks/strany-mira/print/strany-mira-nabor-30-ru.pdf", direct:true, folder:"media_sm" },
  { face:"decks/strany-mira/print/tiles/nabor-en.webp",
    href:"decks/strany-mira/print/strany-mira-nabor-30-en.pdf", direct:true, folder:"media_sm" },
  { face:"decks/strany-mira/print/tiles/guide-ru.webp",
    href:"decks/strany-mira/print/rukovodstvo-ru.pdf", direct:true, folder:"media_sm" },
  { face:"decks/strany-mira/print/tiles/guide-en.webp",
    href:"decks/strany-mira/print/rukovodstvo-en.pdf", direct:true, folder:"media_sm" },
  { face:"decks/strany-mira/print/tiles/zadaniya-ru.webp",
    href:"decks/strany-mira/print/strany-mira-zadaniya-ru.pdf", direct:true, folder:"media_sm" },
  { face:"decks/strany-mira/print/tiles/zadaniya-en.webp",
    href:"decks/strany-mira/print/strany-mira-zadaniya-en.pdf", direct:true, folder:"media_sm" },

  /* «Мировое искусство» — энциклопедия искусства на ядре оболочки Кругосветки:
     лента по залам-эпохам, «Что это?», галерея. Каркас-прототип v0. */
  { face:"decks/mirovoe-iskusstvo/cover.webp",
    back:"decks/mirovoe-iskusstvo/cover.webp",
    href:"decks/mirovoe-iskusstvo/index.html", direct:true, folder:"enc" },

  /* «Изобретариум» — энциклопедия великих изобретений на том же
     ядре оболочки (донор — «Мировое искусство»): лента по эпохам от колеса
     до интернета, «Что это?», коллекция. Каркас-прототип v0. */
  { face:"decks/izobreteniya/cover.webp",
    back:"decks/izobreteniya/cover.webp",
    href:"decks/izobreteniya/index.html", direct:true, folder:"enc" },

  /* «Библейские истории» — единый том: вход — Лента (feed), базовая оболочка;
     остальные режимы (Карты/Книги/Стройка/Словарик/Родителям) — нижним меню. */
  { face:"decks/biblejskie-istorii/cover.webp",
    back:"decks/biblejskie-istorii/cover.webp",
    href:"decks/biblejskie-istorii/feed/index.html", direct:true, folder:"enc" },

  { face:"decks/podvodnyy-mir/cover.webp",
    back:"decks/podvodnyy-mir/cover.webp",
    href:"decks/podvodnyy-mir/feed/index.html", direct:true, folder:"enc" },

  /* «Тело человека» — домашнее меню продукта: Лента, Галерея, Книга, Игры и
     раздел «Родителям» (настройки, язык, статистика). Лента-энциклопедия —
     флагман; остальные части подключены из decks/moyo-telo через iframe. */
  { face:"decks/telo-cheloveka/cover.webp",
    back:"decks/telo-cheloveka/cover.webp", emoji:"🧠",
    href:"decks/telo-cheloveka/feed/index.html", direct:true, folder:"enc" },

  /* ── Остальные энциклопедии и симуляторы ── */
  /* «Динозавры» — вход через ленту-энциклопедию (общий движок core/engines/feed);
     том (карты/книга/скелет/игры) встроен вкладками ленты */
  { face:"decks/dinozavry/assets/cover.webp",
    back:"decks/dinozavry/assets/cover.webp",
    href:"decks/dinozavry/feed/index.html", direct:true, folder:"enc" },

  /* «Дикие животные» и «Птицы» — вход через ленту-энциклопедию (общий движок
     core/engines/feed, как у «Подводного мира»); том встроен вкладками ленты */
  { face:"decks/dikie-zhivotnye/cover.webp",
    back:"decks/dikie-zhivotnye/cover.webp",
    href:"decks/dikie-zhivotnye/feed/index.html", direct:true, folder:"enc" },

  { face:"decks/ptitsy-mira/cover.webp",
    back:"decks/ptitsy-mira/cover.webp",
    href:"decks/ptitsy-mira/feed/index.html", direct:true, folder:"enc" },

  { face:"decks/podvodnyy-mir/sim/cover.webp",
    back:"decks/podvodnyy-mir/sim/cover.webp",
    href:"decks/podvodnyy-mir/sim/index.html", direct:true, folder:"enc" },

  { face:"decks/kosmodrom/cover.webp",
    back:"decks/kosmodrom/cover.webp",
    href:"decks/kosmodrom/index.html", direct:true, folder:"enc" },

  { face:"decks/moyo-telo/cover.webp",
    back:"decks/moyo-telo/cover.webp",
    href:"decks/moyo-telo/index.html", direct:true, folder:"enc" },

  { face:"decks/ptitsy-mira/globe3d/cover.webp",
    back:"decks/ptitsy-mira/globe3d/cover.webp",
    href:"decks/ptitsy-mira/globe3d/index.html", direct:true, folder:"enc" },

  { face:"decks/solnechnaya-sistema/cover.webp",
    back:"decks/solnechnaya-sistema/cover.webp",
    href:"decks/solnechnaya-sistema/index.html", direct:true, folder:"enc" },

  /* «Речь» — лестница «звук раньше буквы» (правка методистов):
     родитель видит порядок, в котором покупать и заниматься */
  { face:"decks/garmoshki/assets/cover_tile.webp",
    back:"decks/garmoshki/assets/cover_tile.webp", age:"0–1",
    href:"decks/garmoshki/index.html", direct:true, folder:"rech" },

  { face:"decks/boltalki/assets/cover_tile.webp",
    back:"decks/boltalki/assets/cover_tile.webp", age:"0–3",
    href:"decks/boltalki/index.html", direct:true, folder:"rech" },

  { face:"decks/bormotalki/assets/cover_tile.webp",
    back:"decks/bormotalki/assets/cover_tile.webp", age:"3–5",
    href:"decks/bormotalki/index.html", direct:true, folder:"rech" },

  { face:"decks/sluh/assets/cover_tile.webp",
    back:"decks/sluh/assets/cover_tile.webp", age:"4–6",
    href:"decks/sluh/index.html", direct:true, folder:"rech" },

  { face:"decks/azbuka/assets/cover_tile.webp",
    back:"decks/azbuka/assets/cover_tile.webp", age:"4–6",
    href:"decks/azbuka/index.html", direct:true, folder:"rech" },

  { face:"decks/skorogovorki/assets/cover_tile.webp",
    back:"decks/skorogovorki/assets/cover_tile.webp", age:"5–7",
    href:"decks/skorogovorki/index.html", direct:true, folder:"rech" },

  { face:"decks/istorii/assets/cover_tile.webp",
    back:"decks/istorii/assets/cover_tile.webp", age:"4–7",
    href:"decks/istorii/index.html", direct:true, folder:"rech" },

  { face:"decks/fonetika/assets/cover_tile.webp",
    back:"decks/fonetika/assets/cover_tile.webp", age:"5–7",
    href:"decks/fonetika/index.html", direct:true, folder:"rech" },

  { face:"decks/slogi/assets/cover_tile.webp",
    back:"decks/slogi/assets/cover_tile.webp", age:"5–7",
    href:"decks/slogi/index.html", direct:true, folder:"rech" },

  { face:"decks/chitaem-sami/assets/cover_tile.webp",
    back:"decks/chitaem-sami/assets/cover_tile.webp", age:"6–7",
    href:"decks/chitaem-sami/index.html", direct:true, folder:"rech" },

  { face:"docs/rech/cover_tile.webp",
    back:"docs/rech/cover_tile.webp",
    href:"docs/rech/index.html", direct:true, folder:"rech" },

  /* Speech (EN) — по возрасту */
  { face:"decks/en-accordion/assets/cover_tile.webp",
    back:"decks/en-accordion/assets/cover_tile.webp", age:"0–6 mo",
    href:"decks/en-accordion/index.html", direct:true, folder:"speech_en" },

  { face:"decks/en-chatter/assets/cover_tile.webp",
    back:"decks/en-chatter/assets/cover_tile.webp", age:"0–3",
    href:"decks/en-chatter/index.html", direct:true, folder:"speech_en" },

  { face:"decks/en-tricky/assets/cover_tile.webp",
    back:"decks/en-tricky/assets/cover_tile.webp", age:"4–7",
    href:"decks/en-tricky/index.html", direct:true, folder:"speech_en" },

  { face:"decks/en-abc/assets/cover_tile.webp",
    back:"decks/en-abc/assets/cover_tile.webp", age:"3–5",
    href:"decks/en-abc/index.html", direct:true, folder:"speech_en" },

  { face:"decks/en-cvc/assets/cover_tile.webp",
    back:"decks/en-cvc/assets/cover_tile.webp", age:"4–6",
    href:"decks/en-cvc/index.html", direct:true, folder:"speech_en" },

  { face:"decks/en-stories/assets/cover_tile.webp",
    back:"decks/en-stories/assets/cover_tile.webp", age:"4–7",
    href:"decks/en-stories/index.html", direct:true, folder:"speech_en" },

  { face:"decks/en-read/assets/cover_tile.webp",
    back:"decks/en-read/assets/cover_tile.webp", age:"5–7",
    href:"decks/en-read/index.html", direct:true, folder:"speech_en" },

  { face:"decks/en-twisters/assets/cover_tile.webp",
    back:"decks/en-twisters/assets/cover_tile.webp", age:"5–7",
    href:"decks/en-twisters/index.html", direct:true, folder:"speech_en" },

  { face:"decks/en-soundboxes/assets/cover_tile.webp",
    back:"decks/en-soundboxes/assets/cover_tile.webp", age:"4–6",
    href:"decks/en-soundboxes/index.html", direct:true, folder:"speech_en" },

  { face:"decks/en-hear/assets/cover_tile.webp",
    back:"decks/en-hear/assets/cover_tile.webp", age:"4–6",
    href:"decks/en-hear/index.html", direct:true, folder:"speech_en" },

  { face:"docs/speech-en/cover_tile.webp",
    back:"docs/speech-en/cover_tile.webp",
    href:"docs/speech-en/index.html", direct:true, folder:"speech_en" }
];

const grid=document.getElementById('grid'), modal=document.getElementById('modal'), flip=document.getElementById('flip');
const booksGrid=document.getElementById('booksGrid');
const BOOKS=(window.BOOKS_CATALOG||[]).filter(b=>b.ready!==false);

/* ───────────────────────────────────────────────────────────────────────────
   ПАПКИ — группы проектов/книг. Чтобы добавить папку — допиши сюда объект
   (id → название + значок). Чтобы перенести колоду/книгу в папку — поставь ей
   поле folder:"<id>" (у колоды — в PROJECTS выше; у книги — в её books/<id>/book.js,
   каталог пересоберётся). Папки работают в обеих вкладках. Порядок плиток-папок
   на верхнем уровне — порядок ключей здесь.
   ─────────────────────────────────────────────────────────────────────────── */
const FOLDERS={
  sport:{title:"Спорт", emoji:"🏆"},
  culture:{title:"Культура", emoji:"🎭"},
  rech:{title:"Речь", emoji:"🗣️"},
  speech_en:{title:"Speech · English", emoji:"🇬🇧"},
  enc:{title:"Энциклопедия", emoji:"📚"},
  /* Материалы «Страны мира»: промо-ролики (RU/EN), печатный набор карт,
     карточки-задания и руководства. Папка ВЛОЖЕНА в «Энциклопедию» и стоит
     сразу за двумя обложками Кругосветки — parent + after задают место. */
  media_sm:{title:"Видео и печать", emoji:"🎬", face:"decks/strany-mira/cover.webp",
            parent:"enc", after:"decks/strany-mira/index.html?lang=en"},
  /* витрина-линейка: папка без вложенных проектов реестра — открывает свой
     иконостас-просмотр напрямую (face — обложка папки, href — точка входа). */
  ot07:{title:"от 0 до 7", emoji:"🃏", count:11,
        face:"decks/ot-0-do-7/assets/product/box_face.webp",
        href:"decks/ot-0-do-7/index.html"},
  guides:{title:"Путеводители", emoji:"🗺️"},
  animals:{title:"Малыши животные", emoji:"🐾"},
  tales:{title:"Сказки", emoji:"🧚"},
  bible:{title:"Библия", emoji:"🕊️"},
  pdf:{title:"PDF-листалки", emoji:"📄"}
};

/* единая модель элемента: {face,title,emoji,folder,open()}
   direct:true — нажатие на карту сразу открывает приложение проекта,
   без промежуточной модалки с переворотом и кнопкой «Начать». */
/* href прокидываем в запись: по нему вложенная папка находит своё место
   (поле after) — без него она молча падала в конец списка */
const mkEntry=p=>({face:p.face, emoji:p.emoji, folder:p.folder, age:p.age, href:p.href,
  open:()=>{ if(p.direct){location.href=p.href;} else {openCard(p);} }});
const DECK_ENTRIES=PROJECTS.map(mkEntry);
const BOOK_ENTRIES=BOOKS.map(b=>({
  face:'books/'+b.id+'/'+b.cover+'.'+(b.ext||'webp'), title:b.title, emoji:b.emoji||'📖', folder:b.folder,
  /* external — книга со своим ридером (напр. мультиязычный books/moses/reader.html);
     листалки (folder "pdf" / engine "flipbook") — своим движком-листалкой */
  open:()=>{ if(b.engine==='external'){ location.href='books/'+b.id+'/reader.html'; return; }
    const shell=(b.engine==='flipbook'||b.folder==='pdf')?'books/pdf.html':'books/index.html'; location.href=shell+'#'+b.id; }
}));

function tileDeck(e){ /* иконостас; для серий с возрастом — бейдж «сколько лет» */
  const d=document.createElement('div'); d.className='card';
  if(e.face){
    const im=document.createElement('img'); im.src=e.face; im.alt='';
    im.onerror=function(){const ph=document.createElement('div');ph.className='bcemoji';ph.textContent=e.emoji||'🃏';d.replaceChild(ph,im);};
    d.appendChild(im);
  }else{ /* колода без обложки-картинки (напр. эмодзи-каркас core/kit) */
    const ph=document.createElement('div'); ph.className='bcemoji'; ph.textContent=e.emoji||'🃏'; d.appendChild(ph);
  }
  if(e.age){ const a=document.createElement('span'); a.className='agechip'; a.textContent=e.age; d.appendChild(a); }
  d.onclick=e.open;
  if(window.TiltFX) TiltFX.attach(d);
  return d;
}
function tileBook(e){ /* обложка в 3D-обёртке: за ней «страницы», нажатие приоткрывает */
  const a=document.createElement('a'); a.className='bookcard'; a.href='#';
  const w=document.createElement('div'); w.className='bk3d';
  const pg=document.createElement('div'); pg.className='bkpg'; w.appendChild(pg);
  const im=document.createElement('img'); im.src=e.face; im.alt=e.title;
  im.onerror=function(){const ph=document.createElement('div');ph.className='bcemoji';ph.textContent=e.emoji;w.replaceChild(ph,im);};
  w.appendChild(im);
  a.appendChild(w);
  const t=document.createElement('span'); t.className='bt'; t.textContent=e.title; a.appendChild(t);
  a.onclick=ev=>{ev.preventDefault(); e.open();}; return a;
}
function folderTile(fid, members){
  const f=FOLDERS[fid], rep=members[0];
  const cover=f.face||(rep&&rep.face), cnt=(f.count!=null)?f.count:members.length;
  const d=document.createElement('div'); d.className='folder';
  d.innerHTML='<div class="fcover"><img alt=""><div class="fbadge">📁</div>'
    +'<div class="flabel">'+f.emoji+' '+f.title+' <span class="fcount">· '+cnt+'</span></div></div>';
  const im=d.querySelector('img'); im.src=cover||'';
  im.onerror=function(){im.src='';im.style.background='linear-gradient(160deg,#eef4ee,#dde9df)';};
  d.onclick=f.href?function(){location.href=f.href;}:function(){ view.folder=fid; render(); };
  if(window.TiltFX) TiltFX.attach(d);
  return d;
}

const badge=document.getElementById('badge'), subtitle=document.getElementById('subtitle');
const tabDecks=document.getElementById('tab-decks'), tabBooks=document.getElementById('tab-books');
let view={ tab:'decks', folder:null };

function render(){
  const tab=view.tab, isBooks=(tab==='books');
  const cont=isBooks?booksGrid:grid;
  const entries=isBooks?BOOK_ENTRIES:DECK_ENTRIES;
  const mkTile=isBooks?tileBook:tileDeck;
  const allLabel=isBooks?'Все книги':'Все колоды';
  const rootTitle=isBooks?'Книги':'Все проекты';
  cont.innerHTML='';
  if(view.folder){
    const f=FOLDERS[view.folder], mem=entries.filter(e=>e.folder===view.folder);
    /* вложенные папки этой папки: место — сразу за плиткой из поля after */
    const kids=Object.keys(FOLDERS).filter(k=>FOLDERS[k].parent===view.folder)
      .map(k=>({fid:k, mem:entries.filter(e=>e.folder===k)})).filter(k=>k.mem.length);
    const back=document.createElement('button'); back.className='backchip';
    const up=f.parent&&FOLDERS[f.parent];
    back.textContent=up?('‹ '+up.title):('‹ '+allLabel);
    back.onclick=()=>{ view.folder=f.parent||null; render(); };
    cont.appendChild(back);
    const placed={};
    mem.forEach(e=>{
      cont.appendChild(mkTile(e));
      kids.forEach(k=>{ if(!placed[k.fid]&&FOLDERS[k.fid].after===e.href){ placed[k.fid]=1;
        cont.appendChild(folderTile(k.fid,k.mem)); } });
    });
    kids.forEach(k=>{ if(!placed[k.fid]) cont.appendChild(folderTile(k.fid,k.mem)); });
    subtitle.textContent=f.emoji+' '+f.title;
    badge.textContent='В папке '+(mem.length+kids.length);
  }else{
    Object.keys(FOLDERS).forEach(fid=>{ if(FOLDERS[fid].parent) return;   /* вложенная — покажется внутри своей */
      const mem=entries.filter(e=>e.folder===fid); if(mem.length||(FOLDERS[fid].href&&tab==='decks')) cont.appendChild(folderTile(fid,mem)); });
    entries.filter(e=>!e.folder).forEach(e=>cont.appendChild(mkTile(e)));
    subtitle.textContent=rootTitle;
    badge.textContent=isBooks?('Книг '+entries.length):('Проектов '+entries.length);
  }
}
function selectTab(which){
  view.tab=which; view.folder=null;
  tabDecks.className='tab'+(which==='decks'?' on':'');
  tabBooks.className='tab'+(which==='books'?' on':'');
  grid.hidden=(which!=='decks'); booksGrid.hidden=(which!=='books');
  render();
}
tabDecks.onclick=()=>{location.hash='';selectTab('decks');};
tabBooks.onclick=()=>{location.hash='#books';selectTab('books');};
/* deep-link: #books или #books/<folder> (возврат из ридера в нужную папку);
   легаси #enc (бывший таб «Энциклопедия») открывает одноимённую папку колод */
function fromHash(){
  const h=location.hash||'';
  if(h.indexOf('#books')===0){
    selectTab('books');
    const f=h.split('/')[1];
    if(f&&FOLDERS[f]){ view.folder=f; render(); }
  }else if(h.indexOf('#enc')===0){ selectTab('decks'); view.folder='enc'; render(); }
  else selectTab('decks');
}
fromHash();
window.addEventListener('hashchange',fromHash);

function openCard(p){
  document.getElementById('mFace').src=p.face;
  document.getElementById('mBack').src=p.back||p.face;
  flip.classList.remove('back');
  flip.classList.toggle('noflip', !!p.noflip); /* заставка без переворота — просто обложка + «Начать» */
  const slot=document.getElementById('startSlot');
  slot.innerHTML='<a class="start go" href="'+p.href+'">▶ Начать</a>';
  Array.from(slot.children).forEach(b=>b.addEventListener('click', e=>e.stopPropagation()));
  modal.classList.add('open');
}
function closeModal(){modal.classList.remove('open');}
flip.addEventListener('click', e=>{ e.stopPropagation(); if(flip.classList.contains('noflip'))return; flip.classList.toggle('back'); });
modal.addEventListener('click', closeModal);

/* ── Паспорт исследователя: читаем прогресс лент из localStorage ── */
(function(){
  /* ns движка лент + боевая Кругосветка (свои ключи). total — уникальные виды/узлы */
  var FEEDS=[
    {ns:"telo-cheloveka",     nm:"Тело человека",  total:20,  cov:"decks/telo-cheloveka/cover.webp",      href:"decks/telo-cheloveka/feed/index.html", unit:"тем"},
    {ns:"biblejskie-istorii", nm:"Библейские истории", total:39, cov:"decks/biblejskie-istorii/cover.webp", href:"decks/biblejskie-istorii/feed/index.html", unit:"героев"},
    {ns:"podvodnyy-mir-feed", nm:"Подводный мир",  total:100, cov:"decks/podvodnyy-mir/cover.webp",       href:"decks/podvodnyy-mir/feed/index.html", unit:"видов"},
    {ns:"wild-feed",          nm:"Дикие животные", total:75,  cov:"decks/dikie-zhivotnye/cover.webp",     href:"decks/dikie-zhivotnye/feed/index.html", unit:"видов"},
    {ns:"birds-feed",         nm:"Птицы мира",     total:80,  cov:"decks/ptitsy-mira/cover.webp",         href:"decks/ptitsy-mira/feed/index.html", unit:"видов"},
    {ns:"dino-feed",          nm:"Динозавры",      total:20,  cov:"decks/dinozavry/assets/cover.webp",    href:"decks/dinozavry/feed/index.html", unit:"динозавров"}
  ];
  function jget(k){ try{ return JSON.parse(localStorage.getItem(k)||"{}"); }catch(e){ return {}; } }
  function num(k){ var v=parseInt(localStorage.getItem(k),10); return isNaN(v)?0:v; }
  var rows=[], sumStars=0, sumKnown=0;
  FEEDS.forEach(function(f){
    var know=jget(f.ns+"_feed_know"), kn=0, id;
    for(id in know){ if(know.hasOwnProperty(id) && know[id]) kn++; }
    var st=num(f.ns+"_feed_stars");
    if(kn||st){ rows.push({f:f,kn:Math.min(kn,f.total),st:st}); sumStars+=st; sumKnown+=Math.min(kn,f.total); }
  });
  /* боевая Кругосветка: звёзды smj_earned, изученные страны smj_prog_v1 (объект по iso) */
  var smSt=num("smj_earned"), smProg=jget("smj_prog_v1"), smKn=0, k2;
  for(k2 in smProg){ if(smProg.hasOwnProperty(k2)) smKn++; }
  if(smSt||smKn){ rows.push({f:{nm:"Кругосветка · страны", total:100, cov:"decks/strany-mira/cover.webp",
    href:"decks/strany-mira/index.html", unit:"стран"}, kn:Math.min(smKn,100), st:smSt});
    sumStars+=smSt; sumKnown+=Math.min(smKn,100); }
  if(!rows.length) return;
  var box=document.getElementById("passport"), body=document.getElementById("ppBody");
  /* Anime.js-украшения (аддитивно): счётчики шапки набегают, строки и полоски
     появляются каскадом при первом раскрытии. Без библиотеки — как раньше. */
  var ANI=window.anime||null, RED=false;
  try{ RED=!!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }catch(e){}
  var sum=document.getElementById("ppSum");
  function sumTxt(st,kn){ return "★ "+st+" · "+kn+" открытий"; }
  if(ANI && !RED && (sumStars||sumKnown)){
    var cnt={st:0,kn:0};
    ANI({ targets:cnt, st:sumStars, kn:sumKnown, round:1, duration:900, easing:"easeOutQuad",
      update:function(){ sum.textContent=sumTxt(cnt.st,cnt.kn); } });
  } else sum.textContent=sumTxt(sumStars,sumKnown);
  rows.forEach(function(r){
    var a=document.createElement("a"); a.className="ppRow"; a.href=r.f.href;
    var pct=Math.round(r.kn/r.f.total*100);
    a.innerHTML='<img class="cov" src="'+r.f.cov+'" alt="">'+
      '<span class="nm">'+r.f.nm+'</span><span class="st">★ '+r.st+'</span>'+
      '<span class="kn">'+r.kn+' из '+r.f.total+'</span>'+
      '<span class="bar"><i style="width:'+pct+'%"></i></span>';
    body.appendChild(a);
  });
  box.hidden=false;
  var opened=false;
  document.getElementById("ppHead").onclick=function(){
    body.hidden=!body.hidden;
    this.querySelector(".ppArr").textContent=body.hidden?"▾":"▴";
    if(!body.hidden && !opened && ANI && !RED){ opened=true;
      ANI({ targets:body.querySelectorAll(".ppRow"), translateY:[12,0], opacity:[0,1],
        duration:320, delay:ANI.stagger(50), easing:"easeOutQuad" });
      ANI({ targets:body.querySelectorAll(".bar i"), scaleX:[0,1],
        duration:550, delay:ANI.stagger(50,{start:120}), easing:"easeOutQuad" });
    }
  };
})();
