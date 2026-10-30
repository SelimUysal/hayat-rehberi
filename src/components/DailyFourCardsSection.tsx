import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  BookOpen,
  ScrollText,
  Feather,
  ArrowUp,
  ArrowDown,
  EyeOff,
  Eye,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { HistoricalEvent } from '../data/historicalEvents';
import {
  DailyHadisItem,
  DailyAyetItem,
  DailySiirItem,
  SAMPLE_HADIS_POOL,
  SAMPLE_AYET_POOL,
  SAMPLE_SIIR_POOL,
  getRotatingContentForDate
} from '../data/dailyRotatingContent';

export type DailyCardId = 'tarih' | 'hadis' | 'ayet' | 'siir';
export type CardThemeVariant = 'light' | 'emerald' | 'midnight' | 'amber' | 'minimal' | 'osmanli' | 'muvakkithane';

interface DailyFourCardsSectionProps {
  date: Date;
  historicalEvents: HistoricalEvent[];
  variant: CardThemeVariant;
}

const DEFAULT_ORDER: DailyCardId[] = ['tarih', 'hadis', 'ayet', 'siir'];

const CARD_META: Record<DailyCardId, { label: string; shortLabel: string }> = {
  tarih: {
    label: 'Tarihte Bugün • Türkiye, Osmanlı & İslâm Medeniyeti',
    shortLabel: 'Tarihte Bugün'
  },
  hadis: {
    label: 'Günün Hadis-i Şerîfi',
    shortLabel: 'Günün Hadisi'
  },
  ayet: {
    label: "Günün Ayeti • Kur'ân-ı Kerîm Meâli",
    shortLabel: 'Günün Ayeti'
  },
  siir: {
    label: 'Günün Şiiri • Tefekkür & Hikmet',
    shortLabel: 'Günün Şiiri'
  }
};

export const DailyFourCardsSection: React.FC<DailyFourCardsSectionProps> = ({
  date,
  historicalEvents,
  variant
}) => {
  // 1. Kart Sıralaması State (localStorage destekli)
  const [cardOrder, setCardOrder] = useState<DailyCardId[]>(() => {
    try {
      const saved = localStorage.getItem('takvim_daily_cards_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          DEFAULT_ORDER.every((id) => parsed.includes(id)) &&
          parsed.length === DEFAULT_ORDER.length
        ) {
          return parsed as DailyCardId[];
        }
      }
    } catch {}
    return DEFAULT_ORDER;
  });

  // 2. Gizlenen Kartlar State (localStorage destekli)
  const [hiddenCards, setHiddenCards] = useState<DailyCardId[]>(() => {
    try {
      const saved = localStorage.getItem('takvim_daily_cards_hidden');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((id) => DEFAULT_ORDER.includes(id));
        }
      }
    } catch {}
    return [];
  });

  // 3. Veri Havuzları (hadis-data.json, ayet-data.json, siir-data.json ile beslenir)
  const [hadisPool, setHadisPool] = useState<DailyHadisItem[]>(SAMPLE_HADIS_POOL);
  const [ayetPool, setAyetPool] = useState<DailyAyetItem[]>(SAMPLE_AYET_POOL);
  const [siirPool, setSiirPool] = useState<DailySiirItem[]>(SAMPLE_SIIR_POOL);

  // Kullanıcının döngüyü anında test edebilmesi için isteğe bağlı manuel adım kaydırma
  const [hadisStepOffset, setHadisStepOffset] = useState<number>(0);
  const [ayetStepOffset, setAyetStepOffset] = useState<number>(0);
  const [siirStepOffset, setSiirStepOffset] = useState<number>(0);

  // Arapça Hat (Yazı Tipi) Seçimi (Varsayılan: Scheherazade New - Zarif Nesih Hattı)
  const ARABIC_FONTS = [
    { id: 'font-scheherazade', label: 'Nesih Hattı', sizeClass: 'text-2xl sm:text-[28px] md:text-[30px] leading-[2.1]' },
    { id: 'font-lateef', label: 'Mushaf (Lateef)', sizeClass: 'text-3xl sm:text-4xl md:text-[38px] leading-[1.8]' },
    { id: 'font-quran', label: 'Medine Hattı', sizeClass: 'text-xl sm:text-2xl md:text-[26px] leading-[2.2]' },
    { id: 'font-amiri', label: 'Klasik Amiri', sizeClass: 'text-xl sm:text-2xl md:text-[26px] leading-[2.0]' }
  ] as const;

  const [arabicFontIdx, setArabicFontIdx] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('takvim_hadis_arabic_font_idx');
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < 4) return parsed;
      }
    } catch {}
    return 0; // Varsayılan olarak önceki font-amiri yerine Zarif Nesih Hattı (font-scheherazade)
  });

  const cycleArabicFont = () => {
    setArabicFontIdx((prev) => {
      const next = (prev + 1) % ARABIC_FONTS.length;
      try {
        localStorage.setItem('takvim_hadis_arabic_font_idx', String(next));
      } catch {}
      return next;
    });
  };

  const activeArabicFont = ARABIC_FONTS[arabicFontIdx] || ARABIC_FONTS[0];

  // Tarih değiştiğinde manuel test kaydırmalarını sıfırla
  useEffect(() => {
    setHadisStepOffset(0);
    setAyetStepOffset(0);
    setSiirStepOffset(0);
  }, [date.getFullYear(), date.getMonth(), date.getDate()]);

  // JSON Veri Kaynaklarını Yükle (/hadis-data.json, /ayet-data.json, /siir-data.json)
  useEffect(() => {
    let isMounted = true;

    fetch('./hadis-data.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const validHadiths = data.filter(
            (h) => h && h.arapcaMetin && h.okunusu && h.meali
          );
          if (validHadiths.length > 0) {
            setHadisPool(validHadiths);
          }
        }
      })
      .catch(() => {});

    fetch('./ayet-data.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setAyetPool(data);
        }
      })
      .catch(() => {});

    fetch('./siir-data.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setSiirPool(data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Sıralama ve Gizleme Kayıt Fonksiyonları
  const updateOrder = (newOrder: DailyCardId[]) => {
    setCardOrder(newOrder);
    try {
      localStorage.setItem('takvim_daily_cards_order', JSON.stringify(newOrder));
    } catch {}
  };

  const updateHidden = (newHidden: DailyCardId[]) => {
    setHiddenCards(newHidden);
    try {
      localStorage.setItem('takvim_daily_cards_hidden', JSON.stringify(newHidden));
    } catch {}
  };

  // Görünür kartlar listesi
  const visibleCards = useMemo(
    () => cardOrder.filter((id) => !hiddenCards.includes(id)),
    [cardOrder, hiddenCards]
  );

  // Kartı Yukarı / Aşağı Taşıma (Görünür kartlar arasında yer değiştirir)
  const moveCard = (cardId: DailyCardId, direction: 'up' | 'down') => {
    const visibleIdx = visibleCards.indexOf(cardId);
    if (visibleIdx === -1) return;
    const targetVisibleIdx = direction === 'up' ? visibleIdx - 1 : visibleIdx + 1;
    if (targetVisibleIdx < 0 || targetVisibleIdx >= visibleCards.length) return;

    const swapCardId = visibleCards[targetVisibleIdx];
    const newOrder = [...cardOrder];
    const idxA = newOrder.indexOf(cardId);
    const idxB = newOrder.indexOf(swapCardId);
    if (idxA !== -1 && idxB !== -1) {
      newOrder[idxA] = swapCardId;
      newOrder[idxB] = cardId;
      updateOrder(newOrder);
    }
  };

  // Kartı Gizle / Kapat
  const hideCard = (cardId: DailyCardId) => {
    if (!hiddenCards.includes(cardId)) {
      updateHidden([...hiddenCards, cardId]);
    }
  };

  // Gizlenen Kartı Tekrar Aç
  const showCard = (cardId: DailyCardId) => {
    updateHidden(hiddenCards.filter((id) => id !== cardId));
  };

  // Tümünü Varsayılana Sıfırla ve Göster
  const restoreAllCards = () => {
    updateHidden([]);
    updateOrder(DEFAULT_ORDER);
  };

  // Seçili güne ait döngüsel içerikler (Her gün sıradaki içerik, liste sonunda başa döner, yıllarda tekrar etmez)
  const currentHadis = useMemo(
    () => getRotatingContentForDate(hadisPool, date, hadisStepOffset),
    [hadisPool, date, hadisStepOffset]
  );

  const currentAyet = useMemo(
    () => getRotatingContentForDate(ayetPool, date, ayetStepOffset),
    [ayetPool, date, ayetStepOffset]
  );

  const currentSiir = useMemo(
    () => getRotatingContentForDate(siirPool, date, siirStepOffset),
    [siirPool, date, siirStepOffset]
  );

  // Şablon Teması Renk Stilleri
  const styles = {
    light: {
      container: 'bg-stone-50/90 border-stone-200/90 text-stone-900 shadow-2xs',
      header: 'border-stone-200 text-stone-800',
      title: 'text-stone-950 font-extrabold',
      badge: 'bg-emerald-100 text-emerald-950 border-emerald-300 font-extrabold',
      icon: 'text-emerald-800',
      dateText: 'text-stone-700 font-bold',
      descText: 'text-stone-800 font-bold',
      subText: 'text-stone-600',
      dot: 'text-emerald-700',
      innerBox: 'bg-white border-stone-200/90',
      arabicText: 'text-emerald-950',
      poemBox: 'bg-gradient-to-b from-white via-stone-50/80 to-emerald-50/30 border-stone-200/90 text-stone-900',
      authorText: 'text-emerald-900',
      ctrlBtn: 'bg-white hover:bg-stone-200/80 text-stone-700 border-stone-300',
      restoreBar: 'bg-stone-100/90 border-stone-200 text-stone-800'
    },
    emerald: {
      container: 'bg-slate-950/60 border-emerald-800/40 text-emerald-100 backdrop-blur-xs',
      header: 'border-emerald-800/40 text-emerald-300',
      title: 'text-emerald-200 font-extrabold',
      badge: 'bg-emerald-900/80 text-amber-300 border-emerald-700/60 font-extrabold',
      icon: 'text-amber-400',
      dateText: 'text-emerald-300/90 font-bold',
      descText: 'text-slate-100 font-bold',
      subText: 'text-emerald-200/80',
      dot: 'text-amber-400',
      innerBox: 'bg-slate-900/70 border-emerald-800/40',
      arabicText: 'text-amber-300',
      poemBox: 'bg-gradient-to-b from-slate-900/80 to-emerald-950/60 border-emerald-800/50 text-slate-100',
      authorText: 'text-amber-300',
      ctrlBtn: 'bg-slate-900/90 hover:bg-emerald-900/80 text-emerald-200 border-emerald-700/50',
      restoreBar: 'bg-slate-950/80 border-emerald-800/50 text-emerald-200'
    },
    midnight: {
      container: 'bg-slate-950/60 border-indigo-900/50 text-indigo-100 backdrop-blur-xs',
      header: 'border-indigo-800/40 text-indigo-300',
      title: 'text-indigo-200 font-extrabold',
      badge: 'bg-indigo-950 text-cyan-300 border-indigo-700/60 font-extrabold',
      icon: 'text-cyan-400',
      dateText: 'text-indigo-300/90 font-bold',
      descText: 'text-slate-100 font-bold',
      subText: 'text-indigo-200/80',
      dot: 'text-cyan-400',
      innerBox: 'bg-slate-900/70 border-indigo-800/40',
      arabicText: 'text-cyan-300',
      poemBox: 'bg-gradient-to-b from-slate-900/80 to-indigo-950/60 border-indigo-800/50 text-slate-100',
      authorText: 'text-cyan-300',
      ctrlBtn: 'bg-slate-900/90 hover:bg-indigo-900/80 text-indigo-200 border-indigo-700/50',
      restoreBar: 'bg-slate-950/80 border-indigo-800/50 text-indigo-200'
    },
    amber: {
      container: 'bg-stone-950/80 border-amber-800/40 text-amber-100 backdrop-blur-xs',
      header: 'border-amber-800/40 text-amber-300',
      title: 'text-amber-200 font-extrabold',
      badge: 'bg-amber-950/90 text-amber-300 border-amber-700/60 font-extrabold',
      icon: 'text-amber-400',
      dateText: 'text-amber-300/90 font-bold',
      descText: 'text-stone-100 font-bold',
      subText: 'text-amber-200/80',
      dot: 'text-amber-400',
      innerBox: 'bg-stone-900/80 border-amber-800/40',
      arabicText: 'text-amber-300',
      poemBox: 'bg-gradient-to-b from-stone-900/90 to-amber-950/50 border-amber-800/50 text-stone-100',
      authorText: 'text-amber-300',
      ctrlBtn: 'bg-stone-900 hover:bg-amber-900/70 text-amber-200 border-amber-700/50',
      restoreBar: 'bg-stone-950/90 border-amber-800/50 text-amber-200'
    },
    minimal: {
      container: 'bg-zinc-900 border-zinc-700 text-zinc-100',
      header: 'border-zinc-700 text-zinc-200',
      title: 'text-zinc-100 font-extrabold',
      badge: 'bg-zinc-800 text-amber-300 border-zinc-600 font-extrabold',
      icon: 'text-amber-400',
      dateText: 'text-zinc-300 font-bold',
      descText: 'text-zinc-100 font-bold',
      subText: 'text-zinc-300',
      dot: 'text-amber-400',
      innerBox: 'bg-zinc-950/80 border-zinc-700',
      arabicText: 'text-amber-300',
      poemBox: 'bg-zinc-950/90 border-zinc-700 text-zinc-100',
      authorText: 'text-amber-300',
      ctrlBtn: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-600',
      restoreBar: 'bg-zinc-900 border-zinc-700 text-zinc-200'
    },
    osmanli: {
      container: 'bg-[#FAF4E6] border-2 border-[#142952] text-stone-900 shadow-md',
      header: 'border-[#142952]/20 text-[#142952]',
      title: 'text-[#142952] font-serif font-black',
      badge: 'bg-[#1CA39C]/15 text-[#142952] border border-[#1CA39C]/50 font-bold',
      icon: 'text-[#D94126]',
      dateText: 'text-[#5C101E] font-bold',
      descText: 'text-stone-900 font-medium',
      subText: 'text-[#2D6A4F]',
      dot: 'text-[#D94126]',
      innerBox: 'bg-[#FFFDF9] border border-[#142952]/20',
      arabicText: 'text-[#142952]',
      poemBox: 'bg-gradient-to-b from-[#FFFDF9] via-[#FAF4E6] to-[#F5EBD7] border border-[#1CA39C]/50 text-stone-900',
      authorText: 'text-[#5C101E]',
      ctrlBtn: 'bg-[#FAF4E6] hover:bg-[#F5EBD7] text-[#142952] border border-[#142952]/30',
      restoreBar: 'bg-[#FAF4E6] border border-[#142952]/40 text-[#142952]'
    },
    muvakkithane: {
      container: 'bg-[#fcfaf6] border-2 border-[#d4af37]/70 text-stone-900 shadow-md',
      header: 'border-[#e8ddc7] text-[#4a3b19]',
      title: 'text-[#3d2f10] font-serif font-bold',
      badge: 'bg-[#f4ecd8] text-[#5c4716] border-[#d4af37]/60 font-serif font-bold',
      icon: 'text-[#8c6b1c]',
      dateText: 'text-[#7d6537] font-bold',
      descText: 'text-stone-900 font-medium',
      subText: 'text-[#6b5424]',
      dot: 'text-[#8c6b1c]',
      innerBox: 'bg-[#fdfbf7] border border-[#e2d5bc]',
      arabicText: 'text-[#2c220a]',
      poemBox: 'bg-gradient-to-b from-[#fdfbf7] via-[#f9f5ea] to-[#f4ecd8] border border-[#d4af37]/50 text-stone-900',
      authorText: 'text-[#7d6537]',
      ctrlBtn: 'bg-[#f7f2e7] hover:bg-[#efe7d3] text-[#5c4716] border border-[#d4af37]/40',
      restoreBar: 'bg-[#f4ecd8] border border-[#d4af37]/60 text-[#4a3b19]'
    }
  }[variant] || {
    container: 'bg-[#FAF4E6] border-2 border-[#142952] text-stone-900 shadow-md',
    header: 'border-[#142952]/20 text-[#142952]',
    title: 'text-[#142952] font-serif font-black',
    badge: 'bg-[#1CA39C]/15 text-[#142952] border border-[#1CA39C]/50 font-bold',
    icon: 'text-[#D94126]',
    dateText: 'text-[#5C101E] font-bold',
    descText: 'text-stone-900 font-medium',
    subText: 'text-[#2D6A4F]',
    dot: 'text-[#D94126]',
    innerBox: 'bg-[#FFFDF9] border border-[#142952]/20',
    arabicText: 'text-[#142952]',
    poemBox: 'bg-gradient-to-b from-[#FFFDF9] via-[#FAF4E6] to-[#F5EBD7] border border-[#1CA39C]/50 text-stone-900',
    authorText: 'text-[#5C101E]',
    ctrlBtn: 'bg-[#FAF4E6] hover:bg-[#F5EBD7] text-[#142952] border border-[#142952]/30',
    restoreBar: 'bg-[#FAF4E6] border border-[#142952]/40 text-[#142952]'
  };

  const formattedDayMonth = date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long'
  });

  // Sağ Üst Köşe Sıralama (Yukarı/Aşağı) ve Gizleme İkonları
  const renderCardHeaderControls = (
    cardId: DailyCardId,
    extraRightContent?: React.ReactNode
  ) => {
    const vIdx = visibleCards.indexOf(cardId);
    const isFirst = vIdx <= 0;
    const isLast = vIdx === visibleCards.length - 1;

    return (
      <div className="flex max-w-full flex-wrap items-center justify-end gap-1.5 self-end sm:self-auto">
        {extraRightContent}

        <div className="flex items-center gap-1 ml-1">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => moveCard(cardId, 'up')}
            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${styles.ctrlBtn}`}
            title="Bu bölümü yukarı taşı"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            disabled={isLast}
            onClick={() => moveCard(cardId, 'down')}
            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${styles.ctrlBtn}`}
            title="Bu bölümü aşağı taşı"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => hideCard(cardId)}
            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer hover:text-rose-500 ${styles.ctrlBtn}`}
            title="Bu bölümü gizle / kapat (Daha sonra tekrar açabilirsiniz)"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  // 1. DIV: TARİHTE BUGÜN (Mevcut çalışan yapı korundu + sağ üst kontroller eklendi)
  const renderTarihteBugunDiv = () => {
    if (!historicalEvents || historicalEvents.length === 0) return null;

    return (
      <div
        key="card-tarih"
        className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed transition-all ${styles.container}`}
      >
        <div className={`flex items-center justify-between gap-2 mb-2.5 pb-2 border-b ${styles.header}`}>
          <div className="flex items-center gap-1.5 uppercase tracking-wide text-xs sm:text-sm">
            <History className={`w-4 h-4 shrink-0 ${styles.icon}`} />
            <span className={styles.title}>{CARD_META.tarih.label}</span>
          </div>

          {renderCardHeaderControls(
            'tarih',
            <span className={`text-xs font-bold hidden sm:inline ${styles.dateText}`}>
              {formattedDayMonth}
            </span>
          )}
        </div>

        <div className="space-y-2">
          {historicalEvents.map((evt, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm font-bold">
              {evt.year ? (
                <span className={`shrink-0 font-mono text-xs px-1.5 py-0.2 rounded border ${styles.badge}`}>
                  {evt.year}
                </span>
              ) : (
                <span className={`shrink-0 font-black text-sm ${styles.dot}`}>•</span>
              )}
              <span className={styles.descText}>{evt.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 2. DIV: GÜNÜN HADİSİ (Arapça Metin -> Türkçe Okunuş -> Türkçe Anlam & Kaynak)
  const renderGununHadisiDiv = () => {
    const { item, index, total } = currentHadis;

    return (
      <div
        key="card-hadis"
        className={`p-3.5 sm:p-4 rounded-2xl border text-xs leading-relaxed transition-all ${styles.container}`}
      >
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 pb-2 border-b ${styles.header}`}>
          <div className="flex items-center gap-1.5 min-w-0 uppercase tracking-wide text-[10px] sm:text-[11px]">
            <ScrollText className={`w-3.5 h-3.5 shrink-0 ${styles.icon}`} />
            <span className={styles.title}>{CARD_META.hadis.label}</span>
            {item.kategori && (
              <span className={`hidden md:inline-block text-[9px] px-2 py-0.5 rounded-full border normal-case ${styles.badge}`}>
                {item.kategori}
              </span>
            )}
          </div>

          {renderCardHeaderControls(
            'hadis',
            <div className="flex flex-wrap items-center justify-end gap-1 min-w-0">
              <button
                type="button"
                onClick={cycleArabicFont}
                className={`px-2 py-0.5 rounded border text-[10px] font-bold transition-colors cursor-pointer ${styles.ctrlBtn}`}
                title="Arapça Hat Yazı Tipini Değiştir (Nesih / Mushaf Lateef / Medine / Amiri)"
              >
                Hat: {activeArabicFont.label}
              </button>
              <button
                type="button"
                onClick={() => setHadisStepOffset((p) => p - 1)}
                className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer ${styles.ctrlBtn}`}
                title="Önceki Hadis (Döngü Testi)"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${styles.badge}`}>
                #{index + 1}/{total}
              </span>
              <button
                type="button"
                onClick={() => setHadisStepOffset((p) => p + 1)}
                className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer ${styles.ctrlBtn}`}
                title="Sonraki Hadis (Döngü Testi)"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className={`p-3.5 sm:p-4 rounded-xl border space-y-3 ${styles.innerBox}`}>
          {/* 1. Arapça Metin */}
          <p
            dir="rtl"
            className={`${activeArabicFont.id} ${activeArabicFont.sizeClass} font-normal tracking-wide text-right select-text transition-all ${styles.arabicText}`}
          >
            {item.arapcaMetin}
          </p>

          {/* 2. Türkçe Okunuşu */}
          <div className={`pt-2 border-t border-dashed ${styles.header}`}>
            <span className={`text-[10px] font-extrabold uppercase tracking-wider block mb-0.5 ${styles.dateText}`}>
              Türkçe Okunuşu:
            </span>
            <p className={`text-xs sm:text-sm italic font-semibold leading-relaxed ${styles.subText}`}>
              “{item.okunusu}”
            </p>
          </div>

          {/* 3. Türkçe Anlamı (Meâli) ve Kaynağı */}
          <div className={`pt-2 border-t ${styles.header}`}>
            <span className={`text-[10px] font-extrabold uppercase tracking-wider block mb-0.5 ${styles.dateText}`}>
              Türkçe Anlamı (Meâli):
            </span>
            <p className={`text-xs sm:text-sm font-bold leading-relaxed ${styles.descText}`}>
              {item.meali}
            </p>
            <div className="mt-2 flex items-center justify-end">
              <span className={`text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border ${styles.badge}`}>
                Kaynak: {item.kaynagi}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 3. DIV: GÜNÜN AYETİ / KUR'AN-I KERİM MEALİ
  const renderGununAyetiDiv = () => {
    const { item, index, total } = currentAyet;

    return (
      <div
        key="card-ayet"
        className={`p-3.5 sm:p-4 rounded-2xl border text-xs leading-relaxed transition-all ${styles.container}`}
      >
        <div className={`flex items-center justify-between gap-2 mb-3 pb-2 border-b ${styles.header}`}>
          <div className="flex items-center gap-1.5 uppercase tracking-wide text-[10px] sm:text-[11px]">
            <BookOpen className={`w-3.5 h-3.5 shrink-0 ${styles.icon}`} />
            <span className={styles.title}>{CARD_META.ayet.label}</span>
          </div>

          {renderCardHeaderControls(
            'ayet',
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setAyetStepOffset((p) => p - 1)}
                className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer ${styles.ctrlBtn}`}
                title="Önceki Ayet (Döngü Testi)"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${styles.badge}`}>
                #{index + 1}/{total}
              </span>
              <button
                type="button"
                onClick={() => setAyetStepOffset((p) => p + 1)}
                className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer ${styles.ctrlBtn}`}
                title="Sonraki Ayet (Döngü Testi)"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className={`p-4 sm:p-5 rounded-xl border relative overflow-hidden ${styles.innerBox}`}>
          <div className="space-y-3">
            <p className={`text-xs sm:text-sm md:text-[15px] font-bold leading-relaxed tracking-wide ${styles.descText}`}>
              “{item.meal}”
            </p>

            <div className={`pt-2.5 border-t flex items-center justify-between flex-wrap gap-2 ${styles.header}`}>
              <span className={`text-[10px] font-semibold ${styles.subText}`}>
                Kur'ân-ı Kerîm Meâli
              </span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-xl border shadow-2xs ${styles.badge}`}>
                <BookOpen className="w-3.5 h-3.5" />
                <span>
                  {item.sureAdi}, {item.ayetNo}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 4. DIV: GÜNÜN ŞİİRİ (Estetik Ortalanmış Blok + Sağ Altta İtalik Müellif İsmi)
  const renderGununSiiriDiv = () => {
    const { item, index, total } = currentSiir;

    return (
      <div
        key="card-siir"
        className={`p-3.5 sm:p-4 rounded-2xl border text-xs leading-relaxed transition-all ${styles.container}`}
      >
        <div className={`flex items-center justify-between gap-2 mb-3 pb-2 border-b ${styles.header}`}>
          <div className="flex items-center gap-1.5 uppercase tracking-wide text-[10px] sm:text-[11px]">
            <Feather className={`w-3.5 h-3.5 shrink-0 ${styles.icon}`} />
            <span className={styles.title}>{CARD_META.siir.label}</span>
          </div>

          {renderCardHeaderControls(
            'siir',
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSiirStepOffset((p) => p - 1)}
                className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer ${styles.ctrlBtn}`}
                title="Önceki Şiir (Döngü Testi)"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${styles.badge}`}>
                #{index + 1}/{total}
              </span>
              <button
                type="button"
                onClick={() => setSiirStepOffset((p) => p + 1)}
                className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer ${styles.ctrlBtn}`}
                title="Sonraki Şiir (Döngü Testi)"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className={`p-4 sm:p-6 rounded-xl border relative ${styles.poemBox}`}>
          <div className="max-w-xl mx-auto text-center space-y-2">
            {item.baslik && (
              <h4 className={`text-xs sm:text-sm font-extrabold tracking-wide uppercase mb-2 opacity-85 ${styles.authorText}`}>
                — {item.baslik} —
              </h4>
            )}

            <div className={`font-serif text-xs sm:text-sm md:text-[15px] font-bold leading-[1.9] whitespace-pre-line tracking-wide ${styles.descText}`}>
              {item.siir}
            </div>
          </div>

          {/* Sağ Alt Köşe: İtalik Müellif (Yazar) İsmi */}
          <div className="mt-3 pt-2 flex justify-end">
            <span className={`italic font-serif text-xs sm:text-sm font-extrabold tracking-wide ${styles.authorText}`}>
              — {item.muellif}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderCardById = (cardId: DailyCardId) => {
    switch (cardId) {
      case 'tarih':
        return renderTarihteBugunDiv();
      case 'hadis':
        return renderGununHadisiDiv();
      case 'ayet':
        return renderGununAyetiDiv();
      case 'siir':
        return renderGununSiiriDiv();
      default:
        return null;
    }
  };

  return (
    <div className="mt-3 space-y-3">
      {/* Görünür 4 Ana Div (Kullanıcının seçtiği sıralamaya göre) */}
      {visibleCards.map((cardId) => renderCardById(cardId))}

      {/* Gizlenen Divleri Tekrar Açma / Sıralamayı Sıfırlama Kontrol Çubuğu */}
      {hiddenCards.length > 0 && (
        <div
          className={`p-2.5 sm:px-3.5 rounded-xl border text-[11px] flex flex-wrap items-center justify-between gap-2 transition-all ${styles.restoreBar}`}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold opacity-80 mr-1">Gizlenen Bölümler:</span>
            {hiddenCards.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => showCard(id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold text-[11px] transition-all cursor-pointer ${styles.ctrlBtn}`}
                title={`${CARD_META[id].shortLabel} bölümünü tekrar göster`}
              >
                <Eye className="w-3 h-3" />
                <span>+ {CARD_META[id].shortLabel}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={restoreAllCards}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold text-[11px] transition-all cursor-pointer ${styles.ctrlBtn}`}
            title="Tüm gizlenen bölümleri aç ve varsayılan sıralamaya dön"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Tümünü Göster</span>
          </button>
        </div>
      )}
    </div>
  );
};
