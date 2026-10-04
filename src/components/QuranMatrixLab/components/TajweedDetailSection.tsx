import React, { useState } from 'react';
import { TajweedAnalysisResult, TajweedRuleInfo } from '../types/tajweed';
import { Sparkles, Info, BookOpen } from 'lucide-react';

interface TajweedDetailSectionProps {
  analysis: TajweedAnalysisResult;
  arabicWord: string;
  onOpenGuide?: () => void;
}

export const TajweedDetailSection: React.FC<TajweedDetailSectionProps> = ({
  analysis,
  onOpenGuide,
}) => {
  const [selectedRule, setSelectedRule] = useState<TajweedRuleInfo | null>(
    analysis.rulesFound.length > 0 ? analysis.rulesFound[0] : null
  );

  return (
    <div className="bg-gradient-to-br from-stone-50 to-stone-100/90 border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-900 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-stone-900">
                Kur'an Tilaveti & Otomatik Tecvid Analizi
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {analysis.rulesFound.length > 0
                  ? `${analysis.rulesFound.length} Kural Tespit Edildi`
                  : 'Temel Harf Birleşimi'}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Harflerin birbirine kavuşmasında ve harekelenişinde uygulanan tecvid hükümleri
            </p>
          </div>
        </div>

        {onOpenGuide && (
          <button
            type="button"
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-white border border-stone-300 hover:border-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
          >
            <BookOpen className="h-3.5 w-3.5 text-emerald-700" />
            <span>Tüm Tecvid Tablosu</span>
          </button>
        )}
      </div>

      {analysis.rulesFound.length > 0 ? (
        <div className="space-y-4">
          {/* Kural Seçim Çipleri */}
          <div className="flex flex-wrap gap-2">
            {analysis.rulesFound.map((rule) => {
              const isSelected = selectedRule?.type === rule.type;
              return (
                <button
                  key={rule.type}
                  type="button"
                  onClick={() => setSelectedRule(rule)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? `${rule.color.badgeBg} shadow-sm ring-2 ring-stone-900/10 scale-102`
                      : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: rule.color.hex }}
                  />
                  <span>{rule.titleTr}</span>
                  {rule.durationElif && (
                    <span className="text-[10px] font-medium opacity-80 pl-1 border-l border-current">
                      {rule.durationElif}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Aktif Kural Detay Kartı */}
          {selectedRule && (
            <div
              className={`p-4 rounded-xl border transition-all ${selectedRule.color.bgLight} ${selectedRule.color.border}`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase text-white shadow-2xs"
                      style={{ backgroundColor: selectedRule.color.hex }}
                    >
                      {selectedRule.categoryTitleTr}
                    </span>
                    <span className="text-xs font-semibold text-stone-800">
                      Uzatma / Tutma Süresi: <strong>{selectedRule.durationElif || 'Ölçülü'}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-stone-800 leading-relaxed font-medium">
                    {selectedRule.shortDesc}
                  </p>

                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    {selectedRule.ruleExplanation}
                  </p>

                  {/* İlgili Harfler */}
                  {selectedRule.lettersInvolved.length > 0 && (
                    <div className="pt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-stone-700">İlgili Harfler:</span>
                      {selectedRule.lettersInvolved.map((l, i) => (
                        <span
                          key={i}
                          className="font-quran text-sm px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-900 shadow-2xs"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Kur'an Örneği Kutusu */}
                <div className="bg-white border border-stone-200/90 rounded-xl p-3 shrink-0 flex flex-col items-center justify-center min-w-[170px] shadow-2xs space-y-1.5">
                  <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                    Örnek Kur'an Tilaveti
                  </span>

                  <span
                    className="font-quran text-2xl py-1 text-center font-bold"
                    style={{ color: selectedRule.color.hex }}
                  >
                    {selectedRule.exampleArabic}
                  </span>

                  <span className="text-xs text-stone-700 font-medium text-center">
                    {selectedRule.exampleTr}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-white border border-stone-200 flex items-start gap-3">
          <Info className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1 text-stone-700">
            <span className="font-semibold block text-stone-900">
              Temel Harf Dizilişi & Mahreç Dengelemesi
            </span>
            <p className="leading-relaxed">
              Bu birleşimde doğrudan özel bir tecvid kuralı (İhfâ, İklâb, Kalkale vb.) bulunmamaktadır. Harfler kendi mahreçlerinden doğal akışıyla, üstün, esre veya ötre harekelerine göre net (fesih) bir şekilde okunur.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
