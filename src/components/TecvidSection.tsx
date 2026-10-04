import React, { useState, useEffect, useMemo } from 'react';
import {
  TECVID_TOPIC_CARDS,
  TECVID_EXAMPLES,
  SEMSI_LETTERS,
  KAMERI_LETTERS,
  MIXED_TECVID_WORDS,
  TECVID_QUIZ_QUESTIONS,
  TecvidExample,
  MixedTecvidWord
} from '../data/tecvidData';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Award,
  Check,
  Eye,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ElifbaTheme } from './ElifBaMode';

interface TecvidSectionProps {
  theme: ElifbaTheme;
  viewMode: 'desktop' | 'mobile';
  targetLesson?: number;
  targetTimestamp?: number;
}

export const TecvidSection: React.FC<TecvidSectionProps> = ({ theme, viewMode, targetLesson, targetTimestamp }) => {
  // Aktif Ders (0 - 11)
  const [activeLesson, setActiveLesson] = useState<number>(() => {
    if (typeof targetLesson === 'number' && targetLesson >= 0 && targetLesson <= 11) {
      return targetLesson;
    }
    try {
      const saved = localStorage.getItem('tecvid_active_lesson');
      return saved !== null ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const handleLessonChange = (lessonIndex: number) => {
    setActiveLesson(lessonIndex);
    try {
      localStorage.setItem('tecvid_active_lesson', lessonIndex.toString());
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (typeof targetLesson === 'number' && targetLesson >= 0 && targetLesson <= 11) {
      handleLessonChange(targetLesson);
    }
  }, [targetLesson, targetTimestamp]);

  // Tamamlanan Dersler (İlerleme Çubuğu için)
  const [completedLessons, setCompletedLessons] = useState<Record<number, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('tecvid_completed_lessons') || '{}');
    } catch {
      return {};
    }
  });

  const toggleLessonComplete = (lessonIndex: number) => {
    const updated = {
      ...completedLessons,
      [lessonIndex]: !completedLessons[lessonIndex]
    };
    setCompletedLessons(updated);
    try {
      localStorage.setItem('tecvid_completed_lessons', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const progressPercent = useMemo(() => {
    const total = 12;
    const done = Object.values(completedLessons).filter(Boolean).length;
    return Math.round((done / total) * 100);
  }, [completedLessons]);

  // 11. Ders: Karışık Tekrar Seviyesi
  const [mixedLevel, setMixedLevel] = useState<'kolay' | 'orta' | 'zor'>('kolay');
  const [revealedExamples, setRevealedExamples] = useState<Record<string, boolean>>({});

  const toggleReveal = (id: string) => {
    setRevealedExamples((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 12. Ders: Mini Sınav Durumu
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizAnsweredCount, setQuizAnsweredCount] = useState<number>(0);

  const currentQuiz = TECVID_QUIZ_QUESTIONS[quizIndex % TECVID_QUIZ_QUESTIONS.length];

  const handleSelectOption = (opt: string) => {
    if (selectedOption !== null) return; // zaten cevaplandı
    setSelectedOption(opt);
    setQuizAnsweredCount((prev) => prev + 1);
    if (opt === currentQuiz.correctRule) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    setSelectedOption(null);
    setQuizIndex((prev) => (prev + 1) % TECVID_QUIZ_QUESTIONS.length);
  };

  const handleResetQuiz = () => {
    setSelectedOption(null);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnsweredCount(0);
  };

  // Roadmap Başlıkları
  const roadmapItems = [
    { id: 0, title: '1. Tecvid nedir?' },
    { id: 1, title: '2. Nûn & Tenvin' },
    { id: 2, title: '3. Mîm Sâkin' },
    { id: 3, title: '4. Medler' },
    { id: 4, title: '5. Gunne' },
    { id: 5, title: '6. Kalkale' },
    { id: 6, title: '7. Lâm-ı Tarif' },
    { id: 7, title: '8. Lafzatullah' },
    { id: 8, title: "9. Râ'nın hükümleri" },
    { id: 9, title: '10. Vakıf & Başlangıç' },
    { id: 10, title: '11. Karışık tekrar' },
    { id: 11, title: '12. Mini sınav' }
  ];

  // Stil tanımları: Dark mod vs Emerald mod (ElifBaMode ile tam uyumlu)
  const isDark = theme === 'dark';

  const cardBg = isDark ? 'bg-[#211d16] border-[#3a3226]' : 'bg-white border-slate-200 shadow-sm';
  const innerCardBg = isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-50 border-slate-200';
  const textHeading = isDark ? 'text-[#3fb996]' : 'text-emerald-800';
  const textBody = isDark ? 'text-[#f1ecdd]' : 'text-slate-700';
  const textMuted = isDark ? 'text-[#b9b09a]' : 'text-slate-500';
  const textAccent = isDark ? 'text-[#3fb996]' : 'text-emerald-700';
  const tagBg = isDark ? 'bg-[#181510] text-[#3fb996] border-[#3a3226]' : 'bg-emerald-50 text-emerald-800 border-emerald-200';
  const noteBox = isDark ? 'bg-[#1c3630]/60 border border-[#3fb996]/30 text-[#3fb996]' : 'bg-emerald-50 border border-emerald-200 text-emerald-900';
  const tableThead = isDark ? 'bg-[#1c3630] text-[#3fb996] font-bold' : 'bg-emerald-50 text-emerald-950 font-bold';
  const tableDivide = isDark ? 'divide-[#3a3226]' : 'divide-slate-200';
  const tableBorder = isDark ? 'border-[#3a3226]' : 'border-slate-200';

  // Kart Bileşeni (Tecvid Örneği)
  const renderExampleCard = (ex: TecvidExample, index: number, prefix: string) => {
    const cardId = `${prefix}_${index}`;
    const isRevealed = revealedExamples[cardId];

    return (
      <div
        key={cardId}
        id={`card-${cardId}`}
        onClick={() => toggleReveal(cardId)}
        className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
          isRevealed
            ? isDark
              ? 'bg-[#1c3630]/60 border-[#3fb996]/50 shadow-sm'
              : 'bg-emerald-50 border-emerald-400 shadow-2xs'
            : isDark
            ? 'bg-[#181510] border-[#3a3226] hover:border-[#3fb996]/60'
            : 'bg-white border-slate-200 hover:border-emerald-300 shadow-2xs'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${tagBg}`}>
            {ex.rule}
          </span>
          <span className={`text-[11px] flex items-center gap-1 ${textMuted}`}>
            <Eye className="w-3.5 h-3.5" />
            {isRevealed ? 'Gizle' : 'İncele'}
          </span>
        </div>

        {/* Arapça İbare */}
        <div className={`py-2.5 text-center font-amiri text-3xl sm:text-4xl font-bold tracking-wide ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">
          {ex.ar}
        </div>

        {/* Okunuş ve Açıklama (Tıklanınca veya Masaüstü Modunda) */}
        <div className={`mt-2 pt-2 border-t text-xs ${isDark ? 'border-[#3a3226]' : 'border-slate-100'} ${isRevealed ? 'block' : viewMode === 'desktop' ? 'block opacity-90' : 'hidden'}`}>
          <div className={`font-semibold ${isDark ? 'text-[#f1ecdd]' : 'text-slate-900'} mb-1`}>
            🗣 Okunuş: <span className={isDark ? 'text-[#3fb996] font-medium' : 'text-emerald-700 font-medium'}>{ex.read}</span>
          </div>
          <div className={`${textMuted} text-[11px] leading-relaxed`}>
            💡 {ex.desc}
          </div>
        </div>

        {!isRevealed && viewMode === 'mobile' && (
          <div className={`text-center text-[11px] mt-1 ${isDark ? 'text-[#b9b09a]' : 'text-slate-400'}`}>
            Detayı görmek için dokun
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`w-full flex flex-col space-y-6 ${viewMode === 'desktop' ? 'max-w-5xl mx-auto px-2 sm:px-6' : 'max-w-md mx-auto'}`}>
      {/* 1. HERO BÖLÜMÜ */}
      <div className={`p-5 sm:p-7 rounded-2xl border transition-all ${cardBg}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex-1">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 border ${tagBg}`}>
              <Sparkles className="w-3.5 h-3.5 text-[#3fb996]" />
              <span>Tecvid Öğrenme Rehberi</span>
            </div>
            <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 ${textHeading}`}>
              📘 Tecvid Öğrenme Atölyesi
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed max-w-3xl ${textBody}`}>
              Önce kuralın mantığını öğren, sonra örneği kendin oku, ardından{' '}
              <strong className={isDark ? 'text-[#3fb996] font-semibold' : 'text-emerald-700 font-semibold'}>“öğrendim”</strong> diyerek ilerle.
              Amaç kuru ezber değil; Kur’an okurken{' '}
              <span className={`font-semibold ${isDark ? 'text-[#3fb996] underline decoration-[#3fb996]/50' : 'text-emerald-700 underline decoration-emerald-500/50'}`}>
                işareti gör → kuralı fark et → doğru sesi uygula
              </span>{' '}
              alışkanlığı kazanmaktır.
            </p>
          </div>

          {/* İlerleme Göstergesi */}
          <div className={`w-full md:w-64 p-4 rounded-xl border flex flex-col gap-2 ${innerCardBg}`}>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className={textHeading}>Tecvid İlerlemesi</span>
              <span className={textAccent}>%{progressPercent}</span>
            </div>
            <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-[#3a3226]' : 'bg-slate-200/80'}`}>
              <div
                className={`h-full transition-all duration-500 rounded-full ${isDark ? 'bg-[#3fb996]' : 'bg-emerald-600'}`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className={`text-[11px] ${textMuted} flex justify-between items-center`}>
              <span>12 Dersten {Object.values(completedLessons).filter(Boolean).length} tanesi tamam</span>
              {progressPercent === 100 && (
                <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                  <Award className="w-3.5 h-3.5" /> Tebrikler!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Önemli Not Kutusu */}
        <div className={`mt-5 p-4 rounded-xl border text-xs sm:text-sm leading-relaxed flex items-start gap-3 ${noteBox}`}>
          <HelpCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Önemli:</strong> Tecvid; harfleri sadece “nasıl yazıldığını” değil,
            Kur’an okunurken sesin nerede uzatılacağını, nerede tutulacağını, nerede gizleneceğini veya açık okunacağını öğretir.
            Bu bölüm bir başlangıç ve pekiştirme atölyesidir. Mahreç, sıfat ve uygulamalı okuyuş için ehil bir hocanın dinleyerek düzeltmesi en güvenilir yoldur.
          </div>
        </div>
      </div>

      {/* 2. DERS MENÜSÜ (ROADMAP) */}
      <div className={`p-4 rounded-2xl border ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <span className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>
            Ders Seçimi (12 Aşamalı Müfredat)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={activeLesson === 0}
              onClick={() => handleLessonChange(activeLesson - 1)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border cursor-pointer ${
                activeLesson === 0
                  ? 'opacity-40 cursor-not-allowed border-transparent'
                  : isDark
                  ? 'bg-[#181510] text-[#3fb996] border-[#3a3226] hover:bg-[#3a3226]'
                  : 'bg-slate-100 text-emerald-800 border-slate-200 hover:bg-emerald-50'
              }`}
              title="Önceki Ders"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Önceki</span>
            </button>

            <span className={`text-xs ${textAccent} font-semibold px-1`}>
              {activeLesson + 1} / 12: {roadmapItems[activeLesson].title}
            </span>

            <button
              disabled={activeLesson === 11}
              onClick={() => handleLessonChange(activeLesson + 1)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border cursor-pointer ${
                activeLesson === 11
                  ? 'opacity-40 cursor-not-allowed border-transparent'
                  : isDark
                  ? 'bg-[#181510] text-[#3fb996] border-[#3a3226] hover:bg-[#3a3226]'
                  : 'bg-slate-100 text-emerald-800 border-slate-200 hover:bg-emerald-50'
              }`}
              title="Sonraki Ders"
            >
              <span>Sonraki</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Desktop ve Mobil uyumlu kaydırılabilir / grid düğmeler */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {roadmapItems.map((item) => {
            const isActive = activeLesson === item.id;
            const isDone = completedLessons[item.id];

            return (
              <button
                key={item.id}
                id={`btn-tecvid-lesson-${item.id}`}
                onClick={() => handleLessonChange(item.id)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer flex items-center justify-between gap-1 border ${
                  isActive
                    ? isDark
                      ? 'bg-[#3fb996] text-[#181510] border-[#3fb996] shadow-sm font-bold'
                      : 'bg-emerald-700 text-white border-emerald-700 shadow-sm font-bold'
                    : isDark
                    ? 'bg-[#181510] text-[#b9b09a] border-[#3a3226] hover:text-[#f1ecdd] hover:bg-[#3a3226]/50'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                }`}
              >
                <span className="truncate">{item.title}</span>
                {isDone && (
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isActive ? (isDark ? 'text-[#181510]' : 'text-emerald-200') : 'text-emerald-500'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. AKTİF DERS İÇERİĞİ */}
      <div className="space-y-6">

        {/* =====================================================
             1. DERS — TECVİD NEDİR?
             ===================================================== */}
        {activeLesson === 0 && (
          <div className="space-y-6">
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tagBg}`}>
                  TEMEL MANTIK
                </span>
                <span className={`text-xs ${textMuted}`}>1. Ders</span>
              </div>

              <h3 className={`text-xl sm:text-2xl font-bold ${textHeading}`}>
                Tecvid nedir?
              </h3>

              <p className={`text-xs sm:text-sm leading-relaxed ${textBody}`}>
                Tecvid, Kur’an-ı Kerim’i harflerin <strong>mahreçlerine</strong> ve <strong>sıfatlarına</strong> uygun okuyup,
                gerekli yerlerdeki uzatma, birleştirme, gizleme, açık okuma ve benzeri kuralları doğru uygulama ilmidir.
              </p>

              {/* Dört adımlı kural formülü */}
              <div className={`p-4 rounded-xl border font-medium text-xs sm:text-sm leading-relaxed ${innerCardBg}`}>
                <div className={`font-bold mb-2 ${textHeading}`}>Kur’an okurken dört adımlı düşün:</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center">
                  <div className={`p-2.5 rounded-lg border ${cardBg}`}>
                    <span className={`font-bold ${textAccent}`}>1)</span> Harfi tanı
                  </div>
                  <div className={`p-2.5 rounded-lg border ${cardBg}`}>
                    <span className={`font-bold ${textAccent}`}>2)</span> İşareti fark et
                  </div>
                  <div className={`p-2.5 rounded-lg border ${cardBg}`}>
                    <span className={`font-bold ${textAccent}`}>3)</span> Yanındaki harfe bak
                  </div>
                  <div className={`p-2.5 rounded-lg border ${cardBg}`}>
                    <span className={`font-bold ${textAccent}`}>4)</span> Hükmü uygula
                  </div>
                </div>
              </div>

              {/* İpucu */}
              <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${noteBox}`}>
                <strong>Örnek düşünme şekli:</strong> Bir kelimede “<span className={`font-amiri text-base font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">نْ</span>” gördün.
                Hemen sadece “nun” deyip geçmek yerine, <strong>sonraki harfe bak</strong>. Çünkü sonraki harf kuralı ve okuyuşu baştan aşağı değiştirebilir!
              </div>

              <h4 className={`text-base font-bold pt-2 ${textHeading}`}>
                Tecvidde en çok karşılaşacağın başlıklar
              </h4>
              <p className={`text-xs ${textMuted}`}>
                Sadece adını ezberleme; hangi harfleri görünce o kurala bakacağını da birlikte gör:
              </p>

              {/* Konu Kartları Izgarası */}
              <div className={`grid gap-3.5 ${viewMode === 'desktop' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {TECVID_TOPIC_CARDS.map((topic, i) => (
                  <div key={i} className={`p-4 rounded-xl border flex flex-col justify-between ${innerCardBg}`}>
                    <div>
                      <h5 className={`font-bold text-sm mb-1.5 ${textHeading}`}>{topic.title}</h5>
                      <div className={`font-amiri text-lg font-semibold mb-2 ${isDark ? 'text-[#3fb996]' : 'text-emerald-600'}`} dir="rtl">
                        {topic.letters}
                      </div>
                      <p className={`text-xs leading-relaxed ${textMuted}`}>{topic.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Giriş Alıştırması */}
              <div className={`pt-4 border-t ${isDark ? 'border-[#3a3226]' : 'border-slate-200'}`}>
                <div className={`text-xs font-semibold mb-3 ${textBody}`}>
                  <strong>Alıştırma:</strong> Aşağıdaki üç örneği önce kuralı düşünmeden oku. Sonra kartlara dokunarak neden öyle okunduğunu incele:
                </div>
                <div className={`grid gap-3 ${viewMode === 'desktop' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'}`}>
                  {TECVID_EXAMPLES.intro.map((ex, i) => renderExampleCard(ex, i, 'intro'))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
             2. DERS — NÛN-I SÂKİN & TENVİN
             ===================================================== */}
        {activeLesson === 1 && (
          <div className="space-y-6">
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tagBg}`}>
                NÛN-I SÂKİN & TENVİN
              </span>
              <h3 className={`text-xl sm:text-2xl font-bold ${textHeading}`}>Önce mantığı kavra</h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${textBody}`}>
                <strong>Nûn-ı sâkin</strong> “<span className={`font-amiri text-base font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">نْ</span>” şeklindeki cezimli/harekesiz nûn’dur.
                <strong>Tenvin</strong> ise kelime sonunda bulunan iki üstün, iki esre veya iki ötre (“<span className={`font-amiri text-base font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>ً ٍ ٌ</span>”) işaretleridir.
                İkisinde de tecvidin temel sorusu aynıdır:
              </p>
              <div className={`p-3.5 rounded-xl border text-center font-bold text-sm sm:text-base ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'} ${innerCardBg}`}>
                “Nûn sesinden sonra hangi harf geliyor?”
              </div>
              <p className={`text-xs sm:text-sm ${textBody}`}>
                Bu sorunun cevabı dört temel hükümden birine götürür: <strong>İzhâr, İdğâm, İklâb, İhfâ</strong>.
              </p>
            </div>

            {/* 1 / 4 İzhâr */}
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tagBg}`}>1 / 4</span>
              <h3 className={`text-lg sm:text-xl font-bold ${textHeading}`}>İzhâr-ı Halkî — Açık okumak</h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${textBody}`}>
                Nûn sâkin veya tenvinden sonra boğaz harflerinden biri gelirse nûn sesi <strong>açık, net ve duraksamadan</strong> okunur.
                Boğaz harfleri 6 tanedir: <strong className={`font-amiri text-xl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">ء ه ع ح غ خ</strong>
              </p>
              <div className={`grid gap-3 ${viewMode === 'desktop' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {TECVID_EXAMPLES.izhar.map((ex, i) => renderExampleCard(ex, i, 'izhar'))}
              </div>
              <div className={`p-3 rounded-xl border text-xs ${innerCardBg}`}>
                💡 <strong>Mantık:</strong> Nûn’dan sonra boğaz harfi gördüm → nûnu kaybetmeden, burna çekmeden açıkça göster.
              </div>
            </div>

            {/* 2 / 4 İdğâm */}
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tagBg}`}>2 / 4</span>
              <h3 className={`text-lg sm:text-xl font-bold ${textHeading}`}>İdğâm — Katmak ve Birleştirmek</h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${textBody}`}>
                İdğâm, bir harfin sesini kendisinden sonraki harfe <strong>katmak/şeddelemek</strong> demektir.
                Nûn sâkin ve tenvin için idğâm harfleri 6 tanedir: <strong className={`font-amiri text-xl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">ي ر م ل و ن</strong> (Yermelûn).
              </p>

              {/* Mini Tablo */}
              <div className="overflow-x-auto">
                <table className={`w-full text-xs text-left border rounded-xl overflow-hidden ${tableBorder}`}>
                  <thead className={tableThead}>
                    <tr>
                      <th className="p-2.5">Tür</th>
                      <th className="p-2.5 text-center">Harfler</th>
                      <th className="p-2.5">Mantık ve Uygulama</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${tableDivide}`}>
                    <tr>
                      <td className="p-2.5 font-bold">Gunneli (Mealgumme)</td>
                      <td className={`p-2.5 text-center font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">ي ن م و</td>
                      <td className="p-2.5">Birleşme + genizden 1.5 hareke gunne tutulur.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">Gunnesiz (Bilagumme)</td>
                      <td className={`p-2.5 text-center font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">ل ر</td>
                      <td className="p-2.5">Tam birleşme, geniz sesi (gunne) yapılmaz.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className={`grid gap-3 ${viewMode === 'desktop' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {TECVID_EXAMPLES.idgam.map((ex, i) => renderExampleCard(ex, i, 'idgam'))}
              </div>
            </div>

            {/* 3 / 4 İklâb */}
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tagBg}`}>3 / 4</span>
              <h3 className={`text-lg sm:text-xl font-bold ${textHeading}`}>İklâb — Nûn sesinin mîme dönmesi</h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${textBody}`}>
                Nûn sâkin veya tenvinden sonra <strong className={`font-amiri text-xl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>ب (Be)</strong> harfi gelirse,
                nûn sesi mîm (<strong className={`font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>م</strong>) sesine çevrilir ve dudaklar hafifçe tutularak <strong>gunneli</strong> okunur.
              </p>
              <div className={`p-3 rounded-xl border text-xs text-center font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'} ${innerCardBg}`}>
                Kısa Şifre: “Nûn/Tenvin + ب = İklâb (n sesi m'ye döner)”
              </div>
              <div className={`grid gap-3 ${viewMode === 'desktop' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {TECVID_EXAMPLES.iklab.map((ex, i) => renderExampleCard(ex, i, 'iklab'))}
              </div>
            </div>

            {/* 4 / 4 İhfâ */}
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tagBg}`}>4 / 4</span>
              <h3 className={`text-lg sm:text-xl font-bold ${textHeading}`}>İhfâ — Gizleyerek okumak</h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${textBody}`}>
                İzhâr ile idğâm arasında bir okuyuştur. Nûn sesi ne tamamen açık söylenir ne de sonraki harfe tamamen katılır.
                Dil damağa tam yapıştırılmadan, <strong>gunneli bir gizleme</strong> yapılır. İhfâ harfleri 15 tanedir:
              </p>
              <div className={`p-3 rounded-xl border font-amiri text-lg sm:text-xl text-center tracking-widest ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'} ${innerCardBg}`} dir="rtl">
                ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك
              </div>
              <div className={`grid gap-3 ${viewMode === 'desktop' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {TECVID_EXAMPLES.ihfa.map((ex, i) => renderExampleCard(ex, i, 'ihfa'))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
             3. DERS — MÎM SÂKİN
             ===================================================== */}
        {activeLesson === 2 && (
          <div className="space-y-6">
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tagBg}`}>MÎM SÂKİN</span>
              <h3 className={`text-xl sm:text-2xl font-bold ${textHeading}`}>
                مْ gördüğünde sonraki harfe bak
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${textBody}`}>
                Sâkin mîm (<strong className={`font-amiri text-xl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">مْ</strong>) sonrasında sadece 3 temel hüküm vardır:
              </p>

              <div className="overflow-x-auto">
                <table className={`w-full text-xs text-left border rounded-xl overflow-hidden ${tableBorder}`}>
                  <thead className={tableThead}>
                    <tr>
                      <th className="p-2.5">Hüküm</th>
                      <th className="p-2.5 text-center">Sonraki Harf</th>
                      <th className="p-2.5">Kısa Açıklama</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${tableDivide}`}>
                    <tr>
                      <td className="p-2.5 font-bold">1) İhfâ-ı Şefevî (Dudak İhfâsı)</td>
                      <td className={`p-2.5 text-center font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">ب</td>
                      <td className="p-2.5">Mîm gizli, dudaklar hafifçe tutularak gunneli okuyuş.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">2) İdğâm-ı Şefevî (Dudak İdğâmı)</td>
                      <td className={`p-2.5 text-center font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">م</td>
                      <td className="p-2.5">İki mîm şeddeli gibi birleşir, gunne yapılır.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">3) İzhâr-ı Şefevî (Dudak İzhârı)</td>
                      <td className="p-2.5 text-center font-medium">Diğer tüm harfler</td>
                      <td className="p-2.5">Mîm sesi net ve açıkça okunur.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* İhfâ-ı Şefevî Örnekleri */}
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <h4 className={`text-base sm:text-lg font-bold ${textHeading}`}>1) İhfâ-ı Şefevî (مْ + ب)</h4>
              <p className={`text-xs ${textBody}`}>Mîm sâkinden sonra Be harfi gelirse dudaklar kilitlenmeden gunne verilir:</p>
              <div className={`grid gap-3 ${viewMode === 'desktop' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'}`}>
                {TECVID_EXAMPLES.mim_ihfa.map((ex, i) => renderExampleCard(ex, i, 'mim_ihfa'))}
              </div>
            </div>

            {/* İdğâm-ı Şefevî Örnekleri */}
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <h4 className={`text-base sm:text-lg font-bold ${textHeading}`}>2) İdğâm-ı Şefevî (مْ + م)</h4>
              <p className={`text-xs ${textBody}`}>Mîm sâkinden sonra yine Mîm gelirse iki mîm birleşir:</p>
              <div className={`grid gap-3 ${viewMode === 'desktop' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'}`}>
                {TECVID_EXAMPLES.mim_idgam.map((ex, i) => renderExampleCard(ex, i, 'mim_idgam'))}
              </div>
            </div>

            {/* İzhâr-ı Şefevî Örnekleri */}
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <h4 className={`text-base sm:text-lg font-bold ${textHeading}`}>3) İzhâr-ı Şefevî (مْ + Diğerleri)</h4>
              <p className={`text-xs ${textBody}`}>Mîm sâkinden sonra Be ve Mîm dışındaki herhangi bir harf gelirse açıkça okunur:</p>
              <div className={`grid gap-3 ${viewMode === 'desktop' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'}`}>
                {TECVID_EXAMPLES.mim_izhar.map((ex, i) => renderExampleCard(ex, i, 'mim_izhar'))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
             4. DERS — MEDLER (UZATMALAR)
             ===================================================== */}
        {activeLesson === 3 && (
          <div className="space-y-6">
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tagBg}`}>MED = UZATMA</span>
              <h3 className={`text-xl sm:text-2xl font-bold ${textHeading}`}>Med mantığını sıfırdan öğren</h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${textBody}`}>
                Med, sesi normal tek harf süresinden daha uzun okumaktır. Başlangıçta en önemli 3 med harfini tanı:
              </p>

              <div className="overflow-x-auto">
                <table className={`w-full text-xs text-left border rounded-xl overflow-hidden ${tableBorder}`}>
                  <thead className={tableThead}>
                    <tr>
                      <th className="p-2.5 text-center">Harf</th>
                      <th className="p-2.5">Öncesindeki Hareke</th>
                      <th className="p-2.5 text-center">Örnek</th>
                      <th className="p-2.5">Ses</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${tableDivide}`}>
                    <tr>
                      <td className={`p-2.5 text-center font-amiri text-xl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">ا</td>
                      <td className="p-2.5">Üstün (Fetha)</td>
                      <td className={`p-2.5 text-center font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">قَالَ</td>
                      <td className="p-2.5">â (Kâle)</td>
                    </tr>
                    <tr>
                      <td className={`p-2.5 text-center font-amiri text-xl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">وْ</td>
                      <td className="p-2.5">Ötre (Damme)</td>
                      <td className={`p-2.5 text-center font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">يَقُولُ</td>
                      <td className="p-2.5">û (Yekûlü)</td>
                    </tr>
                    <tr>
                      <td className={`p-2.5 text-center font-amiri text-xl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">يْ</td>
                      <td className="p-2.5">Esre (Kesre)</td>
                      <td className={`p-2.5 text-center font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">قِيلَ</td>
                      <td className="p-2.5">î (Kîle)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Med Çeşitleri Tablosu */}
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <h4 className={`text-base sm:text-lg font-bold ${textHeading}`}>Med çeşitlerini ayırmaya başla</h4>
              <div className="overflow-x-auto">
                <table className={`w-full text-xs text-left border rounded-xl overflow-hidden ${tableBorder}`}>
                  <thead className={tableThead}>
                    <tr>
                      <th className="p-2.5">Med Çeşidi</th>
                      <th className="p-2.5">Nasıl Fark Edilir?</th>
                      <th className="p-2.5">Örnek</th>
                      <th className="p-2.5">Ölçü</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${tableDivide}`}>
                    <tr>
                      <td className="p-2.5 font-bold">Tabîî</td>
                      <td className="p-2.5">Sebebsiz doğal uzatma</td>
                      <td className={`p-2.5 font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">قَالَ</td>
                      <td className="p-2.5">1 Elif (2 hareke)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">Muttasıl</td>
                      <td className="p-2.5">Med harfi + hemze aynı kelimede</td>
                      <td className={`p-2.5 font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">جَاءَ</td>
                      <td className="p-2.5">4 Elif (Zorunlu)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">Munfasıl</td>
                      <td className="p-2.5">Med harfi birinde, hemze diğer kelimede</td>
                      <td className={`p-2.5 font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">بِمَا أُنْزِلَ</td>
                      <td className="p-2.5">2 - 4 Elif</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">Lâzım</td>
                      <td className="p-2.5">Med harfinden sonra aslî sükûn/şedde</td>
                      <td className={`p-2.5 font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">الضَّالِّينَ</td>
                      <td className="p-2.5">4 Elif (Zorunlu)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">Ârız</td>
                      <td className="p-2.5">Durulduğunda son harf sâkinleşir</td>
                      <td className={`p-2.5 font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">الْعَالَمِينَ</td>
                      <td className="p-2.5">1 - 4 Elif</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h5 className={`font-bold text-sm pt-2 ${textHeading}`}>Med Örnekleri</h5>
              <div className={`grid gap-3 ${viewMode === 'desktop' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {TECVID_EXAMPLES.med.map((ex, i) => renderExampleCard(ex, i, 'med'))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
             5. DERS — GUNNE
             ===================================================== */}
        {activeLesson === 4 && (
          <div className="space-y-6">
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tagBg}`}>GUNNE</span>
              <h3 className={`text-xl sm:text-2xl font-bold ${textHeading}`}>Gunne nedir?</h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${textBody}`}>
                Gunne, genizden (burun boşluğundan) gelen hoş ve tınılı burunsu sestir.
                Özellikle <strong className={`font-amiri text-xl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">نّ (Şeddeli Nûn)</strong> ve{' '}
                <strong className={`font-amiri text-xl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">مّ (Şeddeli Mîm)</strong> olduğunda çok belirgin şekilde yaklaşık 1.5 elif miktarı tutularak icra edilir.
              </p>
              <div className={`p-3.5 rounded-xl border text-center font-bold text-sm ${isDark ? 'text-[#3fb996]' : 'text-emerald-800'} ${innerCardBg}`}>
                Şeddeli Nûn / Mîm → Genizden Gunne Sesi
              </div>
              <div className={`grid gap-3 ${viewMode === 'desktop' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {TECVID_EXAMPLES.gunne.map((ex, i) => renderExampleCard(ex, i, 'gunne'))}
              </div>
            </div>

            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <h4 className={`text-base font-bold ${textHeading}`}>Gunne duyma alıştırması</h4>
              <p className={`text-xs ${textBody}`}>
                Önce kartların Arapçasına bak. “n” veya “m” sesinin genizden daha belirgin uzadığını kendi kulağınla fark etmeye çalış:
              </p>
              <div className={`grid gap-3 ${viewMode === 'desktop' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'}`}>
                {TECVID_EXAMPLES.gunne_practice.map((ex, i) => renderExampleCard(ex, i, 'gunne_practice'))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
             6. DERS — KALKALE
             ===================================================== */}
        {activeLesson === 5 && (
          <div className="space-y-6">
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tagBg}`}>ق ط ب ج د</span>
              <h3 className={`text-xl sm:text-2xl font-bold ${textHeading}`}>
                Kalkale — sâkin harfte yankılanma
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${textBody}`}>
                Kalkale harfleri 5 tanedir: <strong className={`font-amiri text-xl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">ق ط ب ج د</strong> (Kutup Ced / قطب جد).
                Bu harflerden biri cezimli (sâkin) olduğunda veya durak sebebiyle üzerinde durulduğunda ses kilitlenmez;
                mahrecine hafif bir vuruşla <strong>yankı ve geri dönüş</strong> hissettirilir.
              </p>

              <div className={`grid gap-3 ${viewMode === 'desktop' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {TECVID_EXAMPLES.kalkale.map((ex, i) => renderExampleCard(ex, i, 'kalkale'))}
              </div>

              <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${innerCardBg}`}>
                💡 <strong>Önemli:</strong> Kalkale harfe yeni bir hareke (a/e/i) vermek değildir. Amaç harfi harekeli yapmadan sesin keskinliğini ve netliğini hissettirmektir.
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
             7. DERS — LÂM-I TARİF (ŞEMSİYYE & KAMERİYYE)
             ===================================================== */}
        {activeLesson === 6 && (
          <div className="space-y-6">
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tagBg}`}>اَلْ</span>
              <h3 className={`text-xl sm:text-2xl font-bold ${textHeading}`}>
                Lâm-ı Tarif: Şemsiyye ve Kameriyye
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${textBody}`}>
                “<span className={`font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">ال</span>” takısında ilk bakacağın şey, lâm’dan sonra gelen harftir:
              </p>

              <div className="overflow-x-auto">
                <table className={`w-full text-xs text-left border rounded-xl overflow-hidden ${tableBorder}`}>
                  <thead className={tableThead}>
                    <tr>
                      <th className="p-2.5">Tür</th>
                      <th className="p-2.5">Ne Olur?</th>
                      <th className="p-2.5 text-center">Örnek</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${tableDivide}`}>
                    <tr>
                      <td className="p-2.5 font-bold">Şemsiyye (Güneş Harfleri)</td>
                      <td className="p-2.5">Lâm yazılır ama okunmaz; sonraki harf şeddeli okunur.</td>
                      <td className={`p-2.5 text-center font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">الشَّمْسُ (Eş-şems)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">Kameriyye (Ay Harfleri)</td>
                      <td className="p-2.5">Lâm açıkça ve cezimli olarak okunur.</td>
                      <td className={`p-2.5 text-center font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">الْقَمَرُ (El-kamer)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className={`grid gap-3 ${viewMode === 'desktop' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {TECVID_EXAMPLES.lamtarif.map((ex, i) => renderExampleCard(ex, i, 'lamtarif'))}
              </div>
            </div>

            {/* Şemsî Harfler Gridi */}
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <h4 className={`text-base font-bold ${textHeading}`}>Şemsî Harfler (14 Harf) — Lâm Okunmaz</h4>
              <p className={`text-xs ${textMuted}`}>Bu harflerden biri gelirse lâm düşer, harf şeddelenir:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {SEMSI_LETTERS.map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border text-center ${innerCardBg}`}>
                    <div className={`font-amiri text-2xl font-bold mb-1 ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`}>{item.ar}</div>
                    <div className="text-[11px] font-semibold">{item.name}</div>
                    <div className={`font-amiri text-sm mt-1 ${isDark ? 'text-[#3fb996]/80' : 'text-emerald-600'}`} dir="rtl">{item.sample}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kamerî Harfler Gridi */}
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <h4 className={`text-base font-bold ${textHeading}`}>Kamerî Harfler (14 Harf) — Lâm Açık Okunur</h4>
              <p className={`text-xs ${textMuted}`}>Bu harflerden biri gelirse lâm net bir şekilde cezimli okunur:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {KAMERI_LETTERS.map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border text-center ${innerCardBg}`}>
                    <div className={`font-amiri text-2xl font-bold mb-1 ${isDark ? 'text-[#3fb996]' : 'text-teal-700'}`}>{item.ar}</div>
                    <div className="text-[11px] font-semibold">{item.name}</div>
                    <div className={`font-amiri text-sm mt-1 ${isDark ? 'text-emerald-400/80' : 'text-teal-600'}`} dir="rtl">{item.sample}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
             8. DERS — LAFZATULLAH
             ===================================================== */}
        {activeLesson === 7 && (
          <div className="space-y-6">
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tagBg}`}>اللّٰه</span>
              <h3 className={`text-xl sm:text-2xl font-bold ${textHeading}`}>
                Lafzatullah'ın lâmı: kalın mı ince mi?
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${textBody}`}>
                “Allah” (<span className={`font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">اللّٰه</span>) kelimesindeki lâm harfinin okuyuşu,
                <strong> kendinden önceki harfin harekesine</strong> göre değişir:
              </p>

              <div className="overflow-x-auto">
                <table className={`w-full text-xs text-left border rounded-xl overflow-hidden ${tableBorder}`}>
                  <thead className={tableThead}>
                    <tr>
                      <th className="p-2.5">Önceki Hareke</th>
                      <th className="p-2.5">Okuyuş Hükmü</th>
                      <th className="p-2.5 text-center">Örnek</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${tableDivide}`}>
                    <tr>
                      <td className="p-2.5 font-bold">Üstün (Fetha) veya Ötre (Damme)</td>
                      <td className="p-2.5">Kalın (Tok sesle)</td>
                      <td className={`p-2.5 text-center font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">قَالَ اللّٰهُ / نَصْرُ اللّٰهِ</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">Esre (Kesre)</td>
                      <td className="p-2.5">İnce (Yumuşak sesle)</td>
                      <td className={`p-2.5 text-center font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">بِاللّٰهِ / بِسْمِ اللّٰهِ</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className={`grid gap-3 ${viewMode === 'desktop' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {TECVID_EXAMPLES.lafzatullah.map((ex, i) => renderExampleCard(ex, i, 'lafzatullah'))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
             9. DERS — RÂ HARFİNİN HÜKÜMLERİ
             ===================================================== */}
        {activeLesson === 8 && (
          <div className="space-y-6">
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tagBg}`}>ر</span>
              <h3 className={`text-xl sm:text-2xl font-bold ${textHeading}`}>
                Râ'nın kalın ve ince okunması
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${textBody}`}>
                Râ harfi bazen kalın, bazen ince okunur. Başlangıç seviyesinde şu ana prensipleri öğren:
              </p>

              <div className="overflow-x-auto">
                <table className={`w-full text-xs text-left border rounded-xl overflow-hidden ${tableBorder}`}>
                  <thead className={tableThead}>
                    <tr>
                      <th className="p-2.5">Râ Durumu</th>
                      <th className="p-2.5">Hüküm</th>
                      <th className="p-2.5 text-center">Örnek</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${tableDivide}`}>
                    <tr>
                      <td className={`p-2.5 font-bold font-amiri text-lg ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">رَ (Üstünlü)</td>
                      <td className="p-2.5">Kalın</td>
                      <td className={`p-2.5 text-center font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">رَبِّ (Rabbi)</td>
                    </tr>
                    <tr>
                      <td className={`p-2.5 font-bold font-amiri text-lg ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">رُ (Ötreli)</td>
                      <td className="p-2.5">Kalın</td>
                      <td className={`p-2.5 text-center font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">رُسُلٌ (Rüsül)</td>
                    </tr>
                    <tr>
                      <td className={`p-2.5 font-bold font-amiri text-lg ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">رِ (Esreli)</td>
                      <td className="p-2.5">İnce</td>
                      <td className={`p-2.5 text-center font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">رِزْقٌ (Rızk)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">Sâkin Râ (Öncesi Üstün/Ötre)</td>
                      <td className="p-2.5">Kalın</td>
                      <td className={`p-2.5 text-center font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">الْقُرْآنُ / مَرْيَمُ</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">Sâkin Râ (Öncesi Esre)</td>
                      <td className="p-2.5">İnce</td>
                      <td className={`p-2.5 text-center font-amiri text-lg font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">فِرْعَوْنَ / وَاسْتَغْفِرْهُ</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className={`grid gap-3 ${viewMode === 'desktop' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {TECVID_EXAMPLES.ra.map((ex, i) => renderExampleCard(ex, i, 'ra'))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
             10. DERS — VAKIF & İBTİDÂ
             ===================================================== */}
        {activeLesson === 9 && (
          <div className="space-y-6">
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tagBg}`}>VAKIF & İBTİDÂ</span>
              <h3 className={`text-xl sm:text-2xl font-bold ${textHeading}`}>
                Nerede duracağını ve nasıl duracağını öğren
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${textBody}`}>
                <strong>Vakıf</strong> okumayı nefes alarak kesip durmaktır. <strong>İbtidâ</strong> ise durduktan sonra uygun yerden başlamaktır.
                Kur’an’da durak işaretleri anlam bütünlüğünü korumak için konulmuştur:
              </p>

              <div className="overflow-x-auto">
                <table className={`w-full text-xs text-left border rounded-xl overflow-hidden ${tableBorder}`}>
                  <thead className={tableThead}>
                    <tr>
                      <th className="p-2.5 text-center">İşaret</th>
                      <th className="p-2.5">Açıklama</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${tableDivide}`}>
                    <tr>
                      <td className={`p-2.5 text-center font-amiri text-2xl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">م</td>
                      <td className="p-2.5"><strong>Lâzım Vakıf:</strong> Mutlaka durulması gereken durak. Geçilirse anlam bozulabilir.</td>
                    </tr>
                    <tr>
                      <td className={`p-2.5 text-center font-amiri text-2xl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">لا</td>
                      <td className="p-2.5"><strong>Lâ Vakfı:</strong> Durmamak gerektiğini gösterir. Nefes yetmezse durulup geri alınarak devam edilir.</td>
                    </tr>
                    <tr>
                      <td className={`p-2.5 text-center font-amiri text-2xl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">ج</td>
                      <td className="p-2.5"><strong>Câiz Vakıf:</strong> Durmak da geçmek de serbesttir; durmak evladır.</td>
                    </tr>
                    <tr>
                      <td className={`p-2.5 text-center font-amiri text-2xl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">قلى</td>
                      <td className="p-2.5"><strong>Kıyle Aleyhil-Vakf:</strong> Durmanın geçmekten daha uygun olduğunu bildirir.</td>
                    </tr>
                    <tr>
                      <td className={`p-2.5 text-center font-amiri text-2xl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">صلى</td>
                      <td className="p-2.5"><strong>El-Vaslü Evlâ:</strong> Geçmenin durmaktan daha uygun olduğunu bildirir.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className={`text-base font-bold pt-2 ${textHeading}`}>Durunca Kelime Sonu Nasıl Okunur?</h4>
              <p className={`text-xs ${textMuted}`}>Vakıf yapıldığında son harfin harekesi sâkinleşir veya tenvin özel kurala göre değişir:</p>
              <div className={`grid gap-3 ${viewMode === 'desktop' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {TECVID_EXAMPLES.vakif.map((ex, i) => renderExampleCard(ex, i, 'vakif'))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
             11. DERS — 100 ÖRNEKLİ KARIŞIK TEKRAR
             ===================================================== */}
        {activeLesson === 10 && (
          <div className="space-y-6">
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tagBg}`}>
                  100 ÖRNEKLİ KARIŞIK TEKRAR
                </span>
                <span className={`text-xs ${textMuted}`}>11. Ders</span>
              </div>

              <h3 className={`text-xl sm:text-2xl font-bold ${textHeading}`}>
                Önce sen bul, sonra kontrol et
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${textBody}`}>
                Her kartta önce Arapça örneği oku ve hangi kuralın olduğunu zihninde söyle.
                Ardından karta dokunarak tecvid kuralını, doğru okunuşunu ve gerekçesini incele.
                <strong> Toplam 100 örnek</strong> seviyelere ayrılmıştır:
              </p>

              {/* Seviye Sekmeleri */}
              <div className={`inline-flex p-1 rounded-xl border ${isDark ? 'bg-[#181512] border-[#3a3226]' : 'bg-slate-100 border-slate-200'}`}>
                {(['kolay', 'orta', 'zor'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setMixedLevel(lvl)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      mixedLevel === lvl
                        ? isDark
                          ? 'bg-[#3fb996] text-[#120f0d] shadow-sm'
                          : 'bg-emerald-700 text-white shadow-xs'
                        : isDark
                        ? 'text-[#a89d8d] hover:text-[#f3ede2]'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    {lvl} ({MIXED_TECVID_WORDS.filter((w) => w.level === lvl).length})
                  </button>
                ))}
              </div>

              <p className={`text-xs ${textMuted}`}>
                Şu anda <strong className={`capitalize ${textAccent}`}>{mixedLevel}</strong> seviye örnekleri listeleniyor.
                Karta tıklayarak cevabı açabilirsiniz:
              </p>

              {/* Kelime Kartları Izgarası */}
              <div className={`grid gap-3 ${viewMode === 'desktop' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {MIXED_TECVID_WORDS.filter((w) => w.level === mixedLevel).map((item, idx) => {
                  const cardId = `mixed_${mixedLevel}_${idx}`;
                  const isRevealed = revealedExamples[cardId];

                  return (
                    <div
                      key={cardId}
                      onClick={() => toggleReveal(cardId)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                        isRevealed
                          ? isDark
                            ? 'bg-[#1c3630]/60 border-[#3fb996]/50 shadow-md'
                            : 'bg-emerald-50 border-emerald-400 shadow-xs'
                          : isDark
                          ? 'bg-[#181512] border-[#3a3226] hover:border-[#3fb996]/40'
                          : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-2">
                        <span className={`font-mono ${textMuted}`}>#{idx + 1}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${tagBg}`}>
                          {isRevealed ? item.rule : '???'}
                        </span>
                      </div>

                      <div className={`py-2 text-center font-amiri text-3xl font-bold ${isDark ? 'text-[#3fb996]' : 'text-emerald-700'}`} dir="rtl">
                        {item.ar}
                      </div>

                      {isRevealed ? (
                        <div className={`mt-2 pt-2 border-t text-xs ${isDark ? 'border-[#3a3226]' : 'border-slate-100'}`}>
                          <div className={`font-semibold ${isDark ? 'text-[#f3ede2]' : 'text-slate-900'} mb-1`}>
                            🗣 {item.read}
                          </div>
                          <div className={`${textMuted} text-[11px]`}>
                            💡 {item.desc}
                          </div>
                        </div>
                      ) : (
                        <div className={`text-center text-[11px] mt-2 ${textMuted}`}>
                          Dokun ve kuralı gör
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
             12. DERS — MİNİ SINAV
             ===================================================== */}
        {activeLesson === 11 && (
          <div className="space-y-6">
            <div className={`p-5 sm:p-7 rounded-2xl border space-y-6 ${cardBg}`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${isDark ? 'border-[#3a3226]' : 'border-slate-200'}`}>
                <div>
                  <h3 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${textHeading}`}>
                    📝 Tecvid Mini Sınavı
                  </h3>
                  <p className={`text-xs ${textMuted}`}>
                    Öğrendiğin tecvid kurallarını çoktan seçmeli pratikle test et
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${innerCardBg}`}>
                    Soru: <span className={textAccent}>{quizIndex + 1}</span> / {TECVID_QUIZ_QUESTIONS.length}
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${innerCardBg}`}>
                    Skor: <span className={isDark ? 'text-[#3fb996]' : 'text-emerald-600'}>{quizScore}</span> / {quizAnsweredCount}
                  </div>
                </div>
              </div>

              {/* Soru Alanı */}
              <div className="text-center space-y-4 py-2">
                <div className={`text-sm sm:text-base font-semibold ${textBody}`}>
                  {currentQuiz.question}
                </div>

                {/* Büyük Arapça Kelime */}
                <div
                  className={`inline-block px-8 py-5 rounded-2xl border font-amiri text-4xl sm:text-5xl font-bold tracking-wide shadow-sm ${
                    isDark ? 'text-[#3fb996] bg-[#181512] border-[#3a3226]' : 'text-emerald-800 bg-emerald-50/60 border-emerald-200'
                  }`}
                  dir="rtl"
                >
                  {currentQuiz.ar}
                </div>
              </div>

              {/* 4 Şık */}
              <div className={`grid gap-3 ${viewMode === 'desktop' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                {currentQuiz.options.map((opt, i) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === currentQuiz.correctRule;

                  let btnStyle = isDark
                    ? 'bg-[#181512] text-[#f3ede2] border-[#3a3226] hover:border-[#3fb996]/50'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300';

                  if (selectedOption !== null) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-600 text-white border-emerald-500 shadow-md';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-600 text-white border-rose-500 shadow-md';
                    } else {
                      btnStyle = isDark ? 'opacity-40 bg-[#181512] border-transparent' : 'opacity-40 bg-slate-50 border-slate-200';
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={selectedOption !== null}
                      onClick={() => handleSelectOption(opt)}
                      className={`p-3.5 rounded-xl border text-sm font-semibold transition-all text-left flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {selectedOption !== null && isCorrect && <Check className="w-5 h-5 text-white" />}
                    </button>
                  );
                })}
              </div>

              {/* Geri Bildirim ve Açıklama */}
              {selectedOption !== null && (
                <div className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                  selectedOption === currentQuiz.correctRule
                    ? isDark
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : isDark
                    ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}>
                  <div className="font-bold mb-1">
                    {selectedOption === currentQuiz.correctRule ? '✅ Tebrikler, doğru cevap!' : '❌ Maalesef yanlış cevap.'}
                  </div>
                  <div>{currentQuiz.explanation}</div>
                </div>
              )}

              {/* Navigasyon Butonları */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  id="btn-tecvid-quiz-next"
                  onClick={handleNextQuiz}
                  className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isDark
                      ? 'bg-[#3fb996] text-[#120f0d] hover:bg-[#349e80]'
                      : 'bg-emerald-700 text-white hover:bg-emerald-800'
                  }`}
                >
                  <span>Sıradaki Soru</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="btn-tecvid-quiz-reset"
                  onClick={handleResetQuiz}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isDark
                      ? 'bg-[#181512] text-[#a89d8d] border-[#3a3226] hover:text-[#f3ede2]'
                      : 'bg-white text-slate-700 border-slate-200 hover:text-slate-900'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Baştan Başla</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. DERS GEÇİŞ VE TAMAMLAMA BUTONLARI */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${innerCardBg}`}>
          <button
            id="btn-tecvid-prev-bottom"
            disabled={activeLesson === 0}
            onClick={() => handleLessonChange(activeLesson - 1)}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
              activeLesson === 0
                ? 'opacity-40 cursor-not-allowed border-transparent'
                : isDark
                ? 'bg-[#181510] text-[#f1ecdd] border-[#3a3226] hover:bg-[#3a3226] hover:text-[#3fb996]'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-emerald-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>← Önceki Ders</span>
          </button>

          <button
            id={`btn-complete-lesson-${activeLesson}`}
            onClick={() => toggleLessonComplete(activeLesson)}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
              completedLessons[activeLesson]
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : isDark
                ? 'bg-[#3fb996]/15 text-[#3fb996] border-[#3fb996]/40 hover:bg-[#3fb996]/25'
                : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{completedLessons[activeLesson] ? '✓ Bu Dersi Tamamladınız' : 'Bu Dersi Öğrendim Olarak İşaretle'}</span>
          </button>

          <button
            id="btn-tecvid-next-bottom"
            disabled={activeLesson === 11}
            onClick={() => handleLessonChange(activeLesson + 1)}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
              activeLesson === 11
                ? 'opacity-40 cursor-not-allowed border-transparent'
                : isDark
                ? 'bg-[#181510] text-[#f1ecdd] border-[#3a3226] hover:bg-[#3a3226] hover:text-[#3fb996]'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-emerald-700'
            }`}
          >
            <span>Sonraki Ders →</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
