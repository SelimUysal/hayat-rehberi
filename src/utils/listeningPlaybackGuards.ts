/**
 * Media elements emit "pause" when playback naturally reaches the end.
 * Those events must NOT be interpreted as a user pause, otherwise the
 * continuous-recitation transport request gets cancelled before "ended".
 */
export interface NativePauseSnapshot {
  isCurrentPlayer: boolean;
  isPlaybackRequested: boolean;
  ended: boolean;
  duration: number;
  currentTime: number;
}

export function shouldTreatNativePauseAsUserPause(snapshot: NativePauseSnapshot): boolean {
  if (!snapshot.isCurrentPlayer || !snapshot.isPlaybackRequested || snapshot.ended) {
    return false;
  }

  // Some browsers deliver "pause" immediately before the "ended" event.
  // Guard the last audio frame even when ended has not flipped to true yet.
  if (
    Number.isFinite(snapshot.duration) &&
    snapshot.duration > 0 &&
    Number.isFinite(snapshot.currentTime) &&
    snapshot.currentTime >= snapshot.duration - 0.12
  ) {
    return false;
  }
  return true;
}

/** The last surah loops to the first, preserving continuous listening forever. */
export function nextSurahInListeningLoop(currentSurahId: number): number {
  return currentSurahId >= 1 && currentSurahId < 114 ? currentSurahId + 1 : 1;
}
