import React, { useMemo } from 'react';
import { ArabicLetter } from '../types/matrix';
import { analyzeTajweedText } from '../utils/tajweedEngine';
import { X, Sparkles, CheckCircle2, Palette } from 'lucide-react';

interface LetterDetailModalProps {
  letter: ArabicLetter | null;
  onClose: () => void;
  onOpenTajweedGuide?: () => void;
}

export const LetterDetailModal: React.FC<LetterDetailModalProps> = ({ letter, onClose, onOpenTajweedGuide }) => {
  if (!letter) return null;

  // Determine Tajweed category of this single letter
  const letterTajweedAttrs = useMemo(() => {
    const c = letter.char;
    const isKalkale = ['ق', 'ط', 'ب', 'ج', 'د'].includes(c);
    const isShamsi = ['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن'].includes(c);
    const isBogaz = ['ء', 'ا', 'ه', 'ع', 'ح', 'غ', 'خ'].includes(c);
    const isIhfa = ['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك'].includes(c);
    const isIdgamMaal = ['ي', 'م', 'ن', 'و'].includes(c);
    const isIdgamBila = ['ل', 'ر'].includes(c);
    const isIklab = c === 'ب';

    return {
      isKalkale,
      isShamsi,
      isBogaz,
      isIhfa,
      isIdgamMaal,
      isIdgamBila,
      isIklab,
    };
  }, [letter.char]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-stone-50/80">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-900 text-amber-200 font-quran text-4xl shadow-xs">
              {letter.char}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-stone-900">
                  {letter.nameTr} Harfi
                </h2>
                <span className="font-arabic text-xl text-stone-600">
                  ({letter.nameAr})
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 mt-0.5">
                <span>Sıra No: #{letter.id}</span>
                <span aria-hidden="true">·</span>
                <span>{letter.isBold ? 'Kalın Harf' : 'İnce Harf'}</span>
                <span aria-hidden="true">·</span>
                <span className={letter.connectsNext ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
                  {letter.connectsNext ? 'Sonrasına Birleşir' : 'Sonrasına Birleşmez'}
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Mahreç ve Tecvid Özellik Rozetleri */}
          <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-xl text-xs text-stone-700 space-y-3">
            <div className="flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900">Mahreç (Çıkış Yeri): </span>
                {letter.makhraj}
              </div>
            </div>

            {/* Tecvid Sınıflandırma Rozetleri */}
            <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center gap-2">
              <span className="font-bold text-stone-600 text-[11px] flex items-center gap-1">
                <Palette className="h-3.5 w-3.5 text-emerald-700" />
                Tecvid Sınıfı:
              </span>

              {letterTajweedAttrs.isKalkale && (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                  Kalkale Harfi (Cezimli Titretilir)
                </span>
              )}

              {letterTajweedAttrs.isShamsi ? (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-300">
                  Şemsî Harf (ال takısında Lâm okunmaz)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">
                  Kamerî Harf (ال takısında Lâm cezimle okunur)
                </span>
              )}

              {letterTajweedAttrs.isBogaz && (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                  Boğaz Harfi (İzhâr Kaidesi)
                </span>
              )}

              {letterTajweedAttrs.isIklab && (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  İklâb Harfi (Nûn sesini Mîm'e çevirir)
                </span>
              )}

              {letterTajweedAttrs.isIdgamMaal && (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                  İdgam-ı Maal-Gunne Harfi
                </span>
              )}

              {letterTajweedAttrs.isIdgamBila && (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  İdgam-ı Bilâ-Gunne Harfi
                </span>
              )}

              {letterTajweedAttrs.isIhfa && !letterTajweedAttrs.isKalkale && (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                  İhfâ Harfi (Tenvin/Nun gizlenir)
                </span>
              )}
            </div>
          </div>

          {/* 1. BÖLÜM: Konuma Göre Şekli (Yalnız, Başta, Ortada, Sonda) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-700" />
                1. Konuma Göre Yazılış Şekilleri
              </h3>
              <span className="text-xs text-stone-600">Arap alfabesinde harf kelimedeki yerine göre şekil değiştirir</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Yalnız */}
              <div className="p-3.5 bg-white border border-stone-200 rounded-xl text-center space-y-1 hover:border-emerald-300 transition-colors">
                <span className="text-xs font-medium text-stone-600 block">Yalın (Müstakil)</span>
                <div className="font-quran text-3xl text-emerald-950 py-1 dir-rtl">
                  {letter.forms.isolated}
                </div>
                <span className="text-[11px] text-stone-500 block pt-1">
                  Yalın hali
                </span>
              </div>

              {/* Başta */}
              <div className="p-3.5 bg-white border border-stone-200 rounded-xl text-center space-y-1 hover:border-emerald-300 transition-colors">
                <span className="text-xs font-medium text-stone-600 block">Başta</span>
                <div className="font-quran text-3xl text-emerald-950 py-1 dir-rtl">
                  {letter.forms.initial}
                </div>
                <span className="text-[11px] text-stone-600 block pt-1">
                  {letter.connectsNext ? 'Sola kuyruk verir' : 'Bağımsız yazılır'}
                </span>
              </div>

              {/* Ortada */}
              <div className="p-3.5 bg-white border border-stone-200 rounded-xl text-center space-y-1 hover:border-emerald-300 transition-colors">
                <span className="text-xs font-medium text-stone-600 block">Ortada</span>
                <div className="font-quran text-3xl text-emerald-950 py-1 dir-rtl">
                  {letter.forms.medial}
                </div>
                <span className="text-[11px] text-stone-600 block pt-1">
                  {letter.connectsNext ? 'İki yana bağlanır' : 'Yalnız sağa bağlanır'}
                </span>
              </div>

              {/* Sonda */}
              <div className="p-3.5 bg-white border border-stone-200 rounded-xl text-center space-y-1 hover:border-emerald-300 transition-colors">
                <span className="text-xs font-medium text-stone-600 block">Sonda</span>
                <div className="font-quran text-3xl text-emerald-950 py-1 dir-rtl">
                  {letter.forms.final}
                </div>
                <span className="text-[11px] text-stone-600 block pt-1">
                  Kendi asıl formuyla biter
                </span>
              </div>
            </div>
          </section>

          {/* 2. BÖLÜM: Harekeli Okunuşu (Üstün, Esre, Ötre) */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-700" />
              2. Harekeli Okunuşu (Temel 3 Sesli Hareke)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Üstün (Fatha) */}
              <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">Üstün (Fetha)</span>
                </div>
                <div className="text-center py-1">
                  <span className="font-quran text-4xl text-emerald-950">
                    {letter.harakat.fatha.ar}
                  </span>
                </div>
                <div className="border-t border-stone-100 pt-2 text-center">
                  <span className="text-xs font-semibold text-emerald-900 block">
                    Okunuş: {letter.harakat.fatha.tr}
                  </span>
                  <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                    {letter.harakat.fatha.soundDesc}
                  </p>
                </div>
              </div>

              {/* Esre (Kasra) */}
              <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">Esre (Kesra)</span>
                </div>
                <div className="text-center py-1">
                  <span className="font-quran text-4xl text-emerald-950">
                    {letter.harakat.kasra.ar}
                  </span>
                </div>
                <div className="border-t border-stone-100 pt-2 text-center">
                  <span className="text-xs font-semibold text-emerald-900 block">
                    Okunuş: {letter.harakat.kasra.tr}
                  </span>
                  <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                    {letter.harakat.kasra.soundDesc}
                  </p>
                </div>
              </div>

              {/* Ötre (Damma) */}
              <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">Ötre (Damme)</span>
                </div>
                <div className="text-center py-1">
                  <span className="font-quran text-4xl text-emerald-950">
                    {letter.harakat.damma.ar}
                  </span>
                </div>
                <div className="border-t border-stone-100 pt-2 text-center">
                  <span className="text-xs font-semibold text-emerald-900 block">
                    Okunuş: {letter.harakat.damma.tr}
                  </span>
                  <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                    {letter.harakat.damma.soundDesc}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. BÖLÜM: 5 Adet Kur'an-ı Kerim Kelime Örneği */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-700" />
                3. Kur'an-ı Kerim'den 5 Örnek Kelime
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {letter.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex flex-col justify-between text-center"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-stone-600 block">
                      {ex.surahRef}
                    </span>
                    <div className="font-quran text-2xl text-stone-900 py-1">
                      {ex.arabic}
                    </div>
                    <div className="text-xs font-semibold text-stone-800">
                      {ex.transliteration}
                    </div>
                    <div className="text-[11px] text-stone-600 italic">
                      "{ex.meaning}"
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <span>Matriste bu harfin bulunduğu satır veya sütunu inceleyebilirsiniz.</span>
          </div>
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
