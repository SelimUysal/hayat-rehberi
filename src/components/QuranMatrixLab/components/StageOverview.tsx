import React from 'react';
import { ArrowLeft, Sparkles, BookOpen, Layers, CheckCircle } from 'lucide-react';

interface StageOverviewProps {
  stage: number;
  onBackToStage1: () => void;
}

export const StageOverview: React.FC<StageOverviewProps> = ({
  stage,
  onBackToStage1,
}) => {
  const stageData = {
    2: {
      title: '2. Sayfa: İkili Kombinasyon Matrisi (3\'lü Birleşimler)',
      subtitle: 'Satırlarda Tekil Harfler × Sütunlarda 1. Sayfanın 2\'li Birleşimleri',
      description: '1. sayfadaki 30x30 matristen elde edilen 2\'li harf grupları (örneğin بت, كت, خر) bu sayfada sütunlara yerleştirilir. Satırlardaki tekil harflerle kesiştiklerinde 3 harfli kök fiil ve kelime gövdeleri oluşur.',
      formula: '30 Tekil Harf × 900 İkili Birleşim = 27.000 Olası 3\'lü Harf Öbeği',
      samples: [
        {
          arabic: 'كَتَبَ',
          breakdown: 'ك + تَ + بَ',
          trans: 'Ketebe',
          meaning: 'Yazdı, takdir etti',
          rule: 'Kef başta + Te ortada + Ba sonda formuyla tamamen bitişik yazılır.',
        },
        {
          arabic: 'خَلَقَ',
          breakdown: 'خَ + لَ + قَ',
          trans: 'Haleka',
          meaning: 'Yarattı',
          rule: 'Hı (başta) + Lam (ortada) + Kaf (sonda) formlarıyla bağlanır.',
        },
        {
          arabic: 'ضَرَبَ',
          breakdown: 'ضَ + رَ + بَ',
          trans: 'Darabe',
          meaning: 'Misal verdi, vurdu',
          rule: 'Dad Ra\'ya bağlanır, fakat Ra kendinden sonrakine bağlanmadığı için Ba harfi yalnız kalır.',
        },
        {
          arabic: 'عَلِمَ',
          breakdown: 'عَ + لِ + مَ',
          trans: 'Alime',
          meaning: 'Bildi, ilim sahibi oldu',
          rule: 'Ayn başta + Lam ortada + Mim sonda kesintisiz hat ile birleşir.',
        },
      ],
    },
    3: {
      title: '3. Sayfa: Üçlü Kombinasyon Matrisi (4\'lü Birleşimler)',
      subtitle: 'Satırlarda Tekil Harfler × Sütunlarda 2. Sayfanın 3\'lü Birleşimleri',
      description: '3 harfli kök kelimelere önek (Elif, Te, Ye, Nun) veya sonek harfler gelerek 4 harfli Kur\'ani vezinler ve kalıplar (örneğin فَعَّلَ, أَفْعَلَ, مَفْعَل) inşa edilir.',
      formula: '30 Tekil Harf × 3\'lü Birleşimler = 4\'lü Kelime Gövdeleri',
      samples: [
        {
          arabic: 'مَسْجِدٌ',
          breakdown: 'مَ + سْ + جِ + دٌ',
          trans: 'Mescidün',
          meaning: 'Secde edilen yer, mescit',
          rule: 'Mim + Sin (cezimli) + Cim + Dal (sonrasına bağsız).',
        },
        {
          arabic: 'مَكْتَبٌ',
          breakdown: 'مَ + كْ + تَ + بٌ',
          trans: 'Mektebün',
          meaning: 'Yazı yazılan yer, mektep',
          rule: 'Mim + Kef (cezimli) + Te + Ba.',
        },
        {
          arabic: 'يَعْلَمُ',
          breakdown: 'يَ + عْ + لَ + مُ',
          trans: 'Ya\'lemü',
          meaning: 'Bilir, bilmektedir',
          rule: 'Ye muzaraat harfi + Ayn sakin + Lam + Mim.',
        },
        {
          arabic: 'أَحْسَنَ',
          breakdown: 'أَ + حْ + سَ + نَ',
          trans: 'Ahsene',
          meaning: 'En güzel şekilde yaptı',
          rule: 'Elif hemzesi + Ha sakin + Sin + Nun.',
        },
      ],
    },
    4: {
      title: '4. Sayfa: Dörtlü Kombinasyon Matrisi (5\'li Birleşimler)',
      subtitle: 'Satırlarda Tekil Harfler × Sütunlarda 4\'lü Harf Grupları',
      description: '4 harfli gövdelere eklenen harflerle 5 harfli zengin Kur\'an yapıları (örneğin İftial, Tefaul, İnkılab vezinleri) elde edilir.',
      formula: '30 Tekil Harf × 4\'lü Harf Grupları = 5\'li Kelimeler',
      samples: [
        {
          arabic: 'مُسْلِمٌ',
          breakdown: 'مُ + سْ + لِ + مٌ',
          trans: 'Müslimün',
          meaning: 'Teslim olan, Müslüman',
          rule: 'İslam kökünden türemiş 5 harfli Kur\'ani isim kalıbı.',
        },
        {
          arabic: 'مُؤْمِنٌ',
          breakdown: 'مُ + ؤْ + مِ + نٌ',
          trans: 'Mü\'minün',
          meaning: 'Gönülden inanan, iman eden',
          rule: 'Mim + Hemzeli Vav (sakin) + Mim + Nun.',
        },
        {
          arabic: 'رَحْمَٰنُ',
          breakdown: 'رَ + حْ + مَ + ٰ + نُ',
          trans: 'Rahmân',
          meaning: 'Sonsuz merhamet sahibi',
          rule: 'Ra (bağsız) + Ha sakin + Mim + Hançer Elif + Nun.',
        },
        {
          arabic: 'يَنْصُرُ',
          breakdown: 'يَ + نْ + صُ + رُ',
          trans: 'Yansuru',
          meaning: 'Yardım eder, destekler',
          rule: 'Ye + Nun ihfa ile sakin + Sad kalın + Ra.',
        },
      ],
    },
    5: {
      title: '5. Sayfa: Beşli Kombinasyon Matrisi ve Kelime Tamamlama',
      subtitle: 'Nihai Kur\'ani Kelime Mimarisi & Ayet Düzeyi Heceleme',
      description: 'Tüm aşamaların sentezi olarak Kur\'an-ı Kerim\'deki en uzun kelime yapıları, vasıl ve vakıf kuralları ile tam kelime telaffuzu bu nihai sayfada tamamlanır.',
      formula: '5\'li ve Üzeri Tam Kur\'an Kelimeleri (Kelime Tamamlama Laboratuvarı)',
      samples: [
        {
          arabic: 'فَأَسْقَيْنَاكُمُوهُ',
          breakdown: 'فَ + أَ + سْ + قَ + يْ + نَ + ا + كُ + مُ + و + هُ',
          trans: 'Fe-eskaynâkümûhü',
          meaning: 'Böylece sizi onunla suladık (Hicr 22)',
          rule: 'Kur\'an-ı Kerim\'deki en uzun birleşik kelimelerden biri (11 harf & zamir yapısı).',
        },
        {
          arabic: 'الْمُسْتَقِيمَ',
          breakdown: 'ا + ل + م + س + ت + ق + ي + م',
          trans: 'El-Müstekîm',
          meaning: 'Dosdoğru olan (Fatiha 6)',
          rule: 'Harf-i tarif (El) + İstif\'al babı vezninde 8 harfli tam Kur\'ani kelime.',
        },
        {
          arabic: 'يَسْتَبْشِرُونَ',
          breakdown: 'ي + س + ت + ب + ش + ر + و + ن',
          trans: 'Yestebşirûn',
          meaning: 'Müjdelenip sevinirler (Al-i İmran 170)',
          rule: 'Bitişen ve ayrık harflerin mükemmel sentezi.',
        },
      ],
    },
  }[stage] || {
    title: 'Gelişmiş Aşama',
    subtitle: '',
    description: '',
    formula: '',
    samples: [],
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* Üst Başlık & Geri Dönüş */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
              Mimari Plan / İleri Aşama
            </span>
            <span className="text-xs text-stone-500">
              5 Aşamalı Müfredatın {stage}. Sayfası
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
            {stageData.title}
          </h2>
          <p className="text-sm text-stone-600">
            {stageData.subtitle}
          </p>
        </div>

        <button
          onClick={onBackToStage1}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer self-start sm:self-center"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>1. Sayfa Temel Matrise Dön</span>
        </button>
      </div>

      {/* Matematiksel ve Pedagojik Açıklama */}
      <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
          <Layers className="h-4 w-4 text-emerald-800" />
          <span>Matris Mantığı ve Derinlik Formülü:</span>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          {stageData.description}
        </p>
        <div className="inline-block text-xs font-semibold text-emerald-950 bg-emerald-100 px-3 py-1 rounded-md mt-1">
          Formül: {stageData.formula}
        </div>
      </div>

      {/* Örnek Kombinasyon Kartları */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-800" />
          Bu Aşamada Oluşan Örnek Kelimeler ve Birleşimler
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stageData.samples.map((sample, idx) => (
            <div
              key={idx}
              className="p-5 bg-white border border-stone-200 hover:border-emerald-400 rounded-xl shadow-xs transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-stone-500">
                  Örnek #{idx + 1}
                </div>
              </div>

              <div className="text-center py-2">
                <div className="font-quran text-4xl text-emerald-950">
                  {sample.arabic}
                </div>
                <div className="text-xs text-stone-500 font-mono mt-1">
                  Harf Ayrışımı: {sample.breakdown}
                </div>
              </div>

              <div className="border-t border-stone-100 pt-2 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">{sample.trans}</span>
                  <span className="text-stone-600 italic">"{sample.meaning}"</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-snug">
                  <strong className="text-stone-700">İmlâ Kuralı:</strong> {sample.rule}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Aşama Geliştirme Notu */}
      <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between">
        <div className="text-xs text-emerald-950">
          <strong>Sonraki Adım:</strong> 1. Sayfa temel 30x30 matrisi tamamlandıktan sonra, kullanıcı isteğine göre bu {stage}. aşamanın tam veri tablosu ve dinamik birleştiricisi genişletilecektir.
        </div>
        <button
          onClick={onBackToStage1}
          className="px-4 py-2 text-xs font-bold text-emerald-950 bg-white hover:bg-stone-50 border border-emerald-300 rounded-lg shadow-xs cursor-pointer whitespace-nowrap ml-4"
        >
          1. Sayfa Matrise Başla
        </button>
      </div>
    </div>
  );
};
