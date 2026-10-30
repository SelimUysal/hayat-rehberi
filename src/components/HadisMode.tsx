import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useThemeSync, broadcastThemeChange } from '../utils/themeSync';
import {
  Search,
  Monitor,
  Smartphone,
  Moon,
  Sun,
  ZoomIn,
  ZoomOut,
  Trophy,
  BarChart3,
  FileDown,
  FileText,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  X,
  ArrowUpDown,
  Link2,
  Check,
  ListChecks
} from 'lucide-react';
import {
  HadisItem,
  HadisSortOption,
  HadisUserOverlay,
  HADIS_UI_ALTERNATIVES,
  resolveHadisModeNumber,
  getAllHadisler,
  filterAndSortHadisler,
  loadUserHadisOverlays,
  saveUserHadisOverlays,
  loadCustomHadisOrder,
  saveCustomHadisOrder,
  loadActivityLogs,
  logHadisActivity,
  exportHadislerToPDF,
  exportHadislerToWord,
  exportHadislerToExcel
} from '../services/hadisService';
import { HadisCardItem } from './hadis/HadisCardItem';
import { HadisQuizView, HadisStatsView } from './hadis/HadisQuizAndStatsView';

export type HadisTheme = 'dark' | 'emerald';
export type HadisViewMode = 'desktop' | 'mobile';

interface HadisModeProps {
  targetHadisId?: number;
  targetUiAlternative?: number;
  targetCategory?: string;
  targetTimestamp?: number;
}

export const HadisMode: React.FC<HadisModeProps> = ({
  targetHadisId,
  targetUiAlternative,
  targetCategory,
  targetTimestamp
}) => {
  // 1. TEMA VE GÖRÜNÜM MODU
  const [theme, setTheme] = useState<HadisTheme>(() => {
    try {
      const saved = localStorage.getItem('hadis_theme_mode') as HadisTheme;
      if (saved === 'dark' || saved === 'emerald') return saved;
      const namazSaved = localStorage.getItem('namaz_theme_mode') as HadisTheme;
      if (namazSaved === 'dark' || namazSaved === 'emerald') return namazSaved;
    } catch {}
    return 'dark';
  });

  useThemeSync(theme === 'dark', (newIsDark) => {
    setTheme(newIsDark ? 'dark' : 'emerald');
  });

  const [viewMode, setViewMode] = useState<HadisViewMode>(() => {
    try {
      const saved = localStorage.getItem('hadis_view_mode') as HadisViewMode;
      if (saved === 'desktop' || saved === 'mobile') return saved;
      if (typeof window !== 'undefined' && window.innerWidth < 768) return 'mobile';
    } catch {}
    return 'desktop';
  });

  // 2. BAĞIMSIZ ARAPÇA VE MEAL TİPOGRAFİ KONTROLLERİ
  const [arabicScalePercent, setArabicScalePercent] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('hadis_arabic_scale'));
      if (saved && !isNaN(saved) && saved >= 80 && saved <= 240) return saved;
    } catch {}
    return 115;
  });

  const [mealScalePercent, setMealScalePercent] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('hadis_meal_scale'));
      if (saved && !isNaN(saved) && saved >= 75 && saved <= 220) return saved;
    } catch {}
    return 100;
  });

  const [textSizeLevel, setTextSizeLevel] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('hadis_text_size_level'));
      if (!isNaN(saved) && saved >= 0 && saved <= 3) return saved;
    } catch {}
    return 1;
  });

  // 3. HARİCİ JSON VERİSİ, KULLANICI DURUMU VE ÖZEL SIRALAMA HAFIZASI
  const [overlays, setOverlays] = useState<Record<number, HadisUserOverlay>>(() =>
    loadUserHadisOverlays()
  );
  const [activityLogs, setActivityLogs] = useState(() => loadActivityLogs());

  const allHadisler = useMemo<HadisItem[]>(() => {
    const base = getAllHadisler();
    return base.map((item) => {
      const ov = overlays[item.id] || {};
      return {
        ...item,
        isFavorite: ov.isFavorite ?? item.isFavorite,
        isMemorized: ov.isMemorized ?? item.isMemorized,
        userNote: ov.userNote ?? item.userNote,
        memorizedAt: ov.memorizedAt ?? item.memorizedAt,
        lastReviewedAt: ov.lastReviewedAt ?? item.lastReviewedAt,
        reviewCount: ov.reviewCount ?? item.reviewCount ?? 0
      };
    });
  }, [overlays]);

  const [customOrderIds, setCustomOrderIds] = useState<number[]>(() => {
    const defaultIds = getAllHadisler().map((h) => h.id);
    return loadCustomHadisOrder(defaultIds);
  });

  // 4. 7 TEMEL GÖRÜNÜM MODU ([8, 1, 2, 4, 11, 9, 5] -> Mod 1..7)
  const [uiAlt, setUiAlt] = useState<number>(() => {
    if (targetUiAlternative) {
      return resolveHadisModeNumber(targetUiAlternative);
    }
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const u = Number(params.get('ui'));
      if (u) return resolveHadisModeNumber(u);
      const savedV2 = Number(localStorage.getItem('hadis_active_ui_mode_v2'));
      if (savedV2 >= 1 && savedV2 <= 7) return savedV2;
    }
    return 1; // Varsayılan: 1. Mod ([8, 1, 2, 4, 11, 9, 5] dizisinin ilk elemanı)
  });

  const [isUiMenuOpen, setIsUiMenuOpen] = useState<boolean>(false);
  const uiMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (uiMenuRef.current && !uiMenuRef.current.contains(e.target as Node)) {
        setIsUiMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('q') || '';
    }
    return '';
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (targetCategory) return targetCategory;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('cat') || 'all';
    }
    return 'all';
  });

  const [quickFilter, setQuickFilter] = useState<
    'all' | 'favorites' | 'memorized' | 'unmemorized' | 'noted'
  >('all');

  const [sortBy, setSortBy] = useState<HadisSortOption>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hadis_sort_by') as HadisSortOption;
      if (saved) return saved;
    }
    return 'custom';
  });

  const [focusedIndex, setFocusedIndex] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('hadis_focused_index'));
      if (!isNaN(saved) && saved >= 0) return saved;
    } catch {}
    return 0;
  });

  // Özel Sıralama Sepeti ("Listeye Seç" ile seçilen hadis ID'leri, seçilme sırasıyla)
  const [selectedIdsForExport, setSelectedIdsForExport] = useState<number[]>([]);
  const [appliedBasketNotice, setAppliedBasketNotice] = useState<boolean>(false);

  // 7. Mod Sıralama Düzenleme Modu, Canlı Sürükle-Bırak ve Satır İçi Sıra Numarası Durumları
  const [isReorderMode, setIsReorderMode] = useState<boolean>(false);
  const [mode7SubView, setMode7SubView] = useState<'table' | 'cards'>('table');
  const [draggedHadisId, setDraggedHadisId] = useState<number | null>(null);
  const [editingRowPositionId, setEditingRowPositionId] = useState<number | null>(null);
  const [rowPositionInputVal, setRowPositionInputVal] = useState<string>('');

  const [modalHadisId, setModalHadisId] = useState<number | null>(null);
  const onHadisCardInteraction = (event: React.MouseEvent<HTMLElement>) => {
    const card = (event.target as HTMLElement).closest<HTMLElement>('[data-hadis-id]');
    if (!card) return;
    const id = Number(card.dataset.hadisId);
    const index = filteredHadisler.findIndex(h => h.id === id);
    if (index >= 0 && id !== activeHadis?.id) selectHadisIndex(index);
  };
  const [activeDrawer, setActiveDrawer] = useState<'none' | 'quiz' | 'stats'>('none');
  const [clozeRatio, setClozeRatio] = useState<number>(0.5);
  const [deeplinkCopied, setDeeplinkCopied] = useState<boolean>(false);

  const readHadisHash = () => {
    const match = window.location.hash.match(/^#hadis\/(\d+)(?:\/|$)/);
    return match ? Number(match[1]) : null;
  };
  const [sharedHadisId, setSharedHadisId] = useState<number | null>(() => typeof window === 'undefined' ? null : readHadisHash());
  useEffect(() => {
    const sync = () => setSharedHadisId(readHadisHash());
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {window.removeEventListener('popstate', sync); window.removeEventListener('hashchange', sync);};
  }, []);

  // Prop değişimlerini yakala
  useEffect(() => {
    if (targetHadisId) {
      const idx = allHadisler.findIndex((h) => h.id === targetHadisId);
      if (idx >= 0) {
        setFocusedIndex(idx);
        setTimeout(() => {
          const el = document.getElementById(`hadis-card-${targetHadisId}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 180);
      }
    }
    if (targetUiAlternative) {
      setUiAlt(resolveHadisModeNumber(targetUiAlternative));
    }
    if (targetCategory) {
      setSelectedCategory(targetCategory);
    }
  }, [targetHadisId, targetUiAlternative, targetCategory, targetTimestamp, allHadisler]);

  // 5. SCROLL POZİSYONU HAFIZASI
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedScroll = Number(
        sessionStorage.getItem('hadis_scroll_y') || localStorage.getItem('hadis_scroll_y')
      );
      if (savedScroll && !isNaN(savedScroll) && savedScroll > 40 && !targetHadisId && !readHadisHash()) {
        setTimeout(() => {
          window.scrollTo({ top: savedScroll, behavior: 'instant' as ScrollBehavior });
        }, 80);
      }
    } catch {}

    const handleScroll = () => {
      try {
        const y = Math.round(window.scrollY);
        sessionStorage.setItem('hadis_scroll_y', String(y));
        localStorage.setItem('hadis_scroll_y', String(y));
      } catch {}
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [targetHadisId]);

  // Filtrelenmiş ve Sıralanmış Hadisler (7. Mod sıralaması 1–6 modların tamamına yansır)
  const filteredHadisler = useMemo(
    () =>
      filterAndSortHadisler(allHadisler, {
        searchQuery,
        category: selectedCategory,
        quickFilter,
        sortBy,
        customOrderIds
      }),
    [allHadisler, searchQuery, selectedCategory, quickFilter, sortBy, customOrderIds]
  );

  useEffect(() => {
    if (sharedHadisId === null || !allHadisler.some(h => h.id === sharedHadisId)) return;
    setSearchQuery(''); setQuickFilter('all'); setSelectedCategory('all');
    // Do not overwrite the user's saved sort preference when following a share link.
    setUiAlt(2);
  }, [sharedHadisId]);

  const safeFocusedIndex = useMemo(() => {
    if (filteredHadisler.length === 0) return 0;
    return Math.min(focusedIndex, filteredHadisler.length - 1);
  }, [focusedIndex, filteredHadisler.length]);

  const sharedIndex = sharedHadisId === null ? -1 : filteredHadisler.findIndex(h => h.id === sharedHadisId);
  const activeHadis = filteredHadisler[sharedIndex >= 0 ? sharedIndex : safeFocusedIndex] || allHadisler[0];
  // Always reflect the focused hadith in the address bar without adding
  // a history entry for incidental rerenders or filter changes.
  useEffect(() => {
    if (!activeHadis || !window.location.hash.startsWith('#hadis')) return;
    const next = `#hadis/${activeHadis.id}`;
    if (window.location.hash === next) return;
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}${next}`);
  }, [activeHadis?.id]);

  const selectHadisIndex = (index: number) => {
    const item = filteredHadisler[index];
    if (!item) return;
    setSharedHadisId(null);
    setFocusedIndex(index);
    if (window.location.hash !== `#hadis/${item.id}`) {
      window.history.pushState(window.history.state, '', `${window.location.pathname}${window.location.search}#hadis/${item.id}`);
    }
  };
  useEffect(() => {
    if (sharedIndex < 0) return;
    setFocusedIndex(sharedIndex);
    const timeout = window.setTimeout(() => document.getElementById(`hadis-card-${sharedHadisId}`)?.scrollIntoView({behavior:'smooth',block:'center'}), 180);
    return () => window.clearTimeout(timeout);
  }, [sharedIndex, sharedHadisId, uiAlt]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('hadis_active_ui_mode_v2', String(uiAlt));
      localStorage.setItem('hadis_sort_by', sortBy);
      localStorage.setItem('hadis_focused_index', String(safeFocusedIndex));
    } catch {}
  }, [uiAlt, sortBy, safeFocusedIndex]);

  // 6. KULLANICI AKSİYON YÖNETİCİLERİ
  const updateOverlay = useCallback((id: number, patch: Partial<HadisUserOverlay>) => {
    setOverlays((prev) => {
      const current = prev[id] || {};
      const next = {
        ...prev,
        [id]: { ...current, ...patch }
      };
      saveUserHadisOverlays(next);
      return next;
    });
  }, []);

  const handleToggleFavorite = useCallback(
    (id: number) => {
      const target = allHadisler.find((h) => h.id === id);
      const nextFav = !target?.isFavorite;
      updateOverlay(id, { isFavorite: nextFav });
      if (nextFav && target) {
        setActivityLogs(logHadisActivity(id, 'favorite', target.kategori));
      }
    },
    [allHadisler, updateOverlay]
  );

  const handleToggleMemorized = useCallback(
    (id: number) => {
      const target = allHadisler.find((h) => h.id === id);
      const nextMem = !target?.isMemorized;
      updateOverlay(id, {
        isMemorized: nextMem,
        memorizedAt: nextMem ? new Date().toISOString() : undefined
      });
      if (nextMem && target) {
        setActivityLogs(logHadisActivity(id, 'memorize', target.kategori));
      }
    },
    [allHadisler, updateOverlay]
  );

  const handleIncrementReview = useCallback(
    (id: number) => {
      const target = allHadisler.find((h) => h.id === id);
      const nextCount = (target?.reviewCount || 0) + 1;
      updateOverlay(id, {
        reviewCount: nextCount,
        lastReviewedAt: new Date().toISOString()
      });
      if (target) {
        setActivityLogs(logHadisActivity(id, 'review', target.kategori));
      }
    },
    [allHadisler, updateOverlay]
  );

  const handleSaveNote = useCallback(
    (id: number, note: string) => {
      const target = allHadisler.find((h) => h.id === id);
      updateOverlay(id, { userNote: note });
      if (note && target) {
        setActivityLogs(logHadisActivity(id, 'note', target.kategori));
      }
    },
    [allHadisler, updateOverlay]
  );

  const handleRecordQuizAnswer = useCallback(
    (hadisId: number, isCorrect: boolean, kategori: string) => {
      setActivityLogs(
        logHadisActivity(hadisId, isCorrect ? 'quiz_correct' : 'quiz_wrong', kategori)
      );
    },
    []
  );

  // 7. CANLI VE DİNAMİK SIRALAMA MOTORU (Sürükle-Bırak, Oklarla Taşıma, Sıra Numarası Yazma)
  const moveItemInFilteredList = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= filteredHadisler.length ||
        toIndex >= filteredHadisler.length ||
        fromIndex === toIndex
      ) {
        return;
      }

      // Mevcut sıralamayı baz alarak yeni tam sıralama dizisini üret
      const fullCurrentOrderedIds = filterAndSortHadisler(allHadisler, {
        searchQuery: '',
        category: 'all',
        quickFilter: 'all',
        sortBy,
        customOrderIds
      }).map((h) => h.id);

      const currentFilteredIds = filteredHadisler.map((h) => h.id);
      const reorderedFilteredIds = [...currentFilteredIds];
      const [movedId] = reorderedFilteredIds.splice(fromIndex, 1);
      reorderedFilteredIds.splice(toIndex, 0, movedId);

      const filteredSet = new Set(currentFilteredIds);
      let replacementPointer = 0;
      const nextMasterIds = fullCurrentOrderedIds.map((id) => {
        if (filteredSet.has(id)) {
          return reorderedFilteredIds[replacementPointer++];
        }
        return id;
      });

      setCustomOrderIds(nextMasterIds);
      saveCustomHadisOrder(nextMasterIds);
      if (sortBy !== 'custom') {
        setSortBy('custom');
      }
    },
    [filteredHadisler, allHadisler, sortBy, customOrderIds]
  );

  const handleDragStartItem = useCallback((e: React.DragEvent, id: number) => {
    setDraggedHadisId(id);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(id));
    } catch {}
  }, []);

  const handleDragEnterOrOverItem = useCallback(
    (e: React.DragEvent, targetId: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (draggedHadisId === null || draggedHadisId === targetId) return;

      const fromIdx = filteredHadisler.findIndex((h) => h.id === draggedHadisId);
      const toIdx = filteredHadisler.findIndex((h) => h.id === targetId);
      if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
        moveItemInFilteredList(fromIdx, toIdx);
      }
    },
    [draggedHadisId, filteredHadisler, moveItemInFilteredList]
  );

  const handleDragEndItem = useCallback(() => {
    setDraggedHadisId(null);
  }, []);

  // 8. ÖZEL SIRALAMA SEPETİ ("Listeye Seç") YÖNETİCİLERİ
  const handleToggleSelectForList = useCallback((id: number) => {
    setSelectedIdsForExport((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleMoveSelectedInBasket = useCallback((index: number, direction: -1 | 1) => {
    setSelectedIdsForExport((prev) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  }, []);

  const handleApplyBasketOrderToMainList = useCallback(() => {
    if (selectedIdsForExport.length === 0) return;
    const currentFullOrder = filterAndSortHadisler(allHadisler, {
      searchQuery: '',
      category: 'all',
      quickFilter: 'all',
      sortBy,
      customOrderIds
    }).map((h) => h.id);

    const remainingIds = currentFullOrder.filter(
      (id) => !selectedIdsForExport.includes(id)
    );
    const nextMasterOrder = [...selectedIdsForExport, ...remainingIds];

    setCustomOrderIds(nextMasterOrder);
    saveCustomHadisOrder(nextMasterOrder);
    setSortBy('custom');
    setAppliedBasketNotice(true);
    setTimeout(() => setAppliedBasketNotice(false), 2500);
  }, [selectedIdsForExport, allHadisler, sortBy, customOrderIds]);

  // Seçilen Hadisler Paneli (Özel Sıralama Sepeti) içindeki hadis nesneleri (kendi özel sıralamalarıyla)
  const selectedBasketItems = useMemo(() => {
    return selectedIdsForExport
      .map((id) => allHadisler.find((h) => h.id === id))
      .filter((h): h is HadisItem => Boolean(h));
  }, [selectedIdsForExport, allHadisler]);

  // 7. Mod Tablosundan İndirme Yapılırken Baz Alınacak Liste (Tablodaki mevcut sıralama veya seçilenler)
  const itemsToExportFromMode7 = useMemo(() => {
    const baseList = filteredHadisler.length > 0 ? filteredHadisler : allHadisler;
    if (selectedIdsForExport.length > 0) {
      return baseList.filter((h) => selectedIdsForExport.includes(h.id));
    }
    return baseList;
  }, [selectedIdsForExport, filteredHadisler, allHadisler]);

  const toggleTheme = (newTheme: HadisTheme) => {
    setTheme(newTheme);
    broadcastThemeChange(newTheme === 'dark');
  };

  const toggleViewMode = (newMode: HadisViewMode) => {
    setViewMode(newMode);
    try {
      localStorage.setItem('hadis_view_mode', newMode);
    } catch {}
  };

  // Yalnızca Arapça metin boyutunu bağımsız büyütür / küçültür
  const adjustArabicScale = (delta: number) => {
    const next = Math.max(80, Math.min(240, arabicScalePercent + delta));
    setArabicScalePercent(next);
    try {
      localStorage.setItem('hadis_arabic_scale', String(next));
    } catch {}
  };

  // Yalnızca Meal (Türkçe çeviri) metin boyutunu bağımsız büyütür / küçültür
  const adjustMealScale = (delta: number) => {
    const next = Math.max(75, Math.min(220, mealScalePercent + delta));
    setMealScalePercent(next);
    try {
      localStorage.setItem('hadis_meal_scale', String(next));
    } catch {}
    if (delta > 0 && textSizeLevel < 3) {
      const nl = textSizeLevel + 1;
      setTextSizeLevel(nl);
      try {
        localStorage.setItem('hadis_text_size_level', String(nl));
      } catch {}
    } else if (delta < 0 && textSizeLevel > 0) {
      const nl = textSizeLevel - 1;
      setTextSizeLevel(nl);
      try {
        localStorage.setItem('hadis_text_size_level', String(nl));
      } catch {}
    }
  };

  const inlineMealStyle = useMemo(
    () => ({
      fontSize: `${Math.round(13.5 * (mealScalePercent / 100))}px`,
      lineHeight: 1.55
    }),
    [mealScalePercent]
  );

  const handleCopyDeeplink = () => {
    if (typeof window === 'undefined') return;
    if (!activeHadis) return;
    const url = `${window.location.origin}${window.location.pathname}#hadis/${activeHadis.id}`;
    if (!navigator.clipboard?.writeText) { window.prompt('Hadis bağlantısını kopyalayın:',url); return; }
    navigator.clipboard.writeText(url).then(() => {
      setDeeplinkCopied(true); setTimeout(() => setDeeplinkCopied(false), 2000);
    }).catch(() => window.prompt('Hadis bağlantısını kopyalayın:',url));
  };

  const categories = useMemo(
    () => Array.from(new Set(allHadisler.map((h) => h.kategori))),
    [allHadisler]
  );

  const memorizedTotal = useMemo(
    () => allHadisler.filter((h) => h.isMemorized).length,
    [allHadisler]
  );
  const progressPercent = Math.round((memorizedTotal / allHadisler.length) * 100);

  const isDark = theme === 'dark';
  const currentUiMeta =
    HADIS_UI_ALTERNATIVES.find((u) => u.id === uiAlt) || HADIS_UI_ALTERNATIVES[0];

  const getSelectedOrderForId = useCallback(
    (id: number): number | undefined => {
      const idx = selectedIdsForExport.indexOf(id);
      return idx >= 0 ? idx + 1 : undefined;
    },
    [selectedIdsForExport]
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-200 pb-20 ${
        isDark ? 'bg-[#1b1f27] text-[#f3f4f6]' : 'bg-[#FBF9F5] text-slate-800'
      }`}
    >
      {/* =========================================================================
          1. ÜST HEADER ALANI (Sol üstte "Hadis-i Şerif Ezberle" başlığı,
             tam sağında bağımsız Arapça ve Meal font kontrolleri + görünüm ikonları)
         ========================================================================= */}
      <div
        className={`border-b py-2.5 px-4 sm:px-6 sticky top-16 z-30 backdrop-blur-md ${
          isDark
            ? 'bg-[#252a34]/95 border-[#384152] text-[#f3f4f6] shadow-sm'
            : 'bg-white/95 border-emerald-900/10 text-slate-800 shadow-2xs'
        }`}
      >
        <div
          className={`${
            viewMode === 'desktop' ? 'max-w-[1440px]' : 'max-w-[640px]'
          } mx-auto flex flex-wrap items-center justify-between gap-3`}
        >
          {/* Sol Üst: Sayfa Başlığı ve Hemen Sağında İkon Grubu */}
          <div className="flex items-center flex-wrap gap-3 w-full md:contents">
            <h1
              className={`text-base sm:text-lg lg:text-xl font-bold tracking-tight break-words ${
                isDark ? 'text-[#f8fafc]' : 'text-black'
              } md:order-1`}
            >
              Hadis-i Şerif Ezberle
            </h1>

            <div className="flex items-center flex-wrap gap-1.5 flex-shrink-0 md:order-3 md:ml-0">
              {/* 1. KONTROL: Bağımsız Arapça Yazı Boyutu Kontrolü */}
              <div
                className={`flex items-center gap-1 p-1 px-2 rounded-lg border ${
                  isDark ? 'bg-[#1b1f27] border-[#384152]' : 'bg-slate-100 border-slate-200'
                }`}
                title="Arapça Metin Boyutu (Bağımsız)"
              >
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-0.5 select-none ${
                    isDark ? 'text-[#4ade80]' : 'text-emerald-800'
                  }`}
                >
                  Arapça
                </span>
                <button
                  id="btn-hadis-arabic-font-decrease"
                  type="button"
                  onClick={() => adjustArabicScale(-15)}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    isDark
                      ? 'text-[#cbd5e1] hover:text-white hover:bg-[#252a34]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                  title="Arapça Metin Boyutunu Küçült"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <input
                  id="hadis-arabic-font-scale-slider"
                  type="range"
                  min="80"
                  max="240"
                  step="10"
                  value={arabicScalePercent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setArabicScalePercent(val);
                    try {
                      localStorage.setItem('hadis_arabic_scale', String(val));
                    } catch {}
                  }}
                  className="w-12 sm:w-16 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  title={`Arapça Boyutu: %${arabicScalePercent}`}
                />

                <button
                  id="btn-hadis-arabic-font-increase"
                  type="button"
                  onClick={() => adjustArabicScale(15)}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    isDark
                      ? 'text-[#cbd5e1] hover:text-white hover:bg-[#252a34]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                  title="Arapça Metin Boyutunu Büyüt"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 2. KONTROL: Bağımsız Meal (Türkçe Çeviri) Yazı Boyutu Kontrolü */}
              <div
                className={`flex items-center gap-1 p-1 px-2 rounded-lg border ${
                  isDark ? 'bg-[#1b1f27] border-[#384152]' : 'bg-slate-100 border-slate-200'
                }`}
                title="Meal (Türkçe Çeviri) Metin Boyutu (Bağımsız)"
              >
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-0.5 select-none ${
                    isDark ? 'text-amber-400' : 'text-amber-800'
                  }`}
                >
                  Meal
                </span>
                <button
                  id="btn-hadis-meal-font-decrease"
                  type="button"
                  onClick={() => adjustMealScale(-10)}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    isDark
                      ? 'text-[#cbd5e1] hover:text-white hover:bg-[#252a34]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                  title="Meal Metin Boyutunu Küçült"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <input
                  id="hadis-meal-font-scale-slider"
                  type="range"
                  min="75"
                  max="220"
                  step="5"
                  value={mealScalePercent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMealScalePercent(val);
                    try {
                      localStorage.setItem('hadis_meal_scale', String(val));
                    } catch {}
                  }}
                  className="w-12 sm:w-16 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  title={`Meal Boyutu: %${mealScalePercent}`}
                />

                <button
                  id="btn-hadis-meal-font-increase"
                  type="button"
                  onClick={() => adjustMealScale(10)}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    isDark
                      ? 'text-[#cbd5e1] hover:text-white hover:bg-[#252a34]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                  title="Meal Metin Boyutunu Büyüt"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Masaüstü / Mobil Görünüm Geçiş İkonları */}
              <div
                className={`flex items-center p-1 rounded-lg border ${
                  isDark ? 'bg-[#1b1f27] border-[#384152]' : 'bg-slate-100 border-slate-200'
                }`}
              >
                <button
                  id="btn-hadis-desktop-view"
                  onClick={() => toggleViewMode('desktop')}
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    viewMode === 'desktop'
                      ? isDark
                        ? 'bg-[#1b3a32] text-[#4ade80] border border-[#4ade80]/40'
                        : 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                      : isDark
                      ? 'text-[#cbd5e1] hover:text-[#f8fafc]'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Masaüstü Görünümü"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>

                <button
                  id="btn-hadis-mobile-view"
                  onClick={() => toggleViewMode('mobile')}
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    viewMode === 'mobile'
                      ? isDark
                        ? 'bg-[#1b3a32] text-[#4ade80] border border-[#4ade80]/40'
                        : 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                      : isDark
                      ? 'text-[#cbd5e1] hover:text-[#f8fafc]'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Mobil Görünümü"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Aydınlık / Karanlık Mod Geçiş İkonları */}
              <div
                className={`flex items-center p-1 rounded-lg border ${
                  isDark ? 'bg-[#1b1f27] border-[#384152]' : 'bg-slate-100 border-slate-200'
                }`}
              >
                <button
                  id="btn-hadis-theme-dark"
                  onClick={() => toggleTheme('dark')}
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    isDark
                      ? 'bg-[#1b3a32] text-[#4ade80] border border-[#4ade80]/40'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Karanlık Mod"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>

                <button
                  id="btn-hadis-theme-light"
                  onClick={() => toggleTheme('emerald')}
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    !isDark
                      ? 'bg-white text-emerald-800 shadow-xs border border-emerald-300'
                      : 'text-[#cbd5e1] hover:text-[#f8fafc]'
                  }`}
                  title="Aydınlık Mod"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Deeplink Kopyalama İkonu */}
              <button
                onClick={handleCopyDeeplink}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  deeplinkCopied
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : isDark
                    ? 'bg-[#1b1f27] border-[#384152] text-[#cbd5e1] hover:text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title="Kalıcı Bağlantıyı (Deeplink) Kopyala"
              >
                {deeplinkCopied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Link2 className="w-3.5 h-3.5" />
                )}
              </button>

              {/* YENİ GÖRÜNÜM SEÇİCİ İKONU / BUTONU (7 Temel UI Seçeneği - [8, 1, 2, 4, 11, 9, 5] Sırasıyla) */}
              <div className="relative" ref={uiMenuRef}>
                <button
                  id="btn-hadis-ui-mode-selector"
                  type="button"
                  onClick={() => setIsUiMenuOpen((prev) => !prev)}
                  className={`p-1.5 px-2 rounded-lg border flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                    isUiMenuOpen
                      ? isDark
                        ? 'bg-[#1b3a32] text-[#4ade80] border-[#4ade80]'
                        : 'bg-emerald-800 text-white border-emerald-800'
                      : isDark
                      ? 'bg-[#1b1f27] border-[#384152] text-[#4ade80] hover:text-white hover:border-[#4ade80]/60'
                      : 'bg-slate-100 border-slate-200 text-emerald-800 hover:bg-emerald-50'
                  }`}
                  title={`Görünüm Modu Seç (${currentUiMeta.shortTitle})`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-extrabold">{uiAlt}. Mod</span>
                </button>

                {/* 7 Temel UI Seçeneği Açılır Menüsü */}
                {isUiMenuOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl border p-2.5 shadow-2xl z-50 space-y-1.5 ${
                      isDark
                        ? 'bg-[#252a34] border-[#384152] text-[#f3f4f6]'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between px-2 py-1 border-b border-slate-500/20">
                      <span className={`text-xs font-extrabold ${isDark ? 'text-[#4ade80]' : 'text-emerald-600'}`}>
                        Görünüm Modunu Seçin (7 Seçenek)
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsUiMenuOpen(false)}
                        className={`p-0.5 rounded cursor-pointer ${isDark ? 'text-[#cbd5e1] hover:text-white' : 'opacity-60 hover:opacity-100'}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-0.5">
                      {HADIS_UI_ALTERNATIVES.map((alt) => {
                        const isSelected = uiAlt === alt.id;
                        return (
                          <button
                            key={alt.id}
                            type="button"
                            onClick={() => {
                              setUiAlt(alt.id);
                              setIsUiMenuOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                              isSelected
                                ? isDark
                                  ? 'bg-[#1b3a32] border-[#4ade80] text-white'
                                  : 'bg-emerald-50 border-emerald-600 text-emerald-950'
                                : isDark
                                ? 'bg-[#1b1f27] border-[#384152] hover:border-[#4ade80]/50'
                                : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="text-xs font-bold flex items-center gap-1.5">
                                <span
                                  className={
                                    isSelected
                                      ? isDark
                                        ? 'text-[#4ade80]'
                                        : 'text-emerald-800'
                                      : isDark
                                      ? 'text-[#4ade80]'
                                      : 'text-emerald-600'
                                  }
                                >
                                  {alt.shortTitle}
                                </span>
                              </div>
                              <p className={`text-[11px] line-clamp-2 leading-snug ${isDark ? 'text-[#cbd5e1]' : 'text-slate-600'}`}>
                                {alt.uxSummary}
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                                alt.id === 7
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : isDark
                                  ? 'bg-[#252a34] text-[#e2e8f0] border border-[#384152]'
                                  : 'bg-white text-slate-600 border border-slate-200'
                              }`}
                            >
                              {alt.id === 7 ? 'Sırala & İndir' : 'Okuma & Ezber'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sağ Bölüm: Ezber İlerleme Çubuğu */}
          <div className="flex items-center gap-2.5 flex-1 max-w-xs md:order-2 md:ml-auto md:mr-2">
            <span
              className={`text-xs font-bold whitespace-nowrap tabular-nums ${
                isDark ? 'text-[#4ade80]' : 'text-emerald-700'
              }`}
            >
              İlerleme: %{progressPercent} ({memorizedTotal}/{allHadisler.length})
            </span>
            <div
              className={`flex-1 h-2 rounded-full overflow-hidden ${
                isDark ? 'bg-[#384152]' : 'bg-slate-200'
              }`}
            >
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isDark ? 'bg-[#4ade80]' : 'bg-emerald-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ANA İÇERİK KONTEYNERİ */}
      <div
        className={`${
          viewMode === 'desktop' ? 'max-w-[1400px]' : 'max-w-[640px]'
        } mx-auto w-full px-4 sm:px-6 pt-5 space-y-5`}
      >
        {/* =========================================================================
            2. ÖZEL SIRALAMA SEPETİ — "SEÇİLEN HADİSLER PANELİ"
               (Kartların sağ üstündeki "Listeye Seç" veya tablodan seçim yapıldığında açılır)
           ========================================================================= */}
        {selectedBasketItems.length > 0 && (
          <section
            className={`rounded-2xl border p-4 space-y-3 transition-all ${
              isDark
                ? 'bg-[#252a34] border-amber-500/50 shadow-lg'
                : 'bg-amber-50/70 border-amber-300 shadow-sm'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs sm:text-sm font-extrabold">
                  Seçilen Hadisler Paneli ({selectedBasketItems.length} Hadis Seçildi)
                </span>
                {appliedBasketNotice && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-bold">
                    ✓ Ana Listeye Uygulandı
                  </span>
                )}
              </div>

              <div className="flex items-center flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={handleApplyBasketOrderToMainList}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Bu Sırayı Ana Listeye Uygula
                </button>

                <button
                  type="button"
                  onClick={() =>
                    exportHadislerToPDF(
                      selectedBasketItems,
                      'Seçilen Hadis-i Şerifler Özel Sıralı Raporu'
                    )
                  }
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    isDark
                      ? 'bg-[#1b1f27] border-[#384152] text-rose-400 hover:bg-rose-950/40'
                      : 'bg-white border-rose-200 text-rose-800 hover:bg-rose-50'
                  }`}
                  title="Seçilen hadisleri özel sıralamalarıyla PDF olarak indir"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    exportHadislerToWord(
                      selectedBasketItems,
                      'Seçilen Hadis-i Şerifler Özel Sıralı Dokümanı'
                    )
                  }
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    isDark
                      ? 'bg-[#1b1f27] border-[#384152] text-blue-400 hover:bg-blue-950/40'
                      : 'bg-white border-blue-200 text-blue-800 hover:bg-blue-50'
                  }`}
                  title="Seçilen hadisleri özel sıralamalarıyla Word olarak indir"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Word</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    exportHadislerToExcel(
                      selectedBasketItems,
                      'Seçilen Hadis-i Şerifler Özel Sıralı Tablosu'
                    )
                  }
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    isDark
                      ? 'bg-[#1b1f27] border-[#384152] text-teal-400 hover:bg-teal-950/40'
                      : 'bg-white border-teal-200 text-teal-800 hover:bg-teal-50'
                  }`}
                  title="Seçilen hadisleri özel sıralamalarıyla Excel olarak indir"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedIdsForExport([])}
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                    isDark
                      ? 'bg-[#1b1f27] border-[#384152] text-[#cbd5e1] hover:text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                  title="Seçilenleri Temizle"
                >
                  Temizle
                </button>
              </div>
            </div>

            {/* Seçilen Hadisler Sıralama Kartları (◀ / ▶ oklarıyla sıra değiştirme) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {selectedBasketItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border shrink-0 w-64 flex flex-col justify-between gap-2 ${
                    isDark
                      ? 'bg-[#1b1f27] border-[#384152] text-[#f3f4f6]'
                      : 'bg-white border-amber-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-xs">
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-extrabold">
                      Seçildi (#{idx + 1})
                    </span>
                    <span className={`text-[11px] font-bold ${isDark ? 'text-[#cbd5e1]' : 'text-slate-600'}`}>
                      Hadis #{item.id} · {item.kategori}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleSelectForList(item.id)}
                      className={`cursor-pointer ${isDark ? 'text-[#cbd5e1] hover:text-white' : 'opacity-60 hover:opacity-100'}`}
                      title="Listeden Çıkar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p style={inlineMealStyle} className="line-clamp-2 font-medium">
                    "{item.meali}"
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-500/20">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSelectedInBasket(idx, -1)}
                      className={`px-2 py-0.5 rounded border text-xs font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                        isDark
                          ? 'bg-[#252a34] border-[#384152] text-[#e2e8f0] hover:border-amber-400'
                          : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                      }`}
                      title="Önceki Sıraya Taşı"
                    >
                      ◀
                    </button>
                    <span className={`text-[11px] font-semibold ${isDark ? 'text-[#cbd5e1]' : 'text-slate-500'}`}>
                      Sıra: {idx + 1} / {selectedBasketItems.length}
                    </span>
                    <button
                      type="button"
                      disabled={idx === selectedBasketItems.length - 1}
                      onClick={() => handleMoveSelectedInBasket(idx, 1)}
                      className={`px-2 py-0.5 rounded border text-xs font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                        isDark
                          ? 'bg-[#252a34] border-[#384152] text-[#e2e8f0] hover:border-amber-400'
                          : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                      }`}
                      title="Sonraki Sıraya Taşı"
                    >
                      ▶
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================================
            3. AKILLI ARAMA MOTORU, MOD BAZLI KONTROLLER VE KATEGORİ FİLTRELERİ
               - 1–6. Modlarda: PDF/Word/Excel ve Sıralama kaldırıldı; yerine hover bilgi
                 balonlu "↕ Sırala & İndir (7. Mod)" yönlendirici butonu konuldu.
               - 7. Modda: Sıralama seçici, "↕ Sıralamayı Düzenle (Tutup Sürükle)" ve
                 PDF / Word / Excel indirme butonları aktif.
           ========================================================================= */}
        <section
          className={`rounded-2xl border p-4 space-y-3.5 ${
            isDark ? 'bg-[#252a34] border-[#384152] shadow-sm' : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Gelişmiş ve Akıllı Arama Motoru (Smart Search) */}
            <div className="relative flex-1">
              <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#94a3b8]' : 'text-slate-400'}`} />
              <input
                id="hadis-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Akıllı arama: Hadis meali, Arapça metin, ravi, konu veya kavram yazın (örn: din, İND, namaz, sabır)..."
                className={`w-full pl-10 pr-9 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-[#1b1f27] border-[#384152] text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#4ade80]'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-emerald-600'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${isDark ? 'text-[#cbd5e1] hover:text-white' : 'opacity-60 hover:opacity-100'}`}
                  title="Aramayı Temizle"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mod Bazlı Sağ Kontroller */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* 1–6 NUMARALI MODLAR: Sadece Hover Bilgi Balonlu "↕ Sırala & İndir (7. Mod)" Yönlendirici Butonu */}
              {uiAlt !== 7 ? (
                <div className="relative group inline-block">
                  <button
                    id="btn-goto-mode-7-sort-export"
                    type="button"
                    onClick={() => setUiAlt(7)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      isDark
                        ? 'bg-[#1b1f27] border-[#384152] text-[#4ade80] hover:border-[#4ade80] hover:bg-[#1b3a32]/60'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                    }`}
                  >
                    <span>↕ Sırala & İndir (7. Mod)</span>
                  </button>

                  {/* Sadece Fareyle Üzerine Gelindiğinde (Hover) Açılan Bilgi Balonu (Tooltip) */}
                  <div
                    role="tooltip"
                    className={`pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 absolute bottom-full right-0 mb-2 w-72 p-2.5 rounded-xl border text-[11px] font-medium leading-snug shadow-xl z-50 ${
                      isDark
                        ? 'bg-[#1b1f27] border-[#4ade80]/60 text-[#f3f4f6]'
                        : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  >
                    Sıralama ve PDF/Word/Excel indirme 7. Modda yapılır (tüm modlarda ve indirmelerde geçerli olur).
                  </div>
                </div>
              ) : (
                /* 7. MOD (KOMPAKT TABLO, SIRALAMA & İNDİRME): Tüm Sıralama, Tutup Sürükleme ve İndirme Kontrolleri */
                <>
                  <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <select
                      id="hadis-sort-select"
                      value={sortBy}
                      onChange={(e) => {
                        const nextSort = e.target.value as HadisSortOption;
                        setSortBy(nextSort);
                        // Seçilen sıralamayı ana özel sıralamaya da kaydet ki 1-6 modlarına anında yansısın
                        if (nextSort !== 'custom') {
                          const sortedIds = filterAndSortHadisler(allHadisler, {
                            searchQuery: '',
                            category: 'all',
                            quickFilter: 'all',
                            sortBy: nextSort,
                            customOrderIds
                          }).map((h) => h.id);
                          setCustomOrderIds(sortedIds);
                          saveCustomHadisOrder(sortedIds);
                        }
                      }}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer focus:outline-none ${
                        isDark
                          ? 'bg-[#1b1f27] border-[#384152] text-[#f3f4f6]'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="custom">Sıralama: Özel Tablo Sıralamam</option>
                      <option value="default">Sıralama: Varsayılan (Hadis No)</option>
                      <option value="date">Sıralama: Tarihe Göre</option>
                      <option value="alphabetical">Sıralama: Alfabetik (A-Z)</option>
                      <option value="favorites">Sıralama: Favoriler Üstte</option>
                      <option value="category">Sıralama: Konuya Göre</option>
                      <option value="memorized">Sıralama: Ezberlenenler Üstte</option>
                      <option value="unmemorized">Sıralama: Ezberlenecekler Üstte</option>
                    </select>
                  </div>

                  {/* 7. Mod Canlı Sürükle-Bırak Sıralama Düzenleme Butonu */}
                  <button
                    id="btn-hadis-toggle-reorder"
                    type="button"
                    onClick={() => setIsReorderMode((prev) => !prev)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      isReorderMode
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                        : isDark
                        ? 'bg-[#1b1f27] border-[#384152] text-amber-400 hover:border-amber-400'
                        : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    <span>
                      {isReorderMode
                        ? '✓ Sıralamayı Düzenle (Aktif)'
                        : '↕ Sıralamayı Düzenle (Tutup Sürükle)'}
                    </span>
                  </button>

                  {/* PDF, Word, Excel İndirme Butonları (Yalnızca 7. Modda) */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        exportHadislerToPDF(
                          itemsToExportFromMode7,
                          'Hadis-i Şerif Ezber ve Çalışma Raporu'
                        )
                      }
                      className={`px-2.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1 cursor-pointer ${
                        isDark
                          ? 'bg-[#1b1f27] border-[#384152] text-rose-400 hover:bg-rose-950/40'
                          : 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                      }`}
                      title="Tablodaki mevcut sıralamaya göre PDF çıktısı indir"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        exportHadislerToWord(
                          itemsToExportFromMode7,
                          'Hadis-i Şerif Ezber Dokümanı'
                        )
                      }
                      className={`px-2.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1 cursor-pointer ${
                        isDark
                          ? 'bg-[#1b1f27] border-[#384152] text-blue-400 hover:bg-blue-950/40'
                          : 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
                      }`}
                      title="Tablodaki mevcut sıralamaya göre Word (.doc) çıktısı indir"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Word</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        exportHadislerToExcel(
                          itemsToExportFromMode7,
                          'Hadis-i Şerif Ezber Tablosu'
                        )
                      }
                      className={`px-2.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1 cursor-pointer ${
                        isDark
                          ? 'bg-[#1b1f27] border-[#384152] text-teal-400 hover:bg-teal-950/40'
                          : 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100'
                      }`}
                      title="Tablodaki mevcut sıralamaya göre Excel (.xls) çıktısı indir"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Excel</span>
                    </button>
                  </div>
                </>
              )}

              {/* Ezber Testi & İstatistik Çekmeceleri */}
              <button
                type="button"
                onClick={() =>
                  setActiveDrawer(activeDrawer === 'quiz' ? 'none' : 'quiz')
                }
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeDrawer === 'quiz'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : isDark
                    ? 'bg-[#1b1f27] border-[#384152] text-amber-400 hover:border-amber-400'
                    : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Ezber Testi</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveDrawer(activeDrawer === 'stats' ? 'none' : 'stats')
                }
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeDrawer === 'stats'
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : isDark
                    ? 'bg-[#1b1f27] border-[#384152] text-[#4ade80] hover:border-[#4ade80]'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>1–10 Yıl İstatistik</span>
              </button>
            </div>
          </div>

          {/* Hızlı Filtreler ve Konu Seçici */}
          <div className={`flex items-center justify-between gap-2 flex-wrap pt-1 border-t ${isDark ? 'border-[#384152]' : 'border-slate-200'}`}>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(
                [
                  { id: 'all', label: `Tümü (${allHadisler.length})` },
                  {
                    id: 'favorites',
                    label: `Favoriler (${allHadisler.filter((h) => h.isFavorite).length})`
                  },
                  {
                    id: 'memorized',
                    label: `Ezberlenenler (${memorizedTotal})`
                  },
                  {
                    id: 'unmemorized',
                    label: `Ezberlenecekler (${allHadisler.length - memorizedTotal})`
                  },
                  {
                    id: 'noted',
                    label: `Notlular (${allHadisler.filter((h) => h.userNote.trim() !== '').length})`
                  }
                ] as const
              ).map((qf) => (
                <button
                  key={qf.id}
                  onClick={() => setQuickFilter(qf.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    quickFilter === qf.id
                      ? isDark
                        ? 'bg-[#1b3a32] text-[#4ade80] border border-[#4ade80]/30'
                        : 'bg-emerald-800 text-white'
                      : isDark
                      ? 'text-[#cbd5e1] hover:text-white hover:bg-[#1b1f27]'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {qf.label}
                </button>
              ))}

              <span className={`px-1 ${isDark ? 'text-[#64748b]' : 'text-slate-300'}`}>|</span>

              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCategory === 'all'
                    ? isDark
                      ? 'bg-[#384152] text-white'
                      : 'bg-slate-200 text-slate-900'
                    : isDark
                    ? 'text-[#cbd5e1] hover:text-white hover:bg-[#1b1f27]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tüm Konular
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    selectedCategory === cat
                      ? isDark
                        ? 'bg-[#1b3a32] text-[#4ade80] border border-[#4ade80]/30'
                        : 'bg-emerald-100 text-emerald-900'
                      : isDark
                      ? 'text-[#cbd5e1] hover:text-white hover:bg-[#1b1f27]'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-[#cbd5e1]' : 'text-slate-600'}`}>
              <span className="font-semibold">{currentUiMeta.shortTitle}</span>
              <span className="opacity-40">·</span>
              <span className="tabular-nums">
                Gösterilen: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{filteredHadisler.length}</strong> hadis
              </span>
            </div>
          </div>
        </section>

        {/* Açılır Test veya 1-10 Yıllık İstatistik Çekmecesi */}
        {activeDrawer === 'quiz' && (
          <HadisQuizView
            items={allHadisler}
            isDark={isDark}
            arabicScalePercent={arabicScalePercent}
            mealScalePercent={mealScalePercent}
            onRecordQuizAnswer={handleRecordQuizAnswer}
          />
        )}
        {activeDrawer === 'stats' && (
          <HadisStatsView items={allHadisler} logs={activityLogs} isDark={isDark} />
        )}

        <div onClickCapture={onHadisCardInteraction} className="contents">
        {/* =========================================================================
            4. 7 TEMEL GÖRÜNÜM MODUNUN CANLI RENDER ALANI ([8, 1, 2, 4, 11, 9, 5] Sırasıyla)
           ========================================================================= */}

        {filteredHadisler.length === 0 ? (
          <div
            className={`p-6 sm:p-10 rounded-2xl border text-center space-y-3 ${
              isDark ? 'bg-[#252a34] border-[#384152]' : 'bg-white border-slate-200'
            }`}
          >
            <p className="text-base font-bold">Aramanızla eşleşen hadis-i şerif bulunamadı.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setQuickFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold cursor-pointer"
            >
              Filtreleri Sıfırla
            </button>
          </div>
        ) : null}

        {/* 1. MOD (Eski 8): İki Sütunlu Çalışma Masası (Fihrist ve Detay Görünümü) */}
        {uiAlt === 1 && filteredHadisler.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div
              className={`lg:col-span-5 rounded-2xl border p-3 max-h-[75vh] overflow-y-auto space-y-2 ${
                isDark ? 'bg-[#252a34] border-[#384152]' : 'bg-white border-slate-200'
              }`}
            >
              <div className={`px-2 py-1 text-xs font-bold flex items-center justify-between ${isDark ? 'text-[#cbd5e1]' : 'text-slate-600'}`}>
                <span>Hadis-i Şerif Fihristi ({filteredHadisler.length})</span>
                <span>Okuma & Ezber</span>
              </div>
              {filteredHadisler.map((item, idx) => {
                const selectedOrder = getSelectedOrderForId(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => selectHadisIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      activeHadis?.id === item.id
                        ? isDark
                          ? 'bg-[#1b3a32] border-[#4ade80] text-white'
                          : 'bg-emerald-50 border-emerald-600 text-emerald-950'
                        : isDark
                        ? 'bg-[#1b1f27] border-[#384152] text-[#f3f4f6] hover:border-[#4ade80]/50'
                        : 'bg-slate-50 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className={isDark ? 'text-[#4ade80]' : 'text-emerald-600'}>
                        Sıra #{idx + 1} · Hadis #{item.id} · {item.kategori}
                      </span>
                      <span className="flex items-center gap-1">
                        {selectedOrder ? (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[10px]">
                            Seçildi (#{selectedOrder})
                          </span>
                        ) : null}
                        {item.isMemorized ? '✓ Ezber' : ''} {item.isFavorite ? '♥' : ''}
                      </span>
                    </div>
                    <p style={inlineMealStyle} className="line-clamp-2 font-medium">
                      {item.meali}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-7 lg:sticky lg:top-32 space-y-4">
              <HadisCardItem
                item={activeHadis}
                isDark={isDark}
                arabicScalePercent={arabicScalePercent}
                mealScalePercent={mealScalePercent}
                textSizeLevel={textSizeLevel}
                onToggleFavorite={handleToggleFavorite}
                onToggleMemorized={handleToggleMemorized}
                onIncrementReview={handleIncrementReview}
                onSaveNote={handleSaveNote}
                onToggleSelectForList={handleToggleSelectForList}
                selectedListOrder={getSelectedOrderForId(activeHadis.id)}
                variant="hero"
              />
            </div>
          </div>
        )}

        {/* 2. MOD (Eski 1): Tekli Kart Kaydırma (Odaklı Ezber Görünümü) */}
        {uiAlt === 2 && filteredHadisler.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() =>
                  selectHadisIndex(safeFocusedIndex > 0 ? safeFocusedIndex - 1 : filteredHadisler.length - 1)
                }
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  isDark
                    ? 'bg-[#252a34] border-[#384152] text-[#f3f4f6] hover:border-[#4ade80]'
                    : 'bg-white border-slate-200 hover:border-emerald-600'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Önceki Hadis</span>
              </button>

              <div className="text-xs font-bold tabular-nums">
                Kart {safeFocusedIndex + 1} / {filteredHadisler.length}
              </div>

              <button
                onClick={() =>
                  selectHadisIndex(safeFocusedIndex + 1 < filteredHadisler.length ? safeFocusedIndex + 1 : 0)
                }
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  isDark
                    ? 'bg-[#252a34] border-[#384152] text-[#f3f4f6] hover:border-[#4ade80]'
                    : 'bg-white border-slate-200 hover:border-emerald-600'
                }`}
              >
                <span>Sonraki Hadis</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <HadisCardItem
              item={activeHadis}
              isDark={isDark}
              arabicScalePercent={arabicScalePercent}
              mealScalePercent={mealScalePercent}
              textSizeLevel={textSizeLevel}
              onToggleFavorite={handleToggleFavorite}
              onToggleMemorized={handleToggleMemorized}
              onIncrementReview={handleIncrementReview}
              onSaveNote={handleSaveNote}
              onToggleSelectForList={handleToggleSelectForList}
              selectedListOrder={getSelectedOrderForId(activeHadis.id)}
              variant="hero"
            />
          </div>
        )}

        {/* 3. MOD (Eski 2): Klasik Dikey Liste (Akış Görünümü) */}
        {uiAlt === 3 && filteredHadisler.length > 0 && (
          <div className="space-y-4">
            {filteredHadisler.map((item) => (
              <HadisCardItem
                key={item.id}
                item={item}
                isDark={isDark}
                arabicScalePercent={arabicScalePercent}
                mealScalePercent={mealScalePercent}
                textSizeLevel={textSizeLevel}
                onToggleFavorite={handleToggleFavorite}
                onToggleMemorized={handleToggleMemorized}
                onIncrementReview={handleIncrementReview}
                onSaveNote={handleSaveNote}
                onToggleSelectForList={handleToggleSelectForList}
                selectedListOrder={getSelectedOrderForId(item.id)}
              />
            ))}
          </div>
        )}

        {/* 4. MOD (Eski 4): Çevrilebilir Kart (Ön ve Arka Yüz Ezber Görünümü) */}
        {uiAlt === 4 && filteredHadisler.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHadisler.map((item) => (
              <HadisCardItem
                key={item.id}
                item={item}
                isDark={isDark}
                arabicScalePercent={arabicScalePercent}
                mealScalePercent={mealScalePercent}
                textSizeLevel={textSizeLevel}
                onToggleFavorite={handleToggleFavorite}
                onToggleMemorized={handleToggleMemorized}
                onIncrementReview={handleIncrementReview}
                onSaveNote={handleSaveNote}
                onToggleSelectForList={handleToggleSelectForList}
                selectedListOrder={getSelectedOrderForId(item.id)}
                variant="flip"
              />
            ))}
          </div>
        )}

        {/* 5. MOD (Eski 11): İnteraktif Kelime Gizleme (Hıfz ve Boşluk Doldurma Görünümü) */}
        {uiAlt === 5 && filteredHadisler.length > 0 && (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark ? 'bg-[#252a34] border-[#384152]' : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <h3 className={`text-sm font-bold ${isDark ? 'text-[#4ade80]' : 'text-emerald-600'}`}>
                  Hıfz Maskeleme & Kademeli Boşluk Doldurma Stüdyosu
                </h3>
                <p className={`text-xs ${isDark ? 'text-[#cbd5e1]' : 'text-slate-600'}`}>
                  Gizlenen kelimeleri önce zihninizden okuyun, ardından doğrulamak için kelimenin üzerine tıklayın.
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { ratio: 0, label: '%0 Açık' },
                  { ratio: 0.35, label: '%35 Gizli' },
                  { ratio: 0.65, label: '%65 Gizli' },
                  { ratio: 1, label: '%100 Tam Hıfz' }
                ].map((lvl) => (
                  <button
                    key={lvl.ratio}
                    onClick={() => setClozeRatio(lvl.ratio)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border ${
                      clozeRatio === lvl.ratio
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : isDark
                        ? 'bg-[#1b1f27] border-[#384152] text-[#e2e8f0] hover:border-[#4ade80]'
                        : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredHadisler.map((item) => (
              <HadisCardItem
                key={item.id}
                item={item}
                isDark={isDark}
                arabicScalePercent={arabicScalePercent}
                mealScalePercent={mealScalePercent}
                textSizeLevel={textSizeLevel}
                onToggleFavorite={handleToggleFavorite}
                onToggleMemorized={handleToggleMemorized}
                onIncrementReview={handleIncrementReview}
                onSaveNote={handleSaveNote}
                onToggleSelectForList={handleToggleSelectForList}
                selectedListOrder={getSelectedOrderForId(item.id)}
                variant="cloze"
                maskRatio={clozeRatio}
              />
            ))}
          </div>
        )}

        {/* 6. MOD (Eski 9): Hikâye Akışı (Adım Adım Tam Odak Görünümü) */}
        {uiAlt === 6 && filteredHadisler.length > 0 && (
          <div className="max-w-2xl mx-auto space-y-4">
            {/* İlerleme Çubukları */}
            <div className="flex items-center gap-1">
              {filteredHadisler.slice(0, 16).map((h, idx) => (
                <button
                  key={h.id}
                  onClick={() => selectHadisIndex(idx)}
                  className={`h-1.5 flex-1 rounded-full transition-all cursor-pointer ${
                    idx === safeFocusedIndex
                      ? 'bg-emerald-500'
                      : idx < safeFocusedIndex
                      ? 'bg-emerald-500/40'
                      : isDark
                      ? 'bg-[#384152]'
                      : 'bg-slate-300'
                  }`}
                  title={`Sıra #${idx + 1} · Hadis #${h.id}`}
                />
              ))}
            </div>

            <HadisCardItem
              item={activeHadis}
              isDark={isDark}
              arabicScalePercent={arabicScalePercent}
              mealScalePercent={mealScalePercent}
              textSizeLevel={textSizeLevel}
              onToggleFavorite={handleToggleFavorite}
              onToggleMemorized={handleToggleMemorized}
              onIncrementReview={handleIncrementReview}
              onSaveNote={handleSaveNote}
              onToggleSelectForList={handleToggleSelectForList}
              selectedListOrder={getSelectedOrderForId(activeHadis.id)}
              variant="story"
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  selectHadisIndex(safeFocusedIndex > 0 ? safeFocusedIndex - 1 : filteredHadisler.length - 1)
                }
                className={`py-3 rounded-xl border text-xs font-bold cursor-pointer ${
                  isDark ? 'bg-[#252a34] border-[#384152] text-[#f3f4f6] hover:border-[#4ade80]' : 'bg-white border-slate-200'
                }`}
              >
                ← Önceki Hadis
              </button>
              <button
                onClick={() =>
                  selectHadisIndex(safeFocusedIndex + 1 < filteredHadisler.length ? safeFocusedIndex + 1 : 0)
                }
                className="py-3 rounded-xl bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                Sonraki Hadis →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            7. MOD (Eski 5): KOMPAKT TABLO, SIRALAMA & İNDİRME MERKEZİ
               - Canlı ve dinamik sürükle-bırak (Tutup Sürükle)
               - ▲ / ▼ oklarıyla tek tıkla taşıma
               - Satır içindeki sıra numarasına tıklayarak hedef sıra numarası yazıp taşıma
               - Kart sıralama görünümü desteği (⋮⋮ tutamaç, ▲/▼, Sıra #X -> Taşı)
           ========================================================================= */}
        {uiAlt === 7 && filteredHadisler.length > 0 && (
          <div className="space-y-4">
            {/* 7. Mod Üst Bilgi ve Tablo / Kart Sıralama Görünüm Anahtarı */}
            <div
              className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
                isDark ? 'bg-[#252a34] border-[#384152]' : 'bg-white border-slate-200'
              }`}
            >
              <div className="space-y-0.5">
                <div className={`text-xs sm:text-sm font-extrabold flex items-center gap-2 ${isDark ? 'text-[#4ade80]' : 'text-emerald-600'}`}>
                  <span>7. Mod: Kompakt Tablo, Sıralama & İndirme</span>
                  {isReorderMode && (
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[11px]">
                      Canlı Sürükle-Bırak Aktif
                    </span>
                  )}
                </div>
                <p className={`text-xs ${isDark ? 'text-[#cbd5e1]' : 'text-slate-600'}`}>
                  Burada yaptığınız sıralama değişiklikleri anında kaydedilir ve 1–6 numaralı diğer tüm modlara ve PDF/Word/Excel indirmelerine otomatik yansır.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMode7SubView('table')}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                    mode7SubView === 'table'
                      ? isDark
                        ? 'bg-[#1b3a32] text-[#4ade80] border-[#4ade80]'
                        : 'bg-emerald-800 text-white border-emerald-800'
                      : isDark
                      ? 'bg-[#1b1f27] border-[#384152] text-[#cbd5e1] hover:text-white'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  Kompakt Tablo
                </button>
                <button
                  type="button"
                  onClick={() => setMode7SubView('cards')}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                    mode7SubView === 'cards'
                      ? isDark
                        ? 'bg-[#1b3a32] text-[#4ade80] border-[#4ade80]'
                        : 'bg-emerald-800 text-white border-emerald-800'
                      : isDark
                      ? 'bg-[#1b1f27] border-[#384152] text-[#cbd5e1] hover:text-white'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  Kart Sıralama Görünümü
                </button>
              </div>
            </div>

            {mode7SubView === 'table' ? (
              <div
                className={`rounded-2xl border overflow-hidden ${
                  isDark ? 'bg-[#252a34] border-[#384152]' : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr
                        className={`border-b text-xs ${
                          isDark ? 'bg-[#1b1f27] border-[#384152] text-[#e2e8f0]' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <th className="p-3 w-44">Sıra & Taşı</th>
                        <th className="p-3 w-28">Listeye Seç</th>
                        <th className="p-3 w-16">Hadis No</th>
                        <th className="p-3">Konu</th>
                        <th className="p-3">Hadis-i Şerif Meali</th>
                        <th className="p-3 hidden md:table-cell">Kaynak / Ravi</th>
                        <th className="p-3 text-center">Durum</th>
                        <th className="p-3 text-right">Detay</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-[#384152]' : 'divide-slate-200'}`}>
                      {filteredHadisler.map((item, idx) => {
                        const selectedOrder = getSelectedOrderForId(item.id);
                        const isChecked = Boolean(selectedOrder);
                        const isDraggingThis = draggedHadisId === item.id;
                        const isEditingPos = editingRowPositionId === item.id;

                        const commitRowPositionMove = () => {
                          const parsed = parseInt(rowPositionInputVal, 10);
                          if (
                            !isNaN(parsed) &&
                            parsed >= 1 &&
                            parsed <= filteredHadisler.length
                          ) {
                            moveItemInFilteredList(idx, parsed - 1);
                          }
                          setEditingRowPositionId(null);
                        };

                        return (
                          <tr
                            key={item.id}
                            data-hadis-id={item.id}
                            draggable={isReorderMode}
                            onDragStart={(e) => handleDragStartItem(e, item.id)}
                            onDragEnter={(e) => handleDragEnterOrOverItem(e, item.id)}
                            onDragOver={(e) => handleDragEnterOrOverItem(e, item.id)}
                            onDragEnd={handleDragEndItem}
                            className={`transition-colors ${
                              isReorderMode ? 'cursor-grab active:cursor-grabbing' : ''
                            } ${
                              isDraggingThis
                                ? isDark
                                  ? 'bg-emerald-950/60 ring-2 ring-emerald-500'
                                  : 'bg-emerald-100/80 ring-2 ring-emerald-600'
                                : isDark
                                ? 'hover:bg-[#1b1f27]/70'
                                : 'hover:bg-emerald-500/5'
                            }`}
                          >
                            {/* Sıra Numarası, Tutamaç (⋮⋮), ▲ / ▼ Okları ve Satır İçi Hedef Sıra Kutucuğu */}
                            <td className="p-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                {isReorderMode && (
                                  <span
                                    className={`px-1.5 py-0.5 rounded border text-xs font-extrabold select-none ${
                                      isDark
                                        ? 'bg-[#1b1f27] border-[#384152] text-amber-400'
                                        : 'bg-amber-50 border-amber-200 text-amber-800'
                                    }`}
                                    title="Satırı basılı tutup yukarı/aşağı sürükleyin"
                                  >
                                    ⋮⋮
                                  </span>
                                )}

                                {/* ▲ / ▼ Tek Tıkla Taşıma Okları */}
                                <div className="flex items-center gap-0.5">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => moveItemInFilteredList(idx, idx - 1)}
                                    className={`px-1.5 py-0.5 rounded border text-[11px] font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                                      isDark
                                        ? 'bg-[#1b1f27] border-[#384152] text-[#e2e8f0] hover:border-[#4ade80]'
                                        : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                                    }`}
                                    title="Bir Üst Sıraya Taşı (▲)"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === filteredHadisler.length - 1}
                                    onClick={() => moveItemInFilteredList(idx, idx + 1)}
                                    className={`px-1.5 py-0.5 rounded border text-[11px] font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                                      isDark
                                        ? 'bg-[#1b1f27] border-[#384152] text-[#e2e8f0] hover:border-[#4ade80]'
                                        : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                                    }`}
                                    title="Bir Alt Sıraya Taşı (▼)"
                                  >
                                    ▼
                                  </button>
                                </div>

                                {/* Satır İçi Sıra Numarası (Tıklanınca Hedef Sıra Kutucuğu Açılır) */}
                                {!isEditingPos ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingRowPositionId(item.id);
                                      setRowPositionInputVal(String(idx + 1));
                                    }}
                                    className={`px-2 py-0.5 rounded-md border text-xs font-extrabold tabular-nums cursor-pointer transition-colors ${
                                      isDark
                                        ? 'bg-[#1b3a32] border-[#4ade80]/50 text-[#4ade80] hover:bg-[#4ade80] hover:text-slate-950'
                                        : 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-700 hover:text-white'
                                    }`}
                                    title="Hedef sıra numarasını yazarak taşımak için tıklayın"
                                  >
                                    Sıra #{idx + 1}
                                  </button>
                                ) : (
                                  <div
                                    className={`flex items-center gap-1 p-0.5 px-1 rounded-lg border ${
                                      isDark
                                        ? 'bg-[#1b1f27] border-[#4ade80]'
                                        : 'bg-white border-emerald-600'
                                    }`}
                                  >
                                    <input
                                      type="number"
                                      min={1}
                                      max={filteredHadisler.length}
                                      value={rowPositionInputVal}
                                      onChange={(e) => setRowPositionInputVal(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') commitRowPositionMove();
                                        if (e.key === 'Escape') setEditingRowPositionId(null);
                                      }}
                                      autoFocus
                                      className="w-12 px-1 py-0.5 text-xs font-bold text-center bg-transparent focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={commitRowPositionMove}
                                      className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-bold cursor-pointer"
                                    >
                                      Taşı
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingRowPositionId(null)}
                                      className="px-1 text-xs opacity-60 hover:opacity-100 cursor-pointer"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Listeye Seç */}
                            <td className="p-3 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleToggleSelectForList(item.id)}
                                className={`px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                                  isChecked
                                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                                    : isDark
                                    ? 'bg-[#1b1f27] border-[#384152] text-[#cbd5e1] hover:text-white'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {isChecked ? `Seçildi (#${selectedOrder})` : 'Listeye Seç'}
                              </button>
                            </td>

                            <td className={`p-3 font-bold tabular-nums ${isDark ? 'text-[#4ade80]' : 'text-emerald-600'}`}>
                              #{item.id}
                            </td>
                            <td className="p-3 whitespace-nowrap font-semibold">
                              {item.kategori}
                            </td>
                            <td
                              onClick={() => setModalHadisId(item.id)}
                              style={inlineMealStyle}
                              className="p-3 cursor-pointer font-medium line-clamp-1"
                            >
                              {item.meali}
                            </td>
                            <td className={`p-3 hidden md:table-cell text-xs truncate max-w-[200px] ${isDark ? 'text-[#cbd5e1]' : 'text-slate-500'}`}>
                              {item.kaynagi}
                            </td>
                            <td className="p-3 text-center whitespace-nowrap">
                              <button
                                onClick={() => handleToggleMemorized(item.id)}
                                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                                  item.isMemorized
                                    ? isDark
                                      ? 'bg-[#1b3a32] text-[#4ade80] border border-[#4ade80]/30'
                                      : 'bg-emerald-500/20 text-emerald-700'
                                    : isDark
                                    ? 'bg-[#1b1f27] text-[#cbd5e1] border border-[#384152]'
                                    : 'bg-slate-500/15 opacity-70'
                                }`}
                              >
                                {item.isMemorized ? '✓ Ezber' : '○ Bekliyor'}
                              </button>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setModalHadisId(item.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                              >
                                İncele
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* 7. Mod Kart Sıralama Görünümü (Sol üstte ⋮⋮ tutamaç, ▲/▼ oklar, Sıra #X -> Taşı ve Sağ üstte Listeye Seç) */
              <div className="space-y-4">
                {filteredHadisler.map((item, idx) => (
                  <HadisCardItem
                    key={item.id}
                    item={item}
                    isDark={isDark}
                    arabicScalePercent={arabicScalePercent}
                    mealScalePercent={mealScalePercent}
                    textSizeLevel={textSizeLevel}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleMemorized={handleToggleMemorized}
                    onIncrementReview={handleIncrementReview}
                    onSaveNote={handleSaveNote}
                    onToggleSelectForList={handleToggleSelectForList}
                    selectedListOrder={getSelectedOrderForId(item.id)}
                    isReorderMode={true}
                    orderNumber={idx + 1}
                    totalCount={filteredHadisler.length}
                    isDragging={draggedHadisId === item.id}
                    onMoveUp={() => moveItemInFilteredList(idx, idx - 1)}
                    onMoveDown={() => moveItemInFilteredList(idx, idx + 1)}
                    onMoveToPosition={(targetPos) =>
                      moveItemInFilteredList(idx, targetPos - 1)
                    }
                    onDragStart={(e) => handleDragStartItem(e, item.id)}
                    onDragEnter={(e) => handleDragEnterOrOverItem(e, item.id)}
                    onDragOver={(e) => handleDragEnterOrOverItem(e, item.id)}
                    onDragEnd={handleDragEndItem}
                  />
                ))}
              </div>
            )}

            {/* 7. Mod Detay İnceleme Modalı */}
            {modalHadisId !== null && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="max-w-2xl w-full space-y-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setModalHadisId(null)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Kapat</span>
                    </button>
                  </div>
                  {allHadisler
                    .filter((h) => h.id === modalHadisId)
                    .map((h) => (
                      <HadisCardItem
                        key={h.id}
                        item={h}
                        isDark={isDark}
                        arabicScalePercent={arabicScalePercent}
                        mealScalePercent={mealScalePercent}
                        textSizeLevel={textSizeLevel}
                        onToggleFavorite={handleToggleFavorite}
                        onToggleMemorized={handleToggleMemorized}
                        onIncrementReview={handleIncrementReview}
                        onSaveNote={handleSaveNote}
                        onToggleSelectForList={handleToggleSelectForList}
                        selectedListOrder={getSelectedOrderForId(h.id)}
                        variant="hero"
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
