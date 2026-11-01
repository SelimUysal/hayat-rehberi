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
 * Screen wake lock is a best-effort, opt-in reading aid: it cannot override
 * the power button, a system-enforced lock or the browser's background policy.
 * It never controls the audio element, so re-acquiring cannot restart a verse.
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
    catch { /* Storage failure must not interrupt recitation. */ }
  }, [enabled, storageKey]);

  useEffect(() => {
    if (!enabled) { setStatus('off'); return; }
    const provider = getWakeLockProvider();
    if (!provider) { setStatus('unsupported'); return; }
    if (!isPlaying) { setStatus('waiting'); return; }

    let disposed = false;
    let pending = false;
    let sentinel: WakeLockSentinelLike | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let releaseRetries = 0;
    let lastAttemptAt = 0;

    const cancelRetry = () => {
      if (retryTimer !== null) clearTimeout(retryTimer);
      retryTimer = null;
    };
    const release = () => {
      const previous = sentinel;
      sentinel = null;
      if (!previous) return;
      previous.removeEventListener('release', onReleased);
      void previous.release().catch(() => {});
    };
    const acquire = async () => {
      if (disposed || pending) return;
      if (document.visibilityState !== 'visible') {
        setStatus('waiting');
        return;
      }
      if (sentinel && !sentinel.released) return;
      if (sentinel?.released) {
        sentinel.removeEventListener('release', onReleased);
        sentinel = null;
      }
      pending = true;
      lastAttemptAt = Date.now();
      setStatus('requesting');
      try {
        const granted = await provider.request('screen');
        if (disposed || document.visibilityState !== 'visible' || granted.released) {
          if (!granted.released) void granted.release().catch(() => {});
          if (!disposed) setStatus(document.visibilityState === 'visible' ? 'blocked' : 'waiting');
          return;
        }
        sentinel = granted;
        granted.addEventListener('release', onReleased);
        // The OS may revoke a lock between the request and listener registration.
        if (granted.released) {
          onReleased();
          return;
        }
        setStatus('active');
      } catch {
        if (!disposed) setStatus('blocked');
      } finally {
        pending = false;
      }
    };
    function onReleased() {
      const old = sentinel;
      sentinel = null;
      old?.removeEventListener('release', onReleased);
      if (disposed) return;
      if (document.visibilityState !== 'visible') {
        setStatus('waiting');
        return;
      }
      setStatus('blocked');
      // Re-try once if the platform unexpectedly revokes the lock while visible.
      // Never spin endlessly on battery saver / permission denial.
      if (releaseRetries++ === 0) {
        cancelRetry();
        retryTimer = setTimeout(() => {
          retryTimer = null;
          void acquire();
        }, 500);
      }
    }

    const onVisibility = () => {
      cancelRetry();
      if (document.visibilityState === 'visible') {
        releaseRetries = 0;
        void acquire();
      } else {
        release();
        setStatus('waiting');
      }
    };
    const onForeground = () => {
      if (document.visibilityState !== 'visible') return;
      if (sentinel && !sentinel.released) return;
      // Coalesce visibilitychange, focus and pageshow on the same resume.
      if (Date.now() - lastAttemptAt < 1200) return;
      releaseRetries = 0;
      void acquire();
    };
    const onPageHide = () => {
      cancelRetry();
      release();
      setStatus('waiting');
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pageshow', onForeground);
    window.addEventListener('focus', onForeground);
    window.addEventListener('pagehide', onPageHide);
    void acquire();

    return () => {
      disposed = true;
      cancelRetry();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pageshow', onForeground);
      window.removeEventListener('focus', onForeground);
      window.removeEventListener('pagehide', onPageHide);
      release();
    };
  }, [enabled, isPlaying]);

  return { enabled, setEnabled, supported, status };
}
