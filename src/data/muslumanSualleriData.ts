export interface MuslumanSualiItem {
  id: number;
  category: string;
  sual: string;
  cevap: string;
}

export const MUSLUMAN_SUALLERI_DATA: MuslumanSualiItem[] = [
  {
    id: 1,
    sual: "Sen Müslüman mısın?",
    cevap: "Müslümanım Elhamdülillâh.",
    category: "İman & Akâid"
  },
  {
    id: 2,
    sual: "Müslümanım demenin mânâsı nedir?",
    cevap: "Allâh'ı bir bilmek, Kur'ân-ı Kerîm'i ve Muhammed Aleyhisselâm'ı tasdik etmektir.",
    category: "İman & Akâid"
  },
  {
    id: 3,
    sual: "Ne zamandan beri Müslümansın?",
    cevap: "\"Belâ\" dediğimiz zamandan beri müslümanım.",
    category: "İman & Akâid"
  },
  {
    id: 4,
    sual: "\"Belâ\" zamanı neye derler?",
    cevap: "Misâk'a derler. Cenâb-ı Hak ruhlarımızı yarattığı vakit bunlara hitâben \"Elestü birabbiküm\" yani (Ben sizin rabbiniz değil miyim?) diye sordu. Onlar da \"Belâ\" (Evet, Rabbimizsin) dediler. O zamandan beri Müslümanım demektir.",
    category: "İman & Akâid"
  },
  {
    id: 5,
    sual: "Rabbin kimdir?",
    cevap: "Allâhü Teâlâ.",
    category: "Marifetullah"
  },
  {
    id: 6,
    sual: "Seni kim yarattı?",
    cevap: "Allâhü Teâlâ.",
    category: "Marifetullah"
  },
  {
    id: 7,
    sual: "Sen kimin kulusun?",
    cevap: "Allâhü Teâlâ'nın kuluyum.",
    category: "Marifetullah"
  },
  {
    id: 8,
    sual: "Allâh kaçtır diyenlere ne dersin?",
    cevap: "Allâhü Teâlâ birdir, derim.",
    category: "Tevhid"
  },
  {
    id: 9,
    sual: "Allâhu Teâla'nın bir olduğuna delilin nedir?",
    cevap: "İhlâs Sûresi'nin ilk âyet-i kerîmesidir.",
    category: "Tevhid"
  },
  {
    id: 10,
    sual: "Bunun manası nedir?",
    cevap: "\"Sen söyle ki ey Habîbim, Allâh birdir.\" demektir.",
    category: "Tevhid"
  },
  {
    id: 11,
    sual: "Allâhü Teâlâ'nın varlığına aklî delilin nedir?",
    cevap: "Bu âlemin varlığı ve âlemdeki nizâm ve intizâmın devamıdır.",
    category: "Aklî Deliller"
  },
  {
    id: 12,
    sual: "Allâh'ın zâtı hakkında düşünce câiz midir?",
    cevap: "Câiz değildir. Çünkü akıl, Allâh'ın zâtını anlamaktan acizdir. Allâh'ın, ancak sıfatı hakkında düşünülür.",
    category: "Akaid & Sıfatlar"
  },
  {
    id: 13,
    sual: "İman-ı yeis nedir?",
    cevap: "Firavun gibi ölürken iman etmektir.",
    category: "İman Hükümleri"
  },
  {
    id: 14,
    sual: "Allâhu Teala bu îmanı kabul eder mi?",
    cevap: "Hayır, kabul etmez.",
    category: "İman Hükümleri"
  },
  {
    id: 15,
    sual: "Tevbe-i yeis nedir?",
    cevap: "Îmânı ve ameli olan kimsenin ölürken günahlarından pişman olup tevbe etmesidir.",
    category: "Tevbe Hükümleri"
  },
  {
    id: 16,
    sual: "Allâhü Teâlâ bu tevbeyi kabul eder mi?",
    cevap: "Evet, kabul eder.",
    category: "Tevbe Hükümleri"
  },
  {
    id: 17,
    sual: "Dinin nedir?",
    cevap: "İslâm dinidir.",
    category: "Temel Dini Bilgiler"
  },
  {
    id: 18,
    sual: "Kitabın nedir?",
    cevap: "Kur'ân-ı Kerîm'dir.",
    category: "Temel Dini Bilgiler"
  },
  {
    id: 19,
    sual: "Kıblen neresidir?",
    cevap: "Kâbe-i Muazzama'dır.",
    category: "Temel Dini Bilgiler"
  },
  {
    id: 20,
    sual: "Kimin zürriyetindensin?",
    cevap: "Âdem Aleyhisselâm'ın zürriyetindenim.",
    category: "Peygamberler & Nesil"
  },
  {
    id: 21,
    sual: "Kimin milletindensin?",
    cevap: "İbrâhim Aleyhisselâm'ın milletindenim.",
    category: "Peygamberler & Nesil"
  },
  {
    id: 22,
    sual: "Kimin ümmetindensin?",
    cevap: "Muhammed Aleyhisselâm'ın ümmetindenim.",
    category: "Peygamberler & Nesil"
  },
  {
    id: 23,
    sual: "Peygamberimiz nerede doğdu ve şimdi nerede bulunuyor?",
    cevap: "Mekke'de doğdu. Elli yaşından sonra Medine'ye hicret etti. Şimdi Medîne'de \"Ravza-i Mutahhara\"sındadır.",
    category: "Siyer-i Nebî"
  },
  {
    id: 24,
    sual: "Peygamberimizin kaç adı vardır?",
    cevap: "Güzel isimleri çoktur. Fakat dördünü bilmek lâzımdır:\n• 1- Muhammed\n• 2- Mustafâ\n• 3- Ahmed\n• 4- Mahmûd",
    category: "Siyer-i Nebî"
  },
  {
    id: 25,
    sual: "Peygamberimizin en çok kullanılan ismi nedir?",
    cevap: "Hazret-i Muhammed Mustafâ sallallâhü aleyhi ve sellem'dir.",
    category: "Siyer-i Nebî"
  },
  {
    id: 26,
    sual: "Peygamberimizin babasının adı nedir?",
    cevap: "Hazret-i Abdullah'tır.",
    category: "Siyer-i Nebî"
  },
  {
    id: 27,
    sual: "Annesinin adı nedir?",
    cevap: "Hazret-i Âmine'dir.",
    category: "Siyer-i Nebî"
  },
  {
    id: 28,
    sual: "Süt annesinin adı nedir?",
    cevap: "Halîme Hâtun'dur.",
    category: "Siyer-i Nebî"
  },
  {
    id: 29,
    sual: "Ebesinin adı nedir?",
    cevap: "Şifâ Hâtun'dur.",
    category: "Siyer-i Nebî"
  },
  {
    id: 30,
    sual: "Dedesinin adı nedir?",
    cevap: "Abdülmuttalib'dir.",
    category: "Siyer-i Nebî"
  },
  {
    id: 31,
    sual: "Peygamberimiz kaç yaşında iken kendisine fiilen peygamberlik geldi?",
    cevap: "40 yaşında iken fiilen peygamberlik geldi.",
    category: "Peygamberlik Dönemi"
  },
  {
    id: 32,
    sual: "Fiilen kaç sene peygamberlik yaptı?",
    cevap: "23 sene peygamberlik yaptı.",
    category: "Peygamberlik Dönemi"
  },
  {
    id: 33,
    sual: "Fânî hayatı kaç yaşında sona erdi?",
    cevap: "63 yaşında sona erdi.",
    category: "Peygamberlik Dönemi"
  },
  {
    id: 34,
    sual: "Peygamberimizin kaç kızı vardı?",
    cevap: "Dört kızı vardı:\n1- Zeynep\n2- Rukiyye\n3- Ümmü Gülsûm\n4- Fâtıma (radıyallâhü anhünne) hazretleridir.",
    category: "Ehl-i Beyt & Evlatları"
  },
  {
    id: 35,
    sual: "Peygamberimizin kaç oğlu doğdu?",
    cevap: "Üç oğlu doğdu:\n1- Kâsım\n2- Abdullâh (diğer adı Tayyib)\n3- İbrâhîm (radıyallâhü anhüm) hazretleridir.",
    category: "Ehl-i Beyt & Evlatları"
  },
  {
    id: 36,
    sual: "Ezvâc-ı Tâhirât'ı yani Peygamberimizin mübârek hanımlarını sayar mısın?",
    cevap: "Sayarım:\n1- Hazret-i Hadîce (radıyallâhü anhâ)\n2- Hz. Sevde (radıyallâhü anhâ)\n3- Hz. Âişe (radıyallâhü anhâ)\n4- Hz. Hafsa (radıyallâhü anhâ)\n5- Hz. Zeynep binti Huzeyme (radıyallâhü anhâ)\n6- Hz. Ümmü Seleme (radıyallâhü anhâ)\n7- Hz. Zeynep binti Cahş (radıyallâhü anhâ)\n8- Hz. Cüveyriye (radıyallâhü anhâ)\n9- Hz. Ümmü Habîbe (radıyallâhü anhâ)\n10- Hz. Safiyye (radıyallâhü anhâ)\n11- Hz. Meymûne (radıyallâhü anhâ)\n12- Hz. Mâriye (radıyallâhü anhünne) vâlidelerimiz.\n\n📌 Not: Bunlardan Hz. Hadîce (radıyallâhü anhâ) vâlidemiz peygamberimizin ilk zevcesidir. Efendimizden 15 yaş büyük olup 25 sene beraber hayat sürmüştür.",
    category: "Ezvâc-ı Tâhirât"
  },
  {
    id: 37,
    sual: "Peygamberimizin 53 yaşından sonra çok evlenmesinin sebep ve hikmetlerinin bazılarını sayar mısın?",
    cevap: "Peygamberimiz:\n• Kabileleri İslâmiyet'e bağlamak,\n• Kadınlara ait dinî hükümleri kadınlar vasıtasıyla yaymak,\n• Bazılarını sefâletten kurtarmak,\n• Bazılarının ise iffet ve namuslarını korumak için onlarla evlenmiştir.\n\nAsıl hikmet ve gaye kadınlar vasıtasıyla İslâm'ı yaymaktır.",
    category: "Siyer Hikmetleri"
  },
  {
    id: 38,
    sual: "Peygamberimizin en son vefât eden eşi kimdir?",
    cevap: "Hz. Ümmü Seleme (radıyallâhü anhâ)'dir.",
    category: "Ezvâc-ı Tâhirât"
  },
  {
    id: 39,
    sual: "Gelmiş ve gelecek insanların en yücesi kimdir?",
    cevap: "Peygamberimiz Muhammed Mustafâ Sallallâhü aleyhi ve sellem'dir.",
    category: "Peygamberimizin Fazileti"
  },
  {
    id: 40,
    sual: "Peygamber Efendimizin en faziletli torunları kimlerdir?",
    cevap: "Hasan ve Hüseyin (radıyallâhü anhümâ) hazretleridir.",
    category: "Ehl-i Beyt"
  },
  {
    id: 41,
    sual: "Bunlar kimin çocuklarıdır?",
    cevap: "Hz. Ali ve Hz. Fâtıma (radıyallâhü anhümâ)'nındır.",
    category: "Ehl-i Beyt"
  },
  {
    id: 42,
    sual: "Peygamber kime denir?",
    cevap: "Ahkâm-ı İlâhiye'yi insanlara tebliğ için Allâh'ın vazifelendirdiği zâta denir.",
    category: "Nübüvvet Bilgisi"
  },
  {
    id: 43,
    sual: "Allâh tarafından mahlûkâta gönderilen peygamberlerin sayısı kaçtır?",
    cevap: "Peygamberimizden yapılan bir rivâyete göre yüz yirmi dört bin (124.000), diğer bir rivâyete göre iki yüz yirmi dört bindir (224.000).",
    category: "Nübüvvet Bilgisi"
  },
  {
    id: 44,
    sual: "Ehl-i sünnetin amelde mezhebi kaçtır?",
    cevap: "Dörttür.",
    category: "Mezhepler Tarihi"
  },
  {
    id: 45,
    sual: "Nelerdir?",
    cevap: "1- Hanefî\n2- Şâfiî\n3- Mâlikî\n4- Hanbelî mezhepleridir.",
    category: "Mezhepler Tarihi"
  },
  {
    id: 46,
    sual: "Îtikatta mezhebin nedir?",
    cevap: "Ehl-i sünnet ve cemaat mezhebidir.",
    category: "İtikat Esasları"
  },
  {
    id: 47,
    sual: "Amelde mezhebin nedir ve imâmı kimdir?",
    cevap: "Hanefî mezhebidir ve imâmı İmâm-ı Âzam Hazretleridir.",
    category: "Mezhepler ve İmamlar"
  },
  {
    id: 48,
    sual: "Bizim itikatta mezhebimizin imâmı kimdir?",
    cevap: "İmam Ebû Mansûr Muhammed Mâtürîdî rahimehüllâh Hazretleridir.",
    category: "Mezhepler ve İmamlar"
  },
  {
    id: 49,
    sual: "Şâfiî, Mâlikî ve Hanbelî mezhebine mensup olanların îtikatta imamları kimdir?",
    cevap: "Ebü'l-Haseni'l-Eş'arî rahimehüllâh Hazretleridir.",
    category: "Mezhepler ve İmamlar"
  },
  {
    id: 50,
    sual: "İmam Ebu Mansur Muhammed Mâtürîdî nerelidir?",
    cevap: "Semerkand'ın Mâtürid köyündendir.",
    category: "İslam Âlimleri"
  },
  {
    id: 51,
    sual: "İmam Mâtürîdî ne zaman vefat etmiştir?",
    cevap: "Hicrî 333 tarihinde vefat etmiştir.",
    category: "İslam Âlimleri"
  },
  {
    id: 52,
    sual: "Ebu'l-Haseni'l-Eş'arî Hazretleri nerelidir? Ne zaman vefât etmiştir?",
    cevap: "Basralı olup Hicrî 324 tarihinde vefat etmiştir.",
    category: "İslam Âlimleri"
  },
  {
    id: 53,
    sual: "Namazın kazâya kalmasına meşrû sebep kaçtır?",
    cevap: "Üçtür.",
    category: "Namaz Hükümleri"
  },
  {
    id: 54,
    sual: "Sayar mısınız?",
    cevap: "Sayarım:\n1- Uyku\n2- Muharebe esnasında düşmandan hiç fırsat bulamamak\n3- Unutmak.",
    category: "Namaz Hükümleri"
  },
  {
    id: 55,
    sual: "Otuz iki farzı sayar mısınız?",
    cevap: "Sayarım:\n• 6 İmanın şartı\n• 5 İslâm'ın şartı\n• 4 Abdestin farzı\n• 3 Guslün farzı\n• 2 Teyemmümün farzı\n• 12 Namazın farzı\n\nTamamı 32 farz eder.",
    category: "32 Farz"
  },
  {
    id: 56,
    sual: "İmanın şartları nelerdir?",
    cevap: "1- Allâh'ın varlığına ve birliğine inanmak\n2- Meleklerine inanmak\n3- Kitaplarına inanmak\n4- Peygamberlerine inanmak\n5- Âhiret gününe inanmak\n6- Kadere; hayır ve şerrin yaratıcısının Allâh olduğuna inanmaktır.",
    category: "İmanın Şartları"
  },
  {
    id: 57,
    sual: "İslâm'ın şartı kaçtır?",
    cevap: "Beştir:\n1- Kelime-i Şehadet getirmek\n2- Namaz kılmak\n3- Zekât vermek\n4- Oruç tutmak\n5- Hacca gitmek.",
    category: "İslam'ın Şartları"
  },
  {
    id: 58,
    sual: "Abdestin farzı kaçtır?",
    cevap: "Dörttür:\n1- Yüzünü saç bitiminden kulak yumuşağına ve çene altına kadar yıkamak,\n2- Ellerini dirsekleriyle beraber yıkamak,\n3- Başının dörtte birini meshetmek,\n4- Ayaklarını (topuklarıyla beraber) yıkamak.",
    category: "Abdestin Farzları"
  },
  {
    id: 59,
    sual: "Guslün farzı kaçtır?",
    cevap: "Üçtür:\n1- Bol su ile ağzı yıkamak (mazmaza),\n2- Bol su ile burnu yıkamak (istinşak),\n3- Hiç kuru yer kalmamak şartı ile bütün vücûdu yıkamak.",
    category: "Guslün Farzları"
  },
  {
    id: 60,
    sual: "Gusül abdestini tarif eder misin?",
    cevap: "Ederim:\n• Önce gizlice besmele çeker niyet ederim.\n• Avret mahallini yıkarım.\n• Namaz abdesti gibi abdest alırım.\n• Bu arada 3 defa ağzıma dolu dolu su alırım, 3 defa burnuma iyice su veririm.\n• Sonra 3 defa başımdan aşağı su dökerim.\n• 3 defa sağ, 3 defa sol omuzuma su döker, her defasında bütün vücudumu hiç kuru yer kalmayıncaya kadar ovalarım.\n• Yüzük altı ve göbek kıvrığını ıslatırım.\n• Suyun deriye geçmesine mani olacak şey varsa giderir ve orayı da ıslatırım.\n• (Kadınlar küpe deliklerini de ıslatırlar.)",
    category: "Gusül Rehberi"
  },
  {
    id: 61,
    sual: "Teyemmümün farzı kaçtır?",
    cevap: "İkidir:\n1- Niyet (Teyemmüme niyet etmek),\n2- Ellerini iki defa toprağa vurup birincide yüzünü, ikincide kollarını mesh etmek (silmek).",
    category: "Teyemmüm Farzları"
  },
  {
    id: 62,
    sual: "Teyemmüm nasıl yapılır?",
    cevap: "• Teyemmüm etmeye niyet ederim.\n• Ellerimi temiz toprağa vurur yüzümü mesh ederim.\n• Ellerimi temiz toprağa tekrar vurur; sağ kolumu sol elle, sol kolumu sağ elle mesh ederim.",
    category: "Teyemmüm Rehberi"
  },
  {
    id: 63,
    sual: "Namazın farzı kaçtır?",
    cevap: "Altısı içinde, altısı dışında olmak üzere 12'dir.",
    category: "Namazın Farzları"
  },
  {
    id: 64,
    sual: "Dışındakiler nelerdir?",
    cevap: "Dışındaki Şartlar (6):\n1- Hadesten tahâret\n2- Necâsetten tahâret\n3- Setr-i avret\n4- İstikbâl-i kıble\n5- Vakit\n6- Niyet.",
    category: "Namazın Şartları (Dışındakiler)"
  },
  {
    id: 65,
    sual: "İçindekiler nelerdir?",
    cevap: "İçindeki Rükünler (6):\n1- İftitâh tekbîri\n2- Kıyâm\n3- Kırâat\n4- Rükû\n5- Secde\n6- Kâde-i ahîrede teşehhüd miktarı oturmak.",
    category: "Namazın Rükünleri (İçindekiler)"
  },
  {
    id: 66,
    sual: "Bir günde kaç vakit namaz kılınır?",
    cevap: "Sabah, öğle, ikindi, akşam, yatsı olmak üzere beş vakit namaz kılınır.",
    category: "Namaz Vakitleri"
  },
  {
    id: 67,
    sual: "Bu vakitler kaç rek'attir?",
    cevap: "• Sabah Namazı (4 Rek'at):\n  2 sünnet, 2 farz. (Önce sünnet, sonra farz kılınır.)\n\n• Öğle Namazı (10 Rek'at):\n  4 ilk sünnet, 4 farz, 2 son sünnet. (Önce ilk sünnet, sonra farz, sonra son sünnet kılınır.)\n\n• İkindi Namazı (8 Rek'at):\n  4 sünnet, 4 farz. (Önce sünnet, sonra farz kılınır.)\n\n• Akşam Namazı (5 Rek'at):\n  3 farz, 2 sünnet. (Önce farz, sonra sünnet kılınır.)\n\n• Yatsı Namazı (13 Rek'at):\n  4 ilk sünnet, 4 farz, 2 son sünnet, 3 vitir vâcip. (Önce ilk sünnet, sonra farz, sonra son sünnet, en sonra da vitir vâcip kılınır.)\n\n📌 Cem'an günde 40 rek'at namaz kılınır.",
    category: "Namaz Rek'atleri"
  },
  {
    id: 68,
    sual: "Namazda zammı sûreyi unuttuğun zaman ne lazım gelir?",
    cevap: "Sehiv secdesi yapmak lazım gelir.",
    category: "Sehiv Secdesi"
  },
  {
    id: 69,
    sual: "Sehiv secdesi kaç yerde yapılır?",
    cevap: "Vâcibin terkinde ve geciktirilmesinde, farzın yalnız geciktirilmesinde yapılır.",
    category: "Sehiv Secdesi"
  },
  {
    id: 70,
    sual: "Sehiv secdesi yapılmasa ne olur?",
    cevap: "Namaz noksan olmuş olur.",
    category: "Sehiv Secdesi"
  },
  {
    id: 71,
    sual: "Sehiv secdesi nasıl yapılır?",
    cevap: "Namazda son olarak oturduğumuz zaman Tahiyyât okuyup bir veya iki tarafa selâm verdikten sonra iki defa secdeye gidilir. İkinci secdeden sonra oturulur; Tahiyyât, Salli, Bârik ve Rabbenâ duaları sonuna kadar okunup selâm verilir.",
    category: "Sehiv Secdesi"
  },
  {
    id: 72,
    sual: "Sehiv secdesi icabeden birkaç yer sayar mısın?",
    cevap: "Sayarım:\n1- Zammı sûreyi unuttuğum zaman,\n2- Vitir namazında Kunut tekbîrini, Kunut duâlarını veya her ikisini unuttuğum zaman,\n3- Dört rek'atli namazlarda ilk oturmada Tahiyyât okunduktan sonra hemen kalkmayı unutup Salli-Bârik'ten en az \"Allâhümme salli alâ Muhammedin\" kısmını okuyup üçüncü rek'ata geç kaldığım zaman sehiv secdesi yaparım.",
    category: "Sehiv Secdesi Halleri"
  },
  {
    id: 73,
    sual: "İbâdetle tâatla ihya etmeye bilhassa kıymet verdiğimiz gecelere ne denir?",
    cevap: "Kandil Geceleri denir.",
    category: "Kandil Geceleri"
  },
  {
    id: 74,
    sual: "Kaç kandil vardır?",
    cevap: "Beş kandil vardır:\n1- Mevlid kandili\n2- Regâib kandili\n3- Mi'râc kandili\n4- Berât kandili\n5- Kadir gecesi.",
    category: "Kandil Geceleri"
  },
  {
    id: 75,
    sual: "Mevlid kandili nedir?",
    cevap: "Peygamberimizin dünyaya geldiği gecedir.",
    category: "Kandillerin Anlamı"
  },
  {
    id: 76,
    sual: "Regâib kandili neye denir?",
    cevap: "Hazret-i Âmine'nin yüce Peygamberimize hâmile olduğunu anladığı gecedir.",
    category: "Kandillerin Anlamı"
  },
  {
    id: 77,
    sual: "Mi'rac kandili nedir?",
    cevap: "Peygamberimizin, ilâhî saltanatı seyretmek üzere Allâh'ın dâveti ve gücü ile eşsiz bir mûcize olarak göklere ve daha nice âlemlere seyâhat ettiği gecedir.",
    category: "Kandillerin Anlamı"
  },
  {
    id: 78,
    sual: "Berât kandili nedir?",
    cevap: "Kur'ân-ı Kerîm'in levh-i mahfuzdan dünya semâsına indirildiği, insanların bir senelik hayat ve rızıklarının takdir edildiği, müslümanların af ve lütuflara nâil olduğu gecedir.",
    category: "Kandillerin Anlamı"
  },
  {
    id: 79,
    sual: "Kadir gecesi nedir?",
    cevap: "Kur'ân-ı Kerîm'in dünya semâsından Peygamberimize indirilmeye başlandığı gecedir.",
    category: "Kandillerin Anlamı"
  }
];
