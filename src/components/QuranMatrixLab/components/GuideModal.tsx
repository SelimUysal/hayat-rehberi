import React from 'react';
import { X, BookOpen, AlertCircle, Sparkles, Check, HelpCircle } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-900 text-amber-200 flex items-center justify-center shadow-xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Kur'an Harfleri Matris Rehberi
              </h2>
              <p className="text-xs text-stone-500">
                30x30 Matris Mantığı, İmlâ ve Birleşim Kuralları
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-stone-700 leading-relaxed">
          {/* 1. Matris Mantığı Nasıl Çalışır? */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-800" />
              1. 30x30 Matris Nasıl Çalışır?
            </h3>
            <p>
              Arapça sağdan sola doğru okunan ve yazılan bir dildir. Bu matriste:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li>
                <strong>Satırlar (Sol sütundaki başlıklar):</strong> Birleşimin <strong>1. Harfini (Öncü Harf)</strong> temsil eder. Arapça yazımda sağdaki harftir.
              </li>
              <li>
                <strong>Sütunlar (Üst satırdaki başlıklar):</strong> Birleşimin <strong>2. Harfini (Takipçi Harf)</strong> temsil eder. Arapça yazımda soldaki harftir.
              </li>
              <li>
                <strong>Kesişim Hücresi:</strong> Bu iki harfin Arapça hat ve imlâ kurallarına göre birleşmiş halini gösterir (Örn: Satırda <em>Bâ</em>, Sütunda <em>Tâ</em> varsa kesişim hücresinde <strong>بت</strong> görünür).
              </li>
            </ul>
          </section>

          {/* 2. Kendinden Sonrasına Birleşmeyen 6 Harf */}
          <section className="space-y-2 p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-950">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-700" />
              2. Kendinden Sonrasına Birleşmeyen 6 Temel Harf
            </h3>
            <p className="text-xs">
              Arap alfabesinde 6 harf kendinden sonra gelen harfle bitişik yazılmaz, aralarında boşluk bırakılarak bağımsız yazılır:
            </p>
            <div className="flex flex-wrap gap-2 pt-1 font-quran text-xl text-emerald-950">
              <span className="px-3 py-1 bg-white border border-amber-200 rounded-lg">ا (Elif)</span>
              <span className="px-3 py-1 bg-white border border-amber-200 rounded-lg">د (Dâl)</span>
              <span className="px-3 py-1 bg-white border border-amber-200 rounded-lg">ذ (Zel)</span>
              <span className="px-3 py-1 bg-white border border-amber-200 rounded-lg">ر (Râ)</span>
              <span className="px-3 py-1 bg-white border border-amber-200 rounded-lg">ز (Ze)</span>
              <span className="px-3 py-1 bg-white border border-amber-200 rounded-lg">و (Vâv)</span>
            </div>
            <p className="text-[11px] text-amber-900 mt-1">
              * Ayrıca <strong>ء (Hemze)</strong> ve <strong>لا (Lâmelif)</strong> de sonrasına bağlanmaz. Matriste bu harflerin satırlarında oluşan kesişimlerde harflerin birbirine bağlanmadığını, yan yana müstakil yazıldığını gözlemleyebilirsiniz.
            </p>
          </section>

          {/* 3. İncelenen 8 Farklı Hareke ve İşaret */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-800" />
              3. Her Kesişimde İncelenen 8 Farklı Hareke & İşaret
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg">
                <span className="font-bold text-stone-900">1. Üstün (Fetha - َ ):</span> İnce harfleri "e", kalın harfleri "a" sesiyle okutur.
              </div>
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg">
                <span className="font-bold text-stone-900">2. Esre (Kesra - ِ ):</span> İnce harfleri "i", kalın harfleri "ı" sesiyle okutur.
              </div>
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg">
                <span className="font-bold text-stone-900">3. Ötre (Damme - ُ ):</span> Dudaklar yuvarlatılarak ince harfleri "ü", kalın harfleri "u" sesiyle okutur.
              </div>
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg">
                <span className="font-bold text-stone-900">4. Cezm (Sükun - ْ ):</span> Harfi sessiz tutar, iki harfi tek bir kapalı hecede birleştirir (Örn: بتْ / Bat).
              </div>
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg">
                <span className="font-bold text-stone-900">5. Şedde (Teşdid - ّ ):</span> İkinci harfi ikizleştirerek iki kere kuvvetle okutur (Örn: بتَّ / Bette).
              </div>
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg">
                <span className="font-bold text-stone-900">6. İki Üstün (Tenvin - ً ):</span> Kelime sonunda "en" veya "an" sesi verir (Örn: بتًا / Beten).
              </div>
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg">
                <span className="font-bold text-stone-900">7. İki Esre (Tenvin - ٍ ):</span> Kelime sonunda "in" veya "ın" sesi verir (Örn: بتٍ / Betin).
              </div>
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg">
                <span className="font-bold text-stone-900">8. İki Ötre (Tenvin - ٌ ):</span> Kelime sonunda "ün" veya "un" sesi verir (Örn: بتٌ / Betün).
              </div>
            </div>
          </section>

          {/* 4. 5 Aşamalı Matris Müfredatının Basamakları */}
          <section className="space-y-2 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-950">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-800" />
              4. 5 Aşamalı Matris Derinleşme Müfredatı
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-white border border-emerald-200 rounded-lg">
                <span className="font-bold text-emerald-900 block">1. Aşama - Temel Matris:</span>
                Tek Harf × Tek Harf (30×30 = 900 kesişim) ile 2 harfli hece ve birleşimler.
              </div>
              <div className="p-2.5 bg-white border border-emerald-200 rounded-lg">
                <span className="font-bold text-emerald-900 block">2. Aşama - İkili Matris:</span>
                Tek Harf × 2'li Birleşim ile 3 harfli fiil ve kelime kökleri (Örn: ك-ت-ب).
              </div>
              <div className="p-2.5 bg-white border border-emerald-200 rounded-lg">
                <span className="font-bold text-emerald-900 block">3. Aşama - Üçlü Matris:</span>
                Tek Harf × 3'lü Kök ile 4 harfli müzari fiiller, mekan ve sıfat kalıpları (Örn: مَسْجِد).
              </div>
              <div className="p-2.5 bg-white border border-emerald-200 rounded-lg">
                <span className="font-bold text-emerald-900 block">4. Aşama - Dörtlü Matris:</span>
                Tek Harf × 4'lü Gövde ile 5 harfli belirlilik takılı kelimeler (Örn: الْمَسْجِد).
              </div>
              <div className="p-2.5 bg-white border border-emerald-200 rounded-lg sm:col-span-2">
                <span className="font-bold text-emerald-900 block">5. Aşama - Kelime Tamamlama Matrisi (Final):</span>
                Tek Harf (Önek/Edat) × 5'li Gövde ile Kur'an-ı Kerim'in tam ve çok heceli ayet kelimeleri (Örn: بِالْمَسْجِدِ, وَالْمُسْلِمُونَ, وَالرَّحْمَٰنُ).
              </div>
            </div>
          </section>

          {/* 5. Renkli Tecvid Kuralları Sistemi */}
          <section className="space-y-2 p-4 bg-rose-50/70 border border-rose-200 rounded-xl text-stone-800">
            <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-rose-700" />
              5. Renkli Tecvid Sistemi ve Otomatik Kural Tespiti
            </h3>
            <p className="text-xs leading-relaxed text-stone-700">
              Harfler bir araya geldiğinde ve harekeler (cezm, şedde, tenvin) eklendiğinde Kur'an okuma kuralları otomatik olarak tespit edilir ve renklendirilir:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2 bg-white rounded-lg border border-rose-200">
                <strong className="text-rose-700">İhfâ (Pembe):</strong> Tenvin/Sakin Nun + 15 Harf (1.5 elif gunne ile gizleme).
              </div>
              <div className="p-2 bg-white rounded-lg border border-sky-200">
                <strong className="text-sky-700">İzhâr (Mavi):</strong> Tenvin/Sakin Nun + 6 Boğaz Harfi (Net okuma).
              </div>
              <div className="p-2 bg-white rounded-lg border border-emerald-200">
                <strong className="text-emerald-700">İklâb (Yeşil):</strong> Tenvin/Sakin Nun + Bâ Harfi (Mîm'e dönüştürme).
              </div>
              <div className="p-2 bg-white rounded-lg border border-purple-200">
                <strong className="text-purple-700">İdgam-ı Maal-Gunne (Mor):</strong> Y-M-N-V ile 1.5 elif gunneli katma.
              </div>
              <div className="p-2 bg-white rounded-lg border border-red-200">
                <strong className="text-red-700">Kalkale (Kırmızı):</strong> (ق ط ب ج د) cezimli geldiğinde ses titreşimi/sarsıntısı.
              </div>
              <div className="p-2 bg-white rounded-lg border border-orange-200">
                <strong className="text-orange-700">Şemsî & Kamerî (Turuncu & Camgöbeği):</strong> Elif-Lâm (ال) takısında Lâm'ın okunup okunmayacağı.
              </div>
              <div className="p-2 bg-white rounded-lg border border-teal-200 sm:col-span-2">
                <strong className="text-teal-700">Med (Uzatma) Halleri (Turkuaz & Çivit):</strong> Harf-i Med ve Sebeb-i Med ile 1, 2 veya 4 Elif miktarı uzatma (Tabiî, Muttasıl, Munfasıl, Lâzım).
              </div>
            </div>
          </section>

          {/* 6. Etkileşim İpuçları */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-emerald-800" />
              6. Nasıl Etkileşime Geçilir?
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li>
                <strong>Başlıklardaki Tek Harflere Tıklayın:</strong> O harfin 4 konumdaki halini (yalnız, başta, ortada, sonda), 3 temel harekesini, tecvid sınıfını ve Kur'an'dan 5 örnek kelimesini dinleyin.
              </li>
              <li>
                <strong>Kesişim Karelerine Tıklayın:</strong> O birleşimin 8 halini tek ekranda görün ve seslendirici ile tek tek veya sırayla dinleyin.
              </li>
              <li>
                <strong>Renkli Tecvid Düğmesi:</strong> Üstteki "Renkli Tecvid" çubuğundan kuralları açıp kapatabilir, detaylı Tecvid Atlasını inceleyebilirsiniz.
              </li>
              <li>
                <strong>Yakınlaştırma & Arama:</strong> Matrisi daha rahat incelemek için Standart, Kompakt veya Geniş görünüme geçebilir, arama kutusundan istediğiniz harfe hemen ulaşabilirsiniz.
              </li>
              <li>
                <strong>Aşama Geçişleri:</strong> Üstteki gezinim çubuğundan veya her sayfanın altındaki "Sonraki Aşamaya Geç" butonlarıyla 1'den 5'e kadar tüm matrisler arasında dilediğiniz gibi geçiş yapabilirsiniz.
              </li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            Anladım, Matrise Dön
          </button>
        </div>
      </div>
    </div>
  );
};
