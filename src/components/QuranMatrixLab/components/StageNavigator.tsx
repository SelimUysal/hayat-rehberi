import React from 'react';
import { Search, ZoomIn, ZoomOut } from 'lucide-react';

interface StageNavigatorProps {
  currentStage: number;
  onSelectStage: (stage: number) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  cellSize: 'compact' | 'normal' | 'large';
  onCellSizeChange: (size: 'compact' | 'normal' | 'large') => void;
}

export const StageNavigator: React.FC<StageNavigatorProps> = ({
  currentStage,
  onSelectStage,
  searchQuery,
  onSearchQueryChange,
  cellSize,
  onCellSizeChange,
}) => {
  const stages = [
    {
      id: 1,
      title: '1. Aşama: Temel Matris',
      subtitle: 'Tek Harf × Tek Harf (30×30 = 900 İkili Birleşim)',
      status: 'ready',
      badge: currentStage === 1 ? 'Şu An Açık' : '1. Sayfa',
    },
    {
      id: 2,
      title: '2. Aşama: İkili Kombinasyon Matrisi',
      subtitle: 'Tek Harf × 2\'li Birleşim (30×30 = 900 Üçlü Birleşim)',
      status: 'ready',
      badge: currentStage === 2 ? 'Şu An Açık' : '2. Sayfa',
    },
    {
      id: 3,
      title: '3. Aşama: Üçlü Kombinasyon Matrisi',
      subtitle: 'Tek Harf × 3\'lü Birleşim (30×30 = 900 Dörtlü Birleşim)',
      status: 'ready',
      badge: currentStage === 3 ? 'Şu An Açık' : '3. Sayfa',
    },
    {
      id: 4,
      title: '4. Aşama: Dörtlü Kombinasyon Matrisi',
      subtitle: 'Tek Harf × 4\'lü Birleşim (30×30 = 900 Beşli Birleşim)',
      status: 'ready',
      badge: currentStage === 4 ? 'Şu An Açık' : '4. Sayfa',
    },
    {
      id: 5,
      title: '5. Aşama: Kelime Tamamlama Matrisi',
      subtitle: 'Tek Harf × 5\'li Gövde (30×30 = 900 Tam Kelime)',
      status: 'ready',
      badge: currentStage === 5 ? 'Şu An Açık' : '5. Sayfa Final',
    },
  ];

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            5 Aşamalı Matris Mimarisi (Müfredat)
          </h3>
        </div>

        {/* Global Search and Sizing Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Harf veya kelime ara..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Sizing Controls */}
          <div className="flex items-center p-1 bg-stone-100 rounded-lg border border-stone-200/80">
            <button
              onClick={() => onCellSizeChange('compact')}
              title="Kompakt Görünüm"
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                cellSize === 'compact' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onCellSizeChange('normal')}
              title="Normal Görünüm"
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                cellSize === 'normal' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Standart
            </button>
            <button
              onClick={() => onCellSizeChange('large')}
              title="Büyük Görünüm"
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                cellSize === 'large' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {stages.map((st) => {
          const isSelected = currentStage === st.id;
          return (
            <button
              key={st.id}
              onClick={() => onSelectStage(st.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-900 border-emerald-900 text-white shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100/80 border-stone-200 text-stone-800'
              }`}
            >
              <div>
                <div className="text-xs font-bold line-clamp-1">
                  {st.title}
                </div>
                <div className={`text-[11px] mt-1 line-clamp-2 leading-tight ${
                  isSelected ? 'text-stone-200' : 'text-stone-600'
                }`}>
                  {st.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
