import React from 'react';
import { Coordinates, CalculatedDay } from '../types/prayer';
import { Compass, Calendar as CalendarIcon, Clock, MapPinned, Target, Globe, Landmark, Link2, Check, Volume2, VolumeX } from 'lucide-react';
import { makeTakvimHash } from '../utils/takvimDeepLinks';
import {
  SpecialGoalItem,
  loadSpecialGoalsFromStorage,
  getNearestSpecialGoal,
  calculateGoalCountdown,
  SPECIAL_GOALS_UPDATED_EVENT
} from './takvim/utils/specialGoalsStorage';

export type TakvimSubTab = 'daily' | 'monthly' | 'qibla' | 'mosques' | 'goals';

interface HeaderProps {
  currentLocation: Coordinates;
  todayData: CalculatedDay;
  activeTab: TakvimSubTab;
  onTabChange: (tab: TakvimSubTab) => void;
  onOpenSettings?: () => void;
  systemNow?: Date;
  onOpenWorldClock?: () => void;
  onOpenOsmanli?: () => void;
  adhanSound?: {
    enabled: boolean;
    changeEnabled: (next: boolean) => void;
    playing: boolean;
    testSound: () => void;
    status: string;
  };
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  todayData,
  activeTab,
  onTabChange,
  systemNow,
  onOpenWorldClock,
  onOpenOsmanli,
  adhanSound
}) => {
  const [internalNow, setInternalNow] = React.useState<Date>(() => systemNow || new Date());
  const [copiedTabLink, setCopiedTabLink] = React.useState(false);
  const [isAdhanMenuOpen, setIsAdhanMenuOpen] = React.useState(false);
  const adhanControlRef = React.useRef<HTMLDivElement | null>(null);
  const adhanButtonRef = React.useRef<HTMLButtonElement | null>(null);
  React.useEffect(() => {
    if (!isAdhanMenuOpen) return;
    const onOutside = (event: PointerEvent) => {
      if (!adhanControlRef.current?.contains(event.target as Node)) {
        setIsAdhanMenuOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsAdhanMenuOpen(false);
        adhanButtonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', onOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [isAdhanMenuOpen]);
  const copyTabLink = async () => {
    const link = `${window.location.origin}${window.location.pathname}${makeTakvimHash(activeTab)}`;
    try { await navigator.clipboard.writeText(link); setCopiedTabLink(true); window.setTimeout(() => setCopiedTabLink(false), 1800); }
    catch { window.prompt('Bağlantıyı kopyalayın:', link); }
  };
  const now = systemNow || internalNow;

  const liveTime = React.useMemo(() => {
    return now.toLocaleTimeString('tr-TR', {
      ...(currentLocation.timezoneId ? { timeZone: currentLocation.timezoneId } : {}),
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, [now, currentLocation.timezoneId]);

  // Özel Hedefler (Yerel Hafıza & 5 Gün Otomatik Temizleme Senkronizasyonu)
  const [goals, setGoals] = React.useState<SpecialGoalItem[]>(() =>
    loadSpecialGoalsFromStorage((systemNow || new Date()).getTime())
  );

  React.useEffect(() => {
    const syncGoals = () => {
      setGoals(loadSpecialGoalsFromStorage(Date.now()));
    };
    syncGoals();
    const cleanupTimer = setInterval(syncGoals, 15000);
    window.addEventListener(SPECIAL_GOALS_UPDATED_EVENT, syncGoals);
    window.addEventListener('storage', syncGoals);
    return () => {
      clearInterval(cleanupTimer);
      window.removeEventListener(SPECIAL_GOALS_UPDATED_EVENT, syncGoals);
      window.removeEventListener('storage', syncGoals);
    };
  }, []);

  const nearestGoal = React.useMemo(
    () => getNearestSpecialGoal(goals, now.getTime()),
    [goals, now]
  );

  const nearestCountdown = React.useMemo(() => {
    if (!nearestGoal) return null;
    return calculateGoalCountdown(nearestGoal, now);
  }, [nearestGoal, now]);

  const activeGoalsCount = React.useMemo(
    () => goals.filter((g) => g.targetTimestamp > now.getTime()).length,
    [goals, now]
  );

  // Akıllı Scroll Yönetimi: Aşağı kaydırırken gizle, yukarı kaydırırken aç
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Açık ezan ayarını kaydırma sırasında gizleme.
      if (isAdhanMenuOpen || currentScrollY < 40) {
        setIsVisible(true);
      } 
      // Aşağı doğru kaydırıyorsa ve en az 10px fark varsa gizle
      else if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 8) {
        setIsVisible(false);
      } 
      // Yukarı doğru kaydırıyorsa ve en az 8px fark varsa göster
      else if (currentScrollY < lastScrollY && lastScrollY - currentScrollY > 8) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isAdhanMenuOpen]);

  React.useEffect(() => {
    if (systemNow) return;
    const timer = setInterval(() => {
      setInternalNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [systemNow]);

  return (
    <header 
      className={`sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-16 sm:h-20">  

          {/* Logo & Başlık */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 flex items-center justify-center text-amber-300 shadow-sm border border-emerald-600/30 shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79.09-.39.43-.65.83-.65.48 0 .86.41.81.89-.09.84.07 1.7.5 2.45 1.13 1.95 3.32 3.01 5.56 2.61.4-.07.78.18.88.58.11.4-.13.82-.53.94-.41.13-.84.2-1.26.2zm4.78-4.23c-.34-.23-.42-.69-.2-1.03.88-1.35 1.14-3.02.72-4.63-.42-1.61-1.54-2.92-3.04-3.57-.4-.17-.59-.64-.42-1.04.17-.4.64-.59 1.04-.42 1.83.8 3.2 2.4 3.71 4.36.51 1.96.19 3.99-.88 5.63-.23.34-.69.43-1.03.2z" />
              </svg>
            </div>
            <div className="flex items-baseline gap-2 min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight truncate">
                Namaz Vakitleri Takvimi
              </h1>
              {adhanSound && (
                <div ref={adhanControlRef} className="relative shrink-0">
                  <button
                    ref={adhanButtonRef}
                    id="prayer-adhan-toggle"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded={isAdhanMenuOpen}
                    aria-controls="prayer-adhan-panel"
                    aria-label={`Vakit ezanı ses ayarları, ${adhanSound.enabled ? 'açık' : 'kapalı'}`}
                    title={`Vakit ezanı: ${adhanSound.enabled ? 'Açık' : 'Kapalı'} · Ayarlar`}
                    onClick={() => setIsAdhanMenuOpen(open => !open)}
                    className={`relative inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${adhanSound.enabled
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                  >
                    {adhanSound.enabled ? <Volume2 className="h-4 w-4 sm:h-[18px] sm:w-[18px]" /> : <VolumeX className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />}
                    <span
                      aria-hidden="true"
                      className={`absolute right-1 top-1 h-1.5 w-1.5 rounded-full ${adhanSound.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    />
                  </button>

                  {isAdhanMenuOpen && (
                    <div
                      id="prayer-adhan-panel"
                      role="dialog"
                      aria-label="Vakit ezanı ses kontrolü"
                      className="fixed left-4 right-4 top-16 sm:absolute sm:left-0 sm:right-auto sm:top-full sm:mt-2 sm:w-72 z-[70] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl text-slate-800"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold">Vakit ezanı</p>
                          <p className="text-[11px] text-slate-500 mt-1">Site açıkken kısa ezan çalsın.</p>
                        </div>
                        <button
                          id="prayer-adhan-switch"
                          type="button"
                          role="switch"
                          aria-checked={adhanSound.enabled}
                          aria-label="Vakit ezanını aç veya kapat"
                          onClick={() => adhanSound.changeEnabled(!adhanSound.enabled)}
                          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${adhanSound.enabled ? 'bg-emerald-700' : 'bg-slate-300'}`}
                        >
                          <span
                            aria-hidden="true"
                            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-all ${adhanSound.enabled ? 'left-7' : 'left-1'}`}
                          />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                        <span className={`text-xs font-semibold ${adhanSound.enabled ? 'text-emerald-800' : 'text-slate-500'}`}>
                          {adhanSound.enabled ? 'Ses açık' : 'Ses kapalı'}
                        </span>
                        {adhanSound.enabled && (
                          <button
                            type="button"
                            onClick={adhanSound.testSound}
                            className="min-h-9 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                          >
                            {adhanSound.playing ? 'Sesi durdur' : 'Sesi dene'}
                          </button>
                        )}
                      </div>
                      {adhanSound.status && (
                        <p role="status" aria-live="polite" className="mt-2 text-[11px] text-slate-600">
                          {adhanSound.status}
                        </p>
                      )}
                      <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                        İlk açılışta kapalıdır. Bildirim göndermez; site kapanınca çalışmaz.
                      </p>
                    </div>
                  )}
                </div>
              )}
              <span className="hidden lg:inline-block text-[11px] font-semibold text-slate-500">
                · Hassas Temkinî Vakitler
              </span>
            </div>
          </div>

          {/* Orta-Sağ ve Sağ Kısım: En Yakın Özel Hedef Minimalist Widget + Canlı Saat Rozeti */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Sistem Saatinin Hemen Yanında (Orta Kısma Doğru) Minimalist En Yakın Hedef Geri Sayım Alanı */}
            {nearestGoal && nearestCountdown ? (
              <button
                type="button"
                onClick={() => onTabChange('goals')}
                title={`${nearestGoal.title}${nearestGoal.description ? ' — ' + nearestGoal.description : ''} (Özel Hedefler & Geri Sayım sayfasına gitmek için tıklayın)`}
                className="group flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-50/90 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300/80 transition-colors cursor-pointer text-left max-w-[200px] sm:max-w-[320px] md:max-w-[380px]"
              >
                <Target className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <div className="flex items-center gap-1.5 min-w-0 text-xs">
                  <span className="font-bold text-slate-700 group-hover:text-emerald-950 truncate max-w-[75px] sm:max-w-[140px]">
                    {nearestGoal.title}
                  </span>
                  <span className="text-slate-300" aria-hidden="true">·</span>
                  {!nearestCountdown.isExpired ? (
                    <span className="font-mono font-extrabold text-emerald-800 tabular-nums whitespace-nowrap">
                      <span className="hidden sm:inline">
                        {nearestCountdown.days} Gün {String(nearestCountdown.hours).padStart(2, '0')} Saat {String(nearestCountdown.minutes).padStart(2, '0')} Dk
                      </span>
                      <span className="inline sm:hidden">
                        {nearestCountdown.days}g {String(nearestCountdown.hours).padStart(2, '0')}s {String(nearestCountdown.minutes).padStart(2, '0')}dk
                      </span>
                    </span>
                  ) : (
                    <span className="font-mono font-bold text-amber-700 tabular-nums whitespace-nowrap text-[11px]">
                      Süre Doldu ({nearestCountdown.autoDeleteRemainingDays}g saklanır)
                    </span>
                  )}
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onTabChange('goals')}
                title="Yeni bir özel hedef ve geri sayım ekleyin"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50/80 hover:bg-slate-100 border border-slate-200/70 text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <Target className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Özel Hedef Ekle</span>
              </button>
            )}

            {/* Canlı Saat Rozeti & Dünya Saatleri Hızlı Geçiş */}
            <button
              type="button"
              onClick={() => onOpenWorldClock?.()}
              title="Dünya Saatleri Modülünü Aç"
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 transition-colors cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-mono text-xs sm:text-sm font-extrabold text-slate-900 tabular-nums">
                {liveTime}
              </span>
            </button>
          </div>
        </div>

        {/* Navigasyon Sekmeleri (Mobil ve Masaüstü Uyumlu Yatay Kaydırılabilir Bar) */}
        <div className="flex items-center gap-1 min-w-0 border-t border-slate-100">
        <nav className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2 py-1.5 overflow-x-auto scrollbar-none">
          <button
            id="tab-daily"
            onClick={() => onTabChange('daily')}
            className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'daily'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:shadow-xs border border-transparent hover:border-slate-200/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Bugünkü Vakitler</span>
            <span className="inline sm:hidden">Bugün</span>
          </button>

          <button
            id="tab-monthly"
            onClick={() => onTabChange('monthly')}
            className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'monthly'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:shadow-xs border border-transparent hover:border-slate-200/60'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Aylık Vakit Takvimi</span>
            <span className="inline sm:hidden">Aylık Takvim</span>
          </button>

          <button
            id="tab-qibla"
            onClick={() => onTabChange('qibla')}
            className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'qibla'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:shadow-xs border border-transparent hover:border-slate-200/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Kıble Pusulası ({todayData.qiblaAngle}°)</span>
            <span className="inline sm:hidden">Kıble ({todayData.qiblaAngle}°)</span>
          </button>

          <button
            id="tab-mosques"
            onClick={() => onTabChange('mosques')}
            className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'mosques'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:shadow-xs border border-transparent hover:border-slate-200/60'
            }`}
          >
            <MapPinned className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Yakındaki Camiler</span>
          </button>

          {/* Yakındaki Camiler Butonunun Hemen Sağ Tarafında: Özel Hedefler & Geri Sayım */}
          <button
            id="tab-goals"
            onClick={() => onTabChange('goals')}
            className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'goals'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:shadow-xs border border-transparent hover:border-slate-200/60'
            }`}
          >
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Özel Hedefler & Geri Sayım</span>
            {activeGoalsCount > 0 && (
              <span
                className={`font-mono text-[11px] font-extrabold tabular-nums ${
                  activeTab === 'goals' ? 'text-emerald-200' : 'text-emerald-700'
                }`}
              >
                ({activeGoalsCount})
              </span>
            )}
          </button>

          {onOpenWorldClock && (
            <button
              id="tab-worldclock-link"
              type="button"
              onClick={onOpenWorldClock}
              className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 bg-white text-slate-500 hover:text-emerald-800 hover:bg-emerald-50/70 hover:shadow-xs border border-transparent hover:border-emerald-200/60"
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 shrink-0" />
              <span>Dünya Saatleri</span>
            </button>
          )}

          {onOpenOsmanli && (
            <button
              id="tab-osmanli-link"
              type="button"
              onClick={onOpenOsmanli}
              className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 bg-white text-stone-600 hover:text-[#4a3b19] hover:bg-[#fbf8f1] hover:shadow-xs border border-transparent hover:border-[#d4af37]/60"
              title="Osmanlı Saati & Muvakkithâne Modülünü Aç"
            >
              <Landmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8c6b1c] shrink-0" />
              <span>Osmanlı Saati</span>
            </button>
          )}
        </nav>
        <button type="button" onClick={copyTabLink} aria-label="Açık takvim bölümünün bağlantısını kopyala" title="Bu bölümün bağlantısını kopyala" className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100">
          {copiedTabLink ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{copiedTabLink ? 'Kopyalandı' : 'Bağlantı'}</span>
        </button>
        </div>
      </div>
    </header>
  );
};
