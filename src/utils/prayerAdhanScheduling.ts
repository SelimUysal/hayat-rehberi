/**
 * No four-second polling: schedule near the next computed prayer event.
 * A sparse safety wake-up also detects changes to the system clock.
 */
export const ADHAN_MAX_RECHECK_MS = 15 * 60_000;
export const PRAYER_LOCATION_CHANGED_EVENT = 'namaz-current-location-updated';

export function nextAdhanCheckDelay(nowMs: number, eventInstants: readonly number[]): number {
  const upcoming = eventInstants.filter(instant => Number.isFinite(instant) && instant > nowMs);
  if (upcoming.length === 0) return ADHAN_MAX_RECHECK_MS;
  const next = Math.min(...upcoming);
  // A small margin ensures Date.now() reaches the scheduled minute in timers.
  return Math.max(100, Math.min(ADHAN_MAX_RECHECK_MS, next - nowMs + 50));
}
