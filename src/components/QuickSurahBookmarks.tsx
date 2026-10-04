import React, { useState, useEffect } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { SURAHS } from '../data/surahs';

interface QuickSurahBookmarksProps {
  currentSurahId: number;
  onSelectSurah: (surahId: number) => void;
  theme?: 'dark' | 'light';
}

export const QuickSurahBookmarks: React.FC<QuickSurahBookmarksProps> = ({
  currentSurahId,
  onSelectSurah,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

  const [savedIds, setSavedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('ezber_saved_surahs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every(n => typeof n === 'number')) {
          return parsed;
        }
      }
    } catch {}
    // Varsayılan başlangıç hızlı erişim sureleri
    return [36, 67, 78, 1]; // Yâsîn, Mülk, Nebe, Fâtiha
  });

  useEffect(() => {
    try {
      localStorage.setItem('ezber_saved_surahs', JSON.stringify(savedIds));
    } catch {}
  }, [savedIds]);

  const isCurrentSaved = savedIds.includes(currentSurahId);

  const toggleCurrentSurah = () => {
    if (isCurrentSaved) {
      setSavedIds(prev => prev.filter(id => id !== currentSurahId));
    } else {
      setSavedIds(prev => [...prev, currentSurahId]);
    }
  };

  const removeSurah = (idToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIds(prev => prev.filter(id => id !== idToRemove));
  };

  const currentSurahMeta = SURAHS.find(s => s.id === currentSurahId);

  return (
    <div className="flex items-center gap-2 max-w-full">
      {/* Sade + (Hızlı Erişime Ekle / Çıkar) Butonu */}
      <button
        type="button"
        onClick={toggleCurrentSurah}
        className={`flex items-center justify-center w-9 h-9 rounded-xl font-bold transition-all cursor-pointer border active:scale-95 shrink-0 ${
          isCurrentSaved
            ? isDark
              ? 'bg-[#3fb996] text-[#181510] border-[#3fb996] shadow-xs hover:bg-[#32a382]'
              : 'bg-emerald-600 text-white border-emerald-600 shadow-xs hover:bg-emerald-700'
            : isDark
            ? 'bg-[#181510] text-[#3fb996] border-[#3fb996]/50 hover:bg-[#252018] hover:border-[#3fb996]'
            : 'bg-white text-emerald-600 border-emerald-500 hover:bg-emerald-50 shadow-xs'
        }`}
        title={
          isCurrentSaved
            ? `${currentSurahMeta?.name || ''} Sûresi kayıtlı (Hızlı erişimden çıkarmak için tıklayın)`
            : `${currentSurahMeta?.name || ''} Sûresini Hızlı Erişime Kaydet (+)`
        }
      >
        <Plus
          className={`w-5 h-5 stroke-[3] transition-transform ${
            isCurrentSaved
              ? isDark
                ? 'text-[#181510]'
                : 'text-white'
              : isDark
              ? 'text-[#3fb996]'
              : 'text-emerald-600'
          }`}
        />
      </button>

      {/* Kaydedilen Sureler Çip Listesi */}
      {savedIds.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5 max-w-full">
          {savedIds.map(id => {
            const surah = SURAHS.find(s => s.id === id);
            if (!surah) return null;
            const isActive = id === currentSurahId;

            return (
              <div
                key={id}
                onClick={() => onSelectSurah(id)}
                className={`group flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? isDark
                      ? 'bg-[#1c3630] text-[#3fb996] border-[#3fb996] shadow-xs font-bold'
                      : 'bg-emerald-700 text-white border-emerald-700 shadow-xs font-bold'
                    : isDark
                    ? 'bg-[#181510] text-[#b9b09a] border-[#3a3226] hover:border-[#3fb996]/40 hover:text-white'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                title={`${surah.name} Sûresi'ne git`}
              >
                <span className="font-bold">{surah.id}.</span>
                <span>{surah.name}</span>

                <button
                  type="button"
                  onClick={(e) => removeSurah(id, e)}
                  className={`ml-0.5 p-0.5 rounded-full transition-colors opacity-70 group-hover:opacity-100 ${
                    isActive
                      ? isDark
                        ? 'hover:bg-emerald-800 text-emerald-200'
                        : 'hover:bg-emerald-800 text-white'
                      : isDark
                      ? 'hover:bg-[#252018] text-[#8c826e] hover:text-rose-400'
                      : 'hover:bg-slate-300 text-slate-500 hover:text-rose-600'
                  }`}
                  title="Bu sureyi hızlı erişimden sil"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
