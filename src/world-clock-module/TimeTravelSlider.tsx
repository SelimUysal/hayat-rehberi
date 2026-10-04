import React from 'react';
import { History, RotateCcw, Clock } from 'lucide-react';
import { ModuleThemeMode } from './types';

interface TimeTravelSliderProps {
  timeTravelMinutes: number;
  onChangeMinutes: (minutes: number) => void;
  themeMode: ModuleThemeMode;
}

export const TimeTravelSlider: React.FC<TimeTravelSliderProps> = ({
  timeTravelMinutes,
  onChangeMinutes,
  themeMode
}) => {
  const isLight = themeMode === 'light';

  const formatOffsetLabel = (mins: number) => {
    if (mins === 0) return 'Canlı (Şu Anki Gerçek Zaman)';
    const sign = mins > 0 ? '+' : '-';
    const absMins = Math.abs(mins);
    const h = Math.floor(absMins / 60);
    const m = absMins % 60;
    if (h > 0 && m > 0) {
      return `${sign}${h} saat ${m} dk (${mins > 0 ? 'İleri' : 'Geri'})`;
    }
    if (h > 0) {
      return `${sign}${h} saat (${mins > 0 ? 'İleri' : 'Geri'})`;
    }
    return `${sign}${m} dakika (${mins > 0 ? 'İleri' : 'Geri'})`;
  };

  const quickPresets = [
    { label: '-6s', mins: -360 },
    { label: '-3s', mins: -180 },
    { label: '-1s', mins: -60 },
    { label: 'Şimdi', mins: 0 },
    { label: '+1s', mins: 60 },
    { label: '+3s', mins: 180 },
    { label: '+6s', mins: 360 }
  ];

  return (
    <div className="wc-glass-panel rounded-2xl px-4 py-3 sm:px-6 sm:py-3.5 shadow-lg transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Sol: Başlık ve Durum */}
        <div className="flex items-center justify-between md:justify-start gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold tracking-tight">
                  Zamanda Yolculuk
                </span>
                <span
                  className={`font-mono text-xs font-extrabold tabular-nums ${
                    timeTravelMinutes === 0
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  · {formatOffsetLabel(timeTravelMinutes)}
                </span>
              </div>
              <p className="text-[11px] opacity-70 hidden sm:block">
                Kaydırıcıyı hareket ettirerek tüm dünya saatlerini aynı anda ileri veya geri sarın
              </p>
            </div>
          </div>

          {timeTravelMinutes !== 0 && (
            <button
              type="button"
              onClick={() => onChangeMinutes(0)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Canlıya Dön</span>
            </button>
          )}
        </div>

        {/* Orta: Zaman Kaydırıcı (Slider) */}
        <div className="flex-1 flex items-center gap-3 max-w-xl">
          <span className="font-mono text-[11px] opacity-70 tabular-nums whitespace-nowrap">
            -12s
          </span>
          <input
            type="range"
            min={-720}
            max={720}
            step={5}
            value={timeTravelMinutes}
            onChange={(e) => onChangeMinutes(parseInt(e.target.value, 10))}
            aria-label="Zamanda yolculuk saat kaydırıcısı"
            className="wc-time-slider"
          />
          <span className="font-mono text-[11px] opacity-70 tabular-nums whitespace-nowrap">
            +12s
          </span>
        </div>

        {/* Sağ: Hızlı Saat Atlama Butonları */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
          {quickPresets.map((preset) => {
            const isActive = timeTravelMinutes === preset.mins;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChangeMinutes(preset.mins)}
                className={`px-2.5 py-1 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : isLight
                    ? 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                    : 'bg-white/10 text-slate-200 hover:bg-white/20'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
