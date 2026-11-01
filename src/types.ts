export interface SurahMeta {
  id: number;
  name: string;
  englishName?: string;
  totalAyahs?: number;
}

// The bundled catalog has complete metadata; search inputs can still use the
// smaller SurahMeta shape without promising an ayah count.
export interface Surah extends SurahMeta {
  englishName: string;
  totalAyahs: number;
}

export interface Reciter {
  id: string;
  name: string;
}

export interface Ayah {
  number: number;
  audio?: string;
  audioSecondary?: string[];
  text: string;
  numberInSurah: number;
  juz: number;
  manzil?: number;
  page?: number;
  ruku?: number;
  hizbQuarter?: number;
  sajda?: boolean;
}

export interface WordData {
  id?: number;
  position?: number;
  text_uthmani?: string;
  text?: string;
  char_type_name?: string;
  verseNumber?: number;
  translation?: {
    text: string;
    language_name?: string;
  };
  transliteration?: {
    text: string;
  };
}

export interface VerseWbw {
  verse_number: number;
  words: WordData[];
}

export interface VerseSegment {
  verseNum: number | string;
  startRatio: number;
  endRatio: number;
  words?: HTMLElement[] | string[];
}

export interface AIAnalysisResult {
  terkip_anlami: string;
  kelime_analizi: Array<{
    kelime: string;
    anlam: string;
    kok_ve_gramer: string;
  }>;
  tafsir_baglami: string;
  nuzul_ve_teknik: string;
}

export interface NamazItem {
  id: string;
  title: string;
  category: 'sure' | 'dua';
  placeInPrayer: string;
  surahNumber?: number;
  arabic: string;
  turkishReading: string;
  reading?: string;
  meaning: string;
  audioUrl: string;
  sentences?: Array<{
    arabic: string;
    reading: string;
    meaning: string;
    audioUrl?: string;
  }>;
}

export interface AmbienceSlide {
  id: string;
  title: string;
  location: string;
  imageUrl: string;
  description: string;
}
