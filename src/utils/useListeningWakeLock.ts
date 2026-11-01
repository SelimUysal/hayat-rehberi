import { useEffect, useState } from 'react';

const STORAGE_KEY = 'quran_listening_keep_screen_awake';

interface WakeLockSentinelLike {
  readonly released: boolean;
  release(): Promise<void>;
  addEventListener(type: 'release', listener: () => void): void;
  removeEventListener(type: 'release', listener: () => void): void;
}

interface WakeLockProviderLike {
  request(type: 'screen'): Promise<WakeLockSentinelLike>;
}

export type ListeningWakeStatus = 'off' | 'waiting' | 'requesting' | 'active' | 'blocked' | 'unsupported';

function getWakeLockProvider(): WakeLockProviderLike | null {
  if (typeof navigator === 'undefined') return null;
  const provider = (navigator as Navigator & { wakeLock?: WakeLockProviderLike }).wakeLock;
  return typeof provider?.request === 'function' ? provider : null;
}

/**
 * Screen wake lock is an opt-in reading aid, never a requirement for audio.
 * Release it when paused, hidden, or unmounted; reacquire on return to the tab.
 */
export function useListeningWakeLock(isPlaying: boolean, storageKey = STORAGE_KEY) {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem(storageKey) === '1'; }
    catch { return false; }
  });
  const [status, setStatus] = useState<ListeningWakeStatus>('off');
  const supported = getWakeLockProvider() !== null;

  useEffect(() => {
    try { localStorage.setItem(storageKey, enabled ? '1' : '0'); }
    catch { /* Storage failure must not interrupt the recitation. */ }
  }, [enabled, storageKey]);

  useEffect(() => {
    if (!enabled) { setStatus('off'); return; }
    const provider = getWakeLockProvider();
    if (!provider) { setStatus('unsupported'); return; }
    if (!isPlaying) { setStatus('waiting'); return; }

    let disposed = false;
    let pending = false;
    let sentinel: WakeLockSentinelLike | null = null;

    const onReleased = () => {
      sentinel = null;
      if (!disposed) setStatus(document.visibilityState === 'visible' ? 'blocked' : 'waiting');
    };

    const release = () => {
      const previous = sentinel;
      sentinel = null;
      if (!previous) return;
      previous.removeEventListener('release', onReleased);
      void previous.release().catch(() => {});
    };

    const acquire = async () => {
      if (disposed || pending || sentinel) return;
      if (document.visibilityState !== 'visible') { setStatus('waiting'); return; }
      pending = true;
      setStatus('requesting');
      try {
        const granted = await provider.request('screen');
        if (disposed || document.visibilityState !== 'visible') {
          void granted.release().catch(() => {});
          if (!disposed) setStatus('waiting');
          return;
        }
        sentinel = granted;
        granted.addEventListener('release', onReleased);
        setStatus('active');
      } catch {
        if (!disposed) setStatus('blocked');
      } finally {
        pending = false;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void acquire();
      else { release(); setStatus('waiting'); }
    };
    const onPageHide = () => { release(); setStatus('waiting'); };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pageshow', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    void acquire();

    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pageshow', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      release();
    };
  }, [enabled, isPlaying]);

  return { enabled, setEnabled, supported, status };
}
