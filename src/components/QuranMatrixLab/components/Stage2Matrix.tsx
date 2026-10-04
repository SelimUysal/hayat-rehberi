import React, { useState, useMemo, useRef } from 'react';
import { ARABIC_LETTERS } from '../data/letters';
import { POPULAR_TWO_LETTER_PAIRS } from '../data/twoLetterPairs';
import { ArabicLetter, TwoLetterPair, ThreeLetterCombination } from '../types/matrix';
import { getThreeLetterCombination } from '../utils/threeLetterCombinations';
import { analyzeTajweedText } from '../utils/tajweedEngine';
import { Search, ZoomIn, ZoomOut, MousePointerClick, Sparkles } from 'lucide-react';
import { LetterQuickSelector } from './LetterQuickSelector';
import { LetterFocusHeader } from './LetterFocusHeader';

interface Stage2MatrixProps {
  onSelectLetter: (letter: ArabicLetter) => void;
  onSelectThreeLetterCombination: (combination: ThreeLetterCombination) => void;
  onNavigateToStage: (stage: number) => void;
  isTajweedEnabled?: boolean;
  searchQuery: string;
  cellSize: 'compact' | 'normal' | 'large';
  onCellSizeChange?: (size: 'compact' | 'normal' | 'large') => void;
}

type CellSize = 'compact' | 'normal' | 'large';

export const Stage2Matrix: React.FC<Stage2MatrixProps> = ({
  onSelectLetter,
  onSelectThreeLetterCombination,
  onNavigateToStage,
  isTajweedEnabled = true,
  searchQuery,
  cellSize,
  onCellSizeChange,
}) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [selectedLetterId, setSelectedLetterId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'focus' | 'table'>('focus');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter letters based on search query
  const filteredLetters = useMemo(() => {
    if (!searchQuery.trim()) return ARABIC_LETTERS;
    const q = searchQuery.toLowerCase().trim();
    return ARABIC_LETTERS.filter(
      (l) =>
        l.nameTr.toLowerCase().includes(q) ||
        l.transliteration.toLowerCase().includes(q) ||
        l.char.includes(q)
    );
  }, [searchQuery]);

  // Dimensions based on cell size
  const sizeClasses = {
    compact: {
      cell: 'w-14 h-13 min-w-14 min-h-13 text-base',
      header: 'w-14 min-w-14 text-xs py-2',
      arabic: 'text-xl',
    },
    normal: {
      cell: 'w-18 h-16 min-w-18 min-h-16 text-xl',
      header: 'w-18 min-w-18 text-xs py-2.5',
      arabic: 'text-2xl',
    },
    large: {
      cell: 'w-22 h-20 min-w-22 min-h-20 text-2xl',
      header: 'w-22 min-w-22 text-sm py-3',
      arabic: 'text-3xl',
    },
  }[cellSize];

  const handleCellClick = (l1: ArabicLetter, pair: TwoLetterPair) => {
    const combo = getThreeLetterCombination(l1, pair);
    onSelectThreeLetterCombination(combo);
  };

  const scrollToRow = (letterId: number) => {
    setSelectedLetterId(letterId === selectedLetterId ? null : letterId);
    setViewMode('focus');
    if (scrollContainerRef.current) {
      const el = document.getElementById(`stage2-row-${letterId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const selectedLetterObj = selectedLetterId
    ? ARABIC_LETTERS.find((l) => l.id === selectedLetterId) || null
    : null;

  const hoveredRowLetter = hoveredRow !== null ? filteredLetters[hoveredRow] : null;
  const hoveredColPair = hoveredCol !== null ? POPULAR_TWO_LETTER_PAIRS[hoveredCol] : null;

  const effectiveSelectedLetter = selectedLetterObj || ARABIC_LETTERS[0];

  return (
    <div className="space-y-4">
      {/* Harflere Hızlı Erişim Paneli */}
      <LetterQuickSelector
        selectedLetterId={selectedLetterId || (viewMode === 'focus' ? effectiveSelectedLetter.id : null)}
        onSelectLetter={scrollToRow}
        onClearFilter={() => setSelectedLetterId(null)}
        title="2. Aşama: Harf & 3'lü Birleşim Seçimi"
      />

      {/* Çift Görünüm Modu Seçim Çubuğu (Kullanıcı Seçimi) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-800">Görünüm Düzeni:</span>
          <span className="text-xs text-stone-500 hidden sm:inline">
            {viewMode === 'focus' 
              ? 'Seçili harfe ait 30 birleşim ekrana tam sığdırılır (sıfır kaydırma).' 
              : 'Tüm 900 kombinasyon 30×30 matris tablosunda kuşbakışı listelenir.'}
          </span>
        </div>

        <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-semibold">
          <button
            onClick={() => setViewMode('focus')}
            className={`px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'focus'
                ? 'bg-emerald-950 text-amber-200 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
            title="Hiç kaydırmadan seçilen harfe göre tek ekranda kompakt listeleyen mod"
          >
            <span>🗂️ Akıllı Kartlar Modu</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'table'
                ? 'bg-emerald-950 text-amber-200 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
            title="900 hücrelik büyük tabloyu kuşbakışı görmek isteyenler için"
          >
            <span>📊 Klasik Matris Modu</span>
          </button>
        </div>
      </div>

      {/* SEÇENEK 1: SEÇİLİ HARFİN 30 BİRLEŞİMİ (KAYDIRMASIZ 5x6 / 6x5 KART IZGARASI) */}
      {viewMode === 'focus' ? (
        <div className="bg-white border border-stone-300/90 rounded-2xl shadow-sm overflow-hidden flex flex-col animate-fadeIn">
          {/* Harfin Konuma Göre Yazılışı, 3 Temel Harekesi ve 5 Kur'an Örneği Başlık Paneli */}
          <LetterFocusHeader
            letter={effectiveSelectedLetter}
            onOpenLetterDetail={onSelectLetter}
            subtitle="2. Aşama: 3'lü Birleşimler (Akıllı Kartlar)"
          />

          {/* 30 Kelime Kartı (Tam Ekrana Sığan 5x6 Responsive Izgara) */}
          <div className="p-4 sm:p-5 bg-stone-50/50">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3">
              {POPULAR_TWO_LETTER_PAIRS.map((pair, index) => {
                const combo = getThreeLetterCombination(effectiveSelectedLetter, pair);
                const tajweedAnalysis = isTajweedEnabled
                  ? analyzeTajweedText(combo.quranicExample?.arabic || combo.joinedArabic)
                  : null;
                const tajweedRule = tajweedAnalysis && tajweedAnalysis.hasRules ? tajweedAnalysis.rulesFound[0] : null;

                return (
                  <button
                    key={pair.id}
                    onClick={() => handleCellClick(effectiveSelectedLetter, pair)}
                    className="group relative flex flex-col justify-between bg-white hover:bg-emerald-50/80 border border-stone-200 hover:border-emerald-400 hover:shadow-md rounded-xl p-3 text-center transition-all duration-150 cursor-pointer active:scale-97"
                  >
                    {/* Kart Üst Bilgisi */}
                    <div className="flex items-center justify-between w-full text-[11px] text-stone-600 pb-1.5 border-b border-stone-100">
                      <span className="font-mono text-stone-500 font-semibold">#{index + 1}</span>
                      <span className="font-medium text-stone-700 truncate max-w-[90px]">
                        +{pair.nameTr}
                      </span>
                    </div>

                    {/* Ana Arapça Birleşim */}
                    <div className="my-3 flex items-center justify-center min-h-[44px]">
                      <span className="font-quran text-3xl text-stone-900 group-hover:text-emerald-950 group-hover:scale-110 transition-transform select-none">
                        {combo.joinedArabic}
                      </span>
                    </div>

                    {/* Kart Alt Bilgisi & Tecvid */}
                    <div className="pt-1.5 border-t border-stone-100/80 flex items-center justify-between w-full text-[10px]">
                      <span className="text-stone-500 font-mono">
                        {effectiveSelectedLetter.char}+{pair.joinedArabic}
                      </span>
                      {tajweedRule ? (
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs truncate max-w-[80px]"
                          style={{ backgroundColor: tajweedRule.color.hex }}
                          title={`Tecvid: ${tajweedRule.titleTr}`}
                        >
                          {tajweedRule.titleTr}
                        </span>
                      ) : combo.quranicExample ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900 truncate">
                          Kur'an Örneği
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium group-hover:underline">
                          8 Hali →
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* 2. Aşama 30x30 Matris Tablosu */}
      <div className={`bg-white border border-stone-300/80 rounded-2xl shadow-sm overflow-hidden flex flex-col ${viewMode === 'focus' ? 'hidden' : 'block'}`}>
        {/* Tablo Üstü Bilgilendirme / Canlı Kesişim Göstergesi */}
        <div className="px-4 py-2 bg-stone-50/90 border-b border-stone-200 flex flex-wrap items-center justify-between text-xs text-stone-600 gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-5 px-2 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px]">
              2. Aşama (3'lü Birleşimler)
            </span>
            {hoveredRowLetter && hoveredColPair ? (
              <span className="text-emerald-950 font-semibold flex items-center gap-1.5 animate-fadeIn">
                <span>Kesişim:</span>
                <span className="bg-emerald-900 text-amber-200 px-2 py-0.5 rounded font-bold font-quran text-sm">
                  {hoveredRowLetter.char} + {hoveredColPair.joinedArabic}
                </span>
                <span className="text-stone-700 font-medium">
                  ({hoveredRowLetter.nameTr} + {hoveredColPair.nameTr})
                </span>
              </span>
            ) : (
              <span className="text-stone-500 hidden sm:inline">
                3 harfli birleşimi görmek için imleci hücre üzerine getirin veya tıklayın.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-stone-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400"></span> Kur'an Örneği
            </span>
            {isTajweedEnabled && (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-700"></span> Tecvidli
              </span>
            )}
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="relative overflow-auto max-h-[72vh] matrix-scroll"
        >
          <table className="border-collapse table-fixed w-max select-none">
            <thead>
              <tr>
                {/* Sol Üst Köşe Sabit Hücre */}
                <th className="sticky top-0 left-0 z-30 bg-stone-100/95 backdrop-blur-xs border-b-2 border-r-2 border-stone-300 p-2 text-center align-middle shadow-sm">
                  <div className="flex flex-col items-center justify-center min-w-20 h-14 text-[10px] text-stone-600 font-semibold">
                    <span className="bg-emerald-100/80 text-emerald-900 px-1.5 py-0.5 rounded font-bold mb-0.5">
                      1. Harf (Satır ↓)
                    </span>
                    <span className="text-stone-500 font-medium">
                      2. İkili (Sütun →)
                    </span>
                  </div>
                </th>

                {/* Sütun Başlıkları: 30 Adet Popüler 2'li Harf Kombinasyonu */}
                {POPULAR_TWO_LETTER_PAIRS.map((pair, cIndex) => {
                  const isColHovered = hoveredCol === cIndex;

                  return (
                    <th
                      key={pair.id}
                      className={`sticky top-0 z-20 border-b-2 border-r border-stone-200 transition-all duration-150 text-center ${sizeClasses.header} ${
                        isColHovered
                          ? 'bg-emerald-900 text-amber-200 font-bold border-b-amber-400 shadow-md ring-1 ring-emerald-700'
                          : 'bg-stone-50/95 backdrop-blur-xs text-stone-800'
                      }`}
                      title={`Sütun: ${pair.nameTr} (${pair.joinedArabic})`}
                    >
                      <div className="flex flex-col items-center justify-between min-h-[66px] py-1 px-0.5 gap-0.5">
                        <span className={`text-[10px] block font-mono leading-none ${isColHovered ? 'text-amber-200' : 'text-stone-500'}`}>
                          #{cIndex + 1}
                        </span>
                        <span className={`font-quran block leading-normal py-0.5 ${sizeClasses.arabic} ${isColHovered ? 'scale-110' : ''}`}>
                          {pair.joinedArabic}
                        </span>
                        <span className={`text-[10px] block leading-tight truncate max-w-full font-medium ${isColHovered ? 'text-amber-200' : 'text-stone-700'}`}>
                          {pair.nameTr}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {filteredLetters.map((rowLetter, rIndex) => {
                const isRowHovered = hoveredRow === rIndex;
                const isRowSelected = selectedLetterId === rowLetter.id;

                return (
                  <tr 
                    id={`stage2-row-${rowLetter.id}`}
                    key={rowLetter.id}
                    className={isRowHovered ? 'bg-emerald-50/40' : ''}
                  >
                    {/* Satır Başlığı (Tekil Harf) */}
                    <th
                      onClick={() => onSelectLetter(rowLetter)}
                      className={`sticky left-0 z-10 border-b border-r-2 border-stone-300 transition-all duration-150 cursor-pointer text-center px-2 py-1.5 ${
                        isRowHovered
                          ? 'bg-emerald-900 text-amber-200 font-bold shadow-md ring-1 ring-emerald-700'
                          : isRowSelected
                          ? 'bg-emerald-800 text-amber-200 font-bold'
                          : 'bg-stone-50/95 backdrop-blur-xs hover:bg-emerald-100/80 text-stone-800'
                      }`}
                      title={`Satır: ${rowLetter.nameTr} Harfi (Detay için tıkla)`}
                    >
                      <div className="flex items-center justify-between gap-2 min-w-22 px-1 text-left">
                        <span className={`text-[10px] font-mono leading-none w-4 ${isRowHovered ? 'text-amber-200' : 'text-stone-500'}`}>
                          #{rowLetter.id}
                        </span>
                        <span className={`font-quran text-2xl leading-normal py-0.5 ${isRowHovered ? 'text-amber-200 scale-110' : 'text-emerald-950'}`}>
                          {rowLetter.char}
                        </span>
                        <span className={`text-[11px] font-semibold leading-tight truncate max-w-[55px] ${isRowHovered ? 'text-amber-200' : 'text-stone-800'}`}>
                          {rowLetter.nameTr}
                        </span>
                      </div>
                    </th>

                    {/* 30 Adet 3'lü Kesişim Hücresi */}
                    {POPULAR_TWO_LETTER_PAIRS.map((pair, cIndex) => {
                      const isCellHovered = hoveredRow === rIndex && hoveredCol === cIndex;
                      const isRowMatch = hoveredRow === rIndex;
                      const isColMatch = hoveredCol === cIndex;

                      const combo = getThreeLetterCombination(rowLetter, pair);
                      const tajweedAnalysis = isTajweedEnabled
                        ? analyzeTajweedText(combo.quranicExample?.arabic || combo.joinedArabic)
                        : null;
                      const tajweedRule = tajweedAnalysis && tajweedAnalysis.hasRules ? tajweedAnalysis.rulesFound[0] : null;

                      return (
                        <td
                          key={pair.id}
                          onMouseEnter={() => {
                            setHoveredRow(rIndex);
                            setHoveredCol(cIndex);
                          }}
                          onMouseLeave={() => {
                            setHoveredRow(null);
                            setHoveredCol(null);
                          }}
                          onClick={() => handleCellClick(rowLetter, pair)}
                          className={`border-b border-r border-stone-200 text-center transition-all duration-100 cursor-pointer relative ${sizeClasses.cell} ${
                            isCellHovered
                              ? 'bg-emerald-900 text-amber-200 font-bold scale-110 z-20 shadow-xl rounded-xl ring-2 ring-amber-300'
                              : isRowMatch || isColMatch
                              ? 'bg-emerald-50/80 text-emerald-950'
                              : tajweedRule
                              ? `${tajweedRule.color.bgLight} hover:bg-emerald-50 text-stone-900`
                              : combo.quranicExample
                              ? 'bg-amber-50/60 hover:bg-emerald-50/80 text-stone-900'
                              : 'bg-white hover:bg-emerald-50/80 text-stone-900'
                          }`}
                          title={`${rowLetter.nameTr} + ${pair.nameTr} (${combo.joinedArabic})${
                            tajweedRule ? ` · Tecvid: ${tajweedRule.titleTr}` : ''
                          } - 8 hali için tıkla`}
                        >
                          {tajweedRule && !isCellHovered && (
                            <span
                              className="absolute top-1 right-1 h-2 w-2 rounded-full shadow-2xs pointer-events-none ring-1 ring-white"
                              style={{ backgroundColor: tajweedRule.color.hex }}
                              title={`Tecvid: ${tajweedRule.titleTr}`}
                            />
                          )}
                          <div className="flex flex-col items-center justify-center w-full h-full relative p-1">
                            <span className={`font-quran leading-normal select-none transition-transform ${sizeClasses.arabic} ${
                              isCellHovered ? 'text-amber-200 font-bold scale-110' : 'text-stone-900'
                            }`}>
                              {combo.joinedArabic}
                            </span>
                            {combo.quranicExample && !isCellHovered && !tajweedRule && (
                              <span 
                                className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-400" 
                                title="Kur'an-ı Kerim'de geçer"
                              />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Tablo Altı Büyütme/Küçültme Kontrolleri (Sol Alt Köşe) ve İpucu */}
        <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-500 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-stone-200 rounded-xl shadow-2xs p-1" title="Matris Tablosunu Büyült / Küçült">
              <button
                type="button"
                onClick={() => onCellSizeChange?.('compact')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  cellSize === 'compact' ? 'bg-emerald-900 text-amber-200 shadow-xs' : 'text-stone-600 hover:bg-stone-100'
                }`}
                title="Tabloyu Küçült (Zoom Out)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Küçült</span>
              </button>
              <button
                type="button"
                onClick={() => onCellSizeChange?.('normal')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  cellSize === 'normal' ? 'bg-emerald-900 text-amber-200 shadow-xs' : 'text-stone-600 hover:bg-stone-100'
                }`}
                title="Normal Boyut"
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => onCellSizeChange?.('large')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  cellSize === 'large' ? 'bg-emerald-900 text-amber-200 shadow-xs' : 'text-stone-600 hover:bg-stone-100'
                }`}
                title="Tabloyu Büyüt (Zoom In)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Büyüt</span>
              </button>
            </div>
            <span className="text-[10px] text-stone-400 hidden lg:inline">↔ Yatay Genişletme / Daraltma</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-stone-400">Toplam 900 kombinasyon</span>
          </div>
        </div>
      </div>
    </div>
  );
};
