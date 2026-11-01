import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Volume2, Type, RefreshCw, Layers, X, Eye, EyeOff, Check } from 'lucide-react';
import { Ayah, VerseWbw, WordData } from '../types';
import { SURAHS, RECITERS } from '../data/surahs';
import { bindAudioMediaSession } from '../utils/mediaSessionCoordinator';
import { fetchSurahData, fetchWbwData } from '../services/quranApi';
import { AnalysisModal } from './AnalysisModal';
import { SurahSearchSelect } from './SurahSearchSelect';
import { QuickSurahBookmarks } from './QuickSurahBookmarks';
import { EzberVoiceRecorder } from './EzberVoiceRecorder';
import { recordEzberEvent as logEzber, ezberErrorName } from '../utils/ezberDiagnostics';

interface DesktopModeProps {
  targetSurahId?: number | null;
  themeMode?: 'dark' | 'emerald';
  onPlaybackChange?: (playing: boolean) => void;
}

export const DesktopMode: React.FC<DesktopModeProps> = ({ targetSurahId, themeMode = 'dark', onPlaybackChange }) => {
  const isDark = themeMode === 'dark';
  // Durumlar
  const [currentSurah, setCurrentSurah] = useState<number>(() => {
    return (targetSurahId && targetSurahId >= 1 && targetSurahId <= 114) ? targetSurahId : 67;
  }); // Mülk Suresi varsayılan

  useEffect(() => {
    if (targetSurahId && targetSurahId >= 1 && targetSurahId <= 114) {
      setCurrentSurah(targetSurahId);
    }
  }, [targetSurahId]);
  const [selectedReciter, setSelectedReciter] = useState<string>('ar.mahermuaiqly');
  const [selectedFont, setSelectedFont] = useState<string>('font-amiri');
  const [fontSize, setFontSize] = useState<number>(1.85);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [targetLoopCount, setTargetLoopCount] = useState<number | 'infinite'>(3);
  const [currentLoop, setCurrentLoop] = useState<number>(0);
  const [showTranslations, setShowTranslations] = useState<boolean>(false); // Varsayılan gizli

  // Veriler
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [translations, setTranslations] = useState<Ayah[]>([]);
  const [wbwList, setWbwList] = useState<VerseWbw[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Seçim
  const [selectedWordKeys, setSelectedWordKeys] = useState<string[]>([]); // "verseNum-wordIdx"
  const [lastClickedKey, setLastClickedKey] = useState<string | null>(null);

  // Çalma Durumu
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  useEffect(() => {
    onPlaybackChange?.(isPlaying);
  }, [isPlaying, onPlaybackChange]);
  useEffect(() => () => onPlaybackChange?.(false), [onPlaybackChange]);
  const [activeVerseNum, setActiveVerseNum] = useState<number | null>(null);
  const [activeWordKey, setActiveWordKey] = useState<string | null>(null);

  // Modal Durumu
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalVerseNum, setModalVerseNum] = useState<number>(1);
  const [isBlindRecording, setIsBlindRecording] = useState<boolean>(false);

  // Audio ve Zamanlayıcı Referansları
  // Reuse the same audio element across renders.
  const audioRef = useRef<HTMLAudioElement>(null!);
  if (audioRef.current === null) audioRef.current = new Audio();
  useEffect(() => {
    const audio = audioRef.current;
    return bindAudioMediaSession(audio, () => ({
      title: `${SURAHS.find(item => item.id === currentSurah)?.name || 'Kur’an-ı Kerim'} Suresi · Ezber`,
      artist: RECITERS.find(item => item.id === selectedReciter)?.name || 'Kur’an-ı Kerim',
      album: 'Hayat Rehberi · Ezber Asistanı'
    }), {
      onPlay: () => {
        if (!audio.src) return;
        void audio.play().then(() => setIsPlaying(true)).catch(() => {});
      },
      onPause: () => {
        audio.pause();
        setIsPlaying(false);
      },
      onStop: () => stopAudio()
    });
  }, [currentSurah, selectedReciter]);
  const playRequestRef = useRef(0);
  const segmentAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackSpeedRef = useRef<number>(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;

  const updatePlaybackSpeed = (newSpeed: number) => {
    setPlaybackSpeed(newSpeed);
    playbackSpeedRef.current = newSpeed;
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const tickIntervalRef = useRef<any>(null);
  const segmentsRef = useRef<Array<{
    verseNum: number;
    startRatio: number;
    endRatio: number;
    wordKeys: string[];
  }>>([]);
  const segmentIdxRef = useRef<number>(0);
  const currentLoopRef = useRef<number>(0);
  const targetLoopRef = useRef<number | 'infinite'>(3);

  // Fare ile Sürükleme (Drag to Select / Deselect / Backtrack Undo) Referansları
  const isDraggingRef = useRef<boolean>(false);
  const dragTypeRef = useRef<'word' | 'verse' | null>(null);
  const dragModeRef = useRef<'select' | 'deselect' | null>(null);
  const dragStartKeyRef = useRef<string | null>(null);
  const dragStartVerseRef = useRef<number | null>(null);
  const initialSelectionRef = useRef<string[]>([]);
  const hasDraggedRef = useRef<boolean>(false);

  // Global Mouse Bırakma (MouseUp) Takibi
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        dragTypeRef.current = null;
        dragModeRef.current = null;
        dragStartKeyRef.current = null;
        dragStartVerseRef.current = null;
        setTimeout(() => {
          hasDraggedRef.current = false;
        }, 60);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // Sayfa Boşluğuna Basıldığında Seçimi Kaldırma (Global PointerDown)
  useEffect(() => {
    const handleGlobalPointerDown = (e: MouseEvent) => {
      // Sadece sol fare tuşu
      if (e.button !== 0) return;

      // Eğer analiz modalı açıksa müdahale etme
      if (modalOpen) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Tıklanan hedef bir kelime, ayet rozeti, buton, modal veya interaktif arayüz bileşeni ise seçimi kaldırma
      const isInteractive = Boolean(
        target.closest('.word-span') ||
        target.closest('.verse-num-badge') ||
        target.closest('button') ||
        target.closest('select') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('a') ||
        target.closest('[role="dialog"]') ||
        target.closest('.analysis-modal-container')
      );

      // Boş alana basıldıysa tüm seçimi anında kaldır
      if (!isInteractive) {
        if (selectedWordKeys.length > 0) {
          setSelectedWordKeys([]);
          setLastClickedKey(null);
        }
      }
    };

    window.addEventListener('pointerdown', handleGlobalPointerDown);
    return () => {
      window.removeEventListener('pointerdown', handleGlobalPointerDown);
    };
  }, [modalOpen, selectedWordKeys.length]);

  // Sure verisini yükle
  useEffect(() => {
    let isCancelled = false;
    async function load() {
      setLoading(true);
      stopAudio();
      logEzber('SURAH_LOAD_START','info',{surah:currentSurah,detail:{mode:'desktop'}});
      setSelectedWordKeys([]);
      setLastClickedKey(null);
      try {
        const [surahRes, wbwRes] = await Promise.all([
          fetchSurahData(currentSurah, selectedReciter),
          fetchWbwData(currentSurah)
        ]);
        if (!isCancelled) {
          setAyahs(surahRes.ayahs);
          setTranslations(surahRes.translations);
          setWbwList(wbwRes);
          logEzber('SURAH_LOAD_OK','info',{surah:currentSurah,detail:{mode:'desktop'}});
        }
      } catch (err) {
        if (!isCancelled) {
          setAyahs([]);
          setTranslations([]);
          setWbwList([]);
          logEzber('SURAH_LOAD_FAILED','error',{surah:currentSurah,detail:{mode:'desktop',name:ezberErrorName(err),online:navigator.onLine}});
        }
        console.error('Veri yükleme hatası:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    load();
    return () => {
      isCancelled = true;
    };
  }, [currentSurah, selectedReciter]);

  // Ses Hızını Uygula
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Temizleme
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Ayet başındaki gömülü Besmele'yi temizle (Fatiha hariç, Fatiha'da 1. ayet Besmele'nin kendisidir)
  const cleanVerseText = (text: string, verseNum: number): string => {
    if (currentSurah !== 1 && verseNum === 1) {
      return text.replace(/^بِسْمِ\s+ٱ?للَّهِ\s+ٱ?لرَّحْمَٰنِ\s+ٱ?لرَّحِيمِ\s*/, '').trim();
    }
    return text;
  };

  // Kelime Listesini Oluştur
  const getWordsOfVerse = (ayah: Ayah): string[] => {
    const cleaned = cleanVerseText(ayah.text, ayah.numberInSurah);
    return cleaned.split(' ').filter(Boolean);
  };

  // Suredeki tüm kelimelerin sıralı anahtarlarını üretir
  const getAllWordKeys = (): string[] => {
    const keys: string[] = [];
    ayahs.forEach((a) => {
      const words = getWordsOfVerse(a);
      words.forEach((_, wIdx) => {
        keys.push(`${a.numberInSurah}-${wIdx}`);
      });
    });
    return keys;
  };

  // Belirli bir ayetin tüm kelime anahtarlarını üretir
  const getVerseWordKeys = (verseNum: number): string[] => {
    const ayah = ayahs.find((a) => a.numberInSurah === verseNum);
    if (!ayah) return [];
    const words = getWordsOfVerse(ayah);
    return words.map((_, idx) => `${verseNum}-${idx}`);
  };

  // Tüm Sureyi Seç / Seçimi Kaldır
  const selectAllVerses = () => {
    const allKeys = getAllWordKeys();
    if (allKeys.length === 0) return;
    const isAllSelected = allKeys.length === selectedWordKeys.length && allKeys.every((k) => selectedWordKeys.includes(k));
    if (isAllSelected) {
      setSelectedWordKeys([]);
      setLastClickedKey(null);
    } else {
      setSelectedWordKeys(allKeys);
      setLastClickedKey(allKeys[allKeys.length - 1] || null);
    }
  };

  // Son tıklanan ayet numarası (Shift + Tık için)
  const lastClickedVerseNumRef = useRef<number | null>(null);

  // Tüm Ayeti Seçme / Kaldırma (Tek Tıkla Güvenilir Toggle & Shift+Tık Aralık Seçimi)
  const toggleEntireVerse = (verseNum: number, isShiftKey = false) => {
    if (hasDraggedRef.current) return;
    const verseKeys = getVerseWordKeys(verseNum);
    if (verseKeys.length === 0) return;

    if (isShiftKey && lastClickedVerseNumRef.current !== null) {
      const startV = Math.min(lastClickedVerseNumRef.current, verseNum);
      const endV = Math.max(lastClickedVerseNumRef.current, verseNum);
      const rangeKeys: string[] = [];
      for (let v = startV; v <= endV; v++) {
        rangeKeys.push(...getVerseWordKeys(v));
      }
      setSelectedWordKeys((prev) => Array.from(new Set([...prev, ...rangeKeys])));
      lastClickedVerseNumRef.current = verseNum;
      setLastClickedKey(rangeKeys[rangeKeys.length - 1] || null);
      return;
    }

    lastClickedVerseNumRef.current = verseNum;
    setSelectedWordKeys((prev) => {
      const isEntireVerseSelected = verseKeys.every((k) => prev.includes(k));
      if (isEntireVerseSelected) {
        return prev.filter((k) => !verseKeys.includes(k));
      } else {
        return Array.from(new Set([...prev, ...verseKeys]));
      }
    });
    setLastClickedKey(verseKeys[verseKeys.length - 1] || null);
  };

  // Ayet Numarası Rozeti üzerinde fareye basıldığında (Sürükleme Hazırlığı)
  const handleVerseBadgeMouseDown = (verseNum: number, e: React.MouseEvent) => {
    if (e.button !== 0) return; // Sadece sol tık
    e.stopPropagation();

    const verseKeys = getVerseWordKeys(verseNum);
    if (verseKeys.length === 0) return;

    const isEntireVerseSelected = verseKeys.every((k) => selectedWordKeys.includes(k));

    isDraggingRef.current = true;
    dragTypeRef.current = 'verse';
    dragStartVerseRef.current = verseNum;
    hasDraggedRef.current = false;
    initialSelectionRef.current = [...selectedWordKeys];
    dragModeRef.current = isEntireVerseSelected ? 'deselect' : 'select';
  };

  // Ayet Kutusunun veya Ayet Rozetinin üzerine gelindiğinde (Sürükleme ve Geri Gelindiğinde Kaldırma)
  const handleVerseMouseEnter = (verseNum: number) => {
    if (!isDraggingRef.current) return;
    hasDraggedRef.current = true;

    if (dragTypeRef.current === 'verse' && dragStartVerseRef.current !== null) {
      const startV = dragStartVerseRef.current;
      const minV = Math.min(startV, verseNum);
      const maxV = Math.max(startV, verseNum);

      // Başlangıç ayeti ile şu anki ayet arasındaki tüm ayetlerin kelimeleri
      const currentRangeKeys: string[] = [];
      for (let v = minV; v <= maxV; v++) {
        currentRangeKeys.push(...getVerseWordKeys(v));
      }

      if (dragModeRef.current === 'select') {
        // İleri giderken seçer, geri geldiğinde aralık daraldığı için geride kalan ayetler ANINDA SEÇİMDEN KALKAR
        setSelectedWordKeys(Array.from(new Set([...initialSelectionRef.current, ...currentRangeKeys])));
      } else if (dragModeRef.current === 'deselect') {
        // Seçili olanların üzerinden geçildiğinde veya geri gelindiğinde kaldırır
        setSelectedWordKeys(initialSelectionRef.current.filter((k) => !currentRangeKeys.includes(k)));
      }
    }
  };

  // Kelime Mouse Down (Sürükleme Başlangıcı veya Tek Tık)
  const handleWordMouseDown = (verseNum: number, wordIdx: number, e: React.MouseEvent) => {
    if (e.button !== 0) return; // Sadece sol tık
    e.preventDefault();
    e.stopPropagation();

    const clickedKey = `${verseNum}-${wordIdx}`;

    // Shift tuşu ile aralık seçimi
    if (e.shiftKey && lastClickedKey) {
      const allWordKeys = getAllWordKeys();
      const i1 = allWordKeys.indexOf(lastClickedKey);
      const i2 = allWordKeys.indexOf(clickedKey);
      if (i1 !== -1 && i2 !== -1) {
        const min = Math.min(i1, i2);
        const max = Math.max(i1, i2);
        setSelectedWordKeys(allWordKeys.slice(min, max + 1));
        isDraggingRef.current = false;
        return;
      }
    }

    isDraggingRef.current = true;
    dragTypeRef.current = 'word';
    dragStartKeyRef.current = clickedKey;
    hasDraggedRef.current = false;
    initialSelectionRef.current = [...selectedWordKeys];

    const isAlreadySelected = selectedWordKeys.includes(clickedKey);

    if (isAlreadySelected) {
      // Seçili kelimeye tıklandığında: Kaldırma (deselect) modu başlar
      dragModeRef.current = 'deselect';
      setSelectedWordKeys((prev) => prev.filter((k) => k !== clickedKey));
      setLastClickedKey(null);
    } else {
      // Seçili olmayan kelimeye tıklandığında: Seçme (select) modu başlar
      dragModeRef.current = 'select';
      setSelectedWordKeys((prev) => Array.from(new Set([...prev, clickedKey])));
      setLastClickedKey(clickedKey);
    }
  };

  // Fare kelime üzerine geldiğinde (Sürükleme ve Geri Gelindiğinde Kaldırma)
  const handleWordMouseEnter = (verseNum: number, wordIdx: number) => {
    if (!isDraggingRef.current) return;
    hasDraggedRef.current = true;
    const currentKey = `${verseNum}-${wordIdx}`;

    if (dragTypeRef.current === 'word' && dragStartKeyRef.current) {
      const allKeys = getAllWordKeys();
      const startIdx = allKeys.indexOf(dragStartKeyRef.current);
      const currIdx = allKeys.indexOf(currentKey);

      if (startIdx !== -1 && currIdx !== -1) {
        const minIdx = Math.min(startIdx, currIdx);
        const maxIdx = Math.max(startIdx, currIdx);
        const currentRangeKeys = allKeys.slice(minIdx, maxIdx + 1);

        if (dragModeRef.current === 'select') {
          // İleri gittikçe seçer, geriye doğru döndüğünde aralık daralır ve geride kalan kelimeler ANINDA SEÇİMDEN KALKAR
          setSelectedWordKeys(Array.from(new Set([...initialSelectionRef.current, ...currentRangeKeys])));
          setLastClickedKey(currentKey);
        } else if (dragModeRef.current === 'deselect') {
          // Seçili kelimeler üzerinden geçildikçe kaldırır
          setSelectedWordKeys(initialSelectionRef.current.filter((k) => !currentRangeKeys.includes(k)));
        }
      }
    } else if (dragTypeRef.current === 'verse') {
      // Ayet sürükleme modundaysa bu kelimenin ayetine göre aralığı güncelle
      handleVerseMouseEnter(verseNum);
    }
  };

  // Boş alana tıklandığında seçimi temizleme
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (hasDraggedRef.current || e.button !== 0) return;
    const target = e.target as HTMLElement | null;
    if (!target) return;

    if (
      target.closest('.word-span') ||
      target.closest('.verse-num-badge') ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('a')
    ) {
      return;
    }

    if (selectedWordKeys.length > 0) {
      setSelectedWordKeys([]);
      setLastClickedKey(null);
    }
  };

  // Kelime tıklama
  const handleWordClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Sağ tık: Analiz Modalını Aç
  const handleWordContextMenu = (verseNum: number, wordIdx: number, e: React.MouseEvent) => {
    e.preventDefault();
    const key = `${verseNum}-${wordIdx}`;
    if (!selectedWordKeys.includes(key)) {
      setSelectedWordKeys([key]);
      setLastClickedKey(key);
    }
    setModalVerseNum(verseNum);
    setModalOpen(true);
  };

  // Oynatma Segmentlerini Hazırla
  const prepareSegments = () => {
    if (selectedWordKeys.length === 0) return [];

    const verseMap = new Map<number, number[]>();
    selectedWordKeys.forEach((key) => {
      const [vStr, wStr] = key.split('-');
      const v = parseInt(vStr, 10);
      const w = parseInt(wStr, 10);
      if (!verseMap.has(v)) verseMap.set(v, []);
      verseMap.get(v)!.push(w);
    });

    const segments: Array<{
      verseNum: number;
      startRatio: number;
      endRatio: number;
      wordKeys: string[];
    }> = [];

    const sortedVerses = Array.from(verseMap.keys()).sort((a, b) => a - b);
    sortedVerses.forEach((vNum) => {
      const ayah = ayahs.find((a) => a.numberInSurah === vNum);
      if (!ayah) return;
      const totalWords = getWordsOfVerse(ayah).length;
      const indices = verseMap.get(vNum)!.sort((a, b) => a - b);
      const startIdx = indices[0];
      const endIdx = indices[indices.length - 1];

      segments.push({
        verseNum: vNum,
        startRatio: startIdx / totalWords,
        endRatio: (endIdx + 1) / totalWords,
        wordKeys: indices.map((idx) => `${vNum}-${idx}`)
      });
    });

    return segments;
  };

  // Segment Çal
  const playSegmentAt = (index: number) => {
    if (segmentAdvanceTimerRef.current !== null) {
      clearTimeout(segmentAdvanceTimerRef.current);
      segmentAdvanceTimerRef.current = null;
    }
    const requestId = ++playRequestRef.current;
    const segments = segmentsRef.current;
    if (index >= segments.length) {
      currentLoopRef.current += 1;
      setCurrentLoop(currentLoopRef.current);
      const target = targetLoopRef.current;
      if (target !== 'infinite' && currentLoopRef.current > target) {
        stopAudio();
        return;
      }
      segmentIdxRef.current = 0;
      playSegmentAt(0);
      return;
    }

    segmentIdxRef.current = index;
    const seg = segments[index];
    const ayah = ayahs.find((a) => a.numberInSurah === seg.verseNum);
    if (!ayah || !ayah.audio) {
      logEzber('VERSE_MISSING_AUDIO','error',{surah:currentSurah,verse:seg.verseNum});
      stopAudio();
      return;
    }

    setActiveVerseNum(seg.verseNum);
    logEzber('SEGMENT_START','info',{surah:currentSurah,verse:seg.verseNum,detail:{segment:index + 1}});

    const player = audioRef.current;
    player.src = ayah.audio;
    player.playbackRate = playbackSpeedRef.current;

    player.onloadedmetadata = () => {
      if (requestId !== playRequestRef.current) return;
      const dur = player.duration;
      const startTime = dur * seg.startRatio;
      const endTime = dur * seg.endRatio;
      player.currentTime = startTime;
      player.playbackRate = playbackSpeedRef.current;

      player.play().catch((err) => {
        if (requestId !== playRequestRef.current) return;
        logEzber('SEGMENT_PLAY_REJECTED','error',{surah:currentSurah,verse:seg.verseNum,detail:{name:ezberErrorName(err)}});
        stopAudio();
      });

      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = setInterval(() => {
        if (requestId !== playRequestRef.current) { clearInterval(tickIntervalRef.current); return; }
        const cur = player.currentTime;

        // Vurgu hesaplama
        const segDuration = endTime - startTime;
        if (segDuration > 0 && seg.wordKeys.length > 0) {
          const ratio = Math.max(0, Math.min(1, (cur - startTime) / segDuration));
          const wIdx = Math.min(seg.wordKeys.length - 1, Math.floor(ratio * seg.wordKeys.length));
          setActiveWordKey(seg.wordKeys[wIdx] || null);
        }

        if (cur >= endTime || player.ended) {
          player.pause();
          clearInterval(tickIntervalRef.current);
          setActiveWordKey(null);
          logEzber('SEGMENT_END','info',{surah:currentSurah,verse:seg.verseNum,detail:{segment:index + 1}});
          segmentAdvanceTimerRef.current = setTimeout(() => {
            segmentAdvanceTimerRef.current = null;
            if (requestId !== playRequestRef.current) return;
            playSegmentAt(index + 1);
          }, 150);
        }
      }, 30);
    };

    player.onerror = (e) => {
      if (requestId !== playRequestRef.current) return;
      logEzber('SEGMENT_PLAY_ERROR','error',{surah:currentSurah,verse:seg.verseNum,detail:{mediaCode:player.error?.code ?? 0,readyState:player.readyState,networkState:player.networkState}});
      console.warn('Ayet ses oynatma hatası:', e);
      stopAudio();
    };
  };

  // Oynatmayı Başlat (Seçili Alan)
  const startPlayback = () => {
    const segments = prepareSegments();
    if (segments.length === 0) return;

    stopAudio();
    segmentsRef.current = segments;
    segmentIdxRef.current = 0;
    currentLoopRef.current = 1;
    targetLoopRef.current = targetLoopCount;
    setCurrentLoop(1);
    setIsPlaying(true);
    playSegmentAt(0);
  };

  // Tüm Sureyi Dinle
  const startFullSurah = () => {
    if (ayahs.length === 0) return;
    stopAudio();

    const allKeys: string[] = [];
    const segments = ayahs.map((ayah) => {
      const words = getWordsOfVerse(ayah);
      const keys = words.map((_, idx) => `${ayah.numberInSurah}-${idx}`);
      allKeys.push(...keys);
      return {
        verseNum: ayah.numberInSurah,
        startRatio: 0,
        endRatio: 1,
        wordKeys: keys
      };
    });

    setSelectedWordKeys(allKeys);
    segmentsRef.current = segments;
    segmentIdxRef.current = 0;
    currentLoopRef.current = 1;
    targetLoopRef.current = targetLoopCount;
    setCurrentLoop(1);
    setIsPlaying(true);
    playSegmentAt(0);
  };

  // Durdur
  const stopAudio = () => {
    ++playRequestRef.current;
    if (segmentAdvanceTimerRef.current !== null) {
      clearTimeout(segmentAdvanceTimerRef.current);
      segmentAdvanceTimerRef.current = null;
    }
    setIsPlaying(false);
    clearInterval(tickIntervalRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      audioRef.current.onloadedmetadata = null;
      audioRef.current.onerror = null;
    }
    setActiveVerseNum(null);
    setActiveWordKey(null);
    setCurrentLoop(0);
  };

  useEffect(() => {
    // Stop a possibly hidden desktop Ezber player before SadaQuran starts.
    const onRadioStart = () => stopAudio();
    window.addEventListener('hayat-rehberi:radio-start', onRadioStart);
    return () => window.removeEventListener('hayat-rehberi:radio-start', onRadioStart);
  }, []);

  // Modal İçin Seçili Kelimeleri Bul
  const getSelectedWordsData = (): WordData[] => {
    if (!wbwList || wbwList.length === 0) return [];
    const result: WordData[] = [];
    selectedWordKeys.forEach((key) => {
      const [vStr, wStr] = key.split('-');
      const v = parseInt(vStr, 10);
      const wIdx = parseInt(wStr, 10);
      const verseObj = wbwList.find((item) => item.verse_number === v);
      if (verseObj && verseObj.words) {
        const words = verseObj.words.filter((item) => item.char_type_name !== 'end');
        if (words[wIdx]) {
          result.push({ ...words[wIdx], verseNumber: v });
        }
      }
    });
    return result;
  };

  const getSelectedArabicText = (): string => {
    const list: string[] = [];
    ayahs.forEach((a) => {
      const words = getWordsOfVerse(a);
      words.forEach((w, idx) => {
        if (selectedWordKeys.includes(`${a.numberInSurah}-${idx}`)) {
          list.push(w);
        }
      });
    });
    return list.join(' ');
  };

  const currentSurahMeta = SURAHS.find((s) => s.id === currentSurah);
  const selectedVerseTranslation = translations.find((t) => t.numberInSurah === modalVerseNum)?.text || '';

  const getSelectedVerseSummary = (): string | undefined => {
    if (selectedWordKeys.length === 0) return undefined;
    const verses = Array.from(
      new Set(selectedWordKeys.map((k) => parseInt(k.split('-')[0], 10)).filter((n) => !isNaN(n)))
    ).sort((a, b) => a - b);
    if (verses.length === 0) return undefined;
    if (verses.length === 1) return `${verses[0]}. Ayet`;
    return `${verses[0]}-${verses[verses.length - 1]}. Ayet`;
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Sol Panel: Sure Metni (%75) */}
      <section
        className={`lg:col-span-8 xl:col-span-9 rounded-2xl shadow-sm border p-5 md:p-7 flex flex-col transition-colors ${
          isDark
            ? 'bg-[#211d16] border-[#3a3226] text-[#f1ecdd]'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        
        {/* Sure Seçimi, Meal Aç/Kapat, Hızlı Erişim ve Ses Kayıt Asistanı */}
        <div className={`relative z-20 flex flex-col justify-between items-stretch mb-5 pb-4 border-b gap-3.5 ${
          isDark ? 'border-[#3a3226]' : 'border-slate-100'
        }`}>
          <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
            <SurahSearchSelect
                    linkTab="ezber"
              selectedSurahId={currentSurah}
              onSelectSurah={(id) => {
                stopAudio();
                setCurrentSurah(id);
                setSelectedWordKeys([]);
              }}
              buttonLabelPrefix="Sure Seç:"
              theme={isDark ? 'dark' : 'light'}
            />

            {/* Meal Göster/Gizle Butonu (Varsayılan Olarak Gizli) */}
            <button
              type="button"
              onClick={() => setShowTranslations(!showTranslations)}
              className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                showTranslations
                  ? isDark
                    ? 'bg-[#2a241b] text-amber-200 border-amber-700/50'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                  : isDark
                  ? 'bg-[#181510] text-[#b9b09a] border-[#3a3226] hover:bg-[#2a241b]'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title={showTranslations ? 'Ayet meallerini gizle' : 'Ayet meallerini göster'}
            >
              {showTranslations ? (
                <>
                  <EyeOff className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                  <span>Meali Gizle</span>
                </>
              ) : (
                <>
                  <Eye className={`w-4 h-4 ${isDark ? 'text-[#8c826e]' : 'text-slate-500'}`} />
                  <span>Meali Göster</span>
                </>
              )}
            </button>

            {/* Tüm Sureyi Seç / Kaldır Butonu */}
            <button
              type="button"
              onClick={selectAllVerses}
              className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-semibold flex items-center justify-center transition-all cursor-pointer border ${
                selectedWordKeys.length > 0 && selectedWordKeys.length === getAllWordKeys().length
                  ? isDark
                    ? 'bg-[#1c3630] text-[#3fb996] border-[#3fb996] shadow-xs'
                    : 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                  : isDark
                  ? 'bg-[#181510] text-[#3fb996] border-[#3a3226] hover:bg-[#1c3630]'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
              title="Suredeki tüm ayet ve kelimeleri tek tıkla seç veya seçimi kaldır"
            >
              <span>
                {selectedWordKeys.length > 0 && selectedWordKeys.length === getAllWordKeys().length
                  ? 'Seçimi Kaldır'
                  : 'Tümünü Seç'}
              </span>
            </button>

            <QuickSurahBookmarks
              currentSurahId={currentSurah}
              onSelectSurah={(id) => {
                stopAudio();
                setCurrentSurah(id);
                setSelectedWordKeys([]);
              }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>

          {/* Ses Kayıt ve Son 5 Kaydı Dinleme Çubuğu */}
          <EzberVoiceRecorder
            surahId={currentSurah}
            surahName={currentSurahMeta?.name || `Sure ${currentSurah}`}
            selectedVerseInfo={getSelectedVerseSummary()}
            theme={isDark ? 'dark' : 'light'}
            onStopExternalAudio={stopAudio}
            onRecordingStateChange={(rec, blind) => setIsBlindRecording(rec && blind)}
          />
        </div>

        {/* Yükleniyor Durumu */}
        {loading && (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <div className={`w-10 h-10 border-4 ${isDark ? 'border-[#3fb996]' : 'border-emerald-600'} border-t-transparent rounded-full animate-spin`}></div>
            <p className={`text-sm font-medium ${isDark ? 'text-[#b9b09a]' : 'text-slate-500'}`}>Sure ve ses verileri yükleniyor...</p>
          </div>
        )}

        {/* Sabit Besmele (Fatiha ve Sure Başları) */}
        {!loading && (
          <div
            className={`text-center py-4 mb-4 rounded-2xl border ${
              isDark
                ? 'bg-[#1c3630]/40 border-[#3fb996]/20'
                : 'bg-emerald-50/50 border-emerald-100'
            }`}
          >
            <p className={`text-2xl md:text-3xl font-arabic tracking-wide ${selectedFont} ${
              isDark ? 'text-[#3fb996]' : 'text-emerald-800'
            }`}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </p>
          </div>
        )}

        {/* Ayetler Listesi */}
        {!loading && (
          <div 
            onClick={handleBackgroundClick}
            className={`space-y-4 overflow-y-auto max-h-[72vh] pr-2 font-arabic text-right dir-rtl ${selectedFont} custom-scrollbar select-none cursor-default`}
            style={{ fontSize: `${fontSize}rem` }}
          >
            {ayahs.map((ayah) => {
              const vNum = ayah.numberInSurah;
              const words = getWordsOfVerse(ayah);
              const isActiveVerse = activeVerseNum === vNum;
              const isEntireVerseSelected = words.length > 0 && words.every((_, idx) => selectedWordKeys.includes(`${vNum}-${idx}`));

              return (
                <div
                  key={vNum}
                  id={`desktop-verse-${vNum}`}
                  onClick={handleBackgroundClick}
                  onMouseEnter={() => handleVerseMouseEnter(vNum)}
                  className={`verse-box border rounded-xl p-4 md:p-5 relative transition-all cursor-default ${
                    isDark
                      ? isActiveVerse
                        ? 'active-verse-box border-[#3fb996] bg-[#1a2f29]'
                        : 'bg-[#1e1a14] border-[#3a3226] hover:border-[#4d4233]'
                      : isActiveVerse
                      ? 'active-verse-box'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    
                    {/* Ayet Numarası Rozeti (Tıklayınca veya basıp sürükleyince tüm ayeti seçer/kaldırır) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEntireVerse(vNum, e.shiftKey);
                      }}
                      onMouseDown={(e) => handleVerseBadgeMouseDown(vNum, e)}
                      onMouseEnter={() => handleVerseMouseEnter(vNum)}
                      className={`verse-num-badge inline-flex items-center justify-center w-8 h-8 text-xs font-bold rounded-full border select-none cursor-pointer transition-colors shadow-xs ${
                        isEntireVerseSelected
                          ? isDark
                            ? 'bg-[#3fb996] text-[#181510] border-[#3fb996] ring-2 ring-[#3fb996]/40'
                            : 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-400/40'
                          : isDark
                          ? 'bg-[#181510] text-[#3fb996] border-[#3a3226] hover:bg-[#211d16]'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                      }`}
                      title="Tıklayın: Ayetin tamamını seç / kaldır | Shift+Tık: Ayet aralığı seç | Tutup sürükleyin: Çoklu ayet seç"
                    >
                      {vNum}
                    </button>

                    {/* Ayet Metni ve Kelimeler */}
                    <p className={`leading-[2.3] flex-1 text-right dir-rtl select-none break-words transition-all duration-300 ${
                      isDark ? 'text-[#f1ecdd]' : 'text-slate-900'
                    } ${isBlindRecording ? 'blur-md hover:blur-xs' : ''}`}>
                      {words.map((word, wIdx) => {
                        const key = `${vNum}-${wIdx}`;
                        const isSelected = selectedWordKeys.includes(key);
                        const isPlayingWord = activeWordKey === key;

                        return (
                          <span
                            key={wIdx}
                            onMouseDown={(e) => handleWordMouseDown(vNum, wIdx, e)}
                            onMouseEnter={() => handleWordMouseEnter(vNum, wIdx)}
                            onClick={handleWordClick}
                            onContextMenu={(e) => handleWordContextMenu(vNum, wIdx, e)}
                            className={`word-span ${isSelected ? 'word-selected' : ''} ${
                              isPlayingWord ? 'active-word' : ''
                            }`}
                            title="Tutup Sürükleyin: Seç / Kaldır | Tıklayın: Seç / Kaldır | Shift+Tık: Aralık | Sağ Tık: Tahlil"
                          >
                            {word}
                          </span>
                        );
                      })}
                    </p>
                  </div>

                  {/* Türkçe Meal Önizlemesi (İsteğe Bağlı) */}
                  {showTranslations && (
                    <div className={`mt-3 pt-2.5 border-t text-xs md:text-sm dir-ltr text-left font-sans font-normal animate-in fade-in duration-200 ${
                      isDark
                        ? 'border-[#3a3226] text-[#b9b09a]'
                        : 'border-slate-100 text-slate-500'
                    }`}>
                      <span className={`font-semibold mr-1 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>{vNum}. Ayet Meali: </span>
                      {translations.find((t) => t.numberInSurah === vNum)?.text || ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Sağ Panel: Kontrol Mekanizması (%25) */}
      <section
        className={`lg:col-span-4 xl:col-span-3 rounded-2xl shadow-sm border p-5 md:p-6 flex flex-col justify-between h-fit sticky top-24 transition-colors ${
          isDark
            ? 'bg-[#211d16] border-[#3a3226] text-[#f1ecdd]'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div>
          <h2 className={`text-lg font-bold mb-4 pb-3 border-b flex items-center justify-between ${
            isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-100'
          }`}>
            <span>Döngü ve Ses Kontrolü</span>
            <Volume2 className={`w-5 h-5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-600'}`} />
          </h2>

          {/* Hat (Yazı Tipi) Seçimi */}
          <div className="mb-4">
            <label htmlFor="desktop-font-select" className={`block text-xs font-semibold mb-1.5 flex items-center gap-1.5 ${
              isDark ? 'text-[#b9b09a]' : 'text-slate-600'
            }`}>
              <Type className={`w-3.5 h-3.5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-600'}`} />
              <span>Kur'an Hattı (Yazı Tipi):</span>
            </label>
            <select
              id="desktop-font-select"
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
              className={`w-full border rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                isDark
                  ? 'bg-[#181510] border-[#3a3226] text-[#f1ecdd]'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              <option value="font-amiri">Amiri (Klasik Medine Hattı)</option>
              <option value="font-scheherazade">Scheherazade (Zarif Hat)</option>
              <option value="font-lateef">Lateef (Mushaf Hattı)</option>
            </select>
          </div>

          {/* Hafız Seçimi */}
          <div className="mb-4">
            <label htmlFor="desktop-reciter-select" className={`block text-xs font-semibold mb-1.5 flex items-center gap-1.5 ${
              isDark ? 'text-[#b9b09a]' : 'text-slate-600'
            }`}>
              <Volume2 className={`w-3.5 h-3.5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-600'}`} />
              <span>Hafız (Seslendirme):</span>
            </label>
            <select
              id="desktop-reciter-select"
              value={selectedReciter}
              onChange={(e) => setSelectedReciter(e.target.value)}
              className={`w-full border rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                isDark
                  ? 'bg-[#181510] border-[#3a3226] text-[#f1ecdd]'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              {RECITERS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Seçim Bilgisi */}
          <div className={`border rounded-xl p-3.5 mb-4 ${
            isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                isDark ? 'text-[#8c826e]' : 'text-slate-400'
              }`}>
                Seçili Aralık
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllVerses}
                  className={`text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                    isDark ? 'text-[#3fb996] hover:text-[#52d2ae]' : 'text-emerald-700 hover:text-emerald-800'
                  }`}
                  title="Tüm sureyi seç veya kaldır"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{selectedWordKeys.length === getAllWordKeys().length && selectedWordKeys.length > 0 ? 'Kaldır' : 'Tümünü Seç'}</span>
                </button>
                {selectedWordKeys.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWordKeys([]);
                      setLastClickedKey(null);
                    }}
                    className="text-[11px] font-medium text-rose-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
                    title="Tüm seçimi temizle"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Temizle</span>
                  </button>
                )}
              </div>
            </div>
            <div className={`text-xs font-semibold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
              {selectedWordKeys.length > 0 ? (
                <span>{selectedWordKeys.length} kelime seçildi</span>
              ) : (
                <span className={`font-normal ${isDark ? 'text-[#8c826e]' : 'text-slate-500'}`}>Henüz kelime veya ayet seçilmedi</span>
              )}
            </div>
          </div>

          {/* Döngü Sayısı Seçimi */}
          <div className="mb-4">
            <label htmlFor="desktop-loop-count" className={`block text-xs font-semibold mb-1.5 flex items-center gap-1.5 ${
              isDark ? 'text-[#b9b09a]' : 'text-slate-600'
            }`}>
              <RefreshCw className={`w-3.5 h-3.5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-600'}`} />
              <span>Döngü Sayısı (Tekrar):</span>
            </label>
            <select
              id="desktop-loop-count"
              value={targetLoopCount}
              onChange={(e) => {
                const val = e.target.value;
                setTargetLoopCount(val === 'infinite' ? 'infinite' : Number(val));
              }}
              className={`w-full border rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                isDark
                  ? 'bg-[#181510] border-[#3a3226] text-[#f1ecdd]'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              <option value="1">1 Kez Oku (Tekrar Yok)</option>
              <option value="3">3 Kez Tekrar Et</option>
              <option value="5">5 Kez Tekrar Et</option>
              <option value="10">10 Kez Tekrar Et</option>
              <option value="infinite">Sürekli Döngü (Sonsuz)</option>
            </select>
          </div>

          {/* Ayet Yazı Boyutu Slider */}
          <div className={`mb-4 border rounded-xl p-3.5 ${
            isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="desktop-font-size-range" className={`text-xs font-semibold ${
                isDark ? 'text-[#f1ecdd]' : 'text-slate-700'
              }`}>
                Yazı Boyutu:
              </label>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                isDark ? 'bg-[#1c3630] text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {fontSize.toFixed(2)}rem
              </span>
            </div>
            <input
              type="range"
              id="desktop-font-size-range"
              min="1.2"
              max="4.5"
              step="0.05"
              value={fontSize}
              onChange={(e) => setFontSize(parseFloat(e.target.value))}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-600 ${
                isDark ? 'bg-[#2a241b]' : 'bg-slate-200'
              }`}
            />
            <div className={`flex justify-between text-[10px] mt-1 ${
              isDark ? 'text-[#8c826e]' : 'text-slate-400'
            }`}>
              <span>Küçük</span>
              <span>Normal</span>
              <span>Büyük</span>
            </div>
          </div>

          {/* Okuma Hızı Slider */}
          <div className={`mb-4 border rounded-xl p-3.5 ${
            isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="desktop-speed-range" className={`text-xs font-semibold ${
                isDark ? 'text-[#f1ecdd]' : 'text-slate-700'
              }`}>
                Okuma Hızı:
              </label>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                isDark ? 'bg-[#1c3630] text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {playbackSpeed.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              id="desktop-speed-range"
              min="0.5"
              max="5.0"
              step="0.25"
              value={playbackSpeed}
              onChange={(e) => updatePlaybackSpeed(parseFloat(e.target.value))}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-600 ${
                isDark ? 'bg-[#2a241b]' : 'bg-slate-200'
              }`}
            />
            <div className="grid grid-cols-5 gap-1 mt-2">
              {[1.0, 1.5, 2.0, 3.0, 5.0].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => updatePlaybackSpeed(spd)}
                  className={`text-[11px] py-1 rounded border transition-colors cursor-pointer ${
                    playbackSpeed === spd
                      ? isDark
                        ? 'bg-[#1c3630] text-[#3fb996] font-bold border-[#3fb996]'
                        : 'bg-emerald-600 text-white font-bold border-emerald-600'
                      : isDark
                      ? 'bg-[#211d16] text-[#b9b09a] border-[#3a3226] hover:bg-[#2a241b]'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Mevcut Döngü Sayacı */}
          <div className={`border rounded-xl p-3 mb-5 flex justify-between items-center ${
            isDark
              ? 'bg-[#1c3630]/60 border-[#3fb996]/30 text-[#f1ecdd]'
              : 'bg-emerald-50/80 border border-emerald-200'
          }`}>
            <span className={`text-xs font-semibold ${isDark ? 'text-[#f1ecdd]' : 'text-emerald-950'}`}>Mevcut Döngü:</span>
            <span className={`text-sm font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>
              {currentLoop} / {targetLoopCount === 'infinite' ? '∞' : targetLoopCount}
            </span>
          </div>

          {/* Oynat & Durdur Butonları */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-desktop-play"
                disabled={selectedWordKeys.length === 0 || isPlaying}
                onClick={startPlayback}
                className="py-3 bg-emerald-600 text-white font-semibold rounded-xl shadow-sm hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-xs md:text-sm cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Seçimi Çal</span>
              </button>
              <button
                id="btn-desktop-stop"
                disabled={!isPlaying}
                onClick={stopAudio}
                className="py-3 bg-rose-600 text-white font-semibold rounded-xl shadow-sm hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-xs md:text-sm cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Durdur</span>
              </button>
            </div>

            <button
              id="btn-desktop-play-surah"
              disabled={isPlaying}
              onClick={startFullSurah}
              className={`w-full py-2.5 font-semibold rounded-xl border shadow-2xs hover:shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-xs cursor-pointer ${
                isDark
                  ? 'bg-[#1c3630] hover:bg-[#23453d] text-[#3fb996] border-[#3fb996]/40'
                  : 'bg-emerald-100/70 hover:bg-emerald-200/70 text-emerald-950 border-emerald-300/80'
              }`}
            >
              <Layers className={`w-3.5 h-3.5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} />
              <span>Tüm Sureyi Baştan Sona Dinle</span>
            </button>
          </div>

        </div>
      </section>

      {/* Yapay Zekâ Analiz Modalı */}
      <AnalysisModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedWords={getSelectedWordsData()}
        selectedText={getSelectedArabicText()}
        verseNumber={modalVerseNum}
        verseTranslation={selectedVerseTranslation}
        surahName={currentSurahMeta?.name || ''}
      />
    </div>
  );
};
