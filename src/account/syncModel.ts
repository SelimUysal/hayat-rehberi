// Only durable progress is synced. Device settings, recordings, diagnostics,
// location, tokens and playback clocks are deliberately outside this allowlist.
export const SYNC_KEYS = [
  'namaz_memorized_ids', 'esma_learned_names', 'elifba_state',
  'tecvid_completed_lessons', 'ezber_saved_surahs',
  'hayat_rehberi_hadis_user_state_v1', 'hayat_rehberi_hadis_custom_order_v1',
  'hayat_rehberi_hadis_activity_logs_v1', 'quran_listening_manual_bookmarks_v1',
  'kuran_user_bookmarks_v1', 'kuran_mushaf_read_pages_v1',
  'kaza_namazlari_data', 'kaza_custom_counters_data', 'hayat_rehberi_special_goals_v1',
  'appData', 'quran_listening_completed_cycles_v1',
] as const;
export type Values = Record<string, string | null>;
export type Operation = { id: string; key: string; base: string | null; value: string | null; initial?: boolean };
export const SYNC_APPLIED = 'hayat-account-data-applied';
export const MAX_VALUE_LENGTH = 1_000_000;
export const allowedKey = (key: string) => (SYNC_KEYS as readonly string[]).includes(key) || /^kaza_today_20\d{2}-\d{2}-\d{2}$/.test(key);
export class SyncConflict extends Error {
  constructor(public key: string) { super('İki cihaz aynı kaydı farklı değiştirdi.'); }
}
const forbidden = new Set(['__proto__', 'constructor', 'prototype']);
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const object = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);
const counterKeys = new Set(['count', 'completed', 'initial', 'reviewCount']);
const scalarCounter = (key: string) => key.startsWith('kaza_today_') || key === 'quran_listening_completed_cycles_v1';
function safeJson(value: unknown, depth = 0): boolean {
  if (depth > 10) return false;
  if (value === null || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER;
  if (typeof value === 'string') return value.length <= 10_000;
  if (Array.isArray(value)) return value.length <= 5000 && value.every(v => safeJson(v, depth + 1));
  return object(value) && Object.keys(value).length <= 5000 &&
    Object.entries(value).every(([k,v]) => k.length <= 150 && !forbidden.has(k) && safeJson(v, depth + 1));
}
export function validValue(key: string, raw: unknown): raw is string | null {
  if (!allowedKey(key) || (raw !== null && typeof raw !== 'string')) return false;
  if (raw === null) return true;
  if (raw.length > MAX_VALUE_LENGTH) return false;
  try {
    const v = JSON.parse(raw);
    if (!safeJson(v)) return false;
    if (scalarCounter(key)) return Number.isSafeInteger(v) && v >= 0;
    if (key === 'appData') return object(v) && Object.keys(v).every(k => ['left','right','history'].includes(k)) &&
      [v.left,v.right].every(a => Array.isArray(a) && a.every(x => typeof x === 'string' && x.length > 0 && x.length <= 500)) &&
      new Set([...v.left,...v.right]).size === v.left.length + v.right.length &&
      Array.isArray(v.history) && v.history.every(x => object(x) && typeof x.name === 'string' && typeof x.time === 'string' &&
        ['Kılınmayanlar','Kılınanlar'].includes(x.from) && ['Kılınmayanlar','Kılınanlar'].includes(x.to));
    if (['esma_learned_names','elifba_state','tecvid_completed_lessons'].includes(key))
      return object(v) && Object.values(v).every(x => typeof x === 'boolean');
    if (key === 'hayat_rehberi_hadis_user_state_v1') return object(v) && Object.values(v).every(x => object(x) &&
      Object.keys(x).every(k => ['isFavorite','isMemorized','userNote','memorizedAt','lastReviewedAt','reviewCount'].includes(k)) &&
      ['isFavorite','isMemorized'].every(k => x[k] === undefined || typeof x[k] === 'boolean') &&
      (x.userNote === undefined || typeof x.userNote === 'string') &&
      (x.reviewCount === undefined || Number.isSafeInteger(x.reviewCount) && x.reviewCount >= 0));
    if (!Array.isArray(v)) return false;
    const identity = key === 'kuran_user_bookmarks_v1' ? 'page' : 'id';
    if (v.some(object) && new Set(v.map(x => object(x) ? x[identity] : undefined)).size !== v.length) return false;
    if (key === 'namaz_memorized_ids') return v.length <= 1000 && v.every(x => typeof x === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(x));
    if (key === 'ezber_saved_surahs') return v.length <= 114 && v.every(x => Number.isInteger(x) && x >= 1 && x <= 114);
    if (key === 'kuran_mushaf_read_pages_v1') return v.length <= 604 && v.every(x => Number.isInteger(x) && x >= 1 && x <= 604);
    if (key === 'hayat_rehberi_hadis_custom_order_v1') return v.every(x => Number.isSafeInteger(x) && x > 0);
    if (key === 'kuran_user_bookmarks_v1') return v.length <= 25 && v.every(x => object(x) && Number.isInteger(x.page) && x.page >= 1 && x.page <= 604 && typeof x.title === 'string' && x.title.length <= 120 && typeof x.note === 'string' && x.note.length <= 1000);
    if (key === 'quran_listening_manual_bookmarks_v1') return v.length <= 50 && v.every(x => object(x) && typeof x.id === 'string' && typeof x.name === 'string' && x.name.length <= 60 && typeof x.note === 'string' && x.note.length <= 160 && Number.isInteger(x.surahId) && x.surahId >= 1 && x.surahId <= 114 && Number.isInteger(x.ayahIndex) && x.ayahIndex >= 0 && Number.isFinite(x.currentTime) && x.currentTime >= 0 && x.currentTime <= 3600 && typeof x.reciter === 'string' && typeof x.createdAt === 'string');
    if (key.startsWith('kaza_')) return v.length <= 1000 && v.every(x => object(x) && typeof x.id === 'string' && Number.isSafeInteger(x.count) && x.count >= 0 && Number.isSafeInteger(x.completed) && x.completed >= 0 &&
      (key !== 'kaza_custom_counters_data' || typeof x.title === 'string' && typeof x.unit === 'string'));
    if (key === 'hayat_rehberi_special_goals_v1') return v.every(x => object(x) && typeof x.id === 'string' && typeof x.title === 'string' && typeof x.description === 'string' && typeof x.targetISO === 'string' && Number.isFinite(x.targetTimestamp) && Number.isFinite(x.createdAt));
    return v.every(x => object(x) && typeof x.id === 'string' && Number.isSafeInteger(x.hadisId) && typeof x.timestamp === 'string' && typeof x.action === 'string' && typeof x.kategori === 'string');
  } catch { return false; }
}
function emptyFor(key: string) {
  if (scalarCounter(key)) return 0;
  if (key === 'appData') return {left:[],right:[],history:[]};
  return ['esma_learned_names','elifba_state','tecvid_completed_lessons','hayat_rehberi_hadis_user_state_v1'].includes(key) ? {} : [];
}
function mergeNode(base: any, next: any, remote: any, key: string, initial: boolean, resolve: boolean, field = ''): any {
  if (eq(base,next)) return remote;
  if (eq(base,remote)) return next;
  if (typeof next === 'number' && typeof remote === 'number' && (counterKeys.has(field) || scalarCounter(key))) {
    if (initial || field === 'initial') return Math.max(next,remote);
    const before = typeof base === 'number' ? base : 0;
    const result = remote + next - before;
    if (!Number.isSafeInteger(result) || result < 0 || (field !== 'count' && next < before)) {
      if (resolve) return next;
      throw new SyncConflict(key);
    }
    return result;
  }
  if (object(next) && object(remote)) {
    const result = { ...remote };
    for (const k of new Set([...Object.keys(base || {}), ...Object.keys(next)])) {
      if (forbidden.has(k)) continue;
      if (!(k in next)) {
        if (!initial) {
          if (k in remote && !eq(base?.[k],remote[k]) && !resolve) throw new SyncConflict(key);
          delete result[k];
        }
        continue;
      }
      if (!(k in remote)) {
        if (base && k in base) {
          if (eq(base[k],next[k])) continue;
          if (!resolve) throw new SyncConflict(key);
        }
        result[k] = next[k];
      }
      else result[k] = mergeNode(base?.[k],next[k],remote[k],key,initial,resolve,k);
    }
    if (typeof result.initial === 'number' && typeof result.count === 'number' && typeof result.completed === 'number')
      result.initial = Math.max(result.initial,result.count + result.completed);
    if (initial && key.startsWith('kaza_') && typeof next.count === 'number' && typeof remote.count === 'number' && typeof next.completed === 'number' && typeof remote.completed === 'number') {
      const total = Math.max(next.count + next.completed,remote.count + remote.completed,next.initial || 0,remote.initial || 0);
      result.completed = Math.max(next.completed,remote.completed);
      result.count = Math.max(0,total - result.completed);
      if ('initial' in result) result.initial = total;
    }
    return result;
  }
  if (Array.isArray(next) && Array.isArray(remote)) {
    const before = Array.isArray(base) ? base : [];
    if ([...next,...remote,...before].every(x => typeof x === 'string' || typeof x === 'number')) {
      if (key === 'hayat_rehberi_hadis_custom_order_v1') {
        if (eq(next,remote)) return remote;
        if (initial) return [...new Set([...next,...remote])];
        if (resolve) return next;
        throw new SyncConflict(key);
      }
      const removed = new Set(initial ? [] : before.filter(x => !next.includes(x)));
      return [...new Set([...remote.filter(x => !removed.has(x)),...next.filter(x => initial || !before.includes(x))])];
    }
    const identity = key === 'kuran_user_bookmarks_v1' ? 'page' : 'id';
    const lookup = (items: any[]) => Object.fromEntries(items.filter(object).map(x => [String(x[identity]),x]));
    const merged = mergeNode(lookup(before),lookup(next),lookup(remote),key,initial,resolve);
    const order = [...new Set([...next,...remote].map(x => String(x[identity])))];
    return order.filter(id => merged[id] !== undefined).map(id => merged[id]);
  }
  if (eq(next,remote)) return remote;
  // A note edited differently on two devices must never be silently overwritten.
  if (resolve) return next;
  if (initial && typeof next === 'boolean' && typeof remote === 'boolean') return next || remote;
  throw new SyncConflict(key);
}
export function mergeValue(op: Operation, remote: string | null, resolve = false): string | null {
  if (!validValue(op.key,op.value) || !validValue(op.key,op.base) || !validValue(op.key,remote)) throw new Error('Geçersiz eşitleme verisi.');
  if (op.value === op.base) return remote;
  if (op.value === null) {
    if (remote !== op.base && remote !== null && !resolve) throw new SyncConflict(op.key);
    return null;
  }
  const empty = emptyFor(op.key);
  const before = op.base === null ? empty : JSON.parse(op.base);
  const next = JSON.parse(op.value);
  const cloud = remote === null ? empty : JSON.parse(remote);
  let merged;
  if (op.key === 'appData') {
    const sides = (v: any) => Object.fromEntries([...v.left.map((n:string) => ['name:'+n,'left']),...v.right.map((n:string) => ['name:'+n,'right'])]);
    const b = sides(before), n = sides(next), r = sides(cloud);
    if (op.initial) for (const name of Object.keys(n)) if (r[name] === 'right') n[name] = 'right';
    const positions = mergeNode(b,n,r,op.key,!!op.initial,resolve);
    const names = [...new Set([...next.left,...next.right,...cloud.left,...cloud.right])];
    const encode = (h: unknown) => JSON.stringify(h);
    const history = mergeNode(before.history.map(encode),next.history.map(encode),cloud.history.map(encode),op.key,!!op.initial,resolve).map((h:string) => JSON.parse(h));
    merged = {left:names.filter(name => positions['name:'+name] === 'left'),right:names.filter(name => positions['name:'+name] === 'right'),history};
  } else merged = mergeNode(before,next,cloud,op.key,!!op.initial,resolve);
  const raw = JSON.stringify(merged);
  if (!validValue(op.key,raw)) throw new SyncConflict(op.key);
  return raw;
}
export function snapshot(storage: Storage, known: Values = {}): Values {
  const values: Values = {};
  for (const key of [...SYNC_KEYS,...Array.from({length:storage.length},(_,i) => storage.key(i) || '').filter(k => /^kaza_today_/.test(k))]) {
    const value = storage.getItem(key);
    if (value !== known[key] && !validValue(key,value)) throw new Error('Bir cihaz kaydı desteklenen biçim veya boyut sınırını aşıyor. Kayıt silinmedi ve buluta gönderilmedi.');
    values[key] = value;
  }
  return values;
}
export function applyValues(values: Values, storage: Storage, known: Values = {}): string[] {
  const changed: string[] = [];
  const all = new Set([...Object.keys(snapshot(storage,known)),...Object.keys(values)]);
  if (Object.entries(values).some(([key,value]) => value !== known[key] && !validValue(key,value))) throw new Error('Geçersiz bulut kaydı uygulanmadı.');
  const previous = Object.fromEntries([...all].map(key => [key,storage.getItem(key)]));
  try {
  for (const key of all) {
    const next = values[key] ?? null;
    if (!validValue(key,next) || storage.getItem(key) === next) continue;
    if (next === null) storage.removeItem(key); else storage.setItem(key,next);
    changed.push(key);
  }
  } catch (error) {
    for (const key of changed.reverse()) {
      try { const value = previous[key]; if (value === null) storage.removeItem(key); else storage.setItem(key,value); } catch {}
    }
    throw error;
  }
  return changed;
}
