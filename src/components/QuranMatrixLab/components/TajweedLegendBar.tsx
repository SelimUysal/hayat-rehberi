import React from 'react';
import { Palette, BookOpen, Sparkles, Eye, EyeOff } from 'lucide-react';
import { ALL_TAJWEED_RULES } from '../data/tajweedRules';

interface TajweedLegendBarProps {
  isTajweedEnabled: boolean;
  onToggleTajweed: (enabled: boolean) => void;
  onOpenTajweedGuide: () => void;
}

export const TajweedLegendBar: React.FC<TajweedLegendBarProps> = ({
  isTajweedEnabled,
  onToggleTajweed,
  onOpenTajweedGuide,
}) => {
  const quickLegendRules = [
    { title: 'İhfâ (Pembe)', color: '#e11d48', bg: 'bg-rose-100 text-rose-800 border-rose-300' },
    { title: 'İzhâr (Mavi)', color: '#0284c7', bg: 'bg-sky-100 text-sky-800 border-sky-300' },
    { title: 'İklâb (Yeşil)', color: '#059669', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { title: 'İdgam-ı Maal-Gunne (Mor)', color: '#9333ea', bg: 'bg-purple-100 text-purple-800 border-purple-300' },
    { title: 'İdgam-ı Bilâ-Gunne (Kehribar)', color: '#d97706', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
    { title: 'Kalkale (Kırmızı)', color: '#dc2626', bg: 'bg-red-100 text-red-800 border-red-300' },
    { title: 'Şemsî/Kamerî (ال)', color: '#ea580c', bg: 'bg-orange-100 text-orange-800 border-orange-300' },
    { title: 'Med Halleri (Turkuaz/4 Elif)', color: '#0d9488', bg: 'bg-teal-100 text-teal-800 border-teal-300' },
  ];

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Sol: Tecvid Aç/Kapat Toggle ve Başlık */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onToggleTajweed(!isTajweedEnabled)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
            isTajweedEnabled ? 'bg-emerald-700' : 'bg-stone-300'
          }`}
          role="switch"
          aria-checked={isTajweedEnabled}
          title={isTajweedEnabled ? 'Tecvid renklendirmesini kapat' : 'Tecvid renklendirmesini aç'}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
              isTajweedEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-stone-900">
            <Palette className="h-4 w-4 text-emerald-800" />
            <span>Renkli Tecvid Gösterimi</span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isTajweedEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
            }`}
          >
            {isTajweedEnabled ? 'Aktif' : 'Pasif'}
          </span>
        </div>
      </div>

      {/* Orta: Hızlı Renk Göstergeleri (Sadece Aktifken Görünür veya Her Zaman Renk Kılavuzu) */}
      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
        {quickLegendRules.map((item, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-opacity ${
              item.bg
            } ${isTajweedEnabled ? 'opacity-100' : 'opacity-50'}`}
          >
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.title}</span>
          </span>
        ))}
      </div>

      {/* Sağ: Rehber Açma Butonu */}
      <button
        type="button"
        onClick={onOpenTajweedGuide}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-950 bg-stone-100 hover:bg-emerald-100 border border-stone-200 hover:border-emerald-300 rounded-lg transition-colors cursor-pointer shrink-0"
      >
        <BookOpen className="h-3.5 w-3.5 text-emerald-800" />
        <span>Detaylı Tecvid Atlası</span>
      </button>
    </div>
  );
};
