import { ArabicLetter, TwoLetterPair, ThreeLetterCombination, HarakatVariant, QuranicWordExample } from '../types/matrix';
import { HARAKAT } from './arabicCombinations';

// Curated Quranic 3-letter root dictionary
const QURANIC_ROOTS_DICT: Record<string, QuranicWordExample> = {
  'كتب': {
    arabic: 'كَتَبَ',
    transliteration: 'Ketebe',
    meaning: 'Yazdı, takdir ve farz kıldı',
    surahRef: 'Bakara 183',
  },
  'بتر': {
    arabic: 'الْأَبْتَرُ',
    transliteration: 'El-Ebter',
    meaning: 'Soyu kesik, bereketsiz',
    surahRef: 'Kevser 3',
  },
  'فتر': {
    arabic: 'فَتْرَةٍ',
    transliteration: 'Fetratin',
    meaning: 'Peygambersiz geçen fetret dönemi',
    surahRef: 'Maide 19',
  },
  'خلق': {
    arabic: 'خَلَقَ',
    transliteration: 'Haleka',
    meaning: 'Yoktan var etti, yarattı',
    surahRef: 'Alak 1',
  },
  'علق': {
    arabic: 'عَلَقٍ',
    transliteration: 'Alak',
    meaning: 'Tutunan hücre öbeği, embriyo',
    surahRef: 'Alak 2',
  },
  'علم': {
    arabic: 'عَلِمَ',
    transliteration: 'Alime',
    meaning: 'Bildi, ilim sahibi oldu',
    surahRef: 'Bakara 31',
  },
  'سلم': {
    arabic: 'سَلِمَ / سَلَامٌ',
    transliteration: 'Selâmün',
    meaning: 'Esenlik, barış, selam',
    surahRef: 'Yasin 58',
  },
  'نصر': {
    arabic: 'نَصَرَ',
    transliteration: 'Nasara',
    meaning: 'Yardım etti, zafere ulaştırdı',
    surahRef: 'Nasr 1',
  },
  'بصر': {
    arabic: 'بَصِيرٌ',
    transliteration: 'Basîrun',
    meaning: 'Hakkıyla gören',
    surahRef: 'İsra 1',
  },
  'غفر': {
    arabic: 'غَفَرَ',
    transliteration: 'Gafara',
    meaning: 'Bağışladı, mağfiret etti',
    surahRef: 'Bakara 285',
  },
  'كفر': {
    arabic: 'كَفَرَ',
    transliteration: 'Kefere',
    meaning: 'İnkar etti, örttü',
    surahRef: 'Bakara 6',
  },
  'سجد': {
    arabic: 'سَجَدَ',
    transliteration: 'Secede',
    meaning: 'Secde etti, boyun eğdi',
    surahRef: 'A\'raf 11',
  },
  'وجد': {
    arabic: 'وَجَدَ',
    transliteration: 'Vecede',
    meaning: 'Buldu',
    surahRef: 'Duha 6',
  },
  'رحم': {
    arabic: 'رَحِمَ',
    transliteration: 'Rahime',
    meaning: 'Merhamet etti, acıdı',
    surahRef: 'Fatiha 1',
  },
  'فهم': {
    arabic: 'فَهَّمْنَا',
    transliteration: 'Fehhemnâ',
    meaning: 'Anlattık, kavrattık',
    surahRef: 'Enbiya 79',
  },
  'حكم': {
    arabic: 'حَكَمَ',
    transliteration: 'Hakeme',
    meaning: 'Hükmetti, adaletle karar verdi',
    surahRef: 'Nisa 58',
  },
  'صبر': {
    arabic: 'صَبَرَ',
    transliteration: 'Sabara',
    meaning: 'Sabretti, direnç gösterdi',
    surahRef: 'Bakara 153',
  },
  'كبر': {
    arabic: 'كَبِيرٌ',
    transliteration: 'Kebîrun',
    meaning: 'Büyük, yüce',
    surahRef: 'Hac 62',
  },
  'جمع': {
    arabic: 'جَمَعَ',
    transliteration: 'Ceme\'a',
    meaning: 'Topladı, bir araya getirdi',
    surahRef: 'Hümeze 2',
  },
  'سمع': {
    arabic: 'سَمِعَ',
    transliteration: 'Semi\'a',
    meaning: 'İşitti, duydu',
    surahRef: 'Bakara 181',
  },
  'ترك': {
    arabic: 'تَرَكَ',
    transliteration: 'Tereke',
    meaning: 'Bıraktı, terk etti',
    surahRef: 'Bakara 17',
  },
  'ضرب': {
    arabic: 'ضَرَبَ',
    transliteration: 'Darabe',
    meaning: 'Örnek verdi, vurdu',
    surahRef: 'İbrahim 24',
  },
  'قرب': {
    arabic: 'قَرِيبٌ',
    transliteration: 'Karîbün',
    meaning: 'Yakın olan',
    surahRef: 'Bakara 186',
  },
  'شهد': {
    arabic: 'شَهِدَ',
    transliteration: 'Şehide',
    meaning: 'Şahitlik etti, gördü',
    surahRef: 'Al-i İmran 18',
  },
  'جهد': {
    arabic: 'جَاهَدَ',
    transliteration: 'Câhede',
    meaning: 'Gayret sarf etti, cihat etti',
    surahRef: 'Tevbe 73',
  },
  'عدل': {
    arabic: 'عَدَلَ',
    transliteration: 'Adele',
    meaning: 'Adaletle davrandı, denk kıldı',
    surahRef: 'İnfitar 7',
  },
  'بدل': {
    arabic: 'بَدَّلَ',
    transliteration: 'Beddele',
    meaning: 'Değiştirdi',
    surahRef: 'Bakara 59',
  },
  'شكر': {
    arabic: 'شَكَرَ',
    transliteration: 'Şekera',
    meaning: 'Şükretti, teşekkür etti',
    surahRef: 'Bakara 158',
  },
  'ذكر': {
    arabic: 'ذَكَرَ',
    transliteration: 'Zekera',
    meaning: 'Zikretti, andı, hatırladı',
    surahRef: 'Bakara 152',
  },
  'فرح': {
    arabic: 'فَرِحَ',
    transliteration: 'Fariha',
    meaning: 'Sevindi, neşelendi',
    surahRef: 'Rum 4',
  },
  'شرح': {
    arabic: 'شَرَحَ',
    transliteration: 'Şeraha',
    meaning: 'Açtı, göğsü genişletti',
    surahRef: 'İnşirah 1',
  },
  'وعد': {
    arabic: 'وَعَدَ',
    transliteration: 'Ve\'ade',
    meaning: 'Söz verdi, vadetti',
    surahRef: 'Tevbe 72',
  },
  'نفع': {
    arabic: 'نَفَعَ',
    transliteration: 'Nefa\'a',
    meaning: 'Fayda verdi, yarar sağladı',
    surahRef: 'Yunus 18',
  },
  'رفع': {
    arabic: 'رَفَعَ',
    transliteration: 'Refa\'a',
    meaning: 'Yükseltti, yüceltti',
    surahRef: 'İnşirah 4',
  },
  'نفق': {
    arabic: 'أَنْفَقَ',
    transliteration: 'Enfeka',
    meaning: 'Harcadı, infak etti',
    surahRef: 'Bakara 3',
  },
  'قبل': {
    arabic: 'قَبِلَ',
    transliteration: 'Kabile',
    meaning: 'Kabul etti, razı oldu',
    surahRef: 'Al-i İmran 37',
  },
  'ملك': {
    arabic: 'مَلَكَ',
    transliteration: 'Meleke',
    meaning: 'Sahip oldu, hükümdarlık etti',
    surahRef: 'Fatiha 4',
  },
  'حمد': {
    arabic: 'حَمِدَ',
    transliteration: 'Hamede',
    meaning: 'Şükretti, övdü',
    surahRef: 'Fatiha 2',
  },
  'نزل': {
    arabic: 'نَزَلَ',
    transliteration: 'Nezele',
    meaning: 'İndi, nüzul etti',
    surahRef: 'Şuara 193',
  },
  'فرق': {
    arabic: 'فَرَقَ',
    transliteration: 'Faraka',
    meaning: 'Ayırdı, furkan kıldı',
    surahRef: 'Furkan 1',
  },
  'كثر': {
    arabic: 'كَثُرَ',
    transliteration: 'Kesura',
    meaning: 'Çoğaldı, bereketlendi',
    surahRef: 'Nisa 7',
  },
  'خلف': {
    arabic: 'خَلَفَ',
    transliteration: 'Halefe',
    meaning: 'Ardından geldi, halef oldu',
    surahRef: 'A\'raf 169',
  },
  'طهر': {
    arabic: 'طَهُرَ',
    transliteration: 'Tahura',
    meaning: 'Tertemiz oldu, arındı',
    surahRef: 'Bakara 222',
  },
  'عقل': {
    arabic: 'عَقَلَ',
    transliteration: 'Akale',
    meaning: 'Akletti, kavradı',
    surahRef: 'Bakara 44',
  },
};

/**
 * Phonetic helper for Turkish vocalization
 */
function getConsonantAndBoldness(char: string, nameTr: string, isBold: boolean): { c: string; isBold: boolean } {
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
  const c = map[char] ?? nameTr.toLowerCase().slice(0, 1);
  return { c, isBold };
}

/**
 * Generates a 3-letter combination from Row (L1) and Column (L2, L3)
 */
export function getThreeLetterCombination(l1: ArabicLetter, pair: TwoLetterPair): ThreeLetterCombination {
  const l2 = pair.letter1;
  const l3 = pair.letter2;

  // Joined Arabic representation
  let joinedArabic = `${l1.char}${l2.char}${l3.char}`;
  if (l1.char === 'ل' && l2.char === 'ا') {
    joinedArabic = `لا${l3.char}`;
  } else if (l2.char === 'ل' && l3.char === 'ا') {
    joinedArabic = `${l1.char}لا`;
  }

  // Connection analysis
  const l1ConnectsToL2 = l1.connectsNext && l1.char !== 'ء' && l1.char !== 'لا';
  const l2ConnectsToL3 = l2.connectsNext && l2.char !== 'ء' && l2.char !== 'لا';
  const fullyConnected = l1ConnectsToL2 && l2ConnectsToL3;

  let connectionRuleNote = '';
  if (fullyConnected) {
    connectionRuleNote = `Tüm harfler bitişiktir: "${l1.nameTr}" başta, "${l2.nameTr}" ortada ve "${l3.nameTr}" sonda formuyla kesintisiz bir hat oluşturur.`;
  } else if (!l1ConnectsToL2 && l2ConnectsToL3) {
    connectionRuleNote = `"${l1.nameTr}" harfi kendinden sonrakine BİRLEŞMEZ kuralı gereği yalnız kalır; "${l2.nameTr}" harfi ise kelime başı formuyla "${l3.nameTr}" harfine bağlanır.`;
  } else if (l1ConnectsToL2 && !l2ConnectsToL3) {
    connectionRuleNote = `"${l1.nameTr}" ile "${l2.nameTr}" birbirine bağlanır; ancak "${l2.nameTr}" kendinden sonrakine birleşmediği için "${l3.nameTr}" ayrı yazılır.`;
  } else {
    connectionRuleNote = `Hem "${l1.nameTr}" hem "${l2.nameTr}" kendinden sonrakine birleşmeyen harfler olduğu için 3 harf de bağımsız (ayrık) yazılır.`;
  }

  // Phonetics
  const r1 = getConsonantAndBoldness(l1.char, l1.nameTr, l1.isBold);
  const r2 = getConsonantAndBoldness(l2.char, l2.nameTr, l2.isBold);
  const r3 = getConsonantAndBoldness(l3.char, l3.nameTr, l3.isBold);

  const v1 = r1.isBold ? 'a' : 'e';
  const v2_a = r2.isBold ? 'a' : 'e';
  const v2_i = r2.isBold ? 'ı' : 'i';
  const v2_u = r2.isBold ? 'u' : 'ü';
  const v3_a = r3.isBold ? 'a' : 'e';

  const c1 = r1.c;
  const c2 = r2.c;
  const c3 = r3.c;

  const transliterationRoot = `${c1}${v1}-${c2}${v2_a}-${c3}${v3_a}`.trim();

  // 8 Harakat Variants
  const baseTrio = (s1: string, s2: string, s3: string) => {
    return `${l1.char}${s1}${l2.char}${s2}${l3.char}${s3}`;
  };

  const variants: HarakatVariant[] = [
    {
      type: 'fatha',
      titleTr: '1. Üstünlü Hali (Mazi Fiil - فَعَلَ)',
      arabicSign: 'ـَـ َـ َـ',
      arabicCombined: baseTrio(HARAKAT.FATHA, HARAKAT.FATHA, HARAKAT.FATHA),
      pronunciationTr: `${c1}${v1}-${c2}${v2_a}-${c3}${v3_a}`.trim(),
      description: 'Klasik mazi (geçmiş zaman) fiil kalıbı. Üç harf de üstün harekesi alır.',
      exampleContext: 'Örnek: كَتَبَ (Ketebe), خَلَقَ (Haleka)',
    },
    {
      type: 'kasra',
      titleTr: '2. Esreli Hali (فَعِلَ Kalıbı)',
      arabicSign: 'ـَـ ِـ َـ',
      arabicCombined: baseTrio(HARAKAT.FATHA, HARAKAT.KASRA, HARAKAT.FATHA),
      pronunciationTr: `${c1}${v1}-${c2}${v2_i}-${c3}${v3_a}`.trim(),
      description: 'İkinci (orta) harf esre alır. İç durum veya bilgi fiillerinde sıkça kullanılır.',
      exampleContext: 'Örnek: عَلِمَ (Alime), سَمِعَ (Semi\'a)',
    },
    {
      type: 'damma',
      titleTr: '3. Ötreli Hali (Meçhul Fiil - فُعِلَ)',
      arabicSign: 'ـُـ ِـ َـ',
      arabicCombined: baseTrio(HARAKAT.DAMMA, HARAKAT.KASRA, HARAKAT.FATHA),
      pronunciationTr: `${c1}${v2_u}-${c2}${v2_i}-${c3}${v3_a}`.trim(),
      description: 'Klasik meçhul (edilgen) fiil vezni. İlk harf ötre, orta harf esre alır.',
      exampleContext: 'Örnek: كُتِبَ (Kütibe - Farz kılındı), خُلِقَ (Hulika)',
    },
    {
      type: 'sukun',
      titleTr: '4. Cezimli Hali (Masdar - فَعْلٌ)',
      arabicSign: 'ـَـ ْـ ٌـ',
      arabicCombined: baseTrio(HARAKAT.FATHA, HARAKAT.SUKUN, HARAKAT.DAMMATAN),
      pronunciationTr: `${c1}${v1}${c2}-${c3}${v3_a}n`.trim(),
      description: 'Orta harf cezimli okunarak kapalı kök hece ve mastar ismi meydana getirir.',
      exampleContext: 'Örnek: نَصْرٌ (Nasrun), فَتْحٌ (Fethun), كَتْبٌ (Ketbün)',
    },
    {
      type: 'shaddah',
      titleTr: '5. Şeddeli Hali (Tef\'îl Babı - فَعَّلَ)',
      arabicSign: 'ـَـ َّـ َـ',
      arabicCombined: baseTrio(HARAKAT.FATHA, `${HARAKAT.SHADDAH}${HARAKAT.FATHA}`, HARAKAT.FATHA),
      pronunciationTr: `${c1}${v1}${c2}-${c2}${v2_a}-${c3}${v3_a}`.trim(),
      description: 'Orta harf şeddelenerek fiile yoğunluk, süreklilik veya geçişlilik kazandırılır.',
      exampleContext: 'Örnek: عَلَّمَ (Alleme - Öğretti), بَدَّلَ (Beddele)',
    },
    {
      type: 'tanwinFatha',
      titleTr: '6. İki Üstünlü Tenvin (فَعَلًا)',
      arabicSign: 'ـَـ َـ ًـا',
      arabicCombined: l3.char === 'ء' || l3.char === 'ة'
        ? baseTrio(HARAKAT.FATHA, HARAKAT.FATHA, HARAKAT.FATHATAN)
        : `${baseTrio(HARAKAT.FATHA, HARAKAT.FATHA, HARAKAT.FATHATAN)}ا`,
      pronunciationTr: `${c1}${v1}-${c2}${v2_a}-${c3}${v3_a}n`.trim(),
      description: 'İsim ve sıfatların sonuna gelen üstün tenvin; meful veya hal anlamı katar.',
      exampleContext: 'Örnek: عَمَلًا (Amelen), شُكْرًا (Şükran)',
    },
    {
      type: 'tanwinKasra',
      titleTr: '7. İki Esreli Tenvin (فَعَلٍ)',
      arabicSign: 'ـَـ َـ ٍـ',
      arabicCombined: baseTrio(HARAKAT.FATHA, HARAKAT.FATHA, HARAKAT.KASRATAN),
      pronunciationTr: `${c1}${v1}-${c2}${v2_a}-${c3}${v2_i}n`.trim(),
      description: 'Mecrur (tamlanan veya harf-i cer sonrası) isimlerin sonuna gelen çift esredir.',
      exampleContext: 'Örnek: قَلَمٍ (Kalemin), كِتَابٍ (Kitâbin)',
    },
    {
      type: 'tanwinDamma',
      titleTr: '8. İki Ötreli Tenvin (فَعَلٌ)',
      arabicSign: 'ـَـ َـ ٌـ',
      arabicCombined: baseTrio(HARAKAT.FATHA, HARAKAT.FATHA, HARAKAT.DAMMATAN),
      pronunciationTr: `${c1}${v1}-${c2}${v2_a}-${c3}${v2_u}n`.trim(),
      description: 'Merfu (özne veya yüklem durumundaki) kelimelerin sonuna gelen çift ötredir.',
      exampleContext: 'Örnek: رَجُلٌ (Racülün), قَلَمٌ (Kalemün)',
    },
  ];

  // Check if there is an exact Quranic word in the dictionary
  const rawKey = `${l1.char}${l2.char}${l3.char}`;
  const quranicExample = QURANIC_ROOTS_DICT[rawKey];

  return {
    id: `${l1.char}-${pair.id}`,
    letter1: l1,
    pair,
    letters: [l1, l2, l3],
    joinedArabic,
    transliterationRoot,
    connectionRuleNote,
    connectionStatus: {
      l1ConnectsToL2,
      l2ConnectsToL3,
      fullyConnected,
    },
    variants,
    quranicExample,
  };
}
