import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, BookOpen, Clock, ChevronLeft, ChevronRight, Share2, Copy, Check, Sparkles, Compass } from 'lucide-react';
import { CalculatedDay, CalendarWisdom } from '../types/prayer';
import { getWisdomForDate } from '../data/wisdom';
import { getHistoricalEventsForDate } from '../data/historicalEvents';

interface CalendarPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayData: CalculatedDay;
  onPrevDay?: () => void;
  onNextDay?: () => void;
}

export const CalendarPageModal: React.FC<CalendarPageModalProps> = ({
  isOpen,
  onClose,
  dayData,
  onPrevDay,
  onNextDay
}) => {
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const wisdom: CalendarWisdom = getWisdomForDate(dayData.date);
  const events = getHistoricalEventsForDate(dayData.date);

  const copyPageWisdom = () => {
    const text = `📅 ${dayData.dayNumber} ${dayData.monthName} ${dayData.year} - ${dayData.dayName}\n🕌 Hicrî: ${dayData.hijriDate.formatted}\n\n📖 AYET-İ KERİME:\n"${wisdom.verse.text}"\n— ${wisdom.verse.source}\n\n🌙 HADİS-İ ŞERİF:\n"${wisdom.hadith.text}"\n— ${wisdom.hadith.source}\n\n🕌 VAKİTLER:\nİmsak: ${dayData.times.imsak} | Güneş: ${dayData.times.gunes} | Öğle: ${dayData.times.ogle} | İkindi: ${dayData.times.ikindi} | Akşam: ${dayData.times.aksam} | Yatsı: ${dayData.times.yatsi}\n\nHayat Rehberi Takvimi`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-[#fcfaf2] dark:bg-slate-900 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl border-4 border-[#e2d5ba] dark:border-slate-800 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Takvim Yaprağı Askı Deliği Efekti */}
        <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-800 border-2 border-[#d5c5a0] dark:border-slate-700 mx-auto -mt-3 shadow-inner z-10 shrink-0" />

        {/* Üst Çubuk (Navigasyon ve Kapatma) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-b border-[#e8ddc7] dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-1">
            {onPrevDay && (
              <button
                onClick={onPrevDay}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-[#efe7d3] dark:hover:bg-slate-800 transition"
                title="Önceki Gün"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {onNextDay && (
              <button
                onClick={onNextDay}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-[#efe7d3] dark:hover:bg-slate-800 transition"
                title="Sonraki Gün"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 ml-1">
              Geleneksel Takvim Yaprağı
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyPageWisdom}
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-[#efe7d3] dark:hover:bg-slate-800 transition flex items-center gap-1 text-xs"
              title="Günün sayfasını kopyala"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-[#efe7d3] dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ön Yüz / Arka Yüz Sekmeleri */}
        <div className="flex border-b border-[#e8ddc7] dark:border-slate-800 bg-[#f7f2e4] dark:bg-slate-900/60 shrink-0 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveSide('front')}
            className={`flex-1 py-2.5 text-center transition flex items-center justify-center gap-1.5 ${
              activeSide === 'front'
                ? 'bg-[#fcfaf2] dark:bg-slate-900 text-emerald-900 dark:text-emerald-300 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>📜 Ön Yüz (Vakitler & Tarih)</span>
          </button>
          <button
            onClick={() => setActiveSide('back')}
            className={`flex-1 py-2.5 text-center transition flex items-center justify-center gap-1.5 ${
              activeSide === 'back'
                ? 'bg-[#fcfaf2] dark:bg-slate-900 text-emerald-900 dark:text-emerald-300 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>📖 Arka Yüz (Ayet, Hadis & Makale)</span>
          </button>
        </div>

        {/* İçerik Alanı */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeSide === 'front' ? (
            /* =================== ÖN YÜZ =================== */
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Tarih Başlığı (Üst Blok) */}
              <div className="text-center border-b border-[#e2d5ba] dark:border-slate-800 pb-3">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-400 px-2">
                  <span>Hicrî: {dayData.hijriDate.formatted}</span>
                  <span>Rûmî: {dayData.rumiDate.formatted}</span>
                </div>

                {/* Büyük Gün Rakamı */}
                <div className="my-2">
                  <span className="text-6xl sm:text-7xl font-black text-slate-800 dark:text-slate-100 font-serif tracking-tight">
                    {dayData.dayNumber}
                  </span>
                  <div className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest mt-0.5">
                    {dayData.monthName} {dayData.year}
                  </div>
                  <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    {dayData.dayName}
                  </div>
                </div>
              </div>

              {/* Günün Namaz Vakitleri Tablosu (Nostaljik Klasik Görünüm) */}
              <div className="bg-white/70 dark:bg-slate-850/60 rounded-2xl p-3.5 border border-[#e8ddc7] dark:border-slate-800 shadow-xs">
                <h4 className="text-xs font-bold text-center text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2.5">
                  — Günün Ezan Vakitleri —
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                  {[
                    { label: 'İMSAK', time: dayData.times.imsak, sub: 'Fecr' },
                    { label: 'GÜNEŞ', time: dayData.times.gunes, sub: 'Tulu' },
                    { label: 'ÖĞLE', time: dayData.times.ogle, sub: 'Zeval' },
                    { label: 'İKİNDİ', time: dayData.times.ikindi, sub: 'Asr' },
                    { label: 'AKŞAM', time: dayData.times.aksam, sub: 'Gurub' },
                    { label: 'YATSI', time: dayData.times.yatsi, sub: 'Işa' }
                  ].map((v) => (
                    <div
                      key={v.label}
                      className="p-2 rounded-xl bg-[#faf6eb] dark:bg-slate-800/80 border border-[#e8ddc7] dark:border-slate-700/60"
                    >
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 block">
                        {v.label}
                      </span>
                      <span className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 block font-mono">
                        {v.time}
                      </span>
                      <span className="text-[9px] text-slate-400 block">{v.sub}</span>
                    </div>
                  ))}
                </div>

                {/* Alt Detay Vakitleri */}
                <div className="mt-3 pt-2.5 border-t border-[#eee5d3] dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 dark:text-slate-400 text-center">
                  <div>
                    <span className="text-slate-400 block text-[10px]">İşrak (Kuşluk):</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{dayData.times.israk}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Dahve-i Kübrâ:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{dayData.times.dahve}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Kıble Saati:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                      {dayData.times.kibleSaati}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Gece Yarısı:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{dayData.times.geceyarisi}</span>
                  </div>
                </div>

                {dayData.times.bayramNamaz && (
                  <div className="mt-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center text-xs">
                    <span className="font-bold text-amber-700 dark:text-amber-400">
                      🕌 {dayData.times.bayramName || 'Bayram Namazı'}:
                    </span>{' '}
                    <span className="font-black text-amber-800 dark:text-amber-300 font-mono text-sm ml-1">
                      {dayData.times.bayramNamaz}
                    </span>
                  </div>
                )}
              </div>

              {/* Günün Vecizesi / Sözü */}
              <div className="p-3.5 rounded-2xl bg-[#f5eddb] dark:bg-slate-800/60 border border-[#e4d6b8] dark:border-slate-700/60 text-center">
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest block mb-1">
                  — Günün Hikmetli Sözü —
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic font-serif">
                  "{wisdom.saying}"
                </p>
              </div>

              {/* Tarihte Bugün Kısa Not */}
              <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-850/60 border border-[#e8ddc7] dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tarihte Bugün:</span>
                </div>
                <div className="space-y-1">
                  {events.slice(0, 2).map((ev, i) => (
                    <p key={i} className="text-xs text-slate-600 dark:text-slate-400">
                      {ev.year ? <strong className="text-slate-800 dark:text-slate-200">{ev.year}: </strong> : null}
                      {ev.text}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* =================== ARKA YÜZ =================== */
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Ayet-i Kerime */}
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-850/70 border border-[#e8ddc7] dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                    Günün Ayet-i Kerimesi
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 font-serif leading-relaxed italic">
                  "{wisdom.verse.text}"
                </p>
                <div className="text-right mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  — {wisdom.verse.source}
                </div>
              </div>

              {/* Hadis-i Şerif */}
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-850/70 border border-[#e8ddc7] dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-amber-600" />
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                    Günün Hadis-i Şerifi
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 font-serif leading-relaxed italic">
                  "{wisdom.hadith.text}"
                </p>
                <div className="text-right mt-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  — {wisdom.hadith.source}
                </div>
              </div>

              {/* Günün Makalesi / Fıkıh & Ahlak Notu */}
              <div className="p-4 rounded-2xl bg-[#faf6eb] dark:bg-slate-800/60 border border-[#e4d6b8] dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                    {wisdom.article.title}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans text-justify">
                  {wisdom.article.content}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Alt Bilgi */}
        <div className="px-4 py-2.5 bg-[#f5eddb] dark:bg-slate-900 border-t border-[#e2d5ba] dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
          <span>Hayat Rehberi • Ehl-i Sünnet Ölçüleri</span>
          <span>Kıble Açısı: {dayData.qiblaAngle}°</span>
        </div>
      </div>
    </div>
  );
};
