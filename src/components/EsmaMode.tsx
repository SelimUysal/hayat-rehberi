import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useThemeSync, broadcastThemeChange } from '../utils/themeSync';
import {
  ESMA_NAMES,
  DEFAULT_ESMA_AUDIO_PATH,
  EsmaItem
} from '../data/esmaData';
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Gauge,
  Monitor,
  Smartphone,
  Moon,
  Sun,
  Search,
  CheckCircle,
  RotateCcw,
  Sparkles,
  Info,
  Sliders,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { HayatRehberiLogo } from './HayatRehberiLogo';

export type EsmaTheme = 'dark' | 'emerald';
export type EsmaViewMode = 'desktop' | 'mobile';

// Arapça harekeler ve Türkçe yazım varyantları aramayı engellemesin.
function normalizeEsmaSearch(str?: string): string {
  if (!str) return '';
  return str
    .normalize('NFKD')
    .toLocaleLowerCase('tr-TR')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/['’`\-_.:,;()\/]/g, ' ')
    .replace(/\b(ya|el|er|es|ed|et|en|ez)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function readEsmaAudioSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('esma_audio_settings_v1') || '{}');
    return {
      volume: typeof saved.volume === 'number' && Number.isFinite(saved.volume)
        ? Math.max(0, Math.min(1, saved.volume)) : 0.85,
      speed: typeof saved.speed === 'number' && Number.isFinite(saved.speed) && saved.speed >= 0.5 && saved.speed <= 2.5
        ? saved.speed : 1,
      muted: saved.muted === true
    };
  } catch {
    return { volume: 0.85, speed: 1, muted: false };
  }
}

interface EsmaModeProps {
  targetEsmaNumber?: number;
  targetCategory?: 'all' | 'rahmet' | 'kudret' | 'ilim' | 'adalet' | 'learned';
  targetAutoPlay?: boolean;
  targetTimestamp?: number;
}

export const EsmaMode: React.FC<EsmaModeProps> = ({
  targetEsmaNumber,
  targetCategory,
  targetAutoPlay,
  targetTimestamp
}) => {
  // =========================================================================
  // 1. TEMA VE GÖRÜNÜM MODU DURUMU (Koyu Mod vs Yeşil Uİ, Masaüstü vs Mobil)
  // =========================================================================
  const [theme, setTheme] = useState<EsmaTheme>(() => {
    try {
      const globalMode = localStorage.getItem('app_theme_mode');
      if (globalMode === 'dark' || globalMode === 'light') return globalMode === 'dark' ? 'dark' : 'emerald';
      const saved = localStorage.getItem('esma_theme');
      return saved === 'dark' || saved === 'emerald' ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  useThemeSync(theme === 'dark', (newIsDark) => {
    setTheme(newIsDark ? 'dark' : 'emerald');
  });

  const toggleTheme = (newTheme: EsmaTheme) => {
    setTheme(newTheme);
    try { localStorage.setItem('esma_theme', newTheme); } catch { /* storage restrictions */ }
    broadcastThemeChange(newTheme === 'dark');
  };

  const [viewMode, setViewMode] = useState<EsmaViewMode>(() => {
    try {
      const saved = localStorage.getItem('esma_view_mode') as EsmaViewMode;
      if (saved === 'desktop' || saved === 'mobile') return saved;
      return window.innerWidth < 768 ? 'mobile' : 'desktop';
    } catch {
      return 'desktop';
    }
  });

  // Arama filtresi
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (targetEsmaNumber) {
      const found = ESMA_NAMES.find(e => e.n === targetEsmaNumber);
      return found ? found.l : '';
    }
    return '';
  });

  useEffect(() => {
    if (targetEsmaNumber) {
      const found = ESMA_NAMES.find(e => e.n === targetEsmaNumber);
      if (found) {
        setSearchQuery(found.l);
        setSelectedCategory('all');
      }
    } else if (targetCategory) {
      setSelectedCategory(targetCategory);
      setSearchQuery('');
    }
    if (targetAutoPlay) {
      const timer = window.setTimeout(() => { void handlePlay(); }, 150);
      return () => window.clearTimeout(timer);
    }
  }, [targetEsmaNumber, targetCategory, targetAutoPlay, targetTimestamp]);

  const toggleViewMode = (newMode: EsmaViewMode) => {
    setViewMode(newMode);
    try {
      localStorage.setItem('esma_view_mode', newMode);
    } catch {
      // ignore
    }
  };

  const isDark = theme === 'dark';

  // =========================================================================
  // 2. SES (AUDIO) OYNATICI VE KONTROLLERİ
  // =========================================================================
  /*
   * ╔════════════════════════════════════════════════════════════════════════════╗
   * ║                   SES DOSYASI GELECEK YER                                  ║
   * ║ Kendi 'audio.mp3' ses dosyanızı public klasörüne yerleştirebilir veya      ║
   * ║ buradaki 'audioSource' değişkenine dosya yolunu / bağlantısını girebilirsiniz.║
   * ╚════════════════════════════════════════════════════════════════════════════╝
   */
  const audioSource = `${import.meta.env.BASE_URL}audio.mp3`;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Hazır · 99 isim');
  const [hasAudioError, setHasAudioError] = useState<boolean>(false);

  // Ses Seviyesi & Hız
  const [volume, setVolume] = useState<number>(() => readEsmaAudioSettings().volume);
  const [isMuted, setIsMuted] = useState<boolean>(() => readEsmaAudioSettings().muted);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(() => readEsmaAudioSettings().speed);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const lastPositionWriteRef = useRef(0);
  const [audioNotice, setAudioNotice] = useState<string>('');
  const saveAudioPosition = (position: number) => {
    if (!Number.isFinite(position) || position < 0) return;
    try {
      if (position === 0) localStorage.removeItem('esma_audio_position_v1');
      else localStorage.setItem('esma_audio_position_v1', String(position));
    } catch { /* Storage may be unavailable. */ }
  };

  useEffect(() => {
    try {
      localStorage.setItem('esma_audio_settings_v1', JSON.stringify({
        volume, muted: isMuted, speed: playbackSpeed
      }));
    } catch { /* Tarayıcı depolaması kısıtlı olabilir. */ }
  }, [volume, isMuted, playbackSpeed]);

  // Başka sekmeye geçildiğinde veya uygulama kapandığında konumu kaydet.
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (!audio) return;
      if (Number.isFinite(audio.duration) && audio.duration > 0 &&
          audio.currentTime >= audio.duration - 2) {
        try { localStorage.removeItem('esma_audio_position_v1'); } catch {}
      } else if (Number.isFinite(audio.currentTime) && audio.currentTime > 0) {
        try { localStorage.setItem('esma_audio_position_v1', String(audio.currentTime)); } catch {}
      }
      audio.pause();
    };
  }, []);

  // Ses nesnesi ayarlarını senkronize et
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [volume, isMuted, playbackSpeed]);

  const handlePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setAudioNotice('');
    setHasAudioError(false);
    setStatusText('Yükleniyor…');
    try {
      await audio.play();
      // Oynatma durumunun tek kaynağı audio öğesinin play/pause olaylarıdır.
    } catch (error: unknown) {
      const name = error instanceof Error ? error.name : '';
      if (name === 'AbortError') return; // Kullanıcı bu sırada duraklattı.
      setIsPlaying(false);
      if (name === 'NotAllowedError') {
        setHasAudioError(false);
        setAudioNotice('Tarayıcı otomatik oynatmayı engelledi. Başlat düğmesine dokunun.');
        setStatusText('Başlatmak için dokunun');
        return;
      }
      setHasAudioError(true);
      setStatusText('Ses çalınamadı · bağlantıyı veya dosyayı kontrol edin');
    }
  };

  // Başa al: oynuyorsa oynatmaya devam eder, duraklatılmışsa duraklatılmış kalır.
  const handleStop = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      setCurrentTime(0);
      saveAudioPosition(0);
      setStatusText(audio.paused ? 'Başa alındı · Hazır' : 'Başa alındı · Oynatılıyor');
      setAudioNotice('');
    }
  };

  const handlePause = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      saveAudioPosition(audio.currentTime);
    }
    setStatusText('Duraklatıldı');
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (isMuted && newVol > 0) setIsMuted(false);
    if (audioRef.current) audioRef.current.volume = newVol;
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.volume = nextMuted ? 0 : volume;
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    if (Math.abs(audio.currentTime - lastPositionWriteRef.current) >= 5) {
      saveAudioPosition(audio.currentTime);
      lastPositionWriteRef.current = audio.currentTime;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    if (!Number.isFinite(targetTime) || targetTime < 0) return;
    setCurrentTime(targetTime);
    if (audioRef.current) audioRef.current.currentTime = targetTime;
    saveAudioPosition(targetTime);
    lastPositionWriteRef.current = targetTime;
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // =========================================================================
  // 3. ARAMA, FİLTRE VE ÖĞRENİLENLER (EZBERLEME & ZİKİR)
  // =========================================================================
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [learnedNames, setLearnedNames] = useState<Record<number, boolean>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('esma_learned_names') || '{}');
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
      const valid: Record<number, boolean> = {};
      ESMA_NAMES.forEach(item => { if (saved[item.n] === true) valid[item.n] = true; });
      return valid;
    } catch { return {}; }
  });
  const [storageWarning, setStorageWarning] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem('esma_learned_names', JSON.stringify(learnedNames));
      setStorageWarning(false);
    } catch { setStorageWarning(true); }
  }, [learnedNames]);

  const toggleLearned = (num: number) => {
    if (!ESMA_NAMES.some(item => item.n === num)) return;
    setLearnedNames(previous => {
      const next = { ...previous };
      if (next[num]) delete next[num];
      else next[num] = true;
      return next;
    });
  };

  const resetLearned = () => {
    if (!Object.values(learnedNames).some(Boolean)) return;
    if (!window.confirm('Ezberlendi olarak işaretlenen bütün isimler kaldırılsın mı?')) return;
    setLearnedNames({});
    setSelectedCategory('all');
  };

  const learnedCount = useMemo(() => {
    return ESMA_NAMES.filter(item => learnedNames[item.n] === true).length;
  }, [learnedNames]);

  const filteredNames = useMemo(() => {
    return ESMA_NAMES.filter((item) => {
      // Kategori kontrolü
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'learned') {
          if (!learnedNames[item.n]) return false;
        } else if (selectedCategory === 'unlearned') {
          if (learnedNames[item.n]) return false;
        } else if (item.category !== selectedCategory) {
          return false;
        }
      }

      // Arama kontrolü (şapkalı/Türkçe harf ve "Ya / el-" öneki duyarsız)
      if (!searchQuery.trim()) return true;
      const qRaw = searchQuery.toLowerCase().trim();
      const qNorm = normalizeEsmaSearch(searchQuery);
      const lNorm = normalizeEsmaSearch(item.l);
      const mNorm = normalizeEsmaSearch(item.m);
      const arabicNorm = normalizeEsmaSearch(item.a);
      return (
        item.l.toLowerCase().includes(qRaw) ||
        item.m.toLowerCase().includes(qRaw) ||
        (qNorm.length > 0 && (lNorm.includes(qNorm) || mNorm.includes(qNorm))) ||
        item.a.includes(qRaw) ||
        (qNorm.length > 0 && arabicNorm.includes(qNorm)) ||
        String(item.n).padStart(2, '0') === qRaw ||
        String(item.n) === qRaw ||
        `#${item.n}` === qRaw
      );
    });
  }, [searchQuery, selectedCategory, learnedNames]);

  // Renk tanımları: Dark mod vs Yeşil Uİ (diğer sayfalarla tam uyumlu)
  const bgMain = isDark ? 'bg-[#101214] text-[#f4f5f6]' : 'bg-[#FBF9F5] text-slate-800';
  const cardBg = isDark ? 'bg-[#181b1f] border-[#30363d]' : 'bg-white border-slate-200 shadow-xs';
  const cardHeaderBg = isDark ? 'bg-[#20242a] text-[#8be7be]' : 'bg-emerald-50 text-emerald-950 font-bold';
  const borderCol = isDark ? 'border-[#30363d]' : 'border-slate-200';
  const textMuted = isDark ? 'text-[#aeb5bd]' : 'text-slate-500';
  const accentText = isDark ? 'text-[#55c99a]' : 'text-emerald-700';
  const arabicTextCol = isDark ? 'text-[#55c99a]' : 'text-emerald-700';

  return (
    <div className={`min-h-screen ${bgMain} font-sans transition-colors duration-200 pb-16`}>
      
      {/* GİZLİ SES OYNATICI NESNESİ */}
      <audio
        ref={audioRef}
        src={audioSource}
        preload="metadata"
        onLoadedMetadata={() => {
          if (audioRef.current) {
            const audio = audioRef.current;
            if (Number.isFinite(audio.duration)) setDuration(audio.duration);
            setHasAudioError(false);
            setStatusText('Hazır · 99 isim');
            try {
              const saved = Number(localStorage.getItem('esma_audio_position_v1'));
              if (Number.isFinite(saved) && saved > 0 &&
                  Number.isFinite(audio.duration) && saved < audio.duration - 2) {
                audio.currentTime = saved;
                setCurrentTime(saved);
                lastPositionWriteRef.current = saved;
                setStatusText('Kaldığınız yer hazır · Başlatın');
              }
            } catch { /* Storage may be unavailable. */ }
          }
        }}
        onCanPlay={() => {
          setHasAudioError(false);
        }}
        onPlay={() => {
          setIsPlaying(true);
          setStatusText('Oynatılıyor…');
        }}
        onPause={() => {
          setIsPlaying(false);
          setStatusText('Duraklatıldı');
          if (audioRef.current) saveAudioPosition(audioRef.current.currentTime);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setStatusText('Tamamlandı · 99 isim');
          saveAudioPosition(0);
        }}
        onTimeUpdate={handleTimeUpdate}
        onError={() => {
          setIsPlaying(false);
          setHasAudioError(true);
          setStatusText('Ses dosyası yüklenemedi · bağlantınızı kontrol edin');
        }}
      />

      {/* =========================================================================
          1. KENDİ BAŞINA HEADER (ESMAÜ'L-HÜSNÂ ÜST BAŞLIK BARI)
         ========================================================================= */}
      <header
        className={`sticky top-[61px] z-30 border-b backdrop-blur-md transition-colors ${
          isDark
            ? 'bg-[#101214]/95 border-[#30363d]'
            : 'bg-white/95 border-slate-200 shadow-xs'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Başlık ve İlerleme */}
            <div>
              <h1 className={`text-lg sm:text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'} whitespace-nowrap`}>
                Esmaü'l-Hüsnâ
              </h1>
            </div>

            {/* Kontrol Butonları: Görünüm (Masaüstü/Mobil) & Tema (Koyu/Yeşil Uİ) */}
            <div className="flex items-center flex-wrap gap-2 sm:gap-3">
              
              {/* Ezberlenen Sayaç */}
              <div
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                  isDark ? 'bg-[#181b1f] border-[#30363d] text-[#8be7be]' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
                title="Öğrendiğiniz isimler"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span aria-live="polite">Ezberlenen: {learnedCount} / 99</span>
              </div>

              {learnedCount > 0 && (
                <button type="button" onClick={resetLearned}
                  className={`min-h-[44px] px-3 rounded-xl border text-xs font-bold transition-colors ${isDark ? 'border-[#30363d] text-[#aeb5bd] hover:text-white' : 'border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                  title="Ezberlendi işaretlerinin tamamını temizle">
                  İşaretleri sıfırla
                </button>
              )}
              {/* Görünüm Modu: Masaüstü vs Mobil */}
              <div className={`inline-flex p-1 rounded-xl border ${isDark ? 'bg-[#181b1f] border-[#30363d]' : 'bg-slate-100 border-slate-200'}`}>
                <button
                  id="btn-esma-view-desktop" aria-label="Masaüstü tablo görünümü" aria-pressed={viewMode === 'desktop'}
                  onClick={() => toggleViewMode('desktop')}
                  className={`flex items-center justify-center min-w-[44px] min-h-[44px] px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'desktop'
                      ? isDark
                        ? 'bg-[#20242a] text-[#55c99a] border border-[#55c99a]/40 shadow-xs'
                        : 'bg-white text-emerald-800 shadow-xs border border-emerald-300'
                      : isDark
                      ? 'text-[#aeb5bd] hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Geniş Tablo Görünümü"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>

                <button
                  id="btn-esma-view-mobile" aria-label="Mobil kart görünümü" aria-pressed={viewMode === 'mobile'}
                  onClick={() => toggleViewMode('mobile')}
                  className={`flex items-center justify-center min-w-[44px] min-h-[44px] px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'mobile'
                      ? isDark
                        ? 'bg-[#20242a] text-[#55c99a] border border-[#55c99a]/40 shadow-xs'
                        : 'bg-white text-emerald-800 shadow-xs border border-emerald-300'
                      : isDark
                      ? 'text-[#aeb5bd] hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Kompakt Kart Görünümü"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tema Seçici: Koyu Mod vs Yeşil Uİ */}
              <div className={`inline-flex p-1 rounded-xl border ${isDark ? 'bg-[#181b1f] border-[#30363d]' : 'bg-slate-100 border-slate-200'}`}>
                <button
                  id="btn-esma-theme-dark" aria-label="Koyu tema" aria-pressed={isDark}
                  onClick={() => toggleTheme('dark')}
                  className={`flex items-center justify-center min-w-[44px] min-h-[44px] gap-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isDark
                      ? 'bg-[#20242a] text-[#55c99a] border border-[#55c99a]/40 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Orijinal Siyah / Koyu Tasarım"
                >
                  <Moon className="w-3.5 h-3.5 text-[#55c99a]" />
                </button>

                <button
                  id="btn-esma-theme-emerald" aria-label="Açık tema" aria-pressed={!isDark}
                  onClick={() => toggleTheme('emerald')}
                  className={`flex items-center justify-center min-w-[44px] min-h-[44px] gap-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !isDark
                      ? 'bg-white text-emerald-800 shadow-xs border border-emerald-300'
                      : 'text-[#aeb5bd] hover:text-white'
                  }`}
                  title="Açık Yeşil Uİ Modu"
                >
                  <Sun className="w-3.5 h-3.5 text-emerald-600" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. SES KONTROL PANELİ & HIZ/SES AYARLARI
         ========================================================================= */}
      <section className="max-w-[1340px] mx-auto px-4 sm:px-6 pt-5">
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${cardBg}`}>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Oynat / Durdur / Duraklat Butonları */}
            <div className="flex items-center flex-wrap gap-2.5">
              {!isPlaying ? (
                <button type="button"
                  id="btn-esma-start"
                  onClick={handlePlay}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md bg-[#55c99a] text-[#07130e] hover:bg-[#48b488] active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Başlat</span>
                </button>
              ) : (
                <button type="button"
                  id="btn-esma-pause"
                  onClick={handlePause}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md bg-red-500 text-slate-950 hover:bg-red-600 active:scale-95"
                >
                  <Pause className="w-4 h-4" />
                  <span>Duraklat</span>
                </button>
              )}

              <button
                id="btn-esma-stop"
                onClick={handleStop}
                title="Kaydı en başa sar (0:00)"
                className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer border active:scale-95 ${
                  isDark
                    ? 'bg-[#20242a] text-slate-200 border-[#30363d] hover:border-[#55c99a]'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <RotateCcw className={`w-3.5 h-3.5 ${accentText}`} />
                <span>Başa Al</span>
              </button>

              {/* Durum Metni */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <span id="esma-status" role="status" aria-live="polite" className={textMuted}>
                  {statusText}
                </span>
              </div>
            </div>

            {/* Sağ Taraf: Hız & Ses Seviyesi Kontrolleri */}
            <div className="flex items-center flex-wrap gap-4 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-700/20">
              
              {/* Oynatma Hızı İmleci (Range Slider) */}
              <div className="flex items-center gap-2">
                <Gauge className={`w-3.5 h-3.5 ${accentText}`} />
                <span className={`text-xs font-bold ${textMuted}`}>Hız:</span>
                <input
                  type="range"
                  aria-label="Oynatma hızı"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={playbackSpeed}
                  onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                  className="w-20 sm:w-28 h-1.5 rounded-lg appearance-none cursor-pointer accent-[#55c99a]"
                  title={`Hız: ${playbackSpeed.toFixed(1)}x`}
                />
                <span className={`text-xs font-mono font-bold ${isDark ? 'text-[#8be7be]' : 'text-emerald-700'} w-10 text-right`}>
                  {playbackSpeed.toFixed(1)}x
                </span>
              </div>

              {/* Ses Seviyesi Slider & Mute */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-[#20242a] text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                  aria-label={isMuted ? 'Sesi aç' : 'Sesi kapat'}
                  aria-pressed={isMuted}
                  title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className={`w-4 h-4 ${accentText}`} />
                  )}
                </button>

                <input
                  type="range"
                  aria-label="Ses düzeyi"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-20 sm:w-24 h-1.5 rounded-lg appearance-none cursor-pointer accent-[#55c99a]"
                  title={`Ses: %${Math.round((isMuted ? 0 : volume) * 100)}`}
                />
                <span className={`text-[11px] font-mono ${textMuted} w-8`}>
                  %{Math.round((isMuted ? 0 : volume) * 100)}
                </span>
              </div>

            </div>

          </div>

          {audioNotice && (
            <p role="status" className={`mt-3 rounded-lg px-3 py-2 text-xs ${isDark ? 'bg-amber-950/40 text-amber-200' : 'bg-amber-50 text-amber-900'}`}>
              {audioNotice}
            </p>
          )}
          <p className={`mt-2 text-[11px] ${textMuted}`}>
            Toplu 99 isim ses kaydıdır. Dinleme konumunuz ve hız/ses ayarlarınız bu tarayıcıda saklanır; ses yeniden açılışta otomatik başlamaz.
          </p>

          {/* İlerleme Zaman Çubuğu (Varsa) */}
          {duration > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-700/20 flex items-center gap-3 text-xs">
              <span className={`font-mono text-[11px] ${textMuted}`}>{formatTime(currentTime)}</span>
              <input
                type="range"
                aria-label="Ses kaydı oynatma konumu"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-[#55c99a]"
              />
              <span className={`font-mono text-[11px] ${textMuted}`}>{formatTime(duration)}</span>
            </div>
          )}

          {/* SES DOSYASI BİLGİLENDİRME KUTUSU (Kullanıcı için kılavuz) */}
          {hasAudioError && (
            <div className={`mt-3 p-3 rounded-xl text-xs flex items-start gap-2.5 border ${
              isDark ? 'bg-amber-950/30 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Ses yüklenemedi.</strong> Ses dosyası uygulamada bulunuyor; internet bağlantısını kontrol edin ve tekrar Başlat'a dokunun. Sorun sürerse sayfayı yenileyin.
              </div>
            </div>
          )}

        </div>
      </section>

      {/* =========================================================================
          3. ARAMA VE KATEGORİ FİLTRELEME BARI
         ========================================================================= */}
      <section className="max-w-[1340px] mx-auto px-4 sm:px-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Arama Kutusu */}
          <div className="relative flex-1 max-w-md">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${textMuted}`} />
            <input
              type="search"
              aria-label="Esmaü'l-Hüsnâ isim ve anlam araması"
              placeholder="İsim, Arapça veya anlamda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#55c99a] ${
                isDark
                  ? 'bg-[#181b1f] border-[#30363d] text-slate-100 placeholder-slate-500'
                  : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-xs'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Aramayı temizle"
                className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Hızlı Filtre Sekmeleri */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {searchQuery.trim() && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border bg-amber-500 text-slate-950 border-amber-400 shadow-xs hover:bg-amber-400"
              >
                Tüm 99 İsmi Göster ✕
              </button>
            )}
            {[
              { id: 'all', label: 'Tümü (99)' },
              { id: 'rahmet', label: 'Rahmet' },
              { id: 'kudret', label: 'Kudret' },
              { id: 'ilim', label: 'İlim' },
              { id: 'adalet', label: 'Adalet' },
              { id: 'learned', label: `Ezberlenen (${learnedCount})` },
              { id: 'unlearned', label: `Henüz Ezberlenmeyen (${99 - learnedCount})` }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (cat.id !== 'all' && searchQuery) {
                    setSearchQuery('');
                  }
                }}
                aria-pressed={selectedCategory === cat.id}
                className={`min-h-[44px] px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCategory === cat.id
                    ? isDark
                      ? 'bg-[#55c99a] text-[#07130e] border-[#55c99a] shadow-xs'
                      : 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : isDark
                    ? 'bg-[#181b1f] text-[#aeb5bd] border-[#30363d] hover:text-white'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. İÇERİK BÖLÜMÜ: MASAÜSTÜ TABLOSU VEYA MOBİL KART DÜZENİ
         ========================================================================= */}
      <main className="max-w-[1340px] mx-auto px-4 sm:px-6 pt-4">
        <div role="status" aria-live="polite" className={`flex flex-wrap items-center justify-between gap-2 text-xs mb-3 ${textMuted}`}>
          <span>{filteredNames.length} / 99 isim gösteriliyor.</span>
          {storageWarning && <span className="text-amber-500">Ezber kayıtları bu tarayıcıya kaydedilemedi. Tarayıcı depolamasını kontrol edin.</span>}
        </div>
        
        {/* MASAÜSTÜ TABLO GÖRÜNÜMÜ */}
        {viewMode === 'desktop' ? (
          <div className={`overflow-x-auto rounded-2xl border transition-all ${cardBg}`}>
            <table className="w-full border-collapse text-left" aria-label="Esmaül Hüsna 99 isim tablosu">
              <thead>
                <tr className={cardHeaderBg}>
                  <th className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider w-[8%] border-b ${borderCol}`}>
                    No
                  </th>
                  <th className={`py-3.5 px-6 text-xs font-bold uppercase tracking-wider w-[24%] border-b ${borderCol} text-right`} dir="rtl">
                    Arapça
                  </th>
                  <th className={`py-3.5 px-5 text-xs font-bold uppercase tracking-wider w-[22%] border-b ${borderCol}`}>
                    Türkçesi
                  </th>
                  <th className={`py-3.5 px-5 text-xs font-bold uppercase tracking-wider w-[40%] border-b ${borderCol}`}>
                    Anlamı
                  </th>
                  <th className={`py-3.5 px-3 text-xs font-bold uppercase tracking-wider w-[6%] border-b ${borderCol} text-center`}>
                    Ezber
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-[#30363d]' : 'divide-slate-100'}`}>
                {filteredNames.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm opacity-60">
                      Aramanızla eşleşen isim bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredNames.map((item) => {
                    const isDone = !!learnedNames[item.n];
                    return (
                      <tr
                        key={item.n}
                        className={`transition-colors group ${
                          isDone
                            ? isDark
                              ? 'bg-emerald-950/20 hover:bg-emerald-950/30'
                              : 'bg-emerald-50/40 hover:bg-emerald-50/70'
                            : isDark
                            ? 'hover:bg-[#55c99a]/5'
                            : 'hover:bg-emerald-50/30'
                        }`}
                      >
                        {/* No */}
                        <td className="py-3 px-4 text-xs font-bold text-slate-400 font-mono">
                          {String(item.n).padStart(2, '0')}
                        </td>

                        {/* Arapça (Tamamen Yeşil & font-amiri) */}
                        <td className={`py-3 px-6 font-amiri text-3xl font-bold text-right ${arabicTextCol} tracking-wide`} dir="rtl" lang="ar">
                          {item.a}
                        </td>

                        {/* Türkçe İsim */}
                        <td className="py-3 px-5 text-base font-extrabold tracking-tight">
                          <span className={isDark ? 'text-[#f4f5f6]' : 'text-slate-900'}>
                            {item.l}
                          </span>
                        </td>

                        {/* Anlamı */}
                        <td className={`py-3 px-5 text-xs sm:text-sm leading-relaxed ${textMuted}`}>
                          {item.m}
                        </td>

                        {/* Ezberledim Onayı */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => toggleLearned(item.n)}
                            title={isDone ? 'Ezberlendi işaretini kaldır' : 'Ezberledim olarak işaretle'}
                             aria-label={`${item.l}: ${isDone ? 'Ezberlendi işaretini kaldır' : 'Ezberledim olarak işaretle'}`}
                             aria-pressed={isDone}
                            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                              isDone
                                ? 'text-emerald-500 hover:text-emerald-400'
                                : 'text-slate-400 hover:text-emerald-500 opacity-40 hover:opacity-100'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* MOBİL KART GÖRÜNÜMÜ */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredNames.length === 0 ? (
              <div className={`col-span-full p-8 text-center rounded-2xl border ${cardBg}`}>
                <p className="text-sm opacity-60">Aramanızla eşleşen isim bulunamadı.</p>
              </div>
            ) : (
              filteredNames.map((item) => {
                const isDone = !!learnedNames[item.n];
                return (
                  <div
                    key={item.n}
                    className={`p-4 rounded-2xl border transition-all ${cardBg} ${
                      isDone
                        ? isDark
                          ? 'border-emerald-500/40 bg-emerald-950/15'
                          : 'border-emerald-300 bg-emerald-50/40'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between border-b pb-2 mb-2.5 border-slate-700/20">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-[#55c99a] text-xs font-mono font-bold flex items-center justify-center">
                          {String(item.n).padStart(2, '0')}
                        </span>
                        <h3 className="font-extrabold text-base tracking-tight">
                          {item.l}
                        </h3>
                      </div>

                      <button
                        onClick={() => toggleLearned(item.n)}
                        aria-label={`${item.l}: ${isDone ? 'Ezberlendi işaretini kaldır' : 'Ezberlendi olarak işaretle'}`}
                        aria-pressed={isDone}
                        className={`min-h-[44px] flex items-center justify-center gap-1 text-xs font-semibold px-3 rounded-lg transition-all cursor-pointer border ${
                          isDone
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : isDark
                            ? 'bg-[#20242a] text-[#aeb5bd] border-[#30363d]'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{isDone ? 'Ezberlendi' : 'Ezberle'}</span>
                      </button>
                    </div>

                    {/* Arapça Büyük İbare */}
                    <div
                      className={`text-center py-2 font-amiri text-4xl font-bold tracking-wide ${arabicTextCol}`}
                      dir="rtl" lang="ar"
                    >
                      {item.a}
                    </div>

                    {/* Anlamı */}
                    <p className={`text-xs leading-relaxed pt-2 mt-1 border-t border-slate-700/20 ${textMuted}`}>
                      {item.m}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* =========================================================================
            5. ALT LİSANS VE BİLGİ ALANI (Orijinal HTML'den gelen telif ve kaynak)
           ========================================================================= */}
        <div className={`mt-8 pt-5 pb-6 border-t ${borderCol} text-xs leading-relaxed ${textMuted}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="mb-1">
                <strong>Ses Kaynağı:</strong> "Asmaul Husna The Beautiful Names Of Allah SWT (God) Podcast Edition" by Jannah Firdaus Mediapro is licensed under{' '}
                <a
                  href="https://creativecommons.org/licenses/by-nc-nd/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-0.5 underline ${accentText}`}
                >
                  CC BY-NC-ND 4.0 <ExternalLink className="w-3 h-3" />
                </a>.
              </p>
              <p>
                <strong>Eser Sahibi:</strong> Jannah Firdaus Mediapro
              </p>
            </div>
            
            <div className="flex items-center justify-end gap-1.5 opacity-80">
            </div>
          </div>
        </div>

      </main>

    </div>
  );
};
