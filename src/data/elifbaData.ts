export interface ElifbaWordSample {
  ar: string;
  read: string;
  mean: string;
}

export interface ElifbaLetter {
  name: string;
  ar: string;
  desc: string;
  consonant: string;
  nonConnecting?: boolean;
  words: ElifbaWordSample[];
}

export interface BankWord {
  ar: string;
  rd: string;
  mean: string;
  lvl: 'kolay' | 'orta' | 'zor';
}

export interface SifatItem {
  ar: string;
  okunus: string;
  anlam: string;
}

export interface TemelDuaZikirSubItem {
  ar: string;
  count?: string;
  okunus: string;
  anlam: string;
  aciklama: string;
}

export interface TemelDuaItem {
  title: string;
  arabic: string[];
  okunus: string;
  anlam: string;
  note?: string;
  details?: string[];
  bullets?: { title: string; text: string }[];
  zikirList?: TemelDuaZikirSubItem[];
  hasAudioPlayer?: boolean;
  audioUrl?: string;
}

export const KALIN = new Set<string>([
  'Ha (ح)',
  'Hı',
  'Sad',
  'Dad',
  'Tı',
  'Zı',
  'Gayn',
  'Kaf'
]);

export const LETTERS: ElifbaLetter[] = [
  {
    name: 'Elif',
    ar: 'ا',
    desc: 'Boğazın en alt kısmından çıkar. Hareke aldığında hemze gibi seslendirilir, harekesiz olduğunda ise kendinden önceki üstünlü harfi uzatan med harfidir.',
    consonant: '',
    nonConnecting: true,
    words: [
      { ar: 'أَبٌ', read: 'Ebün', mean: 'Baba' },
      { ar: 'أُمٌّ', read: 'Ümmün', mean: 'Anne' },
      { ar: 'أَمَرَ', read: 'Emera', mean: 'Emretti' }
    ]
  },
  {
    name: 'Be',
    ar: 'ب',
    desc: 'Dudakların birbirine temas etmesiyle çıkan ince bir dudak harfidir. Cezimli olduğunda kalkale (yankılı vuruş) sıfatı taşır.',
    consonant: 'b',
    words: [
      { ar: 'بَابٌ', read: 'Bâbün', mean: 'Kapı' },
      { ar: 'كَتَبَ', read: 'Ketebe', mean: 'Yazdı' },
      { ar: 'كِتَابٌ', read: 'Kitâbün', mean: 'Kitap' }
    ]
  },
  {
    name: 'Te',
    ar: 'ت',
    desc: 'Dil ucunun üst ön dişlerin köküne değmesiyle çıkan ince ve yumuşak bir harftir.',
    consonant: 't',
    words: [
      { ar: 'تَابَ', read: 'Tâbe', mean: 'Tövbe etti' },
      { ar: 'تِينٌ', read: 'Tînün', mean: 'İncir' },
      { ar: 'بَيْتٌ', read: 'Beytün', mean: 'Ev, Beytullah' }
    ]
  },
  {
    name: 'Se',
    ar: 'ث',
    desc: 'Dil ucunun üst ön dişlerin uç kısmına hafifçe değmesiyle peltek ve ince olarak okunur.',
    consonant: 's',
    words: [
      { ar: 'ثَبَتَ', read: 'Sebete', mean: 'Sabit oldu' },
      { ar: 'ثَوَابٌ', read: 'Sevâbün', mean: 'Sevap, mükâfat' },
      { ar: 'كَثِيرٌ', read: 'Kesîrun', mean: 'Çok' }
    ]
  },
  {
    name: 'Cim',
    ar: 'ج',
    desc: 'Dil ortasının üst damağa temas etmesiyle çıkan ince bir harftir. Sâkin olduğunda kalkale yapılır.',
    consonant: 'c',
    words: [
      { ar: 'جَبَلٌ', read: 'Cebelün', mean: 'Dağ' },
      { ar: 'سَجَدَ', read: 'Secede', mean: 'Secde etti' },
      { ar: 'مَسْجِدٌ', read: 'Mescidün', mean: 'Mescid' }
    ]
  },
  {
    name: 'Ha (ح)',
    ar: 'ح',
    desc: 'Boğazın tam ortasından hafifçe sıkılarak ve temiz bir nefesle çıkarılan boğaz harfidir.',
    consonant: 'h',
    words: [
      { ar: 'حَمِدَ', read: 'Hamide', mean: 'Hamd etti' },
      { ar: 'رَحِمَ', read: 'Rahime', mean: 'Merhamet etti' },
      { ar: 'حَقٌّ', read: 'Hakkun', mean: 'Hak, gerçek' }
    ]
  },
  {
    name: 'Hı',
    ar: 'خ',
    desc: 'Boğazın üst kısmından hırıltılı ve kalın olarak çıkarılan bir boğaz harfidir.',
    consonant: 'h',
    words: [
      { ar: 'خَلَقَ', read: 'Haleka', mean: 'Yarattı' },
      { ar: 'خَيْرٌ', read: 'Hayrun', mean: 'Hayır, iyilik' },
      { ar: 'دَخَلَ', read: 'Dehale', mean: 'Girdi' }
    ]
  },
  {
    name: 'Dal',
    ar: 'د',
    desc: 'Dil ucunun üst ön dişlerin köküne vurmasıyla çıkan ince bir harftir. Kendinden sonraki harfle birleşmez ve kalkale harfidir.',
    consonant: 'd',
    nonConnecting: true,
    words: [
      { ar: 'دِينٌ', read: 'Dînün', mean: 'Din, İslâm' },
      { ar: 'حَمْدٌ', read: 'Hamdün', mean: 'Övgü, şükür' },
      { ar: 'أَحَدٌ', read: 'Ehadün', mean: 'Bir, tek' }
    ]
  },
  {
    name: 'Zel',
    ar: 'ذ',
    desc: 'Dil ucunun üst ön dişlerin ucuna değmesiyle peltek ve ince okunur. Kendinden sonraki harfle birleşmez.',
    consonant: 'z',
    nonConnecting: true,
    words: [
      { ar: 'ذَكَرَ', read: 'Zekera', mean: 'Zikretti, andı' },
      { ar: 'ذَهَبَ', read: 'Zehebe', mean: 'Gitti' },
      { ar: 'كِذْبٌ', read: 'Kizbün', mean: 'Yalan' }
    ]
  },
  {
    name: 'Ra',
    ar: 'ر',
    desc: 'Dil ucunun üst damağın ön kısmına yaklaşmasıyla çıkar. Üstün ve ötrede kalın, esrede ince okunur. Sonraki harfle birleşmez.',
    consonant: 'r',
    nonConnecting: true,
    words: [
      { ar: 'رَبٌّ', read: 'Rabbün', mean: 'Rab, terbiye eden' },
      { ar: 'رَحْمَةٌ', read: 'Rahmetün', mean: 'Rahmet, şefkat' },
      { ar: 'نُورٌ', read: 'Nûrun', mean: 'Nur, aydınlık' }
    ]
  },
  {
    name: 'Ze',
    ar: 'ز',
    desc: 'Dil ucu ve dişlerin arasından keskin ve ince bir ıslık sesiyle çıkar. Sonraki harfle birleşmez.',
    consonant: 'z',
    nonConnecting: true,
    words: [
      { ar: 'زَرَعَ', read: 'Zera\'a', mean: 'Ekti' },
      { ar: 'رِزْقٌ', read: 'Rızkun', mean: 'Rızık, nimet' },
      { ar: 'عَزِيزٌ', read: 'Azîzün', mean: 'Aziz, izzet sahibi' }
    ]
  },
  {
    name: 'Sin',
    ar: 'س',
    desc: 'Dil ucunun alt ön dişlere yaklaşmasıyla keskin, ince ve pelteksiz olarak okunur.',
    consonant: 's',
    words: [
      { ar: 'سَلَامٌ', read: 'Selâmün', mean: 'Selâm, esenlik' },
      { ar: 'سَمِعَ', read: 'Semi\'a', mean: 'İşitti' },
      { ar: 'شَمْسٌ', read: 'Şemsün', mean: 'Güneş' }
    ]
  },
  {
    name: 'Şın',
    ar: 'ش',
    desc: 'Dil ortasından nefesin ağız içinde yayılmasıyla Türkçedeki "ş" gibi ince okunur.',
    consonant: 'ş',
    words: [
      { ar: 'شَكَرَ', read: 'Şekera', mean: 'Şükretti' },
      { ar: 'شَهِدَ', read: 'Şehide', mean: 'Şahitlik etti' },
      { ar: 'عَرْشٌ', read: 'Arşun', mean: 'Arş' }
    ]
  },
  {
    name: 'Sad',
    ar: 'ص',
    desc: 'Dil ucu ve alt ön dişlerden çıkan, dil kökünün damağa kalkmasıyla tok ve kalın okunan bir harftir.',
    consonant: 's',
    words: [
      { ar: 'صَبَرَ', read: 'Sabera', mean: 'Sabretti' },
      { ar: 'صِدْقٌ', read: 'Sıdkun', mean: 'Doğruluk' },
      { ar: 'صِرَاطٌ', read: 'Sırâtun', mean: 'Yol' }
    ]
  },
  {
    name: 'Dad',
    ar: 'ض',
    desc: 'Dil yan kenarının üst azı dişlerine temas etmesiyle kalın ve dolgun okunan, Arapçaya mahsus müstesna bir harftir.',
    consonant: 'd',
    words: [
      { ar: 'ضَرَبَ', read: 'Darabe', mean: 'Misal verdi, vurdu' },
      { ar: 'أَرْضٌ', read: 'Ardun', mean: 'Yeryüzü' },
      { ar: 'فَضْلٌ', read: 'Fadlun', mean: 'Lütuf, ihsan' }
    ]
  },
  {
    name: 'Tı',
    ar: 'ط',
    desc: 'Dil ucunun üst diş etlerine temas etmesiyle en kalın ve tok okunan harflerden biridir. Cezimli olduğunda kalkale yapılır.',
    consonant: 't',
    words: [
      { ar: 'طَهُرَ', read: 'Tahura', mean: 'Temiz oldu' },
      { ar: 'طَيِّبٌ', read: 'Tayyibün', mean: 'Temiz, helâl' },
      { ar: 'صِرَاطٌ', read: 'Sırâtun', mean: 'Dosdoğru yol' }
    ]
  },
  {
    name: 'Zı',
    ar: 'ظ',
    desc: 'Dil ucunun üst ön dişlerin ucuna değmesiyle hem peltek hem de kalın olarak okunur.',
    consonant: 'z',
    words: [
      { ar: 'ظَلَمَ', read: 'Zaleme', mean: 'Zulmetti' },
      { ar: 'حَفِظَ', read: 'Hafiza', mean: 'Korudu, ezberledi' },
      { ar: 'عَظِيمٌ', read: 'Azîmün', mean: 'Pek yüce' }
    ]
  },
  {
    name: 'Ayn',
    ar: 'ع',
    desc: 'Boğazın ortasının hafifçe sıkılmasıyla derin ve çatlatılmadan çıkarılan boğaz harfidir.',
    consonant: '\'',
    words: [
      { ar: 'عَلِمَ', read: 'Alime', mean: 'Bildi' },
      { ar: 'عَمِلَ', read: 'Amile', mean: 'Amel işledi' },
      { ar: 'عَبْدٌ', read: 'Abdün', mean: 'Kul' }
    ]
  },
  {
    name: 'Gayn',
    ar: 'غ',
    desc: 'Boğazın üst kısmından kalın ve yumuşak bir "ğ/g" tınısıyla çıkarılan boğaz harfidir.',
    consonant: 'g',
    words: [
      { ar: 'غَفَرَ', read: 'Gafera', mean: 'Bağışladı' },
      { ar: 'غَفُورٌ', read: 'Gafûrun', mean: 'Çok bağışlayan' },
      { ar: 'بَلَغَ', read: 'Beleğa', mean: 'Ulaştı' }
    ]
  },
  {
    name: 'Fe',
    ar: 'ف',
    desc: 'Üst ön dişlerin alt dudağın iç kısmına değmesiyle ince olarak çıkarılan dudak harfidir.',
    consonant: 'f',
    words: [
      { ar: 'فَتَحَ', read: 'Feteha', mean: 'Açtı, fethetti' },
      { ar: 'فَلَقٌ', read: 'Felakun', mean: 'Sabah aydınlığı' },
      { ar: 'نَفْسٌ', read: 'Nefsün', mean: 'Can, nefis' }
    ]
  },
  {
    name: 'Kaf',
    ar: 'ق',
    desc: 'Dil kökünün üst damağın gerisine vurmasıyla kalın ve tok okunan harftir. Cezimli olduğunda kuvvetli kalkale yapılır.',
    consonant: 'k',
    words: [
      { ar: 'قَرَأَ', read: 'Kara\'e', mean: 'Okudu' },
      { ar: 'قَلْبٌ', read: 'Kalbün', mean: 'Kalp, gönül' },
      { ar: 'قَمَرٌ', read: 'Kamerun', mean: 'Ay' }
    ]
  },
  {
    name: 'Kef',
    ar: 'ك',
    desc: 'Kaf harfinin biraz daha önünden, ince ve hafif nefesli olarak Türkçedeki ince "k" gibi okunur.',
    consonant: 'k',
    words: [
      { ar: 'كَتَبَ', read: 'Ketebe', mean: 'Yazdı' },
      { ar: 'كَرِيمٌ', read: 'Kerîmün', mean: 'Cömert, kerem sahibi' },
      { ar: 'مَلِكٌ', read: 'Melikün', mean: 'Hükümdar' }
    ]
  },
  {
    name: 'Lam',
    ar: 'ل',
    desc: 'Dil ucunun üst damağa değmesiyle ince okunur; yalnız Lafzatullah (Allah) kelimesinde öncesi üstün/ötre ise kalın okunur.',
    consonant: 'l',
    words: [
      { ar: 'لَيْلٌ', read: 'Leylün', mean: 'Gece' },
      { ar: 'عِلْمٌ', read: 'İlmün', mean: 'İlim, bilgi' },
      { ar: 'قَوْلٌ', read: 'Kavlün', mean: 'Söz' }
    ]
  },
  {
    name: 'Mim',
    ar: 'م',
    desc: 'Dudakların kapanmasıyla ve hafif geniz tınısıyla (gunne) çıkan ince dudak harfidir.',
    consonant: 'm',
    words: [
      { ar: 'مَلَكٌ', read: 'Melekün', mean: 'Melek' },
      { ar: 'حَمِدَ', read: 'Hamide', mean: 'Hamd etti' },
      { ar: 'قَلَمٌ', read: 'Kalemün', mean: 'Kalem' }
    ]
  },
  {
    name: 'Nun',
    ar: 'ن',
    desc: 'Dil ucunun üst diş etlerine değmesi ve genizden gelen gunne tınısıyla çıkan ince harftir.',
    consonant: 'n',
    words: [
      { ar: 'نَصَرَ', read: 'Nasara', mean: 'Yardım etti' },
      { ar: 'نُورٌ', read: 'Nûrun', mean: 'Nur' },
      { ar: 'إِيمَانٌ', read: 'Îmânün', mean: 'İman' }
    ]
  },
  {
    name: 'Vav',
    ar: 'و',
    desc: 'Dudakların ileriye doğru yuvarlanmasıyla çıkar. Harekesiz olup öncesi ötreli olduğunda "û" diye uzatan med harfidir. Sonraki harfle birleşmez.',
    consonant: 'v',
    nonConnecting: true,
    words: [
      { ar: 'وَعَدَ', read: 'Ve\'ade', mean: 'Söz verdi' },
      { ar: 'وَلِيٌّ', read: 'Veliyyün', mean: 'Dost, yardımcı' },
      { ar: 'يَوْمٌ', read: 'Yevmün', mean: 'Gün' }
    ]
  },
  {
    name: 'He',
    ar: 'هـ',
    desc: 'Boğazın en alt kısmından göğüsten gelen yumuşak ve ince bir nefesle çıkar.',
    consonant: 'h',
    words: [
      { ar: 'هُدًى', read: 'Hüden', mean: 'Hidayet, doğru yol' },
      { ar: 'ذَهَبَ', read: 'Zehebe', mean: 'Gitti' },
      { ar: 'وَجْهٌ', read: 'Vechün', mean: 'Yüz, zat' }
    ]
  },
  {
    name: 'Lam-Elif',
    ar: 'لا',
    desc: 'Lam harfi ile Elif harfinin birleşmiş şeklidir. Kendinden sonraki harfle birleşmez.',
    consonant: 'l',
    nonConnecting: true,
    words: [
      { ar: 'لَا', read: 'Lâ', mean: 'Hayır, yoktur' },
      { ar: 'سَلَامٌ', read: 'Selâmün', mean: 'Selâm' },
      { ar: 'إِسْلَامٌ', read: 'İslâmün', mean: 'İslâm' }
    ]
  },
  {
    name: 'Hemze',
    ar: 'ء',
    desc: 'Boğazın en alt kısmından ses tellerinin kapanıp açılmasıyla net olarak çıkarılan harftir.',
    consonant: '\'',
    nonConnecting: true,
    words: [
      { ar: 'سَأَلَ', read: 'Se\'ele', mean: 'Sordu, istedi' },
      { ar: 'قَرَأَ', read: 'Kara\'e', mean: 'Okudu' },
      { ar: 'شَيْءٌ', read: 'Şey\'ün', mean: 'Şey' }
    ]
  },
  {
    name: 'Ye',
    ar: 'ي',
    desc: 'Dil ortasından çıkan ince harftir. Harekesiz olup öncesi esreli olduğunda "î" diye uzatan med harfidir.',
    consonant: 'y',
    words: [
      { ar: 'يَدٌ', read: 'Yedün', mean: 'El' },
      { ar: 'يَوْمٌ', read: 'Yevmün', mean: 'Gün' },
      { ar: 'كَرِيمٌ', read: 'Kerîmün', mean: 'Kerem sahibi' }
    ]
  }
];

export function baseConsonant(letter: ElifbaLetter): string {
  return letter.consonant;
}

export function harekeForm(letter: ElifbaLetter, type: 'ustun' | 'esre' | 'otre'): string {
  const base = letter.ar === 'هـ' ? 'ه' : letter.ar === 'ا' ? 'أ' : letter.ar;
  if (type === 'ustun') return `${base}\u064E`;
  if (type === 'esre') return letter.ar === 'ا' ? `إ\u0650` : `${base}\u0650`;
  return `${base}\u064F`;
}

export function harekeRead(letter: ElifbaLetter, type: 'ustun' | 'esre' | 'otre'): string {
  const isKalin = KALIN.has(letter.name);
  const c = letter.consonant === '\'' ? '' : letter.consonant;
  const cap = c ? c.charAt(0).toUpperCase() + c.slice(1) : '';
  if (type === 'ustun') return `${cap}${isKalin ? 'a' : 'e'}`;
  if (type === 'esre') return `${cap}${isKalin ? 'ı' : 'i'}`;
  return `${cap}${isKalin ? 'u' : 'ü'}`;
}

export function buildPositions(letter: ElifbaLetter): {
  yalniz: string;
  bas: string;
  orta: string;
  son: string;
} {
  const ch = letter.ar === 'هـ' ? 'ه' : letter.ar;
  if (letter.ar === 'ء') {
    return { yalniz: 'ء', bas: 'أ / إ', orta: 'ـئـ / ـؤ', son: 'ـأ / ـء' };
  }
  if (letter.ar === 'لا') {
    return { yalniz: 'لا', bas: 'لا', orta: 'ـلا', son: 'ـلا' };
  }
  if (letter.nonConnecting) {
    return {
      yalniz: ch,
      bas: ch,
      orta: `ـ${ch}`,
      son: `ـ${ch}`
    };
  }
  return {
    yalniz: ch,
    bas: `${ch}ـ`,
    orta: `ـ${ch}ـ`,
    son: `ـ${ch}`
  };
}

export function buildHarekeSet(letter: ElifbaLetter): { ar: string; lbl: string; rd: string }[] {
  const isKalin = KALIN.has(letter.name);
  const c = letter.consonant === '\'' ? '' : letter.consonant;
  const cap = c ? c.charAt(0).toUpperCase() + c.slice(1) : '';
  const base = letter.ar === 'هـ' ? 'ه' : letter.ar === 'ا' ? 'أ' : letter.ar;

  return [
    { ar: `${base}\u064E`, lbl: 'Üstün (Fetha)', rd: `${cap}${isKalin ? 'a' : 'e'}` },
    { ar: letter.ar === 'ا' ? 'إ\u0650' : `${base}\u0650`, lbl: 'Esre (Kesre)', rd: `${cap}${isKalin ? 'ı' : 'i'}` },
    { ar: `${base}\u064F`, lbl: 'Ötre (Damme)', rd: `${cap}${isKalin ? 'u' : 'ü'}` },
    { ar: `${base}\u064Bا`, lbl: 'İki Üstün (Tenvin)', rd: `${cap}${isKalin ? 'an' : 'en'}` },
    { ar: `${base}\u064D`, lbl: 'İki Esre (Tenvin)', rd: `${cap}${isKalin ? 'ın' : 'in'}` },
    { ar: `${base}\u064C`, lbl: 'İki Ötre (Tenvin)', rd: `${cap}${isKalin ? 'un' : 'ün'}` }
  ];
}

export function buildCombos(letter: ElifbaLetter): { ar: string; note: string; rd: string }[] {
  const isKalin = KALIN.has(letter.name);
  const c = letter.consonant === '\'' ? '' : letter.consonant;
  const cap = c ? c.charAt(0).toUpperCase() + c.slice(1) : '';
  const base = letter.ar === 'هـ' ? 'ه' : letter.ar === 'ا' ? 'أ' : letter.ar;

  return [
    {
      ar: `${base}\u064Eا`,
      note: 'Harf + Med Elifi (1 Elif uzatma)',
      rd: `${cap}${isKalin ? 'â' : 'ê'}`
    },
    {
      ar: `${base}\u064Fو`,
      note: 'Harf + Med Vav\'ı (1 Elif uzatma)',
      rd: `${cap}${isKalin ? 'û' : 'û'}`
    },
    {
      ar: `${base}\u0650ي`,
      note: 'Harf + Med Ye\'si (1 Elif uzatma)',
      rd: `${cap}î`
    },
    {
      ar: `أَ${base}\u0652`,
      note: 'Hemze + Cezimli Harf (Kapalı Hece)',
      rd: `E${c || '\''}`
    }
  ];
}

export const WORD_BANK: BankWord[] = [
  // KOLAY SEVİYE (Üç Harfli Harekeli Kelimeler)
  { ar: 'كَتَبَ', rd: 'Ketebe', mean: 'Yazdı', lvl: 'kolay' },
  { ar: 'خَلَقَ', rd: 'Haleka', mean: 'Yarattı', lvl: 'kolay' },
  { ar: 'ذَهَبَ', rd: 'Zehebe', mean: 'Gitti', lvl: 'kolay' },
  { ar: 'سَجَدَ', rd: 'Secede', mean: 'Secde etti', lvl: 'kolay' },
  { ar: 'شَكَرَ', rd: 'Şekera', mean: 'Şükretti', lvl: 'kolay' },
  { ar: 'صَبَرَ', rd: 'Sabera', mean: 'Sabretti', lvl: 'kolay' },
  { ar: 'عَلِمَ', rd: 'Alime', mean: 'Bildi', lvl: 'kolay' },
  { ar: 'عَمِلَ', rd: 'Amile', mean: 'Amel işledi', lvl: 'kolay' },
  { ar: 'غَفَرَ', rd: 'Gafera', mean: 'Bağışladı', lvl: 'kolay' },
  { ar: 'فَتَحَ', rd: 'Feteha', mean: 'Açtı, fethetti', lvl: 'kolay' },
  { ar: 'نَصَرَ', rd: 'Nasara', mean: 'Yardım etti', lvl: 'kolay' },
  { ar: 'حَمِدَ', rd: 'Hamide', mean: 'Hamd etti', lvl: 'kolay' },
  { ar: 'رَحِمَ', rd: 'Rahime', mean: 'Merhamet etti', lvl: 'kolay' },
  { ar: 'سَمِعَ', rd: 'Semi\'a', mean: 'İşitti', lvl: 'kolay' },
  { ar: 'حَفِظَ', rd: 'Hafiza', mean: 'Korudu, ezberledi', lvl: 'kolay' },

  // ORTA SEVİYE (Cezimli, Medli ve Tenvinli Kelimeler)
  { ar: 'كِتَابٌ', rd: 'Kitâbün', mean: 'Kitap', lvl: 'orta' },
  { ar: 'سَلَامٌ', rd: 'Selâmün', mean: 'Selâm, esenlik', lvl: 'orta' },
  { ar: 'رَحِيمٌ', rd: 'Rahîmün', mean: 'Çok merhametli', lvl: 'orta' },
  { ar: 'كَرِيمٌ', rd: 'Kerîmün', mean: 'Çok cömert', lvl: 'orta' },
  { ar: 'غَفُورٌ', rd: 'Gafûrun', mean: 'Çok bağışlayan', lvl: 'orta' },
  { ar: 'مَسْجِدٌ', rd: 'Mescidün', mean: 'Secde edilen yer, mescid', lvl: 'orta' },
  { ar: 'حَمْدٌ', rd: 'Hamdün', mean: 'Hamd ve övgü', lvl: 'orta' },
  { ar: 'شَمْسٌ', rd: 'Şemsün', mean: 'Güneş', lvl: 'orta' },
  { ar: 'قَلْبٌ', rd: 'Kalbün', mean: 'Kalp, gönül', lvl: 'orta' },
  { ar: 'عِلْمٌ', rd: 'İlmün', mean: 'İlim, bilgi', lvl: 'orta' },
  { ar: 'صِرَاطٌ', rd: 'Sırâtun', mean: 'Dosdoğru yol', lvl: 'orta' },
  { ar: 'عَظِيمٌ', rd: 'Azîmün', mean: 'Pek büyük ve yüce', lvl: 'orta' },

  // ZOR SEVİYE (Şeddeli, Harf-i Tarifli ve Birleşik Kur'an İbareleri)
  { ar: 'الرَّحْمَٰنُ', rd: 'Er-Rahmânü', mean: 'Sonsuz merhamet sahibi', lvl: 'zor' },
  { ar: 'الرَّحِيمُ', rd: 'Er-Rahîmü', mean: 'Müminlere merhamet eden', lvl: 'zor' },
  { ar: 'الْعَالَمِينَ', rd: 'El-Âlemîne', mean: 'Âlemler', lvl: 'zor' },
  { ar: 'الْمُسْتَقِيمَ', rd: 'El-Müstekîme', mean: 'Dosdoğru olan', lvl: 'zor' },
  { ar: 'يَسْتَغْفِرُونَ', rd: 'Yestağfirûne', mean: 'İstiğfar ederler', lvl: 'zor' },
  { ar: 'الْمُؤْمِنُونَ', rd: 'El-Mü\'minûne', mean: 'İman eden müminler', lvl: 'zor' },
  { ar: 'الصَّالِحَاتِ', rd: 'Es-Sâlihâti', mean: 'Salih ameller', lvl: 'zor' },
  { ar: 'الْمُتَّقِينَ', rd: 'El-Müttekîne', mean: 'Takva sahipleri', lvl: 'zor' },
  { ar: 'تَبَارَكَ', rd: 'Tebârake', mean: 'Pek mübarek ve yücedir', lvl: 'zor' },
  { ar: 'الْقُرْآنُ', rd: 'El-Kur\'ânü', mean: 'Kur\'ân-ı Kerîm', lvl: 'zor' }
];

export const SIFAT_ZATI: SifatItem[] = [
  { ar: 'الْوُجُودُ', okunus: 'Vücûd', anlam: 'Allah\'ın var olması; yokluğu düşünülemez.' },
  { ar: 'الْقِدَمُ', okunus: 'Kıdem', anlam: 'Varlığının başlangıcı olmaması, ezelî olması.' },
  { ar: 'الْبَقَاءُ', okunus: 'Bekâ', anlam: 'Varlığının sonu olmaması, ebedî olması.' },
  { ar: 'الْوَحْدَانِيَّةُ', okunus: 'Vahdâniyyet', anlam: 'Zâtında, sıfatlarında ve fiillerinde bir ve tek olması.' },
  { ar: 'الْمُخَالَفَةُ لِلْحَوَادِثِ', okunus: 'Muhâlefetün lil-Havâdis', anlam: 'Sonradan yaratılan hiçbir varlığa benzememesi.' },
  { ar: 'الْقِيَامُ بِنَفْسِهِ', okunus: 'Kıyâm bi-Nefsihî', anlam: 'Varlığının kendinden olması, hiçbir şeye muhtaç olmaması.' }
];

export const SIFAT_SUBUTI: SifatItem[] = [
  { ar: 'الْحَيَاةُ', okunus: 'Hayât', anlam: 'Diri ve hayat sahibi olması.' },
  { ar: 'الْعِلْمُ', okunus: 'İlim', anlam: 'Gizli ve açık her şeyi eksiksiz bilmesi.' },
  { ar: 'السَّمْعُ', okunus: 'Sem\'', anlam: 'Her sesi ve her duayı işitmesi.' },
  { ar: 'الْبَصَرُ', okunus: 'Basar', anlam: 'Her şeyi engelsiz olarak görmesi.' },
  { ar: 'الْإِرَادَةُ', okunus: 'İrâde', anlam: 'Dilemesi; dilediği şeyin olması.' },
  { ar: 'الْقُدْرَةُ', okunus: 'Kudret', anlam: 'Her şeye sonsuz gücünün yetmesi.' },
  { ar: 'الْكَلَامُ', okunus: 'Kelâm', anlam: 'Harf ve sese muhtaç olmadan konuşması, kitaplar indirmesi.' },
  { ar: 'التَّكْوِينُ', okunus: 'Tekvîn', anlam: 'Yoktan var etmesi, yaratması.' }
];

export const TEMEL_DATA_1: TemelDuaItem[] = [
  {
    title: 'Kelime-i Tevhid',
    arabic: ['لَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ'],
    okunus: 'Lâ ilâhe illallâh, Muhammedün Rasûlullâh.',
    anlam: 'Allah\'tan başka hiçbir ilâh yoktur; Hz. Muhammed O\'nun elçisi ve Resûlüdür.'
  },
  {
    title: 'Kelime-i Şehâdet',
    arabic: ['أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ'],
    okunus: 'Eşhedü en lâ ilâhe illallâh ve eşhedü enne Muhammeden abdühû ve rasûlüh.',
    anlam: 'Ben şahitlik ederim ki Allah\'tan başka ilâh yoktur; ve yine şahitlik ederim ki Hz. Muhammed O\'nun kulu ve elçisidir.'
  },
  {
    title: 'Âmentü (İman Esasları)',
    arabic: [
      'آمَنْتُ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ وَالْيَوْمِ الْآخِرِ وَبِالْقَدَرِ خَيْرِهِ وَشَرِّهِ مِنَ اللَّهِ تَعَالَى وَالْبَعْثُ بَعْدَ الْمَوْتِ حَقٌّ',
      'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ'
    ],
    okunus: 'Âmentü billâhi ve melâiketihî ve kütübihî ve rusülihî vel-yevmil-âhiri ve bil-kaderi hayrihî ve şerrihî minallâhi teâlâ vel-ba\'sü ba\'del-mevti hakk. Eşhedü en lâ ilâhe illallâh ve eşhedü enne Muhammeden abdühû ve rasûlüh.',
    anlam: 'Ben Allah\'a, meleklerine, kitaplarına, peygamberlerine, ahiret gününe, kadere; hayır ve şerrin Allahü Teâlâ\'nın yaratmasıyla olduğuna inandım. Öldükten sonra dirilmek de haktır. Şahitlik ederim ki Allah\'tan başka ilâh yoktur ve yine şahitlik ederim ki Hz. Muhammed O\'nun kulu ve elçisidir.'
  }
];

export const TEMEL_DATA_2: TemelDuaItem[] = [
  {
    title: 'Tekbir',
    arabic: ['اَللّٰهُ أَكْبَرُ اَللّٰهُ أَكْبَرُ لَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ اَللّٰهُ أَكْبَرُ وَلِلّٰهِ الْحَمْدُ'],
    okunus: 'Allâhü ekber, Allâhü ekber, lâ ilâhe illallâhü vallâhü ekber, Allâhü ekber ve lillâhil hamd',
    anlam: "Allah en büyüktür, Allah en büyüktür. Allah'tan başka ilah yoktur. Allah en büyüktür, Allah en büyüktür ve hamd yalnız Allah'adır.",
    note: "Teşrik günlerinde ve bayramlarda getirilen teşrik tekbiridir."
  },
  {
    title: "1) Hz. Âdem (a.s.) ve Hz. Havva'nın Tövbe Duası",
    arabic: ['رَبَّـنَا ظَلَمْنَٓا اَنْفُسَنَا وَاِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِر۪ينَ'],
    okunus: 'Rabbenâ zalemnâ enfüsenâ ve in lem tağfir lenâ ve terhamnâ lenekûnenne minel-hâsirîn.',
    anlam: 'Ey Rabbimiz! Biz kendimize zulmettik. Eğer bizi bağışlamaz ve bize merhamet etmezsen, kesinlikle hüsrana (ziyana) uğrayanlardan oluruz.',
    note: "Hz. Âdem (a.s.) ile Hz. Havva validemizin yeryüzüne indirildikten sonra ettikleri ve kabul olunan meşhur tövbe duasıdır (A'râf Sûresi, 23)."
  },
  {
    title: "2) Hz. Yûnus'un (a.s.) Balığın Karnındaki Duası / Zikri",
    arabic: ['لَا إِلٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ'],
    okunus: 'Lâ ilâhe illâ ente sübhâneke innî küntü minez-zâlimîn.',
    anlam: 'Senden başka hiçbir ilah yoktur. Seni tenzih ederim. Şüphesiz ben (kendine) zulmedenlerden oldum.',
    note: "Hz. Yûnus (a.s.) balığın karnında ve denizlerin karanlığında bu dua ile Cenâb-ı Hakk'a iltica etmiş ve selamete ermiştir (Enbiyâ Sûresi, 87)."
  },
  {
    title: "3) Hz. Eyyûb'un (a.s.) Şifa ve Sabır Duası",
    arabic: ['رَبِّ أَنِّي مَسَّنِيَ الضُّرُّ وَأَنْتَ أَرْحَمُ الرَّاحِمِينَ'],
    okunus: 'Rabbi ennî messeniyed-durru ve ente erhamür-râhimîn.',
    anlam: 'Rabbim! Gerçekten bu dert (hastalık) bana dokundu. Sen ise merhametlilerin en merhametlisisin.',
    note: "Hz. Eyyûb (a.s.) ağır hastalık ve çileler karşısında gösterdiği efsanevi sabrın ardından bu şekilde dua etmiş ve şifaya kavuşmuştur (Enbiyâ Sûresi, 83)."
  },
  {
    title: "4) Hz. Mûsâ'nın (a.s.) Ferahlık ve Kolaylık Duası (Rabbişrah lî)",
    arabic: ['رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي'],
    okunus: 'Rabbişrah lî sadrî. Ve yessir lî emrî. Vahlül ‘ukdeten min lisânî. Yefkahû kavlî.',
    anlam: 'Rabbim! Göğsüme genişlik ver (kalbimi ferahlat). İşimi bana kolaylaştır. Dilimdeki düğümü çöz ki sözümü iyice anlasınlar.',
    note: "Hz. Mûsâ'nın (a.s.) Firavun'a tebliğe gitmeden önce Cenâb-ı Hakk'tan istediği kolaylık, ferahlık ve hitabet duasıdır (Tâhâ Sûresi, 25-28)."
  },
  {
    title: "5) Hz. Muhammed'in (s.a.v.) Güç ve Sabır Duası / Zikri",
    arabic: ['لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ الْعَلِيِّ الْعَظِيمِ'],
    okunus: 'Lâ havle velâ kuvvete illâ billâhil aliyyil azîm.',
    anlam: 'Güç ve kuvvet ancak şanı yüce olan Allah’ın yardımıyladır.',
    note: "Peygamber Efendimiz’in (s.a.v.) cennet hazinelerinden biri olarak bildirdiği, sıkıntılardan kurtulmak ve güç bulmak için okunan muazzam bir zikirdir."
  },
  {
    title: "6) Sadakallahül Azîm (Tasdik Kelâmı)",
    arabic: ['صَدَقَ اللّٰهُ الْعَظِيمُ'],
    okunus: 'Sadakallâhil-Azîm',
    anlam: 'Yüce Allah en doğruyu söyledi.',
    note: "Kuran-ı Kerim okunduktan sonra okunan ayetlerin doğruluğunu tasdik etmek amacıyla söylenir."
  }
];

export const TEMEL_DATA_3: TemelDuaItem[] = [
  {
    title: '🛡️ Zırh Duası (Hırz ve Muhafaza Duası)',
    arabic: [
      'فَاللّٰهُ خَيْرٌ حَافِظاًۖ وَهُوَ اَرْحَمُ الرَّاحِم۪ينَ',
      'بِسْمِ اللهِ الْخَالِقِ الْأَكْبَرِ، وَهُوَ حِرْزٌ مَانِعٌ مِمَّا أَخَافُ مِنْهُ وَأَحْذَرُ. لَا قُدْرَةَ لِمَخْلُوقٍ مَعَ قُدْرَةِ الْخَالِقِ، يُلْجِمُهُ بِلِجَامِ قُدْرَتِهِ، أَحْمَى حَمِيثاً أَطْمَى طَمِيثاً، وَكَانَ اللهُ قَوِيّاً عَزِيزاً. حٰمۤ عۤسۤقۤ حِمَايَتُنَا، كٰهٰيٰعۤصۤ كِفَايَتُنَا.. فَسَيَكْفِيكَهُمُ اللهُ وَهُوَ السَّمِيعُ الْعَلِيمُ. وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيمِ.'
    ],
    okunus:
      '"Fellâhu hayrun hâfizan ve huve erhamur-râhimîn."\n"Bismillâhil-hâlikil-ekber, ve huve hirzun mâni\'un mimmâ ehâfu minhu ve ahzer. Lâ kudrete li-mahlûkın me\'a kudretil-hâlik, yulcimuhû bi-licâmi kudretihî, ehmâ hamîsen etmâ tamîsen, ve kânallâhu kaviyyen \'azîzâ. Hâ-Mîm-\'Ayn-Sîn-Kâf himâyetunâ, Kâf-Hâ-Yâ-\'Ayn-Sâd kifâyetunâ. Fe-seyekfîkehumullâhu ve huves-semî\'ul-\'alîm. Ve lâ havle ve lâ kuvvete illâ billâhil-\'aliyyil-\'azîm."',
    anlam:
      '"Allah koruyanların en hayırlısıdır ve O, merhametlilerin en merhametlisidir." (Yûsuf Suresi, 64. Ayet)\n"En büyük Yaratıcı olan Allah\'ın adıyla. O, korktuğum ve çekindiğim her şeyden koruyan engelleyici bir zırhtır. Yaratıcının kudreti karşısında hiçbir yaratılmışın gücü yetmez; Allah onu kendi kudret gemiyle gemler. (Her türlü şerri) tamamen korur ve engeller. Allah çok güçlüdür, mutlak izzet sahibidir. Hâ-Mîm-Ayn-Sîn-Kâf koruyucumuz, Kâf-Hâ-Yâ-Ayn-Sâd yetenimizdir (bize kafidir). Onlara karşı Allah sana yetecektir; O, hakkıyla işitendir, hakkıyla bilendir. (Bakara Suresi, 137. Ayet) Güç ve kuvvet ancak yüce ve azamet sahibi olan Allah’ındır."',
    note: "Üstad Kadir Mısıroğlu'nun her türlü maddi ve manevi şerden, korkulan ve çekinilen tehlikelerden Cenâb-ı Hakk'ın hıfz u emânına sığınmak üzere okunmasını hassaten tavsiye ettiği meşhur Zırh (Hırz) Duasıdır.",
    hasAudioPlayer: true,
    audioUrl: import.meta.env.BASE_URL + 'audio/dualar/zirh_duasi.mp3'
  },
  {
    title: '1. Sabah Kalkış Rutini (Güne İhlasla Başlarken)',
    arabic: [
      'اَلْحَمْدُ لِلّٰهِ  •  أَسْتَغْفِرُ اللّٰهَ  •  يَا غَفَّارُ  •  يَا كَافِي  •  يَا سَتَّارُ'
    ],
    okunus:
      '11 defa Elhamdülillah • 11 defa Estağfirullah • 11 defa Yâ Gaffâr • 11 defa Yâ Kâfî • 11 defa Yâ Settâr',
    anlam:
      'Gözünüzü açtığınız ilk an (cünüp, abdestsiz veya taharetsiz olunması fark etmeksizin), insanlığın atası Hz. Âdem’in (a.s.) yaratıldığında dile getirdiği ilk insanî ve ilk peygamberî söz olan hamd ile güne başlayın. Dili gafletten uyandırmak adına parmaklarınızla sayarak şu tesbihatı eda edin:',
    zikirList: [
      {
        ar: 'اَلْحَمْدُ لِلّٰهِ',
        count: '11 Defa',
        okunus: 'Elhamdülillah',
        anlam: "Allah'a hamd ve şükür olsun.",
        aciklama: "Hz. Âdem’in (a.s.) ilk sözüne iktibaen, ruhu lütfedene şükür ve kulluk şuurunun nişanesidir."
      },
      {
        ar: 'أَسْتَغْفِرُ اللّٰهَ',
        count: '11 Defa',
        okunus: 'Estağfirullah',
        anlam: "Allah'tan mağfiret ve bağışlanma dilerim.",
        aciklama: 'Yeni güne günahlardan arınarak, nefsin acziyetini dergâh-ı ilahîye arz etme niyetidir.'
      },
      {
        ar: 'يَا غَفَّارُ',
        count: '11 Defa',
        okunus: 'Yâ Gaffâr',
        anlam: 'Ey günahları ziyadesiyle örten ve çokça bağışlayan!',
        aciklama: 'Günahları ziyadesiyle örten ve bağışlayan Cenâb-ı Hakk’ın mağfiretine sığınma niyazıdır.'
      },
      {
        ar: 'يَا كَافِي',
        count: '11 Defa',
        okunus: 'Yâ Kâfî',
        anlam: 'Ey kuluna her hususta kâfi gelen (yeten)!',
        aciklama: 'Gün boyunca her türlü ihtiyaçta Cenâb-ı Hakk’ın kifayetine sığınma niyazıdır.'
      },
      {
        ar: 'يَا سَتَّارُ',
        count: '11 Defa',
        okunus: 'Yâ Settâr',
        anlam: 'Ey ayıpları ve kusurları örten!',
        aciklama: 'Ayıpları ve kusurları örten, kulunu dünyada ve ahirette rezil olmaktan muhafaza eden Zât-ı Zülcelâl’e ilticadır.'
      }
    ],
    note: "Sabah uyanır uyanmaz dünya kelâmı konuşmadan parmaklarla sayılarak 11'er defa çekilmesi tavsiye edilen günlük sabah tesbihatıdır."
  },
  {
    title: '2. "Zamanı İki Defa Kullanmak" Nedir? ("Zaman, Hayatın En Kıymetli Hazinesidir")',
    arabic: [
      'أَسْتَغْفِرُ اللّٰهَ الْعَظِيمَ',
      'أَكْثِرُوا ذِكْرَ اللّٰهِ حَتَّى يَقُولُوا مَجْنُونٌ'
    ],
    okunus:
      'Estağfirullâhe\'l-Azîm  •  "Eksirû zikrallâhi hattâ yekûlû mecnûn." (Ahmed b. Hanbel, Müsned)',
    anlam:
      'Yüce Allah\'tan mağfiret dilerim.  •  Peygamber Efendimiz’in (s.a.v.) buyurduğu üzere: “Münafıklar size ‘deli’ diyecek raddeye gelinceye kadar Allah’ı çokça anın.” (Ahmed b. Hanbel, Müsned)',
    details: [
      'Hayat, insana bir defa verilen en büyük sermaye ve ganimettir. Yolculukta, asansör beklerken, trafikte sıkışmışken yahut uykuya dalış anında boş geçen vakitleri zikir ve tefekkürle doldurmak; fani ömrü Bâkî olanın rızasıyla berekete dönüştürmektir. İnsanın iradesi dışında gerçekleşen zorunlu haller (uyku, dinlenme, bekleme gibi) sahih bir niyet ile ihlaslı bir ibadete dönüşür.',
      '"Zaman, Hayatın En Kıymetli Hazinesidir": Dünyadaki bütün altınlar ve servetler bir araya gelse, ahirette samimiyetle çekilen tek bir "Estağfirullah" kelimesinin tartısına denk gelemez. Nitekim insan bu dünyaya çıplak doğar ve kabre çıplak girer; yanında götüreceği yegâne ziynet amelleridir.',
      'Bu idrakle, otobüs durağında, trafikte veya günlük işlerin fetret anlarında dili zikirle meşgul etmek akıllı müslümanın tükenmez kârıdır.'
    ],
    note: 'Boş geçen bekleme ve yolculuk anlarını zikirle ihya ederek zamanı hem dünya işi hem de ahiret sermayesi olarak iki defa kullanma düsturudur.'
  },
  {
    title: '3. Gün İçindeki Boş Anları Değerlendirme & Gece Uykuya Dalarken Muhasebe Rutini',
    arabic: [
      'اَللّٰهُ ، اَللّٰهُ  •  يَا لَطِيفُ',
      'اَلْحَمْدُ لِلّٰهِ  •  يَا غَفَّارُ (١٠٠)  •  يَا سَتَّارُ (١٠٠)  •  يَا لَطِيفُ (١٠٠)  •  يَا حَفِيظُ (١٠٠)'
    ],
    okunus:
      'Gün İçinde: "Allah, Allah" veya "Yâ Latîf"  •  Gece Yatağa Girerken: Elhamdülillah + 100 Yâ Gaffâr + 100 Yâ Settâr + 100 Yâ Latîf + 100 Yâ Hafîz',
    anlam:
      'Gün içindeki fetret anlarını "Allah, Allah" ve "Yâ Latîf" zikirleriyle ihya etmek; gece yatağa girildiğinde ise günün muhasebesini yapıp şükrettikten sonra 100\'er defa Esma zikirleriyle uykuyu ibadete dönüştürmek.',
    bullets: [
      {
        title: 'Bekleme ve Fetret Anları',
        text: 'Otobüs durağında, randevu saatini beklerken ya da asansör kabini gelene kadar zihni faydasız düşüncelerle yormak yerine; sürekli dil alışkanlığıyla "Allah, Allah" veya "Yâ Latîf" zikriyle kalbi besleyin.'
      },
      {
        title: 'Yolculuk ve Trafik',
        text: 'Arabayla işe giderken yahut yürürken zikir alışkanlığı edinmek, gün içinde farkında olmadan binlerce tesbihatın sevap hanenize yazılmasını sağlar.'
      },
      {
        title: 'Gayri İhtiyarî Haller ve Reaksiyonlar',
        text: 'Yolda yürürken ayağınız bir taşa değdiğinde, bir musibetle karşılaştığınızda veya şaşırdığınızda gayriihtiyarî verilen "Allah!" tepkisi dahi niyet ve şuur ile birleştiğinde melekler tarafından deftere zikir ve hassaten sevap olarak kaydolunur.'
      },
      {
        title: 'Tahlil ve Şükür (Gece Rutini Başlangıcı)',
        text: 'Yatağa girmeden önce günün amellerini tahlil edip; "Elhamdülillah, beni bugün de imanlı ve sıhhatli bir şekilde geceliğe ulaştırdın" diyerek kalben şükretmek.'
      },
      {
        title: 'Zikirle Uyumak',
        text: 'Uyku galebe çalana kadar dili ve kalbi zikirle meşgul etmek, kul uyusa dahi meleklerin o uykuyu ibadet sayarak sabaha kadar amel defterine zikir yazmasını sağlar.'
      }
    ],
    zikirList: [
      {
        ar: 'يَا غَفَّارُ',
        count: '100 Defa',
        okunus: 'Yâ Gaffâr',
        anlam: 'Ey günahları fazlaca örten ve bağışlayan!',
        aciklama: 'Günahların affı, hataların örtülmesi ve mağfiret arzusu için.'
      },
      {
        ar: 'يَا سَتَّارُ',
        count: '100 Defa',
        okunus: 'Yâ Settâr',
        anlam: 'Ey ayıpları ve kusurları örten, koruyan!',
        aciklama: 'Kötü zamanların şerrinden, gizli-açık tehlikelerden ve kazalardan muhafaza buyrulmak için.'
      },
      {
        ar: 'يَا لَطِيفُ',
        count: '100 Defa',
        okunus: 'Yâ Latîf',
        anlam: 'Ey sonsuz lütuf, kerem ve incelik sahibi!',
        aciklama: 'Sıkıntılı ve darlık anlarında ilahî lütuf, kerem ve kolaylığa erişmek için.'
      },
      {
        ar: 'يَا حَفِيظُ',
        count: '100 Defa',
        okunus: 'Yâ Hafîz',
        anlam: 'Ey her şeyi eksiksiz koruyup muhafaza eden!',
        aciklama: 'İman, can, mal ve neslin muhafazası niyetiyle.'
      }
    ],
    note: 'Uykuya dalarken bu zikirlerle meşgul olan kimsenin uykusu dahi sabaha kadar ibadet ve zikir hükmünde amel defterine yazılır.'
  },
  {
    title: '4. 💡 Hikmet ve Tavsiye Nüktesi (Vuslat Hırsı, Hayırlı Sohbet, Lütuf ve Kahır İmtihanı)',
    arabic: [
      'مَنْ كَانَ يُؤْمِنُ بِاللّٰهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
      'اَلْمَرْءُ مَعَ مَنْ أَحَبَّ'
    ],
    okunus:
      '"Men kâne yü\'minü billâhi vel-yevmil-âhiri felyekul hayran ev liyasmut."  •  "El-mer\'ü me\'a men ehabbe."',
    anlam:
      '"Allah\'a ve ahiret gününe iman eden kimse ya hayır söylesin ya da sükût etsin (sussun)." (Buhârî, Müslim)  •  "Kişi sevdiği ile beraberdir." (Buhârî, Müslim)',
    details: [
      'Vuslat Hırsı ve Hayırlı Sohbet: Müslüman, ulvî gayeler hususunda en büyük hırsa sahip insandır; zira onun nihai maksadı Allah’a vuslattır (Vâsıl-ı İllallâh). Bu sonsuz hedefe ulaşmak için hırs dünyalık meta için değil, rızâ-yı ilahî ve ahiret azığı toplamak için olmalıdır.',
      'Hak yolunda “Ya hayır söylemek ya da sükût etmek” esastır. Rasûlullah’ın (s.a.v.) "Kişi sevdiği ile beraberdir" hadis-i şerifi gereğince, dost ve çevre seçimi insanı ya âlâ-yı illiyyîne çıkarır ya da esfel-i sâfilîne düşürür.'
    ],
    bullets: [
      {
        title: 'Lütfun İmtihanı Zordur',
        text: 'Para, makam, itibar ve sıhhat gibi lütuflar nefsi şımartıp firavunlaştırabilir; insan acziyetini, kulluğunu ve muhtaçlığını unutma tehlikesiyle karşı karşıya kalır.'
      },
      {
        title: 'Kahrın İmtihanı Berekettir',
        text: 'Sıkıntı, hastalık, daralma, cezaevi veya ölüm tehlikesi gibi "kırık kalp" halleri (yani ilahî kahır tecellileri) nefsin gururunu kırar, insanı hakiki acziyetine döndürür ve Cenâb-ı Hakk’a yakınlaştırır. Her insan ham bir demirdir; dert, çile ve kahır imtihanları o demiri çelikleştirip kemale erdirir.'
      }
    ],
    note: "Üstad Kadir Mısıroğlu'nun sohbetlerinde sıkça vurguladığı; müminin ahiret azığı toplama gayreti, sükût ve hayırlı kelâm adabı ile lütuf ve kahır tecellilerine bakış açısını özetleyen hikmet düsturlarıdır."
  }
];

export const TOTAL_DUA_COUNT = TEMEL_DATA_1.length + TEMEL_DATA_2.length + TEMEL_DATA_3.length;
