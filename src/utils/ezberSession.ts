import { SURAHS, RECITERS } from '../data/surahs';

const PROGRESS_KEY = 'quran_ezber_mobile_last_session_v1';
const SESSION_SIGNAL_KEY = 'quran_ezber_active_window_v1';
const CHANNEL_NAME = 'hayat-rehberi-ezber-session';
const WINDOW_ID = String(Date.now()) + '-' + Math.random().toString(36).slice(2);
let activeChannel: BroadcastChannel | null = null;
export const EZBER_STOP_AUDIO_EVENT = 'hayat-rehberi:ezber-stop-audio';

export interface SavedMobileEzberSession {
  surahId: number;
  verseNum: number;
  reciter: string;
  playbackSpeed: number;
  positionSeconds: number;
  wasPlaying: boolean;
}

function validVerse(surahId: number, verseNum: number): boolean {
  const surah = SURAHS.find(item => item.id === surahId);
  return !!surah && Number.isInteger(verseNum) && verseNum >= 1 &&
    verseNum <= surah.totalAyahs;
}

export function readMobileEzberSession(): SavedMobileEzberSession | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    const value = data as Partial<SavedMobileEzberSession>;
    if (typeof value.surahId !== 'number' || typeof value.verseNum !== 'number' ||
        !validVerse(value.surahId, value.verseNum)) return null;
    const speed = typeof value.playbackSpeed === 'number' &&
      Number.isFinite(value.playbackSpeed) && value.playbackSpeed >= 0.5 && value.playbackSpeed <= 3
      ? value.playbackSpeed : 1;
    return {
      surahId: value.surahId,
      verseNum: value.verseNum,
      reciter: typeof value.reciter === 'string' && RECITERS.some(r => r.id === value.reciter)
        ? value.reciter : 'ar.mahermuaiqly',
      playbackSpeed: speed,
      positionSeconds: typeof value.positionSeconds === 'number' && Number.isFinite(value.positionSeconds) &&
        value.positionSeconds >= 0 && value.positionSeconds < 3600 ? value.positionSeconds : 0,
      wasPlaying: value.wasPlaying === true,
    };
  } catch {
    return null;
  }
}

export function saveMobileEzberSession(session: SavedMobileEzberSession): void {
  if (!validVerse(session.surahId, session.verseNum)) return;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(session));
  } catch {
    // Storage may be denied; playback must work without persistence.
  }
}

/**
 * Only one tab/window owns active Ezber audio. On Android a home-screen PWA
 * and an ordinary Chrome tab can be alive simultaneously. A new Ezber screen
 * announces itself so any older window releases its stream, avoiding a
 * "fresh" screen over audio from the old session.
 *
 * No document visibility handler: hiding the same app must NOT stop a
 * deliberately ongoing background recitation.
 */
export function coordinateEzberWindows(stopPreviousPlayback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  let channel: BroadcastChannel | null = null;
  const onClaim = (claim: unknown) => {
    if (!claim || typeof claim !== 'object') return;
    const value = claim as { kind?: unknown; id?: unknown };
    if (value.kind === 'claim' && typeof value.id === 'string' && value.id !== WINDOW_ID) {
      stopPreviousPlayback();
    }
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== SESSION_SIGNAL_KEY || !event.newValue) return;
    try { onClaim(JSON.parse(event.newValue)); } catch {}
  };
  window.addEventListener('storage', onStorage);
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      activeChannel = channel;
      channel.onmessage = event => onClaim(event.data);
    } catch {}
  }
  claimEzberAudio();
  return () => {
    window.removeEventListener('storage', onStorage);
    if (channel) {
      channel.onmessage = null;
      channel.close();
      if (activeChannel === channel) activeChannel = null;
    }
  };
}

/** Called on entering Ezber and whenever new playback begins. */
export function claimEzberAudio(): void {
  const claim = { kind: 'claim', id: WINDOW_ID };
  try { activeChannel?.postMessage(claim); } catch {}
  try { localStorage.setItem(SESSION_SIGNAL_KEY, JSON.stringify(claim)); } catch {}
}
