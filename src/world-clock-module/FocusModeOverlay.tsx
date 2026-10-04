import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Pin, Sun, Moon, Eye, EyeOff, ZoomIn, ZoomOut } from 'lucide-react';
import { WorldClockCardConfig } from './types';
import { AnalogClockFace } from './AnalogClockFace';
import { getTimePartsInTimezone } from './worldCitiesData';

interface FocusModeOverlayProps {
  card: WorldClockCardConfig | null;
  baseNow: Date;
  timeTravelMinutes: number;
  showDigitalSubClock: boolean;
  onToggleDigitalSubClock: () => void;
  onUpdateCardScale: (cardId: string, newScalePercent: number) => void;
  onClose: () => void;
  onToggleDisplayType: (id: string) => void;
}

export const FocusModeOverlay: React.FC<FocusModeOverlayProps> = ({
  card,
  baseNow,
  timeTravelMinutes,
  showDigitalSubClock,
  onToggleDigitalSubClock,
  onUpdateCardScale,
  onClose,
  onToggleDisplayType
}) => {
  // Seçilen 1. div (Üst bilgi alanı) ve 2. div (Alt kontrol barı) görünürlük durumları:
  // İlk odak moduna geçildiğinde 6 sn ekranda kalır, sonra gizlenir.
  // Mouse ile üzerine gidildiğinde açılır, mouse üzerinden ayrıldığında 1.5 sn sonra kapanır.
  const [isTopInfoVisible, setIsTopInfoVisible] = useState(true);
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);

  const isTopHoveredRef = useRef(false);
  const isBottomHoveredRef = useRef(false);
  const topHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsTopInfoVisible(true);
    setIsBottomBarVisible(true);

    const initialTimer = setTimeout(() => {
      if (!isTopHoveredRef.current) {
        setIsTopInfoVisible(false);
      }
      if (!isBottomHoveredRef.current) {
        setIsBottomBarVisible(false);
      }
    }, 6000);

    return () => {
      clearTimeout(initialTimer);
      if (topHideTimerRef.current) clearTimeout(topHideTimerRef.current);
      if (bottomHideTimerRef.current) clearTimeout(bottomHideTimerRef.current);
    };
  }, []);

  const handleTopMouseEnter = () => {
    isTopHoveredRef.current = true;
    if (topHideTimerRef.current) {
      clearTimeout(topHideTimerRef.current);
      topHideTimerRef.current = null;
    }
    setIsTopInfoVisible(true);
  };

  const handleTopMouseLeave = () => {
    isTopHoveredRef.current = false;
    if (topHideTimerRef.current) {
      clearTimeout(topHideTimerRef.current);
    }
    topHideTimerRef.current = setTimeout(() => {
      if (!isTopHoveredRef.current) {
        setIsTopInfoVisible(false);
      }
    }, 1500);
  };

  const handleBottomMouseEnter = () => {
    isBottomHoveredRef.current = true;
    if (bottomHideTimerRef.current) {
      clearTimeout(bottomHideTimerRef.current);
      bottomHideTimerRef.current = null;
    }
    setIsBottomBarVisible(true);
  };

  const handleBottomMouseLeave = () => {
    isBottomHoveredRef.current = false;
    if (bottomHideTimerRef.current) {
      clearTimeout(bottomHideTimerRef.current);
    }
    bottomHideTimerRef.current = setTimeout(() => {
      if (!isBottomHoveredRef.current) {
        setIsBottomBarVisible(false);
      }
    }, 1500);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Odak modunda ana sayfa kaydırmasını kilitle ve sağdaki imleci/scrollbar'ı tamamen yok et
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyPosition = document.body.style.position;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.position = originalBodyPosition;
    };
  }, []);

  if (!card) return null;

  const timeParts = getTimePartsInTimezone(
    baseNow,
    card.location.timezone,
    timeTravelMinutes
  );

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

  const scalePercent = card.clockScalePercent ?? 100;
  // Varsayılan 440px baz alınarak kullanıcının imleç ölçeğine (%60 - %180) göre kusursuz vektörel büyütme
  const focusAnalogPx = Math.round(420 * (scalePercent / 100));
  const focusDigitalMainPx = Math.round(96 * (scalePercent / 100));
  const focusDigitalSecPx = Math.round(52 * (scalePercent / 100));

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${card.location.city} Odak Modu`}
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-between p-4 sm:p-8 bg-slate-950/98 backdrop-blur-2xl text-white select-none animate-fadeIn overflow-hidden w-screen h-screen ${
        !isTopInfoVisible && !isBottomBarVisible ? 'cursor-none' : 'cursor-default'
      }`}
    >
      {/* Üst Bilgi ve Çarpı (X) Kapatma Butonu */}
      <div className="w-full max-w-6xl flex items-center justify-between gap-4 shrink-0">
        <div
          onMouseEnter={handleTopMouseEnter}
          onMouseMove={handleTopMouseEnter}
          onMouseLeave={handleTopMouseLeave}
          onClick={(e) => e.stopPropagation()}
          className={`flex items-center gap-3 transition-opacity duration-300 ease-in-out cursor-default ${
            isTopInfoVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="text-3xl sm:text-4xl drop-shadow-sm">{card.location.flag}</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {card.location.city}
              </h2>
              <span className="text-sm sm:text-base text-slate-300 font-medium">
                · {card.location.country}
              </span>
              {card.isPinned && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
                  <Pin className="w-3.5 h-3.5 fill-current" />
                  <span>#1 Sabit Saat</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Başkent: {card.location.capital} · {card.location.utcOffsetLabel} ·{' '}
              {timeParts.dayName}, {timeParts.fullDateText}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          title="Odak Modundan Çık (ESC)"
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-rose-600 text-white text-xs sm:text-sm font-bold border border-white/15 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Kapat (ESC)</span>
        </button>
      </div>

      {/* Orta Alan: Dev Saat Görünümü (İmleç ile İstenildiği Kadar Büyütülebilir) */}
      <div className="flex-1 flex flex-col items-center justify-center w-full my-2 min-h-0">
        {card.displayType === 'analog' ? (
          <div
            className="flex items-center justify-center transition-all duration-150"
            style={{
              width: `min(86vmin, ${focusAnalogPx}px)`,
              height: `min(86vmin, ${focusAnalogPx}px)`
            }}
          >
            <AnalogClockFace
              clockId={`focus-${card.id}`}
              timezone={card.location.timezone}
              timeTravelMinutes={timeTravelMinutes}
              numeralStyle={card.numeralStyle}
              customCardinals={card.customCardinals}
              secondMotion={card.secondMotion}
              handStyle={card.handStyle || 'rect'}
              uiTheme={card.uiTheme}
              numeralColor={card.numeralColor}
              bezelColor={card.bezelColor}
              dialBgColor={card.dialBgColor}
              tickColor={card.tickColor}
              hourHandColor={card.hourHandColor}
              minuteHandColor={card.minuteHandColor}
              showDialDate={card.showDialDate !== false}
              dialDatePosition={card.dialDatePosition || 'right'}
              centerPhotoDataUrl={card.centerPhotoDataUrl}
              centerPhotoScale={card.centerPhotoScale}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center px-4">
            <div
              className="font-mono font-black tracking-tight tabular-nums flex items-baseline justify-center gap-2 sm:gap-3 drop-shadow-2xl leading-none transition-all duration-150"
              style={{
                color: card.numeralColor || '#f8fafc',
                fontSize: `min(18vw, ${focusDigitalMainPx}px)`
              }}
            >
              <span>{formatDigitalText(`${displayHours}:${displayMinutes}`)}</span>
              {card.showDigitalSeconds && (
                <span
                  className="font-bold opacity-80"
                  style={{ fontSize: `min(10vw, ${focusDigitalSecPx}px)` }}
                >
                  :{formatDigitalText(displaySeconds)}
                </span>
              )}
              {!card.use24Hour && (
                <span className="text-lg sm:text-2xl font-semibold opacity-75">
                  {timeParts.ampm}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Analog Saatin Hemen Altında Akan Dijital Saat (Kullanıcı İsterse Gösterir / Gizler) */}
        {showDigitalSubClock && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-5 px-5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-200 cursor-default"
          >
            <span className="text-base leading-none">{card.location.flag}</span>
            <span className="font-mono font-extrabold text-emerald-400 tabular-nums text-lg sm:text-2xl tracking-tight">
              {displayHours}:{displayMinutes}:{displaySeconds}
            </span>
            {!card.use24Hour && (
              <span className="font-mono text-xs font-bold text-amber-300">
                {timeParts.ampm}
              </span>
            )}
            <span aria-hidden="true" className="opacity-40">·</span>
            <span className="inline-flex items-center gap-1 opacity-85">
              {timeParts.isDaytime ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-sky-300" />
              )}
              <span>{timeParts.isDaytime ? 'Gündüz' : 'Gece'}</span>
            </span>
          </div>
        )}
      </div>

      {/* Alt Minimalist Kontrol Barı: Saat Boyutu İmleci + Dijital Saati Göster/Gizle + Kadran Geçişi */}
      <div
        onMouseEnter={handleBottomMouseEnter}
        onMouseMove={handleBottomMouseEnter}
        onMouseLeave={handleBottomMouseLeave}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-4xl rounded-2xl bg-white/6 border border-white/12 backdrop-blur-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 cursor-default shrink-0 transition-opacity duration-300 ease-in-out ${
          isBottomBarVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Sol: Saat Boyutu Büyütme/Küçültme İmleci */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-300 whitespace-nowrap">
            Saat Boyutu:
          </span>
          <button
            type="button"
            onClick={() =>
              onUpdateCardScale(card.id, Math.max(60, scalePercent - 10))
            }
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            title="Saati Küçült"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <input
            type="range"
            min="60"
            max="180"
            step="5"
            value={scalePercent}
            onChange={(e) =>
              onUpdateCardScale(card.id, parseInt(e.target.value, 10))
            }
            className="w-24 sm:w-32 accent-emerald-400 cursor-pointer"
            title="Saat Boyutu İmleci"
          />
          <button
            type="button"
            onClick={() =>
              onUpdateCardScale(card.id, Math.min(180, scalePercent + 10))
            }
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            title="Saati Büyüt"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] font-bold text-emerald-400 tabular-nums w-10">
            %{scalePercent}
          </span>
        </div>

        {/* Sağ: Minimalist "Dijital Saati Göster/Gizle" Toggle & Görünüm Değiştirme */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onToggleDigitalSubClock}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              showDigitalSubClock
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
            title="Odak modunda analog saatin altındaki dijital saati göster veya gizle"
          >
            {showDigitalSubClock ? (
              <Eye className="w-3.5 h-3.5" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
            <span>
              {showDigitalSubClock ? 'Dijital Saati Gizle' : 'Dijital Saati Göster'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onToggleDisplayType(card.id)}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            {card.displayType === 'analog'
              ? 'Tam Ekran Dijital'
              : 'Tam Ekran Analog'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
