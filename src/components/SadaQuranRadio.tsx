import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle, ExternalLink, Pause, Play, RadioTower,
  RotateCcw, ShieldCheck, Square, Volume2, WifiOff
} from 'lucide-react';

export const SADAQURAN_STATION_URL = 'https://sadaquran.aweradio.app/';
/** Public listener HLS address supplied in SadaQuran's AWE station settings. */
export const SADAQURAN_STREAM_URL = 'https://manifest.aweradio.app/sadaquran/music/aac.m3u8';

type PlaybackStatus = 'idle' | 'connecting' | 'playing' | 'paused' | 'error';

export const SadaQuranRadio: React.FC = () => {
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [error, setError] = useState('');
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<import('hls.js').default | null>(null);
  const sessionRef = useRef(0);
  const playbackModeRef = useRef<'native' | 'hls' | null>(null);

  const cleanupAudio = () => {
    playbackModeRef.current = null;
    hlsRef.current?.destroy();
    hlsRef.current = null;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
  };

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      ++sessionRef.current;
      cleanupAudio();
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  const stop = () => {
    ++sessionRef.current;
    cleanupAudio();
    setError('');
    setStatus('idle');
  };

  const fail = (message: string, session: number) => {
    if (session !== sessionRef.current) return;
    ++sessionRef.current;
    cleanupAudio();
    setError(message);
    setStatus('error');
  };

  const connect = async () => {
    if (!online) return;
    const session = ++sessionRef.current;
    cleanupAudio();
    setError('');
    setStatus('connecting');
    const audio = audioRef.current;
    if (!audio) return;

    const requestPlayback = () => {
      if (session !== sessionRef.current) return;
      void audio.play().catch((reason) => {
        if (session !== sessionRef.current) return;
        if (reason?.name === 'NotAllowedError') {
          setError('Tarayıcı otomatik sesi engelledi. Devam et düğmesine basın.');
          setStatus('paused');
          return;
        }
        fail('Ses başlatılamadı (' + (reason?.name || 'bilinmeyen hata') + '). Yeniden deneyin.', session);
      });
    };

    // Prefer MediaSource+hls.js where it is available. Chrome-based browsers can
    // report "maybe" for HLS but still fail with MEDIA_ERR_SRC_NOT_SUPPORTED (4).
    // Only use native HLS when MSE is unavailable (e.g. iOS Safari).
    try {
      // Loaded only after the listener clicks Play, so other app pages stay lightweight.
      const { default: Hls } = await import('hls.js');
      if (session !== sessionRef.current) return;
      if (!Hls.isSupported()) {
        if (audio.canPlayType('application/vnd.apple.mpegurl')) {
          playbackModeRef.current = 'native';
          audio.src = SADAQURAN_STREAM_URL;
          requestPlayback();
        } else {
          fail('Tarayıcınız bu canlı yayın biçimini desteklemiyor.', session);
        }
        return;
      }
      const hls = new Hls({
        enableWorker: true,
        maxBufferLength: 30,
        manifestLoadingMaxRetry: 2,
        levelLoadingMaxRetry: 2,
        fragLoadingMaxRetry: 2,
      });
      playbackModeRef.current = 'hls';
      hlsRef.current = hls;
      let networkRetries = 0;
      let mediaRetries = 0;
      hls.on(Hls.Events.MANIFEST_PARSED, requestPlayback);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (session !== sessionRef.current || !data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && networkRetries++ < 2) {
          hls.startLoad();
          return;
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR && mediaRetries++ < 1) {
          hls.recoverMediaError();
          return;
        }
        fail('Canlı yayın akışına ulaşılamadı. Yayın henüz hazır olmayabilir veya AWE dış sitelerden erişimi engelliyor olabilir.', session);
      });
      hls.loadSource(SADAQURAN_STREAM_URL);
      hls.attachMedia(audio);
    } catch {
      fail('Radyo oynatıcısı yüklenemedi. İnternet bağlantısını kontrol edip yeniden deneyin.', session);
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    setStatus('paused');
  };

  const resume = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const session = sessionRef.current;
    setStatus('connecting');
    void audio.play().catch((reason) => {
      if (session !== sessionRef.current) return;
      setError('Oynatma devam ettirilemedi: ' + (reason?.name || 'bilinmeyen hata'));
      setStatus('paused');
    });
  };

  const active = status === 'connecting' || status === 'playing' || status === 'paused';

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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <Volume2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
              <span className="text-sm font-semibold text-white">SadaQuran canlı yayın</span>
            </div>
            <span className="flex items-center gap-2 text-xs text-stone-300" role="status">
              <span className={`h-2 w-2 rounded-full ${status === 'playing' ? 'bg-emerald-400 animate-pulse' : status === 'error' ? 'bg-rose-400' : status === 'connecting' ? 'bg-amber-400 animate-pulse' : 'bg-stone-500'}`} />
              {status === 'playing' ? 'Dinleniyor' : status === 'connecting' ? 'Bağlanıyor…' : status === 'paused' ? 'Duraklatıldı' : status === 'error' ? 'Bağlantı sorunu' : 'Dinlemeye hazır'}
            </span>
          </div>

          <div className="flex min-h-[260px] flex-col items-center justify-center gap-5 px-5 py-10 text-center sm:min-h-[310px]">
            <div
              data-testid="sadaquran-cover"
              data-playing={status === 'playing' ? 'true' : 'false'}
              className="relative isolate mb-1 h-40 w-40 sm:h-48 sm:w-48"
            >
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute -inset-2 rounded-3xl bg-emerald-400/20 blur-2xl transition-opacity duration-500 motion-reduce:animate-none ${status === 'playing' ? 'animate-pulse opacity-100' : 'opacity-0'}`}
              />
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute -inset-1 rounded-[1.45rem] border border-emerald-400/45 transition-opacity duration-500 motion-reduce:animate-none ${status === 'playing' ? 'animate-ping opacity-35 [animation-duration:3s]' : 'opacity-0'}`}
              />
              <img
                src={`${import.meta.env.BASE_URL}sadaquran-radio-cover.avif`}
                alt="SadaQuran Radyo kapak görseli"
                width={320}
                height={320}
                decoding="async"
                className={`relative h-full w-full rounded-2xl border border-amber-300/25 object-cover shadow-[0_16px_42px_rgba(0,0,0,0.35)] transition-all duration-700 motion-reduce:transform-none ${status === 'playing' ? 'scale-[1.025] shadow-[0_16px_48px_rgba(16,185,129,0.24)]' : ''}`}
              />
            </div>
            <div className="max-w-lg space-y-2">
              <h2 className="text-lg font-bold text-white">Kur'an-ı Kerim canlı radyo</h2>
              <p className="text-sm leading-relaxed text-stone-300">
                Aynı canlı yayın akışını kendi oynatıcımızdan dinleyin. Ses yalnızca siz başlattığınızda açılır.
              </p>
            </div>

            <audio
              ref={audioRef}
              preload="none"
              aria-label="SadaQuran canlı yayın ses oynatıcısı"
              onPlaying={() => setStatus('playing')}
              onWaiting={() => setStatus(previous => previous === 'playing' ? 'connecting' : previous)}
              onError={() => {
                // When hls.js manages MediaSource, it owns the recoverable media errors.
                // Native audio error events can be transient during source changes/cleanup.
                if (playbackModeRef.current !== 'native') return;
                const audio = audioRef.current;
                if (!audio?.error) return;
                const code = audio.error.code;
                fail('Tarayıcı canlı sesi açamadı (medya hata kodu: ' + code + '). Yeniden bağlanmayı deneyin.', sessionRef.current);
              }}
            />
            <div className="flex flex-wrap items-center justify-center gap-3">
              {(status === 'idle' || status === 'error') && (
                <button type="button" onClick={connect} disabled={!online}
                  className="inline-flex min-h-12 items-center gap-2.5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50">
                  {online ? (status === 'error' ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />) : <WifiOff className="h-4 w-4" />}
                  {!online ? 'İnternet bağlantısı gerekli' : status === 'error' ? 'Yeniden bağlan' : 'Canlı dinle'}
                </button>
              )}
              {status === 'playing' && (
                <button type="button" onClick={pause} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500">
                  <Pause className="h-4 w-4" /> Duraklat
                </button>
              )}
              {status === 'paused' && (
                <button type="button" onClick={resume} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500">
                  <Play className="h-4 w-4" /> Devam et
                </button>
              )}
              {active && (
                <button type="button" onClick={stop} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-stone-200 hover:bg-white/10">
                  <Square className="h-4 w-4" /> Durdur
                </button>
              )}
            </div>
            {status === 'error' && (
              <p role="alert" className="flex max-w-lg items-start gap-2 text-left text-xs leading-relaxed text-rose-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-start gap-2 text-xs leading-relaxed text-stone-400">
              <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>Yayın AWE Radio sunucularından alınır; uygulama içinde kalabilirsiniz. Radyo sekmesinden çıkınca ses durur.</span>
            </div>
            <a href={SADAQURAN_STATION_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20">
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> AWE'de dinle
            </a>
          </div>
        </div>
        <p className="mt-4 text-center text-xs leading-relaxed text-stone-400">
          Yayın henüz hazırlanıyorsa veya AWE akışı harici sitelere açmıyorsa doğrudan AWE dinleme sayfasını kullanabilirsiniz.
        </p>
      </div>
    </section>
  );
};
