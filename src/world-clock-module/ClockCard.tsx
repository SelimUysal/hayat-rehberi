import React, { useRef, useState } from 'react';
import {
  Pin,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Trash2,
  GripVertical,
  Camera,
  X,
  Sun,
  Moon,
  Sparkles,
  Maximize2,
  ArrowUp,
  ArrowDown,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Calendar
} from 'lucide-react';
import {
  CardSizeOption,
  CardUITheme,
  DialDatePosition,
  HandStyle,
  ModuleThemeMode,
  NumeralStyle,
  SecondHandMotion,
  WorldClockCardConfig
} from './types';
import { AnalogClockFace, getDialPalette } from './AnalogClockFace';
import { getTimePartsInTimezone } from './worldCitiesData';

interface ClockCardProps {
  card: WorldClockCardConfig;
  index: number;
  totalCards: number;
  baseNow: Date;
  timeTravelMinutes: number;
  themeMode?: ModuleThemeMode;
  isDragging: boolean;
  isDropTarget: boolean;
  onUpdateCard: (id: string, patch: Partial<WorldClockCardConfig>) => void;
  onResetCardToDefault: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRemoveCard: (id: string) => void;
  onOpenFocusForCard: (id: string) => void;
  onMoveCard: (index: number, direction: 'up' | 'down') => void;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
}

export const UI_THEME_OPTIONS: Array<{
  id: CardUITheme;
  label: string;
  previewClass: string;
}> = [
  {
    id: 'ottoman-iznik',
    label: '1. Osmanlı',
    previewClass: 'bg-[#142952] border-[#1CA39C] text-[#F6EFE2]'
  },
  {
    id: 'crystal-glass',
    label: '2. Kristal Buz',
    previewClass: 'bg-slate-800/70 border-slate-400/50 text-white'
  },
  {
    id: 'royal-obsidian',
    label: '3. Kraliyet Altını',
    previewClass: 'bg-stone-950 border-amber-500/70 text-amber-300'
  },
  {
    id: 'ottoman-emerald',
    label: '4. Zümrüt Saray',
    previewClass: 'bg-emerald-950 border-emerald-400/70 text-emerald-200'
  },
  {
    id: 'midnight-sapphire',
    label: '5. Gece Safiri',
    previewClass: 'bg-blue-950 border-blue-400/70 text-blue-200'
  },
  {
    id: 'nordic-alabaster',
    label: '6. Fildişi Mermer',
    previewClass: 'bg-stone-100 border-stone-400 text-stone-900'
  }
];

// Osmanlı Özel Renkleri + Klasik Horoloji Renkleri
export const NUMERAL_COLOR_SWATCHES = [
  { label: 'Krem / Çini Zemin (Osmanlı)', value: '#F6EFE2' },
  { label: 'Koyu Kobalt (Osmanlı)', value: '#142952' },
  { label: 'Derin Hünkâr Bordosu (Osmanlı)', value: '#5C101E' },
  { label: 'Firuze / Turkuaz (Osmanlı)', value: '#1CA39C' },
  { label: 'Lale Mercanı (Osmanlı)', value: '#D94126' },
  { label: 'Yaprak Yeşili (Osmanlı)', value: '#2D6A4F' },
  { label: 'Klasik Beyaz', value: '#f8fafc' },
  { label: 'Şampanya Altın', value: '#fbbf24' },
  { label: 'Koyu Antrasit', value: '#1e293b' }
];

export const BEZEL_COLOR_SWATCHES = [
  { label: 'Koyu Kobalt (Osmanlı)', value: '#142952' },
  { label: 'Firuze / Turkuaz (Osmanlı)', value: '#1CA39C' },
  { label: 'Derin Hünkâr Bordosu (Osmanlı)', value: '#5C101E' },
  { label: 'Lale Mercanı (Osmanlı)', value: '#D94126' },
  { label: 'Yaprak Yeşili (Osmanlı)', value: '#2D6A4F' },
  { label: 'Krem / Çini Zemin (Osmanlı)', value: '#F6EFE2' },
  { label: 'Kraliyet Altını', value: '#f59e0b' },
  { label: 'Platin Gümüş', value: '#cbd5e1' }
];

export const DIAL_BG_COLOR_SWATCHES = [
  { label: 'Krem / Çini Zemin (Osmanlı)', value: '#F6EFE2' },
  { label: 'Derin Hünkâr Bordosu (Osmanlı)', value: '#5C101E' },
  { label: 'Koyu Kobalt (Osmanlı)', value: '#142952' },
  { label: 'Firuze / Turkuaz (Osmanlı)', value: '#1CA39C' },
  { label: 'Yaprak Yeşili (Osmanlı)', value: '#2D6A4F' },
  { label: 'Lale Mercanı (Osmanlı)', value: '#D94126' },
  { label: 'Gece Laciverti', value: '#0f172a' },
  { label: 'Obsidyen Siyah', value: '#09090b' }
];

export const TICK_COLOR_SWATCHES = [
  { label: 'Derin Hünkâr Bordosu (Osmanlı)', value: '#5C101E' },
  { label: 'Yaprak Yeşili (Osmanlı)', value: '#2D6A4F' },
  { label: 'Firuze / Turkuaz (Osmanlı)', value: '#1CA39C' },
  { label: 'Lale Mercanı (Osmanlı)', value: '#D94126' },
  { label: 'Koyu Kobalt (Osmanlı)', value: '#142952' },
  { label: 'Krem / Çini Zemin (Osmanlı)', value: '#F6EFE2' },
  { label: 'Altın Sarısı', value: '#fbbf24' },
  { label: 'Buz Beyazı', value: '#f8fafc' }
];

export type ColorTargetType =
  | 'numeral'
  | 'bezel'
  | 'dialBg'
  | 'tick'
  | 'hourHand'
  | 'minuteHand';

export const COLOR_TARGET_FULL_LABELS: Record<ColorTargetType, string> = {
  numeral: 'Rakam Rengi',
  bezel: 'Çerçeve Rengi (Bezel)',
  dialBg: 'İç Göbek / Kadran Rengi',
  tick: 'Dakika ve Saat Çizgileri Rengi',
  hourHand: 'Akrep (Saat İbresi) Rengi',
  minuteHand: 'Yelkovan (Dakika İbresi) Rengi'
};

export const UNIFIED_COLOR_SWATCHES: Record<
  ColorTargetType,
  Array<{ label: string; value: string }>
> = {
  numeral: NUMERAL_COLOR_SWATCHES,
  bezel: BEZEL_COLOR_SWATCHES,
  dialBg: DIAL_BG_COLOR_SWATCHES,
  tick: TICK_COLOR_SWATCHES,
  hourHand: NUMERAL_COLOR_SWATCHES,
  minuteHand: TICK_COLOR_SWATCHES
};

export const ClockCard: React.FC<ClockCardProps> = ({
  card,
  index,
  totalCards,
  baseNow,
  timeTravelMinutes,
  themeMode = 'dark',
  isDragging,
  isDropTarget,
  onUpdateCard,
  onResetCardToDefault,
  onTogglePin,
  onRemoveCard,
  onOpenFocusForCard,
  onMoveCard,
  onDragStart,
  onDragEnter,
  onDragEnd
}) => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isDragHandleArmed, setIsDragHandleArmed] = useState(false);
  const [activeColorTarget, setActiveColorTarget] = useState<ColorTargetType>('numeral');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const timeParts = getTimePartsInTimezone(
    baseNow,
    card.location.timezone,
    timeTravelMinutes
  );

  // "5. Fildişi Mermer" veya Aydınlık Modda "1. Kristal Buz" açık zeminlidir; yazıların kaybolmaması için koyu kontrast uygulanır
  const isLightCardTheme =
    card.uiTheme === 'nordic-alabaster' ||
    (themeMode === 'light' && card.uiTheme === 'crystal-glass');
  const defaultDialPalette = getDialPalette(card.uiTheme);

  const subtleBtnClass = isLightCardTheme
    ? 'bg-slate-200/90 hover:bg-slate-300 text-slate-800 border border-slate-300/80'
    : 'bg-white/10 hover:bg-white/20 text-slate-200';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 340;
        canvas.width = maxDim;
        canvas.height = maxDim;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, maxDim, maxDim);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          onUpdateCard(card.id, {
            centerPhotoDataUrl: dataUrl,
            displayType: 'analog'
          });
        }
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Kart boyutuna ve kullanıcının özel saat ölçeğine (clockScalePercent) göre orantılı boyut hesaplama
  const baseAnalogSizeMap: Record<CardSizeOption, number> = {
    sm: 150,
    md: 200,
    lg: 270,
    xl: 340
  };

  const baseDigitalPxMap: Record<CardSizeOption, number> = {
    sm: 34,
    md: 46,
    lg: 64,
    xl: 82
  };

  const scaleMultiplier = (card.clockScalePercent ?? 100) / 100;
  const computedAnalogPx = Math.round(baseAnalogSizeMap[card.cardSize] * scaleMultiplier);
  const computedDigitalMainPx = Math.round(baseDigitalPxMap[card.cardSize] * scaleMultiplier);
  const computedDigitalSecPx = Math.max(14, Math.round(computedDigitalMainPx * 0.46));

  const pad = (n: number) => String(n).padStart(2, '0');
  const displayHours = card.use24Hour ? pad(timeParts.hours24) : pad(timeParts.hours12);
  const displayMinutes = pad(timeParts.minutes);
  const displaySeconds = pad(timeParts.seconds);

  const formatDigitalText = (str: string) => {
    if (card.numeralStyle === 'arabic') {
      const easternDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      return str.replace(/[0-9]/g, (d) => easternDigits[Number(d)]);
    }
    return str;
  };

  const currentPhotoPercent = Math.round((card.centerPhotoScale ?? 0.55) * 100);
  const currentClockScale = card.clockScalePercent ?? 100;
  const isDialDateShown = card.showDialDate !== false;
  const currentDialDatePos: DialDatePosition = card.dialDatePosition || 'right';
  const currentHandStyle: HandStyle = card.handStyle || 'rect';

  // Aydınlık modda "1. Kristal Buz" seçiliyken dijital saat rakam rengi varsayılan açık beyaz (#f8fafc/#ecfdf5) ise görünür koyu renk kullan
  const isDefaultWhiteNumeral =
    !card.numeralColor ||
    card.numeralColor.toLowerCase() === '#f8fafc' ||
    card.numeralColor.toLowerCase() === '#ecfdf5';
  const effectiveDigitalTextColor =
    isLightCardTheme && isDefaultWhiteNumeral
      ? '#0f172a'
      : card.numeralColor || undefined;

  // Tekli (Birleştirilmiş) Renk Seçici için aktif hedef değerleri
  const activeTargetColorValue =
    activeColorTarget === 'numeral'
      ? card.numeralColor || defaultDialPalette.majorTick
      : activeColorTarget === 'bezel'
      ? card.bezelColor || defaultDialPalette.outerRing
      : activeColorTarget === 'dialBg'
      ? card.dialBgColor || defaultDialPalette.dialBgStart
      : activeColorTarget === 'tick'
      ? card.tickColor || defaultDialPalette.majorTick
      : activeColorTarget === 'hourHand'
      ? card.hourHandColor || defaultDialPalette.hourHand
      : card.minuteHandColor || defaultDialPalette.minuteHand;

  const isActiveTargetCustomized =
    activeColorTarget === 'numeral'
      ? Boolean(card.numeralColor && card.numeralColor.toLowerCase() !== '#f8fafc')
      : activeColorTarget === 'bezel'
      ? Boolean(card.bezelColor)
      : activeColorTarget === 'dialBg'
      ? Boolean(card.dialBgColor)
      : activeColorTarget === 'tick'
      ? Boolean(card.tickColor)
      : activeColorTarget === 'hourHand'
      ? Boolean(card.hourHandColor)
      : Boolean(card.minuteHandColor);

  const handleApplyUnifiedColor = (newColor: string) => {
    if (activeColorTarget === 'numeral') {
      onUpdateCard(card.id, { numeralColor: newColor });
    } else if (activeColorTarget === 'bezel') {
      onUpdateCard(card.id, { bezelColor: newColor });
    } else if (activeColorTarget === 'dialBg') {
      onUpdateCard(card.id, { dialBgColor: newColor });
    } else if (activeColorTarget === 'tick') {
      onUpdateCard(card.id, { tickColor: newColor });
    } else if (activeColorTarget === 'hourHand') {
      onUpdateCard(card.id, { hourHandColor: newColor });
    } else if (activeColorTarget === 'minuteHand') {
      onUpdateCard(card.id, { minuteHandColor: newColor });
    }
  };

  const handleResetActiveTargetColor = () => {
    if (activeColorTarget === 'numeral') {
      onUpdateCard(card.id, {
        numeralColor:
          card.uiTheme === 'ottoman-iznik'
            ? '#142952'
            : card.uiTheme === 'nordic-alabaster'
            ? '#1c1917'
            : '#f8fafc'
      });
    } else if (activeColorTarget === 'bezel') {
      onUpdateCard(card.id, { bezelColor: null });
    } else if (activeColorTarget === 'dialBg') {
      onUpdateCard(card.id, { dialBgColor: null });
    } else if (activeColorTarget === 'tick') {
      onUpdateCard(card.id, { tickColor: null });
    } else if (activeColorTarget === 'hourHand') {
      onUpdateCard(card.id, { hourHandColor: null });
    } else if (activeColorTarget === 'minuteHand') {
      onUpdateCard(card.id, { minuteHandColor: null });
    }
  };

  const stopDragPropagation = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      draggable={isDragHandleArmed}
      onDragStart={(e) => {
        if (!isDragHandleArmed) {
          e.preventDefault();
          return;
        }
        onDragStart(index);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragEnter(index);
      }}
      onDragEnd={() => {
        setIsDragHandleArmed(false);
        onDragEnd();
      }}
      className={`wc-card wc-ui-${card.uiTheme} rounded-3xl p-4 sm:p-5 flex flex-col justify-between select-none ${
        isDragging ? 'wc-card-dragging' : ''
      } ${isDropTarget ? 'wc-card-drop-target' : ''}`}
    >
      {/* Üst Köşe Aksiyon ve Pin Çubuğu */}
      <div className="flex items-center justify-between gap-1.5 z-10">
        {/* Sol Köşe: Sürükleme Tutamacı + Pin Butonu */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            onMouseEnter={() => setIsDragHandleArmed(true)}
            onMouseLeave={() => setIsDragHandleArmed(false)}
            onMouseDown={() => setIsDragHandleArmed(true)}
            onMouseUp={() => setIsDragHandleArmed(false)}
            className={`p-1.5 rounded-xl cursor-grab active:cursor-grabbing transition-colors ${
              isLightCardTheme
                ? 'text-stone-500 hover:bg-stone-200/70'
                : 'text-slate-400 hover:bg-white/10'
            }`}
            title="Kartı sıralamak için buradan tutup sürükleyin"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          <button
            type="button"
            onClick={() => onTogglePin(card.id)}
            title={
              card.isPinned
                ? '1 Numaraya Sabitlendi (Odak Modu Ana Saati) - Kaldırmak için tıklayın'
                : '1 Numaraya Sabitle (Pinle) ve Odak Modu Saati Yap'
            }
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              card.isPinned
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : isLightCardTheme
                ? 'bg-stone-200/75 text-stone-700 hover:bg-stone-300/80'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${card.isPinned ? 'fill-current' : ''}`} />
            {index === 0 && (
              <span className="font-mono text-[11px] tabular-nums">#1</span>
            )}
          </button>
        </div>

        {/* Sağ Köşe: Tek Tık Analog/Dijital Geçiş, Detay Toggle, Odak, Özelleştirme, Sil */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() =>
              onUpdateCard(card.id, {
                displayType: card.displayType === 'analog' ? 'digital' : 'analog'
              })
            }
            title="Tek tıkla Analog / Dijital görünüm arasında geçiş yap"
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              isLightCardTheme
                ? 'bg-stone-200/80 text-stone-800 hover:bg-stone-300'
                : 'bg-white/10 text-slate-100 hover:bg-white/20'
            }`}
          >
            {card.displayType === 'analog' ? 'Dijital' : 'Analog'}
          </button>

          <button
            type="button"
            onClick={() => onUpdateCard(card.id, { showDetails: !card.showDetails })}
            title={
              card.showDetails
                ? 'Sade Görünüme Geç (Detayları Gizle)'
                : 'Kart Detaylarını Göster (Gün ve Diğer Saat Dilimleri)'
            }
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              card.showDetails
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40'
                : isLightCardTheme
                ? 'text-stone-600 hover:bg-stone-200/75'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            {card.showDetails ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onOpenFocusForCard(card.id)}
            title="Bu saati Odak Modu'nda tam ekran aç"
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isLightCardTheme
                ? 'text-stone-600 hover:bg-stone-200/75'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsCustomizing((prev) => !prev)}
            title="Kadran, Fotoğraf, Saat Boyutu, Renk ve Rakam Stillerini Özelleştir"
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isCustomizing
                ? 'bg-amber-500 text-slate-950'
                : isLightCardTheme
                ? 'text-stone-600 hover:bg-stone-200/75'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {totalCards > 1 && (
            <button
              type="button"
              onClick={() => onRemoveCard(card.id)}
              title="Bu saat kartını kaldır"
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                isLightCardTheme
                  ? 'text-stone-500 hover:text-rose-600 hover:bg-rose-100/60'
                  : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ORTA-ÜST: ÜLKE BAYRAĞI + ŞEHİR / BAŞKENT VE ÜLKE ADI */}
      <div className="mt-2.5 mb-1 flex items-center justify-center gap-2 text-center px-2">
        <span
          className="text-lg sm:text-xl leading-none shrink-0 drop-shadow-xs"
          role="img"
          aria-label={card.location.country}
        >
          {card.location.flag}
        </span>
        <div className="min-w-0 flex items-baseline gap-1.5 flex-wrap justify-center">
          <span className="text-sm sm:text-base font-extrabold tracking-tight truncate">
            {card.location.city}
          </span>
          <span className="text-xs opacity-65 font-semibold truncate">
            · {card.location.country}
          </span>
        </div>
      </div>

      {/* ANA SAAT GÖRÜNÜMÜ (ANALOG VEYA DİJİTAL) */}
      <div className="my-2 flex flex-col items-center justify-center flex-1 relative min-h-[165px]">
        {card.displayType === 'analog' ? (
          <AnalogClockFace
            clockId={card.id}
            timezone={card.location.timezone}
            timeTravelMinutes={timeTravelMinutes}
            numeralStyle={card.numeralStyle}
            customCardinals={card.customCardinals}
            secondMotion={card.secondMotion}
            handStyle={currentHandStyle}
            uiTheme={card.uiTheme}
            numeralColor={card.numeralColor}
            bezelColor={card.bezelColor}
            dialBgColor={card.dialBgColor}
            tickColor={card.tickColor}
            hourHandColor={card.hourHandColor}
            minuteHandColor={card.minuteHandColor}
            showDialDate={isDialDateShown}
            dialDatePosition={currentDialDatePos}
            centerPhotoDataUrl={card.centerPhotoDataUrl}
            centerPhotoScale={card.centerPhotoScale}
            sizePx={computedAnalogPx}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-5 px-2 text-center w-full overflow-hidden">
            <div
              className="font-mono font-black tracking-tight tabular-nums leading-none flex items-baseline justify-center gap-1 transition-all duration-150"
              style={{
                color: effectiveDigitalTextColor,
                fontSize: `${computedDigitalMainPx}px`
              }}
            >
              <span>{formatDigitalText(`${displayHours}:${displayMinutes}`)}</span>
              {card.showDigitalSeconds && (
                <span
                  className="font-bold opacity-80"
                  style={{ fontSize: `${computedDigitalSecPx}px` }}
                >
                  :{formatDigitalText(displaySeconds)}
                </span>
              )}
              {!card.use24Hour && (
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider opacity-75 ml-1">
                  {timeParts.ampm}
                </span>
              )}
            </div>
          </div>
        )}

        {/* SAĞ ALT KÖŞE: Şık Bayrak + Başkent/Ülke & Saat Dilimi İmzası */}
        <div className="w-full flex items-center justify-between gap-2 mt-2 pt-1 px-1 text-[11px] opacity-80">
          <span className="font-mono tabular-nums opacity-75">
            {card.location.utcOffsetLabel}
          </span>
          <div className="flex items-center gap-1.5 truncate font-semibold">
            <span className="text-sm leading-none">{card.location.flag}</span>
            <span className="truncate">
              {card.location.capital !== card.location.city
                ? `${card.location.country} (${card.location.capital})`
                : card.location.country}
            </span>
          </div>
        </div>
      </div>

      {/* DETAYLAR BÖLÜMÜ (Toggle ile açılıp kapanır) */}
      {card.showDetails && (
        <div
          className={`mt-2 pt-3 border-t transition-all space-y-2.5 ${
            isLightCardTheme ? 'border-stone-300/70' : 'border-white/15'
          }`}
        >
          <div className="flex items-center justify-between gap-2 text-xs opacity-90">
            <div className="truncate">
              <span className="font-semibold">{timeParts.dayName}</span>
              <span aria-hidden="true"> · </span>
              <span>{timeParts.fullDateText}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 font-semibold">
              {timeParts.isDaytime ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-sky-300" />
              )}
              <span>{timeParts.isDaytime ? 'Gündüz' : 'Gece'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[11px] tabular-nums">
                {timeParts.relativeDayLabel} ({timeParts.hourDiffFromLocal})
              </span>
            </div>
          </div>

          {card.location.otherTimezones && card.location.otherTimezones.length > 0 && (
            <div
              className={`rounded-2xl p-2.5 space-y-1.5 ${
                isLightCardTheme ? 'bg-stone-200/55' : 'bg-black/25'
              }`}
            >
              <div className="text-[11px] font-semibold opacity-75 flex items-center justify-between">
                <span>Diğer Saat Dilimleri & Bölgeler</span>
                <span className="font-mono">Canlı</span>
              </div>
              <div className="space-y-1">
                {card.location.otherTimezones.map((tzItem, idx) => {
                  const subTime = getTimePartsInTimezone(
                    baseNow,
                    tzItem.timezone,
                    timeTravelMinutes
                  );
                  return (
                    <div
                      key={`${tzItem.timezone}-${idx}`}
                      className="flex items-center justify-between text-xs gap-2"
                    >
                      <span className="opacity-85 truncate">{tzItem.label}</span>
                      <div className="flex items-center gap-1.5 font-mono tabular-nums shrink-0">
                        <span className="text-[10.5px] opacity-65">
                          {tzItem.utcOffsetLabel}
                        </span>
                        <span className="font-bold">
                          {subTime.formattedTime24}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* KART ÖZELLEŞTİRME PANELİ */}
      {isCustomizing && (
        <div
          draggable={false}
          onDragStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={stopDragPropagation}
          onTouchStart={stopDragPropagation}
          className={`mt-3 pt-3.5 border-t space-y-3.5 text-xs cursor-default ${
            isLightCardTheme ? 'border-stone-300 text-stone-800' : 'border-white/15 text-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              <Sparkles className={`w-3.5 h-3.5 ${isLightCardTheme ? 'text-amber-600' : 'text-amber-400'}`} />
              <span>Saat Tasarımı & Boyut Özelleştirme</span>
            </span>
            <button
              type="button"
              onClick={() => setIsCustomizing(false)}
              className={`p-1 rounded-lg cursor-pointer ${
                isLightCardTheme ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-white/10'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Saat Boyutu İmleci (Normal & Odak Modu) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold opacity-85">
                Saat Boyutu İmleci (Normal & Odak Modu)
              </label>
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-mono text-[11px] font-bold tabular-nums ${
                    isLightCardTheme ? 'text-emerald-700' : 'text-emerald-400'
                  }`}
                >
                  %{currentClockScale}
                </span>
                {currentClockScale !== 100 && (
                  <button
                    type="button"
                    onClick={() => onUpdateCard(card.id, { clockScalePercent: 100 })}
                    className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer ${subtleBtnClass}`}
                  >
                    Sıfırla
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  onUpdateCard(card.id, {
                    clockScalePercent: Math.max(60, currentClockScale - 10)
                  })
                }
                className={`p-1 rounded-lg cursor-pointer ${subtleBtnClass}`}
                title="Saati Küçült"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min="60"
                max="180"
                step="5"
                value={currentClockScale}
                draggable={false}
                onDragStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onMouseDown={stopDragPropagation}
                onTouchStart={stopDragPropagation}
                onChange={(e) =>
                  onUpdateCard(card.id, {
                    clockScalePercent: parseInt(e.target.value, 10)
                  })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <button
                type="button"
                onClick={() =>
                  onUpdateCard(card.id, {
                    clockScalePercent: Math.min(180, currentClockScale + 10)
                  })
                }
                className={`p-1 rounded-lg cursor-pointer ${subtleBtnClass}`}
                title="Saati Büyüt"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 6 Farklı UI Tasarımı Seçimi (6. Osmanlı Tuğra & Çini Dahil) */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold opacity-80">
              Kart UI Tasarımı (6 Hazır Mod · Osmanlı Tuğrası Dahil)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {UI_THEME_OPTIONS.map((themeOpt) => (
                <button
                  key={themeOpt.id}
                  type="button"
                  onClick={() => {
                    const defaultNumeralForTheme =
                      themeOpt.id === 'ottoman-iznik'
                        ? '#142952' // Koyu Kobalt (Krem/Çini zemin üzerinde)
                        : themeOpt.id === 'nordic-alabaster'
                        ? '#1c1917'
                        : themeOpt.id === 'royal-obsidian'
                        ? '#fbbf24'
                        : '#f8fafc';
                    onUpdateCard(card.id, {
                      uiTheme: themeOpt.id,
                      numeralColor: defaultNumeralForTheme,
                      bezelColor: null,
                      dialBgColor: null,
                      tickColor: null,
                      hourHandColor: null,
                      minuteHandColor: null
                    });
                  }}
                  className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold text-left truncate transition-all cursor-pointer ${
                    themeOpt.previewClass
                  } ${
                    card.uiTheme === themeOpt.id
                      ? 'ring-2 ring-emerald-500 scale-[1.02]'
                      : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  {themeOpt.label}
                </button>
              ))}
            </div>
          </div>

          {/* BİRLEŞTİRİLMİŞ KOMPAKT RENK SEÇİCİ (Rakam, Çerçeve, İç Göbek, Dakika Çizgisi, Akrep, Yelkovan) */}
          <div
            className={`rounded-2xl p-2.5 space-y-2 border ${
              isLightCardTheme
                ? 'bg-slate-100/90 border-slate-300/80'
                : 'bg-black/20 border-white/10'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <label className="text-[11px] font-bold opacity-90">
                  Bölge Seç & Renk Uygula
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] opacity-75 uppercase">
                    {activeTargetColorValue}
                  </span>
                  {isActiveTargetCustomized && (
                    <button
                      type="button"
                      onClick={handleResetActiveTargetColor}
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold cursor-pointer ${subtleBtnClass}`}
                      title="Seçili bölgenin rengini tema varsayılanına döndür"
                    >
                      Otomatik
                    </button>
                  )}
                </div>
              </div>

              {/* Başlığın Hemen Altında Seçili Bölgenin Tam İsmi */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="opacity-70">Seçili Bölge:</span>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/30"
                  style={{ backgroundColor: activeTargetColorValue }}
                />
                <span
                  className={`font-bold ${
                    isLightCardTheme ? 'text-emerald-700' : 'text-emerald-400'
                  }`}
                >
                  {COLOR_TARGET_FULL_LABELS[activeColorTarget]}
                </span>
              </div>
            </div>

            {/* 6 Bölge Seçim Sekmesi (Rakamlar, Çerçeve, İç Göbek, Dakika/Çizgi, Akrep, Yelkovan) */}
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  {
                    id: 'numeral',
                    label: 'Rakamlar',
                    color: card.numeralColor || defaultDialPalette.majorTick
                  },
                  {
                    id: 'bezel',
                    label: 'Çerçeve',
                    color: card.bezelColor || defaultDialPalette.outerRing
                  },
                  {
                    id: 'dialBg',
                    label: 'İç Göbek',
                    color: card.dialBgColor || defaultDialPalette.dialBgStart
                  },
                  {
                    id: 'tick',
                    label: 'Dakika Çizgi',
                    color: card.tickColor || defaultDialPalette.majorTick
                  },
                  {
                    id: 'hourHand',
                    label: 'Akrep',
                    color: card.hourHandColor || defaultDialPalette.hourHand
                  },
                  {
                    id: 'minuteHand',
                    label: 'Yelkovan',
                    color: card.minuteHandColor || defaultDialPalette.minuteHand
                  }
                ] as Array<{ id: ColorTargetType; label: string; color: string }>
              ).map((target) => {
                const isSelected = activeColorTarget === target.id;
                return (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => setActiveColorTarget(target.id)}
                    className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer truncate ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                        : subtleBtnClass
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/30"
                      style={{ backgroundColor: target.color }}
                    />
                    <span className="truncate">{target.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Seçili Bölge İçin Tek Ortak Renk Paleti */}
            <div className="flex items-center justify-between gap-1.5 flex-wrap pt-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {UNIFIED_COLOR_SWATCHES[activeColorTarget].map((swatch) => (
                  <button
                    key={swatch.value}
                    type="button"
                    onClick={() => handleApplyUnifiedColor(swatch.value)}
                    title={swatch.label}
                    className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                      activeTargetColorValue.toLowerCase() === swatch.value.toLowerCase()
                        ? 'scale-115 ring-2 ring-emerald-500 border-white'
                        : isLightCardTheme
                        ? 'border-slate-400 hover:scale-105'
                        : 'border-white/40 hover:scale-105'
                    }`}
                    style={{ backgroundColor: swatch.value }}
                  />
                ))}
              </div>
              <label
                className={`px-2 py-0.5 rounded-lg text-[10.5px] font-semibold cursor-pointer flex items-center gap-1 ${subtleBtnClass}`}
                title="Özel renk seçici"
              >
                <span>Özel</span>
                <input
                  type="color"
                  value={activeTargetColorValue}
                  onChange={(e) => handleApplyUnifiedColor(e.target.value)}
                  className="w-4 h-4 border-0 bg-transparent cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* YENİ: LÜKS SAAT KADRAN İÇİ GÜNÜN TARİHİ PENCERESİ (Aç/Kapat & 4 Yön Seçimi) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold opacity-80 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Kadran İçi Günün Tarihi Penceresi</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  onUpdateCard(card.id, { showDialDate: !isDialDateShown })
                }
                className={`px-2.5 py-0.5 rounded-lg text-[10.5px] font-bold transition-colors cursor-pointer ${
                  isDialDateShown
                    ? 'bg-emerald-500 text-slate-950'
                    : isLightCardTheme
                    ? 'bg-stone-200 text-stone-700'
                    : 'bg-white/10 text-slate-300'
                }`}
              >
                {isDialDateShown ? 'Açık' : 'Kapalı'}
              </button>
            </div>

            {isDialDateShown && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 pt-0.5">
                {(
                  [
                    { id: 'top', label: 'Üst Orta' },
                    { id: 'bottom', label: 'Alt Orta' },
                    { id: 'right', label: 'Orta Sağ' },
                    { id: 'left', label: 'Orta Sol' }
                  ] as Array<{ id: DialDatePosition; label: string }>
                ).map((posOpt) => (
                  <button
                    key={posOpt.id}
                    type="button"
                    onClick={() =>
                      onUpdateCard(card.id, { dialDatePosition: posOpt.id })
                    }
                    className={`py-1 px-2 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      currentDialDatePos === posOpt.id
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : isLightCardTheme
                        ? 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
                        : 'bg-white/10 text-slate-200 hover:bg-white/20'
                    }`}
                  >
                    {posOpt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rakam Stili (Türkçe, Roma, Arapça veya Özel 12-3-6-9) */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold opacity-80">
              Rakam Stili & Kadran İndeksleri
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'turkish', label: 'Türkçe (1-12)' },
                  { id: 'roman', label: 'Roma (I-XII)' },
                  { id: 'arabic', label: 'Arapça (١-١٢)' },
                  { id: 'custom12369', label: 'Özel 12-3-6-9' }
                ] as Array<{ id: NumeralStyle; label: string }>
              ).map((styleOpt) => (
                <button
                  key={styleOpt.id}
                  type="button"
                  onClick={() =>
                    onUpdateCard(card.id, { numeralStyle: styleOpt.id })
                  }
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    card.numeralStyle === styleOpt.id
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : isLightCardTheme
                      ? 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20'
                  }`}
                >
                  {styleOpt.label}
                </button>
              ))}
            </div>

            {card.numeralStyle === 'custom12369' && (
              <div className="pt-1.5 space-y-2">
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      { key: 'pos12', placeholder: '12' },
                      { key: 'pos3', placeholder: '3' },
                      { key: 'pos6', placeholder: '6' },
                      { key: 'pos9', placeholder: '9' }
                    ] as const
                  ).map((item) => (
                    <div key={item.key}>
                      <span className="block text-[10px] opacity-70 mb-0.5 text-center">
                        {item.placeholder} Yeri
                      </span>
                      <input
                        type="text"
                        maxLength={4}
                        value={card.customCardinals[item.key]}
                        onChange={(e) =>
                          onUpdateCard(card.id, {
                            customCardinals: {
                              ...card.customCardinals,
                              [item.key]: e.target.value
                            }
                          })
                        }
                        className={`w-full px-1.5 py-1 rounded-lg text-center font-bold text-xs border focus:outline-none ${
                          isLightCardTheme
                            ? 'bg-white border-stone-300 text-stone-900'
                            : 'bg-black/40 border-white/20 text-white'
                        }`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] opacity-70">Hazır:</span>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateCard(card.id, {
                        customCardinals: { pos12: '12', pos3: '3', pos6: '6', pos9: '9' }
                      })
                    }
                    className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${subtleBtnClass}`}
                  >
                    12·3·6·9
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateCard(card.id, {
                        customCardinals: { pos12: 'XII', pos3: 'III', pos6: 'VI', pos9: 'IX' }
                      })
                    }
                    className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${subtleBtnClass}`}
                  >
                    XII·III·VI·IX
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateCard(card.id, {
                        customCardinals: { pos12: 'K', pos3: 'D', pos6: 'G', pos9: 'B' }
                      })
                    }
                    className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${subtleBtnClass}`}
                  >
                    K·D·G·B
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateCard(card.id, {
                        customCardinals: { pos12: '★', pos3: '◆', pos6: '●', pos9: '▲' }
                      })
                    }
                    className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${subtleBtnClass}`}
                  >
                    ★·◆·●·▲
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Analog Akrep/Yelkovan Ucu & Saniye Hareketi veya Dijital Saniye Toggle */}
          {card.displayType === 'analog' ? (
            <div className="space-y-2.5">
              {/* Akrep & Yelkovan Görünümü (Ucu Dikdörtgen vs Ucu Ok) */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold opacity-80">
                  Akrep & Yelkovan Ucu Görünümü
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'rect', label: 'Ucu Dikdörtgen' },
                      { id: 'arrow', label: 'Ucu Ok (Ok Başlı)' }
                    ] as Array<{ id: HandStyle; label: string }>
                  ).map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => onUpdateCard(card.id, { handStyle: h.id })}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        currentHandStyle === h.id
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : subtleBtnClass
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Saniye İbresi Hareketi */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold opacity-80">
                  Saniye İbresi Hareketi
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'tick', label: 'Tik-Tak (Kesikli)' },
                      { id: 'sweep', label: 'Akar (Pürüzsüz)' }
                    ] as Array<{ id: SecondHandMotion; label: string }>
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onUpdateCard(card.id, { secondMotion: m.id })}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        card.secondMotion === m.id
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : subtleBtnClass
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold opacity-80">
                Dijital Saat Seçenekleri
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateCard(card.id, {
                      showDigitalSeconds: !card.showDigitalSeconds
                    })
                  }
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    card.showDigitalSeconds
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : isLightCardTheme
                      ? 'bg-stone-200/80 text-stone-700'
                      : 'bg-white/10 text-slate-200'
                  }`}
                >
                  {card.showDigitalSeconds ? 'Saniye: Açık' : 'Saniye: Kapalı'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateCard(card.id, { use24Hour: !card.use24Hour })
                  }
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    card.use24Hour
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : isLightCardTheme
                      ? 'bg-stone-200/80 text-stone-700'
                      : 'bg-white/10 text-slate-200'
                  }`}
                >
                  {card.use24Hour ? '24 Saat Formatı' : '12 Saat (ÖÖ/ÖS)'}
                </button>
              </div>
            </div>
          )}

          {/* Analog Saat Orta Göbek Özel Fotoğraf Yükleme & Nokta Kadardan Tam Kadrana Boyutlandırma */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold opacity-80">
              Kadran Orta Göbek Fotoğrafı (Nokta Kadar ↔ Tam Kadran)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-[11px] transition-colors cursor-pointer whitespace-nowrap ${
                  isLightCardTheme
                    ? 'bg-amber-500/25 hover:bg-amber-500/35 border border-amber-600/40 text-amber-900'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>
                  {card.centerPhotoDataUrl ? 'Fotoğrafı Değiştir' : 'Özel Fotoğraf Yükle'}
                </span>
              </button>
              {card.centerPhotoDataUrl && (
                <button
                  type="button"
                  onClick={() => onUpdateCard(card.id, { centerPhotoDataUrl: null })}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer whitespace-nowrap ${
                    isLightCardTheme
                      ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-800'
                      : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300'
                  }`}
                >
                  Kaldır
                </button>
              )}
            </div>
            {card.centerPhotoDataUrl && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="opacity-75">Fotoğraf Çapı:</span>
                  <span
                    className={`font-mono font-bold tabular-nums ${
                      isLightCardTheme ? 'text-amber-800' : 'text-amber-400'
                    }`}
                  >
                    %{currentPhotoPercent} {currentPhotoPercent >= 98 ? '(Tam Kadran)' : currentPhotoPercent <= 6 ? '(Nokta)' : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="1.00"
                  step="0.01"
                  value={card.centerPhotoScale ?? 0.55}
                  draggable={false}
                  onDragStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseDown={stopDragPropagation}
                  onTouchStart={stopDragPropagation}
                  onChange={(e) =>
                    onUpdateCard(card.id, {
                      centerPhotoScale: parseFloat(e.target.value)
                    })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => onUpdateCard(card.id, { centerPhotoScale: 0.04 })}
                    className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${subtleBtnClass}`}
                  >
                    Nokta (%4)
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateCard(card.id, { centerPhotoScale: 0.52 })}
                    className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${subtleBtnClass}`}
                  >
                    Orta Göbek (%52)
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateCard(card.id, { centerPhotoScale: 1.0 })}
                    className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${subtleBtnClass}`}
                  >
                    Tam Kadran (%100)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Kart Boyutlandırma ve Sıralama Kontrolleri */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold opacity-80">
                Kart Boyutu (Saat Orantılı Büyür) & Sıra
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => onMoveCard(index, 'up')}
                  title="Yukarı Taşı"
                  className={`p-1 rounded disabled:opacity-30 cursor-pointer ${subtleBtnClass}`}
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={index === totalCards - 1}
                  onClick={() => onMoveCard(index, 'down')}
                  title="Aşağı Taşı"
                  className={`p-1 rounded disabled:opacity-30 cursor-pointer ${subtleBtnClass}`}
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(
                [
                  { id: 'sm', label: 'Küçük' },
                  { id: 'md', label: 'Orta' },
                  { id: 'lg', label: 'Büyük' },
                  { id: 'xl', label: 'Tam En' }
                ] as Array<{ id: CardSizeOption; label: string }>
              ).map((sz) => (
                <button
                  key={sz.id}
                  type="button"
                  onClick={() => onUpdateCard(card.id, { cardSize: sz.id })}
                  className={`py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    card.cardSize === sz.id
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : isLightCardTheme
                      ? 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20'
                  }`}
                >
                  {sz.label}
                </button>
              ))}
            </div>
          </div>

          {/* EN SONDA: TÜM DEĞERLERİ VARSAYILANA (DEFAULT) SIFIRLAMA BUTONU */}
          <div
            className={`pt-2 border-t ${
              isLightCardTheme ? 'border-slate-300/80' : 'border-white/10'
            }`}
          >
            <button
              type="button"
              onClick={() => onResetCardToDefault(card.id)}
              className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                isLightCardTheme
                  ? 'bg-slate-800 text-white hover:bg-slate-900'
                  : 'bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/35 text-rose-200'
              }`}
              title="Bu saat kartındaki tüm renk, çerçeve, iç göbek, tarih konumu, fotoğraf ve boyut ayarlarını varsayılana (default) döndür"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tüm Değerleri Varsayılana Döndür (Default)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
