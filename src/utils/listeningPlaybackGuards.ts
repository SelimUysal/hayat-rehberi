import { SURAHS } from '../data/surahs';

/** The last surah loops to the first, preserving continuous listening forever. */
export function nextSurahInListeningLoop(currentSurahId: number): number {
  return currentSurahId >= 1 && currentSurahId < 114 ? currentSurahId + 1 : 1;
}

/**
 * The previous button moves to the prior ayah, even across surah boundaries.
 * At Fâtiha's first ayah, loop backward to Nâs's final ayah.
 */
export function previousAyahInListeningSequence(surahId: number, ayahIndex: number): { surahId: number; ayahIndex: number } | null {
  if (!Number.isInteger(surahId) || surahId < 1 || surahId > 114 ||
      !Number.isInteger(ayahIndex) || ayahIndex < 0) return null;
  if (ayahIndex > 0) return { surahId, ayahIndex: ayahIndex - 1 };
  const previousSurahId = surahId === 1 ? 114 : surahId - 1;
  const previousSurah = SURAHS.find(surah => surah.id === previousSurahId);
  return previousSurah && previousSurah.totalAyahs > 0
    ? { surahId: previousSurah.id, ayahIndex: previousSurah.totalAyahs - 1 }
    : null;
}
