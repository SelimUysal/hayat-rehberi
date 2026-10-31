import { SURAHS } from '../data/surahs';

export const AB_LOOP_STORAGE_KEY = 'quran_listening_ab_loop_v1';

export type ABPoint = { surahId: number; ayahIndex: number; seconds: number };
export type ABLoopSettings = {
  start: ABPoint;
  end: ABPoint;
  /** null = unlimited repeats */
  repeatLimit: number | null;
};
export type ABLoopState = ABLoopSettings & {
  active: boolean;
  completed: number;
};

export const DEFAULT_AB_LOOP: ABLoopState = {
  active: false,
  start: { surahId: 1, ayahIndex: 0, seconds: 0 },
  end: { surahId: 1, ayahIndex: 0, seconds: 0 },
  repeatLimit: null,
  completed: 0,
};

export function validABPoint(point: unknown): point is ABPoint {
  if (!point || typeof point !== 'object') return false;
  const p = point as Partial<ABPoint>;
  const surah = SURAHS.find(s => s.id === p.surahId);
  return !!surah && Number.isInteger(p.ayahIndex) && p.ayahIndex! >= 0 &&
    p.ayahIndex! < surah.totalAyahs &&
    typeof p.seconds === 'number' && Number.isFinite(p.seconds) &&
    p.seconds >= 0 && p.seconds <= 3600;
}
export function compareABPoints(a: ABPoint, b: ABPoint): number {
  return a.surahId - b.surahId || a.ayahIndex - b.ayahIndex || a.seconds - b.seconds;
}

/** End seconds=0 means end of that ayah, not its first millisecond. */
export function validateABRange(start: ABPoint, end: ABPoint): string | null {
  if (!validABPoint(start) || !validABPoint(end)) return 'Sure, ayet veya saniye geçersiz.';
  const verseOrder = start.surahId - end.surahId || start.ayahIndex - end.ayahIndex;
  if (verseOrder > 0) return 'Başlangıç noktası bitişten sonra olamaz.';
  if (verseOrder === 0 && end.seconds > 0 && end.seconds <= start.seconds + 0.2) {
    return 'Aynı ayette bitiş saniyesi başlangıçtan sonra olmalı.';
  }
  return null;
}
export function inABRange(state: ABLoopSettings, surahId: number, ayahIndex: number): boolean {
  const verse = { surahId, ayahIndex, seconds: 0 };
  const min = { ...state.start, seconds: 0 };
  const max = { ...state.end, seconds: 0 };
  return compareABPoints(min, verse) <= 0 && compareABPoints(verse, max) <= 0;
}
export function isABEndAyah(state: ABLoopSettings, surahId: number, ayahIndex: number): boolean {
  return state.end.surahId === surahId && state.end.ayahIndex === ayahIndex;
}
export function completeABIteration(state: ABLoopState): ABLoopState {
  if (!state.active) return state;
  const completed = state.completed + 1;
  return {
    ...state, completed,
    active: state.repeatLimit === null || completed < state.repeatLimit,
  };
}
export function readABLoop(): ABLoopState {
  try {
    const raw = JSON.parse(localStorage.getItem(AB_LOOP_STORAGE_KEY) || 'null');
    if (!raw || typeof raw !== 'object' || !validABPoint(raw.start) ||
      !validABPoint(raw.end) || validateABRange(raw.start, raw.end) ||
      !Number.isSafeInteger(raw.completed) || raw.completed < 0 ||
      !(raw.repeatLimit === null || (Number.isSafeInteger(raw.repeatLimit) && raw.repeatLimit >= 1 && raw.repeatLimit <= 10000))) {
      return DEFAULT_AB_LOOP;
    }
    // Restore configuration and counter, never autoplay after a new browser session.
    return {start: raw.start, end: raw.end, repeatLimit: raw.repeatLimit,
      completed: raw.completed, active: false};
  } catch { return DEFAULT_AB_LOOP; }
}
export function saveABLoop(state: ABLoopState): boolean {
  if (validateABRange(state.start, state.end) ||
      !Number.isSafeInteger(state.completed) || state.completed < 0 ||
      !(state.repeatLimit === null || (Number.isSafeInteger(state.repeatLimit) &&
        state.repeatLimit >= 1 && state.repeatLimit <= 10000))) return false;
  try {
    localStorage.setItem(AB_LOOP_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch { return false; }
}
export function labelABPoint(point: ABPoint): string {
  const surah = SURAHS.find(s => s.id === point.surahId);
  return `${surah?.name ?? 'Sure'} · ${point.ayahIndex + 1}. ayet`;
}
