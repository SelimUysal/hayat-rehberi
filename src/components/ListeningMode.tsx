import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Moon, 
  Sun, 
  Clock, 
  Volume2, 
  VolumeX, 
  Bookmark, 
  Eye, 
  EyeOff, 
  Gauge, 
  Sparkles,
  Repeat,
  Maximize2,
  Minimize2,
  MonitorSmartphone,
  ListChecks,
  RotateCcw
} from 'lucide-react';
import { SURAHS, RECITERS } from '../data/surahs';
import { AMBIENCE_SLIDES } from '../data/ambienceImages';
import { Ayah } from '../types';
import { fetchSurahData } from '../services/quranApi';
import { SurahSearchSelect } from './SurahSearchSelect';
import { nextSurahInListeningLoop, previousAyahInListeningSequence } from '../utils/listeningPlaybackGuards';
import { recordListeningDiagnostic as logListen, classifyListeningError } from '../utils/listeningDiagnostics';
import { ListeningDiagnosticsPanel } from './ListeningDiagnosticsPanel';
import { ListeningBookmarksDialog } from './ListeningBookmarksDialog';
import { readABLoop, saveABLoop, orderABPoints, validateABRange, completeABIteration, isABEndAyah, inABRange, type ABLoopState, type ABPoint } from '../utils/listeningABLoop';
import { readManualListeningBookmarks, writeManualListeningBookmarks, createManualListeningBookmark, editManualListeningBookmark, type ManualListeningBookmark, type ListeningBookmarkPosition } from '../utils/listeningBookmarks';
import { TroubleshootingMenu } from './TroubleshootingMenu';
import { useListeningWakeLock } from '../utils/useListeningWakeLock';

interface ListeningModeProps {
  targetSurahId?: number;
  targetReciterId?: string;
  targetTimestamp?: number;
}

/**
 * Ayet metnini kelimelere ayırırken tek başına duran secavend/vakıf işaretlerini (ۖ, ۗ, ۘ, ۙ, ۚ, ۛ, ۜ, ۞)
 * ait oldukları kelimeyle birleştirir; böylece vurgu hiçbir zaman tek başına bir noktalama işaretinde kalmaz.
 */
function tokenizeAyahWords(cleanedText: string): string[] {
  if (!cleanedText) return [];
  const rawTokens = cleanedText.trim().split(/\s+/).filter(Boolean);
  const mergedWords: string[] = [];

  for (const token of rawTokens) {
    const hasArabicLetter = /[\u0621-\u064A\u066E-\u06D3\u06FA-\u06FF]/.test(token);
    if (!hasArabicLetter && mergedWords.length > 0) {
      mergedWords[mergedWords.length - 1] = `${mergedWords[mergedWords.length - 1]} ${token}`;
    } else if (
      hasArabicLetter &&
      mergedWords.length === 1 &&
      !/[\u0621-\u064A\u066E-\u06D3\u06FA-\u06FF]/.test(mergedWords[0])
    ) {
      mergedWords[0] = `${mergedWords[0]} ${token}`;
    } else {
      mergedWords.push(token);
    }
  }

  return mergedWords;
}

/**
 * Arapça kelimenin tilavet (okunuş) süresini harf sayısı, med uzatmaları, şedde ve vakıf
 * kurallarına göre ağırlıklandıran yardımcı fonksiyon.
 */
function computeArabicWordWeight(word: string, index: number, totalWords: number): number {
  if (!word) return 1;
  // Harekeleri ve durak işaretlerini arındırarak temel harf sayısını bul
  const baseLetters = word.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\s]/g, '');
  let weight = Math.max(1, baseLetters.length) * 1.0;

  // Med harfleri (Elif, Vav, Ye ve Asâ/Çeker)
  const longVowels = (word.match(/[اويى\u0670]/g) || []).length;
  weight += longVowels * 0.85;

  // Med işareti (~ / Medd-i Muttasıl, Munfasıl, Lâzım)
  const maddSigns = (word.match(/[\u0653\u0622\u06E4]/g) || []).length;
  weight += maddSigns * 2.3;

  // Şedde ve Gunne tutuşları
  const shaddas = (word.match(/[\u0651]/g) || []).length;
  weight += shaddas * 0.65;

  // Kelime sonundaki vakıf/durak işaretleri (secavend) için kısa nefes/duraksama payı
  const waqfMarks = (word.match(/[\u06D6-\u06DC]/g) || []).length;
  weight += waqfMarks * 0.5;

  // Ayet sonu vakıf (Medd-i Ârız) uzatması
  if (index === totalWords - 1) {
    weight = weight * 1.35 + 1.2;
  }

  return weight;
}

/**
 * Normal Mod ve Gece Saati (Nightstand) Modu arasında tam senkronize çalışan
 * Kelime Bazlı Takip (Word-by-Word Highlight) Hook'u.
 */
function useSynchronizedWordTracking(
  audioRef: React.MutableRefObject<HTMLAudioElement>,
  cleanedAyahText: string,
  isPlaying: boolean,
  currentSurahId: number,
  currentAyahIndex: number,
  audioEpoch: number
) {
  const [isWordTrackingEnabled, setIsWordTrackingEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('quran_listening_word_tracking');
      return saved !== null ? JSON.parse(saved) === true : false;
    } catch {
      return false;
    }
  });

  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const activeWordIndexRef = useRef<number | null>(null);

  const toggleWordTracking = useCallback(() => {
    setIsWordTrackingEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('quran_listening_word_tracking', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Ayetin kelimeleri ve her kelimenin ağırlıklı zaman aralıkları [startRatio, endRatio]
  const wordTimeline = React.useMemo(() => {
    const words = tokenizeAyahWords(cleanedAyahText);
    if (words.length === 0) {
      return { words: [] as string[], ranges: [] as Array<{ start: number; end: number }> };
    }

    const weights = words.map((w, idx) => computeArabicWordWeight(w, idx, words.length));
    const totalWeight = weights.reduce((acc, w) => acc + w, 0) || 1;

    let cumulative = 0;
    const ranges = weights.map((w) => {
      const start = cumulative / totalWeight;
      cumulative += w;
      const end = cumulative / totalWeight;
      return { start, end };
    });

    return { words, ranges };
  }, [cleanedAyahText]);

  // Ayet veya sure değiştiğinde vurguyu ilk kelimeye hazırla
  useEffect(() => {
    if (!isWordTrackingEnabled || wordTimeline.words.length === 0) {
      activeWordIndexRef.current = null;
      setActiveWordIndex(null);
      return;
    }
    activeWordIndexRef.current = 0;
    setActiveWordIndex(0);
  }, [currentSurahId, currentAyahIndex, isWordTrackingEnabled, wordTimeline.words.length]);

  // Ses oynatılırken o anki saniyeye göre okunan kelimeyi hassas olarak hesapla
  useEffect(() => {
    if (!isWordTrackingEnabled || wordTimeline.words.length === 0) {
      activeWordIndexRef.current = null;
      setActiveWordIndex(null);
      return;
    }

    const player = audioRef.current;

    const updateCurrentWordFromAudio = () => {
      if (!player) return;

      const duration = player.duration;
      const currentTime = player.currentTime;

      if (!duration || !isFinite(duration) || duration <= 0) {
        if (activeWordIndexRef.current !== 0) {
          activeWordIndexRef.current = 0;
          setActiveWordIndex(0);
        }
        return;
      }

      if (currentTime <= 0 && !isPlaying) {
        if (activeWordIndexRef.current !== 0) {
          activeWordIndexRef.current = 0;
          setActiveWordIndex(0);
        }
        return;
      }

      // Ses dosyasının başındaki çok kısa nefes payı ve sonundaki sessizlik payı
      const leadOffset = Math.min(0.12, duration * 0.03);
      const trailOffset = Math.min(0.22, duration * 0.05);
      const effectiveDuration = Math.max(0.2, duration - leadOffset - trailOffset);
      const effectiveTime = Math.max(0, currentTime - leadOffset);
      const progress = Math.max(0, Math.min(0.9999, effectiveTime / effectiveDuration));

      const ranges = wordTimeline.ranges;
      let matchedIdx = ranges.length - 1;
      for (let i = 0; i < ranges.length; i++) {
        if (progress >= ranges[i].start && progress < ranges[i].end) {
          matchedIdx = i;
          break;
        }
      }

      if (activeWordIndexRef.current !== matchedIdx) {
        activeWordIndexRef.current = matchedIdx;
        setActiveWordIndex(matchedIdx);
      }
    };

    // Mod değiştirildiğinde veya buton yeni açıldığında anında mevcut saniyeyi senkronize et
    updateCurrentWordFromAudio();

    if (player) {
      player.addEventListener('timeupdate', updateCurrentWordFromAudio);
      player.addEventListener('loadedmetadata', updateCurrentWordFromAudio);
      player.addEventListener('seeking', updateCurrentWordFromAudio);
      player.addEventListener('play', updateCurrentWordFromAudio);
    }

    let timer: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      timer = setInterval(updateCurrentWordFromAudio, 40);
    }

    return () => {
      if (player) {
        player.removeEventListener('timeupdate', updateCurrentWordFromAudio);
        player.removeEventListener('loadedmetadata', updateCurrentWordFromAudio);
        player.removeEventListener('seeking', updateCurrentWordFromAudio);
        player.removeEventListener('play', updateCurrentWordFromAudio);
      }
      if (timer) clearInterval(timer);
    };
  }, [audioRef, audioEpoch, isWordTrackingEnabled, isPlaying, wordTimeline]);

  return {
    isWordTrackingEnabled,
    toggleWordTracking,
    words: wordTimeline.words,
    activeWordIndex
  };
}

export const ListeningMode: React.FC<ListeningModeProps> = ({ targetSurahId, targetReciterId, targetTimestamp }) => {
  // Kaydedilmiş Durumdan Yükleme
  const getSavedBookmark = () => {
    try {
      const saved = localStorage.getItem('quran_listening_bookmark');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          surahId: Number(parsed.surahId) || 1,
          ayahIndex: Number(parsed.ayahIndex) || 0,
          currentTime: Number(parsed.currentTime) || 0,
          reciter: parsed.reciter || 'ar.mahermuaiqly'
        };
      }
    } catch {
      // ignore
    }
    return { surahId: 1, ayahIndex: 0, currentTime: 0, reciter: 'ar.mahermuaiqly' };
  };

  const initialBookmark = getSavedBookmark();
  const diagnosticContext = () => ({ surah: currentSurahIdRef.current, ayah: currentAyahIndexRef.current + 1 });

  // Durumlar
  const [currentSurahId, setCurrentSurahId] = useState<number>(targetSurahId || initialBookmark.surahId || 1);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(targetSurahId && targetSurahId !== initialBookmark.surahId ? 0 : (initialBookmark.ayahIndex || 0));
  const [selectedReciter, setSelectedReciter] = useState<string>(() => {
    try {
      const savedReciter = localStorage.getItem('quran_listening_reciter_mahir_default');
      if (savedReciter && RECITERS.some((r) => r.id === savedReciter)) {
        return savedReciter;
      }
      if (RECITERS.some((r) => r.id === initialBookmark.reciter)) {
        return initialBookmark.reciter;
      }
    } catch {
      // ignore
    }
    return 'ar.mahermuaiqly';
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [manualBookmarks, setManualBookmarks] = useState<ManualListeningBookmark[]>(readManualListeningBookmarks);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [bookmarkCandidate, setBookmarkCandidate] = useState<ListeningBookmarkPosition | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { enabled: keepScreenAwake, setEnabled: setKeepScreenAwake, status: wakeStatus } = useListeningWakeLock(isPlaying);
  // Keep the button label stable. State is conveyed by its pressed styling;
  // short badges are shown only when extra feedback actually helps.
  const screenAwakeLabel = 'Ekran açık kalsın';
  const screenAwakeBadge = !keepScreenAwake ? null
    : wakeStatus === 'active' ? 'Etkin'
    : wakeStatus === 'requesting' ? 'Açılıyor'
    : wakeStatus === 'blocked' ? 'İzin yok'
    : wakeStatus === 'unsupported' ? 'Destek yok'
    : null;
  const screenAwakeAccessibility = !keepScreenAwake ? 'Kapalı'
    : wakeStatus === 'active' ? 'Etkin'
    : wakeStatus === 'waiting' ? 'Dinleme başlayınca etkinleşir'
    : wakeStatus === 'requesting' ? 'Ekran açık tutma isteği yapılıyor'
    : wakeStatus === 'blocked' ? 'Cihaz ekran açık tutma iznini vermedi'
    : 'Tarayıcı bu özelliği desteklemiyor';
  const screenAwakeTitle = wakeStatus === 'unsupported' ? 'Tarayıcınız ekranı açık tutma özelliğini desteklemiyor. Ses çalmaya devam edebilir.'
    : wakeStatus === 'blocked' ? 'Cihaz, tarayıcı veya pil tasarrufu ekranı açık tutma isteğini reddetti.'
    : 'Dinleme sürerken ekranı açık tutmayı dene. Oynatma durursa veya uygulamadan çıkarsanız izin bırakılır.';
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  // Mobile browsers cannot read or control Android/iOS system media volume.
  // Use the device's hardware keys rather than a competing in-app volume slider.
  const [usesDeviceVolume, setUsesDeviceVolume] = useState<boolean>(() =>
    typeof window !== 'undefined' && (
      window.matchMedia('(pointer: coarse)').matches ||
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    )
  );
  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)');
    const update = () => setUsesDeviceVolume(
      query.matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    );
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('quran_listening_speed'));
      return Number.isFinite(saved) && saved >= 0.5 && saved <= 3 ? saved : 1;
    } catch {
      return 1;
    }
  });
  const [showTranslation, setShowTranslation] = useState<boolean>(false); // Varsayılan gizli

  // Opt-in, local-only complete Quran listening tracker.
  const trackerKey = 'quran_listening_full_cycle_v1';
  type CycleState = { enabled: boolean; total: number; surah: number; ayah: number; completedSurahs: number };
  const emptyCycle = (enabled = false): CycleState => ({ enabled, total: 0, surah: 1, ayah: 0, completedSurahs: 0 });
  const [cycle, setCycle] = useState<CycleState>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(trackerKey) || 'null');
      if (saved && typeof saved.enabled === 'boolean' &&
          Number.isSafeInteger(saved.total) && saved.total >= 0 &&
          Number.isInteger(saved.surah) && saved.surah >= 1 && saved.surah <= 114 &&
          Number.isInteger(saved.ayah) && saved.ayah >= 0 &&
          Number.isInteger(saved.completedSurahs) && saved.completedSurahs >= 0 && saved.completedSurahs <= 113) {
        return saved;
      }
    } catch { /* storage unavailable */ }
    return emptyCycle();
  });
  const cycleRef = useRef(cycle);
  const [abLoop, setABLoop] = useState<ABLoopState>(readABLoop);
  const abLoopRef = useRef(abLoop);
  const updateAB = (next:ABLoopState)=>{abLoopRef.current=next;setABLoop(next);saveABLoop(next);};
  const cancelAB = ()=>{if(abLoopRef.current.active)updateAB({...abLoopRef.current,active:false});};
  const [cycleMenuOpen, setCycleMenuOpen] = useState(false);
  useEffect(() => {
    if (!cycleMenuOpen) return;
    const dismiss = (event: KeyboardEvent) => { if (event.key === 'Escape') setCycleMenuOpen(false); };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [cycleMenuOpen]);
  const startedCycleAyahRef = useRef<string | null>(null);
  const updateCycle = (next: CycleState) => {
    cycleRef.current = next;
    setCycle(next);
    try { localStorage.setItem(trackerKey, JSON.stringify(next)); } catch { /* private mode */ }
  };
  const interruptCycle = () => {
    const old = cycleRef.current;
    startedCycleAyahRef.current = null;
    if (old.enabled && (old.completedSurahs > 0 || old.ayah > 0)) {
      updateCycle({ ...old, surah: 1, ayah: 0, completedSurahs: 0 });
    }
  };
  const recordCompletedAyah = (surah: number, idx: number, length: number, player: HTMLAudioElement) => {
    const old = cycleRef.current;
    if (!old.enabled || abLoopRef.current.active) return;
    // A new cycle must begin at the first second of Al-Fatiha.
    const validEnd = Number.isFinite(player.duration) && player.duration > 0 &&
      player.currentTime >= player.duration - 0.15;
    if (!validEnd || startedCycleAyahRef.current !== `${surah}:${idx}` || old.surah !== surah || old.ayah !== idx) {
      interruptCycle();
      return;
    }
    startedCycleAyahRef.current = null;
    if (idx + 1 < length) {
      updateCycle({ ...old, ayah: idx + 1 });
    } else if (surah === 114) {
      updateCycle({ ...old, total: old.total + 1, surah: 1, ayah: 0, completedSurahs: 0 });
    } else {
      updateCycle({ ...old, surah: surah + 1, ayah: 0, completedSurahs: surah });
    }
  };

  // Veri
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [translations, setTranslations] = useState<Ayah[]>([]);

  // Ambiyans, Siyah Ekran (Gece Saati) ve Odak Modu
  const [isBlackScreenMode, setIsBlackScreenMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('quran_listening_black_screen') === '1';
    } catch {
      return false;
    }
  });
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isSlideshowRunning, setIsSlideshowRunning] = useState<boolean>(true);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');

  const toggleFocusMode = useCallback(() => {
    setIsFocusMode((prev) => !prev);
  }, []);

  // Odak modundayken ESC tuşu ile çıkış desteği
  useEffect(() => {
    if (!isFocusMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  // Uyku Zamanlayıcısı (Sleep Timer)
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [customSleepMinutes, setCustomSleepMinutes] = useState<number>(45);
  const [sleepMenuOpen, setSleepMenuOpen] = useState(false);
  const sleepMenuRef = useRef<HTMLDivElement>(null);
  const [sleepSecondsLeft, setSleepSecondsLeft] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [surahFetchAttempt, setSurahFetchAttempt] = useState(0);
  const surahRetryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const surahRetryCountRef = useRef(0);
  // Bağlantı geri döndüğünde bekleyen zamanlayıcıları atlayıp hemen dene.
  useEffect(() => {
    const onOnline = () => {
      if (!isPlayingRef.current || isSleepStoppingRef.current) return;
      if (surahRetryRef.current !== null) {
        clearTimeout(surahRetryRef.current);
        surahRetryRef.current = null;
        setSurahFetchAttempt(n => n + 1);
      }
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
        reconnectPlaybackRef.current();
      }
    };
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('online', onOnline);
      if (surahRetryRef.current !== null) clearTimeout(surahRetryRef.current);
    };
  }, []);

  const [audioEpoch, setAudioEpoch] = useState(0);

  // Referanslar
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const preloadNextAudioRef = useRef<HTMLAudioElement>(new Audio());
  const preloadAfterNextAudioRef = useRef<HTMLAudioElement>(new Audio());
  const playbackSpeedRef = useRef<number>(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;
  const volumeRef = useRef<number>(volume);
  const mutedRef = useRef<boolean>(isMuted);
  volumeRef.current = volume;
  mutedRef.current = isMuted;
  const usesDeviceVolumeRef = useRef<boolean>(usesDeviceVolume);
  usesDeviceVolumeRef.current = usesDeviceVolume;

  const applyOutputVolume = useCallback((player: HTMLAudioElement) => {
    // In device mode, let hardware volume keys control the single effective scale.
    player.muted = false;
    player.volume = usesDeviceVolumeRef.current ? 1 : (mutedRef.current ? 0 : volumeRef.current);
  }, []);
  const playRequestRef = useRef(0);
  // Only explicit UI / MediaSession commands can cancel playback intent.
  // A native audio 'pause' also fires on normal 'ended', source swaps and retries;
  // treating it as user intent interrupts the endless ayah sequence.
  const pauseInternally = useCallback((player: HTMLAudioElement) => {
    player.pause();
  }, []);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handoffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelHandoff = useCallback(() => {
    if (handoffTimerRef.current !== null) {
      clearTimeout(handoffTimerRef.current);
      handoffTimerRef.current = null;
    }
  }, []);
  const pauseAllPlayers = useCallback(() => {
    new Set([audioRef.current, preloadNextAudioRef.current, preloadAfterNextAudioRef.current])
      .forEach((audio) => audio.pause());
  }, []);
  const retryAttemptsRef = useRef(0);
  const lastAudioProgressRef = useRef({ at: Date.now(), seconds: 0 });
  const reconnectPlaybackRef = useRef<() => void>(() => {});

  const currentSurahIdRef = useRef<number>(currentSurahId);
  currentSurahIdRef.current = currentSurahId;

  const currentAyahIndexRef = useRef<number>(currentAyahIndex);
  currentAyahIndexRef.current = currentAyahIndex;

  const selectedReciterRef = useRef<string>(selectedReciter);
  selectedReciterRef.current = selectedReciter;

  const savedCurrentTimeRef = useRef<number>(initialBookmark.currentTime || 0);

  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;

  const ayahsRef = useRef<Ayah[]>(ayahs);
  ayahsRef.current = ayahs;

  const shouldAutoPlayNextSurahRef = useRef<boolean>(false);
  const previousNavigationRef = useRef<() => void>(() => {});
  const sleepTimerIntervalRef = useRef<any>(null);
  const sleepTargetEndTimeRef = useRef<number | null>(null);
  const isSleepStoppingRef = useRef<boolean>(false);
  const bookmarkIntervalRef = useRef<any>(null);
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'quran_listening_manual_bookmarks_v1') setManualBookmarks(readManualListeningBookmarks());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('quran_listening_speed', String(playbackSpeed));
      localStorage.setItem('quran_listening_black_screen', isBlackScreenMode ? '1' : '0');
    } catch {}
  }, [playbackSpeed, isBlackScreenMode]);

  // Kaldığı Yeri Anında Kaydetme Yardımcı Fonksiyonu
  const persistBookmark = useCallback((surahId: number, ayahIndex: number, currentTime: number, reciter?: string) => {
    savedCurrentTimeRef.current = currentTime;
    try {
      localStorage.setItem(
        'quran_listening_bookmark',
        JSON.stringify({
          surahId,
          ayahIndex,
          currentTime: Math.max(0, Number(currentTime.toFixed(2))),
          reciter: reciter || selectedReciterRef.current || 'ar.mahermuaiqly',
          savedAt: new Date().toISOString()
        })
      );
    } catch (e) {
      logListen('BOOKMARK_SAVE_FAILED', 'warning', { surah: surahId, ayah: ayahIndex + 1, details: classifyListeningError(e) });
    }
  }, []);

  useEffect(() => {
    if (targetReciterId && RECITERS.some((r) => r.id === targetReciterId)) {
      setSelectedReciter(targetReciterId);
      selectedReciterRef.current = targetReciterId;
      try {
        localStorage.setItem('quran_listening_reciter_mahir_default', targetReciterId);
      } catch {}
    }
    if (targetSurahId) {
      setCurrentSurahId(targetSurahId);
      currentSurahIdRef.current = targetSurahId;
      setCurrentAyahIndex(0);
      currentAyahIndexRef.current = 0;
      savedCurrentTimeRef.current = 0;
      persistBookmark(targetSurahId, 0, 0, targetReciterId);
    }
  }, [targetSurahId, targetReciterId, targetTimestamp, persistBookmark]);

  // Dijital Saat Güncelleyici
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDateStr(
        now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Slayt Gösterisi Otomatik Döngüsü
  useEffect(() => {
    if (!isSlideshowRunning || isBlackScreenMode) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % AMBIENCE_SLIDES.length);
    }, 14000);
    return () => clearInterval(interval);
  }, [isSlideshowRunning, isBlackScreenMode]);

  // Desktop uses an app-level volume slider; touch devices use system keys.
  useEffect(() => {
    if (audioRef.current) {
      applyOutputVolume(audioRef.current);
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [volume, isMuted, playbackSpeed, usesDeviceVolume, applyOutputVolume]);

  const changeSpeed = (spd: number) => {
    setPlaybackSpeed(spd);
    playbackSpeedRef.current = spd;
    if (audioRef.current) {
      audioRef.current.playbackRate = spd;
    }
  };

  // Uyku Zamanlayıcısı Sonlandırma (Kesin ve Güvenilir Durdurma)
  const triggerSleepStop = useCallback(() => {
    if (isSleepStoppingRef.current) return;
    isSleepStoppingRef.current = true;
    sleepTargetEndTimeRef.current = null;

    if (sleepTimerIntervalRef.current) {
      clearInterval(sleepTimerIntervalRef.current);
      sleepTimerIntervalRef.current = null;
    }

    setSleepTimerMinutes(null);
    setSleepSecondsLeft(null);

    const player = audioRef.current;
    playRequestRef.current++;
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    retryAttemptsRef.current = 0;
    setIsRecovering(false);
    if (!player) {
      isSleepStoppingRef.current = false;
      return;
    }

    // Kaldığı saniyeyi güvenle kaydet
    const stopTime = player.currentTime > 0 ? player.currentTime : (savedCurrentTimeRef.current || 0);
    persistBookmark(currentSurahIdRef.current, currentAyahIndexRef.current, stopTime);

    logListen('SLEEP_STOP', 'info', diagnosticContext());
    // Oynatma niyetlerini ve otomatik geçişi kesin olarak durdur
    shouldAutoPlayNextSurahRef.current = false;
    setIsPlaying(false);
    isPlayingRef.current = false;

    // Timer must silence an outgoing player waiting for a seamless handoff too.
    cancelHandoff();
    pauseAllPlayers();
    applyOutputVolume(player);
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    isSleepStoppingRef.current = false;
  }, [persistBookmark, applyOutputVolume, cancelHandoff, pauseAllPlayers]);

  // Tek bir bozuk ses dosyası veya kısa internet kesintisi oynatmayı kalıcı olarak durdurmaz.
  const cancelReconnect = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    retryAttemptsRef.current = 0;
    setIsRecovering(false);
  }, []);

  // Shared pause path for explicit UI, lock-screen and headset commands.
  // Incrementing the request token invalidates pending loads and retry callbacks.
  const pausePlayback = useCallback(() => {
    const player = audioRef.current;
    const position = player && Number.isFinite(player.currentTime) && player.currentTime > 0
      ? player.currentTime : savedCurrentTimeRef.current || 0;
    logListen('USER_PAUSE', 'info', diagnosticContext());
    ++playRequestRef.current;
    isPlayingRef.current = false;
    shouldAutoPlayNextSurahRef.current = false;
    setIsPlaying(false);
    cancelReconnect();
    cancelHandoff();
    pauseAllPlayers();
    persistBookmark(currentSurahIdRef.current, currentAyahIndexRef.current, position);
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
  }, [cancelReconnect, cancelHandoff, pauseAllPlayers, persistBookmark]);

  const updateMediaPosition = useCallback((player: HTMLAudioElement) => {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
    const duration = player.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    try {
      navigator.mediaSession.setPositionState({
        duration,
        position: Math.max(0, Math.min(duration, player.currentTime || 0)),
        playbackRate: player.playbackRate || 1
      });
    } catch {
      // Position state is optional on older browser versions.
    }
  }, []);

  const scheduleReconnect = useCallback((requestId: number) => {
    if (!isPlayingRef.current || isSleepStoppingRef.current || requestId !== playRequestRef.current) return;
    if (sleepTargetEndTimeRef.current !== null && Date.now() >= sleepTargetEndTimeRef.current) {
      triggerSleepStop();
      return;
    }
    if (reconnectTimerRef.current !== null) return;
    const attempt = ++retryAttemptsRef.current;
    logListen('RECONNECT_SCHEDULED', 'warning', { ...diagnosticContext(), details: { retry: attempt, online: navigator.onLine } });
    const delay = Math.min(30000, attempt <= 1 ? 800 : 1000 * Math.pow(2, Math.min(attempt - 1, 5)));
    setIsRecovering(true);
    if (attempt >= 2) setAudioError('Ses bağlantısı kesildi. Otomatik yeniden bağlanılıyor…');
    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      if (!isPlayingRef.current || requestId !== playRequestRef.current || isSleepStoppingRef.current) return;
      if (sleepTargetEndTimeRef.current !== null && Date.now() >= sleepTargetEndTimeRef.current) {
        triggerSleepStop();
        return;
      }
      logListen('RECONNECT_ATTEMPT', 'warning', { ...diagnosticContext(), details: { retry: attempt } });
      reconnectPlaybackRef.current();
    }, delay);
  }, [triggerSleepStop]);

  // Ayeti Çal (Merkezi Çalma Fonksiyonu)
  const playAyahAt = useCallback((idx: number, startTime = 0, ayahList?: Ayah[]) => {
    cancelHandoff();
    if (isSleepStoppingRef.current) return;
    if (sleepTargetEndTimeRef.current && Date.now() >= sleepTargetEndTimeRef.current) {
      triggerSleepStop();
      return;
    }

    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    const list = ayahList || ayahsRef.current;
    if (!list || list.length === 0) {
      // Veri henüz yükleniyorsa oynatma niyetini işaretle; yüklendiği an otomatik başlar
      setIsPlaying(true);
      isPlayingRef.current = true;
      return;
    }

    // Eğer son ayet bittiyse bir sonraki sureye geç (Örn: Fatiha 7. ayet -> Bakara 1. ayet)
    // 114. sure (Nâs) bitince başa (1. Fatiha) dönüp kesintisiz devam eder
    if (idx >= list.length) {
      logListen('SURAH_ADVANCE', 'info', diagnosticContext());
      const nextId = nextSurahInListeningLoop(currentSurahIdRef.current);
      ++playRequestRef.current;
      currentSurahIdRef.current = nextId;
      currentAyahIndexRef.current = 0;
      shouldAutoPlayNextSurahRef.current = true;
      setCurrentAyahIndex(0);
      persistBookmark(nextId, 0, 0);
      setCurrentSurahId(nextId);
      return;
    }

    if (cycleRef.current.enabled && startTime <= 0.15 && cycleRef.current.surah === currentSurahIdRef.current && cycleRef.current.ayah === idx) {
      startedCycleAyahRef.current = `${currentSurahIdRef.current}:${idx}`;
    }
    setCurrentAyahIndex(idx);
    currentAyahIndexRef.current = idx;
    persistBookmark(currentSurahIdRef.current, idx, startTime);
    logListen('AYAH_START', 'info', { surah: currentSurahIdRef.current, ayah: idx + 1 });

    const ayah = list[idx];
    if (!ayah || !ayah.audio) {
      logListen('AUDIO_MISSING', 'error', { surah: currentSurahIdRef.current, ayah: idx + 1 });
      console.warn(`Ayet ${idx + 1} ses kaynağı bulunamadı.`);
      stopPlayback(true);
      return;
    }

    // Ön yüklemesi tamamlanan ses öğesini yeniden src yüklemesi yapmadan kullan.
    const previousPlayer = audioRef.current;
    const ready = [preloadNextAudioRef.current, preloadAfterNextAudioRef.current].find(
      (candidate) => candidate.src === ayah.audio && candidate.readyState >= 2
    );
    const player = ready || previousPlayer;
    // Never stop (or replace the source of) the outgoing playing element
    // before the incoming preloaded element has actually begun playback.
    // Otherwise Chrome for Android briefly releases audio focus, removing
    // and re-creating its notification at every single ayah.
    const outgoingPlayer = ready && ready !== previousPlayer ? previousPlayer : null;
    if (outgoingPlayer) {
      previousPlayer.ontimeupdate = null;
      previousPlayer.onended = null;
      previousPlayer.onloadedmetadata = null;
      previousPlayer.onerror = null;
      audioRef.current = ready;
      if (ready === preloadNextAudioRef.current) preloadNextAudioRef.current = previousPlayer;
      else preloadAfterNextAudioRef.current = previousPlayer;
      setAudioEpoch((n) => n + 1);
    } else if (player.src !== ayah.audio) {
      // Switching a live src can also dispatch a native pause event.
      pauseInternally(player);
      player.src = ayah.audio;
    }

    // Reusing the outgoing element as a preload slot is safe only AFTER
    // the incoming element starts; changing its src early also stops it.
    const prepareUpcomingAudio = () => {
    // Kesintisiz (Gapless) geçiş için sıradaki 1. ve 2. ayetin ses dosyalarını arka planda önceden belleğe yükle (Preload)
    const nextAyah = list[idx + 1];
    if (nextAyah?.audio && preloadNextAudioRef.current.src !== nextAyah.audio) {
      preloadNextAudioRef.current.preload = 'auto';
      preloadNextAudioRef.current.src = nextAyah.audio;
      preloadNextAudioRef.current.load();
    }
    const afterNextAyah = list[idx + 2];
    if (afterNextAyah?.audio && preloadAfterNextAudioRef.current.src !== afterNextAyah.audio) {
      preloadAfterNextAudioRef.current.preload = 'auto';
      preloadAfterNextAudioRef.current.src = afterNextAyah.audio;
      preloadAfterNextAudioRef.current.load();
    }
    // Sure sonuna yaklaşıldığında (son 2 ayet) bir sonraki surenin verisini ve ilk ayet sesini şimdiden önbelleğe hazırla
    if (idx >= list.length - 2) {
      const upcomingSurahId = nextSurahInListeningLoop(currentSurahIdRef.current);
      fetchSurahData(upcomingSurahId, selectedReciterRef.current)
        .then((nextSurahRes) => {
          const firstNextSurahAudio = nextSurahRes.ayahs?.[0]?.audio;
          if (firstNextSurahAudio && !nextAyah?.audio) {
            preloadNextAudioRef.current.preload = 'auto';
            preloadNextAudioRef.current.src = firstNextSurahAudio;
            preloadNextAudioRef.current.load();
          }
        })
        .catch(() => {});
    }
    };
    if (!outgoingPlayer) prepareUpcomingAudio();

    const requestId = ++playRequestRef.current;
    reconnectPlaybackRef.current = () => {
      if (!isPlayingRef.current || requestId !== playRequestRef.current) return;
      const position = Number.isFinite(player.currentTime) && player.currentTime > 0
        ? player.currentTime : savedCurrentTimeRef.current;
      // Yükleme başarısız olsa bile aynı ayette kaldığı yerden yeniden dene.
      pauseInternally(player);
      player.removeAttribute('src');
      player.load();
      playAyahAt(idx, Math.max(0, position || 0), list);
    };
    lastAudioProgressRef.current = { at: Date.now(), seconds: Math.max(0, startTime) };
    setAudioError(null);
    player.preload = 'auto';
    applyOutputVolume(player);
    player.playbackRate = playbackSpeedRef.current;

    let lastSavedSecond = -1;
    let hasAdvancedToNext = false;

    // The browser emits timeupdate only a few times per second; arrange a
    // short final-frame check while the next ayah is already buffered.
    // This allows the incoming stream to start before the outgoing stream
    // naturally ends, without skipping meaningful Quran audio.
    const scheduleNearEndHandoff = () => {
      if (requestId !== playRequestRef.current || !isPlayingRef.current ||
          player.paused || player.ended || handoffTimerRef.current !== null) return;
      const duration = player.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;
      const remaining = duration - player.currentTime;
      if (remaining <= 0 || remaining > 1.5) return;
      // Do not overlap into an ayah beyond the configured B boundary.
      const nextAudio = abLoopRef.current.active && isABEndAyah(abLoopRef.current,currentSurahIdRef.current,idx) ? undefined : list[idx + 1]?.audio;
      // No early switch if the next audio has not been buffered.
      if (!nextAudio || ![preloadNextAudioRef.current, preloadAfterNextAudioRef.current]
        .some((candidate) => candidate.src === nextAudio && candidate.readyState >= 2)) return;
      const targetMargin = 0.045;
      if (remaining <= targetMargin + 0.02) {
        advanceToNextAyah();
        return;
      }
      handoffTimerRef.current = setTimeout(() => {
        handoffTimerRef.current = null;
        if (requestId !== playRequestRef.current || !isPlayingRef.current || player.paused || player.ended) return;
        scheduleNearEndHandoff();
      }, Math.max(12, ((remaining - targetMargin) / (player.playbackRate || 1)) * 1000));
    };

    const advanceToNextAyah = () => {
      if (hasAdvancedToNext || requestId !== playRequestRef.current || isSleepStoppingRef.current || !isPlayingRef.current) return;
      if (sleepTargetEndTimeRef.current && Date.now() >= sleepTargetEndTimeRef.current) {
        triggerSleepStop();
        return;
      }
      // Only automatically finished ayahs count. Skip/manual navigation never counts.
      if (abLoopRef.current.active && isABEndAyah(abLoopRef.current,currentSurahIdRef.current,idx)) {
        const next=completeABIteration(abLoopRef.current);
        updateAB(next);
        hasAdvancedToNext=true;
        if (!next.active) {pausePlayback();return;}
        jumpToABStart(next.start);
        return;
      }
      recordCompletedAyah(currentSurahIdRef.current, idx, list.length, player);
      hasAdvancedToNext = true;
      logListen('AYAH_ADVANCE', 'info', { surah: currentSurahIdRef.current, ayah: idx + 1 });
      playAyahAt(idx + 1, 0, list);
    };

    player.ontimeupdate = () => {
      if (requestId !== playRequestRef.current) return;
      // Uyku Zamanlayıcısı Kontrolü (Arka planda ve ekran kilitliyken dahi ses frame'inde tetiklenir)
      if (sleepTargetEndTimeRef.current && Date.now() >= sleepTargetEndTimeRef.current) {
        triggerSleepStop();
        return;
      }

      if (isPlayingRef.current && !player.paused) {
        const curTime = player.currentTime || 0;
        if (curTime > lastAudioProgressRef.current.seconds + 0.06) {
          lastAudioProgressRef.current = { at: Date.now(), seconds: curTime };
          if (retryAttemptsRef.current > 0) {
            logListen('RECONNECT_RECOVERED', 'info', { surah: currentSurahIdRef.current, ayah: idx + 1 });
            retryAttemptsRef.current = 0;
            setIsRecovering(false);
            setAudioError(null);
          }
        }
        const curSec = Math.floor(curTime);
        savedCurrentTimeRef.current = curTime;
        if (curSec !== lastSavedSecond) updateMediaPosition(player);
        if (curSec !== lastSavedSecond) {
          lastSavedSecond = curSec;
          persistBookmark(currentSurahIdRef.current, currentAyahIndexRef.current, curTime);
        }

        if(abLoopRef.current.active && isABEndAyah(abLoopRef.current,currentSurahIdRef.current,idx) && abLoopRef.current.end.seconds>0 && curTime>=abLoopRef.current.end.seconds){advanceToNextAyah();return;}
        // Prefer a small, buffered overlap to prevent Android media focus
        // from dropping between ayahs; always retain onended as a fallback.
        scheduleNearEndHandoff();
      }
    };

    let alreadyStarted = false;
    const startPlayer = () => {
      if (alreadyStarted || requestId !== playRequestRef.current || isSleepStoppingRef.current) return;
      alreadyStarted = true;
      if (sleepTargetEndTimeRef.current && Date.now() >= sleepTargetEndTimeRef.current) {
        triggerSleepStop();
        return;
      }
      player.playbackRate = playbackSpeedRef.current;
      if (startTime > 0 && (!player.duration || startTime < player.duration)) {
        try { player.currentTime = startTime; } catch {}
      } else if (startTime === 0 && player.currentTime > 0) {
        try { player.currentTime = 0; } catch {}
      }
      player.play().then(() => {
        if (requestId !== playRequestRef.current || !isPlayingRef.current) {
          player.pause();
          return;
        }
        // Keep Android's media notification alive: incoming audio is already
        // playing before the outgoing audio stops and enters the preload pool.
        if (outgoingPlayer) {
          pauseInternally(outgoingPlayer);
          prepareUpcomingAudio();
        }
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
      }).catch((err) => {
        if (requestId !== playRequestRef.current || !isPlayingRef.current) return;
        logListen('AUDIO_PLAY_REJECTED', 'error', { ...diagnosticContext(), details: classifyListeningError(err) });
        console.warn('Ses geçici olarak çalınamadı:', err);
        if (err?.name === 'NotAllowedError') {
          setAudioError('Tarayıcı sesi engelledi. Devam etmek için Oynat’a dokunun.');
          setIsPlaying(false);
          isPlayingRef.current = false;
          cancelReconnect();
        } else {
          scheduleReconnect(requestId);
        }
      });
    };
    player.onloadedmetadata = () => {
      updateMediaPosition(player);
      startPlayer();
    };
    if (player.readyState >= 1) {
      updateMediaPosition(player);
      startPlayer();
    }

    player.onended = () => {
      logListen('AYAH_ENDED', 'info', { surah: currentSurahIdRef.current, ayah: idx + 1 });
      advanceToNextAyah();
    };
    player.onplaying = () => {
      if (requestId === playRequestRef.current) {
        lastAudioProgressRef.current = { at: Date.now(), seconds: player.currentTime || 0 };
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
      }
    };

    player.onerror = (e) => {
      if (requestId !== playRequestRef.current) return;
      logListen('AUDIO_RESOURCE_ERROR', 'error', { surah: currentSurahIdRef.current, ayah: idx + 1, details: { mediaCode: player.error?.code ?? 0, readyState: player.readyState, networkState: player.networkState } });
      console.warn(`Ayet ${idx + 1} yüklenemedi, otomatik tekrar deneniyor:`, e);
      scheduleReconnect(requestId);
    };

    setIsPlaying(true);
    isPlayingRef.current = true;
  }, [persistBookmark, triggerSleepStop, cancelReconnect, scheduleReconnect, pauseInternally, updateMediaPosition, applyOutputVolume, cancelHandoff]);

  // Mobile lock-screen / notification / headset playback controls.
  // The OS designs the media card; the app supplies metadata and commands.
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const session = navigator.mediaSession;
    const handlers: Partial<Record<MediaSessionAction, MediaSessionActionHandler>> = {
      play: () => {
        if (isPlayingRef.current) return;
        const player = audioRef.current;
        const position = player?.currentTime > 0 ? player.currentTime : savedCurrentTimeRef.current || 0;
        playAyahAt(currentAyahIndexRef.current, position);
      },
      pause: () => pausePlayback(),
      nexttrack: () => {
        savedCurrentTimeRef.current = 0;
        playAyahAt(currentAyahIndexRef.current + 1, 0);
      },
      previoustrack: () => previousNavigationRef.current(),
      seekto: (details) => {
        const player = audioRef.current;
        if (!player?.src || !Number.isFinite(player.duration) || player.duration <= 0) return;
        const position = Math.min(player.duration, Math.max(0, details.seekTime ?? player.currentTime));
        player.currentTime = position;
        persistBookmark(currentSurahIdRef.current, currentAyahIndexRef.current, position);
        updateMediaPosition(player);
      }
    };
    const installed: MediaSessionAction[] = [];
    for (const [action, handler] of Object.entries(handlers) as [MediaSessionAction, MediaSessionActionHandler][]) {
      try {
        session.setActionHandler(action, handler);
        installed.push(action);
      } catch {
        // Each OS/browser supports a different subset of media actions.
      }
    }
    return () => {
      for (const action of installed) {
        try { session.setActionHandler(action, null); } catch {}
      }
    };
  }, [playAyahAt, pausePlayback, persistBookmark, updateMediaPosition]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const session = navigator.mediaSession;
    session.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  // Keep the Android notification's identity stable throughout a surah.
  // Replacing MediaMetadata for each ayah can cause some Android versions
  // to redraw the entire media card. Ayah/second remain visible in-app.
  useEffect(() => {
    if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
    const session = navigator.mediaSession;
    const surah = SURAHS.find((item) => item.id === currentSurahId);
    const reciter = RECITERS.find((item) => item.id === selectedReciter);
    try {
      session.metadata = new MediaMetadata({
        title: `${surah?.name || 'Kur’an-ı Kerim'} Suresi · Kesintisiz Dinleme`,
        artist: reciter?.name || 'Kur’an-ı Kerim',
        album: 'Hayat Rehberi · Kesintisiz Dinleme',
        artwork: [{
          src: new URL(`${import.meta.env.BASE_URL}icon-512.png`, window.location.href).href,
          sizes: '512x512',
          type: 'image/png'
        }]
      });
    } catch {
      // Audio must work even when metadata is unsupported.
    }
  }, [currentSurahId, selectedReciter]);

  // Mobil arka planda ve masaüstünde takılı kalan medya akışını takip et.
  useEffect(() => {
    const checkPlayback = () => {
      if (!isPlayingRef.current || isSleepStoppingRef.current) return;
      if (sleepTargetEndTimeRef.current !== null && Date.now() >= sleepTargetEndTimeRef.current) {
        triggerSleepStop();
        return;
      }
      const player = audioRef.current;
      if (!player || !player.src || reconnectTimerRef.current !== null) return;
      const pos = player.currentTime || 0;
      if (pos > lastAudioProgressRef.current.seconds + 0.06) {
        lastAudioProgressRef.current = { at: Date.now(), seconds: pos };
      } else if (Date.now() - lastAudioProgressRef.current.at > 12000) {
        // Bilerek duraklatılmışsa oynatma niyeti false olacağından buraya girmez.
        // Donan ses kaynağı aynı ayet/saniyeden tekrar yüklenir.
        logListen('AUDIO_STALLED', 'warning', { ...diagnosticContext(), details: { seconds: pos, online: navigator.onLine } });
        scheduleReconnect(playRequestRef.current);
      }
    };
    const watchdog = setInterval(checkPlayback, 3000);
    const onWake = () => checkPlayback();
    window.addEventListener('pageshow', onWake);
    document.addEventListener('visibilitychange', onWake);
    return () => {
      clearInterval(watchdog);
      window.removeEventListener('pageshow', onWake);
      document.removeEventListener('visibilitychange', onWake);
    };
  }, [scheduleReconnect, triggerSleepStop]);

  // Sure Verisini Yükle
  useEffect(() => {
    let isCancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetchSurahData(currentSurahId, selectedReciter);
        if (!isCancelled) {
          surahRetryCountRef.current = 0;
          if (surahRetryRef.current !== null) {
            clearTimeout(surahRetryRef.current);
            surahRetryRef.current = null;
          }
          setIsRecovering(false);
          setAudioError(null);
          logListen('SURAH_LOADED', 'info', { surah: currentSurahId });
          setAyahs(res.ayahs);
          setTranslations(res.translations);
          ayahsRef.current = res.ayahs;

          // Eğer önceki surenin bitişiyle otomatik geçiş tetiklendiyse yeni surenin ilk ayetini HEMEN başlat!
          if (shouldAutoPlayNextSurahRef.current) {
            shouldAutoPlayNextSurahRef.current = false;
            playAyahAt(currentAyahIndexRef.current, savedCurrentTimeRef.current || 0, res.ayahs);
          } else if (isPlayingRef.current) {
            // Hafız değiştirildiğinde veya yükleme sırasında Oynat'a basıldığında kaldığı saniyeden devam et
            playAyahAt(currentAyahIndexRef.current, savedCurrentTimeRef.current || 0, res.ayahs);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          logListen('SURAH_LOAD_FAILED', 'error', { surah: currentSurahId, details: { ...classifyListeningError(err), online: navigator.onLine } });
          console.error('Dinleme modu veri hatası:', err);
          // Do not discard the automatic-next-surah intent while offline.
          setAudioError('Sûre yüklenemedi. Bağlantı düzelince otomatik yeniden denenecek.');
          if (isPlayingRef.current) {
            setIsRecovering(true);
            const retryNumber = ++surahRetryCountRef.current;
            const retryDelay = Math.min(30000, 2000 * Math.pow(2, Math.min(retryNumber - 1, 4)));
            if (surahRetryRef.current !== null) clearTimeout(surahRetryRef.current);
            surahRetryRef.current = setTimeout(() => {
              surahRetryRef.current = null;
              if (!isCancelled && isPlayingRef.current && !isSleepStoppingRef.current) {
                logListen('SURAH_LOAD_RETRY', 'warning', diagnosticContext());
                setSurahFetchAttempt((n) => n + 1);
              }
            }, retryDelay);
          }
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    load();
    return () => {
      isCancelled = true;
      if (surahRetryRef.current !== null) {
        clearTimeout(surahRetryRef.current);
        surahRetryRef.current = null;
      }
    };
  }, [currentSurahId, selectedReciter, surahFetchAttempt, playAyahAt]);

  // Sayfa Kapatıldığında, Gizlendiğinde veya Sekme Değiştirildiğinde Kaldığı Yeri Anında Kaydet
  useEffect(() => {
    const saveCurrentProgress = () => {
      const currentAudioTime =
        audioRef.current && audioRef.current.currentTime > 0
          ? audioRef.current.currentTime
          : savedCurrentTimeRef.current || 0;
      persistBookmark(currentSurahIdRef.current, currentAyahIndexRef.current, currentAudioTime);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveCurrentProgress();
      } else {
        // Sekmeye geri dönüldüğünde veya ekran açıldığında uyku zamanlayıcısını anında kontrol et
        if (sleepTargetEndTimeRef.current && Date.now() >= sleepTargetEndTimeRef.current) {
          triggerSleepStop();
        }
      }
    };

    const onOnline = () => {
      if (isPlayingRef.current && reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
        reconnectPlaybackRef.current();
      }
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('hayat-rehberi:prepare-update', saveCurrentProgress);
    window.addEventListener('beforeunload', saveCurrentProgress);
    const onPageHide = () => {
      saveCurrentProgress();
      // A document leaving the page must not leave an orphaned player behind.
      pausePlayback();
    };
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    bookmarkIntervalRef.current = setInterval(() => {
      if (audioRef.current && isPlayingRef.current) {
        saveCurrentProgress();
      }
    }, 2000);

    return () => {
      saveCurrentProgress();
      window.removeEventListener('online', onOnline);
      window.removeEventListener('hayat-rehberi:prepare-update', saveCurrentProgress);
      window.removeEventListener('beforeunload', saveCurrentProgress);
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(bookmarkIntervalRef.current);
    };
  }, [persistBookmark, triggerSleepStop, pausePlayback]);

  // Release every playing/preloaded audio node when the listening route unmounts.
  // Visibility changes alone do not unmount it, so screen lock keeps playback.
  useEffect(() => {
    return () => {
      const player = audioRef.current;
      const position = Number.isFinite(player.currentTime) && player.currentTime > 0
        ? player.currentTime : savedCurrentTimeRef.current || 0;
      persistBookmark(currentSurahIdRef.current, currentAyahIndexRef.current, position);
      logListen('PLAYER_UNMOUNT', 'info', diagnosticContext());
      ++playRequestRef.current;
      isPlayingRef.current = false;
      shouldAutoPlayNextSurahRef.current = false;
      cancelReconnect();
      cancelHandoff();
      const players = new Set([audioRef.current, preloadNextAudioRef.current, preloadAfterNextAudioRef.current]);
      players.forEach((audio) => {
        audio.onended = null;
        audio.ontimeupdate = null;
        audio.onloadedmetadata = null;
        audio.onplaying = null;
        audio.onerror = null;
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      });
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
        navigator.mediaSession.metadata = null;
      }
    };
  }, [cancelReconnect, cancelHandoff, persistBookmark]);

  // Uyku Zamanlayıcısı Sayacı (Gerçek zamanlı Date.now() duvar saati kontrolü)
  useEffect(() => {
    if (sleepTimerMinutes === null || sleepTargetEndTimeRef.current === null) {
      if (sleepTimerIntervalRef.current) {
        clearInterval(sleepTimerIntervalRef.current);
        sleepTimerIntervalRef.current = null;
      }
      return;
    }

    const checkAndTick = () => {
      if (!sleepTargetEndTimeRef.current) return;
      const msLeft = sleepTargetEndTimeRef.current - Date.now();
      const secLeft = Math.ceil(msLeft / 1000);

      if (secLeft <= 0) {
        triggerSleepStop();
      } else {
        setSleepSecondsLeft(secLeft);
      }
    };

    // İlk kontrolü anında yap
    checkAndTick();

    // 500ms aralıklarla gerçek duvar saatine göre kontrol et
    sleepTimerIntervalRef.current = setInterval(checkAndTick, 500);

    return () => {
      if (sleepTimerIntervalRef.current) {
        clearInterval(sleepTimerIntervalRef.current);
        sleepTimerIntervalRef.current = null;
      }
    };
  }, [sleepTimerMinutes, triggerSleepStop]);

  // Surelerin 1. ayetinde yer alan gömülü Besmele'yi ayıkla (Fatiha hariç, çünkü Fatiha'da 1. ayet bizzat Besmele'dir)
  const cleanAyahText = (text: string | undefined, surahId: number, ayahIdx: number): string => {
    if (!text) return '';
    if (surahId !== 1 && ayahIdx === 0) {
      return text.replace(/^بِسْمِ\s+ٱ?للَّهِ\s+ٱ?لرَّحْمَٰنِ\s+ٱ?لرَّحِيمِ\s*/, '').trim();
    }
    return text;
  };

  const togglePlayPause = () => {
    if (isPlayingRef.current) {
      pausePlayback();
    } else {
      logListen('USER_PLAY', 'info', diagnosticContext());
      const curAyah = ayahs[currentAyahIndex];
      // Duraklatmanın geçersiz kıldığı eski handler yerine güncel handler kurulmalı.
      const resumeTime = audioRef.current.currentTime > 0
        ? audioRef.current.currentTime
        : (savedCurrentTimeRef.current > 0 ? savedCurrentTimeRef.current : 0);
      playAyahAt(currentAyahIndex, resumeTime);
    }
  };

  const stopPlayback = (preserveBookmarkTime = false) => {
    if (preserveBookmarkTime && audioRef.current && audioRef.current.currentTime > 0) {
      persistBookmark(currentSurahIdRef.current, currentAyahIndexRef.current, audioRef.current.currentTime);
    }
    ++playRequestRef.current;
    cancelReconnect();
    cancelHandoff();
    setIsPlaying(false);
    isPlayingRef.current = false;
    shouldAutoPlayNextSurahRef.current = false;
    if (audioRef.current) {
      audioRef.current.ontimeupdate = null;
      audioRef.current.onended = null;
      audioRef.current.onloadedmetadata = null;
      pauseAllPlayers();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
  };

  const handleNextAyah = () => {
    cancelAB();
    interruptCycle();
    savedCurrentTimeRef.current = 0;
    playAyahAt(currentAyahIndex + 1, 0);
  };

  const handlePrevAyah = () => {
    const previous = previousAyahInListeningSequence(currentSurahIdRef.current, currentAyahIndexRef.current);
    if (!previous) return;
    cancelAB();
    interruptCycle();

    if (previous.surahId === currentSurahIdRef.current) {
      savedCurrentTimeRef.current = 0;
      playAyahAt(previous.ayahIndex, 0);
      return;
    }

    // At the first ayah, go to the previous surah's LAST ayah, not its first.
    // Stop the old player before loading the other surah so stale callbacks cannot advance it.
    stopPlayback(false);
    currentSurahIdRef.current = previous.surahId;
    currentAyahIndexRef.current = previous.ayahIndex;
    setCurrentAyahIndex(previous.ayahIndex);
    persistBookmark(previous.surahId, previous.ayahIndex, 0);
    setAyahs([]);
    ayahsRef.current = [];
    setTranslations([]);
    shouldAutoPlayNextSurahRef.current = true;
    setCurrentSurahId(previous.surahId);
  };
  // The OS/media notification uses the same backward navigation as the visible right arrow.
  previousNavigationRef.current = handlePrevAyah;

  // Uyku zamanlayıcısı menüsü açıkken dışarıya dokunmak veya ESC ile kapat.
  useEffect(() => {
    if (!sleepMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (sleepMenuRef.current && !sleepMenuRef.current.contains(event.target as Node)) {
        setSleepMenuOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSleepMenuOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onEscape);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onEscape);
    };
  }, [sleepMenuOpen]);

  // Uyku Zamanlayıcısı Ayarla (Kesin Duvar Saati Bazlı)
  const handleSetTimer = (minutes: number) => {
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 720) return;
    const targetTime = Date.now() + minutes * 60 * 1000;
    sleepTargetEndTimeRef.current = targetTime;
    isSleepStoppingRef.current = false;
    setSleepTimerMinutes(minutes);
    setSleepSecondsLeft(minutes * 60);
  };

  const handleCancelTimer = () => {
    sleepTargetEndTimeRef.current = null;
    isSleepStoppingRef.current = false;
    setSleepTimerMinutes(null);
    setSleepSecondsLeft(null);
    if (sleepTimerIntervalRef.current) {
      clearInterval(sleepTimerIntervalRef.current);
      sleepTimerIntervalRef.current = null;
    }
  };

  // Manuel yer imleri otomatik kaldığın yer kaydından bağımsızdır.
  const openManualBookmarks = () => {
    const player = audioRef.current;
    const second = player && player.src && !player.paused &&
      Number.isFinite(player.currentTime) && player.currentTime >= 0
      ? player.currentTime : savedCurrentTimeRef.current || 0;
    setBookmarkCandidate({
      surahId: currentSurahIdRef.current, ayahIndex: currentAyahIndexRef.current,
      currentTime: Math.max(0, second), reciter: selectedReciterRef.current,
    });
    setManualBookmarks(readManualListeningBookmarks());
    setBookmarksOpen(true);
  };
  const addManualBookmark = (name: string, note: string): boolean => {
    if (!bookmarkCandidate) return false;
    const next = createManualListeningBookmark(manualBookmarks, bookmarkCandidate, name, note);
    if (!next || !writeManualListeningBookmarks(next)) return false;
    setManualBookmarks(next);
    return true;
  };
  const updateManualBookmark = (id: string, name: string, note: string, replacePosition: boolean): boolean => {
    if (replacePosition && !bookmarkCandidate) return false;
    const next = editManualListeningBookmark(manualBookmarks, id, name, note,
      replacePosition ? bookmarkCandidate! : undefined);
    if (!next || !writeManualListeningBookmarks(next)) return false;
    setManualBookmarks(next);
    return true;
  };
  const deleteManualBookmark = (id: string): boolean => {
    if (!manualBookmarks.some(b => b.id === id)) return false;
    const next = manualBookmarks.filter(b => b.id !== id);
    if (!writeManualListeningBookmarks(next)) return false;
    setManualBookmarks(next);
    return true;
  };
  const jumpToABStart = (point:ABPoint) => {
    // Use a shared playback route; allow the data-loading effect to start audio.
    stopPlayback(false);
    savedCurrentTimeRef.current = point.seconds;
    currentAyahIndexRef.current = point.ayahIndex;
    setCurrentAyahIndex(point.ayahIndex);
    persistBookmark(point.surahId,point.ayahIndex,point.seconds);
    const mustLoad = currentSurahIdRef.current!==point.surahId || ayahsRef.current.length===0;
    if(mustLoad){
      shouldAutoPlayNextSurahRef.current=true;
      currentSurahIdRef.current=point.surahId;
      setAyahs([]);ayahsRef.current=[];
      if(currentSurahId!==point.surahId)setCurrentSurahId(point.surahId);
      else {setIsPlaying(true);isPlayingRef.current=true;}
    }else playAyahAt(point.ayahIndex,point.seconds);
  };
  const startABLoop = (a:ManualListeningBookmark,b:ManualListeningBookmark,repeatLimit:number|null):string|null=>{
    const first:ABPoint={surahId:a.surahId,ayahIndex:a.ayahIndex,seconds:a.currentTime};
    const second:ABPoint={surahId:b.surahId,ayahIndex:b.ayahIndex,seconds:b.currentTime};
    // Point selection order does not determine reading order.
    const {start,end}=orderABPoints(first,second);
    const error=validateABRange(start,end);
    if(error)return error;
    if(repeatLimit!==null&&(!Number.isInteger(repeatLimit)||repeatLimit<1||repeatLimit>10000))return 'Tekrar sayısı geçersiz.';
    interruptCycle();
    const next:ABLoopState={start,end,repeatLimit,active:true,completed:0};
    updateAB(next);jumpToABStart(start);
    return null;
  };
  const stopABLoop = ()=>{cancelAB();pausePlayback();};
  const resetABLoop = ()=>updateAB({...abLoopRef.current,completed:0});

  const listenFromManualBookmark = (bookmark: ManualListeningBookmark) => {
    cancelAB();
    interruptCycle();
    stopPlayback(false);
    const needsFetch = bookmark.surahId !== currentSurahIdRef.current ||
      bookmark.reciter !== selectedReciterRef.current || ayahsRef.current.length === 0;
    persistBookmark(bookmark.surahId, bookmark.ayahIndex, bookmark.currentTime, bookmark.reciter);
    currentSurahIdRef.current = bookmark.surahId;
    currentAyahIndexRef.current = bookmark.ayahIndex;
    selectedReciterRef.current = bookmark.reciter;
    setCurrentAyahIndex(bookmark.ayahIndex);
    setBookmarksOpen(false);
    if (needsFetch) {
      shouldAutoPlayNextSurahRef.current = true;
      if (bookmark.surahId !== currentSurahId) {
        setAyahs([]);
        ayahsRef.current = [];
        setCurrentSurahId(bookmark.surahId);
      }
      if (bookmark.reciter !== selectedReciter) {
        setSelectedReciter(bookmark.reciter);
      } else if (bookmark.surahId === currentSurahId && ayahsRef.current.length === 0) {
        setIsPlaying(true);
        isPlayingRef.current = true;
      }
    } else {
      playAyahAt(bookmark.ayahIndex, bookmark.currentTime);
    }
  };

  const handleSelectSurah = (surahId: number) => {
    cancelAB();
    interruptCycle();
    stopPlayback(false);
    setCurrentAyahIndex(0);
    currentAyahIndexRef.current = 0;
    currentSurahIdRef.current = surahId;
    savedCurrentTimeRef.current = 0;

    // Yer imini anında seçilen sureye güncelle
    persistBookmark(surahId, 0, 0);

    if (surahId === currentSurahId) {
      if (ayahs.length > 0) {
        playAyahAt(0, 0, ayahs);
      }
    } else {
      setAyahs([]);
      ayahsRef.current = [];
      shouldAutoPlayNextSurahRef.current = true;
      setCurrentSurahId(surahId);
    }
  };

  const currentSurahMeta = SURAHS.find((s) => s.id === currentSurahId);
  const currentAyah = ayahs[currentAyahIndex];
  const currentTranslation = translations[currentAyahIndex];
  const currentSlide = AMBIENCE_SLIDES[currentSlideIndex] || AMBIENCE_SLIDES[0];

  const cleanedCurrentAyahText = cleanAyahText(currentAyah?.text, currentSurahId, currentAyahIndex);

  // Ortak Kelime Takibi (Word-by-Word) State & Senkronizasyon Hook'u (Normal Mod & Gece Saati Modu)
  const {
    isWordTrackingEnabled,
    toggleWordTracking,
    words: trackedWords,
    activeWordIndex
  } = useSynchronizedWordTracking(
    audioRef,
    cleanedCurrentAyahText,
    isPlaying,
    currentSurahId,
    currentAyahIndex,
    audioEpoch
  );

  // Zaman Formatı
  const formatTimerSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      onClick={() => {
        if (isFocusMode) {
          setIsFocusMode(false);
        }
      }}
      title={isFocusMode ? 'Odak modundan çıkmak için ekrana dokunun veya tıklayın' : undefined}
      className={`${
        isFocusMode
          ? 'fixed inset-0 z-[100] h-screen w-screen flex items-center justify-center cursor-pointer select-none'
          : 'relative min-h-[calc(100vh-70px)] w-full'
      } overflow-x-hidden transition-all duration-700 font-sans ${
        isBlackScreenMode ? 'bg-black text-white' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {bookmarksOpen && (
        <ListeningBookmarksDialog
          bookmarks={manualBookmarks} position={bookmarkCandidate}
          onClose={() => setBookmarksOpen(false)} onAdd={addManualBookmark}
          onEdit={updateManualBookmark} onDelete={deleteManualBookmark}
          onListen={listenFromManualBookmark} abLoop={abLoop}
          onABStart={startABLoop} onABStop={stopABLoop} onABReset={resetABLoop}
        />
      )}

      {/* Odak Modu Aktifken Sağ Üst Köşede Minimalist Çıkış Butonu */}
      {isFocusMode && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[110] animate-in fade-in duration-300">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFocusMode(false);
            }}
            className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/25 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/15 backdrop-blur-md opacity-50 hover:opacity-100 transition-all cursor-pointer shadow-lg"
            title="Odak Modundan Çık (Veya ekranda herhangi bir yere tıklayın)"
          >
            <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Odak Modundan Çık</span>
          </button>
        </div>
      )}

      {/* 1. ARKA PLAN GÖRSELİ (Ambiyans Slaytı) */}
      {!isBlackScreenMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <img
            src={currentSlide.imageUrl}
            alt={currentSlide.title}
            className={`w-full h-full object-cover object-center filter scale-105 transition-all duration-1000 ${
              isFocusMode ? 'brightness-[0.20]' : 'brightness-[0.35]'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
      )}

      {/* 2. SİYAH EKRAN / GECE SAATİ MODU (Minimalist OLED Ekran Koruyucu) */}
      {isBlackScreenMode ? (
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 md:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center w-full">
          
          {/* Üst Bar: Odak Modu & Moddan Çıkış (Odak Modunda Gizlenir) */}
          {!isFocusMode && (
            <div className="w-full flex flex-wrap items-center justify-end gap-2 mb-2 sm:mb-4 animate-in fade-in duration-300">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFocusMode();
                }}
                aria-pressed={isFocusMode}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                title="Odak Modu (Saat ve Tüm Butonları Gizle, Sadece Ayetleri Göster)"
              >
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                <span>Odak Modu</span>
              </button>

              <button
                onClick={() => setIsBlackScreenMode(false)}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer border border-white/10"
              >
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                <span>Görsel Ambiyans Moduna Dön</span>
              </button>
            </div>
          )}

          {/* Anlık Dijital Saat (Odak Modunda Tamamen Gizlenir) */}
          {!isFocusMode && (
            <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-6 animate-in fade-in duration-300">
              <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-mono font-light tracking-wider text-emerald-300/90 drop-shadow-md">
                {currentTimeStr || '00:00:00'}
              </div>
              <div className="text-xs sm:text-sm md:text-base font-medium text-slate-400 uppercase tracking-widest">
                {currentDateStr}
              </div>
            </div>
          )}

          {/* O Anda Okunan Sure & Ayet (Odak Modunda Sadece Ayet Metni Kalır) */}
          <div
            className={`transition-all duration-500 w-full ${
              isFocusMode
                ? 'max-w-3xl p-6 sm:p-10 md:p-14 bg-transparent border-transparent space-y-5'
                : 'max-w-2xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md mb-4 sm:mb-6 space-y-2.5 sm:space-y-3'
            }`}
          >
            {!isFocusMode && (
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-emerald-400 font-bold border-b border-white/10 pb-2 animate-in fade-in duration-300">
                <span className="truncate mr-2">{currentSurahMeta?.name} Suresi • {currentAyahIndex + 1}. Ayet</span>
                <div className="flex items-center gap-2 shrink-0">
                  {isWordTrackingEnabled && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-300 normal-case tracking-normal font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Kelime Takibi
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 font-mono">{playbackSpeed}x Hız</span>
                </div>
              </div>
            )}
            {currentSurahId !== 9 && currentAyahIndex === 0 && (
              <p className="font-amiri text-sm sm:text-base text-emerald-400/80 text-center dir-rtl pb-1">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </p>
            )}
            {isWordTrackingEnabled && trackedWords.length > 0 ? (
              <p
                dir="rtl"
                className={`font-amiri text-slate-100 dir-rtl leading-[2.15] sm:leading-[2.25] text-center break-words transition-all duration-500 ${
                  isFocusMode
                    ? 'text-2xl sm:text-4xl md:text-5xl'
                    : 'text-xl sm:text-2xl md:text-3xl'
                }`}
              >
                {trackedWords.map((word, idx) => {
                  const isCurrentWord = activeWordIndex === idx;
                  const isPastWord = activeWordIndex !== null && idx < activeWordIndex;
                  return (
                    <React.Fragment key={`${currentSurahId}-${currentAyahIndex}-night-w-${idx}`}>
                      <span
                        className={`inline-block rounded-lg px-1.5 py-0.5 mx-0.5 transition-all duration-150 ${
                          isCurrentWord
                            ? 'bg-emerald-500/30 text-emerald-200 ring-1 ring-emerald-400/60 shadow-[0_0_18px_rgba(16,185,129,0.35)] scale-[1.06]'
                            : isPastWord
                            ? 'text-slate-100'
                            : 'text-slate-400/80'
                        }`}
                      >
                        {word}
                      </span>{' '}
                    </React.Fragment>
                  );
                })}
              </p>
            ) : (
              <p
                className={`font-amiri text-slate-100 dir-rtl leading-relaxed text-center break-words transition-all duration-500 ${
                  isFocusMode
                    ? 'text-2xl sm:text-4xl md:text-5xl leading-[2.1]'
                    : 'text-xl sm:text-2xl md:text-3xl'
                }`}
              >
                {cleanedCurrentAyahText || '...'}
              </p>
            )}
            {showTranslation && (
              <p
                className={`text-slate-400 font-sans italic pt-1 text-center leading-relaxed ${
                  isFocusMode ? 'text-sm sm:text-base md:text-lg pt-3' : 'text-xs sm:text-sm border-t border-white/5'
                }`}
              >
                {currentTranslation?.text || ''}
              </p>
            )}
          </div>

          {/* Hız Slider, Kelime Takibi, Odak Modu & Meal Kontrolleri (Odak Modunda Gizlenir) */}
          {!isFocusMode && (
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 animate-in fade-in duration-300">
              {/* Hız Slider (İmleçli) */}
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-slate-300 font-bold">Hız:</span>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={playbackSpeed}
                  onChange={(e) => changeSpeed(parseFloat(e.target.value))}
                  className="w-16 sm:w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  title={`Hız: ${playbackSpeed.toFixed(2)}x`}
                />
                <span className="text-xs font-mono font-bold text-emerald-300 w-8 text-right">
                  {playbackSpeed.toFixed(1)}x
                </span>
              </div>

              <button type="button" onClick={() => setKeepScreenAwake(v => !v)} aria-pressed={keepScreenAwake}
                aria-label={`${screenAwakeLabel}: ${screenAwakeAccessibility}`}
                title={screenAwakeTitle}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border cursor-pointer transition-all ${keepScreenAwake ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-200' : 'border-white/10 bg-white/10 text-slate-300 hover:bg-white/20'}`}>
                <MonitorSmartphone className="w-4 h-4" />
                <span>{screenAwakeLabel}</span>
                {screenAwakeBadge && <span aria-hidden="true" className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${wakeStatus === 'blocked' || wakeStatus === 'unsupported' ? 'bg-amber-500/20 text-amber-200' : 'bg-emerald-500/20 text-emerald-200'}`}>{screenAwakeBadge}</span>}
              </button>
              {/* Gece Saati Moduna Özel Kelime Takibi Butonu */}
              <button
                type="button"
                onClick={toggleWordTracking}
                aria-pressed={isWordTrackingEnabled}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isWordTrackingEnabled
                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'bg-white/10 hover:bg-white/20 text-slate-300 border-white/10'
                }`}
                title={
                  isWordTrackingEnabled
                    ? 'Kelime Bazlı Takibi Kapat'
                    : 'Okunan Kelimeyi Anlık Vurgula (Kelime Takibi)'
                }
              >
                <Sparkles className={`w-3.5 h-3.5 ${isWordTrackingEnabled ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{isWordTrackingEnabled ? 'Kelime Takibi: Açık' : 'Kelime Takibi'}</span>
              </button>

              {/* Gece Saati Moduna Özel Odak Modu Butonu */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFocusMode();
                }}
                aria-pressed={isFocusMode}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/40 transition-all cursor-pointer"
                title="Odak Modu (Saat ve Kontrolleri Gizle, Sadece Ayetleri Göster)"
              >
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Odak Modu</span>
              </button>

              {/* Meal Aç/Kapat Butonu */}
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-white/10 cursor-pointer"
              >
                {showTranslation ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showTranslation ? 'Meali Gizle' : 'Meali Göster'}</span>
              </button>
            </div>
          )}

          {audioError && !isFocusMode && (
            <div role="alert" className="mb-3 rounded-lg border border-amber-500/40 bg-amber-950/70 px-3 py-2 text-sm text-amber-200">
              {audioError}
            </div>
          )}

          {/* Uyku Zamanlayıcı Rozeti (Odak Modunda Gizlenir) */}
          {!isFocusMode && sleepSecondsLeft !== null && (
            <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-medium animate-in fade-in duration-300">
              <Clock className="w-3.5 h-3.5" />
              <span>Uyku Zamanlayıcı: {formatTimerSeconds(sleepSecondsLeft)} sonra duracak</span>
            </div>
          )}

          {/* Gece Kontrol Düğmeleri (Odak Modunda Gizlenir) */}
          {!isFocusMode && (
            <div className="flex items-center gap-3 sm:gap-4 animate-in fade-in duration-300">
              <button
                onClick={handleNextAyah}
                className="p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 cursor-pointer"
                title="Sonraki Ayet"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={togglePlayPause}
                className="p-3.5 sm:p-5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg cursor-pointer transition-transform hover:scale-105"
                title={isPlaying ? "Durdur" : "Başlat"}
              >
                {isPlaying ? <Pause className="w-5 h-5 sm:w-7 sm:h-7 fill-current" /> : <Play className="w-5 h-5 sm:w-7 sm:h-7 fill-current" />}
              </button>
              <button
                onClick={handlePrevAyah}
                disabled={currentSurahId === 1 && currentAyahIndex === 0}
                className="p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 text-slate-300 cursor-pointer"
                title="Önceki Ayet"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
        </div>
      ) : (

        /* 3. NORMAL GÖRSEL AMBİYANS MODU */
        <div
          className={`relative z-20 max-w-[1400px] mx-auto p-2.5 sm:p-4 md:p-6 lg:p-8 flex flex-col min-h-[calc(100vh-70px)] w-full ${
            isFocusMode ? 'justify-center items-center' : 'justify-between'
          }`}
        >
          
          {/* Üst Menü & Kontroller (Odak Modunda Gizlenir) */}
          {!isFocusMode && (
            <div className="relative z-50 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2.5 bg-black/60 backdrop-blur-md p-2.5 sm:p-3.5 md:p-4 rounded-2xl sm:rounded-3xl border border-white/15 shadow-xl w-full animate-in fade-in duration-300">
              
              {/* Sure Seçimi & Hafız Seçimi */}
              <div className="col-start-1 row-start-1 flex min-w-0 flex-wrap items-center gap-2.5 sm:gap-3">
                <div className="relative z-50 w-full min-w-0 max-w-[310px] sm:w-[min(100%,270px)]">
                  <SurahSearchSelect
                    linkTab="listen"
                    selectedSurahId={currentSurahId}
                    onSelectSurah={handleSelectSurah}
                    buttonLabelPrefix="Sure:"
                    theme="dark"
                  />
                </div>

                {/* Hafız Seçimi */}
                <div className="flex min-w-0 max-w-full items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 hidden lg:inline">Hafız:</span>
                  <select
                    value={selectedReciter}
                    onChange={(e) => {
                      const newReciter = e.target.value;
                      setSelectedReciter(newReciter);
                      selectedReciterRef.current = newReciter;
                      try {
                        localStorage.setItem('quran_listening_reciter_mahir_default', newReciter);
                      } catch {
                        // ignore
                      }
                      persistBookmark(currentSurahIdRef.current, currentAyahIndexRef.current, savedCurrentTimeRef.current || 0, newReciter);
                    }}
                    className="bg-slate-900/90 text-white border border-white/20 rounded-xl px-2.5 py-2 text-xs md:text-sm font-semibold focus:outline-none cursor-pointer w-[min(100%,240px)] min-w-0 max-w-[240px] truncate"
                    title="Okuyan Hafız"
                  >
                    {RECITERS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Geniş ekranda orta, dar ekranda ikinci sırada: dinleme kontrolleri */}
              <div className="col-span-2 row-start-2 grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                <button type="button" onClick={() => setKeepScreenAwake(v => !v)} aria-pressed={keepScreenAwake}
                  aria-label={`${screenAwakeLabel}: ${screenAwakeAccessibility}`}
                  title={screenAwakeTitle}
                  className={`min-h-11 min-w-0 w-full justify-center px-2 sm:px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition-all ${keepScreenAwake ? 'border-emerald-400/50 bg-emerald-500/25 text-emerald-200' : 'border-white/10 bg-slate-800/80 text-slate-300 hover:bg-slate-800'}`}>
                  <MonitorSmartphone className="w-4 h-4" />
                  <span>{screenAwakeLabel}</span>
                {screenAwakeBadge && <span aria-hidden="true" className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${wakeStatus === 'blocked' || wakeStatus === 'unsupported' ? 'bg-amber-500/20 text-amber-200' : 'bg-emerald-500/20 text-emerald-200'}`}>{screenAwakeBadge}</span>}
                </button>
                {/* Normal Moda Özel Kelime Takibi Butonu */}
                <button
                  type="button"
                  onClick={toggleWordTracking}
                  aria-pressed={isWordTrackingEnabled}
                  className={`min-h-11 min-w-0 w-full justify-center px-2 sm:px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer border ${
                    isWordTrackingEnabled
                      ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                      : 'bg-slate-800/80 text-slate-300 border-white/10 hover:bg-slate-800'
                  }`}
                  title={
                    isWordTrackingEnabled
                      ? 'Kelime Bazlı Takibi Kapat'
                      : 'Okunan Kelimeyi Anlık Vurgula (Kelime Takibi)'
                  }
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isWordTrackingEnabled ? 'text-emerald-300' : 'text-slate-400'}`} />
                  <span>Kelime Takibi</span>
                  {isWordTrackingEnabled && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>

                {/* Normal Moda Özel Odak Modu Butonu */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFocusMode();
                  }}
                  aria-pressed={isFocusMode}
                  className="min-h-11 min-w-0 w-full justify-center px-2 sm:px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 hover:text-white text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  title="Odak Modu (Tüm Arayüzü Gizle, Sadece Ayetleri Göster)"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Odak Modu</span>
                </button>

                {/* Meal Butonu (Varsayılan Olarak Gizli) */}
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className={`min-h-11 min-w-0 w-full justify-center px-2 sm:px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer border ${
                    showTranslation
                      ? 'bg-amber-500/20 text-amber-200 border-amber-500/40'
                      : 'bg-slate-800/80 text-slate-300 border-white/10 hover:bg-slate-800'
                  }`}
                  title={showTranslation ? 'Mealleri Gizle' : 'Mealleri Göster'}
                >
                  {showTranslation ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                      <span>Meali Gizle</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Meali Göster</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={openManualBookmarks}
                  aria-haspopup="dialog"
                  aria-expanded={bookmarksOpen}
                  className="min-h-11 min-w-0 w-full justify-center px-2 sm:px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer border border-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
                  title="Özel yer imlerini kaydet, düzenle, dinle veya sil"
                >
                  <Bookmark className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Yer İmlerim</span>
                  {manualBookmarks.length > 0 && <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] tabular-nums">{manualBookmarks.length}</span>}
                </button>

                <button
                  onClick={() => setIsBlackScreenMode(true)}
                  className="min-h-11 min-w-0 w-full justify-center px-2 sm:px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer border border-white/10"
                  title="Gece / Siyah Ekran Saat Modu"
                >
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gece Saati</span>
                </button>
              </div>

              {/* Yardım ayrı tutulur; dar ekranda sağ üstte, genişte en sağda. */}
              <div className="col-start-2 row-start-1 flex items-center justify-end self-start gap-2">
                <div className="relative shrink-0">
                  <button type="button" onClick={() => setCycleMenuOpen(v => !v)}
                    aria-expanded={cycleMenuOpen} aria-label="Kur'an dinleme sayacı"
                    className={`min-h-10 rounded-xl border px-3 py-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${cycle.enabled ? 'border-emerald-400/50 bg-emerald-500/25 text-emerald-200' : 'border-white/10 bg-slate-800/80 text-slate-300 hover:bg-slate-800'}`}>
                    <ListChecks className="w-4 h-4 shrink-0" />
                    <span>Sayaç{cycle.enabled ? ` · ${cycle.total}` : ''}</span>
                  </button>
                  {cycleMenuOpen && (
                    <><button type="button" aria-label="Sayaç panelini kapat" onClick={() => setCycleMenuOpen(false)} className="fixed inset-0 z-[75] cursor-default bg-black/20" /><div className="fixed z-[80] bottom-0 inset-x-0 max-h-[80dvh] overflow-y-auto rounded-t-2xl border border-white/20 bg-slate-950 p-4 text-white shadow-2xl space-y-3 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[300px] sm:max-h-[min(75vh,500px)] sm:rounded-2xl" role="region" aria-label="Kur'an dinleme sayacı ayarları">
                      <div className="flex justify-between items-center gap-2">
                        <strong className="text-sm">Kur'an Dinleme Sayacı</strong>
                        <button type="button" className="text-slate-300 text-xs underline" onClick={() => setCycleMenuOpen(false)}>Kapat</button>
                      </div>
                      <p className="text-xs text-slate-400">Eksiksiz dinlenen turlar sayılır. Kayıtlar yalnızca bu cihazda saklanır.</p>
                      <label className="flex justify-between items-center gap-3 text-sm">
                        <span>Takibi etkinleştir</span>
                        <input type="checkbox" checked={cycle.enabled} onChange={e => { startedCycleAyahRef.current = null; updateCycle({ ...cycleRef.current, enabled: e.target.checked, surah: 1, ayah: 0, completedSurahs: 0 }); }} className="accent-emerald-500 w-4 h-4" />
                      </label>
                      {cycle.enabled && (
                        <>
                          <div className="text-2xl font-bold text-emerald-300">{cycle.total} <span className="text-xs font-normal text-slate-300">tam tur</span></div>
                          <div className="text-xs text-slate-300">Devam eden tur: {cycle.completedSurahs}/114 sûre tamamlandı</div>
                          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${cycle.completedSurahs / 114 * 100}%` }} /></div>
                          
                          <button type="button" onClick={() => { if (window.confirm('Tamamlanan turlar ve mevcut ilerleme silinsin mi?')) { startedCycleAyahRef.current = null; updateCycle(emptyCycle(true)); } }}
                            className="min-h-10 w-full rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800 text-xs font-semibold flex justify-center items-center gap-2 cursor-pointer">
                            <RotateCcw className="w-3.5 h-3.5" /> Tüm sayacı sıfırla
                          </button>
                        </>
                      )}
                    </div>
                  </>)}
                </div>
                <TroubleshootingMenu><ListeningDiagnosticsPanel /></TroubleshootingMenu>
              </div>

            </div>
          )}

          {/* Orta Alan: Okunan Ayet Kartı (Odak Modunda Sadece Ayet Kalır) */}
          <div className="relative z-0 my-3 sm:my-5 md:my-8 max-w-4xl mx-auto w-full text-center space-y-3 sm:space-y-4">
            
            {/* Büyük Ayet Metni Kartı */}
            <div
              className={`transition-all duration-500 ${
                isFocusMode
                  ? 'p-6 sm:p-10 md:p-14 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-md space-y-5'
                  : 'p-4 sm:p-6 md:p-9 rounded-2xl sm:rounded-3xl bg-black/60 border border-white/15 backdrop-blur-xl shadow-2xl space-y-3 sm:space-y-4'
              }`}
            >
              {!isFocusMode && (
                <div className="flex items-center justify-between text-xs text-emerald-400 font-bold border-b border-white/10 pb-2.5 animate-in fade-in duration-300">
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30 text-[11px] sm:text-xs font-bold">
                      {currentSurahId}
                    </span>
                    <span className="truncate">{currentSurahMeta?.name} Suresi</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {isWordTrackingEnabled && (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-[11px] text-amber-200 font-semibold">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        Kelime Takibi Aktif
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFocusMode();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer"
                      title="Odak Moduna Geç (Sadece Ayetleri Göster)"
                    >
                      <Maximize2 className="w-3 h-3 text-emerald-300" />
                      <span>Odak Modu</span>
                    </button>
                    <span className="bg-emerald-900/60 text-emerald-200 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-emerald-500/30 text-[11px] sm:text-xs">
                      {currentAyahIndex + 1} / {ayahs.length} Ayet
                    </span>
                  </div>
                </div>
              )}

              {/* Besmele Başlığı (Tevbe hariç tüm surelerin ilk ayetinde üst başlık olarak gösterilir) */}
              {currentSurahId !== 9 && currentAyahIndex === 0 && (
                <div className="py-1 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-emerald-950/40 border border-emerald-500/20 max-w-xs sm:max-w-sm mx-auto text-center">
                  <p className="font-amiri text-base sm:text-lg md:text-xl text-emerald-300 dir-rtl">
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                  </p>
                </div>
              )}

              {isWordTrackingEnabled && trackedWords.length > 0 ? (
                <p
                  dir="rtl"
                  className="font-amiri text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white dir-rtl leading-[2.1] sm:leading-[2.3] md:leading-[2.5] font-bold text-center drop-shadow-md break-words"
                >
                  {trackedWords.map((word, idx) => {
                    const isCurrentWord = activeWordIndex === idx;
                    const isPastWord = activeWordIndex !== null && idx < activeWordIndex;
                    return (
                      <React.Fragment key={`${currentSurahId}-${currentAyahIndex}-normal-w-${idx}`}>
                        <span
                          className={`inline-block rounded-xl px-2 py-0.5 mx-0.5 transition-all duration-150 ${
                            isCurrentWord
                              ? 'bg-amber-400/25 text-amber-200 ring-1 ring-amber-400/60 shadow-[0_0_22px_rgba(251,191,36,0.35)] scale-[1.06]'
                              : isPastWord
                              ? 'text-white'
                              : 'text-slate-300/75'
                          }`}
                        >
                          {word}
                        </span>{' '}
                      </React.Fragment>
                    );
                  })}
                </p>
              ) : (
                <p className="font-amiri text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white dir-rtl leading-[2.0] sm:leading-[2.2] md:leading-[2.4] font-bold text-center drop-shadow-md break-words">
                  {cleanedCurrentAyahText || (loading ? 'Sure yükleniyor...' : '...')}
                </p>
              )}

              {/* Türkçe Meal (Sadece butonla açıldığında gösterilir) */}
              {showTranslation && (
                <div className="pt-2.5 sm:pt-3 border-t border-white/10 animate-in fade-in duration-200">
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg text-emerald-100/90 dir-ltr text-center font-normal leading-relaxed drop-shadow-sm">
                    {currentTranslation?.text || ''}
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Alt Kontrol Barı (Odak Modunda Gizlenir) */}
          {!isFocusMode && (
          <div className="bg-black/80 backdrop-blur-xl p-3 sm:p-4 md:p-5 rounded-2xl sm:rounded-3xl border border-white/15 shadow-2xl max-w-4xl mx-auto w-full animate-in fade-in duration-300">
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
              
              {/* Sol: Ayet İlerleme ve Bilgi */}
              <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <button
                    onClick={handleNextAyah}
                    className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-colors cursor-pointer"
                    title="Sonraki Ayet (Son ayette bir sonraki sûreye geçer)"
                  >
                    <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <button
                    onClick={togglePlayPause}
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-transform hover:scale-105 cursor-pointer"
                    title={isPlaying ? 'Duraklat' : 'Oynat'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />}
                  </button>

                  <button
                    onClick={handlePrevAyah}
                    disabled={currentSurahId === 1 && currentAyahIndex === 0}
                    className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-colors cursor-pointer"
                    title="Önceki Ayet"
                  >
                    <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="ml-1 min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-white block truncate max-w-[150px] sm:max-w-[220px]">
                    {currentSurahMeta?.name} Suresi
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 block truncate">
                    {currentAyahIndex + 1}. Ayet {isPlaying ? '• Kesintisiz' : (savedCurrentTimeRef.current > 0 ? '• Kaldığın yer hazır' : '• Duraklatıldı')}
                  </span>
                </div>
              </div>

              {/* Sağ: Hız Kontrolü, Ses Düzeyi ve Uyku Zamanlayıcısı */}
              <div className="grid grid-cols-2 gap-2 w-full min-w-0 pt-2.5 border-t border-white/10 lg:flex lg:w-auto lg:items-center lg:justify-end lg:gap-2 lg:pt-0 lg:border-t-0">
                
                {/* Hız Slider (İmleçli) */}
                <div className="flex min-w-0 w-full items-center justify-between gap-1.5 bg-white/10 px-2 py-2 rounded-xl sm:rounded-2xl border border-white/10 lg:w-auto lg:justify-start lg:px-3">
                  <div className="flex items-center gap-1 text-xs text-slate-300 font-bold whitespace-nowrap">
                    <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Hız:</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={playbackSpeed}
                    onChange={(e) => changeSpeed(parseFloat(e.target.value))}
                    className="w-full min-w-0 max-w-20 lg:w-20 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    title={`Okuma Hızı: ${playbackSpeed.toFixed(2)}x`}
                  />
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-emerald-300 w-8 text-right">
                    {playbackSpeed.toFixed(1)}x
                  </span>
                </div>

                {/* On phones the OS owns volume. Do not pretend to display its level. */}
                {usesDeviceVolume ? (
                  <div
                    role="note"
                    className="flex w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-2.5 py-2 text-slate-300 lg:w-auto"
                    title="Ses seviyesini telefonun ses açma ve kısma tuşlarıyla ayarlayın."
                  >
                    <Volume2 aria-hidden="true" className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span className="text-[11px] font-semibold whitespace-nowrap">Ses: Telefon tuşları</span>
                  </div>
                ) : (
                  <div className="flex w-full min-w-0 items-center justify-center gap-2 bg-white/10 px-2 py-2 rounded-xl sm:rounded-2xl border border-white/10 lg:w-auto lg:px-2.5">
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      aria-label={isMuted ? 'Sesi aç' : 'Sesi kapat'}
                      aria-pressed={isMuted}
                      className="text-slate-400 hover:text-white cursor-pointer"
                      title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />}
                    </button>
                    <input
                      type="range"
                      aria-label="Uygulama ses seviyesi"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(parseFloat(e.target.value));
                        setIsMuted(false);
                      }}
                      className="w-full min-w-0 max-w-20 lg:w-20 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      title={`Ses: %${Math.round((isMuted ? 0 : volume) * 100)}`}
                    />
                  </div>
                )}

                {/* Kompakt uyku modu: sade düğme, ayrıntılar yalnızca açıldığında görünür. */}
                <div ref={sleepMenuRef} className="relative col-span-2 min-w-0 w-full lg:w-auto">
                  <div className={`flex w-full lg:w-auto items-center gap-1.5 rounded-xl border px-2 py-1.5 transition-colors ${
                    sleepSecondsLeft !== null
                      ? 'bg-emerald-950/70 border-emerald-500/40'
                      : 'bg-white/10 border-white/10'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setSleepMenuOpen((open) => !open)}
                      aria-expanded={sleepMenuOpen}
                      aria-controls="listening-sleep-timer-menu"
                      title="Uyku zamanlayıcısını ayarla"
                      className="flex flex-1 min-w-0 items-center justify-between gap-3 rounded-lg px-1.5 py-1 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-200 whitespace-nowrap">
                        <Moon className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Uyku modu</span>
                      </span>
                      <span className={`text-[11px] font-bold font-mono whitespace-nowrap ${
                        sleepSecondsLeft !== null ? 'text-emerald-300' : 'text-slate-400'
                      }`}>
                        {sleepSecondsLeft !== null ? formatTimerSeconds(sleepSecondsLeft) : 'Sınırsız'}
                      </span>
                    </button>
                    {sleepSecondsLeft !== null && (
                      <button
                        type="button"
                        onClick={() => { handleCancelTimer(); setSleepMenuOpen(false); }}
                        title="Uyku zamanlayıcısını kapat, dinlemeye devam et"
                        className="shrink-0 rounded-lg border border-rose-400/30 bg-rose-500/10 px-2 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/20 cursor-pointer"
                      >
                        İptal
                      </button>
                    )}
                  </div>

                  {sleepMenuOpen && (
                    <div
                      id="listening-sleep-timer-menu"
                      role="group"
                      aria-label="Uyku zamanlayıcısı seçenekleri"
                      className="absolute bottom-full right-0 z-50 mb-2 w-[calc(100vw-1rem)] max-w-[340px] rounded-2xl border border-white/15 bg-[#20252b] p-3.5 text-white shadow-[0_18px_48px_rgba(0,0,0,0.55)]"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-amber-400/10 p-2">
                            <Moon className="h-4 w-4 text-amber-300" />
                          </span>
                          <div>
                            <p className="text-sm font-bold text-white">Uyku zamanlayıcısı</p>
                            <p className="text-[11px] text-slate-400">Süre dolduğunda dinleme durur.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSleepMenuOpen(false)}
                          className="rounded-lg px-1.5 py-1 text-[11px] text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
                          aria-label="Uyku modu seçeneklerini kapat"
                        >Kapat</button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[15, 30, 60].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => { handleSetTimer(mins); setSleepMenuOpen(false); }}
                            className={`rounded-xl border px-2 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                              sleepTimerMinutes === mins
                                ? 'border-emerald-400 bg-emerald-700 text-white'
                                : 'border-white/15 bg-white/5 text-slate-200 hover:border-emerald-400/60 hover:bg-white/10'
                            }`}
                            title={`${mins} dakika sonra durdur`}
                          >{mins} dk</button>
                        ))}
                      </div>
                      <div className="mt-3 border-t border-white/10 pt-3">
                        <label htmlFor="customSleepMinutes" className="mb-1.5 block text-[11px] font-semibold text-slate-300">
                          Özel süre (dakika)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            id="customSleepMinutes"
                            type="number"
                            min="1"
                            max="720"
                            value={customSleepMinutes}
                            onChange={(e) => setCustomSleepMinutes(Number(e.target.value))}
                            className="w-0 flex-1 min-w-0 rounded-xl border border-white/20 bg-[#14181d] px-3 py-2 text-sm font-semibold text-white outline-none focus:border-emerald-400"
                            title="1 ile 720 dakika arasında bir süre girin"
                          />
                          <button
                            type="button"
                            onClick={() => { handleSetTimer(customSleepMinutes); setSleepMenuOpen(false); }}
                            disabled={!Number.isInteger(customSleepMinutes) || customSleepMinutes < 1 || customSleepMinutes > 720}
                            className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >Başlat</button>
                        </div>
                      </div>
                      {sleepSecondsLeft !== null && (
                        <p className="mt-3 text-center text-[11px] font-semibold text-emerald-300" role="status">
                          Etkin: {formatTimerSeconds(sleepSecondsLeft)} kaldı
                        </p>
                      )}
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
          )}

        </div>
      )}

    </div>
  );
};

