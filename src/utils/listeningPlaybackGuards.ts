import { SURAHS } from '../data/surahs';

/** The last surah loops to the first, preserving continuous listening forever. */
export function nextSurahInListeningLoop(currentSurahId: number): number {
  return currentSurahId >= 1 && currentSurahId < 114 ? currentSurahId + 1 : 1;
}

/**
 * The previous button moves to the prior ayah, even across surah boundaries.
 * Fâtiha's first ayah is the start of the Quran and has no earlier ayah.
 */
export function previousAyahInListeningSequence(surahId: number, ayahIndex: number): { surahId: number; ayahIndex: number } | null {
  if (!Number.isInteger(surahId) || surahId < 1 || surahId > 114 ||
      !Number.isInteger(ayahIndex) || ayahIndex < 0) return null;
  if (ayahIndex > 0) return { surahId, ayahIndex: ayahIndex - 1 };
  if (surahId === 1) return null;
  const previousSurah = SURAHS.find(surah => surah.id === surahId - 1);
  return previousSurah && previousSurah.totalAyahs > 0
    ? { surahId: previousSurah.id, ayahIndex: previousSurah.totalAyahs - 1 }
    : null;
}
