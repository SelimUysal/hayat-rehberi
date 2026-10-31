import { RECITERS, SURAHS } from '../data/surahs';

export const MANUAL_LISTENING_BOOKMARK_KEY = 'quran_listening_manual_bookmarks_v1';
export const MAX_MANUAL_LISTENING_BOOKMARKS = 50;

export interface ManualListeningBookmark {
  id: string;
  name: string;
  note: string;
  surahId: number;
  ayahIndex: number;
  currentTime: number;
  reciter: string;
  createdAt: string;
}

export type ListeningBookmarkPosition = Pick<ManualListeningBookmark, 'surahId' | 'ayahIndex' | 'currentTime' | 'reciter'>;

function validPosition(value: ListeningBookmarkPosition): boolean {
  const surah = SURAHS.find(s => s.id === value.surahId);
  return !!surah && Number.isInteger(value.ayahIndex) && value.ayahIndex >= 0 &&
    value.ayahIndex < surah.totalAyahs &&
    Number.isFinite(value.currentTime) && value.currentTime >= 0 && value.currentTime <= 3600 &&
    RECITERS.some(r => r.id === value.reciter);
}

export function bookmarkLabel(position: ListeningBookmarkPosition): string {
  const surah = SURAHS.find(s => s.id === position.surahId);
  return `${surah?.name ?? 'Sure'} · ${position.ayahIndex + 1}. ayet`;
}

export function formatListeningBookmarkTime(seconds: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(safe / 60).toString().padStart(2, '0')}:${(safe % 60).toString().padStart(2, '0')}`;
}

export function readManualListeningBookmarks(): ManualListeningBookmark[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(MANUAL_LISTENING_BOOKMARK_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    const ids = new Set<string>();
    return parsed.filter((value): value is ManualListeningBookmark => {
      if (!value || typeof value !== 'object') return false;
      const b = value as Partial<ManualListeningBookmark>;
      if (typeof b.id !== 'string' || !/^[a-zA-Z0-9_-]{1,96}$/.test(b.id) || ids.has(b.id) ||
          typeof b.name !== 'string' || !b.name.trim() || b.name.length > 60 ||
          typeof b.note !== 'string' || b.note.length > 160 ||
          typeof b.createdAt !== 'string' || !Number.isFinite(Date.parse(b.createdAt)) ||
          !validPosition(b as ListeningBookmarkPosition)) return false;
      ids.add(b.id);
      return true;
    }).slice(0, MAX_MANUAL_LISTENING_BOOKMARKS);
  } catch {
    return [];
  }
}

export function writeManualListeningBookmarks(bookmarks: ManualListeningBookmark[]): boolean {
  if (bookmarks.length > MAX_MANUAL_LISTENING_BOOKMARKS ||
      bookmarks.some(b => !validPosition(b) || !b.name.trim() || b.name.length > 60 || b.note.length > 160)) return false;
  try {
    // Separate from quran_listening_bookmark (automatic resume): never overwrite it.
    localStorage.setItem(MANUAL_LISTENING_BOOKMARK_KEY, JSON.stringify(bookmarks));
    return true;
  } catch {
    return false;
  }
}

export function createManualListeningBookmark(
  bookmarks: ManualListeningBookmark[],
  position: ListeningBookmarkPosition,
  name: string,
  note = ''
): ManualListeningBookmark[] | null {
  if (!validPosition(position) || bookmarks.length >= MAX_MANUAL_LISTENING_BOOKMARKS) return null;
  const label = name.trim().slice(0, 60) || bookmarkLabel(position);
  const safeNote = note.trim().slice(0, 160);
  const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return [{
    id, name: label, note: safeNote, ...position,
    currentTime: Number(position.currentTime.toFixed(2)), createdAt: new Date().toISOString(),
  }, ...bookmarks];
}

export function editManualListeningBookmark(
  bookmarks: ManualListeningBookmark[], id: string, name: string, note: string,
  newPosition?: ListeningBookmarkPosition
): ManualListeningBookmark[] | null {
  const label = name.trim();
  if (!label || label.length > 60 || note.trim().length > 160 ||
      (newPosition !== undefined && !validPosition(newPosition)) ||
      !bookmarks.some(b => b.id === id)) return null;
  return bookmarks.map(b => b.id === id
    ? {...b, name: label, note: note.trim(), ...(newPosition ?? {})}
    : b);
}
