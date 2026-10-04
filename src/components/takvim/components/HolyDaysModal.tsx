import React, { useState, useMemo } from 'react';
import { X, Calendar, Sparkles, Moon, Sun, Clock, Send, ChevronRight, Search } from 'lucide-react';
import { HolyDayItem, getUpcomingHolyDays } from '../utils/holyDays';

interface HolyDaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCelebration?: (holyDay: HolyDayItem) => void;
}

export const HolyDaysModal: React.FC<HolyDaysModalProps> = ({ isOpen, onClose, onSelectCelebration }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'kandil' | 'bayram' | 'ramazan' | 'ozel'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const now = useMemo(() => new Date(), []);
  const allHolyDays = useMemo(() => getUpcomingHolyDays(now), [now]);

  const filteredDays = useMemo(() => {
    return allHolyDays.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.hijriFormatted.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allHolyDays, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-emerald-100 dark:border-emerald-950/40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Başlık Alanı */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Dini Günler & Kandiller</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Diyanet İşleri Başkanlığı resmi takvimine göre mübarek günler ve kandiller
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filtre ve Arama Alanı */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 space-y-3">
          {/* Arama Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Kandil, bayram veya ay ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Kategori Sekmeleri */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'kandil', label: 'Kandiller' },
              { id: 'bayram', label: 'Bayramlar' },
              { id: 'ramazan', label: 'Ramazan' },
              { id: 'ozel', label: 'Özel Günler' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedCategory === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste Alanı */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredDays.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">Aranan kriterlere uygun mübarek gün bulunamadı.</div>
          ) : (
            filteredDays.map((item) => {
              const isToday = item.daysLeft === 0;
              const dateStr = item.gregorianDate.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                weekday: 'long'
              });

              return (
                <div
                  key={item.id}
                  className={`rounded-xl p-3.5 sm:p-4 border transition-all ${
                    isToday
                      ? 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-500/10 dark:border-amber-500/20 ring-1 ring-amber-500/20'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60 hover:border-emerald-200 dark:hover:border-emerald-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          item.category === 'kandil'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                            : item.category === 'bayram'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : item.category === 'ramazan'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}
                      >
                        {item.category === 'kandil' && <Moon className="w-5 h-5" />}
                        {item.category === 'bayram' && <Sparkles className="w-5 h-5" />}
                        {item.category === 'ramazan' && <Sun className="w-5 h-5" />}
                        {item.category === 'ozel' && <Calendar className="w-5 h-5" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                            {item.name}
                          </h4>
                          {isToday && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white animate-pulse">
                              BUGÜN
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400">{item.desc}</p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                          <span className="flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
                            <Calendar className="w-3.5 h-3.5" />
                            {dateStr}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500">•</span>
                          <span>Hicri: {item.hijriFormatted}</span>
                          {item.timingNote && (
                            <>
                              <span className="text-slate-400 dark:text-slate-500">•</span>
                              <span className="text-amber-600 dark:text-amber-400 font-medium">{item.timingNote}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sağ Taraf: Kalan Gün & Tebrik Butonu */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="text-right">
                        <span
                          className={`text-xs sm:text-sm font-bold block ${
                            isToday
                              ? 'text-amber-600 dark:text-amber-400'
                              : item.daysLeft <= 7
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {isToday ? 'Bugün İdrak Ediliyor' : `${item.daysLeft} gün kaldı`}
                        </span>
                      </div>

                      {onSelectCelebration && (
                        <button
                          onClick={() => {
                            onSelectCelebration(item);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-2.5 py-1 rounded-lg transition"
                          title="Tebrik ve dua kartını aç"
                        >
                          <Send className="w-3 h-3" />
                          <span>Tebrik Kartı</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Dip Bilgi */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400">
          * Dini geceler, fıkhî kural gereği belirtilen günün akşam ezanı ile başlayıp ertesi sabah imsak vaktine kadar devam eder.
        </div>
      </div>
    </div>
  );
};
