/**
 * One active, honest media card per Hayat Rehberi document.
 * In particular, do not reset another player's metadata during a route change.
 * The operating system ultimately decides whether/where to render the card.
 */
export type NowPlayingInfo = {
  title: string;
  artist?: string;
  album?: string;
  artwork?: MediaImage[];
};

export type MediaAudioControls = {
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onInterrupt?: () => void;
};

type ManagedAudio = {
  audio: HTMLAudioElement;
  info: () => NowPlayingInfo;
  controls: MediaAudioControls;
};

let current: ManagedAudio | null = null;
const ACTIONS: MediaSessionAction[] = [
  'play', 'pause', 'stop', 'nexttrack', 'previoustrack',
  'seekto', 'seekforward', 'seekbackward'
];

function session(): MediaSession | null {
  return typeof navigator !== 'undefined' && 'mediaSession' in navigator
    ? navigator.mediaSession : null;
}

export function defaultArtwork(): MediaImage[] {
  if (typeof window === 'undefined') return [];
  return [{
    src: new URL(`${import.meta.env.BASE_URL}hayat-media-icon.png`, window.location.href).href,
    sizes: '512x512', type: 'image/png'
  }];
}

function safeAction(name: MediaSessionAction, handler: MediaSessionActionHandler | null): void {
  try { session()?.setActionHandler(name, handler); } catch { /* Unsupported by this OS. */ }
}

function resetIfOwner(entry: ManagedAudio): void {
  if (current !== entry) return;
  current = null;
  const active = session();
  if (!active) return;
  try {
    active.playbackState = 'none';
    active.metadata = null;
  } catch { /* Metadata is optional. */ }
  for (const action of ACTIONS) safeAction(action, null);
}

function describe(entry: ManagedAudio): void {
  if (current !== entry) return;
  const active = session();
  if (!active) return;
  try {
    if (typeof MediaMetadata !== 'undefined') {
      const info = entry.info();
      active.metadata = new MediaMetadata({
        title: info.title,
        artist: info.artist || 'Hayat Rehberi',
        album: info.album || 'Hayat Rehberi',
        artwork: info.artwork?.length ? info.artwork : defaultArtwork()
      });
    }
  } catch { /* Failure to set metadata must never interrupt recitation. */ }
}

function updatePosition(entry: ManagedAudio): void {
  const active = session();
  if (current !== entry || !active?.setPositionState) return;
  const { duration, currentTime, playbackRate } = entry.audio;
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(currentTime)) return;
  try {
    active.setPositionState({
      duration,
      position: Math.min(duration, Math.max(0, currentTime)),
      playbackRate: Number.isFinite(playbackRate) && playbackRate > 0 ? playbackRate : 1
    });
  } catch { /* Seek state is optional, especially for live audio. */ }
}

function claim(entry: ManagedAudio): void {
  if (current !== entry) {
    const outgoing = current;
    current = entry;
    // Only the latest actually playing track may own the media card.
    // This also prevents the radio and an in-app recitation overlapping.
    if (outgoing && outgoing.audio !== entry.audio) {
      if (outgoing.controls.onInterrupt) outgoing.controls.onInterrupt();
      else outgoing.audio.pause();
    }
  }
  const active = session();
  if (!active) return;
  describe(entry);
  for (const action of ACTIONS) safeAction(action, null);
  safeAction('play', () => {
    if (current !== entry) return;
    if (entry.controls.onPlay) entry.controls.onPlay();
    else void entry.audio.play().catch(() => {});
  });
  safeAction('pause', () => {
    if (current !== entry) return;
    if (entry.controls.onPause) entry.controls.onPause();
    else entry.audio.pause();
  });
  safeAction('stop', () => {
    if (current !== entry) return;
    if (entry.controls.onStop) entry.controls.onStop();
    else entry.audio.pause();
    resetIfOwner(entry);
  });
  active.playbackState = 'playing';
  updatePosition(entry);
}

/**
 * Call once for a real HTMLAudioElement, including detached new Audio().
 * Separate listeners leave existing audio state machines and onplaying handlers intact.
 */
export function bindAudioMediaSession(
  audio: HTMLAudioElement,
  info: () => NowPlayingInfo,
  controls: MediaAudioControls = {}
): () => void {
  const entry: ManagedAudio = { audio, info, controls };
  const onPlaying = () => claim(entry);
  const onPause = () => {
    if (current !== entry) return;
    const active = session();
    if (active) active.playbackState = 'paused';
  };
  const onEnded = () => resetIfOwner(entry);
  const onEmptied = () => {
    if (!audio.currentSrc) resetIfOwner(entry);
  };
  const onTimeUpdate = () => updatePosition(entry);
  audio.addEventListener('playing', onPlaying);
  audio.addEventListener('pause', onPause);
  audio.addEventListener('ended', onEnded);
  audio.addEventListener('emptied', onEmptied);
  audio.addEventListener('timeupdate', onTimeUpdate);
  if (!audio.paused && !audio.ended) claim(entry);
  return () => {
    audio.removeEventListener('playing', onPlaying);
    audio.removeEventListener('pause', onPause);
    audio.removeEventListener('ended', onEnded);
    audio.removeEventListener('emptied', onEmptied);
    audio.removeEventListener('timeupdate', onTimeUpdate);
    resetIfOwner(entry);
  };
}
