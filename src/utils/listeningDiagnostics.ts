/**
 * Bounded, on-device troubleshooting events for Quran continuous listening.
 * Only explicit, allowlisted technical fields are retained. We never store
 * audio URLs, personal identifiers, Arabic text, stack traces or user-agent.
 */
export type DiagnosticLevel = 'info' | 'warning' | 'error';
export type DiagnosticCode =
  | 'SESSION_STARTED' | 'USER_PLAY' | 'USER_PAUSE' | 'SLEEP_STOP'
  | 'AYAH_START' | 'AYAH_ENDED' | 'AYAH_ADVANCE' | 'SURAH_ADVANCE'
  | 'AUDIO_PLAYING' | 'AUDIO_PLAY_REJECTED' | 'AUDIO_RESOURCE_ERROR'
  | 'AUDIO_MISSING' | 'AUDIO_STALLED' | 'RECONNECT_SCHEDULED'
  | 'RECONNECT_ATTEMPT' | 'RECONNECT_RECOVERED' | 'SURAH_LOAD_FAILED'
  | 'SURAH_LOAD_RETRY' | 'SURAH_LOADED' | 'BOOKMARK_SAVE_FAILED'
  | 'BOOKMARK_INVALID' | 'MEDIA_SESSION_FAILED' | 'PLAYER_UNMOUNT'
  | 'RENDER_FAILURE' | 'BACKGROUND' | 'FOREGROUND';

export interface ListeningDiagnostic {
  time: string;
  level: DiagnosticLevel;
  code: DiagnosticCode;
  surah?: number;
  ayah?: number;
  details?: Record<string, string | number | boolean>;
}

type TechnicalDetails = Record<string, string | number | boolean | null | undefined>;

const STORAGE_KEY = 'quran_listening_diagnostics_v1';
const LIMIT = 80;
const RETAIN_MS = 3 * 24 * 60 * 60 * 1000;
const ALLOWED_FIELDS = new Set([
  'reason', 'errorName', 'httpStatus', 'mediaCode', 'retry', 'seconds',
  'duration', 'readyState', 'networkState', 'online', 'mode', 'request',
]);
const ALLOWED_CODES = new Set<DiagnosticCode>([
  'SESSION_STARTED', 'USER_PLAY', 'USER_PAUSE', 'SLEEP_STOP',
  'AYAH_START', 'AYAH_ENDED', 'AYAH_ADVANCE', 'SURAH_ADVANCE',
  'AUDIO_PLAYING', 'AUDIO_PLAY_REJECTED', 'AUDIO_RESOURCE_ERROR',
  'AUDIO_MISSING', 'AUDIO_STALLED', 'RECONNECT_SCHEDULED',
  'RECONNECT_ATTEMPT', 'RECONNECT_RECOVERED', 'SURAH_LOAD_FAILED',
  'SURAH_LOAD_RETRY', 'SURAH_LOADED', 'BOOKMARK_SAVE_FAILED',
  'BOOKMARK_INVALID', 'MEDIA_SESSION_FAILED', 'PLAYER_UNMOUNT',
  'RENDER_FAILURE', 'BACKGROUND', 'FOREGROUND',
]);
let memoryEvents: ListeningDiagnostic[] = [];

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function validEvent(value: unknown): value is ListeningDiagnostic {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<ListeningDiagnostic>;
  return typeof entry.time === 'string' &&
    (entry.level === 'info' || entry.level === 'warning' || entry.level === 'error') &&
    ALLOWED_CODES.has(entry.code as DiagnosticCode) &&
    Number.isFinite(Date.parse(entry.time));
}

function recentEntries(data: ListeningDiagnostic[]): ListeningDiagnostic[] {
  const floor = Date.now() - RETAIN_MS;
  return data.filter((event) => validEvent(event) && Date.parse(event.time) >= floor).slice(-LIMIT);
}

export function readListeningDiagnostics(): ListeningDiagnostic[] {
  if (!hasStorage()) return [...memoryEvents];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...memoryEvents];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...memoryEvents];
    const valid = recentEntries(parsed as ListeningDiagnostic[]);
    return valid.length ? valid : [...memoryEvents];
  } catch {
    return [...memoryEvents];
  }
}

export function recordListeningDiagnostic(
  code: DiagnosticCode,
  level: DiagnosticLevel = 'info',
  context: { surah?: number; ayah?: number; details?: TechnicalDetails } = {},
): void {
  const details: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(context.details || {})) {
    if (!ALLOWED_FIELDS.has(key)) continue;
    if (typeof value === 'boolean') details[key] = value;
    else if (typeof value === 'number' && Number.isFinite(value)) {
      details[key] = Math.round(value * 100) / 100;
    } else if (typeof value === 'string') {
      // Reject arbitrary messages: they may contain a full URL or user data.
      details[key] = /^[a-zA-Z0-9_-]{1,32}$/.test(value) ? value : 'redacted';
    }
  }
  const next: ListeningDiagnostic = {
    time: new Date().toISOString(),
    level,
    code,
    ...(Number.isInteger(context.surah) && context.surah! >= 1 && context.surah! <= 114
      ? { surah: context.surah } : {}),
    ...(Number.isInteger(context.ayah) && context.ayah! >= 1
      ? { ayah: context.ayah } : {}),
    ...(Object.keys(details).length > 0 ? { details } : {}),
  };
  const items = recentEntries([...readListeningDiagnostics(), next]);
  memoryEvents = items;
  if (hasStorage()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage unavailable/full: keep a bounded in-memory fallback.
    }
    window.dispatchEvent(new Event('hayat-rehberi:listening-diagnostic'));
  }
}

export function clearListeningDiagnostics(): void {
  memoryEvents = [];
  if (!hasStorage()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  window.dispatchEvent(new Event('hayat-rehberi:listening-diagnostic'));
}

export function classifyListeningError(error: unknown): { errorName: string; httpStatus?: number } {
  const rawName = error && typeof error === 'object' && 'name' in error
    ? String((error as { name: unknown }).name) : 'UnknownError';
  const errorName = rawName === 'Error' || /^[A-Za-z]{2,32}Error$/.test(rawName) || rawName === 'AbortError'
    ? rawName : 'UnknownError';
  // Extract only the numeric HTTP status, never the exception message or URL.
  const rawMessage = error && typeof error === 'object' && 'message' in error
    ? String((error as { message: unknown }).message) : '';
  const httpMatch = rawMessage.match(/\(([1-5][0-9]{2})\)/);
  return httpMatch ? { errorName, httpStatus: Number(httpMatch[1]) } : { errorName };
}

export function createListeningDiagnosticReport(): string {
  const events = readListeningDiagnostics();
  const version = String(import.meta.env?.VITE_APP_VERSION || 'unknown').slice(0, 12);
  const lines = [
    'HAYAT REHBERI - KESINTISIZ DINLEME TEKNIK RAPORU',
    'Olusturma: ' + new Date().toISOString(),
    'Uygulama surumu: ' + version,
    'Kayit sayisi: ' + events.length,
    'Bu rapor sadece cihazda olusturulur; otomatik gonderilmez.',
    'Ses baglantilari, ayet metinleri, kullanici kimligi ve hata yiginlari kaydedilmez.',
    '---',
  ];
  for (const entry of events) {
    lines.push(
      [entry.time, entry.level.toUpperCase(), entry.code,
        entry.surah ? 'sure=' + entry.surah : '',
        entry.ayah ? 'ayet=' + entry.ayah : '',
        entry.details ? Object.entries(entry.details).map(([k, v]) => k + '=' + v).join(' ') : '',
      ].filter(Boolean).join(' | ')
    );
  }
  return lines.join('\n');
}
