/** Privacy-first, on-device capture of browser errors (desktop and mobile). */
export type GlobalErrorSource = 'javascript' | 'promise' | 'console' | 'resource' | 'react' | 'mushaf' | 'test';
export interface GlobalErrorEntry {
  id: string;
  at: string;
  lastAt: string;
  section: string;
  source: GlobalErrorSource;
  name: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  count: number;
  online?: boolean;
}
const KEY = 'hayat_rehberi_global_errors_v1';
const CHANGED = 'hayat-rehberi:global-errors-changed';
const MAX = 120;
const AGE = 14 * 86400000;
const SOURCES = new Set<GlobalErrorSource>(['javascript','promise','console','resource','react','mushaf','test']);
let memory: GlobalErrorEntry[] = [];
let currentSection = 'takvim';
let installed = false;
let serial = 0;

function safeSection(s: unknown): string {
  const value = typeof s === 'string' ? s.toLowerCase() : '';
  return /^[a-z0-9_-]{1,30}$/.test(value) ? value : 'unknown';
}
export function setGlobalDiagnosticsSection(section: string): void {
  currentSection = safeSection(section);
}
function safeName(value: unknown): string {
  const name = typeof value === 'string' ? value : '';
  return name === 'Error' || /^[A-Za-z]{2,40}Error$/.test(name) ? name : 'UnknownError';
}
function safeMessage(value: unknown): string {
  if (typeof value !== 'string') return '[Mesaj yok]';
  const text = value.trim().replace(/[\r\n\t]/g, ' ').slice(0, 320);
  // Do not save addresses, links, credentials, local paths or arbitrary user text.
  if (!text || /https?:|www\.|@|[/\\]|(?:token|secret|password|cookie|authorization|bearer|api[_-]?key|session|credential)\b/i.test(text)) return '[Gizli ayrıntı çıkarıldı]';
  const isTechnical = /^(?:Uncaught\s+)?(?:[A-Za-z]{2,40}Error:\s*)?(?:Cannot (?:access|read|set|convert|assign|use|find|redefine)|Failed to fetch|Load failed|Script error|Network request failed|Unexpected token|Invalid or unexpected token|Missing initializer|[A-Za-z_$][\w$]{0,35} is not defined|[A-Za-z_$][\w$]{0,35} is not a function)/i.test(text);
  if (!isTechnical) return '[Hata ayrıntısı gizlendi]';
  return text.slice(0, 180).replace(/[<>]/g, '');
}
function safeFile(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) return;
  try {
    const file = new URL(value, typeof location === 'undefined' ? 'https://example.invalid/' : location.href).pathname.split('/').pop() || '';
    return /^[A-Za-z0-9_.-]{1,100}$/.test(file) ? file : undefined;
  } catch { return undefined; }
}
function safePositive(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 && value < 10000000 ? value : undefined;
}
function valid(value: unknown): value is GlobalErrorEntry {
  if (!value || typeof value !== 'object') return false;
  const x = value as Partial<GlobalErrorEntry>;
  return typeof x.id === 'string' && /^[\w.-]{1,90}$/.test(x.id) &&
    typeof x.at === 'string' && Number.isFinite(Date.parse(x.at)) &&
    typeof x.lastAt === 'string' && Number.isFinite(Date.parse(x.lastAt)) &&
    typeof x.section === 'string' && /^[a-z0-9_-]{1,30}$/.test(x.section) &&
    SOURCES.has(x.source as GlobalErrorSource) && typeof x.name === 'string' &&
    typeof x.message === 'string' && typeof x.count === 'number' && x.count >= 1;
}
function trim(items: GlobalErrorEntry[]): GlobalErrorEntry[] {
  const cutoff = Date.now() - AGE;
  return items.filter(e => valid(e) && Date.parse(e.lastAt) >= cutoff).sort((a,b) => a.at.localeCompare(b.at)).slice(-MAX);
}
export function readGlobalErrors(): GlobalErrorEntry[] {
  let stored: GlobalErrorEntry[] = [];
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) stored = trim(parsed as GlobalErrorEntry[]);
    }
  } catch { /* Storage might be blocked; memory keeps recent errors. */ }
  const byId = new Map<string, GlobalErrorEntry>();
  for (const entry of [...stored, ...memory]) byId.set(entry.id, entry);
  return trim([...byId.values()]);
}
export function recordGlobalError(data: {
  source: GlobalErrorSource; section?: string; name?: string; message?: string;
  file?: string; line?: number; column?: number;
}): void {
  if (!SOURCES.has(data.source)) return;
  try {
    const at = new Date().toISOString();
    const section = safeSection(data.section || currentSection);
    const name = safeName(data.name);
    const message = safeMessage(data.message);
    const file = safeFile(data.file);
    const line = safePositive(data.line);
    const column = safePositive(data.column);
    const previous = readGlobalErrors();
    const match = previous.findLast(e => e.section === section && e.name === name && e.message === message &&
      (e.file || '') === (file || '') && Date.now() - Date.parse(e.lastAt) < 5000);
    if (match) {
      memory = trim(previous.map(e => e.id === match.id ? {...e, lastAt: at, count: Math.min(e.count + 1, 9999),
        line: e.line ?? line, column: e.column ?? column, file: e.file ?? file} : e));
    } else {
      const next: GlobalErrorEntry = {
        id: Date.now().toString(36) + '-' + (++serial).toString(36) + '-' + Math.random().toString(36).slice(2,9),
        at, lastAt: at, section, source: data.source, name, message, count: 1,
        ...(file ? {file} : {}), ...(line ? {line} : {}), ...(column ? {column} : {}),
        ...(typeof navigator !== 'undefined' ? {online: navigator.onLine} : {}),
      };
      memory = trim([...previous, next]);
    }
    try { if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(memory)); } catch {}
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(CHANGED));
  } catch { /* Logging must never bring down the application. */ }
}
export function clearGlobalErrors(): void {
  memory = [];
  try { if (typeof localStorage !== 'undefined') localStorage.removeItem(KEY); } catch {}
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CHANGED));
}
export function exportGlobalErrorReport(section?: string): string {
  const rows = readGlobalErrors().filter(e => !section || e.section === section);
  let version = 'unknown';
  try { version = String(import.meta.env?.VITE_APP_VERSION || 'unknown').slice(0, 12); } catch {}
  return [
    'HAYAT REHBERI - OTOMATIK TARAYICI HATA RAPORU',
    'Olusturma: ' + new Date().toISOString(),
    'Uygulama surumu: ' + version,
    'Bolum: ' + (section || 'tum bolumler'),
    'Hata kaydi: ' + rows.length + ' (14 gun / en fazla 120)',
    'Kayitlar cihazda tutulur ve otomatik gonderilmez.',
    'URL, adres, kullanici girisi, token ve tam stack trace kaydedilmez.',
    '---',
    ...rows.map(e => [e.at, e.section, e.source, e.name, e.message,
      e.file ? 'dosya=' + e.file : '',
      e.line ? 'satir=' + e.line : '',
      e.column ? 'sutun=' + e.column : '',
      e.online === undefined ? '' : 'online=' + e.online,
      'tekrar=' + e.count].filter(Boolean).join(' | ')),
  ].join('\n');
}
function fromUnknown(value: unknown): {name: string; message?: string} {
  if (value && typeof value === 'object') {
    const e = value as {name?: unknown; message?: unknown};
    return {name: typeof e.name === 'string' ? e.name : 'Error',
      message: typeof e.message === 'string' ? e.message : undefined};
  }
  return {name:'UnknownError'};
}
export function installGlobalDiagnostics(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  try {
    window.addEventListener('error', event => {
      if (event.target && event.target !== window && !(event instanceof ErrorEvent)) {
        const tag = (event.target as Element).tagName;
        if (tag === 'SCRIPT' || tag === 'LINK') recordGlobalError({
          source:'resource', name:'ResourceError', message:'Script error',
          file:(event.target as HTMLScriptElement).src || (event.target as HTMLLinkElement).href,
        });
        return;
      }
      const error = event as ErrorEvent;
      const info = fromUnknown(error.error);
      recordGlobalError({source:'javascript', name:info.name,
        message:info.message || error.message, file:error.filename, line:error.lineno, column:error.colno});
    }, true);
    window.addEventListener('unhandledrejection', event => {
      const info = fromUnknown(event.reason);
      recordGlobalError({source:'promise', name:info.name, message:info.message});
    });
    const original = console.error;
    console.error = function (...args: unknown[]) {
      original.apply(console, args);
      try {
        const found = args.find(value => value instanceof Error);
        if (found) {
          const error = found as Error;
          recordGlobalError({source:'console', name:error.name, message:error.message});
        } else if (typeof args[0] === 'string' && /^(?:Uncaught|(?:Reference|Syntax|Type|Range)Error:)/.test(args[0])) {
          const msg = args[0] as string;
          recordGlobalError({source:'console', name:msg.match(/([A-Za-z]+Error):/)?.[1] || 'Error', message:msg});
        }
      } catch {}
    };
  } catch { installed = false; }
}
export const GLOBAL_DIAGNOSTIC_EVENT = CHANGED;
