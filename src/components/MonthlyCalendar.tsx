import React, { useState } from 'react';
import { Coordinates, TemkinSettings, AsrMethod, CalculatedDay } from '../types/prayer';
import { calculateMonthlyPrayers } from '../utils/astronomy';
import { buildPdfFromJpegPages, dataUrlToUint8Array } from '../services/hadisService';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Printer, Download, Sparkles } from 'lucide-react';

interface MonthlyCalendarProps {
  currentLocation: Coordinates;
  temkin: TemkinSettings;
  asrMethod: AsrMethod;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  currentLocation,
  temkin,
  asrMethod,
  selectedDate,
  onSelectDate
}) => {
  const [viewYear, setViewYear] = useState<number>(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(selectedDate.getMonth()); // 0-11

  const turkishMonths = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  // Seçilen ayın günlerini otomatik hesapla
  const days: CalculatedDay[] = calculateMonthlyPrayers(viewYear, viewMonth, currentLocation, temkin, asrMethod);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleResetCurrentMonth = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
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

    // Header
    ctx.fillStyle = '#064e3b';
    ctx.font = `bold 28px ${FONT}`;
    ctx.fillText(
      `☾ Hayat Rehberi — ${currentLocation.city} Aylık Namaz Vakitleri`,
      60,
      70
    );
    ctx.fillStyle = '#475569';
    ctx.font = `18px ${FONT}`;
    ctx.fillText(`${turkishMonths[viewMonth]} ${viewYear} İmsakiye Çizelgesi`, 60, 104);

    // Table Header
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

    days.forEach((d, idx) => {
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
    a.download = `${currentLocation.city}_Namaz_Vakitleri_${turkishMonths[viewMonth]}_${viewYear}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleExportCSV = () => {
    const headers = ['Tarih', 'Gun', 'Hicri', 'Imsak', 'Sabah', 'Gunes', 'Israk', 'Ogle', 'Ikindi', 'Aksam', 'Yatsi', 'Kible'];
    const rows = days.map((d) => [
      d.dateString,
      d.dayName,
      `"${d.hijriDate.formatted}"`,
      d.times.imsak,
      d.times.sabah,
      d.times.gunes,
      d.times.israk,
      d.times.ogle,
      d.times.ikindi,
      d.times.aksam,
      d.times.yatsi,
      d.times.kibleSaati
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentLocation.city}_Namaz_Vakitleri_${viewYear}_${viewMonth + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isToday = (day: CalculatedDay) => {
    const now = new Date();
    return (
      day.date.getDate() === now.getDate() &&
      day.date.getMonth() === now.getMonth() &&
      day.date.getFullYear() === now.getFullYear()
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-6 print:border-none print:shadow-none print:p-0">
      
      {/* Takvim Üst Kontrolleri */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {currentLocation.city} Aylık Namaz Vakitleri & İmsakiye
              </h2>
              <p className="text-xs text-slate-500">
                {turkishMonths[viewMonth]} {viewYear}
              </p>
            </div>
          </div>
        </div>

        {/* Ay Değiştirici & Aksiyonlar */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 hover:shadow-xs transition-all cursor-pointer"
              title="Önceki Ay"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 min-w-[110px] text-center">
              {turkishMonths[viewMonth]} {viewYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 hover:shadow-xs transition-all cursor-pointer"
              title="Sonraki Ay"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleResetCurrentMonth}
            className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
          >
            Bu Aya Dön
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Yazdır veya PDF olarak kaydet"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Yazdır</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Excel / CSV formatında indir"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV İndir</span>
          </button>
        </div>
      </div>

      {/* Namaz Vakitleri Tablosu */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/90 text-slate-700 font-bold border-b border-slate-200">
              <th className="py-3 px-3">Tarih</th>
              <th className="py-3 px-3">Hicri / Rumi</th>
              <th className="py-3 px-3 text-indigo-900 bg-indigo-50/40">İmsak</th>
              <th className="py-3 px-3 text-emerald-900 bg-emerald-50/30">Sabah</th>
              <th className="py-3 px-3 text-amber-800">Güneş</th>
              <th className="py-3 px-3 text-teal-800 hidden sm:table-cell">İşrak</th>
              <th className="py-3 px-3 text-amber-900 bg-amber-50/40">Öğle</th>
              <th className="py-3 px-3 text-orange-900">İkindi</th>
              <th className="py-3 px-3 text-rose-900 bg-rose-50/40 font-bold">Akşam</th>
              <th className="py-3 px-3 text-slate-900">Yatsı</th>
              <th className="py-3 px-3 text-slate-600 hidden md:table-cell">Kıble</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70">
            {days.map((day) => {
              const current = isToday(day);
              const isFriday = day.dayName === 'Cuma';
              return (
                <tr
                  key={day.dateString}
                  onClick={() => onSelectDate(day.date)}
                  className={`transition-colors cursor-pointer hover:bg-emerald-50/50 ${
                    current ? 'bg-emerald-100/70 font-semibold ring-1 ring-emerald-400' : isFriday ? 'bg-slate-50/40' : 'bg-white'
                  }`}
                >
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{day.dayNumber} {turkishMonths[viewMonth].slice(0, 3)}</span>
                      <span className={`text-[11px] font-bold ${isFriday ? 'text-emerald-700' : 'text-slate-600'}`}>
                        {day.dayName}
                      </span>
                      {current && (
                        <span className="ml-1 inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-700 text-white">
                          Bugün
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap text-[11px]">
                    <div className="font-bold text-slate-800">{day.hijriDate.day} {day.hijriDate.monthName.slice(0, 6)}</div>
                    <div className="text-[10px] text-amber-800 font-bold">Rumi: {day.rumiDate.day} {day.rumiDate.monthName.slice(0, 5)}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-900 bg-indigo-50/20">
                    {day.times.imsak}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-950 bg-emerald-50/20">
                    {day.times.sabah}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-800">
                    {day.times.gunes}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-teal-800 hidden sm:table-cell">
                    {day.times.israk}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-900 bg-amber-50/20">
                    {day.times.ogle}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-orange-900">
                    {day.times.ikindi}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-rose-900 bg-rose-50/20">
                    {day.times.aksam}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {day.times.yatsi}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-600 hidden md:table-cell">
                    {day.times.kibleSaati}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
