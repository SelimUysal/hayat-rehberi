import React, { useState, useMemo } from 'react';
import { X, History, Calendar, Search, Tag } from 'lucide-react';
import { HistoricalEvent, getHistoricalEventsForDate, HISTORICAL_EVENTS_MAP } from '../data/historicalEvents';

interface HistoricalEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
}

export const HistoricalEventsModal: React.FC<HistoricalEventsModalProps> = ({
  isOpen,
  onClose,
  currentDate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const todayEvents = useMemo(() => getHistoricalEventsForDate(currentDate), [currentDate]);

  const filteredEvents = useMemo(() => {
    return todayEvents.filter((ev) => {
      const matchCat = selectedCategory === 'all' || ev.category === selectedCategory;
      const matchSearch =
        ev.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.year && ev.year.toString().includes(searchQuery));
      return matchCat && matchSearch;
    });
  }, [todayEvents, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const dateStr = currentDate.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long'
  });

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'osmanli':
        return { label: 'Osmanlı Devleti', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' };
      case 'islam':
        return { label: 'İslâm Tarihi', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' };
      case 'turkiye':
        return { label: 'Türkiye Tarihi', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' };
      case 'selcuklu':
        return { label: 'Selçuklu', bg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300' };
      case 'filistin':
        return { label: 'Kudüs & Filistin', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' };
      default:
        return { label: 'Tarih', bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl border border-emerald-100 dark:border-emerald-950/40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Başlık */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-600 text-white rounded-xl shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Tarihte Bugün ({dateStr})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                İslam, Osmanlı, Selçuklu ve Türkiye tarihinde bugün vuku bulan mühim hadiseler
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

        {/* Filtre ve Arama */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Olay, padişah veya yıl ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'osmanli', label: 'Osmanlı' },
              { id: 'islam', label: 'İslâm' },
              { id: 'turkiye', label: 'Türkiye' },
              { id: 'filistin', label: 'Filistin' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedCategory === tab.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Olaylar Listesi */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              Bu kriterlere uygun tarihi kayıt bulunamadı.
            </div>
          ) : (
            filteredEvents.map((ev, i) => {
              const badge = getCategoryBadge(ev.category);
              return (
                <div
                  key={i}
                  className="rounded-xl p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 space-y-2 hover:border-amber-200 dark:hover:border-amber-900/40 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400 font-serif">
                      {ev.year ? `Miladi ${ev.year}` : 'Tarihî Not'}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {ev.text}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Alt Çubuk */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400">
          Geçmişini bilmeyen, geleceğini inşa edemez.
        </div>
      </div>
    </div>
  );
};
