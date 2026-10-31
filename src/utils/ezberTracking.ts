/** Pure playback-position helpers. UI and audio should use the same source of truth. */
export function getEzberWordIndex(seconds: number, duration: number, wordCount: number): number | null {
  if (!Number.isInteger(wordCount) || wordCount <= 0) return null;
  if (!Number.isFinite(seconds) || seconds < 0 || !Number.isFinite(duration) || duration <= 0) return null;
  const ratio = Math.max(0, Math.min(1, seconds / duration));
  return Math.min(wordCount - 1, Math.floor(ratio * wordCount));
}
