/**
 * Patch feed.js: wrap remaining bare RU system UI strings with multilingual L({...}).
 * Uses only string concat (no nested template literals) to avoid quote breakage.
 */
const fs = require("fs");
const path = "core/engines/feed/feed.js";
let s = fs.readFileSync(path, "utf8");

function M(ru, en, de, es, pt, fr, ar) {
  return (
    "{ru:" + JSON.stringify(ru) +
    ",en:" + JSON.stringify(en) +
    ",de:" + JSON.stringify(de) +
    ",es:" + JSON.stringify(es) +
    ",pt:" + JSON.stringify(pt) +
    ",fr:" + JSON.stringify(fr) +
    ",ar:" + JSON.stringify(ar) + "}"
  );
}

function mustReplace(oldStr, newStr, label) {
  if (!s.includes(oldStr)) {
    console.warn("MISSING:", label || oldStr.slice(0, 70));
    return false;
  }
  s = s.split(oldStr).join(newStr);
  return true;
}

// doneTxt must resolve i18n objects
mustReplace(
  "function doneTxt(s){ return UII.plain ? s : s + \" 🎉\"; }",
  "function doneTxt(s){ s=L(s); return UII.plain ? s : s + \" 🎉\"; }",
  "doneTxt"
);

// PRAISE / CHEER
mustReplace(
  'var PRAISE = FP.praise || ["Молодец!","Верно!","Отлично!","Умница!","Здорово!","Так держать!"];',
  "var PRAISE = FP.praise || [" +
    M("Молодец!", "Well done!", "Super!", "¡Muy bien!", "Muito bem!", "Bravo !", "أحسنت!") + "," +
    M("Верно!", "Right!", "Richtig!", "¡Correcto!", "Certo!", "Exact !", "صحيح!") + "," +
    M("Отлично!", "Great!", "Toll!", "¡Genial!", "Ótimo!", "Super !", "ممتاز!") + "," +
    M("Умница!", "Smart!", "Klug!", "¡Qué listo!", "Espertinho!", "Malin !", "ذكي!") + "," +
    M("Здорово!", "Awesome!", "Klasse!", "¡Qué bien!", "Demais!", "Génial !", "رائع!") + "," +
    M("Так держать!", "Keep it up!", "Weiter so!", "¡Sigue así!", "Continua assim!", "Continue comme ça !", "استمر!") +
    "];",
  "PRAISE"
);
mustReplace(
  'var CHEER  = FP.cheer  || ["Почти! Ничего страшного.","Не беда — теперь запомнишь!","Бывает! Дальше получится."];',
  "var CHEER  = FP.cheer  || [" +
    M("Почти! Ничего страшного.", "Almost! That's okay.", "Fast! Kein Problem.", "¡Casi! No pasa nada.", "Quase! Não tem problema.", "Presque ! Ce n'est rien.", "تقريباً! لا بأس.") + "," +
    M("Не беда — теперь запомнишь!", "No worries — now you'll remember!", "Kein Problem — jetzt merkst du's!", "¡No pasa nada — ahora lo recordarás!", "Sem problema — agora vais lembrar!", "Pas grave — tu t'en souviendras !", "لا بأس — الآن ستتذكر!") + "," +
    M("Бывает! Дальше получится.", "It happens! You'll get it next.", "Passiert! Beim nächsten Mal klappt's.", "¡Pasa! La próxima sale.", "Acontece! Da próxima dá certo.", "Ça arrive ! La prochaine fois ça ira.", "يحصل! المرة القادمة ستنجح.") +
    "];",
  "CHEER"
);

// presenterSay → speakSS(L(...))
mustReplace("speakSS(bank[i])", "speakSS(L(bank[i]))", "speakSS L");

// Defaults
mustReplace(
  'var NODE_NEW = GRAPH.newNodeLabel || "Новый орган!";',
  "var NODE_NEW = GRAPH.newNodeLabel || " + M("Новая история!", "New story!", "Neue Geschichte!", "¡Nueva historia!", "Nova história!", "Nouvelle histoire !", "قصة جديدة!") + ";",
  "NODE_NEW"
);
mustReplace(
  'var NODE_GEN = GRAPH.unitGen || "органов";',
  "var NODE_GEN = GRAPH.unitGen || " + M("историй", "stories", "Geschichten", "historias", "histórias", "histoires", "قصص") + ";",
  "NODE_GEN"
);
mustReplace(
  'var CTR_LABEL = GRAPH.centerLabel || "ТЕЛО";',
  "var CTR_LABEL = GRAPH.centerLabel || " + M("БИБЛИЯ", "BIBLE", "BIBEL", "BIBLIA", "BÍBLIA", "BIBLE", "الكتاب المقدس") + ";",
  "CTR_LABEL"
);

mustReplace(
  `{min:0,  name:"Новичок",  emoji:"🐣"},
    {min:2,  name:"Ученик",   emoji:"📖"},
    {min:5,  name:"Знаток",   emoji:"🔎"},
    {min:10, name:"Мастер",   emoji:"🏅"},
    {min:16, name:"Профессор",emoji:"🎓"}`,
  `{min:0,  name:` + M("Новичок", "Beginner", "Anfänger", "Principiante", "Iniciante", "Débutant", "مبتدئ") + `,  emoji:"🐣"},
    {min:2,  name:` + M("Ученик", "Learner", "Schüler", "Alumno", "Aluno", "Élève", "تلميذ") + `,   emoji:"📖"},
    {min:5,  name:` + M("Знаток", "Expert", "Kenner", "Experto", "Perito", "Expert", "خبير") + `,   emoji:"🔎"},
    {min:10, name:` + M("Мастер", "Master", "Meister", "Maestro", "Mestre", "Maître", "أستاذ") + `,   emoji:"🏅"},
    {min:16, name:` + M("Профессор", "Professor", "Professor", "Profesor", "Professor", "Professeur", "بروفيسور") + `,emoji:"🎓"}`,
  "RANKS defaults"
);

mustReplace(
  'top:"Новый ранг!"',
  "top:" + M("Новый ранг!", "New rank!", "Neuer Rang!", "¡Nuevo rango!", "Novo nível!", "Nouveau rang !", "رتبة جديدة!"),
  "Новый ранг"
);
mustReplace(
  'top:"Штамп в паспорт!"',
  "top:" + M("Штамп в паспорт!", "Passport stamp!", "Stempel im Pass!", "¡Sello en el pasaporte!", "Carimbo no passaporte!", "Tampon dans le passeport !", "ختم في الجواز!"),
  "Штамп"
);

mustReplace(
  'chint.textContent = (typeof veil==="string"&&veil!=="title"&&veil!=="text") ? veil : "Нажми — узнай";',
  "chint.textContent = (veil && veil!==\"title\"&&veil!==\"text\") ? L(veil) : L(" +
    M("Нажми — узнай", "Tap to learn", "Tippen — erfahren", "Toca — descubre", "Toca — descobre", "Appuie — découvre", "اضغط — اعرف") +
    ");",
  "chiphint"
);

mustReplace('aria-label="Закрыть"', "aria-label=\"'+L(" + M("Закрыть", "Close", "Schließen", "Cerrar", "Fechar", "Fermer", "إغلاق") + ")+'\"", "aria Закрыть");

const pairs = [
  ['esc(card.title||"Собери тело")', "esc(card.title||" + M("Собери тело", "Build the body", "Baue den Körper", "Arma el cuerpo", "Monta o corpo", "Assemble le corps", "ركّب الجسد") + ")"],
  ['esc(card.text||"Перетащи орган на его место")', "esc(card.text||" + M("Перетащи орган на его место", "Drag each organ to its place", "Zieh jedes Organ an seinen Platz", "Arrastra cada órgano a su sitio", "Arrasta cada órgão ao seu lugar", "Glisse chaque organe à sa place", "اسحب كل عضو إلى مكانه") + ")"],
  ['doneTxt("Готово! Всё собрано")', "doneTxt(" + M("Готово! Всё собрано", "Done! All in place", "Fertig! Alles platziert", "¡Listo! Todo colocado", "Pronto! Tudo no lugar", "Terminé ! Tout est en place", "تم! كل شيء في مكانه") + ")"],
  ['var ask=card.ask||"Найди: ";', "var ask=card.ask||" + M("Найди: ", "Find: ", "Finde: ", "Encuentra: ", "Encontra: ", "Trouve : ", "جد: ") + ";"],
  ['esc(card.title||"Найди и нажми")', "esc(card.title||" + M("Найди и нажми", "Find and tap", "Finde und tippe", "Encuentra y toca", "Encontra e toca", "Trouve et appuie", "جد واضغط") + ")"],
  ['doneTxt("Молодец! Всё нашёл")', "doneTxt(" + M("Молодец! Всё нашёл", "Well done! You found them all", "Super! Alles gefunden", "¡Muy bien! Lo encontraste todo", "Muito bem! Achaste tudo", "Bravo ! Tu as tout trouvé", "أحسنت! وجدت الكل") + ")"],
  ['esc(card.title||"Загляни на картинку")', "esc(card.title||" + M("Загляни на картинку", "Look at the picture", "Schau aufs Bild", "Mira la imagen", "Olha a imagem", "Regarde l'image", "انظر إلى الصورة") + ")"],
  ['(card.intro||("Нажми светящиеся окошки — узнай секреты!"))', "(card.intro||" + M("Нажми светящиеся окошки — узнай секреты!", "Tap the glowing spots — find secrets!", "Tippe die leuchtenden Punkte — finde Geheimnisse!", "Toca los puntos brillantes — ¡halla secretos!", "Toca os pontos brilhantes — acha segredos!", "Touche les points lumineux — trouve les secrets !", "اضغط على النقاط المضيئة — اعرف الأسرار!") + ")"],
  ['esc(card.kicker||"Кто это?")', "esc(card.kicker||" + M("Кто это?", "Who is this?", "Wer ist das?", "¿Quién es?", "Quem é este?", "Qui est-ce ?", "من هذا؟") + ")"],
  [
    'doneTxt(card.done||("Всего "+n+"! Молодец!"))',
    "doneTxt(card.done||(L(" + M("Всего", "Total", "Insgesamt", "En total", "No total", "En tout", "المجموع") + ")+\" \"+n+\"! \"+L(" + M("Молодец!", "Well done!", "Super!", "¡Muy bien!", "Muito bem!", "Bravo !", "أحسنت!") + ")))"
  ],
  ['esc(card.title||"Цвета радуги")', "esc(card.title||" + M("Цвета радуги", "Rainbow colors", "Regenbogenfarben", "Colores del arcoíris", "Cores do arco-íris", "Couleurs de l'arc-en-ciel", "ألوان قوس قزح") + ")"],
  ['doneTxt(card.done || "Семь цветов!")', "doneTxt(card.done || " + M("Семь цветов!", "Seven colors!", "Sieben Farben!", "¡Siete colores!", "Sete cores!", "Sept couleurs !", "سبعة ألوان!") + ")"],
  ['esc(card.title||"Что пропало?")', "esc(card.title||" + M("Что пропало?", "What's missing?", "Was fehlt?", "¿Qué falta?", "O que falta?", "Qu'est-ce qui manque ?", "ماذا اختفى؟") + ")"],
  ['doneTxt(card.done||"Молодец! Всё поймал!")', "doneTxt(card.done||" + M("Молодец! Всё поймал!", "Well done! You caught them all!", "Super! Alles gefangen!", "¡Muy bien! Lo atrapaste todo!", "Muito bem! Apanhaste tudo!", "Bravo ! Tu as tout attrapé !", "أحسنت! التقطت الكل!") + ")"],
  ['esc(card.title||"Лови!")', "esc(card.title||" + M("Лови!", "Catch!", "Fang!", "¡Atrapa!", "Apanha!", "Attrape !", "التقط!") + ")"],
  ['esc(card.title||"Посвети фонариком")', "esc(card.title||" + M("Посвети фонариком", "Shine the flashlight", "Leuchte mit der Taschenlampe", "Ilumina con la linterna", "Ilumina com a lanterna", "Éclaire avec la lampe", "أضئ بالفانوس") + ")"],
  ['(card.done||"Нашёл! Молодец!")', "(card.done||" + M("Нашёл! Молодец!", "Found it! Well done!", "Gefunden! Super!", "¡Lo encontraste! ¡Muy bien!", "Achaste! Muito bem!", "Trouvé ! Bravo !", "وجدته! أحسنت!") + ")"],
  ['(card.ask||"Веди пальцем — найди спрятанное и нажми")', "(card.ask||" + M("Веди пальцем — найди спрятанное и нажми", "Move your finger — find the hidden thing and tap", "Fahr mit dem Finger — finde das Versteckte und tippe", "Mueve el dedo — halla lo escondido y toca", "Mexa o dedo — acha o escondido e toca", "Glisse le doigt — trouve le caché et appuie", "حرّك إصبعك — جد المخفي واضغط") + ")"],
  ['esc(card.title||"По порядку")', "esc(card.title||" + M("По порядку", "In order", "Der Reihe nach", "En orden", "Em ordem", "Dans l'ordre", "بالترتيب") + ")"],
  ['esc(card.text||"Нажимай по порядку: что было сначала, что потом")', "esc(card.text||" + M("Нажимай по порядку: что было сначала, что потом", "Tap in order: what came first, what came next", "Tippe der Reihe nach: was war zuerst, was danach", "Toca en orden: qué fue primero, qué después", "Toca em ordem: o que veio primeiro, o que depois", "Appuie dans l'ordre : d'abord, ensuite", "اضغط بالترتيب: ماذا جاء أولاً، ثم ماذا") + ")"],
  ['doneTxt(card.done||"Всё по порядку!")', "doneTxt(card.done||" + M("Всё по порядку!", "All in order!", "Alles der Reihe nach!", "¡Todo en orden!", "Tudo em ordem!", "Tout dans l'ordre !", "كل شيء بالترتيب!") + ")"],
];

pairs.forEach(function (p, i) {
  mustReplace(p[0], p[1], "pair" + i);
});

// TF mic + voice
mustReplace(
  "mb.innerHTML='<span class=\"micico\">🎤</span><span class=\"mictx\">Нажми и скажи: правда или нет</span>';",
  "mb.innerHTML='<span class=\"micico\">🎤</span><span class=\"mictx\">'+esc(" +
    M("Нажми и скажи: правда или нет", "Tap and say: true or false", "Tippe und sag: wahr oder falsch", "Toca y di: verdad o falso", "Toca e diz: verdadeiro ou falso", "Appuie et dis : vrai ou faux", "اضغط وقل: صحيح أو خطأ") +
    ")+'</span>';",
  "TF mic"
);

mustReplace(
  `armVoiceAnswer(mb,
        [ {t:"правда",   say:["да","верно","правда","истина","так"]},
          {t:"неправда", say:["нет","неверно","ложь","неправда","не так"]} ],
        function(o){ answer(o.t==="правда"); });`,
  `armVoiceAnswer(mb, (function(){
          var lang=curAppLang();
          if(lang==="en") return [{t:"true",say:["yes","true","right","correct"]},{t:"false",say:["no","false","wrong","incorrect"]}];
          if(lang==="de") return [{t:"wahr",say:["ja","wahr","richtig","stimmt"]},{t:"falsch",say:["nein","falsch","nicht"]}];
          if(lang==="es") return [{t:"verdad",say:["si","sí","verdad","verdadero","correcto"]},{t:"falso",say:["no","falso","incorrecto"]}];
          if(lang==="pt") return [{t:"verdade",say:["sim","verdade","verdadeiro","certo"]},{t:"falso",say:["não","nao","falso","errado"]}];
          if(lang==="fr") return [{t:"vrai",say:["oui","vrai","exact","correct"]},{t:"faux",say:["non","faux","incorrect"]}];
          if(lang==="ar") return [{t:"صحيح",say:["نعم","صحيح","صح"]},{t:"خطأ",say:["لا","خطأ","غلط"]}];
          return [{t:"правда",say:["да","верно","правда","истина","так"]},{t:"неправда",say:["нет","неверно","ложь","неправда","не так"]}];
        })(), function(o){ var t=o.t; answer(t==="правда"||t==="true"||t==="wahr"||t==="verdad"||t==="verdade"||t==="vrai"||t==="صحيح"); });`,
  "TF voice"
);

// colors
mustReplace(
  '{c:"#e53935", ok:true, name:"красный"}, {c:"#fb8c00", ok:true, name:"оранжевый"},\n' +
    '        {c:"#fdd835", ok:true, name:"жёлтый"}, {c:"#43a047", ok:true, name:"зелёный"},\n' +
    '        {c:"#4fc3f7", ok:true, name:"голубой"}, {c:"#1e88e5", ok:true, name:"синий"},\n' +
    '        {c:"#8e24aa", ok:true, name:"фиолетовый"},\n' +
    '        {c:"#795548", ok:false, name:"коричневый"}, {c:"#ec407a", ok:false, name:"розовый"},\n' +
    '        {c:"#9e9e9e", ok:false, name:"серый"}',
  '{c:"#e53935", ok:true, name:' + M("красный", "red", "rot", "rojo", "vermelho", "rouge", "أحمر") + "}, " +
    '{c:"#fb8c00", ok:true, name:' + M("оранжевый", "orange", "orange", "naranja", "laranja", "orange", "برتقالي") + "},\n" +
    '        {c:"#fdd835", ok:true, name:' + M("жёлтый", "yellow", "gelb", "amarillo", "amarelo", "jaune", "أصفر") + "}, " +
    '{c:"#43a047", ok:true, name:' + M("зелёный", "green", "grün", "verde", "verde", "vert", "أخضر") + "},\n" +
    '        {c:"#4fc3f7", ok:true, name:' + M("голубой", "light blue", "hellblau", "celeste", "azul-claro", "bleu clair", "أزرق فاتح") + "}, " +
    '{c:"#1e88e5", ok:true, name:' + M("синий", "blue", "blau", "azul", "azul", "bleu", "أزرق") + "},\n" +
    '        {c:"#8e24aa", ok:true, name:' + M("фиолетовый", "purple", "violett", "morado", "roxo", "violet", "بنفسجي") + "},\n" +
    '        {c:"#795548", ok:false, name:' + M("коричневый", "brown", "braun", "marrón", "marrom", "marron", "بني") + "}, " +
    '{c:"#ec407a", ok:false, name:' + M("розовый", "pink", "rosa", "rosa", "rosa", "rose", "وردي") + "},\n" +
    '        {c:"#9e9e9e", ok:false, name:' + M("серый", "gray", "grau", "gris", "cinza", "gris", "رمادي") + "}",
  "colors"
);

mustReplace(
  "if(it.name) t.setAttribute(\"aria-label\", it.name);",
  "if(it.name) t.setAttribute(\"aria-label\", L(it.name));",
  "color aria"
);

// dayHint — all langs
mustReplace(
  "function dayHint(dayIdx){\n" +
    "      var st=steps[dayIdx], lab=countStepLabel(st), d=dayIdx+1, lang=curAppLang();\n" +
    "      if(asYear){\n" +
    '        if(lang==="en") return lab ? ("First: Year "+d+": "+lab) : ("First: Year "+d);\n' +
    '        return lab ? ("Сначала год "+d+": "+lab) : ("Сначала год "+d);\n' +
    "      }\n" +
    '      if(lang==="en") return lab ? ("First day "+d+": "+lab) : ("First day "+d);\n' +
    '      return lab ? ("Сначала день "+d+": "+lab) : ("Сначала день "+d);\n' +
    "    }",
  "function dayHint(dayIdx){\n" +
    "      var st=steps[dayIdx], lab=countStepLabel(st), d=dayIdx+1;\n" +
    "      var pref = asYear\n" +
    "        ? L(" + M("Сначала год", "First: year", "Zuerst Jahr", "Primero año", "Primeiro ano", "D'abord année", "أولاً السنة") + ")\n" +
    "        : L(" + M("Сначала день", "First: day", "Zuerst Tag", "Primero día", "Primeiro dia", "D'abord jour", "أولاً اليوم") + ");\n" +
    '      return lab ? (pref+" "+d+": "+lab) : (pref+" "+d);\n' +
    "    }",
  "dayHint"
);

// parent / settings / path / menu
mustReplace(
  "inner += '<div class=\"psrow\"><span class=\"pslab\">🌍 Язык энциклопедии</span>'+",
  "inner += '<div class=\"psrow\"><span class=\"pslab\">🌍 '+L(" +
    M("Язык энциклопедии", "Encyclopedia language", "Sprache der Enzyklopädie", "Idioma de la enciclopedia", "Idioma da enciclopédia", "Langue de l'encyclopédie", "لغة الموسوعة") +
    ")+'</span>'+",
  "lang label"
);
mustReplace(
  "inner += '<div class=\"psrow\"><span class=\"pslab\">📷 Источники изображений</span>'+",
  "inner += '<div class=\"psrow\"><span class=\"pslab\">📷 '+L(" +
    M("Источники изображений", "Image sources", "Bildquellen", "Fuentes de imágenes", "Fontes das imagens", "Sources des images", "مصادر الصور") +
    ")+'</span>'+",
  "credits label"
);
mustReplace(
  "'<a class=\"pslink\" href=\"'+esc(credits)+'\" target=\"_blank\" rel=\"noopener\">Титры ↗</a></div>';",
  "'<a class=\"pslink\" href=\"'+esc(credits)+'\" target=\"_blank\" rel=\"noopener\">'+L(" +
    M("Титры ↗", "Credits ↗", "Bildnachweis ↗", "Créditos ↗", "Créditos ↗", "Générique ↗", "المصادر ↗") +
    ")+'</a></div>';",
  "credits link"
);
mustReplace(
  `inner += '<div class="psrow"><span class="pslab">Интерактивные карточки</span>'+
      '<button type="button" class="pslink" id="feedResetDone">Сбросить прохождение</button></div>';
    return '<div class="parentset"><div class="psh">⚙️ Настройки</div>'+inner+'</div>';`,
  "inner += '<div class=\"psrow\"><span class=\"pslab\">'+L(" +
    M("Интерактивные карточки", "Interactive cards", "Interaktive Karten", "Cartas interactivas", "Cartas interativas", "Cartes interactives", "بطاقات تفاعلية") +
    ")+'</span>'+\n" +
    "      '<button type=\"button\" class=\"pslink\" id=\"feedResetDone\">'+L(" +
    M("Сбросить прохождение", "Reset progress", "Fortschritt zurücksetzen", "Reiniciar progreso", "Reiniciar progresso", "Réinitialiser la progression", "إعادة التقدم") +
    ")+'</button></div>';\n" +
    "    return '<div class=\"parentset\"><div class=\"psh\">⚙️ '+L(" +
    M("Настройки", "Settings", "Einstellungen", "Ajustes", "Definições", "Réglages", "الإعدادات") +
    ")+'</div>'+inner+'</div>';",
  "settings block"
);

mustReplace(
  'if(!confirm("Сбросить прохождение интерактивных карточек?\\nРебёнку снова нужно будет пройти задания. Звёзды и карта знаний не меняются.")) return;',
  "if(!confirm(L(" +
    M(
      "Сбросить прохождение интерактивных карточек?\nРебёнку снова нужно будет пройти задания. Звёзды и карта знаний не меняются.",
      "Reset interactive card progress?\nThe child will need to redo the tasks. Stars and the knowledge map stay the same.",
      "Interaktiven Kartenfortschritt zurücksetzen?\nDas Kind muss die Aufgaben erneut machen. Sterne und Wissensnetz bleiben.",
      "¿Reiniciar el progreso de las cartas interactivas?\nEl niño tendrá que repetir las tareas. Las estrellas y el mapa de saberes no cambian.",
      "Reiniciar o progresso das cartas interativas?\nA criança terá de refazer as tarefas. Estrelas e mapa do saber ficam iguais.",
      "Réinitialiser la progression des cartes interactives ?\nL'enfant devra refaire les exercices. Les étoiles et la carte des savoirs ne changent pas.",
      "إعادة تقدم البطاقات التفاعلية؟\nسيحتاج الطفل لإعادة المهام. النجوم وخريطة المعرفة لا تتغير."
    ) +
    "))) return;",
  "confirm reset"
);

mustReplace(
  'navFrame.setAttribute("title","Энциклопедия");',
  "navFrame.setAttribute(\"title\",L(" + M("Энциклопедия", "Encyclopedia", "Enzyklopädie", "Enciclopedia", "Enciclopédia", "Encyclopédie", "الموسوعة") + "));",
  "iframe title"
);
mustReplace(
  'btn.textContent = "← Меню";',
  "btn.textContent = L(" + M("← Меню", "← Menu", "← Menü", "← Menú", "← Menu", "← Menu", "← القائمة") + ");",
  "menu btn"
);
mustReplace(
  "'<div class=\"pathsec\"><div class=\"pathh\">🗺 Путь по главам</div>'",
  "'<div class=\"pathsec\"><div class=\"pathh\">🗺 '+L(" +
    M("Путь по главам", "Path by chapters", "Weg durch die Kapitel", "Camino por capítulos", "Caminho por capítulos", "Chemin par chapitres", "المسار حسب الفصول") +
    ")+'</div>'",
  "pathh"
);
mustReplace(
  "'<i>ещё '+(nxt.min-ko)+' до «'+esc(nxt.name)+'»</i>'",
  "'<i>'+L(" +
    M("ещё", "still", "noch", "aún", "ainda", "encore", "بعد") +
    ")+' '+(nxt.min-ko)+' '+L(" +
    M("до", "to", "bis", "hasta", "até", "jusqu'à", "حتى") +
    ")+' «'+esc(nxt.name)+'»</i>'",
  "rank next"
);
mustReplace(
  "doneTxt('высший ранг!')",
  "doneTxt(" + M("высший ранг!", "top rank!", "höchster Rang!", "¡rango máximo!", "nível máximo!", "rang le plus haut !", "أعلى رتبة!") + ")",
  "top rank"
);

fs.writeFileSync(path, s, "utf8");
console.log("patched", path);
require("child_process").execSync("node --check " + path, { stdio: "inherit" });
console.log("syntax ok");
