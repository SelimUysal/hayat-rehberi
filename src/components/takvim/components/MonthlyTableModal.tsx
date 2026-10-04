import React, { useState, useMemo } from 'react';
import { X, Calendar, Download, Printer, ChevronLeft, ChevronRight, Moon, Sparkles } from 'lucide-react';
import { CalculatedDay, Coordinates, TemkinSettings, AsrMethod } from '../types/prayer';
import { calculateMonthlyPrayers } from '../utils/astronomy';
import { buildPdfFromJpegPages, dataUrlToUint8Array } from '../../../services/hadisService';

interface MonthlyTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  coords: Coordinates;
  temkin: TemkinSettings;
  asrMethod: AsrMethod;
  onSelectDay?: (date: Date) => void;
}

export const MonthlyTableModal: React.FC<MonthlyTableModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  coords,
  temkin,
  asrMethod,
  onSelectDay
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-11

  const monthlyDays = useMemo(() => {
    return calculateMonthlyPrayers(selectedYear, selectedMonth, coords, temkin, asrMethod);
  }, [selectedYear, selectedMonth, coords, temkin, asrMethod]);

  if (!isOpen) return null;

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handlePrint = () => {
    const PAGE_W = 1240;
    const PAGE_H = 1754;
    const canvas = document.createElement('canvas');
    canvas.width = PAGE_W;
    canvas.height = PAGE_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const FONT = '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, PAGE_W, PAGE_H);

    ctx.fillStyle = '#064e3b';
    ctx.font = `bold 28px ${FONT}`;
    ctx.fillText(
      `☾ Hayat Rehberi — ${coords.city} Aylık Namaz Vakitleri`,
      60,
      70
    );
    ctx.fillStyle = '#475569';
    ctx.font = `18px ${FONT}`;
    ctx.fillText(`${monthNames[selectedMonth]} ${selectedYear} İmsakiye Çizelgesi`, 60, 104);

    const cols = [
      { label: 'Tarih', x: 60 },
      { label: 'Gün', x: 200 },
      { label: 'Hicrî Tarih', x: 320 },
      { label: 'İmsak', x: 540 },
      { label: 'Güneş', x: 650 },
      { label: 'Öğle', x: 760 },
      { label: 'İkindi', x: 870 },
      { label: 'Akşam', x: 980 },
      { label: 'Yatsı', x: 1090 }
    ];

    let y = 135;
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(50, y, PAGE_W - 100, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 17px ${FONT}`;
    for (const c of cols) {
      ctx.fillText(c.label, c.x, y + 26);
    }
    y += 40;

    monthlyDays.forEach((d, idx) => {
      const rowH = 44;
      ctx.fillStyle = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
      ctx.fillRect(50, y, PAGE_W - 100, rowH);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(50, y, PAGE_W - 100, rowH);

      ctx.fillStyle = '#0f172a';
      ctx.font = `16px ${FONT}`;
      ctx.fillText(d.dateString, cols[0].x, y + 28);
      ctx.fillText(d.dayName, cols[1].x, y + 28);
      ctx.fillText(d.hijriDate.formatted, cols[2].x, y + 28);
      ctx.font = `bold 16px ${FONT}`;
      ctx.fillText(d.times.imsak, cols[3].x, y + 28);
      ctx.fillText(d.times.gunes, cols[4].x, y + 28);
      ctx.fillText(d.times.ogle, cols[5].x, y + 28);
      ctx.fillText(d.times.ikindi, cols[6].x, y + 28);
      ctx.fillText(d.times.aksam, cols[7].x, y + 28);
      ctx.fillText(d.times.yatsi, cols[8].x, y + 28);
      y += rowH;
    });

    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const pdfBlob = buildPdfFromJpegPages([
      { jpegBytes: dataUrlToUint8Array(jpegDataUrl), width: PAGE_W, height: PAGE_H }
    ]);
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aylik_Namaz_Vakitleri_${coords.city}_${monthNames[selectedMonth]}_${selectedYear}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleExportCSV = () => {
    const headers = ['Tarih', 'Gun', 'Hicri', 'Imsak', 'Gunes', 'Ogle', 'Ikindi', 'Aksam', 'Yatsi', 'Kible'];
    const rows = monthlyDays.map((d) => [
      d.dateString,
      d.dayName,
      `"${d.hijriDate.formatted}"`,
      d.times.imsak,
      d.times.gunes,
      d.times.ogle,
      d.times.ikindi,
      d.times.aksam,
      d.times.yatsi,
      d.times.kibleSaati
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aylik_Namaz_Vakitleri_${coords.city}_${monthNames[selectedMonth]}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const todayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(
    currentDate.getDate()
  ).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-emerald-100 dark:border-emerald-950/40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Üst Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/60 dark:bg-emerald-950/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Aylık Namaz Vakitleri Çizelgesi ({coords.city})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                İhtiyatlı güvenlik temkinli Fazilet ve ecdad takvim fıkhına göre
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportCSV}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-semibold"
              title="CSV olarak indir"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">CSV İndir</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Yazdır / PDF kaydet"
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Yazdır</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ay / Yıl Seçici */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 text-sm font-semibold shrink-0">
          <button
            onClick={handlePrevMonth}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Önceki Ay</span>
          </button>

          <span className="text-base font-bold text-emerald-900 dark:text-emerald-300">
            {monthNames[selectedMonth]} {selectedYear}
          </span>

          <button
            onClick={handleNextMonth}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <span>Sonraki Ay</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tablo Alanı */}
        <div className="flex-1 overflow-auto p-2 sm:p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                <th className="py-2.5 px-3">Tarih</th>
                <th className="py-2.5 px-2">Gün</th>
                <th className="py-2.5 px-2">Hicrî</th>
                <th className="py-2.5 px-2 text-center text-emerald-700 dark:text-emerald-400">İmsak</th>
                <th className="py-2.5 px-2 text-center">Güneş</th>
                <th className="py-2.5 px-2 text-center">Öğle</th>
                <th className="py-2.5 px-2 text-center">İkindi</th>
                <th className="py-2.5 px-2 text-center text-amber-700 dark:text-amber-400">Akşam</th>
                <th className="py-2.5 px-2 text-center">Yatsı</th>
                <th className="py-2.5 px-2 text-center text-slate-500">Kıble S.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {monthlyDays.map((d) => {
                const isToday = d.dateString === todayStr;
                const isCuma = d.dayName === 'Cuma';

                return (
                  <tr
                    key={d.dateString}
                    onClick={() => {
                      if (onSelectDay) {
                        onSelectDay(d.date);
                        onClose();
                      }
                    }}
                    className={`cursor-pointer transition hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20 ${
                      isToday
                        ? 'bg-amber-500/10 font-bold text-amber-900 dark:text-amber-200'
                        : isCuma
                        ? 'bg-emerald-50/30 dark:bg-emerald-950/10'
                        : ''
                    }`}
                  >
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {String(d.dayNumber).padStart(2, '0')}.{String(selectedMonth + 1).padStart(2, '0')}
                      </span>
                      {isToday && (
                        <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-amber-500 text-white rounded">
                          Bugün
                        </span>
                      )}
                    </td>
                    <td className={`py-2 px-2 whitespace-nowrap ${isCuma ? 'font-bold text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {d.dayName}
                    </td>
                    <td className="py-2 px-2 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                      {d.hijriDate.day} {d.hijriDate.monthName.slice(0, 5)}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {d.times.imsak}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-slate-700 dark:text-slate-300">
                      {d.times.gunes}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-slate-700 dark:text-slate-300">
                      {d.times.ogle}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-slate-700 dark:text-slate-300">
                      {d.times.ikindi}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-amber-700 dark:text-amber-400">
                      {d.times.aksam}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-slate-700 dark:text-slate-300">
                      {d.times.yatsi}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-slate-500 text-[11px]">
                      {d.times.kibleSaati}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Dip Bilgi */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
          * İkindi vakti: {asrMethod === 1 ? 'Asr-ı Evvel (İmameyn / Cumhur)' : 'Asr-ı Sânî (İmam-ı Âzam)'} • Satırlara tıklayarak o günün detaylı takvim yaprağına gidebilirsiniz.
        </div>
      </div>
    </div>
  );
};
