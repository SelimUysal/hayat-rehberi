import React, { useState, useEffect } from 'react';
import { CalculatedDay, PrayerTimes, AsrMethod } from '../types/prayer';
import { 
  CloudMoon, Sunrise, Sun, SunDim, SunMedium, CloudSun, Sunset, Moon, Star, Users,
  UsersRound, HelpCircle, BookOpen
} from 'lucide-react';
import { timeStrToMinutes } from '../utils/astronomy';
import { zoneNowDate } from '../utils/locationTimezone';
import { BayramPrayerModal } from './BayramPrayerModal';


interface PrayerCardsProps {
  todayData: CalculatedDay;
  asrMethod: AsrMethod;
  isSelectedToday?: boolean;
  timezoneId?: string;
}

interface CardItem {
  id: string;
  name: string;
  key: keyof PrayerTimes;
  time: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  bgLight: string;
  borderColor: string;
  badge?: string;
  extraInfo?: string; // Ek açıklama (örn: Cami cemaat vakti)
  isFiveDaily?: boolean; // 5 vakit namaza dahil mi
  isBayramCard?: boolean; // Bayram namazı kartı mı
}

export const PrayerCards: React.FC<PrayerCardsProps> = ({ todayData, asrMethod, isSelectedToday = true, timezoneId }) => {
  const [viewMode, setViewMode] = useState<'all' | 'five'>('all');
  const [isBayramModalOpen, setIsBayramModalOpen] = useState(false);
  
  // Anlık canlı zamanlayıcı (Saniye bazında anlık değişim ve senkronizasyon sağlar)
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const update = () => setNow(new Date());
    const timer = window.setInterval(update, 15_000);
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  const locationNow = timezoneId ? zoneNowDate(timezoneId) : now;
  const currentMinutes = locationNow.getHours() * 60 + locationNow.getMinutes() + locationNow.getSeconds() / 60;

  // Tüm Vakitler Listesi (Her vakit için özel ve birbirinden farklı uygun ikonlar)
  const allCards: CardItem[] = [
    {
      id: 'imsak',
      name: 'İmsak',
      key: 'imsak',
      time: todayData.times.imsak,
      subtitle: 'Oruç Başlangıcı / Sahur Bitişi',
      icon: <CloudMoon className="w-5 h-5 text-indigo-700" />,
      accentColor: 'text-indigo-900',
      bgLight: 'bg-indigo-50/70 hover:bg-indigo-100/60',
      borderColor: 'border-indigo-200',
      isFiveDaily: false
    },
    {
      id: 'sabah',
      name: 'Sabah Namazı',
      key: 'sabah',
      time: todayData.times.sabah,
      subtitle: 'Sabah Vakti Girişi (İsfar)',
      badge: 'Sabah Vakti',
      extraInfo: `Cami Cemaati: ${todayData.times.camiSabah}`,
      icon: <Sunrise className="w-5 h-5 text-emerald-700" />,
      accentColor: 'text-emerald-950',
      bgLight: 'bg-emerald-50/80 hover:bg-emerald-100/70',
      borderColor: 'border-emerald-300',
      isFiveDaily: true
    },
    {
      id: 'gunes',
      name: 'Güneş',
      key: 'gunes',
      time: todayData.times.gunes,
      subtitle: 'Güneş Doğuşu / Sabah Sonu',
      badge: 'Kerahat Vakti',
      icon: <Sun className="w-5 h-5 text-amber-500" />,
      accentColor: 'text-amber-900',
      bgLight: 'bg-amber-50/70 hover:bg-amber-100/60',
      borderColor: 'border-amber-200',
      isFiveDaily: false
    },
    // Sadece Ramazan ve Kurban Bayramı günlerine özel Bayram Namazı Kartı
    ...(todayData.times.bayramNamaz ? [{
      id: 'bayram-namazi',
      name: todayData.times.bayramName || 'Bayram Namazı',
      key: 'bayramNamaz' as keyof PrayerTimes,
      time: todayData.times.bayramNamaz,
      subtitle: 'Güneş Doğuşundan 45 Dk Sonra',
      badge: 'Bayrama Özel Vakit',
      extraInfo: 'Nasıl Kılınır? Tıklayınız',
      icon: <UsersRound className="w-5 h-5 text-amber-600" />,
      accentColor: 'text-amber-950',
      bgLight: 'bg-gradient-to-br from-amber-50 via-emerald-50/40 to-amber-100/60 hover:from-amber-100/70 hover:to-emerald-100/70',
      borderColor: 'border-amber-400 ring-2 ring-amber-300/60 shadow-sm',
      isFiveDaily: true, // Bayram günü bayram namazı her iki modda da görünsün
      isBayramCard: true
    }] : []),
    {
      id: 'israk',
      name: 'İşrak (Kuşluk)',
      key: 'israk',
      time: todayData.times.israk,
      subtitle: 'Kuşluk (Duhâ) Namazı Başlangıcı',
      badge: 'Kerahat Çıkışı',
      icon: <SunDim className="w-5 h-5 text-teal-700" />,
      accentColor: 'text-teal-900',
      bgLight: 'bg-teal-50/70 hover:bg-teal-100/60',
      borderColor: 'border-teal-200',
      isFiveDaily: false
    },
    {
      id: 'ogle',
      name: 'Öğle',
      key: 'ogle',
      time: todayData.times.ogle,
      subtitle: 'Öğle Namazı Vakti',
      icon: <SunMedium className="w-5 h-5 text-amber-600" />,
      accentColor: 'text-amber-900',
      bgLight: 'bg-amber-50/70 hover:bg-amber-100/60',
      borderColor: 'border-amber-200',
      isFiveDaily: true
    },
    {
      id: 'ikindi',
      name: 'İkindi',
      key: 'ikindi',
      time: todayData.times.ikindi,
      subtitle: 'İkindi Namazı Vakti',
      icon: <CloudSun className="w-5 h-5 text-orange-600" />,
      accentColor: 'text-orange-900',
      bgLight: 'bg-orange-50/70 hover:bg-orange-100/60',
      borderColor: 'border-orange-200',
      isFiveDaily: true
    },
    {
      id: 'aksam',
      name: 'Akşam',
      key: 'aksam',
      time: todayData.times.aksam,
      subtitle: 'Akşam Namazı & İftar',
      badge: 'İftar Vakti',
      icon: <Sunset className="w-5 h-5 text-rose-600" />,
      accentColor: 'text-rose-900',
      bgLight: 'bg-rose-50/70 hover:bg-rose-100/60',
      borderColor: 'border-rose-200',
      isFiveDaily: true
    },
    {
      id: 'yatsi',
      name: 'Yatsı',
      key: 'yatsi',
      time: todayData.times.yatsi,
      subtitle: `Son Vakti: Teheccüd (${todayData.times.geceyarisi})`,
      badge: 'Yatsı Vakti',
      icon: <Moon className="w-5 h-5 text-slate-700" />,
      accentColor: 'text-slate-900',
      bgLight: 'bg-slate-50/70 hover:bg-slate-100/60',
      borderColor: 'border-slate-200',
      isFiveDaily: true
    },
    {
      id: 'teheccud',
      name: 'Teheccüd',
      key: 'geceyarisi',
      time: todayData.times.geceyarisi,
      subtitle: 'Gece İbadeti (Yatsı Sonu)',
      badge: 'Nafile Namaz',
      icon: <Star className="w-5 h-5 text-purple-700 fill-purple-100" />,
      accentColor: 'text-purple-900',
      bgLight: 'bg-purple-50/70 hover:bg-purple-100/60',
      borderColor: 'border-purple-200',
      isFiveDaily: false
    }
  ];

  const displayedCards = viewMode === 'five'
    ? allCards.filter(c => c.isFiveDaily)
    : allCards;

  // Aktif vaktin hangisi olduğunu anlık ve kesintisiz belirleme
  const imsakMin = timeStrToMinutes(todayData.times.imsak);
  const sabahMin = timeStrToMinutes(todayData.times.sabah);
  const gunesMin = timeStrToMinutes(todayData.times.gunes);
  const bayramMin = todayData.times.bayramNamaz ? timeStrToMinutes(todayData.times.bayramNamaz) : 0;
  const israkMin = timeStrToMinutes(todayData.times.israk);
  const ogleMin = timeStrToMinutes(todayData.times.ogle);
  const ikindiMin = timeStrToMinutes(todayData.times.ikindi);
  const aksamMin = timeStrToMinutes(todayData.times.aksam);
  const yatsiMin = timeStrToMinutes(todayData.times.yatsi);
  const teheccudMin = timeStrToMinutes(todayData.times.geceyarisi);

  const getIsActive = (id: string): boolean => {
    // Farklı bir gün seçiliyse şu anki vakit yeşili yanmaz
    if (!isSelectedToday) return false;

    if (viewMode === 'five') {
      // 5 Vakit Namaz Modu: Yatsı vaktinin sonu fıkhi kurala göre Teheccüd vaktine kadardır
      if (id === 'sabah' && currentMinutes >= sabahMin && currentMinutes < ogleMin) return true;
      if (id === 'bayram-namazi' && bayramMin > 0 && currentMinutes >= bayramMin && currentMinutes < ogleMin) return true;
      if (id === 'ogle' && currentMinutes >= ogleMin && currentMinutes < ikindiMin) return true;
      if (id === 'ikindi' && currentMinutes >= ikindiMin && currentMinutes < aksamMin) return true;
      if (id === 'aksam' && currentMinutes >= aksamMin && currentMinutes < yatsiMin) return true;
      if (id === 'yatsi' && (currentMinutes >= yatsiMin || currentMinutes < teheccudMin)) return true;
      return false;
    }

    // Tüm Vakitler Modu (İmsak, Sabah, Güneş, Bayram, İşrak, Öğle, İkindi, Akşam, Yatsı, Teheccüd)
    if (id === 'imsak' && currentMinutes >= imsakMin && currentMinutes < sabahMin) return true;
    if (id === 'sabah' && currentMinutes >= sabahMin && currentMinutes < gunesMin) return true;
    if (id === 'gunes' && currentMinutes >= gunesMin && currentMinutes < (bayramMin > 0 ? bayramMin : israkMin)) return true;
    if (id === 'bayram-namazi' && bayramMin > 0 && currentMinutes >= bayramMin && currentMinutes < israkMin) return true;
    if (id === 'israk' && currentMinutes >= israkMin && currentMinutes < ogleMin) return true;
    if (id === 'ogle' && currentMinutes >= ogleMin && currentMinutes < ikindiMin) return true;
    if (id === 'ikindi' && currentMinutes >= ikindiMin && currentMinutes < aksamMin) return true;
    if (id === 'aksam' && currentMinutes >= aksamMin && currentMinutes < yatsiMin) return true;
    // Yatsı vaktinin sonu Teheccüde kadardır (Teheccüd'den sonra İmsak'a kadar Yatsı bitmiştir)
    if (id === 'yatsi' && (currentMinutes >= yatsiMin || currentMinutes < teheccudMin)) return true;
    // Teheccüd vakti: Teheccüd başlangıcından İmsak'a kadar
    if (id === 'teheccud' && currentMinutes >= teheccudMin && currentMinutes < imsakMin) return true;
    return false;
  };

  return (
    <div className="space-y-4">
      {/* Kartlar Başlığı & Görünüm Seçici (Tüm Vakitler vs 5 Vakit Namaz) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>Günün Namaz Saatleri</span>
            <span className="text-xs font-bold text-slate-600">
              ({displayedCards.length} Vakit Gösteriliyor)
            </span>
          </h2>
        </div>

        {/* Kullanıcının mod seçicisi: 5 Vakit mi, Tüm Vakitler mi? */}
        <div role="group" aria-label="Vakit kartı görünümü" className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto text-xs font-bold">
          <button
            type="button" aria-pressed={viewMode === 'all'}
            onClick={() => setViewMode('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'all'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tüm Vakitler (İmsak, Sabah, Güneş, İşrak...)
          </button>
          <button
            type="button" aria-pressed={viewMode === 'five'}
            onClick={() => setViewMode('five')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'five'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sadece 5 Vakit Namaz
          </button>
        </div>
      </div>

      {/* Kartlar Grid'i */}
      <div className={`grid gap-3 sm:gap-4 ${
        viewMode === 'five'
          ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
          : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5'
      }`}>
        {displayedCards.map((card) => {
          const isActive = getIsActive(card.id);
          const isBayram = card.isBayramCard;
          return (
            <div
              key={card.id}
              onClick={isBayram ? () => setIsBayramModalOpen(true) : undefined}
              role={isBayram ? 'button' : undefined}
              tabIndex={isBayram ? 0 : undefined}
              aria-label={isBayram ? `${card.name} nasıl kılınır?` : undefined}
              onKeyDown={isBayram ? event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setIsBayramModalOpen(true);
                }
              } : undefined}
              className={`relative rounded-2xl p-4 sm:p-5 border transition-all duration-300 flex flex-col justify-between ${
                isBayram ? 'cursor-pointer hover:scale-[1.02] hover:shadow-md' : ''
              } ${
                isActive
                  ? 'bg-emerald-900 text-white border-emerald-700 shadow-md ring-2 ring-emerald-600/50'
                  : `${card.bgLight} ${card.borderColor} shadow-2xs`
              }`}
            >
              {isActive && (
                <span className="absolute -top-2.5 right-3 bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs tracking-wider">
                  Şu Anki Vakit
                </span>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-xs sm:text-sm font-bold tracking-tight ${isActive ? 'text-emerald-100' : 'text-slate-900'}`}>
                    {card.name}
                  </span>
                  <div className={`p-1.5 rounded-xl ${isActive ? 'bg-emerald-800/80 text-amber-300' : isBayram ? 'bg-amber-100 text-amber-900 shadow-xs' : 'bg-white shadow-2xs'}`}>
                    {card.icon}
                  </div>
                </div>

                <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight my-1 ${
                  isActive ? 'text-amber-300' : card.accentColor
                }`}>
                  {card.time}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex flex-col gap-1">
                <span className={`text-[11px] font-bold line-clamp-1 ${isActive ? 'text-emerald-200' : 'text-slate-700'}`}>
                  {card.subtitle}
                </span>
                
                {/* Türkiye Camileri Sabah Namazı Veya Bayram Namazı Nasıl Kılınır Butonu */}
                {card.extraInfo && (
                  <div className={`mt-0.5 px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 transition-colors ${
                    isBayram
                      ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xs ring-1 ring-amber-300'
                      : isActive 
                      ? 'bg-amber-400 text-slate-950 shadow-xs' 
                      : 'bg-emerald-100/90 text-emerald-950 border border-emerald-300'
                  }`}>
                    {isBayram ? <BookOpen className="w-3.5 h-3.5 shrink-0" /> : <Users className="w-3.5 h-3.5 shrink-0" />}
                    <span>{card.extraInfo}</span>
                  </div>
                )}

                {card.badge && !card.extraInfo && (
                  <span className={`text-[10px] font-bold ${isActive ? 'text-emerald-300/90' : 'text-slate-500'}`}>
                    {card.badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bayram Namazı Kılınış Rehberi Modalı */}
      {todayData.times.bayramNamaz && (
        <BayramPrayerModal
          isOpen={isBayramModalOpen}
          onClose={() => setIsBayramModalOpen(false)}
          bayramName={todayData.times.bayramName}
          bayramTime={todayData.times.bayramNamaz}
        />
      )}
    </div>
  );
};
