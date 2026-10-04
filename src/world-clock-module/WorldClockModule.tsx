import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useThemeSync, broadcastThemeChange } from '../utils/themeSync';
import {
  Globe,
  Search,
  Pin,
  Plus,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Maximize2,
  MapPin,
  Eye,
  EyeOff,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CalendarClock
} from 'lucide-react';
import './world-clock.css';
import {
  CardUITheme,
  ModuleThemeMode,
  PersistedWorldClockState,
  ViewportSimulationMode,
  WorldClockCardConfig,
  WorldLocationData
} from './types';
import {
  WORLD_LOCATIONS_DATA,
  detectUserLocationByIP,
  getTimePartsInTimezone,
  searchWorldLocations
} from './worldCitiesData';
import { ClockCard } from './ClockCard';
import { TimeTravelSlider } from './TimeTravelSlider';
import { FocusModeOverlay } from './FocusModeOverlay';
import { MeetingTimeFinderModal } from './MeetingTimeFinderModal';

const STORAGE_KEY_FULL_STATE = 'wc_module_persisted_state_v2';
const STORAGE_KEY_CARDS_LEGACY = 'wc_module_cards_v1';
const STORAGE_KEY_THEME_LEGACY = 'wc_module_theme_v1';
const STORAGE_KEY_IP_DETECTED = 'wc_module_ip_detected_v1';

// Uygulama içi sekme geçişlerinde sıfır gecikmeli bellek önbelleği (LocalStorage ile tam senkronize)
let inMemoryWorldClockState: PersistedWorldClockState | null = null;

function createCardFromLocation(
  location: WorldLocationData,
  options?: {
    isPinned?: boolean;
    isAutoDetected?: boolean;
    uiTheme?: CardUITheme;
    numeralColor?: string;
  }
): WorldClockCardConfig {
  return {
    id: `wc-${location.id}-${Math.random().toString(36).substring(2, 7)}`,
    location,
    isPinned: Boolean(options?.isPinned),
    isAutoDetected: Boolean(options?.isAutoDetected),
    displayType: 'analog',
    showDetails: false, // Varsayılan "Sade Görünüm"
    numeralStyle: 'turkish',
    customCardinals: { pos12: '12', pos3: '3', pos6: '6', pos9: '9' },
    secondMotion: 'sweep',
    handStyle: 'rect',
    centerPhotoDataUrl: null,
    centerPhotoScale: 0.55,
    showDialDate: true,
    dialDatePosition: 'right',
    showDigitalSeconds: true,
    use24Hour: true,
    uiTheme: options?.uiTheme || 'ottoman-iznik',
    numeralColor: options?.numeralColor || '#142952',
    bezelColor: null,
    dialBgColor: null,
    tickColor: null,
    hourHandColor: null,
    minuteHandColor: null,
    cardSize: 'md',
    clockScalePercent: 100
  };
}

function getDefaultInitialCards(): WorldClockCardConfig[] {
  const istanbul =
    WORLD_LOCATIONS_DATA.find((l) => l.id === 'tr-istanbul') ||
    WORLD_LOCATIONS_DATA[0];
  const makkah =
    WORLD_LOCATIONS_DATA.find((l) => l.id === 'sa-makkah') ||
    WORLD_LOCATIONS_DATA[1];
  const london =
    WORLD_LOCATIONS_DATA.find((l) => l.id === 'gb-london') ||
    WORLD_LOCATIONS_DATA[2];
  const tokyo =
    WORLD_LOCATIONS_DATA.find((l) => l.id === 'jp-tokyo') ||
    WORLD_LOCATIONS_DATA[3];

  return [
    createCardFromLocation(istanbul, {
      isPinned: true,
      isAutoDetected: true,
      uiTheme: 'ottoman-iznik',
      numeralColor: '#142952'
    }),
    createCardFromLocation(makkah, {
      uiTheme: 'royal-obsidian',
      numeralColor: '#fbbf24'
    }),
    createCardFromLocation(london, {
      uiTheme: 'crystal-glass',
      numeralColor: '#f8fafc'
    }),
    createCardFromLocation(tokyo, {
      uiTheme: 'midnight-sapphire',
      numeralColor: '#93c5fd'
    })
  ];
}

function loadInitialPersistedState(): PersistedWorldClockState {
  if (inMemoryWorldClockState) {
    return inMemoryWorldClockState;
  }

  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY_FULL_STATE);
    if (rawV2) {
      const parsed = JSON.parse(rawV2) as Partial<PersistedWorldClockState>;
      if (parsed && Array.isArray(parsed.cards) && parsed.cards.length > 0) {
        const state: PersistedWorldClockState = {
          cards: parsed.cards.map((c) => {
            const rawTheme = c.uiTheme as string;
            const normalizedTheme: CardUITheme =
              rawTheme === 'ottoman-payitaht' ? 'ottoman-iznik' : c.uiTheme;
            return {
              ...c,
              uiTheme: normalizedTheme,
              numeralColor:
                rawTheme === 'ottoman-payitaht' && c.numeralColor === '#F6EFE2'
                  ? '#142952'
                  : c.numeralColor,
              clockScalePercent:
                typeof c.clockScalePercent === 'number' ? c.clockScalePercent : 100,
              centerPhotoScale:
                typeof c.centerPhotoScale === 'number' ? c.centerPhotoScale : 0.55,
              showDialDate:
                typeof c.showDialDate === 'boolean' ? c.showDialDate : true,
              dialDatePosition: c.dialDatePosition || 'right',
              handStyle: c.handStyle || 'rect',
              bezelColor: c.bezelColor ?? null,
              dialBgColor: c.dialBgColor ?? null,
              tickColor: c.tickColor ?? null,
              hourHandColor: c.hourHandColor ?? null,
              minuteHandColor: c.minuteHandColor ?? null
            };
          }),
          themeMode: parsed.themeMode === 'light' ? 'light' : 'dark',
          viewportMode: parsed.viewportMode === 'mobile' ? 'mobile' : 'desktop',
          isFocusModeOpen: Boolean(parsed.isFocusModeOpen),
          focusedCardId: parsed.focusedCardId || null,
          focusShowDigitalSubClock:
            typeof parsed.focusShowDigitalSubClock === 'boolean'
              ? parsed.focusShowDigitalSubClock
              : true,
          timeTravelMinutes:
            typeof parsed.timeTravelMinutes === 'number'
              ? parsed.timeTravelMinutes
              : 0,
          scrollY: typeof parsed.scrollY === 'number' ? parsed.scrollY : 0
        };
        inMemoryWorldClockState = state;
        return state;
      }
    }

    // Eski v1 kayıtlarından geçiş (varsa)
    const rawCardsV1 = localStorage.getItem(STORAGE_KEY_CARDS_LEGACY);
    const rawThemeV1 = localStorage.getItem(STORAGE_KEY_THEME_LEGACY) as ModuleThemeMode;
    if (rawCardsV1) {
      const parsedCards = JSON.parse(rawCardsV1);
      if (Array.isArray(parsedCards) && parsedCards.length > 0) {
        const migrated: PersistedWorldClockState = {
          cards: parsedCards,
          themeMode: rawThemeV1 === 'light' ? 'light' : 'dark',
          viewportMode: 'desktop',
          isFocusModeOpen: false,
          focusedCardId: null,
          focusShowDigitalSubClock: true,
          timeTravelMinutes: 0,
          scrollY: 0
        };
        inMemoryWorldClockState = migrated;
        return migrated;
      }
    }
  } catch {
    // ignore storage read error
  }

  const fallback: PersistedWorldClockState = {
    cards: getDefaultInitialCards(),
    themeMode: 'dark',
    viewportMode: 'desktop',
    isFocusModeOpen: false,
    focusedCardId: null,
    focusShowDigitalSubClock: true,
    timeTravelMinutes: 0,
    scrollY: 0
  };
  inMemoryWorldClockState = fallback;
  return fallback;
}

function savePersistedState(state: PersistedWorldClockState) {
  inMemoryWorldClockState = state;
  try {
    localStorage.setItem(STORAGE_KEY_FULL_STATE, JSON.stringify(state));
  } catch {
    // Eğer fotoğraf boyutları yüzünden localStorage kotası dolarsa fotoğrafları bellekte tutup geri kalan durumu kaydet
    try {
      const lightState: PersistedWorldClockState = {
        ...state,
        cards: state.cards.map((c) => ({ ...c }))
      };
      localStorage.setItem(STORAGE_KEY_FULL_STATE, JSON.stringify(lightState));
    } catch {}
  }
}

export const WorldClockModule: React.FC = () => {
  const initialState = useMemo(() => loadInitialPersistedState(), []);

  // Modül İçi Tema (Sayfa içine hapsedilmiş Karanlık / Aydınlık Mod)
  const [themeMode, setThemeMode] = useState<ModuleThemeMode>(initialState.themeMode);

  useThemeSync(themeMode === 'dark', (newIsDark) => {
    setThemeMode(newIsDark ? 'dark' : 'light');
  });

  const handleSetTheme = (mode: ModuleThemeMode) => {
    setThemeMode(mode);
    broadcastThemeChange(mode === 'dark');
  };

  // Masaüstü / Mobil Görünüm Simülasyonu
  const [viewportMode, setViewportMode] = useState<ViewportSimulationMode>(
    initialState.viewportMode
  );

  // Odak Modu (Focus Mode) - Kalıcı: Kullanıcı odak modundayken başka sayfaya gidip dönerse yine odak modunda açılır!
  const [isFocusModeOpen, setIsFocusModeOpen] = useState<boolean>(
    initialState.isFocusModeOpen
  );
  const [focusedCardId, setFocusedCardId] = useState<string | null>(
    initialState.focusedCardId
  );
  const [focusShowDigitalSubClock, setFocusShowDigitalSubClock] = useState<boolean>(
    initialState.focusShowDigitalSubClock
  );

  // Zamanda Yolculuk Kaydırıcısı
  const [timeTravelMinutes, setTimeTravelMinutes] = useState<number>(
    initialState.timeTravelMinutes
  );

  // Saat Kartları Listesi
  const [cards, setCards] = useState<WorldClockCardConfig[]>(initialState.cards);

  // Canlı referans zamanı
  const [baseNow, setBaseNow] = useState<Date>(() => new Date());

  // IP Otomatik Konum Durumu
  const [ipDetecting, setIpDetecting] = useState(false);
  const [ipStatusText, setIpStatusText] = useState<string | null>(null);

  // Akıllı Arama Çubuğu Durumu
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Toplantı Zamanı Bulucu Modal / Panel Durumu
  const [isMeetingFinderOpen, setIsMeetingFinderOpen] = useState(false);

  // Sürükle-Bırak (Drag & Drop) Durumu
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  // Scroll konumunu takip et ve kaydet
  const scrollYRef = useRef<number>(initialState.scrollY || 0);

  // Her değişiklikte tüm modül durumunu kalıcı olarak kaydet
  useEffect(() => {
    savePersistedState({
      cards,
      themeMode,
      viewportMode,
      isFocusModeOpen,
      focusedCardId,
      focusShowDigitalSubClock,
      timeTravelMinutes,
      scrollY: scrollYRef.current
    });
  }, [
    cards,
    themeMode,
    viewportMode,
    isFocusModeOpen,
    focusedCardId,
    focusShowDigitalSubClock,
    timeTravelMinutes
  ]);

  // Sayfaya geri dönüldüğünde kaydedilmiş scroll konumunu geri yükle ve scroll oldukça kaydet
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (initialState.scrollY > 0) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: initialState.scrollY, behavior: 'instant' as ScrollBehavior });
      });
    }

    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
      if (inMemoryWorldClockState) {
        inMemoryWorldClockState.scrollY = window.scrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (inMemoryWorldClockState) {
        savePersistedState({
          ...inMemoryWorldClockState,
          scrollY: scrollYRef.current
        });
      }
    };
  }, []);

  // Canlı saat periyodik güncellemesi
  useEffect(() => {
    const timer = setInterval(() => {
      setBaseNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // İlk girişte IP üzerinden otomatik ülke/şehir tespiti
  const runIpAutoDetection = async (forceAdd = false) => {
    setIpDetecting(true);
    try {
      const detectedLoc = await detectUserLocationByIP();
      setIpStatusText(`${detectedLoc.flag} ${detectedLoc.city}, ${detectedLoc.country}`);

      setCards((prevCards) => {
        const existingIndex = prevCards.findIndex(
          (c) =>
            c.location.city.toLowerCase() === detectedLoc.city.toLowerCase() ||
            c.isAutoDetected
        );

        if (existingIndex !== -1 && !forceAdd) {
          const updated = [...prevCards];
          updated[existingIndex] = {
            ...updated[existingIndex],
            location: detectedLoc,
            isAutoDetected: true
          };
          return updated;
        }

        const newAutoCard = createCardFromLocation(detectedLoc, {
          isPinned: true,
          isAutoDetected: true,
          uiTheme: 'ottoman-iznik',
          numeralColor: '#142952'
        });

        const unpinnedRest = prevCards.map((c) => ({
          ...c,
          isPinned: false,
          isAutoDetected: false
        }));
        return [newAutoCard, ...unpinnedRest];
      });

      try {
        localStorage.setItem(STORAGE_KEY_IP_DETECTED, 'true');
      } catch {}
    } catch {
      setIpStatusText('Yerel Saat Dilimi Aktif');
    } finally {
      setIpDetecting(false);
    }
  };

  useEffect(() => {
    let alreadyDetected = false;
    try {
      alreadyDetected = localStorage.getItem(STORAGE_KEY_IP_DETECTED) === 'true';
    } catch {}

    if (!alreadyDetected) {
      runIpAutoDetection(false);
    } else {
      const autoCard = cards.find((c) => c.isAutoDetected) || cards[0];
      if (autoCard) {
        setIpStatusText(
          `${autoCard.location.flag} ${autoCard.location.city}, ${autoCard.location.country}`
        );
      }
    }
  }, []);

  // Arama kutusu dışına tıklanınca kapat
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Akıllı Fuzzy Arama Sonuçları
  const searchResults = useMemo(() => {
    return searchWorldLocations(searchQuery);
  }, [searchQuery]);

  // Kart Güncelleme
  const handleUpdateCard = (id: string, patch: Partial<WorldClockCardConfig>) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...patch } : card))
    );
  };

  // Kartın tüm özelleştirmelerini (renkler, çerçeve, göbek, dakika çizgileri, tarih penceresi, fotoğraf, boyut) varsayılana (default) döndürme
  const handleResetCardToDefault = (id: string) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== id) return card;
        const defaultTheme: CardUITheme = 'ottoman-iznik';
        const defaultNumeralColor = '#142952';
        return {
          ...card,
          displayType: 'analog',
          showDetails: false,
          numeralStyle: 'turkish',
          customCardinals: { pos12: '12', pos3: '3', pos6: '6', pos9: '9' },
          secondMotion: 'sweep',
          handStyle: 'rect',
          centerPhotoDataUrl: null,
          centerPhotoScale: 0.55,
          showDialDate: true,
          dialDatePosition: 'right',
          showDigitalSeconds: true,
          use24Hour: true,
          uiTheme: defaultTheme,
          numeralColor: defaultNumeralColor,
          bezelColor: null,
          dialBgColor: null,
          tickColor: null,
          hourHandColor: null,
          minuteHandColor: null,
          cardSize: 'md',
          clockScalePercent: 100
        };
      })
    );
  };

  // Tüm kartların tasarım değerlerini tek tıkla varsayılana (default) sıfırlama
  const handleResetAllCardsToDefault = () => {
    setCards((prev) =>
      prev.map((card, index) => {
        const themes: CardUITheme[] = [
          'ottoman-emerald',
          'royal-obsidian',
          'crystal-glass',
          'midnight-sapphire'
        ];
        const pickedTheme = themes[index % themes.length];
        const pickedNumeral =
          pickedTheme === 'royal-obsidian'
            ? '#fbbf24'
            : pickedTheme === 'ottoman-emerald'
            ? '#ecfdf5'
            : pickedTheme === 'midnight-sapphire'
            ? '#93c5fd'
            : '#f8fafc';
        return {
          ...card,
          displayType: 'analog',
          showDetails: false,
          numeralStyle: 'turkish',
          customCardinals: { pos12: '12', pos3: '3', pos6: '6', pos9: '9' },
          secondMotion: 'sweep',
          handStyle: 'rect',
          centerPhotoDataUrl: null,
          centerPhotoScale: 0.55,
          showDialDate: true,
          dialDatePosition: 'right',
          showDigitalSeconds: true,
          use24Hour: true,
          uiTheme: pickedTheme,
          numeralColor: pickedNumeral,
          bezelColor: null,
          dialBgColor: null,
          tickColor: null,
          hourHandColor: null,
          minuteHandColor: null,
          cardSize: 'md',
          clockScalePercent: 100
        };
      })
    );
    setTimeTravelMinutes(0);
  };

  // Pinleme (Sabitleme): Pinlenen kart otomatik olarak 1 numaraya sabitlenir ve Odak Modu varsayılanı olur
  const handleTogglePin = (id: string) => {
    setCards((prev) => {
      const target = prev.find((c) => c.id === id);
      if (!target) return prev;

      const willPin = !target.isPinned;
      if (!willPin) {
        return prev.map((c) => (c.id === id ? { ...c, isPinned: false } : c));
      }

      const pinnedCard: WorldClockCardConfig = { ...target, isPinned: true };
      const others = prev
        .filter((c) => c.id !== id)
        .map((c) => ({ ...c, isPinned: false }));
      return [pinnedCard, ...others];
    });
  };

  // Yeni Şehir/Ülke Kartı Ekleme
  const handleAddLocation = (loc: WorldLocationData, pinImmediately = false) => {
    const themes: CardUITheme[] = [
      'crystal-glass',
      'royal-obsidian',
      'ottoman-emerald',
      'midnight-sapphire',
      'nordic-alabaster'
    ];
    const pickedTheme = themes[cards.length % themes.length];
    const pickedColor =
      pickedTheme === 'nordic-alabaster'
        ? '#1c1917'
        : pickedTheme === 'royal-obsidian'
        ? '#fbbf24'
        : '#f8fafc';

    const newCard = createCardFromLocation(loc, {
      isPinned: pinImmediately,
      uiTheme: pickedTheme,
      numeralColor: pickedColor
    });

    setCards((prev) => {
      if (pinImmediately) {
        const unpinned = prev.map((c) => ({ ...c, isPinned: false }));
        return [newCard, ...unpinned];
      }
      return [...prev, newCard];
    });

    setSearchQuery('');
    setIsSearchOpen(false);
  };

  // Kart Silme
  const handleRemoveCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  // Yukarı / Aşağı Butonla Sıralama
  const handleMoveCard = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= cards.length) return;
    setCards((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(index, 1);
      updated.splice(targetIdx, 0, moved);
      return updated.map((c, idx) => ({
        ...c,
        isPinned: idx === 0 ? c.isPinned : false
      }));
    });
  };

  // Sürükle-Bırak İşleyicileri
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    setDropTargetIndex(targetIndex);

    setCards((prev) => {
      const updated = [...prev];
      const [draggedItem] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, draggedItem);
      return updated;
    });
    setDraggedIndex(targetIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  // Odak Modunda Açılacak Kart (Varsayılan: Pinlenmiş veya 1 numaralı saat)
  const activeFocusCard = useMemo(() => {
    if (focusedCardId) {
      const found = cards.find((c) => c.id === focusedCardId);
      if (found) return found;
    }
    return cards.find((c) => c.isPinned) || cards[0] || null;
  }, [cards, focusedCardId]);

  const allDetailsShown = useMemo(
    () => cards.length > 0 && cards.every((c) => c.showDetails),
    [cards]
  );

  const allDigital = useMemo(
    () => cards.length > 0 && cards.every((c) => c.displayType === 'digital'),
    [cards]
  );

  // Üst bardaki genel saat boyutu imleci için ortalama/birinci saat ölçeği
  const primaryClockScale = useMemo(() => {
    return cards[0]?.clockScalePercent ?? 100;
  }, [cards]);

  const handleGlobalClockScaleChange = (newScale: number) => {
    const clamped = Math.max(60, Math.min(180, newScale));
    setCards((prev) =>
      prev.map((c) => ({
        ...c,
        clockScalePercent: clamped
      }))
    );
  };

  const isLight = themeMode === 'light';

  return (
    <div
      className={`wc-module-root ${
        themeMode === 'light' ? 'wc-theme-light' : 'wc-theme-dark'
      } min-h-[calc(100dvh-4rem)] w-full py-5 px-3 sm:px-6 lg:px-8 flex flex-col justify-between gap-6`}
    >
      {/* ÜST KONTEYNER: SAYFA İÇİ ÖZEL HEADER VE AKILLI ARAMA ÇUBUĞU */}
      <div className="max-w-[1400px] w-full mx-auto space-y-5">
        {/* 1. Sayfa İçi Özel Üst Bar (Header) ve Modlar */}
        <div className="wc-glass-panel rounded-3xl px-4 py-3.5 sm:px-6 sm:py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shadow-lg">
          {/* Sol: Modül Başlığı ve Otomatik IP Konum Bilgisi */}
          <div className="flex items-center justify-between lg:justify-start gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shrink-0">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-xl font-black tracking-tight truncate">
                    Dünya Saatleri Modülü
                  </h2>
                  {ipStatusText && (
                    <span className="text-xs opacity-75 font-medium truncate">
                      · {ipStatusText}
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-70 truncate">
                  Kişiselleştirilebilir Horoloji Kadranları, Akıllı Pinleme ve Zamanda Yolculuk
                </p>
              </div>
            </div>

            {/* IP Konum Yenileme Butonu (Mobil/Küçük ekran sağ köşe) */}
            <button
              type="button"
              onClick={() => runIpAutoDetection(true)}
              disabled={ipDetecting}
              title="IP adresiniz üzerinden bulunduğunuz ülke ve şehri yeniden tespit et"
              className={`lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 ${
                isLight
                  ? 'bg-slate-200/80 text-slate-800 hover:bg-slate-300'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              {ipDetecting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>IP Konum</span>
            </button>
          </div>

          {/* Sağ: Sayfa İçi Özel Kontroller (Saat Boyutu İmleci, Karanlık/Aydınlık Mod, Masaüstü/Mobil Simülasyonu, Odak Modu) */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
            {/* IP Konum Tespiti Butonu (Masaüstü) */}
            <button
              type="button"
              onClick={() => runIpAutoDetection(true)}
              disabled={ipDetecting}
              title="IP adresiniz üzerinden bulunduğunuz ülke/şehri tespit et ve 1. sıraya ekle"
              className={`hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                isLight
                  ? 'bg-slate-200/75 text-slate-700 hover:bg-slate-300/80'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              {ipDetecting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>Konumumu Tespit Et (IP)</span>
            </button>

            {/* Toplu Sade / Detaylı Görünüm Toggle */}
            <button
              type="button"
              onClick={() =>
                setCards((prev) =>
                  prev.map((c) => ({ ...c, showDetails: !allDetailsShown }))
                )
              }
              title="Tüm kartlarda ülke, bayrak, gün ve diğer saat dilimi detaylarını aç/kapat"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                allDetailsShown
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : isLight
                  ? 'bg-slate-200/75 text-slate-700 hover:bg-slate-300/80'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              {allDetailsShown ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
              <span>{allDetailsShown ? 'Sade Görünüm' : 'Detayları Aç'}</span>
            </button>

            {/* Saat Boyutu Büyütme/Küçültme İmleci (Diğer sayfalardaki imleç kutusuyla birebir uyumlu) */}
            <div
              className={`flex items-center gap-1 p-1 px-1.5 rounded-lg border ${
                !isLight ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-100 border-slate-200'
              }`}
              title="Saat Boyutunu İmleç ile Büyüt / Küçült"
            >
              <button
                type="button"
                onClick={() => handleGlobalClockScaleChange(primaryClockScale - 10)}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  !isLight
                    ? 'text-[#b9b09a] hover:text-white hover:bg-[#211d16]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
                title="Saatleri Küçült"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <input
                type="range"
                min="60"
                max="180"
                step="5"
                value={primaryClockScale}
                onChange={(e) =>
                  handleGlobalClockScaleChange(parseInt(e.target.value, 10))
                }
                className="w-14 sm:w-20 h-1.5 bg-slate-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                title={`Saat Boyutu İmleci (%${primaryClockScale})`}
              />

              <button
                type="button"
                onClick={() => handleGlobalClockScaleChange(primaryClockScale + 10)}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  !isLight
                    ? 'text-[#b9b09a] hover:text-white hover:bg-[#211d16]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
                title="Saatleri Büyüt"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Görünüm Modu Seçici (Diğer sayfalarla birebir aynı tasarım) */}
            <div
              className={`flex items-center p-1 rounded-lg border ${
                !isLight ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-100 border-slate-200'
              }`}
              role="group"
              aria-label="Görünüm Modu Seçici"
            >
              <button
                id="btn-wc-desktop-view"
                type="button"
                onClick={() => setViewportMode('desktop')}
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  viewportMode === 'desktop'
                    ? !isLight
                      ? 'bg-[#1c3630] text-[#3fb996] border border-[#3fb996]/40'
                      : 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                    : !isLight
                    ? 'text-[#b9b09a] hover:text-[#f1ecdd]'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Masaüstü Görünümü"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>

              <button
                id="btn-wc-mobile-view"
                type="button"
                onClick={() => setViewportMode('mobile')}
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  viewportMode === 'mobile'
                    ? !isLight
                      ? 'bg-[#1c3630] text-[#3fb996] border border-[#3fb996]/40'
                      : 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                    : !isLight
                    ? 'text-[#b9b09a] hover:text-[#f1ecdd]'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Mobil Görünümü"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tema Seçici (Diğer sayfalarla birebir aynı tasarım) */}
            <div
              className={`flex items-center p-1 rounded-lg border ${
                !isLight ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-100 border-slate-200'
              }`}
              role="group"
              aria-label="Tema Seçici"
            >
              <button
                id="btn-wc-theme-dark"
                type="button"
                onClick={() => handleSetTheme('dark')}
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  !isLight
                    ? 'bg-[#1c3630] text-[#3fb996] border border-[#3fb996]/40'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Koyu Tema"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>

              <button
                id="btn-wc-theme-light"
                type="button"
                onClick={() => handleSetTheme('light')}
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  isLight
                    ? 'bg-white text-emerald-800 shadow-xs border border-emerald-300'
                    : 'text-[#b9b09a] hover:text-[#f1ecdd]'
                }`}
                title="Açık Tema"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Odak Modu (Focus Mode) Butonu - 1 Numaralı (Pinlenmiş) Saati Tam Ekran Açar */}
            <button
              type="button"
              onClick={() => {
                setFocusedCardId(null);
                setIsFocusModeOpen(true);
              }}
              title="Odak Modu: 1 numaralı (pinlenmiş) saati tam ekran aç"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Odak Modu</span>
            </button>
          </div>
        </div>

        {/* 2. Akıllı Arama Çubuğu (Sadece Saatler Görünümündeyken Gösterilir) */}
        {!isMeetingFinderOpen && (
          <div ref={searchContainerRef} className="relative z-30">
            <div className="wc-glass-panel rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3 flex-1">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  placeholder="Ülke, şehir veya başkent ara... (Örn: Türkiye, Londra, Mekke, Tokyo, Washington, Almanya)"
                  className="w-full bg-transparent text-xs sm:text-sm font-medium focus:outline-none placeholder:opacity-60"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs opacity-60 hover:opacity-100 cursor-pointer px-1.5"
                  >
                    Temizle
                  </button>
                )}
              </div>

              {/* Hızlı Tümünü Analog / Dijital Geçiş, Toplantı Zamanı Bul & Bilgi */}
              <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
                {/* Toplantı Zamanı Bul Sayfasına Geçiş Butonu */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMeetingFinderOpen(true);
                    if (typeof window !== 'undefined') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  title="Ülkeler arası ortak mesai saatlerini 24 saatlik matris tablosu sayfasında karşılaştır"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-95"
                >
                  <CalendarClock className="w-4 h-4" />
                  <span>Toplantı Zamanı Bul</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCards((prev) =>
                      prev.map((c) => ({
                        ...c,
                        displayType: allDigital ? 'analog' : 'digital'
                      }))
                    )
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    isLight
                      ? 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20'
                  }`}
                >
                  {allDigital ? 'Tümünü Analog Yap' : 'Tümünü Dijital Yap'}
                </button>
                <button
                  type="button"
                  onClick={handleResetAllCardsToDefault}
                  title="Tüm saat kartlarının renk, çerçeve, göbek, tarih ve boyut ayarlarını varsayılana (default) sıfırla"
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    isLight
                      ? 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Varsayılan (Default)</span>
                </button>
                <span className="font-mono text-xs opacity-70 tabular-nums whitespace-nowrap">
                  {cards.length} Saat Aktif
                </span>
              </div>
            </div>

            {/* Akıllı Arama Sonuçları Açılır Listesi (Dropdown) */}
            {isSearchOpen && (
              <div
                className={`mt-2 rounded-2xl border shadow-2xl max-h-80 overflow-y-auto custom-scrollbar p-2 space-y-1 ${
                  isLight
                    ? 'bg-white/95 border-slate-300 text-slate-900'
                    : 'bg-slate-900/95 border-slate-700 text-slate-100'
                } backdrop-blur-xl`}
              >
                <div className="px-3 py-1.5 flex items-center justify-between text-[11px] opacity-65">
                  <span>
                    Ülke, Şehir veya Başkent Sonuçları ({searchResults.length})
                  </span>
                  <span>Hızlı Ekle veya #1 Sıraya Pinle</span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="py-8 text-center text-xs opacity-70">
                    Aramanızla eşleşen ülke, şehir veya başkent bulunamadı.
                  </div>
                ) : (
                  searchResults.slice(0, 18).map((loc) => {
                    const previewTime = getTimePartsInTimezone(
                      baseNow,
                      loc.timezone,
                      timeTravelMinutes
                    );
                    const alreadyAdded = cards.some(
                      (c) => c.location.id === loc.id
                    );

                    return (
                      <div
                        key={loc.id}
                        className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl transition-colors ${
                          isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-2xl shrink-0">{loc.flag}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold truncate">
                                {loc.city}
                              </span>
                              <span className="text-xs opacity-75 truncate">
                                · {loc.country}
                              </span>
                            </div>
                            <div className="text-[11px] opacity-65 truncate">
                              Başkent: {loc.capital} · {loc.utcOffsetLabel}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-xs sm:text-sm font-bold text-emerald-400 tabular-nums mr-1">
                            {previewTime.formattedTime24}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleAddLocation(loc, false)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                              alreadyAdded
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{alreadyAdded ? 'Tekrar Ekle' : 'Ekle'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAddLocation(loc, true)}
                            title="1 Numaraya Sabitleyerek (Pinleyerek) Ekle"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <Pin className="w-3.5 h-3.5 fill-current" />
                            <span className="hidden sm:inline">Pinle (#1)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SAYFA GÖRÜNÜMÜ GEÇİŞİ: TOPLANTI ZAMANI BULUCU SAYFASI VEYA SAAT KARTLARI GRİDİ */}
      {isMeetingFinderOpen ? (
        <div className="flex-1 w-full">
          <MeetingTimeFinderModal
            isOpen={isMeetingFinderOpen}
            onClose={() => setIsMeetingFinderOpen(false)}
            cards={cards}
            baseNow={baseNow}
            themeMode={themeMode}
            onAddLocationToMainCards={(loc) => handleAddLocation(loc, false)}
            onRemoveCardFromMain={handleRemoveCard}
          />
        </div>
      ) : (
        <>
          {/* ORTA ALAN: SAAT KARTLARI GRİDİ (Masaüstü veya Mobil Görünüm Simülasyonu) */}
          <div className="max-w-[1400px] w-full mx-auto flex-1">
            <div
              className={
                viewportMode === 'mobile'
                  ? 'wc-mobile-simulator-frame wc-glass-panel'
                  : 'w-full'
              }
            >
              {viewportMode === 'mobile' && (
                <div className="flex items-center justify-between px-3 py-2 mb-3 border-b border-white/10 text-[11px] opacity-75">
                  <span className="font-semibold">Mobil Görünüm Simülasyonu</span>
                  <span className="font-mono">412px · Dokunmatik Dikey Akış</span>
                </div>
              )}

              <div
                className={
                  viewportMode === 'mobile'
                    ? 'grid grid-cols-1 gap-4'
                    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start'
                }
              >
                {cards.map((card, idx) => {
                  const spanClass =
                    viewportMode === 'mobile'
                      ? 'col-span-1'
                      : card.cardSize === 'xl'
                      ? 'sm:col-span-2 lg:col-span-3 xl:col-span-4'
                      : card.cardSize === 'lg'
                      ? 'sm:col-span-2'
                      : 'col-span-1';

                  return (
                    <div key={card.id} className={spanClass}>
                      <ClockCard
                        card={card}
                        index={idx}
                        totalCards={cards.length}
                        baseNow={baseNow}
                        timeTravelMinutes={timeTravelMinutes}
                        themeMode={themeMode}
                        isDragging={draggedIndex === idx}
                        isDropTarget={dropTargetIndex === idx}
                        onUpdateCard={handleUpdateCard}
                        onResetCardToDefault={handleResetCardToDefault}
                        onTogglePin={handleTogglePin}
                        onRemoveCard={handleRemoveCard}
                        onOpenFocusForCard={(cardId) => {
                          setFocusedCardId(cardId);
                          setIsFocusModeOpen(true);
                        }}
                        onMoveCard={handleMoveCard}
                        onDragStart={handleDragStart}
                        onDragEnter={handleDragEnter}
                        onDragEnd={handleDragEnd}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ALT BAR: ZAMANDA YOLCULUK (TIME SLIDER / KAYDIRICI) */}
          <div className="max-w-[1400px] w-full mx-auto sticky bottom-3 z-20">
            <TimeTravelSlider
              timeTravelMinutes={timeTravelMinutes}
              onChangeMinutes={setTimeTravelMinutes}
              themeMode={themeMode}
            />
          </div>
        </>
      )}

      {/* ODAK MODU (FOCUS MODE) TAM EKRAN KATMANI */}
      {isFocusModeOpen && (
        <FocusModeOverlay
          card={activeFocusCard}
          baseNow={baseNow}
          timeTravelMinutes={timeTravelMinutes}
          showDigitalSubClock={focusShowDigitalSubClock}
          onToggleDigitalSubClock={() =>
            setFocusShowDigitalSubClock((prev) => !prev)
          }
          onUpdateCardScale={(cardId, newScalePercent) =>
            handleUpdateCard(cardId, { clockScalePercent: newScalePercent })
          }
          onClose={() => setIsFocusModeOpen(false)}
          onToggleDisplayType={(id) => {
            const target = cards.find((c) => c.id === id);
            if (target) {
              handleUpdateCard(id, {
                displayType:
                  target.displayType === 'analog' ? 'digital' : 'analog'
              });
            }
          }}
        />
      )}
    </div>
  );
};
