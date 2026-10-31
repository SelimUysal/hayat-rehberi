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
  /** The last playback mode, retained across an app restart. */
  mode?: 'verse' | 'full';
}

export interface LiveEzberSession extends SavedMobileEzberSession {
  mode: 'verse' | 'full';
  updatedAt: number;
  /** Optional media metadata for accurate visual follow in another tab/PWA. */
  durationSeconds?: number;
}

type Message =
  | { kind: 'request'; sender: string }
  | { kind: 'state'; sender: string; state: LiveEzberSession }
  | { kind: 'claim' | 'stop' | 'ended'; sender: string }
  | { kind: 'speed'; sender: string; speed: number };

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
      mode: value.mode === 'full' ? 'full' : 'verse',
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
    // Storage may be unavailable. Playback must not depend on persistence.
  }
}

function validLiveState(value: unknown): value is LiveEzberSession {
  if (!value || typeof value !== 'object') return false;
  const state = value as Partial<LiveEzberSession>;
  return typeof state.surahId === 'number' && typeof state.verseNum === 'number' &&
    validVerse(state.surahId, state.verseNum) &&
    typeof state.reciter === 'string' && RECITERS.some(r => r.id === state.reciter) &&
    typeof state.playbackSpeed === 'number' && Number.isFinite(state.playbackSpeed) &&
    state.playbackSpeed >= 0.5 && state.playbackSpeed <= 3 &&
    typeof state.positionSeconds === 'number' && Number.isFinite(state.positionSeconds) &&
    state.positionSeconds >= 0 && state.positionSeconds < 3600 &&
    state.wasPlaying === true &&
    (state.durationSeconds === undefined ||
      (typeof state.durationSeconds === 'number' && Number.isFinite(state.durationSeconds) &&
       state.durationSeconds > 0 && state.durationSeconds < 3600)) &&
    (state.mode === 'verse' || state.mode === 'full') &&
    typeof state.updatedAt === 'number' && Number.isFinite(state.updatedAt) &&
    Math.abs(Date.now() - state.updatedAt) < 15000;
}

function broadcast(message: Message): void {
  try { activeChannel?.postMessage(message); } catch {}
  // A storage event is used as fallback when BroadcastChannel is unavailable.
  try { localStorage.setItem(SESSION_SIGNAL_KEY, JSON.stringify(message)); } catch {}
}

/**
 * Coordinate playback between a home-screen PWA and a Chrome tab without
 * stealing the audio on merely opening another screen. The old window remains
 * the audio owner; the new window mirrors its live position and controls.
 * Ownership transfers only when the user explicitly starts local playback.
 *
 * Keeping a tab in the background does NOT stop its live audio.
 */
export function coordinateEzberWindows(
  stopPreviousPlayback: () => void,
  onRemoteState: (state: LiveEzberSession | null) => void = () => {},
  getLocalState: () => LiveEzberSession | null = () => null,
  onRemoteSpeed: (speed: number) => void = () => {},
): () => void {
  if (typeof window === 'undefined') return () => {};
  let channel: BroadcastChannel | null = null;
  const onMessage = (incoming: unknown) => {
    if (!incoming || typeof incoming !== 'object') return;
    const msg = incoming as Partial<Message>;
    if (msg.sender === WINDOW_ID || typeof msg.sender !== 'string') return;
    if (msg.kind === 'request') {
      const local = getLocalState();
      if (local && validLiveState(local)) broadcast({kind: 'state', sender: WINDOW_ID, state: local});
    } else if (msg.kind === 'state') {
      if (validLiveState(msg.state)) onRemoteState(msg.state);
    } else if (msg.kind === 'claim' || msg.kind === 'stop') {
      stopPreviousPlayback();
      if (msg.kind === 'claim') onRemoteState(null);
    } else if (msg.kind === 'ended') {
      onRemoteState(null);
    } else if (msg.kind === 'speed' && typeof msg.speed === 'number' &&
               Number.isFinite(msg.speed) && msg.speed >= 0.5 && msg.speed <= 3) {
      if (getLocalState()) onRemoteSpeed(msg.speed);
    }
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== SESSION_SIGNAL_KEY || !event.newValue) return;
    try { onMessage(JSON.parse(event.newValue)); } catch {}
  };
  window.addEventListener('storage', onStorage);
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(CHANNEL_NAME);
      activeChannel = channel;
      channel.onmessage = event => onMessage(event.data);
    }
  } catch {}
  requestEzberLiveState();
  return () => {
    window.removeEventListener('storage', onStorage);
    if (channel) {
      channel.onmessage = null;
      channel.close();
      if (activeChannel === channel) activeChannel = null;
    }
  };
}

export function requestEzberLiveState(): void {
  broadcast({kind: 'request', sender: WINDOW_ID});
}
export function publishEzberLiveState(state: LiveEzberSession): void {
  if (validLiveState(state)) broadcast({kind: 'state', sender: WINDOW_ID, state});
}
export function claimEzberAudio(): void {
  broadcast({kind: 'claim', sender: WINDOW_ID});
}
export function stopRemoteEzberAudio(): void {
  broadcast({kind: 'stop', sender: WINDOW_ID});
}
export function notifyEzberAudioEnded(): void {
  broadcast({kind: 'ended', sender: WINDOW_ID});
}
export function changeRemoteEzberSpeed(speed: number): void {
  if (Number.isFinite(speed) && speed >= 0.5 && speed <= 3) {
    broadcast({kind: 'speed', sender: WINDOW_ID, speed});
  }
}
