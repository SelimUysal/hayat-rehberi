export interface DailyHadisItem {
  id: number;
  arapcaMetin: string;
  okunusu: string;
  meali: string;
  kaynagi: string;
  kategori?: string;
  hikmeti?: string;
}

export interface DailyAyetItem {
  id: number;
  sureAdi: string;
  ayetNo: string;
  meal: string;
}

export interface DailySiirItem {
  id: number;
  baslik?: string;
  siir: string;
  muellif: string;
}

// hadis-data.json formatıyla birebir uyumlu başlangıç/fallback örnek hadis havuzu
export const SAMPLE_HADIS_POOL: DailyHadisItem[] = [
  {
    id: 1,
    arapcaMetin: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    okunusu: "İnneme'l-a'mâlü bi'n-niyyât, ve innemâ likülli'mriin mâ nevâ.",
    meali: "Ameller niyetlere göredir. Herkese ancak niyet ettiği şey vardır.",
    kaynagi: "Buhârî, Bed'ü'l-Vahy 1; Müslim, İmâre 155 — Hz. Ömer (r.a.)",
    kategori: "İhlas & Niyet",
    hikmeti: "İslam'ın temel direklerinden biri olan bu hadis-i şerif, ibadet ve davranışların Allah katındaki değerinin kalpteki samimi niyete bağlı olduğunu bildirir."
  },
  {
    id: 2,
    arapcaMetin: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    okunusu: "Hayruküm men te'alleme'l-Kur'âne ve 'allemehû.",
    meali: "Sizin en hayırlınız, Kur'ân'ı öğrenen ve öğreteninizdir.",
    kaynagi: "Buhârî, Fedâilü'l-Kur'ân 21; Tirmizî, Fedâilü'l-Kur'ân 15 — Hz. Osman (r.a.)",
    kategori: "İlim",
    hikmeti: "Kur'an-ı Kerim ile hemhal olmanın, onu hem öğrenip hem de başkalarına aktarmanın mümini insanların en hayırlısı derecesine yükselttiğini müjdeler."
  },
  {
    id: 3,
    arapcaMetin: "الدِّينُ النَّصِيحَةُ",
    okunusu: "Ed-dînü'n-nasîhah.",
    meali: "Din samimiyettir (Allah'a, Kitabına, Peygamberine ve bütün Müslümanlara karşı ihlaslı ve hayırhah olmaktır).",
    kaynagi: "Müslim, Îmân 95; Ebû Dâvûd, Edeb 59 — Hz. Temîm ed-Dârî (r.a.)",
    kategori: "İhlas & Niyet",
    hikmeti: "Dindarlığın özünün gösterişten uzak, katışıksız samimiyet ve müminlerin iyiliğini istemek olduğunu veciz biçimde özetler."
  },
  {
    id: 4,
    arapcaMetin: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    okunusu: "Lâ yü'minü ehadüküm hattâ yuhibbe li-ehîhi mâ yuhibbü li-nefsihî.",
    meali: "Sizden biriniz, kendisi için istediğini (mümin) kardeşi için de istemedikçe (kâmil manada) iman etmiş olmaz.",
    kaynagi: "Buhârî, Îmân 7; Müslim, Îmân 71 — Hz. Enes bin Mâlik (r.a.)",
    kategori: "Ahlak",
    hikmeti: "İslam kardeşliğinin ve empati ahlakının ölçüsünü koyar; bencilliği terk edip kardeşinin hayrını kendi hayrı gibi görmeyi imanın kemaline bağlar."
  },
  {
    id: 5,
    arapcaMetin: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
    okunusu: "El-müslimü men selime'l-müslimûne min lisânihî ve yedihî.",
    meali: "Müslüman, diğer Müslümanların elinden ve dilinden güvende olduğu kimsedir.",
    kaynagi: "Buhârî, Îmân 4; Müslim, Îmân 64 — Hz. Abdullah bin Amr (r.a.)",
    kategori: "Ahlak",
    hikmeti: "Kâmil müminin çevresine güven veren, diliyle incitmeyen ve eliyle kimseye zarar vermeyen bir emniyet insanı olduğunu vurgular."
  }
];

// 5 Adet Örnek Kur'an-ı Kerim Meali Verisi (JSON formatında)
export const SAMPLE_AYET_POOL: DailyAyetItem[] = [
  {
    id: 1,
    sureAdi: "Bakara Suresi",
    ayetNo: "255. Ayet (Âyetü'l-Kürsî)",
    meal: "Allah, O'ndan başka ilah yoktur; diridir, her şeyin varlığı O'na bağlı ve dayalıdır. Ne uykusu gelir ne de uyur. Göklerde ve yerde ne varsa hepsi O'nundur. O'nun izni olmadıkça katında hiçbir kimse şefaat edemez. Onların önlerinde ve arkalarında olanları O bilir. O'nun ilminden hiçbir şeyi -dilediği müstesna- kimse bilgisi içine sığdıramaz. O'nun kürsüsü gökleri ve yeri içine almıştır. Onları korumak kendisine zor gelmez. O yücedir, mutlak büyüktür."
  },
  {
    id: 2,
    sureAdi: "İnşirah Suresi",
    ayetNo: "5 - 6. Ayetler",
    meal: "Şüphesiz güçlükle beraber bir kolaylık vardır. Gerçekten, güçlükle beraber bir kolaylık vardır."
  },
  {
    id: 3,
    sureAdi: "Zümer Suresi",
    ayetNo: "53. Ayet",
    meal: "De ki: Ey kendi nefisleri aleyhine haddi aşan kullarım! Allah'ın rahmetinden ümidinizi kesmeyin. Şüphesiz Allah bütün günahları affeder. Çünkü O, çok bağışlayandır, çok merhamet edendir."
  },
  {
    id: 4,
    sureAdi: "Ra'd Suresi",
    ayetNo: "28. Ayet",
    meal: "Bunlar, iman edenler ve gönülleri Allah'ın zikriyle sükûnete erenlerdir. Bilesiniz ki, kalpler ancak Allah'ı anmakla huzur bulur."
  },
  {
    id: 5,
    sureAdi: "Asr Suresi",
    ayetNo: "1 - 3. Ayetler",
    meal: "Asra yemin olsun ki, insan gerçekten ziyan içindedir. Bundan ancak iman edip salih ameller işleyenler, birbirlerine hakkı tavsiye edenler ve sabrı tavsiye edenler müstesnadır."
  }
];

// 5 Adet Örnek Şiir Verisi (JSON formatında)
export const SAMPLE_SIIR_POOL: DailySiirItem[] = [
  {
    id: 1,
    baslik: "Sefere Baştan Başla",
    siir: "Madem ölüme kadar,\nVerilmiş bir mühlet var !..\nDonanıp tekrar aşkla,\nSefere baştan başla !..\nSilkinip fırlasana,\nZaman dar yapışsana,\nTekrar yüce Kur'an'a !..\nTekrar yüce Kur'an'a !..",
    muellif: "Kadir Mısıroğlu"
  },
  {
    id: 2,
    baslik: "Zindandan Mehmed'e Mektup",
    siir: "Mehmed'im, sevinin, başlar yüksekte!\nÖlsek de sevinin, eve dönsek de!\nSanma bu tekerlek kalır tümsekte!\nYarın, elbet bizim, elbet bizimdir!\nGün doğmuş, gün batmış, ebed bizimdir!",
    muellif: "Necip Fazıl Kısakürek"
  },
  {
    id: 3,
    baslik: "İstiklâl Marşı'ndan",
    siir: "Ruhumun senden, İlâhî, şudur ancak emeli:\nDeğmesin mabedimin göğsüne nâmahrem eli;\nBu ezanlar -ki şehâdetleri dinin temeli-\nEbedî yurdumun üstünde benim inlemeli.",
    muellif: "Mehmet Âkif Ersoy"
  },
  {
    id: 4,
    baslik: "Sürgün Ülkeden Başkentler Başkentine",
    siir: "Senin kalbinden sürgün oldum ilkin\nBütün sürgünlüklerim bir bakıma bu sürgünün bir süreği\nBütün törenlerin, şölenlerin, ayinlerin, yortuların dışında\nSana geldim, ayaklarına kapanmaya geldim\nAf dilemeye geldim affa layık olmasam da\nUzatma dünya sürgünümü benim.",
    muellif: "Sezai Karakoç"
  },
  {
    id: 5,
    baslik: "Sordum Sarı Çiçeğe",
    siir: "Sordum sarı çiçeğe:\nAnnen baban var mıdır?\nÇiçek eydür derviş baba:\nAnnem babam topraktır.\n\nYunus bu sözü der içer,\nGözü yaşı hadden geçer,\nBülbül olup dosta uçar,\nMenzili bir yapraktır.",
    muellif: "Yunus Emre"
  }
];

/**
 * Kesintisiz Günlük Rotasyon Hesaplayıcı:
 * - Sabit bir referans tarihten (Epoch) itibaren geçen toplam gün sayısını baz alır.
 * - Her gün sıradaki içeriğe geçer, liste sonuna geldiğinde (modulo) tekrar baştan başlar.
 * - Yıl kaydırması sayesinde havuz boyutu 365'in tam böleni (örn. 5) olsa bile
 *   farklı yıllarda aynı takvim gününde aynı içerik tekrar etmez.
 */
export function getRotatingContentForDate<T>(
  pool: T[],
  date: Date,
  manualOffset = 0
): { item: T; index: number; total: number } {
  const total = pool.length;
  if (total === 0) {
    throw new Error('İçerik havuzu boş olamaz');
  }

  const utcTarget = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const utcReference = Date.UTC(2026, 8, 30); // 30 Eylül 2026 başlangıç referansı (0. indeks)
  const diffDays = Math.round((utcTarget - utcReference) / 86400000);

  // Yıl farkı kaydırması: 365 % 5 === 0 olduğu durumlarda bile her yıl aynı günde farklı veri gelmesini sağlar
  const yearShift = date.getFullYear() - 2026;
  const rawIndex = diffDays + yearShift + manualOffset;
  const normalizedIndex = ((rawIndex % total) + total) % total;

  return {
    item: pool[normalizedIndex],
    index: normalizedIndex,
    total
  };
}
