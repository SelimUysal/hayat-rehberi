/** On-device, privacy-safe technical diagnostics for Namaz Vakitleri Takvimi. */
export type PrayerIssueLevel = 'warning' | 'error';
export type PrayerIssueArea = 'app' | 'calendar' | 'city' | 'timezone' | 'export' | 'audio' | 'view';
export interface PrayerIssue {
  at: string;
  level: PrayerIssueLevel;
  area: PrayerIssueArea;
  action: string;
  errorName: string;
}
const STORAGE_KEY = 'prayer_calendar_diagnostics_v1';
const CHANGE_EVENT = 'prayer:diagnostics-changed';
const LIMIT = 80;
const MAX_AGE = 7 * 86400000;
let memory: PrayerIssue[] = [];
const allowedAreas = new Set<PrayerIssueArea>(['app','calendar','city','timezone','export','audio','view']);
function safeName(error: unknown): string {
  if (error instanceof Error) {
    const name = error.name.replace(/[^a-zA-Z]/g, '').slice(0, 40);
    return name || 'Error';
  }
  return 'UnknownError';
}
function validIssue(value: unknown): value is PrayerIssue {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<PrayerIssue>;
  return typeof v.at === 'string' && Number.isFinite(Date.parse(v.at)) &&
    (v.level === 'error' || v.level === 'warning') &&
    !!v.area && allowedAreas.has(v.area) &&
    typeof v.action === 'string' && /^[a-zA-Z0-9_-]{1,45}$/.test(v.action) &&
    typeof v.errorName === 'string' && /^[a-zA-Z]{1,40}$/.test(v.errorName);
}
function bounded(list: PrayerIssue[]): PrayerIssue[] {
  const since = Date.now() - MAX_AGE;
  return list.filter(e => validIssue(e) && Date.parse(e.at) >= since).slice(-LIMIT);
}
export function readPrayerIssues(): PrayerIssue[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return bounded(memory);
    const value: unknown = JSON.parse(raw);
    if (Array.isArray(value)) return bounded(value).concat(bounded(memory)).slice(-LIMIT);
  } catch { /* Storage can be unavailable. */ }
  return bounded(memory);
}
export function recordPrayerIssue(
  area: PrayerIssueArea, action: string, error: unknown, level: PrayerIssueLevel = 'error'
): void {
  // Never save raw error messages, URLs, coordinates, user input or stack traces.
  if (!allowedAreas.has(area) || !/^[a-zA-Z0-9_-]{1,45}$/.test(action)) return;
  const now = Date.now();
  const next: PrayerIssue = {
    at: new Date(now).toISOString(), level, area, action, errorName: safeName(error)
  };
  const previous = readPrayerIssues();
  const last = previous[previous.length - 1];
  if (last && last.area === area && last.action === action &&
      last.errorName === next.errorName && now - Date.parse(last.at) < 30_000) return;
  const updated = bounded([...previous, next]);
  memory = updated;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    memory = [];
  } catch { /* Keep an in-memory fallback. */ }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CHANGE_EVENT));
}
export function clearPrayerIssues(): void {
  memory = [];
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CHANGE_EVENT));
}
export function exportPrayerIssues(): string {
  return [
    'Hayat Rehberi / Namaz Vakitleri — Teknik Hata Raporu',
    'Oluşturulma: ' + new Date().toISOString(),
    'Kişisel konum, adres, ses ve URL kaydedilmez.',
    ...readPrayerIssues().map(e => [e.at, e.level, e.area, e.action, e.errorName].join(' | '))
  ].join('\n');
}
export const PRAYER_DIAGNOSTICS_EVENT = CHANGE_EVENT;
