import React, { useState } from 'react';
import { ALL_TAJWEED_RULES } from '../data/tajweedRules';
import {
  X,
  Sparkles,
  CheckCircle2,
  Palette,
  Clock,
} from 'lucide-react';

interface TajweedGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TajweedGuideModal: React.FC<TajweedGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', title: 'Tüm Kurallar', count: ALL_TAJWEED_RULES.length },
    { id: 'tenvin_ve_sakin_nun', title: 'Tenvin & Sâkin Nûn', count: 5 },
    { id: 'kalkale', title: 'Kalkale Harfleri', count: 1 },
    { id: 'semsi_kameri', title: 'Şemsî & Kamerî (ال)', count: 2 },
    { id: 'med_halleri', title: 'Med (Uzatma) Halleri', count: 4 },
    { id: 'sakin_mim', title: 'Sâkin Mîm Halleri', count: 3 },
    { id: 'hukmur_ra', title: 'Râ Harfi Hükmü', count: 2 },
  ];

  const filteredRules = selectedCategory === 'all'
    ? ALL_TAJWEED_RULES
    : ALL_TAJWEED_RULES.filter((r) => r.category === selectedCategory);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto flex flex-col max-h-[90vh] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-emerald-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-xl shadow-xs">
              <Palette className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">
                  Renkli Tecvid Kuralları Atlası
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950">
                  Resmi Mushaf Renkleri
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Kur'an-ı Kerim tilavetinde harflerin birleşiminden doğan tüm tecvid kaideleri, süreleri ve kuralları
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Renk Lejantı ve Kategori Filtre Çubuğu */}
        <div className="px-6 py-3 border-b border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Kategoriler */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-800 text-amber-200 shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-emerald-300'
                }`}
              >
                <span>{cat.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat.id ? 'bg-emerald-900 text-amber-300' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Hızlı Bilgi */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500">
            <Clock className="h-4 w-4 text-emerald-700" />
            <span>1 Elif = 1 Parmak kaldırma süresi (~1-1.5 sn)</span>
          </div>
        </div>

        {/* Modal Body / Kartlar Listesi */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Üst Pedagojik Açıklama */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-sm block mb-1">
                Harf Birleşimlerinden Doğan Tecvid Mantığı:
              </strong>
              <p className="leading-relaxed">
                Arapça harfler tek başınayken saf seslerini verir. Ancak iki harf bir araya geldiğinde; birinci harfin cezimli olması, tenvinli olması veya harf-i med olması durumunda tecvid kuralları devreye girer. Bu sistem, matristeki her hücre ve kelime için tecvidi otomatik algılar ve renklendirir.
              </p>
            </div>
          </div>

          {/* Kartlar Izgarası */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRules.map((rule) => {
              return (
                <div
                  key={rule.type}
                  className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${rule.color.bgLight} ${rule.color.border} shadow-2xs hover:shadow-xs`}
                >
                  <div className="space-y-3">
                    {/* Kart Üst Başlık & Renk Göstergesi */}
                    <div className="flex items-center justify-between border-b border-stone-200/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3.5 w-3.5 rounded-full shadow-2xs shrink-0"
                          style={{ backgroundColor: rule.color.hex }}
                        />
                        <h3 className="text-base font-bold text-stone-900">
                          {rule.titleTr}
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-800 shadow-2xs">
                        {rule.durationElif || 'Ölçülü'}
                      </span>
                    </div>

                    {/* Kategori Etiketi */}
                    <div className="text-[11px] text-stone-500 font-semibold flex items-center gap-1">
                      <span>Kategori:</span>
                      <span className="text-stone-800">{rule.categoryTitleTr}</span>
                    </div>

                    {/* Kısa Açıklama */}
                    <p className="text-xs text-stone-700 leading-relaxed font-medium">
                      {rule.shortDesc}
                    </p>

                    {/* İlgili Harfler */}
                    {rule.lettersInvolved.length > 0 && (
                      <div className="bg-white/80 border border-stone-200 rounded-lg p-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-stone-500 uppercase block w-full mb-1">
                          Kuralın Harfleri ({rule.lettersInvolved.length} Harf):
                        </span>
                        {rule.lettersInvolved.map((char, idx) => (
                          <span
                            key={idx}
                            className="font-quran text-base px-2 py-0.5 rounded-md bg-white border border-stone-200 font-bold shadow-2xs"
                            style={{ color: rule.color.hex }}
                          >
                            {char}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Alt Örnek Kutusu */}
                  <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between gap-3 bg-white/90 p-3 rounded-xl border">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-stone-400 block uppercase">
                        Kur'an Örneği:
                      </span>
                      <span
                        className="font-quran text-2xl font-bold block"
                        style={{ color: rule.color.hex }}
                      >
                        {rule.exampleArabic}
                      </span>
                      <span className="text-xs text-stone-600 block">
                        {rule.exampleTr}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <span>Matristeki tüm birleşimler ve detay kartları bu tecvid atlasıyla senkronize çalışır.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
