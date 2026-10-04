export interface LetterForm {
  isolated: string;
  initial: string;
  medial: string;
  final: string;
}

export interface HarakatReading {
  fatha: { ar: string; tr: string; soundDesc: string };
  kasra: { ar: string; tr: string; soundDesc: string };
  damma: { ar: string; tr: string; soundDesc: string };
}

export interface QuranicWordExample {
  arabic: string;
  transliteration: string;
  meaning: string;
  surahRef?: string;
  highlightLetterPos?: 'initial' | 'medial' | 'final' | 'isolated';
}

export interface ArabicLetter {
  id: number;
  char: string;
  nameTr: string;
  nameAr: string;
  transliteration: string;
  connectsNext: boolean;
  makhraj: string; // Çıkış yeri (boğaz, dil, dudak vs.)
  isBold: boolean; // Kalın harf mi (Sad, Dad, Tı, Zı, Hı, Gayn, Kaf)
  forms: LetterForm;
  harakat: HarakatReading;
  examples: QuranicWordExample[];
}

export type VowelType = 
  | 'fatha'       // Üstün
  | 'kasra'       // Esre
  | 'damma'       // Ötre
  | 'sukun'       // Cezm
  | 'shaddah'     // Şedde
  | 'tanwinFatha' // İki Üstün
  | 'tanwinKasra' // İki Esre
  | 'tanwinDamma'; // İki Ötre

export interface HarakatVariant {
  type: VowelType;
  titleTr: string;
  arabicSign: string;
  arabicCombined: string;
  pronunciationTr: string;
  description: string;
  exampleContext: string;
}

export interface TwoLetterCombination {
  letter1: ArabicLetter; // Row letter (first in reading order or base)
  letter2: ArabicLetter; // Column letter (second)
  joinedArabic: string;
  isConnected: boolean;
  connectionRuleNote: string;
  variants: HarakatVariant[];
}

export interface TwoLetterPair {
  id: string;
  letter1: ArabicLetter;
  letter2: ArabicLetter;
  joinedArabic: string;
  nameTr: string;
  category?: string; // 'fiil-koku' | 'yaygin' | 'elifba'
  frequencyRank?: number;
}

export interface ThreeLetterCombination {
  id: string;
  letter1: ArabicLetter;      // Row (1st letter)
  pair: TwoLetterPair;        // Column (2nd & 3rd letter)
  letters: [ArabicLetter, ArabicLetter, ArabicLetter];
  joinedArabic: string;
  transliterationRoot: string;
  connectionRuleNote: string;
  connectionStatus: {
    l1ConnectsToL2: boolean;
    l2ConnectsToL3: boolean;
    fullyConnected: boolean;
  };
  variants: HarakatVariant[];
  quranicExample?: QuranicWordExample;
}

export interface ThreeLetterTriplet {
  id: string;
  letter1: ArabicLetter;
  letter2: ArabicLetter;
  letter3: ArabicLetter;
  joinedArabic: string;
  nameTr: string;
  rootMeaning?: string;
  frequencyRank?: number;
}

export interface FourLetterCombination {
  id: string;
  letter1: ArabicLetter;        // Row (1st letter)
  triplet: ThreeLetterTriplet;  // Column (2nd, 3rd, 4th letters)
  letters: [ArabicLetter, ArabicLetter, ArabicLetter, ArabicLetter];
  joinedArabic: string;
  transliterationRoot: string;
  connectionRuleNote: string;
  connectionStatus: {
    l1ConnectsToL2: boolean;
    l2ConnectsToL3: boolean;
    l3ConnectsToL4: boolean;
    fullyConnected: boolean;
  };
  variants: HarakatVariant[];
  quranicExample?: QuranicWordExample;
}

export interface FourLetterQuad {
  id: string;
  letter1: ArabicLetter;
  letter2: ArabicLetter;
  letter3: ArabicLetter;
  letter4: ArabicLetter;
  joinedArabic: string;
  nameTr: string;
  stemMeaning?: string;
  frequencyRank?: number;
}

export interface FiveLetterCombination {
  id: string;
  letter1: ArabicLetter;        // Row (1st letter)
  quad: FourLetterQuad;         // Column (2nd, 3rd, 4th, 5th letters)
  letters: [ArabicLetter, ArabicLetter, ArabicLetter, ArabicLetter, ArabicLetter];
  joinedArabic: string;
  transliterationRoot: string;
  connectionRuleNote: string;
  connectionStatus: {
    l1ConnectsToL2: boolean;
    l2ConnectsToL3: boolean;
    l3ConnectsToL4: boolean;
    l4ConnectsToL5: boolean;
    fullyConnected: boolean;
  };
  variants: HarakatVariant[];
  quranicExample?: QuranicWordExample;
}

export interface FiveLetterQuintet {
  id: string;
  letter1: ArabicLetter;
  letter2: ArabicLetter;
  letter3: ArabicLetter;
  letter4: ArabicLetter;
  letter5: ArabicLetter;
  joinedArabic: string;
  nameTr: string;
  quintetMeaning?: string;
  frequencyRank?: number;
}

export interface AdvancedWordCombination {
  id: string;
  letter1: ArabicLetter;          // Row (prefix letter)
  quintet: FiveLetterQuintet;     // Column (5-letter base from Stage 4)
  letters: [ArabicLetter, ArabicLetter, ArabicLetter, ArabicLetter, ArabicLetter, ArabicLetter];
  joinedArabic: string;
  transliterationRoot: string;
  connectionRuleNote: string;
  connectionStatus: {
    l1ConnectsToL2: boolean;
    l2ConnectsToL3: boolean;
    l3ConnectsToL4: boolean;
    l4ConnectsToL5: boolean;
    l5ConnectsToL6: boolean;
    fullyConnected: boolean;
  };
  variants: HarakatVariant[];
  quranicExample?: QuranicWordExample;
}




