import React, { useState, useEffect, useMemo } from 'react';
import { Coordinates } from '../types/prayer';
import { DEFAULT_CITY } from '../data/cities';
import { DEFAULT_TEMKIN, calculatePrayerTimesForDate, getHijriDate, getRumiDate } from '../utils/astronomy';
import { calculateAlaturkaTime, getMuvakkithaneTimes, getOttomanTripleDate } from './utils/alaturkaTime';
import { OttomanAnalogClock } from './components/OttomanAnalogClock';
import { AlaturkaTimeTravelSlider } from './components/AlaturkaTimeTravelSlider';
import { MuvakkithaneTable } from './components/MuvakkithaneTable';
import { OttomanHistoryGuide } from './components/OttomanHistoryGuide';
import { CitySelectorModal } from '../components/CitySelectorModal';
import {
  Compass,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LayoutTemplate,
  Clock,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface OsmanliModuleProps {
  initialCity?: Coordinates | null;
  onNavigateToTakvim?: (templateToSet?: 'osmanli') => void;
}

export const OsmanliModule: React.FC<OsmanliModuleProps> = ({
  initialCity,
  onNavigateToTakvim
}) => {
  // Seçili Şehir (Yerel Hafıza ile Senkronize)
  const [currentLocation, setCurrentLocation] = useState<Coordinates>(() => {
    if (initialCity) return initialCity;
    try {
      const saved = localStorage.getItem('namaz_current_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_CITY;
  });

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [systemNow, setSystemNow] = useState<Date>(() => new Date());
  const [isCityModalOpen, setIsCityModalOpen] = useState<boolean>(false);

  // Canlı Saat Tıklaması (Her 1 saniyede bir güncellenir)
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Şehir Değiştirme
  const handleSelectCity = (newCity: Coordinates) => {
    setCurrentLocation(newCity);
    try {
      localStorage.setItem('namaz_current_location', JSON.stringify(newCity));
    } catch {}
    setIsCityModalOpen(false);
  };

  // Namaz ve Astronomi Verileri
  const todayData = useMemo(() => {
    return calculatePrayerTimesForDate(selectedDate, currentLocation, DEFAULT_TEMKIN, 1);
  }, [selectedDate, currentLocation]);

  // Üçüz Tarih (Hicrî, Rûmî, Mîlâdî)
  const tripleDate = useMemo(() => {
    const hDate = getHijriDate(selectedDate);
    const rDate = getRumiDate(selectedDate);
    return getOttomanTripleDate(selectedDate, hDate, rDate);
  }, [selectedDate]);

  // Canlı Alaturka Saat
  const alaturkaTime = useMemo(() => {
    return calculateAlaturkaTime(systemNow, todayData.times.aksam);
  }, [systemNow, todayData.times.aksam]);

  // Standart (Alafranga) Saat Metni
  const alafrangaTimeStr = useMemo(() => {
    return systemNow.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, [systemNow]);

  // Tarihi Muvakkithâne Vakit Cetveli Verileri
  const muvakkithaneEntries = useMemo(() => {
    return getMuvakkithaneTimes(todayData.times, todayData.rawTimes, systemNow);
  }, [todayData.times, todayData.rawTimes, systemNow]);

  // Tarih Gezinimi
  const handlePrevDay = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Bu Görünümü Takvim'e Uygula Butonu
  const handleApplyToTakvim = () => {
    try {
      localStorage.setItem('namaz_hero_template', 'osmanli');
    } catch {}
    if (onNavigateToTakvim) {
      onNavigateToTakvim('osmanli');
    } else {
      window.location.hash = '#takvim';
    }
  };

  const locationDisplay = currentLocation.district
    ? `${currentLocation.district}, ${currentLocation.city}`
    : currentLocation.city;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 pb-16">
      
      {/* 1. ÜST OSMANLI SARAY & MUVAKKİTHÂNE BANNERI */}
      <section className="bg-gradient-to-r from-[#2c220a] via-[#473711] to-[#2c220a] text-white border-b-2 border-[#d4af37] shadow-md relative overflow-hidden">
        
        {/* Dekoratif Rûmî Bordür Arka Planı */}
        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-between">
          <div className="w-64 h-64 border border-[#d4af37] rounded-full -translate-x-32" />
          <div className="w-64 h-64 border border-[#d4af37] rounded-full translate-x-32" />
        </div>

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10 space-y-4">
          
          {/* Üst Satır: Başlık, Şehir Seçici ve Takvim'e Aktar Butonu */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Sol: Modül Başlığı ve Muvakkithâne Tuğrası */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#d4af37] text-[#2c220a] flex items-center justify-center shadow-md font-serif font-black text-xl border border-amber-200 shrink-0">
                <span>س</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-serif uppercase tracking-widest text-amber-300 font-bold">
                    Muvakkithâne-i Âmire
                  </span>
                  <span className="text-amber-400/60" aria-hidden="true">·</span>
                  <span className="text-[11px] text-stone-300 font-serif">
                    Saat-i Ezânîye & Rûznâme
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-white tracking-tight">
                  Osmanlı Saati & Muvakkithâne Takvimi
                </h1>
              </div>
            </div>

            {/* Sağ: Şehir Seçici & "Takvim'e Osmanlı Görünümü Uygula" Butonu */}
            <div className="flex items-center gap-2.5 flex-wrap">
              
              {/* Şehir Seçici */}
              <button
                type="button"
                onClick={() => setIsCityModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/40 hover:bg-black/60 border border-[#d4af37]/60 text-stone-200 hover:text-white transition-all text-xs font-semibold cursor-pointer shadow-inner"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{locationDisplay}</span>
              </button>

              {/* Takvim'e Aktar Butonu */}
              <button
                type="button"
                onClick={handleApplyToTakvim}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-amber-400 to-[#b59230] hover:from-amber-300 hover:to-amber-500 text-[#2c220a] font-serif font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer border border-amber-200"
                title="Takvim ana sayfasındaki Görünüm menüsünü Osmanlı Muvakkithane şablonuna ayarlar"
              >
                <LayoutTemplate className="w-4 h-4 text-[#2c220a]" />
                <span>Bu Görünümü Takvim'e Uygula</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </div>

          </div>

          {/* Alt Satır: ÜÇÜZ TARİH BANNERI (Hicrî - Rûmî - Mîlâdî) & Tarih Gezinimi */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/35 border border-[#d4af37]/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* 3 Tarih Sistemi Bir Arada */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 text-xs">
              
              {/* 1. HİCRÎ-KAMERÎ */}
              <div className="space-y-0.5 sm:pr-3">
                <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  <span>🌙 Hicrî-Kamerî</span>
                </span>
                <div className="text-sm font-serif font-bold text-white">
                  {tripleDate.hijri.formatted}
                </div>
                <div className="text-[11px] text-amber-200/80 font-serif">
                  {tripleDate.hijri.arabicNumerals}
                </div>
              </div>

              {/* 2. RÛMÎ-MÂLÎ (Osmanlı Resmi Takvimi) */}
              <div className="space-y-0.5 pt-2 sm:pt-0 sm:px-3">
                <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  <span>📜 Rûmî-Mâlî (Osmanlı)</span>
                </span>
                <div className="text-sm font-serif font-bold text-white">
                  {tripleDate.rumi.formatted}
                </div>
                <div className="text-[11px] text-amber-200/80 font-serif">
                  {tripleDate.rumi.arabicNumerals}
                </div>
              </div>

              {/* 3. MÎLÂDÎ & OSMANLICA GÜN */}
              <div className="space-y-0.5 pt-2 sm:pt-0 sm:pl-3">
                <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1">
                  <span>☀️ Mîlâdî-Şemsî</span>
                </span>
                <div className="text-sm font-bold text-white">
                  {tripleDate.miladi.formatted}
                </div>
                <div className="text-[11px] text-amber-200/90 font-serif">
                  {tripleDate.ottomanDayName}
                </div>
              </div>

            </div>

            {/* Sağ: Tarih Değiştirme Okları */}
            <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0">
              <button
                type="button"
                onClick={handlePrevDay}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                title="Önceki Gün"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#2c220a] font-serif font-black text-xs transition cursor-pointer"
              >
                Bugün
              </button>
              <button
                type="button"
                onClick={handleNextDay}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                title="Sonraki Gün"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 2. ANA GÖVDE: 1440px Hizalı Konteynır */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Üst Çift Kart Grubu: Sol Kadran, Sağ 24 Saatlik Zaman Çevirici */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sol: Otantik Osmanlı Analog Kadranı (5 Kolon) */}
          <div className="lg:col-span-5">
            <OttomanAnalogClock
              alaturkaTime={alaturkaTime}
              alafrangaTimeStr={alafrangaTimeStr}
              sunsetTimeStr={todayData.times.aksam}
              cityName={locationDisplay}
            />
          </div>

          {/* Sağ: İnteraktif 24 Saat Zaman Yolcusu & Çevirici (7 Kolon) */}
          <div className="lg:col-span-7">
            <AlaturkaTimeTravelSlider
              sunsetTimeStr={todayData.times.aksam}
              times={todayData.times}
              currentNow={systemNow}
            />
          </div>

        </div>

        {/* Tarihi Muvakkithâne Vakit Cetveli Tablosu */}
        <section>
          <MuvakkithaneTable
            entries={muvakkithaneEntries}
            cityName={locationDisplay}
          />
        </section>

        {/* Osmanlı Astronomi & Tarih Rehberi */}
        <section>
          <OttomanHistoryGuide />
        </section>

      </main>

      {/* Şehir Seçici Modal */}
      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        currentCity={currentLocation}
        onSelectCity={handleSelectCity}
      />

    </div>
  );
};
