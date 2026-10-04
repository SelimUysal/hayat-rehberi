import { TajweedRuleInfo, TajweedRuleType } from '../types/tajweed';

export const ALL_TAJWEED_RULES: TajweedRuleInfo[] = [
  {
    type: 'ihfa',
    titleTr: 'İhfâ (Lisânî)',
    category: 'tenvin_ve_sakin_nun',
    categoryTitleTr: 'Tenvin ve Sâkin Nûn Halleri',
    shortDesc: 'Nûn sesini 15 harften önce genizden hafifçe gizleyerek okuma.',
    ruleExplanation: 'Nûn-ı sâkin veya tenvinden sonra ihfâ harflerinden biri geldiğinde, dil damağa tam basılmadan genizden 1.5 hareke gunne verilerek ses gizlenir.',
    lettersInvolved: ['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك'],
    durationElif: '1.5 Elif',
    exampleArabic: 'مِنْ قَبْلُ / أَنْزَلْنَا',
    exampleTr: 'Min.. kablü / En..zelnâ',
    color: {
      bgLight: 'bg-rose-50',
      bgDark: 'bg-rose-950/40',
      textLight: 'text-rose-700',
      textDark: 'text-rose-400',
      border: 'border-rose-300',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800',
      hex: '#e11d48'
    }
  },
  {
    type: 'izhar',
    titleTr: 'İzhâr (Halkî)',
    category: 'tenvin_ve_sakin_nun',
    categoryTitleTr: 'Tenvin ve Sâkin Nûn Halleri',
    shortDesc: 'Nûn sesini 6 boğaz harfinden önce açık ve net okuma.',
    ruleExplanation: 'Nûn-ı sâkin veya tenvinden sonra boğaz harflerinden biri geldiğinde nûn sesi duraksamadan ve gunne yapılmadan açıkça okunur.',
    lettersInvolved: ['ء', 'ه', 'ع', 'ح', 'غ', 'خ'],
    durationElif: 'Net Okuyuş',
    exampleArabic: 'مَنْ آمَنَ / مِنْ خَوْفٍ',
    exampleTr: 'Men âmene / Min havf',
    color: {
      bgLight: 'bg-sky-50',
      bgDark: 'bg-sky-950/40',
      textLight: 'text-sky-700',
      textDark: 'text-sky-400',
      border: 'border-sky-300',
      badgeBg: 'bg-sky-100',
      badgeText: 'text-sky-800',
      hex: '#0284c7'
    }
  },
  {
    type: 'iklab',
    titleTr: 'İklâb',
    category: 'tenvin_ve_sakin_nun',
    categoryTitleTr: 'Tenvin ve Sâkin Nûn Halleri',
    shortDesc: 'Nûn sesinin Bâ harfinden önce Mîme dönüşmesi.',
    ruleExplanation: 'Nûn-ı sâkin veya tenvinden sonra Bâ (ب) geldiğinde nûn sesi mîme çevrilir ve dudaklar hafif tutularak gunne ile okunur.',
    lettersInvolved: ['ب'],
    durationElif: '1.5 Elif',
    exampleArabic: 'مِنْ بَعْدِ / سَمِيعٌ بَصِيرٌ',
    exampleTr: 'Mim ba\'di / Semî\'um-besîr',
    color: {
      bgLight: 'bg-emerald-50',
      bgDark: 'bg-emerald-950/40',
      textLight: 'text-emerald-700',
      textDark: 'text-emerald-400',
      border: 'border-emerald-300',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      hex: '#059669'
    }
  },
  {
    type: 'idgam_maal_gunne',
    titleTr: 'İdğâm-ı Maal Gunne',
    category: 'tenvin_ve_sakin_nun',
    categoryTitleTr: 'Tenvin ve Sâkin Nûn Halleri',
    shortDesc: 'Y-M-N-V harflerine katarak gunneli okuma.',
    ruleExplanation: 'Nûn-ı sâkin veya tenvinden sonra Y-M-N-V harflerinden biri geldiğinde harf şeddelenir ve genizden 1.5 elif gunne tutulur.',
    lettersInvolved: ['ي', 'ن', 'م', 'و'],
    durationElif: '1.5 Elif',
    exampleArabic: 'مَنْ يَقُولُ / مِنْ مَالٍ',
    exampleTr: 'Mey-yekûlü / Mim-mâlin',
    color: {
      bgLight: 'bg-purple-50',
      bgDark: 'bg-purple-950/40',
      textLight: 'text-purple-700',
      textDark: 'text-purple-400',
      border: 'border-purple-300',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-800',
      hex: '#9333ea'
    }
  },
  {
    type: 'idgam_bila_gunne',
    titleTr: 'İdğâm-ı Bilâ Gunne',
    category: 'tenvin_ve_sakin_nun',
    categoryTitleTr: 'Tenvin ve Sâkin Nûn Halleri',
    shortDesc: 'Lâm ve Râ harflerine tam katarak gunnesiz okuma.',
    ruleExplanation: 'Nûn-ı sâkin veya tenvinden sonra Lâm veya Râ geldiğinde nûn tamamen kaybolur, harf şeddeli ve gunnesiz okunur.',
    lettersInvolved: ['ل', 'ر'],
    durationElif: 'Tam Şedde',
    exampleArabic: 'مِنْ رَبِّهِمْ / هُدًى لِلْمُتَّقِينَ',
    exampleTr: 'Mir-rabbihim / Hüdel-lil müttekîn',
    color: {
      bgLight: 'bg-amber-50',
      bgDark: 'bg-amber-950/40',
      textLight: 'text-amber-700',
      textDark: 'text-amber-400',
      border: 'border-amber-300',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      hex: '#d97706'
    }
  },
  {
    type: 'kalkale',
    titleTr: 'Kalkale (Yankılama)',
    category: 'kalkale',
    categoryTitleTr: 'Kalkale Harfleri',
    shortDesc: 'Kaf, Tı, Be, Cim, Dal cezimli olduğunda mahreçte yankılanması.',
    ruleExplanation: 'Kutup Ced (ق ط ب ج د) harfleri cezimli olduğunda veya durak sebebiyle sâkin kılındığında ses mahrecine kuvvetle çarparak yankılanır.',
    lettersInvolved: ['ق', 'ط', 'ب', 'ج', 'د'],
    durationElif: 'Vurucu Titreşim',
    exampleArabic: 'يَجْعَلْ / خَلَقْنَا / أَحَدٌ',
    exampleTr: 'Yec\'al / Halak-nâ / Ehad',
    color: {
      bgLight: 'bg-red-50',
      bgDark: 'bg-red-950/40',
      textLight: 'text-red-700',
      textDark: 'text-red-400',
      border: 'border-red-300',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-800',
      hex: '#dc2626'
    }
  },
  {
    type: 'idgam_semsiyye',
    titleTr: 'İdğâm-ı Şemsiyye',
    category: 'semsi_kameri',
    categoryTitleTr: 'Lâm-ı Tarif (ال)',
    shortDesc: 'Şemsî harflerden önce Lâm yazılır ama okunmaz, harf şeddelenir.',
    ruleExplanation: 'Elif-Lâm takısından sonra şemsî harf geldiğinde lâm harfi sonraki harfe idgam edilir.',
    lettersInvolved: ['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن'],
    durationElif: 'Şeddeli Geçiş',
    exampleArabic: 'الشَّمْسُ / النَّاسِ',
    exampleTr: 'Eş-şems / En-nâs',
    color: {
      bgLight: 'bg-orange-50',
      bgDark: 'bg-orange-950/40',
      textLight: 'text-orange-700',
      textDark: 'text-orange-400',
      border: 'border-orange-300',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-800',
      hex: '#ea580c'
    }
  },
  {
    type: 'izhar_kameriyye',
    titleTr: 'İzhâr-ı Kameriyye',
    category: 'semsi_kameri',
    categoryTitleTr: 'Lâm-ı Tarif (ال)',
    shortDesc: 'Kamerî harflerden önce Lâm açıkça ve cezimli olarak okunur.',
    ruleExplanation: 'Elif-Lâm takısından sonra kamerî harf geldiğinde lâm harfi açıkça cezimli okunur.',
    lettersInvolved: ['ء', 'ب', 'ج', 'ح', 'خ', 'ع', 'غ', 'ف', 'ق', 'ك', 'م', 'و', 'هـ', 'ي'],
    durationElif: 'Net Lâm',
    exampleArabic: 'الْقَمَرُ / الْحَمْدُ',
    exampleTr: 'El-kamer / El-hamdü',
    color: {
      bgLight: 'bg-teal-50',
      bgDark: 'bg-teal-950/40',
      textLight: 'text-teal-700',
      textDark: 'text-teal-400',
      border: 'border-teal-300',
      badgeBg: 'bg-teal-100',
      badgeText: 'text-teal-800',
      hex: '#0d9488'
    }
  },
  {
    type: 'medd_i_tabii',
    titleTr: 'Medd-i Tabiî',
    category: 'med_halleri',
    categoryTitleTr: 'Med (Uzatma) Halleri',
    shortDesc: 'Doğal 1 Elif miktarı uzatma.',
    ruleExplanation: 'Harf-i med olup sebebi med bulunmadığında yapılan 1 eliflik doğal uzatmadır.',
    lettersInvolved: ['ا', 'و', 'ي'],
    durationElif: '1 Elif',
    exampleArabic: 'قَالَ / يَقُولُ / قِيلَ',
    exampleTr: 'Kâle / Yekûlü / Kîle',
    color: {
      bgLight: 'bg-emerald-50',
      bgDark: 'bg-emerald-950/40',
      textLight: 'text-emerald-700',
      textDark: 'text-emerald-400',
      border: 'border-emerald-300',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      hex: '#10b981'
    }
  },
  {
    type: 'medd_i_muttasil',
    titleTr: 'Medd-i Muttasıl',
    category: 'med_halleri',
    categoryTitleTr: 'Med (Uzatma) Halleri',
    shortDesc: 'Med harfi ve hemzenin aynı kelimede birleşmesi (4 Elif).',
    ruleExplanation: 'Med harfinden sonra hemze aynı kelimede bitişik geldiğinde 4 elif miktarı uzatılır.',
    lettersInvolved: ['ء', 'أ'],
    durationElif: '4 Elif (Vacip)',
    exampleArabic: 'جَاءَ / السَّمَاءِ',
    exampleTr: 'Câââe / Es-semâââ\'i',
    color: {
      bgLight: 'bg-indigo-50',
      bgDark: 'bg-indigo-950/40',
      textLight: 'text-indigo-700',
      textDark: 'text-indigo-400',
      border: 'border-indigo-300',
      badgeBg: 'bg-indigo-100',
      badgeText: 'text-indigo-800',
      hex: '#6366f1'
    }
  },
  {
    type: 'medd_i_munfasil',
    titleTr: 'Medd-i Munfasıl',
    category: 'med_halleri',
    categoryTitleTr: 'Med (Uzatma) Halleri',
    shortDesc: 'Med harfi bir kelimede, hemzenin diğer kelimede olması.',
    ruleExplanation: 'Med harfi kelimenin sonunda, hemze sonraki kelimenin başında olduğunda 2-4 elif miktarı uzatılır.',
    lettersInvolved: ['ء', 'إ', 'أ'],
    durationElif: '2-4 Elif (Câiz)',
    exampleArabic: 'يَا أَيُّهَا / بِمَا أُنْزِلَ',
    exampleTr: 'Yâââ eyyühe / Bimâââ ünzile',
    color: {
      bgLight: 'bg-blue-50',
      bgDark: 'bg-blue-950/40',
      textLight: 'text-blue-700',
      textDark: 'text-blue-400',
      border: 'border-blue-300',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
      hex: '#3b82f6'
    }
  },
  {
    type: 'medd_i_lazim',
    titleTr: 'Medd-i Lâzım',
    category: 'med_halleri',
    categoryTitleTr: 'Med (Uzatma) Halleri',
    shortDesc: 'Med harfinden sonra sükûn-ı lâzım (şedde veya cezm) gelmesi.',
    ruleExplanation: 'Med harfinden sonra aslî sükûn veya şedde geldiğinde 4 elif miktarı zorunlu uzatılır.',
    lettersInvolved: ['ّ', 'ْ'],
    durationElif: '4 Elif (Farz/Lâzım)',
    exampleArabic: 'الضَّالِّينَ / الحَاقَّةُ',
    exampleTr: 'Eddâââllîn / El-Hâââkkah',
    color: {
      bgLight: 'bg-violet-50',
      bgDark: 'bg-violet-950/40',
      textLight: 'text-violet-700',
      textDark: 'text-violet-400',
      border: 'border-violet-300',
      badgeBg: 'bg-violet-100',
      badgeText: 'text-violet-800',
      hex: '#8b5cf6'
    }
  },
  {
    type: 'ihfa_sefevi',
    titleTr: 'İhfâ-i Şefevî (Dudak İhfâsı)',
    category: 'sakin_mim',
    categoryTitleTr: 'Sâkin Mîm Halleri',
    shortDesc: 'Sâkin Mîm\'den sonra Bâ harfi geldiğinde dudak ihfâsı yapılması.',
    ruleExplanation: 'Sâkin Mîm\'den sonra Bâ geldiğinde dudaklar tam kenetlenmeden gunneli tutulur.',
    lettersInvolved: ['ب'],
    durationElif: '1.5 Elif',
    exampleArabic: 'تَرْمِيهِمْ بِحِجَارَةٍ',
    exampleTr: 'Termîhim.. bihicârah',
    color: {
      bgLight: 'bg-pink-50',
      bgDark: 'bg-pink-950/40',
      textLight: 'text-pink-700',
      textDark: 'text-pink-400',
      border: 'border-pink-300',
      badgeBg: 'bg-pink-100',
      badgeText: 'text-pink-800',
      hex: '#ec4899'
    }
  },
  {
    type: 'idgam_misleyn',
    titleTr: 'İdğâm-ı Misleyn Maal Gunne',
    category: 'sakin_mim',
    categoryTitleTr: 'Sâkin Mîm Halleri',
    shortDesc: 'Sâkin Mîm\'den sonra Mîm harfi geldiğinde şeddeli birleşme.',
    ruleExplanation: 'İki mîm bir araya geldiğinde şeddeli mîm gibi gunne ile 1.5 elif tutulur.',
    lettersInvolved: ['م'],
    durationElif: '1.5 Elif',
    exampleArabic: 'لَهُمْ مَا يَشَاءُونَ',
    exampleTr: 'Lehüm-mâ yeşâ\'ûn',
    color: {
      bgLight: 'bg-fuchsia-50',
      bgDark: 'bg-fuchsia-950/40',
      textLight: 'text-fuchsia-700',
      textDark: 'text-fuchsia-400',
      border: 'border-fuchsia-300',
      badgeBg: 'bg-fuchsia-100',
      badgeText: 'text-fuchsia-800',
      hex: '#d946ef'
    }
  },
  {
    type: 'izhar_sefevi',
    titleTr: 'İzhâr-ı Şefevî (Dudak İzhârı)',
    category: 'sakin_mim',
    categoryTitleTr: 'Sâkin Mîm Halleri',
    shortDesc: 'Sâkin Mîm\'den sonra Be ve Mim dışındaki harflerde açık okuma.',
    ruleExplanation: 'Sâkin Mîm diğer tüm harflerin önünde açık ve net okunur.',
    lettersInvolved: ['Diğer harfler'],
    durationElif: 'Net Okuyuş',
    exampleArabic: 'أَنْعَمْتَ عَلَيْهِمْ',
    exampleTr: 'En\'amte \'aleyhim',
    color: {
      bgLight: 'bg-cyan-50',
      bgDark: 'bg-cyan-950/40',
      textLight: 'text-cyan-700',
      textDark: 'text-cyan-400',
      border: 'border-cyan-300',
      badgeBg: 'bg-cyan-100',
      badgeText: 'text-cyan-800',
      hex: '#06b6d4'
    }
  },
  {
    type: 'hukmur_ra_kalin',
    titleTr: 'Râ\'nın Kalın Okunuşu',
    category: 'hukmur_ra',
    categoryTitleTr: 'Hükmü\'r-Râ',
    shortDesc: 'Râ harfinin üstün, ötre veya uygun sâkinlikte kalın okunması.',
    ruleExplanation: 'Râ üstünlü, ötreli veya öncesi üstün/ötreli sâkin olduğunda kalın okunur.',
    lettersInvolved: ['ر'],
    durationElif: 'Kalın Telaffuz',
    exampleArabic: 'رَبِّ / الْقُرْآنُ',
    exampleTr: 'Rabbi / El-Kur\'ân',
    color: {
      bgLight: 'bg-yellow-50',
      bgDark: 'bg-yellow-950/40',
      textLight: 'text-yellow-700',
      textDark: 'text-yellow-400',
      border: 'border-yellow-300',
      badgeBg: 'bg-yellow-100',
      badgeText: 'text-yellow-800',
      hex: '#eab308'
    }
  },
  {
    type: 'hukmur_ra_ince',
    titleTr: 'Râ\'nın İnce Okunuşu',
    category: 'hukmur_ra',
    categoryTitleTr: 'Hükmü\'r-Râ',
    shortDesc: 'Râ harfinin esreli veya öncesi esreli sâkinlikte ince okunması.',
    ruleExplanation: 'Râ esreli veya öncesi esreli sâkin olduğunda ince okunur.',
    lettersInvolved: ['ر'],
    durationElif: 'İnce Telaffuz',
    exampleArabic: 'رِزْقًا / فِرْعَوْنَ',
    exampleTr: 'Rızkan / Fir\'avn',
    color: {
      bgLight: 'bg-lime-50',
      bgDark: 'bg-lime-950/40',
      textLight: 'text-lime-700',
      textDark: 'text-lime-400',
      border: 'border-lime-300',
      badgeBg: 'bg-lime-100',
      badgeText: 'text-lime-800',
      hex: '#84cc16'
    }
  }
];

export const TAJWEED_RULES_DICTIONARY: Record<TajweedRuleType, TajweedRuleInfo> = ALL_TAJWEED_RULES.reduce(
  (acc, rule) => {
    acc[rule.type] = rule;
    return acc;
  },
  {} as Record<TajweedRuleType, TajweedRuleInfo>
);
