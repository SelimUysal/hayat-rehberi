import React, { useState, useMemo, useEffect } from 'react';
import { MoonStar, Calendar, ChevronDown, ChevronUp, Bell, Heart, Moon, CheckCircle2, X, BookOpen } from 'lucide-react';
import { getUpcomingHolyDays, getTodayHolyDay, HolyDayItem } from '../utils/holyDays';

interface HolyDaysWidgetProps {
  currentDate: Date;
  onSelectDate?: (date: Date) => void;
}

export const HolyDaysWidget: React.FC<HolyDaysWidgetProps> = ({ currentDate, onSelectDate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [celebrationDismissed, setCelebrationDismissed] = useState(false);
  const [expandedDuas, setExpandedDuas] = useState<Record<string, boolean>>({});

  const toggleDua = (id: string) => {
    setExpandedDuas((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Bugün ve yaklaşan mübarek günlerin hesaplanması
  const upcomingList = useMemo(() => getUpcomingHolyDays(currentDate), [currentDate]);
  const todayHolyDay = useMemo(() => getTodayHolyDay(currentDate), [currentDate]);

  // İlk açılışta oturum bazlı kontrol
  useEffect(() => {
    if (todayHolyDay) {
      const dismissedKey = `dismissed_holyday_${todayHolyDay.id}_${todayHolyDay.gregorianDate.toDateString()}`;
      if (sessionStorage.getItem(dismissedKey)) {
        setCelebrationDismissed(true);
      } else {
        setCelebrationDismissed(false);
      }
    }
  }, [todayHolyDay]);

  const handleDismissCelebration = () => {
    if (todayHolyDay) {
      const dismissedKey = `dismissed_holyday_${todayHolyDay.id}_${todayHolyDay.gregorianDate.toDateString()}`;
      sessionStorage.setItem(dismissedKey, 'true');
    }
    setCelebrationDismissed(true);
  };

  // Sıradaki en yakın mübarek gün
  const nextHolyDay = upcomingList.find((item) => !item.isToday) || upcomingList[0];

  const getCategoryColor = (cat: HolyDayItem['category']) => {
    switch (cat) {
      case 'kandil':
        return 'bg-amber-500/10 text-amber-900 dark:text-amber-300 border-amber-300/40';
      case 'bayram':
        return 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 border-emerald-300/40';
      case 'ramazan':
        return 'bg-indigo-500/10 text-indigo-900 dark:text-indigo-300 border-indigo-300/40';
      default:
        return 'bg-stone-500/10 text-stone-900 dark:text-stone-300 border-stone-300/40';
    }
  };

  return (
    <section className="space-y-3" aria-label="Mübarek Günler ve Kandiller">
      {/* 1. EĞER BUGÜN BİR MÜBAREK GÜN İSE: İLK AÇILIŞ VE TEBRİK BİLDİRİMİ */}
      {todayHolyDay && !celebrationDismissed && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-5 sm:p-6 shadow-lg border-2 border-amber-400/60 animate-fadeIn">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center shrink-0 text-amber-300">
                <MoonStar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-emerald-950 text-xs font-black uppercase tracking-wider">
                  <MoonStar className="w-3.5 h-3.5" />
                  Bugün Mübarek Gün
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight">
                  {todayHolyDay.celebrationTitle}
                </h3>

                {/* Arapça Dua Bölümü */}
                {todayHolyDay.celebrationDuaArabic && (
                  <div className="my-2 p-3 sm:p-3.5 rounded-xl bg-black/25 border border-amber-400/30">
                    <p className="font-serif text-base sm:text-lg leading-loose text-amber-200 text-right select-all font-semibold tracking-wide" dir="rtl">
                      {todayHolyDay.celebrationDuaArabic}
                    </p>
                    {todayHolyDay.celebrationDuaRead && (
                      <p className="mt-1.5 pt-1.5 border-t border-white/10 text-xs text-amber-100/90 italic font-mono">
                        <span className="text-amber-300 font-semibold not-italic">Okunuşu: </span>
                        {todayHolyDay.celebrationDuaRead}
                      </p>
                    )}
                  </div>
                )}

                <p className="text-sm text-emerald-100/90 leading-relaxed max-w-2xl pt-1 font-medium">
                  <span className="text-amber-300/90 font-semibold">Anlamı / Dua: </span>
                  {todayHolyDay.celebrationDua}
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-emerald-200">
                  <div className="flex items-center gap-3">
                    <span>Hicri: <strong>{todayHolyDay.hijriFormatted}</strong></span>
                    <span>•</span>
                    <span>{todayHolyDay.desc}</span>
                  </div>
                  {onSelectDate && (
                    <button
                      type="button"
                      onClick={() => onSelectDate(todayHolyDay.gregorianDate)}
                      className="p-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-300/40 transition-colors cursor-pointer"
                      title="Takvimde Bu Güne Git"
                      aria-label="Takvimde Bu Güne Git"
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-300" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleDismissCelebration}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition-colors shrink-0"
              title="Kapat"
              aria-label="Tebrik bildirimini kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. TAKVİM İLE GÜNÜN SAATLERİ ARASINDAKİ GERİ SAYIM KARTI */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-4 sm:p-5 transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Sol: Sıradaki Mübarek Gün Bilgisi */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-900 shrink-0">
              <MoonStar className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500">
                  Sıradaki Mübarek Gün
                </span>
                {todayHolyDay && (
                  <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.2 rounded-full border border-amber-300">
                    Bugün {todayHolyDay.name}!
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h4 className="text-base sm:text-lg font-black text-stone-900">
                  {nextHolyDay.name}
                </h4>
                <span className="text-xs font-bold text-stone-600 hidden sm:inline">
                  ({nextHolyDay.hijriFormatted})
                </span>
                {onSelectDate && (
                  <button
                    type="button"
                    onClick={() => onSelectDate(nextHolyDay.gregorianDate)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100/80 p-1 rounded-md border border-emerald-200 transition-colors cursor-pointer"
                    title="Takvimde Bu Güne Git"
                    aria-label="Takvimde Bu Güne Git"
                  >
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  </button>
                )}
                {nextHolyDay.celebrationDuaArabic && (
                  <button
                    type="button"
                    onClick={() => toggleDua(nextHolyDay.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors ml-1 cursor-pointer"
                    title="Günün duasını ve Arapça metnini görüntüle"
                  >
                    <BookOpen className="w-3 h-3 text-emerald-700" />
                    <span>{expandedDuas[nextHolyDay.id] ? 'Duayı Kapat' : 'Duası & Arapçası'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sağ: Kaç Gün Kaldı Rozeti & Aç/Kapat Butonu */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
            <div className="bg-emerald-900 text-white font-black font-mono text-sm px-3.5 py-1.5 rounded-xl shadow-2xs flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-300" />
              <span>{nextHolyDay.daysLeft} Gün Kaldı</span>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 hover:text-emerald-900 bg-stone-100 hover:bg-stone-200/80 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <span>{isExpanded ? 'Tümünü Kapat' : `Tüm Dini Günleri Gör (${upcomingList.length})`}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Sıradaki Günün Açılan Duası (Eğer liste kapalıysa burada zarifçe gösterilir) */}
        {expandedDuas[nextHolyDay.id] && !isExpanded && nextHolyDay.celebrationDuaArabic && (
          <div className="mt-3 pt-3 border-t border-stone-200 p-3 sm:p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-950 mb-1">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                {nextHolyDay.name} Duası
              </span>
              <button
                type="button"
                onClick={() => toggleDua(nextHolyDay.id)}
                className="text-stone-400 hover:text-stone-600 text-[11px] font-semibold cursor-pointer"
              >
                Kapat ✕
              </button>
            </div>
            <div dir="rtl" className="text-right">
              <p className="font-serif text-sm sm:text-base text-stone-900 leading-loose select-all font-semibold">
                {nextHolyDay.celebrationDuaArabic}
              </p>
            </div>
            {nextHolyDay.celebrationDuaRead && (
              <p className="text-xs text-stone-700 italic border-t border-emerald-200/60 pt-1">
                <span className="font-semibold text-emerald-900 not-italic">Okunuşu: </span>
                {nextHolyDay.celebrationDuaRead}
              </p>
            )}
            <p className="text-xs text-stone-800 font-medium border-t border-emerald-200/60 pt-1">
              <span className="font-semibold text-emerald-900">Anlamı: </span>
              {nextHolyDay.celebrationDua}
            </p>
          </div>
        )}

        {/* Genişletilmiş Liste: Tüm 14 Mübarek Gün ve Kalan Süreler */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-stone-200 animate-fadeIn space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-500 font-semibold px-1">
              <span>İslami Önemli Günler ve Kandiller</span>
              <span>Kalan Gün Süresi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {upcomingList.map((item) => {
                const isClosest = item.id === nextHolyDay.id;
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                      item.isToday
                        ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-300'
                        : isClosest
                        ? 'bg-emerald-50/70 border-emerald-400'
                        : 'bg-stone-50/50 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-stone-900 block">
                            {item.name}
                          </span>
                          {onSelectDate && (
                            <button
                              type="button"
                              onClick={() => onSelectDate(item.gregorianDate)}
                              className="p-1 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/80 rounded-md transition-colors cursor-pointer shrink-0"
                              title={`${item.name} - Takvimde Bu Güne Git`}
                              aria-label={`${item.name} - Takvimde Bu Güne Git`}
                            >
                              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                            </button>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-500 block mt-0.5">
                          {item.desc}
                        </span>
                      </div>

                      <div className="shrink-0 text-right">
                        {item.isToday ? (
                          <span className="inline-block bg-amber-500 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-md shadow-2xs animate-pulse">
                            BUGÜN
                          </span>
                        ) : (
                          <span className={`inline-block font-mono font-bold text-xs px-2 py-0.5 rounded-md border ${
                            isClosest
                              ? 'bg-emerald-900 text-white border-emerald-950'
                              : 'bg-white text-stone-700 border-stone-200'
                          }`}>
                            {item.daysLeft} gün
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-500">
                      <span>Hicri: <strong>{item.hijriFormatted}</strong></span>
                      <div className="flex items-center gap-1">
                        <span>Miladi: <strong>{item.gregorianDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'short' })}</strong></span>
                        {onSelectDate && (
                          <button
                            type="button"
                            onClick={() => onSelectDate(item.gregorianDate)}
                            className="p-0.5 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100 rounded transition-colors cursor-pointer"
                            title="Takvimde Bu Güne Git"
                          >
                            <Calendar className="w-3 h-3 text-emerald-700" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Arapça Dua ve Türkçe Anlamı / Okunuşu */}
                    {item.celebrationDuaArabic && (
                      <div className="mt-2 pt-1.5 border-t border-stone-200/60">
                        <button
                          type="button"
                          onClick={() => toggleDua(item.id)}
                          className="w-full flex items-center justify-between text-[11px] font-bold text-emerald-800 hover:text-emerald-950 transition-colors py-0.5 cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{expandedDuas[item.id] ? 'Duayı Kapat' : 'Günün Duası ve Arapçası'}</span>
                          </span>
                          <span className="text-[10px] text-stone-500">
                            {expandedDuas[item.id] ? '▲' : '▼'}
                          </span>
                        </button>

                        {expandedDuas[item.id] && (
                          <div className="mt-2 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 space-y-1.5 animate-fadeIn">
                            <div dir="rtl" className="text-right">
                              <p className="font-serif text-sm sm:text-base text-stone-900 leading-loose select-all font-semibold">
                                {item.celebrationDuaArabic}
                              </p>
                            </div>
                            {item.celebrationDuaRead && (
                              <p className="text-[11px] text-stone-700 italic border-t border-emerald-200/60 pt-1">
                                <span className="font-semibold text-emerald-900 not-italic">Okunuşu: </span>
                                {item.celebrationDuaRead}
                              </p>
                            )}
                            <p className="text-[11px] text-stone-800 font-medium border-t border-emerald-200/60 pt-1">
                              <span className="font-semibold text-emerald-900">Anlamı: </span>
                              {item.celebrationDua}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
