import React, { useState, useEffect, useMemo, useRef } from 'react';
import { navigateToAppHash } from '../utils/appNavigation';
import { bindAudioMediaSession } from '../utils/mediaSessionCoordinator';
import { AppRouteLink } from './AppRouteLink';
import { basicInfoHash, resolveBasicInfoKey } from '../utils/elifbaLinks';
import { useThemeSync, broadcastThemeChange } from '../utils/themeSync';
import { QuranMatrixModule } from './QuranMatrixLab/QuranMatrixModule';
import {
  LETTERS,
  WORD_BANK,
  SIFAT_ZATI,
  SIFAT_SUBUTI,
  TEMEL_DATA_1,
  TEMEL_DATA_2,
  TEMEL_DATA_3,
  TOTAL_DUA_COUNT,
  KALIN,
  baseConsonant,
  harekeForm,
  harekeRead,
  buildPositions,
  buildHarekeSet,
  buildCombos,
  ElifbaLetter,
  BankWord
} from '../data/elifbaData';
import {
  BookOpen,
  Sparkles,
  ChevronDown,
  Check,
  X,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Volume2,
  Moon,
  Sun,
  Layers,
  Palette,
  Monitor,
  Smartphone,
  Link2,
  Play,
  Pause,
  Square,
  Upload,
  Shield
} from 'lucide-react';
import { TecvidSection } from './TecvidSection';

export type ElifbaTheme = 'dark' | 'emerald';
export type ElifbaTab = 'harfler' | 'hece' | 'temel' | 'tecvid' | 'matrix';
export type ElifbaViewMode = 'desktop' | 'mobile';

interface ElifBaModeProps {
  targetTab?: ElifbaTab;
  targetLetterName?: string;
  targetAccordionKey?: string;
  targetTecvidLesson?: number;
  targetMatrixStage?: number;
  targetTimestamp?: number;
}

// URL Hash ve Query Parametrelerini Ayrıştıran Yardımcı Fonksiyon
function parseElifbaUrl(): {
  tab?: ElifbaTab;
  letterName?: string;
  heceStep?: number;
  wordLevel?: 'kolay' | 'orta' | 'zor';
  accordionKey?: string;
  tecvidLesson?: number;
  matrixStage?: number;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const hash = window.location.hash.replace(/^#/, '').trim();
    const urlParams = new URLSearchParams(window.location.search);

    // Hash tabanlı: #elifba/... veya #tecvid/...
    if (hash.startsWith('elifba') || hash.startsWith('tecvid')) {
      const parts = hash.split('/').map((p) => decodeURIComponent(p).trim());
      if (parts[0] === 'tecvid') {
        const lesson = parts[1] ? parseInt(parts[1].replace('ders-', ''), 10) : undefined;
        return { tab: 'tecvid', tecvidLesson: isNaN(lesson as any) ? undefined : lesson };
      }

      const subtab = parts[1] as ElifbaTab;
      const subItem = parts[2];
      const subItemExtra = parts[3];

      if (subtab === 'harfler') {
        return { tab: 'harfler', letterName: subItem };
      }
      if (subtab === 'hece') {
        let step = 0;
        if (subItem && subItem.startsWith('step-')) {
          step = parseInt(subItem.replace('step-', ''), 10) || 0;
        } else if (subItem && !isNaN(parseInt(subItem, 10))) {
          step = parseInt(subItem, 10);
        }
        const lvl =
          subItemExtra === 'orta' || subItemExtra === 'zor' || subItemExtra === 'kolay'
            ? subItemExtra
            : undefined;
        return { tab: 'hece', heceStep: step, wordLevel: lvl };
      }
      if (subtab === 'temel') {
        return { tab: 'temel', accordionKey: subItem };
      }
      if (subtab === 'tecvid') {
        const lesson = subItem ? parseInt(subItem.replace('ders-', ''), 10) : undefined;
        return { tab: 'tecvid', tecvidLesson: isNaN(lesson as any) ? undefined : lesson };
      }
      if (subtab === 'matrix') {
        const stage = subItem
          ? parseInt(subItem.replace('asama-', '').replace('stage-', ''), 10)
          : undefined;
        return { tab: 'matrix', matrixStage: isNaN(stage as any) ? undefined : stage };
      }
      if (subtab) {
        return { tab: subtab };
      }
    }

    // Query parametre tabanlı: ?tab=elifba&subtab=hece&step=2
    const mode = urlParams.get('mode') || urlParams.get('tab') || urlParams.get('page');
    if (mode === 'elifba' || mode === 'elif-ba' || mode === 'tecvid') {
      const subtab = (urlParams.get('subtab') || (mode === 'tecvid' ? 'tecvid' : 'harfler')) as ElifbaTab;
      const letter = urlParams.get('letter') || urlParams.get('harf') || undefined;
      const stepStr = urlParams.get('step') || urlParams.get('adim');
      const step = stepStr !== null ? parseInt(stepStr, 10) : undefined;
      const level = urlParams.get('level') as ('kolay' | 'orta' | 'zor') | undefined;
      const item = urlParams.get('item') || urlParams.get('dua') || urlParams.get('accordion') || undefined;
      const lessonStr = urlParams.get('lesson') || urlParams.get('ders');
      const lesson = lessonStr !== null ? parseInt(lessonStr, 10) : undefined;
      const stageStr = urlParams.get('stage') || urlParams.get('asama');
      const stage = stageStr !== null ? parseInt(stageStr, 10) : undefined;

      return {
        tab: subtab,
        letterName: letter,
        heceStep: step,
        wordLevel: level,
        accordionKey: item,
        tecvidLesson: lesson,
        matrixStage: stage
      };
    }
  } catch {}
  return null;
}

export const ElifBaMode: React.FC<ElifBaModeProps> = ({
  targetTab,
  targetLetterName,
  targetAccordionKey,
  targetTecvidLesson,
  targetMatrixStage,
  targetTimestamp
}) => {
  // İlk Açılışta URL ve Kaydedilmiş Son Oturum (Kaldığı Yerden Devam Etme)
  const initialUrl = useMemo(() => parseElifbaUrl(), []);
  const savedSession = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('elifba_saved_session') || '{}');
    } catch {
      return {};
    }
  }, []);

  // 1. Tema Modu (Orijinal Koyu Tasarım vs Zümrüt Yeşili Tema)
  const [themeMode, setThemeMode] = useState<ElifbaTheme>(() => {
    try {
      const saved = localStorage.getItem('elifba_theme_mode') as ElifbaTheme;
      if (saved === 'dark' || saved === 'emerald') return saved;
    } catch {
      // ignore
    }
    return 'dark'; // Varsayılan: Kullanıcının orijinal siyah/koyu tasarımı
  });

  useThemeSync(themeMode === 'dark', (newIsDark) => {
    setThemeMode(newIsDark ? 'dark' : 'emerald');
  });

  const toggleTheme = (mode: ElifbaTheme) => {
    setThemeMode(mode);
    broadcastThemeChange(mode === 'dark');
  };

  // 1.1 Görünüm Modu (Masaüstü Modu vs Mobil Modu)
  const [viewMode, setViewMode] = useState<ElifbaViewMode>(() => {
    try {
      const saved = localStorage.getItem('elifba_view_mode') as ElifbaViewMode;
      if (saved === 'desktop' || saved === 'mobile') return saved;
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'mobile';
    }
    return 'desktop';
  });

  const toggleViewMode = (mode: ElifbaViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('elifba_view_mode', mode);
    } catch {
      // ignore
    }
  };

  // 1.2 Arapça Harf ve Metin Boyutu Ölçeği (Slider: %100 - %450)
  const [arabicScalePercent, setArabicScalePercent] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('elifba_arabic_scale'));
      if (saved && saved >= 80 && saved <= 450) return saved;
    } catch {
      // ignore
    }
    return 100;
  });

  // 2. Alt Sekmeler (Harfler, Hece, Temel, Tecvid, Matrix)
  const [activeTab, setActiveTab] = useState<ElifbaTab>(() => {
    if (targetTab) return targetTab;
    if (initialUrl?.tab) return initialUrl.tab;
    if (savedSession?.activeTab) return savedSession.activeTab;
    return 'harfler';
  });

  // 3. İlerleme & Hafıza Durumu (localStorage)
  const [state, setState] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('elifba_state') || '{}');
    } catch {
      return {};
    }
  });

  const saveState = (newState: Record<string, boolean>) => {
    setState(newState);
    try {
      localStorage.setItem('elifba_state', JSON.stringify(newState));
    } catch {
      // ignore
    }
  };

  // 4. İlk Açılış Onayı Modalı
  const [showIntroModal, setShowIntroModal] = useState<boolean>(() => {
    try {
      const s = JSON.parse(localStorage.getItem('elifba_state') || '{}');
      return !s.consentGiven;
    } catch {
      return true;
    }
  });

  const handleDismissIntro = () => {
    const updated = { ...state, consentGiven: true };
    saveState(updated);
    setShowIntroModal(false);
  };

  // 5. İlerleme Yüzdesi
  const progressPercent = useMemo(() => {
    const totalLetters = LETTERS.length;
    const doneLetters = LETTERS.filter((l) => state['letter_' + l.name]).length;
    const duaKeys = Object.keys(state).filter((k) => k.startsWith('dua_'));
    const duaDone = duaKeys.filter((k) => state[k]).length;
    const pct = Math.round(
      ((doneLetters / totalLetters) * 0.5 + (TOTAL_DUA_COUNT ? (duaDone / TOTAL_DUA_COUNT) * 0.5 : 0)) * 100
    );
    return Math.min(100, Math.max(0, pct));
  }, [state]);

  // 6. Harf Detay Modalı Durumu
  const [selectedLetter, setSelectedLetter] = useState<ElifbaLetter | null>(() => {
    const lName = targetLetterName || initialUrl?.letterName || savedSession?.selectedLetterName;
    if (lName) {
      return LETTERS.find((l) => l.name.toLowerCase() === lName.toLowerCase()) || null;
    }
    return null;
  });

  const isLetterDone = (letterName: string) => !!state['letter_' + letterName];

  const toggleLetterDone = (letterName: string) => {
    const key = 'letter_' + letterName;
    const updated = { ...state, [key]: !state[key] };
    saveState(updated);
  };

  // 7. Hece Adımları (0: Tek harf, 1: İki harfli, 2: Üç harfli, 3: Kelime, 4: Test)
  const [heceStep, setHeceStep] = useState<number>(() => {
    if (typeof initialUrl?.heceStep === 'number') return initialUrl.heceStep;
    if (typeof savedSession?.heceStep === 'number') return savedSession.heceStep;
    return 0;
  });
  const [wordLevel, setWordLevel] = useState<'kolay' | 'orta' | 'zor'>(() => {
    if (initialUrl?.wordLevel) return initialUrl.wordLevel;
    if (savedSession?.wordLevel) return savedSession.wordLevel;
    return 'kolay';
  });

  // Flip-card'ların açık/kapalı durumu (anahtar: id/kod)
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 8. Quiz Testi Durumu
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizAnswerFeedback, setQuizAnswerFeedback] = useState<string>('Doğru okunuşu seç');

  const currentQuizWord = useMemo(() => {
    const list = WORD_BANK;
    return list[quizIndex % list.length];
  }, [quizIndex]);

  const quizOptions = useMemo(() => {
    if (!currentQuizWord) return [];
    const correct = currentQuizWord.rd;
    const others = WORD_BANK.filter((w) => w.rd !== correct)
      .map((w) => w.rd)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [correct, ...others].sort(() => Math.random() - 0.5);
  }, [currentQuizWord]);

  const handleSelectQuizOption = (option: string) => {
    if (quizSelectedOption) return; // zaten cevaplandı
    setQuizSelectedOption(option);
    if (option === currentQuizWord.rd) {
      setQuizAnswerFeedback('Doğru! 🎉 Maşallah');
    } else {
      setQuizAnswerFeedback('Doğrusu: ' + currentQuizWord.rd);
    }
  };

  const handleNextQuiz = () => {
    setQuizSelectedOption(null);
    setQuizAnswerFeedback('Doğru okunuşu seç');
    setQuizIndex((prev) => prev + 1);
  };

  // 9. Sıfat Detay Kartları Açık/Kapalı
  const [openSifatlar, setOpenSifatlar] = useState<Record<string, boolean>>({});
  const toggleSifat = (ar: string) => {
    setOpenSifatlar((prev) => ({ ...prev, [ar]: !prev[ar] }));
  };

  // 10. Akordiyon Açık/Kapalı Durumu (Temel Bilgiler)
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>(() => {
    const initial = resolveBasicInfoKey(targetAccordionKey || initialUrl?.accordionKey);
    return initial ? { [initial]: true } : {};
  });
  const pendingBasicScrollRef = useRef<string | null>(resolveBasicInfoKey(targetAccordionKey || initialUrl?.accordionKey) || null);
  const skipUrlWriteRef = useRef(false);

  // Sadece Zırh Duası İçin Özel Ses Oynatıcı Durumu
  const zirhAudioRef = useRef<HTMLAudioElement | null>(null);
  const [zirhIsPlaying, setZirhIsPlaying] = useState<boolean>(false);
  const [zirhIsPaused, setZirhIsPaused] = useState<boolean>(false);
  const [zirhCurrentTime, setZirhCurrentTime] = useState<number>(0);
  const [zirhDuration, setZirhDuration] = useState<number>(0);
  const [zirhPlaybackRate, setZirhPlaybackRate] = useState<number>(1);
  const [zirhCustomAudioUrl, setZirhCustomAudioUrl] = useState<string | null>(null);
  const [zirhCustomFileName, setZirhCustomFileName] = useState<string | null>(null);
  // Kullanıcının önceden kaydettiği ses IndexedDB'de kalır; ancak
  // varsayılan Zırh Duası kaydını otomatik olarak değiştirmez.
  const [zirhUseCustomAudio, setZirhUseCustomAudio] = useState(false);
  const [zirhAudioError, setZirhAudioError] = useState<string | null>(null);
  const zirhObjectUrlRef = useRef<string | null>(null);
  const zirhMediaCleanupRef = useRef<(() => void) | null>(null);

  // IndexedDB'den kullanıcı tarafından yüklenmiş Zırh Duası ses dosyasını yükle
  useEffect(() => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) return;
    try {
      const req = window.indexedDB.open('hayat_rehberi_zirh_audio_db', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('audioFiles')) {
          db.createObjectStore('audioFiles');
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('audioFiles')) return;
        const tx = db.transaction('audioFiles', 'readonly');
        const store = tx.objectStore('audioFiles');
        const getReq = store.get('zirh_duasi_blob');
        getReq.onsuccess = () => {
          const record = getReq.result;
          if (record && record.blob) {
            const objUrl = URL.createObjectURL(record.blob);
            if (zirhObjectUrlRef.current) URL.revokeObjectURL(zirhObjectUrlRef.current);
            zirhObjectUrlRef.current = objUrl;
            setZirhCustomAudioUrl(objUrl);
            setZirhCustomFileName(record.name || 'zirh_duasi.mp3');
          }
        };
      };
    } catch {
      // ignore
    }
  }, []);

  const handleZirhPlayPause = (defaultAudioUrl?: string) => {
    if (zirhIsPlaying) {
      // Duraklat
      setZirhIsPlaying(false);
      setZirhIsPaused(true);
      if (zirhAudioRef.current && !zirhAudioRef.current.paused) {
        zirhAudioRef.current.pause();
      }
      return;
    }

    if (zirhIsPaused) {
      // Devam Et
      setZirhIsPlaying(true);
      setZirhIsPaused(false);
      if (zirhAudioRef.current && zirhAudioRef.current.src) {
        zirhAudioRef.current.play().catch((error: unknown) => {
          if (error instanceof Error && error.name === 'AbortError') return;
          setZirhIsPlaying(false);
          setZirhIsPaused(true);
          setZirhAudioError('Devam ettirilemedi. Tekrar deneyin.');
        });
      }
      return;
    }

    // Sıfırdan Oynat
    const targetUrl = zirhUseCustomAudio && zirhCustomAudioUrl
      ? zirhCustomAudioUrl
      : (defaultAudioUrl || import.meta.env.BASE_URL + 'audio/dualar/zirh_duasi.mp3');
    if (!zirhAudioRef.current) {
      zirhAudioRef.current = new Audio();
      const player = zirhAudioRef.current;
      zirhMediaCleanupRef.current = bindAudioMediaSession(player, () => ({
        title: 'Zırh Duası',
        artist: 'Dua Dinleme',
        album: 'Hayat Rehberi · Elif-Bâ'
      }), {
        onPlay: () => { void player.play().catch(() => {}); },
        onPause: () => player.pause(),
        onStop: () => { player.pause(); player.currentTime = 0; }
      });
    }
    const audio = zirhAudioRef.current;
    audio.pause();
    audio.src = targetUrl;
    audio.playbackRate = zirhPlaybackRate;

    audio.onloadedmetadata = () => {
      setZirhDuration(audio.duration || 0);
      setZirhAudioError(null);
    };
    audio.ontimeupdate = () => {
      setZirhCurrentTime(audio.currentTime || 0);
    };
    audio.onplay = () => {
      setZirhIsPlaying(true);
      setZirhIsPaused(false);
      setZirhAudioError(null);
    };
    audio.onpause = () => {
      setZirhIsPlaying(false);
      if (!audio.ended && audio.currentTime > 0) setZirhIsPaused(true);
    };
    audio.onended = () => {
      setZirhIsPlaying(false);
      setZirhIsPaused(false);
      setZirhCurrentTime(0);
    };
    audio.onerror = () => {
      setZirhIsPlaying(false);
      setZirhIsPaused(false);
      setZirhAudioError('Ses kaydı açılamadı. Bağlantınızı kontrol edin veya MP3 kaydını yeniden seçin.');
    };

    setZirhIsPaused(false);
    audio.play().catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      setZirhIsPlaying(false);
      setZirhIsPaused(false);
      setZirhAudioError('Ses başlatılamadı. Tarayıcı izinlerini ve MP3 dosyasını kontrol edin.');
    });
  };

  const handleZirhStop = () => {
    setZirhIsPlaying(false);
    setZirhIsPaused(false);
    setZirhCurrentTime(0);
    setZirhAudioError(null);
    if (zirhAudioRef.current) {
      zirhAudioRef.current.pause();
      zirhAudioRef.current.currentTime = 0;
      zirhAudioRef.current.onended = null;
      zirhAudioRef.current.onerror = null;
      zirhAudioRef.current.onplay = null;
      zirhAudioRef.current.onpause = null;
    }
  };

  useEffect(() => {
    return () => {
      if (zirhObjectUrlRef.current) URL.revokeObjectURL(zirhObjectUrlRef.current);
      zirhMediaCleanupRef.current?.();
      zirhMediaCleanupRef.current = null;
      if (zirhAudioRef.current) {
        zirhAudioRef.current.pause();
      }
    };
  }, []);

  const formatAudioTime = (sec: number) => {
    if (!sec || isNaN(sec) || !isFinite(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => prev[key] ? {} : { [key]: true });
  };

  const toggleDuaDone = (key: string) => {
    const updated = { ...state, [key]: !state[key] };
    saveState(updated);
  };

  const [currentTecvidLesson, setCurrentTecvidLesson] = useState<number | undefined>(() => {
    if (typeof targetTecvidLesson === 'number') return targetTecvidLesson;
    if (typeof initialUrl?.tecvidLesson === 'number') return initialUrl.tecvidLesson;
    if (typeof savedSession?.tecvidLesson === 'number') return savedSession.tecvidLesson;
    return undefined;
  });

  const [currentMatrixStage, setCurrentMatrixStage] = useState<number | undefined>(() => {
    if (typeof targetMatrixStage === 'number') return targetMatrixStage;
    if (typeof initialUrl?.matrixStage === 'number') return initialUrl.matrixStage;
    if (typeof savedSession?.matrixStage === 'number') return savedSession.matrixStage;
    return undefined;
  });

  // 11. Bildirim Toast'ı (Bağlantı Kopyalandı)
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  const copyDirectLink = (customHash: string, title?: string) => {
    if (typeof window === 'undefined') return;
    const cleanHash = customHash.replace(/^#/, '');
    const url = `${window.location.origin}${window.location.pathname}#${cleanHash}`;
    if (!navigator.clipboard?.writeText) { window.prompt('Bağlantıyı kopyalayın:', url); return; }
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopiedToast(title ? `"${title}" bağlantısı kopyalandı! 🔗` : 'Bağlantı kopyalandı! 🔗');
        setTimeout(() => setCopiedToast(null), 2400);
      })
      .catch(() => window.prompt('Bağlantıyı kopyalayın:', url));
  };

  // Geri/ileri hareketi iç state'i güncellerken URL'yi tekrar yazıp geçmişi bozma.
  const initialUrlSyncRef = useRef(true);

  // URL Hash & Kaldığı Yerden Devam Etme (Local Storage) Senkronizasyonu
  useEffect(() => {
    // 1. Session kaydı (Kişinin kaldığı yeri hatırla)
    try {
      localStorage.setItem(
        'elifba_saved_session',
        JSON.stringify({
          activeTab,
          heceStep,
          wordLevel,
          selectedLetterName: selectedLetter?.name,
          openAccordions,
          tecvidLesson: currentTecvidLesson,
          matrixStage: currentMatrixStage
        })
      );
    } catch {}

    let newHash = `#elifba/${activeTab}`;
    if (activeTab === 'harfler' && selectedLetter) newHash += `/${encodeURIComponent(selectedLetter.name)}`;
    if (activeTab === 'hece') newHash += `/step-${heceStep}${heceStep === 3 ? `/${wordLevel}` : ''}`;
    if (activeTab === 'temel') {
      const opened = Object.keys(openAccordions).find(key => openAccordions[key]);
      if (opened) newHash = basicInfoHash(opened);
    }
    if (activeTab === 'tecvid' && typeof currentTecvidLesson === 'number') newHash += `/ders-${currentTecvidLesson}`;
    if (activeTab === 'matrix' && typeof currentMatrixStage === 'number') newHash += `/asama-${currentMatrixStage}`;
    if (skipUrlWriteRef.current) skipUrlWriteRef.current = false;
    else if (initialUrlSyncRef.current) {
      if (window.location.hash === '#elifba' || window.location.hash === '#') navigateToAppHash(newHash, 'replace');
    } else if (window.location.hash.startsWith('#elifba') || window.location.hash.startsWith('#tecvid')) {
      navigateToAppHash(newHash);
    }
    initialUrlSyncRef.current = false;
  }, [
    activeTab,
    heceStep,
    wordLevel,
    selectedLetter,
    openAccordions,
    currentTecvidLesson,
    currentMatrixStage
  ]);

  // Tarayıcı İleri/Geri ve Dıştan Link Tıklamalarını (Hashchange) Dinleme
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseElifbaUrl();
      if (parsed) skipUrlWriteRef.current = true;
      if (!parsed) return;
      if (parsed.tab) setActiveTab(parsed.tab);
      if (typeof parsed.heceStep === 'number') setHeceStep(parsed.heceStep);
      if (parsed.wordLevel) setWordLevel(parsed.wordLevel);
      if (parsed.letterName) {
        const found = LETTERS.find((l) => l.name.toLowerCase() === parsed.letterName?.toLowerCase());
        if (found) setSelectedLetter(found);
      } else if (parsed.tab === 'harfler' && !parsed.letterName) {
        setSelectedLetter(null);
      }
      if (parsed.tab === 'temel') {
        const key = resolveBasicInfoKey(parsed.accordionKey);
        setOpenAccordions(key ? { [key]: true } : {});
        pendingBasicScrollRef.current = key || null;
      }
      if (typeof parsed.tecvidLesson === 'number') setCurrentTecvidLesson(parsed.tecvidLesson);
      if (typeof parsed.matrixStage === 'number') setCurrentMatrixStage(parsed.matrixStage);
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  // Arama motorundan doğrudan ilgili alt sekmeye, harfe veya duaya yönlendirme
  useEffect(() => {
    if (targetTab) {
      setActiveTab(targetTab);
    }
    if (targetLetterName) {
      const found = LETTERS.find((l) => l.name.toLowerCase() === targetLetterName.toLowerCase());
      if (found) {
        setActiveTab('harfler');
        setSelectedLetter(found);
        setTimeout(() => {
          const el = document.getElementById(`letter-btn-${found.name}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-4', 'ring-emerald-400', 'transition-all', 'duration-500');
            setTimeout(() => {
              el.classList.remove('ring-4', 'ring-emerald-400');
            }, 2000);
          }
        }, 200);
      }
    }
    if (targetAccordionKey) {
      const key = resolveBasicInfoKey(targetAccordionKey);
      if (key) {
        setActiveTab('temel');
        setOpenAccordions({ [key]: true });
        pendingBasicScrollRef.current = key;
      }
    }
    if (typeof targetTecvidLesson === 'number') {
      setActiveTab('tecvid');
      setCurrentTecvidLesson(targetTecvidLesson);
    }
    if (typeof targetMatrixStage === 'number') {
      setActiveTab('matrix');
      setCurrentMatrixStage(targetMatrixStage);
    }
  }, [
    targetTab,
    targetLetterName,
    targetAccordionKey,
    targetTecvidLesson,
    targetMatrixStage,
    targetTimestamp
  ]);

  // On direct URL load and browser back, reveal and scroll after rendering.
  useEffect(() => {
    if (activeTab !== 'temel' || !pendingBasicScrollRef.current) return;
    const key = pendingBasicScrollRef.current;
    if (!openAccordions[key]) return;
    const timer = window.setTimeout(() => {
      const el = document.getElementById(`section-${key}`);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('ring-2', 'ring-emerald-500');
      window.setTimeout(() => el.classList.remove('ring-2', 'ring-emerald-500'), 2000);
      pendingBasicScrollRef.current = null;
    }, 160);
    return () => window.clearTimeout(timer);
  }, [activeTab, openAccordions]);

  // Tema renk sınıfları
  const isDark = themeMode === 'dark';

  return (
    <div
      className={`min-h-screen transition-colors duration-200 elifba-container relative ${
        isDark ? 'bg-[#181510] text-[#f1ecdd]' : 'bg-[#FBF9F5] text-slate-800'
      }`}
      style={{ '--elifba-scale': (arabicScalePercent / 100).toString() } as React.CSSProperties}
    >
      <style>{`
        .elifba-container .font-amiri,
        .elifba-container .font-quran {
          zoom: var(--elifba-scale, 1);
        }
      `}</style>

      {/* 0. BAĞLANTI KOPYALANDI BİLDİRİM TOAST'I */}
      {copiedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150 border border-emerald-500">
          <Link2 className="w-4 h-4" />
          <span>{copiedToast}</span>
        </div>
      )}
      {/* SADE KONTROL PANELİ (GEÇİŞLER, İLERLEME ÇUBUĞU VE TEMA/GÖRÜNÜM AYARLARI BİRDİR) */}
      <div
        className={`sticky top-[61px] z-30 border-b backdrop-blur-md transition-colors ${
          isDark
            ? 'bg-[#211d16]/95 border-[#3a3226] text-[#f1ecdd]'
            : 'bg-white/95 border-emerald-900/10 text-slate-800'
        }`}
      >
        <div className={`${viewMode === 'desktop' ? 'max-w-[1440px] md:flex-row md:items-center' : 'max-w-[620px] flex-col'} mx-auto px-4 sm:px-6 py-3 flex flex-col justify-between gap-3.5`}>
          
          {/* Başlık (Sol Taraf - H2 Bold Siyah) */}
          <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'} whitespace-nowrap`}>
            Elif-Bâ ve Tecvid
          </h2>

          {/* Sekmeler (Yatay Kaydırılabilir Modern Şerit) */}
          <div className={`relative flex items-center w-full ${viewMode === 'desktop' ? 'md:w-auto' : ''}`}>
            <div className={`flex items-center gap-1.5 overflow-x-auto scroll-smooth pb-2 md:pb-0 w-full [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${viewMode === 'desktop' ? 'md:w-auto -mx-4 px-4 md:mx-0 md:px-0' : '-mx-4 px-4'}`}>
              <AppRouteLink href={`#elifba/harfler`} navigate={() => setActiveTab('harfler')}
                id="tab-btn-harfler"
                
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                  activeTab === 'harfler'
                    ? isDark
                      ? 'bg-[#3fb996] text-[#181510] shadow-sm'
                      : 'bg-emerald-700 text-white shadow-sm'
                    : isDark
                    ? 'text-[#b9b09a] hover:bg-[#3a3226]/60 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Harfler & Harekeler
              </AppRouteLink>

              <AppRouteLink href={`#elifba/hece`} navigate={() => setActiveTab('hece')}
                id="tab-btn-hece"
                
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                  activeTab === 'hece'
                    ? isDark
                      ? 'bg-[#3fb996] text-[#181510] shadow-sm'
                      : 'bg-emerald-700 text-white shadow-sm'
                    : isDark
                    ? 'text-[#b9b09a] hover:bg-[#3a3226]/60 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Heceleme ve Kelimeler
              </AppRouteLink>

              <AppRouteLink href={`#elifba/temel`} navigate={() => setActiveTab('temel')}
                id="tab-btn-temel"
                
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                  activeTab === 'temel'
                    ? isDark
                      ? 'bg-[#3fb996] text-[#181510] shadow-sm'
                      : 'bg-emerald-700 text-white shadow-sm'
                    : isDark
                    ? 'text-[#b9b09a] hover:bg-[#3a3226]/60 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Temel Bilgiler
              </AppRouteLink>

              <AppRouteLink href={`#elifba/tecvid`} navigate={() => setActiveTab('tecvid')}
                id="tab-btn-tecvid"
                
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 flex-shrink-0 ${
                  activeTab === 'tecvid'
                    ? isDark
                      ? 'bg-[#3fb996] text-[#181510] shadow-sm'
                      : 'bg-emerald-700 text-white shadow-sm'
                    : isDark
                    ? 'text-[#b9b09a] hover:bg-[#3a3226]/60 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>Tecvid</span>
              </AppRouteLink>

              <AppRouteLink href={`#elifba/matrix`} navigate={() => setActiveTab('matrix')}
                id="tab-btn-matrix"
                
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 flex-shrink-0 ${
                  activeTab === 'matrix'
                    ? isDark
                      ? 'bg-[#3fb996] text-[#181510] shadow-sm'
                      : 'bg-emerald-700 text-white shadow-sm'
                    : isDark
                    ? 'text-[#b9b09a] hover:bg-[#3a3226]/60 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>⚡ Yeni Nesil Matrixli Öğrenme Metodu</span>
              </AppRouteLink>
            </div>
            
            {/* Küçük Kaydırma Göstergesi / Oku */}
            <div className={`absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none flex items-center h-8 pl-6 pr-2 bg-gradient-to-l text-xs font-bold transition-all ${
              viewMode === 'desktop' ? 'md:hidden' : ''
            } ${
              isDark 
                ? 'from-[#211d16] via-[#211d16]/80 to-transparent text-[#3fb996]' 
                : 'from-white via-white/80 to-transparent text-emerald-800'
            }`}>
              <span className="animate-pulse mr-1 text-[9px] tracking-wider opacity-80">KAYDIR</span>
              <span className="animate-bounce font-extrabold text-xs">→</span>
            </div>
          </div>

          {/* Sağ ve Orta Bölüm: İlerleme Çubuğu + Tema/Görünüm Kontrolleri (Mobil cihazlarda alt alta binmeden tek satırda yan yana durur) */}
          <div className={`flex items-center justify-between gap-4 w-full ${viewMode === 'desktop' ? 'md:w-auto md:flex-1 md:justify-end' : ''}`}>
            
            {/* İlerleme Çubuğu */}
            <div className={`flex items-center gap-2 flex-1 ${viewMode === 'desktop' ? 'md:max-w-sm md:mr-4' : ''}`}>
              <span className={`text-xs font-bold whitespace-nowrap ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>
                İlerleme: %{progressPercent}
              </span>
              <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#3a3226]' : 'bg-slate-200'}`}>
                <div
                  className={`h-full transition-all duration-500 rounded-full ${isDark ? 'bg-[#3fb996]' : 'bg-emerald-600'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Tema ve Görünüm Kontrolleri */}
            <div className="flex items-center gap-2 flex-shrink-0">
              
              {/* Arapça Yazı Boyutu Ayar İmleci (Slider) */}
              <div
                className={`flex items-center p-1.5 px-2 rounded-lg border ${
                  isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-100 border-slate-200'
                }`}
                title="Arapça Harf ve Metin Boyutu"
              >
                <input
                  id="elifba-font-scale-slider"
                  type="range"
                  min="80"
                  max="450"
                  step="10"
                  value={arabicScalePercent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setArabicScalePercent(val);
                    try {
                      localStorage.setItem('elifba_arabic_scale', String(val));
                    } catch {}
                  }}
                  className="w-16 sm:w-24 h-1.5 bg-slate-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Görünüm Modu Seçici */}
              <div className={`flex items-center p-1 rounded-lg border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-100 border-slate-200'}`}>
                <button
                  id="btn-elifba-desktop-view"
                  onClick={() => toggleViewMode('desktop')}
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    viewMode === 'desktop'
                      ? isDark
                        ? 'bg-[#1c3630] text-[#3fb996] border border-[#3fb996]/40'
                        : 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                      : isDark
                      ? 'text-[#b9b09a] hover:text-[#f1ecdd]'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Masaüstü Görünümü"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>

                <button
                  id="btn-elifba-mobile-view"
                  onClick={() => toggleViewMode('mobile')}
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    viewMode === 'mobile'
                      ? isDark
                        ? 'bg-[#1c3630] text-[#3fb996] border border-[#3fb996]/40'
                        : 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                      : isDark
                      ? 'text-[#b9b09a] hover:text-[#f1ecdd]'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Mobil Görünümü"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tema Seçici */}
              <div className={`flex items-center p-1 rounded-lg border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-100 border-slate-200'}`}>
                <button
                  id="btn-theme-dark-original"
                  onClick={() => toggleTheme('dark')}
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    isDark
                      ? 'bg-[#1c3630] text-[#3fb996] border border-[#3fb996]/40'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Koyu Tema"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>

                <button
                  id="btn-theme-emerald-app"
                  onClick={() => toggleTheme('emerald')}
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    !isDark
                      ? 'bg-white text-emerald-800 shadow-xs border border-emerald-300'
                      : 'text-[#b9b09a] hover:text-[#f1ecdd]'
                  }`}
                  title="Açık Tema"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* 4. ANA İÇERİK ALANI */}
      <main className={`${viewMode === 'desktop' ? 'max-w-[960px]' : 'max-w-[620px]'} mx-auto p-4 sm:p-6 pb-24`}>
        {/* SEKME 1: HARFLER & HAREKELER */}
        {activeTab === 'harfler' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Harekeler Bilgi Kartı */}
            <div
              className={`rounded-2xl p-5 border shadow-sm ${
                isDark
                  ? 'bg-[#211d16] border-[#3a3226]'
                  : 'bg-white border-slate-200'
              }`}
            >
              <h2
                className={`text-base sm:text-lg font-bold mb-4 ${
                  isDark ? 'text-[#3fb996]' : 'text-emerald-800'
                }`}
              >
                Harekeler (Ses İşaretleri)
              </h2>

              <div className="overflow-x-auto rounded-xl border border-slate-200/40">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className={isDark ? 'bg-[#1c3630] text-[#3fb996]' : 'bg-emerald-50 text-emerald-900'}>
                      <th className="p-3 font-semibold text-center w-24">İşaret</th>
                      <th className="p-3 font-semibold">Adı</th>
                      <th className="p-3 font-semibold">Görevi / Verdiği Ses</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#3a3226]' : 'divide-slate-100'}`}>
                    <tr>
                      <td className={`p-3 text-center font-amiri text-2xl dir-rtl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>بَ</td>
                      <td className="p-3 font-medium">Üstün (Fetha)</td>
                      <td className="p-3 opacity-90">"e / a" sesi verir</td>
                    </tr>
                    <tr>
                      <td className={`p-3 text-center font-amiri text-2xl dir-rtl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>بِ</td>
                      <td className="p-3 font-medium">Esre (Kesre)</td>
                      <td className="p-3 opacity-90">"i / ı" sesi verir</td>
                    </tr>
                    <tr>
                      <td className={`p-3 text-center font-amiri text-2xl dir-rtl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>بُ</td>
                      <td className="p-3 font-medium">Ötre (Damme)</td>
                      <td className="p-3 opacity-90">"ü / u" sesi verir</td>
                    </tr>
                    <tr>
                      <td className={`p-3 text-center font-amiri text-2xl dir-rtl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>بْ</td>
                      <td className="p-3 font-medium">Cezm (Sükun)</td>
                      <td className="p-3 opacity-90">Harfi harekesiz, sessiz okutur</td>
                    </tr>
                    <tr>
                      <td className={`p-3 text-center font-amiri text-2xl dir-rtl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>بّ</td>
                      <td className="p-3 font-medium">Şedde</td>
                      <td className="p-3 opacity-90">Harfi iki kere, kalın vurgu ile okutur</td>
                    </tr>
                    <tr>
                      <td className={`p-3 text-center font-amiri text-2xl dir-rtl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>بً بٍ بٌ</td>
                      <td className="p-3 font-medium">Tenvin</td>
                      <td className="p-3 opacity-90">Sonuna "n" sesi ekler (en / in / ün gibi)</td>
                    </tr>
                    <tr>
                      <td className={`p-3 text-center font-amiri text-2xl dir-rtl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>ا و ي</td>
                      <td className="p-3 font-medium">Med Harfleri</td>
                      <td className="p-3 opacity-90">Kendinden önceki harekeyi uzatır (elif=â, vav=û, ye=î)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div
                className={`mt-3 p-3 rounded-xl text-xs flex items-start gap-2 ${
                  isDark
                    ? 'bg-[#1c3630]/60 border border-[#3fb996]/30 text-[#3fb996]'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                }`}
              >
                <span className="font-bold">Not:</span>
                <span>
                  <strong className={`font-amiri text-sm ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>ح خ ص ض ط ظ غ ق</strong> harfleri "kalın"
                  okunur (a, ı, u sesleriyle); diğer harfler "ince" okunur (e, i, ü sesleriyle).
                </span>
              </div>
            </div>

            {/* 29 Harf Grid'i */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2
                    className={`text-base sm:text-lg font-bold ${
                      isDark ? 'text-[#3fb996]' : 'text-emerald-800'
                    }`}
                  >
                    29 Harf (+ Hemze)
                  </h2>
                  <p
                    className={`text-xs ${
                      isDark ? 'text-[#b9b09a]' : 'text-slate-500'
                    }`}
                  >
                    Bir harfe dokunun; şeklini, adını, harekeli hallerini ve örnek kelimeler içindeki kullanımını görün.
                  </p>
                </div>
                <div
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isDark ? 'bg-[#1c3630] text-[#3fb996] border border-[#3fb996]/40' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {LETTERS.filter((l) => state['letter_' + l.name]).length} / {LETTERS.length} Öğrenildi
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2.5 sm:gap-3">
                {LETTERS.map((letter) => {
                  const done = isLetterDone(letter.name);
                  return (
                    <AppRouteLink href={`#elifba/harfler/${encodeURIComponent(letter.name)}`} navigate={() => setSelectedLetter(letter)}
                      key={letter.name}
                      id={`letter-btn-${letter.name}`}
                      
                      className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer relative group flex flex-col items-center justify-center ${
                        done
                          ? isDark
                            ? 'bg-[#1c3630] border-[#3fb996] text-[#3fb996]'
                            : 'bg-emerald-50 border-emerald-400 text-emerald-900'
                          : isDark
                          ? 'bg-[#211d16] border-[#3a3226] text-[#f1ecdd] hover:border-[#3fb996] hover:scale-[1.02]'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-500 hover:shadow-xs hover:scale-[1.02]'
                      }`}
                    >
                      {done && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                      <span className={`font-amiri text-4xl sm:text-5xl leading-tight block dir-rtl font-bold py-1 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>
                        {letter.ar}
                      </span>
                      <span
                        className={`text-xs font-bold mt-1.5 block ${
                          isDark ? 'text-[#b9b09a]' : 'text-slate-600'
                        }`}
                      >
                        {letter.name}
                      </span>
                    </AppRouteLink>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SEKME 2: HECE & KELİME ALIŞTIRMASI */}
        {activeTab === 'hece' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Stepper Butonları */}
            <div
              className={`p-1.5 rounded-2xl border flex items-center gap-1.5 overflow-x-auto scrollbar-none ${
                isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              {[
                { step: 0, label: '1) Tek Harf + Hareke' },
                { step: 1, label: '2) İki Harfli Heceler' },
                { step: 2, label: '3) Üç Harfli Heceler' },
                { step: 3, label: '4) Kelime Okuma' },
                { step: 4, label: '5) Küçük Test' }
              ].map((s) => (
                <button
                  key={s.step}
                  onClick={() => setHeceStep(s.step)}
                  className={`flex-1 min-w-[120px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap cursor-pointer ${
                    heceStep === s.step
                      ? isDark
                        ? 'bg-[#3fb996] text-[#181510] shadow-xs'
                        : 'bg-emerald-700 text-white shadow-xs'
                      : isDark
                      ? 'text-[#b9b09a] hover:text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* ADIM 0: TEK HARF + HAREKE (TÜM 29 HARF, 3 HAREKE İLE SAĞDAN SOLA TABLO) */}
            {heceStep === 0 && (
              <div
                className={`rounded-2xl p-5 border shadow-sm ${
                  isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'
                }`}
              >
                <div className="mb-4">
                  <h3
                    className={`text-base font-bold ${
                      isDark ? 'text-[#3fb996]' : 'text-emerald-800'
                    }`}
                  >
                    1) Tek Harf + 3 Hareke
                  </h3>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/40">
                  <table className="w-full text-center border-collapse" dir="rtl">
                    <thead>
                      <tr className={isDark ? 'bg-[#1c3630] text-[#3fb996]' : 'bg-emerald-50 text-emerald-900'}>
                        <th className="p-2.5 text-xs font-bold border-l border-b border-slate-200/20">Harf</th>
                        <th className="p-2.5 text-xs font-bold border-l border-b border-slate-200/20">Üstün (e/a)</th>
                        <th className="p-2.5 text-xs font-bold border-l border-b border-slate-200/20">Esre (i/ı)</th>
                        <th className="p-2.5 text-xs font-bold border-b border-slate-200/20">Ötre (ü/u)</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-[#3a3226]' : 'divide-slate-100'}`}>
                      {LETTERS.map((letter) => {
                        const ustunForm = harekeForm(letter, 'ustun');
                        const esreForm = harekeForm(letter, 'esre');
                        const otreForm = harekeForm(letter, 'otre');

                        const ustunRd = harekeRead(letter, 'ustun');
                        const esreRd = harekeRead(letter, 'esre');
                        const otreRd = harekeRead(letter, 'otre');

                        return (
                          <tr key={letter.name} className="hover:bg-emerald-500/5 transition-colors">
                            <td className={`p-3 sm:p-3.5 font-bold border-l border-slate-200/20 ${isDark ? 'bg-[#1c3630]/40' : 'bg-emerald-50/50'}`}>
                              <span className={`font-amiri text-3xl sm:text-4xl block font-bold dir-rtl ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>{letter.ar}</span>
                              <span className="text-[11px] block opacity-80 mt-1">{letter.name}</span>
                            </td>

                            {/* Üstün hücresi */}
                            <td
                              onClick={() => toggleFlip(`s0_${letter.name}_u`)}
                              className="p-3 sm:p-3.5 border-l border-slate-200/20 cursor-pointer select-none hover:bg-emerald-500/10 transition-colors"
                            >
                              <span className={`font-amiri text-3xl sm:text-4xl block font-bold dir-rtl ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'} ${flippedCards[`s0_${letter.name}_u`] ? 'opacity-40' : ''}`}>
                                {ustunForm}
                              </span>
                              {flippedCards[`s0_${letter.name}_u`] && (
                                <span className={`text-xs sm:text-sm font-bold block mt-1 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>
                                  {ustunRd}
                                </span>
                              )}
                            </td>

                            {/* Esre hücresi */}
                            <td
                              onClick={() => toggleFlip(`s0_${letter.name}_e`)}
                              className="p-3 sm:p-3.5 border-l border-slate-200/20 cursor-pointer select-none hover:bg-emerald-500/10 transition-colors"
                            >
                              <span className={`font-amiri text-3xl sm:text-4xl block font-bold dir-rtl ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'} ${flippedCards[`s0_${letter.name}_e`] ? 'opacity-40' : ''}`}>
                                {esreForm}
                              </span>
                              {flippedCards[`s0_${letter.name}_e`] && (
                                <span className={`text-xs sm:text-sm font-bold block mt-1 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>
                                  {esreRd}
                                </span>
                              )}
                            </td>

                            {/* Ötre hücresi */}
                            <td
                              onClick={() => toggleFlip(`s0_${letter.name}_o`)}
                              className="p-3 sm:p-3.5 cursor-pointer select-none hover:bg-emerald-500/10 transition-colors"
                            >
                              <span className={`font-amiri text-3xl sm:text-4xl block font-bold dir-rtl ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'} ${flippedCards[`s0_${letter.name}_o`] ? 'opacity-40' : ''}`}>
                                {otreForm}
                              </span>
                              {flippedCards[`s0_${letter.name}_o`] && (
                                <span className={`text-xs sm:text-sm font-bold block mt-1 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>
                                  {otreRd}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ADIM 1: İKİ HARFLİ HECELER (ELİF + HARF + CEZM) */}
            {heceStep === 1 && (
              <div
                className={`rounded-2xl p-5 border shadow-sm ${
                  isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'
                }`}
              >
                <div className="mb-4">
                  <h3
                    className={`text-base font-bold ${
                      isDark ? 'text-[#3fb996]' : 'text-emerald-800'
                    }`}
                  >
                    2) İki Harfli Heceler (Elif + Harf + Cezm)
                  </h3>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/40">
                  <table className="w-full text-center border-collapse" dir="rtl">
                    <thead>
                      <tr className={isDark ? 'bg-[#1c3630] text-[#3fb996]' : 'bg-emerald-50 text-emerald-900'}>
                        <th className="p-2.5 text-xs font-bold border-l border-b border-slate-200/20">Harf</th>
                        <th className="p-2.5 text-xs font-bold border-l border-b border-slate-200/20">Elif (Üstün) + Harf</th>
                        <th className="p-2.5 text-xs font-bold border-l border-b border-slate-200/20">Elif (Esre) + Harf</th>
                        <th className="p-2.5 text-xs font-bold border-b border-slate-200/20">Elif (Ötre) + Harf</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-[#3a3226]' : 'divide-slate-100'}`}>
                      {LETTERS.filter((l) => baseConsonant(l)).map((l) => {
                        const b = baseConsonant(l);
                        const kalin = KALIN.has(l.name);
                        const v = kalin ? { u: 'a', e: 'ı', o: 'u' } : { u: 'e', e: 'i', o: 'ü' };

                        const arU = 'أَ' + l.ar + '\u0652';
                        const arE = 'إِ' + l.ar + '\u0652';
                        const arO = 'أُ' + l.ar + '\u0652';

                        const rdU = v.u + b;
                        const rdE = v.e + b;
                        const rdO = v.o + b;

                        return (
                          <tr key={l.name} className="hover:bg-emerald-500/5 transition-colors">
                            <td className={`p-3 sm:p-3.5 font-bold border-l border-slate-200/20 ${isDark ? 'bg-[#1c3630]/40' : 'bg-emerald-50/50'}`}>
                              <span className={`font-amiri text-3xl sm:text-4xl block font-bold dir-rtl ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>{l.ar}</span>
                              <span className="text-[11px] block opacity-80 mt-1">{l.name}</span>
                            </td>

                            <td
                              onClick={() => toggleFlip(`s1_${l.name}_u`)}
                              className="p-3 sm:p-3.5 border-l border-slate-200/20 cursor-pointer select-none hover:bg-emerald-500/10 transition-colors"
                            >
                              <span className={`font-amiri text-3xl sm:text-4xl block font-bold dir-rtl ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'} ${flippedCards[`s1_${l.name}_u`] ? 'opacity-40' : ''}`}>
                                {arU}
                              </span>
                              {flippedCards[`s1_${l.name}_u`] && (
                                <span className={`text-xs sm:text-sm font-bold block mt-1 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>
                                  {rdU}
                                </span>
                              )}
                            </td>

                            <td
                              onClick={() => toggleFlip(`s1_${l.name}_e`)}
                              className="p-3 sm:p-3.5 border-l border-slate-200/20 cursor-pointer select-none hover:bg-emerald-500/10 transition-colors"
                            >
                              <span className={`font-amiri text-3xl sm:text-4xl block font-bold dir-rtl ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'} ${flippedCards[`s1_${l.name}_e`] ? 'opacity-40' : ''}`}>
                                {arE}
                              </span>
                              {flippedCards[`s1_${l.name}_e`] && (
                                <span className={`text-xs sm:text-sm font-bold block mt-1 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>
                                  {rdE}
                                </span>
                              )}
                            </td>

                            <td
                              onClick={() => toggleFlip(`s1_${l.name}_o`)}
                              className="p-3 sm:p-3.5 cursor-pointer select-none hover:bg-emerald-500/10 transition-colors"
                            >
                              <span className={`font-amiri text-3xl sm:text-4xl block font-bold dir-rtl ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'} ${flippedCards[`s1_${l.name}_o`] ? 'opacity-40' : ''}`}>
                                {arO}
                              </span>
                              {flippedCards[`s1_${l.name}_o`] && (
                                <span className={`text-xs sm:text-sm font-bold block mt-1 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>
                                  {rdO}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ADIM 2: ÜÇ HARFLİ HECELER (ELİF + HARF + TE) */}
            {heceStep === 2 && (
              <div
                className={`rounded-2xl p-5 border shadow-sm ${
                  isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'
                }`}
              >
                <div className="mb-4">
                  <h3
                    className={`text-base font-bold ${
                      isDark ? 'text-[#3fb996]' : 'text-emerald-800'
                    }`}
                  >
                    3) Üç Harfli Heceler (Elif + Harf + Te)
                  </h3>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/40">
                  <table className="w-full text-center border-collapse" dir="rtl">
                    <thead>
                      <tr className={isDark ? 'bg-[#1c3630] text-[#3fb996]' : 'bg-emerald-50 text-emerald-900'}>
                        <th className="p-2.5 text-xs font-bold border-l border-b border-slate-200/20">Harf</th>
                        <th className="p-2.5 text-xs font-bold border-l border-b border-slate-200/20">1</th>
                        <th className="p-2.5 text-xs font-bold border-l border-b border-slate-200/20">2</th>
                        <th className="p-2.5 text-xs font-bold border-b border-slate-200/20">3</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-[#3a3226]' : 'divide-slate-100'}`}>
                      {LETTERS.filter((l) => baseConsonant(l)).map((l) => {
                        const b = baseConsonant(l);
                        const kalin = KALIN.has(l.name);
                        const v = kalin ? { u: 'a', e: 'ı', o: 'u' } : { u: 'e', e: 'i', o: 'ü' };

                        const arU = 'أَ' + l.ar + '\u0652' + 'تَ';
                        const arE = 'إِ' + l.ar + '\u0652' + 'تَ';
                        const arO = 'أُ' + l.ar + '\u0652' + 'تَ';

                        const rdU = v.u + b + 'te';
                        const rdE = v.e + b + 'te';
                        const rdO = v.o + b + 'te';

                        return (
                          <tr key={l.name} className="hover:bg-emerald-500/5 transition-colors">
                            <td className={`p-3 sm:p-3.5 font-bold border-l border-slate-200/20 ${isDark ? 'bg-[#1c3630]/40' : 'bg-emerald-50/50'}`}>
                              <span className={`font-amiri text-3xl sm:text-4xl block font-bold dir-rtl ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>{l.ar}</span>
                              <span className="text-[11px] block opacity-80 mt-1">{l.name}</span>
                            </td>

                            <td
                              onClick={() => toggleFlip(`s2_${l.name}_u`)}
                              className="p-3 sm:p-3.5 border-l border-slate-200/20 cursor-pointer select-none hover:bg-emerald-500/10 transition-colors"
                            >
                              <span className={`font-amiri text-3xl sm:text-4xl block font-bold dir-rtl ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'} ${flippedCards[`s2_${l.name}_u`] ? 'opacity-40' : ''}`}>
                                {arU}
                              </span>
                              {flippedCards[`s2_${l.name}_u`] && (
                                <span className={`text-xs sm:text-sm font-bold block mt-1 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>
                                  {rdU}
                                </span>
                              )}
                            </td>

                            <td
                              onClick={() => toggleFlip(`s2_${l.name}_e`)}
                              className="p-3 sm:p-3.5 border-l border-slate-200/20 cursor-pointer select-none hover:bg-emerald-500/10 transition-colors"
                            >
                              <span className={`font-amiri text-3xl sm:text-4xl block font-bold dir-rtl ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'} ${flippedCards[`s2_${l.name}_e`] ? 'opacity-40' : ''}`}>
                                {arE}
                              </span>
                              {flippedCards[`s2_${l.name}_e`] && (
                                <span className={`text-xs sm:text-sm font-bold block mt-1 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>
                                  {rdE}
                                </span>
                              )}
                            </td>

                            <td
                              onClick={() => toggleFlip(`s2_${l.name}_o`)}
                              className="p-3 sm:p-3.5 cursor-pointer select-none hover:bg-emerald-500/10 transition-colors"
                            >
                              <span className={`font-amiri text-3xl sm:text-4xl block font-bold dir-rtl ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'} ${flippedCards[`s2_${l.name}_o`] ? 'opacity-40' : ''}`}>
                                {arO}
                              </span>
                              {flippedCards[`s2_${l.name}_o`] && (
                                <span className={`text-xs sm:text-sm font-bold block mt-1 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>
                                  {rdO}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ADIM 3: GERÇEK KELİMELERİ OKUMA (KOLAY / ORTA / ZOR FLIP KARTLARI) */}
            {heceStep === 3 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3
                      className={`text-base font-bold ${
                        isDark ? 'text-[#3fb996]' : 'text-emerald-800'
                      }`}
                    >
                      4) Anlamlı Kelimeleri Okuma
                    </h3>
                  </div>

                  {/* Seviye Sekmeleri */}
                  <div className="inline-flex p-1 rounded-xl border bg-slate-100 dark:bg-[#211d16] border-slate-200 dark:border-[#3a3226]">
                    {(['kolay', 'orta', 'zor'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setWordLevel(lvl)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                          wordLevel === lvl
                            ? isDark
                              ? 'bg-[#3fb996] text-[#181510] shadow-xs'
                              : 'bg-emerald-700 text-white shadow-xs'
                            : isDark
                            ? 'text-[#b9b09a] hover:text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {WORD_BANK.filter((w) => w.lvl === wordLevel).map((word, idx) => {
                    const flipKey = `wb_${wordLevel}_${idx}`;
                    const isFlipped = !!flippedCards[flipKey];
                    return (
                      <div
                        key={flipKey}
                        onClick={() => toggleFlip(flipKey)}
                        className={`rounded-2xl p-4 sm:p-5 border text-center transition-all cursor-pointer min-h-[110px] flex flex-col items-center justify-center select-none ${
                          isFlipped
                            ? isDark
                              ? 'bg-[#1c3630]/60 border-[#3fb996]/50'
                              : 'bg-emerald-50/80 border-emerald-300'
                            : isDark
                            ? 'bg-[#211d16] border-[#3a3226] hover:border-[#3fb996]/60'
                            : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-xs'
                        }`}
                      >
                        <span
                          className={`font-amiri text-3xl sm:text-4xl md:text-5xl leading-relaxed dir-rtl block transition-opacity font-bold py-1 ${
                            isDark ? 'text-[#3fb996]' : 'text-emerald-700'
                          } ${isFlipped ? 'opacity-40 scale-95' : 'opacity-100'}`}
                        >
                          {word.ar}
                        </span>
                        {isFlipped ? (
                          <div className="mt-1.5 animate-in fade-in duration-150">
                            <span
                              className={`text-xs sm:text-sm font-bold block ${
                                isDark ? 'text-[#3fb996]' : 'text-emerald-800'
                              }`}
                            >
                              {word.rd}
                            </span>
                            <span
                              className={`text-[11px] sm:text-xs italic block mt-0.5 ${
                                isDark ? 'text-[#b9b09a]' : 'text-slate-500'
                              }`}
                            >
                              {word.mean}
                            </span>
                          </div>
                        ) : (
                          <span
                            className={`text-[11px] mt-1.5 block opacity-60 ${
                              isDark ? 'text-[#b9b09a]' : 'text-slate-400'
                            }`}
                          >
                            (dokun & kontrol et)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ADIM 4: KÜÇÜK TEST (ÇOKTAN SEÇMELİ TEST) */}
            {heceStep === 4 && currentQuizWord && (
              <div
                className={`max-w-xl mx-auto rounded-3xl p-6 sm:p-8 border shadow-lg text-center ${
                  isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'
                }`}
              >
                <span
                  className={`text-xs font-bold uppercase tracking-wider block mb-6 ${
                    isDark ? 'text-[#3fb996]' : 'text-emerald-700'
                  }`}
                >
                  Kelime Okuma Testi
                </span>

                <div className={`font-amiri text-5xl sm:text-6xl mt-8 mb-8 dir-rtl font-bold leading-loose ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>
                  {currentQuizWord.ar}
                </div>

                <div className="grid grid-cols-2 gap-2.5 my-6">
                  {quizOptions.map((opt) => {
                    const isSelected = quizSelectedOption === opt;
                    const isCorrect = opt === currentQuizWord.rd;
                    let btnStyle = isDark
                      ? 'bg-[#181510] text-[#f1ecdd] border-[#3a3226] hover:border-[#3fb996]'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-emerald-500 hover:bg-slate-100';

                    if (quizSelectedOption) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-600 text-white border-rose-600 font-bold';
                      } else {
                        btnStyle = 'opacity-40 border-transparent';
                      }
                    }

                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelectQuizOption(opt)}
                        disabled={!!quizSelectedOption}
                        className={`p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${btnStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                <div
                  className={`text-xs sm:text-sm font-bold my-2 ${
                    quizAnswerFeedback.includes('Doğru!')
                      ? 'text-emerald-500'
                      : quizAnswerFeedback.includes('Doğrusu')
                      ? 'text-rose-400'
                      : isDark
                      ? 'text-[#b9b09a]'
                      : 'text-slate-500'
                  }`}
                >
                  {quizAnswerFeedback}
                </div>

                <button
                  onClick={handleNextQuiz}
                  className={`mt-4 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isDark
                      ? 'bg-[#3fb996] text-[#181510] hover:bg-[#3fb996]/90'
                      : 'bg-emerald-700 text-white hover:bg-emerald-800'
                  }`}
                >
                  Sıradaki Kelime →
                </button>
              </div>
            )}
          </div>
        )}

        {/* SEKME 3: TEMEL BİLGİLER */}
        {activeTab === 'temel' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Kelime-i Tevhid & Âmentü */}
            <div className="space-y-3">
              <h2
                className={`text-base sm:text-lg font-bold ${
                  isDark ? 'text-[#3fb996]' : 'text-emerald-800'
                }`}
              >
                Kelime-i Tevhid & Âmentü
              </h2>

              {TEMEL_DATA_1.map((item, idx) => {
                const key = `dua1_${idx}`;
                const isOpen = !!openAccordions[key];
                const isDone = !!state[key];
                return (
                  <div
                    key={item.title}
                    id={`section-${key}`}
                    style={{ scrollMarginTop: '190px' }}
                    className={`rounded-2xl border overflow-hidden transition-all ${
                      isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div
                      role="button" tabIndex={0} aria-expanded={isOpen} aria-controls={`content-${key}`}
                      onKeyDown={e => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggleAccordion(key); } }}
                      onClick={() => toggleAccordion(key)}
                      className="p-4 flex items-center justify-between cursor-pointer font-bold text-sm sm:text-base select-none"
                    >
                      <span className="flex items-center gap-2">
                        {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        <span>{item.title}</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <AppRouteLink
                          href={basicInfoHash(key)}
                          onClick={(e) => e.stopPropagation()}
                          navigate={() => copyDirectLink(basicInfoHash(key), item.title)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-[#3a3226] text-[#b9b09a]' : 'hover:bg-slate-100 text-slate-500'
                          }`}
                          title="Bu başlığın bağlantısını kopyala" aria-label={`${item.title} bağlantısını kopyala`}
                        >
                          <Link2 className="w-3.5 h-3.5" />
                        </AppRouteLink>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {isOpen && (
                      <div id={`content-${key}`} className={`p-4 pt-0 border-t ${isDark ? 'border-[#3a3226]' : 'border-slate-100'}`}>
                        <div className="space-y-2.5 my-3">
                          {item.arabic.map((arText, aIdx) => (
                            <p
                              key={aIdx}
                              className="font-amiri text-2xl sm:text-3xl text-right dir-rtl leading-relaxed text-emerald-500"
                            >
                              {arText}
                            </p>
                          ))}
                        </div>

                        <div className="space-y-1.5 text-xs sm:text-sm">
                          <p className={`font-semibold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
                            {item.okunus}
                          </p>
                          <p className={`italic ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
                            {item.anlam}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/20 flex items-center justify-between">
                          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => toggleDuaDone(key)}
                              className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                            />
                            <span>Ezberledim / Öğrendim</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sıfât-ı Zâtiyye (6 Sıfat) */}
            <div
              className={`rounded-2xl p-5 border shadow-sm ${
                isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'
              }`}
            >
              <h2
                className={`text-base sm:text-lg font-bold mb-1 ${
                  isDark ? 'text-[#3fb996]' : 'text-emerald-800'
                }`}
              >
                Sıfât-ı Zâtiyye (Allah'ın Zatına Ait 6 Sıfat)
              </h2>
              <p
                className={`text-xs mb-4 ${
                  isDark ? 'text-[#b9b09a]' : 'text-slate-500'
                }`}
              >
                Önce Arapçasını okumayı deneyin; okunuşunu ve anlamını görmek için karta dokunun:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SIFAT_ZATI.map((s) => {
                  const isOpen = !!openSifatlar[s.ar];
                  return (
                    <div
                      key={s.ar}
                      onClick={() => toggleSifat(s.ar)}
                      className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isOpen
                          ? isDark
                            ? 'bg-[#1c3630]/60 border-[#3fb996]'
                            : 'bg-emerald-50 border-emerald-300'
                          : isDark
                          ? 'bg-[#181510] border-[#3a3226] hover:border-[#3fb996]'
                          : 'bg-slate-50 border-slate-200 hover:border-emerald-400'
                      }`}
                    >
                      <span className="font-amiri text-xl sm:text-2xl block dir-rtl leading-relaxed text-emerald-500">
                        {s.ar}
                      </span>
                      {isOpen ? (
                        <div className="mt-2 text-left animate-in fade-in duration-150">
                          <span
                            className={`text-xs font-bold block ${
                              isDark ? 'text-[#3fb996]' : 'text-emerald-800'
                            }`}
                          >
                            {s.okunus}
                          </span>
                          <span
                            className={`text-[11px] block mt-0.5 italic ${
                              isDark ? 'text-[#b9b09a]' : 'text-slate-600'
                            }`}
                          >
                            {s.anlam}
                          </span>
                        </div>
                      ) : (
                        <span
                          className={`text-[10px] block mt-1 opacity-60 ${
                            isDark ? 'text-[#b9b09a]' : 'text-slate-400'
                          }`}
                        >
                          (anlamı gör)
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sıfât-ı Sübûtiyye (8 Sıfat) */}
            <div
              className={`rounded-2xl p-5 border shadow-sm ${
                isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'
              }`}
            >
              <h2
                className={`text-base sm:text-lg font-bold mb-1 ${
                  isDark ? 'text-[#3fb996]' : 'text-emerald-800'
                }`}
              >
                Sıfât-ı Sübûtiyye (Allah'ın 8 Sübûtî Sıfatı)
              </h2>
              <p
                className={`text-xs mb-4 ${
                  isDark ? 'text-[#b9b09a]' : 'text-slate-500'
                }`}
              >
                Önce Arapçasını okumayı deneyin; okunuşunu ve anlamını görmek için karta dokunun:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SIFAT_SUBUTI.map((s) => {
                  const isOpen = !!openSifatlar[s.ar];
                  return (
                    <div
                      key={s.ar}
                      onClick={() => toggleSifat(s.ar)}
                      className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isOpen
                          ? isDark
                            ? 'bg-[#1c3630]/60 border-[#3fb996]'
                            : 'bg-emerald-50 border-emerald-300'
                          : isDark
                          ? 'bg-[#181510] border-[#3a3226] hover:border-[#3fb996]'
                          : 'bg-slate-50 border-slate-200 hover:border-emerald-400'
                      }`}
                    >
                      <span className="font-amiri text-xl sm:text-2xl block dir-rtl leading-relaxed text-emerald-500">
                        {s.ar}
                      </span>
                      {isOpen ? (
                        <div className="mt-2 text-left animate-in fade-in duration-150">
                          <span
                            className={`text-xs font-bold block ${
                              isDark ? 'text-[#3fb996]' : 'text-emerald-800'
                            }`}
                          >
                            {s.okunus}
                          </span>
                          <span
                            className={`text-[11px] block mt-0.5 italic ${
                              isDark ? 'text-[#b9b09a]' : 'text-slate-600'
                            }`}
                          >
                            {s.anlam}
                          </span>
                        </div>
                      ) : (
                        <span
                          className={`text-[10px] block mt-1 opacity-60 ${
                            isDark ? 'text-[#b9b09a]' : 'text-slate-400'
                          }`}
                        >
                          (anlamı gör)
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tekbir ve Peygamberler Duaları */}
            <div className="space-y-3">
              <h2
                className={`text-base sm:text-lg font-bold ${
                  isDark ? 'text-[#3fb996]' : 'text-emerald-800'
                }`}
              >
                Tekbir & Peygamberler Duaları
              </h2>

              {TEMEL_DATA_2.map((item, idx) => {
                const key = `dua2_${idx}`;
                const isOpen = !!openAccordions[key];
                const isDone = !!state[key];
                return (
                  <div
                    key={item.title}
                    id={`section-${key}`}
                    style={{ scrollMarginTop: '190px' }}
                    className={`rounded-2xl border overflow-hidden transition-all ${
                      isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div
                      role="button" tabIndex={0} aria-expanded={isOpen} aria-controls={`content-${key}`}
                      onKeyDown={e => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggleAccordion(key); } }}
                      onClick={() => toggleAccordion(key)}
                      className="p-4 flex items-center justify-between cursor-pointer font-bold text-sm sm:text-base select-none"
                    >
                      <span className="flex items-center gap-2">
                        {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        <span>{item.title}</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <AppRouteLink
                          href={basicInfoHash(key)}
                          onClick={(e) => e.stopPropagation()}
                          navigate={() => copyDirectLink(basicInfoHash(key), item.title)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-[#3a3226] text-[#b9b09a]' : 'hover:bg-slate-100 text-slate-500'
                          }`}
                          title="Bu başlığın bağlantısını kopyala" aria-label={`${item.title} bağlantısını kopyala`}
                        >
                          <Link2 className="w-3.5 h-3.5" />
                        </AppRouteLink>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {isOpen && (
                      <div id={`content-${key}`} className={`p-4 pt-0 border-t ${isDark ? 'border-[#3a3226]' : 'border-slate-100'}`}>
                        <div className="space-y-3 my-3">
                          {item.arabic.map((arText, aIdx) => (
                            <div
                              key={aIdx}
                              dir="rtl"
                              className={`p-3.5 sm:p-4 rounded-xl border font-amiri text-2xl sm:text-3xl md:text-4xl text-right leading-[2.2] tracking-wide ${
                                isDark
                                  ? 'bg-[#181510] border-[#3a3226] text-[#3fb996]'
                                  : 'bg-emerald-50/40 border-emerald-200/80 text-emerald-900'
                              }`}
                            >
                              {arText}
                            </div>
                          ))}
                        </div>

                        <div className="space-y-2.5 text-sm sm:text-base mt-3">
                          <div
                            className={`p-3 rounded-xl border ${
                              isDark
                                ? 'bg-[#181510]/60 border-[#3a3226] text-[#f1ecdd]'
                                : 'bg-slate-50 border-slate-200/80 text-slate-800'
                            }`}
                          >
                            <span
                              className={`text-xs font-extrabold uppercase tracking-wider block mb-1 ${
                                isDark ? 'text-[#3fb996]' : 'text-emerald-700'
                              }`}
                            >
                              Türkçe Okunuşu:
                            </span>
                            <p className="font-semibold leading-relaxed whitespace-pre-line">
                              {item.okunus}
                            </p>
                          </div>

                          <div
                            className={`p-3 rounded-xl border ${
                              isDark
                                ? 'bg-[#181510]/40 border-[#3a3226] text-[#d6ccb8]'
                                : 'bg-white border-slate-200/80 text-slate-700'
                            }`}
                          >
                            <span
                              className={`text-xs font-extrabold uppercase tracking-wider block mb-1 ${
                                isDark ? 'text-amber-400' : 'text-amber-800'
                              }`}
                            >
                              Türkçe Anlamı:
                            </span>
                            <p className="leading-relaxed whitespace-pre-line">
                              {item.anlam}
                            </p>
                          </div>
                        </div>

                        {item.note && (
                          <div
                            className={`mt-3 p-3 rounded-xl text-xs sm:text-sm leading-relaxed ${
                              isDark
                                ? 'bg-[#1c3630]/60 border border-[#3fb996]/30 text-[#3fb996]'
                                : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                            }`}
                          >
                            <span className="font-bold">Kaynak / Kıssa:</span> {item.note}
                          </div>
                        )}

                        <div className="mt-4 pt-3 border-t border-slate-200/20 flex items-center justify-between">
                          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => toggleDuaDone(key)}
                              className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                            />
                            <span>Ezberledim / Öğrendim</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Üstad Kadir Mısıroğlu'nun Tavsiye Ettiği Dualar, Zikirler ve Zırh Duası */}
            <div className="space-y-3.5 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2
                  className={`text-base sm:text-lg font-bold flex items-center gap-2 ${
                    isDark ? 'text-[#3fb996]' : 'text-emerald-800'
                  }`}
                >
                  <Shield className="w-5 h-5 shrink-0" />
                  <span>Üstad Kadir Mısıroğlu'nun Tavsiye Ettiği Dualar, Zikirler & Zırh Duası</span>
                </h2>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border w-fit ${
                    isDark
                      ? 'bg-[#1c3630]/50 border-[#3fb996]/30 text-[#3fb996]'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  Günlük Evrâd, Zırh Duası & Hikmet Düsturları
                </span>
              </div>

              {TEMEL_DATA_3.map((item, idx) => {
                const key = `dua3_${idx}`;
                const isOpen = !!openAccordions[key];
                const isDone = !!state[key];
                return (
                  <div
                    key={item.title}
                    id={`section-${key}`}
                    style={{ scrollMarginTop: '190px' }}
                    className={`rounded-2xl border overflow-hidden transition-all ${
                      item.hasAudioPlayer
                        ? isDark
                          ? 'bg-[#211d16] border-[#3fb996]/60 shadow-md'
                          : 'bg-white border-emerald-400 shadow-sm'
                        : isDark
                        ? 'bg-[#211d16] border-[#3a3226]'
                        : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div
                      role="button" tabIndex={0} aria-expanded={isOpen} aria-controls={`content-${key}`}
                      onKeyDown={e => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggleAccordion(key); } }}
                      onClick={() => toggleAccordion(key)}
                      className="p-4 flex items-center justify-between cursor-pointer font-bold text-sm sm:text-base select-none"
                    >
                      <span className="flex items-center gap-2">
                        {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                        <span>{item.title}</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <AppRouteLink
                          href={basicInfoHash(key)}
                          onClick={(e) => e.stopPropagation()}
                          navigate={() => copyDirectLink(basicInfoHash(key), item.title)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-[#3a3226] text-[#b9b09a]' : 'hover:bg-slate-100 text-slate-500'
                          }`}
                          title="Bu başlığın bağlantısını kopyala" aria-label={`${item.title} bağlantısını kopyala`}
                        >
                          <Link2 className="w-3.5 h-3.5" />
                        </AppRouteLink>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {isOpen && (
                      <div id={`content-${key}`} className={`p-4 sm:p-5 pt-0 border-t ${isDark ? 'border-[#3a3226]' : 'border-slate-100'}`}>
                       {item.hasAudioPlayer && (
                          <div
                            className={`mt-4 p-3.5 sm:p-4 rounded-2xl border flex flex-col gap-3 ${
                              isDark
                                ? 'bg-[#181510] border-[#3fb996]/40 text-[#f1ecdd]'
                                : 'bg-emerald-50/70 border-emerald-300 text-slate-800'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2.5">
                              <div className="flex items-center gap-2">
                                <Volume2
                                  className={`w-5 h-5 ${
                                    zirhIsPlaying
                                      ? 'text-emerald-500 animate-pulse'
                                      : isDark
                                      ? 'text-[#3fb996]'
                                      : 'text-emerald-700'
                                  }`}
                                />
                                <div>
                                  <span className="text-xs sm:text-sm font-extrabold block">
                                    Zırh Duası Sesli Dinleme Oynatıcısı
                                  </span>
                                  <span
                                    className={`text-[11px] block ${
                                      isDark ? 'text-[#b9b09a]' : 'text-slate-600'
                                    }`}
                                  >
                                    {zirhUseCustomAudio && zirhCustomFileName
                                      ? `Özel MP3: ${zirhCustomFileName}`
                                      : zirhIsPlaying
                                      ? 'Zırh Duası ses kaydı çalıyor...'
                                      : zirhIsPaused
                                      ? 'Duraklatıldı — Devam Et düğmesine basın'
                                      : 'Zırh Duası MP3 kaydı · Başlat ile dinleyin'}
                                  </span>
                                </div>
                              </div>

                              {/* Oynat / Duraklat / Durdur ve Ses Dosyası Seç Butonları */}
                              <div className="flex items-center flex-wrap gap-2.5">
                                {!zirhIsPlaying ? (
                                  <button
                                    type="button"
                                    onClick={() => handleZirhPlayPause(item.audioUrl)}
                                    className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md bg-[#55c99a] text-[#07130e] hover:bg-[#48b488] active:scale-95"
                                  >
                                    <Play className="w-4 h-4 fill-current" />
                                    <span>{zirhIsPaused ? 'Devam Et' : 'Başlat'}</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleZirhPlayPause(item.audioUrl)}
                                    className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md bg-red-500 text-slate-950 hover:bg-red-600 active:scale-95"
                                  >
                                    <Pause className="w-4 h-4" />
                                    <span>Duraklat</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={handleZirhStop}
                                  disabled={!zirhIsPlaying && !zirhIsPaused && zirhCurrentTime === 0}
                                  title="Kaydı en başa sar (0:00)"
                                  className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all border active:scale-95 ${
                                    !zirhIsPlaying && !zirhIsPaused && zirhCurrentTime === 0
                                      ? 'opacity-40 cursor-not-allowed border-slate-500/30'
                                      : isDark
                                      ? 'bg-[#20242a] text-slate-200 border-[#30363d] hover:border-[#55c99a] cursor-pointer'
                                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 cursor-pointer'
                                  }`}
                                >
                                  <RotateCcw className={`w-3.5 h-3.5`} />
                                  <span>Başa Al</span>
                                </button>


                                {/* Hız Seçici */}
                                <div
                                  className={`flex items-center p-1 rounded-xl border ${
                                    isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-emerald-200'
                                  }`}
                                  title="Okuma Hızı"
                                >
                                  {[0.8, 1, 1.25].map((spd) => (
                                    <button
                                      key={spd}
                                      type="button"
                                      onClick={() => {
                                        setZirhPlaybackRate(spd);
                                        if (zirhAudioRef.current) {
                                          zirhAudioRef.current.playbackRate = spd;
                                        }
                                      }}
                                      className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                                        zirhPlaybackRate === spd
                                          ? isDark
                                            ? 'bg-[#3fb996] text-[#181510]'
                                            : 'bg-emerald-700 text-white'
                                          : isDark
                                          ? 'text-[#b9b09a] hover:text-white'
                                          : 'text-slate-600 hover:text-slate-900'
                                      }`}
                                    >
                                      {spd}x
                                    </button>
                                  ))}
                                </div>

                                {zirhCustomAudioUrl && (
                                  <button type="button"
                                    onClick={() => {
                                      handleZirhStop();
                                      setZirhUseCustomAudio(value => !value);
                                    }}
                                    className="min-h-[44px] px-3 rounded-xl border border-amber-500/50 text-xs font-semibold">
                                    {zirhUseCustomAudio ? 'Varsayılan Kayda Dön' : 'Kayıtlı Sesimi Dinle'}
                                  </button>
                                )}
                              </div>
                            </div>

                            {zirhAudioError && (
                              <p role="alert" className="text-xs text-rose-500">{zirhAudioError}</p>
                            )}
                            {/* Ses İlerleme Çubuğu */}
                            {zirhDuration > 0 && (
                              <div className="flex items-center gap-3 pt-1">
                                <span className="text-[11px] font-mono opacity-80">
                                  {formatAudioTime(zirhCurrentTime)}
                                </span>
                                <input
                                  type="range"
                                  min={0}
                                  max={zirhDuration || 100}
                                  step={0.1}
                                  value={zirhCurrentTime}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setZirhCurrentTime(val);
                                    if (zirhAudioRef.current) {
                                      zirhAudioRef.current.currentTime = val;
                                    }
                                  }}
                                  className="flex-1 h-1.5 bg-slate-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                                <span className="text-[11px] font-mono opacity-80">
                                  {formatAudioTime(zirhDuration)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 1. Orijinal Metin (Arapça) - Büyük ve Okunaklı */}
                        {item.arabic && item.arabic.length > 0 && (
                          <div className="space-y-3 my-4">
                            <span
                              className={`text-xs font-extrabold uppercase tracking-wider block ${
                                isDark ? 'text-[#3fb996]' : 'text-emerald-800'
                              }`}
                            >
                              1. Orijinal Metin (Arapça):
                            </span>
                            {item.arabic.map((arText, aIdx) => (
                              <div
                                key={aIdx}
                                dir="rtl"
                                className={`p-4 sm:p-5 rounded-xl border font-amiri text-2xl sm:text-3xl md:text-4xl text-right leading-[2.3] tracking-wide ${
                                  isDark
                                    ? 'bg-[#181510] border-[#3a3226] text-[#3fb996]'
                                    : 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                                }`}
                              >
                                {arText}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 2. Türkçe Okunuşu ve 3. Türkçe Anlamı */}
                        <div className="space-y-3 text-sm sm:text-base mt-3">
                          <div
                            className={`p-3.5 sm:p-4 rounded-xl border ${
                              isDark
                                ? 'bg-[#181510]/70 border-[#3a3226] text-[#f1ecdd]'
                                : 'bg-slate-50 border-slate-200/90 text-slate-800'
                            }`}
                          >
                            <span
                              className={`text-xs font-extrabold uppercase tracking-wider block mb-1.5 ${
                                isDark ? 'text-[#3fb996]' : 'text-emerald-800'
                              }`}
                            >
                              2. Türkçe Okunuşu:
                            </span>
                            <p className="font-semibold leading-relaxed whitespace-pre-line">
                              {item.okunus}
                            </p>
                          </div>

                          <div
                            className={`p-3.5 sm:p-4 rounded-xl border ${
                              isDark
                                ? 'bg-[#181510]/50 border-[#3a3226] text-[#e4dccb]'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <span
                              className={`text-xs font-extrabold uppercase tracking-wider block mb-1.5 ${
                                isDark ? 'text-amber-400' : 'text-amber-800'
                              }`}
                            >
                              3. Türkçe Anlamı ve İzahı:
                            </span>
                            <p className="leading-relaxed whitespace-pre-line">
                              {item.anlam}
                            </p>
                          </div>
                        </div>

                        {/* Detay Paragrafları (Varsa) */}
                        {item.details && item.details.length > 0 && (
                          <div className="mt-4 space-y-2.5">
                            {item.details.map((paragraph, pIdx) => (
                              <div
                                key={pIdx}
                                className={`p-3.5 rounded-xl border text-sm sm:text-base leading-relaxed ${
                                  isDark
                                    ? 'bg-[#181510]/60 border-[#3a3226] text-[#e4dccb]'
                                    : 'bg-amber-50/40 border-amber-200/70 text-slate-800'
                                }`}
                              >
                                {paragraph}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Alt Zikir Listesi (Sabah 11'li ve Gece 100'lü Tesbihat Kartları) */}
                        {item.zikirList && item.zikirList.length > 0 && (
                          <div className="mt-4 space-y-2.5">
                            <span
                              className={`text-xs font-extrabold uppercase tracking-wider block ${
                                isDark ? 'text-[#3fb996]' : 'text-emerald-800'
                              }`}
                            >
                              Adım Adım Çekilecek Tesbihat ve Zikirler:
                            </span>
                            <div className="grid grid-cols-1 gap-2.5">
                              {item.zikirList.map((z, zIdx) => (
                                <div
                                  key={zIdx}
                                  className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                    isDark
                                      ? 'bg-[#181510] border-[#3a3226]'
                                      : 'bg-slate-50/90 border-slate-200'
                                  }`}
                                >
                                  <div className="space-y-1 flex-1">
                                    <div className="flex items-center flex-wrap gap-2">
                                      {z.count && (
                                        <span
                                          className={`px-2.5 py-0.5 rounded-md text-xs font-extrabold ${
                                            isDark
                                              ? 'bg-[#1c3630] text-[#3fb996] border border-[#3fb996]/40'
                                              : 'bg-emerald-700 text-white'
                                          }`}
                                        >
                                          {z.count}
                                        </span>
                                      )}
                                      <span
                                        className={`text-sm sm:text-base font-extrabold ${
                                          isDark ? 'text-white' : 'text-slate-900'
                                        }`}
                                      >
                                        {z.okunus}
                                      </span>
                                      <span
                                        className={`text-xs sm:text-sm italic ${
                                          isDark ? 'text-amber-300/90' : 'text-emerald-800'
                                        }`}
                                      >
                                        — {z.anlam}
                                      </span>
                                    </div>
                                    <p
                                      className={`text-xs sm:text-sm leading-relaxed ${
                                        isDark ? 'text-[#b9b09a]' : 'text-slate-600'
                                      }`}
                                    >
                                      {z.aciklama}
                                    </p>
                                  </div>
                                  <div
                                    dir="rtl"
                                    className={`px-4 py-2 rounded-xl border font-amiri text-2xl sm:text-3xl text-right leading-loose shrink-0 ${
                                      isDark
                                        ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]'
                                        : 'bg-white border-emerald-200 text-emerald-900'
                                    }`}
                                  >
                                    {z.ar}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Maddeli Tavsiye ve Hikmet Başlıkları (Bullets) */}
                        {item.bullets && item.bullets.length > 0 && (
                          <div className="mt-4 space-y-2.5">
                            {item.bullets.map((b, bIdx) => (
                              <div
                                key={bIdx}
                                className={`p-3.5 rounded-xl border text-sm sm:text-base leading-relaxed ${
                                  isDark
                                    ? 'bg-[#181510]/80 border-[#3a3226]'
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <span
                                  className={`font-extrabold block mb-1 ${
                                    isDark ? 'text-amber-400' : 'text-emerald-800'
                                  }`}
                                >
                                  • {b.title}:
                                </span>
                                <p className={isDark ? 'text-[#e4dccb]' : 'text-slate-700'}>
                                  {b.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {item.note && (
                          <div
                            className={`mt-4 p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed ${
                              isDark
                                ? 'bg-[#1c3630]/60 border border-[#3fb996]/30 text-[#3fb996]'
                                : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                            }`}
                          >
                            <span className="font-bold">Fazileti / Hikmeti:</span> {item.note}
                          </div>
                        )}

                        <div className="mt-4 pt-3 border-t border-slate-200/20 flex items-center justify-between">
                          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => toggleDuaDone(key)}
                              className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                            />
                            <span>Ezberledim / Öğrendim</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SEKME 4: TECVİD ÖĞRENME ATÖLYESİ */}
        {activeTab === 'tecvid' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <TecvidSection
              theme={themeMode}
              viewMode={viewMode}
              targetLesson={targetTecvidLesson}
              targetTimestamp={targetTimestamp}
            />
          </div>
        )}

        {/* SEKME 5: YENİ NESİL MATRİXLİ ÖĞRENME METODU */}
        {activeTab === 'matrix' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <QuranMatrixModule
              isDark={isDark}
              targetStage={targetMatrixStage}
              targetTimestamp={targetTimestamp}
            />
          </div>
        )}
      </main>

      {/* 5. HARF DETAY POP-UP MODALI */}
      {selectedLetter && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setSelectedLetter(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-7 border shadow-2xl space-y-4 ${
              isDark ? 'bg-[#211d16] border-[#3a3226] text-[#f1ecdd]' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200/20">
              <div className="flex items-center gap-3">
                <span className="font-amiri text-4xl sm:text-5xl text-emerald-500 font-bold leading-none">{selectedLetter.ar}</span>
                <span className="font-bold text-lg sm:text-xl">{selectedLetter.name} Harfi</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyDirectLink(`elifba/harfler/${selectedLetter.name}`, `${selectedLetter.name} Harfi`)}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    isDark
                      ? 'bg-[#1c3630] border-[#3fb996]/40 text-[#3fb996] hover:bg-[#1c3630]/80'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                  }`}
                  title="Bu harfin doğrudan bağlantısını kopyala"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Bağlantıyı Kopyala</span>
                </button>
                <button
                  onClick={() => setSelectedLetter(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200/40 hover:bg-slate-500/20 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              {selectedLetter.desc}
            </p>

            {/* 1) Kelimedeki Konumuna Göre Şekli */}
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>
                1) Kelimedeki Konumuna Göre Şekli
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200/40">
                <table className="w-full text-center border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className={isDark ? 'bg-[#1c3630]' : 'bg-emerald-50'}>
                      <th className="p-2 border-l border-slate-200/20">Yalnız</th>
                      <th className="p-2 border-l border-slate-200/20">Başta</th>
                      <th className="p-2 border-l border-slate-200/20">Ortada</th>
                      <th className="p-2">Sonda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const pos = buildPositions(selectedLetter);
                      return (
                        <tr>
                          <td className={`p-2.5 font-amiri text-2xl border-l border-slate-200/20 dir-rtl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>{pos.yalniz}</td>
                          <td className={`p-2.5 font-amiri text-2xl border-l border-slate-200/20 dir-rtl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>{pos.bas}</td>
                          <td className={`p-2.5 font-amiri text-2xl border-l border-slate-200/20 dir-rtl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>{pos.orta}</td>
                          <td className={`p-2.5 font-amiri text-2xl dir-rtl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>{pos.son}</td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2) Harekeye Göre Okunuşu */}
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>
                2) Harekeye Göre Okunuşu
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200/40">
                <table className="w-full text-center border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className={isDark ? 'bg-[#1c3630]' : 'bg-emerald-50'}>
                      <th className="p-2 border-l border-slate-200/20">İşaret</th>
                      <th className="p-2 border-l border-slate-200/20">Adı</th>
                      <th className="p-2">Okunuşu</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#3a3226]' : 'divide-slate-100'}`}>
                    {buildHarekeSet(selectedLetter).map((hk, i) => (
                      <tr key={i}>
                        <td className={`p-2 font-amiri text-2xl border-l border-slate-200/20 dir-rtl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>{hk.ar}</td>
                        <td className="p-2 border-l border-slate-200/20 font-medium">{hk.lbl}</td>
                        <td className="p-2 opacity-90">{hk.rd}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3) Diğer Harflerle Birleşmiş Hâlleri */}
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>
                3) Diğer Harflerle Birleşmiş Hâlleri
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200/40">
                <table className="w-full text-center border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className={isDark ? 'bg-[#1c3630]' : 'bg-emerald-50'}>
                      <th className="p-2 border-l border-slate-200/20">Birleşim</th>
                      <th className="p-2 border-l border-slate-200/20">Eklenen</th>
                      <th className="p-2">Yaklaşık Okunuş</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#3a3226]' : 'divide-slate-100'}`}>
                    {buildCombos(selectedLetter).map((c, i) => (
                      <tr key={i}>
                        <td className={`p-2 font-amiri text-2xl border-l border-slate-200/20 dir-rtl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>{c.ar}</td>
                        <td className="p-2 border-l border-slate-200/20 text-xs opacity-80">{c.note}</td>
                        <td className="p-2 font-bold text-emerald-500">{c.rd}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Örnek Kelimeler */}
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>
                Örnek Kelimeler
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200/40">
                <table className="w-full text-center border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className={isDark ? 'bg-[#1c3630]' : 'bg-emerald-50'}>
                      <th className="p-2 border-l border-slate-200/20">Kelime</th>
                      <th className="p-2 border-l border-slate-200/20">Okunuşu</th>
                      <th className="p-2">Anlamı</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#3a3226]' : 'divide-slate-100'}`}>
                    {selectedLetter.words.map((w, i) => (
                      <tr key={i}>
                        <td className={`p-2 font-amiri text-2xl border-l border-slate-200/20 dir-rtl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>{w.ar}</td>
                        <td className="p-2 border-l border-slate-200/20 font-bold text-emerald-500">{w.read}</td>
                        <td className="p-2 italic opacity-80">{w.mean}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* "Öğrendim" Butonu */}
            <div className="pt-3 border-t border-slate-200/20 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  toggleLetterDone(selectedLetter.name);
                }}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isLetterDone(selectedLetter.name)
                    ? 'bg-emerald-600 text-white'
                    : isDark
                    ? 'bg-[#3fb996] text-[#181510] hover:bg-[#3fb996]/90'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{isLetterDone(selectedLetter.name) ? 'Öğrenildi ✓' : 'Öğrendim'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. İLK AÇILIŞ BİLGİLENDİRME MODALI */}
      {showIntroModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`max-w-md w-full rounded-3xl p-6 sm:p-7 border shadow-2xl space-y-4 ${
              isDark ? 'bg-[#211d16] border-[#3a3226] text-[#f1ecdd]' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <h2
              className={`text-lg font-bold flex items-center gap-2 ${
                isDark ? 'text-[#3fb996]' : 'text-emerald-800'
              }`}
            >
              <span>📖 Başlamadan Önce</span>
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Bu sayfa, Kur'an-ı Kerim okumaya sıfırdan başlayan biri için hazırlanmış <strong>yardımcı bir çalışma aracıdır</strong> — harfleri tanımanıza, hareke kurallarını ve hece/kelime okuma mantığını kavramanıza yardımcı olur.
            </p>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              <strong>Bu sayfa bir hocanın veya tecvid bilen birinin yerini tutmaz.</strong> Harflerin doğru mahreçten (ağız/boğaz noktasından) çıkışı ve doğru telaffuz, ancak yüz yüze bir öğretmen ya da ehil bir kaynak dinlenerek pekiştirilebilir.
            </p>
            <button
              onClick={handleDismissIntro}
              className={`w-full py-3 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-md ${
                isDark
                  ? 'bg-[#3fb996] text-[#181510] hover:bg-[#3fb996]/90'
                  : 'bg-emerald-700 text-white hover:bg-emerald-800'
              }`}
            >
              Anladım, Başlayalım
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
