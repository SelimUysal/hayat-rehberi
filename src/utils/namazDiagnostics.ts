import { ALL_NAMAZ_ITEMS } from '../data/namazData';

export type NamazIssueCode =
  | 'PAGE_OPENED' | 'ITEM_SELECTED' | 'PLAY_STARTED' | 'PLAY_STOPPED'
  | 'SENTENCE_STARTED' | 'AUDIO_STARTED' | 'AUDIO_ENDED'
  | 'AUDIO_MISSING' | 'AUDIO_ERROR' | 'AUDIO_PLAY_REJECTED'
  | 'SPEECH_UNAVAILABLE' | 'SPEECH_ERROR' | 'SPEECH_STARTED'
  | 'STORAGE_READ_ERROR' | 'STORAGE_WRITE_ERROR' | 'CLIPBOARD_ERROR'
  | 'RENDER_ERROR' | 'LOOP_COMPLETED';

export type NamazIssueLevel = 'info' | 'warning' | 'error';

export interface NamazIssue {
  at: string;
  level: NamazIssueLevel;
  code: NamazIssueCode;
  itemId?: string;
  sentence?: number;
  details?: Record<string, string | number | boolean>;
}

const KEY = 'namaz_diagnostics_v1';
const MAX_ENTRIES = 100;
const MAX_AGE_MS = 7 * 86400000;
const validItemIds = new Set(ALL_NAMAZ_ITEMS.map(item => item.id));
const validDetails = new Set(['reason', 'name', 'mediaCode', 'networkState', 'readyState', 'online', 'repeat', 'mode']);
const codes = new Set<NamazIssueCode>([
  'PAGE_OPENED', 'ITEM_SELECTED', 'PLAY_STARTED', 'PLAY_STOPPED', 'SENTENCE_STARTED',
  'AUDIO_STARTED', 'AUDIO_ENDED', 'AUDIO_MISSING', 'AUDIO_ERROR',
  'AUDIO_PLAY_REJECTED', 'SPEECH_UNAVAILABLE', 'SPEECH_ERROR', 'SPEECH_STARTED',
  'STORAGE_READ_ERROR', 'STORAGE_WRITE_ERROR', 'CLIPBOARD_ERROR',
  'RENDER_ERROR', 'LOOP_COMPLETED',
]);
let fallback: NamazIssue[] = [];

function isIssue(value: unknown): value is NamazIssue {
  if (value === null || typeof value !== 'object') return false;
  const e = value as Partial<NamazIssue>;
  return typeof e.at === 'string' && Number.isFinite(Date.parse(e.at)) &&
    codes.has(e.code as NamazIssueCode) &&
    (e.level === 'info' || e.level === 'warning' || e.level === 'error');
}

function trim(events: NamazIssue[]): NamazIssue[] {
  const cutoff = Date.now() - MAX_AGE_MS;
  return events.filter(e => isIssue(e) && Date.parse(e.at) >= cutoff).slice(-MAX_ENTRIES);
}

export function readNamazIssues(): NamazIssue[] {
  if (typeof localStorage === 'undefined') return [...fallback];
  try {
    const data = localStorage.getItem(KEY);
    if (!data) return [...fallback];
    const parsed: unknown = JSON.parse(data);
    return Array.isArray(parsed) ? trim(parsed as NamazIssue[]) : [...fallback];
  } catch {
    return [...fallback];
  }
}

export function recordNamazIssue(
  code: NamazIssueCode,
  level: NamazIssueLevel = 'info',
  context: { itemId?: string; sentence?: number; details?: Record<string, unknown> } = {}
): void {
  const details: Record<string, string | number | boolean> = {};
  for (const [name, value] of Object.entries(context.details || {})) {
    if (!validDetails.has(name)) continue;
    if (typeof value === 'boolean') details[name] = value;
    else if (typeof value === 'number' && Number.isFinite(value)) details[name] = value;
    else if (typeof value === 'string') details[name] = /^[a-zA-Z0-9_-]{1,35}$/.test(value) ? value : 'redacted';
  }
  const event: NamazIssue = {
    at: new Date().toISOString(),
    level,
    code,
    ...(context.itemId && validItemIds.has(context.itemId) ? { itemId: context.itemId } : {}),
    ...(Number.isInteger(context.sentence) && context.sentence! >= 0 && context.sentence! <= 1000
      ? { sentence: context.sentence! + 1 } : {}),
    ...(Object.keys(details).length ? { details } : {}),
  };
  fallback = trim([...readNamazIssues(), event]);
  if (typeof localStorage !== 'undefined') {
    try { localStorage.setItem(KEY, JSON.stringify(fallback)); } catch {}
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('namaz:diagnostics-changed'));
}

export function clearNamazIssues(): void {
  fallback = [];
  if (typeof localStorage !== 'undefined') {
    try { localStorage.removeItem(KEY); } catch {}
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('namaz:diagnostics-changed'));
}

export function safeNamazErrorName(error: unknown): string {
  if (!error || typeof error !== 'object' || !('name' in error)) return 'UnknownError';
  const name = String((error as { name: unknown }).name);
  return name === 'Error' || /^[A-Za-z]{2,35}Error$/.test(name) ? name : 'UnknownError';
}

export function exportNamazIssueReport(): string {
  const events = readNamazIssues();
  return [
    'Hayat Rehberi - Namaz Sureleri / Dualar / Gece Namazlari',
    'Olusturulma: ' + new Date().toISOString(),
    'Kayit sayisi: ' + events.length,
    'Son 100 olay / 7 gun; otomatik gonderim yoktur.',
    'Ses URL, dini metin, kullanici kimligi veya hata mesaji kaydedilmez.',
    '---',
    ...events.map(e => [
      e.at, e.level.toUpperCase(), e.code,
      e.itemId ? 'icerik=' + e.itemId : '',
      e.sentence ? 'cumle=' + e.sentence : '',
      e.details ? Object.entries(e.details).map(([k, v]) => k + '=' + v).join(' ') : '',
    ].filter(Boolean).join(' | ')),
  ].join('\n');
}
