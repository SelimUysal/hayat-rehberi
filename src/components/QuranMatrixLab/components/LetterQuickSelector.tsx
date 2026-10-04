import React, { useState } from 'react';
import { ARABIC_LETTERS } from '../data/letters';

interface LetterQuickSelectorProps {
  selectedLetterId: number | null;
  onSelectLetter: (letterId: number) => void;
  onClearFilter: () => void;
  title?: string;
}

// Mahreç / Kategori gruplandırmaları
const LETTER_GROUPS: { label: string; ids: number[] }[] = [
  {
    label: 'Tümü (30)',
    ids: ARABIC_LETTERS.map((l) => l.id),
  },
  {
    label: 'Boğaz Harfleri (Halk)',
    ids: [1, 6, 7, 26, 18, 19], // Elif, Ha, Hı, He, Ayn, Gayn
  },
  {
    label: 'Dil Harfleri (Lisan)',
    ids: [3, 4, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 20, 21, 23, 25],
  },
  {
    label: 'Dudak Harfleri (Şefeveyn)',
    ids: [2, 22, 24, 27], // Be, Fe, Mim, Vav
  },
  {
    label: 'Peltek Harfler',
    ids: [4, 9, 17], // Se, Zel, Zı
  },
  {
    label: 'Kalkale Harfleri',
    ids: [16, 21, 2, 5, 8], // Kaaf, Taa, Be, Cim, Dal (Kutbu Ced)
  },
];

export const LetterQuickSelector: React.FC<LetterQuickSelectorProps> = ({
  selectedLetterId,
  onSelectLetter,
  onClearFilter,
  title = 'Hızlı Harf Seçimi',
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Filtreleme
  const currentGroupIds = LETTER_GROUPS[activeTab]?.ids || [];
  const filteredLetters = ARABIC_LETTERS.filter((letter) => {
    const matchesGroup = currentGroupIds.includes(letter.id);
    if (!matchesGroup) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    return (
      letter.nameTr.toLowerCase().includes(query) ||
      letter.char.includes(query) ||
      letter.transliteration.toLowerCase().includes(query)
    );
  });

  const selectedLetterObj = selectedLetterId
    ? ARABIC_LETTERS.find((l) => l.id === selectedLetterId)
    : null;

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl shadow-xs overflow-hidden transition-all duration-200">
      {/* Üst Başlık ve Kontrol Çubuğu */}
      <div className="bg-stone-50/80 px-3.5 py-2.5 border-b border-stone-200/70 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-800 text-amber-300 text-xs font-bold shadow-xs">
            🎯
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-emerald-950">
                {title}
              </span>
              <span className="text-[10px] font-medium bg-emerald-100/70 text-emerald-800 px-1.5 py-0.5 rounded-full">
                30 Harf
              </span>
            </div>
            {selectedLetterObj ? (
              <p className="text-[11px] text-emerald-700 font-medium">
                Seçili:{' '}
                <span className="font-bold text-emerald-950 font-quran text-sm ml-0.5">
                  {selectedLetterObj.char}
                </span>{' '}
                ({selectedLetterObj.nameTr}) harfine odaklanıldı
              </p>
            ) : (
              <p className="text-[11px] text-stone-500">
                Tabloda o harfin satırına gitmek için bir harfe tıklayın
              </p>
            )}
          </div>
        </div>

        {/* Sağ Taraftaki Aksiyonlar: Arama, Tümü Sıfırla ve Panel Aç/Kapat */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Hızlı Arama Kutusu */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Harf ara..."
              className="w-24 sm:w-32 text-xs pl-6 pr-2 py-1 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 placeholder:text-stone-400"
            />
            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {selectedLetterId && (
            <button
              onClick={onClearFilter}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              title="Seçimi temizle ve tüm matrisi göster"
            >
              <span>Tümü</span>
              <span className="text-[10px]">✕</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-stone-600 hover:text-emerald-900 bg-stone-100 hover:bg-stone-200/80 px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-medium"
            title={isExpanded ? 'Paneli Daralt' : 'Paneli Genişlet'}
          >
            <span>{isExpanded ? 'Daralt' : 'Genişlet'}</span>
            <span className="text-[10px] transform transition-transform duration-200">
              {isExpanded ? '▲' : '▼'}
            </span>
          </button>
        </div>
      </div>

      {/* Ana Gövde: Açıkken Grid Görünümü */}
      {isExpanded ? (
        <div className="p-3 space-y-2.5">
          {/* Mahreç / Özellik Sekmeleri */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 matrix-scroll text-xs">
            {LETTER_GROUPS.map((grp, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={grp.label}
                  onClick={() => {
                    setActiveTab(idx);
                    setSearchQuery('');
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-900 text-amber-200 shadow-2xs'
                      : 'bg-stone-100 hover:bg-stone-200/70 text-stone-700'
                  }`}
                >
                  {grp.label}
                </button>
              );
            })}
          </div>

          {/* 30 Harf Klavyeli Izgara (Responsive Grid - Kaydırmaya Gerek Kalmadan Tek Ekranda) */}
          <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 gap-2 sm:gap-2.5">
            {filteredLetters.map((letter) => {
              const isSelected = selectedLetterId === letter.id;
              return (
                <button
                  key={letter.id}
                  onClick={() => onSelectLetter(letter.id)}
                  title={`${letter.nameTr} (${letter.char}) harfine odaklan`}
                  className={`group relative flex flex-col items-center justify-between min-h-[78px] sm:min-h-[86px] px-1.5 pt-2 pb-2 rounded-xl transition-all duration-150 cursor-pointer border text-center ${
                    isSelected
                      ? 'bg-emerald-950 text-amber-200 font-bold border-emerald-900 shadow-md ring-2 ring-emerald-500/40 scale-102 z-10'
                      : 'bg-stone-50 hover:bg-emerald-50 text-stone-800 border-stone-200 hover:border-emerald-300 hover:shadow-2xs active:scale-95'
                  }`}
                >
                  <div className="h-9 sm:h-10 w-full flex items-center justify-center">
                    <span className="font-quran text-2xl sm:text-3xl leading-none group-hover:scale-110 transition-transform select-none">
                      {letter.char}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] leading-tight mt-2.5 pt-1 border-t w-full truncate tracking-tight font-medium ${
                      isSelected
                        ? 'text-amber-200 font-bold border-emerald-800/80'
                        : 'text-stone-700 border-stone-200/60'
                    }`}
                  >
                    {letter.nameTr}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredLetters.length === 0 && (
            <div className="text-center py-3 text-xs text-stone-500">
              Aramanızla eşleşen harf bulunamadı.
            </div>
          )}
        </div>
      ) : (
        /* Daraltılmış Mod: Sadece Seçili Harf veya Mini Özet */
        <div className="px-3.5 py-2 flex items-center justify-between text-xs text-stone-600">
          <span>
            {selectedLetterObj ? (
              <span className="font-medium text-emerald-900">
                Seçili Harf: <strong>{selectedLetterObj.nameTr}</strong> ({selectedLetterObj.char})
              </span>
            ) : (
              <span>Panel daraltıldı (Tüm harfler listeleniyor).</span>
            )}
          </span>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-emerald-700 font-semibold hover:underline cursor-pointer"
          >
            Harf Seçiciyi Aç
          </button>
        </div>
      )}
    </div>
  );
};
