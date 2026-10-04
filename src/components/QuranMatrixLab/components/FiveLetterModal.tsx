import React, { useMemo } from 'react';
import { FiveLetterCombination, HarakatVariant } from '../types/matrix';
import { analyzeTajweedText, analyzeVariantTajweed } from '../utils/tajweedEngine';
import { TajweedDetailSection } from './TajweedDetailSection';
import { X, Link, Sparkles, BookOpen } from 'lucide-react';

interface FiveLetterModalProps {
  combination: FiveLetterCombination | null;
  onClose: () => void;
  onOpenTajweedGuide?: () => void;
}

export const FiveLetterModal: React.FC<FiveLetterModalProps> = ({
  combination,
  onClose,
  onOpenTajweedGuide,
}) => {
  // Compute Tajweed analysis
  const tajweedAnalysis = useMemo(() => {
    if (!combination) return { hasRules: false, rulesFound: [], segments: [] };
    const textToCheck = combination.quranicExample?.arabic || combination.joinedArabic;
    return analyzeTajweedText(textToCheck);
  }, [combination]);

  if (!combination) return null;

  const {
    letter1,
    quad,
    letters,
    joinedArabic,
    connectionRuleNote,
    connectionStatus,
    variants,
    quranicExample,
  } = combination;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-stone-50/80">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-36 items-center justify-center rounded-xl bg-emerald-950 text-amber-200 font-quran text-4xl shadow-xs border border-emerald-900">
              {joinedArabic}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-stone-900">
                  {letter1.nameTr} + ({quad.nameTr}) = 5'li Harf Birleşimi
                </h2>
                <span className="font-arabic text-xl text-stone-500">
                  ({letter1.char} + {quad.joinedArabic})
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-600 mt-1">
                <span>1. {letters[0].nameTr}</span>
                <span aria-hidden="true">→</span>
                <span>2. {letters[1].nameTr}</span>
                <span aria-hidden="true">→</span>
                <span>3. {letters[2].nameTr}</span>
                <span aria-hidden="true">→</span>
                <span>4. {letters[3].nameTr}</span>
                <span aria-hidden="true">→</span>
                <span>5. {letters[4].nameTr}</span>
                <span aria-hidden="true">·</span>
                <span className={connectionStatus.fullyConnected ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                  {connectionStatus.fullyConnected ? 'Kesintisiz Bitişik' : 'Kısmen / Ayrık Yazılış'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[76vh] overflow-y-auto">
          {/* Kur'an-ı Kerim Örneği (Varsa Vurgulu Kart) */}
          {quranicExample && (
            <div className="p-4 bg-emerald-900 text-white rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <BookOpen className="h-4 w-4" />
                  <span>Kur'an-ı Kerim Kelime Eşleşmesi ({quranicExample.surahRef})</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-quran text-3xl text-amber-200">
                    {quranicExample.arabic}
                  </span>
                  <span className="text-sm font-bold text-white">
                    {quranicExample.transliteration}
                  </span>
                </div>
                <p className="text-xs text-stone-200 italic">
                  Anlamı: "{quranicExample.meaning}"
                </p>
              </div>
            </div>
          )}

          {/* 5'li İmlâ ve Hat Kuralı Açıklaması */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            connectionStatus.fullyConnected 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}>
            <Link className={`h-5 w-5 shrink-0 mt-0.5 ${connectionStatus.fullyConnected ? 'text-emerald-700' : 'text-amber-700'}`} />
            <div className="text-xs space-y-1">
              <span className="font-semibold block text-sm">
                Arapça 5 Harfli Birleşim Kuralı:
              </span>
              <p className="leading-relaxed">
                {connectionRuleNote}
              </p>
            </div>
          </div>

          {/* Otomatik Tespit Edilen Tecvid Kuralları & Renkli Gösterim */}
          <TajweedDetailSection
            analysis={tajweedAnalysis}
            arabicWord={combination.quranicExample?.arabic || joinedArabic}
            onOpenGuide={onOpenTajweedGuide}
          />

          {/* 8 Farklı Harekeli Hali Grid */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-700" />
                  5'li Birleşimin 8 Farklı Harekeli Hali (Kur'ani Vezinler & Hece Yapıları)
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Her kart 5 harfli Kur'an yapılarının fonetik, morfolojik kalıbını ve tecvid durumunu gösterir.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {variants.map((variant) => {
                const lastLetter = letters[letters.length - 1];
                const firstLetter = letters[0];
                const variantTajweed = analyzeVariantTajweed(
                  variant.arabicCombined,
                  variant.type,
                  lastLetter?.char,
                  firstLetter?.char
                );
                const hasTajweed = variantTajweed.hasRules && variantTajweed.rulesFound.length > 0;
                const topRule = hasTajweed ? variantTajweed.rulesFound[0] : null;

                return (
                  <div
                    key={variant.type}
                    className={`group relative p-4 rounded-xl border text-center transition-all flex flex-col justify-between ${
                      hasTajweed
                        ? `${topRule?.color.bgLight} ${topRule?.color.border} hover:shadow-xs`
                        : 'bg-white border-stone-200 hover:border-emerald-400 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Üst Başlık & İşaret */}
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-100">
                        <span className="font-bold text-stone-800 text-[11px] truncate max-w-[130px]">
                          {variant.titleTr}
                        </span>
                        <div className="flex items-center gap-1">
                          {topRule && (
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider text-white"
                              style={{ backgroundColor: topRule.color.hex }}
                              title={`${topRule.titleTr}: ${topRule.durationElif || ''}`}
                            >
                              {topRule.type === 'kalkale' ? 'Kalkale' : topRule.titleTr.split(' ')[0]}
                            </span>
                          )}
                          <span className="font-quran text-base text-stone-500">
                            {variant.arabicSign}
                          </span>
                        </div>
                      </div>

                      {/* Büyük Arapça 5 Harfli Metin */}
                      <div className="py-3">
                        <span
                          className={`font-quran text-3xl block ${
                            topRule
                              ? 'font-bold'
                              : 'text-emerald-950'
                          }`}
                          style={topRule ? { color: topRule.color.hex } : undefined}
                        >
                          {variant.arabicCombined}
                        </span>
                      </div>

                      {/* Okunuş ve İzah */}
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-emerald-900">
                          Okunuş: {variant.pronunciationTr}
                        </div>
                        <p className="text-[11px] text-stone-600 line-clamp-2 leading-snug">
                          {variant.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
