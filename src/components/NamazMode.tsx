import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useThemeSync, broadcastThemeChange } from '../utils/themeSync';
import { 
  Play, 
  Square, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Sparkles, 
  Info, 

  ChevronRight,
  Volume2,

  Eye,
  EyeOff,
  Gauge,
  RotateCcw,
  Smartphone,
  Monitor,
  Moon,
  Sun,

  Type,

  ChevronDown,
  HelpCircle,
  MessageSquare,

  Search,
  CheckCheck,
  Copy
} from 'lucide-react';
import { NAMAZ_ITEMS, VIRTUAL_NEW_ITEMS, ALL_NAMAZ_ITEMS } from '../data/namazData';
import { INTERMEDIATE_NAMAZ_SURAH_IDS } from '../data/intermediateNamazSurahs';
import { MUSLUMAN_SUALLERI_DATA } from '../data/muslumanSualleriData';
import { NamazItem } from '../types';
import { getNamazTargetFromUrl, getNamazSectionForId, getDefaultNamazItemId, makeNamazItemHash, makeNamazSectionHash, parseNamazHash, NamazSection } from '../utils/namazDeepLinks';
import { navigateToAppHash } from '../utils/appNavigation';
import { recordNamazIssue as diagnostic, safeNamazErrorName } from '../utils/namazDiagnostics';
import { resolveNamazAudioUrl } from '../utils/namazAudioPath';
import { NamazDiagnosticsPanel } from './NamazDiagnosticsPanel';
import { TroubleshootingMenu } from './TroubleshootingMenu';

export type NamazTheme = 'dark' | 'emerald';
export type NamazViewMode = 'desktop' | 'mobile';

interface NamazModeProps {
  targetId?: string;
  targetTimestamp?: number;
}

// 1. Öncelik Sıralamasına Göre Başlangıç İçeriğini Belirleyen Fonksiyon
const getInitialNamazId = (propTargetId?: string): string => {
  // 1. ÖNCELİK: Özel URL (Deep Link) Kontrolü
  // a) targetId prop'u doğrudan gelmişse
  if (propTargetId && propTargetId.trim() !== '') {
    return propTargetId.trim();
  }

  // b) Önce doğrulanmış Namaz deep link'ini çöz.
  const urlId = getNamazTargetFromUrl();
  if (urlId) return urlId;

  // 2. ÖNCELİK: Kaldığı Yerden Devam Etme (Özel URL yoksa)
  if (typeof localStorage !== 'undefined') {
    try {
      const savedLastId = localStorage.getItem('namaz_last_selected_id') || localStorage.getItem('namaz_selected_id');
      if (savedLastId && savedLastId.trim() !== '') {
        const validId = savedLastId.trim();
        if (getNamazSectionForId(validId)) return validId;
      }
    } catch {
      // ignore
    }
  }

  // 3. ÖNCELİK: İlk Defa Giriş (Varsayılan)
  return 'fatiha';
};

export const NamazMode: React.FC<NamazModeProps> = ({ targetId, targetTimestamp }) => {
  const [selectedId, setSelectedId] = useState<string>(() => getInitialNamazId(targetId));
  const [linkCopied, setLinkCopied] = useState<string | null>(null);
  const [contentSearch, setContentSearch] = useState('');
  const [audioError, setAudioError] = useState<string | null>(null);
  const [useDeviceVoice, setUseDeviceVoice] = useState(false);
  const playbackVersionRef = useRef(0);
  const getFullNamazLink = (hash: string) =>
    `${window.location.origin}${window.location.pathname}${hash}`;
  const copyNamazLink = async (hash: string, label: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    const url = getFullNamazLink(hash);
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(label);
      window.setTimeout(() => setLinkCopied(null), 2400);
    } catch {
      diagnostic('CLIPBOARD_ERROR', 'warning', { itemId: selectedId });
      // Panoya erişimi engelleyen tarayıcılar için bağlantıyı seçilebilir yap.
      window.prompt('Paylaşılabilir bağlantıyı kopyalayın:', url);
    }
  };
  const selectNamazItem = (id: string) => {
    if (!getNamazSectionForId(id)) return;
    setSelectedId(id);
    diagnostic('ITEM_SELECTED', 'info', { itemId: id });
    navigateToAppHash(makeNamazItemHash(id));
  };
  const selectNamazSection = (section: NamazSection) => {
    const id = getDefaultNamazItemId(section);
    setSelectedId(id);
    navigateToAppHash(makeNamazSectionHash(section));
  };
  useEffect(() => {
    const onRouteChange = () => {
      const parsed = parseNamazHash(window.location.hash);
      if (parsed) setSelectedId(parsed.itemId);
    };
    window.addEventListener('popstate', onRouteChange);
    window.addEventListener('hashchange', onRouteChange);
    return () => {
      window.removeEventListener('popstate', onRouteChange);
      window.removeEventListener('hashchange', onRouteChange);
    };
  }, []);

  // Yazı Boyutu Ölçeği (%100 - %250 Slider ve Kademeli Ayar)
  const [fontSizePercent, setFontSizePercent] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('namaz_font_size_percent');
      if (saved) {
        const val = Number(saved);
        if (!isNaN(val) && val >= 100 && val <= 450) return val;
      }
      const oldSize = localStorage.getItem('namaz_font_size');
      if (oldSize === 'normal') return 100;
      if (oldSize === 'xlarge') return 140;
      if (oldSize === 'xxlarge') return 175;
      return 120; // default Büyük (%120)
    } catch {
      return 120;
    }
  });

  // Arapça Harf ve Metin Boyutu Ölçeği (Slider: %80 - %450)
  const [arabicScalePercent, setArabicScalePercent] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('namaz_arabic_scale'));
      if (saved && !isNaN(saved) && saved >= 80 && saved <= 450) return saved;
    } catch {}
    return 120; // Varsayılan %120
  });

  const changeFontSizePercent = (val: number) => {
    const clamped = Math.max(100, Math.min(450, val));
    setFontSizePercent(clamped);
    try {
      localStorage.setItem('namaz_font_size_percent', String(clamped));
    } catch {
      // ignore
    }
  };

  const getFontSizeStyles = (pct: number) => {
    let label = `%${pct}`;
    if (pct === 100) label = '%100 Normal';
    else if (pct === 120) label = '%120';
    else if (pct === 140) label = '%140';
    else if (pct === 175) label = '%175';
    else if (pct === 210) label = '%210';
    else if (pct === 250) label = '%250';
    else if (pct === 350) label = '%350';
    else if (pct === 450) label = '%450';

    let arabicMain = 'text-3xl sm:text-4xl md:text-5xl leading-[2.5]';
    let transliteration = 'text-sm sm:text-base md:text-lg font-medium leading-relaxed';
    let turkishText = 'text-sm sm:text-base md:text-lg leading-relaxed';
    let meaningText = 'text-xs sm:text-sm md:text-base leading-relaxed';

    if (pct >= 400) {
      arabicMain = 'text-8xl sm:text-9xl md:text-[10rem] leading-[3.6]';
      transliteration = 'text-3xl sm:text-4xl md:text-5xl font-bold leading-relaxed';
      turkishText = 'text-3xl sm:text-4xl md:text-5xl font-bold leading-relaxed';
      meaningText = 'text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed';
    } else if (pct >= 300) {
      arabicMain = 'text-7xl sm:text-8xl md:text-9xl leading-[3.4]';
      transliteration = 'text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed';
      turkishText = 'text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed';
      meaningText = 'text-xl sm:text-2xl md:text-3xl font-bold leading-relaxed';
    } else if (pct >= 220) {
      arabicMain = 'text-6xl sm:text-7xl md:text-8xl leading-[3.1]';
      transliteration = 'text-xl sm:text-2xl md:text-3xl font-bold leading-relaxed';
      turkishText = 'text-xl sm:text-2xl md:text-3xl font-bold leading-relaxed';
      meaningText = 'text-lg sm:text-xl md:text-2xl font-bold leading-relaxed';
    } else if (pct >= 190) {
      arabicMain = 'text-5xl sm:text-6xl md:text-7xl leading-[2.9]';
      transliteration = 'text-lg sm:text-xl md:text-2xl font-bold leading-relaxed';
      turkishText = 'text-lg sm:text-xl md:text-2xl font-bold leading-relaxed';
      meaningText = 'text-base sm:text-lg md:text-xl font-bold leading-relaxed';
    } else if (pct >= 155) {
      arabicMain = 'text-4xl sm:text-5xl md:text-6xl leading-[2.7]';
      transliteration = 'text-base sm:text-lg md:text-xl font-bold leading-relaxed';
      turkishText = 'text-base sm:text-lg md:text-xl font-bold leading-relaxed';
      meaningText = 'text-sm sm:text-base md:text-lg font-bold leading-relaxed';
    } else if (pct >= 130) {
      arabicMain = 'text-3xl sm:text-4xl md:text-5xl leading-[2.5]';
      transliteration = 'text-base sm:text-lg md:text-xl font-bold leading-relaxed';
      turkishText = 'text-base sm:text-lg md:text-xl font-bold leading-relaxed';
      meaningText = 'text-sm sm:text-base md:text-lg font-bold leading-relaxed';
    } else if (pct >= 110) {
      arabicMain = 'text-3xl sm:text-4xl md:text-5xl leading-[2.5]';
      transliteration = 'text-sm sm:text-base md:text-lg font-bold leading-relaxed';
      turkishText = 'text-sm sm:text-base md:text-lg font-bold leading-relaxed';
      meaningText = 'text-xs sm:text-sm md:text-base font-bold leading-relaxed';
    } else {
      arabicMain = 'text-2xl sm:text-3xl md:text-4xl leading-[2.4]';
      transliteration = 'text-xs sm:text-sm md:text-base font-bold leading-relaxed';
      turkishText = 'text-xs sm:text-sm md:text-base font-bold leading-relaxed';
      meaningText = 'text-xs sm:text-sm font-bold leading-relaxed';
    }

    return {
      arabicMain,
      arabicSub: arabicMain,
      transliteration,
      turkishText,
      meaningText,
      subHeading: 'text-sm sm:text-base font-bold',
      badgeText: 'text-xs',
      label
    };
  };

  const fs = getFontSizeStyles(fontSizePercent);

  const [targetLoop, setTargetLoop] = useState<number | 'infinite'>(3);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentLoop, setCurrentLoop] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number | null>(null);
  const [showTranslations, setShowTranslations] = useState<boolean>(false); // Default: hidden
  const [showTransliteration, setShowTransliteration] = useState<boolean>(false); // Latin Harf Okunuşu - Varsayılan: KAPALI
  const [showSources, setShowSources] = useState<boolean>(false); // Kaynakları Göster / Gizle - Varsayılan: Gizli
  const [hideEvlilik1, setHideEvlilik1] = useState<boolean>(false);
  const [hideEvlilik2, setHideEvlilik2] = useState<boolean>(false);
  const [hideEvlilik3, setHideEvlilik3] = useState<boolean>(false);
  const [hideEvlilik4, setHideEvlilik4] = useState<boolean>(false);

  // Müslümanların Bilmesi Gereken Sualler ve Cevaplar - Model 4: Karşılıklı Sohbet / Muhavere Akışı
  const [sualLearned, setSualLearned] = useState<Record<number, boolean>>({});
  const [sualChatDisplayMode, setSualChatDisplayMode] = useState<'all' | 'step'>('all');
  const [sualChatStepCount, setSualChatStepCount] = useState<number>(6);
  const [sualSearchTerm, setSualSearchTerm] = useState<string>('');
  const [sualSelectedCategory, setSualSelectedCategory] = useState<string>('all');
  const [sualCopyNotification, setSualCopyNotification] = useState<string | null>(null);

  // Görünüm Modu (Masaüstü Modu vs Mobil Modu - ElifBa ile tam uyumlu)
  const [viewMode, setViewMode] = useState<NamazViewMode>(() => {
    try {
      const saved = localStorage.getItem('namaz_view_mode') as NamazViewMode;
      if (saved === 'desktop' || saved === 'mobile') return saved;
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'mobile';
    }
    return 'desktop';
  });

  const toggleViewMode = (mode: NamazViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('namaz_view_mode', mode);
    } catch {
      // ignore
    }
  };

  // Tema Modu (Koyu Mod vs Açık Zümrüt Mod - ElifBa ile birebir aynı)
  const [themeMode, setThemeMode] = useState<NamazTheme>(() => {
    try {
      const saved = localStorage.getItem('namaz_theme_mode') as NamazTheme;
      if (saved === 'dark' || saved === 'emerald') return saved;
      const elifbaSaved = localStorage.getItem('elifba_theme_mode') as NamazTheme;
      if (elifbaSaved === 'dark' || elifbaSaved === 'emerald') return elifbaSaved;
    } catch {
      // ignore
    }
    return 'dark'; // Varsayılan: ElifBa gibi şık koyu tasarım
  });

  useThemeSync(themeMode === 'dark', (newIsDark) => {
    setThemeMode(newIsDark ? 'dark' : 'emerald');
  });

  const toggleTheme = (mode: NamazTheme) => {
    setThemeMode(mode);
    broadcastThemeChange(mode === 'dark');
  };

  const isDark = themeMode === 'dark';
  const isMobileView = viewMode === 'mobile';

  const allItems = ALL_NAMAZ_ITEMS;

  const [mobileCategory, setMobileCategory] = useState<'sure' | 'orta' | 'dua' | 'yeni'>(() => {
    const curId = selectedId;
    if (VIRTUAL_NEW_ITEMS.some((v) => v.id === curId)) {
      return 'yeni';
    }
    const foundDua = NAMAZ_ITEMS.find((n) => n.id === curId);
    if (foundDua && foundDua.category === 'dua') return 'dua';
    if (INTERMEDIATE_NAMAZ_SURAH_IDS.has(curId)) return 'orta';
    return 'sure';
  });

  // selectedId değiştiğinde hem localStorage'a kaydet (kaldığı yerden devam etmesi için) hem de mobil kategoriyi senkronize et
  useEffect(() => {
    if (selectedId) {
      try {
        localStorage.setItem('namaz_last_selected_id', selectedId);
        localStorage.setItem('namaz_selected_id', selectedId);
      } catch {
        // ignore
      }
      if (VIRTUAL_NEW_ITEMS.some((v) => v.id === selectedId)) {
        setMobileCategory('yeni');
      } else {
        const foundItem = NAMAZ_ITEMS.find((n) => n.id === selectedId);
        if (foundItem) {
          setMobileCategory(foundItem.category === 'dua' ? 'dua' : INTERMEDIATE_NAMAZ_SURAH_IDS.has(foundItem.id) ? 'orta' : 'sure');
        }
      }
    }
  }, [selectedId]);

  // targetId prop'u değişirse (örneğin Arama veya Takvimden yönlendirme ile gelindiğinde)
  useEffect(() => {
    if (targetId && targetId.trim() !== '') {
      const cleaned = targetId.trim();
      setSelectedId(cleaned);
      if (VIRTUAL_NEW_ITEMS.some((v) => v.id === cleaned)) {
        setMobileCategory('yeni');
      } else {
        const foundItem = NAMAZ_ITEMS.find((n) => n.id === cleaned);
        if (foundItem) {
          setMobileCategory(foundItem.category === 'dua' ? 'dua' : INTERMEDIATE_NAMAZ_SURAH_IDS.has(foundItem.id) ? 'orta' : 'sure');
        }
      }
      try {
        localStorage.setItem('namaz_last_selected_id', cleaned);
        localStorage.setItem('namaz_selected_id', cleaned);
      } catch {}
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        const el = document.getElementById(`namaz-guide-item-${cleaned}`) || document.getElementById(`namaz-item-${cleaned}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  }, [targetId, targetTimestamp]);

  const playbackSpeedRef = useRef<number>(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;

  const targetLoopRef = useRef<number | 'infinite'>(targetLoop);
  targetLoopRef.current = targetLoop;

  // Ezberlenenleri LocalStorage'da tutma
  const [memorizedIds, setMemorizedIds] = useState<string[]>(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem('namaz_memorized_ids') || '[]');
      const valid = new Set(NAMAZ_ITEMS.map(item => item.id));
      return Array.isArray(saved) ? [...new Set(saved.filter((id): id is string => typeof id === 'string' && valid.has(id)))] : [];
    } catch {
      return [];
    }
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const getAudio = () => {
    if (!audioRef.current) audioRef.current = new Audio();
    return audioRef.current;
  };
  const sentenceCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeItem = allItems.find((item) => item.id === selectedId) || allItems[0];

  useEffect(() => {
    try {
      localStorage.setItem('namaz_memorized_ids', JSON.stringify(memorizedIds));
    } catch (e) {
      diagnostic('STORAGE_WRITE_ERROR', 'warning', { itemId: selectedId, details: { name: safeNamazErrorName(e) } });
    }
  }, [memorizedIds]);

  const stopAudio = useCallback(() => {
    playbackVersionRef.current += 1;
    setIsPlaying(false);
    setIsPlayingAll(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.onloadedmetadata = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentLoop(0);
    setActiveSentenceIdx(null);
  }, []);

  useEffect(() => {
    stopAudio();
  }, [selectedId, stopAudio]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  // Scroll active sentence into view if needed
  useEffect(() => {
    if (activeSentenceIdx !== null && sentenceCardRefs.current[activeSentenceIdx]) {
      sentenceCardRefs.current[activeSentenceIdx]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeSentenceIdx]);

  const toggleMemorized = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMemorizedIds((prev) => 
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Recorded recitations are preferred; synthesized Arabic is an explicit user choice.
  const audioFailure = (version: number, message: string) => {
    if (version !== playbackVersionRef.current) return;
    diagnostic('SPEECH_ERROR', 'error', { itemId: selectedId });
    stopAudio();
    setAudioError(message);
  };
  const speakArabic = (text: string, onEnd: () => void, version: number) => {
    if (version !== playbackVersionRef.current) return;
    if (!useDeviceVoice || typeof window === 'undefined' || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      diagnostic('SPEECH_UNAVAILABLE', 'warning', { itemId: selectedId });
      audioFailure(version, 'Ses kaydı yüklenemedi. Bağlantıyı kontrol edin. Cihaz sesi ayrı bir tercihtir.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = playbackSpeedRef.current * 0.9;
    let completed = false;
    utterance.onend = () => {
      if (completed || version !== playbackVersionRef.current) return;
      completed = true; onEnd();
    };
    utterance.onerror = () => {
      if (completed || version !== playbackVersionRef.current) return;
      completed = true; audioFailure(version, 'Cihazın Arapça seslendirmesi çalışmadı.');
    };
    try { diagnostic('SPEECH_STARTED', 'info', { itemId: selectedId }); window.speechSynthesis.speak(utterance); }
    catch { audioFailure(version, 'Cihaz sesi kullanılamıyor.'); }
  };
  const playSentenceAudio = (item: NamazItem, sentenceIdx: number, onFinish: () => void, version: number) => {
    if (version !== playbackVersionRef.current) return;
    const sentence = item.sentences?.[sentenceIdx];
    if (!sentence) { diagnostic('AUDIO_MISSING', 'warning', { itemId: item.id, sentence: sentenceIdx }); onFinish(); return; }
    const source = sentence.audioUrl || (item.sentences?.length === 1 ? item.audioUrl : null);
    if (!source) { diagnostic('AUDIO_MISSING', 'warning', { itemId: item.id, sentence: sentenceIdx }); speakArabic(sentence.arabic, onFinish, version); return; }
    const player = getAudio();
    diagnostic('SENTENCE_STARTED', 'info', { itemId: item.id, sentence: sentenceIdx });
    let completed = false;
    const finish = () => {
      if (completed || version !== playbackVersionRef.current) return;
      completed = true; diagnostic('AUDIO_ENDED', 'info', { itemId: item.id, sentence: sentenceIdx }); onFinish();
    };
    const failed = () => {
      if (completed || version !== playbackVersionRef.current) return;
      completed = true;
      diagnostic('AUDIO_ERROR', 'error', { itemId: item.id, sentence: sentenceIdx, details: { mediaCode: player.error?.code || 0, networkState: player.networkState } });
      player.onended = null; player.onerror = null; player.pause();
      speakArabic(sentence.arabic, onFinish, version);
    };
    player.pause(); player.src = resolveNamazAudioUrl(source, import.meta.env.BASE_URL, window.location.href); player.playbackRate = playbackSpeedRef.current;
    player.onloadedmetadata = () => { if (version === playbackVersionRef.current) player.playbackRate = playbackSpeedRef.current; };
    player.onended = finish; player.onerror = failed;
    player.play().catch((error) => { diagnostic('AUDIO_PLAY_REJECTED', 'error', { itemId: item.id, sentence: sentenceIdx, details: { name: safeNamazErrorName(error) } }); failed(); });
  };
  const playFullItem = () => {
    stopAudio();
    if (VIRTUAL_NEW_ITEMS.some(item => item.id === activeItem.id)) return;
    diagnostic('PLAY_STARTED', 'info', { itemId: activeItem.id, details: { mode: 'full' } });
    const version = playbackVersionRef.current;
    setAudioError(null); setIsPlaying(true); setIsPlayingAll(true);
    const sentences = activeItem.sentences;
    let count = 1; setCurrentLoop(count);
    const finishLoop = (restart: () => void) => {
      if (version !== playbackVersionRef.current) return;
      if (targetLoopRef.current === 'infinite' || count < targetLoopRef.current) {
        count++; setCurrentLoop(count); restart();
      } else stopAudio();
    };
    if (!sentences?.length) {
      const playOnce = () => {
        if (version !== playbackVersionRef.current) return;
        const finish = () => finishLoop(playOnce);
        if (!activeItem.audioUrl) { speakArabic(activeItem.arabic, finish, version); return; }
        const player = getAudio(); let completed = false;
        const ended = () => { if (completed || version !== playbackVersionRef.current) return; completed = true; diagnostic('AUDIO_ENDED', 'info', { itemId: activeItem.id }); finish(); };
        const failed = () => {
          if (completed || version !== playbackVersionRef.current) return;
          completed = true; diagnostic('AUDIO_ERROR', 'error', { itemId: activeItem.id, details: { mediaCode: player.error?.code || 0 } }); player.onended = null; player.onerror = null; player.pause();
          speakArabic(activeItem.arabic, finish, version);
        };
        player.pause(); player.src = resolveNamazAudioUrl(activeItem.audioUrl, import.meta.env.BASE_URL, window.location.href); player.playbackRate = playbackSpeedRef.current;
        player.onended = ended; player.onerror = failed; player.play().catch((error) => { diagnostic('AUDIO_PLAY_REJECTED', 'error', { itemId: activeItem.id, details: { name: safeNamazErrorName(error) } }); failed(); });
      };
      playOnce(); return;
    }
    const playNext = (idx: number) => {
      if (version !== playbackVersionRef.current) return;
      if (idx >= sentences.length) { finishLoop(() => playNext(0)); return; }
      setActiveSentenceIdx(idx);
      playSentenceAudio(activeItem, idx, () => playNext(idx + 1), version);
    };
    playNext(0);
  };
  const playSentence = (idx: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isPlaying && activeSentenceIdx === idx && !isPlayingAll) { stopAudio(); return; }
    stopAudio();
    const version = playbackVersionRef.current;
    setAudioError(null); setActiveSentenceIdx(idx); setIsPlaying(true); setIsPlayingAll(false);
    diagnostic('PLAY_STARTED', 'info', { itemId: activeItem.id, sentence: idx, details: { mode: 'sentence' } });
    let count = 1; setCurrentLoop(count);
    const playOnce = () => {
      if (version !== playbackVersionRef.current) return;
      playSentenceAudio(activeItem, idx, () => {
        if (version !== playbackVersionRef.current) return;
        if (targetLoopRef.current === 'infinite' || count < targetLoopRef.current) {
          count++; setCurrentLoop(count); playOnce();
        } else stopAudio();
      }, version);
    };
    playOnce();
  };
  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    playbackSpeedRef.current = speed;
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const renderGunlukDualar = () => {
    return (
      <div className="space-y-6 text-left">
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1c3630]/40 border-[#3fb996]/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <h4 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
            Günlük Hayatta Okunan Sünnet Dualar ve Zikirler
          </h4>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Peygamber Efendimiz'in (s.a.v.) günlük hayatın her anında okuduğu ve tavsiye ettiği dualar
          </p>
        </div>
        
        {/* 1. Sabahleyin Evden Çıkarken */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
          <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-1">1. Sabahleyin Evden Çıkarken Okunur</span>
          <div dir="rtl" className={`p-3 rounded-lg border font-amiri text-center text-lg sm:text-xl md:text-2xl leading-loose mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
            بِسْمِ اللهِ تَوَكَّلْتُ عَلَى اللهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِىِّ الْعَظيمِ
          </div>
          <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
            <strong>Okunuşu:</strong> "Bismillâhi tevekkeltü 'alellâh. Lâ havle ve lâ kuvvete illâ billâhi'l-ʻaliyyi'l-'azîm."
          </p>
          <p className="text-xs text-slate-500 dark:text-[#8c826e]">
            <strong>Meal:</strong> Allah'ın adıyla başlarım, Allah'a güvendim; güç ve kuvvet ancak yüce ve büyük olan Allah'ın yardımıyladır.
          </p>
        </div>

        {/* 2. Uyurken ve Uyanınca */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
          <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-2">2. Uyurken ve Uyanınca Okunan Dualar</span>
          
          <div className="mb-4">
            <span className={`text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-800'} block mb-1`}>Uyurken (Yatarken):</span>
            <div dir="rtl" className={`p-3 rounded-lg border font-amiri text-center text-lg sm:text-xl md:text-2xl leading-loose mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              بِاسْمِكَ اللّٰهُمَّ اَمُوتُ وَاَحْيٰى
            </div>
            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> Bismikallâhumme emûtu ve ahyâ.
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e]">
              <strong>Meal:</strong> Allah’ım! Senin isminle ölür (uyur) ve senin isminle dirilirim (uyanırım).
            </p>
          </div>

          <div className={`pt-3 border-t ${isDark ? 'border-[#3a3226]' : 'border-slate-200'}`}>
            <span className={`text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-800'} block mb-1`}>Uyanınca:</span>
            <div dir="rtl" className={`p-3 rounded-lg border font-amiri text-center text-lg sm:text-xl md:text-2xl leading-loose mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              اَلْحَمْدُ لِلّٰهِ الَّذِي اَحْيَانَا بَعْدَ مَا اَمَاتَنَا وَاِلَيْهِ النُّشُورُ
            </div>
            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> Elhamdulillâhil-lezî ahyânâ ba’de mâ emâtenâ ve ileyhin-nuşûr.
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e]">
              <strong>Meal:</strong> Bizi öldürdükten (uyuttuktan) sonra dirilten (uyandıran) Allah’a hamdolsun. Dönüş yalnız O’nadır.
            </p>
          </div>
        </div>

        {/* 3. Tuvalete Girerken ve Çıkarken */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
          <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-2">3. Tuvalete Girerken ve Çıkarken Okunan Dualar (Duhûlü’l-Halâ / Hurûcü’l-Halâ)</span>
          
          <div className="mb-4">
            <span className={`text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-800'} block mb-1`}>Tuvalete Girerken (Sol ayakla):</span>
            <div dir="rtl" className={`p-3 rounded-lg border font-amiri text-center text-lg sm:text-xl md:text-2xl leading-loose mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              اَللّٰهُمَّ اِنّي اَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ
            </div>
            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> Allâhumme innî e’ûzu bike minel-hubusi vel-habâis.
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e]">
              <strong>Meal:</strong> Allah’ım! Pislikten ve pis şeylerden (erkek ve dişi şeytanların şerrinden) sana sığınırım.
            </p>
          </div>

          <div className={`pt-3 border-t ${isDark ? 'border-[#3a3226]' : 'border-slate-200'}`}>
            <span className={`text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-800'} block mb-1`}>Tuvaletten Çıkarken (Sağ ayakla):</span>
            <div dir="rtl" className={`p-3 rounded-lg border font-amiri text-center text-lg sm:text-xl md:text-2xl leading-loose mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              اَلْحَمْدُ للهِ الَّذِى اذْهَبَ عَنَّا الْاَذْى وَعَافَانى مِنْ ذُلِكَ
            </div>
            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> Elhamdulillâhil-lezî ezhebe ‘annil-ezâ ve ‘âfânî.
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e]">
              <strong>Meal:</strong> Bağışlamanı dilerim (Allah’ım). Benden eziyeti (rahatsızlık veren şeyleri) gideren ve bana afiyet veren Allah’a hamdolsun.
            </p>
          </div>
        </div>

        {/* 4. Binerken (Yolculuk Duası) */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
          <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-1">4. Taşıtlara Binerken (Yolculuk / Vasıta Duası)</span>
          <div dir="rtl" className={`p-3 rounded-lg border font-amiri text-center text-lg sm:text-xl md:text-2xl leading-loose mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
            بِسْمِ اللهِ مَجْزِيهَا وَمُرْسيهَا إِنَّ رَبِّى لَغَفُورٌ رَجِيمٌ
          </div>
          <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
            <strong>Okunuşu:</strong> Bismillâhi mecrâhâ ve mürsâhâ inne Rabbî le-Gafûrun Rahîm.
          </p>
          <p className="text-xs text-slate-500 dark:text-[#8c826e]">
            <strong>Meal:</strong> "Gemiye binin! Onun yüzüp gitmesi de, durması da Allah’ın adıyladır. Şüphesiz ki Rabbim çok bağışlayan, pek esirgeyendir." <em>(Hûd Suresi 41. Ayet)</em>
          </p>
        </div>

        {/* 5. Camiye Girerken ve Camiden Çıkarken */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
          <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-2">5. Camiye Girerken ve Camiden Çıkarken Okunan Dualar</span>
          
          <div className="mb-4">
            <span className={`text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-800'} block mb-1`}>Camiye Girerken (Sağ ayakla):</span>
            <div dir="rtl" className={`p-3 rounded-lg border font-amiri text-center text-lg sm:text-xl md:text-2xl leading-loose mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              اللّٰهُمَّ افْتَحْ لِي اَبْوَابَ رَحْمَتِكَ
            </div>
            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> Allâhummeftaḩ lî ebvâbe rahmetik.
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e]">
              <strong>Meal:</strong> Allah’ım! Bana rahmetinin kapılarını aç.
            </p>
          </div>

          <div className={`pt-3 border-t ${isDark ? 'border-[#3a3226]' : 'border-slate-200'}`}>
            <span className={`text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-800'} block mb-1`}>Camiden Çıkarken (Sol ayakla):</span>
            <div dir="rtl" className={`p-3 rounded-lg border font-amiri text-center text-lg sm:text-xl md:text-2xl leading-loose mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              اللّٰهُمَّ اِنِّي اَسْاَلُكَ مِنْ فَضْلِكَ
            </div>
            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> Allâhumme innî es’eluke min fadlik.
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e]">
              <strong>Meal:</strong> Allah’ım! Şüphesiz ben senin lütuf ve kereminden istiyorum.
            </p>
          </div>
        </div>

        {/* 6. Çarşıya veya Pazara Girerken */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
          <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-1">6. Çarşıya veya Pazara Girerken Okunan Dua</span>
          <div dir="rtl" className={`p-3 rounded-lg border font-amiri text-center text-lg sm:text-xl md:text-2xl leading-loose mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
            لَا اِلٰهَ اِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ حَيٌّ لَا يَمُوتُ بِيَدِهِ الْخَيْرُ وَهُوَ عَلٰى كُلِّ شَيْءٍ قَدِيرٌ
          </div>
          <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
            <strong>Okunuşu:</strong> Lâ ilâhe illallâhu vahdehû lâ şerîke leh, lehul-mulku ve lehul-hamdu yuhyî ve yumîtu ve huve hayyun lâ yemûtu biyadihil-hayru ve huve ‘alâ kulli şey’in kadîr.
          </p>
          <p className="text-xs text-slate-500 dark:text-[#8c826e]">
            <strong>Meal:</strong> Allah’tan başka ilah yoktur, O tektir, ortağı yoktur. Mülk O’nundur, hamd O’na mahsustur. O diriltir ve öldürür. O ise ölmeyen bir diridir. Bütün hayır O’nun elindedir ve O her şeye kadirdir.
          </p>
        </div>

        {/* 7. Hapşıran Kişinin ve Ona Karşılık Verenin Duası */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
          <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-2">7. Hapşıran Kişinin ve Ona Karşılık Verenin Duası</span>
          
          <div className="mb-3">
            <span className={`text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-800'} block mb-1`}>1) Hapşıran Kişi Der ki:</span>
            <div dir="rtl" className={`p-2.5 rounded-lg border font-amiri text-center text-lg sm:text-xl leading-loose mb-1.5 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              اَلْحَمْدُ لِلّٰهِ
            </div>
            <p className={`text-xs font-semibold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> Elhamdulillah. — <strong>Meal:</strong> Allah’a hamdolsun.
            </p>
          </div>

          <div className={`py-3 border-t ${isDark ? 'border-[#3a3226]' : 'border-slate-200'}`}>
            <span className={`text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-800'} block mb-1`}>2) Duyan Müslüman Cevap Verir:</span>
            <div dir="rtl" className={`p-2.5 rounded-lg border font-amiri text-center text-lg sm:text-xl leading-loose mb-1.5 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              يَرْحَمُكَ اللّٰهُ
            </div>
            <p className={`text-xs font-semibold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> Yerhamukellah. — <strong>Meal:</strong> Allah sana merhamet etsin.
            </p>
          </div>

          <div className={`pt-3 border-t ${isDark ? 'border-[#3a3226]' : 'border-slate-200'}`}>
            <span className={`text-xs font-bold ${isDark ? 'text-teal-400' : 'text-teal-800'} block mb-1`}>3) Hapşıran Kişi Tekrar Karşılık Verir:</span>
            <div dir="rtl" className={`p-2.5 rounded-lg border font-amiri text-center text-lg sm:text-xl leading-loose mb-1.5 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              يَهْدِيكُمُ اللّٰهُ وَيُصْلِحُ بَالَكُمْ
            </div>
            <p className={`text-xs font-semibold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> Yehdîkumullâhu ve yuslihu bâlekum. — <strong>Meal:</strong> Allah sizi hidayete erdirsin ve durumunuzu düzeltsin.
            </p>
          </div>
        </div>

        {/* 8. Aynaya Bakarken Okunan Dua */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
          <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-1">8. Aynaya Bakarken Okunan Dua</span>
          <div dir="rtl" className={`p-3 rounded-lg border font-amiri text-center text-lg sm:text-xl md:text-2xl leading-loose mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
            اَللّٰهُمَّ كَمَا حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي
          </div>
          <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
            <strong>Okunuşu:</strong> Allâhumme kemâ hassente halkî fehassin hulukî.
          </p>
          <p className="text-xs text-slate-500 dark:text-[#8c826e]">
            <strong>Meal:</strong> Allah’ım! Yaratılışımı güzel yaptığın gibi ahlakımı da güzelleştir.
          </p>
        </div>

        {/* 9. Su İçerken Okunan Dua ve Sünnet Adabı */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
          <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-2">9. Su İçerken Okunan Dua ve Sünnet Adabı</span>
          
          <div className="mb-4">
            <div className={`p-3 rounded-lg border text-xs leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#b9b09a]' : 'bg-white border-slate-200 text-slate-700'}`}>
              <span className="font-bold block mb-1 text-emerald-500">Su İçme Adabı & Sünnetler:</span>
              <ul className="space-y-1 list-disc pl-4">
                <li><strong>Oturarak İçmek:</strong> Suyu mümkün olduğunca oturarak içmek tavsiye edilir.</li>
                <li><strong>Sağ El Kullanmak:</strong> Bardak veya kap sağ ele alınır.</li>
                <li><strong>Üç Nefeste İçmek:</strong> Suyu bir defada dikmek yerine, üç nefeste yudum yudum ve dinlenerek içmek sünnettir.</li>
              </ul>
            </div>
          </div>

          <div className="mb-4">
            <span className={`text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-800'} block mb-1`}>1) Başlarken (Besmele):</span>
            <div dir="rtl" className={`p-3 rounded-lg border font-amiri text-center text-lg sm:text-xl md:text-2xl leading-loose mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ
            </div>
            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> Bismillâhirrahmânirrahîm.
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e]">
              <strong>Meal:</strong> Rahmân ve Rahîm olan Allah’ın adıyla.
            </p>
          </div>

          <div className={`pt-3 border-t ${isDark ? 'border-[#3a3226]' : 'border-slate-200'}`}>
            <span className={`text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-800'} block mb-1`}>2) Bitirince (Hamd Etmek):</span>
            <div dir="rtl" className={`p-3 rounded-lg border font-amiri text-center text-lg sm:text-xl md:text-2xl leading-loose mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              اَلْحَمْدُ لِلّٰهِ
            </div>
            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> Elhamdülillâh.
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e]">
              <strong>Meal:</strong> Allah’a hamdolsun. (Suyu bize içiren ve ferahlık veren Rabbimize şükürler olsun.)
            </p>
          </div>
        </div>

        {/* 10. Yemek Duâsı */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
          <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-1">10. Yemek Duâsı</span>
          <div dir="rtl" className={`p-3 rounded-lg border font-amiri text-center text-lg sm:text-xl md:text-2xl leading-loose mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
            الْحَمْدُ لِلهِ الْحَمْدُ لِلهِ الْحَمْدُ لِلهِ الَّذِى اَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ الْمُسْلِمِينَ. الْحَمْدُ لِلهِ رَتِّ الْعَالَمِينَ. وَالصَّلْاةُ وَالسَّلْامُ عَلى سَيّدِنَا مُحَمَّدٍ وَعَلى الِهِ وَصَحْبهِ اَجْمَعِينَ. "وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ" (٣ دفعه) اَللُّهُمَّ صَلَّ عَلى سَيِدِنَا مُحَمَّدٍ بِعَدَدِ انْوَاعِ الرِّرْقِ وَالْفُتُوحَاتِ يَا بَاسِطُ الَّذى يَبْسُطُ الرِّزْقَ لِمَنْ يَشَاءُ بِغَيْرِ حِسَابٍ. اُبْسُطْ عَلَيْنَا رِزْقًا وَاسِعًا مِنْ كُلِّ جِهَةٍ مِنْ خَزَائِنِ غَيْبِكَ بِغَيْرِ مِنَّةِ مَخْلُوقٍ بِمَحْضِِ فَضْلِ كَرَمِكَ بِغَيْرِ حِسَابٍ. يَا اَكْرَمَ الْاَكْرَمِينَ وَيَا اَرْحَمَ الرَّاحِمِينَ. اِقْتَحِ الْبَابَ يَا اَللهُ افْتَحِ الْبَابَ يَا الله اِفْتَحِ الْبَابَ يَا اللهُ يَا اللهُ يَا كَافى يَا فَتَّاحُ يَا مُفَتِّحُ فَتِّحْ بِالْخَيْرِ. اَللُّهُمَّ اغْفِرْ صَاحِبَ هُذَا الطَّعَامِ وَالْأكِلِينَ. اللُّهُمَّ اجْعَلْ دَوْلَتَنَا دَائِمًا اوْلَادَنَا عَالِمًا صَالِحًا وَلَا تُسَلِّطْ عَلَيْنَا ظَالِمًا اللُّهُمَّ رِدْ وَلَا تَنْقُص نِعْمَةً كَثِيرَةً بِحُرْمَةِ الْفَاتِحَةِ.
          </div>
          <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
            <strong>Okunuşu:</strong> Elhamdü lillâh. Elhamdü lillâh. Elhamdū lillâhillezî et'amenâ ve sekânâ ve ce'alenâ mine'l-müslimîn. Elhamdü lillâhi Rabbil-'âlemin. Vessalâtü vesselâmü 'alâ seyyidinâ Muhammedin ve 'alâ âlihî ve sahbihî ecme'în. "Va'fü 'anna vagfir lena verhamna ente mevlânâ fensumnâ 'ale'l-kavmi'l-kâfirîn." (3 defa) Allâhümme salli 'alâ seyyidinâ Muhammedin bi 'adedi envâ'ı'r-rizkı ve'l-fütûhât. Yâ bâsitullezî yebsüturrizka limen yeşāü bi ģayri hisab. Übsut aleyna rizkan vâsi'an min külli cihetin min hazâini gaybike bi gayri minneti mahlükın bi mahżı fażlı keramike bi ģayri hisab. Ya ekrame'l-ekramîne ve yâ erhame'r-râhımîn. İftehi'l-bâbe yâ Allah, İftehi'l-bâbe ya Allah, İftehi'l-bâbe ya Allâh, Yâ Allâhü yâ Kâfi, yâ Fettâhu yâ Müfettih fettih bi'l-hayr. Allâhümmağfir sâhibe hâze't-ta'âmi ve'l-âkilin. Allâhümmec'al devletenâ dimen evlâdenâ 'âlimen sâlihâ ve lâ tüsellit 'aleynâ zâlimâ. Allâhümme zid ve lâ tenkus ni'meten keşiraten bi hurmeti'l-Fâtiha.
          </p>
          <p className="text-xs text-slate-500 dark:text-[#8c826e]">
            <strong>Meal:</strong> Bizleri doyuran, susuzluğumuzu gideren ve bizi Müslümanlardan kılan Allah’a hamdolsun. Âlemlerin Rabbi olan Allah’a hamdolsun. Salât ve selâm Efendimiz Muhammed’in, onun ailesinin ve tüm ashabının üzerine olsun. Bizi affet, bizi bağışla, bize acı! Sen bizim Mevlamızsın. Kâfirler topluluğuna karşı bize yardım et. "Allah'ım! Rızıkların ve fetihlerin çeşitleri sayısınca Efendimiz Muhammed'e salât eyle. Ey dilediğine rızkı hesapsızca yayan (Bâsıt)! Kendi kereminin ve lütfunun fazlıyla, hiçbir mahlukatın minneti (başa kakması) olmadan, gayb hazinelerinden her bir cihetten üzerimize hesapsız ve geniş bir rızık yay (bereket ver). Ey ikram edenlerin en kerimlisi ve merhametlilerin en merhametlisi!" Kapıyı aç ey Allah'ım! (3 kez). Ey Kâfi (yeten), ey Fettâh (kapıları açan), ey Müfettih (hayır kapılarını aralayan)! Hayırla aç. Allah'ım! Bu yemeğin sahibini (ikram edeni) ve bu yemekten yiyenleri bağışla. Allah'ım! Devletimizi daim eyle, çocuklarımızı alim ve salih eyle, üzerimize zalimleri musallat etme. Allah'ım! Fatiha suresinin hürmetine (bu) bol nimeti artır, eksiltme.
          </p>
        </div>

        {/* 11. Ezan Duâsı */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
          <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-1">11. Ezan Duâsı (Ezan Okunduktan Sonra Okunan Dua)</span>
          <div dir="rtl" className={`p-3 rounded-lg border font-amiri text-center text-lg sm:text-xl md:text-2xl leading-loose mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
            اللَّهُمَّ رَبَّ هَٰذِهِ الدَّعْوَةِ التَّامَّةِ ، وَالصَّلَاةِ الْقَائِمَةِ ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ ، وَالدَّرَجَةَ الرَّفِيعَةَ ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ ، إِنَّكَ لَا تُخْلِفُ الْمِيعَادَ
          </div>
          <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
            <strong>Okunuşu:</strong> Allâhümme rabbe hâzihid-da'vetit-tâmmeh, ves-salâtil-kâimeh, âti Muhammedenil-vesîlete vel-fadîlete ved-dereceter-rafî'ah. Veb'ashü mekâmen mahmûdenillezî va'adteh. İnneke lâ tuhlifül-mî'âd.
          </p>
          <p className="text-xs text-slate-500 dark:text-[#8c826e]">
            <strong>Meal:</strong> Ey bu eksiksiz davetin (ezanın) ve kılınacak namazın Rabbi olan Allah’ım! Muhammed’e (s.a.v.) vesîleyi (cennetteki en yüksek makamı), fazileti ve yüksek dereceyi ver. Onu, kendisine vaat ettiğin Makâm-ı Mahmûd’a (en büyük şefaat makamına) ulaştır. Şüphesiz Sen vaadinden dönmezsin.
          </p>
        </div>

        {/* 12. Cenaze Duâsı */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
          <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-1">12. Cenaze Namazı Duâsı</span>
          <div dir="rtl" className={`p-3 rounded-lg border font-amiri text-center text-lg sm:text-xl md:text-2xl leading-loose mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
            اللَّهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا وَشَاهِدِنَا وَغَائِبِنَا وَكَبِيرِنَا وَصَغِيرِنَا وَذَكَرِنَا وَأُنْثَانَا ، اللَّهُمَّ مَنْ أَحْيَيْتَهُ مِنَّا فَأَحْيِهِ عَلَى الْإِسْلَامِ ، وَمَنْ تَوَفَّيْتَهُ مِنَّا فَتَوَفَّهُ عَلَى الْإِيمَانِ ، وَخُصَّ هَٰذَا الْمَيِّتَ بِالرَّوْحِ وَالرَّاحَةِ وَالْمَغْفِرَةِ وَالرِّضْوَانِ ، اللَّهُمَّ إِنْ كَانَ مُحْسِنًا فَزِدْ فِي إِحْسَانِهِ ، وَإِنْ كَانَ مُسِيئًا فَتَجَاوَزْ عَنْهُ ، وَلَقِّهِ الْأَمْنَ وَالْبُشْرَى وَالْكَرَامَةَ وَالزُّلْفَى بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِينَ
          </div>
          <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
            <strong>Okunuşu:</strong> Allâhümmağfir li-hayyinâ ve meyyitinâ ve şâhidinâ ve gâibinâ ve kebîrinâ ve sagîrinâ ve zekerinâ ve ünsânâ. Allâhümme men ahyeytehû minnâ fe-ahyihî 'alel-İslâm, ve men teveffeytehû minnâ fe-teveffehû 'alel-îmân. Ve hussa hâzel-meyyite bir-ravhi ver-râhati vel-mağfirati ver-rıdvân. Allâhümme in kâne muhsinen fe-zid fî ihsânih, ve in kâne müsîen fe-tecâvez 'anh, ve lakkıhil-emne vel-büşrâ vel-kerâmete vez-zülfâ bi-rahmetike yâ erhamer-râhimîn.
          </p>
          <p className="text-xs text-slate-500 dark:text-[#8c826e]">
            <strong>Meal:</strong> Allah’ım! Dirimizi ve ölümüzü, burada bulunanımızı ve bulunmayanımızı, büyüğümüzü ve küçüğümüzü, erkeğimizi ve kadınımızı bağışla. Allah’ım! Bizden yaşattıklarını İslam üzere yaşat, bizden vefat ettirdiklerini ise iman üzere vefat ettir. Özellikle bu cenazeyi kolaylık, rahatlık, mağfiret ve rızana kavuştur. Allah’ım! Eğer bu cenaze iyilik sahibi ise iyiliğini artır, eğer günahkâr ve kusurlu ise onu affet; onu güvene, müjdeye, ikrama ve yakınlığına eriştir. Rahmetinle ey merhametlilerin en merhametlisi!
          </p>
        </div>
      </div>
    );
  };

  const renderEvlilikDuasi = () => {
    return (
      <div className="space-y-6 text-left">
        {/* Üst Bilgi Kartı & Büyütme / Yazı Boyutu Ayar Paneli */}
        <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-[#1c3630]/40 border-[#3fb996]/30' : 'bg-emerald-50/60 border-emerald-200'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className={`w-5 h-5 shrink-0 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} />
                <h4 className={`text-base sm:text-lg font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
                  Evlilik Merasimi Duası
                </h4>
              </div>
              <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
                Nikâh akdinde, merasimlerde ve aile saadeti için okunan sünnet ve âyet-i kerimelerle bezeli mübarek dua.
              </p>
            </div>

            {/* Hızlı Büyütme Rozeti */}
            <div className={`inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${
              isDark ? 'bg-[#181510] border-[#3fb996]/40 text-[#3fb996]' : 'bg-white border-emerald-300 text-emerald-800 shadow-xs'
            }`}>
              <Type className="w-3.5 h-3.5" />
              <span>Yazı Boyutu: {fs.label}</span>
            </div>
          </div>

          {/* Mobil & Masaüstü için İmleçli Yazı Boyutu / Büyütme Kaydırma Çubuğu (%100 - %250) */}
          <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-[#181510]/90 border-[#3a3226]' : 'bg-white/95 border-emerald-100 shadow-xs'}`}>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-extrabold flex items-center gap-1.5 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                  <span>🔍 Metin Boyutunu Ayarla (İmleçli Kaydırma Çubuğu):</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${isDark ? 'bg-[#211d16] text-[#3fb996] border border-[#3fb996]/30' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                  {fs.label}
                </span>
              </div>

              {/* İmleçli Slider (Range Input) */}
              <div className="flex items-center gap-3 px-1 py-1">
                <span className={`text-[10px] font-bold ${isDark ? 'text-[#b9b09a]' : 'text-slate-500'}`}>%100</span>
                <input
                  type="range"
                  min="100"
                  max="450"
                  step="5"
                  value={fontSizePercent}
                  onChange={(e) => changeFontSizePercent(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 dark:bg-[#3a3226] rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-[#3fb996]"
                  title="İmleci sürükleyerek yazı boyutunu %100 ile %250 arasında hassas şekilde ayarlayın"
                />
                <span className={`text-[10px] font-bold ${isDark ? 'text-[#b9b09a]' : 'text-slate-500'}`}>%450</span>
              </div>


            </div>
          </div>
        </div>

        {/* 1. ARAPÇA ORİJİNAL METİN */}
        {hideEvlilik1 ? (
          <div className={`p-3 rounded-xl border flex items-center justify-between ${isDark ? 'bg-[#181510]/60 border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-xs font-bold ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              1. Arapça Orijinal Metin (Gizlendi)
            </span>
            <button
              type="button"
              onClick={() => setHideEvlilik1(false)}
              className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all cursor-pointer"
            >
              + Aç
            </button>
          </div>
        ) : (
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHideEvlilik1(true)}
                  className="w-6 h-6 rounded-md bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/30 transition-all flex items-center justify-center text-xs font-bold cursor-pointer"
                  title="Bu bölümü kapat"
                >
                  ×
                </button>
                <span className="font-bold text-xs sm:text-sm text-emerald-500 uppercase tracking-wide">
                  1. Arapça Orijinal Metin
                </span>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${isDark ? 'bg-[#211d16] text-[#b9b09a]' : 'bg-slate-100 text-slate-600'}`}>
                Tam Harekeli Hat
              </span>
            </div>
            <div
              dir="rtl"
              className={`p-4 sm:p-6 rounded-xl border font-amiri text-center font-bold tracking-normal transition-all ${fs.arabicMain} ${
                isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-emerald-50/40 border-emerald-100 text-emerald-950'
              }`}
            >
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ
              <br />
              بَارَكَ اللّٰهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ. اَللّٰهُمَّ اجْعَلْ هٰذَا الْعَقْدَ مَيْمُونًا مُبَارَكًا، وَاجْعَلْ بَيْنَهُمَا أُلْفَةً وَمَحَبَّةً وَقَرَارًا، وَلَا تَجْعَلْ بَيْنَهُمَا نَفْرَةً وَفِتْنَةً وَفِرَارًا. اَللّٰهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا (خَيْرَهُ) وَخَيْرَ مَا جَبَلْتَهَا (جَبَلْتَهُ) عَلَيْهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا (شَرِّهِ) وَشَرِّ مَا جَبَلْتَهَا (جَبَلْتَهُ) عَلَيْهِ. وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً. رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا. رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ. رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ. وَصَلَّى اللّٰهُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ.
            </div>
          </div>
        )}

        {/* 2. ARAPÇA METNİN OKUNUŞU */}
        {hideEvlilik2 ? (
          <div className={`p-3 rounded-xl border flex items-center justify-between ${isDark ? 'bg-[#181510]/60 border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-xs font-bold ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              2. Arapça Metnin Okunuşu (Gizlendi)
            </span>
            <button
              type="button"
              onClick={() => setHideEvlilik2(false)}
              className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all cursor-pointer"
            >
              + Aç
            </button>
          </div>
        ) : (
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-2.5 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHideEvlilik2(true)}
                  className="w-6 h-6 rounded-md bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/30 transition-all flex items-center justify-center text-xs font-bold cursor-pointer"
                  title="Bu bölümü kapat"
                >
                  ×
                </button>
                <span className="font-bold text-xs sm:text-sm text-teal-500 uppercase tracking-wide">
                  2. Arapça Metnin Okunuşu
                </span>
              </div>
            </div>
            <div className={`p-4 sm:p-5 rounded-xl border leading-relaxed whitespace-pre-line transition-all ${fs.transliteration} ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#f1ecdd]' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400 mb-2">Bismillahirrahmanirrahîm.</p>
              <p>
                Bârekallâhu lekümâ ve bâreke aleykümâ ve cemea beynekümâ fî hayr. Allâhumme'c-'al hâze'l-akde meymûnen mubârakâ, ve'c-'al beynehumâ ulfeten ve mehebbeten ve karârâ, ve lâ tec'al beynehumâ nefreten ve fitneten ve firârâ. Allâhumme innî es'eluke hayrahâ (hayrahû) ve hayra mâ cebeltehâ (cebeltehû) aleyh, ve eûzu bike min şerrihâ (şerrihî) ve şerri mâ cebeltehâ (cebeltehû) aleyh. Ve min âyâtihî en halaka lekum min enfusikim ezvâcen li teskunû ileyhâ ve ceale beynekum meveddeten ve rahmeh. Rabbene'h-leb lenâ min ezvâcinâ ve zürriyyâtinâ kurrete a’yünin ve'c-alnâ lil-müttekîne imâmâ. Rabbene âtinâ fid-dünyâ haseneten ve fil-âhireti haseneten ve kınâ azâben-nâr. Rabbena tekabbel minnâ inneke entes-semîul-alîm. Ve sallallâhu alâ seyyidinâ muhammedin ve alâ âlihî ve sahbihî ecmeîn.
              </p>
            </div>
          </div>
        )} 
  {/* 3. ARAPÇA METNİN CÜMLE CÜMLE BÖLÜNMÜŞ HALİ */}
        {hideEvlilik3 ? (
          <div className={`p-3 rounded-xl border flex items-center justify-between ${isDark ? 'bg-[#181510]/60 border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-xs font-bold ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              📖 Arapça Metnin Cümle Cümle Bölünmüş Hali (Gizlendi)
            </span>
            <button
              type="button"
              onClick={() => setHideEvlilik3(false)}
              className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all cursor-pointer"
            >
              + Aç
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHideEvlilik3(true)}
                  className="w-6 h-6 rounded-md bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/30 transition-all flex items-center justify-center text-xs font-bold cursor-pointer"
                  title="Bu bölümü kapat"
                >
                  ×
                </button>
                <h4 className={`text-xs sm:text-sm md:text-base font-extrabold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                  📖 Arapça Metnin Cümle Cümle Bölünmüş Hali (Arapça, Okunuş ve Anlam)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSources(!showSources)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  showSources
                    ? isDark ? 'bg-[#3fb996] text-[#181510] border-[#3fb996]' : 'bg-emerald-600 text-white border-emerald-600'
                    : isDark ? 'bg-[#211d16] text-[#b9b09a] border-[#3a3226] hover:text-white' : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title="Kaynak bilgisi rozetlerini aç / kapat"
              >
                {showSources ? '📚 Kaynakları Gizle' : '📚 Kaynakları Göster'}
              </button>
            </div>

            {/* 1. Cümle */}
            <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide">
                  1. Giriş ve Nikah Tebrik Duası
                </span>
                {showSources && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${isDark ? 'bg-[#211d16] text-[#b9b09a]' : 'bg-white text-slate-600 border border-slate-200'}`}>
                    Ebû Dâvûd (Nikâh, 36); Tirmizî (Nikâh, 7)
                  </span>
                )}
              </div>
              <div dir="rtl" className={`p-3.5 rounded-lg border font-amiri text-center transition-all ${fs.arabicMain} ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
                بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ. بَارَكَ اللّٰهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ.
              </div>
              <p className={`transition-all ${fs.transliteration} ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                <strong>Okunuşu:</strong> "Bismillahirrahmanirahim. Bârakallâhu lekümâ ve bâreke aleykümâ ve cemea beynekümâ fî hayr."
              </p>
              <p className={`transition-all ${fs.meaningText} text-slate-500 dark:text-[#8c826e]`}>
                <strong>Anlamı:</strong> Rahmân ve Rahîm olan Allah’ın adıyla. Allah sizin için bu evliliği mübarek kılsın, üzerinize bereket versin ve aranızı hayırda birleştirsin.
              </p>
            </div>

            {/* 2. Cümle */}
            <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide">
                  2. Akdin Mübarek Olması ve Huzur Duası
                </span>
              </div>
              <div dir="rtl" className={`p-3.5 rounded-lg border font-amiri text-center transition-all ${fs.arabicMain} ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
                اَللّٰهُمَّ اجْعَلْ هٰذَا الْعَقْدَ مَيْمُونًا مُبَارَكًا، وَاجْعَلْ بَيْنَهُمَا أُلْفَةً وَمَحَبَّةً وَقَرَارًا، وَلَا تَجْعَلْ بَيْنَهُمَا نَفْرَةً وَفِتْنَةً وَفِرَارًا.
              </div>
              <p className={`transition-all ${fs.transliteration} ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                <strong>Okunuşu:</strong> "Allâhümme-c’al hâzel-akda meymûnen mübâraken, vec’al beynehüme ülfeten ve mehabbeten ve karârâ, ve lâ tec’al beynehüme nefreten ve fitneten ve firârâ."
              </p>
              <p className={`transition-all ${fs.meaningText} text-slate-500 dark:text-[#8c826e]`}>
                <strong>Anlamı:</strong> Allah'ım! Bu akdi kutlu ve bereketli kıl; aralarında ülfet (uyum/dostluk), sevgi ve huzur kıl; aralarında nefret, fitne ve kaçışma yaratma.
              </p>
            </div>

            {/* 3. Cümle */}
            <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide">
                  3. Eşin Hayrını İstemek ve Şerrinden Sığınmak
                </span>
                {showSources && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${isDark ? 'bg-[#211d16] text-[#b9b09a]' : 'bg-white text-slate-600 border border-slate-200'}`}>
                    Ebû Dâvûd (Nikâh, 45); İbn Mâce (Nikâh, 27)
                  </span>
                )}
              </div>
              <div dir="rtl" className={`p-3.5 rounded-lg border font-amiri text-center transition-all ${fs.arabicMain} ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
                اَللّٰهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا جَبَلْتَهَا عَلَيْهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا جَبَلْتَهَا عَلَيْهِ.
              </div>
              <p className={`transition-all ${fs.transliteration} ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                <strong>Okunuşu:</strong> "Allâhümme innî es’elüke hayrehâ ve hayra mâ cebeltehâ aleyhi, ve eûzü bike min şerrihâ ve şerri mâ cebeltehâ aleyhi."
              </p>
              <p className={`transition-all ${fs.meaningText} text-slate-500 dark:text-[#8c826e]`}>
                <strong>Anlamı:</strong> Allah’ım! Senden onun hayrını ve tabiatına koyduğun hayırlı huyları dilerim; onun şerrinden ve tabiatındaki şerli huylardan da Sana sığınırım. <em>(Not: Metnin içindeki parantezli kullanımlara göre erkek için okunurken "خَيْرَهُ / جَبَلْتَهُ" şeklinde de okunabilir).</em>
              </p>
            </div>

            {/* 4. Cümle */}
            <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-teal-500 uppercase tracking-wide">
                  4. Evlilikle İlgili Âyet-i Kerime (Rûm Suresi, 21. Ayet)
                </span>
                {showSources && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${isDark ? 'bg-[#211d16] text-[#b9b09a]' : 'bg-white text-slate-600 border border-slate-200'}`}>
                    Rûm Suresi, 30/21. Ayet
                  </span>
                )}
              </div>
              <div dir="rtl" className={`p-3.5 rounded-lg border font-amiri text-center transition-all ${fs.arabicMain} ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
                وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً.
              </div>
              <p className={`transition-all ${fs.transliteration} ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                <strong>Okunuşu:</strong> "Ve min âyâtihî en halaka leküm min enfüsiküm ezvâcen li teskunû ileyhâ ve ceale beyneküm mevaddeten ve rahmeh."
              </p>
              <p className={`transition-all ${fs.meaningText} text-slate-500 dark:text-[#8c826e]`}>
                <strong>Anlamı:</strong> "Kendileriyle huzur bulasınız diye sizin için türünüzden eşler yaratması ve aranızda bir sevgi ve merhamet var etmesi O’nun (kudretinin) delillerindendir."
              </p>
            </div>

            {/* 5. Cümle */}
            <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-teal-500 uppercase tracking-wide">
                  5. Zürriyet ve Takva Duası - Âyet-i Kerime (Furkan Suresi, 74. Ayet)
                </span>
                {showSources && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${isDark ? 'bg-[#211d16] text-[#b9b09a]' : 'bg-white text-slate-600 border border-slate-200'}`}>
                    Furkan Suresi, 25/74. Ayet
                  </span>
                )}
              </div>
              <div dir="rtl" className={`p-3.5 rounded-lg border font-amiri text-center transition-all ${fs.arabicMain} ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
                رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا.
              </div>
              <p className={`transition-all ${fs.transliteration} ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                <strong>Okunuşu:</strong> "Rabbenâ heb lenâ min ezvâcinâ ve zürriyyâtinâ kurrete a’yünin vec’alnâ lil-müttekīne imâmâ."
              </p>
              <p className={`transition-all ${fs.meaningText} text-slate-500 dark:text-[#8c826e]`}>
                <strong>Anlamı:</strong> "Rabbimiz! Bize gözümüzü aydınlatacak eşler ve zürriyetler bağışla ve bizi takva sahiplerine önder kıl!"
              </p>
            </div>

            {/* 6. Cümle */}
            <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-teal-500 uppercase tracking-wide">
                  6. Dünya ve Ahiret İyiliği Duası - Âyet-i Kerime (Bakara Suresi, 201. Ayet)
                </span>
                {showSources && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${isDark ? 'bg-[#211d16] text-[#b9b09a]' : 'bg-white text-slate-600 border border-slate-200'}`}>
                    Bakara Suresi, 2/201. Ayet
                  </span>
                )}
              </div>
              <div dir="rtl" className={`p-3.5 rounded-lg border font-amiri text-center transition-all ${fs.arabicMain} ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
                رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.
              </div>
              <p className={`transition-all ${fs.transliteration} ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                <strong>Okunuşu:</strong> "Rabbenâ âtinâ fid-dünyâ haseneten ve fil-âhireti haseneten ve kınâ azâben-nâr."
              </p>
              <p className={`transition-all ${fs.meaningText} text-slate-500 dark:text-[#8c826e]`}>
                <strong>Anlamı:</strong> "Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver ve bizi cehennem azabından koru."
              </p>
            </div>

            {/* 7. Cümle */}
            <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide">
                  7. Kabul Duası
                </span>
                {showSources && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${isDark ? 'bg-[#211d16] text-[#b9b09a]' : 'bg-white text-slate-600 border border-slate-200'}`}>
                    Bakara Suresi, 2/127. Ayet (kısmen)
                  </span>
                )}
              </div>
              <div dir="rtl" className={`p-3.5 rounded-lg border font-amiri text-center transition-all ${fs.arabicMain} ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
                رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ.
              </div>
              <p className={`transition-all ${fs.transliteration} ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                <strong>Okunuşu:</strong> "Rabbenâ tekabbel minnâ inneke entes-semîul-alîm."
              </p>
              <p className={`transition-all ${fs.meaningText} text-slate-500 dark:text-[#8c826e]`}>
                <strong>Anlamı:</strong> "Rabbimiz! Bizden kabul buyur; şüphesiz sen hakkıyla işiten, en iyi bilensin."
              </p>
            </div>

            {/* 8. Cümle */}
            <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide">
                  8. Salavat ile Kapanış
                </span>
              </div>
              <div dir="rtl" className={`p-3.5 rounded-lg border font-amiri text-center transition-all ${fs.arabicMain} ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
                وَصَلَّى اللّٰهُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ.
              </div>
              <p className={`transition-all ${fs.transliteration} ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                <strong>Okunuşu:</strong> "Ve sallallâhu alâ seyyidinâ Muhammedin ve alâ âlihi ve sahbihi ecmaîn."
              </p>
              <p className={`transition-all ${fs.meaningText} text-slate-500 dark:text-[#8c826e]`}>
                <strong>Anlamı:</strong> Allah'ın salatü selamı efendimiz Muhammed'e, onun ehl-i beytine ve bütün sahabesinin üzerine olsun.
              </p>
            </div>
          </div>
        )}

        {/* 4. TÜRKÇE METİN */}
        {hideEvlilik4 ? (
          <div className={`p-3 rounded-xl border flex items-center justify-between ${isDark ? 'bg-[#181510]/60 border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-xs font-bold ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              3. Türkçe Metin (Nikâh Duası) (Gizlendi)
            </span>
            <button
              type="button"
              onClick={() => setHideEvlilik4(false)}
              className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all cursor-pointer"
            >
              + Aç
            </button>
          </div>
        ) : (
          <div className={`p-5 rounded-2xl border space-y-3.5 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHideEvlilik4(true)}
                className="w-6 h-6 rounded-md bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/30 transition-all flex items-center justify-center text-xs font-bold cursor-pointer"
                title="Bu bölümü kapat"
              >
                ×
              </button>
              <span className="font-bold text-xs text-cyan-500 uppercase tracking-wide block">
                3. Türkçe Metin (Nikâh Duası)
              </span>
            </div>
            <div className={`p-4 rounded-xl border ${fs.turkishText} space-y-4 transition-all ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#f1ecdd]' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 leading-relaxed">
                Elhamdülillâhi Rabbil-'âlemîn.<br />
                Es-salâtü ves-selâmü 'alâ Rasûlinâ Muhammedin ve 'alâ âlihî ve sahbihî ecma'în.
              </p>
              <p className="leading-relaxed">
                Yâ Rabbi<br />
                Senin emr-i ilâhini eda etmek,<br />
                Habib-i Kibriya Peygamber Efendimiz Sallallahu Aleyhi ve Sellem’in sünnet-i seniyyesini icra etmek üzere bir araya geldik.<br />
                Kurulan bu yuvayı mübarek eyle.
              </p>
              <p className="leading-relaxed">
                Allah’ım<br />
                Âdem aleyhisselam ile Havva validemiz,<br />
                Peygamber Efendimiz ile Hatice-i Kübra ve Âişe validelerimiz,<br />
                Hazret-i Ali ile Hazret-i Fâtımatü'z-Zehra validemiz arasındaki var olan o mukaddes sevgiyi ve ülfeti bu kardeşlerimize de nasip eyle.<br />
                Aralarında geçim, sadakat ve sebat ihsan eyle;<br />
                nefret, fitne, fücür, haset, geçimsizlik ve ayrılıktan koru.
              </p>
              <p className="leading-relaxed">
                Onlara secde birlikteliği, sofra birlikteliği ve sayfa birlikteliği nasip eyle;<br />
                Kur'an okuyan, okuduğunu anlayan ve yaşayanlardan eyle.<br />
                Varlıkta ve yoklukta birbirlerini anlayan derin bir anlayış ihsan eyle.<br />
                Dert verip derman aratma, gürültü patırtı ile ömürlerini daraltma.<br />
                Ömür boyu mesut, kurdukları yuvayı daim eyle.<br />
                Damadı çevresine örnek, gelini evinde melek olan kullarından eyle.
              </p>
              <p className="leading-relaxed">
                İnsi ve cinsi tüm kötülüklerden, nazar ve hasetten onları ve bizleri muhafaza eyle.<br />
                Mahkeme kapılarına düşmeyen, tek bir çatı altında huzurla ömür süren kullarından eyle.<br />
                Kendilerine acı ve ızdırabı olmayan hayırlı bir hayat ihsan eyle.
              </p>
              <p className="leading-relaxed">
                Yâ Rabbi<br />
                Biraz önce okumuş olduğumuz ayet-i kerimelerden Rûm Suresi’nde buyurduğun gibi:<br />
                <em>"İçinizden, kendileriyle huzura kavuşacağınız eşler yaratıp; aranızda muhabbet ve rahmet var etmesi, O'nun varlığının belgelerindendir."</em><br />
                Buyurduğun gibi Kalplerin yegâne sahibi sensin;<br />
                bu genç kardeşlerimizin kalplerini de birbirine ısındır,<br />
                aralarındaki sevgiyi, merhameti ve huzuru daim eyle.
              </p>
              <p className="leading-relaxed">
                Furkan Suresi’ndeki nida ile Sana iltica ediyoruz:<br />
                <em>"Rabbimiz Bize eşlerimizden ve nesillerimizden göz aydınlığı olacak kimseler lütfet ve bizi takva sahiplerine önder kıl."</em><br />
                Bu çiftimize; kendilerine, ailelerine, vatana, millete ve İslam’a hayırlı, namazlı niyazlı evlatlar ve torunlar ihsan eyle.
              </p>
              <p className="leading-relaxed">
                Bakara Suresi’nde öğrettiğin dua ile niyaz ediyoruz:<br />
                <em>"Rabbimiz Bize dünyada da iyilik ver, ahirette de iyilik ver ve bizi cehennem azabından koru."</em><br />
                Bu evliliği hem dünyaları hem de ahiretleri için iyilik ve bereket vesilesi eyle.<br />
                Bizleri, geçmişlerimizi ve bu genç kardeşlerimizi cehennem azabından muhafaza eyle.
              </p>
              <p className="leading-relaxed">
                Okunan bu ayet-i kerimeler ve Kur'an-ı Kerim’in kalbi olan Yâsîn-i Şerif hürmetine yapılan bu duaları;<br />
                Mescid-i Haram’da, Mescid-i Nebevî’de kabul edilen dualar zümresine ilhak eyle.<br />
                Uzaktan ve yakından bu merasime iştirak eden tüm kardeşlerimizin gönüllerindeki hayırlı muratlarını ihsan eyle.
              </p>
              <p className="pt-3 border-t border-slate-200 dark:border-[#3a3226] space-y-2 leading-relaxed">
                Hayırların fethi,<br />
                şerlerin def'i,<br />
                Ümmet-i Muhammed’in sıhhati, selameti<br />
                ve yeniden daha güçlü bir şekilde hüviyet-i asliyesine dönmesini nasip ve müyesser eyle;<br />
                geçmişlerimizin ruhu ve bilhassa Senin rıza-yı şerifin için...
                <br /><br />
                <strong className="text-emerald-600 dark:text-emerald-400 block pt-1">
                  Sübhâne rabbike rabbil-izzeti 'ammâ yasifûn.<br />
                  Ve selâmün 'alel-mürselîn.<br />
                  Vel-hamdü lillâhi rabbil-'âlemîn.<br />
                  Lillâhi teâlâ El-Fâtiha.
                </strong>
              </p>
            </div>
          </div>
        )}
       
      </div>
    );
  };

  // Pratik Namaz Rehberi İnteraktif State'leri
  const [selectedKaleLayer, setSelectedKaleLayer] = useState<number>(0);
  const [activeVakitBio, setActiveVakitBio] = useState<number>(0);
  const [dismissedVesvese, setDismissedVesvese] = useState<number[]>([]);
  const [activeScienceTab, setActiveScienceTab] = useState<number>(0);
  const [satrancHighlight1, setSatrancHighlight1] = useState<'row' | 'col'>('row');
  const [satrancHighlight2, setSatrancHighlight2] = useState<'row' | 'col'>('row');
  const [foundClues, setFoundClues] = useState<string[]>([]);
  const [puzzleInputs, setPuzzleInputs] = useState<{ c1: string; c2: string; c3: string; c4: string }>({
    c1: '',
    c2: '',
    c3: '',
    c4: ''
  });

  const handleFindClue = (clueKey: 'c1' | 'c2' | 'c3' | 'c4', textVal: string) => {
    if (!foundClues.includes(clueKey)) {
      setFoundClues((prev) => [...prev, clueKey]);
    }
    setPuzzleInputs((prev) => ({ ...prev, [clueKey]: textVal }));
  };

  const renderPratikNamazRehberi = () => {
    const kaleLayers = [
      {
        title: '1. Merkez Ana Kale: İman ve Farzlar',
        subtitle: 'En İçteki Sarsılmaz Merkez (İlk Adım)',
        desc: 'En içte imanımız ve hemen etrafında 5 vakit namazın farzları (Sabahın kuvvetli sünneti ve Yatsının vacip olan Vitir namazı ile birlikte) bulunur. İlk etapta bütün gücümüzle bu ana kaleyi sağlamlaştırıyoruz!',
        badge: 'İlk Hedefimiz',
        color: 'from-emerald-600 to-teal-700',
        ringSize: 'w-28 h-28 sm:w-32 sm:h-32'
      },
      {
        title: '2. İç Sur: Vacipler',
        subtitle: 'Ana Kaleyi Kuşatan İlk Koruma Duvarı',
        desc: 'Farzların hemen dışındaki koruyucu surdur (Yatsı namazı sonrasındaki 3 rekatlık Vitir namazı ve Bayram namazları gibi). Ana kaleyi doğrudan korur.',
        badge: '2. Kalkan',
        color: 'from-teal-600 to-cyan-700',
        ringSize: 'w-44 h-44 sm:w-48 sm:h-48'
      },
      {
        title: '3. Orta Sur: Sünnetler',
        subtitle: 'Peygamber Efendimiz’e (s.a.v.) Sevgimizin Nişanesi',
        desc: 'Vakit namazlarının sünnetleridir. Peygamber Efendimiz’i ne kadar sevdiğimizi ve onun yolundan ne kadar gittiğimizi gösteren çok kıymetli surlardır; farzlar oturduktan sonra zamanla hayatımıza dahil olur.',
        badge: '3. Kalkan',
        color: 'from-teal-500 to-emerald-600',
        ringSize: 'w-60 h-60 sm:w-64 sm:h-64'
      },
      {
        title: '4. Dış Sur: Müstehaplar ve Âdâb',
        subtitle: 'İbadetin Güzelliğini ve Huşûsunu Artıran Burçlar',
        desc: 'Namazı ve abdesti daha zarif, daha bilinçli ve huşû içinde kılmamızı sağlayan inceliklerdir.',
        badge: '4. Kalkan',
        color: 'from-indigo-500 to-purple-600',
        ringSize: 'w-76 h-76 sm:w-80 sm:h-80'
      },
      {
        title: '5. Dış Hendek & Kuleler: Nafileler',
        subtitle: 'Teheccüd, Kuşluk, Evvâbîn ve Tesbih Namazları',
        desc: 'Kulu Allah’a yakınlaştıran ekstra ikram kaleleridir. Dıştan gelebilecek ihmalkârlık oklarını en uçta karşılar ve içteki farz kalesine zarar gelmesini önler.',
        badge: '5. Kalkan',
        color: 'from-rose-500 to-pink-600',
        ringSize: 'w-92 h-92 sm:w-96 sm:h-96'
      }
    ];

    const bioVakitler = [
      {
        vakit: 'Sabah Namazı',
        saat: '06.30',
        sure: '10 dk',
        detay: '2 Rekat Sünnet + 2 Rekat Farz + Abdest',
        etki: 'Güne zinde uyanmak, gece boyu biriken negatif enerjiyi atmak ve kalp-damar ritmini sağlıklı şekilde uyandırmak içindir.',
        tip: 'Tek Vakit'
      },
      {
        vakit: 'Öğle Namazı',
        saat: '15.25',
        sure: '10 dk',
        detay: 'Sadece 4 Rekat Farz + Abdest',
        etki: 'Hayat ve iş koşturmacası tam zirvedeyken kısa bir mola verip derin bir nefes almak, zihni sıfırlamak içindir.',
        tip: '1. Birleşik'
      },
      {
        vakit: 'İkindi Namazı',
        saat: '15.55',
        sure: '5 dk',
        detay: 'Sadece 4 Rekat Farz (Öğle abdestiyle)',
        etki: 'Günün yorgunluğu çökerken bedeni, eklemleri ve zihni yeniden şarj etmek içindir.',
        tip: '1. Birleşik'
      },
      {
        vakit: 'Akşam Namazı',
        saat: '20.25',
        sure: '10 dk',
        detay: '3 Rekat Farz + Abdest',
        etki: 'Gün içindeki iş stresinden ve dünyevi sıkıntılardan tamamen sıyrılıp akşam huzuruna geçmek içindir.',
        tip: '2. Birleşik'
      },
      {
        vakit: 'Yatsı & Vitir',
        saat: '20.45',
        sure: '10 dk',
        detay: '4 Rekat Farz + 3 Rekat Vitir (Akşam abdestiyle)',
        etki: 'Karanlık çökerken ruhu dinlendirmek ve huzurlu bir uykuyla bir sonraki güne hazırlanmak içindir.',
        tip: '2. Birleşik'
      }
    ];

    const normalizeText = (s: string) =>
      s
        .toLocaleLowerCase('tr-TR')
        .replace(/[’'`^âîû-]/g, (m) => {
          if (m === 'â') return 'a';
          if (m === 'î') return 'i';
          if (m === 'û') return 'u';
          return ' ';
        })
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/\s+/g, ' ')
        .trim();

    const isC1Correct =
      foundClues.includes('c1') ||
      normalizeText(puzzleInputs.c1).includes('merd i hak') ||
      normalizeText(puzzleInputs.c1).includes('merdi hak');
    const isC2Correct =
      foundClues.includes('c2') ||
      normalizeText(puzzleInputs.c2).includes('ruz u seb') ||
      normalizeText(puzzleInputs.c2).includes('ruzu seb');
    const isC3Correct =
      foundClues.includes('c3') ||
      normalizeText(puzzleInputs.c3).includes('ask ile');
    const isC4Correct =
      foundClues.includes('c4') ||
      normalizeText(puzzleInputs.c4).includes('kilan kiyam');

    const solvedCount = [isC1Correct, isC2Correct, isC3Correct, isC4Correct].filter(Boolean).length;
    const isPuzzleSolved = solvedCount === 4;

    return (
      <div className="space-y-8 text-left">
        {/* 1. SATRANÇ ŞİİRİ (GİRİŞ MAKAMI) */}
        <div className={`p-5 sm:p-6 rounded-3xl border relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-[#1c322b]/80 via-[#181510] to-[#162722] border-teal-500/40' : 'bg-gradient-to-br from-teal-50 via-white to-emerald-50/50 border-teal-200 shadow-xs'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${isDark ? 'bg-teal-950/80 text-teal-300 border-teal-500/40' : 'bg-teal-100 text-teal-900 border-teal-300'}`}>
              ♟️ 1. Vezn-i Âhar Makamı
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSatrancHighlight1('row')}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                  satrancHighlight1 === 'row'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : isDark ? 'bg-[#211d16] text-[#b9b09a]' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Soldan Sağa
              </button>
              <button
                type="button"
                onClick={() => setSatrancHighlight1('col')}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                  satrancHighlight1 === 'col'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isDark ? 'bg-[#211d16] text-[#b9b09a]' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Yukarıdan Aşağıya
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center my-3">
            {[
              ['Zikr-i Hakk ile', 'rûh-ı nâzenîn', 'bulur şifâ,'],
              ['Rûh-ı nâzenîn', 'bulur şifâ,', 'dilde safâ, nûr-ı hudâ,'],
              ['Bulur şifâ,', 'dilde safâ, nûr-ı hudâ,', 'aşk-ı vefâ.']
            ].map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const isFirstHighlight =
                  (satrancHighlight1 === 'row' && rIdx === 0) ||
                  (satrancHighlight1 === 'col' && cIdx === 0);
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`p-2.5 sm:p-3 rounded-xl border font-serif italic text-xs sm:text-sm font-semibold transition-all ${
                      isFirstHighlight
                        ? satrancHighlight1 === 'row'
                          ? isDark
                            ? 'bg-teal-950/80 border-teal-400 text-teal-200 ring-1 ring-teal-400/50'
                            : 'bg-teal-100/90 border-teal-400 text-teal-950 shadow-xs'
                          : isDark
                          ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/50'
                          : 'bg-emerald-100/90 border-emerald-400 text-emerald-950 shadow-xs'
                        : isDark
                        ? 'bg-[#181510]/90 border-[#3a3226] text-[#f1ecdd]'
                        : 'bg-white/90 border-slate-200 text-slate-800'
                    }`}
                  >
                    {cell}
                  </div>
                );
              })
            )}
          </div>

          <div className={`mt-3 p-3 rounded-xl border text-xs leading-relaxed ${isDark ? 'bg-[#181510]/70 border-[#3a3226] text-[#b9b09a]' : 'bg-white/80 border-teal-100 text-slate-600'}`}>
            <strong className={isDark ? 'text-teal-400' : 'text-teal-800'}>✨ Anlamı:</strong> Allah'ı anmakla (namaz ve zikirle) o narin ruh şifa bulur; gönülde saflık ve huzur, ilahi hidayet nuru ve sadakat dolu bir sevgi uyanır.
          </div>
        </div>

        {/* ANA BAŞLIK & SAMİMİ GİRİŞ + HIZLI FORMÜL KARTI */}
        <div className={`p-6 rounded-3xl border space-y-4 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/15 text-teal-600 dark:text-teal-300 border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Yeni Başlayanlar, Ara Verenler ve Hiç Kılmayanlar İçin Sohbet Rehberi</span>
          </div>

          <h3 className={`text-lg sm:text-xl md:text-2xl font-extrabold leading-snug ${isDark ? 'text-[#f1ecdd]' : 'text-slate-900'}`}>
            Yeni Başlayanlar İçin Pratik ve Bilimsel Namaz Rehberi
          </h3>

          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Tek seferde okumak size zor geliyorsa, <em>"Vaktim yok"</em>, <em>"Metin çok uzun, okuyamam"</em> ya da <em>"Sonra başlarım"</em> diyorsanız, bu rehber bütün ezberlerinizi bozacak. Gelin her şeyi bir kenara bırakıp önce sadece rakamlara ve pratik formülümüze odaklanalım!
          </p>

          {/* FORMÜL KUTUSU: 1 TEK 2 BİRLEŞİK */}
          <div className={`p-5 rounded-2xl border-2 border-dashed ${isDark ? 'bg-teal-950/30 border-teal-500/50' : 'bg-teal-50/70 border-teal-400'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-300 block">
                  ⚡ Hemen Bakıp Çıkacaklar İçin Altın Formülün İsmi:
                </span>
                <h4 className={`text-base sm:text-lg font-black ${isDark ? 'text-teal-300' : 'text-teal-900'}`}>
                  "1 Tek • 2 Birleşik" Formülü 😊
                </h4>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
                  Namazın ne kadar vaktimizi aldığını hiç kronometre ile ölçtünüz mü? Sadece farzları kıldığımızı düşünerek adım adım bakalım:
                </p>
              </div>
              <span className={`px-3.5 py-2 rounded-xl text-xs font-extrabold self-start shrink-0 ${isDark ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'bg-teal-700 text-white'}`}>
                Günlük Toplam: Sadece 45 Dakika!
              </span>
            </div>

            <div className="space-y-3.5">
              {/* 1. ADIM: 1 TEK (SABAH) */}
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-teal-200'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-teal-500/20">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-teal-500/20 text-teal-400 border border-teal-500/30">
                      1. Adım: TEK VAKİT
                    </span>
                    <span className={`text-xs sm:text-sm font-extrabold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-900'}`}>
                      ☀️ Sabah Namazı
                    </span>
                  </div>
                  <span className="text-xs font-black px-3 py-1 rounded-xl bg-teal-600 text-white">
                    Toplam: 10 Dakika
                  </span>
                </div>

                <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-teal-50/50 border-teal-100'}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-teal-500/20 text-teal-400 dark:text-teal-300">
                      Saat 06.30
                    </span>
                    <span className={`text-xs sm:text-sm font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                      Sabah Namazı
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className={`px-2.5 py-1 rounded-lg border font-semibold ${isDark ? 'bg-[#181510] border-[#3a3226] text-[#b9b09a]' : 'bg-white border-slate-200 text-slate-700'}`}>
                      2 Rekat Sünnet
                    </span>
                    <span className="font-bold text-teal-500">+</span>
                    <span className={`px-2.5 py-1 rounded-lg border font-semibold ${isDark ? 'bg-[#181510] border-[#3a3226] text-[#b9b09a]' : 'bg-white border-slate-200 text-slate-700'}`}>
                      2 Rekat Farz
                    </span>
                    <span className="font-bold text-teal-500">+</span>
                    <span className={`px-2.5 py-1 rounded-lg border font-semibold ${isDark ? 'bg-[#181510] border-[#3a3226] text-[#b9b09a]' : 'bg-white border-slate-200 text-slate-700'}`}>
                      Abdest
                    </span>
                    <span className="font-bold text-teal-500">=</span>
                    <span className="px-2.5 py-1 rounded-lg font-black bg-teal-500/20 text-teal-400">
                      10 dk
                    </span>
                  </div>
                </div>

                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
                  💬 <strong>Dostça bir gerçek:</strong> Sabah uyanınca zaten tuvalete girip elinizi yüzünüzü yıkıyorsunuz; buna kollarınızı, başınızı ve ayaklarınızı eklemek inanın <strong>1 dakikadan fazla değil!</strong>
                </p>
              </div>

              {/* 2. ADIM: 1. BİRLEŞİK (ÖĞLE + İKİNDİ) */}
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-teal-200'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      2. Adım: 1. BİRLEŞİK VAKİT
                    </span>
                    <span className={`text-xs sm:text-sm font-extrabold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-900'}`}>
                      🌤️ Öğle + İkindi (Tek Abdestle Peş Peşe)
                    </span>
                  </div>
                  <span className="text-xs font-black px-3 py-1 rounded-xl bg-cyan-700 text-white">
                    İkisi Toplam: 15 Dakika
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2">
                  {/* Öğle Satırı */}
                  <div className={`p-3 rounded-xl border flex flex-col justify-between gap-2 ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-cyan-50/50 border-cyan-100'}`}>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-cyan-500/20 text-cyan-400 dark:text-cyan-300">
                        Saat 15.25 (Öğle Sonu)
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-cyan-500/20 text-cyan-400">
                        10 dk
                      </span>
                    </div>
                    <div className={`text-xs font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                      Öğle Namazı: <span className="font-normal">Sadece 4 Rekat Farz + Abdest</span>
                    </div>
                  </div>

                  {/* İkindi Satırı */}
                  <div className={`p-3 rounded-xl border flex flex-col justify-between gap-2 ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-cyan-50/50 border-cyan-100'}`}>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-teal-500/20 text-teal-400">
                        Saat 15.55 (İkindi Girişi)
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-teal-500/20 text-teal-400">
                        5 dk
                      </span>
                    </div>
                    <div className={`text-xs font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                      İkindi Namazı: <span className="font-normal">Sadece 4 Rekat Farz (Mevcut Abdestle)</span>
                    </div>
                  </div>
                </div>

                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
                  💡 Öğle vaktinin çıkmasına yakın abdest alıp 4 rekat farzı kılın (10 dk); biraz dinlenip ikindi girince <strong>aynı abdestle</strong> 4 rekat farzı (5 dk) kılın. Tek abdestle iki vakit tamam!
                </p>
              </div>

              {/* 3. ADIM: 2. BİRLEŞİK (AKŞAM + YATSI) */}
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-teal-200'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-indigo-500/20">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      3. Adım: 2. BİRLEŞİK VAKİT
                    </span>
                    <span className={`text-xs sm:text-sm font-extrabold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-900'}`}>
                      🌙 Akşam + Yatsı & Vitir (Tek Abdestle Peş Peşe)
                    </span>
                  </div>
                  <span className="text-xs font-black px-3 py-1 rounded-xl bg-indigo-600 text-white">
                    İkisi Toplam: 20 Dakika
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2">
                  {/* Akşam Satırı */}
                  <div className={`p-3 rounded-xl border flex flex-col justify-between gap-2 ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-indigo-50/50 border-indigo-100'}`}>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-indigo-500/20 text-indigo-400">
                        Saat 20.25 (Akşam Sonu)
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-indigo-500/20 text-indigo-400">
                        10 dk
                      </span>
                    </div>
                    <div className={`text-xs font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                      Akşam Namazı: <span className="font-normal">3 Rekat Farz + Abdest</span>
                    </div>
                  </div>

                  {/* Yatsı Satırı */}
                  <div className={`p-3 rounded-xl border flex flex-col justify-between gap-2 ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-indigo-50/50 border-indigo-100'}`}>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-teal-500/20 text-teal-400">
                        Yatsı Vakti Girişi
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-teal-500/20 text-teal-400">
                        10 dk
                      </span>
                    </div>
                    <div className={`text-xs font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                      Yatsı Namazı: <span className="font-normal">4 Rekat Farz + 3 Rekat Vitir (Aynı Abdestle)</span>
                    </div>
                  </div>
                </div>

                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
                  💡 Akşam vaktinin sonuna doğru abdest alıp akşamın farzını (10 dk), yatsı ezanı okununca da aynı abdestle yatsının farzı ve vitir namazını (10 dk) kolayca eda edebilirsiniz.
                </p>
              </div>
            </div>

            {/* NET MATEMATİK ÖZETİ & GİZLİ İPUCU 1 */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-teal-500/20">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-400">Sabah: 10 dk</span>
                <span>+</span>
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-400">Öğle & İkindi: 15 dk</span>
                <span>+</span>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-400">Akşam & Yatsı: 20 dk</span>
                <span>=</span>
                <span className={`px-3 py-1 rounded-lg font-black ${isDark ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-emerald-600 text-white'}`}>
                  Toplam Sadece 45 Dakika!
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleFindClue('c1', 'Merd-i Hak’tır')}
                className={`text-[11px] px-3 py-1.5 rounded-full font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                  foundClues.includes('c1')
                    ? 'bg-emerald-600 text-white'
                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30'
                }`}
                title="En alttaki Şiir bulmacası için 1. gizli anahtar!"
              >
                <span>🔑 1. Şiir Anahtarı: <strong>"Merd-i Hak’tır"</strong></span>
                <span>{foundClues.includes('c1') ? '✓ Eklendi' : '(Bulmacaya Ekle)'}</span>
              </button>
            </div>
          </div>

          {/* HIZLI BAKIŞ & SOSYAL MEDYA / BORÇ MATEMATİĞİ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-xs font-bold text-teal-500 uppercase block mb-1">📱 Hızlı Bir Bakış:</span>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-700'}`}>
                Bugün Instagram'a, YouTube'a veya televizyona daldığımızda <strong>1 saatin (60 dk)</strong> nasıl geçtiğini bile anlamıyoruz. Sonsuzluk yurdumuz ve ruh sağlığımız için günde <strong>45 dakika</strong> ayırmak inanın hiç zor değil.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#211d16] border-teal-500/30' : 'bg-teal-50/60 border-teal-200'}`}>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase block mb-1.5">📊 Çarpıcı Rakamlar:</span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className={`p-2 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-teal-200'}`}>
                  <div className="text-xs sm:text-sm font-black text-cyan-500">1.825 Vakit</div>
                  <div className="text-[10px] text-slate-400">1 Yıllık Namaz Borcu</div>
                </div>
                <div className={`p-2 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-teal-200'}`}>
                  <div className="text-xs sm:text-sm font-black text-teal-500">1.800 Gün</div>
                  <div className="text-[10px] text-slate-400">60 Yıllık Oruç Borcu</div>
                </div>
                <div className={`p-2 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-teal-200'}`}>
                  <div className="text-xs sm:text-sm font-black text-rose-500">109.500 Vakit</div>
                  <div className="text-[10px] text-slate-400">60 Yıllık Namaz Borcu</div>
                </div>
              </div>
              <p className={`text-[11px] mt-2 italic ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
                Yani biri <em>"Oruç kolay, onu tutarım ama namazı sonraya bırakırım"</em> diyorsa, işin aslı zaten ortadadır.
              </p>
            </div>
          </div>
        </div>

        {/* 1. ÖZLÜ SÖZ & MÜKEMMELİYETÇİLİĞİ BIRAKIN, DEVAMLILIĞA ODAKLANIN */}
        <div className={`p-6 rounded-3xl border space-y-5 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200 shadow-xs'}`}>
          {/* 1. Özlü Söz */}
          <blockquote className={`p-4 rounded-2xl border-l-4 italic text-sm sm:text-base font-semibold ${isDark ? 'bg-[#211d16] border-teal-400 text-teal-200' : 'bg-teal-50/70 border-teal-600 text-teal-950'}`}>
            "Namaz, üzerimize yüklenen bir görevden ziyade, ruhun dinlendiği bir sığınaktır."
          </blockquote>

          <h4 className={`text-base sm:text-lg font-extrabold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-900'}`}>
            🌱 Mükemmeliyetçiliği Bırakın, Devamlılığa Odaklanın
          </h4>

          <div className={`space-y-3 text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-700'}`}>
            <p>
              Günlük telaş içinde namazın unutulması veya gecikmesi doğaldır. Namazları tam vaktinde kılmak elbette en efdali (en güzeli) olsa da, <strong>"İlla dört dörtlük ve ilk dakikasında kılacağım"</strong> diye yola çıkıp vakit biraz gecikince motivasyonu kırılıp namazı tamamen bırakmak çok daha kötüdür.
            </p>
            <p>
              Namaza başlamak her yaş için uygundur ve hiçbir şey için kesinlikle geç kalınmış değildir; bir yerden başlamak en güzelidir. Geçmişteki kaza borçlarınızın ne kadar çok olduğunu hesaplayıp bunu gözünüzde büyütmek yerine, <strong>"Bu kaza borcuna yeni borç eklememeliyim"</strong> bilinciyle hareket etmek en akıllıca adımdır.
            </p>
            <p>
              Namaz aslında bize zorluk olsun diye değil, kolaylık olsun diye vardır. Vakitler, insan biyolojisine ve günün akışına kusursuzca bölünmüştür. Aşağıdaki vakitlere tıklayarak her vaktin ruhumuza ve bedenimize etkisini keşfedin:
            </p>
          </div>

          {/* İNTERAKTİF 5 VAKİT BİYOLOJİK SAAT SEÇİCİ */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {bioVakitler.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveVakitBio(idx)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    activeVakitBio === idx
                      ? isDark
                        ? 'bg-teal-950 text-teal-300 border-teal-400 shadow-xs'
                        : 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : isDark
                      ? 'bg-[#211d16] text-[#b9b09a] border-[#3a3226] hover:border-teal-500/40'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.vakit} ({item.sure})
                </button>
              ))}
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#211d16] border-teal-500/30' : 'bg-teal-50/50 border-teal-200'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <span className={`text-sm font-extrabold ${isDark ? 'text-teal-300' : 'text-teal-900'}`}>
                  {bioVakitler[activeVakitBio].vakit} — Örnek Vakit: {bioVakitler[activeVakitBio].saat}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400">
                  {bioVakitler[activeVakitBio].detay}
                </span>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                {bioVakitler[activeVakitBio].etki}
              </p>
            </div>

            {/* GİZLİ İPUCU 2 */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <span className={`text-xs italic ${isDark ? 'text-[#8c826e]' : 'text-slate-500'}`}>
                Gelin, bu süreci omuzlarınıza bir yük gibi değil, gece ve gündüz (rûz u şeb) adım adım ilerleyen huzurlu bir yolculuk gibi ele alalım.
              </span>
              <button
                type="button"
                onClick={() => handleFindClue('c2', 'rûz u şeb')}
                className={`text-[11px] px-3 py-1 rounded-full font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                  foundClues.includes('c2')
                    ? 'bg-emerald-600 text-white'
                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30'
                }`}
              >
                <span>🔑 2. Şiir Anahtarı: <strong>"rûz u şeb"</strong></span>
                <span>{foundClues.includes('c2') ? '✓ Eklendi' : '(Bulmacaya Ekle)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* İMANIN VE İBADETİN KORUYUCU KALELERİ (İNTERAKTİF GÖRSEL KALE ŞEMASI) */}
        <div className={`p-6 rounded-3xl border space-y-5 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-500 block">
                🏰 Görsel Tefekkür Şeması
              </span>
              <h4 className={`text-base sm:text-lg font-extrabold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-900'}`}>
                İmanın ve İbadetin Koruyucu Kaleleri
              </h4>
            </div>
            <span className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold ${isDark ? 'bg-[#211d16] text-[#b9b09a]' : 'bg-slate-100 text-slate-600'}`}>
              Halkalara veya katmanlara tıklayarak inceleyin
            </span>
          </div>

          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-700'}`}>
            İlk etapta sadece namazların <strong>farzlarını</strong> (sabahın kuvvetli sünneti ve yatsının vacip olan vitir namazı ile birlikte) yerine getirmeniz yeterli olacaktır. İmanın ve ibadetin koruyucu kaleleri vardır. <strong>En içte farzlar bulunur; ardından vacipler, sünnetler, müstehaplar ve nafileler gelir.</strong> Önce imana en yakın olan ana kaleyi en güzel şekilde müstahkem (sağlam) edelim; zamanla diğerleri için de inşa edeceğimiz yer ve zaman bulacağız:
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Sol: İç İçe Kale Surları Görseli */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center py-4">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
                {/* 5. Halka: Nafileler */}
                <button
                  type="button"
                  onClick={() => setSelectedKaleLayer(4)}
                  className={`absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border-2 transition-all cursor-pointer flex items-start justify-center pt-2 ${
                    selectedKaleLayer === 4
                      ? 'border-rose-400 bg-rose-500/20 ring-4 ring-rose-500/20'
                      : isDark
                      ? 'border-rose-500/30 bg-rose-950/15 hover:bg-rose-950/30'
                      : 'border-rose-300 bg-rose-50/60 hover:bg-rose-100/70'
                  }`}
                >
                  <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider">5. Nafileler</span>
                </button>

                {/* 4. Halka: Müstehaplar */}
                <button
                  type="button"
                  onClick={() => setSelectedKaleLayer(3)}
                  className={`absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border-2 transition-all cursor-pointer flex items-start justify-center pt-2 ${
                    selectedKaleLayer === 3
                      ? 'border-indigo-400 bg-indigo-500/20 ring-4 ring-indigo-500/20'
                      : isDark
                      ? 'border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-950/35'
                      : 'border-indigo-300 bg-indigo-50/70 hover:bg-indigo-100/70'
                  }`}
                >
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider">4. Müstehaplar</span>
                </button>

                {/* 3. Halka: Sünnetler */}
                <button
                  type="button"
                  onClick={() => setSelectedKaleLayer(2)}
                  className={`absolute w-42 h-42 sm:w-48 sm:h-48 rounded-full border-2 transition-all cursor-pointer flex items-start justify-center pt-2.5 ${
                    selectedKaleLayer === 2
                      ? 'border-teal-400 bg-teal-500/25 ring-4 ring-teal-500/20'
                      : isDark
                      ? 'border-teal-500/40 bg-teal-950/25 hover:bg-teal-950/40'
                      : 'border-teal-400 bg-teal-50/80 hover:bg-teal-100/80'
                  }`}
                >
                  <span className="text-[10px] font-extrabold text-teal-500 dark:text-teal-300 uppercase tracking-wider">3. Sünnetler</span>
                </button>

                {/* 2. Halka: Vacipler */}
                <button
                  type="button"
                  onClick={() => setSelectedKaleLayer(1)}
                  className={`absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 transition-all cursor-pointer flex items-start justify-center pt-2.5 ${
                    selectedKaleLayer === 1
                      ? 'border-cyan-400 bg-cyan-500/25 ring-4 ring-cyan-500/20'
                      : isDark
                      ? 'border-cyan-500/40 bg-cyan-950/35 hover:bg-cyan-950/50'
                      : 'border-cyan-400 bg-cyan-50/90 hover:bg-cyan-100'
                  }`}
                >
                  <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider">2. Vacipler</span>
                </button>

                {/* 1. Merkez: İman & Farzlar */}
                <button
                  type="button"
                  onClick={() => setSelectedKaleLayer(0)}
                  className={`relative z-10 w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center p-1 shadow-lg ${
                    selectedKaleLayer === 0
                      ? 'border-emerald-300 bg-emerald-600 text-white ring-4 ring-emerald-400/40 scale-105'
                      : 'border-emerald-400 bg-emerald-700 text-white hover:scale-105'
                  }`}
                >
                  <span className="text-[9px] font-black uppercase leading-tight">1. Merkez</span>
                  <span className="text-[10px] font-extrabold leading-tight">FARZLAR</span>
                </button>
              </div>
            </div>

            {/* Sağ: Seçili Kale Katmanı Açıklaması */}
            <div className="lg:col-span-6 space-y-2.5">
              {kaleLayers.map((layer, lIdx) => {
                const isSelected = selectedKaleLayer === lIdx;
                return (
                  <div
                    key={lIdx}
                    onClick={() => setSelectedKaleLayer(lIdx)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-[#211d16] border-teal-400 ring-1 ring-teal-400/40 shadow-md'
                          : 'bg-teal-50/90 border-teal-500 shadow-sm'
                        : isDark
                        ? 'bg-[#211d16]/50 border-[#3a3226] opacity-75 hover:opacity-100'
                        : 'bg-slate-50 border-slate-200 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-xs sm:text-sm font-extrabold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-900'}`}>
                        {layer.title}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md bg-gradient-to-r ${layer.color} text-white`}>
                        {layer.badge}
                      </span>
                    </div>
                    {isSelected && (
                      <p className={`text-xs leading-relaxed mt-1.5 ${isDark ? 'text-[#b9b09a]' : 'text-slate-700'}`}>
                        {layer.desc}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* VESVESELERE KAPILARINIZI KAPATIN & İSTİBRA SOHBETİ */}
        <div className={`p-6 rounded-3xl border space-y-5 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200 shadow-xs'}`}>
          <h4 className={`text-base sm:text-lg font-extrabold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-900'}`}>
            🛡️ Peki Bunları Nasıl Kılabiliriz? Vesveselere Kapılarınızı Kapatın!
          </h4>

          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-700'}`}>
            Örneğin kış aylarında sabah namazı <strong>06.30 - 07.00</strong> civarına kadar kılınabiliyor. Normal kalktığınız saatten sadece biraz daha erken kalkarak 2 rekat sünnet ve 2 rekat farzı hızlıca eda edebilirsiniz. Üstelik sabah namazını kılmış olarak evden çıkmak, üzerinizdeki birçok negatif enerjiyi atar ve sizi güne çok daha zinde başlatır.
          </p>

          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-xs sm:text-sm font-semibold mb-3 ${isDark ? 'text-teal-300' : 'text-teal-900'}`}>
              💬 Peki ya içimize düşen şu vesveseler? (Yoksa hiç sıkıntı yok; ama varsa da sakın üzülmeyin ve devam edin 😊 Tam doğru yoldasınız demektir!)
            </p>
            <p className={`text-xs mb-3 leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Namaza ve abdeste yeni başlayanlar, abdest alırken veya namaz kılarken akla gelen şu şüpheleri kesinlikle dinlememelidir. Üzerine tıklayarak bu vesveseleri zihninizden خط (çizip) kapı dışarı edin:
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                '“Abdestim bozuldu mu?”',
                '“Tekrar mı yıkamalıyım?”',
                '“Niyetim doğru oldu mu?”',
                '“Acaba sureyi yanlış mı okudum?”',
                '“Secdem doğru oldu mu?”'
              ].map((vesveseText, vIdx) => {
                const isDismissed = dismissedVesvese.includes(vIdx);
                return (
                  <button
                    key={vIdx}
                    type="button"
                    onClick={() =>
                      setDismissedVesvese((prev) =>
                        prev.includes(vIdx) ? prev.filter((x) => x !== vIdx) : [...prev, vIdx]
                      )
                    }
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isDismissed
                        ? isDark
                          ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400 line-through opacity-75'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-800 line-through opacity-75'
                        : isDark
                        ? 'bg-[#181510] border-rose-500/40 text-rose-300 hover:bg-rose-950/30'
                        : 'bg-white border-rose-200 text-rose-800 hover:bg-rose-50'
                    }`}
                  >
                    <span>{isDismissed ? '✓ Savuşturuldu:' : '❌ Vesvese:'}</span>
                    <span>{vesveseText}</span>
                  </button>
                );
              })}
            </div>
            <p className={`text-[11px] mt-2.5 ${isDark ? 'text-[#8c826e]' : 'text-slate-500'}`}>
              * Bu tür şüpheler ibadeti kişinin gözünde gereğinden fazla zorlaştırmak içindir; kulak asmayın ve geçin!
            </p>
          </div>

          {/* TEK DİKKAT EDİLMESİ GEREKEN NOKTA: İSTİBRA (SAMİMİ SOHBET HAVASI) */}
          <div className={`p-5 rounded-2xl border-2 ${isDark ? 'bg-[#1a2f29]/50 border-teal-500/40' : 'bg-teal-50/60 border-teal-300'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <h5 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-teal-300' : 'text-teal-900'}`}>
                🎯 Tek Dikkat Edilmesi Gereken Nokta: İstibrâ Meselesi
              </h5>
              <button
                type="button"
                onClick={() => selectNamazItem('ibadetlerin-sihati-icin')}
                className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-teal-700 hover:bg-teal-800 text-white cursor-pointer transition-all shadow-xs flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>"İbadetlerin sıhhati icin" Rehberini Aç</span>
              </button>
            </div>

            <div className={`space-y-2.5 text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
              <p>
                Özellikle ve bilhassa erkekler için abdestteki <strong>istibrâ</strong> (idrar damlasının tamamen kesilmesinden emin olma) meselesi çok mühimdir. Bu kesinlikle bir zorluk veya zorlama değil, insanın bizzat <strong>kendisine duyduğu öz saygıdır</strong>. Neticede hiç kimse kirli gezmek istemez; ancak kirli olduğundan haberi yoksa insan farkında olmadan öylece dolaşır ve kendini temiz zanneder. (Bu konunun pratik adımları hemen üstteki <strong>"İbadetlerin sıhhati icin"</strong> başlığında tüm detaylarıyla anlatılmıştır.)
              </p>
              <p>
                Peki neden sadece istibrâ için özellikle dikkat çekiyoruz? Çünkü namazlarına çok ehemmiyet veren pek çok kişi bile bazen bu konuyu gözden kaçırabiliyor. Halbuki abdest aldıktan sonra sadece 1 damla idrar sızsa abdest bozulur ve abdestsiz kılınan namaz geçerli olmaz.
              </p>
              <div className={`p-3.5 rounded-xl border font-medium ${isDark ? 'bg-[#181510] border-teal-500/40 text-teal-200' : 'bg-white border-teal-200 text-teal-950'}`}>
                💡 E tabii, <strong>“İblis de bunu çok iyi biliyor ve tam bu noktanın üzerine oynuyor; ama merak etmeyin, biz bu oyunu bozarız!”</strong> 😊 Sıkıntı yok; Allah muhafaza eylesin, şeytanın en büyük vesvese kaynağı ve en vurucu noktası burası olduğu için bu küçük tedbiri çözmek elzemdir. Bunu çözdük mü, inanın bana gerisi çocuk oyuncağı gibi kolay gelecek!
              </div>
              <p className={`font-semibold ${isDark ? 'text-teal-300' : 'text-teal-900'}`}>
               İstibrâ meselesine gereken özeni gösterdikten sonra, namazda kıraati (sure ve ayetleri) kendimizin duyabileceği kadar fısıltıyla yerine getirdiğimizde diğer tüm konularda <em>"Eksik de olsa, hatalı da olsa Rabbim samimiyetimi biliyor ve kabul eder"</em> diyerek huzurla yola devam etmek, doğru yolda olduğunuzun en büyük göstergesidir.
              </p>
            </div>
          </div>
        </div>

        {/* "SABAHI HALLETTİM, ÖĞLENDE İŞLER YOĞUN" DİYENLER İÇİN KISA DEVRE TAKTİĞİ */}
        <div className={`p-6 rounded-3xl border space-y-5 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className={`text-base sm:text-lg font-extrabold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-900'}`}>
              ⚡ "Sabahı Hallettim, Öğlende İşler Yoğun" Diyenler İçin: "Kısa Devre" Taktiği
            </h4>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30">
              Tek Abdest • İki Vakit
            </span>
          </div>

          <div className={`space-y-3 text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-700'}`}>
            <p>
              Böyle yoğun durumlarda şu taktiği gönül rahatlığıyla uygulayabilirsiniz: <strong>Sadece farzları kılmak!</strong> Evet, yanlış duymadınız; sadece farzları. Öğle namazının farzı sadece 4 rekattır. 5 dakika abdest, 4-5 dakika namaz desek, toplamda <strong>10 dakikada</strong> öğle namazı eda edilebilir.
            </p>
            <p>
              Diyelim ki çalışıyorsunuz, işler çok yoğun ve işvereninizin ibadet için özel bir esnekliği yok; ya da kendinize ayıracak çok kısıtlı bir vaktiniz var. O zaman namaz vakti çıkmadan, <strong>iki vakti tek abdest ile vücuda hiç yük olmadan</strong> birbirine bağlayabilirsiniz:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-xs font-black text-cyan-500 dark:text-cyan-400 uppercase block mb-1">1. Adım (Öğle Sonu)</span>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                Takvim uygulamanıza dikkat ederek, öğle vaktinin çıkmasına <strong>25-30 dakika kala</strong> abdestinizi alıp öğlenin 4 rekat farzını (10 dk) kılarsınız.
              </p>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-xs font-black text-teal-400 uppercase block mb-1">2. Adım (Kısa Mola)</span>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                Bulunduğunuz yerde biraz dinlenir, çayınızı içer veya birkaç dakika telefonunuzla ilgilenirsiniz.
              </p>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-xs font-black text-emerald-400 uppercase block mb-1">3. Adım (İkindi Girişi)</span>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                İkindi ezanı okunur okunmaz, abdestiniz zaten mevcut olduğu için sadece <strong>5 dakikada</strong> ikindinin 4 rekat farzını kılar ve işinize dönersiniz!
              </p>
            </div>
          </div>

          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-700'}`}>
            Böylece tek bir abdestle, çok kısa bir sürede iki vakti huzurla aradan çıkarmış olursunuz. Akşam ve yatsı namazları için de günlük planınıza göre aynı pratik çözümü uygulayabilirsiniz.
          </p>

          {/* 2. ÖZLÜ SÖZ */}
          <blockquote className={`p-4 rounded-2xl border-l-4 italic text-sm sm:text-base font-semibold ${isDark ? 'bg-[#211d16] border-cyan-400 text-cyan-200' : 'bg-cyan-50/70 border-cyan-600 text-cyan-950'}`}>
            "Namaz kılmak, günün koşturmacası içinde Rabbine 'Ben buradayım, seni dinliyorum' diyebilmenin en güzel yoludur."
          </blockquote>

          {/* KENDİMİZİ KANDIRMAYALIM: TOPLAM 45 DAKİKA & 3. ÖZLÜ SÖZ */}
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
            <h5 className={`text-sm sm:text-base font-extrabold mb-1.5 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-900'}`}>
              ⏱️ Kendimizi Kandırmayalım: Toplam 45 Dakika
            </h5>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-700'}`}>
              Sadece farzları kıldığınızı düşündüğümüzde, tüm gün boyunca 5 vakit namazın alacağı toplam süre taş çatlasa <strong>45 dakikadır</strong>. Instagram'a, YouTube'a veya televizyona daldığımızda 1 saatin nasıl geçtiğini bile fark etmiyoruz. Sonsuzluk yurdumuz için günde yarım saatten biraz fazlasını ayırmak ve huzurda <strong>kılan kıyâm</strong> olmak inanın hiç zor değildir.
            </p>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => handleFindClue('c4', 'kılan kıyâm')}
                className={`text-[11px] px-3 py-1 rounded-full font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                  foundClues.includes('c4')
                    ? 'bg-emerald-600 text-white'
                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30'
                }`}
              >
                <span>🔑 4. Şiir Anahtarı: <strong>"kılan kıyâm"</strong></span>
                <span>{foundClues.includes('c4') ? '✓ Eklendi' : '(Bulmacaya Ekle)'}</span>
              </button>
            </div>
          </div>

          {/* 3. ÖZLÜ SÖZ */}
          <blockquote className={`p-4 rounded-2xl border-l-4 italic text-sm sm:text-base font-semibold ${isDark ? 'bg-[#211d16] border-emerald-400 text-emerald-200' : 'bg-emerald-50/70 border-emerald-600 text-emerald-950'}`}>
            "Namaz, kulun Allah ile buluştuğu, dünya gürültüsünü kapıda bırakıp sığındığı en huzurlu limandır."
          </blockquote>
        </div>

        {/* 2. SATRANÇ ŞİİRİ (ORTA MAKAM) */}
        <div className={`p-5 sm:p-6 rounded-3xl border relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-[#162722] via-[#181510] to-[#1c322b]/80 border-teal-500/40' : 'bg-gradient-to-br from-teal-50/70 via-white to-emerald-50 border-teal-200 shadow-xs'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${isDark ? 'bg-teal-950/80 text-teal-300 border-teal-500/40' : 'bg-teal-100 text-teal-900 border-teal-300'}`}>
              ♟️ 2. Vezn-i Âhar Makamı
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSatrancHighlight2('row')}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                  satrancHighlight2 === 'row'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : isDark ? 'bg-[#211d16] text-[#b9b09a]' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Soldan Sağa (Satır)
              </button>
              <button
                type="button"
                onClick={() => setSatrancHighlight2('col')}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                  satrancHighlight2 === 'col'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isDark ? 'bg-[#211d16] text-[#b9b09a]' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Yukarıdan Aşağıya (Sütun)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center my-3">
            {[
              ['Her demde', 'vakt-i namaz kıl,', 'rûha safâ', 'verir bu nûr,'],
              ['Vakt-i namaz kıl,', 'rûha safâ', 'verir bu nûr,', 'eyler sürûr,'],
              ['Rûha safâ', 'verir bu nûr,', 'eyler sürûr,', 'kalbe huzûr,'],
              ['Verir bu nûr,', 'eyler sürûr,', 'kalbe huzûr,', 'akl-ı şuur.']
            ].map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const isHighlight =
                  (satrancHighlight2 === 'row' && rIdx === 0) ||
                  (satrancHighlight2 === 'col' && cIdx === 0);
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`p-2.5 rounded-xl border font-serif italic text-xs sm:text-sm font-semibold transition-all ${
                      isHighlight
                        ? satrancHighlight2 === 'row'
                          ? isDark
                            ? 'bg-teal-950/80 border-teal-400 text-teal-200 ring-1 ring-teal-400/50'
                            : 'bg-teal-100/90 border-teal-400 text-teal-950'
                          : isDark
                          ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/50'
                          : 'bg-emerald-100/90 border-emerald-400 text-emerald-950'
                        : isDark
                        ? 'bg-[#181510]/90 border-[#3a3226] text-[#f1ecdd]'
                        : 'bg-white/90 border-slate-200 text-slate-800'
                    }`}
                  >
                    {cell}
                  </div>
                );
              })
            )}
          </div>

          <div className={`mt-3 p-3 rounded-xl border text-xs leading-relaxed ${isDark ? 'bg-[#181510]/70 border-[#3a3226] text-[#b9b09a]' : 'bg-white/80 border-teal-100 text-slate-600'}`}>
            <strong className={isDark ? 'text-teal-400' : 'text-teal-800'}>✨ Anlamı:</strong> Her anda namaz vaktini gözetip namazını kıl; bu ilahi nur ruha berraklık verir, sevinç bağışlar, kalbe huzur ve akla derin bir bilinç kazandırır.
          </div>
        </div>

        {/* NAMAZIN KANITLANMIŞ 5 BİLİMSEL FAYDASI */}
        <div className={`p-6 rounded-3xl border space-y-5 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-500 block">
              🔬 Modern Tıp ve Fizyoloji Işığında
            </span>
            <h4 className={`text-base sm:text-lg font-extrabold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-900'}`}>
              Namazın Kanıtlanmış 5 Bilimsel Faydası
            </h4>
          </div>

          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-700'}`}>
            İbadetler elbette yalnızca Allah'ın rızası için ve <strong>aşk ile</strong> yapılır. Bizim fani işlerimize gösterdiğimiz özeni, her şeyin sahibi olan Yüce Allah'ın bizden istediği bu buluşmaya da (<em>Tâdil-i Erkâna</em>, yani namazın duruşlarına hakkıyla uymaya) göstermemiz gerekir. Bununla birlikte modern bilim, her gün yaptığımız bu hareketlerin bedensel birer mucize olduğunu kanıtlıyor:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {[
              { title: '1. Secde & Beyin', icon: '🧠' },
              { title: '2. Böbrek & İdrar', icon: '💧' },
              { title: '3. Sabah & Kalp', icon: '❤️' },
              { title: '4. Omurga Kalkanı', icon: '🦴' },
              { title: '5. Ense & Vagus', icon: '🌿' }
            ].map((tab, tIdx) => (
              <button
                key={tIdx}
                type="button"
                onClick={() => setActiveScienceTab(tIdx)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeScienceTab === tIdx
                    ? isDark
                      ? 'bg-teal-950 border-teal-400 text-teal-300 shadow-xs'
                      : 'bg-teal-600 border-teal-600 text-white shadow-xs'
                    : isDark
                    ? 'bg-[#211d16] border-[#3a3226] text-[#b9b09a] hover:border-teal-500/40'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.title}</span>
              </button>
            ))}
          </div>

          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#211d16] border-teal-500/30' : 'bg-teal-50/50 border-teal-200'}`}>
            {activeScienceTab === 0 && (
              <div className="space-y-2">
                <h5 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-teal-300' : 'text-teal-900'}`}>
                  🧠 1. Secdenin Beyne Etkisi (Frontal Lob ve Hafıza)
                </h5>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                  Her secdeye gidildiğinde, yerçekiminin de etkisiyle kalp, vücudun en üst noktası olan beyne çok daha hızlı ve bol miktarda taze kan pompalar. Bu durum, karar alma merkezi olan <strong>frontal lobu</strong> ve beyin hücrelerini taze oksijenle besleyerek hafızayı güçlendirir, bunama (demans) riskini azaltır ve zihni dinç tutar.
                </p>
              </div>
            )}
            {activeScienceTab === 1 && (
              <div className="space-y-2">
                <h5 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-teal-300' : 'text-teal-900'}`}>
                  💧 2. Böbrek Sağlığı ve İdrar Yolları Koruması
                </h5>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                  Özellikle sabah namazına kalkıp abdest almak ve tuvalet ihtiyacını gidermek, gece boyunca mesanede biriken idrarın ve toksinlerin vücuttan zamanında atılmasını sağlar. Bu sayede idrar yolu enfeksiyonları ve <strong>böbrek taşı oluşumu riski</strong> ciddi oranda ortadan kalkar.
                </p>
              </div>
            )}
            {activeScienceTab === 2 && (
              <div className="space-y-2">
                <h5 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-teal-300' : 'text-teal-900'}`}>
                  ❤️ 3. Sabah Namazı ve Kalp Sağlığı (04.00 - 07.00 Kritik Evresi)
                </h5>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                  Tıbbi istatistiklere göre kalp krizleri en çok sabaha karşı <strong>04.00 ile 07.00</strong> saatleri arasında görülür. Çünkü bu saatlerde vücut tam istirahat modundadır; kan akışı yavaşlar, tansiyon düşer ve bu aşırı durağan evrede kanın pıhtılaşma eğilimi artar. Sabah namazı vakti tam da bu kritik saatlere denk gelir. Uyanmak, suyla temas etmek (abdest) ve hareket etmek (namaz); bedeni derin uyuşukluk halinden çıkarır, kalp ritmini sağlıklı şekilde hızlandırır ve kan dolaşımını düzenleyerek kriz riskini minimuma indirir.
                </p>
              </div>
            )}
            {activeScienceTab === 3 && (
              <div className="space-y-2">
                <h5 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-teal-300' : 'text-teal-900'}`}>
                  🦴 4. Sürekli Oturma Hastalığına Karşı Fiziksel Kalkan
                </h5>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                  Günümüzde sürekli masa başında çalışıyoruz. Bilimsel araştırmalar, tüm gün hareketsiz oturmanın inme ve felç yaşını 40'lara kadar düşürdüğünü gösteriyor. Çoğu kişi "Akşamları bir saat spora gidiyorum" diyerek kendini rahatlatıyor. Ancak uzmanlar uyarıyor:  <strong>gün içine yayılmış aralıklı hareketlilik</strong> sağlamaktır. Dikkat ederseniz bu tavsiye edilen aralıklar tam da 5 vakit namazımıza denk gelir. Günde 5 kez eklemleri hareket ettirmek, rükû ve secde ile omurgayı esnetmek masa başı hastalıklarının en büyük ilacıdır.
                </p>
              </div>
            )}
            {activeScienceTab === 4 && (
              <div className="space-y-2">
                <h5 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-teal-300' : 'text-teal-900'}`}>
                  🌿 5. Ense Meshinin Şaşırtıcı Sırrı (Vagus Siniri Uyarımı)
                </h5>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                  Abdest alırken elimizle ensemizi suyla mesh ettiğimizde vücudumuzda müthiş bir tepkime gerçekleşir. Ense köküne ve şah damarı çevresine yapılan bu serin ıslak dokunuş, beyin ve vücut arasındaki ana iletişim hattı olan <strong>vagus sinirini</strong> anında uyarır. Bu uyarı kan basıncını düşürür, kalp atışını dengeler, stresi bıçak gibi keser ve zihni inanılmaz bir şekilde ferahlatır.
                </p>
              </div>
            )}
          </div>

          {/* GİZLİ İPUCU 3 */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <span className={`text-xs italic ${isDark ? 'text-[#8c826e]' : 'text-slate-500'}`}>
              Her bir rükün ve secde, yaratılış gayemize uygun olarak aşk ile eda edildiğinde hem ruhu hem bedeni ihya eder.
            </span>
            <button
              type="button"
              onClick={() => handleFindClue('c3', 'aşk ile')}
              className={`text-[11px] px-3 py-1 rounded-full font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                foundClues.includes('c3')
                  ? 'bg-emerald-600 text-white'
                  : 'bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30'
              }`}
            >
              <span>🔑 3. Şiir Anahtarı: <strong>"aşk ile"</strong></span>
              <span>{foundClues.includes('c3') ? '✓ Eklendi' : '(Bulmacaya Ekle)'}</span>
            </button>
          </div>
        </div>

        {/* BİZ NAMAZI NEDEN KILIYORUZ? & 60 YILLIK ÖMÜR MUHASEBESİ */}
        <div className={`p-6 rounded-3xl border space-y-5 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200 shadow-xs'}`}>
          <h4 className={`text-base sm:text-lg font-extrabold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-900'}`}>
            🤲 Biz Namazı Neden Kılıyoruz? (60 Yıllık Ömür Muhasebesi)
          </h4>

          <div className={`space-y-3 text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-700'}`}>
            <p>
              Elbette biz Müslümanlar namazı sırf bu bilimsel faydalar var diye kılmıyoruz; bizim yegâne amacımız <strong>Allah'ın rızasını kazanmaktır</strong> ve ibadetlerimiz ahirette bize sorulacaktır. Bu faydaları bilmesek de, inancımız gereği namazımızı kılmaya zaten istekliyiz. Bu bilimsel gerçekleri dile getirmemizin asıl amacı; İslamofobi etkisinde kalmış ya da dine mesafeli duran kişilerin bu bulguları görüp <em>"Demek ki bu insanların yaptığı doğruymuş, gerçek din bu olmalı"</em> diye düşünmelerine vesile olmaktır.
            </p>
            <p>
              Çoğu kişi Ramazan orucunu büyük bir hassasiyetle tutarken, aynı farziyete sahip olan namazı sürekli erteliyor. Gelin, ortalama <strong>70 yıllık</strong> bir ömrümüz olduğunu ve ergenlik çağımızın <strong>10 yaşında</strong> başladığını (mükellef olduğumuz <strong>60 yılı</strong>) baz alarak ufak bir hesap yapalım:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#211d16] border-teal-500/30' : 'bg-teal-50/50 border-teal-200'}`}>
              <span className="text-xs font-extrabold text-teal-500 uppercase block mb-1">🌙 60 Yıllık Oruç Borcu</span>
              <div className={`text-xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>1.800 Gün</div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
                60 yıl boyunca yılda 30 gün oruç tutarsak toplam 1.800 gün eder. (Kazaya kalsa 5 yıl aralıksız tutularak ödenebilir.)
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#211d16] border-cyan-500/40' : 'bg-cyan-50/60 border-cyan-200'}`}>
              <span className="text-xs font-extrabold text-cyan-500 uppercase block mb-1">⚡ Sadece 1 Yıllık Namaz Borcu</span>
              <div className={`text-xl font-black mb-1 ${isDark ? 'text-cyan-300' : 'text-cyan-900'}`}>1.825 Vakit</div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
                365 gün × 5 vakit = 1.825 vakit! <strong>Sadece 1 yıllık namaz borcu bile 60 yıllık oruç borcundan daha fazladır!</strong>
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#211d16] border-rose-500/40' : 'bg-rose-50/60 border-rose-200'}`}>
              <span className="text-xs font-extrabold text-rose-400 uppercase block mb-1">🚨 60 Yıllık Namaz Borcu</span>
              <div className={`text-xl font-black mb-1 ${isDark ? 'text-rose-300' : 'text-rose-900'}`}>109.500 Vakit</div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
                Bunları parasal borç (TL) gibi düşünün: Ahirette <strong>1.800 TL</strong> mi borçlanmak istersiniz, yoksa <strong>109.500 TL</strong> mi?
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#f1ecdd]' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            <strong>💡 Özetle:</strong> Zamanımız darsa, namaza yeni başlıyorsak ve nefsimize ağır geliyorsa, <em>"Şimdilik sadece farzları kılayım"</em> diyerek yola çıkmakta hiçbir sakınca yoktur. Hepsi bir anda zor gelip hiçbirini yapmamaktansa, ilk önce hesaba çekilecek olan farzlardan başlamak en mantıklı olanıdır.
          </div>
        </div>

        {/* BİZ BURADAYIZ, YANINIZDAYIZ */}
        <div className={`p-6 rounded-3xl border space-y-4 ${isDark ? 'bg-gradient-to-br from-[#1c322b]/50 to-[#181510] border-teal-500/30' : 'bg-gradient-to-br from-teal-50/70 to-white border-teal-200 shadow-xs'}`}>
          <h4 className={`text-base sm:text-lg font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-teal-900'}`}>
            🤝 Biz Buradayız, Yanınızdayız
          </h4>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
            O devasa borç yükünün altına girmemek için, erteleme hissi her geldiğinde bu matematiği hatırlayın. Gelin hep beraber bugün, bulunduğumuz vakitten itibaren <strong>"Bismillah"</strong> diyelim. Bu yolda size yol arkadaşı olması için hazırladığımız uygulamamızda ihtiyacınız olan her şey elinizin altında:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-teal-100'}`}>
              <strong className="text-xs text-teal-400 block mb-1">📅 Takvim Sayfası</strong>
              <p className={`text-xs ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
                Namaz vakitlerini ve İşrak/Kuşluk saatlerini anlık takip edebilirsiniz.
              </p>
            </div>
            <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-teal-100'}`}>
              <strong className="text-xs text-cyan-400 block mb-1">📖 Elifba & Tecvid</strong>
              <p className={`text-xs ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
                Kur'an-ı Kerim okumayı bilmiyorsanız renkli kartlar ve tecvid metotlarıyla kolayca öğrenebilirsiniz.
              </p>
            </div>
            <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-teal-100'}`}>
              <strong className="text-xs text-emerald-400 block mb-1">📊 Kaza & Manevi Borçlar</strong>
              <p className={`text-xs ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
                Geçmiş borçlarınızı kaydederek yavaş yavaş, kendinizi hiç sıkmadan eritebilirsiniz.
              </p>
            </div>
          </div>

          <p className={`text-xs sm:text-sm leading-relaxed font-medium ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
            Günde 5-6 saatten fazla bakıştığımız telefonumuz, artık sonsuzluk yurdumuz için bir rehber olsun. Allah şimdiden kılacağınız namazları kabul etsin, dualarınızda bizleri de eksik etmeyin. Şimdi bildiklerinizi bir kenara bırakıp, bir sonraki ezan okunduğunda kalkın, abdest alın, namaza durun ve her şeyin tek sahibi olan Allah'tan dilediğinizi dilediğiniz kadar dileyin... <strong>Belki de hayatınızı değiştirecek adım, tam da bu kadar basit!</strong>
          </p>
        </div>

        {/* 3. SATRANÇ ŞİİRİ & İNTERAKTİF KELİME AVI BULMACASI */}
        <div className={`p-6 rounded-3xl border-2 relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-[#162722] via-[#181510] to-[#1c322b]/90 border-teal-500/50' : 'bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/80 border-teal-300 shadow-sm'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className={`text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${isDark ? 'bg-teal-950 text-teal-300 border-teal-500/40' : 'bg-teal-100 text-teal-900 border-teal-300'}`}>
              🧩 3.  Sır Bulmacası ({solvedCount}/4 Tamamlandı)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFoundClues(['c1', 'c2', 'c3', 'c4']);
                  setPuzzleInputs({
                    c1: 'Merd-i Hak’tır',
                    c2: 'rûz u şeb',
                    c3: 'aşk ile',
                    c4: 'kılan kıyâm'
                  });
                }}
                className="text-[11px] px-3 py-1.5 rounded-lg font-bold bg-teal-600 hover:bg-teal-700 text-white cursor-pointer transition-all shadow-xs"
              >
                ✨ Tüm Anahtarları Otomatik Yerleştir
              </button>
              {solvedCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setFoundClues([]);
                    setPuzzleInputs({ c1: '', c2: '', c3: '', c4: '' });
                  }}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg font-bold border cursor-pointer transition-all ${
                    isDark ? 'bg-[#181510] border-[#3a3226] text-[#b9b09a] hover:text-white' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Sıfırla
                </button>
              )}
            </div>
          </div>

          <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${isDark ? 'text-[#b9b09a]' : 'text-slate-700'}`}>
            Rehberimizi okurken metnin 4 farklı noktasına gizlediğimiz <strong>4 anahtar ifadeyi</strong> yukarıdaki <em>"🔑 Bulmacaya Ekle"</em> butonlarına tıklayarak veya aşağıdaki kutucuklara yazarak tamamlayın. Tüm parçalar doğru yerleştiğinde bu muazzam şiirin tamamı ve anlamı açığa çıkacak!
          </p>

          {/* 4 Anahtar Giriş Kutusu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <div className={`p-3 rounded-xl border ${isC1Correct ? 'border-emerald-500 bg-emerald-500/10' : isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
              <label className="text-[11px] font-bold text-teal-600 dark:text-teal-400 flex items-center justify-between mb-1">
                <span>1. Parça ("1 Tek 2 Birleşik"):</span>
                {isC1Correct && <span className="text-emerald-400 font-extrabold">✓ Doğru</span>}
              </label>
              <input
                type="text"
                value={puzzleInputs.c1}
                onChange={(e) => setPuzzleInputs((prev) => ({ ...prev, c1: e.target.value }))}
                placeholder="Örn: Merd-i Hak’tır"
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-bold border outline-none ${
                  isDark ? 'bg-[#211d16] border-[#3a3226] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className={`p-3 rounded-xl border ${isC2Correct ? 'border-emerald-500 bg-emerald-500/10' : isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
              <label className="text-[11px] font-bold text-teal-600 dark:text-teal-400 flex items-center justify-between mb-1">
                <span>2. Parça ("Biyolojik Vakitler"):</span>
                {isC2Correct && <span className="text-emerald-400 font-extrabold">✓ Doğru</span>}
              </label>
              <input
                type="text"
                value={puzzleInputs.c2}
                onChange={(e) => setPuzzleInputs((prev) => ({ ...prev, c2: e.target.value }))}
                placeholder="Örn: rûz u şeb"
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-bold border outline-none ${
                  isDark ? 'bg-[#211d16] border-[#3a3226] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className={`p-3 rounded-xl border ${isC3Correct ? 'border-emerald-500 bg-emerald-500/10' : isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
              <label className="text-[11px] font-bold text-teal-600 dark:text-teal-400 flex items-center justify-between mb-1">
                <span>3. Parça ("Bilimsel Faydalar"):</span>
                {isC3Correct && <span className="text-emerald-400 font-extrabold">✓ Doğru</span>}
              </label>
              <input
                type="text"
                value={puzzleInputs.c3}
                onChange={(e) => setPuzzleInputs((prev) => ({ ...prev, c3: e.target.value }))}
                placeholder="Örn: aşk ile"
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-bold border outline-none ${
                  isDark ? 'bg-[#211d16] border-[#3a3226] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className={`p-3 rounded-xl border ${isC4Correct ? 'border-emerald-500 bg-emerald-500/10' : isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
              <label className="text-[11px] font-bold text-teal-600 dark:text-teal-400 flex items-center justify-between mb-1">
                <span>4. Parça ("Toplam 45 Dakika"):</span>
                {isC4Correct && <span className="text-emerald-400 font-extrabold">✓ Doğru</span>}
              </label>
              <input
                type="text"
                value={puzzleInputs.c4}
                onChange={(e) => setPuzzleInputs((prev) => ({ ...prev, c4: e.target.value }))}
                placeholder="Örn: kılan kıyâm"
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-bold border outline-none ${
                  isDark ? 'bg-[#211d16] border-[#3a3226] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* 3. Satranç Şiiri 4x4 Tablosu */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 text-center my-3">
            {[
              [
                { ok: isC1Correct, text: 'Merd-i Hak’tır', empty: '1. [ ? ]' },
                { ok: isC2Correct, text: 'rûz u şeb,', empty: '2. [ ? ]' },
                { ok: isC3Correct, text: 'aşk ile', empty: '3. [ ? ]' },
                { ok: isC4Correct, text: 'kılan kıyâm,', empty: '4. [ ? ]' }
              ],
              [
                { ok: isC2Correct, text: 'Rûz u şeb', empty: '2. [ ? ]' },
                { ok: isC3Correct, text: 'aşk ile', empty: '3. [ ? ]' },
                { ok: isC4Correct, text: 'kılan kıyâm,', empty: '4. [ ? ]' },
                { ok: isC1Correct, text: 'merd-i Hak’tır,', empty: '1. [ ? ]' }
              ],
              [
                { ok: isC3Correct, text: 'Aşk ile', empty: '3. [ ? ]' },
                { ok: isC4Correct, text: 'kılan kıyâm', empty: '4. [ ? ]' },
                { ok: isC1Correct, text: 'merd-i Hak’tır', empty: '1. [ ? ]' },
                { ok: isC2Correct, text: 'rûz u şeb,', empty: '2. [ ? ]' }
              ],
              [
                { ok: isC4Correct, text: 'Kılan kıyâm', empty: '4. [ ? ]' },
                { ok: isC1Correct, text: 'merd-i Hak’tır', empty: '1. [ ? ]' },
                { ok: isC2Correct, text: 'rûz u şeb,', empty: '2. [ ? ]' },
                { ok: isC3Correct, text: 'aşk ile.', empty: '3. [ ? ]' }
              ]
            ].map((row, rIdx) =>
              row.map((cell, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`p-2 sm:p-3 rounded-xl border font-serif italic text-[11px] sm:text-sm font-bold transition-all ${
                    cell.ok
                      ? isDark
                        ? 'bg-emerald-950/70 border-emerald-400 text-emerald-200 shadow-sm'
                        : 'bg-emerald-100 border-emerald-400 text-emerald-950 shadow-sm'
                      : isDark
                      ? 'bg-[#181510]/90 border-[#3a3226] text-[#8c826e]'
                      : 'bg-white/90 border-slate-200 text-slate-400'
                  }`}
                >
                  {cell.ok ? cell.text : cell.empty}
                </div>
              ))
            )}
          </div>

          {isPuzzleSolved ? (
            <div className={`mt-4 p-5 rounded-2xl border-2 space-y-3 animate-in fade-in duration-300 ${isDark ? 'bg-emerald-950/50 border-emerald-400 text-emerald-100' : 'bg-emerald-50 border-emerald-400 text-emerald-950'}`}>
              <div className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <span>🎉 Tebrikler Şiirinin Tamamını ve Sırrını Açtınız:</span>
              </div>

              {/* Tamamlanmış Kıtanın Alt Alta 4 Mısra Görünümü */}
              <div className={`p-4 rounded-xl border font-serif italic text-center space-y-1.5 text-sm sm:text-base font-bold ${isDark ? 'bg-[#181510]/90 border-emerald-500/40 text-emerald-300' : 'bg-white border-emerald-300 text-emerald-950'}`}>
                <p>Merd-i Hak’tır rûz u şeb, aşk ile kılan kıyâm,</p>
                <p>Rûz u şeb aşk ile kılan kıyâm, merd-i Hak’tır,</p>
                <p>Aşk ile kılan kıyâm merd-i Hak’tır rûz u şeb,</p>
                <p>Kılan kıyâm merd-i Hak’tır rûz u şeb, aşk ile.</p>
              </div>

              <div className={`p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed ${isDark ? 'bg-[#181510]/70 border-emerald-500/30 text-emerald-100' : 'bg-white/90 border-emerald-200 text-slate-800'}`}>
                <strong>🌟 Şiirin Anlamı ve Hakikati:</strong>{' '}
                <em>
                  "Gece gündüz (rûz u şeb) demeden, zamanın her anında, içine hiçbir çıkar girmeden sadece derin ve içten bir sevgiyle (aşk ile), hayatını ve duruşunu hakikat yoluna adayan; Rabb'inin huzurunda kulluk bilinciyle kıyamda duran (kılan kıyâm) kişi, Allah’ın gerçek dostu ve özü sözü doğru yiğididir (Merd-i Hak’tır). Allah bizi de bu dizelerde övülen samimi kullardan eylesin, Amin."
                </em>{' '}
              </div>
            </div>
          ) : (
            <div className={`mt-3 p-3 rounded-xl border text-xs text-center ${isDark ? 'bg-[#181510]/80 border-[#3a3226] text-[#8c826e]' : 'bg-white/80 border-slate-200 text-slate-500'}`}>
              🔒 Şiirin tam kıtasını ve anlamını görmek için yukarıdaki 4 eksik parçayı tamamlayın (veya sağ üstteki <em>"✨ Tüm Anahtarları Otomatik Yerleştir"</em> butonuna dokunun).
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderNamazinSihatiIcin = () => {
    return (
      <div className="space-y-6 text-left">
        {/* Birleştirilmiş Başlık ve Açıklama Alanı */}
        <div className={`p-5 rounded-2xl border space-y-3.5 ${isDark ? 'bg-[#1c3630]/40 border-[#3fb996]/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className="flex items-center gap-2">
            <Sparkles className={`w-5 h-5 shrink-0 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} />
            <h4 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
              İbadetlerin sıhhati icin Tahâret ve İstibrâ Esasları
            </h4>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
            Bu husus, tahâret (maddî temizlik) bahsinin <strong>istibrâ</strong> (idrar kalıntılarından arınma) kısmındandır. Kul, huzur-u ilâhiye durmadan evvel bedenini ve nezafetini kusursuz kılmakla mükelleftir.
          </p>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Bu hususun fıkıh âlimlerinin eserlerinden ve ilmihâl kitaplarından yararlanılması suretiyle detaylı öğrenilmesi gerekir. Çünkü bu bahiste yer alan ifadeler, konuyu özet niteliğinde ve pratik bir rehber olarak aktarmaktadır.
          </p>
          <div className={`p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed italic ${isDark ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
            "Bu bahiste yer alan ifadeler ehil olmayan kişi veya kişilerce hazırlanmış olup, buradaki bilgiler okyanusta bir damla hasebince konuyu detaylandırmadan anlatılmıştır. Lütfen detaylı ve tam konu bütünlüğü için fıkıh alimlerinin, ilmihal kitaplarının ve fıkıh kitaplarının rehberliğinden yararlanınız."
          </div>
        </div>

        {/* İstibrâ ve Temizlik Usulü */}
        <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
          <h5 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
            İstibrâ ve Temizlik Usulü
          </h5>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Namaz ibadetinin sıhhati ve kabûlü için önce abdestli olmak icap eder. Bu hususta en zaruri adımlardan biri, idrar kanalında hiç damla kalmayacak şekilde arınmaktır. Buna fıkıhta <strong>istibrâ</strong> denir. Usulü sırasıyla şöyledir:
          </p>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
              <strong className="block text-emerald-500 mb-1 font-bold">1. Mesanenin Boşaltılması (İdrarın Def'i):</strong>
              <p className={isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}>Evvelâ acele etmeden, sakin bir surette mesane tamamen boşaltılır.</p>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
              <strong className="block text-emerald-500 mb-1 font-bold">2. Kısa Bir Müddet Bekleme:</strong>
              <p className={isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}>İdrar kesildikten sonra birkaç saniye sükûnetle beklenir ki, kalan damlalar aşağıya doğru süzülsün.</p>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
              <strong className="block text-emerald-500 mb-1 font-bold">3. Makat ile Husyeler Arasının Sıvazlanması (ibra Meshi):</strong>
              <p className={isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}>
                Erkek kişi hâcetini bitirdikten sonra; makat (dübür) ile testislerin (husyeler) başladığı mahâl arasına, yani perine bölgesine parmaklarıyla hafifçe dokunur. Makat tarafından testislerin köküne doğru (yukarıya ve öne doğru) nazikçe sıvazlama (mesh) yapılır. Bu hareket, idrar kanalında mahpus kalmış olabilecek nemin ve damlaların dışarı yürümesini temin eder.
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
              <strong className="block text-emerald-500 mb-1 font-bold">4. Zekerin (Penis) Sıvazlanması ve Yıkanması:</strong>
              <p className={isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}>
                Zekerin kökünden ucuna (haşefe) doğru hafifçe, sağar gibi sıvazlanarak kanalın tamamen boşalması sağlanır. Ardından zekerin ucu suyla yıkanır.
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
              <strong className="block text-emerald-500 mb-1 font-bold">5. Fitil (Peçete) Kullanımı ve Mezhep Kaidesi:</strong>
              <p className={`leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                Kanalda kalabilecek son sızıntıların iç çamaşırına bulaşmaması için, Hanefi mezhebinin fıkhî hükümleri gereği küçük bir tedbir alınır: Standart bir tuvalet kağıdından altıda bir oranında minik bir parça koparılır. Parmaklar arasında yuvarlanarak ince bir silindir (fitil) haline getirilir. Bu fitilin üçte ikisi incitmeden idrar kanalının ucuna hafifçe yerleştirilir, kalanı dışarıda bırakılır.
              </p>
              <div className={`mt-2 p-3 rounded-lg text-xs ${isDark ? 'bg-[#181510] text-[#b9b09a]' : 'bg-amber-50/60 text-amber-900 border border-amber-200'}`}>
                <strong>💡 Nükte:</strong> Peçete içerideyken abdest alınıp namaz kılınabilir; bu esnada idrar gelirse vücut bütünlüğünden sayıldığı için abdesti bozmaz. Ancak peçetenin tamamı ıslanmış ve gelen idrar iç çamaşırına geçmiş hâlde ise abdest bozulur. Lakin bu peçete abdest aldıktan sonra dışarı çıkarılırsa abdestin tazelenmesi icap eder.
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
              <strong className="block text-emerald-500 mb-1 font-bold">6. Yürüyüş (İstinzâh Adımları):</strong>
              <p className={isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}>
                Tuvaletten çıkmadan veya çıktıktan sonra, kişinin uygun miktarda (örneğin ortalama kırk adım kadar) yürütülmesi, kalan son kalıntıların tamamen dökülmesine vesile olur. Yürüyüş hitamında içerideki o küçük peçete çıkarılır, abdest alınarak huzurla namaza durulur.
              </p>
            </div>
          </div>
        </div>

        {/* Sonuç ve Yönlendirme */}
        <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
          <p>
            Bu usule riayet eden mümin, abdestin sıhhatini ve namazının sıhhatini garanti altına alır hem de şeytanın vesveselerinden ve kalıntı şüphesinden kurtulmuş olur.
          </p>
          <p className="font-semibold text-amber-500">
            * Tuvalete girerken ve çıkarken okunan dualar için lütfen <strong>"Günlük Dualar"</strong> sekmesine müracaat ediniz.
          </p>
        </div>
      </div>
    );
  };

  const renderNamazDurusSekilleri = () => {
    return (
      <div className="space-y-6">
        {/* Giriş Bilgisi */}
        <div className={`p-4 rounded-2xl border leading-relaxed text-xs sm:text-sm font-medium ${isDark ? 'bg-[#181510]/80 border-[#3a3226] text-[#b9b09a]' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>
          İslam dünyasında namazdaki duruş şekillerinin (kıyam, rükû, secde ve kade) Arapça 
          <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-800'}> "Allah" (الله) </strong> veya <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-800'}> "Ahmet" (أحمد) </strong> 
          kelimelerini ya da harflerini sembolize ettiğine dair bazı tasavvufi yorumlar ve benzetmeler mevcuttur. 
          Bu durum doğrudan bir fıkıh hükmü veya kesin bir ayet/hadis olmasa da, İslam alimleri ve mutasavvıflar namazın şekilsel yapısı ile harfler arasında estetik ve manevi bağlar kurmuşlardır.
        </div>

        {/* Duruşlar Bölümü */}
        <div className="space-y-4 text-left">
          {/* 1. Allah */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-emerald-50/30 border-emerald-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? 'bg-[#3fb996]/20 text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>1</span>
              <h4 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>"Allah" (الله) İsmini Sembolize Etmesi</h4>
            </div>
            <p className={`text-xs sm:text-sm mb-4 leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Tasavvufi yaklaşımlarda namaz hareketlerinin Arapça Allah yazısının harflerini oluşturduğu ifade edilir:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
                <div className="font-bold text-xs text-emerald-500 mb-1">Kıyam (Ayakta Duruş)</div>
                <div className={`text-sm font-semibold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>Elif (ا) Harfi</div>
                <div className="text-[11px] text-slate-400 mt-1">Dik duruşu temsil eder.</div>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
                <div className="font-bold text-xs text-emerald-500 mb-1">Rükû (Eğiliş)</div>
                <div className={`text-sm font-semibold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>Lam (ل) Harfi</div>
                <div className="text-[11px] text-slate-400 mt-1">Gövdenin bükülmesini temsil eder.</div>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
                <div className="font-bold text-xs text-emerald-500 mb-1">Secde & Oturuş (Kade)</div>
                <div className={`text-sm font-semibold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>He (ه) Harfi</div>
                <div className="text-[11px] text-slate-400 mt-1">Yere kapanmayı temsil eder.</div>
              </div>
            </div>
          </div>

          {/* 2. Adem */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-emerald-50/30 border-emerald-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? 'bg-[#3fb996]/20 text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>2</span>
              <h4 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>"Adem" (آدم) Kelimesini Sembolize Etmesi</h4>
            </div>
            <p className={`text-xs sm:text-sm mb-4 leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Namaz kılan insanın duruşları, ilk insan ve peygamber olan Adem isminin harflerine de benzetilir. Bu durum insanın yaratılış aslına dönüşünü temsil eder:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
                <div className="font-bold text-xs text-emerald-500 mb-1">Kıyam (Ayakta Duruş)</div>
                <div className={`text-sm font-semibold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>Elif (ا) Harfi</div>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
                <div className="font-bold text-xs text-emerald-500 mb-1">Rükû (Eğiliş)</div>
                <div className={`text-sm font-semibold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>Dal (د) Harfi</div>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
                <div className="font-bold text-xs text-emerald-500 mb-1">Secde (Kapanış)</div>
                <div className={`text-sm font-semibold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>Mim (م) Harfi</div>
              </div>
            </div>
          </div>

          {/* 3. Ahmet */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-emerald-50/30 border-emerald-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? 'bg-[#3fb996]/20 text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>3</span>
              <h4 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>Peygamberimizin İsmi: "Ahmet" (أحمد)</h4>
            </div>
            <p className={`text-xs sm:text-sm mb-4 leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Hz. Muhammed'in (s.a.v.) Kur'an'da geçen gökteki ismi olan "Ahmet" kelimesinin harfleriyle namaz hareketleri arasındaki müthiş uyum:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
                <div className="font-bold text-[11px] text-emerald-500 mb-0.5">Kıyam</div>
                <div className={`text-xs font-semibold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>Elif (أ) Harfi</div>
              </div>
              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
                <div className="font-bold text-[11px] text-emerald-500 mb-0.5">Rükû</div>
                <div className={`text-xs font-semibold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>Ha (ح) Harfi</div>
              </div>
              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
                <div className="font-bold text-[11px] text-emerald-500 mb-0.5">Secde</div>
                <div className={`text-xs font-semibold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>Mim (م) Harfi</div>
              </div>
              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
                <div className="font-bold text-[11px] text-emerald-500 mb-0.5">Kade (Oturuş)</div>
                <div className={`text-xs font-semibold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>Dal (د) Harfi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCemaatleNamazaYetismek = () => {
    return (
      <div className="space-y-6 text-left">
        {/* Mezhep Uyarısı / Bilgilendirme */}
        <div className={`p-4 rounded-2xl border flex items-start gap-3 ${isDark ? 'bg-[#1c3630]/60 border-[#3fb996]/30 text-[#3fb996]' : 'bg-emerald-50 border-emerald-100 text-emerald-800'}`}>
          <BookOpen className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold block mb-0.5">Hanefi Mezhebi Esasları</span>
            Bu cemaatle namaza yetişme kılavuzu ve fıkhi kurallar, <strong className="underline">Hanefi mezhebinin</strong> en sahih görüşlerine göre imla, terim ve anlatım düzenlemeleri yapılarak hazırlanmıştır.
          </div>
        </div>

        {/* En Önemli Kural */}
        <div className={`p-5 rounded-2xl border-2 border-dashed ${isDark ? 'bg-amber-950/20 border-amber-500/40' : 'bg-amber-50/40 border-amber-300'}`}>
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold flex items-center gap-1.5 mb-2 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
            🚨 En Önemli Altın Kural: "1. Rekata Yetiştim" Sayılmak İçin Ne Gerekir?
          </h4>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-amber-200/85' : 'text-slate-700'}`}>
            Cemaatle namaza durduğunuzda, imama tam o rekatta yetişmiş sayılabilmeniz için; <strong>imam rükûdayken (eğilmişken) veya rükûdan kalkmadan önce</strong> niyet edip tekbir alarak ona uymuş olmanız gerekir.
          </p>
          <div className={`mt-3 p-3 rounded-xl text-xs leading-relaxed ${isDark ? 'bg-[#181510] text-[#8c826e]' : 'bg-white text-slate-500'}`}>
            <strong>Önemli Ayrım:</strong> Eğer imam rükûdan doğrulduktan sonra (yani <em>"Semiallahu limen hamideh"</em> dedikten sonra veya secdedeyken / otururken) namaza uymuşsanız, o rekatı kaçırmış olursunuz. İmam selam verdikten sonra o rekatı tek başınıza kılmanız gerekir.
          </div>
        </div>

        {/* Cemaate Sonradan Yetişen: Mesbûh Nedir? */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
          <h4 className={`text-xs sm:text-sm md:text-base font-bold mb-2 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
            Cemaatle Namaza Sonradan Yetişene Ne Denir?
          </h4>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Fıkıhta imama sonradan yetişen kişiye <strong>"Mesbûh"</strong> denir. İmam namazın sonunda iki tarafa selam verirken, mesbûh olan kişi <strong>selam vermez</strong>, ayağa kalkar ve kaçırdığı rekatları sırasıyla tek başına kılıp tamamlar.
          </p>
        </div>

        {/* Adım Adım Rekat Durumları */}
        <div className="space-y-4">
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold border-b pb-1.5 ${isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-200'}`}>
            📋 Adım Adım Ne Yapmalısınız? (Rekat Durumları)
          </h4>

          {/* Durum 1 */}
          <div className={`p-4 rounded-xl border text-xs sm:text-sm ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
            <span className={`font-bold block mb-1 text-emerald-500 uppercase tracking-wide text-[10px] sm:text-[11px]`}>Durum 1: İmama 1. Rekatın Rükûsunda veya Öncesinde Yetişmek (Tam Namaz)</span>
            <p className={`${isDark ? 'text-[#b9b09a]' : 'text-slate-600'} leading-relaxed`}>
              İmam namazda ayaktayken veya henüz rükûdan doğrulmadan tekbir alıp imama uyarsanız, namaza baştan yetişmiş olursunuz. İmamla birlikte namazı normal bir şekilde tamamlar ve imamla birlikte selam verirsiniz. Hiçbir rekatı kaçırmamış olursunuz.
            </p>
          </div>

          {/* Durum 2 */}
          <div className={`p-4 rounded-xl border text-xs sm:text-sm ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
            <span className={`font-bold block mb-1 text-emerald-500 uppercase tracking-wide text-[10px] sm:text-[11px]`}>Durum 2: İmama 2. Rekatta Yetişmek (1. Rekatı Kaçırdıysanız)</span>
            <div className={`space-y-2 mt-1.5 ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'} leading-relaxed`}>
              <p>
                <strong>İmamla Birlikte:</strong> İmamla birlikte kalan 2., 3. ve 4. rekatları normal bir şekilde kılarsınız.
              </p>
              <p>
                <strong>İmam Selam Verince:</strong> İmam sağa selam verip sola selam vermeye başlarken siz selam vermeden ayağa kalkarsınız (Çünkü 1. rekatı kaçırdınız).
              </p>
              <p>
                <strong>Kaçırdığınız Rekatı Kılmak:</strong> Ayağa kalktığınızda tek başınıza olduğunuz için sırasıyla: <strong>Sübhâneke</strong> okur, ardından <strong>Eûzü-Besmele, Fâtiha ve bir sûre (zamm-ı sûre)</strong> okuyup rükû ve secdeleri yaparsınız.
              </p>
              <p>
                <strong>Namazın Sonu:</strong> Secdeden sonra son oturuşa oturursunuz. Burada <strong>Et-Tahiyyatü, Salli-Barik ve Rabbenâ</strong> dualarını okuyarak selam verir, namazı bitirirsiniz.
              </p>
            </div>
          </div>

          {/* Durum 3 */}
          <div className={`p-4 rounded-xl border text-xs sm:text-sm ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
            <span className={`font-bold block mb-1 text-emerald-500 uppercase tracking-wide text-[10px] sm:text-[11px]`}>Durum 3: İmama 3. Rekatta Yetişmek</span>
            <div className={`space-y-2 mt-1.5 ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'} leading-relaxed`}>
              <p>
                <strong>İmamla Birlikte:</strong> İmamla birlikte 3. ve 4. rekatları kılarsınız.
              </p>
              <p>
                <strong>İmam Selam Verince:</strong> İmam selam verirken siz ayağa kalkarsınız (2 rekat kaçırdınız).
              </p>
              <p>
                <strong>1. Kaçan Rekat:</strong> Ayağa kalkınca <strong>Sübhâneke, Eûzü-Besmele, Fâtiha ve sûre</strong> okur, rükû ve secdeleri yapıp ayağa kalkarsınız (Burada oturuş yapmazsınız).
              </p>
              <p>
                <strong>2. Kaçan Rekat:</strong> İkinci kez ayağa kalktığınızda sadece <strong>Besmele, Fâtiha ve sûre</strong> okur (Sübhâneke okunmaz), rükû ve secdeyi yapar, ardından son oturuşa oturursunuz.
              </p>
              <p>
                <strong>Namazın Sonu:</strong> Oturuşta <strong>Et-Tahiyyatü, Salli-Barik ve Rabbenâ</strong> okuyarak selam verirsiniz.
              </p>
            </div>
          </div>

          {/* Durum 4 */}
          <div className={`p-4 rounded-xl border text-xs sm:text-sm ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
            <span className={`font-bold block mb-1 text-emerald-500 uppercase tracking-wide text-[10px] sm:text-[11px]`}>Durum 4: İmama 4. Rekatta Yetişmek (Sadece Son Rekat)</span>
            <div className={`space-y-2 mt-1.5 ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'} leading-relaxed`}>
              <p>
                <strong>İmamla Birlikte:</strong> İmamla birlikte sadece son (4.) rekatı kılarsınız ve imamla oturuşa katılırsınız.
              </p>
              <p>
                <strong>İmam Selam Verince:</strong> Ayağa kalkarsınız (3 rekat kaçırdınız).
              </p>
              <p>
                <strong>1. Kaçan Rekat:</strong> Ayağa kalkınca <strong>Sübhâneke, Eûzü-Besmele, Fâtiha ve sûre</strong> okur, rükû ve secdeleri yapar, ardından <strong>oturursunuz</strong> (Çünkü bu sizin kıldığınız 2. rekatınız olur ve ilk oturuş -Ka'de-i Ulâ- sünnettir/vaciptir). Bu oturuşta <strong>sadece Et-Tahiyyatü</strong> okuyup tekrar ayağa kalkarsınız.
              </p>
              <p>
                <strong>2. Kaçan Rekat:</strong> Ayağa kalktığınızda sadece <strong>Besmele, Fâtiha ve sûre</strong> okur, rükû ve secdeyi yapar, oturmadan doğrudan ayağa kalkarsınız.
              </p>
              <p>
                <strong>3. Kaçan Rekat & Son Oturuş:</strong> Son kez ayağa kalktığınızda yine <strong>Besmele, Fâtiha ve sûre</strong> okursunuz. Rükû ve secdeleri tamamlayıp son oturuşa geçersiniz.
              </p>
              <p>
                <strong>Namazın Sonu:</strong> Son oturuşta <strong>Et-Tahiyyatü, Salli-Barik, Rabbenâ</strong> okuyarak selam verirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* Özet Aklınızda Tutmanız Gerekenler */}
        <div className={`p-4 rounded-xl border text-xs leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#b9b09a]' : 'bg-emerald-50/20 border-emerald-100 text-slate-700'}`}>
          <span className="font-bold block mb-1.5 text-sm">💡 Özetle Unutulmaması Gereken Pratik Tüyolar</span>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Rükû Sınırı:</strong> İmam rükûdan doğrulmadan önce yetiştiğiniz her rekatı tam kılmış sayılırsınız.</li>
            <li><strong>İmam Selam Verince:</strong> Sağ tarafa selam verirken kıpırdamayın, sol tarafa selam vermeye başladığı an tekbirsiz olarak direkt ayağa kalkın.</li>
            <li><strong>Kalkınca Ne Okunur?</strong> Kaçırdığınız rekatları tamamlamak için ilk ayağa kalktığınızda sanki namaza yeni başlıyormuş gibi ilk olarak <strong>Sübhâneke</strong> okuyarak başlarsınız. Sonraki kalkışlarda ise Sübhâneke okunmaz, sadece Besmele ve Fâtiha ile devam edersiniz.</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderBayramNamaziKilinisi = () => {
    return (
      <div className="space-y-6 text-left">
        {/* Giriş & Formül Kutusu */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1c3630]/40 border-[#3fb996]/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} />
            <h4 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
              Kısa "3 - 3" Formülü (Karıştırmama Kuralı)
            </h4>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Bayram namazlarında her rekatta normal namazlardan farklı olarak <strong>3'er ilave (zâid) tekbir</strong> vardır. Bu ilave tekbirleri karıştırmamak için şu pratik formülü aklınızda tutabilirsiniz:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
              <div className="font-bold text-xs text-amber-500 mb-1.5 uppercase tracking-wide">1. Rekat (Başlangıçta):</div>
              <div className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                <strong>Sübhâneke</strong> okunduktan sonra, Fâtiha ve zamm-ı sûreden <strong>önce</strong> eller kulaklara 3 kez kaldırılıp tekbir alınır.
              </div>
            </div>
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
              <div className="font-bold text-xs text-amber-500 mb-1.5 uppercase tracking-wide">2. Rekat (Sonda):</div>
              <div className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                Fâtiha ve zamm-ı sûre okunduktan <strong>sonra</strong>, rükûya gitmeden hemen <strong>önce</strong> eller kulaklara 3 kez kaldırılıp tekbir alınır.
              </div>
            </div>
          </div>
        </div>

        {/* Niyet Adımı */}
        <div className={`p-4 rounded-xl border-l-4 ${isDark ? 'bg-[#181510] border-[#3fb996] text-[#b9b09a]' : 'bg-slate-50 border-emerald-600 text-slate-700'}`}>
          <span className="font-bold block text-xs sm:text-sm uppercase tracking-wider text-emerald-500 mb-1">Niyet Esası:</span>
          <p className="text-xs sm:text-sm leading-relaxed italic">
            "Niyet ettim Allah rızası için Bayram Namazını kılmaya, uydum hazır olan imama."
          </p>
        </div>

        {/* Adım Adım Kılınışı */}
        <div className="space-y-4">
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold border-b pb-1.5 ${isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-200'}`}>
            🚶‍♂️ Adım Adım Bayram Namazı Nasıl Kılınır?
          </h4>

          {/* Rekat 1 */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-2.5 mb-3">
              <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? 'bg-[#3fb996]/20 text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>1</span>
              <h5 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>Birinci Rekat</h5>
            </div>
            <ul className="space-y-3.5 text-xs sm:text-sm">
              <li className="leading-relaxed">
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>İftitah Tekbiri ve Sübhâneke:</strong> İmamla birlikte <em>"Allahu Ekber"</em> denilerek tekbir alınır, eller bağlanır ve sessizce <strong>Sübhâneke</strong> duası okunur.
              </li>
              <li className="leading-relaxed">
                <strong className="text-amber-500">1. İlave Tekbir:</strong> Sübhâneke bittikten sonra eller kulaklara kaldırılır, <em>"Allahu Ekber"</em> denilerek eller yana salınır (bağlanmaz).
              </li>
              <li className="leading-relaxed">
                <strong className="text-amber-500">2. İlave Tekbir:</strong> Tekrar eller kulaklara kaldırılır, <em>"Allahu Ekber"</em> denilerek eller yine yana salınır (bağlanmaz).
              </li>
              <li className="leading-relaxed">
                <strong className="text-amber-500">3. İlave Tekbir:</strong> Üçüncü kez eller kulaklara kaldırılır, <em>"Allahu Ekber"</em> denilerek bu defa eller <strong>göbekte bağlanır</strong>.
              </li>
              <li className="leading-relaxed">
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>Kıraat, Rükû ve Secdeler:</strong> İmam sesli olarak Fâtiha ve zamm-ı sûreyi okur. Ardından normal namazdaki gibi rükû ve secdeler yapılarak ikinci rekata kalkılır.
              </li>
            </ul>
          </div>

          {/* Rekat 2 */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-2.5 mb-3">
              <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? 'bg-[#3fb996]/20 text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>2</span>
              <h5 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>İkinci Rekat</h5>
            </div>
            <ul className="space-y-3.5 text-xs sm:text-sm">
              <li className="leading-relaxed">
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>Kıraat:</strong> İkinci rekata kalkıldığında eller bağlanır. İmam sesli olarak önce <strong>Fâtiha</strong> ve ardından <strong>zamm-ı sûreyi</strong> okur. Okuma bittikten sonra rükûya gitmeden önce eller kulaklara götürülerek ilave tekbirlere başlanır:
              </li>
              <li className="leading-relaxed">
                <strong className="text-amber-500">1. İlave Tekbir:</strong> Eller kulaklara kaldırılır, <em>"Allahu Ekber"</em> denilerek eller yana salınır.
              </li>
              <li className="leading-relaxed">
                <strong className="text-amber-500">2. İlave Tekbir:</strong> Tekrar eller kaldırılır, <em>"Allahu Ekber"</em> denilerek yana salınır.
              </li>
              <li className="leading-relaxed">
                <strong className="text-amber-500">3. İlave Tekbir:</strong> Üçüncü kez eller kaldırılır, <em>"Allahu Ekber"</em> denilerek eller yine yana salınır.
              </li>
              <li className="leading-relaxed">
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>4. Tekbir (Rükû Tekbiri):</strong> Son kez eller kaldırılmadan direkt <em>"Allahu Ekber"</em> denilerek rükûya eğilinir.
              </li>
              <li className="leading-relaxed">
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>Secdeler, Oturuş ve Kapanış:</strong> Secdeler yapılır. Son oturuşta <strong>Et-Tahiyyatü, Salli-Barik ve Rabbenâ</strong> duaları okunarak sağa og sola selam verilip bayram namazı tamamlanır.
              </li>
            </ul>
          </div>
        </div>

        {/* Hutbe Bilgisi */}
        <div className={`p-4 rounded-xl border text-xs leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#b9b09a]' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
          <span className="font-bold block mb-1 text-sm">🕌 Önemli Detay: Bayram Hutbesi</span>
          <p>
            Cuma namazının aksine, bayram namazında <strong>hutbe namazdan önce değil, namaz tamamlandıktan sonra</strong> okunur (bu sünnettir). Namaz bitince imam minbere çıkarak bayram hutbesini irat eder. Cemaat sessizce hutbeyi dinler, dualara katılır ve ardından cemaatle bayramlaşmaya geçilir.
          </p>
        </div>
      </div>
    );
  };

  const renderTesbihNamaziKilinisi = () => {
    return (
      <div className="space-y-6 text-left">
        {/* Giriş & Genel Bilgi Kutusu */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1c3630]/40 border-[#3fb996]/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} />
            <h4 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
              Tesbih Namazı Nasıl Kılınır? (4 Rekat • 300 Tesbih Formülü)
            </h4>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Peygamber Efendimizin (s.a.v.) amcası Hz. Abbas'a (r.a.) büyük faziletlerini müjdeleyerek öğrettiği Tesbih Namazı 4 rekattır. Her rekatta 75 defa, 4 rekatta toplam <strong>300 defa</strong> aşağıdaki tesbih zikri okunarak eda edilir.
          </p>
        </div>

        {/* Vakit ve Niyet Paneli */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Vakti */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-amber-500 mb-1">⏰ Kılınma Vakti:</span>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Kerahat vakitleri dışındaki tüm vakitlerde (gündüz veya gece) kılınabilir.
            </p>
          </div>

          {/* Niyeti */}
          <div className={`p-4 rounded-xl border-l-4 ${isDark ? 'bg-[#181510] border-[#3fb996] text-[#b9b09a]' : 'bg-slate-50 border-emerald-600 text-slate-700'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-emerald-500 mb-1">🤲 Niyet Esası:</span>
            <p className="text-xs sm:text-sm leading-relaxed italic">
              "Allah rızası için tesbih namazı kılmaya niyet ettim." — Ardından "Allahu ekber" denilerek iftitah tekbiri alınır ve eller bağlanır.
            </p>
          </div>
        </div>

        {/* Temel Tesbih Kartı */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? 'bg-[#3fb996]/20 text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>300</span>
            <h4 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
              Namaz İçinde Toplam 300 Defa Okunacak Temel Tesbih
            </h4>
          </div>
          <p className={`text-xs mb-3 ${isDark ? 'text-[#8c826e]' : 'text-slate-500'}`}>
            Her rekatta 75 defa, 4 rekat boyunca aşağıdaki tesbih rükünlerde okunur:
          </p>
          
          <div className={`p-4 rounded-xl border font-mono text-center mb-3 ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-emerald-50/40 border-emerald-100'}`}>
            <div className={`font-amiri text-xl sm:text-2xl md:text-3xl dir-rtl leading-relaxed font-bold mb-2 ${isDark ? 'text-[#3fb996]' : 'text-emerald-900'}`}>
              سُبْحَانَ اللهِ وَالْحَمْدُ للهِ وَلَا إِلَهَ إِلَّا اللهُ وَاللهُ أَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيمِ
            </div>
            <p className={`text-xs sm:text-sm font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "Sübhânallâhi ve'l-hamdülillâhi ve lâ ilâhe illallâhu vallâhu ekber ve lâ havle ve lâ kuvvete illâ billâhi'l-aliyyi'l-azîm"
            </p>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              <strong>Anlamı:</strong> "Allah'ı tüm noksan sıfatlardan tenzih ederim. Hamd Allah'a mahsustur. Allah'tan başka ilah yoktur ve Allah en büyüktür. Yüce ve azim olan Allah'tan başka hiçbir güç ve kuvvet yoktur."
            </p>
          </div>
        </div>

        {/* Hızlı Akıl Kartı (Pratik Özet Formül) */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1c3630]/30 border-[#3fb996]/30' : 'bg-teal-50/60 border-teal-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-500 text-base">⚡</span>
            <h4 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-teal-900'}`}>
              Tesbih Namazı Hızlı Akıl Kartı (Pratik Özet Formül)
            </h4>
          </div>
          <p className={`text-xs mb-3 ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Namazı eda ederken zihinde tutulacak pratik akış formülü:
          </p>
          <ul className={`space-y-2 text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
            <li className="flex items-start gap-2">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isDark ? 'bg-[#3fb996]' : 'bg-teal-600'}`} />
              <span><strong>Fâtiha'dan önce:</strong> 15 defa tesbih okunur.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isDark ? 'bg-[#3fb996]' : 'bg-teal-600'}`} />
              <span><strong>Fâtiha'dan sonra:</strong> 10 defa tesbih okunur.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isDark ? 'bg-[#3fb996]' : 'bg-teal-600'}`} />
              <span><strong>Diğer her durakta</strong> (Rükûda, rükûdan doğrulunca, secdelerde, iki secde arasında): <strong>10'ar defa</strong> tesbih okunur.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isDark ? 'bg-[#3fb996]' : 'bg-teal-600'}`} />
              <span><strong>1. Oturuş (2. rekât sonu):</strong> Ettehiyyâtü, Allâhümme Salli ve Allâhümme Bârik duaları okunur.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isDark ? 'bg-[#3fb996]' : 'bg-teal-600'}`} />
              <span><strong>3. Rekâtın Başı:</strong> Ayağa kalkıldığında (oturuştan sonra) tekrardan Sübhaneke okunarak başlanır.</span>
            </li>
          </ul>
        </div>

        {/* Fıkhî İncelikler ve İpuçları */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-amber-50/50 border-amber-200'}`}>
          <h4 className={`text-xs sm:text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${isDark ? 'text-amber-400' : 'text-amber-900'}`}>
            <span>💡 Tesbih Namazında Kolaylık ve Fıkhî İncelikler</span>
          </h4>
          <ul className={`space-y-2.5 text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-700'}`}>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">•</span>
              <span><strong>Sayı Sayma Usûlü:</strong> Namaz içinde sesli sayı sayılmaz ve tesbih tanesi çekilmez. Parmak uçlarını hafifçe dizlere veya yere bastırarak ya da kalpten takip edilir.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">•</span>
              <span><strong>Rükün Tesbihlerinden Sonra Okunur:</strong> Rükû ve secdelerdeki tesbihler, o rüknün kendi zikrinden (Sübhâne Rabbiye’l-Azîm / A‘lâ) hemen sonra okunur.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">•</span>
              <span><strong>Unutulursa Telafi Edilir:</strong> Eğer bir rükünde (örneğin rükûda) 10 tesbihi okumayı unutursanız, bir sonraki duruşta (doğrulunca veya secdede) unutulan 10 tesbihi ekleyerek 20 defa okuyabilirsiniz.</span>
            </li>
          </ul>
        </div>

        {/* Adım Adım Rekat Kılınışı */}
        <div className="space-y-4">
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold border-b pb-1.5 ${isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-200'}`}>
            📖 Adım Adım Rekat Kılınışı (4 Rekat Detaylı Anlatım)
          </h4>

          {/* 1. Rekat */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-200/40">
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? 'bg-[#3fb996]/20 text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>1</span>
                <h5 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>1. Rekâtın Kılınışı (75 Tesbih)</h5>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-[#1c3630] text-[#3fb996]' : 'bg-emerald-50 text-emerald-800'}`}>
                75 Tesbih
              </span>
            </div>
            <p className={`text-xs mb-3 italic ${isDark ? 'text-[#8c826e]' : 'text-slate-500'}`}>
              Kıbleye dönülüp niyet edilir ve "Allahu ekber" denilerek eller bağlandıktan sonra:
            </p>
            <ul className="space-y-3 text-xs sm:text-sm leading-relaxed">
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>1. Adım: Başlangıçta / Sübhaneke Sonrası (15 Defa):</strong><br/>
                Eller bağlı ayaktayken önce "Sübhaneke" duası okunur. Sübhaneke biter bitmez ayaktayken <strong>15 defa</strong> tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>2. Adım: Fâtiha ve Zamm-ı Sûre Sonrası (10 Defa):</strong><br/>
                Eûzü-Besmele çekilir, Fâtiha Sûresi ve ardından bir zamm-ı sûre (İhlâs, Kevser, Felak vb.) okunur. Sûre biter bitmez (rükûya eğilmeden önce ayaktayken) <strong>10 defa</strong> aynı tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>3. Adım: Rükûda (10 Defa):</strong><br/>
                "Allahu ekber" denilerek rükûya eğilinir. 3 defa "Sübhâne Rabbiye'l-Azîm" denir. Ardından rükû duruşu bozulmadan <strong>10 defa</strong> aynı tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>4. Adım: Rükûdan Doğrulunca / Kavmede (10 Defa):</strong><br/>
                "Semiallâhü limen hamideh" denilerek rükûdan doğrulunur ve ayakta dik dururken "Rabbenâ lekel-hamd" denir. Ayakta dik dururken <strong>10 defa</strong> aynı tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>5. Adım: Birinci Secdede (10 Defa):</strong><br/>
                "Allahu ekber" denilerek 1. secdeye varılır. 3 defa "Sübhâne Rabbiye'l-A'lâ" denir. Ardından secdedeyken <strong>10 defa</strong> aynı tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>6. Adım: İki Secde Arasındaki Oturuşta / Celsede (10 Defa):</strong><br/>
                "Allahu ekber" denilerek secdeden kalkılır ve dizüstü oturulur. İki secde arasında otururken <strong>10 defa</strong> aynı tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>7. Adım: İkinci Secdede (10 Defa):</strong><br/>
                Tekrar "Allahu ekber" denilerek 2. secdeye varılır. 3 defa "Sübhâne Rabbiye'l-A'lâ" denir. Ardından secdedeyken <strong>10 defa</strong> aynı tesbih okunur.
              </li>
            </ul>
            <div className={`mt-3.5 p-2.5 rounded-xl text-xs font-semibold border ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
              👉 1. Rekât Sayımı: 15 (ayakta) + 10 (sûre sonu) + 10 (rükû) + 10 (kavme) + 10 (1. secde) + 10 (oturuş) + 10 (2. secde) = <strong>Tam 75 Tesbih</strong>. 2. rekât için "Allahu ekber" denilerek ayağa kalkılır.
            </div>
          </div>

          {/* 2. Rekat */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-200/40">
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? 'bg-[#3fb996]/20 text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>2</span>
                <h5 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>2. Rekâtın Kılınışı ve İlk Oturuş (75 Tesbih • Toplam: 150)</h5>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-[#1c3630] text-[#3fb996]' : 'bg-emerald-50 text-emerald-800'}`}>
                150 Tesbih
              </span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm leading-relaxed">
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>1. Adım: Ayakta Fâtiha'dan Önce (15 Defa):</strong><br/>
                2. rekât için ayağa kalkıp eller bağlanınca, hiçbir şey okumadan önce ayaktayken <strong>15 defa</strong> tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>2. Adım: Fâtiha ve Zamm-ı Sûre Sonrası (10 Defa):</strong><br/>
                Besmele çekilir, Fâtiha Sûresi ve bir zamm-ı sûre okunur. Sûre biter bitmez rükûya gitmeden ayaktayken <strong>10 defa</strong> tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>3. Adım: Rükûda (10 Defa):</strong><br/>
                "Allahu ekber" ile rükûya varılır. 3 defa "Sübhâne Rabbiye'l-Azîm" dedikten sonra rükûdayken <strong>10 defa</strong> tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>4. Adım: Rükûdan Doğrulunca (10 Defa):</strong><br/>
                "Semiallâhü limen hamideh, Rabbenâ lekel-hamd" diyerek doğrulunur ve ayakta dik dururken <strong>10 defa</strong> tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>5. Adım: Birinci Secdede (10 Defa):</strong><br/>
                "Allahu ekber" ile 1. secdeye gidilir. 3 defa "Sübhâne Rabbiye'l-A'lâ" dedikten sonra secdede <strong>10 defa</strong> tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>6. Adım: İki Secde Arası Oturuşta (10 Defa):</strong><br/>
                "Allahu ekber" ile secdeden kalkılıp oturulur ve otururken <strong>10 defa</strong> tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>7. Adım: İkinci Secdede (10 Defa):</strong><br/>
                Tekrar "Allahu ekber" ile 2. secdeye varılır. 3 defa "Sübhâne Rabbiye'l-A'lâ" dedikten sonra <strong>10 defa</strong> tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>8. Adım: İlk Oturuş (Kāde-i Ûlâ):</strong><br/>
                2. secdeden sonra ayağa kalkılmaz, dizüstü oturulur ve "Ettehiyyâtü" duası ile "Allâhümme Salli" ve "Allâhümme Bârik" duaları okunur. Ettehiyyâtü ve salavatlar bittikten sonra "Allahu ekber" denilerek 3. rekât için ayağa kalkılır.
              </li>
            </ul>
            <div className={`mt-3.5 p-2.5 rounded-xl text-xs font-semibold border ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
              👉 2. Rekât Sayımı: 75 Tesbih daha tamamlandı (<strong>Kümülatif Toplam: 150 Tesbih</strong>). 3. rekât için ayağa kalkılır.
            </div>
          </div>

          {/* 3. Rekat */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-200/40">
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? 'bg-[#3fb996]/20 text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>3</span>
                <h5 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>3. Rekâtın Kılınışı (75 Tesbih • Toplam: 225)</h5>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-[#1c3630] text-[#3fb996]' : 'bg-emerald-50 text-emerald-800'}`}>
                225 Tesbih
              </span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm leading-relaxed">
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>1. Adım: Ayakta Başlarken Sübhaneke Sonrası (15 Defa):</strong><br/>
                3. rekât için ayağa kalkıp eller bağlanınca önce "Sübhaneke" duası okunur. Sübhaneke biter bitmez ayaktayken <strong>15 defa</strong> tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>2. Adım: Fâtiha ve Zamm-ı Sûre Sonrası (10 Defa):</strong><br/>
                Eûzü-Besmele, Fâtiha Sûresi ve bir zamm-ı sûre okunur. Sûre bitince rükûya gitmeden ayaktayken <strong>10 defa</strong> tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>3. Adım: Rükûda (10 Defa):</strong><br/>
                "Allahu ekber" ile rükûya varılır. 3 defa "Sübhâne Rabbiye'l-Azîm" dedikten sonra <strong>10 defa</strong> tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>4. Adım: Rükûdan Doğrulunca (10 Defa):</strong><br/>
                "Semiallâhü limen hamideh, Rabbenâ lekel-hamd" diyerek ayakta dik dururken <strong>10 defa</strong> tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>5. Adım: Birinci Secdede (10 Defa):</strong><br/>
                "Allahu ekber" ile 1. secdeye gidilir. 3 defa "Sübhâne Rabbiye'l-A'lâ" dedikten sonra <strong>10 defa</strong> tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>6. Adım: İki Secde Arası Oturuşta (10 Defa):</strong><br/>
                "Allahu ekber" ile oturulur ve otururken <strong>10 defa</strong> tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>7. Adım: İkinci Secdede (10 Defa):</strong><br/>
                Tekrar "Allahu ekber" ile 2. secdeye varılır. 3 defa "Sübhâne Rabbiye'l-A'lâ" dedikten sonra <strong>10 defa</strong> tesbih okunur ve 4. rekât için ayağa kalkılır.
              </li>
            </ul>
            <div className={`mt-3.5 p-2.5 rounded-xl text-xs font-semibold border ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
              👉 3. Rekât Sayımı: 75 Tesbih daha tamamlandı (<strong>Kümülatif Toplam: 225 Tesbih</strong>). 4. rekât için "Allahu ekber" denilerek ayağa kalkılır.
            </div>
          </div>

          {/* 4. Rekat */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-200/40">
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? 'bg-[#3fb996]/20 text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>4</span>
                <h5 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>4. Rekâtın Kılınışı, Son Oturuş ve Selam (75 Tesbih • Genel Toplam: 300)</h5>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-[#1c3630] text-[#3fb996]' : 'bg-emerald-50 text-emerald-800'}`}>
                300 Tesbih
              </span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm leading-relaxed">
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>1. Adım: Ayakta Fâtiha'dan Önce (15 Defa):</strong><br/>
                4. rekât için ayağa kalkıp eller bağlanınca ayaktayken <strong>15 defa</strong> tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>2. Adım: Fâtiha ve Zamm-ı Sûre Sonrası (10 Defa):</strong><br/>
                Besmele çekilir, Fâtiha Sûresi ve bir zamm-ı sûre okunur. Sûre bittikten sonra ayaktayken <strong>10 defa</strong> tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>3. Adım: Rükûda (10 Defa):</strong><br/>
                Rükûya varılır. 3 defa "Sübhâne Rabbiye'l-Azîm" dedikten sonra rükûda <strong>10 defa</strong> tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>4. Adım: Rükûdan Doğrulunca (10 Defa):</strong><br/>
                "Semiallâhü limen hamideh, Rabbenâ lekel-hamd" denilerek doğrulunur ve ayakta <strong>10 defa</strong> tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>5. Adım: Birinci Secdede (10 Defa):</strong><br/>
                1. secdeye gidilir. 3 defa "Sübhâne Rabbiye'l-A'lâ" dedikten sonra secdede <strong>10 defa</strong> tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>6. Adım: İki Secde Arası Oturuşta (10 Defa):</strong><br/>
                Secdeden kalkılıp oturulur ve iki secde arasında otururken <strong>10 defa</strong> tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>7. Adım: İkinci Secdede (10 Defa):</strong><br/>
                2. secdeye varılır. 3 defa "Sübhâne Rabbiye'l-A'lâ" dedikten sonra secdede <strong>10 defa</strong> tesbih okunur.
              </li>
              <li>
                <strong className={isDark ? 'text-[#3fb996]' : 'text-emerald-700'}>8. Adım: Son Oturuş ve Selam (Kāde-i Âhire):</strong><br/>
                2. secdeden sonra dizüstü oturulur ve sırasıyla:
                <ul className="list-disc list-inside mt-1 space-y-0.5 ml-2">
                  <li>"Ettehiyyâtü" duası</li>
                  <li>"Allâhümme Salli" ve "Allâhümme Bârik" duaları</li>
                  <li>"Rabbenâ Âtinâ" ve "Rabbenagfirlî" duaları okunur.</li>
                </ul>
                Dualar bitince önce sağ omuza bakılarak <em>"Esselâmü aleyküm ve rahmetullâh"</em>, sonra sol omuza bakılarak <em>"Esselâmü aleyküm ve rahmetullâh"</em> denilerek selam verilir.
              </li>
            </ul>
            <div className={`mt-3.5 p-2.5 rounded-xl text-xs font-semibold border ${isDark ? 'bg-[#211d16] border-[#3fb996] text-[#3fb996]' : 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'}`}>
              👉 4 Rekâtın tamamında: 75 × 4 = <strong>300 Tesbih</strong> tam ve eksiksiz olarak tamamlanmış olur.
            </div>
          </div>
        </div>

        {/* Dua ve Tamamlama */}
        <div className={`p-4 rounded-xl border text-xs leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
          <strong className="block mb-1 text-sm">🤲 Dua ve Tamamlama:</strong>
          Selam verildikten sonra eller semaya açılarak geçmiş ve gelecek günahların bağışlanması, af ve mağfiret niyetiyle Yüce Allah'a samimiyetle dua edilir.
        </div>
      </div>
    );
  };

  const renderKuslukNamazi = () => {
    return (
      <div className="space-y-6 text-left">
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1c3630]/40 border-[#3fb996]/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} />
            <h4 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
              Kuşluk (Duha) Namazı Kılınışı
            </h4>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Kuşluk (Duha) namazı; güneş doğtuktan yaklaşık 45 dakika sonra (kerahat vakti çıktıktan sonra) başlar. Uygulamamızdaki takvim sayfasında "Günün Namaz Saatleri" başlığı altında yer alan <strong>İşrak / Kuşluk vaktinden</strong> sonra öğle namazına 30 dakika kalana kadar kılınabilir. Genellikle 6 rekât olarak kılınır.
          </p>
        </div>

        {/* Niyet Bilgisi */}
        <div className={`p-4 rounded-xl border-l-4 ${isDark ? 'bg-[#181510] border-[#3fb996] text-[#b9b09a]' : 'bg-slate-50 border-emerald-600 text-slate-700'}`}>
          <span className="font-bold block text-xs uppercase tracking-wider text-emerald-500 mb-1">🤲 Niyet Esası:</span>
          <p className="text-xs sm:text-sm leading-relaxed italic">
            "Niyet ettim Allah rızası için Duha (kuşluk) namazının iki rekâtını kılmaya." (Her 2 rekâtta bir niyet yenilenerek kılınır.)
          </p>
        </div>

        {/* Rekat Detayları */}
        <div className="space-y-4">
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold border-b pb-1.5 ${isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-200'}`}>
            📖 Adım Adım 6 Rekat Kuşluk Namazı Kılınışı
          </h4>

          {/* 1. ve 2. Rekat */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
            <h5 className={`text-sm font-bold mb-2 ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>1. ve 2. Rekât (Normal Nafile Usûlü)</h5>
            <ul className={`list-disc list-inside space-y-1.5 text-xs sm:text-sm ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
              <li>Kıbleye dönülür ve niyet edilir, "Allahu Ekber" diyerek namaza başlanır.</li>
              <li>Sübhaneke, Eûzü-Besmele, Fâtiha ve ardından bir sûre veya birkaç âyet okunur.</li>
              <li>Rükû ve iki secde yapılarak 2. rekâta kalkılır.</li>
              <li>2. rekâtta Fâtiha ve sûre okunur, rükû ve secdelerden sonra oturulur.</li>
              <li>Oturuşta <strong>Ettehiyyâtü, Allahümme Salli, Allahümme Bârik ve Rabbenâ</strong> duaları okunup sağa ve sola selam verilerek ilk 2 rekât tamamlanır.</li>
            </ul>
          </div>

          {/* 3. ve 4. Rekat */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
            <h5 className={`text-sm font-bold mb-2 ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>3. ve 4. Rekât</h5>
            <ul className={`list-disc list-inside space-y-1.5 text-xs sm:text-sm ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
              <li>Ayağa kalkılarak niyet edilir: <em>"Niyet ettim Allah rızası için Duha namazının iki rekâtını kılmaya."</em></li>
              <li>Yine Sübhaneke, Fâtiha ve sûre okunarak rükû ve secdeler yapılır, 4. rekât sonunda oturulup dualar okunarak selam verilir.</li>
            </ul>
          </div>

          {/* 5. ve 6. Rekat */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
            <h5 className={`text-sm font-bold mb-2 ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>5. ve 6. Rekât (Özel Usûl)</h5>
            <ul className={`list-disc list-inside space-y-1.5 text-xs sm:text-sm ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
              <li>İlk 4 rekât tamamlandıktan sonra ayağa kalkılmaz, oturur vaziyette son 2 rekâta devam edilir.</li>
              <li>Oturur vaziyette Sübhaneke, Fâtiha ve sûre okunarak rükû ve secdeler oturularak yerine getirilir.</li>
              <li>Son oturuşta Ettehiyyâtü, Salli, Barik ve Rabbenâ duaları okunarak selam verilir ve namaz tamamlanır.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderEvvabinNamazi = () => {
    return (
      <div className="space-y-6 text-left">
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1c3630]/40 border-[#3fb996]/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} />
            <h4 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
              Evvâbîn Namazı Kılınışı (6 Rekat • 2 + 2 + 2 Formülü)
            </h4>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Evvâbîn namazı; akşam namazından sonra, yatsı namazının vakti girinceye kadar kılınan faziletli bir nafile namazdır. Akşam namazının farz ve sünnetlerinden sonra kılınması yaygındır. Genellikle <strong>6 rekât</strong> olarak, ikişer rekâtlar hâlinde <strong>2 + 2 + 2</strong> şeklinde kılınır.
          </p>
        </div>

        {/* Niyet Bilgisi */}
        <div className={`p-4 rounded-xl border-l-4 ${isDark ? 'bg-[#181510] border-[#3fb996] text-[#b9b09a]' : 'bg-slate-50 border-emerald-600 text-slate-700'}`}>
          <span className="font-bold block text-xs uppercase tracking-wider text-emerald-500 mb-1">🤲 Niyet Esası:</span>
          <p className="text-xs sm:text-sm leading-relaxed italic">
            "Niyet ettim Allah rızası için Evvâbîn namazını kılmaya." (Her iki rekâtta bir niyet edilir.)
          </p>
        </div>

        {/* Kılınış Adımları */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
          <h5 className={`text-sm font-bold mb-3 ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>Adım Adım Kılınış Usûlü</h5>
          <ul className={`space-y-2 text-xs sm:text-sm ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
            <li>• Tekbir alınır: <em>"Allahu ekber."</em></li>
            <li>• Sübhaneke okunur, Eûzü-Besmele çekilerek Fâtiha ve ardından Kur’ân’dan bir sûre veya birkaç âyet okunur.</li>
            <li>• Rükû ve iki secde yapılarak ikinci rekâta kalkılır.</li>
            <li>• İkinci rekâtta Fâtiha ve sûre okunur, rükû ve secdelerden sonra oturulur.</li>
            <li>• Oturuşta <strong>Ettehiyyâtü, Allahümme Salli, Allahümme Bârik ve Rabbenâ</strong> duaları okunup sağa ve sola selam verilerek ilk 2 rekât tamamlanır.</li>
            <li>• Aynı şekilde ikişer rekâtlar halinde 2 defa daha kılınarak toplam 6 rekât tamamlanır.</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderTeheccudNamazi = () => {
    return (
      <div className="space-y-6 text-left">
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1c3630]/40 border-[#3fb996]/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} />
            <h4 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
              Teheccüd Namazı Kılınışı ve Faziletleri
            </h4>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Teheccüd namazının vakti, uygulamamızdaki takvim sayfasında "Günün Namaz Saatleri" başlığı altında bulunan <strong>Teheccüd vakti</strong> saatinden sonra başlar ve İmsak vaktine kadar devam eder. Gecenin son üçte biri teheccüd için en faziletli vakittir. Uygun olan, bir süre uyuyup gece kalkarak kılmaktır.
          </p>
        </div>

        {/* Niyet ve Rekat Bilgisi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-amber-500 mb-1">🌙 Kaç Rekat Kılınır?</span>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              En az 2 rekât kılınabilir. İkişer rekâtlar hâlinde 4, 6, 8 veya daha fazla kılınabilir. Yeni başlayan biri için 2 rekât kılması yeterlidir.
            </p>
          </div>

          <div className={`p-4 rounded-xl border-l-4 ${isDark ? 'bg-[#181510] border-[#3fb996] text-[#b9b09a]' : 'bg-slate-50 border-emerald-600 text-slate-700'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-emerald-500 mb-1">🤲 Niyet Esası:</span>
            <p className="text-xs sm:text-sm leading-relaxed italic">
              "Niyet ettim Allah rızası için teheccüd namazını kılmaya."
            </p>
          </div>
        </div>

        {/* Kılınış Adımları */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
          <h5 className={`text-sm font-bold mb-3 ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>2 Rekat Teheccüd Nasıl Kılınır?</h5>
          <ul className={`space-y-2 text-xs sm:text-sm ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
            <li>• <strong>1. Rekât:</strong> "Allahu ekber" diyerek namaza başlanır. Sübhaneke okunur, Eûzü-Besmele çekilip Fâtiha ve ardından bildiğin bir sûre okunur. Rükû ve secdeler yapılır.</li>
            <li>• <strong>2. Rekât:</strong> Besmele çekilip Fâtiha ve sûre okunur. Rükû ve secdelerden sonra oturulur.</li>
            <li>• Oturuşta <strong>Ettehiyyâtü, Allahümme Salli, Allahümme Bârik ve Rabbenâ</strong> duaları okunup sağa ve sola selam verilerek 2 rekât tamamlanır. İstersen ardından yine 2 rekât daha kılabilirsin.</li>
          </ul>
        </div>

        {/* Ek Bilgi: Vitir ve Namaz Sonrası Dua */}
        <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
          <strong className="block mb-1 text-sm">🤲 Namaz Sonrası Dua ve Vitir Namazı Notu:</strong>
          <p>
            • <strong>Dua:</strong> Teheccüdden sonra dua etmek için en güzel vakittir. Kendi dilinizle Allah'tan dilediğiniz şeyleri isteyebilir, tövbe ve istiğfar edebilirsiniz.
          </p>
          <p>
            • <strong>Vitir Namazı Notu:</strong> Eğer gece kalkacağınıza güveniyorsanız teheccüdden sonra vitir namazı kılmak sünnettir. Ancak gece kalkamayacağınızdan endişeniz varsa (alarmın çalmaması vb. durumlar için) vitri yatmadan önce kılabilirsiniz. Vitir namazını kaçırma tehlikesi olmadığından, kendine güvenenlerin teheccüdden sonra vitir kılması sünnettir.
          </p>
        </div>
      </div>
    );
  };

  const renderMuharremAyiNamazi = () => {
    return (
      <div className="space-y-6 text-left">
        {/* Giriş & Genel Bilgi Kutusu */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1c3630]/40 border-[#3fb996]/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} />
            <h4 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
              Muharrem Ayının 1'i ile 10'u Arasındaki Namaz
            </h4>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Hicri yılın ilk ayı olan Muharrem ayının 1. günü ile 10. günü (Âşûrâ günü dâhil) arasında <strong>bir defaya mahsus olmak üzere</strong> kılınan mübarek bir nafile namazdır. 2 rekatta bir selam verilerek toplam <strong>6 rekat</strong> olarak eda edilir.
          </p>
        </div>

        {/* Vakit ve Niyet Paneli */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Vakti */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-amber-500 mb-1">⏰ Kılınma Vakti:</span>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Bu namaz öncelikli olarak <strong>Akşam namazı ile Yatsı namazı arasında</strong> kılınır. Bu vakitte kılınamazsa yatsı namazından sonra da eda edilebilir.
            </p>
          </div>

          {/* Niyeti */}
          <div className={`p-4 rounded-xl border-l-4 ${isDark ? 'bg-[#181510] border-[#3fb996] text-[#b9b09a]' : 'bg-slate-50 border-emerald-600 text-slate-700'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-emerald-500 mb-1">🤲 Özel Niyet Esası:</span>
            <p className="text-xs sm:text-sm leading-relaxed italic">
              "Niyet eyledim ya Rabbî Senin rızâ-yı şerîfin için namaza. Herhangi bir komşumun, din kardeşimin veya herhangi bir kimsenin bana hakkı geçmiş ise bu hakkın ödenmesi niyetine... Allâhü Ekber"
            </p>
          </div>
        </div>

        {/* Adım Adım Rekat Kılınışı */}
        <div className="space-y-4">
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold border-b pb-1.5 ${isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-200'}`}>
            📖 Rekat Rekat Okunacak Sûreler (2 Rekatta Bir Selam)
          </h4>

          {/* 1. İki Rekat (Selam 1) */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? 'bg-[#3fb996]/20 text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>1</span>
              <h5 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>Birinci 2 Rekat (1. Selam)</h5>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
                <strong className="block text-emerald-500 mb-1 font-bold">1. Rekat:</strong>
                <ul className={`list-disc list-inside space-y-1 font-medium ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                  <li>1 Fâtiha-i Şerîfe</li>
                  <li>1 Âyetü'l-Kürsî</li>
                  <li>11 İhlâs-ı Şerîf</li>
                </ul>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
                <strong className="block text-emerald-500 mb-1 font-bold">2. Rekat:</strong>
                <ul className={`list-disc list-inside space-y-1 font-medium ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                  <li>1 Fâtiha-i Şerîfe</li>
                  <li>10 İhlâs-ı Şerîf</li>
                </ul>
              </div>
            </div>
            <div className="mt-2.5 text-right text-[11px] font-semibold text-amber-500">
              * Oturuşta Et-Tahiyyatü, Salli-Barik ve Rabbenâ okunarak selam verilir.
            </div>
          </div>

          {/* 2. İki Rekat (Selam 2) */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? 'bg-[#3fb996]/20 text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>2</span>
              <h5 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>İkinci 2 Rekat (2. Selam)</h5>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
                <strong className="block text-emerald-500 mb-1 font-bold">3. Rekat (Ayağa Kalkış):</strong>
                <ul className={`list-disc list-inside space-y-1 font-medium ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                  <li>1 Fâtiha-i Şerîfe</li>
                  <li>1 Tekâsür Sûresi <em>("Elhâkümüt-tekâsür...")</em></li>
                  <li>11 İhlâs-ı Şerîf</li>
                </ul>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
                <strong className="block text-emerald-500 mb-1 font-bold">4. Rekat:</strong>
                <ul className={`list-disc list-inside space-y-1 font-medium ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                  <li>1 Fâtiha-i Şerîfe</li>
                  <li>10 İhlâs-ı Şerîf</li>
                </ul>
              </div>
            </div>
            <div className="mt-2.5 text-right text-[11px] font-semibold text-amber-500">
              * Oturuşta Et-Tahiyyatü, Salli-Barik ve Rabbenâ okunarak selam verilir.
            </div>
          </div>

          {/* 3. İki Rekat (Selam 3) */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? 'bg-[#3fb996]/20 text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>3</span>
              <h5 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>Üçüncü 2 Rekat (3. Selam ve Kapanış)</h5>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
                <strong className="block text-emerald-500 mb-1 font-bold">5. Rekat (Ayağa Kalkış):</strong>
                <ul className={`list-disc list-inside space-y-1 font-medium ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                  <li>1 Fâtiha-i Şerîfe</li>
                  <li>3 Kâfirûn Sûresi <em>("Kul yâ eyyühe'l-kâfirûn...")</em></li>
                  <li>11 İhlâs-ı Şerîf</li>
                </ul>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
                <strong className="block text-emerald-500 mb-1 font-bold">6. Rekat:</strong>
                <ul className={`list-disc list-inside space-y-1 font-medium ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                  <li>1 Fâtiha-i Şerîfe</li>
                  <li>10 İhlâs-ı Şerîf</li>
                </ul>
              </div>
            </div>
            <div className={`mt-2.5 text-right text-[11px] font-semibold ${isDark ? 'text-[#3fb996]' : 'text-emerald-600'}`}>
              * Oturuşta dualar okunarak selam verilir ve namaz tamamlanır.
            </div>
          </div>
        </div>

        {/* Namaz Sonrası Dua Bitişi */}
        <div className={`p-4 rounded-xl border text-xs leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#b9b09a]' : 'bg-emerald-50/30 border-emerald-100 text-slate-700'}`}>
          <span className={`font-bold block mb-1 text-sm ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>🤲 Namaz Sonrası Dua ve Tamamlama</span>
          <p>
            Namaz tamamlandıktan sonra eller açılır; günahların affı, kul haklarının ödenmesi, din kardeşlerimizin ve milletimizin selameti için yürekten dua edilir.
          </p>
        </div>
      </div>
    );
  };

  const renderRegaipGecesiNamazi = () => {
    return (
      <div className="space-y-6 text-left">
        {/* Giriş & Genel Bilgi Kutusu */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1c3630]/40 border-[#3fb996]/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} />
            <h4 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
              Regaip Gecesi (Kandili) Namazı
            </h4>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Mübarek Üç Aylar'ın ilki olan Recep ayının ilk Cuma gecesinde (Perşembe'yi Cuma'ya bağlayan gece) kılınan feyizli bir nafile ibadettir. 2 rekatta bir selam verilerek toplam <strong>12 rekat</strong> olarak eda edilir. Namaz sonrasında özel salavat ve secdelerdeki zikirlerle tamamlanır.
          </p>
        </div>

        {/* Vakit ve Niyet Paneli */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Vakti */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-amber-500 mb-1">⏰ Kılınma Vakti:</span>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Recep ayının ilk Cuma gecesi <strong>Akşam namazı ile Yatsı namazı arasında</strong> kılınabileceği gibi, bu vakitte yetiştirilemezse yatsı namazından sonra sahur vaktine kadar kılınabilir.
            </p>
          </div>

          {/* Niyeti */}
          <div className={`p-4 rounded-xl border-l-4 ${isDark ? 'bg-[#181510] border-[#3fb996] text-[#b9b09a]' : 'bg-slate-50 border-emerald-600 text-slate-700'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-emerald-500 mb-1">🤲 Niyet Esası:</span>
            <p className="text-xs sm:text-sm leading-relaxed italic">
              "Niyet ettim Allah rızası için Regaip Gecesi Namazını (veya Hâcet Namazını) kılmaya... Allâhü Ekber"
            </p>
          </div>
        </div>

        {/* Adım Adım Rekat Kılınışı */}
        <div className="space-y-4">
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold border-b pb-1.5 ${isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-200'}`}>
            📖 Rekat Rekat Okunacak Sûreler (12 Rekat - 2 Rekatta Bir Selam)
          </h4>

          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? 'bg-[#3fb996]/20 text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>12</span>
              <h5 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>Her Rekatta Okunacaklar (2 Rekatta Bir Selam)</h5>
            </div>
            
            <p className={`text-xs sm:text-sm mb-3 leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Toplam 12 rekat boyunca, 2 rekatta bir selam verilerek kılınır. Her rekatta sırasıyla şu sûreler okunur:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-emerald-50/40 border-emerald-100'}`}>
                <strong className="block text-emerald-500 mb-1.5 font-bold">Asıl Önerilen Kıraat Ölçüsü:</strong>
                <ul className={`list-disc list-inside space-y-1 font-medium ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                  <li>1 Fâtiha-i Şerîfe</li>
                  <li>3 Kadir Sûresi <em>("İnnâ enzelnâhü fî leyletil-kadr...")</em></li>
                  <li>12 İhlâs-ı Şerîf <em>("Kul hüvellâhü ehad...")</em></li>
                </ul>
              </div>

              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-amber-50/40 border-amber-100'}`}>
                <strong className="block text-amber-500 mb-1.5 font-bold">Kolaylaştırılmış Alternatif Okuyuş:</strong>
                <ul className={`list-disc list-inside space-y-1 font-medium ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                  <li>1 Fâtiha-i Şerîfe</li>
                  <li>1 Kadir Sûresi</li>
                  <li>3 İhlâs-ı Şerîf</li>
                </ul>
              </div>
            </div>
            
            <div className={`mt-3 text-right text-[11px] font-semibold ${isDark ? 'text-[#3fb996]' : 'text-emerald-600'}`}>
              * Her 2 rekatın sonunda oturulur; Et-Tahiyyatü, Salli-Barik, Rabbenâ okunup selam verilerek toplam 12 rekat tamamlanır.
            </div>
          </div>
        </div>

        {/* Namaz Sonrası Özel Zikirler ve Secde Adımları */}
        <div className="space-y-4">
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold border-b pb-1.5 ${isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-200'}`}>
            ✨ Namaz Bittiğinde Yapılacak Özel Tesbihat ve Secde Adımları
          </h4>

          {/* Adım 1: Otururken Salavat */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
            <span className="font-bold text-xs text-amber-500 uppercase tracking-wide block mb-1">Adım 1: Oturduğunuz Yerde 70 Defa Salavat</span>
            <p className={`text-xs sm:text-sm mb-2 ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              12 rekat kılınıp selam verildikten sonra yerinizden kalkmadan <strong>70 defa</strong> şu Salât-ı Ümmiyye okunur:
            </p>
            <div className={`p-3 rounded-lg border font-mono text-center text-sm md:text-base mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              اَللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ النَّبِيِّ الْأُمِّيِّ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ
            </div>
            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "Allahümme salli alâ seyyidinâ Muhammedinin-nebiyyil-ümmiyyi ve alâ âlihî ve sahbihî ve sellim."
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e]">
              <strong>Anlamı:</strong> "Allah'ım! Ümmî Peygamberimiz Efendimiz Muhammed'e, âline ve ashâbına salât ve selâm eyle."
            </p>
          </div>

          {/* Adım 2: 1. Secde */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
            <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-1">Adım 2: Secdeye Vararak 70 Defa Zikir</span>
            <p className={`text-xs sm:text-sm mb-2 ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Salavat tamamlandıktan sonra secdeye varılır ve secdedeyken <strong>70 defa</strong> şöyle denir:
            </p>
            <div className={`p-3 rounded-lg border font-mono text-center text-sm md:text-base mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              سُبُّوحٌ قُدُّوسٌ رَبُّنَا وَرَبُّ الْمَلَائِكَةِ وَالرُّوحِ
            </div>
            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "Sübbûhun Kuddûsün Rabbünâ ve Rabbül-melâiketi ver-Rûh."
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e]">
              <strong>Anlamı:</strong> "Bizim Rabbimiz, meleklerin ve Ruh'un (Cebrail'in) Rabbi; bütün noksanlardan münezzeh, her türlü eksiklikten pâk ve yücedir."
            </p>
          </div>

          {/* Adım 3: Secdeden Doğrulup İki Secde Arasında Otururken */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
            <span className="font-bold text-xs text-amber-500 uppercase tracking-wide block mb-1">Adım 3: Secdeden Doğrulup Otururken 70 Defa İstiğfar</span>
            <p className={`text-xs sm:text-sm mb-2 ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Secdeden baş kaldırıp oturulur ve iki secde arasında otururken <strong>70 defa</strong> şu dua okunur:
            </p>
            <div className={`p-3 rounded-lg border font-mono text-center text-sm md:text-base mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              رَبِّ اغْفِرْ وَارْحَمْ وَتَجَاوَزْ عَمَّا تَعْلَمُ إِنَّكَ أَنْتَ الْأَعَزُّ الْأَكْرَمُ
            </div>
            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "Rabbigfir verham ve tecâvez 'ammâ ta'lem, inneke entel-A'azzül-Ekrem."
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e]">
              <strong>Anlamı:</strong> "Rabbim! Beni bağışla, bana merhamet et, bildiğin bütün kusurlarımdan geç, onları affet. Şüphesiz Sen en yüce ve en kerim olansın."
            </p>
          </div>

          {/* Adım 4: 2. Secde ve Dua */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
            <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-1">Adım 4: Tekrar Secdeye Vararak 70 Defa Zikir & Samimi Dua</span>
            <p className={`text-xs sm:text-sm mb-2 ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Tekrar secdeye varılır ve yine <strong>70 defa</strong> aynı zikir tekrarlanır:
            </p>
            <div className={`p-3 rounded-lg border font-mono text-center text-sm md:text-base mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              سُبُّوحٌ قُدُّوسٌ رَبُّنَا وَرَبُّ الْمَلَائِكَةِ وَالرُّوحِ
            </div>
            <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "Sübbûhun Kuddûsün Rabbünâ ve Rabbül-melâiketi ver-Rûh."
            </p>
            <div className={`p-3 rounded-xl border text-xs leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
              <strong>🤲 Hacet Niyazı:</strong> 70 defa zikir bittikten sonra <strong>henüz secdedeyken</strong> dünyevi ve uhrevi ne haceti, sıkıntısı veya arzusu varsa Yüce Allah Teâlâ'ya samimiyetle niyaz edilir. Ardından baş secdeden kaldırılır ve namaz ile dualar tamamlanmış olur.
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRecepHacetNamazi = (period: '1-10' | '11-20' | '21-30') => {
    const periodTitles = {
      '1-10': "İlk 10 Gün Namazı (1 - 10 Receb-i Şerîf)",
      '11-20': "İkinci 10 Gün Namazı (11 - 20 Receb-i Şerîf)",
      '21-30': "Üçüncü 10 Gün Namazı (21 - 30 Receb-i Şerîf)"
    };

    return (
      <div className="space-y-6 text-left">
        {/* Giriş & Genel Bilgi Kutusu */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1c3630]/40 border-[#3fb996]/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} />
            <h4 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
              Receb-i Şerîf Ayı Hâcet Namazı — {periodTitles[period]}
            </h4>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Resûlullah Efendimizin (s.a.v.) berberi Selmân-ı Pâk (r.a.) Hazretleri tarafından rivâyet edilen bu mübarek hacet namazı, Receb ayında toplam 30 rekat olarak kılınır. 10'ar rekatlık 3 ayrı döneme (1-10, 11-20, 21-30 günleri) ayrılmıştır. Bu namazı eda edenlerin hidayete ereceği ve kalplerinin ölmeyeceği müjdelenmiştir.
          </p>
        </div>

        {/* Vakit ve Niyet Paneli */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Vakti */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-amber-500 mb-1">⏰ Kılınma Vakti & Fazileti:</span>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Akşam namazından sonra veya yatsı namazından sonra kılınabilir. Özellikle <strong>Cuma ve Pazartesi gecelerinde</strong> ve bilhassa <strong>teheccüd vaktinde</strong> kılınması çok daha faziletlidir.
            </p>
          </div>

          {/* Niyeti */}
          <div className={`p-4 rounded-xl border-l-4 ${isDark ? 'bg-[#181510] border-[#3fb996] text-[#b9b09a]' : 'bg-slate-50 border-emerald-600 text-slate-700'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-emerald-500 mb-1">🤲 Özel Niyet Esası:</span>
            <p className="text-xs sm:text-sm leading-relaxed italic">
              "Yâ Rabbî! Teşrifleriyle dünyayı nûra gark ettiğin Efendimiz hürmetine, sevgili ayın Receb-i şerîf hürmetine, beni feyz-i İlâhî’ne, afv-ı İlâhî’ne, rızâ-yı İlâhî’ne nâil eyle, âbid, zâhid kullarının arasına kaydeyle, dünya ve âhiret sıkıntılarından halâs eyle, rızâ-yı şerîfin için... Allâhü Ekber"
            </p>
          </div>
        </div>

        {/* Adım Adım Rekat Kılınışı */}
        <div className="space-y-4">
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold border-b pb-1.5 ${isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-200'}`}>
            📖 Rekat Kılınışı & Okunacak Sûreler (10 Rekat - 2 Rekatta Bir Selam)
          </h4>

          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? 'bg-[#3fb996]/20 text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>10</span>
              <h5 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>Her 2 Rekatta Bir Selam Verilerek 10 Rekat Tamamlanır</h5>
            </div>
            
            <p className={`text-xs sm:text-sm mb-3 leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Bu 10 rekatın her bir rekatında sırasıyla şu sûreler okunur:
            </p>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-emerald-50/40 border-emerald-100'}`}>
              <ul className={`list-disc list-inside space-y-1.5 text-xs sm:text-sm font-medium ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                <li><strong>1 Fâtiha-i Şerîfe</strong></li>
                <li><strong>3 Kâfirûn Sûresi</strong> <em>("Kul yâ eyyühe'l-kâfirûn...")</em></li>
                <li><strong>3 İhlâs-ı Şerîf</strong> <em>("Kul hüvellâhü ehad...")</em></li>
              </ul>
            </div>
            
            <div className={`mt-3 text-right text-[11px] font-semibold ${isDark ? 'text-[#3fb996]' : 'text-emerald-600'}`}>
              * Her 2 rekatta bir oturulur; Et-Tahiyyatü, Salli-Barik, Rabbenâ okunarak selam verilir. Böylece 10 rekat eda edilmiş olur.
            </div>
          </div>
        </div>

        {/* Namaz Sonrası Döneme Özel 11 Defa Okunacak Zikir */}
        <div className="space-y-4">
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold border-b pb-1.5 ${isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-200'}`}>
            ✨ Namaz Bittiğinde {periodTitles[period]} İçin 11 Defa Okunacak Özel Zikir
          </h4>

          {period === '1-10' && (
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
              <span className="font-bold text-xs text-amber-500 uppercase tracking-wide block mb-2">1. Dönem (1 - 10 Receb) Özel Zikri (11 Defa Okunur):</span>
              <div className={`p-4 rounded-lg border font-mono text-center text-sm md:text-base mb-3 leading-loose ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
                لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ حَيٌّ لَا يَمُوتُ بِيَدِهِ الْخَيْرُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. اَللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ وَلَا مُعْطِيَ لِمَا مَنَعْتَ وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ
              </div>
              <p className={`text-xs font-semibold mb-2 leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                <strong>Okunuşu:</strong> "Lâ ilâhe illallâhü vahdehû lâ şerîke leh, lehü’l-mülkü ve lehü’l-hamdü yuhyî ve yümît ve hüve Hayyün lâ yemût, biyedihi’l-hayr ve hüve alâ külli şey’in kadîr. Allâhümme lâ mânia limâ a'tayte, velâ mu'tiye limâ mena'te, velâ yenfeu ze'l-ceddi minke'l-ceddü."
              </p>
              <p className="text-xs text-slate-500 dark:text-[#8c826e] leading-relaxed">
                <strong>Anlamı:</strong> "Allah’tan başka hiçbir ilâh yoktur, sâdece O vardır. O tektir ve şerîki (ortağı) yoktur. Mülk O’nundur, hamd de O’na mahsustur. O diriltir ve öldürür. O daima diridir, asla ölmez. Bütün hayırlar O’nun kudret elindedir ve O her şeye kadirdir. Allah’ım! Sen’in verdiğine mâni olacak yoktur, Sen’in menettiğini de verecek yoktur. Servet ve makam sahiplerine Sen’in katında malları ve şanları fayda vermez (ancak salih ameller fayda verir)."
              </p>
            </div>
          )}

          {period === '11-20' && (
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
              <span className="font-bold text-xs text-amber-500 uppercase tracking-wide block mb-2">2. Dönem (11 - 20 Receb) Özel Zikri (11 Defa Okunur):</span>
              <div className={`p-4 rounded-lg border font-mono text-center text-sm md:text-base mb-3 leading-loose ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
                إِلٰهاً وَاحِداً أَحَداً صَمَداً فَرْداً وِتْراً حَيّاً قَيُّوماً دَائِمًا أَبَدًا
              </div>
              <p className={`text-xs font-semibold mb-2 leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                <strong>Okunuşu:</strong> "İlâhen Vâhiden Ehaden Sameden Ferden Vitran Hayyen Kayyûmen Dâimen Ebedâ."
              </p>
              <p className="text-xs text-slate-500 dark:text-[#8c826e] leading-relaxed">
                <strong>Anlamı:</strong> "(O Allah) Birdir, tektir; hiçbir şeye muhtaç olmayıp her şey Kendisine muhtaçtır; tektir, eşi ve benzeri yoktur; daima diridir, kâinatı ayakta tutandır, daimîdir ve ebedîdir; öyle bir ilâhtır ki ancak O vardır."
              </p>
            </div>
          )}

          {period === '21-30' && (
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
              <span className="font-bold text-xs text-amber-500 uppercase tracking-wide block mb-2">3. Dönem (21 - 30 Receb) Özel Zikri (11 Defa Okunur):</span>
              <div className={`p-4 rounded-lg border font-mono text-center text-sm md:text-base mb-3 leading-loose ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
                اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا رَادَّ لِمَا قَضَيْتَ، وَلَا مُبَدِّلَ لِمَا حَكَمْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ. سُبْحَانَ رَبِّيَ الْعَلِيِّ الْأَعْلَى الْوَهَّابِ، سُبْحَانَ رَبِّيَ الْعَلِيِّ الْأَعْلَى الْوَهَّابِ، سُبْحَانَ رَبِّيَ الْعَلِيِّ الْأَعْلَى الْكَرِيمِ الْوَهَّابِ، يَا وَهَّابُ يَا وَهَّابُ يَا وَهَّابُ
              </div>
              <p className={`text-xs font-semibold mb-2 leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                <strong>Okunuşu:</strong> "Allâhümme lâ mânia limâ a’tayte, velâ mu’tiye limâ mena’te, velâ râdde limâ kadayte, velâ mübeddile limâ hakemte, velâ yenfeu ze’l-ceddi minke’l-ceddü. Sübhâne Rabbiye’l-Aliyyi’l-a’le’l-Vehhâb, Sübhâne Rabbiye’l-Aliyyi’l-a’le’l-Vehhâb, Sübhâne Rabbiye’l-Aliyyi’l-a’le’l-Kerîmi’l-Vehhâb, yâ Vehhâbü yâ Vehhâbü yâ Vehhâb."
              </p>
              <p className="text-xs text-slate-500 dark:text-[#8c826e] leading-relaxed">
                <strong>Anlamı:</strong> "Allah'ım! Senin verdiğine engel olacak kimse yoktur, engellediğini verecek de yoktur. Hükmettiğini geri çevirecek yoktur, hükmünü değiştirecek de yoktur. Kişinin serveti ve şansı (makamı) Senin azabına karşı kendisine bir fayda vermez (kurtarıcı olan ancak Senin rahmetindir). Yüce, en üstün ve bahşeden Rabbim bütün noksan sıfatlardan uzaktır. Yüce, en üstün ve bahşeden Rabbim münezzehtir. Yüce, en üstün, cömert ve bahşeden Rabbim münezzehtir. Ey çokça bağışlayan ve lütfeden Vehhâb, ey Vehhâb, ey Vehhâb!"
              </p>
            </div>
          )}

          {/* Tamamlama Notu */}
          <div className={`p-4 rounded-xl border text-xs leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
            <strong>🤲 Dua Bitişi:</strong> 11 defa bu zikir okunduktan sonra eller açılıp dünya ve ahiret sıkıntılarından kurtuluş, ilahi affa ve rızaya nailiyet için yürekten dua edilir.
          </div>
        </div>
      </div>
    );
  };

  const renderMiracGecesiNamazi = () => {
    return (
      <div className="space-y-6 text-left">
        {/* Giriş & Genel Bilgi Kutusu */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1c3630]/40 border-[#3fb996]/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} />
            <h4 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
              Receb-i Şerîf 27. Gece (Miraç Kandili) Gece ve Gündüz İbadetleri
            </h4>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Peygamber Efendimiz'in (s.a.v.) Mescid-i Harâm'dan Mescid-i Aksâ'ya ve oradan ilahi huzura yükseldiği Miraç Gecesi (27 Receb), yedi kat göklerin sırlarıyla müşerref kılındığı mübarek gecedir. Gece 12 rekat hacet namazı ile, gündüz ise öğle-ikindi arası 4 rekat namaz ve oruçla ihya edilir.
          </p>
        </div>

        {/* Vakit ve Niyet Paneli */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Vakti */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-amber-500 mb-1">⏰ Kılınma Vakti:</span>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Gece ibadeti <strong>Yatsı namazından sonra</strong> kılınır. Gündüz ibadeti ise Miraç Kandili gününde <strong>Öğle namazı ile İkindi namazı arasında</strong> eda edilir.
            </p>
          </div>

          {/* Niyeti */}
          <div className={`p-4 rounded-xl border-l-4 ${isDark ? 'bg-[#181510] border-[#3fb996] text-[#b9b09a]' : 'bg-slate-50 border-emerald-600 text-slate-700'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-emerald-500 mb-1">🤲 Gece Namazı Niyet Esası:</span>
            <p className="text-xs sm:text-sm leading-relaxed italic">
              "Yâ Rabbî, rızâ-yı şerîfin için niyet eyledim namaza. Bu gece, yedi kat gökleri ve bütün esrârını göstererek muhabbetin ile müşerref kıldığın Habîbin Resûl-i Zîşân Efendimiz hürmetine, ben âciz kulunu afv-ı İlâhî'ne, feyz-i İlâhî'ne ve rızâ-yı İlâhî'ne mazhar eyle... Allâhü Ekber"
            </p>
          </div>
        </div>

        {/* BÖLÜM 1: Gece Kılınacak 12 Rekatlık Namaz */}
        <div className="space-y-4">
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold border-b pb-1.5 ${isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-200'}`}>
            🌙 1. BÖLÜM: Gece Kılınacak 12 Rekatlık Hâcet Namazı (2 Rekatta Bir Selam)
          </h4>

          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? 'bg-[#3fb996]/20 text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>12</span>
              <h5 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>2 Rekatta Bir Selam Verilerek 12 Rekat Kılınır</h5>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-emerald-50/40 border-emerald-100'}`}>
              <strong className="block text-emerald-500 mb-1.5 font-bold">Her Rekatta Okunacaklar:</strong>
              <ul className={`list-disc list-inside space-y-1 text-xs sm:text-sm font-medium ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                <li><strong>1 Fâtiha-i Şerîfe</strong></li>
                <li><strong>10 İhlâs-ı Şerîf</strong> <em>("Kul hüvellâhü ehad...")</em></li>
              </ul>
            </div>

            <div className={`mt-3 text-right text-[11px] font-semibold ${isDark ? 'text-[#3fb996]' : 'text-emerald-600'}`}>
              * Her 2 rekatın sonunda oturulur; Et-Tahiyyatü, Salli-Barik, Rabbenâ okunarak selam verilir.
            </div>
          </div>
        </div>

        {/* BÖLÜM 2: Namaz Sonrası Zikirler ve Tesbihat */}
        <div className="space-y-4">
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold border-b pb-1.5 ${isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-200'}`}>
            ✨ 2. BÖLÜM: 12 Rekat Bittikten Sonra Yapılacak Zikirler
          </h4>

          {/* 4 Fatiha */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
            <span className="font-bold text-xs text-amber-500 uppercase tracking-wide block mb-1">Adım 1: 4 Fâtiha-i Şerîfe Okunur</span>
            <p className={`text-xs ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Namaz tamamlandıktan sonra yerinizden kalkmadan <strong>4 defa Fâtiha-i Şerîfe</strong> okunur.
            </p>
          </div>

          {/* 100 Tevhid & Tesbih Zikri */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
            <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-1">Adım 2: 100 Defa Tesbih ve Tevhid Zikri</span>
            <div className={`p-3 rounded-lg border font-mono text-center text-sm md:text-base mb-2 leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ
            </div>
            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "Sübhânallâhi ve'l-hamdü lillâhi velâ ilâhe illallâhü vallâhü ekber, velâ havle velâ kuvvete illâ billâhi'l-aliyyi'l-azîm."
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e]">
              <strong>Anlamı:</strong> "Allah'ı tüm noksan sıfatlardan tenzih ederim, hamd Allah'a mahsustur, Allah'tan başka ilah yoktur ve Allah en büyüktür. Yüce ve azim olan Allah'tan başka hiçbir güç ve kuvvet yoktur."
            </p>
          </div>

          {/* 100 Istigfar */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
            <span className="font-bold text-xs text-amber-500 uppercase tracking-wide block mb-1">Adım 3: 100 Defa İstiğfâr-ı Şerîf</span>
            <div className={`p-3 rounded-lg border font-mono text-center text-sm md:text-base mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ
            </div>
            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "Estağfirullahel'azîm ellezî lâ ilâhe illâ hüvel-Hayyel-Kayyûme ve etûbü ileyh." <em>(Kısaca: "Estağfirullah")</em>
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e]">
              <strong>Anlamı:</strong> "Azamet sahibi, kendisinden başka ilah olmayan, diri (Hayy) ve her şeyi ayakta tutan (Kayyûm) Allah'tan af diler ve O'na tövbe ederim."
            </p>
          </div>

          {/* 100 Salavat */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
            <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-1">Adım 4: 100 Defa Salevât-ı Şerîfe</span>
            <div className={`p-3 rounded-lg border font-mono text-center text-sm md:text-base mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              اَللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ
            </div>
            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "Allâhümme salli alâ Muhammedin ve alâ âli Muhammed." <em>(Veya: "Allâhümme salli alâ Muhammed")</em>
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e]">
              <strong>Anlamı:</strong> "Allah'ım! Efendimiz Muhammed'e ve O'nun âline (Ehl-i Beyti'ne) rahmet, salât ve selam eyle."
            </p>
          </div>
        </div>

        {/* BÖLÜM 3: Gündüz İbadeti ve Faziletler */}
        <div className="space-y-4">
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold border-b pb-1.5 ${isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-200'}`}>
            ☀️ 3. BÖLÜM: Miraç Kandili Gündüzü İbadeti (Öğle - İkindi Arası 4 Rekat)
          </h4>

          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? 'bg-[#3fb996]/20 text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>4</span>
              <h5 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>Gündüz Kılınacak 4 Rekatlık Özel Namaz</h5>
            </div>

            <p className={`text-xs sm:text-sm mb-3 ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Miraç gecesini takip eden gündüzde, <strong>öğle namazı ile ikindi namazı arasında</strong> 4 rekat namaz kılınır. Her rekatta Fâtiha-i Şerîfe'den sonra sırasıyla şu sûreler 5'er defa okunur:
            </p>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-amber-50/40 border-amber-100'}`}>
              <ul className={`list-disc list-inside space-y-1 text-xs sm:text-sm font-medium ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                <li><strong>1 Fâtiha-i Şerîfe</strong></li>
                <li><strong>5 Âyetü'l-Kürsî</strong></li>
                <li><strong>5 Kâfirûn Sûresi</strong> <em>("Kul yâ eyyühe'l-kâfirûn...")</em></li>
                <li><strong>5 İhlâs-ı Şerîf</strong> <em>("Kul hüvellâhü ehad...")</em></li>
                <li><strong>5 Felak Sûresi</strong> <em>("Kul eûzü birabbi'l-felak...")</em></li>
                <li><strong>5 Nâs Sûresi</strong> <em>("Kul eûzü birabbi'n-nâs...")</em></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Müjde ve Fazilet Notu */}
        <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#b9b09a]' : 'bg-emerald-50/40 border-emerald-100 text-slate-700'}`}>
          <div className="font-bold text-sm text-emerald-600 dark:text-[#3fb996] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Miraç Gecesi Müjdeleri & Oruç Fazileti</span>
          </div>
          <p>
            • <strong>Namaz Borçlarının Ödenmesi Müjdesi:</strong> Bu gecede kılınan namazın feyz ve bereketiyle mümin huzûr-ı İlâhî'ye namaz borçlusu olarak çıkmaz; namaz borçlarını eda etmeye muvaffak kılınır.
          </p>
          <p>
            • <strong>60 Ay Oruç Sevabı:</strong> Hadîs-i şerîfte buyrulmuştur ki: Receb-i şerîfin 27. gününde (kandil gecesini takip eden gündüzde) oruç tutan kimseye <strong>60 ay oruç tutmuş gibi</strong> sevap yazılacağı vaad edilmiştir.
          </p>
        </div>
      </div>
    );
  };

  const renderSaban1GecesiNamazi = () => {
    return (
      <div className="space-y-6 text-left">
        {/* Giriş & Genel Bilgi Kutusu */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1c3630]/40 border-[#3fb996]/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} />
            <h4 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
              Şâbân-ı Şerîf Ayının 1. Gece Namazı (Tesbih Namazı)
            </h4>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Peygamber Efendimiz'in (s.a.v.) "Benim ayımdır" buyurduğu mübarek Şâbân-ı Şerîf ayının ilk gecesini ihya etmek vesilesiyle kılınan hususi bir tesbih namazıdır.
          </p>
        </div>

        {/* Vakit ve Niyet Paneli */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Vakti */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-amber-500 mb-1">⏰ Kılınma Vakti:</span>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Şâbân-ı Şerîf ayının 1. gecesinde <strong>Akşam namazından hemen sonra</strong> kılınır.
            </p>
          </div>

          {/* Niyeti */}
          <div className={`p-4 rounded-xl border-l-4 ${isDark ? 'bg-[#181510] border-[#3fb996] text-[#b9b09a]' : 'bg-slate-50 border-emerald-600 text-slate-700'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-emerald-500 mb-1">🤲 Niyet Esası:</span>
            <p className="text-xs sm:text-sm leading-relaxed italic">
              "Niyet eyledim ya Rabbî Senin rızâ-yı şerîfin için Tesbih Namazı kılmaya, Şâbân-ı Şerîf ayının şerefine... Allâhü Ekber"
            </p>
          </div>
        </div>

        {/* Adım Adım Rekat Kılınışı */}
        <div className="space-y-4">
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold border-b pb-1.5 ${isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-200'}`}>
            📖 Rekat Kılınışı & Kıraat Detayları (4 Rekat Tesbih Namazı)
          </h4>

          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? 'bg-[#3fb996]/20 text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>4</span>
              <h5 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>Tesbih Namazı Usûlü ile 4 Rekat Eda Edilir</h5>
            </div>

            <div className={`p-4 rounded-xl border mb-3 ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-emerald-50/40 border-emerald-100'}`}>
              <strong className="block text-emerald-500 mb-1.5 font-bold">Her Rekatta Okunacaklar:</strong>
              <ul className={`list-disc list-inside space-y-1 text-xs sm:text-sm font-medium ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                <li><strong>1 Fâtiha-i Şerîfe</strong></li>
                <li><strong>3 Âyetü'l-Kürsî</strong></li>
                <li>Gerekli rukünlerde <strong>Tesbih Zikri</strong> <em>("Sübhânallâhi ve'l-hamdü lillâhi velâ ilâhe illallâhü vallâhü ekber")</em> toplam 75'er defa tekrarlanır.</li>
              </ul>
            </div>

            <div className={`text-right text-[11px] font-semibold ${isDark ? 'text-[#3fb996]' : 'text-emerald-600'}`}>
              * Namaz tamamlandıktan sonra eller açılıp Şâbân-ı Şerîf ayının feyzinden ve bereketinden istifade etmek için dua edilir.
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSaban27GecesiNamazi = () => {
    return (
      <div className="space-y-6 text-left">
        {/* Giriş & Genel Bilgi Kutusu */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1c3630]/40 border-[#3fb996]/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} />
            <h4 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
              Şâbân-ı Şerîf Ayının 27. Gecesi Teşekkür Namazı
            </h4>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Peygamber Efendimiz'in (s.a.v.) mübarek ayının sonuna yaklaşmanın bir şükran ifadesi olarak Şâbân-ı Şerîf'in 27. gecesinde eda edilen 2 rekatlık özel bir teşekkür ve şefaat isteme namazıdır.
          </p>
        </div>

        {/* Vakit ve Niyet Paneli */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Vakti */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-amber-500 mb-1">⏰ Kılınma Vakti:</span>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Şâbân-ı Şerîf ayının 27. gecesi <strong>Akşam namazı ile Yatsı namazı arasında</strong> kılınır.
            </p>
          </div>

          {/* Niyeti */}
          <div className={`p-4 rounded-xl border-l-4 ${isDark ? 'bg-[#181510] border-[#3fb996] text-[#b9b09a]' : 'bg-slate-50 border-emerald-600 text-slate-700'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-emerald-500 mb-1">🤲 Özel Niyet Esası:</span>
            <p className="text-xs sm:text-sm leading-relaxed italic">
              "Yâ Rabbî! Beni Resûl-i Zîşân Efendimizin ayının sonuna yaklaştırdın. Resûlullah Efendimizi (s.a.v.) ve mübarek ayını bana hem şefaatçi ve hem de şâhit eyle... Allâhü Ekber"
            </p>
          </div>
        </div>

        {/* Adım Adım Rekat Kılınışı */}
        <div className="space-y-4">
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold border-b pb-1.5 ${isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-200'}`}>
            📖 Rekat Kılınışı & Kıraat (2 Rekat Teşekkür Namazı)
          </h4>

          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? 'bg-[#3fb996]/20 text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>2</span>
              <h5 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>2 Rekat Olarak Kılınır</h5>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-emerald-50/40 border-emerald-100'}`}>
              <ul className={`list-disc list-inside space-y-1 text-xs sm:text-sm font-medium ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                <li>Her rekatta <strong>1 Fâtiha-i Şerîfe</strong> okunur.</li>
                <li>Fâtiha'dan sonra <strong>istenilen herhangi bir sûre</strong> (örneğin İhlâs, Felak, Nâs veya Kadir) okunabilir.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Namaz Sonrası Tesbihat ve Zikirler */}
        <div className="space-y-4">
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold border-b pb-1.5 ${isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-200'}`}>
            ✨ Namaz Bittiğinde Yapılacak İstiğfar, Salavat ve İltica
          </h4>

          {/* 70 Istigfar */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
            <span className="font-bold text-xs text-amber-500 uppercase tracking-wide block mb-1">Adım 1: 70 Defa İstiğfâr-ı Şerîf</span>
            <div className={`p-3 rounded-lg border font-mono text-center text-sm md:text-base mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْكَ
            </div>
            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "Estağfirullâhe'l-azîm ve etûbü ileyk."
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e]">
              <strong>Anlamı:</strong> "Yüce Allah'tan bağışlanma diler ve O'na tövbe ederim."
            </p>
          </div>

          {/* 100 Salavat-i Ruh-i Muhammed */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
            <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-1">Adım 2: 100 Defa Salât-ı Rûh-i Muhammedî</span>
            <div className={`p-3 rounded-lg border font-mono text-center text-sm md:text-base mb-2 leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              اَللَّهُمَّ صَلِّ عَلَى رُوحِ مُحَمَّدٍ فِي الْأَرْوَاحِ وَصَلِّ عَلَى جَسَدِ مُحَمَّدٍ فِي الْأَجْسَادِ وَصَلِّ عَلَى قَبْرِ مُحَمَّدٍ فِي الْقُبُورِ
            </div>
            <p className={`text-xs font-semibold mb-1 leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "Allâhümme salli alâ rûhi Muhammedin fi'l-ervâhi, ve salli alâ cesedi Muhammedin fi'l-ecsâdi, ve salli alâ kabri Muhammedin fi'l-kubûr."
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e] leading-relaxed">
              <strong>Anlamı:</strong> "Allah'ım! Ruhlar içinde Efendimiz Muhammed'in ruhuna salât eyle, cesetler içinde Efendimiz Muhammed'in cesedine salât eyle ve kabirler içinde Efendimiz Muhammed'in kabrine salât eyle."
            </p>
          </div>

          {/* İltica ve Dua */}
          <div className={`p-4 rounded-xl border text-xs leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
            <strong className="block mb-1 text-sm">🤲 Huzura İlticâ ve Dua:</strong>
            Salavat bittikten sonra eller açılır ve <em>"Yâ Rabbî! Senin huzûr-ı sırr-ı ehadiyyetine ilticâ ediyorum..."</em> denilerek Yüce Allah'a sığınılır, Efendimiz'in (s.a.v.) şefaatı ve Şâbân ayının şahitliği niyaz edilerek dua tamamlanır.
          </div>
        </div>
      </div>
    );
  };

  const renderBeratGecesiNamazi = () => {
    return (
      <div className="space-y-6 text-left">
        {/* Giriş & Genel Bilgi Kutusu */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1c3630]/40 border-[#3fb996]/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} />
            <h4 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
              Berât Gecesi İbadeti (15 Şâbân — Hayır Namazı ve 14'erli Zikirler)
            </h4>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Şâbân-ı Şerîf'in 15. gecesi olan Berât Gecesi, kulların bir yıllık rızık, ecel ve amel takdirlerinin yazıldığı mübarek af gecesidir. Bu gecede en azından bir <strong>Tesbih Namazı</strong> kılınması ve tavsiye edilen 100 rekatlık <strong>"Hayır Namazı"</strong> eda edilmesi büyük bir fazilettir.
          </p>
        </div>

        {/* Vakit ve Niyet Paneli */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Vakti */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-amber-500 mb-1">⏰ Kılınma Vakti:</span>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Berât Gecesi'nde <strong>Yatsı namazından sonra</strong> imsak vaktine kadar kılınabilir.
            </p>
          </div>

          {/* Niyeti */}
          <div className={`p-4 rounded-xl border-l-4 ${isDark ? 'bg-[#181510] border-[#3fb996] text-[#b9b09a]' : 'bg-slate-50 border-emerald-600 text-slate-700'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-emerald-500 mb-1">🤲 Özel Niyet Esası:</span>
            <p className="text-xs sm:text-sm leading-relaxed italic">
              "Yâ Rabbî! Niyet ettim Senin rızâ-yı şerîfin için namaza. Beni afv-ı İlâhî’ne, feyz-i İlâhî’ne mazhar eyle. Kasvet-i kalpten, dünya ve âhiret sıkıntılarından halâs eyleyip saîdler defterine kaydeyle... Allâhü Ekber"
            </p>
          </div>
        </div>

        {/* Adım Adım Rekat Kılınışı */}
        <div className="space-y-4">
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold border-b pb-1.5 ${isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-200'}`}>
            📖 Rekat Kılınışı & Kıraat Detayları (100 Rekat Hayır Namazı)
          </h4>

          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? 'bg-[#3fb996]/20 text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>100</span>
              <h5 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>2 Rekatta Bir Selam Verilerek 100 Rekat Tamamlanır</h5>
            </div>

            <div className={`p-4 rounded-xl border mb-3 ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-emerald-50/40 border-emerald-100'}`}>
              <strong className="block text-emerald-500 mb-1.5 font-bold">Her Rekatta Okunacaklar:</strong>
              <ul className={`list-disc list-inside space-y-1 text-xs sm:text-sm font-medium ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                <li><strong>1 Fâtiha-i Şerîfe</strong></li>
                <li><strong>10 İhlâs-ı Şerîf</strong> <em>("Kul hüvellâhü ehad...")</em></li>
              </ul>
            </div>

            <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-amber-50/50 border-amber-200 text-amber-900'}`}>
              <strong>⭐ Müjde:</strong> Bu 100 rekatlık Hayır Namazını kılan kimse, o sene vefat ederse şehitlik mertebesine nail olur.
            </div>
          </div>
        </div>

        {/* Namaz Sonrası 14'erli Özel Zikirler */}
        <div className="space-y-4">
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold border-b pb-1.5 ${isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-200'}`}>
            ✨ Namaz Bittiğinde 14'er Adet Okunacak Zikir ve Sûreler
          </h4>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            <em>(Hikmeti: Allâhü Teâlâ’nın "Hû" ism-i şerîfinin ebced değeri 11, Efendimiz'in "Tâhâ" isminin ebced değeri 14 olduğu için aşağıdaki 11 özel husus 14'er defa okunur)</em>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs sm:text-sm">
            {/* 1. İstiğfar */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
              <span className="font-bold text-xs text-amber-500 uppercase tracking-wide block mb-1">1. 14 Kere İstiğfâr-ı Şerîf</span>
              <div className={`p-2.5 rounded-lg border font-mono text-center text-xs sm:text-sm mb-1.5 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
                أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ
              </div>
              <p className={`text-xs font-medium ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                "Estağfirullâhe'l-azîm ellezî lâ ilâhe illâ hüve'l-Hayyü'l-Kayyûmü ve etûbü ileyh."
              </p>
            </div>

            {/* 2. Salât-ı Münciye */}
            <div className={`p-4 rounded-xl border col-span-1 md:col-span-2 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
              <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-1">2. 14 Kere Salât-ı Münciye (Kurtuluş Salavatı)</span>
              <div className={`p-2.5 rounded-lg border font-mono text-center text-xs sm:text-sm mb-1.5 leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
                اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ، صَلَاةً تُنجِينَا بِهَا مِنْ جَمِيعِ الْأَهْوَالِ وَالْآفَاتِ، وَتَقْضِي لَنَا بِهَا جَمِيعَ الْحَاجَاتِ، وَتُطَهِّرُنَا بِهَا مِنْ جَمِيعِ السَّيِّئَاتِ، وَتَرْفَعُنَا بِهَا عِنْدَكَ أَعْلَى الدَّرَجَاتِ، وَتُبَلِّغُنَا بِهَا أَقْصَى الْغَايَاتِ مِنْ جَمِيعِ الْخَيْرَاتِ فِي الْحَيَاةِ وَبَعْدَ الْمَمَاتِ
              </div>
              <p className={`text-xs font-medium mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                <strong>Okunuşu:</strong> "Allahümme salli alâ seyyidinâ Muhammedin ve alâ âli seyyidinâ Muhammed. Salâten tüncînâ bihâ min cemî’il-ehvâli ve’l-âfât. Ve takdî lenâ bihâ cemî’al-hâcât. Ve tütahhirunâ bihâ min cemî’is-seyyiât. Ve terfe’unâ bihâ indeke a’led-derecât. Ve tübelliğunâ bihâ aksal-ğâyât. Min cemî’il-hayrâti fi’l-hayâti ve ba’del-memât."
              </p>
              <p className="text-xs text-slate-500 dark:text-[#8c826e]">
                <strong>Anlamı:</strong> "Allah’ım! Efendimiz Muhammed’in ve O’nun ailesinin üzerine öyle bir salât (rahmet) eyle ki; o salât vesilesiyle bizi bütün korku ve afetlerden kurtar. Bizim bütün ihtiyaçlarımızı karşıla. Bizi bütün kötülüklerden temizle. Bizi katındaki en yüce derecelere yükselt. Hayatta ve ölümden sonra, bütün hayırlı gayelerin en son noktasına ulaştır."
              </p>
            </div>

            {/* 3. Fatiha */}
            <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
              <strong className="block text-amber-500 mb-1 font-bold">3. 14 Kere Fâtiha-i Şerîfe</strong>
              <p className={isDark ? 'text-[#b9b09a]' : 'text-slate-600'}>Besmele-i Şerîfe ile 14 defa Fâtiha okunur.</p>
            </div>

            {/* 4. Ayetel Kursi */}
            <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
              <strong className="block text-emerald-500 mb-1 font-bold">4. 14 Kere Âyetü'l-Kürsî</strong>
              <p className={isDark ? 'text-[#b9b09a]' : 'text-slate-600'}>Besmele-i Şerîfe ile 14 defa Âyetü'l-Kürsî okunur.</p>
            </div>

            {/* 5. Tevbe 128-129 */}
            <div className={`p-4 rounded-xl border col-span-1 md:col-span-2 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
              <span className="font-bold text-xs text-amber-500 uppercase tracking-wide block mb-1">5. 14 Kere Tevbe Sûresi 128-129. Âyetleri ("Lekad Câeküm...")</span>
              <div className={`p-2.5 rounded-lg border font-mono text-center text-xs sm:text-sm mb-1.5 leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
                لَقَدْ جَاءَكُمْ رَسُولٌ مِنْ أَنْفُسِكُمْ عَزِيزٌ عَلَيْهِ مَا عَنِتُّمْ حَرِيصٌ عَلَيْكُمْ بِالْمُؤْمِنِينَ رَءُوفٌ رَحِيمٌ ﴿١٢٨﴾ فَإِنْ تَوَلَّوْا فَقُلْ حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ ﴿١٢٩﴾
              </div>
              <p className={`text-xs font-medium mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                "Lekad câeküm rasûlün min enfüsiküm azîzün aleyhi mâ anittüm harîsün aleyküm bil-mü'minîne raûfür-rahîm. Fe in tevellev fekul hasbiyallâhü lâ ilâhe illâ hüve, aleyhi tevekkeltü ve hüve rabbül-arşil-azîm."
              </p>
            </div>

            {/* 6. Yasin */}
            <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
              <strong className="block text-emerald-500 mb-1 font-bold">6. 14 Kere "Yâsîn, Yâsîn..." Dedikten Sonra 1 Yâsîn-i Şerîf</strong>
              <p className={`text-xs ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>14 defa "Yâsîn" nidasından sonra 1 Yâsîn-i Şerîf okunur (içindeki 7 zâhirî, 7 bâtınî mübîn ile 14'e tamamlanır).</p>
            </div>

            {/* 7. Ihlas */}
            <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
              <strong className="block text-amber-500 mb-1 font-bold">7. 14 Kere İhlâs-ı Şerîf</strong>
              <p className={`text-xs ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>Besmele ile 14 defa İhlâs-ı Şerîf okunur.</p>
            </div>

            {/* 8. Felak */}
            <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
              <strong className="block text-emerald-500 mb-1 font-bold">8. 14 Kere Felak Sûresi</strong>
              <p className={`text-xs ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>Besmele ile 14 defa Felak Sûresi okunur.</p>
            </div>

            {/* 9. Nas */}
            <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
              <strong className="block text-amber-500 mb-1 font-bold">9. 14 Kere Nâs Sûresi</strong>
              <p className={`text-xs ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>Besmele ile 14 defa Nâs Sûresi okunur.</p>
            </div>

            {/* 10. Tesbih ve Tevhid */}
            <div className={`p-4 rounded-xl border col-span-1 md:col-span-2 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
              <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-1">10. 14 Kere Tesbih ve Tevhid Zikri</span>
              <div className={`p-2.5 rounded-lg border font-mono text-center text-xs sm:text-sm mb-1.5 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
                سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ
              </div>
              <p className={`text-xs font-medium ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                "Sübhânallâhi ve'l-hamdü lillâhi velâ ilâhe illallâhü vallâhü ekber. Velâ havle velâ kuvvete illâ billâhi'l-aliyyi'l-azîm."
              </p>
            </div>
          </div>

          {/* 11. Dua */}
          <div className={`p-4 rounded-xl border text-xs leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
            <strong className="block mb-1 text-sm">11. 🤲 Tamamlama ve Samimi Dua:</strong>
            Zikirler bittikten sonra eller dergah-ı ilahiye açılır; afv-ı ilahiye mazhariyet, kasvet-i kalpten ve dünya-ahiret sıkıntılarından kurtuluş niyetiyle dua edilip tamamlanır.
          </div>
        </div>
      </div>
    );
  };

  const renderKadirGecesiNamazi = () => {
    return (
      <div className="space-y-6 text-left">
        {/* Giriş & Genel Bilgi Kutusu */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1c3630]/40 border-[#3fb996]/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} />
            <h4 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
              Kadir Gecesi İbadeti (Bin Aydan Hayırlı Mübarek Gece)
            </h4>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Kutsal kitabımız Kur'ân-ı Kerîm'in indirilmeye başlandığı Kadir Gecesi, <strong>"bin aydan (80 yıllık bir ömürden) daha hayırlı"</strong> olan mübarek gecedir. Hz. Cebrail (a.s.) vasıtasıyla Peygamber Efendimiz'e (s.a.v.) müjdelenen bu gecede 4 rekatlık Kadir Gecesi namazı ve özel tesbihatlar eda edilir.
          </p>
        </div>

        {/* Vakit ve Niyet Paneli */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Vakti */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-amber-500 mb-1">⏰ Kılınma Vakti:</span>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Kadir Gecesi'nde <strong>Yatsı ve Teravih namazından sonra</strong> imsak vakti girinceye kadar eda edilebilir.
            </p>
          </div>

          {/* Niyeti */}
          <div className={`p-4 rounded-xl border-l-4 ${isDark ? 'bg-[#181510] border-[#3fb996] text-[#b9b09a]' : 'bg-slate-50 border-emerald-600 text-slate-700'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-emerald-500 mb-1">🤲 Özel Niyet Esası:</span>
            <p className="text-xs sm:text-sm leading-relaxed italic">
              "Niyet ettim ya Rabbî Senin rızâ-yı şerîfin için Kadir Gecesi namazını kılmaya. Ya Rabbî Bu gecedeki tecelliyat-ı ilâhiyyenden, afv-ı ilâhînden ve feyz-i ilâhînden hissedar olabilmek niyetiyle... Allâhü Ekber"
            </p>
          </div>
        </div>

        {/* Adım Adım Rekat Kılınışı */}
        <div className="space-y-4">
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold border-b pb-1.5 ${isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-200'}`}>
            📖 Rekat Rekat Kılınış & Okunacak Sûreler (4 Rekat)
          </h4>

          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? 'bg-[#3fb996]/20 text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>4</span>
              <h5 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>4 Rekat Olarak Kılınır</h5>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              {/* 1. Rekat */}
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
                <strong className="block text-emerald-500 mb-1 font-bold">1. Rekat:</strong>
                <ul className={`list-disc list-inside space-y-1 font-medium ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                  <li>1 Fâtiha-i Şerîfe</li>
                  <li>3 Kadir Sûresi <em>("İnnâ enzelnâhü fî leyletil-kadr...")</em></li>
                </ul>
              </div>

              {/* 2. Rekat */}
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
                <strong className="block text-emerald-500 mb-1 font-bold">2. Rekat:</strong>
                <ul className={`list-disc list-inside space-y-1 font-medium ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                  <li>1 Fâtiha-i Şerîfe</li>
                  <li>3 İhlâs-ı Şerîf <em>("Kul hüvellâhü ehad...")</em></li>
                </ul>
              </div>

              {/* 3. Rekat */}
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
                <strong className="block text-emerald-500 mb-1 font-bold">3. Rekat:</strong>
                <ul className={`list-disc list-inside space-y-1 font-medium ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                  <li>1 Fâtiha-i Şerîfe</li>
                  <li>3 Kadir Sûresi <em>("İnnâ enzelnâhü fî leyletil-kadr...")</em></li>
                </ul>
              </div>

              {/* 4. Rekat */}
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
                <strong className="block text-emerald-500 mb-1 font-bold">4. Rekat:</strong>
                <ul className={`list-disc list-inside space-y-1 font-medium ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                  <li>1 Fâtiha-i Şerîfe</li>
                  <li>3 İhlâs-ı Şerîf <em>("Kul hüvellâhü ehad...")</em></li>
                </ul>
              </div>
            </div>

            <div className={`mt-3 text-right text-[11px] font-semibold ${isDark ? 'text-[#3fb996]' : 'text-emerald-600'}`}>
              * 2. rekatta oturulduğunda Et-Tahiyyatü, Salli-Barik okunur. 3. rekat için kalkıldığında Subhaneke okunarak başlanır. 4. rekat sonunda selam verilir.
            </div>
          </div>
        </div>

        {/* Namaz Sonrası Özel Zikir ve Tesbihatlar */}
        <div className="space-y-4">
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold border-b pb-1.5 ${isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-200'}`}>
            ✨ Namaz Bittiğinde Yapılacak Özel Zikir ve Sûreler
          </h4>

          {/* Tekbir ve Hamd */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
            <span className="font-bold text-xs text-amber-500 uppercase tracking-wide block mb-1">Adım 1: 1 Defa Tekbir ve Hamd Okunur</span>
            <div className={`p-3 rounded-lg border font-mono text-center text-sm md:text-base mb-1.5 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              اللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ، لَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ وَلِلّٰهِ الْحَمْدُ
            </div>
            <p className={`text-xs font-semibold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              "Allâhü ekber, Allâhü ekber, lâ ilâhe illallâhü vallâhü ekber, Allâhü ekber ve lillâhi'l-hamd."
            </p>
          </div>

          {/* 100 Elem Nesrah Leke */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
            <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-1">Adım 2: 100 Defa İnşirâh Sûresi ("Elem Neşrah Leke")</span>
            <div className={`p-3 rounded-lg border font-mono text-center text-sm md:text-base mb-2 leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ. أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ. وَوَضَعْنَا عَنْكَ وِزْرَكَ. الَّذِي أَنْقَضَ ظَهْرَكَ. وَرَفَعْنَا لَكَ ذِكْرَكَ. فَإِنَّ مَعَ الْعُسْرِ يُسْرًا. إِنَّ مَعَ الْعُسْرِ يُسْرًا. فَإِذَا فَرَغْتَ فَانْصَبْ. وَإِلَىٰ رَبِّكَ فَارْغَبْ
            </div>
            <p className={`text-xs font-semibold mb-1 leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "Bismillâhirrahmânirrahîm. Elem neşrah leke sadrek. Ve vada'nâ anke vizrek. Ellezî enkada zahrek. Ve refa'nâ leke zikrek. Fe inne me'al-usri yusrâ. İnne me'al-usri yusrâ. Fe izâ ferağte fensab. Ve ilâ rabbike ferğab."
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e] leading-relaxed">
              <strong>Anlamı:</strong> "Senin göğsünü açıp genişletmedik mi? Belini büken yükünü senden kaldırmadık mı? Senin şanını ve şerefini yüceltmedik mi? Şüphesiz güçlükle beraber bir kolaylık vardır. Gerçekten güçlükle beraber bir kolaylık vardır. Öyleyse bir işi bitirdiğinde diğerine koyul ve yalnız Rabbine yönel."
            </p>
          </div>

          {/* 100 Inna Enzelnahu */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
            <span className="font-bold text-xs text-amber-500 uppercase tracking-wide block mb-1">Adım 3: 100 Defa Kadir Sûresi ("İnnâ Enzelnâhü")</span>
            <div className={`p-3 rounded-lg border font-mono text-center text-sm md:text-base mb-2 leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ. إِنَّا أَنْزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ. وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ. لَيْلَةُ الْقَدْرِ خَيْرٌ مِنْ أَلْفِ شَهْرٍ. تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِمْ مِنْ كُلِّ أَمْرٍ. سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ
            </div>
            <p className={`text-xs font-semibold mb-1 leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "Bismillâhirrahmânirrahîm. İnnâ enzelnâhü fî leyletil-kadr. Ve mâ edrâke mâ leyletül-kadr. Leyletül-kadri hayrün min elfi şehr. Tenezzelül-melâiketü verrûhu fîhâ bi-izni rabbihim min külli emr. Selâmün hiye hattâ matla'il-fecr."
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e] leading-relaxed">
              <strong>Anlamı:</strong> "Şüphesiz biz Kur'an'ı Kadir Gecesi'nde indirdik. Kadir Gecesi'nin ne olduğunu sen ne bileceksin? Kadir Gecesi bin aydan daha hayırlıdır. Melekler ve Ruh (Cebrail), Rablerinin izniyle her türlü iş için o gece inerler. O gece, tan yerinin ağarmasına kadar esenliktir."
            </p>
          </div>

          {/* 100 Hz. Aise Validemizin Af Duasi */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
            <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-1">Adım 4: 100 Defa Peygamber Efendimiz'in (s.a.v.) Öğrettiği Af Duası</span>
            <div className={`p-3 rounded-lg border font-mono text-center text-sm md:text-base mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              اَللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي
            </div>
            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "Allâhümme inneke afüvvün kerîmün, tuhibbü'l-afve fa'fü 'annî."
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e]">
              <strong>Anlamı:</strong> "Allah'ım! Şüphesiz Sen çok affedicisin, kerîmsin. Affetmeyi seversin; beni de affet."
            </p>
          </div>

          {/* Tamamlama & Tesbih Namazı Tavsiyesi */}
          <div className={`p-4 rounded-xl border text-xs leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
            <strong className="block mb-1 text-sm">🤲 Tamamlama ve Mübarek Gece Niyazı:</strong>
            Tesbihat tamamlandıktan sonra eller açılıp ümmet-i Muhammed'in birliği, dirlik ve beraberliği için dua edilir. Mümkünse bu gecede bir de <strong>Tesbih Namazı</strong> kılınarak gece ihya edilir.
          </div>
        </div>
      </div>
    );
  };

  const renderZilhicce10GunIbadetleri = () => {
    return (
      <div className="space-y-6 text-left">
        {/* Giriş & Genel Bilgi Kutusu */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1c3630]/40 border-[#3fb996]/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} />
            <h4 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
              Zilhicce Ayı (Leyâlî-i Aşere) İbadetleri ve Sabah Tesbihatı
            </h4>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Hicrî-Kamerî yılın 12. ayı olan Zilhicce, İslâm'ın beş esasından biri olan Hac farizasının ifa edildiği, Arafat vakfesinin yapıldığı ve amel defterlerinin kapandığı umûmî af ayıdır. İlk 10 gecesi <strong>"Leyâlî-i Aşere" (10 Mübarek Gece)</strong> olarak anılır.
          </p>
        </div>

        {/* Faziletler, Oruç ve Teşrik Tekbiri Paneli */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Oruç Fazileti */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-amber-500 mb-1">🌙 Oruç ve Mendûb Ameller:</span>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              • Hacca gidemeyen müminlerin ilk 9 gün oruç tutması çok büyük fazilettir. Hiç olmazsa <strong>8. gün (Terviye)</strong> ile <strong>9. gün (Arefe günü)</strong> oruçlu olunmalıdır.<br/>
              • Kurban günü (10. gün) kurban kesilinceye kadar bir şey yemeyip ilk olarak kurban etinden yemek mendûbdur.
            </p>
          </div>

          {/* Teşrik Tekbirleri */}
          <div className={`p-4 rounded-xl border-l-4 ${isDark ? 'bg-[#181510] border-[#3fb996] text-[#b9b09a]' : 'bg-slate-50 border-emerald-600 text-slate-700'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-emerald-500 mb-1">📢 Vâcip Olan Teşrîk Tekbirleri:</span>
            <p className="text-xs sm:text-sm leading-relaxed">
              Arefe günü sabah namazından başlayıp Bayramın 4. günü ikindi namazı dâhil, her farz namazın ardından kadın-erkek her mükellef Müslümana vâciptir:<br/>
              <strong className="text-emerald-600 dark:text-[#3fb996]">"Allâhü ekber, Allâhü ekber, Lâ ilâhe illallâhü vallâhü ekber, Allâhü ekber ve lillâhi'l-hamd"</strong>
            </p>
          </div>
        </div>

        {/* Her Gün Sabah Namazı Sonrası 10'arlı Zikirler */}
        <div className="space-y-4">
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold border-b pb-1.5 ${isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-200'}`}>
            ✨ Zilhicce'nin 1'inden 10'una Kadar Her Gün Sabah Namazından Sonra Yapılacak Zikirler
          </h4>

          {/* 1. Salavat */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
            <span className="font-bold text-xs text-amber-500 uppercase tracking-wide block mb-1">1. 10 Defa Salevât-ı Şerîfe</span>
            <div className={`p-3 rounded-lg border font-mono text-center text-sm md:text-base mb-2 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ
            </div>
            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "Allâhümme salli ve sellim ve bârik alâ seyyidinâ Muhammedin ve alâ âli seyyidinâ Muhammed."
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e]">
              <strong>Anlamı:</strong> "Allah'ım! Efendimiz Muhammed'e ve Efendimiz Muhammed'in âline salât, selâm ve bereket eyle."
            </p>
          </div>

          {/* 2. Istigfar */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
            <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block mb-1">2. 10 Defa İstiğfâr-ı Şerîf</span>
            <div className={`p-3 rounded-lg border font-mono text-center text-sm md:text-base mb-2 leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الْكَرِيمَ الَّذِي لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ وَنَسْأَلُهُ التَّوْبَةَ وَالْمَغْفِرَةَ وَالْهِدَايَةَ لَنَا إِنَّهُ هُوَ التَّوَّابُ الرَّحِيمُ
            </div>
            <p className={`text-xs font-semibold mb-1 leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "Estağfirullâhe'l-Azîme'l-Kerîme ellezî lâ ilâhe illâ Hüve'l-Hayyü'l-Kayyûmü ve etûbü ileyk ve nes'elühü't-tevbete ve'l-mağfirate ve'l-hidâyete lenâ innehû hüve't-Tevvâbü'r-Rahîm."
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e] leading-relaxed">
              <strong>Anlamı:</strong> "Kerîm ve Azîm olan Allah'tan bağışlanma dilerim. O'ndan başka ilâh yoktur. O Hayy'dır, Kayyûm'dur. O'na tövbe ederim. O'ndan bizim için tövbe, mağfiret ve hidayet dileriz. Şüphesiz O, tövbeleri çokça kabul eden ve çok merhamet edendir."
            </p>
          </div>

          {/* 3. Tevhid */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-100'}`}>
            <span className="font-bold text-xs text-amber-500 uppercase tracking-wide block mb-1">3. 10 Defa Kelime-i Tevhid</span>
            <div className={`p-3 rounded-lg border font-mono text-center text-sm md:text-base mb-2 leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ حَيٌّ لَا يَمُوتُ، بِيَدِهِ الْخَيْرُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ
            </div>
            <p className={`text-xs font-semibold mb-1 leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "Lâ ilâhe illallâhü vahdehû lâ şerîke leh, lehü'l-mülkü ve lehü'l-hamdü, yuhyî ve yümît, ve hüve Hayyün lâ yemût, bi-yedihi'l-hayr ve hüve alâ külli şey'in Kadîr."
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e] leading-relaxed">
              <strong>Anlamı:</strong> "Allah'tan başka ilâh yoktur. O tektir, ortağı yoktur. Mülk O'nundur ve hamd O'na mahsustur. Diriltir ve öldürür. O, Hayy'dır; ölmez. Hayır O'nun elindedir. O'nun her şeye gücü yeter."
            </p>
          </div>

          {/* Tamamlama Notu */}
          <div className={`p-4 rounded-xl border text-xs leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
            <strong className="block mb-1 text-sm">🤲 Dua Bitişi:</strong>
            Zikirler tamamlandıktan sonra eller açılıp hacıların dualarına ortak olmak, senelik amellerin rıza-yı ilahiye uygun kapanması ve feyizlenmek niyetiyle samimiyetle dua edilir.
          </div>
        </div>
      </div>
    );
  };

  const renderMevlidGecesiNamazi = () => {
    return (
      <div className="space-y-6 text-left">
        {/* Giriş & Genel Bilgi Kutusu */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1c3630]/40 border-[#3fb996]/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} />
            <h4 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
              Mevlid Gecesi İbadeti (12 Rebîülevvel — Tesbih Namazı)
            </h4>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Rebîulevvel ayının 12'nci yani onbirini onikisine bağlayan gece Mevlid Gecesi; Peygamber Efendimiz'in (s.a.v.) dünyâyı şereflendirdikleri gecedir. Bu mübarek gecede bir <strong>tesbih namazı</strong> kılınır.
          </p>
        </div>

        {/* Vakit ve Niyet Paneli */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-amber-500 mb-1">⏰ Kılınma Vakti:</span>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Rebîulevvel ayının 11'ini 12'sine bağlayan Mevlid Gecesi'nde akşam veya yatsı namazından sonra (kerahat vakitleri dışında) kılınır.
            </p>
          </div>

          <div className={`p-4 rounded-xl border-l-4 ${isDark ? 'bg-[#181510] border-[#3fb996] text-[#b9b09a]' : 'bg-slate-50 border-emerald-600 text-slate-700'}`}>
            <span className="font-bold block text-xs uppercase tracking-wider text-emerald-500 mb-1">🤲 Mevlid Gecesi Özel Niyeti:</span>
            <p className="text-xs sm:text-sm leading-relaxed italic font-semibold">
              "Ya Rabbi! Bu gece teşrifleri ile dünyâyı nûra gark ettiğin Sevgili Habibin, başımızın tâcı Resûlü Zişân Efendimizin hürmetine, ben âciz kulunu da afv-ı ilâhîne, feyz-i ilâhîne mazhar eyle. Allâhü Ekber."
            </p>
          </div>
        </div>

        {/* Tesbih Namazı Özeti */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
          <h5 className={`text-sm sm:text-base font-bold mb-2 ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
            📖 4 Rekat Tesbih Namazı Usûlü (Toplam 300 Tesbih)
          </h5>
          <div className={`p-3 rounded-lg border font-mono text-center text-sm md:text-base mb-3 ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
            سُبْحَانَ اللهِ وَالْحَمْدُ للهِ وَلَا إِلَهَ إِلَّا اللهُ وَاللهُ أَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيمِ
          </div>
          <p className={`text-xs sm:text-sm mb-3 ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            <strong>Okunuşu:</strong> "Sübhânallâhi ve’l-hamdülillâhi ve lâ ilâhe illallâhu vallâhu ekber ve lâ havle ve lâ kuvvete illâ billâhi’l-aliyyi’l-azîm"
          </p>
          <ul className={`list-disc list-inside space-y-1 text-xs sm:text-sm ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
            <li><strong>Sübhaneke'den sonra (Fâtiha'dan önce):</strong> 15 defa</li>
            <li><strong>Fâtiha ve Zamm-ı Sûre'den sonra:</strong> 10 defa</li>
            <li><strong>Rükûda, Kavmede (doğrulunca), 1. Secdede, Celsede (oturuşta) ve 2. Secdede:</strong> 10'ar defa (Her rekatta 75, 4 rekatta 300 tesbih).</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderCumaNamaziKilinisi = () => {
    return (
      <div className="space-y-6 text-left">
        {/* Giriş & Genel Bilgi Kutusu */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1c3630]/40 border-[#3fb996]/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} />
            <h4 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
              Cuma Namazı Kılınışı, Hutbe Adabı, Müezzinlik Geçişleri ve Tesbihatı
            </h4>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Cuma namazının ilk sünnetinden başlayarak; müezzinin okuduğu salavat ayeti ve iç ezan, hutbe adabı, kamet, cemaatle farzın kılınışı, son sünnet, Zuhr-i Âhir, vaktin son sünneti ve namaz sonrası tesbihatın baştan sona detaylı rehberi:
          </p>
        </div>

        {/* 1. BÖLÜM: CUMA NAMAZININ İLK SÜNNETİ (4 REKAT) */}
        <div className={`p-5 rounded-2xl border space-y-3 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between gap-2 border-b pb-2 border-slate-200 dark:border-[#3a3226]">
            <h5 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              1. Cuma Namazının İlk Sünneti (4 Rekat)
            </h5>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${isDark ? 'bg-[#1c3630] text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>
              Bireysel Kılınır
            </span>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Bu namaz cemaat tarafından kendi başına (bireysel olarak) kılınır. Cuma farzından önce kılındığı için ilk sünnet olarak adlandırılır.
          </p>
          <div className={`p-3 rounded-xl border-l-4 text-xs sm:text-sm ${isDark ? 'bg-[#211d16] border-[#3fb996] text-[#f1ecdd]' : 'bg-emerald-50/70 border-emerald-600 text-slate-800'}`}>
            <strong>Niyet:</strong> Besmele çekilir ve <em>"Niyet ettim Allah rızası için cuma namazının ilk sünnetini kılmaya"</em> denilir.
          </div>
          <ul className={`space-y-1.5 text-xs sm:text-sm ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
            <li>• <strong>1. Rekat:</strong> Sübhaneke, Fatiha, Zamm-ı Sure.</li>
            <li>• <strong>2. Rekat:</strong> Fatiha, Zamm-ı Sure.</li>
            <li>• <strong>1. Oturuş:</strong> Sadece Ettehiyyatü.</li>
            <li>• <strong>3. Rekat:</strong> Fatiha, Zamm-ı Sure.</li>
            <li>• <strong>4. Rekat:</strong> Fatiha, Zamm-ı Sure.</li>
            <li>• <strong>Son Oturuş:</strong> Ettehiyyatü, Salli, Barik, Rabbena duaları okunur ve selam verilir.</li>
          </ul>

          {/* Müezzinin Okuduğu Salavat Ayeti (Ahzab 56) ve İç Ezan */}
          <div className={`mt-3 p-4 rounded-xl border space-y-2 ${isDark ? 'bg-[#211d16] border-amber-800/40' : 'bg-amber-50/60 border-amber-200'}`}>
            <span className="font-bold text-xs text-amber-500 uppercase tracking-wide block">
              📢 İlk Sünnet Sonrası Müezzinlik (Ahzab Suresi 56. Ayet & İç Ezan)
            </span>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-[#b9b09a]' : 'text-slate-700'}`}>
              İmam (ve cemaat) tarafından 4 rekatlık ilk sünnet bitirildiğinde müezzin şu ayeti okur:
            </p>
            <div className={`p-3.5 rounded-lg border font-amiri text-center text-lg sm:text-xl leading-loose dir-rtl ${isDark ? 'bg-[#181510] border-[#3a3226] text-[#3fb996]' : 'bg-white border-amber-200 text-emerald-900'}`}>
              اِنَّ اللهَ وَمَلٰئِكَتَهُ يُصَلُّونَ عَلَى النَّبِىِّ يَا اَيُّهَا الَّذٖينَ اٰمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلٖيمًا
            </div>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "İnnallahe ve melaiketehû yusallûne alennebiyy. Ya eyyühellezîne amenû, sallû aleyhi vesellimu teslima." <em>(Ahzab Suresi 56. Ayet)</em>
            </p>
            <p className={`text-xs ${isDark ? 'text-[#8c826e]' : 'text-slate-600'}`}>
              <strong>Anlamı:</strong> "Şüphesiz Allah ve melekleri Peygamber'e salât ediyorlar. Ey iman edenler! Siz de ona salât edin ve tam bir teslimiyetle selam verin."
            </p>
            <p className={`text-xs sm:text-sm pt-1 border-t ${isDark ? 'border-[#3a3226] text-[#b9b09a]' : 'border-amber-200/70 text-slate-700'}`}>
              Salavat ayeti okunduğunda cemaat içinden sessizce Peygamber Efendimiz'e (s.a.v) salavat getirir (<em>"Allahümme salli alâ seyyidinâ Muhammedin ve alâ âli seyyidinâ Muhammed"</em>). Salavat ayetinin ardından imam minberdeki yerini alıp oturunca, müezzin cami içinde <strong>iç ezanı</strong> okur. Ardından imam hutbe okumak üzere ayağa kalkar.
            </p>
          </div>
        </div>

        {/* 2. BÖLÜM: HUTBE ADABI VE CEMAATİN DURUMU */}
        <div className={`p-5 rounded-2xl border space-y-3 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between gap-2 border-b pb-2 border-slate-200 dark:border-[#3a3226]">
            <h5 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              2. Hutbe Adabı ve Cemaatin Durumu
            </h5>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500">
              Tam Sükûnet ve Dinleme
            </span>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
            Kıbleye dönük bir şekilde, namazda tahiyyatta oturuyormuş gibi veya bağdaş kurarak saygılı ve edepli bir duruşla oturulur.
          </p>
          <div className={`p-3.5 rounded-xl border-l-4 text-xs sm:text-sm leading-relaxed ${isDark ? 'bg-[#2a241b] border-amber-500 text-amber-100' : 'bg-amber-50 border-amber-500 text-amber-950'}`}>
            <strong>Hadis-i Şerif Kuralı:</strong> Peygamber Efendimiz (s.a.v) şöyle buyurmuştur: <em>"Cuma günü imam hutbe okurken arkadaşına 'Sus!' bile desen, boş konuşmuş (ve cumanın sevabını iptal etmiş) olursun."</em> (Buhârî, Cuma 36; Müslim, Cuma 11). Bu nedenle hutbe sırasında kesinlikle konuşulmaz, telefonla veya başka bir şeyle uğraşılmaz, tesbih çekilmez, namaz kılınmaz. Sadece imam dinlenir.
          </div>
          <div className={`p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#b9b09a]' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            <strong>📢 Hutbe Sonrası Kamet Getirilmesi:</strong> İmamın hutbesi bitip minberden inmesinin ardından, müezzin kalkıp <strong>Kamet</strong> getirir. Bu, imam ile birlikte cemaat halinde kılınacak olan 2 rekatlık Cuma farzına başlanacağının işaretidir.
          </div>
        </div>

        {/* 3. BÖLÜM: CUMA NAMAZININ FARZI (2 REKAT) */}
        <div className={`p-5 rounded-2xl border space-y-3 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between gap-2 border-b pb-2 border-slate-200 dark:border-[#3a3226]">
            <h5 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              3. Cuma Namazının Farzı (Cemaatin Kılınış Şekli — 2 Rekat)
            </h5>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${isDark ? 'bg-[#1c3630] text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>
              İmama Uyularak Cemaatle
            </span>
          </div>
          <ul className={`space-y-2 text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
            <li>
              • <strong>Niyet:</strong> <em>"Niyet ettim cuma namazının farzına, uydum hazır olan imama"</em> denilir. (Vaktin farzı denmez, direkt Cuma namazı diye belirtilir).
            </li>
            <li>
              • <strong>Kılınış:</strong> İmam Fatiha ve Zamm-ı sureyi sesli (açıktan) okur. Cemaat ayaktayken içinden hiçbir şey okumaz, sadece imamı dinler.
            </li>
            <li>
              • <strong>Rüku ve Secde:</strong> Cemaat yalnızca rüku ve secdedeki tesbihleri okur. Bu tesbihler 3 kere okumakla bırakılmaz, imam <em>"Allahu Ekber"</em> diyip tekbir getirene kadar okunmaya devam edilir.
            </li>
            <li>
              • <strong>Oturuş:</strong> Dualar (Ettehiyyatü, Salli, Barik, Rabbena) içinden okunarak imamla birlikte selam verilir.
            </li>
          </ul>

          {/* Farz Sonrası Müezzin Duası */}
          <div className={`mt-3 p-4 rounded-xl border space-y-2 ${isDark ? 'bg-[#211d16] border-[#3fb996]/40' : 'bg-emerald-50/60 border-emerald-200'}`}>
            <span className={`font-bold text-xs uppercase tracking-wide block ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
              📢 Farz Namaz Sonrası Müezzin Duası ("Allahümme entes selâm...")
            </span>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-[#b9b09a]' : 'text-slate-700'}`}>
              Farz namazı kılındıktan hemen sonra müezzin sesli bir şekilde şu duayı okur ve bu duanın ardından cemaat, kendi başına kılacağı son sünnet namazı için ayağa kalkar:
            </p>
            <div className={`p-3.5 rounded-lg border font-amiri text-center text-lg sm:text-xl leading-loose dir-rtl ${isDark ? 'bg-[#181510] border-[#3a3226] text-[#3fb996]' : 'bg-white border-emerald-200 text-emerald-900'}`}>
              اَللّٰهُمَّ اَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْاِكْرَامِ
            </div>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "Allahümme entes selâmü ve minkes selâm, tebarekte ya zel celâli vel ikram."
            </p>
            <p className={`text-xs ${isDark ? 'text-[#8c826e]' : 'text-slate-600'}`}>
              <strong>Anlamı:</strong> "Allah'ım! Sen selâmsın (her türlü kusur ve afetten uzaksın), selâmet ve esenlik de Sendendir. Ey celâl ve ikram sahibi Rabbimiz, Sen ne yücesin!"
            </p>
          </div>
        </div>

        {/* 4. BÖLÜM: CUMA NAMAZININ SON SÜNNETİ (4 REKAT) */}
        <div className={`p-5 rounded-2xl border space-y-3 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between gap-2 border-b pb-2 border-slate-200 dark:border-[#3a3226]">
            <h5 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              4. Cuma Namazının Son Sünneti (4 Rekat)
            </h5>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${isDark ? 'bg-[#1c3630] text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>
              Bireysel Kılınır
            </span>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
            Farz kılındıktan sonra cemaat kendi başına kılar.
          </p>
          <div className={`p-3 rounded-xl border-l-4 text-xs sm:text-sm ${isDark ? 'bg-[#211d16] border-[#3fb996] text-[#f1ecdd]' : 'bg-emerald-50/70 border-emerald-600 text-slate-800'}`}>
            <strong>Niyet:</strong> <em>"Niyet ettim Allah rızası için cuma namazının son sünnetini kılmaya"</em> denilir.
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
            <strong>Kılınış:</strong> Tıpkı ilk 4 rekatlık sünnette olduğu gibi kılınır (1. oturuşta sadece Ettehiyyatü okunur, 3. rekata kalkıldığında Sübhaneke okunmaz direkt Fatiha ile başlanır).
          </p>
        </div>

        {/* 5. BÖLÜM: ZUHR-I ÂHİR NAMAZI (4 REKAT) */}
        <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between gap-2 border-b pb-2 border-slate-200 dark:border-[#3a3226]">
            <h5 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              5. Zuhr-i Âhir Namazı (4 Rekat) ve İki Farklı Kılınış Usûlü
            </h5>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${isDark ? 'bg-[#1c3630] text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>
              Bireysel Kılınır
            </span>
          </div>
          <div className={`p-3 rounded-xl border-l-4 text-xs sm:text-sm ${isDark ? 'bg-[#211d16] border-[#3fb996] text-[#f1ecdd]' : 'bg-emerald-50/70 border-emerald-600 text-slate-800'}`}>
            <strong>Niyet:</strong> <em>"Niyet ettim vaktine yetişip de henüz kılamadığım son öğle namazının vaktine (zuhr-i ahir namazına)"</em> denilir.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Yöntem (Nafile Yerine) */}
            <div className={`p-4 rounded-xl border space-y-2.5 ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wide ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
                  1. Yöntem (Nafile Niyetiyle)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500">
                  Nafile Yerine Geçer
                </span>
              </div>
              <ul className={`space-y-1.5 text-xs sm:text-sm ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                <li>• <strong>1. Rekat:</strong> Sübhaneke, Fatiha, Zamm-ı Sure.</li>
                <li>• <strong>2. Rekat:</strong> Fatiha, Zamm-ı Sure.</li>
                <li>• <strong>1. Oturuş:</strong> Ettehiyyatü, Salli, Barik duaları okunur ve ayağa kalkılır.</li>
                <li>• <strong>3. Rekat:</strong> Sübhaneke, Fatiha, Zamm-ı Sure.</li>
                <li>• <strong>4. Rekat:</strong> Fatiha, Zamm-ı Sure.</li>
                <li>• <strong>Son Oturuş:</strong> Ettehiyyatü, Salli, Barik, Rabbena duaları okunur ve selam ile bitirilir.</li>
              </ul>
            </div>

            {/* 2. Yöntem (Kaza Yerine) */}
            <div className={`p-4 rounded-xl border space-y-2.5 ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wide ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
                  2. Yöntem (Öğle Kazası Niyetiyle)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-500">
                  Öğle Kazası Yerine Geçer
                </span>
              </div>
              <ul className={`space-y-1.5 text-xs sm:text-sm ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}>
                <li>• <strong>1. Rekat:</strong> Sübhaneke, Fatiha, Zamm-ı Sure.</li>
                <li>• <strong>2. Rekat:</strong> Fatiha, Zamm-ı Sure.</li>
                <li>• <strong>1. Oturuş:</strong> Ettehiyyatü duası okunur ve ayağa kalkılır.</li>
                <li>• <strong>3. Rekat:</strong> Fatiha (Zamm-ı sure yok).</li>
                <li>• <strong>4. Rekat:</strong> Fatiha.</li>
                <li>• <strong>Son Oturuş:</strong> Ettehiyyatü, Salli, Barik, Rabbena duaları okunur ve selam ile bitirilir.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 6. BÖLÜM: VAKTİN SON SÜNNETİ (2 VEYA 4 REKAT) */}
        <div className={`p-5 rounded-2xl border space-y-3 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between gap-2 border-b pb-2 border-slate-200 dark:border-[#3a3226]">
            <h5 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              6. Vaktin Son Sünneti (2 veya 4 Rekat)
            </h5>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${isDark ? 'bg-[#1c3630] text-[#3fb996]' : 'bg-emerald-100 text-emerald-800'}`}>
              Bireysel Kılınır
            </span>
          </div>
          <div className={`p-3 rounded-xl border-l-4 text-xs sm:text-sm ${isDark ? 'bg-[#211d16] border-[#3fb996] text-[#f1ecdd]' : 'bg-emerald-50/70 border-emerald-600 text-slate-800'}`}>
            <strong>Niyet:</strong> <em>"Niyet ettim Allah rızası için vaktin son sünnetini kılmaya"</em> denilir.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={`p-3.5 rounded-xl border text-xs sm:text-sm ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#f1ecdd]' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
              <strong className="block mb-1 text-emerald-500">2 Rekat Kılanlar İçin:</strong>
              1. ve 2. rekatta Fatiha ve Zamm-ı sure okunur. Son oturuşta Ettehiyyatü, Salli, Barik, Rabbena duaları okunup namaz sonlandırılır.
            </div>
            <div className={`p-3.5 rounded-xl border text-xs sm:text-sm ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#f1ecdd]' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
              <strong className="block mb-1 text-amber-500">4 Rekat Kılanlar İçin:</strong>
              1. ve 2. rekatlar kılınır. 1. oturuşta Ettehiyyatü, Salli, Barik duaları okunur. 3. rekata kalkıldığında Sübhaneke okunması şartıyla Fatiha ve Zamm-ı sure ile devam edilir. 4. rekat tamamlanıp son oturuşa geçildiğinde Ettehiyyatü, Salli, Barik, Rabbena duaları okunarak selam verilir.
            </div>
          </div>
        </div>

        {/* 7. BÖLÜM: NAMAZ SONRASI TESBİHAT VE MÜEZZİNLİK DUALARI */}
        <div className="space-y-4">
          <h4 className={`text-xs sm:text-sm md:text-base font-extrabold border-b pb-1.5 ${isDark ? 'text-[#f1ecdd] border-[#3a3226]' : 'text-slate-800 border-slate-200'}`}>
            ✨ 7. Namazların Bitiminde Yapılan Tesbihat (Müezzin ve Cemaatin Okudukları)
          </h4>

          {/* Adım 1: Ala Rasulina Salavat */}
          <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
            <span className="font-bold text-xs text-amber-500 uppercase tracking-wide block">
              1. Salavat-ı Şerîfe ("Alâ Rasûlinâ Salavât")
            </span>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
              Son sünnetler tamamlandığında müezzin <strong>"Alâ Rasûlinâ salavât"</strong> der ve cemaat içinden salavat getirir:
            </p>
            <div className={`p-3 rounded-lg border font-amiri text-center text-lg sm:text-xl leading-loose dir-rtl ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              اَللّٰهُمَّ صَلِّ عَلٰى سَيِّدِنَا مُحَمَّدٍ وَعَلٰى اٰلِ سَيِّدِنَا مُحَمَّدٍ
            </div>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "Allâhümme salli alâ seyyidinâ Muhammedin ve alâ âli seyyidinâ Muhammed."
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e]">
              <strong>Anlamı:</strong> "Allah'ım! Efendimiz Muhammed'e ve Efendimiz Muhammed'in âline salât (rahmet) eyle."
            </p>
          </div>

          {/* Adım 2: Sübhanallahi velhamdülillahi */}
          <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
            <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block">
              2. Tesbih Duası ("Sübhânallâhi ve'l-hamdü lillâhi...")
            </span>
            <div className={`p-3 rounded-lg border font-amiri text-center text-lg sm:text-xl leading-loose dir-rtl ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              سُبْحَانَ اللّٰهِ وَالْحَمْدُ لِلّٰهِ وَلَا اِلٰهَ اِلَّا اللّٰهُ وَاللّٰهُ اَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ اِلَّا بِاللّٰهِ الْعَلِىِّ الْعَظٖيمِ
            </div>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "Sübhânallâhi ve'l-hamdü lillâhi velâ ilâhe illallâhü vallâhü ekber. Velâ havle velâ kuvvete illâ billâhil-aliyyil-azîm."
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e]">
              <strong>Anlamı:</strong> "Allah'ı tüm noksan sıfatlardan tenzih ederim. Hamd Allah'a mahsustur. Allah'tan başka ilâh yoktur ve Allah en büyüktür. Yüce ve büyük olan Allah'ın yardımı olmadan hiçbir güç ve kuvvet yoktur."
            </p>
          </div>

          {/* Adım 3: Ayetel Kürsi */}
          <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
            <span className="font-bold text-xs text-amber-500 uppercase tracking-wide block">
              3. Âyetü'l-Kürsî (Eûzü-Besmele Çekilerek Sessizce Okunur)
            </span>
            <div className={`p-3.5 rounded-lg border font-amiri text-center text-lg sm:text-xl leading-loose dir-rtl ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              اللّٰهُ لَا اِلٰهَ اِلَّا هُوَ الْحَىُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِى السَّمٰوَاتِ وَمَا فِى الْاَرْضِ مَنْ ذَا الَّذٖى يَشْفَعُ عِنْدَهُ اِلَّا بِاِذْنِهٖ يَعْلَمُ مَا بَيْنَ اَيْدٖيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحٖيطُونَ بِشَىْءٍ مِنْ عِلْمِهٖ اِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمٰوَاتِ وَالْاَرْضَ وَلَا يَؤُدُهُ حِفْظُهُمَا وَهُوَ الْعَلِىُّ الْعَظٖيمُ
            </div>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "Allâhü lâ ilâhe illâ hüve'l-hayyü'l-kayyûm. Lâ te'huzühû sinetün velâ nevm. Lehû mâ fi's-semâvâti vemâ fi'l-ard. Men ze'l-lezî yeşfeu indehû illâ bi-iznih. Ya'lemü mâ beyne eydîhim vemâ halfehüm. Velâ yühîtûne bi-şey'in min ilmihî illâ bimâ şâe. Vesia kürsiyyühü's-semâvâti ve'l-ard. Velâ yeûdühû hıfzuhümâ ve hüve'l-aliyyü'l-azîm."
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e] leading-relaxed">
              <strong>Anlamı:</strong> "Allah'tan başka hiçbir ilâh yoktur. O, daima yaşayan (Hayy) ve bütün varlıkları ayakta tutandır (Kayyûm). O'nu ne gaflet basar, ne de uyku. Göklerdeki ve yerdeki her şey O'nundur. O'nun izni olmadan huzurunda şefaat etmek kimin haddine! Onların önlerinde ve arkalarında ne varsa hepsini bilir. Onlar ise, O'nun dilediği kadarından başka ilminden hiçbir şey kavrayamazlar. O'nun kürsüsü bütün gökleri ve yeri kaplayıp kuşatmıştır. Gökleri ve yeri koruyup gözetmek O'na güç gelmez. O, çok yücedir, çok büyüktür."
            </p>
          </div>

          {/* Adım 4: 33'er Tesbihat */}
          <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
            <span className="font-bold text-xs text-emerald-500 uppercase tracking-wide block">
              4. 33'er Defa Tesbih, Tahmid ve Tekbir (Toplam 99)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={`p-3 rounded-lg border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
                <div className="font-bold text-xs text-emerald-500 mb-1">33 Defa Sübhânallah</div>
                <div className={`font-amiri text-xl text-center py-1 ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>سُبْحَانَ اللّٰهِ</div>
                <p className={`text-xs ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}><strong>Okunuşu:</strong> Sübhânallah</p>
                <p className="text-[11px] text-slate-500 dark:text-[#8c826e]"><strong>Anlamı:</strong> Allah'ı bütün noksan sıfatlardan tenzih ederim.</p>
              </div>
              <div className={`p-3 rounded-lg border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
                <div className="font-bold text-xs text-amber-500 mb-1">33 Defa Elhamdülillah</div>
                <div className={`font-amiri text-xl text-center py-1 ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>اَلْحَمْدُ لِلّٰهِ</div>
                <p className={`text-xs ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}><strong>Okunuşu:</strong> Elhamdülillah</p>
                <p className="text-[11px] text-slate-500 dark:text-[#8c826e]"><strong>Anlamı:</strong> Hamd (her türlü övgü ve şükür) Allah'a mahsustur.</p>
              </div>
              <div className={`p-3 rounded-lg border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
                <div className="font-bold text-xs text-emerald-500 mb-1">33 Defa Allâhü Ekber</div>
                <div className={`font-amiri text-xl text-center py-1 ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>اَللّٰهُ اَكْبَرُ</div>
                <p className={`text-xs ${isDark ? 'text-[#f1ecdd]' : 'text-slate-700'}`}><strong>Okunuşu:</strong> Allâhü Ekber</p>
                <p className="text-[11px] text-slate-500 dark:text-[#8c826e]"><strong>Anlamı:</strong> Allah en büyüktür.</p>
              </div>
            </div>
          </div>

          {/* Adım 5: La ilahe illallahu vahdehu & Subhane Rabbiyel aliyyil alel vehhab */}
          <div className={`p-4 rounded-xl border space-y-2.5 ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-200'}`}>
            <span className="font-bold text-xs text-amber-500 uppercase tracking-wide block">
              5. Tesbihatın Tamamlanması (Tehlîl) ve Dua Öncesi Tesbih
            </span>
            <div className={`p-3.5 rounded-lg border font-amiri text-center text-lg sm:text-xl leading-loose dir-rtl ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#3fb996]' : 'bg-white border-slate-200 text-emerald-800'}`}>
              لَا اِلٰهَ اِلَّا اللّٰهُ وَحْدَهُ لَا شَرٖيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلٰى كُلِّ شَىْءٍ قَدٖيرٌ. سُبْحَانَ رَبِّىَ الْعَلِىِّ الْاَعْلَى الْوَهَّابِ
            </div>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
              <strong>Okunuşu:</strong> "Lâ ilâhe illallâhü vahdehû lâ şerîke leh. Lehü'l-mülkü ve lehü'l-hamdü ve hüve alâ külli şey'in kadîr. Sübhâne Rabbiyel-aliyyil-a'lel-vehhâb."
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8c826e] leading-relaxed">
              <strong>Anlamı:</strong> "Allah'tan başka ilâh yoktur, O tektir, ortağı yoktur. Mülk O'nundur, hamd O'na mahsustur. O her şeye kadirdir. Yüce, en yüce ve çok bağışlayıcı olan Rabbimi (noksan sıfatlardan) tenzih ederim."
            </p>
          </div>
        </div>

        {/* Önemli Hatırlatma / Not */}
        <div className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${isDark ? 'bg-[#211d16] border-[#3a3226] text-[#b9b09a]' : 'bg-amber-50/70 border-amber-200 text-amber-950'}`}>
          <strong className="block mb-1 text-sm font-bold text-amber-600 dark:text-amber-400">⚠️ Çok Önemli Hatırlatma:</strong>
          <p>
            Cumanın farzından sonra bu on rek'at kılınmadığı takdirde, şartlarında bir noksanlıktan dolayı cuma namazı kabul olunmamışsa, öğle namazı, üzerine borç olarak kalır. Bu sebeple cumanın farzından sonra kılınacak bu on rek'ati kat'iyyen terk etmemelidir.
          </p>
        </div>
      </div>
    );
  };

  const renderMuslumanSualleri = () => {
    const copyToClipboard = (text: string, label: string) => {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(text);
        setSualCopyNotification(`${label} kopyalandı!`);
        setTimeout(() => setSualCopyNotification(null), 2500);
      }
    };

    const toggleLearned = (id: number) => {
      setSualLearned(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Benzersiz kategoriler
    const allCategories = ['all', ...Array.from(new Set(MUSLUMAN_SUALLERI_DATA.map(item => item.category)))];

    // Filtreleme
    const filteredItems = MUSLUMAN_SUALLERI_DATA.filter(item => {
      const matchCategory = sualSelectedCategory === 'all' || item.category === sualSelectedCategory;
      const matchSearch = sualSearchTerm.trim() === '' || 
        item.sual.toLowerCase().includes(sualSearchTerm.toLowerCase()) || 
        item.cevap.toLowerCase().includes(sualSearchTerm.toLowerCase()) ||
        String(item.id) === sualSearchTerm.trim();
      return matchCategory && matchSearch;
    });

    const displayedItems = sualChatDisplayMode === 'all' 
      ? filteredItems 
      : filteredItems.slice(0, sualChatStepCount);

    const learnedCount = Object.values(sualLearned).filter(Boolean).length;
    const learnedPercent = Math.round((learnedCount / MUSLUMAN_SUALLERI_DATA.length) * 100);

    return (
      <div className="space-y-6 text-left animate-in fade-in duration-200">
        {/* Üst Bilgi Kartı */}
        <div className={`p-4 sm:p-6 rounded-3xl border space-y-4 ${
          isDark ? 'bg-[#1c3630]/40 border-[#3fb996]/40' : 'bg-emerald-50/80 border-emerald-200 shadow-xs'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className={`w-5 h-5 ${isDark ? 'text-[#3f8996]' : 'text-emerald-700'}`} />
                <h4 className={`text-base sm:text-lg font-extrabold ${isDark ? 'text-[#3fb996]' : 'text-emerald-900'}`}>
                  Müslümanların Bilmesi Gereken Sualler ve Cevaplar
                </h4>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
                İman, ibadet, siyer ve temel ilmihal konularında her Müslümanın bilmesi lâzım gelen <strong>79 mühim sual ve cevap</strong> karşılıklı muhavere (öğrenci-öğretici diyalogu) şeklinde tertip edilmiştir.
              </p>
            </div>

            {/* İlerleme Rozeti */}
            <div className={`inline-flex items-center gap-2 self-start md:self-auto px-3.5 py-1.5 rounded-2xl border shrink-0 text-xs font-bold ${
              isDark ? 'bg-[#181510] border-[#3fb996]/40 text-[#3fb996]' : 'bg-white border-emerald-300 text-emerald-900 shadow-xs'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Öğrenilen: {learnedCount} / {MUSLUMAN_SUALLERI_DATA.length} (%{learnedPercent})</span>
            </div>
          </div>

          {/* Arama ve Filtreleme Araçları */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-slate-200/20">
            {/* Arama Kutusu */}
            <div className="sm:col-span-7 relative">
              <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#8c826e]' : 'text-slate-400'}`} />
              <input
                type="text"
                value={sualSearchTerm}
                onChange={(e) => setSualSearchTerm(e.target.value)}
                placeholder="Soru veya cevaplarda ara (Örn: 32 farz, Ezvâc, oruç, niyet...)"
                className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs font-medium border transition-colors outline-none ${
                  isDark 
                    ? 'bg-[#181510] border-[#3a3226] text-[#f1ecdd] placeholder-[#8c826e] focus:border-[#3fb996]' 
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-emerald-500'
                }`}
              />
              {sualSearchTerm && (
                <button
                  onClick={() => setSualSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-rose-500 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Kategori Seçici */}
            <div className="sm:col-span-5">
              <select
                value={sualSelectedCategory}
                onChange={(e) => setSualSelectedCategory(e.target.value)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold border transition-colors outline-none cursor-pointer ${
                  isDark 
                    ? 'bg-[#181510] border-[#3a3226] text-[#f1ecdd] focus:border-[#3fb996]' 
                    : 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500'
                }`}
              >
                <option value="all">Tüm Konular ({MUSLUMAN_SUALLERI_DATA.length} Sual)</option>
                {allCategories.filter(c => c !== 'all').map(cat => (
                  <option key={cat} value={cat}>
                    {cat} ({MUSLUMAN_SUALLERI_DATA.filter(i => i.category === cat).length})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Görünüm Modu ve Hızlı Butonlar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-bold ${isDark ? 'text-[#b9b09a]' : 'text-slate-500'}`}>
                Görünüm:
              </span>
              <button
                type="button"
                onClick={() => setSualChatDisplayMode('all')}
                className={`px-3 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                  sualChatDisplayMode === 'all'
                    ? isDark ? 'bg-[#1c3630] border-[#3fb996] text-[#3fb996]' : 'bg-emerald-700 border-emerald-700 text-white'
                    : isDark ? 'bg-[#181510] border-[#3a3226] text-[#b9b09a]' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                Tümünü Göster ({filteredItems.length})
              </button>
              <button
                type="button"
                onClick={() => setSualChatDisplayMode('step')}
                className={`px-3 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                  sualChatDisplayMode === 'step'
                    ? isDark ? 'bg-[#1c3630] border-[#3fb996] text-[#3fb996]' : 'bg-emerald-700 border-emerald-700 text-white'
                    : isDark ? 'bg-[#181510] border-[#3a3226] text-[#b9b09a]' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                Adım Adım Sohbet
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">
                {filteredItems.length} Sual Listeleniyor
              </span>
            </div>
          </div>
        </div>

        {/* Kopyalama Bildirimi Toast */}
        {sualCopyNotification && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in duration-200">
            <CheckCheck className="w-4 h-4" />
            <span>{sualCopyNotification}</span>
          </div>
        )}

        {/* 4. MODEL: Karşılıklı Sohbet / Diyalog Akışı */}
        <div className={`p-4 sm:p-6 rounded-3xl border space-y-6 ${
          isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-100/80 border-slate-200 shadow-inner'
        }`}>
          {displayedItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <HelpCircle className="w-8 h-8 mx-auto opacity-50" />
              <p className="text-sm font-semibold">Aradığınız kriterlere uygun sual bulunamadı.</p>
              <button
                onClick={() => { setSualSearchTerm(''); setSualSelectedCategory('all'); }}
                className="text-xs text-emerald-500 font-bold hover:underline cursor-pointer"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            displayedItems.map((item) => {
              const isLearned = !!sualLearned[item.id];
              return (
                <div 
                  key={`sual-dialogue-${item.id}`} 
                  id={`sual-item-${item.id}`}
                  className="space-y-3 pt-2 first:pt-0"
                >
                  {/* SOL BALONCUK: TALEBE / SUAL */}
                  <div className="flex items-start gap-2.5 sm:gap-3 max-w-[92%] sm:max-w-[85%]">
                    {/* Talebe Avatarı */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-md ring-2 ring-emerald-400/40">
                      S
                    </div>

                    <div className={`p-3.5 sm:p-4 rounded-2xl rounded-tl-xs shadow-xs text-xs sm:text-sm border transition-all ${
                      isDark 
                        ? 'bg-[#211d16] border-[#3a3226] text-[#f1ecdd] hover:border-[#3fb996]/40' 
                        : 'bg-white border-slate-200 text-slate-900 shadow-xs'
                    }`}>
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10.5px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-[#3fb996] uppercase tracking-wider">
                            SUAL {item.id}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                            • {item.category}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(`SUAL ${item.id}: ${item.sual}`, `Sual ${item.id}`)}
                          className="text-slate-400 hover:text-emerald-500 transition-colors p-0.5 cursor-pointer"
                          title="Suali Kopyala"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>

                      <h5 className="font-extrabold text-sm sm:text-base leading-snug">
                        {item.sual}
                      </h5>
                    </div>
                  </div>

                  {/* SAĞ BALONCUK: MUALLİM / CEVAP */}
                  <div className="flex items-start justify-end gap-2.5 sm:gap-3 max-w-[95%] sm:max-w-[88%] ml-auto">
                    <div className={`p-4 sm:p-5 rounded-2xl rounded-tr-xs shadow-md text-xs sm:text-sm border transition-all ${
                      isDark
                        ? 'bg-gradient-to-br from-[#1c3630] to-[#142823] border-[#3fb996]/50 text-[#f1ecdd] ring-1 ring-[#3fb996]/30'
                        : 'bg-gradient-to-br from-emerald-800 to-emerald-900 text-white border-emerald-700 shadow-md'
                    }`}>
                      <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-emerald-400/20">
                        <span className="text-[10.5px] font-extrabold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 uppercase tracking-wider">
                          CEVAP
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleLearned(item.id)}
                            className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              isLearned
                                ? 'bg-amber-400 text-emerald-950 shadow-xs'
                                : 'bg-black/20 hover:bg-black/30 text-emerald-200'
                            }`}
                            title={isLearned ? 'Ezberlendi olarak işaretlendi' : 'Ezberledim olarak işaretle'}
                          >
                            {isLearned ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                            <span>{isLearned ? 'Öğrenildi' : 'Öğrendim'}</span>
                          </button>

                          <button
                            onClick={() => copyToClipboard(`SUAL ${item.id}: ${item.sual}\nCEVAP: ${item.cevap}`, `Sual ve Cevap ${item.id}`)}
                            className="text-emerald-200 hover:text-white transition-colors p-0.5 cursor-pointer"
                            title="Soru ve Cevabı Kopyala"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Okunabilirliği Yüksek, Madde Madde Cevap Metni */}
                      <div className="leading-relaxed whitespace-pre-line text-xs sm:text-sm font-medium tracking-normal space-y-1">
                        {item.cevap}
                      </div>
                    </div>

                    {/* Muallim Avatarı */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-md ring-2 ring-amber-400/40">
                      C
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Adım Adım Modunda "Daha Fazla Göster" Butonu */}
          {sualChatDisplayMode === 'step' && displayedItems.length < filteredItems.length && (
            <div className="text-center pt-4 border-t border-slate-200/20">
              <button
                onClick={() => setSualChatStepCount(prev => Math.min(prev + 6, filteredItems.length))}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95"
              >
                <span>Sonraki Sualleri Göster (+6 Sual)</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-slate-400 mt-2">
                Toplam {filteredItems.length} sualden {displayedItems.length} tanesi gösteriliyor.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderVirtualItemContent = () => {
    switch (activeItem.id) {
      case 'musluman-sualleri':
        return renderMuslumanSualleri();
      case 'gunluk-dualar':
        return renderGunlukDualar();
      case 'evlilik-duasi':
        return renderEvlilikDuasi();
      case 'ibadetlerin-sihati-icin':
        return renderNamazinSihatiIcin();
      case 'pratik-namaz-rehberi':
        return renderPratikNamazRehberi();
      case 'namaz-durus-sekilleri':
        return renderNamazDurusSekilleri();
      case 'cemaatle-namaza-yetismek':
        return renderCemaatleNamazaYetismek();
      case 'bayram-namazi-kilinisi':
        return renderBayramNamaziKilinisi();
      case 'cuma-namazi-kilinisi':
        return renderCumaNamaziKilinisi();
      case 'tesbih-namazi-kilinisi':
        return renderTesbihNamaziKilinisi();
      case 'kusluk-namazi-kilinisi':
        return renderKuslukNamazi();
      case 'evvabin-namazi-kilinisi':
        return renderEvvabinNamazi();
      case 'teheccud-namazi-kilinisi':
        return renderTeheccudNamazi();
      case 'muharrem-ayi-namazi':
        return renderMuharremAyiNamazi();
      case 'mevlid-gecesi-namazi':
        return renderMevlidGecesiNamazi();
      case 'regaip-gecesi-namazi':
        return renderRegaipGecesiNamazi();
      case 'recep-1-10-namazi':
        return renderRecepHacetNamazi('1-10');
      case 'recep-11-20-namazi':
        return renderRecepHacetNamazi('11-20');
      case 'recep-21-30-namazi':
        return renderRecepHacetNamazi('21-30');
      case 'mirac-gecesi-namazi':
        return renderMiracGecesiNamazi();
      case 'saban-1-gecesi-namazi':
        return renderSaban1GecesiNamazi();
      case 'saban-27-gecesi-namazi':
        return renderSaban27GecesiNamazi();
      case 'berat-gecesi-namazi':
        return renderBeratGecesiNamazi();
      case 'kadir-gecesi-namazi':
        return renderKadirGecesiNamazi();
      case 'zilhicce-10-gun-ibadetleri':
        return renderZilhicce10GunIbadetleri();
      default:
        return null;
    }
  };

  const isVirtualItem = VIRTUAL_NEW_ITEMS.some(v => v.id === activeItem.id);

  const progressPercent = Math.min(100, Math.round((memorizedIds.filter(id => NAMAZ_ITEMS.some(item => item.id === id)).length / NAMAZ_ITEMS.length) * 100));

  return (
    <div
      className={`min-h-screen transition-colors duration-200 namaz-container relative ${
        isDark ? 'bg-[#181510] text-[#f1ecdd]' : 'bg-[#FBF9F5] text-slate-800'
      }`}
      style={{ '--namaz-scale': (arabicScalePercent / 100).toString() } as React.CSSProperties}
    >
      <style>{`
        .namaz-container .font-amiri,
        .namaz-container .font-quran {
          zoom: var(--namaz-scale, 1);
          max-width: 100%;
          overflow-wrap: anywhere;
        }
      `}</style>
      {/* 1. ÜST BİLGİ & TEMA SEÇİCİ KONTROL ÇUBUĞU (ElifBa ile Birebir Aynı) */}
      <div
        className={`border-b py-2.5 px-4 sm:px-6 sticky top-16 z-30 backdrop-blur-md ${
          isDark
            ? 'bg-[#211d16]/95 border-[#3a3226] text-[#f1ecdd]'
            : 'bg-white/95 border-emerald-900/10 text-slate-800'
        }`}
      >
        <div className={`${viewMode === 'desktop' ? 'max-w-[1440px] md:flex-row md:items-center' : 'max-w-[640px] flex-col'} mx-auto flex flex-col justify-between gap-3.5`}>
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <h1 className={`text-base sm:text-lg lg:text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              Namaz Sureleri, Duaları ve Özel Gece Namazları
            </h1>
            <button type="button" onClick={() => copyNamazLink(makeNamazItemHash(activeItem.id), activeItem.title)}
              title="Açık içeriğin paylaşılabilir bağlantısını kopyala"
              aria-label="Açık içeriğin bağlantısını kopyala"
              className="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer">
              <Copy className="w-3.5 h-3.5" /> Bağlantıyı kopyala
            </button>
            {linkCopied && <span role="status" className="text-xs text-emerald-500">“{linkCopied}” bağlantısı kopyalandı.</span>}
          </div>

          {/* Sağ dan Orta Bölüm: İlerleme Çubuğu + Tema/Görünüm Kontrolleri (Mobil cihazlarda alt alta binmeden tek satırda yan yana durur) */}
          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 min-w-0 w-full ${viewMode === 'desktop' ? 'md:w-auto md:flex-1 md:justify-end' : ''}`}>
            
            {/* İlerleme Çubuğu */}
            <div className={`flex items-center gap-2 min-w-0 flex-1 ${viewMode === 'desktop' ? 'md:max-w-sm md:mr-4' : ''}`}>
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
            <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
              <TroubleshootingMenu dark={isDark}><NamazDiagnosticsPanel /></TroubleshootingMenu>
              
              {/* Arapça Yazı Boyutu Ayar İmleci (Slider) */}
              <div
                className={`flex items-center p-1.5 px-2 rounded-lg border ${
                  isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-100 border-slate-200'
                }`}
                title="Arapça Harf ve Metin Boyutu"
              >
                <input
                  id="namaz-font-scale-slider"
                  type="range"
                  min="80"
                  max="450"
                  step="10"
                  value={arabicScalePercent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setArabicScalePercent(val);
                    try {
                      localStorage.setItem('namaz_arabic_scale', String(val));
                    } catch {}
                  }}
                  className="w-16 sm:w-24 h-1.5 bg-slate-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Görünüm Modu Seçici */}
              <div className={`flex items-center p-1 rounded-lg border ${isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-100 border-slate-200'}`}>
                <button
                  id="btn-namaz-desktop-view"
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
                  id="btn-namaz-mobile-view"
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
                  id="btn-namaz-theme-dark"
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
                  id="btn-namaz-theme-emerald"
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

      <div className={`${viewMode === 'desktop' ? 'max-w-[1300px]' : 'max-w-[640px]'} mx-auto w-full min-w-0 p-3 sm:p-4 md:p-6 font-sans`}>
        {audioError && <p role="alert" className="mb-3 rounded-xl border border-amber-500/40 p-3 text-sm text-amber-500">{audioError}</p>}
        <label className="mb-3 flex flex-wrap items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={useDeviceVoice} onChange={e => setUseDeviceVoice(e.target.checked)} /> Cihaz sesiyle yedek okuma (isteğe bağlı, tecvid garantisi yok)</label>
        
        {/* 1. MOBİL MOD GÖRÜNÜMÜ */}
        {isMobileView ? (
          <div className="space-y-4 pb-72 sm:pb-56">
            
            {/* Mobil Kategori Seçici: Sureler vs Dualar vs Maneviyat */}
            <div
              className={`grid grid-cols-4 gap-1 p-1 rounded-2xl border ${
                isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setMobileCategory('sure');
                  selectNamazSection('sureler');
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  mobileCategory === 'sure'
                    ? isDark
                      ? 'bg-[#1c3630] text-[#3fb996] border border-[#3fb996]/50 shadow-xs'
                      : 'bg-emerald-700 text-white shadow-xs'
                    : isDark
                    ? 'text-[#b9b09a] hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Sûre ({NAMAZ_ITEMS.filter(i => i.category === 'sure' && !INTERMEDIATE_NAMAZ_SURAH_IDS.has(i.id)).length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileCategory('orta');
                  selectNamazItem('kadir');
                }}
                aria-pressed={mobileCategory === 'orta'}
                className={`min-h-[44px] py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  mobileCategory === 'orta'
                    ? isDark ? 'bg-[#1c3630] text-[#3fb996] border border-[#3fb996]/50 shadow-xs' : 'bg-emerald-700 text-white shadow-xs'
                    : isDark ? 'text-[#b9b09a] hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Orta ({INTERMEDIATE_NAMAZ_SURAH_IDS.size})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileCategory('dua');
                  selectNamazSection('dualar');
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  mobileCategory === 'dua'
                    ? isDark
                      ? 'bg-[#1c3630] text-[#3fb996] border border-[#3fb996]/50 shadow-xs'
                      : 'bg-teal-700 text-white shadow-xs'
                    : isDark
                    ? 'text-[#b9b09a] hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Dua ({NAMAZ_ITEMS.filter(i => i.category === 'dua').length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileCategory('yeni');
                  selectNamazSection('rehber');
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  mobileCategory === 'yeni'
                    ? isDark
                      ? 'bg-[#1c3630] text-[#3fb996] border border-[#3fb996]/50 shadow-xs'
                      : 'bg-emerald-700 text-white shadow-xs'
                    : isDark
                    ? 'text-[#b9b09a] hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Bilgi ({VIRTUAL_NEW_ITEMS.length})</span>
              </button>
            </div>

            <label htmlFor="namaz-mobile-search" className="sr-only">Sure, dua veya rehber ara</label>
            <input id="namaz-mobile-search" type="search" value={contentSearch} onChange={e => setContentSearch(e.target.value)} placeholder="Sure, dua veya rehber ara…" className={`w-full rounded-xl border p-3 text-sm ${isDark ? 'bg-[#211d16] border-[#3a3226] text-white' : 'bg-white border-slate-200'}`} />
            <div className="flex items-center gap-2 max-w-full overflow-x-auto pb-2 pt-1 scrollbar-none">
              {allItems.filter(i => (mobileCategory === 'orta' ? INTERMEDIATE_NAMAZ_SURAH_IDS.has(i.id) : i.category === mobileCategory && (mobileCategory !== 'sure' || !INTERMEDIATE_NAMAZ_SURAH_IDS.has(i.id))) && i.title.toLocaleLowerCase('tr-TR').includes(contentSearch.toLocaleLowerCase('tr-TR').trim())).map(item => {
                const isCur = item.id === selectedId;
                const isMem = memorizedIds.includes(item.id);
                const isSual = item.id === 'musluman-sualleri';
                const isSpecial = item.id === 'ibadetlerin-sihati-icin';
                const isPratik = item.id === 'pratik-namaz-rehberi';
                return (
                  <button
                    key={item.id}
                    onClick={() => selectNamazItem(item.id)}
                    className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isSual && !isCur
                        ? isDark
                          ? 'bg-emerald-950/60 text-emerald-200 border-emerald-500/80 ring-2 ring-emerald-500/40 shadow-md'
                          : 'bg-emerald-100 text-emerald-950 border-emerald-400 ring-2 ring-emerald-400/60 shadow-md'
                        : isSpecial && !isCur
                        ? isDark
                          ? 'bg-amber-950/50 text-amber-200 border-amber-500/80 ring-2 ring-amber-500/40 shadow-md'
                          : 'bg-amber-100 text-amber-950 border-amber-400 ring-2 ring-amber-400/60 shadow-md'
                        : isPratik && !isCur
                        ? isDark
                          ? 'bg-teal-950/50 text-teal-200 border-teal-500/80 ring-2 ring-teal-500/40 shadow-md'
                          : 'bg-teal-100 text-teal-950 border-teal-400 ring-2 ring-teal-400/60 shadow-md'
                        : isCur
                        ? isDark
                          ? 'bg-[#1c3630] text-[#3fb996] border-[#3fb996] shadow-sm ring-1 ring-[#3fb996]/60'
                          : 'bg-emerald-700 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-300/60'
                        : isDark
                        ? 'bg-[#211d16] text-[#b9b09a] border-[#3a3226] hover:bg-[#2a241b]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isSual && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                    {isSpecial && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                    {isPratik && <Sparkles className="w-3.5 h-3.5 text-teal-500" />}
                    {isMem && <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 fill-current" />}
                    <span>{item.title}</span>
                  </button>
                );
              })}
            </div>

            {isVirtualItem ? (
              <div
                className={`rounded-3xl p-5 shadow-sm border space-y-4 ${
                  isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'
                }`}
              >
                <h3 className={`text-xl font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                  {activeItem.title}
                </h3>
                {renderVirtualItemContent()}
              </div>
            ) : (
              <>
                {/* Seçili Öğe Başlık & Hızlı Araçlar */}
                <div
                  className={`rounded-3xl p-4 shadow-sm border space-y-3 ${
                    isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'
                  }`}
                >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                    {activeItem.title}
                  </h3>
                  <span className={`text-xs ${isDark ? 'text-[#8c826e]' : 'text-slate-400'}`}>
                    {activeItem.category === 'sure' ? `${activeItem.surahNumber}. Sure` : 'Namaz Duası'}
                  </span>
                </div>
                <button
                  onClick={() => toggleMemorized(activeItem.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    memorizedIds.includes(activeItem.id)
                      ? isDark
                        ? 'bg-[#1c3630] text-[#3fb996] border border-[#3fb996]/50'
                        : 'bg-emerald-100 text-emerald-800'
                      : isDark
                      ? 'bg-[#181510] text-[#b9b09a] border border-[#3a3226] hover:bg-[#2a241b]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {memorizedIds.includes(activeItem.id) ? (
                    <>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-600'}`} />
                      <span>Ezberlendi</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5" />
                      <span>Ezberledim</span>
                    </>
                  )}
                </button>
              </div>

              {/* Namazdaki Yeri */}
              <div
                className={`flex items-start gap-2 text-xs p-2.5 rounded-xl border ${
                  isDark
                    ? 'bg-[#2a241b] text-amber-200 border-amber-800/40'
                    : 'bg-amber-50/80 text-amber-900 border-amber-200'
                }`}
              >
                <Info className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
                <span><strong>Namazdaki Yeri:</strong> {activeItem.placeInPrayer}</span>
              </div>

              {/* Hızlı Görünüm Düğmeleri (Okunuş & Meal) */}
              <div className={`flex items-center gap-2 pt-1 border-t ${isDark ? 'border-[#3a3226]' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => setShowTransliteration(!showTransliteration)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    showTransliteration
                      ? isDark
                        ? 'bg-[#1c3630] border-[#3fb996]/60 text-[#3fb996] font-bold'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                      : isDark
                      ? 'bg-[#181510] border-[#3a3226] text-[#b9b09a]'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{showTransliteration ? 'Okunuş Açık' : 'Okunuş Kapalı'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowTranslations(!showTranslations)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    showTranslations
                      ? isDark
                        ? 'bg-amber-950/40 border-amber-700/60 text-amber-300 font-bold'
                        : 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                      : isDark
                      ? 'bg-[#181510] border-[#3a3226] text-[#b9b09a]'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {showTranslations ? (
                    <EyeOff className={`w-3.5 h-3.5 ${isDark ? 'text-amber-300' : 'text-amber-700'}`} />
                  ) : (
                    <Eye className={`w-3.5 h-3.5 ${isDark ? 'text-[#b9b09a]' : 'text-slate-500'}`} />
                  )}
                  <span>{showTranslations ? 'Meal Açık' : 'Meal Kapalı'}</span>
                </button>
              </div>
            </div>

            {/* Büyük Arapça Metin Kartı */}
            <div
              className={`p-5 rounded-3xl text-center shadow-xs border ${
                isDark
                  ? 'bg-[#211d16] border-[#3a3226]'
                  : 'bg-emerald-50/50 border-emerald-100'
              }`}
            >
              <p
                className={`font-amiri text-2xl md:text-3xl dir-rtl leading-[2.4] font-bold ${
                  isDark ? 'text-[#3fb996]' : 'text-emerald-950'
                }`}
              >
                {activeItem.arabic}
              </p>
            </div>

            {/* Ayet Ayet / Cümle Cümle Dinleme ve Ezberleme */}
            {activeItem.sentences && activeItem.sentences.length > 0 && (
              <div className="space-y-3">
                <h4 className={`text-xs font-bold uppercase tracking-wider px-1 ${isDark ? 'text-[#8c826e]' : 'text-slate-500'}`}>
                  Ayet Ayet Dinle & Tekrarla:
                </h4>
                {activeItem.sentences.map((sentence, sIdx) => {
                  const isSentenceActive = isPlaying && activeSentenceIdx === sIdx;
                  return (
                    <div
                      key={sIdx}
                      ref={(el) => {
                        sentenceCardRefs.current[sIdx] = el;
                      }}
                      onClick={() => playSentence(sIdx)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSentenceActive
                          ? isDark
                            ? 'bg-[#1c3630]/90 border-[#3fb996] ring-2 ring-[#3fb996]/50 shadow-md'
                            : 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-400/60 shadow-md'
                          : isDark
                          ? 'bg-[#211d16] border-[#3a3226] hover:border-[#3fb996]/40'
                          : 'bg-white border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                              isSentenceActive
                                ? isDark
                                  ? 'bg-[#3fb996] text-[#181510]'
                                  : 'bg-emerald-600 text-white'
                                : isDark
                                ? 'bg-[#1c3630] text-[#3fb996]'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {sIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => playSentence(sIdx, e)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              isSentenceActive
                                ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                                : isDark
                                ? 'bg-[#1c3630] text-[#3fb996] hover:bg-[#25453e]'
                                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            }`}
                          >
                            {isSentenceActive ? (
                              <>
                                <Square className="w-3 h-3 fill-current" />
                                <span>Durdur</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3" />
                                <span>Dinle</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p
                          className={`font-amiri text-xl dir-rtl font-bold leading-relaxed text-right flex-1 ${
                            isDark ? 'text-[#f1ecdd]' : 'text-emerald-950'
                          }`}
                        >
                          {sentence.arabic}
                        </p>
                      </div>

                      {/* Latin Harfli Okunuş (İsteğe Bağlı) */}
                      {showTransliteration && (
                        <div
                          className={`text-xs font-semibold dir-ltr text-left mt-1.5 animate-in fade-in duration-150 ${
                            isDark ? 'text-[#b9b09a]' : 'text-slate-700'
                          }`}
                        >
                          {sentence.reading}
                        </div>
                      )}

                      {/* Meal (İsteğe Bağlı) */}
                      {showTranslations && (
                        <div
                          className={`text-xs dir-ltr text-left mt-2 italic p-2.5 rounded-xl border animate-in fade-in duration-150 ${
                            isDark
                              ? 'bg-[#2a241b] border-amber-800/40 text-amber-200/90'
                              : 'bg-amber-50/70 border-amber-200/60 text-slate-600'
                          }`}
                        >
                          <span className={`font-semibold not-italic mr-1 ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                            Meal:
                          </span>
                          {sentence.meaning}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bütüncül Türkçe Okunuş (Mobil) */}
            {showTransliteration && (
              <div
                className={`p-4 rounded-2xl border animate-in fade-in duration-200 ${
                  isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'
                }`}
              >
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
                  Türkçe Latin Harfli Okunuşu:
                </h4>
                <p className={`text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                  {activeItem.turkishReading}
                </p>
              </div>
            )}

            {/* Bütüncül Türkçe Anlamı (Mobil) */}
            {showTranslations && (
              <div
                className={`p-4 rounded-2xl border animate-in fade-in duration-200 ${
                  isDark
                    ? 'bg-[#2a241b] border-amber-800/40 text-amber-100'
                    : 'bg-amber-50/60 border-amber-200 text-slate-800'
                }`}
              >
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Türkçe Meali / Anlamı:</span>
                </h4>
                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {activeItem.meaning}
                </p>
              </div>
            )}

            {/* Mobil Sabit Alt Kontrol Paneli */}
            <div
              className={`fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] lg:bottom-0 left-0 right-0 z-40 max-w-[100vw] min-w-0 backdrop-blur-md border-t shadow-2xl px-2 py-2 sm:px-3 ${
                isDark
                  ? 'bg-[#211d16]/95 border-[#3a3226] text-[#f1ecdd]'
                  : 'bg-white/95 border-slate-200 text-slate-800'
              }`}
            >
              <div className="max-w-lg mx-auto space-y-2">
                
                {/* Oynatma Durumu Bildirimi */}
                {isPlaying && (
                  <div
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-between animate-pulse ${
                      isDark
                        ? 'bg-[#1c3630] text-[#3fb996] border border-[#3fb996]/40'
                        : 'bg-emerald-100/90 text-emerald-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full animate-ping ${isDark ? 'bg-[#3fb996]' : 'bg-emerald-600'}`}></span>
                      <span>
                        {activeSentenceIdx !== null
                          ? `Ayet ${activeSentenceIdx + 1} Okunuyor`
                          : 'Seslendiriliyor...'}
                      </span>
                    </div>
                    <span>Döngü: {currentLoop} / {targetLoop === 'infinite' ? '∞' : targetLoop}</span>
                  </div>
                )}

                <div className="flex flex-col gap-2 min-w-0">
                  {/* Tümünü Dinle / Durdur */}
                  {isPlaying ? (
                    <button
                      onClick={stopAudio}
                      className="w-full py-2.5 px-4 bg-rose-600 active:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>Durdur</span>
                    </button>
                  ) : (
                    <button
                      onClick={playFullItem}
                      className={`w-full py-2.5 px-4 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95 ${
                        isDark ? 'bg-[#1c3630] hover:bg-[#25453e] text-[#3fb996] border border-[#3fb996]/50' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Tümünü Dinle</span>
                    </button>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-2 min-w-0">
                  {/* Hız Ayarı Slider (İmleçli) */}
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                      isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    <Gauge className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-[#3fb996]' : 'text-emerald-600'}`} />
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={playbackSpeed}
                      onChange={(e) => changeSpeed(parseFloat(e.target.value))}
                      className="w-16 sm:w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      title={`Okuma Hızı: ${playbackSpeed.toFixed(2)}x`}
                    />
                    <span className={`text-[11px] font-mono font-bold w-8 text-right ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
                      {playbackSpeed.toFixed(1)}x
                    </span>
                  </div>

                  {/* Tekrar Döngüsü Seçici */}
                  <div
                    className={`flex items-center p-1 rounded-xl border ${
                      isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    {([1, 3, 5, 'infinite'] as const).map((loopVal) => {
                      const isCur = targetLoop === loopVal;
                      const label = loopVal === 'infinite' ? '∞' : `${loopVal}x`;
                      return (
                        <button
                          key={loopVal}
                          type="button"
                          onClick={() => setTargetLoop(loopVal)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                            isCur
                              ? isDark
                                ? 'bg-[#1c3630] text-[#3fb996] border border-[#3fb996]/50 shadow-xs'
                                : 'bg-emerald-600 text-white shadow-xs'
                              : isDark
                              ? 'text-[#b9b09a] hover:bg-[#211d16]'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                          title={loopVal === 'infinite' ? 'Sonsuz Tekrar' : `${loopVal} Kez Tekrarla`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  </div>
                </div>
              </div>
            </div>
            </>)}

          </div>
        ) : (
          /* 2. MASAÜSTÜ PANELİ GÖRÜNÜMÜ */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sol Liste (Sureler ve Dualar) */}
            <div className="lg:col-span-4 xl:col-span-4 space-y-4">
              <label htmlFor="namaz-desktop-search" className="sr-only">Sure, dua veya rehber ara</label>
              <input id="namaz-desktop-search" type="search" value={contentSearch} onChange={e => setContentSearch(e.target.value)} placeholder="Sure, dua veya rehber ara…" className={`w-full rounded-xl border p-3 text-sm ${isDark ? 'bg-[#211d16] border-[#3a3226] text-white' : 'bg-white border-slate-200'}`} />
              
              {/* Sureler Grubu */}
              <div
                className={`rounded-2xl p-4 shadow-sm border ${
                  isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'
                }`}
              >
                <h3
                  className={`text-xs font-bold uppercase tracking-wider mb-3 px-2 flex items-center gap-1.5 ${
                    isDark ? 'text-[#8c826e]' : 'text-slate-400'
                  }`}
                >
                  <BookOpen className={`w-3.5 h-3.5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-600'}`} />
                  <span>Namaz Sureleri (Fâtiha, Asr ve Son 10)</span>
                  <button type="button" onClick={() => copyNamazLink(makeNamazSectionHash('sureler'), 'Namaz Sureleri (Fatiha + Son 10)')}
                    title="Bu bölümün bağlantısını kopyala" aria-label="Namaz Sureleri (Fatiha + Son 10) bağlantısını kopyala"
                    className="ml-auto p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 cursor-pointer">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </h3>
                <div className="space-y-1.5 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
                  {NAMAZ_ITEMS.filter((item) => item.category === 'sure' && !INTERMEDIATE_NAMAZ_SURAH_IDS.has(item.id) && item.title.toLocaleLowerCase('tr-TR').includes(contentSearch.toLocaleLowerCase('tr-TR').trim())).map((item) => {
                    const isCur = item.id === selectedId;
                    const isMem = memorizedIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        id={`namaz-item-${item.id}`}
                        onClick={() => selectNamazItem(item.id)}
                        onKeyDown={e => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); selectNamazItem(item.id); } }}
                        role="button" tabIndex={0} aria-current={isCur ? 'page' : undefined}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs md:text-sm font-medium transition-all cursor-pointer border ${
                          isCur
                            ? isDark
                              ? 'bg-[#1c3630] text-[#3fb996] border-[#3fb996] font-bold shadow-xs'
                              : 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold shadow-xs'
                            : isDark
                            ? 'bg-[#181510] text-[#f1ecdd] border-[#2e271e] hover:border-[#3fb996]/40 hover:bg-[#252018]'
                            : 'bg-white text-slate-700 border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={(e) => toggleMemorized(item.id, e)}
                            className={`transition-colors cursor-pointer ${
                              isDark ? 'text-[#8c826e] hover:text-[#3fb996]' : 'text-slate-300 hover:text-emerald-600'
                            }`}
                            title={isMem ? 'Ezberlendi olarak işaretlendi' : 'Ezberledim olarak işaretle'}
                          >
                            {isMem ? (
                              <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-[#3fb996] fill-[#1c3630]' : 'text-emerald-600 fill-emerald-100'}`} />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>
                          <span>{item.title}</span>
                        </div>
                        <span className={`text-[11px] font-normal ${isDark ? 'text-[#8c826e]' : 'text-slate-400'}`}>
                          {item.surahNumber}. Sure
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dualar Grubu */}
              <div
                className={`rounded-2xl p-4 shadow-sm border ${
                  isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'
                }`}
              >
                <h3
                  className={`text-xs font-bold uppercase tracking-wider mb-3 px-2 flex items-center gap-1.5 ${
                    isDark ? 'text-[#8c826e]' : 'text-slate-400'
                  }`}
                >
                  <BookOpen className={`w-3.5 h-3.5 ${isDark ? 'text-[#3fb996]' : 'text-teal-600'}`} />
                  <span>Namaz Duaları</span>
                  <button type="button" onClick={() => copyNamazLink(makeNamazSectionHash('dualar'), 'Namaz Duaları')}
                    title="Bu bölümün bağlantısını kopyala" aria-label="Namaz Duaları bağlantısını kopyala"
                    className="ml-auto p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 cursor-pointer">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </h3>
                <div className="space-y-1.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                  {NAMAZ_ITEMS.filter((item) => item.category === 'dua' && item.title.toLocaleLowerCase('tr-TR').includes(contentSearch.toLocaleLowerCase('tr-TR').trim())).map((item) => {
                    const isCur = item.id === selectedId;
                    const isMem = memorizedIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        id={`namaz-item-${item.id}`}
                        onClick={() => selectNamazItem(item.id)}
                        onKeyDown={e => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); selectNamazItem(item.id); } }}
                        role="button" tabIndex={0} aria-current={isCur ? 'page' : undefined}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs md:text-sm font-medium transition-all cursor-pointer border ${
                          isCur
                            ? isDark
                              ? 'bg-[#1c3630] text-[#3fb996] border-[#3fb996] font-bold shadow-xs'
                              : 'bg-teal-50 text-teal-900 border-teal-300 font-bold shadow-xs'
                            : isDark
                            ? 'bg-[#181510] text-[#f1ecdd] border-[#2e271e] hover:border-[#3fb996]/40 hover:bg-[#252018]'
                            : 'bg-white text-slate-700 border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={(e) => toggleMemorized(item.id, e)}
                            className={`transition-colors cursor-pointer ${
                              isDark ? 'text-[#8c826e] hover:text-[#3fb996]' : 'text-slate-300 hover:text-teal-600'
                            }`}
                          >
                            {isMem ? (
                              <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-[#3fb996] fill-[#1c3630]' : 'text-teal-600 fill-teal-100'}`} />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>
                          <span>{item.title}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isDark ? 'text-[#8c826e]' : 'text-slate-400'}`} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Orta seviye sûreler, duaların hemen altında ayrı bir liste. */}
              <section className={`rounded-2xl p-4 shadow-sm border ${isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'}`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 px-2 flex items-center gap-1.5 ${isDark ? 'text-[#8c826e]' : 'text-slate-500'}`}>
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  <span>Orta Seviye Sûreler ({INTERMEDIATE_NAMAZ_SURAH_IDS.size})</span>
                </h3>
                <div className="space-y-1.5 max-h-[420px] overflow-y-auto custom-scrollbar pr-1" aria-label="Orta seviye sûreler">
                  {NAMAZ_ITEMS.filter(item =>
                    INTERMEDIATE_NAMAZ_SURAH_IDS.has(item.id) &&
                    item.title.toLocaleLowerCase('tr-TR').includes(contentSearch.toLocaleLowerCase('tr-TR').trim())
                  ).map(item => {
                    const isCur = item.id === selectedId;
                    const isMem = memorizedIds.includes(item.id);
                    return (
                      <div key={item.id} id={`namaz-item-${item.id}`}
                        role="button" tabIndex={0}
                        aria-current={isCur ? 'page' : undefined}
                        onClick={() => selectNamazItem(item.id)}
                        onKeyDown={e => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); selectNamazItem(item.id); } }}
                        className={`min-h-[44px] flex items-center justify-between gap-2 p-2.5 rounded-xl text-xs md:text-sm font-medium cursor-pointer border transition-all ${
                          isCur
                            ? isDark ? 'bg-[#1c3630] text-[#3fb996] border-[#3fb996] font-bold' : 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                            : isDark ? 'bg-[#181510] text-[#f1ecdd] border-[#2e271e] hover:border-[#3fb996]/40' : 'bg-white text-slate-700 border-slate-100 hover:border-slate-300'
                        }`}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button type="button"
                            aria-label={`${item.title} ${isMem ? 'ezberlendi işaretini kaldır' : 'ezberledim olarak işaretle'}`}
                            aria-pressed={isMem}
                            onClick={e => toggleMemorized(item.id, e)}
                            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg"
                          >
                            {isMem ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-slate-400" />}
                          </button>
                          <span className="truncate">{item.title}</span>
                        </div>
                        <span className={`shrink-0 text-[11px] ${isDark ? 'text-[#8c826e]' : 'text-slate-400'}`}>{item.surahNumber}. Sûre</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Namaz Rehberi & Tüyolar Grubu */}
              <div
                className={`rounded-2xl p-4 shadow-sm border ${
                  isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'
                }`}
              >
                <h3
                  className={`text-xs font-bold uppercase tracking-wider mb-3 px-2 flex items-center gap-1.5 ${
                    isDark ? 'text-[#8c826e]' : 'text-slate-400'
                  }`}
                >
                  <BookOpen className={`w-3.5 h-3.5 ${isDark ? 'text-[#3fb996]' : 'text-teal-600'}`} />
                  <span>Namaz Rehberi & Tüyolar</span>
                  <button type="button" onClick={() => copyNamazLink(makeNamazSectionHash('rehber'), 'Namaz Rehberi & Tüyolar')}
                    title="Bu bölümün bağlantısını kopyala" aria-label="Namaz Rehberi & Tüyolar bağlantısını kopyala"
                    className="ml-auto p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 cursor-pointer">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </h3>
                <div className="space-y-1.5 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
                  {VIRTUAL_NEW_ITEMS.filter(item => item.title.toLocaleLowerCase('tr-TR').includes(contentSearch.toLocaleLowerCase('tr-TR').trim())).map((item) => {
                    const isCur = item.id === selectedId;
                    const isSual = item.id === 'musluman-sualleri';
                    const isSpecial = item.id === 'ibadetlerin-sihati-icin';
                    const isPratik = item.id === 'pratik-namaz-rehberi';
                    return (
                      <div
                        key={item.id}
                        id={`namaz-guide-item-${item.id}`}
                        onClick={() => selectNamazItem(item.id)}
                        onKeyDown={e => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); selectNamazItem(item.id); } }}
                        role="button" tabIndex={0} aria-current={isCur ? 'page' : undefined}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs md:text-sm font-medium transition-all cursor-pointer border ${
                          isSual && !isCur
                            ? isDark
                              ? 'bg-emerald-950/60 text-emerald-200 border-emerald-500/80 ring-2 ring-emerald-500/40 shadow-md font-bold'
                              : 'bg-emerald-50 text-emerald-950 border-emerald-400 ring-2 ring-emerald-400/60 shadow-md font-bold'
                            : isSpecial && !isCur
                            ? isDark
                              ? 'bg-amber-950/50 text-amber-200 border-amber-500/80 ring-2 ring-amber-500/40 shadow-md'
                              : 'bg-amber-50 text-amber-950 border-amber-400 ring-2 ring-amber-400/60 shadow-md font-bold'
                            : isPratik && !isCur
                            ? isDark
                              ? 'bg-teal-950/50 text-teal-200 border-teal-500/80 ring-2 ring-teal-500/40 shadow-md'
                              : 'bg-teal-50 text-teal-950 border-teal-400 ring-2 ring-teal-400/60 shadow-md font-bold'
                            : isCur
                            ? isDark
                              ? 'bg-[#1c3630] text-[#3fb996] border-[#3fb996] font-bold shadow-xs'
                              : 'bg-teal-50 text-teal-900 border-teal-300 font-bold shadow-xs'
                            : isDark
                            ? 'bg-[#181510] text-[#f1ecdd] border-[#2e271e] hover:border-[#3fb996]/40 hover:bg-[#252018]'
                            : 'bg-white text-slate-700 border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isSual ? (
                            <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                          ) : isSpecial ? (
                            <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                          ) : isPratik ? (
                            <Sparkles className="w-4 h-4 shrink-0 text-teal-500" />
                          ) : (
                            <BookOpen className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#3fb996]/80' : 'text-teal-600'}`} />
                          )}
                          <span className={isSual || isSpecial || isPratik ? 'font-extrabold tracking-wide' : ''}>{item.title}</span>
                          {isSual && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-600 text-white font-bold ml-1 uppercase shadow-xs">Yeni</span>
                          )}
                          {isSpecial && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500 text-white font-bold ml-1 uppercase shadow-xs">Önemli</span>
                          )}
                          {isPratik && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-600 text-white font-bold ml-1 uppercase shadow-xs">Pratik</span>
                          )}
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isDark ? 'text-[#8c826e]' : 'text-slate-400'}`} />
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Sağ Panel: Seçili Sure / Dua Ezber Alanı */}
            <div className="lg:col-span-8 xl:col-span-8 space-y-6">
              <div
                className={`rounded-3xl p-6 md:p-8 shadow-sm border ${
                  isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'
                }`}
              >
                
                {/* Başlık ve Durum */}
                <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b gap-3 ${isDark ? 'border-[#3a3226]' : 'border-slate-100'}`}>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className={`text-2xl font-bold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                        {activeItem.title}
                      </h2>
                      {!isVirtualItem && (
                        <button
                          onClick={() => toggleMemorized(activeItem.id)}
                          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            memorizedIds.includes(activeItem.id)
                              ? isDark
                                ? 'bg-[#1c3630] text-[#3fb996] border border-[#3fb996]/50'
                                : 'bg-emerald-100 text-emerald-800'
                              : isDark
                              ? 'bg-[#181510] text-[#b9b09a] border border-[#3a3226] hover:bg-[#252018]'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {memorizedIds.includes(activeItem.id) ? (
                            <>
                              <CheckCircle2 className={`w-3.5 h-3.5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-600'}`} />
                              <span>Ezberlendi</span>
                            </>
                          ) : (
                            <>
                              <Circle className="w-3.5 h-3.5" />
                              <span>Ezberledim Olarak İşaretle</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Namazdaki Yeri Rehberi */}
                    {!isVirtualItem && activeItem.placeInPrayer && (
                      <div
                        className={`flex items-start gap-2 mt-2 text-xs p-2.5 rounded-xl border ${
                          isDark
                            ? 'bg-[#2a241b] text-amber-200 border-amber-800/40'
                            : 'bg-amber-50/80 text-amber-900 border-amber-200'
                        }`}
                      >
                        <Info className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
                        <span><strong>Namazdaki Yeri:</strong> {activeItem.placeInPrayer}</span>
                      </div>
                    )}
                  </div>

                  {/* Okunuş & Meal Aç/Kapat Butonları */}
                  {!isVirtualItem && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowTransliteration(!showTransliteration)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          showTransliteration
                            ? isDark
                              ? 'bg-[#1c3630] border-[#3fb996]/60 text-[#3fb996]'
                              : 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                            : isDark
                            ? 'bg-[#181510] border-[#3a3226] text-[#b9b09a] hover:bg-[#252018]'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                        title={showTransliteration ? "Okunuşu Gizle" : "Okunuşu Göster"}
                      >
                        <BookOpen className={`w-4 h-4 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} />
                        <span>{showTransliteration ? 'Okunuşu Gizle' : 'Okunuşu Göster'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowTranslations(!showTranslations)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          showTranslations
                            ? isDark
                              ? 'bg-amber-950/40 border-amber-700/60 text-amber-300'
                              : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                            : isDark
                            ? 'bg-[#181510] border-[#3a3226] text-[#b9b09a] hover:bg-[#252018]'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                        title={showTranslations ? "Mealleri Gizle" : "Mealleri Göster"}
                      >
                        {showTranslations ? (
                          <>
                            <EyeOff className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
                            <span>Mealleri Gizle</span>
                          </>
                        ) : (
                          <>
                            <Eye className={`w-4 h-4 ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`} />
                            <span>Mealleri Göster</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isVirtualItem ? (
                  <div className="pt-6">
                    {renderVirtualItemContent()}
                  </div>
                ) : (
                  <>

                {/* Kontrol Çubuğu (Geliştirilmiş UI: İmleçli Hız Slider, Tekrar ve Tümünü Dinle) */}
                <div
                  className={`mt-5 p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
                    isDark
                      ? 'bg-[#181510] border-[#3a3226]'
                      : 'bg-slate-50/90 border-slate-200/80'
                  }`}
                >
                  
                  {/* Sol Taraf: İmleçli Hız Slider */}
                  <div
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border shadow-xs ${
                      isDark
                        ? 'bg-[#211d16] border-[#3a3226]'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className={`flex items-center gap-1 text-xs font-bold ${isDark ? 'text-[#b9b09a]' : 'text-slate-600'}`}>
                      <Gauge className={`w-3.5 h-3.5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-600'}`} />
                      <span>Hız:</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={playbackSpeed}
                      onChange={(e) => changeSpeed(parseFloat(e.target.value))}
                      className="w-24 sm:w-28 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      title={`Okuma Hızı: ${playbackSpeed.toFixed(2)}x`}
                    />
                    <span className={`text-xs font-mono font-bold w-10 text-right ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
                      {playbackSpeed.toFixed(2)}x
                    </span>
                  </div>

                  {/* Orta Taraf: Tekrar Sayacı */}
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 text-xs font-bold mr-1 ${isDark ? 'text-[#8c826e]' : 'text-slate-500'}`}>
                      <RotateCcw className={`w-3.5 h-3.5 ${isDark ? 'text-[#3fb996]' : 'text-emerald-600'}`} />
                      <span>Tekrar:</span>
                    </div>
                    <div
                      className={`flex items-center gap-1 p-1 rounded-xl border shadow-xs ${
                        isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200'
                      }`}
                    >
                      {([1, 3, 5, 10, 'infinite'] as const).map((loopVal) => {
                        const isCur = targetLoop === loopVal;
                        const label = loopVal === 'infinite' ? '∞' : `${loopVal}x`;
                        return (
                          <button
                            key={loopVal}
                            type="button"
                            onClick={() => setTargetLoop(loopVal)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isCur
                                ? isDark
                                  ? 'bg-[#1c3630] text-[#3fb996] border border-[#3fb996]/50 shadow-xs'
                                  : 'bg-emerald-600 text-white shadow-xs'
                                : isDark
                                ? 'text-[#b9b09a] hover:bg-[#181510]'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                            title={loopVal === 'infinite' ? 'Sonsuz Tekrar' : `${loopVal} Kez Tekrarla`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sağ Taraf: Tümünü Dinle / Durdur */}
                  <div>
                    {isPlaying ? (
                      <button
                        onClick={stopAudio}
                        className="py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs md:text-sm rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                      >
                        <Square className="w-4 h-4 fill-current" />
                        <span>Durdur</span>
                      </button>
                    ) : (
                      <button
                        onClick={playFullItem}
                        className={`py-2.5 px-5 font-bold text-xs md:text-sm rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 ${
                          isDark
                            ? 'bg-[#1c3630] hover:bg-[#25453e] text-[#3fb996] border border-[#3fb996]/50'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Tümünü Dinle</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Çalma ve Döngü Durum Göstergesi */}
                {isPlaying && (
                  <div
                    className={`mt-3 py-2.5 px-4 rounded-xl text-xs font-bold flex justify-between items-center shadow-sm animate-pulse border ${
                      isDark
                        ? 'bg-[#1c3630]/70 border-[#3fb996]/40 text-[#3fb996]'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDark ? 'bg-[#3fb996]' : 'bg-emerald-400'}`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${isDark ? 'bg-[#3fb996]' : 'bg-emerald-600'}`}></span>
                      </span>
                      <span>
                        {activeSentenceIdx !== null
                          ? `Ayet / Cümle ${activeSentenceIdx + 1} Okunuyor...`
                          : 'Seslendiriliyor...'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${isDark ? 'bg-[#181510] text-[#3fb996]' : 'bg-emerald-200/80 text-emerald-900'}`}>
                        Hız: {playbackSpeed}x
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${isDark ? 'bg-[#211d16] text-[#3fb996] border border-[#3fb996]/30' : 'bg-emerald-100 text-emerald-800'}`}>
                        Döngü: {currentLoop} / {targetLoop === 'infinite' ? '∞' : targetLoop}
                      </span>
                    </div>
                  </div>
                )}

                {/* Büyük Arapça Metin Kartı */}
                <div
                  className={`my-6 p-6 md:p-8 rounded-3xl text-center shadow-xs border ${
                    isDark
                      ? 'bg-[#181510] border-[#3a3226]'
                      : 'bg-emerald-50/50 border-emerald-100'
                  }`}
                >
                  <p
                    className={`font-amiri text-3xl md:text-4xl dir-rtl leading-[2.4] font-bold ${
                      isDark ? 'text-[#3fb996]' : 'text-emerald-950'
                    }`}
                  >
                    {activeItem.arabic}
                  </p>
                </div>

                {/* Cümle Cümle / Ayet Ayet Ezberleme & Dinleme Adımları */}
                {activeItem.sentences && activeItem.sentences.length > 0 && (
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#8c826e]' : 'text-slate-500'}`}>
                        Ayet Ayet Dinleme ve Ezberleme:
                      </h4>
                      <span className={`text-[11px] ${isDark ? 'text-[#8c826e]' : 'text-slate-400'}`}>
                        Ayetin yanındaki "Dinle" butonuna tıklayarak bağımsız veya sırayla dinleyin
                      </span>
                    </div>
                    {activeItem.sentences.map((sentence, sIdx) => {
                      const isSentenceActive = isPlaying && activeSentenceIdx === sIdx;
                      return (
                        <div
                          key={sIdx}
                          ref={(el) => {
                            sentenceCardRefs.current[sIdx] = el;
                          }}
                          onClick={() => playSentence(sIdx)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSentenceActive
                              ? isDark
                                ? 'bg-[#1c3630]/90 border-[#3fb996] ring-2 ring-[#3fb996]/50 shadow-md'
                                : 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-400/60 shadow-md'
                              : isDark
                              ? 'bg-[#181510] border-[#3a3226] hover:border-[#3fb996]/40 hover:bg-[#211d16]'
                              : 'bg-slate-50/80 border-slate-200 hover:border-emerald-300 hover:bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                                  isSentenceActive
                                    ? isDark
                                      ? 'bg-[#3fb996] text-[#181510]'
                                      : 'bg-emerald-600 text-white shadow-xs'
                                    : isDark
                                    ? 'bg-[#1c3630] text-[#3fb996]'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {sIdx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => playSentence(sIdx, e)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isSentenceActive
                                    ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                                    : isDark
                                    ? 'bg-[#1c3630] text-[#3fb996] hover:bg-[#25453e]'
                                    : 'bg-emerald-100/80 text-emerald-800 hover:bg-emerald-200'
                                }`}
                                title={isSentenceActive ? 'Durdur' : 'Bu Ayeti Dinle'}
                              >
                                {isSentenceActive ? (
                                  <>
                                    <Square className="w-3.5 h-3.5 fill-current" />
                                    <span>Durdur</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-3.5 h-3.5" />
                                    <span>Dinle</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p
                              className={`font-amiri text-xl md:text-2xl dir-rtl font-bold leading-relaxed text-right flex-1 ${
                                isDark ? 'text-[#f1ecdd]' : 'text-emerald-950'
                              }`}
                            >
                              {sentence.arabic}
                            </p>
                          </div>

                          {/* Latin Harfli Okunuş */}
                          {showTransliteration && (
                            <div
                              className={`text-xs md:text-sm font-semibold dir-ltr text-left mt-2 animate-in fade-in duration-150 ${
                                isDark ? 'text-[#b9b09a]' : 'text-slate-700'
                              }`}
                            >
                              {sentence.reading}
                            </div>
                          )}

                          {/* Meal Alanı */}
                          {showTranslations && (
                            <div
                              className={`text-xs dir-ltr text-left mt-2 italic p-2.5 rounded-xl border animate-in fade-in duration-150 ${
                                isDark
                                  ? 'bg-[#2a241b] border-amber-800/40 text-amber-200/90'
                                  : 'bg-amber-50/60 border-amber-200/60 text-slate-600'
                              }`}
                            >
                              <span className={`font-semibold not-italic mr-1 ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                                Meal:
                              </span>
                              {sentence.meaning}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Bütüncül Türkçe Okunuş */}
                {showTransliteration && (
                  <div
                    className={`mb-5 p-5 rounded-2xl border animate-in fade-in duration-200 ${
                      isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'}`}>
                      Türkçe Latin Harfli Okunuşu:
                    </h4>
                    <p className={`text-sm md:text-base font-medium leading-relaxed whitespace-pre-line ${isDark ? 'text-[#f1ecdd]' : 'text-slate-800'}`}>
                      {activeItem.turkishReading}
                    </p>
                  </div>
                )}

                {/* Bütüncül Türkçe Anlamı */}
                {showTranslations && (
                  <div
                    className={`p-5 rounded-2xl border animate-in fade-in duration-200 ${
                      isDark
                        ? 'bg-[#2a241b] border-amber-800/40 text-amber-100'
                        : 'bg-amber-50/50 border-amber-200 text-slate-800'
                    }`}
                  >
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Türkçe Meali / Anlamı:</span>
                    </h4>
                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-line">
                      {activeItem.meaning}
                    </p>
                  </div>
                )}

              </>)}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

