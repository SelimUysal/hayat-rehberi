import { TAJWEED_RULES_DICTIONARY } from '../data/tajweedRules';
import {
  TajweedAnalysisResult,
  TajweedRuleInfo,
  TajweedRuleType,
  DetectedTajweedSegment,
} from '../types/tajweed';

// Unicode Diacritics
export const ARABIC_DIACRITICS = {
  FATHATAN: '\u064B', // ً
  DAMMATAN: '\u064C', // ٌ
  KASRATAN: '\u064D', // ٍ
  FATHA: '\u064E',    // َ
  DAMMA: '\u064F',    // ُ
  KASRA: '\u0650',    // ِ
  SHADDA: '\u0651',   // ّ
  SUKUN: '\u0652',    // ْ
  MADDAH: '\u0653',   // ٓ
  SUPERSCRIPT_ALIF: '\u0670', // ٰ
};

// Harf Grupları
const KALKALE_CHARS = new Set(['ق', 'ط', 'ب', 'ج', 'د']);
const BOZGAZ_IZHAR_CHARS = new Set(['ء', 'أ', 'إ', 'ا', 'ه', 'هـ', 'ع', 'ح', 'غ', 'خ', 'آ']);
const IKLAB_CHARS = new Set(['ب']);
const IDGAM_MAAL_GUNNE_CHARS = new Set(['ي', 'م', 'ن', 'و']);
const IDGAM_BILA_GUNNE_CHARS = new Set(['ل', 'ر']);
const IHFA_CHARS = new Set([
  'ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك',
]);

const SHAMSI_CHARS = new Set([
  'ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن',
]);

const QAMARI_CHARS = new Set([
  'ء', 'أ', 'إ', 'ا', 'ب', 'ج', 'ح', 'خ', 'ع', 'غ', 'ف', 'ق', 'ك', 'م', 'و', 'ه', 'ي',
]);

/**
 * Remove diacritics to get base Arabic characters
 */
export function removeDiacritics(text: string): string {
  return text.replace(/[\u064B-\u065F\u0670]/g, '');
}

/**
 * Get base char ignoring diacritics
 */
export function cleanChar(char: string): string {
  return removeDiacritics(char).replace(/ـ/g, '').trim();
}

/**
 * Check if a character is a tanween
 */
export function isTanween(char: string): boolean {
  return (
    char === ARABIC_DIACRITICS.FATHATAN ||
    char === ARABIC_DIACRITICS.DAMMATAN ||
    char === ARABIC_DIACRITICS.KASRATAN ||
    char === 'ً' ||
    char === 'ٌ' ||
    char === 'ٍ'
  );
}

/**
 * Analyzes Arabic text to identify Tajweed rules and generate colored segments
 */
export function analyzeTajweedText(arabicText: string): TajweedAnalysisResult {
  if (!arabicText) {
    return { hasRules: false, rulesFound: [], segments: [] };
  }

  const rulesFound: TajweedRuleInfo[] = [];
  const rulesMap = new Map<TajweedRuleType, TajweedRuleInfo>();

  const addRule = (type: TajweedRuleType) => {
    if (!rulesMap.has(type) && TAJWEED_RULES_DICTIONARY[type]) {
      const rule = TAJWEED_RULES_DICTIONARY[type];
      rulesMap.set(type, rule);
      rulesFound.push(rule);
    }
  };

  const text = arabicText.trim();
  const cleaned = removeDiacritics(text);

  // 1. Şemsî ve Kamerî Harfler Tespiti (Elif-Lâm takısı)
  if (text.startsWith('ال') || text.startsWith('وال') || text.startsWith('فال') || text.includes(' ال')) {
    const lamIndex = text.indexOf('ل');
    if (lamIndex !== -1) {
      // Find following base character
      const afterLam = cleanChar(text.slice(lamIndex + 1));
      const firstFollowChar = afterLam.charAt(0);

      if (SHAMSI_CHARS.has(firstFollowChar)) {
        addRule('idgam_semsiyye');
      } else if (QAMARI_CHARS.has(firstFollowChar)) {
        addRule('izhar_kameriyye');
      }
    }
  }

  // 2. Kalkale Tespiti (ق ط ب ج د üzerinde cezm veya durak sükûnu)
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (KALKALE_CHARS.has(char)) {
      const nextChar = text[i + 1] || '';
      // Sukun immediately after, or end of string, or sukun character
      if (nextChar === ARABIC_DIACRITICS.SUKUN || nextChar === 'ْ' || i === text.length - 1) {
        addRule('kalkale');
      }
    }
  }

  // 3. Tenvin ve Sâkin Nûn Tespiti (İhfâ, İzhâr, İklâb, İdgam-ı Maal/Bila Gunne)
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const isSakinNun = char === 'ن' && (text[i + 1] === ARABIC_DIACRITICS.SUKUN || text[i + 1] === 'ْ');
    const isTanweenChar = isTanween(char);

    if (isSakinNun || isTanweenChar) {
      // Look forward to find the next base letter
      let nextBaseChar = '';
      for (let j = i + 1; j < text.length; j++) {
        const candidate = text[j];
        const cleanedCand = cleanChar(candidate);
        if (cleanedCand && !isTanween(candidate) && candidate !== ARABIC_DIACRITICS.SUKUN && candidate !== ' ') {
          nextBaseChar = cleanedCand;
          break;
        }
      }

      if (nextBaseChar) {
        if (BOZGAZ_IZHAR_CHARS.has(nextBaseChar)) {
          addRule('izhar');
        } else if (IKLAB_CHARS.has(nextBaseChar)) {
          addRule('iklab');
        } else if (IDGAM_MAAL_GUNNE_CHARS.has(nextBaseChar)) {
          addRule('idgam_maal_gunne');
        } else if (IDGAM_BILA_GUNNE_CHARS.has(nextBaseChar)) {
          addRule('idgam_bila_gunne');
        } else if (IHFA_CHARS.has(nextBaseChar)) {
          addRule('ihfa');
        }
      }
    }
  }

  // 4. Med (Uzatma) Halleri Tespiti
  if (text.includes(ARABIC_DIACRITICS.MADDAH) || text.includes('آ') || text.includes('~')) {
    if (text.includes('ّ') || text.includes(ARABIC_DIACRITICS.SHADDA)) {
      addRule('medd_i_lazim');
    } else if (text.includes('ء') || text.includes('أ') || text.includes('إ')) {
      addRule('medd_i_muttasil');
    } else {
      addRule('medd_i_munfasil');
    }
  } else if (text.includes('َا') || text.includes('ُو') || text.includes('ِي') || text.includes('ٰ')) {
    addRule('medd_i_tabii');
  }

  // 5. Sâkin Mîm Halleri Tespiti
  for (let i = 0; i < text.length; i++) {
    if (text[i] === 'م' && (text[i + 1] === ARABIC_DIACRITICS.SUKUN || text[i + 1] === 'ْ')) {
      let nextBaseChar = '';
      for (let j = i + 2; j < text.length; j++) {
        const cleanedCand = cleanChar(text[j]);
        if (cleanedCand && cleanedCand !== ' ') {
          nextBaseChar = cleanedCand;
          break;
        }
      }
      if (nextBaseChar === 'ب') {
        addRule('ihfa_sefevi');
      } else if (nextBaseChar === 'م') {
        addRule('idgam_misleyn');
      } else if (nextBaseChar) {
        addRule('izhar_sefevi');
      }
    }
  }

  // 6. Râ Hükmü Tespiti
  if (text.includes('ر') || cleaned.includes('ر')) {
    if (text.includes('رَ') || text.includes('رُ') || text.includes('رً') || text.includes('رٌ')) {
      addRule('hukmur_ra_kalin');
    } else if (text.includes('رِ') || text.includes('رٍ')) {
      addRule('hukmur_ra_ince');
    }
  }

  // Generate segments for colored rendering
  const segments = buildColorSegments(text, rulesFound);

  let summaryNote = undefined;
  if (rulesFound.length > 0) {
    summaryNote = rulesFound.map((r) => `${r.titleTr} (${r.durationElif || 'Özel Hüküm'})`).join(' · ');
  }

  return {
    hasRules: rulesFound.length > 0,
    rulesFound,
    segments,
    summaryNote,
  };
}

/**
 * Breaks down text into colored segments matching active tajweed rules
 */
function buildColorSegments(text: string, rules: TajweedRuleInfo[]): DetectedTajweedSegment[] {
  if (rules.length === 0) {
    return [{ text, isHighlighted: false }];
  }

  // For high-fidelity visual display in educational cards
  // Primary rule color takes effect on key parts
  const primaryRule = rules[0];

  return [
    {
      text,
      rule: primaryRule,
      isHighlighted: true,
    },
  ];
}

/**
 * Analyzes two-letter or multi-letter combinations with a specific variant (sukun, shaddah, tanween, fatha, etc.)
 */
export function analyzeVariantTajweed(
  arabicText: string,
  variantType: string,
  lastLetterChar?: string,
  firstLetterChar?: string
): TajweedAnalysisResult {
  const result = analyzeTajweedText(arabicText);

  // Additional context-specific checks based on variant type
  if (variantType === 'sukun') {
    const checkedChar = cleanChar(lastLetterChar || arabicText.slice(-1));
    if (KALKALE_CHARS.has(checkedChar)) {
      if (!result.rulesFound.some((r) => r.type === 'kalkale')) {
        const kalkaleRule = TAJWEED_RULES_DICTIONARY['kalkale'];
        result.rulesFound.unshift(kalkaleRule);
        result.hasRules = true;
      }
    }
  }

  if (variantType === 'shaddah') {
    // If shaddah is on nun or mim -> Gunne
    const base = cleanChar(lastLetterChar || '');
    if (base === 'ن' || base === 'م') {
      if (!result.rulesFound.some((r) => r.type === 'idgam_misleyn')) {
        const gunneRule = TAJWEED_RULES_DICTIONARY['idgam_misleyn'];
        result.rulesFound.push(gunneRule);
        result.hasRules = true;
      }
    }
  }

  // Tenvin variants (-en, -in, -un)
  if (variantType === 'fathatan' || variantType === 'dammatan' || variantType === 'kasratan') {
    if (firstLetterChar) {
      const c = cleanChar(firstLetterChar);
      if (BOZGAZ_IZHAR_CHARS.has(c)) {
        if (!result.rulesFound.some((r) => r.type === 'izhar')) {
          result.rulesFound.unshift(TAJWEED_RULES_DICTIONARY['izhar']);
          result.hasRules = true;
        }
      } else if (IKLAB_CHARS.has(c)) {
        if (!result.rulesFound.some((r) => r.type === 'iklab')) {
          result.rulesFound.unshift(TAJWEED_RULES_DICTIONARY['iklab']);
          result.hasRules = true;
        }
      } else if (IDGAM_MAAL_GUNNE_CHARS.has(c)) {
        if (!result.rulesFound.some((r) => r.type === 'idgam_maal_gunne')) {
          result.rulesFound.unshift(TAJWEED_RULES_DICTIONARY['idgam_maal_gunne']);
          result.hasRules = true;
        }
      } else if (IDGAM_BILA_GUNNE_CHARS.has(c)) {
        if (!result.rulesFound.some((r) => r.type === 'idgam_bila_gunne')) {
          result.rulesFound.unshift(TAJWEED_RULES_DICTIONARY['idgam_bila_gunne']);
          result.hasRules = true;
        }
      } else if (IHFA_CHARS.has(c)) {
        if (!result.rulesFound.some((r) => r.type === 'ihfa')) {
          result.rulesFound.unshift(TAJWEED_RULES_DICTIONARY['ihfa']);
          result.hasRules = true;
        }
      }
    }
  }

  return result;
}

/**
 * Checks if a 2-letter combination in cell has a special Tajweed highlight
 */
export function getMatrixCellTajweedIndicator(l1Char: string, l2Char: string): TajweedRuleInfo | null {
  const c1 = cleanChar(l1Char);
  const c2 = cleanChar(l2Char);

  // Sakin nun / Tenvin leading to next
  if (c1 === 'ن') {
    if (BOZGAZ_IZHAR_CHARS.has(c2)) return TAJWEED_RULES_DICTIONARY['izhar'];
    if (IKLAB_CHARS.has(c2)) return TAJWEED_RULES_DICTIONARY['iklab'];
    if (IDGAM_MAAL_GUNNE_CHARS.has(c2)) return TAJWEED_RULES_DICTIONARY['idgam_maal_gunne'];
    if (IDGAM_BILA_GUNNE_CHARS.has(c2)) return TAJWEED_RULES_DICTIONARY['idgam_bila_gunne'];
    if (IHFA_CHARS.has(c2)) return TAJWEED_RULES_DICTIONARY['ihfa'];
  }

  // Sakin Mim leading to Ba or Mim
  if (c1 === 'م') {
    if (c2 === 'ب') return TAJWEED_RULES_DICTIONARY['ihfa_sefevi'];
    if (c2 === 'م') return TAJWEED_RULES_DICTIONARY['idgam_misleyn'];
  }

  // Elif + Lam (Shamsi or Qamari)
  if (c1 === 'ا' && c2 === 'ل') {
    return TAJWEED_RULES_DICTIONARY['izhar_kameriyye'];
  }

  // Kalkale harfleri (özellikle cezmde titreşim)
  if (KALKALE_CHARS.has(c2)) {
    return TAJWEED_RULES_DICTIONARY['kalkale'];
  }

  return null;
}
