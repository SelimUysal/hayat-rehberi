/** Local-only, bounded technical diagnostics for the Ezber Asistanı. No microphone data or ayet text. */
export type EzberEventCode =
  | 'VIEW_CHANGE' | 'SURAH_LOAD_START' | 'SURAH_LOAD_OK' | 'SURAH_LOAD_FAILED'
  | 'VERSE_MISSING_AUDIO' | 'VERSE_PLAY_START' | 'VERSE_PLAY_ERROR'
  | 'VERSE_PLAY_REJECTED' | 'VERSE_REPEAT' | 'VERSE_NEXT' | 'PLAY_STOP'
  | 'SEGMENT_START' | 'SEGMENT_END' | 'SEGMENT_PLAY_ERROR' | 'SEGMENT_PLAY_REJECTED'
  | 'MIC_UNSUPPORTED' | 'MIC_PERMISSION_ERROR' | 'RECORD_START'
  | 'RECORD_STOP' | 'RECORD_EMPTY' | 'RECORD_ERROR' | 'RECORD_PLAY_ERROR'
  | 'RECORD_DB_READ_FAILED' | 'RECORD_DB_WRITE_FAILED'
  | 'PREFERENCE_SAVE_FAILED' | 'RENDER_ERROR'
  | 'APP_BACKGROUND' | 'APP_FOREGROUND' | 'FOLLOW_RESYNC';
export type EzberEventLevel = 'info' | 'warning' | 'error';
export interface EzberEvent {
  time: string;
  code: EzberEventCode;
  level: EzberEventLevel;
  surah?: number;
  verse?: number;
  detail?: Record<string, string | number | boolean>;
}
const KEY = 'ezber_assistant_diagnostics_v1';
const LIMIT = 80;
const MAX_AGE = 7 * 86400 * 1000;
const ALLOWED = new Set<string>([
  'VIEW_CHANGE','SURAH_LOAD_START','SURAH_LOAD_OK','SURAH_LOAD_FAILED',
  'VERSE_MISSING_AUDIO','VERSE_PLAY_START','VERSE_PLAY_ERROR',
  'VERSE_PLAY_REJECTED','VERSE_REPEAT','VERSE_NEXT','PLAY_STOP',
  'SEGMENT_START','SEGMENT_END','SEGMENT_PLAY_ERROR','SEGMENT_PLAY_REJECTED',
  'MIC_UNSUPPORTED','MIC_PERMISSION_ERROR','RECORD_START',
  'RECORD_STOP','RECORD_EMPTY','RECORD_ERROR','RECORD_PLAY_ERROR',
  'RECORD_DB_READ_FAILED','RECORD_DB_WRITE_FAILED',
  'PREFERENCE_SAVE_FAILED','RENDER_ERROR',
  'APP_BACKGROUND','APP_FOREGROUND','FOLLOW_RESYNC'
]);
const FIELDS = new Set(['mode','name','mediaCode','networkState','readyState','online','repeat','segment','stage','duration']);
let fallback: EzberEvent[] = [];

function valid(value: unknown): value is EzberEvent {
  if (!value || typeof value !== 'object') return false;
  const x = value as Partial<EzberEvent>;
  return typeof x.time === 'string' && Number.isFinite(Date.parse(x.time)) &&
    ALLOWED.has(String(x.code)) && (x.level === 'info' || x.level === 'warning' || x.level === 'error');
}
function bounded(rows: EzberEvent[]): EzberEvent[] {
  const cutoff = Date.now() - MAX_AGE;
  return rows.filter(e => valid(e) && Date.parse(e.time) >= cutoff).slice(-LIMIT);
}
export function readEzberEvents(): EzberEvent[] {
  try {
    if (typeof localStorage === 'undefined') return [...fallback];
    const raw = localStorage.getItem(KEY);
    if (!raw) return [...fallback];
    const rows: unknown = JSON.parse(raw);
    return Array.isArray(rows) ? bounded(rows as EzberEvent[]) : [...fallback];
  } catch {
    return [...fallback];
  }
}
export function ezberErrorName(error: unknown): string {
  const name = error && typeof error === 'object' && 'name' in error
    ? String((error as { name: unknown }).name) : 'UnknownError';
  return name === 'Error' || /^[A-Za-z]{2,32}Error$/.test(name) ? name : 'UnknownError';
}
export function recordEzberEvent(
  code: EzberEventCode, level: EzberEventLevel = 'info',
  data: { surah?: number; verse?: number; detail?: Record<string, unknown> } = {}
): void {
  if (!ALLOWED.has(code)) return;
  const clean: Record<string,string|number|boolean> = {};
  for (const [key,value] of Object.entries(data.detail || {})) {
    if (!FIELDS.has(key)) continue;
    if (typeof value === 'boolean') clean[key] = value;
    else if (typeof value === 'number' && Number.isFinite(value)) clean[key] = Math.round(value*100)/100;
    else if (typeof value === 'string') clean[key] = /^[A-Za-z0-9_-]{1,36}$/.test(value) ? value : 'redacted';
  }
  const entry: EzberEvent = {
    time: new Date().toISOString(), code, level,
    ...(Number.isInteger(data.surah) && data.surah!>=1 && data.surah!<=114 ? {surah:data.surah} : {}),
    ...(Number.isInteger(data.verse) && data.verse!>=1 && data.verse!<=300 ? {verse:data.verse} : {}),
    ...(Object.keys(clean).length ? {detail:clean} : {})
  };
  fallback = bounded([...readEzberEvents(),entry]);
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY,JSON.stringify(fallback));
  } catch {}
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('ezber:diagnostics'));
}
export function clearEzberEvents(): void {
  fallback=[];
  try {if (typeof localStorage !== 'undefined') localStorage.removeItem(KEY);} catch {}
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('ezber:diagnostics'));
}
export function ezberReport(): string {
  const events=readEzberEvents();
  return [
    'HAYAT REHBERI - EZBER ASISTANI TEKNIK RAPORU',
    'Olusturma: '+new Date().toISOString(),
    'Kayitlar: '+events.length+' / 80 (7 gun)',
    'Yalnizca bu cihazda saklanir; otomatik gonderilmez.',
    'Ses kayitlari, Kur-an metni, mikrofon verileri, URL ve hata mesajlari bulunmaz.',
    '---',
    ...events.map(x=>[
      x.time,x.level.toUpperCase(),x.code,
      x.surah?'sure='+x.surah:'',
      x.verse?'ayet='+x.verse:'',
      x.detail?Object.entries(x.detail).map(([k,v])=>k+'='+v).join(' '):''
    ].filter(Boolean).join(' | '))
  ].join('\n');
}
