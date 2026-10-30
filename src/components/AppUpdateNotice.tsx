import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, RefreshCw, X } from 'lucide-react';
import type { TabType } from './Navbar';

const CURRENT_VERSION = (import.meta.env.VITE_APP_VERSION || '').trim();
const CHECK_INTERVAL_MS = 15 * 60 * 1000;

type Feedback = 'current' | 'offline' | 'unavailable' | null;

interface AppUpdateNoticeProps {
  activeTab: TabType;
  checkRequestId: number;
}

/**
 * Checks the version manifest published together with each GitHub Pages build.
 * A service worker is deliberately not required: installing one would introduce
 * a new cache lifecycle and could strand users on an old build.
 */
export const AppUpdateNotice: React.FC<AppUpdateNoticeProps> = ({
  activeTab,
  checkRequestId,
}) => {
  const [newVersion, setNewVersion] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const pendingRef = useRef(false);

  const checkForUpdates = useCallback(async (showFeedback = false) => {
    // Local development and builds without a deployment manifest are not releases.
    if (!/^[a-f0-9]{40}$/i.test(CURRENT_VERSION)) {
      if (showFeedback) setFeedback('unavailable');
      return;
    }
    if (pendingRef.current) return;
    pendingRef.current = true;
    try {
      const url = new URL(`${import.meta.env.BASE_URL}app-version.json`, window.location.href);
      url.searchParams.set('check', String(Date.now()));
      const response = await fetch(url.toString(), { cache: 'no-store' });
      if (!response.ok) throw new Error(`Version check failed: ${response.status}`);
      const data: unknown = await response.json();
      const version = typeof data === 'object' && data !== null && 'version' in data
        ? (data as { version?: unknown }).version
        : null;
      if (typeof version !== 'string' || !/^[a-f0-9]{40}$/i.test(version)) {
        throw new Error('Invalid release version');
      }
      if (version !== CURRENT_VERSION) {
        setNewVersion(version);
        setFeedback(null);
      } else {
        setNewVersion(null);
        setConfirmUpdate(false);
        if (showFeedback) setFeedback('current');
      }
    } catch {
      // Never clear an existing update notice just because the user is offline.
      if (showFeedback) setFeedback('offline');
    } finally {
      pendingRef.current = false;
    }
  }, []);

  useEffect(() => {
    void checkForUpdates();
    const onFocus = () => { void checkForUpdates(); };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void checkForUpdates();
    };
    const onOnline = () => { void checkForUpdates(); };
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void checkForUpdates();
    }, CHECK_INTERVAL_MS);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('online', onOnline);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('online', onOnline);
    };
  }, [checkForUpdates]);

  useEffect(() => {
    if (checkRequestId > 0) void checkForUpdates(true);
  }, [checkRequestId, checkForUpdates]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 5000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const applyUpdate = () => {
    if (!newVersion) return;
    // The listening component saves the exact ayah and audio second synchronously.
    window.dispatchEvent(new Event('hayat-rehberi:prepare-update'));

    // Cache-bust index.html while preserving all deep links and URL parameters.
    // Do not clear localStorage, cookies, IndexedDB, or any other user data.
    const url = new URL(window.location.href);
    url.searchParams.set('appVersion', newVersion.slice(0, 12));
    window.location.replace(url.toString());
  };

  if (!newVersion && !feedback) return null;

  return (
    <div className="fixed bottom-20 right-3 left-3 sm:left-auto sm:bottom-5 sm:right-5 z-[250] sm:w-[370px] max-w-full">
      {newVersion ? (
        <section
          role="status"
          aria-live="polite"
          aria-label="Uygulama güncellemesi"
          className="rounded-2xl border border-emerald-600/40 bg-[#142720] text-white p-4 shadow-2xl"
        >
          <div className="flex items-start gap-3">
            <RefreshCw aria-hidden="true" className="w-5 h-5 shrink-0 mt-0.5 text-emerald-300" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm">Hayat Rehberi’nin yeni sürümü hazır</p>
              <p className="text-xs text-emerald-50/80 mt-1 leading-relaxed">
                Güncelleme kaydedilmiş surelerini, ayetlerini ve dinleme ilerlemeni silmez.
              </p>
            </div>
            <button
              type="button"
              aria-label="Güncelleme bildirimini kapat"
              title="Şimdilik kapat"
              onClick={() => setNewVersion(null)}
              className="p-1 rounded-lg text-emerald-50/70 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {confirmUpdate ? (
            <div className="mt-3 border-t border-white/15 pt-3">
              <p className="text-xs leading-relaxed text-emerald-50/90">
                Güncellemek dinlemeyi durdurur. Kaldığın ayet ve saniye kaydedilerek aynı sayfa yeniden açılır.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  onClick={applyUpdate}
                  className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg text-xs px-3.5 py-2 cursor-pointer"
                >
                  Şimdi güncelle
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmUpdate(false)}
                  className="border border-white/20 hover:bg-white/10 rounded-lg text-xs px-3.5 py-2 cursor-pointer"
                >
                  Sonra
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => activeTab === 'listen' ? setConfirmUpdate(true) : applyUpdate()}
                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg text-xs px-3.5 py-2 cursor-pointer"
              >
                Güncelle
              </button>
              <button
                type="button"
                onClick={() => setNewVersion(null)}
                className="border border-white/20 hover:bg-white/10 rounded-lg text-xs px-3.5 py-2 cursor-pointer"
              >
                Daha sonra
              </button>
            </div>
          )}
        </section>
      ) : (
        <div role="status" aria-live="polite" className="flex items-center gap-2 bg-[#142720] text-white text-xs rounded-xl border border-white/15 p-3 shadow-xl">
          {feedback === 'current'
            ? <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" aria-hidden="true" />
            : <RefreshCw className="w-4 h-4 text-amber-300 shrink-0" aria-hidden="true" />}
          <span>
            {feedback === 'current'
              ? 'Hayat Rehberi güncel sürümde.'
              : feedback === 'offline'
                ? 'Güncelleme kontrolü yapılamadı. İnterneti kontrol edip tekrar dene.'
                : 'Sürüm kontrolü yalnızca yayınlanan uygulamada kullanılabilir.'}
          </span>
          <button type="button" aria-label="Bildirimi kapat" onClick={() => setFeedback(null)} className="ml-auto p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
