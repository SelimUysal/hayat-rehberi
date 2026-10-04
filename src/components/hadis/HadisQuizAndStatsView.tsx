import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  BarChart3,
  Calendar,
  BookOpenCheck,
  Sparkles,
  FileDown,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Check
} from 'lucide-react';
import {
  HadisItem,
  HadisActivityEntry,
  HadisStatPeriod,
  calculatePeriodReport,
  generateHadisQuiz,
  exportHadislerToPDF,
  exportHadislerToWord,
  exportHadislerToExcel
} from '../../services/hadisService';

interface HadisQuizViewProps {
  items: HadisItem[];
  isDark: boolean;
  arabicScalePercent: number;
  mealScalePercent?: number;
  onRecordQuizAnswer: (hadisId: number, isCorrect: boolean, kategori: string) => void;
}

export const HadisQuizView: React.FC<HadisQuizViewProps> = ({
  items,
  isDark,
  arabicScalePercent,
  mealScalePercent = 100,
  onRecordQuizAnswer
}) => {
  const memorizedCount = useMemo(() => items.filter((i) => i.isMemorized).length, [items]);
  const [onlyMemorized, setOnlyMemorized] = useState<boolean>(memorizedCount >= 2);
  const [quizSeed, setQuizSeed] = useState<number>(1);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState<{ correct: number; wrong: number }>({ correct: 0, wrong: 0 });
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const questions = useMemo(() => {
    return generateHadisQuiz(items, onlyMemorized, 6);
  }, [items, onlyMemorized, quizSeed]);

  const currentQ = questions[currentIndex];
  const quizMealFontSizePx = Math.round(14 * (mealScalePercent / 100));

  const handleSelectOption = (option: string) => {
    if (selectedAnswer !== null || !currentQ) return;
    setSelectedAnswer(option);
    const isCorrect = option === currentQ.correctAnswer;
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1)
    }));
    onRecordQuizAnswer(currentQ.hadisId, isCorrect, currentQ.kategori);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = (useMemorizedOnly: boolean) => {
    setOnlyMemorized(useMemorizedOnly);
    setQuizSeed((s) => s + 1);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore({ correct: 0, wrong: 0 });
    setIsFinished(false);
  };

  const cardBg = isDark
    ? 'bg-[#252a34] border-[#384152] text-[#f3f4f6] shadow-md'
    : 'bg-white border-slate-200 text-slate-800 shadow-xs';

  return (
    <div className={`rounded-2xl border p-4 sm:p-6 ${cardBg}`}>
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${isDark ? 'border-[#384152]' : 'border-slate-200'}`}>
        <div>
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Akıllı Hadis-i Şerif Ezber Testi Modülü</span>
          </h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-[#cbd5e1]' : 'text-slate-500'}`}>
            Ezberlediğiniz hadisler üzerinden çoktan seçmeli ve doğru/yanlış eşleştirmeli interaktif sınav
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => handleRestart(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              onlyMemorized
                ? isDark
                  ? 'bg-[#1b3a32] text-[#4ade80] border-[#4ade80]/40'
                  : 'bg-emerald-800 text-white border-emerald-800'
                : isDark
                ? 'bg-[#1b1f27] text-[#cbd5e1] border-[#384152] hover:text-white'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Ezberlediklerimden ({memorizedCount})
          </button>
          <button
            onClick={() => handleRestart(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              !onlyMemorized
                ? isDark
                  ? 'bg-[#1b3a32] text-[#4ade80] border-[#4ade80]/40'
                  : 'bg-emerald-800 text-white border-emerald-800'
                : isDark
                ? 'bg-[#1b1f27] text-[#cbd5e1] border-[#384152] hover:text-white'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Tüm Hadislerden ({items.length})
          </button>
        </div>
      </div>

      {isFinished ? (
        <div className="py-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">Test Tamamlandı!</h3>
          <p className={`text-sm ${isDark ? 'text-[#cbd5e1]' : 'text-slate-600'}`}>
            Toplam <strong>{questions.length}</strong> soruda{' '}
            <strong className="text-emerald-400">{score.correct} Doğru</strong> ve{' '}
            <strong className="text-rose-400">{score.wrong} Yanlış</strong> cevap verdiniz.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleRestart(onlyMemorized)}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Yeni Test Üret</span>
            </button>
          </div>
        </div>
      ) : currentQ ? (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={isDark ? 'text-[#4ade80]' : 'text-emerald-800'}>
              Soru {currentIndex + 1} / {questions.length} · #{currentQ.hadisId} ({currentQ.kategori})
            </span>
            <span className="tabular-nums">
              Doğru: <strong className="text-emerald-400">{score.correct}</strong> · Yanlış:{' '}
              <strong className="text-rose-400">{score.wrong}</strong>
            </span>
          </div>

          <div
            dir="rtl"
            style={{ zoom: arabicScalePercent / 100 }}
            className={`p-4 rounded-xl border font-amiri text-center text-2xl sm:text-3xl leading-loose ${
              isDark
                ? 'bg-[#1b1f27] border-[#384152] text-[#6ee7b7]'
                : 'bg-emerald-50/50 border-emerald-200/70 text-emerald-950'
            }`}
          >
            {currentQ.arabicPrompt}
          </div>

          {currentQ.statementToVerify && (
            <div
              style={{ fontSize: `${quizMealFontSizePx}px`, lineHeight: 1.6 }}
              className={`p-3.5 rounded-xl border font-medium ${
                isDark ? 'bg-[#1b1f27] border-[#384152] text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              Eşleştirilen Meal: {currentQ.statementToVerify}
            </div>
          )}

          <p className="text-sm font-bold">{currentQ.questionTitle}</p>

          <div className="grid grid-cols-1 gap-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswer === opt;
              const isCorrectOption = opt === currentQ.correctAnswer;
              let btnStyle = isDark
                ? 'bg-[#1b1f27] border-[#384152] hover:border-[#4ade80]/60 text-[#f3f4f6]'
                : 'bg-slate-50 border-slate-200 hover:border-emerald-500 text-slate-800';

              if (selectedAnswer !== null) {
                if (isCorrectOption) {
                  btnStyle = isDark
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-500 text-emerald-950';
                } else if (isSelected) {
                  btnStyle = isDark
                    ? 'bg-rose-950/70 border-rose-500 text-rose-300'
                    : 'bg-rose-50 border-rose-500 text-rose-950';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={selectedAnswer !== null}
                  style={{ fontSize: `${quizMealFontSizePx}px`, lineHeight: 1.55 }}
                  className={`w-full text-left p-3.5 rounded-xl border font-medium transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {selectedAnswer !== null && isCorrectOption && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  {selectedAnswer !== null && isSelected && !isCorrectOption && (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {selectedAnswer !== null && (
            <div
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark ? 'bg-[#1b1f27] border-[#384152]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-emerald-400">Doğru Bilgi & Kaynak:</div>
                <div className={isDark ? 'text-[#e2e8f0]' : ''}>{currentQ.explanation}</div>
              </div>
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold whitespace-nowrap cursor-pointer"
              >
                {currentIndex + 1 < questions.length ? 'Sonraki Soru →' : 'Sonucu Gör'}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

interface HadisStatsViewProps {
  items: HadisItem[];
  logs: HadisActivityEntry[];
  isDark: boolean;
}

const PERIOD_OPTIONS: Array<{ id: HadisStatPeriod; label: string }> = [
  { id: 'daily', label: 'Günlük' },
  { id: 'weekly', label: 'Haftalık' },
  { id: 'monthly', label: 'Aylık' },
  { id: '1y', label: '1 Yıllık' },
  { id: '2y', label: '2 Yıllık' },
  { id: '3y', label: '3 Yıllık' },
  { id: '4y', label: '4 Yıllık' },
  { id: '5y', label: '5 Yıllık' },
  { id: '6y', label: '6 Yıllık' },
  { id: '7y', label: '7 Yıllık' },
  { id: '8y', label: '8 Yıllık' },
  { id: '9y', label: '9 Yıllık' },
  { id: '10y', label: '10 Yıllık' },
  { id: 'custom', label: 'Özel Tarih Aralığı' }
];

export const HadisStatsView: React.FC<HadisStatsViewProps> = ({ items, logs, isDark }) => {
  const [period, setPeriod] = useState<HadisStatPeriod>('1y');
  const [customStart, setCustomStart] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [customEnd, setCustomEnd] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const report = useMemo(
    () => calculatePeriodReport(items, logs, period, customStart, customEnd),
    [items, logs, period, customStart, customEnd]
  );

  const totalMemorized = items.filter((i) => i.isMemorized).length;
  const totalFavorites = items.filter((i) => i.isFavorite).length;
  const cardBg = isDark
    ? 'bg-[#252a34] border-[#384152] text-[#f3f4f6] shadow-md'
    : 'bg-white border-slate-200 text-slate-800 shadow-xs';

  const startStr = report.startDate.toLocaleDateString('tr-TR');
  const endStr = report.endDate.toLocaleDateString('tr-TR');

  return (
    <div className={`rounded-2xl border p-4 sm:p-6 space-y-5 ${cardBg}`}>
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b ${isDark ? 'border-[#384152]' : 'border-slate-200'}`}>
        <div>
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <span>Uzun Vadeli (1–10 Yıllık) Ezber ve Okuma İstatistik Paneli</span>
          </h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-[#cbd5e1]' : 'text-slate-500'}`}>
            <strong>{startStr}</strong> tarihinden <strong>{endStr}</strong> tarihine kadar yapılan ezberler, tekrarlar ve test analizleri
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() =>
              exportHadislerToPDF(
                items.filter((i) => i.isMemorized || items.length > 0),
                `${startStr} - ${endStr} Dönemi Ezber Raporu`
              )
            }
            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>PDF Rapor</span>
          </button>
          <button
            onClick={() =>
              exportHadislerToWord(items, `${startStr} - ${endStr} Dönemi Hadis Çıktısı`)
            }
            className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Word</span>
          </button>
          <button
            onClick={() =>
              exportHadislerToExcel(items, `${startStr} - ${endStr} Dönemi Hadis Tablosu`)
            }
            className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Periyot Seçici (Günlük, Haftalık, Aylık, 1-10 Yıllık, Özel Tarih) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setPeriod(opt.id)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border whitespace-nowrap ${
              period === opt.id
                ? isDark
                  ? 'bg-[#1b3a32] text-[#4ade80] border-[#4ade80]/40'
                  : 'bg-emerald-800 text-white border-emerald-800'
                : isDark
                ? 'bg-[#1b1f27] text-[#cbd5e1] border-[#384152] hover:text-white'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Özel Tarih Aralığı Girişi ("X tarihinden Y tarihine kadar yapılan ezberler ve tekrarlar") */}
      <div
        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isDark ? 'bg-[#1b1f27] border-[#384152]' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Tarih Aralığı Sorgula (X Tarihinden Y Tarihine):</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={customStart}
            onChange={(e) => {
              setCustomStart(e.target.value);
              setPeriod('custom');
            }}
            className={`px-2.5 py-1 rounded-lg border text-xs font-mono ${
              isDark ? 'bg-[#252a34] border-[#384152] text-white' : 'bg-white border-slate-300 text-slate-800'
            }`}
          />
          <span className="text-xs font-bold">→</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => {
              setCustomEnd(e.target.value);
              setPeriod('custom');
            }}
            className={`px-2.5 py-1 rounded-lg border text-xs font-mono ${
              isDark ? 'bg-[#252a34] border-[#384152] text-white' : 'bg-white border-slate-300 text-slate-800'
            }`}
          />
        </div>
      </div>

      {/* Özet Metrik Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          className={`p-3.5 rounded-xl border ${
            isDark ? 'bg-[#1b1f27] border-[#384152]' : 'bg-emerald-50/60 border-emerald-200/70'
          }`}
        >
          <div className={`text-xs ${isDark ? 'text-[#cbd5e1]' : 'text-slate-500'}`}>
            Dönem İçi Ezberlenen
          </div>
          <div className="text-2xl font-extrabold tabular-nums mt-1 text-emerald-400">
            {report.memorizedCount} / {items.length}
          </div>
          <div className={`text-[11px] mt-0.5 ${isDark ? 'text-[#cbd5e1]' : 'text-slate-600'}`}>
            Toplam Ezber: %{Math.round((totalMemorized / items.length) * 100)}
          </div>
        </div>

        <div
          className={`p-3.5 rounded-xl border ${
            isDark ? 'bg-[#1b1f27] border-[#384152]' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className={`text-xs ${isDark ? 'text-[#cbd5e1]' : 'text-slate-500'}`}>
            Toplam Okuma & Tekrar
          </div>
          <div className="text-2xl font-extrabold tabular-nums mt-1 text-amber-400">
            {report.reviewCount}
          </div>
          <div className={`text-[11px] mt-0.5 ${isDark ? 'text-[#cbd5e1]' : 'text-slate-600'}`}>
            Aktif Gün: {report.activeDaysCount} gün
          </div>
        </div>

        <div
          className={`p-3.5 rounded-xl border ${
            isDark ? 'bg-[#1b1f27] border-[#384152]' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className={`text-xs ${isDark ? 'text-[#cbd5e1]' : 'text-slate-500'}`}>
            Test Doğruluk Oranı
          </div>
          <div className="text-2xl font-extrabold tabular-nums mt-1 text-teal-400">
            %{report.quizAccuracy}
          </div>
          <div className={`text-[11px] mt-0.5 ${isDark ? 'text-[#cbd5e1]' : 'text-slate-600'}`}>
            {report.quizCorrect} doğru / {report.quizTotal} soru
          </div>
        </div>

        <div
          className={`p-3.5 rounded-xl border ${
            isDark ? 'bg-[#1b1f27] border-[#384152]' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className={`text-xs ${isDark ? 'text-[#cbd5e1]' : 'text-slate-500'}`}>
            Favori & Notlu Hadisler
          </div>
          <div className="text-2xl font-extrabold tabular-nums mt-1 text-rose-400">
            {totalFavorites}
          </div>
          <div className={`text-[11px] mt-0.5 ${isDark ? 'text-[#cbd5e1]' : 'text-slate-600'}`}>
            Not Eklenen: {items.filter((i) => i.userNote.trim() !== '').length} hadis
          </div>
        </div>
      </div>

      {/* Kategori Bazlı Ezber & Tekrar Dağılımı + Yıllık Tablo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className={`p-4 rounded-xl border space-y-2.5 ${
            isDark ? 'bg-[#1b1f27] border-[#384152]' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#e2e8f0]' : 'text-slate-700'}`}>
            Konu / Kategori Bazlı Ezber İlerlemesi
          </h3>
          <div className="space-y-2">
            {report.categoryBreakdown.map((row) => {
              const totalInCat = items.filter((i) => i.kategori === row.kategori).length || 1;
              const pct = Math.round((row.memorized / totalInCat) * 100);
              return (
                <div key={row.kategori} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">{row.kategori}</span>
                    <span className={`tabular-nums ${isDark ? 'text-[#cbd5e1]' : 'text-slate-600'}`}>
                      {row.memorized}/{totalInCat} ezber · {row.reviews} tekrar (%{pct})
                    </span>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-[#252a34]' : 'bg-slate-200'}`}>
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border space-y-2.5 ${
            isDark ? 'bg-[#1b1f27] border-[#384152]' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#e2e8f0]' : 'text-slate-700'}`}>
            Çok Yıllı (1–10 Yıl) Hıfz ve Tekrar Kronolojisi
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDark ? 'border-[#384152] text-[#cbd5e1]' : 'border-slate-200 text-slate-600'}`}>
                  <th className="py-1.5">Yıl</th>
                  <th className="py-1.5 text-right">Ezber</th>
                  <th className="py-1.5 text-right">Tekrar</th>
                  <th className="py-1.5 text-right">Çözülen Soru</th>
                </tr>
              </thead>
              <tbody className={`divide-y tabular-nums ${isDark ? 'divide-[#384152]/60' : 'divide-slate-200'}`}>
                {report.yearlyTimeline.map((yr) => (
                  <tr key={yr.yearLabel}>
                    <td className="py-1.5 font-bold">{yr.yearLabel}</td>
                    <td className="py-1.5 text-right text-emerald-400 font-semibold">{yr.memorized}</td>
                    <td className="py-1.5 text-right">{yr.reviews}</td>
                    <td className="py-1.5 text-right">{yr.quizzes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
