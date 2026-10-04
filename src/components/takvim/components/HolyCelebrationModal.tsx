import React, { useState } from 'react';
import { X, Sparkles, Share2, Copy, Check, Heart, MessageCircle } from 'lucide-react';
import { HolyDayItem } from '../utils/holyDays';

interface HolyCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  holyDay: HolyDayItem | null;
}

export const HolyCelebrationModal: React.FC<HolyCelebrationModalProps> = ({ isOpen, onClose, holyDay }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !holyDay) return null;

  const dateStr = holyDay.gregorianDate.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long'
  });

  const celebrationText = `✨ ${holyDay.celebrationTitle} ✨\n\n${
    holyDay.celebrationDuaArabic ? `${holyDay.celebrationDuaArabic}\n\n` : ''
  }${
    holyDay.celebrationDuaRead ? `Okunuşu: "${holyDay.celebrationDuaRead}"\n\n` : ''
  }"${holyDay.celebrationDua}"\n\n📅 Tarih: ${dateStr}\n🌙 Hicrî: ${holyDay.hijriFormatted}\n\nDualarınızda unutulmamak dileğiyle, hayırlı ve bereketli kandiller dilerim.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(celebrationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(celebrationText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-emerald-100 dark:border-emerald-950/40 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Üst Dekoratif Arka Plan */}
        <div className="relative bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 text-white p-6 sm:p-8 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-3 border border-white/20 shadow-lg">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>

          <span className="text-xs font-semibold text-emerald-200 tracking-widest uppercase block mb-1">
            {holyDay.name}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-serif">
            {holyDay.celebrationTitle}
          </h2>

          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-emerald-100/80">
            <span>{dateStr}</span>
            <span>•</span>
            <span>{holyDay.hijriFormatted}</span>
          </div>
        </div>

        {/* Tebrik Mesajı & Dua Gövdesi */}
        <div className="p-6 space-y-4">
          {/* Arapça Dua (Varsa) */}
          {holyDay.celebrationDuaArabic && (
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
              <p className="text-lg sm:text-xl font-serif text-emerald-950 dark:text-emerald-200 leading-relaxed font-arabic">
                {holyDay.celebrationDuaArabic}
              </p>
              {holyDay.celebrationDuaRead && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                  "{holyDay.celebrationDuaRead}"
                </p>
              )}
            </div>
          )}

          {/* Türkçe Dua / Anlam */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-serif leading-relaxed italic">
              "{holyDay.celebrationDua}"
            </p>
          </div>

          {/* Aksiyon Butonları */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Mesajı Kopyala</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition shadow-md shadow-emerald-600/20"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp ile Paylaş</span>
            </button>
          </div>
        </div>

        {/* Alt Dipnot */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-400">
          Bu tebrik kartını sevdiklerinize göndererek kandil ve bayram coşkusuna ortak olabilirsiniz.
        </div>
      </div>
    </div>
  );
};
