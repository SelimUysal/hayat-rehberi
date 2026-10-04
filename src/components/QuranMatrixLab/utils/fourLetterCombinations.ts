import { ArabicLetter, ThreeLetterTriplet, FourLetterCombination, HarakatVariant, QuranicWordExample } from '../types/matrix';
import { HARAKAT } from './arabicCombinations';

// Curated 4-letter Quranic words dictionary
const QURANIC_FOUR_LETTER_DICT: Record<string, QuranicWordExample> = {
  'مكتب': {
    arabic: 'مَكْتُوبٌ / مَكْتَبٌ',
    transliteration: 'Mektûbün',
    meaning: 'Yazılmış, levh-i mahfuzda kayıtlı',
    surahRef: 'A\'raf 157',
  },
  'يكتب': {
    arabic: 'يَكْتُبُ',
    transliteration: 'Yektübü',
    meaning: 'Yazar, kaydeder',
    surahRef: 'Bakara 282',
  },
  'أكتب': {
    arabic: 'أَكْتُبُ',
    transliteration: 'Ektübü',
    meaning: 'Yazarım, takdir ederim',
    surahRef: 'A\'raf 156',
  },
  'مسجد': {
    arabic: 'مَسْجِدٌ',
    transliteration: 'Mescidün',
    meaning: 'Secdegah, ibadethane',
    surahRef: 'Tevbe 18',
  },
  'يسجد': {
    arabic: 'يَسْجُدُ',
    transliteration: 'Yescüdü',
    meaning: 'Secde eder',
    surahRef: 'Hac 18',
  },
  'يعلم': {
    arabic: 'يَعْلَمُ',
    transliteration: 'Ya\'lemü',
    meaning: 'Bilir, haberdardır',
    surahRef: 'Bakara 77',
  },
  'نعلم': {
    arabic: 'نَعْلَمُ',
    transliteration: 'Na\'lemü',
    meaning: 'Biliriz',
    surahRef: 'Hicr 97',
  },
  'معلم': {
    arabic: 'مُعَلَّمٌ',
    transliteration: 'Mü\'allemün',
    meaning: 'Öğretilmiş, eğitilmiş',
    surahRef: 'Duhan 14',
  },
  'ينصر': {
    arabic: 'يَنْصُرُ',
    transliteration: 'Yansuru',
    meaning: 'Yardım eder',
    surahRef: 'Rum 5',
  },
  'منصر': {
    arabic: 'مَنْصُورٌ',
    transliteration: 'Mansûrun',
    meaning: 'Zafere ulaştırılmış, yardım görmüş',
    surahRef: 'İsra 33',
  },
  'أحسن': {
    arabic: 'أَحْسَنَ',
    transliteration: 'Ahsene',
    meaning: 'En güzel şekilde yarattı/yaptı',
    surahRef: 'Secde 7',
  },
  'يحسن': {
    arabic: 'يُحْسِنُ',
    transliteration: 'Yuhsinü',
    meaning: 'İyilikte bulunur, ihsan eder',
    surahRef: 'Kasas 77',
  },
  'محمد': {
    arabic: 'مُحَمَّدٌ',
    transliteration: 'Muhammedün',
    meaning: 'Pek çok övülen, Peygamberimiz (s.a.v)',
    surahRef: 'Al-i İmran 144',
  },
  'أحمد': {
    arabic: 'أَحْمَدُ',
    transliteration: 'Ahmed',
    meaning: 'En çok hamdeden (Hz. İsa\'nın müjdelediği isim)',
    surahRef: 'Saf 6',
  },
  'يغفر': {
    arabic: 'يَغْفِرُ',
    transliteration: 'Yagfiru',
    meaning: 'Bağışlar, günahları affeder',
    surahRef: 'Nisa 48',
  },
  'مغفر': {
    arabic: 'مَغْفِرَةٌ',
    transliteration: 'Magfiratün',
    meaning: 'Bağışlanma, af',
    surahRef: 'Bakara 268',
  },
  'يحكم': {
    arabic: 'يَحْكُمُ',
    transliteration: 'Yahkümü',
    meaning: 'Hükmeder, adaleti tayin eder',
    surahRef: 'Maide 1',
  },
  'محكم': {
    arabic: 'مُحْكَمَاتٌ',
    transliteration: 'Muhkemâtün',
    meaning: 'Hükmü açık ve kesin ayetler',
    surahRef: 'Al-i İmran 7',
  },
  'يصبر': {
    arabic: 'يَصْبِرُ',
    transliteration: 'Yasbiru',
    meaning: 'Sabreder',
    surahRef: 'Nahl 127',
  },
  'يفتح': {
    arabic: 'يَفْتَحُ',
    transliteration: 'Yeftehu',
    meaning: 'Açar, kapıları aralar',
    surahRef: 'Fatır 2',
  },
  'مفتح': {
    arabic: 'مَفَاتِحُ',
    transliteration: 'Mefâtihu',
    meaning: 'Anahtarlar, hazineler',
    surahRef: 'En\'am 59',
  },
  'يذكر': {
    arabic: 'يَذْكُرُ',
    transliteration: 'Yezkürü',
    meaning: 'Zikreder, hatırlar',
    surahRef: 'Enbiya 36',
  },
  'يشكر': {
    arabic: 'يَشْكُرُ',
    transliteration: 'Yeşkürü',
    meaning: 'Şükreder',
    surahRef: 'Lokman 12',
  },
  'يرحم': {
    arabic: 'يَرْحَمُ',
    transliteration: 'Yerhamü',
    meaning: 'Merhamet eder',
    surahRef: 'İsra 54',
  },
  'مرحم': {
    arabic: 'مَرْحَمَةٍ',
    transliteration: 'Merhametin',
    meaning: 'Merhamet, şefkat',
    surahRef: 'Beled 17',
  },
  'يعبد': {
    arabic: 'يَعْبُدُ',
    transliteration: 'Ya\'büdü',
    meaning: 'Kulluk eder',
    surahRef: 'Hac 11',
  },
  'يسلم': {
    arabic: 'يُسْلِمُ',
    transliteration: 'Yüslimü',
    meaning: 'Hakkıyla teslim olur',
    surahRef: 'Lokman 22',
  },
  'مسلم': {
    arabic: 'مُسْلِمٌ',
    transliteration: 'Müslimün',
    meaning: 'Allah\'a teslim olan',
    surahRef: 'Al-i İmran 64',
  },
  'يكفر': {
    arabic: 'يَكْفُرُ',
    transliteration: 'Yekfürü',
    meaning: 'İnkar eder',
    surahRef: 'Bakara 99',
  },
  'يجمع': {
    arabic: 'يَجْمَعُ',
    transliteration: 'Yecma\'u',
    meaning: 'Toplar, bir araya getirir',
    surahRef: 'Sebe 26',
  },
  'يعقل': {
    arabic: 'يَعْقِلُونَ',
    transliteration: 'Ya\'kılûne',
    meaning: 'Aklederler, akıllarını çalıştırırlar',
    surahRef: 'Bakara 164',
  },
  'يرزق': {
    arabic: 'يَرْزُقُ',
    transliteration: 'Yerzüku',
    meaning: 'Rızıklandırır',
    surahRef: 'Bakara 212',
  },
  'يصلح': {
    arabic: 'يُصْلِحُ',
    transliteration: 'Yuslihu',
    meaning: 'Islah eder, düzeltir',
    surahRef: 'Yunus 81',
  },
  'مصلح': {
    arabic: 'مُصْلِحُونَ',
    transliteration: 'Muslihûne',
    meaning: 'Islah ediciler, barışı kuranlar',
    surahRef: 'Bakara 11',
  },
  'يطهر': {
    arabic: 'يُطَهِّرَ',
    transliteration: 'Yütahhira',
    meaning: 'Tertemiz kılar, arındırır',
    surahRef: 'Enfal 11',
  },
  'ينزل': {
    arabic: 'يُنَزِّلُ',
    transliteration: 'Yünezzilü',
    meaning: 'İndirir, nüzul ettirir',
    surahRef: 'Bakara 90',
  },
  'منزل': {
    arabic: 'مُنْزَلًا',
    transliteration: 'Münzelen',
    meaning: 'Bereketli bir konak/menzil',
    surahRef: 'Mü\'minun 29',
  },
  'يبصر': {
    arabic: 'يُبْصِرُ',
    transliteration: 'Yubsiru',
    meaning: 'Görür, basiretle idrak eder',
    surahRef: 'Meryem 38',
  },
  'يسمع': {
    arabic: 'يَسْمَعُ',
    transliteration: 'Yesma\'u',
    meaning: 'İşitir',
    surahRef: 'Casiye 8',
  },
  'يضرب': {
    arabic: 'يَضْرِبُ',
    transliteration: 'Yadribu',
    meaning: 'Misaller verir',
    surahRef: 'İbrahim 25',
  },
  'يبعث': {
    arabic: 'يَبْعَثُ',
    transliteration: 'Yeb\'asü',
    meaning: 'Diriltip gönderir',
    surahRef: 'Hac 7',
  },
  'يخلق': {
    arabic: 'يَخْلُقُ',
    transliteration: 'Yahliku',
    meaning: 'Yoktan yaratır',
    surahRef: 'Al-i İmran 47',
  },
  'تفكر': {
    arabic: 'تَفَكَّرُوا',
    transliteration: 'Tefekkerû',
    meaning: 'Derin derin düşündüler',
    surahRef: 'A\'raf 184',
  },
  'مفكر': {
    arabic: 'مُفَكِّرٌ',
    transliteration: 'Müfekkîrün',
    meaning: 'Tefekkür eden, düşünen',
    surahRef: 'Müddessir 18',
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
 * Generates a 4-letter combination from Row (L1) and Triplet Column (L2, L3, L4)
 */
export function getFourLetterCombination(
  l1: ArabicLetter,
  triplet: ThreeLetterTriplet
): FourLetterCombination {
  const l2 = triplet.letter1;
  const l3 = triplet.letter2;
  const l4 = triplet.letter3;

  // Joined Arabic representation
  let joinedArabic = `${l1.char}${l2.char}${l3.char}${l4.char}`;
  if (l1.char === 'ل' && l2.char === 'ا') {
    joinedArabic = `لا${l3.char}${l4.char}`;
  } else if (l2.char === 'ل' && l3.char === 'ا') {
    joinedArabic = `${l1.char}لا${l4.char}`;
  } else if (l3.char === 'ل' && l4.char === 'ا') {
    joinedArabic = `${l1.char}${l2.char}لا`;
  }

  // Connection analysis between adjacent letters
  const l1ConnectsToL2 = l1.connectsNext && l1.char !== 'ء' && l1.char !== 'لا';
  const l2ConnectsToL3 = l2.connectsNext && l2.char !== 'ء' && l2.char !== 'لا';
  const l3ConnectsToL4 = l3.connectsNext && l3.char !== 'ء' && l3.char !== 'لا';
  const fullyConnected = l1ConnectsToL2 && l2ConnectsToL3 && l3ConnectsToL4;

  let connectionRuleNote = '';
  if (fullyConnected) {
    connectionRuleNote = `4 harf de birleşebilen harflerdir: "${l1.nameTr}" başta, "${l2.nameTr}" ve "${l3.nameTr}" ortada, "${l4.nameTr}" sonda formuyla kesintisiz tek bir gövde oluşturur.`;
  } else {
    const brokenPoints: string[] = [];
    if (!l1ConnectsToL2) brokenPoints.push(`"${l1.nameTr}" kendinden sonrakine birleşmez`);
    if (!l2ConnectsToL3) brokenPoints.push(`"${l2.nameTr}" kendinden sonrakine birleşmez`);
    if (!l3ConnectsToL4) brokenPoints.push(`"${l3.nameTr}" kendinden sonrakine birleşmez`);
    connectionRuleNote = `İmlâ Kuralı: ${brokenPoints.join(', ')}. Bu noktalarda harfler ayrık/müstakil yazılır.`;
  }

  // Phonetics
  const r1 = getLetterPhoneticRoot(l1);
  const r2 = getLetterPhoneticRoot(l2);
  const r3 = getLetterPhoneticRoot(l3);
  const r4 = getLetterPhoneticRoot(l4);

  const v1 = r1.isBold ? 'a' : 'e';
  const v2_a = r2.isBold ? 'a' : 'e';
  const v3_a = r3.isBold ? 'a' : 'e';
  const v3_i = r3.isBold ? 'ı' : 'i';
  const v3_u = r3.isBold ? 'u' : 'ü';
  const v4_a = r4.isBold ? 'a' : 'e';
  const v4_i = r4.isBold ? 'ı' : 'i';
  const v4_u = r4.isBold ? 'u' : 'ü';

  const c1 = r1.c;
  const c2 = r2.c;
  const c3 = r3.c;
  const c4 = r4.c;

  const transliterationRoot = `${c1}${v1}-${c2}${v2_a}-${c3}${v3_a}-${c4}${v4_a}`.trim();

  // 8 Morphological Harakat Variations for 4-Letter Structures
  const baseQuad = (s1: string, s2: string, s3: string, s4: string) => {
    return `${l1.char}${s1}${l2.char}${s2}${l3.char}${s3}${l4.char}${s4}`;
  };

  const variants: HarakatVariant[] = [
    {
      type: 'fatha',
      titleTr: '1. Muzari Fiil Kalıbı (يَفْعَلُ / أَفْعَلَ)',
      arabicSign: 'ـَـ ْـ َـ ُـ',
      arabicCombined: baseQuad(HARAKAT.FATHA, HARAKAT.SUKUN, HARAKAT.FATHA, HARAKAT.DAMMA),
      pronunciationTr: `${c1}${v1}${c2}-${c3}${v3_a}${c4}${v4_u}`.trim(),
      description: 'Geniş / şimdiki zaman muzari fiil kalıbı (veya İf\'al babı mazi). İlk harf üstün, 2. harf sakin.',
      exampleContext: 'Örnek: يَفْتَحُ (Yeftehu), يَخْلُقُ (Yahliku), يَشْكُرُ (Yeşkürü)',
    },
    {
      type: 'kasra',
      titleTr: '2. İsm-i Mekan & Zaman (مَفْعِلٌ / مَفْعِلِ)',
      arabicSign: 'ـَـ ْـ ِـ ٌـ',
      arabicCombined: baseQuad(HARAKAT.FATHA, HARAKAT.SUKUN, HARAKAT.KASRA, HARAKAT.DAMMATAN),
      pronunciationTr: `${c1}${v1}${c2}-${c3}${v3_i}${c4}${v4_u}n`.trim(),
      description: 'Eylem yapılan mekanı veya zamanı bildiren klasik Kur\'an vezni. 3. harf esre alır.',
      exampleContext: 'Örnek: مَسْجِدٌ (Mescidün - Secde mekanı), مَنْزِلٌ (Menzilün)',
    },
    {
      type: 'damma',
      titleTr: '3. İsm-i Fail & Fail Kalıbı (مُفْعِلٌ / يُفْعِلُ)',
      arabicSign: 'ـُـ ْـ ِـ ٌـ',
      arabicCombined: baseQuad(HARAKAT.DAMMA, HARAKAT.SUKUN, HARAKAT.KASRA, HARAKAT.DAMMATAN),
      pronunciationTr: `${c1}${v3_u}${c2}-${c3}${v3_i}${c4}${v4_u}n`.trim(),
      description: 'İşi yapan özne (fail) kalıbı. İlk harf ötre ile başlar, 3. harf esre ile tamamlanır.',
      exampleContext: 'Örnek: مُسْلِمٌ (Müslimün), مُحْسِنٌ (Muhsinün), مُصْلِحٌ (Muslihun)',
    },
    {
      type: 'sukun',
      titleTr: '4. İsm-i Mekan Açık Mastar (مَفْعَلٌ)',
      arabicSign: 'ـَـ ْـ َـ ٌـ',
      arabicCombined: baseQuad(HARAKAT.FATHA, HARAKAT.SUKUN, HARAKAT.FATHA, HARAKAT.DAMMATAN),
      pronunciationTr: `${c1}${v1}${c2}-${c3}${v3_a}${c4}${v4_u}n`.trim(),
      description: 'Açık mekan ve mefhum mastar kalıbı. 1. ve 3. harf üstün, 2. harf cezim alır.',
      exampleContext: 'Örnek: مَكْتَبٌ (Mektebün), مَذْهَبٌ (Mezhebün), مَقْعَدٌ (Mak\'adün)',
    },
    {
      type: 'shaddah',
      titleTr: '5. Tef\'îl / Müfa\'ale Şeddeli Vezin (مُفَعَّلٌ / يُفَعِّلُ)',
      arabicSign: 'ـُـ َـ َّـ ُـ',
      arabicCombined: baseQuad(HARAKAT.DAMMA, HARAKAT.FATHA, `${HARAKAT.SHADDAH}${HARAKAT.FATHA}`, HARAKAT.DAMMA),
      pronunciationTr: `${c1}${v3_u}-${c2}${v2_a}${c3}-${c3}${v3_a}${c4}${v4_u}`.trim(),
      description: '3. kök harfi şeddelenen kuvvetlendirme ve tekerrür vezni. Harf kuvvetle ikizlenir.',
      exampleContext: 'Örnek: مُعَلَّمٌ (Mü\'allemün), يُنَزِّلُ (Yünezzilü), يُفَصِّلُ (Yüfassılü)',
    },
    {
      type: 'tanwinFatha',
      titleTr: '6. Mansub İki Üstün Tenvin (مَفْعَلًا)',
      arabicSign: 'ـَـ ْـ َـ ًـا',
      arabicCombined: l4.char === 'ء' || l4.char === 'ة'
        ? baseQuad(HARAKAT.FATHA, HARAKAT.SUKUN, HARAKAT.FATHA, HARAKAT.FATHATAN)
        : `${baseQuad(HARAKAT.FATHA, HARAKAT.SUKUN, HARAKAT.FATHA, HARAKAT.FATHATAN)}ا`,
      pronunciationTr: `${c1}${v1}${c2}-${c3}${v3_a}${c4}${v4_a}n`.trim(),
      description: 'Cümlede nesne (meful) veya hal durumundaki 4 harfli kelimelerin çift üstünlü hali.',
      exampleContext: 'Örnek: مَسْجِدًا (Mesciden), مَنْزِلًا (Menzilen), مُحْسِنًا (Muhsinen)',
    },
    {
      type: 'tanwinKasra',
      titleTr: '7. Mecrur İki Esre Tenvin (مَفْعَلٍ)',
      arabicSign: 'ـَـ ْـ َـ ٍـ',
      arabicCombined: baseQuad(HARAKAT.FATHA, HARAKAT.SUKUN, HARAKAT.FATHA, HARAKAT.KASRATAN),
      pronunciationTr: `${c1}${v1}${c2}-${c3}${v3_a}${c4}${v4_i}n`.trim(),
      description: 'Harf-i cerlerden veya tamlamalardan sonra gelen isimlerin iki esreli hali.',
      exampleContext: 'Örnek: مَسْجِدٍ (Mescidin), مَقَامٍ (Makâmin), كِتَابٍ (Kitâbin)',
    },
    {
      type: 'tanwinDamma',
      titleTr: '8. Merfu İki Ötre Tenvin (مَفْعَلٌ)',
      arabicSign: 'ـَـ ْـ َـ ٌـ',
      arabicCombined: baseQuad(HARAKAT.FATHA, HARAKAT.SUKUN, HARAKAT.FATHA, HARAKAT.DAMMATAN),
      pronunciationTr: `${c1}${v1}${c2}-${c3}${v3_a}${c4}${v4_u}n`.trim(),
      description: 'Özne veya yüklem olan 4 harfli isim ve sıfatların sonundaki çift ötreli hali.',
      exampleContext: 'Örnek: مُحَمَّدٌ (Muhammedün), مَسْجِدٌ (Mescidün), مُسْلِمٌ (Müslimün)',
    },
  ];

  // Match with dictionary
  const rawKey = `${l1.char}${l2.char}${l3.char}${l4.char}`;
  const quranicExample = QURANIC_FOUR_LETTER_DICT[rawKey];

  return {
    id: `${l1.char}-${triplet.id}`,
    letter1: l1,
    triplet,
    letters: [l1, l2, l3, l4],
    joinedArabic,
    transliterationRoot,
    connectionRuleNote,
    connectionStatus: {
      l1ConnectsToL2,
      l2ConnectsToL3,
      l3ConnectsToL4,
      fullyConnected,
    },
    variants,
    quranicExample,
  };
}
