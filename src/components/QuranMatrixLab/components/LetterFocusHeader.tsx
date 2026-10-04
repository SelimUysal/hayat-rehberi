import React, { useState } from 'react';
import { ArabicLetter } from '../types/matrix';
import { BookOpen, Sparkles, Layers, Volume2, ChevronDown, ChevronUp, ExternalLink, Info } from 'lucide-react';

interface LetterFocusHeaderProps {
  letter: ArabicLetter;
  onOpenLetterDetail: (letter: ArabicLetter) => void;
  subtitle?: string;
}

type TabType = 'forms' | 'harakat' | 'examples';

export const LetterFocusHeader: React.FC<LetterFocusHeaderProps> = ({
  letter,
  onOpenLetterDetail,
  subtitle = 'Akıllı Kartlar Modu',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('forms');
  const [isExpanded, setIsExpanded] = useState<boolean>(false); // Start collapsed for a minimal, clean look

  return (
    <div className="bg-stone-50/80 border-b border-stone-200 rounded-t-2xl overflow-hidden transition-all duration-200">
      {/* Sade & Zarif Üst Başlık Şeridi */}
      <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 bg-white border-b border-stone-200/80">
        <div className="flex items-center gap-3">
          {/* Harf Avatarı */}
          <button
            onClick={() => onOpenLetterDetail(letter)}
            className="group relative h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-amber-200 font-quran text-2xl flex items-center justify-center font-bold shadow-2xs transition-all cursor-pointer shrink-0"
            title={`${letter.nameTr} harfinin mahreç, sıfat ve tecvid detaylarını aç`}
          >
            {letter.char}
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h3 className="font-bold text-stone-900 text-sm sm:text-base tracking-tight">
                "{letter.nameTr}" ({letter.nameAr}) Harfi
              </h3>
              <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600 text-[11px] font-medium border border-stone-200/80">
                #{letter.id}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px] font-medium border border-stone-200/80">
                {letter.isBold ? 'Kalın Harf' : 'İnce Harf'}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5 flex flex-wrap items-center gap-1.5">
              <span>Mahreç: {letter.makhraj}</span>
              <span className="text-stone-300">•</span>
              <span className={letter.connectsNext ? 'text-emerald-700 font-medium' : 'text-amber-800 font-medium'}>
                {letter.connectsNext ? 'Sonrasına Bitişir' : 'Sonrasına Bitişmez'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          {/* Harf Detay Modalı Butonu */}
          <button
            onClick={() => onOpenLetterDetail(letter)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-900 hover:bg-emerald-50 border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
            title="Harfin tüm mahreç ve tecvid detaylarını aç"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Tüm Detaylar</span>
          </button>

          {/* Özellik Panelini Aç / Kapat */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              isExpanded
                ? 'bg-emerald-900 text-amber-200 shadow-2xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200/80'
            }`}
            title={isExpanded ? 'Harf özellikleri panelini kapat' : 'Konuma göre yazılış, hareke ve örnekleri gör'}
          >
            <span>{isExpanded ? 'Kapat' : 'Yazılış & Örnekler'}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* SADE VE AYDINLIK AÇILIR PANEL */}
      {isExpanded && (
        <div className="p-3 sm:p-4 bg-stone-50 border-b border-stone-200/80 space-y-3 animate-fadeIn">
          {/* Sekme Butonları */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex p-0.5 bg-stone-200/70 rounded-lg border border-stone-200 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('forms')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'forms'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Layers className="h-3.5 w-3.5 text-emerald-700" />
                <span>1. Yazılış Şekilleri</span>
              </button>

              <button
                onClick={() => setActiveTab('harakat')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'harakat'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Volume2 className="h-3.5 w-3.5 text-emerald-700" />
                <span>2. Harekeli Okunuşu</span>
              </button>

              <button
                onClick={() => setActiveTab('examples')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'examples'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5 text-emerald-700" />
                <span>3. 5 Kur'an Örneği</span>
              </button>
            </div>

            <div className="text-[11px] text-stone-500 flex items-center gap-1">
              <Info className="h-3 w-3 text-emerald-700" />
              <span>Seçili harfe ait alfabe bilgileri</span>
            </div>
          </div>

          {/* SEKME 1: KONUMA GÖRE YAZILIŞ ŞEKİLLERİ */}
          {activeTab === 'forms' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Yalın */}
              <div className="bg-white border border-stone-200 rounded-lg p-2 text-center shadow-2xs">
                <span className="text-[10px] font-semibold text-stone-500 block">Yalın (Müstakil)</span>
                <div className="font-quran text-2xl text-emerald-950 py-0.5 dir-rtl select-none">
                  {letter.forms.isolated}
                </div>
                <span className="text-[10px] text-stone-400 block">Bağlanmayan hali</span>
              </div>

              {/* Başta */}
              <div className="bg-white border border-stone-200 rounded-lg p-2 text-center shadow-2xs">
                <span className="text-[10px] font-semibold text-stone-500 block">Kelime Başında</span>
                <div className="font-quran text-2xl text-emerald-950 py-0.5 dir-rtl select-none">
                  {letter.forms.initial}
                </div>
                <span className="text-[10px] text-stone-400 block">
                  {letter.connectsNext ? 'Sola birleşir' : 'Bağımsız yazılır'}
                </span>
              </div>

              {/* Ortada */}
              <div className="bg-white border border-stone-200 rounded-lg p-2 text-center shadow-2xs">
                <span className="text-[10px] font-semibold text-stone-500 block">Kelime Ortasında</span>
                <div className="font-quran text-2xl text-emerald-950 py-0.5 dir-rtl select-none">
                  {letter.forms.medial}
                </div>
                <span className="text-[10px] text-stone-400 block">
                  {letter.connectsNext ? 'İki yana birleşir' : 'Sağa birleşir'}
                </span>
              </div>

              {/* Sonda */}
              <div className="bg-white border border-stone-200 rounded-lg p-2 text-center shadow-2xs">
                <span className="text-[10px] font-semibold text-stone-500 block">Kelime Sonunda</span>
                <div className="font-quran text-2xl text-emerald-950 py-0.5 dir-rtl select-none">
                  {letter.forms.final}
                </div>
                <span className="text-[10px] text-stone-400 block">Asıl haliyle biter</span>
              </div>
            </div>
          )}

          {/* SEKME 2: HAREKELİ OKUNUŞU (3 TEMEL HAREKE) */}
          {activeTab === 'harakat' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Üstün (Fetha) */}
              <div className="bg-white border border-stone-200 rounded-lg p-2.5 flex flex-col justify-between text-center shadow-2xs">
                <div className="flex items-center justify-between text-[11px] text-stone-600">
                  <span className="font-bold">Üstün (Fetha)</span>
                  <span className="font-mono text-emerald-800">/a-e/</span>
                </div>
                <div className="my-0.5">
                  <span className="font-quran text-3xl text-emerald-950 select-none">
                    {letter.harakat.fatha.ar}
                  </span>
                </div>
                <div className="border-t border-stone-100 pt-1 text-left">
                  <span className="text-[11px] font-semibold text-stone-800 block">
                    Okunuş: {letter.harakat.fatha.tr}
                  </span>
                  <p className="text-[10px] text-stone-500 leading-tight">
                    {letter.harakat.fatha.soundDesc}
                  </p>
                </div>
              </div>

              {/* Esre (Kesra) */}
              <div className="bg-white border border-stone-200 rounded-lg p-2.5 flex flex-col justify-between text-center shadow-2xs">
                <div className="flex items-center justify-between text-[11px] text-stone-600">
                  <span className="font-bold">Esre (Kesra)</span>
                  <span className="font-mono text-emerald-800">/ı-i/</span>
                </div>
                <div className="my-0.5">
                  <span className="font-quran text-3xl text-emerald-950 select-none">
                    {letter.harakat.kasra.ar}
                  </span>
                </div>
                <div className="border-t border-stone-100 pt-1 text-left">
                  <span className="text-[11px] font-semibold text-stone-800 block">
                    Okunuş: {letter.harakat.kasra.tr}
                  </span>
                  <p className="text-[10px] text-stone-500 leading-tight">
                    {letter.harakat.kasra.soundDesc}
                  </p>
                </div>
              </div>

              {/* Ötre (Damma) */}
              <div className="bg-white border border-stone-200 rounded-lg p-2.5 flex flex-col justify-between text-center shadow-2xs">
                <div className="flex items-center justify-between text-[11px] text-stone-600">
                  <span className="font-bold">Ötre (Damme)</span>
                  <span className="font-mono text-emerald-800">/u-ü/</span>
                </div>
                <div className="my-0.5">
                  <span className="font-quran text-3xl text-emerald-950 select-none">
                    {letter.harakat.damma.ar}
                  </span>
                </div>
                <div className="border-t border-stone-100 pt-1 text-left">
                  <span className="text-[11px] font-semibold text-stone-800 block">
                    Okunuş: {letter.harakat.damma.tr}
                  </span>
                  <p className="text-[10px] text-stone-500 leading-tight">
                    {letter.harakat.damma.soundDesc}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SEKME 3: KUR'AN'DAN 5 ÖRNEK KELİME */}
          {activeTab === 'examples' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {letter.examples.slice(0, 5).map((ex, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-stone-200 rounded-lg p-2 flex flex-col justify-between shadow-2xs"
                >
                  <div className="flex items-center justify-between text-[10px] text-stone-500 pb-1 border-b border-stone-100">
                    <span className="font-mono">#{idx + 1}</span>
                    <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-700 font-medium">
                      {ex.highlightLetterPos === 'initial'
                        ? 'Başta'
                        : ex.highlightLetterPos === 'medial'
                        ? 'Ortada'
                        : ex.highlightLetterPos === 'final'
                        ? 'Sonda'
                        : 'Yalın'}
                    </span>
                  </div>

                  <div className="text-center py-1.5">
                    <span className="font-quran text-2xl text-stone-900 select-none">
                      {ex.arabic}
                    </span>
                  </div>

                  <div className="border-t border-stone-100 pt-1 text-center">
                    <span className="text-[11px] font-semibold text-stone-800 block truncate">
                      {ex.transliteration}
                    </span>
                    <p className="text-[10px] text-stone-500 truncate" title={ex.meaning}>
                      {ex.meaning}
                    </p>
                    {ex.surahRef && (
                      <span className="text-[9px] text-emerald-800 font-mono block mt-0.5 truncate">
                        📖 {ex.surahRef}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
