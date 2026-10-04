import { ArabicLetter, HarakatVariant, TwoLetterCombination } from '../types/matrix';

// Unicode Arabic Diacritics
export const HARAKAT = {
  FATHA: '\u064E',       // َ  Üstün
  KASRA: '\u0650',       // ِ  Esre
  DAMMA: '\u064F',       // ُ  Ötre
  SUKUN: '\u0652',       // ْ  Cezm
  SHADDAH: '\u0651',     // ّ  Şedde
  FATHATAN: '\u064B',    // ً  İki Üstün (Tenvin)
  KASRATAN: '\u064D',    // ٍ  İki Esre (Tenvin)
  DAMMATAN: '\u064C',    // ٌ  İki Ötre (Tenvin)
};

/**
 * Letter sound root determination for phonetic Turkish generation
 */
function getLetterPhoneticRoot(letter: ArabicLetter, position: 'first' | 'second'): {
  consonant: string;
  isBold: boolean;
} {
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
  return { consonant: c, isBold: letter.isBold };
}

/**
 * Creates the joined string and computes connection metadata
 */
export function getTwoLetterCombination(l1: ArabicLetter, l2: ArabicLetter): TwoLetterCombination {
  // In Arabic, l1 is read/written first (on the right), l2 second (on the left)
  // Standard Arabic ligature handling
  let joinedArabic = `${l1.char}${l2.char}`;
  if (l1.char === 'ل' && l2.char === 'ا') {
    joinedArabic = 'لا';
  } else if (l1.char === 'ء') {
    joinedArabic = `ء${l2.char}`;
  }

  const isConnected = l1.connectsNext && l1.char !== 'ء' && l1.char !== 'لا';
  
  let connectionRuleNote = '';
  if (!l1.connectsNext) {
    connectionRuleNote = `"${l1.nameTr}" harfi kendinden sonraki harfle BİRLEŞMEZ (6 müstakil harften biridir). Bu nedenle "${l2.nameTr}" harfi ayrı (başta/yalnız formunda) yazılır.`;
  } else {
    connectionRuleNote = `"${l1.nameTr}" harfi kendinden sonraki harfe bağlandığı için BAŞTA formu (${l1.forms.initial}), "${l2.nameTr}" harfi ise SONDA formu (${l2.forms.final}) ile bitiştirilir.`;
  }

  // Determine vowel qualities for Turkish transliteration
  const r1 = getLetterPhoneticRoot(l1, 'first');
  const r2 = getLetterPhoneticRoot(l2, 'second');

  const v1 = r1.isBold ? 'a' : 'e';
  const v2_fatha = r2.isBold ? 'a' : 'e';
  const v2_kasra = r2.isBold ? 'ı' : 'i';
  const v2_damma = r2.isBold ? 'u' : 'ü';

  const c1 = r1.consonant;
  const c2 = r2.consonant;

  const baseJoin = (sign1: string, sign2: string) => {
    // If l1 is Lam and l2 is Alif with fatha:
    if (l1.char === 'ل' && l2.char === 'ا') {
      return `لَا${sign2}`;
    }
    return `${l1.char}${sign1}${l2.char}${sign2}`;
  };

  const variants: HarakatVariant[] = [
    {
      type: 'fatha',
      titleTr: '1. Üstün (Fetha)',
      arabicSign: 'ـَـ',
      arabicCombined: baseJoin(HARAKAT.FATHA, HARAKAT.FATHA),
      pronunciationTr: `${c1}${v1}-${c2}${v2_fatha}`.trim(),
      description: 'Her iki harf de üstün harekesi alır. İnce harfler "e", kalın harfler "a" sesi ile okunur.',
      exampleContext: 'Örnek: كَتَبَ (Ketebe), خَلَقَ (Haleka)',
    },
    {
      type: 'kasra',
      titleTr: '2. Esre (Kesra)',
      arabicSign: 'ـِـ',
      arabicCombined: baseJoin(HARAKAT.FATHA, HARAKAT.KASRA),
      pronunciationTr: `${c1}${v1}-${c2}${v2_kasra}`.trim(),
      description: 'İkinci harf esre alır. İnce harfler "i", kalın harfler dolgun "ı" sesi ile telaffuz edilir.',
      exampleContext: 'Örnek: مَلِكِ (Meliki), رَحِمَ (Rahime)',
    },
    {
      type: 'damma',
      titleTr: '3. Ötre (Damme)',
      arabicSign: 'ـُـ',
      arabicCombined: baseJoin(HARAKAT.FATHA, HARAKAT.DAMMA),
      pronunciationTr: `${c1}${v1}-${c2}${v2_damma}`.trim(),
      description: 'İkinci harf ötre alır. Dudaklar yuvarlatılarak ince harflerde "ü", kalın harflerde "u" sesi çıkar.',
      exampleContext: 'Örnek: كُتُبٌ (Kütübün), رُسُلٌ (Rusulün)',
    },
    {
      type: 'sukun',
      titleTr: '4. Cezm (Sükun - Sakin Hece)',
      arabicSign: 'ـْـ',
      arabicCombined: baseJoin(HARAKAT.FATHA, HARAKAT.SUKUN),
      pronunciationTr: `${c1}${v1}${c2}`.trim(),
      description: 'En temel birleşim kuralıdır! İlk harf harekeli, ikinci harf cezimli (harekesiz) olup tek bir kapalı hece oluşturur.',
      exampleContext: 'Örnek: قُلْ (Kul), كَمْ (Kem), قَدْ (Kad)',
    },
    {
      type: 'shaddah',
      titleTr: '5. Şedde (Teşdid - İkizleme)',
      arabicSign: 'ـّـ',
      arabicCombined: baseJoin(HARAKAT.FATHA, `${HARAKAT.SHADDAH}${HARAKAT.FATHA}`),
      pronunciationTr: `${c1}${v1}${c2}-${c2}${v2_fatha}`.trim(),
      description: 'İkinci harf şeddeli okunur. Harf önce sakin tutulup ardından harekeli olarak kuvvetle patlatılır (çift harf etkisi).',
      exampleContext: 'Örnek: رَبَّ (Rabbe), حَقَّ (Hakka)',
    },
    {
      type: 'tanwinFatha',
      titleTr: '6. İki Üstün (Tenvin Fethatân)',
      arabicSign: 'ـًـ',
      arabicCombined: l2.char === 'ة' || l2.char === 'ء' 
        ? `${l1.char}${HARAKAT.FATHA}${l2.char}${HARAKAT.FATHATAN}`
        : `${l1.char}${HARAKAT.FATHA}${l2.char}${HARAKAT.FATHATAN}ا`,
      pronunciationTr: `${c1}${v1}-${c2}${v2_fatha}n`.trim(),
      description: 'Kelime sonunda "en" veya "an" sesi veren çift üstündür. Çoğu harfte destekleyici Elif ile yazılır.',
      exampleContext: 'Örnek: شُكْرًا (Şükran), كِتَابًا (Kitâben)',
    },
    {
      type: 'tanwinKasra',
      titleTr: '7. İki Esre (Tenvin Kesratân)',
      arabicSign: 'ـٍـ',
      arabicCombined: baseJoin(HARAKAT.FATHA, HARAKAT.KASRATAN),
      pronunciationTr: `${c1}${v1}-${c2}${v2_kasra}n`.trim(),
      description: 'Kelime sonu harfinin altına konan çift çizgidir. "in" veya kalın harflerde "ın" sesi verir.',
      exampleContext: 'Örnek: رَحِيمٍ (Rahîmin), نَاصِحٍ (Nâsıhın)',
    },
    {
      type: 'tanwinDamma',
      titleTr: '8. İki Ötre (Tenvin Dammetân)',
      arabicSign: 'ـٌـ',
      arabicCombined: baseJoin(HARAKAT.FATHA, HARAKAT.DAMMATAN),
      pronunciationTr: `${c1}${v1}-${c2}${v2_damma}n`.trim(),
      description: 'Kelime sonu harfinin üzerine konan çift ötredir. "ün" veya kalın harflerde "un" sesi verir.',
      exampleContext: 'Örnek: عَلِيمٌ (Alîmün), غَفُورٌ (Gafûrun)',
    },
  ];

  return {
    letter1: l1,
    letter2: l2,
    joinedArabic,
    isConnected,
    connectionRuleNote,
    variants,
  };
}
