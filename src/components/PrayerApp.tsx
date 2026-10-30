/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Coordinates, TemkinSettings, AsrMethod } from '../types/prayer';
import { DEFAULT_CITY } from '../data/cities';
import { DEFAULT_TEMKIN, calculatePrayerTimesForDate } from '../utils/astronomy';
import { resolveLocationTimezone, zoneNowDate } from '../utils/locationTimezone';
import { Header, TakvimSubTab } from './Header';
import { makeTakvimHash, parseTakvimHash } from '../utils/takvimDeepLinks';
import { navigateToAppHash } from '../utils/appNavigation';
import { HeroCountdown } from './HeroCountdown';
import { PrayerCards } from './PrayerCards';
import { MonthlyCalendar } from './MonthlyCalendar';
import { QiblaCompass } from './QiblaCompass';
import { NearbyMosques } from './NearbyMosques';
import { HolyDaysWidget } from './HolyDaysWidget';
import { CitySelectorModal } from './CitySelectorModal';
import { SpecialGoalsAndCountdown } from './takvim/components/SpecialGoalsAndCountdown';

interface PrayerAppProps {
  initialDate?: Date | null;
  initialSubTab?: TakvimSubTab | null;
  initialCity?: Coordinates | null;
  initialAction?: 'city' | 'holydays' | null;
  targetTimestamp?: number;
  onNavigateToNamaz?: (targetId: string) => void;
  onOpenWorldClock?: () => void;
  onOpenOsmanli?: () => void;
  adhanSound?: { enabled: boolean; changeEnabled: (next: boolean) => void; playing: boolean; testSound: () => void; status: string };
}

export function PrayerApp({ initialDate, initialSubTab, initialCity, initialAction, targetTimestamp, onNavigateToNamaz, onOpenWorldClock, onOpenOsmanli, adhanSound }: PrayerAppProps = {}) {
  // Durum Yönetimi (Seçilen konumu ve koordinatları yerel depolamada saklar)
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

  const [temkin] = useState<TemkinSettings>(DEFAULT_TEMKIN);
  const [asrMethod] = useState<AsrMethod>(1);
  const [selectedDate, setSelectedDate] = useState<Date>(() => initialDate || new Date());
  const lastAutoDateRef = React.useRef<string | null>(null);
  const [activeTab, setActiveTab] = useState<TakvimSubTab>(() => initialSubTab || (typeof window !== 'undefined' ? parseTakvimHash(window.location.hash) : null) || 'daily');

  const selectTakvimTab = (tab: TakvimSubTab) => {
    setActiveTab(tab);
    navigateToAppHash(makeTakvimHash(tab));
  };

  useEffect(() => {
    const syncRoute = () => {
      const route = parseTakvimHash(window.location.hash);
      if (route) setActiveTab(route);
    };
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    return () => { window.removeEventListener('hashchange', syncRoute); window.removeEventListener('popstate', syncRoute); };
  }, []);

  // Ortak Canlı Sistem Saati ("Canlı Saat Rozeti" ve Özel Hedefler Geri Sayımı için tam senkronize)
  const [systemNow, setSystemNow] = useState<Date>(() => new Date());
  // Migrate older saved international locations without changing Turkey presets.
  useEffect(() => {
    if (currentLocation.timezoneId || currentLocation.country === 'Türkiye' || currentLocation.country === 'Turkey') return;
    let cancelled = false;
    resolveLocationTimezone(currentLocation).then(resolved => {
      if (cancelled || !resolved.timezoneId) return;
      setCurrentLocation(resolved);
      try { localStorage.setItem('namaz_current_location', JSON.stringify(resolved)); } catch {}
    });
    return () => { cancelled = true; };
  }, [currentLocation.lat, currentLocation.lng, currentLocation.country, currentLocation.timezoneId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
      if (!initialSubTab) {
        setActiveTab('daily');
      }
    }
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
    if (initialCity) {
      const updatedLocation: Coordinates = {
        ...initialCity,
        lat: Number(Number(initialCity.lat).toFixed(6)),
        lng: Number(Number(initialCity.lng).toFixed(6)),
        timezone: Number(initialCity.timezone)
      };
      setCurrentLocation(updatedLocation);
      try {
        localStorage.setItem('namaz_current_location', JSON.stringify(updatedLocation));
      } catch {}
    }
    if (initialAction === 'city') {
      setIsCityModalOpen(true);
    } else if (initialAction === 'holydays') {
      setActiveTab('daily');
      setTimeout(() => {
        const el = document.getElementById('holy-days-widget-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [initialDate, initialSubTab, initialCity, initialAction, targetTimestamp]);

  // Advance the daily date at location midnight only if the user is viewing today;
  // preserve a manually selected historical/future date.
  useEffect(() => {
    const nowAtLocation = zoneNowDate(currentLocation.timezoneId);
    const key = `${nowAtLocation.getFullYear()}-${nowAtLocation.getMonth()}-${nowAtLocation.getDate()}`;
    const previous = lastAutoDateRef.current;
    if (previous && previous !== key) {
      setSelectedDate(prev => {
        const previousDay = new Date(nowAtLocation); previousDay.setDate(previousDay.getDate() - 1);
        return prev.toDateString() === previousDay.toDateString() ? nowAtLocation : prev;
      });
    }
    lastAutoDateRef.current = key;
  }, [systemNow, currentLocation.timezoneId]);

  // Modallar
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  // Konum değiştiğinde yeni nesne oluşturup anında vakitleri tetikle ve kaydet
  const selectionId = React.useRef(0);
  const handleSelectCity = async (newCity: Coordinates) => {
    const requestId = ++selectionId.current;
    const updatedLocation: Coordinates = {
      ...newCity,
      lat: Number(Number(newCity.lat).toFixed(6)),
      lng: Number(Number(newCity.lng).toFixed(6)),
      timezone: Number(newCity.timezone)
    };
    // Keep the previous, verified location visible until the new timezone is resolved.
    // This prevents briefly displaying Kuala Lumpur with Istanbul UTC+3 prayer times.
    const resolvedLocation = await resolveLocationTimezone(updatedLocation);
    if (requestId !== selectionId.current) return;
    setCurrentLocation(resolvedLocation);
    try {
      localStorage.setItem('namaz_current_location', JSON.stringify(resolvedLocation));
    } catch {}
  };

  // Seçili tarihe ait namaz vakitleri (enlem/boylam değişimine tam hassas dinamik hesaplama)
  const todayData = useMemo(() => {
    return calculatePrayerTimesForDate(selectedDate, currentLocation, temkin, asrMethod);
  }, [
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    currentLocation.lat,
    currentLocation.lng,
    currentLocation.timezone,
    currentLocation.timezoneId,
    temkin,
    asrMethod
  ]);

  // Yarınki vakitler (özellikle Yatsı sonrası İmsak geri sayımı için)
  const tomorrowData = useMemo(() => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return calculatePrayerTimesForDate(nextDay, currentLocation, temkin, asrMethod);
  }, [
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    currentLocation.lat,
    currentLocation.lng,
    currentLocation.timezone,
    currentLocation.timezoneId,
    temkin,
    asrMethod
  ]);

  // Tarih navigasyonu
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
    setSelectedDate(zoneNowDate(currentLocation.timezoneId));
  };

  const isSelectedToday = useMemo(() => {
    const now = zoneNowDate(currentLocation.timezoneId);
    return (
      selectedDate.getDate() === now.getDate() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear()
    );
  }, [selectedDate, systemNow, currentLocation.timezoneId]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-800 font-sans">
      
      {/* Üst Navigasyon & Başlık (Canlı Saat) */}
      <Header
        currentLocation={currentLocation}
        todayData={todayData}
        activeTab={activeTab}
        onTabChange={selectTakvimTab}
        systemNow={systemNow}
        onOpenWorldClock={onOpenWorldClock}
        onOpenOsmanli={onOpenOsmanli}
        adhanSound={adhanSound}
      />

      {/* Ana İçerik */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {currentLocation.timezoneStatus === 'unverified' && (
          <div role="alert" className="rounded-xl border border-amber-400 bg-amber-50 p-4 text-amber-950 space-y-2">
            <p className="font-bold">Bu konumun saat dilimi doğrulanamadı.</p>
            <p className="text-sm">Yanlış UTC farkıyla namaz vakti göstermemek için konumu yeniden doğrulayın. İnternet bağlantınızı kontrol edin veya konum seçiciden saat dilimi bilinen bir şehir seçin.</p>
            <button type="button" onClick={() => setIsCityModalOpen(true)} className="rounded-lg bg-amber-800 px-3 py-2 text-sm font-semibold text-white">Konumu yeniden seç</button>
          </div>
        )}
        
        {/* Tab İçerikleri */}
        {activeTab === 'daily' && currentLocation.timezoneStatus !== 'unverified' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Vakit Ekranı: Şablon seçici, büyütülmüş miladi tarih & ay sayı/yazı butonu */}
            <HeroCountdown
              key={`hero-${currentLocation.lat}-${currentLocation.lng}-${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`}
              todayData={todayData}
              tomorrowImsak={tomorrowData.times.imsak}
              currentLocation={currentLocation}
              onPrevDay={handlePrevDay}
              onNextDay={handleNextDay}
              onToday={handleToday}
              isSelectedToday={isSelectedToday}
              onSelectDate={(dateStr) => setSelectedDate(new Date(dateStr + 'T12:00:00'))}
              onOpenCitySelector={() => setIsCityModalOpen(true)}
              onNavigateToNamaz={onNavigateToNamaz}
              onOpenOsmanliModule={onOpenOsmanli}
            />

            {/* Mübarek Günler ve Kandiller Takvimi / Geri Sayım (Takvim ile Günün Namaz Saatleri Arasında) */}
            <div id="holy-days-widget-section">
              <HolyDaysWidget
                currentDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>

            {/* Günün Namaz Vakitleri Kartları */}
            <PrayerCards 
              key={`cards-${currentLocation.lat}-${currentLocation.lng}-${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`}
              todayData={todayData} 
              timezoneId={currentLocation.timezoneId}
              asrMethod={asrMethod} 
              isSelectedToday={isSelectedToday} 
            />
          </div>
        )}

        {activeTab === 'monthly' && currentLocation.timezoneStatus !== 'unverified' && (
          <div className="animate-fadeIn space-y-6">
            <MonthlyCalendar
              key={`monthly-${currentLocation.lat}-${currentLocation.lng}`}
              currentLocation={currentLocation}
              temkin={temkin}
              asrMethod={asrMethod}
              selectedDate={selectedDate}
              onSelectDate={(newDate) => {
                setSelectedDate(newDate);
                selectTakvimTab('daily');
              }}
            />
          </div>
        )}

        {activeTab === 'qibla' && (
          <div className="animate-fadeIn space-y-6">
            <QiblaCompass 
              key={`qibla-${currentLocation.lat}-${currentLocation.lng}`}
              currentLocation={currentLocation} 
              todayData={todayData}
              onUpdateLocation={handleSelectCity}
            />
          </div>
        )}

        {activeTab === 'mosques' && (
          <div className="animate-fadeIn space-y-6">
            <NearbyMosques
              currentLocation={currentLocation}
              onUpdateLocation={handleSelectCity}
            />
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="animate-fadeIn space-y-6">
            <SpecialGoalsAndCountdown systemNow={systemNow} />
          </div>
        )}

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
}
