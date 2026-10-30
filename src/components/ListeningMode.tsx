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
  Minimize2
} from 'lucide-react';
import { SURAHS, RECITERS } from '../data/surahs';
import { AMBIENCE_SLIDES } from '../data/ambienceImages';
import { Ayah } from '../types';
import { fetchSurahData } from '../services/quranApi';
import { SurahSearchSelect } from './SurahSearchSelect';

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

  // Durumlar
  const [currentSurahId, setCurrentSurahId] = useState<number>(targetSurahId || initialBookmark.surahId || 1);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(targetSurahId && targetSurahId !== initialBookmark.surahId ? 0 : (initialBookmark.ayahIndex || 0));
  const [selectedReciter, setSelectedReciter] = useState<string>(() => {
    try {
      const savedReciter = localStorage.getItem('quran_listening_reciter_mahir_default');
      if (savedReciter && RECITERS.some((r) => r.id === savedReciter)) {
        return savedReciter;
      }
    } catch {
      // ignore
    }
    return 'ar.mahermuaiqly';
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showTranslation, setShowTranslation] = useState<boolean>(false); // Varsayılan gizli

  // Veri
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [translations, setTranslations] = useState<Ayah[]>([]);

  // Ambiyans, Siyah Ekran (Gece Saati) ve Odak Modu
  const [isBlackScreenMode, setIsBlackScreenMode] = useState<boolean>(false);
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
  const [sleepSecondsLeft, setSleepSecondsLeft] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
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
  const playRequestRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const sleepTimerIntervalRef = useRef<any>(null);
  const sleepTargetEndTimeRef = useRef<number | null>(null);
  const isSleepStoppingRef = useRef<boolean>(false);
  const bookmarkIntervalRef = useRef<any>(null);

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
      console.warn('Yer imi kaydedilemedi:', e);
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

  // Ses Seviyesi ve Hızı Güncelle
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [volume, isMuted, playbackSpeed]);

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

    // Oynatma niyetlerini ve otomatik geçişi kesin olarak durdur
    shouldAutoPlayNextSurahRef.current = false;
    setIsPlaying(false);
    isPlayingRef.current = false;

    // Kullanıcının seçtiği dakika dolduğu anda sesi durdur, tekrar başlamasını engelle.
    player.pause();
    player.volume = mutedRef.current ? 0 : volumeRef.current;
    isSleepStoppingRef.current = false;
  }, [persistBookmark]);

  // Tek bir bozuk ses dosyası veya kısa internet kesintisi oynatmayı kalıcı olarak durdurmaz.
  const cancelReconnect = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    retryAttemptsRef.current = 0;
    setIsRecovering(false);
  }, []);

  const scheduleReconnect = useCallback((requestId: number) => {
    if (!isPlayingRef.current || isSleepStoppingRef.current || requestId !== playRequestRef.current) return;
    if (sleepTargetEndTimeRef.current !== null && Date.now() >= sleepTargetEndTimeRef.current) {
      triggerSleepStop();
      return;
    }
    if (reconnectTimerRef.current !== null) return;
    const attempt = ++retryAttemptsRef.current;
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
      reconnectPlaybackRef.current();
    }, delay);
  }, [triggerSleepStop]);

  // Ayeti Çal (Merkezi Çalma Fonksiyonu)
  const playAyahAt = useCallback((idx: number, startTime = 0, ayahList?: Ayah[]) => {
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
      const nextId = currentSurahIdRef.current < 114 ? currentSurahIdRef.current + 1 : 1;
      ++playRequestRef.current;
      currentSurahIdRef.current = nextId;
      currentAyahIndexRef.current = 0;
      shouldAutoPlayNextSurahRef.current = true;
      setCurrentAyahIndex(0);
      persistBookmark(nextId, 0, 0);
      setCurrentSurahId(nextId);
      return;
    }

    setCurrentAyahIndex(idx);
    currentAyahIndexRef.current = idx;
    persistBookmark(currentSurahIdRef.current, idx, startTime);

    const ayah = list[idx];
    if (!ayah || !ayah.audio) {
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
    if (ready && ready !== previousPlayer) {
      previousPlayer.pause();
      previousPlayer.ontimeupdate = null;
      previousPlayer.onended = null;
      previousPlayer.onloadedmetadata = null;
      previousPlayer.onerror = null;
      audioRef.current = ready;
      if (ready === preloadNextAudioRef.current) preloadNextAudioRef.current = previousPlayer;
      else preloadAfterNextAudioRef.current = previousPlayer;
      setAudioEpoch((n) => n + 1);
    } else if (player.src !== ayah.audio) {
      player.src = ayah.audio;
    }

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
      const upcomingSurahId = currentSurahIdRef.current < 114 ? currentSurahIdRef.current + 1 : 1;
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

    const requestId = ++playRequestRef.current;
    reconnectPlaybackRef.current = () => {
      if (!isPlayingRef.current || requestId !== playRequestRef.current) return;
      const position = Number.isFinite(player.currentTime) && player.currentTime > 0
        ? player.currentTime : savedCurrentTimeRef.current;
      // Yükleme başarısız olsa bile aynı ayette kaldığı yerden yeniden dene.
      player.pause();
      player.removeAttribute('src');
      player.load();
      playAyahAt(idx, Math.max(0, position || 0), list);
    };
    lastAudioProgressRef.current = { at: Date.now(), seconds: Math.max(0, startTime) };
    setAudioError(null);
    player.preload = 'auto';
    player.volume = mutedRef.current ? 0 : volumeRef.current;
    player.playbackRate = playbackSpeedRef.current;

    let lastSavedSecond = -1;
    let hasAdvancedToNext = false;

    const advanceToNextAyah = () => {
      if (hasAdvancedToNext || requestId !== playRequestRef.current || isSleepStoppingRef.current || !isPlayingRef.current) return;
      if (sleepTargetEndTimeRef.current && Date.now() >= sleepTargetEndTimeRef.current) {
        triggerSleepStop();
        return;
      }
      hasAdvancedToNext = true;
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
            retryAttemptsRef.current = 0;
            setIsRecovering(false);
            setAudioError(null);
          }
        }
        const curSec = Math.floor(curTime);
        savedCurrentTimeRef.current = curTime;
        if (curSec !== lastSavedSecond) {
          lastSavedSecond = curSec;
          persistBookmark(currentSurahIdRef.current, currentAyahIndexRef.current, curTime);
        }

        // MP3 sonundaki ~85ms ölü sessizlik payını (trailing silence) beklemeyip pürüzsüz geçiş yap
        const dur = player.duration;
        if (dur && isFinite(dur) && dur > 1.2 && dur - curTime <= 0.085) {
          advanceToNextAyah();
        }
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
      player.play().catch((err) => {
        if (requestId !== playRequestRef.current || !isPlayingRef.current) return;
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
    player.onloadedmetadata = startPlayer;
    if (player.readyState >= 1) startPlayer();

    player.onended = () => {
      advanceToNextAyah();
    };
    player.onplaying = () => {
      if (requestId === playRequestRef.current) {
        lastAudioProgressRef.current = { at: Date.now(), seconds: player.currentTime || 0 };
      }
    };

    player.onerror = (e) => {
      if (requestId !== playRequestRef.current) return;
      console.warn(`Ayet ${idx + 1} yüklenemedi, otomatik tekrar deneniyor:`, e);
      scheduleReconnect(requestId);
    };

    setIsPlaying(true);
    isPlayingRef.current = true;
  }, [persistBookmark, triggerSleepStop, cancelReconnect, scheduleReconnect]);

  // Sure Verisini Yükle
  useEffect(() => {
    let isCancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetchSurahData(currentSurahId, selectedReciter);
        if (!isCancelled) {
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
          console.error('Dinleme modu veri hatası:', err);
          shouldAutoPlayNextSurahRef.current = false;
          setAudioError('Sure verisi alınamadı. Bağlantı geri geldiğinde yeniden denenecek.');
          if (isPlayingRef.current) {
            setIsRecovering(true);
            // API tekrar denemesi; sonraki sureye geçiş niyeti korunur.
            setTimeout(() => {
              if (!isCancelled && isPlayingRef.current) setCurrentSurahId((id) => id);
            }, 5000);
          }
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    load();
    return () => {
      isCancelled = true;
    };
  }, [currentSurahId, selectedReciter, playAyahAt]);

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
    window.addEventListener('beforeunload', saveCurrentProgress);
    window.addEventListener('pagehide', saveCurrentProgress);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    bookmarkIntervalRef.current = setInterval(() => {
      if (audioRef.current && isPlayingRef.current) {
        saveCurrentProgress();
      }
    }, 2000);

    return () => {
      saveCurrentProgress();
      window.removeEventListener('online', onOnline);
      window.removeEventListener('beforeunload', saveCurrentProgress);
      window.removeEventListener('pagehide', saveCurrentProgress);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(bookmarkIntervalRef.current);
    };
  }, [persistBookmark, triggerSleepStop]);

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
    if (isPlaying) {
      const pausedTime =
        audioRef.current && audioRef.current.currentTime > 0
          ? audioRef.current.currentTime
          : savedCurrentTimeRef.current || 0;
      ++playRequestRef.current;
      cancelReconnect();
      audioRef.current.pause();
      setIsPlaying(false);
      isPlayingRef.current = false;
      persistBookmark(currentSurahIdRef.current, currentAyahIndexRef.current, pausedTime);
    } else {
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
    setIsPlaying(false);
    isPlayingRef.current = false;
    shouldAutoPlayNextSurahRef.current = false;
    if (audioRef.current) {
      audioRef.current.ontimeupdate = null;
      audioRef.current.onended = null;
      audioRef.current.onloadedmetadata = null;
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
  };

  const handleNextAyah = () => {
    savedCurrentTimeRef.current = 0;
    playAyahAt(currentAyahIndex + 1, 0);
  };

  const handlePrevAyah = () => {
    if (currentAyahIndex > 0) {
      savedCurrentTimeRef.current = 0;
      playAyahAt(currentAyahIndex - 1, 0);
    }
  };

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

  // Kaldığı Yerden Devam Et
  const resumeFromBookmark = () => {
    const b = getSavedBookmark();
    if (b) {
      savedCurrentTimeRef.current = b.currentTime || 0;
      if (b.surahId !== currentSurahId) {
        currentAyahIndexRef.current = b.ayahIndex;
        setCurrentAyahIndex(b.ayahIndex);
        shouldAutoPlayNextSurahRef.current = true;
        currentSurahIdRef.current = b.surahId;
        setCurrentSurahId(b.surahId);
        currentAyahIndexRef.current = b.ayahIndex;
        setCurrentAyahIndex(b.ayahIndex);
      } else {
        playAyahAt(b.ayahIndex, b.currentTime || 0);
      }
    }
  };

  const handleSelectSurah = (surahId: number) => {
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
                onClick={handlePrevAyah}
                className="p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 cursor-pointer"
                title="Önceki Ayet"
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
                onClick={handleNextAyah}
                className="p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 cursor-pointer"
                title="Sonraki Ayet"
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
            <div className="relative z-50 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 bg-black/60 backdrop-blur-md p-2.5 sm:p-3.5 md:p-4 rounded-2xl sm:rounded-3xl border border-white/15 shadow-xl w-full animate-in fade-in duration-300">
              
              {/* Sure Seçimi & Hafız Seçimi */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap min-w-0">
                <div className="relative z-50 min-w-[150px] sm:min-w-[190px]">
                  <SurahSearchSelect
                    selectedSurahId={currentSurahId}
                    onSelectSurah={handleSelectSurah}
                    buttonLabelPrefix="Sure:"
                    theme="dark"
                  />
                </div>

                {/* Hafız Seçimi */}
                <div className="flex items-center gap-1.5">
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
                    className="bg-slate-900/90 text-white border border-white/20 rounded-xl px-2.5 py-2 text-xs md:text-sm font-semibold focus:outline-none cursor-pointer max-w-[150px] sm:max-w-[210px] truncate"
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

              {/* Sağ Butonlar: Kelime Takibi, Odak Modu, Meal Göster/Gizle, Siyah Ekran, Yer İmi */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {/* Normal Moda Özel Kelime Takibi Butonu */}
                <button
                  type="button"
                  onClick={toggleWordTracking}
                  aria-pressed={isWordTrackingEnabled}
                  className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer border ${
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
                  className="px-2.5 sm:px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 hover:text-white text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  title="Odak Modu (Tüm Arayüzü Gizle, Sadece Ayetleri Göster)"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Odak Modu</span>
                </button>

                {/* Meal Butonu (Varsayılan Olarak Gizli) */}
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer border ${
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
                  onClick={resumeFromBookmark}
                  className="px-2.5 sm:px-3 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer border border-emerald-500/40"
                  title="Kaldığım Yerden Devam Et"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kaldığım Yer</span>
                </button>

                <button
                  onClick={() => setIsBlackScreenMode(true)}
                  className="px-2.5 sm:px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer border border-white/10"
                  title="Gece / Siyah Ekran Saat Modu"
                >
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Gece Saati</span>
                </button>
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
                    onClick={handlePrevAyah}
                    disabled={currentAyahIndex <= 0}
                    className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-colors cursor-pointer"
                    title="Önceki Ayet"
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
                    onClick={handleNextAyah}
                    className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    title="Sonraki Ayet (Son ayette bir sonraki sureye geçer)"
                  >
                    <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="ml-1 min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-white block truncate max-w-[150px] sm:max-w-[220px]">
                    {currentSurahMeta?.name} Suresi
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 block truncate">
                    {currentAyahIndex + 1}. Ayet {isPlaying && '• Kesintisiz'}
                  </span>
                </div>
              </div>

              {/* Sağ: Hız Kontrolü, Ses Düzeyi ve Uyku Zamanlayıcısı */}
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-wrap pt-2.5 lg:pt-0 border-t border-white/10 lg:border-t-0">
                
                {/* Hız Slider (İmleçli) */}
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-2xl border border-white/10">
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
                    className="w-14 sm:w-20 md:w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    title={`Okuma Hızı: ${playbackSpeed.toFixed(2)}x`}
                  />
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-emerald-300 w-8 text-right">
                    {playbackSpeed.toFixed(1)}x
                  </span>
                </div>

                {/* Ses Düzeyi */}
                <div className="flex items-center gap-1.5 bg-white/10 px-2 sm:px-2.5 py-1.5 rounded-xl sm:rounded-2xl border border-white/10">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                    title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-12 sm:w-16 md:w-20 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    title={`Ses: %${Math.round((isMuted ? 0 : volume) * 100)}`}
                  />
                </div>

                {/* Uyku Zamanlayıcısı */}
                <div className="flex items-center gap-1 bg-white/10 px-2 sm:px-2.5 py-1.5 rounded-xl sm:rounded-2xl border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {sleepSecondsLeft !== null ? (
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <span className="px-1.5 py-0.5 bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 rounded-lg text-[10px] sm:text-xs font-mono font-bold">
                        {formatTimerSeconds(sleepSecondsLeft)}
                      </span>
                      <button
                        onClick={handleCancelTimer}
                        className="text-[10px] sm:text-[11px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                      >
                        İptal
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      {[15, 30, 60].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => handleSetTimer(mins)}
                          className="px-1.5 sm:px-2 py-0.5 bg-white/10 hover:bg-emerald-600 rounded-lg text-[10px] sm:text-[11px] font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title={`${mins} dakika sonra kapat`}
                        >
                          {mins}d
                        </button>
                      ))}
                      <label className="sr-only" htmlFor="customSleepMinutes">Özel uyku süresi (dakika)</label>
                      <input
                        id="customSleepMinutes"
                        type="number"
                        min="1"
                        max="720"
                        value={customSleepMinutes}
                        onChange={(e) => setCustomSleepMinutes(Number(e.target.value))}
                        className="w-12 sm:w-14 rounded-md bg-slate-900 border border-white/30 px-1 py-0.5 text-[11px] text-white text-center"
                        title="Özel süre (1-720 dakika)"
                      />
                      <button
                        onClick={() => handleSetTimer(customSleepMinutes)}
                        disabled={!Number.isInteger(customSleepMinutes) || customSleepMinutes < 1 || customSleepMinutes > 720}
                        className="px-1.5 py-0.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 rounded-md text-[11px] text-white"
                        title="Girilen dakika sonunda durdur"
                      >Kur</button>
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

