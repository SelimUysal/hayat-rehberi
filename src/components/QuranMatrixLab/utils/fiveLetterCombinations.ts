import { ArabicLetter, FourLetterQuad, FiveLetterCombination, HarakatVariant, QuranicWordExample } from '../types/matrix';
import { HARAKAT } from './arabicCombinations';

// Curated 5-letter Quranic words dictionary
const QURANIC_FIVE_LETTER_DICT: Record<string, QuranicWordExample> = {
  'المسجد': {
    arabic: 'الْمَسْجِدِ',
    transliteration: 'El-Mescidi',
    meaning: 'Mescid, ibadethane (Harf-i tarifli)',
    surahRef: 'İsra 1',
  },
  'بالمسجد': {
    arabic: 'بِالْمَسْجِدِ',
    transliteration: 'Bil-Mescidi',
    meaning: 'Mescidde, mescit ile',
    surahRef: 'Bakara 187',
  },
  'المسلم': {
    arabic: 'الْمُسْلِمُ',
    transliteration: 'El-Müslimü',
    meaning: 'Müslüman, Allah\'a boyun eğen',
    surahRef: 'Hac 78',
  },
  'فيعلم': {
    arabic: 'فَيَعْلَمُ',
    transliteration: 'Fe-ya\'lemü',
    meaning: 'Böylece bilir, bilmektedir',
    surahRef: 'Bakara 26',
  },
  'بالأحسن': {
    arabic: 'بِالْأَحْسَنِ',
    transliteration: 'Bil-Ahseni',
    meaning: 'En güzeliyle, en mükemmel şekilde',
    surahRef: 'Fussilet 34',
  },
  'الرحمن': {
    arabic: 'الرَّحْمَٰنُ',
    transliteration: 'Er-Rahmân',
    meaning: 'Sonsuz ve kuşatıcı merhamet sahibi',
    surahRef: 'Fatiha 1',
  },
  'ومحمد': {
    arabic: 'وَمُحَمَّدٌ',
    transliteration: 'Ve-Muhammedün',
    meaning: 'Ve Muhammed (s.a.v)',
    surahRef: 'Al-i İmran 144',
  },
  'المفلح': {
    arabic: 'الْمُفْلِحُونَ',
    transliteration: 'El-Müflihûn',
    meaning: 'Kurtuluşa erenler',
    surahRef: 'Bakara 5',
  },
  'المصلح': {
    arabic: 'الْمُصْلِحِ',
    transliteration: 'El-Muslihi',
    meaning: 'Islah eden, düzelten kimse',
    surahRef: 'Bakara 220',
  },
  'فينصر': {
    arabic: 'فَيَنْصُرُ',
    transliteration: 'Fe-yansuru',
    meaning: 'Böylece yardım eder',
    surahRef: 'Rum 5',
  },
  'فيغفر': {
    arabic: 'فَيَغْفِرُ',
    transliteration: 'Fe-yagfiru',
    meaning: 'Böylece bağışlar, mağfiret eder',
    surahRef: 'Bakara 284',
  },
  'فيشكر': {
    arabic: 'فَيَشْكُرُ',
    transliteration: 'Fe-yeşkürü',
    meaning: 'Böylece şükreder',
    surahRef: 'Neml 40',
  },
  'فيرحم': {
    arabic: 'فَيَرْحَمُ',
    transliteration: 'Fe-yerhamü',
    meaning: 'Böylece merhamet buyurur',
    surahRef: 'Tevbe 71',
  },
  'فيفتح': {
    arabic: 'فَيَفْتَحُ',
    transliteration: 'Fe-yeftehu',
    meaning: 'Böylece fetheder, kapıyı açar',
    surahRef: 'Fatır 2',
  },
  'فيسجد': {
    arabic: 'فَيَسْجُدُ',
    transliteration: 'Fe-yescüdü',
    meaning: 'Böylece secdeye kapanır',
    surahRef: 'Sad 72',
  },
  'فيخلق': {
    arabic: 'فَيَخْلُقُ',
    transliteration: 'Fe-yahliku',
    meaning: 'Böylece yaratır',
    surahRef: 'Al-i İmran 59',
  },
  'فيحكم': {
    arabic: 'فَيَحْكُمُ',
    transliteration: 'Fe-yahkümü',
    meaning: 'Böylece hükmü tayin eder',
    surahRef: 'Hac 52',
  },
  'فينزل': {
    arabic: 'فَيُنَزِّلُ',
    transliteration: 'Fe-yünezzilü',
    meaning: 'Böylece gökten indirir',
    surahRef: 'Şuara 4',
  },
  'فيبصر': {
    arabic: 'فَيُبْصِرُ',
    transliteration: 'Fe-yubsiru',
    meaning: 'Böylece görür',
    surahRef: 'Kalem 5',
  },
  'فيسمع': {
    arabic: 'فَيَسْمَعُ',
    transliteration: 'Fe-yesma\'u',
    meaning: 'Böylece işitir',
    surahRef: 'Taha 46',
  },
  'فيضرب': {
    arabic: 'فَيَضْرِبُ',
    transliteration: 'Fe-yadribu',
    meaning: 'Böylece misali açıklar',
    surahRef: 'Ra\'d 17',
  },
  'تتفكر': {
    arabic: 'تَتَفَكَّرُونَ',
    transliteration: 'Tetefekkerûn',
    meaning: 'Derin derin düşünürsünüz',
    surahRef: 'Bakara 219',
  },
  'المنزل': {
    arabic: 'الْمُنْزَلِينَ',
    transliteration: 'El-Münzelîn',
    meaning: 'İndirilenler, konuk edilenler',
    surahRef: 'Al-i İmran 124',
  },
  'ليعلم': {
    arabic: 'لِيَعْلَمَ',
    transliteration: 'Li-ya\'leme',
    meaning: 'Bilsin diye, ortaya çıksın diye',
    surahRef: 'Al-i İmran 140',
  },
  'لينصر': {
    arabic: 'لِيَنْصُرَ',
    transliteration: 'Li-yansura',
    meaning: 'Yardım etsin, zafere ulaştırsın diye',
    surahRef: 'Al-i İmran 126',
  },
  'ليغفر': {
    arabic: 'لِيَغْفِرَ',
    transliteration: 'Li-yagfira',
    meaning: 'Bağışlasın diye',
    surahRef: 'Fetih 2',
  },
  'ليحكم': {
    arabic: 'لِيَحْكُمَ',
    transliteration: 'Li-yahküme',
    meaning: 'Aralarında hükmetsin diye',
    surahRef: 'Bakara 213',
  },
  'المعلم': {
    arabic: 'الْمُعَلَّمِ',
    transliteration: 'El-Mü\'allemi',
    meaning: 'Öğretilen, talim edilen',
    surahRef: 'Duhan 14',
  },
  'فيعبد': {
    arabic: 'فَيَعْبُدُ',
    transliteration: 'Fe-ya\'büdü',
    meaning: 'Böylece kulluk eder',
    surahRef: 'Bakara 133',
  },
  'فيكتب': {
    arabic: 'فَيَكْتُبُ',
    transliteration: 'Fe-yektübü',
    meaning: 'Böylece yazar, kaydeder',
    surahRef: 'Bakara 282',
  },
};

/**
 * Letter sound root determination for phonetic Turkish generation
 */
function getLetterPhoneticRoot(letter: ArabicLetter): { c: string; isBold: boolean } {
  const map: Record<string, string> = {
    'ا': '',
    'ب': 'b',
    'ت': 't',
    'ث': 's',
    'ج': 'c',
    'ح': 'h',
    'خ': 'h',
    'د': 'd',
    'ذ': 'z',
    'ر': 'r',
    'ز': 'z',
    'س': 's',
    'ش': 'ş',
    'ص': 's',
    'ض': 'd',
    'ط': 't',
    'ظ': 'z',
    'ع': '\'',
    'غ': 'g',
    'ف': 'f',
    'ق': 'k',
    'ك': 'k',
    'ل': 'l',
    'م': 'm',
    'ن': 'n',
    'و': 'v',
    'هـ': 'h',
    'لا': 'l',
    'ء': '\'',
    'ي': 'y',
  };
  const c = map[letter.char] ?? letter.nameTr.toLowerCase().slice(0, 1);
  return { c, isBold: letter.isBold };
}

/**
 * Generates a 5-letter combination from Row (L1) and Quad Column (L2, L3, L4, L5)
 */
export function getFiveLetterCombination(
  l1: ArabicLetter,
  quad: FourLetterQuad
): FiveLetterCombination {
  const l2 = quad.letter1;
  const l3 = quad.letter2;
  const l4 = quad.letter3;
  const l5 = quad.letter4;

  // Joined Arabic string
  let joinedArabic = `${l1.char}${l2.char}${l3.char}${l4.char}${l5.char}`;
  if (l1.char === 'ل' && l2.char === 'ا') {
    joinedArabic = `لا${l3.char}${l4.char}${l5.char}`;
  } else if (l2.char === 'ل' && l3.char === 'ا') {
    joinedArabic = `${l1.char}لا${l4.char}${l5.char}`;
  } else if (l3.char === 'ل' && l4.char === 'ا') {
    joinedArabic = `${l1.char}${l2.char}لا${l5.char}`;
  } else if (l4.char === 'ل' && l5.char === 'ا') {
    joinedArabic = `${l1.char}${l2.char}${l3.char}لا`;
  }

  // Connection analysis between 5 adjacent letters
  const l1ConnectsToL2 = l1.connectsNext && l1.char !== 'ء' && l1.char !== 'لا';
  const l2ConnectsToL3 = l2.connectsNext && l2.char !== 'ء' && l2.char !== 'لا';
  const l3ConnectsToL4 = l3.connectsNext && l3.char !== 'ء' && l3.char !== 'لا';
  const l4ConnectsToL5 = l5.connectsNext && l4.char !== 'ء' && l4.char !== 'لا';
  const fullyConnected = l1ConnectsToL2 && l2ConnectsToL3 && l3ConnectsToL4 && l4ConnectsToL5;

  let connectionRuleNote = '';
  if (fullyConnected) {
    connectionRuleNote = `5 harf de bitiştirilebilen harflerdir: "${l1.nameTr}" başta, "${l2.nameTr}", "${l3.nameTr}" ve "${l4.nameTr}" ortada, "${l5.nameTr}" sonda formuyla tam bir Kur'an kelime hattı oluşturur.`;
  } else {
    const brokenPoints: string[] = [];
    if (!l1ConnectsToL2) brokenPoints.push(`"${l1.nameTr}" kendinden sonrakine birleşmez`);
    if (!l2ConnectsToL3) brokenPoints.push(`"${l2.nameTr}" kendinden sonrakine birleşmez`);
    if (!l3ConnectsToL4) brokenPoints.push(`"${l3.nameTr}" kendinden sonrakine birleşmez`);
    if (!l4ConnectsToL5) brokenPoints.push(`"${l4.nameTr}" kendinden sonrakine birleşmez`);
    connectionRuleNote = `İmlâ Kuralı: ${brokenPoints.join(', ')}. Bu noktalarda harfler ayrık/bağımsız yazılarak Kur'an hattı muhafaza edilir.`;
  }

  // Phonetics
  const r1 = getLetterPhoneticRoot(l1);
  const r2 = getLetterPhoneticRoot(l2);
  const r3 = getLetterPhoneticRoot(l3);
  const r4 = getLetterPhoneticRoot(l4);
  const r5 = getLetterPhoneticRoot(l5);

  const v1 = r1.isBold ? 'a' : 'e';
  const v2_a = r2.isBold ? 'a' : 'e';
  const v3_a = r3.isBold ? 'a' : 'e';
  const v3_i = r3.isBold ? 'ı' : 'i';
  const v4_a = r4.isBold ? 'a' : 'e';
  const v5_u = r5.isBold ? 'u' : 'ü';
  const v5_a = r5.isBold ? 'a' : 'e';
  const v5_i = r5.isBold ? 'ı' : 'i';

  const c1 = r1.c;
  const c2 = r2.c;
  const c3 = r3.c;
  const c4 = r4.c;
  const c5 = r5.c;

  const transliterationRoot = `${c1}${v1}-${c2}${v2_a}-${c3}${v3_a}-${c4}${v4_a}-${c5}${v5_u}`.trim();

  // 8 Morphological Harakat Variations for 5-Letter Structures
  const basePent = (s1: string, s2: string, s3: string, s4: string, s5: string) => {
    return `${l1.char}${s1}${l2.char}${s2}${l3.char}${s3}${l4.char}${s4}${l5.char}${s5}`;
  };

  const variants: HarakatVariant[] = [
    {
      type: 'fatha',
      titleTr: '1. İftial / Başı Edatlı Muzari (فَيَفْعَلُ / يَتَفَعَّلُ)',
      arabicSign: 'ـَـ َـ ْـ َـ ُـ',
      arabicCombined: basePent(HARAKAT.FATHA, HARAKAT.FATHA, HARAKAT.SUKUN, HARAKAT.FATHA, HARAKAT.DAMMA),
      pronunciationTr: `${c1}${v1}-${c2}${v2_a}${c3}-${c4}${v4_a}${c5}${v5_u}`.trim(),
      description: 'Başına bağlaç (Fe/Ve) veya muzaraat harfi almış 5 harfli fiil kalıbı.',
      exampleContext: 'Örnek: فَيَعْلَمُ (Fe-ya\'lemü), فَيَفْتَحُ (Fe-yeftehu)',
    },
    {
      type: 'kasra',
      titleTr: '2. Harf-i Cerli İsm-i Mekan (بِالْمَفْعِلِ)',
      arabicSign: 'ـِـ ْـ َـ ِـ ِـ',
      arabicCombined: basePent(HARAKAT.KASRA, HARAKAT.SUKUN, HARAKAT.FATHA, HARAKAT.KASRA, HARAKAT.KASRA),
      pronunciationTr: `${c1}i-${c2}${v2_a}${c3}-${c4}${v3_i}${c5}i`.trim(),
      description: 'Başına cer edatı (Bi/Li) almış mecrur 5 harfli mekan ve durum kelimesi.',
      exampleContext: 'Örnek: بِالْمَسْجِدِ (Bil-mescidi), لِيَعْلَمَ (Li-ya\'leme)',
    },
    {
      type: 'damma',
      titleTr: '3. Harf-i Tarifli İsm-i Fail (الْمُفْعِلُ)',
      arabicSign: 'ـَـ ْـ ُـ ِـ ُـ',
      arabicCombined: basePent(HARAKAT.FATHA, HARAKAT.SUKUN, HARAKAT.DAMMA, HARAKAT.KASRA, HARAKAT.DAMMA),
      pronunciationTr: `${c1}${v1}l-${c3}${v5_u}${c4}-${c4}${v3_i}${c5}${v5_u}`.trim(),
      description: 'El takısı almış belirlilik bildiren fail ve sıfat kalıbı.',
      exampleContext: 'Örnek: الْمُسْلِمُ (El-Müslimü), الْمُحْسِنُ (El-Muhsinü)',
    },
    {
      type: 'sukun',
      titleTr: '4. İstif\'al / İftial Cezimli Mastar (مُسْتَفْعَلٌ)',
      arabicSign: 'ـُـ ْـ َـ ْـ ٌـ',
      arabicCombined: basePent(HARAKAT.DAMMA, HARAKAT.SUKUN, HARAKAT.FATHA, HARAKAT.SUKUN, HARAKAT.DAMMATAN),
      pronunciationTr: `${c1}${v5_u}${c2}-${c3}${v3_a}${c4}-${c5}${v5_u}n`.trim(),
      description: 'Çift sakin hece içeren 5 harfli mefhum ve mastar vezni.',
      exampleContext: 'Örnek: مُسْتَقَرٌّ (Müstekarrun), مُسْتَقِيمٌ (Müstekîmün)',
    },
    {
      type: 'shaddah',
      titleTr: '5. Tefaul / Şeddeli Yoğunluk Vezni (يَتَفَعَّلُ)',
      arabicSign: 'ـَـ َـ َـ َّـ ُـ',
      arabicCombined: basePent(HARAKAT.FATHA, HARAKAT.FATHA, HARAKAT.FATHA, `${HARAKAT.SHADDAH}${HARAKAT.FATHA}`, HARAKAT.DAMMA),
      pronunciationTr: `${c1}${v1}-${c2}${v2_a}-${c3}${v3_a}${c4}-${c4}${v4_a}${c5}${v5_u}`.trim(),
      description: '4. harfi şeddeli okunan, eylemin derinleşmesini ve sürekliliğini anlatan vezin.',
      exampleContext: 'Örnek: يَتَفَكَّرُ (Yetefekkeru), يُطَهِّرُ (Yütahhiru)',
    },
    {
      type: 'tanwinFatha',
      titleTr: '6. Mansub İki Üstün Tenvin (الْمَفْعَلًا)',
      arabicSign: 'ـَـ ْـ َـ َـ ًـا',
      arabicCombined: l5.char === 'ء' || l5.char === 'ة'
        ? basePent(HARAKAT.FATHA, HARAKAT.SUKUN, HARAKAT.FATHA, HARAKAT.FATHA, HARAKAT.FATHATAN)
        : `${basePent(HARAKAT.FATHA, HARAKAT.SUKUN, HARAKAT.FATHA, HARAKAT.FATHA, HARAKAT.FATHATAN)}ا`,
      pronunciationTr: `${c1}${v1}${c2}-${c3}${v3_a}${c4}-${c5}${v5_a}n`.trim(),
      description: '5 harfli kelimelerin meful durumundaki tenvinli son eki.',
      exampleContext: 'Örnek: مُنْزَلًا (Münzelen), مَرْحَمَةً (Merhameten)',
    },
    {
      type: 'tanwinKasra',
      titleTr: '7. Mecrur İki Esre Tenvin (مُفْتَعَلٍ)',
      arabicSign: 'ـُـ ْـ َـ ِـ ٍـ',
      arabicCombined: basePent(HARAKAT.DAMMA, HARAKAT.SUKUN, HARAKAT.FATHA, HARAKAT.KASRA, HARAKAT.KASRATAN),
      pronunciationTr: `${c1}${v5_u}${c2}-${c3}${v3_a}${c4}-${c5}${v5_i}n`.trim(),
      description: '5 harfli isim ve sıfatların iki esreli tamlama hali.',
      exampleContext: 'Örnek: مَسْجِدٍ (Mescidin), مَقَامٍ (Makâmin)',
    },
    {
      type: 'tanwinDamma',
      titleTr: '8. Merfu İki Ötre Tenvin (مُفْتَعَلٌ)',
      arabicSign: 'ـُـ ْـ َـ ِـ ٌـ',
      arabicCombined: basePent(HARAKAT.DAMMA, HARAKAT.SUKUN, HARAKAT.FATHA, HARAKAT.KASRA, HARAKAT.DAMMATAN),
      pronunciationTr: `${c1}${v5_u}${c2}-${c3}${v3_a}${c4}-${c5}${v5_u}n`.trim(),
      description: '5 harfli özne veya yüklem durumundaki tam Kur\'an kelimelerinin son hali.',
      exampleContext: 'Örnek: مُسْلِمٌ (Müslimün), مُحَمَّدٌ (Muhammedün)',
    },
  ];

  // Match with dictionary
  const rawKey = `${l1.char}${l2.char}${l3.char}${l4.char}${l5.char}`;
  const quranicExample = QURANIC_FIVE_LETTER_DICT[rawKey];

  return {
    id: `${l1.char}-${quad.id}`,
    letter1: l1,
    quad,
    letters: [l1, l2, l3, l4, l5],
    joinedArabic,
    transliterationRoot,
    connectionRuleNote,
    connectionStatus: {
      l1ConnectsToL2,
      l2ConnectsToL3,
      l3ConnectsToL4,
      l4ConnectsToL5,
      fullyConnected,
    },
    variants,
    quranicExample,
  };
}
