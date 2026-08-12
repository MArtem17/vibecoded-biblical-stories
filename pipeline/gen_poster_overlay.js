/* Generate data/poster_overlay.js + img/icons/poster/*.svg for live posters.
   Run: node pipeline/gen_poster_overlay.js
   Facts nums/labels from pipeline/gen_posters.py SPEC (adapted).
   Find texts: thematic clean-watercolor targets (not baked Easter eggs). */
"use strict";
var fs = require("fs");
var path = require("path");
var ROOT = path.resolve(__dirname, "..");
var ICON_DIR = path.join(ROOT, "img", "icons", "poster");
var OUT = path.join(ROOT, "data", "poster_overlay.js");

function L7(ru, en, de, es, pt, fr, ar) {
  return { ru: ru, en: en, de: de, es: es, pt: pt, fr: fr, ar: ar };
}
function fact(icon, num, label) {
  return { icon: icon, num: num, label: label };
}
function F(ru, en, de, es, pt, fr, ar) {
  return L7(ru, en, de, es, pt, fr, ar);
}

/* ── find strings (middot lists matching clean watercolor themes) ── */
var FINDS = {
  heroes_01: L7("радугу · голубя · жирафа", "a rainbow · a dove · a giraffe", "einen Regenbogen · eine Taube · eine Giraffe", "un arcoíris · una paloma · una jirafa", "um arco-íris · uma pomba · uma girafa", "un arc-en-ciel · une colombe · une girafe", "قوس قزح · حمامة · زرافة"),
  heroes_02: L7("шатёр · звёзды · верблюда", "a tent · the stars · a camel", "ein Zelt · die Sterne · ein Kamel", "una tienda · las estrellas · un camello", "uma tenda · as estrelas · um camelo", "une tente · les étoiles · un chameau", "خيمة · النجوم · جملاً"),
  heroes_03: L7("младенца · шатёр · кувшин", "a baby · a tent · a jug", "ein Baby · ein Zelt · einen Krug", "un bebé · una tienda · un cántaro", "um bebê · uma tenda · um jarro", "un bébé · une tente · une cruche", "رضيعًا · خيمة · جرّة"),
  heroes_04: L7("лестницу · камень · ангела", "a ladder · a stone · an angel", "eine Leiter · einen Stein · einen Engel", "una escalera · una piedra · un ángel", "uma escada · uma pedra · um anjo", "une échelle · une pierre · un ange", "سلمًا · حجرًا · ملاكًا"),
  heroes_05: L7("разноцветную одежду · снопы · коров", "a colorful coat · sheaves · cows", "ein buntes Gewand · Garben · Kühe", "una túnica de colores · gavillas · vacas", "uma túnica colorida · feixes · vacas", "un manteau coloré · des gerbes · des vaches", "ثوبًا ملوّنًا · حزمًا · أبقارًا"),
  heroes_06: L7("скрижали · посох · горящий куст", "the tablets · a staff · a burning bush", "die Tafeln · einen Stab · den brennenden Busch", "las tablas · un cayado · la zarza ardiente", "as tábuas · um cajado · a sarça ardente", "les tables · un bâton · le buisson ardent", "الألواح · عصا · العليقة المشتعلة"),
  heroes_07: L7("бубен · корзинку · камыши", "a tambourine · a basket · the reeds", "ein Tamburin · einen Korb · das Schilf", "una pandereta · una cesta · los juncos", "um pandeiro · um cesto · os juncos", "un tambourin · un panier · les roseaux", "دفًّا · سلّة · الآجام"),
  heroes_08: L7("шофар · стены · гроздь винограда", "a shofar · the walls · a grape cluster", "ein Schofar · die Mauern · eine Traube", "un shofar · los muros · un racimo", "um shofar · as muralhas · um cacho", "un shofar · les murs · une grappe", "شوفار · الأسوار · عنقود عنب"),
  heroes_09: L7("льва · длинные волосы · ворота", "a lion · long hair · the city gates", "einen Löwen · langes Haar · das Stadttor", "un león · el cabello largo · las puertas", "um leão · cabelos longos · as portas", "un lion · de longs cheveux · les portes", "أسدًا · شعرًا طويلاً · أبواب المدينة"),
  heroes_10: L7("колосья · сноп · кувшин воды", "ears of grain · a sheaf · a water jug", "Ähren · eine Garbe · einen Wasserkrug", "espigas · una gavilla · un cántaro", "espigas · um feixe · um jarro d'água", "des épis · une gerbe · une cruche d'eau", "سنابل · حزمة · جرّة ماء"),
  heroes_11: L7("светильник · свиток · рог с елеем", "a lamp · a scroll · a horn of oil", "eine Lampe · eine Schriftrolle · ein Ölhorn", "una lámpara · un rollo · un cuerno de aceite", "uma lâmpada · um rolo · um chifre de azeite", "une lampe · un rouleau · une corne d'huile", "سراجًا · لفافة · قرن زيت"),
  heroes_12: L7("пращу · пять камней · арфу", "a sling · five stones · a harp", "eine Schleuder · fünf Steine · eine Harfe", "una honda · cinco piedras · un arpa", "uma funda · cinco pedras · uma harpa", "une fronde · cinq pierres · une harpe", "مقلاعًا · خمسة حجارة · قيثارة"),
  heroes_13: L7("корону · храм · свиток", "a crown · the temple · a scroll", "eine Krone · den Tempel · eine Schriftrolle", "una corona · el templo · un rollo", "uma coroa · o templo · um rolo", "une couronne · le temple · un rouleau", "تاجًا · الهيكل · لفافة"),
  heroes_14: L7("ворона · огненную колесницу · ручей", "a raven · a fiery chariot · a brook", "einen Raben · einen Feuerwagen · einen Bach", "un cuervo · un carro de fuego · un arroyo", "um corvo · uma carruagem de fogo · um riacho", "un corbeau · un char de feu · un ruisseau", "غرابًا · مركبة نارية · جدولًا"),
  heroes_15: L7("львов · свиток · звёзды", "lions · a scroll · stars", "Löwen · eine Schriftrolle · Sterne", "leones · un rollo · estrellas", "leões · um rolo · estrelas", "des lions · un rouleau · des étoiles", "أسودًا · لفافة · نجومًا"),
  heroes_16: L7("корону · скипетр · свиток", "a crown · a scepter · a scroll", "eine Krone · ein Zepter · eine Schriftrolle", "una corona · un cetro · un rollo", "uma coroa · um cetro · um rolo", "une couronne · un sceptre · un rouleau", "تاجًا · صولجانًا · لفافة"),
  heroes_17: L7("большую рыбу · корабль · волны", "a great fish · a ship · the waves", "einen großen Fisch · ein Schiff · die Wellen", "un gran pez · un barco · las olas", "um grande peixe · um navio · as ondas", "un grand poisson · un bateau · les vagues", "سمكة كبيرة · سفينة · أمواجًا"),
  heroes_18: L7("ясли · звезду · ослика", "the manger · a star · a donkey", "die Krippe · einen Stern · einen Esel", "el pesebre · una estrella · un burrito", "a manjedoura · uma estrela · um burrinho", "la crèche · une étoile · un âne", "مذودًا · نجمة · حمارًا"),
  heroes_19: L7("пилу · рубанок · фонарь", "a saw · a plane · a lantern", "eine Säge · einen Hobel · eine Laterne", "una sierra · un cepillo · un farol", "uma serra · um cepilho · um lampião", "une scie · un rabot · une lanterne", "منشارًا · فارة · فانوسًا"),
  heroes_20: L7("звезду · три дара · верблюда", "a star · three gifts · a camel", "einen Stern · drei Gaben · ein Kamel", "una estrella · tres regalos · un camello", "uma estrela · três presentes · um camelo", "une étoile · trois cadeaux · un chameau", "نجمة · ثلاثة هدايا · جملاً"),

  /* Plots: expand findIt + typical scene elements on clean watercolor */
  plots_01: L7("солнце · луну · звёзды", "the sun · the moon · the stars", "die Sonne · den Mond · die Sterne", "el sol · la luna · las estrellas", "o sol · a lua · as estrelas", "le soleil · la lune · les étoiles", "الشمس · القمر · النجوم"),
  plots_02: L7("дерево с плодами · льва · цветы", "the fruit tree · a lion · flowers", "den Fruchtbaum · einen Löwen · Blumen", "el árbol con frutos · un león · flores", "a árvore com frutos · um leão · flores", "l'arbre aux fruits · un lion · des fleurs", "الشجرة المثمرة · أسدًا · أزهارًا"),
  plots_03: L7("ковчег · голубя · жирафа", "the ark · a dove · a giraffe", "die Arche · eine Taube · eine Giraffe", "el arca · una paloma · una jirafa", "a arca · uma pomba · uma girafa", "l'arche · une colombe · une girafe", "الفلك · حمامة · زرافة"),
  plots_04: L7("радугу · ковчег · овец", "the rainbow · the ark · sheep", "den Regenbogen · die Arche · Schafe", "el arcoíris · el arca · ovejas", "o arco-íris · a arca · ovelhas", "l'arc-en-ciel · l'arche · des moutons", "قوس قزح · الفلك · غنمًا"),
  plots_05: L7("башню · кирпичи · леса", "the tower · bricks · scaffolding", "den Turm · Ziegel · ein Gerüst", "la torre · ladrillos · andamios", "a torre · tijolos · andaimes", "la tour · des briques · des échafaudages", "البرج · طوبًا · سقالات"),
  plots_06: L7("лестницу · камень-подушку · звёзды", "the ladder · the stone pillow · stars", "die Leiter · das Steinkissen · Sterne", "la escalera · la piedra-almohada · estrellas", "a escada · a pedra-travesseiro · estrelas", "l'échelle · la pierre-oreiller · des étoiles", "السلم · الحجر-الوسادة · نجومًا"),
  plots_07: L7("разноцветную одежду · братьев · овец", "the colorful coat · the brothers · sheep", "das bunte Gewand · die Brüder · Schafe", "la túnica de colores · los hermanos · ovejas", "a túnica colorida · os irmãos · ovelhas", "le manteau coloré · les frères · des moutons", "الثوب الملوّن · الإخوة · غنمًا"),
  plots_08: L7("корзинку · камыши · Мириам", "the basket · the reeds · Miriam", "den Korb · das Schilf · Mirjam", "la cesta · los juncos · a Miriam", "o cesto · os juncos · Miriã", "le panier · les roseaux · Myriam", "السلّة · الآجام · مريم"),
  plots_09: L7("горящий куст · сандалии · овец", "the burning bush · sandals · sheep", "den brennenden Busch · Sandalen · Schafe", "la zarza ardiente · sandalias · ovejas", "a sarça ardente · sandálias · ovelhas", "le buisson ardent · des sandales · des moutons", "العليقة المشتعلة · نعلين · غنمًا"),
  plots_10: L7("стены воды · рыбок · посох", "walls of water · little fish · a staff", "Wasserwände · Fische · einen Stab", "muros de agua · pececitos · un cayado", "paredes de água · peixinhos · um cajado", "murs d'eau · des poissons · un bâton", "جدران ماء · أسماكًا صغيرة · عصا"),
  plots_11: L7("манну · кувшин · шатры", "manna · a jar · tents", "Manna · einen Krug · Zelte", "el maná · una vasija · tiendas", "o maná · um pote · tendas", "la manne · une cruche · des tentes", "المنّ · جرّة · خيامًا"),
  plots_12: L7("скрижали · гору · облако", "the tablets · the mountain · a cloud", "die Tafeln · den Berg · eine Wolke", "las tablas · la montaña · una nube", "as tábuas · a montanha · uma nuvem", "les tables · la montagne · un nuage", "الألواح · الجبل · سحابة"),
  plots_13: L7("шофар · стены · пыль", "a shofar · the walls · dust clouds", "ein Schofar · die Mauern · Staubwolken", "un shofar · los muros · nubes de polvo", "um shofar · as muralhas · nuvens de pó", "un shofar · les murs · des nuages de poussière", "شوفار · الأسوار · غبارًا"),
  plots_14: L7("пращу · пять камней · шлем", "a sling · five stones · a helmet", "eine Schleuder · fünf Steine · einen Helm", "una honda · cinco piedras · un yelmo", "uma funda · cinco pedras · um capacete", "une fronde · cinq pierres · un casque", "مقلاعًا · خمسة حجارة · خوذة"),
  plots_15: L7("трон · младенца · колонны", "the throne · a baby · columns", "den Thron · ein Baby · Säulen", "el trono · un bebé · columnas", "o trono · um bebê · colunas", "le trône · un bébé · des colonnes", "العرش · رضيعًا · أعمدة"),
  plots_16: L7("храм · золото · кедровые балки", "the temple · gold · cedar beams", "den Tempel · Gold · Zedernbalken", "el templo · oro · vigas de cedro", "o templo · ouro · vigas de cedro", "le temple · de l'or · des poutres de cèdre", "الهيكل · ذهبًا · عوارض أرز"),
  plots_17: L7("львов · ров · утренний луч", "lions · the den · a morning ray", "Löwen · die Grube · einen Morgenstrahl", "leones · el foso · un rayo de mañana", "leões · a cova · um raio da manhã", "des lions · la fosse · un rayon du matin", "أسودًا · الجبّ · شعاع صباح"),
  plots_18: L7("большую рыбу · корабль · волны", "a great fish · a ship · the waves", "einen großen Fisch · ein Schiff · die Wellen", "un gran pez · un barco · las olas", "um grande peixe · um navio · as ondas", "un grand poisson · un bateau · les vagues", "سمكة كبيرة · سفينة · أمواجًا"),
  plots_19: L7("скипетр · трон · корону", "the scepter · the throne · a crown", "das Zepter · den Thron · eine Krone", "el cetro · el trono · una corona", "o cetro · o trono · uma coroa", "le sceptre · le trône · une couronne", "الصولجان · العرش · تاجًا"),
  plots_20: L7("звезду · ясли · овец", "the star · the manger · sheep", "den Stern · die Krippe · Schafe", "la estrella · el pesebre · ovejas", "a estrela · a manjedoura · ovelhas", "l'étoile · la crèche · des moutons", "النجمة · المذود · غنمًا")
};

/* meters helper */
var M150 = L7("150 м", "150 m", "150 m", "150 m", "150 m", "150 m", "١٥٠ م");
var M3 = L7("3 м", "3 m", "3 m", "3 m", "3 m", "3 m", "٣ م");

var FACTS = {
  heroes_01: [
    fact("rain", "40", F("дней шёл дождь", "days of rain", "Tage Regen", "días de lluvia", "dias de chuva", "jours de pluie", "يومًا من المطر")),
    fact("ark", M150, F("длина ковчега", "ark length", "Länge der Arche", "largo del arca", "comprimento da arca", "longueur de l'arche", "طول الفلك")),
    fact("pair", "2×", F("каждой твари по паре", "of every creature", "von jeder Art ein Paar", "de cada criatura", "de cada criatura", "de chaque créature", "من كل مخلوق زوج"))
  ],
  heroes_02: [
    fact("star", "3", F("традиции чтят его", "traditions honor him", "Traditionen ehren ihn", "tradiciones lo honran", "tradições o honram", "traditions l'honorent", "تقاليد تكرّمه")),
    fact("path", "75", F("лет — начало пути", "years — journey begins", "Jahre — Beginn der Reise", "años — comienza el camino", "anos — começa a jornada", "ans — début du voyage", "سنة — بداية الطريق")),
    fact("star", F("без счёта", "countless", "zahllos", "sin cuenta", "sem conta", "sans nombre", "بلا عدد"), F("потомков, как звёзд", "descendants like stars", "Nachkommen wie Sterne", "descendientes como estrellas", "descendentes como estrelas", "descendants comme des étoiles", "نسلًا كنجوم"))
  ],
  heroes_03: [
    fact("baby", "90", F("лет — и стала мамой", "years — then a mother", "Jahre — dann Mutter", "años — y fue madre", "anos — e tornou-se mãe", "ans — puis maman", "سنة — ثم صارت أمًّا")),
    fact("baby", "1", F("долгожданный сын", "long-awaited son", "lang ersehnter Sohn", "hijo esperado", "filho esperado", "fils tant attendu", "ابن منتظر")),
    fact("scroll", F("«смех»", "\"laughter\"", "„Lachen“", "«risa»", "«riso»", "« rire »", "«ضحك»"), F("значит имя Исаак", "means the name Isaac", "bedeutet der Name Isaak", "significa el nombre Isaac", "significa o nome Isaque", "signifie le nom Isaac", "يعني اسم إسحاق"))
  ],
  heroes_04: [
    fact("people", "12", F("сыновей", "sons", "Söhne", "hijos", "filhos", "fils", "ابنًا")),
    fact("stone", "1", F("камень-подушка", "stone pillow", "Steinkissen", "piedra-almohada", "pedra-travesseiro", "pierre-oreiller", "حجر-وسادة")),
    fact("scroll", "2", F("имени: Иаков и Израиль", "names: Jacob & Israel", "Namen: Jakob & Israel", "nombres: Jacob e Israel", "nomes: Jacó e Israel", "noms : Jacob et Israël", "اسمان: يعقوب وإسرائيل"))
  ],
  heroes_05: [
    fact("grain", "7+7", F("лет сытых и голодных", "years of plenty & famine", "Jahre Fülle & Hunger", "años de abundancia y hambre", "anos de fartura e fome", "années d'abondance et de famine", "سنوات شبع ومجاعة")),
    fact("people", "11", F("братьев", "brothers", "Brüder", "hermanos", "irmãos", "frères", "إخوة")),
    fact("crown", F("№ 2", "#2", "Nr. 2", "n.º 2", "n.º 2", "n° 2", "رقم ٢"), F("человек в Египте", "man in Egypt", "Mann in Ägypten", "hombre en Egipto", "homem no Egito", "homme en Égypte", "رجل في مصر"))
  ],
  heroes_06: [
    fact("tablets", "10", F("правил на скрижалях", "rules on the tablets", "Gebote auf den Tafeln", "reglas en las tablas", "regras nas tábuas", "règles sur les tables", "وصايا على الألواح")),
    fact("staff", "40", F("лет вёл народ", "years leading the people", "Jahre führte er das Volk", "años guió al pueblo", "anos guiou o povo", "ans à guider le peuple", "سنة قاد الشعب")),
    fact("baby", "3", F("месяца прятали младенцем", "months hidden as a baby", "Monate als Baby versteckt", "meses escondido de bebé", "meses escondido bebê", "mois caché bébé", "أشهر خُبئ رضيعًا"))
  ],
  heroes_07: [
    fact("people", "2", F("брата: Моисей и Аарон", "brothers: Moses & Aaron", "Brüder: Mose & Aaron", "hermanos: Moisés y Aarón", "irmãos: Moisés e Arão", "frères : Moïse et Aaron", "أخوان: موسى وهارون")),
    fact("harp", "1", F("бубен победы", "victory tambourine", "Siegestamburin", "pandereta de victoria", "pandeiro da vitória", "tambourin de victoire", "دفّ النصر")),
    fact("scroll", F("первая", "the first", "die erste", "la primera", "a primeira", "la première", "الأولى"), F("из пророчиц", "of the prophetesses", "der Prophetinnen", "de las profetisas", "das profetisas", "des prophétesses", "من النبيّات"))
  ],
  heroes_08: [
    fact("wall", "7", F("обходов вокруг стен", "circuits around the walls", "Umgänge um die Mauern", "vueltas alrededor de los muros", "voltas em torno das muralhas", "tours autour des murs", "دورات حول الأسوار")),
    fact("people", "12", F("разведчиков", "scouts", "Kundschafter", "espías", "espiões", "éclaireurs", "جاسوسًا")),
    fact("star", "2", F("не испугались", "were not afraid", "hatten keine Angst", "no tuvieron miedo", "não tiveram medo", "n'eurent pas peur", "لم يخافا"))
  ],
  heroes_09: [
    fact("rope", "0", F("раз стригся", "times he cut his hair", "mal schnitt er sich die Haare", "veces se cortó el pelo", "vezes cortou o cabelo", "fois il se coupa les cheveux", "مرة قصّ شعره")),
    fact("lion", "1", F("лев — голыми руками", "lion — bare hands", "Löwe — mit bloßen Händen", "león — a manos desnudas", "leão — de mãos nuas", "lion — à mains nues", "أسد — بيديه العاريتين")),
    fact("wall", F("на плечах", "on his shoulders", "auf den Schultern", "sobre los hombros", "nos ombros", "sur les épaules", "على كتفيه"), F("унёс ворота города", "carried the city gates", "trug er das Stadttor", "llevó las puertas de la ciudad", "levou as portas da cidade", "porta les portes de la ville", "حمل أبواب المدينة"))
  ],
  heroes_10: [
    fact("scroll", "1", F("книга её имени", "book in her name", "Buch mit ihrem Namen", "libro con su nombre", "livro com seu nome", "livre à son nom", "سفر باسمها")),
    fact("people", "2", F("вдовы держались вместе", "widows stayed together", "Witwen blieben zusammen", "viudas se mantuvieron juntas", "viúvas ficaram juntas", "veuves restèrent ensemble", "أرملتان بقيتا معًا")),
    fact("crown", F("прабабушка", "great-grandmother", "Urgroßmutter", "bisabuela", "bisavó", "arrière-grand-mère", "جدّة عليا"), F("царя Давида", "of King David", "von König David", "del rey David", "do rei Davi", "du roi David", "للملك داود"))
  ],
  heroes_11: [
    fact("lamp", "3", F("раза звал голос", "times the voice called", "mal rief die Stimme", "veces llamó la voz", "vezes a voz chamou", "fois la voix appela", "مرات نادى الصوت")),
    fact("temple", F("с детства", "from childhood", "von Kindheit an", "desde niño", "desde menino", "dès l'enfance", "منذ الطفولة"), F("служил при храме", "served at the temple", "diente am Tempel", "sirvió en el templo", "serviu no templo", "servit au temple", "خدم عند الهيكل")),
    fact("horn", "1", F("рог с елеем", "horn of oil", "Ölhorn", "cuerno de aceite", "chifre de azeite", "corne d'huile", "قرن الزيت"))
  ],
  heroes_12: [
    fact("stone", "5", F("камней из ручья", "stones from the brook", "Steine aus dem Bach", "piedras del arroyo", "pedras do riacho", "pierres du ruisseau", "حجارة من الجدول")),
    fact("stone", "1", F("хватило одного", "was enough", "reichte einer", "bastó con una", "bastou uma", "suffit d'une", " suffices واحد")),
    fact("harp", "3000", F("лет поют его псалмы", "years singing his psalms", "Jahre singt man seine Psalmen", "años se cantan sus salmos", "anos cantam seus salmos", "ans on chante ses psaumes", "سنة تُرنَّم مزاميره"))
  ],
  heroes_13: [
    fact("temple", "7", F("лет строился Храм", "years building the Temple", "Jahre Bau des Tempels", "años se construyó el Templo", "anos durou a construção do Templo", "ans de construction du Temple", "سنوات بُني الهيكل")),
    fact("scroll", "3000", F("притч сложил", "proverbs he composed", "Sprüche dichtete er", "proverbios compuso", "provérbios compôs", "proverbes qu'il composa", "مثلاً ألّف")),
    fact("crown", "1", F("просьба — мудрость", "request — wisdom", "Bitte — Weisheit", "petición — sabiduría", "pedido — sabedoria", "demande — sagesse", "طلبة — الحكمة"))
  ],
  heroes_14: [
    fact("bread", "2", F("раза в день — хлеб", "times a day — bread", "mal am Tag — Brot", "veces al día — pan", "vezes ao dia — pão", "fois par jour — pain", "مرتين يوميًا — خبز")),
    fact("fire", "1", F("огненная колесница", "fiery chariot", "Feuerwagen", "carro de fuego", "carruagem de fogo", "char de feu", "مركبة نارية")),
    fact("star", "0", F("страха перед царём", "fear of the king", "Angst vor dem König", "miedo al rey", "medo do rei", "peur du roi", "خوف من الملك"))
  ],
  heroes_15: [
    fact("lion", "1", F("ночь во рву", "night in the den", "Nacht in der Grube", "noche en el foso", "noite na cova", "nuit dans la fosse", "ليلة في الجبّ")),
    fact("scroll", "3", F("царствам был советник", "kingdoms he advised", "Königreiche beriet er", "reinos asesoró", "reinos aconselhou", "royaumes qu'il conseilla", "ممالك نصحها")),
    fact("lion", "0", F("царапин наутро", "scratches by morning", "Kratzer am Morgen", "arañazos por la mañana", "arranhões pela manhã", "égratignures au matin", "خدوش في الصباح"))
  ],
  heroes_16: [
    fact("crown", "1", F("смелый шаг", "brave step", "mutiger Schritt", "paso valiente", "passo corajoso", "pas courageux", "خطوة شجاعة")),
    fact("scroll", "127", F("областей спасены", "provinces saved", "Provinzen gerettet", "provincias salvadas", "províncias salvas", "provinces sauvées", "ولاية أُنقذت")),
    fact("crown", F("Пурим", "Purim", "Purim", "Purim", "Purim", "Pourim", "بوريم"), F("праздник каждый год", "festival every year", "Fest jedes Jahr", "fiesta cada año", "festa todo ano", "fête chaque année", "عيد كل سنة"))
  ],
  heroes_17: [
    fact("fish", "3", F("дня внутри рыбы", "days inside the fish", "Tage im Fisch", "días dentro del pez", "dias dentro do peixe", "jours dans le poisson", "أيام داخل السمكة")),
    fact("path", "3", F("дня пути по Ниневии", "days across Nineveh", "Tage Weg durch Ninive", "días de camino por Nínive", "dias de caminho por Nínive", "jours de marche à Ninive", "أيام مسير في نينوى")),
    fact("tree", "1", F("растение-тыква", "gourd plant", "Kürbispflanze", "planta de calabaza", "planta de abóbora", "plante-courge", "نبتة اليقطين"))
  ],
  heroes_18: [
    fact("path", "150", F("км до Вифлеема", "km to Bethlehem", "km bis Betlehem", "km hasta Belén", "km até Belém", "km jusqu'à Bethléem", "كم إلى بيت لحم")),
    fact("star", "1", F("звезда над хлевом", "star over the stable", "Stern über dem Stall", "estrella sobre el establo", "estrela sobre o estábulo", "étoile au-dessus de l'étable", "نجمة فوق المذود")),
    fact("baby", F("ясли", "manger", "Krippe", "pesebre", "manjedoura", "crèche", "مذود"), F("первая кроватка", "first little bed", "erstes Bettchen", "primera cuna", "primeiro berço", "premier petit lit", "أول مهد"))
  ],
  heroes_19: [
    fact("tools", "1", F("ремесло кормит семью", "craft feeds the family", "Handwerk ernährt die Familie", "oficio alimenta a la familia", "ofício alimenta a família", "métier nourrit la famille", "حرفة تعيل الأسرة")),
    fact("path", F("в Египет", "to Egypt", "nach Ägypten", "a Egipto", "ao Egito", "en Égypte", "إلى مصر"), F("увёз семью от беды", "took the family from danger", "brachte die Familie in Sicherheit", "llevó a la familia lejos del peligro", "levou a família para longe do perigo", "emmena la famille loin du danger", "أخذ العائلة بعيدًا عن الخطر")),
    fact("tools", F("сына", "his son", "den Sohn", "a su hijo", "o filho", "son fils", "ابنه"), F("научил ремеслу", "taught the craft", "lehrte er das Handwerk", "le enseñó el oficio", "ensinou o ofício", "lui apprit le métier", "علّمه الحرفة"))
  ],
  heroes_20: [
    fact("gifts", "3", F("дара младенцу", "gifts for the child", "Gaben für das Kind", "regalos al niño", "presentes ao menino", "cadeaux pour l'enfant", "هدايا للطفل")),
    fact("camel", F("много дней", "many days", "viele Tage", "muchos días", "muitos dias", "de nombreux jours", "أيامًا كثيرة"), F("пути за звездой", "of travel following the star", "Reise dem Stern nach", "de viaje tras la estrella", "de viagem atrás da estrela", "de voyage derrière l'étoile", "من السير خلف النجمة")),
    fact("star", F("другой", "another", "einem anderen", "otro", "outro", "un autre", "طريقًا آخر"), F("дорогой вернулись", "road they returned by", "Weg kehrten sie zurück", "camino regresaron", "caminho voltaram", "chemin ils revinrent", "عادوا منه"))
  ],

  plots_01: [
    fact("sun", "6", F("дней творения", "days of creation", "Tage der Schöpfung", "días de creación", "dias da criação", "jours de création", "أيام الخلق")),
    fact("moon", F("7-й", "7th", "7.", "7.º", "7.º", "7e", "السابع"), F("день — отдых", "day — rest", "Tag — Ruhe", "día — descanso", "dia — descanso", "jour — repos", "يوم — راحة")),
    fact("star", "7", F("дней в неделе с тех пор", "days in a week ever since", "Tage in der Woche seither", "días en la semana desde entonces", "dias na semana desde então", "jours dans la semaine depuis", "أيام في الأسبوع منذئذ"))
  ],
  plots_02: [
    fact("tree", "1", F("правило в саду", "rule in the garden", "Regel im Garten", "regla en el jardín", "regra no jardim", "règle dans le jardin", "قاعدة في الجنة")),
    fact("lion", F("все", "all", "alle", "todos", "todos", "tous", "كل"), F("звери получили имена", "animals received names", "Tiere bekamen Namen", "animales recibieron nombres", "animais receberam nomes", "animaux reçurent des noms", "الحيوانات نالت أسماء")),
    fact("waves", "4", F("реки текли из Эдема", "rivers flowed from Eden", "Flüsse flossen aus Eden", "ríos fluían del Edén", "rios fluíam do Éden", "fleuves coulaient d'Éden", "أنهار جرت من عدن"))
  ],
  plots_03: [
    fact("rain", "40", F("дней дождя", "days of rain", "Tage Regen", "días de lluvia", "dias de chuva", "jours de pluie", "يومًا من المطر")),
    fact("ark", M150, F("длина ковчега", "ark length", "Länge der Arche", "largo del arca", "comprimento da arca", "longueur de l'arche", "طول الفلك")),
    fact("dove", "1", F("голубь с веточкой", "dove with a branch", "Taube mit Zweig", "paloma con ramita", "pomba com galho", "colombe avec branche", "حمامة بغصن"))
  ],
  plots_04: [
    fact("rainbow", "7", F("цветов радуги", "colors of the rainbow", "Farben des Regenbogens", "colores del arcoíris", "cores do arco-íris", "couleurs de l'arc-en-ciel", "ألوان قوس قزح")),
    fact("rainbow", "1", F("обещание навсегда", "promise forever", "Versprechen für immer", "promesa para siempre", "promessa para sempre", "promesse pour toujours", "وعد إلى الأبد")),
    fact("rain", F("после дождя", "after the rain", "nach dem Regen", "después de la lluvia", "depois da chuva", "après la pluie", "بعد المطر"), F("ищи радугу", "look for a rainbow", "suche den Regenbogen", "busca el arcoíris", "procure o arco-íris", "cherche l'arc-en-ciel", "ابحث عن قوس قزح"))
  ],
  plots_05: [
    fact("speech", "1", F("язык был у всех", "language for everyone", "Sprache für alle", "idioma para todos", "língua para todos", "langue pour tous", "لغة كانت للجميع")),
    fact("tower", F("до неба", "to the sky", "bis zum Himmel", "hasta el cielo", "até o céu", "jusqu'au ciel", "إلى السماء"), F("хотели достроить", "they wanted to finish", "wollten sie bauen", "querían terminar", "queriam terminar", "ils voulaient achever", "أرادوا إكماله")),
    fact("speech", F("сотни", "hundreds", "hunderte", "cientos", "centenas", "des centaines", "مئات"), F("языков стало потом", "of languages came after", "Sprachen kamen danach", "de idiomas vinieron después", "de línguas vieram depois", "de langues vinrent ensuite", "من اللغات صارت بعدها"))
  ],
  plots_06: [
    fact("stone", "1", F("камень вместо подушки", "stone instead of a pillow", "Stein statt Kissen", "piedra en lugar de almohada", "pedra em vez de travesseiro", "pierre à la place d'un oreiller", "حجر بدل وسادة")),
    fact("ladder", F("до неба", "to the sky", "bis zum Himmel", "hasta el cielo", "até o céu", "jusqu'au ciel", "إلى السماء"), F("поднялась лестница", "the ladder rose", "stieg die Leiter", "subió la escalera", "subiu a escada", "monta l'échelle", "ارتفع السلم")),
    fact("star", F("вверх и вниз", "up and down", "auf und ab", "arriba y abajo", "para cima e para baixo", "haut et bas", "صعودًا وهبوطًا"), F("шли ангелы", "angels walked", "gingen Engel", "iban ángeles", "iam anjos", "allaient des anges", "كانت الملائكة تسير"))
  ],
  plots_07: [
    fact("people", "11", F("братьев", "brothers", "Brüder", "hermanos", "irmãos", "frères", "إخوة")),
    fact("coat", F("все цвета", "all the colors", "alle Farben", "todos los colores", "todas as cores", "toutes les couleurs", "كل الألوان"), F("радуги на одежде", "of the rainbow on the coat", "des Regenbogens am Gewand", "del arcoíris en la túnica", "do arco-íris na túnica", "de l'arc-en-ciel sur l'habit", "قوس قزح على الثوب")),
    fact("scroll", "20", F("монет — цена предательства", "coins — price of betrayal", "Münzen — Preis des Verrats", "monedas — precio de la traición", "moedas — preço da traição", "pièces — prix de la trahison", "قطعة — ثمن الخيانة"))
  ],
  plots_08: [
    fact("baby", "3", F("месяца прятали", "months they hid him", "Monate versteckten sie ihn", "meses lo escondieron", "meses o esconderam", "mois ils le cachèrent", "أشهر أخفوه")),
    fact("basket", "1", F("корзинка из тростника", "reed basket", "Schilfkorb", "cesta de juncos", "cesto de juncos", "panier de roseaux", "سلّة من القصب")),
    fact("crown", F("дочь фараона", "Pharaoh's daughter", "Pharaos Tochter", "la hija del faraón", "a filha do faraó", "la fille de Pharaon", "ابنة فرعون"), F("нашла малыша", "found the baby", "fand das Kind", "encontró al bebé", "encontrou o bebê", "trouva le bébé", "وجدت الطفل"))
  ],
  plots_09: [
    fact("bush", "1", F("куст горел не сгорая", "bush burned without burning up", "Busch brannte ohne zu verbrennen", "zarza ardía sin consumirse", "sarça ardia sem se consumir", "buisson brûlait sans se consumer", "عليقة اشتعلت دون أن تحترق")),
    fact("sandal", F("босиком", "barefoot", "barfuß", "descalzo", "descalço", "pieds nus", "حافي القدمين"), F("на святой земле", "on holy ground", "auf heiligem Boden", "en tierra santa", "em terra santa", "sur une terre sainte", "على أرض مقدسة")),
    fact("staff", F("отсюда", "from here", "von hier", "desde aquí", "daqui", "d'ici", "من هنا"), F("начался Исход", "the Exodus began", "begann der Auszug", "comenzó el Éxodo", "começou o Êxodo", "commença l'Exode", "بدأ الخروج"))
  ],
  plots_10: [
    fact("waves", "2", F("стены воды", "walls of water", "Wasserwände", "muros de agua", "paredes de água", "murs d'eau", "جدارا ماء")),
    fact("path", F("по дну", "on the seabed", "auf dem Grund", "por el fondo", "pelo fundo", "sur le fond", "على القاع"), F("как по дороге", "as on a road", "wie auf einer Straße", "como por un camino", "como por uma estrada", "comme sur une route", "كما على طريق")),
    fact("waves", "0", F("промокших ног", "wet feet", "nasse Füße", "pies mojados", "pés molhados", "pieds mouillés", "أقدام مبلّلة"))
  ],
  plots_11: [
    fact("bread", "40", F("лет в пустыне", "years in the desert", "Jahre in der Wüste", "años en el desierto", "anos no deserto", "ans dans le désert", "سنة في البرية")),
    fact("bread", F("каждое утро", "every morning", "jeden Morgen", "cada mañana", "toda manhã", "chaque matin", "كل صباح"), F("свежая манна", "fresh manna", "frisches Manna", "maná fresco", "maná fresco", "manne fraîche", "منّ طازج")),
    fact("bread", F("на 1 день", "for 1 day", "für 1 Tag", "para 1 día", "para 1 dia", "pour 1 jour", "ليوم واحد"), F("и ни крупинки впрок", "and not a crumb extra", "und kein Krümel für später", "y ni una migaja de más", "e nem uma migalha a mais", "et pas une miette de plus", "ولا فتات زيادة"))
  ],
  plots_12: [
    fact("tablets", "10", F("главных правил", "main rules", "Hauptgebote", "reglas principales", "regras principais", "règles principales", "وصايا رئيسية")),
    fact("tablets", "2", F("каменные плиты", "stone tablets", "Steintafeln", "tablas de piedra", "tábuas de pedra", "tables de pierre", "لوحان من حجر")),
    fact("tablets", F("3000+", "3000+", "3000+", "3000+", "3000+", "3000+", "+٣٠٠٠"), F("лет правилам", "years of these rules", "Jahre gelten die Gebote", "años de estas reglas", "anos destas regras", "ans de ces règles", "سنة لهذه الوصايا"))
  ],
  plots_13: [
    fact("wall", "7", F("дней обходили город", "days circling the city", "Tage umrundeten sie die Stadt", "días rodearon la ciudad", "dias rodearam a cidade", "jours ils firent le tour de la ville", "أيام داروا حول المدينة")),
    fact("horn", "7", F("труб-шофаров", "shofar trumpets", "Schofar-Hörner", "trompetas de shofar", "trombetas de shofar", "trompes de shofar", "أبواق شوفار")),
    fact("wall", F("сами", "by themselves", "von selbst", "solas", "sozinhas", "toutes seules", "وحدها"), F("рухнули стены", "the walls fell", "fielen die Mauern", "cayeron los muros", "caíram as muralhas", "tombèrent les murs", "انهارت الأسوار"))
  ],
  plots_14: [
    fact("stone", M3, F("рост Голиафа", "Goliath's height", "Größe Goliaths", "estatura de Goliat", "altura de Golias", "taille de Goliath", "طول جليات")),
    fact("stone", "5", F("камней из ручья", "stones from the brook", "Steine aus dem Bach", "piedras del arroyo", "pedras do riacho", "pierres du ruisseau", "حجارة من الجدول")),
    fact("stone", "1", F("точный бросок", "accurate throw", "treffender Wurf", "tiro certero", "lançamento certeiro", "lancer précis", "رمية دقيقة"))
  ],
  plots_15: [
    fact("people", "2", F("мамы спорили", "mothers argued", "Mütter stritten", "mamás discutían", "mães discutiam", "mères se disputaient", "أمّان تخاصمتا")),
    fact("baby", "1", F("младенец", "baby", "Baby", "bebé", "bebê", "bébé", "رضيع")),
    fact("crown", F("мудрейшее", "the wisest", "die weiseste", "la más sabia", "a mais sábia", "la plus sage", "أحكم"), F("решение царя", "decision of the king", "Entscheidung des Königs", "decisión del rey", "decisão do rei", "décision du roi", "قرار الملك"))
  ],
  plots_16: [
    fact("temple", "7", F("лет стройки", "years of building", "Jahre Bauzeit", "años de construcción", "anos de construção", "ans de construction", "سنوات بناء")),
    fact("tools", "0", F("ударов молотка", "hammer blows", "Hammerschläge", "golpes de martillo", "golpes de martelo", "coups de marteau", "ضربة مطرقة")),
    fact("temple", F("золото и кедр", "gold and cedar", "Gold und Zeder", "oro y cedro", "ouro e cedro", "or et cèdre", "ذهب وأرز"), F("внутри стен", "inside the walls", "innerhalb der Mauern", "dentro de los muros", "dentro das paredes", "à l'intérieur des murs", "داخل الجدران"))
  ],
  plots_17: [
    fact("lion", "1", F("ночь среди львов", "night among lions", "Nacht unter Löwen", "noche entre leones", "noite entre leões", "nuit parmi les lions", "ليلة بين الأسود")),
    fact("lion", F("как кошки", "like cats", "wie Katzen", "como gatos", "como gatos", "comme des chats", "كالقطط"), F("улеглись львы", "the lions lay down", "legten sich die Löwen", "se tumbaron los leones", "deitaram-se os leões", "les lions s'allongèrent", "ربضت الأسود")),
    fact("lion", "0", F("царапин наутро", "scratches by morning", "Kratzer am Morgen", "arañazos por la mañana", "arranhões pela manhã", "égratignures au matin", "خدوش في الصباح"))
  ],
  plots_18: [
    fact("fish", "3", F("дня внутри рыбы", "days inside the fish", "Tage im Fisch", "días dentro del pez", "dias dentro do peixe", "jours dans le poisson", "أيام داخل السمكة")),
    fact("fish", "1", F("большая рыба", "great fish", "großer Fisch", "gran pez", "grande peixe", "grand poisson", "سمكة كبيرة")),
    fact("path", F("второй", "a second", "eine zweite", "una segunda", "uma segunda", "une seconde", "ثانية"), F("шанс для каждого", "chance for everyone", "Chance für jeden", "oportunidad para todos", "chance para todos", "chance pour chacun", "فرصة للجميع"))
  ],
  plots_19: [
    fact("scroll", "127", F("областей в царстве", "provinces in the kingdom", "Provinzen im Reich", "provincias en el reino", "províncias no reino", "provinces dans le royaume", "ولاية في المملكة")),
    fact("crown", "1", F("золотой скипетр", "golden scepter", "goldenes Zepter", "cetro de oro", "cetro de ouro", "sceptre d'or", "صولجان ذهبي")),
    fact("crown", F("Пурим", "Purim", "Purim", "Purim", "Purim", "Pourim", "بوريم"), F("праздник с тех пор", "festival ever since", "Fest seither", "fiesta desde entonces", "festa desde então", "fête depuis", "عيد منذئذ"))
  ],
  plots_20: [
    fact("gifts", "3", F("дара у яслей", "gifts at the manger", "Gaben an der Krippe", "regalos en el pesebre", "presentes na manjedoura", "cadeaux à la crèche", "هدايا عند المذود")),
    fact("star", "1", F("яркая звезда", "bright star", "heller Stern", "estrella brillante", "estrela brilhante", "étoile brillante", "نجمة ساطعة")),
    fact("baby", F("весь мир", "the whole world", "die ganze Welt", "todo el mundo", "o mundo inteiro", "le monde entier", "العالم كله"), F("празднует этот день", "celebrates this day", "feiert diesen Tag", "celebra este día", "celebra este dia", "célèbre ce jour", "يحتفل بهذا اليوم"))
  ]
};

/* Fix typo in heroes_12 fact */
FACTS.heroes_12[1].label = F("хватило одного", "was enough", "reichte einer", "bastó con una", "bastou uma", "suffit d'une", "يكفي واحد");

var DATA = {};
Object.keys(FINDS).forEach(function (id) {
  DATA[id] = { find: FINDS[id], facts: FACTS[id] };
});

/* ── SVG icons (atlas style, transparent bg) ── */
var SVG_HEAD = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-hidden="true">\n';
var SVG_TAIL = "\n</svg>\n";

function svg(body) { return SVG_HEAD + body + SVG_TAIL; }

var ICONS = {
  crown: svg('<path d="M12 44h40v4H12z" fill="#c48a45" stroke="#6a4220" stroke-width="1.1"/><path d="M14 44l4-18 8 10 6-16 6 16 8-10 4 18H14z" fill="#e6c07a" stroke="#6a4220" stroke-width="1.2" stroke-linejoin="round"/><circle cx="18" cy="24" r="2.4" fill="#d4a05a" stroke="#6a4220" stroke-width=".9"/><circle cx="32" cy="16" r="2.6" fill="#d4a05a" stroke="#6a4220" stroke-width=".9"/><circle cx="46" cy="24" r="2.4" fill="#d4a05a" stroke="#6a4220" stroke-width=".9"/>'),
  scroll: svg('<path d="M18 12h28c2.2 0 4 1.8 4 4v32c0 2.2-1.8 4-4 4H18c-2.2 0-4-1.8-4-4V16c0-2.2 1.8-4 4-4z" fill="#f0e2c4" stroke="#6a4220" stroke-width="1.2"/><path d="M22 22h20M22 30h18M22 38h16" stroke="#8a5a28" stroke-width="1.6" stroke-linecap="round"/><path d="M14 18c-2.5 0-4 1.6-4 3.5S11.5 25 14 25" fill="none" stroke="#6a4220" stroke-width="1.1"/><path d="M50 39c2.5 0 4 1.6 4 3.5S52.5 46 50 46" fill="none" stroke="#6a4220" stroke-width="1.1"/>'),
  star: svg('<path d="M32 8l5.2 12.4 13.5 1.2-10.2 8.6 3.2 13.1L32 36.5 20.3 43.3l3.2-13.1-10.2-8.6 13.5-1.2z" fill="#e6c07a" stroke="#6a4220" stroke-width="1.2" stroke-linejoin="round"/>'),
  fish: svg('<path d="M10 32c8-12 22-16 34-10 4 2 8 5 12 5-3 2-5 5-5 8s2 6 5 8c-4 0-8 3-12 5-12 6-26 2-34-10 2-2 4-4 0-6z" fill="#6a9ab5" stroke="#3a5a70" stroke-width="1.2" stroke-linejoin="round"/><circle cx="20" cy="30" r="2.2" fill="#2a1c10"/><path d="M44 27c3 2 5 4 5 5s-2 3-5 5" fill="none" stroke="#3a5a70" stroke-width="1.1"/>'),
  lion: svg('<ellipse cx="32" cy="40" rx="14" ry="12" fill="#d4a05a" stroke="#7a5228" stroke-width="1.1"/><circle cx="32" cy="24" r="11" fill="#c48a45" stroke="#7a5228" stroke-width="1.1"/><circle cx="32" cy="26" r="7" fill="#e6c07a"/><circle cx="28.5" cy="25" r="1.3" fill="#2a1c10"/><circle cx="35.5" cy="25" r="1.3" fill="#2a1c10"/><ellipse cx="32" cy="28.5" rx="1.4" ry="1" fill="#5a3a20"/><path d="M28 31c2.5 1.6 5.5 1.6 8 0" fill="none" stroke="#7a5228" stroke-width=".9" stroke-linecap="round"/><path d="M18 18c-2-4 2-8 6-6M46 18c2-4-2-8-6-6" fill="none" stroke="#a86e32" stroke-width="2.2" stroke-linecap="round"/>'),
  fire: svg('<path d="M32 10c2 8-6 12-4 20 1 4 5 6 5 6s6-4 5-12c8 6 6 18-1 24-5 4-13 4-18 0-8-7-6-20 2-26 0 6 4 8 5 12 1-8-1-16 6-24z" fill="#d47a3a" stroke="#6a4220" stroke-width="1.1" stroke-linejoin="round"/><path d="M30 36c1 3 4 5 4 5s3-3 2-7c-1 2-3 2-6 2z" fill="#e6c07a"/>'),
  baby: svg('<circle cx="32" cy="22" r="10" fill="#e6c07a" stroke="#6a4220" stroke-width="1.1"/><circle cx="28.5" cy="21" r="1.2" fill="#2a1c10"/><circle cx="35.5" cy="21" r="1.2" fill="#2a1c10"/><path d="M29 26c2 1.4 4 1.4 6 0" fill="none" stroke="#6a4220" stroke-width=".9" stroke-linecap="round"/><ellipse cx="32" cy="42" rx="12" ry="10" fill="#c48a45" stroke="#6a4220" stroke-width="1.1"/><path d="M20 40c-3 2-4 6-2 8M44 40c3 2 4 6 2 8" fill="none" stroke="#a86e32" stroke-width="2" stroke-linecap="round"/>'),
  staff: svg('<path d="M38 8c6 2 8 8 4 12-2 2-5 2-7 0l-1-1" fill="none" stroke="#8a5a28" stroke-width="3.2" stroke-linecap="round"/><path d="M34 18L22 54" stroke="#8a5a28" stroke-width="3.4" stroke-linecap="round"/><path d="M34 18L22 54" stroke="#c48a45" stroke-width="1.6" stroke-linecap="round"/>'),
  tent: svg('<path d="M10 48L32 12l22 36H10z" fill="#c48a45" stroke="#6a4220" stroke-width="1.2" stroke-linejoin="round"/><path d="M32 12v36" stroke="#6a4220" stroke-width="1.2"/><path d="M26 48v-8c0-3 12-3 12 0v8" fill="#8a5a28"/><path d="M12 48h40" stroke="#6a4220" stroke-width="1.4" stroke-linecap="round"/>'),
  ladder: svg('<path d="M20 8v48M44 8v48" stroke="#8a5a28" stroke-width="3.2" stroke-linecap="round"/><path d="M20 8v48M44 8v48" stroke="#c48a45" stroke-width="1.4" stroke-linecap="round"/><path d="M20 16h24M20 26h24M20 36h24M20 46h24" stroke="#8a5a28" stroke-width="2.4" stroke-linecap="round"/>'),
  coat: svg('<path d="M22 14c3-6 17-6 20 0l6 8-6 2v28H22V24l-6-2z" fill="#6a9ab5" stroke="#3a5a70" stroke-width="1.2" stroke-linejoin="round"/><path d="M28 14c1 8 7 8 8 0" fill="none" stroke="#3a5a70" stroke-width="1"/><path d="M24 28h16M24 36h16M24 44h16" stroke="#e6c07a" stroke-width="2" stroke-linecap="round" opacity=".85"/>'),
  tablets: svg('<rect x="10" y="12" width="20" height="40" rx="2" fill="#c5d5e2" stroke="#5a6e7e" stroke-width="1.2"/><rect x="34" y="12" width="20" height="40" rx="2" fill="#c5d5e2" stroke="#5a6e7e" stroke-width="1.2"/><path d="M15 22h10M15 30h10M15 38h8M39 22h10M39 30h10M39 38h8" stroke="#5a6e7e" stroke-width="1.4" stroke-linecap="round"/>'),
  basket: svg('<path d="M16 28h32l-3 22H19z" fill="#c48a45" stroke="#6a4220" stroke-width="1.2" stroke-linejoin="round"/><path d="M20 34h24M18 40h28M20 46h24" stroke="#8a5a28" stroke-width="1" opacity=".7"/><path d="M24 28c0-10 16-10 16 0" fill="none" stroke="#6a4220" stroke-width="2" stroke-linecap="round"/>'),
  bush: svg('<ellipse cx="32" cy="36" rx="18" ry="14" fill="#6a9a5a" stroke="#3a5a30" stroke-width="1.2"/><ellipse cx="22" cy="30" rx="10" ry="8" fill="#7aad68" stroke="#3a5a30" stroke-width="1"/><ellipse cx="42" cy="30" rx="10" ry="8" fill="#7aad68" stroke="#3a5a30" stroke-width="1"/><path d="M28 18c1 6-3 8-1 14M34 16c0 7 4 9 2 16M32 14c2 6 0 10 1 16" fill="none" stroke="#d47a3a" stroke-width="2" stroke-linecap="round"/><path d="M30 54h4v4h-4z" fill="#8a5a28"/>'),
  waves: svg('<path d="M8 28c4-3 8-3 12 0s8 3 12 0 8-3 12 0 8 3 12 0" fill="none" stroke="#6a9ab5" stroke-width="2.4" stroke-linecap="round"/><path d="M8 38c4-3 8-3 12 0s8 3 12 0 8-3 12 0 8 3 12 0" fill="none" stroke="#8bb0c6" stroke-width="2.2" stroke-linecap="round"/><path d="M8 48c4-3 8-3 12 0s8 3 12 0 8-3 12 0 8 3 12 0" fill="none" stroke="#6a9ab5" stroke-width="2" stroke-linecap="round"/>'),
  bread: svg('<ellipse cx="32" cy="34" rx="22" ry="14" fill="#e6c07a" stroke="#6a4220" stroke-width="1.2"/><path d="M16 30c4-6 12-8 20-6 6 1 12 5 14 10" fill="none" stroke="#c48a45" stroke-width="1.4" stroke-linecap="round"/><circle cx="24" cy="34" r="1.2" fill="#8a5a28"/><circle cx="32" cy="36" r="1.2" fill="#8a5a28"/><circle cx="40" cy="33" r="1.2" fill="#8a5a28"/>'),
  horn: svg('<path d="M12 40c8-18 22-26 40-28-4 8-8 16-10 24-8 2-18 4-30 4z" fill="#d4a05a" stroke="#6a4220" stroke-width="1.2" stroke-linejoin="round"/><ellipse cx="14" cy="40" rx="5" ry="4" fill="#c48a45" stroke="#6a4220" stroke-width="1"/><path d="M28 24c4 4 8 10 10 16" fill="none" stroke="#8a5a28" stroke-width="1" opacity=".6"/>'),
  stone: svg('<ellipse cx="32" cy="36" rx="18" ry="14" fill="#9eb6c8" stroke="#5a6e7e" stroke-width="1.2"/><path d="M20 32c4-4 10-4 14-1 3 2 6 1 10-2" fill="none" stroke="#7a90a0" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="22" cy="48" rx="6" ry="4" fill="#8aa0b0" stroke="#5a6e7e" stroke-width=".9"/><ellipse cx="44" cy="46" rx="5" ry="3.5" fill="#8aa0b0" stroke="#5a6e7e" stroke-width=".9"/>'),
  temple: svg('<path d="M10 48h44v4H10z" fill="#c48a45" stroke="#6a4220" stroke-width="1"/><path d="M14 48V30h36v18" fill="#e6c07a" stroke="#6a4220" stroke-width="1.1"/><path d="M12 30l20-14 20 14H12z" fill="#d4a05a" stroke="#6a4220" stroke-width="1.2" stroke-linejoin="round"/><path d="M22 48v-12h6v12M36 48v-12h6v12" fill="#8a5a28"/><circle cx="32" cy="20" r="2" fill="#e6c07a" stroke="#6a4220" stroke-width=".8"/>'),
  camel: svg('<path d="M12 40c2-8 8-12 14-10 2 6 6 8 10 6 3-8 10-10 16-6 2 2 4 6 4 10v6H12v-6z" fill="#d4a05a" stroke="#7a5228" stroke-width="1.1" stroke-linejoin="round"/><path d="M48 30c4-2 8 0 10 4 1 2 0 6-2 7" fill="none" stroke="#7a5228" stroke-width="2.4" stroke-linecap="round"/><circle cx="54" cy="30" r="3.5" fill="#c48a45" stroke="#7a5228" stroke-width="1"/><circle cx="55.2" cy="29.2" r=".8" fill="#2a1c10"/><path d="M18 46v8M28 46v8M38 46v8M46 46v8" stroke="#7a5228" stroke-width="2.2" stroke-linecap="round"/>'),
  harp: svg('<path d="M18 12h8c12 0 22 10 22 22v18h-6V34c0-8-6-14-14-14h-10z" fill="#c48a45" stroke="#6a4220" stroke-width="1.2" stroke-linejoin="round"/><path d="M22 16v34M28 18v32M34 22v28M40 28v22" stroke="#8a5a28" stroke-width="1.2"/><path d="M16 12v40" stroke="#6a4220" stroke-width="3" stroke-linecap="round"/>'),
  wall: svg('<path d="M8 48h48v4H8z" fill="#8a5a28"/><path d="M10 20h44v28H10z" fill="#c5d5e2" stroke="#5a6e7e" stroke-width="1.2"/><path d="M10 28h44M10 36h44M10 44h44M24 20v28M40 20v28" stroke="#7a90a0" stroke-width="1.1"/><path d="M14 14h8v6h-8zM28 14h8v6h-8zM42 14h8v6h-8z" fill="#9eb6c8" stroke="#5a6e7e" stroke-width="1"/>'),
  dove: svg('<path d="M14 36c6-10 16-14 26-10 4 8 2 16-4 20-8 2-16 0-22-10z" fill="#eef6fb" stroke="#5a6e7e" stroke-width="1.2" stroke-linejoin="round"/><path d="M36 28c6-2 12 0 16 4-4 2-8 2-12 1" fill="#c5d5e2" stroke="#5a6e7e" stroke-width="1"/><circle cx="24" cy="32" r="1.4" fill="#2a1c10"/><path d="M20 40l-4 8 6-2" fill="none" stroke="#6a9a5a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'),
  rainbow: svg('<path d="M10 44c0-14 12-24 22-24s22 10 22 24" fill="none" stroke="#d47a3a" stroke-width="3.2" stroke-linecap="round"/><path d="M14 44c0-11 9-19 18-19s18 8 18 19" fill="none" stroke="#e6c07a" stroke-width="3" stroke-linecap="round"/><path d="M18 44c0-8 6-14 14-14s14 6 14 14" fill="none" stroke="#6a9ab5" stroke-width="2.8" stroke-linecap="round"/><path d="M22 44c0-5 4-9 10-9s10 4 10 9" fill="none" stroke="#7aad68" stroke-width="2.6" stroke-linecap="round"/>'),
  tools: svg('<path d="M18 12l8 8-4 4-8-8c-2-2 0-6 4-4z" fill="#9eb6c8" stroke="#5a6e7e" stroke-width="1.1"/><path d="M24 22l22 22" stroke="#8a5a28" stroke-width="3.2" stroke-linecap="round"/><path d="M24 22l22 22" stroke="#c48a45" stroke-width="1.4" stroke-linecap="round"/><rect x="36" y="12" width="16" height="6" rx="1" fill="#c48a45" stroke="#6a4220" stroke-width="1" transform="rotate(35 44 15)"/><path d="M40 20l-6 10" stroke="#6a4220" stroke-width="2" stroke-linecap="round"/>'),
  gifts: svg('<rect x="14" y="28" width="36" height="24" rx="2" fill="#c48a45" stroke="#6a4220" stroke-width="1.2"/><path d="M14 36h36" stroke="#6a4220" stroke-width="1.2"/><path d="M32 28v24" stroke="#6a4220" stroke-width="1.2"/><path d="M24 28c4-8 12-8 16 0" fill="none" stroke="#d47a3a" stroke-width="2.2" stroke-linecap="round"/><circle cx="32" cy="24" r="3" fill="#e6c07a" stroke="#6a4220" stroke-width=".9"/>'),
  tower: svg('<path d="M22 52V22l10-10 10 10v30H22z" fill="#c5d5e2" stroke="#5a6e7e" stroke-width="1.2" stroke-linejoin="round"/><path d="M22 22h20M22 32h20M22 42h20" stroke="#7a90a0" stroke-width="1"/><rect x="28" y="44" width="8" height="8" fill="#8a5a28"/><path d="M26 14h4v4h-4zM34 14h4v4h-4z" fill="#9eb6c8" stroke="#5a6e7e" stroke-width=".9"/><path d="M18 52h28" stroke="#6a4220" stroke-width="2" stroke-linecap="round"/>'),
  sandal: svg('<path d="M14 36c0-6 8-12 20-12s18 4 20 10c1 4-2 10-8 12H22c-6 0-10-4-8-10z" fill="#c48a45" stroke="#6a4220" stroke-width="1.2"/><path d="M24 30c4-6 16-4 18 4" fill="none" stroke="#8a5a28" stroke-width="2" stroke-linecap="round"/><path d="M28 40h16" stroke="#6a4220" stroke-width="1.4" stroke-linecap="round"/>'),
  sun: svg('<circle cx="32" cy="32" r="12" fill="#e6c07a" stroke="#6a4220" stroke-width="1.2"/><path d="M32 8v6M32 50v6M8 32h6M50 32h6M14 14l4 4M46 46l4 4M14 50l4-4M46 18l4-4" stroke="#d4a05a" stroke-width="2.2" stroke-linecap="round"/>'),
  moon: svg('<path d="M40 12c-10 2-18 12-16 24 2 10 12 16 22 14-8 6-20 4-26-4-8-10-6-26 6-32 4-2 10-3 14-2z" fill="#c5d5e2" stroke="#5a6e7e" stroke-width="1.2" stroke-linejoin="round"/>'),
  tree: svg('<path d="M32 28c-12 0-18 10-14 18h28c4-8-2-18-14-18z" fill="#6a9a5a" stroke="#3a5a30" stroke-width="1.2"/><ellipse cx="24" cy="26" rx="10" ry="9" fill="#7aad68" stroke="#3a5a30" stroke-width="1"/><ellipse cx="40" cy="26" rx="10" ry="9" fill="#7aad68" stroke="#3a5a30" stroke-width="1"/><ellipse cx="32" cy="18" rx="9" ry="8" fill="#8bbc78" stroke="#3a5a30" stroke-width="1"/><path d="M30 44h4v12h-4z" fill="#8a5a28"/><circle cx="28" cy="22" r="2" fill="#d47a3a"/><circle cx="36" cy="28" r="2" fill="#d47a3a"/><circle cx="32" cy="14" r="1.8" fill="#d47a3a"/>'),
  people: svg('<circle cx="22" cy="18" r="7" fill="#e6c07a" stroke="#6a4220" stroke-width="1"/><path d="M12 44c0-8 5-14 10-14s10 6 10 14" fill="#c48a45" stroke="#6a4220" stroke-width="1.1"/><circle cx="42" cy="18" r="7" fill="#e6c07a" stroke="#6a4220" stroke-width="1"/><path d="M32 44c0-8 5-14 10-14s10 6 10 14" fill="#6a9ab5" stroke="#3a5a70" stroke-width="1.1"/>'),
  path: svg('<path d="M18 52c6-8 8-14 6-22 8 2 14 8 18 16 2-8 8-14 14-18" fill="none" stroke="#c48a45" stroke-width="4" stroke-linecap="round"/><path d="M18 52c6-8 8-14 6-22 8 2 14 8 18 16 2-8 8-14 14-18" fill="none" stroke="#e6c07a" stroke-width="1.6" stroke-linecap="round"/><circle cx="24" cy="28" r="2" fill="#8a5a28"/><circle cx="40" cy="40" r="2" fill="#8a5a28"/><circle cx="52" cy="24" r="2" fill="#8a5a28"/>'),
  speech: svg('<path d="M12 16h40v28H28l-8 8v-8H12z" fill="#f0e2c4" stroke="#6a4220" stroke-width="1.2" stroke-linejoin="round"/><path d="M20 26h24M20 34h18" stroke="#8a5a28" stroke-width="1.6" stroke-linecap="round"/>'),
  rope: svg('<path d="M20 12c8 4 8 12 0 16s-8 12 0 16 8 12 0 16" fill="none" stroke="#c48a45" stroke-width="4" stroke-linecap="round"/><path d="M20 12c8 4 8 12 0 16s-8 12 0 16 8 12 0 16" fill="none" stroke="#8a5a28" stroke-width="1.4" stroke-linecap="round"/><path d="M36 12c8 4 8 12 0 16s-8 12 0 16 8 12 0 16" fill="none" stroke="#c48a45" stroke-width="4" stroke-linecap="round"/><path d="M36 12c8 4 8 12 0 16s-8 12 0 16 8 12 0 16" fill="none" stroke="#8a5a28" stroke-width="1.4" stroke-linecap="round"/>'),
  lamp: svg('<path d="M24 28c0-8 4-14 8-14s8 6 8 14c2 2 4 6 2 10H22c-2-4 0-8 2-10z" fill="#e6c07a" stroke="#6a4220" stroke-width="1.2"/><path d="M28 20c2-2 6-2 8 0" fill="none" stroke="#d47a3a" stroke-width="2" stroke-linecap="round"/><rect x="26" y="38" width="12" height="6" rx="1" fill="#c48a45" stroke="#6a4220" stroke-width="1"/><path d="M30 44h4v8h-4z" fill="#8a5a28"/><path d="M24 52h16" stroke="#6a4220" stroke-width="2" stroke-linecap="round"/>'),
  grain: svg('<path d="M32 12c-2 6 2 10 2 16M32 12c2 6-2 10-2 16" fill="none" stroke="#c48a45" stroke-width="2" stroke-linecap="round"/><ellipse cx="28" cy="22" rx="5" ry="8" fill="#e6c07a" stroke="#6a4220" stroke-width="1" transform="rotate(-20 28 22)"/><ellipse cx="36" cy="22" rx="5" ry="8" fill="#e6c07a" stroke="#6a4220" stroke-width="1" transform="rotate(20 36 22)"/><ellipse cx="28" cy="34" rx="5" ry="8" fill="#d4a05a" stroke="#6a4220" stroke-width="1" transform="rotate(-20 28 34)"/><ellipse cx="36" cy="34" rx="5" ry="8" fill="#d4a05a" stroke="#6a4220" stroke-width="1" transform="rotate(20 36 34)"/><path d="M32 28v28" stroke="#8a5a28" stroke-width="2.4" stroke-linecap="round"/>')
};

function writeIcons() {
  if (!fs.existsSync(ICON_DIR)) fs.mkdirSync(ICON_DIR, { recursive: true });
  var names = Object.keys(ICONS);
  names.forEach(function (n) {
    fs.writeFileSync(path.join(ICON_DIR, n + ".svg"), ICONS[n], "utf8");
  });
  return names;
}

function writeData() {
  var used = {};
  Object.keys(DATA).forEach(function (id) {
    DATA[id].facts.forEach(function (f) { used[f.icon] = true; });
  });
  var missing = Object.keys(used).filter(function (i) {
    return !ICONS[i] && !fs.existsSync(path.join(ICON_DIR, i + ".svg"));
  });
  if (missing.length) {
    console.error("Missing icons:", missing.join(", "));
    process.exit(1);
  }
  var header =
    "/* data/poster_overlay.js — live poster overlays for all album cards.\n" +
    "   Loaded before core/engines/quest/quest.js. Keys: heroes_* / plots_*.\n" +
    "   find: middot list matching clean watercolor; facts: [{icon,num,label}].\n" +
    "   Generated by pipeline/gen_poster_overlay.js — edit that to regenerate. */\n" +
    "window.POSTER_OVERLAY = ";
  var body = JSON.stringify(DATA, null, 1)
    .replace(/"([a-zA-Z_][a-zA-Z0-9_]*)":/g, "$1:");
  fs.writeFileSync(OUT, header + body + ";\n", "utf8");
  return { cards: Object.keys(DATA).length, icons: Object.keys(used).sort() };
}

var iconNames = writeIcons();
var info = writeData();
console.log("Wrote", OUT);
console.log("Cards:", info.cards);
console.log("Icons written:", iconNames.length);
console.log("Icons used:", info.icons.join(", "));
