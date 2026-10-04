import { ArabicLetter, FiveLetterQuintet, AdvancedWordCombination, HarakatVariant, QuranicWordExample } from '../types/matrix';
import { HARAKAT } from './arabicCombinations';

// Curated dictionary for advanced / long Quranic words (6 letters and full structures)
const QURANIC_ADVANCED_DICT: Record<string, QuranicWordExample> = {
  'بالمسجد': {
    arabic: 'بِالْمَسْجِدِ',
    transliteration: 'Bil-Mescidi',
    meaning: 'Mescidde, mescit dahilinde',
    surahRef: 'Bakara 187',
  },
  'والمسجد': {
    arabic: 'وَالْمَسْجِدِ',
    transliteration: 'Vel-Mescid-il-Harâm',
    meaning: 'Ve Mescid-i Haram',
    surahRef: 'Bakara 217',
  },
  'بالمسلم': {
    arabic: 'بِالْمُسْلِمِينَ',
    transliteration: 'Bil-Müslimîn',
    meaning: 'Müslümanlar hakkında, Müslümanlarla',
    surahRef: 'Kalem 35',
  },
  'والمسلم': {
    arabic: 'وَالْمُسْلِمُونَ',
    transliteration: 'Vel-Müslimûn',
    meaning: 'Ve Müslüman olan kimseler',
    surahRef: 'Al-i İmran 64',
  },
  'بالرحمن': {
    arabic: 'بِالرَّحْمَٰنِ',
    transliteration: 'Bir-Rahmân',
    meaning: 'Sonsuz merhamet sahibi olan Rahman ile',
    surahRef: 'Mülk 20',
  },
  'والرحمن': {
    arabic: 'وَالرَّحْمَٰنُ',
    transliteration: 'Ver-Rahmân',
    meaning: 'Ve Rahman olan Allah',
    surahRef: 'Enbiya 112',
  },
  'يستغفر': {
    arabic: 'يَسْتَغْفِرُ',
    transliteration: 'Yestagfiru',
    meaning: 'Allah\'tan bağışlanma diler',
    surahRef: 'Nisa 110',
  },
  'تستغفر': {
    arabic: 'تَسْتَغْفِرْ',
    transliteration: 'Testagfir',
    meaning: 'Onlar için bağışlanma dilesen de',
    surahRef: 'Tevbe 80',
  },
  'أستغفر': {
    arabic: 'أَسْتَغْفِرُ',
    transliteration: 'Estagfiru',
    meaning: 'Bağışlanma dilerim (İstiğfar)',
    surahRef: 'Hud 90',
  },
  'المستقيم': {
    arabic: 'الْمُسْتَقِيمَ',
    transliteration: 'El-Müstekîm',
    meaning: 'Dosdoğru olan hidayet yolu',
    surahRef: 'Fatiha 6',
  },
  'بالمستقيم': {
    arabic: 'بِالْمُسْتَقِيمِ',
    transliteration: 'Bil-Müstekîm',
    meaning: 'Dosdoğru olan ölçüyle',
    surahRef: 'İsra 35',
  },
  'يستبشر': {
    arabic: 'يَسْتَبْشِرُونَ',
    transliteration: 'Yestebşirûn',
    meaning: 'Müjdelenip birbirlerine sevinirler',
    surahRef: 'Al-i İmran 170',
  },
  'والمؤمن': {
    arabic: 'وَالْمُؤْمِنُونَ',
    transliteration: 'Vel-Mü\'minûn',
    meaning: 'Ve gönülden inanan müminler',
    surahRef: 'Tevbe 71',
  },
  'بالمؤمن': {
    arabic: 'بِالْمُؤْمِنِينَ',
    transliteration: 'Bil-Mü\'minîn',
    meaning: 'Müminlere karşı pek şefkatli',
    surahRef: 'Tevbe 128',
  },
  'والمفلح': {
    arabic: 'وَالْمُفْلِحُونَ',
    transliteration: 'Vel-Müflihûn',
    meaning: 'Ve kurtuluşa erecek olanlar',
    surahRef: 'A\'raf 157',
  },
  'بالمحسن': {
    arabic: 'بِالْمُحْسِنِينَ',
    transliteration: 'Bil-Muhsinîn',
    meaning: 'İhsan sahipleriyle, iyilik edenlerle',
    surahRef: 'Ankebut 69',
  },
  'ينفقون': {
    arabic: 'يُنْفِقُونَ',
    transliteration: 'Yünfikûn',
    meaning: 'Allah yolunda infak ederler',
    surahRef: 'Bakara 3',
  },
  'تنفقون': {
    arabic: 'تُنْفِقُونَ',
    transliteration: 'Tünfikûn',
    meaning: 'Hayırdan infak edersiniz',
    surahRef: 'Al-i İmran 92',
  },
  'يعملون': {
    arabic: 'يَعْمَلُونَ',
    transliteration: 'Ya\'melûn',
    meaning: 'Amel ederler, işlerler',
    surahRef: 'Bakara 74',
  },
  'يعبدون': {
    arabic: 'يَعْبُدُونَ',
    transliteration: 'Ya\'büdûn',
    meaning: 'Kulluk ederler, ibadet ederler',
    surahRef: 'Enbiya 19',
  },
  'فسيكفي': {
    arabic: 'فَسَيَكْفِيكَهُمُ',
    transliteration: 'Fe-seyekfîkehüm',
    meaning: 'Onlara karşı Allah sana yetecektir',
    surahRef: 'Bakara 137',
  },
  'يتوكل': {
    arabic: 'يَتَوَكَّلْ',
    transliteration: 'Yetewekkel',
    meaning: 'Allah\'a tevekkül eder, güvenir',
    surahRef: 'Talak 3',
  },
  'فتوكل': {
    arabic: 'فَتَوَكَّلْ',
    transliteration: 'Fe-tewekkel',
    meaning: 'Artık Allah\'a tevekkül et!',
    surahRef: 'Neml 79',
  },
  'الكتاب': {
    arabic: 'الْكِتَابُ',
    transliteration: 'El-Kitâb',
    meaning: 'Kitap (Kur\'an-ı Kerim)',
    surahRef: 'Bakara 2',
  },
  'بالكتاب': {
    arabic: 'بِالْكِتَابِ',
    transliteration: 'Bil-Kitâbi',
    meaning: 'Kitap ile, vahyedilen ile',
    surahRef: 'Bakara 176',
  },
  'السماء': {
    arabic: 'السَّمَاءِ',
    transliteration: 'Es-Semâ\'i',
    meaning: 'Gökyüzü, sema',
    surahRef: 'Bakara 22',
  },
  'بالحق': {
    arabic: 'بِالْحَقِّ',
    transliteration: 'Bil-Hakkı',
    meaning: 'Hak ile, mutlak gerçekle',
    surahRef: 'Bakara 213',
  },
  'العزيز': {
    arabic: 'الْعَزِيزُ',
    transliteration: 'El-Azîz',
    meaning: 'Kudreti daima galip olan',
    surahRef: 'Haşr 23',
  },
  'الحكيم': {
    arabic: 'الْحَكِيمُ',
    transliteration: 'El-Hakîm',
    meaning: 'Her işi hikmetli olan',
    surahRef: 'Bakara 32',
  },
  'الغفور': {
    arabic: 'الْغَفُورُ',
    transliteration: 'El-Gafûr',
    meaning: 'Çok bağışlayan',
    surahRef: 'Buruc 14',
  },
  'يسبحون': {
    arabic: 'يُسَبِّحُونَ',
    transliteration: 'Yüsebbihûn',
    meaning: 'Gece gündüz tesbih ederler',
    surahRef: 'Enbiya 20',
  },
};

/**
 * Phonetics helper
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
 * Generates an advanced word combination from Row (L1) and Quintet Column (L2, L3, L4, L5, L6)
 */
export function getAdvancedWordCombination(
  l1: ArabicLetter,
  quintet: FiveLetterQuintet
): AdvancedWordCombination {
  const l2 = quintet.letter1;
  const l3 = quintet.letter2;
  const l4 = quintet.letter3;
  const l5 = quintet.letter4;
  const l6 = quintet.letter5;

  // Joined Arabic representation
  let joinedArabic = `${l1.char}${l2.char}${l3.char}${l4.char}${l5.char}${l6.char}`;
  if (l1.char === 'ل' && l2.char === 'ا') {
    joinedArabic = `لا${l3.char}${l4.char}${l5.char}${l6.char}`;
  } else if (l2.char === 'ل' && l3.char === 'ا') {
    joinedArabic = `${l1.char}لا${l4.char}${l5.char}${l6.char}`;
  }

  // Connection analysis between 6 adjacent letters
  const l1ConnectsToL2 = l1.connectsNext && l1.char !== 'ء' && l1.char !== 'لا';
  const l2ConnectsToL3 = l2.connectsNext && l2.char !== 'ء' && l2.char !== 'لا';
  const l3ConnectsToL4 = l3.connectsNext && l3.char !== 'ء' && l3.char !== 'لا';
  const l4ConnectsToL5 = l4.connectsNext && l4.char !== 'ء' && l4.char !== 'لا';
  const l5ConnectsToL6 = l5.connectsNext && l5.char !== 'ء' && l5.char !== 'لا';
  const fullyConnected =
    l1ConnectsToL2 && l2ConnectsToL3 && l3ConnectsToL4 && l4ConnectsToL5 && l5ConnectsToL6;

  let connectionRuleNote = '';
  if (fullyConnected) {
    connectionRuleNote = `Tüm harfler bitişiktir: 6 harfli kelime gövdesi kesintisiz tek bir Kur'ani hat oluşturur.`;
  } else {
    const brokenPoints: string[] = [];
    if (!l1ConnectsToL2) brokenPoints.push(`"${l1.nameTr}" sonrasına bağlanmaz`);
    if (!l2ConnectsToL3) brokenPoints.push(`"${l2.nameTr}" sonrasına bağlanmaz`);
    if (!l3ConnectsToL4) brokenPoints.push(`"${l3.nameTr}" sonrasına bağlanmaz`);
    if (!l4ConnectsToL5) brokenPoints.push(`"${l4.nameTr}" sonrasına bağlanmaz`);
    if (!l5ConnectsToL6) brokenPoints.push(`"${l5.nameTr}" sonrasına bağlanmaz`);
    connectionRuleNote = `İmlâ Kuralı: ${brokenPoints.join(', ')}. Kur'an hattında bu noktalarda harfler ayrık yazılarak kelime estetiği korunur.`;
  }

  // Phonetics
  const r1 = getLetterPhoneticRoot(l1);
  const r2 = getLetterPhoneticRoot(l2);
  const r3 = getLetterPhoneticRoot(l3);
  const r4 = getLetterPhoneticRoot(l4);
  const r5 = getLetterPhoneticRoot(l5);
  const r6 = getLetterPhoneticRoot(l6);

  const v1 = r1.isBold ? 'a' : 'e';
  const v2 = r2.isBold ? 'a' : 'e';
  const v3 = r3.isBold ? 'a' : 'e';
  const v4 = r4.isBold ? 'a' : 'e';
  const v5 = r5.isBold ? 'a' : 'e';
  const v6 = r6.isBold ? 'u' : 'ü';

  const transliterationRoot = `${r1.c}${v1}-${r2.c}${v2}-${r3.c}${v3}-${r4.c}${v4}-${r5.c}${v5}-${r6.c}${v6}`.trim();

  // 8 Morphological Harakat Variations for Advanced Quranic Word Structures
  const baseHex = (s1: string, s2: string, s3: string, s4: string, s5: string, s6: string) => {
    return `${l1.char}${s1}${l2.char}${s2}${l3.char}${s3}${l4.char}${s4}${l5.char}${s5}${l6.char}${s6}`;
  };

  const variants: HarakatVariant[] = [
    {
      type: 'fatha',
      titleTr: '1. Edatlı İftial / Muzari Kalıp (وَالْمُفْتَعَلُ / فَيَفْعَلُ)',
      arabicSign: 'ـَـ ْـ ُـ ْـ َـ ُـ',
      arabicCombined: baseHex(HARAKAT.FATHA, HARAKAT.SUKUN, HARAKAT.DAMMA, HARAKAT.SUKUN, HARAKAT.FATHA, HARAKAT.DAMMA),
      pronunciationTr: `${r1.c}${v1}l-${r3.c}ü${r4.c}-${r5.c}${v5}${r6.c}ü`.trim(),
      description: 'Bağlaç ve harf-i tarif almış tam müteaddi Kur\'an kelimesi.',
      exampleContext: 'Örnek: وَالْمَسْجِدِ (Vel-Mescidi), فَيَعْلَمُ (Fe-ya\'lemü)',
    },
    {
      type: 'kasra',
      titleTr: '2. Harf-i Cerli Mecrur İsim (بِالْمُسْتَفْعَلِ)',
      arabicSign: 'ـِـ ْـ ُـ ْـ َـ ِـ',
      arabicCombined: baseHex(HARAKAT.KASRA, HARAKAT.SUKUN, HARAKAT.DAMMA, HARAKAT.SUKUN, HARAKAT.FATHA, HARAKAT.KASRA),
      pronunciationTr: `${r1.c}il-${r3.c}ü${r4.c}-${r5.c}${v5}${r6.c}i`.trim(),
      description: 'Harf-i cer ile mecrur kılınan çok heceli tam Kur\'ani kelime yapısı.',
      exampleContext: 'Örnek: بِالْمَسْجِدِ (Bil-mescidi), بِالْمُؤْمِنِينَ (Bil-mü\'minîn)',
    },
    {
      type: 'damma',
      titleTr: '3. Merfu Tam Kelime (الْمُسْتَقِيمُ / الرَّحْمَٰنُ)',
      arabicSign: 'ـَـ ْـ ُـ ْـ َـ ُـ',
      arabicCombined: baseHex(HARAKAT.FATHA, HARAKAT.SUKUN, HARAKAT.DAMMA, HARAKAT.SUKUN, HARAKAT.KASRA, HARAKAT.DAMMA),
      pronunciationTr: `${r1.c}${v1}l-${r3.c}ü${r4.c}-${r5.c}i${r6.c}ü`.trim(),
      description: 'Cümlenin ana öznesi veya haberi olan tam Kur\'an kelimesi.',
      exampleContext: 'Örnek: الْمُسْتَقِيمُ (El-Müstekîm), الرَّحْمَٰنُ (Er-Rahmân)',
    },
    {
      type: 'sukun',
      titleTr: '4. İstif\'al / İstiğfar Vezni (يَسْتَغْفِرُ)',
      arabicSign: 'ـَـ ْـ َـ ْـ ِـ ُـ',
      arabicCombined: baseHex(HARAKAT.FATHA, HARAKAT.SUKUN, HARAKAT.FATHA, HARAKAT.SUKUN, HARAKAT.KASRA, HARAKAT.DAMMA),
      pronunciationTr: `${r1.c}${v1}${r2.c}-${r3.c}${v3}${r4.c}-${r5.c}i${r6.c}ü`.trim(),
      description: 'Talep ve bağışlanma bildiren 6 harfli zengin İstif\'al babı vezni.',
      exampleContext: 'Örnek: يَسْتَغْفِرُ (Yestagfiru), يَسْتَبْشِرُ (Yestebşiru)',
    },
    {
      type: 'shaddah',
      titleTr: '5. Şeddeli Çoğul & Teşdid Kalıbı (يَتَفَكَّرُونَ)',
      arabicSign: 'ـَـ َـ َـ َّـ ُـ َـ',
      arabicCombined: baseHex(HARAKAT.FATHA, HARAKAT.FATHA, HARAKAT.FATHA, `${HARAKAT.SHADDAH}${HARAKAT.FATHA}`, HARAKAT.DAMMA, HARAKAT.FATHA),
      pronunciationTr: `${r1.c}${v1}-${r2.c}${v2}-${r3.c}${v3}${r4.c}-${r4.c}${v4}-${r5.c}û${r6.c}e`.trim(),
      description: 'Eylemin toplum ve süreklilik bildiren şeddeli ve çekimli hali.',
      exampleContext: 'Örnek: يَتَفَكَّرُونَ (Yetefekkerûn), يُسَبِّحُونَ (Yüsebbihûn)',
    },
    {
      type: 'tanwinFatha',
      titleTr: '6. Mansub İki Üstün Tenvin (مُسْتَقِيمًا)',
      arabicSign: 'ـُـ ْـ َـ ِـ ًـا',
      arabicCombined: `${baseHex(HARAKAT.DAMMA, HARAKAT.SUKUN, HARAKAT.FATHA, HARAKAT.KASRA, HARAKAT.FATHA, HARAKAT.FATHATAN)}ا`,
      pronunciationTr: `${r1.c}ü${r2.c}-${r3.c}${v3}${r4.c}-${r5.c}i${r6.c}en`.trim(),
      description: 'Kelimenin hal veya meful durumundaki tenvinli akıcı hali.',
      exampleContext: 'Örnek: صِرَاطًا مُسْتَقِيمًا (Sırâtan Müstekîmen)',
    },
    {
      type: 'tanwinKasra',
      titleTr: '7. Mecrur İki Esre Tenvin (مُسْتَقِيمٍ)',
      arabicSign: 'ـُـ ْـ َـ ِـ ٍـ',
      arabicCombined: baseHex(HARAKAT.DAMMA, HARAKAT.SUKUN, HARAKAT.FATHA, HARAKAT.KASRA, HARAKAT.KASRA, HARAKAT.KASRATAN),
      pronunciationTr: `${r1.c}ü${r2.c}-${r3.c}${v3}${r4.c}-${r5.c}i${r6.c}in`.trim(),
      description: 'Sıfat tamlamalarında mecrur kelimenin son sesi.',
      exampleContext: 'Örnek: عَلَىٰ صِرَاطٍ مُسْتَقِيمٍ (Alâ sırâtın müstekîmin)',
    },
    {
      type: 'tanwinDamma',
      titleTr: '8. Merfu İki Ötre Tenvin (مُسْتَقِيمٌ)',
      arabicSign: 'ـُـ ْـ َـ ِـ ٌـ',
      arabicCombined: baseHex(HARAKAT.DAMMA, HARAKAT.SUKUN, HARAKAT.FATHA, HARAKAT.KASRA, HARAKAT.DAMMA, HARAKAT.DAMMATAN),
      pronunciationTr: `${r1.c}ü${r2.c}-${r3.c}${v3}${r4.c}-${r5.c}i${r6.c}ün`.trim(),
      description: 'Haber durumundaki tam Kur\'an kelimelerinin nihai okunuşu.',
      exampleContext: 'Örnek: هَٰذَا صِرَاطٌ مُسْتَقِيمٌ (Hâzâ sırâtun müstekîmün)',
    },
  ];

  // Match with dictionary
  const rawKey = `${l1.char}${l2.char}${l3.char}${l4.char}${l5.char}${l6.char}`;
  const keyWithoutL1 = `${l2.char}${l3.char}${l4.char}${l5.char}${l6.char}`;
  const quranicExample = QURANIC_ADVANCED_DICT[rawKey] || QURANIC_ADVANCED_DICT[keyWithoutL1];

  return {
    id: `${l1.char}-${quintet.id}`,
    letter1: l1,
    quintet,
    letters: [l1, l2, l3, l4, l5, l6],
    joinedArabic,
    transliterationRoot,
    connectionRuleNote,
    connectionStatus: {
      l1ConnectsToL2,
      l2ConnectsToL3,
      l3ConnectsToL4,
      l4ConnectsToL5,
      l5ConnectsToL6,
      fullyConnected,
    },
    variants,
    quranicExample,
  };
}
