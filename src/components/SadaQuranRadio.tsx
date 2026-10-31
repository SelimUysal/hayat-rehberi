import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Headphones, Play, RadioTower, ShieldCheck, Square, Volume2, WifiOff } from 'lucide-react';

export const SADAQURAN_STATION_URL = 'https://sadaquran.aweradio.app/';

/**
 * AWE Radio does not publish an independently verified player URL or embed API.
 * Load the station's real listener page in an opt-in iframe. If AWE blocks
 * embedding with CSP frame-ancestors / X-Frame-Options, provide a visible
 * external listening link instead of guessing a stream endpoint.
 */
export const SadaQuranRadio: React.FC = () => {
  const [embedded, setEmbedded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' ? true : navigator.onLine);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  // When the tab unmounts React removes the iframe and its media playback.
  // The user can also shut down the external player without leaving this tab.
  const stop = () => {
    setEmbedded(false);
    setFailed(false);
  };
  const start = () => {
    if (!online) return;
    setFailed(false);
    setEmbedded(true);
  };

  return (
    <section className="relative isolate flex-1 w-full min-w-0 overflow-x-hidden bg-[#0c1512] text-stone-100" aria-labelledby="sadaquran-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.18),transparent_70%)]" />
      <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:py-14">
        <div className="mb-7 flex flex-wrap items-start gap-4 sm:gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 shadow-[0_12px_38px_rgba(0,0,0,0.25)] sm:h-20 sm:w-20">
            <RadioTower aria-hidden="true" className="h-8 w-8 text-emerald-300 sm:h-10 sm:w-10" />
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-200">
                Canlı Kur'an Radyosu
              </span>
              <span className="text-[11px] text-stone-400">AWE Radio altyapısıyla</span>
            </div>
            <h1 id="sadaquran-title" className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">SadaQuran</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-stone-300 sm:text-base">
              Kur'an-ı Kerim tilavetini canlı yayın akışından dinleyin. Yayın, Kesintisiz Dinleme'den bağımsızdır;
              radyo herkes için aynı anda aynı yayın akışını sunar.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111d18] shadow-[0_18px_56px_rgba(0,0,0,0.28)] sm:rounded-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2.5">
              <Volume2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
              <span className="text-sm font-semibold text-white">Radyo oynatıcısı</span>
              <span className="text-[11px] text-stone-400">SadaQuran</span>
            </div>
            {embedded && (
              <button type="button" onClick={stop}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-stone-200 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400">
                <Square className="h-3.5 w-3.5" aria-hidden="true" /> Yayını kapat
              </button>
            )}
          </div>

          {embedded ? (
            <div className="px-3 pb-4 pt-3 sm:px-5 sm:pb-5">
              <div className="overflow-hidden rounded-xl border border-white/15 bg-white">
                <iframe
                  ref={iframeRef}
                  title="SadaQuran — AWE Radio canlı yayın oynatıcısı"
                  src={SADAQURAN_STATION_URL}
                  loading="eager"
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  onError={() => setFailed(true)}
                  className="block h-[min(680px,77dvh)] min-h-[360px] w-full border-0 bg-white"
                />
              </div>
              <p role="status" className="mt-3 text-xs leading-relaxed text-stone-300">
                {failed
                  ? 'Oynatıcı yüklenemedi. Aşağıdaki bağlantıyla doğrudan radyo sayfasını açabilirsiniz.'
                  : 'Yayın sayfası uygulama içinde açılır. Sesi başlatmak için AWE oynatıcısının oynat düğmesine dokunun. İçerik boşsa AWE gömülmeye izin vermiyor olabilir.'}
              </p>
            </div>
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 px-5 py-10 text-center sm:min-h-[310px]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/10">
                <Headphones className="h-7 w-7 text-emerald-300" aria-hidden="true" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h2 className="text-lg font-bold text-white">Kur'an radyosunu dinle</h2>
                <p className="text-sm leading-relaxed text-stone-300">
                  Yayın sayfasını uygulamanın içinde açmak için aşağıdaki düğmeye dokunun.
                  Sizin izniniz olmadan harici oynatıcı yüklenmez.
                </p>
              </div>
              <button type="button" onClick={start} disabled={!online}
                className="inline-flex min-h-12 items-center gap-2.5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-50">
                {online ? <Play className="h-4 w-4 fill-current" aria-hidden="true" /> : <WifiOff className="h-4 w-4" aria-hidden="true" />}
                {online ? 'Radyo oynatıcısını aç' : 'İnternet bağlantısı gerekli'}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-start gap-2 text-xs leading-relaxed text-stone-400">
              <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>Radyo AWE Radio üzerinden yayınlanır. Bu sayfadan ayrılınca gömülü oynatıcı kapanır.</span>
            </div>
            <a href={SADAQURAN_STATION_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400">
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> Yayın sayfasını aç
            </a>
          </div>
        </div>
        <p className="mt-4 text-center text-xs leading-relaxed text-stone-400">
          Harici yayın sayfası bazı tarayıcılarda çerçeve içinde çalışmayabilir.
          Bu durumda “Yayın sayfasını aç” seçeneğini kullanabilirsiniz.
          Doğrudan ses akışı veya AWE tarafından onaylanmış bir embed bağlantısı henüz doğrulanmadı.
        </p>
      </div>
    </section>
  );
};
