import React, { useEffect, useRef, useState } from 'react';
import { bindAudioMediaSession, defaultArtwork } from '../utils/mediaSessionCoordinator';
import {
  AlertCircle, Clock3, ExternalLink, Pause, Play, RadioTower,
  RotateCcw, ShieldCheck, Square, Volume2, VolumeX, WifiOff
} from 'lucide-react';

export const SADAQURAN_STATION_URL = 'https://sadaquran.aweradio.app/';
/** Public listener HLS address supplied in SadaQuran's AWE station settings. */
export const SADAQURAN_STREAM_URL = 'https://manifest.aweradio.app/sadaquran/music/aac.m3u8';

type PlaybackStatus = 'idle' | 'connecting' | 'playing' | 'paused' | 'error';

interface SadaQuranRadioProps {
  isActiveTab: boolean;
  exclusiveAudio: boolean;
  onOpen: () => void;
}

export const SadaQuranRadio: React.FC<SadaQuranRadioProps> = ({ isActiveTab, exclusiveAudio, onOpen }) => {
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [error, setError] = useState('');
  const [volume, setVolume] = useState(() => {
    try {
      const saved = Number(localStorage.getItem('sadaquran_volume'));
      if (localStorage.getItem('sadaquran_volume') !== null && Number.isFinite(saved)) {
        return Math.max(0, Math.min(1, saved));
      }
    } catch {}
    return 1;
  });
  const [muted, setMuted] = useState(false);
  const [sleepUntil, setSleepUntil] = useState<number | null>(null);
  const [sleepSeconds, setSleepSeconds] = useState(0);
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<import('hls.js').default | null>(null);
  const sessionRef = useRef(0);
  const playbackModeRef = useRef<'native' | 'hls' | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.muted = muted;
    try { localStorage.setItem('sadaquran_volume', String(volume)); } catch {}
  }, [volume, muted]);

  const selectSleepTimer = (minutes: number) => {
    setSleepUntil(minutes === 0 ? null : Date.now() + minutes * 60_000);
  };

  const formattedSleep = sleepSeconds >= 3600
    ? `${Math.floor(sleepSeconds / 3600)} sa ${String(Math.floor((sleepSeconds % 3600) / 60)).padStart(2, '0')} dk`
    : `${Math.ceil(sleepSeconds / 60)} dk`;

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
    setSleepUntil(null);
    setSleepSeconds(0);
    setError('');
    setStatus('idle');
  };

  // A wall-clock deadline survives throttled background tabs. Recheck on focus.
  useEffect(() => {
    if (sleepUntil === null) {
      setSleepSeconds(0);
      return;
    }
    const check = () => {
      const remaining = Math.max(0, Math.ceil((sleepUntil - Date.now()) / 1000));
      setSleepSeconds(remaining);
      if (remaining === 0) stop();
    };
    check();
    const interval = window.setInterval(check, 1000);
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
    };
  }, [sleepUntil]);

  // Avoid double recitation: Kesintisiz Dinleme and Ezber take priority.
  useEffect(() => {
    if (exclusiveAudio) stop();
  }, [exclusiveAudio]);

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
    // Hidden Ezber desktop/mobile players can remain mounted on other tabs.
    window.dispatchEvent(new Event('hayat-rehberi:radio-start'));
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

  // The radio stays mounted across routes; the OS must keep its actual identity.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    return bindAudioMediaSession(audio, () => ({
      title: "SadaQuran · Canlı Kur'an Radyosu",
      artist: 'SadaQuran',
      album: 'Hayat Rehberi · Canlı Radyo',
      artwork: [
        {
          src: new URL(`${import.meta.env.BASE_URL}sadaquran-radio-cover.avif`, window.location.href).href,
          sizes: '320x320', type: 'image/avif'
        },
        ...defaultArtwork()
      ]
    }), {
      onPlay: () => { void audio.play().catch(() => {}); },
      onPause: () => audio.pause(),
      onStop: () => stop(),
      onInterrupt: () => stop()
    });
  }, []);

  const active = status === 'connecting' || status === 'playing' || status === 'paused';
  const showMini = !isActiveTab && active;

  const volumeControl = (
    <div className="flex w-full max-w-xs items-center justify-center gap-3 text-stone-200">
      <button type="button" onClick={() => setMuted(value => !value)}
        aria-label={muted ? 'Sesi aç' : 'Sessize al'} aria-pressed={muted}
        title={muted ? 'Sesi aç' : 'Sessize al'}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-emerald-400">
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>
      <label className="hidden flex-1 items-center gap-2 sm:flex">
        <span className="text-xs text-stone-300">Ses</span>
        <input type="range" min="0" max="1" step="0.05"
          value={volume} onChange={(event) => { setVolume(Number(event.target.value)); setMuted(false); }}
          aria-label="Radyo ses seviyesi" className="w-full cursor-pointer accent-emerald-400" />
        <span className="w-8 text-right text-xs tabular-nums text-stone-400">{Math.round(volume * 100)}%</span>
      </label>
      <span className="text-xs text-stone-400 sm:hidden">Ses için telefon tuşlarını kullanabilirsiniz</span>
    </div>
  );

  return (
    <>
    <section className={isActiveTab ? "relative isolate flex-1 w-full min-w-0 overflow-x-hidden bg-[#0c1512] text-stone-100" : "hidden"} aria-labelledby="sadaquran-title">
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
              Kur'an-ı Kerim tilavetini herkese ortak sunulan canlı yayın akışından dinleyin.
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
                Ses yalnızca siz başlattığınızda açılır.
              </p>
            </div>

            <audio
              ref={audioRef}
              preload="none"
              aria-label="SadaQuran canlı yayın ses oynatıcısı"
              onPlaying={() => setStatus('playing')}
              onPause={() => setStatus(previous => previous === 'playing' || previous === 'connecting' ? 'paused' : previous)}
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
            <div className="flex w-full flex-col items-center gap-3">
              {volumeControl}
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-stone-300">
                <Clock3 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                <label htmlFor="sadaquran-sleep">Uyku zamanlayıcısı</label>
                <select id="sadaquran-sleep" value={sleepUntil === null ? '0' : 'set'}
                  onChange={(event) => selectSleepTimer(Number(event.target.value))}
                  className="min-h-10 rounded-xl border border-white/15 bg-[#1c2e26] px-3 text-stone-100 focus-visible:outline-2 focus-visible:outline-emerald-400">
                  {sleepUntil !== null && <option value="set">Kalan: {formattedSleep}</option>}
                  <option value="0">Kapalı</option>
                  <option value="15">15 dakika</option>
                  <option value="30">30 dakika</option>
                  <option value="60">60 dakika</option>
                  <option value="120">120 dakika</option>
                </select>
              </div>
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
              <span>AWE Radio altyapısıyla canlı yayın.</span>
            </div>
            <a href={SADAQURAN_STATION_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20">
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> AWE'de dinle
            </a>
          </div>
        </div>

      </div>
    </section>
    {showMini && (
      <aside role="region" aria-label="SadaQuran mini oynatıcı"
        className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] z-[45] mx-auto max-w-xl rounded-2xl border border-emerald-500/30 bg-[#101d18]/95 p-2.5 text-white shadow-[0_14px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:bottom-4">
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={onOpen} title="Radyo sayfasına dön" aria-label="SadaQuran radyo sayfasına dön"
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl p-1 text-left hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-emerald-400">
            <img src={`${import.meta.env.BASE_URL}sadaquran-radio-cover.avif`}
              alt="" width="44" height="44" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">SadaQuran</span>
              <span className="block truncate text-xs text-emerald-200">
                {status === 'playing' ? 'Canlı dinleniyor' : status === 'paused' ? 'Duraklatıldı' : 'Bağlanıyor…'}
                {sleepUntil !== null ? ` · ⏱ ${formattedSleep}` : ''}
              </span>
            </span>
          </button>
          <button type="button" onClick={() => setMuted(value => !value)}
            aria-label={muted ? 'Sesi aç' : 'Sessize al'} aria-pressed={muted}
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/15 hover:bg-white/10 sm:flex">
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button type="button" onClick={status === 'playing' ? pause : status === 'paused' ? resume : undefined}
            disabled={status === 'connecting'} aria-label={status === 'playing' ? 'Radyoyu duraklat' : 'Radyoyu devam ettir'}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 disabled:opacity-50">
            {status === 'playing' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button type="button" onClick={stop} aria-label="Radyoyu durdur"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/5 hover:bg-white/10">
            <Square className="h-4 w-4" />
          </button>
        </div>
      </aside>
    )}
    </>
  );
};
