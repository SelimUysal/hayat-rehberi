import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Compass,
  Sliders,
  Volume2,
  VolumeX,
  History,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Share2,
  FileText,
  Bell,
  Play,
  Square,
  Target
} from 'lucide-react';
import { Coordinates, TemkinSettings, AsrMethod, CalculatedDay } from './types/prayer';
import { DEFAULT_CITY } from './data/cities';
import { calculatePrayerTimesForDate, DEFAULT_TEMKIN, timeStrToMinutes } from './utils/astronomy';
import { getWisdomForDate } from './data/wisdom';
import { getHistoricalEventsForDate } from './data/historicalEvents';
import { getTodayHolyDay, HolyDayItem } from './utils/holyDays';
import { soundManager, SoundMode } from './utils/soundManager';
import {
  SpecialGoalItem,
  loadSpecialGoalsFromStorage,
  getNearestSpecialGoal,
  calculateGoalCountdown,
  SPECIAL_GOALS_UPDATED_EVENT
} from './utils/specialGoalsStorage';

// Modals & Components
import { QiblaCompass } from './components/QiblaCompass';
import { HolyDaysModal } from './components/HolyDaysModal';
import { CalendarPageModal } from './components/CalendarPageModal';
import { HistoricalEventsModal } from './components/HistoricalEventsModal';
import { HolyCelebrationModal } from './components/HolyCelebrationModal';
import { MonthlyTableModal } from './components/MonthlyTableModal';
import { LocationSearchModal } from './components/LocationSearchModal';
import { SettingsModal } from './components/SettingsModal';
import { SpecialGoalsAndCountdown } from './components/SpecialGoalsAndCountdown';
import { SpecialDayPrayerModal, getSpecialDayPrayersForDate } from '../SpecialDayPrayerModal';

interface TakvimAppProps {
  onNavigateToNamaz?: (targetId: string) => void;
}

export const TakvimApp: React.FC<TakvimAppProps> = ({ onNavigateToNamaz }) => {
  // 1. Durumlar (State)
  const [coords, setCoords] = useState<Coordinates>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('namaz_coords');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return DEFAULT_CITY;
  });

  const [temkin, setTemkin] = useState<TemkinSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('namaz_temkin');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.fajr === 0 || parsed.dhuhr === 5)) {
            localStorage.setItem('namaz_temkin', JSON.stringify(DEFAULT_TEMKIN));
            return DEFAULT_TEMKIN;
          }
          return parsed;
        } catch {}
      }
    }
    return DEFAULT_TEMKIN;
  });

  const [asrMethod, setAsrMethod] = useState<AsrMethod>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('namaz_asr');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (parsed === 1 || parsed === 2) return parsed;
      }
    }
    return 1;
  });

  // Seçilen Tarih (Varsayılan: Bugün)
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  // Canlı Saat (Her saniye güncellenir)
  const [now, setNow] = useState<Date>(new Date());

  // Ses Durumu
  const [soundMode, setSoundMode] = useState<SoundMode>(soundManager.getSoundMode());
  const [isPlaying, setIsPlaying] = useState<boolean>(soundManager.getIsPlaying());

  // Modal Açılış Durumları
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isHolyDaysOpen, setIsHolyDaysOpen] = useState(false);
  const [isCalendarPageOpen, setIsCalendarPageOpen] = useState(false);
  const [isHistoricalOpen, setIsHistoricalOpen] = useState(false);
  const [isMonthlyOpen, setIsMonthlyOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSpecialPrayerModalOpen, setIsSpecialPrayerModalOpen] = useState(false);
  const [celebrationDay, setCelebrationDay] = useState<HolyDayItem | null>(null);
  const [showQiblaInline, setShowQiblaInline] = useState(false);
  const [showSpecialGoalsInline, setShowSpecialGoalsInline] = useState(false);
  const [specialGoals, setSpecialGoals] = useState<SpecialGoalItem[]>(() =>
    loadSpecialGoalsFromStorage(Date.now())
  );

  useEffect(() => {
    const syncGoals = () => {
      setSpecialGoals(loadSpecialGoalsFromStorage(Date.now()));
    };
    const cleanupTimer = setInterval(syncGoals, 15000);
    window.addEventListener(SPECIAL_GOALS_UPDATED_EVENT, syncGoals);
    window.addEventListener('storage', syncGoals);
    return () => {
      clearInterval(cleanupTimer);
      window.removeEventListener(SPECIAL_GOALS_UPDATED_EVENT, syncGoals);
      window.removeEventListener('storage', syncGoals);
    };
  }, []);

  const nearestSpecialGoal = useMemo(
    () => getNearestSpecialGoal(specialGoals, now.getTime()),
    [specialGoals, now]
  );

  const nearestGoalCountdown = useMemo(() => {
    if (!nearestSpecialGoal) return null;
    return calculateGoalCountdown(nearestSpecialGoal, now);
  }, [nearestSpecialGoal, now]);

  // Canlı Saat Sayacı (Her saniye)
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ses Yöneticisi Dinleyicisi
  useEffect(() => {
    const unsubscribe = soundManager.subscribe((st) => {
      setSoundMode(st.soundMode);
      setIsPlaying(st.isPlaying);
    });
    return () => unsubscribe();
  }, []);

  // Koordinat, Temkin, Asr Değişimlerini Kaydetme
  const handleSaveCoords = (newCoords: Coordinates) => {
    setCoords(newCoords);
    if (typeof window !== 'undefined') {
      localStorage.setItem('namaz_coords', JSON.stringify(newCoords));
    }
  };

  const handleSaveTemkin = (newTemkin: TemkinSettings) => {
    setTemkin(newTemkin);
    if (typeof window !== 'undefined') {
      localStorage.setItem('namaz_temkin', JSON.stringify(newTemkin));
    }
  };

  const handleSaveAsrMethod = (method: AsrMethod) => {
    setAsrMethod(method);
    if (typeof window !== 'undefined') {
      localStorage.setItem('namaz_asr', method.toString());
    }
  };

  // Seçili günün namaz vakitleri hesabı
  const dayData: CalculatedDay = useMemo(() => {
    return calculatePrayerTimesForDate(currentDate, coords, temkin, asrMethod);
  }, [currentDate, coords, temkin, asrMethod]);

  // Günün Hikmeti & Tarihte Bugün
  const wisdom = useMemo(() => getWisdomForDate(currentDate), [currentDate]);
  const historicalEvents = useMemo(() => getHistoricalEventsForDate(currentDate), [currentDate]);
  const todayHolyDay = useMemo(() => getTodayHolyDay(currentDate), [currentDate]);
  const specialDayPrayers = useMemo(
    () => getSpecialDayPrayersForDate(currentDate, dayData.hijriDate),
    [currentDate, dayData.hijriDate]
  );

  // Sonraki Vakit ve Kalan Süre Hesabı
  const nextPrayerInfo = useMemo(() => {
    const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const times = dayData.times;

    // Ana 6 Vakit Döngüsü: İmsak -> Güneş -> Öğle -> İkindi -> Akşam -> Yatsı
    const prayers = [
      { name: 'İmsak', timeStr: times.imsak, min: timeStrToMinutes(times.imsak) },
      { name: 'Güneş', timeStr: times.gunes, min: timeStrToMinutes(times.gunes) },
      { name: 'Öğle', timeStr: times.ogle, min: timeStrToMinutes(times.ogle) },
      { name: 'İkindi', timeStr: times.ikindi, min: timeStrToMinutes(times.ikindi) },
      { name: 'Akşam', timeStr: times.aksam, min: timeStrToMinutes(times.aksam) },
      { name: 'Yatsı', timeStr: times.yatsi, min: timeStrToMinutes(times.yatsi) }
    ];

    let currentPrayer = prayers[prayers.length - 1]; // Varsayılan: Yatsı
    let nextPrayer = prayers[0]; // Varsayılan: Yarınki İmsak
    let minutesUntil = 0;
    let prevMinutes = 0;

    for (let i = 0; i < prayers.length; i++) {
      if (currentMinutes < prayers[i].min) {
        nextPrayer = prayers[i];
        currentPrayer = i === 0 ? prayers[prayers.length - 1] : prayers[i - 1];
        minutesUntil = prayers[i].min - currentMinutes;
        prevMinutes = i === 0 ? currentPrayer.min - 1440 : currentPrayer.min;
        break;
      }
    }

    // Gece Yatsı'dan sonra, gece yarısını geçip İmsak'a kadar olan süre
    if (currentMinutes >= prayers[prayers.length - 1].min) {
      currentPrayer = prayers[prayers.length - 1];
      nextPrayer = prayers[0];
      minutesUntil = 1440 - currentMinutes + prayers[0].min;
      prevMinutes = currentPrayer.min;
    }

    const totalInterval = (nextPrayer.min >= prevMinutes ? nextPrayer.min - prevMinutes : nextPrayer.min + 1440 - prevMinutes) || 1;
    const elapsed = totalInterval - minutesUntil;
    const progressPercent = Math.min(100, Math.max(0, (elapsed / totalInterval) * 100));

    const hours = Math.floor(minutesUntil / 60);
    const mins = Math.floor(minutesUntil % 60);
    const secs = Math.floor((minutesUntil * 60) % 60);

    return {
      currentPrayer,
      nextPrayer,
      hours,
      mins,
      secs,
      progressPercent
    };
  }, [now, dayData]);

  // Vakit giriş anında sesli bildirim kontrolü (Ezan çalma)
  useEffect(() => {
    // Sadece bugünün tarihi seçiliyse bildirim tetikle
    const isToday =
      currentDate.getFullYear() === now.getFullYear() &&
      currentDate.getMonth() === now.getMonth() &&
      currentDate.getDate() === now.getDate();

    if (!isToday) return;

    const currentFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const times = dayData.times;

    const checkTimes: { [name: string]: string } = {
      'İmsak': times.imsak,
      'Öğle': times.ogle,
      'İkindi': times.ikindi,
      'Akşam': times.aksam,
      'Yatsı': times.yatsi
    };

    Object.entries(checkTimes).forEach(([name, tStr]) => {
      if (tStr === currentFormatted && now.getSeconds() === 0) {
        soundManager.checkAndTriggerPrayerTime(name, dayData.dateString);
      }
    });
  }, [now, currentDate, dayData]);

  // Tarih Gezintisi
  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleResetToday = () => {
    setCurrentDate(new Date());
  };

  const isViewingToday =
    currentDate.getFullYear() === now.getFullYear() &&
    currentDate.getMonth() === now.getMonth() &&
    currentDate.getDate() === now.getDate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 pb-16">
      {/* 1. ÜST NAVİGASYON VE HIZLI EYLEM ÇUBUĞU */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-emerald-100 dark:border-emerald-950/40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Konum Butonu */}
          <button
            onClick={() => setIsLocationOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 transition group"
          >
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <span className="text-xs font-bold block truncate max-w-[180px] sm:max-w-xs">{coords.city}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block -mt-0.5">{coords.country}</span>
            </div>
          </button>

          {/* Hızlı Eylem Butonları */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsCalendarPageOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-xs font-semibold transition"
              title="Geleneksel Takvim Yaprağı"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Takvim Yaprağı</span>
            </button>

            <button
              onClick={() => setIsMonthlyOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 text-xs font-semibold transition"
              title="Aylık İmsakiye ve Çizelge"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Aylık Vakitler</span>
            </button>

            <button
              onClick={() => setIsHolyDaysOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/40 text-purple-900 dark:text-purple-200 text-xs font-semibold transition"
              title="Dini Günler ve Kandiller"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden md:inline">Dini Günler</span>
            </button>

            <button
              onClick={() => setShowQiblaInline(!showQiblaInline)}
              className={`p-2 rounded-xl border text-xs transition ${
                showQiblaInline
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
              title="Kıble Pusulası"
            >
              <Compass className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowSpecialGoalsInline(!showSpecialGoalsInline)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                showSpecialGoalsInline
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200'
              }`}
              title="Özel Hedefler & Geri Sayım"
            >
              <Target className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Özel Hedefler & Geri Sayım</span>
            </button>

            <button
              onClick={() => soundManager.togglePlay()}
              className={`p-2 rounded-xl border text-xs transition ${
                isPlaying
                  ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
              title={isPlaying ? 'Ezanı Durdur' : 'Ezanı Dinle'}
            >
              {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs transition"
              title="Hesaplama ve Ses Ayarları"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. ANA İÇERİK KAPSAYICISI */}
      <main className="max-w-6xl mx-auto px-4 pt-4 sm:pt-6 space-y-5">
        {/* BUGÜNÜN MÜBAREK GÜN / KANDİL BANNERI (Varsa) */}
        {todayHolyDay && (
          <div
            onClick={() => setCelebrationDay(todayHolyDay)}
            className="cursor-pointer p-4 rounded-3xl bg-gradient-to-r from-purple-700 via-emerald-800 to-teal-800 text-white shadow-lg border border-purple-300/30 flex items-center justify-between gap-3 hover:scale-[1.01] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
                <Sparkles className="w-6 h-6 text-amber-300 animate-spin-slow" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-300 font-bold block">
                  ✨ Mübarek Gün İdrak Ediliyor ✨
                </span>
                <h3 className="text-base sm:text-lg font-bold font-serif">{todayHolyDay.name}</h3>
                <p className="text-xs text-white/80">{todayHolyDay.desc}</p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl font-semibold backdrop-blur-sm inline-block">
                Tebrik Kartını Aç →
              </span>
            </div>
          </div>
        )}

        {/* TARİH SEÇİCİ VE CANLI SAAT ÇUBUĞU */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-emerald-100 dark:border-emerald-950/40 shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* Sol: Tarih Gezinme Butonları */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevDay}
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
              title="Önceki Gün"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100">
                  {dayData.dayNumber} {dayData.monthName} {dayData.year}
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {dayData.dayName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span>Hicrî: {dayData.hijriDate.formatted}</span>
                <span>•</span>
                <span>Rûmî: {dayData.rumiDate.formatted}</span>
              </div>
            </div>

            <button
              onClick={handleNextDay}
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
              title="Sonraki Gün"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {!isViewingToday && (
              <button
                onClick={handleResetToday}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline ml-2"
              >
                Bugüne Dön
              </button>
            )}
          </div>

          {/* Sağ: En Yakın Hedef Minimalist Alanı & Günün İbadeti & Canlı Saat */}
          <div className="flex flex-wrap items-center gap-3">
            {specialDayPrayers.length > 0 && (
              <div className="relative inline-flex items-center">
                <span className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500 opacity-75 blur-2xs" />
                <button
                  type="button"
                  onClick={() => setIsSpecialPrayerModalOpen(true)}
                  className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 hover:from-emerald-800 hover:to-teal-800 text-white font-black text-xs shadow-md transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer border border-amber-400/80"
                  title={specialDayPrayers[0].headerTitle}
                >
                  <div className="relative flex items-center justify-center w-6 h-6 rounded-lg bg-amber-400 text-stone-950 shadow-inner shrink-0">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-left leading-tight">
                    <span className="tracking-tight font-extrabold text-[11px] sm:text-xs text-white">
                      {specialDayPrayers[0].buttonLabel}
                    </span>
                    <span className="text-[10px] text-amber-300 font-bold">
                      {specialDayPrayers[0].buttonSubLabel}
                    </span>
                  </div>
                </button>
              </div>
            )}
            {nearestSpecialGoal && nearestGoalCountdown && (
              <button
                type="button"
                onClick={() => setShowSpecialGoalsInline(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs transition hover:border-emerald-400"
              >
                <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
                  {nearestSpecialGoal.title}
                </span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                {!nearestGoalCountdown.isExpired ? (
                  <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums">
                    {nearestGoalCountdown.days} Gün {String(nearestGoalCountdown.hours).padStart(2, '0')} Saat {String(nearestGoalCountdown.minutes).padStart(2, '0')} Dk
                  </span>
                ) : (
                  <span className="font-mono font-bold text-amber-600 tabular-nums">
                    Süre Doldu ({nearestGoalCountdown.autoDeleteRemainingDays}g saklanır)
                  </span>
                )}
              </button>
            )}
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Canlı Yerel Saat</span>
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-800 dark:text-emerald-300 tabular-nums">
                {String(now.getHours()).padStart(2, '0')}:{String(now.getMinutes()).padStart(2, '0')}
                <span className="text-sm font-normal text-slate-400 ml-1">
                  :{String(now.getSeconds()).padStart(2, '0')}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* AÇILIR ÖZEL HEDEFLER & GERİ SAYIM BÖLÜMÜ */}
        {showSpecialGoalsInline && (
          <div className="animate-in fade-in duration-200">
            <SpecialGoalsAndCountdown systemNow={now} />
          </div>
        )}

        {/* 3. VAKİT GERİ SAYIM KARTI (HERO SECTION) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-700/40">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Sol: Sıradaki Vakit Bilgisi */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-emerald-200 border border-white/10">
                <Clock className="w-3.5 h-3.5" />
                <span>Şu Anki Vakit: {nextPrayerInfo.currentPrayer.name}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-serif">
                {nextPrayerInfo.nextPrayer.name} Vaktine Kalan Süre
              </h1>

              <p className="text-xs sm:text-sm text-emerald-100/80">
                {nextPrayerInfo.nextPrayer.name} Ezânı: <span className="font-bold text-white font-mono">{nextPrayerInfo.nextPrayer.timeStr}</span>
              </p>
            </div>

            {/* Sağ: Geri Sayım Sayacı */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex flex-col items-center bg-black/25 backdrop-blur-md rounded-2xl p-3 sm:p-4 min-w-[68px] sm:min-w-[80px] border border-white/10">
                <span className="text-2xl sm:text-3xl font-black font-mono">{String(nextPrayerInfo.hours).padStart(2, '0')}</span>
                <span className="text-[10px] text-emerald-200 uppercase font-semibold mt-0.5">Saat</span>
              </div>
              <span className="text-2xl font-bold opacity-60">:</span>
              <div className="flex flex-col items-center bg-black/25 backdrop-blur-md rounded-2xl p-3 sm:p-4 min-w-[68px] sm:min-w-[80px] border border-white/10">
                <span className="text-2xl sm:text-3xl font-black font-mono">{String(nextPrayerInfo.mins).padStart(2, '0')}</span>
                <span className="text-[10px] text-emerald-200 uppercase font-semibold mt-0.5">Dakika</span>
              </div>
              <span className="text-2xl font-bold opacity-60">:</span>
              <div className="flex flex-col items-center bg-black/25 backdrop-blur-md rounded-2xl p-3 sm:p-4 min-w-[68px] sm:min-w-[80px] border border-white/10">
                <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300">{String(nextPrayerInfo.secs).padStart(2, '0')}</span>
                <span className="text-[10px] text-emerald-200 uppercase font-semibold mt-0.5">Saniye</span>
              </div>
            </div>
          </div>

          {/* İlerleme Çubuğu */}
          <div className="mt-6 space-y-1.5">
            <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-amber-300 rounded-full transition-all duration-1000"
                style={{ width: `${nextPrayerInfo.progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-emerald-200/80 font-mono">
              <span>{nextPrayerInfo.currentPrayer.name} ({nextPrayerInfo.currentPrayer.timeStr})</span>
              <span>{nextPrayerInfo.nextPrayer.name} ({nextPrayerInfo.nextPrayer.timeStr})</span>
            </div>
          </div>
        </div>

        {/* 4. GÜNÜN TÜM VAKİTLERİ KARTLARI */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              id: 'imsak',
              name: 'İmsak',
              arabic: 'الفجر',
              time: dayData.times.imsak,
              sub: 'Oruç & Fecr',
              icon: Moon,
              isNext: nextPrayerInfo.nextPrayer.name === 'İmsak',
              isCurrent: nextPrayerInfo.currentPrayer.name === 'İmsak'
            },
            {
              id: 'gunes',
              name: 'Güneş',
              arabic: 'الشروق',
              time: dayData.times.gunes,
              sub: 'Doğuş (Tulu)',
              icon: Sun,
              isNext: nextPrayerInfo.nextPrayer.name === 'Güneş',
              isCurrent: nextPrayerInfo.currentPrayer.name === 'Güneş'
            },
            {
              id: 'ogle',
              name: 'Öğle',
              arabic: 'الظهر',
              time: dayData.times.ogle,
              sub: 'Zeval Vakti',
              icon: Sun,
              isNext: nextPrayerInfo.nextPrayer.name === 'Öğle',
              isCurrent: nextPrayerInfo.currentPrayer.name === 'Öğle'
            },
            {
              id: 'ikindi',
              name: 'İkindi',
              arabic: 'العصر',
              time: dayData.times.ikindi,
              sub: asrMethod === 1 ? 'Asr-ı Evvel' : 'Asr-ı Sânî',
              icon: Sun,
              isNext: nextPrayerInfo.nextPrayer.name === 'İkindi',
              isCurrent: nextPrayerInfo.currentPrayer.name === 'İkindi'
            },
            {
              id: 'aksam',
              name: 'Akşam',
              arabic: 'المغرب',
              time: dayData.times.aksam,
              sub: 'İftar & Gurub',
              icon: Moon,
              isNext: nextPrayerInfo.nextPrayer.name === 'Akşam',
              isCurrent: nextPrayerInfo.currentPrayer.name === 'Akşam'
            },
            {
              id: 'yatsi',
              name: 'Yatsı',
              arabic: 'العشاء',
              time: dayData.times.yatsi,
              sub: 'Şafak-ı Ahmer',
              icon: Moon,
              isNext: nextPrayerInfo.nextPrayer.name === 'Yatsı',
              isCurrent: nextPrayerInfo.currentPrayer.name === 'Yatsı'
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`relative rounded-3xl p-4 border transition-all ${
                  item.isNext
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20 scale-[1.02]'
                    : item.isCurrent
                    ? 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-500/10 dark:border-amber-500/20 text-slate-800 dark:text-slate-100 ring-1 ring-amber-500/20'
                    : 'bg-white/80 dark:bg-slate-900/80 border-emerald-100 dark:border-emerald-950/40 text-slate-800 dark:text-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      item.isNext ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.name}
                  </span>
                  <span
                    className={`text-xs font-serif ${
                      item.isNext ? 'text-emerald-200' : 'text-slate-400'
                    }`}
                  >
                    {item.arabic}
                  </span>
                </div>

                <div className="my-1.5">
                  <span
                    className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                      item.isNext ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {item.time}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className={item.isNext ? 'text-emerald-100' : 'text-slate-400'}>
                    {item.sub}
                  </span>
                  {item.isNext && (
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold animate-pulse">
                      SIRADAKİ
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 5. FIKHÎ & EK VAKİTLER ŞERİDİ */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-emerald-100 dark:border-emerald-950/40 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Fıkhî & Hassas Vakit Ölçüleri
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Temkinli Ehl-i Sünnet Hesabı</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sabah (İsfar)</span>
              <span className="text-base font-black font-mono text-slate-800 dark:text-slate-200">
                {dayData.times.sabah}
              </span>
              <span className="text-[9px] text-slate-400 block">İmsak + 23 dk</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Camide Sabah</span>
              <span className="text-base font-black font-mono text-slate-800 dark:text-slate-200">
                {dayData.times.camiSabah}
              </span>
              <span className="text-[9px] text-slate-400 block">Güneş - 30 dk</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">İşrak (Kuşluk)</span>
              <span className="text-base font-black font-mono text-slate-800 dark:text-slate-200">
                {dayData.times.israk}
              </span>
              <span className="text-[9px] text-slate-400 block">Kerahet sonu</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Dahve-i Kübrâ</span>
              <span className="text-base font-black font-mono text-slate-800 dark:text-slate-200">
                {dayData.times.dahve}
              </span>
              <span className="text-[9px] text-slate-400 block">Oruç niyeti sonu</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-semibold block">Kıble Saati</span>
              <span className="text-base font-black font-mono text-emerald-800 dark:text-emerald-300">
                {dayData.times.kibleSaati}
              </span>
              <span className="text-[9px] text-slate-400 block">Güneş kıble hizası</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gece Yarısı</span>
              <span className="text-base font-black font-mono text-slate-800 dark:text-slate-200">
                {dayData.times.geceyarisi}
              </span>
              <span className="text-[9px] text-slate-400 block">Teheccüd son yarı</span>
            </div>
          </div>

          {/* Bayram Namazı Bilgisi (Eğer o gün bayramsa) */}
          {dayData.times.bayramNamaz && (
            <div className="mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
              <span className="font-bold text-amber-800 dark:text-amber-300">
                🕌 {dayData.times.bayramName || 'Bayram Namazı Vakti'}:
              </span>
              <span className="font-mono font-black text-amber-900 dark:text-amber-200 text-base">
                {dayData.times.bayramNamaz}
              </span>
            </div>
          )}
        </div>

        {/* 6. AÇILIR KIBLE PUSULASI BÖLÜMÜ */}
        {showQiblaInline && (
          <div className="animate-in fade-in duration-200">
            <QiblaCompass lat={coords.lat} lng={coords.lng} cityName={coords.city} />
          </div>
        )}

        {/* 7. GÜNÜN HİKMETLERİ: AYET & HADİS & TARİHTE BUGÜN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sol Kolon: Ayet-i Kerime & Hadis-i Şerif */}
          <div className="space-y-4">
            {/* Ayet */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-5 border border-emerald-100 dark:border-emerald-950/40 shadow-xs">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  Günün Âyet-i Kerîmesi
                </h4>
              </div>
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 font-serif leading-relaxed italic">
                "{wisdom.verse.text}"
              </p>
              <div className="text-right mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                — {wisdom.verse.source}
              </div>
            </div>

            {/* Hadis */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-5 border border-amber-100 dark:border-amber-950/40 shadow-xs">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  Günün Hadîs-i Şerîfi
                </h4>
              </div>
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 font-serif leading-relaxed italic">
                "{wisdom.hadith.text}"
              </p>
              <div className="text-right mt-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                — {wisdom.hadith.source}
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Tarihte Bugün & Günün Makalesi */}
          <div className="space-y-4">
            {/* Tarihte Bugün */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                      <History className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400">
                      Tarihte Bugün ({dayData.dayNumber} {dayData.monthName})
                    </h4>
                  </div>
                  <button
                    onClick={() => setIsHistoricalOpen(true)}
                    className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 hover:underline"
                  >
                    Tümünü Gör →
                  </button>
                </div>

                <div className="space-y-2">
                  {historicalEvents.slice(0, 3).map((ev, i) => (
                    <div key={i} className="text-xs text-slate-600 dark:text-slate-400 border-l-2 border-rose-300 dark:border-rose-900 pl-2.5 py-0.5">
                      {ev.year ? <strong className="text-slate-800 dark:text-slate-200">{ev.year}: </strong> : null}
                      {ev.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Günün Hikmetli Sözü */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Günün Sözü:</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic">"{wisdom.saying}"</p>
              </div>
            </div>

            {/* Fıkıh & Ahlak Notu */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {wisdom.article.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4">
                {wisdom.article.content}
              </p>
              <button
                onClick={() => setIsCalendarPageOpen(true)}
                className="mt-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-block"
              >
                Takvim Yaprağında Tamamını Oku →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 8. TÜM MODAL BİLEŞENLERİ */}
      <LocationSearchModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        currentCoords={coords}
        onSelectCoords={handleSaveCoords}
      />

      <HolyDaysModal
        isOpen={isHolyDaysOpen}
        onClose={() => setIsHolyDaysOpen(false)}
        onSelectCelebration={(day) => setCelebrationDay(day)}
      />

      <CalendarPageModal
        isOpen={isCalendarPageOpen}
        onClose={() => setIsCalendarPageOpen(false)}
        dayData={dayData}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
      />

      <HistoricalEventsModal
        isOpen={isHistoricalOpen}
        onClose={() => setIsHistoricalOpen(false)}
        currentDate={currentDate}
      />

      <HolyCelebrationModal
        isOpen={celebrationDay !== null}
        onClose={() => setCelebrationDay(null)}
        holyDay={celebrationDay}
      />

      <MonthlyTableModal
        isOpen={isMonthlyOpen}
        onClose={() => setIsMonthlyOpen(false)}
        currentDate={currentDate}
        coords={coords}
        temkin={temkin}
        asrMethod={asrMethod}
        onSelectDay={(selectedDate) => setCurrentDate(selectedDate)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        temkin={temkin}
        onSaveTemkin={handleSaveTemkin}
        asrMethod={asrMethod}
        onSaveAsrMethod={handleSaveAsrMethod}
      />

      {specialDayPrayers.length > 0 && (
        <SpecialDayPrayerModal
          isOpen={isSpecialPrayerModalOpen}
          onClose={() => setIsSpecialPrayerModalOpen(false)}
          guides={specialDayPrayers}
          onNavigateToNamaz={onNavigateToNamaz}
        />
      )}
    </div>
  );
};
