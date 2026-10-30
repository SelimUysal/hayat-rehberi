/** The last surah loops to the first, preserving continuous listening forever. */
export function nextSurahInListeningLoop(currentSurahId: number): number {
  return currentSurahId >= 1 && currentSurahId < 114 ? currentSurahId + 1 : 1;
}
